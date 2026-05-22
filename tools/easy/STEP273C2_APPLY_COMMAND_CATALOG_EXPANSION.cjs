#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const backendFile = path.join(root, 'backend', 'modules', 'commands.js');

function read(file) {
  if (!fs.existsSync(file)) throw new Error(`Datei nicht gefunden: ${file}`);
  return fs.readFileSync(file, 'utf8');
}
function write(file, content) { fs.writeFileSync(file, content, 'utf8'); }

const catalog = `const STEP273C2_COMMAND_CATALOG = [
  {
    id: 'deathcounter',
    label: 'Deathcounter',
    icon: '💀',
    description: 'Deathcounter V2 Chat-Commands und Overlay-Steuerung.',
    actions: [
      { id: 'deathcounter.rip', categoryId: 'deathcounter', icon: '💀', label: 'RIP erhöhen', description: 'Erhöht den Tod-Zähler für den genannten Spieler.', moduleKey: 'deathcounter_v2', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/deathcounter/v2/command', defaultTrigger: 'rip', defaultAliases: ['death', 'tod'], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 3000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'rip', defaultArgs: [] }, examples: ['!rip @ForrestCGN'] },
      { id: 'deathcounter.tode', categoryId: 'deathcounter', icon: '📊', label: 'Tode anzeigen', description: 'Gibt Deathcounter-Statistiken aus.', moduleKey: 'deathcounter_v2', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/deathcounter/v2/command', defaultTrigger: 'tode', defaultAliases: ['deaths'], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 3000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'tode', defaultArgs: [] }, examples: ['!tode', '!tode @ForrestCGN'] },
      { id: 'deathcounter.dcount', categoryId: 'deathcounter', icon: '🛠️', label: 'Deathcounter Admin', description: 'Admin-/Mod-Command fuer Show, Hide, Reset, Add, Remove und Replace.', moduleKey: 'deathcounter_v2', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/deathcounter/v2/command', defaultTrigger: 'dcount', defaultAliases: ['deathcount', 'deathcounter'], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 2500, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'dcount', defaultArgs: [] }, examples: ['!dcount show', '!dcount hide', '!dcount replace @alt @neu'] },
      { id: 'deathcounter.show', categoryId: 'deathcounter', icon: '👁️', label: 'Overlay anzeigen', description: 'Zeigt das Deathcounter-Overlay an. Nutzt intern dcount show.', moduleKey: 'deathcounter_v2', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/deathcounter/v2/command', defaultTrigger: 'dcshow', defaultAliases: ['showdc'], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 2500, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'dcount', defaultArgs: ['show'] }, examples: ['!dcshow'] },
      { id: 'deathcounter.hide', categoryId: 'deathcounter', icon: '🙈', label: 'Overlay verstecken', description: 'Versteckt das Deathcounter-Overlay. Nutzt intern dcount hide.', moduleKey: 'deathcounter_v2', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/deathcounter/v2/command', defaultTrigger: 'dchide', defaultAliases: ['hidedc'], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 2500, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'dcount', defaultArgs: ['hide'] }, examples: ['!dchide'] },
      { id: 'deathcounter.reset', categoryId: 'deathcounter', icon: '♻️', label: 'Overlay-Spieler resetten', description: 'Setzt die sichtbaren Deathcounter-Spieler auf Standard zurück. Nutzt intern dcount reset.', moduleKey: 'deathcounter_v2', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/deathcounter/v2/command', defaultTrigger: 'dcreset', defaultAliases: ['resetdc'], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 2500, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'dcount', defaultArgs: ['reset'] }, examples: ['!dcreset'] },
      { id: 'deathcounter.replace', categoryId: 'deathcounter', icon: '🔁', label: 'Overlay-Spieler ersetzen', description: 'Ersetzt einen sichtbaren Deathcounter-Spieler. Nutzt intern dcount replace.', moduleKey: 'deathcounter_v2', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/deathcounter/v2/command', defaultTrigger: 'dcreplace', defaultAliases: [], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 2500, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'dcount', defaultArgs: ['replace'] }, examples: ['!dcreplace @alt @neu'] }
    ]
  },
  {
    id: 'hug',
    label: 'Hug-System',
    icon: '🤗',
    description: 'Hug/Rehug-Commands ueber /api/hug/command. Hug.js stellt einen unified command endpoint bereit.',
    actions: [
      { id: 'hug.hug', categoryId: 'hug', icon: '🤗', label: 'Hug ausführen', description: 'Huggt einen User oder den Chat.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'hug', defaultAliases: [], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'hug', defaultArgs: [] }, examples: ['!hug @User', '!hug all'] },
      { id: 'hug.rehug', categoryId: 'hug', icon: '💜', label: 'Rehug ausführen', description: 'Erwidert einen Hug innerhalb des Rehug-Fensters.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'rehug', defaultAliases: [], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'rehug', defaultArgs: [] }, examples: ['!rehug @User'] },
      { id: 'hug.stats', categoryId: 'hug', icon: '📊', label: 'Hug-Stats anzeigen', description: 'Zeigt Hug-Statistiken fuer sich oder einen User.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'hugstats', defaultAliases: ['hugs'], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'hug', defaultArgs: ['stats'] }, examples: ['!hugstats', '!hugstats @User'] },
      { id: 'hug.top', categoryId: 'hug', icon: '🏆', label: 'Top Hugs', description: 'Zeigt die Top-Liste der vergebenen Hugs.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'hugtop', defaultAliases: [], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 8000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'hug', defaultArgs: ['top'] }, examples: ['!hugtop'] },
      { id: 'hug.top_received', categoryId: 'hug', icon: '📥', label: 'Top erhaltene Hugs', description: 'Zeigt die Top-Liste der erhaltenen Hugs.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'hugtopreceived', defaultAliases: ['hugtopreceived'], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 8000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'hug', defaultArgs: ['top', 'received'] }, examples: ['!hugtopreceived'] },
      { id: 'hug.top_rehug', categoryId: 'hug', icon: '🔄', label: 'Top Rehugs', description: 'Zeigt die Top-Liste der Rehugs.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'rehugtop', defaultAliases: [], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 8000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'hug', defaultArgs: ['top', 'rehug'] }, examples: ['!rehugtop'] },
      { id: 'hug.on', categoryId: 'hug', icon: '✅', label: 'Hugs aktivieren', description: 'Aktiviert Hugs fuer den User.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'hugon', defaultAliases: [], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 3000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'hug', defaultArgs: ['on'] }, examples: ['!hugon'] },
      { id: 'hug.off', categoryId: 'hug', icon: '🚫', label: 'Hugs deaktivieren', description: 'Deaktiviert Hugs fuer den User.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'hugoff', defaultAliases: [], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 3000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'hug', defaultArgs: ['off'] }, examples: ['!hugoff'] },
      { id: 'hug.reload', categoryId: 'hug', icon: '🔄', label: 'Hug-System neu laden', description: 'Laedt Hug-Cache/Texte neu.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'hugreload', defaultAliases: [], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 3000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'hug', defaultArgs: ['reload'] }, examples: ['!hugreload'] }
    ]
  },
  {
    id: 'clips',
    label: 'Clips / Content',
    icon: '✂️',
    description: 'Clip- und Content-nahe Commands. Wird mit dem Clip-Modul weiter vervollständigt.',
    actions: [
      { id: 'clips.clip.prepared', categoryId: 'clips', icon: '✂️', label: 'Clip erstellen vorbereiten', description: 'Vorbereitet fuer Clip-Command. Die exakte Clip-Ausfuehrung wird mit dem Clip-Modul-Catalog nachgezogen.', moduleKey: 'clips', actionKey: 'command', targetMethod: 'POST', targetUrl: '', defaultTrigger: 'clip', defaultAliases: [], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 10000, responseMode: 'module', config: { actionType: 'module_command', catalogStatus: 'prepared' }, examples: ['!clip', '!clip eigener Titel'] }
    ]
  },
  {
    id: 'tagebuch',
    label: 'Tagebuch',
    icon: '📖',
    description: 'Stream-Tagebuch. Getrennt von Todo, weil es ein eigenes Modul mit eigenen Routen/Settings/Texten ist.',
    actions: [
      { id: 'tagebuch.entry', categoryId: 'tagebuch', icon: '📖', label: 'Tagebuch-Eintrag', description: 'Schreibt einen Text ins Stream-Tagebuch.', moduleKey: 'tagebuch', actionKey: 'entry', targetMethod: 'POST', targetUrl: '/api/tagebuch/entry', defaultTrigger: 'tagebuch', defaultAliases: ['tb'], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'tagebuch', defaultArgs: [] }, examples: ['!tagebuch besonderer Moment'] },
      { id: 'tagebuch.stats_top', categoryId: 'tagebuch', icon: '🏆', label: 'Tagebuch Top', description: 'Zeigt die Top-User-Statistik des Tagebuchs.', moduleKey: 'tagebuch', actionKey: 'stats_top', targetMethod: 'GET', targetUrl: '/api/tagebuch/stats/top', defaultTrigger: 'tagebuchtop', defaultAliases: [], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'tagebuchtop', defaultArgs: [] }, examples: ['!tagebuchtop'] },
      { id: 'tagebuch.stats_today', categoryId: 'tagebuch', icon: '📅', label: 'Tagebuch heute', description: 'Zeigt die Tagesstatistik des Tagebuchs.', moduleKey: 'tagebuch', actionKey: 'stats_today', targetMethod: 'GET', targetUrl: '/api/tagebuch/stats/today', defaultTrigger: 'tagebuchheute', defaultAliases: [], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'tagebuchheute', defaultArgs: [] }, examples: ['!tagebuchheute'] }
    ]
  },
  {
    id: 'todo',
    label: 'Todo',
    icon: '✅',
    description: 'Todo-System. Getrennt vom Tagebuch, weil es ein eigenes Modul mit eigenen Routen/Settings/Texten ist.',
    actions: [
      { id: 'todo.add.prepared', categoryId: 'todo', icon: '✅', label: 'Todo hinzufügen vorbereiten', description: 'Vorbereitet fuer Todo-Command. Die exakte Todo-Route wird im Todo-Catalog-Step nachgezogen.', moduleKey: 'todo', actionKey: 'command', targetMethod: 'POST', targetUrl: '', defaultTrigger: 'todo', defaultAliases: [], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'module_command', catalogStatus: 'prepared' }, examples: ['!todo Text'] }
    ]
  },
  {
    id: 'system',
    label: 'System / Medien',
    icon: '🧩',
    description: 'Vorbereitete Systemaktionen. Medien werden ab STEP274 zentral verwaltet.',
    actions: [
      { id: 'system.sound.prepared', categoryId: 'system', icon: '🔊', label: 'Sound abspielen vorbereiten', description: 'Wird nach der zentralen Medienverwaltung an Sound-System/Media-Assets angebunden.', moduleKey: 'media', actionKey: 'sound_play', targetMethod: 'POST', targetUrl: '', defaultTrigger: 'sound', defaultAliases: [], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'sound_play', catalogStatus: 'prepared' }, examples: ['!sound hype'] },
      { id: 'system.video.prepared', categoryId: 'system', icon: '🎬', label: 'Video abspielen vorbereiten', description: 'Wird nach der zentralen Medienverwaltung an Overlay-/Video-Player angebunden.', moduleKey: 'media', actionKey: 'video_play', targetMethod: 'POST', targetUrl: '', defaultTrigger: 'video', defaultAliases: [], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'video_play', catalogStatus: 'prepared' }, examples: ['!video hype'] }
    ]
  }
];`;

function findCatalogRange(src) {
  let name = 'STEP273C2_COMMAND_CATALOG';
  let idx = src.indexOf(`const ${name} = [`);
  if (idx < 0) {
    name = 'STEP273C1_COMMAND_CATALOG';
    idx = src.indexOf(`const ${name} = [`);
  }
  if (idx < 0) throw new Error('Command-Catalog-Konstante nicht gefunden. Erst STEP273C1 anwenden.');

  const startBracket = src.indexOf('[', idx);
  let i = startBracket;
  let depth = 0;
  let quote = null;
  let escape = false;
  for (; i < src.length; i += 1) {
    const ch = src[i];
    if (quote) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '\'' || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '[') depth += 1;
    if (ch === ']') {
      depth -= 1;
      if (depth === 0) {
        let end = i + 1;
        while (src[end] && /\s/.test(src[end])) end += 1;
        if (src[end] === ';') end += 1;
        return { start: idx, end };
      }
    }
  }
  throw new Error('Command-Catalog-Ende nicht gefunden.');
}

function patchBackend() {
  let src = read(backendFile);
  const range = findCatalogRange(src);
  src = src.slice(0, range.start) + catalog + src.slice(range.end);
  src = src.replace(/STEP273C1/g, 'STEP273C2');
  src = src.replace(/Tagebuch \/ Todo/g, 'Tagebuch und Todo');
  write(backendFile, src);
  console.log('[STEP273C2] backend/modules/commands.js Catalog erweitert.');
}

patchBackend();
console.log('[STEP273C2] Fertig. Bitte node --check backend\\modules\\commands.js ausführen.');
