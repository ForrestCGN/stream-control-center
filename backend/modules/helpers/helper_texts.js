'use strict';

const fs = require('fs');
const path = require('path');
const core = require('./helper_core');
const config = require('./helper_config');
const messages = require('./helper_messages');
const database = require('../../core/database');

const DEFAULT_MESSAGE_FILES = {
  'system.json': {
    _meta: {
      description: 'Allgemeine System- und Fallback-Texte für das zentrale Message-System.'
    },
    default_error: [
      'Da ist gerade etwas schiefgelaufen. Die Heimleitung schaut drauf.'
    ],
    default_success: [
      'Erledigt.'
    ],
    command_cooldown: [
      '{displayName}, bitte kurz warten. Der Befehl ist noch im Cooldown.'
    ]
  },
  'community.json': {
    _meta: {
      description: 'Allgemeine Community- und Stream-Hinweise.'
    },
    rules_reminder: [
      'Bitte bleibt respektvoll im Chat. Wir wollen hier gemeinsam eine gute Zeit haben.',
      'Kleiner Hinweis der Heimleitung: freundlich bleiben, dann bleibt der Stream für alle entspannt.'
    ],
    clip_reminder: [
      'Guter Moment? Mit !clip könnt ihr direkt einen Clip erstellen.',
      'Wenn gerade etwas Clip-würdig war: !clip reicht aus.'
    ]
  },
  'follow.json': {
    _meta: {
      description: 'Follow-Hinweise. Eigene Kategorie/Datei, damit Streamer die Texte leichter finden.'
    },
    follow_reminder: [
      '💜 Wenn euch der Stream gefällt, lasst gerne ein Follow da. Das hilft uns sehr.',
      '💜 Schön, dass ihr da seid. Ein Follow unterstützt unseren Stream direkt.'
    ]
  },
  'youtube.json': {
    _meta: {
      description: 'YouTube-Hinweise. Kurz gehalten und für Duo-Formulierungen vorbereitet.'
    },
    youtube_reminder: [
      '🎬 Unsere Clips und Highlights findet ihr auch auf YouTube: {youtubeUrl}',
      '📺 Wenn ihr uns auch außerhalb von Twitch unterstützen wollt: {youtubeUrl}',
      '🎮 Verpasst keine Highlights: Schaut gerne auch auf unserem YouTube-Kanal vorbei: {youtubeUrl}'
    ]
  },
  'discord.json': {
    _meta: {
      description: 'Discord- und Community-Hinweise.'
    },
    discord_reminder: [
      '💬 Unsere Community findet ihr auch im Discord: {discordUrl}',
      '💜 Ihr wollt auch außerhalb des Streams quatschen? Kommt gerne in den Discord: {discordUrl}'
    ]
  },
  'respect.json': {
    _meta: {
      description: 'Hinweise für RespektOhneAusnahme und ähnliche Community-Projekte.'
    },
    respect_project: [
      '💜 Respekt ohne Ausnahme: Gegen Mobbing, gegen Ausgrenzung, für mehr Menschlichkeit.',
      'Niemand sollte mit Mobbing allein bleiben. #RespektOhneAusnahme'
    ]
  },
  'placeholders.json': {
    _meta: {
      description: 'Zentrale Platzhalter für Message-Texte. Kann pro Streamer einfach angepasst werden.'
    },
    _placeholders: {
      youtubeUrl: 'https://www.youtube.com/@ForrestCGN',
      discordUrl: 'https://discord.gg/CGN-Community',
      respectUrl: ''
    }
  },
  'streamerbot.json': {
    _meta: {
      description: 'Texte, die Streamer.bot direkt als Chat-Nachricht verwenden kann.'
    },
    welcome_first_message: [
      'Willkommen im Stream {displayName} 💜'
    ],
    welcome_delayed: [
      'Schön, dass du da bist, {displayName} 💜'
    ]
  }
};

let cache = null;
let cacheInfo = null;
let cachePlaceholders = {};

function getMessagesDir() {
  return config.resolveFromConfig('messages');
}

function ensureDefaultMessageFiles() {
  const dir = getMessagesDir();
  core.ensureDir(dir);

  for (const [fileName, content] of Object.entries(DEFAULT_MESSAGE_FILES)) {
    const filePath = path.join(dir, fileName);
    if (!core.fileExists(filePath)) {
      core.writeJson(filePath, content, { spaces: 2 });
    }
  }

  return dir;
}

function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(file => file.toLowerCase().endsWith('.json'))
    .sort((a, b) => a.localeCompare(b));
}

function normalizeTextList(value) {
  if (Array.isArray(value)) {
    return value
      .map(item => String(item ?? '').trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const text = value.trim();
    return text ? [text] : [];
  }

  if (value && typeof value === 'object' && Array.isArray(value.texts)) {
    return normalizeTextList(value.texts);
  }

  return [];
}

function normalizePlaceholders(value) {
  const result = {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return result;

  for (const [key, rawValue] of Object.entries(value)) {
    if (!key || rawValue === undefined || rawValue === null) continue;
    if (typeof rawValue === 'object') continue;
    result[key] = String(rawValue);
  }

  return result;
}

function loadMessageFiles() {
  const dir = ensureDefaultMessageFiles();
  const files = listJsonFiles(dir);
  const byKey = {};
  const placeholders = {};
  const fileInfo = [];
  const errors = [];

  for (const fileName of files) {
    const filePath = path.join(dir, fileName);
    const data = core.readJson(filePath, null);

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      errors.push({ file: fileName, error: 'invalid_json_object' });
      continue;
    }

    const filePlaceholders = normalizePlaceholders(data._placeholders);
    Object.assign(placeholders, filePlaceholders);

    let keyCount = 0;
    for (const [key, rawValue] of Object.entries(data)) {
      if (!key || key.startsWith('_')) continue;
      const texts = normalizeTextList(rawValue);
      if (texts.length === 0) continue;

      byKey[key] = {
        key,
        file: fileName,
        texts,
        count: texts.length
      };
      keyCount += 1;
    }

    fileInfo.push({
      file: fileName,
      path: filePath,
      keys: keyCount,
      placeholders: Object.keys(filePlaceholders).length
    });
  }

  cache = byKey;
  cachePlaceholders = placeholders;
  cacheInfo = {
    ok: true,
    dir,
    files: fileInfo,
    fileCount: fileInfo.length,
    keyCount: Object.keys(byKey).length,
    placeholderKeys: Object.keys(placeholders).sort(),
    errors,
    loadedAt: core.nowIso()
  };

  return cacheInfo;
}

function reload() {
  return loadMessageFiles();
}


const DEFAULT_MODULE_TEXTS_TABLE = 'module_texts';

function cleanTextModule(value) {
  const moduleName = String(value || '').trim();
  if (!moduleName) throw new Error('text_module_required');
  if (!/^[a-zA-Z0-9_.:-]+$/.test(moduleName)) throw new Error(`invalid_text_module:${moduleName}`);
  return moduleName;
}

function cleanTextKey(value) {
  const key = String(value || '').trim();
  if (!key) throw new Error('text_key_required');
  if (!/^[a-zA-Z0-9_.:-]+$/.test(key)) throw new Error(`invalid_text_key:${key}`);
  return key;
}

function cleanTextsTable(value) {
  const table = String(value || DEFAULT_MODULE_TEXTS_TABLE).trim();
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) throw new Error(`invalid_texts_table:${table}`);
  return table;
}

function ensureModuleTextsTable(tableName = DEFAULT_MODULE_TEXTS_TABLE) {
  const table = cleanTextsTable(tableName);
  const qTable = database.quoteIdentifier(table);

  database.exec(`
    CREATE TABLE IF NOT EXISTS ${qTable} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_name TEXT NOT NULL,
      text_key TEXT NOT NULL,
      text_value TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      description TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'database',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(module_name, text_key)
    );
  `);

  return table;
}

function normalizeModuleTextDefaults(defaults = {}) {
  if (!defaults || typeof defaults !== 'object' || Array.isArray(defaults)) return [];

  return Object.entries(defaults)
    .filter(([key]) => key && !String(key).startsWith('_'))
    .map(([key, value]) => {
      let text = '';
      if (Array.isArray(value)) text = value.map(item => String(item ?? '').trim()).filter(Boolean).join('\n');
      else if (value && typeof value === 'object' && Array.isArray(value.texts)) text = normalizeTextList(value).join('\n');
      else text = String(value ?? '');

      return {
        key: cleanTextKey(key),
        value: text,
        enabled: true,
        description: value && typeof value === 'object' && !Array.isArray(value) ? String(value.description || '') : ''
      };
    });
}

function rowToModuleText(row) {
  if (!row) return null;
  return {
    id: row.id,
    module: row.module_name,
    key: row.text_key,
    value: row.text_value || '',
    text: row.text_value || '',
    enabled: Number(row.enabled) !== 0,
    description: row.description || '',
    source: row.source || 'database',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || ''
  };
}

function seedModuleTexts(moduleName, defaults = {}, options = {}) {
  const table = ensureModuleTextsTable(options.tableName || DEFAULT_MODULE_TEXTS_TABLE);
  const qTable = database.quoteIdentifier(table);
  const moduleKey = cleanTextModule(moduleName);
  const now = core.nowIso();
  let inserted = 0;

  for (const item of normalizeModuleTextDefaults(defaults)) {
    const result = database.run(`
      INSERT OR IGNORE INTO ${qTable}
        (module_name, text_key, text_value, enabled, description, source, created_at, updated_at)
      VALUES
        (:moduleName, :textKey, :textValue, :enabled, :description, :source, :createdAt, :updatedAt)
    `, {
      moduleName: moduleKey,
      textKey: item.key,
      textValue: item.value,
      enabled: item.enabled ? 1 : 0,
      description: item.description || '',
      source: options.source || 'seed',
      createdAt: now,
      updatedAt: now
    });

    inserted += Number(result?.changes || 0);
  }

  return { ok: true, table, module: moduleKey, inserted };
}

function listModuleTexts(moduleName, defaults = {}, options = {}) {
  const table = ensureModuleTextsTable(options.tableName || DEFAULT_MODULE_TEXTS_TABLE);
  const qTable = database.quoteIdentifier(table);
  const moduleKey = cleanTextModule(moduleName);

  if (options.seed !== false) seedModuleTexts(moduleKey, defaults, options);

  const rows = database.all(`
    SELECT id, module_name, text_key, text_value, enabled, description, source, created_at, updated_at
    FROM ${qTable}
    WHERE module_name = :moduleName
    ORDER BY text_key ASC
  `, { moduleName: moduleKey }).map(rowToModuleText);

  const rowMap = new Map(rows.map(row => [row.key, row]));
  for (const item of normalizeModuleTextDefaults(defaults)) {
    if (!rowMap.has(item.key)) {
      rows.push({
        id: null,
        module: moduleKey,
        key: item.key,
        value: item.value,
        text: item.value,
        enabled: true,
        description: item.description || '',
        source: 'default',
        createdAt: '',
        updatedAt: ''
      });
    }
  }

  rows.sort((a, b) => String(a.key).localeCompare(String(b.key)));

  return {
    ok: true,
    table,
    module: moduleKey,
    count: rows.length,
    rows
  };
}

function getModuleTexts(moduleName, defaults = {}, options = {}) {
  const listed = listModuleTexts(moduleName, defaults, options);
  const texts = { ...(defaults || {}) };

  for (const row of listed.rows) {
    if (row.enabled) texts[row.key] = row.value;
  }

  return {
    ok: true,
    table: listed.table,
    module: listed.module,
    count: listed.count,
    texts,
    rows: listed.rows
  };
}

function setModuleText(moduleName, key, value, options = {}) {
  const table = ensureModuleTextsTable(options.tableName || DEFAULT_MODULE_TEXTS_TABLE);
  const qTable = database.quoteIdentifier(table);
  const moduleKey = cleanTextModule(moduleName);
  const textKey = cleanTextKey(key);
  const textValue = String(value ?? '');
  const enabled = options.enabled === false ? 0 : 1;
  const description = String(options.description || '');
  const now = core.nowIso();

  database.run(`
    INSERT INTO ${qTable}
      (module_name, text_key, text_value, enabled, description, source, created_at, updated_at)
    VALUES
      (:moduleName, :textKey, :textValue, :enabled, :description, :source, :createdAt, :updatedAt)
    ON CONFLICT(module_name, text_key) DO UPDATE SET
      text_value = excluded.text_value,
      enabled = excluded.enabled,
      description = CASE WHEN excluded.description = '' THEN ${qTable}.description ELSE excluded.description END,
      source = 'database',
      updated_at = excluded.updated_at
  `, {
    moduleName: moduleKey,
    textKey,
    textValue,
    enabled,
    description,
    source: 'database',
    createdAt: now,
    updatedAt: now
  });

  return listModuleTexts(moduleKey, {}, { tableName: table, seed: false }).rows.find(row => row.key === textKey) || null;
}

function setModuleTexts(moduleName, values = {}, options = {}) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) throw new Error('texts_object_required');
  const rows = [];

  for (const [key, value] of Object.entries(values)) {
    rows.push(setModuleText(moduleName, key, value, options));
  }

  return {
    ok: true,
    module: cleanTextModule(moduleName),
    count: rows.length,
    rows
  };
}

function getStore() {
  if (!cache) loadMessageFiles();
  return cache || {};
}

function getStatus() {
  if (!cacheInfo || !cache) loadMessageFiles();
  return {
    ...cacheInfo,
    keys: Object.keys(getStore()).sort()
  };
}

function hasKey(key) {
  return Object.prototype.hasOwnProperty.call(getStore(), String(key || '').trim());
}

function getEntry(key) {
  const cleanKey = String(key || '').trim();
  if (!cleanKey) return null;
  return getStore()[cleanKey] || null;
}

function getTexts(key) {
  const entry = getEntry(key);
  return entry ? [...entry.texts] : [];
}

function getPlaceholders() {
  if (!cache) loadMessageFiles();
  return { ...(cachePlaceholders || {}) };
}

function pickText(key, options = {}) {
  const texts = getTexts(key);
  if (texts.length === 0) return '';

  const indexRaw = options.index;
  if (indexRaw !== undefined && indexRaw !== null && indexRaw !== '') {
    const index = Number.parseInt(indexRaw, 10);
    if (Number.isInteger(index) && index >= 0 && index < texts.length) return texts[index];
  }

  if (options.mode === 'first') return texts[0];
  return texts[Math.floor(Math.random() * texts.length)];
}

function flattenContext(input = {}) {
  const placeholders = getPlaceholders();
  const context = { ...placeholders };

  for (const [key, value] of Object.entries(input || {})) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'object') continue;
    context[key] = String(value);
  }

  if (!context.displayName && context.user) context.displayName = context.user;
  if (!context.user && context.displayName) context.user = context.displayName;
  if (!context.login && context.username) context.login = context.username;
  if (!context.username && context.login) context.username = context.login;

  context.youtubeUrl = context.youtubeUrl || process.env.YOUTUBE_URL || process.env.CHANNEL_YOUTUBE_URL || placeholders.youtubeUrl || '';
  context.discordUrl = context.discordUrl || process.env.DISCORD_INVITE_URL || process.env.DISCORD_URL || placeholders.discordUrl || '';
  context.respectUrl = context.respectUrl || process.env.RESPECT_URL || placeholders.respectUrl || '';
  context.channel = context.channel || process.env.TWITCH_CHANNEL || process.env.TWITCH_CHANNEL_LOGIN || placeholders.channel || '';

  return context;
}

function renderTemplate(template, context = {}) {
  const data = flattenContext(context);
  return String(template || '').replace(/\{([a-zA-Z0-9_.-]+)\}/g, (match, name) => {
    if (Object.prototype.hasOwnProperty.call(data, name)) return data[name];
    return match;
  });
}

function renderKey(key, context = {}, options = {}) {
  const template = pickText(key, options);
  if (!template) return '';
  return renderTemplate(template, context);
}

function buildChatResult(key, context = {}, options = {}) {
  const entry = getEntry(key);
  if (!entry) {
    return {
      ok: false,
      error: 'message_key_not_found',
      key,
      message: `Message-Key nicht gefunden: ${key}`,
      availableKeys: Object.keys(getStore()).sort()
    };
  }

  const text = renderKey(key, context, options);
  const maxLength = Number.parseInt(options.maxLength || options.max || 450, 10) || 450;
  const cleanText = messages.sanitizeChatMessage(text, maxLength);

  return {
    ok: true,
    key,
    file: entry.file,
    count: entry.count,
    message: cleanText,
    text: cleanText,
    target: options.target || 'twitch_chat',
    ts: core.nowIso()
  };
}

module.exports = {
  DEFAULT_MODULE_TEXTS_TABLE,
  ensureModuleTextsTable,
  seedModuleTexts,
  listModuleTexts,
  getModuleTexts,
  setModuleText,
  setModuleTexts,
  getMessagesDir,
  ensureDefaultMessageFiles,
  reload,
  getStatus,
  hasKey,
  getEntry,
  getTexts,
  getPlaceholders,
  pickText,
  flattenContext,
  renderTemplate,
  renderKey,
  buildChatResult
};
