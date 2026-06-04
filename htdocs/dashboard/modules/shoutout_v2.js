window.ShoutoutV2Module = (function(){
  'use strict';

  const MODULE_VERSION = '2.0.0-skeleton';
  const BUILD = 'CAN-44.21.2';

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
    liveTest: null
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

      if (['analytics'].includes(state.activeTab)) {
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
    const active = TABS.find(t => t.id === state.activeTab) || TABS[0];
    root.innerHTML = `
      <div class="so2-shell">
        <section class="so2-hero">
          <div>
            <div class="so2-kicker">Community / Shoutout-System V2</div>
            <h2>Shoutout-System V2</h2>
            <p>Neu aufgebautes Dashboard. Alte UI-Blöcke werden nicht übernommen; die bestehenden APIs bleiben Datenquelle.</p>
          </div>
          <div class="so2-hero-actions">
            ${state.loading ? badge('lädt', 'warn') : badge('bereit', 'ok')}
            <label class="so2-auto"><input type="checkbox" data-so2-autorefresh ${state.autoRefresh ? 'checked' : ''}> Auto-Refresh</label>
            <button type="button" data-so2-refresh>Aktualisieren</button>
          </div>
        </section>

        ${state.error ? `<div class="so2-alert so2-alert-error">${esc(state.error)}</div>` : ''}
        ${state.notice ? `<div class="so2-alert so2-alert-ok">${esc(state.notice)}</div>` : ''}

        <nav class="so2-tabs" aria-label="Shoutout V2 Navigation">
          ${TABS.map(tab => `<button type="button" class="so2-tab ${tab.id === state.activeTab ? 'is-active' : ''}" data-so2-tab="${esc(tab.id)}"><strong>${esc(tab.label)}</strong><small>${esc(tab.hint)}</small></button>`).join('')}
        </nav>

        <section class="so2-tab-head">
          <div><strong>${esc(active.label)}</strong><span>${esc(active.hint)}</span></div>
          <span>Build ${esc(BUILD)} · V${esc(MODULE_VERSION)}</span>
        </section>

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
    const displayOpen = pick(status, ['displayOpen','display.open','queues.display.open','displayQueueOpen'], pick(queue, ['displayOpen','display.open','displayQueue.length'], 0));
    const officialOpen = pick(status, ['officialOpen','official.open','queues.official.open','officialQueueOpen'], pick(queue, ['officialOpen','official.open','officialQueue.length'], 0));
    const moduleVersion = pick(status, ['version','moduleVersion','module.version'], '-');
    const streamLive = pick(stream, ['live','isLive','data.live'], pick(status, ['stream.live','live'], false));
    return `
      <div class="so2-grid so2-grid-4">
        ${statusCard('System', 'Shoutout V2 aktiv', badge('bereit', 'ok'), 'Das neue Dashboard nutzt die bestehenden Shoutout-APIs.')}
        ${statusCard('Modul', moduleVersion, badge('API', 'neutral'), 'Backend bleibt unverändert.')}
        ${statusCard('Stream', streamLive ? 'LIVE' : 'OFFLINE', badge(streamLive ? 'live' : 'offline', streamLive ? 'ok' : 'warn'), 'Nur kurzer Status. Details stehen in Diagnose.')}
        ${statusCard('Warteschlangen', `${displayOpen} Overlay · ${officialOpen} Twitch`, badge('kurz', 'neutral'), 'Queue-Details stehen nur im Queues-Tab.')}
      </div>
      <section class="so2-panel">
        <h3>V2-Aufbau</h3>
        <p>Diese Ansicht ist bewusst schlank: keine Config, keine Textbearbeitung, keine langen Tabellen. Details liegen in den passenden Tabs.</p>
        <div class="so2-checklist">
          <span>✓ Keine doppelten Inhalte</span>
          <span>✓ CGN-Design dezent</span>
          <span>✓ Navigation oben sticky</span>
          <span>✓ Mod- und Einsteiger-tauglich geplant</span>
        </div>
      </section>
    `;
  }

  function renderManual(){
    return `
      <div class="so2-two">
        <section class="so2-panel">
          <h3>Shoutout manuell auslösen</h3>
          <p>Hier kann ein Mod oder Streamer einen Shoutout aufnehmen. Erweiterte Optionen bleiben klar beschriftet.</p>
          <label class="so2-label">Twitch-Kanal</label>
          <div class="so2-inline">
            <input type="text" data-so2-target placeholder="z. B. urlug" autocomplete="off">
            <label class="so2-check"><input type="checkbox" data-so2-force> Erzwingen</label>
            <button type="button" data-so2-run>Shoutout aufnehmen</button>
          </div>
          <small class="so2-help">„Erzwingen“ nur nutzen, wenn du Sperren bewusst übergehen möchtest.</small>
        </section>
        <section class="so2-panel">
          <h3>Live-Hinweis</h3>
          <p>V2 zeigt hier später nur kurz, ob offizielle Twitch-Shoutouts direkt gesendet oder geparkt werden. Technische Details bleiben in Diagnose.</p>
          ${renderGateMini()}
        </section>
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
    const target = root?.querySelector('[data-so2-target]')?.value?.trim();
    const force = root?.querySelector('[data-so2-force]')?.checked === true;
    if (!target) {
      state.notice = '';
      state.error = 'Bitte einen Twitch-Kanal eintragen.';
      render();
      return;
    }
    state.loading = true;
    state.error = '';
    state.notice = '';
    render();
    try {
      await api(API.run, { method: 'POST', body: JSON.stringify({ target, login: target, force }) });
      state.notice = `Shoutout für ${target} wurde aufgenommen.`;
      await loadAll(true);
    } catch (err) {
      state.error = err.message || String(err);
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

    document.addEventListener('change', ev => {
      if (ev.target?.matches?.('[data-so2-autorefresh]') && root?.contains(ev.target)) {
        state.autoRefresh = ev.target.checked === true;
        scheduleRefresh();
      }
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
