'use strict';

const { validateSessionReadOnly } = require('./auth-session-read.service');
const { buildDatabaseReadiness, withReadOnlyConnection, publicDbError } = require('./db.service');
const {
  normalizePermissionKey,
  normalizeTargetValue,
  evaluatePermissionRows
} = require('../security/permissions');

async function buildPermissionCheckStatus({ context, req }) {
  const permissionKey = normalizePermissionKey(req && req.query ? req.query.permission : null);
  const targetType = normalizeTargetValue(readQueryValue(req, 'targetType') || readQueryValue(req, 'target_type'), 'global');
  const targetKey = normalizeTargetValue(readQueryValue(req, 'targetKey') || readQueryValue(req, 'target_key'), '*');
  const sessionValidation = await validateSessionReadOnly({ config: context.config, req });
  const readiness = buildDatabaseReadiness(context.config);

  const base = {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_auth_permission_read',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap8a.v1',
    readOnly: true,
    writeEnabled: false,
    migrationEnabled: false,
    authEnabled: false,
    loginEnabled: false,
    loggedIn: false,
    allowed: false,
    permission: {
      requested: permissionKey,
      targetType,
      targetKey
    },
    session: buildPublicSessionState(sessionValidation),
    database: {
      configured: readiness.configured,
      driverAvailable: readiness.driverAvailable,
      writeEnabled: false,
      migrationEnabled: false
    },
    safety: context.safety,
    diagnostics: {
      contextLookupEnabled: false,
      contextLookupPerformed: false,
      permissionEvaluationPerformed: false,
      effectivePermissionWouldAllow: false,
      effectivePermissionReason: null,
      roles: [],
      groups: [],
      permissionRows: {
        rolePermissions: 0,
        modulePermissions: 0
      }
    },
    notes: [
      'RDAP8A ist read-only. Dieser Endpunkt aktiviert keinen Login und erlaubt keine produktive Aktion.',
      'allowed bleibt false, solange authEnabled/loginEnabled false sind.',
      'Der Permission-Kontext dient nur Diagnose/Vorbereitung fuer spaetere serverseitige Middleware.'
    ]
  };

  if (!permissionKey) {
    return {
      ...base,
      reason: 'missing_or_invalid_permission'
    };
  }

  if (!sessionValidation.valid || !sessionValidation.userUid) {
    return {
      ...base,
      reason: 'auth_disabled_or_not_logged_in'
    };
  }

  if (!readiness.configured || !readiness.driverAvailable) {
    return {
      ...base,
      reason: readiness.error || 'db_not_ready',
      error: readiness.error || 'db_not_ready'
    };
  }

  try {
    const contextResult = await readPermissionContextReadOnly({
      config: context.config,
      userUid: sessionValidation.userUid,
      permissionKey,
      targetType,
      targetKey
    });

    return {
      ...base,
      reason: 'auth_disabled_readonly_permission_denied',
      user: contextResult.user,
      diagnostics: {
        contextLookupEnabled: true,
        contextLookupPerformed: true,
        permissionEvaluationPerformed: true,
        effectivePermissionWouldAllow: contextResult.evaluation.allowed,
        effectivePermissionReason: contextResult.evaluation.reason,
        effectivePermissionEffect: contextResult.evaluation.effect,
        matchedAllowCount: contextResult.evaluation.matchedAllowCount,
        matchedDenyCount: contextResult.evaluation.matchedDenyCount,
        roles: contextResult.roles,
        groups: contextResult.groups,
        permissionRows: {
          rolePermissions: contextResult.rolePermissions.length,
          modulePermissions: contextResult.modulePermissions.length
        }
      }
    };
  } catch (err) {
    const publicError = publicDbError(err).code;
    return {
      ...base,
      reason: publicError || 'permission_context_read_failed',
      error: publicError || 'permission_context_read_failed'
    };
  }
}

async function readPermissionContextReadOnly({ config, userUid, permissionKey, targetType, targetKey }) {
  return await withReadOnlyConnection(config, async (connection) => {
    const user = await readUser(connection, userUid);
    const roles = await readUserRoles(connection, userUid);
    const groups = await readUserGroups(connection, userUid);
    const grantGroups = groups.filter((group) => group.grantsPermissionsByItself);
    const rolePermissions = await readRolePermissions(connection, roles, permissionKey);
    const modulePermissions = await readModulePermissions(connection, {
      userUid,
      roles,
      groups: grantGroups.map((group) => group.groupKey),
      permissionKey
    });

    const evaluation = evaluatePermissionRows({
      rolePermissions,
      modulePermissions,
      permissionKey,
      targetType,
      targetKey
    });

    return {
      user,
      roles,
      groups,
      rolePermissions,
      modulePermissions,
      evaluation
    };
  });
}

async function readUser(connection, userUid) {
  const avatarSchema = await readAvatarSchema(connection);
  const selectProfileImage = avatarSchema.dashboardUsersProfileImageUrl
    ? ', profile_image_url'
    : '';

  const [rows] = await connection.query(`
    SELECT user_uid, display_name, login_name, status${selectProfileImage}
    FROM dashboard_users
    WHERE user_uid = ?
    LIMIT 1
  `, [userUid]);

  const row = rows && rows[0] ? rows[0] : null;
  if (!row) {
    return {
      userUid,
      displayName: null,
      loginName: null,
      profileImageUrl: null,
      avatarUrl: null,
      status: null,
      exists: false
    };
  }

  const profileImageUrl = avatarSchema.dashboardUsersProfileImageUrl ? (row.profile_image_url || null) : null;

  return {
    userUid: row.user_uid,
    displayName: row.display_name || null,
    loginName: row.login_name || null,
    profileImageUrl,
    avatarUrl: profileImageUrl,
    status: row.status || null,
    exists: true
  };
}

async function readUserRoles(connection, userUid) {
  const [rows] = await connection.query(`
    SELECT role_key
    FROM dashboard_user_roles
    WHERE user_uid = ?
      AND revoked_at IS NULL
    ORDER BY role_key ASC
  `, [userUid]);

  return rows
    .map((row) => row.role_key)
    .filter(Boolean);
}

async function readUserGroups(connection, userUid) {
  const [rows] = await connection.query(`
    SELECT
      ug.group_key,
      g.group_type,
      g.grants_permissions_by_itself
    FROM dashboard_user_groups ug
    LEFT JOIN dashboard_groups g ON g.group_key = ug.group_key
    WHERE ug.user_uid = ?
      AND ug.revoked_at IS NULL
    ORDER BY ug.group_key ASC
  `, [userUid]);

  return rows.map((row) => ({
    groupKey: row.group_key,
    groupType: row.group_type || null,
    grantsPermissionsByItself: Boolean(Number(row.grants_permissions_by_itself || 0))
  }));
}

async function readRolePermissions(connection, roles, permissionKey) {
  if (!Array.isArray(roles) || roles.length === 0) return [];

  const placeholders = roles.map(() => '?').join(', ');
  const [rows] = await connection.query(`
    SELECT role_key, permission_key, effect
    FROM dashboard_role_permissions
    WHERE role_key IN (${placeholders})
      AND permission_key = ?
    ORDER BY role_key ASC, permission_key ASC, effect ASC
  `, [...roles, permissionKey]);

  return rows;
}

async function readModulePermissions(connection, { userUid, roles, groups, permissionKey }) {
  const clauses = ['(subject_type = ? AND subject_key = ?)'];
  const params = ['user', userUid];

  if (Array.isArray(roles) && roles.length > 0) {
    clauses.push(`(subject_type = 'role' AND subject_key IN (${roles.map(() => '?').join(', ')}))`);
    params.push(...roles);
  }

  if (Array.isArray(groups) && groups.length > 0) {
    clauses.push(`(subject_type = 'group' AND subject_key IN (${groups.map(() => '?').join(', ')}))`);
    params.push(...groups);
  }

  params.push(permissionKey);

  const [rows] = await connection.query(`
    SELECT subject_type, subject_key, permission_key, target_type, target_key, effect
    FROM dashboard_module_permissions
    WHERE (${clauses.join(' OR ')})
      AND permission_key = ?
    ORDER BY subject_type ASC, subject_key ASC, target_type ASC, target_key ASC, effect ASC
    LIMIT 250
  `, params);

  return rows;
}

async function readAvatarSchema(connection) {
  try {
    const [rows] = await connection.query(`
      SELECT TABLE_NAME AS table_name, COLUMN_NAME AS column_name
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'dashboard_users'
        AND COLUMN_NAME = 'profile_image_url'
    `);

    const hasColumn = Array.isArray(rows) && rows.some((row) => row.table_name === 'dashboard_users' && row.column_name === 'profile_image_url');
    return {
      dashboardUsersProfileImageUrl: hasColumn
    };
  } catch (err) {
    return {
      dashboardUsersProfileImageUrl: false
    };
  }
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

function readQueryValue(req, key) {
  if (!req || !req.query) return null;
  const value = req.query[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

module.exports = {
  buildPermissionCheckStatus,
  readPermissionContextReadOnly
};
