window.DiagnosticsGenericDetails = (function(){
  'use strict';

  const MODULE_VERSION = '0.1.0-can42-12d';
  const ENDPOINTS = {
    birthday: '/api/birthday/status',
    todo: '/api/todo/status',
    tagebuch: '/api/tagebuch/status',
    hug: '/api/hug/status',
    commands: '/api/commands/status',
    message_rotator: '/api/message-rotator/status',
    bus_diagnostics: '/api/bus-diagnostics/status',
    overlay_monitor: '/api/overlay-monitor/status',
    sound_system: '/api/sound/status',
    media: '/api/media/status',
    vip: '/api/vip/status',
    alerts: '/api/alerts/status'
  };

  let pending = false;
  let lastPatchAt = 0;
  let lastKey = '';

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function cleanText(value) {
    return String(value ?? '').trim();
  }

  function hasValue(value) {
    return value !== undefined && value !== null && value !== '';
  }

  function scalarValue(value) {
    if (!hasValue(value)) return '';
    if (typeof value === 'boolean') return value ? 'ja' : 'nein';
    if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.length ? String(value.length) : '0';
    if (value && typeof value === 'object') {
      if (typeof value.count === 'number') return String(value.count);
      if (typeof value.value === 'number' || typeof value.value === 'string' || typeof value.value === 'boolean') return scalarValue(value.value);
      if (Array.isArray(value.rows)) return String(value.rows.length);
      return '';
    }
    return String(value);
  }

  function labelFromKey(key) {
    return String(key || '')
      .replace(/[_\-.]+/g, ' ')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, c => c.toUpperCase());
  }

  function metric(label, value) {
    const text = scalarValue(value) || '-';
    return `<article class="diag-metric"><span>${esc(label)}</span><strong>${esc(text)}</strong></article>`;
  }

  function selectedKey() {
    const select = document.querySelector('#diagnosticsModule [data-diagnostics-select]');
    const value = cleanText(select?.value || '');
    if (value && value !== 'overview') return value;
    return '';
  }

  function metricArticles(root) {
    return Array.from(root.querySelectorAll('.diag-metric'));
  }

  function setMetric(root, label, value) {
    const wanted = cleanText(label).toLowerCase();
    const article = metricArticles(root).find(item => cleanText(item.querySelector('span')?.textContent).toLowerCase() === wanted);
    const strong = article?.querySelector('strong');
    if (!strong) return false;
    const next = scalarValue(value) || '-';
    if (strong.textContent !== next) strong.textContent = next;
    return true;
  }

  function unwrap(value) {
    if (!value || typeof value !== 'object') return {};
    if (value.data && typeof value.data === 'object' && (value.data.diagnostics || value.data.status || value.data.module)) return unwrap(value.data);
    if (value.result && typeof value.result === 'object' && (value.result.diagnostics || value.result.status || value.result.module)) return unwrap(value.result);
    if (value.status && typeof value.status === 'object' && (value.status.diagnostics || value.status.module || value.status.version)) return unwrap(value.status);
    return value;
  }

  function diagnosticsBlock(status) {
    const data = unwrap(status || {});
    if (data.diagnostics && typeof data.diagnostics === 'object') return data.diagnostics;
    return null;
  }

  function routeCount(status, diagnostics) {
    const candidates = [
      status?.routes,
      diagnostics?.routes,
      status?.routesPrefix,
      status?.moduleMeta?.routesPrefix,
      status?.meta?.routesPrefix,
      diagnostics?.routesPrefix
    ];
    for (const item of candidates) {
      if (Array.isArray(item) && item.length) return item.length;
      if (item && typeof item === 'object' && Object.keys(item).length) return Object.keys(item).length;
    }
    return 1;
  }

  function entriesFromObject(obj, options = {}) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];
    const max = Number(options.max || 36);
    return Object.entries(obj)
      .filter(([_, value]) => scalarValue(value) !== '')
      .slice(0, max)
      .map(([key, value]) => metric(labelFromKey(key), scalarValue(value)));
  }

  function databaseMetrics(database) {
    if (!database || typeof database !== 'object') return [];
    const out = [];
    if (hasValue(database.ok)) out.push(metric('DB OK', database.ok));
    if (hasValue(database.adapter)) out.push(metric('DB Adapter', database.adapter));
    if (hasValue(database.path)) out.push(metric('DB Pfad', database.path));
    if (hasValue(database.schemaVersion)) out.push(metric('DB Schema', database.schemaVersion));
    if (hasValue(database.expectedSchemaVersion)) out.push(metric('DB Erwartet', database.expectedSchemaVersion));
    if (hasValue(database.error)) out.push(metric('DB Fehler', database.error));
    return out;
  }

  function listBlock(title, items, cls) {
    if (!Array.isArray(items) || !items.length) return '';
    return `<div class="diagnostics-note ${cls || ''}"><strong>${esc(title)}:</strong> ${esc(items.map(item => cleanText(item)).filter(Boolean).join(', '))}</div>`;
  }

  function removeLegacyExplainNotes(root) {
    if (!root) return;
    const removableTexts = [
      'Tagebuch-Diagnose liest den standardisierten diagnostics-Block aus /api/tagebuch/status.',
      'Dieser Block wird generisch aus diagnostics der jeweiligen Statusroute erzeugt.'
    ];
    root.querySelectorAll('.diagnostics-note').forEach(node => {
      const text = cleanText(node.textContent).replace(/\s+/g, ' ');
      if (removableTexts.includes(text)) node.remove();
    });
  }

  function renderGenericSection(key, status, diagnostics) {
    if (!diagnostics || typeof diagnostics !== 'object') return '';
    const countCards = entriesFromObject(diagnostics.counts || {}, { max: 48 });
    const databaseCards = databaseMetrics(diagnostics.database || {});
    const stateCards = entriesFromObject(diagnostics.state || {}, { max: 24 });
    const queueCards = entriesFromObject(diagnostics.queue || {}, { max: 16 });
    const runtimeCards = entriesFromObject(diagnostics.runtime || {}, { max: 16 });
    const hasDetails = countCards.length || databaseCards.length || stateCards.length || queueCards.length || runtimeCards.length || diagnostics.warnings?.length || diagnostics.errors?.length;
    if (!hasDetails) return '';

    return `<section class="diagnostics-card diagnostics-module-extra diagnostics-generic-details" data-generic-diagnostics-details="${esc(key)}">
      <h4>Standard-Diagnostics</h4>
      ${countCards.length ? `<h5>Counts</h5><div class="diagnostics-grid">${countCards.join('')}</div>` : ''}
      ${databaseCards.length ? `<h5>Datenbank</h5><div class="diagnostics-grid">${databaseCards.join('')}</div>` : ''}
      ${stateCards.length ? `<h5>Status/State</h5><div class="diagnostics-grid">${stateCards.join('')}</div>` : ''}
      ${queueCards.length ? `<h5>Queue</h5><div class="diagnostics-grid">${queueCards.join('')}</div>` : ''}
      ${runtimeCards.length ? `<h5>Runtime</h5><div class="diagnostics-grid">${runtimeCards.join('')}</div>` : ''}
      ${listBlock('Warnungen', diagnostics.warnings, 'warn')}
      ${listBlock('Fehler', diagnostics.errors, 'warn')}
    </section>`;
  }

  async function fetchStatus(key) {
    const url = ENDPOINTS[key];
    if (!url) return null;
    const res = await fetch(`${url}?_diagUi=${Date.now()}`, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.ok === false) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
    return data;
  }

  async function patchCurrentModule() {
    const root = document.getElementById('diagnosticsModule');
    if (!root || root.hidden) return;
    const key = selectedKey();
    if (!key) return;

    const card = root.querySelector('.diagnostics-card-main');
    if (!card) return;
    removeLegacyExplainNotes(card);

    try {
      const status = await fetchStatus(key);
      const data = unwrap(status || {});
      const diagnostics = diagnosticsBlock(data);
      if (!diagnostics) return;

      setMetric(root, 'Version', diagnostics.version || data.moduleVersion || data.version || '-');
      setMetric(root, 'Schema', diagnostics.schemaVersion || data.schemaVersion || '-');
      setMetric(root, 'Routen', routeCount(data, diagnostics));
      setMetric(root, 'Config-Quelle', diagnostics.configSource || data.configSource || data.config?.settingsSource || '-');
      setMetric(root, 'Textsystem', diagnostics.textSource || data.textSource || data.textsSource || data.texts?._textsSource || '-');
      setMetric(root, 'Letzter Fehler', diagnostics.lastError || data.lastError || data.error || '-');

      card.querySelectorAll('[data-generic-diagnostics-details]').forEach(node => node.remove());
      const html = renderGenericSection(key, data, diagnostics);
      if (html) {
        const details = card.querySelector('.diagnostics-raw');
        if (details) details.insertAdjacentHTML('beforebegin', html);
        else card.insertAdjacentHTML('beforeend', html);
      }
      removeLegacyExplainNotes(card);
      lastKey = key;
      lastPatchAt = Date.now();
    } catch (err) {
      console.warn('[diagnostics_generic_details] Diagnose-Details konnten nicht ergänzt werden:', key, err?.message || err);
    }
  }

  function schedulePatch() {
    if (pending) return;
    pending = true;
    window.setTimeout(() => {
      pending = false;
      patchCurrentModule();
    }, 100);
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

  return {
    init,
    patchCurrentModule,
    version: MODULE_VERSION,
    get lastPatchAt() { return lastPatchAt; },
    get lastKey() { return lastKey; }
  };
})();
