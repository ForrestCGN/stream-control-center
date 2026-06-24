'use strict';

const { buildDatabaseReadiness, withReadOnlyConnection, publicDbError } = require('./db.service');

const AUDIT_TABLE = 'dashboard_audit_log';

const EXPECTED_AUDIT_COLUMNS = [
  'id',
  'request_id',
  'correlation_id',
  'actor_user_uid',
  'actor_login',
  'action',
  'resource_type',
  'resource_key',
  'status',
  'error_code',
  'safe_metadata_json',
  'created_at',
  'completed_at'
];

const REAL_AUDIT_SCHEMA_MAP = {
  id: 'id',
  audit_uid: 'auditId',
  request_id: 'requestId',
  correlation_id: 'correlationId',
  actor_user_uid: 'actorUserUid',
  actor_login: 'actorLogin',
  actor_display_name: 'actorDisplayName',
  source: 'source',
  action: 'action',
  permission_key: 'permissionKey',
  resource_type: 'resourceType',
  resource_key: 'resourceKey',
  status: 'status',
  error_code: 'errorCode',
  safe_metadata_json: 'safeMetadata',
  old_value_summary: 'oldValueSummary',
  new_value_summary: 'newValueSummary',
  created_at: 'createdAt',
  completed_at: 'completedAt'
};

const REQUIRED_AUDIT_READ_FIELDS = [
  'action',
  'resourceKey',
  'status',
  'requestId',
  'correlationId',
  'createdAt'
];

const REQUIRED_AUDIT_WRITE_FIELDS = [
  'action',
  'resourceKey',
  'status',
  'requestId',
  'correlationId',
  'createdAt'
];

async function buildAuditReadStatus({ context, req }) {
  const readiness = buildDatabaseReadiness(context.config);
  const inspectSchema = req && req.query && req.query.db === '1';

  const base = {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_audit_read',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap14.v1',
    readOnly: true,
    writeEnabled: false,
    databaseWriteEnabled: false,
    migrationEnabled: false,
    auditReadPrepared: true,
    auditWritePrepared: false,
    auditWriteEnabled: false,
    auditInsertEnabled: false,
    auditUpdateEnabled: false,
    secretsLogged: false,
    rawPayloadLoggingEnabled: false,
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
      name: AUDIT_TABLE,
      inspected: false,
      detected: null,
      expectedColumns: EXPECTED_AUDIT_COLUMNS,
      detectedColumns: [],
      missingExpectedColumns: []
    },
    adapter: buildAuditSchemaAdapterStatus([]),
    safety: context.safety,
    notes: [
      'RDAP14 liest Audit-Struktur nur diagnostisch.',
      'Dieser Service schreibt keine Audit-Eintraege und aktualisiert keine bestehenden Zeilen.',
      'Schema-Inspektion erfolgt nur bei db=1 und nur per SELECT/INFORMATION_SCHEMA.',
      'Der Schema-Adapter bewertet nur Mapping/Kompatibilitaet und aktiviert keine Writes.',
      'Secrets, Tokens, Cookies, ENV-Werte und Rohpayloads duerfen nicht geloggt werden.'
    ]
  };

  if (!inspectSchema) return base;

  if (!readiness.configured || !readiness.driverAvailable) {
    return { ...base, ok: false, reason: readiness.error || 'db_not_ready' };
  }

  try {
    const columns = await readTableColumns(context.config, AUDIT_TABLE);
    return {
      ...base,
      table: buildTableStatus(AUDIT_TABLE, columns, EXPECTED_AUDIT_COLUMNS),
      adapter: buildAuditSchemaAdapterStatus(columns),
      reason: 'audit_schema_inspected_readonly'
    };
  } catch (err) {
    const publicError = publicDbError(err).code;
    return {
      ...base,
      ok: false,
      reason: publicError || 'audit_schema_read_failed',
      error: publicError || 'audit_schema_read_failed'
    };
  }
}

function buildAuditSchemaAdapterStatus(detectedColumns) {
  const detectedSet = new Set(detectedColumns || []);
  const mappedFields = {};
  const sourceColumnsByField = {};

  for (const column of detectedSet) {
    const field = REAL_AUDIT_SCHEMA_MAP[column];
    if (!field) continue;
    mappedFields[field] = true;
    if (!sourceColumnsByField[field]) sourceColumnsByField[field] = [];
    sourceColumnsByField[field].push(column);
  }

  const mappedFieldNames = Object.keys(mappedFields).sort();
  const missingForRead = REQUIRED_AUDIT_READ_FIELDS.filter((field) => !mappedFields[field]);
  const missingForWrite = REQUIRED_AUDIT_WRITE_FIELDS.filter((field) => !mappedFields[field]);
  const recommendedMissing = ['actorLogin', 'resourceType', 'errorCode', 'safeMetadata', 'completedAt']
    .filter((field) => !mappedFields[field]);

  return {
    prepared: true,
    readOnly: true,
    writeEnabled: false,
    tableName: AUDIT_TABLE,
    inspected: detectedColumns.length > 0,
    compatibleForRead: detectedColumns.length > 0 && missingForRead.length === 0,
    compatibleForWrite: false,
    writeBlocked: true,
    writeBlockReason: missingForWrite.length === 0
      ? 'writes_disabled_by_safety_flags'
      : 'missing_required_audit_write_fields_and_writes_disabled',
    mapping: {
      sourceToInternal: pickDetectedMappings(detectedSet, REAL_AUDIT_SCHEMA_MAP),
      internalToSource: sourceColumnsByField,
      mappedFields: mappedFieldNames,
      missingForRead,
      missingForWrite,
      recommendedMissing
    },
    secretSafety: {
      secretsLogged: false,
      rawPayloadLoggingEnabled: false,
      blockedDataTypes: [
        'oauth_code',
        'access_token',
        'refresh_token',
        'cookie',
        'session_id_plaintext',
        'env_value',
        'password',
        'raw_request_body_with_secrets'
      ]
    },
    notes: [
      'Audit-Schema-Adapter ist nur read-only vorbereitet.',
      'compatibleForWrite bleibt in RDAP14 immer false.',
      'safeMetadata/errorCode/completedAt fehlen im realen Schema und muessen vor Writes bewusst geloest werden.',
      'Es werden keine Audit-Eintraege geschrieben oder aktualisiert.'
    ]
  };
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
  buildAuditReadStatus,
  buildAuditSchemaAdapterStatus,
  EXPECTED_AUDIT_COLUMNS,
  REQUIRED_AUDIT_READ_FIELDS,
  REQUIRED_AUDIT_WRITE_FIELDS
};
