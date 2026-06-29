'use strict';

const path = require('path');
const { buildAgentMediaInventoryStatusResponse } = require('../services/agent-runtime.service');
const { withReadOnlyConnection, publicDbError } = require('../services/db.service');

const MODULE = 'remote_media_index_diff_readonly';
const STATUS_API_VERSION = 'rdap_media_index_diff_readonly_058.v1';
const BUILD = 'RDAP_0.2.58_MEDIA_INDEX_DIFF_DIAGNOSTIC_READONLY';
const ROUTE = '/api/remote/media/index/diff/status';
const PERSISTENT_INDEX_TABLE = 'remote_media_index';
const DEFAULT_PREVIEW_LIMIT = 20;
const MAX_PREVIEW_LIMIT = 50;
const MAX_DB_ROWS = 2000;

const MEDIA_ALLOWED_EXTENSIONS = Object.freeze(['.mp3', '.wav', '.ogg', '.webm', '.m4a', '.mp4', '.png', '.jpg', '.jpeg', '.webp', '.gif']);
const MEDIA_ROOT_KEYS = new Set(['sounds', 'videos', 'images']);

function registerMediaIndexDiffRoutes(app, context) {
  app.get(ROUTE, async (req, res) => {
    const result = await buildMediaIndexDiffStatus(context, req);
    res.status(result.httpStatus || 200).json(result.body || result);
  });
}

async function buildMediaIndexDiffStatus(context = {}, req = null) {
  const generatedAt = new Date().toISOString();
  const previewLimit = readPreviewLimit(req);
  const agentStatus = safeBuildAgentMediaInventoryStatus();
  const agentInventory = sanitizeAgentInventory(agentStatus);

  let dbInventory;
  try {
    dbInventory = await readPersistentIndexItems(context.config || {});
  } catch (err) {
    const code = publicDbError(err).code || 'media_index_diff_db_read_failed';
    return {
      ok: false,
      httpStatus: 200,
      service: 'remote-modboard',
      module: MODULE,
      moduleVersion: context.appVersion || '0.2.58',
      moduleBuild: context.moduleBuild || BUILD,
      routeBuild: BUILD,
      statusApiVersion: STATUS_API_VERSION,
      route: ROUTE,
      generatedAt,
      readOnly: true,
      writeEnabled: false,
      active: false,
      status: code,
      error: code,
      agent: buildAgentSummary(agentInventory),
      database: { table: PERSISTENT_INDEX_TABLE, readOnly: true, total: 0, active: false },
      counts: buildEmptyCounts(),
      previewLimit,
      previews: buildEmptyPreviews(),
      safety: buildSafetyBlock(),
      note: 'Diff-Diagnose konnte die Online-DB nicht read-only lesen. Es wurden keine Writes ausgefuehrt.'
    };
  }

  const diff = buildDiff({ agentItems: agentInventory.items, dbItems: dbInventory.items, previewLimit, agentTruncated: agentInventory.truncated });

  return {
    ok: true,
    service: 'remote-modboard',
    module: MODULE,
    moduleVersion: context.appVersion || '0.2.58',
    moduleBuild: context.moduleBuild || BUILD,
    routeBuild: BUILD,
    statusApiVersion: STATUS_API_VERSION,
    route: ROUTE,
    generatedAt,
    readOnly: true,
    writeEnabled: false,
    active: true,
    status: agentInventory.truncated ? 'diff_available_agent_snapshot_truncated' : 'diff_available',
    source: 'agent_snapshot_vs_remote_media_index_readonly',
    agent: buildAgentSummary(agentInventory),
    database: { table: PERSISTENT_INDEX_TABLE, readOnly: true, total: dbInventory.total, returned: dbInventory.items.length, truncated: dbInventory.truncated, active: dbInventory.items.length > 0 },
    counts: diff.counts,
    previewLimit,
    previews: diff.previews,
    reliability: {
      agentSnapshotTruncated: agentInventory.truncated,
      databaseSnapshotTruncated: dbInventory.truncated,
      newAndChangedReliableForReturnedAgentItems: true,
      missingOnAgentReliable: !agentInventory.truncated && !dbInventory.truncated,
      note: agentInventory.truncated
        ? 'Agent-Snapshot ist gekuerzt. Fehlende DB-Eintraege werden deshalb nicht als belastbarer Loeschstatus bewertet.'
        : 'Agent- und DB-Snapshot sind nicht als gekuerzt gemeldet.'
    },
    safety: buildSafetyBlock(),
    nextSteps: [
      'Gated Delta-Upsert separat planen.',
      'Tombstone/deleted=1 nur spaeter mit eigenem Gate, Confirm, Audit/Lock und Readback planen.',
      'Upload/Edit/Delete bleibt aus.'
    ],
    note: 'Diese Route vergleicht nur read-only Agent-Snapshot und remote_media_index. Sie schreibt nichts und fuehrt keine Dateiaktion aus.'
  };
}

function safeBuildAgentMediaInventoryStatus() {
  try {
    if (typeof buildAgentMediaInventoryStatusResponse !== 'function') return null;
    return buildAgentMediaInventoryStatusResponse();
  } catch (err) {
    return null;
  }
}

function sanitizeAgentInventory(agentStatus) {
  const status = agentStatus && typeof agentStatus === 'object' && !Array.isArray(agentStatus) ? agentStatus : {};
  const inventory = status.inventory && typeof status.inventory === 'object' && !Array.isArray(status.inventory) ? status.inventory : {};
  const rawItems = Array.isArray(inventory.items) ? inventory.items : [];
  const items = rawItems.map(sanitizeMediaItem).filter(Boolean);
  const counts = inventory.counts && typeof inventory.counts === 'object' && !Array.isArray(inventory.counts) ? inventory.counts : {};
  const totalSeen = safeNonNegativeNumber(counts.totalSeen || counts.total || rawItems.length);
  const returned = safeNonNegativeNumber(counts.returned || items.length);
  return {
    active: status.active === true || inventory.active === true || items.length > 0,
    connected: status.agent && status.agent.connected === true,
    connectionState: status.agent && status.agent.connectionState ? safeStatus(status.agent.connectionState) : null,
    lastMediaInventorySyncAt: status.agent && status.agent.lastMediaInventorySyncAt ? safeIsoOrNull(status.agent.lastMediaInventorySyncAt) : null,
    source: safeStatus(inventory.source || 'agent_memory'),
    items,
    returned: returned || items.length,
    totalSeen: Math.max(totalSeen, items.length),
    truncated: inventory.truncated === true || totalSeen > items.length || rawItems.length > items.length,
    hasMore: inventory.hasMore === true
  };
}

async function readPersistentIndexItems(config) {
  return await withReadOnlyConnection(config, async (connection) => {
    const [rows] = await connection.query(
      `SELECT id, root_key, kind, relative_path, name, extension, size_bytes, modified_at, last_seen_at, source, sync_version
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

function buildDiff({ agentItems, dbItems, previewLimit, agentTruncated }) {
  const agentById = indexById(agentItems);
  const dbById = indexById(dbItems);
  const newOnAgent = [];
  const changedOnAgent = [];
  const unchanged = [];

  for (const agentItem of agentById.values()) {
    const dbItem = dbById.get(agentItem.id);
    if (!dbItem) {
      newOnAgent.push(agentItem);
      continue;
    }
    const change = compareMediaItems(agentItem, dbItem);
    if (change.changed) changedOnAgent.push({ ...agentItem, changeReasons: change.reasons });
    else unchanged.push(agentItem);
  }

  const missingOnAgentReliable = !agentTruncated;
  const missingOnAgent = [];
  if (missingOnAgentReliable) {
    for (const dbItem of dbById.values()) {
      if (!agentById.has(dbItem.id)) missingOnAgent.push(dbItem);
    }
  }

  const matchedCount = unchanged.length + changedOnAgent.length;
  return {
    counts: {
      agentTotal: agentItems.length,
      remoteDbTotal: dbItems.length,
      matchedCount,
      newOnAgentCount: newOnAgent.length,
      changedOnAgentCount: changedOnAgent.length,
      missingOnAgentCount: missingOnAgentReliable ? missingOnAgent.length : null,
      missingOnAgentReliable,
      unchangedCount: unchanged.length,
      comparableAgentItems: agentItems.length,
      readOnly: true,
      writesEnabled: false
    },
    previews: {
      newOnAgent: newOnAgent.slice(0, previewLimit).map(safePreviewItem),
      changedOnAgent: changedOnAgent.slice(0, previewLimit).map(safePreviewItem),
      missingOnAgent: missingOnAgentReliable ? missingOnAgent.slice(0, previewLimit).map(safePreviewItem) : [],
      unchanged: unchanged.slice(0, previewLimit).map(safePreviewItem)
    }
  };
}

function compareMediaItems(agentItem, dbItem) {
  const reasons = [];
  if (safeNonNegativeNumber(agentItem.sizeBytes) !== safeNonNegativeNumber(dbItem.sizeBytes)) reasons.push('sizeBytes');
  const agentModified = dateMs(agentItem.modifiedAt);
  const dbModified = dateMs(dbItem.modifiedAt);
  if (agentModified !== null && dbModified !== null && agentModified !== dbModified) reasons.push('modifiedAt');
  if (String(agentItem.kind || '') !== String(dbItem.kind || '')) reasons.push('kind');
  return { changed: reasons.length > 0, reasons };
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
  return {
    id,
    rootKey,
    relativePath,
    kind: safeKind(source.kind),
    sizeBytes: safeNonNegativeNumber(source.sizeBytes),
    modifiedAt: safeIsoOrNull(source.modifiedAt),
    lastSeenAt: safeIsoOrNull(source.lastSeenAt),
    extension
  };
}

function safePreviewItem(item) {
  const safe = sanitizeMediaItem(item) || {};
  const preview = {
    id: safe.id || '',
    rootKey: safe.rootKey || '',
    relativePath: safe.relativePath || '',
    kind: safe.kind || '',
    sizeBytes: safeNonNegativeNumber(safe.sizeBytes),
    modifiedAt: safe.modifiedAt || null
  };
  if (Array.isArray(item.changeReasons)) preview.changeReasons = item.changeReasons.filter(Boolean).slice(0, 5);
  return preview;
}

function buildAgentSummary(agentInventory) {
  return {
    active: agentInventory.active,
    connected: agentInventory.connected,
    connectionState: agentInventory.connectionState,
    source: agentInventory.source,
    returned: agentInventory.returned,
    totalSeen: agentInventory.totalSeen,
    truncated: agentInventory.truncated,
    hasMore: agentInventory.hasMore,
    lastMediaInventorySyncAt: agentInventory.lastMediaInventorySyncAt
  };
}

function buildEmptyCounts() {
  return {
    agentTotal: 0,
    remoteDbTotal: 0,
    matchedCount: 0,
    newOnAgentCount: 0,
    changedOnAgentCount: 0,
    missingOnAgentCount: null,
    missingOnAgentReliable: false,
    unchangedCount: 0,
    comparableAgentItems: 0,
    readOnly: true,
    writesEnabled: false
  };
}

function buildEmptyPreviews() {
  return { newOnAgent: [], changedOnAgent: [], missingOnAgent: [], unchanged: [] };
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
    noTombstoneWrites: true,
    noPhysicalDelete: true,
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

function safeRelativePath(value) {
  const rel = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/[\u0000-\u001f<>:"|?*]/g, '').slice(0, 220);
  if (!rel || rel.includes('..') || /^[a-zA-Z]:/.test(rel) || rel.startsWith('~')) return '';
  return rel;
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

function dateMs(value) {
  const iso = safeIsoOrNull(value);
  if (!iso) return null;
  const parsed = Date.parse(iso);
  return Number.isFinite(parsed) ? parsed : null;
}

module.exports = { registerMediaIndexDiffRoutes, buildMediaIndexDiffStatus };
