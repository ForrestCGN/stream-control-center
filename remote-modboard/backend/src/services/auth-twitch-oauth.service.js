'use strict';

const crypto = require('crypto');
const { createLoginSession } = require('./auth-session-write.service');

const TWITCH_AUTHORIZE_URL = 'https://id.twitch.tv/oauth2/authorize';
const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const TWITCH_USERS_URL = 'https://api.twitch.tv/helix/users';
const TWITCH_OAUTH_START_RELEASE_ENV = 'RDAP_TWITCH_OAUTH_START_RELEASED';

function buildTwitchStart({ context, req, res }) {
  const config = context.config;
  const guard = buildAuthGuard(config);

  if (!guard.allowed) {
    return {
      handled: false,
      status: 403,
      body: buildDisabledResponse({ context, reason: guard.reason, route: '/api/remote/auth/twitch/start', action: 'start' })
    };
  }

  const statePayload = {
    nonce: crypto.randomBytes(24).toString('base64url'),
    ts: Date.now()
  };
  const state = signState(config, statePayload);

  res.setHeader('Set-Cookie', buildCookie(config.auth.sessions.stateCookieName, state, {
    maxAge: config.auth.sessions.stateTtlSeconds,
    httpOnly: true,
    secure: config.auth.sessions.secureCookie,
    sameSite: config.auth.sessions.sameSite,
    path: '/'
  }));

  const url = new URL(TWITCH_AUTHORIZE_URL);
  url.searchParams.set('client_id', process.env.TWITCH_CLIENT_ID);
  url.searchParams.set('redirect_uri', config.auth.twitchOAuth.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);
  const scopes = Array.isArray(config.auth.twitchOAuth.scopes) ? config.auth.twitchOAuth.scopes : [];
  if (scopes.length) url.searchParams.set('scope', scopes.join(' '));

  return {
    handled: true,
    redirectUrl: url.toString()
  };
}

async function handleTwitchCallback({ context, req, res }) {
  const config = context.config;
  const guard = buildAuthGuard(config);

  if (!guard.allowed) {
    return {
      status: 403,
      body: buildDisabledResponse({ context, reason: guard.reason, route: '/api/remote/auth/twitch/callback', action: 'callback' })
    };
  }

  const code = readQuery(req, 'code');
  const state = readQuery(req, 'state');
  const cookieState = readCookie(req, config.auth.sessions.stateCookieName);

  res.setHeader('Set-Cookie', buildCookie(config.auth.sessions.stateCookieName, '', {
    maxAge: 0,
    httpOnly: true,
    secure: config.auth.sessions.secureCookie,
    sameSite: config.auth.sessions.sameSite,
    path: '/'
  }));

  if (!code || !state || !cookieState || state !== cookieState || !verifyState(config, state)) {
    return {
      status: 403,
      body: buildAuthError({ context, reason: 'oauth_state_invalid' })
    };
  }

  const token = await exchangeCodeForToken(config, code);
  const twitchUser = await readTwitchUser(config, token.access_token);
  const session = await createLoginSession({ config, twitchUser, req });

  res.append('Set-Cookie', buildCookie(config.auth.sessions.cookieName, session.sessionUid, {
    maxAge: config.auth.sessions.ttlSeconds,
    httpOnly: true,
    secure: config.auth.sessions.secureCookie,
    sameSite: config.auth.sessions.sameSite,
    path: '/'
  }));

  return {
    status: 200,
    html: buildCallbackHtml({
      ok: true,
      displayName: session.user.displayName,
      redirectUrl: '/'
    })
  };
}

async function exchangeCodeForToken(config, code) {
  const body = new URLSearchParams();
  body.set('client_id', process.env.TWITCH_CLIENT_ID);
  body.set('client_secret', process.env.TWITCH_CLIENT_SECRET);
  body.set('code', code);
  body.set('grant_type', 'authorization_code');
  body.set('redirect_uri', config.auth.twitchOAuth.redirectUri);

  const response = await fetch(TWITCH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload || !payload.access_token) {
    const err = new Error('twitch_token_exchange_failed');
    err.code = 'twitch_token_exchange_failed';
    err.twitchStatus = response.status;
    throw err;
  }

  return payload;
}

async function readTwitchUser(config, accessToken) {
  const response = await fetch(TWITCH_USERS_URL, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Client-Id': process.env.TWITCH_CLIENT_ID
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

function buildAuthGuard(config) {
  if (!config || !config.auth || config.auth.authEnabled !== true) return { allowed: false, reason: 'auth_disabled' };
  if (!isEnvEnabled(process.env[TWITCH_OAUTH_START_RELEASE_ENV])) return { allowed: false, reason: 'twitch_oauth_start_not_released' };
  if (!config.auth.twitchOAuth || config.auth.twitchOAuth.effectiveEnabled !== true) return { allowed: false, reason: 'twitch_oauth_disabled' };
  if (!config.auth.sessions || config.auth.sessions.effectiveEnabled !== true) return { allowed: false, reason: 'sessions_disabled' };
  if (!config.auth.sessionWriteEnabled) return { allowed: false, reason: 'session_write_disabled' };
  if (!config.database || config.database.writeEnabled !== true) return { allowed: false, reason: 'db_write_disabled' };
  return { allowed: true, reason: 'ok' };
}

function buildDisabledResponse({ context, reason, route, action }) {
  const authConfig = context.config && context.config.auth ? context.config.auth : {};
  const twitchOAuth = authConfig.twitchOAuth || {};
  const sessions = authConfig.sessions || {};

  return {
    ok: false,
    service: 'remote-modboard',
    module: 'remote_auth_twitch',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap_auth1.v1',
    route,
    action,
    error: reason,
    message: 'Twitch Login ist vorbereitet, aber durch Env/Safety-Gates nicht aktiv.',
    readOnly: false,
    writeEnabled: false,
    authPrepared: true,
    authEnabled: Boolean(authConfig.authEnabled),
    loginEnabled: Boolean(authConfig.loginEnabled),
    oauthPrepared: true,
    oauthEnabled: Boolean(twitchOAuth.effectiveEnabled),
    twitchOAuth: {
      prepared: Boolean(twitchOAuth.prepared),
      requestedEnabled: Boolean(twitchOAuth.requestedEnabled),
      effectiveEnabled: Boolean(twitchOAuth.effectiveEnabled),
      startRouteEnabled: Boolean(twitchOAuth.effectiveEnabled && isEnvEnabled(process.env[TWITCH_OAUTH_START_RELEASE_ENV])),
      callbackRouteEnabled: Boolean(twitchOAuth.effectiveEnabled && isEnvEnabled(process.env[TWITCH_OAUTH_START_RELEASE_ENV])),
      redirectToTwitch: Boolean(twitchOAuth.effectiveEnabled && isEnvEnabled(process.env[TWITCH_OAUTH_START_RELEASE_ENV])),
      tokenExchangeEnabled: Boolean(twitchOAuth.effectiveEnabled && isEnvEnabled(process.env[TWITCH_OAUTH_START_RELEASE_ENV])),
      clientIdConfigured: Boolean(twitchOAuth.clientIdConfigured),
      clientSecretConfigured: Boolean(twitchOAuth.clientSecretConfigured),
      redirectUri: twitchOAuth.redirectUri || null,
      scopes: Array.isArray(twitchOAuth.scopes) ? twitchOAuth.scopes : [],
      explicitStartReleaseRequired: TWITCH_OAUTH_START_RELEASE_ENV,
      explicitStartReleased: isEnvEnabled(process.env[TWITCH_OAUTH_START_RELEASE_ENV])
    },
    sessions: {
      requestedEnabled: Boolean(sessions.requestedEnabled),
      writeRequested: Boolean(sessions.writeRequested),
      effectiveEnabled: Boolean(sessions.effectiveEnabled),
      cookieName: sessions.cookieName || 'scc_remote_session',
      sessionSecretConfigured: Boolean(sessions.sessionSecretConfigured),
      oauthStateSecretConfigured: Boolean(sessions.oauthStateSecretConfigured),
      createSession: Boolean(authConfig.sessionCreationEnabled),
      setCookie: Boolean(sessions.effectiveEnabled && isEnvEnabled(process.env[TWITCH_OAUTH_START_RELEASE_ENV]))
    },
    databaseWriteEnabled: false,
    agentActionsEnabled: false,
    safety: context.safety,
    notes: [
      `RDAP45: Twitch OAuth Start bleibt gesperrt, bis ${TWITCH_OAUTH_START_RELEASE_ENV}=true explizit gesetzt wird.`,
      'Ohne AUTH_ENABLED, TWITCH_OAUTH_ENABLED, SESSION_ENABLED, AUTH_SESSION_WRITE_ENABLED und Secrets bleibt Login gesperrt.',
      'Remote-Writes/Agent-Actions/OBS/Sound/Overlay/Commands bleiben weiterhin deaktiviert.',
      'Auth-DB-Writes sind ausschließlich fuer User/Identity/Session vorgesehen.'
    ]
  };
}

function buildAuthError({ context, reason }) {
  return {
    ok: false,
    service: 'remote-modboard',
    module: 'remote_auth_twitch',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap_auth1.v1',
    error: reason,
    authEnabled: true,
    loginEnabled: true,
    agentActionsEnabled: false
  };
}

function signState(config, payload) {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json, 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', process.env.OAUTH_STATE_SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${sig}`;
}

function verifyState(config, state) {
  const parts = String(state || '').split('.');
  if (parts.length !== 2) return false;

  const [data, sig] = parts;
  const expected = crypto
    .createHmac('sha256', process.env.OAUTH_STATE_SECRET)
    .update(data)
    .digest('base64url');

  if (!timingSafeEqual(sig, expected)) return false;

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    const ts = Number(payload.ts);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts <= (config.auth.sessions.stateTtlSeconds * 1000);
  } catch (err) {
    return false;
  }
}

function timingSafeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function buildCookie(name, value, options) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=' + (options.path || '/'),
    `Max-Age=${Number(options.maxAge || 0)}`,
    'HttpOnly',
    `SameSite=${normalizeSameSite(options.sameSite)}`
  ];

  if (options.secure) parts.push('Secure');

  return parts.join('; ');
}

function normalizeSameSite(value) {
  const normalized = String(value || 'Lax').toLowerCase();
  if (normalized === 'strict') return 'Strict';
  if (normalized === 'none') return 'None';
  return 'Lax';
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

function readQuery(req, key) {
  const value = req && req.query ? req.query[key] : null;
  if (Array.isArray(value)) return value[0];
  if (typeof value === 'string') return value;
  return null;
}

function buildCallbackHtml({ ok, displayName, redirectUrl }) {
  const safeName = escapeHtml(displayName || 'Twitch');
  const safeRedirect = escapeHtml(redirectUrl || '/');
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="2;url=${safeRedirect}">
  <title>Login erfolgreich</title>
  <style>
    body { margin:0; min-height:100vh; display:grid; place-items:center; font-family:system-ui,sans-serif; background:#080b16; color:#f8fafc; }
    div { max-width:560px; padding:32px; border:1px solid rgba(160,98,255,.45); border-radius:24px; background:rgba(17,24,39,.88); box-shadow:0 0 44px rgba(168,85,247,.38); text-align:center; }
    strong { color:#5eead4; }
    a { color:#67e8f9; }
  </style>
</head>
<body>
  <div>
    <h1>Login erfolgreich</h1>
    <p>Angemeldet als <strong>${safeName}</strong>.</p>
    <p>Du wirst gleich zurück zum Remote Modboard geschickt.</p>
    <p><a href="${safeRedirect}">Direkt weiter</a></p>
  </div>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function isEnvEnabled(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

module.exports = {
  buildTwitchStart,
  handleTwitchCallback,
  buildDisabledResponse,
  buildCookie
};
