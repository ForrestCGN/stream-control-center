
'use strict';

(function(){
  const VERSION = '0.1.0-can41-3';
  const PANEL_ID = 'birthdayModule';
  const BANNER_ID = 'birthdaySafetyHintCan413';
  let timer = null;
  let retryTimer = null;
  let retryUntil = 0;

  const selectors = [
    ['[data-birthday-reload]', 'reload', 'Reload: lädt Runtime/Command/Textdaten neu. Nur bewusst auslösen.'],
    ['[data-birthday-stop-show]', 'show', 'Show stoppen: produktive Birthday-/Sound-Aktion.'],
    ['[data-birthday-recheck-assets]', 'media', 'Dauer neu prüfen: Admin-/Media-Status-Aktion.'],
    ['[data-birthday-import-media]', 'media', 'Media importieren: übernimmt Medien ins Birthday-/Sound-System.'],
    ['[data-birthday-upload]', 'media', 'Upload: schreibt/übernimmt Birthday-Medien.'],
    ['[data-birthday-save-user]', 'admin', 'User speichern: schreibt Geburtstagsdaten.'],
    ['[data-delete-birthday-user]', 'admin', 'User deaktivieren: ändert Geburtstagsdaten.'],
    ['[data-hard-delete-birthday-user]', 'admin danger', 'User löschen: entfernt Geburtstagsdaten.'],
    ['[data-save-birthday-setting]', 'admin', 'Setting speichern: schreibt in birthday_settings.'],
    ['[data-save-birthday-variant]', 'admin', 'Textvariante speichern: schreibt Textvarianten.'],
    ['[data-add-birthday-variant]', 'admin', 'Textvariante hinzufügen: schreibt Textvarianten.'],
    ['[data-delete-birthday-variant]', 'admin danger', 'Textvariante löschen: entfernt Textvariante.'],
    ['[data-birthday-save-party]', 'admin', 'Party speichern: schreibt Party-Preset.'],
    ['[data-birthday-assign-party]', 'admin', 'User zuordnen: schreibt Party-Zuordnung.']
  ];

  function root(){ return document.getElementById(PANEL_ID); }

  function isVisible(){
    const r = root();
    return !!(r && !r.hidden);
  }

  function currentTab(){
    const r = root();
    if (!r || r.hidden) return '';
    const active = r.querySelector('[data-birthday-tab].active');
    return active && active.dataset ? String(active.dataset.birthdayTab || '') : 'overview';
  }

  function buildBanner(){
    return '<section id="'+BANNER_ID+'" class="birthday-safety-hint" data-version="'+VERSION+'">'
      + '<div><span class="birthday-safety-kicker">Safety / Read-only-Hinweis</span>'
      + '<h3>Birthday-System enthält produktive Aktionen</h3>'
      + '<p>Die Ansicht darf Status lesen. Show, Sound, Upload, User-/Text-/Settings-Speichern und Reload nur bewusst auslösen.</p></div>'
      + '<div class="birthday-safety-pills">'
      + '<span class="birthday-safety-pill ok">Status lesen</span>'
      + '<span class="birthday-safety-pill warn">Show/Sound manuell</span>'
      + '<span class="birthday-safety-pill warn">Admin-POSTs manuell</span>'
      + '</div>'
      + '</section>';
  }

  function ensureBanner(){
    const r = root();
    if (!r || r.hidden) return false;
    const hero = r.querySelector('.birthday-hero');
    if (!hero) return false;
    let banner = document.getElementById(BANNER_ID);
    if (!banner) {
      hero.insertAdjacentHTML('afterend', buildBanner());
      banner = document.getElementById(BANNER_ID);
    }
    if (banner) banner.dataset.activeTab = currentTab();
    return true;
  }

  function markButtons(){
    const r = root();
    if (!r || r.hidden) return;
    for (const [selector, kind, title] of selectors) {
      r.querySelectorAll(selector).forEach(btn => {
        btn.classList.add('birthday-safety-marked');
        kind.split(/\s+/).filter(Boolean).forEach(cls => btn.classList.add('birthday-safety-' + cls));
        if (!btn.dataset.birthdaySafetyTitle) {
          const existing = btn.getAttribute('title') || '';
          btn.setAttribute('title', existing ? existing + ' · ' + title : title);
          btn.dataset.birthdaySafetyTitle = '1';
        }
      });
    }
  }

  function clearNotes(){
    const r = root();
    if (!r) return;
    r.querySelectorAll('[data-birthday-safety-note]').forEach(node => node.remove());
  }

  function addFocusedNote(){
    const r = root();
    if (!r || r.hidden) return;
    const tab = currentTab();
    clearNotes();

    if (tab === 'show') {
      const card = r.querySelector('.birthday-card-main');
      if (card) {
        card.insertAdjacentHTML('afterbegin',
          '<div class="birthday-safety-inline-note" data-birthday-safety-note="show">'
          + '<strong>Show/Medien:</strong> Hier liegen Intro, Song, Stop, Recheck, Upload und Import. Keine dieser Aktionen automatisch testen.'
          + '</div>');
      }
    }

    if (tab === 'users') {
      const card = r.querySelector('.birthday-grid-users .birthday-card');
      if (card) {
        card.insertAdjacentHTML('afterbegin',
          '<div class="birthday-safety-inline-note" data-birthday-safety-note="users">'
          + '<strong>Geburtstage:</strong> Speichern, Deaktivieren und Löschen schreiben User-Daten.'
          + '</div>');
      }
    }

    if (tab === 'settings' || tab === 'texts' || tab === 'parties') {
      const card = r.querySelector('.birthday-card');
      if (card) {
        const label = tab === 'settings' ? 'Settings' : (tab === 'texts' ? 'Texte' : 'Partys');
        const detail = tab === 'settings'
          ? 'Speichern schreibt in birthday_settings.'
          : (tab === 'texts' ? 'Speichern/Hinzufügen/Löschen schreibt Textvarianten.' : 'Party speichern und User zuordnen schreiben Party-/Profil-Daten.');
        card.insertAdjacentHTML('afterbegin',
          '<div class="birthday-safety-inline-note" data-birthday-safety-note="'+tab+'">'
          + '<strong>'+label+':</strong> '+detail
          + '</div>');
      }
    }
  }

  function enhance(){
    if (!isVisible()) return false;
    const ok = ensureBanner();
    markButtons();
    addFocusedNote();
    return ok;
  }

  function schedule(delay = 100){
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      enhance();
    }, delay);
  }

  function burst(){
    schedule(80);
    setTimeout(enhance, 260);
    setTimeout(enhance, 700);
    setTimeout(enhance, 1400);
    startBoundedRetry(6500, 350);
  }

  function startBoundedRetry(durationMs, intervalMs){
    retryUntil = Date.now() + Math.max(1000, durationMs || 6500);
    if (retryTimer) clearInterval(retryTimer);
    retryTimer = setInterval(() => {
      const ok = enhance();
      if (ok || Date.now() > retryUntil) {
        clearInterval(retryTimer);
        retryTimer = null;
      }
    }, Math.max(150, intervalMs || 350));
  }

  function boot(){
    document.addEventListener('click', ev => {
      const target = ev.target;
      if (!target || typeof target.closest !== 'function') return;
      if (target.closest('#'+PANEL_ID+' [data-birthday-tab]')) burst();
      if (target.closest('[data-section], [data-module-panel], [data-module], .nav-main-item, .nav-sub-item, button')) {
        setTimeout(burst, 120);
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

  window.CGNBirthdayReadonlySafetyExt = { version: VERSION, refresh: enhance, burst };
})();
