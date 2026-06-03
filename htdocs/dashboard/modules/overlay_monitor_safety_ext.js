
'use strict';

(function(){
  const VERSION = '0.1.1-can39-3b-stable-insert';
  const PANEL_ID = 'overlaysModule';
  const BANNER_ID = 'ovmSafetyModeBanner';
  let timer = null;
  let retryTimer = null;
  let retryUntil = 0;

  function esc(value){
    return window.CGN && window.CGN.esc
      ? window.CGN.esc(value)
      : String(value == null ? '' : value).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function root(){ return document.getElementById(PANEL_ID); }

  function visible(){
    const r = root();
    return !!(r && !r.hidden);
  }

  function activeTab(){
    const r = root();
    if (!r || r.hidden) return '';
    const active = r.querySelector('[data-ovm-tab].active');
    return active && active.dataset ? String(active.dataset.ovmTab || '') : 'overview';
  }

  function buildBanner(tab){
    const isInventory = tab === 'inventory';
    const isSources = tab === 'sources' || tab === 'details';
    return '<section id="'+BANNER_ID+'" class="ovm-safety-banner" data-version="'+esc(VERSION)+'">'
      + '<div><span class="ovm-safety-kicker">Read-only / manuelle Aktionen getrennt</span>'
      + '<h3>Overlay-Monitor Sicherheits-Hinweis</h3>'
      + '<p>Diese Seite trennt Anzeige von Aktionen. Status, Quellen, Issues und Bus-Daten sind Diagnose. OBS-Reparaturen und Browser-Refresh bleiben manuell und werden hier nicht automatisch ausgelöst.</p></div>'
      + '<div class="ovm-safety-pills">'
      + '<span class="ovm-safety-pill ok">Status lesen</span>'
      + '<span class="ovm-safety-pill ok">keine Recovery</span>'
      + '<span class="ovm-safety-pill '+(isInventory ? 'warn' : 'ok')+'">'+(isInventory ? 'Inventar-Refresh vorsichtig' : 'kein Auto-Refresh von Quellen')+'</span>'
      + '<span class="ovm-safety-pill '+(isSources ? 'warn' : 'ok')+'">'+(isSources ? 'Reparaturbuttons manuell' : 'OBS-Aktionen gesperrt')+'</span>'
      + '</div></section>';
  }

  function findInsertTarget(){
    const r = root();
    if (!r || r.hidden) return null;
    return r.querySelector('.ovm-head') || r.querySelector('.ovm-shell > div:first-child') || null;
  }

  function insertBanner(){
    const target = findInsertTarget();
    if (!target) return false;
    const old = document.getElementById(BANNER_ID);
    if (old) old.remove();
    target.insertAdjacentHTML('afterend', buildBanner(activeTab() || 'overview'));
    return true;
  }

  function markManualButtons(){
    const r = root();
    if (!r || r.hidden) return false;
    let changed = false;

    r.querySelectorAll('[data-ovm-source-action]').forEach(btn => {
      btn.classList.add('ovm-manual-action');
      if (!btn.dataset.safetyTitleApplied) {
        const oldTitle = btn.getAttribute('title') || '';
        btn.setAttribute('title', oldTitle || 'Manuelle OBS-Aktion. Wird nicht automatisch ausgelöst.');
        btn.dataset.safetyTitleApplied = '1';
        changed = true;
      }
    });

    r.querySelectorAll('[data-ovm-inventory-refresh]').forEach(btn => {
      btn.classList.add('ovm-inventory-refresh-action');
      if (!btn.dataset.safetyTitleApplied) {
        btn.setAttribute('title', 'Liest OBS aktiv neu ein und kann den Inventar-Cache aktualisieren. Keine Reparatur.');
        btn.dataset.safetyTitleApplied = '1';
        changed = true;
      }
    });

    return changed;
  }

  function addInventoryNote(){
    const r = root();
    if (!r || r.hidden || activeTab() !== 'inventory') return false;
    if (r.querySelector('[data-ovm-inventory-readonly-note]')) return true;
    const target = r.querySelector('.ovm-detail-head');
    if (!target) return false;
    target.insertAdjacentHTML('afterend',
      '<div class="ovm-safety-inline-note" data-ovm-inventory-readonly-note="1"><strong>Hinweis:</strong> „OBS-Inventar aktualisieren“ liest OBS aktiv und kann den Inventory-Cache aktualisieren. Es repariert nichts und refresht keine Browserquelle.</div>'
    );
    return true;
  }

  function addSourcesNote(){
    const r = root();
    if (!r || r.hidden) return false;
    const tab = activeTab();
    if (tab !== 'sources' && tab !== 'details') return false;
    if (r.querySelector('[data-ovm-source-action-note]')) return true;
    const toolbar = r.querySelector('.ovm-toolbar');
    if (!toolbar) return false;
    toolbar.insertAdjacentHTML('afterend',
      '<div class="ovm-safety-inline-note" data-ovm-source-action-note="1"><strong>Manuelle Aktionen:</strong> Reparatur-/Refresh-Buttons lösen erst nach Klick und ggf. Bestätigung eine OBS-Aktion aus. Diese Diagnose löst nichts automatisch aus.</div>'
    );
    return true;
  }

  function enhance(){
    if (!visible()) return false;
    const bannerOk = insertBanner();
    markManualButtons();
    addInventoryNote();
    addSourcesNote();
    return bannerOk;
  }

  function schedule(delay = 180){
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      enhance();
    }, delay);
  }

  function startBoundedRetry(durationMs = 10000, intervalMs = 350){
    retryUntil = Date.now() + Math.max(1000, durationMs);
    if (retryTimer) clearInterval(retryTimer);
    retryTimer = setInterval(() => {
      const ok = enhance();
      if (ok || Date.now() > retryUntil) {
        clearInterval(retryTimer);
        retryTimer = null;
      }
    }, Math.max(150, intervalMs));
  }

  function burst(){
    schedule(80);
    setTimeout(enhance, 250);
    setTimeout(enhance, 700);
    setTimeout(enhance, 1500);
    startBoundedRetry(9000, 400);
  }

  function boot(){
    document.addEventListener('click', ev => {
      const target = ev.target;
      if (!target || typeof target.closest !== 'function') return;
      if (target.closest('#'+PANEL_ID+' [data-ovm-tab]')) burst();
      if (target.closest('#'+PANEL_ID+' [data-ovm-refresh]')) burst();
      if (target.closest('#'+PANEL_ID+' [data-ovm-inventory-refresh]')) burst();
      if (target.closest('[data-section], [data-module-panel], [data-module], .nav-main-item, .nav-sub-item, button')) {
        setTimeout(burst, 120);
      }
    }, true);

    window.addEventListener('cgn:module-show', ev => {
      if (!ev.detail || ev.detail.module === 'overlays' || ev.detail.panel === 'overlaysModule') burst();
    });

    window.addEventListener('hashchange', burst);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) burst();
    });

    burst();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.CGNOverlayMonitorSafetyExt = { version: VERSION, refresh: enhance, burst };
})();
