
'use strict';

(function(){
  const VERSION = '0.1.0-can41-4';
  const PANEL_ID = 'birthdayModule';
  const CARD_ID = 'birthdayReadonlyDiagnosticsCard';
  let timer = null;
  let retryTimer = null;
  let retryUntil = 0;
  let loading = false;
  let lastData = null;
  let lastError = '';
  let lastLoadedAt = '';

  const endpoints = {
    status: '/api/birthday/status',
    today: '/api/birthday/today',
    showState: '/api/birthday/show/state'
  };

  function esc(value){
    return window.CGN && window.CGN.esc
      ? window.CGN.esc(value)
      : String(value == null ? '' : value).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function root(){ return document.getElementById(PANEL_ID); }
  function visible(){ const r = root(); return !!(r && !r.hidden); }
  function yesNo(value){ return value ? 'aktiv' : 'inaktiv'; }
  function val(value, fallback='-'){ return value === undefined || value === null || value === '' ? fallback : String(value); }

  function statusClass(ok){
    if (ok === true) return 'ok';
    if (ok === false) return 'warn';
    return 'neutral';
  }

  function normalize(){
    const status = lastData?.status || {};
    const today = lastData?.today || status.today || {};
    const showResp = lastData?.showState || {};
    const show = showResp.state || status.show || {};
    const config = status.config || {};
    const stats = status.stats || {};
    const routes = Array.isArray(status.routes) ? status.routes : [];
    const usersCount = Array.isArray(lastData?.users?.users) ? lastData.users.users.length : null;

    return {
      moduleVersion: status.version || status.moduleVersion || config.version || '0.6.0',
      schemaVersion: status.schemaVersion || status.schema?.version || 7,
      moduleEnabled: config.enabled,
      command: config.command?.trigger || 'birthday',
      aliases: Array.isArray(config.command?.aliases) ? config.command.aliases.join(', ') : '',
      autoGreeting: config.automaticGreeting?.enabled,
      diaryWrite: config.automaticGreeting?.writeDiaryEntry,
      onlyWhenLive: config.automaticGreeting?.onlyWhenLive,
      chatHook: status.chatHookInstalled,
      todayCount: Number(today.count ?? (Array.isArray(today.rows) ? today.rows.length : 0)),
      registeredCount: usersCount ?? status.users?.count ?? status.stats?.registeredUsers ?? '',
      showActive: !!show.active,
      showPhase: show.phase || 'idle',
      showTarget: show.targetDisplayName || show.targetLogin || '',
      lastError: stats.lastError || status.lastError || '',
      routesCount: routes.length,
      localDate: today.localDate || today.date || '',
      lastAutomaticCheckAt: stats.lastAutomaticCheckAt || '',
      lastGreetingAt: stats.lastGreetingAt || '',
      lastCommandAt: stats.lastCommandAt || ''
    };
  }

  function renderCard(){
    const r = root();
    if (!r || r.hidden) return false;
    const data = normalize();
    const errorHtml = lastError
      ? '<div class="birthday-diag-error">Diagnosefehler: '+esc(lastError)+'</div>'
      : '';

    const html = '<section id="'+CARD_ID+'" class="birthday-readonly-diagnostics" data-version="'+esc(VERSION)+'">'
      + '<div class="birthday-diag-head">'
      + '<div><span class="birthday-diag-kicker">Read-only Diagnose</span><h3>Birthday Status</h3><p>Diese Karte liest nur Statusdaten. Keine Show, kein Sound, kein Chat, kein Tagebuch.</p></div>'
      + '<button type="button" data-birthday-diag-refresh '+(loading ? 'disabled' : '')+'>'+(loading ? 'Lade...' : 'Diagnose aktualisieren')+'</button>'
      + '</div>'
      + errorHtml
      + '<div class="birthday-diag-grid">'
      + metric('Modul-Version', data.moduleVersion, 'neutral')
      + metric('Schema', data.schemaVersion, 'neutral')
      + metric('Modul', yesNo(data.moduleEnabled !== false), statusClass(data.moduleEnabled !== false))
      + metric('Auto-Gratulation', yesNo(data.autoGreeting !== false), statusClass(data.autoGreeting !== false))
      + metric('Tagebuch-Autoeintrag', yesNo(data.diaryWrite !== false), statusClass(data.diaryWrite !== false))
      + metric('Nur wenn live', yesNo(data.onlyWhenLive !== false), 'neutral')
      + metric('Chat-Hook', data.chatHook ? 'installiert' : 'nicht installiert', statusClass(!!data.chatHook))
      + metric('Heute', data.todayCount, data.todayCount > 0 ? 'ok' : 'neutral')
      + metric('Einträge', val(data.registeredCount), 'neutral')
      + metric('Show', data.showActive ? ('aktiv · ' + data.showPhase) : 'inaktiv', data.showActive ? 'warn' : 'ok')
      + metric('Ziel', val(data.showTarget), 'neutral')
      + metric('Routen', data.routesCount || '-', 'neutral')
      + '</div>'
      + '<div class="birthday-diag-details">'
      + '<div><span>Command</span><strong>!'+esc(data.command)+'</strong></div>'
      + '<div><span>Alias</span><strong>'+esc(data.aliases || '-')+'</strong></div>'
      + '<div><span>Local Date</span><strong>'+esc(data.localDate || '-')+'</strong></div>'
      + '<div><span>Letzter Auto-Check</span><strong>'+esc(data.lastAutomaticCheckAt || '-')+'</strong></div>'
      + '<div><span>Letzte Gratulation</span><strong>'+esc(data.lastGreetingAt || '-')+'</strong></div>'
      + '<div><span>Letzter Command</span><strong>'+esc(data.lastCommandAt || '-')+'</strong></div>'
      + '<div class="wide"><span>Letzter Fehler</span><strong>'+esc(data.lastError || '-')+'</strong></div>'
      + '<div class="wide"><span>Letztes Laden</span><strong>'+esc(lastLoadedAt || '-')+'</strong></div>'
      + '</div>'
      + '<p class="birthday-diag-note">Nicht abgefragt: <code>/api/birthday/show/queue</code>, weil diese Route intern stale Queue-Cleanup ausführen kann.</p>'
      + '</section>';

    const old = document.getElementById(CARD_ID);
    if (old) {
      old.outerHTML = html;
    } else {
      const hero = r.querySelector('.birthday-hero');
      if (!hero) return false;
      hero.insertAdjacentHTML('afterend', html);
    }

    bindCard();
    return true;
  }

  function metric(label, value, cls){
    return '<article class="birthday-diag-metric '+esc(cls || 'neutral')+'"><span>'+esc(label)+'</span><strong>'+esc(val(value))+'</strong></article>';
  }

  function bindCard(){
    const btn = document.querySelector('#'+CARD_ID+' [data-birthday-diag-refresh]');
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => loadDiagnostics(true));
    }
  }

  async function getJson(url){
    if (window.CGN && typeof window.CGN.api === 'function') return window.CGN.api(url);
    const res = await fetch(url, { method: 'GET', credentials: 'same-origin' });
    if (!res.ok) throw new Error(url + ' -> HTTP ' + res.status);
    return res.json();
  }

  async function loadDiagnostics(force=false){
    if (!visible()) return;
    if (loading) return;
    if (!force && lastData && lastLoadedAt) {
      renderCard();
      return;
    }

    loading = true;
    lastError = '';
    renderCard();

    try {
      const [status, today, showState] = await Promise.all([
        getJson(endpoints.status),
        getJson(endpoints.today).catch(err => ({ ok:false, error: err.message, rows: [] })),
        getJson(endpoints.showState).catch(err => ({ ok:false, error: err.message, state: null }))
      ]);
      lastData = { status, today, showState };
      lastLoadedAt = new Date().toLocaleString('de-DE');
    } catch (err) {
      lastError = err.message || String(err);
    } finally {
      loading = false;
      renderCard();
    }
  }

  function schedule(delay=120){
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      renderCard();
      loadDiagnostics(false);
    }, delay);
  }

  function burst(){
    schedule(80);
    setTimeout(() => { renderCard(); loadDiagnostics(false); }, 300);
    setTimeout(() => { renderCard(); loadDiagnostics(false); }, 900);
    startBoundedRetry(6500, 400);
  }

  function startBoundedRetry(durationMs, intervalMs){
    retryUntil = Date.now() + Math.max(1000, durationMs || 6500);
    if (retryTimer) clearInterval(retryTimer);
    retryTimer = setInterval(() => {
      const ok = renderCard();
      if (ok) loadDiagnostics(false);
      if (ok || Date.now() > retryUntil) {
        clearInterval(retryTimer);
        retryTimer = null;
      }
    }, Math.max(150, intervalMs || 400));
  }

  function boot(){
    document.addEventListener('click', ev => {
      const target = ev.target;
      if (!target || typeof target.closest !== 'function') return;
      if (target.closest('#'+PANEL_ID+' [data-birthday-tab]')) burst();
      if (target.closest('[data-section], [data-module-panel], [data-module], .nav-main-item, .nav-sub-item')) {
        setTimeout(burst, 160);
      }
    }, true);

    window.addEventListener('cgn:module-show', ev => {
      if (!ev.detail || ev.detail.module === 'birthday' || ev.detail.panel === PANEL_ID) burst();
    });

    window.addEventListener('hashchange', burst);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) burst(); });
    burst();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.CGNBirthdayReadonlyDiagnostics = { version: VERSION, refresh: () => loadDiagnostics(true), render: renderCard };
})();
