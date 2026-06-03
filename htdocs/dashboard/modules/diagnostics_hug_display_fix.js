window.DiagnosticsHugDisplayFix = (function(){
  'use strict';

  const MODULE_VERSION = '0.1.0-can42-12b';
  const STATUS_URL = '/api/hug/status';

  let pending = false;
  let lastPatchAt = 0;

  function escText(value) {
    return String(value ?? '').trim();
  }

  function isHugDiagnosticsVisible(root) {
    if (!root || root.hidden) return false;
    const text = root.textContent || '';
    return text.includes('Hug-System') && text.includes('/api/hug/status');
  }

  function metricArticles(root) {
    return Array.from(root.querySelectorAll('.diag-metric'));
  }

  function setMetric(root, label, value) {
    const cleanLabel = escText(label).toLowerCase();
    const article = metricArticles(root).find(item => {
      const span = item.querySelector('span');
      return escText(span?.textContent).toLowerCase() === cleanLabel;
    });
    const strong = article?.querySelector('strong');
    if (!strong) return false;
    const text = escText(value) || '-';
    if (strong.textContent !== text) strong.textContent = text;
    return true;
  }

  function routeLabel(status) {
    const routes = status?.routes;
    if (Array.isArray(routes) && routes.length) return String(routes.length);
    if (routes && typeof routes === 'object' && Object.keys(routes).length) return String(Object.keys(routes).length);

    const routePrefixes = status?.routesPrefix || status?.moduleMeta?.routesPrefix || status?.meta?.routesPrefix;
    if (Array.isArray(routePrefixes) && routePrefixes.length) return String(routePrefixes.length);

    return '1';
  }

  async function fetchHugStatus() {
    const res = await fetch(`${STATUS_URL}?_diagUi=${Date.now()}`, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.ok === false) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
    return data;
  }

  async function patchHugCard() {
    const root = document.getElementById('diagnosticsModule');
    if (!isHugDiagnosticsVisible(root)) return;

    try {
      const status = await fetchHugStatus();
      const diagnostics = status?.diagnostics || {};
      const version = escText(diagnostics.version || status.moduleVersion || status.version || '');
      const schema = escText(diagnostics.schemaVersion || status.schemaVersion || '');
      const configSource = escText(diagnostics.configSource || status.configSource || '');
      const textSource = escText(diagnostics.textSource || status.textSource || '');
      const lastError = escText(diagnostics.lastError || status.lastError || status.error || '');

      if (version) setMetric(root, 'Version', version);
      if (schema) setMetric(root, 'Schema', schema);
      setMetric(root, 'Routen', routeLabel(status));
      if (configSource) setMetric(root, 'Config-Quelle', configSource);
      if (textSource) setMetric(root, 'Textsystem', textSource);
      setMetric(root, 'Letzter Fehler', lastError || '-');
      lastPatchAt = Date.now();
    } catch (err) {
      console.warn('[diagnostics_hug_display_fix] Hug-Diagnose-Anzeige konnte nicht nachgezogen werden:', err?.message || err);
    }
  }

  function schedulePatch() {
    if (pending) return;
    pending = true;
    window.setTimeout(() => {
      pending = false;
      patchHugCard();
    }, 80);
  }

  function init() {
    const root = document.getElementById('diagnosticsModule');
    if (root) {
      const observer = new MutationObserver(schedulePatch);
      observer.observe(root, { childList: true, subtree: true });
    }
    document.addEventListener('change', ev => {
      if (ev.target && ev.target.matches('[data-diagnostics-select]')) schedulePatch();
    });
    document.addEventListener('click', ev => {
      if (ev.target && ev.target.closest('[data-diagnostics-pick], [data-diagnostics-refresh]')) schedulePatch();
    });
    schedulePatch();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { init, patchHugCard, version: MODULE_VERSION, get lastPatchAt() { return lastPatchAt; } };
})();
