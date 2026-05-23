'use strict';

/**
 * STEP274J - Command Media Practice Check via Official Sound-System Playback Hub
 *
 * Bruecke zwischen Command-Dashboard, zentraler Medienverwaltung und Media-Sound-Bridge.
 * Wichtig:
 * - Keine bestehende Command-Ausfuehrung wird veraendert.
 * - Keine Medien werden verschoben, geloescht oder automatisch ausgefuehrt.
 * - Dashboard bekommt pro Media-Option eine execute-ready Zielroute fuer sound_play/video_play.
 * - STEP274J: Dashboard-/Praxis-Check prueft gespeicherte Media-Commands gegen den offiziellen Sound-System-Hub.
 */

const media = require('./media');
const core = require('./helpers/helper_core');
const database = require('../core/database');

const MODULE_NAME = 'commands_media';
const STEP = 'STEP274J';
const API_PREFIX = '/api/commands';
const SOUND_PLAY_MEDIA_URL = '/api/sound/play-media';
const VIDEO_PLAY_MEDIA_URL = SOUND_PLAY_MEDIA_URL;

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
      moduleKey: 'sound_media_bridge',
      actionKey: commandActionKey(asset),
      targetMethod: 'POST',
      targetUrl,
      responseMode: 'module',
      actionType: mediaType === 'video' ? 'video_play' : 'sound_play'
    },
    commandTargetUrl: targetUrl,
    commandModuleKey: 'sound_media_bridge',
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

function safeJsonDecode(value, fallback = {}) {
  if (value === undefined || value === null || value === '') return fallback;
  try {
    if (typeof database.jsonDecode === 'function') return database.jsonDecode(value, fallback);
  } catch (_) {}
  try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}

function normalizeTrigger(value) {
  return clean(value).replace(/^[!./]+/, '').toLowerCase();
}

function readCommandByTrigger(trigger) {
  const cleanTrigger = normalizeTrigger(trigger);
  if (!cleanTrigger) return null;
  database.ensureReady();
  const row = database.get('SELECT * FROM command_definitions WHERE trigger = :trigger', { trigger: cleanTrigger });
  if (!row) return null;
  return {
    id: Number(row.id || 0),
    trigger: row.trigger || '',
    aliases: safeJsonDecode(row.aliases_json, []),
    moduleKey: row.module_key || '',
    actionKey: row.action_key || '',
    targetMethod: row.target_method || '',
    targetUrl: row.target_url || '',
    enabled: Number(row.enabled || 0) === 1,
    permissionLevel: row.permission_level || '',
    cooldownGlobalMs: Number(row.cooldown_global_ms || 0),
    cooldownUserMs: Number(row.cooldown_user_ms || 0),
    liveOnly: Number(row.live_only || 0) === 1,
    responseMode: row.response_mode || '',
    config: safeJsonDecode(row.config_json, {}),
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || ''
  };
}

function mediaIdFromCommand(command) {
  if (!command) return '';
  const cfg = command.config && typeof command.config === 'object' ? command.config : {};
  const candidates = [cfg.mediaId, cfg.soundMediaId, cfg.videoMediaId, cfg.mediaAssetId];
  const url = clean(command.targetUrl || '');
  const match = url.match(/[?&]mediaId=([^&]+)/i);
  if (match) candidates.unshift(decodeURIComponent(match[1]));
  for (const candidate of candidates) {
    const cleanCandidate = clean(candidate);
    if (cleanCandidate) return cleanCandidate;
  }
  return '';
}

function expectedRouteForMediaId(mediaId) {
  const cleanId = clean(mediaId);
  return cleanId ? `${SOUND_PLAY_MEDIA_URL}?mediaId=${encodeURIComponent(cleanId)}` : '';
}

function checkStoredMediaCommand(trigger) {
  const command = readCommandByTrigger(trigger);
  const checks = [];
  if (!command) {
    return { ok: false, module: MODULE_NAME, step: STEP, trigger: normalizeTrigger(trigger), exists: false, error: 'command_not_found', checks, updatedAt: core.nowIso() };
  }

  const cfg = command.config && typeof command.config === 'object' ? command.config : {};
  const actionType = clean(cfg.actionType || '');
  const mediaId = mediaIdFromCommand(command);
  const expectedTargetUrl = expectedRouteForMediaId(mediaId);
  const moduleOk = command.moduleKey === 'sound_media_bridge';
  const targetOk = !!expectedTargetUrl && command.targetUrl === expectedTargetUrl;
  const methodOk = clean(command.targetMethod || '').toUpperCase() === 'POST';
  const responseOk = !command.responseMode || command.responseMode === 'module';
  const actionTypeOk = ['sound_play', 'video_play'].includes(actionType);
  const mediaIdOk = !!mediaId;
  const actionKeyOk = ['play_audio_media', 'play_video_media'].includes(command.actionKey || '');

  checks.push({ id: 'module_key', ok: moduleOk, expected: 'sound_media_bridge', actual: command.moduleKey });
  checks.push({ id: 'target_url', ok: targetOk, expected: expectedTargetUrl, actual: command.targetUrl });
  checks.push({ id: 'target_method', ok: methodOk, expected: 'POST', actual: command.targetMethod });
  checks.push({ id: 'response_mode', ok: responseOk, expected: 'module', actual: command.responseMode });
  checks.push({ id: 'action_type', ok: actionTypeOk, expected: 'sound_play oder video_play', actual: actionType });
  checks.push({ id: 'action_key', ok: actionKeyOk, expected: 'play_audio_media oder play_video_media', actual: command.actionKey });
  checks.push({ id: 'media_id', ok: mediaIdOk, expected: 'Media-ID in Ziel-URL/Config', actual: mediaId });

  let resolved = null;
  if (mediaIdOk) {
    try {
      resolved = media.resolveAssetForUse(mediaId, { useCase: 'command_dashboard_check' });
      checks.push({ id: 'media_resolve', ok: !!resolved.ok && !!resolved.asset, expected: 'auflösbares media_asset', actual: resolved.ok ? `#${resolved.asset.id} ${resolved.asset.displayName || resolved.asset.fileName || ''}` : (resolved.error || 'not_ok') });
      checks.push({ id: 'media_file_exists', ok: !!resolved.paths?.exists, expected: true, actual: !!resolved.paths?.exists });
    } catch (err) {
      checks.push({ id: 'media_resolve', ok: false, expected: 'auflösbares media_asset', actual: err.message || String(err) });
    }
  }

  const ok = checks.every(check => check.ok === true);
  return {
    ok,
    module: MODULE_NAME,
    step: STEP,
    trigger: command.trigger,
    exists: true,
    command,
    mediaId,
    expectedTargetUrl,
    checks,
    resolved: resolved ? {
      ok: !!resolved.ok,
      asset: resolved.asset ? { id: resolved.asset.id, type: resolved.asset.type, displayName: resolved.asset.displayName, fileName: resolved.asset.fileName, relativePath: resolved.asset.relativePath, webPath: resolved.asset.webPath, status: resolved.asset.status } : null,
      paths: resolved.paths || null,
      capabilities: resolved.capabilities || null,
      soundSystem: resolved.soundSystem || null
    } : null,
    message: ok ? 'Media-Command ist korrekt auf den offiziellen Sound-System-Hub geroutet.' : 'Media-Command braucht Korrektur im Dashboard oder in der Zielroute.',
    updatedAt: core.nowIso()
  };
}

function statusPayload() {
  return {
    ok: true,
    module: MODULE_NAME,
    step: STEP,
    execution: {
      ready: true,
      moduleKey: 'sound_media_bridge',
      targetUrlPattern: `${SOUND_PLAY_MEDIA_URL}?mediaId=<id>`,
      audioTargetUrlPattern: `${SOUND_PLAY_MEDIA_URL}?mediaId=<id>`,
      videoTargetUrlPattern: `${SOUND_PLAY_MEDIA_URL}?mediaId=<id>`,
      existingOverlay: '/overlays/sound_system_overlay.html',
      note: 'Command-Dashboard speichert sound_play und video_play auf /api/sound/play-media. Medienverwaltung liefert die Media-ID; Sound-System uebernimmt Queue, Ausgabe und Overlay. STEP274J ergänzt einen Praxis-Check fuer gespeicherte Commands.'
    },
    routes: [
      { method: 'GET', path: `${API_PREFIX}/media-options`, purpose: 'Media-Auswahloptionen mit execute-ready Command-Routen fuer sound_play/video_play' },
      { method: 'GET', path: `${API_PREFIX}/media-bridge/status`, purpose: 'Status der Command-Media-Bruecke' },
      { method: 'GET', path: `${API_PREFIX}/media-command-check`, purpose: 'Gespeicherten sound_play/video_play Command gegen Media-ID und Sound-Hub-Route pruefen' }
    ],
    note: 'STEP274J prueft Dashboard-Praxis: Media-Commands sollen Media-IDs speichern und ueber /api/sound/play-media laufen. Medienverwaltung bleibt Registry, Sound-System bleibt Abspieler.',
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


  app.get(`${API_PREFIX}/media-command-check`, (req, res) => {
    try {
      const trigger = clean(core.getParam(req, 'trigger', '') || core.getParam(req, 'command', ''));
      if (!trigger) return res.status(400).json({ ok: false, module: MODULE_NAME, step: STEP, error: 'trigger_missing' });
      const result = checkStoredMediaCommand(trigger);
      return res.status(result.ok || result.exists ? 200 : 404).json(result);
    } catch (err) {
      return res.status(500).json({ ok: false, module: MODULE_NAME, step: STEP, error: err.message || String(err) });
    }
  });

  console.log('[commands_media] routes active: /api/commands/media-* STEP274J');
  return { name: MODULE_NAME, step: STEP };
}

module.exports = { init, statusPayload, listMediaOptions, checkStoredMediaCommand };
