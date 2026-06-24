'use strict';

const { buildDatabaseReadiness, withReadOnlyConnection, publicDbError } = require('./db.service');

const LOCK_TABLE = 'dashboard_locks';

const EXPECTED_LOCK_COLUMNS = [
  'id',
  'lock_id',
  'resource_type',
  'resource_key',
  'resource_version',
  'edit_session_id',
  'user_uid',
  'client_id',
  'heartbeat_at',
  'expires_at',
  'created_at',
  'updated_at',
  'released_at'
];

const REAL_LOCK_SCHEMA_MAP = {
  id: 'id',
  lock_uid: 'lockId',
  lock_id: 'lockId',
  resource_type: 'resourceType',
  resource_key: 'resourceKey',
  version_token: 'resourceVersion',
  resource_version: 'resourceVersion',
  owner_user_uid: 'ownerUserUid',
  user_uid: 'ownerUserUid',
  edit_session_id: 'editSessionId',
  client_id: 'clientId',
  status: 'status',
  heartbeat_at: 'heartbeatAt',
  expires_at: 'expiresAt',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
  released_at: 'releasedAt'
};

const REQUIRED_LOCK_READ_FIELDS = [
  'lockId',
  'resourceKey',
  'ownerUserUid',
  'status',
  'heartbeatAt',
  'expiresAt'
];

const REQUIRED_LOCK_WRITE_FIELDS = [
  'lockId',
  'resourceType',
  'resourceKey',
  'ownerUserUid',
  'status',
  'heartbeatAt',
  'expiresAt'
];

async function buildLockReadStatus({ context, req }) {
  const readiness = buildDatabaseReadiness(context.config);
  const inspectSchema = req && req.query && req.query.db === '1';

  const base = {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_lock_read',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap14.v1',
    readOnly: true,
    writeEnabled: false,
    databaseWriteEnabled: false,
    migrationEnabled: false,
    lockReadPrepared: true,
    lockWritePrepared: false,
    lockWriteEnabled: false,
    lockAcquireEnabled: false,
    lockHeartbeatEnabled: false,
    lockReleaseEnabled: false,
    lockForceTakeoverEnabled: false,
    productiveAuthorizationEnabled: false,
    schemaInspectionRequested: inspectSchema,
    schemaAdapterPrepared: true,
    database: {
      configured: readiness.configured,
      driverAvailable: readiness.driverAvailable,
      writeEnabled: false,
      migrationEnabled: false,
      error: readiness.error
    },
    table: {
      name: LOCK_TABLE,
      inspected: false,
      detected: null,
      expectedColumns: EXPECTED_LOCK_COLUMNS,
      detectedColumns: [],
      missingExpectedColumns: []
    },
    adapter: buildLockSchemaAdapterStatus([]),
    safety: context.safety,
    notes: [
      'RDAP14 liest Lock-Informationen nur diagnostisch.',
      'Dieser Service erstellt, verlaengert, uebernimmt oder loescht keine Locks.',
      'Schema-Inspektion erfolgt nur bei db=1 und nur per SELECT/INFORMATION_SCHEMA.',
      'Der Schema-Adapter bewertet nur Mapping/Kompatibilitaet und aktiviert keine Writes.',
      'Produktive Lock-Writes bleiben deaktiviert.'
    ]
  };

  if (!inspectSchema) return base;

  if (!readiness.configured || !readiness.driverAvailable) {
    return { ...base, ok: false, reason: readiness.error || 'db_not_ready' };
  }

  try {
    const columns = await readTableColumns(context.config, LOCK_TABLE);
    return {
      ...base,
      table: buildTableStatus(LOCK_TABLE, columns, EXPECTED_LOCK_COLUMNS),
      adapter: buildLockSchemaAdapterStatus(columns),
      reason: 'lock_schema_inspected_readonly'
    };
  } catch (err) {
    const publicError = publicDbError(err).code;
    return {
      ...base,
      ok: false,
      reason: publicError || 'lock_schema_read_failed',
      error: publicError || 'lock_schema_read_failed'
    };
  }
}

function buildLockSchemaAdapterStatus(detectedColumns) {
  const detectedSet = new Set(detectedColumns || []);
  const mappedFields = {};
  const sourceColumnsByField = {};

  for (const column of detectedSet) {
    const field = REAL_LOCK_SCHEMA_MAP[column];
    if (!field) continue;
    mappedFields[field] = true;
    if (!sourceColumnsByField[field]) sourceColumnsByField[field] = [];
    sourceColumnsByField[field].push(column);
  }

  const mappedFieldNames = Object.keys(mappedFields).sort();
  const missingForRead = REQUIRED_LOCK_READ_FIELDS.filter((field) => !mappedFields[field]);
  const missingForWrite = REQUIRED_LOCK_WRITE_FIELDS.filter((field) => !mappedFields[field]);
  const hasTypedResourceKeyFallback = detectedSet.has('resource_key');

  const compatibleForRead = detectedColumns.length > 0 && missingForRead.length === 0;
  const compatibleForWrite = false;

  return {
    prepared: true,
    readOnly: true,
    writeEnabled: false,
    tableName: LOCK_TABLE,
    inspected: detectedColumns.length > 0,
    compatibleForRead,
    compatibleForWrite,
    writeBlocked: true,
    writeBlockReason: buildLockWriteBlockReason(missingForWrite, hasTypedResourceKeyFallback),
    mapping: {
      sourceToInternal: pickDetectedMappings(detectedSet, REAL_LOCK_SCHEMA_MAP),
      internalToSource: sourceColumnsByField,
      mappedFields: mappedFieldNames,
      missingForRead,
      missingForWrite,
      optionalMissing: ['editSessionId', 'clientId', 'releasedAt'].filter((field) => !mappedFields[field])
    },
    resourceKeyStrategy: {
      resourceTypeColumnDetected: detectedSet.has('resource_type'),
      typedResourceKeyFallbackPossible: hasTypedResourceKeyFallback,
      requiredFormat: '<resourceType>:<namespace>:<id>',
      examples: [
        'text:message:welcome',
        'config:module:loyalty',
        'media:sound:1602',
        'command:twitch:clip',
        'overlay:layout:event_winner'
      ]
    },
    notes: [
      'Lock-Schema-Adapter ist nur read-only vorbereitet.',
      'compatibleForWrite bleibt in RDAP14 immer false.',
      'Ohne resource_type muss resource_key spaeter eindeutig typisiert sein.',
      'Es werden keine Locks geschrieben, verlaengert, uebernommen oder geloescht.'
    ]
  };
}

function buildLockWriteBlockReason(missingForWrite, typedResourceKeyFallbackPossible) {
  if (missingForWrite.length === 0) return 'writes_disabled_by_safety_flags';
  if (missingForWrite.includes('resourceType') && typedResourceKeyFallbackPossible) {
    return 'resource_type_column_missing_typed_resource_key_required_and_writes_disabled';
  }
  return 'missing_required_lock_write_fields_and_writes_disabled';
}

async function readTableColumns(config, tableName) {
  return await withReadOnlyConnection(config, async (connection) => {
    const [rows] = await connection.query(
      `
        SELECT COLUMN_NAME AS column_name
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION ASC
      `,
      [tableName]
    );

    return rows.map((row) => row.column_name).filter(Boolean);
  });
}

function buildTableStatus(tableName, detectedColumns, expectedColumns) {
  const detectedSet = new Set(detectedColumns);

  return {
    name: tableName,
    inspected: true,
    detected: detectedColumns.length > 0,
    expectedColumns,
    detectedColumns,
    missingExpectedColumns: expectedColumns.filter((column) => !detectedSet.has(column))
  };
}

function pickDetectedMappings(detectedSet, map) {
  const result = {};
  for (const [source, target] of Object.entries(map)) {
    if (detectedSet.has(source)) result[source] = target;
  }
  return result;
}

module.exports = {
  buildLockReadStatus,
  buildLockSchemaAdapterStatus,
  EXPECTED_LOCK_COLUMNS,
  REQUIRED_LOCK_READ_FIELDS,
  REQUIRED_LOCK_WRITE_FIELDS
};
