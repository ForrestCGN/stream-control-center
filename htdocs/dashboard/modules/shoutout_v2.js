window.ShoutoutV2Module = (function(){
  'use strict';

  const MODULE_VERSION = '2.3.0-texts';
  const BUILD = 'CAN-44.21.8';

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
    textsMigration: '/api/clip-shoutout/texts/migration',
    autoTexts: '/api/clip-shoutout/auto/texts'
  };

  const TABS = [
    { id: 'overview', label: 'Übersicht', hint: 'Kurzstatus ohne doppelte Detailtabellen.' },
    { id: 'manual', label: 'Shoutout', hint: 'Manuell auslösen und Live-Gate kurz prüfen.' },
    { id: 'auto', label: 'AutoShoutout', hint: 'Betrieb und Streamer-Verwaltung. Keine Texte oder globale Config.' },
    { id: 'queues', label: 'Queues', hint: 'Warteschlangen und Aktionen.' },
    { id: 'texts', label: 'Texte', hint: 'Alle Chat- und Systemtexte an einem Ort.' },
    { id: 'analytics', label: 'Auswertung', hint: 'Statistik, Verlauf und eingehende Shoutouts.' },
    { id: 'diagnostics', label: 'Diagnose', hint: 'Nur Shoutout-spezifische Diagnose.' },
    { id: 'settings', label: 'Einstellungen', hint: 'Config strukturiert, zunächst read-only.' }
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
    textResult: null
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
      global_cooldown: 'Twitch erlaubt den nächsten offiziellen Shoutout erst später.'
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

    window.CGN.modules.shoutout_v2 = {
      title: 'Shoutout-System V2',
      panelId: 'shoutoutV2Module',
      group: 'community',
      overlayLink: '',
      reload(){ return window.ShoutoutV2Module?.loadAll?.(true); }
    };

    window.CGN.moduleCatalog.shoutout_v2 = {
      label: 'Shoutout V2',
      icon: '📣',
      enabled: true,
      description: 'Neues, aufgeräumtes Shoutout-Dashboard ohne alte UI-Blöcke.'
    };

    if (window.CGN.sections.community) {
      const items = Array.isArray(window.CGN.sections.community.items) ? window.CGN.sections.community.items : [];
      if (!items.includes('shoutout_v2')) {
        const after = items.indexOf('commands');
        if (after >= 0) items.splice(after + 1, 0, 'shoutout_v2');
        else items.push('shoutout_v2');
        window.CGN.sections.community.items = items;
      }
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
        const [productionCheck, liveTest] = await Promise.all([
          api(API.productionCheck).catch(err => ({ ok:false, error: err.message })),
          api(API.liveTest).catch(err => ({ ok:false, error: err.message }))
        ]);
        state.productionCheck = productionCheck;
        state.liveTest = liveTest;
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
        const [texts, migration, autoTexts] = await Promise.all([
          api(API.texts).catch(err => ({ ok:false, error: err.message })),
          api(API.textsMigration).catch(err => ({ ok:false, error: err.message })),
          api(API.autoTexts).catch(err => ({ ok:false, error: err.message }))
        ]);
        state.texts = texts;
        state.textsMigration = texts && texts.migration ? texts.migration : migration;
        state.autoTexts = autoTexts;
        ensureTextSelection();
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
              <span>Twitch-Name</span>
              <input type="text" data-so2-auto-target placeholder="z. B. urlug" autocomplete="off" value="${esc(state.autoTarget || '')}">
            </label>
            <label class="so2-field">
              <span>Anzeigename</span>
              <input type="text" data-so2-auto-display placeholder="optional" autocomplete="off" value="${esc(state.autoDisplayName || '')}">
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
    return asArray(pick(textRoot(), ['keys'], []));
  }

  function textCategoryLabel(id){
    const key = String(id || '');
    if (!key) return 'Alle Texte';
    if (key === 'auto_shoutout') return 'Legacy AutoShoutout';
    const found = textCategories().find(row => String(row.id || row.key || '') === key);
    return found ? String(found.label || found.id || key) : key;
  }

  function textRowsForCategory(category = state.textCategory){
    const rows = textKeys();
    if (!category) return rows;
    return rows.filter(row => String(row.category || '') === String(category || ''));
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
    const rows = textRowsForCategory();
    if (!rows.length) return `<option value="">Keine Textkeys</option>`;
    return rows.map(row => {
      const key = String(row.key || '');
      const active = row.activeCount ?? activeVariantValues(row).length;
      const total = row.totalCount ?? asArray(row.variants).length;
      return `<option value="${esc(key)}" ${state.textKey === key ? 'selected' : ''}>${esc(key)} · ${esc(active)}/${esc(total)} aktiv</option>`;
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
          </div>
          <div class="so2-text-variants" data-so2-text-variants>
            ${renderVariantInputs(row)}
          </div>
          <div class="so2-note">
            <strong>Platzhalter:</strong>
            <span><code>@{displayName}</code>, <code>@{login}</code>, <code>{login}</code>, <code>{waitTime}</code>, <code>{reason}</code></span>
          </div>
        ` : `<div class="so2-empty">Keine Textkeys geladen.</div>`}
      </section>

      ${renderTextMigrationInfo()}
    `;
  }


  function renderAnalytics(){
    const timeline = asArray(pick(state.timeline || {}, ['items','timeline','rows','events'], []));
    const inbound = asArray(pick(state.inbound || {}, ['items','events','rows'], []));
    return `
      <div class="so2-two">
        <section class="so2-panel"><h3>Statistik & Verlauf</h3><p>Hier kommen Zielkanäle, Auslöser und Timeline hin – ohne Queue-Aktionen.</p>${renderMiniList(timeline, 'Noch keine Verlaufsdaten geladen oder API-Struktur unbekannt.')}</section>
        <section class="so2-panel"><h3>Eingehende / erstellte Shoutouts</h3><p>Details zu Twitch-Shoutout-Events, nicht in der Übersicht doppeln.</p>${renderMiniList(inbound, 'Noch keine Eingangsereignisse geladen oder API-Struktur unbekannt.')}</section>
      </div>
    `;
  }

  function renderDiagnostics(){
    return `
      <section class="so2-panel">
        <h3>Shoutout-Diagnose</h3>
        <p>Nur Shoutout-spezifische Diagnose. Systemweite Diagnose bleibt in Admin &gt; Diagnose.</p>
        <div class="so2-grid so2-grid-3">
          ${statusCard('Produktionscheck', state.productionCheck ? 'geladen' : 'noch nicht geladen', badge('Shoutout', 'neutral'), 'OAuth, Scopes und EventSub nur für Shoutouts.')}
          ${statusCard('Live-Test', state.liveTest ? 'geladen' : 'noch nicht geladen', badge('Test', 'neutral'), 'Beobachtete Shoutout-Events und Empfehlungen.')}
          ${statusCard('Admin-Diagnose', 'nicht doppeln', badge('Abgrenzung', 'warn'), 'Globale Modul- und Registry-Diagnose bleibt im Admin-Bereich.')}
        </div>
      </section>
    `;
  }

  function renderSettings(){
    return `
      <section class="so2-panel">
        <h3>Einstellungen</h3>
        <p>V2 zeigt Config zunächst read-only. Editierbar wird es erst mit Backend-Speicherroute, Validierung und Audit-Logging.</p>
        <div class="so2-grid so2-grid-3">
          ${statusCard('Allgemein', 'read-only geplant', badge('Config', 'neutral'), 'Command, Aliases, Suchbereiche.')}
          ${statusCard('AutoShoutout', 'read-only geplant', badge('Config', 'neutral'), 'Mindestnachrichten, Zeitfenster, Cooldowns.')}
          ${statusCard('Start-Szene', 'read-only geplant', badge('Config', 'neutral'), 'Start-Szenen-Sperre und Retry.')}
        </div>
      </section>
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
          <td>${badge(status, queueTone(status))}</td>
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
    const login = cleanChannelInput(root?.querySelector('[data-so2-auto-target]')?.value || state.autoTarget);
    const displayName = String(root?.querySelector('[data-so2-auto-display]')?.value || state.autoDisplayName || '').trim();
    const videoShoutout = root?.querySelector('[data-so2-auto-video]')?.checked !== false;
    const officialShoutout = root?.querySelector('[data-so2-auto-official]')?.checked !== false;

    state.autoTarget = login;
    state.autoDisplayName = displayName;
    state.autoVideo = videoShoutout;
    state.autoOfficial = officialShoutout;

    if (!login) {
      state.error = 'Bitte einen Twitch-Namen eintragen.';
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
        state.autoTarget = cleanChannelInput(autoEdit.dataset.so2AutoEdit || '');
        state.autoDisplayName = autoEdit.dataset.so2AutoDisplayValue || '';
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
        saveTextKeyAction();
        return;
      }

      if (ev.target.closest('[data-so2-text-add-variant]') && root?.contains(ev.target)) {
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
      }
    });

    document.addEventListener('input', ev => {
      if (!root?.contains(ev.target)) return;
      if (ev.target?.matches?.('[data-so2-target]')) state.manualTarget = cleanChannelInput(ev.target.value);
      if (ev.target?.matches?.('[data-so2-auto-target]')) state.autoTarget = cleanChannelInput(ev.target.value);
      if (ev.target?.matches?.('[data-so2-auto-display]')) state.autoDisplayName = String(ev.target.value || '').slice(0, 80);
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
        render();
      }
      if (ev.target?.matches?.('[data-so2-text-key]')) {
        state.textKey = String(ev.target.value || '');
        state.textResult = null;
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
