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

function normalizeTargetInput(target = {}) {
  if (typeof target === "string") {
    const clean = cleanString(target);
    if (/^\d+$/.test(clean)) return { userId: clean, login: "", displayName: "" };
    return { userId: "", login: normalizeLogin(clean), displayName: "" };
  }
  const raw = target && typeof target === "object" ? target : {};
  return {
    userId: cleanString(raw.userId || raw.user_id || raw.twitchUserId || raw.twitch_user_id || raw.id || ""),
    login: normalizeLogin(raw.userLogin || raw.user_login || raw.login || raw.userName || raw.user_name || raw.name || ""),
    displayName: cleanString(raw.userDisplayName || raw.user_display_name || raw.displayName || raw.display_name || raw.name || "")
  };
}

async function resolveUserIdentity(target, headers) {
  const normalized = normalizeTargetInput(target);
  if (normalized.userId) return normalized;

  const login = normalized.login;
  if (!login) return normalized;

  const key = `user:${login}`;
  const cached = cacheGet(key);
  if (cached !== undefined) {
    return { ...normalized, userId: cached || "" };
  }

  const url = `https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`;
  const json = await httpGetJson(url, headers);
  const user = Array.isArray(json.data) ? json.data[0] : null;
  const userId = cleanString(user && user.id);
  const displayName = cleanString(user && (user.display_name || user.login)) || normalized.displayName;

  cacheSet(key, userId || "");
  return {
    userId: userId || "",
    login: normalizeLogin(user && user.login || login),
    displayName
  };
}

async function resolveUserId(login, headers) {
  const identity = await resolveUserIdentity({ login }, headers);
  return identity.userId || "";
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

async function checkTargetRole(target, role, options = {}) {
  const clientId = cleanString(options.clientId || getClientId());
  const broadcasterId = cleanString(options.broadcasterId || getBroadcasterId());
  const accessToken = cleanString(options.accessToken || readUserAccessToken());

  if (!clientId || !broadcasterId || !accessToken) return null;

  try {
    const headers = buildHeaders(clientId, accessToken);
    const identity = await resolveUserIdentity(target, headers);
    if (!identity.userId && !identity.login) return false;
    if (!identity.userId) return false;

    const roleKey = role === "vip" ? "vip" : "moderator";
    const cacheKey = `${roleKey}:${broadcasterId}:${identity.userId || identity.login}`;
    const cached = cacheGet(cacheKey);
    if (cached !== undefined) return cached;

    const pathname = roleKey === "vip" ? "/channels/vips" : "/moderation/moderators";
    const params = new URLSearchParams({
      broadcaster_id: broadcasterId,
      user_id: identity.userId
    });
    const url = `https://api.twitch.tv/helix${pathname}?${params.toString()}`;
    const json = await httpGetJson(url, headers);
    const hasRole = Array.isArray(json.data) && json.data.length > 0;

    cacheSet(cacheKey, hasRole);
    return hasRole;
  } catch (_) {
    return null;
  }
}

async function isTargetModerator(target, options = {}) {
  return checkTargetRole(target, "moderator", options);
}

async function isTargetVip(target, options = {}) {
  return checkTargetRole(target, "vip", options);
}

async function getChannelUserRoleState(target, options = {}) {
  const clientId = cleanString(options.clientId || getClientId());
  const broadcasterId = cleanString(options.broadcasterId || getBroadcasterId());
  const broadcasterLogin = normalizeLogin(options.broadcasterLogin || process.env.TWITCH_BROADCASTER_LOGIN || process.env.TWITCH_CHANNEL_LOGIN || process.env.TWITCH_CHANNEL || "");
  const accessToken = cleanString(options.accessToken || readUserAccessToken());
  const checkedAt = new Date().toISOString();

  const fallbackIdentity = normalizeTargetInput(target);

  if (!clientId || !broadcasterId || !accessToken) {
    return {
      ok: false,
      source: "helper_twitch_roles",
      reason: "role_precheck_unavailable",
      blocker: !clientId ? "missing_twitch_client_id" : (!broadcasterId ? "missing_twitch_broadcaster_id" : "missing_twitch_user_token"),
      broadcasterId,
      broadcasterLogin,
      userId: fallbackIdentity.userId,
      userLogin: fallbackIdentity.login,
      userDisplayName: fallbackIdentity.displayName,
      isBroadcaster: Boolean(broadcasterId && fallbackIdentity.userId && broadcasterId === fallbackIdentity.userId) || Boolean(broadcasterLogin && fallbackIdentity.login && broadcasterLogin === fallbackIdentity.login),
      isModerator: false,
      isVip: false,
      canReceiveVip: false,
      checkedAt
    };
  }

  try {
    const headers = buildHeaders(clientId, accessToken);
    const identity = await resolveUserIdentity(target, headers);
    const userId = cleanString(identity.userId || fallbackIdentity.userId || "");
    const userLogin = normalizeLogin(identity.login || fallbackIdentity.login || "");
    const userDisplayName = cleanString(identity.displayName || fallbackIdentity.displayName || userLogin || userId);
    const isBroadcaster = Boolean(broadcasterId && userId && broadcasterId === userId) || Boolean(broadcasterLogin && userLogin && broadcasterLogin === userLogin);

    if (!userId && !userLogin) {
      return {
        ok: false,
        source: "helper_twitch_roles",
        reason: "missing_user",
        blocker: "missing_user",
        broadcasterId,
        broadcasterLogin,
        userId,
        userLogin,
        userDisplayName,
        isBroadcaster: false,
        isModerator: false,
        isVip: false,
        canReceiveVip: false,
        checkedAt
      };
    }

    if (isBroadcaster) {
      return {
        ok: true,
        source: "helper_twitch_roles",
        reason: "target_is_broadcaster",
        blocker: "target_is_broadcaster",
        broadcasterId,
        broadcasterLogin,
        userId,
        userLogin,
        userDisplayName,
        isBroadcaster: true,
        isModerator: false,
        isVip: false,
        canReceiveVip: false,
        checkedAt
      };
    }

    const [isModerator, isVip] = await Promise.all([
      checkTargetRole({ userId, userLogin }, "moderator", { ...options, clientId, broadcasterId, accessToken }),
      checkTargetRole({ userId, userLogin }, "vip", { ...options, clientId, broadcasterId, accessToken })
    ]);

    if (isModerator === null || isVip === null) {
      return {
        ok: false,
        source: "helper_twitch_roles",
        reason: "role_precheck_unavailable",
        blocker: isModerator === null ? "moderator_check_unavailable" : "vip_check_unavailable",
        broadcasterId,
        broadcasterLogin,
        userId,
        userLogin,
        userDisplayName,
        isBroadcaster: false,
        isModerator: isModerator === true,
        isVip: isVip === true,
        canReceiveVip: false,
        checkedAt
      };
    }

    const reason = isModerator ? "target_is_moderator" : (isVip ? "target_is_already_vip" : "eligible");
    return {
      ok: true,
      source: "helper_twitch_roles",
      reason,
      blocker: reason === "eligible" ? "" : reason,
      broadcasterId,
      broadcasterLogin,
      userId,
      userLogin,
      userDisplayName,
      isBroadcaster: false,
      isModerator: isModerator === true,
      isVip: isVip === true,
      canReceiveVip: !isModerator && !isVip,
      checkedAt
    };
  } catch (err) {
    return {
      ok: false,
      source: "helper_twitch_roles",
      reason: "role_precheck_unavailable",
      blocker: "role_precheck_error",
      broadcasterId,
      broadcasterLogin,
      userId: fallbackIdentity.userId,
      userLogin: fallbackIdentity.login,
      userDisplayName: fallbackIdentity.displayName,
      isBroadcaster: Boolean(broadcasterId && fallbackIdentity.userId && broadcasterId === fallbackIdentity.userId) || Boolean(broadcasterLogin && fallbackIdentity.login && broadcasterLogin === fallbackIdentity.login),
      isModerator: false,
      isVip: false,
      canReceiveVip: false,
      checkedAt,
      error: err && err.message ? err.message : String(err)
    };
  }
}

function clearCache() {
  cache.clear();
}

module.exports = {
  isTargetModerator,
  isTargetVip,
  getChannelUserRoleState,
  listChannelVips,
  listChannelModerators,
  tokenStatus,
  clearCache,
  normalizeLogin
};
