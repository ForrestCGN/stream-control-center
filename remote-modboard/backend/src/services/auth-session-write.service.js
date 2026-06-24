'use strict';

const crypto = require('crypto');
const { withWriteConnection } = require('./db.service');

const PROVIDER = 'twitch';

async function createLoginSession({ config, twitchUser, req }) {
  assertAuthWriteEnabled(config);

  const normalized = normalizeTwitchUser(twitchUser);
  const userUid = `tw:${normalized.id}`;
  const sessionUid = crypto.randomBytes(32).toString('base64url');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (config.auth.sessions.ttlSeconds * 1000));
  const ipHash = fingerprint(getRequestIp(req));
  const userAgentHash = fingerprint(req && req.headers ? req.headers['user-agent'] : '');

  await withWriteConnection(config, async (connection) => {
    await connection.beginTransaction();

    try {
      await connection.query(`
        INSERT INTO dashboard_users (user_uid, display_name, login_name, status, last_login_at)
        VALUES (?, ?, ?, 'active', NOW())
        ON DUPLICATE KEY UPDATE
          display_name = VALUES(display_name),
          login_name = VALUES(login_name),
          status = 'active',
          last_login_at = NOW()
      `, [userUid, normalized.displayName, normalized.loginName]);

      await connection.query(`
        INSERT INTO dashboard_identities (
          user_uid,
          provider,
          provider_user_id,
          provider_login,
          provider_display_name,
          is_primary
        )
        VALUES (?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE
          user_uid = VALUES(user_uid),
          provider_login = VALUES(provider_login),
          provider_display_name = VALUES(provider_display_name),
          is_primary = 1
      `, [userUid, PROVIDER, normalized.id, normalized.loginName, normalized.displayName]);

      await connection.query(`
        INSERT INTO dashboard_sessions (
          session_uid,
          user_uid,
          status,
          expires_at,
          ip_hash,
          user_agent_hash
        )
        VALUES (?, ?, 'active', ?, ?, ?)
      `, [sessionUid, userUid, toMysqlDateTime(expiresAt), ipHash, userAgentHash]);

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    }
  });

  return {
    sessionUid,
    userUid,
    expiresAt: expiresAt.toISOString(),
    user: {
      userUid,
      displayName: normalized.displayName,
      loginName: normalized.loginName,
      provider: PROVIDER,
      providerUserId: normalized.id
    }
  };
}

async function revokeCurrentSession({ config, req }) {
  assertAuthWriteEnabled(config);

  const cookieName = config.auth.sessions.cookieName;
  const cookieValue = readCookie(req, cookieName);

  if (!cookieValue) {
    return {
      revoked: false,
      reason: 'no_session_cookie'
    };
  }

  await withWriteConnection(config, async (connection) => {
    await connection.query(`
      UPDATE dashboard_sessions
      SET status = 'revoked',
          revoked_at = NOW()
      WHERE session_uid = ?
      LIMIT 1
    `, [cookieValue]);
  });

  return {
    revoked: true,
    reason: 'session_revoked'
  };
}

function assertAuthWriteEnabled(config) {
  if (!config.auth || config.auth.authEnabled !== true || config.auth.sessionCreationEnabled !== true || config.auth.sessionWriteEnabled !== true) {
    const err = new Error('auth_session_write_disabled');
    err.code = 'auth_session_write_disabled';
    throw err;
  }

  if (!config.database || config.database.writeEnabled !== true) {
    const err = new Error('db_write_disabled');
    err.code = 'db_write_disabled';
    throw err;
  }
}

function normalizeTwitchUser(user) {
  const id = safeString(user && user.id);
  const loginName = safeString(user && user.login).toLowerCase();
  const displayName = safeString(user && user.display_name) || loginName || id;

  if (!id || !/^[0-9]{1,32}$/.test(id)) {
    const err = new Error('invalid_twitch_user_id');
    err.code = 'invalid_twitch_user_id';
    throw err;
  }

  return {
    id,
    loginName: loginName || id,
    displayName
  };
}

function readCookie(req, name) {
  const header = req && req.headers ? req.headers.cookie : '';
  if (!header || !name) return null;

  const parts = String(header).split(';').map((part) => part.trim());
  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq <= 0) continue;
    const key = part.slice(0, eq).trim();
    if (key !== name) continue;
    try {
      return decodeURIComponent(part.slice(eq + 1).trim());
    } catch (err) {
      return part.slice(eq + 1).trim();
    }
  }

  return null;
}

function getRequestIp(req) {
  const forwarded = req && req.headers ? req.headers['x-forwarded-for'] : null;
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req && req.socket ? req.socket.remoteAddress : '';
}

function fingerprint(value) {
  return crypto
    .createHash('sha256')
    .update(String(value || ''))
    .digest('hex');
}

function toMysqlDateTime(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function safeString(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

module.exports = {
  createLoginSession,
  revokeCurrentSession
};
