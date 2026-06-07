'use strict';

const http = require('http');
const database = require('../core/database');
const core = require('./helpers/helper_core');

const MODULE_NAME = 'commands';
const MODULE_VERSION = '0.1.8';
const MODULE_BUILD = 'vip30-command-catalog';
const SCHEMA_MODULE = 'command_system';
const SCHEMA_VERSION = 2;
const API_PREFIX = '/api/commands';
const DEFAULT_PREFIX = '!';
const DEFAULT_TARGET_HOST = '127.0.0.1';
const DEFAULT_TARGET_PORT = 8080;

const COMMAND_CATALOG = [
  {
    id: 'deathcounter',
    label: 'Deathcounter',
    icon: '💀',
    description: 'Deathcounter V2 Chat-Commands und Overlay-Steuerung.',
    actions: [
      { id: 'deathcounter.rip', icon: '💀', label: 'RIP erhöhen', description: 'Erhöht den Tod-Zähler für den genannten Spieler.', moduleKey: 'deathcounter_v2', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/deathcounter/v2/command', defaultTrigger: 'rip', defaultAliases: ['death', 'tod'], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 3000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'rip', defaultArgs: [] }, examples: ['!rip @ForrestCGN'] },
      { id: 'deathcounter.tode', icon: '📊', label: 'Tode anzeigen', description: 'Gibt Deathcounter-Statistiken aus.', moduleKey: 'deathcounter_v2', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/deathcounter/v2/command', defaultTrigger: 'tode', defaultAliases: ['deaths'], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 3000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'tode', defaultArgs: [] }, examples: ['!tode', '!tode @ForrestCGN'] },
      { id: 'deathcounter.dcount', icon: '🛠️', label: 'Deathcounter Admin', description: 'Admin-/Mod-Command fuer Show, Hide, Reset, Add, Remove und Replace.', moduleKey: 'deathcounter_v2', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/deathcounter/v2/command', defaultTrigger: 'dcount', defaultAliases: ['deathcount', 'deathcounter'], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 2500, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'dcount', defaultArgs: [] }, examples: ['!dcount show', '!dcount hide', '!dcount replace @alt @neu'] },
      { id: 'deathcounter.show', icon: '👁️', label: 'Overlay anzeigen', description: 'Zeigt das Deathcounter-Overlay an. Nutzt intern dcount show.', moduleKey: 'deathcounter_v2', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/deathcounter/v2/command', defaultTrigger: 'dcshow', defaultAliases: ['showdc'], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 2500, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'dcount', defaultArgs: ['show'] }, examples: ['!dcshow'] },
      { id: 'deathcounter.hide', icon: '🙈', label: 'Overlay verstecken', description: 'Versteckt das Deathcounter-Overlay. Nutzt intern dcount hide.', moduleKey: 'deathcounter_v2', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/deathcounter/v2/command', defaultTrigger: 'dchide', defaultAliases: ['hidedc'], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 2500, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'dcount', defaultArgs: ['hide'] }, examples: ['!dchide'] },
      { id: 'deathcounter.reset', icon: '♻️', label: 'Overlay-Spieler resetten', description: 'Setzt die sichtbaren Deathcounter-Spieler auf Standard zurück. Nutzt intern dcount reset.', moduleKey: 'deathcounter_v2', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/deathcounter/v2/command', defaultTrigger: 'dcreset', defaultAliases: ['resetdc'], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 2500, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'dcount', defaultArgs: ['reset'] }, examples: ['!dcreset'] },
      { id: 'deathcounter.replace', icon: '🔁', label: 'Overlay-Spieler ersetzen', description: 'Ersetzt einen sichtbaren Deathcounter-Spieler. Nutzt intern dcount replace.', moduleKey: 'deathcounter_v2', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/deathcounter/v2/command', defaultTrigger: 'dcreplace', defaultAliases: [], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 2500, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'dcount', defaultArgs: ['replace'] }, examples: ['!dcreplace @alt @neu'] }
    ]
  },
  {
    id: 'hug',
    label: 'Hug-System',
    icon: '🤗',
    description: 'Hug/Rehug-Commands ueber /api/hug/command.',
    actions: [
      { id: 'hug.hug', icon: '🤗', label: 'Hug ausführen', description: 'Huggt einen User oder den Chat.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'hug', defaultAliases: [], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'hug', defaultArgs: [] }, examples: ['!hug @User', '!hug all'] },
      { id: 'hug.rehug', icon: '💜', label: 'Rehug ausführen', description: 'Erwidert einen Hug innerhalb des Rehug-Fensters.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'rehug', defaultAliases: [], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'rehug', defaultArgs: [] }, examples: ['!rehug @User'] },
      { id: 'hug.stats', icon: '📊', label: 'Hug-Stats anzeigen', description: 'Zeigt Hug-Statistiken fuer sich oder einen User.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'hugstats', defaultAliases: ['hugs'], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'hug', defaultArgs: ['stats'] }, examples: ['!hugstats', '!hugstats @User'] },
      { id: 'hug.top', icon: '🏆', label: 'Top Hugs', description: 'Zeigt die Top-Liste der vergebenen Hugs.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'hugtop', defaultAliases: [], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 8000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'hug', defaultArgs: ['top'] }, examples: ['!hugtop'] },
      { id: 'hug.top_received', icon: '📥', label: 'Top erhaltene Hugs', description: 'Zeigt die Top-Liste der erhaltenen Hugs.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'hugtopreceived', defaultAliases: ['hugtopreceived'], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 8000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'hug', defaultArgs: ['top', 'received'] }, examples: ['!hugtopreceived'] },
      { id: 'hug.top_rehug', icon: '🔄', label: 'Top Rehugs', description: 'Zeigt die Top-Liste der Rehugs.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'rehugtop', defaultAliases: [], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 8000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'hug', defaultArgs: ['top', 'rehug'] }, examples: ['!rehugtop'] },
      { id: 'hug.on', icon: '✅', label: 'Hugs aktivieren', description: 'Aktiviert Hugs fuer den User.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'hugon', defaultAliases: [], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 3000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'hug', defaultArgs: ['on'] }, examples: ['!hugon'] },
      { id: 'hug.off', icon: '🚫', label: 'Hugs deaktivieren', description: 'Deaktiviert Hugs fuer den User.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'hugoff', defaultAliases: [], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 3000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'hug', defaultArgs: ['off'] }, examples: ['!hugoff'] },
      { id: 'hug.reload', icon: '🔄', label: 'Hug-System neu laden', description: 'Laedt Hug-Cache/Texte neu.', moduleKey: 'hug', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/hug/command', defaultTrigger: 'hugreload', defaultAliases: [], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 3000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'hug', defaultArgs: ['reload'] }, examples: ['!hugreload'] }
    ]
  },
  { id: 'vip_sound', label: 'VIP-Sound', icon: '💎', description: 'VIP-Sound-Command über das Node-Command-System.', actions: [
    { id: 'vip_sound.vip', icon: '💎', label: 'VIP-Sound abspielen', description: 'Spielt den VIP-Sound des genannten Users.', moduleKey: 'vip_sound_overlay', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/vip-sound/command', defaultTrigger: 'vip', defaultAliases: ['vipsound'], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 3000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'vip', rawInputMode: true, seededBy: 'STEP452' }, examples: ['!vip @adoredpenny'] }
  ] },
  { id: 'vip30', label: '30 Tage VIP', icon: '🎖️', description: 'VIP30 Status-/Restlaufzeit-Command ueber das Node-Command-System.', actions: [
    { id: 'vip30.status', icon: '🎖️', label: 'VIP30 Status anzeigen', description: 'Zeigt freie VIP30-Slots, naechsten Ablauf oder die eigene Restlaufzeit.', moduleKey: 'vip30', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/vip30/command', defaultTrigger: 'vip30', defaultAliases: ['vipstatus', 'vipplatz'], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'vip30', rawInputMode: true, seededBy: 'STEP8.19.43' }, examples: ['!vip30', '!vip30 me', '!vip30 slots'] }
  ] },
  { id: 'clips', label: 'Clips / Content', icon: '✂️', description: 'Clip- und Content-nahe Commands.', actions: [
    { id: 'clips.clip.prepared', icon: '✂️', label: 'Clip erstellen vorbereiten', description: 'Vorbereitet fuer Clip-Command.', moduleKey: 'clips', actionKey: 'command', targetMethod: 'POST', targetUrl: '', defaultTrigger: 'clip', defaultAliases: [], permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 10000, responseMode: 'module', config: { actionType: 'module_command', catalogStatus: 'prepared' }, examples: ['!clip'] }
  ] },
  { id: 'tagebuch', label: 'Tagebuch', icon: '📖', description: 'Stream-Tagebuch.', actions: [
    { id: 'tagebuch.entry', icon: '📖', label: 'Tagebuch-Eintrag', description: 'Schreibt einen Text ins Stream-Tagebuch.', moduleKey: 'tagebuch', actionKey: 'entry', targetMethod: 'POST', targetUrl: '/api/tagebuch/entry', defaultTrigger: 'tagebuch', defaultAliases: ['tb'], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'tagebuch', defaultArgs: [] }, examples: ['!tagebuch besonderer Moment'] },
    { id: 'tagebuch.stats_top', icon: '🏆', label: 'Tagebuch Top', description: 'Zeigt die Top-User-Statistik des Tagebuchs.', moduleKey: 'tagebuch', actionKey: 'stats_top', targetMethod: 'GET', targetUrl: '/api/tagebuch/stats/top', defaultTrigger: 'tagebuchtop', defaultAliases: [], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'tagebuchtop', defaultArgs: [] }, examples: ['!tagebuchtop'] },
    { id: 'tagebuch.stats_today', icon: '📅', label: 'Tagebuch heute', description: 'Zeigt die Tagesstatistik des Tagebuchs.', moduleKey: 'tagebuch', actionKey: 'stats_today', targetMethod: 'GET', targetUrl: '/api/tagebuch/stats/today', defaultTrigger: 'tagebuchheute', defaultAliases: [], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'module_command', moduleCommand: 'tagebuchheute', defaultArgs: [] }, examples: ['!tagebuchheute'] }
  ] },
  { id: 'todo', label: 'Todo', icon: '✅', description: 'Todo-System.', actions: [
    { id: 'todo.add.prepared', icon: '✅', label: 'Todo hinzufügen vorbereiten', description: 'Vorbereitet fuer Todo-Command.', moduleKey: 'todo', actionKey: 'command', targetMethod: 'POST', targetUrl: '', defaultTrigger: 'todo', defaultAliases: [], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'module_command', catalogStatus: 'prepared' }, examples: ['!todo Text'] }
  ] },
  { id: 'system', label: 'System / Medien', icon: '🧩', description: 'Vorbereitete Systemaktionen.', actions: [
    { id: 'system.sound.prepared', icon: '🔊', label: 'Sound abspielen vorbereiten', description: 'Wird an Sound-System/Media-Assets angebunden.', moduleKey: 'media', actionKey: 'sound_play', targetMethod: 'POST', targetUrl: '', defaultTrigger: 'sound', defaultAliases: [], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'sound_play', catalogStatus: 'prepared' }, examples: ['!sound hype'] },
    { id: 'system.video.prepared', icon: '🎬', label: 'Video abspielen vorbereiten', description: 'Wird an Overlay-/Video-Player angebunden.', moduleKey: 'media', actionKey: 'video_play', targetMethod: 'POST', targetUrl: '', defaultTrigger: 'video', defaultAliases: [], permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 5000, responseMode: 'module', config: { actionType: 'video_play', catalogStatus: 'prepared' }, examples: ['!video hype'] }
  ] }
];

const state = {
  initialized: false,
  schemaOk: false,
  schemaError: '',
  schemaReady: false,
  seeding: false,
  seeded: false,
  loadedAt: '',
  prefix: DEFAULT_PREFIX,
  enabled: true,
  handled: 0,
  ignored: 0,
  executed: 0,
  failed: 0,
  lastCommandAt: '',
  lastCommand: null,
  lastError: '',
  cooldowns: new Map(),
  ctx: null
};

function nowIso() { return core.nowIso(); }
function cleanText(value) { return String(value ?? '').replace(/[\r\n]+/g, ' ').trim(); }
function cleanLogin(value) { return String(value || '').trim().replace(/^@/, '').toLowerCase(); }
function cleanChannel(value) { return cleanLogin(String(value || '').trim().replace(/^#/, '')); }
function cleanTrigger(value) { return String(value || '').trim().replace(/^[!./]+/, '').toLowerCase(); }
function int(value, fallback = 0) { const n = Number.parseInt(value, 10); return Number.isFinite(n) ? n : fallback; }

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const v = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on', 'y'].includes(v)) return true;
  if (['0', 'false', 'no', 'nein', 'off', 'n'].includes(v)) return false;
  return fallback;
}

function safeJsonEncode(value, fallback = '{}') {
  const seen = new WeakSet();
  try {
    return JSON.stringify(value ?? null, (key, item) => {
      if (typeof item === 'object' && item !== null) {
        if (seen.has(item)) return '[circular]';
        seen.add(item);
      }
      if (typeof item === 'function') return `[function:${item.name || 'anonymous'}]`;
      if (typeof item === 'undefined') return null;
      return item;
    });
  } catch (_) {
    return fallback;
  }
}
function jsonEncode(value) { return safeJsonEncode(value ?? null, 'null'); }
function jsonDecode(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  try { if (typeof database.jsonDecode === 'function') return database.jsonDecode(value, fallback); } catch (_) {}
  return core.safeJsonParse(value, fallback);
}

function buildCommandCatalog() {
  const categories = COMMAND_CATALOG.map(category => ({
    id: category.id,
    label: category.label,
    icon: category.icon || '🧩',
    description: category.description || '',
    actions: (category.actions || []).map(action => ({ ...action, categoryId: action.categoryId || category.id }))
  }));
  const actions = categories.flatMap(category => category.actions.map(action => ({ ...action, categoryId: category.id, categoryLabel: category.label })));
  return { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, catalogVersion: 1, catalogBuild: 'default-catalog-v1', note: 'Neue Module sollen ihren Command-Catalog pflegen oder hier zentral ergänzt werden.', categories, actions, updatedAt: nowIso() };
}

function ensureSchema() {
  if (state.schemaReady && state.schemaOk) return true;
  try {
    database.ensureReady();
    database.exec(`
      CREATE TABLE IF NOT EXISTS command_definitions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trigger TEXT NOT NULL UNIQUE,
        aliases_json TEXT NOT NULL DEFAULT '[]',
        module_key TEXT NOT NULL DEFAULT '',
        action_key TEXT NOT NULL DEFAULT '',
        target_method TEXT NOT NULL DEFAULT 'POST',
        target_url TEXT NOT NULL DEFAULT '',
        enabled INTEGER NOT NULL DEFAULT 1,
        permission_level TEXT NOT NULL DEFAULT 'everyone',
        cooldown_global_ms INTEGER NOT NULL DEFAULT 0,
        cooldown_user_ms INTEGER NOT NULL DEFAULT 0,
        live_only INTEGER NOT NULL DEFAULT 0,
        response_mode TEXT NOT NULL DEFAULT 'module',
        config_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    database.exec('CREATE INDEX IF NOT EXISTS idx_command_definitions_enabled ON command_definitions(enabled);');
    database.exec('CREATE INDEX IF NOT EXISTS idx_command_definitions_module ON command_definitions(module_key);');
    database.exec(`
      CREATE TABLE IF NOT EXISTS command_execution_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trigger TEXT NOT NULL DEFAULT '',
        alias_trigger TEXT NOT NULL DEFAULT '',
        user_login TEXT NOT NULL DEFAULT '',
        user_display_name TEXT NOT NULL DEFAULT '',
        raw_message TEXT NOT NULL DEFAULT '',
        args_json TEXT NOT NULL DEFAULT '[]',
        module_key TEXT NOT NULL DEFAULT '',
        action_key TEXT NOT NULL DEFAULT '',
        target_url TEXT NOT NULL DEFAULT '',
        success INTEGER NOT NULL DEFAULT 0,
        ignored INTEGER NOT NULL DEFAULT 0,
        error TEXT NOT NULL DEFAULT '',
        result_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL
      );
    `);
    database.exec('CREATE INDEX IF NOT EXISTS idx_command_execution_log_created ON command_execution_log(created_at);');
    database.exec('CREATE INDEX IF NOT EXISTS idx_command_execution_log_trigger ON command_execution_log(trigger);');
    database.exec('CREATE INDEX IF NOT EXISTS idx_command_execution_log_user ON command_execution_log(user_login);');
    if (typeof database.setSchemaVersion === 'function') database.setSchemaVersion(SCHEMA_MODULE, SCHEMA_VERSION);
    state.schemaReady = true;
    state.schemaOk = true;
    state.schemaError = '';
    if (!state.seeded && !state.seeding) seedDefaultCommands();
    return true;
  } catch (err) {
    state.schemaOk = false;
    state.schemaReady = false;
    state.schemaError = err?.message || String(err);
    state.lastError = state.schemaError;
    return false;
  }
}

function seedDefaultCommands() {
  if (state.seeding || state.seeded) return;
  state.seeding = true;
  try {
    const defaults = [
      { trigger: 'rip', aliases: ['death', 'tod'], moduleKey: 'deathcounter_v2', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/deathcounter/v2/command', permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 3000, liveOnly: false, responseMode: 'module', config: { seededBy: 'STEP273A', rawInputMode: true } },
      { trigger: 'tode', aliases: ['deaths'], moduleKey: 'deathcounter_v2', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/deathcounter/v2/command', permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 3000, liveOnly: false, responseMode: 'module', config: { seededBy: 'STEP273A', rawInputMode: true } },
      { trigger: 'dcount', aliases: ['deathcount', 'deathcounter'], moduleKey: 'deathcounter_v2', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/deathcounter/v2/command', permissionLevel: 'mod', cooldownGlobalMs: 1000, cooldownUserMs: 2500, liveOnly: false, responseMode: 'module', config: { seededBy: 'STEP273A', rawInputMode: true } },
      { trigger: 'vip', aliases: ['vipsound'], moduleKey: 'vip_sound_overlay', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/vip-sound/command', permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 3000, liveOnly: false, responseMode: 'module', config: { seededBy: 'STEP452', actionType: 'module_command', moduleCommand: 'vip', rawInputMode: true } },
      { trigger: 'vip30', aliases: ['vipstatus', 'vipplatz'], moduleKey: 'vip30', actionKey: 'command', targetMethod: 'POST', targetUrl: '/api/vip30/command', permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 5000, liveOnly: false, responseMode: 'module', config: { seededBy: 'STEP8.19.43', actionType: 'module_command', moduleCommand: 'vip30', rawInputMode: true } }
    ];
    for (const item of defaults) {
      const existing = database.get('SELECT id FROM command_definitions WHERE trigger = :trigger', { trigger: item.trigger });
      if (existing?.id) continue;
      saveCommand(item, { seed: true });
    }
    state.seeded = true;
  } finally {
    state.seeding = false;
  }
}

function rowToCommand(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    trigger: row.trigger || '',
    aliases: jsonDecode(row.aliases_json, []),
    moduleKey: row.module_key || '',
    actionKey: row.action_key || '',
    targetMethod: row.target_method || 'POST',
    targetUrl: row.target_url || '',
    enabled: Number(row.enabled || 0) === 1,
    permissionLevel: row.permission_level || 'everyone',
    cooldownGlobalMs: Number(row.cooldown_global_ms || 0),
    cooldownUserMs: Number(row.cooldown_user_ms || 0),
    liveOnly: Number(row.live_only || 0) === 1,
    responseMode: row.response_mode || 'module',
    config: jsonDecode(row.config_json, {}),
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || ''
  };
}

function listCommands(options = {}) {
  ensureSchema();
  const includeDisabled = bool(options.includeDisabled, true);
  const rows = database.all(`
    SELECT *
    FROM command_definitions
    ${includeDisabled ? '' : 'WHERE enabled = 1'}
    ORDER BY trigger ASC
  `);
  return rows.map(rowToCommand).filter(Boolean);
}

function getCommandByTrigger(trigger) {
  ensureSchema();
  const clean = cleanTrigger(trigger);
  if (!clean) return null;
  const direct = database.get('SELECT * FROM command_definitions WHERE trigger = :trigger', { trigger: clean });
  if (direct) return { command: rowToCommand(direct), aliasTrigger: clean, matchedBy: 'trigger' };
  const rows = database.all('SELECT * FROM command_definitions WHERE enabled = 1');
  for (const row of rows) {
    const aliases = jsonDecode(row.aliases_json, []);
    if (Array.isArray(aliases) && aliases.map(cleanTrigger).includes(clean)) return { command: rowToCommand(row), aliasTrigger: clean, matchedBy: 'alias' };
  }
  return null;
}

function normalizeAliases(value) {
  if (Array.isArray(value)) return value.map(cleanTrigger).filter(Boolean);
  const raw = String(value || '').trim();
  if (!raw) return [];
  return raw.split(/[\s,;]+/).map(cleanTrigger).filter(Boolean);
}
function normalizeConfig(value) {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  return core.safeJsonParse(value, {});
}

function findCommandForSafeEdit(input = {}) {
  const id = int(input.id ?? input.commandId ?? input.originalId ?? input.original_id, 0);
  if (id > 0) {
    const row = database.get('SELECT * FROM command_definitions WHERE id = :id', { id });
    if (row) return rowToCommand(row);
  }
  const originalTrigger = cleanTrigger(input.originalTrigger || input.original_trigger || input.editOriginalTrigger || input.edit_original_trigger || '');
  if (originalTrigger) {
    const row = database.get('SELECT * FROM command_definitions WHERE trigger = :trigger', { trigger: originalTrigger });
    if (row) return rowToCommand(row);
  }
  return null;
}

function saveCommand(input = {}, options = {}) {
  const now = nowIso();
  const trigger = cleanTrigger(input.trigger || input.command || input.name || '');
  if (!trigger) throw new Error('command_trigger_missing');

  const editMode = bool(input.editMode || input.edit_mode, false) || !!input.originalTrigger || !!input.original_trigger || !!input.originalId || !!input.original_id || !!input.id || !!input.commandId;
  const editingExisting = editMode ? findCommandForSafeEdit(input) : null;
  const byNewTrigger = database.get('SELECT * FROM command_definitions WHERE trigger = :trigger', { trigger });
  const existing = editingExisting ? database.get('SELECT * FROM command_definitions WHERE id = :id', { id: editingExisting.id }) : byNewTrigger;
  const current = rowToCommand(existing);

  if (editingExisting && byNewTrigger && Number(byNewTrigger.id) !== Number(editingExisting.id)) {
    throw new Error('command_trigger_already_exists');
  }

  const data = {
    id: editingExisting ? Number(editingExisting.id) : 0,
    trigger,
    aliasesJson: jsonEncode(normalizeAliases(input.aliases ?? current?.aliases ?? [])),
    moduleKey: cleanText(input.moduleKey ?? input.module_key ?? current?.moduleKey ?? ''),
    actionKey: cleanText(input.actionKey ?? input.action_key ?? current?.actionKey ?? ''),
    targetMethod: cleanText(input.targetMethod ?? input.target_method ?? current?.targetMethod ?? 'POST').toUpperCase() || 'POST',
    targetUrl: cleanText(input.targetUrl ?? input.target_url ?? current?.targetUrl ?? ''),
    enabled: bool(input.enabled, current ? current.enabled : true) ? 1 : 0,
    permissionLevel: cleanText(input.permissionLevel ?? input.permission_level ?? current?.permissionLevel ?? 'everyone').toLowerCase() || 'everyone',
    cooldownGlobalMs: Math.max(0, int(input.cooldownGlobalMs ?? input.cooldown_global_ms ?? current?.cooldownGlobalMs ?? 0, 0)),
    cooldownUserMs: Math.max(0, int(input.cooldownUserMs ?? input.cooldown_user_ms ?? current?.cooldownUserMs ?? 0, 0)),
    liveOnly: bool(input.liveOnly ?? input.live_only, current ? current.liveOnly : false) ? 1 : 0,
    responseMode: cleanText(input.responseMode ?? input.response_mode ?? current?.responseMode ?? 'module') || 'module',
    configJson: jsonEncode(normalizeConfig(input.config ?? input.config_json ?? current?.config ?? {})),
    createdAt: current?.createdAt || now,
    updatedAt: now
  };

  if (editingExisting) {
    const updateParams = { ...data };
    delete updateParams.createdAt;
    const result = database.run(`
      UPDATE command_definitions SET
        trigger = :trigger,
        aliases_json = :aliasesJson,
        module_key = :moduleKey,
        action_key = :actionKey,
        target_method = :targetMethod,
        target_url = :targetUrl,
        enabled = :enabled,
        permission_level = :permissionLevel,
        cooldown_global_ms = :cooldownGlobalMs,
        cooldown_user_ms = :cooldownUserMs,
        live_only = :liveOnly,
        response_mode = :responseMode,
        config_json = :configJson,
        updated_at = :updatedAt
      WHERE id = :id
    `, updateParams);
    if (!result || Number(result.changes || 0) < 1) throw new Error('command_update_failed');
    return { ok: true, seed: !!options.seed, editMode: true, created: false, updated: true, command: rowToCommand(database.get('SELECT * FROM command_definitions WHERE id = :id', { id: data.id })) };
  }

  const insertParams = { ...data };
  delete insertParams.id;
  database.run(`
    INSERT INTO command_definitions (
      trigger, aliases_json, module_key, action_key, target_method, target_url,
      enabled, permission_level, cooldown_global_ms, cooldown_user_ms, live_only,
      response_mode, config_json, created_at, updated_at
    ) VALUES (
      :trigger, :aliasesJson, :moduleKey, :actionKey, :targetMethod, :targetUrl,
      :enabled, :permissionLevel, :cooldownGlobalMs, :cooldownUserMs, :liveOnly,
      :responseMode, :configJson, :createdAt, :updatedAt
    )
    ON CONFLICT(trigger) DO UPDATE SET
      aliases_json = excluded.aliases_json,
      module_key = excluded.module_key,
      action_key = excluded.action_key,
      target_method = excluded.target_method,
      target_url = excluded.target_url,
      enabled = excluded.enabled,
      permission_level = excluded.permission_level,
      cooldown_global_ms = excluded.cooldown_global_ms,
      cooldown_user_ms = excluded.cooldown_user_ms,
      live_only = excluded.live_only,
      response_mode = excluded.response_mode,
      config_json = excluded.config_json,
      updated_at = excluded.updated_at
  `, insertParams);
  return { ok: true, seed: !!options.seed, editMode: false, created: !current, updated: !!current, command: rowToCommand(database.get('SELECT * FROM command_definitions WHERE trigger = :trigger', { trigger })) };
}
function upsertCommand(input = {}, options = {}) { ensureSchema(); return saveCommand(input, options); }
function deleteCommand(triggerOrId) {
  ensureSchema();
  const raw = String(triggerOrId || '').trim();
  if (!raw) throw new Error('command_delete_target_missing');
  const result = /^\d+$/.test(raw)
    ? database.run('DELETE FROM command_definitions WHERE id = :id', { id: Number(raw) })
    : database.run('DELETE FROM command_definitions WHERE trigger = :trigger', { trigger: cleanTrigger(raw) });
  return { ok: true, deleted: Number(result?.changes || 0) };
}

function parseChatMessage(input = {}) {
  const rawMessage = cleanText(input.rawMessage || input.message || input.text || '');
  const prefix = cleanText(input.prefix || state.prefix || DEFAULT_PREFIX) || DEFAULT_PREFIX;
  if (!rawMessage || !rawMessage.startsWith(prefix)) return { isCommand: false, rawMessage, prefix, reason: 'not_a_command' };
  const withoutPrefix = rawMessage.slice(prefix.length).trim();
  if (!withoutPrefix) return { isCommand: false, rawMessage, prefix, reason: 'empty_command' };
  const parts = withoutPrefix.split(/\s+/).filter(Boolean);
  const trigger = cleanTrigger(parts.shift() || '');
  const args = parts;
  return { isCommand: !!trigger, prefix, rawMessage, trigger, args, rawInput: withoutPrefix, argText: args.join(' ') };
}

function userFromParsed(parsed = {}, override = {}) {
  const tags = parsed.tags || {};
  const badges = parsed.badges || {};
  const login = cleanLogin(override.userLogin || override.login || parsed.login || tags.login || '');
  const displayName = cleanText(override.userDisplayName || override.displayName || parsed.displayName || tags['display-name'] || login);
  return { login, displayName: displayName || login, userId: cleanText(tags['user-id'] || override.userId || ''), badges, isBroadcaster: !!badges.broadcaster, isMod: !!badges.moderator || tags.mod === '1', isVip: !!badges.vip, isSubscriber: !!badges.subscriber || !!badges.founder || tags.subscriber === '1' };
}
function hasPermission(command, user) {
  const level = String(command.permissionLevel || 'everyone').trim().toLowerCase();
  if (!level || level === 'everyone' || level === 'all') return true;
  if (level === 'subscriber' || level === 'sub') return user.isSubscriber || user.isVip || user.isMod || user.isBroadcaster;
  if (level === 'vip') return user.isVip || user.isMod || user.isBroadcaster;
  if (level === 'mod' || level === 'moderator') return user.isMod || user.isBroadcaster;
  if (level === 'streamer' || level === 'broadcaster' || level === 'owner') return user.isBroadcaster;
  return false;
}
function cooldownKey(scope, command, userLogin = '') { return `${scope}:${command.trigger}:${userLogin || '*'}`; }
function checkCooldown(command, user) {
  const now = Date.now();
  const globalMs = Math.max(0, Number(command.cooldownGlobalMs || 0));
  const userMs = Math.max(0, Number(command.cooldownUserMs || 0));
  const lastGlobal = Number(state.cooldowns.get(cooldownKey('global', command)) || 0);
  const lastUser = Number(state.cooldowns.get(cooldownKey('user', command, user.login || 'unknown')) || 0);
  if (globalMs > 0 && now - lastGlobal < globalMs) return { ok: false, scope: 'global', waitMs: globalMs - (now - lastGlobal) };
  if (userMs > 0 && now - lastUser < userMs) return { ok: false, scope: 'user', waitMs: userMs - (now - lastUser) };
  return { ok: true };
}
function markCooldown(command, user) {
  const now = Date.now();
  state.cooldowns.set(cooldownKey('global', command), now);
  state.cooldowns.set(cooldownKey('user', command, user.login || 'unknown'), now);
}
function summarizeResultForLog(result) {
  if (!result || typeof result !== 'object') return result || {};
  const data = result.data && typeof result.data === 'object' ? result.data : null;
  return { ok: !!result.ok, statusCode: result.statusCode || null, dataOk: data ? !!data.ok : null, message: data ? (data.message || '') : '', error: data ? (data.error || '') : '', module: data ? (data.module || data.data?.module || '') : '', command: data ? (data.command || data.data?.command || '') : '' };
}

function logExecution(entry = {}) {
  try {
    ensureSchema();
    database.run(`
      INSERT INTO command_execution_log (
        trigger, alias_trigger, user_login, user_display_name, raw_message, args_json,
        module_key, action_key, target_url, success, ignored, error, result_json, created_at
      ) VALUES (
        :trigger, :aliasTrigger, :userLogin, :userDisplayName, :rawMessage, :argsJson,
        :moduleKey, :actionKey, :targetUrl, :success, :ignored, :error, :resultJson, :createdAt
      )
    `, {
      trigger: entry.trigger || '', aliasTrigger: entry.aliasTrigger || '', userLogin: entry.userLogin || '', userDisplayName: entry.userDisplayName || '', rawMessage: entry.rawMessage || '', argsJson: jsonEncode(entry.args || []), moduleKey: entry.moduleKey || '', actionKey: entry.actionKey || '', targetUrl: entry.targetUrl || '', success: entry.success ? 1 : 0, ignored: entry.ignored ? 1 : 0, error: entry.error || '', resultJson: jsonEncode(entry.result || {}), createdAt: nowIso()
    });
  } catch (err) { state.lastError = err?.message || String(err); }
}
function recentLogs(limit = 25) {
  ensureSchema();
  return database.all(`SELECT * FROM command_execution_log ORDER BY id DESC LIMIT :limit`, { limit: Math.max(1, Math.min(100, int(limit, 25))) }).map(row => ({
    id: Number(row.id), trigger: row.trigger || '', aliasTrigger: row.alias_trigger || '', userLogin: row.user_login || '', userDisplayName: row.user_display_name || '', rawMessage: row.raw_message || '', args: jsonDecode(row.args_json, []), moduleKey: row.module_key || '', actionKey: row.action_key || '', targetUrl: row.target_url || '', success: Number(row.success || 0) === 1, ignored: Number(row.ignored || 0) === 1, error: row.error || '', result: jsonDecode(row.result_json, {}), createdAt: row.created_at || ''
  }));
}

function countTableRows(table) {
  try {
    const safeTable = String(table || '').trim();
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(safeTable)) return { ok: false, table: safeTable, count: 0, error: 'invalid_table' };
    const row = database.get(`SELECT COUNT(*) AS c FROM ${safeTable}`) || {};
    return { ok: true, table: safeTable, count: Number(row.c || 0), error: '' };
  } catch (err) {
    return { ok: false, table, count: 0, error: err?.message || 'count_failed' };
  }
}

function safeDatabaseInfo() {
  const info = {
    ok: true,
    adapter: 'unknown',
    path: '',
    schemaVersion: 0,
    expectedSchemaVersion: SCHEMA_VERSION,
    error: ''
  };

  try { info.adapter = typeof database.getAdapter === 'function' ? database.getAdapter() : 'unknown'; }
  catch (err) { info.ok = false; info.error = info.error || `adapter:${err?.message || 'failed'}`; }

  try { info.path = typeof database.getDbPath === 'function' ? (database.getDbPath() || '') : ''; }
  catch (err) { info.ok = false; info.error = info.error || `path:${err?.message || 'failed'}`; }

  try { info.schemaVersion = typeof database.getSchemaVersion === 'function' ? Number(database.getSchemaVersion(SCHEMA_MODULE) || 0) : 0; }
  catch (err) { info.ok = false; info.error = info.error || `schemaVersion:${err?.message || 'failed'}`; }

  if (state.schemaError) {
    info.ok = false;
    info.error = info.error || state.schemaError;
  }

  return info;
}

function buildStandardDiagnostics() {
  const warnings = [];
  const errors = [];
  const db = safeDatabaseInfo();
  const commandCount = countTableRows('command_definitions');
  const logCount = countTableRows('command_execution_log');
  const catalog = buildCommandCatalog();

  if (!state.enabled) warnings.push('command_system_disabled');
  if (!state.initialized) warnings.push('module_not_initialized');
  if (!state.schemaReady || !state.schemaOk) errors.push(state.schemaError || 'schema_not_ready');
  if (!db.ok) errors.push(`database:${db.error || 'unavailable'}`);
  if (!commandCount.ok) errors.push(`command_definitions:${commandCount.error}`);
  if (!logCount.ok) warnings.push(`command_execution_log:${logCount.error}`);
  if (state.lastError) warnings.push(state.lastError);

  const ok = errors.length === 0;
  const health = ok ? (warnings.length ? 'warn' : 'ok') : 'error';

  return {
    ok,
    health,
    module: MODULE_NAME,
    version: MODULE_VERSION,
    build: MODULE_BUILD,
    schemaVersion: db.schemaVersion,
    schemaReady: state.schemaReady,
    configSource: 'database',
    textSource: 'not_used',
    database: db,
    counts: {
      commands: commandCount.count,
      catalogGroups: Array.isArray(catalog.categories) ? catalog.categories.length : 0,
      catalogActions: Array.isArray(catalog.actions) ? catalog.actions.length : 0,
      logs: logCount.count,
      handled: state.handled,
      ignored: state.ignored,
      executed: state.executed,
      failed: state.failed,
      cooldowns: state.cooldowns instanceof Map ? state.cooldowns.size : 0
    },
    warnings,
    errors,
    lastError: errors[0] || state.lastError || null
  };
}

function httpJsonRequest(method, targetUrl, payload = {}) {
  const cleanUrl = cleanText(targetUrl);
  if (!cleanUrl) return Promise.reject(new Error('target_url_missing'));
  const body = JSON.stringify(payload);
  const options = { hostname: process.env.COMMAND_TARGET_HOST || DEFAULT_TARGET_HOST, port: Number(process.env.COMMAND_TARGET_PORT || DEFAULT_TARGET_PORT) || DEFAULT_TARGET_PORT, path: cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`, method: String(method || 'POST').trim().toUpperCase() || 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = data;
        try { parsed = data ? JSON.parse(data) : {}; } catch (_) {}
        if (res.statusCode >= 200 && res.statusCode < 300) resolve({ ok: true, statusCode: res.statusCode, data: parsed });
        else { const err = new Error(`target_http_${res.statusCode}`); err.statusCode = res.statusCode; err.data = parsed; reject(err); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function commandActionType(command) {
  const config = command && command.config && typeof command.config === 'object' ? command.config : {};
  return cleanText(config.actionType || config.type || '').toLowerCase();
}

function isMediaPlaybackCommand(command) {
  const actionType = commandActionType(command);
  return actionType === 'sound_play' || actionType === 'video_play';
}

function commandMediaId(command) {
  const config = command && command.config && typeof command.config === 'object' ? command.config : {};
  return cleanText(config.mediaId || config.soundMediaId || config.videoMediaId || '');
}

function effectiveCommandTargetUrl(command) {
  let targetUrl = cleanText(command && command.targetUrl || '');
  if (isMediaPlaybackCommand(command)) {
    if (!targetUrl || targetUrl.includes('/api/sound/play-media')) targetUrl = '/api/sound/play';
  }
  return targetUrl;
}

function buildTargetPayload(command, parsedCommand, user, source = {}) {
  const config = command.config && typeof command.config === 'object' ? command.config : {};
  const moduleCommand = cleanText(config.moduleCommand || config.internalCommand || command.trigger) || command.trigger;
  const defaultArgs = Array.isArray(config.defaultArgs) ? config.defaultArgs.map(item => String(item || '').trim()).filter(Boolean) : [];
  const effectiveArgs = parsedCommand.args.length ? parsedCommand.args : defaultArgs;
  const rawInput = `${moduleCommand}${effectiveArgs.length ? ` ${effectiveArgs.join(' ')}` : ''}`.trim();
  const payload = { command: moduleCommand, cmd: moduleCommand, rawInput, input: rawInput, rawMessage: parsedCommand.rawMessage, message: parsedCommand.rawMessage, args: effectiveArgs, user: user.displayName || user.login, userName: user.displayName || user.login, userLogin: user.login, login: user.login, displayName: user.displayName || user.login, userDisplayName: user.displayName || user.login, userId: user.userId || '', badges: user.badges || {}, isBroadcaster: !!user.isBroadcaster, isOwner: !!user.isBroadcaster, isMod: !!user.isMod, isModerator: !!user.isMod, isVip: !!user.isVip, isSubscriber: !!user.isSubscriber, source: source.source || 'command_system', channel: source.channel || '', chatOutput: true, sendChat: true, directSendEnabled: true, fallbackToStreamerbot: true };
  effectiveArgs.slice(0, 10).forEach((arg, index) => { payload[`input${index}`] = arg; });

  const actionType = commandActionType(command);
  const mediaId = commandMediaId(command);
  if ((actionType === 'sound_play' || actionType === 'video_play') && mediaId) {
    const isVideo = actionType === 'video_play';
    payload.command = isVideo ? 'play_video_media' : 'play_audio_media';
    payload.cmd = payload.command;
    payload.mediaId = mediaId;
    payload.mediaType = isVideo ? 'video' : 'audio';
    payload.type = isVideo ? 'video' : 'file';
    payload.soundId = '';
    payload.sound = '';
    payload.volume = int(config.volume, isVideo ? 80 : 85);
    payload.target = cleanText(config.target || 'stream') || 'stream';
    payload.outputTarget = isVideo ? 'overlay' : (cleanText(config.outputTarget || config.output || 'overlay') || 'overlay');
    payload.category = cleanText(config.category || 'fun') || 'fun';
    payload.source = 'commands';
    payload.requestedBy = user.login || user.displayName || '';
    payload.label = cleanText(config.label || command.trigger || mediaId) || `command_media_${mediaId}`;
    payload.queueIfBusy = config.queue !== false;
    payload.parallelAllowed = config.parallelAllowed === true;
    payload.meta = { commandTrigger: command.trigger, actionType, mediaId };
  }

  return payload;
}

async function executeCommand(command, parsedCommand, user, source = {}) {
  const targetUrl = effectiveCommandTargetUrl(command);
  if (!targetUrl) throw new Error('command_target_url_missing');
  return httpJsonRequest(command.targetMethod || 'POST', targetUrl, buildTargetPayload(command, parsedCommand, user, source));
}

async function processMessage(input = {}, options = {}) {
  ensureSchema();
  if (state.enabled === false) { state.ignored += 1; return { ok: true, ignored: true, reason: 'command_system_disabled' }; }
  const parsedCommand = parseChatMessage(input);
  if (!parsedCommand.isCommand) { state.ignored += 1; return { ok: true, ignored: true, reason: parsedCommand.reason || 'not_a_command' }; }
  const match = getCommandByTrigger(parsedCommand.trigger);
  if (!match?.command) {
    state.ignored += 1;
    logExecution({ trigger: parsedCommand.trigger, aliasTrigger: parsedCommand.trigger, rawMessage: parsedCommand.rawMessage, args: parsedCommand.args, ignored: true, error: 'unknown_command' });
    return { ok: true, ignored: true, reason: 'unknown_command', trigger: parsedCommand.trigger };
  }
  const command = match.command;
  const user = input.user || userFromParsed(input.parsed || {}, input);
  if (!command.enabled) {
    state.ignored += 1;
    logExecution({ trigger: command.trigger, aliasTrigger: match.aliasTrigger, userLogin: user.login, userDisplayName: user.displayName, rawMessage: parsedCommand.rawMessage, args: parsedCommand.args, moduleKey: command.moduleKey, actionKey: command.actionKey, targetUrl: command.targetUrl, ignored: true, error: 'command_disabled' });
    return { ok: true, ignored: true, reason: 'command_disabled', command };
  }
  if (!hasPermission(command, user)) {
    state.ignored += 1;
    logExecution({ trigger: command.trigger, aliasTrigger: match.aliasTrigger, userLogin: user.login, userDisplayName: user.displayName, rawMessage: parsedCommand.rawMessage, args: parsedCommand.args, moduleKey: command.moduleKey, actionKey: command.actionKey, targetUrl: command.targetUrl, ignored: true, error: 'permission_denied' });
    return { ok: false, ignored: true, reason: 'permission_denied', command: command.trigger };
  }
  const cooldown = checkCooldown(command, user);
  if (!cooldown.ok) {
    state.ignored += 1;
    logExecution({ trigger: command.trigger, aliasTrigger: match.aliasTrigger, userLogin: user.login, userDisplayName: user.displayName, rawMessage: parsedCommand.rawMessage, args: parsedCommand.args, moduleKey: command.moduleKey, actionKey: command.actionKey, targetUrl: command.targetUrl, ignored: true, error: `cooldown_${cooldown.scope}`, result: cooldown });
    return { ok: false, ignored: true, reason: 'cooldown', cooldown, command: command.trigger };
  }
  if (options.dryRun) return { ok: true, dryRun: true, parsed: parsedCommand, command, user, targetPayload: buildTargetPayload(command, parsedCommand, user, options) };
  try {
    markCooldown(command, user);
    const result = await executeCommand(command, parsedCommand, user, options);
    state.handled += 1;
    state.executed += 1;
    state.lastCommandAt = nowIso();
    state.lastCommand = { trigger: command.trigger, aliasTrigger: match.aliasTrigger, userLogin: user.login, userDisplayName: user.displayName, rawMessage: parsedCommand.rawMessage, resultStatusCode: result.statusCode || null };
    state.lastError = '';
    logExecution({ trigger: command.trigger, aliasTrigger: match.aliasTrigger, userLogin: user.login, userDisplayName: user.displayName, rawMessage: parsedCommand.rawMessage, args: parsedCommand.args, moduleKey: command.moduleKey, actionKey: command.actionKey, targetUrl: command.targetUrl, success: true, result: summarizeResultForLog(result) });
    return { ok: true, command: command.trigger, matchedBy: match.matchedBy, result: summarizeResultForLog(result) };
  } catch (err) {
    state.failed += 1;
    state.lastError = err?.message || String(err);
    logExecution({ trigger: command.trigger, aliasTrigger: match.aliasTrigger, userLogin: user.login, userDisplayName: user.displayName, rawMessage: parsedCommand.rawMessage, args: parsedCommand.args, moduleKey: command.moduleKey, actionKey: command.actionKey, targetUrl: command.targetUrl, success: false, error: state.lastError, result: { statusCode: err.statusCode || null, data: err.data || null } });
    return { ok: false, command: command.trigger, error: state.lastError };
  }
}

async function handleChatMessage(parsed, source = {}) {
  if (!parsed || String(parsed.command || '').toUpperCase() !== 'PRIVMSG') return { ok: true, ignored: true, reason: 'not_privmsg' };

  const expectedChannel = cleanChannel(source.channel || process.env.TWITCH_BOT_CHANNEL || '');
  const messageChannel = cleanChannel(parsed.params?.[0] || parsed.channel || '');

  if (expectedChannel && !messageChannel) {
    state.ignored += 1;
    return { ok: true, ignored: true, reason: 'channel_missing', expectedChannel };
  }

  if (expectedChannel && messageChannel && messageChannel !== expectedChannel) {
    state.ignored += 1;
    return { ok: true, ignored: true, reason: 'channel_mismatch', channel: messageChannel, expectedChannel };
  }

  const rawMessage = cleanText(parsed.params?.[1] || parsed.params?.[parsed.params.length - 1] || '');
  const user = userFromParsed(parsed, {});
  return processMessage({ rawMessage, parsed, user }, { source: source.source || 'twitch_presence', channel: expectedChannel || source.channel || '' });
}

function buildRoutes() {
  return [
    { method: 'GET', path: `${API_PREFIX}/status`, purpose: 'Schneller Command-System Status ohne schwere Listen/Kataloge/Logs' },
    { method: 'GET', path: `${API_PREFIX}/list`, purpose: 'Alle konfigurierten Commands auflisten' },
    { method: 'GET', path: `${API_PREFIX}/catalog`, purpose: 'Modul-Command-Catalog fuer Dashboard-Dropdowns' },
    { method: 'POST', path: `${API_PREFIX}/upsert`, purpose: 'Command anlegen oder aktualisieren' },
    { method: 'POST', path: `${API_PREFIX}/delete`, purpose: 'Command löschen' },
    { method: 'GET/POST', path: `${API_PREFIX}/test`, purpose: 'Chatnachricht trocken parsen und Zielpayload anzeigen' },
    { method: 'GET/POST', path: `${API_PREFIX}/execute`, purpose: 'Chatnachricht als Command ausführen' },
    { method: 'GET', path: `${API_PREFIX}/media-command-preview`, purpose: 'Command-System Preview fuer Media-Command Routing und Payload' },
    { method: 'GET', path: `${API_PREFIX}/logs`, purpose: 'Letzte Command-Ausführungen anzeigen' },
    { method: 'GET', path: `${API_PREFIX}/history`, purpose: 'Alias fuer /api/commands/logs' }
  ];
}

function statusPayload() {
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    version: 1,
    prefix: state.prefix,
    enabled: state.enabled,
    initialized: state.initialized,
    schemaOk: state.schemaOk,
    schemaError: state.schemaError,
    loadedAt: state.loadedAt,
    stats: { handled: state.handled, ignored: state.ignored, executed: state.executed, failed: state.failed, lastCommandAt: state.lastCommandAt, lastCommand: state.lastCommand, lastError: state.lastError },
    tables: ['command_definitions', 'command_execution_log'],
    routes: buildRoutes(),
    dataEndpoints: {
      commands: `${API_PREFIX}/list`,
      catalog: `${API_PREFIX}/catalog`,
      recentLogs: `${API_PREFIX}/logs?limit=10`
    },
    lightStatus: true,
    schemaTouchOnStatus: false,
    removedHeavyFields: ['commands', 'moduleCatalog', 'recent'],
    mediaPlaybackBridge: { enabled: true, target: '/api/sound/play', legacyTargetRewritten: '/api/sound/play-media' },
    commandChannelGuard: { enabled: true, expectedChannel: cleanChannel(process.env.TWITCH_BOT_CHANNEL || ''), mismatchReason: 'channel_mismatch' },
    diagnostics: buildStandardDiagnostics(),
    updatedAt: nowIso()
  };
}

function readMessageFromReq(req) { return cleanText(core.getParam(req, 'message', '') || core.getParam(req, 'rawMessage', '') || core.getParam(req, 'text', '')); }
function readUserFromReq(req) {
  const login = cleanLogin(core.getParam(req, 'userLogin', '') || core.getParam(req, 'login', '') || core.getParam(req, 'user', 'testuser'));
  const displayName = cleanText(core.getParam(req, 'displayName', '') || core.getParam(req, 'userDisplayName', '') || login);
  const role = cleanText(core.getParam(req, 'role', 'everyone')).toLowerCase();
  return { login, displayName: displayName || login, userId: '', badges: role === 'mod' ? { moderator: '1' } : (role === 'vip' ? { vip: '1' } : (role === 'streamer' || role === 'owner' ? { broadcaster: '1' } : {})), isBroadcaster: role === 'streamer' || role === 'owner' || role === 'broadcaster', isMod: role === 'mod' || role === 'moderator', isVip: role === 'vip', isSubscriber: role === 'subscriber' || role === 'sub' };
}


function mediaCommandCheckPayload(trigger, req) {
  ensureSchema();
  const clean = cleanTrigger(trigger || '');
  if (!clean) throw new Error('trigger_missing');
  const match = getCommandByTrigger(clean);
  if (!match || !match.command) throw new Error('command_not_found');
  const command = match.command;
  const user = readUserFromReq(req || { query: {} });
  const parsedCommand = { rawMessage: `${state.prefix || DEFAULT_PREFIX}${command.trigger}`, args: [], trigger: command.trigger };
  const payload = buildTargetPayload(command, parsedCommand, user, { source: 'media_command_check', dryRun: true });
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    trigger: command.trigger,
    isMediaCommand: isMediaPlaybackCommand(command),
    actionType: commandActionType(command),
    mediaId: commandMediaId(command),
    savedTargetUrl: command.targetUrl || '',
    effectiveTargetUrl: effectiveCommandTargetUrl(command),
    targetMethod: command.targetMethod || 'POST',
    payloadPreview: payload,
    warnings: isMediaPlaybackCommand(command) && !commandMediaId(command) ? ['media_id_missing'] : []
  };
}

module.exports.MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: 'runtime',
  category: 'commands',
  description: 'Zentrales Chat-Command-System mit Registry, Katalog, Test, Execute und Logs.',
  routesPrefix: [API_PREFIX],
  bus: {
    registered: false,
    heartbeat: false,
    emits: [],
    listens: []
  },
  legacy: false
};
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.version = MODULE_VERSION;
module.exports.handleChatMessage = handleChatMessage;
module.exports.processMessage = processMessage;
module.exports.getStatus = statusPayload;

module.exports.init = function init(ctx) {
  const { app } = ctx;
  state.ctx = ctx;
  state.loadedAt = nowIso();
  state.initialized = true;
  state.prefix = cleanText(process.env.COMMAND_PREFIX || DEFAULT_PREFIX) || DEFAULT_PREFIX;
  state.enabled = !/^(0|false|no|off)$/i.test(String(process.env.COMMAND_SYSTEM_ENABLED || 'true'));
  ensureSchema();

  app.get(`${API_PREFIX}/status`, (req, res) => {
    try { return res.json(statusPayload()); }
    catch (err) { return res.status(500).json(core.fail(err.message || String(err))); }
  });
  app.get(`${API_PREFIX}/list`, (req, res) => {
    try { return res.json(core.ok({ commands: listCommands({ includeDisabled: bool(core.getParam(req, 'includeDisabled', true), true) }) })); }
    catch (err) { return res.status(500).json(core.fail(err.message || String(err))); }
  });
  app.get(`${API_PREFIX}/catalog`, (req, res) => {
    try { return res.json(buildCommandCatalog()); }
    catch (err) { return res.status(500).json(core.fail(err.message || String(err))); }
  });
  app.post(`${API_PREFIX}/upsert`, (req, res) => {
    try { return res.json(core.ok(upsertCommand(req.body || req.query || {}))); }
    catch (err) { return res.status(400).json(core.fail(err.message || String(err))); }
  });
  app.post(`${API_PREFIX}/delete`, (req, res) => {
    try { return res.json(core.ok(deleteCommand(core.getParam(req, 'id', '') || core.getParam(req, 'trigger', '')))); }
    catch (err) { return res.status(400).json(core.fail(err.message || String(err))); }
  });
  async function handleTest(req, res) {
    try { return res.json(core.ok(await processMessage({ rawMessage: readMessageFromReq(req), user: readUserFromReq(req) }, { source: 'api_test', dryRun: true }))); }
    catch (err) { return res.status(500).json(core.fail(err.message || String(err))); }
  }
  async function handleExecute(req, res) {
    try { const result = await processMessage({ rawMessage: readMessageFromReq(req), user: readUserFromReq(req) }, { source: 'api_execute' }); return res.status(result.ok ? 200 : 409).json(result); }
    catch (err) { return res.status(500).json(core.fail(err.message || String(err))); }
  }
  function handleLogs(req, res) {
    try { return res.json(core.ok({ logs: recentLogs(core.getParam(req, 'limit', 25)) })); }
    catch (err) { return res.status(500).json(core.fail(err.message || String(err))); }
  }
  app.get(`${API_PREFIX}/test`, handleTest);
  app.post(`${API_PREFIX}/test`, handleTest);
  app.get(`${API_PREFIX}/execute`, handleExecute);
  app.post(`${API_PREFIX}/execute`, handleExecute);
  app.get(`${API_PREFIX}/media-command-preview`, (req, res) => {
    try { return res.json(mediaCommandCheckPayload(core.getParam(req, 'trigger', ''), req)); }
    catch (err) { return res.status(400).json(core.fail(err.message || String(err))); }
  });
  app.get(`${API_PREFIX}/logs`, handleLogs);
  app.get(`${API_PREFIX}/history`, handleLogs);
  console.log(`[commands] routes active: /api/commands/* (${MODULE_VERSION}, channel guard)`);
};
