'use strict';

/**
 * STEP274G - Video Media Bridge
 *
 * Video/Animation-Medien aus der zentralen Medienverwaltung werden ueber einen
 * eigenen Overlay-Player abgespielt. Audio bleibt beim Sound-System.
 *
 * Wichtig:
 * - Kein Umbau am Sound-System-Core.
 * - Keine Medien werden verschoben oder geloescht.
 * - Das Overlay zieht die aktuelle Wiedergabe ueber /api/video/media-player/state.
 */

const media = require('./media');
const core = require('./helpers/helper_core');

const MODULE_NAME = 'video_media_bridge';
const STEP = 'STEP274G';
const API_PREFIX = '/api/video';
const OVERLAY_URL = '/overlays/_overlay-media-player.html';

const state = {
  loadedAt: '',
  current: null,
  history: [],
  stats: {
    played: 0,
    stopped: 0,
    ended: 0,
    failed: 0
  },
  lastError: '',
  lastChangeAt: ''
};

function nowIso() {
  return core.nowIso();
}

function clean(value) {
  return String(value ?? '').trim();
}

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const v = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on'].includes(v)) return true;
  if (['0', 'false', 'no', 'nein', 'off'].includes(v)) return false;
  return fallback;
}

function param(req, name, fallback = '') {
  return clean(core.getParam(req, name, fallback));
}

function makeRequestId(asset) {
  return `vm_${Date.now()}_${Number(asset && asset.id || 0)}`;
}

function isVideoLike(resolved) {
  const type = clean(resolved && resolved.asset && resolved.asset.type || '').toLowerCase();
  if (type === 'video' || type === 'animation') return true;
  return !!(resolved && resolved.capabilities && resolved.capabilities.isVideo);
}

function publicCurrent() {
  if (!state.current) return null;
  return {
    requestId: state.current.requestId,
    mediaId: state.current.mediaId,
    label: state.current.label,
    type: state.current.type,
    category: state.current.category,
    url: state.current.url,
    webPath: state.current.webPath,
    durationMs: state.current.durationMs,
    width: state.current.width,
    height: state.current.height,
    volume: state.current.volume,
    loop: state.current.loop,
    muted: state.current.muted,
    fit: state.current.fit,
    background: state.current.background,
    startedAt: state.current.startedAt,
    endsAt: state.current.endsAt,
    requestedBy: state.current.requestedBy,
    source: state.current.source,
    meta: state.current.meta || {}
  };
}

function publicState() {
  return {
    ok: true,
    module: MODULE_NAME,
    step: STEP,
    overlayUrl: OVERLAY_URL,
    current: publicCurrent(),
    stats: { ...state.stats },
    lastError: state.lastError,
    loadedAt: state.loadedAt,
    lastChangeAt: state.lastChangeAt,
    updatedAt: nowIso()
  };
}

function pushHistory(item, reason) {
  if (!item) return;
  state.history.unshift({
    requestId: item.requestId,
    mediaId: item.mediaId,
    label: item.label,
    url: item.url,
    reason: reason || '',
    at: nowIso()
  });
  state.history = state.history.slice(0, 25);
}

function touch(reason) {
  state.lastChangeAt = nowIso();
  return reason;
}

function broadcast(ctx, reason) {
  try {
    if (ctx && typeof ctx.broadcastWS === 'function') {
      ctx.broadcastWS({ op: MODULE_NAME, reason: reason || 'updated', data: publicState() });
    }
  } catch (_) {}
}

function buildPlaybackPayload(req, resolved) {
  const asset = resolved.asset || {};
  const overlay = resolved.overlay || {};
  const mediaId = Number(asset.id || param(req, 'mediaId', 0));
  const volume = Math.max(0, Math.min(100, number(core.getParam(req, 'volume', req.body && req.body.volume !== undefined ? req.body.volume : 80), 80)));
  const loop = bool(core.getParam(req, 'loop', req.body && req.body.loop !== undefined ? req.body.loop : false), false);
  const muted = bool(core.getParam(req, 'muted', req.body && req.body.muted !== undefined ? req.body.muted : false), false);
  const fit = clean(core.getParam(req, 'fit', req.body && req.body.fit || 'contain')) || 'contain';
  const background = clean(core.getParam(req, 'background', req.body && req.body.background || 'transparent')) || 'transparent';
  const durationMs = Math.max(0, Number(overlay.durationMs || asset.durationMs || 0));
  const startedAt = Date.now();
  return {
    requestId: makeRequestId(asset),
    mediaId,
    label: clean(core.getParam(req, 'label', req.body && req.body.label || asset.displayName || asset.fileName || `Media ${mediaId}`)),
    type: asset.type || 'video',
    category: asset.category || '',
    url: overlay.url || asset.webPath || '',
    webPath: asset.webPath || overlay.url || '',
    durationMs,
    width: Number(overlay.width || asset.width || 0),
    height: Number(overlay.height || asset.height || 0),
    volume,
    loop,
    muted,
    fit: ['contain', 'cover', 'fill'].includes(fit) ? fit : 'contain',
    background,
    startedAt,
    endsAt: durationMs > 0 && !loop ? startedAt + durationMs : 0,
    requestedBy: clean(core.getParam(req, 'requestedBy', req.body && (req.body.requestedBy || req.body.user || req.body.userLogin) || '')),
    source: clean(core.getParam(req, 'source', req.body && req.body.source || 'video_media_bridge')),
    meta: {
      asset,
      paths: resolved.paths || {},
      command: req.body && typeof req.body === 'object' ? {
        command: req.body.command || '',
        rawMessage: req.body.rawMessage || req.body.message || '',
        userLogin: req.body.userLogin || req.body.login || '',
        userDisplayName: req.body.userDisplayName || req.body.displayName || ''
      } : {}
    }
  };
}

function readMediaRef(req) {
  return param(req, 'mediaId', '') || param(req, 'id', '') || clean(req.body && (req.body.mediaId || req.body.id || req.body.assetId) || '');
}

function playMedia(req, ctx) {
  const ref = readMediaRef(req);
  if (!ref) throw new Error('media_id_missing');
  const resolved = media.resolveAssetForUse(ref, { useCase: 'overlay' });
  if (!resolved || resolved.ok === false) {
    const err = new Error(resolved && resolved.error || 'media_resolve_failed');
    err.resolved = resolved;
    throw err;
  }
  if (!isVideoLike(resolved)) {
    const err = new Error('media_not_video_or_animation');
    err.resolved = resolved;
    throw err;
  }
  if (!resolved.overlay || resolved.overlay.compatible === false || !resolved.overlay.url) {
    const err = new Error('media_not_overlay_compatible');
    err.resolved = resolved;
    throw err;
  }

  const current = buildPlaybackPayload(req, resolved);
  if (state.current) pushHistory(state.current, 'replaced');
  state.current = current;
  state.stats.played += 1;
  state.lastError = '';
  touch('play');
  broadcast(ctx, 'play');
  return { ok: true, module: MODULE_NAME, step: STEP, message: 'Video-Medium wurde an den Overlay-Player gesendet.', item: publicCurrent(), overlayUrl: OVERLAY_URL, updatedAt: nowIso() };
}

function stopMedia(req, ctx, reason = 'manual_stop') {
  const stopped = state.current;
  if (stopped) pushHistory(stopped, reason);
  state.current = null;
  state.stats.stopped += 1;
  touch(reason);
  broadcast(ctx, reason);
  return { ok: true, module: MODULE_NAME, step: STEP, stopped: stopped ? { requestId: stopped.requestId, mediaId: stopped.mediaId, label: stopped.label } : null, updatedAt: nowIso() };
}

function clientEnded(req, ctx) {
  const requestId = param(req, 'requestId', '') || clean(req.body && req.body.requestId || '');
  const current = state.current;
  if (!current) return { ok: true, module: MODULE_NAME, step: STEP, ignored: true, reason: 'no_current', updatedAt: nowIso() };
  if (requestId && current.requestId !== requestId) return { ok: true, module: MODULE_NAME, step: STEP, ignored: true, reason: 'request_id_mismatch', current: publicCurrent(), updatedAt: nowIso() };
  pushHistory(current, 'client_ended');
  state.current = null;
  state.stats.ended += 1;
  touch('client_ended');
  broadcast(ctx, 'client_ended');
  return { ok: true, module: MODULE_NAME, step: STEP, ended: { requestId: current.requestId, mediaId: current.mediaId, label: current.label }, updatedAt: nowIso() };
}

function statusPayload() {
  return {
    ...publicState(),
    routes: [
      { method: 'GET/POST', path: `${API_PREFIX}/play-media`, purpose: 'Video/Animation aus media_assets im Overlay-Player abspielen' },
      { method: 'POST', path: `${API_PREFIX}/stop-media`, purpose: 'Aktuelle Video-/Animation-Wiedergabe stoppen' },
      { method: 'GET', path: `${API_PREFIX}/media-player/state`, purpose: 'Aktueller Overlay-Player-State' },
      { method: 'POST', path: `${API_PREFIX}/media-player/ended`, purpose: 'Overlay meldet Wiedergabe-Ende' },
      { method: 'GET', path: `${API_PREFIX}/media-bridge/status`, purpose: 'Status der Video-Media-Bruecke' }
    ],
    note: 'STEP274G trennt Video/Animation von Sound-Playback. Audio bleibt bei /api/sound/play-media, Video nutzt diesen Overlay-Player.'
  };
}

function init(ctx) {
  const { app } = ctx;
  state.loadedAt = nowIso();
  state.lastChangeAt = state.loadedAt;

  app.get(`${API_PREFIX}/media-bridge/status`, (req, res) => res.json(statusPayload()));
  app.get(`${API_PREFIX}/media-player/state`, (req, res) => res.json(publicState()));
  app.post(`${API_PREFIX}/stop-media`, (req, res) => res.json(stopMedia(req, ctx, 'manual_stop')));
  app.get(`${API_PREFIX}/stop-media`, (req, res) => res.json(stopMedia(req, ctx, 'manual_stop')));
  app.post(`${API_PREFIX}/media-player/ended`, (req, res) => res.json(clientEnded(req, ctx)));
  app.get(`${API_PREFIX}/media-player/ended`, (req, res) => res.json(clientEnded(req, ctx)));

  function handlePlay(req, res) {
    try {
      return res.json(playMedia(req, ctx));
    } catch (err) {
      state.stats.failed += 1;
      state.lastError = err.message || String(err);
      touch('play_failed');
      return res.status(400).json({ ok: false, module: MODULE_NAME, step: STEP, error: state.lastError, resolved: err.resolved || null, updatedAt: nowIso() });
    }
  }

  app.get(`${API_PREFIX}/play-media`, handlePlay);
  app.post(`${API_PREFIX}/play-media`, handlePlay);

  console.log('[video_media_bridge] routes active: /api/video/* STEP274G');
  return { name: MODULE_NAME, step: STEP };
}

module.exports = { init, statusPayload, playMedia };
