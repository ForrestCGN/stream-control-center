
'use strict';

(function(){
  const VERSION = '0.1.0-can36-3c';
  const MODULE_ID = 'messageRotatorModule';
  const EXT_ID = 'messageRotatorDiagnosisExtension';
  let busy = false;

  const readOnlyRoutes = [
    'GET /api/message-rotator/status',
    'GET /api/message-rotator/routes',
    'GET /api/message-rotator/integration-check'
  ];
  const blockedRoutes = [
    'GET/POST /api/message-rotator/start',
    'GET/POST /api/message-rotator/stop',
    'GET/POST /api/message-rotator/tick',
    'GET/POST /api/message-rotator/next',
    'GET/POST /api/message-rotator/manual',
    'GET/POST /api/message-rotator/reload',
    'GET/POST /api/message-rotator/live-status',
    'POST /api/message-rotator/admin/settings',
    'POST /api/message-rotator/admin/texts'
  ];

  function esc(v){
    return window.CGN && window.CGN.esc
      ? window.CGN.esc(v)
      : String(v == null ? '' : v).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }
  function root(){ return document.getElementById(MODULE_ID); }
  function isDiagnosis(){
    const r = root();
    if (!r || r.hidden) return false;
    const active = r.querySelector('.mr-tabs button.active');
    return active && active.dataset.mrTab === 'diagnostics';
  }
  async function api(path){
    if (window.CGN && window.CGN.api) return window.CGN.api(path);
    const res = await fetch(path, { cache:'no-store' });
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    return res.json();
  }
  function yes(v){ return v ? 'ja' : 'nein'; }
  function metric(label, value, note, cls){
    return '<div class="mr-diag-ext-metric '+esc(cls||'')+'"><span>'+esc(label)+'</span><strong>'+esc(value)+'</strong>'+(note?'<small>'+esc(note)+'</small>':'')+'</div>';
  }
  function row(label, value, cls){
    return '<div class="mr-diag-ext-row '+esc(cls||'')+'"><span>'+esc(label)+'</span><strong>'+esc(value)+'</strong></div>';
  }
  function routes(list, cls){
    return list.map(x => '<span class="mr-diag-ext-route '+esc(cls)+'">'+esc(x)+'</span>').join('');
  }
  function samples(obj){
    const vals = obj && typeof obj === 'object' ? Object.values(obj) : [];
    return { total: vals.length, ok: vals.filter(x => x && x.ok).length };
  }
  function render(status, routesPayload, integration){
    const checks = integration && integration.checks ? integration.checks : {};
    const cfg = status && status.config ? status.config : {};
    const opts = cfg.messageOptions || {};
    const rt = cfg.runtime || {};
    const items = Array.isArray(cfg.items) ? cfg.items : [];
    const activeItems = items.filter(x => x && x.enabled).length;
    const manualItems = items.filter(x => x && x.manualEnabled).length;
    const smp = samples(checks.samples || {});
    const live = checks.liveStatusConfig || cfg.liveStatus || {};
    const warnings = Array.isArray(integration && integration.warnings) ? integration.warnings : [];
    const errors = Array.isArray(integration && integration.errors) ? integration.errors : [];
    const healthy = integration && integration.ok === true && integration.healthy !== false && errors.length === 0;

    return '<section id="'+EXT_ID+'" class="mr-diag-ext" data-version="'+esc(VERSION)+'">'
      + '<section class="mr-card mr-diag-ext-card mr-diag-ext-head"><div><h3>Erweiterte Read-only-Diagnose</h3><p>In den vorhandenen Diagnose-Tab integriert. Kein Start/Stop, kein Tick, kein Next/Manual, keine Preview, kein Reload, kein Live-Status-Force.</p></div><div class="mr-diag-ext-pills"><span class="mr-pill '+(healthy?'ok':'warn')+'">'+(healthy?'READ-ONLY OK':'PRÜFEN')+'</span><span class="mr-pill '+(status && status.active?'ok':'warn')+'">'+(status && status.active?'läuft':'gestoppt')+'</span><span class="mr-pill '+(opts.deliveryMode === 'backend'?'warn':'ok')+'">'+esc(opts.deliveryMode || 'backend')+'</span></div></section>'
      + '<section class="mr-diag-ext-section"><div class="mr-diag-ext-title"><h4>Status & Runtime</h4><span>nur Statusdaten</span></div><div class="mr-diag-ext-grid">'
      + metric('Integration', healthy ? 'ok' : 'prüfen', 'Integration-Check', healthy?'ok':'warn')
      + metric('Rotator aktiv', yes(status && status.active), status && status.active ? 'läuft' : 'gestoppt', status && status.active?'ok':'')
      + metric('Chat-Zähler', status && status.chatMessagesSinceLastSend != null ? status.chatMessagesSinceLastSend : 0, 'seit letzter Ausgabe')
      + metric('SendCount', status && status.sendCount != null ? status.sendCount : 0, 'Ausgaben')
      + metric('Ticks', status && status.totalTicks != null ? status.totalTicks : 0, 'ignoriert '+(status && status.ignoredTicks != null ? status.ignoredTicks : 0))
      + metric('Letztes Item', status && status.lastItemId ? status.lastItemId : '-', status && status.lastMessageKey ? status.lastMessageKey : '-')
      + metric('Letzte Ausgabe', status && status.lastSentAt ? status.lastSentAt : '-', 'nur Anzeige')
      + metric('Warnings/Errors', warnings.length+'/'+errors.length, 'Integration', errors.length ? 'warn' : (warnings.length ? 'warn' : 'ok'))
      + '</div></section>'
      + '<section class="mr-diag-ext-section"><div class="mr-diag-ext-title"><h4>Konfiguration & Items</h4><span>keine Änderung</span></div><div class="mr-diag-ext-split"><div class="mr-diag-ext-list">'
      + row('Config aktiviert', yes(cfg.enabled), cfg.enabled?'ok':'warn')
      + row('Config-Quelle', (status.configInfo && status.configInfo.settingsSource) || (checks.config && checks.config.source) || '-')
      + row('Settings-Tabelle', (status.configInfo && status.configInfo.settingsTable) || (checks.config && checks.config.settingsTable) || '-')
      + row('Items gesamt', items.length || (checks.config && checks.config.itemCount) || 0)
      + row('Items aktiv', activeItems || (checks.config && checks.config.enabledItems) || 0, activeItems?'ok':'warn')
      + row('Manual-Items', manualItems)
      + '</div><div class="mr-diag-ext-list">'
      + row('Output-Modus', opts.outputMode || 'chat')
      + row('Delivery-Modus', opts.deliveryMode || 'backend', opts.deliveryMode === 'backend' ? 'warn' : 'ok')
      + row('Announcement-Farbe', opts.announcementColor || '-')
      + row('Only when live', yes(rt.onlyWhenLive))
      + row('Min. Chat', rt.minChatMessagesBetweenRotations != null ? rt.minChatMessagesBetweenRotations : '-')
      + row('Global Cooldown', (rt.globalCooldownMinutes != null ? rt.globalCooldownMinutes : '-') + ' min')
      + '</div></div></section>'
      + '<section class="mr-diag-ext-section"><div class="mr-diag-ext-title"><h4>Textsystem & Samples</h4><span>keine Ausgabe</span></div><div class="mr-diag-ext-grid">'
      + metric('Texthelper OK', checks.texts && checks.texts.ok === false ? 'nein' : 'ja', checks.texts && checks.texts.error ? checks.texts.error : 'helper status', checks.texts && checks.texts.ok === false ? 'warn' : 'ok')
      + metric('Samples', smp.ok+'/'+smp.total, 'renderbare Beispieltexte', smp.ok === smp.total ? 'ok' : 'warn')
      + metric('Message-Files', checks.messageFiles ? Object.keys(checks.messageFiles).length : 0, 'geprüfte Dateien')
      + metric('Config-Datei', checks.files && checks.files.config && checks.files.config.ok ? 'ok' : 'prüfen', checks.files && checks.files.config ? checks.files.config.path : '-', checks.files && checks.files.config && checks.files.config.ok ? 'ok' : 'warn')
      + '</div></section>'
      + '<section class="mr-diag-ext-section"><div class="mr-diag-ext-title"><h4>Live-Status-Konfiguration</h4><span>keine Force-Abfrage</span></div><div class="mr-diag-ext-split"><div class="mr-diag-ext-list">'
      + row('Live-Status aktiv', yes(live.enabled), live.enabled?'ok':'')
      + row('Modus', live.mode || '-')
      + row('Fail closed', yes(live.failClosed), live.failClosed?'warn':'')
      + row('Cache Sekunden', live.cacheSeconds != null ? live.cacheSeconds : '-')
      + '</div><div class="mr-diag-ext-list">'
      + row('Runtime online', status.liveStatus && status.liveStatus.online != null ? yes(status.liveStatus.online) : '-', status.liveStatus && status.liveStatus.online ? 'ok':'')
      + row('Runtime Grund', status.liveStatus && status.liveStatus.reason ? status.liveStatus.reason : '-')
      + row('Runtime Cache-Alter', status.liveStatus && status.liveStatus.ageSeconds != null ? status.liveStatus.ageSeconds + 's' : '-')
      + row('Quelle', status.liveStatus && status.liveStatus.source ? status.liveStatus.source : '-')
      + '</div></div></section>'
      + '<section class="mr-diag-ext-section"><div class="mr-diag-ext-title"><h4>Routen-Sicherheit</h4><span>klar getrennt</span></div><div class="mr-diag-ext-routes"><details open><summary>Read-only genutzt ('+readOnlyRoutes.length+')</summary><div class="mr-diag-ext-route-list">'+routes(readOnlyRoutes,'ok')+'</div></details><details><summary>Produktiv gesperrt ('+blockedRoutes.length+')</summary><div class="mr-diag-ext-route-list">'+routes(blockedRoutes,'blocked')+'</div></details></div></section>'
      + '</section>';
  }
  function removeOld(){ const old = document.getElementById(EXT_ID); if (old) old.remove(); }
  async function enhance(){
    if (!isDiagnosis() || busy) return;
    busy = true;
    try {
      const data = await Promise.all([
        api('/api/message-rotator/status'),
        api('/api/message-rotator/routes'),
        api('/api/message-rotator/integration-check')
      ]);
      removeOld();
      const target = root() && root().querySelector('.mr-card');
      if (target) target.insertAdjacentHTML('afterend', render(data[0], data[1], data[2]));
    } catch (err) {
      removeOld();
      const target = root() && root().querySelector('.mr-card');
      if (target) target.insertAdjacentHTML('afterend', '<section id="'+EXT_ID+'" class="mr-card mr-diag-ext-card"><h3>Erweiterte Read-only-Diagnose</h3><p class="mr-error">'+esc(err.message || String(err))+'</p></section>');
    } finally {
      busy = false;
    }
  }
  function schedule(){ setTimeout(enhance, 100); setTimeout(enhance, 450); }
  function boot(){
    document.addEventListener('click', function(ev){
      const tab = ev.target.closest && ev.target.closest('#messageRotatorModule [data-mr-tab]');
      if (!tab) return;
      if (tab.dataset.mrTab === 'diagnostics') schedule();
      else removeOld();
    }, true);
    window.addEventListener('cgn:module-show', function(ev){ if (ev.detail && ev.detail.module === 'message_rotator') schedule(); });
    document.addEventListener('visibilitychange', function(){ if (!document.hidden) schedule(); });
    schedule();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.CGNMessageRotatorDiagnosticsExt = { version: VERSION, refresh: enhance };
})();
