"use strict";

const fs = require("fs");
const https = require("https");

const DEFAULT_TOKEN_PATH = "D:/Streaming/stramAssets/secrets/tokens/twitch_user.json";
const DEFAULT_BROADCASTER_ID = "127709954";
const DEFAULT_CACHE_MS = 10 * 60 * 1000;

const cache = new Map();

function normalizeLogin(value) {
  return String(value || "").trim().replace(/^@/, "").toLowerCase();
}

function cleanString(value) {
  return String(value || "").trim();
}

function getCacheMs() {
  const raw = Number(process.env.VIP_TWITCH_ROLE_CACHE_MS || process.env.TWITCH_ROLE_CACHE_MS || DEFAULT_CACHE_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_CACHE_MS;
}

function getTokenPath() {
  return cleanString(process.env.VIP_TWITCH_USER_TOKEN_PATH || process.env.TWITCH_USER_TOKEN_PATH || DEFAULT_TOKEN_PATH);
}

function getBroadcasterId() {
  return cleanString(process.env.TWITCH_BROADCASTER_ID || process.env.BROADCASTER_ID || DEFAULT_BROADCASTER_ID);
}

function getClientId() {
  return cleanString(process.env.TWITCH_CLIENT_ID || process.env.CLIENT_ID || "");
}

function readStoredUserToken() {
  const tokenPath = getTokenPath();
  if (!tokenPath || !fs.existsSync(tokenPath)) return null;

  try {
    const parsed = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_) {
    return null;
  }
}

function readUserAccessToken() {
  const parsed = readStoredUserToken();
  return cleanString(parsed && (parsed.access_token || parsed.accessToken));
}

function tokenStatus(options = {}) {
  const tokenPath = cleanString(options.tokenPath || getTokenPath());
  const parsed = readStoredUserToken();
  const expiresAt = Number(parsed && parsed.expires_at || 0);
  const now = Math.floor(Date.now() / 1000);
  return {
    ok: !!(parsed && (parsed.access_token || parsed.accessToken)),
    tokenPath,
    present: !!parsed,
    hasAccessToken: !!(parsed && (parsed.access_token || parsed.accessToken)),
    hasRefreshToken: !!(parsed && (parsed.refresh_token || parsed.refreshToken)),
    expiresAt: expiresAt || null,
    expiresIn: expiresAt ? expiresAt - now : null,
    expired: expiresAt ? expiresAt <= now : false,
    clientIdPresent: !!cleanString(options.clientId || getClientId()),
    broadcasterId: cleanString(options.broadcasterId || getBroadcasterId())
  };
}

function httpGetJson(url, headers) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);

    const req = https.request({
      method: "GET",
      hostname: target.hostname,
      path: `${target.pathname}${target.search}`,
      headers: headers || {},
      timeout: 7000
    }, (res) => {
      let raw = "";
      res.setEncoding("utf8");
      res.on("data", chunk => { raw += chunk; });
      res.on("end", () => {
        let json = null;
        try { json = raw ? JSON.parse(raw) : null; } catch (_) { json = null; }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          const err = new Error(`twitch_http_${res.statusCode}`);
          err.statusCode = res.statusCode;
          err.response = json || raw;
          return reject(err);
        }

        resolve(json || {});
      });
    });

    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("twitch_request_timeout")));
    req.end();
  });
}

function buildHeaders(clientId, accessToken) {
  return {
    "Client-ID": clientId,
    "Authorization": `Bearer ${accessToken}`
  };
}

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() >= entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function cacheSet(key, value) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + getCacheMs()
  });
}

async function resolveUserId(login, headers) {
  const normalized = normalizeLogin(login);
  if (!normalized) return "";

  const key = `user:${normalized}`;
  const cached = cacheGet(key);
  if (cached !== undefined) return cached;

  const url = `https://api.twitch.tv/helix/users?login=${encodeURIComponent(normalized)}`;
  const json = await httpGetJson(url, headers);
  const user = Array.isArray(json.data) ? json.data[0] : null;
  const userId = cleanString(user && user.id);

  cacheSet(key, userId || "");
  return userId || "";
}

async function helixPaged(pathname, params = {}, options = {}) {
  const clientId = cleanString(options.clientId || getClientId());
  const broadcasterId = cleanString(options.broadcasterId || getBroadcasterId());
  const accessToken = cleanString(options.accessToken || readUserAccessToken());

  if (!clientId) throw new Error("missing_twitch_client_id");
  if (!accessToken) throw new Error("missing_twitch_user_token");
  if (!broadcasterId) throw new Error("missing_twitch_broadcaster_id");

  const headers = buildHeaders(clientId, accessToken);
  const rows = [];
  let after = "";
  let pages = 0;
  const maxPages = Math.max(1, Math.min(50, Number(options.maxPages || 20)));

  do {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params || {})) {
      if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
    }
    if (!search.has("broadcaster_id")) search.set("broadcaster_id", broadcasterId);
    if (!search.has("first")) search.set("first", String(options.first || 100));
    if (after) search.set("after", after);

    const json = await httpGetJson(`https://api.twitch.tv/helix${pathname}?${search.toString()}`, headers);
    if (Array.isArray(json.data)) rows.push(...json.data);
    after = cleanString(json.pagination && json.pagination.cursor);
    pages += 1;
  } while (after && pages < maxPages);

  return { rows, pages, hasMore: !!after, broadcasterId };
}

function mapVipUser(row = {}) {
  return {
    twitchUserId: cleanString(row.user_id || row.id),
    login: normalizeLogin(row.user_login || row.login),
    displayName: cleanString(row.user_name || row.display_name || row.user_login || row.login),
    isVip: true,
    isMod: false,
    source: "twitch_vip"
  };
}

function mapModeratorUser(row = {}) {
  return {
    twitchUserId: cleanString(row.user_id || row.id),
    login: normalizeLogin(row.user_login || row.login),
    displayName: cleanString(row.user_name || row.display_name || row.user_login || row.login),
    isVip: false,
    isMod: true,
    source: "twitch_mod"
  };
}

async function listChannelVips(options = {}) {
  const result = await helixPaged("/channels/vips", {}, options);
  return {
    ok: true,
    type: "vips",
    broadcasterId: result.broadcasterId,
    count: result.rows.length,
    pages: result.pages,
    hasMore: result.hasMore,
    rows: result.rows.map(mapVipUser).filter(row => row.login)
  };
}

async function listChannelModerators(options = {}) {
  const result = await helixPaged("/moderation/moderators", {}, options);
  return {
    ok: true,
    type: "moderators",
    broadcasterId: result.broadcasterId,
    count: result.rows.length,
    pages: result.pages,
    hasMore: result.hasMore,
    rows: result.rows.map(mapModeratorUser).filter(row => row.login)
  };
}

async function isTargetModerator(login, options = {}) {
  const targetLogin = normalizeLogin(login);
  if (!targetLogin) return null;

  const clientId = cleanString(options.clientId || getClientId());
  const broadcasterId = cleanString(options.broadcasterId || getBroadcasterId());
  const accessToken = cleanString(options.accessToken || readUserAccessToken());

  if (!clientId || !broadcasterId || !accessToken) return null;

  const cacheKey = `moderator:${broadcasterId}:${targetLogin}`;
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const headers = buildHeaders(clientId, accessToken);
    const targetUserId = await resolveUserId(targetLogin, headers);
    if (!targetUserId) {
      cacheSet(cacheKey, false);
      return false;
    }

    const params = new URLSearchParams({
      broadcaster_id: broadcasterId,
      user_id: targetUserId
    });
    const url = `https://api.twitch.tv/helix/moderation/moderators?${params.toString()}`;
    const json = await httpGetJson(url, headers);
    const isModerator = Array.isArray(json.data) && json.data.length > 0;

    cacheSet(cacheKey, isModerator);
    return isModerator;
  } catch (_) {
    return null;
  }
}

function clearCache() {
  cache.clear();
}

module.exports = {
  isTargetModerator,
  listChannelVips,
  listChannelModerators,
  tokenStatus,
  clearCache,
  normalizeLogin
};
