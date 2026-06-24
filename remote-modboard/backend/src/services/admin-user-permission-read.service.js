'use strict';

const { validateSessionReadOnly } = require('./auth-session-read.service');
const { readPermissionContextReadOnly } = require('./auth-permission-read.service');
const { buildDatabaseReadiness, publicDbError } = require('./db.service');

async function buildAdminUserPermissionDiagnostic({ context, req }) {
  const sessionValidation = await validateSessionReadOnly({ config: context.config, req });
  const readiness = buildDatabaseReadiness(context.config);

  const base = {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_admin_user_permission_read',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap_admin_users5.v1',
    readOnly: true,
    writeEnabled: false,
    databaseWriteEnabled: false,
    migrationEnabled: false,
    productiveWritesEnabled: false,
    adminWriteRoutesEnabled: false,
    userRoleWritesEnabled: false,
    userGroupWritesEnabled: false,
    sessionRevocationWritesEnabled: false,
    agentActionsEnabled: false,
    authEnabled: Boolean(context.config && context.config.auth && context.config.auth.authEnabled),
    loginEnabled: Boolean(context.config && context.config.auth && context.config.auth.loginEnabled),
    database: {
      configured: readiness.configured,
      driverAvailable: readiness.driverAvailable,
      writeEnabled: false,
      migrationEnabled: false
    },
    session: buildPublicSessionState(sessionValidation),
    actor: null,
    permissions: {
      canReadAdminUsers: false,
      canWriteAdminUsers: false,
      effectiveCanReadAdminUsersWouldAllow: false,
      effectiveCanWriteAdminUsersWouldAllow: false,
      readReason: null,
      writeReason: null
    },
    limits: {
      readOnlyDiagnostic: true,
      productiveWritesEnabled: false,
      confirmWriteRequiredForFutureWrites: true,
      auditRequiredForFutureWrites: true,
      lockingRequiredForFutureWrites: true,
      backupRequiredBeforeFutureWrites: true
    },
    safety: context.safety,
    notes: [
      'RDAP_ADMIN_USERS5 ist eine reine Permission-Read-Diagnose.',
      'Dieser Endpunkt fuehrt keine User-/Rollen-/Gruppen-/Session-Writes aus.',
      'canWriteAdminUsers bleibt in diesem Step immer false, auch wenn Rollen/Permissions spaeter einen Write erlauben wuerden.',
      'Produktive Admin-Writes brauchen spaeter eigenen Scope mit Permission, Confirm-Write, Audit, Locking, Backup/Rollback und separatem Go.'
    ]
  };

  if (!sessionValidation.valid || !sessionValidation.userUid) {
    return {
      status: 401,
      body: {
        ...base,
        ok: false,
        loggedIn: false,
        dashboardAccess: false,
        reason: 'not_logged_in_or_session_invalid'
      }
    };
  }

  if (!readiness.configured || !readiness.driverAvailable) {
    return {
      status: 503,
      body: {
        ...base,
        ok: false,
        loggedIn: true,
        dashboardAccess: false,
        reason: readiness.error || 'db_not_ready',
        error: readiness.error || 'db_not_ready'
      }
    };
  }

  try {
    const readContext = await readPermissionContextReadOnly({
      config: context.config,
      userUid: sessionValidation.userUid,
      permissionKey: 'remote.admin.users.read',
      targetType: 'global',
      targetKey: '*'
    });

    const writeContext = await readPermissionContextReadOnly({
      config: context.config,
      userUid: sessionValidation.userUid,
      permissionKey: 'remote.admin.users.write',
      targetType: 'global',
      targetKey: '*'
    });

    const dashboardAccess = buildDashboardAccess(context.config, readContext.user, sessionValidation);
    const dbRoles = Array.isArray(readContext.roles) ? readContext.roles : [];
    const accessRoles = Array.isArray(dashboardAccess.roles) ? dashboardAccess.roles : [];
    const roles = unique([...dbRoles, ...accessRoles]);
    const groups = Array.isArray(readContext.groups) ? readContext.groups : [];
    const normalizedGroups = groups.map((group) => group.groupKey || group.group_key || group).filter(Boolean);

    const isOwner = hasRole(roles, 'owner');
    const isAdmin = isOwner || hasRole(roles, 'admin');
    const isSoundProfi = normalizedGroups.some((groupKey) => String(groupKey).toLowerCase() === 'sound_profi');
    const effectiveReadAllowed = Boolean(readContext.evaluation && readContext.evaluation.allowed);
    const effectiveWriteWouldAllow = Boolean(writeContext.evaluation && writeContext.evaluation.allowed);
    const canReadAdminUsers = Boolean(dashboardAccess.allowed && (isOwner || isAdmin || effectiveReadAllowed));

    if (!dashboardAccess.allowed) {
      return {
        status: 403,
        body: {
          ...base,
          loggedIn: true,
          dashboardAccess: false,
          accessReason: dashboardAccess.reason,
          reason: 'dashboard_access_denied',
          actor: buildActor({ readContext, roles, groups, isOwner, isAdmin, isSoundProfi }),
          permissions: {
            canReadAdminUsers: false,
            canWriteAdminUsers: false,
            effectiveCanReadAdminUsersWouldAllow: effectiveReadAllowed,
            effectiveCanWriteAdminUsersWouldAllow: effectiveWriteWouldAllow,
            readReason: readContext.evaluation ? readContext.evaluation.reason : null,
            writeReason: writeContext.evaluation ? writeContext.evaluation.reason : null
          }
        }
      };
    }

    return {
      status: 200,
      body: {
        ...base,
        loggedIn: true,
        dashboardAccess: true,
        accessReason: dashboardAccess.reason,
        reason: 'read_only_permission_diagnostic_ready',
        actor: buildActor({ readContext, roles, groups, isOwner, isAdmin, isSoundProfi }),
        permissions: {
          canReadAdminUsers,
          canWriteAdminUsers: false,
          effectiveCanReadAdminUsersWouldAllow: effectiveReadAllowed || isOwner || isAdmin,
          effectiveCanWriteAdminUsersWouldAllow: effectiveWriteWouldAllow || isOwner,
          readReason: readContext.evaluation ? readContext.evaluation.reason : null,
          writeReason: writeContext.evaluation ? writeContext.evaluation.reason : null
        },
        diagnostics: {
          requestedPermissions: [
            'remote.admin.users.read',
            'remote.admin.users.write'
          ],
          readPermissionRows: summarizePermissionRows(readContext),
          writePermissionRows: summarizePermissionRows(writeContext),
          soundProfiIsGroupMarker: isSoundProfi,
          soundProfiIsSystemRole: hasRole(roles, 'sound_profi'),
          productiveWriteBlockedByStepScope: true
        }
      }
    };
  } catch (err) {
    const publicError = publicDbError(err).code;
    return {
      status: 500,
      body: {
        ...base,
        ok: false,
        loggedIn: true,
        dashboardAccess: false,
        reason: publicError || 'admin_user_permission_diagnostic_failed',
        error: publicError || 'admin_user_permission_diagnostic_failed'
      }
    };
  }
}

function buildActor({ readContext, roles, groups, isOwner, isAdmin, isSoundProfi }) {
  const user = readContext && readContext.user ? readContext.user : null;
  return {
    userUid: user ? user.userUid : null,
    displayName: user ? user.displayName : null,
    loginName: user ? user.loginName : null,
    status: user ? user.status : null,
    roles,
    groups,
    isOwner,
    isAdmin,
    isSoundProfi,
    canUseAdminUsersReadDiagnostic: Boolean(isOwner || isAdmin)
  };
}

function buildDashboardAccess(config, user, sessionValidation) {
  if (!sessionValidation.valid || !user || !user.exists) {
    return { allowed: false, reason: 'not_logged_in', roles: [] };
  }

  const login = String(user.loginName || '').trim().toLowerCase();
  const display = String(user.displayName || '').trim().toLowerCase();
  const userUid = String(user.userUid || '').trim().toLowerCase();
  const access = config.dashboardAccess || {};
  const allowedLogins = Array.isArray(access.allowedLogins) ? access.allowedLogins : [];
  const allowedUserUids = Array.isArray(access.allowedUserUids) ? access.allowedUserUids : [];

  if (allowedUserUids.includes(userUid)) {
    return { allowed: true, reason: 'allowed_user_uid', roles: [access.defaultRole || 'owner'] };
  }

  if (allowedLogins.includes(login) || allowedLogins.includes(display)) {
    return { allowed: true, reason: 'allowed_login', roles: [access.defaultRole || 'owner'] };
  }

  return { allowed: false, reason: 'not_allowed', roles: [] };
}

function summarizePermissionRows(contextResult) {
  return {
    rolePermissions: Array.isArray(contextResult.rolePermissions) ? contextResult.rolePermissions.length : 0,
    modulePermissions: Array.isArray(contextResult.modulePermissions) ? contextResult.modulePermissions.length : 0,
    evaluationReason: contextResult.evaluation ? contextResult.evaluation.reason : null,
    evaluationEffect: contextResult.evaluation ? contextResult.evaluation.effect : null,
    matchedAllowCount: contextResult.evaluation ? contextResult.evaluation.matchedAllowCount : 0,
    matchedDenyCount: contextResult.evaluation ? contextResult.evaluation.matchedDenyCount : 0
  };
}

function buildPublicSessionState(sessionValidation) {
  return {
    checked: true,
    cookiePresent: sessionValidation.cookiePresent,
    cookieNameDetected: sessionValidation.cookieNameDetected,
    cookieValuePresent: sessionValidation.cookieValuePresent,
    cookieValueFingerprint: sessionValidation.cookieValueFingerprint,
    sessionLookupEnabled: sessionValidation.lookupEnabled,
    sessionLookupPerformed: sessionValidation.lookupPerformed,
    sessionExists: sessionValidation.exists,
    sessionValid: sessionValidation.valid,
    expiresAt: sessionValidation.expiresAt,
    userUid: sessionValidation.userUid,
    reason: sessionValidation.reason,
    createsSession: false,
    setsCookie: false,
    updatesLastSeen: false
  };
}

function hasRole(roles, key) {
  const normalized = String(key || '').toLowerCase();
  return Array.isArray(roles) && roles.some((role) => String(role || '').toLowerCase() === normalized);
}

function unique(values) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
}

module.exports = { buildAdminUserPermissionDiagnostic };
