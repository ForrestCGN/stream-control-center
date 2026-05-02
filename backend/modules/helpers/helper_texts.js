'use strict';

const fs = require('fs');
const path = require('path');
const core = require('./helper_core');
const config = require('./helper_config');
const messages = require('./helper_messages');

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
