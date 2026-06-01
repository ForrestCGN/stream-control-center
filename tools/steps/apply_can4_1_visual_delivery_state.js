const fs = require('fs');
const path = require('path');

const root = process.cwd();
const target = path.join(root, 'backend', 'modules', 'alert_system.js');
if (!fs.existsSync(target)) {
  console.error('[CAN-4.1] Datei nicht gefunden:', target);
  process.exit(1);
}

let text = fs.readFileSync(target, 'utf8');
let changed = false;
function replaceOnce(search, replacement, label) {
  if (text.includes(replacement)) return;
  if (!text.includes(search)) {
    console.error('[CAN-4.1] Marker nicht gefunden:', label);
    process.exit(1);
  }
  text = text.replace(search, replacement);
  changed = true;
}

replaceOnce("const MODULE_VERSION = '3.1.8';", "const MODULE_VERSION = '3.1.9';", 'MODULE_VERSION');
replaceOnce(
  "STEP CAN-3.4: additive read-only handshake state diagnostics; runtime flow unchanged.",
  "STEP CAN-4.1: additive read-only visual delivery state diagnostics; runtime flow unchanged.",
  'MODULE_META note'
);

const handshakeFunction = `function handshakeStateFromComparison(alertRows, soundRows, comparison, soundFetch) {
  const soundFetchOk = !!(soundFetch && soundFetch.ok === true);
  const alertCount = Array.isArray(alertRows) ? alertRows.length : 0;
  const soundCount = Array.isArray(soundRows) ? soundRows.length : 0;
  const matched = Number((comparison && comparison.matched) || 0);
  const unmatched = Number((comparison && comparison.unmatched) || 0);
  const soundUnavailable = !soundFetchOk;
  const stateName = soundUnavailable
    ? 'sound_eventbus_unavailable'
    : alertCount <= 0 && soundCount <= 0
      ? 'idle_no_recent_handshake'
      : matched > 0 && unmatched <= 0
        ? 'matched'
        : matched > 0 && unmatched > 0
          ? 'partial_match'
          : alertCount > 0 && soundCount <= 0
            ? 'awaiting_sound_rows'
            : unmatched > 0
              ? 'unmatched_alert_rows'
              : 'observed';
  const ok = !soundUnavailable && unmatched <= 0;
  const warning = !soundUnavailable && (stateName === 'partial_match' || stateName === 'awaiting_sound_rows' || stateName === 'unmatched_alert_rows');
  return {
    ok,
    warning,
    state: stateName,
    readOnly: true,
    flowTouched: false,
    alertRows: alertCount,
    soundRows: soundCount,
    matched,
    unmatched,
    soundFetchOk,
    nextAction: warning ? 'observe_or_test_live_alert' : '',
    checkedAt: nowIso()
  };
}
`;

const visualFunction = handshakeFunction + `
function visualDeliveryStateFromComparison(alertRows, comparison) {
  const now = Date.now();
  const alertCount = Array.isArray(alertRows) ? alertRows.length : 0;
  const matched = Number((comparison && comparison.matched) || 0);
  const matchedEventUids = new Set((comparison && Array.isArray(comparison.matches) ? comparison.matches : [])
    .map(row => cleanText(row && row.eventUid || ''))
    .filter(Boolean));
  const alertEventUids = new Set((alertRows || [])
    .map(row => cleanText(row && row.eventUid || ''))
    .filter(Boolean));
  const allDeliveries = Array.from(state.overlayDeliveryByEvent.values())
    .map(record => publicOverlayDelivery(record, now))
    .filter(Boolean);
  const relevantDeliveries = allDeliveries.filter(row => {
    const uid = cleanText(row.eventUid || row.alertId || '');
    return uid && (matchedEventUids.has(uid) || alertEventUids.has(uid));
  });
  const rows = (relevantDeliveries.length ? relevantDeliveries : allDeliveries).slice(0, 20);
  const acknowledged = rows.filter(row => row.status === 'acknowledged').length;
  const waiting = rows.filter(row => row.status === 'waiting_for_finish_ack').length;
  const missingAck = rows.filter(row => row.status === 'missing_finish_ack').length;
  const noClient = rows.filter(row => row.status === 'no_overlay_client').length;
  const stateName = alertCount <= 0 && rows.length <= 0
    ? 'idle_no_recent_visual_delivery'
    : matched <= 0 && alertCount > 0
      ? 'sound_not_matched_yet'
      : rows.length <= 0
        ? 'visual_delivery_not_seen'
        : missingAck > 0
          ? 'matched_but_visual_ack_missing'
          : noClient > 0
            ? 'matched_but_no_overlay_client'
            : waiting > 0
              ? 'matched_waiting_for_visual_ack'
              : acknowledged > 0
                ? 'matched_and_visual_acknowledged'
                : 'visual_delivery_observed';
  const warning = stateName === 'visual_delivery_not_seen'
    || stateName === 'matched_but_visual_ack_missing'
    || stateName === 'matched_but_no_overlay_client';
  return {
    ok: !warning,
    warning,
    state: stateName,
    readOnly: true,
    flowTouched: false,
    alertRows: alertCount,
    soundMatched: matched,
    overlayRows: rows.length,
    acknowledged,
    waiting,
    missingAck,
    noClient,
    overlayClients: state.overlayClients.size,
    nextAction: warning ? 'check_overlay_client_or_finish_ack' : '',
    recent: rows,
    checkedAt: nowIso()
  };
}
`;

if (!text.includes('function visualDeliveryStateFromComparison')) {
  replaceOnce(handshakeFunction, visualFunction, 'insert visualDeliveryStateFromComparison');
}

replaceOnce(
`  const comparison = compareAlertSoundCorrelation(alertRows, soundRows);
  const handshakeState = handshakeStateFromComparison(alertRows, soundRows, comparison, soundFetch);
  const warnings = [];
  if (!soundFetch.ok) warnings.push('sound_eventbus_status_unavailable');
  if (alertRows.length > 0 && soundRows.length === 0 && soundFetch.ok) warnings.push('no_sound_alert_correlation_rows_seen_yet');
  if (comparison.unmatched > 0 && comparison.matched === 0 && alertRows.length > 0 && soundRows.length > 0) warnings.push('alert_rows_not_matched_to_sound_rows');
`,
`  const comparison = compareAlertSoundCorrelation(alertRows, soundRows);
  const handshakeState = handshakeStateFromComparison(alertRows, soundRows, comparison, soundFetch);
  const visualDeliveryState = visualDeliveryStateFromComparison(alertRows, comparison);
  const warnings = [];
  if (!soundFetch.ok) warnings.push('sound_eventbus_status_unavailable');
  if (alertRows.length > 0 && soundRows.length === 0 && soundFetch.ok) warnings.push('no_sound_alert_correlation_rows_seen_yet');
  if (comparison.unmatched > 0 && comparison.matched === 0 && alertRows.length > 0 && soundRows.length > 0) warnings.push('alert_rows_not_matched_to_sound_rows');
  if (visualDeliveryState.warning) warnings.push('visual_delivery_' + visualDeliveryState.state);
`,
  'visual warning state'
);

replaceOnce(
`    traceCorrelationVersion: 'CAN-3.4',
    matchingKeys: ['eventUid', 'requestId', 'correlationId', 'bundleId'],
`,
`    traceCorrelationVersion: 'CAN-4.1',
    visualDeliveryVersion: 'CAN-4.1',
    matchingKeys: ['eventUid', 'requestId', 'correlationId', 'bundleId'],
`,
  'status version fields'
);

replaceOnce(
`    comparison,
    handshakeState,
    warnings,
`,
`    comparison,
    handshakeState,
    visualDeliveryState,
    warnings,
`,
  'status visualDeliveryState field'
);

if (changed) {
  fs.writeFileSync(target, text, 'utf8');
  console.log('[CAN-4.1] alert_system.js aktualisiert.');
} else {
  console.log('[CAN-4.1] Keine Änderung nötig.');
}
