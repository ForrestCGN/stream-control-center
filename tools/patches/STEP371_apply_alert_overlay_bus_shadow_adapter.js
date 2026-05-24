'use strict';

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const targetPath = path.join(repoRoot, 'htdocs', 'overlays', '_overlay-alerts-v2.html');
const stepMarker = 'STEP371_ALERT_BUS_SHADOW_ADAPTER';

function fail(message) {
  console.error(`[STEP371] ERROR: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(targetPath)) {
  fail(`Target file not found: ${targetPath}`);
}

let source = fs.readFileSync(targetPath, 'utf8');

if (source.includes(stepMarker)) {
  console.log('[STEP371] Overlay already contains STEP371 shadow adapter. Nothing to do.');
  process.exit(0);
}

const openOld = "ws.addEventListener('open', () => send({ op: 'alert_system', client: 'overlay', event: 'hello' }));";
const openNew = `ws.addEventListener('open', () => {
        send({ op: 'alert_system', client: 'overlay', event: 'hello' });
        // ${stepMarker}: bus client registration for shadow-mode delivery tests.
        send({
          type: 'bus_hello',
          clientId: 'alert_overlay_v2_shadow',
          clientType: 'overlay',
          module: 'alert_system',
          mode: 'shadow',
          capabilities: ['visual.alert.play', 'visual.alert.clear'],
          version: 'STEP371'
        });
      });`;

if (!source.includes(openOld)) {
  fail('Could not find WebSocket open hello line. File may have changed.');
}
source = source.replace(openOld, openNew);

const varsOld = `let currentTimer = null;
    let currentAlertId = null;
    const PREVIEW_MODE = new URLSearchParams(location.search).has('preview');`;
const varsNew = `let currentTimer = null;
    let currentAlertId = null;
    let currentBusEventId = null; // ${stepMarker}: only set for communication-bus shadow events.
    const PREVIEW_MODE = new URLSearchParams(location.search).has('preview');`;

if (!source.includes(varsOld)) {
  fail('Could not find current timer/id variable block. File may have changed.');
}
source = source.replace(varsOld, varsNew);

const handlerOld = `if (!data || data.op !== 'alert_system') return;
        if (data.event === 'play' && data.alert) playAlert(data.alert);
        if (data.event === 'clear') clearAlert('clear');`;
const handlerNew = `const normalized = normalizeAlertTransportMessage(data);
        if (!normalized) return;
        if (normalized.event === 'play' && normalized.alert) playAlert(normalized.alert, normalized);
        if (normalized.event === 'clear') {
          if (normalized.busEventId) sendBusAck(normalized.busEventId, 'cleared', { reason: 'clear_event' });
          clearAlert('clear');
        }`;

if (!source.includes(handlerOld)) {
  fail('Could not find legacy WebSocket message handler block. File may have changed.');
}
source = source.replace(handlerOld, handlerNew);

const connectAnchor = `    function connect() {`;
const adapterFunctions = `
    // ${stepMarker}: Accept legacy alert_system messages and communication-bus envelopes in parallel.
    // Live output remains legacy until the backend mode is intentionally changed later.
    function normalizeAlertTransportMessage(data) {
      if (!data || typeof data !== 'object') return null;

      if (data.op === 'alert_system') {
        return {
          transport: 'legacy',
          event: data.event,
          alert: data.alert || null,
          busEventId: '',
          raw: data
        };
      }

      return normalizeAlertBusEnvelope(data);
    }

    function normalizeAlertBusEnvelope(data) {
      const channel = String(data.channel || '').toLowerCase();
      const action = String(data.action || data.event || '').toLowerCase();
      if (channel !== 'visual.alert') return null;
      if (action !== 'play' && action !== 'clear') return null;

      const payload = data.payload && typeof data.payload === 'object' ? data.payload : {};
      const alert = payload.alert || payload.visualAlert || payload.alertPayload ||
        (payload.id || payload.eventUid || payload.event_uid ? payload : null);

      if (action === 'clear') {
        return {
          transport: 'bus',
          event: 'clear',
          alert: null,
          busEventId: String(data.id || data.eventId || ''),
          raw: data
        };
      }

      if (!alert || typeof alert !== 'object') return null;

      return {
        transport: 'bus',
        event: 'play',
        alert,
        busEventId: String(data.id || data.eventId || ''),
        raw: data
      };
    }

    function sendBusAck(eventId, status, details = {}) {
      const id = String(eventId || '').trim();
      if (!id) return;
      send({
        type: 'bus_ack',
        eventId: id,
        clientId: 'alert_overlay_v2_shadow',
        status: String(status || 'received'),
        details: {
          module: 'alert_system',
          overlay: '_overlay-alerts-v2.html',
          mode: 'shadow',
          step: 371,
          ...details
        }
      });
    }

`;

if (!source.includes(connectAnchor)) {
  fail('Could not find connect() anchor. File may have changed.');
}
source = source.replace(connectAnchor, adapterFunctions + connectAnchor);

const playOld = `function playAlert(alert) {
      clearAlert('replace', false);
      currentAlertId = alert.id;`;
const playNew = `function playAlert(alert, transportContext = {}) {
      clearAlert('replace', false);
      currentAlertId = alert.id;
      currentBusEventId = transportContext && transportContext.transport === 'bus' ? (transportContext.busEventId || '') : '';
      if (currentBusEventId) sendBusAck(currentBusEventId, 'received', { alertId: currentAlertId || '', action: 'play' });`;

if (!source.includes(playOld)) {
  fail('Could not find playAlert signature block. File may have changed.');
}
source = source.replace(playOld, playNew);

const clearOld = `if (ack && currentAlertId) send({ op: 'alert_system', client: 'overlay', event: 'finished', alertId: currentAlertId, reason });
      currentAlertId = null;`;
const clearNew = `if (ack && currentAlertId) send({ op: 'alert_system', client: 'overlay', event: 'finished', alertId: currentAlertId, reason });
      if (ack && currentBusEventId) sendBusAck(currentBusEventId, reason === 'finished' ? 'finished' : 'cleared', { alertId: currentAlertId || '', reason });
      currentBusEventId = null;
      currentAlertId = null;`;

if (!source.includes(clearOld)) {
  fail('Could not find clearAlert finished ack block. File may have changed.');
}
source = source.replace(clearOld, clearNew);

fs.writeFileSync(targetPath, source, 'utf8');
console.log('[STEP371] Applied alert overlay bus shadow adapter.');
console.log(`[STEP371] Updated: ${path.relative(repoRoot, targetPath)}`);
