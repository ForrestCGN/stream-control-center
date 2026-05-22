'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const indexFile = path.join(root, 'htdocs', 'dashboard', 'index.html');
const appFile = path.join(root, 'htdocs', 'dashboard', 'app.js');

function read(file) {
  if (!fs.existsSync(file)) throw new Error(`Datei nicht gefunden: ${file}`);
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
  console.log(`[STEP273B1] geschrieben: ${path.relative(root, file)}`);
}

function patchIndex() {
  let s = read(indexFile);
  let changed = false;

  if (!s.includes('/dashboard/modules/commands.css')) {
    const needle = '  <link rel="stylesheet" href="/dashboard/modules/loyalty.css" />';
    if (!s.includes(needle)) throw new Error('Insert-Point fuer commands.css nicht gefunden.');
    s = s.replace(needle, `${needle}\n  <link rel="stylesheet" href="/dashboard/modules/commands.css" />`);
    changed = true;
  }

  if (!s.includes('id="commandsModule"')) {
    const needle = '      <section id="loyaltyModule" class="dashboard-module loyalty-admin" data-module-panel="loyalty" hidden></section>';
    if (!s.includes(needle)) throw new Error('Insert-Point fuer commandsModule nicht gefunden.');
    s = s.replace(needle, `${needle}\n      <section id="commandsModule" class="dashboard-module commands-admin" data-module-panel="commands" hidden></section>`);
    changed = true;
  }

  if (!s.includes('/dashboard/modules/commands.js')) {
    const needle = '  <script src="/dashboard/modules/loyalty.js"></script>';
    if (!s.includes(needle)) throw new Error('Insert-Point fuer commands.js nicht gefunden.');
    s = s.replace(needle, `${needle}\n  <script src="/dashboard/modules/commands.js"></script>`);
    changed = true;
  }

  if (changed) write(indexFile, s);
  else console.log('[STEP273B1] index.html war bereits gepatcht.');
}

function patchApp() {
  let s = read(appFile);
  let changed = false;

  if (!s.includes('panelId: \'commandsModule\'') && !s.includes('panelId: "commandsModule"')) {
    const needle = `    todo: {\n      title: 'Todo',\n      panelId: 'todoModule',\n      group: 'community',\n      overlayLink: '',\n      reload() { return window.TodoModule?.loadAll?.(true); }\n    },`;
    if (!s.includes(needle)) throw new Error('Insert-Point fuer window.CGN.modules.commands nicht gefunden.');
    const insert = `${needle}\n    commands: {\n      title: 'Commands',\n      panelId: 'commandsModule',\n      group: 'community',\n      overlayLink: '',\n      reload() { return window.CommandsModule?.loadAll?.(true); }\n    },`;
    s = s.replace(needle, insert);
    changed = true;
  }

  const oldCatalog = `commands: { label: 'Commands', icon: '⌨️', enabled: false, description: 'Chat-Befehle vorbereitet.' }`;
  const newCatalog = `commands: { label: 'Commands', icon: '⌨️', enabled: true, description: 'Chat-Befehle zentral verwalten und testen.' }`;
  if (s.includes(oldCatalog)) {
    s = s.replace(oldCatalog, newCatalog);
    changed = true;
  } else if (!s.includes(newCatalog)) {
    console.warn('[STEP273B1] WARN: moduleCatalog.commands wurde nicht eindeutig gefunden.');
  }

  const oldFav = `favorites: ['clips', 'alerts', 'vip', 'hug', 'tagebuch', 'todo', 'obs', 'sound_system', 'message_rotator'],`;
  const newFav = `favorites: ['clips', 'alerts', 'vip', 'hug', 'tagebuch', 'todo', 'commands', 'obs', 'sound_system', 'message_rotator'],`;
  if (s.includes(oldFav)) {
    s = s.replace(oldFav, newFav);
    changed = true;
  }

  if (changed) write(appFile, s);
  else console.log('[STEP273B1] app.js war bereits gepatcht.');
}

patchIndex();
patchApp();
console.log('[STEP273B1] Dashboard Commands Fix abgeschlossen.');
