const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const overlayTarget = path.join(repoRoot, 'htdocs', 'overlays', 'vip_sound_overlay_v2.html');
const busTarget = path.join(repoRoot, 'backend', 'modules', 'communication_bus.js');
const step = 'STEP401';

function fail(message) {
  console.error(`${step}_ERROR=${message}`);
  process.exit(1);
}

function backupFile(file, label) {
  const backup = `${file}.${label}_${new Date().toISOString().replace(/[:.]/g, '-')}.bak`;
  fs.writeFileSync(backup, fs.readFileSync(file, 'utf8'), 'utf8');
  return backup;
}

function patchOverlay() {
  if (!fs.existsSync(overlayTarget)) fail(`overlay_not_found:${overlayTarget}`);
  let html = fs.readFileSync(overlayTarget, 'utf8');
  const backups = [];

  if (!html.includes('function sendVipBusShadowHello')) {
    fail('STEP399_bus_shadow_registration_missing_apply_STEP399_first');
  }

  let changed = false;
  if (!html.includes('function normalizeVipOverlayBusEnvelope')) {
    backups.push(backupFile(overlayTarget, 'step401_overlay'));
    const marker = `    function sendVipBusShadowHello() {`;
    const insert = `    function normalizeVipOverlayBusEnvelope(data) {\n      if (!data || typeof data !== "object") return null;\n      const channel = safeString(data.channel).toLowerCase();\n      const action = safeString(data.action || data.event).toLowerCase();\n      if (channel !== "vip.overlay") return null;\n      if (!["test", "show", "hide", "update"].includes(action)) return null;\n      return {\n        eventId: safeString(data.id || data.eventId),\n        action,\n        payload: data.payload && typeof data.payload === "object" ? data.payload : {},\n        raw: data\n      };\n    }\n\n    function sendVipOverlayBusAck(eventId, status, details = {}) {\n      const id = safeString(eventId);\n      if (!id || !ws || ws.readyState !== WebSocket.OPEN) return;\n      try {\n        ws.send(JSON.stringify({\n          type: "bus_ack",\n          eventId: id,\n          clientId: "vip_sound_overlay_v2",\n          status: safeString(status, "received"),\n          details: Object.assign({\n            module: "vip_sound_overlay",\n            overlay: "vip_sound_overlay_v2.html",\n            mode: "shadow",\n            step: 401\n          }, details || {})\n        }));\n      } catch (_) {}\n    }\n\n    function handleVipOverlayBusShadowEvent(data) {\n      const normalized = normalizeVipOverlayBusEnvelope(data);\n      if (!normalized) return false;\n\n      // STEP401 shadow mode: acknowledge and debug only.\n      // Do not call showOverlay()/hideOverlay() here yet; production rendering remains driven by sound_system.\n      sendVipOverlayBusAck(normalized.eventId, "received", {\n        action: normalized.action,\n        shadowOnly: true,\n        requestId: safeString(normalized.payload.requestId)\n      });\n\n      setDebug([\n        "VIP BUS SHADOW EVENT",\n        "action=" + normalized.action,\n        "eventId=" + normalized.eventId,\n        "requestId=" + safeString(normalized.payload.requestId),\n        "displayName=" + safeString(normalized.payload.displayName || normalized.payload.user),\n        "shadowOnly=true",\n        "soundSystemFlow=unchanged"\n      ]);\n\n      return true;\n    }\n\n` + marker;
    if (!html.includes(marker)) fail('sendVipBusShadowHello_marker_not_found');
    html = html.replace(marker, insert);
    changed = true;
  }

  if (html.includes('capabilities: ["vip.overlay.show", "vip.overlay.hide", "vip.overlay.update", "ack"]')) {
    if (!changed) backups.push(backupFile(overlayTarget, 'step401_overlay'));
    html = html.replace('capabilities: ["vip.overlay.show", "vip.overlay.hide", "vip.overlay.update", "ack"]', 'capabilities: ["vip.overlay.test", "vip.overlay.show", "vip.overlay.hide", "vip.overlay.update", "ack"]');
    changed = true;
  }

  if (html.includes('version: "STEP399"')) {
    if (!changed) backups.push(backupFile(overlayTarget, 'step401_overlay'));
    html = html.replace('version: "STEP399"', 'version: "STEP401"');
    changed = true;
  }

  const oldMessage = `      ws.addEventListener("message", (event) => {\n        try { handleSoundSystemEvent(JSON.parse(event.data)); } catch (_) {}\n      });`;
  const newMessage = `      ws.addEventListener("message", (event) => {\n        try {\n          const data = JSON.parse(event.data);\n          if (handleVipOverlayBusShadowEvent(data)) return;\n          handleSoundSystemEvent(data);\n        } catch (_) {}\n      });`;
  if (html.includes(oldMessage)) {
    if (!changed) backups.push(backupFile(overlayTarget, 'step401_overlay'));
    html = html.replace(oldMessage, newMessage);
    changed = true;
  }

  if (!changed && html.includes('handleVipOverlayBusShadowEvent') && html.includes('vip.overlay.test')) {
    console.log(`${step}_OVERLAY_PATCH=already_applied`);
    return { changed: false, backups };
  }

  if (!html.includes('handleVipOverlayBusShadowEvent')) fail('overlay_patch_failed_handler_missing');
  fs.writeFileSync(overlayTarget, html, 'utf8');
  console.log(`${step}_OVERLAY_PATCH=${changed ? 'applied' : 'already_applied'}`);
  backups.forEach((b) => console.log(`overlayBackup=${b}`));
  return { changed, backups };
}

function patchCommunicationBus() {
  if (!fs.existsSync(busTarget)) fail(`communication_bus_not_found:${busTarget}`);
  let js = fs.readFileSync(busTarget, 'utf8');

  if (js.includes("/api/communication/test-vip-overlay")) {
    console.log(`${step}_COMMUNICATION_PATCH=already_applied`);
    return { changed: false, backups: [] };
  }

  const backups = [backupFile(busTarget, 'step401_communication')];
  const marker = `  app.get('/api/communication/reset', (req, res) => {`;
  if (!js.includes(marker)) fail('communication_reset_route_marker_not_found');

  const route = `\n  app.get('/api/communication/test-vip-overlay', (req, res) => {\n    const currentBus = getBus();\n    if (!currentBus || typeof currentBus.emit !== 'function') {\n      return res.status(500).json({ ok: false, error: 'communication_bus_unavailable' });\n    }\n\n    const displayName = cleanString(req.query.displayName || req.query.user || 'STEP401_VIP_Test');\n    const durationRaw = Number.parseInt(String(req.query.durationMs || '5000'), 10);\n    const durationMs = Math.max(1000, Math.min(30000, Number.isFinite(durationRaw) ? durationRaw : 5000));\n    const requestId = cleanString(req.query.requestId || ('step401-vip-' + Date.now()));\n    const requireAck = boolParam(req.query.requireAck, true);\n    const replayable = boolParam(req.query.replayable, true);\n\n    const result = currentBus.emit({\n      type: 'event',\n      channel: 'vip.overlay',\n      action: 'test',\n      source: { type: 'diagnostic', id: 'STEP401', module: 'vip_sound_overlay' },\n      target: { type: 'module', module: 'vip_sound_overlay', capability: 'vip.overlay.test' },\n      payload: {\n        test: true,\n        shadowOnly: true,\n        step: 401,\n        requestId,\n        displayName,\n        user: displayName,\n        title: cleanString(req.query.title || 'VIP Event-Bus Shadow Test'),\n        text: cleanString(req.query.text || 'Shadow-Test: Empfang/Ack ohne Anzeige-Umbau.'),\n        avatarUrl: cleanString(req.query.avatarUrl || ''),\n        durationMs,\n        emittedAt: new Date().toISOString()\n      },\n      meta: {\n        module: 'vip_sound_overlay',\n        step: 401,\n        shadowOnly: true,\n        requireAck,\n        replayable,\n        ttlMs: durationMs + 5000\n      }\n    });\n\n    return res.json(buildModuleResponse({\n      testVipOverlay: true,\n      shadowOnly: true,\n      result,\n      status: currentBus.getStatus()\n    }));\n  });\n\n`;

  js = js.replace(marker, route + marker);
  fs.writeFileSync(busTarget, js, 'utf8');
  console.log(`${step}_COMMUNICATION_PATCH=applied`);
  backups.forEach((b) => console.log(`communicationBackup=${b}`));
  return { changed: true, backups };
}

patchOverlay();
patchCommunicationBus();
console.log('targetOverlay=htdocs/overlays/vip_sound_overlay_v2.html');
console.log('targetBackend=backend/modules/communication_bus.js');
console.log('NOTE=Deploy changed files to live, restart backend for communication_bus.js, then reload OBS VIP overlay/browser source.');
