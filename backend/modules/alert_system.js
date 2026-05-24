'use strict';

// STEP95 â€” Dashboard Foundation + Alert System V2 MVP
// Zentraler Alert-Core mit SQLite-Regeln, Asset-Verwaltung, Queue, WebSocket-Overlay und Dashboard-API.

const fs = require('fs');
const path = require('path');

let multer = null;
let multerLoadError = '';
try {
  multer = require('multer');
} catch (err) {
  multerLoadError = err && err.message ? err.message : String(err);
}

const database = require('../core/database');
const core = require('./helpers/helper_core');
const configHelper = require('./helpers/helper_config');
const routes = require('./helpers/helper_routes');
const security = require('./helpers/helper_security');
const media = require('./helpers/helper_media');

let communicationBus = null;
try {
  communicationBus = require('./communication_bus');
} catch (err) {
  communicationBus = null;
}

const MODULE = 'alert_system';
const SCHEMA_VERSION = 6;
const MODULE_STEP = 276;

const DEFAULT_CONFIG = {
  enabled: true,
  overlayEnabled: true,
  dashboardEnabled: true,
  queueEnabled: true,
  uploadEnabled: true,
  allowLanUploads: true,
  soundsDir: 'htdocs/assets/sounds/alerts',
  imagesDir: 'htdocs/assets/images/alerts',
  maxSoundSizeBytes: 15728640,
  maxImageSizeBytes: 10485760,
  fallbackFinishMs: 12000,
  gapBetweenAlertsMs: 700,
  defaultDurationMs: 7000,
  defaultIntroMs: 700,
  defaultOutroMs: 600,
  autoDurationOnUpload: true,
  soundDurationPaddingMs: 1200,
  minAutoDurationMs: 4000,
  maxAutoDurationMs: 60000,
  ffprobeTimeoutMs: 5000,
  allowedSoundTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'],
  allowedImageTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
  allowedImageModes: ['none', 'icon', 'avatar', 'avatar_icon', 'special', 'avatar_special', 'random_pool'],
  wsOp: 'alert_system',
  avatarResolveEnabled: true,
  avatarResolveUserinfoUrl: 'http://127.0.0.1:8080/userinfo',
  avatarResolveTimeoutMs: 2500,
  avatarResolveCacheMs: 3600000,
  chatMessageEnabled: true,
  chatMessagePostUrl: '',
  chatMessagePostMethod: 'POST',
  chatMessageTimeoutMs: 2500,
  chatMessageOutboxLimit: 100,
  // Sicherheitsnetz: Provider-/Live-Events ohne passende aktive Regel werden ignoriert.
  // Verhindert z.B. Tipeee-Follow-Alerts, wenn nur Twitch-Follow-Regeln existieren.
  playUnmatchedAlerts: false,
  preview: {
    localBrowserAudio: true,
    sendToLiveOverlay: false,
    sendToSoundSystem: false
  },
  liveAlert: {
    soundSystemEnabled: false,
    soundSystemPlayUrl: 'http://127.0.0.1:8080/api/sound/play',
    soundSystemOutputTarget: 'device',
    soundSystemCategory: 'alert',
    soundSystemSource: 'alert_system',
    waitForSoundItemStarted: true,
    fallbackShowOnSoundError: true,
    fallbackShowAfterMs: 15000,
    ttsPrepareUrl: 'http://127.0.0.1:8080/api/tts/prepare-alert',
    ttsSoundCategory: 'tts',
    ttsSoundSource: 'alert_tts',
    ttsSoundPriority: 50,
    ttsSoundVolume: 85,
    ttsOutputTarget: 'device',
    ttsAfterSoundDelayMs: 250,
    ttsPrepareTimeoutMs: 15000,
    ttsPlaybackTimeoutMs: 15000
  },
  communicationBusMirror: {
    enabled: false,
    channel: 'visual.alert',
    action: 'play',
    requireAck: true,
    replayable: true,
    ttlMs: 60000,
    targetType: 'all',
    targetId: '*',
    targetModule: '',
    targetCapability: ''
  },
  dashboardSettings: {
    preferSqliteSettings: true,
    allowRuntimeEdit: true,
    settingsTable: 'alert_settings'
  }
};

const DEFAULT_MESSAGES = {
  moduleReady: '[ALERT] Alert-System V2 bereit.',
  alertQueued: '[ALERT] Alert wurde eingereiht.',
  alertPlayed: '[ALERT] Alert wurde abgespielt.',
  noMatchingRule: '[ALERT] Keine passende Regel gefunden.'
};

const state = {
  loadedAt: new Date().toISOString(),
  config: { ...DEFAULT_CONFIG },
  messages: { ...DEFAULT_MESSAGES },
  queue: [],
  current: null,
  history: [],
  overlayClients: new Map(),
  processing: false,
  finishTimer: null,
  started: false,
  broadcastWS: null,
  avatarCache: new Map(),
  alertBusMirror: {
    runtimeEnabled: false,
    changedAt: '',
    changedReason: '',
    emitted: 0,
    skipped: 0,
    errors: 0,
    lastEventUid: '',
    lastBusEventId: '',
    lastResult: null,
    lastError: '',
    lastTiming: null
  }
};

module.exports.init = function init(ctx) {
  const { app, wss, broadcastWS } = ctx;
  state.broadcastWS = broadcastWS;

  ensureRuntime(ctx);
  reloadConfig();
  ensureDirs();
  ensureSchema();
  seedDefaults();
  applyRuntimeSettingsFromDb();
  ensureDirs();

  if (wss) attachWs(wss);

  const guard = security.requireLocalOrAuth();
  const upload = createUploadMiddleware();

  routes.registerGet(app, '/api/alerts/status', (req, res) => res.json(buildStatus(req)));
  routes.registerGet(app, '/api/alerts/health', (req, res) => res.json(buildHealth(req)));
  routes.registerGet(app, '/api/alerts/bus-mirror/status', guard, (req, res) => res.json(buildAlertBusMirrorStatus()));
  routes.registerGet(app, '/api/alerts/bus-mirror/enable', guard, (req, res) => res.status(req.query.confirm === '1' ? 200 : 400).json(setAlertBusMirrorRuntimeEnabled(true, req.query.confirm === '1' ? 'api_enable' : 'confirm_required')));
  routes.registerGet(app, '/api/alerts/bus-mirror/disable', guard, (req, res) => res.status(req.query.confirm === '1' ? 200 : 400).json(setAlertBusMirrorRuntimeEnabled(false, req.query.confirm === '1' ? 'api_disable' : 'confirm_required')));
  routes.registerGet(app, '/api/alerts/queue', (req, res) => res.json({ ok: true, current: state.current, queue: state.queue, queueLength: state.queue.length }));
  routes.registerPost(app, '/api/alerts/clear', guard, (req, res) => {
    clearQueue('api_clear');
    sendOverlay(broadcastWS, { event: 'clear' });
    res.json({ ok: true, queueLength: 0, current: state.current });
  });
  routes.registerPost(app, '/api/alerts/reload', guard, (req, res) => {
    reloadConfig();
    ensureDirs();
    ensureSchema();
    seedDefaults();
    applyRuntimeSettingsFromDb();
    ensureDirs();
    res.json({ ok: true, status: buildStatus(req) });
  });
  routes.registerPost(app, '/api/alerts/enqueue', guard, (req, res) => {
    const result = enqueueFromRequest(req, broadcastWS, 'api');
    res.status(result.ok ? 200 : 400).json(result);
  });
  routes.registerPost(app, '/api/alerts/test', guard, (req, res) => {
    const result = enqueueAlert(normalizeAlertPayload(req.body || {}, 'test'), broadcastWS);
    res.status(result.ok ? 200 : 400).json(result);
  });

  routes.registerGet(app, '/api/alerts/text-variants', guard, (req, res) => res.json({ ok: true, variants: listTextVariants(req.query || {}) }));
  routes.registerPost(app, '/api/alerts/text-variants', guard, (req, res) => res.status(201).json(saveTextVariant(req.body || {})));
  routes.registerPut(app, '/api/alerts/text-variants/:id', guard, (req, res) => res.json(saveTextVariant({ ...(req.body || {}), id: req.params.id })));
  routes.registerDelete(app, '/api/alerts/text-variants/:id', guard, (req, res) => res.json(deleteTextVariant(req.params.id)));

  routes.registerGet(app, '/api/alerts/chat-blocks', guard, (req, res) => res.json({ ok: true, blocks: listChatBlocks(req.query || {}) }));
  routes.registerPost(app, '/api/alerts/chat-blocks', guard, (req, res) => res.status(201).json(saveChatBlock(req.body || {})));
  routes.registerPut(app, '/api/alerts/chat-blocks/:id', guard, (req, res) => res.json(saveChatBlock({ ...(req.body || {}), id: req.params.id })));
  routes.registerDelete(app, '/api/alerts/chat-blocks/:id', guard, (req, res) => res.json(deleteChatBlock(req.params.id)));

  routes.registerGet(app, '/api/alerts/chat-outbox', guard, (req, res) => res.json({ ok:true, rows:listChatOutbox(req.query || {}) }));
  routes.registerPost(app, '/api/alerts/chat-outbox/:id/sent', guard, (req, res) => res.json(markChatOutboxSent(req.params.id)));
  routes.registerPost(app, '/api/alerts/chat-outbox/:id/consumed', guard, (req, res) => res.json(markChatOutboxConsumed(req.params.id)));
  routes.registerPost(app, '/api/alerts/chat-outbox/:id/error', guard, (req, res) => res.json(markChatOutboxError(req.params.id, req.body || {})));

  routes.registerGet(app, '/api/alerts/test-presets', guard, (req, res) => res.json({ ok: true, presets: listTestPresets(req.query || {}) }));
  routes.registerPost(app, '/api/alerts/test-presets', guard, (req, res) => res.status(201).json(saveTestPreset(req.body || {})));
  routes.registerPut(app, '/api/alerts/test-presets/:id', guard, (req, res) => res.json(saveTestPreset({ ...(req.body || {}), id: req.params.id })));
  routes.registerDelete(app, '/api/alerts/test-presets/:id', guard, (req, res) => res.json(deleteTestPreset(req.params.id)));
  routes.registerPost(app, '/api/alerts/test-presets/:id/play', guard, (req, res) => {
    const preset = getTestPresetById(req.params.id);
    if (!preset) return res.status(404).json({ ok: false, error: 'preset_not_found' });
    const payload = normalizeAlertPayload({ ...preset.payload, source: preset.source, type_key: preset.type_key }, preset.source);
    const result = enqueueAlert(payload, broadcastWS);
    res.status(result.ok ? 200 : 400).json({ ...result, presetId: preset.id });
  });

  routes.registerGet(app, '/api/alerts/display-profiles', guard, (req, res) => res.json({ ok: true, profiles: listDisplayProfiles(req.query || {}) }));
  routes.registerPost(app, '/api/alerts/display-profiles', guard, (req, res) => {
    try { res.status(201).json(saveDisplayProfile(req.body || {})); }
    catch (err) { res.status(400).json({ ok:false, error:'display_profile_save_failed', message:err.message || String(err) }); }
  });
  routes.registerPut(app, '/api/alerts/display-profiles/:id', guard, (req, res) => {
    try { res.json(saveDisplayProfile({ ...(req.body || {}), id: req.params.id })); }
    catch (err) { res.status(400).json({ ok:false, error:'display_profile_save_failed', message:err.message || String(err) }); }
  });
  routes.registerDelete(app, '/api/alerts/display-profiles/:id', guard, (req, res) => res.json(deleteDisplayProfile(req.params.id)));
  routes.registerPost(app, '/api/alerts/display-profiles/:id/play', guard, (req, res) => {
    const profile = getDisplayProfileById(req.params.id);
    if (!profile) return res.status(404).json({ ok: false, error: 'display_profile_not_found' });
    const celebration = validateCelebration((req.body || {}).celebration || 'none');
    const payload = normalizeAlertPayload({ source:'twitch', type_key:'bits', user:'ForrestCGN', userLogin:'forrestcgn', amount:100, message:'Live-Vorschau aus dem Dashboard', displayProfileId: profile.id, celebration, meta:{ celebration } }, 'twitch');
    const result = enqueueAlert(payload, broadcastWS);
    res.status(result.ok ? 200 : 400).json({ ...result, displayProfileId: profile.id });
  });
  routes.registerGet(app, '/api/alerts/integration-check', guard, (req, res) => res.json(checkAlertIntegration()));
  routes.registerGet(app, '/api/alerts/routes', guard, (req, res) => res.json(buildAlertRoutes(req)));
  routes.registerGet(app, '/api/alerts/events', guard, (req, res) => res.json({ ok: true, events: listAlertEvents(req.query || {}) }));


  routes.registerPost(app, '/api/alerts/events/:eventUid/replay', guard, (req, res) => {
    const result = replayAlertEvent(req.params.eventUid, broadcastWS);
    res.status(result.ok ? 200 : 400).json(result);
  });

  // Pragmatic Streamer.bot GET routes for first Twitch wiring. Values can also be posted to /api/alerts/enqueue.
  routes.registerGet(app, '/api/alerts/twitch/follow', guard, (req, res) => res.json(enqueueAlert(normalizeAlertPayload({ ...req.query, source: 'twitch', type: 'follow', amount: 1 }, 'twitch'), broadcastWS)));
  routes.registerGet(app, '/api/alerts/twitch/raid', guard, (req, res) => res.json(enqueueAlert(normalizeAlertPayload({ ...req.query, source: 'twitch', type: 'raid' }, 'twitch'), broadcastWS)));
  routes.registerGet(app, '/api/alerts/twitch/bits', guard, (req, res) => res.json(enqueueAlert(normalizeAlertPayload({ ...req.query, source: 'twitch', type: 'bits' }, 'twitch'), broadcastWS)));
  routes.registerPost(app, '/api/alerts/twitch', guard, (req, res) => res.json(enqueueAlert(normalizeAlertPayload({ ...(req.body || {}), source: 'twitch' }, 'twitch'), broadcastWS)));

  routes.registerGet(app, '/api/alerts/rules', guard, (req, res) => res.json({ ok: true, rules: listRules(), types: listTypes(), assets: listAssets() }));
  routes.registerPost(app, '/api/alerts/rules', guard, (req, res) => res.status(201).json(saveRule(req.body || {})));
  routes.registerPut(app, '/api/alerts/rules/:id', guard, (req, res) => res.json(saveRule({ ...(req.body || {}), id: req.params.id })));
  routes.registerDelete(app, '/api/alerts/rules/:id', guard, (req, res) => res.json(deleteRule(req.params.id)));
  routes.registerPost(app, '/api/alerts/rules/validate', guard, (req, res) => res.json(validateRules(req.body || {})));

  routes.registerGet(app, '/api/alerts/assets', guard, (req, res) => res.json({ ok: true, assets: listAssets(), multerReady: !!multer, multerLoadError }));
  routes.registerPost(app, '/api/alerts/assets/upload', guard, (req, res, next) => {
    if (!upload) return res.status(500).json({ ok: false, error: 'multer_not_available', message: 'multer ist nicht installiert oder konnte nicht geladen werden.', detail: multerLoadError });
    upload.single('file')(req, res, err => {
      if (err) return res.status(400).json({ ok: false, error: 'upload_failed', message: err.message || String(err) });
      try {
        return res.status(201).json(registerUploadedAsset(req));
      } catch (e) {
        return next(e);
      }
    });
  });
  routes.registerDelete(app, '/api/alerts/assets/:id', guard, (req, res) => res.json(deleteAsset(req.params.id, req.query.deleteFile === '1')));
  routes.registerGet(app, '/api/alerts/assets/:id/usage', guard, (req, res) => res.json(assetUsage(req.params.id)));
  routes.registerPost(app, '/api/alerts/assets/scan-durations', guard, (req, res) => res.json(scanSoundDurations(req.body || {})));

  routes.registerGet(app, '/api/alerts/settings', guard, (req, res) => res.json({ ok: true, settings: getSettings(), config: publicConfig() }));
  routes.registerPost(app, '/api/alerts/settings', guard, (req, res) => res.json(saveSettings(req.body || {})));
  routes.registerGet(app, '/api/alerts/config', guard, (req, res) => res.json({ ok: true, config: publicConfig() }));
  routes.registerPost(app, '/api/alerts/config', guard, (req, res) => res.json(saveAlertConfig(req.body || {})));

  console.log('[alert_system] STEP126 Preview-Overlay Unified aktiv');
};

function buildAlertRoutes(req = null) {
  const routeList = [
    { method: 'GET', path: '/api/alerts/status', auth: 'public/local', category: 'status', description: 'Alert-System Status und Laufzeitinformationen.' },
    { method: 'GET', path: '/api/alerts/health', auth: 'public/local', category: 'status', description: 'Kurzprüfung des Alert-Systems.' },
    { method: 'GET', path: '/api/alerts/bus-mirror/status', auth: 'local_or_auth', category: 'communication', description: 'Alert Communication-Bus-Mirror Status lesen.' },
    { method: 'GET', path: '/api/alerts/bus-mirror/enable', auth: 'local_or_auth', category: 'communication', description: 'Alert Communication-Bus-Mirror runtime-only aktivieren.' },
    { method: 'GET', path: '/api/alerts/bus-mirror/disable', auth: 'local_or_auth', category: 'communication', description: 'Alert Communication-Bus-Mirror runtime-only deaktivieren.' },
    { method: 'GET', path: '/api/alerts/queue', auth: 'public/local', category: 'queue', description: 'Aktueller Alert und Warteschlange.' },
    { method: 'POST', path: '/api/alerts/clear', auth: 'local_or_auth', category: 'queue', description: 'Queue leeren und Overlay clear senden.' },
    { method: 'POST', path: '/api/alerts/reload', auth: 'local_or_auth', category: 'admin', description: 'Config neu laden, Schema/Seeds prüfen und DB-Settings anwenden.' },
    { method: 'POST', path: '/api/alerts/enqueue', auth: 'local_or_auth', category: 'playback', description: 'Alert per API einreihen.' },
    { method: 'POST', path: '/api/alerts/test', auth: 'local_or_auth', category: 'test', description: 'Test-Alert einreihen.' },

    { method: 'GET', path: '/api/alerts/text-variants', auth: 'local_or_auth', category: 'texts', description: 'Alert-Textvarianten lesen.' },
    { method: 'POST', path: '/api/alerts/text-variants', auth: 'local_or_auth', category: 'texts', description: 'Alert-Textvariante anlegen.' },
    { method: 'PUT', path: '/api/alerts/text-variants/:id', auth: 'local_or_auth', category: 'texts', description: 'Alert-Textvariante aktualisieren.' },
    { method: 'DELETE', path: '/api/alerts/text-variants/:id', auth: 'local_or_auth', category: 'texts', description: 'Alert-Textvariante löschen.' },

    { method: 'GET', path: '/api/alerts/chat-blocks', auth: 'local_or_auth', category: 'chat', description: 'Chat-Textblöcke lesen.' },
    { method: 'POST', path: '/api/alerts/chat-blocks', auth: 'local_or_auth', category: 'chat', description: 'Chat-Textblock anlegen.' },
    { method: 'PUT', path: '/api/alerts/chat-blocks/:id', auth: 'local_or_auth', category: 'chat', description: 'Chat-Textblock aktualisieren.' },
    { method: 'DELETE', path: '/api/alerts/chat-blocks/:id', auth: 'local_or_auth', category: 'chat', description: 'Chat-Textblock löschen.' },

    { method: 'GET', path: '/api/alerts/chat-outbox', auth: 'local_or_auth', category: 'chat', description: 'Chat-Outbox lesen.' },
    { method: 'POST', path: '/api/alerts/chat-outbox/:id/sent', auth: 'local_or_auth', category: 'chat', description: 'Chat-Outbox-Eintrag als gesendet markieren.' },
    { method: 'POST', path: '/api/alerts/chat-outbox/:id/consumed', auth: 'local_or_auth', category: 'chat', description: 'Chat-Outbox-Eintrag als konsumiert markieren.' },
    { method: 'POST', path: '/api/alerts/chat-outbox/:id/error', auth: 'local_or_auth', category: 'chat', description: 'Chat-Outbox-Fehler speichern.' },

    { method: 'GET', path: '/api/alerts/test-presets', auth: 'local_or_auth', category: 'test', description: 'Test-Presets lesen.' },
    { method: 'POST', path: '/api/alerts/test-presets', auth: 'local_or_auth', category: 'test', description: 'Test-Preset anlegen.' },
    { method: 'PUT', path: '/api/alerts/test-presets/:id', auth: 'local_or_auth', category: 'test', description: 'Test-Preset aktualisieren.' },
    { method: 'DELETE', path: '/api/alerts/test-presets/:id', auth: 'local_or_auth', category: 'test', description: 'Test-Preset löschen.' },
    { method: 'POST', path: '/api/alerts/test-presets/:id/play', auth: 'local_or_auth', category: 'test', description: 'Test-Preset abspielen.' },

    { method: 'GET', path: '/api/alerts/display-profiles', auth: 'local_or_auth', category: 'display', description: 'Display-Profile lesen.' },
    { method: 'POST', path: '/api/alerts/display-profiles', auth: 'local_or_auth', category: 'display', description: 'Display-Profil anlegen.' },
    { method: 'PUT', path: '/api/alerts/display-profiles/:id', auth: 'local_or_auth', category: 'display', description: 'Display-Profil aktualisieren.' },
    { method: 'DELETE', path: '/api/alerts/display-profiles/:id', auth: 'local_or_auth', category: 'display', description: 'Display-Profil löschen.' },
    { method: 'POST', path: '/api/alerts/display-profiles/:id/play', auth: 'local_or_auth', category: 'display', description: 'Display-Profil als Vorschau abspielen.' },

    { method: 'GET', path: '/api/alerts/integration-check', auth: 'local_or_auth', category: 'diagnostics', description: 'Integration-Check des Alert-Systems.' },
    { method: 'GET', path: '/api/alerts/routes', auth: 'local_or_auth', category: 'diagnostics', description: 'Read-only Routenübersicht des Alert-Systems.' },

    { method: 'GET', path: '/api/alerts/events', auth: 'local_or_auth', category: 'events', description: 'DB-basierte Alert-History lesen.' },
    { method: 'POST', path: '/api/alerts/events/:eventUid/replay', auth: 'local_or_auth', category: 'events', description: 'Alert-Event erneut abspielen.' },

    { method: 'GET', path: '/api/alerts/twitch/follow', auth: 'local_or_auth', category: 'provider', description: 'Streamer.bot/Twitch GET-Route für Follow.' },
    { method: 'GET', path: '/api/alerts/twitch/raid', auth: 'local_or_auth', category: 'provider', description: 'Streamer.bot/Twitch GET-Route für Raid.' },
    { method: 'GET', path: '/api/alerts/twitch/bits', auth: 'local_or_auth', category: 'provider', description: 'Streamer.bot/Twitch GET-Route für Bits.' },
    { method: 'POST', path: '/api/alerts/twitch', auth: 'local_or_auth', category: 'provider', description: 'Twitch Provider-Event per POST.' },

    { method: 'GET', path: '/api/alerts/rules', auth: 'local_or_auth', category: 'rules', description: 'Regeln, Typen und Assets lesen.' },
    { method: 'POST', path: '/api/alerts/rules', auth: 'local_or_auth', category: 'rules', description: 'Regel anlegen.' },
    { method: 'PUT', path: '/api/alerts/rules/:id', auth: 'local_or_auth', category: 'rules', description: 'Regel aktualisieren.' },
    { method: 'DELETE', path: '/api/alerts/rules/:id', auth: 'local_or_auth', category: 'rules', description: 'Regel löschen.' },
    { method: 'POST', path: '/api/alerts/rules/validate', auth: 'local_or_auth', category: 'rules', description: 'Regelset validieren.' },

    { method: 'GET', path: '/api/alerts/assets', auth: 'local_or_auth', category: 'assets', description: 'Assets lesen.' },
    { method: 'POST', path: '/api/alerts/assets/upload', auth: 'local_or_auth', category: 'assets', description: 'Asset hochladen.' },
    { method: 'DELETE', path: '/api/alerts/assets/:id', auth: 'local_or_auth', category: 'assets', description: 'Asset löschen.' },
    { method: 'GET', path: '/api/alerts/assets/:id/usage', auth: 'local_or_auth', category: 'assets', description: 'Asset-Verwendung prüfen.' },
    { method: 'POST', path: '/api/alerts/assets/scan-durations', auth: 'local_or_auth', category: 'assets', description: 'Sound-Dauern neu scannen.' },

    { method: 'GET', path: '/api/alerts/settings', auth: 'local_or_auth', category: 'settings', description: 'Alert-Settings und Effective Config lesen.' },
    { method: 'POST', path: '/api/alerts/settings', auth: 'local_or_auth', category: 'settings', description: 'Alert-Settings speichern.' },
    { method: 'GET', path: '/api/alerts/config', auth: 'local_or_auth', category: 'config', description: 'Alert-Config lesen.' },
    { method: 'POST', path: '/api/alerts/config', auth: 'local_or_auth', category: 'config', description: 'Alert-Config speichern.' }
  ];

  return {
    ok: true,
    module: MODULE,
    version: 1,
    standardPrefix: '/api/alerts',
    legacyPrefixes: [],
    standardEndpoints: {
      status: '/api/alerts/status',
      config: '/api/alerts/config',
      settings: '/api/alerts/settings',
      routes: '/api/alerts/routes',
      integrationCheck: '/api/alerts/integration-check',
      reload: '/api/alerts/reload'
    },
    routes: routeList,
    count: routeList.length,
    categories: Array.from(new Set(routeList.map(route => route.category))).sort(),
    notes: [
      'Read-only Routenübersicht für Dashboard-/Modul-Standardisierung.',
      'Bestehende Routen wurden nicht geändert.',
      'Schreibende Routen sind nur dokumentiert, nicht neu angelegt.',
      'Security bleibt über bestehende local_or_auth Guards geregelt.'
    ],
    security: req ? security.securitySummary(req) : security.securitySummary()
  };
}

function ensureRuntime(ctx) {
  database.ensureReady(ctx);
}

function reloadConfig() {
  const loaded = configHelper.loadConfig('alert_system.json', DEFAULT_CONFIG, { createIfMissing: true, mergeDefaults: true, spaces: 2 });
  state.config = { ...DEFAULT_CONFIG, ...(loaded.config || {}) };
  const messages = configHelper.loadConfig('messages/alerts.json', DEFAULT_MESSAGES, { createIfMissing: true, mergeDefaults: true, spaces: 2 });
  state.messages = { ...DEFAULT_MESSAGES, ...(messages.config || {}) };
  return { config: loaded, messages };
}

function ensureDirs() {
  core.ensureDir(absRoot(state.config.soundsDir));
  core.ensureDir(absRoot(state.config.imagesDir));
  core.ensureDir(absRoot('htdocs/assets/images/alerts/icons'));
  core.ensureDir(absRoot('htdocs/assets/images/alerts/special'));
  core.ensureDir(absRoot('htdocs/assets/images/alerts/backgrounds'));
}

function ensureSchema() {
  database.ensureSchema(MODULE, SCHEMA_VERSION, (fromVersion, toVersion, db) => {
    if (toVersion === 1) {
      db.exec(`
      CREATE TABLE IF NOT EXISTS alert_types (
        id ${database.primaryKeyAutoIncrementSql()},
        source TEXT NOT NULL DEFAULT 'twitch',
        type_key TEXT NOT NULL,
        label TEXT NOT NULL,
        value_kind TEXT NOT NULL DEFAULT 'amount',
        enabled INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 100,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(source, type_key)
      );

      CREATE TABLE IF NOT EXISTS alert_assets (
        id ${database.primaryKeyAutoIncrementSql()},
        asset_type TEXT NOT NULL,
        label TEXT NOT NULL,
        file_path TEXT NOT NULL,
        public_url TEXT NOT NULL,
        mime_type TEXT NOT NULL DEFAULT '',
        size_bytes INTEGER NOT NULL DEFAULT 0,
        original_name TEXT NOT NULL DEFAULT '',
        enabled INTEGER NOT NULL DEFAULT 1,
        meta_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS alert_rules (
        id ${database.primaryKeyAutoIncrementSql()},
        source TEXT NOT NULL DEFAULT 'twitch',
        type_key TEXT NOT NULL,
        label TEXT NOT NULL,
        min_value REAL,
        max_value REAL,
        tier TEXT NOT NULL DEFAULT 'normal',
        priority INTEGER NOT NULL DEFAULT 100,
        duration_ms INTEGER NOT NULL DEFAULT 7000,
        animation TEXT NOT NULL DEFAULT 'neon_card',
        image_mode TEXT NOT NULL DEFAULT 'none',
        sound_asset_id INTEGER,
        image_asset_id INTEGER,
        sound_media_id INTEGER,
        image_media_id INTEGER,
        enabled INTEGER NOT NULL DEFAULT 1,
        meta_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(sound_asset_id) REFERENCES alert_assets(id) ON DELETE SET NULL,
        FOREIGN KEY(image_asset_id) REFERENCES alert_assets(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_alert_rules_lookup ON alert_rules(source, type_key, enabled, min_value, max_value, priority);

      CREATE TABLE IF NOT EXISTS alert_events (
        id ${database.primaryKeyAutoIncrementSql()},
        event_uid TEXT NOT NULL UNIQUE,
        source TEXT NOT NULL,
        type_key TEXT NOT NULL,
        user_login TEXT NOT NULL DEFAULT '',
        user_display TEXT NOT NULL DEFAULT '',
        amount REAL NOT NULL DEFAULT 0,
        message TEXT NOT NULL DEFAULT '',
        rule_id INTEGER,
        status TEXT NOT NULL DEFAULT 'queued',
        payload_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        started_at TEXT,
        finished_at TEXT,
        FOREIGN KEY(rule_id) REFERENCES alert_rules(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_alert_events_created ON alert_events(created_at DESC);

      CREATE TABLE IF NOT EXISTS alert_settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
      return;
    }

    if (toVersion === 2) {
      addColumnIfMissing(db, 'alert_assets', 'duration_ms', 'INTEGER NOT NULL DEFAULT 0');
      addColumnIfMissing(db, 'alert_assets', 'probe_json', "TEXT NOT NULL DEFAULT '{}'");
      addColumnIfMissing(db, 'alert_rules', 'duration_mode', "TEXT NOT NULL DEFAULT 'fixed'");
      addColumnIfMissing(db, 'alert_rules', 'tts_enabled', 'INTEGER NOT NULL DEFAULT 0');
      addColumnIfMissing(db, 'alert_rules', 'tts_timing', "TEXT NOT NULL DEFAULT 'after_alert'");
      addColumnIfMissing(db, 'alert_rules', 'tts_mode', "TEXT NOT NULL DEFAULT 'audio_only'");
      addColumnIfMissing(db, 'alert_rules', 'tts_template', "TEXT NOT NULL DEFAULT '{user} schreibt: {message}'");
      addColumnIfMissing(db, 'alert_rules', 'tts_max_chars', 'INTEGER NOT NULL DEFAULT 250');
      addColumnIfMissing(db, 'alert_rules', 'tts_min_amount', 'REAL');
      return;
    }


    if (toVersion === 3) {
      db.exec(`
      CREATE TABLE IF NOT EXISTS alert_text_variants (
        id ${database.primaryKeyAutoIncrementSql()},
        source TEXT NOT NULL DEFAULT 'twitch',
        type_key TEXT NOT NULL,
        rule_id INTEGER,
        label TEXT NOT NULL DEFAULT '',
        title_template TEXT NOT NULL DEFAULT '',
        headline_template TEXT NOT NULL DEFAULT '',
        value_template TEXT NOT NULL DEFAULT '',
        subline_template TEXT NOT NULL DEFAULT '',
        message_template TEXT NOT NULL DEFAULT '',
        message_mode TEXT NOT NULL DEFAULT 'auto',
        hide_subline_when_message_exists INTEGER NOT NULL DEFAULT 1,
        pick_weight INTEGER NOT NULL DEFAULT 100,
        enabled INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 100,
        meta_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(rule_id) REFERENCES alert_rules(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_alert_text_variants_lookup ON alert_text_variants(source, type_key, rule_id, enabled, sort_order);

      CREATE TABLE IF NOT EXISTS alert_test_presets (
        id ${database.primaryKeyAutoIncrementSql()},
        source TEXT NOT NULL DEFAULT 'twitch',
        type_key TEXT NOT NULL,
        rule_id INTEGER,
        label TEXT NOT NULL,
        payload_json TEXT NOT NULL DEFAULT '{}',
        enabled INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 100,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(rule_id) REFERENCES alert_rules(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_alert_test_presets_lookup ON alert_test_presets(source, type_key, enabled, sort_order);
    `);
      addColumnIfMissing(db, 'alert_events', 'final_title', "TEXT NOT NULL DEFAULT ''");
      addColumnIfMissing(db, 'alert_events', 'final_headline', "TEXT NOT NULL DEFAULT ''");
      addColumnIfMissing(db, 'alert_events', 'final_value', "TEXT NOT NULL DEFAULT ''");
      addColumnIfMissing(db, 'alert_events', 'final_subline', "TEXT NOT NULL DEFAULT ''");
      addColumnIfMissing(db, 'alert_events', 'final_message', "TEXT NOT NULL DEFAULT ''");
      addColumnIfMissing(db, 'alert_events', 'text_variant_id', 'INTEGER');
      addColumnIfMissing(db, 'alert_events', 'provider_logo_url', "TEXT NOT NULL DEFAULT ''");
      return;
    }

    if (toVersion === 4) {
      db.exec(`
      CREATE TABLE IF NOT EXISTS alert_display_profiles (
        id ${database.primaryKeyAutoIncrementSql()},
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        is_default INTEGER NOT NULL DEFAULT 0,
        enabled INTEGER NOT NULL DEFAULT 1,
        settings_json TEXT NOT NULL DEFAULT '{}',
        sort_order INTEGER NOT NULL DEFAULT 100,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_alert_display_profiles_default ON alert_display_profiles(enabled, is_default, sort_order);
    `);
      addColumnIfMissing(db, 'alert_rules', 'display_profile_id', 'INTEGER');
      addColumnIfMissing(db, 'alert_events', 'display_profile_id', 'INTEGER');
      addColumnIfMissing(db, 'alert_events', 'display_settings_json', "TEXT NOT NULL DEFAULT '{}'");
      return;
    }

    if (toVersion === 5) {
      createChatBlocksSchema(db);
      return;
    }

    if (toVersion === 6) {
      addColumnIfMissing(db, 'alert_rules', 'sound_media_id', 'INTEGER');
      addColumnIfMissing(db, 'alert_rules', 'image_media_id', 'INTEGER');
      return;
    }
  });
  ensureAlertRuleMediaColumns();
}

function ensureAlertRuleMediaColumns() {
  try {
    database.ensureColumn('alert_rules', 'sound_media_id', 'INTEGER');
    database.ensureColumn('alert_rules', 'image_media_id', 'INTEGER');
  } catch (err) {
    console.warn('[alert_system] STEP276B_FIX1 alert_rules media columns could not be ensured:', err && err.message ? err.message : String(err));
  }
}

function createChatBlocksSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS alert_chat_blocks (
      id ${database.primaryKeyAutoIncrementSql()},
      source TEXT NOT NULL DEFAULT 'twitch',
      type_key TEXT NOT NULL,
      label TEXT NOT NULL DEFAULT '',
      texts_json TEXT NOT NULL DEFAULT '[]',
      enabled INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 100,
      meta_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_alert_chat_blocks_lookup ON alert_chat_blocks(source, type_key, enabled, sort_order);
  `);
  addColumnIfMissing(db, 'alert_events', 'final_chat_message', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'alert_events', 'chat_message_status', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'alert_events', 'chat_message_error', "TEXT NOT NULL DEFAULT ''");
  db.exec(`
    CREATE TABLE IF NOT EXISTS alert_chat_outbox (
      id ${database.primaryKeyAutoIncrementSql()},
      event_uid TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT '',
      type_key TEXT NOT NULL DEFAULT '',
      rule_id INTEGER,
      chat_block_id INTEGER,
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      error TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      sent_at TEXT,
      consumed_at TEXT
    );
  `);
}

function addColumnIfMissing(db, tableName, columnName, definition) {
  const table = String(tableName || '').replace(/[^a-zA-Z0-9_]/g, '');
  const column = String(columnName || '').replace(/[^a-zA-Z0-9_]/g, '');
  if (!table || !column) return false;
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  if (rows.some(row => String(row.name || '').toLowerCase() === column.toLowerCase())) return false;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  return true;
}

function seedDefaults() {
  const now = nowIso();
  const types = [
    ['twitch', 'follow', 'Follow', 'count', 10],
    ['twitch', 'bits', 'Bits / Cheers', 'amount', 20],
    ['twitch', 'sub', 'Sub', 'count', 30],
    ['twitch', 'gifted_sub_received', 'Gifted Sub Received', 'count', 35],
    ['twitch', 'resub', 'Resub', 'count', 40],
    ['twitch', 'gift_sub', 'Gift Sub', 'amount', 50],
    ['twitch', 'gift_bomb', 'Gift Bomb', 'amount', 60],
    ['twitch', 'raid', 'Raid', 'amount', 70],
    ['kofi', 'donation', 'Ko-fi Donation', 'amount', 100],
    ['tipeee', 'donation', 'Tipeee Donation', 'amount', 110]
  ];
  for (const [source, typeKey, label, valueKind, sortOrder] of types) {
    database.run(`
      INSERT INTO alert_types (source, type_key, label, value_kind, enabled, sort_order, created_at, updated_at)
      VALUES (:source, :typeKey, :label, :valueKind, 1, :sortOrder, :now, :now)
      ON CONFLICT(source, type_key) DO UPDATE SET
        label = excluded.label,
        value_kind = excluded.value_kind,
        sort_order = excluded.sort_order,
        updated_at = excluded.updated_at
    `, { source, typeKey, label, valueKind, sortOrder, now });
  }

  const count = database.get(`SELECT COUNT(*) AS c FROM alert_rules`)?.c || 0;
  if (Number(count) === 0) {
    const defaults = [
      { source: 'twitch', type_key: 'follow', label: 'Follow Standard', min_value: 0, max_value: null, tier: 'normal', priority: 100, duration_ms: 6500, image_mode: 'avatar_icon' },
      { source: 'twitch', type_key: 'bits', label: 'Bits 1-100', min_value: 1, max_value: 100, tier: 'small', priority: 100, duration_ms: 6500, image_mode: 'icon' },
      { source: 'twitch', type_key: 'bits', label: 'Bits 101-500', min_value: 101, max_value: 500, tier: 'medium', priority: 90, duration_ms: 7500, image_mode: 'avatar_icon' },
      { source: 'twitch', type_key: 'bits', label: 'Bits 501+', min_value: 501, max_value: null, tier: 'big', priority: 70, duration_ms: 9500, image_mode: 'special' },
      { source: 'twitch', type_key: 'raid', label: 'Raid Standard', min_value: 1, max_value: null, tier: 'big', priority: 60, duration_ms: 10000, image_mode: 'avatar_special' },
      { source: 'twitch', type_key: 'sub', label: 'Sub Standard', min_value: 0, max_value: null, tier: 'medium', priority: 80, duration_ms: 8000, image_mode: 'avatar_icon' }
    ];
    defaults.forEach(rule => saveRule({ ...rule, enabled: 1 }, true));
  }
  seedAlertTextVariants();
  seedAlertChatBlocks();
  seedAlertTestPresets();
  seedDisplayProfiles();
}

function seedAlertChatBlocks() {
  const count = database.get(`SELECT COUNT(*) AS c FROM alert_chat_blocks`)?.c || 0;
  if (Number(count) > 0) return;
  const defaults = [
    { source:'twitch', type_key:'follow', label:'Follow Danke', sort_order:10, texts:[
      'Danke für den Follow, {userDisplayName}! Willkommen in der CGN-Community 💜',
      'Willkommen {userDisplayName}! Schön, dass du da bist 💜'
    ]},
    { source:'twitch', type_key:'bits', label:'Bits Danke', sort_order:20, texts:[
      '{userDisplayName} haut {amountFormatted} raus. Vielen Dank! 💜',
      'Danke {userDisplayName} für {amountFormatted}! 💜'
    ]},
    { source:'twitch', type_key:'raid', label:'Raid Willkommen', sort_order:30, texts:[
      '{userDisplayName} raidet mit {viewerCount} Leuten. Willkommen bei CGN! 💜',
      'Raid incoming von {userDisplayName}! Macht es euch gemütlich 💜'
    ]},
    { source:'kofi', type_key:'donation', label:'Ko-fi Danke', sort_order:40, texts:[
      '{userDisplayName} spendet {amountFormatted} über Ko-fi. Vielen lieben Dank! 💜',
      'Danke {userDisplayName} für die Ko-fi-Unterstützung über {amountFormatted}! 💜'
    ]},
    { source:'tipeee', type_key:'donation', label:'Tipeee Danke', sort_order:50, texts:[
      '{userDisplayName} spendet {amountFormatted} über Tipeee. Vielen lieben Dank! 💜',
      'Danke {userDisplayName} für die Tipeee-Unterstützung über {amountFormatted}! 💜'
    ]}
  ];
  defaults.forEach(block => saveChatBlock({ ...block, enabled:1 }));
}

function alertBusMirrorEffectiveConfig() {
  const cfg = state.config && state.config.communicationBusMirror ? state.config.communicationBusMirror : DEFAULT_CONFIG.communicationBusMirror;
  return {
    enabled: cfg.enabled === true,
    runtimeEnabled: state.alertBusMirror.runtimeEnabled === true,
    effectiveEnabled: cfg.enabled === true || state.alertBusMirror.runtimeEnabled === true,
    channel: cleanKey(cfg.channel || DEFAULT_CONFIG.communicationBusMirror.channel) || DEFAULT_CONFIG.communicationBusMirror.channel,
    action: cleanKey(cfg.action || DEFAULT_CONFIG.communicationBusMirror.action) || DEFAULT_CONFIG.communicationBusMirror.action,
    requireAck: cfg.requireAck !== false,
    replayable: cfg.replayable !== false,
    ttlMs: clamp(toInt(cfg.ttlMs, DEFAULT_CONFIG.communicationBusMirror.ttlMs), 1000, 300000),
    target: {
      type: cleanKey(cfg.targetType || DEFAULT_CONFIG.communicationBusMirror.targetType) || DEFAULT_CONFIG.communicationBusMirror.targetType,
      id: cleanText(cfg.targetId || DEFAULT_CONFIG.communicationBusMirror.targetId) || DEFAULT_CONFIG.communicationBusMirror.targetId,
      module: cleanKey(cfg.targetModule || DEFAULT_CONFIG.communicationBusMirror.targetModule),
      capability: cleanText(cfg.targetCapability || DEFAULT_CONFIG.communicationBusMirror.targetCapability)
    }
  };
}

function buildAlertBusMirrorStatus() {
  const cfg = alertBusMirrorEffectiveConfig();
  return {
    ok: true,
    module: MODULE,
    feature: 'alert_communication_bus_mirror',
    enabled: cfg.effectiveEnabled,
    configEnabled: cfg.enabled,
    runtimeEnabled: cfg.runtimeEnabled,
    channel: cfg.channel,
    action: cfg.action,
    requireAck: cfg.requireAck,
    replayable: cfg.replayable,
    ttlMs: cfg.ttlMs,
    target: cfg.target,
    communicationBusAvailable: !!(communicationBus && typeof communicationBus.getBus === 'function'),
    stats: {
      emitted: state.alertBusMirror.emitted,
      skipped: state.alertBusMirror.skipped,
      errors: state.alertBusMirror.errors,
      lastEventUid: state.alertBusMirror.lastEventUid,
      lastBusEventId: state.alertBusMirror.lastBusEventId,
      lastResult: state.alertBusMirror.lastResult,
      lastError: state.alertBusMirror.lastError,
      changedAt: state.alertBusMirror.changedAt,
      changedReason: state.alertBusMirror.changedReason
    },
    timing: state.alertBusMirror.lastTiming || null
  };
}

function setAlertBusMirrorRuntimeEnabled(enabled, reason = '') {
  if (reason === 'confirm_required') {
    return {
      ok: false,
      error: 'confirm_required',
      hint: enabled ? '/api/alerts/bus-mirror/enable?confirm=1' : '/api/alerts/bus-mirror/disable?confirm=1',
      status: buildAlertBusMirrorStatus()
    };
  }
  state.alertBusMirror.runtimeEnabled = enabled === true;
  state.alertBusMirror.changedAt = nowIso();
  state.alertBusMirror.changedReason = reason || (enabled ? 'enabled' : 'disabled');
  return {
    ok: true,
    changed: true,
    enabled: alertBusMirrorEffectiveConfig().effectiveEnabled,
    runtimeEnabled: state.alertBusMirror.runtimeEnabled,
    status: buildAlertBusMirrorStatus()
  };
}


function alertTimingNow() {
  const ms = Date.now();
  return { ms, iso: new Date(ms).toISOString() };
}

function ensureAlertTiming(event) {
  if (!event || typeof event !== 'object') return null;
  if (!event.alertTiming || typeof event.alertTiming !== 'object') {
    event.alertTiming = {
      eventUid: event.eventUid || '',
      source: event.source || '',
      type_key: event.type_key || '',
      createdAt: event.created_at || '',
      timestamps: {},
      ms: {}
    };
  }
  if (event.created_at && !event.alertTiming.timestamps.queuedAt) {
    event.alertTiming.timestamps.queuedAt = event.created_at;
    const queuedMs = Date.parse(event.created_at);
    if (Number.isFinite(queuedMs)) event.alertTiming.ms.queuedAt = queuedMs;
  }
  return event.alertTiming;
}

function markAlertTiming(event, key) {
  const timing = ensureAlertTiming(event);
  if (!timing || !key) return null;
  const stamp = alertTimingNow();
  const field = `${key}At`;
  timing.timestamps[field] = stamp.iso;
  timing.ms[field] = stamp.ms;
  state.alertBusMirror.lastTiming = buildPublicAlertTiming(event);
  return timing;
}

function elapsedMs(start, end) {
  const a = Number(start || 0);
  const b = Number(end || 0);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) return null;
  return Math.max(0, b - a);
}

function buildPublicAlertTiming(event) {
  const timing = ensureAlertTiming(event);
  if (!timing) return null;
  const ts = timing.timestamps || {};
  const ms = timing.ms || {};
  return {
    eventUid: event.eventUid || timing.eventUid || '',
    source: event.source || timing.source || '',
    type_key: event.type_key || timing.type_key || '',
    queuedAt: ts.queuedAt || event.created_at || '',
    queuePickedAt: ts.queuePickedAt || '',
    waitingForSoundAt: ts.waitingForSoundAt || '',
    soundBundleReadyAt: ts.soundBundleReadyAt || '',
    soundWaitDoneAt: ts.soundWaitDoneAt || '',
    playingAt: ts.playingAt || event.started_at || '',
    overlaySentAt: ts.overlaySentAt || '',
    busMirrorSentAt: ts.busMirrorSentAt || '',
    queueToSoundWaitMs: elapsedMs(ms.queuedAt, ms.waitingForSoundAt),
    soundPrepareDurationMs: elapsedMs(ms.waitingForSoundAt, ms.soundBundleReadyAt),
    soundWaitDurationMs: elapsedMs(ms.waitingForSoundAt, ms.soundWaitDoneAt),
    soundWaitDoneToPlayingMs: elapsedMs(ms.soundWaitDoneAt, ms.playingAt),
    playingToOverlayMs: elapsedMs(ms.playingAt, ms.overlaySentAt),
    overlayToBusMirrorMs: elapsedMs(ms.overlaySentAt, ms.busMirrorSentAt),
    playingToBusMirrorMs: elapsedMs(ms.playingAt, ms.busMirrorSentAt)
  };
}

function buildAlertBusMirrorPayload(event, overlayAlert) {
  const alert = overlayAlert || buildOverlayAlert(event);
  return {
    test: false,
    mirror: true,
    productionTarget: false,
    timing: buildPublicAlertTiming(event),
    alert: {
      ...alert,
      source: 'alert_system',
      provider: alert.provider || event.source || '',
      type: alert.type || event.type_key || '',
      eventUid: event.eventUid,
      alertEventUid: event.eventUid,
      user: alert.user || event.user_display || event.user_login || '',
      userDisplayName: alert.userDisplayName || event.user_display || '',
      userLogin: alert.userLogin || event.user_login || '',
      avatarUrl: alert.avatarUrl || event.avatar_url || '',
      durationMs: Math.max(1000, toInt(alert.durationMs, state.config.defaultDurationMs || 7000))
    }
  };
}

function emitAlertBusMirror(event, overlayAlert) {
  const cfg = alertBusMirrorEffectiveConfig();
  if (!cfg.effectiveEnabled) {
    state.alertBusMirror.skipped += 1;
    return { ok: false, skipped: true, reason: 'disabled' };
  }
  if (!communicationBus || typeof communicationBus.getBus !== 'function') {
    state.alertBusMirror.errors += 1;
    state.alertBusMirror.lastError = 'communication_bus_getBus_unavailable';
    return { ok: false, error: 'communication_bus_getBus_unavailable' };
  }
  try {
    const alertDurationMs = Math.max(1000, toInt(overlayAlert && overlayAlert.durationMs, state.config.defaultDurationMs || 7000));
    const ttlMs = Math.max(alertDurationMs + 5000, cfg.ttlMs);
    const currentBus = communicationBus.getBus();
    const result = currentBus.emit({
      type: 'event',
      channel: cfg.channel,
      action: cfg.action,
      source: {
        type: 'module',
        id: 'alert_system',
        module: 'alert_system'
      },
      target: cfg.target,
      payload: buildAlertBusMirrorPayload(event, overlayAlert),
      meta: {
        requireAck: cfg.requireAck,
        replayable: cfg.replayable,
        ttlMs,
        mirror: true,
        preview: false,
        productionTarget: false,
        alertEventUid: event.eventUid,
        alertSource: event.source,
        alertType: event.type_key
      }
    });
    markAlertTiming(event, 'busMirrorSent');
    state.alertBusMirror.emitted += result && result.ok ? 1 : 0;
    state.alertBusMirror.errors += result && result.ok ? 0 : 1;
    state.alertBusMirror.lastEventUid = event.eventUid || '';
    state.alertBusMirror.lastBusEventId = result && result.eventId ? result.eventId : '';
    state.alertBusMirror.lastResult = result ? {
      ok: result.ok === true,
      eventId: result.eventId || '',
      deliveredCount: Number(result.deliveredCount || 0),
      deliveredTo: Array.isArray(result.deliveredTo) ? result.deliveredTo : []
    } : null;
    state.alertBusMirror.lastError = result && result.ok ? '' : 'bus_emit_failed';
    event.communicationBusMirror = state.alertBusMirror.lastResult;
    persistEventRuntimePayload(event);
    return result;
  } catch (err) {
    state.alertBusMirror.errors += 1;
    state.alertBusMirror.lastError = err && err.message ? err.message : String(err);
    console.warn('[alert_system] communication bus mirror failed:', state.alertBusMirror.lastError);
    return { ok: false, error: state.alertBusMirror.lastError };
  }
}

function buildStatus(req = null) {
  const counts = getAlertCounts();
  const ffprobe = buildFfprobeStatus();
  return {
    ok: true,
    module: MODULE,
    version: 3,
    step: MODULE_STEP,
    enabled: state.config.enabled !== false,
    overlayEnabled: state.config.overlayEnabled !== false,
    queueEnabled: state.config.queueEnabled !== false,
    uploadEnabled: state.config.uploadEnabled !== false,
    queueLength: state.queue.length,
    current: state.current,
    currentEventId: state.current ? state.current.eventUid : null,
    history: state.history.slice(0, 50),
    overlayClients: state.overlayClients.size,
    multerReady: !!multer,
    multerLoadError,
    ffprobe,
    counts,
    databasePath: database.getDbPath(),
    schemaVersion: database.getSchemaVersion(MODULE),
    security: req ? security.securitySummary(req) : security.securitySummary(),
    config: publicConfig()
  };
}

function buildHealth(req = null) {
  const status = buildStatus(req);
  const warnings = [];
  if (!status.multerReady) warnings.push({ key: 'multer_missing', message: 'Uploads sind nicht verfÃ¼gbar, weil multer nicht geladen werden konnte.', detail: status.multerLoadError || '' });
  if (!status.ffprobe.available) warnings.push({ key: 'ffprobe_missing', message: 'SoundlÃ¤ngen kÃ¶nnen nicht automatisch gelesen werden.', detail: status.ffprobe.error || '' });
  if (!status.overlayClients) warnings.push({ key: 'overlay_not_connected', message: 'Aktuell ist kein Alert-Overlay per WebSocket verbunden.' });
  if (status.counts.soundAssets > 0 && status.counts.soundAssetsWithoutDuration > 0) warnings.push({ key: 'sound_durations_missing', message: `${status.counts.soundAssetsWithoutDuration} Sound-Asset(s) haben noch keine bekannte LÃ¤nge.` });
  return { ok: true, module: MODULE, step: MODULE_STEP, healthy: warnings.length === 0, warnings, status };
}

function getAlertCounts() {
  const row = database.get(`
    SELECT
      (SELECT COUNT(*) FROM alert_types) AS types,
      (SELECT COUNT(*) FROM alert_rules) AS rules,
      (SELECT COUNT(*) FROM alert_rules WHERE enabled = 1) AS enabledRules,
      (SELECT COUNT(*) FROM alert_assets) AS assets,
      (SELECT COUNT(*) FROM alert_assets WHERE asset_type = 'sound') AS soundAssets,
      (SELECT COUNT(*) FROM alert_assets WHERE asset_type = 'image') AS imageAssets,
      (SELECT COUNT(*) FROM alert_assets WHERE asset_type = 'sound' AND COALESCE(duration_ms, 0) > 0) AS soundAssetsWithDuration,
      (SELECT COUNT(*) FROM alert_assets WHERE asset_type = 'sound' AND COALESCE(duration_ms, 0) <= 0) AS soundAssetsWithoutDuration,
      (SELECT COUNT(*) FROM alert_events) AS events,
      (SELECT COUNT(*) FROM alert_events WHERE created_at >= datetime('now', '-1 day')) AS eventsLast24h,
      (SELECT COUNT(*) FROM alert_text_variants) AS textVariants,
      (SELECT COUNT(*) FROM alert_test_presets) AS testPresets,
      (SELECT COUNT(*) FROM alert_display_profiles) AS displayProfiles,
      (SELECT COUNT(*) FROM alert_chat_blocks) AS chatBlocks
  `) || {};
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, Number(v || 0)]));
}

function buildFfprobeStatus() {
  const ffprobe = media.findFfprobe({ timeoutMs: state.config.ffprobeTimeoutMs });
  const looksLikePath = ffprobe && ffprobe !== 'ffprobe';
  return {
    available: ffprobe === 'ffprobe' || (looksLikePath && fs.existsSync(ffprobe)),
    path: ffprobe,
    cache: media.durationCacheInfo()
  };
}

function publicConfig() {
  return deepCloneConfig(state.config);
}

function deepCloneConfig(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function mergePlainConfig(base, extra) {
  const out = Array.isArray(base) ? base.slice() : { ...(base || {}) };
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) return out;
  for (const [key, value] of Object.entries(extra)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && out[key] && typeof out[key] === 'object' && !Array.isArray(out[key])) {
      out[key] = mergePlainConfig(out[key], value);
    } else if (Array.isArray(value)) {
      out[key] = value.slice();
    } else {
      out[key] = value;
    }
  }
  return out;
}

function canonicalConfigSectionKey(key) {
  const raw = String(key || '').trim();
  const lower = raw.toLowerCase();
  const map = {
    preview: 'preview',
    livealert: 'liveAlert',
    dashboardsettings: 'dashboardSettings'
  };
  return map[lower] || raw;
}

function setConfigPath(target, dottedPath, value) {
  const parts = String(dottedPath || '').split('.').map(part => part.trim()).filter(Boolean);
  if (!parts.length) return;
  parts[0] = canonicalConfigSectionKey(parts[0]);
  let current = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!current[key] || typeof current[key] !== 'object' || Array.isArray(current[key])) current[key] = {};
    current = current[key];
  }
  current[parts[parts.length - 1]] = value;
}

function sanitizeRuntimeConfig(input) {
  const cfg = mergePlainConfig(DEFAULT_CONFIG, input || {});
  cfg.preview = mergePlainConfig(DEFAULT_CONFIG.preview, cfg.preview || {});
  cfg.liveAlert = mergePlainConfig(DEFAULT_CONFIG.liveAlert, cfg.liveAlert || {});
  cfg.communicationBusMirror = mergePlainConfig(DEFAULT_CONFIG.communicationBusMirror, cfg.communicationBusMirror || {});
  cfg.dashboardSettings = mergePlainConfig(DEFAULT_CONFIG.dashboardSettings, cfg.dashboardSettings || {});

  cfg.preview.localBrowserAudio = boolValue(cfg.preview.localBrowserAudio, DEFAULT_CONFIG.preview.localBrowserAudio);
  cfg.preview.sendToLiveOverlay = boolValue(cfg.preview.sendToLiveOverlay, DEFAULT_CONFIG.preview.sendToLiveOverlay);
  cfg.preview.sendToSoundSystem = boolValue(cfg.preview.sendToSoundSystem, DEFAULT_CONFIG.preview.sendToSoundSystem);

  cfg.liveAlert.soundSystemEnabled = boolValue(cfg.liveAlert.soundSystemEnabled, DEFAULT_CONFIG.liveAlert.soundSystemEnabled);
  cfg.liveAlert.soundSystemPlayUrl = cleanText(cfg.liveAlert.soundSystemPlayUrl || DEFAULT_CONFIG.liveAlert.soundSystemPlayUrl);
  cfg.liveAlert.soundSystemOutputTarget = validateSoundOutputTarget(cfg.liveAlert.soundSystemOutputTarget, DEFAULT_CONFIG.liveAlert.soundSystemOutputTarget);
  cfg.liveAlert.soundSystemCategory = cleanKey(cfg.liveAlert.soundSystemCategory || DEFAULT_CONFIG.liveAlert.soundSystemCategory) || DEFAULT_CONFIG.liveAlert.soundSystemCategory;
  cfg.liveAlert.soundSystemSource = cleanKey(cfg.liveAlert.soundSystemSource || DEFAULT_CONFIG.liveAlert.soundSystemSource) || DEFAULT_CONFIG.liveAlert.soundSystemSource;
  cfg.liveAlert.waitForSoundItemStarted = boolValue(cfg.liveAlert.waitForSoundItemStarted, DEFAULT_CONFIG.liveAlert.waitForSoundItemStarted);
  cfg.liveAlert.fallbackShowOnSoundError = boolValue(cfg.liveAlert.fallbackShowOnSoundError, DEFAULT_CONFIG.liveAlert.fallbackShowOnSoundError);
  cfg.liveAlert.fallbackShowAfterMs = clamp(toInt(cfg.liveAlert.fallbackShowAfterMs, DEFAULT_CONFIG.liveAlert.fallbackShowAfterMs), 1000, 120000);
  cfg.liveAlert.ttsPrepareUrl = cleanText(cfg.liveAlert.ttsPrepareUrl || DEFAULT_CONFIG.liveAlert.ttsPrepareUrl);
  cfg.liveAlert.ttsSoundCategory = cleanKey(cfg.liveAlert.ttsSoundCategory || DEFAULT_CONFIG.liveAlert.ttsSoundCategory) || DEFAULT_CONFIG.liveAlert.ttsSoundCategory;
  cfg.liveAlert.ttsSoundSource = cleanKey(cfg.liveAlert.ttsSoundSource || DEFAULT_CONFIG.liveAlert.ttsSoundSource) || DEFAULT_CONFIG.liveAlert.ttsSoundSource;
  cfg.liveAlert.ttsSoundPriority = clamp(toInt(cfg.liveAlert.ttsSoundPriority, DEFAULT_CONFIG.liveAlert.ttsSoundPriority), 0, 1000);
  cfg.liveAlert.ttsSoundVolume = clamp(toInt(cfg.liveAlert.ttsSoundVolume, DEFAULT_CONFIG.liveAlert.ttsSoundVolume), 0, 100);
  cfg.liveAlert.ttsOutputTarget = validateSoundOutputTarget(cfg.liveAlert.ttsOutputTarget || cfg.liveAlert.soundSystemOutputTarget || DEFAULT_CONFIG.liveAlert.ttsOutputTarget, DEFAULT_CONFIG.liveAlert.ttsOutputTarget);
  cfg.liveAlert.ttsAfterSoundDelayMs = clamp(toInt(cfg.liveAlert.ttsAfterSoundDelayMs, DEFAULT_CONFIG.liveAlert.ttsAfterSoundDelayMs), 0, 120000);
  cfg.liveAlert.ttsPrepareTimeoutMs = clamp(toInt(cfg.liveAlert.ttsPrepareTimeoutMs, DEFAULT_CONFIG.liveAlert.ttsPrepareTimeoutMs), 1000, 120000);
  cfg.liveAlert.ttsPlaybackTimeoutMs = clamp(toInt(cfg.liveAlert.ttsPlaybackTimeoutMs, DEFAULT_CONFIG.liveAlert.ttsPlaybackTimeoutMs), 1000, 120000);

  cfg.communicationBusMirror.enabled = boolValue(cfg.communicationBusMirror.enabled, DEFAULT_CONFIG.communicationBusMirror.enabled);
  cfg.communicationBusMirror.channel = cleanKey(cfg.communicationBusMirror.channel || DEFAULT_CONFIG.communicationBusMirror.channel) || DEFAULT_CONFIG.communicationBusMirror.channel;
  cfg.communicationBusMirror.action = cleanKey(cfg.communicationBusMirror.action || DEFAULT_CONFIG.communicationBusMirror.action) || DEFAULT_CONFIG.communicationBusMirror.action;
  cfg.communicationBusMirror.requireAck = boolValue(cfg.communicationBusMirror.requireAck, DEFAULT_CONFIG.communicationBusMirror.requireAck);
  cfg.communicationBusMirror.replayable = boolValue(cfg.communicationBusMirror.replayable, DEFAULT_CONFIG.communicationBusMirror.replayable);
  cfg.communicationBusMirror.ttlMs = clamp(toInt(cfg.communicationBusMirror.ttlMs, DEFAULT_CONFIG.communicationBusMirror.ttlMs), 1000, 300000);
  cfg.communicationBusMirror.targetType = cleanKey(cfg.communicationBusMirror.targetType || DEFAULT_CONFIG.communicationBusMirror.targetType) || DEFAULT_CONFIG.communicationBusMirror.targetType;
  cfg.communicationBusMirror.targetId = cleanText(cfg.communicationBusMirror.targetId || DEFAULT_CONFIG.communicationBusMirror.targetId) || DEFAULT_CONFIG.communicationBusMirror.targetId;
  cfg.communicationBusMirror.targetModule = cleanKey(cfg.communicationBusMirror.targetModule || DEFAULT_CONFIG.communicationBusMirror.targetModule);
  cfg.communicationBusMirror.targetCapability = cleanText(cfg.communicationBusMirror.targetCapability || DEFAULT_CONFIG.communicationBusMirror.targetCapability);

  cfg.dashboardSettings.preferSqliteSettings = boolValue(cfg.dashboardSettings.preferSqliteSettings, DEFAULT_CONFIG.dashboardSettings.preferSqliteSettings);
  cfg.dashboardSettings.allowRuntimeEdit = boolValue(cfg.dashboardSettings.allowRuntimeEdit, DEFAULT_CONFIG.dashboardSettings.allowRuntimeEdit);
  cfg.dashboardSettings.settingsTable = cleanKey(cfg.dashboardSettings.settingsTable || DEFAULT_CONFIG.dashboardSettings.settingsTable) || DEFAULT_CONFIG.dashboardSettings.settingsTable;

  return cfg;
}

function applyRuntimeSettingsFromDb() {
  if (!state.config || !state.config.dashboardSettings || state.config.dashboardSettings.preferSqliteSettings === false) {
    state.config = sanitizeRuntimeConfig(state.config);
    return { ok: true, applied: false, reason: 'db_settings_disabled', config: publicConfig() };
  }

  let settings = {};
  try {
    settings = getSettings();
  } catch (err) {
    state.config = sanitizeRuntimeConfig(state.config);
    return { ok: false, applied: false, error: err && err.message ? err.message : String(err), config: publicConfig() };
  }

  const next = sanitizeRuntimeConfig(state.config);
  const applied = [];
  const topLevelRuntimeKeys = new Set([
    'enabled',
    'overlayEnabled',
    'dashboardEnabled',
    'queueEnabled',
    'uploadEnabled',
    'allowLanUploads',
    'autoDurationOnUpload',
    'avatarResolveEnabled',
    'chatMessageEnabled'
  ]);

  for (const [rawKey, value] of Object.entries(settings || {})) {
    const key = String(rawKey || '').trim();
    if (!key || key.startsWith('provider_')) continue;

    if (key.includes('.')) {
      setConfigPath(next, key, value);
      applied.push(key);
      continue;
    }

    if (topLevelRuntimeKeys.has(key)) {
      next[key] = boolValue(value, next[key]);
      applied.push(key);
      continue;
    }

    const section = canonicalConfigSectionKey(key);
    if (['preview', 'liveAlert', 'dashboardSettings'].includes(section) && value && typeof value === 'object' && !Array.isArray(value)) {
      next[section] = mergePlainConfig(next[section] || {}, value);
      applied.push(key);
    }
  }

  state.config = sanitizeRuntimeConfig(next);
  return { ok: true, applied: true, appliedKeys: applied, config: publicConfig() };
}

function validateSoundOutputTarget(value, fallback = 'device') {
  const raw = cleanKey(value || fallback);
  return ['overlay', 'device', 'both'].includes(raw) ? raw : fallback;
}

function boolValue(value, fallback = false) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  const raw = String(value ?? '').trim().toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on'].includes(raw)) return true;
  if (['0', 'false', 'no', 'nein', 'off'].includes(raw)) return false;
  return !!fallback;
}


function saveAlertConfig(input = {}) {
  const boolKeys = ['enabled','overlayEnabled','dashboardEnabled','queueEnabled','uploadEnabled','allowLanUploads','autoDurationOnUpload','avatarResolveEnabled','chatMessageEnabled'];
  const numberKeys = ['maxSoundSizeBytes','maxImageSizeBytes','fallbackFinishMs','gapBetweenAlertsMs','defaultDurationMs','defaultIntroMs','defaultOutroMs','soundDurationPaddingMs','minAutoDurationMs','maxAutoDurationMs','ffprobeTimeoutMs','avatarResolveTimeoutMs','avatarResolveCacheMs','chatMessageTimeoutMs','chatMessageOutboxLimit'];
  const stringKeys = ['soundsDir','imagesDir','wsOp','avatarResolveUserinfoUrl','chatMessagePostUrl','chatMessagePostMethod'];
  const next = { ...state.config };
  for (const key of boolKeys) {
    if (Object.prototype.hasOwnProperty.call(input, key)) next[key] = input[key] === true || String(input[key]) === 'true' || input[key] === 1 || String(input[key]) === '1';
  }
  for (const key of numberKeys) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      const value = Number(input[key]);
      if (Number.isFinite(value) && value >= 0) next[key] = value;
    }
  }
  for (const key of stringKeys) {
    if (Object.prototype.hasOwnProperty.call(input, key)) next[key] = cleanText(input[key]);
  }
  state.config = sanitizeRuntimeConfig(next);
  const configPath = configHelper.resolveConfigFile('alert_system.json');
  configHelper.writeJsonFile(configPath, state.config, { spaces: 2 });
  ensureDirs();
  return { ok: true, config: publicConfig(), configPath };
}


function checkAlertIntegration() {
  const warnings = [];
  const profiles = listDisplayProfiles();
  const defaultProfile = profiles.find(p => Number(p.is_default) === 1 && Number(p.enabled) === 1) || profiles.find(p => Number(p.enabled) === 1);
  if (!defaultProfile) warnings.push({ level:'error', area:'display_profiles', message:'Kein aktives Standard-Design-Profil vorhanden.' });

  const runtimeSettings = getSettings();
  const runtimeLiveAlert = runtimeSettings.livealert || runtimeSettings.liveAlert || {};
  if (runtimeLiveAlert && Object.prototype.hasOwnProperty.call(runtimeLiveAlert, 'soundSystemEnabled')) {
    const wanted = boolValue(runtimeLiveAlert.soundSystemEnabled, false);
    const active = !!(state.config.liveAlert && state.config.liveAlert.soundSystemEnabled === true);
    if (wanted !== active) {
      warnings.push({ level:'warning', area:'settings', message:'Alert-DB-Setting livealert.soundSystemEnabled weicht von aktiver Runtime-Config liveAlert.soundSystemEnabled ab.' });
    }
  }

  if (state.config.liveAlert && state.config.liveAlert.soundSystemEnabled === true) {
    if (!cleanText(state.config.liveAlert.soundSystemPlayUrl || '')) warnings.push({ level:'error', area:'live_alert_sound', message:'Sound-System ist fuer Live-Alerts aktiv, aber soundSystemPlayUrl ist leer.' });
    const rulesWithSound = listRules().filter(r => Number(r.enabled) === 1 && cleanText(r.sound_url || ''));
    if (!rulesWithSound.length) warnings.push({ level:'warning', area:'live_alert_sound', message:'Sound-System ist aktiv, aber keine aktive Alert-Regel hat ein Sound-Asset.' });
  }

  const rules = listRules();
  const variants = listTextVariants({});
  const presets = listTestPresets({});
  const chatBlocks = listChatBlocks({});
  const profileIds = new Set(profiles.map(p => Number(p.id)));

  for (const r of rules) {
    if (r.display_profile_id !== null && r.display_profile_id !== undefined && r.display_profile_id !== '' && !profileIds.has(Number(r.display_profile_id))) {
      warnings.push({ level:'warning', area:'rules', ruleId:r.id, message:`Regel "${r.label}" verweist auf ein fehlendes Design-Profil (${r.display_profile_id}).` });
    }
    const hasVariant = variants.some(v => Number(v.enabled) === 1 && v.source === r.source && v.type_key === r.type_key && (v.rule_id === null || v.rule_id === undefined || Number(v.rule_id) === Number(r.id)));
    if (Number(r.enabled) === 1 && !hasVariant) {
      warnings.push({ level:'warning', area:'texts', ruleId:r.id, message:`Für ${r.source}/${r.type_key} ist keine aktive Textvariante gefunden.` });
    }
  }

  for (const p of presets) {
    const matchingRules = rules.filter(r => Number(r.enabled) === 1 && r.source === p.source && r.type_key === p.type_key);
    if (!matchingRules.length) warnings.push({ level:'info', area:'presets', presetId:p.id, message:`Testpreset "${p.label}" hat keine aktive Regel für ${p.source}/${p.type_key}.` });
  }

  return {
    ok: true,
    healthy: !warnings.some(w => w.level === 'error'),
    warnings,
    counts: {
      rules: rules.length,
      displayProfiles: profiles.length,
      textVariants: variants.length,
      testPresets: presets.length,
      chatBlocks: chatBlocks.length,
      rulesWithDesignProfile: rules.filter(r => r.display_profile_id !== null && r.display_profile_id !== undefined && r.display_profile_id !== '').length,
      rulesUsingDefaultProfile: rules.filter(r => r.display_profile_id === null || r.display_profile_id === undefined || r.display_profile_id === '').length
    },
    defaultDisplayProfile: defaultProfile ? { id: defaultProfile.id, name: defaultProfile.name } : null
  };
}

function listTypes() {
  return database.all(`SELECT * FROM alert_types ORDER BY sort_order ASC, label ASC`);
}

function listAssets() {
  return database.all(`SELECT * FROM alert_assets ORDER BY created_at DESC, id DESC`).map(row => ({ ...row, meta: parseJson(row.meta_json, {}) }));
}

function listChatBlocks(filter = {}) {
  const where = [];
  const params = {};
  const source = cleanKey(filter.source || '');
  const typeKey = cleanKey(filter.type_key || filter.type || '');
  if (source && source !== 'all') { where.push('source = :source'); params.source = source; }
  if (typeKey && typeKey !== 'all') { where.push('type_key = :typeKey'); params.typeKey = typeKey; }
  const sql = `SELECT * FROM alert_chat_blocks ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY source ASC, type_key ASC, sort_order ASC, id ASC`;
  return database.all(sql, params).map(row => ({ ...row, texts: parseChatTexts(row.texts_json), meta: parseJson(row.meta_json, {}) }));
}

function getChatBlockById(idRaw) {
  const id = toInt(idRaw, 0);
  if (!id) return null;
  const row = database.get(`SELECT * FROM alert_chat_blocks WHERE id=:id`, { id });
  return row ? { ...row, texts: parseChatTexts(row.texts_json), meta: parseJson(row.meta_json, {}) } : null;
}

function saveChatBlock(input = {}) {
  const now = nowIso();
  const id = toInt(input.id, 0);
  const texts = parseChatTexts(input.texts_json ?? input.textsJson ?? input.texts ?? input.lines ?? []);
  const row = {
    source: cleanKey(input.source || 'twitch'),
    typeKey: cleanKey(input.type_key || input.typeKey || input.type || 'bits'),
    label: cleanText(input.label || 'Chat-Textblock').slice(0, 140),
    textsJson: JSON.stringify(texts),
    enabled: boolInt(input.enabled, true),
    sortOrder: toInt(input.sort_order ?? input.sortOrder, 100),
    metaJson: JSON.stringify(input.meta || parseJson(input.meta_json, {})),
    now
  };
  if (!row.label) row.label = 'Chat-Textblock';
  if (id > 0) {
    database.run(`UPDATE alert_chat_blocks SET source=:source, type_key=:typeKey, label=:label, texts_json=:textsJson, enabled=:enabled, sort_order=:sortOrder, meta_json=:metaJson, updated_at=:now WHERE id=:id`, { ...row, id });
    return { ok:true, id, block:getChatBlockById(id) };
  }
  const result = database.run(`INSERT INTO alert_chat_blocks (source, type_key, label, texts_json, enabled, sort_order, meta_json, created_at, updated_at) VALUES (:source, :typeKey, :label, :textsJson, :enabled, :sortOrder, :metaJson, :now, :now)`, row);
  const newId = Number(result.lastInsertRowid || 0);
  return { ok:true, id:newId, block:getChatBlockById(newId) };
}

function deleteChatBlock(idRaw) {
  const id = toInt(idRaw, 0);
  if (id <= 0) return { ok:false, error:'invalid_id' };
  database.run(`DELETE FROM alert_chat_blocks WHERE id=:id`, { id });
  return { ok:true, id };
}

function parseChatTexts(value) {
  let arr = value;
  if (typeof value === 'string') {
    try { arr = JSON.parse(value); }
    catch (_) { arr = value.split(/\r?\n/); }
  }
  if (!Array.isArray(arr)) arr = [];
  return arr.map(v => cleanTemplate(v)).filter(Boolean).slice(0, 50);
}

function listRules() {
  return database.all(`
    SELECT
      r.*,
      s.label AS sound_label,
      s.public_url AS sound_url,
      s.duration_ms AS sound_duration_ms,
      i.label AS image_label,
      i.public_url AS image_url,
      sm.display_name AS sound_media_label,
      sm.duration_ms AS sound_media_duration_ms,
      sm.relative_path AS sound_media_path,
      sm.web_path AS sound_media_url,
      sm.type AS sound_media_type,
      im.display_name AS image_media_label,
      im.relative_path AS image_media_path,
      im.web_path AS image_media_url,
      im.type AS image_media_type,
      dp.name AS display_profile_name
    FROM alert_rules r
    LEFT JOIN alert_assets s ON s.id = r.sound_asset_id
    LEFT JOIN alert_assets i ON i.id = r.image_asset_id
    LEFT JOIN media_assets sm ON sm.id = r.sound_media_id AND sm.status = 'active'
    LEFT JOIN media_assets im ON im.id = r.image_media_id AND im.status = 'active'
    LEFT JOIN alert_display_profiles dp ON dp.id = r.display_profile_id
    ORDER BY r.source ASC, r.type_key ASC, COALESCE(r.min_value, -999999) ASC, r.priority ASC, r.id ASC
  `).map(row => ({ ...row, meta: parseJson(row.meta_json, {}) }));
}

function saveRule(input, silent = false) {
  const now = nowIso();
  const id = toInt(input.id, 0);
  const rule = {
    source: cleanKey(input.source || 'twitch'),
    typeKey: cleanKey(input.type_key || input.typeKey || input.type || 'follow'),
    label: cleanText(input.label || 'Alert Regel'),
    minValue: nullableNumber(input.min_value ?? input.minValue),
    maxValue: nullableNumber(input.max_value ?? input.maxValue),
    tier: 'normal',
    priority: toInt(input.priority, 100),
    durationMs: clamp(toInt(input.duration_ms ?? input.durationMs, state.config.defaultDurationMs), 1000, 60000),
    durationMode: cleanKey(input.duration_mode || input.durationMode || 'fixed') === 'sound' ? 'sound' : 'fixed',
    animation: 'neon_card',
    imageMode: cleanKey(input.image_mode || input.imageMode || 'none'),
    soundAssetId: nullableInt(input.sound_asset_id ?? input.soundAssetId),
    imageAssetId: nullableInt(input.image_asset_id ?? input.imageAssetId),
    soundMediaId: nullableInt(input.sound_media_id ?? input.soundMediaId),
    imageMediaId: nullableInt(input.image_media_id ?? input.imageMediaId),
    displayProfileId: nullableInt(input.display_profile_id ?? input.displayProfileId),
    enabled: boolInt(input.enabled, true),
    ttsEnabled: boolInt(input.tts_enabled ?? input.ttsEnabled, false),
    ttsTiming: validateTtsTiming(input.tts_timing || input.ttsTiming || 'after_alert'),
    ttsMode: validateTtsMode(input.tts_mode || input.ttsMode || 'audio_only'),
    ttsTemplate: cleanText(input.tts_template || input.ttsTemplate || '{user} schreibt: {message}').slice(0, 1000),
    ttsMaxChars: clamp(toInt(input.tts_max_chars ?? input.ttsMaxChars, 250), 1, 1000),
    ttsMinAmount: nullableNumber(input.tts_min_amount ?? input.ttsMinAmount),
    metaJson: JSON.stringify(input.meta || parseJson(input.meta_json, {}))
  };
  if (!state.config.allowedImageModes.includes(rule.imageMode)) rule.imageMode = 'none';
  if (!rule.imageAssetId && !rule.imageMediaId && rule.imageMode !== 'avatar' && rule.imageMode !== 'avatar_icon') rule.imageMode = 'none';
  if (rule.imageMediaId && rule.imageMode === 'none') rule.imageMode = 'special';
  if (rule.imageAssetId && rule.imageMode === 'none') rule.imageMode = 'special';
  if (rule.maxValue !== null && rule.minValue !== null && rule.maxValue < rule.minValue) throw new Error('max_value darf nicht kleiner als min_value sein.');

  if (id > 0) {
    database.run(`
      UPDATE alert_rules SET
        source=:source, type_key=:typeKey, label=:label, min_value=:minValue, max_value=:maxValue, tier=:tier,
        priority=:priority, duration_ms=:durationMs, duration_mode=:durationMode, animation=:animation, image_mode=:imageMode,
        sound_asset_id=:soundAssetId, image_asset_id=:imageAssetId, sound_media_id=:soundMediaId, image_media_id=:imageMediaId, display_profile_id=:displayProfileId, enabled=:enabled,
        tts_enabled=:ttsEnabled, tts_timing=:ttsTiming, tts_mode=:ttsMode, tts_template=:ttsTemplate, tts_max_chars=:ttsMaxChars, tts_min_amount=:ttsMinAmount,
        meta_json=:metaJson, updated_at=:now
      WHERE id=:id
    `, { ...rule, id, now });
    return { ok: true, id, rule: database.get(`SELECT * FROM alert_rules WHERE id=:id`, { id }) };
  }

  const result = database.run(`
    INSERT INTO alert_rules (source, type_key, label, min_value, max_value, tier, priority, duration_ms, duration_mode, animation, image_mode, sound_asset_id, image_asset_id, sound_media_id, image_media_id, display_profile_id, enabled, tts_enabled, tts_timing, tts_mode, tts_template, tts_max_chars, tts_min_amount, meta_json, created_at, updated_at)
    VALUES (:source, :typeKey, :label, :minValue, :maxValue, :tier, :priority, :durationMs, :durationMode, :animation, :imageMode, :soundAssetId, :imageAssetId, :soundMediaId, :imageMediaId, :displayProfileId, :enabled, :ttsEnabled, :ttsTiming, :ttsMode, :ttsTemplate, :ttsMaxChars, :ttsMinAmount, :metaJson, :now, :now)
  `, { ...rule, now });
  const newId = Number(result.lastInsertRowid || 0);
  if (!silent) return { ok: true, id: newId, rule: database.get(`SELECT * FROM alert_rules WHERE id=:id`, { id: newId }) };
  return { ok: true, id: newId };
}

function deleteRule(idRaw) {
  const id = toInt(idRaw, 0);
  if (id <= 0) return { ok: false, error: 'invalid_id' };
  database.run(`DELETE FROM alert_rules WHERE id=:id`, { id });
  return { ok: true, id };
}

function validateRules(input) {
  const source = cleanKey(input.source || 'twitch');
  const typeKey = cleanKey(input.type_key || input.typeKey || input.type || 'bits');
  const rules = listRules().filter(r => r.source === source && r.type_key === typeKey && Number(r.enabled) === 1);
  const warnings = [];
  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      if (rangesOverlap(rules[i], rules[j])) warnings.push({ type: 'overlap', ruleA: rules[i].id, ruleB: rules[j].id, message: `${rules[i].label} Ã¼berschneidet sich mit ${rules[j].label}` });
    }
  }
  return { ok: true, source, type_key: typeKey, warnings, rules };
}

function rangesOverlap(a, b) {
  const amin = a.min_value === null ? -Infinity : Number(a.min_value);
  const amax = a.max_value === null ? Infinity : Number(a.max_value);
  const bmin = b.min_value === null ? -Infinity : Number(b.min_value);
  const bmax = b.max_value === null ? Infinity : Number(b.max_value);
  return amin <= bmax && bmin <= amax;
}

function createUploadMiddleware() {
  if (!multer) return null;
  const storage = multer.diskStorage({
    destination(req, file, cb) {
      const assetType = detectAssetType(file.mimetype, req.body.assetType || req.query.assetType);
      const base = assetType === 'sound' ? absRoot(state.config.soundsDir) : imageTargetDir(req.body.imageCategory || req.query.imageCategory);
      core.ensureDir(base);
      cb(null, base);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const base = sanitizeFilename(path.basename(file.originalname || 'asset', ext));
      cb(null, `${Date.now()}_${base}${safeExt(ext)}`);
    }
  });
  return multer({
    storage,
    limits: { fileSize: Math.max(Number(state.config.maxSoundSizeBytes || 0), Number(state.config.maxImageSizeBytes || 0)) || 15728640 },
    fileFilter(req, file, cb) {
      const assetType = detectAssetType(file.mimetype, req.body.assetType || req.query.assetType);
      const allowed = assetType === 'sound' ? state.config.allowedSoundTypes : state.config.allowedImageTypes;
      if (!allowed.includes(file.mimetype)) return cb(new Error(`Dateityp nicht erlaubt: ${file.mimetype}`));
      cb(null, true);
    }
  });
}

function registerUploadedAsset(req) {
  if (!req.file) return { ok: false, error: 'missing_file' };
  const assetType = detectAssetType(req.file.mimetype, req.body.assetType || req.query.assetType);
  const rel = relRoot(req.file.path).replace(/\\/g, '/');
  const publicUrl = '/' + rel.replace(/^htdocs\//, '');
  const now = nowIso();
  const label = cleanText(req.body.label || req.query.label || path.basename(req.file.originalname || req.file.filename));
  const probe = assetType === 'sound' && state.config.autoDurationOnUpload !== false ? probeSoundFile(req.file.path) : { ok: false, durationMs: 0, error: assetType === 'sound' ? 'auto_duration_disabled' : 'not_sound' };
  const meta = {
    imageCategory: req.body.imageCategory || req.query.imageCategory || '',
    uploadedBy: req.body.uploadedBy || req.query.uploadedBy || '',
    durationMs: probe.durationMs || 0,
    durationOk: !!probe.ok,
    durationError: probe.error || ''
  };
  const result = database.run(`
    INSERT INTO alert_assets (asset_type, label, file_path, public_url, mime_type, size_bytes, original_name, enabled, duration_ms, probe_json, meta_json, created_at, updated_at)
    VALUES (:assetType, :label, :filePath, :publicUrl, :mimeType, :sizeBytes, :originalName, 1, :durationMs, :probeJson, :metaJson, :now, :now)
  `, {
    assetType,
    label,
    filePath: rel,
    publicUrl,
    mimeType: req.file.mimetype || '',
    sizeBytes: Number(req.file.size || 0),
    originalName: req.file.originalname || '',
    durationMs: Number(probe.durationMs || 0),
    probeJson: JSON.stringify(probe),
    metaJson: JSON.stringify(meta),
    now
  });
  const id = Number(result.lastInsertRowid || 0);
  return { ok: true, id, asset: database.get(`SELECT * FROM alert_assets WHERE id=:id`, { id }) };
}

function deleteAsset(idRaw, deleteFile) {
  const id = toInt(idRaw, 0);
  if (id <= 0) return { ok: false, error: 'invalid_id' };
  const usage = assetUsage(id);
  if ((usage.soundRules.length || usage.imageRules.length) && !deleteFile) {
    return { ok: false, error: 'asset_in_use', usage };
  }
  const asset = database.get(`SELECT * FROM alert_assets WHERE id=:id`, { id });
  if (!asset) return { ok: false, error: 'not_found' };
  database.run(`DELETE FROM alert_assets WHERE id=:id`, { id });
  if (deleteFile) {
    const filePath = absRoot(asset.file_path);
    if (filePath.startsWith(configHelper.getRootDir()) && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  return { ok: true, id, deletedFile: !!deleteFile };
}

function assetUsage(idRaw) {
  const id = toInt(idRaw, 0);
  return {
    ok: true,
    id,
    soundRules: database.all(`SELECT id, label FROM alert_rules WHERE sound_asset_id=:id`, { id }),
    imageRules: database.all(`SELECT id, label FROM alert_rules WHERE image_asset_id=:id`, { id })
  };
}

function scanSoundDurations(input = {}) {
  const force = input.force === true || input.force === 1 || input.force === '1' || input.force === 'true';
  const rows = database.all(`SELECT * FROM alert_assets WHERE asset_type = 'sound' ORDER BY id ASC`);
  const result = { ok: true, scanned: 0, updated: 0, skipped: 0, failed: 0, rows: [] };
  for (const row of rows) {
    if (!force && Number(row.duration_ms || 0) > 0) {
      result.skipped += 1;
      result.rows.push({ id: row.id, label: row.label, skipped: true, durationMs: Number(row.duration_ms || 0) });
      continue;
    }
    result.scanned += 1;
    const filePath = absRoot(row.file_path);
    const probe = probeSoundFile(filePath);
    const meta = { ...parseJson(row.meta_json, {}), durationMs: probe.durationMs || 0, durationOk: !!probe.ok, durationError: probe.error || '' };
    database.run(`UPDATE alert_assets SET duration_ms=:durationMs, probe_json=:probeJson, meta_json=:metaJson, updated_at=:now WHERE id=:id`, {
      id: row.id,
      durationMs: Number(probe.durationMs || 0),
      probeJson: JSON.stringify(probe),
      metaJson: JSON.stringify(meta),
      now: nowIso()
    });
    if (probe.ok) result.updated += 1; else result.failed += 1;
    result.rows.push({ id: row.id, label: row.label, ok: probe.ok, durationMs: probe.durationMs || 0, error: probe.error || '' });
  }
  result.assets = listAssets();
  return result;
}

function probeSoundFile(filePath) {
  const probe = media.readAudioDurationMs(filePath, { timeoutMs: Number(state.config.ffprobeTimeoutMs || 5000) });
  return {
    ok: !!probe.ok,
    durationMs: Number(probe.durationMs || 0),
    cached: !!probe.cached,
    error: probe.error || '',
    probedAt: nowIso(),
    ffprobePath: media.findFfprobe()
  };
}

function getSettings() {
  const rows = database.all(`SELECT key, value_json, updated_at FROM alert_settings ORDER BY key ASC`);
  const out = {};
  for (const row of rows) out[row.key] = parseJson(row.value_json, null);
  return out;
}

function saveSettings(input) {
  const now = nowIso();
  const data = input.settings && typeof input.settings === 'object' ? input.settings : input;
  for (const [key, value] of Object.entries(data || {})) {
    const clean = cleanKey(key);
    if (!clean) continue;
    database.run(`
      INSERT INTO alert_settings (key, value_json, updated_at)
      VALUES (:key, :valueJson, :now)
      ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json, updated_at=excluded.updated_at
    `, { key: clean, valueJson: JSON.stringify(value), now });
  }
  const runtime = applyRuntimeSettingsFromDb();
  return { ok: true, settings: getSettings(), config: publicConfig(), runtime };
}

function enqueueFromRequest(req, broadcastWS, defaultSource) {
  return enqueueAlert(normalizeAlertPayload(req.body && Object.keys(req.body).length ? req.body : req.query, defaultSource), broadcastWS);
}

function normalizeAlertPayload(input, defaultSource) {
  const data = input || {};
  const typeKey = cleanKey(data.type_key || data.typeKey || data.type || data.alertType || 'follow');
  const source = cleanKey(data.source || defaultSource || 'test');
  const amount = nullableNumber(data.amount ?? data.value ?? data.bits ?? data.viewerCount ?? data.count) ?? 0;
  const user = cleanText(data.user || data.user_display || data.userDisplay || data.displayName || data.login || data.userName || 'TestUser');
  return {
    source,
    type_key: typeKey,
    user_login: cleanKey(data.user_login || data.userLogin || data.login || data.userName || user).toLowerCase(),
    user_display: user,
    amount,
    currency: cleanText(data.currency || data.currencyCode || ''),
    message: cleanText(data.message || data.text || ''),
    avatar_url: cleanText(data.avatar_url || data.avatarUrl || ''),
    display_profile_id: nullableInt(data.displayProfileId ?? data.display_profile_id),
    title: cleanText(data.title || ''),
    raw: data
  };
}

function enqueueAlert(payload, broadcastWS) {
  const gate = alertQueueGate();
  if (!gate.ok) return gate;
  const rule = findMatchingRule(payload);
  if (!rule && state.config.playUnmatchedAlerts !== true) {
    return ignoreUnmatchedAlert(payload, 'no_matching_rule');
  }
  return enqueueAlertWithRule(payload, rule, broadcastWS);
}

function alertQueueGate() {
  if (state.config.enabled === false) {
    return { ok: false, queued: false, ignored: true, error: 'alerts_disabled', reason: 'alert_system_disabled' };
  }
  if (state.config.queueEnabled === false) {
    return { ok: false, queued: false, ignored: true, error: 'alert_queue_disabled', reason: 'queue_disabled' };
  }
  return { ok: true };
}

function ignoreUnmatchedAlert(payload, reason = 'no_matching_rule') {
  const eventUid = makeEventUid();
  const now = nowIso();
  const rawPayload = { ...((payload && payload.raw) || payload || {}) };
  try {
    database.run(`
      INSERT INTO alert_events (event_uid, source, type_key, user_login, user_display, amount, message, rule_id, status, payload_json, display_profile_id, created_at, finished_at)
      VALUES (:eventUid, :source, :typeKey, :userLogin, :userDisplay, :amount, :message, NULL, 'ignored', :payloadJson, :displayProfileId, :now, :now)
    `, {
      eventUid,
      source: payload && payload.source ? payload.source : 'unknown',
      typeKey: payload && payload.type_key ? payload.type_key : 'unknown',
      userLogin: payload && payload.user_login ? payload.user_login : '',
      userDisplay: payload && payload.user_display ? payload.user_display : '',
      amount: Number(payload && payload.amount || 0),
      message: payload && payload.message ? payload.message : reason,
      payloadJson: JSON.stringify({ ...rawPayload, ignoredReason: reason }),
      displayProfileId: payload && payload.display_profile_id ? payload.display_profile_id : null,
      now
    });
  } catch (err) {
    console.warn('[alert_system] failed to store ignored alert:', err && err.message ? err.message : err);
  }
  return {
    ok: true,
    queued: false,
    ignored: true,
    eventUid,
    source: payload && payload.source ? payload.source : 'unknown',
    type_key: payload && payload.type_key ? payload.type_key : 'unknown',
    reason
  };
}

function enqueueAlertWithRule(payload, rule, broadcastWS, options = {}) {
  const gate = alertQueueGate();
  if (!gate.ok) return gate;
  const eventUid = makeEventUid();
  const now = nowIso();
  const rawPayload = { ...(payload.raw || payload) };
  if (options.replayOf) rawPayload.replayOf = options.replayOf;
  const event = {
    eventUid,
    source: payload.source,
    type_key: payload.type_key,
    user_login: payload.user_login,
    user_display: payload.user_display,
    amount: Number(payload.amount || 0),
    message: payload.message || '',
    avatar_url: payload.avatar_url || '',
    display_profile_id: payload.display_profile_id || null,
    currency: payload.currency || '',
    title: payload.title || '',
    raw: rawPayload,
    rule,
    status: 'queued',
    created_at: now,
    replayOf: options.replayOf || null
  };
  ensureAlertTiming(event);
  database.run(`
    INSERT INTO alert_events (event_uid, source, type_key, user_login, user_display, amount, message, rule_id, status, payload_json, display_profile_id, created_at)
    VALUES (:eventUid, :source, :typeKey, :userLogin, :userDisplay, :amount, :message, :ruleId, 'queued', :payloadJson, :displayProfileId, :now)
  `, {
    eventUid,
    source: event.source,
    typeKey: event.type_key,
    userLogin: event.user_login,
    userDisplay: event.user_display,
    amount: event.amount,
    message: event.message,
    ruleId: rule ? rule.id : null,
    payloadJson: JSON.stringify(rawPayload),
    displayProfileId: event.display_profile_id || null,
    now
  });
  state.queue.push(event);
  scheduleAlertBundlePrequeue(event, broadcastWS);
  return { ok: true, queued: true, eventUid, replayOf: options.replayOf || null, queueLength: state.queue.length, current: state.current ? state.current.eventUid : null, matchedRule: rule ? rule.id : null, warning: rule ? '' : 'no_matching_rule', bundlePrequeue: true };
}

function replayAlertEvent(eventUid, broadcastWS) {
  const gate = alertQueueGate();
  if (!gate.ok) return gate;
  const sourceUid = cleanText(eventUid || '');
  if (!sourceUid) return { ok: false, error: 'missing_event_uid' };
  const row = database.get(`SELECT * FROM alert_events WHERE event_uid=:eventUid`, { eventUid: sourceUid });
  if (!row) return { ok: false, error: 'event_not_found' };
  const rawPayload = parseJson(row.payload_json, {});
  const payload = normalizeAlertPayload({
    ...rawPayload,
    source: row.source,
    type_key: row.type_key,
    user_login: row.user_login,
    user_display: row.user_display,
    user: row.user_display || row.user_login,
    amount: row.amount,
    message: row.message,
    title: rawPayload.title || '',
    avatar_url: rawPayload.avatar_url || rawPayload.avatarUrl || ''
  }, row.source);
  payload.raw = { ...payload.raw, replay: true, replayOf: sourceUid };
  let rule = null;
  if (row.rule_id) rule = getRuleById(row.rule_id);
  if (!rule) rule = findMatchingRule(payload);
  return enqueueAlertWithRule(payload, rule, broadcastWS, { replayOf: sourceUid });
}

function listAlertEvents(filter = {}) {
  const limit = clamp(toInt(filter.limit, 100), 1, 500);
  const source = cleanKey(filter.source || '');
  const typeKey = cleanKey(filter.type_key || filter.type || '');
  const status = cleanKey(filter.status || '');
  const params = { limit };
  const where = [];

  if (source && source !== 'all') {
    where.push('e.source = :source');
    params.source = source;
  }
  if (typeKey && typeKey !== 'all') {
    where.push('e.type_key = :typeKey');
    params.typeKey = typeKey;
  }
  if (status && status !== 'all') {
    where.push('e.status = :status');
    params.status = status;
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return database.all(`
    SELECT
      e.*,
      r.label AS rule_label,
      r.tier AS rule_tier,
      r.priority AS rule_priority
    FROM alert_events e
    LEFT JOIN alert_rules r ON r.id = e.rule_id
    ${whereSql}
    ORDER BY e.created_at DESC, e.id DESC
    LIMIT :limit
  `, params).map(row => {
    const payload = parseJson(row.payload_json, {});
    return {
      id: row.id,
      eventUid: row.event_uid,
      source: row.source,
      type_key: row.type_key,
      user_login: row.user_login || '',
      user_display: row.user_display || '',
      amount: Number(row.amount || 0),
      currency: payload.currency || payload.currencyCode || '',
      message: row.message || '',
      rule_id: row.rule_id || null,
      rule: row.rule_id ? {
        id: row.rule_id,
        label: row.rule_label || '',
        tier: row.rule_tier || '',
        priority: Number(row.rule_priority || 0)
      } : null,
      status: row.status || '',
      created_at: row.created_at || '',
      started_at: row.started_at || '',
      finished_at: row.finished_at || '',
      final_chat_message: row.final_chat_message || '',
      chat_message_status: row.chat_message_status || '',
      finishReason: payload.finishReason || payload.finish_reason || '',
      raw: payload
    };
  });
}

function getRuleById(id) {
  const rule = database.get(`
    SELECT
      r.*,
      s.public_url AS sound_url,
      s.label AS sound_label,
      s.duration_ms AS sound_duration_ms,
      i.public_url AS image_url,
      i.label AS image_label,
      sm.display_name AS sound_media_label,
      sm.duration_ms AS sound_media_duration_ms,
      sm.relative_path AS sound_media_path,
      sm.web_path AS sound_media_url,
      sm.type AS sound_media_type,
      im.display_name AS image_media_label,
      im.relative_path AS image_media_path,
      im.web_path AS image_media_url,
      im.type AS image_media_type
    FROM alert_rules r
    LEFT JOIN alert_assets s ON s.id = r.sound_asset_id AND s.enabled = 1
    LEFT JOIN alert_assets i ON i.id = r.image_asset_id AND i.enabled = 1
    LEFT JOIN media_assets sm ON sm.id = r.sound_media_id AND sm.status = 'active'
    LEFT JOIN media_assets im ON im.id = r.image_media_id AND im.status = 'active'
    WHERE r.id=:id AND r.enabled = 1
  `, { id: Number(id) });
  return rule ? { ...rule, meta: parseJson(rule.meta_json, {}) } : null;
}


function listDisplayProfiles(filter = {}) {
  return database.all(`SELECT * FROM alert_display_profiles ORDER BY is_default DESC, sort_order ASC, id ASC`).map(row => {
    const settings = sanitizeDisplaySettings(parseJson(row.settings_json, defaultDisplaySettings()));
    if (settings.topGraphicAssetId && !settings.topGraphicUrl) settings.topGraphicUrl = resolveTopGraphicUrlFromAsset(settings.topGraphicAssetId);
    return { ...row, settings };
  });
}

function getDisplayProfileById(idRaw) {
  const id = toInt(idRaw, 0);
  if (!id) return null;
  const row = database.get(`SELECT * FROM alert_display_profiles WHERE id=:id`, { id });
  return row ? { ...row, settings: parseJson(row.settings_json, defaultDisplaySettings()) } : null;
}

function getDefaultDisplayProfile() {
  const row = database.get(`SELECT * FROM alert_display_profiles WHERE enabled=1 ORDER BY is_default DESC, sort_order ASC, id ASC LIMIT 1`);
  return row ? { ...row, settings: parseJson(row.settings_json, defaultDisplaySettings()) } : { id:null, name:'Neon Badge Standard', settings: defaultDisplaySettings() };
}

function saveDisplayProfile(input = {}) {
  const now = nowIso();
  const id = toInt(input.id, 0);
  const isDefault = boolInt(input.is_default ?? input.isDefault, false);
  const settings = sanitizeDisplaySettings(input.settings || parseJson(input.settings_json, defaultDisplaySettings()));
  const name = cleanText(input.name || 'Neuer Alert').slice(0, 120);
  if (!name) throw new Error('Alert-Name darf nicht leer sein.');
  const duplicate = database.get(`SELECT id, name FROM alert_display_profiles WHERE lower(trim(name)) = lower(trim(:name)) AND id != :id LIMIT 1`, { name, id });
  if (duplicate) throw new Error(`Alert-Name existiert bereits: ${duplicate.name}`);
  const row = { name, description: cleanText(input.description || '').slice(0, 500), isDefault, enabled: boolInt(input.enabled, true), settingsJson: JSON.stringify(settings), sortOrder: toInt(input.sort_order ?? input.sortOrder, 100), now };
  if (isDefault) database.run(`UPDATE alert_display_profiles SET is_default=0 WHERE is_default=1`);
  if (id > 0) {
    database.run(`UPDATE alert_display_profiles SET name=:name, description=:description, is_default=:isDefault, enabled=:enabled, settings_json=:settingsJson, sort_order=:sortOrder, updated_at=:now WHERE id=:id`, { ...row, id });
    return { ok:true, id, profile:getDisplayProfileById(id) };
  }
  const result = database.run(`INSERT INTO alert_display_profiles (name, description, is_default, enabled, settings_json, sort_order, created_at, updated_at) VALUES (:name, :description, :isDefault, :enabled, :settingsJson, :sortOrder, :now, :now)`, row);
  const newId = Number(result.lastInsertRowid || 0);
  return { ok:true, id:newId, profile:getDisplayProfileById(newId) };
}

function deleteDisplayProfile(idRaw) {
  const id = toInt(idRaw, 0);
  if (!id) return { ok:false, error:'invalid_id' };
  const profile = getDisplayProfileById(id);
  if (!profile) return { ok:false, error:'not_found' };
  if (Number(profile.is_default)) return { ok:false, error:'cannot_delete_default' };
  database.run(`UPDATE alert_rules SET display_profile_id=NULL WHERE display_profile_id=:id`, { id });
  database.run(`DELETE FROM alert_display_profiles WHERE id=:id`, { id });
  return { ok:true, id };
}

function seedDisplayProfiles() {
  try {
    const count = database.get(`SELECT COUNT(*) AS c FROM alert_display_profiles`)?.c || 0;
    if (Number(count) > 0) return;
    saveDisplayProfile({ name:'Neon Badge Standard', description:'ForrestCGN Neon-Galaxy Standardprofil', is_default:1, enabled:1, sort_order:10, settings: defaultDisplaySettings() });
    saveDisplayProfile({ name:'Kompakt', description:'Kompakter Alert für kleine Einblendungen', enabled:1, sort_order:20, settings:{ ...defaultDisplaySettings(), widthMode:'compact', sizeScale:0.88, fontScale:0.9, badgeScale:0.88, avatarSize:'normal' } });
    saveDisplayProfile({ name:'Groß / Raid', description:'Breiter und präsenter für große Alerts', enabled:1, sort_order:30, settings:{ ...defaultDisplaySettings(), widthMode:'wide', sizeScale:1.08, fontScale:1.05, badgeScale:1.05, glowStrength:'strong' } });
  } catch (e) { console.warn('[alert_system] display profile seed failed:', e.message || e); }
}

function defaultDisplaySettings() {
  return { widthMode:'custom', overlayPosition:'custom', positionX:50, positionY:50, cardWidthPx:1120, cardHeightPx:300, sizeScale:1, fontScale:1, headlineScale:1, valueScale:1, avatarPosition:'left', avatarSize:'normal', providerLogoStyle:'tile', topGraphicAssetId:'', topGraphicUrl:'', topGraphicScale:1, topGraphicOffsetY:-18, topGraphicShape:'original', topGraphicFrameStrength:'normal', topGraphicImageZoom:1, topGraphicImageX:50, topGraphicImageY:50, topGraphicFrameStyle:'none', cardBorderColorA:'#8ff4ff', cardBorderColorB:'#c45cff', innerBorderEnabled:true, previewCelebration:'none', celebrationStrength:'medium', badgeEnabled:false, badgeStyle:'none', badgeScale:1, textAlign:'left', showSideLines:true, showParticles:true, glowStrength:'normal' };
}

function sanitizeDisplaySettings(input = {}) {
  const base = defaultDisplaySettings();
  const pick = (v, allowed, fallback) => allowed.includes(String(v || '').toLowerCase()) ? String(v).toLowerCase() : fallback;
  const color = (v, fallback) => /^#[0-9a-f]{6}$/i.test(String(v || '').trim()) ? String(v).trim() : fallback;
  return {
    widthMode: pick(input.widthMode || input.width_mode, ['compact','adaptive','normal','wide','full','custom'], base.widthMode),
    overlayPosition: pick(input.overlayPosition || input.overlay_position, ['top-left','top-center','top-right','middle-left','middle-center','middle-right','bottom-left','bottom-center','bottom-right','custom'], base.overlayPosition),
    positionX: clamp(Number(input.positionX ?? input.position_x ?? base.positionX) || 50, 0, 100),
    positionY: clamp(Number(input.positionY ?? input.position_y ?? base.positionY) || 50, 0, 100),
    cardWidthPx: clamp(Number(input.cardWidthPx ?? input.card_width_px ?? base.cardWidthPx) || base.cardWidthPx, 560, 1600),
    cardHeightPx: clamp(Number(input.cardHeightPx ?? input.card_height_px ?? base.cardHeightPx) || base.cardHeightPx, 180, 520),
    sizeScale: clamp(Number(input.sizeScale ?? input.size_scale ?? base.sizeScale) || 1, 0.7, 1.35),
    fontScale: clamp(Number(input.fontScale ?? input.font_scale ?? base.fontScale) || 1, 0.75, 1.35),
    headlineScale: clamp(Number(input.headlineScale ?? input.headline_scale ?? base.headlineScale) || 1, 0.7, 1.4),
    valueScale: clamp(Number(input.valueScale ?? input.value_scale ?? base.valueScale) || 1, 0.7, 1.4),
    avatarPosition: pick(input.avatarPosition || input.avatar_position, ['left','right','top','bottom','hidden'], base.avatarPosition),
    avatarSize: pick(input.avatarSize || input.avatar_size, ['small','normal','large'], base.avatarSize),
    providerLogoStyle: pick(input.providerLogoStyle || input.provider_logo_style, ['tile','round','original'], base.providerLogoStyle),
    topGraphicAssetId: cleanText(input.topGraphicAssetId ?? input.top_graphic_asset_id ?? base.topGraphicAssetId),
    topGraphicUrl: cleanText(input.topGraphicUrl ?? input.top_graphic_url ?? base.topGraphicUrl),
    topGraphicScale: clamp(Number(input.topGraphicScale ?? input.top_graphic_scale ?? base.topGraphicScale) || 1, 0.35, 2),
    topGraphicOffsetY: clamp(Number(input.topGraphicOffsetY ?? input.top_graphic_offset_y ?? base.topGraphicOffsetY) || -18, -260, 180),
    topGraphicShape: pick(input.topGraphicShape || input.top_graphic_shape || input.topGraphicFrameStyle || input.top_graphic_frame_style, ['original','round','tile','heart','shield','hexagon','diamond','star','none'], base.topGraphicShape),
    topGraphicFrameStrength: (String(input.topGraphicFrameStrength || input.top_graphic_frame_strength || base.topGraphicFrameStrength || 'normal').toLowerCase() === 'soft' ? 'soft' : 'normal'),
    topGraphicImageZoom: clamp(Number(input.topGraphicImageZoom ?? input.top_graphic_image_zoom ?? base.topGraphicImageZoom) || 1, 0.6, 2.5),
    topGraphicImageX: clamp(Number(input.topGraphicImageX ?? input.top_graphic_image_x ?? base.topGraphicImageX) || 50, 0, 100),
    topGraphicImageY: clamp(Number(input.topGraphicImageY ?? input.top_graphic_image_y ?? base.topGraphicImageY) || 50, 0, 100),
    topGraphicFrameStyle: pick(input.topGraphicFrameStyle || input.top_graphic_frame_style, ['none','round','tile','original'], base.topGraphicFrameStyle),
    cardBorderColorA: color(input.cardBorderColorA ?? input.card_border_color_a, base.cardBorderColorA),
    cardBorderColorB: color(input.cardBorderColorB ?? input.card_border_color_b, base.cardBorderColorB),
    innerBorderEnabled: boolish(input.innerBorderEnabled ?? input.inner_border_enabled, base.innerBorderEnabled),
    previewCelebration: normalizeCelebrationAlias(pick(input.previewCelebration || input.preview_celebration, ['none','heart_rain','sparkle_rain','hearts','stars','sparkle','sparkles'], base.previewCelebration)),
    celebrationStrength: pick(input.celebrationStrength || input.celebration_strength, ['soft','medium','strong'], base.celebrationStrength),
    badgeEnabled: boolish(input.badgeEnabled ?? input.badge_enabled, base.badgeEnabled),
    badgeStyle: pick(input.badgeStyle || input.badge_style, ['brand-heart','brand-shield','core','orbit','ring','pulse','minimal','spark','hex','shield','wave','cgn','dotgrid','triad','slash','double-ring','cross','cube','bolt','none'], base.badgeStyle),
    badgeScale: clamp(Number(input.badgeScale ?? input.badge_scale ?? base.badgeScale) || 1, 0.65, 1.25),
    textAlign: pick(input.textAlign || input.text_align, ['left','center','right'], base.textAlign),
    showSideLines: boolish(input.showSideLines ?? input.show_side_lines, base.showSideLines),
    showParticles: boolish(input.showParticles ?? input.show_particles, base.showParticles),
    glowStrength: pick(input.glowStrength || input.glow_strength, ['soft','normal','strong'], base.glowStrength)
  };
}

function resolveTopGraphicUrlFromAsset(assetId) {
  const id = toInt(assetId, 0);
  if (!id) return '';
  try {
    const row = database.get(`SELECT public_url FROM alert_assets WHERE id=:id AND enabled=1 AND asset_type='image'`, { id });
    return cleanText(row?.public_url || '');
  } catch (_) { return ''; }
}

function resolveDisplayProfile(event, rule = {}) {
  const raw = event.raw || {};
  const explicitId = nullableInt(event.display_profile_id ?? raw.displayProfileId ?? raw.display_profile_id);
  const ruleId = nullableInt(rule.display_profile_id);
  const profile = explicitId ? getDisplayProfileById(explicitId) : (ruleId ? getDisplayProfileById(ruleId) : getDefaultDisplayProfile());
  const settings = sanitizeDisplaySettings(profile?.settings || defaultDisplaySettings());
  if (settings.topGraphicAssetId && !settings.topGraphicUrl) settings.topGraphicUrl = resolveTopGraphicUrlFromAsset(settings.topGraphicAssetId);
  return { id: profile?.id || null, name: profile?.name || 'Neon Badge Standard', settings };
}

function listTextVariants(filter = {}) {
  const source = cleanKey(filter.source || '');
  const typeKey = cleanKey(filter.type_key || filter.typeKey || '');
  const where = [];
  const params = {};
  if (source) { where.push('source = :source'); params.source = source; }
  if (typeKey) { where.push('type_key = :typeKey'); params.typeKey = typeKey; }
  const sql = `SELECT * FROM alert_text_variants ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY source ASC, type_key ASC, COALESCE(rule_id, 0) ASC, sort_order ASC, id ASC`;
  return database.all(sql, params).map(row => ({ ...row, meta: parseJson(row.meta_json, {}) }));
}

function saveTextVariant(input = {}) {
  const now = nowIso();
  const id = toInt(input.id, 0);
  const row = {
    source: cleanKey(input.source || 'twitch'),
    typeKey: cleanKey(input.type_key || input.typeKey || 'follow'),
    ruleId: nullableInt(input.rule_id ?? input.ruleId),
    label: cleanText(input.label || ''),
    titleTemplate: cleanTemplate(input.title_template ?? input.titleTemplate ?? ''),
    headlineTemplate: cleanTemplate(input.headline_template ?? input.headlineTemplate ?? ''),
    valueTemplate: cleanTemplate(input.value_template ?? input.valueTemplate ?? ''),
    sublineTemplate: cleanTemplate(input.subline_template ?? input.sublineTemplate ?? ''),
    messageTemplate: cleanTemplate(input.message_template ?? input.messageTemplate ?? ''),
    messageMode: validateMessageMode(input.message_mode || input.messageMode || 'auto'),
    hideSublineWhenMessageExists: boolInt(input.hide_subline_when_message_exists ?? input.hideSublineWhenMessageExists, true),
    pickWeight: clamp(toInt(input.pick_weight ?? input.pickWeight, 100), 1, 9999),
    enabled: boolInt(input.enabled, true),
    sortOrder: toInt(input.sort_order ?? input.sortOrder, 100),
    metaJson: JSON.stringify(input.meta || parseJson(input.meta_json, {})),
    now
  };
  if (!row.typeKey) return { ok: false, error: 'missing_type_key' };
  if (!row.label) row.label = `${row.source}/${row.typeKey}`;
  if (id > 0) {
    database.run(`UPDATE alert_text_variants SET source=:source, type_key=:typeKey, rule_id=:ruleId, label=:label, title_template=:titleTemplate, headline_template=:headlineTemplate, value_template=:valueTemplate, subline_template=:sublineTemplate, message_template=:messageTemplate, message_mode=:messageMode, hide_subline_when_message_exists=:hideSublineWhenMessageExists, pick_weight=:pickWeight, enabled=:enabled, sort_order=:sortOrder, meta_json=:metaJson, updated_at=:now WHERE id=:id`, { ...row, id });
    return { ok: true, id, variant: database.get(`SELECT * FROM alert_text_variants WHERE id=:id`, { id }) };
  }
  const result = database.run(`INSERT INTO alert_text_variants (source, type_key, rule_id, label, title_template, headline_template, value_template, subline_template, message_template, message_mode, hide_subline_when_message_exists, pick_weight, enabled, sort_order, meta_json, created_at, updated_at) VALUES (:source, :typeKey, :ruleId, :label, :titleTemplate, :headlineTemplate, :valueTemplate, :sublineTemplate, :messageTemplate, :messageMode, :hideSublineWhenMessageExists, :pickWeight, :enabled, :sortOrder, :metaJson, :now, :now)`, row);
  const newId = Number(result.lastInsertRowid || 0);
  return { ok: true, id: newId, variant: database.get(`SELECT * FROM alert_text_variants WHERE id=:id`, { id: newId }) };
}

function deleteTextVariant(idRaw) {
  const id = toInt(idRaw, 0);
  if (id <= 0) return { ok: false, error: 'invalid_id' };
  database.run(`DELETE FROM alert_text_variants WHERE id=:id`, { id });
  return { ok: true, id };
}

function listTestPresets(filter = {}) {
  const source = cleanKey(filter.source || '');
  const typeKey = cleanKey(filter.type_key || filter.typeKey || '');
  const where = [];
  const params = {};
  if (source) { where.push('source = :source'); params.source = source; }
  if (typeKey) { where.push('type_key = :typeKey'); params.typeKey = typeKey; }
  const sql = `SELECT * FROM alert_test_presets ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY source ASC, type_key ASC, sort_order ASC, id ASC`;
  return database.all(sql, params).map(row => ({ ...row, payload: parseJson(row.payload_json, {}) }));
}

function getTestPresetById(idRaw) {
  const id = toInt(idRaw, 0);
  if (id <= 0) return null;
  const row = database.get(`SELECT * FROM alert_test_presets WHERE id=:id`, { id });
  return row ? { ...row, payload: parseJson(row.payload_json, {}) } : null;
}

function saveTestPreset(input = {}) {
  const now = nowIso();
  const id = toInt(input.id, 0);
  const payload = input.payload && typeof input.payload === 'object' ? input.payload : parseJson(input.payload_json, {});
  const row = {
    source: cleanKey(input.source || payload.source || 'twitch'),
    typeKey: cleanKey(input.type_key || input.typeKey || payload.type_key || payload.type || 'follow'),
    ruleId: nullableInt(input.rule_id ?? input.ruleId),
    label: cleanText(input.label || 'Testpreset'),
    payloadJson: JSON.stringify(payload || {}),
    enabled: boolInt(input.enabled, true),
    sortOrder: toInt(input.sort_order ?? input.sortOrder, 100),
    now
  };
  if (id > 0) {
    database.run(`UPDATE alert_test_presets SET source=:source, type_key=:typeKey, rule_id=:ruleId, label=:label, payload_json=:payloadJson, enabled=:enabled, sort_order=:sortOrder, updated_at=:now WHERE id=:id`, { ...row, id });
    return { ok: true, id, preset: getTestPresetById(id) };
  }
  const result = database.run(`INSERT INTO alert_test_presets (source, type_key, rule_id, label, payload_json, enabled, sort_order, created_at, updated_at) VALUES (:source, :typeKey, :ruleId, :label, :payloadJson, :enabled, :sortOrder, :now, :now)`, row);
  const newId = Number(result.lastInsertRowid || 0);
  return { ok: true, id: newId, preset: getTestPresetById(newId) };
}

function deleteTestPreset(idRaw) {
  const id = toInt(idRaw, 0);
  if (id <= 0) return { ok: false, error: 'invalid_id' };
  database.run(`DELETE FROM alert_test_presets WHERE id=:id`, { id });
  return { ok: true, id };
}

function seedAlertTextVariants() {
  const rows = [
    ['twitch','follow','Follow Standard','TWITCH FOLLOW','{userDisplayName}','folgt jetzt dem Kanal','Willkommen in der CGN-Community!','never',10],
    ['twitch','follow','Follow CGN','TWITCH FOLLOW','{userDisplayName}','ist jetzt Teil der CGN-Community','Schön, dass du da bist!','never',20],
    ['twitch','bits','Bits Standard','TWITCH BITS','{userDisplayName}','cheert {amountFormatted}','Danke für den Support!','auto',30],
    ['twitch','sub','Sub Standard','TWITCH SUB','{userDisplayName}','ist jetzt Subscriber','Danke für deine Unterstützung!','auto',40],
    ['twitch','resub','Resub Standard','TWITCH RESUB','{userDisplayName}','{months} Monate dabei','Danke für deine Treue!','auto',50],
    ['twitch','gift_sub','Gift Sub Standard','TWITCH GIFT SUB','{userDisplayName}','verschenkt {amountFormatted}','Danke für den Support!','never',60],
    ['twitch','gift_bomb','Gift Bomb Standard','TWITCH GIFT SUB','{userDisplayName}','verschenkt {amountFormatted}','Danke für den Support!','never',70],
    ['twitch','raid','Raid Standard','TWITCH RAID','{userDisplayName}','kommt mit {viewerCount} Leuten rein','Willkommen bei CGN!','never',80],
    ['kofi','donation','Ko-fi Standard','KO-FI SUPPORT','{userDisplayName}','{amountFormatted}','Danke für deine Unterstützung!','auto',90],
    ['kofi','membership','Ko-fi Membership Standard','KO-FI MEMBERSHIP','{userDisplayName}','ist jetzt Mitglied','Danke für deine regelmäßige Unterstützung!','auto',91],
    ['kofi','shop','Ko-fi Shop Standard','KO-FI SHOP','{userDisplayName}','hat etwas im Shop gekauft','Danke für den Support!','auto',92],
    ['kofi','commission','Ko-fi Commission Standard','KO-FI COMMISSION','{userDisplayName}','hat eine Commission gebucht','Danke für deine Unterstützung!','auto',93],
    ['tipeee','donation','Tipeee Standard','TIPEEE SUPPORT','{userDisplayName}','{amountFormatted}','Danke für deine Unterstützung!','auto',100],
    ['tipeee','subscription','Tipeee Subscription Standard','TIPEEE ABO','{userDisplayName}','unterstützt jetzt regelmäßig','Danke für deine Unterstützung!','auto',101],
    ['tipeee','follow','Tipeee Follow Standard','TIPEEE FOLLOW','{userDisplayName}','folgt jetzt auf Tipeee','Willkommen und danke dir!','never',102],
    ['tipeee','hosting','Tipeee Hosting Standard','TIPEEE HOSTING','{userDisplayName}','hostet die Aktion','Danke für den Support!','auto',103]
  ];
  rows.forEach(r => {
    const exists = database.get(`SELECT id FROM alert_text_variants WHERE source=:source AND type_key=:typeKey AND label=:label LIMIT 1`, { source:r[0], typeKey:r[1], label:r[2] });
    if (!exists) saveTextVariant({ source:r[0], type_key:r[1], label:r[2], title_template:r[3], headline_template:r[4], value_template:r[5], subline_template:r[6], message_mode:r[7], sort_order:r[8], enabled:1 });
  });

  // STEP123: alten Bits-Standard nur dann sanft migrieren, wenn er noch unverändert aus STEP103 stammt.
  const oldBits = database.get(`SELECT id, headline_template, value_template FROM alert_text_variants WHERE source='twitch' AND type_key='bits' AND label='Bits Standard' LIMIT 1`);
  if (oldBits && String(oldBits.headline_template || '').toLowerCase().includes('cheer') && String(oldBits.value_template || '') === '{amountFormatted}') {
    database.run(`UPDATE alert_text_variants SET headline_template='{userDisplayName}', value_template='cheert {amountFormatted}', updated_at=:now WHERE id=:id`, { id: oldBits.id, now: nowIso() });
  }
}

function seedAlertTestPresets() {
  const count = database.get(`SELECT COUNT(*) AS c FROM alert_test_presets`)?.c || 0;
  if (Number(count) > 0) return;
  const presets = [
    { source:'twitch', type_key:'follow', label:'Follow Test', payload:{ user:'ForrestCGN', userLogin:'forrestcgn', avatarUrl:'', amount:1 } },
    { source:'twitch', type_key:'bits', label:'100 Bits Test', payload:{ user:'ForrestCGN', userLogin:'forrestcgn', amount:100, message:'Test für neue Staffel', avatarUrl:'' } },
    { source:'twitch', type_key:'sub', label:'Sub Test', payload:{ user:'ForrestCGN', userLogin:'forrestcgn', amount:1, message:'Sub-Test aus dem Dashboard', avatarUrl:'' } },
    { source:'twitch', type_key:'raid', label:'Raid Test', payload:{ user:'ForrestCGN', userLogin:'forrestcgn', amount:23, viewerCount:23, avatarUrl:'' } },
    { source:'kofi', type_key:'donation', label:'Ko-fi 3 Euro Test', payload:{ user:'ForrestCGN', amount:3, currency:'EUR', message:'Ko-fi Test aus dem Dashboard' } },
    { source:'tipeee', type_key:'donation', label:'Tipeee 5 Euro Test', payload:{ user:'ForrestCGN', amount:5, currency:'EUR', message:'Tipeee Test aus dem Dashboard' } }
  ];
  presets.forEach((p, i) => saveTestPreset({ ...p, sort_order:(i+1)*10, enabled:1 }));
}

function findMatchingRule(payload) {
  const source = payload.source;
  const typeKey = payload.type_key;
  const amount = Number(payload.amount || 0);
  const explicitRuleId = nullableInt(payload.raw?.ruleId ?? payload.raw?.rule_id);
  if (explicitRuleId) {
    const explicitRule = getRuleById(explicitRuleId);
    if (explicitRule && explicitRule.source === source && explicitRule.type_key === typeKey && ruleMetaMatchesPayload(explicitRule, payload)) return explicitRule;
  }

  const rows = database.all(`
    SELECT
      r.*,
      s.public_url AS sound_url,
      s.label AS sound_label,
      s.duration_ms AS sound_duration_ms,
      i.public_url AS image_url,
      i.label AS image_label,
      sm.display_name AS sound_media_label,
      sm.duration_ms AS sound_media_duration_ms,
      sm.relative_path AS sound_media_path,
      sm.web_path AS sound_media_url,
      sm.type AS sound_media_type,
      im.display_name AS image_media_label,
      im.relative_path AS image_media_path,
      im.web_path AS image_media_url,
      im.type AS image_media_type
    FROM alert_rules r
    LEFT JOIN alert_assets s ON s.id = r.sound_asset_id AND s.enabled = 1
    LEFT JOIN alert_assets i ON i.id = r.image_asset_id AND i.enabled = 1
    LEFT JOIN media_assets sm ON sm.id = r.sound_media_id AND sm.status = 'active'
    LEFT JOIN media_assets im ON im.id = r.image_media_id AND im.status = 'active'
    WHERE r.enabled = 1
      AND r.source = :source
      AND r.type_key = :typeKey
      AND (r.min_value IS NULL OR r.min_value <= :amount)
      AND (r.max_value IS NULL OR r.max_value >= :amount)
    ORDER BY
      CASE WHEN r.max_value IS NULL THEN 1 ELSE 0 END ASC,
      CASE
        WHEN r.min_value IS NOT NULL AND r.max_value IS NOT NULL THEN (r.max_value - r.min_value)
        ELSE 999999999
      END ASC,
      COALESCE(r.min_value, -999999) DESC,
      r.priority ASC,
      r.id ASC
  `, { source, typeKey, amount }) || [];

  const rule = rows.map(row => ({ ...row, meta: parseJson(row.meta_json, {}) })).find(row => ruleMetaMatchesPayload(row, payload));
  return rule || null;
}

function ruleMetaMatchesPayload(rule, payload) {
  const meta = rule && rule.meta ? rule.meta : parseJson(rule && rule.meta_json, {});
  const match = meta && typeof meta.match === 'object' && !Array.isArray(meta.match) ? meta.match : {};
  if (!match || !Object.keys(match).length) return true;

  const facts = extractAlertMatchFacts(payload);

  if (!matchStringList(match.tier ?? match.tiers, facts.tier)) return false;
  if (!matchStringList(match.tierLabel ?? match.tierLabels, facts.tierLabel)) return false;
  if (!matchBoolean(match.isGift ?? match.is_gift, facts.isGift)) return false;
  if (!matchBoolean(match.isAnonymous ?? match.is_anonymous, facts.isAnonymous)) return false;
  if (!matchNumberRange(match.minTotal ?? match.min_total, match.maxTotal ?? match.max_total, facts.total)) return false;
  if (!matchNumberRange(match.minMonths ?? match.min_months, match.maxMonths ?? match.max_months, facts.months)) return false;
  if (!matchNumberRange(match.minStreakMonths ?? match.min_streak_months, match.maxStreakMonths ?? match.max_streak_months, facts.streakMonths)) return false;
  if (!matchNumberList(match.hypeTrainLevel ?? match.hype_train_level ?? match.hypeTrainLevels ?? match.hype_train_levels, facts.hypeTrainLevel)) return false;

  return true;
}

function extractAlertMatchFacts(payload) {
  const rawEnvelope = payload && payload.raw && typeof payload.raw === 'object' ? payload.raw : {};
  const event = rawEnvelope.raw && typeof rawEnvelope.raw === 'object' ? rawEnvelope.raw : rawEnvelope;
  const nestedEvent = event.event && typeof event.event === 'object' ? event.event : event;

  const tier = cleanText(payload?.tier || rawEnvelope.tier || event.tier || nestedEvent.tier || '');
  const total = nullableNumber(payload?.total ?? rawEnvelope.total ?? event.total ?? nestedEvent.total ?? payload?.amount);
  const months = nullableNumber(payload?.cumulative_months ?? rawEnvelope.cumulative_months ?? event.cumulative_months ?? nestedEvent.cumulative_months ?? payload?.amount);
  const streakMonths = nullableNumber(payload?.streak_months ?? rawEnvelope.streak_months ?? event.streak_months ?? nestedEvent.streak_months);
  const hypeTrainLevel = nullableNumber(payload?.hype_train_level ?? payload?.level ?? rawEnvelope.hype_train_level ?? rawEnvelope.level ?? event.level ?? nestedEvent.level);

  return {
    tier,
    tierLabel: twitchTierLabel(tier),
    total,
    months,
    streakMonths,
    hypeTrainLevel,
    isGift: toBoolOrNull(payload?.is_gift ?? rawEnvelope.is_gift ?? event.is_gift ?? nestedEvent.is_gift),
    isAnonymous: toBoolOrNull(payload?.is_anonymous ?? rawEnvelope.is_anonymous ?? event.is_anonymous ?? nestedEvent.is_anonymous)
  };
}

function twitchTierLabel(tier) {
  const value = String(tier || '').trim();
  if (value === '1000') return 'tier1';
  if (value === '2000') return 'tier2';
  if (value === '3000') return 'tier3';
  if (/prime/i.test(value)) return 'prime';
  return value.toLowerCase();
}

function matchStringList(expected, actual) {
  if (expected === undefined || expected === null || expected === '') return true;
  const values = Array.isArray(expected) ? expected : [expected];
  const normalizedActual = String(actual || '').trim().toLowerCase();
  return values.map(v => String(v || '').trim().toLowerCase()).includes(normalizedActual);
}

function matchNumberList(expected, actual) {
  if (expected === undefined || expected === null || expected === '') return true;
  const n = Number(actual);
  if (!Number.isFinite(n)) return false;
  const values = Array.isArray(expected) ? expected : [expected];
  return values.some(v => Number(v) === n);
}

function matchNumberRange(min, max, actual) {
  if ((min === undefined || min === null || min === '') && (max === undefined || max === null || max === '')) return true;
  const n = Number(actual);
  if (!Number.isFinite(n)) return false;
  if (min !== undefined && min !== null && min !== '' && n < Number(min)) return false;
  if (max !== undefined && max !== null && max !== '' && n > Number(max)) return false;
  return true;
}

function matchBoolean(expected, actual) {
  if (expected === undefined || expected === null || expected === '') return true;
  const expectedBool = toBoolOrNull(expected);
  if (expectedBool === null) return true;
  return actual === expectedBool;
}

function toBoolOrNull(value) {
  if (value === true || value === 'true' || value === 1 || value === '1') return true;
  if (value === false || value === 'false' || value === 0 || value === '0') return false;
  return null;
}

async function processQueue(broadcastWS) {
  if (state.processing || state.current) return;
  if (state.config.enabled === false || state.config.queueEnabled === false) return;
  if (!state.queue.length) return;

  const nextQueued = state.queue[0];
  if (nextQueued && nextQueued.alertBundlePrequeue && nextQueued.alertBundlePrequeue.pending) {
    return;
  }

  state.processing = true;
  const event = state.queue.shift();
  markAlertTiming(event, 'queuePicked');

  try {
    if (event.rule && event.rule.id) event.rule = getRuleById(event.rule.id) || event.rule;
    await enrichEventAvatar(event);
    event.effectiveDurationMs = resolveAlertDurationMs(event.rule);

    // STEP265B_ALERT_SOUND_BUNDLE_USAGE
    // Der Alert wird nicht mehr als Einzel-Sound + spätere Einzel-TTS abgespielt.
    // Stattdessen nutzt das Alert-System das native Sound-System-Bundle.
    event.status = 'waiting_for_sound';
    event.waiting_started_at = nowIso();
    markAlertTiming(event, 'waitingForSound');
    try {
      database.run(`UPDATE alert_events SET status='waiting_for_sound' WHERE event_uid=:eventUid`, {
        eventUid: event.eventUid
      });
    } catch (_) {}

    let ttsResult = (event.alertTts && event.alertTts.attempted) ? event.alertTts : null;
    let soundResult = (event.soundSystem && event.soundSystem.attempted) ? event.soundSystem : null;

    if (!soundResult) {
      const bundleResult = await prepareAndSendAlertSoundBundle(event, { reason: 'fallback_process_queue_missing_prequeue' });
      soundResult = bundleResult && bundleResult.soundResult ? bundleResult.soundResult : null;
      ttsResult = (event.alertTts && event.alertTts.attempted) ? event.alertTts : ttsResult;
    }
    markAlertTiming(event, 'soundBundleReady');

    if (soundResult && soundResult.attempted) {
      event.soundSystem = soundResult;
      persistEventRuntimePayload(event);

      if (!soundResult.ok && state.config.liveAlert && state.config.liveAlert.fallbackShowOnSoundError === false) {
        const finishedAt = nowIso();
        event.status = 'finished';
        event.finished_at = finishedAt;
        event.finishReason = 'sound_system_failed';
        try {
          database.run(`UPDATE alert_events SET status='finished', finished_at=:finishedAt WHERE event_uid=:eventUid`, {
            finishedAt,
            eventUid: event.eventUid
          });
        } catch (_) {}
        state.history.unshift({ ...event });
        state.history = state.history.slice(0, 100);
        state.processing = false;
        setTimeout(() => processQueue(broadcastWS), Math.max(0, Number(state.config.gapBetweenAlertsMs || 0)));
        return;
      }
    }

    if (ttsResult && ttsResult.attempted) {
      event.alertTts = ttsResult;
      extendAlertDurationForTts(event, soundResult, ttsResult);
      persistEventRuntimePayload(event);
    }

    const syncResult = await waitForSoundSystemItemStarted(event, soundResult);
    markAlertTiming(event, 'soundWaitDone');
    if (syncResult && syncResult.persist) {
      persistEventRuntimePayload(event);
    }

    // Erst JETZT ist der Alert wirklich aktiv/spielend.
    state.current = event;
    event.status = 'playing';
    event.started_at = nowIso();
    markAlertTiming(event, 'playing');
    try {
      database.run(`UPDATE alert_events SET status='playing', started_at=:startedAt WHERE event_uid=:eventUid`, {
        startedAt: event.started_at,
        eventUid: event.eventUid
      });
    } catch (_) {}

    persistEventRuntimePayload(event);

    const overlayAlert = buildOverlayAlert(event);
    sendOverlay(broadcastWS, { event: 'play', alert: overlayAlert });
    markAlertTiming(event, 'overlaySent');
    emitAlertBusMirror(event, overlayAlert);
    dispatchAlertChatMessage(event, overlayAlert).catch(err => console.warn('[alert_system] chat message failed:', err && err.message ? err.message : err));

    const duration = event.effectiveDurationMs;
    const fallback = Math.max(duration + Number(state.config.fallbackFinishMs || 12000), duration + 1000);
    clearTimeout(state.finishTimer);
    state.finishTimer = setTimeout(() => finishCurrent('fallback_timeout', broadcastWS), fallback);
    state.processing = false;
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    console.warn('[alert_system] processQueue failed:', msg);

    try {
      event.status = 'failed';
      event.finished_at = nowIso();
      event.finishReason = 'process_queue_failed';
      event.raw = { ...(event.raw || {}), processQueueError: msg };
      database.run(`UPDATE alert_events SET status='failed', finished_at=:finishedAt, payload_json=:payloadJson WHERE event_uid=:eventUid`, {
        finishedAt: event.finished_at,
        payloadJson: JSON.stringify(event.raw || {}),
        eventUid: event.eventUid
      });
    } catch (_) {}

    state.history.unshift({ ...event });
    state.history = state.history.slice(0, 100);
    state.current = null;
    clearTimeout(state.finishTimer);
    state.finishTimer = null;
    state.processing = false;
    setTimeout(() => processQueue(broadcastWS), Math.max(0, Number(state.config.gapBetweenAlertsMs || 0)));
  }
}

// STEP265B_ALERT_SOUND_BUNDLE_USAGE
function soundSystemBundleUrlFromPlayUrl(playUrl) {
  const raw = cleanText(playUrl || DEFAULT_CONFIG.liveAlert.soundSystemPlayUrl);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    url.pathname = url.pathname.replace(/\/play\/?$/i, '/bundle');
    url.search = '';
    return url.toString();
  } catch (_) {
    return raw.replace(/\/play(\?.*)?$/i, '/bundle');
  }
}

function alertBaseSoundPriority(event) {
  const rule = event && event.rule ? event.rule : {};
  const override = event && event.soundSystemPriorityOverride !== undefined ? event.soundSystemPriorityOverride : null;
  return clamp(toInt(override, toInt(rule.sound_priority, toInt(rule.priority, 80))), 0, 1000);
}

function alertRuleSoundMediaId(rule) {
  const raw = rule ? (rule.sound_media_id ?? rule.soundMediaId ?? 0) : 0;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function alertRuleImageMediaId(rule) {
  const raw = rule ? (rule.image_media_id ?? rule.imageMediaId ?? 0) : 0;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function mediaRegistryWebPath(relativePath, explicitWebPath = '') {
  const direct = cleanText(explicitWebPath || '');
  if (direct) return direct.replace(/\\/g, '/');
  const rel = cleanText(relativePath || '').replace(/\\/g, '/').replace(/^\/+/, '');
  if (!rel) return '';
  if (rel.startsWith('assets/')) return `/${rel}`;
  return `/assets/${rel}`;
}

function alertRuleImageUrl(rule) {
  if (!rule) return '';
  const mediaId = alertRuleImageMediaId(rule);
  if (mediaId) return mediaRegistryWebPath(rule.image_media_path || rule.imageMediaPath || '', rule.image_media_url || rule.imageMediaUrl || '');
  return cleanText(rule.image_url || rule.imageUrl || '');
}

function alertRuleImageLabel(rule) {
  if (!rule) return '';
  const mediaId = alertRuleImageMediaId(rule);
  if (mediaId) return cleanText(rule.image_media_label || rule.imageMediaLabel || rule.image_media_path || rule.imageMediaPath || `MediaId ${mediaId}`);
  return cleanText(rule.image_label || rule.imageLabel || '');
}

function alertRuleSoundDurationMs(rule) {
  const mediaId = alertRuleSoundMediaId(rule);
  const mediaDuration = Number(rule && (rule.sound_media_duration_ms ?? rule.soundMediaDurationMs) || 0);
  if (mediaId && Number.isFinite(mediaDuration) && mediaDuration > 0) return mediaDuration;
  const legacyDuration = Number(rule && (rule.sound_duration_ms ?? rule.soundDurationMs) || 0);
  if (Number.isFinite(legacyDuration) && legacyDuration > 0) return legacyDuration;
  return 0;
}

function buildAlertMainBundleItem(event, bundlePriority) {
  const liveCfg = state.config && state.config.liveAlert ? state.config.liveAlert : DEFAULT_CONFIG.liveAlert;
  const rule = event && event.rule ? event.rule : {};
  const mediaId = alertRuleSoundMediaId(rule);
  const publicUrl = cleanText(rule.sound_url || rule.soundUrl || '');
  let file = '';

  if (!mediaId) {
    if (!publicUrl) return null;
    file = soundSystemFileFromPublicUrl(publicUrl);
    if (!file) return null;
  }

  const item = {
    role: 'main',
    ...(mediaId ? { mediaId } : { file }),
    label: cleanText(rule.sound_media_label || rule.soundMediaLabel || rule.sound_label || rule.label || buildDefaultTitle(event) || 'Alert'),
    category: cleanKey(rule.sound_category || liveCfg.soundSystemCategory || 'alert') || 'alert',
    outputTarget: validateSoundOutputTarget(rule.sound_output_target || liveCfg.soundSystemOutputTarget || 'device', 'device'),
    priority: bundlePriority,
    priorityOffset: 0,
    source: cleanKey(liveCfg.soundSystemSource || 'alert_system') || 'alert_system',
    requestedBy: cleanText(event.user_display || event.user_login || ''),
    volume: rule.sound_volume !== null && rule.sound_volume !== undefined && String(rule.sound_volume).trim() !== ''
      ? clamp(toInt(rule.sound_volume, 85), 0, 100)
      : undefined,
    meta: {
      alertEventUid: event.eventUid,
      alertSource: event.source,
      alertType: event.type_key,
      ruleId: rule && rule.id ? rule.id : null,
      soundMediaId: mediaId || null,
      soundMediaDurationMs: alertRuleSoundDurationMs(rule) || null,
      legacySoundFile: file || '',
      legacySoundUrl: publicUrl || '',
      bundleManagedBy: 'alert_system'
    },
    visual: {
      module: 'alert_system',
      type: 'alert',
      alertEventUid: event.eventUid,
      alertSource: event.source,
      alertType: event.type_key,
      user: event.user_display || event.user_login || '',
      showOverlay: true
    }
  };

  return item;
}

function buildAlertTtsBundleItem(event, ttsResult, bundlePriority) {
  if (!event || !ttsResult || !ttsResult.attempted || !ttsResult.ok || !ttsResult.soundSystemFile) return null;
  const liveCfg = state.config && state.config.liveAlert ? state.config.liveAlert : DEFAULT_CONFIG.liveAlert;
  return {
    role: 'tts',
    file: ttsResult.soundSystemFile,
    label: `Alert TTS: ${event.user_display || event.user_login || 'Alert'}`,
    category: cleanKey(liveCfg.ttsSoundCategory || DEFAULT_CONFIG.liveAlert.ttsSoundCategory) || 'tts',
    outputTarget: validateSoundOutputTarget(liveCfg.ttsOutputTarget || liveCfg.soundSystemOutputTarget || DEFAULT_CONFIG.liveAlert.ttsOutputTarget, DEFAULT_CONFIG.liveAlert.ttsOutputTarget),
    priority: Math.max(0, bundlePriority - 1),
    priorityOffset: -1,
    source: cleanKey(liveCfg.ttsSoundSource || DEFAULT_CONFIG.liveAlert.ttsSoundSource) || 'alert_tts',
    requestedBy: cleanText(event.user_display || event.user_login || ''),
    volume: clamp(toInt(liveCfg.ttsSoundVolume, DEFAULT_CONFIG.liveAlert.ttsSoundVolume), 0, 100),
    durationMs: Math.max(0, toInt(ttsResult.durationMs, 0)),
    meta: {
      alertEventUid: event.eventUid,
      alertSource: event.source,
      alertType: event.type_key,
      ruleId: event.rule && event.rule.id ? event.rule.id : null,
      tts: true,
      alertTts: true,
      timing: ttsResult.payload && ttsResult.payload.timing ? ttsResult.payload.timing : 'after_alert',
      bundleManagedBy: 'alert_system'
    },
    visual: {
      module: 'alert_system',
      type: 'alert_tts',
      alertEventUid: event.eventUid,
      alertSource: event.source,
      alertType: event.type_key,
      user: event.user_display || event.user_login || '',
      showOverlay: false
    }
  };
}

function findBundleResultByRole(data, role) {
  const wanted = cleanKey(role || '');
  const results = Array.isArray(data && data.results) ? data.results : [];
  for (const result of results) {
    const item = result && result.item ? result.item : null;
    const itemRole = cleanKey((item && item.bundle && item.bundle.bundleRole) || (item && item.meta && item.meta.bundleRole) || '');
    if (itemRole === wanted) return result;
  }
  return null;
}

function bundlePlayResultFromEntry(entry) {
  if (!entry) return null;
  return {
    started: !!entry.started,
    queued: !!entry.queued,
    dropped: !!entry.dropped,
    parallel: !!entry.parallel,
    queuePosition: Number(entry.queuePosition || 0),
    reason: entry.reason || '',
    retryAfterMs: Number(entry.retryAfterMs || 0)
  };
}

async function postAlertSoundBundle(event, ttsResult, options = {}) {
  const liveCfg = state.config && state.config.liveAlert ? state.config.liveAlert : DEFAULT_CONFIG.liveAlert;
  if (!liveCfg || liveCfg.soundSystemEnabled !== true) return { attempted: false, reason: 'disabled' };

  const playUrl = cleanText(liveCfg.soundSystemPlayUrl || DEFAULT_CONFIG.liveAlert.soundSystemPlayUrl);
  const bundleUrl = soundSystemBundleUrlFromPlayUrl(playUrl);
  if (!bundleUrl) return { attempted: true, ok: false, reason: 'sound_system_bundle_url_missing' };
  if (typeof fetch !== 'function') return { attempted: true, ok: false, reason: 'fetch_unavailable' };

  const bundlePriority = alertBaseSoundPriority(event);
  const items = [];
  const mainItem = buildAlertMainBundleItem(event, bundlePriority);
  if (mainItem) items.push(mainItem);

  const ttsItem = buildAlertTtsBundleItem(event, ttsResult, bundlePriority);
  if (ttsItem) items.push(ttsItem);

  if (!items.length) {
    return {
      attempted: false,
      reason: 'no_alert_sound_or_tts',
      ttsPrepared: !!(ttsResult && ttsResult.ok)
    };
  }

  const bundleId = `alert_${cleanText(event.eventUid || makeEventUid()).replace(/[^a-zA-Z0-9_.:-]/g, '_')}`;
  const body = {
    bundleId,
    bundleType: 'alert',
    locked: true,
    priority: bundlePriority,
    source: cleanKey(liveCfg.soundSystemSource || 'alert_system') || 'alert_system',
    requestedBy: cleanText(event.user_display || event.user_login || ''),
    meta: {
      alertEventUid: event.eventUid,
      alertSource: event.source,
      alertType: event.type_key,
      ruleId: event.rule && event.rule.id ? event.rule.id : null,
      reason: options.reason || ''
    },
    items
  };

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = controller ? setTimeout(() => controller.abort(), Math.max(1000, toInt(liveCfg.fallbackShowAfterMs, 15000))) : null;

  try {
    const res = await fetch(bundleUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller ? controller.signal : undefined
    });
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch (_) { data = { raw: text }; }

    const ok = !!(res.ok && data && data.ok !== false);
    const mainEntry = findBundleResultByRole(data, 'main');
    const ttsEntry = findBundleResultByRole(data, 'tts');
    const primaryEntry = mainEntry || ttsEntry || (Array.isArray(data && data.results) ? data.results[0] : null);
    const primaryItem = primaryEntry && primaryEntry.item ? primaryEntry.item : null;

    if (ttsResult && ttsResult.attempted && ttsItem) {
      ttsResult.playback = {
        attempted: true,
        ok: !!(ok && ttsEntry && !ttsEntry.dropped),
        status: res.status,
        url: bundleUrl,
        file: ttsResult.soundSystemFile,
        bundled: true,
        bundleId,
        result: bundlePlayResultFromEntry(ttsEntry),
        item: ttsEntry && ttsEntry.item ? ttsEntry.item : null,
        error: ok ? '' : (data && (data.error || data.message || data.reason) ? String(data.error || data.message || data.reason) : `sound_system_bundle_http_${res.status}`)
      };
    }

    return {
      attempted: true,
      ok,
      status: res.status,
      url: bundleUrl,
      file: primaryItem && primaryItem.file ? primaryItem.file : (mainItem && mainItem.file) || (ttsItem && ttsItem.file) || '',
      bundled: true,
      bundleId,
      bundle: data && data.bundle ? data.bundle : null,
      results: Array.isArray(data && data.results) ? data.results : [],
      result: bundlePlayResultFromEntry(primaryEntry),
      item: primaryItem,
      mainItem: mainEntry && mainEntry.item ? mainEntry.item : null,
      ttsItem: ttsEntry && ttsEntry.item ? ttsEntry.item : null,
      error: ok ? '' : (data && (data.error || data.message || data.reason) ? String(data.error || data.message || data.reason) : `sound_system_bundle_http_${res.status}`)
    };
  } catch (err) {
    return {
      attempted: true,
      ok: false,
      url: bundleUrl,
      bundled: true,
      error: err && err.message ? err.message : String(err)
    };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function prepareAndSendAlertSoundBundle(event, options = {}) {
  if (!event) return { ok: false, reason: 'missing_event' };
  if (event.alertBundlePrequeue && event.alertBundlePrequeue.pending && options.allowPendingPrequeue !== true) {
    return { ok: false, reason: 'bundle_prequeue_still_pending' };
  }

  if (event.rule && event.rule.id) event.rule = getRuleById(event.rule.id) || event.rule;
  await enrichEventAvatar(event);
  event.effectiveDurationMs = event.effectiveDurationMs || resolveAlertDurationMs(event.rule);

  let ttsResult = (event.alertTts && event.alertTts.attempted) ? event.alertTts : null;
  if (!ttsResult) {
    ttsResult = await prepareAlertTts(event);
    if (ttsResult && ttsResult.attempted) {
      event.alertTts = ttsResult;
      persistEventRuntimePayload(event);
    }
  }

  const soundResult = await postAlertSoundBundle(event, ttsResult, options);
  if (soundResult && soundResult.attempted) {
    event.soundSystem = soundResult;
  }

  if (event.alertTts && event.alertTts.attempted) {
    extendAlertDurationForTts(event, soundResult, event.alertTts);
  }

  persistEventRuntimePayload(event);
  return { ok: !!(soundResult && soundResult.ok), soundResult, ttsResult: event.alertTts || null };
}

function scheduleAlertBundlePrequeue(event, broadcastWS) {
  if (!event) return;
  const liveCfg = state.config && state.config.liveAlert ? state.config.liveAlert : DEFAULT_CONFIG.liveAlert;
  if (liveCfg.soundSystemEnabled !== true) {
    processQueue(broadcastWS);
    return;
  }

  // STEP265D_PARALLEL_IMMEDIATE_ALERT_BUNDLE_PREQUEUE
  // Wichtig: Keine globale Promise-Kette mehr.
  // Jeder eingehende Alert startet seine TTS-/Bundle-Vorbereitung sofort und parallel.
  // Das Sound-System bekommt das Bundle damit so früh wie möglich und kann zentral sortieren.
  if (event.alertBundlePrequeue && event.alertBundlePrequeue.pending) {
    processQueue(broadcastWS);
    return;
  }
  if (event.soundSystem && event.soundSystem.attempted) {
    processQueue(broadcastWS);
    return;
  }

  event.alertBundlePrequeue = {
    pending: true,
    startedAt: nowIso(),
    reason: 'enqueue_immediate_parallel'
  };
  persistEventRuntimePayload(event);

  Promise.resolve()
    .then(async () => {
      const result = await prepareAndSendAlertSoundBundle(event, {
        reason: 'enqueue_immediate_parallel',
        allowPendingPrequeue: true
      });
      const soundResult = result && result.soundResult ? result.soundResult : null;
      event.alertBundlePrequeue = {
        pending: false,
        finishedAt: nowIso(),
        ok: !!(result && result.ok),
        reason: soundResult ? soundResult.error || soundResult.reason || '' : '',
        parallelPrequeue: true,
        bundleId: soundResult && soundResult.bundleId ? soundResult.bundleId : '',
        bundleQueuedAt: soundResult && soundResult.bundle && soundResult.bundle.bundleQueuedAt ? soundResult.bundle.bundleQueuedAt : 0,
        mainDropped: !!(soundResult && soundResult.result && soundResult.result.dropped),
        mainDropReason: soundResult && soundResult.result ? soundResult.result.reason || '' : ''
      };
    })
    .catch(err => {
      event.alertBundlePrequeue = {
        pending: false,
        finishedAt: nowIso(),
        ok: false,
        error: err && err.message ? err.message : String(err),
        parallelPrequeue: true
      };
    })
    .finally(() => {
      persistEventRuntimePayload(event);
      processQueue(broadcastWS);
    });

  processQueue(broadcastWS);
}

async function playLiveAlertSound(event) {
  const liveCfg = state.config && state.config.liveAlert ? state.config.liveAlert : DEFAULT_CONFIG.liveAlert;
  if (!liveCfg || liveCfg.soundSystemEnabled !== true) return { attempted: false, reason: 'disabled' };
  const rule = event && event.rule ? event.rule : {};
  const mediaId = alertRuleSoundMediaId(rule);
  const publicUrl = cleanText(rule.sound_url || rule.soundUrl || '');
  let file = '';

  if (!mediaId) {
    if (!publicUrl) return { attempted: false, reason: 'no_sound_reference' };
    file = soundSystemFileFromPublicUrl(publicUrl);
    if (!file) return { attempted: true, ok: false, reason: 'invalid_sound_url', publicUrl };
  }

  const params = new URLSearchParams();
  if (mediaId) params.set('mediaId', String(mediaId));
  else params.set('file', file);
  params.set('label', cleanText(rule.sound_label || rule.label || buildDefaultTitle(event) || 'Alert'));
  params.set('category', cleanKey(rule.sound_category || liveCfg.soundSystemCategory || 'alert') || 'alert');
  params.set('priority', String(toInt(rule.sound_priority, toInt(rule.priority, 80))));
  params.set('outputTarget', validateSoundOutputTarget(rule.sound_output_target || liveCfg.soundSystemOutputTarget || 'device', 'device'));
  params.set('source', cleanKey(liveCfg.soundSystemSource || 'alert_system') || 'alert_system');
  params.set('requestedBy', cleanText(event.user_display || event.user_login || ''));
  if (rule.sound_volume !== null && rule.sound_volume !== undefined && String(rule.sound_volume).trim() !== '') {
    params.set('volume', String(clamp(toInt(rule.sound_volume, 85), 0, 100)));
  }

  const playUrl = cleanText(liveCfg.soundSystemPlayUrl || DEFAULT_CONFIG.liveAlert.soundSystemPlayUrl);
  const url = `${playUrl}${playUrl.includes('?') ? '&' : '?'}${params.toString()}`;
  let timeout = null;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;

  try {
    if (controller) timeout = setTimeout(() => controller.abort(), Math.max(1000, toInt(liveCfg.fallbackShowAfterMs, 15000)));
    const res = await fetch(url, { method: 'GET', signal: controller ? controller.signal : undefined });
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch (_) { data = { raw: text }; }
    const ok = !!(res.ok && data && data.ok !== false);
    return {
      attempted: true,
      ok,
      status: res.status,
      url: playUrl,
      file,
      mediaId: mediaId || null,
      result: data && data.result ? data.result : null,
      item: data && data.item ? data.item : null,
      error: ok ? '' : (data && (data.error || data.message) ? String(data.error || data.message) : `sound_system_http_${res.status}`)
    };
  } catch (err) {
    return {
      attempted: true,
      ok: false,
      file,
      mediaId: mediaId || null,
      url: playUrl,
      error: err && err.message ? err.message : String(err)
    };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function soundSystemFileFromPublicUrl(publicUrl) {
  let raw = cleanText(publicUrl || '').replace(/\\/g, '/');
  if (!raw) return '';
  try {
    const parsed = new URL(raw, 'http://127.0.0.1');
    raw = parsed.pathname || raw;
  } catch (_) {}
  raw = raw.replace(/^\/+/, '');
  const prefix = 'assets/sounds/';
  if (raw.toLowerCase().startsWith(prefix)) raw = raw.slice(prefix.length);
  return raw.replace(/^\/+/, '');
}

function persistEventRuntimePayload(event) {
  if (!event || !event.eventUid) return;
  try {
    const raw = { ...(event.raw || {}) };
    if (event.soundSystem) raw.soundSystem = event.soundSystem;
    if (event.alertTts) raw.alertTts = event.alertTts;
    event.raw = raw;
    database.run(`UPDATE alert_events SET payload_json=:payloadJson WHERE event_uid=:eventUid`, {
      payloadJson: JSON.stringify(raw),
      eventUid: event.eventUid
    });
  } catch (_) {}
}

// STEP264A_ALERT_SOUND_QUEUE_SYNC
// HÃ¤lt Alert-Anzeige und Alert-Sound synchron, wenn der Sound im Sound-System erst in der Queue landet.
function soundSystemPlayResult(soundResult) {
  return soundResult && soundResult.result && typeof soundResult.result === 'object' ? soundResult.result : {};
}

function soundSystemItem(soundResult) {
  return soundResult && soundResult.item && typeof soundResult.item === 'object' ? soundResult.item : null;
}

function soundSystemRequestId(soundResult) {
  const item = soundSystemItem(soundResult);
  return cleanText((item && item.requestId) || soundResult?.requestId || '');
}

function soundSystemStatusUrlFromPlayUrl(playUrl) {
  const raw = cleanText(playUrl || DEFAULT_CONFIG.liveAlert.soundSystemPlayUrl);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    url.pathname = url.pathname.replace(/\/play\/?$/i, '/status');
    url.search = '';
    return url.toString();
  } catch (_) {
    return raw.replace(/\/play(\?.*)?$/i, '/status');
  }
}

function applySoundSystemDurationToAlert(event, item, reason = 'sound_system_item') {
  if (!event || !item) return { applied: false, reason: 'missing_event_or_item' };

  const soundDurationMs = Number(item.durationMs || 0);
  if (!Number.isFinite(soundDurationMs) || soundDurationMs <= 0) {
    return { applied: false, reason: 'missing_sound_duration' };
  }

  const outroMs = Math.max(0, Number(item.outroMs || 0));
  const paddingMs = Math.max(0, Number(state.config.soundDurationPaddingMs || 1200));
  const minMs = Number(state.config.minAutoDurationMs || 4000);
  const maxMs = Number(state.config.maxAutoDurationMs || 60000);
  const requiredMs = clamp(soundDurationMs + outroMs + paddingMs, minMs, maxMs);
  const beforeMs = Number(event.effectiveDurationMs || 0);

  if (requiredMs > beforeMs) {
    event.effectiveDurationMs = requiredMs;
  }

  return {
    applied: requiredMs > beforeMs,
    reason,
    beforeMs,
    afterMs: Number(event.effectiveDurationMs || beforeMs),
    soundDurationMs,
    outroMs,
    paddingMs,
    requiredMs,
    requestId: cleanText(item.requestId || '')
  };
}

async function fetchSoundSystemStatus(statusUrl) {
  if (!statusUrl || typeof fetch !== 'function') return null;
  const response = await fetch(statusUrl, { method: 'GET' });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (_) {
    return null;
  }
}

function findSoundSystemActiveItem(status, requestId) {
  if (!status || !requestId) return null;
  if (status.current && status.current.requestId === requestId) return status.current;
  const parallel = Array.isArray(status.parallel) ? status.parallel : [];
  return parallel.find(item => item && item.requestId === requestId) || null;
}

async function waitForSoundSystemItemStarted(event, soundResult) {
  if (!soundResult || soundResult.attempted !== true || soundResult.ok !== true) {
    return { attempted: false, persist: false, reason: 'sound_not_attempted_or_failed' };
  }

  const liveCfg = state.config && state.config.liveAlert ? state.config.liveAlert : DEFAULT_CONFIG.liveAlert;
  const result = soundSystemPlayResult(soundResult);
  const initialItem = soundSystemItem(soundResult);
  const requestId = soundSystemRequestId(soundResult);

  const initialDuration = applySoundSystemDurationToAlert(event, initialItem, 'play_response');
  soundResult.durationSync = initialDuration;

  if (!requestId) {
    soundResult.waitForStart = { attempted: false, reason: 'missing_request_id' };
    return { attempted: false, persist: true, reason: 'missing_request_id' };
  }

  if (result.started === true || result.parallel === true) {
    soundResult.waitForStart = {
      attempted: true,
      waited: false,
      started: true,
      reason: 'already_started',
      requestId
    };
    return { attempted: true, persist: true, started: true, reason: 'already_started', requestId };
  }

  if (result.queued !== true) {
    soundResult.waitForStart = {
      attempted: false,
      waited: false,
      started: false,
      reason: 'not_queued',
      requestId
    };
    return { attempted: false, persist: true, reason: 'not_queued', requestId };
  }

  if (liveCfg.waitForSoundItemStarted === false) {
    soundResult.waitForStart = {
      attempted: false,
      waited: false,
      started: false,
      reason: 'wait_disabled',
      requestId
    };
    return { attempted: false, persist: true, reason: 'wait_disabled', requestId };
  }

  // STEP264B_ALERT_SOUND_QUEUE_LONG_WAIT
  // Queue-Wartezeit ist bewusst getrennt vom Fehler-Fallback.
  // fallbackShowAfterMs bleibt fÃ¼r echte Sound-System-Fehler; queued Sounds dÃ¼rfen deutlich lÃ¤nger warten.
  const timeoutMs = Math.max(
    1000,
    toInt(
      liveCfg.soundStartWaitTimeoutMs,
      Math.max(300000, toInt(liveCfg.fallbackShowAfterMs, DEFAULT_CONFIG.liveAlert.fallbackShowAfterMs))
    )
  );
  const pollMs = clamp(toInt(liveCfg.soundStartPollIntervalMs, 150), 100, 1000);
  const statusUrl = soundSystemStatusUrlFromPlayUrl(liveCfg.soundSystemPlayUrl || DEFAULT_CONFIG.liveAlert.soundSystemPlayUrl);
  const startedWaitingAt = Date.now();

  while ((Date.now() - startedWaitingAt) < timeoutMs) {
    await sleepMs(pollMs);

    let status = null;
    try {
      status = await fetchSoundSystemStatus(statusUrl);
    } catch (err) {
      soundResult.waitForStart = {
        attempted: true,
        waited: true,
        started: false,
        reason: 'status_fetch_failed',
        requestId,
        statusUrl,
        error: err && err.message ? err.message : String(err),
        waitedMs: Date.now() - startedWaitingAt
      };
      return { attempted: true, persist: true, started: false, reason: 'status_fetch_failed', requestId };
    }

    const activeItem = findSoundSystemActiveItem(status, requestId);
    if (activeItem) {
      soundResult.item = activeItem;
      soundResult.waitForStart = {
        attempted: true,
        waited: true,
        started: true,
        reason: 'matched_active_item',
        requestId,
        waitedMs: Date.now() - startedWaitingAt,
        statusUrl
      };
      soundResult.durationSync = applySoundSystemDurationToAlert(event, activeItem, 'matched_active_item');
      return { attempted: true, persist: true, started: true, reason: 'matched_active_item', requestId };
    }
  }

  soundResult.waitForStart = {
    attempted: true,
    waited: true,
    started: false,
    timeout: true,
    reason: 'timeout',
    requestId,
    waitedMs: Date.now() - startedWaitingAt,
    timeoutMs,
    statusUrl
  };
  return { attempted: true, persist: true, started: false, timeout: true, reason: 'timeout', requestId };
}

async function prepareAlertTts(event) {
  const rule = event && event.rule ? event.rule : {};
  const ttsPayload = buildTtsPayload(event, rule);
  if (!ttsPayload) return { attempted: false, enabled: false, reason: 'rule_tts_disabled' };
  if (ttsPayload.enabled === false) return { attempted: true, enabled: false, reason: ttsPayload.reason || 'not_applicable', payload: ttsPayload };

  const liveCfg = state.config && state.config.liveAlert ? state.config.liveAlert : DEFAULT_CONFIG.liveAlert;
  const prepareUrl = cleanText(liveCfg.ttsPrepareUrl || DEFAULT_CONFIG.liveAlert.ttsPrepareUrl);
  if (!prepareUrl) return { attempted: true, enabled: true, ok: false, reason: 'tts_prepare_url_missing', payload: ttsPayload };
  if (typeof fetch !== 'function') return { attempted: true, enabled: true, ok: false, reason: 'fetch_unavailable', payload: ttsPayload };

  const body = {
    text: ttsPayload.text,
    user: event.user_display || event.user_login || 'Alert',
    userLogin: event.user_login || '',
    userDisplay: event.user_display || '',
    source: 'alert',
    meta: {
      provider: event.source,
      source: event.source,
      type: event.type_key,
      type_key: event.type_key,
      eventUid: event.eventUid,
      ruleId: rule.id || null,
      timing: ttsPayload.timing || 'after_alert',
      mode: ttsPayload.mode || 'audio_only'
    }
  };

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = controller ? setTimeout(() => controller.abort(), Math.max(1000, toInt(liveCfg.ttsPrepareTimeoutMs, DEFAULT_CONFIG.liveAlert.ttsPrepareTimeoutMs))) : null;

  try {
    const res = await fetch(prepareUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller ? controller.signal : undefined
    });
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch (_) { data = { raw: text }; }
    const ok = !!(res.ok && data && data.ok !== false);
    return {
      attempted: true,
      enabled: true,
      ok,
      status: res.status,
      prepareUrl,
      payload: ttsPayload,
      text: ttsPayload.text,
      audioUrl: data && data.audioUrl ? data.audioUrl : '',
      audioFile: data && data.audioFile ? data.audioFile : '',
      soundSystemFile: data && data.soundSystemFile ? data.soundSystemFile : '',
      durationMs: toInt(data && data.durationMs, 0),
      durationOk: !!(data && data.durationOk),
      startAfterMs: toInt(data && data.startAfterMs, 0),
      endsAfterMs: toInt(data && data.endsAfterMs, 0),
      outroBufferMs: toInt(data && data.outroBufferMs, 0),
      voice: data && data.voice ? data.voice : '',
      voiceLabel: data && data.voiceLabel ? data.voiceLabel : '',
      engine: data && data.engine ? data.engine : '',
      error: ok ? '' : (data && (data.error || data.reason || data.message) ? String(data.error || data.reason || data.message) : `tts_prepare_http_${res.status}`)
    };
  } catch (err) {
    return {
      attempted: true,
      enabled: true,
      ok: false,
      prepareUrl,
      payload: ttsPayload,
      text: ttsPayload.text,
      error: err && err.message ? err.message : String(err)
    };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function getMainAlertSoundDurationMs(event, soundResult) {
  const fromSoundItem = Number(soundResult && soundResult.item && soundResult.item.durationMs || 0);
  if (Number.isFinite(fromSoundItem) && fromSoundItem > 0) return fromSoundItem;
  const fromRuleSound = alertRuleSoundDurationMs(event && event.rule ? event.rule : {});
  if (Number.isFinite(fromRuleSound) && fromRuleSound > 0) return fromRuleSound;
  const fromEvent = Number(event && event.effectiveDurationMs || 0);
  if (Number.isFinite(fromEvent) && fromEvent > 0) return fromEvent;
  return Number(state.config.defaultDurationMs || 7000);
}

function getAlertTtsDelayMs(event, soundResult, ttsResult) {
  if (!ttsResult || !ttsResult.ok || !ttsResult.soundSystemFile) return 0;
  const liveCfg = state.config && state.config.liveAlert ? state.config.liveAlert : DEFAULT_CONFIG.liveAlert;
  const timing = ttsResult.payload && ttsResult.payload.timing ? ttsResult.payload.timing : 'after_alert';
  if (timing === 'before_alert') return 0;
  if (timing === 'with_alert') return Math.max(0, toInt(ttsResult.startAfterMs, 0));
  const soundDuration = getMainAlertSoundDurationMs(event, soundResult);
  const afterSoundDelay = toInt(liveCfg.ttsAfterSoundDelayMs, DEFAULT_CONFIG.liveAlert.ttsAfterSoundDelayMs);
  return Math.max(0, soundDuration + afterSoundDelay + Math.max(0, toInt(ttsResult.startAfterMs, 0)));
}

function extendAlertDurationForTts(event, soundResult, ttsResult) {
  if (!event || !ttsResult || !ttsResult.ok || !ttsResult.soundSystemFile) return;
  const delayMs = getAlertTtsDelayMs(event, soundResult, ttsResult);
  const ttsDuration = Math.max(0, toInt(ttsResult.durationMs, 0));
  const outroBuffer = Math.max(0, toInt(ttsResult.outroBufferMs, 0));
  const requiredDuration = delayMs + ttsDuration + outroBuffer;
  if (requiredDuration > Number(event.effectiveDurationMs || 0)) {
    event.effectiveDurationMs = requiredDuration;
  }
  ttsResult.playAfterMs = delayMs;
  ttsResult.extendedAlertDurationMs = event.effectiveDurationMs;
}

async function dispatchPreparedAlertTts(event, ttsResult, soundResult) {
  if (!event || !ttsResult || !ttsResult.attempted || !ttsResult.ok || !ttsResult.soundSystemFile) return;

  const liveCfg = state.config && state.config.liveAlert ? state.config.liveAlert : DEFAULT_CONFIG.liveAlert;
  const timing = ttsResult.payload && ttsResult.payload.timing ? ttsResult.payload.timing : 'after_alert';
  const delayMs = Math.max(0, toInt(ttsResult.playAfterMs, getAlertTtsDelayMs(event, soundResult, ttsResult)));

  // STEP264D_ALERT_TTS_QUEUE_SYNC_FIX
  // Bei after_alert muss TTS frueh in die Sound-System-Queue.
  // Sonst startet nach dem Alert-Sound bereits das naechste VIP-/SoundAlert-Item,
  // bevor TTS ueberhaupt queued wurde.
  const queueEarlyAfterAlert = timing === 'after_alert' && liveCfg.ttsQueueEarlyAfterAlert !== false;

  if (!queueEarlyAfterAlert && delayMs > 0) {
    await sleepMs(delayMs);
  }

  if (!state.current || state.current.eventUid !== event.eventUid) {
    ttsResult.playback = { attempted: false, skipped: true, reason: 'alert_not_current', queueEarlyAfterAlert, delayMs };
    persistEventRuntimePayload(event);
    return;
  }

  const playback = await playAlertTtsSound(event, ttsResult, { queueEarlyAfterAlert, originalDelayMs: delayMs });
  ttsResult.playback = playback;
  persistEventRuntimePayload(event);
}

function resolveAlertTtsSoundPriority(event, liveCfg) {
  const cfg = liveCfg || (state.config && state.config.liveAlert ? state.config.liveAlert : DEFAULT_CONFIG.liveAlert);
  const configured = clamp(toInt(cfg.ttsSoundPriority, DEFAULT_CONFIG.liveAlert.ttsSoundPriority), 0, 1000);

  if (cfg.ttsUseAlertPriority === false) return configured;

  const rule = event && event.rule ? event.rule : {};
  const alertPriority = clamp(toInt(rule.sound_priority, toInt(rule.priority, 80)), 0, 1000);

  // TTS gehoert logisch zum Alert, soll aber echte gleichhohe/neue Alerts nicht ueberholen.
  // Beispiel: Alert 100 -> TTS 99, Alert 80 -> TTS 79.
  const alertLinked = Math.max(0, alertPriority - 1);
  return clamp(Math.max(configured, alertLinked), 0, 1000);
}

async function playAlertTtsSound(event, ttsResult, options = {}) {
  const liveCfg = state.config && state.config.liveAlert ? state.config.liveAlert : DEFAULT_CONFIG.liveAlert;
  const playUrl = cleanText(liveCfg.soundSystemPlayUrl || DEFAULT_CONFIG.liveAlert.soundSystemPlayUrl);
  if (!playUrl) return { attempted: true, ok: false, reason: 'sound_system_play_url_missing' };
  if (typeof fetch !== 'function') return { attempted: true, ok: false, reason: 'fetch_unavailable' };

  const body = {
    file: ttsResult.soundSystemFile,
    label: `Alert TTS: ${event.user_display || event.user_login || 'Alert'}`,
    source: cleanKey(liveCfg.ttsSoundSource || DEFAULT_CONFIG.liveAlert.ttsSoundSource) || 'alert_tts',
    category: cleanKey(liveCfg.ttsSoundCategory || DEFAULT_CONFIG.liveAlert.ttsSoundCategory) || 'tts',
    outputTarget: validateSoundOutputTarget(liveCfg.ttsOutputTarget || liveCfg.soundSystemOutputTarget || DEFAULT_CONFIG.liveAlert.ttsOutputTarget, DEFAULT_CONFIG.liveAlert.ttsOutputTarget),
    priority: resolveAlertTtsSoundPriority(event, liveCfg),
    volume: clamp(toInt(liveCfg.ttsSoundVolume, DEFAULT_CONFIG.liveAlert.ttsSoundVolume), 0, 100),
    requestedBy: cleanText(event.user_display || event.user_login || ''),
    meta: {
      alertEventUid: event.eventUid,
      alertSource: event.source,
      alertType: event.type_key,
      ruleId: event.rule && event.rule.id ? event.rule.id : null,
      queueEarlyAfterAlert: !!options.queueEarlyAfterAlert,
      originalDelayMs: Math.max(0, toInt(options.originalDelayMs, 0))
    }
  };

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = controller ? setTimeout(() => controller.abort(), Math.max(1000, toInt(liveCfg.ttsPlaybackTimeoutMs, DEFAULT_CONFIG.liveAlert.ttsPlaybackTimeoutMs))) : null;

  try {
    const res = await fetch(playUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller ? controller.signal : undefined
    });
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch (_) { data = { raw: text }; }
    const ok = !!(res.ok && data && data.ok !== false);
    return {
      attempted: true,
      ok,
      status: res.status,
      url: playUrl,
      file: ttsResult.soundSystemFile,
      result: data && data.result ? data.result : null,
      item: data && data.item ? data.item : null,
      error: ok ? '' : (data && (data.error || data.message || data.reason) ? String(data.error || data.message || data.reason) : `sound_system_http_${res.status}`)
    };
  } catch (err) {
    return {
      attempted: true,
      ok: false,
      url: playUrl,
      file: ttsResult.soundSystemFile,
      error: err && err.message ? err.message : String(err)
    };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function sleepMs(ms) {
  const delay = Math.max(0, toInt(ms, 0));
  if (!delay) return Promise.resolve();
  return new Promise(resolve => setTimeout(resolve, delay));
}

// STEP264E_ALERT_BUNDLE_FINISH_SYNC
// Ein Alert darf erst beendet werden, wenn seine zugehoerigen Sound-System-Items fertig sind.
function soundSystemStatusUrlForAlertBundle() {
  const liveCfg = state.config && state.config.liveAlert ? state.config.liveAlert : DEFAULT_CONFIG.liveAlert;
  const raw = cleanText(liveCfg.soundSystemStatusUrl || '');
  if (raw) return raw;
  return soundSystemStatusUrlFromPlayUrl(liveCfg.soundSystemPlayUrl || DEFAULT_CONFIG.liveAlert.soundSystemPlayUrl);
}

function collectAlertBundleRequestIds(alert) {
  const ids = [];
  const add = (value) => {
    const id = cleanText(value || '');
    if (id && !ids.includes(id)) ids.push(id);
  };

  if (!alert || typeof alert !== 'object') return ids;

  const soundSystem = alert.soundSystem || {};
  add(soundSystem.requestId);
  add(soundSystem.item && soundSystem.item.requestId);
  add(soundSystem.result && soundSystem.result.requestId);

  const tts = alert.alertTts || {};
  const playback = tts.playback || {};
  add(playback.requestId);
  add(playback.item && playback.item.requestId);
  add(playback.result && playback.result.requestId);

  // Fallbacks aus persistierten Rohdaten.
  const raw = alert.raw || {};
  const rawSoundSystem = raw.soundSystem || {};
  add(rawSoundSystem.requestId);
  add(rawSoundSystem.item && rawSoundSystem.item.requestId);

  const rawTts = raw.alertTts || {};
  const rawPlayback = rawTts.playback || {};
  add(rawPlayback.requestId);
  add(rawPlayback.item && rawPlayback.item.requestId);

  return ids;
}

function alertExpectsTtsButPlaybackNotResolved(alert) {
  if (!alert || !alert.alertTts) return false;
  const tts = alert.alertTts;
  if (!tts.attempted || !tts.ok || !tts.soundSystemFile) return false;
  if (!tts.playback) return true;
  if (tts.playback.skipped || tts.playback.ok === false) return false;
  const item = tts.playback.item || {};
  return !cleanText(item.requestId || tts.playback.requestId || '');
}

function soundSystemStatusHasRequestId(status, requestId) {
  const id = cleanText(requestId || '');
  if (!status || !id) return false;

  const candidates = [];
  if (status.current) candidates.push(status.current);
  if (Array.isArray(status.parallel)) candidates.push(...status.parallel);
  if (Array.isArray(status.queue)) candidates.push(...status.queue);

  return candidates.some(item => item && cleanText(item.requestId || item.id || '') === id);
}

async function alertBundleIsStillActive(alert) {
  const ids = collectAlertBundleRequestIds(alert);
  if (alertExpectsTtsButPlaybackNotResolved(alert)) {
    return {
      active: true,
      reason: 'tts_playback_not_resolved',
      ids
    };
  }

  if (!ids.length) {
    return {
      active: false,
      reason: 'no_bundle_request_ids',
      ids
    };
  }

  const url = soundSystemStatusUrlForAlertBundle();
  if (!url || typeof fetch !== 'function') {
    return {
      active: false,
      reason: 'status_unavailable',
      ids,
      url
    };
  }

  try {
    const status = await fetchSoundSystemStatus(url);
    const activeIds = ids.filter(id => soundSystemStatusHasRequestId(status, id));
    return {
      active: activeIds.length > 0,
      reason: activeIds.length > 0 ? 'bundle_items_still_active' : 'bundle_items_finished',
      ids,
      activeIds,
      url
    };
  } catch (err) {
    return {
      active: false,
      reason: 'status_fetch_failed',
      ids,
      url,
      error: err && err.message ? err.message : String(err)
    };
  }
}

function scheduleFinishCurrentRetry(reason, broadcastWS, bundleState) {
  const liveCfg = state.config && state.config.liveAlert ? state.config.liveAlert : DEFAULT_CONFIG.liveAlert;
  const pollMs = clamp(toInt(liveCfg.bundleFinishPollMs, 350), 150, 2000);
  const maxWaitMs = Math.max(1000, toInt(liveCfg.bundleFinishMaxWaitMs, 300000));

  if (!state.current) return false;

  const now = Date.now();
  if (!state.current.bundleFinishWait) {
    state.current.bundleFinishWait = {
      startedAt: now,
      startedAtIso: nowIso(),
      retryCount: 0,
      originalReason: reason
    };
  }

  state.current.bundleFinishWait.retryCount += 1;
  state.current.bundleFinishWait.lastAt = now;
  state.current.bundleFinishWait.lastAtIso = nowIso();
  state.current.bundleFinishWait.lastBundleState = bundleState || {};

  const waitedMs = now - Number(state.current.bundleFinishWait.startedAt || now);
  if (waitedMs >= maxWaitMs) {
    state.current.bundleFinishWait.timedOut = true;
    state.current.bundleFinishWait.waitedMs = waitedMs;
    return false;
  }

  clearTimeout(state.finishTimer);
  state.finishTimer = setTimeout(() => finishCurrent('bundle_wait_retry', broadcastWS), pollMs);
  return true;
}

function finishCurrent(reason, broadcastWS) {
  if (!state.current) return;

  const current = state.current;

  alertBundleIsStillActive(current).then(bundleState => {
    if (!state.current || state.current.eventUid !== current.eventUid) return;

    if (bundleState && bundleState.active) {
      const scheduled = scheduleFinishCurrentRetry(reason, broadcastWS, bundleState);
      if (scheduled) {
        current.bundleFinishState = bundleState;
        persistEventRuntimePayload(current);
        return;
      }
    }

    const finishReason = bundleState && bundleState.active ? 'bundle_wait_timeout' : reason;
    const finished = { ...state.current, finished_at: nowIso(), finishReason, bundleFinishState: bundleState || null };
    try {
      const raw = { ...(finished.raw || {}) };
      raw.bundleFinishState = bundleState || null;
      database.run(`UPDATE alert_events SET status='finished', finished_at=:finishedAt, payload_json=:payloadJson WHERE event_uid=:eventUid`, {
        finishedAt: finished.finished_at,
        payloadJson: JSON.stringify(raw),
        eventUid: finished.eventUid
      });
    } catch (_) {
      database.run(`UPDATE alert_events SET status='finished', finished_at=:finishedAt WHERE event_uid=:eventUid`, { finishedAt: finished.finished_at, eventUid: finished.eventUid });
    }

    state.history.unshift(finished);
    state.history = state.history.slice(0, 100);
    state.current = null;
    clearTimeout(state.finishTimer);
    state.finishTimer = null;
    sendOverlay(broadcastWS, { event: 'finished', alertId: finished.eventUid, reason: finishReason });
    setTimeout(() => processQueue(broadcastWS), Math.max(0, Number(state.config.gapBetweenAlertsMs || 0)));
  }).catch(err => {
    console.warn('[alert_system] bundle finish check failed:', err && err.message ? err.message : err);

    if (!state.current || state.current.eventUid !== current.eventUid) return;
    const finished = { ...state.current, finished_at: nowIso(), finishReason: reason, bundleFinishError: err && err.message ? err.message : String(err) };
    database.run(`UPDATE alert_events SET status='finished', finished_at=:finishedAt WHERE event_uid=:eventUid`, { finishedAt: finished.finished_at, eventUid: finished.eventUid });
    state.history.unshift(finished);
    state.history = state.history.slice(0, 100);
    state.current = null;
    clearTimeout(state.finishTimer);
    state.finishTimer = null;
    sendOverlay(broadcastWS, { event: 'finished', alertId: finished.eventUid, reason });
    setTimeout(() => processQueue(broadcastWS), Math.max(0, Number(state.config.gapBetweenAlertsMs || 0)));
  });
}

async function enrichEventAvatar(event) {
  if (!event || event.source !== 'twitch') return event;
  if (cleanText(event.avatar_url || '')) return event;
  if (state.config.avatarResolveEnabled === false) return event;
  const login = cleanKey(event.user_login || (event.raw && (event.raw.userLogin || event.raw.login)) || event.user_display || '');
  if (!login) return event;
  const avatarUrl = await resolveTwitchAvatarUrl(login);
  if (!avatarUrl) return event;
  event.avatar_url = avatarUrl;
  event.raw = { ...(event.raw || {}), avatarUrl };
  try {
    database.run(`UPDATE alert_events SET payload_json=:payloadJson WHERE event_uid=:eventUid`, {
      eventUid: event.eventUid,
      payloadJson: JSON.stringify(event.raw || {})
    });
  } catch (_) {}
  return event;
}

async function resolveTwitchAvatarUrl(loginRaw) {
  const login = cleanKey(loginRaw || '').toLowerCase();
  if (!login) return '';
  const now = Date.now();
  const cacheMs = Math.max(0, Number(state.config.avatarResolveCacheMs || 3600000));
  const cached = state.avatarCache.get(login);
  if (cached && (now - cached.at) < cacheMs) return cached.url || '';

  const base = cleanText(state.config.avatarResolveUserinfoUrl || DEFAULT_CONFIG.avatarResolveUserinfoUrl);
  if (!base || typeof fetch !== 'function') return '';
  const url = buildUserinfoUrl(base, login);
  let timeout = null;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  try {
    if (controller) timeout = setTimeout(() => controller.abort(), Math.max(500, Number(state.config.avatarResolveTimeoutMs || 2500)));
    const res = await fetch(url, { signal: controller ? controller.signal : undefined });
    if (!res.ok) throw new Error(`userinfo_http_${res.status}`);
    const json = await res.json();
    const avatarUrl = extractAvatarUrl(json);
    state.avatarCache.set(login, { at: now, url: avatarUrl || '' });
    return avatarUrl || '';
  } catch (_) {
    state.avatarCache.set(login, { at: now, url: '' });
    return '';
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function buildUserinfoUrl(base, login) {
  try {
    const url = new URL(base);
    if (!url.searchParams.has('login') && !url.searchParams.has('user') && !url.searchParams.has('username')) {
      url.searchParams.set('login', login);
    }
    return url.toString();
  } catch (_) {
    const sep = String(base).includes('?') ? '&' : '?';
    return `${base}${sep}login=${encodeURIComponent(login)}`;
  }
}

function extractAvatarUrl(json) {
  if (!json || typeof json !== 'object') return '';
  const candidates = [
    json.profile_image_url,
    json.profileImageUrl,
    json.avatarUrl,
    json.avatar_url,
    json.user && json.user.profile_image_url,
    json.user && json.user.profileImageUrl,
    Array.isArray(json.data) && json.data[0] && json.data[0].profile_image_url,
    json.data && !Array.isArray(json.data) && json.data.profile_image_url,
    json.result && json.result.profile_image_url
  ];
  for (const value of candidates) {
    const url = cleanText(value || '');
    if (/^https?:\/\//i.test(url)) return url;
  }
  return '';
}

function resolveEventCelebration(event, rule = {}, displaySettings = {}) {
  const raw = event && event.raw && typeof event.raw === 'object' ? event.raw : {};
  const explicit = raw.celebration ?? raw.previewCelebration ?? raw.preview_celebration ?? raw.meta?.celebration;
  if (explicit !== undefined && explicit !== null && String(explicit).trim() !== '') return validateCelebration(explicit);

  const fromProfile = displaySettings.previewCelebration ?? displaySettings.preview_celebration;
  const profileCelebration = validateCelebration(fromProfile || 'none');
  if (profileCelebration !== 'none') return profileCelebration;

  const legacyRuleCelebration = validateCelebration(rule.meta?.celebration || 'none');
  if (legacyRuleCelebration !== 'none') return legacyRuleCelebration;

  return 'none';
}

function buildOverlayAlert(event) {
  const rule = event.rule || {};
  const text = buildOverlayText(event, rule);
  const displayProfile = resolveDisplayProfile(event, rule);
  const durationMs = Number(event.effectiveDurationMs || 0) > 0 ? Number(event.effectiveDurationMs) : resolveAlertDurationMs(rule);
  const alert = {
    id: event.eventUid,
    source: event.source,
    provider: event.source,
    type: event.type_key,
    tier: 'normal',
    title: text.title,
    headline: text.headline,
    value: text.value,
    subline: text.subline,
    message: text.message,
    user: event.user_display,
    userDisplayName: event.user_display,
    login: event.user_login,
    userLogin: event.user_login,
    amount: event.amount,
    amountFormatted: text.context.amountFormatted || '',
    currency: text.context.currency || '',
    avatarUrl: event.avatar_url,
    providerLogoUrl: text.providerLogoUrl,
    display: displayProfile,
    defaultIconUrl: defaultIconUrl(event.source, event.type_key),
    durationMs,
    introMs: toInt(text.context.introMs, toInt(rule.meta?.introMs, Number(state.config.defaultIntroMs || 700))),
    outroMs: toInt(text.context.outroMs, toInt(rule.meta?.outroMs, Number(state.config.defaultOutroMs || 600))),
    durationMode: rule.duration_mode || 'fixed',
    soundDurationMs: alertRuleSoundDurationMs(rule),
    soundSystem: event.soundSystem || null,
    animation: rule.animation || 'neon_card',
    imageMode: rule.image_mode || 'none',
    celebration: resolveEventCelebration(event, rule, displayProfile.settings),
    soundUrl: rule.sound_url || '',
    imageUrl: alertRuleImageUrl(rule),
    imageLabel: alertRuleImageLabel(rule),
    badgeImageUrl: alertRuleImageUrl(rule),
    ruleId: rule.id || null,
    textVariantId: text.variantId || null,
    tts: buildTtsPayload(event, rule),
    chatMessage: buildAlertChatMessage(event, rule, text.context),
    createdAt: event.created_at,
    startedAt: event.started_at
  };
  persistRenderedAlert(event.eventUid, alert);
  return alert;
}

function buildOverlayText(event, rule = {}) {
  const context = buildTemplateContext(event, rule);
  const variant = selectTextVariant(event, rule);
  const fallback = fallbackTemplates(event, rule);
  const templates = variant || fallback;
  const rawMessage = cleanText(event.message || '');
  const messageMode = cleanKey(templates.message_mode || templates.messageMode || 'auto');
  const hideSubline = boolish(templates.hide_subline_when_message_exists ?? templates.hideSublineWhenMessageExists, true);
  let message = '';
  if (messageMode !== 'never') {
    message = renderTemplate(templates.message_template || templates.messageTemplate || (messageMode === 'always' ? '{message}' : ''), context);
    if (!message && messageMode === 'auto') message = rawMessage;
  }
  const sublineRendered = renderTemplate(templates.subline_template || templates.sublineTemplate || '', context);
  return {
    variantId: variant ? variant.id : null,
    providerLogoUrl: providerLogoUrl(event.source, event.type_key),
    context,
    title: renderTemplate(templates.title_template || templates.titleTemplate || '', context),
    headline: renderTemplate(templates.headline_template || templates.headlineTemplate || '', context),
    value: renderTemplate(templates.value_template || templates.valueTemplate || '', context),
    subline: hideSubline && message ? '' : sublineRendered,
    message
  };
}

function buildTemplateContext(event, rule = {}) {
  const raw = event.raw || {};
  const amount = Number(event.amount || raw.amount || raw.bits || raw.viewerCount || raw.count || 0);
  const currency = cleanText(event.currency || raw.currency || raw.currencyCode || '');
  const userDisplayName = cleanText(event.user_display || raw.userDisplayName || raw.user || raw.displayName || raw.login || 'Jemand');
  const userLogin = cleanText(event.user_login || raw.userLogin || raw.login || '').toLowerCase();
  const recipientDisplayName = cleanText(raw.recipientDisplayName || raw.recipient || raw.targetUser || raw.target || '');
  const months = Number(raw.months || raw.cumulativeMonths || raw.totalMonths || 0);
  const streakMonths = Number(raw.streakMonths || raw.streak || 0);
  const viewerCount = Number(raw.viewerCount || raw.viewers || raw.count || amount || 0);
  const tier = 'normal';
  const provider = cleanText(event.source || raw.provider || raw.source || '');
  const type = cleanText(event.type_key || raw.type || raw.type_key || '');
  const amountFormatted = formatAmount(amount, currency, type, provider);
  return {
    userDisplayName,
    userLogin,
    user: userDisplayName,
    amount: amount ? String(amount) : '',
    amountFormatted,
    currency,
    months: months ? String(months) : '',
    streakMonths: streakMonths ? String(streakMonths) : '',
    viewerCount: viewerCount ? String(viewerCount) : '',
    recipientDisplayName,
    recipient: recipientDisplayName,
    tier,
    provider,
    source: provider,
    type,
    message: cleanText(event.message || raw.message || raw.text || ''),
    ruleLabel: cleanText(rule.label || ''),
    introMs: raw.introMs || raw.intro_ms || '',
    outroMs: raw.outroMs || raw.outro_ms || ''
  };
}

function selectTextVariant(event, rule = {}) {
  const rows = database.all(`
    SELECT * FROM alert_text_variants
    WHERE enabled = 1
      AND source = :source
      AND type_key = :typeKey
      AND (rule_id IS NULL OR rule_id = :ruleId)
    ORDER BY CASE WHEN rule_id = :ruleId THEN 0 ELSE 1 END ASC, sort_order ASC, id ASC
  `, { source: event.source, typeKey: event.type_key, ruleId: rule.id || 0 });
  if (!rows.length) return null;
  const ruleSpecific = rows.filter(r => Number(r.rule_id || 0) === Number(rule.id || 0));
  const pool = ruleSpecific.length ? ruleSpecific : rows.filter(r => !r.rule_id);
  return pickWeighted(pool);
}

function pickWeighted(rows) {
  if (!rows || !rows.length) return null;
  const total = rows.reduce((sum, row) => sum + Math.max(1, Number(row.pick_weight || 1)), 0);
  let hit = Math.random() * total;
  for (const row of rows) {
    hit -= Math.max(1, Number(row.pick_weight || 1));
    if (hit <= 0) return row;
  }
  return rows[rows.length - 1];
}

function renderTemplate(template, context) {
  return cleanText(String(template || '').replace(/\{([a-zA-Z0-9_]+)\}/g, (m, key) => {
    const value = context[key];
    return value === undefined || value === null ? '' : String(value);
  })).replace(/\s+/g, ' ').trim();
}

function formatAmount(amount, currency, type, provider) {
  const n = Number(amount || 0);
  if (!n) return '';
  const t = cleanKey(type);
  const p = cleanKey(provider);
  if (t === 'bits') return `${n} Bits`;
  if (t === 'raid') return n === 1 ? '1 Person' : `${n} Leute`;
  if (t === 'gift_sub' || t === 'gift_bomb') return n === 1 ? '1 Sub' : `${n} Subs`;
  if (p === 'kofi' || p === 'tipeee' || currency) {
    const c = currency || 'EUR';
    try { return new Intl.NumberFormat('de-DE', { style: 'currency', currency: c }).format(n); }
    catch (_) { return `${n.toFixed(2).replace('.', ',')} ${c}`.trim(); }
  }
  return String(n);
}

function providerLogoUrl(source, typeKey) {
  const src = cleanKey(source);
  if (src === 'kofi') return '/assets/images/alerts/providers/kofi.png';
  if (src === 'tipeee') return '/assets/images/alerts/providers/tipeee.png';
  if (typeKey === 'donation') return '/assets/images/alerts/providers/default-donation.svg';
  return '';
}

function defaultIconUrl(source, typeKey) {
  const src = cleanKey(source);
  const type = cleanKey(typeKey);
  if (src === 'kofi') return '/assets/images/alerts/providers/kofi.png';
  if (src === 'tipeee') return '/assets/images/alerts/providers/tipeee.png';
  if (type === 'donation') return '/assets/images/alerts/providers/default-donation.svg';
  return '';
}

function fallbackTemplates(event, rule = {}) {
  const source = cleanKey(event.source);
  const type = cleanKey(event.type_key);
  if (source === 'twitch' && type === 'follow') return { title_template:'TWITCH FOLLOW', headline_template:'{userDisplayName}', value_template:'folgt jetzt dem Kanal', subline_template:'Willkommen in der CGN-Community!', message_mode:'never', hide_subline_when_message_exists:1 };
  if (source === 'twitch' && type === 'bits') return { title_template:'TWITCH BITS', headline_template:'{userDisplayName}', value_template:'cheert {amountFormatted}', subline_template:'Danke für den Support!', message_mode:'auto', hide_subline_when_message_exists:1 };
  if (source === 'twitch' && type === 'raid') return { title_template:'TWITCH RAID', headline_template:'{userDisplayName}', value_template:'kommt mit {viewerCount} Leuten rein', subline_template:'Willkommen bei CGN!', message_mode:'never', hide_subline_when_message_exists:1 };
  if (source === 'twitch' && type === 'sub') return { title_template:'TWITCH SUB', headline_template:'{userDisplayName}', value_template:'ist jetzt Subscriber', subline_template:'Danke für deine Unterstützung!', message_mode:'auto', hide_subline_when_message_exists:1 };
  if (source === 'twitch' && type === 'resub') return { title_template:'TWITCH RESUB', headline_template:'{userDisplayName}', value_template:'{months} Monate dabei', subline_template:'Danke für deine Treue!', message_mode:'auto', hide_subline_when_message_exists:1 };
  if (source === 'twitch' && (type === 'gift_sub' || type === 'gift_bomb')) return { title_template:'TWITCH GIFT SUB', headline_template:'{userDisplayName}', value_template:'verschenkt {amountFormatted}', subline_template:'Danke für den Support!', message_mode:'never', hide_subline_when_message_exists:1 };
  if (source === 'kofi') return { title_template:'KO-FI SUPPORT', headline_template:'{userDisplayName}', value_template:'{amountFormatted}', subline_template:'Danke für deine Unterstützung!', message_mode:'auto', hide_subline_when_message_exists:1 };
  if (source === 'tipeee') return { title_template:'TIPEEE SUPPORT', headline_template:'{userDisplayName}', value_template:'{amountFormatted}', subline_template:'Danke für deine Unterstützung!', message_mode:'auto', hide_subline_when_message_exists:1 };
  return { title_template:'ALERT', headline_template:'{userDisplayName}', value_template:'{amountFormatted}', subline_template:'Danke für den Support!', message_mode:'auto', hide_subline_when_message_exists:1 };
}

function persistRenderedAlert(eventUid, alert) {
  try {
    database.run(`UPDATE alert_events SET final_title=:title, final_headline=:headline, final_value=:value, final_subline=:subline, final_message=:message, text_variant_id=:variantId, provider_logo_url=:providerLogoUrl, display_profile_id=:displayProfileId, display_settings_json=:displaySettingsJson, final_chat_message=:chatMessage WHERE event_uid=:eventUid`, {
      eventUid,
      title: alert.title || '',
      headline: alert.headline || '',
      value: alert.value || '',
      subline: alert.subline || '',
      message: alert.message || '',
      variantId: alert.textVariantId || null,
      providerLogoUrl: alert.providerLogoUrl || '',
      displayProfileId: alert.display?.id || null,
      displaySettingsJson: JSON.stringify(alert.display?.settings || {}),
      chatMessage: alert.chatMessage?.text || ''
    });
  } catch (_) {}
}


function resolveAlertDurationMs(rule = {}) {
  const fixed = Number(rule?.duration_ms || state.config.defaultDurationMs || 7000);
  if ((rule?.duration_mode || 'fixed') !== 'sound') return clamp(fixed, 1000, 60000);
  const soundDuration = alertRuleSoundDurationMs(rule);
  if (soundDuration <= 0) return clamp(fixed, 1000, 60000);
  const padded = soundDuration + Number(state.config.soundDurationPaddingMs || 1200);
  return clamp(padded, Number(state.config.minAutoDurationMs || 4000), Number(state.config.maxAutoDurationMs || 60000));
}

function buildAlertChatMessage(event, rule = {}, context = null) {
  const meta = rule && rule.meta && typeof rule.meta === 'object' ? rule.meta : {};
  const cfg = meta.chatMessage && typeof meta.chatMessage === 'object' ? meta.chatMessage : {};
  const enabled = boolish(cfg.enabled, false);
  const blockId = nullableInt(cfg.blockId ?? cfg.block_id ?? cfg.chatBlockId ?? cfg.chat_block_id);
  if (!enabled || !blockId) return { enabled:false, blockId:blockId || null, text:'', reason: enabled ? 'missing_block' : 'disabled' };
  const block = getChatBlockById(blockId);
  if (!block || Number(block.enabled) !== 1) return { enabled:false, blockId, text:'', reason:'block_disabled_or_missing' };
  if (block.source !== event.source || block.type_key !== event.type_key) return { enabled:false, blockId, text:'', reason:'block_type_mismatch' };
  const texts = parseChatTexts(block.texts || block.texts_json || []);
  if (!texts.length) return { enabled:false, blockId, text:'', reason:'empty_block' };
  const ctx = context || buildTemplateContext(event, rule);
  const template = texts[Math.floor(Math.random() * texts.length)] || '';
  const text = renderTemplate(template, ctx);
  if (!text) return { enabled:false, blockId, text:'', reason:'empty_rendered_text' };
  return { enabled:true, blockId:block.id, blockLabel:block.label, text };
}

async function dispatchAlertChatMessage(event, alert) {
  const chat = alert && alert.chatMessage;
  if (!chat || !chat.enabled || !chat.text) return;
  if (state.config.chatMessageEnabled === false) return;
  const outboxId = saveChatOutbox(event, chat, 'pending');
  chat.outboxId = outboxId;
  const url = cleanText(state.config.chatMessagePostUrl || '');
  if (!url) {
    updateChatDispatchStatus(event.eventUid, 'pending_outbox', 'chat_post_url_missing');
    chat.sent = false;
    chat.reason = 'chat_post_url_missing';
    return;
  }
  if (typeof fetch !== 'function') {
    updateChatDispatchStatus(event.eventUid, 'pending_outbox', 'fetch_unavailable');
    chat.sent = false;
    chat.reason = 'fetch_unavailable';
    return;
  }
  const payload = { message: chat.text, text: chat.text, source: event.source, type_key: event.type_key, user: event.user_display, userLogin: event.user_login, amount: event.amount, eventUid: event.eventUid, ruleId: event.rule?.id || null, chatBlockId: chat.blockId || null, outboxId };
  const method = cleanText(state.config.chatMessagePostMethod || 'POST').toUpperCase() === 'GET' ? 'GET' : 'POST';
  let finalUrl = url;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = controller ? setTimeout(() => controller.abort(), Math.max(500, Number(state.config.chatMessageTimeoutMs || 2500))) : null;
  try {
    if (method === 'GET') {
      const sep = finalUrl.includes('?') ? '&' : '?';
      finalUrl += sep + 'message=' + encodeURIComponent(chat.text);
      const res = await fetch(finalUrl, { method:'GET', signal: controller ? controller.signal : undefined });
      if (!res.ok) throw new Error(`chat_http_${res.status}`);
    } else {
      const res = await fetch(finalUrl, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(payload), signal: controller ? controller.signal : undefined });
      if (!res.ok) throw new Error(`chat_http_${res.status}`);
    }
    chat.sent = true;
    updateChatOutboxStatus(outboxId, 'sent', '');
    updateChatDispatchStatus(event.eventUid, 'sent', '');
  } catch (err) {
    const msg = cleanText(err && err.message ? err.message : String(err || 'chat_send_failed')).slice(0, 300);
    chat.sent = false;
    chat.reason = msg;
    updateChatOutboxStatus(outboxId, 'error', msg);
    updateChatDispatchStatus(event.eventUid, 'error', msg);
    throw err;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function saveChatOutbox(event, chat, status) {
  try {
    const now = nowIso();
    const existing = database.get(`SELECT id FROM alert_chat_outbox WHERE event_uid=:eventUid LIMIT 1`, { eventUid:event.eventUid });
    if (existing && existing.id) return Number(existing.id);
    const result = database.run(`INSERT INTO alert_chat_outbox (event_uid, source, type_key, rule_id, chat_block_id, message, status, created_at) VALUES (:eventUid, :source, :typeKey, :ruleId, :chatBlockId, :message, :status, :now)`, {
      eventUid:event.eventUid,
      source:event.source || '',
      typeKey:event.type_key || '',
      ruleId:event.rule?.id || null,
      chatBlockId:chat.blockId || null,
      message:chat.text || '',
      status:status || 'pending',
      now
    });
    return Number(result.lastInsertRowid || 0);
  } catch (_) {
    return 0;
  }
}

function listChatOutbox(filter = {}) {
  const limit = clamp(toInt(filter.limit, Number(state.config.chatMessageOutboxLimit || 100)), 1, 500);
  const status = cleanKey(filter.status || 'pending');
  const params = { limit };
  let where = '';
  if (status && status !== 'all') { where = 'WHERE status = :status'; params.status = status; }
  return database.all(`SELECT * FROM alert_chat_outbox ${where} ORDER BY id ASC LIMIT :limit`, params);
}

function updateChatOutboxStatus(idRaw, status, error) {
  const id = toInt(idRaw, 0);
  if (!id) return;
  const now = nowIso();
  const sentAt = status === 'sent' ? now : null;
  database.run(`UPDATE alert_chat_outbox SET status=:status, error=:error, sent_at=COALESCE(:sentAt, sent_at) WHERE id=:id`, { id, status, error: cleanText(error || '').slice(0, 500), sentAt });
}

function markChatOutboxSent(idRaw) {
  const id = toInt(idRaw, 0);
  if (!id) return { ok:false, error:'invalid_id' };
  updateChatOutboxStatus(id, 'sent', '');
  return { ok:true, id };
}

function markChatOutboxConsumed(idRaw) {
  const id = toInt(idRaw, 0);
  if (!id) return { ok:false, error:'invalid_id' };
  const now = nowIso();
  database.run(`UPDATE alert_chat_outbox SET status='consumed', consumed_at=:now WHERE id=:id`, { id, now });
  return { ok:true, id };
}

function markChatOutboxError(idRaw, input = {}) {
  const id = toInt(idRaw, 0);
  if (!id) return { ok:false, error:'invalid_id' };
  const error = cleanText(input.error || input.message || 'external_send_failed').slice(0, 500);
  updateChatOutboxStatus(id, 'error', error);
  return { ok:true, id, error };
}

function updateChatDispatchStatus(eventUid, status, error) {
  try {
    database.run(`UPDATE alert_events SET chat_message_status=:status, chat_message_error=:error WHERE event_uid=:eventUid`, {
      eventUid,
      status: cleanText(status || '').slice(0, 80),
      error: cleanText(error || '').slice(0, 500)
    });
  } catch (_) {}
}

function buildTtsPayload(event, rule = {}) {
  if (Number(rule.tts_enabled || 0) !== 1) return null;
  const rawMessage = cleanText(event.message || '');
  const message = cleanAlertMessageForTts(event, rawMessage);
  const minAmount = nullableNumber(rule.tts_min_amount);
  if (!message) {
    return {
      enabled: false,
      reason: rawMessage ? 'empty_message_after_tts_cleanup' : 'empty_message',
      originalMessage: rawMessage
    };
  }
  if (minAmount !== null && Number(event.amount || 0) < minAmount) return { enabled: false, reason: 'amount_below_minimum' };
  const maxChars = clamp(toInt(rule.tts_max_chars, 250), 1, 1000);
  const safeMessage = message.slice(0, maxChars);
  const template = String(rule.tts_template || '{user} schreibt: {message}').slice(0, 1000);
  const text = template
    .replaceAll('{user}', event.user_display || event.user_login || 'Jemand')
    .replaceAll('{amount}', String(event.amount || 0))
    .replaceAll('{currency}', '')
    .replaceAll('{message}', safeMessage)
    .trim();
  return {
    enabled: true,
    mode: validateTtsMode(rule.tts_mode || 'audio_only'),
    timing: validateTtsTiming(rule.tts_timing || 'after_alert'),
    maxChars,
    text,
    message: safeMessage,
    originalMessage: rawMessage,
    cleanup: getAlertTtsCleanupInfo(event, rawMessage, safeMessage)
  };
}

function cleanAlertMessageForTts(event, message) {
  const raw = cleanText(message || '');
  if (!raw) return '';
  if (isTwitchBitsAlert(event)) return stripTwitchCheermoteWords(raw, getTwitchCheermotePrefixesFromEvent(event));
  return raw;
}

function stripTwitchCheermoteWords(message, prefixes) {
  const raw = cleanText(message || '');
  if (!raw) return '';
  const normalizedPrefixes = normalizeTwitchCheermotePrefixes(prefixes);
  if (!normalizedPrefixes.length) return raw;
  const escaped = normalizedPrefixes
    .sort((a, b) => b.length - a.length)
    .map(prefix => prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(^|\\s)(?:${escaped.join('|')})\\d+(?=\\s|$)`, 'gi');
  return raw
    .replace(pattern, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTwitchCheermotePrefixes(input) {
  const list = Array.isArray(input) ? input : String(input || '').split(/[\s,;]+/);
  const result = [];
  const seen = new Set();
  for (const raw of list) {
    const prefix = cleanText(raw || '');
    if (!/^[A-Za-z][A-Za-z0-9_]{0,80}$/.test(prefix)) continue;
    const key = prefix.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(prefix);
  }
  if (!seen.has('cheer')) result.unshift('Cheer');
  return result;
}

function getTwitchCheermotePrefixesFromEvent(event) {
  const raw = event && event.raw && typeof event.raw === 'object' ? event.raw : {};
  const candidates = [
    raw.cheermotePrefixes,
    raw.twitchCheermotePrefixes,
    raw.raw && raw.raw.cheermotePrefixes,
    raw.meta && raw.meta.cheermotePrefixes
  ];
  for (const candidate of candidates) {
    const prefixes = normalizeTwitchCheermotePrefixes(candidate);
    if (prefixes.length > 1 || (prefixes.length === 1 && prefixes[0].toLowerCase() !== 'cheer')) return prefixes;
  }
  return normalizeTwitchCheermotePrefixes(['Cheer']);
}

function isTwitchBitsAlert(event) {
  const source = cleanKey(event && event.source || '').toLowerCase();
  const typeKey = cleanKey(event && event.type_key || '').toLowerCase();
  const raw = event && event.raw && typeof event.raw === 'object' ? event.raw : {};
  const provider = cleanKey(raw.provider || '').toLowerCase();
  const eventsubType = cleanText(raw.eventsubType || '').toLowerCase();

  return typeKey === 'bits' && (source === 'twitch' || provider === 'twitch_eventsub' || eventsubType === 'channel.cheer');
}

function getAlertTtsCleanupInfo(event, originalMessage, cleanedMessage) {
  if (!isTwitchBitsAlert(event)) return { applied: false };
  return {
    applied: true,
    mode: 'strip_twitch_cheermote_words',
    originalMessage: cleanText(originalMessage || ''),
    cleanedMessage: cleanText(cleanedMessage || '')
  };
}

function buildDefaultTitle(event) {
  if (event.type_key === 'follow') return `${event.user_display} folgt jetzt!`;
  if (event.type_key === 'bits') return `${event.user_display} cheer't ${event.amount} Bits!`;
  if (event.type_key === 'raid') return `${event.user_display} raidt mit ${event.amount}!`;
  if (event.type_key === 'sub') return `${event.user_display} ist jetzt Sub!`;
  if (event.type_key === 'gift_sub') return `${event.user_display} verschenkt ${event.amount || 1} Sub!`;
  return `${event.user_display} hat einen Alert ausgelÃ¶st`;
}

function sendOverlay(broadcastWS, payload) {
  if (typeof broadcastWS !== 'function') return;
  broadcastWS({ op: state.config.wsOp || 'alert_system', ...payload });
}

function clearQueue(reason) {
  state.queue = [];
  database.run(`UPDATE alert_events SET status='cleared', finished_at=:now WHERE status='queued'`, { now: nowIso() });
  if (reason === 'api_clear' && state.current) {
    state.current = null;
    clearTimeout(state.finishTimer);
    state.finishTimer = null;
  }
}

function attachWs(wss) {
  if (state.started) return;
  state.started = true;
  wss.on('connection', ws => {
    ws.on('message', raw => {
      let msg = null;
      try { msg = JSON.parse(String(raw || '')); } catch (_) { return; }
      if (!msg || msg.op !== (state.config.wsOp || 'alert_system')) return;
      if (msg.client === 'overlay') {
        state.overlayClients.set(ws, { connectedAt: nowIso(), lastSeenAt: nowIso() });
        try { ws.send(JSON.stringify({ op: state.config.wsOp || 'alert_system', event: 'hello', status: buildStatus() })); } catch (_) {}
      }
      if (msg.event === 'ack' || msg.event === 'finished') {
        if (state.current && (!msg.alertId || msg.alertId === state.current.eventUid)) finishCurrent('client_ack', state.broadcastWS);
      }
    });
    ws.on('close', () => state.overlayClients.delete(ws));
  });
}

function absRoot(p) {
  const clean = String(p || '').replace(/^[/\\]+/, '');
  if (path.isAbsolute(clean)) return clean;
  return path.join(configHelper.getRootDir(), clean);
}

function relRoot(p) {
  return path.relative(configHelper.getRootDir(), p);
}

function imageTargetDir(category) {
  const cat = cleanKey(category || '');
  if (cat === 'icons') return absRoot('htdocs/assets/images/alerts/icons');
  if (cat === 'special') return absRoot('htdocs/assets/images/alerts/special');
  if (cat === 'backgrounds') return absRoot('htdocs/assets/images/alerts/backgrounds');
  return absRoot(state.config.imagesDir);
}

function detectAssetType(mime, hint) {
  const h = cleanKey(hint || '');
  if (h === 'sound' || h === 'image') return h;
  return String(mime || '').startsWith('audio/') ? 'sound' : 'image';
}

function sanitizeFilename(name) {
  return String(name || 'asset').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'asset';
}
function safeExt(ext) { return /^[.][a-z0-9]{1,8}$/i.test(ext) ? ext.toLowerCase() : ''; }
function cleanText(v) { return String(v ?? '').trim().slice(0, 500); }
function validateCelebration(value) {
  const v = normalizeCelebrationAlias(value);
  return ['none','heart_rain','sparkle_rain'].includes(v) ? v : 'none';
}
function normalizeCelebrationAlias(value) {
  const v = String(value || 'none').toLowerCase();
  const aliases = {
    confetti:'sparkle_rain', burst:'sparkle_rain', screen:'sparkle_rain', mega:'sparkle_rain', fireworks:'sparkle_rain', mega_fireworks:'sparkle_rain',
    hearts:'heart_rain', stars:'sparkle_rain', starfall:'sparkle_rain', coins:'sparkle_rain', comets:'sparkle_rain', sparkle:'sparkle_rain', sparkles:'sparkle_rain'
  };
  return aliases[v] || v;
}

function cleanTemplate(v) { return String(v ?? '').trim().slice(0, 1200); }
function boolish(v, fallback) { if (v === undefined || v === null || v === '') return !!fallback; return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function validateMessageMode(v) { const mode = cleanKey(v || 'auto'); return ['auto','always','never'].includes(mode) ? mode : 'auto'; }
function cleanKey(v) { return String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9_.-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80); }
function toInt(v, fallback) { const n = Number.parseInt(v, 10); return Number.isFinite(n) ? n : fallback; }
function nullableInt(v) { if (v === '' || v === null || v === undefined) return null; const n = Number.parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : null; }
function nullableNumber(v) { if (v === '' || v === null || v === undefined) return null; const n = Number(v); return Number.isFinite(n) ? n : null; }
function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
function boolInt(v, fallback) { if (v === undefined || v === null || v === '') return fallback ? 1 : 0; return (v === true || v === 1 || v === '1' || v === 'true' || v === 'on') ? 1 : 0; }
function parseJson(v, fallback) { try { return JSON.parse(v || ''); } catch (_) { return fallback; } }
function nowIso() { return new Date().toISOString(); }
function makeEventUid() { return `al_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`; }
function validateImageMode(v) { const mode = cleanKey(v || 'none'); return state.config.allowedImageModes.includes(mode) ? mode : 'none'; }
function validateTtsTiming(v) { const mode = cleanKey(v || 'after_alert'); return ['after_alert', 'during_alert', 'before_alert'].includes(mode) ? mode : 'after_alert'; }
function validateTtsMode(v) { const mode = cleanKey(v || 'audio_only'); return ['audio_only', 'overlay'].includes(mode) ? mode : 'audio_only'; }






