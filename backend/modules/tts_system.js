/**
 * ForrestCGN TTS System V2
 * - One chat command: !tts <text|subcommand>
 * - Google de-DE-Wavenet-H for Broadcaster/Mods/VIPs
 * - Piper/Thorsten for Subscribers
 * - Config/messages/state/bans outside htdocs: D:\Streaming\stramAssets\config\
 * - OBS browser overlay playback through WebSocket
 */

const fs = require("fs");
const path = require("path");
const core = require("./helpers/helper_core");
const crypto = require("crypto");
const { spawn } = require("child_process");

let textToSpeech = null;
try {
  textToSpeech = require("@google-cloud/text-to-speech");
} catch (_) {
  textToSpeech = null;
}

function init(ctx) {
  const { app, broadcastWS } = ctx;

  const MODULE_DIR = __dirname;
  const SCRIPTS_DIR = path.resolve(MODULE_DIR, "..");
  const HTDOCS_DIR = path.resolve(SCRIPTS_DIR, "..");
  const ROOT_DIR = path.resolve(HTDOCS_DIR, "..");
  const CONFIG_DIR = path.join(ROOT_DIR, "config");
  const GENERATED_DIR = path.join(HTDOCS_DIR, "assets", "tts", "generated");

  const CONFIG_FILE = path.join(CONFIG_DIR, "tts_config.json");
  const MESSAGES_FILE = path.join(CONFIG_DIR, "tts_messages.json");
  const BANS_FILE = path.join(CONFIG_DIR, "tts_bans.json");
  const STATE_FILE = path.join(CONFIG_DIR, "tts_state.json");

  const RESERVED_COMMANDS = new Set([
    "on", "off", "status", "debug", "stop", "clear", "mute", "unmute", "ban", "unban", "list", "help", "reload"
  ]);

  const DEFAULT_CONFIG = {
    enabled: true,
    command: "!tts",
    defaultVoice: "google_wavenet_h",
    fallbackVoice: "piper_thorsten",
    rejectWhenFallbackUnavailable: true,
    limits: {
      googleDailyCharacterLimit: 15000,
      googleMonthlyCharacterLimit: 300000
    },
    queue: {
      maxSize: 8,
      gapAfterMs: 350,
      deleteGeneratedAfterHours: 6
    },
    text: {
      removeUrls: true,
      blockEmpty: true,
      maxRepeatedChar: 5
    },
    voices: {
      google_wavenet_h: {
        enabled: true,
        engine: "google",
        label: "Google Deutsch Wavenet H",
        keyFile: path.join(ROOT_DIR, "config", "google_tts_service_account.json"),
        languageCode: "de-DE",
        name: "de-DE-Wavenet-H",
        audioEncoding: "MP3",
        speakingRate: 1.0,
        pitch: 0.0
      },
      piper_thorsten: {
        enabled: true,
        engine: "piper",
        label: "Piper Thorsten High",
        exe: path.join(ROOT_DIR, "tools", "piper", "piper.exe"),
        model: path.join(ROOT_DIR, "tools", "piper", "voice", "de_DE-thorsten-high.onnx"),
        config: path.join(ROOT_DIR, "tools", "piper", "voice", "de_DE-thorsten-high.onnx.json"),
        audioEncoding: "WAV"
      }
    },
    roles: {
      broadcaster: { enabled: true, voice: "google_wavenet_h", maxLength: 5000, userCooldownSeconds: 0, globalCooldownSeconds: 0, priority: 100 },
      moderator: { enabled: true, voice: "google_wavenet_h", maxLength: 400, userCooldownSeconds: 30, globalCooldownSeconds: 0, priority: 90 },
      vip: { enabled: true, voice: "google_wavenet_h", maxLength: 320, userCooldownSeconds: 60, globalCooldownSeconds: 10, priority: 70 },
      subscriber: { enabled: true, voice: "piper_thorsten", maxLength: 260, userCooldownSeconds: 120, globalCooldownSeconds: 15, priority: 40 },
      viewer: { enabled: false, voice: "piper_thorsten", maxLength: 120, userCooldownSeconds: 900, globalCooldownSeconds: 120, priority: 0 }
    },
    permissions: {
      moderatorCommands: ["on", "off", "status", "stop", "clear", "mute", "unmute", "list", "help", "reload"],
      broadcasterOnlyCommands: ["ban", "unban"],
      banManagers: []
    }
  };

  const DEFAULT_MESSAGES = {
    ttsQueued: "🎙️ Durchsage aufgenommen. Die Heimleitung reicht sie gleich weiter.",
    ttsDisabled: "🔇 Die Sprechanlage ist aktuell abgeschaltet.",
    notAllowed: "🚫 Diese Sprechanlage ist nur für Mods, VIPs und Subs freigegeben.",
    cooldown: "⏳ Langsam, junger Hüpfer. Du darfst in {seconds} Sekunden wieder an die Sprechanlage.",
    tooLong: "📏 Die Durchsage ist zu lang. Maximal erlaubt: {maxLength} Zeichen.",
    queueFull: "🧓 Die Sprechanlage ist gerade überfüllt. Bitte später nochmal versuchen.",
    systemOn: "✅ Die Heimleitung hat die Sprechanlage wieder eingeschaltet.",
    systemOff: "🔇 Die Heimleitung hat die Sprechanlage vorübergehend abgeschaltet.",
    status: "📋 Heimleitungsbericht: Sprechanlage {enabledText}, Warteschlange {queueCount}/{queueMax}, heute Google {dailyChars}/{dailyLimit} Zeichen, Monat {monthlyChars}/{monthlyLimit} Zeichen.",
    stop: "🛑 Die Heimleitung unterbricht die aktuelle Durchsage.",
    clear: "🧹 Die Heimleitung hat die Warteschlange der Sprechanlage geleert.",
    muteSuccess: "🔇 Die Heimleitung hat @{user} für diesen Stream vom Mikrofon entfernt.",
    unmuteSuccess: "🔊 @{user} darf in diesem Stream wieder an die Sprechanlage.",
    banSuccess: "🚫 Die Heimleitung hat @{user} dauerhaft aus dem TTS-Aufenthaltsraum begleitet.",
    unbanSuccess: "✅ Die Heimleitung hat @{user} wieder auf die TTS-Liste gesetzt.",
    alreadyMuted: "🔇 @{user} sitzt bereits in der TTS-Stillecke.",
    alreadyBanned: "🚫 @{user} hat bereits dauerhaftes TTS-Hausverbot.",
    notMuted: "🔊 @{user} war gar nicht in der TTS-Stillecke.",
    notBanned: "✅ @{user} hatte kein dauerhaftes TTS-Hausverbot.",
    listEmpty: "📋 Heimleitungsbericht: Keine aktiven TTS-Mutes und keine dauerhaften TTS-Bans.",
    list: "📋 Heimleitungsbericht: Mikrofon-Pause: {mutes} | Hausverbot: {bans}",
    missingText: "🧓 Die Heimleitung hat nichts gehört. Nutzung: !tts dein Text",
    missingUser: "📋 Die Heimleitung braucht einen Namen. Beispiel: !tts mute @User",
    unknownCommand: "❓ Die Heimleitung kennt diesen TTS-Befehl nicht. Versuch: !tts help",
    noPermission: "🚫 Dafür fehlt dir der Schlüssel zur Heimleitungszentrale.",
    cloudUnavailable: "❌ Cloud-TTS ist gerade nicht verfügbar und der Fallback ist nicht bereit.",
    mutedUser: "🔇 Du bist für diesen Stream von der Sprechanlage abgemeldet.",
    bannedUser: "🚫 Du hast dauerhaftes TTS-Hausverbot.",
    help: "📋 Heimleitungszettel: !tts <Text> | Mods: on/off/status/stop/clear/list/mute/unmute | Chefetage: ban/unban"
  };

  const DEFAULT_STATE = {
    enabled: true,
    usage: {
      date: "",
      month: "",
      googleDailyCharacters: 0,
      googleMonthlyCharacters: 0,
      piperDailyCharacters: 0,
      piperMonthlyCharacters: 0,
      totalRequestsToday: 0,
      totalRequestsMonth: 0
    },
    cooldowns: { global: {}, users: {} },
    sessionMutes: {}
  };

  const DEFAULT_BANS = { users: {} };

  core.ensureDir(CONFIG_DIR);
  core.ensureDir(GENERATED_DIR);

  let config = loadJson(CONFIG_FILE, DEFAULT_CONFIG);
  let messages = loadJson(MESSAGES_FILE, DEFAULT_MESSAGES);
  let state = loadJson(STATE_FILE, DEFAULT_STATE);
  let bans = loadJson(BANS_FILE, DEFAULT_BANS);
  let googleClients = {};
  let current = null;
  let playing = false;
  const queue = [];

  normalizeUsageDate();
  saveState();
  cleanupGeneratedFiles();

  function structuredCloneSafe(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function deepMerge(base, incoming) {
    if (!incoming || typeof incoming !== "object") return base;
    for (const [key, value] of Object.entries(incoming)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        base[key] = deepMerge(base[key] || {}, value);
      } else {
        base[key] = value;
      }
    }
    return base;
  }

  function loadJson(file, fallback) {
    try {
      if (!core.fileExists(file)) {
        core.writeJson(file, fallback);
        return structuredCloneSafe(fallback);
      }
      const parsed = core.readJson(file, null);
      if (!parsed || typeof parsed !== "object") throw new Error("invalid_json");
      return deepMerge(structuredCloneSafe(fallback), parsed);
    } catch (err) {
      console.error(`[TTS] Could not load ${file}: ${err.message}`);
      return structuredCloneSafe(fallback);
    }
  }

  function saveJson(file, data) {
    try {
      core.writeJson(file, data);
      return true;
    } catch (err) {
      console.error(`[TTS] Could not save ${file}: ${err.message}`);
      return false;
    }
  }

  function saveState() { saveJson(STATE_FILE, state); }
  function saveBans() { saveJson(BANS_FILE, bans); }

  function reloadAllConfig() {
    config = loadJson(CONFIG_FILE, DEFAULT_CONFIG);
    messages = loadJson(MESSAGES_FILE, DEFAULT_MESSAGES);
    bans = loadJson(BANS_FILE, DEFAULT_BANS);
    googleClients = {};
    normalizeUsageDate();
    saveState();
    return true;
  }

  function msg(key, vars = {}) {
    const template = String(messages[key] || DEFAULT_MESSAGES[key] || key);
    return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, name) => {
      return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`;
    });
  }

  function todayKey() { return core.nowIso().slice(0, 10); }
  function monthKey() { return core.nowIso().slice(0, 7); }

  function normalizeUsageDate() {
    const today = todayKey();
    const month = monthKey();
    if (!state.usage) state.usage = structuredCloneSafe(DEFAULT_STATE.usage);
    if (state.usage.date !== today) {
      state.usage.date = today;
      state.usage.googleDailyCharacters = 0;
      state.usage.piperDailyCharacters = 0;
      state.usage.totalRequestsToday = 0;
    }
    if (state.usage.month !== month) {
      state.usage.month = month;
      state.usage.googleMonthlyCharacters = 0;
      state.usage.piperMonthlyCharacters = 0;
      state.usage.totalRequestsMonth = 0;
    }
    if (!state.cooldowns) state.cooldowns = { global: {}, users: {} };
    if (!state.cooldowns.global) state.cooldowns.global = {};
    if (!state.cooldowns.users) state.cooldowns.users = {};
    if (!state.sessionMutes) state.sessionMutes = {};
    if (!bans.users) bans.users = {};
  }

  function getRequestData(req) {
    return Object.assign({}, req.query || {}, req.body || {});
  }

  function toBool(value) {
    return core.boolParam(value, false);
  }

  function resolveRole(data) {
    const explicit = String(data.role || "").toLowerCase().trim();
    if (["broadcaster", "moderator", "vip", "subscriber", "viewer"].includes(explicit)) return explicit;

    if (toBool(data.isBroadcaster) || toBool(data.broadcaster)) return "broadcaster";
    if (toBool(data.isModerator) || toBool(data.moderator) || toBool(data.isMod) || toBool(data.mod)) return "moderator";
    if (toBool(data.isVip) || toBool(data.vip) || toBool(data.isVIP)) return "vip";
    if (toBool(data.isSubscriber) || toBool(data.subscriber) || toBool(data.isSub) || toBool(data.sub)) return "subscriber";
    return "viewer";
  }

  function sanitizeText(raw) {
    let text = String(raw || "");
    text = text.replace(/[\r\n\t]+/g, " ");
    text = text.replace(/<[^>]*>/g, " ");
    if (config.text?.removeUrls) {
      text = text.replace(/https?:\/\/\S+/gi, " Link entfernt ");
      text = text.replace(/www\.\S+/gi, " Link entfernt ");
    }
    const maxRep = Number(config.text?.maxRepeatedChar || 0);
    if (maxRep > 1) {
      const re = new RegExp(`(.)\\1{${maxRep},}`, "gi");
      text = text.replace(re, (m, ch) => ch.repeat(maxRep));
    }
    return text.replace(/\s{2,}/g, " ").trim();
  }

  function makeId() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function roleConfig(role) {
    return config.roles?.[role] || config.roles?.viewer || DEFAULT_CONFIG.roles.viewer;
  }

  function voiceConfig(voiceId) {
    const id = String(voiceId || config.defaultVoice || "google_wavenet_h");
    return { id, cfg: config.voices?.[id] || null };
  }

  function userKey(data) {
    return normalizeLogin(data.login || data.userName || data.user || data.displayName || "unknown") || "unknown";
  }

  function displayName(data) {
    return String(data.displayName || data.user || data.userName || data.login || "Unbekannt").replace(/^@+/, "").trim();
  }

  function normalizeLogin(value) {
    return String(value || "").replace(/^@+/, "").trim().toLowerCase();
  }

  function parseRawInput(data) {
    let raw = String(data.raw || data.rawInput || data.input || data.message || data.text || "").trim();
    const command = String(config.command || "!tts").toLowerCase();
    if (raw.toLowerCase().startsWith(command + " ")) raw = raw.slice(command.length).trim();
    if (raw.toLowerCase() === command) raw = "";
    return raw;
  }

  function parseCommand(raw) {
    const cleaned = String(raw || "").trim();
    if (!cleaned) return { kind: "empty", command: "", rest: "" };
    const parts = cleaned.split(/\s+/);
    const first = String(parts[0] || "").toLowerCase();
    if (RESERVED_COMMANDS.has(first)) {
      return { kind: "admin", command: first, rest: cleaned.slice(parts[0].length).trim() };
    }
    return { kind: "say", command: "say", rest: cleaned };
  }

  function canRunSubcommand(role, command, actorLogin) {
    if (role === "broadcaster") return true;

    const login = normalizeLogin(actorLogin || "");
    const banManagers = Array.isArray(config.permissions?.banManagers)
      ? config.permissions.banManagers.map(normalizeLogin).filter(Boolean)
      : [];

    if (["ban", "unban"].includes(command) && banManagers.includes(login)) {
      return true;
    }

    if (config.permissions?.broadcasterOnlyCommands?.includes(command)) return false;
    if (role === "moderator" && config.permissions?.moderatorCommands?.includes(command)) return true;
    return false;
  }

  function checkCooldown(role, user) {
    const rc = roleConfig(role);
    const now = Date.now();
    const globalCd = Number(rc.globalCooldownSeconds || 0) * 1000;
    const userCd = Number(rc.userCooldownSeconds || 0) * 1000;

    if (globalCd > 0) {
      const lastGlobal = Number(state.cooldowns.global[role] || 0);
      const diff = now - lastGlobal;
      if (diff < globalCd) {
        return { ok: false, reason: "global_cooldown", waitSeconds: Math.ceil((globalCd - diff) / 1000) };
      }
    }

    if (userCd > 0) {
      const key = `${role}:${user}`;
      const lastUser = Number(state.cooldowns.users[key] || 0);
      const diff = now - lastUser;
      if (diff < userCd) {
        return { ok: false, reason: "user_cooldown", waitSeconds: Math.ceil((userCd - diff) / 1000) };
      }
    }

    return { ok: true };
  }

  function touchCooldown(role, user) {
    const now = Date.now();
    state.cooldowns.global[role] = now;
    state.cooldowns.users[`${role}:${user}`] = now;
    saveState();
  }

  function isMuted(user) {
    normalizeUsageDate();
    return Boolean(state.sessionMutes?.[user]);
  }

  function isBanned(user) {
    normalizeUsageDate();
    return Boolean(bans.users?.[user]);
  }

  function canUseGoogle(chars) {
    normalizeUsageDate();
    const dailyLimit = Number(config.limits?.googleDailyCharacterLimit || 0);
    const monthlyLimit = Number(config.limits?.googleMonthlyCharacterLimit || 0);
    if (dailyLimit > 0 && (state.usage.googleDailyCharacters + chars) > dailyLimit) {
      return { ok: false, reason: "daily_limit" };
    }
    if (monthlyLimit > 0 && (state.usage.googleMonthlyCharacters + chars) > monthlyLimit) {
      return { ok: false, reason: "monthly_limit" };
    }
    return { ok: true };
  }

  function addUsage(engine, chars) {
    normalizeUsageDate();
    if (engine === "google") {
      state.usage.googleDailyCharacters += chars;
      state.usage.googleMonthlyCharacters += chars;
    } else if (engine === "piper") {
      state.usage.piperDailyCharacters += chars;
      state.usage.piperMonthlyCharacters += chars;
    }
    state.usage.totalRequestsToday += 1;
    state.usage.totalRequestsMonth += 1;
    saveState();
  }

  function googleAvailable(vc) {
    if (!vc?.enabled) return { ok: false, reason: "google_voice_disabled" };
    if (!textToSpeech) return { ok: false, reason: "google_package_missing" };
    if (!vc.keyFile || !fs.existsSync(vc.keyFile)) return { ok: false, reason: "google_key_missing" };
    return { ok: true };
  }

  function piperAvailable(vc) {
    if (!vc?.enabled) return { ok: false, reason: "piper_voice_disabled" };
    if (!vc.exe || !fs.existsSync(vc.exe)) return { ok: false, reason: "piper_exe_missing" };
    if (!vc.model || !fs.existsSync(vc.model)) return { ok: false, reason: "piper_model_missing" };
    return { ok: true };
  }

  async function synthesizeGoogle(item, voiceId, vc) {
    const ga = googleAvailable(vc);
    if (!ga.ok) throw new Error(ga.reason);

    const limit = canUseGoogle(item.chars);
    if (!limit.ok) throw new Error(limit.reason);

    if (!googleClients[voiceId]) {
      googleClients[voiceId] = new textToSpeech.TextToSpeechClient({ keyFilename: vc.keyFile });
    }

    const ext = String(vc.audioEncoding || "MP3").toLowerCase() === "mp3" ? "mp3" : "mp3";
    const fileName = `tts_${Date.now()}_${item.id}.${ext}`;
    const outputFile = path.join(GENERATED_DIR, fileName);

    const [response] = await googleClients[voiceId].synthesizeSpeech({
      input: { text: item.text },
      voice: {
        languageCode: vc.languageCode || "de-DE",
        name: vc.name || "de-DE-Wavenet-H"
      },
      audioConfig: {
        audioEncoding: vc.audioEncoding || "MP3",
        speakingRate: Number(vc.speakingRate || 1.0),
        pitch: Number(vc.pitch || 0.0)
      }
    });

    fs.writeFileSync(outputFile, response.audioContent, "binary");
    addUsage("google", item.chars);

    return { file: outputFile, url: `/assets/tts/generated/${fileName}`, engine: "google", voice: voiceId, label: vc.label || vc.name };
  }

  async function synthesizePiper(item, voiceId, vc) {
    const pa = piperAvailable(vc);
    if (!pa.ok) throw new Error(pa.reason);

    const fileName = `tts_${Date.now()}_${item.id}.wav`;
    const outputFile = path.join(GENERATED_DIR, fileName);

    await new Promise((resolve, reject) => {
      const args = ["--model", vc.model, "--output_file", outputFile];
      if (vc.config && fs.existsSync(vc.config)) args.push("--config", vc.config);

      const child = spawn(vc.exe, args, { windowsHide: true });
      let stderr = "";
      child.stderr.on("data", d => stderr += d.toString());
      child.on("error", reject);
      child.on("close", code => {
        if (code === 0 && fs.existsSync(outputFile)) return resolve();
        reject(new Error(stderr || `piper exited with code ${code}`));
      });
      child.stdin.write(item.text);
      child.stdin.end();
    });

    addUsage("piper", item.chars);
    return { file: outputFile, url: `/assets/tts/generated/${fileName}`, engine: "piper", voice: voiceId, label: vc.label || voiceId };
  }

  async function synthesize(item) {
    let { id: voiceId, cfg: vc } = voiceConfig(item.voice);
    if (!vc) throw new Error(`unknown_voice_${voiceId}`);

    try {
      if (vc.engine === "google") return await synthesizeGoogle(item, voiceId, vc);
      if (vc.engine === "piper") return await synthesizePiper(item, voiceId, vc);
      throw new Error(`unknown_engine_${vc.engine}`);
    } catch (firstErr) {
      const fallbackId = config.fallbackVoice;
      if (fallbackId && fallbackId !== voiceId) {
        const fb = voiceConfig(fallbackId);
        if (fb.cfg) {
          try {
            if (fb.cfg.engine === "google") return await synthesizeGoogle(item, fb.id, fb.cfg);
            if (fb.cfg.engine === "piper") return await synthesizePiper(item, fb.id, fb.cfg);
          } catch (fallbackErr) {
            throw new Error(`${firstErr.message}; fallback_failed: ${fallbackErr.message}`);
          }
        }
      }
      throw firstErr;
    }
  }

  function publicItem(item) {
    return {
      id: item.id,
      user: item.displayName,
      role: item.role,
      text: item.text,
      chars: item.chars,
      voice: item.voice,
      engine: item.engineUsed || null,
      priority: item.priority,
      createdAt: item.createdAt,
      audioUrl: item.audioUrl || null
    };
  }

  function publicStatus() {
    normalizeUsageDate();
    return {
      ok: true,
      enabled: Boolean(state.enabled && config.enabled),
      playing,
      current: current ? publicItem(current) : null,
      queueSize: queue.length,
      queueMax: Number(config.queue?.maxSize || 8),
      queue: queue.map(publicItem),
      usage: state.usage,
      limits: config.limits,
      roles: Object.fromEntries(Object.entries(config.roles || {}).map(([role, rc]) => [role, {
        enabled: rc.enabled,
        voice: rc.voice,
        maxLength: rc.maxLength,
        userCooldownSeconds: rc.userCooldownSeconds,
        globalCooldownSeconds: rc.globalCooldownSeconds,
        priority: rc.priority
      }])),
      mutes: Object.keys(state.sessionMutes || {}),
      bans: Object.keys(bans.users || {})
    };
  }

  function broadcastState() {
    broadcastWS({ op: "tts_state", data: publicStatus() });
  }

  function sortQueue() {
    queue.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.createdAtMs - b.createdAtMs;
    });
  }

  async function startNext() {
    if (playing || current || queue.length === 0) {
      broadcastState();
      return;
    }

    sortQueue();
    const item = queue.shift();
    current = item;
    playing = true;

    try {
      const audio = await synthesize(item);
      item.audioFile = audio.file;
      item.audioUrl = audio.url;
      item.engineUsed = audio.engine;
      item.voiceUsed = audio.voice;
      item.voiceLabel = audio.label;

      broadcastWS({
        op: "tts_play",
        item: publicItem(item),
        audioUrl: item.audioUrl,
        gapAfterMs: Number(config.queue?.gapAfterMs || 350)
      });
      broadcastState();
    } catch (err) {
      console.error(`[TTS] synth failed: ${err.message}`);
      broadcastWS({ op: "tts_error", error: err.message, item: publicItem(item) });
      current = null;
      playing = false;
      setTimeout(startNext, 250);
    }
  }

  function enqueue(item) {
    queue.push(item);
    sortQueue();
    setTimeout(startNext, 10);
  }

  function sayWithData(data) {
    normalizeUsageDate();
    const role = resolveRole(data);
    const rc = roleConfig(role);
    const user = userKey(data);
    const name = displayName(data);
    const text = sanitizeText(data.text || data.message || data.input || data.rawInput || "");

    if (!state.enabled || !config.enabled) {
      return { ok: false, reason: "tts_disabled", chat: msg("ttsDisabled") };
    }

    if (isBanned(user)) {
      return { ok: false, reason: "user_banned", chat: msg("bannedUser") };
    }

    if (isMuted(user)) {
      return { ok: false, reason: "user_muted", chat: msg("mutedUser") };
    }

    if (!rc.enabled) {
      return { ok: false, reason: "role_not_allowed", role, chat: msg("notAllowed") };
    }

    if (config.text?.blockEmpty && !text) {
      return { ok: false, reason: "empty_text", chat: msg("missingText") };
    }

    const maxLength = Number(rc.maxLength || 120);
    if (text.length > maxLength) {
      return { ok: false, reason: "text_too_long", maxLength, chars: text.length, chat: msg("tooLong", { maxLength }) };
    }

    const maxQueue = Number(config.queue?.maxSize || 8);
    if (queue.length >= maxQueue) {
      return { ok: false, reason: "queue_full", queueSize: queue.length, chat: msg("queueFull") };
    }

    const cd = checkCooldown(role, user);
    if (!cd.ok) {
      return { ok: false, reason: cd.reason, waitSeconds: cd.waitSeconds, chat: msg("cooldown", { seconds: cd.waitSeconds }) };
    }

    const voiceId = String(data.voice || rc.voice || config.defaultVoice || "google_wavenet_h");
    const voice = voiceConfig(voiceId);
    if (!voice.cfg) {
      return { ok: false, reason: "voice_not_found", chat: msg("cloudUnavailable") };
    }

    if (voice.cfg.engine === "google") {
      const ga = googleAvailable(voice.cfg);
      const limit = canUseGoogle(text.length);
      if (!ga.ok || !limit.ok) {
        const fb = voiceConfig(config.fallbackVoice);
        const fbOk = fb.cfg?.engine === "piper" ? piperAvailable(fb.cfg) : { ok: false, reason: "no_piper_fallback" };
        if (!fbOk.ok && config.rejectWhenFallbackUnavailable) {
          return { ok: false, reason: `cloud_unavailable_${ga.reason || limit.reason}_fallback_${fbOk.reason}`, chat: msg("cloudUnavailable") };
        }
      }
    }

    const item = {
      id: makeId(),
      user,
      displayName: name,
      role,
      text,
      chars: text.length,
      voice: voiceId,
      priority: Number(rc.priority || 10),
      createdAt: core.nowIso(),
      createdAtMs: Date.now()
    };

    touchCooldown(role, user);
    enqueue(item);
    const pos = queue.findIndex(x => x.id === item.id) + 1;
    return { ok: true, item: publicItem(item), queuePosition: pos > 0 ? pos : 0, chat: msg("ttsQueued") };
  }

  function done(req, res) {
    const data = getRequestData(req);
    const id = String(data.id || "");
    if (current && (!id || current.id === id)) {
      current = null;
      playing = false;
      saveState();
      broadcastState();
      setTimeout(startNext, Number(config.queue?.gapAfterMs || 350));
      return res.json({ ok: true, nextQueueSize: queue.length });
    }
    res.json({ ok: true, ignored: true, current: current ? current.id : null });
  }

  function setEnabled(value) {
    state.enabled = Boolean(value);
    saveState();
    broadcastState();
  }

  function stopCurrent() {
    broadcastWS({ op: "tts_stop" });
    current = null;
    playing = false;
    saveState();
    broadcastState();
  }

  function clearQueue(stopAlso) {
    queue.length = 0;
    if (stopAlso) stopCurrent();
    broadcastState();
  }

  function formatNameList(obj, emptyText) {
    const values = Object.values(obj || {}).map(x => x.displayName || x.login).filter(Boolean);
    if (values.length === 0) return emptyText;
    const shown = values.slice(0, 5).join(", ");
    return values.length > 5 ? `${shown} +${values.length - 5} weitere` : shown;
  }

  function splitTargetAndReason(rest) {
    const parts = String(rest || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { target: "", reason: "" };
    const targetRaw = parts.shift();
    return { target: normalizeLogin(targetRaw), display: targetRaw.replace(/^@+/, ""), reason: parts.join(" ").trim() };
  }

  function handleSubcommand(command, rest, data) {
    const actorRole = resolveRole(data);
    const actorLogin = userKey(data);
    const actorName = displayName(data);

    if (!canRunSubcommand(actorRole, command, actorLogin)) {
      return { ok: false, reason: "no_permission", chat: msg("noPermission") };
    }

    if (command === "on") {
      setEnabled(true);
      return { ok: true, chat: msg("systemOn") };
    }

    if (command === "off") {
      setEnabled(false);
      return { ok: true, chat: msg("systemOff") };
    }

    if (command === "status") {
      const s = publicStatus();
      return {
        ok: true,
        status: s,
        chat: msg("status", {
          enabledText: s.enabled ? "aktiv" : "abgeschaltet",
          queueCount: s.queueSize,
          queueMax: s.queueMax,
          dailyChars: s.usage.googleDailyCharacters,
          dailyLimit: s.limits.googleDailyCharacterLimit,
          monthlyChars: s.usage.googleMonthlyCharacters,
          monthlyLimit: s.limits.googleMonthlyCharacterLimit
        })
      };
    }

    if (command === "debug") {
      const s = publicStatus();
      const full = String(rest || "").trim().toLowerCase() === "full";
      const currentText = s.current
        ? `${s.current.user}/${s.current.role}/${s.current.voice}/${s.current.chars} Zeichen`
        : "none";
      const rolesText = Object.entries(s.roles || {})
        .filter(([role, rc]) => role !== "viewer" && rc && rc.enabled)
        .map(([role, rc]) => `${role}:${rc.maxLength}/${rc.userCooldownSeconds}s`)
        .join(", ");
      const vars = {
        enabledText: s.enabled ? "ja" : "nein",
        playingText: s.playing ? "ja" : "nein",
        currentText,
        queueCount: s.queueSize,
        queueMax: s.queueMax,
        googleDaily: s.usage.googleDailyCharacters || 0,
        googleDailyLimit: s.limits.googleDailyCharacterLimit || 0,
        googleMonthly: s.usage.googleMonthlyCharacters || 0,
        googleMonthlyLimit: s.limits.googleMonthlyCharacterLimit || 0,
        piperDaily: s.usage.piperDailyCharacters || 0,
        piperMonthly: s.usage.piperMonthlyCharacters || 0,
        requestsToday: s.usage.totalRequestsToday || 0,
        requestsMonth: s.usage.totalRequestsMonth || 0,
        muteCount: (s.mutes || []).length,
        banCount: (s.bans || []).length,
        rolesText
      };
      return { ok: true, status: s, chat: msg(full ? "debugFull" : "debug", vars) };
    }

    if (command === "stop") {
      stopCurrent();
      setTimeout(startNext, 250);
      return { ok: true, chat: msg("stop") };
    }

    if (command === "clear") {
      clearQueue(false);
      return { ok: true, chat: msg("clear") };
    }

    if (command === "reload") {
      reloadAllConfig();
      cleanupGeneratedFiles();
      broadcastState();
      return { ok: true, chat: "🔁 Die Heimleitung hat die TTS-Akten neu geladen." };
    }

    if (command === "help") {
      return { ok: true, chat: msg("help") };
    }

    if (command === "list") {
      const mutes = formatNameList(state.sessionMutes, "keine");
      const banList = formatNameList(bans.users, "keine");
      const isEmpty = Object.keys(state.sessionMutes || {}).length === 0 && Object.keys(bans.users || {}).length === 0;
      return { ok: true, chat: isEmpty ? msg("listEmpty") : msg("list", { mutes, bans: banList }) };
    }

    if (["mute", "unmute", "ban", "unban"].includes(command)) {
      const parsed = splitTargetAndReason(rest);
      if (!parsed.target) return { ok: false, reason: "missing_user", chat: msg("missingUser") };
      const target = parsed.target;
      const display = parsed.display || parsed.target;

      if (command === "mute") {
        if (state.sessionMutes[target]) return { ok: false, reason: "already_muted", chat: msg("alreadyMuted", { user: display }) };
        state.sessionMutes[target] = {
          login: target,
          displayName: display,
          reason: parsed.reason,
          mutedBy: actorName,
          mutedByLogin: actorLogin,
          mutedAt: core.nowIso()
        };
        saveState();
        return { ok: true, chat: msg("muteSuccess", { user: display }) };
      }

      if (command === "unmute") {
        if (!state.sessionMutes[target]) return { ok: false, reason: "not_muted", chat: msg("notMuted", { user: display }) };
        delete state.sessionMutes[target];
        saveState();
        return { ok: true, chat: msg("unmuteSuccess", { user: display }) };
      }

      if (command === "ban") {
        if (bans.users[target]) return { ok: false, reason: "already_banned", chat: msg("alreadyBanned", { user: display }) };
        bans.users[target] = {
          login: target,
          displayName: display,
          reason: parsed.reason,
          bannedBy: actorName,
          bannedByLogin: actorLogin,
          bannedAt: core.nowIso()
        };
        saveBans();
        return { ok: true, chat: msg("banSuccess", { user: display }) };
      }

      if (command === "unban") {
        if (!bans.users[target]) return { ok: false, reason: "not_banned", chat: msg("notBanned", { user: display }) };
        delete bans.users[target];
        saveBans();
        return { ok: true, chat: msg("unbanSuccess", { user: display }) };
      }
    }

    return { ok: false, reason: "unknown_command", chat: msg("unknownCommand") };
  }

  function run(req, res) {
    const data = getRequestData(req);
    const raw = parseRawInput(data);
    const parsed = parseCommand(raw);

    if (parsed.kind === "empty") {
      return res.json({ ok: false, reason: "empty_text", chat: msg("missingText") });
    }

    if (parsed.kind === "admin") {
      return res.json(handleSubcommand(parsed.command, parsed.rest, data));
    }

    return res.json(sayWithData({ ...data, text: parsed.rest }));
  }

  function cleanupGeneratedFiles() {
    const hours = Number(config.queue?.deleteGeneratedAfterHours || 0);
    if (hours <= 0) return;
    const maxAge = hours * 60 * 60 * 1000;
    const now = Date.now();
    try {
      for (const file of fs.readdirSync(GENERATED_DIR)) {
        if (!/^tts_.*\.(mp3|wav)$/i.test(file)) continue;
        const full = path.join(GENERATED_DIR, file);
        const stat = fs.statSync(full);
        if (now - stat.mtimeMs > maxAge) fs.unlinkSync(full);
      }
    } catch (err) {
      console.error(`[TTS] cleanup failed: ${err.message}`);
    }
  }

  // Main endpoints.
  app.all("/api/tts/run", run);
  app.all("/api/tts/say", (req, res) => res.json(sayWithData(getRequestData(req))));
  app.all("/api/tts/done", done);
  app.get("/api/tts/status", (req, res) => res.json(publicStatus()));

  // Compatibility endpoints.
  app.all("/api/tts/on", (req, res) => res.json(handleSubcommand("on", "", getRequestData(req))));
  app.all("/api/tts/off", (req, res) => res.json(handleSubcommand("off", "", getRequestData(req))));
  app.all("/api/tts/stop", (req, res) => res.json(handleSubcommand("stop", "", getRequestData(req))));
  app.all("/api/tts/clear", (req, res) => res.json(handleSubcommand("clear", "", getRequestData(req))));
  app.all("/api/tts/reload", (req, res) => res.json(handleSubcommand("reload", "", getRequestData(req))));
  app.all("/api/tts/command", (req, res) => {
    const data = getRequestData(req);
    const command = String(data.cmd || data.command || "status").toLowerCase().trim();
    res.json(handleSubcommand(command, String(data.rest || ""), data));
  });

  setInterval(() => {
    normalizeUsageDate();
    saveState();
    cleanupGeneratedFiles();
  }, 15 * 60 * 1000).unref?.();

  console.log("[TTS] module ready: /api/tts/run, /api/tts/status");
  console.log(`[TTS] config dir: ${CONFIG_DIR}`);
}

module.exports = { init };
