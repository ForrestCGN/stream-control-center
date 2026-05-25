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

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }
  function panel(){ return document.getElementById(panelId); }
  function bool(v){ return v ? 'ja' : 'nein'; }
  function num(v){ return Number.isFinite(Number(v)) ? Number(v).toLocaleString('de-DE') : '0'; }
  function value(v, fallback = '-'){ return v === undefined || v === null || v === '' ? fallback : String(v); }
  function statusClass(status){
    const s = String(status || '').toLowerCase();
    if (s === 'ok') return 'ok';
    if (s === 'warning') return 'warning';
    if (s === 'error' || s === 'failed') return 'error';
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
            <p>Read-only Übersicht für Communication-, Sound- und Alert-Bus inklusive Alert/Sound-Korrelation.</p>
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
    const comparison = correlation.comparison || {};
    const warnings = Array.isArray(data.warnings) ? data.warnings : [];
    const errors = Array.isArray(data.errors) ? data.errors : [];

    content.innerHTML = `
      <div class="busdiag-grid busdiag-grid-top">
        ${card('Gesamtstatus', `
          <div class="busdiag-status-line">${badge(summary.status || (data.ok ? 'ok' : 'error'), summary.status || (data.ok ? 'ok' : 'error'))}<span>${esc(value(data.fetchedAt))}</span></div>
          <div class="busdiag-metrics">
            ${metric('Clients online', `${num(summary.connectedClients)} / ${num(summary.totalClients)}`)}
            ${metric('Sound Debug', bool(summary.soundDebugConnected), summary.soundDebugConnected ? 'verbunden' : 'Debug-Seite öffnen')}
            ${metric('Alert Debug', bool(summary.alertDebugConnected), summary.alertDebugConnected ? 'verbunden' : 'Debug-Seite öffnen')}
            ${metric('Read-only', bool(data.readOnly))}
          </div>
        `)}
        ${card('Schutz', `
          <div class="busdiag-metrics">
            ${metric('Flow touched', bool(data.flowTouched))}
            ${metric('Queue touched', bool(data.queueTouched))}
            ${metric('Sound touched', bool(data.soundSystemTouched))}
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
      ${renderClients(communication.statusBody?.clients || [])}
      ${renderRecent('Sound Events', sound.recentEvents || [])}
      ${renderRecent('Alert Events', alert.recentEvents || [])}
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
        </div>
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
              <span>${esc((client.capabilities || []).join(', ') || '-')}</span>
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
            <div class="busdiag-table-row">
              <span>${esc(event.at || '-')}</span>
              <span><strong>${esc(event.action || '-')}</strong><small>${esc(event.reason || '')}</small></span>
              <span>${esc(event.eventId || '-')}</span>
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
