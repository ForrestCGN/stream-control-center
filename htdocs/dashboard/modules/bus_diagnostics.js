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
    autoTimer: null,
    countdownTimer: null,
    autoRefresh: localStorage.getItem('cgn-busdiag-auto-refresh') === '1',
    refreshEveryMs: Number(localStorage.getItem('cgn-busdiag-refresh-ms') || 10000),
    nextRefreshAt: 0,
    visible: !document.hidden
  };

  const TABS = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'clients', label: 'Clients' },
    { id: 'events', label: 'Events & ACKs' },
    { id: 'integrations', label: 'Integrationen' },
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

  async function loadAll(check){
    if (state.loading) return;
    state.loading = true;
    state.lastError = '';
    setBusy(true);
    try {
      const data = await window.CGN.api(check ? '/api/bus-diagnostics/check' : '/api/bus-diagnostics/status');
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
    root.querySelectorAll('[data-busdiag-action="refresh"],[data-busdiag-action="check"]').forEach(btn => { btn.disabled = !!busy; });
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
    const renderers = { overview: renderOverview, clients: renderClientsTab, events: renderEventsTab, integrations: renderIntegrationsTab, recovery: renderRecoveryTab, issues: renderIssuesTab, config: renderConfigTab, raw: renderRawTab };
    content.innerHTML = (renderers[state.activeTab] || renderOverview)();
    bindConfigActions();
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


  function renderRecoveryTab(){
    const data = getStatus();
    const summary = getSummary();
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

    return `
      <div class="busdiag-grid busdiag-grid-top">
        ${card('Recovery-Strategie', `<div class="busdiag-status-line">${badge(stateLabel, status)}<span>${esc(recovery.mode || summary.recoveryStrategyMode || 'read_only')}</span></div><div class="busdiag-metrics">${metric('State', stateLabel, '', 'busdiag-metric-code busdiag-metric-wide')}${metric('Severity', recovery.severity || '-')}${metric('Next Action', recovery.nextAction || '-', '', 'busdiag-metric-code')}${metric('Automation', bool(recovery.automationEnabled), 'muss aus bleiben')}</div>`)}
        ${card('Sicherheitsstatus', `<div class="busdiag-status-line">${badge(safetyStatus === 'ok' ? 'ok' : 'prüfen', safetyStatus)}<span>${esc(safetyText)}</span></div><div class="busdiag-metrics">${metric('Read-only', bool(data.readOnly && recovery.readOnly !== false))}${metric('Productive Actions', bool(data.productiveActions))}${metric('Flow touched', bool(data.flowTouched))}${metric('Overlay touched', bool(data.overlayTouched))}</div>`)}
      </div>
      <div class="busdiag-grid">
        ${card('Recovery-Quelle', `<div class="busdiag-list">${sourceRows.map(row => `<div class="busdiag-row"><strong>${esc(row[0])}</strong><span class="busdiag-chip">${esc(row[1])}</span></div>`).join('')}</div>`, 'busdiag-wide')}
        ${card('Blockierte Aktionen', blockedActions.length ? `<div class="busdiag-list">${blockedActions.map(action => `<div class="busdiag-row warning"><strong>blockiert</strong><span>${esc(action)}</span></div>`).join('')}</div>` : '<p class="busdiag-muted">Keine blockierten Aktionen gemeldet.</p>')}
        ${card('Erlaubte Aktionen', allowedActions.length ? `<div class="busdiag-list">${allowedActions.map(action => `<div class="busdiag-row"><strong>erlaubt</strong><span>${esc(action)}</span></div>`).join('')}</div>` : '<p class="busdiag-muted">Keine aktiven Aktionen erlaubt.</p>')}
        ${card('Gründe', reasons.length ? `<div class="busdiag-list">${reasons.map(reason => `<div class="busdiag-row"><strong>Grund</strong><span>${esc(reason)}</span></div>`).join('')}</div>` : '<p class="busdiag-muted">Keine Gründe gemeldet.</p>')}
        ${card('Simulation-Harness', `<div class="busdiag-status-line">${badge('read-only', 'ok')}<span>Anzeige nur Diagnose, keine Test-Buttons</span></div><div class="busdiag-metrics">${metric('Status Route', '/api/bus-diagnostics/recovery-simulation/status', '', 'busdiag-metric-code busdiag-metric-wide')}${metric('Test Trigger', 'nicht im Dashboard', 'bewusst nicht auslösbar')}${metric('Auto-Recovery', 'aus')}${metric('Replay', 'aus')}</div>`, 'busdiag-wide')}
      </div>
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
