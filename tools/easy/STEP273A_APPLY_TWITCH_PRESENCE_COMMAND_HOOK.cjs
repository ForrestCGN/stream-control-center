'use strict';

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const targetFile = path.join(repoRoot, 'backend', 'modules', 'twitch_presence.js');

if (!fs.existsSync(targetFile)) {
  console.error('[STEP273A] twitch_presence.js nicht gefunden:', targetFile);
  process.exit(1);
}

let src = fs.readFileSync(targetFile, 'utf8');
let changed = false;

if (!src.includes("const commands = require('./commands');")) {
  const needle = "const database = require('../core/database');\n";
  if (!src.includes(needle)) {
    console.error('[STEP273A] Einfügepunkt für commands-require nicht gefunden. Datei wurde nicht geändert.');
    process.exit(1);
  }
  src = src.replace(needle, needle + "const commands = require('./commands');\n");
  changed = true;
}

const hook = `
          if (parsed && String(parsed.command || '').toUpperCase() === 'PRIVMSG') {
            commands.handleChatMessage(parsed, { source: 'twitch_presence', channel: BOT_CHANNEL })
              .catch((err) => {
                lastError = err?.message || String(err);
                console.warn('[twitch_presence] command hook error:', lastError);
              });
          }
`;

if (!src.includes("commands.handleChatMessage(parsed, { source: 'twitch_presence', channel: BOT_CHANNEL })")) {
  const needle = "          const parsed = parseIrcLine(line);\n          handleIrcActivity(parsed);\n";
  if (!src.includes(needle)) {
    console.error('[STEP273A] Einfügepunkt für PRIVMSG-Hook nicht gefunden. Datei wurde nicht geändert.');
    process.exit(1);
  }
  src = src.replace(needle, needle + hook);
  changed = true;
}

if (changed) {
  fs.writeFileSync(targetFile, src, 'utf8');
  console.log('[STEP273A] twitch_presence.js Command-Hook wurde eingefügt.');
} else {
  console.log('[STEP273A] twitch_presence.js war bereits gepatcht. Keine Änderung nötig.');
}
