(function(){
  const MODULE_ID = 'live_status_monitor';
  const PANEL_ID = 'liveStatusMonitorModule';
  const API = {
    status: '/api/live-status-monitor/status?log=1',
    test: '/api/live-status-monitor/test',
    logs: '/api/live-status-monitor/logs?limit=150',
    streamStatus: '/api/stream-status/status?forceApi=1',
    twitchDebug: '/api/twitch/stream?login=forrestcgn&debug=1'
  };
  const state = { status: null, logs: [], loading: false, error: '' };

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function bool(v){ return v === true || v === 1 || v === 'true'; }
  function yesNo(v){ if (v === 'unknown' || v === undefined || v === null || v === '') return 'UNBEKANNT'; return bool(v) || v === 'online' ? 'JA' : 'NEIN'; }
  function badge(label, value, kind){
    const cls = kind || (value === true || value === 'online' ? 'ok' : (value === 'unknown' ? 'warn' : 'off'));
    return `<span class="lsm-badge lsm-badge-${cls}"><strong>${esc(label)}</strong><em>${esc(yesNo(value))}</em></span>`;
  }
  function fmtTime(v){
    if (!v) return '';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  }
  function fmtDateTime(v){
    if (!v) return '';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString('de-DE');
  }
  function jsonBlock(title, value){
    return `<details class="lsm-raw"><summary>${esc(title)}</summary><pre>${esc(JSON.stringify(value || {}, null, 2))}</pre></details>`;
  }
  function ensurePanel(){
    let panel = document.getElementById(PANEL_ID);
    if (panel) return panel;
    const main = document.querySelector('main.main') || document.querySelector('.main') || document.body;
    panel = document.createElement('section');
    panel.id = PANEL_ID;
    panel.className = 'dashboard-module live-status-monitor-admin';
    panel.dataset.modulePanel = MODULE_ID;
    panel.hidden = true;
    main.appendChild(panel);
    return panel;
  }
  function ensureNavigation(){
    if (!window.CGN) return;
    window.CGN.modules[MODULE_ID] = {
      title: 'Live-Status Monitor',
      panelId: PANEL_ID,
      group: 'admin',
      overlayLink: '',
      reload(){ return window.LiveStatusMonitorModule?.loadAll?.(true); }
    };
    window.CGN.moduleCatalog[MODULE_ID] = {
      label: 'Live-Status', icon: '📡', enabled: true,
      description: 'OBS, Twitch, EventSub und Stream-Status vergleichen und loggen.'
    };
    if (window.CGN.sections?.admin && !window.CGN.sections.admin.items.includes(MODULE_ID)) {
      const items = window.CGN.sections.admin.items;
      const idx = items.indexOf('diagnostics');
      if (idx >= 0) items.splice(idx, 0, MODULE_ID); else items.push(MODULE_ID);
    }
    if (Array.isArray(window.CGN.favorites) && !window.CGN.favorites.includes(MODULE_ID)) window.CGN.favorites.push(MODULE_ID);

    const nav = document.getElementById('mainNav');
    if (nav && !nav.querySelector(`[data-module="${MODULE_ID}"]`)) {
      let block = Array.from(nav.querySelectorAll('.nav-section-block')).find(b => /Admin/i.test(b.textContent || '')) || nav.querySelector('.nav-section-block:last-child');
      const btn = document.createElement('button');
      btn.className = 'nav-item';
      btn.dataset.module = MODULE_ID;
      btn.innerHTML = '<span class="nav-icon">📡</span><span class="nav-label"><strong>Live-Status</strong><small>OBS/Twitch/EventSub</small></span>';
      btn.addEventListener('click', () => window.CGN.setActiveModule(MODULE_ID));
      block?.appendChild(btn);
    }
  }
  async function api(path, options){
    if (window.CGN?.api) return window.CGN.api(path, options || {});
    const res = await fetch(path, options || {});
    const data = await res.json();
    if (!res.ok || data.ok === false) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }
  async function loadStatus(log){
    state.loading = true; state.error = ''; render();
    try { state.status = await api(log ? API.status : API.status.replace('?log=1','?raw=1')); }
    catch(err){ state.error = err.message || String(err); }
    finally { state.loading = false; render(); }
  }
  async function runTest(){
    state.loading = true; state.error = ''; render();
    try { state.status = await api(API.test, { method:'POST', body:'{}' }); await loadLogs(false); }
    catch(err){ state.error = err.message || String(err); }
    finally { state.loading = false; render(); }
  }
  async function loadLogs(renderAfter = true){
    try { const data = await api(API.logs); state.logs = data.logs || []; }
    catch(err){ state.error = err.message || String(err); }
    if (renderAfter) render();
  }
  async function loadAll(force){
    await Promise.all([loadStatus(false), loadLogs(false)]);
    render();
  }
  function renderDecision(){
    const s = state.status || {};
    const d = s.decision || {};
    const p = s.parsed || {};
    const warnings = Array.isArray(d.warnings) ? d.warnings : [];
    return `
      <div class="lsm-hero glass">
        <div>
          <div class="lsm-kicker">Projekt-Live</div>
          <div class="lsm-live ${d.effectiveLive ? 'is-live':'is-off'}">${d.effectiveLive ? 'ONLINE' : 'OFFLINE'}</div>
          <p>${esc(d.sourceSummary || 'keine Quelle')} · Confidence: <strong>${esc(d.confidence || 'unknown')}</strong></p>
        </div>
        <div class="lsm-badges">
          ${badge('OBS sendet', d.obsStreaming)}
          ${badge('EventSub', d.eventSubLive || 'unknown')}
          ${badge('Twitch /streams', d.twitchStreamsLive)}
          ${badge('Twitch Search', d.twitchSearchLive)}
          ${badge('stream_status', d.streamStatusLive)}
        </div>
      </div>
      <div class="lsm-grid">
        <div class="lsm-card glass"><strong>Szene</strong><span>${esc(d.sceneName || p.obs?.currentScene || '-')}</span></div>
        <div class="lsm-card glass"><strong>Spiel</strong><span>${esc(d.gameName || '-')}</span></div>
        <div class="lsm-card glass"><strong>Titel</strong><span>${esc(d.title || '-')}</span></div>
        <div class="lsm-card glass"><strong>Stream-ID</strong><span>${esc(d.streamId || '-')}</span></div>
      </div>
      ${warnings.length ? `<div class="lsm-warnings glass"><strong>Warnungen</strong>${warnings.map(w => `<div>⚠️ <b>${esc(w.key)}</b>: ${esc(w.message)}</div>`).join('')}</div>` : `<div class="lsm-okline glass">Keine Abweichungen in der aktuellen Auswertung.</div>`}
    `;
  }
  function renderLogs(){
    const rows = state.logs || [];
    if (!rows.length) return '<p class="muted">Noch keine Logs vorhanden.</p>';
    return `<div class="lsm-table-wrap"><table class="lsm-table"><thead><tr><th>Zeit</th><th>Live</th><th>OBS</th><th>EventSub</th><th>/streams</th><th>Search</th><th>Status</th><th>Quelle</th><th>Warnungen</th></tr></thead><tbody>${rows.map(r => `
      <tr>
        <td>${esc(fmtTime(r.created_at))}</td>
        <td>${r.effective_live ? '✅' : '—'}</td>
        <td>${r.obs_streaming ? '✅' : '—'}</td>
        <td>${esc(r.eventsub_live || 'unknown')}</td>
        <td>${r.twitch_streams_live ? '✅' : '—'}</td>
        <td>${r.twitch_search_live ? '✅' : '—'}</td>
        <td>${r.stream_status_live ? '✅' : '—'}</td>
        <td>${esc(r.source_summary || '')}</td>
        <td>${Array.isArray(r.warnings) && r.warnings.length ? esc(r.warnings.map(w => w.key).join(', ')) : ''}</td>
      </tr>`).join('')}</tbody></table></div>`;
  }
  function renderRaw(){
    const s = state.status || {};
    return `<div class="lsm-raw-grid">
      ${jsonBlock('Auswertung / parsed', { decision: s.decision, parsed: s.parsed, logger: s.logger })}
      ${jsonBlock('OBS raw', s.sources?.obs?.data)}
      ${jsonBlock('Twitch stream raw', s.sources?.twitchStream?.data)}
      ${jsonBlock('Twitch summary raw', s.sources?.twitchSummary?.data)}
      ${jsonBlock('Stream status raw', s.sources?.streamStatus?.data)}
      ${jsonBlock('EventSub raw', s.sources?.eventSub?.data || s.sources?.eventSub)}
    </div>`;
  }
  function render(){
    const panel = ensurePanel();
    panel.innerHTML = `
      <div class="lsm-head">
        <div>
          <h2>Live-Status Monitor</h2>
          <p>Vergleicht OBS, Twitch /streams, Twitch Search, Stream-Status und EventSub. Automatisches Logging läuft serverseitig.</p>
        </div>
        <div class="lsm-actions">
          <button id="lsmRefreshBtn">Alle Quellen testen</button>
          <button id="lsmManualLogBtn">Test + Log</button>
          <button id="lsmLogsBtn">Logs laden</button>
        </div>
      </div>
      ${state.error ? `<div class="lsm-error">${esc(state.error)}</div>` : ''}
      ${state.loading ? '<div class="lsm-loading">Lade Live-Quellen...</div>' : ''}
      ${state.status ? renderDecision() : '<div class="glass lsm-empty">Noch keine Daten geladen.</div>'}
      <div class="lsm-section"><h3>Log der letzten Messungen</h3>${renderLogs()}</div>
      <div class="lsm-section"><h3>Rohdaten</h3>${renderRaw()}</div>
      <div class="lsm-links glass">
        <a href="/api/live-status-monitor/status?log=1" target="_blank">Monitor Status</a>
        <a href="/api/live-status-monitor/logs?limit=200" target="_blank">Monitor Logs</a>
        <a href="/api/twitch/stream?login=forrestcgn&debug=1" target="_blank">Twitch Stream Debug</a>
        <a href="/api/stream-status/status?forceApi=1" target="_blank">Stream Status</a>
      </div>
    `;
    panel.querySelector('#lsmRefreshBtn')?.addEventListener('click', () => loadStatus(true));
    panel.querySelector('#lsmManualLogBtn')?.addEventListener('click', () => runTest());
    panel.querySelector('#lsmLogsBtn')?.addEventListener('click', () => loadLogs(true));
  }

  ensurePanel();
  ensureNavigation();
  window.LiveStatusMonitorModule = { loadAll, render, state };
  window.addEventListener('cgn:module-show', ev => { if (ev.detail?.module === MODULE_ID) loadAll(true); });
  if (window.CGN?.activeModule === MODULE_ID) loadAll(true); else render();
})();
