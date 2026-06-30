'use strict';

const crypto = require('crypto');
const { buildDatabaseReadiness, withReadOnlyConnection, withWriteConnection, publicDbError } = require('./db.service');
const { requireAdminConfirmWrite } = require('./admin-confirm-write.service');

const MODULE = 'remote_media_index_tts_legacy_cleanup';
const MODULE_BUILD = 'RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED';
const STATUS_API_VERSION = 'rdap_media_index_tts_legacy_cleanup_gated_058l.v1';
const ROUTE_STATUS = '/api/remote/media/index/cleanup/tts-generated-legacy/status';
const ROUTE_EXECUTE = '/api/remote/media/index/cleanup/tts-generated-legacy';
const MEDIA_INDEX_TABLE = 'remote_media_index';
const AUDIT_TABLE = 'dashboard_audit_log';
const CONFIRM_CLEANUP_TEXT = 'RDAP_0.2.58L_CONFIRM_TTS_LEGACY_CLEANUP';
const PREVIEW_LIMIT = 25;
const TTS_GENERATED_PREFIX = 'tts/generated/';
const AUDIO_EXTENSIONS = Object.freeze(['.mp3', '.wav', '.ogg', '.m4a']);

async function buildTtsLegacyCleanupStatus({ context, req } = {}) {
  const base = buildStatusBase({ context, req, action: 'status' });
  const preview = await readTtsGeneratedLegacyCandidates(context && context.config ? context.config : {});
  return {
    status: 200,
    body: {
      ...base,
      ok: true,
      reason: 'tts_legacy_cleanup_status_ready',
      writeExecuted: false,
      readBackPerformed: false,
      preview
    }
  };
}

async function executeTtsLegacyCleanup({ context, req } = {}) {
  const base = buildStatusBase({ context, req, action: 'soft_delete' });
  const body = req && req.body && typeof req.body === 'object' ? req.body : {};

  if (!isLocalRequest(req)) {
    return blocked(403, base, 'local_request_required');
  }

  const confirm = requireAdminConfirmWrite({ body });
  if (!confirm.confirmWriteAccepted) {
    return {
      status: 400,
      body: {
        ...base,
        ok: false,
        reason: 'confirm_write_required',
        error: 'confirm_write_required',
        confirmWriteAccepted: false,
        confirm,
        writeExecuted: false,
        readBackPerformed: false
      }
    };
  }

  if (String(body.confirmCleanup || body.confirm_cleanup || '') !== CONFIRM_CLEANUP_TEXT) {
    return {
      status: 400,
      body: {
        ...base,
        ok: false,
        reason: 'confirm_cleanup_text_required',
        error: 'confirm_cleanup_text_required',
        confirmWriteAccepted: true,
        requiredConfirmCleanup: CONFIRM_CLEANUP_TEXT,
        writeExecuted: false,
        readBackPerformed: false
      }
    };
  }

  const expectedCandidateCount = Number(body.expectedCandidateCount ?? body.expected_candidate_count);
  if (!Number.isInteger(expectedCandidateCount) || expectedCandidateCount < 0 || expectedCandidateCount > 1000) {
    return {
      status: 400,
      body: {
        ...base,
        ok: false,
        reason: 'expected_candidate_count_required',
        error: 'expected_candidate_count_required',
        confirmWriteAccepted: true,
        writeExecuted: false,
        readBackPerformed: false
      }
    };
  }

  if (!base.database.configured || !base.database.driverAvailable) {
    return blocked(503, base, base.database.error || 'db_not_ready', { confirmWriteAccepted: true });
  }

  if (!base.mediaIndexGates.mediaIndexWriteEnabled || !base.mediaIndexGates.mediaIndexDataWriteEnabled) {
    return blocked(403, base, 'media_index_data_write_gate_disabled', {
      confirmWriteAccepted: true,
      requiredEnvGates: ['MEDIA_INDEX_WRITE_ENABLED=true', 'MEDIA_INDEX_DATA_WRITE_ENABLED=true']
    });
  }

  const now = new Date();
  const auditUid = buildAuditUid(now);
  const config = context && context.config ? context.config : {};

  try {
    return await withWriteConnection(config, async (connection) => {
      await connection.beginTransaction();
      try {
        const candidates = await selectCandidatesForUpdate(connection);
        if (candidates.length !== expectedCandidateCount) {
          await connection.rollback();
          return {
            status: 409,
            body: {
              ...base,
              ok: false,
              reason: 'candidate_count_changed',
              error: 'candidate_count_changed',
              confirmWriteAccepted: true,
              expectedCandidateCount,
              currentCandidateCount: candidates.length,
              writeExecuted: false,
              readBackPerformed: false,
              candidates: candidates.slice(0, PREVIEW_LIMIT).map(sanitizeMediaIndexRow)
            }
          };
        }

        if (candidates.length <= 0) {
          await connection.rollback();
          return {
            status: 200,
            body: {
              ...base,
              ok: true,
              reason: 'no_tts_legacy_candidates_to_cleanup',
              confirmWriteAccepted: true,
              expectedCandidateCount,
              currentCandidateCount: 0,
              writeExecuted: false,
              databaseWriteExecuted: false,
              readBackPerformed: true,
              readBackActiveCandidates: 0,
              auditWritten: false
            }
          };
        }

        const ids = candidates.map(row => row.id);
        const placeholders = ids.map(() => '?').join(', ');
        const [updateResult] = await connection.execute(
          `UPDATE ${MEDIA_INDEX_TABLE}
              SET deleted = 1,
                  source = ?,
                  sync_version = sync_version + 1,
                  updated_at = ?
            WHERE id IN (${placeholders})
              AND deleted = 0`,
          ['rdap_0.2.58l_tts_legacy_cleanup_soft_delete', now, ...ids]
        );

        const safeMetadata = {
          step: MODULE_BUILD,
          purpose: 'soft_delete_tts_generated_legacy_media_index_entries',
          table: MEDIA_INDEX_TABLE,
          criteria: {
            root_key: 'sounds',
            relative_path_prefix: TTS_GENERATED_PREFIX,
            kind: 'audio',
            audio_extensions: AUDIO_EXTENSIONS
          },
          candidateCount: candidates.length,
          affectedRows: safeAffectedRows(updateResult),
          physicalDelete: false,
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
            safeString(body.actorUserUid || body.actor_user_uid || 'system:rdap58l-local-cleanup', 64),
            safeString(body.actorDisplayName || body.actor_display_name || 'RDAP 0.2.58L Local Cleanup', 120),
            safeString(body.actorLogin || body.actor_login || 'rdap58l-local-cleanup', 128),
            'remote-modboard/rdap58l',
            'media_index.tts_generated_legacy.soft_delete',
            'remote_media_index',
            'media.index.cleanup.tts_legacy',
            'media-index:tts-generated-legacy',
            'success',
            null,
            `${candidates.length} active TTS-generated legacy media-index row(s) before cleanup.`,
            `${safeAffectedRows(updateResult)} row(s) soft-deleted via deleted=1. No physical file or DB hard-delete.`,
            JSON.stringify(safeMetadata),
            now
          ]
        );

        const [readBackRows] = await connection.execute(buildCandidateSelectSql(''), []);
        const [updatedRows] = await connection.execute(
          `SELECT id, root_key, kind, relative_path, name, extension, size_bytes, modified_at, last_seen_at, source, sync_version, deleted, updated_at
             FROM ${MEDIA_INDEX_TABLE}
            WHERE id IN (${placeholders})
            ORDER BY root_key ASC, relative_path ASC`,
          ids
        );

        await connection.commit();

        return {
          status: 200,
          body: {
            ...base,
            ok: true,
            reason: 'tts_legacy_cleanup_soft_delete_executed',
            confirmWriteAccepted: true,
            confirmCleanupAccepted: true,
            expectedCandidateCount,
            currentCandidateCountBeforeWrite: candidates.length,
            writeExecuted: true,
            databaseWriteExecuted: true,
            softDeleteExecuted: true,
            hardDeleteExecuted: false,
            physicalDeleteExecuted: false,
            affectedRows: safeAffectedRows(updateResult),
            readBackPerformed: true,
            readBackActiveCandidates: Array.isArray(readBackRows) ? readBackRows.length : 0,
            readBackClean: Array.isArray(readBackRows) && readBackRows.length === 0,
            auditWritten: true,
            insertedAuditUid: auditUid,
            cleanedRows: (Array.isArray(updatedRows) ? updatedRows : []).map(sanitizeMediaIndexRow)
          }
        };
      } catch (err) {
        try { await connection.rollback(); } catch (rollbackErr) { /* ignore rollback error */ }
        throw err;
      }
    }, { scope: 'media_index_data' });
  } catch (err) {
    const publicError = publicDbError(err).code || 'tts_legacy_cleanup_failed';
    return {
      status: 500,
      body: {
        ...base,
        ok: false,
        reason: publicError,
        error: publicError,
        confirmWriteAccepted: true,
        writeExecuted: false,
        databaseWriteExecuted: false,
        softDeleteExecuted: false,
        hardDeleteExecuted: false,
        physicalDeleteExecuted: false,
        readBackPerformed: false,
        auditWritten: false
      }
    };
  }
}

function buildStatusBase({ context, req, action = 'status' } = {}) {
  const config = context && context.config ? context.config : {};
  const readiness = buildDatabaseReadiness(config);
  const mediaIndex = config.mediaIndex || {};
  return {
    ok: true,
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: (context && context.moduleBuild) || MODULE_BUILD,
    routeBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    readOnly: action === 'status',
    writeEnabled: action !== 'status',
    prepared: true,
    action,
    statusRoute: ROUTE_STATUS,
    route: ROUTE_EXECUTE,
    tableName: MEDIA_INDEX_TABLE,
    auditTableName: AUDIT_TABLE,
    localOnly: true,
    confirmWriteRequired: true,
    confirmCleanupRequired: true,
    requiredConfirmCleanup: CONFIRM_CLEANUP_TEXT,
    expectedCandidateCountRequired: true,
    cleanupMode: 'soft_delete_deleted_1',
    hardDeleteEnabled: false,
    physicalDeleteEnabled: false,
    uploadEditDeleteEnabled: false,
    noOnlineToAgentAction: true,
    noFileContent: true,
    noAbsolutePaths: true,
    database: readiness,
    mediaIndexGates: {
      mediaIndexWriteEnabled: mediaIndex.writeEnabled === true,
      mediaIndexDataWriteEnabled: mediaIndex.dataWriteEnabled === true,
      mediaIndexSchemaWriteEnabled: mediaIndex.schemaWriteEnabled === true,
      requiredForExecute: ['MEDIA_INDEX_WRITE_ENABLED', 'MEDIA_INDEX_DATA_WRITE_ENABLED']
    },
    criteria: {
      rootKey: 'sounds',
      relativePathPrefix: TTS_GENERATED_PREFIX,
      kind: 'audio',
      audioExtensions: AUDIO_EXTENSIONS.slice(),
      deleted: 0
    },
    request: buildRequestInfo(req),
    safety: {
      localOnly: true,
      confirmWriteRequired: true,
      confirmCleanupRequired: true,
      expectedCandidateCountRequired: true,
      auditRequired: true,
      readBackRequired: true,
      softDeleteOnly: true,
      hardDeleteEnabled: false,
      physicalDeleteEnabled: false,
      noAgentAction: true,
      noFileAction: true
    }
  };
}

async function readTtsGeneratedLegacyCandidates(config) {
  try {
    return await withReadOnlyConnection(config, async (connection) => {
      const [rows] = await connection.query(`${buildCandidateSelectSql(`LIMIT ${PREVIEW_LIMIT}`)}`);
      const [countRows] = await connection.query(buildCandidateCountSql());
      const count = countRows && countRows[0] ? Number(countRows[0].candidate_count || 0) : 0;
      return {
        ok: true,
        candidateCount: Number.isFinite(count) ? Math.floor(count) : 0,
        previewLimit: PREVIEW_LIMIT,
        candidates: (Array.isArray(rows) ? rows : []).map(sanitizeMediaIndexRow),
        readOnly: true,
        writeExecuted: false
      };
    });
  } catch (err) {
    const code = publicDbError(err).code || 'tts_legacy_cleanup_preview_failed';
    return {
      ok: false,
      error: code,
      candidateCount: null,
      candidates: [],
      readOnly: true,
      writeExecuted: false
    };
  }
}

async function selectCandidatesForUpdate(connection) {
  const [rows] = await connection.execute(`${buildCandidateSelectSql('FOR UPDATE')}`);
  return Array.isArray(rows) ? rows : [];
}

function buildCandidateSelectSql(suffix) {
  return `SELECT id, root_key, kind, relative_path, name, extension, size_bytes, modified_at, last_seen_at, source, sync_version, deleted, updated_at
            FROM ${MEDIA_INDEX_TABLE}
           WHERE deleted = 0
             AND root_key = 'sounds'
             AND relative_path LIKE 'tts/generated/%'
             AND kind = 'audio'
             AND LOWER(extension) IN ('.mp3', '.wav', '.ogg', '.m4a')
           ORDER BY root_key ASC, relative_path ASC ${suffix || ''}`;
}

function buildCandidateCountSql() {
  return `SELECT COUNT(*) AS candidate_count
            FROM ${MEDIA_INDEX_TABLE}
           WHERE deleted = 0
             AND root_key = 'sounds'
             AND relative_path LIKE 'tts/generated/%'
             AND kind = 'audio'
             AND LOWER(extension) IN ('.mp3', '.wav', '.ogg', '.m4a')`;
}

function blocked(status, base, reason, extra = {}) {
  return {
    status,
    body: {
      ...base,
      ...extra,
      ok: false,
      reason,
      error: reason,
      writeExecuted: false,
      databaseWriteExecuted: false,
      readBackPerformed: false
    }
  };
}

function isLocalRequest(req) {
  const ip = String((req && req.ip) || (req && req.socket && req.socket.remoteAddress) || '');
  const forwardedFor = req && req.headers ? String(req.headers['x-forwarded-for'] || '') : '';
  if (forwardedFor && !/^127\.0\.0\.1$|^::1$|^::ffff:127\.0\.0\.1$/.test(forwardedFor.split(',')[0].trim())) return false;
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}

function buildRequestInfo(req) {
  return {
    ip: req && req.ip ? req.ip : null,
    remoteAddress: req && req.socket ? req.socket.remoteAddress : null,
    method: req && req.method ? req.method : null,
    path: req && req.path ? req.path : null,
    userAgentPresent: Boolean(req && req.headers && req.headers['user-agent'])
  };
}

function buildAuditUid(now = new Date()) {
  const stamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `rdap58l_tts_cleanup_${stamp}_${crypto.randomBytes(6).toString('hex')}`;
}

function safeAffectedRows(result) {
  const num = Number(result && result.affectedRows);
  return Number.isFinite(num) && num >= 0 ? Math.floor(num) : 0;
}

function safeString(value, maxLength) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength);
}

function sanitizeMediaIndexRow(row) {
  const source = row && typeof row === 'object' && !Array.isArray(row) ? row : {};
  return {
    id: safeString(source.id, 260),
    rootKey: safeString(source.root_key, 40),
    kind: safeString(source.kind, 20),
    relativePath: safeString(source.relative_path, 500),
    name: safeString(source.name, 180),
    extension: safeString(source.extension, 20),
    sizeBytes: safeNonNegativeNumber(source.size_bytes),
    modifiedAt: safeIsoOrNull(source.modified_at),
    lastSeenAt: safeIsoOrNull(source.last_seen_at),
    source: safeString(source.source, 80),
    syncVersion: safeNonNegativeNumber(source.sync_version),
    deleted: safeNonNegativeNumber(source.deleted),
    updatedAt: safeIsoOrNull(source.updated_at)
  };
}

function safeNonNegativeNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.floor(num);
}

function safeIsoOrNull(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.toISOString() : null;
  const parsed = Date.parse(String(value));
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString();
}

module.exports = {
  MODULE_BUILD,
  STATUS_API_VERSION,
  ROUTE_STATUS,
  ROUTE_EXECUTE,
  CONFIRM_CLEANUP_TEXT,
  buildTtsLegacyCleanupStatus,
  executeTtsLegacyCleanup
};
