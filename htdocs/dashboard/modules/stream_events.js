window.StreamEventsModule = (function(){
  'use strict';

  const MODULE_VERSION = "0.5.57";
  const MODULE_BUILD = "STEP_EVS52_21T_DASHBOARD_EVENTS_NOQUERY_FALLBACK";

  const api = {
    status: '/api/stream-events/status',
    list: '/api/stream-events/events',
    events: '/api/stream-events/events',
    texts: '/api/stream-events/texts',
    config: '/api/stream-events/config',
    textRuntimeReport: '/api/stream-events/text-runtime/report',
    soundRuntimeReport: '/api/stream-events/sound-runtime/report',
    statisticsUsers: '/api/stream-events/statistics/users',
    statisticsUser: '/api/stream-events/statistics/user',
    chatOutputStatus: '/api/stream-events/chat-output/status',
    chatOutputReport: '/api/stream-events/chat-output/report',
    chatOutputTestDispatch: '/api/stream-events/chat-output/test-dispatch',
    runtimeGateStatus: '/api/stream-events/runtime-gate/status',
    soundSkipWait: '/api/stream-events/sound-runtime/skip-wait',
    commandEventTest: '/api/stream-events/commands/event/test'
  };

  let root = null;
  let state = {
    loading: false,
    saving: false,
    error: '',
    message: '',
    status: null,
    events: [],
    selectedUid: '',
    selected: null,
    ranking: null,
    texts: null,
    config: null,
    textRuntimeReport: null,
    soundRuntimeReport: null,
    statisticsUsers: null,
    chatOutputStatus: null,
    chatOutputReport: null,
    runtimeGateStatus: null,
    finalePreview: null,
    statsSubTab: 'overview',
    selectedStatsUser: '',
    userStatistics: null,
    userStatsModal: { open: false, login: '', eventUid: '', autoRefresh: true, intervalMs: 5000, lastScrollTop: 0, lastRefreshAt: '' },
    liveStatusModal: { open: false, eventUid: '', autoRefresh: true, intervalMs: 5000, lastRefreshAt: '' },
    soundControlAuto: { enabled: true, statusIntervalMs: 10000, lastRefreshAt: '' },
    nameDialog: null,
    configSaving: false,
    textSaving: false,
    textModuleFilter: 'all',
    textSearchFilter: '',
    modal: null,
    testPanel: { loading: false, result: null, error: '', message: '' },
    activeTab: 'overview'
  };

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c])); }
  function norm(v){ return String(v || '').trim().toLowerCase(); }
  function fmtDate(v){ if (!v) return '-'; const d = new Date(v); return Number.isNaN(d.getTime()) ? esc(v) : esc(d.toLocaleString('de-DE')); }
  function rows(v){ return Array.isArray(v) ? v : (Array.isArray(v?.rows) ? v.rows : []); }
  function eventRows(v){
    if (Array.isArray(v)) return v;
    if (Array.isArray(v?.rows)) return v.rows;
    if (Array.isArray(v?.events)) return v.events;
    if (Array.isArray(v?.items)) return v.items;
    if (Array.isArray(v?.data?.rows)) return v.data.rows;
    return [];
  }
  function selectedEvent(){
    const byUid = state.selectedUid ? state.events.find(e => e.eventUid === state.selectedUid) : null;
    if (byUid) return byUid;
    if (state.selected && (!state.selectedUid || state.selected.eventUid === state.selectedUid)) return state.selected;
    return state.events[0] || null;
  }

  function installIntoDashboard(){
    if (!window.CGN) return;
    window.CGN.modules.stream_events = window.CGN.modules.stream_events || {
      title: 'Event-System',
      panelId: 'streamEventsModule',
      group: 'community',
      overlayLink: '',
      reload(){ return window.StreamEventsModule?.loadAll?.(true); }
    };
    window.CGN.moduleCatalog.stream_events = window.CGN.moduleCatalog.stream_events || {
      label: 'Event-System',
      icon: '🎲',
      enabled: true,
      description: 'Stream-Events mit Sound-/Text-Spielen, Punktewertung und Top 3.'
    };
    const community = window.CGN.sections?.community;
    if (community && Array.isArray(community.items) && !community.items.includes('stream_events')) {
      const idx = community.items.indexOf('challenges');
      if (idx >= 0) community.items.splice(idx, 0, 'stream_events');
      else community.items.push('stream_events');
    }
    if (Array.isArray(window.CGN.favorites) && !window.CGN.favorites.includes('stream_events')) {
      window.CGN.favorites.push('stream_events');
    }
    if (window.CGN.activeModule === 'sectionhome' && window.CGN.activeSection === 'community') {
      window.SectionHomeModule?.render?.();
    }
  }

  function statusBadge(status){
    const s = norm(status);
    let cls = 'evs-badge-muted';
    if (s === 'active') cls = 'evs-badge-ok';
    else if (s === 'ready') cls = 'evs-badge-good';
    else if (s === 'draft') cls = 'evs-badge-warn';
    else if (s === 'finished' || s === 'archived') cls = 'evs-badge-info';
    else if (s === 'archived') cls = 'evs-badge-muted';
    else if (s === 'cancelled' || s === 'canceled') cls = 'evs-badge-off';
    const labels = { draft:'Entwurf', ready:'Startbereit', active:'Läuft', finished:'Beendet', archived:'Archiviert', cancelled:'Abgebrochen', canceled:'Abgebrochen' };
    return `<span class="evs-badge ${cls}">${esc(labels[s] || status || '-')}</span>`;
  }

  function statusText(status){
    const s = norm(status);
    const labels = { draft:'Entwurf', ready:'Startbereit', active:'Läuft', finished:'Beendet', archived:'Archiviert', cancelled:'Abgebrochen', canceled:'Abgebrochen' };
    return labels[s] || status || '-';
  }

  function issueLabel(issue){
    const key = String(issue || '');
    const map = {
      'event.name_missing': 'Eventname fehlt.',
      'event.no_game_type_selected': 'Mindestens Sound oder Text auswählen.',
      'sound.no_snippets': 'Sound ist aktiv, aber es gibt noch keinen Sound-Schnipsel.',
      'text.no_phrases': 'Text ist aktiv, aber es gibt noch keinen gültigen Geheimsatz.'
    };
    if (map[key]) return map[key];
    const soundMatch = key.match(/^sound\.snippet\.(\d+)\.(title_missing|media_missing|answers_missing)$/);
    if (soundMatch) {
      const number = soundMatch[1];
      const type = soundMatch[2];
      if (type === 'title_missing') return `Sound-Schnipsel ${number}: Name fehlt.`;
      if (type === 'media_missing') return `Sound-Schnipsel ${number}: Audio fehlt.`;
      if (type === 'answers_missing') return `Sound-Schnipsel ${number}: Antwort fehlt.`;
    }
    const textMatch = key.match(/^text\.phrase\.(\d+)\.(phrase_missing)$/);
    if (textMatch) return `Text-Satz ${textMatch[1]}: Geheimsatz fehlt.`;
    if (key.includes('.phrase_missing')) return 'Bei einem Text-Rätsel fehlt der Geheimsatz.';
    return key;
  }

  function warnLabel(warn){
    const key = String(warn || '');
    if (key === 'sound.answer_seconds_very_short') return 'Antwortzeit für Sound ist sehr kurz.';
    if (key.includes('.points_not_set')) return 'Beim Text-Rätsel sind keine Punkte gesetzt.';
    if (key === 'text.word_points_enabled_but_zero_points') return 'Wortpunkte sind aktiv, aber Punkte pro Wort stehen auf 0.';
    return key;
  }

  function validateLocalEventDraft(event){
    const ev = event || {};
    const issues = [];
    const warnings = [];
    const selected = [];
    if (!String(ev.name || '').trim()) issues.push('event.name_missing');
    if (ev.soundEnabled) selected.push('sound');
    if (ev.textEnabled) selected.push('text');
    if (!selected.length) issues.push('event.no_game_type_selected');

    if (ev.soundEnabled) {
      const sound = ev.soundConfig || {};
      const snippets = Array.isArray(sound.snippets) ? sound.snippets : [];
      if (!snippets.length) issues.push('sound.no_snippets');
      snippets.forEach((snippet, index) => {
        const nr = index + 1;
        if (!String(snippet?.title || snippet?.name || '').trim()) issues.push(`sound.snippet.${nr}.title_missing`);
        if (!String(snippet?.mediaId || snippet?.mediaPath || snippet?.file || snippet?.snippetMediaId || '').trim()) issues.push(`sound.snippet.${nr}.media_missing`);
        const rawAnswers = Array.isArray(snippet?.acceptedAnswers) ? snippet.acceptedAnswers : (Array.isArray(snippet?.answers) ? snippet.answers : []);
        if (!rawAnswers.map(value => String(value || '').trim()).filter(Boolean).length) issues.push(`sound.snippet.${nr}.answers_missing`);
      });
      const answerSeconds = Number(sound.answerSeconds ?? sound.defaultAnswerSeconds ?? 60);
      if (Number.isFinite(answerSeconds) && answerSeconds < 10) warnings.push('sound.answer_seconds_very_short');
    }

    if (ev.textEnabled) {
      const text = ev.textConfig || {};
      const phrases = Array.isArray(text.phrases) ? text.phrases : [];
      if (!phrases.length) issues.push('text.no_phrases');
      phrases.forEach((phrase, index) => {
        const nr = index + 1;
        if (!String(phrase?.phrase || phrase?.text || phrase?.solution || '').trim()) issues.push(`text.phrase.${nr}.phrase_missing`);
        const points = Number(phrase?.pointsFirst ?? phrase?.points ?? 0);
        if (!Number.isFinite(points) || points <= 0) warnings.push(`text.phrase.${nr}.points_not_set`);
      });
      if (text.wordPointsEnabled === true && Number(text.pointsPerNewWord ?? text.wordPointsPerNewWord ?? 0) <= 0) warnings.push('text.word_points_enabled_but_zero_points');
    }

    return {
      ok: issues.length === 0,
      startable: issues.length === 0,
      issues,
      warnings,
      selectedGameTypes: selected
    };
  }

  function renderDraftValidation(validation, sourceLabel = 'Entwurf'){
    const issues = Array.isArray(validation?.issues) ? validation.issues : [];
    const warnings = Array.isArray(validation?.warnings) ? validation.warnings : [];
    if (!issues.length && !warnings.length) return `<div class="evs-valid-ok">✅ ${esc(sourceLabel)} ist startbereit.</div>`;
    return `
      <div class="evs-validation">
        ${issues.length ? `<div class="evs-validation-block"><strong>Noch nötig:</strong>${issues.map(i => `<div>• ${esc(issueLabel(i))}</div>`).join('')}</div>` : ''}
        ${warnings.length ? `<div class="evs-validation-block evs-validation-warn"><strong>Hinweise:</strong>${warnings.map(i => `<div>• ${esc(warnLabel(i))}</div>`).join('')}</div>` : ''}
      </div>
    `;
  }

  function renderValidation(event){
    const validation = event?.validation || {};
    const issues = Array.isArray(validation.issues) ? validation.issues : [];
    const warnings = Array.isArray(validation.warnings) ? validation.warnings : [];
    const status = norm(event?.status);
    if (!event) return '<div class="evs-empty">Kein Event ausgewählt.</div>';
    if (status === 'active') return '<div class="evs-valid-ok is-live">🟢 Event läuft.</div>';
    if (status === 'finished') return '<div class="evs-valid-ok">🏁 Event ist beendet.</div>';
    if (status === 'archived') return '<div class="evs-empty">Event ist archiviert.</div>';
    if (status === 'cancelled' || status === 'canceled') return '<div class="evs-validation"><div class="evs-validation-block evs-validation-warn"><strong>Abgebrochen:</strong><div>Dieses Event wurde abgebrochen.</div></div></div>';
    if (issues.length === 0 && warnings.length === 0) return '<div class="evs-valid-ok">✅ Event ist startbereit.</div>';
    return `
      <div class="evs-validation">
        ${issues.length ? `<div class="evs-validation-block"><strong>Noch nötig:</strong>${issues.map(i => `<div>• ${esc(issueLabel(i))}</div>`).join('')}</div>` : ''}
        ${warnings.length ? `<div class="evs-validation-block evs-validation-warn"><strong>Hinweise:</strong>${warnings.map(i => `<div>• ${esc(warnLabel(i))}</div>`).join('')}</div>` : ''}
      </div>
    `;
  }

  function eventTypes(event){
    const list = [];
    if (event?.soundEnabled) list.push('Sound');
    if (event?.textEnabled) list.push('Text');
    return list.length ? list.join(' + ') : '-';
  }


  function runtimeReport(){ return state.textRuntimeReport || null; }
  function runtimeReportFor(event){ const report = runtimeReport(); return event && report && report.eventUid === event.eventUid ? report : null; }
  function soundRuntimeReport(){ return state.soundRuntimeReport || null; }
  function soundRuntimeReportFor(event){ const report = soundRuntimeReport(); return event && report && report.eventUid === event.eventUid ? report : null; }
  function statisticsUsers(){ return Array.isArray(state.statisticsUsers?.users) ? state.statisticsUsers.users : []; }
  function statisticsUsersForEvent(event){
    if (!event || !state.statisticsUsers || state.statisticsUsers.eventUid !== event.eventUid) return [];
    return Array.isArray(state.statisticsUsers.users) ? state.statisticsUsers.users : [];
  }
  function rankingRowsForEvent(event){
    if (!event || !state.ranking || state.ranking.eventUid !== event.eventUid) return [];
    return rows(state.ranking.rows);
  }
  function userStatistics(){ return state.userStatistics || null; }
  function reportCount(report, key){ return Number(report?.counts?.[key] || 0); }
  function chatOutputText(output){ return output?.text || output?.chatText || ''; }
  function chatKindLabel(kind){
    const map = { word_found: 'Worttreffer', word_points_added: 'Wortpunkte', phrase_solved: 'Satz gelöst', sound_round_started: 'Sound gestartet', sound_solved: 'Sound gelöst', sound_unresolved: 'Sound ungelöst' };
    return map[kind] || kind || 'Chat-Output';
  }

  function render(){
    root = document.getElementById('streamEventsModule');
    if (!root) return;
    const ev = selectedEvent();
    state.selected = ev;

    root.innerHTML = `
      <div class="evs-page">
        <div class="evs-header glass">
          <div>
            <div class="evs-kicker">EVS52.21T · Eventliste stabil geladen</div>
            <h2>Event-System</h2>
            <p>Übersicht zeigt den aktuellen Event-Stand und die nächste sinnvolle Aktion.</p>
          </div>
          <div class="evs-header-actions">
            <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="reload">Aktualisieren</button>
            <button type="button" class="evs-btn" data-evs-action="new">Neues Event</button>
          </div>
        </div>

        ${state.error ? `<div class="evs-alert evs-alert-error">${esc(state.error)}</div>` : ''}
        ${state.message ? `<div class="evs-alert evs-alert-ok">${esc(state.message)}</div>` : ''}

        ${renderTabs()}
        ${renderActiveTab(ev)}

        ${state.modal ? renderModal() : ''}
        ${state.userStatsModal?.open ? renderUserStatsModal() : ''}
        ${state.liveStatusModal?.open ? renderLiveStatusModal() : ''}
        ${state.nameDialog ? renderNameDialog() : ''}
      </div>
    `;
    attachMediaFields(root);
    startSoundControlAutoRefresh();
  }

  function tabs(){
    return [
      { id: 'overview', label: 'Übersicht', icon: '📋' },
      { id: 'current', label: 'Aktuelles Event', icon: '📊' },
      { id: 'events', label: 'Events', icon: '🎲' },
      { id: 'texts', label: 'Texte', icon: '💬' },
      { id: 'config', label: 'Config', icon: '⚙️' },
      { id: 'stats', label: 'Statistik', icon: '🏆' },
      { id: 'overlay', label: 'Overlay', icon: '🖥️' },
      { id: 'test', label: 'Test', icon: '🧪' }
    ];
  }

  function renderTabs(){
    return `
      <nav class="evs-tabs glass" aria-label="Event-System Bereiche">
        ${tabs().map(tab => `
          <button type="button" class="evs-tab ${state.activeTab === tab.id ? 'is-active' : ''}" data-evs-tab="${esc(tab.id)}">
            <span>${esc(tab.icon)}</span><b>${esc(tab.label)}</b>
          </button>
        `).join('')}
      </nav>
    `;
  }

  function renderActiveTab(event){
    const tab = state.activeTab || 'overview';
    if (tab === 'current') return renderCurrentEventTab(event);
    if (tab === 'events') return renderEventsTab(event);
    if (tab === 'texts') return renderTextsTab();
    if (tab === 'config') return renderConfigTab();
    if (tab === 'stats') return renderStatsTab(event);
    if (tab === 'safety') return renderOverviewTab(event);
    if (tab === 'overlay') return renderOverlayTab(event);
    if (tab === 'test') return renderTestTab(event);
    return renderOverviewTab(event);
  }

  function renderOverviewTab(ev){
    const activeEvents = state.events.filter(event => norm(event.status) === 'active');
    const activeEvent = activeEvents[0] || null;
    const displayEvent = activeEvent || ev || selectedEvent();
    return `
      <div class="evs-overview-main">
        ${renderOverviewStatusCard(activeEvent)}
        ${activeEvent ? renderOverviewProgressCard(activeEvent) : renderOverviewNoActiveCard()}
        ${activeEvent ? renderOverviewTopPlayersCard(activeEvent) : ''}
      </div>
    `;
  }

  function renderOverviewStatusCard(activeEvent){
    const gate = runtimeGate();
    const stream = gate?.stream || {};
    const hasRunningEvent = !!activeEvent;
    const runtimeActive = hasRunningEvent && gate?.active === true;
    const statusText = hasRunningEvent ? (runtimeActive ? 'AKTIV' : 'EVENT LÄUFT') : 'INAKTIV';
    const reasonText = hasRunningEvent
      ? (runtimeActive ? `${activeEvent.name || 'Event'} läuft.` : `${activeEvent.name || 'Event'} läuft, Runtime wartet auf gültige Bedingungen.`)
      : 'Kein Event läuft.';
    const bannerClass = hasRunningEvent ? (runtimeActive ? 'is-live' : 'is-warning') : 'is-safe';
    return `
      <section class="evs-card glass evs-tab-panel evs-overview-status-card">
        <div class="evs-card-head">
          <div>
            <h3>Event-System</h3>
            <span>${esc(reasonText)}</span>
          </div>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="reload">Aktualisieren</button>
        </div>
        <div class="evs-safety-banner ${bannerClass}">
          <strong>${hasRunningEvent ? (runtimeActive ? '🟢 AKTIV' : '🟡 EVENT LÄUFT') : '⚪ INAKTIV'}</strong>
          <span>${esc(reasonText)}</span>
        </div>
        <div class="evs-mini-grid evs-mini-grid-compact">
          <div><strong>${esc(stream.online ? 'Online' : 'Offline')}</strong><span>Stream</span></div>
          <div><strong>${esc(activeEvent?.name || '-')}</strong><span>Laufendes Event</span></div>
          <div><strong>${esc(activeEvent?.soundEnabled ? 'An' : 'Aus')}</strong><span>Sound-Spiel</span></div>
          <div><strong>${esc(activeEvent?.textEnabled ? 'An' : 'Aus')}</strong><span>Text-Spiel</span></div>
        </div>
      </section>
    `;
  }

  function renderOverviewNoActiveCard(){
    const readyEvents = state.events.filter(event => norm(event.status) === 'ready');
    const hint = readyEvents.length
      ? `${readyEvents.length} vorbereitete${readyEvents.length === 1 ? 's' : ''} Event${readyEvents.length === 1 ? '' : 's'} ${readyEvents.length === 1 ? 'ist' : 'sind'} startbereit.`
      : 'Lege ein neues Event an oder bereite eins im Tab „Events“ vor.';
    return `
      <section class="evs-card glass evs-tab-panel evs-overview-progress-card evs-overview-empty-action">
        <div class="evs-card-head">
          <div>
            <h3>Nächstes Event</h3>
            <span>${esc(hint)}</span>
          </div>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-tab="events">Events öffnen</button>
        </div>
        <div class="evs-empty evs-empty-action-text">Starte ein vorbereitetes Event oder erstelle ein neues Event.</div>
      </section>
    `;
  }

  function renderOverviewProgressCard(event){
    const soundCfg = event.soundConfig || {};
    const textCfg = event.textConfig || {};
    const soundTotal = Array.isArray(soundCfg.snippets) ? soundCfg.snippets.length : 0;
    const textTotal = Array.isArray(textCfg.phrases) ? textCfg.phrases.length : 0;
    const soundReport = soundRuntimeReportFor(event);
    const textReport = runtimeReportFor(event);
    const soundSolved = reportCount(soundReport, 'solved');
    const textSolved = reportCount(textReport, 'phraseSolves');
    const soundOpen = Math.max(soundTotal - soundSolved, 0);
    const textOpen = Math.max(textTotal - textSolved, 0);
    const rankingRows = rows(state.ranking?.rows);
    return `
      <section class="evs-card glass evs-tab-panel evs-overview-progress-card">
        <div class="evs-card-head">
          <div>
            <h3>Aufgaben & Fortschritt</h3>
            <span>${esc(event.name || 'Aktives Event')}</span>
          </div>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="refreshStatsCurrent" data-uid="${esc(event.eventUid)}">Werte neu laden</button>
        </div>
        <div class="evs-mini-grid evs-mini-grid-compact evs-overview-task-grid">
          <div><strong>${esc(soundTotal)}</strong><span>Sound-Aufgaben</span></div>
          <div><strong>${esc(soundSolved)}</strong><span>Sound gelöst</span></div>
          <div><strong>${esc(soundOpen)}</strong><span>Sound offen</span></div>
          <div><strong>${esc(textTotal)}</strong><span>Text-Aufgaben</span></div>
          <div><strong>${esc(textSolved)}</strong><span>Text gelöst</span></div>
          <div><strong>${esc(textOpen)}</strong><span>Text offen</span></div>
          <div><strong>${esc(rankingRows.length)}</strong><span>Teilnehmer</span></div>
          <div><strong>${esc(rankingRows[0]?.points || 0)}</strong><span>Top-Punkte</span></div>
        </div>
        ${renderOverviewLiveControls(event)}
        <div class="evs-action-row evs-action-row-tight">
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="selectEvent" data-uid="${esc(event.eventUid)}" data-target-tab="events">Event verwalten</button>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="finish" data-uid="${esc(event.eventUid)}">Event beenden</button>
        </div>
      </section>
    `;
  }

  function renderOverviewLiveControls(event){
    if (!event || norm(event.status) !== 'active') return '';
    const soundControl = event.soundEnabled ? renderOverviewSoundControl(event) : '';
    const statusButton = `<button type="button" class="evs-btn evs-btn-secondary" data-evs-action="openLiveStatus" data-uid="${esc(event.eventUid)}">Status & Punkte öffnen</button>`;
    return `
      <section class="evs-overview-live-control evs-runtime-box">
        <div class="evs-runtime-box-head">
          <div>
            <h4>Live-Bedienung</h4>
            <small>Direkte Steuerung für das laufende Event. Konfiguration bleibt im Events-Tab.</small>
          </div>
          <button type="button" class="evs-btn evs-btn-secondary evs-btn-small" data-evs-action="reload">Status neu laden</button>
        </div>
        ${soundControl}
        <div class="evs-action-row evs-action-row-tight">
          ${statusButton}
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="selectEvent" data-uid="${esc(event.eventUid)}" data-target-tab="events">Event verwalten</button>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="finish" data-uid="${esc(event.eventUid)}">Event beenden</button>
        </div>
      </section>
    `;
  }

  function renderOverviewSoundControl(event){
    const report = soundRuntimeReportFor(event);
    const canSkip = canShowSoundSkipWait(event, report);
    return `
      <div class="evs-overview-live-row">
        ${soundControlRows(event, report)}
        ${canSkip ? `<div class="evs-action-row evs-action-row-tight">
          <button type="button" class="evs-btn" data-evs-action="soundSkipWait" data-uid="${esc(event.eventUid)}">Wartezeit überspringen</button>
        </div>
        <small class="evs-muted">Überspringt die aktuelle Wartezeit und startet den nächsten Schnipsel über den normalen Event-Ablauf. Danach läuft die automatische Wartezeit wieder normal weiter.</small>` : `<small class="evs-muted">Wartezeit überspringen ist nur sichtbar, wenn das Event aktiv wartet und der Stream online ist.</small>`}
      </div>
    `;
  }

  function renderOverviewTopPlayersCard(event){
    const rankingRows = rankingRowsForEvent(event);
    return `
      <section class="evs-card glass evs-tab-panel evs-overview-ranking-card">
        <div class="evs-card-head">
          <div>
            <h3>Top-Spieler</h3>
            <span>Aktueller Punktestand im laufenden Event.</span>
          </div>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="ranking" data-uid="${esc(event.eventUid)}">Ranking neu laden</button>
        </div>
        <div class="evs-ranking evs-ranking-standalone">
          ${rankingRows.length ? rankingRows.slice(0, 5).map(row => `<div class="evs-rank-row"><strong>#${esc(row.rank)}</strong><span>${esc(row.userDisplayName || row.userLogin)}</span><b>${esc(row.points)} Punkte</b></div>`).join('') : '<div class="evs-empty">Noch keine Punkte.</div>'}
        </div>
      </section>
    `;
  }


  function currentEventCandidate(fallback){
    return state.events.find(event => norm(event.status) === 'active') || fallback || selectedEvent();
  }

  function renderCurrentEventTab(fallbackEvent){
    const event = currentEventCandidate(fallbackEvent);
    if (!event) {
      return `
        <section class="evs-card glass evs-tab-panel evs-current-event-card">
          <div class="evs-card-head">
            <div><h3>Aktuelles Event</h3><span>Live-Punkte und sortierte Rangliste.</span></div>
            <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="reload">Aktualisieren</button>
          </div>
          <div class="evs-empty">Noch kein Event vorhanden.</div>
        </section>
      `;
    }
    const isActive = norm(event.status) === 'active';
    const rankingRows = rankingRowsForEvent(event);
    const users = statisticsUsersForEvent(event);
    const totalPoints = users.reduce((sum, user) => sum + Number(user.totalPoints || 0), 0);
    const soundPoints = users.reduce((sum, user) => sum + Number(user.soundPoints || 0), 0);
    const textPoints = users.reduce((sum, user) => sum + Number(user.wordPoints || 0) + Number(user.phrasePoints || 0), 0);
    const manualPoints = users.reduce((sum, user) => sum + Number(user.manualPoints || 0), 0);
    const sortedUsers = users.length ? users : rankingRows.map(row => ({
      userLogin: row.userLogin,
      userDisplayName: row.userDisplayName,
      totalPoints: row.points,
      soundPoints: 0,
      wordPoints: 0,
      phrasePoints: 0,
      manualPoints: 0,
      scoreEntries: row.entries,
      lastActivityAt: row.lastPointsAt
    }));
    return `
      <div class="evs-current-event-main">
        <section class="evs-card glass evs-tab-panel evs-current-event-card">
          <div class="evs-card-head evs-stats-head">
            <div>
              <h3>Aktuelles Event</h3>
              <span>${esc(event.name || event.eventUid)} · ${esc(eventTypes(event))}</span>
            </div>
            <div class="evs-action-row evs-action-row-tight">
              ${statusBadge(event.status)}
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="refreshCurrentEventInfo" data-uid="${esc(event.eventUid)}">Aktualisieren</button>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="openLiveStatus" data-uid="${esc(event.eventUid)}" ${isActive ? '' : 'disabled'}>Live-Status</button>
              ${finaleActionButtonForEvent(event)}
            </div>
          </div>
          <div class="evs-mini-grid evs-mini-grid-compact evs-current-score-summary">
            <div><strong>${esc(sortedUsers.length)}</strong><span>Spieler mit Punkten</span></div>
            <div><strong>${esc(totalPoints || rankingRows.reduce((sum, row) => sum + Number(row.points || 0), 0))}</strong><span>Gesamtpunkte</span></div>
            <div><strong>${esc(soundPoints)}</strong><span>Sound-Punkte</span></div>
            <div><strong>${esc(textPoints)}</strong><span>Satz-/Text-Punkte</span></div>
          </div>
          ${manualPoints ? `<div class="evs-tab-help">Zusätzlich vorhanden: ${esc(manualPoints)} manuelle/sonstige Punkte.</div>` : ''}
          <div class="evs-current-ranking-head">
            <h4>Rangliste</h4>
            <span>Sortiert nach Gesamtpunkten in genau diesem Event. Loyalty-Punkte bleiben getrennt.</span>
          </div>
          <div class="evs-current-ranking-table">
            ${sortedUsers.length ? sortedUsers.map((user, index) => {
              const rank = Number(user.rank || index + 1);
              const textUserPoints = Number(user.wordPoints || 0) + Number(user.phrasePoints || 0);
              return `<button type="button" class="evs-current-player-row evs-current-player-button" data-evs-action="openUserStats" data-user-login="${esc(user.userLogin)}" data-uid="${esc(event.eventUid)}" title="Punkte-Details für ${esc(user.userDisplayName || user.userLogin)} öffnen">
                <strong>#${esc(rank)}</strong>
                <span class="evs-current-player-name">${esc(user.userDisplayName || user.userLogin)}</span>
                <b>${esc(user.totalPoints ?? user.points ?? 0)} Punkte</b>
                <small>Sound: ${esc(user.soundPoints || 0)} · Text: ${esc(textUserPoints)} · Einträge: ${esc(user.scoreEntries || user.entries || 0)}</small>
              </button>`;
            }).join('') : '<div class="evs-empty">Noch keine Punkte in diesem Event.</div>'}
          </div>
          <div class="evs-tab-help">Diese Ansicht liest nur Event-Punkte aus stream_events. Es wird nichts ins Loyalty-Konto geschrieben.</div>
        </section>
      </div>
    `;
  }

  function renderEventsTab(ev){
    return `
      <div class="evs-grid">
        <section class="evs-card glass">
          <div class="evs-card-head">
            <div>
              <h3>Konfigurierte Events</h3>
              <span>Entwürfe, startbereite, laufende und beendete Events.</span>
            </div>
            <button type="button" class="evs-btn evs-btn-small" data-evs-action="new">Neues Event</button>
          </div>
          <div class="evs-list">
            ${state.events.length ? state.events.map(renderEventRow).join('') : '<div class="evs-empty">Noch keine Events vorhanden.</div>'}
          </div>
        </section>

        <section class="evs-card glass">
          <div class="evs-card-head">
            <h3>Event-Details</h3>
            ${ev ? statusBadge(ev.status) : ''}
          </div>
          ${ev ? renderEventDetail(ev) : '<div class="evs-empty">Wähle links ein Event aus oder erstelle ein neues.</div>'}
        </section>
      </div>
    `;
  }

  function renderRunningEventCard(event){
    const sound = event.soundConfig || {};
    const text = event.textConfig || {};
    const snippets = Array.isArray(sound.snippets) ? sound.snippets.length : 0;
    const phrases = Array.isArray(text.phrases) ? text.phrases.length : 0;
    return `
      <article class="evs-running-card">
        <div class="evs-running-card-head">
          <div>
            <h3>${esc(event.name || 'Unbenanntes Event')}</h3>
            <span>${esc(eventTypes(event))}</span>
          </div>
          ${statusBadge(event.status)}
        </div>
        <p>${esc(event.description || 'Keine Beschreibung.')}</p>
        <div class="evs-mini-grid evs-mini-grid-compact">
          <div><strong>Sounds</strong><span>${esc(snippets)}</span></div>
          <div><strong>Sätze</strong><span>${esc(phrases)}</span></div>
          <div><strong>Wörter</strong><span>${esc(reportCount(runtimeReportFor(event), 'wordHits'))}</span></div>
          <div><strong>Lösungen</strong><span>${esc(reportCount(runtimeReportFor(event), 'phraseSolves'))}</span></div>
          <div><strong>Gestartet</strong><span>${fmtDate(event.startedAt)}</span></div>
          <div><strong>Geändert</strong><span>${fmtDate(event.updatedAt)}</span></div>
        </div>
        <div class="evs-action-row">
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="selectEvent" data-uid="${esc(event.eventUid)}" data-target-tab="stats">Statistik ansehen</button>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="edit" data-uid="${esc(event.eventUid)}">Bearbeiten</button>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="finish" data-uid="${esc(event.eventUid)}">Beenden</button>
        </div>
      </article>
    `;
  }

  function renderConfigTab(){
    const cfg = state.config?.config || {};
    const eventDefaults = cfg.eventDefaults || {};
    const soundDefaults = cfg.soundDefaults || {};
    const textDefaults = cfg.textDefaults || {};
    const overlayDefaults = cfg.overlayDefaults || {};
    return `
      <section class="evs-card glass evs-tab-panel evs-config-panel">
        <div class="evs-card-head">
          <div>
            <h3>Event-System Config</h3>
            <span>Globale Standardwerte. Einzelne Events können davon später abweichen.</span>
          </div>
          <button type="button" class="evs-btn" data-evs-action="saveConfig">Config speichern</button>
        </div>

        <div class="evs-text-rule-note">Diese Einstellungen sind die Voreinstellungen für neue Events und spätere Runtime-Regeln. Sie ersetzen keine Event-Bearbeitung.</div>

        <div class="evs-config-grid">
          <div class="evs-config-card">
            <div class="evs-config-card-head"><strong>Allgemein</strong><small>Grundverhalten des Event-Systems</small></div>
            <label><span>Top-Gewinner anzeigen</span><input id="evsCfgTopWinners" type="number" min="1" max="10" value="${esc(eventDefaults.defaultTopWinners ?? 3)}"></label>
            <label class="evs-check"><input id="evsCfgOneActive" type="checkbox" ${eventDefaults.allowOnlyOneActiveEvent !== false ? 'checked' : ''}> Nur ein aktives Event gleichzeitig</label>
            <label class="evs-check"><input id="evsCfgOverviewRunning" type="checkbox" ${eventDefaults.overviewShowsOnlyRunningEvents !== false ? 'checked' : ''}> Übersicht nur laufende Events</label>
          </div>

          <div class="evs-config-card evs-config-card-wide">
            <div class="evs-config-card-head"><strong>Sound-Spiel Defaults</strong><small>Standardwerte für neue Sound-Events</small></div>
            <label><span>Antwortzeit in Sekunden</span><input id="evsCfgSoundAnswerSeconds" type="number" min="5" max="300" value="${esc(soundDefaults.defaultAnswerSeconds ?? 60)}"></label>
            <label><span>Punkte pro Soundlösung</span><input id="evsCfgSoundPoints" type="number" min="0" max="10000" value="${esc(soundDefaults.defaultPoints ?? 10)}"></label>
            <label><span>Abspielmodus</span><select id="evsCfgSoundPlaybackMode">
              <option value="manual" ${soundDefaults.playbackMode === 'manual' ? 'selected' : ''}>Manuell</option>
              <option value="random_auto" ${(soundDefaults.playbackMode || 'random_auto') === 'random_auto' ? 'selected' : ''}>Zufällig automatisch</option>
              <option value="sequence_auto" ${soundDefaults.playbackMode === 'sequence_auto' ? 'selected' : ''}>Automatisch in Reihenfolge</option>
            </select></label>
            <div class="evs-two-cols evs-config-inline-grid">
              <label><span>Alle X Minuten</span><input id="evsCfgSoundIntervalMinutes" type="number" min="1" max="240" value="${esc(soundDefaults.intervalMinutes ?? 5)}"></label>
              <label><span>Zufallsabweichung ± Minuten</span><input id="evsCfgSoundIntervalJitter" type="number" min="0" max="120" value="${esc(soundDefaults.intervalJitterMinutes ?? 2)}"></label>
            </div>
            <label><span>Reihenfolge</span><select id="evsCfgSoundOrderMode">
              <option value="random" ${(soundDefaults.orderMode || 'random') === 'random' ? 'selected' : ''}>Zufällig</option>
              <option value="list" ${soundDefaults.orderMode === 'list' ? 'selected' : ''}>Listenreihenfolge</option>
            </select></label>
            <label><span>Wenn erkannt</span><select id="evsCfgSoundSolvedPolicy">
              <option value="remove_from_rotation" ${(soundDefaults.solvedPolicy || 'remove_from_rotation') === 'remove_from_rotation' ? 'selected' : ''}>Aus aktueller Rotation entfernen</option>
              <option value="keep_available" ${soundDefaults.solvedPolicy === 'keep_available' ? 'selected' : ''}>Später erneut möglich</option>
              <option value="manual" ${soundDefaults.solvedPolicy === 'manual' ? 'selected' : ''}>Manuell entscheiden</option>
            </select></label>
            <label><span>Wenn nicht erkannt</span><select id="evsCfgSoundUnresolved">
              <option value="requeue_later" ${(soundDefaults.unresolvedPolicy || 'requeue_later') === 'requeue_later' ? 'selected' : ''}>Später nochmal</option>
              <option value="remove" ${soundDefaults.unresolvedPolicy === 'remove' ? 'selected' : ''}>Aus Event entfernen</option>
              <option value="manual" ${soundDefaults.unresolvedPolicy === 'manual' ? 'selected' : ''}>Manuell entscheiden</option>
            </select></label>
            <div class="evs-two-cols evs-config-inline-grid">
              <label><span>Pause nach Runde in Sekunden</span><input id="evsCfgSoundRoundDelay" type="number" min="0" max="3600" value="${esc(soundDefaults.roundDelaySeconds ?? 5)}"></label>
              <label><span>Mindestabstand Wiederholung</span><input id="evsCfgSoundRepeatDistance" type="number" min="0" max="100" value="${esc(soundDefaults.minRepeatDistance ?? 3)}"></label>
            </div>
            <div class="evs-two-cols evs-config-inline-grid">
              <label><span>Ausgabeziel</span><select id="evsCfgSoundOutputTarget">
                <option value="default" ${(soundDefaults.outputTarget || 'default') === 'default' ? 'selected' : ''}>Sound-System Standard</option>
                <option value="overlay" ${soundDefaults.outputTarget === 'overlay' ? 'selected' : ''}>Overlay</option>
                <option value="device" ${soundDefaults.outputTarget === 'device' ? 'selected' : ''}>Gerät</option>
                <option value="both" ${soundDefaults.outputTarget === 'both' ? 'selected' : ''}>Beides</option>
              </select></label>
              <label><span>Ziel</span><select id="evsCfgSoundTarget">
                <option value="stream" ${soundDefaults.target === 'stream' ? 'selected' : ''}>Stream</option>
                <option value="discord" ${soundDefaults.target === 'discord' ? 'selected' : ''}>Discord</option>
                <option value="both" ${(soundDefaults.target || 'both') === 'both' ? 'selected' : ''}>Beides</option>
              </select></label>
            </div>
            <div class="evs-two-cols evs-config-inline-grid">
              <label><span>PreRoll Sekunden</span><input id="evsCfgSoundPreRollSeconds" type="number" min="0" max="30" value="${esc(soundDefaults.preRollSeconds ?? 3)}"></label>
              <label><span>Countdown Sekunden</span><input id="evsCfgSoundCountdownPreRollSeconds" type="number" min="0" max="30" value="${esc(soundDefaults.countdownPreRollSeconds ?? 3)}"></label>
            </div>
            <label><span>Auflösungs-Video Modus</span><select id="evsCfgRevealVideoMode">
              <option value="after_solved" ${(soundDefaults.revealVideoMode || 'after_solved') === 'after_solved' ? 'selected' : ''}>Nach richtiger Antwort automatisch</option>
              <option value="manual" ${soundDefaults.revealVideoMode === 'manual' ? 'selected' : ''}>Nur manuell</option>
              <option value="disabled" ${soundDefaults.revealVideoMode === 'disabled' ? 'selected' : ''}>Aus</option>
            </select></label>
            <label class="evs-check"><input id="evsCfgSoundAutoStart" type="checkbox" ${soundDefaults.autoStartFirstRound !== false ? 'checked' : ''}> Erste Runde automatisch beim Eventstart</label>
            <label class="evs-check"><input id="evsCfgSoundAutoAdvance" type="checkbox" ${soundDefaults.autoAdvanceRounds !== false ? 'checked' : ''}> Nach einer Runde automatisch weitermachen</label>
            <label class="evs-check"><input id="evsCfgSoundAvoidRepeat" type="checkbox" ${soundDefaults.avoidImmediateRepeat !== false ? 'checked' : ''}> Direkte Wiederholung vermeiden</label>
            <label class="evs-check"><input id="evsCfgSoundPreRollEnabled" type="checkbox" ${soundDefaults.preRollEnabled === true ? 'checked' : ''}> PreRoll vor Sound erlauben</label>
            <label class="evs-check"><input id="evsCfgSoundCountdownPreRollEnabled" type="checkbox" ${soundDefaults.countdownPreRollEnabled === true ? 'checked' : ''}> Countdown vor Sound anzeigen</label>
            <label class="evs-check"><input id="evsCfgRevealVideo" type="checkbox" ${soundDefaults.revealVideoEnabled !== false ? 'checked' : ''}> Auflösungs-Video erlauben</label>
          </div>

          <div class="evs-config-card">
            <div class="evs-config-card-head"><strong>Text-Spiel Defaults</strong><small>Sätze, Teiltreffer und Wortpunkte</small></div>
            <label><span>Punkte für komplette Lösung</span><input id="evsCfgTextPhrasePoints" type="number" min="0" max="10000" value="${esc(textDefaults.defaultPhrasePoints ?? 40)}"></label>
            <label><span>Teiltreffer-Meldung</span><select id="evsCfgPartialVisibility">
              <option value="off" ${textDefaults.partialHintVisibility === 'off' ? 'selected' : ''}>Aus</option>
              <option value="general" ${textDefaults.partialHintVisibility === 'general' ? 'selected' : ''}>Allgemein</option>
              <option value="with_sentence" ${textDefaults.partialHintVisibility === 'with_sentence' ? 'selected' : ''}>Mit Satznummer</option>
            </select></label>
            <label class="evs-check"><input id="evsCfgPartialHints" type="checkbox" ${textDefaults.partialHintsEnabled !== false ? 'checked' : ''}> Teiltreffer-Hinweise aktivieren</label>
            <label class="evs-check"><input id="evsCfgShowWordCount" type="checkbox" ${textDefaults.showPartialWordCount !== false ? 'checked' : ''}> Anzahl gefundener Wörter anzeigen</label>
            <label class="evs-check"><input id="evsCfgUniqueWords" type="checkbox" ${textDefaults.uniqueWordPerUserPhrase !== false ? 'checked' : ''}> Wort pro User/Satz nur einmal zählen</label>
          </div>

          <div class="evs-config-card">
            <div class="evs-config-card-head"><strong>Wortpunkte</strong><small>Optional, damit mehr User Punkte sammeln können</small></div>
            <label class="evs-check"><input id="evsCfgWordPoints" type="checkbox" ${textDefaults.wordPointsEnabled ? 'checked' : ''}> Punkte für gefundene Wörter aktivieren</label>
            <label><span>Punkte pro neuem Wort</span><input id="evsCfgPointsPerWord" type="number" min="0" max="1000" value="${esc(textDefaults.pointsPerNewWord ?? 1)}"></label>
            <label><span>Max. Wortpunkte pro User/Satz</span><input id="evsCfgMaxWordPoints" type="number" min="0" max="10000" value="${esc(textDefaults.maxWordPointsPerUserPhrase ?? 5)}"></label>
            <label><span>Zusätzlicher Hinweis-Cooldown</span><input id="evsCfgPartialCooldown" type="number" min="0" max="3600" value="${esc(textDefaults.partialHintCooldownSeconds ?? 0)}"></label>
          </div>

          <div class="evs-config-card">
            <div class="evs-config-card-head"><strong>Overlay Defaults</strong><small>Vorbereitung für den späteren Overlay-Step</small></div>
            <label class="evs-check"><input id="evsCfgOverlayTop3" type="checkbox" ${overlayDefaults.showTop3 !== false ? 'checked' : ''}> Top 3 anzeigen</label>
            <label class="evs-check"><input id="evsCfgOverlayRound" type="checkbox" ${overlayDefaults.showCurrentRound !== false ? 'checked' : ''}> aktuelle Runde anzeigen</label>
            <label class="evs-check"><input id="evsCfgOverlayHints" type="checkbox" ${overlayDefaults.showPartialHints !== false ? 'checked' : ''}> Teiltreffer-Hinweise im Overlay erlauben</label>
          </div>
        </div>

        <div class="evs-tab-help">Quelle: ${esc(state.config?.source || 'default')} · Letzte Änderung: ${fmtDate(state.config?.updatedAt)}</div>
      </section>
    `;
  }

  function renderSoundTab(event){
    if (!event) return renderSelectEventEmpty('Sound-Spiel');
    const sound = event.soundConfig || {};
    const snippets = Array.isArray(sound.snippets) ? sound.snippets : [];
    return `
      <section class="evs-card glass evs-tab-panel">
        <div class="evs-card-head">
          <div><h3>Sound-Spiel</h3><span>Audio-Schnipsel, Antwortzeit, Lösungen und Verhalten bei nicht erkannt.</span></div>
          <button type="button" class="evs-btn" data-evs-action="edit" data-uid="${esc(event.eventUid)}">Sound konfigurieren</button>
        </div>
        ${event.soundEnabled ? `
          <div class="evs-mini-grid evs-mini-grid-compact">
            <div><strong>Antwortzeit</strong><span>${esc(sound.answerSeconds || sound.defaultAnswerSeconds || 20)} Sekunden</span></div>
            <div><strong>Nicht erkannt</strong><span>${esc(sound.unresolvedPolicy === 'remove' ? 'Entfernen' : 'Später nochmal')}</span></div>
            <div><strong>Schnipsel</strong><span>${esc(snippets.length)}</span></div>
            <div><strong>Auflösungs-Video</strong><span>${esc(snippets.some(s => s.revealVideoMediaId) ? 'vorbereitet' : 'optional')}</span></div>
          </div>
          <div class="evs-list evs-tab-list">
            ${snippets.length ? snippets.map((snip, idx) => `<div class="evs-info-row"><strong>${esc(idx + 1)}. ${snip.title || snip.name || 'Unbenannter Schnipsel'}</strong><span>${esc((snip.acceptedAnswers || []).join(', ') || 'Antworten fehlen')}</span></div>`).join('') : '<div class="evs-empty">Noch kein Sound-Schnipsel hinterlegt.</div>'}
          </div>
        ` : '<div class="evs-empty">Sound-Spiel ist für dieses Event nicht aktiviert.</div>'}
      </section>
    `;
  }

  function renderTextGameTab(event){
    if (!event) return renderSelectEventEmpty('Text-Spiel');
    const text = event.textConfig || {};
    const phrases = Array.isArray(text.phrases) ? text.phrases : [];
    return `
      <section class="evs-card glass evs-tab-panel">
        <div class="evs-card-head">
          <div><h3>Text-Spiel</h3><span>Mehrere geheime Sätze, Worttreffer, Wortpunkte und Teiltreffer-Hinweise.</span></div>
          <button type="button" class="evs-btn" data-evs-action="edit" data-uid="${esc(event.eventUid)}">Text-Spiel konfigurieren</button>
        </div>
        ${event.textEnabled ? `
          <div class="evs-mini-grid evs-mini-grid-compact">
            <div><strong>Geheime Sätze</strong><span>${esc(phrases.length)}</span></div>
            <div><strong>Teiltreffer</strong><span>${esc(text.partialHintVisibility === 'with_sentence' ? 'mit Satznummer' : (text.partialHintVisibility === 'general' ? 'allgemein' : 'aus'))}</span></div>
            <div><strong>Wortpunkte</strong><span>${esc(text.wordPointsEnabled ? `${text.pointsPerNewWord || 0} pro Wort` : 'aus')}</span></div>
            <div><strong>Limit</strong><span>${esc(text.maxWordPointsPerUserPhrase || 0)} pro User/Satz</span></div>
          </div>
          <div class="evs-list evs-tab-list">
            ${phrases.length ? phrases.map((phrase, idx) => `<div class="evs-info-row"><strong>Satz ${esc(idx + 1)}</strong><span>${esc(phrase.phrase || phrase.text || phrase.solution || 'Geheimsatz fehlt')}</span></div>`).join('') : '<div class="evs-empty">Noch kein Geheimsatz hinterlegt.</div>'}
          </div>
        ` : '<div class="evs-empty">Text-Spiel ist für dieses Event nicht aktiviert.</div>'}
      </section>
    `;
  }

  function renderTextsTab(){
    return renderTextConfigPanel(true);
  }

  function renderStatsTab(event){
    const active = state.statsSubTab || 'overview';
    return `
      <section class="evs-card glass evs-tab-panel evs-stats-shell">
        <div class="evs-card-head evs-stats-head">
          <div><h3>Statistik & Runtime</h3><span>Übersichtlich getrennt nach Übersicht, Ranking, Text-Spiel, Sound-Spiel und User.</span></div>
          ${event ? `<button type="button" class="evs-btn evs-btn-secondary" data-evs-action="refreshStatsCurrent" data-uid="${esc(event.eventUid)}">Aktuellen Bereich aktualisieren</button>` : ''}
        </div>
        ${event ? renderStatsTabs(active, event) + `<div class="evs-stats-content" data-evs-stats-content>${renderStatsSubTab(active, event)}</div>` : '<div class="evs-empty">Kein Event ausgewählt.</div>'}
      </section>
    `;
  }

  function renderStatsTabs(active, event){
    const tabs = [
      ['overview', 'Übersicht'],
      ['ranking', 'Ranking'],
      ['text', 'Text-Spiel'],
      ['sound', 'Sound-Spiel'],
      ['user', 'User']
    ];
    return `
      <div class="evs-stats-tabs" role="tablist" aria-label="Statistik Bereiche">
        ${tabs.map(([id, label]) => `<button type="button" class="evs-stats-tab ${active === id ? 'is-active' : ''}" data-evs-action="statsSubTab" data-tab="${esc(id)}" data-uid="${esc(event.eventUid)}" role="tab" aria-selected="${active === id ? 'true' : 'false'}">${esc(label)}</button>`).join('')}
      </div>
    `;
  }

  function renderStatsSubTab(active, event){
    if (active === 'ranking') return renderStatsRankingPanel(event);
    if (active === 'text') return renderRuntimeReportPanel(event, false);
    if (active === 'sound') return renderSoundRuntimeReportPanel(event, false);
    if (active === 'user') return renderStatsUserPanel(event);
    return renderStatsOverviewPanel(event);
  }

  function renderStatsOverviewPanel(event){
    const text = runtimeReportFor(event);
    const sound = soundRuntimeReportFor(event);
    const rankingRows = rows(state.ranking?.rows);
    return `
      <div class="evs-stats-overview">
        <div class="evs-mini-grid evs-mini-grid-compact evs-stats-overview-grid">
          <div><strong>${esc(event.status || '-')}</strong><span>Status</span></div>
          <div><strong>${esc(rankingRows.length)}</strong><span>Ranking-User</span></div>
          <div><strong>${esc(reportCount(text, 'wordHits'))}</strong><span>Worttreffer</span></div>
          <div><strong>${esc(reportCount(text, 'phraseSolves'))}</strong><span>Satzlösungen</span></div>
          <div><strong>${esc(reportCount(sound, 'rounds'))}</strong><span>Sound-Runden</span></div>
          <div><strong>${esc(reportCount(sound, 'solved'))}</strong><span>Sound gelöst</span></div>
        </div>
        <div class="evs-runtime-columns">
          <section class="evs-runtime-box">
            <div class="evs-runtime-box-head"><h4>Aktuelles Event</h4><small>${fmtDate(event.startedAt || event.createdAt)}</small></div>
            <div class="evs-info-row"><strong>${esc(event.name || event.eventUid)}</strong><span>${esc(eventTypes(event))}</span></div>
            <div class="evs-action-row evs-action-row-tight evs-stats-local-actions">
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="statsSubTab" data-tab="ranking" data-uid="${esc(event.eventUid)}">Ranking öffnen</button>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="statsSubTab" data-tab="text" data-uid="${esc(event.eventUid)}">Text-Spiel öffnen</button>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="statsSubTab" data-tab="sound" data-uid="${esc(event.eventUid)}">Sound-Spiel öffnen</button>
            </div>
          </section>
          <section class="evs-runtime-box">
            <div class="evs-runtime-box-head"><h4>Letzte Text-Payloads</h4><small>directSend=false</small></div>
            ${Array.isArray(text?.chatOutputs) && text.chatOutputs.length ? text.chatOutputs.slice(0, 4).map(output => `<div class="evs-chat-output-row"><span>${esc(chatKindLabel(output.kind))}</span><p>${esc(chatOutputText(output))}</p></div>`).join('') : '<div class="evs-empty">Noch keine Text-Payloads geladen.</div>'}
          </section>
          <section class="evs-runtime-box">
            <div class="evs-runtime-box-head"><h4>Letzte Sound-Payloads</h4><small>prepared-only</small></div>
            ${Array.isArray(sound?.chatOutputs) && sound.chatOutputs.length ? sound.chatOutputs.slice(0, 4).map(output => `<div class="evs-chat-output-row"><span>${esc(chatKindLabel(output.kind))}</span><p>${esc(chatOutputText(output))}</p></div>`).join('') : '<div class="evs-empty">Noch keine Sound-Payloads geladen.</div>'}
          </section>
        </div>
        <div class="evs-tab-help">Die Untertabs laden nur ihren eigenen Bereich nach. Kein Seitenreload.</div>
      </div>
    `;
  }

  function renderStatsRankingPanel(event){
    const rankingRows = rankingRowsForEvent(event);
    return `
      <div class="evs-stats-section">
        <div class="evs-runtime-box-head evs-stats-section-head"><h4>Ranking</h4><button type="button" class="evs-btn evs-btn-secondary" data-evs-action="ranking" data-uid="${esc(event.eventUid)}">Ranking aktualisieren</button></div>
        <div class="evs-ranking evs-ranking-standalone">
          ${rankingRows.length ? rankingRows.map(row => `<div class="evs-rank-row"><strong>#${esc(row.rank)}</strong><span>${esc(row.userDisplayName || row.userLogin)}</span><b>${esc(row.points)} Punkte</b></div>`).join('') : '<div class="evs-empty">Noch keine Punkte im Ranking.</div>'}
        </div>
      </div>
    `;
  }


  function activeSoundRoundFromReport(report){
    const rounds = Array.isArray(report?.rounds) ? report.rounds : [];
    return rounds.find(round => norm(round.status || round.result) === 'active') || null;
  }

  function latestSoundRoundFromReport(report){
    const rounds = Array.isArray(report?.rounds) ? report.rounds : [];
    return rounds[0] || null;
  }

  function fmtClock(v){
    if (!v) return '-';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? esc(v) : esc(d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }

  function fmtDurationSeconds(value){
    const raw = Number(value || 0);
    if (!Number.isFinite(raw) || raw <= 0) return 'jetzt';
    const total = Math.max(0, Math.round(raw));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} Std.`;
    return `${m}:${String(s).padStart(2, '0')} Min.`;
  }

  function nextSoundStatusFromReport(report){
    return report && report.nextSound && typeof report.nextSound === 'object' ? report.nextSound : null;
  }


  function nextSoundDueAt(next){
    return next?.nextAutoStartAt || next?.nextSnippetDueAt || next?.dueAt || next?.plannedAt || '';
  }

  function computeRemainingSecondsFromDueAt(dueAt){
    if (!dueAt) return null;
    const d = new Date(dueAt);
    if (Number.isNaN(d.getTime())) return null;
    return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 1000));
  }

  function nextSoundDisplay(next){
    if (!next) return { label: 'Noch kein Status geladen', detail: 'Status neu laden, um die nächste Planung zu sehen.', cls: 'is-unknown' };
    const status = norm(next.status);
    if (status === 'offline_waiting') return { label: 'Stream offline – wartet', detail: next.detail || 'Event wartet automatisch und läuft weiter, sobald der Stream wieder online ist.', cls: 'is-offline' };
    if (status === 'paused') return { label: 'Manuell pausiert', detail: next.detail || 'Fortsetzen erforderlich.', cls: 'is-paused' };
    if (status === 'answer_window') return { label: `Antwortfenster · noch ${fmtDurationSeconds(next.remainingSeconds)}`, detail: next.detail || 'Antwortzeit läuft.', cls: 'is-active' };
    if (status === 'sound_playing') return { label: next.label || 'Sound läuft', detail: next.detail || 'Antwortfenster startet nach Sound-Ende.', cls: 'is-active' };
    if (status === 'prepared') return { label: next.label || 'Schnipsel vorbereitet', detail: next.detail || 'Noch nicht gestartet.', cls: 'is-warn' };
    if (status === 'waiting' || status === 'waiting_persisted') {
      const dueAt = nextSoundDueAt(next);
      const remaining = dueAt ? computeRemainingSecondsFromDueAt(dueAt) : Number(next.remainingSeconds || 0);
      const due = dueAt ? ` · geplant um ${fmtClock(dueAt)}` : '';
      return { label: `in ${fmtDurationSeconds(remaining)}`, detail: `Nächster Schnipsel${due}`, cls: 'is-waiting' };
    }
    if (status === 'waiting_due') return { label: 'fällig', detail: next.detail || 'Geplante Startzeit ist erreicht.', cls: 'is-warn' };
    if (status === 'completed') return { label: 'Sound-Teil abgeschlossen', detail: next.detail || '', cls: 'is-done' };
    if (status === 'waiting_unscheduled') return { label: 'Keine Wartezeit geplant', detail: next.detail || 'Status neu laden oder Wartezeit überspringen.', cls: 'is-unknown' };
    return { label: next.label || '-', detail: next.detail || status || '-', cls: 'is-unknown' };
  }

  function canShowSoundSkipWait(event, report){
    if (!event || norm(event.status) !== 'active' || !event.soundEnabled) return false;
    const activeRound = activeSoundRoundFromReport(report);
    if (activeRound) return false;
    const next = nextSoundStatusFromReport(report);
    const status = norm(next?.status || '');
    if (!status) return false;
    if (['paused','offline_waiting','sound_playing','answer_window','round_active','completed','sound_disabled','no_event'].includes(status)) return false;
    return ['waiting','waiting_persisted','waiting_due','waiting_unscheduled'].includes(status);
  }

  function soundControlRows(event, report){
    const activeRound = activeSoundRoundFromReport(report);
    const latestRound = latestSoundRoundFromReport(report);
    const snippet = activeRound?.config?.snippet || {};
    const latestSnippet = latestRound?.config?.snippet || {};
    const next = nextSoundStatusFromReport(report);
    const nextDisplay = nextSoundDisplay(next);
    const currentLabel = activeRound
      ? `${esc(snippet.title || activeRound.itemUid || activeRound.roundUid)} · ${esc(soundRoundStatusLabel(activeRound.status || activeRound.result))}`
      : 'Keine aktive Runde';
    const latestLabel = !activeRound && latestRound && norm(latestRound.status || latestRound.result) === 'interrupted'
      ? `<div class="evs-live-control-current evs-live-control-secondary"><strong>Letzte Runde</strong><span>${esc(latestSnippet.title || latestRound.itemUid || latestRound.roundUid)} · nach Unterbrechung wieder eingereiht</span></div>`
      : '';
    return `
      <div class="evs-live-control-stack">
        <div class="evs-live-control-current">
          <strong>Aktuelle Runde</strong>
          <span>${currentLabel}</span>
        </div>
        ${latestLabel}
        <div class="evs-live-control-current evs-next-snippet-row ${esc(nextDisplay.cls)}" data-evs-next-snippet="1" data-status="${esc(next?.status || '')}" data-due-at="${esc(nextSoundDueAt(next))}" data-detail-base="Nächster Schnipsel">
          <strong>Nächster Schnipsel</strong>
          <span><b data-evs-next-snippet-label>${esc(nextDisplay.label)}</b><small data-evs-next-snippet-detail>${esc(nextDisplay.detail)}</small></span>
        </div>
      </div>
    `;
  }

  function soundRotationSummary(event, report){
    const snippets = Array.isArray(event?.soundConfig?.snippets) ? event.soundConfig.snippets : [];
    const rounds = Array.isArray(report?.rounds) ? report.rounds : [];
    const playedKeys = new Set(rounds.map(round => String(round.itemUid || round.config?.snippet?.uid || round.config?.snippet?.title || '').trim()).filter(Boolean));
    const solvedKeys = new Set(rounds.filter(round => ['solved','finished'].includes(norm(round.status || round.result))).map(round => String(round.itemUid || round.config?.snippet?.uid || round.config?.snippet?.title || '').trim()).filter(Boolean));
    const unresolvedKeys = new Set(rounds.filter(round => norm(round.status || round.result) === 'unresolved').map(round => String(round.itemUid || round.config?.snippet?.uid || round.config?.snippet?.title || '').trim()).filter(Boolean));
    const open = snippets.filter(snippet => !playedKeys.has(String(snippet.uid || snippet.title || '').trim())).length;
    return { total: snippets.length, played: playedKeys.size, solved: solvedKeys.size, unresolved: unresolvedKeys.size, open: Math.max(0, open) };
  }

  function renderLiveStatusModal(){
    const modal = state.liveStatusModal || {};
    const uid = modal.eventUid || state.selectedUid;
    const event = uid ? (state.events.find(e => e.eventUid === uid) || state.selected || selectedEvent()) : selectedEvent();
    const soundReport = event ? soundRuntimeReportFor(event) : null;
    const textReport = event ? runtimeReportFor(event) : null;
    const rankingRows = rows((soundReport?.ranking && soundReport.ranking.rows) ? soundReport.ranking : state.ranking);
    const soundRounds = Array.isArray(soundReport?.rounds) ? soundReport.rounds : [];
    const textWordHits = Array.isArray(textReport?.wordHits) ? textReport.wordHits : [];
    const textPhraseSolves = Array.isArray(textReport?.phraseSolves) ? textReport.phraseSolves : [];
    const activeRound = activeSoundRoundFromReport(soundReport);
    const activeSnippet = activeRound?.config?.snippet || {};
    const rotation = soundRotationSummary(event, soundReport);
    const auto = modal.autoRefresh !== false;
    const isActive = norm(event?.status) === 'active';
    const canSkipWait = canShowSoundSkipWait(event, soundReport);
    return `
      <div class="evs-modal-backdrop evs-live-modal-backdrop" data-evs-live-modal-close="1">
        <div class="evs-modal glass evs-live-modal" role="dialog" aria-modal="true" aria-label="Event Live-Status">
          <div class="evs-modal-head evs-live-modal-head">
            <div>
              <h3>Status & Punkte</h3>
              <p>${event ? `${esc(event.name || event.eventUid)} · ${esc(statusText(event.status))} · ${esc(eventTypes(event))}` : 'Kein Event ausgewählt.'}${modal.lastRefreshAt ? ` · Stand: ${fmtDate(modal.lastRefreshAt)}` : ''}</p>
            </div>
            <button type="button" class="evs-icon-btn" data-evs-action="closeLiveStatusModal">×</button>
          </div>

          <div class="evs-live-toolbar">
            <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="refreshLiveStatusModal" data-uid="${esc(uid || '')}">Jetzt aktualisieren</button>
            ${canSkipWait ? `<button type="button" class="evs-btn" data-evs-action="soundSkipWait" data-uid="${esc(uid || '')}">Wartezeit überspringen</button>` : ''}
            <button type="button" class="evs-btn evs-btn-secondary ${auto ? 'is-active' : ''}" data-evs-action="toggleLiveStatusAuto">AutoReload: ${auto ? 'An' : 'Aus'}</button>
            <small>Dieses Fenster ist für Live-Blick und Punkte. Konfiguration bleibt in den Event-Editoren.</small>
          </div>

          ${event ? `
            <div class="evs-live-status-pill ${isActive ? 'is-live' : 'is-idle'}">${isActive ? 'Event läuft' : 'Event läuft aktuell nicht'}${isActive ? '' : ' · Live-Steuerung wird erst bei aktivem Event relevant'}</div>

            <div class="evs-runtime-counters evs-live-counters">
              <div><strong>${esc(rankingRows.length)}</strong><span>Spieler im Ranking</span></div>
              <div><strong>${esc(rankingRows[0]?.points || 0)}</strong><span>Top-Punkte</span></div>
              <div><strong>${esc(reportCount(soundReport, 'rounds'))}</strong><span>Sound-Runden</span></div>
              <div><strong>${esc(reportCount(soundReport, 'solved'))}</strong><span>Sound gelöst</span></div>
              <div><strong>${esc(reportCount(textReport, 'wordHits'))}</strong><span>Worttreffer</span></div>
              <div><strong>${esc(reportCount(textReport, 'phraseSolves'))}</strong><span>Satzlösungen</span></div>
            </div>

            ${event?.soundEnabled ? `<section class="evs-runtime-box evs-live-next-sound">${soundControlRows(event, soundReport)}</section>` : ''}

            <div class="evs-live-grid">
              <section class="evs-runtime-box evs-live-current-round">
                <div class="evs-runtime-box-head"><h4>Aktuelle Runde</h4><small>${activeRound ? esc(soundRoundStatusLabel(activeRound.status || activeRound.result)) : 'Noch keine aktive Runde'}</small></div>
                ${activeRound ? `
                  <div class="evs-live-current-title"><strong>${esc(activeSnippet.title || activeRound.itemUid || activeRound.roundUid)}</strong><span>${fmtDate(activeRound.startedAt || activeRound.createdAt)}</span></div>
                  <div class="evs-info-row"><strong>Antwortzeit</strong><span>${esc(activeSnippet.answerSeconds || event.soundConfig?.answerSeconds || '-')} Sekunden</span></div>
                  <div class="evs-info-row"><strong>Runden-ID</strong><span>${esc(activeRound.roundUid || '-')}</span></div>
                ` : '<div class="evs-empty">Noch keine Sound-Runde aktiv oder geladen.</div>'}
              </section>

              <section class="evs-runtime-box evs-live-ranking-box">
                <div class="evs-runtime-box-head"><h4>Punkte / Rangliste</h4><small>Top 10</small></div>
                ${rankingRows.length ? rankingRows.slice(0, 10).map(row => `<div class="evs-rank-row"><strong>#${esc(row.rank)}</strong><span>${esc(row.userDisplayName || row.userLogin)}</span><b>${esc(row.points)} Punkte</b></div>`).join('') : '<div class="evs-empty">Noch keine Punkte.</div>'}
              </section>

              <section class="evs-runtime-box evs-live-rotation-box">
                <div class="evs-runtime-box-head"><h4>Sound-Rotation</h4><small>aus Event + Runtime-Report</small></div>
                <div class="evs-mini-grid evs-mini-grid-compact evs-live-rotation-mini">
                  <div><strong>${esc(rotation.total)}</strong><span>Schnipsel gesamt</span></div>
                  <div><strong>${esc(rotation.open)}</strong><span>offen</span></div>
                  <div><strong>${esc(rotation.solved)}</strong><span>gelöst</span></div>
                  <div><strong>${esc(rotation.unresolved)}</strong><span>nicht erkannt</span></div>
                </div>
              </section>
            </div>

            <div class="evs-live-grid evs-live-history-grid">
              <section class="evs-runtime-box">
                <div class="evs-runtime-box-head"><h4>Rundenverlauf</h4><small>letzte Sound-Runden</small></div>
                ${soundRounds.length ? soundRounds.slice(0, 12).map(round => {
                  const snippet = round.config?.snippet || {};
                  const result = round.resultData || {};
                  return `<div class="evs-runtime-row"><strong>${esc(snippet.title || round.itemUid || round.roundUid)}</strong><span>${esc(soundRoundStatusLabel(round.status || round.result))}${result.userDisplayName ? ` · ${esc(result.userDisplayName)} · +${esc(result.points || 0)}` : ''}</span><small>${fmtDate(round.startedAt || round.createdAt)}${round.finishedAt ? ` → ${fmtDate(round.finishedAt)}` : ''}</small></div>`;
                }).join('') : '<div class="evs-empty">Noch keine Sound-Runden.</div>'}
              </section>

              <section class="evs-runtime-box">
                <div class="evs-runtime-box-head"><h4>Text-Verlauf</h4><small>Wörter und Lösungen</small></div>
                ${textPhraseSolves.length || textWordHits.length ? `
                  ${textPhraseSolves.slice(0, 8).map(solve => `<div class="evs-runtime-row"><strong>${esc(solve.userDisplayName || solve.userLogin || 'User')}</strong><span>Satz gelöst · +${esc(solve.pointsAwarded || 0)}</span><small>${fmtDate(solve.createdAt)} · „${esc(solve.chatMessage || '')}“</small></div>`).join('')}
                  ${textWordHits.slice(0, 8).map(hit => `<div class="evs-runtime-row"><strong>${esc(hit.userDisplayName || hit.userLogin || 'User')}</strong><span>Wort: ${esc(hit.wordOriginal || hit.wordKey)} · +${esc(hit.pointsAwarded || 0)}</span><small>${fmtDate(hit.createdAt)} · „${esc(hit.chatMessage || '')}“</small></div>`).join('')}
                ` : '<div class="evs-empty">Noch keine Text-Treffer.</div>'}
              </section>
            </div>

            <div class="evs-live-footer-note">Nächster Step: manuelle Sound-Rundensteuerung. Dieses Fenster zeigt den Live-Zustand und aktualisiert Punkte/Runden, startet aber noch keine Sounds.</div>
          ` : '<div class="evs-empty">Kein Event ausgewählt.</div>'}
        </div>
      </div>
    `;
  }

  function renderStatsUserPanel(event){
    return `
      <div class="evs-stats-section evs-stats-user-section">
        ${renderStatsUserFilter(event)}
        <div class="evs-tab-help">User-Auswahl öffnet ein scrollbares Detail-Popup. AutoReload aktualisiert nur das Popup, nicht die Seite.</div>
      </div>
    `;
  }

  function renderStatsUserFilter(event){
    const users = statisticsUsers();
    const selected = state.selectedStatsUser || '';
    const options = ['<option value="">User auswählen…</option>'].concat(users.map(user => {
      const label = `${user.userDisplayName || user.userLogin} · ${user.totalPoints || 0} Punkte · ${user.wordHits || 0} Wörter · ${user.phraseSolves || 0} Lösungen`;
      return `<option value="${esc(user.userLogin)}" ${selected === user.userLogin ? 'selected' : ''}>${esc(label)}</option>`;
    })).join('');
    return `
      <div class="evs-user-filter">
        <label>
          <span>User-Statistik</span>
          <select data-evs-user-stat-select data-event-uid="${esc(event.eventUid)}">${options}</select>
        </label>
        <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="statsUsers" data-uid="${esc(event.eventUid)}">Dropdown aktualisieren</button>
        ${selected ? `<button type="button" class="evs-btn" data-evs-action="openUserStats" data-user-login="${esc(selected)}" data-uid="${esc(event.eventUid)}">User-Details öffnen</button>` : ''}
        <small>${users.length ? `${esc(users.length)} User mit Event-Daten gefunden.` : 'Noch keine Userdaten geladen oder vorhanden.'}</small>
      </div>
    `;
  }

  function renderSoundRuntimeReportPanel(event, compact){
    if (!event) return '<div class="evs-empty">Kein Event ausgewählt.</div>';
    const report = soundRuntimeReportFor(event);
    const rankingRows = rows((report?.ranking && report.ranking.rows) ? report.ranking : state.ranking);
    const rounds = Array.isArray(report?.rounds) ? report.rounds : [];
    const scoreEntries = Array.isArray(report?.scoreEntries) ? report.scoreEntries : [];
    const chatOutputs = Array.isArray(report?.chatOutputs) ? report.chatOutputs : [];
    const playbackPayloads = Array.isArray(report?.playbackPayloads) ? report.playbackPayloads : [];
    const soundDebugRounds = Array.isArray(report?.soundDebug?.acceptedAnswersByRound) ? report.soundDebug.acceptedAnswersByRound : [];
    if (!report) {
      return `<div class="evs-runtime-report evs-runtime-report-empty evs-sound-report"><div class="evs-empty">Sound-Runtime-Report noch nicht geladen.</div><button type="button" class="evs-btn evs-btn-secondary" data-evs-action="soundRuntimeReport" data-uid="${esc(event.eventUid)}">Sound-Report laden</button></div>`;
    }
    return `
      <div class="evs-runtime-report evs-sound-report ${compact ? 'is-compact' : ''}">
        <div class="evs-runtime-box-head evs-sound-report-head"><h4>Sound-Runtime</h4><small>preparedOnly=true · directPlayback=false · soundSystemQueueTouched=false</small></div>
        <div class="evs-runtime-counters">
          <div><strong>${esc(reportCount(report, 'rounds'))}</strong><span>Runden</span></div>
          <div><strong>${esc(reportCount(report, 'solved'))}</strong><span>Gelöst</span></div>
          <div><strong>${esc(reportCount(report, 'unresolved'))}</strong><span>Ungelöst</span></div>
          <div><strong>${esc(reportCount(report, 'soundScoreEntries'))}</strong><span>Sound-Punkte</span></div>
          <div><strong>${esc(reportCount(report, 'playbackPayloads'))}</strong><span>Playback-Payloads</span></div>
          <div><strong>${esc(reportCount(report, 'chatOutputs'))}</strong><span>Chat-Payloads</span></div>
        </div>

        <div class="evs-runtime-columns">
          <section class="evs-runtime-box">
            <h4>Sound-Runden</h4>
            ${rounds.length ? rounds.slice(0, compact ? 5 : 16).map(round => {
              const snippet = round.config?.snippet || {};
              const result = round.resultData || {};
              const debugRound = soundDebugRounds.find(item => item.roundUid === round.roundUid) || {};
              const answersText = debugRound.acceptedAnswersDebug?.acceptedAnswersText || (Array.isArray(snippet.acceptedAnswers) ? snippet.acceptedAnswers.join(' | ') : '');
              return `<div class="evs-runtime-row"><strong>${esc(snippet.title || round.itemUid || round.roundUid)}</strong><span>${esc(soundRoundStatusLabel(round.status || round.result))} · ${esc(round.roundUid)}</span><small>${fmtDate(round.startedAt || round.createdAt)}${round.finishedAt ? ` → ${fmtDate(round.finishedAt)}` : ''}${result.userDisplayName ? ` · ${esc(result.userDisplayName)} · +${esc(result.points || 0)}` : ''}</small>${answersText ? `<small class="evs-debug-answer-list">Test-Antworten: ${esc(answersText)}</small>` : ''}</div>`;
            }).join('') : '<div class="evs-empty">Noch keine Sound-Runden.</div>'}
          </section>

          <section class="evs-runtime-box">
            <h4>Sound-Punkte</h4>
            ${scoreEntries.length ? scoreEntries.slice(0, compact ? 5 : 16).map(row => `<div class="evs-runtime-row"><strong>${esc(row.userDisplayName || row.userLogin)}</strong><span>${esc(row.reason || row.sourceType)} · +${esc(row.points || 0)} Punkte</span><small>${fmtDate(row.createdAt)} · ${esc(row.metadata?.title || row.sourceUid || '')}</small></div>`).join('') : '<div class="evs-empty">Noch keine Sound-Punkte.</div>'}
          </section>

          <section class="evs-runtime-box">
            <h4>Ranking</h4>
            ${rankingRows.length ? rankingRows.slice(0, compact ? 5 : 10).map(row => `<div class="evs-rank-row"><strong>#${esc(row.rank)}</strong><span>${esc(row.userDisplayName || row.userLogin)}</span><b>${esc(row.points)} Punkte</b></div>`).join('') : '<div class="evs-empty">Noch keine Punkte.</div>'}
          </section>
        </div>

        <div class="evs-runtime-columns">
          <section class="evs-runtime-box evs-runtime-chatoutputs">
            <div class="evs-runtime-box-head"><h4>Vorbereitete Sound-Chatmeldungen</h4><small>directSend=false · via=bus_payload</small></div>
            ${chatOutputs.length ? chatOutputs.slice(0, compact ? 4 : 12).map(output => `<div class="evs-chat-output-row"><span>${esc(chatKindLabel(output.kind))}</span><p>${esc(chatOutputText(output))}</p><small>${esc(output.textKey || '')} · ${fmtDate(output.createdAt)}</small></div>`).join('') : '<div class="evs-empty">Noch keine vorbereiteten Sound-Chatmeldungen.</div>'}
          </section>

          <section class="evs-runtime-box evs-runtime-chatoutputs">
            <div class="evs-runtime-box-head"><h4>Vorbereitete Playback-Payloads</h4><small>target=sound_system · queueTouched=false</small></div>
            ${playbackPayloads.length ? playbackPayloads.slice(0, compact ? 3 : 8).map(payload => `<div class="evs-chat-output-row"><span>${esc(payload.action || 'Playback')}</span><p>${esc(payload.item?.label || payload.item?.mediaId || 'Sound-System Payload')}</p><small>${esc(payload.channel || '')} · directPlay=${esc(payload.directPlay)} · queueTouched=${esc(payload.queueTouched)}</small></div>`).join('') : '<div class="evs-empty">Aktuell kein Playback-Payload im Report. Bei aktiver Sound-Runde erscheint hier die vorbereitete Sound-System-Anforderung.</div>'}
          </section>
        </div>

        <div class="evs-tab-help">Sound-Report: ${fmtDate(report.updatedAt)} · Event: ${esc(event.name || event.eventUid)}</div>
      </div>
    `;
  }

  function soundRoundStatusLabel(status){
    const s = norm(status);
    const map = { active: 'Aktiv', solved: 'Gelöst', unresolved: 'Ungelöst', skipped: 'Übersprungen', finished: 'Beendet', interrupted: 'Unterbrochen', interrupted_requeued: 'Wieder eingereiht' };
    return map[s] || status || '-';
  }

  function renderRuntimeReportPanel(event, compact){
    if (!event) return '<div class="evs-empty">Kein Event ausgewählt.</div>';
    const report = runtimeReportFor(event);
    const rankingRows = rows((report?.ranking && report.ranking.rows) ? report.ranking : state.ranking);
    const wordHits = Array.isArray(report?.wordHits) ? report.wordHits : [];
    const phraseSolves = Array.isArray(report?.phraseSolves) ? report.phraseSolves : [];
    const chatOutputs = Array.isArray(report?.chatOutputs) ? report.chatOutputs : [];
    if (!report) {
      return `<div class="evs-runtime-report evs-runtime-report-empty"><div class="evs-empty">Text-Runtime-Report noch nicht geladen.</div><button type="button" class="evs-btn evs-btn-secondary" data-evs-action="runtimeReport" data-uid="${esc(event.eventUid)}">Report laden</button></div>`;
    }
    return `
      <div class="evs-runtime-report ${compact ? 'is-compact' : ''}">
        <div class="evs-runtime-counters">
          <div><strong>${esc(reportCount(report, 'wordHits'))}</strong><span>Worttreffer</span></div>
          <div><strong>${esc(reportCount(report, 'phraseSolves'))}</strong><span>Satzlösungen</span></div>
          <div><strong>${esc(reportCount(report, 'chatOutputs'))}</strong><span>Chat-Payloads</span></div>
          <div><strong>${esc(rankingRows.length)}</strong><span>Spieler im Ranking</span></div>
        </div>

        <div class="evs-runtime-columns">
          <section class="evs-runtime-box">
            <h4>Ranking</h4>
            ${rankingRows.length ? rankingRows.slice(0, compact ? 5 : 10).map(row => `<div class="evs-rank-row"><strong>#${esc(row.rank)}</strong><span>${esc(row.userDisplayName || row.userLogin)}</span><b>${esc(row.points)} Punkte</b></div>`).join('') : '<div class="evs-empty">Noch keine Punkte.</div>'}
          </section>

          <section class="evs-runtime-box">
            <h4>Worttreffer</h4>
            ${wordHits.length ? wordHits.slice(0, compact ? 5 : 12).map(hit => `<div class="evs-runtime-row"><strong>${esc(hit.userDisplayName || hit.userLogin)}</strong><span>Satz ${esc(hit.phraseNumber)} · ${esc(hit.wordOriginal || hit.wordKey)} · +${esc(hit.pointsAwarded || 0)}</span><small>${fmtDate(hit.createdAt)}</small></div>`).join('') : '<div class="evs-empty">Noch keine Worttreffer.</div>'}
          </section>

          <section class="evs-runtime-box">
            <h4>Satzlösungen</h4>
            ${phraseSolves.length ? phraseSolves.slice(0, compact ? 5 : 12).map(solve => `<div class="evs-runtime-row"><strong>${esc(solve.userDisplayName || solve.userLogin)}</strong><span>Satz ${esc(solve.phraseNumber)} · +${esc(solve.pointsAwarded || 0)} Punkte</span><small>${fmtDate(solve.createdAt)}</small></div>`).join('') : '<div class="evs-empty">Noch keine Satzlösung.</div>'}
          </section>
        </div>

        <section class="evs-runtime-box evs-runtime-chatoutputs">
          <div class="evs-runtime-box-head"><h4>Vorbereitete Chatmeldungen</h4><small>directSend=false · via=bus_payload</small></div>
          ${chatOutputs.length ? chatOutputs.slice(0, compact ? 4 : 12).map(output => `<div class="evs-chat-output-row"><span>${esc(chatKindLabel(output.kind))}</span><p>${esc(chatOutputText(output))}</p><small>${esc(output.textKey || '')} · ${fmtDate(output.createdAt)}</small></div>`).join('') : '<div class="evs-empty">Noch keine vorbereiteten Chatmeldungen im Report.</div>'}
        </section>

        <div class="evs-tab-help">Report: ${fmtDate(report.updatedAt)} · Event: ${esc(event.name || event.eventUid)}</div>
      </div>
    `;
  }


  function renderUserStatisticsPanel(event){
    const report = userStatistics();
    if (!state.selectedStatsUser) return '';
    if (!report || !report.user || report.user.userLogin !== state.selectedStatsUser || (event && report.eventUid && report.eventUid !== event.eventUid)) {
      return `<section class="evs-runtime-box evs-user-detail"><div class="evs-empty">User-Report für ${esc(state.selectedStatsUser)} noch nicht geladen.</div></section>`;
    }
    const u = report.user || {};
    const wordHits = Array.isArray(report.text?.wordHits) ? report.text.wordHits : [];
    const phraseSolves = Array.isArray(report.text?.phraseSolves) ? report.text.phraseSolves : [];
    const timeline = Array.isArray(report.timeline) ? report.timeline : [];
    const soundRows = Array.isArray(report.sound?.rows) ? report.sound.rows : [];
    return `
      <section class="evs-user-detail">
        <div class="evs-runtime-box-head"><h4>User-Detail: ${esc(u.userDisplayName || u.userLogin)}</h4><small>${esc(u.userLogin || '')} · ${fmtDate(report.updatedAt)}</small></div>
        <div class="evs-runtime-counters evs-user-counters">
          <div><strong>${esc(u.totalPoints || 0)}</strong><span>Punkte gesamt</span></div>
          <div><strong>${esc(u.wordHits || 0)}</strong><span>Worttreffer</span></div>
          <div><strong>${esc(u.phraseSolves || 0)}</strong><span>Satzlösungen</span></div>
          <div><strong>${esc(u.eventCount || 0)}</strong><span>Events</span></div>
        </div>
        <div class="evs-runtime-columns evs-user-columns">
          <section class="evs-runtime-box">
            <h4>Gefundene Wörter</h4>
            ${wordHits.length ? wordHits.slice(0, 20).map(hit => `<div class="evs-runtime-row"><strong>${esc(hit.eventName || hit.eventUid)}</strong><span>Satz ${esc(hit.phraseNumber)} · Wort: ${esc(hit.wordOriginal || hit.wordKey)} · +${esc(hit.pointsAwarded || 0)}</span><small>${fmtDate(hit.createdAt)} · „${esc(hit.chatMessage || '')}“</small></div>`).join('') : '<div class="evs-empty">Keine Worttreffer für diesen User.</div>'}
          </section>
          <section class="evs-runtime-box">
            <h4>Satzlösungen</h4>
            ${phraseSolves.length ? phraseSolves.slice(0, 20).map(solve => `<div class="evs-runtime-row"><strong>${esc(solve.eventName || solve.eventUid)}</strong><span>Satz ${esc(solve.phraseNumber)} · +${esc(solve.pointsAwarded || 0)} Punkte</span><small>${fmtDate(solve.createdAt)} · „${esc(solve.chatMessage || '')}“</small></div>`).join('') : '<div class="evs-empty">Keine Satzlösungen für diesen User.</div>'}
          </section>
          <section class="evs-runtime-box">
            <h4>Sound-Punkte</h4>
            ${soundRows.length ? soundRows.slice(0, 20).map(row => `<div class="evs-runtime-row"><strong>${esc(row.eventName || row.eventUid)}</strong><span>${esc(row.reason || row.sourceType || 'Sound')} · +${esc(row.points || 0)}</span><small>${fmtDate(row.createdAt)}</small></div>`).join('') : `<div class="evs-empty">${esc(report.sound?.note || 'Noch keine Sound-Punkte für diesen User im aktuellen Event.')}</div>`}
          </section>
        </div>
        <section class="evs-runtime-box evs-user-timeline">
          <h4>Punkte-Verlauf / Wann, wofür, wie viele</h4>
          ${timeline.length ? timeline.slice(0, 30).map(item => `<div class="evs-user-timeline-row"><b>${esc(userTimelineLabel(item.kind))}</b><span>${esc(item.row?.eventName || item.row?.eventUid || '')}</span><em>${esc(item.label || '')}</em><strong>${esc(item.points || 0)} Punkte</strong><small>${fmtDate(item.createdAt)}</small></div>`).join('') : '<div class="evs-empty">Keine Aktivität für diesen User.</div>'}
        </section>
      </section>
    `;
  }

  function userTimelineLabel(kind){
    const map = { word_hit: 'Wort', phrase_solved: 'Satz', sound_score: 'Sound' };
    return map[kind] || kind || 'Aktivität';
  }


  function selectedStatsEvent(){
    const uid = state.userStatsModal?.eventUid || state.selectedUid;
    return state.events.find(e => e.eventUid === uid) || selectedEvent();
  }

  function renderUserStatsModal(){
    const modal = state.userStatsModal || {};
    const event = selectedStatsEvent();
    const report = userStatistics();
    const login = modal.login || state.selectedStatsUser || '';
    const hasReport = report && report.user && report.user.userLogin === login && (!modal.eventUid || report.eventUid === modal.eventUid);
    const u = hasReport ? (report.user || {}) : { userLogin: login, userDisplayName: login };
    const wordHits = hasReport && Array.isArray(report.text?.wordHits) ? report.text.wordHits : [];
    const phraseSolves = hasReport && Array.isArray(report.text?.phraseSolves) ? report.text.phraseSolves : [];
    const timeline = hasReport && Array.isArray(report.timeline) ? report.timeline : [];
    const soundRows = hasReport && Array.isArray(report.sound?.rows) ? report.sound.rows : [];
    const auto = modal.autoRefresh !== false;
    return `
      <div class="evs-modal-backdrop evs-user-modal-backdrop" data-evs-user-modal-close="1">
        <div class="evs-modal glass evs-user-modal" role="dialog" aria-modal="true" aria-label="User Statistik">
          <div class="evs-modal-head evs-user-modal-head">
            <div>
              <h3>User-Statistik: ${esc(u.userDisplayName || u.userLogin || login)}</h3>
              <p>${event ? `Aktuelles Event: ${esc(event.name || event.eventUid)}` : 'Aktuelles Event'} · ${hasReport ? `Stand: ${fmtDate(report.updatedAt)}` : 'Report wird geladen oder ist noch leer.'}</p>
            </div>
            <button type="button" class="evs-icon-btn" data-evs-action="closeUserStatsModal">×</button>
          </div>
          <div class="evs-user-modal-toolbar">
            <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="refreshUserStatsModal" data-user-login="${esc(login)}" data-uid="${esc(modal.eventUid || state.selectedUid || '')}">Jetzt aktualisieren</button>
            <button type="button" class="evs-btn evs-btn-secondary ${auto ? 'is-active' : ''}" data-evs-action="toggleUserStatsAuto">AutoReload: ${auto ? 'An' : 'Aus'}</button>
            <small>Aktualisiert nur dieses Popup im Hintergrund. Kein Seitenreload.</small>
          </div>
          <div class="evs-user-modal-body" data-evs-user-modal-body>
            ${hasReport ? `
              <div class="evs-runtime-counters evs-user-counters">
                <div><strong>${esc(u.totalPoints || 0)}</strong><span>Punkte gesamt</span></div>
                <div><strong>${esc(u.soundPoints || 0)}</strong><span>Sound-Punkte</span></div>
                <div><strong>${esc((Number(u.wordPoints || 0) + Number(u.phrasePoints || 0)))}</strong><span>Satz-/Text-Punkte</span></div>
                <div><strong>${esc(u.scoreEntries || 0)}</strong><span>Punkte-Einträge</span></div>
                <div><strong>${esc(u.wordHits || 0)}</strong><span>Worttreffer</span></div>
                <div><strong>${esc(u.phraseSolves || 0)}</strong><span>Satzlösungen</span></div>
              </div>

              <div class="evs-user-modal-grid">
                <section class="evs-runtime-box">
                  <h4>Gefundene Wörter</h4>
                  ${wordHits.length ? wordHits.map(hit => `<div class="evs-runtime-row"><strong>${esc(hit.eventName || hit.eventUid)}</strong><span>Satz ${esc(hit.phraseNumber)} · Wort: ${esc(hit.wordOriginal || hit.wordKey)} · +${esc(hit.pointsAwarded || 0)}</span><small>${fmtDate(hit.createdAt)} · „${esc(hit.chatMessage || '')}“</small></div>`).join('') : '<div class="evs-empty">Keine Worttreffer für diesen User.</div>'}
                </section>
                <section class="evs-runtime-box">
                  <h4>Gelöste Sätze</h4>
                  ${phraseSolves.length ? phraseSolves.map(solve => `<div class="evs-runtime-row"><strong>${esc(solve.eventName || solve.eventUid)}</strong><span>Satz ${esc(solve.phraseNumber)} · +${esc(solve.pointsAwarded || 0)} Punkte</span><small>${fmtDate(solve.createdAt)} · „${esc(solve.chatMessage || '')}“</small></div>`).join('') : '<div class="evs-empty">Keine Satzlösungen für diesen User.</div>'}
                </section>
                <section class="evs-runtime-box">
                  <h4>Sound-Punkte</h4>
                  ${soundRows.length ? soundRows.map(row => `<div class="evs-runtime-row"><strong>${esc(row.eventName || row.eventUid)}</strong><span>${esc(row.reason || row.sourceType || 'Sound')} · +${esc(row.points || 0)}</span><small>${fmtDate(row.createdAt)}</small></div>`).join('') : `<div class="evs-empty">${esc(report.sound?.note || 'Noch keine Sound-Punkte für diesen User im aktuellen Event.')}</div>`}
                </section>
              </div>

              <section class="evs-runtime-box evs-user-timeline evs-user-modal-timeline">
                <h4>Punkte-Verlauf / Wann, wofür, wie viele</h4>
                ${timeline.length ? timeline.map(item => `<div class="evs-user-timeline-row"><b>${esc(userTimelineLabel(item.kind))}</b><span>${esc(item.row?.eventName || item.row?.eventUid || '')}</span><em>${esc(item.label || '')}</em><strong>${esc(item.points || 0)} Punkte</strong><small>${fmtDate(item.createdAt)}</small></div>`).join('') : '<div class="evs-empty">Keine Aktivität für diesen User.</div>'}
              </section>
            ` : `<div class="evs-empty">User-Report für ${esc(login)} wird geladen oder enthält noch keine Daten im aktuellen Event.</div>`}
          </div>
          <div class="evs-user-modal-footer">
            <span>${auto ? `AutoReload alle ${esc(Math.round((modal.intervalMs || 5000) / 1000))} Sekunden` : 'AutoReload aus'}${modal.lastRefreshAt ? ` · zuletzt: ${fmtDate(modal.lastRefreshAt)}` : ''}</span>
            <button type="button" class="evs-btn" data-evs-action="closeUserStatsModal">Schließen</button>
          </div>
        </div>
      </div>
    `;
  }


  function yesNoBadge(value, onLabel = 'An', offLabel = 'Aus'){
    return `<span class="evs-safety-pill ${value ? 'is-ok' : 'is-off'}">${esc(value ? onLabel : offLabel)}</span>`;
  }

  function blockedReasonLabel(reason){
    const map = {
      dispatcher_disabled: 'Dispatcher ist aus',
      global_live_disabled: 'Globaler Live-Schalter ist aus',
      direct_send_not_allowed: 'Direktes Senden ist nicht erlaubt',
      prepared_only_mode: 'Prepared-only Modus aktiv',
      event_live_disabled: 'Event-Live-Schalter ist aus',
      event_chat_output_disabled: 'ChatOutput am Event ist aus',
      output_direct_send_false: 'Output selbst hat directSend=false',
      no_event: 'Kein Event ausgewählt'
    };
    return map[reason] || reason || '-';
  }

  function chatOutputSafetyFor(event){
    const status = state.chatOutputStatus;
    if (event && status && status.eventUid === event.eventUid) return status;
    return null;
  }

  function chatOutputReportFor(event){
    const report = state.chatOutputReport;
    if (event && report && report.eventUid === event.eventUid) return report;
    return null;
  }

  function runtimeGate(){ return state.runtimeGateStatus || state.status?.runtimeGate || null; }

  function runtimeGateReasonLabel(reason){
    const map = {
      active_event_and_stream_online: 'Event läuft und Stream ist online',
      no_active_event: 'Kein Event läuft',
      stream_offline: 'Stream ist offline',
      stream_status_unknown: 'Stream-Status unbekannt',
      stream_status_stale: 'Stream-Status ist veraltet',
      stream_status_unavailable: 'Stream-Status-Modul nicht verfügbar',
      stream_status_error: 'Stream-Status konnte nicht gelesen werden',
      active_event_without_chat_runtime: 'Aktives Event hat kein Sound-/Text-Spiel'
    };
    return map[reason] || reason || '-';
  }

  function renderSafetyTab(event){
    return `
      <div class="evs-grid evs-safety-grid">
        ${renderRuntimeGatePanel()}
        ${event ? renderLifecycleSafetyPanel(event) : renderSelectEventEmpty('Event-Lifecycle')}
      </div>
    `;
  }

  function renderRuntimeGatePanel(){
    const gate = runtimeGate();
    const active = gate?.active === true;
    const stream = gate?.stream || {};
    return `
      <section class="evs-card glass evs-tab-panel evs-runtime-gate-panel">
        <div class="evs-card-head evs-stats-head">
          <div>
            <h3>Event-System Status</h3>
            <span>${active ? 'Aktiv: Stream online und ein Event läuft.' : 'Inaktiv: Keine Event-Chat-Auswertung nötig.'}</span>
          </div>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="runtimeGateStatus">Status neu laden</button>
        </div>
        ${gate ? `
          <div class="evs-safety-banner ${active ? 'is-live' : 'is-safe'}">
            <strong>${active ? '🟢 AKTIV' : '⚪ INAKTIV'}</strong>
            <span>${esc(runtimeGateReasonLabel(gate.reason))}</span>
          </div>
          <div class="evs-mini-grid evs-mini-grid-compact">
            <div><strong>${esc(stream.online ? 'Online' : 'Offline')}</strong><span>Stream</span></div>
            <div><strong>${esc(gate.eventName || '-')}</strong><span>Laufendes Event</span></div>
            <div><strong>${esc(gate.soundEnabled ? 'An' : 'Aus')}</strong><span>Sound-Spiel</span></div>
            <div><strong>${esc(gate.textEnabled ? 'An' : 'Aus')}</strong><span>Text-Spiel</span></div>
          </div>
          <div class="evs-safety-rule-list">
            <div class="${active ? 'is-ok' : 'is-blocked'}"><b>Chat-Auswertung</b><span>${active ? 'läuft für das aktive Event.' : 'läuft nicht, weil sie aktuell nicht gebraucht wird.'}</span></div>
            <div><b>Grundregel</b><span>Stream offline oder kein aktives Event = stream_events ignoriert Chat für Eventspiele.</span></div>
            <div><b>Live-Chatmeldungen</b><span>Bleiben in diesem Step weiterhin aus. EVS-24 aktiviert kein Twitch-Senden.</span></div>
          </div>
        ` : '<div class="evs-empty">Runtime-Status noch nicht geladen.</div>'}
      </section>
    `;
  }

  function renderChatOutputSafetyPanel(event){
    const status = chatOutputSafetyFor(event);
    const report = chatOutputReportFor(event);
    const cfg = status?.config || {};
    const counts = status?.counts || report?.counts || {};
    const reasons = status?.blockedReasons || report?.blockedReasons || {};
    const outputs = Array.isArray(report?.outputs) ? report.outputs : [];
    const liveActive = Number(counts.wouldSend || 0) > 0;
    return `
      <section class="evs-card glass evs-tab-panel evs-safety-panel">
        <div class="evs-card-head evs-stats-head">
          <div>
            <h3>Chat-Ausgabe Sicherheit</h3>
            <span>${liveActive ? 'LIVE AKTIV – Outputs würden gesendet.' : 'TESTMODUS – nichts wird öffentlich gesendet.'}</span>
          </div>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="chatOutputSafety" data-uid="${esc(event.eventUid)}">Status neu laden</button>
        </div>
        <div class="evs-safety-banner ${liveActive ? 'is-live' : 'is-safe'}">
          <strong>${liveActive ? '⚠️ LIVE AKTIV' : '🛡️ TESTMODUS / blockiert'}</strong>
          <span>${liveActive ? 'Mindestens ein ChatOutput würde aktuell gesendet.' : 'Alle vorbereiteten ChatOutputs bleiben blockiert und werden nur angezeigt.'}</span>
        </div>
        ${status ? `
          <div class="evs-mini-grid evs-mini-grid-compact evs-safety-counters">
            <div><strong>${esc(counts.preparedOutputs || 0)}</strong><span>Vorbereitet</span></div>
            <div><strong>${esc(counts.previewedOutputs || 0)}</strong><span>Geprüft</span></div>
            <div><strong>${esc(counts.wouldSend || 0)}</strong><span>Würde senden</span></div>
            <div><strong>${esc(counts.blocked || 0)}</strong><span>Blockiert</span></div>
          </div>
          <div class="evs-safety-switches">
            <div><b>Dispatcher</b>${yesNoBadge(cfg.dispatcherEnabled, 'An', 'Aus')}</div>
            <div><b>Global Live</b>${yesNoBadge(cfg.globalLiveEnabled, 'An', 'Aus')}</div>
            <div><b>DirectSend erlaubt</b>${yesNoBadge(cfg.allowDirectSend, 'Erlaubt', 'Blockiert')}</div>
            <div><b>Prepared-only</b>${yesNoBadge(cfg.preparedOnly, 'Aktiv', 'Aus')}</div>
            <div><b>Event ChatOutput</b>${yesNoBadge(cfg.eventChatOutputEnabled, 'An', 'Aus')}</div>
            <div><b>Event Live</b>${yesNoBadge(cfg.eventLiveEnabled, 'An', 'Aus')}</div>
          </div>
          <div class="evs-runtime-box evs-safety-reasons">
            <div class="evs-runtime-box-head"><h4>Blockiergründe</h4><small>Warum aktuell nicht gesendet wird</small></div>
            ${Object.keys(reasons).length ? Object.entries(reasons).map(([key, value]) => `<div class="evs-info-row"><strong>${esc(blockedReasonLabel(key))}</strong><span>${esc(value)} Output(s)</span></div>`).join('') : '<div class="evs-empty">Keine Blockiergründe gemeldet.</div>'}
          </div>
          <div class="evs-runtime-box evs-safety-output-preview">
            <div class="evs-runtime-box-head"><h4>Output-Preview</h4><small>dry-run / dispatched=false</small></div>
            ${outputs.length ? outputs.slice(0, 8).map(output => `<div class="evs-chat-output-row"><span>${esc(chatKindLabel(output.kind))} · ${output.wouldSend ? 'würde senden' : 'blockiert'}</span><p>${esc(output.text || output.chatText || '')}</p><small>${esc((output.blockedBy || []).map(blockedReasonLabel).join(', ') || 'keine Blocker')}</small></div>`).join('') : '<div class="evs-empty">Noch keine ChatOutputs im Report.</div>'}
          </div>
        ` : '<div class="evs-empty">ChatOutput-Sicherheitsstatus noch nicht geladen.</div>'}
      </section>
    `;
  }

  function finaleBlockedReasonLabel(reason){
    const map = {
      event_not_finished: 'Event ist noch nicht beendet.',
      ranking_empty: 'Es gibt noch keine Punkte/Rangliste.',
      finale_already_started: 'Die Auswertung wurde bereits gestartet.',
      finale_active: 'Das Finale läuft bereits und kann manuell beendet werden.',
      event_not_found: 'Event wurde nicht gefunden.'
    };
    return map[norm(reason)] || (reason ? String(reason) : 'Auswertung ist aktuell nicht möglich.');
  }

  function finalePreviewForEvent(event){
    return state.finalePreview && state.finalePreview.eventUid === event.eventUid ? state.finalePreview : null;
  }

  function finaleActionButtonForEvent(event){
    if (!event) return '';
    const preview = finalePreviewForEvent(event);
    const eligibility = preview?.finaleEligibility || null;
    const finaleActive = Boolean(eligibility?.finaleActive || eligibility?.canEnd || preview?.finaleActive || preview?.dashboardCanEndFinale);
    const existingFinale = Boolean(eligibility?.finaleStarted || preview?.finaleStarted || preview?.existingFinale || event?.winnerFinale);
    if (finaleActive) {
      return `<button type="button" class="evs-btn evs-btn-danger evs-btn-finale" data-evs-action="endWinnerFinale" data-uid="${esc(event.eventUid)}">⏹ Finale beenden</button>`;
    }
    if (existingFinale) {
      return `<button type="button" class="evs-btn evs-btn-primary evs-btn-finale" data-evs-action="replayWinnerFinale" data-uid="${esc(event.eventUid)}">🔁 Auswertung erneut abspielen</button>`;
    }
    const canFinale = Boolean(eligibility?.canStart || preview?.dashboardCanStartFinale);
    if (!canFinale) return '';
    return `<button type="button" class="evs-btn evs-btn-primary evs-btn-finale" data-evs-action="winnerFinale" data-uid="${esc(event.eventUid)}">🏆 Auswertung starten</button>`;
  }

  function renderLifecycleSafetyPanel(event){
    const s = norm(event.status);
    const canArchive = s === 'finished';
    const canFinish = ['active','paused'].includes(s);
    const preview = finalePreviewForEvent(event);
    const eligibility = preview?.finaleEligibility || null;
    const canFinale = Boolean(eligibility?.canStart || preview?.dashboardCanStartFinale);
    const finaleActive = Boolean(eligibility?.finaleActive || eligibility?.canEnd || preview?.finaleActive || preview?.dashboardCanEndFinale);
    const finaleReason = eligibility?.reason || preview?.dashboardBlockedReason || (s !== 'finished' ? 'event_not_finished' : 'ranking_empty');
    const rankingCount = Number(eligibility?.rankingCount ?? preview?.ranking?.count ?? 0) || 0;
    const finaleStarted = Boolean(eligibility?.finaleStarted || preview?.finaleStarted || preview?.existingFinale);
    const canCancel = ['draft','ready','active','paused'].includes(s);
    return `
      <section class="evs-card glass evs-tab-panel evs-lifecycle-panel">
        <div class="evs-card-head evs-stats-head">
          <div>
            <h3>Event verwalten</h3>
            <span>Beenden, archivieren oder löschen – ohne technische Detailansicht.</span>
          </div>
          ${statusBadge(event.status)}
        </div>
        <div class="evs-mini-grid evs-mini-grid-compact">
          <div><strong>${esc(event.name || 'Unbenanntes Event')}</strong><span>Event</span></div>
          <div><strong>${esc(statusText(event.status))}</strong><span>Status</span></div>
          <div><strong>${fmtDate(event.finishedAt)}</strong><span>Beendet am</span></div>
          <div><strong>${fmtDate(event.updatedAt)}</strong><span>Zuletzt geändert</span></div>
        </div>
        <div class="evs-safety-rule-list">
          <div class="${canArchive ? 'is-ok' : 'is-blocked'}"><b>Archivieren</b><span>${canArchive ? 'Dieses Event ist beendet und kann archiviert werden.' : 'Archivieren ist erst möglich, wenn das Event beendet wurde.'}</span></div>
          <div class="${(canFinale || finaleActive || finaleStarted) ? 'is-ok' : 'is-blocked'}"><b>Auswertung</b><span>${finaleActive ? 'Finale läuft und bleibt sichtbar, bis du es manuell beendest.' : (finaleStarted ? 'Auswertung ist vorbereitet und kann erneut abgespielt werden.' : (canFinale ? `Auswertung ist möglich. ${rankingCount} Ranglisten-Eintrag(e) vorhanden.` : finaleBlockedReasonLabel(finaleReason)))}</span></div>
          <div><b>Löschen</b><span>Löschen fragt einmal nach und entfernt dieses Event dauerhaft.</span></div>
          <div><b>Was bleibt erhalten?</b><span>Archivieren behält Punkte, Runden und Textdaten. Löschen entfernt das Event vollständig.</span></div>
        </div>
        <div class="evs-action-row evs-action-row-tight evs-lifecycle-actions">
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="finish" data-uid="${esc(event.eventUid)}" ${canFinish ? '' : 'disabled'}>Auf Finished setzen</button>
          ${finaleActionButtonForEvent(event)}
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="archive" data-uid="${esc(event.eventUid)}" ${canArchive ? '' : 'disabled'}>Archivieren</button>
          <button type="button" class="evs-btn evs-btn-danger" data-evs-action="cancel" data-uid="${esc(event.eventUid)}" ${canCancel ? '' : 'disabled'}>Abbrechen</button>
          <button type="button" class="evs-btn evs-btn-danger" data-evs-action="deleteEvent" data-uid="${esc(event.eventUid)}">Löschen…</button>
        </div>
        <div class="evs-tab-help">Hinweis: Löschen ist endgültig. Vor dem Löschen erscheint eine normale Bestätigung.</div>
      </section>
    `;
  }


  function renderTestPointSummary(result){
    if (!result) return '';
    if (['text-check','text-create','text-wrong','text-word','text-correct','text-duplicate','text-sound','text-report'].includes(result.action || '')) return '';
    const user = result.userStats?.user || result.sound?.userStats?.user || result.finale?.userStats?.user || null;
    const rankingRows = rows(result.ranking?.rows || result.ranking);
    const parts = result.parts || result.sound?.parts || null;
    const textReport = result.reports?.text || result.textReport || null;
    const soundReport = result.reports?.sound || result.soundReport || null;
    const timeline = rows(result.userStats?.timeline || result.sound?.userStats?.timeline).slice(0, 8);
    const hasAny = user || rankingRows.length || parts || textReport || soundReport || timeline.length;
    if (!hasAny) return '';
    return `
      <div class="evs-test-point-summary">
        <h4>Punkte-Prüfung</h4>
        <div class="evs-test-point-cards">
          <div><strong>${esc(user?.totalPoints ?? '-')}</strong><span>Gesamt User</span></div>
          <div><strong>${esc(user?.soundPoints ?? '-')}</strong><span>Sound</span></div>
          <div><strong>${esc(((user?.phrasePoints || 0) + (user?.wordPoints || 0)) || '-')}</strong><span>Satz/Text</span></div>
          <div><strong>${esc(rankingRows[0]?.points ?? '-')}</strong><span>Ranking Top</span></div>
        </div>
        ${result.checks?.note ? `<p class="evs-muted">${esc(result.checks.note)}</p>` : ''}
        ${parts ? `<div class="evs-test-mini-line"><b>Teilspiele:</b> Sound ${parts.sound?.completed ? 'fertig' : 'offen'} · Text ${parts.text?.completed ? 'fertig' : 'offen'} · Gesamt ${parts.completed ? 'fertig' : 'offen'}</div>` : ''}
        ${timeline.length ? `<div class="evs-test-timeline">${timeline.map(item => `<div><b>${esc(userTimelineLabel(item.kind))}</b><span>${esc(item.label || '')}</span><strong>+${esc(item.points || 0)}</strong><small>${fmtDate(item.createdAt)}</small></div>`).join('')}</div>` : ''}
        ${user?.userLogin && result?.eventUid ? `
          <div class="evs-test-point-actions">
            <button type="button" class="evs-btn evs-btn-primary" data-evs-action="openPointsCheckUserStats" data-user-login="${esc(user.userLogin)}" data-uid="${esc(result.eventUid)}">Punkte-Historie dieses Tests öffnen</button>
            <small>Öffnet exakt den letzten Punktecheck-Testlauf. Das echte aktive Event bleibt unverändert.</small>
          </div>
        ` : ''}
      </div>
    `;
  }


  function yesNo(ok){ return ok ? 'OK' : 'FEHLT'; }

  function checkBadge(ok, label, sub){
    const stateClass = ok ? 'is-ok' : 'is-warn';
    return `<div class="evs-text-check-card ${stateClass}"><strong>${ok ? 'OK' : 'FEHLT'}</strong><span>${esc(label)}</span>${sub ? `<small>${esc(sub)}</small>` : ''}</div>`;
  }

  function compactTestStepLabel(key){
    const map = {
      wrongNoPoints: 'Falsch ohne Punkte',
      wordHitWritten: 'Worttreffer zählt',
      phraseSolvesWritten: 'Sätze gelöst',
      duplicatesBlocked: 'Doppelte Lösung blockiert',
      textCompletedAfterText: 'Text-Teil fertig',
      totalStillOpenAfterText: 'Gesamt bleibt offen',
      soundCompletedAfterSound: 'Sound fertig',
      totalCompletedAfterSound: 'Gesamt fertig',
      eventFinishedAfterSound: 'Event beendet'
    };
    return map[key] || key;
  }

  function renderTextCheckSummary(result){
    const textActions = ['text-check','text-create','text-wrong','text-word','text-correct','text-duplicate','text-sound','text-report'];
    if (!result || !textActions.includes(result.action || '')) return '';
    const action = result.action || '';
    const checks = result.checks || {};
    const report = result.reportText || result.textReport || result.after?.reportText || null;
    const parts = result.afterAll?.parts || result.afterSound?.parts || result.parts || null;
    const afterTextParts = result.afterText?.parts || null;
    const rankingRows = rows(result.ranking?.rows || result.ranking).slice(0, 8);
    const phraseSolves = rows(report?.phraseSolves).slice(0, 8);
    const wordHits = rows(report?.wordHits).slice(0, 8);
    const eventUid = result.eventUid || report?.eventUid || '';
    const eventName = result.event?.name || report?.event?.name || result.created?.event?.name || '';
    const eventStatus = result.event?.status || report?.event?.status || result.afterSound?.event?.status || '';
    const isFullCheck = action === 'text-check';
    const users = [
      { login: 'forrestcgn', label: 'ForrestCGN' },
      { login: 'engelcgn', label: 'EngelCGN' },
      { login: 'satzpartial', label: 'SatzPartial' },
      { login: 'satzfalsch01', label: 'SatzFalsch01' },
      { login: 'satzfalsch02', label: 'SatzFalsch02' }
    ];
    const checksList = [
      ['wrongNoPoints', 'Falsche Antwort', 'keine Punkte'],
      ['wordHitWritten', 'Worttreffer', 'Punkte geschrieben'],
      ['phraseSolvesWritten', 'Satzlösung', '2 Sätze gelöst'],
      ['duplicatesBlocked', 'Duplikat-Schutz', 'zweite Lösung blockiert'],
      ['textCompletedAfterText', 'Text-Abschluss', 'alle Sätze fertig'],
      ['totalStillOpenAfterText', 'Kombi-Regel', 'Sound hält offen'],
      ['soundCompletedAfterSound', 'Sound-Abschluss', 'Sound gelöst'],
      ['totalCompletedAfterSound', 'Gesamt-Abschluss', 'alle Teile fertig'],
      ['eventFinishedAfterSound', 'Event-Finish', 'automatisch beendet']
    ];
    const actionHints = {
      'text-create': 'Testevent wurde erstellt und gestartet. Jetzt die Einzelbuttons von oben nach unten testen.',
      'text-wrong': 'Falsche Antworten wurden gegen dieses Satz-Testevent geschickt.',
      'text-word': 'Ein gezielter Worttreffer wurde simuliert und muss im Verlauf sichtbar sein.',
      'text-correct': 'Richtige Satzantworten wurden simuliert. Text sollte fertig sein, Sound/Gesamt aber noch offen.',
      'text-duplicate': 'Doppelte Lösungen wurden geprüft. Es dürfen keine neuen Satzpunkte entstehen.',
      'text-sound': 'Sound wurde für dieses Satz-Testevent gelöst. Danach muss das Kombi-Event fertig sein.',
      'text-report': 'Der aktuelle Satz-Report wurde geladen.',
      'text-check': checks.passed ? 'Satz-System-Prüfung bestanden.' : 'Satz-System-Prüfung hat offene Punkte.'
    };
    const flowCards = isFullCheck ? checksList.map(([key,label,sub]) => checkBadge(Boolean(checks[key]), label, sub)) : [
      checkBadge(Boolean(eventUid), 'Testevent', eventName || 'bereit'),
      checkBadge(action === 'text-wrong' ? rankingRows.length === 0 && phraseSolves.length === 0 && wordHits.length === 0 : true, 'Letzter Schritt', compactTextActionLabel(action)),
      checkBadge(wordHits.length > 0, 'Worttreffer', `${wordHits.length} Treffer`),
      checkBadge(phraseSolves.length > 0, 'Satzlösungen', `${phraseSolves.length} gelöst`),
      checkBadge(Boolean(parts?.text?.completed), 'Text-Teil', parts?.text?.completed ? 'fertig' : 'offen'),
      checkBadge(Boolean(parts?.sound?.completed), 'Sound-Teil', parts?.sound?.completed ? 'fertig' : 'offen'),
      checkBadge(Boolean(parts?.allConfiguredPartsCompleted), 'Gesamt', parts?.allConfiguredPartsCompleted ? 'fertig' : 'offen'),
      checkBadge(eventStatus === 'finished', 'Event-Finish', eventStatus ? statusText(eventStatus) : 'läuft/offen')
    ];
    return `
      <div class="evs-text-check-summary ${(isFullCheck ? checks.passed : result.ok) ? 'is-passed' : ''}">
        <div class="evs-test-section-head">
          <div>
            <h4>${isFullCheck ? 'Satz-System Prüfung' : 'Satz-System Einzeltest'}</h4>
            <p>${esc(actionHints[action] || `Letzter Satz-Test: ${action}`)}</p>
          </div>
          ${isFullCheck ? `<span class="evs-pill ${checks.passed ? 'is-ok' : 'is-warn'}">${checks.passed ? 'BESTANDEN' : 'PRÜFEN'}</span>` : `<span class="evs-pill ${result.ok ? 'is-ok' : 'is-warn'}">${result.ok ? 'OK' : 'PRÜFEN'}</span>`}
        </div>

        ${eventUid ? `<div class="evs-text-flow-current"><b>Testevent:</b><span>${esc(eventName || eventUid)}</span><small>${esc(eventUid)}${eventStatus ? ` · ${esc(statusText(eventStatus))}` : ''}</small></div>` : ''}
        ${checks.note ? `<p class="evs-muted evs-text-check-note">${esc(checks.note)}</p>` : ''}

        <div class="evs-text-check-cards evs-text-check-cards-clean">
          ${flowCards.join('')}
        </div>

        <div class="evs-text-check-status-grid">
          <div class="evs-text-status-card">
            <h5>${isFullCheck ? 'Nach Textlösung' : 'Aktueller Teilspielstatus'}</h5>
            ${(afterTextParts || parts) ? `
              <div class="evs-status-line"><span>Text</span><b class="${(afterTextParts || parts).text?.completed ? 'is-ok' : 'is-warn'}">${(afterTextParts || parts).text?.completed ? 'fertig' : 'offen'}</b></div>
              <div class="evs-status-line"><span>Sound</span><b class="${(afterTextParts || parts).sound?.completed ? 'is-ok' : 'is-warn'}">${(afterTextParts || parts).sound?.completed ? 'fertig' : 'offen'}</b></div>
              <div class="evs-status-line"><span>Gesamt</span><b class="${(afterTextParts || parts).allConfiguredPartsCompleted ? 'is-ok' : 'is-warn'}">${(afterTextParts || parts).allConfiguredPartsCompleted ? 'fertig' : 'offen'}</b></div>
            ` : '<p class="evs-muted">Noch kein Zwischenstatus.</p>'}
          </div>
          <div class="evs-text-status-card">
            <h5>${isFullCheck ? 'Nach Soundlösung' : 'Nächste sinnvolle Aktion'}</h5>
            ${isFullCheck && parts ? `
              <div class="evs-status-line"><span>Text</span><b class="${parts.text?.completed ? 'is-ok' : 'is-warn'}">${parts.text?.completed ? 'fertig' : 'offen'}</b></div>
              <div class="evs-status-line"><span>Sound</span><b class="${parts.sound?.completed ? 'is-ok' : 'is-warn'}">${parts.sound?.completed ? 'fertig' : 'offen'}</b></div>
              <div class="evs-status-line"><span>Gesamt</span><b class="${parts.allConfiguredPartsCompleted ? 'is-ok' : 'is-warn'}">${parts.allConfiguredPartsCompleted ? 'fertig' : 'offen'}</b></div>
            ` : `<p class="evs-muted">${esc(nextTextFlowHint(action, parts, phraseSolves, wordHits))}</p>`}
          </div>
        </div>

        <div class="evs-text-check-columns evs-text-check-columns-clean">
          <div>
            <h5>Gelöste Sätze</h5>
            ${phraseSolves.length ? phraseSolves.map(item => `<div class="evs-text-result-row"><b>Satz ${esc(item.phraseNumber || '-')}</b><span>${esc(item.userDisplayName || item.userLogin || '-')}</span><strong>+${esc(item.pointsAwarded || 0)}</strong><small>${fmtDate(item.createdAt)}</small></div>`).join('') : '<p class="evs-muted">Keine Satzlösungen.</p>'}
          </div>
          <div>
            <h5>Worttreffer</h5>
            ${wordHits.length ? wordHits.map(item => `<div class="evs-text-result-row"><b>${esc(item.wordOriginal || item.wordKey || '-')}</b><span>${esc(item.userDisplayName || item.userLogin || '-')}</span><strong>+${esc(item.pointsAwarded || 0)}</strong><small>Satz ${esc(item.phraseNumber || '-')} · ${fmtDate(item.createdAt)}</small></div>`).join('') : '<p class="evs-muted">Keine Worttreffer.</p>'}
          </div>
          <div>
            <h5>Ranking</h5>
            ${rankingRows.length ? rankingRows.map(item => `<button type="button" class="evs-text-ranking-row" data-evs-action="openPointsCheckUserStats" data-user-login="${esc(item.userLogin || '')}" data-uid="${esc(eventUid)}"><b>#${esc(item.rank || '-')} ${esc(item.userDisplayName || item.userLogin || '-')}</b><span>${esc(item.points || 0)} Punkte</span><small>${esc(item.entries || 0)} Eintrag(e)</small></button>`).join('') : '<p class="evs-muted">Noch kein Ranking.</p>'}
          </div>
        </div>

        ${eventUid ? `<div class="evs-test-point-actions evs-text-history-actions">
          ${users.map(user => `<button type="button" class="evs-btn evs-btn-secondary" data-evs-action="openPointsCheckUserStats" data-user-login="${esc(user.login)}" data-uid="${esc(eventUid)}">${esc(user.label)} Historie</button>`).join('')}
          <small>Öffnet die User-Historie für genau dieses Satz-Testevent. Das echte aktive Event bleibt unangetastet.</small>
        </div>` : ''}
      </div>
    `;
  }

  function compactTextActionLabel(action){
    const map = {
      'text-create': 'erstellt',
      'text-wrong': 'falsche Antwort',
      'text-word': 'Worttreffer',
      'text-correct': 'richtige Antworten',
      'text-duplicate': 'Duplikat-Schutz',
      'text-sound': 'Sound gelöst',
      'text-report': 'Report geladen',
      'text-check': 'Komplettcheck'
    };
    return map[action] || action || 'unbekannt';
  }

  function nextTextFlowHint(action, parts, phraseSolves, wordHits){
    if (action === 'text-create') return 'Als Nächstes: falsche Satzantwort, danach Worttreffer.';
    if (action === 'text-wrong') return 'Als Nächstes: Worttreffer testen.';
    if (action === 'text-word') return 'Als Nächstes: richtige Satzantworten testen.';
    if (action === 'text-correct') return 'Als Nächstes: doppelte Lösung testen, danach Sound lösen.';
    if (action === 'text-duplicate') return 'Als Nächstes: Sound lösen / Gesamtabschluss prüfen.';
    if (action === 'text-sound') return parts?.allConfiguredPartsCompleted ? 'Gesamtabschluss ist erreicht.' : 'Noch ist mindestens ein Teilspiel offen.';
    if (action === 'text-report') return phraseSolves.length || wordHits.length ? 'Report zeigt vorhandene Satzdaten.' : 'Report ist leer. Erst Testevent erstellen und Antworten senden.';
    return 'Einzelbuttons von oben nach unten ausführen.';
  }

  function renderTestTab(event){
    const t = state.testPanel || {};
    const result = t.result || null;
    const finale = result?.finale || null;
    const ranking = Array.isArray(finale?.ranking) ? finale.ranking : [];
    const rowsHtml = ranking.length ? ranking.map(row => `
      <tr>
        <td>${Number(row.rank || 0)}</td>
        <td>
          <div class="evs-test-user">
            ${row.avatarUrl || row.userAvatarUrl ? `<img src="${esc(row.avatarUrl || row.userAvatarUrl)}" alt="">` : `<span>${esc(String(row.userDisplayName || row.userLogin || '?').slice(0,2).toUpperCase())}</span>`}
            <strong>${esc(row.userDisplayName || row.userLogin || '-')}</strong>
          </div>
        </td>
        <td>${esc(row.rewardLabel || (row.crumbBonus ? `+${Number(row.crumbBonus).toLocaleString('de-DE')} Extra` : '-'))}</td>
        <td>${row.avatarUrl || row.userAvatarUrl ? 'ja' : 'nein'}</td>
        <td>${esc(row.source || row.userResolveSource || '-')}</td>
      </tr>
    `).join('') : '<tr><td colspan="5" class="evs-muted">Noch keine Testdaten geladen.</td></tr>';

    return `
      <section class="evs-card glass evs-tab-panel evs-test-tab">
        <div class="evs-card-head">
          <div>
            <h3>Test</h3>
            <span>Winner-Finale und Backend-Testdaten prüfen, ohne echte Eventdaten zu verändern.</span>
          </div>
          ${event ? statusBadge(event.status) : ''}
        </div>

        <div class="evs-test-grid">
          <div class="evs-test-panel">
            <h4>Winner-Finale Overlay testen</h4>
            <p class="evs-muted">Öffnet das Finale-Overlay mit zufälligen Backend-Usern und Avatar-Auflösung.</p>

            <div class="evs-test-button-row">
              <button type="button" class="evs-btn evs-btn-primary" data-evs-action="openWinnerOverlayLive">Winner-Overlay öffnen</button>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="openRuntimeOverlayLive">Runtime-Overlay öffnen</button>
              <button type="button" class="evs-btn evs-btn-ghost" data-evs-action="copyWinnerOverlayLive">Winner-URL kopieren</button>
            </div>

            <div class="evs-test-button-row">
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="openWinnerTest" data-count="5" data-mode="instant">Sofortbild 5</button>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="openWinnerTest" data-count="7" data-mode="instant">Sofortbild 7</button>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="openWinnerTest" data-count="10" data-mode="instant">Sofortbild 10</button>
            </div>

            <div class="evs-test-button-row">
              <button type="button" class="evs-btn evs-btn-primary" data-evs-action="openWinnerTest" data-count="5" data-mode="timeline" data-duration="short">Timeline kurz 5</button>
              <button type="button" class="evs-btn evs-btn-primary" data-evs-action="openWinnerTest" data-count="7" data-mode="timeline" data-duration="short">Timeline kurz 7</button>
              <button type="button" class="evs-btn evs-btn-primary" data-evs-action="openWinnerTest" data-count="10" data-mode="timeline" data-duration="short">Timeline kurz 10</button>
            </div>

            <div class="evs-test-button-row">
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="openWinnerTest" data-count="7" data-mode="timeline" data-duration="normal">Timeline normal 7</button>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="openWinnerTest" data-count="7" data-mode="timeline" data-duration="long">Timeline lang 7</button>
              <button type="button" class="evs-btn evs-btn-ghost" data-evs-action="copyWinnerTest" data-count="7" data-mode="timeline" data-duration="short">URL kopieren</button>
              <button type="button" class="evs-btn evs-btn-ghost" data-evs-action="openWinnerDebug">Debug-Boxen</button>
            </div>
          </div>

          <div class="evs-test-panel">
            <h4>Event-Testabläufe</h4>
            <p class="evs-muted">Erstellt ein Testevent, simuliert falsche/richtige Antworten und geht bis zur Auswertung. Keine echte Twitch-Ausgabe.</p>
            <div class="evs-test-button-row">
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="runEventTestStep" data-step="create" ${t.loading ? 'disabled' : ''}>Testevent erstellen</button>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="runEventTestStep" data-step="start" ${t.loading ? 'disabled' : ''}>Testevent starten</button>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="runEventTestStep" data-step="wrong" ${t.loading ? 'disabled' : ''}>Falsche Antworten</button>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="runEventTestStep" data-step="correct" ${t.loading ? 'disabled' : ''}>Richtige Antworten</button>
            </div>
            <div class="evs-test-button-row">
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="runEventTestStep" data-step="sound-correct" ${t.loading ? 'disabled' : ''}>Sound richtig + Punkte</button>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="runEventTestStep" data-step="seed-ranking" data-count="10" ${t.loading ? 'disabled' : ''}>Ranking 10 User</button>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="runEventTestStep" data-step="finish" ${t.loading ? 'disabled' : ''}>Event beenden</button>
              <button type="button" class="evs-btn evs-btn-primary" data-evs-action="runEventTestStep" data-step="finale" ${t.loading ? 'disabled' : ''}>Auswertung starten</button>
            </div>
            <div class="evs-test-button-row">
              <button type="button" class="evs-btn evs-btn-primary" data-evs-action="runEventTestStep" data-step="points-check" ${t.loading ? 'disabled' : ''}>Punkte-Check Sound + Satz</button>
              <button type="button" class="evs-btn evs-btn-primary" data-evs-action="runEventTestStep" data-step="full-flow" data-count="10" ${t.loading ? 'disabled' : ''}>Full-Flow komplett</button>
            </div>
          </div>

          <div class="evs-test-panel">
            <h4>Satz-System gezielt testen</h4>
            <p class="evs-muted">Prüft Satzantworten, Worttreffer, doppelte Lösungen und den Abschlussstatus. Keine echte Twitch-Ausgabe.</p>
            <div class="evs-test-button-row">
              <button type="button" class="evs-btn evs-btn-primary" data-evs-action="runEventTestStep" data-step="text-check" ${t.loading ? 'disabled' : ''}>Satz-Check komplett</button>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="runEventTestStep" data-step="text-create" ${t.loading ? 'disabled' : ''}>Satz-Testevent erstellen</button>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="runEventTestStep" data-step="text-report" ${t.loading ? 'disabled' : ''}>Satz-Report</button>
            </div>
            <div class="evs-test-button-row">
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="runEventTestStep" data-step="text-wrong" ${t.loading ? 'disabled' : ''}>Falsche Satzantwort</button>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="runEventTestStep" data-step="text-word" ${t.loading ? 'disabled' : ''}>Worttreffer</button>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="runEventTestStep" data-step="text-correct" ${t.loading ? 'disabled' : ''}>Richtige Satzantworten</button>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="runEventTestStep" data-step="text-duplicate" ${t.loading ? 'disabled' : ''}>Doppelte Lösung</button>
              <button type="button" class="evs-btn evs-btn-primary" data-evs-action="runEventTestStep" data-step="text-sound" ${t.loading ? 'disabled' : ''}>Sound lösen / Abschluss</button>
            </div>
          </div>

          <div class="evs-test-panel">
            <h4>Backend-Testdaten prüfen</h4>
            <p class="evs-muted">Ruft Random-Testdaten ab und zeigt Quelle sowie Avatar-Status.</p>
            <div class="evs-test-button-row">
              <button type="button" class="evs-btn evs-btn-primary" data-evs-action="fetchWinnerRandomDemo" data-count="5" ${t.loading ? 'disabled' : ''}>5 User laden</button>
              <button type="button" class="evs-btn evs-btn-primary" data-evs-action="fetchWinnerRandomDemo" data-count="7" ${t.loading ? 'disabled' : ''}>7 User laden</button>
              <button type="button" class="evs-btn evs-btn-primary" data-evs-action="fetchWinnerRandomDemo" data-count="10" ${t.loading ? 'disabled' : ''}>10 User laden</button>
            </div>
            ${t.loading ? '<div class="evs-muted">Lade Testdaten...</div>' : ''}
            ${t.error ? `<div class="evs-alert evs-alert-error">${esc(t.error)}</div>` : ''}
            ${t.message ? `<div class="evs-alert evs-alert-ok">${esc(t.message)}</div>` : ''}
          </div>
        </div>

        ${renderTestPointSummary(t.result)}
        ${renderTextCheckSummary(t.result)}

        <div class="evs-test-result evs-test-panel">
          <h4>Letzte Random-Testdaten</h4>
          <table class="evs-test-table">
            <thead>
              <tr><th>Platz</th><th>User</th><th>Gewinn</th><th>Avatar</th><th>Quelle</th></tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>

        <div class="evs-test-panel evs-test-note">
          <h4>Echte Auswertung</h4>
          <p>Für ein echtes beendetes Event nutzt du im Bereich <b>Event verwalten</b> den Button <b>Auswertung starten</b> oder im Chat <code>!event auswertung</code>.</p>
        </div>
      </section>
    `;
  }

  function renderOverlayTab(event){
    return `
      <section class="evs-card glass evs-tab-panel">
        <div class="evs-card-head">
          <div><h3>Overlay</h3><span>Vorschau und Anzeigeoptionen werden später hier getrennt eingebaut.</span></div>
          ${event ? statusBadge(event.status) : ''}
        </div>
        <div class="evs-empty">Overlay ist noch nicht Teil dieses Steps. Geplant: aktuelles Event, aktuelle Runde, Hinweise, Gewinner und Top 3.</div>
      </section>
    `;
  }

  function renderSelectEventEmpty(title){
    return `
      <section class="evs-card glass evs-tab-panel">
        <div class="evs-card-head"><h3>${esc(title)}</h3></div>
        <div class="evs-empty">Bitte zuerst in der Übersicht ein Event auswählen oder ein neues Event erstellen.</div>
      </section>
    `;
  }

  function mediaFieldInput(field){
    if (!field) return null;
    const selector = field.dataset.valueInput || '';
    if (selector) {
      try {
        return field.querySelector(selector) || document.querySelector(selector) || field.querySelector('[data-media-field-value]');
      } catch (_) {
        return field.querySelector('[data-media-field-value]');
      }
    }
    return field.querySelector('[data-media-field-value]');
  }

  function mediaPreviewAssetFromResolved(data){
    const asset = data?.asset || data?.option || data?.media || data;
    if (!asset || !asset.id) return null;
    return {
      ...asset,
      id: asset.id,
      type: asset.type || '',
      label: asset.label || asset.displayName || asset.fileName || asset.relativePath || `#${asset.id}`,
      displayName: asset.displayName || asset.label || asset.fileName || '',
      fileName: asset.fileName || '',
      relativePath: asset.relativePath || data?.paths?.relativePath || '',
      webPath: asset.webPath || data?.paths?.webPath || '',
      durationMs: Number(asset.durationMs || 0),
      hasAudio: !!asset.hasAudio,
      hasVideo: !!asset.hasVideo
    };
  }

  function renderStoredMediaFallback(field, mediaId, errorText = ''){
    const preview = field?.querySelector('[data-media-field-preview]');
    if (!preview || !mediaId) return;
    preview.innerHTML = `
      <div class="mf-preview-meta">
        <strong>Medium gespeichert</strong>
        <small>${esc(errorText || 'Vorschau konnte nicht geladen werden. Die gespeicherte Media-ID bleibt erhalten.')}</small>
        <code>mediaId=${esc(mediaId)}</code>
      </div>`;
  }

  async function hydrateMediaFieldPreview(field){
    if (!field || field.dataset.evsHydrated === '1') return;
    const input = mediaFieldInput(field);
    const mediaId = String(input?.value || field.dataset.mediaId || '').trim();
    if (!mediaId) return;
    field.dataset.mediaId = mediaId;
    field.dataset.evsHydrated = '1';
    renderStoredMediaFallback(field, mediaId, 'Vorschau wird geladen…');
    if (!window.CGN?.api) return;
    try {
      const data = await window.CGN.api(`/api/media/resolve?mediaId=${encodeURIComponent(mediaId)}`);
      const asset = mediaPreviewAssetFromResolved(data);
      if (asset && window.MediaField?.updateValue) {
        window.MediaField.updateValue(field, field.__mediaFieldConfig || {}, asset);
      } else {
        renderStoredMediaFallback(field, mediaId, data?.error || 'Medium ist gespeichert, aber die Vorschau konnte nicht aufgelöst werden.');
      }
    } catch (err) {
      renderStoredMediaFallback(field, mediaId, err?.message || 'Medium ist gespeichert, aber die Vorschau konnte nicht geladen werden.');
    }
  }

  function hydrateMediaFields(scope){
    if (!scope) return;
    scope.querySelectorAll('[data-media-field]').forEach(field => { hydrateMediaFieldPreview(field); });
  }

  function attachMediaFields(scope){
    if (!scope) return;
    if (window.MediaField?.initAll) {
      window.MediaField.initAll(scope);
      scope.querySelectorAll('[data-media-field]').forEach(field => {
        const openLabel = field.dataset.openLabel || '';
        const clearLabel = field.dataset.clearLabel || '';
        const openBtn = field.querySelector('[data-media-field-open]');
        const clearBtn = field.querySelector('[data-media-field-clear]');
        if (openLabel && openBtn) openBtn.textContent = openLabel;
        if (clearLabel && clearBtn) clearBtn.textContent = clearLabel;
      });
      hydrateMediaFields(scope);
      return;
    }
    scope.querySelectorAll('[data-media-field-preview]').forEach(preview => {
      preview.innerHTML = '<span class="mf-muted">Media-System-Komponente nicht geladen.</span>';
    });
  }

  function renderEventRow(event){
    const active = event.eventUid === state.selectedUid || (!state.selectedUid && event === state.events[0]);
    const sound = event.soundConfig || {};
    const text = event.textConfig || {};
    const snippets = Array.isArray(sound.snippets) ? sound.snippets.length : 0;
    const phrases = Array.isArray(text.phrases) ? text.phrases.length : 0;
    return `
      <button type="button" class="evs-event-row ${active ? 'is-active' : ''}" data-evs-select="${esc(event.eventUid)}">
        <span>
          <strong>${esc(event.name || 'Unbenanntes Event')}</strong>
          <small>${esc(eventTypes(event))} · Sounds ${esc(snippets)} · Sätze ${esc(phrases)} · geändert ${fmtDate(event.updatedAt)}</small>
        </span>
        ${statusBadge(event.status)}
      </button>
    `;
  }

  function renderSoundLiveControls(event){
    if (!event?.soundEnabled || norm(event.status) !== 'active') return '';
    const report = soundRuntimeReportFor(event);
    const canSkip = canShowSoundSkipWait(event, report);
    return `
      <section class="evs-sound-live-control evs-runtime-box">
        <div class="evs-runtime-box-head">
          <div>
            <h4>Sound-Steuerung</h4>
            <small>Manuelle Steuerung für laufende Events. Playback läuft über den normalen Sound-System-Flow.</small>
          </div>
          <button type="button" class="evs-btn evs-btn-secondary evs-btn-small" data-evs-action="soundRuntimeReport" data-uid="${esc(event.eventUid)}">Status neu laden</button>
        </div>
        ${soundControlRows(event, report)}
        <div class="evs-action-row evs-action-row-tight">
          ${canSkip ? `<button type="button" class="evs-btn" data-evs-action="soundSkipWait" data-uid="${esc(event.eventUid)}">Wartezeit überspringen</button>` : ''}
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="openLiveStatus" data-uid="${esc(event.eventUid)}">Status & Punkte öffnen</button>
        </div>
        <small class="evs-muted">${canSkip ? 'Überspringt die aktuelle Wartezeit und startet den nächsten Schnipsel über den normalen Event-Ablauf. Danach läuft die automatische Wartezeit wieder normal weiter.' : 'Wartezeit überspringen ist nur sichtbar, wenn das Event aktiv wartet und der Stream online ist.'}</small>
      </section>
    `;
  }

  function renderEventConfigSummary(event){
    const sound = soundSettingsSummary(event.soundConfig || {});
    const text = event.textConfig || {};
    return `
      <section class="evs-event-config-summary">
        <div class="evs-form-row-head">
          <div>
            <strong>Event-Einstellungen</strong>
            <small>Diese Regeln gelten nur für dieses Event. Globale Defaults bleiben im Config-Tab.</small>
          </div>
          <button type="button" class="evs-btn evs-btn-secondary evs-btn-small" data-evs-action="editSettings" data-uid="${esc(event.eventUid)}">Einstellungen bearbeiten</button>
        </div>
        <div class="evs-mini-grid evs-mini-grid-compact evs-event-config-grid">
          ${event.soundEnabled ? `
            <div><strong>${esc(soundPlaybackModeLabel(sound.playbackMode))}</strong><span>Ablauf</span></div>
            <div><strong>${esc(sound.answerSeconds)} Sek. · ${esc(sound.defaultPoints)} Punkte</strong><span>Antwort</span></div>
            <div><strong>${esc(sound.intervalMinutes)} ± ${esc(sound.intervalJitterMinutes)} Min. · Pause ${esc(sound.roundDelaySeconds)}s</strong><span>Automatik</span></div>
            <div><strong>${esc(soundOutputTargetLabel(sound.outputTarget))} · ${esc(soundTargetLabel(sound.target))}</strong><span>Ausgabe</span></div>
            <div><strong>${esc(sound.preRollEnabled ? `PreRoll ${sound.preRollSeconds}s` : 'PreRoll aus')} · ${esc(sound.countdownPreRollEnabled ? `Countdown ${sound.countdownPreRollSeconds}s` : 'Countdown aus')}</strong><span>Vorbereitung</span></div>
            <div><strong>${esc(soundOrderModeLabel(sound.orderMode))} · Abstand ${esc(sound.minRepeatDistance)}</strong><span>Rotation</span></div>
            <div><strong>${esc(soundSolvedPolicyLabel(sound.solvedPolicy))} / ${esc(soundUnresolvedPolicyLabel(sound.unresolvedPolicy))}</strong><span>Rundenende</span></div>
            <div><strong>${esc(soundRevealModeLabel(sound.revealVideoMode, sound.revealVideoEnabled))}</strong><span>Auflösung</span></div>
          ` : '<div><strong>Sound aus</strong><span>Kein Sound-Spiel aktiv</span></div>'}
          ${event.textEnabled ? `<div><strong>${esc(text.defaultPhrasePoints || text.pointsFirst || 40)} Punkte</strong><span>Text-Lösung</span></div>` : ''}
        </div>
      </section>
    `;
  }

  function renderEventDetail(event){
    const rankingRows = rankingRowsForEvent(event);
    return `
      <div class="evs-detail">
        <div class="evs-detail-title">
          <div>
            <h3>${esc(event.name || 'Unbenanntes Event')}</h3>
            <p>${esc(event.description || 'Keine Beschreibung.')}</p>
          </div>
        </div>

        <div class="evs-mini-grid">
          <div><strong>Spieltyp</strong><span>${esc(eventTypes(event))}</span></div>
          <div><strong>Erstellt</strong><span>${fmtDate(event.createdAt)}</span></div>
          <div><strong>Gestartet</strong><span>${fmtDate(event.startedAt)}</span></div>
          <div><strong>Beendet</strong><span>${fmtDate(event.finishedAt)}</span></div>
        </div>

        ${renderValidation(event)}
        ${renderEventConfigSummary(event)}
        ${renderSoundLiveControls(event)}

        <div class="evs-action-row">
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="edit" data-uid="${esc(event.eventUid)}">Bearbeiten</button>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="editSettings" data-uid="${esc(event.eventUid)}">Einstellungen bearbeiten</button>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="openLiveStatus" data-uid="${esc(event.eventUid)}" ${norm(event.status) === 'active' ? '' : 'disabled title="Status & Punkte wird relevant, sobald das Event läuft"'}>Status & Punkte</button>
          ${finaleActionButtonForEvent(event)}
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="renameEvent" data-uid="${esc(event.eventUid)}">Umbenennen</button>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="duplicateEvent" data-uid="${esc(event.eventUid)}">Kopieren</button>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="validate" data-uid="${esc(event.eventUid)}">Prüfen</button>
          <button type="button" class="evs-btn" data-evs-action="start" data-uid="${esc(event.eventUid)}" ${event.status === 'ready' ? '' : 'disabled'}>Starten</button>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="finish" data-uid="${esc(event.eventUid)}" ${event.status === 'active' ? '' : 'disabled'}>Beenden</button>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="archive" data-uid="${esc(event.eventUid)}" ${norm(event.status) === 'finished' ? '' : 'disabled'}>Archivieren</button>
          <button type="button" class="evs-btn evs-btn-danger" data-evs-action="cancel" data-uid="${esc(event.eventUid)}" ${['draft','ready','active'].includes(norm(event.status)) ? '' : 'disabled'}>Abbrechen</button>
          <button type="button" class="evs-btn evs-btn-danger" data-evs-action="deleteEvent" data-uid="${esc(event.eventUid)}">Löschen…</button>
        </div>

        <div class="evs-ranking">
          <div class="evs-card-head evs-card-head-inner"><h3>Aktuelle Rangliste</h3><button type="button" class="evs-btn evs-btn-small evs-btn-secondary" data-evs-action="ranking" data-uid="${esc(event.eventUid)}">Neu laden</button></div>
          ${rankingRows.length ? rankingRows.slice(0, 10).map(row => `<div class="evs-rank-row"><strong>#${esc(row.rank)}</strong><span>${esc(row.userDisplayName || row.userLogin)}</span><b>${esc(row.points)} Punkte</b></div>`).join('') : '<div class="evs-empty">Noch keine Punkte.</div>'}
        </div>
      </div>
    `;
  }

  function modalEvent(){ return state.modal?.event || {}; }

  function renderPhraseEditor(phrase, index, total){
    const answerValue = Array.isArray(phrase.acceptedAnswers) ? phrase.acceptedAnswers.join(', ') : '';
    return `
      <section class="evs-phrase-row" data-evs-phrase-row data-index="${index}">
        <div class="evs-phrase-head">
          <div>
            <strong>Satz ${index + 1}</strong>
            <small>Komplette Lösung gewinnt · Teiltreffer werden aus den Wörtern dieses Satzes berechnet</small>
          </div>
          <button type="button" class="evs-icon-btn evs-icon-btn-danger" data-evs-action="removePhrase" data-index="${index}" ${total <= 1 ? 'disabled title="Mindestens ein Satz bleibt sichtbar"' : ''}>×</button>
        </div>
        <label>Geheimsatz<textarea data-evs-phrase-text rows="3" placeholder="z. B. Forrest und Engel machen Party...">${esc(phrase.phrase || phrase.text || phrase.solution || '')}</textarea></label>
        <div class="evs-two-cols evs-text-answers-points">
          <label>Erlaubte Antworten / Varianten <span class="evs-inline-optional">Optional</span><input data-evs-phrase-answers value="${esc(answerValue)}" placeholder="optional, z. B. forrest engel party, forrest und engel machen party"></label>
          <label>Punkte für komplette Lösung<input data-evs-phrase-points type="number" min="0" value="${esc(phrase.pointsFirst || phrase.points || 40)}"></label>
        </div>
      </section>
    `;
  }


  function textCategories(){
    const list = Array.isArray(state.texts?.categories) ? state.texts.categories : [];
    return list.length ? list : [{ id: 'general', label: 'Texte', key: 'general' }];
  }

  function textKeysForCategory(categoryId){
    const keys = Array.isArray(state.texts?.keys) ? state.texts.keys : [];
    return keys.filter(item => String(item.category || 'general') === String(categoryId || 'general'));
  }


  function textModuleOptions(){
    return [
      { id: 'all', label: 'Alle Textbereiche', hint: 'Alles anzeigen' },
      { id: 'event', label: 'Event-System allgemein', hint: 'Start, Ende, Status, Eventmeldungen' },
      { id: 'text', label: 'Text-Spiel', hint: 'Worttreffer, Satzlösung, Text-Runtime' },
      { id: 'sound', label: 'Sound-Spiel', hint: 'Soundrunde, erkannt, ungelöst' },
      { id: 'points', label: 'Punkte & Ranking', hint: 'Punkte, Rangliste, Top 3' },
      { id: 'system', label: 'System / Sonstiges', hint: 'Alles, was nicht eindeutig zugeordnet ist' }
    ];
  }

  function textModuleForKey(keyItem){
    const key = String(keyItem?.key || '').toLowerCase();
    const cat = String(keyItem?.category || '').toLowerCase();
    if (key.startsWith('text.') || cat.includes('text')) return 'text';
    if (key.startsWith('sound.') || cat.includes('sound')) return 'sound';
    if (key.startsWith('points.') || key.startsWith('ranking.') || cat.includes('point') || cat.includes('ranking')) return 'points';
    if (key.startsWith('event.') || cat.includes('event') || key.includes('started') || key.includes('finished')) return 'event';
    return 'system';
  }

  function textKeyMatchesFilters(keyItem){
    const selectedModule = state.textModuleFilter || 'all';
    if (selectedModule !== 'all' && textModuleForKey(keyItem) !== selectedModule) return false;
    const search = String(state.textSearchFilter || '').trim().toLowerCase();
    if (!search) return true;
    const haystack = [
      keyItem?.key,
      keyItem?.category,
      keyItem?.label,
      ...(Array.isArray(keyItem?.variants) ? keyItem.variants.map(v => v?.value || v?.text || '') : [])
    ].join(' ').toLowerCase();
    return haystack.includes(search);
  }

  function textKeysForCategoryFiltered(categoryId){
    return textKeysForCategory(categoryId).filter(textKeyMatchesFilters);
  }

  function countTextKeysForModule(moduleId){
    const keys = Array.isArray(state.texts?.keys) ? state.texts.keys : [];
    if (moduleId === 'all') return keys.length;
    return keys.filter(item => textModuleForKey(item) === moduleId).length;
  }

  function renderTextVariant(variant, keyItem){
    const id = variant?.id || '';
    const value = variant?.value || variant?.text || '';
    const enabled = variant?.enabled !== false;
    const weight = variant?.weight || 1;
    return `
      <div class="evs-text-variant" data-evs-text-variant data-variant-id="${esc(id)}" data-text-key="${esc(keyItem.key)}" data-category="${esc(keyItem.category || 'general')}">
        <textarea rows="2" data-evs-text-value placeholder="Textvariante">${esc(value)}</textarea>
        <div class="evs-text-variant-actions">
          <label class="evs-check evs-check-compact"><input type="checkbox" data-evs-text-enabled ${enabled ? 'checked' : ''}> Aktiv</label>
          <label class="evs-mini-label">Gewichtung<input type="number" min="1" data-evs-text-weight value="${esc(weight)}"></label>
          <button type="button" class="evs-btn evs-btn-small" data-evs-action="saveTextVariant">Speichern</button>
          <button type="button" class="evs-btn evs-btn-small evs-btn-danger" data-evs-action="deleteTextVariant" ${id ? '' : 'disabled'}>Löschen</button>
        </div>
      </div>
    `;
  }

  function renderTextKeyEditor(keyItem){
    const variants = Array.isArray(keyItem.variants) && keyItem.variants.length ? keyItem.variants : [];
    const category = keyItem.category || 'general';
    return `
      <details class="evs-text-key" data-evs-text-key="${esc(keyItem.key)}" open>
        <summary>
          <span><strong>${esc(keyItem.key)}</strong><small>${esc(keyItem.activeCount || 0)} aktiv / ${esc(keyItem.totalCount || variants.length)} Varianten</small></span>
        </summary>
        <div class="evs-text-key-body">
          ${variants.map(v => renderTextVariant(v, keyItem)).join('') || '<div class="evs-empty">Noch keine Variante vorhanden.</div>'}
          <div class="evs-text-variant evs-text-variant-new" data-evs-text-new data-text-key="${esc(keyItem.key)}" data-category="${esc(category)}">
            <textarea rows="2" data-evs-text-value placeholder="Neue Variante hinzufügen"></textarea>
            <div class="evs-text-variant-actions">
              <label class="evs-check evs-check-compact"><input type="checkbox" data-evs-text-enabled checked> Aktiv</label>
              <label class="evs-mini-label">Gewichtung<input type="number" min="1" data-evs-text-weight value="1"></label>
              <button type="button" class="evs-btn evs-btn-small evs-btn-secondary" data-evs-action="saveTextVariant">+ Variante speichern</button>
            </div>
          </div>
        </div>
      </details>
    `;
  }

  function renderTextConfigPanel(asTab = false){
    const categories = textCategories();
    if (!state.texts) {
      return `
        <section class="evs-card glass evs-text-config-panel ${asTab ? 'evs-tab-panel' : ''}">
          <div class="evs-card-head"><h3>Text-Config / Multi-Texte</h3><button type="button" class="evs-btn evs-btn-small evs-btn-secondary" data-evs-action="reloadTexts">Texte laden</button></div>
          <div class="evs-empty">Texte werden beim Aktualisieren geladen.</div>
        </section>
      `;
    }
    return `
      <section class="evs-card glass evs-text-config-panel ${asTab ? 'evs-tab-panel' : ''}">
        <div class="evs-card-head">
          <div>
            <h3>Text-Config / Multi-Texte</h3>
            <span>Chat- und Systemtexte für Eventmeldungen. Varianten werden zufällig für Chat-/Overlay-Ausgaben genutzt.</span>
          </div>
          <button type="button" class="evs-btn evs-btn-small evs-btn-secondary" data-evs-action="reloadTexts">Texte neu laden</button>
        </div>
        <div class="evs-text-config-help">
          <strong>Aktiv:</strong> Diese Texte sind dashboardfähig und werden zufällig von der Chat-/Overlay-Runtime genutzt. Platzhalter wie <code>{user}</code>, <code>{points}</code>, <code>{eventName}</code>, <code>{phraseNumber}</code> und <code>{wordCount}</code> bleiben im Text stehen.
        </div>
        <div class="evs-text-filter-bar">
          <label>
            <span>Textbereich</span>
            <select data-evs-text-module-filter>
              ${textModuleOptions().map(opt => `<option value="${esc(opt.id)}" ${String(state.textModuleFilter || 'all') === opt.id ? 'selected' : ''}>${esc(opt.label)} (${esc(countTextKeysForModule(opt.id))})</option>`).join('')}
            </select>
          </label>
          <label class="evs-text-search">
            <span>Suchen</span>
            <input data-evs-text-search-filter value="${esc(state.textSearchFilter || '')}" placeholder="Key oder Text suchen...">
          </label>
          <button type="button" class="evs-btn evs-btn-small evs-btn-secondary" data-evs-action="clearTextFilters">Filter zurücksetzen</button>
        </div>
        <div class="evs-text-filter-hint">
          ${esc((textModuleOptions().find(opt => opt.id === (state.textModuleFilter || 'all')) || textModuleOptions()[0]).hint)}
        </div>
        <div class="evs-text-category-list">
          ${categories.map(cat => {
            const keys = textKeysForCategoryFiltered(cat.id || cat.key);
            if (!keys.length) return '';
            return `
              <details class="evs-text-category" open>
                <summary><strong>${esc(cat.label || cat.id || cat.key)}</strong><small>${esc(keys.length)} sichtbare Text-Key(s)</small></summary>
                <div class="evs-text-category-body">
                  ${keys.map(renderTextKeyEditor).join('')}
                </div>
              </details>
            `;
          }).join('') || '<div class="evs-empty">Keine Texte für diesen Filter gefunden.</div>'}
        </div>
      </section>
    `;
  }

  function soundSnippetMissingFields(snippet){
    const item = snippet || {};
    const title = String(item.title || item.name || '').trim();
    const mediaValue = String(item.mediaId || item.mediaPath || item.file || item.snippetMediaId || '').trim();
    const answers = Array.isArray(item.acceptedAnswers) ? item.acceptedAnswers.map(v => String(v || '').trim()).filter(Boolean) : [];
    const missing = [];
    if (!title) missing.push('Name');
    if (!answers.length) missing.push('Antwort');
    if (!mediaValue) missing.push('Audio');
    return missing;
  }

  function soundSnippetSummaryData(snippet, index){
    const item = snippet || {};
    const mediaValue = item.mediaId || item.mediaPath || item.file || item.snippetMediaId || '';
    const videoValue = item.revealVideoMediaId || item.videoMediaId || '';
    const answers = Array.isArray(item.acceptedAnswers) ? item.acceptedAnswers : [];
    const label = item.title || item.name || mediaValue || `Schnipsel ${index + 1}`;
    const missing = soundSnippetMissingFields(item);
    const meta = `${answers.length} Antwort(en) · ${mediaValue ? 'Audio gesetzt' : 'Audio fehlt'}${videoValue ? ' · Video gesetzt' : ''}`;
    return { label, meta, answers, mediaValue, videoValue, missing };
  }

  function renderSoundSnippetEditor(snippet, index, total){
    const item = snippet || {};
    const summary = soundSnippetSummaryData(item, index);
    const mediaValue = summary.mediaValue;
    const videoValue = summary.videoValue;
    const answers = summary.answers;
    const audioInputId = `evsSnippetMedia_${index}`;
    const videoInputId = `evsSnippetVideo_${index}`;
    return `
      <details class="evs-sound-snippet ${summary.missing.length ? 'has-missing-required' : ''}" data-evs-sound-snippet-row data-index="${esc(index)}" ${index === 0 || item.title || mediaValue ? 'open' : ''}>
        <summary>
          <span><strong data-evs-snippet-summary-label>${esc(summary.label)}</strong><small data-evs-snippet-summary-meta>${esc(summary.meta)}</small><small class="evs-snippet-missing" data-evs-snippet-missing>${summary.missing.length ? `Fehlt: ${esc(summary.missing.join(', '))}` : ''}</small></span>
          <button type="button" class="evs-btn evs-btn-danger evs-btn-small" data-evs-action="removeSoundSnippet" data-index="${esc(index)}" ${total <= 1 ? 'disabled' : ''}>Entfernen</button>
        </summary>
        <div class="evs-sound-media-grid">
          <section class="evs-sound-card evs-sound-card-required">
            <div class="evs-sound-card-head">
              <div>
                <strong>Audio-Schnipsel ${esc(index + 1)}</strong>
                <small>Pflicht · das sollen die Zuschauer erraten</small>
              </div>
              <span class="evs-badge evs-badge-warn">Pflicht</span>
            </div>
            <label>Schnipsel-Name<input data-evs-snippet-title value="${esc(item.title || item.name || '')}" placeholder="z. B. Knight Rider"></label>
            <label>Erlaubte Antworten, mit Komma getrennt<input data-evs-snippet-answers value="${esc(answers.join(', '))}" placeholder="knight rider, knightrider"></label>
            <div class="evs-field-block">
              <span class="evs-label">Audio aus Media-System</span>
              <div class="evs-media-field evs-media-field-audio" data-media-field data-module-key="stream_events" data-category-key="sound_snippets" data-allowed-types="audio" data-title="Audio-Schnipsel auswählen oder hochladen" data-open-label="Audio-Schnipsel auswählen" data-clear-label="Entfernen" data-value-input="#${esc(audioInputId)}">
                <input id="${esc(audioInputId)}" type="hidden" data-media-field-value data-evs-snippet-media value="${esc(mediaValue)}">
              </div>
            </div>
          </section>

          <section class="evs-sound-card evs-sound-card-optional">
            <div class="evs-sound-card-head">
              <div>
                <strong>Auflösungs-Video</strong>
                <small>Optional · kann nach der Lösung gezeigt werden</small>
              </div>
              <span class="evs-badge evs-badge-muted">Optional</span>
            </div>
            <div class="evs-field-block">
              <span class="evs-label">Video aus Media-System</span>
              <div class="evs-media-field evs-media-field-video" data-media-field data-module-key="stream_events" data-category-key="reveal_videos" data-allowed-types="video,animation" data-title="Optionales Auflösungs-Video auswählen oder hochladen" data-open-label="Optionales Video auswählen" data-clear-label="Entfernen" data-value-input="#${esc(videoInputId)}">
                <input id="${esc(videoInputId)}" type="hidden" data-media-field-value data-evs-snippet-video value="${esc(videoValue)}">
              </div>
              <small class="evs-help">Kann leer bleiben. Upload und Auswahl laufen über das vorhandene Media-System.</small>
            </div>
          </section>
        </div>
      </details>
    `;
  }

  function soundPlaybackModeLabel(mode){
    const map = { manual: 'Manuell', random_auto: 'Zufällig automatisch', sequence_auto: 'Automatisch in Reihenfolge' };
    return map[String(mode || '')] || 'Zufällig automatisch';
  }

  function soundOrderModeLabel(mode){
    return String(mode || 'random') === 'list' ? 'Listenreihenfolge' : 'Zufällig';
  }

  function soundSolvedPolicyLabel(policy){
    const map = { remove_from_rotation: 'Erkannte entfernen', keep_available: 'Weiter verfügbar', manual: 'Manuell entscheiden' };
    return map[String(policy || '')] || 'Erkannte entfernen';
  }

  function soundUnresolvedPolicyLabel(policy){
    const map = { requeue_later: 'Später nochmal', remove: 'Entfernen', manual: 'Manuell entscheiden' };
    return map[String(policy || '')] || 'Später nochmal';
  }

  function soundRevealModeLabel(mode, enabled){
    if (enabled === false || String(mode || '') === 'disabled') return 'Video aus';
    if (String(mode || '') === 'manual') return 'Video manuell';
    return 'Video nach Lösung';
  }

  function soundOutputTargetLabel(value){
    const map = { default: 'Sound-System Standard', overlay: 'Overlay', device: 'Gerät', both: 'Beides' };
    return map[String(value || 'default')] || 'Sound-System Standard';
  }

  function soundTargetLabel(value){
    const map = { stream: 'Stream', discord: 'Discord', both: 'Beides' };
    return map[String(value || 'both')] || 'Beides';
  }

  function normalizeSoundSettings(sound = {}, defaults = {}){
    const playbackMode = sound.playbackMode || defaults.playbackMode || 'random_auto';
    const revealVideoEnabled = sound.revealVideoEnabled !== undefined ? sound.revealVideoEnabled !== false : defaults.revealVideoEnabled !== false;
    return {
      answerSeconds: Number(sound.answerSeconds || sound.defaultAnswerSeconds || defaults.defaultAnswerSeconds || 60),
      defaultPoints: Number(sound.defaultPoints || defaults.defaultPoints || 10),
      playbackMode,
      manualTriggerEnabled: true,
      autoStartFirstRound: sound.autoStartFirstRound !== undefined ? sound.autoStartFirstRound !== false : defaults.autoStartFirstRound !== false,
      autoAdvanceRounds: sound.autoAdvanceRounds !== undefined ? sound.autoAdvanceRounds !== false : defaults.autoAdvanceRounds !== false,
      intervalMinutes: Number(sound.intervalMinutes || defaults.intervalMinutes || 5),
      intervalJitterMinutes: Number(sound.intervalJitterMinutes ?? defaults.intervalJitterMinutes ?? 2),
      orderMode: sound.orderMode || defaults.orderMode || (playbackMode === 'sequence_auto' ? 'list' : 'random'),
      roundDelaySeconds: Number(sound.roundDelaySeconds ?? defaults.roundDelaySeconds ?? 5),
      solvedPolicy: sound.solvedPolicy || defaults.solvedPolicy || 'remove_from_rotation',
      unresolvedPolicy: sound.unresolvedPolicy || defaults.unresolvedPolicy || 'requeue_later',
      avoidImmediateRepeat: sound.avoidImmediateRepeat !== undefined ? sound.avoidImmediateRepeat !== false : defaults.avoidImmediateRepeat !== false,
      minRepeatDistance: Number(sound.minRepeatDistance ?? defaults.minRepeatDistance ?? 3),
      revealVideoEnabled,
      revealVideoMode: revealVideoEnabled ? (sound.revealVideoMode || defaults.revealVideoMode || 'after_solved') : 'disabled',
      preRollEnabled: sound.preRollEnabled !== undefined ? sound.preRollEnabled === true : defaults.preRollEnabled === true,
      preRollSeconds: Number(sound.preRollSeconds ?? defaults.preRollSeconds ?? 3),
      countdownPreRollEnabled: sound.countdownPreRollEnabled !== undefined ? sound.countdownPreRollEnabled === true : defaults.countdownPreRollEnabled === true,
      countdownPreRollSeconds: Number(sound.countdownPreRollSeconds ?? defaults.countdownPreRollSeconds ?? 3),
      outputTarget: sound.outputTarget || sound.soundOutputTarget || defaults.outputTarget || 'default',
      target: sound.target || sound.soundTarget || defaults.target || 'both'
    };
  }

  function soundSettingsSummary(sound){
    const cfg = state.config?.config || {};
    const settings = normalizeSoundSettings(sound || {}, cfg.soundDefaults || {});
    return {
      ...settings,
      badges: [
        soundPlaybackModeLabel(settings.playbackMode),
        `${settings.intervalMinutes} Min. ± ${settings.intervalJitterMinutes}`,
        `${settings.answerSeconds} Sek. Antwortzeit`,
        soundOrderModeLabel(settings.orderMode),
        `Wiederholabstand ${settings.minRepeatDistance}`,
        soundRevealModeLabel(settings.revealVideoMode, settings.revealVideoEnabled),
        soundOutputTargetLabel(settings.outputTarget),
        settings.preRollEnabled ? `PreRoll ${settings.preRollSeconds}s` : 'PreRoll aus',
        settings.countdownPreRollEnabled ? `Countdown ${settings.countdownPreRollSeconds}s` : 'Countdown aus'
      ]
    };
  }

  function soundSummary(sound){
    const snippets = Array.isArray(sound?.snippets) ? sound.snippets : [];
    const filled = snippets.filter(item => item && (item.title || item.name || item.mediaId || item.mediaPath || item.file || (Array.isArray(item.acceptedAnswers) && item.acceptedAnswers.length) || item.revealVideoMediaId || item.videoMediaId));
    const audioSet = snippets.filter(item => item && (item.mediaId || item.mediaPath || item.file || item.snippetMediaId)).length;
    const answers = snippets.reduce((sum, item) => sum + (Array.isArray(item?.acceptedAnswers) ? item.acceptedAnswers.length : 0), 0);
    return { total: snippets.length, filled: filled.length, audioSet, answers };
  }

  function textSummary(text){
    const phrases = Array.isArray(text?.phrases) ? text.phrases : [];
    const filled = phrases.filter(item => item && (item.phrase || item.text || item.solution || (Array.isArray(item.acceptedAnswers) && item.acceptedAnswers.length)));
    const answers = phrases.reduce((sum, item) => sum + (Array.isArray(item?.acceptedAnswers) ? item.acceptedAnswers.length : 0), 0);
    const wordPoints = text?.wordPointsEnabled === true;
    const partial = String(text?.partialHintVisibility || text?.partialHintDisplayMode || '').toLowerCase();
    return { total: phrases.length, filled: filled.length, answers, wordPoints, partial: partial && partial !== 'off' };
  }

  function ensureModalEventDefaults(event){
    const cfg = state.config?.config || {};
    const soundDefaults = cfg.soundDefaults || {};
    const textDefaults = cfg.textDefaults || {};
    const base = event || {};
    const sound = base.soundConfig || {};
    const text = base.textConfig || {};
    return {
      ...base,
      soundEnabled: base.soundEnabled === true,
      textEnabled: base.textEnabled === true,
      soundConfig: {
        ...normalizeSoundSettings(sound, soundDefaults),
        snippets: Array.isArray(sound.snippets) ? sound.snippets : []
      },
      textConfig: {
        allowFollowupSolves: false,
        winnerMode: text.winnerMode || 'first_complete_solver',
        solvedPolicy: text.solvedPolicy || 'remove_from_rotation',
        partialHintsEnabled: text.partialHintsEnabled !== false,
        partialHintVisibility: text.partialHintVisibility || text.partialHintDisplayMode || textDefaults.partialHintVisibility || 'general',
        partialHintDisplayMode: text.partialHintDisplayMode || text.partialHintVisibility || textDefaults.partialHintVisibility || 'general',
        hintTokensEnabled: text.hintTokensEnabled !== false,
        partialHintMode: text.partialHintMode || 'new_words_per_user',
        uniqueWordsPerUser: text.uniqueWordsPerUser !== false,
        showPartialCount: text.showPartialCount === true || text.partialHintShowCount === true || textDefaults.showPartialWordCount !== false,
        wordPointsEnabled: text.wordPointsEnabled === true,
        pointsPerNewWord: text.pointsPerNewWord ?? text.wordPointsPerNewWord ?? textDefaults.pointsPerNewWord ?? 1,
        maxWordPointsPerUserPhrase: text.maxWordPointsPerUserPhrase ?? text.maxWordPointsPerUserAndPhrase ?? textDefaults.maxWordPointsPerUserPhrase ?? 5,
        partialHintCooldownSeconds: text.partialHintCooldownSeconds ?? text.hintCooldownSeconds ?? textDefaults.partialHintCooldownSeconds ?? 0,
        phrases: Array.isArray(text.phrases) ? text.phrases : [{ phrase: '', acceptedAnswers: [], pointsFirst: textDefaults.defaultPhrasePoints || 40, solvedPolicy: 'remove_from_rotation' }]
      }
    };
  }

  function syncModalBasicsFromDom(){
    if (!state.modal?.event) return;
    const current = ensureModalEventDefaults(state.modal.event);
    const nameEl = document.getElementById('evsEventName');
    const descEl = document.getElementById('evsEventDescription');
    const soundEl = document.getElementById('evsSoundEnabled');
    const textEl = document.getElementById('evsTextEnabled');
    state.modal.event = {
      ...current,
      name: nameEl ? nameEl.value : current.name,
      description: descEl ? descEl.value : current.description,
      soundEnabled: soundEl ? soundEl.checked === true : current.soundEnabled === true,
      textEnabled: textEl ? textEl.checked === true : current.textEnabled === true
    };
  }

  function renderEditorSummaryCard(kind, enabled, title, text, badges, actionLabel){
    return `
      <section class="evs-editor-summary-card ${enabled ? 'is-enabled' : 'is-disabled'}" data-evs-editor-summary-card="${esc(kind)}">
        <div>
          <div class="evs-editor-summary-title"><strong>${esc(title)}</strong>${enabled ? '<span class="evs-badge evs-badge-good">Aktiv</span>' : '<span class="evs-badge evs-badge-muted">Inaktiv</span>'}</div>
          <p>${esc(text)}</p>
          <div class="evs-editor-summary-badges" data-evs-editor-summary-badges>${badges.map(item => `<span>${esc(item)}</span>`).join('')}</div>
        </div>
        <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="${kind === 'sound' ? 'openSoundEditor' : 'openTextEditor'}">${esc(actionLabel)}</button>
      </section>
    `;
  }

  function renderMainEventModal(event){
    const sound = event.soundConfig || {};
    const text = event.textConfig || {};
    const s = soundSummary(sound);
    const t = textSummary(text);
    return `
      <div class="evs-modal-backdrop" data-evs-modal-close="1">
        <div class="evs-modal glass evs-event-main-modal" role="dialog" aria-modal="true">
          <div class="evs-modal-head">
            <div><h3>${event.eventUid ? 'Event bearbeiten' : 'Neues Event'}</h3><p>Grunddaten bleiben hier. Sound-Schnipsel und Text-Spiel werden in eigenen Fenstern bearbeitet.</p></div>
            <button type="button" class="evs-icon-btn" data-evs-action="closeModal">×</button>
          </div>
          <div class="evs-form">
            <label>Eventname<input id="evsEventName" value="${esc(event.name || '')}" placeholder="z. B. Serien-Intro-Abend"></label>
            <label>Beschreibung<textarea id="evsEventDescription" rows="2" placeholder="Kurze Info für dich und Mods">${esc(event.description || '')}</textarea></label>

            <div class="evs-choice-row">
              <label class="evs-check"><input id="evsSoundEnabled" type="checkbox" ${event.soundEnabled ? 'checked' : ''}> Sound-Snippet-Spiel</label>
              <label class="evs-check"><input id="evsTextEnabled" type="checkbox" ${event.textEnabled ? 'checked' : ''}> Text-/Geheimsatz-Spiel</label>
            </div>

            <section class="evs-editor-settings-card">
              <div>
                <strong>Event-Einstellungen</strong>
                <p>Ablauf, Timing, Zufall, Wiederholschutz und Auflösung für dieses Event.</p>
                <div class="evs-editor-summary-badges">
                  ${soundSettingsSummary(event.soundConfig || {}).badges.slice(0, 4).map(item => `<span>${esc(item)}</span>`).join('')}
                </div>
              </div>
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="openSettingsEditor">Einstellungen bearbeiten</button>
            </section>

            <div class="evs-editor-summary-grid">
              ${renderEditorSummaryCard('sound', event.soundEnabled, 'Sound-Schnipsel', 'Audio-Aufgaben, Antworten und optionale Auflösungs-Videos getrennt verwalten.', [
                `${s.filled || s.total || 0} Schnipsel`,
                `${s.audioSet} Audio gesetzt`,
                `${s.answers} Antwort(en)`
              ], 'Sound-Schnipsel bearbeiten')}
              ${renderEditorSummaryCard('text', event.textEnabled, 'Text-Spiel', 'Geheimsätze, Antwortvarianten, Punkte und Teiltreffer-Regeln getrennt verwalten.', [
                `${t.filled || t.total || 0} Satz/Sätze`,
                `${t.answers} Antwortvariante(n)`,
                t.partial ? 'Teiltreffer aktiv' : 'Teiltreffer aus'
              ], 'Text-Spiel bearbeiten')}
            </div>

            <section class="evs-editor-settings-card evs-editor-ready-card">
              <div>
                <strong>Startprüfung</strong>
                <p>Ein Event kann gespeichert werden, startet aber erst, wenn alle aktivierten Spieltypen vollständig konfiguriert sind.</p>
              </div>
              ${renderDraftValidation(validateLocalEventDraft(event), 'Dieses Event')}
            </section>

            <div class="evs-modal-actions">
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="closeModal">Abbrechen</button>
              <button type="button" class="evs-btn" data-evs-action="saveEvent">Speichern</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderEventSettingsModal(event){
    const sound = soundSettingsSummary(event.soundConfig || {});
    return `
      <div class="evs-submodal-backdrop" data-evs-submodal-close="1">
        <div class="evs-modal glass evs-submodal evs-settings-editor-modal" role="dialog" aria-modal="true">
          <div class="evs-modal-head">
            <div><h3>Event-Einstellungen bearbeiten</h3><p>Diese Regeln gelten nur für dieses Event. Neue Events bekommen ihre Vorgaben aus Config/DB.</p></div>
            <button type="button" class="evs-icon-btn" data-evs-action="closeSubEditor">×</button>
          </div>
          <div class="evs-form" data-evs-event-settings-editor>
            <div class="evs-text-rule-note">Manuelle Auslösung bleibt immer möglich. Automatik und echtes Playback werden in den nächsten Runtime-Steps angebunden.</div>
            <section class="evs-settings-section">
              <div class="evs-config-card-head"><strong>1. Ablauf</strong><small>Grundregeln für Runde, Antwortzeit und Punkte</small></div>
              <div class="evs-two-cols evs-text-config-grid">
                <label>Abspielmodus<select id="evsSoundPlaybackMode">
                  <option value="manual" ${sound.playbackMode === 'manual' ? 'selected' : ''}>Manuell</option>
                  <option value="random_auto" ${sound.playbackMode === 'random_auto' ? 'selected' : ''}>Zufällig automatisch</option>
                  <option value="sequence_auto" ${sound.playbackMode === 'sequence_auto' ? 'selected' : ''}>Automatisch in Reihenfolge</option>
                </select></label>
                <label>Antwortzeit in Sekunden<input id="evsSoundAnswerSeconds" type="number" min="5" max="300" value="${esc(sound.answerSeconds)}"></label>
              </div>
              <div class="evs-two-cols evs-text-config-grid">
                <label>Punkte pro Soundlösung<input id="evsSoundDefaultPoints" type="number" min="0" max="10000" value="${esc(sound.defaultPoints)}"></label>
                <div class="evs-form-placeholder"></div>
              </div>
              <label class="evs-check"><input id="evsSoundAutoStart" type="checkbox" ${sound.autoStartFirstRound !== false ? 'checked' : ''}> Erste Runde automatisch beim Eventstart starten</label>
              <label class="evs-check"><input id="evsSoundAutoAdvance" type="checkbox" ${sound.autoAdvanceRounds !== false ? 'checked' : ''}> Nach einer Runde automatisch weitermachen</label>
            </section>
            <section class="evs-settings-section">
              <div class="evs-config-card-head"><strong>2. Automatik</strong><small>Intervall und Pause zwischen Runden</small></div>
              <div class="evs-two-cols evs-text-config-grid">
                <label>Alle X Minuten<input id="evsSoundIntervalMinutes" type="number" min="1" max="240" value="${esc(sound.intervalMinutes)}"></label>
                <label>Zufallsabweichung ± Minuten<input id="evsSoundIntervalJitter" type="number" min="0" max="120" value="${esc(sound.intervalJitterMinutes)}"></label>
              </div>
              <div class="evs-two-cols evs-text-config-grid">
                <label>Pause nach Runde in Sekunden<input id="evsSoundRoundDelay" type="number" min="0" max="3600" value="${esc(sound.roundDelaySeconds)}"></label>
                <div class="evs-form-placeholder"></div>
              </div>
            </section>
            <section class="evs-settings-section">
              <div class="evs-config-card-head"><strong>3. Ausgabe</strong><small>Wohin Sound und Vorbereitung gehen sollen</small></div>
              <div class="evs-two-cols evs-text-config-grid">
                <label>Ausgabeziel<select id="evsSoundOutputTarget">
                  <option value="default" ${sound.outputTarget === 'default' ? 'selected' : ''}>Sound-System Standard</option>
                  <option value="overlay" ${sound.outputTarget === 'overlay' ? 'selected' : ''}>Overlay</option>
                  <option value="device" ${sound.outputTarget === 'device' ? 'selected' : ''}>Gerät</option>
                  <option value="both" ${sound.outputTarget === 'both' ? 'selected' : ''}>Beides</option>
                </select></label>
                <label>Ziel<select id="evsSoundTarget">
                  <option value="stream" ${sound.target === 'stream' ? 'selected' : ''}>Stream</option>
                  <option value="discord" ${sound.target === 'discord' ? 'selected' : ''}>Discord</option>
                  <option value="both" ${sound.target === 'both' ? 'selected' : ''}>Beides</option>
                </select></label>
              </div>
              <div class="evs-two-cols evs-text-config-grid">
                <label>PreRoll Sekunden<input id="evsSoundPreRollSeconds" type="number" min="0" max="30" value="${esc(sound.preRollSeconds)}"></label>
                <label>Countdown Sekunden<input id="evsSoundCountdownPreRollSeconds" type="number" min="0" max="30" value="${esc(sound.countdownPreRollSeconds)}"></label>
              </div>
              <label class="evs-check"><input id="evsSoundPreRollEnabled" type="checkbox" ${sound.preRollEnabled === true ? 'checked' : ''}> PreRoll vor Sound erlauben</label>
              <label class="evs-check"><input id="evsSoundCountdownPreRollEnabled" type="checkbox" ${sound.countdownPreRollEnabled === true ? 'checked' : ''}> Countdown vor Sound anzeigen</label>
            </section>
            <section class="evs-settings-section">
              <div class="evs-config-card-head"><strong>4. Rotation</strong><small>Reihenfolge, Wiederholschutz und Verhalten nach Runden</small></div>
              <div class="evs-two-cols evs-text-config-grid">
                <label>Reihenfolge<select id="evsSoundOrderMode">
                  <option value="random" ${sound.orderMode === 'random' ? 'selected' : ''}>Zufällig</option>
                  <option value="list" ${sound.orderMode === 'list' ? 'selected' : ''}>Listenreihenfolge</option>
                </select></label>
                <label>Mindestabstand gleicher Schnipsel<input id="evsSoundRepeatDistance" type="number" min="0" max="100" value="${esc(sound.minRepeatDistance)}"></label>
              </div>
              <div class="evs-two-cols evs-text-config-grid">
                <label>Wenn erkannt<select id="evsSoundSolvedPolicy">
                  <option value="remove_from_rotation" ${sound.solvedPolicy === 'remove_from_rotation' ? 'selected' : ''}>Aus aktueller Rotation entfernen</option>
                  <option value="keep_available" ${sound.solvedPolicy === 'keep_available' ? 'selected' : ''}>Später erneut möglich</option>
                  <option value="manual" ${sound.solvedPolicy === 'manual' ? 'selected' : ''}>Manuell entscheiden</option>
                </select></label>
                <label>Wenn nicht erkannt<select id="evsSoundUnresolvedPolicy">
                  <option value="requeue_later" ${sound.unresolvedPolicy === 'requeue_later' ? 'selected' : ''}>Später nochmal versuchen</option>
                  <option value="remove" ${sound.unresolvedPolicy === 'remove' ? 'selected' : ''}>Für dieses Event entfernen</option>
                  <option value="manual" ${sound.unresolvedPolicy === 'manual' ? 'selected' : ''}>Manuell entscheiden</option>
                </select></label>
              </div>
              <label class="evs-check"><input id="evsSoundAvoidRepeat" type="checkbox" ${sound.avoidImmediateRepeat !== false ? 'checked' : ''}> Direkte Wiederholung vermeiden</label>
            </section>
            <section class="evs-settings-section">
              <div class="evs-config-card-head"><strong>5. Auflösung</strong><small>Optionales Video nach richtiger Antwort</small></div>
              <label class="evs-check"><input id="evsSoundRevealVideo" type="checkbox" ${sound.revealVideoEnabled !== false ? 'checked' : ''}> Auflösungs-Video abspielen, wenn vorhanden</label>
              <label>Video-Modus<select id="evsSoundRevealVideoMode">
                <option value="after_solved" ${sound.revealVideoMode === 'after_solved' ? 'selected' : ''}>Nach richtiger Antwort automatisch</option>
                <option value="manual" ${sound.revealVideoMode === 'manual' ? 'selected' : ''}>Nur manuell zeigen</option>
                <option value="disabled" ${sound.revealVideoMode === 'disabled' ? 'selected' : ''}>Nie automatisch zeigen</option>
              </select></label>
            </section>
            <div class="evs-modal-actions">
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="closeSubEditor">Zurück</button>
              <button type="button" class="evs-btn" data-evs-action="applySettingsEditor">Übernehmen</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderSoundEditorModal(event){
    const sound = event.soundConfig || {};
    const snippets = Array.isArray(sound.snippets) && sound.snippets.length ? sound.snippets : [{}];
    return `
      <div class="evs-submodal-backdrop" data-evs-submodal-close="1">
        <div class="evs-modal glass evs-submodal evs-sound-editor-modal" role="dialog" aria-modal="true">
          <div class="evs-modal-head">
            <div><h3>Sound-Schnipsel bearbeiten</h3><p>Mehrere Aufgaben pro Event. Jeder Schnipsel bekommt eigene Antworten, Audio und optional ein Auflösungs-Video.</p></div>
            <button type="button" class="evs-icon-btn" data-evs-action="closeSubEditor">×</button>
          </div>
          <div class="evs-form" data-evs-sound-editor>
            <div class="evs-text-rule-note">
              Ablauf, Antwortzeit, Zufall und Wiederholschutz bearbeitest du im Fenster „Einstellungen bearbeiten“. Hier geht es nur um die einzelnen Sound-Schnipsel.
            </div>
            <div class="evs-form-row-head evs-sound-snippet-list-head">
              <div>
                <strong>Sound-Schnipsel</strong>
                <small>Audio + Antwortvarianten + optionales Video. Bestehende Auswahl bleibt beim Hinzufügen sichtbar.</small>
              </div>
              <button type="button" class="evs-btn evs-btn-secondary evs-btn-small" data-evs-action="addSoundSnippet">+ Schnipsel hinzufügen</button>
            </div>
            <div class="evs-sound-snippet-list" data-evs-sound-snippet-list>
              ${snippets.map((item, index) => renderSoundSnippetEditor(item, index, snippets.length)).join('')}
            </div>
            <small class="evs-help">Das Event speichert nur Media-IDs/Referenzen. Wiedergabe und Upload bleiben beim vorhandenen Media-System.</small>
            <div class="evs-modal-actions">
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="closeSubEditor">Zurück</button>
              <button type="button" class="evs-btn" data-evs-action="applySoundEditor">Übernehmen</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderTextEditorModal(event){
    const text = event.textConfig || {};
    const phrases = Array.isArray(text.phrases) && text.phrases.length ? text.phrases : [{}];
    const partialMode = text.partialHintVisibility || text.partialHintDisplayMode || (text.hintTokensEnabled === false || text.partialHintsEnabled === false ? 'off' : (text.partialHintWithSentence === true ? 'with_sentence' : 'general'));
    const showPartialCount = text.showPartialCount === true || text.partialHintShowCount === true;
    const wordPointsEnabled = text.wordPointsEnabled === true;
    return `
      <div class="evs-submodal-backdrop" data-evs-submodal-close="1">
        <div class="evs-modal glass evs-submodal evs-text-editor-modal" role="dialog" aria-modal="true">
          <div class="evs-modal-head">
            <div><h3>Text-Spiel bearbeiten</h3><p>Geheimsätze, Antwortvarianten, Punkte und Teiltreffer-Regeln für dieses Event.</p></div>
            <button type="button" class="evs-icon-btn" data-evs-action="closeSubEditor">×</button>
          </div>
          <div class="evs-form" data-evs-text-editor>
            <div class="evs-text-rule-note">
              <strong>Regel:</strong> Ein Text-Spiel kann mehrere geheime Sätze enthalten. Pro Satz gewinnt der erste komplette Löser. Danach ist nur dieser Satz erledigt und kommt aus der Rotation.
            </div>
            <div class="evs-form-row-head">
              <div>
                <strong>Geheime Sätze</strong>
                <small>Pflicht · jeder Satz ist einzeln lösbar und kann eigene Antwortvarianten/Punkte haben</small>
              </div>
              <button type="button" class="evs-btn evs-btn-secondary evs-btn-small" data-evs-action="addPhrase">+ Satz hinzufügen</button>
            </div>
            <div class="evs-phrase-list">
              ${phrases.map((item, index) => renderPhraseEditor(item, index, phrases.length)).join('')}
            </div>
            <div class="evs-partial-hints-box">
              <div class="evs-form-row-head">
                <div>
                  <strong>Teiltreffer & Wortpunkte</strong>
                  <small>Optional · User können Hinweise oder Punkte bekommen, wenn sie neue Wörter aus einem Satz treffen</small>
                </div>
                <span class="evs-badge evs-badge-muted">Optional</span>
              </div>
              <div class="evs-two-cols evs-text-config-grid">
                <label>Teiltreffer melden<select id="evsTextPartialHintVisibility"><option value="off" ${partialMode === 'off' ? 'selected' : ''}>Nicht melden</option><option value="general" ${partialMode === 'general' ? 'selected' : ''}>Allgemein melden</option><option value="with_sentence" ${partialMode === 'with_sentence' ? 'selected' : ''}>Mit Satznummer melden</option></select></label>
                <label>Zusätzlicher Cooldown in Sekunden<input id="evsTextPartialHintCooldown" type="number" min="0" value="${esc(text.partialHintCooldownSeconds ?? text.hintCooldownSeconds ?? 0)}"></label>
              </div>
              <div class="evs-choice-row evs-choice-row-compact">
                <label class="evs-check evs-check-compact"><input id="evsTextShowPartialCount" type="checkbox" ${showPartialCount ? 'checked' : ''}> Anzahl gefundener Wörter anzeigen</label>
                <label class="evs-check evs-check-compact"><input id="evsTextWordPointsEnabled" type="checkbox" ${wordPointsEnabled ? 'checked' : ''}> Punkte für gefundene Wörter</label>
              </div>
              <div class="evs-two-cols evs-text-config-grid">
                <label>Punkte pro neues Wort<input id="evsTextPointsPerWord" type="number" min="0" value="${esc(text.pointsPerNewWord ?? text.wordPointsPerNewWord ?? 1)}"></label>
                <label>Max. Wortpunkte pro User/Satz<input id="evsTextMaxWordPoints" type="number" min="0" value="${esc(text.maxWordPointsPerUserPhrase ?? text.maxWordPointsPerUserAndPhrase ?? 5)}"></label>
              </div>
              <small class="evs-help">Ein Wort zählt pro Event, Satz und User nur einmal. Wortpunkte sind optional und werden später in der Chat-Runtime umgesetzt.</small>
            </div>
            <div class="evs-modal-actions">
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="closeSubEditor">Zurück</button>
              <button type="button" class="evs-btn" data-evs-action="applyTextEditor">Übernehmen</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }


  function renderNameDialog(){
    const dialog = state.nameDialog || {};
    const isDuplicate = dialog.mode === 'duplicate';
    const title = isDuplicate ? 'Event kopieren' : 'Event umbenennen';
    const help = isDuplicate
      ? 'Name für die neue Kopie festlegen. Punkte, Runden und Verlauf werden nicht übernommen.'
      : 'Nur der Eventname wird geändert. Konfiguration, Punkte und Verlauf bleiben unverändert.';
    const primary = isDuplicate ? 'Kopie erstellen' : 'Namen speichern';
    return `
      <div class="evs-modal-backdrop evs-name-dialog-backdrop" data-evs-name-dialog-close="1">
        <div class="evs-modal glass evs-name-dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}">
          <div class="evs-modal-head">
            <div><h3>${esc(title)}</h3><p>${esc(help)}</p></div>
            <button type="button" class="evs-icon-btn" data-evs-action="closeNameDialog">×</button>
          </div>
          <div class="evs-form evs-name-dialog-form">
            <label>Eventname<input id="evsNameDialogInput" data-evs-name-dialog-input value="${esc(dialog.name || '')}" placeholder="Eventname eingeben"></label>
            ${dialog.error ? `<div class="evs-alert evs-alert-error">${esc(dialog.error)}</div>` : ''}
            <div class="evs-modal-actions">
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="closeNameDialog">Abbrechen</button>
              <button type="button" class="evs-btn" data-evs-action="confirmNameDialog">${esc(primary)}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderModal(){
    const event = ensureModalEventDefaults(modalEvent());
    state.modal.event = event;
    return `
      ${renderMainEventModal(event)}
      ${state.modal?.editor === 'settings' ? renderEventSettingsModal(event) : ''}
      ${state.modal?.editor === 'sound' ? renderSoundEditorModal(event) : ''}
      ${state.modal?.editor === 'text' ? renderTextEditorModal(event) : ''}
    `;
  }

  function readSoundConfigFromDom(fallback = {}){
    return {
      ...(fallback || {}),
      snippets: collectSoundSnippets(true, fallback.snippets || [])
    };
  }

  function readEventSettingsFromDom(fallback = {}){
    const cfg = state.config?.config || {};
    const current = normalizeSoundSettings(fallback || {}, cfg.soundDefaults || {});
    const revealEnabled = document.getElementById('evsSoundRevealVideo')?.checked !== false;
    return {
      ...(fallback || {}),
      answerSeconds: Number(document.getElementById('evsSoundAnswerSeconds')?.value || current.answerSeconds || 60),
      defaultPoints: Number(document.getElementById('evsSoundDefaultPoints')?.value || current.defaultPoints || 10),
      playbackMode: document.getElementById('evsSoundPlaybackMode')?.value || current.playbackMode || 'random_auto',
      manualTriggerEnabled: true,
      autoStartFirstRound: document.getElementById('evsSoundAutoStart')?.checked !== false,
      autoAdvanceRounds: document.getElementById('evsSoundAutoAdvance')?.checked !== false,
      intervalMinutes: Number(document.getElementById('evsSoundIntervalMinutes')?.value || current.intervalMinutes || 5),
      intervalJitterMinutes: Number(document.getElementById('evsSoundIntervalJitter')?.value ?? current.intervalJitterMinutes ?? 2),
      orderMode: document.getElementById('evsSoundOrderMode')?.value || current.orderMode || 'random',
      roundDelaySeconds: Number(document.getElementById('evsSoundRoundDelay')?.value ?? current.roundDelaySeconds ?? 5),
      solvedPolicy: document.getElementById('evsSoundSolvedPolicy')?.value || current.solvedPolicy || 'remove_from_rotation',
      unresolvedPolicy: document.getElementById('evsSoundUnresolvedPolicy')?.value || current.unresolvedPolicy || 'requeue_later',
      avoidImmediateRepeat: document.getElementById('evsSoundAvoidRepeat')?.checked !== false,
      minRepeatDistance: Number(document.getElementById('evsSoundRepeatDistance')?.value ?? current.minRepeatDistance ?? 3),
      revealVideoEnabled: revealEnabled,
      revealVideoMode: revealEnabled ? (document.getElementById('evsSoundRevealVideoMode')?.value || current.revealVideoMode || 'after_solved') : 'disabled',
      preRollEnabled: document.getElementById('evsSoundPreRollEnabled')?.checked === true,
      preRollSeconds: Number(document.getElementById('evsSoundPreRollSeconds')?.value ?? current.preRollSeconds ?? 3),
      countdownPreRollEnabled: document.getElementById('evsSoundCountdownPreRollEnabled')?.checked === true,
      countdownPreRollSeconds: Number(document.getElementById('evsSoundCountdownPreRollSeconds')?.value ?? current.countdownPreRollSeconds ?? 3),
      outputTarget: document.getElementById('evsSoundOutputTarget')?.value || current.outputTarget || 'default',
      target: document.getElementById('evsSoundTarget')?.value || current.target || 'both',
      snippets: Array.isArray(fallback.snippets) ? fallback.snippets : []
    };
  }

  function readTextConfigFromDom(fallback = {}){
    const basePhrases = Array.isArray(fallback.phrases) ? fallback.phrases : [];
    const phraseRows = Array.from(document.querySelectorAll('[data-evs-phrase-row]'));
    const phrases = phraseRows.length ? phraseRows.map(row => {
      const phraseText = row.querySelector('[data-evs-phrase-text]')?.value || '';
      const phraseAnswers = splitCsv(row.querySelector('[data-evs-phrase-answers]')?.value || '');
      const pointsFirst = Number(row.querySelector('[data-evs-phrase-points]')?.value || 40);
      return { phrase: phraseText, acceptedAnswers: phraseAnswers, pointsFirst, solvedPolicy: 'remove_from_rotation' };
    }).filter(item => item.phrase || item.acceptedAnswers.length) : basePhrases;

    const partialHintVisibility = document.getElementById('evsTextPartialHintVisibility')?.value || fallback.partialHintVisibility || fallback.partialHintDisplayMode || 'off';
    const partialHintsEnabled = partialHintVisibility !== 'off';
    return {
      ...(fallback || {}),
      allowFollowupSolves: false,
      winnerMode: 'first_complete_solver',
      solvedPolicy: 'remove_from_rotation',
      partialHintVisibility,
      partialHintDisplayMode: partialHintVisibility,
      hintTokensEnabled: partialHintsEnabled,
      partialHintsEnabled,
      partialHintMode: 'new_words_per_user',
      uniqueWordsPerUser: true,
      showPartialCount: document.getElementById('evsTextShowPartialCount')?.checked ?? fallback.showPartialCount === true,
      wordPointsEnabled: document.getElementById('evsTextWordPointsEnabled')?.checked ?? fallback.wordPointsEnabled === true,
      pointsPerNewWord: Number(document.getElementById('evsTextPointsPerWord')?.value || fallback.pointsPerNewWord || 0),
      maxWordPointsPerUserPhrase: Number(document.getElementById('evsTextMaxWordPoints')?.value || fallback.maxWordPointsPerUserPhrase || 0),
      partialHintCooldownSeconds: Number(document.getElementById('evsTextPartialHintCooldown')?.value || fallback.partialHintCooldownSeconds || 0),
      phrases
    };
  }

  function syncVisibleEditorToState(){
    if (!state.modal?.event) return;
    syncModalBasicsFromDom();
    const event = ensureModalEventDefaults(state.modal.event);
    if (document.querySelector('[data-evs-event-settings-editor]')) {
      event.soundConfig = readEventSettingsFromDom(event.soundConfig || {});
    }
    if (document.querySelector('[data-evs-sound-editor]')) {
      event.soundConfig = readSoundConfigFromDom(event.soundConfig || {});
    }
    if (document.querySelector('[data-evs-text-editor]')) {
      event.textConfig = readTextConfigFromDom(event.textConfig || {});
    }
    state.modal.event = event;
  }

  function readModalPayload(){
    syncVisibleEditorToState();
    const event = ensureModalEventDefaults(state.modal?.event || {});
    return {
      name: event.name || '',
      description: event.description || '',
      soundEnabled: event.soundEnabled === true,
      textEnabled: event.textEnabled === true,
      soundConfig: event.soundConfig || {},
      textConfig: event.textConfig || {}
    };
  }

  function splitCsv(value){ return String(value || '').split(',').map(v => v.trim()).filter(Boolean); }

  function collectSoundSnippets(keepEmpty = false, fallbackSnippets = []){
    const rows = Array.from(document.querySelectorAll('[data-evs-sound-snippet-row]'));
    if (!rows.length) {
      const fallback = Array.isArray(fallbackSnippets) ? fallbackSnippets : [];
      return keepEmpty ? fallback : fallback.filter(item => item?.title || item?.mediaId || item?.mediaPath || item?.file || (Array.isArray(item?.acceptedAnswers) && item.acceptedAnswers.length) || item?.revealVideoMediaId);
    }
    return rows.map(row => {
      const title = row.querySelector('[data-evs-snippet-title]')?.value || '';
      const mediaId = row.querySelector('[data-evs-snippet-media]')?.value || '';
      const acceptedAnswers = splitCsv(row.querySelector('[data-evs-snippet-answers]')?.value || '');
      const revealVideoMediaId = row.querySelector('[data-evs-snippet-video]')?.value || '';
      return { title, mediaId, acceptedAnswers, revealVideoMediaId };
    }).filter(item => keepEmpty || item.title || item.mediaId || item.acceptedAnswers.length || item.revealVideoMediaId);
  }

  function soundSnippetFromRow(row){
    if (!row) return {};
    const title = row.querySelector('[data-evs-snippet-title]')?.value || '';
    const mediaId = row.querySelector('[data-evs-snippet-media]')?.value || '';
    const acceptedAnswers = splitCsv(row.querySelector('[data-evs-snippet-answers]')?.value || '');
    const revealVideoMediaId = row.querySelector('[data-evs-snippet-video]')?.value || '';
    return { title, mediaId, acceptedAnswers, revealVideoMediaId };
  }

  function refreshSoundSnippetRowSummary(row){
    if (!row) return;
    const index = Number(row.dataset.index || 0) || 0;
    const summary = soundSnippetSummaryData(soundSnippetFromRow(row), index);
    const labelEl = row.querySelector('[data-evs-snippet-summary-label]');
    const metaEl = row.querySelector('[data-evs-snippet-summary-meta]');
    const missingEl = row.querySelector('[data-evs-snippet-missing]');
    if (labelEl) labelEl.textContent = summary.label;
    if (metaEl) metaEl.textContent = summary.meta;
    if (missingEl) {
      missingEl.textContent = summary.missing.length ? `Fehlt: ${summary.missing.join(', ')}` : '';
      missingEl.classList.toggle('is-empty', summary.missing.length === 0);
    }
    row.classList.toggle('has-missing-required', summary.missing.length > 0);
  }

  function refreshSoundSnippetSummaries(){
    document.querySelectorAll('[data-evs-sound-snippet-row]').forEach(row => refreshSoundSnippetRowSummary(row));
  }

  function refreshMainEditorSummaryFromState(){
    if (!state.modal?.event) return;
    const mainModal = document.querySelector('.evs-event-main-modal');
    if (!mainModal || state.modal.editor) return;
    const event = ensureModalEventDefaults(state.modal.event);
    const soundSummaryCard = mainModal.querySelector('[data-evs-editor-summary-card="sound"]');
    const textSummaryCard = mainModal.querySelector('[data-evs-editor-summary-card="text"]');
    if (soundSummaryCard) {
      const s = soundSummary(event.soundConfig || {});
      const badges = [`${s.filled || 0}/${s.total || 0} Schnipsel`, `${s.audioSet || 0} Audio gesetzt`, `${s.answers || 0} Antwort(en)`];
      const badgeBox = soundSummaryCard.querySelector('[data-evs-editor-summary-badges]');
      if (badgeBox) badgeBox.innerHTML = badges.map(item => `<span>${esc(item)}</span>`).join('');
      soundSummaryCard.classList.toggle('is-enabled', event.soundEnabled === true);
      soundSummaryCard.classList.toggle('is-disabled', event.soundEnabled !== true);
    }
    if (textSummaryCard) {
      const t = textSummary(event.textConfig || {});
      const badges = [`${t.filled || 0}/${t.total || 0} Sätze`, `${t.answers || 0} Antwort(en)`, t.partial ? 'Hinweise an' : 'Hinweise aus'];
      const badgeBox = textSummaryCard.querySelector('[data-evs-editor-summary-badges]');
      if (badgeBox) badgeBox.innerHTML = badges.map(item => `<span>${esc(item)}</span>`).join('');
      textSummaryCard.classList.toggle('is-enabled', event.textEnabled === true);
      textSummaryCard.classList.toggle('is-disabled', event.textEnabled !== true);
    }
  }

  function reindexSoundSnippetRows(){
    const rows = Array.from(document.querySelectorAll('[data-evs-sound-snippet-row]'));
    rows.forEach((row, index) => {
      row.dataset.index = String(index);
      row.querySelectorAll('[data-index]').forEach(el => { el.dataset.index = String(index); });
      const audioInput = row.querySelector('[data-evs-snippet-media]');
      const videoInput = row.querySelector('[data-evs-snippet-video]');
      const audioField = row.querySelector('.evs-media-field-audio[data-media-field]');
      const videoField = row.querySelector('.evs-media-field-video[data-media-field]');
      if (audioInput) {
        audioInput.id = `evsSnippetMedia_${index}`;
        if (audioField) audioField.dataset.valueInput = `#${audioInput.id}`;
      }
      if (videoInput) {
        videoInput.id = `evsSnippetVideo_${index}`;
        if (videoField) videoField.dataset.valueInput = `#${videoInput.id}`;
      }
      const title = row.querySelector('.evs-sound-card-required .evs-sound-card-head strong');
      if (title) title.textContent = `Audio-Schnipsel ${index + 1}`;
      refreshSoundSnippetRowSummary(row);
    });
    const removeButtons = Array.from(document.querySelectorAll('[data-evs-action="removeSoundSnippet"]'));
    removeButtons.forEach(btn => { btn.disabled = rows.length <= 1; });
  }

  function appendSoundSnippetDom(){
    const list = document.querySelector('[data-evs-sound-snippet-list]');
    if (!list) return false;
    const index = list.querySelectorAll('[data-evs-sound-snippet-row]').length;
    list.insertAdjacentHTML('beforeend', renderSoundSnippetEditor({ title: '', mediaId: '', acceptedAnswers: [], revealVideoMediaId: '' }, index, index + 1));
    const newRow = list.querySelector(`[data-evs-sound-snippet-row][data-index="${index}"]`);
    attachMediaFields(newRow || list);
    reindexSoundSnippetRows();
    return true;
  }

  function readConfigPayload(){
    return {
      config: {
        eventDefaults: {
          defaultTopWinners: Number(document.getElementById('evsCfgTopWinners')?.value || 3),
          allowOnlyOneActiveEvent: document.getElementById('evsCfgOneActive')?.checked !== false,
          overviewShowsOnlyRunningEvents: document.getElementById('evsCfgOverviewRunning')?.checked !== false
        },
        soundDefaults: {
          defaultAnswerSeconds: Number(document.getElementById('evsCfgSoundAnswerSeconds')?.value || 60),
          defaultPoints: Number(document.getElementById('evsCfgSoundPoints')?.value || 10),
          playbackMode: document.getElementById('evsCfgSoundPlaybackMode')?.value || 'random_auto',
          autoStartFirstRound: document.getElementById('evsCfgSoundAutoStart')?.checked !== false,
          autoAdvanceRounds: document.getElementById('evsCfgSoundAutoAdvance')?.checked !== false,
          intervalMinutes: Number(document.getElementById('evsCfgSoundIntervalMinutes')?.value || 5),
          intervalJitterMinutes: Number(document.getElementById('evsCfgSoundIntervalJitter')?.value || 0),
          orderMode: document.getElementById('evsCfgSoundOrderMode')?.value || 'random',
          roundDelaySeconds: Number(document.getElementById('evsCfgSoundRoundDelay')?.value || 5),
          solvedPolicy: document.getElementById('evsCfgSoundSolvedPolicy')?.value || 'remove_from_rotation',
          unresolvedPolicy: document.getElementById('evsCfgSoundUnresolved')?.value || 'requeue_later',
          avoidImmediateRepeat: document.getElementById('evsCfgSoundAvoidRepeat')?.checked !== false,
          minRepeatDistance: Number(document.getElementById('evsCfgSoundRepeatDistance')?.value || 3),
          revealVideoEnabled: document.getElementById('evsCfgRevealVideo')?.checked !== false,
          revealVideoMode: document.getElementById('evsCfgRevealVideo')?.checked !== false ? (document.getElementById('evsCfgRevealVideoMode')?.value || 'after_solved') : 'disabled',
          preRollEnabled: document.getElementById('evsCfgSoundPreRollEnabled')?.checked === true,
          preRollSeconds: Number(document.getElementById('evsCfgSoundPreRollSeconds')?.value || 3),
          countdownPreRollEnabled: document.getElementById('evsCfgSoundCountdownPreRollEnabled')?.checked === true,
          countdownPreRollSeconds: Number(document.getElementById('evsCfgSoundCountdownPreRollSeconds')?.value || 3),
          outputTarget: document.getElementById('evsCfgSoundOutputTarget')?.value || 'default',
          target: document.getElementById('evsCfgSoundTarget')?.value || 'both',
          manualTriggerEnabled: true
        },
        textDefaults: {
          defaultPhrasePoints: Number(document.getElementById('evsCfgTextPhrasePoints')?.value || 40),
          partialHintsEnabled: document.getElementById('evsCfgPartialHints')?.checked !== false,
          partialHintVisibility: document.getElementById('evsCfgPartialVisibility')?.value || 'general',
          showPartialWordCount: document.getElementById('evsCfgShowWordCount')?.checked !== false,
          uniqueWordPerUserPhrase: document.getElementById('evsCfgUniqueWords')?.checked !== false,
          wordPointsEnabled: document.getElementById('evsCfgWordPoints')?.checked === true,
          pointsPerNewWord: Number(document.getElementById('evsCfgPointsPerWord')?.value || 1),
          maxWordPointsPerUserPhrase: Number(document.getElementById('evsCfgMaxWordPoints')?.value || 5),
          partialHintCooldownSeconds: Number(document.getElementById('evsCfgPartialCooldown')?.value || 0)
        },
        overlayDefaults: {
          showTop3: document.getElementById('evsCfgOverlayTop3')?.checked !== false,
          showCurrentRound: document.getElementById('evsCfgOverlayRound')?.checked !== false,
          showPartialHints: document.getElementById('evsCfgOverlayHints')?.checked !== false
        }
      }
    };
  }

  async function saveConfig(){
    state.configSaving = true;
    state.error = '';
    try {
      state.config = await window.CGN.api(api.config, { method: 'POST', body: JSON.stringify(readConfigPayload()) });
      state.message = 'Config gespeichert.';
      await reloadDashboardAfterMutation(state.selectedUid, { keepTab: true });
    } catch (err) {
      state.error = err.message || String(err);
      render();
    } finally {
      state.configSaving = false;
    }
  }

  async function loadAll(force, rerender = true){
    if (state.loading && !force) return;
    state.loading = true;
    state.error = '';

    const softErrors = [];
    const softLoad = async (label, fn, fallback = null) => {
      try { return await fn(); }
      catch (err) {
        softErrors.push(`${label}: ${err && err.message ? err.message : String(err)}`);
        return fallback;
      }
    };

    try {
      // EVS52.21T: Eventliste absolut getrennt laden.
      // Bewusst zuerst /api/stream-events/events ohne Query nutzen, weil dieser Endpoint nachweislich rows/count liefert.
      let list = await softLoad('events', () => window.CGN.api('/api/stream-events/events'), null);
      let loadedEvents = eventRows(list);

      // Fallback für alte/andere Dashboard-Stände, falls die Hauptantwort anders verpackt oder leer ist.
      if (!loadedEvents.length) {
        const fallbackList = await softLoad('eventsFallback', () => window.CGN.api(api.list), null);
        loadedEvents = eventRows(fallbackList);
      }

      state.events = loadedEvents;

      if (!state.selectedUid && state.events[0]) state.selectedUid = state.events[0].eventUid;
      if (state.selectedUid && !state.events.some(event => event.eventUid === state.selectedUid)) {
        state.selectedUid = state.events[0]?.eventUid || '';
      }
      state.selected = selectedEvent();

      const [status, texts, config, runtimeGateStatus] = await Promise.all([
        softLoad('status', () => window.CGN.api(api.status), state.status),
        softLoad('texts', () => window.CGN.api(api.texts), state.texts),
        softLoad('config', () => window.CGN.api(api.config), state.config),
        softLoad('runtimeGateStatus', () => window.CGN.api(api.runtimeGateStatus), state.runtimeGateStatus)
      ]);

      state.status = status;
      state.texts = texts;
      state.config = config;
      state.runtimeGateStatus = runtimeGateStatus;

      const ev = selectedEvent();
      const activeEvent = state.events.find(event => norm(event.status) === 'active');
      const dataEvent = activeEvent || ev;

      if (ev) await softLoad('finalePreview', () => loadFinalePreview(ev.eventUid, false), null);
      else state.finalePreview = null;

      if (dataEvent) {
        await Promise.all([
          softLoad('ranking', () => loadRanking(dataEvent.eventUid, false), null),
          softLoad('textRuntimeReport', () => loadTextRuntimeReport(dataEvent.eventUid, false), null),
          softLoad('soundRuntimeReport', () => loadSoundRuntimeReport(dataEvent.eventUid, false), null),
          softLoad('statisticsUsers', () => loadStatisticsUsers(dataEvent.eventUid, false), null)
        ]);
      }

      if (softErrors.length) {
        state.error = `Eventliste geladen (${state.events.length}). Nebenstatus teilweise nicht geladen: ${softErrors.slice(0, 3).join(' | ')}`;
      }
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.loading = false;
      if (rerender !== false) render();
    }
  }

  async function loadRanking(uid, rerender = true){
    if (!uid) return;
    try {
      state.ranking = await window.CGN.api(`${api.events}/${encodeURIComponent(uid)}/ranking`);
    } catch (_) {
      state.ranking = null;
    }
    if (rerender) render();
  }

  async function loadFinalePreview(uid, rerender = true){
    if (!uid) { state.finalePreview = null; if (rerender) render(); return null; }
    try {
      const preview = await window.CGN.api(`${api.events}/${encodeURIComponent(uid)}/finale`);
      state.finalePreview = preview && preview.eventUid === uid ? preview : null;
    } catch (_) {
      state.finalePreview = null;
    }
    if (rerender) render();
    return state.finalePreview;
  }


  async function switchStatsSubTab(tab, uid){
    const allowed = ['overview', 'ranking', 'text', 'sound', 'user'];
    state.statsSubTab = allowed.includes(tab) ? tab : 'overview';
    const eventUid = uid || state.selectedUid;
    if (state.statsSubTab === 'ranking') return loadRanking(eventUid, true);
    if (state.statsSubTab === 'text') return loadTextRuntimeReport(eventUid, true);
    if (state.statsSubTab === 'sound') return loadSoundRuntimeReport(eventUid, true);
    if (state.statsSubTab === 'user') return loadStatisticsUsers(eventUid, true);
    render();
  }

  async function refreshCurrentStatsSection(uid){
    const eventUid = uid || state.selectedUid;
    const tab = state.statsSubTab || 'overview';
    if (tab === 'ranking') return loadRanking(eventUid, true);
    if (tab === 'text') return loadTextRuntimeReport(eventUid, true);
    if (tab === 'sound') return loadSoundRuntimeReport(eventUid, true);
    if (tab === 'user') return loadStatisticsUsers(eventUid, true);
    await Promise.all([
      loadRanking(eventUid, false),
      loadTextRuntimeReport(eventUid, false),
      loadSoundRuntimeReport(eventUid, false),
      loadChatOutputSafety(eventUid, false),
      loadStatisticsUsers(eventUid, false)
    ]);
    render();
  }


  async function loadRuntimeGateStatus(rerender = true){
    try {
      state.runtimeGateStatus = await window.CGN.api(api.runtimeGateStatus);
    } catch (err) {
      state.runtimeGateStatus = null;
      state.error = err.message || String(err);
    }
    if (rerender) render();
  }

  async function loadChatOutputSafety(uid, rerender = true){
    if (!uid) return;
    try {
      const qs = `?eventUid=${encodeURIComponent(uid)}`;
      state.chatOutputStatus = await window.CGN.api(`${api.chatOutputStatus}${qs}`);
      state.chatOutputReport = await window.CGN.api(`${api.chatOutputReport}${qs}`);
    } catch (err) {
      state.chatOutputStatus = null;
      state.chatOutputReport = null;
      state.error = err.message || String(err);
    }
    if (rerender) render();
  }

  async function loadSoundRuntimeReport(uid, rerender = true){
    try {
      const qs = uid ? `?eventUid=${encodeURIComponent(uid)}` : '';
      state.soundRuntimeReport = await window.CGN.api(`${api.soundRuntimeReport}${qs}`);
      if (rerender) render();
    } catch (err) {
      state.error = err.message || String(err);
      if (rerender) render();
    }
  }

  async function loadTextRuntimeReport(uid, rerender = true){
    if (!uid) return;
    try {
      state.textRuntimeReport = await window.CGN.api(`${api.textRuntimeReport}?eventUid=${encodeURIComponent(uid)}`);
    } catch (_) {
      state.textRuntimeReport = null;
    }
    if (rerender) render();
  }


  async function loadStatisticsUsers(uid, rerender = true){
    if (!uid) return;
    try {
      state.statisticsUsers = await window.CGN.api(`${api.statisticsUsers}?eventUid=${encodeURIComponent(uid)}`);
      const users = statisticsUsers();
      if (state.selectedStatsUser && !users.some(user => user.userLogin === state.selectedStatsUser)) {
        state.selectedStatsUser = '';
        state.userStatistics = null;
      }
    } catch (_) {
      state.statisticsUsers = null;
    }
    if (rerender) render();
  }


  let userStatsAutoTimer = null;

  function stopUserStatsAutoRefresh(){
    if (userStatsAutoTimer) clearInterval(userStatsAutoTimer);
    userStatsAutoTimer = null;
  }

  function startUserStatsAutoRefresh(){
    stopUserStatsAutoRefresh();
    const modal = state.userStatsModal || {};
    if (!modal.open || modal.autoRefresh === false || !modal.login) return;
    const intervalMs = Math.max(3000, Number(modal.intervalMs || 5000));
    userStatsAutoTimer = setInterval(() => refreshUserStatsModal(false), intervalMs);
  }

  async function openUserStatsModal(login, uid){
    const clean = norm(login).replace(/^@/, '');
    if (!clean) return;
    state.selectedStatsUser = clean;
    state.userStatsModal = { ...(state.userStatsModal || {}), open: true, login: clean, eventUid: uid || state.selectedUid || '', autoRefresh: state.userStatsModal?.autoRefresh !== false, intervalMs: state.userStatsModal?.intervalMs || 5000, lastScrollTop: 0 };
    await loadUserStatistics(clean, state.userStatsModal.eventUid, false);
    render();
    startUserStatsAutoRefresh();
  }

  function closeUserStatsModal(){
    stopUserStatsAutoRefresh();
    state.userStatsModal = { ...(state.userStatsModal || {}), open: false, lastScrollTop: 0 };
    render();
  }

  function preserveUserModalScroll(){
    const body = document.querySelector('[data-evs-user-modal-body]');
    if (body && state.userStatsModal) state.userStatsModal.lastScrollTop = body.scrollTop || 0;
  }

  function restoreUserModalScroll(){
    const body = document.querySelector('[data-evs-user-modal-body]');
    if (body && state.userStatsModal) body.scrollTop = Number(state.userStatsModal.lastScrollTop || 0);
  }

  async function refreshUserStatsModal(rerender = true){
    const modal = state.userStatsModal || {};
    if (!modal.open || !modal.login) return;
    preserveUserModalScroll();
    await loadUserStatistics(modal.login, modal.eventUid || state.selectedUid, false);
    if (state.userStatsModal) state.userStatsModal.lastRefreshAt = new Date().toISOString();
    if (rerender !== false) {
      render();
      restoreUserModalScroll();
    } else {
      render();
      restoreUserModalScroll();
    }
  }

  async function loadUserStatistics(login, uid, rerender = true){
    const clean = norm(login).replace(/^@/, '');
    if (!clean) { state.selectedStatsUser = ''; state.userStatistics = null; if (rerender) render(); return; }
    state.selectedStatsUser = clean;
    try {
      const qs = uid ? `?eventUid=${encodeURIComponent(uid)}` : '';
      state.userStatistics = await window.CGN.api(`${api.statisticsUser}/${encodeURIComponent(clean)}${qs}`);
    } catch (err) {
      state.error = err.message || String(err);
      state.userStatistics = null;
    }
    if (rerender) render();
  }

  async function loadEvent(uid){
    const result = await window.CGN.api(`${api.events}/${encodeURIComponent(uid)}`);
    state.selected = result.event;
    state.selectedUid = uid;
    await loadFinalePreview(uid, false);
    return result.event;
  }

  async function refreshSelectedEventAfterSave(uid){
    if (!uid) return;
    const result = await window.CGN.api(`${api.events}/${encodeURIComponent(uid)}`);
    const fresh = result.event || result;
    state.selected = fresh;
    state.selectedUid = fresh.eventUid || uid;
    const index = state.events.findIndex(e => e.eventUid === state.selectedUid);
    if (index >= 0) state.events[index] = { ...state.events[index], ...fresh };
    else if (fresh.eventUid) state.events.unshift(fresh);
    await loadFinalePreview(state.selectedUid, false);
  }

  async function reloadDashboardAfterMutation(uid, options = {}){
    const keepUid = uid || state.selectedUid || '';
    const keepTab = options.keepTab !== false ? (state.activeTab || 'overview') : (options.tab || state.activeTab || 'overview');
    await loadAll(true, false);
    state.activeTab = keepTab;
    if (keepUid) {
      const exists = state.events.some(event => event.eventUid === keepUid);
      if (exists) {
        await refreshSelectedEventAfterSave(keepUid);
      } else if (state.selectedUid === keepUid) {
        state.selectedUid = state.events[0]?.eventUid || '';
        state.selected = state.events[0] || null;
      }
    }
    const selected = selectedEvent();
    const selectedUid = selected?.eventUid || state.selectedUid || '';
    if (selectedUid) {
      await Promise.all([
        loadRanking(selectedUid, false),
        loadTextRuntimeReport(selectedUid, false),
        loadSoundRuntimeReport(selectedUid, false),
        loadStatisticsUsers(selectedUid, false),
        loadChatOutputSafety(selectedUid, false)
      ]);
    }
    if (state.liveStatusModal?.open && state.liveStatusModal.eventUid) {
      state.liveStatusModal.lastRefreshAt = new Date().toISOString();
    }
    render();
  }

  async function saveEvent(){
    const current = state.modal?.event || {};
    const payload = readModalPayload();
    state.saving = true;
    state.error = '';
    try {
      const result = current.eventUid
        ? await window.CGN.api(`${api.events}/${encodeURIComponent(current.eventUid)}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await window.CGN.api(api.events, { method: 'POST', body: JSON.stringify(payload) });
      const uid = result.event?.eventUid || current.eventUid || state.selectedUid;
      const validation = result.event?.validation || {};
      state.message = validation.startable === false || (Array.isArray(validation.issues) && validation.issues.length)
        ? 'Event gespeichert. Es ist noch nicht startbereit.'
        : 'Event gespeichert und startbereit.';
      state.modal = null;
      state.selectedUid = uid || state.selectedUid;
      state.selected = null;
      await reloadDashboardAfterMutation(state.selectedUid, { keepTab: true });
    } catch (err) {
      state.error = err.message || String(err);
      render();
    } finally {
      state.saving = false;
    }
  }


  let soundControlTickTimer = null;
  let soundControlStatusTimer = null;
  let soundControlRefreshRunning = false;

  function selectedSoundControlEvent(){
    const ev = selectedEvent();
    if (ev && ev.soundEnabled && norm(ev.status) === 'active') return ev;
    return null;
  }

  function shouldRunSoundControlAutoRefresh(){
    if (!root || !document.body.contains(root)) return false;
    if (state.soundControlAuto?.enabled === false) return false;
    const event = selectedSoundControlEvent();
    if (!event) return false;
    return true;
  }

  function updateNextSnippetCountdownDom(){
    if (!root) return;
    const rows = root.querySelectorAll('[data-evs-next-snippet="1"]');
    rows.forEach(row => {
      const status = norm(row.dataset.status || '');
      const dueAt = row.dataset.dueAt || '';
      if (!['waiting', 'waiting_persisted', 'waiting_due'].includes(status) || !dueAt) return;
      const remaining = computeRemainingSecondsFromDueAt(dueAt);
      if (remaining === null) return;
      const label = row.querySelector('[data-evs-next-snippet-label]');
      const detail = row.querySelector('[data-evs-next-snippet-detail]');
      if (label) label.textContent = remaining <= 0 ? 'fällig' : `in ${fmtDurationSeconds(remaining)}`;
      if (detail) detail.textContent = `Nächster Schnipsel · geplant um ${fmtClock(dueAt)}`;
      row.classList.toggle('is-warn', remaining <= 0);
      row.classList.toggle('is-waiting', remaining > 0);
    });
  }

  async function refreshSoundControlStatusAuto(){
    if (soundControlRefreshRunning || !shouldRunSoundControlAutoRefresh()) return;
    const event = selectedSoundControlEvent();
    if (!event?.eventUid) return;
    soundControlRefreshRunning = true;
    try {
      await loadSoundRuntimeReport(event.eventUid, false);
      if (state.soundControlAuto) state.soundControlAuto.lastRefreshAt = new Date().toISOString();
      render();
    } catch (err) {
      state.error = err.message || String(err);
      render();
    } finally {
      soundControlRefreshRunning = false;
    }
  }

  function stopSoundControlAutoRefresh(){
    if (soundControlTickTimer) clearInterval(soundControlTickTimer);
    if (soundControlStatusTimer) clearInterval(soundControlStatusTimer);
    soundControlTickTimer = null;
    soundControlStatusTimer = null;
  }

  function startSoundControlAutoRefresh(){
    stopSoundControlAutoRefresh();
    if (!shouldRunSoundControlAutoRefresh()) return;
    updateNextSnippetCountdownDom();
    soundControlTickTimer = setInterval(updateNextSnippetCountdownDom, 1000);
    const intervalMs = Math.max(5000, Number(state.soundControlAuto?.statusIntervalMs || 10000));
    soundControlStatusTimer = setInterval(refreshSoundControlStatusAuto, intervalMs);
  }


  let liveStatusAutoTimer = null;

  function stopLiveStatusAutoRefresh(){
    if (liveStatusAutoTimer) clearInterval(liveStatusAutoTimer);
    liveStatusAutoTimer = null;
  }

  function startLiveStatusAutoRefresh(){
    stopLiveStatusAutoRefresh();
    const modal = state.liveStatusModal || {};
    if (!modal.open || modal.autoRefresh === false || !modal.eventUid) return;
    const intervalMs = Math.max(3000, Number(modal.intervalMs || 5000));
    liveStatusAutoTimer = setInterval(() => refreshLiveStatusModal(false), intervalMs);
  }

  async function openLiveStatusModal(uid){
    const eventUid = uid || state.selectedUid;
    if (!eventUid) return;
    state.liveStatusModal = { ...(state.liveStatusModal || {}), open: true, eventUid, autoRefresh: state.liveStatusModal?.autoRefresh !== false, intervalMs: state.liveStatusModal?.intervalMs || 5000 };
    await refreshLiveStatusModal(false);
    render();
    startLiveStatusAutoRefresh();
  }

  function closeLiveStatusModal(){
    stopLiveStatusAutoRefresh();
    state.liveStatusModal = { ...(state.liveStatusModal || {}), open: false };
    render();
  }

  async function refreshLiveStatusModal(rerender = true){
    const modal = state.liveStatusModal || {};
    const uid = modal.eventUid || state.selectedUid;
    if (!uid) return;
    try {
      await refreshSelectedEventAfterSave(uid);
      await Promise.all([
        loadRanking(uid, false),
        loadSoundRuntimeReport(uid, false),
        loadTextRuntimeReport(uid, false),
        loadStatisticsUsers(uid, false),
        loadRuntimeGateStatus(false)
      ]);
      if (state.liveStatusModal) state.liveStatusModal.lastRefreshAt = new Date().toISOString();
    } catch (err) {
      state.error = err.message || String(err);
    }
    if (rerender !== false) render();
    else render();
  }


  async function loadTexts(rerender = true){
    try {
      state.texts = await window.CGN.api(api.texts);
      if (rerender) render();
    } catch (err) {
      state.error = err.message || String(err);
      if (rerender) render();
    }
  }

  function readTextVariantPayload(row){
    if (!row) return null;
    const id = Number(row.dataset.variantId || 0) || 0;
    const key = row.dataset.textKey || '';
    const category = row.dataset.category || 'general';
    const value = row.querySelector('[data-evs-text-value]')?.value || '';
    const enabled = row.querySelector('[data-evs-text-enabled]')?.checked !== false;
    const weight = Number(row.querySelector('[data-evs-text-weight]')?.value || 1);
    if (!key) return null;
    return { action: 'saveVariant', variant: { id, key, category, value, enabled, weight } };
  }

  async function saveTextVariant(row){
    const payload = readTextVariantPayload(row);
    if (!payload) return;
    if (!String(payload.variant.value || '').trim()) {
      state.error = 'Textvariante darf nicht leer sein.';
      render();
      return;
    }
    state.textSaving = true;
    state.error = '';
    try {
      const result = await window.CGN.api(api.texts, { method: 'POST', body: JSON.stringify(payload) });
      state.texts = result.texts || result;
      state.message = 'Textvariante gespeichert.';
      render();
    } catch (err) {
      state.error = err.message || String(err);
      render();
    } finally {
      state.textSaving = false;
    }
  }

  async function deleteTextVariant(row){
    if (!row) return;
    const id = Number(row.dataset.variantId || 0) || 0;
    if (!id) return;
    if (!confirm('Textvariante wirklich löschen?')) return;
    try {
      const result = await window.CGN.api(api.texts, { method: 'POST', body: JSON.stringify({ action: 'deleteVariant', id }) });
      state.texts = result.texts || result;
      state.message = 'Textvariante gelöscht.';
      render();
    } catch (err) {
      state.error = err.message || String(err);
      render();
    }
  }

  async function eventAction(action, uid){
    if (!uid) return;
    if (action === 'start' && !confirm('Event wirklich starten? Es darf nur ein Event gleichzeitig laufen.')) return;
    if ((action === 'finish' || action === 'cancel') && !confirm(`Event wirklich ${action === 'finish' ? 'auf Finished setzen und Auslosung freigeben' : 'abbrechen'}?`)) return;
    try {
      const result = await window.CGN.api(`${api.events}/${encodeURIComponent(uid)}/${action}`, { method: 'POST', body: JSON.stringify({ actor: 'dashboard', mode: action === 'finish' ? 'manual' : undefined }) });
      state.message = result.message || 'Aktion ausgeführt.';
      state.selectedUid = result.event?.eventUid || uid;
      await reloadDashboardAfterMutation(state.selectedUid, { keepTab: true });
    } catch (err) {
      state.error = err.message || String(err);
      render();
    }
  }



  function winnerOverlayTestUrl(count = 7, mode = 'instant', duration = 'short') {
    const search = new URLSearchParams();
    search.set('demo', 'random');
    search.set('demoCount', String(count || 7));
    if (mode === 'instant') search.set('state', 'final');
    else search.set('duration', duration || 'short');
    search.set('v', '4934');
    return `/overlays/stream_events/event_winner_overlay.html?${search.toString()}`;
  }

  function openWinnerOverlayTest(count = 7, mode = 'instant', duration = 'short') {
    const url = winnerOverlayTestUrl(count, mode, duration);
    window.open(url, '_blank', 'noopener,noreferrer');
    state.message = `Winner-Test geöffnet: ${count} User · ${mode === 'instant' ? 'Sofortbild' : `Timeline ${duration}`}`;
    render();
  }

  async function copyWinnerOverlayTestUrl(count = 7, mode = 'instant', duration = 'short') {
    const url = window.location.origin + winnerOverlayTestUrl(count, mode, duration);
    try {
      await navigator.clipboard.writeText(url);
      state.message = 'Overlay-Test-URL kopiert.';
    } catch (_) {
      state.message = url;
    }
    render();
  }

  async function fetchWinnerRandomDemo(count = 7) {
    state.testPanel = state.testPanel || {};
    state.testPanel.loading = true;
    state.testPanel.error = '';
    state.testPanel.message = '';
    render();
    try {
      const result = await window.CGN.api(`/api/stream-events/winner-finale/demo-random?count=${encodeURIComponent(String(count || 7))}`);
      state.testPanel.result = result;
      const rows = result?.finale?.ranking || [];
      state.testPanel.message = `Random-Testdaten geladen: ${rows.length} User.`;
      state.message = state.testPanel.message;
    } catch (err) {
      state.testPanel.error = err.message || String(err);
      state.error = state.testPanel.error;
    } finally {
      state.testPanel.loading = false;
      render();
    }
  }


  async function runEventDashboardTest(step, payload = {}) {
    state.testPanel = state.testPanel || {};
    state.testPanel.loading = true;
    state.testPanel.error = '';
    state.testPanel.message = '';
    render();
    try {
      const body = { step, ...payload };
      const isTextStep = String(step || '').startsWith('text-');
      const createsOwnTextEvent = step === 'text-create' || step === 'text-check';
      if (isTextStep && !createsOwnTextEvent && state.testPanel.textEventUid && !body.eventUid) {
        body.eventUid = state.testPanel.textEventUid;
      }
      const result = await window.CGN.api(`/api/stream-events/test/run?confirm=1&step=${encodeURIComponent(step)}`, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      state.testPanel.result = result;
      if (isTextStep && result?.eventUid) state.testPanel.textEventUid = result.eventUid;
      state.testPanel.message = `Test ausgeführt: ${step}${result?.eventUid ? ` · ${result.eventUid}` : ''}`;
      state.message = state.testPanel.message;
      if (result?.eventUid) state.selectedUid = result.eventUid;
      await reloadDashboardAfterMutation(result?.eventUid || state.selectedUid, { keepTab: true }).catch(() => null);
    } catch (err) {
      state.testPanel.error = err.message || String(err);
      state.error = state.testPanel.error;
    } finally {
      state.testPanel.loading = false;
      render();
    }
  }


  function openWinnerOverlayLive() {
    window.open('/overlays/stream_events/event_winner_overlay.html?v=4937', '_blank', 'noopener,noreferrer');
    state.message = 'Winner-Overlay geöffnet.';
    render();
  }

  function openRuntimeOverlayLive() {
    window.open('/overlays/stream_events/event_runtime_overlay.html?v=4937', '_blank', 'noopener,noreferrer');
    state.message = 'Runtime-Overlay geöffnet.';
    render();
  }

  async function copyWinnerOverlayLiveUrl() {
    const url = `${window.location.origin}/overlays/stream_events/event_winner_overlay.html?v=4937`;
    try {
      await navigator.clipboard.writeText(url);
      state.message = 'Winner-Overlay-URL kopiert.';
    } catch (_) {
      state.message = url;
    }
    render();
  }

  async function startWinnerFinale(uid){
    if (!uid) return;
    const event = state.events.find(e => e.eventUid === uid) || state.selected;
    if (norm(event?.status) !== 'finished') {
      state.error = 'Die Gewinner-Auslosung darf erst gestartet werden, wenn das Event auf Finished/Beendet steht.';
      render();
      return;
    }
    if (!confirm('Auswertung jetzt starten? Das Gewinner-Finale wird ans Overlay gesendet und direkt eingeblendet.')) return;
    try {
      const result = await window.CGN.api(`${api.events}/${encodeURIComponent(uid)}/finale/start?confirm=1`, {
        method: 'POST',
        body: JSON.stringify({ actor: 'dashboard' })
      });
      const winner = result?.finale?.winner?.userDisplayName || result?.finale?.winner?.userLogin || 'Gewinner';
      state.message = result.alreadyDrawn ? `Auswertung ist bereits vorbereitet: ${winner}.` : `Auswertung vorbereitet: ${winner}.`;
      await reloadDashboardAfterMutation(uid, { keepTab: true });
    } catch (err) {
      state.error = err.message || String(err);
      render();
    }
  }

  async function replayWinnerFinale(uid){
    if (!uid) return;
    const event = state.events.find(e => e.eventUid === uid) || state.selected;
    if (norm(event?.status) !== 'finished') {
      state.error = 'Die Auswertung kann erst erneut abgespielt werden, wenn das Event beendet ist.';
      render();
      return;
    }
    if (!confirm('Auswertung erneut abspielen? Es wird nicht neu ausgelost, sondern dasselbe Finale nochmal im Overlay gestartet.')) return;
    try {
      const result = await window.CGN.api(`${api.events}/${encodeURIComponent(uid)}/finale/start?confirm=1`, {
        method: 'POST',
        body: JSON.stringify({ actor: 'dashboard', replay: true })
      });
      const winner = result?.finale?.winner?.userDisplayName || result?.finale?.winner?.userLogin || 'Gewinner';
      state.message = `Auswertung wird erneut abgespielt: ${winner}.`;
      await reloadDashboardAfterMutation(uid, { keepTab: true });
    } catch (err) {
      state.error = err.message || String(err);
      render();
    }
  }

  async function endWinnerFinale(uid){
    if (!uid) return;
    if (!confirm('Finale jetzt beenden? Das Gewinner-Overlay wird ausgeblendet.')) return;
    try {
      await window.CGN.api(`${api.events}/${encodeURIComponent(uid)}/finale/end?confirm=1`, {
        method: 'POST',
        body: JSON.stringify({ actor: 'dashboard' })
      });
      state.message = 'Finale beendet. Das Gewinner-Overlay wird ausgeblendet.';
      await reloadDashboardAfterMutation(uid, { keepTab: true });
    } catch (err) {
      state.error = err.message || String(err);
      render();
    }
  }

  async function skipSoundWait(uid){
    if (!uid) return;
    const event = state.events.find(e => e.eventUid === uid) || state.selected;
    if (norm(event?.status) !== 'active') {
      state.error = 'Die Wartezeit kann erst übersprungen werden, wenn das Event läuft.';
      render();
      return;
    }
    if (!event.soundEnabled) {
      state.error = 'Dieses Event hat kein Sound-Spiel aktiviert.';
      render();
      return;
    }
    try {
      const result = await window.CGN.api(api.soundSkipWait, {
        method: 'POST',
        body: JSON.stringify({ eventUid: uid, actor: 'dashboard', allowReuse: false })
      });
      const snippetTitle = result?.snippet?.title || result?.round?.itemUid || result?.nextRound?.snippet?.title || 'Sound-Schnipsel';
      state.message = `${snippetTitle}: Wartezeit übersprungen, nächster Schnipsel wurde über den normalen Event-Ablauf gestartet.`;
      await reloadDashboardAfterMutation(uid, { keepTab: true });
    } catch (err) {
      state.error = err.message || String(err);
      render();
    }
  }


  async function archiveSelectedEvent(uid){
    if (!uid) return;
    const event = state.events.find(e => e.eventUid === uid) || state.selected;
    if (norm(event?.status) !== 'finished') {
      state.error = 'Archivieren ist nur bei beendeten Events erlaubt.';
      render();
      return;
    }
    if (!confirm('Dieses beendete Event archivieren? Die Werte bleiben erhalten.')) return;
    try {
      const result = await window.CGN.api(`${api.events}/${encodeURIComponent(uid)}/archive`, { method: 'POST', body: JSON.stringify({ actor: 'dashboard' }) });
      state.message = result.alreadyArchived ? 'Event war bereits archiviert.' : 'Event archiviert.';
      await reloadDashboardAfterMutation(uid, { keepTab: true });
    } catch (err) {
      state.error = err.message || String(err);
      render();
    }
  }

  async function deleteSelectedEvent(uid){
    if (!uid) return;
    const event = state.events.find(e => e.eventUid === uid) || state.selected || {};
    const label = event.name || uid;
    const accepted = confirm(`Event "${label}" wirklich löschen? Das entfernt Event und zugehörige Werte endgültig.`);
    if (!accepted) return;
    try {
      const result = await window.CGN.api(`${api.events}/${encodeURIComponent(uid)}/delete`, { method: 'POST', body: JSON.stringify({ confirm: 'DELETE', actor: 'dashboard' }) });
      state.message = `Event gelöscht. Score: ${result.countsDeleted?.scoreEntries || 0}, Runden: ${result.countsDeleted?.rounds || 0}.`;
      if (state.selectedUid === uid) state.selectedUid = '';
      await reloadDashboardAfterMutation('', { keepTab: true });
    } catch (err) {
      state.error = err.message || String(err);
      render();
    }
  }


  function openDuplicateDialog(uid){
    if (!uid) return;
    const event = state.events.find(e => e.eventUid === uid) || state.selected || {};
    const label = event.name || uid;
    state.nameDialog = {
      mode: 'duplicate',
      uid,
      sourceName: label,
      name: `Kopie von ${label}`,
      error: ''
    };
    render();
    setTimeout(() => document.getElementById('evsNameDialogInput')?.focus(), 0);
  }

  function openRenameDialog(uid){
    if (!uid) return;
    const event = state.events.find(e => e.eventUid === uid) || state.selected || {};
    state.nameDialog = {
      mode: 'rename',
      uid,
      sourceName: event.name || uid,
      name: event.name || '',
      error: ''
    };
    render();
    setTimeout(() => {
      const input = document.getElementById('evsNameDialogInput');
      if (input) { input.focus(); input.select(); }
    }, 0);
  }

  async function confirmNameDialog(){
    const dialog = state.nameDialog || {};
    const uid = dialog.uid || state.selectedUid;
    const input = document.getElementById('evsNameDialogInput');
    const name = String(input?.value || '').trim();
    if (!uid) return;
    if (!name) {
      state.nameDialog = { ...dialog, name, error: 'Bitte einen Eventnamen eingeben.' };
      render();
      return;
    }
    try {
      if (dialog.mode === 'duplicate') {
        const result = await window.CGN.api(`${api.events}/${encodeURIComponent(uid)}/duplicate`, { method: 'POST', body: JSON.stringify({ actor: 'dashboard', name }) });
        const copied = result.event || {};
        state.message = `Event kopiert: ${copied.name || name}.`;
        state.selectedUid = copied.eventUid || state.selectedUid;
      } else {
        const result = await window.CGN.api(`${api.events}/${encodeURIComponent(uid)}/rename`, { method: 'POST', body: JSON.stringify({ actor: 'dashboard', name }) });
        const renamed = result.event || {};
        state.message = `Event umbenannt: ${renamed.name || name}.`;
        state.selectedUid = renamed.eventUid || uid;
      }
      state.nameDialog = null;
      await reloadDashboardAfterMutation(state.selectedUid, { keepTab: true });
    } catch (err) {
      state.nameDialog = { ...dialog, name, error: err.message || String(err) };
      render();
    }
  }

  function bind(){
    document.addEventListener('click', async ev => {
      const select = ev.target.closest('[data-evs-select]');
      if (select) {
        state.selectedUid = select.dataset.evsSelect;
        await loadEvent(state.selectedUid).catch(() => null);
        await loadRanking(state.selectedUid, false);
        await loadTextRuntimeReport(state.selectedUid, false);
        await loadSoundRuntimeReport(state.selectedUid, false);
        await loadStatisticsUsers(state.selectedUid, false);
        render();
        return;
      }
      const tab = ev.target.closest('[data-evs-tab]');
      if (tab) {
        state.activeTab = tab.dataset.evsTab || 'overview';
        if (state.activeTab === 'safety') {
          await loadRuntimeGateStatus(false);
          if (state.selectedUid) await loadChatOutputSafety(state.selectedUid, false);
        }
        if (state.activeTab === 'current') {
          const ev = currentEventCandidate(selectedEvent());
          if (ev) {
            await loadRanking(ev.eventUid, false);
            await loadTextRuntimeReport(ev.eventUid, false);
            await loadSoundRuntimeReport(ev.eventUid, false);
            await loadStatisticsUsers(ev.eventUid, false);
          }
        }
        render();
        return;
      }
      const btn = ev.target.closest('[data-evs-action]');
      if (!btn) return;
      const action = btn.dataset.evsAction;
      const uid = btn.dataset.uid || state.selectedUid;

      if (action === 'openWinnerTest') {
        openWinnerOverlayTest(Number(btn.dataset.count || 7), btn.dataset.mode || 'instant', btn.dataset.duration || 'short');
        return;
      }
      if (action === 'copyWinnerTest') {
        copyWinnerOverlayTestUrl(Number(btn.dataset.count || 7), btn.dataset.mode || 'instant', btn.dataset.duration || 'short');
        return;
      }
      if (action === 'fetchWinnerRandomDemo') {
        fetchWinnerRandomDemo(Number(btn.dataset.count || 7));
        return;
      }
      if (action === 'runEventTestStep') {
        runEventDashboardTest(btn.dataset.step || 'full-flow', { count: Number(btn.dataset.count || 10) });
        return;
      }
      if (action === 'openPointsCheckUserStats') {
        await openUserStatsModal(btn.dataset.userLogin || 'forrestcgn', btn.dataset.uid || '');
        return;
      }
      if (action === 'openWinnerDebug') {
        window.open('/overlays/stream_events/event_winner_overlay.html?debug=boxes&grid=1&v=4937', '_blank', 'noopener,noreferrer');
        return;
      }

      if (action === 'openWinnerOverlayLive') {
        openWinnerOverlayLive();
        return;
      }
      if (action === 'openRuntimeOverlayLive') {
        openRuntimeOverlayLive();
        return;
      }
      if (action === 'copyWinnerOverlayLive') {
        copyWinnerOverlayLiveUrl();
        return;
      }


      if (action === 'selectEvent') {
        state.selectedUid = uid;
        const targetTab = btn.dataset.targetTab || 'events';
        await loadEvent(uid).catch(() => null);
        await loadRanking(uid, false);
        await loadTextRuntimeReport(uid, false);
        await loadSoundRuntimeReport(uid, false);
        await loadChatOutputSafety(uid, false);
        await loadStatisticsUsers(uid, false);
        state.activeTab = targetTab;
        render();
        return;
      }
      if (action === 'reload') return loadAll(true);
      if (action === 'reloadTexts') return loadTexts(true);
      if (action === 'clearTextFilters') { state.textModuleFilter = 'all'; state.textSearchFilter = ''; render(); return; }
      if (action === 'saveConfig') return saveConfig();
      if (action === 'new') {
        const cfg = state.config?.config || {};
        const soundDefaults = cfg.soundDefaults || {};
        const textDefaults = cfg.textDefaults || {};
        state.modal = { event: {
          name: '',
          description: '',
          soundEnabled: true,
          textEnabled: false,
          soundConfig: { ...normalizeSoundSettings({}, soundDefaults), snippets: [] },
          textConfig: {
            partialHintsEnabled: textDefaults.partialHintsEnabled !== false,
            partialHintVisibility: textDefaults.partialHintVisibility || 'general',
            showPartialWordCount: textDefaults.showPartialWordCount !== false,
            wordPointsEnabled: textDefaults.wordPointsEnabled === true,
            pointsPerNewWord: textDefaults.pointsPerNewWord || 1,
            maxWordPointsPerUserPhrase: textDefaults.maxWordPointsPerUserPhrase || 5,
            partialHintCooldownSeconds: textDefaults.partialHintCooldownSeconds || 0,
            phrases: [{ phrase: '', acceptedAnswers: [], pointsFirst: textDefaults.defaultPhrasePoints || 40, solvedPolicy: 'remove_from_rotation' }]
          }
        } };
        render();
        return;
      }
      if (action === 'edit') { const event = await loadEvent(uid); state.modal = { event }; render(); return; }
      if (action === 'editSettings') { const event = await loadEvent(uid); state.modal = { event, editor: 'settings' }; render(); return; }
      if (action === 'openLiveStatus') return openLiveStatusModal(uid);
      if (action === 'closeLiveStatusModal') return closeLiveStatusModal();
      if (action === 'refreshLiveStatusModal') return refreshLiveStatusModal(true);
      if (action === 'toggleLiveStatusAuto') { state.liveStatusModal.autoRefresh = state.liveStatusModal.autoRefresh === false; if (state.liveStatusModal.autoRefresh) startLiveStatusAutoRefresh(); else stopLiveStatusAutoRefresh(); render(); return; }
      if (action === 'closeModal') { state.modal = null; render(); return; }
      if (action === 'openSettingsEditor') { syncModalBasicsFromDom(); state.modal.editor = 'settings'; render(); return; }
      if (action === 'openSoundEditor') { syncModalBasicsFromDom(); state.modal.editor = 'sound'; render(); return; }
      if (action === 'openTextEditor') { syncModalBasicsFromDom(); state.modal.editor = 'text'; render(); return; }
      if (action === 'closeSubEditor') { syncVisibleEditorToState(); state.modal.editor = null; render(); return; }
      if (action === 'applySettingsEditor') { syncVisibleEditorToState(); state.modal.editor = null; render(); return; }
      if (action === 'applySoundEditor') { syncVisibleEditorToState(); state.modal.editor = null; render(); return; }
      if (action === 'applyTextEditor') { syncVisibleEditorToState(); state.modal.editor = null; render(); return; }
      if (action === 'addSoundSnippet') {
        syncVisibleEditorToState();
        if (appendSoundSnippetDom()) return;
        const payload = readModalPayload();
        const snippets = collectSoundSnippets(true, payload.soundConfig?.snippets || []);
        snippets.push({ title: '', mediaId: '', acceptedAnswers: [], revealVideoMediaId: '' });
        state.modal.event = { ...(state.modal.event || {}), ...payload, soundConfig: { ...(payload.soundConfig || {}), snippets } };
        render();
        return;
      }
      if (action === 'removeSoundSnippet') {
        const row = btn.closest('[data-evs-sound-snippet-row]');
        const rows = Array.from(document.querySelectorAll('[data-evs-sound-snippet-row]'));
        if (row && rows.length > 1) {
          row.remove();
          reindexSoundSnippetRows();
          syncVisibleEditorToState();
          return;
        }
        const payload = readModalPayload();
        const snippets = collectSoundSnippets(true, payload.soundConfig?.snippets || []);
        const index = Number(btn.dataset.index || -1);
        if (index >= 0 && snippets.length > 1) snippets.splice(index, 1);
        if (!snippets.length) snippets.push({ title: '', mediaId: '', acceptedAnswers: [], revealVideoMediaId: '' });
        state.modal.event = { ...(state.modal.event || {}), ...payload, soundConfig: { ...(payload.soundConfig || {}), snippets } };
        render();
        return;
      }
      if (action === 'addPhrase') {
        const payload = readModalPayload();
        const visibleRows = document.querySelectorAll('[data-evs-phrase-row]').length;
        while (payload.textConfig.phrases.length < visibleRows) payload.textConfig.phrases.push({ phrase: '', acceptedAnswers: [], pointsFirst: 40, solvedPolicy: 'remove_from_rotation' });
        payload.textConfig.phrases.push({ phrase: '', acceptedAnswers: [], pointsFirst: 40, solvedPolicy: 'remove_from_rotation' });
        state.modal.event = { ...(state.modal.event || {}), ...payload };
        render();
        return;
      }
      if (action === 'removePhrase') {
        const payload = readModalPayload();
        const visibleRows = document.querySelectorAll('[data-evs-phrase-row]').length;
        while (payload.textConfig.phrases.length < visibleRows) payload.textConfig.phrases.push({ phrase: '', acceptedAnswers: [], pointsFirst: 40, solvedPolicy: 'remove_from_rotation' });
        const index = Number(btn.dataset.index || -1);
        if (index >= 0 && payload.textConfig.phrases.length > 1) payload.textConfig.phrases.splice(index, 1);
        if (!payload.textConfig.phrases.length) payload.textConfig.phrases.push({ phrase: '', acceptedAnswers: [], pointsFirst: 40, solvedPolicy: 'remove_from_rotation' });
        state.modal.event = { ...(state.modal.event || {}), ...payload };
        render();
        return;
      }
      if (action === 'saveTextVariant') return saveTextVariant(btn.closest('[data-evs-text-variant], [data-evs-text-new]'));
      if (action === 'deleteTextVariant') return deleteTextVariant(btn.closest('[data-evs-text-variant]'));
      if (action === 'saveEvent') return saveEvent();
      if (action === 'validate') return eventAction('validate', uid);
      if (action === 'start') return eventAction('start', uid);
      if (action === 'finish') return eventAction('finish', uid);
      if (action === 'winnerFinale') return startWinnerFinale(uid);
      if (action === 'replayWinnerFinale') return replayWinnerFinale(uid);
      if (action === 'endWinnerFinale') return endWinnerFinale(uid);
      if (action === 'cancel') return eventAction('cancel', uid);
      if (action === 'archive') return archiveSelectedEvent(uid);
      if (action === 'renameEvent') return openRenameDialog(uid);
      if (action === 'duplicateEvent') return openDuplicateDialog(uid);
      if (action === 'closeNameDialog') { state.nameDialog = null; render(); return; }
      if (action === 'confirmNameDialog') return confirmNameDialog();
      if (action === 'deleteEvent') return deleteSelectedEvent(uid);
      if (action === 'runtimeGateStatus') return loadRuntimeGateStatus(true);
      if (action === 'chatOutputSafety') { await loadRuntimeGateStatus(false); return loadChatOutputSafety(uid, true); }
      if (action === 'statsSubTab') return switchStatsSubTab(btn.dataset.tab || 'overview', uid);
      if (action === 'refreshStatsCurrent') return refreshCurrentStatsSection(uid);
      if (action === 'refreshCurrentEventInfo') {
        await Promise.all([
          loadRanking(uid, false),
          loadTextRuntimeReport(uid, false),
          loadSoundRuntimeReport(uid, false),
          loadStatisticsUsers(uid, false),
          loadRuntimeGateStatus(false)
        ]);
        render();
        return;
      }
      if (action === 'ranking') return loadRanking(uid, true);
      if (action === 'runtimeReport') return loadTextRuntimeReport(uid, true);
      if (action === 'soundRuntimeReport') return loadSoundRuntimeReport(uid, true);
      if (action === 'soundSkipWait') return skipSoundWait(uid);
      if (action === 'statsUsers') return loadStatisticsUsers(uid, true);
      if (action === 'statsUser') return loadUserStatistics(btn.dataset.userLogin || state.selectedStatsUser, uid, true);
      if (action === 'openUserStats') return openUserStatsModal(btn.dataset.userLogin || state.selectedStatsUser, uid);
      if (action === 'refreshUserStatsModal') return refreshUserStatsModal(true);
      if (action === 'closeUserStatsModal') return closeUserStatsModal();
      if (action === 'toggleUserStatsAuto') { state.userStatsModal.autoRefresh = state.userStatsModal.autoRefresh === false; if (state.userStatsModal.autoRefresh) startUserStatsAutoRefresh(); else stopUserStatsAutoRefresh(); render(); return; }
    });

    document.addEventListener('click', ev => {
      if (ev.target.closest('[data-media-field]')) {
        setTimeout(() => {
          const row = ev.target.closest('[data-evs-sound-snippet-row]');
          if (row) refreshSoundSnippetRowSummary(row);
          syncVisibleEditorToState();
        }, 80);
      }
      if (ev.target.dataset?.evsModalClose === '1') {
        state.modal = null;
        render();
      }
      if (ev.target.dataset?.evsNameDialogClose === '1') {
        state.nameDialog = null;
        render();
      }
      if (ev.target.dataset?.evsUserModalClose === '1') {
        closeUserStatsModal();
      }
      if (ev.target.dataset?.evsLiveModalClose === '1') {
        closeLiveStatusModal();
      }
      if (ev.target.dataset?.evsSubmodalClose === '1') {
        syncVisibleEditorToState();
        if (state.modal) state.modal.editor = null;
        render();
      }
    });


    document.addEventListener('keydown', ev => {
      if (!state.nameDialog) return;
      if (ev.key === 'Escape') { state.nameDialog = null; render(); }
      if (ev.key === 'Enter' && ev.target?.matches?.('[data-evs-name-dialog-input]')) { ev.preventDefault(); confirmNameDialog(); }
    });

    document.addEventListener('change', async ev => {
      const snippetMediaInput = ev.target.closest('[data-evs-snippet-media], [data-evs-snippet-video]');
      if (snippetMediaInput) {
        const row = snippetMediaInput.closest('[data-evs-sound-snippet-row]');
        refreshSoundSnippetRowSummary(row);
        syncVisibleEditorToState();
        return;
      }
      const soundToggle = ev.target.closest('#evsSoundEnabled, #evsTextEnabled');
      if (soundToggle) {
        syncModalBasicsFromDom();
        refreshMainEditorSummaryFromState();
        return;
      }
      const textModuleSelect = ev.target.closest('[data-evs-text-module-filter]');
      if (textModuleSelect) {
        state.textModuleFilter = textModuleSelect.value || 'all';
        render();
        return;
      }
      const select = ev.target.closest('[data-evs-user-stat-select]');
      if (!select) return;
      const uid = select.dataset.eventUid || state.selectedUid;
      await openUserStatsModal(select.value || '', uid);
    });

    document.addEventListener('input', ev => {
      const snippetInput = ev.target.closest('[data-evs-snippet-title], [data-evs-snippet-answers]');
      if (snippetInput) {
        const row = snippetInput.closest('[data-evs-sound-snippet-row]');
        refreshSoundSnippetRowSummary(row);
        syncVisibleEditorToState();
        return;
      }
      const modalInput = ev.target.closest('#evsEventName, #evsEventDescription');
      if (modalInput) {
        syncModalBasicsFromDom();
        return;
      }
      const search = ev.target.closest('[data-evs-text-search-filter]');
      if (!search) return;
      state.textSearchFilter = search.value || '';
      render();
    });

    window.addEventListener('cgn:module-show', ev => {
      if (ev.detail?.module === 'stream_events') loadAll(false);
    });

    window.addEventListener('beforeunload', () => {
      stopSoundControlAutoRefresh();
      stopLiveStatusAutoRefresh();
      stopUserStatsAutoRefresh();
    });
  }

  function init(){
    installIntoDashboard();
    root = document.getElementById('streamEventsModule');
    if (root) render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  bind();

  return { init, loadAll, render };
})();
