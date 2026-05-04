"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const core = require("./helpers/helper_core");
const messages = require("./helpers/helper_messages");
const chatOutput = require("./helpers/helper_chat_output");
const database = require("../core/database");

module.exports.init = function init(ctx) {
  const { app, broadcastWS } = ctx;

  const MODULE_NAME = "vip_sound_overlay";
  const DEFAULT_INTRO_MS = 360;
  const DEFAULT_OUTRO_MS = 280;
  const DEFAULT_GAP_MS = 2000;
  const DEFAULT_PHASE = "idle";
  const VIP_SCHEMA_MODULE = "vip_sound_overlay";
  const VIP_SCHEMA_VERSION = 1;
  const VIP_DAILY_USAGE_TABLE = "vip_sound_daily_usage";
  const VIP_MESSAGE_TABLE = "vip_sound_message_templates";
  const VIP_MESSAGE_STYLE = "heimleitung";
  const VIP_OVERLAY_STYLE = "overlay";
  const VIP_SOUND_SYSTEM_PLAY_URL = process.env.VIP_SOUND_SYSTEM_PLAY_URL || "http://127.0.0.1:8080/api/sound/play";
  const VIP_OVERRIDE_ALLOWED_ROLES_RAW = process.env.VIP_OVERRIDE_ALLOWED_ROLES || "moderator,mod,broadcaster";

  const DEFAULT_VIP_MESSAGES = [
    {
      event_key: "accepted_vip",
      message_text: "@{displayName}, Heimleitung hat deinen VIP-Sound notiert. Wird abgespielt, sobald das System dich dranlaesst.",
      weight: 1
    },
    {
      event_key: "accepted_vip",
      message_text: "@{displayName}, VIP-Antrag angenommen. Bitte im Wartebereich Platz nehmen, die Beschallung folgt.",
      weight: 1
    },
    {
      event_key: "accepted_mod",
      message_text: "@{displayName}, Mod-Sound wurde von der Heimleitung durchgewunken.",
      weight: 1
    },
    {
      event_key: "accepted_mod",
      message_text: "@{displayName}, Sonderfreigabe fuers Mod-Buero wurde erteilt. Sound ist eingereiht.",
      weight: 1
    },
    {
      event_key: "accepted_override_vip",
      message_text: "@{displayName}, Heimleitung hat eine Sonderfreigabe erteilt. Der VIP-Sound wird erneut abgespielt.",
      weight: 1
    },
    {
      event_key: "accepted_override_mod",
      message_text: "@{displayName}, Heimleitung hat eine Mod-Sonderfreigabe erteilt. Der Sound wird erneut abgespielt.",
      weight: 1
    },
    {
      event_key: "denied_override_vip",
      message_text: "@{actorDisplayName}, Antrag abgelehnt. VIP-Sound-Sonderfreigaben gibt es nur fuer Mods und die Sendeleitung.",
      weight: 1
    },
    {
      event_key: "denied_override_mod",
      message_text: "@{actorDisplayName}, Antrag abgelehnt. Mod-Sound-Sonderfreigaben gibt es nur fuer Mods und die Sendeleitung.",
      weight: 1
    },
    {
      event_key: "duplicate_vip",
      message_text: "@{displayName}, Antrag abgelehnt. Dein VIP-Sound wurde heute bereits ordnungsgemaess verbraten.",
      weight: 1
    },
    {
      event_key: "duplicate_vip",
      message_text: "@{displayName}, Heimleitung sagt nein. Ein VIP-Sound pro Tag, wir sind hier nicht im Wunschkonzert.",
      weight: 1
    },
    {
      event_key: "duplicate_mod",
      message_text: "@{displayName}, Einspruch zwecklos. Dein Mod-Sound war heute schon dran.",
      weight: 1
    },
    {
      event_key: "duplicate_mod",
      message_text: "@{displayName}, Mod-Sonderrechte schoen und gut, aber heute gab es deinen Sound bereits.",
      weight: 1
    },
    {
      event_key: "system_disabled",
      message_text: "@{displayName}, Heimleitung meldet: VIP-Sounds sind gerade ausser Betrieb.",
      weight: 1
    },
    {
      event_key: "sound_missing",
      message_text: "@{displayName}, Heimleitung findet deine Soundakte gerade nicht. Da fehlt wohl die passende MP3.",
      weight: 1
    },
    {
      event_key: "error_generic",
      message_text: "@{displayName}, Heimleitung hat einen Fehler im Formular gefunden. Versuch es spaeter nochmal.",
      weight: 1
    }
  ];

  const DEFAULT_VIP_OVERLAY_MESSAGES = [
    { event_key: "overlay_title_vip", message_text: "VIP-Sound", weight: 1 },
    { event_key: "overlay_title_mod", message_text: "Mod-Sound", weight: 1 },

    { event_key: "overlay_text_vip", message_text: "Schön, dass du da bist", weight: 1 },
    { event_key: "overlay_text_vip", message_text: "Danke, dass du Teil der Community bist", weight: 1 },
    { event_key: "overlay_text_vip", message_text: "Es ist schön, dich hier zu haben", weight: 1 },
    { event_key: "overlay_text_vip", message_text: "Danke, dass du mit dabei bist", weight: 1 },
    { event_key: "overlay_text_vip", message_text: "Es bedeutet viel, dass du da bist", weight: 1 },
    { event_key: "overlay_text_vip", message_text: "Danke, dass du die Community bereicherst", weight: 1 },

    { event_key: "overlay_text_mod", message_text: "Danke, dass du uns als Mod unterstützt", weight: 1 },
    { event_key: "overlay_text_mod", message_text: "Schön, dass wir dich im Mod-Team haben", weight: 1 },
    { event_key: "overlay_text_mod", message_text: "Danke für deine Hilfe und deinen Einsatz", weight: 1 },
    { event_key: "overlay_text_mod", message_text: "Danke, dass du für die Community da bist", weight: 1 },
    { event_key: "overlay_text_mod", message_text: "Schön, dass du uns als Mod zur Seite stehst", weight: 1 },
    { event_key: "overlay_text_mod", message_text: "Es bedeutet viel, dich im Team zu haben", weight: 1 }
  ];

  const webRoot = normalizeWinPath(
    process.env.VIP_OVERLAY_WEB_ROOT ||
    "d:\\Streaming\\stramAssets\\htdocs"
  );

  const userInfoBaseUrl =
    process.env.VIP_OVERLAY_USERINFO_URL ||
    "http://127.0.0.1:8080/userinfo?login=";

  const userInfoCache = new Map();

  const state = {
    version: "1.7.2",
    module: MODULE_NAME,
    overlay: emptyOverlay(),
    queue: [],
    isActive: false,
    lastFinishedAt: 0,
    updatedAt: new Date().toISOString(),
    client: {
      connected: false,
      lastSeenAt: 0
    },
    db: {
      initialized: false,
      schemaVersion: 0,
      messageTemplates: 0,
      dailyUsageRows: 0,
      lastError: ""
    },
    chat: {
      mode: "central",
      lastOk: false,
      lastAt: "",
      lastError: "",
      lastVia: ""
    }
  };

  function emptyOverlay() {
    return {
      visible: false,
      phase: DEFAULT_PHASE,
      title: "",
      text: "",
      displayName: "",
      login: "",
      avatarUrl: "",
      audioUrl: "",
      soundPath: "",
      introMs: DEFAULT_INTRO_MS,
      outroMs: DEFAULT_OUTRO_MS,
      gapAfterMs: DEFAULT_GAP_MS,
      startedAt: 0,
      audioStartedAt: 0,
      audioEndedAt: 0,
      hideStartedAt: 0,
      endsAt: 0,
      requestId: "",
      source: "vip_sound_overlay"
    };
  }

  function nowIso() {
    return core.nowIso();
  }

  function refreshDbStats() {
    if (!state.db.initialized) return;
    try {
      state.db.schemaVersion = database.getSchemaVersion(VIP_SCHEMA_MODULE) || 0;
      state.db.messageTemplates = database.count(VIP_MESSAGE_TABLE);
      state.db.dailyUsageRows = database.count(VIP_DAILY_USAGE_TABLE);
      state.db.lastError = "";
    } catch (err) {
      state.db.lastError = err.message || String(err);
    }
  }

  function publicState() {
    refreshDbStats();
    return {
      ok: true,
      version: state.version,
      module: state.module,
      overlay: { ...state.overlay },
      queuedCount: state.queue.length,
      isActive: state.isActive,
      lastFinishedAt: state.lastFinishedAt,
      client: { ...state.client },
      db: { ...state.db },
      chat: { ...state.chat },
      updatedAt: state.updatedAt
    };
  }

  function emitState(reason) {
    state.updatedAt = nowIso();
    if (typeof broadcastWS === "function") {
      broadcastWS({
        op: "vip_sound_overlay",
        reason: reason || "state",
        data: publicState()
      });
    }
  }

  function fail(res, status, message) {
    return res.status(status).json({ ok: false, error: message });
  }

  function requiredString(v, name) {
    const s = (v ?? "").toString().trim();
    if (!s) throw new Error(`Missing ${name}`);
    return s;
  }

  function bodyOrQuery(req, key) {
    return core.getParam(req, key, undefined);
  }

  function requestData(req) {
    return {
      ...(req.query && typeof req.query === "object" ? req.query : {}),
      ...(req.body && typeof req.body === "object" ? req.body : {})
    };
  }

  function intOrDefault(v, d) {
    const n = core.intParam(v, d);
    return Number.isFinite(n) && n >= 0 ? n : d;
  }

  function normalizeWinPath(p) {
    return (p || "").replace(/\//g, "\\").toLowerCase();
  }

  function normalizeLogin(value) {
    return String(value || "").trim().replace(/^@/, "").toLowerCase();
  }

  function cleanDisplayName(value) {
    return String(value || "").trim().replace(/^@/, "");
  }

  function fileExistsSafe(p) {
    try {
      return core.fileExists(p);
    } catch {
      return false;
    }
  }

  function toBrowserAudioUrl(soundPath) {
    const normalized = normalizeWinPath(soundPath);
    if (!normalized) throw new Error("Missing soundPath");

    const root = webRoot.endsWith("\\") ? webRoot : `${webRoot}\\`;
    if (!normalized.startsWith(root)) {
      throw new Error(`soundPath is outside web root: ${soundPath}`);
    }

    const relative = normalized.slice(root.length).replace(/\\/g, "/");
    return `/${relative}`;
  }

  function makeRequestId() {
    return `vip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function normalizeSoundType(raw) {
    const t = (raw || "").toString().trim().toLowerCase();
    if (t === "mod") return "mod";
    return "vip";
  }

  function eventKey(base, soundType) {
    return `${base}_${normalizeSoundType(soundType)}`;
  }

  function csvList(value) {
    return String(value || "")
      .split(",")
      .map(v => v.trim().toLowerCase())
      .filter(Boolean);
  }

  function boolish(value) {
    const s = String(value ?? "").trim().toLowerCase();
    return s === "1" || s === "true" || s === "yes" || s === "ja" || s === "y";
  }

  function actorCanOverride(raw) {
    const allowed = new Set(csvList(VIP_OVERRIDE_ALLOWED_ROLES_RAW));
    const roles = new Set();

    for (const key of ["actorRole", "userRole", "role", "badges", "actorBadges"]) {
      const value = raw[key];

      if (Array.isArray(value)) {
        for (const item of value) roles.add(String(item || "").trim().toLowerCase());
      } else {
        for (const item of csvList(value)) roles.add(item);
      }
    }

    if (boolish(raw.actorIsBroadcaster) || boolish(raw.isBroadcaster) || boolish(raw.broadcaster)) {
      roles.add("broadcaster");
    }

    if (boolish(raw.actorIsMod) || boolish(raw.isMod) || boolish(raw.isModerator) || boolish(raw.moderator)) {
      roles.add("moderator");
      roles.add("mod");
    }

    for (const role of roles) {
      if (allowed.has(role)) return true;
    }

    return false;
  }

  function hasExplicitTarget(raw) {
    const keys = [
      "targetLogin",
      "targetUserLogin",
      "targetUserName",
      "targetUsername",
      "target",
      "targetDisplayName",
      "targetUserDisplayName",
      "input0",
      "input1"
    ];

    return keys.some(key => String(raw[key] || "").trim() !== "");
  }

  function getBerlinDate() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());

    const data = {};
    for (const part of parts) data[part.type] = part.value;
    return `${data.year}-${data.month}-${data.day}`;
  }

  function ensureVipSchema() {
    try {
      database.init(ctx);
      database.ensureSchema(VIP_SCHEMA_MODULE, VIP_SCHEMA_VERSION, (fromVersion, toVersion, db) => {
        if (toVersion === 1) {
          db.exec(`
            CREATE TABLE IF NOT EXISTS vip_sound_daily_usage (
              usage_date TEXT NOT NULL,
              user_login TEXT NOT NULL,
              user_display_name TEXT NOT NULL DEFAULT '',
              sound_type TEXT NOT NULL DEFAULT 'vip',
              source TEXT NOT NULL DEFAULT '',
              triggered_at TEXT NOT NULL,
              PRIMARY KEY (usage_date, user_login, sound_type)
            );

            CREATE TABLE IF NOT EXISTS vip_sound_message_templates (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              event_key TEXT NOT NULL,
              style TEXT NOT NULL DEFAULT 'heimleitung',
              message_text TEXT NOT NULL,
              enabled INTEGER NOT NULL DEFAULT 1,
              weight INTEGER NOT NULL DEFAULT 1,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              UNIQUE(event_key, style, message_text)
            );
          `);
        }
      });
      seedDefaultMessagesIfEmpty();
      state.db.initialized = true;
      state.db.lastError = "";
      refreshDbStats();
      return true;
    } catch (err) {
      state.db.initialized = false;
      state.db.lastError = err.message || String(err);
      console.warn(`[${MODULE_NAME}] db schema unavailable: ${state.db.lastError}`);
      return false;
    }
  }

  function seedDefaultMessagesIfEmpty() {
    const now = nowIso();
    const seedGroups = [
      { style: VIP_MESSAGE_STYLE, items: DEFAULT_VIP_MESSAGES },
      { style: VIP_OVERLAY_STYLE, items: DEFAULT_VIP_OVERLAY_MESSAGES }
    ];

    for (const group of seedGroups) {
      for (const item of group.items) {
        database.run(`
          INSERT OR IGNORE INTO vip_sound_message_templates
            (event_key, style, message_text, enabled, weight, created_at, updated_at)
          VALUES
            (:eventKey, :style, :messageText, 1, :weight, :createdAt, :updatedAt)
        `, {
          eventKey: item.event_key,
          style: group.style,
          messageText: item.message_text,
          weight: Number(item.weight || 1),
          createdAt: now,
          updatedAt: now
        });
      }
    }
  }

  function pickWeightedMessage(rows) {
    const list = Array.isArray(rows) ? rows.filter(Boolean) : [];
    if (!list.length) return "";

    const total = list.reduce((sum, row) => {
      const weight = Math.max(1, Number(row.weight || 1));
      return sum + weight;
    }, 0);

    let pick = Math.random() * total;
    for (const row of list) {
      pick -= Math.max(1, Number(row.weight || 1));
      if (pick <= 0) return String(row.message_text || "");
    }

    return String(list[list.length - 1].message_text || "");
  }

  function getMessageTemplate(key, style = VIP_MESSAGE_STYLE) {
    const rows = database.all(`
      SELECT message_text, weight
      FROM vip_sound_message_templates
      WHERE event_key = :eventKey
        AND style = :style
        AND enabled = 1
      ORDER BY id ASC
    `, {
      eventKey: key,
      style
    });

    return pickWeightedMessage(rows);
  }

  function renderDbTemplate(template, context = {}, maxLength = 180) {
    const raw = messages.replacePlaceholders(String(template || ""), context);
    return messages.sanitizeChatMessage(raw, maxLength);
  }

  function overlayEventKey(prefix, soundType) {
    return `${prefix}_${normalizeSoundType(soundType)}`;
  }

  function fallbackMessage(key, displayName) {
    const name = displayName || "User";
    if (key === "accepted_mod") return `@${name}, Mod-Sound wurde von der Heimleitung durchgewunken.`;
    if (key === "accepted_override_vip") return `@${name}, Heimleitung hat eine Sonderfreigabe erteilt. Der VIP-Sound wird erneut abgespielt.`;
    if (key === "accepted_override_mod") return `@${name}, Heimleitung hat eine Mod-Sonderfreigabe erteilt. Der Sound wird erneut abgespielt.`;
    if (key === "denied_override_vip") return `@${name}, Antrag abgelehnt. VIP-Sound-Sonderfreigaben gibt es nur fuer Mods und die Sendeleitung.`;
    if (key === "denied_override_mod") return `@${name}, Antrag abgelehnt. Mod-Sound-Sonderfreigaben gibt es nur fuer Mods und die Sendeleitung.`;
    if (key === "duplicate_mod") return `@${name}, Einspruch zwecklos. Dein Mod-Sound war heute schon dran.`;
    if (key === "duplicate_vip") return `@${name}, Heimleitung sagt nein. Dein VIP-Sound wurde heute bereits genutzt.`;
    if (key === "system_disabled") return `@${name}, Heimleitung meldet: VIP-Sounds sind gerade ausser Betrieb.`;
    if (key === "sound_missing") return `@${name}, Heimleitung findet deine Soundakte gerade nicht.`;
    if (key === "error_generic") return `@${name}, Heimleitung hat einen Fehler im Formular gefunden.`;
    return `@${name}, Heimleitung hat deinen VIP-Sound notiert.`;
  }

  async function buildVipChatResponse(key, context, extra = {}) {
    const template = state.db.initialized ? getMessageTemplate(key) : "";
    const raw = template || fallbackMessage(key, context.displayName || context.login);
    const text = messages.sanitizeChatMessage(messages.replacePlaceholders(raw, context), 450);
    const meta = {
      module: MODULE_NAME,
      eventKey: key,
      ...extra
    };

    let output;
    try {
      output = await chatOutput.sendChatMessage(text, {
        source: MODULE_NAME,
        reason: key,
        fallbackToStreamerbot: false,
        directSendEnabled: true
      });

      state.chat.lastOk = !!output.ok && output.sent === true;
      state.chat.lastAt = nowIso();
      state.chat.lastError = output.ok ? "" : (output.reason || output.error || "chat_output_failed");
      state.chat.lastVia = output.via || output.account || "";
    } catch (err) {
      output = messages.buildErrorResponse("chat_output_exception", {
        extra: { error: err.message || String(err) }
      });

      state.chat.lastOk = false;
      state.chat.lastAt = nowIso();
      state.chat.lastError = err.message || String(err);
      state.chat.lastVia = "none";
    }

    return {
      ...output,
      send: false,
      chatMessage: "",
      streamerbot_send: "0",
      streamerbot_message: "",
      message: text,
      text,
      centralChat: output,
      ...meta
    };
  }

  function buildQueuedChatMessage(item, queuePosition) {
    const mentionName = item.displayName || item.login || "User";
    const label = item.soundType === "mod" ? "Mod-Sound" : "VIP-Sound";
    return `@${mentionName} – Dein ${label} wurde in die Warteschlange gepackt (Position ${queuePosition}).`;
  }

  function fallbackOverlayTitle(soundType) {
    return soundType === "mod" ? "Mod-Sound" : "VIP-Sound";
  }

  function fallbackOverlayText(soundType) {
    return soundType === "mod"
      ? "Danke, dass du uns als Mod unterstützt"
      : "Schön, dass du da bist";
  }

  function buildOverlayTitle(soundType, context = {}) {
    if (state.db.initialized) {
      const template = getMessageTemplate(overlayEventKey("overlay_title", soundType), VIP_OVERLAY_STYLE);
      if (template) return renderDbTemplate(template, context, 80);
    }

    return fallbackOverlayTitle(soundType);
  }

  function buildOverlayText(soundType, context = {}) {
    if (state.db.initialized) {
      const template = getMessageTemplate(overlayEventKey("overlay_text", soundType), VIP_OVERLAY_STYLE);
      if (template) return renderDbTemplate(template, context, 180);
    }

    return fallbackOverlayText(soundType);
  }

  function beautifyDisplayName(name) {
    const s = (name || "").toString().trim();
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function httpGetJson(url) {
    return new Promise((resolve, reject) => {
      const lib = url.startsWith("https://") ? https : http;

      const req = lib.get(url, (res) => {
        let raw = "";
        res.setEncoding("utf8");

        res.on("data", (chunk) => {
          raw += chunk;
        });

        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          }

          try {
            resolve(JSON.parse(raw));
          } catch (err) {
            reject(new Error(`Invalid JSON from ${url}: ${err.message}`));
          }
        });
      });

      req.on("error", reject);
      req.setTimeout(5000, () => {
        req.destroy(new Error(`Timeout for ${url}`));
      });
    });
  }

  function httpPostJson(url, payload) {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify(payload || {});
      const target = new URL(url);
      const lib = target.protocol === "https:" ? https : http;

      const req = lib.request({
        method: "POST",
        hostname: target.hostname,
        port: target.port || (target.protocol === "https:" ? 443 : 80),
        path: `${target.pathname}${target.search || ""}`,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        },
        timeout: 8000
      }, (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", chunk => { raw += chunk; });
        res.on("end", () => {
          let json = null;
          try { json = raw ? JSON.parse(raw) : null; } catch (_) { json = null; }

          if (res.statusCode < 200 || res.statusCode >= 300) {
            const msg = json && (json.error || json.message) ? (json.error || json.message) : `HTTP ${res.statusCode}`;
            const err = new Error(msg);
            err.statusCode = res.statusCode;
            err.response = json || raw;
            return reject(err);
          }

          resolve(json || {});
        });
      });

      req.on("error", reject);
      req.on("timeout", () => req.destroy(new Error(`Timeout for ${url}`)));
      req.write(body);
      req.end();
    });
  }

  function getVipSoundBaseDir() {
    const raw = String(process.env.VIP_SOUND_BASE_DIR || "").trim();
    if (raw) {
      if (path.isAbsolute(raw)) return raw;
      return path.join(process.cwd(), raw);
    }

    return path.join(webRoot, "assets", "sounds", "vip");
  }

  function resolveVipSoundFile(user) {
    const displayName = cleanDisplayName(user.displayName || user.login || "");
    const fileName = `${displayName}.mp3`;
    const fullPath = path.join(getVipSoundBaseDir(), fileName);
    const relativeFile = `vip/${fileName}`.replace(/\\/g, "/");

    return {
      displayName,
      fileName,
      fullPath,
      relativeFile,
      exists: fileExistsSafe(fullPath)
    };
  }

  async function queueVipSoundInSoundSystem(user, soundType, context, requestId, source) {
    const sound = resolveVipSoundFile(user);

    if (!sound.exists) {
      return {
        ok: false,
        reason: "sound_missing",
        sound,
        error: `VIP sound file missing: ${sound.fullPath}`
      };
    }

    const category = soundType === "mod" ? "crew" : "vip";
    const overlayContext = {
      ...context,
      displayName: user.displayName || user.login || "",
      login: user.login || "",
      targetDisplayName: user.displayName || user.login || "",
      targetLogin: user.login || "",
      soundType
    };
    const overlayTitle = buildOverlayTitle(soundType, overlayContext);
    const overlayText = buildOverlayText(soundType, overlayContext);

    const payload = {
      file: sound.relativeFile,
      label: `${overlayTitle} - ${user.displayName || user.login}`,
      category,
      priority: soundType === "mod" ? 60 : 60,
      target: "stream",
      outputTarget: "device",
      volume: 85,
      queueIfBusy: true,
      dropIfBusy: false,
      parallelAllowed: false,
      source: source || MODULE_NAME,
      requestedBy: user.login || "",
      meta: {
        module: MODULE_NAME,
        requestId,
        usageDate: context.date,
        soundType,
        login: user.login || "",
        displayName: user.displayName || user.login || "",
        soundFile: sound.relativeFile
      },
      visual: {
        module: MODULE_NAME,
        type: soundType,
        requestId,
        title: overlayTitle,
        text: overlayText,
        displayName: user.displayName || user.login || "",
        login: user.login || "",
        avatarUrl: user.avatarUrl || ""
      }
    };

    const response = await httpPostJson(VIP_SOUND_SYSTEM_PLAY_URL, payload);
    const result = response && response.result ? response.result : {};
    const accepted = !!response.ok && !result.dropped && (
      result.started === true ||
      result.queued === true ||
      result.parallel === true ||
      !!response.item
    );

    return {
      ok: accepted,
      reason: accepted ? "sound_accepted" : "sound_rejected",
      sound,
      payload,
      response,
      result,
      error: accepted ? "" : (response && (response.error || response.message)) || "sound_system_rejected"
    };
  }

  async function fetchUserInfo(loginOrDisplayName) {
    const key = (loginOrDisplayName || "").toString().trim().toLowerCase();
    if (!key) return null;

    if (userInfoCache.has(key)) {
      return userInfoCache.get(key);
    }

    const url = userInfoBaseUrl + encodeURIComponent(key);

    try {
      const json = await httpGetJson(url);
      const first = json && json.data && json.data[0] ? json.data[0] : null;
      if (!first) {
        userInfoCache.set(key, null);
        return null;
      }

      const info = {
        login: (first.login || "").toString().trim(),
        displayName: (first.display_name || first.login || key).toString().trim(),
        avatarUrl: (first.profile_image_url || "").toString().trim()
      };

      if (info.login) userInfoCache.set(info.login.toLowerCase(), info);
      if (info.displayName) userInfoCache.set(info.displayName.toLowerCase(), info);
      userInfoCache.set(key, info);

      return info;
    } catch (err) {
      console.warn(`[${MODULE_NAME}] userinfo lookup failed for "${key}": ${err.message}`);
      userInfoCache.set(key, null);
      return null;
    }
  }

  async function resolveCommandUser(raw) {
    const loginRaw = normalizeLogin(raw.actorLogin || raw.login || raw.userLogin || raw.userName || raw.username || raw.user || "");
    const displayRaw = cleanDisplayName(raw.actorDisplayName || raw.displayName || raw.userDisplayName || raw.display || raw.user || loginRaw || "");
    const lookupKey = loginRaw || displayRaw;
    const info = await fetchUserInfo(lookupKey);

    const login = normalizeLogin((info && info.login) || loginRaw || displayRaw);
    const displayName = cleanDisplayName(displayRaw || (info && info.displayName) || login);
    const avatarUrl = String((info && info.avatarUrl) || raw.avatarUrl || "").trim();

    return {
      login,
      displayName: displayName || login,
      avatarUrl
    };
  }

  async function resolveCommandTargetUser(raw, actor) {
    if (!hasExplicitTarget(raw)) {
      return { explicit: false, user: actor };
    }

    const targetRaw = normalizeLogin(
      raw.targetLogin ||
      raw.targetUserLogin ||
      raw.targetUserName ||
      raw.targetUsername ||
      raw.target ||
      raw.input0 ||
      raw.input1 ||
      ""
    );

    const targetDisplayRaw = cleanDisplayName(
      raw.targetDisplayName ||
      raw.targetUserDisplayName ||
      raw.targetDisplay ||
      raw.target ||
      raw.input0 ||
      raw.input1 ||
      targetRaw ||
      ""
    );

    const lookupKey = targetRaw || targetDisplayRaw;
    const info = await fetchUserInfo(lookupKey);

    const login = normalizeLogin((info && info.login) || targetRaw || targetDisplayRaw);
    const displayName = cleanDisplayName(targetDisplayRaw || (info && info.displayName) || login);
    const avatarUrl = String((info && info.avatarUrl) || raw.targetAvatarUrl || "").trim();

    return {
      explicit: true,
      user: {
        login,
        displayName: displayName || login,
        avatarUrl
      }
    };
  }

  async function handleVipCommand(raw) {
    const dbReady = ensureVipSchema();
    const soundType = normalizeSoundType(raw.soundType || raw.type);
    const trigger = String(raw.trigger || raw.command || "").trim();
    const source = String(raw.source || "streamerbot").trim() || "streamerbot";

    const actor = await resolveCommandUser(raw);
    const target = await resolveCommandTargetUser(raw, actor);
    const user = target.user;

    const isOverrideRequest = target.explicit && normalizeLogin(user.login) !== normalizeLogin(actor.login);
    const overrideAllowed = isOverrideRequest && actorCanOverride(raw);
    const skipDailyUsage = isOverrideRequest && overrideAllowed;

    if (!actor.login || !user.login) {
      const context = {
        displayName: (user && user.displayName) || (actor && actor.displayName) || "User",
        login: (user && user.login) || "",
        actorDisplayName: (actor && actor.displayName) || "User",
        actorLogin: (actor && actor.login) || "",
        soundType,
        trigger,
        date: getBerlinDate()
      };

      return await buildVipChatResponse("error_generic", context, {
        accepted: false,
        duplicate: false,
        dbReady,
        error: "missing_user_login"
      });
    }

    const usageDate = getBerlinDate();
    const context = {
      displayName: user.displayName || user.login,
      login: user.login,
      actorDisplayName: actor.displayName || actor.login,
      actorLogin: actor.login,
      targetDisplayName: user.displayName || user.login,
      targetLogin: user.login,
      soundType,
      trigger,
      date: usageDate,
      override: skipDailyUsage ? "1" : "0"
    };

    if (!dbReady) {
      return await buildVipChatResponse("error_generic", context, {
        accepted: false,
        duplicate: false,
        dbReady: false,
        error: state.db.lastError || "db_unavailable"
      });
    }

    if (isOverrideRequest && !overrideAllowed) {
      return await buildVipChatResponse(eventKey("denied_override", soundType), context, {
        accepted: false,
        duplicate: false,
        override: true,
        overrideAllowed: false,
        dailyUsageWritten: false,
        usageDate,
        actorLogin: actor.login,
        actorDisplayName: actor.displayName || actor.login,
        targetLogin: user.login,
        targetDisplayName: user.displayName || user.login,
        userLogin: user.login,
        userDisplayName: user.displayName || user.login,
        soundType,
        trigger,
        source,
        soundSystemQueued: false
      });
    }

    let existing = null;
    if (!skipDailyUsage) {
      existing = database.get(`
        SELECT usage_date, user_login, sound_type, triggered_at
        FROM vip_sound_daily_usage
        WHERE usage_date = :usageDate
          AND user_login = :userLogin
          AND sound_type = :soundType
      `, {
        usageDate,
        userLogin: user.login,
        soundType
      });
    }

    if (existing) {
      return await buildVipChatResponse(eventKey("duplicate", soundType), context, {
        accepted: false,
        duplicate: true,
        override: false,
        overrideAllowed: false,
        dailyUsageWritten: false,
        usageDate,
        actorLogin: actor.login,
        actorDisplayName: actor.displayName || actor.login,
        targetLogin: user.login,
        targetDisplayName: user.displayName || user.login,
        userLogin: user.login,
        userDisplayName: user.displayName || user.login,
        soundType,
        trigger,
        source,
        previousTriggeredAt: existing.triggered_at || ""
      });
    }

    const requestId = makeRequestId();
    const soundQueue = await queueVipSoundInSoundSystem(user, soundType, context, requestId, source);

    if (!soundQueue.ok) {
      const missing = soundQueue.reason === "sound_missing";
      return await buildVipChatResponse(missing ? "sound_missing" : "error_generic", context, {
        accepted: false,
        duplicate: false,
        override: skipDailyUsage,
        overrideAllowed,
        dailyUsageWritten: false,
        requestId,
        usageDate,
        actorLogin: actor.login,
        actorDisplayName: actor.displayName || actor.login,
        targetLogin: user.login,
        targetDisplayName: user.displayName || user.login,
        userLogin: user.login,
        userDisplayName: user.displayName || user.login,
        avatarUrl: user.avatarUrl,
        soundType,
        trigger,
        source,
        soundSystemQueued: false,
        soundError: soundQueue.error || "",
        soundFile: soundQueue.sound ? soundQueue.sound.relativeFile : "",
        soundPath: soundQueue.sound ? soundQueue.sound.fullPath : "",
        soundSystemResponse: soundQueue.response || null
      });
    }

    if (!skipDailyUsage) {
      database.run(`
        INSERT INTO vip_sound_daily_usage
          (usage_date, user_login, user_display_name, sound_type, source, triggered_at)
        VALUES
          (:usageDate, :userLogin, :userDisplayName, :soundType, :source, :triggeredAt)
      `, {
        usageDate,
        userLogin: user.login,
        userDisplayName: user.displayName || user.login,
        soundType,
        source,
        triggeredAt: nowIso()
      });
      refreshDbStats();
    }

    return await buildVipChatResponse(skipDailyUsage ? eventKey("accepted_override", soundType) : eventKey("accepted", soundType), context, {
      accepted: true,
      duplicate: false,
      override: skipDailyUsage,
      overrideAllowed,
      dailyUsageWritten: !skipDailyUsage,
      requestId,
      usageDate,
      actorLogin: actor.login,
      actorDisplayName: actor.displayName || actor.login,
      targetLogin: user.login,
      targetDisplayName: user.displayName || user.login,
      userLogin: user.login,
      userDisplayName: user.displayName || user.login,
      avatarUrl: user.avatarUrl,
      soundType,
      trigger,
      source,
      soundSystemQueued: true,
      soundSystemStarted: !!soundQueue.result.started,
      soundSystemQueuePosition: Number(soundQueue.result.queuePosition || 0),
      soundSystemRequestId:
        soundQueue.result.requestId ||
        (soundQueue.response && soundQueue.response.requestId) ||
        (soundQueue.response && soundQueue.response.item && soundQueue.response.item.requestId) ||
        "",
      soundFile: soundQueue.sound.relativeFile,
      soundPath: soundQueue.sound.fullPath,
      note: skipDailyUsage
        ? "STEP019 override queued VIP sound via sound_system without daily usage."
        : "STEP017 queued VIP sound via sound_system before writing daily usage."
    });
  }

  async function normalizeItem(raw) {
    const loginRaw = (raw.login || "").toString().trim();
    const displayRaw = (raw.displayName || "").toString().trim();
    const titleRaw = (raw.title || "").toString().trim();
    const textRaw = (raw.text || "").toString().trim();
    const avatarRaw = (raw.avatarUrl || "").toString().trim();
    const soundPath = requiredString(raw.soundPath, "soundPath");

    if (!fileExistsSafe(soundPath)) {
      throw new Error(`Sound file not found: ${soundPath}`);
    }

    const soundType = normalizeSoundType(raw.soundType || raw.type);
    const lookupKey = loginRaw || displayRaw;
    const info = await fetchUserInfo(lookupKey);

    const resolvedLogin = ((info && info.login) || loginRaw || displayRaw).toString().trim().toLowerCase();
    const preferredDisplay = displayRaw || ((info && info.displayName) || loginRaw || "");
    const resolvedDisplay = beautifyDisplayName(preferredDisplay);

    const resolvedAvatar = ((info && info.avatarUrl) || avatarRaw || "").toString().trim();

    return {
      requestId: makeRequestId(),
      title: titleRaw || buildOverlayTitle(soundType, { displayName: resolvedDisplay, login: resolvedLogin, soundType }),
      text: textRaw || buildOverlayText(soundType, { displayName: resolvedDisplay, login: resolvedLogin, soundType }),
      finalTitle: buildOverlayTitle(soundType, { displayName: resolvedDisplay, login: resolvedLogin, soundType }),
      finalText: buildOverlayText(soundType, { displayName: resolvedDisplay, login: resolvedLogin, soundType }),
      displayName: resolvedDisplay,
      login: resolvedLogin,
      avatarUrl: resolvedAvatar,
      soundPath,
      audioUrl: toBrowserAudioUrl(soundPath),
      introMs: intOrDefault(raw.introMs, DEFAULT_INTRO_MS),
      outroMs: intOrDefault(raw.outroMs, DEFAULT_OUTRO_MS),
      gapAfterMs: intOrDefault(raw.gapAfterMs, DEFAULT_GAP_MS),
      source: (raw.source || "vip_sound").toString().trim() || "vip_sound",
      soundType,
      queuedAt: Date.now()
    };
  }

  function startNextIfIdle() {
    if (state.isActive) return false;
    if (!state.queue.length) return false;

    const item = state.queue.shift();
    state.isActive = true;
    state.overlay = {
      visible: true,
      phase: "intro",
      title: item.finalTitle || item.title,
      text: item.finalText || item.text,
      displayName: item.displayName,
      login: item.login,
      avatarUrl: item.avatarUrl,
      audioUrl: item.audioUrl,
      soundPath: item.soundPath,
      introMs: item.introMs,
      outroMs: item.outroMs,
      gapAfterMs: item.gapAfterMs,
      startedAt: Date.now(),
      audioStartedAt: 0,
      audioEndedAt: 0,
      hideStartedAt: 0,
      endsAt: 0,
      requestId: item.requestId,
      source: item.source
    };
    emitState("started");
    return true;
  }

  async function enqueue(raw) {
    const item = await normalizeItem(raw);

    const startsImmediately = !state.isActive && state.queue.length === 0;
    state.queue.push(item);

    const queuePosition = startsImmediately ? 0 : state.queue.length;
    const chatMessage = startsImmediately ? "" : buildQueuedChatMessage(item, queuePosition);

    emitState("enqueued");
    startNextIfIdle();

    return {
      item,
      startsImmediately,
      queuePosition,
      chatMessage
    };
  }

  function markClientSeen() {
    state.client.connected = true;
    state.client.lastSeenAt = Date.now();
    state.updatedAt = nowIso();
  }

  const apiPrefixes = ["/api/vip-sound-overlay", "/api/vip-sound"];

  function registerApiPrefix(prefix) {
    app.use(prefix, (req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      if (req.method === "OPTIONS") return res.sendStatus(204);
      next();
    });

    app.get(`${prefix}/state`, (req, res) => {
      markClientSeen();
      return res.json(publicState());
    });

    app.get(`${prefix}/status`, (req, res) => {
      markClientSeen();
      refreshDbStats();
      return res.json({
        ok: true,
        version: state.version,
        phase: state.overlay.phase,
        visible: state.overlay.visible,
        isActive: state.isActive,
        queuedCount: state.queue.length,
        requestId: state.overlay.requestId || "",
        lastFinishedAt: state.lastFinishedAt,
        client: { ...state.client },
        db: { ...state.db },
        updatedAt: state.updatedAt
      });
    });

    app.get(`${prefix}/db/status`, (req, res) => {
      markClientSeen();
      ensureVipSchema();
      refreshDbStats();
      return res.json({
        ok: state.db.initialized,
        module: MODULE_NAME,
        schemaModule: VIP_SCHEMA_MODULE,
        schemaVersion: state.db.schemaVersion,
        dailyUsageTable: VIP_DAILY_USAGE_TABLE,
        messageTable: VIP_MESSAGE_TABLE,
        messageTemplates: state.db.messageTemplates,
        dailyUsageRows: state.db.dailyUsageRows,
        databasePath: database.getDbPath ? database.getDbPath() : "",
        lastError: state.db.lastError,
        updatedAt: nowIso()
      });
    });

    app.post(`${prefix}/command`, async (req, res) => {
      try {
        const result = await handleVipCommand(requestData(req));
        return res.json(result);
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.get(`${prefix}/command`, async (req, res) => {
      try {
        const result = await handleVipCommand(requestData(req));
        return res.json(result);
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.post(`${prefix}/enqueue`, async (req, res) => {
      try {
        const result = await enqueue(req.body || {});
        return res.json({
          ok: true,
          requestId: result.item.requestId,
          startedImmediately: result.startsImmediately,
          queuePosition: result.queuePosition,
          displayName: result.item.displayName,
          login: result.item.login,
          avatarUrl: result.item.avatarUrl,
          soundType: result.item.soundType,
          chatMessage: result.chatMessage,
          queuedCount: state.queue.length,
          isActive: state.isActive,
          overlay: { ...state.overlay }
        });
      } catch (err) {
        return fail(res, 400, err.message);
      }
    });

    app.get(`${prefix}/enqueue`, async (req, res) => {
      try {
        const result = await enqueue({
          title: bodyOrQuery(req, "title"),
          text: bodyOrQuery(req, "text"),
          displayName: bodyOrQuery(req, "displayName"),
          login: bodyOrQuery(req, "login"),
          avatarUrl: bodyOrQuery(req, "avatarUrl"),
          soundPath: bodyOrQuery(req, "soundPath"),
          source: bodyOrQuery(req, "source"),
          soundType: bodyOrQuery(req, "soundType") || bodyOrQuery(req, "type"),
          introMs: bodyOrQuery(req, "introMs"),
          outroMs: bodyOrQuery(req, "outroMs"),
          gapAfterMs: bodyOrQuery(req, "gapAfterMs")
        });

        return res.json({
          ok: true,
          requestId: result.item.requestId,
          startedImmediately: result.startsImmediately,
          queuePosition: result.queuePosition,
          displayName: result.item.displayName,
          login: result.item.login,
          avatarUrl: result.item.avatarUrl,
          soundType: result.item.soundType,
          chatMessage: result.chatMessage,
          queuedCount: state.queue.length,
          isActive: state.isActive,
          overlay: { ...state.overlay }
        });
      } catch (err) {
        return fail(res, 400, err.message);
      }
    });

    app.post(`${prefix}/client/audio-started`, (req, res) => {
      markClientSeen();
      const requestId = (bodyOrQuery(req, "requestId") || "").toString().trim();
      if (!state.isActive || !state.overlay.visible) return fail(res, 409, "No active overlay");
      if (!requestId || requestId !== state.overlay.requestId) return fail(res, 409, "requestId mismatch");

      state.overlay.phase = "audio";
      state.overlay.audioStartedAt = Date.now();
      emitState("audio_started");
      return res.json({ ok: true, overlay: { ...state.overlay } });
    });

    app.post(`${prefix}/client/audio-ended`, (req, res) => {
      markClientSeen();
      const requestId = (bodyOrQuery(req, "requestId") || "").toString().trim();
      if (!state.isActive || !state.overlay.visible) return fail(res, 409, "No active overlay");
      if (!requestId || requestId !== state.overlay.requestId) return fail(res, 409, "requestId mismatch");

      state.overlay.phase = "outro";
      state.overlay.audioEndedAt = Date.now();
      state.overlay.hideStartedAt = Date.now();
      emitState("audio_ended");
      return res.json({ ok: true, overlay: { ...state.overlay } });
    });

    app.post(`${prefix}/client/finished`, (req, res) => {
      markClientSeen();
      const requestId = (bodyOrQuery(req, "requestId") || "").toString().trim();
      if (!state.isActive) return fail(res, 409, "No active overlay");
      if (!requestId || requestId !== state.overlay.requestId) return fail(res, 409, "requestId mismatch");

      const gapAfterMs = state.overlay.gapAfterMs || DEFAULT_GAP_MS;
      state.overlay.phase = "gap";
      state.overlay.visible = false;
      state.overlay.endsAt = Date.now();
      state.lastFinishedAt = Date.now();
      emitState("finished");

      setTimeout(() => {
        if (state.overlay.requestId === requestId) {
          state.isActive = false;
          state.overlay = emptyOverlay();
          emitState("gap_finished");
          startNextIfIdle();
        }
      }, gapAfterMs);

      return res.json({
        ok: true,
        gapAfterMs,
        queuedCount: state.queue.length,
        nextStartsAfterGap: true
      });
    });

    app.post(`${prefix}/reset`, (req, res) => {
      state.queue = [];
      state.isActive = false;
      state.lastFinishedAt = 0;
      state.overlay = emptyOverlay();
      emitState("reset");
      return res.json(publicState());
    });
  }

  ensureVipSchema();
  apiPrefixes.forEach(registerApiPrefix);

  console.log(`[${MODULE_NAME}] loaded`);
  console.log(`[${MODULE_NAME}] webRoot=${webRoot}`);
  console.log(`[${MODULE_NAME}] userInfoBaseUrl=${userInfoBaseUrl}`);
};
