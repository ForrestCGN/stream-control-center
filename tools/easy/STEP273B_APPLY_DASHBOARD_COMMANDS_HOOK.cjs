'use strict';

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const indexPath = path.join(repoRoot, 'htdocs', 'dashboard', 'index.html');
const appPath = path.join(repoRoot, 'htdocs', 'dashboard', 'app.js');

function read(file){ return fs.readFileSync(file, 'utf8'); }
function write(file, text){ fs.writeFileSync(file, text, 'utf8'); }
function insertOnce(text, marker, insertion, label){
  if (text.includes(insertion.trim())) return text;
  if (!text.includes(marker)) throw new Error(`Marker nicht gefunden: ${label}`);
  return text.replace(marker, `${marker}\n${insertion}`);
}
function replaceOnce(text, search, replacement, label){
  if (text.includes(replacement)) return text;
  if (!text.includes(search)) throw new Error(`Suchtext nicht gefunden: ${label}`);
  return text.replace(search, replacement);
}

let index = read(indexPath);
index = insertOnce(index, '  <link rel="stylesheet" href="/dashboard/modules/message_rotator.css" />', '  <link rel="stylesheet" href="/dashboard/modules/commands.css" />', 'commands css');
index = insertOnce(index, '      <section id="messageRotatorModule" class="dashboard-module message-rotator-admin" data-module-panel="message_rotator" hidden></section>', '      <section id="commandsModule" class="dashboard-module commands-admin" data-module-panel="commands" hidden></section>', 'commands section');
index = insertOnce(index, '  <script src="/dashboard/modules/message_rotator.js"></script>', '  <script src="/dashboard/modules/commands.js"></script>', 'commands script');
write(indexPath, index);

let app = read(appPath);
app = insertOnce(app, `    message_rotator: {
      title: 'Message-Rotator',
      panelId: 'messageRotatorModule',
      group: 'system',
      overlayLink: '',
      reload() { return window.MessageRotatorModule?.loadAll?.(true); }
    },`, `    commands: {
      title: 'Command-System',
      panelId: 'commandsModule',
      group: 'community',
      overlayLink: '',
      reload() { return window.CommandsModule?.loadAll?.(true); }
    },`, 'commands module registry');
app = replaceOnce(
  app,
  `    commands: { label: 'Commands', icon: '⌨️', enabled: false, description: 'Chat-Befehle vorbereitet.' },`,
  `    commands: { label: 'Commands', icon: '⌨️', enabled: true, description: 'Zentrale Chat-Befehle konfigurieren und testen.' },`,
  'commands catalog enabled'
);
app = replaceOnce(
  app,
  `  favorites: ['clips', 'alerts', 'vip', 'hug', 'tagebuch', 'todo', 'obs', 'sound_system', 'message_rotator'],`,
  `  favorites: ['clips', 'alerts', 'vip', 'hug', 'commands', 'tagebuch', 'todo', 'obs', 'sound_system', 'message_rotator'],`,
  'commands favorite'
);
write(appPath, app);

console.log('[STEP273B] Dashboard Commands Hook angewendet.');
console.log(`- ${path.relative(repoRoot, indexPath)}`);
console.log(`- ${path.relative(repoRoot, appPath)}`);
