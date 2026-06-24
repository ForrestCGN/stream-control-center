'use strict';

const { buildDatabaseReadiness, withReadOnlyConnection, publicDbError } = require('./db.service');

const EXPECTED_TABLES = Object.freeze([
  'schema_migrations',
  'dashboard_users',
  'dashboard_identities',
  'dashboard_roles',
  'dashboard_user_roles',
  'dashboard_groups',
  'dashboard_user_groups',
  'dashboard_permissions',
  'dashboard_role_permissions',
  'dashboard_module_permissions',
  'dashboard_sessions',
  'dashboard_locks',
  'dashboard_audit_log'
]);

async function readAuthDbModel(config) {
  const readiness = buildDatabaseReadiness(config);

  if (!readiness.configured || !readiness.driverAvailable) {
    return buildUnavailableResult(config, readiness, readiness.error || 'db_not_ready');
  }

  try {
    return await withReadOnlyConnection(config, async (connection) => {
      const existingTables = await readExistingTables(connection);
      const existingSet = new Set(existingTables);
      const missingTables = EXPECTED_TABLES.filter((tableName) => !existingSet.has(tableName));
      const schemaReady = missingTables.length === 0;

      const [
        migrations,
        users,
        userRoles,
        userGroups,
        roles,
        groups,
        permissions,
        rolePermissions,
        modulePermissions,
        sessions,
        counts
      ] = await Promise.all([
        readRowsIfTableExists(connection, existingSet, 'schema_migrations', `
          SELECT migration_key, version, status, applied_at, notes
          FROM schema_migrations
          WHERE migration_key LIKE 'rdap%'
          ORDER BY applied_at DESC, migration_key ASC
          LIMIT 50
        `),
        readRowsIfTableExists(connection, existingSet, 'dashboard_users', `
          SELECT
            u.user_uid,
            u.display_name,
            u.login_name,
            u.status,
            u.last_login_at,
            GROUP_CONCAT(DISTINCT ur.role_key ORDER BY ur.role_key ASC SEPARATOR ', ') AS roles,
            GROUP_CONCAT(DISTINCT ug.group_key ORDER BY ug.group_key ASC SEPARATOR ', ') AS groups
          FROM dashboard_users u
          LEFT JOIN dashboard_user_roles ur ON ur.user_uid = u.user_uid AND ur.revoked_at IS NULL
          LEFT JOIN dashboard_user_groups ug ON ug.user_uid = u.user_uid AND ug.revoked_at IS NULL
          GROUP BY u.user_uid, u.display_name, u.login_name, u.status, u.last_login_at
          ORDER BY u.last_login_at DESC, u.display_name ASC
          LIMIT 250
        `),
        readRowsIfTableExists(connection, existingSet, 'dashboard_user_roles', `
          SELECT user_uid, role_key, granted_by, granted_at, revoked_at
          FROM dashboard_user_roles
          ORDER BY granted_at DESC
          LIMIT 250
        `),
        readRowsIfTableExists(connection, existingSet, 'dashboard_user_groups', `
          SELECT user_uid, group_key, granted_by, granted_at, revoked_at
          FROM dashboard_user_groups
          ORDER BY granted_at DESC
          LIMIT 250
        `),
        readRowsIfTableExists(connection, existingSet, 'dashboard_roles', `
          SELECT role_key, label, description, is_system
          FROM dashboard_roles
          ORDER BY role_key ASC
        `),
        readRowsIfTableExists(connection, existingSet, 'dashboard_groups', `
          SELECT group_key, label, group_type, grants_permissions_by_itself, description, is_system
          FROM dashboard_groups
          ORDER BY group_key ASC
        `),
        readRowsIfTableExists(connection, existingSet, 'dashboard_permissions', `
          SELECT permission_key, label, area, protection_level, description
          FROM dashboard_permissions
          ORDER BY area ASC, permission_key ASC
        `),
        readRowsIfTableExists(connection, existingSet, 'dashboard_role_permissions', `
          SELECT role_key, permission_key, effect
          FROM dashboard_role_permissions
          ORDER BY role_key ASC, permission_key ASC, effect ASC
        `),
        readRowsIfTableExists(connection, existingSet, 'dashboard_module_permissions', `
          SELECT subject_type, subject_key, permission_key, target_type, target_key, effect
          FROM dashboard_module_permissions
          ORDER BY subject_type ASC, subject_key ASC, permission_key ASC, target_type ASC, target_key ASC
          LIMIT 250
        `),
        readRowsIfTableExists(connection, existingSet, 'dashboard_sessions', `
          SELECT user_uid, status, created_at, expires_at, revoked_at, last_seen_at
          FROM dashboard_sessions
          ORDER BY created_at DESC
          LIMIT 250
        `),
        readCounts(connection, existingSet)
      ]);

      return {
        ok: true,
        service: 'remote-modboard',
        module: 'remote_auth_db_read',
        statusApiVersion: 'rdap_admin_users1.v1',
        readOnly: true,
        writeEnabled: false,
        migrationEnabled: false,
        authEnabled: false,
        sessionCreationEnabled: false,
        generatedAt: new Date().toISOString(),
        database: {
          engine: config.database.engine,
          driver: config.database.driver,
          configured: true,
          reachable: true,
          nameConfigured: Boolean(config.database.name),
          userConfigured: Boolean(config.database.user),
          passwordConfigured: config.database.passwordConfigured,
          writeEnabled: false,
          migrationEnabled: false
        },
        schema: {
          expectedTables: EXPECTED_TABLES,
          existingTables,
          missingTables,
          ready: schemaReady
        },
        counts,
        model: {
          migrations: normalizeRows(migrations),
          users: normalizeRows(users),
          userRoles: normalizeRows(userRoles),
          userGroups: normalizeRows(userGroups),
          sessions: normalizeRows(sessions),
          roles: normalizeRows(roles),
          groups: normalizeRows(groups),
          permissions: normalizeRows(permissions),
          rolePermissions: normalizeRows(rolePermissions),
          modulePermissions: normalizeRows(modulePermissions)
        },
        validation: buildValidation({
          roles,
          groups,
          rolePermissions,
          modulePermissions,
          counts,
          schemaReady
        }),
        warnings: buildWarnings(schemaReady, missingTables)
      };
    });
  } catch (err) {
    return buildUnavailableResult(config, readiness, publicDbError(err).code);
  }
}

async function readExistingTables(connection) {
  const [rows] = await connection.query(`
    SELECT TABLE_NAME AS table_name
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN (?)
    ORDER BY TABLE_NAME ASC
  `, [EXPECTED_TABLES]);

  return rows.map((row) => row.table_name);
}

async function readRowsIfTableExists(connection, existingSet, tableName, sql) {
  if (!existingSet.has(tableName)) return [];
  const [rows] = await connection.query(sql);
  return rows;
}

async function readCounts(connection, existingSet) {
  const result = {};
  for (const tableName of EXPECTED_TABLES) {
    if (!existingSet.has(tableName)) {
      result[tableName] = null;
      continue;
    }

    const [rows] = await connection.query(`SELECT COUNT(*) AS row_count FROM ${tableName}`);
    result[tableName] = Number(rows[0] && rows[0].row_count ? rows[0].row_count : 0);
  }

  return result;
}

function buildValidation({ roles, groups, rolePermissions, modulePermissions, counts, schemaReady }) {
  const roleRows = Array.isArray(roles) ? roles : [];
  const groupRows = Array.isArray(groups) ? groups : [];
  const rolePermissionRows = Array.isArray(rolePermissions) ? rolePermissions : [];
  const modulePermissionRows = Array.isArray(modulePermissions) ? modulePermissions : [];
  const soundProfiRoleCount = roleRows.filter((row) => row.role_key === 'sound_profi').length;
  const soundProfiGroups = groupRows.filter((row) => row.group_key === 'sound_profi');
  const soundProfiGroup = soundProfiGroups[0] || null;
  const soundProfiRolePermissionCount = rolePermissionRows.filter((row) => row.role_key === 'sound_profi').length;

  return {
    schemaReady,
    rolesAreSeparateFromGroups: true,
    soundProfiIsRole: soundProfiRoleCount > 0,
    soundProfiRoleCount,
    soundProfiIsGroupMarker: Boolean(soundProfiGroup && soundProfiGroup.group_type === 'group_marker'),
    soundProfiGroupMarkerCount: soundProfiGroups.length,
    soundProfiGrantsPermissionsByItself: soundProfiGroup ? Boolean(Number(soundProfiGroup.grants_permissions_by_itself)) : null,
    soundProfiRolePermissionCount,
    modulePermissionRows: modulePermissionRows.length || (counts.dashboard_module_permissions || 0),
    sessionRows: counts.dashboard_sessions,
    lockRows: counts.dashboard_locks,
    auditRows: counts.dashboard_audit_log
  };
}

function buildWarnings(schemaReady, missingTables) {
  const warnings = [
    'RDAP_ADMIN_USERS1 ist read-only. Diese Route aktiviert keine Schreibaktionen.',
    'Frontend-Anzeigen sind keine Sicherheitsentscheidung. Rechte muessen serverseitig geprueft werden.'
  ];

  if (!schemaReady) {
    warnings.push(`Auth-DB-Schema ist in der Ziel-DB noch nicht vollstaendig vorhanden. Fehlende Tabellen: ${missingTables.join(', ')}`);
  }

  return warnings;
}

function buildUnavailableResult(config, readiness, errorCode) {
  return {
    ok: false,
    service: 'remote-modboard',
    module: 'remote_auth_db_read',
    statusApiVersion: 'rdap_admin_users1.v1',
    readOnly: true,
    writeEnabled: false,
    migrationEnabled: false,
    authEnabled: false,
    sessionCreationEnabled: false,
    generatedAt: new Date().toISOString(),
    database: {
      engine: config.database.engine,
      driver: config.database.driver,
      configured: readiness.configured,
      driverAvailable: readiness.driverAvailable,
      reachable: false,
      nameConfigured: Boolean(config.database.name),
      userConfigured: Boolean(config.database.user),
      passwordConfigured: config.database.passwordConfigured,
      writeEnabled: false,
      migrationEnabled: false
    },
    schema: {
      expectedTables: EXPECTED_TABLES,
      existingTables: [],
      missingTables: EXPECTED_TABLES,
      ready: false
    },
    counts: {},
    model: {
      migrations: [],
      users: [],
      userRoles: [],
      userGroups: [],
      sessions: [],
      roles: [],
      groups: [],
      permissions: [],
      rolePermissions: [],
      modulePermissions: []
    },
    validation: {
      schemaReady: false,
      rolesAreSeparateFromGroups: true,
      soundProfiIsRole: false,
      soundProfiRoleCount: 0,
      soundProfiIsGroupMarker: false,
      soundProfiGroupMarkerCount: 0,
      soundProfiGrantsPermissionsByItself: null,
      soundProfiRolePermissionCount: 0,
      modulePermissionRows: 0,
      sessionRows: null,
      lockRows: null,
      auditRows: null
    },
    error: errorCode || 'db_read_unavailable',
    warnings: [
      'Read-only Auth-DB-Modell konnte nicht gelesen werden.',
      'Es wurden keine Schreibaktionen ausgefuehrt.'
    ]
  };
}

function normalizeRows(rows) {
  return rows.map((row) => {
    const normalized = {};
    for (const key of Object.keys(row)) {
      const value = row[key];
      if (value instanceof Date) normalized[key] = value.toISOString();
      else normalized[key] = value;
    }
    return normalized;
  });
}

module.exports = {
  EXPECTED_TABLES,
  readAuthDbModel
};
