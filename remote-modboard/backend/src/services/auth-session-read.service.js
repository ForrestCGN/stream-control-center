'use strict';

const crypto = require('crypto');
const { buildDatabaseReadiness, withReadOnlyConnection, publicDbError } = require('./db.service');

const SESSION_COOKIE_CANDIDATES = Object.freeze([
  'scc_session',
  'scc_remote_session',
  'remote_modboard_session'
]);

const SESSION_UID_MAX_LENGTH = 96;

async function validateSessionReadOnly({ config, req }) {
  const cookieState = inspectSessionCookie(req, config);
  const readiness = buildDatabaseReadiness(config);

  const base = {
    checked: true,
    readOnly: true,
    writeEnabled: false,
    lookupEnabled: true,
    lookupPerformed: false,
    cookiePresent: cookieState.cookiePresent,
    cookieNameDetected: cookieState.cookieNameDetected,
    cookieValuePresent: cookieState.cookieValuePresent,
    cookieValueFingerprint: cookieState.cookieValueFingerprint,
    exists: false,
    valid: false,
    status: null,
    userUid: null,
    createdAt: null,
    expiresAt: null,
    revokedAt: null,
    lastSeenAt: null,
    reason: null,
    database: {
      configured: readiness.configured,
      driverAvailable: readiness.driverAvailable,
      writeEnabled: false,
      migrationEnabled: false
    },
    safety: {
      createSession: false,
      setCookie: false,
      refreshSession: false,
      updateLastSeen: false,
      databaseWriteEnabled: false
    }
  };

  if (!cookieState.cookiePresent) {
    return {
      ...base,
      lookupEnabled: false,
      reason: 'no_session_cookie'
    };
  }

  if (!cookieState.cookieValuePresent) {
    return {
      ...base,
      lookupEnabled: false,
      reason: 'empty_session_cookie'
    };
  }

  if (!isSafeSessionUid(cookieState.cookieValue)) {
    return {
      ...base,
      lookupEnabled: false,
      reason: 'invalid_session_cookie_format'
    };
  }

  if (!readiness.configured || !readiness.driverAvailable) {
    return {
      ...base,
      lookupEnabled: false,
      reason: readiness.error || 'db_not_ready',
      error: readiness.error || 'db_not_ready'
    };
  }

  try {
    return await withReadOnlyConnection(config, async (connection) => {
      const [rows] = await connection.query(`
        SELECT
          session_uid,
          user_uid,
          status,
          created_at,
          expires_at,
          revoked_at,
          last_seen_at
        FROM dashboard_sessions
        WHERE session_uid = ?
        LIMIT 1
      `, [cookieState.cookieValue]);

      const row = rows && rows[0] ? rows[0] : null;

      if (!row) {
        return {
          ...base,
          lookupPerformed: true,
          reason: 'session_not_found'
        };
      }

      const expiresAt = normalizeDate(row.expires_at);
      const revokedAt = normalizeDate(row.revoked_at);
      const createdAt = normalizeDate(row.created_at);
      const lastSeenAt = normalizeDate(row.last_seen_at);
      const status = String(row.status || '').toLowerCase();
      const expired = expiresAt ? Date.parse(expiresAt) <= Date.now() : true;
      const revoked = Boolean(revokedAt);
      const active = status === 'active';
      const valid = active && !expired && !revoked;

      return {
        ...base,
        lookupPerformed: true,
        exists: true,
        valid,
        status: row.status || null,
        userUid: row.user_uid || null,
        createdAt,
        expiresAt,
        revokedAt,
        lastSeenAt,
        reason: buildSessionReason({ active, expired, revoked, hasExpiresAt: Boolean(expiresAt) })
      };
    });
  } catch (err) {
    const error = publicDbError(err).code;
    return {
      ...base,
      lookupEnabled: false,
      lookupPerformed: false,
      reason: error || 'session_read_failed',
      error: error || 'session_read_failed'
    };
  }
}

function buildSessionReason({ active, expired, revoked, hasExpiresAt }) {
  if (!active) return 'session_status_not_active';
  if (revoked) return 'session_revoked';
  if (!hasExpiresAt) return 'session_missing_expiry';
  if (expired) return 'session_expired';
  return 'session_valid_readonly';
}

function inspectSessionCookie(req, config) {
  const cookieHeader = req && req.headers ? req.headers.cookie : '';
  const configuredName = config && config.auth && config.auth.sessions
    ? config.auth.sessions.cookieName
    : null;
  const candidates = uniqueStrings([
    configuredName,
    ...SESSION_COOKIE_CANDIDATES
  ]);

  if (typeof cookieHeader !== 'string' || cookieHeader.trim() === '') {
    return {
      cookiePresent: false,
      cookieNameDetected: null,
      cookieValuePresent: false,
      cookieValue: null,
      cookieValueFingerprint: null,
      candidateNames: candidates
    };
  }

  const parsed = parseCookieHeader(cookieHeader);
  const detected = candidates.find(name => Object.prototype.hasOwnProperty.call(parsed, name));
  const rawValue = detected ? parsed[detected] : null;
  const value = typeof rawValue === 'string' ? rawValue.trim() : '';

  return {
    cookiePresent: Boolean(detected),
    cookieNameDetected: detected || null,
    cookieValuePresent: Boolean(value),
    cookieValue: value || null,
    cookieValueFingerprint: value ? fingerprint(value) : null,
    candidateNames: candidates
  };
}

function parseCookieHeader(cookieHeader) {
  const result = {};

  cookieHeader
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const eq = part.indexOf('=');
      if (eq <= 0) return;

      const name = part.slice(0, eq).trim();
      const rawValue = part.slice(eq + 1).trim();
      if (!name) return;

      try {
        result[name] = decodeURIComponent(rawValue);
      } catch (err) {
        result[name] = rawValue;
      }
    });

  return result;
}

function isSafeSessionUid(value) {
  if (typeof value !== 'string') return false;
  if (value.length < 12 || value.length > SESSION_UID_MAX_LENGTH) return false;
  return /^[A-Za-z0-9._:-]+$/.test(value);
}

function fingerprint(value) {
  return crypto
    .createHash('sha256')
    .update(String(value))
    .digest('hex')
    .slice(0, 16);
}

function normalizeDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function uniqueStrings(values) {
  return values
    .filter(value => typeof value === 'string' && value.trim() !== '')
    .map(value => value.trim())
    .filter((value, index, arr) => arr.indexOf(value) === index);
}

module.exports = {
  SESSION_COOKIE_CANDIDATES,
  validateSessionReadOnly,
  inspectSessionCookie
};
