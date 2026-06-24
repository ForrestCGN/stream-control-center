'use strict';

const { validateSessionReadOnly } = require('./auth-session-read.service');
const { withReadOnlyConnection, withWriteConnection, publicDbError } = require('./db.service');

const PROVIDER = 'twitch';
const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const TWITCH_USERS_URL = 'https://api.twitch.tv/helix/users';

async function buildSelfTwitchProfileSync({ context, req }) {
  const config = context.config || {};
  const guard = buildSyncGuard(config);

  if (!guard.allowed) {
    return respond(403, buildBase({ context, error: guard.reason, synced: false }));
  }

  const sessionValidation = await validateSessionReadOnly({ config, req });
  if (!sessionValidation.valid || !sessionValidation.userUid) {
    return respond(401, buildBase({ context, error: 'not_logged_in', synced: false }));
  }

  try {
    const identity = await readOwnTwitchIdentity({ config, userUid: sessionValidation.userUid });
    if (!identity || !identity.providerUserId) {
      return respond(404, buildBase({ context, error: 'twitch_identity_not_found', synced: false }));
    }

    const twitchUser = await readTwitchUserById({ providerUserId: identity.providerUserId });
    const normalized = normalizeTwitchUser(twitchUser);

    const updated = await writeOwnTwitchProfile({
      config,
      userUid: sessionValidation.userUid,
      providerUserId: identity.providerUserId,
      normalized
    });

    return respond(200, {
      ...buildBase({ context, synced: true }),
      user: updated.user,
      avatarUrl: updated.user.avatarUrl,
      profileImageUrl: updated.user.profileImageUrl,
      notes: [
        'Nur das eigene Twitch-Profil wurde synchronisiert.',
        'Es wurden keine Rollen, Freigaben, Admin-Rechte oder Remote-Actions geaendert.'
      ]
    });
  } catch (err) {
    const publicError = (err && err.code) || publicDbError(err).code || 'profile_sync_failed';
    return respond(500, buildBase({ context, error: publicError, synced: false }));
  }
}

function buildBase({ context, error, synced }) {
  return {
    ok: !error,
    service: 'remote-modboard',
    module: 'remote_auth_profile_sync',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap_auth4.v1',
    error: error || null,
    synced: Boolean(synced),
    selfOnly: true,
    remoteWritesEnabled: false,
    agentActionsEnabled: false
  };
}

function buildSyncGuard(config) {
  if (!config || !config.auth || config.auth.authEnabled !== true) return { allowed: false, reason: 'auth_disabled' };
  if (!config.auth.sessionWriteEnabled) return { allowed: false, reason: 'auth_session_write_disabled' };
  if (!config.database || config.database.writeEnabled !== true) return { allowed: false, reason: 'db_write_disabled' };
  if (!process.env.TWITCH_CLIENT_ID) return { allowed: false, reason: 'twitch_client_id_missing' };
  if (!process.env.TWITCH_CLIENT_SECRET) return { allowed: false, reason: 'twitch_client_secret_missing' };
  return { allowed: true, reason: 'ok' };
}

async function readOwnTwitchIdentity({ config, userUid }) {
  return await withReadOnlyConnection(config, async (connection) => {
    const [rows] = await connection.query(`
      SELECT provider_user_id, provider_login, provider_display_name
      FROM dashboard_identities
      WHERE user_uid = ?
        AND provider = ?
      ORDER BY is_primary DESC, id ASC
      LIMIT 1
    `, [userUid, PROVIDER]);

    const row = rows && rows[0] ? rows[0] : null;
    if (!row) return null;

    return {
      providerUserId: row.provider_user_id,
      providerLogin: row.provider_login || null,
      providerDisplayName: row.provider_display_name || null
    };
  });
}

async function readTwitchUserById({ providerUserId }) {
  const token = await readAppAccessToken();
  const url = new URL(TWITCH_USERS_URL);
  url.searchParams.set('id', providerUserId);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Client-Id': process.env.TWITCH_CLIENT_ID,
      'Accept': 'application/json'
    }
  });

  const payload = await response.json().catch(() => null);
  const user = payload && Array.isArray(payload.data) ? payload.data[0] : null;

  if (!response.ok || !user) {
    const err = new Error('twitch_user_read_failed');
    err.code = 'twitch_user_read_failed';
    err.twitchStatus = response.status;
    throw err;
  }

  return user;
}

async function readAppAccessToken() {
  const body = new URLSearchParams();
  body.set('client_id', process.env.TWITCH_CLIENT_ID);
  body.set('client_secret', process.env.TWITCH_CLIENT_SECRET);
  body.set('grant_type', 'client_credentials');

  const response = await fetch(TWITCH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload || !payload.access_token) {
    const err = new Error('twitch_app_token_failed');
    err.code = 'twitch_app_token_failed';
    err.twitchStatus = response.status;
    throw err;
  }

  return payload.access_token;
}

async function writeOwnTwitchProfile({ config, userUid, providerUserId, normalized }) {
  return await withWriteConnection(config, async (connection) => {
    await connection.beginTransaction();
    try {
      await connection.query(`
        UPDATE dashboard_users
        SET display_name = ?,
            login_name = ?,
            profile_image_url = ?,
            status = 'active',
            updated_at = NOW()
        WHERE user_uid = ?
        LIMIT 1
      `, [normalized.displayName, normalized.loginName, normalized.profileImageUrl, userUid]);

      await connection.query(`
        UPDATE dashboard_identities
        SET provider_login = ?,
            provider_display_name = ?,
            provider_profile_image_url = ?,
            is_primary = 1,
            updated_at = NOW()
        WHERE user_uid = ?
          AND provider = ?
          AND provider_user_id = ?
        LIMIT 1
      `, [normalized.loginName, normalized.displayName, normalized.profileImageUrl, userUid, PROVIDER, providerUserId]);

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    }

    return {
      user: {
        userUid,
        displayName: normalized.displayName,
        loginName: normalized.loginName,
        profileImageUrl: normalized.profileImageUrl,
        avatarUrl: normalized.profileImageUrl,
        provider: PROVIDER,
        providerUserId
      }
    };
  });
}

function normalizeTwitchUser(user) {
  const id = safeString(user && user.id);
  const loginName = safeString(user && user.login).toLowerCase();
  const displayName = safeString(user && user.display_name) || loginName || id;
  const profileImageUrl = safeUrl(user && user.profile_image_url);

  if (!id || !/^[0-9]{1,32}$/.test(id)) {
    const err = new Error('invalid_twitch_user_id');
    err.code = 'invalid_twitch_user_id';
    throw err;
  }

  return {
    id,
    loginName: loginName || id,
    displayName,
    profileImageUrl
  };
}

function safeString(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function safeUrl(value) {
  const url = safeString(value);
  if (!url || url.length > 500) return null;
  if (!/^https:\/\//i.test(url)) return null;
  return url;
}

function respond(status, body) {
  return { status, body };
}

module.exports = {
  buildSelfTwitchProfileSync
};
