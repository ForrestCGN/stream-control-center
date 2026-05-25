const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const liveRoot = process.env.STREAM_ASSETS_ROOT || 'D:\\Streaming\\stramAssets';
const overlayRel = path.join('htdocs', 'overlays', 'vip_sound_overlay_v2.html');
const busRel = path.join('backend', 'modules', 'communication_bus.js');
const overlayTarget = path.join(repoRoot, overlayRel);
const busTarget = path.join(repoRoot, busRel);
const step = 'STEP403';

function fail(message) {
  console.error(`${step}_ERROR=${message}`);
  process.exit(1);
}

function backupFile(file, label) {
  const backup = `${file}.${label}_${new Date().toISOString().replace(/[:.]/g, '-')}.bak`;
  fs.writeFileSync(backup, fs.readFileSync(file, 'utf8'), 'utf8');
  return backup;
}

function copyToLive(relPath) {
  const src = path.join(repoRoot, relPath);
  const dst = path.join(liveRoot, relPath);
  if (!fs.existsSync(src)) return { copied: false, reason: 'source_missing', src, dst };
  if (!fs.existsSync(liveRoot)) return { copied: false, reason: 'live_root_missing', src, dst };
  const dstDir = path.dirname(dst);
  fs.mkdirSync(dstDir, { recursive: true });
  fs.copyFileSync(src, dst);
  return { copied: true, src, dst };
}

function patchOverlay() {
  if (!fs.existsSync(overlayTarget)) fail(`overlay_not_found:${overlayTarget}`);
  let html = fs.readFileSync(overlayTarget, 'utf8');
  if (!html.includes('handleVipOverlayBusShadowEvent')) fail('STEP401_shadow_handler_missing_apply_STEP401_first');
  const backups = [];
  let changed = false;

  if (!html.includes('let busPreviewActive = false;')) {
    backups.push(backupFile(overlayTarget, 'step403_overlay'));
    const marker = '    let lastSoundRequestId = "";';
    if (!html.includes(marker)) fail('overlay_state_marker_not_found');
    html = html.replace(marker, marker + '\n    let busPreviewActive = false;\n    let busPreviewTimer = null;');
    changed = true;
  }

  if (html.includes('if (!cur && visible) hideOverlay("status_poll_empty");')) {
    if (!changed) backups.push(backupFile(overlayTarget, 'step403_overlay'));
    html = html.replace('if (!cur && visible) hideOverlay("status_poll_empty");', 'if (!cur && visible && !busPreviewActive) hideOverlay("status_poll_empty");');
    changed = true;
  }

  if (!html.includes('function clampVipPreviewDuration')) {
    if (!changed) backups.push(backupFile(overlayTarget, 'step403_overlay'));
    const marker = '    function handleVipOverlayBusShadowEvent(data) {';
    if (!html.includes(marker)) fail('shadow_handler_marker_not_found');
    const insert = `    function clampVipPreviewDuration(value, fallback = 5000) {\n      const parsed = Number.parseInt(String(value == null ? "" : value), 10);\n      const base = Number.isFinite(parsed) ? parsed : fallback;\n      return Math.max(1000, Math.min(30000, base));\n    }\n\n    function overlayFromVipBusPayload(normalized) {\n      const payload = normalized && normalized.payload ? normalized.payload : {};\n      const displayName = safeString(payload.displayName || payload.user || payload.login, "VIP Preview");\n      return {\n        requestId: safeString(payload.requestId || normalized.eventId || ("vip-bus-preview-" + Date.now())),\n        soundRequestId: "",\n        displayName,\n        login: safeString(payload.login || payload.user),\n        avatarUrl: safeString(payload.avatarUrl),\n        title: safeString(payload.title, "VIP EVENT-BUS PREVIEW"),\n        text: safeString(payload.text, "Preview-Test: Anzeige ueber vip.overlay Event-Bus."),\n        type: safeString(payload.type, "bus-preview")\n      };\n    }\n\n`;
    html = html.replace(marker, insert + marker);
    changed = true;
  }

  const oldHandler = `    function handleVipOverlayBusShadowEvent(data) {\n      const normalized = normalizeVipOverlayBusEnvelope(data);\n      if (!normalized) return false;\n\n      // STEP401 shadow mode: acknowledge and debug only.\n      // Do not call showOverlay()/hideOverlay() here yet; production rendering remains driven by sound_system.\n      sendVipOverlayBusAck(normalized.eventId, "received", {\n        action: normalized.action,\n        shadowOnly: true,\n        requestId: safeString(normalized.payload.requestId)\n      });\n\n      setDebug([\n        "VIP BUS SHADOW EVENT",\n        "action=" + normalized.action,\n        "eventId=" + normalized.eventId,\n        "requestId=" + safeString(normalized.payload.requestId),\n        "displayName=" + safeString(normalized.payload.displayName || normalized.payload.user),\n        "shadowOnly=true",\n        "soundSystemFlow=unchanged"\n      ]);\n\n      return true;\n    }`;

  const newHandler = `    function handleVipOverlayBusShadowEvent(data) {\n      const normalized = normalizeVipOverlayBusEnvelope(data);\n      if (!normalized) return false;\n\n      const payload = normalized.payload || {};\n\n      if (normalized.action === "show") {\n        const durationMs = clampVipPreviewDuration(payload.durationMs, 5000);\n        busPreviewActive = true;\n        clearTimeout(busPreviewTimer);\n\n        const overlay = overlayFromVipBusPayload(normalized);\n        showOverlay(overlay, "vip_overlay_bus_preview_show");\n\n        busPreviewTimer = setTimeout(() => {\n          if (busPreviewActive && currentRequestId === overlay.requestId) {\n            hideOverlay("vip_overlay_bus_preview_duration_elapsed");\n          }\n        }, durationMs);\n\n        sendVipOverlayBusAck(normalized.eventId, "displayed", {\n          action: normalized.action,\n          previewOnly: true,\n          requestId: overlay.requestId,\n          durationMs\n        });\n\n        setDebug([\n          "VIP BUS PREVIEW SHOW",\n          "eventId=" + normalized.eventId,\n          "requestId=" + overlay.requestId,\n          "displayName=" + overlay.displayName,\n          "durationMs=" + durationMs,\n          "previewOnly=true",\n          "soundSystemFlow=unchanged"\n        ]);\n\n        return true;\n      }\n\n      if (normalized.action === "hide") {\n        hideOverlay("vip_overlay_bus_preview_hide");\n        sendVipOverlayBusAck(normalized.eventId, "hidden", {\n          action: normalized.action,\n          previewOnly: true,\n          requestId: safeString(payload.requestId || currentRequestId)\n        });\n        return true;\n      }\n\n      if (normalized.action === "update") {\n        if (visible) {\n          if (payload.displayName || payload.user) nameEl.textContent = safeString(payload.displayName || payload.user, nameEl.textContent);\n          if (payload.text) msgEl.textContent = safeString(payload.text, msgEl.textContent);\n          if (payload.title) headlineEl.textContent = safeString(payload.title, headlineEl.textContent);\n          if (payload.avatarUrl || payload.displayName || payload.user) setAvatar(safeString(payload.avatarUrl), safeString(payload.displayName || payload.user || nameEl.textContent));\n        }\n        sendVipOverlayBusAck(normalized.eventId, "updated", {\n          action: normalized.action,\n          previewOnly: true,\n          visible\n        });\n        return true;\n      }\n\n      // test action stays shadow-only for compatibility with STEP401/402.\n      sendVipOverlayBusAck(normalized.eventId, "received", {\n        action: normalized.action,\n        shadowOnly: true,\n        requestId: safeString(payload.requestId)\n      });\n\n      setDebug([\n        "VIP BUS SHADOW EVENT",\n        "action=" + normalized.action,\n        "eventId=" + normalized.eventId,\n        "requestId=" + safeString(payload.requestId),\n        "displayName=" + safeString(payload.displayName || payload.user),\n        "shadowOnly=true",\n        "soundSystemFlow=unchanged"\n      ]);\n\n      return true;\n    }`;

  if (html.includes(oldHandler)) {
    if (!changed) backups.push(backupFile(overlayTarget, 'step403_overlay'));
    html = html.replace(oldHandler, newHandler);
    changed = true;
  }

  if (html.includes('function handleSoundItem(item, reason) {\n      if (!item || !isVipItem(item)) return false;\n      showOverlay(overlayFromItem(item), reason || "sound_item");')) {
    if (!changed) backups.push(backupFile(overlayTarget, 'step403_overlay'));
    html = html.replace('function handleSoundItem(item, reason) {\n      if (!item || !isVipItem(item)) return false;\n      showOverlay(overlayFromItem(item), reason || "sound_item");', 'function handleSoundItem(item, reason) {\n      if (!item || !isVipItem(item)) return false;\n      busPreviewActive = false;\n      clearTimeout(busPreviewTimer);\n      showOverlay(overlayFromItem(item), reason || "sound_item");');
    changed = true;
  }

  if (html.includes('function hideOverlay(reason) {\n      if (!visible) return;')) {
    const patched = 'function hideOverlay(reason) {\n      busPreviewActive = false;\n      clearTimeout(busPreviewTimer);\n      if (!visible) return;';
    if (!html.includes(patched)) {
      if (!changed) backups.push(backupFile(overlayTarget, 'step403_overlay'));
      html = html.replace('function hideOverlay(reason) {\n      if (!visible) return;', patched);
      changed = true;
    }
  }

  if (html.includes('version: "STEP401"')) {
    if (!changed) backups.push(backupFile(overlayTarget, 'step403_overlay'));
    html = html.replace('version: "STEP401"', 'version: "STEP403"');
    changed = true;
  }

  if (!changed && html.includes('VIP BUS PREVIEW SHOW') && html.includes('clampVipPreviewDuration')) {
    console.log(`${step}_OVERLAY_PATCH=already_applied`);
    return { changed: false, backups };
  }

  if (!html.includes('VIP BUS PREVIEW SHOW')) fail('overlay_patch_failed_preview_handler_missing');
  fs.writeFileSync(overlayTarget, html, 'utf8');
  console.log(`${step}_OVERLAY_PATCH=${changed ? 'applied' : 'already_applied'}`);
  backups.forEach((b) => console.log(`overlayBackup=${b}`));
  return { changed, backups };
}

function patchCommunicationBus() {
  if (!fs.existsSync(busTarget)) fail(`communication_bus_not_found:${busTarget}`);
  let js = fs.readFileSync(busTarget, 'utf8');

  if (js.includes("/api/communication/test-vip-overlay-preview")) {
    console.log(`${step}_COMMUNICATION_PATCH=already_applied`);
    return { changed: false, backups: [] };
  }

  if (!js.includes("/api/communication/test-vip-overlay")) fail('STEP401_test_vip_overlay_route_missing_apply_STEP401_first');

  const backups = [backupFile(busTarget, 'step403_communication')];
  const marker = `  app.get('/api/communication/test-vip-overlay', (req, res) => {`;
  if (!js.includes(marker)) fail('step401_vip_route_marker_not_found');

  const route = `\n  app.get('/api/communication/test-vip-overlay-preview', (req, res) => {\n    const currentBus = getBus();\n    if (!currentBus || typeof currentBus.emit !== 'function') {\n      return res.status(500).json({ ok: false, error: 'communication_bus_unavailable' });\n    }\n\n    const action = cleanString(req.query.action || 'show').toLowerCase();\n    if (!['show', 'hide', 'update'].includes(action)) {\n      return res.status(400).json({ ok: false, error: 'invalid_action', allowed: ['show', 'hide', 'update'] });\n    }\n\n    const displayName = cleanString(req.query.displayName || req.query.user || 'STEP403_VIP_Preview');\n    const durationRaw = Number.parseInt(String(req.query.durationMs || '5000'), 10);\n    const durationMs = Math.max(1000, Math.min(30000, Number.isFinite(durationRaw) ? durationRaw : 5000));\n    const requestId = cleanString(req.query.requestId || ('step403-vip-preview-' + Date.now()));\n    const requireAck = boolParam(req.query.requireAck, true);\n    const replayable = boolParam(req.query.replayable, true);\n\n    const result = currentBus.emit({\n      type: 'event',\n      channel: 'vip.overlay',\n      action,\n      source: { type: 'diagnostic', id: 'STEP403', module: 'vip_sound_overlay' },\n      target: { type: 'module', module: 'vip_sound_overlay', capability: 'vip.overlay.' + action },\n      payload: {\n        test: true,\n        previewOnly: true,\n        step: 403,\n        requestId,\n        displayName,\n        user: displayName,\n        title: cleanString(req.query.title || 'VIP EVENT-BUS PREVIEW'),\n        text: cleanString(req.query.text || 'Preview-Test ueber vip.overlay.show/hide.'),\n        avatarUrl: cleanString(req.query.avatarUrl || ''),\n        type: cleanString(req.query.type || 'bus-preview'),\n        durationMs,\n        emittedAt: new Date().toISOString()\n      },\n      meta: {\n        module: 'vip_sound_overlay',\n        step: 403,\n        previewOnly: true,\n        requireAck,\n        replayable,\n        ttlMs: durationMs + 8000\n      }\n    });\n\n    return res.json(buildModuleResponse({\n      testVipOverlayPreview: true,\n      previewOnly: true,\n      action,\n      result,\n      status: currentBus.getStatus()\n    }));\n  });\n\n`;

  js = js.replace(marker, route + marker);
  fs.writeFileSync(busTarget, js, 'utf8');
  console.log(`${step}_COMMUNICATION_PATCH=applied`);
  backups.forEach((b) => console.log(`communicationBackup=${b}`));
  return { changed: true, backups };
}

patchOverlay();
patchCommunicationBus();

const liveOverlay = copyToLive(overlayRel);
console.log(`LIVE_COPY_OVERLAY=${liveOverlay.copied ? 'copied' : 'skipped'}${liveOverlay.reason ? ' reason=' + liveOverlay.reason : ''}`);
if (liveOverlay.copied) console.log(`liveOverlay=${liveOverlay.dst}`);

const liveBus = copyToLive(busRel);
console.log(`LIVE_COPY_COMMUNICATION=${liveBus.copied ? 'copied' : 'skipped'}${liveBus.reason ? ' reason=' + liveBus.reason : ''}`);
if (liveBus.copied) console.log(`liveBackend=${liveBus.dst}`);

console.log('targetOverlay=htdocs/overlays/vip_sound_overlay_v2.html');
console.log('targetBackend=backend/modules/communication_bus.js');
console.log('NOTE=If LIVE_COPY_COMMUNICATION=copied, restart backend. Then reload OBS VIP overlay/browser source before running STEP403 diagnostic.');
