
window.DiagnosticsModule = (function(){
  'use strict';

  const MODULE_VERSION = '0.1.0-can42-1';
  const READONLY_ENDPOINTS = [
    { key:'birthday', label:'Birthday', group:'community', status:'/api/birthday/status', today:'/api/birthday/today', showState:'/api/birthday/show/state' },
    { key:'todo', label:'Todo', group:'community', status:'/api/todo/status' },
    { key:'tagebuch', label:'Tagebuch', group:'community', status:'/api/tagebuch/status' },
    { key:'hug', label:'Hug-System', group:'community', status:'/api/hug/status' },
    { key:'commands', label:'Commands', group:'community', status:'/api/commands/status' },
    { key:'message_rotator', label:'Message-Rotator', group:'system', status:'/api/message-rotator/status' },
    { key:'bus_diagnostics', label:'Bus-Diagnose', group:'admin', status:'/api/bus-diagnostics/status' },
    { key:'overlay_monitor', label:'Overlay-Monitor', group:'control', status:'/api/overlay-monitor/status' },
    { key:'sound_system', label:'Sound-System', group:'system', status:'/api/sound/status' },
    { key:'media', label:'Medienverwaltung', group:'system', status:'/api/media/status' },
    { key:'vip', label:'VIP-System', group:'community', status:'/api/vip/status' },
    { key:'alerts', label:'Alerts', group:'control', status:'/api/alerts/status' }
  ];

  const state = {
    selected: 'overview',
    loading: false,
    loadedAt: '',
    results: {},
    errors: {},
    notice: '',
    error: ''
  };

  let root = null;

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function ensurePanel() {
    root = document.getElementById('diagnosticsModule');
    if (root) return root;
    const main = document.querySelector('.main');
    if (!main) return null;
    root = document.createElement('section');
    root.id = 'diagnosticsModule';
    root.className = 'dashboard-module diagnostics-admin';
    root.dataset.modulePanel = 'diagnostics';
    root.hidden = true;
    main.appendChild(root);
    return root;
  }

  function registerWithDashboard() {
    if (!window.CGN) return;
    window.CGN.modules.diagnostics = {
      title: 'Diagnose',
      panelId: 'diagnosticsModule',
      group: 'admin',
      overlayLink: '',
      reload() { return window.DiagnosticsModule?.loadAll?.(true); }
    };
    window.CGN.moduleCatalog.diagnostics = {
      label: 'Diagnose',
      icon: '🩺',
      enabled: true,
      description: 'Zentrale Read-only Moduldiagnose für Admin/Owner.'
    };
    const items = window.CGN.sections?.admin?.items;
    if (Array.isArray(items) && !items.includes('diagnostics')) items.push('diagnostics');
    window.SectionHomeModule?.render?.();
  }

  async function getJson(url) {
    if (!url) return null;
    if (window.CGN?.api) return window.CGN.api(url);
    const res = await fetch(url, { method: 'GET', credentials: 'same-origin' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.ok === false) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
    return data;
  }

  function moduleMeta(key) {
    const catalog = window.CGN?.moduleCatalog?.[key] || {};
    const module = window.CGN?.modules?.[key] || {};
    return { catalog, module };
  }

  function normalize(entry, result) {
    const data = result?.status || result || {};
    const meta = moduleMeta(entry.key);
    const cfg = data.config || {};
    const stats = data.stats || {};
    const routes = Array.isArray(data.routes) ? data.routes : [];
    const moduleMetaData = data.moduleMeta || data.meta || {};

    return {
      key: entry.key,
      label: entry.label,
      group: entry.group,
      ok: !!(result && !result.__error),
      title: meta.module.title || meta.catalog.label || entry.label,
      enabled: meta.catalog.enabled !== false,
      panelId: meta.module.panelId || '',
      version: data.version || data.moduleVersion || moduleMetaData.version || cfg.version || '',
      moduleName: data.module || data.name || moduleMetaData.name || entry.key,
      category: moduleMetaData.category || entry.group || meta.module.group || '',
      schemaVersion: data.schemaVersion || data.schema?.version || data.schema?.current || '',
      configSource: cfg.settingsSource || data.configSource || data.settingsSource || '',
      textSource: data.textsSource || data.textSource || data.texts?._textsSource || '',
      statusEndpoint: entry.status || '',
      routeCount: routes.length,
      lastError: stats.lastError || data.lastError || data.error || '',
      raw: data
    };
  }

  async function loadEntry(entry) {
    const out = { entry };
    try {
      out.status = await getJson(entry.status);
      if (entry.today) out.today = await getJson(entry.today).catch(err => ({ ok:false, __error: err.message }));
      if (entry.showState) out.showState = await getJson(entry.showState).catch(err => ({ ok:false, __error: err.message }));
      return out;
    } catch (err) {
      return { __error: err.message || String(err), entry };
    }
  }

  async function loadAll(force = false) {
    ensurePanel();
    if (!root) return;
    if (!force && Object.keys(state.results).length) { render(); return; }
    state.loading = true;
    state.error = '';
    render();

    const results = {};
    const errors = {};
    for (const entry of READONLY_ENDPOINTS) {
      const result = await loadEntry(entry);
      results[entry.key] = result;
      if (result.__error) errors[entry.key] = result.__error;
    }

    state.results = results;
    state.errors = errors;
    state.loadedAt = new Date().toLocaleString('de-DE');
    state.loading = false;
    render();
  }

  function currentEntries() {
    return READONLY_ENDPOINTS.map(entry => normalize(entry, state.results[entry.key]));
  }

  function pill(value, ok) {
    const cls = ok ? 'ok' : 'warn';
    return `<span class="diag-pill ${cls}">${esc(value)}</span>`;
  }

  function metric(label, value) {
    return `<article class="diag-metric"><span>${esc(label)}</span><strong>${esc(value || '-')}</strong></article>`;
  }

  function renderOverview(entries) {
    const okCount = entries.filter(item => item.ok).length;
    const enabledCount = entries.filter(item => item.enabled).length;
    const routeCount = entries.reduce((sum, item) => sum + Number(item.routeCount || 0), 0);
    const errCount = entries.length - okCount;
    return `
      <div class="diagnostics-grid">
        ${metric('Module in Diagnose', entries.length)}
        ${metric('Status erreichbar', `${okCount}/${entries.length}`)}
        ${metric('Dashboard enabled', enabledCount)}
        ${metric('erkannte Routen', routeCount)}
      </div>
      <section class="diagnostics-card diagnostics-card-main">
        <h3>Modulübersicht</h3>
        <div class="diagnostics-table-wrap">
          <table>
            <thead><tr><th>Modul</th><th>Gruppe</th><th>Status</th><th>Version</th><th>Schema</th><th>Letzter Fehler</th></tr></thead>
            <tbody>${entries.map(item => `<tr>
              <td><strong>${esc(item.title)}</strong><small>${esc(item.key)} · ${esc(item.statusEndpoint)}</small></td>
              <td>${esc(item.group || item.category || '-')}</td>
              <td>${pill(item.ok ? 'erreichbar' : 'Fehler', item.ok)}</td>
              <td>${esc(item.version || '-')}</td>
              <td>${esc(item.schemaVersion || '-')}</td>
              <td>${esc(item.lastError || state.errors[item.key] || '-')}</td>
            </tr>`).join('')}</tbody>
          </table>
        </div>
        ${errCount ? `<p class="diagnostics-note warn">${esc(errCount)} Status-Endpunkt(e) nicht erreichbar. Das ist bei noch nicht angebundenen Modulen okay.</p>` : ''}
      </section>
    `;
  }

  function renderModuleDetails(entry) {
    const item = normalize(entry, state.results[entry.key]);
    const result = state.results[entry.key] || {};
    const raw = result.status || result || {};
    const today = result.today || raw.today || {};
    const show = result.showState?.state || raw.show || {};
    return `
      <section class="diagnostics-card diagnostics-card-main">
        <div class="diagnostics-headline-row">
          <div>
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.key)} · ${esc(item.statusEndpoint)}</p>
          </div>
          ${pill(item.ok ? 'GET Status erreichbar' : 'Statusfehler', item.ok)}
        </div>
        <div class="diagnostics-grid">
          ${metric('Version', item.version || '-')}
          ${metric('Schema', item.schemaVersion || '-')}
          ${metric('Gruppe/Kategorie', item.category || item.group || '-')}
          ${metric('Routen', item.routeCount || '-')}
          ${metric('Config-Quelle', item.configSource || '-')}
          ${metric('Textsystem', item.textSource || '-')}
          ${metric('Panel', item.panelId || '-')}
          ${metric('Letzter Fehler', item.lastError || state.errors[item.key] || '-')}
        </div>
        ${entry.key === 'birthday' ? `<div class="diagnostics-grid">
          ${metric('Heute Geburtstage', today.count ?? (Array.isArray(today.rows) ? today.rows.length : '-'))}
          ${metric('Show', show.active ? `aktiv · ${show.phase || ''}` : 'inaktiv')}
          ${metric('Show-Ziel', show.targetDisplayName || show.targetLogin || '-')}
          ${metric('Queue-Abfrage', 'nicht genutzt')}
        </div>` : ''}
        <p class="diagnostics-note">Routen werden hier nicht als Liste angezeigt. Die Anzahl bleibt oben sichtbar; Details stehen bei Bedarf in den Rohdaten.</p>
        <details class="diagnostics-raw">
          <summary>Rohdaten anzeigen</summary>
          <pre>${esc(JSON.stringify(raw, null, 2))}</pre>
        </details>
      </section>
    `;
  }

  function render() {
    ensurePanel();
    if (!root) return;
    const entries = currentEntries();
    const selectedEntry = READONLY_ENDPOINTS.find(entry => entry.key === state.selected);
    root.innerHTML = `
      <div class="diagnostics-wrap">
        <section class="diagnostics-hero">
          <div>
            <span class="diagnostics-kicker">Admin / Diagnose</span>
            <h2>🩺 Zentrale Moduldiagnose</h2>
            <p>Ein zentraler Ort für Read-only Statuswerte. Modul-Seiten bleiben Bedienseiten.</p>
          </div>
          <div class="diagnostics-actions">
            <button type="button" data-diagnostics-refresh ${state.loading ? 'disabled' : ''}>${state.loading ? 'Lade...' : 'Status aktualisieren'}</button>
          </div>
        </section>

        <section class="diagnostics-toolbar">
          <label>Modul
            <select data-diagnostics-select>
              <option value="overview" ${state.selected === 'overview' ? 'selected' : ''}>Gesamtübersicht</option>
              ${READONLY_ENDPOINTS.map(entry => `<option value="${esc(entry.key)}" ${state.selected === entry.key ? 'selected' : ''}>${esc(entry.label)}</option>`).join('')}
            </select>
          </label>
          <div class="diagnostics-readonly-line">GET-only Diagnose · keine Show · kein Sound · kein Chat · keine Admin-Aktion</div>
        </section>

        ${state.error ? `<div class="diagnostics-error">${esc(state.error)}</div>` : ''}
        ${state.loadedAt ? `<p class="diagnostics-loaded">Letztes Laden: ${esc(state.loadedAt)}</p>` : ''}
        ${state.loading && !Object.keys(state.results).length ? '<section class="diagnostics-card">Lade Diagnosewerte...</section>' : ''}
        ${state.selected === 'overview' ? renderOverview(entries) : selectedEntry ? renderModuleDetails(selectedEntry) : renderOverview(entries)}
      </div>`;
    bind();
  }

  function bind() {
    root?.querySelector('[data-diagnostics-refresh]')?.addEventListener('click', () => loadAll(true));
    root?.querySelector('[data-diagnostics-select]')?.addEventListener('change', ev => {
      state.selected = ev.target.value || 'overview';
      render();
    });
  }

  function init() {
    registerWithDashboard();
    ensurePanel();
    window.SectionHomeModule?.render?.();
  }

  window.addEventListener('cgn:module-show', ev => {
    if (ev.detail?.module === 'diagnostics') loadAll(false);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { init, loadAll, render, version: MODULE_VERSION };
})();
