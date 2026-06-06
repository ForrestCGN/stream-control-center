window.Vip30Module = (function(){
  'use strict';

  const api = {
    status: '/api/vip30/status',
    slots: '/api/vip30/slots?limit=20',
    logs: '/api/vip30/logs?limit=12',
    externalRemove: '/api/vip30/external-vip-remove/status',
    cleanupCheck: '/api/vip30/cleanup/check',
    eventsubStatus: '/api/twitch/eventsub/status?refresh=1'
  };

  let root = null;
  let state = {
    loading: false,
    error: '',
    tab: 'overview',
    loadedAt: '',
    status: null,
    slots: null,
    logs: null,
    externalRemove: null,
    cleanupCheck: null,
    eventsubStatus: null
  };

  function esc(value){ return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function pickArray(source, keys){
    for (const key of keys) {
      if (Array.isArray(source?.[key])) return source[key];
    }
    return [];
  }
  function fmt(value){
    const clean = String(value ?? '').trim();
    return clean ? esc(clean) : '<span class="vip30-muted">-</span>';
  }
  function boolLabel(value){ return value === true ? 'Ja' : value === false ? 'Nein' : '-'; }
  function dateFmt(value){
    const clean = String(value || '').trim();
    if (!clean) return '-';
    const d = new Date(clean);
    if (Number.isNaN(d.getTime())) return clean;
    return d.toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
  }
  function badge(text, tone){ return `<span class="vip30-badge ${tone || ''}">${esc(text)}</span>`; }
  function apiErr(err){ return err && err.message ? err.message : String(err || 'Unbekannter Fehler'); }

  async function loadAll(force){
    root = document.getElementById('vip30Module');
    if (!root || !window.CGN) return;
    if (!force && state.status && state.slots && state.logs) { render(); return; }
    state.loading = true;
    state.error = '';
    render();
    try {
      const [status, slots, logs, externalRemove, cleanupCheck, eventsubStatus] = await Promise.all([
        window.CGN.api(api.status).catch(err => ({ ok:false, error:apiErr(err) })),
        window.CGN.api(api.slots).catch(err => ({ ok:false, error:apiErr(err), slots:[] })),
        window.CGN.api(api.logs).catch(err => ({ ok:false, error:apiErr(err), logs:[] })),
        window.CGN.api(api.externalRemove).catch(err => ({ ok:false, error:apiErr(err) })),
        window.CGN.api(api.cleanupCheck).catch(err => ({ ok:false, error:apiErr(err) })),
        window.CGN.api(api.eventsubStatus).catch(err => ({ ok:false, error:apiErr(err) }))
      ]);
      state = { ...state, loading:false, error:'', loadedAt:new Date().toISOString(), status, slots, logs, externalRemove, cleanupCheck, eventsubStatus };
    } catch (err) {
      state.loading = false;
      state.error = apiErr(err);
    }
    render();
  }

  function getSlots(){ return pickArray(state.slots, ['slots', 'rows', 'items']); }
  function getLogs(){ return pickArray(state.logs, ['logs', 'rows', 'items']); }
  function slotStatusCounts(){
    const counts = {};
    for (const slot of getSlots()) {
      const key = String(slot.status || 'unknown');
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }
  function activeSlotCount(){
    const status = state.status || {};
    const candidates = [status.activeSlots, status.activeSlotCount, status.slots?.active, status.counts?.activeSlots, status.counts?.active];
    for (const value of candidates) {
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
    return getSlots().filter(slot => String(slot.status || '').toLowerCase() === 'active').length;
  }
  function maxSlotCount(){
    const status = state.status || {};
    const candidates = [status.maxSlots, status.slots?.maxSlots, status.config?.slots?.maxSlots, status.settings?.slots?.maxSlots];
    for (const value of candidates) {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return 10;
  }
  function freeSlotCount(){ return Math.max(0, maxSlotCount() - activeSlotCount()); }
  function moduleVersion(){ return state.status?.moduleVersion || state.status?.version || state.status?.module?.version || '-'; }
  function moduleBuild(){ return state.status?.moduleBuild || state.status?.build || '-'; }

  function renderHero(){
    const active = activeSlotCount();
    const max = maxSlotCount();
    const free = freeSlotCount();
    const eventsub = state.eventsubStatus?.vipEventBus || {};
    const external = state.externalRemove || {};
    const cleanup = state.cleanupCheck || {};
    const healthy = state.status?.ok !== false && eventsub.configured === true && eventsub.knownRemove === true && external.subscribed === true;
    return `<section class="vip30-card vip30-hero glass">
      <div>
        <h2>👑 30 Tage VIP</h2>
        <p>Read-only Übersicht für VIP30-Slots, Logs, Cleanup, externen VIP-Entzug und Twitch EventSub.</p>
      </div>
      <div class="vip30-actions">
        <button type="button" data-vip30-refresh>Aktualisieren</button>
      </div>
      <div class="vip30-kpis">
        <div><strong>${esc(active)} / ${esc(max)}</strong><span>Aktive Slots</span></div>
        <div><strong>${esc(free)}</strong><span>Freie Slots</span></div>
        <div><strong>${eventsub.knownRemove === true ? 'OK' : 'Prüfen'}</strong><span>channel.vip.remove</span></div>
        <div><strong>${healthy ? 'Bereit' : 'Prüfen'}</strong><span>Systemstatus</span></div>
      </div>
      <div class="vip30-meta-row">
        <span>Version ${fmt(moduleVersion())}</span>
        <span>Build ${fmt(moduleBuild())}</span>
        <span>Geladen ${fmt(dateFmt(state.loadedAt))}</span>
        <span>Alert bewusst OFF</span>
      </div>
      ${state.error ? `<div class="vip30-error">${esc(state.error)}</div>` : ''}
    </section>`;
  }

  function renderTabs(){
    const tabs = [['overview','Übersicht'], ['slots','Slots'], ['logs','Logs'], ['diagnostics','Diagnose']];
    return `<div class="vip30-tabs glass">${tabs.map(([id,label]) => `<button type="button" class="${state.tab === id ? 'active' : ''}" data-vip30-tab="${esc(id)}">${esc(label)}</button>`).join('')}</div>`;
  }

  function renderOverview(){
    const eventsub = state.eventsubStatus?.vipEventBus || {};
    const external = state.externalRemove || {};
    const cleanup = state.cleanupCheck || {};
    const counts = slotStatusCounts();
    return `<div class="vip30-grid">
      <section class="vip30-card glass">
        <h3>Modul</h3>
        <div class="vip30-rows">
          <div><span>OK</span><strong>${badge(boolLabel(state.status?.ok !== false), state.status?.ok === false ? 'bad' : 'ok')}</strong></div>
          <div><span>Enabled</span><strong>${badge(boolLabel(state.status?.enabled), state.status?.enabled === false ? 'warn' : 'ok')}</strong></div>
          <div><span>Version</span><strong>${fmt(moduleVersion())}</strong></div>
          <div><span>Build</span><strong>${fmt(moduleBuild())}</strong></div>
          <div><span>Letzter Fehler</span><strong>${fmt(state.status?.lastError || state.status?.error || '')}</strong></div>
        </div>
      </section>
      <section class="vip30-card glass">
        <h3>Slots</h3>
        <div class="vip30-rows">
          <div><span>Aktiv</span><strong>${esc(activeSlotCount())}</strong></div>
          <div><span>Frei</span><strong>${esc(freeSlotCount())}</strong></div>
          <div><span>Max</span><strong>${esc(maxSlotCount())}</strong></div>
          <div><span>External Removed</span><strong>${esc(counts.external_removed || 0)}</strong></div>
          <div><span>Expired</span><strong>${esc(counts.expired || 0)}</strong></div>
        </div>
      </section>
      <section class="vip30-card glass">
        <h3>EventSub VIP</h3>
        <div class="vip30-rows">
          <div><span>Configured</span><strong>${badge(boolLabel(eventsub.configured), eventsub.configured ? 'ok' : 'bad')}</strong></div>
          <div><span>Known Remove</span><strong>${badge(boolLabel(eventsub.knownRemove), eventsub.knownRemove ? 'ok' : 'bad')}</strong></div>
          <div><span>Known Add</span><strong>${badge(boolLabel(eventsub.knownAdd), eventsub.knownAdd ? 'ok' : 'warn')}</strong></div>
          <div><span>Forwarded</span><strong>${esc(eventsub.forwarded ?? 0)}</strong></div>
          <div><span>Failed</span><strong>${esc(eventsub.failed ?? 0)}</strong></div>
        </div>
      </section>
      <section class="vip30-card glass">
        <h3>External VIP Remove</h3>
        <div class="vip30-rows">
          <div><span>Enabled</span><strong>${badge(boolLabel(external.enabled), external.enabled ? 'ok' : 'warn')}</strong></div>
          <div><span>Subscribed</span><strong>${badge(boolLabel(external.subscribed), external.subscribed ? 'ok' : 'bad')}</strong></div>
          <div><span>Received</span><strong>${esc(external.stats?.received ?? 0)}</strong></div>
          <div><span>Updated</span><strong>${esc(external.stats?.updated ?? 0)}</strong></div>
          <div><span>Letztes Event</span><strong>${fmt(dateFmt(external.lastEventAt))}</strong></div>
        </div>
      </section>
      <section class="vip30-card glass span-2">
        <h3>Cleanup Check</h3>
        <div class="vip30-rows">
          <div><span>Status</span><strong>${fmt(cleanup.safety?.status || cleanup.status || '')}</strong></div>
          <div><span>Armed</span><strong>${badge(boolLabel(cleanup.safety?.armed), cleanup.safety?.armed ? 'ok' : 'warn')}</strong></div>
          <div><span>Expired Count</span><strong>${esc(cleanup.expiredCount ?? 0)}</strong></div>
          <div><span>Blocker</span><strong>${fmt(arr(cleanup.safety?.blockers).join(', '))}</strong></div>
        </div>
        <p class="vip30-note">Read-only: Dieses Dashboard führt keinen Cleanup aus und löst keine Twitch-Aktion aus.</p>
      </section>
      <section class="vip30-card glass span-2">
        <h3>Letzte Logs</h3>
        ${logsTable(getLogs().slice(0, 5))}
      </section>
    </div>`;
  }

  function slotsTable(slots){
    if (!slots.length) return '<div class="vip30-empty">Keine Slots gefunden.</div>';
    return `<div class="vip30-table-wrap"><table class="vip30-table"><thead><tr><th>User</th><th>Status</th><th>Start</th><th>Ende</th><th>Quelle</th><th>Fehler</th></tr></thead><tbody>${slots.map(slot => {
      const status = String(slot.status || 'unknown');
      const tone = status === 'active' ? 'ok' : status === 'external_removed' || status === 'expired' ? 'warn' : status === 'failed' ? 'bad' : '';
      return `<tr><td><strong>${esc(slot.userDisplayName || slot.user_display_name || slot.userLogin || slot.user_login || '-')}</strong><small>${esc(slot.userLogin || slot.user_login || slot.userId || slot.user_id || '')}</small></td><td>${badge(status, tone)}</td><td>${fmt(dateFmt(slot.startUtc || slot.start_utc))}</td><td>${fmt(dateFmt(slot.endUtc || slot.end_utc))}</td><td>${fmt(slot.source || '')}</td><td>${fmt(slot.lastError || slot.last_error || '')}</td></tr>`;
    }).join('')}</tbody></table></div>`;
  }

  function logsTable(logs){
    if (!logs.length) return '<div class="vip30-empty">Keine Logs gefunden.</div>';
    return `<div class="vip30-table-wrap"><table class="vip30-table"><thead><tr><th>Zeit</th><th>Event</th><th>User</th><th>Erfolg</th><th>Grund</th><th>Meldung</th></tr></thead><tbody>${logs.map(log => {
      const success = log.success === true || log.success === 1 || log.success === '1';
      return `<tr><td>${fmt(dateFmt(log.createdAt || log.created_at))}</td><td>${fmt(log.eventType || log.event_type)}</td><td>${fmt(log.userLogin || log.user_login)}</td><td>${badge(success ? 'True' : 'False', success ? 'ok' : 'bad')}</td><td>${fmt(log.reason)}</td><td>${fmt(log.message)}</td></tr>`;
    }).join('')}</tbody></table></div>`;
  }

  function renderSlots(){
    return `<section class="vip30-card glass"><div class="vip30-card-head"><div><h3>VIP30 Slots</h3><p>Read-only Slotliste. Status ` + '`active`' + ` zählt gegen die Slotgrenze, ` + '`external_removed`' + ` nicht.</p></div><button type="button" data-vip30-refresh>Aktualisieren</button></div>${slotsTable(getSlots())}</section>`;
  }

  function renderLogs(){
    return `<section class="vip30-card glass"><div class="vip30-card-head"><div><h3>VIP30 Logs</h3><p>Die letzten VIP30-Ereignisse aus dem Backend.</p></div><button type="button" data-vip30-refresh>Aktualisieren</button></div>${logsTable(getLogs())}</section>`;
  }

  function jsonBlock(title, data){
    return `<section class="vip30-card glass"><h3>${esc(title)}</h3><pre class="vip30-json">${esc(JSON.stringify(data || {}, null, 2))}</pre></section>`;
  }

  function renderDiagnostics(){
    return `<div class="vip30-grid">
      ${jsonBlock('VIP30 Status', state.status)}
      ${jsonBlock('External VIP Remove', state.externalRemove)}
      ${jsonBlock('Cleanup Check', state.cleanupCheck)}
      ${jsonBlock('Twitch EventSub Status', state.eventsubStatus)}
    </div>`;
  }

  function renderBody(){
    if (state.loading) return '<section class="vip30-card glass"><h3>Lade VIP30-Daten...</h3><p class="vip30-muted">Bitte kurz warten.</p></section>';
    if (state.tab === 'slots') return renderSlots();
    if (state.tab === 'logs') return renderLogs();
    if (state.tab === 'diagnostics') return renderDiagnostics();
    return renderOverview();
  }

  function render(){
    root = document.getElementById('vip30Module');
    if (!root) return;
    root.innerHTML = `<div class="vip30-admin-wrap">${renderHero()}${renderTabs()}${renderBody()}</div>`;
    bind();
  }

  function bind(){
    root?.querySelectorAll('[data-vip30-refresh]').forEach(btn => btn.addEventListener('click', () => loadAll(true)));
    root?.querySelectorAll('[data-vip30-tab]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.vip30Tab || 'overview'; render(); }));
  }

  window.addEventListener('cgn:module-show', ev => { if (ev.detail?.module === 'vip30') loadAll(false); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { root = document.getElementById('vip30Module'); });
  else root = document.getElementById('vip30Module');

  return { loadAll, render };
})();
