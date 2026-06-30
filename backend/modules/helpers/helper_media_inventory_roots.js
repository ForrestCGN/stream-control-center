'use strict';

/**
 * RDAP 0.2.71 - Remote-Agent Media-System Scan Code Prep
 *
 * Read-only helper for the future remote_agent media inventory scan.
 * It describes the current two-world model without executing writes:
 * - New Media-System files live below htdocs/assets/media/<module>/<category>/...
 * - Legacy assets below htdocs/assets/sounds, htdocs/assets/videos, htdocs/assets/images stay readable.
 *
 * This helper is deliberately side-effect free: no fs access, no DB access,
 * no uploads, no edits, no deletes, no agent actions.
 */

const MEDIA_SYSTEM_ROOT = Object.freeze({
  key: 'media',
  label: 'Media-System',
  source: 'media_dir',
  localPathHint: 'htdocs/assets/media',
  publicBasePath: '/assets/media',
  categoryModel: 'module_category',
  types: ['audio', 'video', 'image', 'animation']
});

const LEGACY_MEDIA_ROOTS = Object.freeze([
  { key: 'sounds', label: 'Sounds', source: 'legacy_scan', localPathHint: 'htdocs/assets/sounds', publicBasePath: '/assets/sounds', types: ['audio', 'video'] },
  { key: 'videos', label: 'Videos', source: 'legacy_scan', localPathHint: 'htdocs/assets/videos', publicBasePath: '/assets/videos', types: ['video'] },
  { key: 'images', label: 'Bilder', source: 'legacy_scan', localPathHint: 'htdocs/assets/images', publicBasePath: '/assets/images', types: ['image'] }
]);

const MEDIA_INVENTORY_ROOTS = Object.freeze([MEDIA_SYSTEM_ROOT, ...LEGACY_MEDIA_ROOTS]);

function normalizeSlashPath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/[\u0000-\u001f<>:"|?*]/g, '').slice(0, 260);
}

function safeSegment(value, fallback) {
  const raw = String(value || '').trim().toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return raw || fallback;
}

function inferMediaSystemCategory(relativePath) {
  const rel = normalizeSlashPath(relativePath);
  const parts = rel.split('/').filter(Boolean);
  const moduleKey = safeSegment(parts[0], 'general');
  const categoryKey = safeSegment(parts[1], 'general');
  return {
    source: MEDIA_SYSTEM_ROOT.source,
    rootKey: MEDIA_SYSTEM_ROOT.key,
    moduleKey,
    categoryKey,
    fullCategoryKey: `${moduleKey}/${categoryKey}`,
    assetRelativePath: rel
  };
}

function inferLegacyCategory(rootKey, relativePath) {
  const safeRoot = safeSegment(rootKey, 'legacy');
  const rel = normalizeSlashPath(relativePath);
  const firstDir = rel.split('/').filter(Boolean)[0] || 'legacy';
  const categoryKey = safeSegment(firstDir, 'legacy');
  return {
    source: 'legacy_scan',
    rootKey: safeRoot,
    moduleKey: 'legacy',
    categoryKey,
    fullCategoryKey: `legacy/${categoryKey}`,
    assetRelativePath: rel
  };
}

function buildInventoryIdentity(rootKey, relativePath) {
  const safeRoot = safeSegment(rootKey, 'media');
  const rel = normalizeSlashPath(relativePath);
  return `${safeRoot}:${rel}`;
}

module.exports = {
  MEDIA_SYSTEM_ROOT,
  LEGACY_MEDIA_ROOTS,
  MEDIA_INVENTORY_ROOTS,
  inferMediaSystemCategory,
  inferLegacyCategory,
  buildInventoryIdentity,
  normalizeSlashPath
};
