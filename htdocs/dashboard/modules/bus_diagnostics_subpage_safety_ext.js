
'use strict';

(function(){
  const VERSION = '0.1.0-can40-2';
  const PANEL_ID = 'busDiagnosticsModule';
  const BANNER_ID = 'busdiagSubpageSafetyHint';
  let timer = null;
  let retryTimer = null;
  let retryUntil = 0;

  const tabHints = {
    recovery: {
      title: 'Recovery-Unterseite: Read-only Preflight',
      text: 'Diese Ansicht bewertet Recovery-Bereitschaft, Guards, Sperren und Preflight. Sie führt keine Recovery aus.',
      pills: ['GET-Diagnose', 'Prepare gesperrt', 'Execute gesperrt', 'keine OBS-Aktion']
    },
    issues: {
      title: 'Issues-Unterseite: Anzeige',
      text: 'Diese Ansicht zeigt gemeldete Bus-/Client-/Integration-Issues. Keine Queue, kein Sound und keine Recovery wird verändert.',
      pills: ['Issues lesen', 'keine Mutation', 'kein Retry', 'kein Queue-Clear']
    },
    raw: {
      title: 'Rohdaten-Unterseite: Nur Anzeige',
      text: 'Rohdaten sind Debug-Ausgaben aus bereits geladenen Diagnosewerten. Keine Aktion, kein POST, keine Reparatur.',
      pills: ['JSON lesen', 'kein POST', 'keine Recovery', 'keine Reparatur']
    },
    config: {
      title: 'Config-Unterseite: Diagnose / Einstellungen lesen',
      text: 'Diese Ansicht liest Communication-Settings für Diagnose. Werte nicht automatisch speichern oder ändern.',
      pills: ['Settings lesen', 'kein Speichern', 'kein Admin-POST', 'keine Migration']
    },
    busmatrix: {
      title: 'Bus-Matrix: Integrationsdiagnose',
      text: 'Diese Ansicht bewertet Modul- und Bus-Verträge. Der Sound-Bus Dry-Run ist manuell und darf nicht automatisch ausgelöst werden.',
      pills: ['Matrix lesen', 'Dry-Run manuell', 'kein Sound', 'keine Queue']
    },
    overview: {
      title: 'Bus-Diagnose: Read-only Überblick',
      text: 'Die Übersicht aggregiert Status- und Preflight-Daten. Keine Recovery, keine OBS-/Sound-/Queue-Aktion.',
      pills: ['Status lesen', 'Preflight lesen', 'keine Recovery', 'kein POST']
    }
  };

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

  function hintFor(tab){
    return tabHints[tab] || {
      title: 'Bus-Diagnose: Read-only Hinweis',
      text: 'Diese Unterseite ist als Diagnose gedacht. Produktive Aktionen bleiben gesperrt oder manuell.',
      pills: ['read-only', 'keine Recovery', 'kein OBS', 'kein Queue/Sound']
    };
  }

  function buildBanner(tab){
    const hint = hintFor(tab);
    return '<section id="'+BANNER_ID+'" class="busdiag-subpage-safety" data-version="'+esc(VERSION)+'" data-busdiag-safety-tab="'+esc(tab)+'">'
      + '<div><span class="busdiag-safety-kicker">Read-only / Safety-Hinweis</span>'
      + '<h3>'+esc(hint.title)+'</h3>'
      + '<p>'+esc(hint.text)+'</p></div>'
      + '<div class="busdiag-safety-pills">'
      + hint.pills.map((pill, idx) => '<span class="busdiag-safety-pill '+(idx < 2 ? 'ok' : 'warn')+'">'+esc(pill)+'</span>').join('')
      + '</div></section>';
  }

  function findInsertTarget(){
    const r = root();
    if (!r || r.hidden) return null;
    return r.querySelector('[data-busdiag-tabs]') || r.querySelector('.busdiag-livebar') || r.querySelector('.busdiag-hero') || null;
  }

  function insertBanner(){
    const target = findInsertTarget();
    if (!target) return false;
    const old = document.getElementById(BANNER_ID);
    if (old) old.remove();
    target.insertAdjacentHTML('afterend', buildBanner(activeTab() || 'overview'));
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

  function addInlineNotes(){
    const r = root();
    if (!r || r.hidden) return;
    const tab = activeTab();

    if (tab === 'busmatrix' && !r.querySelector('[data-busdiag-sound-dryrun-note]')) {
      const btn = r.querySelector('[data-busdiag-action="sound-dry-run"]');
      const card = btn ? btn.closest('.busdiag-card') : null;
      if (card) {
        card.insertAdjacentHTML('afterbegin', '<div class="busdiag-safety-inline-note" data-busdiag-sound-dryrun-note="1"><strong>Manuell:</strong> Der Sound-Bus Dry-Run ist ein Diagnose-POST und wird nicht automatisch ausgelöst. Kein Sound, keine Queue.</div>');
      }
    }

    if (tab === 'recovery' && !r.querySelector('[data-busdiag-recovery-note]')) {
      const content = r.querySelector('[data-busdiag-content]');
      if (content) {
        content.insertAdjacentHTML('afterbegin', '<div class="busdiag-safety-inline-note" data-busdiag-recovery-note="1"><strong>Recovery-Sicherheit:</strong> Diese Unterseite zeigt Preflight, Readiness und Sperren. Sie führt keine Recovery aus.</div>');
      }
    }

    if ((tab === 'raw' || tab === 'config' || tab === 'issues') && !r.querySelector('[data-busdiag-passive-note]')) {
      const content = r.querySelector('[data-busdiag-content]');
      if (content) {
        const label = tab === 'raw' ? 'Rohdaten' : (tab === 'config' ? 'Config' : 'Issues');
        content.insertAdjacentHTML('afterbegin', '<div class="busdiag-safety-inline-note" data-busdiag-passive-note="1"><strong>'+esc(label)+':</strong> Anzeige-/Diagnosebereich. Keine automatische Änderung, keine Recovery, kein Queue-/Sound-/OBS-Eingriff.</div>');
      }
    }
  }

  function enhance(){
    if (!visible()) return false;
    const ok = insertBanner();
    markManualActions();
    addInlineNotes();
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
