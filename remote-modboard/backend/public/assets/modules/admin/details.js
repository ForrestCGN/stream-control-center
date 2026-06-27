'use strict';

(function registerAdminDetailsModule() {

  const PAGE_ID = 'routes';

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

  function createPanel() {
    return mountPanel(PAGE_ID, `        <section class="rdap-view" data-page-panel="routes">
          <section class="page-header module-page-header cgn-card"><p class="cgn-eyebrow">System / Routen</p><h1>Routen</h1><p>Aktive Remote-Modboard-Routen und ihre aktuelle Bedeutung.</p></section>
          <section class="page-grid"><article class="cgn-card span2"><div class="card-head"><div><p class="cgn-eyebrow">Read-only</p><h2>Routenübersicht</h2></div><span class="cgn-chip" id="routesPill">lädt</span></div><div class="routes" id="routesList"></div></article></section>
        </section>`);
  }

  function install() {
    registerPage({ moduleId: 'admin', pageId: PAGE_ID, label: 'Doku / Details', title: 'Doku / Details', tab: 'read-only', section: 'Admin', order: 90, script: '/assets/modules/admin/details.js' });
    createPanel();
  }

  install();
  document.addEventListener('DOMContentLoaded', install);

})();
