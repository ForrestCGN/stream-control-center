'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function abs(p) {
  return path.join(ROOT, p.replace(/[\\/]+/g, path.sep));
}

function readText(p) {
  try { return fs.readFileSync(abs(p), 'utf8'); }
  catch (_) { return ''; }
}

function writeText(p, content) {
  const full = abs(p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

function upsertMarkedSection(filePath, marker, section) {
  const start = `<!-- ${marker}:START -->`;
  const end = `<!-- ${marker}:END -->`;
  let current = readText(filePath);
  const block = `${start}\n${section.trim()}\n${end}`;

  if (!current.trim()) {
    writeText(filePath, `${block}\n`);
    return { filePath, action: 'created' };
  }

  const regex = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`, 'm');
  if (regex.test(current)) {
    current = current.replace(regex, block);
    writeText(filePath, ensureFinalNewline(current));
    return { filePath, action: 'updated_section' };
  }

  const lines = current.split(/\r?\n/);
  const insertAt = lines[0] && lines[0].startsWith('# ') ? 1 : 0;
  lines.splice(insertAt, 0, '', block, '');
  writeText(filePath, ensureFinalNewline(lines.join('\n')));
  return { filePath, action: 'inserted_section' };
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ensureFinalNewline(value) {
  return String(value || '').replace(/\s*$/g, '') + '\n';
}

const stableDoc = `# EVENTBUS CAN-3.7 STABLE STATUS

Stand: 2026-06-01
Status: stabiler Zwischenstand / Dokumentation

## Ergebnis

CAN-3 ist bis einschließlich CAN-3.6 erfolgreich geprüft.

\`\`\`text
CAN-3.1 Trace IDs: live
CAN-3.2 Trace Matching: live
CAN-3.3 ACK-State Plan: dokumentiert
CAN-3.4 Handshake-State in Alert-Korrelation: live
CAN-3.5 Handshake-State in Bus-Diagnostics: live
CAN-3.6 Live-Test mit echtem Alert: erfolgreich
\`\`\`

## Bestätigter Live-Stand

\`\`\`text
alert_system: 3.1.8
sound_system: 0.1.20
bus_diagnostics: 1.2.2
\`\`\`

## CAN-3.6 Testergebnis

\`\`\`text
handshakeState: matched
alertRows: 2
soundRows: 2
matched: 2
unmatched: 0
warnings: []
bundlesOk: 1
bundlesFailed: 0
\`\`\`

## Bestätigte Kette

\`\`\`text
Alert -> Bundle -> Sound-System -> Matching -> Handshake-State
\`\`\`

## Nicht geändert

\`\`\`text
Keine Queue-Logik geändert
Keine Sound-Playback-Logik geändert
Keine Overlay-Logik geändert
Keine TTS-Logik geändert
Keine DB-/Config-Änderung
Keine Recovery-Automatik
\`\`\`

## Relevante Prüfbefehle

\`\`\`powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/correlation/status?check=1" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/check" | ConvertTo-Json -Depth 10
\`\`\`

## Nächster sinnvoller Schritt

CAN-4 sollte nicht sofort produktive Flows umbauen. Sinnvoll ist zuerst ein weiterer Diagnose-/Absicherungs-Step:

\`\`\`text
CAN-4.0: Overlay ACK / Visual Delivery Diagnose konsolidieren
\`\`\`

Ziel: erkennen, ob ein Alert zwar Sound/Bundle sauber matched, aber das Visual Overlay kein Finish/ACK liefert.
`;

const currentStatusSection = `## CAN-3.7 stabiler Zwischenstand

Stand: 2026-06-01

### Ergebnis

CAN-3 ist bis einschließlich CAN-3.6 erfolgreich geprüft.

\`\`\`text
alert_system: 3.1.8
sound_system: 0.1.20
bus_diagnostics: 1.2.2
handshakeState: matched
matched: 2
unmatched: 0
warnings: []
\`\`\`

### Bestätigte Kette

\`\`\`text
Alert -> Bundle -> Sound-System -> Matching -> Handshake-State
\`\`\`

### Wichtig

Dieser Stand ist ein Diagnose-/Stabilitätsstand. Es wurden keine produktiven Flow-Umbauten an Queue, Sound-Playback, Overlay, TTS, DB oder Config vorgenommen.

Details: \`docs/system-inspection/EVENTBUS_CAN3_7_STABLE_STATUS.md\`
`;

const nextStepsSection = `## Nächste Schritte nach CAN-3.7

### Nächster sinnvoller Schritt

\`\`\`text
CAN-4.0: Overlay ACK / Visual Delivery Diagnose konsolidieren
\`\`\`

### Ziel

- Visual-Overlay-ACK/Finish sauber sichtbar machen.
- Prüfen, ob Sound/Bundle gematched ist, aber Overlay-Finish fehlt.
- Keine produktive Flow-Änderung ohne separaten Test.
- Keine Queue-, Sound-, Overlay-, TTS-, DB- oder Config-Logik entfernen.

### Prüfbasis

\`\`\`text
alert_system 3.1.8
sound_system 0.1.20
bus_diagnostics 1.2.2
CAN-3.6 Live-Test: matched / warnings []
\`\`\`
`;

const results = [];
writeText('docs/system-inspection/EVENTBUS_CAN3_7_STABLE_STATUS.md', stableDoc);
results.push({ filePath: 'docs/system-inspection/EVENTBUS_CAN3_7_STABLE_STATUS.md', action: 'written' });
results.push(upsertMarkedSection('project-state/CURRENT_STATUS.md', 'CAN-3.7-STABLE-STATUS', currentStatusSection));
results.push(upsertMarkedSection('project-state/NEXT_STEPS.md', 'CAN-3.7-NEXT-STEPS', nextStepsSection));

console.log(JSON.stringify({
  ok: true,
  step: 'CAN-3.7',
  description: 'Dokumentation und stabiler Zwischenstand für CAN-3',
  codeChanged: false,
  flowTouched: false,
  files: results
}, null, 2));
