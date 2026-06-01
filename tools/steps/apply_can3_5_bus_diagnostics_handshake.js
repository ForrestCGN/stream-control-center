'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const file = path.join(root, 'backend', 'modules', 'bus_diagnostics.js');

if (!fs.existsSync(file)) {
  console.error('[CAN-3.5] Datei nicht gefunden:', file);
  process.exit(1);
}

let s = fs.readFileSync(file, 'utf8');

function replaceOnce(from, to, label) {
  if (!s.includes(from)) {
    console.error('[CAN-3.5] Marker nicht gefunden:', label || from);
    process.exit(1);
  }
  s = s.replace(from, to);
}

replaceOnce("const VERSION = '1.2.1';", "const VERSION = '1.2.2';", 'version');
replaceOnce("build: 'STEP_CAN2_2',", "build: 'STEP_CAN3_5',", 'module build');
replaceOnce(
  "description: 'Read-only Communication-Bus, Alert/Sound, VIP, resilience-matrix and optional-diagnostics aggregator.',",
  "description: 'Read-only Communication-Bus, Alert/Sound, VIP, resilience-matrix, optional-diagnostics and handshake-state aggregator.',",
  'description'
);
replaceOnce(
  "{ method: 'GET', path: '/api/bus-diagnostics/status', description: 'Enthaelt STEP CAN-2 resilienceMatrix und STEP CAN-2.2 optionalDiagnostics.' },",
  "{ method: 'GET', path: '/api/bus-diagnostics/status', description: 'Enthaelt STEP CAN-2 resilienceMatrix, STEP CAN-2.2 optionalDiagnostics und STEP CAN-3.5 handshakeState.' },",
  'routes description'
);
replaceOnce(
  "console.log('[bus_diagnostics] STEP_CAN2_2 Dashboard diagnostics, resilience matrix and optional diagnostics prepared');",
  "console.log('[bus_diagnostics] STEP_CAN3_5 Dashboard diagnostics, resilience matrix, optional diagnostics and handshake state prepared');",
  'console log'
);

replaceOnce(
  "  const comparison = (correlationBody || {}).comparison || {};\n  const vipClient = (vipBody || {}).client || {};",
  "  const comparison = (correlationBody || {}).comparison || {};\n  const handshakeState = (correlationBody || {}).handshakeState || {};\n  const vipClient = (vipBody || {}).client || {};",
  'handshakeState const'
);

replaceOnce(
  "    correlationMatched: Number(comparison.matched || 0),\n    correlationUnmatched: Number(comparison.unmatched || 0),",
  "    correlationMatched: Number(comparison.matched || 0),\n    correlationUnmatched: Number(comparison.unmatched || 0),\n    handshakeState: handshakeState.state || '',\n    handshakeOk: handshakeState.ok === true,\n    handshakeWarning: handshakeState.warning === true,\n    handshakeNextAction: handshakeState.nextAction || '',",
  'summary handshakeState'
);

replaceOnce(
  "    comparison: body && body.comparison ? body.comparison : undefined,\n    recentEvents: body && body.recentEvents ? body.recentEvents : undefined,",
  "    comparison: body && body.comparison ? body.comparison : undefined,\n    handshakeState: body && body.handshakeState ? body.handshakeState : undefined,\n    traceCorrelationVersion: body && body.traceCorrelationVersion ? body.traceCorrelationVersion : undefined,\n    matchingKeys: body && body.matchingKeys ? body.matchingKeys : undefined,\n    recentEvents: body && body.recentEvents ? body.recentEvents : undefined,",
  'compactFetch handshakeState'
);

fs.writeFileSync(file, s, 'utf8');
console.log('[CAN-3.5] bus_diagnostics.js aktualisiert auf 1.2.2');
