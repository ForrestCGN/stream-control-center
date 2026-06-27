'use strict';

(function registerAccountStatusModule() {

  const PAGE_ID = 'account';

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

  function install() {
    mountPanel(PAGE_ID, `        <section class="rdap-view" data-page-panel="account">
          <section class="page-header module-page-header cgn-card"><p class="cgn-eyebrow">Benutzer & Rechte</p><h1>Mein Login</h1><p>Aktuelle Session, Zugriff und Rollen für diesen Browser.</p></section>
          <section class="page-grid"><article class="cgn-card span2"><div class="card-head"><div><p class="cgn-eyebrow">Session</p><h2>Account-Status</h2></div><span class="cgn-chip cgn-chip--info">serverseitig</span></div><div class="kv-grid"><div class="kv-row"><span>loggedIn</span><strong id="authLoggedIn">—</strong></div><div class="kv-row"><span>dashboardAccess</span><strong id="dashboardAccess">—</strong></div><div class="kv-row"><span>accessReason</span><strong id="accessReason">—</strong></div><div class="kv-row"><span>User</span><strong id="authUser">—</strong></div><div class="kv-row"><span>Rollen</span><strong id="authRoles">—</strong></div><div class="kv-row"><span>Session</span><strong id="authSessionReason">—</strong></div></div></article></section>
        </section>`);
  }
  install();
  document.addEventListener('DOMContentLoaded', install);

})();
