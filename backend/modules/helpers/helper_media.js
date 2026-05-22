'use strict';

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const core = require('./helper_core');
const config = require('./helper_config');

const DEFAULT_ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.webm', '.m4a', '.mp4'];
const durationCache = new Map();
const mediaInfoCache = new Map();

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
    ], { encoding: 'utf8', timeout: Number(options.timeoutMs) || 5000, stdio: ['ignore', 'pipe', 'pipe'] });

    const seconds = Number.parseFloat(String(output || '').trim());
    const durationMs = Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds * 1000) : 0;
    if (durationMs > 0) durationCache.set(cacheKey, durationMs);
    return { ok: durationMs > 0, durationMs, cached: false, error: durationMs > 0 ? '' : 'duration_unavailable' };
  } catch (err) {
    return { ok: false, durationMs: 0, cached: false, error: 'ffprobe_failed' };
  }
}

function readMediaInfo(filePath, options = {}) {
  const target = core.normalizePath(filePath);
  if (!target || !fs.existsSync(target)) return { ok: false, durationMs: 0, error: 'file_not_found', hasAudio: false, hasVideo: false };

  const cacheKey = target.toLowerCase();
  if (options.cache !== false && mediaInfoCache.has(cacheKey)) {
    return { ...mediaInfoCache.get(cacheKey), cached: true };
  }

  try {
    const ffprobe = findFfprobe(options);
    const output = childProcess.execFileSync(ffprobe, [
      '-v', 'error',
      '-show_format',
      '-show_streams',
      '-of', 'json',
      target
    ], { encoding: 'utf8', timeout: Number(options.timeoutMs) || 5000, stdio: ['ignore', 'pipe', 'pipe'] });

    const parsed = JSON.parse(String(output || '{}'));
    const streams = Array.isArray(parsed.streams) ? parsed.streams : [];
    const videoStream = streams.find(stream => String(stream.codec_type || '').toLowerCase() === 'video') || null;
    const audioStream = streams.find(stream => String(stream.codec_type || '').toLowerCase() === 'audio') || null;
    const format = parsed.format || {};
    const rawDuration = Number(format.duration || (videoStream && videoStream.duration) || (audioStream && audioStream.duration) || 0);
    const durationMs = Number.isFinite(rawDuration) && rawDuration > 0 ? Math.round(rawDuration * 1000) : 0;
    const width = videoStream ? Number(videoStream.width || 0) : 0;
    const height = videoStream ? Number(videoStream.height || 0) : 0;

    const info = {
      ok: durationMs > 0 || !!videoStream || !!audioStream,
      durationMs,
      durationOk: durationMs > 0,
      hasVideo: !!videoStream,
      hasAudio: !!audioStream,
      width: Number.isFinite(width) ? width : 0,
      height: Number.isFinite(height) ? height : 0,
      formatName: String(format.format_name || ''),
      formatLongName: String(format.format_long_name || ''),
      videoCodec: videoStream ? String(videoStream.codec_name || '') : '',
      audioCodec: audioStream ? String(audioStream.codec_name || '') : '',
      cached: false,
      error: durationMs > 0 || videoStream || audioStream ? '' : 'media_info_unavailable'
    };

    if (info.ok) mediaInfoCache.set(cacheKey, info);
    if (durationMs > 0) durationCache.set(cacheKey, durationMs);
    return info;
  } catch (err) {
    return { ok: false, durationMs: 0, durationOk: false, hasVideo: false, hasAudio: false, width: 0, height: 0, formatName: '', formatLongName: '', videoCodec: '', audioCodec: '', cached: false, error: 'ffprobe_failed' };
  }
}

function readVideoInfo(filePath, options = {}) {
  const info = readMediaInfo(filePath, options);
  return { ...info, ok: !!info.hasVideo && info.ok, error: info.hasVideo ? info.error : (info.error || 'video_stream_missing') };
}

function getMediaInfo(fileName, options = {}) {
  const resolved = resolveMediaPath(fileName, options);
  if (!resolved.ok) {
    if (options.fallbackFile && resolved.error !== 'unsafe_path') {
      const fallback = resolveMediaPath(options.fallbackFile, options);
      if (fallback.ok) {
        const mediaInfo = readMediaInfo(fallback.path, options);
        return { ok: true, ...fallback, ...mediaInfo, fallback: true, originalError: resolved.error };
      }
    }
    return { ok: false, ...resolved, durationMs: 0, durationOk: false, hasVideo: false, hasAudio: false, width: 0, height: 0 };
  }

  const mediaInfo = readMediaInfo(resolved.path, options);
  return { ok: true, ...resolved, ...mediaInfo, fallback: false, durationError: mediaInfo.error || '' };
}

function getAudioInfo(fileName, options = {}) {
  const mediaInfo = getMediaInfo(fileName, options);
  if (!mediaInfo.ok) return { ok: false, ...mediaInfo, durationMs: 0, durationOk: false };
  return {
    ...mediaInfo,
    ok: true,
    durationMs: mediaInfo.durationMs || 0,
    durationOk: !!mediaInfo.durationOk,
    durationError: mediaInfo.durationError || mediaInfo.error || ''
  };
}

function clearDurationCache() {
  durationCache.clear();
  mediaInfoCache.clear();
  return true;
}

function durationCacheInfo() {
  return { size: durationCache.size, keys: Array.from(durationCache.keys()), mediaInfoSize: mediaInfoCache.size, mediaInfoKeys: Array.from(mediaInfoCache.keys()) };
}

module.exports = {
  DEFAULT_ALLOWED_EXTENSIONS,
  isSafeRelativePath,
  extensionAllowed,
  resolveMediaPath,
  findFfprobe,
  readAudioDurationMs,
  readMediaInfo,
  readVideoInfo,
  getMediaInfo,
  getAudioInfo,
  clearDurationCache,
  durationCacheInfo
};
