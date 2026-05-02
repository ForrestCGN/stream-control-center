'use strict';

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const core = require('./helper_core');
const config = require('./helper_config');

const DEFAULT_ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.webm', '.m4a'];
const durationCache = new Map();

function normalizeSlashes(value) {
  return String(value || '').replace(/\\/g, '/');
}

function isSafeRelativePath(value) {
  const clean = normalizeSlashes(value).trim();
  if (!clean) return false;
  if (path.isAbsolute(clean)) return false;
  if (clean.includes('..')) return false;
  return true;
}

function extensionAllowed(filePath, allowed = DEFAULT_ALLOWED_EXTENSIONS) {
  const ext = path.extname(String(filePath || '')).toLowerCase();
  return allowed.map(item => String(item).toLowerCase()).includes(ext);
}

function resolveMediaPath(fileName, options = {}) {
  const allowed = Array.isArray(options.allowedExtensions) ? options.allowedExtensions : DEFAULT_ALLOWED_EXTENSIONS;
  const baseDir = options.baseDir || config.getSoundsDir();
  const raw = String(fileName || '').trim();

  if (!raw) return { ok: false, path: '', relative: '', error: 'file_missing' };
  if (!isSafeRelativePath(raw)) return { ok: false, path: '', relative: raw, error: 'unsafe_path' };
  if (!extensionAllowed(raw, allowed)) return { ok: false, path: '', relative: raw, error: 'extension_not_allowed' };

  const fullPath = path.resolve(baseDir, raw);
  const normalizedBase = path.resolve(baseDir);
  if (!fullPath.startsWith(normalizedBase)) return { ok: false, path: '', relative: raw, error: 'outside_base_dir' };

  return {
    ok: fs.existsSync(fullPath),
    exists: fs.existsSync(fullPath),
    path: fullPath,
    relative: raw,
    error: fs.existsSync(fullPath) ? '' : 'file_not_found'
  };
}

function findFfprobe(options = {}) {
  const configured = options.ffprobePath || process.env.FFPROBE_PATH || '';
  if (configured && fs.existsSync(configured)) return configured;

  const candidates = [
    config.resolveFromRoot('tools', 'ffmpeg', 'ffprobe.exe'),
    config.resolveFromRoot('tools', 'ffmpeg', 'bin', 'ffprobe.exe'),
    config.resolveFromScripts('ffmpeg', 'ffprobe.exe'),
    config.resolveFromScripts('ffmpeg', 'bin', 'ffprobe.exe'),
    config.resolveFromRoot('ffmpeg', 'ffprobe.exe'),
    'ffprobe'
  ];

  for (const candidate of candidates) {
    try {
      if (candidate === 'ffprobe' || fs.existsSync(candidate)) return candidate;
    } catch (_) {}
  }

  return 'ffprobe';
}

function readAudioDurationMs(filePath, options = {}) {
  const target = core.normalizePath(filePath);
  if (!target || !fs.existsSync(target)) return { ok: false, durationMs: 0, error: 'file_not_found' };

  const cacheKey = target.toLowerCase();
  if (options.cache !== false && durationCache.has(cacheKey)) {
    return { ok: true, durationMs: durationCache.get(cacheKey), cached: true, error: '' };
  }

  try {
    const ffprobe = findFfprobe(options);
    const output = childProcess.execFileSync(ffprobe, [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      target
    ], { encoding: 'utf8', timeout: Number(options.timeoutMs) || 5000 });

    const seconds = Number.parseFloat(String(output || '').trim());
    const durationMs = Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds * 1000) : 0;
    if (durationMs > 0) durationCache.set(cacheKey, durationMs);
    return { ok: durationMs > 0, durationMs, cached: false, error: durationMs > 0 ? '' : 'duration_unavailable' };
  } catch (err) {
    return { ok: false, durationMs: 0, cached: false, error: err.message || String(err) };
  }
}

function getAudioInfo(fileName, options = {}) {
  const resolved = resolveMediaPath(fileName, options);
  if (!resolved.ok) {
    if (options.fallbackFile && resolved.error !== 'unsafe_path') {
      const fallback = resolveMediaPath(options.fallbackFile, options);
      if (fallback.ok) {
        const duration = readAudioDurationMs(fallback.path, options);
        return { ok: true, ...fallback, durationMs: duration.durationMs, durationOk: duration.ok, fallback: true, originalError: resolved.error };
      }
    }
    return { ok: false, ...resolved, durationMs: 0, durationOk: false };
  }

  const duration = readAudioDurationMs(resolved.path, options);
  return { ok: true, ...resolved, durationMs: duration.durationMs, durationOk: duration.ok, fallback: false, durationError: duration.error || '' };
}

function clearDurationCache() {
  durationCache.clear();
  return true;
}

function durationCacheInfo() {
  return { size: durationCache.size, keys: Array.from(durationCache.keys()) };
}

module.exports = {
  DEFAULT_ALLOWED_EXTENSIONS,
  isSafeRelativePath,
  extensionAllowed,
  resolveMediaPath,
  findFfprobe,
  readAudioDurationMs,
  getAudioInfo,
  clearDurationCache,
  durationCacheInfo
};

