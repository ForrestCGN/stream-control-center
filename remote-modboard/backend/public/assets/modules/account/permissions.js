'use strict';

(function registerAccountPermissionsModule() {

  const PAGE_ID = 'permissions';

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
    mountPanel(PAGE_ID, `        <section class="rdap-view" data-page-panel="permissions">
          <section class="page-header module-page-header cgn-card"><p class="cgn-eyebrow">Mein Konto</p><h1>Meine Rechte</h1><p>Persönliche Berechtigungsanzeige für diesen Login. Änderungen gehören später in den Admin-Bereich.</p></section>
          <section class="page-grid"><article class="cgn-card span2"><div class="card-head"><div><p class="cgn-eyebrow">Berechtigung</p><h2>remote.view</h2></div><span class="cgn-chip cgn-chip--warn">read-only</span></div><div class="kv-grid"><div class="kv-row"><span>Modboard ansehen</span><strong id="permissionAllowed">—</strong></div><div class="kv-row"><span>Grund</span><strong id="permissionReason">—</strong></div><div class="kv-row"><span>Hinweis</span><strong>Frontend zeigt nur an. Backend entscheidet.</strong></div></div></article></section>
        </section>`);
  }
  install();
  document.addEventListener('DOMContentLoaded', install);

})();
