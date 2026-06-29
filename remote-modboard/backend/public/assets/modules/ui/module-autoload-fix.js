'use strict';

(function installModuleAutoloadFix() {
  const loadedScripts = new Map();

  function normalizePageId(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(value || ''));
    return String(value || '').replace(/["\\]/g, '\\$&');
  }

  function getManifestPage(pageId) {
    const manifest = window.RemoteModboardModuleManifest || {};
    const pages = Array.isArray(manifest.pages) ? manifest.pages : [];
    const safePageId = normalizePageId(pageId);
    return pages.find((page) => normalizePageId(page.pageId || page.id || page.page) === safePageId) || null;
  }

  function panelExists(pageId) {
    return !!document.querySelector(`[data-page-panel="${cssEscape(normalizePageId(pageId))}"]`);
  }

  function loadScriptOnce(src) {
    const cleanSrc = String(src || '').trim();
    if (!cleanSrc) return Promise.resolve(false);
    if (loadedScripts.has(cleanSrc)) return loadedScripts.get(cleanSrc);

    const existing = document.querySelector(`script[src="${cssEscape(cleanSrc)}"]`);
    if (existing && existing.dataset.rdapLoaded === '1') {
      const ready = Promise.resolve(true);
      loadedScripts.set(cleanSrc, ready);
      return ready;
    }

    const promise = new Promise((resolve, reject) => {
      const script = existing || document.createElement('script');
      script.src = cleanSrc;
      script.defer = true;
      script.dataset.rdapModuleScript = '1';
      script.addEventListener('load', () => {
        script.dataset.rdapLoaded = '1';
        resolve(true);
      }, { once: true });
      script.addEventListener('error', () => reject(new Error(`script_load_failed:${cleanSrc}`)), { once: true });
      if (!existing) document.head.appendChild(script);
    });

    loadedScripts.set(cleanSrc, promise);
    return promise;
  }

  function waitForPanel(pageId, timeoutMs) {
    const safePageId = normalizePageId(pageId);
    if (panelExists(safePageId)) return Promise.resolve(true);

    return new Promise((resolve) => {
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        observer.disconnect();
        window.clearTimeout(timer);
        resolve(ok);
      };

      const observer = new MutationObserver(() => {
        if (panelExists(safePageId)) finish(true);
      });

      const timer = window.setTimeout(() => finish(panelExists(safePageId)), timeoutMs || 1500);
      observer.observe(document.documentElement, { childList: true, subtree: true });
    });
  }

  function readNavMeta(button) {
    return {
      section: button.dataset.section || 'Remote Modboard',
      title: button.dataset.title || button.textContent.trim(),
      tab: button.dataset.tab || ''
    };
  }

  function activateViaRouter(pageId, meta) {
    if (window.RdapMainRouter && typeof window.RdapMainRouter.setPage === 'function') {
      window.RdapMainRouter.setPage(pageId, meta);
      return true;
    }

    document.querySelectorAll('[data-page-panel]').forEach((panel) => {
      const active = panel.dataset.pagePanel === pageId;
      panel.hidden = !active;
      panel.classList.toggle('is-active-view', active);
    });
    return false;
  }

  async function handleModuleClick(event) {
    const button = event.target && event.target.closest ? event.target.closest('.nav-link[data-page]') : null;
    if (!button) return;

    const pageId = normalizePageId(button.dataset.page);
    if (!pageId || panelExists(pageId)) return;

    const manifestPage = getManifestPage(pageId);
    const script = manifestPage && manifestPage.script ? manifestPage.script : button.dataset.script;
    if (!script) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    button.classList.add('is-loading');

    try {
      await loadScriptOnce(script);
      await waitForPanel(pageId, 1500);
      activateViaRouter(pageId, readNavMeta(button));
    } catch (err) {
      if (window.console && typeof window.console.error === 'function') {
        window.console.error('rdap_module_autoload_failed', pageId, err);
      }
      activateViaRouter(pageId, readNavMeta(button));
    } finally {
      button.classList.remove('is-loading');
    }
  }

  document.addEventListener('click', handleModuleClick, true);
})();
