'use strict';

(function registerModuleCatalog() {
  const PAGE_ID = 'modules';
  const LOCALE = window.RemoteModboardLanguages && typeof window.RemoteModboardLanguages.getLocale === 'function' ? window.RemoteModboardLanguages.getLocale() : 'de';

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

  function t(key, fallback, params) {
    if (window.RemoteModboardLanguages && typeof window.RemoteModboardLanguages.t === 'function') {
      return window.RemoteModboardLanguages.t(key, fallback, params);
    }
    return fallback || key || '';
  }

  function text(value, fallback, key) {
    const translated = key ? t(key, '') : '';
    if (translated) return translated;
    if (window.RemoteModboardLanguages && typeof window.RemoteModboardLanguages.resolve === 'function') {
      return window.RemoteModboardLanguages.resolve(value, fallback);
    }
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
    return text(moduleConfig && moduleConfig.label, moduleId || 'Modul', moduleConfig && moduleConfig.labelKey);
  }

  function renderManifestRows() {
    const manifest = window.RemoteModboardModuleManifest || {};
    const pages = Array.isArray(manifest.pages) ? manifest.pages : [];
    if (!pages.length) {
      return `<div class="module-row"><span class="module-icon purple">MOD</span><div><b>${escapeHtml(t('catalog.metadata.emptyTitle', 'Modulmanifest'))}</b><small>${escapeHtml(t('catalog.metadata.emptyDescription', 'Noch keine Metadaten geladen.'))}</small></div></div>`;
    }

    return pages
      .filter((page) => page.hiddenInMainNav !== true)
      .sort((a, b) => Number(a.order || 100) - Number(b.order || 100))
      .map((page) => {
        const label = text(page.label, page.pageId || 'Modul', page.labelKey);
        const description = text(page.description, 'Keine Beschreibung hinterlegt.', page.descriptionKey);
        const permission = page.permission || '—';
        const runtime = page.runtime || 'both';
        const moduleName = moduleLabel(page.moduleId || page.module);
        return `<div class="module-row">
          <span class="module-icon cyan">${escapeHtml(String(moduleName).slice(0, 3).toUpperCase())}</span>
          <div>
            <b>${escapeHtml(label)}</b>
            <small>${escapeHtml(description)}</small>
            <small>${escapeHtml(t('catalog.row.scope', `Bereich: ${moduleName} · Recht: ${permission} · Modus: ${runtime}`, { module: moduleName, permission, runtime }))}</small>
          </div>
        </div>`;
      })
      .join('');
  }

  function install() {
    registerPage({
      moduleId: 'modules',
      pageId: PAGE_ID,
      labelKey: 'page.modules.catalog.label',
      titleKey: 'page.modules.catalog.title',
      descriptionKey: 'page.modules.catalog.description',
      tabKey: 'page.modules.catalog.tab',
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
          <p class="cgn-eyebrow">${escapeHtml(t('catalog.header.eyebrow', 'Module'))}</p>
          <h1>${escapeHtml(t('catalog.header.title', 'Modulübersicht'))}</h1>
          <p>${escapeHtml(t('catalog.header.description', 'Alle sichtbaren Module mit zentralen Sprachtexten, Rechten und Online/Lokal-Gültigkeit.'))}</p>
        </section>
        <section class="page-grid">
          <article class="cgn-card span2">
            <div class="card-head">
              <div><p class="cgn-eyebrow">${escapeHtml(t('catalog.metadata.eyebrow', 'Metadaten'))}</p><h2>${escapeHtml(t('catalog.metadata.title', 'Aktive Modulstruktur'))}</h2></div>
              <span class="cgn-chip cgn-chip--info">${escapeHtml(t('ui.readOnly', 'read-only'))}</span>
            </div>
            <div class="module-list">${renderManifestRows()}</div>
          </article>
          <article class="cgn-card span2">
            <div class="card-head">
              <div><p class="cgn-eyebrow">${escapeHtml(t('catalog.rule.eyebrow', 'Regel'))}</p><h2>${escapeHtml(t('catalog.rule.title', 'Rechte bleiben Backend-Sache'))}</h2></div>
              <span class="cgn-chip cgn-chip--warn">${escapeHtml(t('catalog.rule.badge', 'Sicherheit'))}</span>
            </div>
            <div class="admin-lock-note">
              <i>!</i>
              <div>
                <strong>${escapeHtml(t('catalog.rule.strong', 'Frontend-Metadaten sind nur Anzeige und Navigation.'))}</strong>
                <span>${escapeHtml(t('catalog.rule.text', 'Ob ein Benutzer wirklich lesen oder schreiben darf, entscheidet weiterhin jede Backend-Route separat.'))}</span>
              </div>
            </div>
          </article>
          <article class="cgn-card span2">
            <div class="card-head">
              <div><p class="cgn-eyebrow">${escapeHtml(t('catalog.locale.eyebrow', 'Sprache'))}</p><h2>${escapeHtml(t('catalog.locale.title', 'Zentrale Sprachdateien'))}</h2></div>
              <span class="cgn-chip cgn-chip--info">de / en</span>
            </div>
            <div class="admin-lock-note">
              <i>i</i>
              <div>
                <strong>RemoteModboardLanguages</strong>
                <span>${escapeHtml(t('catalog.locale.text', 'Deutsch ist Standard. Englisch ist vorbereitet. Modultexte kommen künftig über Sprachschluessel statt verstreute Einzeltexte.'))}</span>
              </div>
            </div>
          </article>
        </section>
      </section>`);
  }

  install();
  document.addEventListener('DOMContentLoaded', install);
})();
