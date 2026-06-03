
window.DiagnosticsModule = (function(){
  'use strict';

  const MODULE_VERSION = '0.1.0-can42-1';
  const READONLY_ENDPOINTS = [
    { key:'birthday', label:'Birthday', group:'community', status:'/api/birthday/status', today:'/api/birthday/today', showState:'/api/birthday/show/state' },
    { key:'todo', label:'Todo', group:'community', status:'/api/todo/status', integration:'/api/todo/integration-check' },
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


  function isMissingStatusEndpoint(error) {
    const text = String(error || '').toLowerCase();
    return text.includes('cannot get') || text.includes('http 404') || text.includes('<!doctype html') || text.includes('not found');
  }

  function cleanDiagnosticError(error) {
    if (!error) return '';
    if (isMissingStatusEndpoint(error)) return 'Statusroute fehlt / noch nicht angebunden';
    const text = String(error).replace(/\s+/g, ' ').trim();
    return text.length > 160 ? `${text.slice(0, 157)}...` : text;
  }

  function todoIntegrationLooksOk(status, integration) {
    const checks = integration?.checks || {};
    const channelsCheck = checks.channels || {};
    const databaseCheck = checks.database || {};
    const missingChannels = Array.isArray(channelsCheck.missing) ? channelsCheck.missing : [];
    const statusChannels = status?.channels || {};
    const configuredChannels = Object.values(statusChannels).filter(item => item && item.configured).length;
    const totalChannels = countObject(statusChannels);
    const schemaOk = status?.schemaReady === true || status?.schemaOk === true || status?.schema?.ready === true;

    if (integration?.__error) return false;
    if (integration?.ok === false || integration?.healthy === false) return false;
    if (databaseCheck.ok === false) return false;
    if (missingChannels.length) return false;

    if (integration?.ok === true || integration?.healthy === true) return true;
    if (schemaOk && totalChannels > 0 && configuredChannels === totalChannels) return true;
    if (schemaOk && Object.keys(checks).length > 0 && !missingChannels.length) return true;

    return false;
  }

  function computeModuleHealth(item) {
    const raw = item.raw || {};
    const lastError = item.lastError || state.errors[item.key] || '';
    if (!item.ok) {
      if (isMissingStatusEndpoint(lastError)) return { level: 'unknown', label: 'Unbekannt', reason: 'Statusroute fehlt' };
      return { level: 'error', label: 'Fehler', reason: cleanDiagnosticError(lastError) || 'Status nicht erreichbar' };
    }

    const warnings = [];
    if (lastError) warnings.push(lastError);

    if (item.key === 'todo') {
      const result = state.results.todo || {};
      const status = result.status || {};
      const integration = result.integration || {};
      const checks = integration.checks || {};
      const channels = checks.channels || {};
      const schemaOk = status.schemaReady === true || status.schemaOk === true || status.schema?.ready === true;
      const integrationOk = todoIntegrationLooksOk(status, integration);
      const missingChannels = Array.isArray(channels.missing) ? channels.missing : [];
      if (!schemaOk) warnings.push('Schema nicht bereit');
      if (!integrationOk) warnings.push('Integration auffällig');
      if (missingChannels.length) warnings.push('fehlende Channels');
    }

    if (raw.warning || raw.warnings?.length) warnings.push('Warnungen vorhanden');
    if (raw.healthy === false || raw.ok === false) return { level: 'error', label: 'Fehler', reason: warnings[0] || 'Status meldet Fehler' };
    if (warnings.length) return { level: 'warn', label: 'Warnung', reason: warnings[0] };
    return { level: 'ok', label: 'OK', reason: 'keine Auffälligkeit' };
  }

  function healthIcon(level) {
    if (level === 'ok') return '🟢';
    if (level === 'warn') return '🟡';
    if (level === 'error') return '🔴';
    return '⚪';
  }

  function healthClass(level) {
    return `health-${level || 'unknown'}`;
  }

  function healthSummary(entries) {
    const counts = { ok: 0, warn: 0, error: 0, unknown: 0 };
    const withHealth = entries.map(item => {
      const health = computeModuleHealth(item);
      counts[health.level || 'unknown'] = (counts[health.level || 'unknown'] || 0) + 1;
      return { ...item, health };
    });
    return { counts, entries: withHealth };
  }

  function renderHealthOverview(entries) {
    const summary = healthSummary(entries);
    return `
      <section class="diagnostics-card diagnostics-health-overview">
        <div class="diagnostics-health-counters">
          <article class="health-counter health-ok"><span>🟢 OK</span><strong>${summary.counts.ok || 0}</strong></article>
          <article class="health-counter health-warn"><span>🟡 Warnung</span><strong>${summary.counts.warn || 0}</strong></article>
          <article class="health-counter health-error"><span>🔴 Fehler</span><strong>${summary.counts.error || 0}</strong></article>
          <article class="health-counter health-unknown"><span>⚪ Unbekannt</span><strong>${summary.counts.unknown || 0}</strong></article>
        </div>
        <div class="diagnostics-health-list">
          ${summary.entries.map(item => `<button type="button" class="diagnostics-health-row ${healthClass(item.health.level)}" data-diagnostics-pick="${esc(item.key)}">
            <span class="health-icon">${healthIcon(item.health.level)}</span>
            <span class="health-title">${esc(item.title)}</span>
            <span class="health-state">${esc(item.health.label)}</span>
            <small>${esc(item.health.reason || '')}</small>
          </button>`).join('')}
        </div>
      </section>
    `;
  }

  function renderOverview(entries) {
    const okCount = entries.filter(item => item.ok).length;
    const enabledCount = entries.filter(item => item.enabled).length;
    const routeCount = entries.reduce((sum, item) => sum + Number(item.routeCount || 0), 0);
    const errCount = entries.length - okCount;
    return `
      ${renderHealthOverview(entries)}
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
            <tbody>${entries.map(item => {
              const health = computeModuleHealth(item);
              return `<tr>
                <td><strong>${esc(item.title)}</strong><small>${esc(item.key)} · ${esc(item.statusEndpoint)}</small></td>
                <td>${esc(item.group || item.category || '-')}</td>
                <td><span class="diag-pill ${health.level === 'ok' ? 'ok' : 'warn'}">${esc(health.label)}</span></td>
                <td>${esc(item.version || '-')}</td>
                <td>${esc(item.schemaVersion || '-')}</td>
                <td>${esc(cleanDiagnosticError(item.lastError || state.errors[item.key]) || '-')}</td>
              </tr>`;
            }).join('')}</tbody>
          </table>
        </div>
        ${errCount ? `<p class="diagnostics-note warn">${esc(errCount)} Status-Endpunkt(e) nicht erreichbar. Das ist bei noch nicht angebundenen Modulen okay.</p>` : ''}
      </section>
    `;
  }


  function countObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? Object.keys(value).length : 0;
  }

  function safeCheckCount(check) {
    if (!check || typeof check !== 'object') return '-';
    if (typeof check.count === 'number') return check.count;
    return '-';
  }

  function renderTodoSpecific(result) {
    const status = result.status || result || {};
    const integration = result.integration || {};
    const checks = integration.checks || {};
    const channels = checks.channels || {};
    const tables = checks.tables || {};
    const settings = checks.settings || {};
    const texts = checks.texts || {};
    const missingChannels = Array.isArray(channels.missing) ? channels.missing : [];
    const targetCount = checks.targets?.count ?? countObject(status.targets);
    const configuredChannels = Object.values(status.channels || {}).filter(item => item && item.configured).length;
    const totalChannels = countObject(status.channels);
    const statusOk = status.ok !== false;
    const schemaOk = status.schemaReady === true || status.schemaOk === true || status.schema?.ready === true;
    const integrationOk = todoIntegrationLooksOk(status, integration);

    return `<section class="diagnostics-card diagnostics-module-extra">
      <h4>Todo-spezifische Diagnose</h4>
      <div class="diagnostics-grid">
        ${metric('Status OK', statusOk ? 'ja' : 'nein')}
        ${metric('Schema OK', schemaOk ? 'ja' : 'nein')}
        ${metric('Integration OK', integrationOk ? 'ja' : 'nein')}
        ${metric('Targets', targetCount || '-')}
        ${metric('Channels', totalChannels ? `${configuredChannels}/${totalChannels}` : '-')}
        ${metric('Fehlende Channels', missingChannels.length)}
        ${metric('User-Stats', safeCheckCount(tables.userStats))}
        ${metric('Daily-Stats', safeCheckCount(tables.dailyStats))}
        ${metric('Settings', settings.count ?? safeCheckCount(tables.settings))}
        ${metric('Textvarianten', texts.count ?? safeCheckCount(tables.textVariants))}
        ${metric('Legacy-Texte', texts.legacyCount ?? safeCheckCount(tables.legacyTexts))}
        ${metric('DB', checks.database?.ok === false ? 'prüfen' : (checks.database?.adapter || 'ok'))}
      </div>
      ${missingChannels.length ? `<p class="diagnostics-note warn">Fehlende Channels: ${esc(missingChannels.map(item => item.key || item).join(', '))}</p>` : '<p class="diagnostics-note">Todo-Integration meldet keine fehlenden Channels.</p>'}
    </section>`;
  }

  function renderModuleDetails(entry) {
    const item = normalize(entry, state.results[entry.key]);
    const result = state.results[entry.key] || {};
    const raw = result.status || result || {};
    const today = result.today || raw.today || {};
    const show = result.showState?.state || raw.show || {};
    const health = computeModuleHealth(item);
    return `
      <section class="diagnostics-card diagnostics-card-main">
        <div class="diagnostics-headline-row">
          <div>
            <h3>${healthIcon(health.level)} ${esc(item.title)}</h3>
            <p>${esc(item.key)} · ${esc(item.statusEndpoint)}</p>
          </div>
          <div class="diagnostics-detail-pills">
            <span class="diag-pill ${health.level === 'ok' ? 'ok' : 'warn'}">${esc(health.label)}</span>
            ${pill(item.ok ? 'GET Status erreichbar' : 'Statusfehler', item.ok)}
          </div>
        </div>
        <div class="diagnostics-grid">
          ${metric('Version', item.version || '-')}
          ${metric('Schema', item.schemaVersion || '-')}
          ${metric('Gruppe/Kategorie', item.category || item.group || '-')}
          ${metric('Routen', item.routeCount || '-')}
          ${metric('Config-Quelle', item.configSource || '-')}
          ${metric('Textsystem', item.textSource || '-')}
          ${metric('Panel', item.panelId || '-')}
          ${metric('Letzter Fehler', cleanDiagnosticError(item.lastError || state.errors[item.key]) || '-')}
        </div>
        ${entry.key === 'birthday' ? `<div class="diagnostics-grid">
          ${metric('Heute Geburtstage', today.count ?? (Array.isArray(today.rows) ? today.rows.length : '-'))}
          ${metric('Show', show.active ? `aktiv · ${show.phase || ''}` : 'inaktiv')}
          ${metric('Show-Ziel', show.targetDisplayName || show.targetLogin || '-')}
          ${metric('Queue-Abfrage', 'nicht genutzt')}
        </div>` : ''}
        ${entry.key === 'todo' ? renderTodoSpecific(result) : ''}
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
    root?.querySelectorAll('[data-diagnostics-pick]')?.forEach(btn => {
      btn.addEventListener('click', () => {
        state.selected = btn.dataset.diagnosticsPick || 'overview';
        render();
      });
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
