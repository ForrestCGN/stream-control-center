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
    { id: 'chat', label: 'Shoutout' },
    { id: 'auto', label: 'AutoShoutout' },
    { id: 'queues', label: 'Queues' },
    { id: 'texts', label: 'Texte' },
    { id: 'analytics', label: 'Auswertung' },
    { id: 'diagnostics', label: 'Diagnose' },
    { id: 'settings', label: 'Einstellungen' }
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

  function translatedStatusBadge(value){
    const raw = String(value || '').toLowerCase();
    const labels = {
      active: 'aktiv',
      sent: 'gesendet',
      done: 'fertig',
      ok: 'ok',
      live: 'live',
      queued: 'wartet',
      waiting: 'wartet',
      grace: 'grace',
      failed: 'fehler',
      bad: 'fehler',
      error: 'fehler',
      removed: 'entfernt',
      '-': '-'
    };
    let cls = 'neutral';
    if (['active','sent','done','ok','live'].includes(raw)) cls = 'ok';
    else if (['queued','waiting','grace'].includes(raw)) cls = 'warn';
    else if (['failed','bad','error','removed'].includes(raw)) cls = 'bad';
    return `<span class="shoutout-badge ${cls}">${esc(labels[raw] || value || '-')}</span>`;
  }

  function compactErrorText(value, maxLength = 120){
    const raw = String(value || '').trim();
    if (!raw) return '';
    let text = raw;
    if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
      try {
        const parsed = JSON.parse(raw);
        text = parsed.message || parsed.error || parsed.reason || parsed.status || raw;
      } catch (_) {
        text = raw;
      }
    }
    text = String(text || '').replace(/\s+/g, ' ').trim();
    if (text.length <= maxLength) return text;
    return `${text.slice(0, Math.max(20, maxLength - 1)).trim()}…`;
  }

  function queueStatusBadge(active){
    return active ? '<span class="shoutout-badge ok">aktiv</span>' : '<span class="shoutout-badge neutral">gestoppt</span>';
  }

  function renderQueueEmpty(text){
    return `
      <div class="shoutout-empty-state">
        <strong>${esc(text)}</strong>
      </div>
    `;
  }


  function directionBadge(value){
    const raw = String(value || '').toLowerCase();
    if (raw === 'incoming') return '<span class="shoutout-badge ok">Erhalten</span>';
    if (raw === 'outgoing') return '<span class="shoutout-badge neutral">Gesendet</span>';
    return statusBadge(value || '-');
  }

  function userCell(display, login){
    const cleanDisplay = String(display || '').trim();
    const cleanLogin = String(login || '').trim();
    const primary = cleanDisplay || cleanLogin || '-';
    const showLogin = cleanLogin && cleanLogin.toLowerCase() !== primary.replace(/^@+/, '').toLowerCase();
    return `<strong>@${esc(primary.replace(/^@+/, ''))}</strong>${showLogin ? `<small>${esc(cleanLogin.replace(/^@+/, ''))}</small>` : ''}`;
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

  function isEditingField(){
    root = document.getElementById('shoutoutModule');
    if (!root) return false;
    const active = document.activeElement;
    if (!active || !root.contains(active)) return false;
    return !!(active.matches && active.matches('input, textarea, select'));
  }

  function activeTabOwnsItsRefresh(){
    return state.activeTab === 'auto' || state.activeTab === 'texts';
  }

  async function loadAll(force){
    root = document.getElementById('shoutoutModule');
    if (!root) return;
    if (!force && isEditingField()) {
      scheduleRefresh();
      return;
    }
    if (state.loading && !force) return;
    const skipRenderForOwnedPanel = !force && activeTabOwnsItsRefresh();
    state.loading = true;
    state.error = '';
    if (!skipRenderForOwnedPanel && !isEditingField()) render();
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
      if (!skipRenderForOwnedPanel && (!isEditingField() || force)) render();
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
        <div class="shoutout-hero-head">
          <div>
            <div class="shoutout-kicker">CGN Shoutout-System</div>
            <h2>Shoutouts verwalten</h2>
            <p>Manuelle Shoutouts, AutoShoutouts, Warteschlangen, Texte, Auswertung und Shoutout-spezifische Prüfung an einem Ort.</p>
          </div>
          <div class="shoutout-hero-actions">
            <span class="shoutout-refresh-state">Auto-Refresh aktiv</span>
            <button type="button" data-shoutout-refresh>Aktualisieren</button>
          </div>
        </div>
        <div class="shoutout-hero-grid">
          <div class="shoutout-metric"><small>System</small><strong>${esc(status.moduleVersion || '-')}</strong><span>${statusBadge(status.enabled === false ? 'inactive' : 'active')}</span></div>
          <div class="shoutout-metric"><small>Chatbefehl</small><strong>!${esc(status.command || 'vso')}</strong><span>${esc((status.aliases || []).map(x => `!${x}`).join(', ') || '-')}</span></div>
          <div class="shoutout-metric"><small>Overlay offen</small><strong>${esc(display.pending ?? 0)}</strong><span>${display.cooldownRunning ? `Wartezeit ${fmtMs(display.cooldownRemainingMs)}` : 'bereit'}</span></div>
          <div class="shoutout-metric"><small>Twitch offen</small><strong>${esc(official.pending ?? 0)}</strong><span>${statusBadge(liveGate.reason || (liveGate.live ? 'live' : 'offline'))}</span></div>
          <div class="shoutout-metric"><small>Eingehend</small><strong>${esc(num(state.inboundStats?.totals?.incomingTotal))}</strong><span>${esc(num(state.inboundStats?.totals?.outgoingTotal))} erstellt</span></div>
          <div class="shoutout-metric"><small>Stream</small><strong>${liveGate.live ? 'LIVE' : 'OFFLINE'}</strong><span>${esc(liveGate.upstreamSource || ss.source || '-')} · ${liveGate.stale ? 'veraltet' : 'frisch'}</span></div>
        </div>
      </div>
    `;
  }

  function activeTabInfo(){
    const map = {
      overview: ['Übersicht', 'Kurzstatus ohne Bearbeitung: läuft das System, wartet etwas oder gibt es ein Problem?'],
      chat: ['Shoutout', 'Hier können berechtigte Nutzer einen Shoutout manuell aufnehmen.'],
      auto: ['AutoShoutout', 'Betrieb und Streamer-Verwaltung für automatische Shoutouts. Texte und globale Config gehören nicht hierhin.'],
      queues: ['Queues', 'Warteschlangen für Overlay- und offizielle Twitch-Shoutouts.'],
      texts: ['Texte', 'Alle Chat- und Systemtexte mit Varianten an einem Ort.'],
      analytics: ['Auswertung', 'Statistik, Verlauf und eingehende/erstellte Twitch-Shoutouts.'],
      diagnostics: ['Diagnose', 'Nur Shoutout-spezifische Prüfung. Die allgemeine Systemdiagnose bleibt im Admin-Bereich.'],
      settings: ['Einstellungen', 'Config-Übersicht. Später editierbar mit Rechten, Validierung und Audit-Logging.']
    };
    return map[state.activeTab] || map.overview;
  }

  function renderTabs(){
    const [title, help] = activeTabInfo();
    return `
      <div class="shoutout-nav-sticky">
        <div class="shoutout-nav-head">
          <strong>${esc(title)}</strong>
          <span>${esc(help)}</span>
        </div>
        <div class="shoutout-tabs" role="tablist" aria-label="Shoutout Bereiche">
          ${TABS.map(tab => `
            <button type="button" role="tab" aria-selected="${state.activeTab === tab.id ? 'true' : 'false'}" class="shoutout-tab ${state.activeTab === tab.id ? 'active' : ''}" data-shoutout-tab="${esc(tab.id)}">${esc(tab.label)}</button>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderTestBox(){
    return `
      <div class="shoutout-card">
        <div class="shoutout-card-head">
          <div><h3>Shoutout manuell starten</h3><p>Trage einen Twitch-Kanal ein. Das System nimmt den Shoutout in die passende Warteschlange auf.</p></div>
        </div>
        <div class="shoutout-run-row">
          <input data-shoutout-target type="text" placeholder="Twitch-Kanal, z. B. urlug" autocomplete="off" />
          <label class="shoutout-check" title="Ignoriert bestimmte Sperren. Nur nutzen, wenn du sicher bist."><input data-shoutout-force type="checkbox" /> Erzwingen</label>
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
    const ss = state.streamStatus || {};
    const displayTarget = display.activeTarget || display.active_target || '';
    const displayState = displayTarget ? 'aktiv' : (display.cooldownRunning ? 'Cooldown' : ((num(display.pending) > 0) ? 'wartet' : 'bereit'));
    const displayDetail = display.cooldownRunning ? `noch ${fmtMs(display.cooldownRemainingMs)}` : (displayTarget ? `@${displayTarget}` : '');
    const officialState = official.lastError ? 'Fehler' : ((num(official.pending) > 0) ? 'wartet' : 'bereit');
    const officialDetail = official.lastError || (liveGate.reason && !['live','offline'].includes(String(liveGate.reason).toLowerCase()) ? liveGate.reason : '');
    const streamState = liveGate.live || ss.live ? 'LIVE' : ((liveGate.statusKnown === false || ss.statusKnown === false) ? 'UNBEKANNT' : 'OFFLINE');
    const streamDetail = (liveGate.stale || ss.stale) ? 'stale' : '';
    const gateState = liveGate.reason || (liveGate.live ? 'live' : 'offline');
    const gateDetail = liveGate.statusKnown === false ? 'Status unklar' : (liveGate.retryMs ? `Retry ${fmtMs(liveGate.retryMs)}` : '');
    const lastError = display.lastError || official.lastError || status.lastError || '';

    return `
      <div class="shoutout-tab-panel shoutout-grid">
        <div class="shoutout-card">
          <div class="shoutout-card-head"><div><h3>System-Ampel</h3></div></div>
          <div class="shoutout-facts">
            <div><small>Modul</small><strong>${statusBadge(status.enabled === false ? 'inaktiv' : 'aktiv')}</strong></div>
            <div><small>Stream</small><strong>${statusBadge(streamState)}</strong>${streamDetail ? `<span>${esc(streamDetail)}</span>` : ''}</div>
            <div><small>Live-Gate</small><strong>${statusBadge(gateState)}</strong>${gateDetail ? `<span>${esc(gateDetail)}</span>` : ''}</div>
            <div><small>Display Queue</small><strong>${statusBadge(displayState)}</strong>${displayDetail ? `<span>${esc(displayDetail)}</span>` : ''}</div>
            <div><small>Official Queue</small><strong>${statusBadge(officialState)}</strong>${officialDetail ? `<span>${esc(officialDetail)}</span>` : ''}</div>
            ${lastError ? `<div class="shoutout-fact-warning"><small>Letzter Fehler</small><strong>${esc(lastError)}</strong></div>` : ''}
          </div>
        </div>
        <div class="shoutout-card">
          <div class="shoutout-card-head"><div><h3>Statistik kompakt</h3></div></div>
          <div class="shoutout-stat-grid shoutout-stat-grid-small">
            <div class="shoutout-stat"><small>Gesamt</small><strong>${esc(num(totals.totalRequests))}</strong></div>
            <div class="shoutout-stat"><small>Ziele</small><strong>${esc(num(totals.uniqueTargets))}</strong></div>
            <div class="shoutout-stat"><small>Auslöser</small><strong>${esc(num(totals.uniqueRequesters))}</strong></div>
            <div class="shoutout-stat"><small>Official</small><strong>${esc(num(totals.officialSent))}</strong>${num(totals.officialFailed) ? `<span>${esc(num(totals.officialFailed))} failed</span>` : ''}</div>
            <div class="shoutout-stat"><small>Eingehend</small><strong>${esc(num(state.inboundStats?.totals?.incomingTotal))}</strong></div>
          </div>
        </div>
        <div class="shoutout-card shoutout-wide">
          <div class="shoutout-card-head"><div><h3>Letzte Aktivität</h3></div></div>
          <div class="shoutout-activity-list">
            ${latest.length ? latest.map(row => `
              <div class="shoutout-activity-row">
                <span>#${esc(row.id)}</span>
                <strong>@${esc(row.targetDisplay || row.targetLogin || '-')}</strong>
                ${statusBadge(row.status)}
                <time>${fmtDate(row.requestedAt)}</time>
              </div>
            `).join('') : '<span class="shoutout-empty-inline">Noch keine Timeline-Einträge.</span>'}
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
    const recentRows = rows.slice(0, 10);
    const hasError = inboundStats.ok === false || inbound.ok === false;

    return `
      <div class="shoutout-tab-panel shoutout-grid">
        <div class="shoutout-card shoutout-wide">
          <div class="shoutout-card-head">
            <div><h3>Eingehende / erstellte Twitch-Shoutouts</h3><p>EventSub-Shoutouts, kompakt zusammengefasst.</p></div>
            <div>${statusBadge(hasError ? 'error' : 'ok')}</div>
          </div>
          <div class="shoutout-stat-grid shoutout-stat-grid-clean">
            <div class="shoutout-stat"><small>Events gesamt</small><strong>${esc(num(totals.totalEvents))}</strong></div>
            <div class="shoutout-stat"><small>Eingehend</small><strong>${esc(num(totals.incomingTotal))}</strong></div>
            <div class="shoutout-stat"><small>Ausgehend</small><strong>${esc(num(totals.outgoingTotal))}</strong></div>
            <div class="shoutout-stat"><small>Von Channels</small><strong>${esc(num(totals.uniqueFromChannels))}</strong></div>
            <div class="shoutout-stat"><small>Viewer Summe</small><strong>${esc(num(totals.viewerCountTotal))}</strong></div>
          </div>
          ${hasError ? `<div class="shoutout-compact-note bad">${esc(inbound.error || inboundStats.error || 'Fehler beim Laden der Shoutout-Events.')}</div>` : ''}
        </div>

        <div class="shoutout-card">
          <div class="shoutout-card-head"><div><h3>Wer hat uns geshoutoutet?</h3></div></div>
          <div class="shoutout-table-wrap">
            <table class="shoutout-table shoutout-table-compact">
              <thead><tr><th>Kanal</th><th>Anzahl</th><th>Viewer</th><th>Zuletzt</th></tr></thead>
              <tbody>
                ${incomingByFrom.length ? incomingByFrom.slice(0, 10).map(row => `
                  <tr>
                    <td>${userCell(row.display, row.login)}</td>
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
          <div class="shoutout-card-head"><div><h3>Wen haben wir offiziell geshoutoutet?</h3></div></div>
          <div class="shoutout-table-wrap">
            <table class="shoutout-table shoutout-table-compact">
              <thead><tr><th>Kanal</th><th>Anzahl</th><th>Viewer</th><th>Zuletzt</th></tr></thead>
              <tbody>
                ${outgoingByTarget.length ? outgoingByTarget.slice(0, 10).map(row => `
                  <tr>
                    <td>${userCell(row.display, row.login)}</td>
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
          <div class="shoutout-card-head"><div><h3>Letzte Shoutout-Events</h3><p>Die letzten 10 gespeicherten EventSub-Shoutouts.</p></div></div>
          <div class="shoutout-table-wrap">
            <table class="shoutout-table shoutout-table-inbound-events">
              <thead><tr><th>ID</th><th>Richtung</th><th>Von</th><th>An</th><th>Viewer</th><th>Gestartet</th><th>Empfangen</th></tr></thead>
              <tbody>
                ${recentRows.length ? recentRows.map(row => `
                  <tr>
                    <td>${esc(row.id)}</td>
                    <td>${directionBadge(row.direction || '-')}</td>
                    <td>${userCell(row.fromBroadcasterDisplay, row.fromBroadcasterLogin)}</td>
                    <td>${userCell(row.toBroadcasterDisplay, row.toBroadcasterLogin)}</td>
                    <td>${esc(row.viewerCount || 0)}</td>
                    <td>${fmtDate(row.startedAt)}</td>
                    <td>${fmtDate(row.receivedAt)}</td>
                  </tr>
                `).join('') : '<tr><td colspan="7" class="shoutout-empty">Noch keine Shoutout-Events gespeichert.</td></tr>'}
              </tbody>
            </table>
          </div>
          ${rows.length > recentRows.length ? `<div class="shoutout-compact-note">${esc(recentRows.length)} von ${esc(rows.length)} geladenen Events angezeigt. Details bleiben in Verlauf/Statistik.</div>` : ''}
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
    const targetLimit = 10;
    const requesterLimit = 10;
    const pairLimit = 20;
    const shownTargetStats = targetStats.slice(0, targetLimit);
    const shownRequesterStats = requesterStats.slice(0, requesterLimit);
    const shownPairStats = pairStats.slice(0, pairLimit);
    const officialFailed = num(totals.officialFailed);
    const overrideCount = num(totals.overrideCount);

    return `
      <div class="shoutout-card shoutout-wide">
        <div class="shoutout-card-head">
          <div><h3>Statistik</h3><p>Detailauswertung für Ziele, Auslöser und häufige Kombinationen.</p></div>
          <div>${statusBadge(stats.ok === false ? 'error' : 'ok')}</div>
        </div>

        <div class="shoutout-stat-grid shoutout-stat-grid-clean">
          <div class="shoutout-stat"><small>Shoutouts gesamt</small><strong>${esc(num(totals.totalRequests))}</strong></div>
          <div class="shoutout-stat"><small>Zielkanäle</small><strong>${esc(num(totals.uniqueTargets))}</strong></div>
          <div class="shoutout-stat"><small>Auslöser</small><strong>${esc(num(totals.uniqueRequesters))}</strong></div>
          <div class="shoutout-stat"><small>Official gesendet</small><strong>${esc(num(totals.officialSent))}</strong>${officialFailed ? `<span>${esc(officialFailed)} fehlgeschlagen</span>` : ''}</div>
          <div class="shoutout-stat"><small>--force</small><strong>${esc(overrideCount)}</strong></div>
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
            <div class="shoutout-section-head"><h4>Zielkanäle</h4>${targetStats.length > targetLimit ? `<span>Top ${esc(targetLimit)} von ${esc(targetStats.length)}</span>` : ''}</div>
            <div class="shoutout-table-wrap">
              <table class="shoutout-table shoutout-table-compact">
                <thead><tr><th>Ziel</th><th>Anzahl</th><th>Done</th><th>Auslöser</th><th>Zuletzt</th></tr></thead>
                <tbody>
                  ${shownTargetStats.length ? shownTargetStats.map(row => `
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
            <div class="shoutout-section-head"><h4>Auslöser</h4>${requesterStats.length > requesterLimit ? `<span>Top ${esc(requesterLimit)} von ${esc(requesterStats.length)}</span>` : ''}</div>
            <div class="shoutout-table-wrap">
              <table class="shoutout-table shoutout-table-compact">
                <thead><tr><th>Auslöser</th><th>Anzahl</th><th>Ziele</th><th>--force</th><th>Zuletzt</th></tr></thead>
                <tbody>
                  ${shownRequesterStats.length ? shownRequesterStats.map(row => `
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

        <div class="shoutout-section-head shoutout-section-head-wide"><h4>Wer → Wen</h4>${pairStats.length > pairLimit ? `<span>Top ${esc(pairLimit)} von ${esc(pairStats.length)}</span>` : ''}</div>
        <div class="shoutout-table-wrap shoutout-stats-pairs">
          <table class="shoutout-table shoutout-table-compact">
            <thead><tr><th>Auslöser</th><th>Ziel</th><th>Anzahl</th><th>Done</th><th>--force</th><th>Zuletzt</th></tr></thead>
            <tbody>
              ${shownPairStats.length ? shownPairStats.map(row => `
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
          <div><h3>Display-Queue</h3><p>Video-/Overlay-Anzeigen.</p></div>
          <div>${queueStatusBadge(display.workerStarted)}</div>
        </div>
        ${rows.length ? `
          <div class="shoutout-table-wrap">
            <table class="shoutout-table">
              <thead><tr><th>ID</th><th>Ziel</th><th>Status</th><th>Verfügbar</th><th>Start</th><th>Fehler</th><th>Aktion</th></tr></thead>
              <tbody>
                ${rows.map(row => `
                  <tr>
                    <td>${esc(row.id)}</td>
                    <td><strong>@${esc(row.target_display || row.target_login || '-')}</strong><small>${esc(row.requested_by_display || row.requested_by_login || '')}</small></td>
                    <td>${statusBadge(row.status)}</td>
                    <td>${fmtDate(row.available_at)}</td>
                    <td>${fmtDate(row.started_at)}</td>
                    <td>${esc(row.last_error || '')}</td>
                    <td class="shoutout-actions"><button data-display-retry="${esc(row.id)}">Retry</button><button data-display-remove="${esc(row.id)}">Remove</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : renderQueueEmpty('Keine Display-Einträge offen.')}
      </div>
    `;
  }

  function renderOfficialQueue(){
    const official = state.queue?.officialQueue || state.status?.officialQueue || {};
    const rows = officialRows();
    return `
      <div class="shoutout-card">
        <div class="shoutout-card-head">
          <div><h3>Official-Queue</h3><p>Offizielle Twitch-Shoutouts.</p></div>
          <div>${queueStatusBadge(official.workerStarted)}</div>
        </div>
        ${rows.length ? `
          <div class="shoutout-table-wrap">
            <table class="shoutout-table">
              <thead><tr><th>ID</th><th>Ziel</th><th>Status</th><th>Verfügbar</th><th>Gesendet</th><th>Fehler</th><th>Aktion</th></tr></thead>
              <tbody>
                ${rows.map(row => `
                  <tr>
                    <td>${esc(row.id)}</td>
                    <td><strong>@${esc(row.target_display || row.target_login || '-')}</strong>${row.target_user_id ? `<small>User-ID ${esc(row.target_user_id)}</small>` : ''}</td>
                    <td>${statusBadge(row.status)}</td>
                    <td>${fmtDate(row.available_at)}</td>
                    <td>${fmtDate(row.sent_at)}</td>
                    <td>${esc(row.last_error || '')}</td>
                    <td class="shoutout-actions"><button data-official-retry="${esc(row.id)}">Retry</button><button data-official-remove="${esc(row.id)}">Remove</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : renderQueueEmpty('Keine offiziellen Shoutouts offen.')}
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
    const allRows = timelineRows();
    const visibleRows = allRows.slice(0, 30);
    const hiddenCount = Math.max(0, allRows.length - visibleRows.length);
    return `
      <div class="shoutout-card shoutout-wide">
        <div class="shoutout-card-head">
          <div><h3>Timeline</h3><p>Ausgehende Shoutout-Anfragen mit Display- und Official-Status.</p></div>
          ${hiddenCount ? `<div class="shoutout-section-count">Top ${esc(visibleRows.length)} von ${esc(allRows.length)}</div>` : ''}
        </div>
        <div class="shoutout-table-wrap shoutout-timeline-wrap">
          <table class="shoutout-table shoutout-table-timeline">
            <thead><tr><th>ID</th><th>Ziel</th><th>Display</th><th>Angefragt</th><th>Gestartet</th><th>Beendet</th><th>Official</th></tr></thead>
            <tbody>
              ${visibleRows.length ? visibleRows.map(row => {
                const officialStatus = row.officialResult || row.officialStatus || '-';
                const officialError = compactErrorText(row.officialError || '');
                return `
                  <tr>
                    <td>${esc(row.id)}</td>
                    <td class="shoutout-timeline-target">
                      <strong>@${esc(row.targetDisplay || row.targetLogin || '-')}</strong>
                      ${row.overrideUsed ? '<span class="shoutout-badge warn">--force</span>' : ''}
                    </td>
                    <td>${translatedStatusBadge(row.status)}</td>
                    <td>${fmtDate(row.requestedAt)}</td>
                    <td>${fmtDate(row.displayStartedAt)}</td>
                    <td>${fmtDate(row.displayFinishedAt)}</td>
                    <td>${translatedStatusBadge(officialStatus)}${officialError ? `<small class="shoutout-error-short" title="${esc(row.officialError || officialError)}">${esc(officialError)}</small>` : ''}</td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="7" class="shoutout-empty">Noch keine Timeline-Einträge.</td></tr>'}
            </tbody>
          </table>
        </div>
        ${hiddenCount ? `<div class="shoutout-compact-note">Zeige die letzten ${esc(visibleRows.length)} von ${esc(allRows.length)} geladenen Einträgen. Rohdaten bleiben im Backend unverändert.</div>` : ''}
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

  function renderChat(){
    return `
      <div class="shoutout-tab-panel shoutout-grid">
        ${renderTestBox()}
        ${renderLiveGate()}
      </div>
    `;
  }

  function renderAnalytics(){
    return `
      <div class="shoutout-tab-panel shoutout-section-stack">
        <div class="shoutout-section-note">Statistik, Verlauf und Twitch-Shoutout-Eingänge sind hier gebündelt. Details werden nur hier gezeigt, damit nichts doppelt in anderen Tabs auftaucht.</div>
        ${renderStats()}
        ${renderTimeline()}
        ${renderInbound()}
      </div>
    `;
  }

  function renderDiagnostics(){
    return `
      <div class="shoutout-tab-panel shoutout-section-stack">
        <div class="shoutout-section-note">Nur Shoutout-spezifische Prüfung: Twitch-Berechtigungen, Shoutout-Ereignisse, Live-Gate und Live-Test. Allgemeine Systemdiagnose bleibt unter Admin > Diagnose.</div>
        ${renderProductionCheck()}
        ${renderLiveTest()}
      </div>
    `;
  }

  function renderActiveTab(){
    if (state.activeTab === 'chat') return renderChat();
    if (state.activeTab === 'auto') return '<div id="autoShoutoutTabPanel" class="shoutout-tab-panel auto-so-tab-panel"></div>';
    if (state.activeTab === 'queues') return renderQueues();
    if (state.activeTab === 'texts') return '<div id="shoutoutTextsTabPanel" class="shoutout-tab-panel shoutout-texts-panel"></div>';
    if (state.activeTab === 'analytics') return renderAnalytics();
    if (state.activeTab === 'diagnostics') return renderDiagnostics();
    if (state.activeTab === 'settings') return renderSettingsTest();
    return renderOverview();
  }

  function afterRenderActiveTab(){
    const active = state.activeTab;
    setTimeout(() => {
      if (!document.getElementById('shoutoutModule')) return;
      if (active === 'auto') window.AutoShoutoutModule?.activateAutoTab?.();
      else window.AutoShoutoutModule?.deactivateAutoTab?.();

      if (active === 'texts') window.ShoutoutTextsModule?.activate?.();
      else window.ShoutoutTextsModule?.deactivate?.();
    }, 0);
  }

  function render(){
    root = document.getElementById('shoutoutModule');
    if (!root) return;
    root.innerHTML = `
      <div class="shoutout-shell">
        ${state.error ? `<div class="shoutout-alert bad">${esc(state.error)}</div>` : ''}
        ${state.notice ? `<div class="shoutout-alert ok">${esc(state.notice)}</div>` : ''}
        ${renderHero()}
        ${renderTabs()}
        <div class="shoutout-content-frame" data-shoutout-active-section="${esc(state.activeTab)}">${renderActiveTab()}</div>
      </div>
    `;
    afterRenderActiveTab();
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
