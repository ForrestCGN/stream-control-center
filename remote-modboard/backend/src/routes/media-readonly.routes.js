'use strict';

const fs = require('fs');
const path = require('path');

const STATUS_API_VERSION = 'rdap_media_local_inventory_readonly_025.v1';
const BUILD = 'RDAP_0.2.25_MEDIA_LOCAL_INVENTORY_READONLY';
const MEDIA_STATUS_PATH = '/api/remote/media/status';

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
  const inventory = localRuntime ? scanLocalInventory({ limit, generatedAt }) : buildPendingInventory({ localRuntime, limit });

  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_media_readonly',
    moduleVersion: context.appVersion || '0.2.25',
    moduleBuild: context.moduleBuild || BUILD,
    routeBuild: BUILD,
    statusApiVersion: STATUS_API_VERSION,
    route: MEDIA_STATUS_PATH,
    generatedAt,
    runtimeMode,
    readOnly: true,
    prepared: true,
    active: true,
    status: localRuntime ? (inventory.active ? 'local_media_inventory_available' : 'local_media_inventory_empty') : 'online_media_inventory_sync_pending',
    title: 'Media-System',
    summary: localRuntime
      ? 'Lokales Media-Inventar wurde read-only erfasst. Upload, Bearbeiten und Loeschen bleiben aus.'
      : 'Online-Media-Grundlage ist vorbereitet. Echte lokale Medien kommen spaeter nur ueber einen separaten read-only Agent-Sync.',
    mode: {
      local: localRuntime,
      online: !localRuntime,
      localInventoryExpected: localRuntime,
      onlineAgentInventorySyncPreparedLater: true,
      singleUiTruth: true,
      remoteModboardUi: true,
      localDashboardProfileUsesSameUi: true
    },
    permissions: buildPermissionBlock(),
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
      'Online-Media-Inventar spaeter per Agent-WSS Memory-only synchronisieren.',
      'Filter/Paging spaeter ohne Breaking Change ueber limit/root/type/cursor ausbauen.',
      'Upload/Edit/Delete erst nach separatem Permission-/Audit-/Confirm-Step.'
    ]
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
  return String(value || '').replace(/\\/g, '/').replace(/^\/+/g, '');
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
  return {
    prepared: true,
    routeBuild: BUILD,
    statusApiVersion: STATUS_API_VERSION,
    runtimeMode: context && context.config && context.config.runtimeMode ? String(context.config.runtimeMode) : 'online',
    readOnly: true,
    uploadEnabled: false,
    deleteEnabled: false,
    permissionModelPrepared: true,
    localInventoryReadonlyPrepared: true,
    scanPolicy: { defaultLimit: MEDIA_SCAN_DEFAULT_LIMIT, hardLimit: MEDIA_SCAN_HARD_LIMIT, maxDepth: MEDIA_SCAN_MAX_DEPTH, cursorPreparedLater: true },
    routes: [
      { method: 'GET', path: MEDIA_STATUS_PATH, description: 'Media-System read-only Status und lokales Inventar im Lokalmodus; keine Uploads, keine Deletes, keine Writes', readOnly: true }
    ],
    safety: {
      noFileWrite: true,
      noDatabaseWrite: true,
      noMigration: true,
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
  buildMediaRoutesSummary
};
