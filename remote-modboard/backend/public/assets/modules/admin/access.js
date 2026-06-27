'use strict';

(function registerAccessDetailsModule() {

  const PAGE_ID = 'access';

  function getContentRoot() {
    return document.getElementById('remoteModboardContent') || document.querySelector('.cgn-content');
  }

  function mountPanel(pageId, html) {
    const content = getContentRoot();
    if (!content) return null;
    let panel = document.querySelector(`[data-page-panel="${pageId}"]`);
    if (panel && panel.dataset.modulePlaceholder !== '1' && !panel.dataset.modulePlaceholder) return panel;
    const holder = document.createElement('div');
    holder.innerHTML = html.trim();
    const nextPanel = holder.firstElementChild;
    if (!nextPanel) return panel;
    if (panel && panel.parentNode) panel.replaceWith(nextPanel);
    else {
      const footer = content.querySelector('.footer');
      if (footer) content.insertBefore(nextPanel, footer);
      else content.appendChild(nextPanel);
    }
    return nextPanel;
  }

  function registerPage(config) {
    if (!window.RemoteModboardModules || typeof window.RemoteModboardModules.registerPage !== 'function') return;
    window.RemoteModboardModules.registerPage(config);
  }

  function removeAccessNavigation() {
    document.querySelectorAll('#nav-admin .nav-link[data-page="access"]').forEach((button) => button.remove());
  }
  function installStyle() {
    if (document.getElementById('rdap115bRetiredAccessNavStyle')) return;
    const style = document.createElement('style');
    style.id = 'rdap115bRetiredAccessNavStyle';
    style.textContent = '#nav-admin .nav-link[data-page="access"]{display:none!important}';
    document.head.appendChild(style);
  }
  function install() {
    registerPage({ moduleId: 'account', pageId: PAGE_ID, label: 'Rollen & Rechte', title: 'Rollen & Rechte', tab: 'read-only', section: 'Admin', order: 40, script: '/assets/modules/admin/access.js' });
    mountPanel(PAGE_ID, `        <section class="rdap-view" data-page-panel="access">
          <section class="page-header module-page-header cgn-card">
            <p class="cgn-eyebrow">Admin</p>
            <h1>Rollen & Rechte</h1>
            <p>Wer darf ins Modboard, welche Rollen sind sichtbar und welche Zugriffe sind aktuell aktiv?</p>
          </section>

          <section class="metric-grid">
            <article class="metric-card cgn-card"><span>Login</span><strong id="accessLoggedIn">—</strong><small>Session</small><div class="cgn-progress"><i style="width:72%"></i></div></article>
            <article class="metric-card cgn-card"><span>Dashboard</span><strong id="accessDashboardAllowed">—</strong><small>Zugriff</small><div class="cgn-progress"><i style="width:72%"></i></div></article>
            <article class="metric-card cgn-card"><span>Modboard ansehen</span><strong id="accessPermissionRemoteView">—</strong><small>Ansicht</small><div class="cgn-progress"><i style="width:64%"></i></div></article>
            <article class="metric-card cgn-card"><span>Datenmodell</span><strong id="accessSchemaReady">—</strong><small>nur ansehen</small><div class="cgn-progress"><i style="width:58%"></i></div></article>
          </section>

          <section class="page-grid">
            <article class="cgn-card">
              <div class="card-head"><div><p class="cgn-eyebrow">Aktueller User</p><h2>Session & Zugriff</h2></div><span class="cgn-chip cgn-chip--info">serverseitig</span></div>
              <div class="kv-grid">
                <div class="kv-row"><span>User</span><strong id="accessUser">—</strong></div>
                <div class="kv-row"><span>Access-Grund</span><strong id="accessReasonDetail">—</strong></div>
                <div class="kv-row"><span>Rollen</span><strong id="accessRoles">—</strong></div>
                <div class="kv-row"><span>Gruppen</span><strong id="accessGroups">—</strong></div>
                <div class="kv-row"><span>Session</span><strong id="accessSessionReason">—</strong></div>
              </div>
            </article>

            <article class="cgn-card">
              <div class="card-head"><div><p class="cgn-eyebrow">Hinweis</p><h2>Zugriff wird serverseitig geprüft</h2></div><span class="cgn-chip cgn-chip--info">Info</span></div>
              <div class="access-note">
                <p>Das Modboard ist nicht öffentlich offen. Der Server entscheidet, wer Zugriff bekommt.</p>
                <p>Details zur internen Zugriffstechnik gehören nicht in die normale Ansicht und bleiben bei Bedarf in der Diagnose.</p>
              </div>
            </article>

            <article class="cgn-card span2">
              <div class="card-head"><div><p class="cgn-eyebrow">DB-Modell</p><h2>Rollen, Gruppen & Rechte</h2></div><span class="cgn-chip" id="accessModelPill">lädt</span></div>
              <div class="access-columns">
                <div>
                  <h3>Rollen</h3>
                  <div class="model-list" id="accessRolesModel">—</div>
                </div>
                <div>
                  <h3>Gruppen</h3>
                  <div class="model-list" id="accessGroupsModel">—</div>
                </div>
                <div>
                  <h3>Rechte</h3>
                  <div class="model-list" id="accessPermissionsModel">—</div>
                </div>
              </div>
            </article>

            <article class="cgn-card span2">
              <div class="card-head"><div><p class="cgn-eyebrow">Diagnose</p><h2>Schema & Tabellen</h2></div><span class="cgn-chip cgn-chip--info">read-only</span></div>
              <div class="kv-grid">
                <div class="kv-row"><span>Schema bereit</span><strong id="accessSchemaReadyDetail">—</strong></div>
                <div class="kv-row"><span>User</span><strong id="accessCountUsers">—</strong></div>
                <div class="kv-row"><span>Sessions</span><strong id="accessCountSessions">—</strong></div>
                <div class="kv-row"><span>Audit-Logs</span><strong id="accessCountAudit">—</strong></div>
                <div class="kv-row"><span>Locks</span><strong id="accessCountLocks">—</strong></div>
                <div class="kv-row"><span>Hinweis</span><strong>Keine Schreibfunktionen in diesem Step.</strong></div>
              </div>
            </article>
          </section>
        </section>`);
    installStyle();
    removeAccessNavigation();
  }
  install();
  document.addEventListener('DOMContentLoaded', install);
  window.addEventListener('rdap:module-registry-ready', install);

})();
