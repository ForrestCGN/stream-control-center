
window.DiagnosticsModule = (function(){
  'use strict';

  const MODULE_VERSION = '0.2.0-can42-27';
  const FALLBACK_ENDPOINTS = [
    { key:'birthday', label:'Birthday', group:'community', status:'/api/birthday/status', today:'/api/birthday/today', showState:'/api/birthday/show/state' },
    { key:'todo', label:'Todo', group:'community', status:'/api/todo/status', integration:'/api/todo/integration-check' },
    { key:'tagebuch', label:'Tagebuch', group:'community', status:'/api/tagebuch/status', integration:'/api/tagebuch/integration-check' },
    { key:'hug', label:'Hug-System', group:'community', status:'/api/hug/status' },
    { key:'commands', label:'Commands', group:'community', status:'/api/commands/status' },
    { key:'message_rotator', label:'Message-Rotator', group:'system', status:'/api/message-rotator/status' },
    { key:'bus_diagnostics', label:'Bus-Diagnose', group:'admin', status:'/api/bus-diagnostics/status' },
    { key:'communication_bus', label:'Communication-Bus', group:'admin', status:'/api/communication/status' },
    { key:'overlay_monitor', label:'Overlay-Monitor', group:'control', status:'/api/overlay-monitor/status' },
    { key:'obs', label:'OBS', group:'control', status:'/api/obs/status' },
    { key:'sound_system', label:'Sound-System', group:'system', status:'/api/sound/status' },
    { key:'media', label:'Medienverwaltung', group:'system', status:'/api/media/status' },
    { key:'vip', label:'VIP-System', group:'community', status:'/api/vip-sound/status' },
    { key:'alerts', label:'Alerts', group:'control', status:'/api/alerts/status' }
  ];

  const state = {
    selected: 'overview',
    registrySource: 'fallback',
    registryError: '',
    endpoints: FALLBACK_ENDPOINTS.slice(),
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


  function normalizeRegistryEntry(entry) {
    if (!entry || typeof entry !== 'object') return null;
    const key = String(entry.key || '').trim();
    const status = String(entry.status || entry.statusRoute || entry.statusEndpoint || '').trim();
    if (!key || !status) return null;
    return {
      key,
      label: String(entry.label || entry.title || key).trim() || key,
      group: String(entry.group || entry.category || 'system').trim() || 'system',
      status,
      today: entry.today ? String(entry.today) : undefined,
      showState: entry.showState ? String(entry.showState) : undefined,
      integration: entry.integration ? String(entry.integration) : undefined
    };
  }

  async function loadRegistry() {
    try {
      const registry = await getJson('/api/diagnostics/registry');
      const rows = Array.isArray(registry?.entries) ? registry.entries.map(normalizeRegistryEntry).filter(Boolean) : [];
      if (!rows.length) throw new Error('registry_empty');
      state.endpoints = rows;
      state.registrySource = registry.source || 'backend';
      state.registryError = '';
      return rows;
    } catch (err) {
      state.endpoints = FALLBACK_ENDPOINTS.slice();
      state.registrySource = 'fallback';
      state.registryError = err?.message || String(err || 'registry_unavailable');
      return state.endpoints;
    }
  }

  function readonlyEndpoints() {
    return Array.isArray(state.endpoints) && state.endpoints.length ? state.endpoints : FALLBACK_ENDPOINTS;
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
    const diagnostics = data.diagnostics && typeof data.diagnostics === 'object' ? data.diagnostics : {};
    const moduleMetaData = data.moduleMeta || data.meta || {};
    const resolvedRouteCount = Number.isFinite(Number(data.routeCount))
      ? Number(data.routeCount)
      : Number.isFinite(Number(diagnostics?.counts?.routes))
        ? Number(diagnostics.counts.routes)
        : routes.length;

    return {
      key: entry.key,
      label: entry.label,
      group: entry.group,
      ok: !!(result && !result.__error),
      title: meta.module.title || meta.catalog.label || entry.label,
      enabled: meta.catalog.enabled !== false,
      panelId: meta.module.panelId || '',
      version: diagnostics?.version || data.version || data.moduleVersion || moduleMetaData.version || cfg.version || '',
      moduleName: diagnostics?.module || data.module || data.name || moduleMetaData.name || entry.key,
      category: moduleMetaData.category || entry.group || meta.module.group || '',
      schemaVersion: diagnostics?.schemaVersion ?? data.schemaVersion ?? data.schema?.version ?? data.schema?.current ?? '',
      configSource: diagnostics?.configSource || cfg.settingsSource || data.configSource || data.settingsSource || '',
      textSource: diagnostics?.textSource || data.textsSource || data.textSource || data.texts?._textsSource || '',
      statusEndpoint: entry.status || '',
      routeCount: resolvedRouteCount,
      lastError: diagnostics?.lastError || stats.lastError || data.lastError || data.error || '',
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

    const entries = await loadRegistry();
    const results = {};
    const errors = {};
    for (const entry of entries) {
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
    return readonlyEndpoints().map(entry => normalize(entry, state.results[entry.key]));
  }

  function pill(value, ok) {
    const cls = ok ? 'ok' : 'warn';
    return `<span class="diag-pill ${cls}">${esc(value)}</span>`;
  }

  function metric(label, value) {
    return `<article class="diag-metric"><span>${esc(label)}</span><strong>${esc(value || '-')}</strong></article>`;
  }


  function unwrapDiagnosticsPayload(value) {
    if (!value || typeof value !== 'object') return {};
    if (value.checks || value.schemaVersion || value.version || value.module) return value;
    if (value.data && typeof value.data === 'object') return unwrapDiagnosticsPayload(value.data);
    if (value.result && typeof value.result === 'object') return unwrapDiagnosticsPayload(value.result);
    if (value.status && typeof value.status === 'object' && value.status.checks) return unwrapDiagnosticsPayload(value.status);
    return value;
  }

  function firstDefined(...values) {
    for (const value of values) {
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return undefined;
  }

  function checkCount(...checks) {
    for (const check of checks) {
      if (check === undefined || check === null || check === '') continue;
      if (typeof check === 'number' && Number.isFinite(check)) return check;
      if (check && typeof check === 'object') {
        if (typeof check.count === 'number') return check.count;
        if (typeof check.value === 'number') return check.value;
        if (typeof check.rows === 'number') return check.rows;
        if (Array.isArray(check.rows)) return check.rows.length;
      }
    }
    return '-';
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
    status = unwrapDiagnosticsPayload(status || {});
    integration = unwrapDiagnosticsPayload(integration || {});
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

  function standardDiagnosticsBlock(raw) {
    const data = unwrapDiagnosticsPayload(raw || {});
    if (data.diagnostics && typeof data.diagnostics === 'object') return data.diagnostics;
    if (data.status && data.status.diagnostics && typeof data.status.diagnostics === 'object') return data.status.diagnostics;
    return null;
  }

  function computeModuleHealth(item) {
    const raw = item.raw || {};
    const diagnostics = standardDiagnosticsBlock(raw);
    const lastError = item.lastError || state.errors[item.key] || diagnostics?.lastError || '';
    if (item.ok && diagnostics) {
      if (diagnostics.health === 'error' || diagnostics.ok === false) return { level: 'error', label: 'Fehler', reason: cleanDiagnosticError(diagnostics.lastError || diagnostics.errors?.[0]) || 'Diagnostics meldet Fehler' };
      if (diagnostics.health === 'warn' || (Array.isArray(diagnostics.warnings) && diagnostics.warnings.length)) return { level: 'warn', label: 'Warnung', reason: diagnostics.warnings?.[0] || 'Diagnostics meldet Warnung' };
      if (diagnostics.health === 'unknown') return { level: 'unknown', label: 'Unbekannt', reason: diagnostics.lastError || 'Diagnostics unbekannt' };
      return { level: 'ok', label: 'OK', reason: 'diagnostics.ok' };
    }
    if (!item.ok) {
      if (isMissingStatusEndpoint(lastError)) return { level: 'unknown', label: 'Unbekannt', reason: 'Statusroute fehlt' };
      return { level: 'error', label: 'Fehler', reason: cleanDiagnosticError(lastError) || 'Status nicht erreichbar' };
    }

    const warnings = [];
    if (lastError) warnings.push(lastError);

    if (item.key === 'todo') {
      const result = state.results.todo || {};
      const status = unwrapDiagnosticsPayload(result.status || {});
      const integration = unwrapDiagnosticsPayload(result.integration || {});
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
    const status = unwrapDiagnosticsPayload(result.status || result || {});
    const diagnostics = standardDiagnosticsBlock(status);
    const integration = unwrapDiagnosticsPayload(result.integration || {});
    const checks = integration.checks || {};
    const channels = checks.channels || {};
    const tables = checks.tables || {};
    const settings = checks.settings || {};
    const texts = checks.texts || {};
    const database = checks.database || {};
    const counts = diagnostics?.counts || {};

    const missingChannelsFromCheck = Array.isArray(channels.missing) ? channels.missing : [];
    const missingChannels = Number.isFinite(Number(counts.missingChannels)) ? Number(counts.missingChannels) : missingChannelsFromCheck.length;
    const targetCount = firstDefined(counts.targets, checkCount(checks.targets), countObject(status.targets));
    const configuredChannels = firstDefined(counts.channelsConfigured, Object.values(status.channels || channels.targets || {}).filter(item => item && item.configured).length);
    const totalChannels = firstDefined(counts.channelsTotal, countObject(status.channels || channels.targets || {}));

    const statusOk = status.ok !== false && diagnostics?.ok !== false;
    const schemaOk = diagnostics?.schemaReady === true || status.schemaReady === true || status.schemaOk === true || status.schema?.ready === true || integration.schemaVersion >= 1;
    const integrationOk = diagnostics ? diagnostics.ok !== false && diagnostics.health !== 'error' : todoIntegrationLooksOk(status, integration);

    const userStats = firstDefined(counts.userStats, checkCount(tables.userStats, checks.userStats, integration.userStats));
    const dailyStats = firstDefined(counts.dailyStats, checkCount(tables.dailyStats, checks.dailyStats, integration.dailyStats));
    const settingsCount = firstDefined(counts.settings, checkCount(settings, tables.settings, checks.settings));
    const textVariants = firstDefined(counts.textVariants, checkCount(texts.count, texts, tables.textVariants, checks.textVariants));
    const legacyTexts = firstDefined(counts.legacyTexts, checkCount(texts.legacyCount, tables.legacyTexts, checks.legacyTexts));
    const dbValue = diagnostics?.database?.ok === false || database.ok === false
      ? 'prüfen'
      : firstDefined(diagnostics?.database?.adapter, database.adapter, database.path, status.databasePath, 'ok');

    return `<section class="diagnostics-card diagnostics-module-extra">
      <h4>Todo-spezifische Diagnose</h4>
      <div class="diagnostics-grid">
        ${metric('Status OK', statusOk ? 'ja' : 'nein')}
        ${metric('Schema OK', schemaOk ? 'ja' : 'nein')}
        ${metric('Integration OK', integrationOk ? 'ja' : 'nein')}
        ${metric('Targets', targetCount || '-')}
        ${metric('Channels', totalChannels ? `${configuredChannels}/${totalChannels}` : '-')}
        ${metric('Fehlende Channels', missingChannels)}
        ${metric('User-Stats', userStats)}
        ${metric('Daily-Stats', dailyStats)}
        ${metric('Settings', settingsCount)}
        ${metric('Textvarianten', textVariants)}
        ${metric('Legacy-Texte', legacyTexts)}
        ${metric('DB', dbValue)}
      </div>
      ${missingChannels ? `<p class="diagnostics-note warn">Fehlende Channels: ${esc(missingChannelsFromCheck.map(item => item.key || item).join(', ') || missingChannels)}</p>` : '<p class="diagnostics-note">Todo-Diagnostics meldet keine fehlenden Channels.</p>'}
    </section>`;
  }


  function renderTagebuchSpecific(result) {
    const status = unwrapDiagnosticsPayload(result.status || result || {});
    const diagnostics = standardDiagnosticsBlock(status);
    const integration = unwrapDiagnosticsPayload(result.integration || {});
    const checks = integration.checks || {};
    const tables = checks.tables || {};
    const settings = checks.settings || {};
    const texts = checks.texts || {};
    const counts = diagnostics?.counts || {};
    const state = diagnostics?.state || status.state || checks.state || {};
    const database = diagnostics?.database || checks.database || {};
    const webhook = diagnostics?.webhook || checks.webhook || {};

    const statusOk = status.ok !== false && diagnostics?.ok !== false;
    const schemaOk = diagnostics?.schemaReady === true || Number(diagnostics?.schemaVersion || status.schemaVersion || 0) >= 5;
    const integrationOk = diagnostics ? diagnostics.ok !== false && diagnostics.health !== 'error' : (integration.ok !== false && integration.healthy !== false);

    const stateCount = firstDefined(counts.state, checkCount(tables.state, checks.state));
    const runtimeEvents = firstDefined(counts.runtimeEvents, checkCount(tables.runtimeEvents));
    const userStats = firstDefined(counts.userStats, checkCount(tables.userStats, checks.userStats));
    const dailyUserStats = firstDefined(counts.dailyUserStats, checkCount(tables.dailyUserStats, checks.dailyUserStats));
    const settingsCount = firstDefined(counts.settings, checkCount(settings, tables.settings, checks.settings));
    const textVariants = firstDefined(counts.textVariants, checkCount(texts.count, texts, tables.textVariants, checks.textVariants));
    const legacyTexts = firstDefined(counts.legacyTexts, checkCount(texts.legacyCount, tables.legacyTexts, checks.legacyTexts));
    const dbValue = database.ok === false ? 'prüfen' : firstDefined(database.adapter, database.path, status.databasePath, 'ok');
    const activeStream = Boolean(state.activeStream ?? state.active_stream);
    const currentPage = firstDefined(state.currentPageNumber, state.current_page_number, status.state?.currentPageNumber, '-');
    const currentDate = firstDefined(state.currentPageDate, state.current_page_date, status.state?.currentPageDate, '-');
    const webhookStatus = webhook.useDiscordWebhook === false ? 'deaktiviert' : (webhook.hasWebhookUrl ? 'ok' : 'fehlt');

    return `<section class="diagnostics-card diagnostics-module-extra">
      <h4>Tagebuch-spezifische Diagnose</h4>
      <div class="diagnostics-grid">
        ${metric('Status OK', statusOk ? 'ja' : 'nein')}
        ${metric('Schema OK', schemaOk ? 'ja' : 'nein')}
        ${metric('Integration OK', integrationOk ? 'ja' : 'nein')}
        ${metric('State', stateCount)}
        ${metric('Runtime-Events', runtimeEvents)}
        ${metric('User-Stats', userStats)}
        ${metric('Daily-Stats', dailyUserStats)}
        ${metric('Settings', settingsCount)}
        ${metric('Textvarianten', textVariants)}
        ${metric('Legacy-Texte', legacyTexts)}
        ${metric('DB', dbValue)}
        ${metric('Webhook', webhookStatus)}
        ${metric('Aktiver Stream', activeStream ? 'ja' : 'nein')}
        ${metric('Aktuelle Seite', currentPage)}
        ${metric('Seitendatum', currentDate)}
      </div>
    </section>`;
  }


  const GENERIC_LABELS = {
    queued: 'Warteschlange',
    active: 'Aktiv',
    overlayVisible: 'Overlay sichtbar',
    messageTemplates: 'Nachrichten-Vorlagen',
    dailyUsageRows: 'Tagesnutzung',
    settingsRows: 'Einstellungen',
    eventsRows: 'Events',
    roleOverridesRows: 'Rollen-Overrides',
    twitchUsersRows: 'Twitch-User',
    routes: 'Routen',
    apiRoutes: 'API-Routen',
    legacyRoutes: 'Legacy-Routen',
    eventBusEmitted: 'EventBus gesendet',
    eventBusSkipped: 'EventBus übersprungen',
    eventBusErrors: 'EventBus Fehler',
    soundBusEmitted: 'SoundBus gesendet',
    soundBusErrors: 'SoundBus Fehler',
    users: 'User',
    enabledUsers: 'Aktive User',
    disabledUsers: 'Deaktivierte User',
    commands: 'Commands',
    logs: 'Logs',
    handled: 'Verarbeitet',
    ignored: 'Ignoriert',
    executed: 'Ausgeführt',
    failed: 'Fehlgeschlagen',
    cooldowns: 'Cooldowns',
    items: 'Einträge',
    enabledItems: 'Aktive Einträge',
    disabledItems: 'Deaktivierte Einträge',
    textKeys: 'Text-Keys',
    settings: 'Einstellungen',
    textVariants: 'Textvarianten',
    clientConnected: 'Client verbunden',
    clientLastSeenAt: 'Client zuletzt gesehen',
    clientAgeMs: 'Client-Alter',
    phase: 'Statusphase',
    visible: 'Sichtbar',
    current: 'Aktuell',
    parallel: 'Parallel',
    configuredSounds: 'Konfigurierte Sounds',
    outputTargets: 'Ausgabeziele',
    legacyTargets: 'Legacy-Ziele',
    allowedExtensions: 'Erlaubte Endungen',
    scenes: 'Szenen',
    sourceAliases: 'Source-Aliase',
    sceneAliases: 'Scene-Aliase',
    audioActive: 'Audio aktiv',
    obsConnected: 'OBS verbunden',
    obsDetected: 'OBS erkannt',
    obsConnecting: 'OBS verbindet',
    streamActive: 'Stream aktiv',
    recordActive: 'Aufnahme aktiv',
    recordPaused: 'Aufnahme pausiert',
    replayBufferActive: 'Replay Buffer aktiv',
    clients: 'Clients',
    connectedClients: 'Verbundene Clients',
    overlayClients: 'Overlay-Clients',
    clientsWithHeartbeat: 'Clients mit Heartbeat',
    events: 'Events',
    issues: 'Issues',
    subscriptions: 'Subscriptions',
    emitted: 'Gesendet',
    delivered: 'Zugestellt',
    acks: 'ACKs',
    auditErrors: 'Audit-Fehler'
  };

  function labelFromGenericKey(key) {
    const clean = String(key || '').trim();
    if (GENERIC_LABELS[clean]) return GENERIC_LABELS[clean];
    return clean
      .replace(/[_\-.]+/g, ' ')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, c => c.toUpperCase());
  }

  function hasGenericValue(value) {
    return value !== undefined && value !== null && value !== '';
  }

  function looksLikeTimestampMs(key, value) {
    const text = String(key || '').toLowerCase();
    return typeof value === 'number' && value > 1000000000000 && (text.endsWith('at') || text.includes('timestamp') || text.includes('lastseen'));
  }

  function formatGenericTimestamp(value) {
    const date = new Date(Number(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('de-DE');
  }

  function formatGenericDurationMs(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    if (n < 1000) return `${Math.round(n)} ms`;
    if (n < 60000) return `${(n / 1000).toFixed(n < 10000 ? 1 : 0).replace('.', ',')} s`;
    const minutes = Math.floor(n / 60000);
    const seconds = Math.round((n % 60000) / 1000);
    return seconds ? `${minutes} min ${seconds} s` : `${minutes} min`;
  }

  function genericScalar(value, key = '') {
    if (!hasGenericValue(value)) return '';
    if (typeof value === 'boolean') return value ? 'ja' : 'nein';
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) return '';
      if (looksLikeTimestampMs(key, value)) return formatGenericTimestamp(value);
      if (/ms$/i.test(String(key || ''))) return formatGenericDurationMs(value);
      return String(value);
    }
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return String(value.length);
    if (value && typeof value === 'object') {
      if (typeof value.count === 'number') return genericScalar(value.count, key);
      if (hasGenericValue(value.value)) return genericScalar(value.value, key);
      if (Array.isArray(value.rows)) return String(value.rows.length);
    }
    return '';
  }

  function genericMetric(label, value, key = '') {
    const text = genericScalar(value, key) || '-';
    return `<article class="diag-metric"><span>${esc(label)}</span><strong>${esc(text)}</strong></article>`;
  }

  function genericEntries(obj, max = 48) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];
    return Object.entries(obj)
      .filter(([key, value]) => genericScalar(value, key) !== '')
      .slice(0, max)
      .map(([key, value]) => genericMetric(labelFromGenericKey(key), value, key));
  }

  function genericDatabaseEntries(database) {
    if (!database || typeof database !== 'object') return [];
    const out = [];
    if (hasGenericValue(database.ok)) out.push(genericMetric('Datenbank OK', database.ok));
    if (hasGenericValue(database.adapter)) out.push(genericMetric('Datenbank-Typ', database.adapter));
    if (hasGenericValue(database.path)) out.push(genericMetric('Datenbank-Pfad', database.path));
    if (hasGenericValue(database.schemaVersion)) out.push(genericMetric('Datenbank-Schema', database.schemaVersion));
    if (hasGenericValue(database.expectedSchemaVersion)) out.push(genericMetric('Erwartetes Schema', database.expectedSchemaVersion));
    if (hasGenericValue(database.error)) out.push(genericMetric('Datenbank-Fehler', database.error));
    return out;
  }

  function genericListBlock(title, items, cls) {
    if (!Array.isArray(items) || !items.length) return '';
    return `<div class="diagnostics-note ${cls || ''}"><strong>${esc(title)}:</strong> ${esc(items.map(item => String(item || '').trim()).filter(Boolean).join(', '))}</div>`;
  }

  function renderStandardDiagnostics(entry, raw) {
    const diagnostics = standardDiagnosticsBlock(raw);
    if (!diagnostics || typeof diagnostics !== 'object') return '';
    const countCards = genericEntries(diagnostics.counts || {}, 64);
    const databaseCards = genericDatabaseEntries(diagnostics.database || {});
    const stateCards = genericEntries(diagnostics.state || {}, 32);
    const queueCards = genericEntries(diagnostics.queue || {}, 20);
    const runtimeCards = genericEntries(diagnostics.runtime || {}, 20);
    const hasDetails = countCards.length || databaseCards.length || stateCards.length || queueCards.length || runtimeCards.length || diagnostics.warnings?.length || diagnostics.errors?.length;
    if (!hasDetails) return '';
    return `<section class="diagnostics-card diagnostics-module-extra diagnostics-generic-details" data-generic-diagnostics-details="${esc(entry.key)}">
      <h4>Standard-Diagnose</h4>
      ${countCards.length ? `<h5>Zähler</h5><div class="diagnostics-grid">${countCards.join('')}</div>` : ''}
      ${databaseCards.length ? `<h5>Datenbank</h5><div class="diagnostics-grid">${databaseCards.join('')}</div>` : ''}
      ${stateCards.length ? `<h5>Status</h5><div class="diagnostics-grid">${stateCards.join('')}</div>` : ''}
      ${queueCards.length ? `<h5>Warteschlange</h5><div class="diagnostics-grid">${queueCards.join('')}</div>` : ''}
      ${runtimeCards.length ? `<h5>Laufzeit</h5><div class="diagnostics-grid">${runtimeCards.join('')}</div>` : ''}
      ${genericListBlock('Warnungen', diagnostics.warnings, 'warn')}
      ${genericListBlock('Fehler', diagnostics.errors, 'warn')}
    </section>`;
  }

  function combinedRawPayload(entry, result, raw) {
    if (entry.key === 'todo' || entry.key === 'tagebuch') {
      return {
        status: unwrapDiagnosticsPayload(result.status || {}),
        integrationCheck: unwrapDiagnosticsPayload(result.integration || {})
      };
    }
    return raw;
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
        ${entry.key === 'tagebuch' ? renderTagebuchSpecific(result) : ''}
        ${renderStandardDiagnostics(entry, raw)}
        <details class="diagnostics-raw">
          <summary>Rohdaten anzeigen</summary>
          <pre>${esc(JSON.stringify(combinedRawPayload(entry, result, raw), null, 2))}</pre>
        </details>
      </section>
    `;
  }

  function render() {
    ensurePanel();
    if (!root) return;
    const entries = currentEntries();
    const selectedEntry = readonlyEndpoints().find(entry => entry.key === state.selected);
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
              ${readonlyEndpoints().map(entry => `<option value="${esc(entry.key)}" ${state.selected === entry.key ? 'selected' : ''}>${esc(entry.label)}</option>`).join('')}
            </select>
          </label>
          <div class="diagnostics-readonly-line">GET-only Diagnose · keine Show · kein Sound · kein Chat · keine Admin-Aktion</div>
        </section>

        ${state.error ? `<div class="diagnostics-error">${esc(state.error)}</div>` : ''}
        ${state.loadedAt ? `<p class="diagnostics-loaded">Letztes Laden: ${esc(state.loadedAt)} · Registry: ${esc(state.registrySource)}${state.registryError ? ` (${esc(state.registryError)})` : ''}</p>` : ''}
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

  return { init, loadAll, render, version: MODULE_VERSION, registrySource: () => state.registrySource };
})();
