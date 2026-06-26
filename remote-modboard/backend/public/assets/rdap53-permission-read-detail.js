'use strict';

(function () {
  const AUTH_MODEL_ENDPOINT = '/api/remote/auth/model';
  const POLISH_ID = 'rdap53PermissionReadDetail';
  const STYLE_ID = 'rdap53PermissionReadDetailStyle';
  const REFRESH_DELAY_MS = 250;
  let latestResult = null;
  let refreshTimer = null;

  document.addEventListener('DOMContentLoaded', () => {
    injectStyle();
    installPanelWhenReady();
    void reloadAuthModel('initial');
  });

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .rdap53-permission-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--gap);margin-top:var(--gap)}
      .rdap53-permission-card{display:grid;gap:10px}
      .rdap53-permission-card .card-head{align-items:flex-start}
      .rdap53-list{display:grid;gap:8px}
      .rdap53-row{padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07)}
      .rdap53-row strong,.rdap53-row small{display:block}
      .rdap53-row strong{color:#fff;font-size:13px}
      .rdap53-row small{color:var(--muted);font-size:12px;margin-top:3px;line-height:1.35}
      .rdap53-note{padding:12px;border-radius:16px;background:rgba(27,216,255,.08);border:1px solid rgba(27,216,255,.20);color:#dff8ff;line-height:1.45}
      .rdap53-note strong{color:#fff}
      @media (max-width:1000px){.rdap53-permission-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function installPanelWhenReady() {
    const panel = document.querySelector('[data-page-panel="admin-user-detail"]');
    if (!panel) {
      window.setTimeout(installPanelWhenReady, 100);
      return;
    }

    if (!document.getElementById(POLISH_ID)) {
      const section = document.createElement('section');
      section.id = POLISH_ID;
      section.className = 'rdap53-permission-grid';
      section.innerHTML = `
        <article class="cgn-card rdap53-permission-card">
          <div class="card-head">
            <div><p class="cgn-eyebrow">Permissions</p><h2>Effektive Rollen-Rechte</h2></div>
            <span class="cgn-chip cgn-chip--info" id="rdap53RolePermissionPill">read-only</span>
          </div>
          <div class="rdap53-list" id="rdap53RolePermissions">—</div>
        </article>
        <article class="cgn-card rdap53-permission-card">
          <div class="card-head">
            <div><p class="cgn-eyebrow">Module / Targets</p><h2>Modulbezogene Rechte</h2></div>
            <span class="cgn-chip cgn-chip--info" id="rdap53ModulePermissionPill">read-only</span>
          </div>
          <div class="rdap53-list" id="rdap53ModulePermissions">—</div>
        </article>
        <article class="cgn-card rdap53-permission-card">
          <div class="card-head">
            <div><p class="cgn-eyebrow">Einordnung</p><h2>Anzeige / Diagnose</h2></div>
            <span class="cgn-chip cgn-chip--warn">keine Writes</span>
          </div>
          <div class="rdap53-note" id="rdap53PermissionNote">Diese Ansicht lädt nur <strong>/api/remote/auth/model</strong> und leitet daraus eine read-only Diagnose ab.</div>
        </article>
        <article class="cgn-card rdap53-permission-card">
          <div class="card-head">
            <div><p class="cgn-eyebrow">Sicherheit</p><h2>Keine Entscheidung im Frontend</h2></div>
            <span class="cgn-chip cgn-chip--warn">gesperrt</span>
          </div>
          <div class="rdap53-note">Das Frontend zeigt nur an. Ob eine Aktion erlaubt ist, bleibt weiterhin eine serverseitige Entscheidung pro Route, Session, Permission und Write-Scope.</div>
        </article>
      `;
      const grids = panel.querySelectorAll('.page-grid');
      const lastGrid = grids.length ? grids[grids.length - 1] : null;
      if (lastGrid && lastGrid.parentNode) lastGrid.parentNode.insertBefore(section, lastGrid.nextSibling);
      else panel.appendChild(section);
    }

    bindSelectionHooks();
    renderPermissionDetail();
  }

  function bindSelectionHooks() {
    const select = document.getElementById('adminUserDetailSelect');
    const search = document.getElementById('adminUserDetailSearch');
    if (select && !select.dataset.rdap53Bound) {
      select.dataset.rdap53Bound = '1';
      select.addEventListener('change', scheduleRender);
    }
    if (search && !search.dataset.rdap53Bound) {
      search.dataset.rdap53Bound = '1';
      search.addEventListener('input', scheduleRender);
    }
  }

  function scheduleRender() {
    if (refreshTimer) window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => renderPermissionDetail(), REFRESH_DELAY_MS);
  }

  async function reloadAuthModel(reason) {
    latestResult = await getJson(AUTH_MODEL_ENDPOINT);
    installPanelWhenReady();
    renderPermissionDetail(reason);
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
      return { ok: response.ok && body && body.ok !== false, httpStatus: response.status, body, error: null };
    } catch (err) {
      return { ok: false, httpStatus: 0, body: null, error: err && err.message ? err.message : 'fetch_failed' };
    }
  }

  function renderPermissionDetail(reason) {
    const section = document.getElementById(POLISH_ID);
    if (!section) return;

    const model = latestResult && latestResult.body && latestResult.body.model ? latestResult.body.model : {};
    const selectedUid = getSelectedUserUid();
    const selectedUser = findUser(model.users, selectedUid);
    const userRoles = findUserRows(model.userRoles, selectedUid, 'role_key');
    const userGroups = findUserRows(model.userGroups, selectedUid, 'group_key');
    const roleKeys = userRoles.map(row => readKey(row, 'role_key')).filter(Boolean);
    const groupKeys = userGroups.map(row => readKey(row, 'group_key')).filter(Boolean);

    const rolePermissions = uniqueRows((Array.isArray(model.rolePermissions) ? model.rolePermissions : [])
      .filter(row => roleKeys.includes(readKey(row, 'role_key'))), row => `${readKey(row, 'role_key')}|${readKey(row, 'permission_key')}|${readKey(row, 'effect')}`);

    const modulePermissions = uniqueRows((Array.isArray(model.modulePermissions) ? model.modulePermissions : [])
      .filter(row => isModulePermissionRelevant(row, roleKeys, groupKeys, selectedUid)), row => [
        readKey(row, 'subject_type'), readKey(row, 'subject_key'), readKey(row, 'permission_key'), readKey(row, 'target_type'), readKey(row, 'target_key'), readKey(row, 'effect')
      ].join('|'));

    setChip('rdap53RolePermissionPill', latestResult && latestResult.ok, `${rolePermissions.length} Rechte`);
    setChip('rdap53ModulePermissionPill', latestResult && latestResult.ok, `${modulePermissions.length} Targets`);
    setHtml('rdap53RolePermissions', renderRows(rolePermissions, renderRolePermissionRow));
    setHtml('rdap53ModulePermissions', renderRows(modulePermissions, renderModulePermissionRow));

    const userLabel = selectedUser ? formatUser(selectedUser) : (selectedUid || 'kein User ausgewählt');
    const status = latestResult && latestResult.ok ? 'geladen' : `nicht geladen: ${latestResult ? (latestResult.error || latestResult.httpStatus) : 'wartet'}`;
    setHtml('rdap53PermissionNote', `User: <strong>${escapeHtml(userLabel)}</strong><br>Rollen: <strong>${escapeHtml(roleKeys.join(', ') || '—')}</strong><br>Gruppen: <strong>${escapeHtml(groupKeys.join(', ') || '—')}</strong><br>Status: <strong>${escapeHtml(status)}</strong>${reason ? `<br>Quelle: <strong>${escapeHtml(reason)}</strong>` : ''}`);
  }

  function getSelectedUserUid() {
    const select = document.getElementById('adminUserDetailSelect');
    if (select && select.value) return select.value;
    const uid = document.getElementById('adminUserDetailUid');
    return uid && uid.textContent && uid.textContent !== '—' ? uid.textContent.trim() : 'tw:127709954';
  }

  function findUser(rows, userUid) {
    return (Array.isArray(rows) ? rows : []).find(row => readKey(row, 'user_uid') === userUid || readKey(row, 'userUid') === userUid) || null;
  }

  function findUserRows(rows, userUid, keyField) {
    return (Array.isArray(rows) ? rows : [])
      .filter(row => row && (readKey(row, 'user_uid') === userUid || readKey(row, 'userUid') === userUid))
      .filter(row => !readKey(row, 'revoked_at') && !readKey(row, 'revokedAt') && (keyField ? readKey(row, keyField) : true));
  }

  function isModulePermissionRelevant(row, roleKeys, groupKeys, userUid) {
    const subjectType = readKey(row, 'subject_type');
    const subjectKey = readKey(row, 'subject_key');
    if (subjectType === 'role') return roleKeys.includes(subjectKey);
    if (subjectType === 'group') return groupKeys.includes(subjectKey);
    if (subjectType === 'user') return subjectKey === userUid;
    return false;
  }

  function renderRows(rows, formatter) {
    const values = Array.isArray(rows) ? rows : [];
    if (!values.length) return '<div class="rdap53-row"><strong>—</strong><small>Keine passenden read-only Einträge im Auth-Modell gefunden.</small></div>';
    return values.slice(0, 20).map(formatter).join('') + (values.length > 20 ? `<div class="rdap53-row"><strong>+${values.length - 20}</strong><small>weitere Einträge nicht angezeigt</small></div>` : '');
  }

  function renderRolePermissionRow(row) {
    const roleKey = readKey(row, 'role_key') || 'role';
    const permissionKey = readKey(row, 'permission_key') || 'permission';
    const effect = readKey(row, 'effect') || '—';
    return `<div class="rdap53-row"><strong>${escapeHtml(permissionKey)}</strong><small>via Rolle: ${escapeHtml(roleKey)} · Effekt: ${escapeHtml(effect)}</small></div>`;
  }

  function renderModulePermissionRow(row) {
    const subjectType = readKey(row, 'subject_type') || 'subject';
    const subjectKey = readKey(row, 'subject_key') || '—';
    const permissionKey = readKey(row, 'permission_key') || 'permission';
    const targetType = readKey(row, 'target_type') || 'target';
    const targetKey = readKey(row, 'target_key') || '—';
    const effect = readKey(row, 'effect') || '—';
    return `<div class="rdap53-row"><strong>${escapeHtml(permissionKey)}</strong><small>${escapeHtml(subjectType)}:${escapeHtml(subjectKey)} · ${escapeHtml(targetType)}:${escapeHtml(targetKey)} · Effekt: ${escapeHtml(effect)}</small></div>`;
  }

  function uniqueRows(rows, keyFn) {
    const seen = new Set();
    const result = [];
    (Array.isArray(rows) ? rows : []).forEach((row) => {
      const key = keyFn(row);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(row);
      }
    });
    return result;
  }

  function readKey(row, key) {
    if (!row || typeof row !== 'object') return '';
    if (row[key] !== undefined && row[key] !== null) return String(row[key]).trim();
    const camel = key.replace(/_([a-z])/g, (_, chr) => chr.toUpperCase());
    return row[camel] === undefined || row[camel] === null ? '' : String(row[camel]).trim();
  }

  function formatUser(user) {
    const name = readKey(user, 'display_name') || readKey(user, 'displayName') || readKey(user, 'login_name') || readKey(user, 'loginName') || readKey(user, 'user_uid');
    const login = readKey(user, 'login_name') || readKey(user, 'loginName');
    const uid = readKey(user, 'user_uid') || readKey(user, 'userUid');
    return `${name}${login ? ` @${login}` : ''} / ${uid}`;
  }

  function setChip(id, ok, text) {
    const node = document.getElementById(id);
    if (!node) return;
    node.textContent = text;
    node.className = ok === true ? 'cgn-chip cgn-chip--ok' : ok === false ? 'cgn-chip cgn-chip--warn' : 'cgn-chip cgn-chip--info';
  }

  function setHtml(id, html) {
    const node = document.getElementById(id);
    if (node) node.innerHTML = html || '';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
