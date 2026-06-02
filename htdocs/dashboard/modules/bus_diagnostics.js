(function(){
  const MODULE = 'BusDiagnosticsModule';
  const panelId = 'busDiagnosticsModule';
  const state = {
    loading: false,
    lastData: null,
    lastSettings: null,
    settingsLoading: false,
    settingsError: '',
    lastError: '',
    activeTab: localStorage.getItem('cgn-busdiag-tab') || 'overview',
    recoverySubTab: localStorage.getItem('cgn-busdiag-recovery-tab') || 'overview',
    autoTimer: null,
    countdownTimer: null,
    autoRefresh: localStorage.getItem('cgn-busdiag-auto-refresh') === '1',
    refreshEveryMs: Number(localStorage.getItem('cgn-busdiag-refresh-ms') || 10000),
    nextRefreshAt: 0,
    visible: !document.hidden,
    manualDiagnosticsRefreshLoading: false,
    manualDiagnosticsRefreshLastAt: '',
    manualDiagnosticsRefreshLastResult: '',
    manualDiagnosticsRefreshError: '',
    manualDiagnosticsRefreshLastRoute: '',
    manualDiagnosticsRefreshReadOnly: true,
    manualDiagnosticsRefreshProductiveTouch: false,
    manualStatusResyncLoading: false,
    manualStatusResyncLastAt: '',
    manualStatusResyncStartedAt: '',
    manualStatusResyncLastResult: '',
    manualStatusResyncError: '',
    manualStatusResyncReadOnly: true,
    manualStatusResyncProductiveTouch: false,
    manualStatusResyncCanPrepare: false,
    manualStatusResyncCanExecute: false,
    manualStatusResyncSources: [],
    manualStatusResyncGuards: {},
    busMatrix: null,
    busMatrixLoading: false,
    busMatrixError: '',
    soundDryRunResult: null,
    soundDryRunRunning: false,
    soundDryRunError: ''
  };

  const TABS = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'clients', label: 'Clients' },
    { id: 'events', label: 'Events & ACKs' },
    { id: 'integrations', label: 'Integrationen' },
    { id: 'busmatrix', label: 'Bus-Matrix' },
    { id: 'recovery', label: 'Recovery' },
    { id: 'issues', label: 'Issues' },
    { id: 'config', label: 'Config' },
    { id: 'raw', label: 'Rohdaten' }
  ];

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }
  function panel(){ return document.getElementById(panelId); }
  function bool(v){ return v ? 'ja' : 'nein'; }
  function num(v){ return Number.isFinite(Number(v)) ? Number(v).toLocaleString('de-DE') : '0'; }
  function value(v, fallback = '-'){ return v === undefined || v === null || v === '' ? fallback : String(v); }
  function compactJson(obj){ try { return JSON.stringify(obj || {}, null, 2); } catch (_) { return '{}'; } }
  function asList(value){ return Array.isArray(value) ? value : []; }
  function fmtTime(value){ if (!value) return '-'; try { return new Date(value).toLocaleString('de-DE'); } catch (_) { return String(value); } }

  function statusClass(status){
    const s = String(status || '').toLowerCase();
    if (['ok','online','connected','true','ready'].includes(s)) return 'ok';
    if (['warning','warn','stale','offline','false'].includes(s)) return 'warning';
    if (['error','failed','dead'].includes(s)) return 'error';
    return 'neutral';
  }
  function badge(text, status){ return `<span class="busdiag-badge ${statusClass(status || text)}">${esc(text)}</span>`; }
  function metric(label, val, note, extraClass = ''){ return `<div class="busdiag-metric ${esc(extraClass)}"><span>${esc(label)}</span><strong title="${esc(value(val))}">${esc(value(val))}</strong>${note ? `<small>${esc(note)}</small>` : ''}</div>`; }
  function card(title, body, extraClass = ''){ return `<article class="busdiag-card ${extraClass}"><h3>${esc(title)}</h3>${body}</article>`; }

  function refreshLabel(){ return state.autoRefresh ? `Auto: an (${Math.round(state.refreshEveryMs / 1000)}s)` : 'Auto: aus'; }

  function getStatus(){ return state.lastData || {}; }
  function getRecoveryPreflightRoute(){ return getStatus().recoveryPreflightRoute || {}; }
  function getEffectiveRecoveryPreflight(){
    const route = getRecoveryPreflightRoute();
    return route.recoveryPreflight || getStatus().recoveryPreflight || {};
  }
  function getEffectiveRecoveryPreflightSummary(){
    const routeSummary = getRecoveryPreflightRoute().summary || {};
    return Object.assign({}, getSummary(), routeSummary);
  }
  function getCommunication(){ return getStatus().communication || {}; }
  function getBusStatus(){ return getCommunication().statusBody || {}; }
  function getSummary(){ return getStatus().summary || {}; }
  function getClients(){ return asList(getBusStatus().clients); }
  function getEvents(){ return asList(getBusStatus().events); }
  function getIssues(){ return asList(getBusStatus().issues); }

  function isOverlayClient(client){
    const id = String(client?.id || '').toLowerCase();
    const type = String(client?.type || '').toLowerCase();
    const mode = String(client?.mode || '').toLowerCase();
    return type === 'overlay' || id.startsWith('overlay:') || mode === 'overlay';
  }

  function classifyClient(client){
    const id = String(client?.id || '').toLowerCase();
    const type = String(client?.type || '').toLowerCase();
    const mode = String(client?.mode || '').toLowerCase();
    if (isOverlayClient(client)) return 'overlays';
    if (type === 'module' || id.startsWith('module:') || mode === 'backend') return 'modules';
    if (['debug','tool','dashboard'].includes(type) || mode.includes('debug') || id.includes('debug')) return 'tools';
    return 'unknown';
  }

  function splitClients(){
    const clients = getClients();
    return {
      all: clients,
      modules: clients.filter(c => classifyClient(c) === 'modules'),
      overlays: clients.filter(c => classifyClient(c) === 'overlays'),
      tools: clients.filter(c => classifyClient(c) === 'tools'),
      unknown: clients.filter(c => classifyClient(c) === 'unknown')
    };
  }

  function clientStatus(client){
    return String(client?.status || (client?.connected ? 'online' : 'offline') || 'unknown').toLowerCase();
  }

  function countByStatus(clients){
    const result = { online: 0, stale: 0, offline: 0, dead: 0, ignored: 0, other: 0 };
    for (const client of asList(clients)) {
      const s = clientStatus(client);
      if (s === 'online' || s === 'connected' || s === 'ok') result.online += 1;
      else if (s === 'stale') result.stale += 1;
      else if (s === 'offline') result.offline += 1;
      else if (s === 'dead') result.dead += 1;
      else if (s === 'ignored') result.ignored += 1;
      else result.other += 1;
    }
    return result;
  }

  function newestClientTime(clients, fields = ['lastHeartbeatAt','lastSeenAt','connectedAt','registeredAt']){
    let newest = '';
    let newestMs = 0;
    for (const client of asList(clients)) {
      for (const field of fields) {
        const raw = client && client[field];
        if (!raw) continue;
        const ms = new Date(raw).getTime();
        if (Number.isFinite(ms) && ms > newestMs) {
          newestMs = ms;
          newest = raw;
        }
      }
    }
    return newest;
  }

  function sortClientsForDisplay(clients){
    const order = { online: 0, connected: 0, ok: 0, stale: 1, offline: 2, ignored: 3, dead: 4 };
    return asList(clients).slice().sort((a, b) => {
      const as = order[clientStatus(a)] ?? 9;
      const bs = order[clientStatus(b)] ?? 9;
      if (as !== bs) return as - bs;
      return String(a.id || '').localeCompare(String(b.id || ''), 'de');
    });
  }

  function updateLiveStatus(){
    const root = panel();
    if (!root) return;
    const live = root.querySelector('[data-busdiag-live]');
    const autoBtn = root.querySelector('[data-busdiag-action="toggle-auto"]');
    if (autoBtn) autoBtn.textContent = refreshLabel();
    if (!live) return;
    const last = state.lastData?.fetchedAt ? new Date(state.lastData.fetchedAt).toLocaleTimeString('de-DE') : '-';
    const status = state.lastError ? 'Fehler' : (state.loading ? 'Lädt…' : 'Bereit');
    let next = '-';
    if (state.autoRefresh && state.nextRefreshAt && state.visible) next = `${Math.max(0, Math.ceil((state.nextRefreshAt - Date.now()) / 1000))}s`;
    else if (state.autoRefresh && !state.visible) next = 'pausiert';
    live.innerHTML = `<span>${esc(status)}</span><span>Letztes Laden: ${esc(last)}</span><span>Auto: ${state.autoRefresh ? 'an' : 'aus'}</span><span>Nächstes Laden: ${esc(next)}</span>`;
  }

  function renderSkeleton(){
    const root = panel();
    if (!root) return;
    root.innerHTML = `
      <div class="busdiag-shell">
        <div class="busdiag-hero glass">
          <div>
            <p class="busdiag-kicker">Event-Bus</p>
            <h2>Event-Bus / Communication Bus</h2>
            <p>Strukturierte Übersicht für Bus-Status, Clients, Events, Integrationen, Issues und DB-basierte Bus-Config.</p>
          </div>
          <div class="busdiag-actions">
            <button type="button" data-busdiag-action="refresh">Status laden</button>
            <button type="button" class="secondary" data-busdiag-action="check">Check ausführen</button>
            <button type="button" class="secondary" data-busdiag-action="toggle-auto">${esc(refreshLabel())}</button>
            <select class="busdiag-select" data-busdiag-refresh-ms title="Auto-Refresh Intervall">
              <option value="5000">5s</option><option value="10000">10s</option><option value="30000">30s</option><option value="60000">60s</option>
            </select>
            <a class="ghost-link" href="/public/tools/bus_diagnostics_dashboard.html" target="_blank">Standalone</a>
          </div>
        </div>
        <div class="busdiag-livebar" data-busdiag-live aria-live="polite"></div>
        <nav class="busdiag-tabs" data-busdiag-tabs>${renderTabs()}</nav>
        <div class="busdiag-content" data-busdiag-content><div class="busdiag-empty glass">Noch keine Daten geladen.</div></div>
      </div>
    `;
    root.querySelector('[data-busdiag-action="refresh"]')?.addEventListener('click', () => loadAll(false));
    root.querySelector('[data-busdiag-action="check"]')?.addEventListener('click', () => loadAll(true));
    root.querySelector('[data-busdiag-action="sound-dry-run"]')?.addEventListener('click', runSoundBusDryRun);
    root.querySelector('[data-busdiag-action="toggle-auto"]')?.addEventListener('click', toggleAutoRefresh);
    root.querySelectorAll('[data-busdiag-tab]').forEach(btn => btn.addEventListener('click', () => setTab(btn.dataset.busdiagTab)));
    const refreshSelect = root.querySelector('[data-busdiag-refresh-ms]');
    if (refreshSelect) {
      refreshSelect.value = String(state.refreshEveryMs);
      refreshSelect.addEventListener('change', () => {
        state.refreshEveryMs = Number(refreshSelect.value || 10000);
        localStorage.setItem('cgn-busdiag-refresh-ms', String(state.refreshEveryMs));
        restartAutoTimer();
        updateLiveStatus();
      });
    }
    restartAutoTimer();
    updateLiveStatus();
  }

  function renderTabs(){
    return TABS.map(tab => `<button type="button" data-busdiag-tab="${esc(tab.id)}" class="${tab.id === state.activeTab ? 'active' : ''}">${esc(tab.label)}</button>`).join('');
  }

  function refreshTabs(){
    const nav = panel()?.querySelector('[data-busdiag-tabs]');
    if (nav) nav.innerHTML = renderTabs();
    nav?.querySelectorAll('[data-busdiag-tab]').forEach(btn => btn.addEventListener('click', () => setTab(btn.dataset.busdiagTab)));
  }

  function setTab(tabId){
    if (!TABS.some(t => t.id === tabId)) return;
    state.activeTab = tabId;
    localStorage.setItem('cgn-busdiag-tab', tabId);
    refreshTabs();
    renderCurrentTab();
    if (tabId === 'config') loadSettings(false);
  }

  function setRecoverySubTab(tabId){
    const allowed = ['overview', 'details', 'readiness', 'preflight', 'safety', 'locks'];
    if (!allowed.includes(tabId)) return;
    state.recoverySubTab = tabId;
    localStorage.setItem('cgn-busdiag-recovery-tab', tabId);
    renderCurrentTab();
  }

  async function loadSettings(force){
    if (state.settingsLoading) return state.lastSettings;
    if (!force && state.lastSettings && state.lastSettings.ok === true) return state.lastSettings;
    state.settingsLoading = true;
    state.settingsError = '';
    if (state.activeTab === 'config') renderCurrentTab();
    try {
      state.lastSettings = await window.CGN.api('/api/communication/settings');
      state.settingsError = '';
      return state.lastSettings;
    } catch (err) {
      state.settingsError = err.message || String(err);
      state.lastSettings = null;
      return null;
    } finally {
      state.settingsLoading = false;
      if (state.activeTab === 'config') renderCurrentTab();
    }
  }

  async function loadRecoveryPreflightRoute(){
    try {
      return await window.CGN.api('/api/bus-diagnostics/recovery-preflight');
    } catch (err) {
      return {
        ok: false,
        fetchOk: false,
        readOnly: true,
        feature: 'recovery_preflight',
        routeVersion: 'unavailable',
        error: err.message || String(err),
        routeSafety: {
          method: 'GET',
          readOnly: true,
          commandRoute: false,
          executeRoute: false,
          prepareRoute: false,
          recoveryExecution: false
        }
      };
    }
  }

  async function loadBusIntegrationMatrix(){
    if (state.busMatrixLoading) return state.busMatrix;
    state.busMatrixLoading = true;
    state.busMatrixError = '';
    try {
      const matrix = await window.CGN.api('/api/bus-integration-matrix/status');
      state.busMatrix = matrix;
      state.busMatrixError = '';
      return matrix;
    } catch (err) {
      const fallback = {
        ok: false,
        fetchOk: false,
        readOnly: true,
        module: 'bus_integration_matrix',
        feature: 'bus_integration_matrix',
        error: err.message || String(err),
        summary: {},
        rows: [],
        todoNextSteps: [
          'backend/modules/bus_integration_matrix.js einspielen und Node neu starten.',
          'Danach diese Seite erneut laden.'
        ]
      };
      state.busMatrix = fallback;
      state.busMatrixError = fallback.error;
      return fallback;
    } finally {
      state.busMatrixLoading = false;
    }
  }

  async function manualDiagnosticsRefresh(){
    if (state.loading || state.manualDiagnosticsRefreshLoading) return;
    state.manualDiagnosticsRefreshLoading = true;
    state.manualDiagnosticsRefreshError = '';
    state.manualDiagnosticsRefreshLastResult = 'running';
    state.manualDiagnosticsRefreshLastRoute = 'GET /api/bus-diagnostics/recovery-preflight';
    state.manualDiagnosticsRefreshReadOnly = true;
    state.manualDiagnosticsRefreshProductiveTouch = false;
    renderCurrentTab();
    await loadAll(false);
    const route = getRecoveryPreflightRoute();
    const routeOk = route && route.fetchOk !== false && route.readOnly !== false && route.routeSafety?.recoveryExecution !== true;
    state.manualDiagnosticsRefreshLastAt = new Date().toISOString();
    state.manualDiagnosticsRefreshLastRoute = 'GET /api/bus-diagnostics/recovery-preflight';
    state.manualDiagnosticsRefreshReadOnly = route?.readOnly !== false && route?.routeSafety?.readOnly !== false;
    state.manualDiagnosticsRefreshProductiveTouch = false;
    if (state.lastError || !routeOk) {
      state.manualDiagnosticsRefreshLastResult = 'error';
      state.manualDiagnosticsRefreshError = state.lastError || route?.error || 'Recovery-Preflight Route konnte nicht sauber gelesen werden.';
    } else {
      state.manualDiagnosticsRefreshLastResult = 'ok';
      state.manualDiagnosticsRefreshError = '';
    }
    state.manualDiagnosticsRefreshLoading = false;
    renderCurrentTab();
    updateLiveStatus();
  }

  function buildManualStatusResyncGuards(route, preflight){
    const routeSafety = route?.routeSafety || {};
    const readOnlyGuard = route?.readOnly === true && preflight?.readOnly === true;
    const routeSafetyGuard = routeSafety.method === 'GET'
      && routeSafety.readOnly === true
      && routeSafety.commandRoute === false
      && routeSafety.prepareRoute === false
      && routeSafety.executeRoute === false
      && routeSafety.recoveryExecution === false;
    const noPrepareExecuteGuard = preflight?.canPrepare === false && preflight?.canExecute === false;
    return {
      readOnlyGuard,
      noMutationGuard: true,
      routeSafetyGuard,
      noPrepareExecuteGuard,
      dashboardOnlyGuard: true
    };
  }

  function guardLabel(key){
    const labels = {
      readOnlyGuard: 'Read-only',
      noMutationGuard: 'Keine Mutation',
      routeSafetyGuard: 'Route-Safety',
      noPrepareExecuteGuard: 'Prepare/Execute gesperrt',
      dashboardOnlyGuard: 'Nur Dashboard',
      noAutoRetryGuard: 'Kein Auto-Retry',
      noTimerGuard: 'Kein Timer',
      manualOnlyGuard: 'Nur manuell'
    };
    return labels[key] || key;
  }

  function guardCategory(key){
    if (['readOnlyGuard','noMutationGuard','routeSafetyGuard','noPrepareExecuteGuard','dashboardOnlyGuard'].includes(key)) return 'read_only';
    if (['noAutoRetryGuard','noTimerGuard','manualOnlyGuard'].includes(key)) return 'timing_loop';
    return 'unknown';
  }

  function normalizeGuard(input){
    const now = new Date().toISOString();
    const guard = input || {};
    const key = guard.key || 'unknownGuard';
    const ok = guard.ok === true;
    const blocking = guard.blocking !== false;
    const severity = guard.severity || (ok ? 'ok' : (blocking ? 'blocked' : 'warning'));
    return {
      key,
      label: guard.label || guardLabel(key),
      category: guard.category || guardCategory(key),
      ok,
      severity,
      blocking,
      reason: guard.reason || '',
      details: guard.details || {},
      source: guard.source || 'dashboard',
      checkedAt: guard.checkedAt || now
    };
  }

  function summarizeGuards(guards){
    const list = asList(guards).map(normalizeGuard);
    const summary = {
      total: list.length,
      ok: 0,
      info: 0,
      warning: 0,
      blocked: 0,
      error: 0,
      blockingFailed: 0,
      hasBlockingFailure: false,
      generatedAt: new Date().toISOString()
    };
    for (const guard of list) {
      if (guard.ok) summary.ok += 1;
      if (guard.severity === 'info') summary.info += 1;
      if (guard.severity === 'warning') summary.warning += 1;
      if (guard.severity === 'blocked') summary.blocked += 1;
      if (guard.severity === 'error') summary.error += 1;
      if (guard.blocking && !guard.ok) summary.blockingFailed += 1;
    }
    summary.hasBlockingFailure = summary.blockingFailed > 0;
    return summary;
  }

  function sortGuards(guards){
    const severityOrder = { error: 1, blocked: 2, warning: 3, info: 4, ok: 5 };
    return asList(guards).map(normalizeGuard).sort((a, b) => {
      const ab = a.blocking && !a.ok ? 0 : 1;
      const bb = b.blocking && !b.ok ? 0 : 1;
      if (ab !== bb) return ab - bb;
      const as = severityOrder[a.severity] || 9;
      const bs = severityOrder[b.severity] || 9;
      if (as !== bs) return as - bs;
      const ac = String(a.category || '').localeCompare(String(b.category || ''), 'de');
      if (ac !== 0) return ac;
      return String(a.label || a.key || '').localeCompare(String(b.label || b.key || ''), 'de');
    });
  }

  function guardRow(guard){
    const status = guard.ok ? 'OK' : 'Nicht OK';
    const blocking = guard.blocking ? 'blockierend' : 'informativ';
    const rowClass = guard.ok ? '' : (guard.blocking ? 'error' : 'warning');
    return `<div class="busdiag-table-row ${rowClass}"><span><strong>${esc(guard.label)}</strong><small>${esc(guard.key)}</small></span><span>${esc(guard.category)}</span><span>${badge(status, guard.ok ? 'ok' : guard.severity)}</span><span>${esc(blocking)}</span><span>${esc(guard.severity)}</span><span>${esc(guard.source)}</span><span>${esc(guard.reason || '-')}</span></div>`;
  }

  function buildManualDiagnosticsRefreshGuards(){
    const route = getRecoveryPreflightRoute();
    const routeSafety = route?.routeSafety || {};
    const routeSafetyOk = routeSafety.method === 'GET'
      && routeSafety.readOnly !== false
      && routeSafety.commandRoute === false
      && routeSafety.prepareRoute === false
      && routeSafety.executeRoute === false
      && routeSafety.recoveryExecution === false;
    const checkedAt = state.manualDiagnosticsRefreshLastAt || new Date().toISOString();
    return [
      { key: 'readOnlyGuard', ok: state.manualDiagnosticsRefreshReadOnly === true, blocking: true, source: 'manual_diagnostics_refresh', checkedAt },
      { key: 'noMutationGuard', ok: state.manualDiagnosticsRefreshProductiveTouch === false, blocking: true, source: 'manual_diagnostics_refresh', checkedAt },
      { key: 'routeSafetyGuard', ok: routeSafetyOk, blocking: true, source: 'manual_diagnostics_refresh', checkedAt },
      { key: 'noPrepareExecuteGuard', ok: true, blocking: true, source: 'manual_diagnostics_refresh', checkedAt },
      { key: 'dashboardOnlyGuard', ok: true, blocking: true, source: 'manual_diagnostics_refresh', checkedAt },
      { key: 'noAutoRetryGuard', ok: true, blocking: true, source: 'manual_diagnostics_refresh', checkedAt },
      { key: 'noTimerGuard', ok: true, blocking: true, source: 'manual_diagnostics_refresh', checkedAt },
      { key: 'manualOnlyGuard', ok: true, blocking: true, source: 'manual_diagnostics_refresh', checkedAt }
    ];
  }

  function buildManualStatusResyncGuardList(){
    const checkedAt = state.manualStatusResyncLastAt || new Date().toISOString();
    const guards = state.manualStatusResyncGuards || {};
    const keys = ['readOnlyGuard','noMutationGuard','routeSafetyGuard','noPrepareExecuteGuard','dashboardOnlyGuard'];
    const result = keys.map(key => ({ key, ok: guards[key] === true, blocking: true, source: 'manual_status_resync_request', checkedAt }));
    result.push({ key: 'noAutoRetryGuard', ok: true, blocking: true, source: 'manual_status_resync_request', checkedAt });
    result.push({ key: 'noTimerGuard', ok: true, blocking: true, source: 'manual_status_resync_request', checkedAt });
    result.push({ key: 'manualOnlyGuard', ok: true, blocking: true, source: 'manual_status_resync_request', checkedAt });
    return result;
  }

  function buildRecoveryGuardDisplay(){
    const guards = [];
    if (state.manualDiagnosticsRefreshLastResult) guards.push(...buildManualDiagnosticsRefreshGuards());
    if (state.manualStatusResyncLastResult) guards.push(...buildManualStatusResyncGuardList());
    const normalized = sortGuards(guards);
    const summary = summarizeGuards(normalized);
    if (!normalized.length) {
      return `<div class="busdiag-status-line">${badge('bereit', 'ok')}<span>Noch keine Guard-Daten geladen.</span></div><p class="busdiag-muted">Klicke zuerst auf „Preflight neu laden“ oder „Status neu synchronisieren“. Es wird nur lokaler Dashboard-State ausgewertet.</p>`;
    }
    return `<div class="busdiag-status-line">${badge(summary.hasBlockingFailure ? 'prüfen' : 'ok', summary.hasBlockingFailure ? 'warning' : 'ok')}<span>lokale Guard-Anzeige / keine Recovery</span></div><div class="busdiag-metrics">${metric('Guards', summary.total)}${metric('OK', summary.ok)}${metric('Warnings', summary.warning)}${metric('Blocked', summary.blocked)}${metric('Errors', summary.error)}${metric('Blocking Failed', summary.blockingFailed)}</div><div class="busdiag-table busdiag-table-events"><div class="busdiag-table-head"><span>Guard</span><span>Kategorie</span><span>Status</span><span>Blocking</span><span>Severity</span><span>Quelle</span><span>Grund</span></div>${normalized.map(guardRow).join('')}</div>`;
  }

  async function manualStatusResyncRequest(){
    if (state.loading || state.manualStatusResyncLoading) return;
    state.manualStatusResyncLoading = true;
    state.manualStatusResyncError = '';
    state.manualStatusResyncLastResult = 'running';
    state.manualStatusResyncStartedAt = new Date().toISOString();
    state.manualStatusResyncReadOnly = true;
    state.manualStatusResyncProductiveTouch = false;
    state.manualStatusResyncCanPrepare = false;
    state.manualStatusResyncCanExecute = false;
    state.manualStatusResyncSources = ['GET /api/bus-diagnostics/status', 'GET /api/bus-diagnostics/recovery-preflight'];
    state.manualStatusResyncGuards = {
      readOnlyGuard: true,
      noMutationGuard: true,
      routeSafetyGuard: true,
      noPrepareExecuteGuard: true,
      dashboardOnlyGuard: true
    };
    renderCurrentTab();
    await loadAll(false);
    const route = getRecoveryPreflightRoute();
    const preflight = getEffectiveRecoveryPreflight();
    const guards = buildManualStatusResyncGuards(route, preflight);
    const guardsOk = Object.values(guards).every(Boolean);
    const routeOk = route && route.fetchOk !== false && route.readOnly === true;
    state.manualStatusResyncGuards = guards;
    state.manualStatusResyncLastAt = new Date().toISOString();
    state.manualStatusResyncReadOnly = guards.readOnlyGuard === true;
    state.manualStatusResyncProductiveTouch = false;
    state.manualStatusResyncCanPrepare = preflight?.canPrepare === true;
    state.manualStatusResyncCanExecute = preflight?.canExecute === true;
    if (state.lastError || !routeOk || !guardsOk) {
      state.manualStatusResyncLastResult = 'error';
      state.manualStatusResyncError = state.lastError || route?.error || 'Status-Resync konnte nicht sauber read-only bewertet werden.';
    } else {
      state.manualStatusResyncLastResult = 'ok';
      state.manualStatusResyncError = '';
    }
    state.manualStatusResyncLoading = false;
    renderCurrentTab();
    updateLiveStatus();
  }

  async function loadAll(check){
    if (state.loading) return;
    state.loading = true;
    state.lastError = '';
    setBusy(true);
    try {
      const data = await window.CGN.api(check ? '/api/bus-diagnostics/check' : '/api/bus-diagnostics/status');
      const preflightRoute = await loadRecoveryPreflightRoute();
      data.recoveryPreflightRoute = preflightRoute;
      if (preflightRoute && preflightRoute.recoveryPreflight) data.recoveryPreflight = preflightRoute.recoveryPreflight;
      if (preflightRoute && preflightRoute.summary) {
        data.summary = Object.assign({}, data.summary || {}, preflightRoute.summary, {
          recoveryPreflightRouteVersion: preflightRoute.routeVersion || '-',
          recoveryPreflightRouteReadOnly: preflightRoute.readOnly === true,
          recoveryPreflightRouteFetchOk: preflightRoute.fetchOk !== false
        });
      }
      data.busIntegrationMatrix = await loadBusIntegrationMatrix();
      state.lastData = data;
      await loadSettings(true);
      renderCurrentTab();
      scheduleNextRefresh();
    } catch (err) {
      state.lastError = err.message || String(err);
      renderError(state.lastError);
      scheduleNextRefresh();
    } finally {
      state.loading = false;
      setBusy(false);
      updateLiveStatus();
    }
  }

  function setBusy(busy){
    const root = panel();
    if (!root) return;
    root.querySelectorAll('[data-busdiag-action="refresh"],[data-busdiag-action="check"],[data-busdiag-action="manual-diagnostics-refresh"],[data-busdiag-action="manual-status-resync"]').forEach(btn => { btn.disabled = !!busy || state.manualDiagnosticsRefreshLoading || state.manualStatusResyncLoading; });
    root.classList.toggle('is-loading', !!busy);
    updateLiveStatus();
  }

  function toggleAutoRefresh(){
    state.autoRefresh = !state.autoRefresh;
    localStorage.setItem('cgn-busdiag-auto-refresh', state.autoRefresh ? '1' : '0');
    restartAutoTimer();
    updateLiveStatus();
    if (state.autoRefresh) loadAll(false);
  }

  function restartAutoTimer(){
    if (state.autoTimer) clearTimeout(state.autoTimer);
    state.autoTimer = null;
    if (state.countdownTimer) clearInterval(state.countdownTimer);
    state.countdownTimer = null;
    if (!state.autoRefresh) { state.nextRefreshAt = 0; updateLiveStatus(); return; }
    state.countdownTimer = setInterval(updateLiveStatus, 1000);
    scheduleNextRefresh();
  }

  function scheduleNextRefresh(){
    if (state.autoTimer) clearTimeout(state.autoTimer);
    state.autoTimer = null;
    if (!state.autoRefresh || !state.visible) { state.nextRefreshAt = 0; updateLiveStatus(); return; }
    state.nextRefreshAt = Date.now() + state.refreshEveryMs;
    state.autoTimer = setTimeout(() => loadAll(false), state.refreshEveryMs);
    updateLiveStatus();
  }

  function renderError(message){
    const content = panel()?.querySelector('[data-busdiag-content]');
    if (!content) return;
    content.innerHTML = `<div class="busdiag-error glass"><strong>Fehler beim Laden</strong><p>${esc(message)}</p></div>`;
  }

  function renderCurrentTab(){
    const content = panel()?.querySelector('[data-busdiag-content]');
    if (!content) return;
    if (!state.lastData) { content.innerHTML = '<div class="busdiag-empty glass">Noch keine Daten geladen.</div>'; return; }
    const renderers = { overview: renderOverview, clients: renderClientsTab, events: renderEventsTab, integrations: renderIntegrationsTab, busmatrix: renderBusMatrixTab, recovery: renderRecoveryTab, issues: renderIssuesTab, config: renderConfigTab, raw: renderRawTab };
    content.innerHTML = (renderers[state.activeTab] || renderOverview)();
    bindConfigActions();
    bindRecoveryActions();
  }

  function renderOverlayOverviewCard(overlays){
    const counts = countByStatus(overlays);
    const problemCount = counts.stale + counts.offline + counts.dead;
    const status = overlays.length === 0 ? 'warning' : (problemCount > 0 ? 'warning' : 'ok');
    const note = overlays.length === 0 ? 'keine Overlay-Clients registriert' : `${counts.online} online / ${problemCount} auffällig`;
    return card('Overlay-Clients', `<div class="busdiag-status-line">${badge(status === 'ok' ? 'ok' : 'prüfen', status)}<span>${esc(note)}</span></div><div class="busdiag-metrics">${metric('Gesamt', overlays.length)}${metric('Online', counts.online)}${metric('Stale/Offline/Dead', problemCount)}${metric('Letzter Heartbeat', fmtTime(newestClientTime(overlays, ['lastHeartbeatAt','lastSeenAt'])))}</div>`, 'busdiag-overlay-card');
  }

  function renderOverview(){
    const data = getStatus();
    const summary = getSummary();
    const communication = getCommunication();
    const bus = getBusStatus().bus || {};
    const stats = getBusStatus().stats || {};
    const split = splitClients();
    const events = getEvents();
    const issues = getIssues();
    return `
      <div class="busdiag-grid busdiag-grid-top">
        ${card('Gesamtstatus', `<div class="busdiag-status-line">${badge(summary.status || (data.ok ? 'ok' : 'error'), summary.status || (data.ok ? 'ok' : 'error'))}<span>${esc(value(data.fetchedAt))}</span></div><div class="busdiag-metrics">${metric('Clients online', `${num(summary.connectedClients)} / ${num(summary.totalClients)}`)}${metric('Events', events.length)}${metric('Issues', issues.length)}${metric('Read-only', bool(data.readOnly))}</div>`)}
        ${card('Communication Bus', `<div class="busdiag-status-line">${badge(communication.ok ? 'ok' : 'error', communication.ok ? 'ok' : 'error')}<span>${esc(value(communication.module))} ${esc(value(communication.version))}</span></div><div class="busdiag-metrics">${metric('Bus', bus.name || 'cgn', bus.version ? `v${bus.version}` : '')}${metric('Emitted', stats.emitted ?? '-')}${metric('Delivered', stats.delivered ?? '-')}${metric('ACKs', stats.acks ?? '-')}</div>`)}
      </div>
      <div class="busdiag-grid">
        ${renderOverlayOverviewCard(split.overlays)}
        ${card('Client-Kategorien', `<div class="busdiag-metrics">${metric('Backend-Module', split.modules.length)}${metric('Overlays', split.overlays.length)}${metric('Tools/Debug', split.tools.length)}${metric('Unbekannt', split.unknown.length)}</div>`)}
        ${card('Event-Speicher', `<div class="busdiag-metrics">${metric('Replay Events', events.filter(e => e.replayable).length)}${metric('ACK Pflicht', events.filter(e => e.requireAck).length)}${metric('Abgelaufen', events.filter(e => e.expired).length)}${metric('Nicht geliefert', events.filter(e => !asList(e.deliveredTo).length).length)}</div>`)}
        ${card('Schutz', `<div class="busdiag-metrics">${metric('Flow touched', bool(data.flowTouched))}${metric('Queue touched', bool(data.queueTouched))}${metric('Sound touched', bool(data.soundSystemTouched))}${metric('Overlay touched', bool(data.overlayTouched))}</div>`)}
        ${card('Config', `<div class="busdiag-metrics">${metric('Speicher', state.lastSettings?.storage || 'nicht geladen')}${metric('Adapter', state.lastSettings?.adapter || '-')}${metric('Settings', asList(state.lastSettings?.settings).length)}${metric('Runtime sofort', bool(state.lastSettings?.runtimeAppliedImmediately))}</div>`)}
      </div>
    `;
  }

  function renderClientTable(title, clients, emptyText, options = {}){
    const sorted = sortClientsForDisplay(clients);
    const tableClass = options.overlay === true ? 'busdiag-table-clients busdiag-table-overlays' : 'busdiag-table-clients';
    const header = options.overlay === true
      ? '<span>Overlay-ID</span><span>Status</span><span>Modul/Version</span><span>Heartbeat</span><span>Kontakt/Grund</span><span>Capabilities</span>'
      : '<span>ID</span><span>Name/Modul</span><span>Status</span><span>Letzter Kontakt</span><span>Capabilities</span>';
    const rows = sorted.map(client => {
      const status = client.status || (client.connected ? 'online' : 'offline');
      if (options.overlay === true) {
        return `<div class="busdiag-table-row"><span><strong>${esc(client.id || '-')}</strong><small>${esc(client.name || '-')}</small></span><span>${badge(status, status)}<small>${client.connected ? 'verbunden' : 'getrennt'}</small></span><span><strong>${esc(client.module || '-')}</strong><small>${esc(client.version || '-')}</small></span><span><strong>${esc(fmtTime(client.lastHeartbeatAt))}</strong><small>Heartbeat</small></span><span><strong>${esc(fmtTime(client.lastSeenAt || client.connectedAt || client.registeredAt))}</strong><small>${esc(client.disconnectReason || client.mode || '')}</small></span><span class="busdiag-cap-list">${renderCapabilityChips(client.capabilities || [])}</span></div>`;
      }
      return `<div class="busdiag-table-row"><span><strong>${esc(client.id)}</strong><small>${esc(client.type || '-')} / ${esc(client.mode || '-')}</small></span><span><strong>${esc(client.name || '-')}</strong><small>${esc(client.module || '-')} ${client.version ? '· ' + esc(client.version) : ''}</small></span><span>${badge(status, status)}<small>${client.connected ? 'verbunden' : 'getrennt'}</small></span><span><strong>${esc(fmtTime(client.lastHeartbeatAt || client.lastSeenAt))}</strong><small>${esc(client.disconnectReason || '')}</small></span><span class="busdiag-cap-list">${renderCapabilityChips(client.capabilities || [])}</span></div>`;
    }).join('');
    return card(title, sorted.length ? `<div class="busdiag-table ${tableClass}"><div class="busdiag-table-head">${header}</div>${rows}</div>` : `<p class="busdiag-muted">${esc(emptyText || 'Keine Clients in dieser Kategorie.')}</p>`, options.extraClass || 'busdiag-wide');
  }

  function renderOverlaySummary(overlays){
    const counts = countByStatus(overlays);
    const problemCount = counts.stale + counts.offline + counts.dead;
    return card('Overlay-Verbindungen', `<div class="busdiag-overlay-summary"><div>${metric('Overlays gesamt', overlays.length)}${metric('Online', counts.online)}${metric('Stale', counts.stale)}${metric('Offline', counts.offline)}${metric('Dead', counts.dead)}${metric('Ignored/Sonstige', counts.ignored + counts.other)}</div><p class="busdiag-muted">Quelle: Communication-Bus Client-Registry. Ein Overlay gilt hier nur als echter Overlay-Client, wenn <code>type=overlay</code>, <code>id=overlay:*</code> oder <code>mode=overlay</code>. Backend-Module mit Overlay im Namen werden nicht als Overlay gezählt.</p></div>`, 'busdiag-wide busdiag-overlay-summary-card');
  }

  function renderClientsTab(){
    const split = splitClients();
    return `${renderOverlaySummary(split.overlays)}${renderClientTable('Overlay-Clients', split.overlays, 'Keine Overlay-Clients registriert.', { overlay: true, extraClass: 'busdiag-wide busdiag-overlay-table-card' })}${renderClientTable('Backend-Module', split.modules, 'Keine Backend-Module registriert.')}${renderClientTable('Tools / Debug / Dashboard', split.tools, 'Keine Tool- oder Debug-Clients registriert.')}${renderClientTable('Unbekannte Clients', split.unknown, 'Keine unbekannten Clients.')}`;
  }

  function renderEventsTab(){
    const events = getEvents().slice(0, 40);
    return card('Events & ACKs', events.length ? `<div class="busdiag-table busdiag-table-events"><div class="busdiag-table-head"><span>Zeit</span><span>Channel/Action</span><span>Ziel</span><span>ACK</span><span>Delivery</span></div>${events.map(event => `<div class="busdiag-table-row"><span>${esc(fmtTime(event.createdAt))}<small>${esc(event.id || '-')}</small></span><span><strong>${esc(event.channel || '-')}</strong><small>${esc(event.action || '-')}</small></span><span><strong>${esc(event.target?.type || '-')}</strong><small>${esc(event.target?.id || event.target?.module || '')}</small></span><span>${badge(event.requireAck ? 'ACK Pflicht' : 'kein ACK', event.requireAck && !event.ackCount ? 'warning' : 'ok')}<small>${esc(event.ackCount ?? 0)} ACKs</small></span><span><strong>${esc(asList(event.deliveredTo).length)}</strong><small>${event.expired ? 'expired' : esc(event.expiresAt || '')}</small></span></div>`).join('')}</div>` : '<p class="busdiag-muted">Keine Events im Bus-Speicher.</p>', 'busdiag-wide');
  }

  async function runSoundBusDryRun(){
    if (state.soundDryRunRunning) return;
    state.soundDryRunRunning = true;
    state.soundDryRunError = '';
    render();
    try {
      const requestId = `dash_dry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const payload = {
        command: 'sound.play.request',
        requestId,
        soundId: 'dashboard_dry_run',
        label: 'Dashboard Dry-Run',
        category: 'system',
        target: 'stream',
        outputTarget: 'overlay',
        requestedBy: 'dashboard',
        source: 'bus_diagnostics_dashboard',
        reason: 'manual_dashboard_dry_run',
        meta: {
          can23: 'CAN-23.6',
          dryRunOnly: true,
          queueTouchedExpected: false,
          audioTouchedExpected: false
        }
      };
      const result = await window.CGN.api('/api/sound/eventbus/command/dry-run', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      state.soundDryRunResult = result;
      state.soundDryRunError = '';
      await loadBusIntegrationMatrix();
    } catch (err) {
      state.soundDryRunError = err.message || String(err);
      state.soundDryRunResult = {
        ok: false,
        error: state.soundDryRunError,
        dryRunOnly: true,
        queueTouched: false,
        audioTouched: false
      };
    } finally {
      state.soundDryRunRunning = false;
      render();
    }
  }

  function renderSoundDryRunCard(matrix){
    const soundRow = asList(matrix && matrix.rows).find(row => row && row.id === 'sound_system') || {};
    const result = state.soundDryRunResult || {};
    const resultResult = result.result || {};
    const protection = result.protection || {};
    const commandOk = soundRow.commandOk === true;
    const contractOk = soundRow.contractOk === true;
    const lifecycleOk = soundRow.lifecycleOk === true;
    const canRun = commandOk || !!soundRow.commandRoute;
    const resultHtml = state.soundDryRunResult ? `
      <div class="busdiag-metrics">
        ${metric('Dry-Run OK', bool(result.ok))}
        ${metric('Accepted', bool(result.accepted))}
        ${metric('Queue touched', bool(result.queueTouched || protection.queueTouched || resultResult.queueTouched))}
        ${metric('Audio touched', bool(result.audioTouched || protection.audioTouched || resultResult.audioTouched))}
      </div>
      <details class="busdiag-details" open>
        <summary>Dry-Run Ergebnis</summary>
        <pre>${esc(compactJson(result))}</pre>
      </details>
    ` : `<p class="busdiag-muted">Noch kein Dry-Run ausgeführt. Der Test validiert nur einen Command-Payload und darf keine Queue und kein Audio anfassen.</p>`;

    return card('Sound-Bus Dry-Run', `
      <div class="busdiag-status-line">
        ${badge(state.soundDryRunRunning ? 'läuft' : (canRun ? 'bereit' : 'nicht bereit'), state.soundDryRunRunning ? 'warning' : (canRun ? 'ok' : 'warning'))}
        <span>POST /api/sound/eventbus/command/dry-run</span>
      </div>
      <div class="busdiag-metrics">
        ${metric('Command', bool(commandOk))}
        ${metric('Contract', bool(contractOk))}
        ${metric('Lifecycle', bool(lifecycleOk))}
        ${metric('Play-kompatibel', bool(soundRow.compatibilityOk))}
        ${metric('Queue', `${soundRow.queueBusy ? 'busy' : 'idle'} · ${soundRow.queuedCount || 0}`)}
        ${metric('Queue/Audio', 'nein')}
      </div>
      <div class="busdiag-actions-row">
        <button class="busdiag-btn busdiag-btn-primary" data-busdiag-action="sound-dry-run" ${state.soundDryRunRunning || !canRun ? 'disabled' : ''}>Dry-Run testen</button>
        <span class="busdiag-muted">Nur Diagnose: kein Play-Test, kein Sound, keine Queue.</span>
      </div>
      ${state.soundDryRunError ? `<div class="busdiag-alert warn">${esc(state.soundDryRunError)}</div>` : ''}
      ${resultHtml}
    `, 'busdiag-wide');
  }

  function renderSoundMigrationCandidateCard(matrix){
    const channelpointsRow = asList(matrix && matrix.rows).find(row => row && row.id === 'channelpoints') || {};
    const payload = channelpointsRow.channelpointsFirstCandidatePayload || {};
    const result = channelpointsRow.channelpointsSoundDryRunResult || {};
    const soundDryRun = result.soundDryRun || {};
    const soundResult = soundDryRun.result || {};
    const hasCandidateRoute = !!channelpointsRow.channelpointsSoundCandidatesRoute;
    const hasDryRunRoute = !!channelpointsRow.channelpointsSoundDryRunRoute;

    return card('CAN24 Sound-Migration Kandidat', `
      <div class="busdiag-status-line">
        ${badge(channelpointsRow.channelpointsSoundDryRunOk === true ? 'dry-run ok' : (hasCandidateRoute ? 'bereit' : 'nicht bereit'), channelpointsRow.channelpointsSoundDryRunOk === false ? 'warning' : 'ok')}
        <span>${esc(channelpointsRow.channelpointsFirstCandidateTitle || channelpointsRow.channelpointsFirstCandidateRewardKey || 'kein Kandidat')}</span>
      </div>
      <div class="busdiag-metrics">
        ${metric('Kandidaten', `${channelpointsRow.channelpointsMigrationCandidateReady || 0}/${channelpointsRow.channelpointsMigrationCandidateTotal || 0}`)}
        ${metric('Reward-Key', channelpointsRow.channelpointsFirstCandidateRewardKey || '-')}
        ${metric('Dry-Run accepted', channelpointsRow.channelpointsSoundDryRunOk === null ? '-' : bool(channelpointsRow.channelpointsSoundDryRunAccepted))}
        ${metric('Queue touched', bool(result.queueTouched || soundResult.queueTouched))}
        ${metric('Audio/Sound touched', bool(result.soundSystemTouched || soundDryRun.soundSystemTouched || soundResult.audioTouched))}
      </div>
      <p class="busdiag-muted">Diese Karte zeigt nur Kandidat, Payload und Dry-Run-Diagnose. Kein Sound-Play, keine Reward-Ausführung, keine Redemption-/Twitch-Aktion.</p>
      <div class="busdiag-metrics">
        ${metric('Candidates Route', hasCandidateRoute ? 'ok' : '-')}
        ${metric('Dry-Run Route', hasDryRunRoute ? 'ok' : '-')}
        ${metric('Shadow', channelpointsRow.channelpointsSoundShadowEnabled ? 'aktiv' : 'bereit')}
        ${metric('Shadow-Key', channelpointsRow.channelpointsSoundShadowSelectedRewardKey || '-')}
        ${metric('Shadow safe', bool(channelpointsRow.channelpointsSoundShadowSafe))}
        ${metric('Auto prepared', channelpointsRow.channelpointsSoundShadowAutoRewardKey || '-')}
        ${metric('Hook installed', bool(channelpointsRow.channelpointsSoundShadowAutoHookInstalled))}
        ${metric('StatusCode', result.statusCode || '-')}
        ${metric('Fehler', result.error || (soundDryRun.error || '-'))}
      </div>
      <details class="busdiag-details">
        <summary>Vorgeschlagener sound.play.request Payload</summary>
        <pre>${esc(compactJson(payload))}</pre>
      </details>
      <div class="busdiag-metrics">
        ${metric('Shadow Queue', bool(channelpointsRow.channelpointsSoundShadowQueueTouched))}
        ${metric('Shadow Sound', bool(channelpointsRow.channelpointsSoundShadowSoundTouched))}
        ${metric('Reward executed', bool(channelpointsRow.channelpointsSoundShadowRewardExecuted))}
        ${metric('Redemption changed', bool(channelpointsRow.channelpointsSoundShadowRedemptionChanged))}
        ${metric('Twitch touched', bool(channelpointsRow.channelpointsSoundShadowTwitchTouched))}
      </div>
      <details class="busdiag-details">
        <summary>Shadow-DryRun Bewertung</summary>
        <pre>${esc(compactJson(channelpointsRow.channelpointsSoundShadowEvaluation || {}))}</pre>
      </details>
      <details class="busdiag-details">
        <summary>Dry-Run Ergebnis</summary>
        <pre>${esc(compactJson(result))}</pre>
      </details>
    `, 'busdiag-wide');
  }

  function renderBusMatrixTab(){
    const matrix = state.busMatrix || getStatus().busIntegrationMatrix || {};
    const summary = matrix.summary || {};
    const rows = asList(matrix.rows);
    const hasRoute = matrix.fetchOk !== false && (matrix.ok === true || rows.length > 0 || matrix.generatedAt);
    const headlineStatus = hasRoute ? (summary.errors > 0 ? 'warning' : 'ok') : 'warning';
    const headlineText = hasRoute ? 'read-only aktiv' : 'Route noch nicht verfügbar';
    const todo = asList(matrix.todoNextSteps);

    const setupHint = hasRoute ? '' : card('Einrichtung fehlt noch', `<p class="busdiag-muted">Die Route <code>/api/bus-integration-matrix/status</code> ist noch nicht erreichbar. Spiele CAN-23.0/CAN-23.2 vollständig ein und starte Node neu.</p><div class="busdiag-metrics">${metric('Read-only', bool(matrix.readOnly !== false))}${metric('Fehler', matrix.error || state.busMatrixError || '-')}</div>`, 'busdiag-wide');

    const rowsHtml = rows.length ? rows.map(row => {
      const risk = row.risk || (row.statusOk === false ? 'warning' : 'ok');
      const commandLabel = row.commandStatus || (row.commandCapable ? 'partial' : 'status_only');
      return `<div class="busdiag-table-row">
        <span><strong>${esc(row.label || row.id || '-')}</strong><small>${esc(row.id || '-')} · ${esc(row.category || '-')}</small></span>
        <span>${badge(row.registeredOnBus ? 'ja' : 'nein', row.registeredOnBus ? 'ok' : 'warning')}<small>${esc(row.primaryClientId || row.clientIds?.join(', ') || '-')}</small></span>
        <span>${badge(row.heartbeat ? 'ja' : 'nein', row.heartbeat ? 'ok' : 'warning')}<small>${esc(row.primaryClientStatus || '-')}</small></span>
        <span>${badge(row.statusOk === null ? '-' : (row.statusOk ? 'ok' : 'fehlt'), row.statusOk === false ? 'warning' : 'ok')}<small>${esc(row.statusRoute || '-')}</small></span>
        <span>${badge(row.eventBusOk === null ? '-' : (row.eventBusOk ? 'ok' : 'fehlt'), row.eventBusOk === false ? 'warning' : 'ok')}<small>${esc(row.eventBusRoute || '-')}</small></span>
        <span>${badge(commandLabel, row.commandCapable ? 'ok' : 'neutral')}<small>ACK: ${esc(bool(row.ackCapable))} · Legacy: ${esc(bool(row.legacyDirect))}</small><small>Command: ${esc(row.commandOk === null ? '-' : bool(row.commandOk))}</small><small>${esc(row.commandRoute || '-')}</small><small>Contract: ${esc(row.contractOk === null ? '-' : bool(row.contractOk))}</small><small>${esc(row.contractRoute || '-')}</small><small>Lifecycle: ${esc(row.lifecycleOk === null ? '-' : bool(row.lifecycleOk))}</small><small>${esc(row.lifecycleRoute || '-')}</small><small>Play-Kompatibel: ${esc(row.compatibilityOk === null ? '-' : bool(row.compatibilityOk))}</small><small>${esc(row.compatibilityRoute || '-')}</small><small>Queue: ${esc(row.queueStatusOk === null ? '-' : bool(row.queueStatusOk))} · ${esc(row.queueBusy ? 'busy' : 'idle')} · ${esc(String(row.queuedCount || 0))}/${esc(String(row.queueMaxLength || '-'))}</small><small>${esc(row.queueStatusRoute || '-')}</small><small>Catalog: ${esc(row.catalogStatusOk === null ? '-' : bool(row.catalogStatusOk))} · presets ${esc(String(row.catalogSoundPresetCount || 0))} · soundId1423 ${esc(bool(row.catalogRequestedSoundPresetFound))} · media1423 ${esc(bool(row.catalogRequestedMediaAssetFound))}</small><small>${esc(row.catalogStatusRoute || '-')} ${esc(row.catalogLikelyIssue || '')}</small><small>Alert-ACK: ${esc(row.ackStatusOk === null ? '-' : bool(row.ackStatusOk))} · Overlay ${esc(String(row.overlayAckCount || 0))} · Missing ${esc(String(row.overlayMissingAckCount || 0))} · Sound ${esc(String(row.soundMatchedCount || 0))}</small><small>${esc(row.ackStatusRoute || '-')}</small><small>Alert-Contract: ${esc(row.alertContractOk === null ? '-' : bool(row.alertContractOk))} · ${esc(row.alertContractName || '-')}</small><small>${esc(row.alertContractRoute || '-')}</small><small>Alert-Dry-Run: ${esc(row.alertDryRunOk === null ? '-' : bool(row.alertDryRunOk))} · accepted ${esc(bool(row.alertDryRunAccepted))}</small><small>${esc(row.alertDryRunRoute || '-')}</small><small>VIP-Overlay: ${esc(row.vipOverlayOk === null ? '-' : bool(row.vipOverlayOk))} · ${esc(row.vipOverlayVisible ? 'visible' : 'hidden')} · client ${esc(bool(row.vipClientConnected))} · queue ${esc(String(row.vipQueueLength || 0))}</small><small>${esc(row.vipOverlayRoute || '-')}</small><small>Overlay-Clients: ${esc(row.overlayClientControlOk === null ? '-' : bool(row.overlayClientControlOk))} · ${esc(String(row.overlayClientOnline || 0))}/${esc(String(row.overlayClientTotal || 0))} online · warn ${esc(String(row.overlayClientWarning || 0))} · err ${esc(String(row.overlayClientError || 0))}</small><small>${esc(row.overlayClientControlRoute || '-')}</small><small>Channelpoints: ${esc(row.channelpointsReadinessOk === null ? '-' : bool(row.channelpointsReadinessOk))} · rewards ${esc(String(row.channelpointsRewardTotal || 0))} · sound ${esc(String(row.channelpointsSoundCandidates || 0))} · alert ${esc(String(row.channelpointsAlertCandidates || 0))}</small><small>${esc(row.channelpointsReadinessRoute || '-')}</small><small>Overlay-Klasse: ${esc(row.overlayClientClassificationOk === null ? '-' : bool(row.overlayClientClassificationOk))} · produktiv ${esc(String(row.overlayProductiveCandidates || 0))} · test/alt ${esc(String(row.overlayTestOrLegacy || 0))} · unbekannt ${esc(String(row.overlayUnknown || 0))}</small><small>${esc(row.overlayClientClassificationRoute || '-')}</small><small>Overlay-ID: ${esc(row.overlayClientIdentityOk === null ? '-' : bool(row.overlayClientIdentityOk))} · format ${esc(row.overlayIdentityContractFormat || '-')} · dup ${esc(String(row.overlayIdentityDuplicates || 0))} · caps ${esc(String(row.overlayCapabilityKinds || 0))}</small><small>${esc(row.overlayClientIdentityRoute || '-')}</small><small>Legacy/direct: ${esc(String((row.legacyDirectSummary && row.legacyDirectSummary.total) || 0))} · produktiv ${esc(String((row.legacyDirectSummary && row.legacyDirectSummary.productive) || 0))} · high ${esc(String((row.legacyDirectSummary && row.legacyDirectSummary.highRisk) || 0))}</small><small>${esc((row.legacyDirectPaths || []).map(item => item.path).join(' | ') || '-')}</small><small>CAN24 Sound-Kandidat: ${esc(row.channelpointsSoundCandidatesOk === null ? '-' : bool(row.channelpointsSoundCandidatesOk))} · ready ${esc(String(row.channelpointsMigrationCandidateReady || 0))}/${esc(String(row.channelpointsMigrationCandidateTotal || 0))} · ${esc(row.channelpointsFirstCandidateRewardKey || '-')}</small><small>${esc(row.channelpointsSoundCandidatesRoute || '-')}</small><small>CAN24 Dry-Run: ${esc(row.channelpointsSoundDryRunOk === null ? '-' : bool(row.channelpointsSoundDryRunOk))} · accepted ${esc(bool(row.channelpointsSoundDryRunAccepted))} · ${esc(row.channelpointsSoundDryRunCandidate || '-')}</small><small>${esc(row.channelpointsSoundDryRunRoute || '-')}</small><small>CAN24 Shadow: ${esc(row.channelpointsSoundShadowOk === null ? '-' : bool(row.channelpointsSoundShadowOk))} · ${esc(row.channelpointsSoundShadowEnabled ? 'aktiv' : 'bereit')} · ${esc(row.channelpointsSoundShadowSelectedRewardKey || '-')}</small><small>${esc(row.channelpointsSoundShadowRoute || '-')}</small><small>CAN24 Shadow-Safety: safe ${esc(bool(row.channelpointsSoundShadowSafe))} · q ${esc(bool(row.channelpointsSoundShadowQueueTouched))} · sound ${esc(bool(row.channelpointsSoundShadowSoundTouched))} · reward ${esc(bool(row.channelpointsSoundShadowRewardExecuted))} · twitch ${esc(bool(row.channelpointsSoundShadowTwitchTouched))}</small><small>${esc(row.channelpointsSoundShadowEvaluationRoute || '-')}</small><small>CAN24 Auto-Prep: ${esc(row.channelpointsSoundShadowAutoOk === null ? '-' : bool(row.channelpointsSoundShadowAutoOk))} · enabled ${esc(bool(row.channelpointsSoundShadowAutoEnabled))} · key ${esc(row.channelpointsSoundShadowAutoRewardKey || '-')} · hook ${esc(bool(row.channelpointsSoundShadowAutoHookInstalled))}</small><small>${esc(row.channelpointsSoundShadowAutoRoute || '-')}</small><small>CAN24 Shadow-Hook: attempts ${esc(String(row.channelpointsSoundShadowAutoAttempts || 0))} · ok ${esc(String(row.channelpointsSoundShadowAutoOkCount || 0))} · fail ${esc(String(row.channelpointsSoundShadowAutoFailedCount || 0))} · lastAccepted ${esc(bool(row.channelpointsSoundShadowAutoLastAccepted))}</small><small>${esc(row.channelpointsSoundShadowAutoLastSkipReason || '-')}</small></span>
        <span>${badge(risk, risk)}<small>${esc(row.nextStep || '-')}</small></span>
      </div>`;
    }).join('') : `<div class="busdiag-empty glass">Noch keine Matrixdaten geladen.</div>`;

    const todoHtml = todo.length ? card('Nächste praktische Schritte', `<div class="busdiag-note-list">${todo.map(item => `<div class="busdiag-note-item">${esc(item)}</div>`).join('')}</div>`, 'busdiag-wide') : '';

    return `
      <div class="busdiag-grid busdiag-grid-top">
        ${card('Bus-Integration-Matrix', `<div class="busdiag-status-line">${badge(headlineText, headlineStatus)}<span>${esc(matrix.generatedAt || '-')}</span></div><div class="busdiag-metrics">${metric('Systeme', summary.total ?? rows.length)}${metric('Registriert', summary.registeredOnBus ?? '-')}${metric('Verbunden', summary.connectedOnBus ?? '-')}${metric('Heartbeat', summary.heartbeat ?? '-')}${metric('Legacy/direct', summary.legacyDirect ?? '-')}</div>`)}
        ${card('Sicherheitsgrenze', `<div class="busdiag-status-line">${badge('read-only', 'ok')}<span>keine Aktion wird ausgeführt</span></div><div class="busdiag-metrics">${metric('Queue touch', bool(matrix.queueTouched))}${metric('Sound touch', bool(matrix.soundSystemTouched))}${metric('Alert touch', bool(matrix.alertSystemTouched))}${metric('Overlay touch', bool(matrix.overlayTouched))}</div>`)}
      </div>
      ${setupHint}
      ${renderSoundDryRunCard(matrix)}
      ${renderSoundMigrationCandidateCard(matrix)}
      ${card('Systeme', `<div class="busdiag-table busdiag-table-busmatrix"><div class="busdiag-table-head"><span>System</span><span>Bus-Client</span><span>Heartbeat</span><span>Status</span><span>EventBus</span><span>Command/ACK</span><span>Risiko / nächster Schritt</span></div>${rowsHtml}</div>`, 'busdiag-wide')}
      ${todoHtml}
      ${card('Rohdaten Matrix', `<details class="busdiag-details"><summary>Matrix anzeigen</summary><pre>${esc(compactJson(matrix))}</pre></details>`, 'busdiag-wide')}
    `;
  }

  function renderIntegrationsTab(){
    const summary = getSummary();
    const sound = getStatus().soundEventBus || {};
    const alert = getStatus().alertEventBus || {};
    const vip = getStatus().vipStatus || {};
    const vipIntegration = getStatus().vipIntegration || {};
    const correlation = getStatus().alertSoundCorrelation || {};
    const comparison = correlation.comparison || {};
    return `<div class="busdiag-grid">${card('Sound EventBus', `<div class="busdiag-status-line">${badge(sound.ok ? 'ok' : 'error', sound.ok ? 'ok' : 'error')}<span>${esc(value(sound.module))} ${esc(value(sound.version))}</span></div><div class="busdiag-metrics">${metric('Capability', sound.capability || '-', '', 'busdiag-metric-code busdiag-metric-wide')}${metric('Emitted', summary.soundEmitted)}${metric('Errors', summary.soundErrors)}${metric('Last action', summary.soundLastAction || '-')}</div>`)}${card('Alert EventBus', `<div class="busdiag-status-line">${badge(alert.ok ? 'ok' : 'error', alert.ok ? 'ok' : 'error')}<span>${esc(value(alert.module))} ${esc(value(alert.version))}</span></div><div class="busdiag-metrics">${metric('Capability', alert.capability || '-', '', 'busdiag-metric-code busdiag-metric-wide')}${metric('Emitted', summary.alertEmitted)}${metric('Errors', summary.alertErrors)}${metric('Last action', summary.alertLastAction || '-')}</div>`)}${card('VIP-System', `<div class="busdiag-status-line">${badge(vip.ok ? 'ok' : 'warning', vip.ok ? 'ok' : 'warning')}<span>${esc(value(vip.module || 'vip_sound_overlay'))} ${esc(value(summary.vipVersion || vip.version))}</span></div><div class="busdiag-metrics">${metric('Overlay Client', bool(summary.vipOverlayConnected), summary.vipOverlayConnected ? 'Bus verbunden' : 'nicht verbunden')}${metric('Status API', vip.fetchOk ? 'ok' : 'fehler')}${metric('Phase', summary.vipPhase || vip.phase || '-')}${metric('Queue', summary.vipQueuedCount ?? vip.queuedCount ?? 0)}</div>`)}${card('Alert/Sound-Korrelation', `<div class="busdiag-status-line">${badge(correlation.ok ? 'ok' : 'error', correlation.ok ? 'ok' : 'error')}<span>${esc(value(correlation.feature))}</span></div><div class="busdiag-metrics">${metric('Matched', summary.correlationMatched ?? comparison.matched)}${metric('Unmatched', summary.correlationUnmatched ?? comparison.unmatched)}${metric('Alert Rows', comparison.alertRows ?? '-')}${metric('Sound Rows', comparison.soundRows ?? '-')}</div>`)}</div>${renderRecent('Sound Events', sound.recentEvents || [])}${renderRecent('Alert Events', alert.recentEvents || [])}${renderCorrelationDetails(comparison)}`;
  }



  function uniqueStrings(values){
    const seen = new Set();
    const result = [];
    for (const value of asList(values)) {
      const text = String(value || '').trim();
      if (!text || seen.has(text)) continue;
      seen.add(text);
      result.push(text);
    }
    return result;
  }

  function safetyLevelLabel(level){
    const labels = { green: 'grün', yellow: 'gelb', red: 'rot', gray: 'grau' };
    return labels[level] || level || 'unbekannt';
  }

  function safetyBoolText(value, trueText, falseText){
    return value ? trueText : falseText;
  }

  function safetyRow(label, status, text, note){
    const rowClass = status === 'error' ? 'error' : (status === 'warning' ? 'warning' : '');
    const noteHtml = note ? `<small style="display:block;opacity:.72;margin-top:3px;line-height:1.25;">${esc(note)}</small>` : '';
    return `<div class="busdiag-row ${rowClass}"><strong>${esc(label)}</strong><span><span>${esc(text)}</span>${noteHtml}</span></div>`;
  }

  function safetyHardBlockerRow(action){
    return `<div class="busdiag-row warning"><strong>${esc(hardBlockedActionLabel(action))}</strong><span><span>bewusst blockiert</span><small style="display:block;opacity:.72;margin-top:3px;line-height:1.25;font-family:monospace;">${esc(action)}</small></span></div>`;
  }

  function hardBlockedActionLabel(action){
    const labels = {
      auto_replay_alert: 'Auto Alert Replay',
      manual_replay_alert: 'Manual Alert Replay',
      alert_replay: 'Alert Replay',
      auto_replay_sound: 'Auto Sound Replay',
      manual_replay_sound: 'Manual Sound Replay',
      sound_replay: 'Sound Replay',
      queue_clear: 'Queue Clear',
      queue_state_clear: 'Queue Clear',
      overlay_state_repair: 'Overlay State Repair',
      auto_retry_overlay: 'Auto Retry Overlay',
      auto_recovery: 'Auto Recovery',
      execute_recovery: 'Execute Recovery',
      manual_recovery_execution: 'Manual Recovery Execution',
      streamerbot_action_retry: 'Streamer.bot Action Retry',
      obs_source_refresh: 'OBS Source Refresh'
    };
    return labels[action] || action;
  }

  function buildSafetyStatusModel(){
    const data = getStatus();
    const summary = getEffectiveRecoveryPreflightSummary();
    const routePreflight = getRecoveryPreflightRoute();
    const routeSafety = routePreflight.routeSafety || {};
    const preflight = getEffectiveRecoveryPreflight();
    const preflightSafety = preflight.safety || {};
    const readiness = data.recoveryReadiness || {};
    const preflightCheckSummary = preflight.checkSummary || {};
    const preflightChecks = asList(preflight.checks);
    const requiredHardBlocked = [
      'alert_replay',
      'sound_replay',
      'queue_state_clear',
      'overlay_state_repair',
      'execute_recovery',
      'auto_recovery',
      'auto_retry_overlay',
      'streamerbot_action_retry',
      'obs_source_refresh'
    ];
    const hardBlockedActions = uniqueStrings([
      ...requiredHardBlocked,
      ...asList(readiness.hardBlockedActions),
      ...asList(preflight.hardBlockedActions)
    ]);
    const dangerousRoutesPresent = routeSafety.commandRoute === true
      || routeSafety.prepareRoute === true
      || routeSafety.executeRoute === true
      || routeSafety.method === 'POST'
      || routeSafety.postRoutePresent === true;
    const productiveMutationPresent = data.productiveActions === true
      || data.flowTouched === true
      || data.queueTouched === true
      || data.soundSystemTouched === true
      || data.alertSystemTouched === true
      || data.overlayTouched === true
      || readiness.productiveActions === true
      || readiness.queueTouched === true
      || readiness.soundSystemTouched === true
      || readiness.alertSystemTouched === true
      || readiness.overlayTouched === true
      || preflightSafety.productiveActions === true
      || preflightSafety.flowTouched === true
      || preflightSafety.queueTouched === true
      || preflightSafety.soundSystemTouched === true
      || preflightSafety.alertSystemTouched === true
      || preflightSafety.overlayTouched === true;
    const recoveryExecution = routeSafety.recoveryExecution === true;
    const canPrepare = preflight.canPrepare === true || routePreflight.canPrepare === true;
    const canExecute = preflight.canExecute === true || routePreflight.canExecute === true;
    const readOnly = data.readOnly !== false && routePreflight.readOnly !== false && preflight.readOnly !== false && routeSafety.readOnly !== false;
    const guardCount = Number(preflightCheckSummary.total ?? summary.recoveryPreflightCheckCount ?? preflightChecks.length ?? 0);
    const guardWarnings = Number(preflightCheckSummary.warnings ?? summary.recoveryPreflightWarningCheckCount ?? 0);
    const guardBlocked = Number(preflightCheckSummary.blocked ?? 0);
    const guardBlocking = Number(preflightCheckSummary.blocking ?? summary.recoveryPreflightBlockingCheckCount ?? 0);
    const guardErrors = asList(data.errors).length;
    let overallLevel = 'green';
    if (!readOnly || recoveryExecution || canExecute || dangerousRoutesPresent || productiveMutationPresent) overallLevel = 'red';
    else if (canPrepare || guardWarnings > 0 || guardBlocked > 0 || guardBlocking > 0 || guardErrors > 0) overallLevel = 'yellow';
    else overallLevel = 'green';
    return {
      generatedAt: data.fetchedAt || routePreflight.checkedAt || new Date().toISOString(),
      overallLevel,
      readOnly,
      canPrepare,
      canExecute,
      recoveryExecution,
      dangerousRoutesPresent,
      productiveMutationPresent,
      routeSafetyMethod: routeSafety.method || 'GET',
      commandRoute: routeSafety.commandRoute === true,
      prepareRoute: routeSafety.prepareRoute === true,
      executeRoute: routeSafety.executeRoute === true,
      postRoutePresent: routeSafety.postRoutePresent === true || routeSafety.method === 'POST',
      guardCount,
      guardOk: Number(preflightCheckSummary.ok ?? Math.max(0, guardCount - guardWarnings - guardBlocked - guardErrors)),
      guardWarnings,
      guardBlocked,
      guardBlocking,
      guardErrors,
      preflightKnown: !!(preflight && Object.keys(preflight).length),
      preflightOk: preflight.readOnly === true && preflight.canExecute === false && preflightSafety.productiveActions === false,
      auditReady: false,
      rightsReady: false,
      confirmReady: false,
      safetyStopReady: false,
      cancelReady: false,
      duplicateLockReady: false,
      hardBlockedActions
    };
  }

  function renderSafetyStatusView(){
    const model = buildSafetyStatusModel();
    const overallStatus = model.overallLevel === 'red' ? 'error' : (model.overallLevel === 'yellow' ? 'warning' : 'ok');
    const executionRows = [
      safetyRow('Read-only', model.readOnly ? 'ok' : 'error', safetyBoolText(model.readOnly, 'ja / sicher', 'nein / prüfen')),
      safetyRow('Prepare', model.canPrepare ? 'warning' : 'ok', safetyBoolText(model.canPrepare, 'ja / prüfen', 'nein / sicher')),
      safetyRow('Execute', model.canExecute ? 'error' : 'ok', safetyBoolText(model.canExecute, 'ja / Gefahr', 'nein / sicher')),
      safetyRow('Recovery-Ausführung', model.recoveryExecution ? 'error' : 'ok', safetyBoolText(model.recoveryExecution, 'aktiv / Gefahr', 'nein / sicher')),
      safetyRow('Produktive Mutation', model.productiveMutationPresent ? 'error' : 'ok', safetyBoolText(model.productiveMutationPresent, 'erkannt / Gefahr', 'nein / sicher'))
    ].join('');
    const routeRows = [
      safetyRow('Methode', model.routeSafetyMethod === 'GET' ? 'ok' : 'error', model.routeSafetyMethod || 'unbekannt'),
      safetyRow('Command Route', model.commandRoute ? 'error' : 'ok', safetyBoolText(model.commandRoute, 'vorhanden / Gefahr', 'nein / sicher')),
      safetyRow('Prepare Route', model.prepareRoute ? 'error' : 'ok', safetyBoolText(model.prepareRoute, 'vorhanden / Gefahr', 'nein / sicher')),
      safetyRow('Execute Route', model.executeRoute ? 'error' : 'ok', safetyBoolText(model.executeRoute, 'vorhanden / Gefahr', 'nein / sicher')),
      safetyRow('POST Route', model.postRoutePresent ? 'error' : 'ok', safetyBoolText(model.postRoutePresent, 'vorhanden / Gefahr', 'nein / sicher'))
    ].join('');
    const prerequisiteRows = [
      safetyRow('Audit', 'warning', 'noch nicht aktiv', 'geplant, keine Implementierung'),
      safetyRow('Rollen/Rechte', 'warning', 'noch nicht aktiv', 'geplant, keine Implementierung'),
      safetyRow('Confirm', 'warning', 'noch nicht aktiv', 'geplant, keine Implementierung'),
      safetyRow('SafetyStop', 'warning', 'noch nicht aktiv', 'geplant, keine Implementierung'),
      safetyRow('Cancel', 'warning', 'noch nicht aktiv', 'geplant, keine Implementierung'),
      safetyRow('Duplikat-Sperre', 'warning', 'noch nicht aktiv', 'geplant, keine Implementierung')
    ].join('');
    const hardBlockedList = model.hardBlockedActions.length
      ? `<div class="busdiag-list">${model.hardBlockedActions.map(safetyHardBlockerRow).join('')}</div>`
      : '<p class="busdiag-muted">Keine hart blockierten Aktionen gemeldet. Das sollte geprüft werden.</p>';
    return `
      <div class="busdiag-grid busdiag-grid-top">
        ${card('Safety Status Gesamt', `<div class="busdiag-status-line">${badge(safetyLevelLabel(model.overallLevel), overallStatus)}<span>read-only Anzeige / keine Aktion</span></div><div class="busdiag-metrics">${metric('Read-only', bool(model.readOnly), model.readOnly ? 'sicher' : 'prüfen')}${metric('Prepare', bool(model.canPrepare), model.canPrepare ? 'prüfen' : 'sicher')}${metric('Execute', bool(model.canExecute), model.canExecute ? 'Gefahr' : 'sicher')}${metric('Recovery Exec', bool(model.recoveryExecution), model.recoveryExecution ? 'Gefahr' : 'sicher')}${metric('Letzte Auswertung', fmtTime(model.generatedAt))}</div>`, 'busdiag-wide')}
      </div>
      <div class="busdiag-grid">
        ${card('Recovery-Ausführung', `<div class="busdiag-list">${executionRows}</div>`)}
        ${card('Routen-Sicherheit', `<div class="busdiag-list">${routeRows}</div>`)}
        ${card('Guards / Preflight', `<div class="busdiag-status-line">${badge(model.guardErrors > 0 || model.guardBlocked > 0 || model.guardBlocking > 0 ? 'prüfen' : 'ok', model.guardErrors > 0 ? 'error' : (model.guardWarnings > 0 || model.guardBlocked > 0 || model.guardBlocking > 0 ? 'warning' : 'ok'))}<span>nur vorhandene Diagnosewerte</span></div><div class="busdiag-metrics">${metric('Checks', model.guardCount)}${metric('OK', model.guardOk)}${metric('Warnings', model.guardWarnings)}${metric('Blocked', model.guardBlocked)}${metric('Blocking', model.guardBlocking)}${metric('Errors', model.guardErrors)}${metric('Preflight bekannt', bool(model.preflightKnown))}</div>`)}
        ${card('Sicherheitsbausteine', `<div class="busdiag-status-line">${badge('geplant', 'warning')}<span>false bedeutet hier: noch nicht technisch aktiv</span></div><div class="busdiag-list">${prerequisiteRows}</div>`, 'busdiag-wide')}
        ${card('Harte Blocker', hardBlockedList, 'busdiag-wide')}
        ${card('Hinweis', '<p class="busdiag-muted">Diese Karte ist bewusst passiv. Es gibt hier keine Buttons, keine POST-Aufrufe, keine Recovery-Ausführung und keine Änderungen an Queue, Sound, Alert oder Overlay.</p>', 'busdiag-wide')}
      </div>
    `;
  }


  function renderRecoveryTab(){
    const data = getStatus();
    const routePreflight = getRecoveryPreflightRoute();
    const summary = getEffectiveRecoveryPreflightSummary();
    const recovery = data.recoveryStrategyState || {};
    const source = recovery.source || {};
    const reasons = asList(recovery.reasons);
    const blockedActions = asList(recovery.blockedActions);
    const allowedActions = asList(recovery.allowedActions);
    const status = recovery.severity || (recovery.warning ? 'warning' : (recovery.ok === false ? 'warning' : 'ok'));
    const stateLabel = recovery.state || summary.recoveryStrategyState || 'nicht geladen';
    const safetyOk = data.readOnly === true && recovery.readOnly !== false && recovery.automationEnabled === false && data.flowTouched === false && data.queueTouched === false && data.soundSystemTouched === false && data.alertSystemTouched === false && data.overlayTouched === false;
    const safetyStatus = safetyOk ? 'ok' : 'warning';
    const safetyText = safetyOk ? 'read-only / keine produktive Berührung' : 'prüfen';
    const sourceRows = [
      ['Handshake', source.handshakeState || summary.handshakeState || '-'],
      ['Visual Delivery', source.visualDeliveryState || '-'],
      ['Unmatched', source.unmatched ?? summary.correlationUnmatched ?? 0],
      ['Missing ACK', source.missingAck ?? 0],
      ['No Client', source.noClient ?? 0],
      ['Waiting', source.waiting ?? 0]
    ];
    const sourceTiles = sourceRows.map(row => {
      const raw = value(row[1]);
      return `<div class="busdiag-row" style="display:grid;grid-template-columns:112px minmax(0,1fr);align-items:center;gap:10px;padding:9px 11px;"><strong>${esc(row[0])}</strong><span title="${esc(raw)}" style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(raw)}</span></div>`;
    }).join('');
    const blockedList = blockedActions.length
      ? `<div class="busdiag-list">${blockedActions.map(action => `<div class="busdiag-row warning"><strong>blockiert</strong><span>${esc(action)}</span></div>`).join('')}</div>`
      : '<p class="busdiag-muted">Keine blockierten Aktionen gemeldet.</p>';
    const allowedList = allowedActions.length
      ? `<div class="busdiag-list">${allowedActions.map(action => `<div class="busdiag-row"><strong>erlaubt</strong><span>${esc(action)}</span></div>`).join('')}</div>`
      : '<p class="busdiag-muted">Keine aktiven Aktionen erlaubt.</p>';
    const reasonList = reasons.length
      ? `<div class="busdiag-list">${reasons.map(reason => `<div class="busdiag-row"><strong>Grund</strong><span>${esc(reason)}</span></div>`).join('')}</div>`
      : '<p class="busdiag-muted">Keine Gründe gemeldet.</p>';
    const readiness = data.recoveryReadiness || {};
    const readinessChecks = asList(readiness.checks);
    const readinessHardBlocked = asList(readiness.hardBlockedActions);
    const readinessBlockers = asList(readiness.blockers);
    const readinessStatus = readiness.status || summary.recoveryReadinessStatus || 'nicht geladen';
    const readinessOk = readiness.ok === true && readiness.readOnly === true && readiness.automationEnabled === false && readiness.productiveActions === false && readiness.flowTouched === false && readiness.queueTouched === false && readiness.soundSystemTouched === false && readiness.alertSystemTouched === false && readiness.overlayTouched === false;
    const readinessBadgeStatus = readinessOk ? 'ok' : 'warning';
    const readinessCheckList = readinessChecks.length
      ? `<div class="busdiag-list">${readinessChecks.map(check => `<div class="busdiag-row ${check.ok === false ? 'warning' : ''}"><strong>${esc(check.key || 'check')}</strong><span>${esc(check.ok === false ? (check.reason || 'prüfen') : 'ok')}</span></div>`).join('')}</div>`
      : '<p class="busdiag-muted">Noch keine Recovery-Readiness-Checks geladen.</p>';
    const readinessHardBlockedList = readinessHardBlocked.length
      ? `<div class="busdiag-list">${readinessHardBlocked.map(action => `<div class="busdiag-row warning"><strong>hart blockiert</strong><span>${esc(action)}</span></div>`).join('')}</div>`
      : '<p class="busdiag-muted">Keine hart blockierten Aktionen gemeldet.</p>';
    const readinessBlockerList = readinessBlockers.length
      ? `<div class="busdiag-list">${readinessBlockers.map(blocker => `<div class="busdiag-row warning"><strong>Blocker</strong><span>${esc(blocker)}</span></div>`).join('')}</div>`
      : '<p class="busdiag-muted">Keine Recovery-Readiness-Blocker gemeldet.</p>';
    const preflight = getEffectiveRecoveryPreflight();
    const routeContext = routePreflight.routeContext || {};
    const routeSafety = routePreflight.routeSafety || {};
    const preflightRouteOk = routePreflight.fetchOk !== false && routePreflight.readOnly === true && routeSafety.commandRoute === false && routeSafety.executeRoute === false && routeSafety.prepareRoute === false && routeSafety.recoveryExecution === false;
    const preflightSafety = preflight.safety || {};
    const preflightChecks = asList(preflight.checks);
    const preflightBlockers = asList(preflight.blockers);
    const preflightWarnings = asList(preflight.warnings);
    const preflightHardBlocked = asList(preflight.hardBlockedActions);
    const preflightScope = asList(preflight.scope || preflight.allowedScope);
    const preflightCheckSummary = preflight.checkSummary || {};
    const preflightStatus = preflight.status || summary.recoveryPreflightStatus || 'nicht geladen';
    const preflightOk = preflight.readOnly === true && preflight.canExecute === false && preflightSafety.automationEnabled === false && preflightSafety.productiveActions === false && preflightSafety.flowTouched === false && preflightSafety.queueTouched === false && preflightSafety.soundSystemTouched === false && preflightSafety.alertSystemTouched === false && preflightSafety.overlayTouched === false;
    const preflightBadgeStatus = preflightOk ? 'ok' : 'warning';
    const preflightCheckList = preflightChecks.length
      ? `<div class="busdiag-table busdiag-table-events"><div class="busdiag-table-head"><span>Check</span><span>Kategorie</span><span>Status</span><span>Blockierend</span><span>Grund</span></div>${preflightChecks.map(check => { const severity = check.severity || (check.ok === false ? 'warning' : 'ok'); return `<div class="busdiag-table-row"><span><strong>${esc(check.key || 'check')}</strong><small>${esc(check.details ? compactJson(check.details).slice(0, 180) : '')}</small></span><span>${esc(check.category || '-')}</span><span>${badge(check.ok === false ? 'prüfen' : 'ok', severity)}</span><span>${esc(bool(check.blocking))}</span><span>${esc(check.reason || '-')}</span></div>`; }).join('')}</div>`
      : '<p class="busdiag-muted">Noch keine Recovery-Preflight-Checks geladen.</p>';
    const preflightBlockerList = preflightBlockers.length
      ? `<div class="busdiag-list">${preflightBlockers.map(blocker => `<div class="busdiag-row warning"><strong>Blocker</strong><span>${esc(blocker)}</span></div>`).join('')}</div>`
      : '<p class="busdiag-muted">Keine Recovery-Preflight-Blocker gemeldet.</p>';
    const preflightWarningList = preflightWarnings.length
      ? `<div class="busdiag-list">${preflightWarnings.map(warning => `<div class="busdiag-row warning"><strong>Warnung</strong><span>${esc(warning)}</span></div>`).join('')}</div>`
      : '<p class="busdiag-muted">Keine Recovery-Preflight-Warnungen gemeldet.</p>';
    const preflightHardBlockedList = preflightHardBlocked.length
      ? `<div class="busdiag-list">${preflightHardBlocked.map(action => `<div class="busdiag-row warning"><strong>hart blockiert</strong><span>${esc(action)}</span></div>`).join('')}</div>`
      : '<p class="busdiag-muted">Keine hart blockierten Preflight-Aktionen gemeldet.</p>';
    const preflightScopeList = preflightScope.length
      ? `<div class="busdiag-list">${preflightScope.map(scope => `<div class="busdiag-row"><strong>Scope</strong><span>${esc(scope)}</span></div>`).join('')}</div>`
      : '<p class="busdiag-muted">Kein Preflight-Scope gemeldet.</p>';
    const preflightSummaryCard = `<div class="busdiag-status-line">${badge(preflightCheckSummary.blocked || preflightCheckSummary.blocking ? 'prüfen' : 'ok', preflightCheckSummary.blocked || preflightCheckSummary.blocking ? 'warning' : 'ok')}<span>Check-Matrix nur Anzeige</span></div><div class="busdiag-metrics">${metric('Checks', preflightCheckSummary.total ?? summary.recoveryPreflightCheckCount ?? preflightChecks.length)}${metric('OK', preflightCheckSummary.ok ?? '-')}${metric('Warnings', preflightCheckSummary.warnings ?? summary.recoveryPreflightWarningCheckCount ?? 0)}${metric('Blocking', preflightCheckSummary.blocking ?? summary.recoveryPreflightBlockingCheckCount ?? 0)}${metric('Blocked', preflightCheckSummary.blocked ?? 0)}${metric('Scope', preflightScope.length || summary.recoveryPreflightScopeCount || 0)}</div>`;
    const routeContextCard = `<div class="busdiag-status-line">${badge(preflightRouteOk ? 'ok' : 'prüfen', preflightRouteOk ? 'ok' : 'warning')}<span>GET /api/bus-diagnostics/recovery-preflight</span></div><div class="busdiag-metrics">${metric('Route Version', routePreflight.routeVersion || '-', '', 'busdiag-metric-code')}${metric('Route Step', routeContext.currentStep || routePreflight.currentStep || '-', '', 'busdiag-metric-code')}${metric('Route Next', routeContext.nextAllowedStep || routePreflight.nextAllowedStep || summary.recoveryPreflightNextStep || '-', '', 'busdiag-metric-code busdiag-metric-wide')}${metric('Source Step', routeContext.sourcePreflightCurrentStep || preflight.currentStep || '-', '', 'busdiag-metric-code')}${metric('Source Next', routeContext.sourcePreflightNextAllowedStep || summary.recoveryPreflightSourceNextStep || '-', '', 'busdiag-metric-code busdiag-metric-wide')}${metric('Route only', bool(routeContext.routeOnly))}${metric('Read-only', bool(routePreflight.readOnly))}</div>`;
    const routeSafetyCard = `<div class="busdiag-status-line">${badge(preflightRouteOk ? 'ok' : 'prüfen', preflightRouteOk ? 'ok' : 'warning')}<span>Route-Safety nur Anzeige</span></div><div class="busdiag-metrics">${metric('Method', routeSafety.method || 'GET')}${metric('Read-only', bool(routeSafety.readOnly))}${metric('Command Route', bool(routeSafety.commandRoute))}${metric('Prepare Route', bool(routeSafety.prepareRoute))}${metric('Execute Route', bool(routeSafety.executeRoute))}${metric('Recovery Exec', bool(routeSafety.recoveryExecution))}</div>`;
    const manualRefreshStatus = state.manualDiagnosticsRefreshLoading ? 'läuft' : (state.manualDiagnosticsRefreshLastResult === 'ok' ? 'erfolgreich' : (state.manualDiagnosticsRefreshLastResult === 'error' ? 'fehlgeschlagen' : 'noch nicht ausgeführt'));
    const manualRefreshBadge = state.manualDiagnosticsRefreshLoading ? 'warning' : (state.manualDiagnosticsRefreshLastResult === 'error' ? 'error' : 'ok');
    const manualRefreshButtonLabel = state.manualDiagnosticsRefreshLoading ? 'Lade Preflight...' : (state.manualDiagnosticsRefreshLastResult === 'ok' ? 'Preflight aktualisiert' : 'Preflight neu laden');
    const manualRefreshHelp = state.manualDiagnosticsRefreshError
      ? `<p class="busdiag-muted">Fehler: ${esc(state.manualDiagnosticsRefreshError)}</p>`
      : '<p class="busdiag-muted">Lädt nur bestehende read-only GET-Daten neu. Keine Recovery-Ausführung.</p>';
    const manualRefreshCard = `<div class="busdiag-status-line">${badge(manualRefreshStatus, manualRefreshBadge)}<span>nur Diagnose-Refresh / keine Recovery</span></div><div class="busdiag-metrics">${metric('Action', 'manual_diagnostics_refresh', '', 'busdiag-metric-code busdiag-metric-wide')}${metric('Status', manualRefreshStatus)}${metric('Letzter Refresh', fmtTime(state.manualDiagnosticsRefreshLastAt))}${metric('Route', state.manualDiagnosticsRefreshLastRoute || 'GET /api/bus-diagnostics/recovery-preflight', '', 'busdiag-metric-code busdiag-metric-wide')}${metric('Read-only', bool(state.manualDiagnosticsRefreshReadOnly))}${metric('Produktive Berührung', bool(state.manualDiagnosticsRefreshProductiveTouch))}${metric('Prepare', 'nein')}${metric('Execute', 'nein')}</div><div class="busdiag-actions busdiag-inline-actions"><button type="button" class="secondary" data-busdiag-action="manual-diagnostics-refresh" ${state.manualDiagnosticsRefreshLoading || state.loading ? 'disabled' : ''}>${esc(manualRefreshButtonLabel)}</button>${manualRefreshHelp}</div>`;
    const manualStatusResyncStatus = state.manualStatusResyncLoading ? 'läuft' : (state.manualStatusResyncLastResult === 'ok' ? 'erfolgreich' : (state.manualStatusResyncLastResult === 'error' ? 'fehlgeschlagen' : 'noch nicht ausgeführt'));
    const manualStatusResyncBadge = state.manualStatusResyncLoading ? 'warning' : (state.manualStatusResyncLastResult === 'error' ? 'error' : 'ok');
    const manualStatusResyncButtonLabel = state.manualStatusResyncLoading ? 'Synchronisiere Status...' : (state.manualStatusResyncLastResult === 'ok' ? 'Status synchronisiert' : 'Status neu synchronisieren');
    const manualStatusResyncHelp = state.manualStatusResyncError
      ? `<p class="busdiag-muted">Fehler: ${esc(state.manualStatusResyncError)}</p>`
      : '<p class="busdiag-muted">Read-only Status-Resync: liest nur bestehende Diagnosequellen und bewertet lokale Guards.</p>';
    const manualStatusResyncSources = state.manualStatusResyncSources.length ? state.manualStatusResyncSources : ['GET /api/bus-diagnostics/status', 'GET /api/bus-diagnostics/recovery-preflight'];
    const manualStatusResyncSourceList = `<div class="busdiag-list">${manualStatusResyncSources.map(src => `<div class="busdiag-row"><strong>Quelle</strong><span>${esc(src)}</span></div>`).join('')}</div>`;
    const manualStatusResyncGuardList = `<div class="busdiag-list">${Object.entries(state.manualStatusResyncGuards || {}).map(([key, ok]) => `<div class="busdiag-row ${ok ? '' : 'warning'}"><strong>${esc(key)}</strong><span>${esc(ok ? 'ok' : 'prüfen')}</span></div>`).join('') || '<div class="busdiag-row"><strong>Guards</strong><span>noch nicht ausgeführt</span></div>'}</div>`;
    const manualStatusResyncCard = `<div class="busdiag-status-line">${badge(manualStatusResyncStatus, manualStatusResyncBadge)}<span>read-only Status-Resync / keine Recovery</span></div><div class="busdiag-metrics">${metric('Action', 'manual_status_resync_request', '', 'busdiag-metric-code busdiag-metric-wide')}${metric('Status', manualStatusResyncStatus)}${metric('Letzter Resync', fmtTime(state.manualStatusResyncLastAt))}${metric('Read-only', bool(state.manualStatusResyncReadOnly))}${metric('Produktive Berührung', bool(state.manualStatusResyncProductiveTouch))}${metric('Prepare', bool(state.manualStatusResyncCanPrepare))}${metric('Execute', bool(state.manualStatusResyncCanExecute))}</div>${manualStatusResyncSourceList}${manualStatusResyncGuardList}<div class="busdiag-actions busdiag-inline-actions"><button type="button" class="secondary" data-busdiag-action="manual-status-resync" ${state.manualStatusResyncLoading || state.loading ? 'disabled' : ''}>${esc(manualStatusResyncButtonLabel)}</button>${manualStatusResyncHelp}</div>`;
    const recoverySubTabs = [
      { id: 'overview', label: 'Übersicht' },
      { id: 'details', label: 'Details' },
      { id: 'readiness', label: 'Readiness' },
      { id: 'preflight', label: 'Preflight' },
      { id: 'safety', label: 'Safety Status' },
      { id: 'locks', label: 'Sperren & Simulation' }
    ];
    if (!recoverySubTabs.some(tab => tab.id === state.recoverySubTab)) state.recoverySubTab = 'overview';
    const subNav = `<nav class="busdiag-tabs busdiag-recovery-tabs" data-busdiag-recovery-tabs>${recoverySubTabs.map(tab => `<button type="button" data-busdiag-recovery-tab="${esc(tab.id)}" class="${tab.id === state.recoverySubTab ? 'active' : ''}">${esc(tab.label)}</button>`).join('')}</nav>`;

    const overviewView = `
      <div class="busdiag-grid busdiag-grid-top">
        ${card('Recovery-Strategie', `<div class="busdiag-status-line">${badge(stateLabel, status)}<span>${esc(recovery.mode || summary.recoveryStrategyMode || 'read_only')}</span></div><div class="busdiag-metrics">${metric('State', stateLabel, '', 'busdiag-metric-code busdiag-metric-wide')}${metric('Severity', recovery.severity || '-')}${metric('Next Action', recovery.nextAction || '-', '', 'busdiag-metric-code')}${metric('Automation', bool(recovery.automationEnabled), 'muss aus bleiben')}</div>`)}
        ${card('Sicherheitsstatus', `<div class="busdiag-status-line">${badge(safetyStatus === 'ok' ? 'ok' : 'prüfen', safetyStatus)}<span>${esc(safetyText)}</span></div><div class="busdiag-metrics">${metric('Read-only', bool(data.readOnly && recovery.readOnly !== false))}${metric('Productive Actions', bool(data.productiveActions))}${metric('Flow touched', bool(data.flowTouched))}${metric('Overlay touched', bool(data.overlayTouched))}</div>`)}
      </div>
      <div class="busdiag-grid busdiag-grid-top">
        ${card('Recovery-Readiness', `<div class="busdiag-status-line">${badge(readinessStatus, readinessBadgeStatus)}<span>nur Anzeige / keine Aktion</span></div><div class="busdiag-metrics">${metric('CAN Start', bool(readiness.canStartReadOnlyCode), 'nur read-only')}${metric('Current Step', readiness.currentStep || '-', '', 'busdiag-metric-code')}${metric('Next Step', readiness.nextAllowedStep || summary.recoveryReadinessNextStep || '-', '', 'busdiag-metric-code busdiag-metric-wide')}${metric('Checked', fmtTime(readiness.checkedAt))}</div>`)}
        ${card('Recovery-Preflight', `<div class="busdiag-status-line">${badge(preflightStatus, preflightBadgeStatus)}<span>nur Anzeige / keine Aktion</span></div><div class="busdiag-metrics">${metric('Prepare', bool(preflight.canPrepare), 'muss aktuell aus bleiben')}${metric('Execute', bool(preflight.canExecute), 'muss aus bleiben')}${metric('Checks', preflightCheckSummary.total ?? summary.recoveryPreflightCheckCount ?? preflightChecks.length)}${metric('Current Step', preflight.currentStep || '-', '', 'busdiag-metric-code')}${metric('Next Step', preflight.nextAllowedStep || summary.recoveryPreflightNextStep || '-', '', 'busdiag-metric-code busdiag-metric-wide')}</div>`)}
        ${card('Sicherheitskurzfassung', `<div class="busdiag-status-line">${badge(readinessOk && preflightOk ? 'ok' : 'prüfen', readinessOk && preflightOk ? 'ok' : 'warning')}<span>keine produktive Berührung</span></div><div class="busdiag-metrics">${metric('Read-only', bool(readiness.readOnly && preflight.readOnly))}${metric('Automation', bool(readiness.automationEnabled || preflightSafety.automationEnabled))}${metric('Productive', bool(readiness.productiveActions || preflightSafety.productiveActions))}${metric('Blocker', readinessBlockers.length + preflightBlockers.length)}</div>`)}
      </div>
    `;

    const detailsView = `
      <div class="busdiag-grid">
        ${card('Recovery-Quelle', `<div class="busdiag-list" style="display:grid;gap:8px;">${sourceTiles}</div>`)}
        ${card('Blockierte Aktionen', blockedList)}
        ${card('Erlaubte Aktionen', allowedList)}
        ${card('Gründe', reasonList)}
      </div>
    `;

    const readinessView = `
      <div class="busdiag-grid busdiag-grid-top">
        ${card('Readiness-Safety', `<div class="busdiag-status-line">${badge(readinessOk ? 'ok' : 'prüfen', readinessBadgeStatus)}<span>Produktive Aktionen müssen aus bleiben</span></div><div class="busdiag-metrics">${metric('Read-only', bool(readiness.readOnly))}${metric('Automation', bool(readiness.automationEnabled))}${metric('Productive', bool(readiness.productiveActions))}${metric('Queue touched', bool(readiness.queueTouched))}${metric('Sound touched', bool(readiness.soundSystemTouched))}${metric('Alert touched', bool(readiness.alertSystemTouched))}${metric('Overlay touched', bool(readiness.overlayTouched))}</div>`)}
        ${card('Readiness-Blocker', readinessBlockerList)}
      </div>
      <div class="busdiag-grid">
        ${card('Readiness-Checks', readinessCheckList, 'busdiag-wide')}
      </div>
    `;

    const preflightView = `
      <div class="busdiag-grid busdiag-grid-top">
        ${card('Recovery-Preflight', `<div class="busdiag-status-line">${badge(preflightStatus, preflightBadgeStatus)}<span>read-only / keine Ausführung</span></div><div class="busdiag-metrics">${metric('Mode', preflight.mode || 'read_only')}${metric('Read-only', bool(preflight.readOnly))}${metric('Prepare', bool(preflight.canPrepare), 'aktuell nicht erlaubt')}${metric('Execute', bool(preflight.canExecute), 'muss aus bleiben')}${metric('Current Step', preflight.currentStep || '-', '', 'busdiag-metric-code')}${metric('Next Step', preflight.nextAllowedStep || summary.recoveryPreflightNextStep || '-', '', 'busdiag-metric-code busdiag-metric-wide')}${metric('Checked', fmtTime(preflight.checkedAt))}</div>`)}
        ${card('Preflight-Safety', `<div class="busdiag-status-line">${badge(preflightOk ? 'ok' : 'prüfen', preflightBadgeStatus)}<span>Produktive Aktionen müssen aus bleiben</span></div><div class="busdiag-metrics">${metric('Automation', bool(preflightSafety.automationEnabled))}${metric('Productive', bool(preflightSafety.productiveActions))}${metric('Flow touched', bool(preflightSafety.flowTouched))}${metric('Queue touched', bool(preflightSafety.queueTouched))}${metric('Sound touched', bool(preflightSafety.soundSystemTouched))}${metric('Alert touched', bool(preflightSafety.alertSystemTouched))}${metric('Overlay touched', bool(preflightSafety.overlayTouched))}</div>`)}
      </div>
      <div class="busdiag-grid">
        ${card('Manueller Diagnose-Refresh', manualRefreshCard, 'busdiag-wide')}
        ${card('Manueller Status-Resync', manualStatusResyncCard, 'busdiag-wide')}
        ${card('Recovery Guards', buildRecoveryGuardDisplay(), 'busdiag-wide')}
        ${card('Preflight-Route-Kontext', routeContextCard, 'busdiag-wide')}
        ${card('Preflight-Route-Safety', routeSafetyCard, 'busdiag-wide')}
        ${card('Preflight-Check-Matrix', preflightSummaryCard, 'busdiag-wide')}
        ${card('Preflight-Scope', preflightScopeList)}
        ${card('Preflight-Blocker', preflightBlockerList)}
        ${card('Preflight-Warnungen', preflightWarningList)}
        ${card('Preflight-Checks', preflightCheckList, 'busdiag-wide')}
        ${card('Hart blockierte Preflight-Aktionen', preflightHardBlockedList, 'busdiag-wide')}
      </div>
    `;

    const locksView = `
      <div class="busdiag-grid">
        ${card('Hart blockierte Recovery-Aktionen', readinessHardBlockedList, 'busdiag-wide')}
        ${card('Simulation-Harness', `<div class="busdiag-status-line">${badge('read-only', 'ok')}<span>Anzeige nur Diagnose, keine Test-Buttons</span></div><div class="busdiag-metrics">${metric('Status Route', '/api/bus-diagnostics/recovery-simulation/status', '', 'busdiag-metric-code busdiag-metric-wide')}${metric('Test Trigger', 'nicht im Dashboard', 'bewusst nicht auslösbar')}${metric('Auto-Recovery', 'aus')}${metric('Replay', 'aus')}</div>`, 'busdiag-wide')}
      </div>
    `;

    const safetyView = renderSafetyStatusView();

    const views = { overview: overviewView, details: detailsView, readiness: readinessView, preflight: preflightView, safety: safetyView, locks: locksView };

    return `
      ${subNav}
      ${views[state.recoverySubTab] || overviewView}
    `;
  }

  function renderIssuesTab(){
    const warnings = asList(getStatus().warnings);
    const errors = asList(getStatus().errors);
    const issues = getIssues();
    const watchdog = getStatus().watchdog || {};
    return `${card('Hinweise / Errors', (!warnings.length && !errors.length) ? '<p class="busdiag-muted">Keine Hinweise oder Fehler.</p>' : `<div class="busdiag-list">${errors.map(e => `<div class="busdiag-row error"><strong>Error</strong><span>${esc(e)}</span></div>`).join('')}${warnings.map(w => `<div class="busdiag-row warning"><strong>Warning</strong><span>${esc(w)}</span></div>`).join('')}</div>`, 'busdiag-wide')}${card('Bus-Issues', issues.length ? `<div class="busdiag-table busdiag-table-issues"><div class="busdiag-table-head"><span>Key</span><span>Level</span><span>Count</span><span>Zuletzt</span></div>${issues.map(issue => `<div class="busdiag-table-row"><span><strong>${esc(issue.key || '-')}</strong><small>${esc(issue.message || '')}</small></span><span>${badge(issue.level || 'info', issue.level || 'info')}</span><span>${esc(issue.count ?? issue.suppressed ?? '-')}</span><span>${esc(fmtTime(issue.lastSeenAt || issue.firstSeenAt))}</span></div>`).join('')}</div>` : '<p class="busdiag-muted">Keine Bus-Issues im Speicher.</p>', 'busdiag-wide')}${watchdog.diagnosis ? card('Watchdog', `<details class="busdiag-details" open><summary>Watchdog-Diagnose</summary><pre>${esc(compactJson(watchdog.diagnosis))}</pre></details>`, 'busdiag-wide') : ''}`;
  }

  function renderConfigTab(){
    const settings = state.lastSettings;
    if (!settings && !state.settingsLoading && !state.settingsError) {
      setTimeout(() => loadSettings(false), 0);
    }
    if (state.settingsLoading) {
      return card('Bus-Config', '<p class="busdiag-muted">DB-basierte Bus-Config wird geladen…</p>', 'busdiag-wide');
    }
    if (!settings) {
      const msg = state.settingsError
        ? `Bus-Config konnte nicht geladen werden: ${esc(state.settingsError)}`
        : 'Noch keine Bus-Config geladen.';
      return card('Bus-Config', `<p class="busdiag-muted">${msg}</p><div class="busdiag-config-actions"><button type="button" data-busdiag-reload-settings>Config neu laden</button></div>`, 'busdiag-wide');
    }
    const categories = asList(settings.categories);
    return `${card('Bus-Config Speicher', `<div class="busdiag-status-line">${badge(settings.ok ? 'ok' : 'error', settings.ok ? 'ok' : 'error')}<span>${esc(settings.module || 'communication_bus')} ${esc(settings.moduleVersion || '')}</span></div><div class="busdiag-metrics">${metric('Speicher', settings.storage || '-')}${metric('Adapter', settings.adapter || '-')}${metric('Tabelle', settings.table || '-')}${metric('Runtime sofort', bool(settings.runtimeAppliedImmediately), settings.runtimeApplyNote || '')}</div>`, 'busdiag-wide busdiag-config-intro')}${categories.map(category => `<section class="busdiag-card busdiag-wide busdiag-config-category"><h3>${esc(category.name)}</h3><div class="busdiag-config-grid">${asList(category.settings).map(renderSettingInput).join('')}</div></section>`).join('')}<section class="busdiag-card busdiag-wide"><div class="busdiag-config-actions"><button type="button" data-busdiag-save-settings>Bus-Config speichern</button><button type="button" class="secondary" data-busdiag-reload-settings>Config neu laden</button></div><p class="busdiag-muted">Schreibziel ist die zentrale DB. Produktive Runtime-Uebernahme bleibt bewusst ein separater Schritt.</p></section>`;
  }

  function renderSettingInput(setting){
    const key = setting.key;
    const disabled = setting.editable === false ? 'disabled' : '';
    if (setting.type === 'boolean') {
      return `<label class="busdiag-setting busdiag-setting-bool"><span><strong>${esc(setting.label)}</strong><small>${esc(setting.description || key)}</small></span><input type="checkbox" data-busdiag-setting="${esc(key)}" ${setting.value ? 'checked' : ''} ${disabled}></label>`;
    }
    if (setting.type === 'number') {
      return `<label class="busdiag-setting"><span><strong>${esc(setting.label)}</strong><small>${esc(setting.description || key)}</small></span><input type="number" data-busdiag-setting="${esc(key)}" value="${esc(setting.value)}" min="${esc(setting.min ?? '')}" max="${esc(setting.max ?? '')}" ${disabled}></label>`;
    }
    return `<label class="busdiag-setting"><span><strong>${esc(setting.label)}</strong><small>${esc(setting.description || key)}</small></span><input type="text" data-busdiag-setting="${esc(key)}" value="${esc(setting.value)}" ${disabled}></label>`;
  }

  function bindRecoveryActions(){
    panel()?.querySelectorAll('[data-busdiag-recovery-tab]').forEach(btn => {
      btn.addEventListener('click', () => setRecoverySubTab(btn.dataset.busdiagRecoveryTab));
    });
    panel()?.querySelector('[data-busdiag-action="manual-diagnostics-refresh"]')?.addEventListener('click', manualDiagnosticsRefresh);
    panel()?.querySelector('[data-busdiag-action="manual-status-resync"]')?.addEventListener('click', manualStatusResyncRequest);
  }

  function bindConfigActions(){
    panel()?.querySelector('[data-busdiag-save-settings]')?.addEventListener('click', saveSettings);
    panel()?.querySelector('[data-busdiag-reload-settings]')?.addEventListener('click', async () => { await loadSettings(true); });
  }

  async function saveSettings(){
    const root = panel();
    if (!root) return;
    const settings = {};
    root.querySelectorAll('[data-busdiag-setting]').forEach(input => {
      const key = input.dataset.busdiagSetting;
      if (!key || input.disabled) return;
      settings[key] = input.type === 'checkbox' ? input.checked : (input.type === 'number' ? Number(input.value) : input.value);
    });
    await window.CGN.api('/api/communication/settings', { method:'POST', body: JSON.stringify({ updatedBy:'dashboard.bus_diagnostics', settings }) });
    await loadSettings(true);
  }

  function renderRawTab(){
    return `${card('Komplette Bus-Diagnose', `<details class="busdiag-details" open><summary>Diagnose anzeigen</summary><pre>${esc(compactJson(state.lastData))}</pre></details>`, 'busdiag-wide')}${card('Bus-Config Rohdaten', `<details class="busdiag-details"><summary>Settings anzeigen</summary><pre>${esc(compactJson(state.lastSettings || {}))}</pre></details>`, 'busdiag-wide')}`;
  }

  function renderCapabilityChips(capabilities){ const list = asList(capabilities); return list.length ? list.map(cap => `<span class="busdiag-chip">${esc(cap)}</span>`).join('') : '-'; }

  function renderRecent(title, events){
    events = asList(events).slice(0, 10);
    if (!events.length) return '';
    return card(title, `<div class="busdiag-table busdiag-table-events"><div class="busdiag-table-head"><span>Zeit</span><span>Action</span><span>Event</span><span>Delivered</span><span>Details</span></div>${events.map(event => `<div class="busdiag-table-row"><span>${esc(event.at || '-')}</span><span><strong>${esc(event.action || '-')}</strong><small>${esc(event.reason || '')}</small></span><span><strong>${esc(event.eventId || '-')}</strong></span><span>${esc(event.deliveredCount ?? '-')}</span><span><details class="busdiag-inline-details"><summary>Details</summary><pre>${esc(compactJson(event))}</pre></details></span></div>`).join('')}</div>`, 'busdiag-wide');
  }

  function renderCorrelationDetails(comparison){
    const matches = asList(comparison.matches);
    const unmatched = asList(comparison.unmatchedAlerts);
    if (!matches.length && !unmatched.length) return '';
    return card('Korrelation Details', `<div class="busdiag-correlation-grid">${matches.map(match => `<div class="busdiag-correlation-row ok"><div><strong>${esc(match.eventUid || '-')}</strong><small>${esc(match.bundleId || '-')}</small></div><div><span>Matched by</span><strong>${esc(match.matchedBy || '-')}</strong></div><div><span>Sound Action</span><strong>${esc(match.soundLastAction || '-')}</strong></div><div><span>Errors</span><strong>${esc(match.soundErrorCount ?? 0)}</strong></div></div>`).join('')}${unmatched.map(row => `<div class="busdiag-correlation-row warning"><div><strong>${esc(row.eventUid || '-')}</strong><small>${esc(row.bundleId || '-')}</small></div><div><span>Status</span><strong>unmatched</strong></div><div><span>Phase</span><strong>${esc(row.phase || '-')}</strong></div><div><span>Hinweis</span><strong>prüfen</strong></div></div>`).join('')}</div>`, 'busdiag-wide');
  }

  function loadWhenShown(event){
    if (event.detail?.module !== 'bus_diagnostics') return;
    state.visible = !document.hidden;
    if (!panel()?.dataset.rendered) { renderSkeleton(); panel().dataset.rendered = '1'; }
    loadAll(false);
    restartAutoTimer();
  }

  window[MODULE] = {
    loadAll,
    render: renderSkeleton,
    stop(){
      if (state.autoTimer) clearTimeout(state.autoTimer);
      if (state.countdownTimer) clearInterval(state.countdownTimer);
      state.autoTimer = null;
      state.countdownTimer = null;
      state.nextRefreshAt = 0;
      updateLiveStatus();
    }
  };

  document.addEventListener('visibilitychange', () => {
    state.visible = !document.hidden;
    if (state.visible && window.CGN?.activeModule === 'bus_diagnostics') {
      if (state.autoRefresh) loadAll(false);
    } else {
      if (state.autoTimer) clearTimeout(state.autoTimer);
      state.autoTimer = null;
      state.nextRefreshAt = 0;
      updateLiveStatus();
    }
  });

  window.addEventListener('cgn:module-show', loadWhenShown);
  if (window.CGN?.activeModule === 'bus_diagnostics') {
    renderSkeleton();
    loadAll(false);
    restartAutoTimer();
  }
})();
