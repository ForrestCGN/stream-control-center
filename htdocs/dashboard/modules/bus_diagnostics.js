(function(){
  const MODULE = 'BusDiagnosticsModule';
  const panelId = 'busDiagnosticsModule';
  const state = {
    loading: false,
    lastData: null,
    lastError: '',
    autoTimer: null,
    countdownTimer: null,
    autoRefresh: localStorage.getItem('cgn-busdiag-auto-refresh') === '1',
    refreshEveryMs: Number(localStorage.getItem('cgn-busdiag-refresh-ms') || 10000),
    nextRefreshAt: 0,
    visible: !document.hidden
  };

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }
  function panel(){ return document.getElementById(panelId); }
  function bool(v){ return v ? 'ja' : 'nein'; }
  function num(v){ return Number.isFinite(Number(v)) ? Number(v).toLocaleString('de-DE') : '0'; }
  function value(v, fallback = '-'){ return v === undefined || v === null || v === '' ? fallback : String(v); }
  function compactJson(obj){
    try { return JSON.stringify(obj || {}, null, 2); }
    catch (_) { return '{}'; }
  }
  function statusClass(status){
    const s = String(status || '').toLowerCase();
    if (s === 'ok') return 'ok';
    if (s === 'online') return 'ok';
    if (s === 'warning') return 'warning';
    if (s === 'stale') return 'warning';
    if (s === 'offline') return 'warning';
    if (s === 'error' || s === 'failed' || s === 'dead') return 'error';
    return 'neutral';
  }
  function badge(text, status){ return `<span class="busdiag-badge ${statusClass(status || text)}">${esc(text)}</span>`; }
  function metric(label, val, note, extraClass = ''){
    return `<div class="busdiag-metric ${esc(extraClass)}"><span>${esc(label)}</span><strong title="${esc(value(val))}">${esc(value(val))}</strong>${note ? `<small>${esc(note)}</small>` : ''}</div>`;
  }
  function card(title, body, extraClass = ''){
    return `<article class="busdiag-card ${extraClass}"><h3>${esc(title)}</h3>${body}</article>`;
  }

  function refreshLabel(){
    return state.autoRefresh ? `Auto: an (${Math.round(state.refreshEveryMs / 1000)}s)` : 'Auto: aus';
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
    if (state.autoRefresh && state.nextRefreshAt && state.visible) {
      const left = Math.max(0, Math.ceil((state.nextRefreshAt - Date.now()) / 1000));
      next = `${left}s`;
    } else if (state.autoRefresh && !state.visible) {
      next = 'pausiert';
    }
    live.innerHTML = `
      <span>${esc(status)}</span>
      <span>Letztes Laden: ${esc(last)}</span>
      <span>Auto: ${state.autoRefresh ? 'an' : 'aus'}</span>
      <span>Nächstes Laden: ${esc(next)}</span>
    `;
  }

  function renderSkeleton(){
    const root = panel();
    if (!root) return;
    root.innerHTML = `
      <div class="busdiag-shell">
        <div class="busdiag-hero glass">
          <div>
            <p class="busdiag-kicker">Communication Bus</p>
            <h2>Bus-Diagnose</h2>
            <p>Read-only Übersicht für Communication-, Sound-, Alert- und VIP-Bus inklusive Alert/Sound-Korrelation.</p>
          </div>
          <div class="busdiag-actions">
            <button type="button" data-busdiag-action="refresh">Status laden</button>
            <button type="button" class="secondary" data-busdiag-action="check">Check ausführen</button>
            <button type="button" class="secondary" data-busdiag-action="toggle-auto">${esc(refreshLabel())}</button>
            <select class="busdiag-select" data-busdiag-refresh-ms title="Auto-Refresh Intervall">
              <option value="5000">5s</option>
              <option value="10000">10s</option>
              <option value="30000">30s</option>
              <option value="60000">60s</option>
            </select>
            <a class="ghost-link" href="/public/tools/bus_diagnostics_dashboard.html" target="_blank">Standalone</a>
            <a class="ghost-link" href="/public/tools/sound_eventbus_debug.html" target="_blank">Sound Debug</a>
            <a class="ghost-link" href="/public/tools/alert_eventbus_debug.html" target="_blank">Alert Debug</a>
            <a class="ghost-link" href="/overlays/vip_sound_overlay_v2.html" target="_blank">VIP Overlay</a>
          </div>
        </div>
        <div class="busdiag-livebar" data-busdiag-live aria-live="polite"></div>
        <div class="busdiag-content" data-busdiag-content>
          <div class="busdiag-empty glass">Noch keine Daten geladen.</div>
        </div>
      </div>
    `;
    root.querySelector('[data-busdiag-action="refresh"]')?.addEventListener('click', () => loadAll(false));
    root.querySelector('[data-busdiag-action="check"]')?.addEventListener('click', () => loadAll(true));
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
    root.querySelector('[data-busdiag-action="toggle-auto"]')?.addEventListener('click', toggleAutoRefresh);
    restartAutoTimer();
    updateLiveStatus();
  }

  async function loadAll(check){
    if (state.loading) return;
    state.loading = true;
    state.lastError = '';
    setBusy(true);
    try {
      const data = await window.CGN.api(check ? '/api/bus-diagnostics/check' : '/api/bus-diagnostics/status');
      state.lastData = data;
      renderData(data);
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
    if (!state.autoRefresh) {
      state.nextRefreshAt = 0;
      updateLiveStatus();
      return;
    }
    state.countdownTimer = setInterval(updateLiveStatus, 1000);
    scheduleNextRefresh();
  }

  function scheduleNextRefresh(){
    if (state.autoTimer) clearTimeout(state.autoTimer);
    state.autoTimer = null;
    if (!state.autoRefresh || !state.visible) {
      state.nextRefreshAt = 0;
      updateLiveStatus();
      return;
    }
    state.nextRefreshAt = Date.now() + state.refreshEveryMs;
    state.autoTimer = setTimeout(() => loadAll(false), state.refreshEveryMs);
    updateLiveStatus();
  }

  function renderError(message){
    const content = panel()?.querySelector('[data-busdiag-content]');
    if (!content) return;
    updateLiveStatus();
    updateLiveStatus();
    content.innerHTML = `<div class="busdiag-error glass"><strong>Fehler beim Laden</strong><p>${esc(message)}</p></div>`;
  }

  function renderData(data){
    const content = panel()?.querySelector('[data-busdiag-content]');
    if (!content) return;
    const summary = data.summary || {};
    const communication = data.communication || {};
    const sound = data.soundEventBus || {};
    const alert = data.alertEventBus || {};
    const correlation = data.alertSoundCorrelation || {};
    const vip = data.vipStatus || {};
    const vipIntegration = data.vipIntegration || {};
    const comparison = correlation.comparison || {};
    const warnings = Array.isArray(data.warnings) ? data.warnings : [];
    const errors = Array.isArray(data.errors) ? data.errors : [];
    const busClients = communication.statusBody?.clients || [];

    content.innerHTML = `
      <div class="busdiag-grid busdiag-grid-top">
        ${card('Gesamtstatus', `
          <div class="busdiag-status-line">${badge(summary.status || (data.ok ? 'ok' : 'error'), summary.status || (data.ok ? 'ok' : 'error'))}<span>${esc(value(data.fetchedAt))}</span></div>
          <div class="busdiag-metrics">
            ${metric('Clients online', `${num(summary.connectedClients)} / ${num(summary.totalClients)}`)}
            ${metric('Sound Debug', bool(summary.soundDebugConnected), summary.soundDebugConnected ? 'verbunden' : 'Debug-Seite öffnen')}
            ${metric('Alert Debug', bool(summary.alertDebugConnected), summary.alertDebugConnected ? 'verbunden' : 'Debug-Seite öffnen')}
            ${metric('VIP Overlay', bool(summary.vipOverlayConnected), summary.vipOverlayConnected ? 'verbunden' : 'Overlay öffnen')}
            ${metric('Read-only', bool(data.readOnly))}
          </div>
        `)}
        ${card('Schutz', `
          <div class="busdiag-metrics">
            ${metric('Flow touched', bool(data.flowTouched))}
            ${metric('Queue touched', bool(data.queueTouched))}
            ${metric('Sound touched', bool(data.soundSystemTouched))}
            ${metric('VIP touched', bool(data.vipSystemTouched))}
            ${metric('Overlay touched', bool(data.overlayTouched))}
          </div>
        `)}
      </div>

      <div class="busdiag-grid">
        ${card('Communication Bus', `
          <div class="busdiag-status-line">${badge(communication.ok ? 'ok' : 'error', communication.ok ? 'ok' : 'error')}<span>${esc(value(communication.module))} ${esc(value(communication.version))}</span></div>
          <div class="busdiag-metrics">
            ${metric('Fetch', communication.fetchOk ? 'ok' : 'fehler')}
            ${metric('Clients', `${num(summary.connectedClients)} / ${num(summary.totalClients)}`)}
            ${metric('Emitted', communication.statusBody?.stats?.emitted ?? '-')}
            ${metric('Delivered', communication.statusBody?.stats?.delivered ?? '-')}
          </div>
        `)}
        ${card('Sound EventBus', `
          <div class="busdiag-status-line">${badge(sound.ok ? 'ok' : 'error', sound.ok ? 'ok' : 'error')}<span>${esc(value(sound.module))} ${esc(value(sound.version))}</span></div>
          <div class="busdiag-metrics">
            ${metric('Capability', sound.capability || '-', '', 'busdiag-metric-code busdiag-metric-wide')}
            ${metric('Emitted', summary.soundEmitted)}
            ${metric('Errors', summary.soundErrors)}
            ${metric('Last action', summary.soundLastAction || '-')}
          </div>
        `)}
        ${card('Alert EventBus', `
          <div class="busdiag-status-line">${badge(alert.ok ? 'ok' : 'error', alert.ok ? 'ok' : 'error')}<span>${esc(value(alert.module))} ${esc(value(alert.version))}</span></div>
          <div class="busdiag-metrics">
            ${metric('Capability', alert.capability || '-', '', 'busdiag-metric-code busdiag-metric-wide')}
            ${metric('Emitted', summary.alertEmitted)}
            ${metric('Errors', summary.alertErrors)}
            ${metric('Last action', summary.alertLastAction || '-')}
          </div>
        `)}
        ${card('VIP-System', `
          <div class="busdiag-status-line">${badge(vip.ok ? 'ok' : 'warning', vip.ok ? 'ok' : 'warning')}<span>${esc(value(vip.module || 'vip_sound_overlay'))} ${esc(value(summary.vipVersion || vip.version))}</span></div>
          <div class="busdiag-metrics">
            ${metric('Overlay Client', bool(summary.vipOverlayConnected), summary.vipOverlayConnected ? 'Bus verbunden' : 'nicht verbunden')}
            ${metric('Status API', vip.fetchOk ? 'ok' : 'fehler')}
            ${metric('Phase', summary.vipPhase || vip.phase || '-')}
            ${metric('Queue', summary.vipQueuedCount ?? vip.queuedCount ?? 0)}
            ${metric('Aktiv', bool(summary.vipActive))}
            ${metric('Sichtbar', bool(summary.vipVisible))}
          </div>
        `)}
        ${card('VIP Integration', `
          <div class="busdiag-status-line">${badge(vipIntegration.ok ? 'ok' : 'warning', vipIntegration.ok ? 'ok' : 'warning')}<span>${esc(value(vipIntegration.module || 'vip_sound_overlay'))}</span></div>
          <div class="busdiag-metrics">
            ${metric('Fetch', vipIntegration.fetchOk ? 'ok' : 'fehler')}
            ${metric('DB', bool(summary.vipDbInitialized))}
            ${metric('Errors', summary.vipIntegrationErrors ?? 0)}
            ${metric('Client Event', summary.vipClientLastEvent || '-')}
          </div>
        `)}
        ${card('Alert/Sound-Korrelation', `
          <div class="busdiag-status-line">${badge(correlation.ok ? 'ok' : 'error', correlation.ok ? 'ok' : 'error')}<span>${esc(value(correlation.feature))}</span></div>
          <div class="busdiag-metrics">
            ${metric('Matched', summary.correlationMatched ?? comparison.matched)}
            ${metric('Unmatched', summary.correlationUnmatched ?? comparison.unmatched)}
            ${metric('Alert Rows', comparison.alertRows ?? '-')}
            ${metric('Sound Rows', comparison.soundRows ?? '-')}
          </div>
        `)}
      </div>

      ${renderWarnings(warnings, errors)}
      ${renderQuickActions(summary)}
      ${renderCorrelationDetails(comparison)}
      ${renderOverlayClients(busClients)}
      ${renderClients(busClients)}
      ${renderRecent('Sound Events', sound.recentEvents || [])}
      ${renderRecent('Alert Events', alert.recentEvents || [])}
      ${renderRawDiagnostics(data)}
    `;
  }

  function renderWarnings(warnings, errors){
    if (!warnings.length && !errors.length) return '';
    return `
      <section class="busdiag-card busdiag-wide">
        <h3>Hinweise</h3>
        <div class="busdiag-list">
          ${errors.map(e => `<div class="busdiag-row error"><strong>Error</strong><span>${esc(e)}</span></div>`).join('')}
          ${warnings.map(w => `<div class="busdiag-row warning"><strong>Warning</strong><span>${esc(w)}</span></div>`).join('')}
        </div>
      </section>
    `;
  }

  function renderQuickActions(summary){
    return `
      <section class="busdiag-card busdiag-wide busdiag-help">
        <h3>Schnellzugriff</h3>
        <div class="busdiag-quick-grid">
          <a href="/public/tools/sound_eventbus_debug.html" target="_blank"><strong>Sound Debug öffnen</strong><span>${summary.soundDebugConnected ? 'aktuell verbunden' : 'nicht verbunden'}</span></a>
          <a href="/public/tools/alert_eventbus_debug.html" target="_blank"><strong>Alert Debug öffnen</strong><span>${summary.alertDebugConnected ? 'aktuell verbunden' : 'nicht verbunden'}</span></a>
          <a href="/public/tools/bus_diagnostics_dashboard.html" target="_blank"><strong>Standalone Bus-Diagnose</strong><span>separate Diagnoseansicht</span></a>
          <a href="/overlays/vip_sound_overlay_v2.html" target="_blank"><strong>VIP Overlay öffnen</strong><span>${summary.vipOverlayConnected ? 'Bus-Client verbunden' : 'Overlay nicht verbunden'}</span></a>
          <a href="/overlays/_overlay-bus-test.html?debug=1" target="_blank"><strong>Overlay Bus Test</strong><span>Testclient öffnen</span></a>
        </div>
      </section>
    `;
  }


  function renderCapabilityChips(capabilities){
    const list = Array.isArray(capabilities) ? capabilities : [];
    if (!list.length) return '-';
    return list.map(cap => `<span class="busdiag-chip">${esc(cap)}</span>`).join('');
  }

  function getOverlayClients(clients){
    const list = Array.isArray(clients) ? clients : [];
    return list.filter(client => {
      if (!client) return false;
      const type = String(client.type || '').toLowerCase();
      const id = String(client.id || '').toLowerCase();
      return type === 'overlay' || id.startsWith('overlay:');
    });
  }

  function ageText(value){
    if (!value) return '-';
    const time = Date.parse(value);
    if (!Number.isFinite(time)) return '-';
    const diff = Math.max(0, Date.now() - time);
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ${sec % 60}s`;
    const hours = Math.floor(min / 60);
    return `${hours}h ${min % 60}m`;
  }

  function clientStatusLabel(client){
    const status = String(client?.status || '').trim();
    if (status) return status;
    return client && client.connected ? 'online' : 'offline';
  }

  function renderOverlayClients(clients){
    const overlays = getOverlayClients(clients);
    if (!overlays.length) {
      return `
        <section class="busdiag-card busdiag-wide busdiag-overlay-card">
          <h3>Overlay-Clients</h3>
          <div class="busdiag-empty-inline">Keine Overlay-Clients im Communication Bus registriert.</div>
        </section>
      `;
    }

    const counts = overlays.reduce((acc, client) => {
      const status = clientStatusLabel(client).toLowerCase();
      if (status === 'online') acc.online += 1;
      else if (status === 'stale') acc.stale += 1;
      else if (status === 'dead') acc.dead += 1;
      else acc.offline += 1;
      return acc;
    }, { online: 0, stale: 0, offline: 0, dead: 0 });

    return `
      <section class="busdiag-card busdiag-wide busdiag-overlay-card">
        <h3>Overlay-Clients</h3>
        <div class="busdiag-overlay-summary">
          ${badge(`${counts.online} online`, counts.online ? 'ok' : 'neutral')}
          ${badge(`${counts.stale} stale`, counts.stale ? 'warning' : 'neutral')}
          ${badge(`${counts.offline} offline`, counts.offline ? 'warning' : 'neutral')}
          ${badge(`${counts.dead} dead`, counts.dead ? 'error' : 'neutral')}
        </div>
        <div class="busdiag-table busdiag-table-overlays">
          <div class="busdiag-table-head"><span>Overlay</span><span>Status</span><span>Heartbeat</span><span>Capabilities</span></div>
          ${overlays.map(client => {
            const status = clientStatusLabel(client);
            return `
              <div class="busdiag-table-row">
                <span><strong>${esc(client.name || client.id || '-')}</strong><small>${esc(client.id || '-')} / ${esc(client.module || '-')}</small></span>
                <span>${badge(status, status)}<small>${client.connected ? 'verbunden' : 'getrennt'}</small></span>
                <span><strong>${esc(ageText(client.lastHeartbeatAt || client.lastSeenAt))}</strong><small>${esc(client.lastHeartbeatAt || client.lastSeenAt || '-')}</small></span>
                <span class="busdiag-cap-list">${renderCapabilityChips(client.capabilities || [])}</span>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  function renderCorrelationDetails(comparison){
    const matches = Array.isArray(comparison.matches) ? comparison.matches : [];
    const unmatched = Array.isArray(comparison.unmatchedAlerts) ? comparison.unmatchedAlerts : [];
    if (!matches.length && !unmatched.length) return '';
    return `
      <section class="busdiag-card busdiag-wide">
        <h3>Korrelation Details</h3>
        <div class="busdiag-correlation-grid">
          ${matches.map(match => `
            <div class="busdiag-correlation-row ok">
              <div><strong>${esc(match.eventUid || '-')}</strong><small>${esc(match.bundleId || '-')}</small></div>
              <div><span>Matched by</span><strong>${esc(match.matchedBy || '-')}</strong></div>
              <div><span>Sound Action</span><strong>${esc(match.soundLastAction || '-')}</strong></div>
              <div><span>Errors</span><strong>${esc(match.soundErrorCount ?? 0)}</strong></div>
            </div>
          `).join('')}
          ${unmatched.map(row => `
            <div class="busdiag-correlation-row warning">
              <div><strong>${esc(row.eventUid || '-')}</strong><small>${esc(row.bundleId || '-')}</small></div>
              <div><span>Status</span><strong>unmatched</strong></div>
              <div><span>Phase</span><strong>${esc(row.phase || '-')}</strong></div>
              <div><span>Hinweis</span><strong>prüfen</strong></div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderRawDiagnostics(data){
    return `
      <section class="busdiag-card busdiag-wide busdiag-raw-card">
        <h3>Rohdaten</h3>
        <p class="busdiag-muted">Nur Anzeige. Hilft beim Weitergeben von Diagnoseausgaben, ohne zusätzliche PowerShell-Abfragen.</p>
        <details class="busdiag-details"><summary>Komplette Diagnose anzeigen</summary><pre>${esc(compactJson(data))}</pre></details>
      </section>
    `;
  }

  function renderClients(clients){
    if (!clients.length) return '';
    return `
      <section class="busdiag-card busdiag-wide">
        <h3>Bus-Clients</h3>
        <div class="busdiag-table">
          <div class="busdiag-table-head"><span>ID</span><span>Modul</span><span>Status</span><span>Capabilities</span></div>
          ${clients.map(client => `
            <div class="busdiag-table-row">
              <span><strong>${esc(client.id)}</strong><small>${esc(client.type || '-')} / ${esc(client.mode || '-')}</small></span>
              <span>${esc(client.module || '-')}</span>
              <span>${badge(client.connected ? 'online' : 'offline', client.connected ? 'ok' : 'warning')}</span>
              <span class="busdiag-cap-list">${renderCapabilityChips(client.capabilities || [])}</span>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderRecent(title, events){
    if (!events.length) return '';
    return `
      <section class="busdiag-card busdiag-wide">
        <h3>${esc(title)}</h3>
        <div class="busdiag-table busdiag-table-events">
          <div class="busdiag-table-head"><span>Zeit</span><span>Action</span><span>Event</span><span>Delivered</span></div>
          ${events.slice(0, 10).map(event => `
            <div class="busdiag-table-row busdiag-event-row">
              <span>${esc(event.at || '-')}</span>
              <span><strong>${esc(event.action || '-')}</strong><small>${esc(event.reason || '')}</small></span>
              <span><strong>${esc(event.eventId || '-')}</strong><details class="busdiag-inline-details"><summary>Details</summary><pre>${esc(compactJson(event))}</pre></details></span>
              <span>${esc(event.deliveredCount ?? '-')}</span>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  function loadWhenShown(event){
    if (event.detail?.module !== 'bus_diagnostics') return;
    state.visible = !document.hidden;
    if (!panel()?.dataset.rendered) {
      renderSkeleton();
      panel().dataset.rendered = '1';
    }
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
