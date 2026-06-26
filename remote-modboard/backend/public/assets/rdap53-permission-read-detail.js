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
      .rdap53-row--empty{border-style:dashed;border-color:rgba(27,216,255,.24);background:rgba(27,216,255,.055)}
      .rdap53-category{display:grid;gap:8px;padding:10px;border-radius:16px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07)}
      .rdap53-category-head{display:flex;justify-content:space-between;gap:10px;align-items:center;color:#fff;font-size:13px;font-weight:800}
      .rdap53-category-head small{color:var(--muted);font-size:12px;font-weight:700;text-align:right}
      .rdap53-row--admin{border-color:rgba(255,209,102,.22);background:rgba(255,209,102,.055)}
      .rdap53-row--admin small em{color:#ffe4a3;font-style:normal;font-weight:700}
      .rdap53-note{padding:12px;border-radius:16px;background:rgba(27,216,255,.08);border:1px solid rgba(27,216,255,.20);color:#dff8ff;line-height:1.45}
      .rdap53-note strong{color:#fff}
      .rdap53-diagnostic-list{display:grid;gap:6px;margin-top:8px}
      .rdap53-diagnostic-line{display:flex;justify-content:space-between;gap:10px;font-size:12px;color:var(--muted)}
      .rdap53-diagnostic-line strong{color:#fff;text-align:right}
      @media (max-width:1000px){.rdap53-permission-grid{grid-template-columns:1fr}.rdap53-diagnostic-line,.rdap53-category-head{display:block}.rdap53-diagnostic-line strong,.rdap53-category-head small{text-align:left}}
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
    const allRolePermissions = Array.isArray(model.rolePermissions) ? model.rolePermissions : [];
    const allModulePermissions = Array.isArray(model.modulePermissions) ? model.modulePermissions : [];

    const rolePermissions = uniqueRows(allRolePermissions
      .filter(row => roleKeys.includes(readKey(row, 'role_key'))), row => `${readKey(row, 'role_key')}|${readKey(row, 'permission_key')}|${readKey(row, 'effect')}`);

    const modulePermissions = uniqueRows(allModulePermissions
      .filter(row => isModulePermissionRelevant(row, roleKeys, groupKeys, selectedUid)), row => [
        readKey(row, 'subject_type'), readKey(row, 'subject_key'), readKey(row, 'permission_key'), readKey(row, 'target_type'), readKey(row, 'target_key'), readKey(row, 'effect')
      ].join('|'));

    setChip('rdap53RolePermissionPill', latestResult && latestResult.ok, `${rolePermissions.length} Rechte`);
    setChip('rdap53ModulePermissionPill', latestResult && latestResult.ok, `${modulePermissions.length} Targets`);
    setHtml('rdap53RolePermissions', renderRolePermissionGroups(rolePermissions));
    setHtml('rdap53ModulePermissions', renderRows(modulePermissions, renderModulePermissionRow, () => renderModulePermissionEmpty(allRolePermissions, allModulePermissions, rolePermissions)));

    const userLabel = selectedUser ? formatUser(selectedUser) : (selectedUid || 'kein User ausgewählt');
    const status = latestResult && latestResult.ok ? 'geladen' : `nicht geladen: ${latestResult ? (latestResult.error || latestResult.httpStatus) : 'wartet'}`;
    setHtml('rdap53PermissionNote', buildDiagnosticNote({
      userLabel,
      roleKeys,
      groupKeys,
      status,
      reason,
      allRolePermissionCount: allRolePermissions.length,
      allModulePermissionCount: allModulePermissions.length,
      effectiveRolePermissionCount: rolePermissions.length,
      relevantModulePermissionCount: modulePermissions.length
    }));
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

  function renderRows(rows, formatter, emptyFormatter) {
    const values = Array.isArray(rows) ? rows : [];
    if (!values.length) return typeof emptyFormatter === 'function'
      ? emptyFormatter()
      : '<div class="rdap53-row rdap53-row--empty"><strong>—</strong><small>Keine passenden read-only Einträge im Auth-Modell gefunden.</small></div>';
    return values.slice(0, 20).map(formatter).join('') + (values.length > 20 ? `<div class="rdap53-row"><strong>+${values.length - 20}</strong><small>weitere Einträge nicht angezeigt</small></div>` : '');
  }

  function renderRolePermissionEmpty() {
    return '<div class="rdap53-row rdap53-row--empty"><strong>Keine Rollenrechte für diesen User gefunden.</strong><small>Das Auth-Modell wurde gelesen, aber für die ausgewählten Rollen wurden keine passenden rolePermissions gefunden.</small></div>';
  }

  function renderModulePermissionEmpty(allRolePermissions, allModulePermissions, rolePermissions) {
    const roleText = rolePermissions && rolePermissions.length
      ? `${rolePermissions.length} Rollenrecht(e) werden separat unter „Effektive Rollen-Rechte“ angezeigt.`
      : 'Für diesen User wurden aktuell keine Rollenrechte abgeleitet.';
    const moduleText = allModulePermissions && allModulePermissions.length
      ? `${allModulePermissions.length} modulePermissions im Auth-Modell vorhanden, aber keine davon passt zu User/Rollen/Gruppen des ausgewählten Users.`
      : 'Das Auth-Modell liefert aktuell 0 modulePermissions.';
    return `<div class="rdap53-row rdap53-row--empty"><strong>Keine Modul-/Targetrechte vorhanden.</strong><small>${escapeHtml(moduleText)} ${escapeHtml(roleText)} Das ist kein Fehler und keine fehlgeschlagene Berechtigungsprüfung.</small></div>`;
  }

  function renderRolePermissionGroups(rows) {
    const values = Array.isArray(rows) ? rows : [];
    if (!values.length) return renderRolePermissionEmpty();

    const groups = buildPermissionGroups(values);
    return groups.map((group) => {
      if (!group.rows.length) return '';
      const rowsHtml = group.rows.map(renderRolePermissionRow).join('');
      return `<div class="rdap53-category"><div class="rdap53-category-head"><span>${escapeHtml(group.label)}</span><small>${escapeHtml(group.rows.length)} Recht(e) · read-only Modellanzeige</small></div>${rowsHtml}</div>`;
    }).join('');
  }

  function buildPermissionGroups(rows) {
    const groups = [
      { key: 'admin', label: 'Admin', rows: [] },
      { key: 'agent', label: 'Agent / Status', rows: [] },
      { key: 'dashboard', label: 'Dashboard / Remote', rows: [] },
      { key: 'other', label: 'Sonstige Rechte', rows: [] }
    ];
    const map = new Map(groups.map(group => [group.key, group]));

    rows.forEach((row) => {
      const permissionKey = readKey(row, 'permission_key') || readKey(row, 'permissionKey');
      const category = categorizePermission(permissionKey);
      const group = map.get(category) || map.get('other');
      group.rows.push(row);
    });

    groups.forEach(group => group.rows.sort(comparePermissionRows));
    return groups;
  }

  function comparePermissionRows(a, b) {
    return String(readKey(a, 'permission_key')).localeCompare(String(readKey(b, 'permission_key')), 'de');
  }

  function categorizePermission(permissionKey) {
    const key = String(permissionKey || '').toLowerCase();
    if (key.startsWith('admin.')) return 'admin';
    if (key.startsWith('agent.')) return 'agent';
    if (key.startsWith('dashboard.') || key.startsWith('remote.')) return 'dashboard';
    return 'other';
  }

  function describePermission(permissionKey) {
    const descriptions = {
      'admin.audit.read': 'Audit-/Protokollansicht lesen.',
      'admin.roles.manage': 'Modell zeigt ein Verwaltungsrecht; Rollen-/Gruppen-Schreibverwaltung ist in der UI weiterhin nicht gebaut.',
      'admin.users.manage': 'Modell zeigt ein Verwaltungsrecht; User-Schreibverwaltung bleibt weiterhin deaktiviert.',
      'admin.users.note.read': 'Interne Admin-Notizen lesen.',
      'admin.users.note.write': 'Admin-Note Create ist bewusst vorbereitet/live; Update, Deactivate und Delete bleiben aus.',
      'agent.status.read': 'Agent-/Statusdaten lesen; keine Agent-Actions.',
      'dashboard.read': 'Dashboard anzeigen.',
      'remote.view': 'Remote-Modboard anzeigen.'
    };
    return descriptions[permissionKey] || 'Read-only Anzeige aus dem Auth-Modell. Keine UI-Freigabe.';
  }

  function isAdminOrWriteLike(permissionKey) {
    const key = String(permissionKey || '').toLowerCase();
    return key.startsWith('admin.') || key.includes('.write') || key.includes('.manage') || key.includes('.delete') || key.includes('.deactivate') || key.includes('.revoke');
  }

  function renderRolePermissionRow(row) {
    const roleKey = readKey(row, 'role_key') || 'role';
    const permissionKey = readKey(row, 'permission_key') || 'permission';
    const effect = readKey(row, 'effect') || '—';
    const adminNote = isAdminOrWriteLike(permissionKey)
      ? ' <em>Modellanzeige: keine UI-Schreibfreigabe.</em>'
      : '';
    return `<div class="rdap53-row${isAdminOrWriteLike(permissionKey) ? ' rdap53-row--admin' : ''}"><strong>${escapeHtml(permissionKey)}</strong><small>${escapeHtml(describePermission(permissionKey))}<br>via Rolle: ${escapeHtml(roleKey)} · Effekt: ${escapeHtml(effect)}${adminNote}</small></div>`;
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

  function buildDiagnosticNote({ userLabel, roleKeys, groupKeys, status, reason, allRolePermissionCount, allModulePermissionCount, effectiveRolePermissionCount, relevantModulePermissionCount }) {
    return `User: <strong>${escapeHtml(userLabel)}</strong><br>`
      + `Rollen: <strong>${escapeHtml(roleKeys.join(', ') || '—')}</strong><br>`
      + `Gruppen: <strong>${escapeHtml(groupKeys.join(', ') || '—')}</strong><br>`
      + `Status: <strong>${escapeHtml(status)}</strong>${reason ? `<br>Quelle: <strong>${escapeHtml(reason)}</strong>` : ''}`
      + '<div class="rdap53-diagnostic-list">'
      + `<div class="rdap53-diagnostic-line"><span>rolePermissions gesamt</span><strong>${escapeHtml(String(allRolePermissionCount || 0))}</strong></div>`
      + `<div class="rdap53-diagnostic-line"><span>effektive Rollenrechte</span><strong>${escapeHtml(String(effectiveRolePermissionCount || 0))}</strong></div>`
      + `<div class="rdap53-diagnostic-line"><span>modulePermissions gesamt</span><strong>${escapeHtml(String(allModulePermissionCount || 0))}</strong></div>`
      + `<div class="rdap53-diagnostic-line"><span>passende Module-/Targets</span><strong>${escapeHtml(String(relevantModulePermissionCount || 0))}</strong></div>`
      + '<div class="rdap53-diagnostic-line"><span>Gruppierung</span><strong>Admin · Agent/Status · Dashboard/Remote</strong></div>'
      + '<div class="rdap53-diagnostic-line"><span>Quelle</span><strong>/api/remote/auth/model</strong></div>'
      + '</div>';
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
