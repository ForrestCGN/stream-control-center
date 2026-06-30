'use strict';

const crypto = require('crypto');
const path = require('path');
const {
  buildAgentMediaInventoryStatusResponse,
  buildAgentConnectionSummary,
  buildMediaFullSyncCompareSnapshotStatusResponse
} = require('../services/agent-runtime.service');
const { withReadOnlyConnection, withWriteConnection, publicDbError } = require('../services/db.service');
const { requireAdminConfirmWrite } = require('../services/admin-confirm-write.service');

const MODULE = 'remote_media_index_diff_readonly';
const STATUS_API_VERSION = 'rdap_media_index_upsert_candidates_fix_gated_090.v1';
const PREVIOUS_STATUS_API_VERSION = 'rdap_media_index_upsert_with_context_gated_089.v1';
const BUILD = 'RDAP_0.2.90_MEDIA_INDEX_UPSERT_CANDIDATES_FIX_GATED';
const PREVIOUS_BUILD = 'RDAP_0.2.89_MEDIA_INDEX_UPSERT_WITH_CONTEXT_GATED';
const ROUTE = '/api/remote/media/index/diff/status';
const UPSERT_PREVIEW_ROUTE = '/api/remote/media/index/upsert/preview';
const UPSERT_EXECUTE_ROUTE = '/api/remote/media/index/upsert/execute';
const SCHEMA_EXTENSION_PREVIEW_ROUTE = '/api/remote/media/index/schema/extension/preview';
const SCHEMA_EXTENSION_EXECUTE_ROUTE = '/api/remote/media/index/schema/extension/execute';
const CONFIRM_UPSERT_TEXT = 'RDAP_0.2.89_CONFIRM_MEDIA_INDEX_UPSERT_WITH_CONTEXT';
const CONFIRM_SCHEMA_EXTENSION_TEXT = 'RDAP_0.2.87_CONFIRM_MEDIA_INDEX_SCHEMA_EXTENSION';
const PERSISTENT_TOMBSTONE_PREVIEW_ROUTE = '/api/remote/media/index/tombstone/persistent/preview';
const PERSISTENT_TOMBSTONE_EXECUTE_ROUTE = '/api/remote/media/index/tombstone/persistent/execute';
const AUDIT_TABLE = 'dashboard_audit_log';
const CONFIRM_PERSISTENT_TOMBSTONE_TEXT = 'RDAP_0.2.59_CONFIRM_PERSISTENT_TOMBSTONE_EXECUTE';
const PERSISTENT_INDEX_TABLE = 'remote_media_index';
const DEFAULT_PREVIEW_LIMIT = 20;
const MAX_PREVIEW_LIMIT = 50;
const MAX_DB_ROWS = 2000;
const MODIFIED_AT_TOLERANCE_MS = 1500;
const MODIFIED_AT_SOFT_OFFSET_TOLERANCE_MS = 5000;
const MODIFIED_AT_SOFT_OFFSET_BUCKETS = Object.freeze([
  { key: 'one_hour', ms: 60 * 60 * 1000 },
  { key: 'two_hours', ms: 2 * 60 * 60 * 1000 }
]);

const MEDIA_ALLOWED_EXTENSIONS = Object.freeze(['.mp3', '.wav', '.ogg', '.webm', '.m4a', '.mp4', '.png', '.jpg', '.jpeg', '.webp', '.gif']);
const MEDIA_AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.m4a']);
const MEDIA_ROOT_KEYS = new Set(['sounds', 'videos', 'images', 'media']);
const TTS_TEMP_ROOT_KEY = 'sounds';
const TTS_TEMP_PREFIX = 'tts/generated/';
const TTS_EXCLUDED_LEGACY_CLASSIFICATION = 'tts_generated_excluded_from_sync_legacy_candidate';
const MEDIA_INDEX_SCHEMA_EXTENSION_COLUMNS = Object.freeze([
  { name: 'module_key', definition: 'VARCHAR(80) NULL', after: 'sync_version' },
  { name: 'category_key', definition: 'VARCHAR(120) NULL', after: 'module_key' },
  { name: 'full_category_key', definition: 'VARCHAR(220) NULL', after: 'category_key' },
  { name: 'asset_relative_path', definition: 'VARCHAR(500) NULL', after: 'full_category_key' },
  { name: 'web_path', definition: 'VARCHAR(700) NULL', after: 'asset_relative_path' },
  { name: 'public_path', definition: 'VARCHAR(700) NULL', after: 'web_path' }
]);

function registerMediaIndexDiffRoutes(app, context) {
  app.get(ROUTE, async (req, res) => {
    const result = await buildMediaIndexDiffStatus(context, req);
    res.status(result.httpStatus || 200).json(result.body || result);
  });

  app.get(UPSERT_PREVIEW_ROUTE, async (req, res) => {
    const result = await buildMediaIndexUpsertPreviewStatus(context, req);
    res.status(result.httpStatus || 200).json(result.body || result);
  });

  app.post(UPSERT_EXECUTE_ROUTE, async (req, res) => {
    const result = await executeMediaIndexUpsertFoundation(context, req);
    res.status(result.httpStatus || result.status || 200).json(result.body || result);
  });

  app.get(SCHEMA_EXTENSION_PREVIEW_ROUTE, async (req, res) => {
    const result = await buildMediaIndexSchemaExtensionPreviewStatus(context, req);
    res.status(result.httpStatus || 200).json(result.body || result);
  });

  app.post(SCHEMA_EXTENSION_EXECUTE_ROUTE, async (req, res) => {
    const result = await executeMediaIndexSchemaExtensionFoundation(context, req);
    res.status(result.httpStatus || result.status || 200).json(result.body || result);
  });

  app.get(PERSISTENT_TOMBSTONE_PREVIEW_ROUTE, async (req, res) => {
    const result = await buildPersistentTombstonePreviewStatus(context, req);
    res.status(result.httpStatus || 200).json(result.body || result);
  });

  app.post(PERSISTENT_TOMBSTONE_EXECUTE_ROUTE, async (req, res) => {
    const result = await executePersistentTombstoneFoundation(context, req);
    res.status(result.httpStatus || result.status || 200).json(result.body || result);
  });
}

async function buildMediaIndexDiffStatus(context = {}, req = null) {
  const generatedAt = new Date().toISOString();
  const previewLimit = readPreviewLimit(req);
  const agentStatus = safeBuildAgentMediaInventoryStatus();
  const connectionSummary = safeBuildAgentConnectionSummary();
  const fullSyncCompareSnapshot = safeBuildFullSyncCompareSnapshotStatus();
  const agentInventory = sanitizeAgentInventory(agentStatus, connectionSummary);
  const agentSnapshotDiagnostic = buildAgentSnapshotDiagnostic({ agentInventory, connectionSummary });
  const agentSnapshotUnavailable = agentSnapshotDiagnostic.available !== true;

  let dbInventory;
  try {
    dbInventory = await readPersistentIndexItems(context.config || {});
  } catch (err) {
    const code = publicDbError(err).code || 'media_index_diff_db_read_failed';
    const emptyCounts = buildEmptyCounts();
    const emptyClassification = buildMissingClassification([]);
    return {
      ok: false,
      httpStatus: 200,
      service: 'remote-modboard',
      module: MODULE,
      moduleVersion: context.appVersion || '0.2.59',
      moduleBuild: BUILD,
      appModuleBuild: context.moduleBuild || null,
      routeBuild: BUILD,
      previousRouteBuild: PREVIOUS_BUILD,
      statusApiVersion: STATUS_API_VERSION,
      previousStatusApiVersion: PREVIOUS_STATUS_API_VERSION,
      route: ROUTE,
      generatedAt,
      readOnly: true,
      writeEnabled: false,
      active: false,
      status: code,
      error: code,
      agent: buildAgentSummary(agentInventory, agentSnapshotUnavailable),
      agentSnapshotDiagnostic,
      fullSyncCompare: buildFullSyncCompareStatus({ snapshot: fullSyncCompareSnapshot, dbInventory: { items: [], total: 0, truncated: false }, previewLimit }),
      database: { table: PERSISTENT_INDEX_TABLE, readOnly: true, total: 0, active: false },
      counts: emptyCounts,
      missingClassification: emptyClassification,
      previewLimit,
      previews: buildEmptyPreviews(),
      comparePolicy: buildComparePolicy(),
      reliability: buildReliabilityBlock({
        agentInventory,
        agentSnapshotDiagnostic,
        dbInventory: { truncated: false },
        diff: { counts: emptyCounts, missingClassification: emptyClassification }
      }),
      safety: buildSafetyBlock(),
      note: 'Diff-Diagnose konnte die Online-DB nicht read-only lesen. Es wurden keine Writes ausgefuehrt.'
    };
  }

  const diff = buildDiff({
    agentItems: agentInventory.items,
    dbItems: dbInventory.items,
    previewLimit,
    agentTruncated: agentInventory.truncated,
    agentSnapshotUnavailable,
    dbTruncated: dbInventory.truncated
  });

  const fullSyncCompare = buildFullSyncCompareStatus({ snapshot: fullSyncCompareSnapshot, dbInventory, previewLimit });
  const reliability = buildReliabilityBlock({ agentInventory, agentSnapshotDiagnostic, dbInventory, diff, fullSyncCompare });

  return {
    ok: true,
    service: 'remote-modboard',
    module: MODULE,
    moduleVersion: context.appVersion || '0.2.59',
    moduleBuild: BUILD,
      appModuleBuild: context.moduleBuild || null,
    routeBuild: BUILD,
    previousRouteBuild: PREVIOUS_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    previousStatusApiVersion: PREVIOUS_STATUS_API_VERSION,
    route: ROUTE,
    generatedAt,
    readOnly: true,
    writeEnabled: false,
    active: true,
    status: agentSnapshotUnavailable ? 'diff_available_agent_snapshot_unavailable' : (agentInventory.truncated ? 'diff_available_agent_snapshot_truncated' : 'diff_available'),
    source: 'agent_snapshot_vs_remote_media_index_readonly',
    agent: buildAgentSummary(agentInventory, agentSnapshotUnavailable),
    agentSnapshotDiagnostic,
    fullSyncCompare,
    database: { table: PERSISTENT_INDEX_TABLE, readOnly: true, total: dbInventory.total, returned: dbInventory.items.length, truncated: dbInventory.truncated, active: dbInventory.items.length > 0 },
    counts: diff.counts,
    missingClassification: diff.missingClassification,
    previewLimit,
    previews: diff.previews,
    comparePolicy: buildComparePolicy(),
    reliability,
    safety: buildSafetyBlock(),
    nextSteps: [
      'TTS-generated-temp Dateien sind aus Agent-Inventory und Full-Sync ausgeschlossen.',
      'Tombstone-Kandidatur bleibt reine Diagnose.',
      'Persistente Tombstone-Preview ist read-only unter /api/remote/media/index/tombstone/persistent/preview verfuegbar.',
      'Persistente Tombstone-Execute-Foundation ist unter /api/remote/media/index/tombstone/persistent/execute vorbereitet und streng gegatet.',
      'Gated Delta-Upsert separat planen.',
      'Tombstone/deleted=1 nur mit local-only, Confirm, expectedCandidateCount, Media-Index-Gates, Audit und Readback.',
      'Upload/Edit/Delete bleibt aus.'
    ],
    note: agentSnapshotUnavailable
      ? 'Diese Route vergleicht read-only. Der Agent-Snapshot ist leer oder nicht verfuegbar; agentSnapshotDiagnostic zeigt die wahrscheinliche Ursache. Es wird kein belastbarer missingOnAgent-/Loeschstatus abgeleitet.'
      : 'Diese Route vergleicht read-only Agent-Snapshot und remote_media_index. 0.2.77 akzeptiert zusaetzlich den Media-System-Root media und erhaelt Kontextfelder fuer Diff-/Preview-Diagnose. Sie schreibt nichts und fuehrt keine Dateiaktion aus.'
  };
}


async function buildMediaIndexSchemaExtensionPreviewStatus(context = {}, req = null) {
  const generatedAt = new Date().toISOString();
  try {
    const snapshot = await buildMediaIndexSchemaExtensionSnapshot(context.config || {});
    return {
      ok: true,
      service: 'remote-modboard',
      module: 'remote_media_index_schema_extension_preview',
      moduleVersion: context.appVersion || '0.2.59',
      moduleBuild: BUILD,
      appModuleBuild: context.moduleBuild || null,
      routeBuild: BUILD,
      previousRouteBuild: PREVIOUS_BUILD,
      statusApiVersion: STATUS_API_VERSION,
      previousStatusApiVersion: PREVIOUS_STATUS_API_VERSION,
      route: SCHEMA_EXTENSION_PREVIEW_ROUTE,
      executeRoute: SCHEMA_EXTENSION_EXECUTE_ROUTE,
      generatedAt,
      readOnly: true,
      writeEnabled: false,
      databaseWritesEnabled: false,
      databaseWriteExecuted: false,
      executeRoutePrepared: true,
      table: PERSISTENT_INDEX_TABLE,
      ...snapshot,
      requiredConfirmSchema: CONFIRM_SCHEMA_EXTENSION_TEXT,
      futureWritePolicy: {
        preparedOnly: true,
        readOnly: true,
        requiresSeparateExecuteConfirmation: true,
        requiresLocalRequest: true,
        requiresConfirmWrite: true,
        requiresConfirmSchemaText: true,
        requiresExpectedMissingColumnCount: true,
        requiresMediaIndexSchemaWriteGates: true,
        requiresAudit: true,
        requiresReadback: true,
        noDataMutation: true,
        noDeletes: true,
        noOnlineToAgentAction: true
      },
      safety: buildSchemaExtensionSafety(),
      note: 'Schema-Extension-Preview liest nur information_schema und zeigt fehlende Kontextspalten. Es wird nichts geschrieben.'
    };
  } catch (err) {
    const code = publicDbError(err).code || 'media_index_schema_extension_preview_failed';
    return {
      ok: false,
      httpStatus: 200,
      service: 'remote-modboard',
      module: 'remote_media_index_schema_extension_preview',
      moduleVersion: context.appVersion || '0.2.59',
      moduleBuild: BUILD,
      appModuleBuild: context.moduleBuild || null,
      routeBuild: BUILD,
      statusApiVersion: STATUS_API_VERSION,
      route: SCHEMA_EXTENSION_PREVIEW_ROUTE,
      generatedAt,
      readOnly: true,
      writeEnabled: false,
      databaseWriteExecuted: false,
      status: code,
      error: code,
      table: PERSISTENT_INDEX_TABLE,
      missingColumnCount: null,
      missingColumns: [],
      plannedColumns: MEDIA_INDEX_SCHEMA_EXTENSION_COLUMNS,
      safety: buildSchemaExtensionSafety(),
      note: 'Schema-Extension-Preview konnte information_schema nicht lesen. Es wurden keine Writes ausgefuehrt.'
    };
  }
}

async function executeMediaIndexSchemaExtensionFoundation(context = {}, req = null) {
  const generatedAt = new Date().toISOString();
  const body = req && req.body && typeof req.body === 'object' ? req.body : {};
  const base = {
    service: 'remote-modboard',
    module: 'remote_media_index_schema_extension_execute_foundation',
    moduleVersion: context.appVersion || '0.2.59',
    moduleBuild: BUILD,
    appModuleBuild: context.moduleBuild || null,
    routeBuild: BUILD,
    previousRouteBuild: PREVIOUS_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    previousStatusApiVersion: PREVIOUS_STATUS_API_VERSION,
    route: SCHEMA_EXTENSION_EXECUTE_ROUTE,
    previewRoute: SCHEMA_EXTENSION_PREVIEW_ROUTE,
    generatedAt,
    readOnly: false,
    localOnly: true,
    writeEnabled: false,
    databaseWritesEnabled: false,
    databaseWriteExecuted: false,
    schemaWriteExecuted: false,
    alterTableExecuted: false,
    auditWritten: false,
    readBackPerformed: false,
    noDataMutation: true,
    noDeletes: true,
    noOnlineToAgentAction: true,
    table: PERSISTENT_INDEX_TABLE,
    requiredConfirmSchema: CONFIRM_SCHEMA_EXTENSION_TEXT,
    requiredEnvGates: buildMediaIndexSchemaExtensionGateStatus()
  };

  if (!isLocalRequest(req)) {
    return blockedExecute(403, base, 'local_request_required');
  }

  const confirm = requireAdminConfirmWrite({ body });
  if (!confirm.confirmWriteAccepted) {
    return blockedExecute(400, base, 'confirm_write_required', { confirmWriteAccepted: false, confirm });
  }

  const confirmSchema = String(body.confirmSchema || body.confirm_schema || body.confirmText || body.confirm_text || '');
  if (confirmSchema !== CONFIRM_SCHEMA_EXTENSION_TEXT) {
    return blockedExecute(400, base, 'confirm_schema_text_required', {
      confirmWriteAccepted: true,
      requiredConfirmSchema: CONFIRM_SCHEMA_EXTENSION_TEXT
    });
  }

  const expectedMissingColumnCount = Number(body.expectedMissingColumnCount ?? body.expected_missing_column_count);
  if (!Number.isInteger(expectedMissingColumnCount) || expectedMissingColumnCount < 0 || expectedMissingColumnCount > MEDIA_INDEX_SCHEMA_EXTENSION_COLUMNS.length) {
    return blockedExecute(400, base, 'expected_missing_column_count_required', {
      confirmWriteAccepted: true,
      confirmSchemaAccepted: true,
      expectedMissingColumnCountAccepted: false
    });
  }

  const snapshot = await buildMediaIndexSchemaExtensionSnapshot(context.config || {});
  if (snapshot.missingColumnCount !== expectedMissingColumnCount) {
    return blockedExecute(409, base, 'missing_column_count_changed', {
      confirmWriteAccepted: true,
      confirmSchemaAccepted: true,
      expectedMissingColumnCount,
      currentMissingColumnCount: snapshot.missingColumnCount,
      snapshot
    });
  }

  if (!base.requiredEnvGates.allRequiredGatesEnabled) {
    return blockedExecute(403, base, 'media_index_schema_extension_write_gate_disabled', {
      confirmWriteAccepted: true,
      confirmSchemaAccepted: true,
      expectedMissingColumnCount,
      currentMissingColumnCount: snapshot.missingColumnCount,
      missingColumnCount: snapshot.missingColumnCount,
      missingColumns: snapshot.missingColumns,
      requiredEnvGates: base.requiredEnvGates,
      snapshot
    });
  }

  if (snapshot.missingColumnCount <= 0) {
    return {
      status: 200,
      body: {
        ...base,
        ok: true,
        status: 'media_index_schema_extension_execute_noop_all_columns_present',
        confirmWriteAccepted: true,
        confirmSchemaAccepted: true,
        expectedMissingColumnCount,
        currentMissingColumnCount: 0,
        missingColumnCount: 0,
        writeEnabled: true,
        databaseWritesEnabled: true,
        databaseWriteExecuted: false,
        schemaWriteExecuted: false,
        alterTableExecuted: false,
        auditWritten: false,
        readBackPerformed: true,
        snapshot,
        note: 'Alle geplanten Schema-Spalten sind bereits vorhanden. Kein ALTER TABLE wurde ausgefuehrt.'
      }
    };
  }

  const config = context && context.config ? context.config : {};
  const now = new Date();
  const auditUid = buildAuditUid(now);

  try {
    return await withWriteConnection(config, async (connection) => {
      try {
        const alterSql = buildSchemaExtensionAlterTableSql(snapshot.missingColumns);
        await connection.query(alterSql);

        const readBackSnapshot = await buildMediaIndexSchemaExtensionSnapshot(config);
        const safeMetadata = {
          step: BUILD,
          purpose: 'add_media_index_context_columns',
          table: PERSISTENT_INDEX_TABLE,
          expectedMissingColumnCount,
          beforeMissingColumnCount: snapshot.missingColumnCount,
          afterMissingColumnCount: readBackSnapshot.missingColumnCount,
          addedColumns: snapshot.missingColumns.map(col => col.name),
          noDataMutation: true,
          noDelete: true,
          noOnlineToAgentAction: true,
          generatedAt: now.toISOString()
        };

        await connection.execute(
          `INSERT INTO ${AUDIT_TABLE}
            (audit_uid, actor_user_uid, actor_display_name, actor_login, source, action, resource_type,
             permission_key, resource_key, status, error_code, old_value_summary, new_value_summary,
             safe_metadata_json, completed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            auditUid,
            safeString(body.actorUserUid || body.actor_user_uid || 'system:rdap088-schema-extension', 64),
            safeString(body.actorDisplayName || body.actor_display_name || 'RDAP 0.2.88 Schema Extension', 120),
            safeString(body.actorLogin || body.actor_login || 'rdap088-schema-extension', 128),
            'remote-modboard/rdap088',
            'media_index.schema_extension.add_context_columns',
            'remote_media_index',
            'media.index.schema.extension',
            'media-index:schema-extension',
            readBackSnapshot.missingColumnCount === 0 ? 'success' : 'warning',
            null,
            `${snapshot.missingColumnCount} media-index context column(s) missing before schema execute.`,
            `${snapshot.missingColumnCount - readBackSnapshot.missingColumnCount} column(s) added via ALTER TABLE. No data row mutation, no delete, no Online-to-Agent action.`,
            JSON.stringify(safeMetadata),
            now
          ]
        );

        return {
          status: 200,
          body: {
            ...base,
            ok: true,
            status: readBackSnapshot.missingColumnCount === 0
              ? 'media_index_schema_extension_execute_success'
              : 'media_index_schema_extension_execute_partial_readback_warning',
            confirmWriteAccepted: true,
            confirmSchemaAccepted: true,
            expectedMissingColumnCount,
            beforeMissingColumnCount: snapshot.missingColumnCount,
            afterMissingColumnCount: readBackSnapshot.missingColumnCount,
            missingColumnCount: readBackSnapshot.missingColumnCount,
            addedColumns: snapshot.missingColumns.map(col => col.name),
            writeEnabled: true,
            databaseWritesEnabled: true,
            databaseWriteExecuted: true,
            schemaWriteExecuted: true,
            alterTableExecuted: true,
            auditWritten: true,
            readBackPerformed: true,
            snapshotBefore: snapshot,
            snapshotAfter: readBackSnapshot,
            note: 'Schema-Extension wurde gegatet ausgefuehrt. Es wurden nur Spalten ergaenzt, keine Datenzeilen veraendert und keine Datei-/Agent-Aktion ausgefuehrt.'
          }
        };
      } catch (err) {
        throw err;
      }
    }, { scope: 'media_index_schema' });
  } catch (err) {
    const code = publicDbError(err).code || 'media_index_schema_extension_execute_failed';
    return blockedExecute(500, base, code, {
      confirmWriteAccepted: true,
      confirmSchemaAccepted: true,
      expectedMissingColumnCount,
      currentMissingColumnCount: snapshot.missingColumnCount,
      missingColumnCount: snapshot.missingColumnCount,
      databaseWriteExecuted: false,
      schemaWriteExecuted: false,
      alterTableExecuted: false,
      auditWritten: false,
      snapshot,
      error: code
    });
  }
}


async function buildMediaIndexUpsertPreviewStatus(context = {}, req = null) {
  const generatedAt = new Date().toISOString();
  const previewLimit = readPreviewLimit(req);
  const fullSyncCompareSnapshot = safeBuildFullSyncCompareSnapshotStatus();
  const full = sanitizeFullSyncCompareSnapshot(fullSyncCompareSnapshot);
  const complete = full.complete === true && full.available === true && full.items.length > 0;

  let dbInventory;
  try {
    dbInventory = await readPersistentIndexItems(context.config || {});
  } catch (err) {
    const code = publicDbError(err).code || 'media_index_upsert_preview_db_read_failed';
    return {
      ok: false,
      httpStatus: 200,
      service: 'remote-modboard',
      module: 'remote_media_index_upsert_preview_readonly',
      moduleVersion: context.appVersion || '0.2.59',
      moduleBuild: BUILD,
      appModuleBuild: context.moduleBuild || null,
      routeBuild: BUILD,
      previousRouteBuild: PREVIOUS_BUILD,
      statusApiVersion: STATUS_API_VERSION,
      previousStatusApiVersion: PREVIOUS_STATUS_API_VERSION,
      route: UPSERT_PREVIEW_ROUTE,
      diffRoute: ROUTE,
      generatedAt,
      readOnly: true,
      writeEnabled: false,
      databaseWritesEnabled: false,
      databaseWriteExecuted: false,
      active: false,
      status: code,
      error: code,
      table: PERSISTENT_INDEX_TABLE,
      candidateCount: null,
      byRoot: {},
      byKind: {},
      previewLimit,
      preview: [],
      safety: buildUpsertPreviewSafety(),
      note: 'Upsert-Preview konnte die Online-DB nicht read-only lesen. Es wurden keine Writes ausgefuehrt.'
    };
  }

  if (!complete) {
    return {
      ok: false,
      httpStatus: 200,
      service: 'remote-modboard',
      module: 'remote_media_index_upsert_preview_readonly',
      moduleVersion: context.appVersion || '0.2.59',
      moduleBuild: BUILD,
      appModuleBuild: context.moduleBuild || null,
      routeBuild: BUILD,
      previousRouteBuild: PREVIOUS_BUILD,
      statusApiVersion: STATUS_API_VERSION,
      previousStatusApiVersion: PREVIOUS_STATUS_API_VERSION,
      route: UPSERT_PREVIEW_ROUTE,
      diffRoute: ROUTE,
      generatedAt,
      readOnly: true,
      writeEnabled: false,
      databaseWritesEnabled: false,
      databaseWriteExecuted: false,
      active: false,
      status: 'full_sync_compare_snapshot_unavailable_or_incomplete',
      fullSyncCompare: {
        prepared: full.prepared === true,
        available: full.available === true,
        complete: full.complete === true,
        syncId: full.syncId || null,
        receivedChunks: full.receivedChunks,
        totalChunks: full.totalChunks,
        receivedItems: full.receivedItems,
        totalItems: full.totalItems,
        itemCount: full.items.length,
        completedAt: full.completedAt
      },
      table: PERSISTENT_INDEX_TABLE,
      candidateCount: null,
      byRoot: {},
      byKind: {},
      previewLimit,
      preview: [],
      safety: buildUpsertPreviewSafety(),
      note: 'Upsert-Preview braucht einen vollstaendigen Full-Sync-Compare-Snapshot. Es wurden keine Writes ausgefuehrt.'
    };
  }

  const candidates = buildUpsertPreviewCandidates({ agentItems: full.items, dbItems: dbInventory.items });
  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_media_index_upsert_preview_readonly',
    moduleVersion: context.appVersion || '0.2.59',
    moduleBuild: BUILD,
    appModuleBuild: context.moduleBuild || null,
    routeBuild: BUILD,
    previousRouteBuild: PREVIOUS_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    previousStatusApiVersion: PREVIOUS_STATUS_API_VERSION,
    route: UPSERT_PREVIEW_ROUTE,
    diffRoute: ROUTE,
    generatedAt,
    readOnly: true,
    writeEnabled: false,
    databaseWritesEnabled: false,
    databaseWriteExecuted: false,
    active: true,
    status: 'media_index_upsert_preview_available_readonly',
    source: 'agent_full_sync_new_on_agent_vs_remote_media_index_readonly',
    table: PERSISTENT_INDEX_TABLE,
    database: {
      table: PERSISTENT_INDEX_TABLE,
      readOnly: true,
      total: dbInventory.total,
      returned: dbInventory.items.length,
      truncated: dbInventory.truncated === true,
      active: dbInventory.items.length > 0
    },
    fullSyncCompare: {
      prepared: full.prepared === true,
      available: full.available === true,
      complete: full.complete === true,
      syncId: full.syncId || null,
      receivedChunks: full.receivedChunks,
      totalChunks: full.totalChunks,
      receivedItems: full.receivedItems,
      totalItems: full.totalItems,
      itemCount: full.items.length,
      completedAt: full.completedAt
    },
    candidateCount: candidates.length,
    candidates,
    byRoot: buildCountByField(candidates, 'rootKey'),
    byKind: buildCountByField(candidates, 'kind'),
    previewLimit,
    preview: candidates.slice(0, previewLimit).map(buildUpsertPreviewItem),
    payloadColumns: [
      'id',
      'root_key',
      'kind',
      'relative_path',
      'name',
      'extension',
      'size_bytes',
      'modified_at',
      'last_seen_at',
      'source'
    ],
    futureWritePolicy: {
      preparedOnly: true,
      readOnly: true,
      requiresSeparateExecuteStep: true,
      requiresLocalRequest: true,
      requiresConfirmWrite: true,
      requiresExpectedCandidateCount: true,
      requiresMediaIndexWriteGates: true,
      requiresAudit: true,
      requiresReadback: true,
      upsertOnly: true,
      noHardDelete: true,
      noPhysicalDelete: true,
      noOnlineToAgentAction: true
    },
    safety: buildUpsertPreviewSafety(),
    note: 'Upsert-Preview zeigt nur neue Full-Sync-Agent-Items, die in remote_media_index fehlen. Es wird nichts geschrieben.'
  };
}


async function executeMediaIndexUpsertFoundation(context = {}, req = null) {
  const generatedAt = new Date().toISOString();
  const body = req && req.body && typeof req.body === 'object' ? req.body : {};
  const base = {
    service: 'remote-modboard',
    module: 'remote_media_index_upsert_with_context_execute',
    moduleVersion: context.appVersion || '0.2.59',
    moduleBuild: BUILD,
    appModuleBuild: context.moduleBuild || null,
    routeBuild: BUILD,
    previousRouteBuild: PREVIOUS_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    previousStatusApiVersion: PREVIOUS_STATUS_API_VERSION,
    route: UPSERT_EXECUTE_ROUTE,
    previewRoute: UPSERT_PREVIEW_ROUTE,
    diffRoute: ROUTE,
    generatedAt,
    readOnly: false,
    localOnly: true,
    writeEnabled: false,
    databaseWritesEnabled: false,
    writeExecuted: false,
    databaseWriteExecuted: false,
    upsertExecuted: false,
    insertExecuted: false,
    updateExecuted: false,
    auditWritten: false,
    readBackPerformed: false,
    noPhysicalDelete: true,
    noHardDelete: true,
    noOnlineToAgentAction: true,
    table: PERSISTENT_INDEX_TABLE,
    requiredConfirmUpsert: CONFIRM_UPSERT_TEXT,
    requiredEnvGates: buildMediaIndexUpsertGateStatus(),
    payloadColumns: buildMediaIndexUpsertPayloadColumns()
  };

  if (!isLocalRequest(req)) {
    return blockedExecute(403, base, 'local_request_required');
  }

  const confirm = requireAdminConfirmWrite({ body });
  if (!confirm.confirmWriteAccepted) {
    return blockedExecute(400, base, 'confirm_write_required', { confirmWriteAccepted: false, confirm });
  }

  const confirmText = String(body.confirmUpsert || body.confirm_upsert || body.confirmText || body.confirm_text || '');
  if (confirmText !== CONFIRM_UPSERT_TEXT) {
    return blockedExecute(400, base, 'confirm_upsert_text_required', {
      confirmWriteAccepted: true,
      requiredConfirmUpsert: CONFIRM_UPSERT_TEXT
    });
  }

  const expectedCandidateCount = Number(body.expectedCandidateCount ?? body.expected_candidate_count);
  if (!Number.isInteger(expectedCandidateCount) || expectedCandidateCount < 0 || expectedCandidateCount > MAX_DB_ROWS) {
    return blockedExecute(400, base, 'expected_candidate_count_required', {
      confirmWriteAccepted: true,
      confirmUpsertAccepted: true,
      expectedCandidateCountAccepted: false
    });
  }

  const expectedRootKey = String(body.expectedRootKey || body.expected_root_key || 'media');
  if (expectedRootKey !== 'media') {
    return blockedExecute(400, base, 'expected_root_key_media_required', {
      confirmWriteAccepted: true,
      confirmUpsertAccepted: true,
      expectedRootKey
    });
  }

  const schemaSnapshot = await buildMediaIndexSchemaExtensionSnapshot(context.config || {});
  if (schemaSnapshot.missingColumnCount !== 0) {
    return blockedExecute(409, base, 'media_index_context_schema_missing', {
      confirmWriteAccepted: true,
      confirmUpsertAccepted: true,
      expectedCandidateCount,
      expectedRootKey,
      schemaSnapshot
    });
  }

  const previewLimit = readPreviewLimit(req);
  const snapshot = await buildMediaIndexUpsertCandidateSnapshot({ context, previewLimit });
  if (!snapshot.reliable) {
    return blockedExecute(409, base, 'media_index_upsert_candidates_unreliable', {
      confirmWriteAccepted: true,
      confirmUpsertAccepted: true,
      expectedCandidateCount,
      expectedRootKey,
      currentCandidateCount: null,
      snapshot
    });
  }

  if (snapshot.candidateCount !== expectedCandidateCount) {
    return blockedExecute(409, base, 'candidate_count_changed', {
      confirmWriteAccepted: true,
      confirmUpsertAccepted: true,
      expectedCandidateCount,
      expectedRootKey,
      currentCandidateCount: snapshot.candidateCount,
      snapshot
    });
  }

  const candidateItems = Array.isArray(snapshot.candidates) ? snapshot.candidates : [];
  if (candidateItems.length !== snapshot.candidateCount) {
    return blockedExecute(409, base, 'media_index_upsert_candidates_array_missing', {
      confirmWriteAccepted: true,
      confirmUpsertAccepted: true,
      expectedCandidateCount,
      expectedRootKey,
      currentCandidateCount: snapshot.candidateCount,
      candidateArrayCount: candidateItems.length,
      databaseWriteExecuted: false,
      upsertExecuted: false,
      snapshot
    });
  }

  const nonMediaCandidates = candidateItems.filter(item => item.rootKey !== 'media');
  if (nonMediaCandidates.length > 0) {
    return blockedExecute(409, base, 'unexpected_non_media_upsert_candidates', {
      confirmWriteAccepted: true,
      confirmUpsertAccepted: true,
      expectedCandidateCount,
      expectedRootKey,
      nonMediaCount: nonMediaCandidates.length,
      preview: nonMediaCandidates.slice(0, DEFAULT_PREVIEW_LIMIT).map(buildUpsertPreviewItem)
    });
  }

  if (!base.requiredEnvGates.allRequiredGatesEnabled) {
    return blockedExecute(403, base, 'media_index_upsert_write_gate_disabled', {
      confirmWriteAccepted: true,
      confirmUpsertAccepted: true,
      expectedCandidateCount,
      expectedRootKey,
      currentCandidateCount: snapshot.candidateCount,
      candidateCount: snapshot.candidateCount,
      byRoot: snapshot.byRoot,
      byKind: snapshot.byKind,
      requiredEnvGates: base.requiredEnvGates,
      snapshot
    });
  }

  if (snapshot.candidateCount <= 0) {
    return {
      status: 200,
      body: {
        ...base,
        ok: true,
        status: 'media_index_upsert_execute_noop_no_candidates',
        confirmWriteAccepted: true,
        confirmUpsertAccepted: true,
        expectedCandidateCount,
        expectedRootKey,
        currentCandidateCount: 0,
        candidateCount: 0,
        writeEnabled: true,
        databaseWritesEnabled: true,
        databaseWriteExecuted: false,
        upsertExecuted: false,
        insertExecuted: false,
        updateExecuted: false,
        auditWritten: false,
        readBackPerformed: true,
        snapshot,
        note: 'Keine Upsert-Kandidaten vorhanden. Es wurde nichts geschrieben.'
      }
    };
  }

  const config = context && context.config ? context.config : {};
  const now = new Date();
  const auditUid = buildAuditUid(now);
  const payloads = candidateItems.map(buildMediaIndexUpsertDbPayload).filter(Boolean);

  try {
    return await withWriteConnection(config, async (connection) => {
      const chunks = chunkArray(payloads, 100);
      let affectedRows = 0;
      let changedRows = 0;
      let warningStatus = 0;

      for (const chunk of chunks) {
        const result = await executeMediaIndexUpsertChunk(connection, chunk);
        affectedRows += safeNonNegativeNumber(result && result.affectedRows);
        changedRows += safeNonNegativeNumber(result && result.changedRows);
        warningStatus += safeNonNegativeNumber(result && result.warningStatus);
      }

      const readBack = await readBackMediaIndexUpsert(connection, payloads.map(item => item.id));
      const safeMetadata = {
        step: BUILD,
        purpose: 'upsert_media_root_items_with_context_columns',
        table: PERSISTENT_INDEX_TABLE,
        expectedCandidateCount,
        candidateCount: snapshot.candidateCount,
        byRoot: snapshot.byRoot,
        byKind: snapshot.byKind,
        payloadColumns: buildMediaIndexUpsertPayloadColumns(),
        affectedRows,
        changedRows,
        warningStatus,
        readBack,
        noDelete: true,
        noPhysicalDelete: true,
        noOnlineToAgentAction: true,
        generatedAt: now.toISOString()
      };

      await connection.execute(
        `INSERT INTO ${AUDIT_TABLE}
          (audit_uid, actor_user_uid, actor_display_name, actor_login, source, action, resource_type,
           permission_key, resource_key, status, error_code, old_value_summary, new_value_summary,
           safe_metadata_json, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          auditUid,
          safeString(body.actorUserUid || body.actor_user_uid || 'system:rdap089-media-index-upsert', 64),
          safeString(body.actorDisplayName || body.actor_display_name || 'RDAP 0.2.89 Media Index Upsert', 120),
          safeString(body.actorLogin || body.actor_login || 'rdap089-media-index-upsert', 128),
          'remote-modboard/rdap089',
          'media_index.upsert.with_context',
          'remote_media_index',
          'media.index.data.upsert',
          'media-index:upsert-context',
          readBack.missingAfterCount === 0 ? 'success' : 'warning',
          null,
          `${snapshot.candidateCount} media root item(s) missing before upsert.`,
          `${readBack.presentAfterCount} item(s) present after upsert with context columns. No delete, no Online-to-Agent action.`,
          JSON.stringify(safeMetadata),
          now
        ]
      );

      return {
        status: 200,
        body: {
          ...base,
          ok: true,
          status: readBack.missingAfterCount === 0
            ? 'media_index_upsert_with_context_execute_success'
            : 'media_index_upsert_with_context_execute_readback_warning',
          confirmWriteAccepted: true,
          confirmUpsertAccepted: true,
          expectedCandidateCount,
          expectedRootKey,
          currentCandidateCount: snapshot.candidateCount,
          candidateCount: snapshot.candidateCount,
          byRoot: snapshot.byRoot,
          byKind: snapshot.byKind,
          writeEnabled: true,
          databaseWritesEnabled: true,
          databaseWriteExecuted: true,
          writeExecuted: true,
          upsertExecuted: true,
          insertExecuted: true,
          updateExecuted: affectedRows > payloads.length,
          auditWritten: true,
          readBackPerformed: true,
          affectedRows,
          changedRows,
          warningStatus,
          readBack,
          preview: snapshot.preview,
          note: 'Media-Index-Upsert wurde gegatet ausgefuehrt. Kontextspalten wurden geschrieben. Keine Deletes, keine Dateiaktion, kein Online-to-Agent.'
        }
      };
    }, { scope: 'media_index_data' });
  } catch (err) {
    const code = publicDbError(err).code || 'media_index_upsert_with_context_execute_failed';
    return blockedExecute(500, base, code, {
      confirmWriteAccepted: true,
      confirmUpsertAccepted: true,
      expectedCandidateCount,
      expectedRootKey,
      currentCandidateCount: snapshot.candidateCount,
      candidateCount: snapshot.candidateCount,
      byRoot: snapshot.byRoot,
      byKind: snapshot.byKind,
      databaseWriteExecuted: false,
      upsertExecuted: false,
      auditWritten: false,
      snapshot,
      error: code
    });
  }
}

async function buildPersistentTombstonePreviewStatus(context = {}, req = null) {
  const diffStatus = await buildMediaIndexDiffStatus(context, req);
  const source = diffStatus && diffStatus.body ? diffStatus.body : diffStatus;
  const generatedAt = new Date().toISOString();

  if (!source || source.ok !== true) {
    return {
      httpStatus: 200,
      ok: false,
      service: 'remote-modboard',
      module: 'remote_media_index_persistent_tombstone_preview',
      moduleVersion: context.appVersion || '0.2.59',
      moduleBuild: BUILD,
      appModuleBuild: context.moduleBuild || null,
      routeBuild: BUILD,
      previousRouteBuild: PREVIOUS_BUILD,
      statusApiVersion: STATUS_API_VERSION,
      previousStatusApiVersion: PREVIOUS_STATUS_API_VERSION,
      route: PERSISTENT_TOMBSTONE_PREVIEW_ROUTE,
      diffRoute: ROUTE,
      generatedAt,
      readOnly: true,
      writeEnabled: false,
      executeRoutePrepared: true,
      databaseWriteExecuted: false,
      softDeleteExecuted: false,
      hardDeleteExecuted: false,
      physicalDeleteExecuted: false,
      noOnlineToAgentAction: true,
      status: source && source.status ? source.status : 'diff_status_unavailable',
      error: source && source.error ? source.error : 'diff_status_unavailable',
      note: 'Persistente Tombstone-Preview konnte den Diff-Status nicht belastbar lesen. Es wurden keine Writes ausgefuehrt.'
    };
  }

  const reliability = source.reliability && typeof source.reliability === 'object' && !Array.isArray(source.reliability) ? source.reliability : {};
  const missingClassification = source.missingClassification && typeof source.missingClassification === 'object' && !Array.isArray(source.missingClassification) ? source.missingClassification : buildMissingClassification([]);
  const previews = source.previews && typeof source.previews === 'object' && !Array.isArray(source.previews) ? source.previews : buildEmptyPreviews();
  const fullSyncCompare = source.fullSyncCompare && typeof source.fullSyncCompare === 'object' && !Array.isArray(source.fullSyncCompare) ? source.fullSyncCompare : {};
  const persistentCandidates = (Array.isArray(previews.tombstoneCandidatesDiagnostic) ? previews.tombstoneCandidatesDiagnostic : [])
    .filter(item => item && item.missingClassification === 'persistent_media_missing_candidate')
    .map(item => ({
      ...item,
      candidateType: 'persistent_media_tombstone_candidate',
      writeAllowed: false,
      executeAllowed: false,
      tombstoneWriteAllowed: false,
      deleteAllowed: false,
      noDatabaseWrite: true,
      noPhysicalDelete: true,
      noOnlineToAgentAction: true
    }));
  const persistentCandidateCount = safeNullableNumber(missingClassification.persistentMediaMissingCandidateCount);
  const missingReliable = reliability.missingOnAgentReliable === true;

  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_media_index_persistent_tombstone_preview',
    moduleVersion: context.appVersion || '0.2.59',
    moduleBuild: BUILD,
      appModuleBuild: context.moduleBuild || null,
    routeBuild: BUILD,
    previousRouteBuild: PREVIOUS_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    previousStatusApiVersion: PREVIOUS_STATUS_API_VERSION,
    route: PERSISTENT_TOMBSTONE_PREVIEW_ROUTE,
    diffRoute: ROUTE,
    generatedAt,
    readOnly: true,
    writeEnabled: false,
    executeRoutePrepared: true,
    databaseWritesEnabled: false,
    databaseWriteExecuted: false,
    tombstoneWritesEnabled: false,
    softDeleteExecuted: false,
    hardDeleteExecuted: false,
    physicalDeleteExecuted: false,
    noOnlineToAgentAction: true,
    active: true,
    status: missingReliable ? 'persistent_tombstone_preview_available' : 'persistent_tombstone_preview_unreliable_input',
    reliability: {
      missingOnAgentReliable: missingReliable,
      fullSyncComparePrepared: reliability.fullSyncComparePrepared === true,
      fullSyncCompareAvailable: reliability.fullSyncCompareAvailable === true,
      fullSyncCompareComplete: reliability.fullSyncCompareComplete === true,
      fullSyncCompareMissingOnAgentReliable: reliability.fullSyncCompareMissingOnAgentReliable === true,
      agentSnapshotTruncated: reliability.agentSnapshotTruncated === true,
      databaseSnapshotTruncated: reliability.databaseSnapshotTruncated === true,
      note: reliability.note || null
    },
    fullSyncCompare: {
      prepared: fullSyncCompare.prepared === true,
      available: fullSyncCompare.available === true,
      complete: fullSyncCompare.complete === true,
      missingOnAgentReliable: fullSyncCompare.missingOnAgentReliable === true,
      syncId: fullSyncCompare.syncId || null,
      receivedChunks: safeNonNegativeNumber(fullSyncCompare.receivedChunks),
      totalChunks: safeNonNegativeNumber(fullSyncCompare.totalChunks),
      receivedItems: safeNonNegativeNumber(fullSyncCompare.receivedItems),
      totalItems: safeNonNegativeNumber(fullSyncCompare.totalItems),
      completedAt: fullSyncCompare.completedAt || null
    },
    counts: {
      missingOnAgentReliable: missingReliable,
      missingOnAgentCount: source.counts && Object.prototype.hasOwnProperty.call(source.counts, 'missingOnAgentCount') ? source.counts.missingOnAgentCount : null,
      persistentMediaMissingCandidateCount: persistentCandidateCount,
      ttsGeneratedTempCandidateCount: safeNullableNumber(missingClassification.ttsGeneratedTempCandidateCount),
      tombstoneCandidateDiagnosticCount: safeNullableNumber(missingClassification.tombstoneCandidateDiagnosticCount),
      previewPersistentCandidateCount: persistentCandidates.length
    },
    previewLimit: source.previewLimit || DEFAULT_PREVIEW_LIMIT,
    preview: {
      persistentTombstoneCandidates: persistentCandidates
    },
    candidatePolicy: {
      readOnly: true,
      requiresReliableFullSyncCompare: true,
      onlyPersistentMedia: true,
      excludesTtsGeneratedTemp: true,
      sourceClassification: 'persistent_media_missing_candidate',
      candidateType: 'persistent_media_tombstone_candidate',
      futureWriteWouldBeSoftDeleteOnly: true,
      futureHardDeleteAllowed: false,
      futurePhysicalDeleteAllowed: false,
      futureOnlineToAgentActionAllowed: false
    },
    futureExecuteRequirements: {
      plannedOnly: false,
      executeRoutePrepared: true,
      requiredBeforeAnyWrite: [
        'separate_execute_step',
        'local_request_only',
        'auth_and_permission_scope',
        'confirmWrite_true',
        'confirm_tombstone_text',
        'expectedCandidateCount_match',
        'MEDIA_INDEX_WRITE_ENABLED=true',
        'MEDIA_INDEX_DATA_WRITE_ENABLED=true',
        'MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=true',
        'audit_log',
        'backup_or_rollback_concept',
        'readback'
      ]
    },
    safety: {
      readOnly: true,
      writesEnabled: false,
      databaseWritesEnabled: false,
      uploadEditDeleteEnabled: false,
      noFileContent: true,
      noAbsolutePaths: true,
      noOnlineToAgentActions: true,
      noAgentTrigger: true,
      noUpsert: true,
      noTimestampWrites: true,
      noTombstoneWrites: true,
      noPhysicalDelete: true,
      noHardDelete: true,
      tombstoneCandidateOnlyDiagnostic: true,
      secretsExposed: false
    },
    nextSteps: [
      'Preview und Execute-Foundation auf Webserver bestaetigen.',
      'Execute schreibt nur bei local-only, Confirm, expectedCandidateCount und expliziten Media-Index-Gates.',
      'Bei candidateCount=0 bleibt Execute ein Noop ohne DB-Write.',
      'Kein Auto-Delete, kein Hard-Delete, kein physisches Loeschen und kein Online->Agent-Trigger.'
    ],
    note: missingReliable
      ? 'Persistente Tombstone-Kandidaten werden read-only aus belastbarem Missing-on-Agent/Full-Sync-Compare abgeleitet. Es wird nichts geschrieben.'
      : 'Persistente Tombstone-Kandidaten werden nicht belastbar abgeleitet, solange Missing-on-Agent nicht verlaesslich ist. Es wird nichts geschrieben.'
  };
}

async function executePersistentTombstoneFoundation(context = {}, req = null) {
  const generatedAt = new Date().toISOString();
  const body = req && req.body && typeof req.body === 'object' ? req.body : {};
  const base = {
    service: 'remote-modboard',
    module: 'remote_media_index_persistent_tombstone_execute_foundation',
    moduleVersion: context.appVersion || '0.2.59',
    moduleBuild: BUILD,
      appModuleBuild: context.moduleBuild || null,
    routeBuild: BUILD,
    previousRouteBuild: PREVIOUS_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    previousStatusApiVersion: PREVIOUS_STATUS_API_VERSION,
    route: PERSISTENT_TOMBSTONE_EXECUTE_ROUTE,
    previewRoute: PERSISTENT_TOMBSTONE_PREVIEW_ROUTE,
    generatedAt,
    readOnly: false,
    localOnly: true,
    writeEnabled: false,
    databaseWritesEnabled: false,
    softDeleteOnly: true,
    hardDeleteExecuted: false,
    physicalDeleteExecuted: false,
    noPhysicalDelete: true,
    noHardDelete: true,
    noOnlineToAgentAction: true,
    mediaIndexGates: buildPersistentTombstoneGateStatus(),
    requiredConfirmTombstone: CONFIRM_PERSISTENT_TOMBSTONE_TEXT
  };

  if (!isLocalRequest(req)) {
    return blockedExecute(403, base, 'local_request_required');
  }

  const confirm = requireAdminConfirmWrite({ body });
  if (!confirm.confirmWriteAccepted) {
    return blockedExecute(400, base, 'confirm_write_required', { confirmWriteAccepted: false, confirm });
  }

  if (String(body.confirmTombstone || body.confirm_tombstone || '') !== CONFIRM_PERSISTENT_TOMBSTONE_TEXT) {
    return blockedExecute(400, base, 'confirm_tombstone_text_required', {
      confirmWriteAccepted: true,
      requiredConfirmTombstone: CONFIRM_PERSISTENT_TOMBSTONE_TEXT
    });
  }

  const expectedCandidateCount = Number(body.expectedCandidateCount ?? body.expected_candidate_count);
  if (!Number.isInteger(expectedCandidateCount) || expectedCandidateCount < 0 || expectedCandidateCount > MAX_DB_ROWS) {
    return blockedExecute(400, base, 'expected_candidate_count_required', {
      confirmWriteAccepted: true,
      expectedCandidateCountAccepted: false
    });
  }

  const previewLimit = readPreviewLimit(req);
  const snapshot = await buildPersistentTombstoneCandidateSnapshot({ context, previewLimit });
  if (!snapshot.reliable) {
    return blockedExecute(409, base, 'persistent_tombstone_candidates_unreliable', {
      confirmWriteAccepted: true,
      expectedCandidateCount,
      currentCandidateCount: null,
      snapshot
    });
  }

  if (snapshot.candidateCount !== expectedCandidateCount) {
    return blockedExecute(409, base, 'candidate_count_changed', {
      confirmWriteAccepted: true,
      expectedCandidateCount,
      currentCandidateCount: snapshot.candidateCount,
      snapshot
    });
  }

  if (!base.mediaIndexGates.allRequiredGatesEnabled) {
    return blockedExecute(403, base, 'media_index_persistent_tombstone_write_gate_disabled', {
      confirmWriteAccepted: true,
      expectedCandidateCount,
      currentCandidateCount: snapshot.candidateCount,
      requiredEnvGates: base.mediaIndexGates.requiredEnvGates,
      snapshot
    });
  }

  if (snapshot.candidateCount <= 0) {
    return {
      status: 200,
      body: {
        ...base,
        ok: true,
        status: 'persistent_tombstone_execute_noop_no_candidates',
        reason: 'no_persistent_tombstone_candidates_to_soft_delete',
        confirmWriteAccepted: true,
        confirmTombstoneAccepted: true,
        expectedCandidateCount,
        currentCandidateCount: 0,
        writeEnabled: true,
        databaseWritesEnabled: true,
        writeExecuted: false,
        databaseWriteExecuted: false,
        softDeleteExecuted: false,
        hardDeleteExecuted: false,
        physicalDeleteExecuted: false,
        auditWritten: false,
        readBackPerformed: true,
        readBackCandidateCount: 0,
        snapshot,
        note: 'Execute-Foundation wurde vollstaendig bestaetigt, aber es gibt keine persistenten Tombstone-Kandidaten. Kein DB-Write wurde ausgefuehrt.'
      }
    };
  }

  const candidateIds = Array.isArray(snapshot.candidateIds) ? snapshot.candidateIds.filter(Boolean) : [];
  const now = new Date();
  const auditUid = buildAuditUid(now);
  const config = context && context.config ? context.config : {};

  try {
    return await withWriteConnection(config, async (connection) => {
      await connection.beginTransaction();
      try {
        const placeholders = candidateIds.map(() => '?').join(', ');
        const [updateResult] = await connection.execute(
          `UPDATE ${PERSISTENT_INDEX_TABLE}
              SET deleted = 1,
                  source = ?,
                  sync_version = sync_version + 1,
                  updated_at = ?
            WHERE id IN (${placeholders})
              AND deleted = 0`,
          ['rdap_0.2.59_persistent_tombstone_soft_delete', now, ...candidateIds]
        );

        const safeMetadata = {
          step: BUILD,
          purpose: 'soft_delete_persistent_missing_media_index_entries',
          table: PERSISTENT_INDEX_TABLE,
          expectedCandidateCount,
          candidateCount: snapshot.candidateCount,
          affectedRows: safeAffectedRows(updateResult),
          physicalDelete: false,
          hardDelete: false,
          onlineToAgentAction: false,
          generatedAt: now.toISOString()
        };

        await connection.execute(
          `INSERT INTO ${AUDIT_TABLE}
            (audit_uid, actor_user_uid, actor_display_name, actor_login, source, action, resource_type,
             permission_key, resource_key, status, error_code, old_value_summary, new_value_summary,
             safe_metadata_json, completed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            auditUid,
            safeString(body.actorUserUid || body.actor_user_uid || 'system:rdap059-persistent-tombstone', 64),
            safeString(body.actorDisplayName || body.actor_display_name || 'RDAP 0.2.59 Persistent Tombstone', 120),
            safeString(body.actorLogin || body.actor_login || 'rdap059-persistent-tombstone', 128),
            'remote-modboard/rdap059',
            'media_index.persistent_missing.soft_delete',
            'remote_media_index',
            'media.index.tombstone.persistent',
            'media-index:persistent-tombstone',
            'success',
            null,
            `${snapshot.candidateCount} persistent missing media-index row(s) before tombstone execute.`,
            `${safeAffectedRows(updateResult)} row(s) soft-deleted via deleted=1. No physical file action, no hard-delete, no Online-to-Agent action.`,
            JSON.stringify(safeMetadata),
            now
          ]
        );

        await connection.commit();

        const readBackSnapshot = await buildPersistentTombstoneCandidateSnapshot({ context, previewLimit });
        return {
          status: 200,
          body: {
            ...base,
            ok: true,
            status: 'persistent_tombstone_soft_delete_executed',
            reason: 'persistent_tombstone_soft_delete_executed',
            confirmWriteAccepted: true,
            confirmTombstoneAccepted: true,
            expectedCandidateCount,
            currentCandidateCountBeforeWrite: snapshot.candidateCount,
            writeEnabled: true,
            databaseWritesEnabled: true,
            writeExecuted: true,
            databaseWriteExecuted: true,
            softDeleteExecuted: true,
            hardDeleteExecuted: false,
            physicalDeleteExecuted: false,
            affectedRows: safeAffectedRows(updateResult),
            auditWritten: true,
            insertedAuditUid: auditUid,
            readBackPerformed: true,
            readBackCandidateCount: readBackSnapshot.candidateCount,
            readBackClean: readBackSnapshot.candidateCount === 0,
            snapshotBeforeWrite: snapshot,
            snapshotAfterWrite: readBackSnapshot,
            note: 'Persistente Missing-Eintraege wurden per deleted=1 als Tombstone soft-deleted. Es gab keinen Hard-Delete, kein physisches Loeschen und keinen Online->Agent-Trigger.'
          }
        };
      } catch (err) {
        try { await connection.rollback(); } catch (rollbackErr) { /* ignore rollback error */ }
        throw err;
      }
    }, { scope: 'media_index_data' });
  } catch (err) {
    const publicError = publicDbError(err).code || 'persistent_tombstone_execute_failed';
    return blockedExecute(500, base, publicError, {
      confirmWriteAccepted: true,
      expectedCandidateCount,
      currentCandidateCount: snapshot.candidateCount,
      writeExecuted: false,
      databaseWriteExecuted: false,
      softDeleteExecuted: false
    });
  }
}

async function buildMediaIndexSchemaExtensionSnapshot(config) {
  return await withReadOnlyConnection(config, async (connection) => {
    const [rows] = await connection.query(
      `SELECT column_name, column_type, is_nullable, column_default
         FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = ?
        ORDER BY ordinal_position`,
      [PERSISTENT_INDEX_TABLE]
    );
    const existingColumns = (Array.isArray(rows) ? rows : []).map(row => String(row.column_name || '').toLowerCase()).filter(Boolean);
    const existingSet = new Set(existingColumns);
    const plannedColumns = MEDIA_INDEX_SCHEMA_EXTENSION_COLUMNS.map(col => ({
      name: col.name,
      definition: col.definition,
      after: col.after,
      exists: existingSet.has(col.name)
    }));
    const missingColumns = plannedColumns.filter(col => col.exists !== true);
    return {
      status: missingColumns.length > 0 ? 'media_index_schema_extension_needed' : 'media_index_schema_extension_not_needed',
      databaseSchema: 'DATABASE()',
      existingColumnCount: existingColumns.length,
      existingColumns,
      plannedColumns,
      missingColumnCount: missingColumns.length,
      missingColumns,
      allColumnsPresent: missingColumns.length === 0,
      alterTablePreview: missingColumns.length > 0 ? buildSchemaExtensionAlterTablePreview(missingColumns) : null,
      readOnly: true,
      writeEnabled: false,
      databaseWriteExecuted: false
    };
  });
}

function buildSchemaExtensionAlterTablePreview(missingColumns) {
  const parts = (Array.isArray(missingColumns) ? missingColumns : [])
    .map(col => `ADD COLUMN ${col.name} ${col.definition} AFTER ${col.after}`);
  return `ALTER TABLE ${PERSISTENT_INDEX_TABLE} ${parts.join(', ')};`;
}

function buildSchemaExtensionAlterTableSql(missingColumns) {
  const allowed = new Map(MEDIA_INDEX_SCHEMA_EXTENSION_COLUMNS.map(col => [col.name, col]));
  const parts = [];
  for (const col of Array.isArray(missingColumns) ? missingColumns : []) {
    const planned = allowed.get(col && col.name);
    if (!planned) continue;
    parts.push(`ADD COLUMN ${planned.name} ${planned.definition} AFTER ${planned.after}`);
  }
  if (parts.length <= 0) {
    const err = new Error('media_index_schema_extension_no_valid_missing_columns');
    err.code = 'media_index_schema_extension_no_valid_missing_columns';
    throw err;
  }
  return `ALTER TABLE ${PERSISTENT_INDEX_TABLE} ${parts.join(', ')}`;
}

function buildMediaIndexSchemaExtensionGateStatus() {
  const requiredEnvGates = [
    'MEDIA_INDEX_WRITE_ENABLED',
    'MEDIA_INDEX_SCHEMA_WRITE_ENABLED'
  ];
  const gates = {};
  for (const key of requiredEnvGates) {
    gates[key] = process.env[key] === 'true';
  }
  return {
    requiredEnvGates,
    gates,
    allRequiredGatesEnabled: requiredEnvGates.every(key => gates[key] === true),
    defaultBlocked: true,
    writeEnabled: false,
    databaseWritesEnabled: false,
    note: 'Schema-Extension ist default blockiert. ALTER TABLE laeuft nur, wenn alle Gates explizit true sind.'
  };
}

function buildSchemaExtensionSafety() {
  return {
    readOnly: true,
    writesEnabled: false,
    databaseWritesEnabled: false,
    databaseWriteExecuted: false,
    schemaWriteExecuted: false,
    alterTableExecuted: false,
    dataMutation: false,
    deletesEnabled: false,
    noPhysicalDelete: true,
    noHardDelete: true,
    noOnlineToAgentAction: true,
    secretsExposed: false
  };
}


async function buildMediaIndexUpsertCandidateSnapshot({ context, previewLimit }) {
  const fullSyncCompareSnapshot = safeBuildFullSyncCompareSnapshotStatus();
  const full = sanitizeFullSyncCompareSnapshot(fullSyncCompareSnapshot);
  const complete = full.complete === true && full.available === true && full.items.length > 0;

  let dbInventory;
  try {
    dbInventory = await readPersistentIndexItems(context && context.config ? context.config : {});
  } catch (err) {
    return {
      reliable: false,
      reason: publicDbError(err).code || 'media_index_upsert_snapshot_db_read_failed',
      candidateCount: null,
      candidates: [],
      byRoot: {},
      byKind: {},
      preview: []
    };
  }

  if (!complete) {
    return {
      reliable: false,
      reason: 'full_sync_compare_snapshot_unavailable_or_incomplete',
      candidateCount: null,
      candidates: [],
      byRoot: {},
      byKind: {},
      preview: [],
      fullSyncCompare: {
        prepared: full.prepared === true,
        available: full.available === true,
        complete: full.complete === true,
        receivedItems: full.receivedItems,
        totalItems: full.totalItems,
        itemCount: full.items.length,
        completedAt: full.completedAt
      }
    };
  }

  const candidates = buildUpsertPreviewCandidates({ agentItems: full.items, dbItems: dbInventory.items });
  return {
    reliable: true,
    reason: 'media_index_upsert_candidates_available',
    readOnly: true,
    writeEnabled: false,
    databaseWriteExecuted: false,
    table: PERSISTENT_INDEX_TABLE,
    candidateCount: candidates.length,
    byRoot: buildCountByField(candidates, 'rootKey'),
    byKind: buildCountByField(candidates, 'kind'),
    candidateIds: candidates.map(item => item.id).filter(Boolean),
    preview: candidates.slice(0, previewLimit || DEFAULT_PREVIEW_LIMIT).map(buildUpsertPreviewItem),
    fullSyncCompare: {
      prepared: full.prepared === true,
      available: full.available === true,
      complete: full.complete === true,
      syncId: full.syncId || null,
      receivedItems: full.receivedItems,
      totalItems: full.totalItems,
      itemCount: full.items.length,
      completedAt: full.completedAt
    },
    database: {
      table: PERSISTENT_INDEX_TABLE,
      readOnly: true,
      total: dbInventory.total,
      returned: dbInventory.items.length,
      truncated: dbInventory.truncated === true,
      active: dbInventory.items.length > 0
    }
  };
}

function buildMediaIndexUpsertPayloadColumns() {
  return [
    'id',
    'root_key',
    'kind',
    'relative_path',
    'name',
    'extension',
    'size_bytes',
    'modified_at',
    'last_seen_at',
    'source',
    'module_key',
    'category_key',
    'full_category_key',
    'asset_relative_path',
    'web_path',
    'public_path'
  ];
}

function buildMediaIndexUpsertDbPayload(item) {
  const safe = sanitizeMediaItem(item);
  if (!safe) return null;
  return {
    id: safeString(safe.id, 260),
    root_key: safeString(safe.rootKey, 40),
    kind: safeString(safe.kind, 20),
    relative_path: safeString(safe.relativePath, 500),
    name: safeString(safe.name, 180),
    extension: safeString(safe.extension, 20),
    size_bytes: safeNonNegativeNumber(safe.sizeBytes),
    modified_at: safe.modifiedAt ? new Date(safe.modifiedAt) : null,
    last_seen_at: new Date(),
    source: safeString(safe.source || 'media_system', 80),
    module_key: safe.moduleKey ? safeString(safe.moduleKey, 80) : null,
    category_key: safe.categoryKey ? safeString(safe.categoryKey, 120) : null,
    full_category_key: safe.fullCategoryKey ? safeString(safe.fullCategoryKey, 220) : null,
    asset_relative_path: safe.assetRelativePath ? safeString(safe.assetRelativePath, 500) : null,
    web_path: safe.webPath ? safeString(safe.webPath, 700) : null,
    public_path: safe.publicPath ? safeString(safe.publicPath, 700) : null
  };
}

async function executeMediaIndexUpsertChunk(connection, payloads) {
  const columns = buildMediaIndexUpsertPayloadColumns();
  const rowPlaceholder = `(${columns.map(() => '?').join(', ')}, 0, 1, NOW())`;
  const placeholders = payloads.map(() => rowPlaceholder).join(', ');
  const values = [];
  for (const item of payloads) {
    for (const col of columns) values.push(item[col]);
  }

  const updateColumns = columns.filter(col => col !== 'id');
  const sql = `INSERT INTO ${PERSISTENT_INDEX_TABLE}
      (${columns.join(', ')}, deleted, sync_version, updated_at)
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      ${updateColumns.map(col => `${col} = VALUES(${col})`).join(', ')},
      deleted = 0,
      sync_version = sync_version + 1,
      updated_at = NOW()`;

  const [result] = await connection.execute(sql, values);
  return result || {};
}

async function readBackMediaIndexUpsert(connection, ids) {
  const safeIds = Array.from(new Set((Array.isArray(ids) ? ids : []).map(id => safeString(id, 260)).filter(Boolean)));
  if (safeIds.length <= 0) {
    return {
      expectedCount: 0,
      presentAfterCount: 0,
      missingAfterCount: 0,
      byRoot: {},
      byKind: {},
      byModule: {},
      byFullCategory: {}
    };
  }

  const chunks = chunkArray(safeIds, 200);
  let presentAfterCount = 0;
  const byRoot = {};
  const byKind = {};
  const byModule = {};
  const byFullCategory = {};

  for (const chunk of chunks) {
    const placeholders = chunk.map(() => '?').join(', ');
    const [rows] = await connection.query(
      `SELECT root_key, kind, module_key, full_category_key, COUNT(*) AS count_value
         FROM ${PERSISTENT_INDEX_TABLE}
        WHERE deleted = 0
          AND id IN (${placeholders})
        GROUP BY root_key, kind, module_key, full_category_key`,
      chunk
    );

    for (const row of Array.isArray(rows) ? rows : []) {
      const countValue = safeNonNegativeNumber(row.count_value);
      presentAfterCount += countValue;
      addCount(byRoot, row.root_key || 'unknown', countValue);
      addCount(byKind, row.kind || 'unknown', countValue);
      addCount(byModule, row.module_key || 'uncategorized', countValue);
      addCount(byFullCategory, row.full_category_key || 'uncategorized', countValue);
    }
  }

  return {
    expectedCount: safeIds.length,
    presentAfterCount,
    missingAfterCount: Math.max(0, safeIds.length - presentAfterCount),
    byRoot,
    byKind,
    byModule,
    byFullCategory
  };
}

function chunkArray(items, size) {
  const safeSize = Math.max(1, Number(size) || 100);
  const chunks = [];
  for (let i = 0; i < (Array.isArray(items) ? items.length : 0); i += safeSize) {
    chunks.push(items.slice(i, i + safeSize));
  }
  return chunks;
}

function addCount(target, key, count) {
  const safeKey = String(key || 'unknown');
  target[safeKey] = safeNonNegativeNumber(target[safeKey]) + safeNonNegativeNumber(count);
}


function buildMediaIndexUpsertGateStatus() {
  const requiredEnvGates = [
    'MEDIA_INDEX_WRITE_ENABLED',
    'MEDIA_INDEX_DATA_WRITE_ENABLED',
    'MEDIA_INDEX_UPSERT_WRITE_ENABLED'
  ];
  const gates = {};
  for (const key of requiredEnvGates) {
    gates[key] = process.env[key] === 'true';
  }
  return {
    requiredEnvGates,
    gates,
    allRequiredGatesEnabled: requiredEnvGates.every(key => gates[key] === true),
    defaultBlocked: true,
    writeEnabled: false,
    databaseWritesEnabled: false,
    note: 'Alle Data-Upsert-Gates muessen explizit true sein. 0.2.90 behebt Candidate-Array-Readback und schreibt nur remote_media_index-Zeilen, keine Dateien und keine Deletes.'
  };
}


async function buildPersistentTombstoneCandidateSnapshot({ context = {}, previewLimit = DEFAULT_PREVIEW_LIMIT } = {}) {
  const full = sanitizeFullSyncCompareSnapshot(safeBuildFullSyncCompareSnapshotStatus());
  const dbInventory = await readPersistentIndexItems(context.config || {});
  const fullReliable = full.complete === true && full.available === true && full.truncated !== true && dbInventory.truncated !== true;
  const fullIds = new Set(full.items.map(item => item.id).filter(Boolean));
  const candidates = [];
  if (fullReliable) {
    for (const dbItem of dbInventory.items) {
      if (fullIds.has(dbItem.id)) continue;
      const classified = classifyMissingItem(dbItem);
      if (!classified || classified.ttsGeneratedTempCandidate === true) continue;
      candidates.push({
        ...classified,
        candidateType: 'persistent_media_tombstone_candidate',
        writeAllowed: true,
        executeAllowed: true,
        tombstoneWriteAllowed: true,
        deleteAllowed: false,
        softDeleteOnly: true,
        noPhysicalDelete: true,
        noHardDelete: true,
        noOnlineToAgentAction: true
      });
    }
  }
  return {
    prepared: true,
    build: BUILD,
    readOnly: true,
    reliable: fullReliable,
    fullSyncCompareComplete: full.complete === true,
    fullSyncCompareAvailable: full.available === true,
    fullSyncCompareTruncated: full.truncated === true,
    databaseSnapshotTruncated: dbInventory.truncated === true,
    databaseTotal: dbInventory.total,
    fullSyncItemCount: full.items.length,
    candidateCount: fullReliable ? candidates.length : null,
    candidateIds: fullReliable ? candidates.map(item => item.id).filter(Boolean) : [],
    candidates: candidates.slice(0, previewLimit).map(safePreviewItem),
    allCandidateIdsReturned: fullReliable ? candidates.length <= previewLimit : false,
    noFileContent: true,
    noAbsolutePaths: true,
    noOnlineToAgentAction: true,
    noPhysicalDelete: true
  };
}

function blockedExecute(status, base, reason, extra = {}) {
  return {
    status,
    body: {
      ...base,
      ...extra,
      ok: false,
      status: reason,
      reason,
      error: reason,
      writeExecuted: false,
      databaseWriteExecuted: false,
      softDeleteExecuted: false,
      hardDeleteExecuted: false,
      physicalDeleteExecuted: false,
      readBackPerformed: false
    }
  };
}

function buildPersistentTombstoneGateStatus() {
  const mediaIndexWriteEnabled = readBooleanEnv('MEDIA_INDEX_WRITE_ENABLED');
  const mediaIndexDataWriteEnabled = readBooleanEnv('MEDIA_INDEX_DATA_WRITE_ENABLED');
  const persistentTombstoneWriteEnabled = readBooleanEnv('MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED');
  return {
    mediaIndexWriteEnabled,
    mediaIndexDataWriteEnabled,
    persistentTombstoneWriteEnabled,
    allRequiredGatesEnabled: mediaIndexWriteEnabled && mediaIndexDataWriteEnabled && persistentTombstoneWriteEnabled,
    requiredEnvGates: [
      'MEDIA_INDEX_WRITE_ENABLED=true',
      'MEDIA_INDEX_DATA_WRITE_ENABLED=true',
      'MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=true'
    ]
  };
}

function isLocalRequest(req) {
  const ip = String((req && (req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress)) || '');
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip.endsWith(':127.0.0.1');
}

function readBooleanEnv(name) {
  const value = String(process.env[name] || '').trim().toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function safeAffectedRows(result) {
  const raw = result && (result.affectedRows ?? result.changedRows ?? result.rowCount);
  return safeNonNegativeNumber(raw);
}

function buildAuditUid(now) {
  const suffix = crypto.randomBytes(6).toString('hex');
  const stamp = now.toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  return `audit:rdap059:persistent_tombstone:${stamp}:${suffix}`;
}

function safeString(value, maxLength = 255) {
  return String(value || '').replace(/[\u0000-\u001f]/g, '').slice(0, Math.max(1, maxLength));
}

function safeBuildAgentMediaInventoryStatus() {
  try {
    if (typeof buildAgentMediaInventoryStatusResponse !== 'function') return null;
    return buildAgentMediaInventoryStatusResponse();
  } catch (err) {
    return null;
  }
}

function safeBuildAgentConnectionSummary() {
  try {
    if (typeof buildAgentConnectionSummary !== 'function') return {};
    return buildAgentConnectionSummary() || {};
  } catch (err) {
    return {};
  }
}

function safeBuildFullSyncCompareSnapshotStatus() {
  try {
    if (typeof buildMediaFullSyncCompareSnapshotStatusResponse !== 'function') return null;
    return buildMediaFullSyncCompareSnapshotStatusResponse();
  } catch (err) {
    return null;
  }
}

function sanitizeAgentInventory(agentStatus, connectionSummary = {}) {
  const status = agentStatus && typeof agentStatus === 'object' && !Array.isArray(agentStatus) ? agentStatus : {};
  const inventory = status.inventory && typeof status.inventory === 'object' && !Array.isArray(status.inventory) ? status.inventory : {};
  const rawItems = Array.isArray(inventory.items) ? inventory.items : [];
  const items = rawItems.map(sanitizeMediaItem).filter(Boolean);
  const counts = inventory.counts && typeof inventory.counts === 'object' && !Array.isArray(inventory.counts) ? inventory.counts : {};
  const totalSeen = safeNonNegativeNumber(counts.totalSeen || counts.total || rawItems.length);
  const returned = safeNonNegativeNumber(counts.returned || items.length);
  const summary = connectionSummary && typeof connectionSummary === 'object' && !Array.isArray(connectionSummary) ? connectionSummary : {};
  return {
    active: status.active === true || inventory.active === true || items.length > 0,
    connected: Boolean((status.agent && status.agent.connected === true) || summary.connected === true),
    connectionState: safeStatus((status.agent && status.agent.connectionState) || summary.connectionState || ''),
    lastSeenAt: safeIsoOrNull((status.agent && status.agent.lastSeenAt) || summary.lastSeenAt),
    lastHeartbeatAt: safeIsoOrNull((status.agent && status.agent.lastHeartbeatAt) || summary.lastHeartbeatAt),
    heartbeatAgeMs: safeNullableNumber((status.agent && status.agent.heartbeatAgeMs) || summary.heartbeatAgeMs),
    stale: Boolean((status.agent && status.agent.stale === true) || summary.stale === true),
    lastMediaInventorySyncAt: safeIsoOrNull((status.agent && status.agent.lastMediaInventorySyncAt) || summary.lastMediaInventorySyncAt),
    mediaInventorySyncSeq: safeNullableNumber(summary.mediaInventorySyncSeq),
    mediaInventorySyncRejectCount: safeNonNegativeNumber(summary.mediaInventorySyncRejectCount),
    lastMediaInventorySyncRejectAt: safeIsoOrNull(summary.lastMediaInventorySyncRejectAt),
    lastMediaInventorySyncRejectReason: safeReason(summary.lastMediaInventorySyncRejectReason),
    mediaFullSync: sanitizeMediaFullSync(summary.mediaFullSync),
    source: safeStatus(inventory.source || 'agent_memory'),
    items,
    returned: returned || items.length,
    totalSeen: Math.max(totalSeen, items.length),
    truncated: inventory.truncated === true || totalSeen > items.length || rawItems.length > items.length,
    hasMore: inventory.hasMore === true
  };
}

function buildAgentSnapshotDiagnostic({ agentInventory, connectionSummary }) {
  const inventory = agentInventory && typeof agentInventory === 'object' && !Array.isArray(agentInventory) ? agentInventory : {};
  const connection = connectionSummary && typeof connectionSummary === 'object' && !Array.isArray(connectionSummary) ? connectionSummary : {};
  const connected = inventory.connected === true || connection.connected === true;
  const itemCount = Array.isArray(inventory.items) ? inventory.items.length : 0;
  const lastMediaInventorySyncAt = inventory.lastMediaInventorySyncAt || safeIsoOrNull(connection.lastMediaInventorySyncAt);
  const rejectCount = safeNonNegativeNumber(inventory.mediaInventorySyncRejectCount || connection.mediaInventorySyncRejectCount);
  const lastRejectReason = safeReason(inventory.lastMediaInventorySyncRejectReason || connection.lastMediaInventorySyncRejectReason);
  const fullSync = sanitizeMediaFullSync(inventory.mediaFullSync || connection.mediaFullSync);
  const active = inventory.active === true;
  let reason = 'agent_snapshot_available';

  if (!connected) reason = 'agent_not_connected';
  else if (rejectCount > 0 && !lastMediaInventorySyncAt && lastRejectReason) reason = 'media_inventory_rejected';
  else if (!lastMediaInventorySyncAt) reason = 'media_inventory_not_received_since_restart';
  else if (!active || itemCount <= 0) reason = 'media_inventory_empty';

  const available = reason === 'agent_snapshot_available';

  return {
    prepared: true,
    build: BUILD,
    readOnly: true,
    available,
    reason,
    agentConnected: connected,
    connectionState: safeStatus(inventory.connectionState || connection.connectionState || ''),
    lastSeenAt: inventory.lastSeenAt || safeIsoOrNull(connection.lastSeenAt),
    lastHeartbeatAt: inventory.lastHeartbeatAt || safeIsoOrNull(connection.lastHeartbeatAt),
    heartbeatAgeMs: safeNullableNumber(inventory.heartbeatAgeMs || connection.heartbeatAgeMs),
    stale: inventory.stale === true || connection.stale === true,
    mediaInventoryActive: active,
    mediaInventoryItems: itemCount,
    mediaInventoryReturned: safeNonNegativeNumber(inventory.returned || itemCount),
    mediaInventoryTotalSeen: safeNonNegativeNumber(inventory.totalSeen || itemCount),
    mediaInventoryTruncated: inventory.truncated === true,
    lastMediaInventorySyncAt,
    mediaInventorySyncSeq: safeNullableNumber(inventory.mediaInventorySyncSeq || connection.mediaInventorySyncSeq),
    mediaInventoryRejectCount: rejectCount,
    lastMediaInventoryRejectAt: inventory.lastMediaInventorySyncRejectAt || safeIsoOrNull(connection.lastMediaInventorySyncRejectAt),
    lastMediaInventoryRejectReason: lastRejectReason,
    mediaFullSync: fullSync,
    noAgentActionTriggered: true,
    noOnlineToAgentAction: true,
    noDatabaseWrite: true,
    note: diagnosticNote(reason)
  };
}

function diagnosticNote(reason) {
  if (reason === 'agent_not_connected') return 'Agent ist nicht verbunden; der In-Memory-Snapshot kann nach Restart/Deploy leer sein.';
  if (reason === 'media_inventory_rejected') return 'Media-Inventory wurde nicht akzeptiert oder zuletzt abgelehnt; Reject-Grund pruefen.';
  if (reason === 'media_inventory_not_received_since_restart') return 'Seit dem letzten Webserver-Start wurde noch kein Media-Inventory-Snapshot empfangen.';
  if (reason === 'media_inventory_empty') return 'Agent-Verbindung ist vorhanden, aber der Media-Inventory-Snapshot enthaelt keine Items.';
  return 'Agent-Snapshot ist fuer Diff-Auswertung vorhanden.';
}

function buildFullSyncCompareStatus({ snapshot, dbInventory, previewLimit }) {
  const full = sanitizeFullSyncCompareSnapshot(snapshot);
  const db = dbInventory && typeof dbInventory === 'object' && !Array.isArray(dbInventory) ? dbInventory : { items: [], total: 0, truncated: false };
  const dbItems = Array.isArray(db.items) ? db.items : [];
  const complete = full.complete === true && full.available === true && full.items.length > 0;
  const base = {
    prepared: true,
    build: BUILD,
    previousBuild: PREVIOUS_BUILD,
    readOnly: true,
    inMemoryOnly: true,
    persistsToDatabase: false,
    source: 'agent_full_sync_readonly_memory_snapshot',
    available: complete,
    complete: full.complete === true,
    status: complete ? 'full_sync_compare_available' : full.status,
    reason: complete ? 'full_sync_compare_snapshot_complete' : 'full_sync_compare_snapshot_unavailable_or_incomplete',
    syncId: full.syncId,
    receivedChunks: full.receivedChunks,
    totalChunks: full.totalChunks,
    receivedItems: full.receivedItems,
    totalItems: full.totalItems,
    items: full.items.length,
    itemCount: full.items.length,
    truncated: full.truncated === true,
    startedAt: full.startedAt,
    lastChunkAt: full.lastChunkAt,
    completedAt: full.completedAt,
    missingOnAgentReliable: false,
    noDatabaseWrite: true,
    noAgentActionTriggered: true,
    noOnlineToAgentAction: true,
    noFileContent: true,
    noAbsolutePaths: true,
    uploadEditDeleteEnabled: false
  };
  if (!complete) {
    return {
      ...base,
      counts: buildEmptyCounts(),
      missingClassification: buildMissingClassification([]),
      previews: buildEmptyPreviews()
    };
  }
  const diff = buildDiff({
    agentItems: full.items,
    dbItems,
    previewLimit,
    agentTruncated: full.truncated,
    agentSnapshotUnavailable: false,
    dbTruncated: db.truncated === true
  });
  return {
    ...base,
    status: diff.counts.missingOnAgentReliable ? 'full_sync_compare_available_missing_reliable' : 'full_sync_compare_available_missing_unreliable',
    matchedCount: diff.counts.matchedCount,
    newOnAgentCount: diff.counts.newOnAgentCount,
    changedOnAgentCount: diff.counts.changedOnAgentCount,
    hardChangedOnAgentCount: diff.counts.hardChangedOnAgentCount,
    effectiveChangedOnAgentCount: diff.counts.effectiveChangedOnAgentCount,
    softModifiedAtOnlyCount: diff.counts.softModifiedAtOnlyCount,
    missingOnAgentCount: diff.counts.missingOnAgentCount,
    missingOnAgentReliable: diff.counts.missingOnAgentReliable,
    databaseTotal: db.total || dbItems.length,
    databaseReturned: dbItems.length,
    databaseTruncated: db.truncated === true,
    counts: diff.counts,
    missingClassification: diff.missingClassification,
    previews: diff.previews
  };
}

async function readPersistentIndexItems(config) {
  return await withReadOnlyConnection(config, async (connection) => {
    const [rows] = await connection.query(
      `SELECT id, root_key, kind, relative_path, name, extension, size_bytes, modified_at, last_seen_at, source, sync_version,
              module_key, category_key, full_category_key, asset_relative_path, web_path, public_path
       FROM ${PERSISTENT_INDEX_TABLE}
       WHERE deleted = 0
       ORDER BY root_key ASC, relative_path ASC
       LIMIT ?`,
      [MAX_DB_ROWS]
    );
    const [countRows] = await connection.query(`SELECT COUNT(*) AS total_count FROM ${PERSISTENT_INDEX_TABLE} WHERE deleted = 0`);
    const items = (Array.isArray(rows) ? rows : []).map(sanitizePersistentIndexItem).filter(Boolean);
    const total = safeNonNegativeNumber(countRows && countRows[0] && countRows[0].total_count ? countRows[0].total_count : items.length);
    return { items, total, truncated: total > items.length };
  });
}

function buildDiff({ agentItems, dbItems, previewLimit, agentTruncated, agentSnapshotUnavailable, dbTruncated }) {
  const agentById = indexById(agentItems);
  const dbById = indexById(dbItems);
  const newOnAgent = [];
  const changedOnAgent = [];
  const softChangedOnAgent = [];
  const effectiveChangedOnAgent = [];
  const unchanged = [];
  const compareStats = { metadataCompareWarnings: 0, changeReasonCounts: {}, modifiedAtDeltasMs: [], hardChangedOnAgentCount: 0, softModifiedAtOnlyCount: 0 };

  for (const agentItem of agentById.values()) {
    const dbItem = dbById.get(agentItem.id);
    if (!dbItem) {
      newOnAgent.push(agentItem);
      continue;
    }
    const change = compareMediaItems(agentItem, dbItem);
    addCompareStats(compareStats, change);
    if (change.changed) {
      const changedItem = { ...agentItem, changeReasons: change.reasons, metadataWarnings: change.warnings, compareDetails: change.details, changeClass: change.changeClass, modifiedAtOffsetBucket: change.modifiedAtOffsetBucket };
      changedOnAgent.push(changedItem);
      if (change.changeClass === 'soft_modified_at_offset_only') softChangedOnAgent.push(changedItem);
      else effectiveChangedOnAgent.push(changedItem);
    } else {
      unchanged.push(change.warnings.length ? { ...agentItem, metadataWarnings: change.warnings } : agentItem);
    }
  }

  const missingOnAgentReliable = !agentSnapshotUnavailable && !agentTruncated && !dbTruncated;
  const missingOnAgent = [];
  if (missingOnAgentReliable) {
    for (const dbItem of dbById.values()) {
      if (!agentById.has(dbItem.id)) missingOnAgent.push(classifyMissingItem(dbItem));
    }
  }
  const missingClassification = buildMissingClassification(missingOnAgent);
  const matchedCount = unchanged.length + changedOnAgent.length;

  return {
    counts: {
      agentTotal: agentItems.length,
      remoteDbTotal: dbItems.length,
      matchedCount,
      newOnAgentCount: newOnAgent.length,
      changedOnAgentCount: changedOnAgent.length,
      strictChangedOnAgentCount: changedOnAgent.length,
      hardChangedOnAgentCount: compareStats.hardChangedOnAgentCount,
      effectiveChangedOnAgentCount: compareStats.hardChangedOnAgentCount,
      softChangedOnAgentCount: compareStats.softModifiedAtOnlyCount,
      softModifiedAtOnlyCount: compareStats.softModifiedAtOnlyCount,
      effectiveNoopChangedOnAgentCount: compareStats.softModifiedAtOnlyCount,
      missingOnAgentCount: missingOnAgentReliable ? missingOnAgent.length : null,
      missingOnAgentReliable,
      newOnAgentByRoot: buildCountByField(newOnAgent, 'rootKey'),
      newOnAgentByKind: buildCountByField(newOnAgent, 'kind'),
      matchedByRoot: buildCountByField([...unchanged, ...changedOnAgent], 'rootKey'),
      matchedByKind: buildCountByField([...unchanged, ...changedOnAgent], 'kind'),
      changedOnAgentByRoot: buildCountByField(changedOnAgent, 'rootKey'),
      changedOnAgentByKind: buildCountByField(changedOnAgent, 'kind'),
      softChangedOnAgentByRoot: buildCountByField(softChangedOnAgent, 'rootKey'),
      effectiveChangedOnAgentByRoot: buildCountByField(effectiveChangedOnAgent, 'rootKey'),
      missingOnAgentByRoot: missingOnAgentReliable ? buildCountByField(missingOnAgent, 'rootKey') : null,
      missingOnAgentByKind: missingOnAgentReliable ? buildCountByField(missingOnAgent, 'kind') : null,
      remoteDbByRoot: buildCountByField(dbItems, 'rootKey'),
      remoteDbByKind: buildCountByField(dbItems, 'kind'),
      agentByRoot: buildCountByField(agentItems, 'rootKey'),
      agentByKind: buildCountByField(agentItems, 'kind'),
      ttsTempMissingCandidateCount: missingOnAgentReliable ? missingClassification.ttsGeneratedTempCandidateCount : null,
      tombstoneCandidateDiagnosticCount: missingOnAgentReliable ? missingClassification.tombstoneCandidateDiagnosticCount : null,
      agentSnapshotUnavailable: agentSnapshotUnavailable === true,
      unchangedCount: unchanged.length,
      strictUnchangedCount: unchanged.length,
      effectiveUnchangedCount: unchanged.length + compareStats.softModifiedAtOnlyCount,
      comparableAgentItems: agentItems.length,
      metadataCompareWarnings: compareStats.metadataCompareWarnings,
      changeReasonCounts: compareStats.changeReasonCounts,
      modifiedAtDeltaStats: buildModifiedAtDeltaStats(compareStats.modifiedAtDeltasMs),
      readOnly: true,
      writesEnabled: false
    },
    missingClassification,
    previews: {
      newOnAgent: newOnAgent.slice(0, previewLimit).map(safePreviewItem),
      changedOnAgent: changedOnAgent.slice(0, previewLimit).map(safePreviewItem),
      strictChangedOnAgent: changedOnAgent.slice(0, previewLimit).map(safePreviewItem),
      softChangedOnAgent: softChangedOnAgent.slice(0, previewLimit).map(safePreviewItem),
      effectiveChangedOnAgent: effectiveChangedOnAgent.slice(0, previewLimit).map(safePreviewItem),
      missingOnAgent: missingOnAgentReliable ? missingOnAgent.slice(0, previewLimit).map(safePreviewItem) : [],
      ttsTempMissingCandidates: missingOnAgentReliable ? missingOnAgent.filter(item => item.ttsGeneratedTempCandidate === true).slice(0, previewLimit).map(safePreviewItem) : [],
      tombstoneCandidatesDiagnostic: missingOnAgentReliable ? missingOnAgent.filter(item => item.tombstoneCandidateDiagnostic === true).slice(0, previewLimit).map(safePreviewItem) : [],
      unchanged: unchanged.slice(0, previewLimit).map(safePreviewItem)
    }
  };
}


function buildUpsertPreviewCandidates({ agentItems, dbItems }) {
  const dbById = indexById(dbItems);
  const candidates = [];
  for (const item of Array.isArray(agentItems) ? agentItems : []) {
    const safe = sanitizeMediaItem(item);
    if (!safe || dbById.has(safe.id)) continue;
    candidates.push(safe);
  }
  return candidates;
}

function buildUpsertPreviewItem(item) {
  const safe = sanitizeMediaItem(item);
  if (!safe) return null;
  return {
    id: safe.id,
    rootKey: safe.rootKey,
    kind: safe.kind,
    relativePath: safe.relativePath,
    name: safe.name,
    extension: safe.extension,
    sizeBytes: safe.sizeBytes,
    modifiedAt: safe.modifiedAt,
    lastSeenAt: safe.lastSeenAt,
    source: safe.source || null,
    moduleKey: safe.moduleKey || null,
    categoryKey: safe.categoryKey || null,
    fullCategoryKey: safe.fullCategoryKey || null,
    assetRelativePath: safe.assetRelativePath || null,
    webPath: safe.webPath || null,
    publicPath: safe.publicPath || null,
    dbPayload: {
      id: safe.id,
      root_key: safe.rootKey,
      kind: safe.kind,
      relative_path: safe.relativePath,
      name: safe.name,
      extension: safe.extension,
      size_bytes: safe.sizeBytes,
      modified_at: safe.modifiedAt,
      last_seen_at: safe.lastSeenAt,
      source: safe.source || 'agent_full_sync_upsert_preview'
    },
    writeEnabled: false,
    databaseWriteExecuted: false
  };
}

function buildUpsertPreviewSafety() {
  return {
    readOnly: true,
    writesEnabled: false,
    databaseWritesEnabled: false,
    databaseWriteExecuted: false,
    noInsert: true,
    noUpdate: true,
    noDelete: true,
    noHardDelete: true,
    noPhysicalDelete: true,
    noOnlineToAgentAction: true,
    noAgentTrigger: true,
    noFileContent: true,
    noAbsolutePaths: true,
    previewOnly: true
  };
}


function classifyMissingItem(item) {
  const safe = sanitizeMediaItem(item);
  if (!safe) return null;
  const relativePath = String(safe.relativePath || '').replace(/\\/g, '/').toLowerCase();
  const isTtsGeneratedTempCandidate = safe.rootKey === TTS_TEMP_ROOT_KEY
    && relativePath.startsWith(TTS_TEMP_PREFIX)
    && MEDIA_AUDIO_EXTENSIONS.has(safe.extension);
  const classification = isTtsGeneratedTempCandidate ? TTS_EXCLUDED_LEGACY_CLASSIFICATION : 'persistent_media_missing_candidate';
  return {
    ...safe,
    missingClassification: classification,
    ttsGeneratedTempCandidate: isTtsGeneratedTempCandidate,
    ttsGeneratedExcludedFromSyncLegacy: isTtsGeneratedTempCandidate,
    excludedFromSyncLegacy: isTtsGeneratedTempCandidate,
    temporaryFileCandidate: isTtsGeneratedTempCandidate,
    tombstoneCandidateDiagnostic: true,
    tombstoneWriteAllowed: false,
    deleteAllowed: false,
    noDatabaseWrite: true,
    noPhysicalDelete: true,
    noOnlineToAgentAction: true
  };
}

function buildCountByField(items, fieldName) {
  const counts = {};
  for (const item of Array.isArray(items) ? items : []) {
    const key = safeStatus(item && item[fieldName]) || 'unknown';
    counts[key] = safeNonNegativeNumber(counts[key]) + 1;
  }
  return counts;
}

function buildMissingClassification(items) {
  const list = (Array.isArray(items) ? items : []).filter(Boolean);
  const ttsGeneratedTempCandidateCount = list.filter(item => item.ttsGeneratedTempCandidate === true).length;
  const persistentMediaMissingCandidateCount = list.filter(item => item.ttsGeneratedTempCandidate !== true).length;
  return {
    prepared: true,
    build: BUILD,
    readOnly: true,
    reliableInputRequired: true,
    missingOnAgentItems: list.length,
    ttsGeneratedTempCandidateCount,
    ttsGeneratedExcludedFromSyncLegacyCount: ttsGeneratedTempCandidateCount,
    persistentMediaMissingCandidateCount,
    tombstoneCandidateDiagnosticCount: list.length,
    tombstoneWritesEnabled: false,
    deleteEnabled: false,
    databaseWritesEnabled: false,
    noOnlineToAgentAction: true,
    rules: [
      {
        key: TTS_EXCLUDED_LEGACY_CLASSIFICATION,
        rootKey: TTS_TEMP_ROOT_KEY,
        relativePathPrefix: TTS_TEMP_PREFIX,
        audioOnly: true,
        excludedFromAgentSyncSinceBuild: BUILD,
        meaning: 'DB kennt eine alte TTS-generated-Datei. Diese Dateien sind temporaer und werden ab 0.2.58K nicht mehr vom Agent-Media-Inventory/Full-Sync synchronisiert. Das bleibt reine Legacy-Diagnose.'
      },
      {
        key: 'persistent_media_missing_candidate',
        meaning: 'DB kennt einen Media-Eintrag, der im vollstaendigen Agent-Snapshot nicht vorhanden ist. Tombstone bleibt nur Diagnose.'
      }
    ]
  };
}

function buildReliabilityBlock({ agentInventory, agentSnapshotDiagnostic, dbInventory, diff, fullSyncCompare }) {
  const dbTruncated = dbInventory && dbInventory.truncated === true;
  const agentSnapshotUnavailable = agentSnapshotDiagnostic && agentSnapshotDiagnostic.available !== true;
  const metadataCompareWarnings = diff && diff.counts ? safeNonNegativeNumber(diff.counts.metadataCompareWarnings) : 0;
  const fullSyncMissingReliable = fullSyncCompare && fullSyncCompare.missingOnAgentReliable === true;
  const missingOnAgentReliable = fullSyncMissingReliable || (!agentSnapshotUnavailable && !(agentInventory && agentInventory.truncated === true) && !dbTruncated);
  let note = fullSyncMissingReliable
    ? 'Full-Sync-Compare-Snapshot ist vollstaendig; Missing-Diagnose ist trotz gekuerztem Compact-Agent-Snapshot read-only belastbar.'
    : 'Agent- und DB-Snapshot sind nicht als gekuerzt gemeldet.';
  if (!fullSyncMissingReliable && agentSnapshotUnavailable) {
    note = agentSnapshotDiagnostic && agentSnapshotDiagnostic.note
      ? agentSnapshotDiagnostic.note
      : 'Agent-Snapshot ist leer oder nicht verfuegbar. Fehlende DB-Eintraege werden deshalb nicht als belastbarer Loesch-/Tombstone-Status bewertet.';
  } else if (!fullSyncMissingReliable && agentInventory && agentInventory.truncated === true) {
    note = 'Agent-Snapshot ist gekuerzt und kein vollstaendiger Full-Sync-Compare ist belastbar. Fehlende DB-Eintraege werden deshalb nicht als belastbarer Loeschstatus bewertet.';
  } else if (dbTruncated) {
    note = 'DB-Snapshot ist gekuerzt. Fehlende Agent-Eintraege werden deshalb nicht vollstaendig bewertet.';
  }
  return {
    agentSnapshotUnavailable,
    agentSnapshotReason: agentSnapshotDiagnostic ? agentSnapshotDiagnostic.reason : 'unknown',
    agentSnapshotTruncated: agentInventory && agentInventory.truncated === true,
    databaseSnapshotTruncated: dbTruncated,
    newAndChangedReliableForReturnedAgentItems: !agentSnapshotUnavailable,
    missingOnAgentReliable,
    fullSyncComparePrepared: fullSyncCompare && fullSyncCompare.prepared === true,
    fullSyncCompareAvailable: fullSyncCompare && fullSyncCompare.available === true,
    fullSyncCompareComplete: fullSyncCompare && fullSyncCompare.complete === true,
    fullSyncCompareMissingOnAgentReliable: fullSyncMissingReliable,
    missingClassificationReadOnly: true,
    ttsTempClassificationEnabled: true,
    ttsGeneratedExcludedFromSyncPolicyEnabled: true,
    tombstoneCandidateOnlyDiagnostic: true,
    metadataCompareWarnings,
    note
  };
}

function compareMediaItems(agentItem, dbItem) {
  const reasons = [];
  const warnings = [];
  const details = {};

  const agentSize = safeComparableNumber(agentItem.sizeBytes);
  const dbSize = safeComparableNumber(dbItem.sizeBytes);
  const sizeComparableAndEqual = agentSize !== null && dbSize !== null && agentSize === dbSize;
  if (agentSize !== null && dbSize !== null && agentSize !== dbSize) reasons.push('size_changed');
  else if ((agentSize === null) !== (dbSize === null)) warnings.push('size_uncomparable');

  const agentModifiedIso = safeIsoOrNull(agentItem.modifiedAt);
  const dbModifiedIso = safeIsoOrNull(dbItem.modifiedAt);
  const agentModified = dateMs(agentModifiedIso);
  const dbModified = dateMs(dbModifiedIso);
  let modifiedAtOffsetBucket = null;
  if (agentModified !== null && dbModified !== null) {
    const modifiedAtDeltaMs = agentModified - dbModified;
    modifiedAtOffsetBucket = modifiedAtSoftOffsetBucket(modifiedAtDeltaMs);
    if (Math.abs(modifiedAtDeltaMs) > MODIFIED_AT_TOLERANCE_MS) {
      reasons.push('modified_at_changed');
      details.modifiedAt = {
        agentModifiedAt: agentModifiedIso,
        dbModifiedAt: dbModifiedIso,
        modifiedAtDeltaMs,
        modifiedAtDeltaAbsMs: Math.abs(modifiedAtDeltaMs),
        toleranceMs: MODIFIED_AT_TOLERANCE_MS,
        softOffsetBucket: modifiedAtOffsetBucket,
        softOffsetToleranceMs: MODIFIED_AT_SOFT_OFFSET_TOLERANCE_MS
      };
    }
  } else if ((agentModified === null) !== (dbModified === null)) {
    warnings.push('modified_at_uncomparable');
    details.modifiedAt = {
      agentModifiedAt: agentModifiedIso,
      dbModifiedAt: dbModifiedIso,
      modifiedAtDeltaMs: null,
      modifiedAtDeltaAbsMs: null,
      toleranceMs: MODIFIED_AT_TOLERANCE_MS,
      softOffsetBucket: null,
      softOffsetToleranceMs: MODIFIED_AT_SOFT_OFFSET_TOLERANCE_MS
    };
  }

  const agentKind = safeKind(agentItem.kind);
  const dbKind = safeKind(dbItem.kind);
  const kindComparableAndEqual = Boolean(agentKind && dbKind && agentKind === dbKind);
  if (agentKind && dbKind && agentKind !== dbKind) reasons.push('kind_changed');

  const changed = reasons.length > 0;
  const softModifiedAtOnly = changed
    && reasons.length === 1
    && reasons[0] === 'modified_at_changed'
    && sizeComparableAndEqual
    && kindComparableAndEqual
    && Boolean(modifiedAtOffsetBucket);

  return {
    changed,
    reasons,
    warnings,
    details,
    changeClass: softModifiedAtOnly ? 'soft_modified_at_offset_only' : (changed ? 'hard_changed' : 'unchanged'),
    modifiedAtOffsetBucket: modifiedAtOffsetBucket || 'other'
  };
}

function addCompareStats(stats, change) {
  if (!stats || !change) return;
  if (change.changed === true) {
    if (change.changeClass === 'soft_modified_at_offset_only') {
      stats.softModifiedAtOnlyCount += 1;
      stats.changeReasonCounts.soft_modified_at_offset_only = safeNonNegativeNumber(stats.changeReasonCounts.soft_modified_at_offset_only) + 1;
    } else {
      stats.hardChangedOnAgentCount += 1;
    }
  }
  for (const reason of Array.isArray(change.reasons) ? change.reasons : []) {
    stats.changeReasonCounts[reason] = safeNonNegativeNumber(stats.changeReasonCounts[reason]) + 1;
  }
  if (change.details && change.details.modifiedAt && Number.isFinite(change.details.modifiedAt.modifiedAtDeltaMs)) {
    stats.modifiedAtDeltasMs.push(change.details.modifiedAt.modifiedAtDeltaMs);
  }
  for (const warning of Array.isArray(change.warnings) ? change.warnings : []) {
    stats.metadataCompareWarnings += 1;
    stats.changeReasonCounts[warning] = safeNonNegativeNumber(stats.changeReasonCounts[warning]) + 1;
  }
}

function indexById(items) {
  const map = new Map();
  for (const item of Array.isArray(items) ? items : []) {
    if (item && item.id && !map.has(item.id)) map.set(item.id, item);
  }
  return map;
}

function sanitizePersistentIndexItem(row) {
  const source = row && typeof row === 'object' && !Array.isArray(row) ? row : {};
  return sanitizeMediaItem({
    id: source.id,
    rootKey: source.root_key,
    kind: source.kind,
    relativePath: source.relative_path,
    name: source.name,
    extension: source.extension,
    sizeBytes: source.size_bytes,
    modifiedAt: source.modified_at,
    lastSeenAt: source.last_seen_at,
    source: source.source,
    syncVersion: source.sync_version
  });
}

function sanitizeMediaItem(item) {
  const source = item && typeof item === 'object' && !Array.isArray(item) ? item : {};
  const rootKey = safeRootKey(source.rootKey);
  const relativePath = safeRelativePath(source.relativePath);
  if (!rootKey || !relativePath) return null;
  const extension = safeExtension(source.extension || path.extname(relativePath));
  if (!extension) return null;
  const id = safeMediaId(source.id || `${rootKey}:${relativePath}`);
  if (!id) return null;

  const pathParts = relativePath.split('/').filter(Boolean);
  const defaultSource = rootKey === 'media' ? 'media_system' : 'legacy_asset_root';
  const moduleKey = safeMediaContextKey(source.moduleKey || (rootKey === 'media' ? pathParts[0] : rootKey), rootKey);
  const categoryKey = safeMediaContextKey(source.categoryKey || (rootKey === 'media' ? pathParts[1] : (pathParts.length > 1 ? pathParts[0] : 'legacy')), rootKey === 'media' ? 'general' : 'legacy');
  const fullCategoryKey = safeMediaContextPath(source.fullCategoryKey || `${moduleKey}/${categoryKey}`, `${moduleKey}/${categoryKey}`);
  const assetRelativePath = safeRelativePath(source.assetRelativePath || relativePath);
  const publicPath = safePublicMediaPath(source.publicPath || source.webPath || `/${rootKey}/${relativePath}`);
  const webPath = safePublicMediaPath(source.webPath || source.publicPath || publicPath);

  return {
    id,
    rootKey,
    source: safeMediaContextKey(source.source || defaultSource, defaultSource),
    moduleKey,
    categoryKey,
    fullCategoryKey,
    assetRelativePath,
    webPath,
    publicPath,
    relativePath,
    kind: safeKind(source.kind),
    sizeBytes: safeNonNegativeNumber(source.sizeBytes),
    modifiedAt: safeIsoOrNull(source.modifiedAt),
    lastSeenAt: safeIsoOrNull(source.lastSeenAt),
    extension
  };
}

function sanitizeFullSyncCompareSnapshot(input) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const rawItems = Array.isArray(source.items) ? source.items : [];
  const items = rawItems.map(sanitizeMediaItem).filter(Boolean);
  const totalItems = safeNonNegativeNumber(source.totalItems || items.length);
  const receivedItems = safeNonNegativeNumber(source.receivedItems || items.length);
  return {
    prepared: source.prepared === true,
    build: safeStatus(source.build || BUILD),
    readOnly: source.readOnly !== false,
    inMemoryOnly: source.inMemoryOnly !== false,
    persistsToDatabase: source.persistsToDatabase === true,
    source: safeStatus(source.source || 'agent_full_sync_readonly_memory_snapshot'),
    available: source.available === true && items.length > 0,
    complete: source.complete === true,
    status: safeStatus(source.status || 'unavailable'),
    syncId: source.syncId ? String(source.syncId).replace(/[^\w:.-]/g, '_').slice(0, 120) : null,
    receivedChunks: safeNonNegativeNumber(source.receivedChunks),
    totalChunks: safeNonNegativeNumber(source.totalChunks),
    receivedItems,
    totalItems,
    itemCount: items.length,
    items,
    truncated: source.truncated === true || (totalItems > 0 && items.length > 0 && totalItems > items.length),
    startedAt: safeIsoOrNull(source.startedAt),
    lastChunkAt: safeIsoOrNull(source.lastChunkAt),
    completedAt: safeIsoOrNull(source.completedAt),
    lastError: safeReason(source.lastError),
    writeEnabled: source.writeEnabled === true,
    writesBlocked: source.writesBlocked !== false,
    uploadEditDeleteEnabled: false
  };
}

function sanitizeMediaFullSync(input) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  return {
    state: safeStatus(source.state || 'unknown'),
    syncId: source.syncId ? String(source.syncId).replace(/[^\w:.-]/g, '_').slice(0, 120) : null,
    receivedChunks: safeNonNegativeNumber(source.receivedChunks),
    totalChunks: safeNonNegativeNumber(source.totalChunks),
    receivedItems: safeNonNegativeNumber(source.receivedItems),
    totalItems: safeNonNegativeNumber(source.totalItems),
    startedAt: safeIsoOrNull(source.startedAt),
    lastChunkAt: safeIsoOrNull(source.lastChunkAt),
    completedAt: safeIsoOrNull(source.completedAt),
    lastError: safeReason(source.lastError),
    lastRejectAt: safeIsoOrNull(source.lastRejectAt),
    lastRejectReason: safeReason(source.lastRejectReason),
    writeEnabled: source.writeEnabled === true,
    writesBlocked: source.writesBlocked !== false,
    uploadEditDeleteEnabled: false
  };
}

function safePreviewItem(item) {
  const safe = sanitizeMediaItem(item) || {};
  const preview = {
    id: safe.id || '',
    rootKey: safe.rootKey || '',
    source: safe.source || '',
    moduleKey: safe.moduleKey || '',
    categoryKey: safe.categoryKey || '',
    fullCategoryKey: safe.fullCategoryKey || '',
    assetRelativePath: safe.assetRelativePath || '',
    webPath: safe.webPath || '',
    publicPath: safe.publicPath || '',
    relativePath: safe.relativePath || '',
    kind: safe.kind || '',
    sizeBytes: safeNonNegativeNumber(safe.sizeBytes),
    modifiedAt: safe.modifiedAt || null
  };
  if (item && item.missingClassification) preview.missingClassification = safeStatus(item.missingClassification);
  if (item && item.ttsGeneratedTempCandidate === true) preview.ttsGeneratedTempCandidate = true;
  if (item && item.ttsGeneratedExcludedFromSyncLegacy === true) preview.ttsGeneratedExcludedFromSyncLegacy = true;
  if (item && item.excludedFromSyncLegacy === true) preview.excludedFromSyncLegacy = true;
  if (item && item.temporaryFileCandidate === true) preview.temporaryFileCandidate = true;
  if (item && item.tombstoneCandidateDiagnostic === true) preview.tombstoneCandidateDiagnostic = true;
  if (item && item.tombstoneWriteAllowed === false) preview.tombstoneWriteAllowed = false;
  if (item && item.deleteAllowed === false) preview.deleteAllowed = false;
  if (item && Array.isArray(item.changeReasons)) preview.changeReasons = item.changeReasons.filter(Boolean).slice(0, 5);
  if (item && item.changeClass) preview.changeClass = safeStatus(item.changeClass);
  if (item && item.modifiedAtOffsetBucket) preview.modifiedAtOffsetBucket = safeStatus(item.modifiedAtOffsetBucket);
  if (item && Array.isArray(item.metadataWarnings)) preview.metadataWarnings = item.metadataWarnings.filter(Boolean).slice(0, 5);
  if (item && item.compareDetails && item.compareDetails.modifiedAt) {
    preview.agentModifiedAt = item.compareDetails.modifiedAt.agentModifiedAt || null;
    preview.dbModifiedAt = item.compareDetails.modifiedAt.dbModifiedAt || null;
    preview.modifiedAtDeltaMs = Number.isFinite(item.compareDetails.modifiedAt.modifiedAtDeltaMs) ? item.compareDetails.modifiedAt.modifiedAtDeltaMs : null;
    preview.modifiedAtDeltaAbsMs = Number.isFinite(item.compareDetails.modifiedAt.modifiedAtDeltaAbsMs) ? item.compareDetails.modifiedAt.modifiedAtDeltaAbsMs : null;
    preview.modifiedAtToleranceMs = item.compareDetails.modifiedAt.toleranceMs || MODIFIED_AT_TOLERANCE_MS;
  }
  return preview;
}

function buildAgentSummary(agentInventory, agentSnapshotUnavailable = false) {
  return {
    active: agentInventory.active,
    connected: agentInventory.connected,
    connectionState: agentInventory.connectionState,
    source: agentInventory.source,
    returned: agentInventory.returned,
    totalSeen: agentInventory.totalSeen,
    truncated: agentInventory.truncated,
    hasMore: agentInventory.hasMore,
    lastSeenAt: agentInventory.lastSeenAt,
    lastHeartbeatAt: agentInventory.lastHeartbeatAt,
    lastMediaInventorySyncAt: agentInventory.lastMediaInventorySyncAt,
    mediaInventorySyncSeq: agentInventory.mediaInventorySyncSeq,
    mediaInventorySyncRejectCount: agentInventory.mediaInventorySyncRejectCount,
    lastMediaInventorySyncRejectReason: agentInventory.lastMediaInventorySyncRejectReason,
    snapshotUnavailable: agentSnapshotUnavailable === true
  };
}

function modifiedAtSoftOffsetBucket(deltaMs) {
  if (!Number.isFinite(deltaMs)) return null;
  const absDelta = Math.abs(deltaMs);
  for (const bucket of MODIFIED_AT_SOFT_OFFSET_BUCKETS) {
    if (Math.abs(absDelta - bucket.ms) <= MODIFIED_AT_SOFT_OFFSET_TOLERANCE_MS) return bucket.key;
  }
  return null;
}

function buildModifiedAtDeltaStats(deltas) {
  const values = (Array.isArray(deltas) ? deltas : []).filter(Number.isFinite);
  if (values.length <= 0) {
    return {
      count: 0,
      minMs: null,
      maxMs: null,
      avgMs: null,
      minAbsMs: null,
      maxAbsMs: null,
      avgAbsMs: null,
      allPositive: false,
      allNegative: false,
      mixedSigns: false,
      toleranceMs: MODIFIED_AT_TOLERANCE_MS
    };
  }
  const sum = values.reduce((acc, value) => acc + value, 0);
  const absValues = values.map(value => Math.abs(value));
  const absSum = absValues.reduce((acc, value) => acc + value, 0);
  const allPositive = values.every(value => value > 0);
  const allNegative = values.every(value => value < 0);
  return {
    count: values.length,
    minMs: Math.min(...values),
    maxMs: Math.max(...values),
    avgMs: Math.round(sum / values.length),
    minAbsMs: Math.min(...absValues),
    maxAbsMs: Math.max(...absValues),
    avgAbsMs: Math.round(absSum / values.length),
    allPositive,
    allNegative,
    mixedSigns: !allPositive && !allNegative,
    toleranceMs: MODIFIED_AT_TOLERANCE_MS
  };
}

function buildEmptyCounts() {
  return {
    agentTotal: 0,
    remoteDbTotal: 0,
    matchedCount: 0,
    newOnAgentCount: 0,
    changedOnAgentCount: 0,
    strictChangedOnAgentCount: 0,
    hardChangedOnAgentCount: 0,
    effectiveChangedOnAgentCount: 0,
    softChangedOnAgentCount: 0,
    softModifiedAtOnlyCount: 0,
    effectiveNoopChangedOnAgentCount: 0,
    missingOnAgentCount: null,
    missingOnAgentReliable: false,
    ttsTempMissingCandidateCount: null,
    tombstoneCandidateDiagnosticCount: null,
    agentSnapshotUnavailable: true,
    unchangedCount: 0,
    strictUnchangedCount: 0,
    effectiveUnchangedCount: 0,
    comparableAgentItems: 0,
    metadataCompareWarnings: 0,
    changeReasonCounts: {},
    modifiedAtDeltaStats: buildModifiedAtDeltaStats([]),
    readOnly: true,
    writesEnabled: false
  };
}

function buildEmptyPreviews() {
  return { newOnAgent: [], changedOnAgent: [], strictChangedOnAgent: [], softChangedOnAgent: [], effectiveChangedOnAgent: [], missingOnAgent: [], ttsTempMissingCandidates: [], tombstoneCandidatesDiagnostic: [], unchanged: [] };
}

function buildComparePolicy() {
  return {
    build: BUILD,
    previousBuild: PREVIOUS_BUILD,
    readOnly: true,
    compares: ['sizeBytes', 'kind', 'modifiedAt'],
    modifiedAtToleranceMs: MODIFIED_AT_TOLERANCE_MS,
    uncomparableMetadataDoesNotMarkChanged: true,
    emptyAgentSnapshotDoesNotMarkMissingReliable: true,
    agentSnapshotDiagnosticEnabled: true,
    modifiedAtDeltaDiagnosticEnabled: true,
    modifiedAtSoftMatchPolicyEnabled: true,
    effectiveChangeCountsEnabled: true,
    fullSyncCompareSnapshotEnabled: true,
    persistentTombstoneExecuteFoundationEnabled: true,
    persistentTombstonePreviewRoute: PERSISTENT_TOMBSTONE_PREVIEW_ROUTE,
    persistentTombstoneExecuteRoute: PERSISTENT_TOMBSTONE_EXECUTE_ROUTE,
    ttsGeneratedExcludedFromAgentSync: true,
    ttsGeneratedExcludedRootKey: TTS_TEMP_ROOT_KEY,
    ttsGeneratedExcludedRelativePathPrefix: TTS_TEMP_PREFIX,
    fullSyncCompareSnapshotReadOnly: true,
    fullSyncCompareSnapshotInMemoryOnly: true,
    mediaRootReadonlyAccepted: true,
    acceptedRootKeys: Array.from(MEDIA_ROOT_KEYS),
    mediaSystemContextFieldsPreserved: ['source', 'moduleKey', 'categoryKey', 'fullCategoryKey', 'assetRelativePath', 'webPath', 'publicPath'],
    ttsTempMissingClassificationEnabled: true,
    ttsTempMissingClassificationRule: `${TTS_TEMP_ROOT_KEY}:${TTS_TEMP_PREFIX}*`,
    tombstoneCandidateOnlyDiagnostic: true,
    changedOnAgentCountCompatibilityMode: 'strict_includes_soft_matches',
    modifiedAtSoftOffsetBuckets: MODIFIED_AT_SOFT_OFFSET_BUCKETS.map(bucket => ({ key: bucket.key, ms: bucket.ms })),
    modifiedAtSoftOffsetToleranceMs: MODIFIED_AT_SOFT_OFFSET_TOLERANCE_MS,
    diagnosticDoesNotTriggerAgentAction: true,
    warningFields: ['metadataCompareWarnings', 'metadataWarnings'],
    noFileContentHashing: true
  };
}

function buildSafetyBlock() {
  return {
    readOnly: true,
    writesEnabled: false,
    databaseWritesEnabled: false,
    uploadEditDeleteEnabled: false,
    noFileContent: true,
    noAbsolutePaths: true,
    noOnlineToAgentActions: true,
    noAgentTrigger: true,
    noUpsert: true,
    noTimestampWrites: true,
    noTombstoneWrites: true,
    noPhysicalDelete: true,
    tombstoneCandidateOnlyDiagnostic: true,
    secretsExposed: false
  };
}

function readPreviewLimit(req) {
  const raw = req && req.query ? Number.parseInt(String(req.query.previewLimit || req.query.limit || ''), 10) : 0;
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_PREVIEW_LIMIT;
  return Math.max(1, Math.min(raw, MAX_PREVIEW_LIMIT));
}

function safeRootKey(value) {
  const key = safeStatus(value);
  return MEDIA_ROOT_KEYS.has(key) ? key : '';
}

function safeMediaContextKey(value, fallback = '') {
  const raw = String(value || fallback || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_').slice(0, 80);
  const key = raw.replace(/^_+|_+$/g, '');
  return key || String(fallback || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_').slice(0, 80);
}

function safeMediaContextPath(value, fallback = '') {
  const raw = String(value || fallback || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/[\u0000-\u001f<>:"|?*]/g, '').slice(0, 180);
  if (!raw || raw.includes('..') || /^[a-zA-Z]:/.test(raw) || raw.startsWith('~') || raw.startsWith('http://') || raw.startsWith('https://')) return safeMediaContextPath(fallback || 'uncategorized/general', 'uncategorized/general');
  const parts = raw.split('/').filter(Boolean).map(part => safeMediaContextKey(part, 'uncategorized')).filter(Boolean);
  return parts.length ? parts.join('/').slice(0, 180) : 'uncategorized/general';
}

function safeRelativePath(value) {
  const rel = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/[\u0000-\u001f<>:"|?*]/g, '').slice(0, 220);
  if (!rel || rel.includes('..') || /^[a-zA-Z]:/.test(rel) || rel.startsWith('~')) return '';
  return rel;
}

function safePublicMediaPath(value) {
  const raw = String(value || '').replace(/\\/g, '/').replace(/[\u0000-\u001f<>:"|?*]/g, '').slice(0, 260);
  if (!raw || raw.includes('..') || /^[a-zA-Z]:/.test(raw) || raw.startsWith('http://') || raw.startsWith('https://')) return '';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

function safeExtension(value) {
  const ext = String(value || '').toLowerCase().trim();
  return MEDIA_ALLOWED_EXTENSIONS.includes(ext) ? ext : '';
}

function safeKind(value) {
  const kind = safeStatus(value);
  if (['audio', 'video', 'image', 'media'].includes(kind)) return kind;
  return 'media';
}

function safeMediaId(value) {
  const id = String(value || '').replace(/[^\w:./-]/g, '_').slice(0, 260);
  if (!id || id.includes('..') || /^[a-zA-Z]:/.test(id)) return '';
  return id;
}

function safeStatus(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9_.:-]/g, '_').slice(0, 80);
}

function safeReason(value) {
  const reason = safeStatus(value);
  return reason || null;
}

function safeNonNegativeNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.floor(num);
}

function safeNullableNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.floor(num);
}

function safeComparableNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.floor(num);
}

function safeIsoOrNull(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.toISOString() : null;
  const parsed = Date.parse(String(value));
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString();
}

function dateMs(value) {
  const iso = safeIsoOrNull(value);
  if (!iso) return null;
  const parsed = Date.parse(iso);
  return Number.isFinite(parsed) ? parsed : null;
}

module.exports = { registerMediaIndexDiffRoutes, buildMediaIndexDiffStatus, buildMediaIndexUpsertPreviewStatus, buildPersistentTombstonePreviewStatus, executePersistentTombstoneFoundation };
