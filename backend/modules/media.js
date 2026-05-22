'use strict';

/**
 * STEP274A1C - Central Media Management Core
 *
 * Zentrale Medien-Registry fuer Audio/Video/Bilder/Animationen.
 * Wichtig:
 * - Keine bestehenden Assets werden verschoben oder geloescht.
 * - Neue Uploads landen unter htdocs/assets/media/<type>/.
 * - Bestehende Asset-Ordner werden nur gescannt und in media_assets registriert.
 * - Commands/Alerts/Sounds sollen Medien spaeter ueber media_assets verwenden.
 */

const fs = require('fs');
const path = require('path');
const multer = require('multer');

const db = require('../core/database');
const core = require('./helpers/helper_core');
const config = require('./helpers/helper_config');
const mediaHelper = require('./helpers/helper_media');

const MODULE_NAME = 'media';
const SCHEMA_VERSION = 1;
const API_PREFIX = '/api/media';

const MEDIA_TYPES = {
  audio: {
    label: 'Audio',
    icon: '🔊',
    uploadDir: ['media', 'audio'],
    extensions: ['.mp3', '.wav', '.ogg', '.m4a'],
    legacyDirs: [['sounds'], ['sounds', 'alerts'], ['sounds', 'commands'], ['soundalerts']]
  },
  video: {
    label: 'Video',
    icon: '🎬',
    uploadDir: ['media', 'video'],
    extensions: ['.mp4', '.webm', '.mov', '.mkv'],
    legacyDirs: [['videos'], ['video'], ['soundalerts', 'video'], ['media', 'video']]
  },
  image: {
    label: 'Bilder',
    icon: '🖼️',
    uploadDir: ['media', 'image'],
    extensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
    legacyDirs: [['images'], ['images', 'alerts'], ['media', 'image']]
  },
  animation: {
    label: 'Animationen',
    icon: '✨',
    uploadDir: ['media', 'animation'],
    extensions: ['.webm', '.gif', '.json'],
    legacyDirs: [['animations'], ['media', 'animation']]
  }
};

const state = {
  initialized: false,
  loadedAt: '',
  schemaOk: false,
  schemaError: '',
  lastError: '',
  lastScanAt: '',
  lastUploadAt: '',
  lastChangeAt: ''
};

function nowIso() {
  return core.nowIso ? core.nowIso() : new Date().toISOString();
}

function clean(value) {
  return String(value ?? '').trim();
}

function safeJsonEncode(value) {
  try { return JSON.stringify(value ?? null); }
  catch (_) { return 'null'; }
}

function safeJsonDecode(value, fallback = null) {
  try {
    if (value === undefined || value === null || value === '') return fallback;
    return JSON.parse(String(value));
  } catch (_) {
    return fallback;
  }
}

function normalizeSlashes(value) {
  return String(value || '').replace(/\\/g, '/');
}

function getAssetsDir() {
  return config.getAssetsDir();
}

function typeForExt(ext) {
  const cleanExt = String(ext || '').toLowerCase();
  for (const [type, meta] of Object.entries(MEDIA_TYPES)) {
    if (meta.extensions.includes(cleanExt)) return type;
  }
  return 'unknown';
}

function typeMeta(type) {
  return MEDIA_TYPES[type] || MEDIA_TYPES.audio;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function ensureMediaDirs() {
  const assetsDir = getAssetsDir();
  for (const meta of Object.values(MEDIA_TYPES)) {
    ensureDir(path.join(assetsDir, ...meta.uploadDir));
  }
  return true;
}

function ensureSchema() {
  try {
    db.ensureReady();
    db.exec(`
      CREATE TABLE IF NOT EXISTS media_assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT 'general',
        display_name TEXT NOT NULL DEFAULT '',
        file_name TEXT NOT NULL DEFAULT '',
        relative_path TEXT NOT NULL UNIQUE,
        web_path TEXT NOT NULL DEFAULT '',
        absolute_path TEXT NOT NULL DEFAULT '',
        mime_type TEXT NOT NULL DEFAULT '',
        size_bytes INTEGER NOT NULL DEFAULT 0,
        duration_ms INTEGER NOT NULL DEFAULT 0,
        width INTEGER NOT NULL DEFAULT 0,
        height INTEGER NOT NULL DEFAULT 0,
        has_audio INTEGER NOT NULL DEFAULT 0,
        has_video INTEGER NOT NULL DEFAULT 0,
        tags_json TEXT NOT NULL DEFAULT '[]',
        source TEXT NOT NULL DEFAULT 'scan',
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL DEFAULT ''
      );
    `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(type);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_media_assets_category ON media_assets(category);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_media_assets_status ON media_assets(status);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_media_assets_source ON media_assets(source);');
    if (typeof db.setSchemaVersion === 'function') db.setSchemaVersion(MODULE_NAME, SCHEMA_VERSION);
    state.schemaOk = true;
    state.schemaError = '';
    ensureMediaDirs();
    return true;
  } catch (err) {
    state.schemaOk = false;
    state.schemaError = err.message || String(err);
    state.lastError = state.schemaError;
    return false;
  }
}

function extensionAllowedForType(fileName, type) {
  const ext = path.extname(String(fileName || '')).toLowerCase();
  const meta = typeMeta(type);
  return meta.extensions.includes(ext);
}

function sanitizeFileName(fileName) {
  const parsed = path.parse(String(fileName || 'upload'));
  const base = parsed.name
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'media';
  const ext = parsed.ext.toLowerCase();
  return `${base}${ext}`;
}

function makeUniqueTarget(dir, fileName) {
  const cleanName = sanitizeFileName(fileName);
  const parsed = path.parse(cleanName);
  let candidate = path.join(dir, cleanName);
  let index = 2;
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${parsed.name}_${index}${parsed.ext}`);
    index += 1;
  }
  return candidate;
}

function inferMimeType(fileName, type) {
  const ext = path.extname(String(fileName || '')).toLowerCase();
  const map = {
    '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4',
    '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.mkv': 'video/x-matroska',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
    '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json'
  };
  return map[ext] || (type === 'audio' ? 'audio/*' : type === 'video' ? 'video/*' : type === 'image' ? 'image/*' : 'application/octet-stream');
}

function mediaInfoForFile(absPath, type) {
  const stat = fs.statSync(absPath);
  let info = { ok: false, durationMs: 0, width: 0, height: 0, hasAudio: false, hasVideo: false, error: '' };
  try {
    info = mediaHelper.readMediaInfo(absPath, { cache: false });
  } catch (err) {
    info.error = err.message || String(err);
  }
  return {
    sizeBytes: Number(stat.size || 0),
    durationMs: Number(info.durationMs || 0),
    width: Number(info.width || 0),
    height: Number(info.height || 0),
    hasAudio: info.hasAudio ? 1 : 0,
    hasVideo: info.hasVideo ? 1 : 0,
    mediaInfoOk: !!info.ok,
    mediaInfoError: info.error || '',
    mimeType: inferMimeType(absPath, type)
  };
}

function rowToAsset(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    type: row.type || '',
    category: row.category || 'general',
    displayName: row.display_name || '',
    fileName: row.file_name || '',
    relativePath: row.relative_path || '',
    webPath: row.web_path || '',
    absolutePath: row.absolute_path || '',
    mimeType: row.mime_type || '',
    sizeBytes: Number(row.size_bytes || 0),
    durationMs: Number(row.duration_ms || 0),
    width: Number(row.width || 0),
    height: Number(row.height || 0),
    hasAudio: Number(row.has_audio || 0) === 1,
    hasVideo: Number(row.has_video || 0) === 1,
    tags: safeJsonDecode(row.tags_json, []),
    source: row.source || '',
    status: row.status || 'active',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
    lastSeenAt: row.last_seen_at || ''
  };
}

function upsertAsset(input = {}) {
  ensureSchema();
  const now = nowIso();
  const relativePath = normalizeSlashes(clean(input.relativePath || input.relative_path));
  if (!relativePath) throw new Error('media_relative_path_missing');

  const existing = db.get('SELECT * FROM media_assets WHERE relative_path = :relativePath', { relativePath });
  const current = rowToAsset(existing);
  const data = {
    type: clean(input.type || current?.type || typeForExt(path.extname(relativePath))),
    category: clean(input.category || current?.category || 'general') || 'general',
    displayName: clean(input.displayName || input.display_name || current?.displayName || path.parse(relativePath).name),
    fileName: clean(input.fileName || input.file_name || current?.fileName || path.basename(relativePath)),
    relativePath,
    webPath: clean(input.webPath || input.web_path || current?.webPath || `/assets/${relativePath}`),
    absolutePath: clean(input.absolutePath || input.absolute_path || current?.absolutePath || path.join(getAssetsDir(), relativePath)),
    mimeType: clean(input.mimeType || input.mime_type || current?.mimeType || inferMimeType(relativePath, input.type)),
    sizeBytes: Number(input.sizeBytes ?? input.size_bytes ?? current?.sizeBytes ?? 0) || 0,
    durationMs: Number(input.durationMs ?? input.duration_ms ?? current?.durationMs ?? 0) || 0,
    width: Number(input.width ?? current?.width ?? 0) || 0,
    height: Number(input.height ?? current?.height ?? 0) || 0,
    hasAudio: input.hasAudio || input.has_audio ? 1 : 0,
    hasVideo: input.hasVideo || input.has_video ? 1 : 0,
    tagsJson: safeJsonEncode(Array.isArray(input.tags) ? input.tags : (current?.tags || [])),
    source: clean(input.source || current?.source || 'scan') || 'scan',
    status: clean(input.status || current?.status || 'active') || 'active',
    createdAt: current?.createdAt || now,
    updatedAt: now,
    lastSeenAt: clean(input.lastSeenAt || input.last_seen_at || now)
  };

  db.run(`
    INSERT INTO media_assets (
      type, category, display_name, file_name, relative_path, web_path, absolute_path,
      mime_type, size_bytes, duration_ms, width, height, has_audio, has_video,
      tags_json, source, status, created_at, updated_at, last_seen_at
    ) VALUES (
      :type, :category, :displayName, :fileName, :relativePath, :webPath, :absolutePath,
      :mimeType, :sizeBytes, :durationMs, :width, :height, :hasAudio, :hasVideo,
      :tagsJson, :source, :status, :createdAt, :updatedAt, :lastSeenAt
    )
    ON CONFLICT(relative_path) DO UPDATE SET
      type = excluded.type,
      category = excluded.category,
      display_name = excluded.display_name,
      file_name = excluded.file_name,
      web_path = excluded.web_path,
      absolute_path = excluded.absolute_path,
      mime_type = excluded.mime_type,
      size_bytes = excluded.size_bytes,
      duration_ms = excluded.duration_ms,
      width = excluded.width,
      height = excluded.height,
      has_audio = excluded.has_audio,
      has_video = excluded.has_video,
      tags_json = excluded.tags_json,
      source = CASE WHEN media_assets.source = 'upload' THEN media_assets.source ELSE excluded.source END,
      status = excluded.status,
      updated_at = excluded.updated_at,
      last_seen_at = excluded.last_seen_at
  `, data);

  return rowToAsset(db.get('SELECT * FROM media_assets WHERE relative_path = :relativePath', { relativePath }));
}

function listAssets(options = {}) {
  ensureSchema();
  const requestedType = clean(options.type || '');
  const requestedCategory = clean(options.category || '');
  const requestedStatus = clean(options.status || 'active');
  const requestedQuery = clean(options.q || '');
  const params = { limit: Math.max(1, Math.min(500, Number(options.limit || 200))) };
  const where = [];

  if (requestedType) { where.push('type = :type'); params.type = requestedType; }
  if (requestedCategory) { where.push('category = :category'); params.category = requestedCategory; }
  if (requestedStatus && requestedStatus !== 'all') { where.push('status = :status'); params.status = requestedStatus; }
  if (requestedQuery) {
    where.push('(lower(display_name) LIKE :q OR lower(file_name) LIKE :q OR lower(relative_path) LIKE :q OR lower(category) LIKE :q)');
    params.q = '%' + requestedQuery.toLowerCase() + '%';
  }

  const rows = db.all(`
    SELECT *
    FROM media_assets
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY type ASC, category ASC, display_name COLLATE NOCASE ASC
    LIMIT :limit
  `, params);

  return rows.map(rowToAsset).filter(Boolean);
}

function scanFile(absPath, source, category = 'general') {
  const ext = path.extname(absPath).toLowerCase();
  const type = typeForExt(ext);
  if (type === 'unknown') return null;
  const assetsDir = path.resolve(getAssetsDir());
  const target = path.resolve(absPath);
  if (!target.startsWith(assetsDir)) return null;

  const rel = normalizeSlashes(path.relative(assetsDir, target));
  const info = mediaInfoForFile(target, type);

  return upsertAsset({
    type,
    category,
    displayName: path.parse(target).name,
    fileName: path.basename(target),
    relativePath: rel,
    webPath: `/assets/${rel}`,
    absolutePath: target,
    mimeType: info.mimeType,
    sizeBytes: info.sizeBytes,
    durationMs: info.durationMs,
    width: info.width,
    height: info.height,
    hasAudio: !!info.hasAudio,
    hasVideo: !!info.hasVideo,
    source,
    status: 'active',
    lastSeenAt: nowIso()
  });
}

function walkDir(dir, allowedExtensions, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '_backup_loudness', 'normalized', 'generated'].includes(entry.name)) continue;
      walkDir(full, allowedExtensions, files);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (allowedExtensions.includes(ext)) files.push(full);
    }
  }
  return files;
}

function scanAssets() {
  ensureSchema();
  const assetsDir = getAssetsDir();
  const touched = [];
  const errors = [];

  for (const [_type, meta] of Object.entries(MEDIA_TYPES)) {
    const dirs = [path.join(assetsDir, ...meta.uploadDir), ...meta.legacyDirs.map(parts => path.join(assetsDir, ...parts))];
    const uniqueDirs = Array.from(new Set(dirs.map(dir => path.resolve(dir))));
    for (const dir of uniqueDirs) {
      if (!fs.existsSync(dir)) continue;
      const source = dir.includes(path.join('assets', 'media')) ? 'media_dir' : 'legacy_scan';
      const category = source === 'media_dir' ? 'general' : 'legacy';
      const files = walkDir(dir, meta.extensions, []);
      for (const file of files) {
        try {
          const asset = scanFile(file, source, category);
          if (asset) touched.push(asset);
        } catch (err) {
          errors.push({ file, error: err.message || String(err) });
        }
      }
    }
  }

  state.lastScanAt = nowIso();
  state.lastChangeAt = state.lastScanAt;
  return { ok: errors.length === 0, scanned: touched.length, errors, assets: touched, updatedAt: state.lastScanAt };
}

function readBody(req) {
  return req.body && typeof req.body === 'object' ? req.body : {};
}

function param(req, name, fallback = '') {
  if (typeof core.getParam === 'function') return core.getParam(req, name, fallback);
  return req.query?.[name] ?? req.body?.[name] ?? fallback;
}

function getUploadDir(type) {
  const meta = typeMeta(type);
  return ensureDir(path.join(getAssetsDir(), ...meta.uploadDir));
}

const uploadStorage = multer.diskStorage({
  destination(req, file, cb) {
    try {
      const requestedType = clean(param(req, 'type', '')) || typeForExt(path.extname(file.originalname));
      const type = MEDIA_TYPES[requestedType] ? requestedType : typeForExt(path.extname(file.originalname));
      if (!MEDIA_TYPES[type]) return cb(new Error('media_type_not_supported'));
      cb(null, getUploadDir(type));
    } catch (err) { cb(err); }
  },
  filename(req, file, cb) {
    try {
      const requestedType = clean(param(req, 'type', '')) || typeForExt(path.extname(file.originalname));
      const type = MEDIA_TYPES[requestedType] ? requestedType : typeForExt(path.extname(file.originalname));
      const target = makeUniqueTarget(getUploadDir(type), file.originalname);
      cb(null, path.basename(target));
    } catch (err) { cb(err); }
  }
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: Number(process.env.MEDIA_UPLOAD_MAX_BYTES || 250 * 1024 * 1024) },
  fileFilter(req, file, cb) {
    const type = clean(param(req, 'type', '')) || typeForExt(path.extname(file.originalname));
    const finalType = MEDIA_TYPES[type] ? type : typeForExt(path.extname(file.originalname));
    if (!MEDIA_TYPES[finalType]) return cb(new Error('media_type_not_supported'));
    if (!extensionAllowedForType(file.originalname, finalType)) return cb(new Error('media_extension_not_allowed'));
    cb(null, true);
  }
});

function uploadOne(req, res) {
  upload.single('file')(req, res, err => {
    if (err) return res.status(400).json({ ok: false, error: err.message || String(err) });
    try {
      if (!req.file?.path) return res.status(400).json({ ok: false, error: 'file_missing' });
      const category = clean(param(req, 'category', 'general')) || 'general';
      const displayName = clean(param(req, 'displayName', '')) || path.parse(req.file.originalname).name;
      const asset = scanFile(req.file.path, 'upload', category);
      if (!asset) return res.status(400).json({ ok: false, error: 'asset_registration_failed' });
      const saved = upsertAsset({ ...asset, displayName, category, source: 'upload' });
      state.lastUploadAt = nowIso();
      state.lastChangeAt = state.lastUploadAt;
      return res.json({ ok: true, asset: saved });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message || String(e) });
    }
  });
}

function updateAsset(req, res) {
  try {
    const body = readBody(req);
    const id = Number(body.id || param(req, 'id', 0));
    if (!id) return res.status(400).json({ ok: false, error: 'id_missing' });
    const current = rowToAsset(db.get('SELECT * FROM media_assets WHERE id = :id', { id }));
    if (!current) return res.status(404).json({ ok: false, error: 'asset_not_found' });
    const saved = upsertAsset({
      ...current,
      displayName: body.displayName ?? body.display_name ?? current.displayName,
      category: body.category ?? current.category,
      tags: Array.isArray(body.tags) ? body.tags : current.tags,
      status: body.status ?? current.status,
      source: current.source
    });
    state.lastChangeAt = nowIso();
    return res.json({ ok: true, asset: saved });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
}

function deleteAsset(req, res) {
  try {
    const body = readBody(req);
    const id = Number(body.id || param(req, 'id', 0));
    const deleteFile = ['1', 'true', 'yes', 'ja'].includes(clean(body.deleteFile ?? param(req, 'deleteFile', 'false')).toLowerCase());
    if (!id) return res.status(400).json({ ok: false, error: 'id_missing' });
    const asset = rowToAsset(db.get('SELECT * FROM media_assets WHERE id = :id', { id }));
    if (!asset) return res.status(404).json({ ok: false, error: 'asset_not_found' });

    if (deleteFile) {
      const assetsDir = path.resolve(getAssetsDir());
      const abs = path.resolve(asset.absolutePath);
      if (!abs.startsWith(assetsDir)) return res.status(400).json({ ok: false, error: 'unsafe_asset_path' });
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
      db.run('DELETE FROM media_assets WHERE id = :id', { id });
    } else {
      db.run('UPDATE media_assets SET status = :status, updated_at = :updatedAt WHERE id = :id', { id, status: 'deleted', updatedAt: nowIso() });
    }
    state.lastChangeAt = nowIso();
    return res.json({ ok: true, deleted: true, fileDeleted: deleteFile, asset });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
}

function statusPayload() {
  ensureSchema();
  const counts = {};
  for (const type of Object.keys(MEDIA_TYPES)) {
    const row = db.get('SELECT COUNT(*) AS count FROM media_assets WHERE type = :type AND status = :status', { type, status: 'active' });
    counts[type] = Number(row?.count || 0);
  }
  const total = db.get('SELECT COUNT(*) AS count FROM media_assets WHERE status = :status', { status: 'active' });
  return {
    ok: true,
    module: MODULE_NAME,
    version: 1,
    step: 'STEP274A1C',
    initialized: state.initialized,
    schemaOk: state.schemaOk,
    schemaError: state.schemaError,
    lastError: state.lastError,
    loadedAt: state.loadedAt,
    lastScanAt: state.lastScanAt,
    lastUploadAt: state.lastUploadAt,
    lastChangeAt: state.lastChangeAt,
    assetsDir: getAssetsDir(),
    mediaDirs: Object.fromEntries(Object.entries(MEDIA_TYPES).map(([type, meta]) => [type, normalizeSlashes(path.join(getAssetsDir(), ...meta.uploadDir))])),
    counts: { total: Number(total?.count || 0), ...counts },
    types: Object.entries(MEDIA_TYPES).map(([id, meta]) => ({ id, label: meta.label, icon: meta.icon, extensions: meta.extensions, uploadDir: normalizeSlashes(path.join('assets', ...meta.uploadDir)) })),
    routes: [
      { method: 'GET', path: `${API_PREFIX}/status`, purpose: 'Media-Core Status und Zaehlwerte' },
      { method: 'GET', path: `${API_PREFIX}/list`, purpose: 'Registrierte Medien auflisten' },
      { method: 'GET/POST', path: `${API_PREFIX}/scan`, purpose: 'Bestehende Medienordner scannen' },
      { method: 'POST', path: `${API_PREFIX}/upload`, purpose: 'Medium hochladen und registrieren' },
      { method: 'POST', path: `${API_PREFIX}/update`, purpose: 'Metadaten aendern' },
      { method: 'POST', path: `${API_PREFIX}/delete`, purpose: 'Medium soft-delete oder Datei loeschen' }
    ],
    note: 'STEP274A1C ist der reparierte Media-Core. Dashboard und Command-Anbindung folgen in STEP274B/C.',
    updatedAt: nowIso()
  };
}

function init(ctx) {
  const app = ctx.app;
  db.init(ctx);
  state.loadedAt = nowIso();
  state.initialized = true;
  ensureSchema();

  app.get(`${API_PREFIX}/status`, (req, res) => {
    try { return res.json(statusPayload()); }
    catch (err) { return res.status(500).json({ ok: false, error: err.message || String(err) }); }
  });

  app.get(`${API_PREFIX}/list`, (req, res) => {
    try {
      const assets = listAssets({
        type: param(req, 'type', ''),
        category: param(req, 'category', ''),
        status: param(req, 'status', 'active'),
        q: param(req, 'q', ''),
        limit: param(req, 'limit', 200)
      });
      return res.json({ ok: true, assets, count: assets.length, updatedAt: nowIso() });
    } catch (err) { return res.status(500).json({ ok: false, error: err.message || String(err) }); }
  });

  app.post(`${API_PREFIX}/scan`, (req, res) => {
    try { return res.json(scanAssets()); }
    catch (err) { return res.status(500).json({ ok: false, error: err.message || String(err) }); }
  });

  app.get(`${API_PREFIX}/scan`, (req, res) => {
    try { return res.json(scanAssets()); }
    catch (err) { return res.status(500).json({ ok: false, error: err.message || String(err) }); }
  });

  app.post(`${API_PREFIX}/upload`, uploadOne);
  app.post(`${API_PREFIX}/update`, updateAsset);
  app.post(`${API_PREFIX}/delete`, deleteAsset);

  console.log('[media] routes active: /api/media/*');
  return { name: MODULE_NAME, step: 'STEP274A1C' };
}

module.exports = { init, statusPayload, listAssets, scanAssets, upsertAsset };
