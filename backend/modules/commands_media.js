'use strict';

/**
 * STEP274G - Command Media Execution Routing with Video Bridge
 *
 * Bruecke zwischen Command-Dashboard, zentraler Medienverwaltung und Media-Sound-Bridge.
 * Wichtig:
 * - Keine bestehende Command-Ausfuehrung wird veraendert.
 * - Keine Medien werden verschoben, geloescht oder automatisch ausgefuehrt.
 * - Dashboard bekommt pro Media-Option eine execute-ready Zielroute fuer sound_play/video_play.
 */

const media = require('./media');
const core = require('./helpers/helper_core');

const MODULE_NAME = 'commands_media';
const STEP = 'STEP274G';
const API_PREFIX = '/api/commands';
const SOUND_PLAY_MEDIA_URL = '/api/sound/play-media';
const VIDEO_PLAY_MEDIA_URL = '/api/video/play-media';

function clean(value) {
  return String(value ?? '').trim();
}

function splitTypes(value) {
  const raw = clean(value || 'all').toLowerCase();
  if (!raw || raw === 'all') return [];
  return raw.split(/[\s,;]+/).map(item => item.trim()).filter(Boolean);
}

function commandMediaType(asset) {
  const type = clean(asset && asset.type || '').toLowerCase();
  if (type === 'video' || type === 'animation') return 'video';
  return 'sound';
}

function commandActionKey(asset) {
  return commandMediaType(asset) === 'video' ? 'play_video_media' : 'play_audio_media';
}

function commandTargetUrl(asset) {
  const id = Number(asset && asset.id || 0);
  const base = commandMediaType(asset) === 'video' ? VIDEO_PLAY_MEDIA_URL : SOUND_PLAY_MEDIA_URL;
  return id > 0 ? `${base}?mediaId=${encodeURIComponent(String(id))}` : base;
}

function optionFromAsset(asset) {
  const option = media.mediaOptionFromAsset(asset, { useCase: 'command_dashboard' });
  const mediaType = commandMediaType(asset);
  const targetUrl = commandTargetUrl(asset);
  return {
    ...option,
    commandExecutionReady: true,
    commandRoute: {
      moduleKey: mediaType === 'video' ? 'video_media_bridge' : 'sound_media_bridge',
      actionKey: commandActionKey(asset),
      targetMethod: 'POST',
      targetUrl,
      responseMode: 'module',
      actionType: mediaType === 'video' ? 'video_play' : 'sound_play'
    },
    commandTargetUrl: targetUrl,
    commandModuleKey: mediaType === 'video' ? 'video_media_bridge' : 'sound_media_bridge',
    commandActionKey: commandActionKey(asset)
  };
}

function listMediaOptions(req) {
  const types = splitTypes(core.getParam(req, 'type', 'all'));
  const status = clean(core.getParam(req, 'status', 'active')) || 'active';
  const q = clean(core.getParam(req, 'q', ''));
  const limit = Math.max(1, Math.min(1000, Number(core.getParam(req, 'limit', 500)) || 500));

  const collected = [];
  const requestedTypes = types.length ? types : ['audio', 'video', 'image', 'animation'];
  const perTypeLimit = Math.max(limit, 500);

  for (const type of requestedTypes) {
    const result = media.listAssets({ type, status, q, limit: perTypeLimit });
    for (const asset of result) collected.push(asset);
  }

  const deduped = [];
  const seen = new Set();
  for (const asset of collected) {
    const key = String(asset.id || asset.relativePath || '');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(asset);
  }

  deduped.sort((a, b) => {
    const ta = String(a.type || '').localeCompare(String(b.type || ''), 'de');
    if (ta !== 0) return ta;
    const ca = String(a.category || '').localeCompare(String(b.category || ''), 'de');
    if (ca !== 0) return ca;
    return String(a.displayName || a.fileName || '').localeCompare(String(b.displayName || b.fileName || ''), 'de', { sensitivity: 'base' });
  });

  return deduped.slice(0, limit).map(optionFromAsset);
}

function statusPayload() {
  return {
    ok: true,
    module: MODULE_NAME,
    step: STEP,
    execution: {
      ready: true,
      moduleKey: 'sound_media_bridge',
      targetUrlPattern: `${SOUND_PLAY_MEDIA_URL}?mediaId=<id> oder ${VIDEO_PLAY_MEDIA_URL}?mediaId=<id>`,
      audioTargetUrlPattern: `${SOUND_PLAY_MEDIA_URL}?mediaId=<id>`,
      videoTargetUrlPattern: `${VIDEO_PLAY_MEDIA_URL}?mediaId=<id>`,
      note: 'Command-Dashboard speichert sound_play auf /api/sound/play-media und video_play auf /api/video/play-media.'
    },
    routes: [
      { method: 'GET', path: `${API_PREFIX}/media-options`, purpose: 'Media-Auswahloptionen mit execute-ready Command-Routen fuer sound_play/video_play' },
      { method: 'GET', path: `${API_PREFIX}/media-bridge/status`, purpose: 'Status der Command-Media-Bruecke' }
    ],
    note: 'STEP274G trennt Command-Ausfuehrung: sound_play nutzt /api/sound/play-media, video_play nutzt /api/video/play-media und den Overlay-Player.',
    updatedAt: core.nowIso()
  };
}

function init(ctx) {
  const { app } = ctx;

  app.get(`${API_PREFIX}/media-options`, (req, res) => {
    try {
      const options = listMediaOptions(req);
      return res.json({
        ok: true,
        module: MODULE_NAME,
        step: STEP,
        options,
        count: options.length,
        filters: {
          type: clean(core.getParam(req, 'type', 'all')) || 'all',
          status: clean(core.getParam(req, 'status', 'active')) || 'active',
          q: clean(core.getParam(req, 'q', ''))
        },
        execution: statusPayload().execution,
        updatedAt: core.nowIso()
      });
    } catch (err) {
      return res.status(500).json({ ok: false, module: MODULE_NAME, step: STEP, error: err.message || String(err) });
    }
  });

  app.get(`${API_PREFIX}/media-bridge/status`, (req, res) => {
    try { return res.json(statusPayload()); }
    catch (err) { return res.status(500).json({ ok: false, module: MODULE_NAME, step: STEP, error: err.message || String(err) }); }
  });

  console.log('[commands_media] routes active: /api/commands/media-* STEP274G');
  return { name: MODULE_NAME, step: STEP };
}

module.exports = { init, statusPayload, listMediaOptions };
