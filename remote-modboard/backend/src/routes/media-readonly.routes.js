'use strict';

const fs = require('fs');
const path = require('path');
const { buildAgentMediaInventoryStatusResponse } = require('../services/agent-runtime.service');
const { buildDatabaseReadiness, withReadOnlyConnection, publicDbError } = require('../services/db.service');

const STATUS_API_VERSION = 'rdap_media_index_schema_status_readonly_042.v1';
const PREVIOUS_STATUS_API_VERSION = 'rdap_media_persistent_index_foundation_blocked_034b.v1';
const BUILD = 'RDAP_0.2.42_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_STATUS_READONLY';
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

const EXPECTED_PERSISTENT_INDEX_COLUMNS = Object.freeze([
  'id',
  'root_key',
  'kind',
  'relative_path',
  'name',
  'extension',
  'size_bytes',
  'modified_at',
  'first_seen_at',
  'last_seen_at',
  'deleted',
  'source',
  'sync_version',
  'updated_at'
]);

const EXPECTED_PERSISTENT_INDEX_KEYS = Object.freeze([
  'PRIMARY',
  'idx_remote_media_index_root_path',
  'idx_remote_media_index_kind',
  'idx_remote_media_index_deleted_last_seen'
]);

let persistentIndexSchemaState = null;

function registerMediaReadonlyRoutes(app, context) {
  app.get(MEDIA_STATUS_PATH, async (req, res) => {
    res.json(await buildMediaReadonlyStatus(context, req));
  });
}

async function buildMediaReadonlyStatus(context = {}, req = null) {
  const runtimeMode = context && context.config && context.config.runtimeMode ? String(context.config.runtimeMode) : 'online';
  const generatedAt = new Date().toISOString();
  const localRuntime = runtimeMode === 'local';
  const limit = readLimit(req);
  const inspectDatabase = shouldInspectPersistentIndex(req);
  const persistentIndex = inspectDatabase
    ? await inspectPersistentIndexSchema(context)
    : ensurePersistentIndexFoundation(context);
  const agentMediaStatus = localRuntime ? null : safeBuildAgentMediaInventoryStatus();
  const inventory = localRuntime
    ? scanLocalInventory({ limit, generatedAt })
    : buildOnlineAgentMediaInventory({ limit, generatedAt, agentMediaStatus });

  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_media_readonly',
    moduleVersion: context.appVersion || '0.2.42',
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
      inspectDatabase ? 'Persistent-Index-Schema wurde read-only ueber Remote-Modboard-MariaDB diagnostiziert.' : 'Persistent-Index-Schema kann mit ?db=1 read-only ueber Remote-Modboard-MariaDB diagnostiziert werden.',
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
    serverPersistenceFoundation: false,
    persistentIndexPrepared: true,
    persistentIndexBlocked: persistentIndex && persistentIndex.blocked === true,
    persistentIndexTargetDatabase: 'remote_modboard_mariadb',
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
      : 'Online zeigt weiter den read-only Agent-Memory-Index. Persistent Index wird nur bei ?db=1 diagnostisch aus MariaDB gelesen; Writes bleiben aus.'
  };
}

function shouldInspectPersistentIndex(req) {
  return Boolean(req && req.query && String(req.query.db || '') === '1');
}

function readLimit(req) {
  const raw = req && req.query ? Number.parseInt(String(req.query.limit || ''), 10) : 0;
  if (!Number.isFinite(raw) || raw <= 0) return MEDIA_SCAN_DEFAULT_LIMIT;
  return Math.max(1, Math.min(raw, MEDIA_SCAN_HARD_LIMIT));
}

function getProjectRoot() {
  return path.resolve(__dirname, '..', '..', '..', '..');
}

function ensurePersistentIndexFoundation(context = {}) {
  if (persistentIndexSchemaState) return { ...persistentIndexSchemaState, cached: true };

  const configDatabase = context && context.config && context.config.database ? context.config.database : {};
  persistentIndexSchemaState = buildPersistentIndexState({
    reason: 'schema_status_readonly_available_with_db_query',
    database: {
      engine: configDatabase.engine || 'MariaDB',
      driver: configDatabase.driver || 'mysql2/promise',
      configured: Boolean(configDatabase.host && configDatabase.name && configDatabase.user),
      writeEnabled: false,
      migrationEnabled: false
    }
  });
  return persistentIndexSchemaState;
}

function buildPersistentIndexState(input = {}) {
  return {
    prepared: true,
    ok: false,
    blocked: true,
    inspected: false,
    detected: null,
    readOnly: true,
    tableName: PERSISTENT_INDEX_TABLE,
    schemaModule: PERSISTENT_INDEX_SCHEMA_MODULE,
    schemaVersion: 0,
    targetSchemaVersion: PERSISTENT_INDEX_SCHEMA_VERSION,
    reason: input.reason || 'persistent_index_schema_status_readonly_not_requested',
    targetDatabase: 'remote_modboard_mariadb',
    rejectedDatabaseLayer: 'backend/core/database.js sqlite repo-root layer',
    migrationEnabled: false,
    writeEnabled: false,
    dataWritesEnabled: false,
    compatibleForRead: false,
    compatibleForWrite: false,
    fallbackReadsEnabled: false,
    localIsMaster: true,
    storesFileContents: false,
    storesAbsolutePaths: false,
    columns: [],
    indexes: [],
    expectedColumns: EXPECTED_PERSISTENT_INDEX_COLUMNS.slice(),
    expectedIndexes: EXPECTED_PERSISTENT_INDEX_KEYS.slice(),
    missingColumns: [],
    missingIndexes: [],
    itemCount: 0,
    database: input.database || null,
    note: '0.2.42 haelt den Media-Index read-only. Echte Schema-Diagnose erfolgt nur bei ?db=1 ueber die bestehende Remote-Modboard-MariaDB-Schicht.'
  };
}

async function inspectPersistentIndexSchema(context = {}) {
  const config = context && context.config ? context.config : {};
  const readiness = buildDatabaseReadiness(config);
  const base = buildPersistentIndexState({
    reason: 'schema_inspection_requested_readonly',
    database: {
      engine: config.database && config.database.engine ? config.database.engine : 'MariaDB',
      driver: config.database && config.database.driver ? config.database.driver : 'mysql2/promise',
      configured: readiness.configured,
      driverAvailable: readiness.driverAvailable,
      writeEnabled: false,
      migrationEnabled: false,
      error: readiness.error
    }
  });

  if (!readiness.configured || !readiness.driverAvailable) {
    return {
      ...base,
      ok: false,
      blocked: true,
      inspected: false,
      detected: false,
      reason: readiness.error || 'db_not_ready',
      error: readiness.error || 'db_not_ready'
    };
  }

  try {
    return await withReadOnlyConnection(config, async (connection) => {
      const [tableRows] = await connection.query(
        `
          SELECT TABLE_NAME AS table_name
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
          LIMIT 1
        `,
        [PERSISTENT_INDEX_TABLE]
      );
      const detected = Array.isArray(tableRows) && tableRows.length > 0;

      if (!detected) {
        return {
          ...base,
          ok: false,
          blocked: true,
          inspected: true,
          detected: false,
          reason: 'remote_media_index_table_missing',
          itemCount: 0
        };
      }

      const [columnRows] = await connection.query(
        `
          SELECT
            COLUMN_NAME AS column_name,
            DATA_TYPE AS data_type,
            IS_NULLABLE AS is_nullable,
            COLUMN_DEFAULT AS column_default,
            COLUMN_KEY AS column_key,
            EXTRA AS extra,
            ORDINAL_POSITION AS ordinal_position
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
          ORDER BY ORDINAL_POSITION ASC
        `,
        [PERSISTENT_INDEX_TABLE]
      );
      const [indexRows] = await connection.query(
        `
          SELECT
            INDEX_NAME AS index_name,
            NON_UNIQUE AS non_unique,
            SEQ_IN_INDEX AS seq_in_index,
            COLUMN_NAME AS column_name
          FROM INFORMATION_SCHEMA.STATISTICS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
          ORDER BY INDEX_NAME ASC, SEQ_IN_INDEX ASC
        `,
        [PERSISTENT_INDEX_TABLE]
      );
      const [countRows] = await connection.query(`SELECT COUNT(*) AS row_count FROM ${PERSISTENT_INDEX_TABLE}`);

      const columns = normalizeColumnRows(columnRows);
      const indexes = normalizeIndexRows(indexRows);
      const detectedColumnNames = columns.map(column => column.name);
      const detectedIndexNames = indexes.map(index => index.name);
      const missingColumns = EXPECTED_PERSISTENT_INDEX_COLUMNS.filter(column => !detectedColumnNames.includes(column));
      const missingIndexes = EXPECTED_PERSISTENT_INDEX_KEYS.filter(index => !detectedIndexNames.includes(index));
      const itemCount = Number(countRows && countRows[0] && countRows[0].row_count ? countRows[0].row_count : 0);
      const compatibleForRead = missingColumns.length === 0 && missingIndexes.length === 0;

      return {
        ...base,
        ok: compatibleForRead,
        blocked: false,
        inspected: true,
        detected: true,
        schemaVersion: compatibleForRead ? PERSISTENT_INDEX_SCHEMA_VERSION : 0,
        reason: compatibleForRead ? 'schema_compatible_for_read_readonly' : 'schema_incomplete_for_read',
        columns,
        indexes,
        missingColumns,
        missingIndexes,
        itemCount,
        compatibleForRead,
        compatibleForWrite: false,
        writeEnabled: false,
        dataWritesEnabled: false,
        migrationEnabled: false,
        fallbackReadsEnabled: false,
        database: {
          ...base.database,
          reachable: true,
          writeEnabled: false,
          migrationEnabled: false
        },
        note: 'remote_media_index wurde read-only ueber INFORMATION_SCHEMA und SELECT COUNT(*) geprueft. Es wurden keine Media-Daten geschrieben.'
      };
    });
  } catch (err) {
    const publicError = publicDbError(err).code;
    return {
      ...base,
      ok: false,
      blocked: true,
      inspected: false,
      detected: false,
      reason: publicError || 'persistent_index_schema_read_failed',
      error: publicError || 'persistent_index_schema_read_failed'
    };
  }
}

function normalizeColumnRows(rows) {
  return (Array.isArray(rows) ? rows : []).map(row => ({
    name: String(row.column_name || ''),
    dataType: String(row.data_type || ''),
    nullable: String(row.is_nullable || '').toUpperCase() === 'YES',
    defaultValue: row.column_default === null || typeof row.column_default === 'undefined' ? null : String(row.column_default),
    key: String(row.column_key || ''),
    extra: String(row.extra || ''),
    ordinal: Number(row.ordinal_position || 0)
  })).filter(column => column.name);
}

function normalizeIndexRows(rows) {
  const byName = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    const name = String(row.index_name || '');
    if (!name) continue;
    if (!byName.has(name)) {
      byName.set(name, {
        name,
        unique: Number(row.non_unique || 0) === 0,
        columns: []
      });
    }
    byName.get(name).columns.push(String(row.column_name || ''));
  }
  return Array.from(byName.values()).map(index => ({
    ...index,
    columns: index.columns.filter(Boolean)
  }));
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
  const raw = String(value || '').replace(/\\/g, '/').replace(/[\u0000-\u001f<>":|?*]/g, '').slice(0, 260);
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
    migrationEnabled: false,
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
    persistentIndexSchemaStatusReadonly: {
      prepared: true,
      route: MEDIA_STATUS_PATH,
      query: 'db=1',
      tableName: PERSISTENT_INDEX_TABLE,
      usesInformationSchemaColumns: true,
      usesInformationSchemaStatistics: true,
      readsRowCount: true,
      compatibleForReadPrepared: true,
      compatibleForWrite: false,
      writeEnabled: false,
      dataWritesEnabled: false,
      migrationEnabled: false
    },
    scanPolicy: { defaultLimit: MEDIA_SCAN_DEFAULT_LIMIT, hardLimit: MEDIA_SCAN_HARD_LIMIT, maxDepth: MEDIA_SCAN_MAX_DEPTH, cursorPreparedLater: true },
    routes: [
      { method: 'GET', path: MEDIA_STATUS_PATH, description: 'Media-System read-only Status, lokales Inventar im Lokalmodus und Online-Inventar aus Agent-WSS-Memory-Cache; Persistent Index Schema-Diagnose optional mit ?db=1 ueber Remote-Modboard-MariaDB; keine Uploads, keine Deletes, keine Media-Daten-Writes', readOnly: true }
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
  ensurePersistentIndexFoundation,
  inspectPersistentIndexSchema
};
