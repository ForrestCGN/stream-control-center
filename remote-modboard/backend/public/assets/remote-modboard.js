'use strict';

const endpoints = {
  status: '/api/remote/status',
  routes: '/api/remote/routes',
  authMe: '/api/remote/auth/me',
  permission: '/api/remote/auth/permissions/check?permission=remote.view',
  lockAudit: '/api/remote/lock-audit/status?db=1',
  schemaAdapter: '/api/remote/lock-audit/schema-adapter/status?db=1'
};

const ids = {
  serviceOnlineBadge: 'serviceOnlineBadge',
  statusPill: 'statusPill',
  statusOk: 'statusOk',
  statusReadOnly: 'statusReadOnly',
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
  permissionAllowed: 'permissionAllowed',
  permissionReason: 'permissionReason',
  refreshButton: 'refreshButton'
};

document.addEventListener('DOMContentLoaded', () => {
  el(ids.refreshButton).addEventListener('click', loadDashboard);
  loadDashboard();
});

async function loadDashboard() {
  setText(ids.serviceOnlineBadge, 'prüfe Service…');
  el(ids.serviceOnlineBadge).className = 'modeBadge';

  const [status, routes, authMe, permission, lockAudit, schemaAdapter] = await Promise.all([
    getJson(endpoints.status),
    getJson(endpoints.routes),
    getJson(endpoints.authMe),
    getJson(endpoints.permission),
    getJson(endpoints.lockAudit),
    getJson(endpoints.schemaAdapter)
  ]);

  renderStatus(status);
  renderSecurity(status, lockAudit);
  renderRoutes(routes);
  renderAuth(authMe, permission);
  renderLockAudit(lockAudit, schemaAdapter);
}

async function getJson(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'omit',
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

function renderStatus(result) {
  const body = result.body || {};

  setBadge(ids.statusPill, result.ok, result.ok ? 'online' : 'Fehler');
  setText(ids.serviceOnlineBadge, result.ok ? 'Service online' : 'Service nicht erreichbar');
  el(ids.serviceOnlineBadge).className = result.ok ? 'modeBadge online' : 'modeBadge';

  setValue(ids.statusOk, body.ok);
  setValue(ids.statusReadOnly, body.readOnly);
  setValue(ids.statusWriteEnabled, body.writeEnabled);
  setText(ids.statusApiVersion, body.statusApiVersion || '—');
  setText(ids.statusModuleBuild, body.moduleBuild || '—');
  setText(ids.statusGeneratedAt, formatDate(body.generatedAt));
}

function renderSecurity(status, lockAudit) {
  const statusBody = status.body || {};
  const lockBody = lockAudit.body || {};
  const auth = statusBody.auth || {};
  const oauth = auth.twitchOAuth || {};
  const agent = statusBody.agent || {};

  const items = [
    ['Login disabled', auth.loginEnabled === false || auth.enabled === false],
    ['OAuth disabled', oauth.startRouteEnabled === false && oauth.callbackRouteEnabled === false],
    ['Writes disabled', statusBody.writeEnabled === false && lockBody.writeEnabled === false],
    ['Agent-Actions disabled', agent.actionsEnabled === false || lockBody.agentActionsEnabled === false],
    ['Cookies disabled', (auth.sessions || {}).setCookie === false],
    ['Session creation disabled', (auth.sessions || {}).createSession === false]
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
  setBadge(ids.routesPill, result.ok, `${routes.length} Routen`);

  const preferred = [
    '/api/remote/health',
    '/api/remote/status',
    '/api/remote/routes',
    '/api/remote/auth/me',
    '/api/remote/auth/permissions/check',
    '/api/remote/lock-audit/status',
    '/api/remote/lock-audit/schema-adapter/status'
  ];

  const filtered = routes.filter(route => preferred.includes(route.path));

  el(ids.routesList).innerHTML = filtered.map(route => `
    <div class="route">
      <span class="method">${escapeHtml(route.method || 'GET')}</span>
      <div>
        <div class="routePath">${escapeHtml(route.path || '')}</div>
        <div class="routeDescription">${escapeHtml(route.description || 'Read-only Diagnose-Route')}</div>
      </div>
    </div>
  `).join('') || '<div class="route"><span class="method">GET</span><div><div class="routePath">Keine Routen geladen</div></div></div>';
}

function renderAuth(authMe, permission) {
  const authBody = authMe.body || {};
  const permissionBody = permission.body || {};

  setValue(ids.authLoggedIn, authBody.loggedIn);
  setValue(ids.permissionAllowed, permissionBody.allowed);
  setText(ids.permissionReason, permissionBody.reason || authBody.reason || '—');
}

function setBadge(id, ok, text) {
  const node = el(id);
  node.textContent = text;
  node.className = ok ? 'pill ok' : 'pill bad';
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
