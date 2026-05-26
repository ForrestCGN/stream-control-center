window.ShoutoutModule = (function(){
  'use strict';

  const API = {
    status: '/api/clip-shoutout/status',
    queue: '/api/clip-shoutout/queue',
    timeline: '/api/clip-shoutout/timeline?limit=80',
    run: '/api/clip-shoutout/run',
    displayRemove: '/api/clip-shoutout/display-queue/remove',
    displayRetry: '/api/clip-shoutout/display-queue/retry',
    officialRemove: '/api/clip-shoutout/queue/remove',
    officialRetry: '/api/clip-shoutout/queue/retry',
    streamStatus: '/api/stream-status/status'
  };

  let root = null;
  let refreshTimer = null;
  const state = {
    status: null,
    queue: null,
    timeline: null,
    streamStatus: null,
    loading: false,
    error: '',
    notice: '',
    autoRefresh: true
  };

  function esc(v){
    return window.CGN?.esc
      ? window.CGN.esc(v)
      : String(v ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function registerDashboardModule(){
    if (!window.CGN) return;

    window.CGN.modules = window.CGN.modules || {};
    window.CGN.moduleCatalog = window.CGN.moduleCatalog || {};
    window.CGN.sections = window.CGN.sections || {};
    window.CGN.favorites = Array.isArray(window.CGN.favorites) ? window.CGN.favorites : [];

    window.CGN.modules.shoutout = {
      title: 'Shoutout-System',
      panelId: 'shoutoutModule',
      group: 'community',
      overlayLink: '',
      reload(){ return window.ShoutoutModule?.loadAll?.(true); }
    };

    window.CGN.moduleCatalog.shoutout = {
      label: 'Shoutout-System',
      icon: '📣',
      enabled: true,
      description: 'Video-Shoutouts, Display-Queue, offizieller Twitch-Shoutout und Live-Gate.'
    };

    const community = window.CGN.sections.community;
    if (community && Array.isArray(community.items) && !community.items.includes('shoutout')) {
      const after = community.items.indexOf('commands');
      if (after >= 0) community.items.splice(after + 1, 0, 'shoutout');
      else community.items.push('shoutout');
    }

    if (!window.CGN.favorites.includes('shoutout')) {
      const after = window.CGN.favorites.indexOf('commands');
      if (after >= 0) window.CGN.favorites.splice(after + 1, 0, 'shoutout');
      else window.CGN.favorites.push('shoutout');
    }
  }

  function fmtDate(v){
    if (!v) return '<span class="shoutout-muted">-</span>';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return esc(v);
    return esc(d.toLocaleString('de-DE'));
  }

  function fmtMs(ms){
    const n = Math.max(0, Number(ms || 0));
    if (!n) return '0s';
    const s = Math.ceil(n / 1000);
    const m = Math.floor(s / 60);
    const rest = s % 60;
    return m > 0 ? `${m}m ${rest}s` : `${rest}s`;
  }

  function boolBadge(value, yes = 'Ja', no = 'Nein'){
    return `<span class="shoutout-badge ${value ? 'ok' : 'warn'}">${esc(value ? yes : no)}</span>`;
  }

  function statusBadge(value){
    const raw = String(value || '').toLowerCase();
    let cls = 'neutral';
    if (['active','sent','done','ok','live'].includes(raw)) cls = 'ok';
    else if (['queued','waiting','grace'].includes(raw)) cls = 'warn';
    else if (['failed','bad','error','removed'].includes(raw)) cls = 'bad';
    return `<span class="shoutout-badge ${cls}">${esc(value || '-')}</span>`;
  }

  function displayRows(){
    const q = state.queue?.displayQueue || state.status?.displayQueue || {};
    return Array.isArray(q.queue) ? q.queue : [];
  }

  function officialRows(){
    const q = state.queue?.officialQueue || state.status?.officialQueue || {};
    return Array.isArray(q.queue) ? q.queue : [];
  }

  function timelineRows(){
    return Array.isArray(state.timeline?.items) ? state.timeline.items : [];
  }

  async function api(path, options = {}){
    if (window.CGN?.api) return window.CGN.api(path, options);
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.error || data.message || `HTTP ${res.status}`);
    return data;
  }

  async function loadAll(force){
    root = document.getElementById('shoutoutModule');
    if (!root) return;
    if (state.loading && !force) return;
    state.loading = true;
    state.error = '';
    render();
    try {
      const [status, queue, timeline, streamStatus] = await Promise.all([
        api(API.status),
        api(API.queue),
        api(API.timeline),
        api(API.streamStatus).catch(err => ({ ok: false, error: err.message }))
      ]);
      state.status = status;
      state.queue = queue;
      state.timeline = timeline;
      state.streamStatus = streamStatus;
    } catch (err) {
      state.error = err && err.message ? err.message : String(err);
    } finally {
      state.loading = false;
      render();
      scheduleRefresh();
    }
  }

  function scheduleRefresh(){
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = null;
    if (!state.autoRefresh) return;
    refreshTimer = setTimeout(() => {
      if (!document.getElementById('shoutoutModule')?.hidden) loadAll(false);
      else scheduleRefresh();
    }, 5000);
  }

  async function postAction(path, body){
    state.notice = '';
    state.error = '';
    try {
      await api(path, { method: 'POST', body: JSON.stringify(body || {}) });
      state.notice = 'Aktion ausgeführt.';
      await loadAll(true);
    } catch (err) {
      state.error = err && err.message ? err.message : String(err);
      render();
    }
  }

  async function runTest(){
    const input = root?.querySelector('[data-shoutout-target]');
    const force = root?.querySelector('[data-shoutout-force]')?.checked === true;
    const target = String(input?.value || '').replace(/^@+/, '').trim();
    if (!target) {
      state.error = 'Bitte einen Zielkanal eintragen.';
      render();
      return;
    }
    state.notice = '';
    state.error = '';
    try {
      await api(API.run, { method: 'POST', body: JSON.stringify({ target, force }) });
      state.notice = `Shoutout für @${target} aufgenommen.`;
      if (input) input.value = '';
      await loadAll(true);
    } catch (err) {
      state.error = err && err.message ? err.message : String(err);
      render();
    }
  }

  function renderHero(){
    const status = state.status || {};
    const display = state.queue?.displayQueue || status.displayQueue || {};
    const official = state.queue?.officialQueue || status.officialQueue || {};
    const liveGate = official.liveGate || {};
    const ss = state.streamStatus || {};

    return `
      <div class="shoutout-hero glass">
        <div>
          <div class="shoutout-kicker">Clip-Shoutout / VSO</div>
          <h2>Shoutout-System</h2>
          <p>Display-Queue, offizieller Twitch-Shoutout, Streamtag-Limit und zentraler Live-Status.</p>
        </div>
        <div class="shoutout-hero-grid">
          <div class="shoutout-metric"><small>Modul</small><strong>${esc(status.moduleVersion || '-')}</strong><span>${statusBadge(status.enabled === false ? 'inactive' : 'active')}</span></div>
          <div class="shoutout-metric"><small>Command</small><strong>!${esc(status.command || 'vso')}</strong><span>${esc((status.aliases || []).map(x => `!${x}`).join(', ') || '-')}</span></div>
          <div class="shoutout-metric"><small>Display offen</small><strong>${esc(display.pending ?? 0)}</strong><span>${display.cooldownRunning ? `Cooldown ${fmtMs(display.cooldownRemainingMs)}` : 'bereit'}</span></div>
          <div class="shoutout-metric"><small>Official offen</small><strong>${esc(official.pending ?? 0)}</strong><span>${statusBadge(liveGate.reason || (liveGate.live ? 'live' : 'offline'))}</span></div>
          <div class="shoutout-metric"><small>Stream Status</small><strong>${liveGate.live ? 'LIVE' : 'OFFLINE'}</strong><span>${esc(liveGate.upstreamSource || ss.source || '-')} · ${liveGate.stale ? 'stale' : 'frisch'}</span></div>
        </div>
      </div>
    `;
  }

  function renderTestBox(){
    return `
      <div class="shoutout-card">
        <div class="shoutout-card-head">
          <div><h3>Test auslösen</h3><p>Aktuell für den Testbetrieb mit <code>!vso</code>. Optional mit Streamtag-Override.</p></div>
        </div>
        <div class="shoutout-run-row">
          <input data-shoutout-target type="text" placeholder="Twitch-Kanal, z. B. urlug" autocomplete="off" />
          <label class="shoutout-check"><input data-shoutout-force type="checkbox" /> --force</label>
          <button type="button" data-shoutout-run>Shoutout aufnehmen</button>
        </div>
      </div>
    `;
  }

  function renderLiveGate(){
    const official = state.queue?.officialQueue || state.status?.officialQueue || {};
    const liveGate = official.liveGate || {};
    const ss = state.streamStatus || {};
    return `
      <div class="shoutout-card">
        <div class="shoutout-card-head"><div><h3>Official Live-Gate</h3><p>Entscheidet, ob der offizielle Twitch-Shoutout gesendet oder geparkt wird.</p></div></div>
        <div class="shoutout-facts">
          <div><small>Quelle</small><strong>${esc(liveGate.source || '-')}</strong></div>
          <div><small>Upstream</small><strong>${esc(liveGate.upstreamSource || ss.source || '-')}</strong></div>
          <div><small>Status bekannt</small><strong>${boolBadge(liveGate.statusKnown, 'bekannt', 'unklar')}</strong></div>
          <div><small>Stale</small><strong>${boolBadge(liveGate.stale, 'stale', 'frisch')}</strong></div>
          <div><small>Live</small><strong>${boolBadge(liveGate.live, 'live', 'offline')}</strong></div>
          <div><small>Grund</small><strong>${statusBadge(liveGate.reason || '-')}</strong></div>
          <div><small>Letzte Prüfung</small><strong>${fmtDate(liveGate.lastCheckedAt || ss.lastCheckedAt)}</strong></div>
          <div><small>Retry</small><strong>${fmtMs(liveGate.retryMs || 0)}</strong></div>
          <div><small>StreamDay</small><strong>${esc(liveGate.streamDayId || ss.streamDayId || '-')}</strong></div>
        </div>
      </div>
    `;
  }

  function renderDisplayQueue(){
    const display = state.queue?.displayQueue || state.status?.displayQueue || {};
    const rows = displayRows();
    return `
      <div class="shoutout-card">
        <div class="shoutout-card-head">
          <div><h3>Display-Queue</h3><p>Video-/Overlay-Anzeigen mit 2-Minuten-Abstand nach Anzeige-Ende.</p></div>
          <div>${display.workerStarted ? statusBadge('active') : statusBadge('stopped')}</div>
        </div>
        <div class="shoutout-table-wrap">
          <table class="shoutout-table">
            <thead><tr><th>ID</th><th>Ziel</th><th>Status</th><th>Verfügbar</th><th>Start</th><th>Fehler</th><th>Aktion</th></tr></thead>
            <tbody>
              ${rows.length ? rows.map(row => `
                <tr>
                  <td>${esc(row.id)}</td>
                  <td><strong>@${esc(row.target_display || row.target_login || '-')}</strong><small>${esc(row.requested_by_display || row.requested_by_login || '')}</small></td>
                  <td>${statusBadge(row.status)}</td>
                  <td>${fmtDate(row.available_at)}</td>
                  <td>${fmtDate(row.started_at)}</td>
                  <td>${esc(row.last_error || '')}</td>
                  <td class="shoutout-actions"><button data-display-retry="${esc(row.id)}">Retry</button><button data-display-remove="${esc(row.id)}">Remove</button></td>
                </tr>
              `).join('') : '<tr><td colspan="7" class="shoutout-empty">Keine Display-Einträge offen.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderOfficialQueue(){
    const official = state.queue?.officialQueue || state.status?.officialQueue || {};
    const rows = officialRows();
    return `
      <div class="shoutout-card">
        <div class="shoutout-card-head">
          <div><h3>Official-Queue</h3><p>Offizielle Twitch-Shoutouts mit Twitch-Cooldown und Live-Gate.</p></div>
          <div>${official.workerStarted ? statusBadge('active') : statusBadge('stopped')}</div>
        </div>
        <div class="shoutout-table-wrap">
          <table class="shoutout-table">
            <thead><tr><th>ID</th><th>Ziel</th><th>Status</th><th>Verfügbar</th><th>Gesendet</th><th>Fehler</th><th>Aktion</th></tr></thead>
            <tbody>
              ${rows.length ? rows.map(row => `
                <tr>
                  <td>${esc(row.id)}</td>
                  <td><strong>@${esc(row.target_display || row.target_login || '-')}</strong><small>User-ID ${esc(row.target_user_id || '-')}</small></td>
                  <td>${statusBadge(row.status)}</td>
                  <td>${fmtDate(row.available_at)}</td>
                  <td>${fmtDate(row.sent_at)}</td>
                  <td>${esc(row.last_error || '')}</td>
                  <td class="shoutout-actions"><button data-official-retry="${esc(row.id)}">Retry</button><button data-official-remove="${esc(row.id)}">Remove</button></td>
                </tr>
              `).join('') : '<tr><td colspan="7" class="shoutout-empty">Keine offiziellen Shoutouts offen.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderTimeline(){
    const rows = timelineRows();
    return `
      <div class="shoutout-card shoutout-wide">
        <div class="shoutout-card-head"><div><h3>Timeline</h3><p>Letzte Shoutout-Anfragen inklusive Display und Official-Verknüpfung.</p></div></div>
        <div class="shoutout-table-wrap">
          <table class="shoutout-table">
            <thead><tr><th>ID</th><th>Ziel</th><th>Display</th><th>Anfrage</th><th>Gestartet</th><th>Fertig</th><th>Official</th><th>Override</th></tr></thead>
            <tbody>
              ${rows.length ? rows.map(row => `
                <tr>
                  <td>${esc(row.id)}</td>
                  <td><strong>@${esc(row.targetDisplay || row.targetLogin || '-')}</strong><small>${esc(row.streamDayId || '')}</small></td>
                  <td>${statusBadge(row.status)}</td>
                  <td>${fmtDate(row.requestedAt)}</td>
                  <td>${fmtDate(row.displayStartedAt)}</td>
                  <td>${fmtDate(row.displayFinishedAt)}</td>
                  <td>${statusBadge(row.officialResult || row.officialStatus || '-')}${row.officialError ? `<small>${esc(row.officialError)}</small>` : ''}</td>
                  <td>${row.overrideUsed ? boolBadge(true, 'force', 'nein') : '<span class="shoutout-muted">-</span>'}</td>
                </tr>
              `).join('') : '<tr><td colspan="8" class="shoutout-empty">Noch keine Timeline-Einträge.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function render(){
    root = document.getElementById('shoutoutModule');
    if (!root) return;
    root.innerHTML = `
      <div class="shoutout-shell">
        <div class="shoutout-toolbar">
          <div>
            <strong>Shoutout-Dashboard</strong>
            <span>${state.loading ? 'lädt...' : 'bereit'}</span>
          </div>
          <div class="shoutout-toolbar-actions">
            <label class="shoutout-check"><input type="checkbox" data-shoutout-auto ${state.autoRefresh ? 'checked' : ''} /> Auto-Refresh</label>
            <button type="button" data-shoutout-refresh>Aktualisieren</button>
          </div>
        </div>
        ${state.error ? `<div class="shoutout-alert bad">${esc(state.error)}</div>` : ''}
        ${state.notice ? `<div class="shoutout-alert ok">${esc(state.notice)}</div>` : ''}
        ${renderHero()}
        <div class="shoutout-grid">
          ${renderTestBox()}
          ${renderLiveGate()}
          ${renderDisplayQueue()}
          ${renderOfficialQueue()}
          ${renderTimeline()}
        </div>
      </div>
    `;
  }

  function bind(){
    document.addEventListener('click', ev => {
      const target = ev.target;
      if (!target) return;
      if (target.closest('[data-shoutout-refresh]')) {
        loadAll(true);
        return;
      }
      if (target.closest('[data-shoutout-run]')) {
        runTest();
        return;
      }
      const displayRetry = target.closest('[data-display-retry]');
      if (displayRetry) return postAction(API.displayRetry, { id: Number(displayRetry.dataset.displayRetry || 0) });
      const displayRemove = target.closest('[data-display-remove]');
      if (displayRemove) return postAction(API.displayRemove, { id: Number(displayRemove.dataset.displayRemove || 0) });
      const officialRetry = target.closest('[data-official-retry]');
      if (officialRetry) return postAction(API.officialRetry, { id: Number(officialRetry.dataset.officialRetry || 0) });
      const officialRemove = target.closest('[data-official-remove]');
      if (officialRemove) return postAction(API.officialRemove, { id: Number(officialRemove.dataset.officialRemove || 0) });
    });

    document.addEventListener('change', ev => {
      if (ev.target?.matches?.('[data-shoutout-auto]')) {
        state.autoRefresh = ev.target.checked === true;
        scheduleRefresh();
      }
    });

    document.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' && ev.target?.matches?.('[data-shoutout-target]')) runTest();
    });
  }

  function init(){
    registerDashboardModule();
    root = document.getElementById('shoutoutModule');
    if (root) render();
    if (localStorage.getItem('cgn-dashboard-active-module') === 'shoutout' && window.CGN?.setActiveModule) {
      window.CGN.setActiveModule('shoutout', { initial: true });
    }
  }

  window.addEventListener('cgn:module-show', ev => {
    if (ev.detail?.module === 'shoutout') loadAll(true);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  bind();

  return { init, loadAll, render };
})();
