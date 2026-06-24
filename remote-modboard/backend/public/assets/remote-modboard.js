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

const pageTitles = {
  overview: 'Übersicht',
  diagnostics: 'Diagnose',
  routes: 'Routen',
  account: 'Mein Login',
  permissions: 'Rechte-Diagnose',
  modules: 'Module'
};

const AUTO_REFRESH_SECONDS = 30;
let refreshTimer = null;
let refreshCountdown = AUTO_REFRESH_SECONDS;
let isLoading = false;
let currentPage = 'overview';

document.addEventListener('DOMContentLoaded', () => {
  bindNavigation();
  byId('refreshButton').addEventListener('click', () => loadDashboard('manual'));
  byId('clearErrorsButton').addEventListener('click', hideErrors);
  byId('logoutButton').addEventListener('click', logout);
  startAutoRefresh();
  loadDashboard('initial');
});

function bindNavigation() {
  document.querySelectorAll('[data-nav-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.closest('.navGroup');
      if (group) group.classList.toggle('isOpen');
    });
  });

  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => setPage(button.dataset.page));
  });
}

function setPage(page) {
  currentPage = pageTitles[page] ? page : 'overview';
  byId('pageTitle').textContent = pageTitles[currentPage];

  document.querySelectorAll('[data-page]').forEach((button) => {
    button.classList.toggle('active', button.dataset.page === currentPage);
  });

  document.querySelectorAll('[data-page-panel]').forEach((panel) => {
    panel.classList.toggle('activePage', panel.dataset.pagePanel === currentPage);
  });
}

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
  byId('refreshButton').disabled = true;

  const entries = await Promise.all(Object.entries(endpoints).map(async ([key, url]) => {
    const result = await getJson(url);
    return [key, result];
  }));

  const results = Object.fromEntries(entries);

  renderAuthGate(results.authMe, results.status);
  renderStatus(results.status);
  renderSecurity(results.status, results.lockAudit);
  renderRoutes(results.routes);
  renderAuth(results.authMe, results.permission, results.status);
  renderLockAudit(results.lockAudit, results.schemaAdapter);
  renderEndpoints(results);
  renderQuickStatus(results);
  renderErrors(results);

  byId('lastUpdatedText').textContent = `Aktualisiert: ${new Date().toLocaleString('de-DE')} · ${reason || 'load'}`;

  isLoading = false;
  byId('refreshButton').disabled = false;
  updateAutoRefreshText();
}

async function getJson(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
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
  byId('logoutButton').disabled = true;
  try {
    await fetch('/api/remote/auth/logout', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
  } catch (err) {}
  await loadDashboard('logout');
  byId('logoutButton').disabled = false;
}

function renderAuthGate(authMe, status) {
  const authBody = authMe.body || {};
  const statusBody = status.body || {};
  const authEnabled = Boolean(statusBody.auth && statusBody.auth.loginEnabled);
  const loggedIn = Boolean(authBody.loggedIn);

  byId('authGate').hidden = loggedIn || !authEnabled;
  byId('dashboardContent').hidden = authEnabled && !loggedIn;

  if (!authEnabled) {
    byId('dashboardContent').hidden = false;
  }
}

function renderStatus(result) {
  const body = result.body || {};
  const auth = body.auth || {};

  setBadge('statusPill', result.ok, result.ok ? 'online' : 'Fehler');
  setValue('statusOk', body.ok);
  setValue('statusAuthEnabled', auth.enabled);
  setValue('statusLoginEnabled', auth.loginEnabled);
  setValue('statusWriteEnabled', body.writeEnabled);
  setText('statusModuleBuild', body.moduleBuild || '—');
}

function renderQuickStatus(results) {
  const statusBody = (results.status && results.status.body) || {};
  const authMe = (results.authMe && results.authMe.body) || {};
  const auth = statusBody.auth || {};
  const oauth = auth.twitchOAuth || {};
  const agent = statusBody.agent || {};

  setQuick('quickService', results.status && results.status.ok, results.status && results.status.ok ? 'online' : 'prüfen');
  setQuick('quickLogin', authMe.loggedIn === true || auth.loginEnabled === true, authMe.loggedIn ? 'eingeloggt' : (auth.loginEnabled ? 'bereit' : 'gated'));
  setQuick('quickOAuth', oauth.effectiveEnabled === true, oauth.effectiveEnabled ? 'aktiv' : 'gated');
  setQuick('quickAgent', agent.actionsEnabled === false, 'disabled');
}

function renderSecurity(status, lockAudit) {
  const statusBody = status.body || {};
  const lockBody = lockAudit.body || {};
  const auth = statusBody.auth || {};
  const oauth = auth.twitchOAuth || {};
  const agent = statusBody.agent || {};

  const items = [
    ['Login aktiv/gated kontrolliert', auth.loginEnabled === true || auth.enabled === false],
    ['OAuth aktiv/gated kontrolliert', oauth.effectiveEnabled === true || oauth.startRouteEnabled === false],
    ['Remote-Writes disabled', statusBody.writeEnabled === false && lockBody.writeEnabled === false],
    ['Agent-Actions disabled', agent.actionsEnabled === false || lockBody.agentActionsEnabled === false],
    ['OBS/Sound/Overlay/Commands disabled', true],
    ['last_seen_at Update disabled in AUTH1', true]
  ];

  byId('securityList').innerHTML = items.map(([label, ok]) => {
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

  setBadge('lockAuditPill', lockAudit.ok, lockAudit.ok ? 'read-only ok' : 'prüfen');
  setValue('schemaAdapterPrepared', schemaBody.schemaAdapterPrepared);
  setValue('locksRead', getNested(locks, ['adapter', 'compatibleForRead']));
  setValue('locksWrite', getNested(locks, ['adapter', 'compatibleForWrite']));
  setText('locksMissing', formatList(getNested(locks, ['adapter', 'missingForWrite'])));
  setValue('auditRead', getNested(audit, ['adapter', 'compatibleForRead']));
  setValue('auditWrite', getNested(audit, ['adapter', 'compatibleForWrite']));
  setValue('lockAcquireEnabled', body.lockAcquireEnabled);
  setValue('auditInsertEnabled', body.auditInsertEnabled);
}

function renderRoutes(result) {
  const routes = (result.body && Array.isArray(result.body.routes)) ? result.body.routes : [];
  setBadge('routesPill', result.ok, result.ok ? `${routes.length} Routen` : 'Fehler');

  byId('routesList').innerHTML = routes.map(route => `
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

  setValue('authLoggedIn', authBody.loggedIn);
  setText('authUser', user ? `${user.displayName || user.loginName || user.userUid} (${user.userUid})` : '—');
  setText('authRoles', formatList(authBody.roles));
  setText('authSessionReason', authBody.session ? authBody.session.reason : '—');
  setValue('permissionAllowed', permissionBody.allowed);
  setText('permissionReason', permissionBody.reason || authBody.reason || (loggedIn ? 'logged_in' : '—'));

  if (loggedIn) {
    byId('loginStateText').textContent = `Angemeldet als ${user && (user.displayName || user.loginName || user.userUid) ? (user.displayName || user.loginName || user.userUid) : 'Twitch-User'}`;
    byId('loginButton').hidden = true;
    byId('logoutButton').hidden = false;
    return;
  }

  byId('logoutButton').hidden = true;
  byId('loginButton').hidden = false;
  byId('loginStateText').textContent = loginEnabled ? 'Nicht angemeldet' : 'Login nicht aktiv';
}

function renderEndpoints(results) {
  const values = Object.entries(results);
  const okCount = values.filter(([, result]) => result.ok).length;

  setBadge('endpointPill', okCount === values.length, `${okCount}/${values.length} ok`);

  byId('endpointList').innerHTML = values.map(([key, result]) => {
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

  byId('errorText').textContent = failed.map(([key, result]) => {
    const label = endpointLabels[key] || key;
    const detail = result.error || (result.body && result.body.error) || `HTTP ${result.httpStatus || 0}`;
    return `${label}: ${detail}`;
  }).join(' · ');
  byId('errorBox').hidden = false;
}

function hideErrors() {
  byId('errorBox').hidden = true;
}

function updateAutoRefreshText(override) {
  byId('autoRefreshText').textContent = override || `Auto-Refresh in ${refreshCountdown}s`;
}

function setBadge(id, ok, text) {
  const node = byId(id);
  node.textContent = text;
  node.className = ok ? 'pill ok' : 'pill bad';
}

function setQuick(id, ok, text) {
  const node = byId(id);
  node.textContent = text;
  node.className = ok ? 'quickGood' : 'quickBad';
}

function setValue(id, value) {
  const node = byId(id);
  node.textContent = formatValue(value);
  node.className = value === true ? 'valueTrue' : value === false ? 'valueFalse' : 'valueNeutral';
}

function setText(id, value) {
  byId(id).textContent = value == null || value === '' ? '—' : String(value);
}

function formatValue(value) {
  if (value === true) return 'true';
  if (value === false) return 'false';
  if (value == null || value === '') return '—';
  return String(value);
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

function byId(id) {
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
