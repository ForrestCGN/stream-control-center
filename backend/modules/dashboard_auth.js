"use strict";

const crypto = require("crypto");
const sqlite = require("./sqlite_core");

const MODULE_NAME = "dashboard_auth";
const SCHEMA_MODULE = "dashboard_auth";
const SCHEMA_VERSION = 1;

const SESSION_COOKIE = "cgn_dashboard_session";
const OAUTH_STATE_COOKIE = "cgn_dashboard_oauth_state";
const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 Stunden
const DEFAULT_ROLES = [
  { key: "owner", label: "Owner", level: 100 },
  { key: "admin", label: "Admin", level: 90 },
  { key: "streamer", label: "Streamer", level: 80 },
  { key: "supermod", label: "SuperMod", level: 60 },
  { key: "mod", label: "Mod", level: 50 },
  { key: "user", label: "User", level: 10 }
];

module.exports.init = function init(ctx) {
  const { app, env } = ctx;
  if (!sqlite.isInitialized()) sqlite.init(ctx);
  ensureSchema();
  ensureCompatibilityColumns();
  seedRoles();

  app.get("/api/auth/status", (req, res) => {
    res.json({
      ok: true,
      module: MODULE_NAME,
      version: 2,
      twitchLoginConfigured: isTwitchConfigured(env),
      routes: [
        "GET /api/auth/status",
        "GET /api/auth/session",
        "POST /api/auth/bootstrap-owner-local",
        "POST /api/auth/logout",
        "GET /api/auth/twitch/login",
        "GET /api/auth/twitch/callback",
        "GET /api/auth/roles",
        "GET /api/auth/audit"
      ]
    });
  });

  app.get("/api/auth/session", (req, res) => {
    const session = readSessionFromRequest(req);
    if (!session) {
      res.json({ ok: true, authenticated: false, user: null });
      return;
    }

    touchSession(session.sessionId);
    res.json({
      ok: true,
      authenticated: true,
      user: publicUser(session),
      session: {
        provider: session.provider || "",
        role: session.role,
        createdAt: session.created_at,
        expiresAt: session.expires_at,
        lastSeenAt: new Date().toISOString()
      }
    });
  });

  app.post("/api/auth/bootstrap-owner-local", (req, res) => {
    const localOnly = isLocalRequest(req);
    const allowRemote = env.DASHBOARD_AUTH_ALLOW_REMOTE_BOOTSTRAP === "1";
    if (!localOnly && !allowRemote) {
      res.status(403).json({ ok: false, error: "local_only" });
      return;
    }

    const now = nowIso();
    const displayName = String(req.body?.displayName || "Local Owner").trim() || "Local Owner";
    const user = createOrGetLocalOwner(displayName, now);
    const session = createSession(user.id, "owner", req, now);
    writeAudit(user.id, displayName, "auth.bootstrap_owner_local", "dashboard_user", String(user.id), {}, req);
    setSessionCookie(res, session.sessionId, new Date(session.expiresAt));
    res.json({ ok: true, authenticated: true, user: publicUser({ ...user, role: "owner", provider: "local" }) });
  });

  app.post("/api/auth/logout", (req, res) => {
    const cookies = parseCookies(req);
    const sessionId = cookies[SESSION_COOKIE] || "";
    const session = sessionId ? getSession(sessionId) : null;
    if (session) {
      sqlite.run(
        "UPDATE dashboard_sessions SET revoked_at = :revokedAt WHERE id = :id",
        { revokedAt: nowIso(), id: sessionId }
      );
      writeAudit(session.user_id, session.display_name || "", "auth.logout", "dashboard_session", sessionId, {}, req);
    }
    clearCookie(res, SESSION_COOKIE);
    res.json({ ok: true, authenticated: false });
  });

  app.get("/api/auth/twitch/login", (req, res) => {
    if (!isTwitchConfigured(env)) {
      res.status(500).json({ ok: false, error: "twitch_oauth_not_configured", missing: missingTwitchEnv(env) });
      return;
    }

    const state = randomToken(32);
    const redirectUri = twitchRedirectUri(req, env);
    const params = new URLSearchParams({
      client_id: env.TWITCH_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "user:read:email",
      state
    });

    setOAuthStateCookie(res, state);
    res.redirect(`https://id.twitch.tv/oauth2/authorize?${params.toString()}`);
  });

  app.get("/api/auth/twitch/callback", async (req, res) => {
    try {
      if (!isTwitchConfigured(env)) {
        res.status(500).send("Twitch OAuth ist nicht konfiguriert.");
        return;
      }

      const code = String(req.query.code || "");
      const state = String(req.query.state || "");
      const expectedState = parseCookies(req)[OAUTH_STATE_COOKIE] || "";
      if (!code || !state || !expectedState || !safeEqual(state, expectedState)) {
        res.status(400).send("OAuth State ungültig oder abgelaufen.");
        return;
      }

      const redirectUri = twitchRedirectUri(req, env);
      const token = await exchangeTwitchCode(env, code, redirectUri);
      const twitchUser = await fetchTwitchUser(env, token.access_token);
      const user = upsertTwitchUser(twitchUser, req);
      const session = createSession(user.id, user.primary_role || "user", req, nowIso());

      clearCookie(res, OAUTH_STATE_COOKIE);
      setSessionCookie(res, session.sessionId, new Date(session.expiresAt));
      writeAudit(user.id, user.display_name || twitchUser.display_name || twitchUser.login || "", "auth.twitch_login", "dashboard_identity", twitchUser.id, { login: twitchUser.login }, req);

      res.redirect("/dashboard/");
    } catch (err) {
      console.error("[dashboard_auth] twitch callback failed:", err);
      res.status(500).send("Twitch Login fehlgeschlagen. Details stehen im Backend-Log.");
    }
  });

  app.get("/api/auth/roles", (req, res) => {
    res.json({ ok: true, roles: sqlite.all("SELECT key, label, level, is_system FROM dashboard_roles ORDER BY level DESC") || [] });
  });

  app.get("/api/auth/audit", (req, res) => {
    const session = readSessionFromRequest(req);
    if (!session || !["owner", "admin"].includes(String(session.role || ""))) {
      res.status(403).json({ ok: false, error: "forbidden" });
      return;
    }

    const limit = clampInt(req.query.limit, 50, 1, 250);
    const rows = sqlite.all(
      "SELECT id, actor_user_id, actor_display_name, action, target_type, target_id, details_json, ip, user_agent, created_at FROM dashboard_audit_log ORDER BY id DESC LIMIT :limit",
      { limit }
    ) || [];
    res.json({ ok: true, rows });
  });

  console.log(`[module] ${MODULE_NAME} ready`);
};

function ensureSchema() {
  sqlite.ensureSchema(SCHEMA_MODULE, SCHEMA_VERSION, (fromVersion, toVersion, db) => {
    if (toVersion !== 1) return;
    db.exec(`
      CREATE TABLE IF NOT EXISTS dashboard_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        display_name TEXT NOT NULL,
        avatar_url TEXT NOT NULL DEFAULT '',
        primary_role TEXT NOT NULL DEFAULT 'user',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_login_at TEXT
      );

      CREATE TABLE IF NOT EXISTS dashboard_identities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        provider TEXT NOT NULL,
        provider_user_id TEXT NOT NULL,
        provider_login TEXT NOT NULL DEFAULT '',
        provider_display_name TEXT NOT NULL DEFAULT '',
        avatar_url TEXT NOT NULL DEFAULT '',
        raw_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(provider, provider_user_id),
        FOREIGN KEY(user_id) REFERENCES dashboard_users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS dashboard_sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        ip TEXT NOT NULL DEFAULT '',
        user_agent TEXT NOT NULL DEFAULT '',
        revoked_at TEXT,
        FOREIGN KEY(user_id) REFERENCES dashboard_users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS dashboard_roles (
        key TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 0,
        is_system INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dashboard_permissions (
        key TEXT PRIMARY KEY,
        label TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dashboard_audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_user_id INTEGER,
        actor_display_name TEXT NOT NULL DEFAULT '',
        action TEXT NOT NULL,
        target_type TEXT NOT NULL DEFAULT '',
        target_id TEXT NOT NULL DEFAULT '',
        details_json TEXT NOT NULL DEFAULT '{}',
        ip TEXT NOT NULL DEFAULT '',
        user_agent TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_dashboard_sessions_user ON dashboard_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_dashboard_sessions_expires ON dashboard_sessions(expires_at);
      CREATE INDEX IF NOT EXISTS idx_dashboard_audit_created ON dashboard_audit_log(created_at);
    `);
  });
}

function ensureCompatibilityColumns() {
  ensureColumn("dashboard_users", "display_name", "TEXT NOT NULL DEFAULT 'Dashboard User'");
  ensureColumn("dashboard_users", "avatar_url", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_users", "primary_role", "TEXT NOT NULL DEFAULT 'user'");
  ensureColumn("dashboard_users", "is_active", "INTEGER NOT NULL DEFAULT 1");
  ensureColumn("dashboard_users", "created_at", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_users", "updated_at", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_users", "last_login_at", "TEXT");

  ensureColumn("dashboard_identities", "user_id", "INTEGER");
  ensureColumn("dashboard_identities", "provider", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_identities", "provider_user_id", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_identities", "provider_login", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_identities", "provider_display_name", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_identities", "avatar_url", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_identities", "raw_json", "TEXT NOT NULL DEFAULT '{}'");
  ensureColumn("dashboard_identities", "created_at", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_identities", "updated_at", "TEXT NOT NULL DEFAULT ''");

  ensureColumn("dashboard_sessions", "user_id", "INTEGER");
  ensureColumn("dashboard_sessions", "role", "TEXT NOT NULL DEFAULT 'user'");
  ensureColumn("dashboard_sessions", "created_at", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_sessions", "expires_at", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_sessions", "last_seen_at", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_sessions", "ip", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_sessions", "user_agent", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_sessions", "revoked_at", "TEXT");

  ensureColumn("dashboard_roles", "label", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_roles", "level", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn("dashboard_roles", "is_system", "INTEGER NOT NULL DEFAULT 1");
  ensureColumn("dashboard_roles", "created_at", "TEXT NOT NULL DEFAULT ''");

  ensureColumn("dashboard_permissions", "label", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_permissions", "description", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_permissions", "created_at", "TEXT NOT NULL DEFAULT ''");

  ensureColumn("dashboard_audit_log", "actor_user_id", "INTEGER");
  ensureColumn("dashboard_audit_log", "actor_display_name", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_audit_log", "action", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_audit_log", "target_type", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_audit_log", "target_id", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_audit_log", "details_json", "TEXT NOT NULL DEFAULT '{}'");
  ensureColumn("dashboard_audit_log", "ip", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_audit_log", "user_agent", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("dashboard_audit_log", "created_at", "TEXT NOT NULL DEFAULT ''");
}

function ensureColumn(tableName, columnName, definition) {
  const rows = sqlite.all(`PRAGMA table_info(${tableName})`) || [];
  if (rows.some(row => row.name === columnName)) return;
  sqlite.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}

function seedRoles() {
  const now = nowIso();
  for (const role of DEFAULT_ROLES) {
    sqlite.run(`
      INSERT INTO dashboard_roles (key, label, level, is_system, created_at)
      VALUES (:key, :label, :level, 1, :createdAt)
      ON CONFLICT(key) DO UPDATE SET
        label = excluded.label,
        level = excluded.level,
        is_system = 1
    `, { key: role.key, label: role.label, level: role.level, createdAt: now });
  }
}

function createOrGetLocalOwner(displayName, now) {
  const provider = "local";
  const providerUserId = "local-owner";
  const existing = sqlite.get(`
    SELECT u.*, i.provider
    FROM dashboard_identities i
    JOIN dashboard_users u ON u.id = i.user_id
    WHERE i.provider = :provider AND i.provider_user_id = :providerUserId
  `, { provider, providerUserId });

  if (existing) {
    sqlite.run("UPDATE dashboard_users SET display_name = :displayName, primary_role = 'owner', is_active = 1, updated_at = :updatedAt, last_login_at = :lastLoginAt WHERE id = :id",
      { displayName, updatedAt: now, lastLoginAt: now, id: existing.id });
    return sqlite.get("SELECT *, 'local' AS provider FROM dashboard_users WHERE id = :id", { id: existing.id });
  }

  const result = sqlite.run(`
    INSERT INTO dashboard_users (display_name, avatar_url, primary_role, is_active, created_at, updated_at, last_login_at)
    VALUES (:displayName, '', 'owner', 1, :createdAt, :updatedAt, :lastLoginAt)
  `, { displayName, createdAt: now, updatedAt: now, lastLoginAt: now });

  const userId = Number(result.lastInsertRowid);
  sqlite.run(`
    INSERT INTO dashboard_identities (user_id, provider, provider_user_id, provider_login, provider_display_name, raw_json, created_at, updated_at)
    VALUES (:userId, :provider, :providerUserId, 'local', :displayName, '{}', :createdAt, :updatedAt)
  `, { userId, provider, providerUserId, displayName, createdAt: now, updatedAt: now });

  return sqlite.get("SELECT *, 'local' AS provider FROM dashboard_users WHERE id = :id", { id: userId });
}

function upsertTwitchUser(twitchUser, req) {
  const now = nowIso();
  const provider = "twitch";
  const providerUserId = String(twitchUser.id || "");
  if (!providerUserId) throw new Error("Twitch user id missing");

  const existing = sqlite.get(`
    SELECT u.*, i.provider
    FROM dashboard_identities i
    JOIN dashboard_users u ON u.id = i.user_id
    WHERE i.provider = :provider AND i.provider_user_id = :providerUserId
  `, { provider, providerUserId });

  if (existing) {
    sqlite.run(`
      UPDATE dashboard_users
      SET display_name = :displayName,
          avatar_url = :avatarUrl,
          updated_at = :updatedAt,
          last_login_at = :lastLoginAt
      WHERE id = :id
    `, {
      displayName: twitchUser.display_name || twitchUser.login || existing.display_name,
      avatarUrl: twitchUser.profile_image_url || existing.avatar_url || "",
      updatedAt: now,
      lastLoginAt: now,
      id: existing.id
    });

    sqlite.run(`
      UPDATE dashboard_identities
      SET provider_login = :login,
          provider_display_name = :displayName,
          avatar_url = :avatarUrl,
          raw_json = :rawJson,
          updated_at = :updatedAt
      WHERE provider = :provider AND provider_user_id = :providerUserId
    `, {
      login: twitchUser.login || "",
      displayName: twitchUser.display_name || twitchUser.login || "",
      avatarUrl: twitchUser.profile_image_url || "",
      rawJson: JSON.stringify(safeTwitchRaw(twitchUser)),
      updatedAt: now,
      provider,
      providerUserId
    });

    return sqlite.get("SELECT *, 'twitch' AS provider FROM dashboard_users WHERE id = :id", { id: existing.id });
  }

  const result = sqlite.run(`
    INSERT INTO dashboard_users (display_name, avatar_url, primary_role, is_active, created_at, updated_at, last_login_at)
    VALUES (:displayName, :avatarUrl, 'user', 1, :createdAt, :updatedAt, :lastLoginAt)
  `, {
    displayName: twitchUser.display_name || twitchUser.login || "Twitch User",
    avatarUrl: twitchUser.profile_image_url || "",
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now
  });

  const userId = Number(result.lastInsertRowid);
  sqlite.run(`
    INSERT INTO dashboard_identities (user_id, provider, provider_user_id, provider_login, provider_display_name, avatar_url, raw_json, created_at, updated_at)
    VALUES (:userId, :provider, :providerUserId, :login, :displayName, :avatarUrl, :rawJson, :createdAt, :updatedAt)
  `, {
    userId,
    provider,
    providerUserId,
    login: twitchUser.login || "",
    displayName: twitchUser.display_name || twitchUser.login || "",
    avatarUrl: twitchUser.profile_image_url || "",
    rawJson: JSON.stringify(safeTwitchRaw(twitchUser)),
    createdAt: now,
    updatedAt: now
  });

  writeAudit(userId, twitchUser.display_name || twitchUser.login || "", "auth.twitch_user_created", "dashboard_user", String(userId), { login: twitchUser.login }, req);
  return sqlite.get("SELECT *, 'twitch' AS provider FROM dashboard_users WHERE id = :id", { id: userId });
}

function createSession(userId, role, req, now) {
  const sessionId = randomToken(48);
  const expiresAt = new Date(Date.now() + DEFAULT_SESSION_TTL_MS).toISOString();
  sqlite.run(`
    INSERT INTO dashboard_sessions (id, user_id, role, created_at, expires_at, last_seen_at, ip, user_agent)
    VALUES (:id, :userId, :role, :createdAt, :expiresAt, :lastSeenAt, :ip, :userAgent)
  `, {
    id: sessionId,
    userId,
    role: role || "user",
    createdAt: now,
    expiresAt,
    lastSeenAt: now,
    ip: clientIp(req),
    userAgent: String(req.headers["user-agent"] || "")
  });
  return { sessionId, expiresAt };
}

function getSession(sessionId) {
  if (!sessionId) return null;
  return sqlite.get(`
    SELECT s.id AS session_id, s.*, u.display_name, u.avatar_url, u.primary_role, u.is_active,
           COALESCE(i.provider, '') AS provider,
           COALESCE(i.provider_login, '') AS provider_login,
           COALESCE(i.provider_display_name, '') AS provider_display_name
    FROM dashboard_sessions s
    JOIN dashboard_users u ON u.id = s.user_id
    LEFT JOIN dashboard_identities i ON i.user_id = u.id
    WHERE s.id = :id
      AND s.revoked_at IS NULL
      AND s.expires_at > :now
      AND u.is_active = 1
    ORDER BY CASE i.provider WHEN 'twitch' THEN 0 WHEN 'local' THEN 1 ELSE 2 END
    LIMIT 1
  `, { id: sessionId, now: nowIso() });
}

function readSessionFromRequest(req) {
  const cookies = parseCookies(req);
  const sessionId = cookies[SESSION_COOKIE] || "";
  return getSession(sessionId);
}

function touchSession(sessionId) {
  try {
    sqlite.run("UPDATE dashboard_sessions SET last_seen_at = :lastSeenAt WHERE id = :id", { lastSeenAt: nowIso(), id: sessionId });
  } catch (_) {}
}

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.user_id || row.id,
    displayName: row.display_name || row.provider_display_name || "Dashboard User",
    avatarUrl: row.avatar_url || "",
    role: row.role || row.primary_role || "user",
    provider: row.provider || "",
    providerLogin: row.provider_login || ""
  };
}

function writeAudit(actorUserId, actorDisplayName, action, targetType, targetId, details, req) {
  try {
    sqlite.run(`
      INSERT INTO dashboard_audit_log (actor_user_id, actor_display_name, action, target_type, target_id, details_json, ip, user_agent, created_at)
      VALUES (:actorUserId, :actorDisplayName, :action, :targetType, :targetId, :detailsJson, :ip, :userAgent, :createdAt)
    `, {
      actorUserId: actorUserId || null,
      actorDisplayName: actorDisplayName || "",
      action,
      targetType: targetType || "",
      targetId: targetId || "",
      detailsJson: JSON.stringify(details || {}),
      ip: clientIp(req),
      userAgent: String(req.headers["user-agent"] || ""),
      createdAt: nowIso()
    });
  } catch (err) {
    console.warn("[dashboard_auth] audit failed:", err.message);
  }
}

async function exchangeTwitchCode(env, code, redirectUri) {
  const params = new URLSearchParams({
    client_id: env.TWITCH_CLIENT_ID,
    client_secret: env.TWITCH_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri
  });

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Twitch token exchange failed: ${res.status} ${JSON.stringify(data)}`);
  return data;
}

async function fetchTwitchUser(env, accessToken) {
  const res = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      "Client-Id": env.TWITCH_CLIENT_ID,
      "Authorization": `Bearer ${accessToken}`
    }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Twitch userinfo failed: ${res.status} ${JSON.stringify(data)}`);
  const user = Array.isArray(data.data) ? data.data[0] : null;
  if (!user) throw new Error("Twitch userinfo returned no user");
  return user;
}

function twitchRedirectUri(req, env) {
  if (env.TWITCH_AUTH_REDIRECT_URI) return env.TWITCH_AUTH_REDIRECT_URI;
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "127.0.0.1:8080";
  return `${proto}://${host}/api/auth/twitch/callback`;
}

function isTwitchConfigured(env) {
  return Boolean(env.TWITCH_CLIENT_ID && env.TWITCH_CLIENT_SECRET);
}

function missingTwitchEnv(env) {
  const missing = [];
  if (!env.TWITCH_CLIENT_ID) missing.push("TWITCH_CLIENT_ID");
  if (!env.TWITCH_CLIENT_SECRET) missing.push("TWITCH_CLIENT_SECRET");
  return missing;
}

function setSessionCookie(res, value, expires) {
  res.setHeader("Set-Cookie", serializeCookie(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    expires
  }));
}

function setOAuthStateCookie(res, value) {
  res.setHeader("Set-Cookie", serializeCookie(OAUTH_STATE_COOKIE, value, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/api/auth/twitch",
    maxAge: 600
  }));
}

function clearCookie(res, name) {
  res.append("Set-Cookie", serializeCookie(name, "", {
    httpOnly: true,
    sameSite: "Lax",
    path: name === OAUTH_STATE_COOKIE ? "/api/auth/twitch" : "/",
    expires: new Date(0)
  }));
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge) parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  return parts.join("; ");
}

function parseCookies(req) {
  const header = String(req.headers.cookie || "");
  const out = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!key) continue;
    out[key] = decodeURIComponent(val || "");
  }
  return out;
}

function isLocalRequest(req) {
  const ip = clientIp(req);
  return ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1" || ip === "localhost";
}

function clientIp(req) {
  const raw = String(req.ip || req.socket?.remoteAddress || "");
  if (raw.startsWith("::ffff:")) return raw.slice(7);
  return raw;
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function randomToken(bytes) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function nowIso() {
  return new Date().toISOString();
}

function clampInt(value, fallback, min, max) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function safeTwitchRaw(user) {
  return {
    id: user.id,
    login: user.login,
    display_name: user.display_name,
    profile_image_url: user.profile_image_url,
    broadcaster_type: user.broadcaster_type,
    type: user.type,
    email_present: Boolean(user.email)
  };
}
