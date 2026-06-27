'use strict';

(function registerModuleCatalog() {
  const PAGE_ID = 'modules';
  const LOCALE = 'de';

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

  function text(value, fallback) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value[LOCALE] || value.de || value.en || Object.values(value).find(Boolean) || fallback || '';
    }
    return value !== undefined && value !== null && String(value) !== '' ? String(value) : (fallback || '');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function moduleLabel(moduleId) {
    const manifest = window.RemoteModboardModuleManifest || {};
    const moduleConfig = (manifest.modules || []).find((item) => item.id === moduleId || item.moduleId === moduleId);
    return text(moduleConfig && moduleConfig.label, moduleId || 'Modul');
  }

  function renderManifestRows() {
    const manifest = window.RemoteModboardModuleManifest || {};
    const pages = Array.isArray(manifest.pages) ? manifest.pages : [];
    if (!pages.length) {
      return '<div class="module-row"><span class="module-icon purple">MOD</span><div><b>Modulmanifest</b><small>Noch keine Metadaten geladen.</small></div></div>';
    }

    return pages
      .filter((page) => page.hiddenInMainNav !== true)
      .sort((a, b) => Number(a.order || 100) - Number(b.order || 100))
      .map((page) => {
        const label = text(page.label, page.pageId || 'Modul');
        const description = text(page.description, 'Keine Beschreibung hinterlegt.');
        const permission = page.permission || '—';
        const runtime = page.runtime || 'both';
        const moduleName = moduleLabel(page.moduleId || page.module);
        return `<div class="module-row">
          <span class="module-icon cyan">${escapeHtml(String(moduleName).slice(0, 3).toUpperCase())}</span>
          <div>
            <b>${escapeHtml(label)}</b>
            <small>${escapeHtml(description)}</small>
            <small>Bereich: ${escapeHtml(moduleName)} · Recht: ${escapeHtml(permission)} · Modus: ${escapeHtml(runtime)}</small>
          </div>
        </div>`;
      })
      .join('');
  }

  function install() {
    registerPage({
      moduleId: 'modules',
      pageId: PAGE_ID,
      label: 'Modulübersicht',
      title: 'Modulübersicht',
      tab: 'read-only',
      section: 'Module',
      order: 10,
      permission: 'remote.modules.read',
      runtime: 'both',
      script: '/assets/modules/modules/catalog.js'
    });

    mountPanel(PAGE_ID, `
      <section class="rdap-view" data-page-panel="modules">
        <section class="page-header module-page-header cgn-card">
          <p class="cgn-eyebrow">Module</p>
          <h1>Modulübersicht</h1>
          <p>Alle sichtbaren Module mit deutschen Labels, Rechten und Online/Lokal-Gültigkeit.</p>
        </section>
        <section class="page-grid">
          <article class="cgn-card span2">
            <div class="card-head">
              <div><p class="cgn-eyebrow">Metadaten</p><h2>Aktive Modulstruktur</h2></div>
              <span class="cgn-chip cgn-chip--info">read-only</span>
            </div>
            <div class="module-list">${renderManifestRows()}</div>
          </article>
          <article class="cgn-card span2">
            <div class="card-head">
              <div><p class="cgn-eyebrow">Regel</p><h2>Rechte bleiben Backend-Sache</h2></div>
              <span class="cgn-chip cgn-chip--warn">Sicherheit</span>
            </div>
            <div class="admin-lock-note">
              <i>!</i>
              <div>
                <strong>Frontend-Metadaten sind nur Anzeige und Navigation.</strong>
                <span>Ob ein Benutzer wirklich lesen oder schreiben darf, entscheidet weiterhin jede Backend-Route separat.</span>
              </div>
            </div>
          </article>
        </section>
      </section>`);
  }

  install();
  document.addEventListener('DOMContentLoaded', install);
})();
