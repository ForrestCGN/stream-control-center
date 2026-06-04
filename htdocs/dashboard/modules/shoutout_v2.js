window.ShoutoutV2Module = (function(){
  'use strict';

  const MODULE_VERSION = '2.0.4-manual-recovery';
  const BUILD = 'CAN-44.21.4.2';

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
    streamStatus: '/api/stream-status/status'
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
    manualResult: null
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
          ${renderActiveTab()}
        </div>
      </div>
    `;
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

        <aside class="so2-panel so2-manual-side">
          <h3>Was passiert?</h3>
          <div class="so2-decision-list">
            <div><strong>Overlay</strong><span>Der Shoutout wird in die Overlay-Warteschlange aufgenommen.</span></div>
            <div><strong>Twitch</strong><span>${live ? 'Offizielle Twitch-Shoutouts können direkt geprüft werden.' : 'Wenn Live-Pflicht aktiv ist, wartet der offizielle Twitch-Shoutout bis zum Livestatus.'}</span></div>
            <div><strong>Warteschlangen</strong><span>${displayOpen} Overlay · ${officialOpen} Twitch offen</span></div>
            <div><strong>Statusquelle</strong><span>${esc(source)}${stale ? ' · eventuell alt' : ''}</span></div>
          </div>
        </aside>
      </div>
    `;
  }

  function renderAuto(){
    return `
      <section class="so2-panel">
        <h3>AutoShoutout</h3>
        <p>Dieser Tab wird in V2 nur Betrieb und Streamer-Verwaltung enthalten. Texte und globale Config gehören nicht hierhin.</p>
        <div class="so2-grid so2-grid-3">
          ${statusCard('Betrieb', 'geplant', badge('V2', 'neutral'), 'Status und Start-Szene nur als Kurzinfo.')}
          ${statusCard('Streamer', 'geplant', badge('Verwaltung', 'neutral'), 'Hinzufügen, bearbeiten, aktivieren, testen.')}
          ${statusCard('Letzte Aktivität', 'geplant', badge('kurz', 'neutral'), 'Trigger und Skips ohne Statistik-Dopplung.')}
        </div>
      </section>
    `;
  }

  function renderQueues(){
    const queue = state.queue || {};
    const displayItems = asArray(pick(queue, ['displayQueue','display.items','displayQueueItems','display'], []));
    const officialItems = asArray(pick(queue, ['officialQueue','official.items','queue','official'], []));
    return `
      <div class="so2-two">
        <section class="so2-panel"><h3>Overlay-Shoutouts</h3>${renderQueuePreview(displayItems, 'Keine offenen Overlay-Shoutouts.')}</section>
        <section class="so2-panel"><h3>Offizielle Twitch-Shoutouts</h3>${renderQueuePreview(officialItems, 'Keine offenen offiziellen Twitch-Shoutouts.')}</section>
      </div>
    `;
  }

  function renderTexts(){
    return `
      <section class="so2-panel">
        <h3>Texte</h3>
        <p>Hier werden in V2 alle Chat- und Systemtexte zusammengeführt. AutoShoutout-Begrüßungen werden nicht mehr im AutoShoutout-Tab bearbeitet.</p>
        <div class="so2-empty">Nächster eigener Build-Step: Textbereiche sauber an vorhandene Text-APIs anbinden.</div>
      </section>
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

  function statusCard(label, value, badgeHtml, help){
    return `<article class="so2-card"><small>${esc(label)}</small><strong>${esc(value)}</strong><div>${badgeHtml}</div><p>${esc(help || '')}</p></article>`;
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
      }
    });

    document.addEventListener('input', ev => {
      if (!root?.contains(ev.target)) return;
      if (ev.target?.matches?.('[data-so2-target]')) state.manualTarget = cleanChannelInput(ev.target.value);
    });

    document.addEventListener('change', ev => {
      if (!root?.contains(ev.target)) return;
      if (ev.target?.matches?.('[data-so2-autorefresh]')) {
        state.autoRefresh = ev.target.checked === true;
        scheduleRefresh();
        return;
      }
      if (ev.target?.matches?.('[data-so2-force]')) state.manualForce = ev.target.checked === true;
    });

    document.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' && ev.target?.matches?.('[data-so2-target]') && root?.contains(ev.target)) runManual();
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
