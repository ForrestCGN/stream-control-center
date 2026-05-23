"use strict";

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const core = require("./helpers/helper_core");
const configHelper = require("./helpers/helper_config");
const database = require("../core/database");
const twitch = require("./twitch");
const twitchPresence = require("./twitch_presence");

const MODULE_NAME = "clip_shoutout";
const CONFIG_FILE = "clip_system.json";
const API_PREFIX = "/api/clip-shoutout";

const DEFAULT_CONFIG = {
  clipShoutout: {
    enabled: true,
    command: "vso",
    aliases: ["clipso", "videoso"],
    permissionLevel: "mod",
    cooldownGlobalMs: 5000,
    cooldownUserMs: 15000,
    maxClipDurationSeconds: 30,
    clipLookbackDays: 365,
    clipFetchFirst: 20,
    randomPick: true,
    minViewCount: 0,
    allowBroadcasterSelfTarget: true,
    cacheDownloadedClips: true,
    downloadDir: "htdocs/assets/sounds/clip_shoutout",
    publicSoundFilePrefix: "clip_shoutout",
    soundBundleUrl: "http://127.0.0.1:8080/api/sound/bundle",
    soundCategory: "vip",
    soundSource: "clip_shoutout",
    soundPriority: 60,
    soundVolume: 100,
    sendChatMessage: true,
    chatMessage: "📺 Video-Shoutout für @{displayName}! Schaut gerne vorbei: https://twitch.tv/{login}",
    ttsAfterClipEnabled: false,
    ttsText: "Schaut gerne mal bei {displayName} vorbei.",
    ttsSynthesizeUrl: "http://127.0.0.1:8080/api/tts/synthesize",
    ttsVoice: "",
    ttsVolume: 100,
    ttsPriorityOffset: 0,
    ttsCategory: "tts",
    ttsSource: "clip_shoutout_tts",
    overlaySubline: "🧓 Altersheim-TV",
    gqlClientId: "kimne78kx3ncx6brgo4mv6wki5h1ko"
  }
};

const state = {
  loadedAt: core.nowIso(),
  configPath: "",
  configOk: false,
  configError: "",
  registeredCommand: false,
  lastRunAt: "",
  lastRun: null,
  lastError: "",
  stats: {
    requested: 0,
    queued: 0,
    failed: 0,
    noClips: 0,
    ttsPrepared: 0,
    chatSent: 0
  }
};

let appToken = null;
let appTokenExpiresAt = 0;

function nowIso() {
  return core.nowIso();
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function mergePlain(base, extra) {
  const out = { ...(base || {}) };
  if (!isPlainObject(extra)) return out;
  for (const [key, value] of Object.entries(extra)) {
    if (isPlainObject(value) && isPlainObject(out[key])) out[key] = mergePlain(out[key], value);
    else if (Array.isArray(value)) out[key] = value.slice();
    else out[key] = value;
  }
  return out;
}

function boolParam(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  const v = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "ja", "on", "y"].includes(v)) return true;
  if (["0", "false", "no", "nein", "off", "n"].includes(v)) return false;
  return fallback;
}

function intParam(value, fallback, min, max) {
  const n = Number.parseInt(value, 10);
  const clean = Number.isFinite(n) ? n : fallback;
  return Math.max(min, Math.min(max, clean));
}

function cleanLogin(value) {
  return String(value || "").trim().replace(/^@+/, "").toLowerCase();
}

function cleanDisplay(value, fallback = "") {
  return String(value || fallback || "").trim().replace(/^@+/, "");
}

function loadConfig() {
  const loaded = configHelper.loadConfig(CONFIG_FILE, DEFAULT_CONFIG, { createIfMissing: true, mergeDefaults: true, spaces: 2 });
  const cfg = mergePlain(DEFAULT_CONFIG, loaded.config || {});
  state.configPath = loaded.path || "";
  state.configOk = !!loaded.ok;
  state.configError = loaded.error || "";
  return cfg;
}

function shoutoutConfig() {
  return mergePlain(DEFAULT_CONFIG.clipShoutout, (loadConfig().clipShoutout || {}));
}

function resolveRootPath(inputPath) {
  const raw = String(inputPath || "").trim();
  if (!raw) return configHelper.resolveFromRoot("htdocs", "assets", "sounds", "clip_shoutout");
  if (path.isAbsolute(raw)) return raw;
  return configHelper.resolveFromRoot(raw);
}

function browserFileForDownload(cfg, fileName) {
  const prefix = String(cfg.publicSoundFilePrefix || "clip_shoutout").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  return `${prefix}/${fileName}`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function safeFilePart(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9_.-]+/g, "_").replace(/^_+|_+$/g, "") || "clip";
}

function renderTemplate(template, vars) {
  return String(template || "").replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => {
    const value = vars && Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : "";
    return String(value ?? "");
  });
}

function readRequestData(req) {
  const body = req && req.body && typeof req.body === "object" ? req.body : {};
  const query = req && req.query && typeof req.query === "object" ? req.query : {};
  return { ...query, ...body };
}

function firstString(...values) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
}

function parseTarget(input = {}) {
  const args = Array.isArray(input.args) ? input.args : [];
  const rawInput = firstString(input.target, input.login, input.channel, input.input0, args[0], input.rawInput, input.input, input.text, input.message);
  const parts = String(rawInput || "").trim().split(/\s+/).filter(Boolean);
  let candidate = parts[0] || "";
  if (candidate && ["vso", "!vso", "clipso", "!clipso", "videoso", "!videoso"].includes(candidate.toLowerCase())) {
    candidate = parts[1] || "";
  }
  return cleanLogin(candidate);
}

async function getAppAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  if (appToken && appTokenExpiresAt && now < appTokenExpiresAt - 60) return appToken;

  const clientId = String(env.TWITCH_CLIENT_ID || "").trim();
  const clientSecret = String(env.TWITCH_CLIENT_SECRET || "").trim();
  if (!clientId || !clientSecret) throw new Error("missing_twitch_client_credentials");

  const response = await axios.post("https://id.twitch.tv/oauth2/token", null, {
    params: {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials"
    },
    timeout: 10000
  });

  appToken = response.data && response.data.access_token ? String(response.data.access_token) : "";
  appTokenExpiresAt = now + Number(response.data && response.data.expires_in || 0);
  if (!appToken) throw new Error("twitch_app_token_empty");
  return appToken;
}

async function helixGet(env, pathname, params = {}) {
  const token = await getAppAccessToken(env);
  const clientId = String(env.TWITCH_CLIENT_ID || "").trim();
  const url = new URL("https://api.twitch.tv/helix" + pathname);
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && String(value) !== "") url.searchParams.set(key, String(value));
  }
  const response = await axios.get(url.toString(), {
    timeout: 10000,
    headers: {
      "Client-ID": clientId,
      "Authorization": `Bearer ${token}`
    }
  });
  return response.data || {};
}

async function listClipsForBroadcaster(env, broadcasterId, cfg) {
  const first = intParam(cfg.clipFetchFirst, 20, 1, 100);
  const startedAt = new Date(Date.now() - Math.max(1, Number(cfg.clipLookbackDays || 365)) * 24 * 60 * 60 * 1000).toISOString();
  const data = await helixGet(env, "/clips", {
    broadcaster_id: broadcasterId,
    first,
    started_at: startedAt
  });
  let rows = Array.isArray(data.data) ? data.data : [];
  const minViewCount = Number(cfg.minViewCount || 0);
  if (minViewCount > 0) rows = rows.filter(row => Number(row.view_count || 0) >= minViewCount);
  return rows;
}

function pickClip(clips, cfg) {
  if (!Array.isArray(clips) || !clips.length) return null;
  if (cfg.randomPick === false) return clips[0];
  const index = Math.floor(Math.random() * clips.length);
  return clips[index] || clips[0];
}

async function resolveClipPlaybackUrl(clipId, cfg) {
  const response = await axios.post("https://gql.twitch.tv/gql", {
    operationName: "VideoAccessToken_Clip",
    variables: { slug: String(clipId || "") },
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: "36b89d2507fce29e5ca551df756d27c1cfe079e2609642b4390aa4c35796eb11"
      }
    }
  }, {
    timeout: 10000,
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
      "Client-ID": String(cfg.gqlClientId || DEFAULT_CONFIG.clipShoutout.gqlClientId)
    }
  });

  const clip = response.data && response.data.data ? response.data.data.clip : null;
  if (!clip) throw new Error("clip_playback_missing");
  const qualities = Array.isArray(clip.videoQualities) ? clip.videoQualities.slice() : [];
  if (!qualities.length) throw new Error("clip_playback_no_qualities");
  qualities.sort((a, b) => Number(b.quality || 0) - Number(a.quality || 0));
  const best = qualities[0];
  const token = clip.playbackAccessToken || {};
  if (!best || !best.sourceURL || !token.signature || !token.value) throw new Error("clip_playback_incomplete");
  return `${best.sourceURL}?sig=${encodeURIComponent(token.signature)}&token=${encodeURIComponent(token.value)}`;
}

async function downloadClipToSoundAssets(playbackUrl, clip, targetUser, cfg) {
  const outDir = resolveRootPath(cfg.downloadDir);
  ensureDir(outDir);
  const fileName = `${safeFilePart(targetUser.login)}_${safeFilePart(clip.id)}.mp4`;
  const outFile = path.join(outDir, fileName);
  const relativeSoundFile = browserFileForDownload(cfg, fileName);

  if (cfg.cacheDownloadedClips !== false && fs.existsSync(outFile) && fs.statSync(outFile).size > 0) {
    return { file: outFile, soundSystemFile: relativeSoundFile, cached: true };
  }

  const response = await axios.get(playbackUrl, { responseType: "stream", timeout: 30000 });
  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outFile);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
    response.data.on("error", reject);
  });

  return { file: outFile, soundSystemFile: relativeSoundFile, cached: false };
}

async function postJson(url, payload, timeoutMs = 15000) {
  const response = await axios.post(url, payload || {}, {
    timeout: timeoutMs,
    headers: { "Content-Type": "application/json" }
  });
  return response.data || {};
}

async function prepareOptionalTts(input, cfg, vars) {
  const enabled = boolParam(input.tts ?? input.withTts ?? input.ttsAfterClip, cfg.ttsAfterClipEnabled);
  if (!enabled) return null;

  const text = renderTemplate(firstString(input.ttsText, cfg.ttsText), vars).trim();
  if (!text) return null;

  const payload = {
    text,
    message: text,
    input: text,
    source: "clip_shoutout",
    mode: "clip_shoutout",
    user: firstString(input.userLogin, input.login, vars.requestedByLogin, "clip_shoutout"),
    displayName: firstString(input.displayName, input.userName, vars.requestedByDisplay, "Clip-Shoutout"),
    voice: firstString(input.ttsVoice, cfg.ttsVoice),
    meta: {
      clipShoutout: true,
      targetLogin: vars.login,
      targetDisplayName: vars.displayName,
      clipId: vars.clipId
    }
  };

  const result = await postJson(cfg.ttsSynthesizeUrl, payload, 60000);
  if (!result || result.ok === false || !result.soundSystemFile) {
    throw new Error(`tts_prepare_failed:${result && (result.reason || result.error) || "unknown"}`);
  }
  state.stats.ttsPrepared += 1;
  return {
    role: "tts",
    file: result.soundSystemFile,
    label: `Clip-Shoutout TTS @${vars.displayName}`,
    category: cfg.ttsCategory || "tts",
    source: cfg.ttsSource || "clip_shoutout_tts",
    outputTarget: "overlay",
    target: "stream",
    volume: Number(cfg.ttsVolume || 100),
    priorityOffset: Number(cfg.ttsPriorityOffset || 0),
    durationMs: Number(result.durationMs || 0),
    queueIfBusy: true,
    canInterrupt: false,
    canBeInterrupted: true,
    meta: {
      clipShoutout: true,
      tts: true,
      ttsId: result.id || "",
      targetLogin: vars.login,
      targetDisplayName: vars.displayName,
      clipId: vars.clipId
    },
    visual: {
      module: "tts_overlay",
      type: "clip_shoutout_tts",
      displayName: vars.displayName,
      login: vars.login,
      text,
      title: "Video-Shoutout",
      source: "clip_shoutout"
    }
  };
}

function buildBundlePayload(cfg, vars, downloaded, clip, targetUser, ttsItem) {
  const maxDurationMs = Math.max(5000, Math.min(60000, Number(cfg.maxClipDurationSeconds || 30) * 1000));
  const clipDurationMs = Math.max(5000, Math.min(maxDurationMs, Math.round(Number(clip.duration || 0) * 1000) || maxDurationMs));
  const bundleId = `clipso_${Date.now()}_${safeFilePart(targetUser.login)}_${safeFilePart(clip.id)}`;

  const items = [{
    role: "clip",
    file: downloaded.soundSystemFile,
    label: `Video-Shoutout @${targetUser.displayName}`,
    category: cfg.soundCategory || "vip",
    source: cfg.soundSource || "clip_shoutout",
    mediaType: "video",
    type: "video",
    hasAudio: true,
    hasVideo: true,
    outputTarget: "overlay",
    target: "stream",
    volume: Number(cfg.soundVolume || 100),
    priority: Number(cfg.soundPriority || 60),
    durationMs: clipDurationMs,
    queueIfBusy: true,
    dropIfBusy: false,
    canInterrupt: false,
    canBeInterrupted: true,
    parallelAllowed: false,
    meta: {
      clipShoutout: true,
      targetLogin: targetUser.login,
      targetDisplayName: targetUser.displayName,
      clipId: clip.id,
      clipUrl: clip.url || "",
      twitchClipDurationMs: Math.round(Number(clip.duration || 0) * 1000) || 0,
      cached: downloaded.cached
    },
    visual: {
      module: "clip_shoutout",
      layout: "vip30",
      displayName: targetUser.displayName,
      login: targetUser.login,
      user: targetUser.displayName,
      avatarUrl: targetUser.avatarUrl || "",
      clipTitle: clip.title || "",
      clipUrl: clip.url || "",
      gameName: clip.game_id || "",
      subline: cfg.overlaySubline || "🧓 Altersheim-TV",
      durationMs: clipDurationMs
    }
  }];

  if (ttsItem) items.push(ttsItem);

  return {
    bundleId,
    bundleType: "clip_shoutout",
    priority: Number(cfg.soundPriority || 60),
    locked: true,
    source: "clip_shoutout",
    requestedBy: vars.requestedByLogin || vars.requestedByDisplay || "",
    meta: {
      clipShoutout: true,
      targetLogin: targetUser.login,
      targetDisplayName: targetUser.displayName,
      clipId: clip.id
    },
    items
  };
}

async function sendChatMessage(message, meta) {
  if (!message) return { ok: false, skipped: true, reason: "empty_message" };
  if (!twitchPresence || typeof twitchPresence.sendChatMessage !== "function") {
    return { ok: false, skipped: true, reason: "twitch_presence_unavailable" };
  }
  const result = await twitchPresence.sendChatMessage(message, { trigger: "clip-shoutout", module: MODULE_NAME, ...(meta || {}) });
  if (result && result.ok) state.stats.chatSent += 1;
  return result;
}

function ensureCommandSchema() {
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
}

function registerCommand(cfg) {
  try {
    ensureCommandSchema();
    const trigger = cleanLogin(cfg.command || "vso") || "vso";
    const now = nowIso();
    const existing = database.get("SELECT id FROM command_definitions WHERE trigger = :trigger", { trigger });
    if (existing && existing.id) {
      state.registeredCommand = true;
      return { ok: true, existing: true, trigger };
    }

    database.run(`
      INSERT INTO command_definitions (
        trigger, aliases_json, module_key, action_key, target_method, target_url,
        enabled, permission_level, cooldown_global_ms, cooldown_user_ms, live_only,
        response_mode, config_json, created_at, updated_at
      ) VALUES (
        :trigger, :aliasesJson, :moduleKey, :actionKey, :targetMethod, :targetUrl,
        1, :permissionLevel, :cooldownGlobalMs, :cooldownUserMs, 0,
        'module', :configJson, :createdAt, :updatedAt
      )
    `, {
      trigger,
      aliasesJson: JSON.stringify(Array.isArray(cfg.aliases) ? cfg.aliases.map(cleanLogin).filter(Boolean) : []),
      moduleKey: MODULE_NAME,
      actionKey: "run",
      targetMethod: "POST",
      targetUrl: `${API_PREFIX}/run`,
      permissionLevel: String(cfg.permissionLevel || "mod").toLowerCase(),
      cooldownGlobalMs: Number(cfg.cooldownGlobalMs || 5000),
      cooldownUserMs: Number(cfg.cooldownUserMs || 15000),
      configJson: JSON.stringify({ seededBy: "STEP277A", rawInputMode: true }),
      createdAt: now,
      updatedAt: now
    });

    state.registeredCommand = true;
    return { ok: true, created: true, trigger };
  } catch (err) {
    state.registeredCommand = false;
    state.lastError = err.message || String(err);
    return { ok: false, error: state.lastError };
  }
}

async function handleRun(req, res, env) {
  const cfg = shoutoutConfig();
  const input = readRequestData(req);
  state.stats.requested += 1;

  if (cfg.enabled === false) {
    return res.status(503).json({ ok: false, error: "clip_shoutout_disabled" });
  }

  const targetLogin = parseTarget(input);
  if (!targetLogin) {
    return res.status(400).json({ ok: false, error: "target_required", usage: `!${cfg.command || "vso"} @kanal` });
  }

  try {
    const targetUserRaw = await twitch.resolveUserByLogin(targetLogin);
    if (!targetUserRaw || !targetUserRaw.userId) {
      return res.status(404).json({ ok: false, error: "target_user_not_found", targetLogin });
    }

    const targetUser = {
      userId: String(targetUserRaw.userId),
      login: cleanLogin(targetUserRaw.login || targetLogin),
      displayName: cleanDisplay(targetUserRaw.displayName || targetLogin, targetLogin),
      avatarUrl: String(targetUserRaw.profileImageUrl || targetUserRaw.profile_image_url || "")
    };

    const clips = await listClipsForBroadcaster(env, targetUser.userId, cfg);
    if (!clips.length) {
      state.stats.noClips += 1;
      return res.status(404).json({ ok: false, error: "no_clips_found", target: targetUser });
    }

    const clip = pickClip(clips, cfg);
    const playbackUrl = await resolveClipPlaybackUrl(clip.id, cfg);
    const downloaded = await downloadClipToSoundAssets(playbackUrl, clip, targetUser, cfg);

    const vars = {
      login: targetUser.login,
      displayName: targetUser.displayName,
      user: targetUser.displayName,
      url: `https://twitch.tv/${targetUser.login}`,
      twitchUrl: `https://twitch.tv/${targetUser.login}`,
      clipUrl: clip.url || "",
      clipTitle: clip.title || "",
      clipId: clip.id || "",
      requestedByLogin: cleanLogin(input.userLogin || input.login || input.user || ""),
      requestedByDisplay: cleanDisplay(input.displayName || input.userName || input.user || "")
    };

    const ttsItem = await prepareOptionalTts(input, cfg, vars);
    const bundlePayload = buildBundlePayload(cfg, vars, downloaded, clip, targetUser, ttsItem);
    const soundResult = await postJson(cfg.soundBundleUrl, bundlePayload, 15000);

    let chatResult = { ok: false, skipped: true, reason: "disabled" };
    if (boolParam(input.sendChat, cfg.sendChatMessage)) {
      const chatText = renderTemplate(cfg.chatMessage, vars).trim();
      chatResult = await sendChatMessage(chatText, { targetLogin: targetUser.login, clipId: clip.id });
    }

    state.stats.queued += 1;
    state.lastRunAt = nowIso();
    state.lastRun = {
      target: targetUser,
      clip: { id: clip.id, title: clip.title || "", url: clip.url || "", duration: clip.duration || 0 },
      bundleId: bundlePayload.bundleId,
      ttsEnabled: Boolean(ttsItem),
      queuedAt: state.lastRunAt
    };
    state.lastError = "";

    return res.json({
      ok: true,
      module: MODULE_NAME,
      target: targetUser,
      clip: {
        id: clip.id,
        title: clip.title || "",
        url: clip.url || "",
        duration: clip.duration || 0,
        viewCount: clip.view_count || 0
      },
      downloaded: {
        cached: downloaded.cached,
        soundSystemFile: downloaded.soundSystemFile
      },
      tts: ttsItem ? { enabled: true, file: ttsItem.file, durationMs: ttsItem.durationMs } : { enabled: false },
      bundle: {
        id: bundlePayload.bundleId,
        itemCount: bundlePayload.items.length,
        soundResult
      },
      chat: chatResult
    });
  } catch (err) {
    const error = err && err.message ? err.message : String(err);
    state.stats.failed += 1;
    state.lastError = error;
    state.lastRunAt = nowIso();
    state.lastRun = { targetLogin, error, failedAt: state.lastRunAt };
    return res.status(500).json({ ok: false, module: MODULE_NAME, error, targetLogin });
  }
}

module.exports.init = function init(ctx) {
  const { app, env } = ctx;
  const cfg = shoutoutConfig();
  registerCommand(cfg);

  app.get(`${API_PREFIX}/status`, (req, res) => {
    const currentCfg = shoutoutConfig();
    const command = cleanLogin(currentCfg.command || "vso") || "vso";
    res.json({
      ok: true,
      module: MODULE_NAME,
      version: 1,
      step: "STEP277A",
      enabled: currentCfg.enabled !== false,
      registeredCommand: state.registeredCommand,
      command,
      aliases: currentCfg.aliases || [],
      routes: [
        { method: "GET", path: `${API_PREFIX}/status` },
        { method: "GET/POST", path: `${API_PREFIX}/run` },
        { method: "GET/POST", path: "/api/clip/shoutout" }
      ],
      config: {
        maxClipDurationSeconds: currentCfg.maxClipDurationSeconds,
        ttsAfterClipEnabled: currentCfg.ttsAfterClipEnabled,
        soundBundleUrl: currentCfg.soundBundleUrl,
        soundCategory: currentCfg.soundCategory,
        soundPriority: currentCfg.soundPriority
      },
      state
    });
  });

  app.get(`${API_PREFIX}/run`, (req, res) => handleRun(req, res, env));
  app.post(`${API_PREFIX}/run`, (req, res) => handleRun(req, res, env));
  app.get("/api/clip/shoutout", (req, res) => handleRun(req, res, env));
  app.post("/api/clip/shoutout", (req, res) => handleRun(req, res, env));

  console.log(`[${MODULE_NAME}] loaded: ${API_PREFIX}/run, /api/clip/shoutout`);
};
