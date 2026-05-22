'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const database = require('../core/database');
const core = require('./helpers/helper_core');
const routes = require('./helpers/helper_routes');
const config = require('./helpers/helper_config');
const settings = require('./helpers/helper_settings');
const texts = require('./helpers/helper_texts');
const chatOutput = require('./helpers/helper_chat_output');
const mediaHelper = require('./helpers/helper_media');
const commands = require('./commands');

const MODULE_NAME = 'birthday';
const SCHEMA_VERSION = 3;
const SETTINGS_TABLE = 'birthday_settings';
const TEXTS_MODULE = 'birthday';
const API_PREFIX = '/api/birthday';

const DEFAULT_CONFIG = {
  enabled: true,
  timezone: 'Europe/Berlin',
  command: {
    enabled: true,
    trigger: 'birthday',
    aliases: ['bday'],
    permissionLevel: 'everyone',
    cooldownGlobalMs: 1000,
    cooldownUserMs: 5000
  },
  registration: {
    enabled: true,
    allowYear: true,
    storeYear: true
  },
  automaticGreeting: {
    enabled: true,
    skipCommandMessages: true,
    oncePerLocalDate: true,
    onlyWhenLive: true,
    writeDiaryEntry: true
  },
  diary: {
    enabled: true,
    systemUsername: 'Geburtstags-System'
  },
  chat: {
    prefer: 'bot',
    maxLength: 450,
    directSendEnabled: true,
    fallbackToStreamerbot: true
  },
  show: {
    enabled: true,
    allowedLogins: ['forrestcgn'],
    defaultVideoUrl: '',
    defaultVideoFile: 'birthday/birthday_intro_video.webm',
    defaultVideoDurationMs: 0,
    defaultSongFile: 'birthday/birthday_default_song.mp3',
    defaultSongVolume: 85,
    partyDurationMs: 22000,
    overlayFadeMs: 700,
    soundCategory: 'special',
    soundPriority: 75,
    soundOutputTarget: 'overlay',
    soundTarget: 'stream',
    forceExclusive: true,
    videoQuietPhaseLabel: 'Intro läuft',
    uploadDir: 'birthday'
  }
};

const DEFAULT_MESSAGES = {
  usage: [
    'Nutzung: !birthday set TT.MM, !birthday show oder !birthday delete.',
    '🎂 Heimleitungs-Hinweis: !birthday set TT.MM speichert deinen Geburtstag. Mit Jahr geht auch: !birthday set TT.MM.JJJJ'
  ],
  register_success: [
    '🎂 @{displayName}, dein Geburtstag wurde auf den {birthdayDate} gespeichert.',
    '💜 @{displayName}, notiert: {birthdayDate}. Die Heimleitung legt schon mal Kuchenakten an.'
  ],
  register_success_with_year: [
    '🎂 @{displayName}, dein Geburtstag wurde auf den {birthdayDate} gespeichert.',
    '💜 @{displayName}, notiert: {birthdayDate}. Wenn der Tag kommt, zählen wir offiziell mit. Heimleitungs-Ehrenwort.'
  ],
  register_updated: [
    '🎂 @{displayName}, dein Geburtstag wurde auf den {birthdayDate} aktualisiert.',
    '📝 @{displayName}, Geburtstag aktualisiert: {birthdayDate}. Die Heimleitung hat den Zettel neu laminiert.'
  ],
  register_updated_with_year: [
    '🎂 @{displayName}, dein Geburtstag wurde auf den {birthdayDate} aktualisiert.',
    '📝 @{displayName}, Geburtstag inklusive Baujahr aktualisiert: {birthdayDate}. Die Heimleitung hat es ordnungsgemäß eingetragen.'
  ],
  show_own_birthday: [
    '🎂 @{displayName}, gespeichert ist: {birthdayDate}.',
    '📋 @{displayName}, laut Heimleitungsakte steht bei dir: {birthdayDate}.'
  ],
  show_own_birthday_with_year: [
    '🎂 @{displayName}, gespeichert ist: {birthdayDate}. Aktuell wären das {age} Jahre.',
    '📋 @{displayName}, laut Heimleitungsakte steht bei dir: {birthdayDate}. Aktueller Rentner-Level: {age}.'
  ],
  show_missing: [
    '🎂 @{displayName}, für dich ist noch kein Geburtstag gespeichert. Nutze: !birthday set TT.MM'
  ],
  delete_success: [
    '🎂 @{displayName}, dein Geburtstag wurde gelöscht.',
    '🗑️ @{displayName}, dein Geburtstag wurde aus der Heimleitungsakte entfernt.'
  ],
  delete_missing: [
    '🎂 @{displayName}, für dich war kein Geburtstag gespeichert.'
  ],
  invalid_date: [
    '🎂 @{displayName}, das Datum passt nicht. Nutze z. B. !birthday set 22.05 oder !birthday set 22.05.1980',
    '📋 @{displayName}, die Heimleitung versteht nur TT.MM oder TT.MM.JJJJ. Beispiel: !birthday set 22.05'
  ],
  registration_disabled: [
    '🎂 Geburtstags-Registrierung ist aktuell deaktiviert.'
  ],
  birthday_greeting_chat: [
    '🎉 Alles Gute zum Geburtstag, @{displayName}! Schön, dass du heute mit uns feierst! 🎂',
    '🎂 Happy Birthday, @{displayName}! Lass dich feiern! 🎉',
    '💜 Alles Gute, @{displayName}! Die Heimleitung wünscht Kuchen, Konfetti und stabile Hüften. 🎂',
    '🎉 @{displayName} hat Geburtstag! Heute wird gefeiert, bis die Heimaufsicht das Licht ausmacht. 💜'
  ],
  birthday_greeting_chat_with_age: [
    '🎉 Happy Birthday, @{displayName}! Alles Gute zum {age}. Geburtstag! 🎂',
    '🎂 @{displayName}, alles Gute zum {age}. Geburtstag! Die Heimleitung hat den Kuchen freigegeben. 💜',
    '🎉 Alles Gute zum {age}. Geburtstag, @{displayName}! Rollator geölt, Kuchen bereit, Party genehmigt. 🎂',
    '💜 @{displayName} wird heute {age}! Die Heimaufsicht gratuliert offiziell und stellt eine Extraportion Kuchen aus. 🎉',
    '🎂 Happy Birthday @{displayName}! {age} Jahre jung – im Altersheim zählt das noch als Early Access. 💜'
  ],
  birthday_diary_entry: [
    '🎂 @{displayName} hatte heute Geburtstag und wurde im Chat beglückwünscht.',
    '🎂 Geburtstagsnotiz: @{displayName} wurde heute im Chat gefeiert.'
  ],
  birthday_diary_entry_with_age: [
    '🎂 @{displayName} hatte heute den {age}. Geburtstag und wurde im Chat beglückwünscht.',
    '🎂 Geburtstagsnotiz: @{displayName} wurde heute {age} und bekam eine offizielle Heimleitungs-Gratulation.'
  ],
  today_none: [
    '🎂 Heute sind keine registrierten Geburtstage gespeichert.'
  ],
  today_list: [
    '🎂 Heute Geburtstag: {names}',
    '📋 Heimleitungs-Geburtstagsliste für heute: {names}'
  ],
  already_greeted: [
    '🎂 @{displayName} wurde heute bereits beglückwünscht.'
  ],
  command_disabled: [
    '🎂 Das Birthday-Modul ist aktuell deaktiviert.'
  ],
  party_usage: [
    '🎉 Nutzung: !birthday party username',
    '🎂 Heimleitungs-Showbefehl: !birthday party username'
  ],
  party_denied: [
    '🎂 @{displayName}, dafür brauchst du eine Freigabe der Heimleitung.',
    '🚫 @{displayName}, die Geburtstagsshow darf nicht jeder starten. Heimaufsicht sagt nein.'
  ],
  party_started: [
    '🎉 Geburtstagsshow für @{targetDisplayName} wird gestartet!',
    '🎂 Heimleitung startet die Partyakte für @{targetDisplayName}. Intro läuft erst ruhig, Eskalation startet mit dem Song!'
  ],
  party_missing_target: [
    '🎂 Bitte gib einen User an: !birthday party username'
  ],
  party_disabled: [
    '🎂 Die Geburtstagsshow ist aktuell deaktiviert.'
  ]
};

const TEXT_CATEGORY_LABELS = {
  chat: 'Chat-Antworten',
  diary: 'Tagebuch',
  errors: 'Fehlertexte',
  system: 'System'
};

const TEXT_CATEGORIES = {
  usage: 'chat',
  register_success: 'chat',
  register_success_with_year: 'chat',
  register_updated: 'chat',
  register_updated_with_year: 'chat',
  show_own_birthday: 'chat',
  show_own_birthday_with_year: 'chat',
  show_missing: 'chat',
  delete_success: 'chat',
  delete_missing: 'chat',
  birthday_greeting_chat: 'chat',
  birthday_greeting_chat_with_age: 'chat',
  today_none: 'chat',
  today_list: 'chat',
  already_greeted: 'chat',
  birthday_diary_entry: 'diary',
  birthday_diary_entry_with_age: 'diary',
  invalid_date: 'errors',
  registration_disabled: 'errors',
  command_disabled: 'system',
  party_usage: 'chat',
  party_denied: 'errors',
  party_started: 'chat',
  party_missing_target: 'errors',
  party_disabled: 'system'
};

const state = {
  initialized: false,
  loadedAt: '',
  schemaOk: false,
  schemaError: '',
  configPath: '',
  commandSeeded: false,
  chatHookInstalled: false,
  automaticChecks: 0,
  automaticGreetings: 0,
  commandExecutions: 0,
  lastAutomaticCheckAt: '',
  lastGreetingAt: '',
  lastCommandAt: '',
  lastShowStartedAt: '',
  lastShowEndedAt: '',
  lastError: ''
};

let runtimeConfig = null;
let runtimeMessages = null;
let originalCommandHook = null;
let showState = {
  active: false,
  phase: 'idle',
  targetLogin: '',
  targetDisplayName: '',
  headline: '',
  message: '',
  videoUrl: '',
  videoFile: '',
  videoDurationMs: 0,
  songFile: '',
  songDurationMs: 0,
  songVolume: 0,
  startedAt: 0,
  phaseStartedAt: 0,
  phaseEndsAt: 0,
  endsAt: 0,
  requestId: '',
  startedBy: '',
  playback: {},
  error: ''
};
let showTimers = [];
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 250 * 1024 * 1024 } });

function nowIso() {
  return core.nowIso ? core.nowIso() : new Date().toISOString();
}

function clean(value) {
  return String(value ?? '').trim();
}

function cleanLogin(value) {
  return clean(value).replace(/^@/, '').toLowerCase();
}

function boolValue(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null || value === '') return fallback;
  const text = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on', 'y'].includes(text)) return true;
  if (['0', 'false', 'no', 'nein', 'off', 'n'].includes(text)) return false;
  return fallback;
}

function intValue(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function deepMerge(base, extra) {
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) return { ...(base || {}) };
  const out = { ...(base || {}) };
  for (const [key, value] of Object.entries(extra)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && out[key] && typeof out[key] === 'object' && !Array.isArray(out[key])) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function flattenSettingsObject(input, prefix = '') {
  const result = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return result;
  for (const [key, value] of Object.entries(input)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result.push(...flattenSettingsObject(value, fullKey));
    } else {
      result.push({ key: fullKey, value, valueType: settings.normalizeValueType('', value), description: '' });
    }
  }
  return result;
}

function setNestedValue(target, dottedKey, value) {
  const parts = clean(dottedKey).split('.').map(part => part.trim()).filter(Boolean);
  if (!parts.length) return target;
  let current = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object' || Array.isArray(current[part])) current[part] = {};
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
  return target;
}

function readJsonIfExists(filePath, fallback) {
  try {
    const fs = require('fs');
    if (!filePath || !fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.warn(`[birthday] config read failed: ${err.message}`);
    return fallback;
  }
}

function writeJsonIfMissing(filePath, data) {
  try {
    const fs = require('fs');
    const path = require('path');
    if (fs.existsSync(filePath)) return;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (err) {
    console.warn(`[birthday] default config write failed: ${err.message}`);
  }
}

function configPath() {
  return config.resolveFromConfig('birthday.json');
}

function applyDbSettings(baseConfig) {
  const merged = deepMerge({}, baseConfig || {});
  try {
    settings.seedDefaults(SETTINGS_TABLE, flattenSettingsObject(baseConfig || {}));
    const listed = settings.listSettings(SETTINGS_TABLE, { limit: 1000 });
    for (const row of listed.rows || []) setNestedValue(merged, row.key, row.value);
    merged.settingsTable = SETTINGS_TABLE;
    merged.settingsSource = 'database_with_json_fallback';
    return merged;
  } catch (err) {
    merged.settingsTable = SETTINGS_TABLE;
    merged.settingsSource = 'json_fallback';
    merged.settingsError = err.message || String(err);
    return merged;
  }
}

function loadRuntimeConfig() {
  const file = configPath();
  writeJsonIfMissing(file, DEFAULT_CONFIG);
  const fromFile = readJsonIfExists(file, {});
  runtimeConfig = applyDbSettings(deepMerge(DEFAULT_CONFIG, fromFile));
  runtimeConfig.configPath = file;
  state.configPath = file;
  return runtimeConfig;
}

function textEditorOptions() {
  return {
    categories: TEXT_CATEGORIES,
    categoryLabels: TEXT_CATEGORY_LABELS,
    defaultCategory: 'chat'
  };
}

function loadRuntimeMessages() {
  try {
    const result = texts.getModuleTexts(TEXTS_MODULE, DEFAULT_MESSAGES, { ...textEditorOptions(), seed: true });
    runtimeMessages = {
      ...result.texts,
      _textsTable: texts.DEFAULT_MODULE_TEXT_VARIANTS_TABLE,
      _legacyTextsTable: result.table,
      _textsSource: 'database_variants_with_defaults'
    };
  } catch (err) {
    runtimeMessages = {
      ...DEFAULT_MESSAGES,
      _textsSource: 'defaults_only',
      _textsError: err.message || String(err)
    };
  }
  return runtimeMessages;
}

function getConfig() {
  return runtimeConfig || loadRuntimeConfig();
}

function getMessages() {
  return runtimeMessages || loadRuntimeMessages();
}

function reloadRuntime() {
  runtimeConfig = null;
  runtimeMessages = null;
  return { config: getConfig(), messages: getMessages() };
}

function renderText(key, context = {}) {
  try {
    return texts.renderModuleText(TEXTS_MODULE, key, getMessages(), context, { ...textEditorOptions(), seed: false });
  } catch (_) {
    const fallback = getMessages()[key];
    const template = Array.isArray(fallback) ? fallback[0] : String(fallback || '');
    return texts.renderTemplate(template, context);
  }
}

function localParts(date = new Date()) {
  const cfg = getConfig();
  const formatter = new Intl.DateTimeFormat('de-DE', {
    timeZone: cfg.timezone || 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(date).reduce((out, part) => {
    if (part.type !== 'literal') out[part.type] = part.value;
    return out;
  }, {});
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    date: `${parts.year}-${parts.month}-${parts.day}`
  };
}

function formatBirthday(day, month, year = null) {
  const d = String(Number(day || 0)).padStart(2, '0');
  const m = String(Number(month || 0)).padStart(2, '0');
  const y = year ? `.${year}` : '';
  return `${d}.${m}${y}`;
}

function calculateAgeForDate(day, month, year, parts = localParts()) {
  const birthYear = Number(year || 0);
  if (!birthYear) return null;
  let age = Number(parts.year || 0) - birthYear;
  if (Number(parts.month || 0) < Number(month || 0) || (Number(parts.month || 0) === Number(month || 0) && Number(parts.day || 0) < Number(day || 0))) {
    age -= 1;
  }
  return Number.isFinite(age) && age >= 0 ? age : null;
}

function buildBirthdayContext(user = {}, extra = {}, parts = localParts()) {
  const day = Number(user.day ?? user.birthday_day ?? 0);
  const month = Number(user.month ?? user.birthday_month ?? 0);
  const storedYear = Number(user.year ?? user.birthday_year ?? 0);
  const hasYear = Boolean(storedYear);
  const age = hasYear ? calculateAgeForDate(day, month, storedYear, parts) : null;
  const hasAge = Number.isFinite(age);
  const birthdayDate = user.birthdayDate || formatBirthday(day, month, storedYear || null);

  return {
    ...extra,
    login: cleanLogin(extra.login || user.login || user.user_login || ''),
    username: cleanLogin(extra.username || extra.login || user.login || user.user_login || ''),
    displayName: clean(extra.displayName || user.displayName || user.user_display_name || user.login || user.user_login || ''),
    birthdayDate,
    day: String(day || ''),
    month: String(month || ''),
    year: hasYear ? String(storedYear) : '',
    hasYear: hasYear ? '1' : '0',
    age: hasAge ? String(age) : '',
    ageText: hasAge ? `Alles Gute zum ${age}. Geburtstag!` : '',
    localDate: parts.date || ''
  };
}

function textKeyWithAge(baseKey, context = {}) {
  return context.age ? `${baseKey}_with_age` : baseKey;
}


function publicShowState() {
  return {
    ok: true,
    module: MODULE_NAME,
    step: 'STEP_BIRTHDAY_004C',
    state: {
      ...showState,
      now: Date.now(),
      remainingMs: showState.phaseEndsAt ? Math.max(0, showState.phaseEndsAt - Date.now()) : 0,
      totalRemainingMs: showState.endsAt ? Math.max(0, showState.endsAt - Date.now()) : 0
    }
  };
}

function clearShowTimers() {
  for (const timer of showTimers) {
    try { clearTimeout(timer); } catch (_) {}
  }
  showTimers = [];
}

function scheduleShowTimer(fn, ms) {
  const timer = setTimeout(fn, Math.max(0, Number(ms || 0)));
  showTimers.push(timer);
  return timer;
}

function canStartParty(user = {}) {
  const cfg = getConfig();
  if (cfg.show?.enabled === false) return { ok: false, reason: 'show_disabled' };
  const allowed = Array.isArray(cfg.show?.allowedLogins) ? cfg.show.allowedLogins.map(cleanLogin).filter(Boolean) : [];
  if (!allowed.length) return { ok: true, reason: 'allowlist_empty' };
  return allowed.includes(cleanLogin(user.login)) ? { ok: true, reason: 'allowlist' } : { ok: false, reason: 'not_allowed' };
}

function normalizeAssetUrl(value) {
  const raw = clean(value);
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith('/') ? raw : `/${raw.replace(/^\/+/, '')}`;
}

function safeRelativeMediaFile(value) {
  return clean(value).replace(/\\/g, '/').replace(/^\/+/, '').replace(/\.\./g, '');
}

function mediaInfoForSoundFile(file, fallbackMs = 0) {
  const relative = safeRelativeMediaFile(file);
  if (!relative) return { ok: false, file: '', durationMs: Math.max(0, Number(fallbackMs || 0)), durationOk: false, error: 'file_missing' };
  try {
    const info = mediaHelper.getMediaInfo(relative, { baseDir: config.getSoundsDir(), allowedExtensions: mediaHelper.DEFAULT_ALLOWED_EXTENSIONS });
    return {
      ok: !!info.ok,
      file: relative,
      webPath: `/assets/sounds/${relative}`,
      durationMs: Number(info.durationMs || fallbackMs || 0),
      durationOk: !!info.durationOk,
      durationSource: info.durationOk ? 'ffprobe' : (fallbackMs ? 'fallback' : 'unknown'),
      fallbackUsed: !info.durationOk && Number(fallbackMs || 0) > 0,
      hasAudio: info.hasAudio !== false,
      hasVideo: !!info.hasVideo,
      width: Number(info.width || 0),
      height: Number(info.height || 0),
      error: info.error || ''
    };
  } catch (err) {
    return { ok: false, file: relative, webPath: `/assets/sounds/${relative}`, durationMs: Math.max(0, Number(fallbackMs || 0)), durationOk: false, durationSource: fallbackMs ? 'fallback' : 'unknown', fallbackUsed: Number(fallbackMs || 0) > 0, error: err.message || String(err) };
  }
}

function pickShowAsset(targetUser = {}) {
  const cfg = getConfig();
  const videoFile = safeRelativeMediaFile(cfg.show?.defaultVideoFile || '');
  const legacyVideoUrl = normalizeAssetUrl(cfg.show?.defaultVideoUrl || '');
  const songFile = safeRelativeMediaFile(targetUser.showSongFile || cfg.show?.defaultSongFile || '');
  const songVolume = Math.max(0, Math.min(100, Number(targetUser.showSongVolume || cfg.show?.defaultSongVolume || 85) || 85));
  const videoInfo = videoFile ? mediaInfoForSoundFile(videoFile, cfg.show?.defaultVideoDurationMs || 0) : null;
  const songInfo = songFile ? mediaInfoForSoundFile(songFile, cfg.show?.partyDurationMs || 22000) : null;
  const videoDurationMs = Math.max(0, Number(videoInfo?.durationMs || cfg.show?.defaultVideoDurationMs || 0) || 0);
  const songDurationMs = Math.max(3000, Number(songInfo?.durationMs || cfg.show?.partyDurationMs || 22000) || 22000);
  return {
    videoFile,
    videoUrl: videoInfo?.webPath || legacyVideoUrl,
    songFile,
    songVolume,
    videoDurationMs,
    songDurationMs,
    partyDurationMs: songDurationMs,
    videoInfo,
    songInfo,
    timing: {
      videoDurationMs,
      songDurationMs,
      totalDurationMs: videoDurationMs + songDurationMs,
      partyStartsAfterMs: videoDurationMs,
      partyDurationMs: songDurationMs,
      videoDurationOk: !!videoInfo?.durationOk,
      songDurationOk: !!songInfo?.durationOk,
      videoFallbackUsed: !!videoInfo?.fallbackUsed,
      songFallbackUsed: !!songInfo?.fallbackUsed,
      videoDurationSource: videoInfo?.durationSource || '',
      songDurationSource: songInfo?.durationSource || ''
    }
  };
}

function soundPlayBase(asset, targetContext = {}, extra = {}) {
  const cfg = getConfig();
  const forceExclusive = cfg.show?.forceExclusive !== false;
  return {
    category: cfg.show?.soundCategory || 'special',
    priority: Number(cfg.show?.soundPriority || 100),
    outputTarget: cfg.show?.soundOutputTarget || 'overlay',
    target: cfg.show?.soundTarget || 'stream',
    source: 'birthday_show',
    requestedBy: targetContext.startedBy || '',
    queueIfBusy: forceExclusive ? false : true,
    dropIfBusy: false,
    clearQueue: forceExclusive,
    force: forceExclusive,
    override: forceExclusive,
    canInterrupt: forceExclusive,
    canBeInterrupted: false,
    parallelAllowed: false,
    cooldownMs: 0,
    meta: { module: MODULE_NAME, showRequestId: showState.requestId, targetLogin: targetContext.targetLogin || '' },
    ...extra
  };
}

async function playBirthdayIntro(asset, targetContext = {}) {
  if (!asset || !asset.videoFile) return { ok: true, skipped: true, reason: 'missing_intro_video_file' };
  return internalRequest('POST', '/api/sound/play', soundPlayBase(asset, targetContext, {
    file: asset.videoFile,
    mediaType: 'video',
    label: `Birthday Intro ${targetContext.targetDisplayName || ''}`.trim(),
    volume: 100,
    durationMs: asset.videoDurationMs || 0
  }));
}

async function playBirthdaySong(asset, targetContext = {}) {
  if (!asset || !asset.songFile) return { ok: true, skipped: true, reason: 'missing_song_file' };
  const cfg = getConfig();
  return internalRequest('POST', '/api/sound/play', soundPlayBase(asset, targetContext, {
    file: asset.songFile,
    mediaType: 'audio',
    label: `Birthday Song ${targetContext.targetDisplayName || targetContext.displayName || ''}`.trim(),
    volume: Number(asset.songVolume || cfg.show?.defaultSongVolume || 85),
    durationMs: asset.songDurationMs || asset.partyDurationMs || 0
  }));
}

function finishBirthdayShow(reason = 'finished') {
  clearShowTimers();
  if (showState.active && reason !== 'finished') {
    internalRequest('POST', '/api/sound/stop', { clearQueue: true }).catch(() => {});
  }
  showState = {
    ...showState,
    active: false,
    phase: 'idle',
    phaseStartedAt: Date.now(),
    phaseEndsAt: 0,
    endsAt: 0,
    error: reason === 'finished' ? '' : reason
  };
  state.lastShowEndedAt = nowIso();
}

async function startBirthdayShow({ targetUser, targetLogin, targetDisplayName, startedByUser }) {
  const cfg = getConfig();
  clearShowTimers();
  const now = Date.now();
  const requestId = `birthday_${now}_${Math.random().toString(36).slice(2, 8)}`;
  const context = {
    targetLogin: cleanLogin(targetLogin || targetUser?.login || ''),
    targetDisplayName: clean(targetDisplayName || targetUser?.displayName || targetLogin || ''),
    startedBy: cleanLogin(startedByUser?.login || '')
  };
  const birthdayContext = targetUser ? buildBirthdayContext(targetUser, { login: context.targetLogin, displayName: context.targetDisplayName }) : { displayName: context.targetDisplayName, login: context.targetLogin };
  const asset = pickShowAsset(targetUser || {});
  const videoMs = asset.videoFile ? Math.max(1000, Number(asset.videoDurationMs || cfg.show?.defaultVideoDurationMs || 10000)) : 0;
  const partyMs = Math.max(3000, Number(asset.songDurationMs || asset.partyDurationMs || cfg.show?.partyDurationMs || 22000));
  const headline = birthdayContext.age ? `Happy ${birthdayContext.age}. Birthday!` : 'Happy Birthday!';
  const message = birthdayContext.age ? `Alles Gute zum ${birthdayContext.age}. Geburtstag, @${context.targetDisplayName}!` : `Alles Gute zum Geburtstag, @${context.targetDisplayName}!`;

  showState = {
    active: true,
    phase: videoMs > 0 ? 'video' : 'starting_song',
    targetLogin: context.targetLogin,
    targetDisplayName: context.targetDisplayName,
    headline,
    message,
    videoUrl: asset.videoUrl,
    videoFile: asset.videoFile,
    videoDurationMs: videoMs,
    songFile: asset.songFile,
    songVolume: asset.songVolume,
    songDurationMs: partyMs,
    videoQuietPhaseLabel: cfg.show?.videoQuietPhaseLabel || 'Intro läuft',
    startedAt: now,
    phaseStartedAt: now,
    phaseEndsAt: now + (videoMs > 0 ? videoMs : 1500),
    endsAt: now + videoMs + partyMs,
    requestId,
    startedBy: context.startedBy,
    playback: { intro: null, song: null, mode: 'sound_system_master' },
    error: ''
  };

  async function startSongAndEscalate() {
    const songStartAt = Date.now();
    showState = {
      ...showState,
      active: true,
      phase: 'starting_song',
      phaseStartedAt: songStartAt,
      phaseEndsAt: songStartAt + 1500,
      endsAt: songStartAt + partyMs
    };

    const songResult = await playBirthdaySong(asset, context);
    const phaseNow = Date.now();
    showState = {
      ...showState,
      active: true,
      phase: 'party',
      phaseStartedAt: phaseNow,
      phaseEndsAt: phaseNow + partyMs,
      endsAt: phaseNow + partyMs,
      playback: { ...(showState.playback || {}), song: songResult }
    };
    scheduleShowTimer(() => finishBirthdayShow('finished'), partyMs);
  }

  if (videoMs > 0) {
    playBirthdayIntro(asset, context)
      .then(result => { showState = { ...showState, playback: { ...(showState.playback || {}), intro: result } }; })
      .catch(err => { state.lastError = err.message || String(err); showState = { ...showState, error: `intro_play_failed:${state.lastError}` }; });
    scheduleShowTimer(() => { startSongAndEscalate().catch(err => { state.lastError = err.message || String(err); finishBirthdayShow('song_start_failed'); }); }, videoMs);
  } else {
    startSongAndEscalate().catch(err => { state.lastError = err.message || String(err); finishBirthdayShow('song_start_failed'); });
  }

  state.lastShowStartedAt = nowIso();
  return { ok: true, requestId, state: publicShowState().state, asset, config: { partyDurationMs: partyMs, videoDurationMs: videoMs, overlayFadeMs: Number(cfg.show?.overlayFadeMs || 700), mediaMaster: 'sound_system' } };
}

function parseBirthdayDate(input) {
  const raw = clean(input).replace(/\//g, '.').replace(/-/g, '.');
  const match = raw.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  let year = match[3] ? Number(match[3]) : null;
  if (year && year < 100) year += year >= 30 ? 1900 : 2000;
  if (month < 1 || month > 12) return null;
  const maxDay = new Date(year || 2024, month, 0).getDate();
  if (day < 1 || day > maxDay) return null;
  if (year && (year < 1900 || year > localParts().year)) return null;
  return { day, month, year };
}

function ensureSchema() {
  try {
    database.ensureSchema(MODULE_NAME, SCHEMA_VERSION, (_from, toVersion, db) => {
      if (toVersion === 1) {
        db.exec(`
          CREATE TABLE IF NOT EXISTS birthday_users (
            user_login TEXT PRIMARY KEY,
            user_display_name TEXT NOT NULL DEFAULT '',
            birthday_day INTEGER NOT NULL,
            birthday_month INTEGER NOT NULL,
            birthday_year INTEGER,
            year_visible INTEGER NOT NULL DEFAULT 0,
            active INTEGER NOT NULL DEFAULT 1,
            source TEXT NOT NULL DEFAULT 'chat_command',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_birthday_users_date
            ON birthday_users(birthday_month, birthday_day, active);

          CREATE TABLE IF NOT EXISTS birthday_greetings_log (
            id ${database.primaryKeyAutoIncrementSql()},
            user_login TEXT NOT NULL DEFAULT '',
            user_display_name TEXT NOT NULL DEFAULT '',
            greeting_date TEXT NOT NULL DEFAULT '',
            source TEXT NOT NULL DEFAULT 'auto_chat',
            chat_sent INTEGER NOT NULL DEFAULT 0,
            diary_sent INTEGER NOT NULL DEFAULT 0,
            message TEXT NOT NULL DEFAULT '',
            error TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL
          );

          CREATE UNIQUE INDEX IF NOT EXISTS idx_birthday_greetings_once
            ON birthday_greetings_log(user_login, greeting_date, source);
        `);
      }

      if (toVersion === 2) {
        db.exec(`
          ALTER TABLE birthday_users ADD COLUMN show_song_file TEXT NOT NULL DEFAULT '';
          ALTER TABLE birthday_users ADD COLUMN show_video_url TEXT NOT NULL DEFAULT '';
          ALTER TABLE birthday_users ADD COLUMN show_video_duration_ms INTEGER NOT NULL DEFAULT 0;
          ALTER TABLE birthday_users ADD COLUMN show_song_volume INTEGER NOT NULL DEFAULT 0;

          CREATE TABLE IF NOT EXISTS birthday_show_events (
            id ${database.primaryKeyAutoIncrementSql()},
            request_id TEXT NOT NULL DEFAULT '',
            target_login TEXT NOT NULL DEFAULT '',
            target_display_name TEXT NOT NULL DEFAULT '',
            started_by_login TEXT NOT NULL DEFAULT '',
            video_url TEXT NOT NULL DEFAULT '',
            song_file TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'started',
            error TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL
          );
          CREATE INDEX IF NOT EXISTS idx_birthday_show_events_created ON birthday_show_events(created_at);
        `);
      }

      if (toVersion === 3) {
        const columns = new Set(database.tableColumns('birthday_users'));
        if (!columns.has('show_song_duration_ms')) db.exec(`ALTER TABLE birthday_users ADD COLUMN show_song_duration_ms INTEGER NOT NULL DEFAULT 0;`);
      }
    });
    state.schemaOk = true;
    state.schemaError = '';
    return true;
  } catch (err) {
    state.schemaOk = false;
    state.schemaError = err.message || String(err);
    state.lastError = state.schemaError;
    return false;
  }
}

function mapBirthdayUser(row) {
  if (!row) return null;
  return {
    login: row.user_login || '',
    displayName: row.user_display_name || row.user_login || '',
    day: Number(row.birthday_day || 0),
    month: Number(row.birthday_month || 0),
    year: row.birthday_year == null ? null : Number(row.birthday_year || 0),
    yearVisible: Number(row.year_visible || 0) === 1,
    active: Number(row.active || 0) === 1,
    source: row.source || '',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
    birthdayDate: formatBirthday(row.birthday_day, row.birthday_month, row.year_visible ? row.birthday_year : null),
    showSongFile: row.show_song_file || '',
    showVideoUrl: row.show_video_url || '',
    showVideoDurationMs: Number(row.show_video_duration_ms || 0),
    showSongVolume: Number(row.show_song_volume || 0),
    showSongDurationMs: Number(row.show_song_duration_ms || 0)
  };
}

function getBirthdayUser(login) {
  const userLogin = cleanLogin(login);
  if (!userLogin) return null;
  return mapBirthdayUser(database.get('SELECT * FROM birthday_users WHERE user_login = :login', { login: userLogin }));
}

function upsertBirthdayUser({ login, displayName, day, month, year = null, source = 'chat_command' }) {
  const userLogin = cleanLogin(login);
  if (!userLogin) throw new Error('user_login_required');
  const cfg = getConfig();
  const existing = getBirthdayUser(userLogin);
  const now = nowIso();
  const allowYear = cfg.registration?.allowYear !== false;
  const storeYear = cfg.registration?.storeYear !== false;
  const safeYear = allowYear && storeYear && year ? Number(year) : null;
  const yearVisible = safeYear ? 1 : 0;
  database.run(`
    INSERT INTO birthday_users (
      user_login, user_display_name, birthday_day, birthday_month, birthday_year,
      year_visible, active, source, created_at, updated_at
    ) VALUES (
      :login, :displayName, :day, :month, :year,
      :yearVisible, 1, :source, :createdAt, :updatedAt
    )
    ON CONFLICT(user_login) DO UPDATE SET
      user_display_name = excluded.user_display_name,
      birthday_day = excluded.birthday_day,
      birthday_month = excluded.birthday_month,
      birthday_year = excluded.birthday_year,
      year_visible = excluded.year_visible,
      active = 1,
      source = excluded.source,
      updated_at = excluded.updated_at
  `, {
    login: userLogin,
    displayName: clean(displayName) || userLogin,
    day: Number(day),
    month: Number(month),
    year: safeYear,
    yearVisible,
    source,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  });
  return { user: getBirthdayUser(userLogin), created: !existing };
}

function deleteBirthdayUser(login) {
  const userLogin = cleanLogin(login);
  const existing = getBirthdayUser(userLogin);
  if (!existing) return { deleted: false, user: null };
  database.run('DELETE FROM birthday_users WHERE user_login = :login', { login: userLogin });
  return { deleted: true, user: existing };
}

function listBirthdaysFor(day, month) {
  return database.all(`
    SELECT * FROM birthday_users
    WHERE birthday_day = :day AND birthday_month = :month AND active = 1
    ORDER BY user_display_name COLLATE NOCASE ASC, user_login ASC
  `, { day: Number(day), month: Number(month) }).map(mapBirthdayUser);
}

function hasGreetingLog(login, greetingDate, source = 'auto_chat') {
  const row = database.get(`
    SELECT id FROM birthday_greetings_log
    WHERE user_login = :login AND greeting_date = :greetingDate AND source = :source
    LIMIT 1
  `, { login: cleanLogin(login), greetingDate, source });
  return !!row;
}

function insertGreetingLog({ login, displayName, greetingDate, source = 'auto_chat', chatSent = false, diarySent = false, message = '', error = '' }) {
  try {
    database.run(`
      INSERT OR IGNORE INTO birthday_greetings_log (
        user_login, user_display_name, greeting_date, source, chat_sent, diary_sent, message, error, created_at
      ) VALUES (
        :login, :displayName, :greetingDate, :source, :chatSent, :diarySent, :message, :error, :createdAt
      )
    `, {
      login: cleanLogin(login),
      displayName: clean(displayName),
      greetingDate,
      source,
      chatSent: chatSent ? 1 : 0,
      diarySent: diarySent ? 1 : 0,
      message: clean(message),
      error: clean(error),
      createdAt: nowIso()
    });
  } catch (err) {
    state.lastError = err.message || String(err);
  }
}

function internalRequest(method, pathName, payload = {}) {
  const body = JSON.stringify(payload || {});
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: Number(process.env.PORT || 8080) || 8080,
      path: pathName,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = {};
        try { parsed = data ? JSON.parse(data) : {}; } catch (_) { parsed = { raw: data }; }
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, statusCode: res.statusCode, data: parsed });
      });
    });
    req.on('error', err => resolve({ ok: false, error: err.message || String(err) }));
    req.write(body);
    req.end();
  });
}

async function isLiveByTagebuchState() {
  const result = await internalRequest('GET', '/api/tagebuch/status', {});
  if (!result.ok) return false;
  return !!result.data?.state?.activeStream;
}

async function writeDiaryEntry(user, context = {}) {
  const cfg = getConfig();
  if (cfg.diary?.enabled === false || cfg.automaticGreeting?.writeDiaryEntry === false) {
    return { ok: true, skipped: true, reason: 'diary_disabled' };
  }
  const message = renderText(textKeyWithAge('birthday_diary_entry', context), context);
  if (!message) return { ok: true, skipped: true, reason: 'empty_diary_message' };
  return internalRequest('POST', '/api/tagebuch/entry', {
    authorDisplay: cfg.diary?.systemUsername || 'Geburtstags-System',
    authorLogin: 'birthday',
    message,
    system: true,
    systemUsername: cfg.diary?.systemUsername || 'Geburtstags-System'
  });
}

async function sendChat(message, reason = 'birthday') {
  return chatOutput.sendChatMessage(message, {
    source: MODULE_NAME,
    reason,
    prefer: getConfig().chat?.prefer,
    maxLength: getConfig().chat?.maxLength,
    directSendEnabled: getConfig().chat?.directSendEnabled,
    fallbackToStreamerbot: getConfig().chat?.fallbackToStreamerbot
  });
}

async function maybeAutoGreetFromChat(parsed = {}) {
  try {
    const cfg = getConfig();
    if (cfg.enabled === false || cfg.automaticGreeting?.enabled === false) return { ok: true, skipped: true, reason: 'disabled' };
    if (!parsed || String(parsed.command || '').toUpperCase() !== 'PRIVMSG') return { ok: true, skipped: true, reason: 'not_privmsg' };

    const rawMessage = clean(parsed.params?.[1] || parsed.params?.[parsed.params.length - 1] || '');
    if (cfg.automaticGreeting?.skipCommandMessages !== false && rawMessage.startsWith('!')) {
      return { ok: true, skipped: true, reason: 'command_message' };
    }

    const login = cleanLogin(parsed.login || parsed.tags?.login || '');
    if (!login || login === cleanLogin(process.env.TWITCH_BOT_USERNAME || '')) return { ok: true, skipped: true, reason: 'bot_or_missing_user' };

    state.automaticChecks += 1;
    state.lastAutomaticCheckAt = nowIso();

    const today = localParts();
    const user = getBirthdayUser(login);
    if (!user || !user.active) return { ok: true, skipped: true, reason: 'not_registered' };
    if (user.day !== today.day || user.month !== today.month) return { ok: true, skipped: true, reason: 'not_today' };

    if (cfg.automaticGreeting?.onlyWhenLive !== false) {
      const live = await isLiveByTagebuchState();
      if (!live) return { ok: true, skipped: true, reason: 'stream_not_active' };
    }

    if (cfg.automaticGreeting?.oncePerLocalDate !== false && hasGreetingLog(login, today.date, 'auto_chat')) {
      return { ok: true, skipped: true, reason: 'already_greeted' };
    }

    const displayName = clean(parsed.displayName || parsed.tags?.['display-name'] || user.displayName || login);
    const context = buildBirthdayContext(user, { login, username: login, displayName }, today);
    const message = renderText(textKeyWithAge('birthday_greeting_chat', context), context);
    const chatResult = await sendChat(message, 'birthday_auto_greeting');
    const diaryResult = await writeDiaryEntry(user, context);
    const diarySent = !!(diaryResult?.ok && !diaryResult?.data?.skipped && !diaryResult?.skipped);

    insertGreetingLog({
      login,
      displayName,
      greetingDate: today.date,
      source: 'auto_chat',
      chatSent: !!chatResult?.ok,
      diarySent,
      message,
      error: chatResult?.ok ? '' : (chatResult?.error || 'chat_send_failed')
    });

    state.automaticGreetings += 1;
    state.lastGreetingAt = nowIso();
    return { ok: true, greeted: true, login, displayName, chatResult, diaryResult };
  } catch (err) {
    state.lastError = err.message || String(err);
    return { ok: false, error: state.lastError };
  }
}

function installChatActivityHook() {
  if (state.chatHookInstalled) return true;
  if (!commands || typeof commands.handleChatMessage !== 'function') return false;
  originalCommandHook = commands.handleChatMessage;
  commands.handleChatMessage = async function birthdayWrappedHandleChatMessage(parsed, source = {}) {
    const result = await originalCommandHook(parsed, source);
    maybeAutoGreetFromChat(parsed).catch(err => {
      state.lastError = err.message || String(err);
      console.warn('[birthday] auto greeting check failed:', state.lastError);
    });
    return result;
  };
  state.chatHookInstalled = true;
  return true;
}

function seedBirthdayCommand() {
  if (state.commandSeeded) return true;
  try {
    if (typeof commands.getStatus === 'function') commands.getStatus();
    const cfg = getConfig();
    const trigger = clean(cfg.command?.trigger || 'birthday').replace(/^[!./]+/, '').toLowerCase() || 'birthday';
    const existing = database.get('SELECT id FROM command_definitions WHERE trigger = :trigger', { trigger });
    if (!existing?.id) {
      const now = nowIso();
      database.run(`
        INSERT INTO command_definitions (
          trigger, aliases_json, module_key, action_key, target_method, target_url,
          enabled, permission_level, cooldown_global_ms, cooldown_user_ms, live_only,
          response_mode, config_json, created_at, updated_at
        ) VALUES (
          :trigger, :aliasesJson, 'birthday', 'command', 'POST', '/api/birthday/command',
          :enabled, :permissionLevel, :cooldownGlobalMs, :cooldownUserMs, 0,
          'module', :configJson, :createdAt, :updatedAt
        )
      `, {
        trigger,
        aliasesJson: JSON.stringify(Array.isArray(cfg.command?.aliases) ? cfg.command.aliases : ['bday']),
        enabled: cfg.command?.enabled === false ? 0 : 1,
        permissionLevel: clean(cfg.command?.permissionLevel || 'everyone').toLowerCase() || 'everyone',
        cooldownGlobalMs: Math.max(0, Number(cfg.command?.cooldownGlobalMs || 1000)),
        cooldownUserMs: Math.max(0, Number(cfg.command?.cooldownUserMs || 5000)),
        configJson: JSON.stringify({ actionType: 'module_command', moduleCommand: 'birthday', seededBy: 'STEP_BIRTHDAY_003' }),
        createdAt: now,
        updatedAt: now
      });
    }
    state.commandSeeded = true;
    return true;
  } catch (err) {
    state.lastError = err.message || String(err);
    return false;
  }
}

function commandContext(payload = {}) {
  const login = cleanLogin(payload.userLogin || payload.login || payload.user || '');
  const displayName = clean(payload.userDisplayName || payload.displayName || payload.userName || payload.user || login);
  return { login, displayName: displayName || login };
}

async function handleBirthdayCommand(payload = {}) {
  ensureSchema();
  const cfg = getConfig();
  state.commandExecutions += 1;
  state.lastCommandAt = nowIso();
  if (cfg.enabled === false || cfg.command?.enabled === false) {
    const user = commandContext(payload);
    const message = renderText('command_disabled', user);
    return { ok: false, command: 'birthday', error: 'disabled', message, chat: await sendChat(message, 'birthday_command_disabled') };
  }

  const args = Array.isArray(payload.args) ? payload.args.map(clean).filter(Boolean) : [];
  const sub = clean(args[0] || '').toLowerCase();
  const user = commandContext(payload);
  const baseContext = { ...user, username: user.login };

  if (!sub || ['help', 'hilfe'].includes(sub)) {
    const message = renderText('usage', baseContext);
    return { ok: true, command: 'birthday', action: 'usage', message, chat: await sendChat(message, 'birthday_usage') };
  }

  if (['set', 'eintragen', 'register'].includes(sub)) {
    if (cfg.registration?.enabled === false) {
      const message = renderText('registration_disabled', baseContext);
      return { ok: false, command: 'birthday', action: 'set', error: 'registration_disabled', message, chat: await sendChat(message, 'birthday_registration_disabled') };
    }
    const parsedDate = parseBirthdayDate(args[1] || '');
    if (!parsedDate) {
      const message = renderText('invalid_date', baseContext);
      return { ok: false, command: 'birthday', action: 'set', error: 'invalid_date', message, chat: await sendChat(message, 'birthday_invalid_date') };
    }
    const result = upsertBirthdayUser({ login: user.login, displayName: user.displayName, ...parsedDate });
    const context = buildBirthdayContext(result.user, baseContext);
    const baseKey = result.created ? 'register_success' : 'register_updated';
    const key = result.user.year ? `${baseKey}_with_year` : baseKey;
    const message = renderText(key, context);
    return { ok: true, command: 'birthday', action: 'set', created: result.created, user: result.user, message, chat: await sendChat(message, 'birthday_set') };
  }

  if (['show', 'anzeigen'].includes(sub)) {
    const saved = getBirthdayUser(user.login);
    const context = saved ? buildBirthdayContext(saved, baseContext) : baseContext;
    const key = saved ? (saved.year ? 'show_own_birthday_with_year' : 'show_own_birthday') : 'show_missing';
    const message = renderText(key, context);
    return { ok: true, command: 'birthday', action: 'show', user: saved, message, chat: await sendChat(message, 'birthday_show') };
  }

  if (['delete', 'del', 'remove', 'löschen', 'loeschen'].includes(sub)) {
    const result = deleteBirthdayUser(user.login);
    const key = result.deleted ? 'delete_success' : 'delete_missing';
    const message = renderText(key, baseContext);
    return { ok: true, command: 'birthday', action: 'delete', deleted: result.deleted, message, chat: await sendChat(message, 'birthday_delete') };
  }

  if (['party', 'showtime', 'show'].includes(sub) && args[1]) {
    const allowed = canStartParty(user);
    if (!allowed.ok) {
      const key = allowed.reason === 'show_disabled' ? 'party_disabled' : 'party_denied';
      const message = renderText(key, baseContext);
      return { ok: false, command: 'birthday', action: 'party', error: allowed.reason, message, chat: await sendChat(message, 'birthday_party_denied') };
    }
    const targetLogin = cleanLogin(args[1]);
    if (!targetLogin) {
      const message = renderText('party_missing_target', baseContext);
      return { ok: false, command: 'birthday', action: 'party', error: 'missing_target', message, chat: await sendChat(message, 'birthday_party_missing_target') };
    }
    const saved = getBirthdayUser(targetLogin);
    const targetDisplayName = saved?.displayName || args[1].replace(/^@/, '');
    const showResult = await startBirthdayShow({ targetUser: saved, targetLogin, targetDisplayName, startedByUser: user });
    try {
      database.run(`
        INSERT INTO birthday_show_events (
          request_id, target_login, target_display_name, started_by_login, video_url, song_file, status, error, created_at
        ) VALUES (
          :requestId, :targetLogin, :targetDisplayName, :startedByLogin, :videoUrl, :songFile, 'started', '', :createdAt
        )
      `, {
        requestId: showResult.requestId,
        targetLogin,
        targetDisplayName,
        startedByLogin: user.login,
        videoUrl: showResult.asset?.videoUrl || '',
        songFile: showResult.asset?.songFile || '',
        createdAt: nowIso()
      });
    } catch (err) {
      state.lastError = err.message || String(err);
    }
    const message = renderText('party_started', { ...baseContext, targetLogin, targetDisplayName });
    return { ok: true, command: 'birthday', action: 'party', targetLogin, targetDisplayName, show: showResult, message, chat: await sendChat(message, 'birthday_party_started') };
  }

  if (['party', 'showtime'].includes(sub)) {
    const message = renderText('party_missing_target', baseContext);
    return { ok: false, command: 'birthday', action: 'party', error: 'missing_target', message, chat: await sendChat(message, 'birthday_party_missing_target') };
  }

  if (['today', 'heute'].includes(sub)) {
    const today = localParts();
    const rows = listBirthdaysFor(today.day, today.month);
    const names = rows.map(row => {
      const context = buildBirthdayContext(row, {}, today);
      return context.age ? `@${row.displayName || row.login} (${context.age})` : `@${row.displayName || row.login}`;
    }).join(', ');
    const message = rows.length
      ? renderText('today_list', { ...baseContext, names, count: rows.length })
      : renderText('today_none', baseContext);
    return { ok: true, command: 'birthday', action: 'today', count: rows.length, rows, message, chat: await sendChat(message, 'birthday_today') };
  }

  const message = renderText('usage', baseContext);
  return { ok: false, command: 'birthday', action: 'unknown', error: 'unknown_subcommand', message, chat: await sendChat(message, 'birthday_unknown') };
}

function safePublicConfig(cfg = getConfig()) {
  return {
    enabled: cfg.enabled !== false,
    timezone: cfg.timezone || 'Europe/Berlin',
    command: {
      enabled: cfg.command?.enabled !== false,
      trigger: cfg.command?.trigger || 'birthday',
      aliases: Array.isArray(cfg.command?.aliases) ? cfg.command.aliases : [],
      permissionLevel: cfg.command?.permissionLevel || 'everyone',
      cooldownGlobalMs: Number(cfg.command?.cooldownGlobalMs || 0),
      cooldownUserMs: Number(cfg.command?.cooldownUserMs || 0)
    },
    registration: {
      enabled: cfg.registration?.enabled !== false,
      allowYear: cfg.registration?.allowYear !== false,
      storeYear: cfg.registration?.storeYear !== false
    },
    automaticGreeting: {
      enabled: cfg.automaticGreeting?.enabled !== false,
      skipCommandMessages: cfg.automaticGreeting?.skipCommandMessages !== false,
      oncePerLocalDate: cfg.automaticGreeting?.oncePerLocalDate !== false,
      onlyWhenLive: cfg.automaticGreeting?.onlyWhenLive !== false,
      writeDiaryEntry: cfg.automaticGreeting?.writeDiaryEntry !== false
    },
    diary: {
      enabled: cfg.diary?.enabled !== false,
      systemUsername: cfg.diary?.systemUsername || 'Geburtstags-System'
    },
    show: {
      enabled: cfg.show?.enabled !== false,
      allowedLogins: Array.isArray(cfg.show?.allowedLogins) ? cfg.show.allowedLogins : [],
      defaultVideoUrl: cfg.show?.defaultVideoUrl || '',
      defaultVideoFile: cfg.show?.defaultVideoFile || '',
      defaultVideoDurationMs: Number(cfg.show?.defaultVideoDurationMs || 0),
      defaultSongFile: cfg.show?.defaultSongFile || '',
      defaultSongVolume: Number(cfg.show?.defaultSongVolume || 0),
      partyDurationMs: Number(cfg.show?.partyDurationMs || 0),
      overlayFadeMs: Number(cfg.show?.overlayFadeMs || 0),
      soundCategory: cfg.show?.soundCategory || 'special',
      soundPriority: Number(cfg.show?.soundPriority || 75),
      soundOutputTarget: cfg.show?.soundOutputTarget || 'overlay',
      soundTarget: cfg.show?.soundTarget || 'stream',
      forceExclusive: cfg.show?.forceExclusive !== false,
      uploadDir: cfg.show?.uploadDir || 'birthday'
    },
    settingsTable: cfg.settingsTable || SETTINGS_TABLE,
    settingsSource: cfg.settingsSource || 'unknown',
    settingsError: cfg.settingsError || '',
    textsTable: getMessages()._textsTable || texts.DEFAULT_MODULE_TEXT_VARIANTS_TABLE,
    textsSource: getMessages()._textsSource || 'unknown'
  };
}

function listAdminSettings() {
  settings.seedDefaults(SETTINGS_TABLE, flattenSettingsObject(getConfig()));
  return settings.listSettings(SETTINGS_TABLE, { limit: 1000 });
}

function setAdminSettings(payload = {}) {
  const body = payload && typeof payload === 'object' ? payload : {};
  const updates = body.settings && typeof body.settings === 'object' && !Array.isArray(body.settings)
    ? body.settings
    : (body.key ? { [body.key]: body.value } : {});
  if (!Object.keys(updates).length) throw new Error('settings_payload_empty');

  const rows = [];
  for (const [key, value] of Object.entries(updates)) {
    rows.push(settings.setSetting(SETTINGS_TABLE, key, value));
  }
  reloadRuntime();
  return { ok: true, module: MODULE_NAME, table: SETTINGS_TABLE, updated: rows.length, rows, status: buildStatus() };
}

function listAdminTexts() {
  return texts.listModuleTextEditor(TEXTS_MODULE, getMessages(), { ...textEditorOptions(), seed: true });
}

function setAdminTexts(payload = {}) {
  const result = texts.handleModuleTextEditorPayload(TEXTS_MODULE, payload, textEditorOptions());
  reloadRuntime();
  return { ok: true, module: MODULE_NAME, ...result, status: buildStatus() };
}

function listBirthdayUsers(options = {}) {
  const limit = Math.max(1, Math.min(1000, Number(options.limit || 250) || 250));
  const search = clean(options.search || '').toLowerCase();
  const includeInactive = boolValue(options.includeInactive, true);
  const where = [];
  const params = { limit };

  if (!includeInactive) where.push('active = 1');
  if (search) {
    where.push('(lower(user_login) LIKE :search OR lower(user_display_name) LIKE :search)');
    params.search = `%${search}%`;
  }

  return database.all(`
    SELECT *
    FROM birthday_users
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY birthday_month ASC, birthday_day ASC, user_display_name COLLATE NOCASE ASC, user_login ASC
    LIMIT :limit
  `, params).map(row => {
    const user = mapBirthdayUser(row);
    const context = buildBirthdayContext(user || {});
    return {
      ...user,
      age: context.age ? Number(context.age) : null,
      birthdayDateWithYear: formatBirthday(user.day, user.month, user.year || null),
      birthdayDatePublic: formatBirthday(user.day, user.month, user.yearVisible ? user.year : null)
    };
  });
}

function setBirthdayUserAdmin(payload = {}) {
  const login = cleanLogin(payload.login || payload.userLogin || payload.username || '');
  const displayName = clean(payload.displayName || payload.userDisplayName || payload.name || login);
  let parsed = null;
  if (payload.birthdayDate || payload.date) parsed = parseBirthdayDate(payload.birthdayDate || payload.date);
  else parsed = {
    day: Number(payload.day || payload.birthdayDay || 0),
    month: Number(payload.month || payload.birthdayMonth || 0),
    year: payload.year || payload.birthdayYear ? Number(payload.year || payload.birthdayYear) : null
  };

  if (!login) throw new Error('user_login_required');
  if (!parsed || !parseBirthdayDate(formatBirthday(parsed.day, parsed.month, parsed.year || null))) throw new Error('invalid_birthday_date');

  const result = upsertBirthdayUser({
    login,
    displayName,
    day: parsed.day,
    month: parsed.month,
    year: parsed.year,
    source: 'dashboard'
  });

  const showSongFile = clean(payload.showSongFile || payload.songFile || '');
  const showVideoUrl = clean(payload.showVideoUrl || payload.videoUrl || '');
  const showVideoDurationMs = Math.max(0, Number(payload.showVideoDurationMs || payload.videoDurationMs || 0) || 0);
  const showSongVolume = Math.max(0, Math.min(100, Number(payload.showSongVolume || payload.songVolume || 0) || 0));
  const showSongDurationMs = Math.max(0, Number(payload.showSongDurationMs || payload.songDurationMs || 0) || 0);
  database.run(`
    UPDATE birthday_users
    SET show_song_file = :showSongFile,
        show_video_url = :showVideoUrl,
        show_video_duration_ms = :showVideoDurationMs,
        show_song_volume = :showSongVolume,
        show_song_duration_ms = :showSongDurationMs,
        updated_at = :updatedAt
    WHERE user_login = :login
  `, { login, showSongFile, showVideoUrl, showVideoDurationMs, showSongVolume, showSongDurationMs, updatedAt: nowIso() });

  if (payload.active === false || payload.active === 0 || payload.active === 'false') {
    database.run('UPDATE birthday_users SET active = 0, updated_at = :updatedAt WHERE user_login = :login', { login, updatedAt: nowIso() });
  }

  return { ok: true, module: MODULE_NAME, user: getBirthdayUser(login), created: result.created, users: listBirthdayUsers({ limit: 250 }) };
}

function deleteBirthdayUserAdmin(payload = {}) {
  const login = cleanLogin(payload.login || payload.userLogin || payload.username || '');
  if (!login) throw new Error('user_login_required');
  const soft = payload.soft !== false && payload.hard !== true;
  const existing = getBirthdayUser(login);
  if (!existing) return { ok: true, module: MODULE_NAME, deleted: false, user: null, users: listBirthdayUsers({ limit: 250 }) };
  if (soft) {
    database.run('UPDATE birthday_users SET active = 0, updated_at = :updatedAt WHERE user_login = :login', { login, updatedAt: nowIso() });
    return { ok: true, module: MODULE_NAME, deleted: true, soft: true, user: getBirthdayUser(login), users: listBirthdayUsers({ limit: 250 }) };
  }
  const result = deleteBirthdayUser(login);
  return { ok: true, module: MODULE_NAME, deleted: result.deleted, soft: false, user: result.user, users: listBirthdayUsers({ limit: 250 }) };
}

function sanitizeUploadBase(value) {
  const cleanBase = clean(value)
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9_.-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
  return cleanBase || 'birthday_asset';
}

function uniqueBirthdayAssetPath(dir, fileName) {
  const parsed = path.parse(fileName);
  let candidate = path.join(dir, fileName);
  let index = 2;
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${parsed.name}_${index}${parsed.ext}`);
    index += 1;
  }
  return candidate;
}

function assertUploadAllowed(kind, ext) {
  const cleanKind = clean(kind).toLowerCase();
  const cleanExt = clean(ext).toLowerCase();
  const audio = ['.mp3', '.wav', '.ogg', '.m4a'];
  const video = ['.webm', '.mp4', '.mov'];
  if (cleanKind === 'intro_video') return video.includes(cleanExt);
  if (cleanKind === 'default_song' || cleanKind === 'user_song') return audio.includes(cleanExt);
  return false;
}

function birthdayUploadFileName(kind, login, originalName) {
  const ext = path.extname(clean(originalName)).toLowerCase();
  const cleanKind = clean(kind).toLowerCase();
  if (!assertUploadAllowed(cleanKind, ext)) throw new Error(`upload_extension_not_allowed:${ext || 'missing'}`);
  if (cleanKind === 'intro_video') return `birthday_intro_video${ext}`;
  if (cleanKind === 'default_song') return `birthday_default_song${ext}`;
  if (cleanKind === 'user_song') {
    const userLogin = cleanLogin(login);
    if (!userLogin) throw new Error('user_login_required_for_user_song');
    return `birthday_song_${sanitizeUploadBase(userLogin)}${ext}`;
  }
  throw new Error('invalid_upload_kind');
}

function updateBirthdayShowUploadReference(kind, relativePath, mediaInfo, payload = {}) {
  const cleanKind = clean(kind).toLowerCase();
  const durationMs = Number(mediaInfo?.durationMs || 0);
  if (cleanKind === 'intro_video') {
    settings.setSetting(SETTINGS_TABLE, 'show.defaultVideoFile', relativePath, { valueType: 'string', description: 'Birthday globales Intro-Video über Sound-System.' });
    if (durationMs > 0) settings.setSetting(SETTINGS_TABLE, 'show.defaultVideoDurationMs', durationMs, { valueType: 'number', description: 'Automatisch erkannte Intro-Video-Dauer.' });
    reloadRuntime();
    return { target: 'default_intro_video', setting: 'show.defaultVideoFile' };
  }
  if (cleanKind === 'default_song') {
    settings.setSetting(SETTINGS_TABLE, 'show.defaultSongFile', relativePath, { valueType: 'string', description: 'Birthday Standardsong über Sound-System.' });
    if (durationMs > 0) settings.setSetting(SETTINGS_TABLE, 'show.partyDurationMs', durationMs, { valueType: 'number', description: 'Fallback-/Standardsong-Dauer für Birthday-Show.' });
    reloadRuntime();
    return { target: 'default_song', setting: 'show.defaultSongFile' };
  }
  if (cleanKind === 'user_song') {
    const login = cleanLogin(payload.login || payload.userLogin || payload.username || '');
    if (!login) throw new Error('user_login_required_for_user_song');
    database.run(`
      UPDATE birthday_users
      SET show_song_file = :file,
          show_song_duration_ms = :durationMs,
          updated_at = :updatedAt
      WHERE user_login = :login
    `, { login, file: relativePath, durationMs, updatedAt: nowIso() });
    return { target: 'user_song', login };
  }
  throw new Error('invalid_upload_kind');
}

function handleBirthdayAssetUpload(payload = {}, file = null) {
  if (!file || !file.buffer || !file.originalname) throw new Error('upload_file_missing');
  const cfg = getConfig();
  const kind = clean(payload.kind || payload.type || '');
  const uploadDirName = sanitizeUploadBase(cfg.show?.uploadDir || 'birthday');
  const targetDir = config.resolveFromSounds(uploadDirName);
  fs.mkdirSync(targetDir, { recursive: true });

  const fileName = birthdayUploadFileName(kind, payload.login || payload.userLogin || payload.username || '', file.originalname);
  const targetPath = uniqueBirthdayAssetPath(targetDir, fileName);
  fs.writeFileSync(targetPath, file.buffer);

  const relativePath = `${uploadDirName}/${path.basename(targetPath)}`.replace(/\\/g, '/');
  const mediaInfo = mediaInfoForSoundFile(relativePath, 0);
  const reference = updateBirthdayShowUploadReference(kind, relativePath, mediaInfo, payload);

  return {
    ok: true,
    module: MODULE_NAME,
    kind,
    fileName: path.basename(targetPath),
    relativePath,
    webPath: `/assets/sounds/${relativePath}`,
    mediaInfo,
    reference,
    user: reference.login ? getBirthdayUser(reference.login) : null,
    status: buildStatus()
  };
}

function formatMs(ms) {
  const value = Math.max(0, Number(ms || 0));
  const totalSeconds = Math.floor(value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenth = Math.floor((value % 1000) / 100);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenth}`;
}

function fileExistsForSound(relativeFile) {
  const relative = safeRelativeMediaFile(relativeFile || '');
  if (!relative) return { exists: false, absolutePath: '', relativePath: '', sizeBytes: 0 };
  const absolutePath = config.resolveFromSounds(relative);
  try {
    const stat = fs.existsSync(absolutePath) ? fs.statSync(absolutePath) : null;
    return { exists: !!stat && stat.isFile(), absolutePath, relativePath: relative, sizeBytes: stat && stat.isFile() ? Number(stat.size || 0) : 0 };
  } catch (_) {
    return { exists: false, absolutePath, relativePath: relative, sizeBytes: 0 };
  }
}

function loudnessStatusForFile(relativeFile) {
  const relative = safeRelativeMediaFile(relativeFile || '');
  if (!relative) return { known: false, status: '', scannedAt: '', inputI: null, inputTp: null, reason: 'file_missing' };
  try {
    const row = database.get('SELECT status, scanned_at, input_i, input_tp FROM sound_loudness_files WHERE relative_path = :relativePath LIMIT 1', { relativePath: relative });
    if (!row) return { known: false, status: '', scannedAt: '', inputI: null, inputTp: null, reason: 'not_scanned' };
    return {
      known: true,
      status: row.status || '',
      scannedAt: row.scanned_at || '',
      inputI: row.input_i == null ? null : Number(row.input_i),
      inputTp: row.input_tp == null ? null : Number(row.input_tp),
      reason: ''
    };
  } catch (err) {
    return { known: false, status: '', scannedAt: '', inputI: null, inputTp: null, reason: 'loudness_table_unavailable' };
  }
}

function buildAssetInfo(label, role, relativeFile, fallbackMs = 0, expectedKind = 'audio') {
  const relative = safeRelativeMediaFile(relativeFile || '');
  const fileCheck = fileExistsForSound(relative);
  const mediaInfo = relative ? mediaInfoForSoundFile(relative, fallbackMs) : { ok: false, file: '', webPath: '', durationMs: Number(fallbackMs || 0), durationOk: false, durationSource: fallbackMs ? 'fallback' : 'unknown', fallbackUsed: Number(fallbackMs || 0) > 0, hasAudio: false, hasVideo: false, error: 'file_missing' };
  const ext = path.extname(relative || '').toLowerCase();
  const soundSystemCanPlay = !!relative && fileCheck.exists && ['.mp3', '.wav', '.ogg', '.m4a', '.webm', '.mp4', '.mov'].includes(ext);
  const kindOk = expectedKind === 'video' ? !!mediaInfo.hasVideo : !!mediaInfo.hasAudio;
  return {
    label,
    role,
    expectedKind,
    relativePath: relative,
    webPath: relative ? `/assets/sounds/${relative}` : '',
    exists: fileCheck.exists,
    sizeBytes: fileCheck.sizeBytes,
    durationMs: Number(mediaInfo.durationMs || 0),
    durationLabel: formatMs(mediaInfo.durationMs || 0),
    durationOk: !!mediaInfo.durationOk,
    durationSource: mediaInfo.durationSource || (mediaInfo.durationOk ? 'ffprobe' : 'unknown'),
    fallbackUsed: !!mediaInfo.fallbackUsed,
    hasAudio: !!mediaInfo.hasAudio,
    hasVideo: !!mediaInfo.hasVideo,
    width: Number(mediaInfo.width || 0),
    height: Number(mediaInfo.height || 0),
    error: mediaInfo.error || '',
    soundSystem: {
      canPlay: soundSystemCanPlay,
      expectedKindOk: kindOk,
      relativeFile: relative,
      outputTarget: getConfig().show?.soundOutputTarget || 'overlay',
      target: getConfig().show?.soundTarget || 'stream'
    },
    loudness: loudnessStatusForFile(relative)
  };
}

function buildBirthdayShowAssets() {
  const cfg = getConfig();
  const users = listBirthdayUsers({ includeInactive: true, limit: 1000 });
  const intro = buildAssetInfo('Globales Intro-Video', 'intro_video', cfg.show?.defaultVideoFile || '', cfg.show?.defaultVideoDurationMs || 0, 'video');
  const defaultSong = buildAssetInfo('Standardsong', 'default_song', cfg.show?.defaultSongFile || '', cfg.show?.partyDurationMs || 0, 'audio');
  const userSongs = users
    .filter(user => !!user.showSongFile)
    .map(user => ({
      login: user.login,
      displayName: user.displayName || user.login,
      active: !!user.active,
      asset: buildAssetInfo(`User-Song ${user.displayName || user.login}`, 'user_song', user.showSongFile, user.showSongDurationMs || cfg.show?.partyDurationMs || 0, 'audio')
    }));
  const activeSong = defaultSong;
  const timingPreview = {
    introDurationMs: intro.durationMs,
    defaultSongDurationMs: activeSong.durationMs,
    defaultTotalDurationMs: Number(intro.durationMs || 0) + Number(activeSong.durationMs || 0),
    introDurationLabel: intro.durationLabel,
    defaultSongDurationLabel: activeSong.durationLabel,
    defaultTotalDurationLabel: formatMs(Number(intro.durationMs || 0) + Number(activeSong.durationMs || 0)),
    partyStartsAfterMs: intro.durationMs,
    partyStartsAfterLabel: intro.durationLabel,
    warnings: []
  };
  if (!intro.durationOk) timingPreview.warnings.push('intro_duration_fallback_or_missing');
  if (!defaultSong.durationOk) timingPreview.warnings.push('default_song_duration_fallback_or_missing');
  if (!intro.exists) timingPreview.warnings.push('intro_file_missing');
  if (!defaultSong.exists) timingPreview.warnings.push('default_song_file_missing');
  return {
    ok: true,
    module: MODULE_NAME,
    step: 'STEP_BIRTHDAY_004C',
    assetsDir: config.resolveFromSounds(cfg.show?.uploadDir || 'birthday'),
    intro,
    defaultSong,
    userSongs,
    timingPreview,
    notes: [
      'Sound-System bekommt beim Start explizite durationMs-Werte.',
      'Birthday-Overlay eskaliert erst bei phase=party, also nach Intro-Dauer und nach Song-Start.',
      'SoundPegel/Loudness ist nur bekannt, wenn sound_loudness_files bereits einen Scan-Eintrag enthält.'
    ]
  };
}

function buildStatus() {
  const today = localParts();
  const todayRows = state.schemaOk ? listBirthdaysFor(today.day, today.month) : [];
  return {
    ok: true,
    module: MODULE_NAME,
    version: 1,
    step: 'STEP_BIRTHDAY_004C',
    initialized: state.initialized,
    loadedAt: state.loadedAt,
    schemaOk: state.schemaOk,
    schemaError: state.schemaError,
    commandSeeded: state.commandSeeded,
    chatHookInstalled: state.chatHookInstalled,
    configPath: state.configPath,
    databasePath: typeof database.getDbPath === 'function' ? database.getDbPath() : null,
    config: safePublicConfig(),
    today: {
      localDate: today.date,
      day: today.day,
      month: today.month,
      count: todayRows.length,
      rows: todayRows
    },
    stats: {
      automaticChecks: state.automaticChecks,
      automaticGreetings: state.automaticGreetings,
      commandExecutions: state.commandExecutions,
      lastAutomaticCheckAt: state.lastAutomaticCheckAt,
      lastGreetingAt: state.lastGreetingAt,
      lastCommandAt: state.lastCommandAt,
      lastShowStartedAt: state.lastShowStartedAt,
      lastShowEndedAt: state.lastShowEndedAt,
      lastError: state.lastError
    },
    show: publicShowState().state,
    showAssets: buildBirthdayShowAssets(),
    routes: [
      { method: 'GET', path: `${API_PREFIX}/status` },
      { method: 'POST', path: `${API_PREFIX}/command` },
      { method: 'GET', path: `${API_PREFIX}/today` },
      { method: 'GET', path: `${API_PREFIX}/show/state` },
      { method: 'POST', path: `${API_PREFIX}/show/stop` },
      { method: 'POST', path: `${API_PREFIX}/admin/show/upload` },
      { method: 'GET', path: `${API_PREFIX}/admin/show/assets` },
      { method: 'POST', path: `${API_PREFIX}/admin/show/recheck` },
      { method: 'GET', path: `${API_PREFIX}/admin/users` },
      { method: 'POST', path: `${API_PREFIX}/admin/user` },
      { method: 'POST', path: `${API_PREFIX}/admin/user/delete` },
      { method: 'GET/POST', path: `${API_PREFIX}/admin/settings` },
      { method: 'GET/POST', path: `${API_PREFIX}/admin/texts` },
      { method: 'POST', path: `${API_PREFIX}/reload` }
    ]
  };
}

function registerRoutes(ctx) {
  const app = ctx.app;

  routes.registerGet(app, [`${API_PREFIX}/status`], (req, res) => {
    try { return res.json(buildStatus()); }
    catch (err) { return res.status(500).json({ ok: false, error: err.message || String(err) }); }
  });

  routes.registerGet(app, [`${API_PREFIX}/today`], (req, res) => {
    try {
      const today = localParts();
      return res.json({ ok: true, module: MODULE_NAME, localDate: today.date, rows: listBirthdaysFor(today.day, today.month) });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message || String(err) });
    }
  });


  routes.registerGet(app, [`${API_PREFIX}/show/state`], (req, res) => {
    try { return res.json(publicShowState()); }
    catch (err) { return res.status(500).json({ ok: false, error: err.message || String(err) }); }
  });

  routes.registerPost(app, [`${API_PREFIX}/show/stop`], (req, res) => {
    try {
      finishBirthdayShow('manual_stop');
      return res.json(publicShowState());
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message || String(err) });
    }
  });

  // STEP_BIRTHDAY_004C
  // helper_routes.registerPost expects the final handler first and optional middlewares after it.
  // Multer must run before this handler, otherwise req.file stays empty and upload_file_missing is thrown.
  routes.registerPost(app, [`${API_PREFIX}/admin/show/upload`], (req, res) => {
    try { return res.json(handleBirthdayAssetUpload(req.body || {}, req.file || null)); }
    catch (err) { return res.status(400).json({ ok: false, error: err.message || String(err) }); }
  }, upload.single('file'));


  routes.registerGet(app, [`${API_PREFIX}/admin/show/assets`], (req, res) => {
    try { return res.json(buildBirthdayShowAssets()); }
    catch (err) { return res.status(500).json({ ok: false, error: err.message || String(err) }); }
  });

  routes.registerPost(app, [`${API_PREFIX}/admin/show/recheck`], (req, res) => {
    try { return res.json(buildBirthdayShowAssets()); }
    catch (err) { return res.status(500).json({ ok: false, error: err.message || String(err) }); }
  });

  routes.registerGet(app, [`${API_PREFIX}/admin/users`], (req, res) => {
    try {
      return res.json({ ok: true, module: MODULE_NAME, users: listBirthdayUsers(req.query || {}), status: buildStatus() });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message || String(err) });
    }
  });

  routes.registerPost(app, [`${API_PREFIX}/admin/user`], (req, res) => {
    try {
      return res.json(setBirthdayUserAdmin(req.body || req.query || {}));
    } catch (err) {
      return res.status(400).json({ ok: false, error: err.message || String(err) });
    }
  });

  routes.registerPost(app, [`${API_PREFIX}/admin/user/delete`], (req, res) => {
    try {
      return res.json(deleteBirthdayUserAdmin(req.body || req.query || {}));
    } catch (err) {
      return res.status(400).json({ ok: false, error: err.message || String(err) });
    }
  });

  routes.registerGet(app, [`${API_PREFIX}/admin/settings`], (req, res) => {
    try {
      return res.json({ ok: true, module: MODULE_NAME, settings: listAdminSettings(), status: buildStatus() });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message || String(err) });
    }
  });

  routes.registerPost(app, [`${API_PREFIX}/admin/settings`], (req, res) => {
    try {
      return res.json(setAdminSettings(req.body || req.query || {}));
    } catch (err) {
      return res.status(400).json({ ok: false, error: err.message || String(err) });
    }
  });

  routes.registerGet(app, [`${API_PREFIX}/admin/texts`], (req, res) => {
    try {
      return res.json({ ok: true, module: MODULE_NAME, texts: listAdminTexts(), status: buildStatus() });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message || String(err) });
    }
  });

  routes.registerPost(app, [`${API_PREFIX}/admin/texts`], (req, res) => {
    try {
      return res.json(setAdminTexts(req.body || req.query || {}));
    } catch (err) {
      return res.status(400).json({ ok: false, error: err.message || String(err) });
    }
  });

  routes.registerPost(app, [`${API_PREFIX}/command`], async (req, res) => {
    try {
      const result = await handleBirthdayCommand(req.body || req.query || {});
      return res.status(result.ok ? 200 : 400).json(result);
    } catch (err) {
      state.lastError = err.message || String(err);
      return res.status(500).json({ ok: false, module: MODULE_NAME, error: state.lastError });
    }
  });

  routes.registerPost(app, [`${API_PREFIX}/reload`], (req, res) => {
    try {
      reloadRuntime();
      seedBirthdayCommand();
      return res.json({ ok: true, reloaded: true, status: buildStatus() });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message || String(err) });
    }
  });
}

function init(ctx) {
  state.initialized = true;
  state.loadedAt = nowIso();
  database.ensureReady(ctx);
  ensureSchema();
  reloadRuntime();
  seedBirthdayCommand();
  installChatActivityHook();
  registerRoutes(ctx);
  console.log('[birthday] routes active: /api/birthday/*');
  return { name: MODULE_NAME, step: 'STEP_BIRTHDAY_004C' };
}

module.exports = {
  init,
  getStatus: buildStatus,
  handleCommand: handleBirthdayCommand,
  maybeAutoGreetFromChat,
  getShowState: publicShowState
};
