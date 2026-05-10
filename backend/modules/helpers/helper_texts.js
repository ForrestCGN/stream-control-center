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
      id ${database.primaryKeyAutoIncrementSql()},
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
    const result = database.insertIgnore(table, {
      module_name: moduleKey,
      text_key: item.key,
      text_value: item.value,
      enabled: item.enabled ? 1 : 0,
      description: item.description || '',
      source: options.source || 'seed',
      created_at: now,
      updated_at: now
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

  try {
    setModuleTextVariant(moduleKey, { key: textKey, value: textValue, enabled: Boolean(enabled), description }, options);
  } catch (err) {
    // Legacy single-text storage must continue to work even if the variants layer is unavailable.
  }

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



const DEFAULT_MODULE_TEXT_VARIANTS_TABLE = 'module_text_variants';

function cleanVariantsTable(value) {
  const table = String(value || DEFAULT_MODULE_TEXT_VARIANTS_TABLE).trim();
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) throw new Error(`invalid_text_variants_table:${table}`);
  return table;
}

function ensureModuleTextVariantsTable(tableName = DEFAULT_MODULE_TEXT_VARIANTS_TABLE) {
  const table = cleanVariantsTable(tableName);
  const qTable = database.quoteIdentifier(table);

  database.exec(`
    CREATE TABLE IF NOT EXISTS ${qTable} (
      id ${database.primaryKeyAutoIncrementSql()},
      module_name TEXT NOT NULL,
      text_key TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      text_value TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      weight INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'database',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  database.exec(`CREATE INDEX IF NOT EXISTS idx_${table}_module_key ON ${qTable} (module_name, text_key);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_${table}_module_category ON ${qTable} (module_name, category);`);
  return table;
}

function normalizeCategory(value) {
  const category = String(value || 'general').trim() || 'general';
  if (!/^[a-zA-Z0-9_.:-]+$/.test(category)) return 'general';
  return category;
}

function resolveTextCategory(key, options = {}) {
  const categories = options.categories && typeof options.categories === 'object' ? options.categories : {};
  const direct = categories[key];
  if (typeof direct === 'string') return normalizeCategory(direct);
  if (direct && typeof direct === 'object') return normalizeCategory(direct.category || direct.id || direct.key);
  return normalizeCategory(options.defaultCategory || 'general');
}

function resolveCategoryLabel(category, options = {}) {
  const labels = options.categoryLabels && typeof options.categoryLabels === 'object' ? options.categoryLabels : {};
  const value = labels[category];
  if (value && typeof value === 'object') return String(value.label || value.name || category);
  if (value) return String(value);
  return String(category);
}

function normalizeDefaultTextVariants(defaults = {}, options = {}) {
  if (!defaults || typeof defaults !== 'object' || Array.isArray(defaults)) return [];
  const items = [];
  let index = 0;

  for (const [rawKey, rawValue] of Object.entries(defaults)) {
    if (!rawKey || String(rawKey).startsWith('_')) continue;
    const key = cleanTextKey(rawKey);
    const category = resolveTextCategory(key, options);
    const description = rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)
      ? String(rawValue.description || '')
      : '';
    const values = normalizeTextList(rawValue);

    for (const value of values) {
      items.push({
        key,
        category,
        value,
        enabled: true,
        weight: 1,
        sortOrder: index,
        description
      });
      index += 1;
    }
  }

  return items;
}

function rowToModuleTextVariant(row) {
  if (!row) return null;
  return {
    id: row.id,
    module: row.module_name,
    key: row.text_key,
    category: row.category || 'general',
    value: row.text_value || '',
    text: row.text_value || '',
    enabled: Number(row.enabled) !== 0,
    weight: Number(row.weight || 1),
    sortOrder: Number(row.sort_order || 0),
    description: row.description || '',
    source: row.source || 'database',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || ''
  };
}

function seedModuleTextVariants(moduleName, defaults = {}, options = {}) {
  const table = ensureModuleTextVariantsTable(options.variantsTableName || DEFAULT_MODULE_TEXT_VARIANTS_TABLE);
  const qTable = database.quoteIdentifier(table);
  const moduleKey = cleanTextModule(moduleName);
  const now = core.nowIso();
  let inserted = 0;

  for (const item of normalizeDefaultTextVariants(defaults, options)) {
    const exists = database.get(`
      SELECT id FROM ${qTable}
      WHERE module_name = :moduleName AND text_key = :textKey AND text_value = :textValue
      LIMIT 1
    `, { moduleName: moduleKey, textKey: item.key, textValue: item.value });
    if (exists) continue;

    const result = database.run(`
      INSERT INTO ${qTable}
        (module_name, text_key, category, text_value, enabled, weight, sort_order, description, source, created_at, updated_at)
      VALUES
        (:moduleName, :textKey, :category, :textValue, :enabled, :weight, :sortOrder, :description, :source, :createdAt, :updatedAt)
    `, {
      moduleName: moduleKey,
      textKey: item.key,
      category: item.category,
      textValue: item.value,
      enabled: item.enabled ? 1 : 0,
      weight: item.weight || 1,
      sortOrder: item.sortOrder || 0,
      description: item.description || '',
      source: options.source || 'seed',
      createdAt: now,
      updatedAt: now
    });
    inserted += Number(result?.changes || 0);
  }

  return { ok: true, table, module: moduleKey, inserted };
}

function migrateLegacyModuleTextsToVariants(moduleName, options = {}) {
  const variantsTable = ensureModuleTextVariantsTable(options.variantsTableName || DEFAULT_MODULE_TEXT_VARIANTS_TABLE);
  const legacyTable = ensureModuleTextsTable(options.tableName || DEFAULT_MODULE_TEXTS_TABLE);
  const qVariants = database.quoteIdentifier(variantsTable);
  const qLegacy = database.quoteIdentifier(legacyTable);
  const moduleKey = cleanTextModule(moduleName);
  const now = core.nowIso();
  let inserted = 0;

  const legacyRows = database.all(`
    SELECT module_name, text_key, text_value, enabled, description, source
    FROM ${qLegacy}
    WHERE module_name = :moduleName
  `, { moduleName: moduleKey });

  for (const row of legacyRows) {
    const textValue = String(row.text_value || '').trim();
    if (!textValue) continue;
    const exists = database.get(`
      SELECT id FROM ${qVariants}
      WHERE module_name = :moduleName AND text_key = :textKey AND text_value = :textValue
      LIMIT 1
    `, { moduleName: moduleKey, textKey: row.text_key, textValue });
    if (exists) continue;

    const result = database.run(`
      INSERT INTO ${qVariants}
        (module_name, text_key, category, text_value, enabled, weight, sort_order, description, source, created_at, updated_at)
      VALUES
        (:moduleName, :textKey, :category, :textValue, :enabled, :weight, :sortOrder, :description, :source, :createdAt, :updatedAt)
    `, {
      moduleName: moduleKey,
      textKey: cleanTextKey(row.text_key),
      category: resolveTextCategory(row.text_key, options),
      textValue,
      enabled: Number(row.enabled) !== 0 ? 1 : 0,
      weight: 1,
      sortOrder: 0,
      description: row.description || '',
      source: row.source === 'seed' ? 'seed' : 'legacy',
      createdAt: now,
      updatedAt: now
    });
    inserted += Number(result?.changes || 0);
  }

  return { ok: true, module: moduleKey, table: variantsTable, legacyTable, inserted };
}

function listModuleTextVariants(moduleName, defaults = {}, options = {}) {
  const table = ensureModuleTextVariantsTable(options.variantsTableName || DEFAULT_MODULE_TEXT_VARIANTS_TABLE);
  const qTable = database.quoteIdentifier(table);
  const moduleKey = cleanTextModule(moduleName);

  if (options.seed !== false) seedModuleTextVariants(moduleKey, defaults, options);
  if (options.migrateLegacy !== false) migrateLegacyModuleTextsToVariants(moduleKey, options);

  return database.all(`
    SELECT id, module_name, text_key, category, text_value, enabled, weight, sort_order, description, source, created_at, updated_at
    FROM ${qTable}
    WHERE module_name = :moduleName
    ORDER BY category ASC, text_key ASC, sort_order ASC, id ASC
  `, { moduleName: moduleKey }).map(rowToModuleTextVariant);
}

function buildModuleTextEditorPayload(moduleName, defaults = {}, options = {}) {
  const moduleKey = cleanTextModule(moduleName);
  const variantsTable = ensureModuleTextVariantsTable(options.variantsTableName || DEFAULT_MODULE_TEXT_VARIANTS_TABLE);
  const rows = listModuleTextVariants(moduleKey, defaults, options);
  const keyMap = new Map();
  const categoryMap = new Map();

  for (const row of rows) {
    const category = normalizeCategory(row.category || resolveTextCategory(row.key, options));
    const item = keyMap.get(row.key) || {
      key: row.key,
      category,
      label: row.key,
      variants: [],
      activeCount: 0,
      totalCount: 0
    };
    item.variants.push(row);
    item.totalCount += 1;
    if (row.enabled) item.activeCount += 1;
    keyMap.set(row.key, item);

    const cat = categoryMap.get(category) || {
      id: category,
      key: category,
      label: resolveCategoryLabel(category, options),
      count: 0,
      keyCount: 0,
      variantCount: 0
    };
    cat.variantCount += 1;
    categoryMap.set(category, cat);
  }

  for (const item of keyMap.values()) {
    const cat = categoryMap.get(item.category);
    if (cat) cat.keyCount += 1;
  }

  const categories = Array.from(categoryMap.values())
    .map(cat => ({ ...cat, count: cat.keyCount }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const keys = Array.from(keyMap.values())
    .sort((a, b) => a.category.localeCompare(b.category) || a.key.localeCompare(b.key));

  const compatibilityRows = keys.map(item => {
    const active = item.variants.find(variant => variant.enabled) || item.variants[0] || null;
    return active ? {
      id: active.id,
      module: moduleKey,
      key: item.key,
      category: item.category,
      value: active.value,
      text: active.text,
      enabled: active.enabled,
      description: active.description,
      source: active.source,
      variantCount: item.variants.length,
      activeCount: item.activeCount,
      createdAt: active.createdAt,
      updatedAt: active.updatedAt
    } : null;
  }).filter(Boolean);

  return {
    ok: true,
    table: variantsTable,
    variantsTable,
    legacyTable: options.tableName || DEFAULT_MODULE_TEXTS_TABLE,
    module: moduleKey,
    count: keys.length,
    variantCount: rows.length,
    categories,
    keys,
    rows: compatibilityRows
  };
}

function listModuleTextEditor(moduleName, defaults = {}, options = {}) {
  return buildModuleTextEditorPayload(moduleName, defaults, options);
}

function pickWeightedVariant(variants) {
  const active = (variants || []).filter(row => row && row.enabled && String(row.value || '').trim());
  if (active.length === 0) return null;
  const totalWeight = active.reduce((sum, row) => sum + Math.max(1, Number(row.weight || 1)), 0);
  let roll = Math.random() * totalWeight;
  for (const row of active) {
    roll -= Math.max(1, Number(row.weight || 1));
    if (roll <= 0) return row;
  }
  return active[active.length - 1];
}

function pickModuleText(moduleName, key, defaults = {}, options = {}) {
  const moduleKey = cleanTextModule(moduleName);
  const textKey = cleanTextKey(key);
  const variants = listModuleTextVariants(moduleKey, defaults, options).filter(row => row.key === textKey);
  const picked = pickWeightedVariant(variants);
  if (picked) return picked.value;

  const fallback = defaults && Object.prototype.hasOwnProperty.call(defaults, textKey) ? defaults[textKey] : '';
  const list = normalizeTextList(fallback);
  if (list.length === 0) return '';
  if (options.mode === 'first') return list[0];
  return list[Math.floor(Math.random() * list.length)];
}

function renderModuleText(moduleName, key, defaults = {}, context = {}, options = {}) {
  return renderTemplate(pickModuleText(moduleName, key, defaults, options), context);
}

function setModuleTextVariant(moduleName, variant = {}, options = {}) {
  const table = ensureModuleTextVariantsTable(options.variantsTableName || DEFAULT_MODULE_TEXT_VARIANTS_TABLE);
  const qTable = database.quoteIdentifier(table);
  const moduleKey = cleanTextModule(moduleName);
  const id = Number.parseInt(variant.id || variant.variantId || 0, 10);
  const textKey = cleanTextKey(variant.key || variant.textKey);
  const category = normalizeCategory(variant.category || resolveTextCategory(textKey, options));
  const textValue = String(variant.value ?? variant.text ?? '');
  const enabled = variant.enabled === false || variant.enabled === 0 || variant.enabled === 'false' ? 0 : 1;
  const weight = Math.max(1, Number.parseInt(variant.weight || 1, 10) || 1);
  const sortOrder = Number.parseInt(variant.sortOrder ?? variant.sort_order ?? 0, 10) || 0;
  const description = String(variant.description || '');
  const now = core.nowIso();

  if (id > 0) {
    database.run(`
      UPDATE ${qTable}
      SET text_key = :textKey,
          category = :category,
          text_value = :textValue,
          enabled = :enabled,
          weight = :weight,
          sort_order = :sortOrder,
          description = :description,
          source = 'database',
          updated_at = :updatedAt
      WHERE id = :id AND module_name = :moduleName
    `, { id, moduleName: moduleKey, textKey, category, textValue, enabled, weight, sortOrder, description, updatedAt: now });
  } else {
    database.run(`
      INSERT INTO ${qTable}
        (module_name, text_key, category, text_value, enabled, weight, sort_order, description, source, created_at, updated_at)
      VALUES
        (:moduleName, :textKey, :category, :textValue, :enabled, :weight, :sortOrder, :description, :source, :createdAt, :updatedAt)
    `, {
      moduleName: moduleKey,
      textKey,
      category,
      textValue,
      enabled,
      weight,
      sortOrder,
      description,
      source: 'database',
      createdAt: now,
      updatedAt: now
    });
  }

  return buildModuleTextEditorPayload(moduleKey, {}, { ...options, seed: false, migrateLegacy: false });
}

function deleteModuleTextVariant(moduleName, id, options = {}) {
  const table = ensureModuleTextVariantsTable(options.variantsTableName || DEFAULT_MODULE_TEXT_VARIANTS_TABLE);
  const qTable = database.quoteIdentifier(table);
  const moduleKey = cleanTextModule(moduleName);
  const variantId = Number.parseInt(id || 0, 10);
  if (!variantId) throw new Error('variant_id_required');

  const result = database.run(`DELETE FROM ${qTable} WHERE id = :id AND module_name = :moduleName`, {
    id: variantId,
    moduleName: moduleKey
  });

  return {
    ok: true,
    module: moduleKey,
    deleted: Number(result?.changes || 0),
    texts: buildModuleTextEditorPayload(moduleKey, {}, { ...options, seed: false, migrateLegacy: false })
  };
}

function handleModuleTextEditorPayload(moduleName, payload = {}, options = {}) {
  const body = payload && typeof payload === 'object' ? payload : {};
  const action = String(body.action || '').trim();

  if (action === 'deleteVariant' || action === 'delete_variant') {
    return deleteModuleTextVariant(moduleName, body.id || body.variantId, options);
  }

  if (action === 'saveVariant' || action === 'save_variant' || body.variant) {
    return {
      ok: true,
      module: cleanTextModule(moduleName),
      texts: setModuleTextVariant(moduleName, body.variant || body, options)
    };
  }

  const updates = body.texts && typeof body.texts === 'object' && !Array.isArray(body.texts)
    ? body.texts
    : (body.key ? { [body.key]: body.value } : {});

  for (const [key, value] of Object.entries(updates)) {
    setModuleTextVariant(moduleName, { key, value, category: resolveTextCategory(key, options), enabled: true }, options);
  }

  return {
    ok: true,
    module: cleanTextModule(moduleName),
    texts: buildModuleTextEditorPayload(moduleName, {}, { ...options, seed: false, migrateLegacy: false })
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
  DEFAULT_MODULE_TEXT_VARIANTS_TABLE,
  ensureModuleTextsTable,
  ensureModuleTextVariantsTable,
  seedModuleTexts,
  seedModuleTextVariants,
  listModuleTexts,
  listModuleTextVariants,
  listModuleTextEditor,
  getModuleTexts,
  pickModuleText,
  renderModuleText,
  setModuleText,
  setModuleTexts,
  setModuleTextVariant,
  deleteModuleTextVariant,
  handleModuleTextEditorPayload,
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
