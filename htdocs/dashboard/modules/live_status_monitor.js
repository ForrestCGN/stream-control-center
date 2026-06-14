(function(){
  const MODULE_ID = 'live_status_monitor';
  const PANEL_ID = 'liveStatusMonitorModule';
  const API = {
    status: '/api/live-status-monitor/status?raw=1',
    test: '/api/live-status-monitor/test',
    logs: '/api/live-status-monitor/logs?limit=25',
    streamStatus: '/api/stream-status/status?forceApi=1',
    twitchDebug: '/api/twitch/stream?login=forrestcgn&debug=1',
    streamState: '/api/twitch/events/stream-state',
    streamStateRefresh: '/api/twitch/events/stream-state?refresh=1',
    streamOverride: '/api/twitch/events/stream-state/override',
    streamOverrideClear: '/api/twitch/events/stream-state/clear-override'
  };
  const state = { status: null, logs: [], monitorState: null, streamState: null, loading: false, error: '', notice: '' };

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function bool(v){ return v === true || v === 1 || v === 'true'; }
  function yesNo(v){ if (v === 'unknown' || v === undefined || v === null || v === '') return 'UNBEKANNT'; return bool(v) || v === 'online' ? 'JA' : 'NEIN'; }
  function overrideTtl(){ const sel = document.getElementById('lsmOverrideTtl'); const n = Number(sel && sel.value || 600000); return Number.isFinite(n) && n > 0 ? n : 600000; }
  function streamState(){ return state.streamState || state.status?.sources?.eventSub?.data?.diagnostics?.streamState || state.status?.sources?.eventSub?.data?.streamState || null; }
  function fmtDurationUntil(v){ if (!v) return ''; const ms = Date.parse(String(v)) - Date.now(); if (!Number.isFinite(ms) || ms <= 0) return 'abgelaufen'; const m = Math.floor(ms / 60000); const s = Math.floor((ms % 60000) / 1000); return `${m}:${String(s).padStart(2,'0')} Min.`; }
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
      description: 'OBS, Twitch Events/Bus, Twitch und Stream-Status vergleichen und loggen.'
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
    try { state.status = await api(API.status); }
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
    try { const data = await api(API.logs); state.logs = data.logs || []; state.monitorState = data.state || null; }
    catch(err){ state.error = err.message || String(err); }
    if (renderAfter) render();
  }
  async function loadStreamState(renderAfter = true, refresh = false){
    try { const data = await api(refresh ? API.streamStateRefresh : API.streamState); state.streamState = data.streamState || data.diagnostics?.streamState || data; }
    catch(err){ state.error = err.message || String(err); }
    if (renderAfter) render();
  }
  async function postStreamOverride(payload, label){
    state.loading = true; state.error = ''; state.notice = ''; render();
    try {
      const data = await api(API.streamOverride, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload || {}) });
      state.streamState = data.streamState || null;
      state.notice = label || 'Stream-State Override gesetzt.';
      await loadStatus(false);
    } catch(err){ state.error = err.message || String(err); }
    finally { state.loading = false; render(); }
  }
  async function clearStreamOverride(){
    state.loading = true; state.error = ''; state.notice = ''; render();
    try {
      const data = await api(API.streamOverrideClear, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reason:'dashboard_clear_override' }) });
      state.streamState = data.streamState || null;
      state.notice = 'Manual Override wurde gelöscht.';
      await loadStatus(false);
    } catch(err){ state.error = err.message || String(err); }
    finally { state.loading = false; render(); }
  }
  async function loadAll(force){
    await Promise.all([loadStatus(false), loadLogs(false), loadStreamState(false, !!force)]);
    render();
  }
  function renderLogMeta(){
    const m = state.monitorState || {};
    const logger = (state.status && state.status.logger) || {};
    const checked = m.lastCheckedAt || state.status?.checkedAt || '';
    const logged = m.lastLoggedAt || logger.lastLoggedAt || '';
    const skipped = m.skippedUnchangedCount ?? logger.skippedUnchangedCount ?? 0;
    const samples = m.sampleCount ?? logger.sampleCount ?? 0;
    const mode = logger.historyMode || 'changes_only';
    return `<div class="lsm-log-meta glass">
      <span><strong>Letzte Prüfung:</strong> ${esc(fmtDateTime(checked) || '-')}</span>
      <span><strong>Letzte Änderung:</strong> ${esc(fmtDateTime(logged) || '-')}</span>
      <span><strong>Modus:</strong> ${esc(mode === 'all' ? 'alles loggen' : 'nur Änderungen')}</span>
      <span><strong>Checks:</strong> ${esc(samples)}</span>
      <span><strong>Unverändert übersprungen:</strong> ${esc(skipped)}</span>
    </div>`;
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
          ${badge('Twitch Events', d.eventSubConnected === true ? true : (d.eventSubLive || 'unknown'))}
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
  function renderStreamOverride(){
    const st = streamState() || {};
    const session = st.streamSession || {};
    const ov = st.manualOverride || {};
    const active = ov.active === true;
    const status = st.status || st.sessionStatus || (st.live ? 'live' : 'offline');
    return `<div class="lsm-override glass">
      <div class="lsm-override-head">
        <div>
          <h3>Stream-State Override</h3>
          <p>Nur für Tests: überschreibt OBS/Twitch temporär und nutzt die vorhandenen twitch_events-Routen.</p>
        </div>
        <div class="lsm-override-state ${active ? 'is-active':'is-idle'}">${active ? 'OVERRIDE AKTIV' : 'kein Override'}</div>
      </div>
      <div class="lsm-override-grid">
        <div><strong>Status</strong><span>${esc(status || '-')}</span></div>
        <div><strong>Live</strong><span>${st.live === true ? 'JA' : 'NEIN'}</span></div>
        <div><strong>Quelle</strong><span>${esc(st.provider || st.source || '-')}</span></div>
        <div><strong>läuft ab</strong><span>${esc(active ? (fmtDurationUntil(ov.expiresAt) || '-') : '-')}</span></div>
        <div><strong>StreamSession</strong><span>${esc(session.streamSessionId || st.streamSessionId || '-')}</span></div>
        <div><strong>StreamDay</strong><span>${esc(session.streamDayId || st.streamDayId || '-')}</span></div>
        <div><strong>Streamtag</strong><span>${esc(session.streamDateLabel || st.streamDateLabel || '-')}</span></div>
        <div><strong>Kalendertag</strong><span>${esc(session.calendarDay || st.calendarDay || '-')}</span></div>
      </div>
      <div class="lsm-override-controls">
        <label>TTL <select id="lsmOverrideTtl">
          <option value="300000">5 Minuten</option>
          <option value="600000" selected>10 Minuten</option>
          <option value="1800000">30 Minuten</option>
        </select></label>
        <button id="lsmOverridePendingBtn" type="button">OBS/Pending simulieren</button>
        <button id="lsmOverrideOnlineBtn" type="button">Online bestätigt simulieren</button>
        <button id="lsmOverrideOfflineBtn" type="button">Offline simulieren</button>
        <button id="lsmOverrideBandwidthBtn" type="button">Bandbreitentest</button>
        <button id="lsmOverrideClearBtn" type="button" class="danger">Override löschen</button>
      </div>
      <div class="lsm-override-note">⚠️ Manual Override ist nur für Tests. Solange aktiv, überschreibt er OBS/Twitch/Live-Status. Confirmed-Online erzeugt bewusst ein echtes Test-Online-Event.</div>
    </div>`;
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
          <p>Vergleicht OBS, Twitch /streams, Twitch Search, Stream-Status und Twitch-Events/Bus. Die Historie speichert standardmäßig nur Änderungen.</p>
        </div>
        <div class="lsm-actions">
          <button id="lsmRefreshBtn">Alle Quellen testen</button>
          <button id="lsmManualLogBtn">Test + Änderung prüfen</button>
          <button id="lsmLogsBtn">Historie laden</button>
        </div>
      </div>
      ${state.error ? `<div class="lsm-error">${esc(state.error)}</div>` : ''}
      ${state.loading ? '<div class="lsm-loading">Lade Live-Quellen...</div>' : ''}
      ${state.notice ? `<div class="lsm-notice">${esc(state.notice)}</div>` : ''}
      ${renderStreamOverride()}
      ${state.status ? renderDecision() : '<div class="glass lsm-empty">Noch keine Daten geladen.</div>'}
      <div class="lsm-section"><h3>Änderungshistorie</h3>${renderLogMeta()}${renderLogs()}</div>
      <div class="lsm-section"><h3>Rohdaten</h3>${renderRaw()}</div>
      <div class="lsm-links glass">
        <a href="/api/live-status-monitor/status?raw=1" target="_blank">Monitor Status</a>
        <a href="/api/live-status-monitor/logs?limit=25" target="_blank">Monitor Historie</a>
        <a href="/api/twitch/stream?login=forrestcgn&debug=1" target="_blank">Twitch Stream Debug</a>
        <a href="/api/stream-status/status?forceApi=1" target="_blank">Stream Status</a>
        <a href="/api/twitch/events/status" target="_blank">Twitch Events Status</a>
        <a href="/api/twitch/events/stream-state" target="_blank">Stream State</a>
        <a href="/api/twitch/events/stream-session" target="_blank">Stream Session</a>
      </div>
    `;
    panel.querySelector('#lsmRefreshBtn')?.addEventListener('click', () => loadAll(true));
    panel.querySelector('#lsmManualLogBtn')?.addEventListener('click', () => runTest());
    panel.querySelector('#lsmLogsBtn')?.addEventListener('click', () => loadLogs(true));
    panel.querySelector('#lsmOverridePendingBtn')?.addEventListener('click', () => postStreamOverride({ live:true, status:'pending', reason:'dashboard_manual_pending', ttlMs: overrideTtl() }, 'OBS/Pending wurde simuliert.'));
    panel.querySelector('#lsmOverrideOnlineBtn')?.addEventListener('click', () => postStreamOverride({ live:true, status:'live_confirmed', confirmed:true, forceConfirmed:true, reason:'dashboard_manual_online_confirmed', ttlMs: overrideTtl() }, 'Online bestätigt wurde simuliert.'));
    panel.querySelector('#lsmOverrideOfflineBtn')?.addEventListener('click', () => postStreamOverride({ live:false, status:'offline', reason:'dashboard_manual_offline', ttlMs: overrideTtl() }, 'Offline wurde simuliert.'));
    panel.querySelector('#lsmOverrideBandwidthBtn')?.addEventListener('click', () => postStreamOverride({ live:true, status:'bandwidth_test', reason:'dashboard_bandwidth_test', ttlMs: overrideTtl() }, 'Bandbreitentest wurde simuliert.'));
    panel.querySelector('#lsmOverrideClearBtn')?.addEventListener('click', () => clearStreamOverride());
  }

  ensurePanel();
  ensureNavigation();
  window.LiveStatusMonitorModule = { loadAll, render, state };
  window.addEventListener('cgn:module-show', ev => { if (ev.detail?.module === MODULE_ID) loadAll(true); });
  if (window.CGN?.activeModule === MODULE_ID) loadAll(true); else render();
})();
