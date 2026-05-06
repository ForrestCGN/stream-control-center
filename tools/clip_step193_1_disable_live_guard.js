const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const filePath = path.join(repoRoot, 'backend', 'modules', 'clips.js');

if (!fs.existsSync(filePath)) {
  console.error('[clip-step193.1] Datei nicht gefunden:', filePath);
  process.exit(1);
}

let text = fs.readFileSync(filePath, 'utf8');

if (text.includes('STEP193.1_DISABLE_LIVE_GUARD_APPLIED')) {
  console.log('[clip-step193.1] Bereits angewendet. Keine Änderung.');
  process.exit(0);
}

const marker = 'channelInfo.is_live === false';
const markerIndex = text.indexOf(marker);

if (markerIndex < 0) {
  console.error('[clip-step193.1] Marker nicht gefunden:', marker);
  console.error('[clip-step193.1] Nichts geändert. Bitte backend/modules/clips.js prüfen.');
  process.exit(2);
}

function findIfStart(src, beforeIndex) {
  const re = /\bif\s*\(/g;
  let last = -1;
  let match;
  while ((match = re.exec(src)) && match.index < beforeIndex) {
    last = match.index;
  }
  return last;
}

function findMatchingBrace(src, openIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIndex; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];

    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i++;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      lineComment = true;
      i++;
      continue;
    }

    if (ch === '/' && next === '*') {
      blockComment = true;
      i++;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }

    if (ch === '{') {
      depth++;
      continue;
    }

    if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }

  return -1;
}

const ifStart = findIfStart(text, markerIndex);
if (ifStart < 0) {
  console.error('[clip-step193.1] Konnte if-Start vor Live-Guard nicht finden.');
  process.exit(3);
}

const openBrace = text.indexOf('{', ifStart);
if (openBrace < 0 || openBrace > markerIndex + 500) {
  console.error('[clip-step193.1] Konnte öffnende Klammer des Live-Guards nicht sicher finden.');
  process.exit(4);
}

const closeBrace = findMatchingBrace(text, openBrace);
if (closeBrace < 0) {
  console.error('[clip-step193.1] Konnte schließende Klammer des Live-Guards nicht finden.');
  process.exit(5);
}

const oldBlock = text.slice(ifStart, closeBrace + 1);

if (!oldBlock.includes('stream_not_live')) {
  console.error('[clip-step193.1] Gefundener Block enthält nicht stream_not_live. Sicherheitsabbruch.');
  console.error(oldBlock.slice(0, 500));
  process.exit(6);
}

const replacement = `// STEP193.1_DISABLE_LIVE_GUARD_APPLIED
    // Twitch Helix /streams meldet aktuell teilweise offline, obwohl der Kanal live ist.
    // Deshalb blockiert /api/clip/create nicht mehr vorab anhand von channelInfo.is_live.
    // Wenn der Kanal wirklich offline ist, schlägt Twitch Create Clip selbst fehl und die History schreibt failed.
    // Der alte stream_not_live-Skip-Guard wurde bewusst entfernt.`;

text = text.slice(0, ifStart) + replacement + text.slice(closeBrace + 1);

text = text.replace(
  '// STEP187 — Clip Backend-Create: lokales OBS-Replay-Dateihandling.',
  '// STEP193.1 — Clip Backend-Create: Live-Guard entfernt, Twitch Create Clip entscheidet selbst.'
);

const backupPath = filePath + '.step193_1_backup';
if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, fs.readFileSync(filePath));
}

fs.writeFileSync(filePath, text, 'utf8');

console.log('[clip-step193.1] Live-Guard entfernt.');
console.log('[clip-step193.1] Backup:', backupPath);
console.log('[clip-step193.1] Geändert:', filePath);
