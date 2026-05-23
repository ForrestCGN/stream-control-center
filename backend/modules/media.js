'use strict';

/**
 * STEP274K - Media Module Categories + Recent Uploads
 *
 * Zentrale Medien-Registry fuer Audio/Video/Bilder/Animationen.
 * Wichtig:
 * - Keine bestehenden Assets werden verschoben oder geloescht.
 * - Neue Uploads landen unter htdocs/assets/media/<module>/<category>/.
 * - Bestehende Asset-Ordner werden nur gescannt und in media_assets registriert.
 * - Module geben moduleKey fest vor; User waehlen/erstellen die Zusatzkategorie.
 */

const fs = require('fs');
const path = require('path');
const multer = require('multer');

const db = require('../core/database');
const core = require('./helpers/helper_core');
const config = require('./helpers/helper_config');
const mediaHelper = require('./helpers/helper_media');

const MODULE_NAME = 'media';
const SCHEMA_VERSION = 2;
const API_PREFIX = '/api/media';
const MEDIA_STEP = 'STEP274K';

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

const DEFAULT_MEDIA_CATEGORIES = [
  { moduleKey: 'general', categoryKey: 'general', label: 'Allgemein', allowedTypes: ['audio', 'video', 'image', 'animation'], isSystem: true },
  { moduleKey: 'commands', categoryKey: 'general', label: 'Commands / Allgemein', allowedTypes: ['audio', 'video', 'animation'], isSystem: true },
  { moduleKey: 'commands', categoryKey: 'fun', label: 'Commands / Fun', allowedTypes: ['audio', 'video', 'animation'], isSystem: false },
  { moduleKey: 'alerts', categoryKey: 'general', label: 'Alerts / Allgemein', allowedTypes: ['audio', 'video', 'image', 'animation'], isSystem: true },
  { moduleKey: 'alerts', categoryKey: 'follow', label: 'Alerts / Follow', allowedTypes: ['audio', 'video', 'image', 'animation'], isSystem: true },
  { moduleKey: 'alerts', categoryKey: 'sub', label: 'Alerts / Sub', allowedTypes: ['audio', 'video', 'image', 'animation'], isSystem: true },
  { moduleKey: 'alerts', categoryKey: 'bits', label: 'Alerts / Bits', allowedTypes: ['audio', 'video', 'image', 'animation'], isSystem: true },
  { moduleKey: 'alerts', categoryKey: 'raid', label: 'Alerts / Raid', allowedTypes: ['audio', 'video', 'image', 'animation'], isSystem: true },
  { moduleKey: 'soundalerts', categoryKey: 'general', label: 'SoundAlerts / Allgemein', allowedTypes: ['audio', 'video', 'animation'], isSystem: true },
  { moduleKey: 'soundalerts', categoryKey: 'test', label: 'SoundAlerts / Test', allowedTypes: ['audio', 'video', 'animation'], isSystem: false },
  { moduleKey: 'birthday', categoryKey: 'general', label: 'Geburtstag / Allgemein', allowedTypes: ['audio', 'video', 'image', 'animation'], isSystem: true },
  { moduleKey: 'birthday', categoryKey: 'intro', label: 'Geburtstag / Intro-Videos', allowedTypes: ['video', 'animation'], isSystem: true },
  { moduleKey: 'birthday', categoryKey: 'default-song', label: 'Geburtstag / Standardsongs', allowedTypes: ['audio'], isSystem: true },
  { moduleKey: 'birthday', categoryKey: 'user-songs', label: 'Geburtstag / User-Songs', allowedTypes: ['audio'], isSystem: true },
  { moduleKey: 'vip', categoryKey: 'general', label: 'VIP / Allgemein', allowedTypes: ['audio', 'video', 'image', 'animation'], isSystem: true },
  { moduleKey: 'rewards', categoryKey: 'general', label: 'Rewards / Allgemein', allowedTypes: ['audio', 'video', 'image', 'animation'], isSystem: true },
  { moduleKey: 'tts', categoryKey: 'general', label: 'TTS / Allgemein', allowedTypes: ['audio'], isSystem: true },
  { moduleKey: 'system', categoryKey: 'general', label: 'System / Allgemein', allowedTypes: ['audio', 'video', 'image', 'animation'], isSystem: true }
];

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


function slugKey(value, fallback = 'general') {
  const raw = clean(value || '').toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return raw || fallback;
}

function normalizeModuleKey(value) {
  return slugKey(value, 'general');
}

function normalizeCategoryKey(value) {
  return slugKey(value, 'general');
}

function categoryRelativeDir(moduleKey, categoryKey) {
  return normalizeSlashes(path.join(normalizeModuleKey(moduleKey), normalizeCategoryKey(categoryKey)));
}

function uploadDirRelForContext(moduleKey, categoryKey) {
  return normalizeSlashes(path.join('media', normalizeModuleKey(moduleKey), normalizeCategoryKey(categoryKey)));
}

function resolveUploadContextFromValues(values = {}) {
  const moduleKey = normalizeModuleKey(values.moduleKey || values.module || values.mediaModule || 'general');
  const categoryKey = normalizeCategoryKey(values.categoryKey || values.subCategory || values.category || 'general');
  return {
    moduleKey,
    categoryKey,
    category: categoryKey,
    fullCategoryKey: `${moduleKey}/${categoryKey}`,
    relativeDir: categoryRelativeDir(moduleKey, categoryKey),
    uploadDirRel: uploadDirRelForContext(moduleKey, categoryKey)
  };
}

function resolveUploadContext(req) {
  return resolveUploadContextFromValues({
    moduleKey: param(req, 'moduleKey', '') || param(req, 'module', '') || param(req, 'mediaModule', ''),
    categoryKey: param(req, 'categoryKey', '') || param(req, 'subCategory', '') || param(req, 'category', '')
  });
}

function inferContextFromRelativePath(relativePath, fallbackCategory = 'general') {
  const rel = normalizeSlashes(relativePath || '');
  const parts = rel.split('/').filter(Boolean);
  if (parts[0] === 'media' && parts.length >= 4) {
    return resolveUploadContextFromValues({ moduleKey: parts[1], categoryKey: parts[2] });
  }
  return resolveUploadContextFromValues({ moduleKey: 'legacy', categoryKey: fallbackCategory || 'legacy' });
}

function isKnownMediaType(type) {
  return Object.prototype.hasOwnProperty.call(MEDIA_TYPES, type);
}

function extensionAllowedForMeta(fileNameOrExt, type) {
  if (!isKnownMediaType(type)) return false;
  const ext = String(fileNameOrExt || '').startsWith('.')
    ? String(fileNameOrExt || '').toLowerCase()
    : path.extname(String(fileNameOrExt || '')).toLowerCase();
  return MEDIA_TYPES[type].extensions.includes(ext);
}

function typeForExt(ext) {
  const cleanExt = String(ext || '').toLowerCase();
  for (const [type, meta] of Object.entries(MEDIA_TYPES)) {
    if (meta.extensions.includes(cleanExt)) return type;
  }
  return 'unknown';
}

function uploadDirRel(type) {
  const meta = MEDIA_TYPES[type];
  return meta ? normalizeSlashes(path.join(...meta.uploadDir)) : '';
}

function typeForFile(absPath, preferredType = '') {
  const ext = path.extname(String(absPath || '')).toLowerCase();
  const cleanPreferred = clean(preferredType);
  if (extensionAllowedForMeta(ext, cleanPreferred)) return cleanPreferred;

  const rel = normalizeSlashes(path.relative(getAssetsDir(), absPath)).toLowerCase();
  for (const [type, meta] of Object.entries(MEDIA_TYPES)) {
    const uploadRel = normalizeSlashes(path.join(...meta.uploadDir)).toLowerCase();
    if ((rel === uploadRel || rel.startsWith(`${uploadRel}/`)) && meta.extensions.includes(ext)) return type;
  }

  return typeForExt(ext);
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
  ensureDir(path.join(assetsDir, 'media'));
  for (const category of DEFAULT_MEDIA_CATEGORIES) {
    ensureDir(path.join(assetsDir, 'media', category.moduleKey, category.categoryKey));
  }
  return true;
}

function isPathInside(baseDir, targetPath) {
  const base = path.resolve(baseDir);
  const target = path.resolve(targetPath);
  const rel = path.relative(base, target);
  return rel === '' || (!!rel && !rel.startsWith('..') && !path.isAbsolute(rel));
}


function columnExists(tableName, columnName) {
  const rows = db.all(`PRAGMA table_info(${tableName})`);
  return rows.some(row => row && row.name === columnName);
}

function ensureColumn(tableName, columnName, definition) {
  if (!columnExists(tableName, columnName)) db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}

function seedMediaCategories() {
  const now = nowIso();
  for (const category of DEFAULT_MEDIA_CATEGORIES) {
    const moduleKey = normalizeModuleKey(category.moduleKey);
    const categoryKey = normalizeCategoryKey(category.categoryKey);
    db.run(`
      INSERT INTO media_categories (
        module_key, category_key, label, relative_dir, allowed_types_json, is_system, is_active, created_at, updated_at
      ) VALUES (
        :moduleKey, :categoryKey, :label, :relativeDir, :allowedTypesJson, :isSystem, 1, :createdAt, :updatedAt
      )
      ON CONFLICT(module_key, category_key) DO UPDATE SET
        label = CASE WHEN media_categories.is_system = 1 THEN excluded.label ELSE media_categories.label END,
        relative_dir = excluded.relative_dir,
        allowed_types_json = excluded.allowed_types_json,
        is_system = excluded.is_system,
        is_active = 1,
        updated_at = excluded.updated_at
    `, {
      moduleKey,
      categoryKey,
      label: clean(category.label || `${moduleKey} / ${categoryKey}`),
      relativeDir: categoryRelativeDir(moduleKey, categoryKey),
      allowedTypesJson: safeJsonEncode(category.allowedTypes || ['audio', 'video', 'image', 'animation']),
      isSystem: category.isSystem ? 1 : 0,
      createdAt: now,
      updatedAt: now
    });
  }
}

function rowToCategory(row) {
  if (!row) return null;
  return {
    id: Number(row.id || 0),
    moduleKey: row.module_key || 'general',
    categoryKey: row.category_key || 'general',
    label: row.label || '',
    relativeDir: row.relative_dir || '',
    allowedTypes: safeJsonDecode(row.allowed_types_json, []),
    isSystem: Number(row.is_system || 0) === 1,
    isActive: Number(row.is_active || 0) === 1,
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || ''
  };
}

function ensureCategory(input = {}) {
  ensureSchema();
  const now = nowIso();
  const moduleKey = normalizeModuleKey(input.moduleKey || input.module_key || 'general');
  const categoryKey = normalizeCategoryKey(input.categoryKey || input.category_key || 'general');
  const label = clean(input.label || `${moduleKey} / ${categoryKey}`);
  const allowedTypes = Array.isArray(input.allowedTypes) && input.allowedTypes.length ? input.allowedTypes : ['audio', 'video', 'image', 'animation'];
  db.run(`
    INSERT INTO media_categories (
      module_key, category_key, label, relative_dir, allowed_types_json, is_system, is_active, created_at, updated_at
    ) VALUES (
      :moduleKey, :categoryKey, :label, :relativeDir, :allowedTypesJson, :isSystem, :isActive, :createdAt, :updatedAt
    )
    ON CONFLICT(module_key, category_key) DO UPDATE SET
      label = excluded.label,
      relative_dir = excluded.relative_dir,
      allowed_types_json = excluded.allowed_types_json,
      is_active = excluded.is_active,
      updated_at = excluded.updated_at
  `, {
    moduleKey,
    categoryKey,
    label,
    relativeDir: categoryRelativeDir(moduleKey, categoryKey),
    allowedTypesJson: safeJsonEncode(allowedTypes),
    isSystem: input.isSystem ? 1 : 0,
    isActive: input.isActive === false ? 0 : 1,
    createdAt: now,
    updatedAt: now
  });
  ensureDir(path.join(getAssetsDir(), 'media', moduleKey, categoryKey));
  return rowToCategory(db.get('SELECT * FROM media_categories WHERE module_key = :moduleKey AND category_key = :categoryKey', { moduleKey, categoryKey }));
}

function listCategories(options = {}) {
  ensureSchema();
  const moduleKey = clean(options.moduleKey || options.module || '');
  const includeInactive = ['1', 'true', 'yes'].includes(clean(options.includeInactive || '').toLowerCase());
  const params = {};
  const where = [];
  if (moduleKey) { where.push('module_key = :moduleKey'); params.moduleKey = normalizeModuleKey(moduleKey); }
  if (!includeInactive) where.push('is_active = 1');
  const rows = db.all(`
    SELECT * FROM media_categories
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY module_key COLLATE NOCASE ASC, category_key COLLATE NOCASE ASC
  `, params);
  return rows.map(rowToCategory).filter(Boolean);
}

function ensureSchema() {
  try {
    db.ensureReady();
    db.exec(`
      CREATE TABLE IF NOT EXISTS media_assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT 'general',
        module_key TEXT NOT NULL DEFAULT '',
        category_key TEXT NOT NULL DEFAULT '',
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
    ensureColumn('media_assets', 'module_key', "TEXT NOT NULL DEFAULT ''");
    ensureColumn('media_assets', 'category_key', "TEXT NOT NULL DEFAULT ''");
    db.exec(`
      CREATE TABLE IF NOT EXISTS media_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_key TEXT NOT NULL DEFAULT 'general',
        category_key TEXT NOT NULL DEFAULT 'general',
        label TEXT NOT NULL DEFAULT '',
        relative_dir TEXT NOT NULL DEFAULT '',
        allowed_types_json TEXT NOT NULL DEFAULT '[]',
        is_system INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(module_key, category_key)
      );
    `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(type);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_media_assets_category ON media_assets(category);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_media_assets_module_key ON media_assets(module_key);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_media_assets_category_key ON media_assets(category_key);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_media_assets_status ON media_assets(status);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_media_assets_source ON media_assets(source);');
    if (typeof db.setSchemaVersion === 'function') db.setSchemaVersion(MODULE_NAME, SCHEMA_VERSION);
    state.schemaOk = true;
    state.schemaError = '';
    ensureMediaDirs();
    seedMediaCategories();
    return true;
  } catch (err) {
    state.schemaOk = false;
    state.schemaError = err.message || String(err);
    state.lastError = state.schemaError;
    return false;
  }
}

function extensionAllowedForType(fileName, type) {
  return extensionAllowedForMeta(fileName, type);
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
    category: row.category || row.category_key || 'general',
    moduleKey: row.module_key || '',
    categoryKey: row.category_key || row.category || 'general',
    fullCategoryKey: row.module_key ? `${row.module_key}/${row.category_key || row.category || 'general'}` : (row.category || 'general'),
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
  const inputType = clean(input.type || current?.type || typeForExt(path.extname(relativePath)));
  const finalType = isKnownMediaType(inputType) ? inputType : typeForExt(path.extname(relativePath));
  const context = resolveUploadContextFromValues({
    moduleKey: input.moduleKey || input.module_key || current?.moduleKey || '',
    categoryKey: input.categoryKey || input.category_key || input.category || current?.categoryKey || current?.category || 'general'
  });
  const data = {
    type: finalType,
    category: context.categoryKey,
    moduleKey: context.moduleKey,
    categoryKey: context.categoryKey,
    displayName: clean(input.displayName || input.display_name || current?.displayName || path.parse(relativePath).name),
    fileName: clean(input.fileName || input.file_name || current?.fileName || path.basename(relativePath)),
    relativePath,
    webPath: clean(input.webPath || input.web_path || current?.webPath || `/assets/${relativePath}`),
    absolutePath: clean(input.absolutePath || input.absolute_path || current?.absolutePath || path.join(getAssetsDir(), relativePath)),
    mimeType: clean(input.mimeType || input.mime_type || current?.mimeType || inferMimeType(relativePath, finalType)),
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
      type, category, module_key, category_key, display_name, file_name, relative_path, web_path, absolute_path,
      mime_type, size_bytes, duration_ms, width, height, has_audio, has_video,
      tags_json, source, status, created_at, updated_at, last_seen_at
    ) VALUES (
      :type, :category, :moduleKey, :categoryKey, :displayName, :fileName, :relativePath, :webPath, :absolutePath,
      :mimeType, :sizeBytes, :durationMs, :width, :height, :hasAudio, :hasVideo,
      :tagsJson, :source, :status, :createdAt, :updatedAt, :lastSeenAt
    )
    ON CONFLICT(relative_path) DO UPDATE SET
      type = excluded.type,
      category = excluded.category,
      module_key = excluded.module_key,
      category_key = excluded.category_key,
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
  const requestedTypes = requestedType.split(',').map(item => clean(item)).filter(Boolean);
  const requestedCategory = clean(options.category || '');
  const requestedModuleKey = clean(options.moduleKey || options.module || '');
  const requestedCategoryKey = clean(options.categoryKey || options.subCategory || '');
  const requestedStatus = clean(options.status || 'active');
  const requestedQuery = clean(options.q || '');
  const view = clean(options.view || '').toLowerCase();
  const params = { limit: Math.max(1, Math.min(500, Number(options.limit || 200))) };
  const where = [];

  if (requestedTypes.length === 1) { where.push('type = :type'); params.type = requestedTypes[0]; }
  else if (requestedTypes.length > 1) {
    where.push(`type IN (${requestedTypes.map((_, i) => `:type${i}`).join(', ')})`);
    requestedTypes.forEach((type, i) => { params[`type${i}`] = type; });
  }
  if (requestedCategory) { where.push('category = :category'); params.category = requestedCategory; }
  if (requestedModuleKey) { where.push('module_key = :moduleKey'); params.moduleKey = normalizeModuleKey(requestedModuleKey); }
  if (requestedCategoryKey) { where.push('category_key = :categoryKey'); params.categoryKey = normalizeCategoryKey(requestedCategoryKey); }
  if (requestedStatus && requestedStatus !== 'all') { where.push('status = :status'); params.status = requestedStatus; }
  if (requestedQuery) {
    where.push('(lower(display_name) LIKE :q OR lower(file_name) LIKE :q OR lower(relative_path) LIKE :q OR lower(category) LIKE :q OR lower(module_key) LIKE :q OR lower(category_key) LIKE :q)');
    params.q = '%' + requestedQuery.toLowerCase() + '%';
  }

  const orderBy = view === 'recent'
    ? 'datetime(created_at) DESC, datetime(updated_at) DESC, id DESC'
    : 'module_key ASC, category_key ASC, type ASC, display_name COLLATE NOCASE ASC';

  const rows = db.all(`
    SELECT *
    FROM media_assets
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY ${orderBy}
    LIMIT :limit
  `, params);

  return rows.map(rowToAsset).filter(Boolean);
}


function assetById(id) {
  ensureSchema();
  const cleanId = Number(id || 0);
  if (!cleanId) return null;
  return rowToAsset(db.get('SELECT * FROM media_assets WHERE id = :id', { id: cleanId }));
}

function assetByRelativePath(relativePath) {
  ensureSchema();
  const rel = normalizeSlashes(clean(relativePath));
  if (!rel) return null;
  return rowToAsset(db.get('SELECT * FROM media_assets WHERE relative_path = :relativePath', { relativePath: rel }));
}

function getAsset(ref) {
  ensureSchema();
  const raw = clean(ref && typeof ref === 'object' ? (ref.id || ref.assetId || ref.mediaId || ref.relativePath || ref.path) : ref);
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return assetById(Number(raw));
  return assetByRelativePath(raw);
}

function relativePathFromWebPath(webPath) {
  const cleanPath = normalizeSlashes(clean(webPath));
  if (!cleanPath) return '';
  if (cleanPath.startsWith('/assets/')) return cleanPath.slice('/assets/'.length);
  if (cleanPath.startsWith('assets/')) return cleanPath.slice('assets/'.length);
  return cleanPath.replace(/^\/+/, '');
}

function soundSystemFileFor(asset) {
  const rel = normalizeSlashes(asset && asset.relativePath || '');
  if (!rel) return '';
  if (rel.startsWith('sounds/')) return rel.slice('sounds/'.length);
  return '';
}

function resolveAssetForUse(ref, options = {}) {
  ensureSchema();
  const asset = getAsset(ref);
  if (!asset) return { ok: false, error: 'media_asset_not_found', ref: clean(ref) };

  const assetsDir = path.resolve(getAssetsDir());
  const rel = normalizeSlashes(asset.relativePath || relativePathFromWebPath(asset.webPath));
  const abs = path.resolve(asset.absolutePath || path.join(assetsDir, rel));
  const insideAssets = isPathInside(assetsDir, abs);
  const exists = insideAssets && fs.existsSync(abs);
  const webPath = asset.webPath || `/assets/${rel}`;
  const soundSystemFile = soundSystemFileFor({ ...asset, relativePath: rel });
  const useCase = clean(options.useCase || options.use || '').toLowerCase();

  const resolved = {
    ok: true,
    module: MODULE_NAME,
    step: MEDIA_STEP,
    useCase,
    asset: {
      ...asset,
      relativePath: rel,
      absolutePath: abs,
      webPath
    },
    paths: {
      relativePath: rel,
      absolutePath: abs,
      webPath,
      exists,
      insideAssets
    },
    capabilities: {
      canPreviewInBrowser: !!webPath,
      hasAudio: !!asset.hasAudio,
      hasVideo: !!asset.hasVideo,
      isAudio: asset.type === 'audio',
      isVideo: asset.type === 'video',
      isImage: asset.type === 'image',
      isAnimation: asset.type === 'animation'
    },
    soundSystem: {
      compatible: !!soundSystemFile,
      file: soundSystemFile,
      reason: soundSystemFile ? 'legacy_sounds_relative_path' : 'sound_system_base_dir_not_yet_media_registry_aware'
    },
    overlay: {
      compatible: !!webPath,
      url: webPath,
      durationMs: Number(asset.durationMs || 0),
      width: Number(asset.width || 0),
      height: Number(asset.height || 0),
      hasAudio: !!asset.hasAudio,
      hasVideo: !!asset.hasVideo
    },
    updatedAt: nowIso()
  };

  if (useCase === 'sound_system' || useCase === 'sound') {
    resolved.ok = !!soundSystemFile;
    if (!soundSystemFile) resolved.error = resolved.soundSystem.reason;
  }

  return resolved;
}

function mediaOptionFromAsset(asset, options = {}) {
  const resolved = resolveAssetForUse(asset.id || asset.relativePath, options);
  const soundSystem = resolved.soundSystem || {};
  const paths = resolved.paths || {};
  return {
    id: Number(asset.id || 0),
    type: asset.type || '',
    category: asset.category || '',
    moduleKey: asset.moduleKey || '',
    categoryKey: asset.categoryKey || asset.category || '',
    fullCategoryKey: asset.fullCategoryKey || '',
    label: asset.displayName || asset.fileName || asset.relativePath || String(asset.id || ''),
    displayName: asset.displayName || '',
    fileName: asset.fileName || '',
    relativePath: paths.relativePath || asset.relativePath || '',
    webPath: paths.webPath || asset.webPath || '',
    durationMs: Number(asset.durationMs || 0),
    width: Number(asset.width || 0),
    height: Number(asset.height || 0),
    hasAudio: !!asset.hasAudio,
    hasVideo: !!asset.hasVideo,
    source: asset.source || '',
    status: asset.status || '',
    exists: !!paths.exists,
    soundSystemFile: soundSystem.file || '',
    soundSystemCompatible: !!soundSystem.compatible,
    soundSystemReason: soundSystem.reason || ''
  };
}

function scanFile(absPath, source, category = 'general', preferredType = '', contextInput = {}) {
  const assetsDir = path.resolve(getAssetsDir());
  const target = path.resolve(absPath);
  if (!isPathInside(assetsDir, target)) return null;

  const type = typeForFile(target, preferredType);
  if (type === 'unknown') return null;

  const rel = normalizeSlashes(path.relative(assetsDir, target));
  const inferredContext = Object.keys(contextInput || {}).length ? resolveUploadContextFromValues(contextInput) : inferContextFromRelativePath(rel, category);
  try { ensureCategory({ moduleKey: inferredContext.moduleKey, categoryKey: inferredContext.categoryKey }); } catch (_) {}
  const info = mediaInfoForFile(target, type);

  return upsertAsset({
    type,
    category: inferredContext.categoryKey,
    moduleKey: inferredContext.moduleKey,
    categoryKey: inferredContext.categoryKey,
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

  for (const [scanType, meta] of Object.entries(MEDIA_TYPES)) {
    const dirs = [path.join(assetsDir, ...meta.uploadDir), ...meta.legacyDirs.map(parts => path.join(assetsDir, ...parts))];
    const uniqueDirs = Array.from(new Set(dirs.map(dir => path.resolve(dir))));
    for (const dir of uniqueDirs) {
      if (!fs.existsSync(dir)) continue;
      const relDir = normalizeSlashes(path.relative(assetsDir, dir)).toLowerCase();
      const mediaRoot = normalizeSlashes(path.join('media')).toLowerCase();
      const source = relDir === mediaRoot || relDir.startsWith(`${mediaRoot}/`) ? 'media_dir' : 'legacy_scan';
      const category = source === 'media_dir' ? 'general' : 'legacy';
      const files = walkDir(dir, meta.extensions, []);
      for (const file of files) {
        try {
          const asset = scanFile(file, source, category, scanType);
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

function getUploadDir(type, context = null) {
  const uploadContext = context || resolveUploadContextFromValues({ moduleKey: 'general', categoryKey: 'general' });
  return ensureDir(path.join(getAssetsDir(), 'media', uploadContext.moduleKey, uploadContext.categoryKey));
}

function resolveUploadType(req, fileName) {
  const requestedType = clean(param(req, 'type', '')) || typeForExt(path.extname(fileName));
  const finalType = isKnownMediaType(requestedType) ? requestedType : typeForExt(path.extname(fileName));
  if (!isKnownMediaType(finalType)) throw new Error('media_type_not_supported');
  if (!extensionAllowedForType(fileName, finalType)) throw new Error('media_extension_not_allowed');
  return finalType;
}

const uploadStorage = multer.diskStorage({
  destination(req, file, cb) {
    try {
      const type = resolveUploadType(req, file.originalname);
      const context = resolveUploadContext(req);
      ensureCategory({ moduleKey: context.moduleKey, categoryKey: context.categoryKey });
      cb(null, getUploadDir(type, context));
    } catch (err) { cb(err); }
  },
  filename(req, file, cb) {
    try {
      const type = resolveUploadType(req, file.originalname);
      const context = resolveUploadContext(req);
      ensureCategory({ moduleKey: context.moduleKey, categoryKey: context.categoryKey });
      const target = makeUniqueTarget(getUploadDir(type, context), file.originalname);
      cb(null, path.basename(target));
    } catch (err) { cb(err); }
  }
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: Number(process.env.MEDIA_UPLOAD_MAX_BYTES || 250 * 1024 * 1024) },
  fileFilter(req, file, cb) {
    try {
      resolveUploadType(req, file.originalname);
      cb(null, true);
    } catch (err) {
      cb(err);
    }
  }
});

function uploadOne(req, res) {
  upload.single('file')(req, res, err => {
    if (err) return res.status(400).json({ ok: false, error: err.message || String(err) });
    try {
      if (!req.file?.path) return res.status(400).json({ ok: false, error: 'file_missing' });
      const uploadType = resolveUploadType(req, req.file.originalname);
      const context = resolveUploadContext(req);
      ensureCategory({ moduleKey: context.moduleKey, categoryKey: context.categoryKey });
      const category = context.categoryKey;
      const displayName = clean(param(req, 'displayName', '')) || path.parse(req.file.originalname).name;
      const asset = scanFile(req.file.path, 'upload', category, uploadType, context);
      if (!asset) return res.status(400).json({ ok: false, error: 'asset_registration_failed' });
      const saved = upsertAsset({ ...asset, displayName, category, moduleKey: context.moduleKey, categoryKey: context.categoryKey, source: 'upload' });
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
      moduleKey: body.moduleKey ?? body.module_key ?? current.moduleKey,
      categoryKey: body.categoryKey ?? body.category_key ?? body.category ?? current.categoryKey ?? current.category,
      category: body.categoryKey ?? body.category ?? current.categoryKey ?? current.category,
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
      if (!isPathInside(assetsDir, abs)) return res.status(400).json({ ok: false, error: 'unsafe_asset_path' });
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
  const recent = listAssets({ view: 'recent', status: 'active', limit: 20 });
  const categories = listCategories();
  return {
    ok: true,
    module: MODULE_NAME,
    version: 1,
    step: MEDIA_STEP,
    initialized: state.initialized,
    schemaOk: state.schemaOk,
    schemaError: state.schemaError,
    lastError: state.lastError,
    loadedAt: state.loadedAt,
    lastScanAt: state.lastScanAt,
    lastUploadAt: state.lastUploadAt,
    lastChangeAt: state.lastChangeAt,
    assetsDir: getAssetsDir(),
    mediaRootDir: normalizeSlashes(path.join(getAssetsDir(), 'media')),
    mediaDirs: Object.fromEntries(categories.map(cat => [`${cat.moduleKey}/${cat.categoryKey}`, normalizeSlashes(path.join(getAssetsDir(), 'media', cat.moduleKey, cat.categoryKey))])),
    counts: { total: Number(total?.count || 0), recent: recent.length, categories: categories.length, ...counts },
    types: Object.entries(MEDIA_TYPES).map(([id, meta]) => ({ id, label: meta.label, icon: meta.icon, extensions: meta.extensions })),
    categories,
    recentUploads: recent.map(asset => mediaOptionFromAsset(asset)),
    categoryRules: { moduleKey: 'vom aufrufenden Modul vorgegeben', categoryKey: 'vom User waehlbar/anlegbar', recentUploads: 'virtuelle Ansicht, keine echte Speicher-Kategorie' },
    routes: [
      { method: 'GET', path: `${API_PREFIX}/status`, purpose: 'Media-Core Status und Zaehlwerte' },
      { method: 'GET', path: `${API_PREFIX}/list`, purpose: 'Registrierte Medien auflisten' },
      { method: 'GET', path: `${API_PREFIX}/resolve`, purpose: 'Ein Medium zentral fuer Module/Use-Cases aufloesen' },
      { method: 'GET', path: `${API_PREFIX}/categories`, purpose: 'Modul-/Zusatzkategorien fuer Upload und Picker auflisten' },
      { method: 'POST', path: `${API_PREFIX}/category/upsert`, purpose: 'Zusatzkategorie fuer ein Modul anlegen/aktualisieren' },
      { method: 'GET', path: `${API_PREFIX}/picker-options`, purpose: 'Picker-Ansicht inklusive view=recent&limit=20 vorbereiten' },
      { method: 'GET/POST', path: `${API_PREFIX}/scan`, purpose: 'Bestehende Medienordner scannen' },
      { method: 'POST', path: `${API_PREFIX}/upload`, purpose: 'Medium hochladen und registrieren' },
      { method: 'POST', path: `${API_PREFIX}/update`, purpose: 'Metadaten aendern' },
      { method: 'POST', path: `${API_PREFIX}/delete`, purpose: 'Medium soft-delete oder Datei loeschen' }
    ],
    note: 'STEP274K bereitet Modul-Kategorien, frei waehlbare Zusatzkategorien und die virtuelle Ansicht Neueste Uploads vor. Neue Uploads landen unter htdocs/assets/media/<module>/<category>/.',
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
        moduleKey: param(req, 'moduleKey', ''),
        categoryKey: param(req, 'categoryKey', ''),
        status: param(req, 'status', 'active'),
        q: param(req, 'q', ''),
        view: param(req, 'view', ''),
        limit: param(req, 'limit', 200)
      });
      return res.json({ ok: true, assets, count: assets.length, updatedAt: nowIso() });
    } catch (err) { return res.status(500).json({ ok: false, error: err.message || String(err) }); }
  });



  app.get(`${API_PREFIX}/categories`, (req, res) => {
    try {
      const categories = listCategories({ moduleKey: param(req, 'moduleKey', ''), includeInactive: param(req, 'includeInactive', '') });
      return res.json({ ok: true, module: MODULE_NAME, step: MEDIA_STEP, categories, count: categories.length, updatedAt: nowIso() });
    } catch (err) { return res.status(500).json({ ok: false, error: err.message || String(err) }); }
  });

  app.post(`${API_PREFIX}/category/upsert`, (req, res) => {
    try {
      const body = readBody(req);
      const category = ensureCategory({
        moduleKey: body.moduleKey || param(req, 'moduleKey', ''),
        categoryKey: body.categoryKey || param(req, 'categoryKey', '') || body.category || param(req, 'category', ''),
        label: body.label || param(req, 'label', ''),
        allowedTypes: Array.isArray(body.allowedTypes) ? body.allowedTypes : undefined,
        isSystem: false,
        isActive: body.isActive !== false
      });
      state.lastChangeAt = nowIso();
      return res.json({ ok: true, module: MODULE_NAME, step: MEDIA_STEP, category, updatedAt: nowIso() });
    } catch (err) { return res.status(500).json({ ok: false, error: err.message || String(err) }); }
  });

  app.get(`${API_PREFIX}/picker-options`, (req, res) => {
    try {
      const view = param(req, 'view', '') || 'module';
      const limit = param(req, 'limit', view === 'recent' ? 20 : 200);
      const assets = listAssets({
        type: param(req, 'type', ''),
        moduleKey: param(req, 'moduleKey', ''),
        categoryKey: param(req, 'categoryKey', ''),
        status: param(req, 'status', 'active'),
        q: param(req, 'q', ''),
        view,
        limit
      });
      const options = assets.map(asset => mediaOptionFromAsset(asset));
      return res.json({
        ok: true,
        module: MODULE_NAME,
        step: MEDIA_STEP,
        view,
        options,
        count: options.length,
        categories: listCategories({ moduleKey: param(req, 'moduleKey', '') }),
        uploadTarget: resolveUploadContext(req),
        note: view === 'recent' ? 'Neueste Uploads ist eine virtuelle Ansicht, keine echte Speicherkategorie.' : 'Picker-Optionen fuer den zentralen Media-Picker.',
        updatedAt: nowIso()
      });
    } catch (err) { return res.status(500).json({ ok: false, error: err.message || String(err) }); }
  });

  app.get(`${API_PREFIX}/resolve`, (req, res) => {
    try {
      const ref = param(req, 'id', '') || param(req, 'mediaId', '') || param(req, 'relativePath', '') || param(req, 'path', '');
      const useCase = param(req, 'useCase', '') || param(req, 'use', '');
      const resolved = resolveAssetForUse(ref, { useCase });
      return res.status(resolved.ok ? 200 : 404).json(resolved);
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
  return { name: MODULE_NAME, step: MEDIA_STEP };
}

module.exports = { init, statusPayload, listAssets, scanAssets, upsertAsset, getAsset, resolveAssetForUse, mediaOptionFromAsset, soundSystemFileFor, listCategories, ensureCategory, resolveUploadContextFromValues };
