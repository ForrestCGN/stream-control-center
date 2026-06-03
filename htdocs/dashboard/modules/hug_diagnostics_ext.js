
'use strict';

(function(){
  const VERSION = '0.1.0-can37-3';
  const MODULE_ID = 'hugModule';
  const EXT_ID = 'hugDiagnosisExtension';
  let busy = false;

  const readOnlyRoutes = [
    'GET /api/hug/status',
    'GET /api/hug/routes',
    'GET /api/hug/integration-check',
    'GET /api/hug/admin/text-pairs',
    'GET /api/hug/admin/hug-all-texts',
    'GET /api/hug/admin/response-texts',
    'GET /api/hug/admin/top-title-texts'
  ];

  const blockedRoutes = [
    'POST /api/hug/action',
    'GET/POST /api/hug/command',
    'GET /api/hug/cmd',
    'GET /api/hug/statscmd',
    'GET /api/hug/top',
    'GET/POST /api/hug/reload',
    'POST /api/hug/text-store/reload',
    'POST /api/hug/db/output-mode',
    'POST /api/hug/admin/text-pairs',
    'POST /api/hug/admin/hug-all-texts',
    'POST /api/hug/admin/response-texts',
    'POST /api/hug/admin/top-title-texts'
  ];

  function esc(v){
    return window.CGN && window.CGN.esc
      ? window.CGN.esc(v)
      : String(v == null ? '' : v).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  async function api(path){
    if (window.CGN && window.CGN.api) return window.CGN.api(path);
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    return res.json();
  }

  function root(){ return document.getElementById(MODULE_ID); }

  function isDiagnosis(){
    const r = root();
    if (!r || r.hidden) return false;
    const active = r.querySelector('[data-hug-tab].active');
    return active && active.dataset.hugTab === 'diagnostics';
  }

  function targetCard(){
    return document.getElementById('hugDiagCard');
  }

  function yes(v){ return v ? 'ja' : 'nein'; }

  function metric(label, value, note, cls){
    return '<div class="hug-diag-ext-metric '+esc(cls||'')+'"><span>'+esc(label)+'</span><strong>'+esc(value)+'</strong>'+(note ? '<small>'+esc(note)+'</small>' : '')+'</div>';
  }

  function row(label, value, cls){
    return '<div class="hug-diag-ext-row '+esc(cls||'')+'"><span>'+esc(label)+'</span><strong>'+esc(value)+'</strong></div>';
  }

  function routeList(list, cls){
    return list.map(item => '<span class="hug-diag-ext-route '+esc(cls)+'">'+esc(item)+'</span>').join('');
  }

  function checkCount(integration, name){
    const checks = Array.isArray(integration && integration.checks) ? integration.checks : [];
    const item = checks.find(check => check && check.name === name);
    return item && typeof item.count === 'number' ? item.count : '-';
  }

  function checkOk(integration, name){
    const checks = Array.isArray(integration && integration.checks) ? integration.checks : [];
    const item = checks.find(check => check && check.name === name);
    if (!item) return false;
    return item.ok !== false && item.level !== 'error';
  }

  function render(status, routesPayload, integration, textPairs, hugAll, responses, topTitles){
    const counts = status && status.counts ? status.counts : {};
    const db = status && status.database ? status.database : {};
    const output = status && status.output ? status.output : {};
    const summary = integration && integration.summary ? integration.summary : {};
    const ok = integration && integration.ok === true && Number(summary.errors || 0) === 0;
    const pairCount = textPairs && typeof textPairs.count === 'number' ? textPairs.count : counts.hugTextPairs;
    const activePairCount = textPairs && typeof textPairs.activeCount === 'number' ? textPairs.activeCount : counts.activeHugTextPairs;

    return '<section id="'+EXT_ID+'" class="hug-diag-ext" data-version="'+esc(VERSION)+'">'
      + '<section class="hug-card hug-diag-ext-card hug-diag-ext-head"><div><h3>Erweiterte Read-only-Diagnose</h3><p>In den vorhandenen Diagnose-Tab integriert. Kein Hug/Rehug, kein Reload, keine Chat-Ausgabe, keine Admin-POST-Routen.</p></div><div class="hug-diag-ext-pills"><span class="hug-pill '+(ok?'ok':'warn')+'">'+(ok?'READ-ONLY OK':'PRÜFEN')+'</span><span class="hug-pill '+(status && status.enabled?'ok':'warn')+'">'+(status && status.enabled?'aktiv':'inaktiv')+'</span><span class="hug-pill '+(output.mode === 'central'?'warn':'ok')+'">'+esc(output.mode || '-')+'</span></div></section>'
      + '<section class="hug-diag-ext-section"><div class="hug-diag-ext-title"><h4>Status & Schema</h4><span>nur Statusdaten</span></div><div class="hug-diag-ext-grid">'
      + metric('Status', status && status.enabled ? 'aktiv' : 'inaktiv', 'Hug-System', status && status.enabled ? 'ok' : 'warn')
      + metric('Schema', status && status.schemaVersion != null ? status.schemaVersion : '-', 'Soll aus Modul', 'ok')
      + metric('Integration', ok ? 'ok' : 'prüfen', 'GET /api/hug/integration-check', ok ? 'ok' : 'warn')
      + metric('Cache', status && status.cacheLoadedAt ? status.cacheLoadedAt : '-', 'nur Anzeige')
      + metric('Rehug-Fenster', status && status.rehugWindowSeconds != null ? status.rehugWindowSeconds + 's' : '-', 'Konfiguration')
      + metric('Top-Limit', status && status.topLimit != null ? status.topLimit : '-', 'Konfiguration')
      + metric('Output-Modus', output.mode || '-', output.prefer || '-', output.mode === 'central' ? 'warn' : '')
      + metric('Summary', (summary.ok || 0)+' ok', (summary.warnings || 0)+' warn / '+(summary.errors || 0)+' err', summary.errors ? 'warn' : 'ok')
      + '</div></section>'
      + '<section class="hug-diag-ext-section"><div class="hug-diag-ext-title"><h4>Datenbank & Tabellen</h4><span>keine Migration</span></div><div class="hug-diag-ext-grid">'
      + metric('DB', db.adapter || '-', db.dialect || db.path || '-')
      + metric('User', counts.users ?? checkCount(integration, 'hug_users'), 'hug_users', checkOk(integration, 'hug_users') ? 'ok' : 'warn')
      + metric('Pair-Stats', counts.pairStats ?? checkCount(integration, 'hug_pair_stats'), 'hug_pair_stats', checkOk(integration, 'hug_pair_stats') ? 'ok' : 'warn')
      + metric('Pending Rehugs', counts.pendingRehugs ?? checkCount(integration, 'hug_pending_rehugs'), 'hug_pending_rehugs', checkOk(integration, 'hug_pending_rehugs') ? 'ok' : 'warn')
      + metric('Settings', checkCount(integration, 'hug_settings'), 'hug_settings', checkOk(integration, 'hug_settings') ? 'ok' : 'warn')
      + metric('Typen', counts.hugTypes ?? checkCount(integration, 'hug_types'), 'hug_types', checkOk(integration, 'hug_types') ? 'ok' : 'warn')
      + metric('Texte', counts.dbTexts ?? checkCount(integration, 'hug_texts'), 'hug_texts', checkOk(integration, 'hug_texts') ? 'ok' : 'warn')
      + metric('Textpaare', counts.hugTextPairs ?? checkCount(integration, 'hug_text_pairs'), 'hug_text_pairs', checkOk(integration, 'hug_text_pairs') ? 'ok' : 'warn')
      + '</div></section>'
      + '<section class="hug-diag-ext-section"><div class="hug-diag-ext-title"><h4>Hug-/Rehug-Statistiken</h4><span>nur Anzeige</span></div><div class="hug-diag-ext-grid">'
      + metric('Hugs vergeben', counts.totalHugsGiven ?? 0, 'gesamt')
      + metric('Hugs erhalten', counts.totalHugsReceived ?? 0, 'gesamt')
      + metric('Rehugs vergeben', counts.totalRehugsGiven ?? 0, 'gesamt')
      + metric('Rehugs erhalten', counts.totalRehugsReceived ?? 0, 'gesamt')
      + metric('Aktive User', counts.enabledUsers ?? 0, 'enabled=1')
      + metric('Inaktive User', counts.disabledUsers ?? 0, 'enabled=0')
      + metric('Recent Pairs', Array.isArray(status && status.recentPairs) ? status.recentPairs.length : 0, 'nur Anzeige')
      + metric('Toplisten', status && status.top ? Object.keys(status.top).length : 0, 'nur Statusdaten')
      + '</div></section>'
      + '<section class="hug-diag-ext-section"><div class="hug-diag-ext-title"><h4>Textsystem & Textpaare</h4><span>GET-only Editor-Daten</span></div><div class="hug-diag-ext-split"><div class="hug-diag-ext-list">'
      + row('Textpaare aktiv', activePairCount ?? '-', activePairCount ? 'ok' : 'warn')
      + row('Textpaare gesamt', pairCount ?? '-')
      + row('HugAll-Texte', hugAll && hugAll.count != null ? hugAll.count : counts.hugAllTexts ?? '-')
      + row('Response-Texte', responses && responses.count != null ? responses.count : '-')
      + row('TopTitle-Texte', topTitles && topTitles.count != null ? topTitles.count : '-')
      + '</div><div class="hug-diag-ext-list">'
      + row('Config-Datei', status && status.configPath ? status.configPath : '-')
      + row('Messages-Datei', status && status.messagesPath ? status.messagesPath : '-')
      + row('Letzter Import', status && status.lastImport ? (status.lastImport.importedAt || status.lastImport.reason || '-') : '-')
      + row('Letzter Fehler', status && status.lastError ? status.lastError : '-', status && status.lastError ? 'warn' : 'ok')
      + row('Aktive Textpaare Check', checkOk(integration, 'active_text_pairs') ? 'ok' : 'prüfen', checkOk(integration, 'active_text_pairs') ? 'ok' : 'warn')
      + '</div></div></section>'
      + '<section class="hug-diag-ext-section"><div class="hug-diag-ext-title"><h4>Routen-Sicherheit</h4><span>klar getrennt</span></div><div class="hug-diag-ext-routes"><details open><summary>Read-only genutzt ('+readOnlyRoutes.length+')</summary><div class="hug-diag-ext-route-list">'+routeList(readOnlyRoutes, 'ok')+'</div></details><details><summary>Produktiv gesperrt ('+blockedRoutes.length+')</summary><div class="hug-diag-ext-route-list">'+routeList(blockedRoutes, 'blocked')+'</div></details></div></section>'
      + '<section class="hug-card hug-diag-ext-card"><p class="hug-note">Hinweis: Die bestehenden Buttons „Neu laden“ und „Hug-Reload testen“ sind produktive Aktionen und wurden durch diese Erweiterung nicht betätigt. Diese Erweiterung liest nur GET-Diagnosedaten.</p></section>'
      + '</section>';
  }

  function removeOld(){
    const old = document.getElementById(EXT_ID);
    if (old) old.remove();
  }

  async function enhance(){
    if (!isDiagnosis() || busy) return;
    busy = true;
    try {
      const data = await Promise.all([
        api('/api/hug/status'),
        api('/api/hug/routes'),
        api('/api/hug/integration-check'),
        api('/api/hug/admin/text-pairs'),
        api('/api/hug/admin/hug-all-texts'),
        api('/api/hug/admin/response-texts'),
        api('/api/hug/admin/top-title-texts')
      ]);
      removeOld();
      const target = targetCard();
      if (target) target.insertAdjacentHTML('afterend', render(data[0], data[1], data[2], data[3], data[4], data[5], data[6]));
    } catch (err) {
      removeOld();
      const target = targetCard();
      if (target) target.insertAdjacentHTML('afterend', '<section id="'+EXT_ID+'" class="hug-card hug-diag-ext-card"><h3>Erweiterte Read-only-Diagnose</h3><p class="hug-error">'+esc(err.message || String(err))+'</p></section>');
    } finally {
      busy = false;
    }
  }

  function schedule(){
    setTimeout(enhance, 120);
    setTimeout(enhance, 500);
  }

  function boot(){
    document.addEventListener('click', function(ev){
      const tab = ev.target.closest && ev.target.closest('#hugModule [data-hug-tab]');
      if (!tab) return;
      if (tab.dataset.hugTab === 'diagnostics') schedule();
      else removeOld();
    }, true);
    window.addEventListener('cgn:module-show', function(ev){
      if (ev.detail && ev.detail.module === 'hug') schedule();
    });
    document.addEventListener('visibilitychange', function(){
      if (!document.hidden) schedule();
    });
    schedule();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.CGNHugDiagnosticsExt = { version: VERSION, refresh: enhance };
})();
