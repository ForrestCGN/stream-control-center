'use strict';

function buildLoginEntry({ context, req }) {
  const config = context.config || {};
  const centralAuth = config.centralAuth || {};
  const mode = String(centralAuth.mode || 'local_twitch_fallback').trim().toLowerCase();
  const requestedReturnTo = readReturnTo(req);
  const safeReturnTo = sanitizeReturnTo(requestedReturnTo, config.publicBaseUrl || 'https://mods.forrestcgn.de');

  const localTwitchStartPath = centralAuth.localTwitchStartPath || '/api/remote/auth/twitch/start';
  const centralLoginUrl = buildCentralLoginUrl({
    centralAuth,
    returnTo: safeReturnTo
  });

  if (mode === 'central') {
    return {
      handled: true,
      mode: 'central',
      redirectUrl: centralLoginUrl,
      status: 302,
      body: buildPublicLoginEntry({ context, mode: 'central', redirectUrl: centralLoginUrl, returnTo: safeReturnTo })
    };
  }

  return {
    handled: true,
    mode: 'local_twitch_fallback',
    redirectUrl: localTwitchStartPath,
    status: 302,
    body: buildPublicLoginEntry({ context, mode: 'local_twitch_fallback', redirectUrl: localTwitchStartPath, returnTo: safeReturnTo })
  };
}

function buildPublicLoginPlan({ context }) {
  const config = context.config || {};
  const centralAuth = config.centralAuth || {};

  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_auth_login_entry',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap_auth2.v1',
    readOnly: true,
    writeEnabled: false,
    remoteWritesEnabled: false,
    agentActionsEnabled: false,
    centralAuth: {
      prepared: true,
      mode: centralAuth.mode || 'local_twitch_fallback',
      baseUrl: centralAuth.baseUrl || 'https://forrestcgn.de',
      loginEntryPath: centralAuth.loginEntryPath || '/api/remote/auth/login/start',
      localTwitchStartPath: centralAuth.localTwitchStartPath || '/api/remote/auth/twitch/start',
      centralLoginUrl: centralAuth.centralLoginUrl || 'https://forrestcgn.de/login?returnTo=https%3A%2F%2Fmods.forrestcgn.de%2F',
      sharedDatabasePlanned: true,
      sharedCookieDomainPlanned: '.forrestcgn.de',
      sessionTables: ['dashboard_users', 'dashboard_identities', 'dashboard_sessions']
    },
    flow: [
      'User kann spaeter ueber forrestcgn.de oder mods.forrestcgn.de starten.',
      'Beide Einstiege sollen dieselbe zentrale Auth-/Session-Schicht nutzen.',
      'Login-Daten, Twitch-Tokens oder Sessionwerte werden nicht per Link oder Frontend weitergereicht.',
      'mods.forrestcgn.de prueft serverseitig Session + remote.view Permission.',
      'Aktuell bleibt local_twitch_fallback aktiv, damit der funktionierende Login nicht kaputt umgebaut wird.'
    ],
    safety: context.safety
  };
}

function buildPublicLoginEntry({ context, mode, redirectUrl, returnTo }) {
  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_auth_login_entry',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap_auth2.v1',
    mode,
    redirectUrl,
    returnTo,
    readOnly: true,
    writeEnabled: false,
    remoteWritesEnabled: false,
    agentActionsEnabled: false,
    note: mode === 'central'
      ? 'Redirect zur zentralen Login-Schicht vorbereitet.'
      : 'Redirect zum bestehenden Modboard-Twitch-Login, solange zentrale Login-Schicht noch nicht aktiv ist.'
  };
}

function buildCentralLoginUrl({ centralAuth, returnTo }) {
  const baseUrl = centralAuth.baseUrl || 'https://forrestcgn.de';
  const pathName = centralAuth.loginPath || '/login';

  try {
    const url = new URL(pathName, baseUrl.replace(/\/+$/, '/') || 'https://forrestcgn.de/');
    url.searchParams.set('returnTo', returnTo || 'https://mods.forrestcgn.de/');
    return url.toString();
  } catch (err) {
    return 'https://forrestcgn.de/login?returnTo=https%3A%2F%2Fmods.forrestcgn.de%2F';
  }
}

function readReturnTo(req) {
  const value = req && req.query ? req.query.returnTo : null;
  if (Array.isArray(value)) return value[0];
  if (typeof value === 'string') return value;
  return null;
}

function sanitizeReturnTo(value, publicBaseUrl) {
  const fallback = normalizeBase(publicBaseUrl || 'https://mods.forrestcgn.de');
  if (typeof value !== 'string' || value.trim() === '') return fallback;

  try {
    const parsed = new URL(value.trim(), fallback);
    const allowedHosts = new Set([
      new URL(fallback).host,
      'mods.forrestcgn.de'
    ]);

    if (parsed.protocol !== 'https:' && parsed.hostname !== '127.0.0.1' && parsed.hostname !== 'localhost') return fallback;
    if (!allowedHosts.has(parsed.host) && parsed.hostname !== '127.0.0.1' && parsed.hostname !== 'localhost') return fallback;

    return parsed.toString();
  } catch (err) {
    return fallback;
  }
}

function normalizeBase(value) {
  try {
    const url = new URL(value);
    if (!url.pathname || url.pathname === '') url.pathname = '/';
    return url.toString();
  } catch (err) {
    return 'https://mods.forrestcgn.de/';
  }
}

module.exports = {
  buildLoginEntry,
  buildPublicLoginPlan,
  sanitizeReturnTo
};
