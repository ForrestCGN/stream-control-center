'use strict';

const { buildDatabaseReadiness, withReadOnlyConnection, publicDbError } = require('./db.service');

const AUDIT_TABLE = 'dashboard_audit_log';
const RDAP113_AUDIT_LOG_BUILD = 'RDAP_0.2.113_AUDIT_LOG_READONLY_API';
const RDAP115_AUDIT_RETENTION_BUILD = 'RDAP_0.2.115_AUDIT_LOG_RETENTION_STATUS_AND_ADMIN_UI_PREP';

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
    auditLogReadonlyApiPrepared: true,
    auditLogReadonlyApiBuild: RDAP113_AUDIT_LOG_BUILD,
    auditLogReadonlyApiRoute: '/api/remote/admin/audit/log',
    auditRetentionStatusPrepared: true,
    auditRetentionStatusBuild: RDAP115_AUDIT_RETENTION_BUILD,
    auditRetentionStatusRoute: '/api/remote/admin/audit/retention/status',
    auditWritePrepared: false,
    auditWriteEnabled: false,
    auditInsertEnabled: false,
    auditUpdateEnabled: false,
    auditCleanupEnabled: false,
    auditPruneEnabled: false,
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
      'RDAP113 ergaenzt eine read-only Audit-Log-Liste fuer wer/wann/was/Status.',
      'RDAP115 ergaenzt read-only Retention-Status fuer Gesamtzahl, Zeitraum und Cleanup-Status.',
      'Dieser Service schreibt keine Audit-Eintraege und aktualisiert keine bestehenden Zeilen.',
      'Es gibt keine automatische Audit-Selbstbereinigung in diesem Stand.',
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

async function buildAuditLogReadonlyList({ context, req }) {
  const readiness = buildDatabaseReadiness(context.config);
  const query = req && req.query ? req.query : {};
  const filters = buildAuditLogFilters(query);
  const base = {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_audit_log_readonly',
    moduleBuild: context.moduleBuild,
    routeBuild: RDAP113_AUDIT_LOG_BUILD,
    statusApiVersion: 'rdap_audit113.v1',
    route: '/api/remote/admin/audit/log',
    method: 'GET',
    readOnly: true,
    writeEnabled: false,
    databaseWriteEnabled: false,
    productiveWritesEnabled: false,
    migrationEnabled: false,
    auditInsertEnabled: false,
    auditUpdateEnabled: false,
    agentActionsEnabled: false,
    secretsLogged: false,
    rawPayloadLoggingEnabled: false,
    tableName: AUDIT_TABLE,
    limit: filters.limit,
    filters: filters.publicFilters,
    items: [],
    count: 0,
    columns: {
      inspected: false,
      detectedColumns: [],
      missingForRead: []
    },
    notes: [
      'Read-only Audit-Log-Liste: wer, wann, was und Status.',
      'Query nutzt nur SELECT ueber read-only Connection.',
      'Limit ist hart auf 100 begrenzt.',
      'safe_metadata_json wird nur sicher gekuerzt und nie roh als ungepruefter Payload geloggt.',
      'Keine Writes, keine Migration, keine UI-Buttons.'
    ]
  };

  if (!readiness.configured || !readiness.driverAvailable) {
    return {
      ...base,
      ok: false,
      reason: readiness.error || 'db_not_ready',
      database: {
        configured: readiness.configured,
        driverAvailable: readiness.driverAvailable,
        error: readiness.error
      }
    };
  }

  try {
    return await withReadOnlyConnection(context.config, async (connection) => {
      const columns = await readTableColumnsWithConnection(connection, AUDIT_TABLE);
      const adapter = buildAuditSchemaAdapterStatus(columns);

      if (!adapter.compatibleForRead) {
        return {
          ...base,
          ok: false,
          reason: 'audit_schema_not_compatible_for_read',
          columns: {
            inspected: true,
            detectedColumns: columns,
            missingForRead: adapter.mapping.missingForRead
          }
        };
      }

      const { sql, params } = buildAuditLogQuery({ columns, filters });
      const [rows] = await connection.query(sql, params);
      const items = rows.map((row) => normalizeAuditRow(row));

      return {
        ...base,
        items,
        count: items.length,
        columns: {
          inspected: true,
          detectedColumns: columns,
          missingForRead: []
        },
        reason: 'audit_log_readonly_list'
      };
    });
  } catch (err) {
    const publicError = publicDbError(err).code;
    return {
      ...base,
      ok: false,
      reason: publicError || 'audit_log_read_failed',
      error: publicError || 'audit_log_read_failed'
    };
  }
}

async function buildAuditRetentionReadonlyStatus({ context, req }) {
  const readiness = buildDatabaseReadiness(context.config);
  const base = {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_audit_retention_status_readonly',
    moduleBuild: context.moduleBuild,
    routeBuild: RDAP115_AUDIT_RETENTION_BUILD,
    statusApiVersion: 'rdap_audit115.v1',
    route: '/api/remote/admin/audit/retention/status',
    method: 'GET',
    readOnly: true,
    writeEnabled: false,
    databaseWriteEnabled: false,
    productiveWritesEnabled: false,
    migrationEnabled: false,
    auditCleanupEnabled: false,
    auditPruneEnabled: false,
    auditDeleteEnabled: false,
    physicalDeleteEnabled: false,
    agentActionsEnabled: false,
    uiActionButtonsEnabled: false,
    tableName: AUDIT_TABLE,
    retentionPolicy: {
      configured: false,
      mode: 'unbounded_currently',
      maxAgeDays: null,
      maxRows: null,
      autoCleanupEnabled: false,
      cleanupJobPrepared: false,
      cleanupRoutePrepared: false,
      cleanupRouteEnabled: false,
      recommendation: {
        maxAgeDays: 180,
        maxRows: 10000,
        mode: 'proposed_not_active'
      }
    },
    storage: {
      totalRows: 0,
      oldestCreatedAt: null,
      newestCreatedAt: null,
      spanDays: null,
      rowsByStatus: []
    },
    columns: {
      inspected: false,
      detectedColumns: [],
      compatibleForRead: false
    },
    notes: [
      'Diese Route liest nur den Audit-Log-Bestand und den Retention-Status.',
      'Aktuell ist keine automatische Selbstbereinigung konfiguriert.',
      'Es werden keine Audit-Zeilen geloescht, archiviert oder veraendert.',
      'Empfehlung fuer spaeter: 180 Tage oder 10000 Eintraege, aber erst mit eigenem Confirm-/Backup-/Audit-Scope.'
    ]
  };

  if (!readiness.configured || !readiness.driverAvailable) {
    return {
      ...base,
      ok: false,
      reason: readiness.error || 'db_not_ready',
      database: {
        configured: readiness.configured,
        driverAvailable: readiness.driverAvailable,
        error: readiness.error
      }
    };
  }

  try {
    return await withReadOnlyConnection(context.config, async (connection) => {
      const columns = await readTableColumnsWithConnection(connection, AUDIT_TABLE);
      const detectedSet = new Set(columns);
      if (!detectedSet.has('created_at')) {
        return {
          ...base,
          ok: false,
          reason: 'audit_retention_created_at_missing',
          columns: {
            inspected: true,
            detectedColumns: columns,
            compatibleForRead: false
          }
        };
      }

      const [[summary]] = await connection.query(
        `
          SELECT
            COUNT(*) AS total_rows,
            MIN(created_at) AS oldest_created_at,
            MAX(created_at) AS newest_created_at,
            TIMESTAMPDIFF(DAY, MIN(created_at), MAX(created_at)) AS span_days
          FROM \`${AUDIT_TABLE}\`
        `
      );

      const rowsByStatus = detectedSet.has('status')
        ? await readAuditRowsByStatus(connection)
        : [];

      return {
        ...base,
        storage: {
          totalRows: Number(summary.total_rows || 0),
          oldestCreatedAt: summary.oldest_created_at || null,
          newestCreatedAt: summary.newest_created_at || null,
          spanDays: summary.span_days === null || summary.span_days === undefined
            ? null
            : Number(summary.span_days),
          rowsByStatus
        },
        columns: {
          inspected: true,
          detectedColumns: columns,
          compatibleForRead: true
        },
        reason: 'audit_retention_status_readonly'
      };
    });
  } catch (err) {
    const publicError = publicDbError(err).code;
    return {
      ...base,
      ok: false,
      reason: publicError || 'audit_retention_status_read_failed',
      error: publicError || 'audit_retention_status_read_failed'
    };
  }
}

async function readAuditRowsByStatus(connection) {
  const [rows] = await connection.query(
    `
      SELECT status, COUNT(*) AS total_rows
      FROM \`${AUDIT_TABLE}\`
      GROUP BY status
      ORDER BY total_rows DESC, status ASC
      LIMIT 20
    `
  );

  return rows.map((row) => ({
    status: row.status || null,
    totalRows: Number(row.total_rows || 0)
  }));
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
    return await readTableColumnsWithConnection(connection, tableName);
  });
}

async function readTableColumnsWithConnection(connection, tableName) {
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

function buildAuditLogFilters(query) {
  const limit = clampLimit(query.limit);
  const status = cleanFilterValue(query.status, 40);
  const action = cleanFilterValue(query.action, 120);
  const actor = cleanFilterValue(query.actor, 120);

  return {
    limit,
    status,
    action,
    actor,
    publicFilters: {
      status: status || null,
      action: action || null,
      actor: actor || null
    }
  };
}

function clampLimit(value) {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 50;
  return Math.min(parsed, 100);
}

function cleanFilterValue(value, maxLength) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, maxLength);
}

function buildAuditLogQuery({ columns, filters }) {
  const detectedSet = new Set(columns || []);
  const selectParts = Object.entries(REAL_AUDIT_SCHEMA_MAP).map(([column, alias]) => {
    if (detectedSet.has(column)) return `\`${column}\` AS \`${alias}\``;
    return `NULL AS \`${alias}\``;
  });

  const whereParts = [];
  const params = [];

  if (filters.status && detectedSet.has('status')) {
    whereParts.push('`status` = ?');
    params.push(filters.status);
  }

  if (filters.action && detectedSet.has('action')) {
    whereParts.push('`action` LIKE ?');
    params.push(`%${filters.action}%`);
  }

  if (filters.actor) {
    const actorParts = [];
    if (detectedSet.has('actor_login')) actorParts.push('`actor_login` LIKE ?');
    if (detectedSet.has('actor_display_name')) actorParts.push('`actor_display_name` LIKE ?');
    if (actorParts.length > 0) {
      whereParts.push(`(${actorParts.join(' OR ')})`);
      for (let i = 0; i < actorParts.length; i += 1) params.push(`%${filters.actor}%`);
    }
  }

  const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
  params.push(filters.limit);

  return {
    sql: `
      SELECT ${selectParts.join(', ')}
      FROM \`${AUDIT_TABLE}\`
      ${whereSql}
      ORDER BY \`created_at\` DESC
      LIMIT ?
    `,
    params
  };
}

function normalizeAuditRow(row) {
  const safeMetadata = parseSafeMetadata(row.safeMetadata);
  return {
    id: row.id || null,
    auditId: row.auditId || null,
    createdAt: row.createdAt || null,
    completedAt: row.completedAt || null,
    actorUserUid: row.actorUserUid || null,
    actorLogin: row.actorLogin || null,
    actorDisplayName: row.actorDisplayName || null,
    source: row.source || null,
    action: row.action || null,
    permissionKey: row.permissionKey || null,
    resourceType: row.resourceType || null,
    resourceKey: row.resourceKey || null,
    status: row.status || null,
    errorCode: row.errorCode || null,
    oldValueSummary: truncateText(row.oldValueSummary, 180),
    newValueSummary: truncateText(row.newValueSummary, 180),
    safeMetadata,
    summary: buildAuditSummary(row, safeMetadata)
  };
}

function parseSafeMetadata(value) {
  if (!value) return null;
  const text = truncateText(String(value), 600);

  try {
    const parsed = JSON.parse(text);
    return sanitizeMetadata(parsed);
  } catch (err) {
    return { preview: text };
  }
}

function sanitizeMetadata(value) {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.slice(0, 10).map((entry) => sanitizeMetadata(entry));
  if (typeof value !== 'object') return truncateText(String(value), 180);

  const result = {};
  const blocked = new Set(['token', 'access_token', 'refresh_token', 'cookie', 'password', 'secret', 'session']);
  for (const [key, rawValue] of Object.entries(value).slice(0, 20)) {
    const lowerKey = String(key).toLowerCase();
    if (blocked.has(lowerKey) || lowerKey.includes('token') || lowerKey.includes('password') || lowerKey.includes('secret')) {
      result[key] = '[redacted]';
      continue;
    }
    result[key] = sanitizeMetadata(rawValue);
  }
  return result;
}

function buildAuditSummary(row, safeMetadata) {
  const actor = row.actorDisplayName || row.actorLogin || 'Unbekannt';
  const action = row.action || 'Aktion';
  const target = [row.resourceType, row.resourceKey].filter(Boolean).join(': ');
  const status = row.status ? ` (${row.status})` : '';
  const detail = target ? ` -> ${target}` : '';
  const metaHint = safeMetadata && safeMetadata.preview ? ` | ${safeMetadata.preview}` : '';
  return truncateText(`${actor}: ${action}${detail}${status}${metaHint}`, 260);
}

function truncateText(value, maxLength) {
  if (value === null || value === undefined) return null;
  const text = String(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
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
  buildAuditLogReadonlyList,
  buildAuditRetentionReadonlyStatus,
  buildAuditSchemaAdapterStatus,
  EXPECTED_AUDIT_COLUMNS,
  REQUIRED_AUDIT_READ_FIELDS,
  REQUIRED_AUDIT_WRITE_FIELDS
};
