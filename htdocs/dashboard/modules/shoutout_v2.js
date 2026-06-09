window.ShoutoutV2Module = (function(){
  'use strict';

  const MODULE_VERSION = '2.7.7-auto-single-name-input';
  const BUILD = 'AUTOSHOUT-DASHBOARD.1';

  const API = {
    status: '/api/clip-shoutout/status',
    queue: '/api/clip-shoutout/queue',
    timeline: '/api/clip-shoutout/timeline?limit=20',
    stats: '/api/clip-shoutout/stats?limit=20&detailLimit=40',
    inbound: '/api/clip-shoutout/inbound?limit=20',
    inboundStats: '/api/clip-shoutout/inbound/stats?limit=20',
    productionCheck: '/api/clip-shoutout/production-check',
    liveTest: '/api/clip-shoutout/live-test',
    run: '/api/clip-shoutout/run',
    streamStatus: '/api/stream-status/status',
    auto: '/api/clip-shoutout/auto',
    autoStreamers: '/api/clip-shoutout/auto/streamers',
    autoTestChat: '/api/clip-shoutout/auto/test-chat',
    autoStreamerRemove: '/api/clip-shoutout/auto/streamers/remove',
    sceneGate: '/api/clip-shoutout/scene-gate',
    displayQueueRemove: '/api/clip-shoutout/display-queue/remove',
    displayQueueRetry: '/api/clip-shoutout/display-queue/retry',
    officialQueueRemove: '/api/clip-shoutout/queue/remove',
    officialQueueRetry: '/api/clip-shoutout/queue/retry',
    texts: '/api/clip-shoutout/texts',
    overlaySets: '/api/clip-shoutout/overlay-sets',
    textsMigration: '/api/clip-shoutout/texts/migration',
    autoTexts: '/api/clip-shoutout/auto/texts',
    decisionPrep: '/api/clip-shoutout/decision-prep',
    officialAuthStatus: '/api/clip-shoutout/official/auth-status',
    inboundDebug: '/api/clip-shoutout/inbound/debug',
    settings: '/api/clip-shoutout/settings',
    autoSettings: '/api/clip-shoutout/auto/settings'
  };

  const TABS = [
    { id: 'overview', label: 'Übersicht', hint: 'Kurzstatus ohne doppelte Detailtabellen.' },
    { id: 'manual', label: 'Shoutout', hint: 'Manuell auslösen und Live-Gate kurz prüfen.' },
    { id: 'auto', label: 'AutoShoutout', hint: 'Betrieb und Streamer-Verwaltung. Keine Texte oder globale Config.' },
    { id: 'queues', label: 'Queues', hint: 'Warteschlangen und Aktionen.' },
    { id: 'texts', label: 'Texte', hint: 'Alle Chat- und Systemtexte an einem Ort.' },
    { id: 'analytics', label: 'Auswertung', hint: 'Statistik, Verlauf und eingehende Shoutouts.' },
    { id: 'diagnostics', label: 'Diagnose', hint: 'Nur Shoutout-spezifische Diagnose.' },
    { id: 'settings', label: 'Einstellungen', hint: 'Modul-Config bearbeiten. Commands bleiben im Commands-Dashboard.' }
  ];

  const state = {
    activeTab: 'overview',
    loading: false,
    error: '',
    notice: '',
    autoRefresh: true,
    status: null,
    queue: null,
    streamStatus: null,
    stats: null,
    timeline: null,
    inbound: null,
    inboundStats: null,
    productionCheck: null,
    liveTest: null,
    manualTarget: '',
    manualForce: false,
    manualResult: null,
    auto: null,
    autoStreamers: null,
    sceneGate: null,
    autoTarget: '',
    autoDisplayName: '',
    autoVideo: true,
    autoOfficial: true,
    autoResult: null,
    queueResult: null,
    texts: null,
    textsMigration: null,
    autoTexts: null,
    textCategory: '',
    textKey: '',
    textResult: null,
    overlaySets: null,
    overlaySetsResult: null,
    decisionPrep: null,
    officialAuthStatus: null,
    diagnosticsResult: null,
    settings: null,
    autoSettings: null,
    settingsResult: null
  };

  let root = null;
  let refreshTimer = null;

  function esc(value){
    return window.CGN?.esc
      ? window.CGN.esc(value)
      : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function asArray(value){ return Array.isArray(value) ? value : []; }

  function get(obj, path, fallback = undefined){
    if (!obj || !path) return fallback;
    const parts = String(path).split('.');
    let cur = obj;
    for (const part of parts) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, part)) cur = cur[part];
      else return fallback;
    }
    return cur ?? fallback;
  }

  function pick(obj, paths, fallback = ''){
    for (const path of paths) {
      const value = get(obj, path, undefined);
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return fallback;
  }

  function boolText(value){
    if (value === true) return 'ja';
    if (value === false) return 'nein';
    return value || '-';
  }

  function asNumber(value, fallback = 0){
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function pickNumber(obj, paths, fallback = 0){
    const value = pick(obj, paths, undefined);
    if (Array.isArray(value)) return value.length;
    return asNumber(value, fallback);
  }

  function formatTime(value){
    if (!value) return '-';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return String(value);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function normalizeActivity(item){
    if (!item || typeof item !== 'object') return { title: 'Aktivität', meta: '', tone: 'neutral' };
    const target = item.displayName || item.targetDisplayName || item.target || item.login || item.user || item.channel || item.broadcasterName || '';
    const type = item.type || item.kind || item.event || item.action || item.status || 'Shoutout';
    const status = item.status || item.state || item.result || '';
    const time = item.createdAt || item.time || item.timestamp || item.at || '';
    const title = target ? `${target}` : `${type}`;
    const metaParts = [type, status, formatTime(time)].filter(Boolean).filter(v => v !== '-');
    const failed = /fail|error|fehler/i.test(`${type} ${status}`);
    const done = /done|sent|success|fertig|gesendet/i.test(`${type} ${status}`);
    return { title, meta: metaParts.join(' · '), tone: failed ? 'warn' : (done ? 'ok' : 'neutral') };
  }

  function cleanChannelInput(value){
    return String(value || '')
      .trim()
      .replace(/^https?:\/\/([^\/]+\.)?twitch\.tv\//i, '')
      .replace(/^@+/, '')
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .slice(0, 40);
  }

  function explainReason(value){
    const reason = String(value || '').trim();
    const map = {
      accepted: 'Shoutout wurde aufgenommen.',
      queued: 'Shoutout wartet in der Liste.',
      waiting: 'Shoutout wartet in der Liste.',
      duplicate: 'Dieser Kanal hatte im aktuellen Stream bereits einen Shoutout.',
      stream_not_live: 'Der Stream ist aktuell nicht live.',
      live_gate_waiting: 'Offizieller Twitch-Shoutout wartet, bis der Stream live ist.',
      cooldown: 'Es läuft noch eine Wartezeit.',
      target_cooldown: 'Für diesen Kanal läuft noch eine Wartezeit.',
      global_cooldown: 'Twitch erlaubt den nächsten offiziellen Shoutout erst später.',
      start_scene_active: 'Start-Szene ist aktiv',
      waiting_start_scene: 'Wartet auf Ende der Start-Szene',
      waiting_stream_live: 'Wartet auf Livestatus',
      waiting_stream_live_offline: 'Stream ist offline',
      waiting_stream_status_stale: 'Streamstatus ist veraltet',
      waiting_stream_status_unknown: 'Streamstatus unbekannt',
      obs_shared_unavailable: 'OBS-Verbindung nicht verfügbar',
      disabled: 'deaktiviert',
      frei: 'frei'
    };
    return map[reason] || reason || '';
  }

  function autoData(){
    return (state.auto && state.auto.autoShoutout) || (state.status && state.status.autoShoutout) || {};
  }

  function autoStreamers(){
    const fromRoute = asArray(pick(state.autoStreamers || {}, ['streamers','data.streamers'], []));
    if (fromRoute.length) return fromRoute;
    return asArray(pick(autoData(), ['configuredStreamers','streamers'], []));
  }

  function isEnabled(value){
    return value === true || value === 1 || String(value || '').toLowerCase() === 'true';
  }

  function autoEventRows(){
    const auto = autoData();
    const events = asArray(pick(auto, ['recentEvents','events'], []));
    const activity = asArray(pick(auto, ['recentActivity','activityRows'], []));
    return [...events, ...activity].slice(0, 8);
  }

  function autoStreamerLogin(row){
    return cleanChannelInput(row?.login || row?.targetLogin || row?.target_login || row?.name || row?.user || row?.channel || '');
  }

  function autoStreamerDisplay(row){
    return row?.displayName || row?.display_name || row?.targetDisplay || row?.target_display || autoStreamerLogin(row) || 'Streamer';
  }


  function badge(value, tone = 'neutral'){
    return `<span class="so2-badge so2-badge-${esc(tone)}">${esc(value || '-')}</span>`;
  }

  function isEditingField(){
    const active = document.activeElement;
    return !!(active && root && root.contains(active) && active.matches('input, textarea, select'));
  }

  function registerDashboardModule(){
    if (!window.CGN) return;
    window.CGN.modules = window.CGN.modules || {};
    window.CGN.moduleCatalog = window.CGN.moduleCatalog || {};
    window.CGN.sections = window.CGN.sections || {};

    window.CGN.modules.shoutout = {
      title: 'Shoutout',
      panelId: 'shoutoutV2Module',
      group: 'community',
      overlayLink: '',
      reload(){ return window.ShoutoutV2Module?.loadAll?.(true); }
    };

    window.CGN.moduleCatalog.shoutout = {
      label: 'Shoutout',
      icon: '📣',
      enabled: true,
      description: 'Shoutout-System mit manuellem SO, Queues, Texten, AutoShoutout und editierbarer Modul-Config.'
    };

    if (window.CGN.sections.community) {
      const items = Array.isArray(window.CGN.sections.community.items) ? window.CGN.sections.community.items : [];
      const withoutLegacy = items.filter(id => id !== 'shoutout_v2');
      if (!withoutLegacy.includes('shoutout')) {
        const after = withoutLegacy.indexOf('commands');
        if (after >= 0) withoutLegacy.splice(after + 1, 0, 'shoutout');
        else withoutLegacy.push('shoutout');
      }
      window.CGN.sections.community.items = withoutLegacy;
    }
  }

  async function api(path, options = {}){
    if (window.CGN?.api) return window.CGN.api(path, options);
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    const data = (res.headers.get('content-type') || '').includes('application/json') ? await res.json().catch(() => ({})) : await res.text().catch(() => '');
    if (!res.ok || (data && typeof data === 'object' && data.ok === false)) throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
    return data;
  }

  async function loadAll(force = false){
    clearTimeout(refreshTimer);
    if (!force && isEditingField()) {
      scheduleRefresh();
      return;
    }
    state.loading = true;
    state.error = '';
    render();
    try {
      const [status, queue, streamStatus] = await Promise.all([
        api(API.status).catch(err => ({ ok:false, error: err.message })),
        api(API.queue).catch(err => ({ ok:false, error: err.message })),
        api(API.streamStatus).catch(err => ({ ok:false, error: err.message }))
      ]);
      state.status = status;
      state.queue = queue;
      state.streamStatus = streamStatus;

      if (['overview','analytics'].includes(state.activeTab)) {
        const [stats, timeline, inbound, inboundStats] = await Promise.all([
          api(API.stats).catch(err => ({ ok:false, error: err.message })),
          api(API.timeline).catch(err => ({ ok:false, error: err.message })),
          api(API.inbound).catch(err => ({ ok:false, error: err.message })),
          api(API.inboundStats).catch(err => ({ ok:false, error: err.message }))
        ]);
        state.stats = stats;
        state.timeline = timeline;
        state.inbound = inbound;
        state.inboundStats = inboundStats;
      }

      if (['diagnostics'].includes(state.activeTab)) {
        const [productionCheck, liveTest, decisionPrep, officialAuthStatus, sceneGate] = await Promise.all([
          api(API.productionCheck).catch(err => ({ ok:false, error: err.message })),
          api(API.liveTest).catch(err => ({ ok:false, error: err.message })),
          api(API.decisionPrep).catch(err => ({ ok:false, error: err.message })),
          api(API.officialAuthStatus).catch(err => ({ ok:false, error: err.message })),
          api(API.sceneGate).catch(err => ({ ok:false, error: err.message }))
        ]);
        state.productionCheck = productionCheck;
        state.liveTest = liveTest;
        state.decisionPrep = decisionPrep;
        state.officialAuthStatus = officialAuthStatus;
        state.sceneGate = sceneGate;
      }

      if (['auto'].includes(state.activeTab)) {
        const [auto, autoStreamers, sceneGate] = await Promise.all([
          api(API.auto).catch(err => ({ ok:false, error: err.message })),
          api(API.autoStreamers).catch(err => ({ ok:false, error: err.message })),
          api(API.sceneGate).catch(err => ({ ok:false, error: err.message }))
        ]);
        state.auto = auto;
        state.autoStreamers = autoStreamers;
        state.sceneGate = sceneGate;
      }

      if (['texts'].includes(state.activeTab)) {
        const [texts, migration, autoTexts, overlaySets] = await Promise.all([
          api(API.texts).catch(err => ({ ok:false, error: err.message })),
          api(API.textsMigration).catch(err => ({ ok:false, error: err.message })),
          api(API.autoTexts).catch(err => ({ ok:false, error: err.message })),
          api(API.overlaySets).catch(err => ({ ok:false, error: err.message }))
        ]);
        state.texts = texts;
        state.textsMigration = texts && texts.migration ? texts.migration : migration;
        state.autoTexts = autoTexts;
        state.overlaySets = overlaySets;
        ensureTextSelection();
      }

      if (['settings'].includes(state.activeTab)) {
        const [settings, autoSettings, sceneGate] = await Promise.all([
          api(API.settings).catch(err => ({ ok:false, error: err.message })),
          api(API.autoSettings).catch(err => ({ ok:false, error: err.message })),
          api(API.sceneGate).catch(err => ({ ok:false, error: err.message }))
        ]);
        state.settings = settings;
        state.autoSettings = autoSettings;
        state.sceneGate = sceneGate;
      }
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.loading = false;
      render();
      scheduleRefresh();
    }
  }

  function scheduleRefresh(){
    clearTimeout(refreshTimer);
    if (!state.autoRefresh) return;
    refreshTimer = setTimeout(() => loadAll(false), 7000);
  }

  function render(){
    root = root || document.getElementById('shoutoutV2Module');
    if (!root) return;
    root.innerHTML = `
      <div class="so2-shell">

        ${state.error ? `<div class="so2-alert so2-alert-error">${esc(state.error)}</div>` : ''}
        ${state.notice ? `<div class="so2-alert so2-alert-ok">${esc(state.notice)}</div>` : ''}

        <nav class="so2-tabs" aria-label="Shoutout V2 Navigation">
          ${TABS.map(tab => `<button type="button" class="so2-tab ${tab.id === state.activeTab ? 'is-active' : ''}" data-so2-tab="${esc(tab.id)}"><strong>${esc(tab.label)}</strong><small>${esc(tab.hint)}</small></button>`).join('')}
          <span class="so2-tabs-spacer"></span>
          <span class="so2-mini-state">${state.loading ? 'lädt' : 'bereit'}</span>
          <label class="so2-auto so2-auto-mini"><input type="checkbox" data-so2-autorefresh ${state.autoRefresh ? 'checked' : ''}> Auto</label>
          <button type="button" class="so2-refresh-mini" data-so2-refresh>Aktualisieren</button>
        </nav>

        <div class="so2-content">
          ${renderActiveTabSafe()}
        </div>
      </div>
    `;
  }

  function renderActiveTabSafe(){
    try {
      return renderActiveTab();
    } catch (err) {
      console.error('[ShoutoutV2] renderActiveTab failed', err);
      return `<div class="so2-alert so2-alert-error">Dieser Bereich konnte nicht gerendert werden: ${esc(err && err.message ? err.message : err)}</div>`;
    }
  }

  function renderActiveTab(){
    switch (state.activeTab) {
      case 'manual': return renderManual();
      case 'auto': return renderAuto();
      case 'queues': return renderQueues();
      case 'texts': return renderTexts();
      case 'analytics': return renderAnalytics();
      case 'diagnostics': return renderDiagnostics();
      case 'settings': return renderSettings();
      case 'overview':
      default: return renderOverview();
    }
  }

  function renderOverview(){
    const status = state.status || {};
    const stream = state.streamStatus || {};
    const queue = state.queue || {};
    const stats = state.stats || {};
    const inboundStats = state.inboundStats || {};
    const timeline = asArray(pick(state.timeline || {}, ['items','timeline','rows','events'], []));

    const displayOpen = pickNumber(status, ['displayOpen','display.open','queues.display.open','displayQueueOpen'], pickNumber(queue, ['displayOpen','display.open','displayQueue.length','displayQueue'], 0));
    const officialOpen = pickNumber(status, ['officialOpen','official.open','queues.official.open','officialQueueOpen'], pickNumber(queue, ['officialOpen','official.open','officialQueue.length','officialQueue'], 0));
    const moduleVersion = pick(status, ['version','moduleVersion','module.version'], '-');
    const active = pick(status, ['active','enabled','module.active'], true);
    const lastError = pick(status, ['lastError','error','errors.0.message','display.lastError','official.lastError'], '');
    const streamLive = pick(stream, ['live','isLive','data.live'], pick(status, ['stream.live','live'], false));
    const streamFresh = pick(stream, ['fresh','isFresh','stale'], undefined);
    const source = pick(stream, ['source','upstream','data.source'], pick(status, ['stream.source','source'], 'twitch_api'));

    const total = pickNumber(stats, ['total','totalCount','summary.total','shoutoutsTotal','createdTotal'], pickNumber(status, ['total','created','stats.total'], 0));
    const targets = pickNumber(stats, ['targets','targetCount','summary.targets','uniqueTargets'], 0);
    const triggers = pickNumber(stats, ['triggers','triggerCount','summary.triggers','uniqueTriggers'], 0);
    const officialSent = pickNumber(stats, ['officialSent','official.sent','summary.officialSent','officialShoutoutsSent'], pickNumber(status, ['officialSent','official.sent'], 0));
    const inboundReceived = pickNumber(inboundStats, ['incoming','received','summary.incoming','totalIncoming','inbound'], pickNumber(status, ['inbound','incoming','received'], 0));

    const blockerCount = [lastError, displayOpen > 0 || officialOpen > 0 ? '' : ''].filter(Boolean).length;
    const systemTone = lastError ? 'warn' : 'ok';
    const streamTone = streamLive ? 'ok' : 'warn';

    return `
      <section class="so2-overview-block">
        <div class="so2-section-title">
          <div>
            <h3>Status</h3>
          </div>
          ${lastError ? badge('Problem prüfen', 'warn') : badge('bereit', 'ok')}
        </div>
        <div class="so2-grid so2-grid-4">
          ${statusCard('System', active ? 'aktiv' : 'inaktiv', badge(lastError ? 'Hinweis' : 'OK', systemTone), lastError || 'Das Shoutout-System antwortet.')}
          ${statusCard('Stream', streamLive ? 'LIVE' : 'OFFLINE', badge(streamLive ? 'live' : 'offline', streamTone), `Quelle: ${source}${streamFresh === false ? ' · Status eventuell alt' : ''}`)}
          ${statusCard('Overlay-Shoutouts', String(displayOpen), badge(displayOpen ? 'wartet' : 'frei', displayOpen ? 'warn' : 'ok'), displayOpen ? 'Einträge warten in der Overlay-Warteschlange.' : 'Keine offenen Overlay-Shoutouts.')}
          ${statusCard('Twitch-Shoutouts', String(officialOpen), badge(officialOpen ? 'wartet' : 'frei', officialOpen ? 'warn' : 'ok'), officialOpen ? 'Offizielle Twitch-Shoutouts warten.' : 'Keine offenen offiziellen Twitch-Shoutouts.')}
        </div>
      </section>

      <section class="so2-overview-block">
        <div class="so2-section-title">
          <div>
            <h3>Kurzstatistik</h3>
          </div>
          ${badge(`Modul ${moduleVersion}`, 'neutral')}
        </div>
        <div class="so2-grid so2-grid-5">
          ${metricCard('Gesamt', total, 'erstellte Shoutouts')}
          ${metricCard('Ziele', targets, 'unterschiedliche Kanäle')}
          ${metricCard('Auslöser', triggers, 'User / Quellen')}
          ${metricCard('Twitch gesendet', officialSent, 'offizielle Shoutouts')}
          ${metricCard('Eingehend', inboundReceived, 'erhaltene Shoutouts')}
        </div>
      </section>

      <section class="so2-overview-block">
        <div class="so2-section-title">
          <div>
            <h3>Letzte Aktivität</h3>
          </div>
          ${timeline.length ? badge(`${Math.min(timeline.length, 5)} angezeigt`, 'neutral') : badge('leer', 'neutral')}
        </div>
        ${renderActivityPreview(timeline)}
      </section>
    `;
  }

  function renderManual(){
    const stream = state.streamStatus || {};
    const status = state.status || {};
    const live = pick(stream, ['live','isLive','data.live'], pick(status, ['stream.live','live'], false));
    const stale = pick(stream, ['stale','data.stale'], false);
    const source = pick(stream, ['source','upstream','data.source'], pick(status, ['stream.source','source'], 'twitch_api'));
    const displayOpen = pickNumber(status, ['displayOpen','display.open','queues.display.open','displayQueueOpen'], 0);
    const officialOpen = pickNumber(status, ['officialOpen','official.open','queues.official.open','officialQueueOpen'], 0);
    const result = state.manualResult || null;

    return `
      <div class="so2-manual-layout">
        <section class="so2-panel so2-manual-main">
          <div class="so2-section-title">
            <div><h3>Shoutout auslösen</h3></div>
            ${badge(live ? 'Stream live' : 'Stream offline', live ? 'ok' : 'warn')}
          </div>

          <div class="so2-manual-form">
            <label class="so2-field">
              <span>Twitch-Kanal</span>
              <input type="text" data-so2-target placeholder="z. B. urlug" autocomplete="off" value="${esc(state.manualTarget || '')}">
            </label>
            <label class="so2-check so2-force-check">
              <input type="checkbox" data-so2-force ${state.manualForce ? 'checked' : ''}>
              <span>Erzwingen</span>
            </label>
            <button type="button" class="so2-primary-action" data-so2-run>Aufnehmen</button>
          </div>

          <div class="so2-note">
            <strong>Hinweis:</strong>
            <span>„Erzwingen“ nur nutzen, wenn der Kanal trotz Streamtag-Sperre erneut aufgenommen werden soll.</span>
          </div>

          ${renderManualResult(result)}
        </section>

        <aside class="so2-panel so2-manual-side so2-manual-status">
          <h3>Status</h3>
          <div class="so2-status-list">
            <div><span>Stream</span><strong>${live ? 'live' : 'offline'}</strong></div>
            <div><span>Overlay</span><strong>${displayOpen} offen</strong></div>
            <div><span>Twitch</span><strong>${officialOpen} offen</strong></div>
          </div>
          ${!live ? `<div class="so2-quiet-hint">Stream offline. Offizielle Twitch-Shoutouts warten ggf. bis zum Livestatus.</div>` : ''}
          ${stale ? `<div class="so2-quiet-hint so2-quiet-hint-warn">Streamstatus eventuell veraltet. Details stehen in Diagnose.</div>` : ''}
        </aside>
      </div>
    `;
  }

  function renderAuto(){
    const auto = autoData();
    const stream = state.streamStatus || {};
    const scene = pick(state.sceneGate || {}, ['sceneGate','data.sceneGate'], pick(auto, ['sceneGate'], {}));
    const streamers = autoStreamers();
    const enabled = isEnabled(pick(auto, ['enabled'], false));
    const onlyLive = isEnabled(pick(auto, ['onlyWhenLive'], false));
    const live = pick(stream, ['live','isLive','data.live'], pick(state.status || {}, ['streamStatus.live','stream.live','live'], false));
    const sceneActive = isEnabled(pick(scene, ['active','blocked','isActive'], false));
    const result = state.autoResult || null;
    const lastError = pick(auto, ['state.lastError','lastError'], '');
    const events = autoEventRows();

    return `
      <section class="so2-ops-head">
        <div class="so2-grid so2-grid-4">
          ${statusCard('Betrieb', enabled ? 'aktiv' : 'inaktiv', badge(enabled ? 'an' : 'aus', enabled ? 'ok' : 'warn'), 'AutoShoutout-Status aus /auto.')}
          ${statusCard('Live-Regel', onlyLive ? 'nur live' : 'nicht begrenzt', badge(live ? 'Stream live' : 'Stream offline', live ? 'ok' : 'warn'), 'Nur Anzeige, Bearbeitung später in Einstellungen.')}
          ${statusCard('Start-Szene', sceneActive ? 'blockiert' : 'frei', badge(sceneActive ? 'wartet' : 'frei', sceneActive ? 'warn' : 'ok'), 'Scene-Gate aus bestätigter Route.')}
          ${statusCard('Streamer', String(streamers.length), badge('verwaltet', 'neutral'), 'Liste aus /auto/streamers.')}
        </div>
        ${lastError ? `<div class="so2-alert so2-alert-error">${esc(lastError)}</div>` : ''}
      </section>

      <div class="so2-two so2-auto-layout">
        <section class="so2-panel">
          <div class="so2-section-title">
            <div><h3>Streamer-Verwaltung</h3></div>
            ${badge(`${streamers.length} Einträge`, 'neutral')}
          </div>

          <div class="so2-auto-form">
            <label class="so2-field">
              <span>Streamer / Anzeigename</span>
              <input type="text" data-so2-auto-target placeholder="z. B. PapselZockt_CGN" autocomplete="off" value="${esc(state.autoDisplayName || state.autoTarget || '')}">
            </label>
            <label class="so2-check"><input type="checkbox" data-so2-auto-video ${state.autoVideo ? 'checked' : ''}> Video-SO</label>
            <label class="so2-check"><input type="checkbox" data-so2-auto-official ${state.autoOfficial ? 'checked' : ''}> Twitch-SO</label>
            <button type="button" class="so2-primary-action" data-so2-auto-save>Speichern</button>
          </div>

          ${renderAutoResult(result)}
          ${renderAutoStreamerTable(streamers)}
        </section>

        <section class="so2-panel">
          <div class="so2-section-title">
            <div><h3>Letzte AutoShoutout-Aktivität</h3></div>
          </div>
          ${renderAutoActivity(events)}
        </section>
      </div>
    `;
  }


  function renderQueues(){
    const queue = state.queue || {};
    const display = pick(queue, ['displayQueue'], {});
    const official = pick(queue, ['officialQueue'], {});
    const displayItems = queueItems(display);
    const officialItems = queueItems(official);
    const displayPending = pickNumber(display, ['pending'], displayItems.length);
    const officialPending = pickNumber(official, ['pending'], officialItems.length);
    const result = state.queueResult || null;

    return `
      <section class="so2-ops-head">
        <div class="so2-grid so2-grid-4">
          ${statusCard('Overlay-Queue', String(displayPending), badge(displayPending ? 'offen' : 'frei', displayPending ? 'warn' : 'ok'), 'Display-/Overlay-Shoutouts.')}
          ${statusCard('Overlay-Worker', boolText(pick(display, ['workerStarted'], false)), badge(pick(display, ['workerStarted'], false) ? 'läuft' : 'aus', pick(display, ['workerStarted'], false) ? 'ok' : 'warn'), 'Nur Status.')}
          ${statusCard('Twitch-Queue', String(officialPending), badge(officialPending ? 'offen' : 'frei', officialPending ? 'warn' : 'ok'), 'Offizielle Twitch-Shoutouts.')}
          ${statusCard('Twitch-Worker', boolText(pick(official, ['workerStarted'], false)), badge(pick(official, ['workerStarted'], false) ? 'läuft' : 'aus', pick(official, ['workerStarted'], false) ? 'ok' : 'warn'), 'Nur Status.')}
        </div>
        ${renderQueueResult(result)}
      </section>

      <div class="so2-two">
        <section class="so2-panel">
          <div class="so2-section-title">
            <div><h3>Overlay-Shoutouts</h3></div>
            ${badge(`${displayPending} offen`, displayPending ? 'warn' : 'ok')}
          </div>
          ${renderQueueTable('display', displayItems, 'Keine offenen Overlay-Shoutouts.')}
        </section>
        <section class="so2-panel">
          <div class="so2-section-title">
            <div><h3>Offizielle Twitch-Shoutouts</h3></div>
            ${badge(`${officialPending} offen`, officialPending ? 'warn' : 'ok')}
          </div>
          ${renderQueueTable('official', officialItems, 'Keine offenen offiziellen Twitch-Shoutouts.')}
        </section>
      </div>
    `;
  }


  function textPayload(){
    return state.texts || {};
  }

  function textRoot(){
    return pick(textPayload(), ['texts'], {});
  }

  function textCategories(){
    return asArray(pick(textRoot(), ['categories'], []));
  }

  function textKeys(){
    const rows = asArray(pick(textRoot(), ['keys'], []));
    const hasOverlaySets = rows.some(row => String(row.key || '') === 'shoutout.overlay.sets');
    return hasOverlaySets ? rows : [overlaySetsTextRow(), ...rows];
  }


  function overlaySetsTextRow(){
    const payload = overlaySetsPayload();
    const rows = overlaySetRows();
    return {
      key: 'shoutout.overlay.sets',
      category: 'shoutout.overlay',
      label: 'shoutout.overlay.sets',
      variants: [],
      activeCount: rows.filter(row => row.enabled !== false).length,
      totalCount: rows.length,
      isOverlaySets: true,
      description: 'Headline/Subline-Paare für das Shoutout-Overlay'
    };
  }

  function overlaySetsPayload(){
    return (state.overlaySets && state.overlaySets.overlaySets) || {};
  }

  function overlaySetRows(){
    const payload = overlaySetsPayload();
    return asArray(payload.sets).map((set, index) => normalizeOverlaySet(set, index));
  }

  function normalizeOverlaySet(set, index = 0){
    const fallbackId = `overlay-set-${index + 1}`;
    const raw = set && typeof set === 'object' ? set : {};
    return {
      id: cleanOverlaySetId(raw.id || raw.key || fallbackId, fallbackId),
      enabled: raw.enabled !== false,
      weight: Math.max(0, asNumber(raw.weight, 1)),
      headline: String(raw.headline || '').trim() || 'Schaut gerne mal vorbei!',
      subline: String(raw.subline || '').trim() || 'Heute auf der Leinwand: {displayName}'
    };
  }

  function cleanOverlaySetId(value, fallback = 'overlay-set'){
    const cleaned = String(value || fallback || 'overlay-set')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return cleaned || fallback || 'overlay-set';
  }

  function overlayPreviewText(value){
    return String(value || '')
      .replace(/\{displayName\}/g, 'CrazyMeerSchweinchen')
      .replace(/\{login\}/g, 'crazymeerschweinchen')
      .replace(/\{clipTitle\}/g, 'Rentnerkino Deluxe')
      .replace(/\{clipUrl\}/g, 'https://clips.twitch.tv/...')
      .replace(/\{gameName\}/g, 'Minecraft');
  }

  function isOverlaySetsRow(row = selectedTextRow()){
    return String(row && row.key || '') === 'shoutout.overlay.sets';
  }


  function textCategoryLabel(id){
    const key = String(id || '');
    if (!key) return 'Alle Texte';
    if (key === 'auto_shoutout') return 'Legacy AutoShoutout';
    const found = textCategories().find(row => String(row.id || row.key || '') === key);
    return found ? String(found.label || found.id || key) : key;
  }

  function textRowsForCategory(category = state.textCategory){
    const cat = String(category || '');
    let rows = textKeys();
    if (!cat) return rows;
    rows = rows.filter(row => String(row.category || '') === cat);

    if (cat === 'shoutout.overlay' && !rows.some(row => String(row.key || '') === 'shoutout.overlay.sets')) {
      rows = [overlaySetsTextRow(), ...rows];
    }

    return rows;
  }

  function selectedTextRow(){
    const rows = textKeys();
    if (!rows.length) return null;
    let row = rows.find(item => String(item.key || '') === String(state.textKey || '')) || null;
    if (!row) row = textRowsForCategory()[0] || rows[0] || null;
    if (row) {
      state.textKey = String(row.key || '');
      if (!state.textCategory && row.category) state.textCategory = String(row.category || '');
    }
    return row;
  }

  function ensureTextSelection(){
    const cats = textCategories();
    if (!state.textCategory && cats.some(c => c.id === 'shoutout.chat')) state.textCategory = 'shoutout.chat';
    if (state.textCategory && !cats.some(c => String(c.id || c.key || '') === state.textCategory) && !textRowsForCategory(state.textCategory).length) {
      state.textCategory = '';
    }
    selectedTextRow();
  }

  function activeVariantValues(row){
    const variants = asArray(row && row.variants);
    return variants
      .filter(v => v && v.enabled !== false)
      .map(v => String(v.value || v.text || '').trim())
      .filter(Boolean);
  }

  function renderTextResult(result){
    if (!result) return '';
    const ok = result.ok !== false;
    const text = result.message || result.error || (ok ? 'Text gespeichert.' : 'Text konnte nicht gespeichert werden.');
    return `<div class="so2-alert ${ok ? 'so2-alert-ok' : 'so2-alert-error'}">${esc(text)}</div>`;
  }

  function renderTextCategoryOptions(){
    const cats = textCategories();
    const allCount = textKeys().length;
    return `<option value="" ${state.textCategory ? '' : 'selected'}>Alle Texte (${esc(allCount)})</option>` + cats.map(cat => {
      const id = String(cat.id || cat.key || '');
      const count = cat.variantCount ?? cat.count ?? textRowsForCategory(id).length;
      return `<option value="${esc(id)}" ${state.textCategory === id ? 'selected' : ''}>${esc(textCategoryLabel(id))} (${esc(count)})</option>`;
    }).join('');
  }

  function renderTextKeyOptions(){
    let rows = textRowsForCategory();
    // CAN44.30 hard dropdown guard: Overlay-Sets muss im Shoutout-Overlay-Dropdown sichtbar sein.
    if (String(state.textCategory || '') === 'shoutout.overlay' && !rows.some(row => String(row.key || '') === 'shoutout.overlay.sets')) {
      rows = [overlaySetsTextRow(), ...rows];
    }
    if (!rows.length) return `<option value="">Keine Textkeys</option>`;
    return rows.map(row => {
      const key = String(row.key || '');
      const active = row.activeCount ?? activeVariantValues(row).length;
      const total = row.totalCount ?? asArray(row.variants).length;
      const suffix = key === 'shoutout.overlay.sets' ? ` · ${esc(active)}/${esc(total)} Sets aktiv` : ` · ${esc(active)}/${esc(total)} aktiv`;
      return `<option value="${esc(key)}" ${state.textKey === key ? 'selected' : ''}>${esc(key)}${suffix}</option>`;
    }).join('');
  }

  function renderVariantInputs(row){
    const values = activeVariantValues(row);
    const rows = values.length ? values : [''];
    return rows.map((value, index) => `
      <div class="so2-text-variant-row" data-so2-text-variant-row>
        <label class="so2-field">
          <span>Variante ${index + 1}</span>
          <textarea data-so2-text-variant rows="${String(value).length > 130 ? 3 : 2}" spellcheck="false">${esc(value)}</textarea>
        </label>
        ${rows.length > 1 ? '<button type="button" class="so2-icon-action" data-so2-text-remove-variant title="Variante entfernen">×</button>' : ''}
      </div>
    `).join('');
  }


  function renderOverlaySetsEditor(){
    const rows = overlaySetRows();
    const result = state.overlaySetsResult || state.textResult || null;
    const payload = overlaySetsPayload();
    const placeholders = asArray(payload.placeholders).length ? asArray(payload.placeholders) : ['{displayName}', '{login}', '{clipTitle}', '{clipUrl}', '{gameName}'];

    return `
      ${renderOverlaySetsResult(result)}
      <div class="so2-overlay-sets-box">
        <div class="so2-overlay-sets-head">
          <div>
            <h4>Headline/Subline-Sets</h4>
            <p>Diese Einträge werden paarweise gewählt. Genau das ersetzt hier die normalen Varianten-Zeilen.</p>
          </div>
          <div class="so2-overlay-sets-actions">
            <button type="button" data-so2-overlay-sets-reload>Sets neu laden</button>
            <button type="button" data-so2-overlay-set-add>+ Set</button>
            <button type="button" class="so2-primary-action" data-so2-overlay-sets-save>Sets speichern</button>
          </div>
        </div>

        <div class="so2-overlay-set-list" data-so2-overlay-set-list>
          ${rows.length ? rows.map((set, index) => renderOverlaySetCard(set, index)).join('') : `<div class="so2-empty">Keine Overlay-Sets geladen.</div>`}
        </div>

        <div class="so2-note">
          <strong>Platzhalter:</strong>
          <span>${placeholders.map(token => `<code>${esc(token)}</code>`).join(', ')}</span>
        </div>
      </div>
    `;
  }

  function renderOverlaySetCard(set, index){
    const n = index + 1;
    return `
      <article class="so2-overlay-set-card" data-so2-overlay-set-card>
        <div class="so2-overlay-set-headline">
          <div class="so2-overlay-set-title">
            <strong>Set ${n}</strong>
            <span>${esc(set.id || `overlay-set-${n}`)}</span>
          </div>
          <div class="so2-overlay-set-top-actions">
            <label class="so2-checkline">
              <input type="checkbox" data-so2-overlay-set-enabled ${set.enabled !== false ? 'checked' : ''}>
              aktiv
            </label>
            <button type="button" class="so2-danger-action" data-so2-overlay-set-remove title="Set löschen">Set löschen</button>
          </div>
        </div>

        <div class="so2-overlay-set-grid">
          <label class="so2-field">
            <span>ID</span>
            <input data-so2-overlay-set-id value="${esc(set.id || `overlay-set-${n}`)}" spellcheck="false">
          </label>
          <label class="so2-field">
            <span>Gewichtung</span>
            <input data-so2-overlay-set-weight type="number" min="0" step="1" value="${esc(set.weight || 1)}">
          </label>
        </div>

        <label class="so2-field">
          <span>Headline</span>
          <input data-so2-overlay-set-headline value="${esc(set.headline || '')}" spellcheck="false">
        </label>

        <label class="so2-field">
          <span>Subline</span>
          <textarea data-so2-overlay-set-subline rows="2" spellcheck="false">${esc(set.subline || '')}</textarea>
        </label>
      </article>
    `;
  }

  function renderOverlaySetsResult(result){
    if (!result) return '';
    if (result.ok === false) return `<div class="so2-alert so2-alert-error">${esc(result.error || 'Overlay-Sets konnten nicht gespeichert werden.')}</div>`;
    return `<div class="so2-alert so2-alert-ok">${esc(result.message || 'Overlay-Sets gespeichert.')}</div>`;
  }

  function collectOverlaySets(){
    return Array.from(root.querySelectorAll('[data-so2-overlay-set-card]')).map((card, index) => {
      const id = cleanOverlaySetId(card.querySelector('[data-so2-overlay-set-id]')?.value, `overlay-set-${index + 1}`);
      const headline = String(card.querySelector('[data-so2-overlay-set-headline]')?.value || '').trim();
      const subline = String(card.querySelector('[data-so2-overlay-set-subline]')?.value || '').trim();
      return {
        id,
        enabled: card.querySelector('[data-so2-overlay-set-enabled]')?.checked !== false,
        weight: Math.max(0, asNumber(card.querySelector('[data-so2-overlay-set-weight]')?.value, 1)),
        headline: headline || 'Schaut gerne mal vorbei!',
        subline: subline || 'Heute auf der Leinwand: {displayName}'
      };
    }).filter(set => set.headline || set.subline);
  }

  async function saveOverlaySetsAction(){
    const sets = collectOverlaySets();
    if (!sets.length) {
      state.overlaySetsResult = { ok: false, error: 'Mindestens ein Overlay-Set ist erforderlich.' };
      state.textResult = state.overlaySetsResult;
      render();
      return;
    }

    state.loading = true;
    state.error = '';
    state.notice = '';
    state.overlaySetsResult = null;
    state.textResult = null;
    render();

    try {
      const result = await api(API.overlaySets, {
        method: 'POST',
        body: JSON.stringify({ sets })
      });
      state.overlaySetsResult = { ok: result && result.ok !== false, message: `${sets.length} Overlay-Sets gespeichert.` };
      state.textResult = state.overlaySetsResult;
      state.overlaySets = result;
      await loadAll(true);
    } catch (err) {
      state.overlaySetsResult = { ok: false, error: err.message || String(err) };
      state.textResult = state.overlaySetsResult;
      state.loading = false;
      render();
    }
  }

  function addOverlaySetCard(){
    const rows = collectOverlaySets();
    const next = rows.length + 1;
    rows.push({
      id: `overlay-set-${next}`,
      enabled: true,
      weight: 1,
      headline: 'Neues Rentner-Kino!',
      subline: 'Heute auf der Leinwand: {displayName}'
    });
    state.overlaySets = {
      ok: true,
      overlaySets: {
        ...(overlaySetsPayload() || {}),
        sets: rows
      }
    };
    state.overlaySetsResult = { ok: true, message: 'Neues Set hinzugefügt. Speichern nicht vergessen.' };
    state.textResult = state.overlaySetsResult;
    state.textKey = 'shoutout.overlay.sets';
    state.textCategory = 'shoutout.overlay';
    render();
  }


  function renderTextMigrationInfo(){
    const m = state.textsMigration || {};
    const route = pick(textPayload(), ['compatibility.legacyAutoTextsRoute'], pick(m, ['compatibility.oldAutoTextsRouteRemains'], '/api/clip-shoutout/auto/texts'));
    const planned = asArray(pick(m, ['plannedKeys'], []));
    return `
      <details class="so2-panel so2-text-migration">
        <summary><strong>Migration / Kompatibilität</strong><span>Legacy bleibt sichtbar, Runtime bleibt unverändert.</span></summary>
        <div class="so2-grid so2-grid-4">
          ${metricCard('Modul', pick(textPayload(), ['moduleVersion'], pick(m, ['moduleVersion'], '-')), 'Backend')}
          ${metricCard('Textkeys', textKeys().length, 'geladene Keys')}
          ${metricCard('Migration', planned.length || '-', 'geplante Keys')}
          ${metricCard('Legacy-Route', route, 'AutoShoutout')}
        </div>
      </details>
    `;
  }

  function renderTexts(){
    const rows = textKeys();
    const row = selectedTextRow();
    const categories = textCategories();
    const result = state.textResult || null;

    if (state.texts && state.texts.ok === false) {
      return `<section class="so2-panel"><h3>Texte</h3><div class="so2-alert so2-alert-error">${esc(state.texts.error || 'Texte konnten nicht geladen werden.')}</div></section>`;
    }

    return `
      <section class="so2-ops-head">
        <div class="so2-grid so2-grid-4">
          ${statusCard('Textbereiche', String(categories.length), badge('Kategorien', 'neutral'), 'Aus bestätigter Text-API.')}
          ${statusCard('Textkeys', String(rows.length), badge('shoutout.*', 'ok'), 'Neue Zielkeys und Legacy sichtbar.')}
          ${statusCard('Legacy Auto', state.autoTexts && state.autoTexts.ok !== false ? 'geladen' : 'Fallback', badge('auto.*', 'neutral'), 'Nicht im AutoShoutout-Tab bearbeiten.')}
          ${statusCard('Speichern', 'pro Key', badge('Varianten', 'neutral'), 'Mehrere aktive Varianten pro Textkey.')}
        </div>
        ${renderTextResult(result)}
      </section>

      <section class="so2-panel so2-text-editor">
        <div class="so2-section-title">
          <div><h3>Textvarianten bearbeiten</h3></div>
          ${badge(state.textCategory ? textCategoryLabel(state.textCategory) : 'Alle Texte', 'neutral')}
        </div>

        <div class="so2-text-toolbar">
          <label class="so2-field">
            <span>Kategorie</span>
            <select data-so2-text-category>${renderTextCategoryOptions()}</select>
          </label>
          <label class="so2-field">
            <span>Textkey</span>
            <select data-so2-text-key>${renderTextKeyOptions()}</select>
          </label>
          <button type="button" data-so2-text-reload>Neu laden</button>
          <button type="button" data-so2-text-add-variant>+ Variante</button>
          <button type="button" class="so2-primary-action" data-so2-text-save>Speichern</button>
        </div>

        ${row ? `
          <div class="so2-text-key-head">
            <strong>${esc(row.key)}</strong>
            <span>${esc(textCategoryLabel(row.category))}</span>
            ${String(row.category || '') === 'auto_shoutout' ? badge('Legacy', 'warn') : ''}
            ${isOverlaySetsRow(row) ? badge('Set-Editor', 'ok') : ''}
          </div>
          ${isOverlaySetsRow(row) ? renderOverlaySetsEditor() : `
            <div class="so2-text-variants" data-so2-text-variants>
              ${renderVariantInputs(row)}
            </div>
            <div class="so2-note">
              <strong>Platzhalter:</strong>
              <span><code>@{displayName}</code>, <code>@{login}</code>, <code>{login}</code>, <code>{waitTime}</code>, <code>{reason}</code></span>
            </div>
          `}
        ` : `<div class="so2-empty">Keine Textkeys geladen.</div>`}
      </section>

      ${renderTextMigrationInfo()}
    `;
  }


  function statRows(path){
    return asArray(pick(state.stats || {}, [path], []));
  }

  function statTotal(path, fallback = 0){
    return pickNumber(state.stats || {}, [`totals.${path}`, path], fallback);
  }

  function displayNameForStat(row, kind){
    if (kind === 'requester') return row.requesterDisplay || row.requesterLogin || '-';
    if (kind === 'pair') return `${row.requesterDisplay || row.requesterLogin || '-'} → ${row.targetDisplay || row.targetLogin || '-'}`;
    if (kind === 'streamday') return row.streamDayId || '-';
    return row.targetDisplay || row.targetLogin || row.display || row.login || '-';
  }

  function streamDayLabel(row){
    const first = row.firstRequestedAt || '';
    const last = row.lastRequestedAt || '';
    const basis = last || first;
    if (basis) {
      const date = new Date(basis);
      if (Number.isFinite(date.getTime())) {
        return date.toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' });
      }
    }
    const raw = String(row.streamDayId || '');
    const match = raw.match(/_(\d{8})t/i);
    if (match) {
      const y = match[1].slice(0,4);
      const m = match[1].slice(4,6);
      const d = match[1].slice(6,8);
      return `${d}.${m}.${y}`;
    }
    return raw || '-';
  }

  function shortStreamDayId(value){
    const raw = String(value || '');
    if (!raw) return '';
    return raw.replace(/^forrestcgn_/i, '').replace(/_fallback$/i, '');
  }

  function renderPairStatsTable(rows, emptyText){
    const list = asArray(rows).slice(0, 12);
    if (!list.length) return `<div class="so2-empty">${esc(emptyText)}</div>`;
    return `<div class="so2-table-wrap"><table class="so2-table so2-analytics-table so2-pair-table">
      <thead><tr><th>Paarung</th><th>Gesamt</th><th>Fertig</th><th>Override</th><th>Letzte Aktivität</th></tr></thead>
      <tbody>${list.map(row => `
        <tr>
          <td><strong>${esc(displayNameForStat(row, 'pair'))}</strong></td>
          <td>${esc(row.total ?? 0)}</td>
          <td>${esc(row.displayDone ?? '-')}</td>
          <td>${esc(row.overrideCount ?? 0)}</td>
          <td>${esc(formatTime(row.lastRequestedAt || ''))}</td>
        </tr>
      `).join('')}</tbody>
    </table></div>`;
  }

  function renderStreamDayStatsTable(rows, emptyText){
    const list = asArray(rows).slice(0, 12);
    if (!list.length) return `<div class="so2-empty">${esc(emptyText)}</div>`;
    return `<div class="so2-table-wrap"><table class="so2-table so2-analytics-table so2-streamday-table">
      <thead><tr><th>Streamtag</th><th>Gesamt</th><th>Ziele</th><th>Auslöser</th><th>Override</th><th>Letzte Aktivität</th></tr></thead>
      <tbody>${list.map(row => `
        <tr>
          <td><strong>${esc(streamDayLabel(row))}</strong>${row.streamDayId ? `<small>${esc(shortStreamDayId(row.streamDayId))}</small>` : ''}</td>
          <td>${esc(row.total ?? 0)}</td>
          <td>${esc(row.uniqueTargets ?? '-')}</td>
          <td>${esc(row.uniqueRequesters ?? '-')}</td>
          <td>${esc(row.overrideCount ?? 0)}</td>
          <td>${esc(formatTime(row.lastRequestedAt || ''))}</td>
        </tr>
      `).join('')}</tbody>
    </table></div>`;
  }

  function renderStatsTable(rows, kind, emptyText){
    const list = asArray(rows).slice(0, 12);
    if (!list.length) return `<div class="so2-empty">${esc(emptyText)}</div>`;
    return `<div class="so2-table-wrap"><table class="so2-table so2-analytics-table">
      <thead><tr><th>${kind === 'pair' ? 'Paarung' : kind === 'requester' ? 'Auslöser' : kind === 'streamday' ? 'Streamtag' : 'Zielkanal'}</th><th>Gesamt</th><th>Fertig</th><th>Offen</th><th>Override</th><th>Letzte Aktivität</th></tr></thead>
      <tbody>${list.map(row => `
        <tr>
          <td><strong>${esc(displayNameForStat(row, kind))}</strong>${kind === 'target' && row.targetLogin ? `<small>${esc(row.targetLogin)}</small>` : ''}${kind === 'requester' && row.requesterLogin ? `<small>${esc(row.requesterLogin)}</small>` : ''}</td>
          <td>${esc(row.total ?? row.totalRequests ?? 0)}</td>
          <td>${esc(row.displayDone ?? '-')}</td>
          <td>${esc(row.displayPending ?? '-')}</td>
          <td>${esc(row.overrideCount ?? 0)}</td>
          <td>${esc(formatTime(row.lastRequestedAt || row.lastOfficialAt || row.lastAt || ''))}</td>
        </tr>
      `).join('')}</tbody>
    </table></div>`;
  }

  function renderTimelineTable(rows, emptyText){
    const list = asArray(rows).slice(0, 16);
    if (!list.length) return `<div class="so2-empty">${esc(emptyText)}</div>`;
    return `<div class="so2-table-wrap"><table class="so2-table so2-analytics-table">
      <thead><tr><th>Ziel</th><th>Von</th><th>Status</th><th>Twitch</th><th>Zeit</th></tr></thead>
      <tbody>${list.map(row => `
        <tr>
          <td><strong>@${esc(row.targetDisplay || row.targetLogin || row.displayName || row.target || 'Ziel')}</strong>${row.targetLogin ? `<small>${esc(row.targetLogin)}</small>` : ''}</td>
          <td>${esc(row.requestedByDisplay || row.requestedByLogin || '-')}</td>
          <td>${badge(row.status || row.displayStatus || '-', queueTone(row.status || row.displayStatus || ''))}</td>
          <td>${esc(row.officialStatus || row.officialResult || '-')}</td>
          <td>${esc(formatTime(row.requestedAt || row.displayQueuedAt || row.createdAt || row.time || ''))}</td>
        </tr>
      `).join('')}</tbody>
    </table></div>`;
  }

  function renderInboundTable(rows, emptyText){
    const list = asArray(rows).slice(0, 12);
    if (!list.length) return `<div class="so2-empty">${esc(emptyText)}</div>`;
    return `<div class="so2-table-wrap"><table class="so2-table so2-analytics-table">
      <thead><tr><th>Richtung</th><th>Von</th><th>An</th><th>Viewer</th><th>Zeit</th></tr></thead>
      <tbody>${list.map(row => `
        <tr>
          <td>${badge(row.direction || '-', String(row.direction || '').toLowerCase() === 'incoming' ? 'ok' : 'neutral')}</td>
          <td>${esc(row.fromBroadcasterDisplay || row.from_broadcaster_display || row.fromBroadcasterLogin || row.from || '-')}</td>
          <td>${esc(row.toBroadcasterDisplay || row.to_broadcaster_display || row.toBroadcasterLogin || row.to || '-')}</td>
          <td>${esc(row.viewerCount ?? row.viewer_count ?? '-')}</td>
          <td>${esc(formatTime(row.receivedAt || row.received_at || row.startedAt || row.started_at || ''))}</td>
        </tr>
      `).join('')}</tbody>
    </table></div>`;
  }

  function renderAnalytics(){
    const stats = state.stats || {};
    const timeline = asArray(pick(state.timeline || {}, ['items','timeline','rows','events'], []));
    const inbound = asArray(pick(state.inbound || {}, ['items','events','rows'], []));
    const inboundStats = state.inboundStats || {};
    const targetStats = statRows('targetStats');
    const requesterStats = statRows('requesterStats');
    const pairStats = statRows('pairStats');
    const streamDayStats = statRows('streamDayStats');

    if (stats && stats.ok === false) {
      return `<section class="so2-panel"><h3>Auswertung</h3><div class="so2-alert so2-alert-error">${esc(stats.error || 'Statistik konnte nicht geladen werden.')}</div></section>`;
    }

    return `
      <section class="so2-ops-head">
        <div class="so2-grid so2-grid-4">
          ${statusCard('Shoutouts gesamt', statTotal('totalRequests'), badge('Display', 'neutral'), 'Alle nicht entfernten Anfragen.')}
          ${statusCard('Zielkanäle', statTotal('uniqueTargets'), badge('Ziele', 'neutral'), 'Eindeutige Kanäle.')}
          ${statusCard('Offizielle Twitch-SO', statTotal('officialSent'), badge('gesendet', 'ok'), 'History aus Twitch-Queue.')}
          ${statusCard('Inbound/Outbound', pickNumber(inboundStats, ['total','totals.total','count'], inbound.length), badge('Events', 'neutral'), 'Twitch-Shoutout-Events.')}
        </div>
      </section>

      <div class="so2-two">
        <section class="so2-panel">
          <div class="so2-section-title"><div><h3>Top Zielkanäle</h3></div>${badge(`${targetStats.length} geladen`, 'neutral')}</div>
          ${renderStatsTable(targetStats, 'target', 'Noch keine Zielkanal-Statistik geladen.')}
        </section>
        <section class="so2-panel">
          <div class="so2-section-title"><div><h3>Top Auslöser</h3></div>${badge(`${requesterStats.length} geladen`, 'neutral')}</div>
          ${renderStatsTable(requesterStats, 'requester', 'Noch keine Auslöser-Statistik geladen.')}
        </section>
      </div>

      <div class="so2-two">
        <section class="so2-panel">
          <div class="so2-section-title"><div><h3>Häufige Paarungen</h3></div>${badge(`${pairStats.length} geladen`, 'neutral')}</div>
          ${renderPairStatsTable(pairStats, 'Noch keine Paarungsdaten geladen.')}
        </section>
        <section class="so2-panel">
          <div class="so2-section-title"><div><h3>Streamtage</h3></div>${badge(`${streamDayStats.length} geladen`, 'neutral')}</div>
          ${renderStreamDayStatsTable(streamDayStats, 'Noch keine Streamtage geladen.')}
        </section>
      </div>

      <div class="so2-two">
        <section class="so2-panel">
          <div class="so2-section-title"><div><h3>Verlauf</h3></div>${badge(`${timeline.length} Einträge`, 'neutral')}</div>
          ${renderTimelineTable(timeline, 'Noch keine Verlaufsdaten geladen.')}
        </section>
        <section class="so2-panel">
          <div class="so2-section-title"><div><h3>Eingehende / erstellte Twitch-Shoutouts</h3></div>${badge(`${inbound.length} Events`, 'neutral')}</div>
          ${renderInboundTable(inbound, 'Noch keine Twitch-Shoutout-Events geladen.')}
        </section>
      </div>
    `;
  }


  function diagOk(value){
    if (!value) return false;
    if (value.ok === false) return false;
    if (value.error) return false;
    return value.ok === true || Object.keys(value || {}).length > 0;
  }

  function diagTone(value){
    return diagOk(value) ? 'ok' : 'warn';
  }

  function diagStatus(value){
    if (!value) return 'nicht geladen';
    if (value.ok === false) return 'Fehler';
    if (value.error) return 'Fehler';
    if (value.ok === true) return 'ok';
    return 'geladen';
  }

  function diagError(value){
    return value && (value.error || value.message || pick(value, ['result.error','details.error'], ''));
  }

  function renderDiagCard(title, value, help){
    const err = diagError(value);
    return `<article class="so2-card so2-diag-card">
      <small>${esc(title)}</small>
      <strong>${esc(diagStatus(value))}</strong>
      <div>${badge(diagStatus(value), diagTone(value))}</div>
      <p>${esc(err || help || '')}</p>
    </article>`;
  }

  function renderDiagDetails(title, value){
    const data = value || {};
    const rows = [];
    if (data.moduleVersion) rows.push(['Modul', data.moduleVersion]);
    if (data.reason) rows.push(['Grund', explainReason(data.reason)]);
    if (data.recommendation) rows.push(['Empfehlung', data.recommendation]);
    if (data.status) rows.push(['Status', data.status]);
    if (data.live !== undefined) rows.push(['Live', boolText(data.live)]);
    if (data.enabled !== undefined) rows.push(['Aktiv', boolText(data.enabled)]);
    if (data.stale !== undefined) rows.push(['Veraltet', boolText(data.stale)]);
    if (data.sceneGate) rows.push(['Scene-Gate', data.sceneGate.active ? 'blockiert' : 'frei']);
    if (data.scopes) rows.push(['Scopes', Array.isArray(data.scopes) ? data.scopes.join(', ') : String(data.scopes)]);
    if (data.requiredScopes) rows.push(['Benötigt', Array.isArray(data.requiredScopes) ? data.requiredScopes.join(', ') : String(data.requiredScopes)]);
    if (!rows.length) return '';
    return `<section class="so2-panel so2-diag-detail">
      <div class="so2-section-title"><div><h3>${esc(title)}</h3></div></div>
      <div class="so2-kv-list">${rows.map(([k,v]) => `<div><span>${esc(k)}</span><strong>${esc(v || '-')}</strong></div>`).join('')}</div>
    </section>`;
  }

  function renderSceneGateDetails(value){
    const data = value || {};
    const rows = [
      ['Überwachung aktiv', boolText(data.enabled === true)],
      ['Start-Szene blockiert gerade', data.active === true ? 'ja' : 'nein'],
      ['Blockieren während Start-Szene', boolText(data.blockDuringStartScene !== false)],
      ['Aktuelle Szene', data.currentScene || '-'],
      ['Grund', explainReason(data.reason || (data.active === true ? 'start_scene_active' : 'frei'))],
      ['OBS verbunden', boolText(data.obsConnected === true)],
      ['OBS erkannt', boolText(data.obsDetected === true)]
    ];
    if (data.retryMs !== undefined) rows.push(['Retry', `${Math.round(Number(data.retryMs || 0) / 1000)} Sek.`]);
    if (Array.isArray(data.startSceneNames) && data.startSceneNames.length) rows.push(['Start-Szenen', data.startSceneNames.join(', ')]);
    if (data.lastError) rows.push(['Fehler', data.lastError]);

    return `<section class="so2-panel so2-diag-detail">
      <div class="so2-section-title"><div><h3>Start-Szene / Scene-Gate</h3></div>${badge(data.active === true ? 'blockiert' : 'frei', data.active === true ? 'warn' : 'ok')}</div>
      <div class="so2-kv-list">${rows.map(([k,v]) => `<div><span>${esc(k)}</span><strong>${esc(v || '-')}</strong></div>`).join('')}</div>
    </section>`;
  }

  function renderDiagnosticsResult(result){
    if (!result) return '';
    const ok = result.ok !== false;
    const text = result.message || result.error || (ok ? 'Diagnose-Aktion ausgeführt.' : 'Diagnose-Aktion fehlgeschlagen.');
    return `<div class="so2-alert ${ok ? 'so2-alert-ok' : 'so2-alert-error'}">${esc(text)}</div>`;
  }

  function renderDiagnostics(){
    const production = state.productionCheck || {};
    const live = state.liveTest || {};
    const decision = state.decisionPrep || {};
    const auth = state.officialAuthStatus || {};
    const scene = state.sceneGate || {};
    const result = state.diagnosticsResult || null;

    return `
      <section class="so2-ops-head">
        <div class="so2-grid so2-grid-4">
          ${renderDiagCard('Produktionscheck', production, 'OAuth, Scopes, EventSub und Grundzustand.')}
          ${renderDiagCard('Live-Test', live, 'Entscheidung für Live-/Wartezustand.')}
          ${renderDiagCard('Twitch Auth', auth, 'User-Token und Shoutout-Scopes.')}
          ${renderDiagCard('Start-Szene', scene, 'Scene-Gate für Shoutout-Worker.')}
        </div>
        ${renderDiagnosticsResult(result)}
      </section>

      <div class="so2-two">
        ${renderDiagDetails('Produktionscheck Details', production) || '<section class="so2-panel"><h3>Produktionscheck Details</h3><div class="so2-empty">Keine Detaildaten geladen.</div></section>'}
        ${renderDiagDetails('Live-Test / Decision Prep', decision.ok === false ? live : decision) || '<section class="so2-panel"><h3>Live-Test / Decision Prep</h3><div class="so2-empty">Keine Detaildaten geladen.</div></section>'}
      </div>

      <div class="so2-two">
        ${renderDiagDetails('Twitch Auth / Scopes', auth) || '<section class="so2-panel"><h3>Twitch Auth / Scopes</h3><div class="so2-empty">Keine Detaildaten geladen.</div></section>'}
        ${renderSceneGateDetails(pick(scene, ['sceneGate'], scene))}
      </div>

      <section class="so2-panel">
        <div class="so2-section-title">
          <div>
            <h3>Shoutout-Testdaten</h3>
          </div>
          ${badge('Diagnose', 'warn')}
        </div>
        <div class="so2-diag-actions">
          <button type="button" data-so2-inbound-debug="incoming">Inbound-Testevent</button>
          <button type="button" data-so2-inbound-debug="outgoing">Outbound-Testevent</button>
          <button type="button" data-so2-refresh>Neu prüfen</button>
        </div>
        <div class="so2-note">
          <strong>Hinweis:</strong>
          <span>Diese Buttons schreiben Debug-Shoutout-Events über die bestätigte Diagnose-Route. Für normale Bedienung nicht nötig.</span>
        </div>
      </section>
    `;
  }


  function settingsData(){
    return pick(state.settings || {}, ['settings'], state.settings || {});
  }

  function autoSettingsData(){
    return pick(state.autoSettings || {}, ['settings'], pick(settingsData(), ['autoShoutout'], {}));
  }

  function settingValue(value){
    if (value === true || value === false) return boolText(value);
    if (Array.isArray(value)) {
      if (!value.length) return '-';
      const clean = value.map(v => String(v || '').trim()).filter(Boolean);
      return clean.length > 6 ? `${clean.slice(0, 6).join(', ')} … (+${clean.length - 6})` : clean.join(', ');
    }
    if (value && typeof value === 'object') {
      const keys = Object.keys(value);
      if (!keys.length) return '-';
      return keys.slice(0, 6).map(k => `${k}: ${settingValue(value[k])}`).join(' · ') + (keys.length > 6 ? ` … (+${keys.length - 6})` : '');
    }
    if (value === undefined || value === null || value === '') return '-';
    return String(value);
  }

  function settingsStatusData(){
    return state.status || {};
  }

  function settingsCommandInfo(){
    const status = settingsStatusData();
    const triggers = asArray(status.effectiveCommandTriggers || []).map(cleanChannelInput).filter(Boolean);
    const rows = asArray(pick(status, ['directIntake.rows'], []));
    const command = cleanChannelInput(status.command || pick(rows[0] || {}, ['trigger'], '')) || 'so';
    return {
      command,
      aliases: triggers.filter(t => t && t !== command),
      triggers,
      directIntake: pick(status, ['directIntake'], {})
    };
  }

  function boolAttr(value){ return value === true ? 'checked' : ''; }
  function numValue(value, fallback = 0){ const n = Number(value); return Number.isFinite(n) ? n : fallback; }
  function csvValue(value){ return Array.isArray(value) ? value.join(', ') : String(value || ''); }
  function fieldSelector(name){ return `[data-so2-setting="${name}"]`; }
  function fieldValue(name, fallback = ''){ const el = root?.querySelector(fieldSelector(name)); return el ? el.value : fallback; }
  function fieldChecked(name, fallback = false){ const el = root?.querySelector(fieldSelector(name)); return el ? el.checked === true : fallback; }
  function fieldNumber(name, fallback = 0){ const n = Number(fieldValue(name, fallback)); return Number.isFinite(n) ? n : fallback; }
  function fieldCsv(name){ return String(fieldValue(name, '')).split(/[,\n;]/).map(v => v.trim()).filter(Boolean); }


  const SETTINGS_HELP = {
    enabled: 'Schaltet das gesamte Shoutout-Modul ein oder aus. Wenn aus, verarbeitet das Modul keine neuen Shoutouts.',
    'directIntake.enabled': 'Not-Aus für die direkte Chat-Erkennung. Wenn aus, werden !so/!vso nicht mehr direkt aus Twitch-Presence verarbeitet. Die Commands selbst bleiben im Commands-Dashboard erhalten.',
    randomPick: 'Wählt aus passenden Twitch-Clips zufällig einen Clip, statt immer den ersten/besten Treffer zu nehmen.',
    avoidRecentClips: 'Verhindert, dass sehr kürzlich genutzte Clips direkt wieder ausgewählt werden.',
    recentClipFallbackWhenAllBlocked: 'Wenn alle gefundenen Clips durch den Recent-Schutz blockiert sind, darf trotzdem ein Fallback-Clip gewählt werden.',
    allowLongerClipFallback: 'Erlaubt als Notlösung auch längere Clips, wenn kein passender Clip innerhalb der normalen Maximaldauer gefunden wird.',
    maxClipDurationSeconds: 'Normale maximale Clip-Länge für Shoutout-Clips in Sekunden.',
    fallbackMaxClipDurationSeconds: 'Maximale Clip-Länge für Fallback-Clips, wenn kein normal passender Clip gefunden wird.',
    clipLookbackDays: 'Wie viele Tage zurück Twitch-Clips bevorzugt gesucht werden. 365 bedeutet ungefähr ein Jahr.',
    clipSearchRangesDays: 'Suchstufen für Twitch-Clips. Das System probiert diese Bereiche nacheinander; 0 bedeutet ohne Zeitlimit.',
    clipPlaybackCandidateLimit: 'Wie viele passende Clip-Kandidaten intern gesammelt werden, bevor einer ausgewählt wird.',
    clipFetchFirst: 'Wie viele Clips pro Twitch-API-Anfrage geladen werden.',
    clipFetchPages: 'Wie viele Twitch-API-Seiten maximal abgefragt werden.',

    'displayQueue.enabled': 'Schaltet die Overlay-/Video-Shoutout-Warteschlange ein oder aus.',
    'displayQueue.sendChatMessages': 'Sendet Chatmeldungen, wenn ein Shoutout angenommen wird oder warten muss.',
    'displayQueue.displayCooldownMs': 'Pause nach einem angezeigten Overlay-Shoutout, bevor der nächste starten darf.',
    'displayQueue.workerIntervalMs': 'Wie oft der Worker prüft, ob ein Overlay-Shoutout gestartet werden kann.',

    'officialShoutout.enabled': 'Schaltet die Warteschlange für offizielle Twitch-Shoutouts ein oder aus.',
    'officialShoutout.enqueueAfterDisplay': 'Reiht den offiziellen Twitch-Shoutout erst nach dem Overlay-/Clip-Shoutout ein.',
    'officialShoutout.liveGateEnabled': 'Prüft vor offiziellen Twitch-Shoutouts, ob der Stream live ist. Wenn nicht live, bleibt der Eintrag in der Warteschlange.',
    'officialShoutout.globalCooldownMs': 'Globale Wartezeit zwischen zwei offiziellen Twitch-Shoutouts.',
    'officialShoutout.targetCooldownMs': 'Wartezeit pro Zielkanal, bevor derselbe Kanal erneut offiziell geshoutoutet werden darf.',
    'officialShoutout.workerIntervalMs': 'Wie oft der OfficialQueue-Worker prüft, ob ein offizieller Twitch-Shoutout ausgeführt werden kann.',
    'officialShoutout.liveGateRetryMs': 'Wartezeit bis zum nächsten Versuch, wenn der offizielle Shoutout wegen Live-Gate noch nicht ausgeführt werden darf.',
    'officialShoutout.maxAttempts': 'Maximale Anzahl technischer Sendeversuche für einen offiziellen Twitch-Shoutout.',
    'officialShoutout.displayFinishPaddingMs': 'Zusätzliche Pause nach dem Overlay-Ende, bevor der offizielle Twitch-Shoutout versucht wird.',

    'streamDayLimit.enabled': 'Verhindert mehrere normale Shoutouts für denselben Zielkanal am selben Streamtag.',
    'streamDayLimit.allowOverride': 'Erlaubt Ausnahmen per Override-Flag, z. B. --force.',
    'streamDayLimit.fallbackWhenStreamUnknown': 'Wenn der aktuelle Streamtag nicht sicher erkannt wird, nutzt das System eine Fallback-Session.',
    'streamDayLimit.overrideFlag': 'Chat-Flag, mit dem Mods/Owner die Streamtag-Sperre bewusst übergehen können.',
    'streamDayLimit.restartGraceMs': 'Zeitfenster nach Neustart, in dem der letzte Streamtag weiterverwendet werden kann.',
    'streamDayLimit.fallbackSessionHours': 'Laufzeit der Fallback-Session, wenn kein echter Streamtag erkannt wird.',
    'streamDayLimit.liveStateFiles': 'Dateien, aus denen das System Live-/Streamstatus-Daten lesen darf.',

    'streamStatus.enabled': 'Aktiviert die Nutzung des zentralen Streamstatus-Systems.',
    'streamStatus.preferCentralStatus': 'Wenn aktiv, wird der zentrale Streamstatus gegenüber lokalen Fallbacks bevorzugt.',
    'autoShoutout.sceneGate.enabled': 'Aktiviert die Start-Szenen-Prüfung für AutoShoutout und Queue-Verarbeitung.',
    'autoShoutout.sceneGate.blockDuringStartScene': 'Blockiert Shoutouts während definierter Start-Szenen und versucht sie später erneut.',
    'autoShoutout.sceneGate.retryMs': 'Wartezeit bis zur erneuten Prüfung, wenn eine Start-Szene gerade blockiert.',
    'autoShoutout.sceneGate.startSceneNames': 'OBS-Szenennamen, die als Start-Szenen gelten und Shoutouts blockieren sollen.',

    'autoShoutout.enabled': 'Schaltet automatische Shoutouts für konfigurierte Streamer ein oder aus.',
    'autoShoutout.onlyWhenLive': 'AutoShoutouts werden nur ausgelöst, wenn dein Stream live ist.',
    'autoShoutout.triggerOnFirstMessageOnly': 'Begrenzt AutoShoutout auf den ersten Kontakt/Streamtag. Die erste Nachricht zählt trotzdem als Nachricht 1; weitere Nachrichten können die Mindestanzahl erfüllen.',
    'autoShoutout.greetingEnabled': 'Aktiviert Begrüßungstexte für AutoShoutout-Streamer.',
    'autoShoutout.greetingOnlyWhenTriggering': 'Begrüßung wird nur gesendet, wenn dadurch auch ein AutoShoutout ausgelöst wird.',
    'autoShoutout.respectStreamDayLimit': 'AutoShoutouts beachten die Streamtag-Sperre wie manuelle Shoutouts.',
    'autoShoutout.sendChatMessage': 'Sendet Chatmeldung bei AutoShoutout-Queue-Einträgen.',
    'autoShoutout.storeSkippedEvents': 'Speichert übersprungene AutoShoutout-Events für spätere Auswertung/Diagnose.',
    'autoShoutout.suppressImmediateQueuedMessage': 'Unterdrückt Queue-Meldungen, wenn der Shoutout fast sofort starten würde.',
    'autoShoutout.minMessagesBeforeTrigger': 'Anzahl erkannter Nachrichten bis zum AutoShoutout. Die erste Nachricht zählt mit; bei 3 sind also noch zwei weitere nötig.',
    'autoShoutout.instantTriggerMessagesEnabled': 'Aktiviert Sofort-Auslöser wie !lurk. Diese Nachrichten können AutoShoutout direkt prüfen, auch wenn sonst mehrere Nachrichten nötig sind.',
    'autoShoutout.instantTriggerBypassMinMessages': 'Wenn aktiv, umgehen Sofort-Auslöser die Mindestnachrichten. Die Nachricht wird trotzdem als Aktivität gezählt.',
    'autoShoutout.instantTriggerMessages': 'Liste von Nachrichten oder ersten Worten, die sofort auslösen dürfen, z. B. !lurk, !lurke oder lurk.',
    'autoShoutout.messageWindowMs': 'Zeitfenster, in dem Nachrichten für AutoShoutout gezählt werden.',
    'autoShoutout.globalCooldownMs': 'Globale Wartezeit zwischen AutoShoutouts.',
    'autoShoutout.perStreamerCooldownMs': 'Wartezeit pro Streamer, bevor AutoShoutout erneut auslösen darf.',
    'autoShoutout.immediateQueuedMessageThresholdMs': 'Wenn die erwartete Wartezeit kleiner ist, wird die sofortige Queue-Meldung unterdrückt.'
  };

  function settingHelp(name, fallback = ''){
    return SETTINGS_HELP[name] || fallback || '';
  }

  function helpDot(text){
    const value = String(text || '').trim();
    if (!value) return '';
    return `<span class="so2-help-dot" tabindex="0" aria-label="${esc(value)}" data-so2-tooltip="${esc(value)}">?</span>`;
  }

  function settingsCheck(name, label, checked, helpText = ''){
    const help = settingHelp(name, helpText);
    return `<label class="so2-setting-check" title="${esc(help)}"><input type="checkbox" data-so2-setting="${esc(name)}" ${boolAttr(checked)}><span><strong>${esc(label)}${helpDot(help)}</strong>${help ? `<small>${esc(help)}</small>` : ''}</span></label>`;
  }

  function settingsInput(name, label, value, type = 'text', helpText = '', attrs = ''){
    const help = settingHelp(name, helpText);
    return `<label class="so2-field so2-setting-field" title="${esc(help)}"><span>${esc(label)}${helpDot(help)}</span><input type="${esc(type)}" data-so2-setting="${esc(name)}" value="${esc(value ?? '')}" ${attrs}>${help ? `<small>${esc(help)}</small>` : ''}</label>`;
  }

  function renderSettingsPanel(title, body, badgeText = 'editierbar'){
    return `<section class="so2-panel so2-settings-panel">
      <div class="so2-section-title"><div><h3>${esc(title)}</h3></div>${badge(badgeText, badgeText === 'read-only' ? 'neutral' : 'ok')}</div>
      <div class="so2-settings-grid">${body}</div>
    </section>`;
  }

  function renderSettingsInfoPanel(title, rows){
    return `<section class="so2-panel so2-settings-panel">
      <div class="so2-section-title"><div><h3>${esc(title)}</h3></div>${badge('Info', 'neutral')}</div>
      <div class="so2-kv-list">${rows.map(([label, value]) => `<div><span>${esc(label)}</span><strong>${esc(settingValue(value))}</strong></div>`).join('')}</div>
    </section>`;
  }

  function renderSettingsError(source){
    if (!source || source.ok !== false) return '';
    return `<div class="so2-alert so2-alert-error">${esc(source.error || 'Einstellungen konnten nicht geladen werden.')}</div>`;
  }

  function renderSettingsResult(){
    const result = state.settingsResult || null;
    if (!result) return '';
    const ok = result.ok !== false;
    return `<div class="so2-alert ${ok ? 'so2-alert-ok' : 'so2-alert-error'}">${esc(result.message || result.error || (ok ? 'Einstellungen gespeichert.' : 'Einstellungen konnten nicht gespeichert werden.'))}</div>`;
  }

  function renderSettings(){
    const cfg = settingsData();
    const auto = autoSettingsData();
    const status = settingsStatusData();
    const commandInfo = settingsCommandInfo();
    const display = pick(cfg, ['displayQueue'], {});
    const official = pick(cfg, ['officialShoutout'], {});
    const streamDay = pick(cfg, ['streamDayLimit'], {});
    const streamStatusCfg = pick(cfg, ['streamStatus'], {});
    const direct = pick(cfg, ['directIntake'], pick(status, ['directIntake'], {}));
    const sceneCfg = pick(auto, ['sceneGate'], {});
    const sceneState = pick(state.sceneGate || {}, ['sceneGate'], {});
    const triggerText = commandInfo.triggers.length ? commandInfo.triggers.map(t => `!${t}`).join(', ') : '-';

    return `
      <div class="so2-settings-clean">
        <section class="so2-settings-toolbar">
          <div class="so2-settings-toolbar-main">
            <div>
              <span class="so2-settings-eyebrow">Shoutout-Config</span>
              <strong>${esc(cfg.enabled !== false ? 'aktiv' : 'inaktiv')}</strong>
              <small>Command ${esc(`!${commandInfo.command}`)} · Trigger ${esc(triggerText)} · Quelle ${esc(pick(commandInfo.directIntake, ['source'], 'command_definitions'))}</small>
            </div>
            <div class="so2-settings-toolbar-badges">
              ${badge(direct.enabled !== false ? 'Direct-Intake an' : 'Direct-Intake aus', direct.enabled !== false ? 'ok' : 'warn')}
              ${badge(`Modul ${esc(pick(status, ['moduleVersion','version'], '-'))}`, 'neutral')}
            </div>
          </div>
          <div class="so2-settings-toolbar-actions">
            <button type="button" class="so2-primary-action" data-so2-settings-save>Config speichern</button>
            <button type="button" data-so2-settings-reset>Neu laden / verwerfen</button>
          </div>
        </section>

        ${renderSettingsError(state.settings)}
        ${renderSettingsError(state.autoSettings)}
        ${renderSettingsResult()}

        <details class="so2-panel so2-settings-details">
          <summary><strong>Command-Zuordnung</strong><span>Commands werden im Commands-Dashboard gepflegt</span></summary>
          <div class="so2-settings-info-grid">
            <div><span>Hauptcommand</span><strong>${esc(`!${commandInfo.command}`)}</strong></div>
            <div><span>Aliase</span><strong>${esc(settingValue(commandInfo.aliases.map(t => `!${t}`)))}</strong></div>
            <div><span>Alle Trigger</span><strong>${esc(settingValue(commandInfo.triggers.map(t => `!${t}`)))}</strong></div>
            <div><span>Quelle</span><strong>${esc(pick(commandInfo.directIntake, ['source'], '-'))}</strong></div>
            <div><span>Command-Zeilen</span><strong>${esc(pick(commandInfo.directIntake, ['commandDefinitionCount'], '-'))}</strong></div>
            <div><span>Fallback genutzt</span><strong>${esc(boolText(pick(commandInfo.directIntake, ['fallbackUsed'], false)))}</strong></div>
          </div>
        </details>

        <div class="so2-settings-layout">
          ${renderSettingsPanel('Basis & Clip-Suche', `
            ${settingsCheck('enabled', 'Shoutout-System aktiv', cfg.enabled !== false)}
            ${settingsCheck('directIntake.enabled', 'Direct-Intake aktiv', direct.enabled !== false, 'Erkennt !so/!vso direkt aus dem Chat. Trigger kommen aus Commands.')}
            ${settingsCheck('randomPick', 'Zufälligen Clip wählen', cfg.randomPick !== false)}
            ${settingsCheck('avoidRecentClips', 'Recent-Clip-Schutz', cfg.avoidRecentClips !== false)}
            ${settingsCheck('recentClipFallbackWhenAllBlocked', 'Fallback wenn alle Clips blockiert', cfg.recentClipFallbackWhenAllBlocked !== false)}
            ${settingsCheck('allowLongerClipFallback', 'Längeren Fallback-Clip erlauben', cfg.allowLongerClipFallback !== false)}
            ${settingsInput('maxClipDurationSeconds', 'Max. Clipdauer', numValue(cfg.maxClipDurationSeconds, 30), 'number', 'Sekunden', 'min="5" step="1"')}
            ${settingsInput('fallbackMaxClipDurationSeconds', 'Fallback max. Clipdauer', numValue(cfg.fallbackMaxClipDurationSeconds, 60), 'number', 'Sekunden', 'min="5" step="1"')}
            ${settingsInput('clipLookbackDays', 'Clip-Lookback', numValue(cfg.clipLookbackDays, 90), 'number', 'Tage', 'min="0" step="1"')}
            ${settingsInput('clipSearchRangesDays', 'Clip-Suchbereiche', csvValue(cfg.clipSearchRangesDays || []), 'text', 'Kommagetrennt, z. B. 90, 365, 730, 1095, 0')}
            ${settingsInput('clipPlaybackCandidateLimit', 'Clip-Kandidaten', numValue(cfg.clipPlaybackCandidateLimit, 8), 'number', 'Anzahl', 'min="1" step="1"')}
            ${settingsInput('clipFetchFirst', 'Twitch Fetch First', numValue(cfg.clipFetchFirst, 20), 'number', 'Anzahl pro Anfrage', 'min="1" step="1"')}
            ${settingsInput('clipFetchPages', 'Twitch Fetch Pages', numValue(cfg.clipFetchPages, 3), 'number', 'Seiten', 'min="1" step="1"')}
          `)}

          ${renderSettingsPanel('Overlay / Display-Queue', `
            ${settingsCheck('displayQueue.enabled', 'Display-Queue aktiv', display.enabled !== false)}
            ${settingsCheck('displayQueue.sendChatMessages', 'Chatmeldungen senden', display.sendChatMessages !== false)}
            ${settingsInput('displayQueue.displayCooldownMs', 'Cooldown nach Anzeige', numValue(display.displayCooldownMs, 120000), 'number', 'Millisekunden', 'min="0" step="1000"')}
            ${settingsInput('displayQueue.workerIntervalMs', 'Worker-Intervall', numValue(display.workerIntervalMs, 3000), 'number', 'Millisekunden', 'min="1000" step="1000"')}
          `)}

          ${renderSettingsPanel('Offizieller Twitch-Shoutout', `
            ${settingsCheck('officialShoutout.enabled', 'OfficialQueue aktiv', official.enabled !== false)}
            ${settingsCheck('officialShoutout.enqueueAfterDisplay', 'Nach Overlay einreihen', official.enqueueAfterDisplay !== false)}
            ${settingsCheck('officialShoutout.liveGateEnabled', 'Live-Gate aktiv', official.liveGateEnabled !== false)}
            ${settingsInput('officialShoutout.globalCooldownMs', 'Globaler Cooldown', numValue(official.globalCooldownMs, 120000), 'number', 'Millisekunden', 'min="0" step="1000"')}
            ${settingsInput('officialShoutout.targetCooldownMs', 'Kanal-Cooldown', numValue(official.targetCooldownMs, 3600000), 'number', 'Millisekunden', 'min="0" step="60000"')}
            ${settingsInput('officialShoutout.workerIntervalMs', 'Worker-Intervall', numValue(official.workerIntervalMs, 5000), 'number', 'Millisekunden', 'min="1000" step="1000"')}
            ${settingsInput('officialShoutout.liveGateRetryMs', 'Live-Gate Retry', numValue(official.liveGateRetryMs || official.streamWaitRetryMs, 120000), 'number', 'Millisekunden', 'min="1000" step="1000"')}
            ${settingsInput('officialShoutout.maxAttempts', 'Max. Versuche', numValue(official.maxAttempts, 5), 'number', 'Anzahl', 'min="1" step="1"')}
            ${settingsInput('officialShoutout.displayFinishPaddingMs', 'Padding nach Overlay-Ende', numValue(official.displayFinishPaddingMs, 1500), 'number', 'Millisekunden', 'min="0" step="500"')}
          `)}

          ${renderSettingsPanel('Stream-Regeln', `
            ${settingsCheck('streamDayLimit.enabled', 'Streamtag-Sperre aktiv', streamDay.enabled !== false)}
            ${settingsCheck('streamDayLimit.allowOverride', 'Override erlauben', streamDay.allowOverride !== false)}
            ${settingsCheck('streamDayLimit.fallbackWhenStreamUnknown', 'Fallback bei unbekanntem Stream', streamDay.fallbackWhenStreamUnknown !== false)}
            ${settingsInput('streamDayLimit.overrideFlag', 'Override-Flag', streamDay.overrideFlag || '--force', 'text')}
            ${settingsInput('streamDayLimit.restartGraceMs', 'Restart-Grace', numValue(streamDay.restartGraceMs, 1800000), 'number', 'Millisekunden', 'min="0" step="60000"')}
            ${settingsInput('streamDayLimit.fallbackSessionHours', 'Fallback-Session', numValue(streamDay.fallbackSessionHours, 12), 'number', 'Stunden', 'min="1" step="1"')}
            ${settingsInput('streamDayLimit.liveStateFiles', 'Live-State-Dateien', csvValue(streamDay.liveStateFiles || []), 'text', 'Kommagetrennt')}
          `)}

          ${renderSettingsPanel('Streamstatus / Start-Szene', `
            ${settingsCheck('streamStatus.enabled', 'Zentraler Streamstatus aktiv', streamStatusCfg.enabled !== false)}
            ${settingsCheck('streamStatus.preferCentralStatus', 'Zentralen Status bevorzugen', streamStatusCfg.preferCentralStatus !== false)}
            ${settingsCheck('autoShoutout.sceneGate.enabled', 'Scene-Gate aktiv', sceneCfg.enabled !== false)}
            ${settingsCheck('autoShoutout.sceneGate.blockDuringStartScene', 'Während Start-Szene blockieren', sceneCfg.blockDuringStartScene !== false)}
            ${settingsInput('autoShoutout.sceneGate.retryMs', 'Scene-Gate Retry', numValue(sceneCfg.retryMs, 15000), 'number', 'Millisekunden', 'min="1000" step="1000"')}
            ${settingsInput('autoShoutout.sceneGate.startSceneNames', 'Start-Szenen', csvValue(sceneCfg.startSceneNames || sceneState.startSceneNames || []), 'text', 'Kommagetrennt')}
            <div class="so2-setting-readonly"><span>Aktuelle Szene</span><strong>${esc(sceneState.currentScene || '-')}</strong></div>
            <div class="so2-setting-readonly"><span>Start-Szene aktiv</span><strong>${esc(boolText(sceneState.active === true))}</strong></div>
          `)}

          ${renderSettingsPanel('AutoShoutout', `
            ${settingsCheck('autoShoutout.enabled', 'AutoShoutout aktiv', auto.enabled === true)}
            ${settingsCheck('autoShoutout.onlyWhenLive', 'Nur wenn Stream live', auto.onlyWhenLive === true)}
            ${settingsCheck('autoShoutout.triggerOnFirstMessageOnly', 'Ersten Kontakt beachten', auto.triggerOnFirstMessageOnly !== false)}
            ${settingsCheck('autoShoutout.instantTriggerMessagesEnabled', 'Sofort-Auslöser aktiv', auto.instantTriggerMessagesEnabled !== false)}
            ${settingsCheck('autoShoutout.instantTriggerBypassMinMessages', 'Sofort-Auslöser umgehen Mindestnachrichten', auto.instantTriggerBypassMinMessages !== false)}
            ${settingsCheck('autoShoutout.greetingEnabled', 'Begrüßung aktiv', auto.greetingEnabled !== false)}
            ${settingsCheck('autoShoutout.greetingOnlyWhenTriggering', 'Begrüßung nur bei Trigger', auto.greetingOnlyWhenTriggering !== false)}
            ${settingsCheck('autoShoutout.respectStreamDayLimit', 'Streamtag-Sperre beachten', auto.respectStreamDayLimit !== false)}
            ${settingsCheck('autoShoutout.sendChatMessage', 'Chatmeldung senden', auto.sendChatMessage !== false)}
            ${settingsCheck('autoShoutout.storeSkippedEvents', 'Übersprungene Events speichern', auto.storeSkippedEvents === true)}
            ${settingsCheck('autoShoutout.suppressImmediateQueuedMessage', 'Sofort-Queue-Meldung unterdrücken', auto.suppressImmediateQueuedMessage !== false)}
            ${settingsInput('autoShoutout.minMessagesBeforeTrigger', 'Mindestnachrichten', numValue(auto.minMessagesBeforeTrigger, 3), 'number', 'Anzahl', 'min="1" step="1"')}
            ${settingsInput('autoShoutout.instantTriggerMessages', 'Sofort-Auslöser', csvValue(auto.instantTriggerMessages || ['!lurk', '!lurke', 'lurk']), 'text', 'Kommagetrennt, z. B. !lurk, !lurke, lurk')}
            ${settingsInput('autoShoutout.messageWindowMs', 'Nachrichtenfenster', numValue(auto.messageWindowMs, 1800000), 'number', 'Millisekunden', 'min="1000" step="1000"')}
            ${settingsInput('autoShoutout.globalCooldownMs', 'Globaler Cooldown', numValue(auto.globalCooldownMs, 120000), 'number', 'Millisekunden', 'min="0" step="1000"')}
            ${settingsInput('autoShoutout.perStreamerCooldownMs', 'Streamer-Cooldown', numValue(auto.perStreamerCooldownMs, 43200000), 'number', 'Millisekunden', 'min="0" step="60000"')}
            ${settingsInput('autoShoutout.immediateQueuedMessageThresholdMs', 'Queue-Meldungsschwelle', numValue(auto.immediateQueuedMessageThresholdMs, 10000), 'number', 'Millisekunden', 'min="0" step="1000"')}
          `)}

          <section class="so2-panel so2-settings-panel so2-settings-save-panel">
            <div class="so2-section-title"><div><h3>Speichern</h3></div>${badge('Config', 'ok')}</div>
            <div class="so2-note">
              <strong>Wichtig:</strong>
              <span>Command, Aliase, Rechte und Command-Cooldowns werden im Commands-Dashboard geändert. Diese Seite speichert nur die Shoutout-Modul-Config.</span>
            </div>
            <div class="so2-settings-actions">
              <button type="button" class="so2-primary-action" data-so2-settings-save>Config speichern</button>
              <button type="button" data-so2-settings-reset>Neu laden / verwerfen</button>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  function renderManualResult(result){
    if (!result) return '';
    const ok = result.ok !== false && !result.error;
    const target = result.target || result.targetLogin || result.login || state.manualTarget || '';
    const reason = explainReason(result.reason || result.status || result.state || '');
    return `
      <div class="so2-manual-result ${ok ? 'is-ok' : 'is-warn'}">
        <strong>${ok ? 'Aufgenommen' : 'Hinweis'}</strong>
        <span>${esc(target ? `Shoutout für ${target}.` : (ok ? 'Shoutout wurde verarbeitet.' : 'Aktion konnte nicht abgeschlossen werden.'))}</span>
        ${reason ? `<small>${esc(reason)}</small>` : ''}
      </div>
    `;
  }

  function metricCard(label, value, help){
    return `<article class="so2-metric"><small>${esc(label)}</small><strong>${esc(value ?? 0)}</strong><span>${esc(help || '')}</span></article>`;
  }

  function renderActivityPreview(items){
    const visible = asArray(items).slice(0, 5).map(normalizeActivity);
    if (!visible.length) {
      return `<div class="so2-empty">Noch keine Aktivität geladen. Sobald Shoutouts aufgenommen oder Events verarbeitet werden, erscheinen hier die letzten Einträge.</div>`;
    }
    return `<div class="so2-activity-list">${visible.map(item => `
      <div class="so2-activity-row">
        <span class="so2-dot so2-dot-${esc(item.tone)}"></span>
        <strong>${esc(item.title)}</strong>
        <span>${esc(item.meta || 'Aktivität')}</span>
      </div>
    `).join('')}</div>`;
  }

  function renderGateMini(){
    const stream = state.streamStatus || {};
    const live = pick(stream, ['live','isLive','data.live'], false);
    return `<div class="so2-gate-mini">${badge(live ? 'Stream live' : 'Stream offline', live ? 'ok' : 'warn')}<span>${live ? 'Offizielle Shoutouts können geprüft werden.' : 'Offizielle Shoutouts werden je nach Einstellung geparkt.'}</span></div>`;
  }

  function renderAutoResult(result){
    if (!result) return '';
    const ok = result.ok !== false;
    const text = result.message || result.error || pick(result, ['result.reason','result.error','results.0.error'], ok ? 'Aktion ausgeführt.' : 'Aktion fehlgeschlagen.');
    return `<div class="so2-alert ${ok ? 'so2-alert-ok' : 'so2-alert-error'}">${esc(text)}</div>`;
  }

  function renderAutoStreamerTable(streamers){
    const rows = asArray(streamers);
    if (!rows.length) {
      return `<div class="so2-empty">Noch keine AutoShoutout-Streamer gefunden.</div>`;
    }
    return `<div class="so2-table-wrap"><table class="so2-table">
      <thead><tr><th>Streamer</th><th>Status</th><th>Video</th><th>Twitch</th><th>Aktionen</th></tr></thead>
      <tbody>${rows.map(row => {
        const login = autoStreamerLogin(row);
        const display = autoStreamerDisplay(row);
        const active = row.active !== false && row.enabled !== false && row.disabled !== true;
        const video = row.videoShoutout !== false && row.video !== false && row.displayShoutout !== false;
        const official = row.officialShoutout !== false && row.twitchShoutout !== false && row.official !== false;
        return `<tr>
          <td><strong>@${esc(display)}</strong>${login && login !== String(display).toLowerCase() ? `<small>${esc(login)}</small>` : ''}</td>
          <td>${badge(active ? 'aktiv' : 'inaktiv', active ? 'ok' : 'warn')}</td>
          <td>${badge(video ? 'ja' : 'nein', video ? 'ok' : 'neutral')}</td>
          <td>${badge(official ? 'ja' : 'nein', official ? 'ok' : 'neutral')}</td>
          <td><div class="so2-row-actions">
            <button type="button" data-so2-auto-edit="${esc(login || display)}" data-so2-auto-display-value="${esc(display)}">Bearbeiten</button>
            <button type="button" data-so2-auto-test="${esc(login || display)}">Test</button>
            <button type="button" data-so2-auto-remove="${esc(login || display)}">Entfernen</button>
          </div></td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>`;
  }

  function renderAutoActivity(rows){
    const visible = asArray(rows).slice(0, 8).map(normalizeActivity);
    if (!visible.length) return `<div class="so2-empty">Noch keine AutoShoutout-Aktivität geladen.</div>`;
    return `<div class="so2-activity-list">${visible.map(item => `
      <div class="so2-activity-row">
        <span class="so2-dot so2-dot-${esc(item.tone)}"></span>
        <strong>${esc(item.title)}</strong>
        <span>${esc(item.meta || 'AutoShoutout')}</span>
      </div>
    `).join('')}</div>`;
  }

  function statusCard(label, value, badgeHtml, help){
    return `<article class="so2-card"><small>${esc(label)}</small><strong>${esc(value)}</strong><div>${badgeHtml}</div><p>${esc(help || '')}</p></article>`;
  }

  function queueItems(block){
    if (Array.isArray(block)) return block;
    return asArray(pick(block || {}, ['queue','items','rows'], []));
  }

  function queueItemLogin(item){
    return item?.targetLogin || item?.target_login || item?.login || item?.target || '';
  }

  function queueItemDisplay(item){
    return item?.targetDisplay || item?.target_display || item?.targetDisplayName || item?.displayName || queueItemLogin(item) || 'Eintrag';
  }

  function queueItemRequestedBy(item){
    return item?.requestedByDisplay || item?.requested_by_display || item?.requestedBy || item?.requested_by_login || '';
  }

  function queueItemAvailableAt(item){
    return item?.displayAvailableAt || item?.officialAvailableAt || item?.availableAt || item?.available_at || item?.nextAttemptAt || '';
  }

  function queueItemError(item){
    return item?.displayLastError || item?.officialError || item?.lastError || item?.last_error || item?.error || '';
  }

  function queueTone(status){
    const text = String(status || '').toLowerCase();
    if (text === 'active' || text === 'done' || text === 'sent') return 'ok';
    if (text === 'failed' || text === 'waiting') return 'warn';
    return 'neutral';
  }

  function queueStatusLabel(status){
    const text = String(status || '').toLowerCase();
    const map = {
      queued: 'wartet',
      waiting: 'wartet',
      active: 'läuft',
      done: 'fertig',
      sent: 'gesendet',
      failed: 'Fehler',
      removed: 'entfernt'
    };
    return map[text] || String(status || '-');
  }

  function renderQueueResult(result){
    if (!result) return '';
    const ok = result.ok !== false;
    const text = result.message || result.error || (ok ? 'Aktion ausgeführt.' : 'Aktion fehlgeschlagen.');
    return `<div class="so2-alert ${ok ? 'so2-alert-ok' : 'so2-alert-error'}">${esc(text)}</div>`;
  }

  function renderQueueTable(type, items, emptyText){
    const rows = asArray(items);
    if (!rows.length) return `<div class="so2-empty">${esc(emptyText)}</div>`;
    return `<div class="so2-table-wrap"><table class="so2-table so2-queue-table">
      <thead><tr><th>Ziel</th><th>Status</th><th>Verfügbar</th><th>Fehler</th><th>Aktionen</th></tr></thead>
      <tbody>${rows.map(item => {
        const id = Number(item.id || item.queueId || 0);
        const display = queueItemDisplay(item);
        const login = queueItemLogin(item);
        const requestedBy = queueItemRequestedBy(item);
        const status = item.status || item.state || 'wartet';
        const error = queueItemError(item);
        return `<tr>
          <td><strong>@${esc(display)}</strong>${login && login !== String(display).toLowerCase() ? `<small>${esc(login)}</small>` : ''}${requestedBy ? `<small>von ${esc(requestedBy)}</small>` : ''}</td>
          <td>${badge(queueStatusLabel(status), queueTone(status))}</td>
          <td>${esc(formatTime(queueItemAvailableAt(item)))}</td>
          <td>${esc(error || '-')}</td>
          <td><div class="so2-row-actions">
            <button type="button" data-so2-queue-retry="${esc(type)}:${esc(id)}" ${id ? '' : 'disabled'}>Erneut</button>
            <button type="button" data-so2-queue-remove="${esc(type)}:${esc(id)}" ${id ? '' : 'disabled'}>Entfernen</button>
          </div></td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>`;
  }

  function renderQueuePreview(items, emptyText){
    if (!items.length) return `<div class="so2-empty">${esc(emptyText)}</div>`;
    return `<div class="so2-list">${items.slice(0, 5).map(item => `<div class="so2-row"><strong>${esc(item.displayName || item.targetDisplayName || item.login || item.target || item.user || 'Eintrag')}</strong><span>${esc(item.status || item.state || 'wartet')}</span></div>`).join('')}</div>`;
  }

  function renderMiniList(items, emptyText){
    if (!items.length) return `<div class="so2-empty">${esc(emptyText)}</div>`;
    return `<div class="so2-list">${items.slice(0, 6).map(item => `<div class="so2-row"><strong>${esc(item.displayName || item.targetDisplayName || item.target || item.user || item.type || 'Eintrag')}</strong><span>${esc(item.status || item.createdAt || item.time || '')}</span></div>`).join('')}</div>`;
  }

  async function runManual(){
    const target = cleanChannelInput(root?.querySelector('[data-so2-target]')?.value);
    const force = root?.querySelector('[data-so2-force]')?.checked === true;
    state.manualTarget = target;
    state.manualForce = force;
    if (!target) {
      state.notice = '';
      state.error = 'Bitte einen Twitch-Kanal eintragen.';
      state.manualResult = null;
      render();
      return;
    }
    state.loading = true;
    state.error = '';
    state.notice = '';
    state.manualResult = null;
    render();
    try {
      const result = await api(API.run, { method: 'POST', body: JSON.stringify({ target, login: target, targetLogin: target, force, args: force ? ['--force'] : [] }) });
      state.manualResult = { ...(result && typeof result === 'object' ? result : {}), target, ok: result?.ok !== false };
      state.notice = '';
      await loadAll(true);
    } catch (err) {
      state.error = err.message || String(err);
      state.manualResult = { ok: false, target, error: state.error };
      state.loading = false;
      render();
    }
  }

  async function saveAutoStreamerAction(){
    const rawName = String(root?.querySelector('[data-so2-auto-target]')?.value || state.autoDisplayName || state.autoTarget || '').trim();
    const login = cleanChannelInput(rawName).toLowerCase();
    const displayName = rawName || login;
    const videoShoutout = root?.querySelector('[data-so2-auto-video]')?.checked !== false;
    const officialShoutout = root?.querySelector('[data-so2-auto-official]')?.checked !== false;

    state.autoTarget = login;
    state.autoDisplayName = displayName;
    state.autoVideo = videoShoutout;
    state.autoOfficial = officialShoutout;

    if (!login) {
      state.error = 'Bitte einen Streamer / Anzeigenamen eintragen.';
      render();
      return;
    }

    state.loading = true;
    state.error = '';
    state.notice = '';
    state.autoResult = null;
    render();

    try {
      const result = await api(API.autoStreamers, {
        method: 'POST',
        body: JSON.stringify({ login, displayName, active: true, enabled: true, videoShoutout, officialShoutout })
      });
      state.autoResult = { ok: result && result.ok !== false, message: `AutoShoutout-Streamer ${login} wurde gespeichert.` };
      state.autoTarget = '';
      state.autoDisplayName = '';
      await loadAll(true);
    } catch (err) {
      state.autoResult = { ok: false, error: err.message || String(err) };
      state.loading = false;
      render();
    }
  }

  async function testAutoStreamerAction(login){
    const target = cleanChannelInput(login || state.autoTarget);
    if (!target) {
      state.error = 'Bitte zuerst einen AutoShoutout-Streamer wählen oder eintragen.';
      render();
      return;
    }

    state.loading = true;
    state.error = '';
    state.notice = '';
    state.autoResult = null;
    render();

    try {
      const result = await api(API.autoTestChat, {
        method: 'POST',
        body: JSON.stringify({ login: target, target, dryRun: true })
      });
      state.autoResult = { ok: result && result.ok !== false, message: `AutoShoutout-Test für ${target} wurde ausgeführt.`, result };
      await loadAll(true);
    } catch (err) {
      state.autoResult = { ok: false, error: err.message || String(err) };
      state.loading = false;
      render();
    }
  }

  async function removeAutoStreamerAction(login){
    const target = cleanChannelInput(login || '');
    if (!target) {
      state.error = 'Dieser Streamer hat keinen gültigen Login.';
      render();
      return;
    }

    state.loading = true;
    state.error = '';
    state.notice = '';
    state.autoResult = null;
    render();

    try {
      const result = await api(API.autoStreamerRemove, {
        method: 'POST',
        body: JSON.stringify({ login: target })
      });
      state.autoResult = { ok: result && result.ok !== false, message: `AutoShoutout-Streamer ${target} wurde entfernt/deaktiviert.` };
      await loadAll(true);
    } catch (err) {
      state.autoResult = { ok: false, error: err.message || String(err) };
      state.loading = false;
      render();
    }
  }

  async function runQueueAction(kind, raw){
    const [type, idRaw] = String(raw || '').split(':');
    const id = Number(idRaw || 0);
    if (!id) {
      state.queueResult = { ok: false, error: 'Dieser Queue-Eintrag hat keine gültige ID.' };
      render();
      return;
    }

    const display = type === 'display';
    const endpoint = display
      ? (kind === 'remove' ? API.displayQueueRemove : API.displayQueueRetry)
      : (kind === 'remove' ? API.officialQueueRemove : API.officialQueueRetry);

    state.loading = true;
    state.error = '';
    state.notice = '';
    state.queueResult = null;
    render();

    try {
      const result = await api(endpoint, {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      const label = display ? 'Overlay-Queue' : 'Twitch-Queue';
      const actionText = kind === 'remove' ? 'entfernt' : 'erneut angestoßen';
      state.queueResult = { ok: result && result.ok !== false, message: `${label}: Eintrag #${id} wurde ${actionText}.` };
      await loadAll(true);
    } catch (err) {
      state.queueResult = { ok: false, error: err.message || String(err) };
      state.loading = false;
      render();
    }
  }

  function collectTextVariants(){
    return Array.from(root?.querySelectorAll('[data-so2-text-variant]') || [])
      .map(input => String(input.value || '').trim())
      .filter(Boolean);
  }

  async function saveTextKeyAction(){
    const row = selectedTextRow();
    if (!row) {
      state.textResult = { ok: false, error: 'Kein Textkey ausgewählt.' };
      render();
      return;
    }
    const variants = collectTextVariants();
    if (!variants.length) {
      state.textResult = { ok: false, error: 'Mindestens eine Textvariante ist erforderlich.' };
      render();
      return;
    }

    state.loading = true;
    state.error = '';
    state.notice = '';
    state.textResult = null;
    render();

    try {
      const result = await api(API.texts, {
        method: 'POST',
        body: JSON.stringify({
          action: 'replaceKeyVariants',
          key: row.key,
          category: row.category || state.textCategory || 'shoutout.system',
          variants
        })
      });
      state.textResult = { ok: result && result.ok !== false, message: `Textvarianten für ${row.key} gespeichert.` };
      await loadAll(true);
    } catch (err) {
      state.textResult = { ok: false, error: err.message || String(err) };
      state.loading = false;
      render();
    }
  }

  async function runInboundDebug(direction){
    const dir = String(direction || 'incoming') === 'outgoing' ? 'outgoing' : 'incoming';
    state.loading = true;
    state.error = '';
    state.notice = '';
    state.diagnosticsResult = null;
    render();

    try {
      const result = await api(API.inboundDebug, {
        method: 'POST',
        body: JSON.stringify({
          direction: dir,
          from: dir === 'incoming' ? 'testsender' : 'forrestcgn',
          to: dir === 'incoming' ? 'forrestcgn' : 'testziel',
          viewerCount: 1
        })
      });
      state.diagnosticsResult = { ok: result && result.ok !== false, message: `${dir === 'incoming' ? 'Inbound' : 'Outbound'}-Testevent wurde erzeugt.` };
      await loadAll(true);
    } catch (err) {
      state.diagnosticsResult = { ok: false, error: err.message || String(err) };
      state.loading = false;
      render();
    }
  }

  function buildSettingsPayload(){
    return {
      enabled: fieldChecked('enabled', true),
      directIntake: {
        enabled: fieldChecked('directIntake.enabled', true)
      },
      maxClipDurationSeconds: fieldNumber('maxClipDurationSeconds', 30),
      allowLongerClipFallback: fieldChecked('allowLongerClipFallback', true),
      fallbackMaxClipDurationSeconds: fieldNumber('fallbackMaxClipDurationSeconds', 60),
      clipLookbackDays: fieldNumber('clipLookbackDays', 90),
      clipSearchRangesDays: fieldCsv('clipSearchRangesDays').map(v => Number(v)).filter(v => Number.isFinite(v) && v >= 0),
      clipPlaybackCandidateLimit: fieldNumber('clipPlaybackCandidateLimit', 8),
      clipFetchFirst: fieldNumber('clipFetchFirst', 20),
      clipFetchPages: fieldNumber('clipFetchPages', 3),
      randomPick: fieldChecked('randomPick', true),
      avoidRecentClips: fieldChecked('avoidRecentClips', true),
      recentClipFallbackWhenAllBlocked: fieldChecked('recentClipFallbackWhenAllBlocked', true),
      displayQueue: {
        enabled: fieldChecked('displayQueue.enabled', true),
        sendChatMessages: fieldChecked('displayQueue.sendChatMessages', true),
        displayCooldownMs: fieldNumber('displayQueue.displayCooldownMs', 120000),
        workerIntervalMs: fieldNumber('displayQueue.workerIntervalMs', 3000)
      },
      officialShoutout: {
        enabled: fieldChecked('officialShoutout.enabled', true),
        enqueueAfterDisplay: fieldChecked('officialShoutout.enqueueAfterDisplay', true),
        liveGateEnabled: fieldChecked('officialShoutout.liveGateEnabled', true),
        globalCooldownMs: fieldNumber('officialShoutout.globalCooldownMs', 120000),
        targetCooldownMs: fieldNumber('officialShoutout.targetCooldownMs', 3600000),
        workerIntervalMs: fieldNumber('officialShoutout.workerIntervalMs', 5000),
        liveGateRetryMs: fieldNumber('officialShoutout.liveGateRetryMs', 120000),
        streamWaitRetryMs: fieldNumber('officialShoutout.liveGateRetryMs', 120000),
        maxAttempts: fieldNumber('officialShoutout.maxAttempts', 5),
        displayFinishPaddingMs: fieldNumber('officialShoutout.displayFinishPaddingMs', 1500)
      },
      streamDayLimit: {
        enabled: fieldChecked('streamDayLimit.enabled', true),
        allowOverride: fieldChecked('streamDayLimit.allowOverride', true),
        overrideFlag: fieldValue('streamDayLimit.overrideFlag', '--force') || '--force',
        restartGraceMs: fieldNumber('streamDayLimit.restartGraceMs', 1800000),
        fallbackWhenStreamUnknown: fieldChecked('streamDayLimit.fallbackWhenStreamUnknown', true),
        fallbackSessionHours: fieldNumber('streamDayLimit.fallbackSessionHours', 12),
        liveStateFiles: fieldCsv('streamDayLimit.liveStateFiles')
      },
      streamStatus: {
        enabled: fieldChecked('streamStatus.enabled', true),
        preferCentralStatus: fieldChecked('streamStatus.preferCentralStatus', true)
      },
      autoShoutout: {
        enabled: fieldChecked('autoShoutout.enabled', false),
        onlyWhenLive: fieldChecked('autoShoutout.onlyWhenLive', false),
        triggerOnFirstMessageOnly: fieldChecked('autoShoutout.triggerOnFirstMessageOnly', true),
        minMessagesBeforeTrigger: fieldNumber('autoShoutout.minMessagesBeforeTrigger', 3),
        instantTriggerMessagesEnabled: fieldChecked('autoShoutout.instantTriggerMessagesEnabled', true),
        instantTriggerBypassMinMessages: fieldChecked('autoShoutout.instantTriggerBypassMinMessages', true),
        instantTriggerMessages: fieldCsv('autoShoutout.instantTriggerMessages'),
        messageWindowMs: fieldNumber('autoShoutout.messageWindowMs', 1800000),
        greetingEnabled: fieldChecked('autoShoutout.greetingEnabled', true),
        greetingOnlyWhenTriggering: fieldChecked('autoShoutout.greetingOnlyWhenTriggering', true),
        respectStreamDayLimit: fieldChecked('autoShoutout.respectStreamDayLimit', true),
        globalCooldownMs: fieldNumber('autoShoutout.globalCooldownMs', 120000),
        perStreamerCooldownMs: fieldNumber('autoShoutout.perStreamerCooldownMs', 43200000),
        sendChatMessage: fieldChecked('autoShoutout.sendChatMessage', true),
        storeSkippedEvents: fieldChecked('autoShoutout.storeSkippedEvents', false),
        suppressImmediateQueuedMessage: fieldChecked('autoShoutout.suppressImmediateQueuedMessage', true),
        immediateQueuedMessageThresholdMs: fieldNumber('autoShoutout.immediateQueuedMessageThresholdMs', 10000),
        sceneGate: {
          enabled: fieldChecked('autoShoutout.sceneGate.enabled', true),
          blockDuringStartScene: fieldChecked('autoShoutout.sceneGate.blockDuringStartScene', true),
          startSceneNames: fieldCsv('autoShoutout.sceneGate.startSceneNames'),
          retryMs: fieldNumber('autoShoutout.sceneGate.retryMs', 15000)
        }
      }
    };
  }

  async function saveSettingsAction(){
    let payload = null;
    try {
      // Wichtig: Werte zuerst aus dem aktuellen DOM lesen.
      // Ein render() vor buildSettingsPayload() würde ungespeicherte Eingaben verwerfen.
      payload = buildSettingsPayload();
    } catch (err) {
      state.settingsResult = { ok: false, error: err.message || String(err) };
      state.loading = false;
      render();
      return;
    }

    state.loading = true;
    state.error = '';
    state.notice = '';
    state.settingsResult = null;
    render();
    try {
      const result = await api(API.settings, { method: 'POST', body: JSON.stringify(payload) });
      state.settingsResult = { ok: result && result.ok !== false, message: 'Shoutout-Config wurde gespeichert.' };
      await loadAll(true);
      state.settingsResult = { ok: true, message: 'Shoutout-Config wurde gespeichert.' };
      render();
    } catch (err) {
      state.settingsResult = { ok: false, error: err.message || String(err) };
      state.loading = false;
      render();
    }
  }

  function bind(){
    document.addEventListener('click', ev => {
      const tab = ev.target.closest('[data-so2-tab]');
      if (tab && root?.contains(tab)) {
        state.activeTab = tab.dataset.so2Tab || 'overview';
        state.notice = '';
        state.error = '';
        render();
        loadAll(true);
        return;
      }
      if (ev.target.closest('[data-so2-refresh]') && root?.contains(ev.target)) {
        loadAll(true);
        return;
      }
      if (ev.target.closest('[data-so2-run]') && root?.contains(ev.target)) {
        runManual();
        return;
      }

      if (ev.target.closest('[data-so2-settings-save]') && root?.contains(ev.target)) {
        saveSettingsAction();
        return;
      }

      if (ev.target.closest('[data-so2-settings-reset]') && root?.contains(ev.target)) {
        state.settingsResult = null;
        loadAll(true);
        return;
      }

      if (ev.target.closest('[data-so2-auto-save]') && root?.contains(ev.target)) {
        saveAutoStreamerAction();
        return;
      }

      const autoTest = ev.target.closest('[data-so2-auto-test]');
      if (autoTest && root?.contains(autoTest)) {
        testAutoStreamerAction(autoTest.dataset.so2AutoTest);
        return;
      }

      const autoEdit = ev.target.closest('[data-so2-auto-edit]');
      if (autoEdit && root?.contains(autoEdit)) {
        state.autoTarget = cleanChannelInput(autoEdit.dataset.so2AutoEdit || '').toLowerCase();
        state.autoDisplayName = autoEdit.dataset.so2AutoDisplayValue || autoEdit.dataset.so2AutoEdit || '';
        render();
        return;
      }

      const autoRemove = ev.target.closest('[data-so2-auto-remove]');
      if (autoRemove && root?.contains(autoRemove)) {
        removeAutoStreamerAction(autoRemove.dataset.so2AutoRemove);
        return;
      }

      const queueRetry = ev.target.closest('[data-so2-queue-retry]');
      if (queueRetry && root?.contains(queueRetry)) {
        runQueueAction('retry', queueRetry.dataset.so2QueueRetry);
        return;
      }

      const queueRemove = ev.target.closest('[data-so2-queue-remove]');
      if (queueRemove && root?.contains(queueRemove)) {
        runQueueAction('remove', queueRemove.dataset.so2QueueRemove);
        return;
      }

      if (ev.target.closest('[data-so2-text-reload]') && root?.contains(ev.target)) {
        state.textResult = null;
        loadAll(true);
        return;
      }

      if (ev.target.closest('[data-so2-text-save]') && root?.contains(ev.target)) {
        if (isOverlaySetsRow()) saveOverlaySetsAction();
        else saveTextKeyAction();
        return;
      }

      if (ev.target.closest('[data-so2-overlay-sets-save]') && root?.contains(ev.target)) {
        saveOverlaySetsAction();
        return;
      }

      if (ev.target.closest('[data-so2-overlay-sets-reload]') && root?.contains(ev.target)) {
        state.overlaySetsResult = null;
        state.textResult = null;
        loadAll(true);
        return;
      }

      if (ev.target.closest('[data-so2-overlay-set-add]') && root?.contains(ev.target)) {
        addOverlaySetCard();
        return;
      }

      const overlaySetRemove = ev.target.closest('[data-so2-overlay-set-remove]');
      if (overlaySetRemove && root?.contains(overlaySetRemove)) {
        const card = overlaySetRemove.closest('[data-so2-overlay-set-card]');
        if (card) card.remove();
        state.overlaySetsResult = { ok: true, message: 'Set entfernt. Speichern nicht vergessen.' };
        state.textResult = state.overlaySetsResult;
        render();
        return;
      }

      if (ev.target.closest('[data-so2-text-add-variant]') && root?.contains(ev.target)) {
        if (isOverlaySetsRow()) {
          addOverlaySetCard();
          return;
        }
        const list = root.querySelector('[data-so2-text-variants]');
        if (list) {
          const wrap = document.createElement('div');
          wrap.className = 'so2-text-variant-row';
          wrap.setAttribute('data-so2-text-variant-row', '');
          const index = list.querySelectorAll('[data-so2-text-variant]').length + 1;
          wrap.innerHTML = `<label class="so2-field"><span>Variante ${index}</span><textarea data-so2-text-variant rows="2" spellcheck="false"></textarea></label><button type="button" class="so2-icon-action" data-so2-text-remove-variant title="Variante entfernen">×</button>`;
          list.appendChild(wrap);
          const textarea = wrap.querySelector('textarea');
          if (textarea) textarea.focus();
        }
        return;
      }

      const removeVariant = ev.target.closest('[data-so2-text-remove-variant]');
      if (removeVariant && root?.contains(removeVariant)) {
        const rows = Array.from(root.querySelectorAll('[data-so2-text-variant-row]'));
        if (rows.length > 1) removeVariant.closest('[data-so2-text-variant-row]')?.remove();
        return;
      }

      const inboundDebug = ev.target.closest('[data-so2-inbound-debug]');
      if (inboundDebug && root?.contains(inboundDebug)) {
        runInboundDebug(inboundDebug.dataset.so2InboundDebug);
      }
    });

    document.addEventListener('input', ev => {
      if (!root?.contains(ev.target)) return;
      if (ev.target?.matches?.('[data-so2-target]')) state.manualTarget = cleanChannelInput(ev.target.value);
      if (ev.target?.matches?.('[data-so2-auto-target]')) {
        const rawName = String(ev.target.value || '').slice(0, 80);
        state.autoDisplayName = rawName;
        state.autoTarget = cleanChannelInput(rawName).toLowerCase();
      }
    });

    document.addEventListener('change', ev => {
      if (!root?.contains(ev.target)) return;
      if (ev.target?.matches?.('[data-so2-autorefresh]')) {
        state.autoRefresh = ev.target.checked === true;
        scheduleRefresh();
        return;
      }
      if (ev.target?.matches?.('[data-so2-force]')) state.manualForce = ev.target.checked === true;
      if (ev.target?.matches?.('[data-so2-auto-video]')) state.autoVideo = ev.target.checked === true;
      if (ev.target?.matches?.('[data-so2-auto-official]')) state.autoOfficial = ev.target.checked === true;
      if (ev.target?.matches?.('[data-so2-text-category]')) {
        state.textCategory = String(ev.target.value || '');
        state.textKey = '';
        ensureTextSelection();
        state.textResult = null;
        state.overlaySetsResult = null;
        render();
      }
      if (ev.target?.matches?.('[data-so2-text-key]')) {
        state.textKey = String(ev.target.value || '');
        state.textResult = null;
        state.overlaySetsResult = null;
        render();
      }
    });

    document.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' && ev.target?.matches?.('[data-so2-target]') && root?.contains(ev.target)) runManual();
      if (ev.key === 'Enter' && ev.target?.matches?.('[data-so2-auto-target]') && root?.contains(ev.target)) saveAutoStreamerAction();
    });
  }

  function init(){
    registerDashboardModule();
    root = document.getElementById('shoutoutV2Module');
    if (root) render();
    if (localStorage.getItem('cgn-dashboard-active-module') === 'shoutout_v2' && window.CGN?.setActiveModule) {
      window.CGN.setActiveModule('shoutout_v2', { initial: true });
    }
  }

  window.addEventListener('cgn:module-show', ev => {
    if (ev.detail?.module === 'shoutout_v2') loadAll(true);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  bind();

  return { init, loadAll, render };
})();
