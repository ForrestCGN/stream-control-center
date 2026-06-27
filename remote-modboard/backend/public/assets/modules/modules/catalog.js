'use strict';

(function registerModuleCatalog() {

  const PAGE_ID = 'modules';

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
    registerPage({ moduleId: 'modules', pageId: PAGE_ID, label: 'Module', title: 'Module', tab: 'read-only', section: 'Module', order: 10, script: '/assets/modules/modules/catalog.js' });
    mountPanel(PAGE_ID, `        <section class="rdap-view" data-page-panel="modules">
          <section class="page-header module-page-header cgn-card"><p class="cgn-eyebrow">Module</p><h1>Module</h1><p>Spätere Arbeitsbereiche für Stream- und Mod-Funktionen.</p></section>
          <section class="page-grid">
            <article class="cgn-card span2"><div class="card-head"><div><p class="cgn-eyebrow">Bereiche</p><h2>Geplante Modboard-Funktionen</h2></div><span class="cgn-chip cgn-chip--info">bald</span></div><div class="module-list"><div class="module-row"><span class="module-icon purple">OBS</span><div><b>OBS</b><small>Noch keine Steuerung.</small></div></div><div class="module-row"><span class="module-icon cyan">SND</span><div><b>Sound</b><small>Noch keine Steuerung.</small></div></div><div class="module-row"><span class="module-icon blue">OVR</span><div><b>Overlays</b><small>Noch keine Steuerung.</small></div></div><div class="module-row"><span class="module-icon green">CMD</span><div><b>Commands</b><small>Noch keine Steuerung.</small></div></div></div></article>
          </section>
        </section>`);
  }
  install();
  document.addEventListener('DOMContentLoaded', install);

})();
