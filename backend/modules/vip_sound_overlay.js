"use strict";

const fs = require("fs");
const http = require("http");
const https = require("https");
const core = require("./helpers/helper_core");
const messages = require("./helpers/helper_messages");
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

  const webRoot = normalizeWinPath(
    process.env.VIP_OVERLAY_WEB_ROOT ||
    "d:\\Streaming\\stramAssets\\htdocs"
  );

  const userInfoBaseUrl =
    process.env.VIP_OVERLAY_USERINFO_URL ||
    "http://127.0.0.1:8080/userinfo?login=";

  const userInfoCache = new Map();

  const state = {
    version: "1.6.0",
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
    const row = database.get(`SELECT COUNT(*) AS count FROM ${VIP_MESSAGE_TABLE}`);
    if (Number(row?.count || 0) > 0) return;

    const now = nowIso();
    for (const item of DEFAULT_VIP_MESSAGES) {
      database.run(`
        INSERT OR IGNORE INTO vip_sound_message_templates
          (event_key, style, message_text, enabled, weight, created_at, updated_at)
        VALUES
          (:eventKey, :style, :messageText, 1, :weight, :createdAt, :updatedAt)
      `, {
        eventKey: item.event_key,
        style: VIP_MESSAGE_STYLE,
        messageText: item.message_text,
        weight: Number(item.weight || 1),
        createdAt: now,
        updatedAt: now
      });
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

  function getMessageTemplate(key) {
    const rows = database.all(`
      SELECT message_text, weight
      FROM vip_sound_message_templates
      WHERE event_key = :eventKey
        AND style = :style
        AND enabled = 1
      ORDER BY id ASC
    `, {
      eventKey: key,
      style: VIP_MESSAGE_STYLE
    });

    return pickWeightedMessage(rows);
  }

  function fallbackMessage(key, displayName) {
    const name = displayName || "User";
    if (key === "accepted_mod") return `@${name}, Mod-Sound wurde von der Heimleitung durchgewunken.`;
    if (key === "duplicate_mod") return `@${name}, Einspruch zwecklos. Dein Mod-Sound war heute schon dran.`;
    if (key === "duplicate_vip") return `@${name}, Heimleitung sagt nein. Dein VIP-Sound wurde heute bereits genutzt.`;
    if (key === "system_disabled") return `@${name}, Heimleitung meldet: VIP-Sounds sind gerade ausser Betrieb.`;
    if (key === "sound_missing") return `@${name}, Heimleitung findet deine Soundakte gerade nicht.`;
    if (key === "error_generic") return `@${name}, Heimleitung hat einen Fehler im Formular gefunden.`;
    return `@${name}, Heimleitung hat deinen VIP-Sound notiert.`;
  }

  function buildVipChatResponse(key, context, extra = {}) {
    const template = state.db.initialized ? getMessageTemplate(key) : "";
    const raw = template || fallbackMessage(key, context.displayName || context.login);
    const text = messages.replacePlaceholders(raw, context);
    return messages.buildSendResponse(text, {
      reason: key,
      extra: {
        module: MODULE_NAME,
        eventKey: key,
        ...extra
      }
    });
  }

  function buildQueuedChatMessage(item, queuePosition) {
    const mentionName = item.displayName || item.login || "User";
    const label = item.soundType === "mod" ? "Mod-Sound" : "VIP-Sound";
    return `@${mentionName} – Dein ${label} wurde in die Warteschlange gepackt (Position ${queuePosition}).`;
  }

  function buildOverlayTitle(soundType) {
    return soundType === "mod" ? "Mod-Sound" : "VIP-Sound";
  }

  function buildOverlayText(soundType, displayName) {
    const vipTexts = [
      "Schön, dass du da bist",
      "Danke, dass du Teil der Community bist",
      "Es ist schön, dich hier zu haben",
      "Danke, dass du mit dabei bist",
      "Es bedeutet viel, dass du da bist",
      "Danke, dass du die Community bereicherst"
    ];

    const modTexts = [
      "Danke, dass du uns als Mod unterstützt",
      "Schön, dass wir dich im Mod-Team haben",
      "Danke für deine Hilfe und deinen Einsatz",
      "Danke, dass du für die Community da bist",
      "Schön, dass du uns als Mod zur Seite stehst",
      "Es bedeutet viel, dich im Team zu haben"
    ];

    const pool = soundType === "mod" ? modTexts : vipTexts;
    return pool[Math.floor(Math.random() * pool.length)];
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

  async function handleVipCommand(raw) {
    const dbReady = ensureVipSchema();
    const soundType = normalizeSoundType(raw.soundType || raw.type);
    const trigger = String(raw.trigger || raw.command || "").trim();
    const source = String(raw.source || "streamerbot").trim() || "streamerbot";
    const user = await resolveCommandUser(raw);

    if (!user.login) {
      const context = {
        displayName: user.displayName || "User",
        login: "",
        soundType,
        trigger,
        date: getBerlinDate()
      };
      return buildVipChatResponse("error_generic", context, {
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
      soundType,
      trigger,
      date: usageDate
    };

    if (!dbReady) {
      return buildVipChatResponse("error_generic", context, {
        accepted: false,
        duplicate: false,
        dbReady: false,
        error: state.db.lastError || "db_unavailable"
      });
    }

    const existing = database.get(`
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

    if (existing) {
      return buildVipChatResponse(eventKey("duplicate", soundType), context, {
        accepted: false,
        duplicate: true,
        usageDate,
        userLogin: user.login,
        soundType,
        trigger,
        source,
        previousTriggeredAt: existing.triggered_at || ""
      });
    }

    const requestId = makeRequestId();
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

    return buildVipChatResponse(eventKey("accepted", soundType), context, {
      accepted: true,
      duplicate: false,
      requestId,
      usageDate,
      userLogin: user.login,
      userDisplayName: user.displayName || user.login,
      avatarUrl: user.avatarUrl,
      soundType,
      trigger,
      source,
      soundSystemQueued: false,
      note: "STEP016 records usage and returns chatMessage only. Sound-System integration follows later."
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
      title: titleRaw || buildOverlayTitle(soundType),
      text: textRaw || buildOverlayText(soundType, resolvedDisplay),
      finalTitle: buildOverlayTitle(soundType),
      finalText: buildOverlayText(soundType, resolvedDisplay),
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
