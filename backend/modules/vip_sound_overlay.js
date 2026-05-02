"use strict";

const fs = require("fs");
const http = require("http");
const https = require("https");
const core = require("./helpers/helper_core");

module.exports.init = function init(ctx) {
  const { app, broadcastWS } = ctx;

  const MODULE_NAME = "vip_sound_overlay";
  const DEFAULT_INTRO_MS = 360;
  const DEFAULT_OUTRO_MS = 280;
  const DEFAULT_GAP_MS = 2000;
  const DEFAULT_PHASE = "idle";

  const webRoot = normalizeWinPath(
    process.env.VIP_OVERLAY_WEB_ROOT ||
    "d:\\Streaming\\stramAssets\\htdocs"
  );

  const userInfoBaseUrl =
    process.env.VIP_OVERLAY_USERINFO_URL ||
    "http://127.0.0.1:8080/userinfo?login=";

  const userInfoCache = new Map();

  const state = {
    version: "1.5.2",
    module: MODULE_NAME,
    overlay: emptyOverlay(),
    queue: [],
    isActive: false,
    lastFinishedAt: 0,
    updatedAt: new Date().toISOString(),
    client: {
      connected: false,
      lastSeenAt: 0
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

  function publicState() {
    return {
      ok: true,
      version: state.version,
      module: state.module,
      overlay: { ...state.overlay },
      queuedCount: state.queue.length,
      isActive: state.isActive,
      lastFinishedAt: state.lastFinishedAt,
      client: { ...state.client },
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

  function intOrDefault(v, d) {
    const n = core.intParam(v, d);
    return Number.isFinite(n) && n >= 0 ? n : d;
  }

  function normalizeWinPath(p) {
    return (p || "").replace(/\//g, "\\").toLowerCase();
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
    // Nur minimal hübscher machen: erster Buchstabe groß.
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

    // Self: Streamer.bot liefert im Regelfall schon den Chatter-Namen -> displayRaw priorisieren.
    // Target: wenn displayRaw nur klein ist, minimal hübsch machen.
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
      return res.json({
        ok: true,
        phase: state.overlay.phase,
        visible: state.overlay.visible,
        isActive: state.isActive,
        queuedCount: state.queue.length,
        requestId: state.overlay.requestId || "",
        lastFinishedAt: state.lastFinishedAt,
        client: { ...state.client },
        updatedAt: state.updatedAt
      });
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

  apiPrefixes.forEach(registerApiPrefix);

  console.log(`[${MODULE_NAME}] loaded`);
  console.log(`[${MODULE_NAME}] webRoot=${webRoot}`);
  console.log(`[${MODULE_NAME}] userInfoBaseUrl=${userInfoBaseUrl}`);
};
