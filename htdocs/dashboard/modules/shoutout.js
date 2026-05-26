window.ShoutoutModule = (function(){
  'use strict';

  const API = {
    status: '/api/clip-shoutout/status',
    queue: '/api/clip-shoutout/queue',
    timeline: '/api/clip-shoutout/timeline?limit=80',
    stats: '/api/clip-shoutout/stats?limit=80&detailLimit=160',
    inbound: '/api/clip-shoutout/inbound?limit=80',
    inboundStats: '/api/clip-shoutout/inbound/stats?limit=80',
    productionCheck: '/api/clip-shoutout/production-check',
    liveTest: '/api/clip-shoutout/live-test',
    run: '/api/clip-shoutout/run',
    displayRemove: '/api/clip-shoutout/display-queue/remove',
    displayRetry: '/api/clip-shoutout/display-queue/retry',
    officialRemove: '/api/clip-shoutout/queue/remove',
    officialRetry: '/api/clip-shoutout/queue/retry',
    streamStatus: '/api/stream-status/status'
  };

  const TABS = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'inbound', label: 'Eingehend' },
    { id: 'queues', label: 'Queues' },
    { id: 'stats', label: 'Statistik' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'production', label: 'Produktion' },
    { id: 'liveTest', label: 'Live-Test' },
    { id: 'settings', label: 'Settings/Test' }
  ];

  let root = null;
  let refreshTimer = null;
  const state = {
    status: null,
    queue: null,
    timeline: null,
    streamStatus: null,
    stats: null,
    inbound: null,
    inboundStats: null,
    productionCheck: null,
    liveTest: null,
    selectedStatsTarget: '',
    selectedStatsRequester: '',
    activeTab: 'overview',
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

  function statsRows(key){
    return Array.isArray(state.stats?.[key]) ? state.stats[key] : [];
  }

  function num(v){
    const n = Number(v || 0);
    return Number.isFinite(n) ? n : 0;
  }

  function statsUrl(){
    const params = new URLSearchParams();
    params.set('limit', '80');
    params.set('detailLimit', '160');
    if (state.selectedStatsTarget) params.set('target', state.selectedStatsTarget);
    if (state.selectedStatsRequester) params.set('requester', state.selectedStatsRequester);
    return `${API.stats}&${params.toString()}`;
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
      const [status, queue, timeline, stats, inbound, inboundStats, productionCheck, liveTest, streamStatus] = await Promise.all([
        api(API.status),
        api(API.queue),
        api(API.timeline),
        api(statsUrl()).catch(err => ({ ok: false, error: err.message })),
        api(API.inbound).catch(err => ({ ok: false, error: err.message, items: [] })),
        api(API.inboundStats).catch(err => ({ ok: false, error: err.message, totals: {}, recent: [] })),
        api(API.productionCheck).catch(err => ({ ok: false, error: err.message, checks: {}, blocking: [], warnings: [] })),
        api(API.liveTest).catch(err => ({ ok: false, error: err.message, testPlan: [], warnings: [], blockers: [] })),
        api(API.streamStatus).catch(err => ({ ok: false, error: err.message }))
      ]);
      state.status = status;
      state.queue = queue;
      state.timeline = timeline;
      state.stats = stats;
      state.inbound = inbound;
      state.inboundStats = inboundStats;
      state.productionCheck = productionCheck;
      state.liveTest = liveTest;
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
          <div class="shoutout-metric"><small>Eingehend</small><strong>${esc(num(state.inboundStats?.totals?.incomingTotal))}</strong><span>${esc(num(state.inboundStats?.totals?.outgoingTotal))} erstellt</span></div>
          <div class="shoutout-metric"><small>Stream Status</small><strong>${liveGate.live ? 'LIVE' : 'OFFLINE'}</strong><span>${esc(liveGate.upstreamSource || ss.source || '-')} · ${liveGate.stale ? 'stale' : 'frisch'}</span></div>
        </div>
      </div>
    `;
  }

  function renderTabs(){
    return `
      <div class="shoutout-tabs" role="tablist" aria-label="Shoutout Bereiche">
        ${TABS.map(tab => `
          <button type="button" role="tab" aria-selected="${state.activeTab === tab.id ? 'true' : 'false'}" class="shoutout-tab ${state.activeTab === tab.id ? 'active' : ''}" data-shoutout-tab="${esc(tab.id)}">${esc(tab.label)}</button>
        `).join('')}
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

  function renderOverview(){
    const status = state.status || {};
    const display = state.queue?.displayQueue || status.displayQueue || {};
    const official = state.queue?.officialQueue || status.officialQueue || {};
    const liveGate = official.liveGate || {};
    const stats = state.stats || {};
    const totals = stats.totals || {};
    const latest = timelineRows().slice(0, 5);

    return `
      <div class="shoutout-tab-panel shoutout-grid">
        <div class="shoutout-card">
          <div class="shoutout-card-head"><div><h3>Kurzstatus</h3><p>Alles Wichtige ohne die großen Tabellen.</p></div></div>
          <div class="shoutout-facts">
            <div><small>Display offen</small><strong>${esc(display.pending ?? 0)}</strong></div>
            <div><small>Display aktiv</small><strong>${esc(display.activeTarget ? '@' + display.activeTarget : '-')}</strong></div>
            <div><small>Display Cooldown</small><strong>${display.cooldownRunning ? fmtMs(display.cooldownRemainingMs) : 'bereit'}</strong></div>
            <div><small>Official offen</small><strong>${esc(official.pending ?? 0)}</strong></div>
            <div><small>Eingehend</small><strong>${esc(num(state.inboundStats?.totals?.incomingTotal))}</strong></div>
            <div><small>Live-Gate</small><strong>${statusBadge(liveGate.reason || (liveGate.live ? 'live' : 'offline'))}</strong></div>
            <div><small>Letzter Fehler</small><strong>${esc(display.lastError || official.lastError || status.lastError || '-')}</strong></div>
          </div>
        </div>
        <div class="shoutout-card">
          <div class="shoutout-card-head"><div><h3>Statistik kompakt</h3><p>Ausgehend, basierend auf den aktuellen Display-/Official-Daten.</p></div></div>
          <div class="shoutout-stat-grid shoutout-stat-grid-small">
            <div class="shoutout-stat"><small>Gesamt</small><strong>${esc(num(totals.totalRequests))}</strong><span>Requests</span></div>
            <div class="shoutout-stat"><small>Ziele</small><strong>${esc(num(totals.uniqueTargets))}</strong><span>einmalig</span></div>
            <div class="shoutout-stat"><small>Auslöser</small><strong>${esc(num(totals.uniqueRequesters))}</strong><span>einmalig</span></div>
            <div class="shoutout-stat"><small>Official</small><strong>${esc(num(totals.officialSent))}</strong><span>gesendet</span></div>
            <div class="shoutout-stat"><small>Eingehend</small><strong>${esc(num(state.inboundStats?.totals?.incomingTotal))}</strong><span>erhalten</span></div>
          </div>
        </div>
        <div class="shoutout-card shoutout-wide">
          <div class="shoutout-card-head"><div><h3>Letzte Timeline</h3><p>Die letzten fünf Einträge. Vollständige Liste im Tab Timeline.</p></div></div>
          <div class="shoutout-mini-timeline">
            ${latest.length ? latest.map(row => `<span>#${esc(row.id)} · @${esc(row.targetDisplay || row.targetLogin || '-')} · ${statusBadge(row.status)} · ${fmtDate(row.requestedAt)}</span>`).join('') : '<span class="shoutout-empty-inline">Noch keine Timeline-Einträge.</span>'}
          </div>
        </div>
      </div>
    `;
  }

  function renderInbound(){
    const inbound = state.inbound || {};
    const inboundStats = state.inboundStats || {};
    const totals = inboundStats.totals || {};
    const incomingByFrom = Array.isArray(inboundStats.incomingByFrom) ? inboundStats.incomingByFrom : [];
    const outgoingByTarget = Array.isArray(inboundStats.outgoingByTarget) ? inboundStats.outgoingByTarget : [];
    const rows = Array.isArray(inbound.items) ? inbound.items : Array.isArray(inboundStats.recent) ? inboundStats.recent : [];

    return `
      <div class="shoutout-tab-panel shoutout-grid">
        <div class="shoutout-card shoutout-wide">
          <div class="shoutout-card-head">
            <div><h3>Eingehende / erstellte Twitch-Shoutouts</h3><p>EventSub-Daten aus <code>channel.shoutout.receive</code> und <code>channel.shoutout.create</code>, gespeichert im Shoutout-System.</p></div>
            <div>${statusBadge(inboundStats.ok === false || inbound.ok === false ? 'error' : 'ok')}</div>
          </div>
          <div class="shoutout-stat-grid">
            <div class="shoutout-stat"><small>Events gesamt</small><strong>${esc(num(totals.totalEvents))}</strong><span>EventSub</span></div>
            <div class="shoutout-stat"><small>Eingehend</small><strong>${esc(num(totals.incomingTotal))}</strong><span>wir wurden erwähnt</span></div>
            <div class="shoutout-stat"><small>Ausgehend erstellt</small><strong>${esc(num(totals.outgoingTotal))}</strong><span>Twitch SO</span></div>
            <div class="shoutout-stat"><small>Von Channels</small><strong>${esc(num(totals.uniqueFromChannels))}</strong><span>einmalig</span></div>
            <div class="shoutout-stat"><small>Viewer Summe</small><strong>${esc(num(totals.viewerCountTotal))}</strong><span>gemeldet</span></div>
          </div>
        </div>

        <div class="shoutout-card">
          <div class="shoutout-card-head"><div><h3>Wer hat uns geshoutoutet?</h3><p>Top-Liste eingehender Shoutouts.</p></div></div>
          <div class="shoutout-table-wrap">
            <table class="shoutout-table shoutout-table-compact">
              <thead><tr><th>Kanal</th><th>Anzahl</th><th>Viewer</th><th>Zuletzt</th></tr></thead>
              <tbody>
                ${incomingByFrom.length ? incomingByFrom.slice(0, 12).map(row => `
                  <tr>
                    <td><strong>@${esc(row.display || row.login || '-')}</strong></td>
                    <td>${esc(row.total || 0)}</td>
                    <td>${esc(row.viewerCountTotal || 0)}</td>
                    <td>${fmtDate(row.lastReceivedAt)}</td>
                  </tr>
                `).join('') : '<tr><td colspan="4" class="shoutout-empty">Noch keine eingehenden Shoutouts.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <div class="shoutout-card">
          <div class="shoutout-card-head"><div><h3>Wen haben wir offiziell geshoutoutet?</h3><p>EventSub-Bestätigung für erstellte Twitch-Shoutouts.</p></div></div>
          <div class="shoutout-table-wrap">
            <table class="shoutout-table shoutout-table-compact">
              <thead><tr><th>Kanal</th><th>Anzahl</th><th>Viewer</th><th>Zuletzt</th></tr></thead>
              <tbody>
                ${outgoingByTarget.length ? outgoingByTarget.slice(0, 12).map(row => `
                  <tr>
                    <td><strong>@${esc(row.display || row.login || '-')}</strong></td>
                    <td>${esc(row.total || 0)}</td>
                    <td>${esc(row.viewerCountTotal || 0)}</td>
                    <td>${fmtDate(row.lastReceivedAt)}</td>
                  </tr>
                `).join('') : '<tr><td colspan="4" class="shoutout-empty">Noch keine EventSub-Bestätigungen.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <div class="shoutout-card shoutout-wide">
          <div class="shoutout-card-head"><div><h3>Letzte Shoutout-Events</h3><p>Roh-Timeline der gespeicherten Twitch-Shoutout-Events.</p></div></div>
          <div class="shoutout-table-wrap">
            <table class="shoutout-table">
              <thead><tr><th>ID</th><th>Richtung</th><th>Von</th><th>An</th><th>Viewer</th><th>Gestartet</th><th>Empfangen</th></tr></thead>
              <tbody>
                ${rows.length ? rows.map(row => `
                  <tr>
                    <td>${esc(row.id)}</td>
                    <td>${statusBadge(row.direction || '-')}</td>
                    <td><strong>@${esc(row.fromBroadcasterDisplay || row.fromBroadcasterLogin || '-')}</strong><small>${esc(row.fromBroadcasterLogin || '')}</small></td>
                    <td><strong>@${esc(row.toBroadcasterDisplay || row.toBroadcasterLogin || '-')}</strong><small>${esc(row.toBroadcasterLogin || '')}</small></td>
                    <td>${esc(row.viewerCount || 0)}</td>
                    <td>${fmtDate(row.startedAt)}</td>
                    <td>${fmtDate(row.receivedAt)}</td>
                  </tr>
                `).join('') : '<tr><td colspan="7" class="shoutout-empty">Noch keine Shoutout-Events gespeichert.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function renderStats(){
    const stats = state.stats || {};
    const totals = stats.totals || {};
    const targetOptions = Array.isArray(stats.targetOptions) ? stats.targetOptions : [];
    const requesterOptions = Array.isArray(stats.requesterOptions) ? stats.requesterOptions : [];
    const targetStats = statsRows('targetStats');
    const requesterStats = statsRows('requesterStats');
    const pairStats = statsRows('pairStats');
    const selectedTarget = stats.selectedTarget || null;
    const selectedRequester = stats.selectedRequester || null;

    return `
      <div class="shoutout-card shoutout-wide">
        <div class="shoutout-card-head">
          <div><h3>Statistik</h3><p>Wer hat wie oft wen geshoutoutet? Einzelne Ziele oder Auslöser können per Dropdown geöffnet werden.</p></div>
          <div>${statusBadge(stats.ok === false ? 'error' : 'ok')}</div>
        </div>

        <div class="shoutout-stat-grid">
          <div class="shoutout-stat"><small>Shoutouts gesamt</small><strong>${esc(num(totals.totalRequests))}</strong><span>Display-Anfragen</span></div>
          <div class="shoutout-stat"><small>Zielkanäle</small><strong>${esc(num(totals.uniqueTargets))}</strong><span>einmalig</span></div>
          <div class="shoutout-stat"><small>Auslöser</small><strong>${esc(num(totals.uniqueRequesters))}</strong><span>einmalig</span></div>
          <div class="shoutout-stat"><small>Official sent</small><strong>${esc(num(totals.officialSent))}</strong><span>${esc(num(totals.officialFailed))} failed</span></div>
          <div class="shoutout-stat"><small>Overrides</small><strong>${esc(num(totals.overrideCount))}</strong><span>--force</span></div>
        </div>

        <div class="shoutout-filter-row">
          <label>
            <span>Zielkanal</span>
            <select data-shoutout-stats-target>
              <option value="">Alle Zielkanäle</option>
              ${targetOptions.map(row => `<option value="${esc(row.login)}" ${state.selectedStatsTarget === row.login ? 'selected' : ''}>@${esc(row.display || row.login)} (${esc(row.total || 0)})</option>`).join('')}
            </select>
          </label>
          <label>
            <span>Auslöser</span>
            <select data-shoutout-stats-requester>
              <option value="">Alle Auslöser</option>
              ${requesterOptions.map(row => `<option value="${esc(row.login)}" ${state.selectedStatsRequester === row.login ? 'selected' : ''}>${esc(row.display || row.login)} (${esc(row.total || 0)})</option>`).join('')}
            </select>
          </label>
        </div>

        ${selectedTarget ? renderSelectedTarget(selectedTarget) : ''}
        ${selectedRequester ? renderSelectedRequester(selectedRequester) : ''}

        <div class="shoutout-stats-columns">
          <div>
            <h4>Zielkanäle</h4>
            <div class="shoutout-table-wrap">
              <table class="shoutout-table shoutout-table-compact">
                <thead><tr><th>Ziel</th><th>Anzahl</th><th>Done</th><th>Auslöser</th><th>Zuletzt</th></tr></thead>
                <tbody>
                  ${targetStats.length ? targetStats.slice(0, 12).map(row => `
                    <tr>
                      <td><strong>@${esc(row.targetDisplay || row.targetLogin || '-')}</strong></td>
                      <td>${esc(row.total || 0)}</td>
                      <td>${esc(row.displayDone || 0)}</td>
                      <td>${esc(row.uniqueRequesters || 0)}</td>
                      <td>${fmtDate(row.lastRequestedAt)}</td>
                    </tr>
                  `).join('') : '<tr><td colspan="5" class="shoutout-empty">Keine Daten.</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h4>Auslöser</h4>
            <div class="shoutout-table-wrap">
              <table class="shoutout-table shoutout-table-compact">
                <thead><tr><th>Auslöser</th><th>Anzahl</th><th>Ziele</th><th>Force</th><th>Zuletzt</th></tr></thead>
                <tbody>
                  ${requesterStats.length ? requesterStats.slice(0, 12).map(row => `
                    <tr>
                      <td><strong>${esc(row.requesterDisplay || row.requesterLogin || '-')}</strong></td>
                      <td>${esc(row.total || 0)}</td>
                      <td>${esc(row.uniqueTargets || 0)}</td>
                      <td>${esc(row.overrideCount || 0)}</td>
                      <td>${fmtDate(row.lastRequestedAt)}</td>
                    </tr>
                  `).join('') : '<tr><td colspan="5" class="shoutout-empty">Keine Daten.</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <h4>Wer → Wen</h4>
        <div class="shoutout-table-wrap">
          <table class="shoutout-table shoutout-table-compact">
            <thead><tr><th>Auslöser</th><th>Ziel</th><th>Anzahl</th><th>Done</th><th>Force</th><th>Zuletzt</th></tr></thead>
            <tbody>
              ${pairStats.length ? pairStats.slice(0, 30).map(row => `
                <tr>
                  <td><strong>${esc(row.requesterDisplay || row.requesterLogin || '-')}</strong></td>
                  <td><strong>@${esc(row.targetDisplay || row.targetLogin || '-')}</strong></td>
                  <td>${esc(row.total || 0)}</td>
                  <td>${esc(row.displayDone || 0)}</td>
                  <td>${esc(row.overrideCount || 0)}</td>
                  <td>${fmtDate(row.lastRequestedAt)}</td>
                </tr>
              `).join('') : '<tr><td colspan="6" class="shoutout-empty">Keine Paar-Statistik vorhanden.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderSelectedTarget(selected){
    const summary = selected.summary || {};
    const rows = Array.isArray(selected.byRequester) ? selected.byRequester : [];
    const timeline = Array.isArray(selected.timeline) ? selected.timeline : [];
    return `
      <div class="shoutout-detail-box">
        <h4>Einzelansicht Ziel: @${esc(summary.targetDisplay || summary.targetLogin || state.selectedStatsTarget)}</h4>
        <div class="shoutout-mini-metrics">
          <span>${esc(summary.total || 0)} Gesamt</span>
          <span>${esc(summary.uniqueRequesters || 0)} Auslöser</span>
          <span>${esc(summary.overrideCount || 0)} Force</span>
          <span>Zuletzt: ${fmtDate(summary.lastRequestedAt)}</span>
        </div>
        <div class="shoutout-table-wrap">
          <table class="shoutout-table shoutout-table-compact">
            <thead><tr><th>Auslöser</th><th>Anzahl</th><th>Force</th><th>Zuletzt</th></tr></thead>
            <tbody>
              ${rows.length ? rows.map(row => `<tr><td><strong>${esc(row.requesterDisplay || row.requesterLogin || '-')}</strong></td><td>${esc(row.total || 0)}</td><td>${esc(row.overrideCount || 0)}</td><td>${fmtDate(row.lastRequestedAt)}</td></tr>`).join('') : '<tr><td colspan="4" class="shoutout-empty">Keine Detaildaten.</td></tr>'}
            </tbody>
          </table>
        </div>
        <div class="shoutout-detail-timeline">${timeline.slice(0, 8).map(row => `<span>#${esc(row.id)} · ${fmtDate(row.requestedAt)} · ${esc(row.requestedByDisplay || row.requestedByLogin || '-')} · ${esc(row.status || '-')}</span>`).join('')}</div>
      </div>
    `;
  }

  function renderSelectedRequester(selected){
    const summary = selected.summary || {};
    const rows = Array.isArray(selected.byTarget) ? selected.byTarget : [];
    return `
      <div class="shoutout-detail-box">
        <h4>Einzelansicht Auslöser: ${esc(summary.requesterDisplay || summary.requesterLogin || state.selectedStatsRequester)}</h4>
        <div class="shoutout-mini-metrics">
          <span>${esc(summary.total || 0)} Gesamt</span>
          <span>${esc(summary.uniqueTargets || 0)} Ziele</span>
          <span>${esc(summary.overrideCount || 0)} Force</span>
          <span>Zuletzt: ${fmtDate(summary.lastRequestedAt)}</span>
        </div>
        <div class="shoutout-table-wrap">
          <table class="shoutout-table shoutout-table-compact">
            <thead><tr><th>Ziel</th><th>Anzahl</th><th>Force</th><th>Zuletzt</th></tr></thead>
            <tbody>
              ${rows.length ? rows.map(row => `<tr><td><strong>@${esc(row.targetDisplay || row.targetLogin || '-')}</strong></td><td>${esc(row.total || 0)}</td><td>${esc(row.overrideCount || 0)}</td><td>${fmtDate(row.lastRequestedAt)}</td></tr>`).join('') : '<tr><td colspan="4" class="shoutout-empty">Keine Detaildaten.</td></tr>'}
            </tbody>
          </table>
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

  function renderQueues(){
    return `
      <div class="shoutout-tab-panel shoutout-grid">
        ${renderDisplayQueue()}
        ${renderOfficialQueue()}
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

  function renderCheckItem(label, value, help){
    return `
      <div class="shoutout-checkitem ${value ? 'ok' : 'bad'}">
        <div>${statusBadge(value ? 'ok' : 'fehlt')}</div>
        <div><strong>${esc(label)}</strong>${help ? `<small>${esc(help)}</small>` : ''}</div>
      </div>
    `;
  }

  function renderProductionCheck(){
    const check = state.productionCheck || {};
    const auth = check.auth || {};
    const eventSub = check.eventSub || {};
    const checks = check.checks || {};
    const subscriptionChecks = Array.isArray(eventSub.subscriptionChecks) ? eventSub.subscriptionChecks : [];
    const blocking = Array.isArray(check.blocking) ? check.blocking : [];
    const warnings = Array.isArray(check.warnings) ? check.warnings : [];
    const scopes = Array.isArray(auth.scopes) ? auth.scopes : [];

    return `
      <div class="shoutout-tab-panel shoutout-grid">
        <div class="shoutout-card shoutout-wide">
          <div class="shoutout-card-head">
            <div><h3>Produktions-Check</h3><p>Prüft OAuth-Token, Shoutout-Scopes, EventSub-Verbindung und die beiden Twitch-Shoutout-Subscriptions.</p></div>
            <div>${statusBadge(check.ready ? 'ready' : 'prüfen')}</div>
          </div>
          <div class="shoutout-stat-grid">
            <div class="shoutout-stat"><small>Gesamtstatus</small><strong>${check.ready ? 'Bereit' : 'Nicht bereit'}</strong><span>${esc(blocking.length)} Blocker</span></div>
            <div class="shoutout-stat"><small>User-Token</small><strong>${auth.ok ? 'OK' : 'Fehlt'}</strong><span>${esc(auth.login || '-')}</span></div>
            <div class="shoutout-stat"><small>EventSub</small><strong>${eventSub.connected ? 'Verbunden' : 'Nicht verbunden'}</strong><span>${esc(eventSub.readyState || '-')}</span></div>
            <div class="shoutout-stat"><small>Receive/Create</small><strong>${esc(subscriptionChecks.filter(row => row.known).length)}/${esc(subscriptionChecks.length || 2)}</strong><span>Subscriptions</span></div>
            <div class="shoutout-stat"><small>Senden</small><strong>${check.sendReady ? 'OK' : 'Prüfen'}</strong><span>manage-Scope</span></div>
          </div>
        </div>

        <div class="shoutout-card">
          <div class="shoutout-card-head"><div><h3>Pflichtprüfungen</h3><p>Diese Punkte sollten grün sein, bevor echte Events bewertet werden.</p></div></div>
          <div class="shoutout-checklist">
            ${renderCheckItem('User-OAuth-Token gültig', checks.userTokenPresent, auth.error || auth.login || '')}
            ${renderCheckItem('Broadcaster-ID gesetzt', checks.broadcasterIdConfigured, auth.broadcasterId || eventSub.broadcasterId || '')}
            ${renderCheckItem('Token-User passt zu moderator_user_id', checks.tokenUserMatchesBroadcaster, 'Wichtig bei EventSub WebSocket.')}
            ${renderCheckItem('Shoutout Read/Manage Scope vorhanden', checks.shoutoutReadScope, 'moderator:read:shoutouts oder moderator:manage:shoutouts')}
            ${renderCheckItem('EventSub WebSocket verbunden', checks.eventSubConnected, eventSub.lastSessionId || eventSub.readyState || '')}
            ${renderCheckItem('Shoutout-Subscriptions konfiguriert', checks.shoutoutSubscriptionsConfigured, (eventSub.missingConfigured || []).join(', '))}
            ${renderCheckItem('Shoutout-Subscriptions aktiv bekannt', checks.shoutoutSubscriptionsKnown, (eventSub.missingKnown || []).join(', '))}
          </div>
        </div>

        <div class="shoutout-card">
          <div class="shoutout-card-head"><div><h3>Scopes & Subscription-Details</h3><p>Hilft bei OAuth-/EventSub-Fehlern.</p></div></div>
          <div class="shoutout-facts">
            <div><small>Login</small><strong>${esc(auth.login || '-')}</strong></div>
            <div><small>User-ID</small><strong>${esc(auth.userId || '-')}</strong></div>
            <div><small>Broadcaster-ID</small><strong>${esc(auth.broadcasterId || eventSub.broadcasterId || '-')}</strong></div>
            <div><small>Read/Manage</small><strong>${boolBadge(auth.hasShoutoutReadOrManage, 'ja', 'nein')}</strong></div>
            <div><small>Manage/Senden</small><strong>${boolBadge(auth.hasModeratorManageShoutouts, 'ja', 'nein')}</strong></div>
            <div><small>Letztes Event</small><strong>${esc(eventSub.lastNotificationType || '-')}</strong></div>
          </div>
          <div class="shoutout-mini-timeline">
            ${subscriptionChecks.length ? subscriptionChecks.map(row => `<span>${statusBadge(row.known ? 'ok' : 'fehlt')} <strong>${esc(row.type)}</strong> · konfiguriert: ${row.configured ? 'ja' : 'nein'}</span>`).join('') : '<span class="shoutout-empty-inline">Keine Subscription-Daten geladen.</span>'}
          </div>
          <div class="shoutout-mini-timeline">
            <span><strong>Scopes:</strong> ${scopes.length ? esc(scopes.join(', ')) : '<span class="shoutout-muted">keine/unknown</span>'}</span>
          </div>
        </div>

        <div class="shoutout-card shoutout-wide">
          <div class="shoutout-card-head"><div><h3>Blocker & Warnungen</h3><p>Diese Liste zeigt, warum der Status noch nicht produktionsbereit ist.</p></div></div>
          <div class="shoutout-mini-timeline">
            ${blocking.length ? blocking.map(item => `<span>${statusBadge('fehlt')} ${esc(item)}</span>`).join('') : `<span>${statusBadge('ok')} Keine Blocker erkannt.</span>`}
            ${warnings.length ? warnings.map(item => `<span>${statusBadge('warn')} ${esc(item)}</span>`).join('') : `<span class="shoutout-empty-inline">Keine Warnungen.</span>`}
          </div>
        </div>
      </div>
    `;
  }


  function renderLiveTest(){
    const live = state.liveTest || {};
    const decision = live.safeDecision || {};
    const observation = live.observation || {};
    const plan = Array.isArray(live.testPlan) ? live.testPlan : [];
    const blockers = Array.isArray(live.blockers) ? live.blockers : [];
    const warnings = Array.isArray(live.warnings) ? live.warnings : [];
    const recent = Array.isArray(live.recent) ? live.recent : [];

    return `
      <div class="shoutout-tab-panel shoutout-grid">
        <div class="shoutout-card shoutout-wide">
          <div class="shoutout-card-head">
            <div><h3>Live-Test & Entscheidungs-Vorbereitung</h3><p>Bewertet Produktionscheck, beobachtete echte Shoutout-Events und die nächste sichere Aktion. Es wird nichts automatisch produktiv umgestellt.</p></div>
            <div>${statusBadge(live.readyForProductionSwitch ? 'bereit' : 'prüfen')}</div>
          </div>
          <div class="shoutout-stat-grid">
            <div class="shoutout-stat"><small>Production</small><strong>${live.productionReady ? 'OK' : 'Blockiert'}</strong><span>${esc(blockers.length)} Blocker</span></div>
            <div class="shoutout-stat"><small>Send Ready</small><strong>${live.sendReady ? 'OK' : 'Prüfen'}</strong><span>manage-Scope</span></div>
            <div class="shoutout-stat"><small>Debug</small><strong>${esc(num(observation.debugTotal))}</strong><span>Events</span></div>
            <div class="shoutout-stat"><small>Real Receive</small><strong>${esc(num(observation.realIncomingTotal))}</strong><span>incoming</span></div>
            <div class="shoutout-stat"><small>Real Create</small><strong>${esc(num(observation.realOutgoingTotal))}</strong><span>outgoing</span></div>
            <div class="shoutout-stat"><small>Empfehlung</small><strong>${esc(live.recommendedNextAction || '-')}</strong><span>nächste Aktion</span></div>
          </div>
        </div>

        <div class="shoutout-card shoutout-wide">
          <div class="shoutout-card-head"><div><h3>Testplan</h3><p>Schrittweise prüfen, bevor über produktives <code>!so</code> entschieden wird.</p></div></div>
          <div class="shoutout-live-plan">
            ${plan.length ? plan.map((item, index) => `
              <div class="shoutout-plan-item ${item.ready ? 'ok' : 'pending'}">
                <div class="shoutout-plan-index">${esc(index + 1)}</div>
                <div>
                  <strong>${esc(item.label || item.id || '-')}</strong>
                  <small>${esc(item.note || '')}</small>
                  ${item.command ? `<code>${esc(item.command)}</code>` : ''}
                </div>
                <div>${statusBadge(item.ready ? 'ok' : 'offen')}</div>
              </div>
            `).join('') : '<div class="shoutout-empty-inline">Kein Testplan geladen.</div>'}
          </div>
        </div>

        <div class="shoutout-card">
          <div class="shoutout-card-head"><div><h3>Sicherheitsentscheidung</h3><p>Der produktive Schalter bleibt bewusst manuell.</p></div></div>
          <div class="shoutout-facts">
            <div><small>Automatisch umgestellt</small><strong>${boolBadge(decision.automaticSwitchPerformed === true, 'ja', 'nein')}</strong></div>
            <div><small>Explizite Entscheidung nötig</small><strong>${boolBadge(decision.explicitUserDecisionRequired !== false, 'ja', 'nein')}</strong></div>
            <div><small>Letzte Beobachtung</small><strong>${fmtDate(observation.lastObservedAt || '')}</strong></div>
          </div>
          <div class="shoutout-mini-timeline"><span>${esc(decision.reason || 'Keine automatische Produktivumstellung.')}</span></div>
        </div>

        <div class="shoutout-card">
          <div class="shoutout-card-head"><div><h3>Blocker & Warnungen</h3><p>Was vor der Entscheidung noch offen ist.</p></div></div>
          <div class="shoutout-mini-timeline">
            ${blockers.length ? blockers.map(item => `<span>${statusBadge('fehlt')} ${esc(item)}</span>`).join('') : `<span>${statusBadge('ok')} Keine Live-Test-Blocker erkannt.</span>`}
            ${warnings.length ? warnings.map(item => `<span>${statusBadge('warn')} ${esc(item)}</span>`).join('') : `<span class="shoutout-empty-inline">Keine Warnungen.</span>`}
          </div>
        </div>

        <div class="shoutout-card shoutout-wide">
          <div class="shoutout-card-head"><div><h3>Letzte beobachtete Shoutout-Events</h3><p>Debug- und echte EventSub-Datensätze aus dem Shoutout-System.</p></div></div>
          <table class="shoutout-table">
            <thead><tr><th>Zeit</th><th>Richtung</th><th>Von</th><th>An</th><th>Typ</th><th>Viewer</th></tr></thead>
            <tbody>
              ${recent.length ? recent.map(row => `
                <tr>
                  <td>${fmtDate(row.receivedAt)}</td>
                  <td>${statusBadge(row.direction)}</td>
                  <td>${esc(row.fromBroadcasterDisplay || row.fromBroadcasterLogin || '-')}</td>
                  <td>${esc(row.toBroadcasterDisplay || row.toBroadcasterLogin || '-')}</td>
                  <td><code>${esc(row.eventType || '-')}</code></td>
                  <td>${esc(num(row.viewerCount))}</td>
                </tr>
              `).join('') : '<tr><td colspan="6" class="shoutout-muted">Noch keine Shoutout-Events gespeichert.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderSettingsTest(){
    const status = state.status || {};
    const cfg = status.config || {};
    const display = cfg.displayQueue || {};
    const official = cfg.officialShoutout || {};
    const streamDayLimit = cfg.streamDayLimit || {};

    return `
      <div class="shoutout-tab-panel shoutout-grid">
        ${renderTestBox()}
        ${renderLiveGate()}
        <div class="shoutout-card shoutout-wide">
          <div class="shoutout-card-head"><div><h3>Settings kompakt</h3><p>Nur Anzeige der wichtigsten Werte. Speichern bleibt unverändert über vorhandene Backend-Routen/Config-Flow.</p></div></div>
          <div class="shoutout-facts shoutout-facts-wide">
            <div><small>Clip-Lookback</small><strong>${esc(cfg.clipLookbackDays || '-')} Tage</strong></div>
            <div><small>Suchbereiche</small><strong>${esc(Array.isArray(cfg.clipSearchRangesDays) ? cfg.clipSearchRangesDays.join(', ') : '-')}</strong></div>
            <div><small>Display-Cooldown</small><strong>${fmtMs(display.displayCooldownMs || 0)}</strong></div>
            <div><small>Cooldown nach Finish</small><strong>${boolBadge(display.cooldownStartsAfterFinish, 'ja', 'nein')}</strong></div>
            <div><small>Official aktiv</small><strong>${boolBadge(official.enabled !== false, 'aktiv', 'aus')}</strong></div>
            <div><small>Official Global-CD</small><strong>${fmtMs(official.globalCooldownMs || 0)}</strong></div>
            <div><small>Streamtag-Limit</small><strong>${boolBadge(streamDayLimit.enabled !== false, 'aktiv', 'aus')}</strong></div>
            <div><small>Override-Flag</small><strong>${esc(streamDayLimit.overrideFlag || '--force')}</strong></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderActiveTab(){
    if (state.activeTab === 'inbound') return renderInbound();
    if (state.activeTab === 'queues') return renderQueues();
    if (state.activeTab === 'stats') return `<div class="shoutout-tab-panel">${renderStats()}</div>`;
    if (state.activeTab === 'timeline') return `<div class="shoutout-tab-panel">${renderTimeline()}</div>`;
    if (state.activeTab === 'production') return renderProductionCheck();
    if (state.activeTab === 'liveTest') return renderLiveTest();
    if (state.activeTab === 'settings') return renderSettingsTest();
    return renderOverview();
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
        ${renderTabs()}
        ${renderActiveTab()}
      </div>
    `;
  }

  function bind(){
    document.addEventListener('click', ev => {
      const target = ev.target;
      if (!target) return;
      const tabButton = target.closest('[data-shoutout-tab]');
      if (tabButton) {
        const nextTab = String(tabButton.dataset.shoutoutTab || 'overview');
        state.activeTab = TABS.some(tab => tab.id === nextTab) ? nextTab : 'overview';
        render();
        return;
      }
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
        return;
      }
      if (ev.target?.matches?.('[data-shoutout-stats-target]')) {
        state.selectedStatsTarget = String(ev.target.value || '');
        loadAll(true);
        return;
      }
      if (ev.target?.matches?.('[data-shoutout-stats-requester]')) {
        state.selectedStatsRequester = String(ev.target.value || '');
        loadAll(true);
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
