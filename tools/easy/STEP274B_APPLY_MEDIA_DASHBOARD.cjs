#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const indexPath = path.join(root, 'htdocs', 'dashboard', 'index.html');
const appPath = path.join(root, 'htdocs', 'dashboard', 'app.js');

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, content) { fs.writeFileSync(file, content, 'utf8'); }
function backup(file) {
  const target = `${file}.bak_STEP274B`;
  if (!fs.existsSync(target)) fs.copyFileSync(file, target);
}
function insertBefore(content, needle, insert) {
  if (content.includes(insert.trim())) return content;
  const idx = content.indexOf(needle);
  if (idx === -1) throw new Error(`Needle nicht gefunden: ${needle}`);
  return content.slice(0, idx) + insert + content.slice(idx);
}
function replaceOnce(content, search, replacement) {
  if (!content.includes(search)) throw new Error(`Suchtext nicht gefunden: ${search.slice(0, 80)}`);
  return content.replace(search, replacement);
}

backup(indexPath);
backup(appPath);

let index = read(indexPath);
index = insertBefore(index, '  <link rel="stylesheet" href="/dashboard/modules/message_rotator.css" />', '  <link rel="stylesheet" href="/dashboard/modules/media.css" />\n');
index = insertBefore(index, '      <section id="messageRotatorModule" class="dashboard-module message-rotator-admin" data-module-panel="message_rotator" hidden></section>', '      <section id="mediaModule" class="dashboard-module media-admin" data-module-panel="media" hidden></section>\n');
index = insertBefore(index, '  <script src="/dashboard/modules/message_rotator.js"></script>', '  <script src="/dashboard/modules/media.js"></script>\n');
write(indexPath, index);

let app = read(appPath);
if (!app.includes("media: {\n      title: 'Medienverwaltung'")) {
  app = insertBefore(app, "    message_rotator: {\n      title: 'Message-Rotator',", "    media: {\n      title: 'Medienverwaltung',\n      panelId: 'mediaModule',\n      group: 'system',\n      overlayLink: '',\n      reload() { return window.MediaModule?.loadAll?.(true); }\n    },\n");
}
if (app.includes("items: ['sound_system', 'tts', 'bot_systems', 'message_rotator', 'automations', 'integrations', 'module_status']")) {
  app = replaceOnce(app, "items: ['sound_system', 'tts', 'bot_systems', 'message_rotator', 'automations', 'integrations', 'module_status']", "items: ['sound_system', 'media', 'tts', 'bot_systems', 'message_rotator', 'automations', 'integrations', 'module_status']");
}
if (!app.includes("media: { label: 'Medien'")) {
  app = insertBefore(app, "    sound_system: { label: 'Sound-System',", "    media: { label: 'Medien', icon: '🗂️', enabled: true, description: 'Zentrale Medienverwaltung für Audio, Video, Bilder und Animationen.' },\n");
}
if (app.includes("favorites: ['clips', 'alerts', 'vip', 'hug', 'tagebuch', 'todo', 'commands', 'obs', 'sound_system', 'message_rotator']")) {
  app = replaceOnce(app, "favorites: ['clips', 'alerts', 'vip', 'hug', 'tagebuch', 'todo', 'commands', 'obs', 'sound_system', 'message_rotator']", "favorites: ['clips', 'alerts', 'vip', 'hug', 'tagebuch', 'todo', 'commands', 'obs', 'sound_system', 'media', 'message_rotator']");
}
write(appPath, app);

console.log('[STEP274B] Dashboard-Hook angewendet: Medienverwaltung eingebunden.');
console.log('[STEP274B] Backups: index.html.bak_STEP274B, app.js.bak_STEP274B');
