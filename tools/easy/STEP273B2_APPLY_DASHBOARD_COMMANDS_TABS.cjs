'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const indexFile = path.join(root, 'htdocs', 'dashboard', 'index.html');
const appFile = path.join(root, 'htdocs', 'dashboard', 'app.js');

function read(file) {
  if (!fs.existsSync(file)) throw new Error(`missing_file:${file}`);
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function insertBefore(content, marker, insert) {
  if (content.includes(insert.trim())) return content;
  const idx = content.indexOf(marker);
  if (idx < 0) throw new Error(`marker_not_found:${marker}`);
  return content.slice(0, idx) + insert + content.slice(idx);
}

function ensureCss(content) {
  if (content.includes('/dashboard/modules/commands.css')) return content;
  const insert = '  <link rel="stylesheet" href="/dashboard/modules/commands.css" />\n';
  if (content.includes('  <link rel="stylesheet" href="/dashboard/modules/loyalty.css" />')) {
    return insertBefore(content, '  <link rel="stylesheet" href="/dashboard/modules/loyalty.css" />', insert);
  }
  return insertBefore(content, '</head>', insert);
}

function ensurePanel(content) {
  if (content.includes('id="commandsModule"')) return content;
  const insert = '      <section id="commandsModule" class="dashboard-module commands-admin" data-module-panel="commands" hidden></section>\n';
  if (content.includes('      <section id="deathcounterModule"')) {
    return insertBefore(content, '      <section id="deathcounterModule"', insert);
  }
  if (content.includes('      <section id="loyaltyModule"')) {
    return insertBefore(content, '      <section id="loyaltyModule"', insert);
  }
  throw new Error('panel_marker_not_found');
}

function ensureScript(content) {
  if (content.includes('/dashboard/modules/commands.js')) return content;
  const insert = '  <script src="/dashboard/modules/commands.js"></script>\n';
  if (content.includes('  <script src="/dashboard/modules/deathcounter.js"></script>')) {
    return insertBefore(content, '  <script src="/dashboard/modules/deathcounter.js"></script>', insert);
  }
  if (content.includes('  <script src="/dashboard/modules/loyalty.js"></script>')) {
    return insertBefore(content, '  <script src="/dashboard/modules/loyalty.js"></script>', insert);
  }
  return insertBefore(content, '</body>', insert);
}

function patchIndex() {
  let content = read(indexFile);
  content = ensureCss(content);
  content = ensurePanel(content);
  content = ensureScript(content);
  write(indexFile, content);
}

function ensureModuleRegistry(content) {
  if (content.includes('panelId: \'commandsModule\'') || content.includes('panelId: "commandsModule"')) return content;
  const insert = `    commands: {\n      title: 'Commands',\n      panelId: 'commandsModule',\n      group: 'community',\n      overlayLink: '',\n      reload() { return window.CommandsModule?.loadAll?.(true); }\n    },\n`;
  const markers = [
    '    deathcounter: {',
    '    tagebuch: {'
  ];
  for (const marker of markers) {
    if (content.includes(marker)) return insertBefore(content, marker, insert);
  }
  throw new Error('module_registry_marker_not_found');
}

function enableCatalog(content) {
  const oldLine = "commands: { label: 'Commands', icon: '⌨️', enabled: false, description: 'Chat-Befehle vorbereitet.' }";
  const newLine = "commands: { label: 'Commands', icon: '⌨️', enabled: true, description: 'Chat-Befehle zentral verwalten.' }";
  if (content.includes(oldLine)) return content.replace(oldLine, newLine);

  const oldRegex = /commands:\s*\{\s*label:\s*'Commands',\s*icon:\s*'⌨️',\s*enabled:\s*false,\s*description:\s*'[^']*'\s*\}/;
  if (oldRegex.test(content)) return content.replace(oldRegex, newLine);
  return content;
}

function ensureFavorites(content) {
  if (!content.includes("favorites: ['clips', 'alerts', 'vip', 'hug', 'tagebuch', 'todo', 'obs', 'sound_system', 'message_rotator']")) return content;
  return content.replace(
    "favorites: ['clips', 'alerts', 'vip', 'hug', 'tagebuch', 'todo', 'obs', 'sound_system', 'message_rotator']",
    "favorites: ['clips', 'alerts', 'vip', 'hug', 'commands', 'tagebuch', 'todo', 'obs', 'sound_system', 'message_rotator']"
  );
}

function patchApp() {
  let content = read(appFile);
  content = ensureModuleRegistry(content);
  content = enableCatalog(content);
  content = ensureFavorites(content);
  write(appFile, content);
}

patchIndex();
patchApp();
console.log('[STEP273B2] Dashboard Commands tabbed hook applied.');
console.log(`[STEP273B2] Patched: ${indexFile}`);
console.log(`[STEP273B2] Patched: ${appFile}`);
