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

function readUserAccessToken() {
  const tokenPath = getTokenPath();
  if (!tokenPath || !fs.existsSync(tokenPath)) return "";

  try {
    const parsed = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
    return cleanString(parsed.access_token || parsed.accessToken || "");
  } catch (_) {
    return "";
  }
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
  clearCache,
  normalizeLogin
};
