'use strict';

const endpoints = {
  status: '/api/remote/status',
  routes: '/api/remote/routes',
  authMe: '/api/remote/auth/me',
  permission: '/api/remote/auth/permissions/check?permission=remote.view',
  lockAudit: '/api/remote/lock-audit/status?db=1',
  schemaAdapter: '/api/remote/lock-audit/schema-adapter/status?db=1'
};

const endpointLabels = {
  status: 'Status',
  routes: 'Routen',
  authMe: 'Auth/me',
  permission: 'Permission remote.view',
  lockAudit: 'Lock-/Audit',
  schemaAdapter: 'Schema-Adapter'
};

const ids = {
  serviceOnlineBadge: 'serviceOnlineBadge',
  lastUpdatedText: 'lastUpdatedText',
  autoRefreshText: 'autoRefreshText',
  loginStateText: 'loginStateText',
  loginButton: 'loginButton',
  logoutButton: 'logoutButton',
  quickService: 'quickService',
  quickLogin: 'quickLogin',
  quickOAuth: 'quickOAuth',
  quickAgent: 'quickAgent',
  errorBox: 'errorBox',
  errorText: 'errorText',
  clearErrorsButton: 'clearErrorsButton',
  endpointPill: 'endpointPill',
  endpointList: 'endpointList',
  statusPill: 'statusPill',
  statusOk: 'statusOk',
  statusAuthEnabled: 'statusAuthEnabled',
  statusLoginEnabled: 'statusLoginEnabled',
  statusWriteEnabled: 'statusWriteEnabled',
  statusApiVersion: 'statusApiVersion',
  statusModuleBuild: 'statusModuleBuild',
  statusGeneratedAt: 'statusGeneratedAt',
  securityList: 'securityList',
  lockAuditPill: 'lockAuditPill',
  schemaAdapterPrepared: 'schemaAdapterPrepared',
  locksRead: 'locksRead',
  locksWrite: 'locksWrite',
  locksMissing: 'locksMissing',
  auditRead: 'auditRead',
  auditWrite: 'auditWrite',
  lockAcquireEnabled: 'lockAcquireEnabled',
  auditInsertEnabled: 'auditInsertEnabled',
  routesPill: 'routesPill',
  routesList: 'routesList',
  authLoggedIn: 'authLoggedIn',
  authUser: 'authUser',
  authRoles: 'authRoles',
  permissionAllowed: 'permissionAllowed',
  permissionReason: 'permissionReason',
  refreshButton: 'refreshButton'
};

const AUTO_REFRESH_SECONDS = 30;
let refreshTimer = null;
let refreshCountdown = AUTO_REFRESH_SECONDS;
let isLoading = false;

document.addEventListener('DOMContentLoaded', () => {
  el(ids.refreshButton).addEventListener('click', () => loadDashboard('manual'));
  el(ids.clearErrorsButton).addEventListener('click', hideErrors);
  el(ids.logoutButton).addEventListener('click', logout);
  startAutoRefresh();
  loadDashboard('initial');
});

function startAutoRefresh() {
  stopAutoRefresh();
  refreshCountdown = AUTO_REFRESH_SECONDS;
  updateAutoRefreshText();

  refreshTimer = window.setInterval(() => {
    refreshCountdown -= 1;
    if (refreshCountdown <= 0) {
      loadDashboard('auto');
      refreshCountdown = AUTO_REFRESH_SECONDS;
    }
    updateAutoRefreshText();
  }, 1000);
}

function stopAutoRefresh() {
  if (refreshTimer) {
    window.clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

async function loadDashboard(reason) {
  if (isLoading) return;
  isLoading = true;
  refreshCountdown = AUTO_REFRESH_SECONDS;
  updateAutoRefreshText('lädt…');

  setText(ids.serviceOnlineBadge, 'prüfe Service…');
  el(ids.serviceOnlineBadge).className = 'modeBadge';
  el(ids.refreshButton).disabled = true;

  const entries = await Promise.all(Object.entries(endpoints).map(async ([key, url]) => {
    const result = await getJson(url);
    return [key, result];
  }));

  const results = Object.fromEntries(entries);

  renderStatus(results.status);
  renderSecurity(results.status, results.lockAudit);
  renderRoutes(results.routes);
  renderAuth(results.authMe, results.permission, results.status);
  renderLockAudit(results.lockAudit, results.schemaAdapter);
  renderEndpoints(results);
  renderQuickStatus(results);
  renderErrors(results);

  setText(ids.lastUpdatedText, `Aktualisiert: ${new Date().toLocaleString('de-DE')} · ${reason || 'load'}`);

  isLoading = false;
  el(ids.refreshButton).disabled = false;
  updateAutoRefreshText();
}

async function getJson(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });

    const body = await response.json().catch(() => null);

    return {
      ok: response.ok && body && body.ok !== false,
      httpStatus: response.status,
      body,
      error: null
    };
  } catch (err) {
    return {
      ok: false,
      httpStatus: 0,
      body: null,
      error: err && err.message ? err.message : 'fetch_failed'
    };
  }
}

async function logout() {
  el(ids.logoutButton).disabled = true;
  try {
    await fetch('/api/remote/auth/logout', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });
  } catch (err) {
    // The next reload will show the real state.
  }
  await loadDashboard('logout');
  el(ids.logoutButton).disabled = false;
}

function renderStatus(result) {
  const body = result.body || {};
  const auth = body.auth || {};

  setBadge(ids.statusPill, result.ok, result.ok ? 'online' : 'Fehler');
  setText(ids.serviceOnlineBadge, result.ok ? 'Service online' : 'Service nicht erreichbar');
  el(ids.serviceOnlineBadge).className = result.ok ? 'modeBadge online' : 'modeBadge bad';

  setValue(ids.statusOk, body.ok);
  setValue(ids.statusAuthEnabled, auth.enabled);
  setValue(ids.statusLoginEnabled, auth.loginEnabled);
  setValue(ids.statusWriteEnabled, body.writeEnabled);
  setText(ids.statusApiVersion, body.statusApiVersion || '—');
  setText(ids.statusModuleBuild, body.moduleBuild || '—');
  setText(ids.statusGeneratedAt, formatDate(body.generatedAt));
}

function renderQuickStatus(results) {
  const statusBody = (results.status && results.status.body) || {};
  const authMe = (results.authMe && results.authMe.body) || {};
  const auth = statusBody.auth || {};
  const oauth = auth.twitchOAuth || {};
  const agent = statusBody.agent || {};

  setQuick(ids.quickService, results.status && results.status.ok, results.status && results.status.ok ? 'online' : 'prüfen');
  setQuick(ids.quickLogin, authMe.loggedIn === true || auth.loginEnabled === true, authMe.loggedIn ? 'eingeloggt' : (auth.loginEnabled ? 'bereit' : 'gated'));
  setQuick(ids.quickOAuth, oauth.startRouteEnabled === true || oauth.effectiveEnabled === true, oauth.effectiveEnabled ? 'aktiv' : 'gated');
  setQuick(ids.quickAgent, agent.actionsEnabled === false, 'disabled');
}

function renderSecurity(status, lockAudit) {
  const statusBody = status.body || {};
  const lockBody = lockAudit.body || {};
  const auth = statusBody.auth || {};
  const oauth = auth.twitchOAuth || {};
  const agent = statusBody.agent || {};

  const items = [
    ['Login gated/controlled', auth.loginEnabled === true || auth.enabled === false],
    ['OAuth gated/controlled', oauth.effectiveEnabled === true || oauth.startRouteEnabled === false],
    ['Remote-Writes disabled', statusBody.writeEnabled === false && lockBody.writeEnabled === false],
    ['Agent-Actions disabled', agent.actionsEnabled === false || lockBody.agentActionsEnabled === false],
    ['Session cookie HttpOnly serverseitig', true],
    ['last_seen_at Update disabled in AUTH1', true]
  ];

  el(ids.securityList).innerHTML = items.map(([label, ok]) => {
    const state = ok ? 'valueTrue' : 'valueFalse';
    const text = ok ? 'OK' : 'prüfen';
    return `<li><span>${escapeHtml(label)}</span> <strong class="${state}">${text}</strong></li>`;
  }).join('');
}

function renderLockAudit(lockAudit, schemaAdapter) {
  const body = lockAudit.body || {};
  const schemaBody = schemaAdapter.body || body;
  const locks = body.locks || {};
  const audit = body.audit || {};

  setBadge(ids.lockAuditPill, lockAudit.ok, lockAudit.ok ? 'read-only ok' : 'prüfen');

  setValue(ids.schemaAdapterPrepared, schemaBody.schemaAdapterPrepared);
  setValue(ids.locksRead, getNested(locks, ['adapter', 'compatibleForRead']));
  setValue(ids.locksWrite, getNested(locks, ['adapter', 'compatibleForWrite']));
  setText(ids.locksMissing, formatList(getNested(locks, ['adapter', 'missingForWrite'])));
  setValue(ids.auditRead, getNested(audit, ['adapter', 'compatibleForRead']));
  setValue(ids.auditWrite, getNested(audit, ['adapter', 'compatibleForWrite']));
  setValue(ids.lockAcquireEnabled, body.lockAcquireEnabled);
  setValue(ids.auditInsertEnabled, body.auditInsertEnabled);
}

function renderRoutes(result) {
  const routes = (result.body && Array.isArray(result.body.routes)) ? result.body.routes : [];
  setBadge(ids.routesPill, result.ok, result.ok ? `${routes.length} Routen` : 'Fehler');

  const preferred = [
    '/api/remote/health',
    '/api/remote/status',
    '/api/remote/routes',
    '/api/remote/auth/me',
    '/api/remote/auth/permissions/check',
    '/api/remote/auth/twitch/start',
    '/api/remote/auth/twitch/callback',
    '/api/remote/auth/logout',
    '/api/remote/lock-audit/status',
    '/api/remote/lock-audit/schema-adapter/status'
  ];

  const filtered = routes.filter(route => preferred.includes(route.path));

  el(ids.routesList).innerHTML = filtered.map(route => `
    <div class="route">
      <span class="method">${escapeHtml(route.method || 'GET')}</span>
      <div>
        <div class="routePath">${escapeHtml(route.path || '')}</div>
        <div class="routeDescription">${escapeHtml(route.description || 'Diagnose-/Auth-Route')}</div>
      </div>
    </div>
  `).join('') || '<div class="route"><span class="method">GET</span><div><div class="routePath">Keine Routen geladen</div></div></div>';
}

function renderAuth(authMe, permission, status) {
  const authBody = authMe.body || {};
  const permissionBody = permission.body || {};
  const statusBody = status.body || {};
  const loginEnabled = Boolean(statusBody.auth && statusBody.auth.loginEnabled);
  const loggedIn = Boolean(authBody.loggedIn);
  const user = authBody.user || null;

  setValue(ids.authLoggedIn, authBody.loggedIn);
  setText(ids.authUser, user ? `${user.displayName || user.loginName || user.userUid} (${user.userUid})` : '—');
  setText(ids.authRoles, formatList(authBody.roles));
  setValue(ids.permissionAllowed, permissionBody.allowed);
  setText(ids.permissionReason, permissionBody.reason || authBody.reason || (loggedIn ? 'logged_in' : '—'));

  if (loggedIn) {
    setText(ids.loginStateText, `Angemeldet als ${user && (user.displayName || user.loginName || user.userUid) ? (user.displayName || user.loginName || user.userUid) : 'Twitch-User'}.`);
    el(ids.loginButton).hidden = true;
    el(ids.logoutButton).hidden = false;
    return;
  }

  el(ids.logoutButton).hidden = true;
  el(ids.loginButton).hidden = false;

  if (loginEnabled) {
    setText(ids.loginStateText, 'Login ist serverseitig aktiviert. Du kannst dich mit Twitch anmelden.');
    el(ids.loginButton).classList.remove('disabled');
  } else {
    setText(ids.loginStateText, 'Login ist vorbereitet, aber noch nicht aktiviert. Es fehlen Env-Flags/Secrets oder die Gates sind aus.');
    el(ids.loginButton).classList.add('disabled');
  }
}

function renderEndpoints(results) {
  const values = Object.entries(results);
  const okCount = values.filter(([, result]) => result.ok).length;

  setBadge(ids.endpointPill, okCount === values.length, `${okCount}/${values.length} ok`);

  el(ids.endpointList).innerHTML = values.map(([key, result]) => {
    const label = endpointLabels[key] || key;
    const status = result.httpStatus || 'fetch';
    const cls = result.ok ? 'endpoint ok' : 'endpoint bad';
    const detail = result.error || (result.body && result.body.error) || (result.ok ? 'ok' : 'prüfen');
    return `
      <div class="${cls}">
        <span>${escapeHtml(label)}</span>
        <strong>HTTP ${escapeHtml(status)}</strong>
        <small>${escapeHtml(detail)}</small>
      </div>
    `;
  }).join('');
}

function renderErrors(results) {
  const failed = Object.entries(results).filter(([, result]) => !result.ok && result.httpStatus !== 403);

  if (!failed.length) {
    hideErrors();
    return;
  }

  const text = failed.map(([key, result]) => {
    const label = endpointLabels[key] || key;
    const detail = result.error || (result.body && result.body.error) || `HTTP ${result.httpStatus || 0}`;
    return `${label}: ${detail}`;
  }).join(' · ');

  setText(ids.errorText, text);
  el(ids.errorBox).hidden = false;
}

function hideErrors() {
  el(ids.errorBox).hidden = true;
}

function updateAutoRefreshText(override) {
  setText(ids.autoRefreshText, override || `Auto-Refresh in ${refreshCountdown}s`);
}

function setBadge(id, ok, text) {
  const node = el(id);
  node.textContent = text;
  node.className = ok ? 'pill ok' : 'pill bad';
}

function setQuick(id, ok, text) {
  const node = el(id);
  node.textContent = text;
  node.className = ok ? 'quickGood' : 'quickBad';
}

function setValue(id, value) {
  const node = el(id);
  node.textContent = formatValue(value);
  node.className = value === true ? 'valueTrue' : value === false ? 'valueFalse' : 'valueNeutral';
}

function setText(id, value) {
  el(id).textContent = value == null || value === '' ? '—' : String(value);
}

function formatValue(value) {
  if (value === true) return 'true';
  if (value === false) return 'false';
  if (value == null || value === '') return '—';
  return String(value);
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('de-DE');
}

function formatList(value) {
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  if (value == null || value === '') return '—';
  return String(value);
}

function getNested(obj, keys) {
  let current = obj;
  for (const key of keys) {
    if (!current || typeof current !== 'object') return undefined;
    current = current[key];
  }
  return current;
}

function el(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
