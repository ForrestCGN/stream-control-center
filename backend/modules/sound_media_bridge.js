'use strict';

/**
 * STEP274L-FIX4 - Media Playback Defaults Device + Discord
 *
 * Bruecke fuer zentrale Medienverwaltung in Richtung Sound-System.
 * Wichtig:
 * - Sound-System selbst bleibt unveraendert.
 * - Bestehende Medien werden nicht verschoben oder geloescht.
 * - Neue media_assets koennen ueber /api/sound/play-media abgespielt werden.
 * - Media-Requests senden kein soundId/id an /api/sound/play, damit
 *   das Sound-System nicht faelschlich ein Preset in config.sounds erwartet.
 * - Assets mit type=audio bleiben audio, auch wenn ffprobe Cover-Art als Video-Stream erkennt.
 * - Fuer media/* Dateien wird eine technische Kompatibilitaetskopie unter
 *   htdocs/assets/sounds/_media_registry/ erzeugt, damit das bestehende
 *   Sound-System weiterhin seine eigene Queue/Prioritaeten/Overlay-Ausgabe nutzt.
 * - FIX3/FIX4: Leere Zahlenparameter fallen sauber auf Defaults zurueck.
 * - FIX4: Standardausgabe fuer Media-Commands ist Device + Discord:
 *   target=both und outputTarget=device, sofern nicht explizit anders uebergeben.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const core = require('./helpers/helper_core');
const config = require('./helpers/helper_config');
const media = require('./media');

const MODULE_NAME = 'sound_media_bridge';
const STEP = 'STEP274L-FIX4';
const API_PREFIX = '/api/sound';
const CACHE_DIR_NAME = '_media_registry';
const DEFAULT_MEDIA_TARGET = process.env.MEDIA_BRIDGE_DEFAULT_TARGET || 'both';
const DEFAULT_MEDIA_OUTPUT_TARGET = process.env.MEDIA_BRIDGE_DEFAULT_OUTPUT_TARGET || 'device';
const DEFAULT_MEDIA_VOLUME = Number(process.env.MEDIA_BRIDGE_DEFAULT_VOLUME || 85) || 85;

function clean(value) {
  return String(value ?? '').trim();
}

function normalizeSlashes(value) {
  return String(value || '').replace(/\\/g, '/');
}

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const v = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on'].includes(v)) return true;
  if (['0', 'false', 'no', 'nein', 'off'].includes(v)) return false;
  return fallback;
}

function safeFileName(value) {
  const parsed = path.parse(clean(value || 'media'));
  const base = (parsed.name || 'media')
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'media';
  const ext = clean(parsed.ext).toLowerCase();
  return `${base}${ext}`;
}

function isPathInside(baseDir, targetPath) {
  const base = path.resolve(baseDir);
  const target = path.resolve(targetPath);
  return target === base || target.startsWith(base + path.sep);
}

function ensureCacheCopy(resolved) {
  const asset = resolved.asset || {};
  const paths = resolved.paths || {};
  const sourcePath = path.resolve(paths.absolutePath || asset.absolutePath || '');
  const assetsDir = path.resolve(config.getAssetsDir());
  const soundsDir = path.resolve(config.getSoundsDir());
  const cacheDir = path.join(soundsDir, CACHE_DIR_NAME);

  if (!sourcePath || !isPathInside(assetsDir, sourcePath)) {
    throw new Error('media_source_outside_assets');
  }
  if (!fs.existsSync(sourcePath)) {
    throw new Error('media_source_missing');
  }

  fs.mkdirSync(cacheDir, { recursive: true });
  const fileName = `${Number(asset.id || 0) || 'media'}_${safeFileName(asset.fileName || path.basename(sourcePath))}`;
  const targetPath = path.join(cacheDir, fileName);
  if (!isPathInside(soundsDir, targetPath)) {
    throw new Error('media_cache_target_outside_sounds');
  }

  let needsCopy = true;
  if (fs.existsSync(targetPath)) {
    const src = fs.statSync(sourcePath);
    const dst = fs.statSync(targetPath);
    needsCopy = src.size !== dst.size || Math.round(src.mtimeMs) > Math.round(dst.mtimeMs) + 1000;
  }
  if (needsCopy) fs.copyFileSync(sourcePath, targetPath);

  return {
    absolutePath: targetPath,
    file: normalizeSlashes(path.relative(soundsDir, targetPath)),
    copied: needsCopy
  };
}

function pickMediaRef(req) {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  return clean(
    body.mediaId || body.mediaAssetId || body.assetId || body.id ||
    core.getParam(req, 'mediaId', '') || core.getParam(req, 'mediaAssetId', '') ||
    core.getParam(req, 'assetId', '') || core.getParam(req, 'id', '')
  );
}

function numberParam(req, body, name, fallback) {
  const fromBody = body && Object.prototype.hasOwnProperty.call(body, name) ? body[name] : undefined;
  const fromReq = core.getParam(req, name, '');
  const value = fromBody !== undefined ? fromBody : fromReq;
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function stringParam(req, body, name, fallback = '') {
  const fromBody = body && Object.prototype.hasOwnProperty.call(body, name) ? body[name] : undefined;
  const fromReq = core.getParam(req, name, '');
  const value = fromBody !== undefined ? fromBody : fromReq;
  const out = clean(value);
  return out || fallback;
}

function normalizeMediaTarget(value, fallback = DEFAULT_MEDIA_TARGET) {
  const v = clean(value || fallback).toLowerCase();
  if (['stream', 'discord', 'both'].includes(v)) return v;
  return fallback;
}

function normalizeOutputTarget(value, fallback = DEFAULT_MEDIA_OUTPUT_TARGET) {
  const v = clean(value || fallback).toLowerCase();
  if (['overlay', 'device', 'both'].includes(v)) return v;
  return fallback;
}

function resolvePayloadMediaType(body, asset, capabilities) {
  const rawMediaType = clean(body.mediaType || body.type || asset.type || '').toLowerCase();
  const assetType = clean(asset.type || '').toLowerCase();

  if (assetType === 'audio') return 'audio';
  if (assetType === 'video' || assetType === 'animation') return 'video';
  if (rawMediaType === 'audio') return 'audio';
  if (rawMediaType === 'video') return 'video';

  return capabilities.isVideo || asset.hasVideo ? 'video' : 'audio';
}

function buildSoundPayload(req, resolved, soundFile, cacheInfo) {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const asset = resolved.asset || {};
  const capabilities = resolved.capabilities || {};
  const mediaType = resolvePayloadMediaType(body, asset, capabilities);
  const label = clean(body.label || body.displayName || asset.displayName || asset.fileName || `media_${asset.id || ''}`);
  const category = clean(body.category || core.getParam(req, 'category', '') || 'command_media').toLowerCase() || 'command_media';
  const target = normalizeMediaTarget(stringParam(req, body, 'target', DEFAULT_MEDIA_TARGET), DEFAULT_MEDIA_TARGET);
  const outputTarget = normalizeOutputTarget(
    stringParam(req, body, 'outputTarget', '') || stringParam(req, body, 'output', '') || stringParam(req, body, 'targetOutput', ''),
    DEFAULT_MEDIA_OUTPUT_TARGET
  );

  const payload = {
    ...body,
    label,
    file: soundFile,
    mediaType,
    type: mediaType === 'video' ? 'video' : 'file',
    category,
    source: clean(body.source || core.getParam(req, 'source', '') || 'media_registry'),
    target,
    outputTarget,
    volume: numberParam(req, body, 'volume', DEFAULT_MEDIA_VOLUME),
    durationMs: Number(asset.durationMs || body.durationMs || 0) || undefined,
    requestedBy: clean(body.requestedBy || body.user || body.userLogin || core.getParam(req, 'user', '')),
    meta: {
      ...(body.meta && typeof body.meta === 'object' ? body.meta : {}),
      mediaRegistry: true,
      mediaId: Number(asset.id || 0),
      mediaRelativePath: resolved.paths?.relativePath || asset.relativePath || '',
      mediaWebPath: resolved.paths?.webPath || asset.webPath || '',
      mediaCacheCopied: !!(cacheInfo && cacheInfo.copied)
    }
  };

  delete payload.id;
  delete payload.soundId;
  delete payload.sound;

  if (body.priority !== undefined || core.getParam(req, 'priority', '') !== '') payload.priority = numberParam(req, body, 'priority', 50);
  if (body.queueIfBusy !== undefined || core.getParam(req, 'queueIfBusy', '') !== '') payload.queueIfBusy = bool(body.queueIfBusy ?? core.getParam(req, 'queueIfBusy', ''), true);
  if (body.force !== undefined || core.getParam(req, 'force', '') !== '') payload.force = bool(body.force ?? core.getParam(req, 'force', ''), false);
  return payload;
}

function httpJsonRequest(targetPath, payload) {
  const body = JSON.stringify(payload || {});
  const options = {
    hostname: process.env.COMMAND_TARGET_HOST || '127.0.0.1',
    port: Number(process.env.COMMAND_TARGET_PORT || 8080) || 8080,
    path: targetPath,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = data;
        try { parsed = data ? JSON.parse(data) : {}; } catch (_) {}
        if (res.statusCode >= 200 && res.statusCode < 300) return resolve({ ok: true, statusCode: res.statusCode, data: parsed });
        const err = new Error(`sound_play_http_${res.statusCode}`);
        err.statusCode = res.statusCode;
        err.data = parsed;
        return reject(err);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function playMedia(req, res) {
  try {
    const mediaRef = pickMediaRef(req);
    if (!mediaRef) return res.status(400).json({ ok: false, module: MODULE_NAME, step: STEP, error: 'media_id_missing' });

    const resolved = media.resolveAssetForUse(mediaRef, { useCase: '' });
    if (!resolved.ok || !resolved.asset) {
      return res.status(404).json({ ok: false, module: MODULE_NAME, step: STEP, error: resolved.error || 'media_asset_not_found', resolved });
    }
    if (!resolved.paths?.exists) {
      return res.status(404).json({ ok: false, module: MODULE_NAME, step: STEP, error: 'media_file_missing', resolved });
    }
    if (!resolved.capabilities?.hasAudio && !resolved.capabilities?.isVideo) {
      return res.status(400).json({ ok: false, module: MODULE_NAME, step: STEP, error: 'media_not_playable_by_sound_system', resolved });
    }

    let soundFile = resolved.soundSystem?.file || '';
    let cacheInfo = null;
    if (!soundFile) {
      cacheInfo = ensureCacheCopy(resolved);
      soundFile = cacheInfo.file;
    }

    const soundPayload = buildSoundPayload(req, resolved, soundFile, cacheInfo);
    const soundResult = await httpJsonRequest('/api/sound/play', soundPayload);

    return res.json({
      ok: true,
      module: MODULE_NAME,
      step: STEP,
      mediaId: Number(resolved.asset.id || 0),
      soundSystemFile: soundFile,
      cache: cacheInfo || { copied: false, legacyCompatible: true },
      payload: {
        label: soundPayload.label,
        file: soundPayload.file,
        mediaType: soundPayload.mediaType,
        category: soundPayload.category,
        target: soundPayload.target,
        outputTarget: soundPayload.outputTarget,
        volume: soundPayload.volume
      },
      soundResult: soundResult.data,
      updatedAt: core.nowIso()
    });
  } catch (err) {
    return res.status(500).json({ ok: false, module: MODULE_NAME, step: STEP, error: err.message || String(err), data: err.data || null });
  }
}

function statusPayload() {
  return {
    ok: true,
    module: MODULE_NAME,
    step: STEP,
    cacheDir: path.join(config.getSoundsDir(), CACHE_DIR_NAME),
    officialPlaybackHub: true,
    mediaRegistryRole: 'media verwaltet Dateien/IDs/Metadaten; Sound-System spielt ab',
    playbackEndpoint: `${API_PREFIX}/play-media`,
    defaults: {
      target: DEFAULT_MEDIA_TARGET,
      outputTarget: DEFAULT_MEDIA_OUTPUT_TARGET,
      volume: DEFAULT_MEDIA_VOLUME
    },
    existingOverlay: '/overlays/sound_system_overlay.html',
    routes: [
      { method: 'GET/POST', path: `${API_PREFIX}/play-media`, purpose: 'Media-Asset per zentralem Resolver ueber Sound-System Queue abspielen' },
      { method: 'GET', path: `${API_PREFIX}/media-bridge/status`, purpose: 'Status der Sound-Media-Bruecke' }
    ],
    note: 'STEP274L-FIX4 setzt Media-Playback standardmaessig auf Device + Discord. Override bleibt per target/outputTarget/volume moeglich.',
    updatedAt: core.nowIso()
  };
}

function init(ctx) {
  const { app } = ctx;
  app.get(`${API_PREFIX}/media-bridge/status`, (req, res) => res.json(statusPayload()));
  app.get(`${API_PREFIX}/play-media`, core.asyncRoute(playMedia));
  app.post(`${API_PREFIX}/play-media`, core.asyncRoute(playMedia));
  console.log('[sound_media_bridge] routes active: /api/sound/play-media');
  return { name: MODULE_NAME, step: STEP };
}

module.exports = { init, statusPayload };
