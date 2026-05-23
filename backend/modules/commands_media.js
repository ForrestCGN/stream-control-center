'use strict';

/**
 * STEP274C - Commands <-> Media Management Bridge
 *
 * Kleine Bruecke zwischen zentralem Command-System und zentraler Medienverwaltung.
 * Wichtig:
 * - Keine bestehende Command-Ausfuehrung wird veraendert.
 * - Keine Medien werden verschoben, geloescht oder automatisch ausgefuehrt.
 * - Dashboard kann Command-Action-Typen sound_play/video_play jetzt aus media_assets befuellen.
 */

const media = require('./media');
const core = require('./helpers/helper_core');

const MODULE_NAME = 'commands_media';
const STEP = 'STEP274C';
const API_PREFIX = '/api/commands';

function clean(value) {
  return String(value ?? '').trim();
}

function splitTypes(value) {
  const raw = clean(value || 'all').toLowerCase();
  if (!raw || raw === 'all') return [];
  return raw.split(/[\s,;]+/).map(item => item.trim()).filter(Boolean);
}

function normalizeSlashes(value) {
  return String(value || '').replace(/\\/g, '/');
}

function soundSystemFileFor(asset) {
  const rel = normalizeSlashes(asset && asset.relativePath || '');
  if (!rel) return '';
  if (rel.startsWith('sounds/')) return rel.slice('sounds/'.length);
  return '';
}

function optionFromAsset(asset) {
  const soundFile = soundSystemFileFor(asset);
  return {
    id: Number(asset.id || 0),
    type: asset.type || '',
    category: asset.category || '',
    label: asset.displayName || asset.fileName || asset.relativePath || String(asset.id || ''),
    displayName: asset.displayName || '',
    fileName: asset.fileName || '',
    relativePath: asset.relativePath || '',
    webPath: asset.webPath || '',
    durationMs: Number(asset.durationMs || 0),
    width: Number(asset.width || 0),
    height: Number(asset.height || 0),
    hasAudio: !!asset.hasAudio,
    hasVideo: !!asset.hasVideo,
    source: asset.source || '',
    status: asset.status || '',
    soundSystemFile: soundFile,
    soundSystemCompatible: !!soundFile
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
    routes: [
      { method: 'GET', path: `${API_PREFIX}/media-options`, purpose: 'Media-Auswahloptionen fuer Command-Dashboard sound_play/video_play' },
      { method: 'GET', path: `${API_PREFIX}/media-bridge/status`, purpose: 'Status der Command-Media-Bruecke' }
    ],
    note: 'STEP274C bindet Commands im Dashboard an media_assets. Ausfuehrung bleibt fuer Folge-Step getrennt.',
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
        updatedAt: core.nowIso()
      });
    } catch (err) {
      return res.status(500).json({ ok: false, module: MODULE_NAME, error: err.message || String(err) });
    }
  });

  app.get(`${API_PREFIX}/media-bridge/status`, (req, res) => {
    try { return res.json(statusPayload()); }
    catch (err) { return res.status(500).json({ ok: false, module: MODULE_NAME, error: err.message || String(err) }); }
  });

  console.log('[commands_media] routes active: /api/commands/media-*');
  return { name: MODULE_NAME, step: STEP };
}

module.exports = { init, statusPayload, listMediaOptions };
