
'use strict';

(function(){
  const VERSION = '0.1.1-can40-2b-reduced';
  const PANEL_ID = 'busDiagnosticsModule';
  const BANNER_ID = 'busdiagSubpageSafetyHint';
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
    const active = r.querySelector('[data-busdiag-tab].active');
    return active && active.dataset ? String(active.dataset.busdiagTab || '') : 'overview';
  }

  function buildOverviewBanner(){
    return '<section id="'+BANNER_ID+'" class="busdiag-subpage-safety is-overview" data-version="'+esc(VERSION)+'" data-busdiag-safety-tab="overview">'
      + '<div><span class="busdiag-safety-kicker">Read-only / Safety-Hinweis</span>'
      + '<h3>Bus-Diagnose: Read-only Überblick</h3>'
      + '<p>Die Übersicht aggregiert Status- und Preflight-Daten. Keine Recovery, keine OBS-/Sound-/Queue-Aktion.</p></div>'
      + '<div class="busdiag-safety-pills">'
      + '<span class="busdiag-safety-pill ok">Status lesen</span>'
      + '<span class="busdiag-safety-pill ok">Preflight lesen</span>'
      + '<span class="busdiag-safety-pill warn">keine Recovery</span>'
      + '<span class="busdiag-safety-pill warn">kein POST</span>'
      + '</div></section>';
  }

  function removeBanner(){
    const old = document.getElementById(BANNER_ID);
    if (old) old.remove();
  }

  function findInsertTarget(){
    const r = root();
    if (!r || r.hidden) return null;
    return r.querySelector('[data-busdiag-tabs]') || r.querySelector('.busdiag-livebar') || r.querySelector('.busdiag-hero') || null;
  }

  function insertOverviewBanner(){
    if (activeTab() !== 'overview') {
      removeBanner();
      return true;
    }
    const target = findInsertTarget();
    if (!target) return false;
    removeBanner();
    target.insertAdjacentHTML('afterend', buildOverviewBanner());
    return true;
  }

  function markManualActions(){
    const r = root();
    if (!r || r.hidden) return false;
    let changed = false;

    r.querySelectorAll('[data-busdiag-action="sound-dry-run"]').forEach(btn => {
      btn.classList.add('busdiag-manual-diagnose-action');
      if (!btn.dataset.safetyTitleApplied) {
        btn.setAttribute('title', 'Manuelle Diagnose-Aktion: Dry-Run. Wird nicht automatisch ausgelöst.');
        btn.dataset.safetyTitleApplied = '1';
        changed = true;
      }
    });

    r.querySelectorAll('[data-busdiag-action="manual-diagnostics-refresh"], [data-busdiag-action="manual-status-resync"]').forEach(btn => {
      btn.classList.add('busdiag-readonly-manual-action');
      if (!btn.dataset.safetyTitleApplied) {
        btn.setAttribute('title', 'Manueller Read-only Diagnose-Refresh. Keine Recovery-Ausführung.');
        btn.dataset.safetyTitleApplied = '1';
        changed = true;
      }
    });

    return changed;
  }

  function addFocusedNotes(){
    const r = root();
    if (!r || r.hidden) return;
    const tab = activeTab();

    r.querySelectorAll('[data-busdiag-recovery-note], [data-busdiag-sound-dryrun-note], [data-busdiag-passive-note]').forEach(node => node.remove());

    if (tab === 'recovery') {
      const content = r.querySelector('[data-busdiag-content]');
      if (content) {
        content.insertAdjacentHTML('afterbegin', '<div class="busdiag-safety-inline-note busdiag-safety-note-small" data-busdiag-recovery-note="1"><strong>Recovery:</strong> Preflight, Readiness und Sperren werden nur angezeigt. Keine Recovery-Ausführung.</div>');
      }
    }

    if (tab === 'busmatrix') {
      const btn = r.querySelector('[data-busdiag-action="sound-dry-run"]');
      const card = btn ? btn.closest('.busdiag-card') : null;
      if (card) {
        card.insertAdjacentHTML('afterbegin', '<div class="busdiag-safety-inline-note busdiag-safety-note-small" data-busdiag-sound-dryrun-note="1"><strong>Sound-Bus Dry-Run:</strong> manuelle Diagnose-Aktion. Nicht automatisch auslösen.</div>');
      }
    }
  }

  function enhance(){
    if (!visible()) return false;
    const ok = insertOverviewBanner();
    markManualActions();
    addFocusedNotes();
    return ok;
  }

  function schedule(delay = 120){
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      enhance();
    }, delay);
  }

  function startBoundedRetry(durationMs = 7000, intervalMs = 350){
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
    setTimeout(enhance, 260);
    setTimeout(enhance, 750);
    setTimeout(enhance, 1500);
    startBoundedRetry(7000, 400);
  }

  function boot(){
    document.addEventListener('click', ev => {
      const target = ev.target;
      if (!target || typeof target.closest !== 'function') return;
      if (target.closest('#'+PANEL_ID+' [data-busdiag-tab]')) burst();
      if (target.closest('#'+PANEL_ID+' [data-busdiag-recovery-tab]')) burst();
      if (target.closest('#'+PANEL_ID+' [data-busdiag-action]')) burst();
      if (target.closest('[data-section], [data-module-panel], [data-module], .nav-main-item, .nav-sub-item, button')) {
        setTimeout(burst, 120);
      }
    }, true);

    window.addEventListener('cgn:module-show', ev => {
      if (!ev.detail || ev.detail.module === 'bus_diagnostics' || ev.detail.panel === 'busDiagnosticsModule') burst();
    });

    window.addEventListener('hashchange', burst);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) burst();
    });

    burst();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.CGNBusDiagnosticsSubpageSafetyExt = { version: VERSION, refresh: enhance, burst };
})();
