'use strict';

const fs = require('fs');
const path = require('path');
const { buildAgentMediaInventoryStatusResponse } = require('../services/agent-runtime.service');

const STATUS_API_VERSION = 'rdap_media_persistent_index_foundation_034.v1';
const PREVIOUS_STATUS_API_VERSION = 'rdap_media_agent_slow_sync_status_polish_028.v1';
const BUILD = 'RDAP_0.2.34_MEDIA_PERSISTENT_INDEX_MIGRATION_FOUNDATION_READONLY';
const MEDIA_STATUS_PATH = '/api/remote/media/status';
const PERSISTENT_INDEX_SCHEMA_MODULE = 'remote_media_index';
const PERSISTENT_INDEX_SCHEMA_VERSION = 1;
const PERSISTENT_INDEX_TABLE = 'remote_media_index';

const MEDIA_ALLOWED_EXTENSIONS = Object.freeze(['.mp3', '.wav', '.ogg', '.webm', '.m4a', '.mp4', '.png', '.jpg', '.jpeg', '.webp', '.gif']);
const MEDIA_AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.m4a']);
const MEDIA_VIDEO_EXTENSIONS = new Set(['.webm', '.mp4']);
const MEDIA_IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const MEDIA_SCAN_DEFAULT_LIMIT = 500;
const MEDIA_SCAN_HARD_LIMIT = 2000;
const MEDIA_SCAN_MAX_DEPTH = 5;
const MEDIA_PLANNED_ROOTS = Object.freeze([
  { key: 'sounds', label: 'Sounds', localPathHint: 'htdocs/assets/sounds', publicBasePath: '/assets/sounds', types: ['audio', 'video'] },
  { key: 'videos', label: 'Videos', localPathHint: 'htdocs/assets/videos', publicBasePath: '/assets/videos', types: ['video'] },
  { key: 'images', label: 'Bilder', localPathHint: 'htdocs/assets/images', publicBasePath: '/assets/images', types: ['image'] }
]);

let persistentIndexSchemaState = null;

function registerMediaReadonlyRoutes(app, context) {
  app.get(MEDIA_STATUS_PATH, (req, res) => {
    res.json(buildMediaReadonlyStatus(context, req));
  });
}

function buildMediaReadonlyStatus(context = {}, req = null) {
  const runtimeMode = context && context.config && context.config.runtimeMode ? String(context.config.runtimeMode) : 'online';
  const generatedAt = new Date().toISOString();
  const localRuntime = runtimeMode === 'local';
  const limit = readLimit(req);
  const persistentIndex = ensurePersistentIndexFoundation(context);
  const agentMediaStatus = localRuntime ? null : safeBuildAgentMediaInventoryStatus();
  const inventory = localRuntime
    ? scanLocalInventory({ limit, generatedAt })
    : buildOnlineAgentMediaInventory({ limit, generatedAt, agentMediaStatus });

  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_media_readonly',
    moduleVersion: context.appVersion || '0.2.34',
    moduleBuild: context.moduleBuild || BUILD,
    routeBuild: BUILD,
    statusApiVersion: STATUS_API_VERSION,
    previousStatusApiVersion: PREVIOUS_STATUS_API_VERSION,
    route: MEDIA_STATUS_PATH,
    generatedAt,
    runtimeMode,
    readOnly: true,
    prepared: true,
    active: true,
    status: localRuntime
      ? (inventory.active ? 'local_media_inventory_available' : 'local_media_inventory_empty')
      : (inventory.active ? (inventory.truncated ? 'online_media_inventory_compact_available' : 'online_media_inventory_available') : 'online_media_inventory_sync_pending'),
    title: 'Media-System',
    summary: localRuntime
      ? 'Lokales Media-Inventar wurde read-only erfasst. Upload, Bearbeiten und Loeschen bleiben aus.'
      : buildOnlineSummary(inventory),
    mode: {
      local: localRuntime,
      online: !localRuntime,
      localInventoryExpected: localRuntime,
      onlineAgentInventorySyncPreparedLater: true,
      onlineAgentInventorySyncActive: !localRuntime && inventory.active === true,
      singleUiTruth: true,
      remoteModboardUi: true,
      localDashboardProfileUsesSameUi: true
    },
    permissions: buildPermissionBlock(),
    syncInfo: buildMediaSyncInfo({ localRuntime, inventory, agentMediaStatus, persistentIndex }),
    persistentIndex,
    inventory,
    plannedRoots: MEDIA_PLANNED_ROOTS.map(item => ({ ...item })),
    allowedExtensions: MEDIA_ALLOWED_EXTENSIONS.slice(),
    scanPolicy: {
      readOnly: true,
      defaultLimit: MEDIA_SCAN_DEFAULT_LIMIT,
      hardLimit: MEDIA_SCAN_HARD_LIMIT,
      maxDepth: MEDIA_SCAN_MAX_DEPTH,
      acceptsLimitQuery: true,
      cursorPreparedLater: true,
      nextCursor: inventory.truncated ? 'prepared_later' : null
    },
    safety: buildSafetyBlock(),
    nextSteps: [
      inventory.active ? 'Online-Media-Inventar wird per Agent-WSS Memory-only synchronisiert; kompakte Listen koennen truncated=true melden.' : 'Online-Media-Inventar per Agent-WSS Memory-only synchronisieren.',
      persistentIndex.ok ? 'Persistent-Index-Schema ist vorbereitet; Daten-Schreiben bleibt in diesem Step deaktiviert.' : 'Persistent-Index-Schema pruefen, bevor DB-Fallback aktiviert wird.',
      'Filter/Paging spaeter ohne Breaking Change ueber limit/root/type/cursor ausbauen.',
      'Upload/Edit/Delete erst nach separatem Permission-/Audit-/Confirm-Step.'
    ]
  };
}

function buildOnlineSummary(inventory) {
  if (!inventory || inventory.active !== true) {
    return 'Online-Media-Grundlage ist vorbereitet. Echte lokale Medien kommen nur ueber read-only Agent-WSS Slow-Sync.';
  }
  const returned = inventory.counts && Number.isFinite(Number(inventory.counts.returned)) ? Number(inventory.counts.returned) : 0;
  if (inventory.truncated === true) {
    return `Online-Media-Inventar ist per Agent-WSS aktiv. Es werden ${returned} Eintraege kompakt angezeigt; weitere lokale Medien sind vorhanden. Upload, Bearbeiten und Loeschen bleiben aus.`;
  }
  return `Online-Media-Inventar ist per Agent-WSS aktiv. Es werden ${returned} Eintraege angezeigt. Upload, Bearbeiten und Loeschen bleiben aus.`;
}

function buildMediaSyncInfo({ localRuntime, inventory, agentMediaStatus, persistentIndex }) {
  const counts = inventory && inventory.counts ? inventory.counts : {};
  return {
    prepared: true,
    readOnly: true,
    runtimeMode: localRuntime ? 'local' : 'online',
    source: inventory && inventory.source ? inventory.source : (localRuntime ? 'local_stream_pc_filesystem_readonly' : 'agent_wss_media_inventory_sync_memory_only'),
    localIsMaster: true,
    serverPersistence: false,
    serverPersistenceFoundation: persistentIndex && persistentIndex.ok === true,
    persistentIndexPrepared: true,
    persistentIndexTable: PERSISTENT_INDEX_TABLE,
    persistentIndexWritesEnabled: false,
    persistentIndexFallbackEnabled: false,
    memoryOnly: !localRuntime,
    compactTransport: !localRuntime,
    active: inventory && inventory.active === true,
    returned: Number(counts.returned || counts.total || 0),
    truncated: inventory && inventory.truncated === true,
    hasMore: inventory && inventory.hasMore === true,
    lastMediaSyncAt: agentMediaStatus && agentMediaStatus.agent ? agentMediaStatus.agent.lastMediaInventorySyncAt || null : null,
    status: inventory && inventory.active === true ? (inventory.truncated === true ? 'compact_inventory_available' : 'inventory_available') : 'inventory_pending',
    note: localRuntime
      ? 'Lokal bleibt die Datei-Wahrheit; das Inventar wird direkt read-only aus den Assets gelesen.'
      : 'Online zeigt zuerst den read-only Agent-Memory-Index. Das DB-Schema ist vorbereitet, aber dieser Step schreibt noch keine Media-Daten in den Index.'
  };
}

function readLimit(req) {
  const raw = req && req.query ? Number.parseInt(String(req.query.limit || ''), 10) : 0;
  if (!Number.isFinite(raw) || raw <= 0) return MEDIA_SCAN_DEFAULT_LIMIT;
  return Math.max(1, Math.min(raw, MEDIA_SCAN_HARD_LIMIT));
}

function getProjectRoot() {
  return path.resolve(__dirname, '..', '..', '..', '..');
}

function getDatabaseLayer() {
  try {
    return require(path.resolve(getProjectRoot(), 'backend', 'core', 'database.js'));
  } catch (err) {
    return null;
  }
}

function ensurePersistentIndexFoundation(context = {}) {
  if (persistentIndexSchemaState && persistentIndexSchemaState.ok === true) {
    return { ...persistentIndexSchemaState, cached: true };
  }

  const db = getDatabaseLayer();
  if (!db || typeof db.ensureReady !== 'function' || typeof db.ensureSchema !== 'function') {
    persistentIndexSchemaState = buildPersistentIndexState({ ok: false, reason: 'database_layer_unavailable' });
    return persistentIndexSchemaState;
  }

  try {
    db.ensureReady(context);
    db.ensureSchema(PERSISTENT_INDEX_SCHEMA_MODULE, PERSISTENT_INDEX_SCHEMA_VERSION, (currentVersion, nextVersion, database) => {
      if (nextVersion === 1) migratePersistentIndexV1(database);
    });

    const tableExists = typeof db.tableExists === 'function' ? db.tableExists(PERSISTENT_INDEX_TABLE) : true;
    const columns = typeof db.tableColumns === 'function' ? db.tableColumns(PERSISTENT_INDEX_TABLE) : [];
    const itemCount = tableExists && typeof db.count === 'function' ? db.count(PERSISTENT_INDEX_TABLE) : 0;
    const schemaVersion = typeof db.getSchemaVersion === 'function' ? db.getSchemaVersion(PERSISTENT_INDEX_SCHEMA_MODULE) : PERSISTENT_INDEX_SCHEMA_VERSION;
    persistentIndexSchemaState = buildPersistentIndexState({ ok: tableExists, reason: tableExists ? 'schema_ready' : 'table_missing_after_migration', schemaVersion, columns, itemCount, databaseStatus: typeof db.status === 'function' ? db.status() : null });
    return persistentIndexSchemaState;
  } catch (err) {
    persistentIndexSchemaState = buildPersistentIndexState({ ok: false, reason: err && err.message ? err.message : String(err || 'persistent_index_schema_failed') });
    return persistentIndexSchemaState;
  }
}

function migratePersistentIndexV1(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS remote_media_index (
      id TEXT PRIMARY KEY,
      root_key TEXT NOT NULL,
      kind TEXT NOT NULL,
      relative_path TEXT NOT NULL,
      name TEXT NOT NULL,
      extension TEXT NOT NULL,
      size_bytes INTEGER NOT NULL DEFAULT 0,
      modified_at TEXT,
      first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'agent_wss_media_inventory_sync',
      sync_version INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_remote_media_index_root_path
      ON remote_media_index (root_key, relative_path);

    CREATE INDEX IF NOT EXISTS idx_remote_media_index_kind
      ON remote_media_index (kind);

    CREATE INDEX IF NOT EXISTS idx_remote_media_index_deleted_last_seen
      ON remote_media_index (deleted, last_seen_at);
  `);
}

function buildPersistentIndexState(input = {}) {
  const databaseStatus = input.databaseStatus || null;
  return {
    prepared: true,
    ok: input.ok === true,
    readOnly: true,
    tableName: PERSISTENT_INDEX_TABLE,
    schemaModule: PERSISTENT_INDEX_SCHEMA_MODULE,
    schemaVersion: Number(input.schemaVersion || 0),
    targetSchemaVersion: PERSISTENT_INDEX_SCHEMA_VERSION,
    reason: input.reason || 'unknown',
    migrationEnabled: true,
    dataWritesEnabled: false,
    fallbackReadsEnabled: false,
    localIsMaster: true,
    storesFileContents: false,
    storesAbsolutePaths: false,
    columns: Array.isArray(input.columns) ? input.columns : [],
    itemCount: Number(input.itemCount || 0),
    database: databaseStatus ? {
      adapter: databaseStatus.adapter,
      dialect: databaseStatus.dialect,
      initialized: databaseStatus.initialized,
      ok: databaseStatus.ok === true,
      sqliteReady: databaseStatus.sqlite ? databaseStatus.sqlite.initialized === true : false
    } : null,
    note: input.ok === true
      ? 'DB-Schema ist vorbereitet. Agent-Sync schreibt in diesem Step noch keine Media-Daten in den Index.'
      : 'DB-Schema ist nicht bereit; Media-Route bleibt trotzdem read-only ueber Memory/Local-Scan nutzbar.'
  };
}

function buildPendingInventory({ localRuntime, limit }) {
  return {
    prepared: true,
    active: false,
    source: localRuntime ? 'local_stream_pc_pending' : 'agent_wss_media_inventory_sync_later',
    routePreparedLater: localRuntime ? '/api/remote-agent/media/inventory/status' : '/api/remote/agent/media/inventory/status',
    items: [],
    groups: buildEmptyGroups(),
    counts: { total: 0, sounds: 0, videos: 0, images: 0, audio: 0, video: 0, image: 0, returned: 0, skipped: 0, totalSeen: 0 },
    limit,
    hardLimit: MEDIA_SCAN_HARD_LIMIT,
    maxDepth: MEDIA_SCAN_MAX_DEPTH,
    truncated: false,
    hasMore: false,
    nextCursor: null,
    emptyReason: 'inventory_not_available_in_this_runtime_yet'
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

function buildOnlineAgentMediaInventory({ limit, generatedAt, agentMediaStatus }) {
  const status = agentMediaStatus && typeof agentMediaStatus === 'object' ? agentMediaStatus : null;
  const source = status && status.inventory && typeof status.inventory === 'object' ? status.inventory : null;
  if (!status || !source || status.active !== true) {
    return buildPendingInventory({ localRuntime: false, limit });
  }

  const rawItems = Array.isArray(source.items) ? source.items : [];
  const items = rawItems.slice(0, limit).map(sanitizeOnlineMediaItem).filter(Boolean);
  const truncated = source.truncated === true || rawItems.length > items.length;
  const groups = buildGroupsFromItems(items, source.groups);
  const counts = buildCountsFromItems(items, source.counts);
  return {
    prepared: true,
    active: items.length > 0,
    source: 'agent_wss_media_inventory_sync_memory_only',
    transportMode: 'agent_wss_compact_memory_only',
    routePreparedLater: '/api/remote/agent/media/inventory/status',
    scannedAt: source.scannedAt || source.checkedAt || generatedAt,
    receivedAt: source.receivedAt || status.generatedAt || generatedAt,
    agent: status.agent || null,
    roots: MEDIA_PLANNED_ROOTS.map(root => ({ key: root.key, label: root.label, exists: groups[root.key].exists, count: groups[root.key].count })),
    items,
    groups,
    counts,
    limit,
    hardLimit: Number(source.hardLimit || MEDIA_SCAN_HARD_LIMIT),
    maxDepth: Number(source.maxDepth || MEDIA_SCAN_MAX_DEPTH),
    truncated,
    hasMore: source.hasMore === true || truncated,
    nextCursor: (source.hasMore === true || truncated) ? 'prepared_later' : null,
    errors: [],
    emptyReason: items.length ? null : 'agent_media_inventory_empty',
    memoryOnly: true,
    persistsToDatabase: false,
    compactTransport: true,
    serverPersistencePlannedLater: true
  };
}

function sanitizeOnlineMediaItem(item) {
  const source = item && typeof item === 'object' && !Array.isArray(item) ? item : {};
  const rootKey = String(source.rootKey || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 30);
  const allowedRoot = MEDIA_PLANNED_ROOTS.some(root => root.key === rootKey);
  if (!allowedRoot) return null;
  const relativePath = normalizeRelativePath(source.relativePath || '');
  if (!relativePath || relativePath.includes('..') || /^[a-zA-Z]:/.test(relativePath)) return null;
  const ext = path.extname(relativePath).toLowerCase() || String(source.extension || '').toLowerCase();
  if (!MEDIA_ALLOWED_EXTENSIONS.includes(ext)) return null;
  const kind = mediaKindForExtension(ext);
  return {
    id: String(source.id || `${rootKey}:${relativePath}`).replace(/[^\w:./-]/g, '_').slice(0, 260),
    rootKey,
    rootLabel: String(source.rootLabel || rootKey).slice(0, 80),
    kind,
    name: path.basename(relativePath).slice(0, 140),
    relativePath,
    publicPath: safePublicMediaPath(source.publicPath || `/${rootKey}/${relativePath}`),
    extension: ext,
    sizeBytes: safeNonNegativeNumber(source.sizeBytes),
    modifiedAt: safeIsoOrNull(source.modifiedAt),
    readOnly: true
  };
}

function buildGroupsFromItems(items, sourceGroups) {
  const groups = buildEmptyGroups();
  for (const key of Object.keys(groups)) {
    const source = sourceGroups && sourceGroups[key] && typeof sourceGroups[key] === 'object' ? sourceGroups[key] : {};
    groups[key].exists = source.exists === false ? false : true;
  }
  for (const item of items) {
    if (!groups[item.rootKey]) continue;
    groups[item.rootKey].items.push(item);
    groups[item.rootKey].count += 1;
  }
  return groups;
}

function buildCountsFromItems(items, sourceCounts) {
  const counts = { total: items.length, sounds: 0, videos: 0, images: 0, audio: 0, video: 0, image: 0, returned: items.length, skipped: 0, totalSeen: items.length };
  if (sourceCounts && Number.isFinite(Number(sourceCounts.skipped))) counts.skipped = Math.max(0, Math.floor(Number(sourceCounts.skipped)));
  if (sourceCounts && Number.isFinite(Number(sourceCounts.totalSeen))) counts.totalSeen = Math.max(items.length, Math.floor(Number(sourceCounts.totalSeen)));
  for (const item of items) {
    if (Object.prototype.hasOwnProperty.call(counts, item.rootKey)) counts[item.rootKey] += 1;
    if (Object.prototype.hasOwnProperty.call(counts, item.kind)) counts[item.kind] += 1;
  }
  return counts;
}

function safePublicMediaPath(value) {
  const raw = String(value || '').replace(/\\/g, '/').replace(/[\u0000-\u001f<>:"|?*]/g, '').slice(0, 260);
  if (!raw || raw.includes('..') || /^[a-zA-Z]:/.test(raw) || raw.startsWith('http://') || raw.startsWith('https://')) return '';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

function safeNonNegativeNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.floor(num);
}

function safeIsoOrNull(value) {
  if (typeof value !== 'string') return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString();
}

function scanLocalInventory({ limit, generatedAt }) {
  const projectRoot = getProjectRoot();
  const items = [];
  const groups = buildEmptyGroups();
  const counts = { total: 0, sounds: 0, videos: 0, images: 0, audio: 0, video: 0, image: 0, returned: 0, skipped: 0, totalSeen: 0 };
  const errors = [];
  let truncated = false;

  for (const root of MEDIA_PLANNED_ROOTS) {
    const absoluteRoot = path.resolve(projectRoot, root.localPathHint);
    if (!absoluteRoot.startsWith(projectRoot)) {
      errors.push({ rootKey: root.key, error: 'root_outside_project' });
      continue;
    }
    if (!fs.existsSync(absoluteRoot)) {
      groups[root.key].exists = false;
      groups[root.key].emptyReason = 'root_missing';
      continue;
    }
    walkRoot({ root, absoluteRoot, currentDir: absoluteRoot, depth: 0, limit, items, groups, counts, errors, truncatedRef: () => truncated, setTruncated: () => { truncated = true; } });
    if (truncated) break;
  }

  items.sort((a, b) => String(a.rootKey).localeCompare(String(b.rootKey)) || String(a.relativePath).localeCompare(String(b.relativePath)));
  for (const key of Object.keys(groups)) {
    groups[key].items.sort((a, b) => String(a.relativePath).localeCompare(String(b.relativePath)));
  }

  counts.total = items.length;
  counts.returned = items.length;

  return {
    prepared: true,
    active: items.length > 0,
    source: 'local_stream_pc_filesystem_readonly',
    routePreparedLater: '/api/remote-agent/media/inventory/status',
    scannedAt: generatedAt,
    roots: MEDIA_PLANNED_ROOTS.map(root => ({ key: root.key, label: root.label, exists: groups[root.key].exists, count: groups[root.key].count, localPathHint: root.localPathHint })),
    items,
    groups,
    counts,
    limit,
    hardLimit: MEDIA_SCAN_HARD_LIMIT,
    maxDepth: MEDIA_SCAN_MAX_DEPTH,
    truncated,
    hasMore: truncated,
    nextCursor: truncated ? 'prepared_later' : null,
    errors,
    emptyReason: items.length ? null : 'no_allowed_media_files_found'
  };
}

function buildEmptyGroups() {
  return {
    sounds: { prepared: true, exists: true, count: 0, items: [], emptyReason: null },
    videos: { prepared: true, exists: true, count: 0, items: [], emptyReason: null },
    images: { prepared: true, exists: true, count: 0, items: [], emptyReason: null }
  };
}

function walkRoot({ root, absoluteRoot, currentDir, depth, limit, items, groups, counts, errors, truncatedRef, setTruncated }) {
  if (truncatedRef()) return;
  if (depth > MEDIA_SCAN_MAX_DEPTH) {
    counts.skipped += 1;
    return;
  }

  let entries = [];
  try {
    entries = fs.readdirSync(currentDir, { withFileTypes: true });
  } catch (err) {
    errors.push({ rootKey: root.key, error: 'read_dir_failed' });
    return;
  }

  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (truncatedRef()) return;
    if (!entry || !entry.name || entry.name.startsWith('.')) continue;
    const absolutePath = path.join(currentDir, entry.name);
    if (!absolutePath.startsWith(absoluteRoot)) {
      counts.skipped += 1;
      continue;
    }
    if (entry.isSymbolicLink()) {
      counts.skipped += 1;
      continue;
    }
    if (entry.isDirectory()) {
      walkRoot({ root, absoluteRoot, currentDir: absolutePath, depth: depth + 1, limit, items, groups, counts, errors, truncatedRef, setTruncated });
      continue;
    }
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!MEDIA_ALLOWED_EXTENSIONS.includes(ext)) {
      counts.skipped += 1;
      continue;
    }
    counts.totalSeen += 1;
    if (items.length >= limit) {
      setTruncated();
      return;
    }
    const rel = normalizeRelativePath(path.relative(absoluteRoot, absolutePath));
    if (!rel || rel.includes('..')) {
      counts.skipped += 1;
      continue;
    }
    let stat = null;
    try { stat = fs.statSync(absolutePath); } catch (err) { counts.skipped += 1; continue; }
    const kind = mediaKindForExtension(ext);
    const item = {
      id: `${root.key}:${rel}`,
      rootKey: root.key,
      rootLabel: root.label,
      kind,
      name: path.basename(rel),
      relativePath: rel,
      publicPath: `${root.publicBasePath}/${rel}`,
      extension: ext,
      sizeBytes: stat.size,
      modifiedAt: stat.mtime ? stat.mtime.toISOString() : null,
      readOnly: true
    };
    items.push(item);
    groups[root.key].items.push(item);
    groups[root.key].count += 1;
    counts[root.key] = (counts[root.key] || 0) + 1;
    counts[kind] = (counts[kind] || 0) + 1;
  }
}

function normalizeRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
}

function mediaKindForExtension(ext) {
  if (MEDIA_AUDIO_EXTENSIONS.has(ext)) return 'audio';
  if (MEDIA_VIDEO_EXTENSIONS.has(ext)) return 'video';
  if (MEDIA_IMAGE_EXTENSIONS.has(ext)) return 'image';
  return 'media';
}

function buildPermissionBlock() {
  return {
    prepared: true,
    modelOnly: true,
    backendEnforcementRequiredBeforeWrites: true,
    readPermission: 'media.read',
    uploadPermission: 'media.upload',
    editPermission: 'media.edit',
    deletePermission: 'media.delete',
    uploadEnabled: false,
    editEnabled: false,
    deleteEnabled: false,
    note: 'Media-Writes bleiben deaktiviert, bis eine echte serverseitige Permission-Middleware fuer Media-Routen freigegeben und getestet ist.'
  };
}

function buildSafetyBlock() {
  return {
    readOnly: true,
    uploadEnabled: false,
    editEnabled: false,
    deleteEnabled: false,
    fileWrite: false,
    databaseWrite: false,
    migrationEnabled: true,
    mediaIndexDataWrite: false,
    shellOrProcessActions: false,
    agentActionsEnabled: false,
    freePathAccessEnabled: false,
    absolutePathsReturned: false,
    secretsExposed: false,
    noUploadInThisStep: true,
    noDeleteInThisStep: true
  };
}

function buildMediaRoutesSummary(context = {}) {
  const persistentIndex = ensurePersistentIndexFoundation(context);
  return {
    prepared: true,
    routeBuild: BUILD,
    statusApiVersion: STATUS_API_VERSION,
    previousStatusApiVersion: PREVIOUS_STATUS_API_VERSION,
    runtimeMode: context && context.config && context.config.runtimeMode ? String(context.config.runtimeMode) : 'online',
    readOnly: true,
    uploadEnabled: false,
    deleteEnabled: false,
    permissionModelPrepared: true,
    localInventoryReadonlyPrepared: true,
    onlineAgentInventoryReadonlyPrepared: true,
    persistentIndex,
    scanPolicy: { defaultLimit: MEDIA_SCAN_DEFAULT_LIMIT, hardLimit: MEDIA_SCAN_HARD_LIMIT, maxDepth: MEDIA_SCAN_MAX_DEPTH, cursorPreparedLater: true },
    routes: [
      { method: 'GET', path: MEDIA_STATUS_PATH, description: 'Media-System read-only Status, lokales Inventar im Lokalmodus und Online-Inventar aus Agent-WSS-Memory-Cache; Persistent-Index-Schema vorbereitet; keine Uploads, keine Deletes, keine Media-Daten-Writes', readOnly: true }
    ],
    safety: {
      noFileWrite: true,
      mediaIndexDataWrite: false,
      noAgentActionExecution: true,
      noShellOrProcessActions: true
    }
  };
}

module.exports = {
  MEDIA_STATUS_PATH,
  STATUS_API_VERSION,
  BUILD,
  registerMediaReadonlyRoutes,
  buildMediaReadonlyStatus,
  buildMediaRoutesSummary,
  ensurePersistentIndexFoundation
};
