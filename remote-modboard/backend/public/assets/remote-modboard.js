'use strict';

const endpoints = {
  status: '/api/remote/status',
  routes: '/api/remote/routes',
  authMe: '/api/remote/auth/me',
  loginPlan: '/api/remote/auth/login/plan',
  authModel: '/api/remote/auth/model',
  permission: '/api/remote/auth/permissions/check?permission=remote.view',
  lockAudit: '/api/remote/lock-audit/status?db=1',
  schemaAdapter: '/api/remote/lock-audit/schema-adapter/status?db=1'
};

const endpointLabels = {
  status: 'Status',
  routes: 'Routen',
  authMe: 'Auth/me',
  loginPlan: 'Login-Plan',
  authModel: 'Auth-Modell',
  permission: 'Permission remote.view',
  lockAudit: 'Lock-/Audit',
  schemaAdapter: 'Schema-Adapter'
};

const AUTO_REFRESH_SECONDS = 30;
let refreshTimer = null;
let refreshCountdown = AUTO_REFRESH_SECONDS;
let isLoading = false;
let currentPage = 'overview';

window.addEventListener('scroll', () => {
  document.body.classList.toggle('is-scrolled', window.scrollY > 6);
}, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
  bindNavigation();
  bindOptional('refreshButton', 'click', () => loadDashboard('manual'));
  bindOptional('clearErrorsButton', 'click', hideErrors);
  bindOptional('logoutButton', 'click', logout);
  bindOptional('deniedLogoutButton', 'click', logout);
  bindOptional('navToggle', 'click', () => document.body.classList.toggle('nav-collapsed'));
  bindOptional('scrim', 'click', () => document.body.classList.remove('nav-collapsed'));
  startAutoRefresh();
  loadDashboard('initial');
});

function bindNavigation() {
  document.querySelectorAll('.nav-group[data-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.target;
      const sub = target ? byId(target) : null;
      const open = button.classList.contains('is-open');

      document.querySelectorAll('.nav-group').forEach(node => node.classList.remove('is-open'));
      document.querySelectorAll('.nav-sub').forEach(node => node.classList.remove('is-open'));

      if (!open) {
        button.classList.add('is-open');
        if (sub) sub.classList.add('is-open');
      }
    });
  });

  document.querySelectorAll('.nav-link[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      setPage(button.dataset.page, {
        section: button.dataset.section || 'Remote Modboard',
        title: button.dataset.title || button.textContent.trim(),
        tab: button.dataset.tab || ''
      });
      document.body.classList.remove('nav-collapsed');
    });
  });
}

function setPage(page, meta) {
  currentPage = document.querySelector(`[data-page-panel="${cssEscape(page)}"]`) ? page : 'overview';
  const activeLink = document.querySelector(`.nav-link[data-page="${cssEscape(currentPage)}"]`);
  const section = meta && meta.section ? meta.section : (activeLink ? activeLink.dataset.section : 'System');
  const title = meta && meta.title ? meta.title : (activeLink ? activeLink.dataset.title : 'Übersicht');
  const tab = meta && meta.tab ? meta.tab : (activeLink ? activeLink.dataset.tab : 'Status');

  setText('sectionLabel', section);
  const pageTitle = byId('pageTitle');
  if (pageTitle) {
    pageTitle.innerHTML = `${escapeHtml(title)}${tab ? ` <span class="tab-part">${escapeHtml(tab)}</span>` : ''}`;
  }

  document.querySelectorAll('.nav-link[data-page]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.page === currentPage);
  });

  document.querySelectorAll('[data-page-panel]').forEach((panel) => {
    panel.classList.toggle('is-active-view', panel.dataset.pagePanel === currentPage);
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
  if (refreshTimer) window.clearInterval(refreshTimer);
  refreshTimer = null;
}

async function loadDashboard(reason) {
  if (isLoading) return;
  isLoading = true;
  refreshCountdown = AUTO_REFRESH_SECONDS;
  updateAutoRefreshText('lädt…');
  const refreshButton = byId('refreshButton');
  if (refreshButton) refreshButton.disabled = true;

  const entries = await Promise.all(Object.entries(endpoints).map(async ([key, url]) => {
    const result = await getJson(url);
    return [key, result];
  }));

  const results = Object.fromEntries(entries);

  renderScenes(results.authMe, results.status, results.loginPlan);
  renderStatus(results.status);
  renderSecurity(results.status, results.lockAudit, results.loginPlan);
  renderRoutes(results.routes);
  renderAuth(results.authMe, results.permission, results.status);
  renderAccessModel(results.authMe, results.permission, results.authModel);
  renderLockAudit(results.lockAudit, results.schemaAdapter);
  renderEndpoints(results);
  renderQuickStatus(results);
  renderErrors(results);

  setText('lastUpdatedText', `Aktualisiert: ${new Date().toLocaleString('de-DE')}`);

  isLoading = false;
  if (refreshButton) refreshButton.disabled = false;
  updateAutoRefreshText(reason ? `Auto-Refresh in ${refreshCountdown}s · ${reason}` : undefined);
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
  try {
    await fetch('/api/remote/auth/logout', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
  } catch (err) {}
  window.location.href = '/';
}

function renderScenes(authMe, status, loginPlan) {
  const authBody = (authMe && authMe.body) || {};
  const statusBody = (status && status.body) || {};
  const loginBody = (loginPlan && loginPlan.body) || {};
  const authEnabled = Boolean(statusBody.auth && statusBody.auth.loginEnabled);
  const loggedIn = Boolean(authBody.loggedIn);
  const allowed = Boolean(authBody.dashboardAccess);
  const user = authBody.user || null;
  const loginStartLink = byId('loginStartLink');

  if (loginStartLink) {
    loginStartLink.href = loginBody.centralAuth && loginBody.centralAuth.loginEntryPath
      ? loginBody.centralAuth.loginEntryPath
      : '/api/remote/auth/login/start';
  }

  setHidden('loginScene', authEnabled ? loggedIn : true);
  setHidden('deniedScene', !(authEnabled && loggedIn && !allowed));
  setHidden('dashboardScene', authEnabled ? !allowed : false);

  if (loggedIn && !allowed) {
    setText('deniedUserText', `${user ? (user.displayName || user.loginName || user.userUid) : 'Dieser Twitch-Account'} ist angemeldet, aber noch nicht freigeschaltet. Grund: ${authBody.accessReason || 'not_allowed'}.`);
  }
}

function renderStatus(result) {
  const body = (result && result.body) || {};
  const auth = body.auth || {};
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

  setChip('quickService', results.status && results.status.ok, results.status && results.status.ok ? 'Service online' : 'Service prüfen');
  setChip('quickLogin', authMe.dashboardAccess === true, authMe.dashboardAccess ? 'Login freigegeben' : (authMe.loggedIn ? 'Login gesperrt' : 'Login nötig'));
  setChip('quickOAuth', oauth.effectiveEnabled === true, oauth.effectiveEnabled ? 'OAuth aktiv' : 'OAuth gated');
  setChip('quickAgent', agent.actionsEnabled === false, 'Agent disabled');
}

function renderSecurity(status, lockAudit, loginPlan) {
  const statusBody = (status && status.body) || {};
  const lockBody = (lockAudit && lockAudit.body) || {};
  const loginBody = (loginPlan && loginPlan.body) || {};
  const agent = statusBody.agent || {};
  const items = [
    ['Zentrale Login-Schicht vorbereitet', Boolean(loginBody.centralAuth && loginBody.centralAuth.prepared)],
    ['Gemeinsame DB-Session-Wahrheit geplant', Boolean(loginBody.centralAuth && loginBody.centralAuth.sharedDatabasePlanned)],
    ['Dashboard-Zugriff serverseitig geprüft', true],
    ['Login-Gate aktiv', true],
    ['Access-Denied für nicht freigeschaltete User', true],
    ['Remote-Writes disabled', statusBody.writeEnabled === false && lockBody.writeEnabled === false],
    ['Agent-Actions disabled', agent.actionsEnabled === false || lockBody.agentActionsEnabled === false],
    ['OBS/Sound/Overlay/Commands disabled', true]
  ];

  const list = byId('securityList');
  if (!list) return;
  list.innerHTML = items.map(([label, ok]) => {
    const state = ok ? 'valueTrue' : 'valueFalse';
    const text = ok ? 'OK' : 'prüfen';
    return `<li><span>${escapeHtml(label)}</span><strong class="${state}">${text}</strong></li>`;
  }).join('');
}

function renderLockAudit(lockAudit, schemaAdapter) {
  const body = (lockAudit && lockAudit.body) || {};
  const schemaBody = (schemaAdapter && schemaAdapter.body) || body;
  const locks = body.locks || {};
  const audit = body.audit || {};
  setChip('lockAuditPill', lockAudit && lockAudit.ok, lockAudit && lockAudit.ok ? 'read-only ok' : 'prüfen');
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
  const routes = (result && result.body && Array.isArray(result.body.routes)) ? result.body.routes : [];
  setChip('routesPill', result && result.ok, result && result.ok ? `${routes.length} Routen` : 'Fehler');
  const routesList = byId('routesList');
  if (!routesList) return;
  routesList.innerHTML = routes.map(route => `
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
  const authBody = (authMe && authMe.body) || {};
  const permissionBody = (permission && permission.body) || {};
  const user = authBody.user || null;

  setText('loginStateText', authBody.dashboardAccess ? `${user ? (user.displayName || user.loginName || user.userUid) : 'Twitch-User'}` : 'Nicht freigegeben');
  setValue('authLoggedIn', authBody.loggedIn);
  setValue('dashboardAccess', authBody.dashboardAccess);
  setText('accessReason', authBody.accessReason || '—');
  setText('authUser', user ? `${user.displayName || user.loginName || user.userUid} (${user.userUid})` : '—');
  setText('authRoles', formatList(authBody.roles));
  setText('authSessionReason', authBody.session ? authBody.session.reason : '—');
  setValue('permissionAllowed', permissionBody.allowed);
  setText('permissionReason', permissionBody.reason || authBody.reason || '—');
  void status;
}


function renderAccessModel(authMe, permission, authModel) {
  const authBody = (authMe && authMe.body) || {};
  const permissionBody = (permission && permission.body) || {};
  const modelBody = (authModel && authModel.body) || {};
  const user = authBody.user || null;
  const counts = modelBody.counts || {};
  const model = modelBody.model || {};
  const validation = modelBody.validation || {};
  const groups = Array.isArray(authBody.groups) ? authBody.groups.map(group => group.groupKey || group.group_key || group).filter(Boolean) : [];

  setValue('accessLoggedIn', authBody.loggedIn);
  setValue('accessDashboardAllowed', authBody.dashboardAccess);
  setValue('accessPermissionRemoteView', permissionBody.allowed);
  setValue('accessSchemaReady', validation.schemaReady || (modelBody.schema && modelBody.schema.ready));
  setValue('accessSchemaReadyDetail', validation.schemaReady || (modelBody.schema && modelBody.schema.ready));
  setText('accessUser', user ? `${user.displayName || user.loginName || user.userUid} (${user.userUid})` : '—');
  setText('accessReasonDetail', authBody.accessReason || permissionBody.reason || '—');
  setText('accessRoles', formatList(authBody.roles));
  setText('accessGroups', formatList(groups));
  setText('accessSessionReason', authBody.session ? authBody.session.reason : '—');
  setText('accessCountUsers', formatCount(counts.dashboard_users));
  setText('accessCountSessions', formatCount(counts.dashboard_sessions));
  setText('accessCountAudit', formatCount(counts.dashboard_audit_log));
  setText('accessCountLocks', formatCount(counts.dashboard_locks));

  setChip('accessModelPill', authModel && authModel.ok, authModel && authModel.ok ? 'DB-Modell ok' : 'DB-Modell prüfen');
  renderModelList('accessRolesModel', model.roles, row => `${row.role_key || 'role'}${row.label ? ` · ${row.label}` : ''}`);
  renderModelList('accessGroupsModel', model.groups, row => `${row.group_key || 'group'}${row.label ? ` · ${row.label}` : ''}${row.group_type ? ` · ${row.group_type}` : ''}`);
  renderModelList('accessPermissionsModel', model.permissions, row => `${row.permission_key || 'permission'}${row.area ? ` · ${row.area}` : ''}`);
}

function renderModelList(id, rows, formatter) {
  const node = byId(id);
  if (!node) return;
  const values = Array.isArray(rows) ? rows : [];
  if (!values.length) {
    node.innerHTML = '<div class="model-row"><strong>—</strong><small>Keine Einträge oder DB nicht lesbar</small></div>';
    return;
  }
  node.innerHTML = values.slice(0, 12).map((row) => {
    const title = formatter(row);
    const description = row.description || row.protection_level || row.effect || row.status || '';
    return `<div class="model-row"><strong>${escapeHtml(title)}</strong>${description ? `<small>${escapeHtml(description)}</small>` : ''}</div>`;
  }).join('') + (values.length > 12 ? `<div class="model-row muted"><strong>+${values.length - 12}</strong><small>weitere Einträge über /api/remote/auth/model</small></div>` : '');
}

function formatCount(value) {
  if (value == null || value === '') return '—';
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : String(value);
}

function renderEndpoints(results) {
  const values = Object.entries(results || {});
  const okCount = values.filter(([, result]) => result.ok).length;
  setChip('endpointPill', okCount === values.length, `${okCount}/${values.length} ok`);
  const endpointList = byId('endpointList');
  if (!endpointList) return;
  endpointList.innerHTML = values.map(([key, result]) => {
    const label = endpointLabels[key] || key;
    const status = result.httpStatus || 'fetch';
    const cls = result.ok ? 'endpoint ok' : 'endpoint bad';
    const detail = result.error || (result.body && result.body.error) || (result.ok ? 'ok' : 'prüfen');
    return `<div class="${cls}"><span>${escapeHtml(label)}</span><strong>HTTP ${escapeHtml(status)}</strong><small>${escapeHtml(detail)}</small></div>`;
  }).join('');
}

function renderErrors(results) {
  const failed = Object.entries(results || {}).filter(([, result]) => !result.ok && result.httpStatus !== 403);
  if (!failed.length) {
    hideErrors();
    return;
  }
  setText('errorText', failed.map(([key, result]) => {
    const label = endpointLabels[key] || key;
    const detail = result.error || (result.body && result.body.error) || `HTTP ${result.httpStatus || 0}`;
    return `${label}: ${detail}`;
  }).join(' · '));
  setHidden('errorBox', false);
}

function hideErrors() {
  setHidden('errorBox', true);
}

function updateAutoRefreshText(override) {
  const node = byId('autoRefreshText');
  if (node) node.textContent = override || `Auto-Refresh in ${refreshCountdown}s`;
}

function setChip(id, ok, text) {
  const node = byId(id);
  if (!node) return;
  node.textContent = text;
  node.className = ok ? 'cgn-chip cgn-chip--ok' : 'cgn-chip cgn-chip--warn';
}

function setValue(id, value) {
  const node = byId(id);
  if (!node) return;
  node.textContent = formatValue(value);
  node.className = value === true ? 'valueTrue' : value === false ? 'valueFalse' : 'valueNeutral';
}

function setText(id, value) {
  const node = byId(id);
  if (!node) return;
  node.textContent = value == null || value === '' ? '—' : String(value);
}

function setHidden(id, hidden) {
  const node = byId(id);
  if (node) node.hidden = Boolean(hidden);
}

function bindOptional(id, eventName, handler) {
  const node = byId(id);
  if (node) node.addEventListener(eventName, handler);
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

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(value));
  return String(value).replace(/[^A-Za-z0-9_-]/g, '\\$&');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
