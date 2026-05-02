// modules/challenge.js — Challenge System V2 FIX3
// Node owns active/queue/timer and broadcasts state to overlays via WebSocket.
// Streamer.bot should only trigger /api/challenge/start once per reward/command.

const http = require("http");
const https = require("https");
const WebSocket = require("ws");

const core = require("./helpers/helper_core");
const configHelper = require("./helpers/helper_config");
const routes = require("./helpers/helper_routes");
const messagesHelper = require("./helpers/helper_messages");
let twitchPresence = null;
try {
  twitchPresence = require("./twitch_presence");
} catch (_) {
  twitchPresence = null;
}

let sqlite = null;
try {
  sqlite = require("./sqlite_core");
} catch (_) {
  sqlite = null;
}

const MODULE = "challenge";
const DEFAULT_CONFIG = {
  enabled: true,
  version: 2,
  defaults: {
    timezone: "Europe/Berlin",
    maxQueueSize: 10,
    sendQueuedMessage: false,
    sendStartedMessage: true,
    sendFinishedMessage: true,
    broadcastEverySecond: true,
    delayBetweenChallengesMs: 3000,
    persistState: false,
    statsEnabled: true
  },
  routes: {
    apiPrefix: "/api/challenge",
    legacyPrefix: "/scripts/challenge"
  },
  websocket: {
    enabled: true,
    eventType: "challenge",
    statusEventType: "challenge_status"
  },
  discordSound: {
    enabled: true,
    baseUrl: "http://127.0.0.1:8080",
    path: "/discord/play",
    authQueryName: "auth",
    authQueryValue: "1608",
    timeoutMs: 2500
  },
  stats: {
    enabled: true,
    schemaVersion: 1,
    keepRuntimeEvents: true,
    maxEventsReturned: 50
  },
  chat: {
    enabled: true,
    provider: "twitch_presence",
    sendQueuedMessage: false,
    sendStartedMessage: true,
    sendFinishedMessage: true,
    failSilently: true
  },
  modes: {
    NichtFluchen: {
      enabled: true,
      aliases: ["NichtFluchen", "Nicht Fluchen", "nichtfluchen", "nicht fluchen", "fluchen"],
      label: "Nicht fluchen",
      displayTitle: "NICHT FLUCHEN",
      icon: "🚫",
      defaultDurationSeconds: 120,
      overlaySound: "/assets/sounds/nichtfluchen.mp3",
      discordSoundEnabled: true,
      discordSoundKey: "nichtfluchen"
    },
    NichtReden: {
      enabled: true,
      aliases: ["NichtReden", "Nicht Reden", "nichtreden", "nicht reden", "reden"],
      label: "Nicht reden",
      displayTitle: "NICHT REDEN",
      icon: "🤐",
      defaultDurationSeconds: 300,
      overlaySound: "/assets/sounds/nichtreden.mp3",
      discordSoundEnabled: true,
      discordSoundKey: "nichtreden"
    }
  }
};

const DEFAULT_MESSAGES = {
  version: 2,
  responses: {
    disabled: ["Die Rentnerkekse sind gerade im Schrank eingeschlossen. Challenge-System ist deaktiviert."],
    unknownMode: ["Diese Challenge kennt die Heimleitung nicht. Da muss erst ein Formular für her."],
    queueFull: ["Die Warteschlange ist voll. Mehr Chaos passt gerade nicht in den Aufenthaltsraum."],
    queued: ["{user} hat {label} ausgelöst. Wird nach der aktuellen Challenge gestartet."],
    started: {
      NichtFluchen: ["🚫 {label} startet jetzt für {durationText}. Die Heimleitung hört mit."],
      NichtReden: ["🤐 {label} startet jetzt für {durationText}. Ruhe im Aufenthaltsraum."]
    },
    finished: {
      NichtFluchen: ["🚫 {label} ist beendet. Die Heimleitung legt den Notizblock weg."],
      NichtReden: ["🤐 {label} ist beendet. Es darf wieder gesprochen werden."]
    },
    removed: ["Die nächste Challenge wurde aus der Warteschlange entfernt. Heimleitung hat aufgeräumt."],
    reset: ["Challenge-System wurde zurückgesetzt. Alle Rentnerkekse wieder einsortiert."]
  }
};

module.exports.init = function init(ctx) {
  const { app } = ctx;

  let runtime = loadRuntime();
  let seq = 0;
  const state = {
    active: null,
    queue: [],
    lastEvent: null,
    nextStartTimer: null,
    nextStartAtMs: 0,
    nextStartDelayMs: 0,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  let statsSchemaReady = false;
  ensureStatsSchema();

  const tick = setInterval(() => {
    try {
      tickRuntime();
    } catch (err) {
      console.warn(`[${MODULE}] tick failed:`, err.message);
    }
  }, 1000);
  if (typeof tick.unref === "function") tick.unref();

  registerGet(app, "/api/challenge", handleStart);
  registerPost(app, "/api/challenge", handleStart);
  registerGet(app, "/scripts/challenge", handleStart);
  registerPost(app, "/scripts/challenge", handleStart);

  registerGet(app, "/api/challenge/start", handleStart);
  registerPost(app, "/api/challenge/start", handleStart);

  registerGet(app, "/api/challenge/status", handleStatus);
  registerPost(app, "/api/challenge/status", handleStatus);

  registerGet(app, "/api/challenge/remove-next", handleRemoveNext);
  registerPost(app, "/api/challenge/remove-next", handleRemoveNext);
  registerGet(app, "/api/challenge/remove", handleRemoveNext);
  registerPost(app, "/api/challenge/remove", handleRemoveNext);

  registerGet(app, "/api/challenge/reset", handleReset);
  registerPost(app, "/api/challenge/reset", handleReset);

  registerGet(app, "/api/challenge/reload", handleReload);
  registerPost(app, "/api/challenge/reload", handleReload);

  registerGet(app, "/api/challenge/stats", handleStats);
  registerPost(app, "/api/challenge/stats", handleStats);
  registerGet(app, "/api/challenge/stats/top", handleStatsTop);
  registerGet(app, "/api/challenge/stats/user", handleStatsUser);

  broadcastStatus("ready");
  console.log(`[${MODULE}] V2 FIX6-STATS-SQLITE-PARAMS aktiv: /api/challenge/start, /api/challenge/status, /api/challenge/stats, /api/challenge/remove-next, /api/challenge/reset, /api/challenge/reload`);

  function loadRuntime() {
    const config = loadJsonFromConfig("challenge_system.json", DEFAULT_CONFIG);
    const messages = loadJsonFromConfig(["messages", "challenge.json"], DEFAULT_MESSAGES);
    return { config, messages, loadedAt: new Date().toISOString() };
  }

  function loadJsonFromConfig(parts, fallback) {
    const fs = require("fs");
    const path = require("path");
    const relParts = Array.isArray(parts) ? parts : [parts];

    // Read the real project config file directly through helper_config path helpers.
    // Some helper_config.loadConfig variants return wrapper objects instead of raw JSON.
    // That made runtime.config.enabled undefined and caused false "disabled" responses.
    try {
      const filePath = typeof configHelper.resolveFromConfig === "function"
        ? configHelper.resolveFromConfig(...relParts)
        : path.join(configHelper.getConfigDir(), ...relParts);

      if (fs.existsSync(filePath)) {
        const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const normalized = unwrapLoadedConfig(parsed);
        if (normalized && typeof normalized === "object") {
          return mergeDefaults(fallback, normalized);
        }
      }
    } catch (err) {
      console.warn(`[${MODULE}] config load failed for ${relParts.join("/")}:`, err.message);
    }

    return clone(fallback);
  }

  function unwrapLoadedConfig(value) {
    if (!value || typeof value !== "object") return value;
    if (value.enabled !== undefined || value.responses !== undefined || value.modes !== undefined) return value;
    if (value.config && typeof value.config === "object") return value.config;
    if (value.data && typeof value.data === "object") return value.data;
    if (value.value && typeof value.value === "object") return value.value;
    return value;
  }

  function mergeDefaults(fallback, loaded) {
    if (!fallback || typeof fallback !== "object") return loaded;
    if (!loaded || typeof loaded !== "object") return clone(fallback);
    if (Array.isArray(fallback) || Array.isArray(loaded)) return clone(loaded);

    const result = clone(fallback);
    for (const [key, value] of Object.entries(loaded)) {
      if (value && typeof value === "object" && !Array.isArray(value) && result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
        result[key] = mergeDefaults(result[key], value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function handleStart(req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    if (!runtime.config.enabled) {
      return respond(req, res, 503, {
        ok: false,
        error: "disabled",
        chatMessage: pickMessage("disabled", {})
      });
    }

    const rawMode = getParam(req, "mode", "");
    const modeId = normalizeMode(rawMode);
    const mode = modeId ? runtime.config.modes[modeId] : null;

    if (!mode || mode.enabled === false) {
      return respond(req, res, 400, {
        ok: false,
        error: "unknownMode",
        mode: rawMode,
        chatMessage: pickMessage("unknownMode", { mode: rawMode })
      });
    }

    const user = cleanUser(getParam(req, "user", "Unbekannt"));
    const defaultDuration = positiveInt(mode.defaultDurationSeconds, 60);
    const duration = positiveInt(getParam(req, "duration", defaultDuration), defaultDuration);
    const maxQueueSize = Math.max(0, positiveInt(runtime.config.defaults.maxQueueSize, 10));

    if (state.active && state.queue.length >= maxQueueSize) {
      return respond(req, res, 429, {
        ok: false,
        error: "queueFull",
        active: publicChallenge(state.active),
        queueLength: state.queue.length,
        chatMessage: pickMessage("queueFull", { user, label: mode.label, mode: modeId })
      });
    }

    const entry = createEntry(modeId, mode, user, duration);
    recordChallengeStat("requested", entry);

    if (!state.active && !state.nextStartTimer) {
      startEntry(entry, "immediate");
      const snap = snapshot("started");
      return respond(req, res, 200, {
        ok: true,
        action: "started",
        challenge: publicChallenge(state.active),
        state: snap,
        chatMessage: state.active.chatMessage || ""
      });
    }

    state.queue.push(entry);
    recordChallengeStat("queued", entry);
    touch("queued");
    const queuedMessage = runtime.config.defaults.sendQueuedMessage
      ? pickMessage("queued", placeholders(entry, { queuePosition: state.queue.length }))
      : "";
    broadcastStatus("queued", { queued: publicChallenge(entry), chatMessage: queuedMessage });

    return respond(req, res, 200, {
      ok: true,
      action: "queued",
      queued: publicChallenge(entry),
      queuePosition: state.queue.length,
      state: snapshot("queued"),
      chatMessage: queuedMessage
    });
  }

  function handleStatus(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    return respond(req, res, 200, {
      ok: true,
      module: MODULE,
      version: 2,
      configPath: "config\\challenge_system.json",
      messagesPath: "config\\messages\\challenge.json",
      config: {
        enabled: runtime.config.enabled,
        maxQueueSize: runtime.config.defaults && runtime.config.defaults.maxQueueSize,
        stats: {
          enabled: getStatsEnabled(),
          schemaReady: statsSchemaReady
        },
        chat: {
          enabled: getChatBool("enabled", true),
          sendQueuedMessage: getChatBool("sendQueuedMessage", false),
          sendStartedMessage: getChatBool("sendStartedMessage", true),
          sendFinishedMessage: getChatBool("sendFinishedMessage", true),
          provider: (runtime.config.chat && runtime.config.chat.provider) || "twitch_presence"
        },
        timing: {
          delayBetweenChallengesMs: getDelayBetweenChallengesMs()
        },
        modes: Object.fromEntries(Object.entries(runtime.config.modes || {}).map(([key, mode]) => [key, { enabled: mode.enabled !== false, label: mode.label, defaultDurationSeconds: mode.defaultDurationSeconds }]))
      },
      state: snapshot("status")
    });
  }

  function handleRemoveNext(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    const removed = state.queue.shift() || null;
    if (!state.active && state.queue.length === 0) clearNextStartTimer();
    touch("remove-next");
    const chatMessage = removed ? pickMessage("removed", placeholders(removed)) : "";
    broadcastStatus("remove-next", { removed: removed ? publicChallenge(removed) : null, chatMessage });
    return respond(req, res, 200, {
      ok: true,
      action: "remove-next",
      removed: removed ? publicChallenge(removed) : null,
      state: snapshot("remove-next"),
      chatMessage
    });
  }

  function handleReset(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    clearNextStartTimer();
    state.active = null;
    state.queue = [];
    touch("reset");
    const chatMessage = pickMessage("reset", {});
    broadcastStatus("reset", { chatMessage });
    return respond(req, res, 200, {
      ok: true,
      action: "reset",
      state: snapshot("reset"),
      chatMessage
    });
  }

  function handleReload(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    runtime = loadRuntime();
    touch("reload");
    ensureStatsSchema();
    broadcastStatus("reload");
    return respond(req, res, 200, {
      ok: true,
      action: "reload",
      loadedAt: runtime.loadedAt,
      state: snapshot("reload")
    });
  }


  function handleStats(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    const ready = ensureStatsSchema();
    if (!ready) {
      return respond(req, res, 503, { ok: false, error: "stats_unavailable", schemaReady: false });
    }

    const limit = Math.min(Math.max(positiveInt(getParam(req, "limit", 20), 20), 1), 100);
    const mode = normalizeMode(getParam(req, "mode", ""));
    const user = normalizeUserKey(getParam(req, "user", ""));

    const where = [];
    const params = [];
    if (mode) { where.push("mode = ?"); params.push(mode); }
    if (user) { where.push("user_key = ?"); params.push(user); }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const rows = dbAll(`
      SELECT user_key, user_display, mode, label,
             requested_count, queued_count, started_count, finished_count,
             total_duration_seconds, updated_at
      FROM challenge_user_mode_stats
      ${whereSql}
      ORDER BY requested_count DESC, started_count DESC, total_duration_seconds DESC, user_display COLLATE NOCASE ASC
      LIMIT ?
    `, [...params, limit]);

    const totals = dbGet(`
      SELECT COALESCE(SUM(requested_count),0) AS requested_count,
             COALESCE(SUM(queued_count),0) AS queued_count,
             COALESCE(SUM(started_count),0) AS started_count,
             COALESCE(SUM(finished_count),0) AS finished_count,
             COALESCE(SUM(total_duration_seconds),0) AS total_duration_seconds
      FROM challenge_user_mode_stats
      ${whereSql}
    `, params) || {};

    return respond(req, res, 200, {
      ok: true,
      module: MODULE,
      version: 2,
      schemaReady: true,
      limit,
      filter: { mode: mode || null, user: user || null },
      totals,
      rows
    });
  }

  function handleStatsTop(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    const metricRaw = String(getParam(req, "metric", "requested") || "requested").toLowerCase();
    const metricMap = {
      requested: "requested_count",
      queued: "queued_count",
      started: "started_count",
      finished: "finished_count",
      duration: "total_duration_seconds"
    };
    const metricColumn = metricMap[metricRaw] || metricMap.requested;
    const limit = Math.min(Math.max(positiveInt(getParam(req, "limit", 10), 10), 1), 50);
    const mode = normalizeMode(getParam(req, "mode", ""));

    const ready = ensureStatsSchema();
    if (!ready) return respond(req, res, 503, { ok: false, error: "stats_unavailable", schemaReady: false });

    const where = [];
    const params = [];
    if (mode) { where.push("mode = ?"); params.push(mode); }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const rows = dbAll(`
      SELECT user_key, user_display,
             COALESCE(SUM(requested_count),0) AS requested_count,
             COALESCE(SUM(queued_count),0) AS queued_count,
             COALESCE(SUM(started_count),0) AS started_count,
             COALESCE(SUM(finished_count),0) AS finished_count,
             COALESCE(SUM(total_duration_seconds),0) AS total_duration_seconds,
             MAX(updated_at) AS updated_at
      FROM challenge_user_mode_stats
      ${whereSql}
      GROUP BY user_key, user_display
      ORDER BY ${metricColumn} DESC, user_display COLLATE NOCASE ASC
      LIMIT ?
    `, [...params, limit]);

    return respond(req, res, 200, {
      ok: true,
      module: MODULE,
      version: 2,
      metric: metricRaw in metricMap ? metricRaw : "requested",
      mode: mode || null,
      limit,
      rows
    });
  }

  function handleStatsUser(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    const user = normalizeUserKey(getParam(req, "user", getParam(req, "login", "")));
    if (!user) return respond(req, res, 400, { ok: false, error: "missing_user" });

    const ready = ensureStatsSchema();
    if (!ready) return respond(req, res, 503, { ok: false, error: "stats_unavailable", schemaReady: false });

    const rows = dbAll(`
      SELECT user_key, user_display, mode, label,
             requested_count, queued_count, started_count, finished_count,
             total_duration_seconds, updated_at
      FROM challenge_user_mode_stats
      WHERE user_key = ?
      ORDER BY requested_count DESC, mode ASC
    `, [user]);

    const totals = dbGet(`
      SELECT COALESCE(SUM(requested_count),0) AS requested_count,
             COALESCE(SUM(queued_count),0) AS queued_count,
             COALESCE(SUM(started_count),0) AS started_count,
             COALESCE(SUM(finished_count),0) AS finished_count,
             COALESCE(SUM(total_duration_seconds),0) AS total_duration_seconds
      FROM challenge_user_mode_stats
      WHERE user_key = ?
    `, [user]) || {};

    return respond(req, res, 200, { ok: true, module: MODULE, version: 2, user, totals, rows });
  }

  function tickRuntime() {
    if (!state.active) return;

    const now = Date.now();
    if (now >= state.active.endsAtMs) {
      finishActive("timeup");
      return;
    }

    if (runtime.config.defaults.broadcastEverySecond !== false) {
      broadcastStatus("tick");
    }
  }

  function finishActive(reason) {
    if (!state.active) return;

    const finished = state.active;
    const finishMessage = getChatBool("sendFinishedMessage", true)
      ? pickMessage(["finished", finished.mode], placeholders(finished))
      : "";

    state.active = null;
    touch("finished");
    recordChallengeStat("finished", finished);
    broadcastStatus("finished", {
      finished: publicChallenge(finished),
      reason,
      chatMessage: finishMessage
    });
    sendTwitchChatMessage(finishMessage, "finished", finished);

    if (state.queue.length > 0) {
      scheduleNextFromQueue();
    }
  }

  function scheduleNextFromQueue() {
    if (state.active || state.nextStartTimer || state.queue.length === 0) return;

    const delayMs = getDelayBetweenChallengesMs();
    if (delayMs <= 0) {
      startNextFromQueue();
      return;
    }

    state.nextStartDelayMs = delayMs;
    state.nextStartAtMs = Date.now() + delayMs;
    touch("waiting-next");
    broadcastStatus("waiting-next", {
      nextStartsAt: new Date(state.nextStartAtMs).toISOString(),
      delayMs
    });

    state.nextStartTimer = setTimeout(() => {
      state.nextStartTimer = null;
      state.nextStartAtMs = 0;
      state.nextStartDelayMs = 0;
      startNextFromQueue();
    }, delayMs);
    if (typeof state.nextStartTimer.unref === "function") state.nextStartTimer.unref();
  }

  function startNextFromQueue() {
    if (state.active || state.queue.length === 0) return;
    const next = state.queue.shift();
    if (next) startEntry(next, "queue");
  }

  function clearNextStartTimer() {
    if (state.nextStartTimer) {
      clearTimeout(state.nextStartTimer);
      state.nextStartTimer = null;
    }
    state.nextStartAtMs = 0;
    state.nextStartDelayMs = 0;
  }

  function startEntry(entry, source) {
    const now = Date.now();
    const chatMessage = getChatBool("sendStartedMessage", true)
      ? pickMessage(["started", entry.mode], placeholders(entry))
      : "";

    state.active = {
      ...entry,
      source,
      startedAt: new Date(now).toISOString(),
      startedAtMs: now,
      endsAt: new Date(now + entry.duration * 1000).toISOString(),
      endsAtMs: now + entry.duration * 1000,
      chatMessage
    };

    recordChallengeStat("started", state.active);
    touch("started");
    broadcastChallengeStarted(state.active, chatMessage);
    broadcastStatus("started", { chatMessage });
    playDiscordSoundFor(state.active);
    sendTwitchChatMessage(chatMessage, "started", state.active);
  }

  function createEntry(modeId, mode, user, duration) {
    return {
      id: `${Date.now()}-${++seq}`,
      mode: modeId,
      label: mode.label || modeId,
      displayTitle: mode.displayTitle || mode.label || modeId,
      icon: mode.icon || "🏆",
      user,
      duration,
      overlaySound: mode.overlaySound || "",
      discordSoundEnabled: mode.discordSoundEnabled !== false,
      discordSoundKey: mode.discordSoundKey || mode.soundKey || "",
      createdAt: new Date().toISOString()
    };
  }

  function normalizeMode(raw) {
    const value = String(raw || "").trim();
    if (!value) return "";
    const needle = value.toLowerCase().replace(/[\s_\-.]/g, "");

    for (const [modeId, mode] of Object.entries(runtime.config.modes || {})) {
      if (modeId.toLowerCase().replace(/[\s_\-.]/g, "") === needle) return modeId;
      const aliases = Array.isArray(mode.aliases) ? mode.aliases : [];
      for (const alias of aliases) {
        if (String(alias).toLowerCase().replace(/[\s_\-.]/g, "") === needle) return modeId;
      }
    }

    if (/nicht.?fluchen/i.test(value)) return "NichtFluchen";
    if (/nicht.?reden/i.test(value)) return "NichtReden";
    return "";
  }

  function snapshot(event) {
    return {
      module: MODULE,
      version: 2,
      event,
      active: state.active ? publicChallenge(state.active) : null,
      queue: state.queue.map(publicChallenge),
      queueLength: state.queue.length,
      transition: state.nextStartTimer ? {
        nextStartsAt: new Date(state.nextStartAtMs).toISOString(),
        delayMs: state.nextStartDelayMs,
        remainingMs: Math.max(0, state.nextStartAtMs - Date.now())
      } : null,
      updatedAt: state.updatedAt,
      serverTime: new Date().toISOString()
    };
  }

  function publicChallenge(entry) {
    if (!entry) return null;
    const remainingSeconds = entry.endsAtMs
      ? Math.max(0, Math.ceil((entry.endsAtMs - Date.now()) / 1000))
      : entry.duration;

    return {
      id: entry.id,
      mode: entry.mode,
      label: entry.label,
      displayTitle: entry.displayTitle,
      icon: entry.icon,
      user: entry.user,
      duration: entry.duration,
      remainingSeconds,
      createdAt: entry.createdAt,
      startedAt: entry.startedAt || null,
      endsAt: entry.endsAt || null,
      overlaySound: entry.overlaySound || "",
      source: entry.source || null
    };
  }

  function broadcastChallengeStarted(entry, chatMessage) {
    const data = publicChallenge(entry);

    // Legacy payload: old overlays expect { type: "challenge", data: { mode, user, duration } }
    broadcast({
      type: runtime.config.websocket.eventType || "challenge",
      event: "started",
      data,
      chatMessage: chatMessage || ""
    });

    // Additional old fallback payload some older overlays/scripts used.
    broadcast({
      op: "challenge",
      event: "started",
      ...data,
      chatMessage: chatMessage || ""
    });
  }

  function broadcastStatus(event, extra = {}) {
    const payload = {
      type: runtime.config.websocket.statusEventType || "challenge_status",
      event,
      data: snapshot(event),
      ...extra
    };
    broadcast(payload);
  }

  function broadcast(obj) {
    if (runtime.config.websocket && runtime.config.websocket.enabled === false) return false;

    if (typeof ctx.broadcastWS === "function") {
      ctx.broadcastWS(obj);
      return true;
    }

    if (ctx.wss && ctx.wss.clients) {
      const msg = JSON.stringify(obj);
      ctx.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(msg);
      });
      return true;
    }

    return false;
  }


  function getStatsEnabled() {
    const stats = runtime.config.stats || {};
    const defaults = runtime.config.defaults || {};
    if (stats.enabled !== undefined) return stats.enabled !== false;
    if (defaults.statsEnabled !== undefined) return defaults.statsEnabled !== false;
    return true;
  }

  function ensureStatsSchema() {
    if (!getStatsEnabled()) return false;
    if (statsSchemaReady) return true;
    if (!sqlite || typeof sqlite.run !== "function") return false;
    try {
      if (typeof sqlite.isInitialized === "function" && !sqlite.isInitialized()) return false;
      const now = new Date().toISOString();
      sqlite.run(`CREATE TABLE IF NOT EXISTS challenge_user_mode_stats (
        user_key TEXT NOT NULL,
        user_display TEXT NOT NULL,
        mode TEXT NOT NULL,
        label TEXT NOT NULL,
        requested_count INTEGER NOT NULL DEFAULT 0,
        queued_count INTEGER NOT NULL DEFAULT 0,
        started_count INTEGER NOT NULL DEFAULT 0,
        finished_count INTEGER NOT NULL DEFAULT 0,
        total_duration_seconds INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (user_key, mode)
      )`);
      sqlite.run(`CREATE TABLE IF NOT EXISTS challenge_runtime_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        challenge_id TEXT,
        mode TEXT,
        label TEXT,
        user_key TEXT,
        user_display TEXT,
        duration_seconds INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )`);
      dbRun(`INSERT INTO schema_versions (module_name, version, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(module_name) DO UPDATE SET version = excluded.version, updated_at = excluded.updated_at`,
        ["challenge", 1, now]);
      statsSchemaReady = true;
      return true;
    } catch (err) {
      console.warn(`[${MODULE}] stats schema unavailable:`, err.message);
      statsSchemaReady = false;
      return false;
    }
  }

  function recordChallengeStat(eventType, entry) {
    if (!getStatsEnabled() || !entry) return;
    if (!ensureStatsSchema()) return;
    const event = String(eventType || "").trim();
    if (!event) return;

    const now = new Date().toISOString();
    const userDisplay = cleanUser(entry.user || "Unbekannt");
    const userKey = normalizeUserKey(userDisplay) || "unbekannt";
    const mode = entry.mode || "unknown";
    const label = entry.label || mode;
    const duration = positiveInt(entry.duration, 0);

    try {
      dbRun(`INSERT INTO challenge_user_mode_stats (
          user_key, user_display, mode, label,
          requested_count, queued_count, started_count, finished_count, total_duration_seconds, updated_at
        ) VALUES (?, ?, ?, ?, 0, 0, 0, 0, 0, ?)
        ON CONFLICT(user_key, mode) DO UPDATE SET
          user_display = excluded.user_display,
          label = excluded.label,
          updated_at = excluded.updated_at`,
        [userKey, userDisplay, mode, label, now]);

      if (event === "requested") {
        dbRun(`UPDATE challenge_user_mode_stats
          SET requested_count = requested_count + 1,
              updated_at = ?
          WHERE user_key = ? AND mode = ?`, [now, userKey, mode]);
      } else if (event === "queued") {
        dbRun(`UPDATE challenge_user_mode_stats
          SET queued_count = queued_count + 1,
              updated_at = ?
          WHERE user_key = ? AND mode = ?`, [now, userKey, mode]);
      } else if (event === "started") {
        dbRun(`UPDATE challenge_user_mode_stats
          SET started_count = started_count + 1,
              updated_at = ?
          WHERE user_key = ? AND mode = ?`, [now, userKey, mode]);
      } else if (event === "finished") {
        dbRun(`UPDATE challenge_user_mode_stats
          SET finished_count = finished_count + 1,
              total_duration_seconds = total_duration_seconds + ?,
              updated_at = ?
          WHERE user_key = ? AND mode = ?`, [duration, now, userKey, mode]);
      }

      const statsCfg = runtime.config.stats || {};
      if (statsCfg.keepRuntimeEvents !== false) {
        dbRun(`INSERT INTO challenge_runtime_events
          (event_type, challenge_id, mode, label, user_key, user_display, duration_seconds, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [event, entry.id || null, mode, label, userKey, userDisplay, duration, now]);
      }
    } catch (err) {
      console.warn(`[${MODULE}] stats record failed:`, err.message);
    }
  }

  function dbRun(sql, params = []) {
    if (!sqlite) return null;
    if (Array.isArray(params)) {
      if (params.length === 0 && typeof sqlite.run === "function") return sqlite.run(sql);
      if (typeof sqlite.getDb === "function") return sqlite.getDb().prepare(sql).run(...params);
    }
    if (typeof sqlite.run !== "function") return null;
    return sqlite.run(sql, params || {});
  }

  function dbAll(sql, params = []) {
    if (!sqlite) return [];
    let rows = [];
    if (Array.isArray(params)) {
      if (params.length === 0 && typeof sqlite.all === "function") rows = sqlite.all(sql);
      else if (typeof sqlite.getDb === "function") rows = sqlite.getDb().prepare(sql).all(...params);
    } else if (typeof sqlite.all === "function") {
      rows = sqlite.all(sql, params || {});
    }
    return Array.isArray(rows) ? rows : [];
  }

  function dbGet(sql, params = []) {
    if (!sqlite) return null;
    let row = null;
    if (Array.isArray(params)) {
      if (params.length === 0 && typeof sqlite.get === "function") row = sqlite.get(sql);
      else if (typeof sqlite.getDb === "function") row = sqlite.getDb().prepare(sql).get(...params);
    } else if (typeof sqlite.get === "function") {
      row = sqlite.get(sql, params || {});
    }
    return row || null;
  }

  function normalizeUserKey(value) {
    return String(value || "")
      .trim()
      .replace(/^@+/, "")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");
  }

  function getDelayBetweenChallengesMs() {
    const timing = runtime.config.timing || {};
    const defaults = runtime.config.defaults || {};
    const raw = timing.delayBetweenChallengesMs !== undefined
      ? timing.delayBetweenChallengesMs
      : defaults.delayBetweenChallengesMs;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.min(n, 60000);
  }

  function getChatBool(key, fallback) {
    const chat = runtime.config.chat || {};
    if (chat[key] !== undefined) return chat[key] !== false;

    const legacy = {
      sendQueuedMessage: runtime.config.defaults && runtime.config.defaults.sendQueuedMessage,
      sendStartedMessage: runtime.config.defaults && runtime.config.defaults.sendStartedMessage,
      sendFinishedMessage: runtime.config.defaults && runtime.config.defaults.sendFinishedMessage
    };
    if (legacy[key] !== undefined) return legacy[key] !== false;

    return fallback !== false;
  }

  function sendTwitchChatMessage(message, event, entry) {
    const chat = runtime.config.chat || {};
    if (chat.enabled === false) return;
    const text = String(message || "").trim();
    if (!text) return;

    if (!twitchPresence || typeof twitchPresence.sendChatMessage !== "function") {
      console.warn(`[${MODULE}] twitch chat send skipped: twitch_presence sendChatMessage not available`);
      return;
    }

    Promise.resolve(twitchPresence.sendChatMessage(text, {
      trigger: `challenge:${event}`,
      challengeId: entry && entry.id,
      mode: entry && entry.mode
    })).then((result) => {
      if (!result || result.ok) return;
      if (chat.failSilently === false) {
        console.warn(`[${MODULE}] twitch chat send failed:`, result.error || result);
      }
    }).catch((err) => {
      if (chat.failSilently === false) {
        console.warn(`[${MODULE}] twitch chat send error:`, err.message);
      }
    });
  }

  function playDiscordSoundFor(entry) {
    const cfg = runtime.config.discordSound || {};
    if (cfg.enabled === false || entry.discordSoundEnabled === false || !entry.discordSoundKey) return;

    try {
      const base = String(cfg.baseUrl || "http://127.0.0.1:8080").replace(/\/+$/, "");
      const path = String(cfg.path || "/discord/play").startsWith("/") ? cfg.path : `/${cfg.path}`;
      const url = new URL(base + path);
      url.searchParams.set("key", entry.discordSoundKey);
      if (cfg.authQueryName && cfg.authQueryValue) {
        url.searchParams.set(String(cfg.authQueryName), String(cfg.authQueryValue));
      }

      const client = url.protocol === "https:" ? https : http;
      const req = client.get(url, (res) => {
        res.resume();
      });
      req.setTimeout(positiveInt(cfg.timeoutMs, 2500), () => req.destroy());
      req.on("error", (err) => console.warn(`[${MODULE}] discord sound failed:`, err.message));
    } catch (err) {
      console.warn(`[${MODULE}] discord sound error:`, err.message);
    }
  }

  function pickMessage(pathParts, context) {
    const parts = Array.isArray(pathParts) ? pathParts : [pathParts];
    let node = runtime.messages && runtime.messages.responses;
    for (const part of parts) {
      if (!node || typeof node !== "object") break;
      node = node[part];
    }

    const list = Array.isArray(node) ? node : [];
    const template = list.length > 0 ? list[Math.floor(Math.random() * list.length)] : "";
    return render(template, context || {});
  }

  function render(template, context) {
    let text = String(template || "");
    try {
      if (messagesHelper && typeof messagesHelper.replacePlaceholders === "function") {
        return messagesHelper.replacePlaceholders(text, context);
      }
    } catch (_) {}

    return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => {
      const value = context[key];
      return value === undefined || value === null ? "" : String(value);
    });
  }

  function placeholders(entry, extra = {}) {
    return {
      id: entry.id || "",
      mode: entry.mode || "",
      label: entry.label || entry.mode || "",
      displayTitle: entry.displayTitle || entry.label || entry.mode || "",
      icon: entry.icon || "",
      user: entry.user || "Unbekannt",
      duration: entry.duration || 0,
      durationText: formatDuration(entry.duration || 0),
      queueLength: state.queue.length,
      ...extra
    };
  }

  function formatDuration(seconds) {
    const s = positiveInt(seconds, 0);
    const m = Math.floor(s / 60);
    const rest = s % 60;
    if (m > 0 && rest > 0) return `${m} Min. ${rest} Sek.`;
    if (m > 0) return `${m} Min.`;
    return `${rest} Sek.`;
  }

  function respond(req, res, status, payload) {
    const plain = truthy(getParam(req, "plain", "0"));
    if (plain) {
      const msg = payload.chatMessage || (payload.ok ? "OK" : payload.error || "Fehler");
      return res.status(status).type("text/plain").send(msg);
    }
    return res.status(status).json(payload);
  }

  function getParam(req, name, fallback) {
    try {
      return core.getParam(req, name, fallback);
    } catch (_) {
      if (req.query && req.query[name] !== undefined) return req.query[name];
      if (req.body && req.body[name] !== undefined) return req.body[name];
      return fallback;
    }
  }

  function positiveInt(value, fallback) {
    try {
      const n = core.intParam ? core.intParam(value, fallback) : parseInt(value, 10);
      return Number.isFinite(n) && n > 0 ? n : fallback;
    } catch (_) {
      const n = parseInt(value, 10);
      return Number.isFinite(n) && n > 0 ? n : fallback;
    }
  }

  function cleanUser(value) {
    const user = String(value || "Unbekannt").trim();
    return user || "Unbekannt";
  }

  function truthy(value) {
    return /^(1|true|yes|ja|on)$/i.test(String(value || "").trim());
  }

  function touch(event) {
    state.lastEvent = event;
    state.updatedAt = new Date().toISOString();
  }

  function registerGet(appRef, path, handler) {
    if (routes && typeof routes.registerGet === "function") {
      try {
        routes.registerGet(appRef, path, handler);
        return;
      } catch (_) {}
    }
    appRef.get(path, handler);
  }

  function registerPost(appRef, path, handler) {
    if (routes && typeof routes.registerPost === "function") {
      try {
        routes.registerPost(appRef, path, handler);
        return;
      } catch (_) {}
    }
    appRef.post(path, handler);
  }
};
