window.Vip30Module = (function(){
  'use strict';

  const api = {
    status: '/api/vip30/status',
    slots: '/api/vip30/slots?limit=20',
    logs: '/api/vip30/logs?limit=12',
    externalRemove: '/api/vip30/external-vip-remove/status',
    cleanupCheck: '/api/vip30/cleanup/check',
    eventsubStatus: '/api/twitch/eventsub/status?refresh=1',
    settings: '/api/vip30/settings',
    settingsSave: '/api/vip30/settings/save',
    alertTest: '/api/vip30/alert/test'
  };

  const SAFE_EDIT_KEYS = new Set([
    'alerts.enabled',
    'alerts.soundKey',
    'alerts.mediaId',
    'alerts.soundPool',
    'alerts.overlaySets',
    'logging.enabled',
    'reward.title',
    'reward.prompt',
    'slots.maxSlots',
    'slots.durationDays',
    'cleanup.releaseSlotOnExternalVipRemove'
  ]);

  const CRITICAL_PREFIXES = ['live.', 'twitch.', 'bridge.', 'channelpoints.'];
  const CRITICAL_KEYS = new Set([
    'cleanup.enabled',
    'cleanup.removeVipOnExpire',
    'enabled'
  ]);

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
    eventsubStatus: null,
    settings: null,
    saving: false,
    saveMessage: '',
    saveError: '',
    actionRunning: '',
    actionMessage: '',
    actionError: '',
    autoRefreshEnabled: true,
    autoRefreshMs: 10000,
    autoRefreshLastAt: '',
    autoRefreshPausedReason: '',
    pendingServerRefresh: false,
    alertTestUser: ''
  };

  const editBuffer = {};
  const dirtyKeys = new Set();
  let autoRefreshTimer = null;

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
  function settingRows(){ return arr(state.settings?.settings); }
  function getSettingRow(key){
    const clean = String(key || '');
    return settingRows().find(row => String(row.key || '') === clean) || null;
  }
  function getSettingValue(key, fallback = ''){
    const row = getSettingRow(key);
    return row ? row.value : fallback;
  }
  function isCriticalSetting(key){
    const clean = String(key || '');
    return CRITICAL_KEYS.has(clean) || CRITICAL_PREFIXES.some(prefix => clean.startsWith(prefix));
  }
  function isSafeEditable(row){
    return row && row.editable === true && SAFE_EDIT_KEYS.has(String(row.key || ''));
  }
  function settingTone(row){
    if (isSafeEditable(row)) return 'ok';
    if (isCriticalSetting(row?.key)) return 'bad';
    if (row?.editable === true) return 'warn';
    return '';
  }
  function typeValue(row, raw){
    if (!row) return raw;
    if (row.type === 'boolean') return raw === true || raw === 'true' || raw === '1' || raw === 'on';
    if (row.type === 'integer') {
      const n = Number.parseInt(String(raw ?? ''), 10);
      return Number.isFinite(n) ? n : 0;
    }
    if (row.type === 'json') {
      const text = String(raw ?? '').trim();
      if (!text) return [];
      try { return JSON.parse(text); }
      catch (err) { throw new Error(`JSON ungültig bei ${row.key}: ${err.message || err}`); }
    }
    return String(raw ?? '');
  }

  function setDirtyValue(key, value){
    const clean = String(key || '');
    if (!clean) return;
    dirtyKeys.add(clean);
    editBuffer[clean] = value;
    state.pendingServerRefresh = true;
  }

  function clearDirtyValues(keys){
    if (!Array.isArray(keys)) {
      dirtyKeys.clear();
      Object.keys(editBuffer).forEach(key => delete editBuffer[key]);
      state.pendingServerRefresh = false;
      return;
    }
    keys.forEach(key => {
      dirtyKeys.delete(key);
      delete editBuffer[key];
    });
    state.pendingServerRefresh = dirtyKeys.size > 0;
  }

  function hasDirtyEdits(){
    return dirtyKeys.size > 0;
  }

  function dirtyLabel(){
    const count = dirtyKeys.size;
    return count ? `${count} ungespeicherte Änderung${count === 1 ? '' : 'en'}` : '';
  }

  function isEditingForm(){
    const active = document.activeElement;
    if (!active || !root || !root.contains(active)) return false;
    return !!active.closest('[data-vip30-setting-input], [data-vip30-overlay-field], [data-media-field], input, textarea, select');
  }

  function currentSettingValue(row){
    const key = String(row?.key || '');
    return dirtyKeys.has(key) ? editBuffer[key] : row?.value;
  }

  function jsonTextForSetting(row){
    const value = currentSettingValue(row);
    try { return JSON.stringify(value ?? [], null, 2); }
    catch (_) { return String(row?.rawValue || '[]'); }
  }

  function parseOverlaySetsValue(value){
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        return [];
      }
    }
    return [];
  }

  function normalizeOverlaySetForUi(raw, index){
    const set = raw && typeof raw === 'object' ? raw : {};
    const perks = Array.isArray(set.perks)
      ? set.perks.map(item => String(item || '').trim()).filter(Boolean)
      : String(set.perks || '').split(/[|;,\n]/).map(item => item.trim()).filter(Boolean);
    return {
      id: String(set.id || `vip30-set-${index + 1}`).trim(),
      enabled: set.enabled !== false,
      weight: Number.isFinite(Number(set.weight)) ? Math.max(0, Number.parseInt(String(set.weight), 10)) : 1,
      kicker: String(set.kicker || '').trim(),
      headline: String(set.headline || '').trim(),
      subline: String(set.subline || '').trim(),
      message: String(set.message || '').trim(),
      perks,
      brand: String(set.brand || '').trim()
    };
  }

  function getOverlaySetsForUi(){
    const row = getSettingRow('alerts.overlaySets');
    return parseOverlaySetsValue(currentSettingValue(row)).map(normalizeOverlaySetForUi);
  }

  function defaultOverlaySet(index){
    return {
      id: `custom-${Date.now()}-${index + 1}`,
      enabled: true,
      weight: 1,
      kicker: 'Upgrade im CGN-Altersheim',
      headline: '{displayName} wird Ehrenbewohner.',
      subline: 'Die Rentner begrüßen freundlich, die Heimleitung nickt anerkennend.',
      message: 'Ein kleines VIP-Upgrade wurde genehmigt.',
      perks: ['Keks extra', 'Klecks Soße mehr', 'gemütlicherer Sessel'],
      brand: 'CGN VIP-Lounge'
    };
  }

  function parseSoundPoolValue(value){
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        return [];
      }
    }
    return [];
  }

  function normalizeSoundPoolItemForUi(raw, index){
    const item = raw && typeof raw === 'object' ? raw : {};
    return {
      id: String(item.id || `vip30-sound-${index + 1}`).trim(),
      enabled: item.enabled !== false,
      weight: Number.isFinite(Number(item.weight)) ? Math.max(0, Number.parseInt(String(item.weight), 10)) : 1,
      mediaId: Number.isFinite(Number(item.mediaId || item.media_id)) ? Number.parseInt(String(item.mediaId || item.media_id), 10) : 0,
      mediaPath: String(item.mediaPath || item.media_path || '').trim(),
      durationMs: Number.isFinite(Number(item.durationMs || item.duration_ms || item.lengthMs || item.length_ms)) ? Math.max(0, Number.parseInt(String(item.durationMs || item.duration_ms || item.lengthMs || item.length_ms), 10)) : 0,
      label: String(item.label || item.name || item.title || `VIP30 Sound ${index + 1}`).trim()
    };
  }

  function getSoundPoolForUi(){
    const row = getSettingRow('alerts.soundPool');
    const pool = parseSoundPoolValue(currentSettingValue(row)).map(normalizeSoundPoolItemForUi);
    const mediaRow = getSettingRow('alerts.mediaId');
    const fallbackMediaId = Number.parseInt(String(currentSettingValue(mediaRow) || 0), 10);
    if (!pool.length && Number.isFinite(fallbackMediaId) && fallbackMediaId > 0) {
      return [{
        id: 'default-media',
        enabled: true,
        weight: 1,
        mediaId: fallbackMediaId,
        mediaPath: '',
        durationMs: 0,
        label: 'VIP30 Sound'
      }];
    }
    return pool;
  }

  function defaultSoundPoolItem(index){
    return {
      id: `vip30-sound-${Date.now()}-${index + 1}`,
      enabled: true,
      weight: 1,
      mediaId: 0,
      mediaPath: '',
      durationMs: 0,
      label: `VIP30 Sound ${index + 1}`
    };
  }

  function readSoundPoolFromDom(){
    const cards = Array.from(root?.querySelectorAll('[data-vip30-sound-item]') || []);
    return cards.map((card, index) => {
      const value = name => {
        const el = card.querySelector(`[data-vip30-sound-field="${name}"]`);
        if (!el) return '';
        if (el.type === 'checkbox') return el.checked === true;
        return String(el.value || '');
      };
      return normalizeSoundPoolItemForUi({
        id: value('id') || `vip30-sound-${index + 1}`,
        enabled: value('enabled'),
        weight: value('weight'),
        mediaId: value('mediaId'),
        mediaPath: value('mediaPath'),
        durationMs: value('durationMs'),
        label: value('label')
      }, index);
    });
  }

  function syncSoundPoolFromDom(){
    const pool = readSoundPoolFromDom();
    setDirtyValue('alerts.soundPool', pool);
    const hidden = root?.querySelector('[data-vip30-setting-input="alerts.soundPool"]');
    if (hidden) hidden.value = JSON.stringify(pool, null, 2);
    state.saveMessage = 'Sound-Pool geändert. Bitte Sounds speichern.';
    state.saveError = '';
  }

  function readOverlaySetsFromDom(){
    const cards = Array.from(root?.querySelectorAll('[data-vip30-overlay-set]') || []);
    return cards.map((card, index) => {
      const value = name => {
        const el = card.querySelector(`[data-vip30-overlay-field="${name}"]`);
        if (!el) return '';
        if (el.type === 'checkbox') return el.checked === true;
        return String(el.value || '');
      };
      return normalizeOverlaySetForUi({
        id: value('id') || `vip30-set-${index + 1}`,
        enabled: value('enabled'),
        weight: value('weight'),
        kicker: value('kicker'),
        headline: value('headline'),
        subline: value('subline'),
        message: value('message'),
        perks: String(value('perks') || '').split(/\r?\n/).map(item => item.trim()).filter(Boolean),
        brand: value('brand')
      }, index);
    });
  }

  function syncOverlaySetsFromDom(){
    const sets = readOverlaySetsFromDom();
    setDirtyValue('alerts.overlaySets', sets);
    const hidden = root?.querySelector('[data-vip30-setting-input="alerts.overlaySets"]');
    if (hidden) hidden.value = JSON.stringify(sets, null, 2);
    state.saveMessage = 'Overlay-Textsets geändert. Bitte sichere Settings speichern.';
    state.saveError = '';
  }

  async function autoRefresh(){
    root = document.getElementById('vip30Module');
    if (!root || !window.CGN || !state.autoRefreshEnabled) return;
    if (!state.status && !state.slots && !state.logs) return;

    const editing = ['settings', 'sounds', 'texts'].includes(state.tab) && (hasDirtyEdits() || isEditingForm());
    try {
      const [status, slots, logs, externalRemove, cleanupCheck, eventsubStatus] = await Promise.all([
        window.CGN.api(api.status).catch(err => ({ ok:false, error:apiErr(err) })),
        window.CGN.api(api.slots).catch(err => ({ ok:false, error:apiErr(err), slots:[] })),
        window.CGN.api(api.logs).catch(err => ({ ok:false, error:apiErr(err), logs:[] })),
        window.CGN.api(api.externalRemove).catch(err => ({ ok:false, error:apiErr(err) })),
        window.CGN.api(api.cleanupCheck).catch(err => ({ ok:false, error:apiErr(err) })),
        window.CGN.api(api.eventsubStatus).catch(err => ({ ok:false, error:apiErr(err) }))
      ]);
      state = {
        ...state,
        status,
        slots,
        logs,
        externalRemove,
        cleanupCheck,
        eventsubStatus,
        autoRefreshLastAt: new Date().toISOString(),
        autoRefreshPausedReason: editing ? 'Eingabe geschützt' : '',
        pendingServerRefresh: editing || state.pendingServerRefresh
      };
      if (!editing) render();
    } catch (err) {
      state.autoRefreshPausedReason = apiErr(err);
      if (!editing) render();
    }
  }

  function startAutoRefresh(){
    if (autoRefreshTimer) window.clearInterval(autoRefreshTimer);
    autoRefreshTimer = window.setInterval(() => autoRefresh(), state.autoRefreshMs || 10000);
  }


  async function loadAll(force){
    root = document.getElementById('vip30Module');
    if (!root || !window.CGN) return;
    if (!force && state.status && state.slots && state.logs && state.settings) { render(); return; }
    state.loading = true;
    state.error = '';
    state.saveError = '';
    state.saveMessage = '';
    render();
    try {
      const [status, slots, logs, externalRemove, cleanupCheck, eventsubStatus, settings] = await Promise.all([
        window.CGN.api(api.status).catch(err => ({ ok:false, error:apiErr(err) })),
        window.CGN.api(api.slots).catch(err => ({ ok:false, error:apiErr(err), slots:[] })),
        window.CGN.api(api.logs).catch(err => ({ ok:false, error:apiErr(err), logs:[] })),
        window.CGN.api(api.externalRemove).catch(err => ({ ok:false, error:apiErr(err) })),
        window.CGN.api(api.cleanupCheck).catch(err => ({ ok:false, error:apiErr(err) })),
        window.CGN.api(api.eventsubStatus).catch(err => ({ ok:false, error:apiErr(err) })),
        window.CGN.api(api.settings).catch(err => ({ ok:false, error:apiErr(err), settings:[] }))
      ]);
      state = { ...state, loading:false, error:'', loadedAt:new Date().toISOString(), status, slots, logs, externalRemove, cleanupCheck, eventsubStatus, settings };
    } catch (err) {
      state.loading = false;
      state.error = apiErr(err);
    }
    render();
  }

  async function refreshPart(key, label){
    root = document.getElementById('vip30Module');
    if (!root || !window.CGN) return;
    if (!api[key]) {
      state.actionError = `Unbekannte Diagnose-Aktion: ${key}`;
      state.actionMessage = '';
      render();
      return;
    }

    state.actionRunning = key;
    state.actionError = '';
    state.actionMessage = '';
    render();

    try {
      const result = await window.CGN.api(api[key]);
      state[key] = result;
      state.loadedAt = new Date().toISOString();
      state.actionRunning = '';
      state.actionMessage = `${label || key} wurde neu geladen.`;
      render();
    } catch (err) {
      state.actionRunning = '';
      state.actionError = `${label || key}: ${apiErr(err)}`;
      render();
    }
  }

  async function saveSettings(){
    root = document.getElementById('vip30Module');
    if (!root || !window.CGN) return;
    const updates = {};
    const rowsByKey = new Map(settingRows().map(row => [String(row.key || ''), row]));
    try {
      root.querySelectorAll('[data-vip30-setting-input]').forEach(input => {
        const key = String(input.dataset.vip30SettingInput || '');
        const row = rowsByKey.get(key);
        if (!row || !isSafeEditable(row)) return;
        if (row.type === 'boolean') updates[key] = input.checked === true;
        else updates[key] = typeValue(row, input.value);
      });
    } catch (err) {
      state.saveError = apiErr(err);
      state.saveMessage = '';
      render();
      return;
    }
    if (!Object.keys(updates).length) {
      state.saveError = 'Keine sicheren editierbaren Einstellungen gefunden.';
      state.saveMessage = '';
      render();
      return;
    }

    state.saving = true;
    state.saveError = '';
    state.saveMessage = '';
    render();

    try {
      Object.keys(editBuffer).forEach(key => {
        const row = rowsByKey.get(key);
        if (row && isSafeEditable(row)) updates[key] = editBuffer[key];
      });
      const result = await window.CGN.api(api.settingsSave, {
        method: 'POST',
        body: JSON.stringify({ settings: updates, source: 'dashboard_vip30_step8_15_overlayset_editor' })
      });
      state.saving = false;
      state.settings = result.settings || state.settings;
      const changedKeys = (result.changed || []).map(item => item.key);
      clearDirtyValues(changedKeys);
      state.saveMessage = `Gespeichert: ${changedKeys.join(', ') || 'keine Änderung'}`;
      state.saveError = arr(result.rejected).length ? `Teilweise abgelehnt: ${arr(result.rejected).map(item => `${item.key}:${item.reason}`).join(', ')}` : '';
      await loadAll(true);
      state.saveMessage = `Gespeichert: ${changedKeys.join(', ') || 'keine Änderung'}`;
    } catch (err) {
      state.saving = false;
      state.saveError = apiErr(err);
      render();
    }
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
    const settings = state.settings || {};
    const candidates = [status.maxSlots, status.slots?.maxSlots, settings.effective?.slots?.maxSlots, status.config?.slots?.maxSlots, status.settings?.slots?.maxSlots];
    for (const value of candidates) {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return 10;
  }
  function freeSlotCount(){ return Math.max(0, maxSlotCount() - activeSlotCount()); }
  function moduleVersion(){ return state.status?.moduleVersion || state.status?.version || state.status?.module?.version || state.settings?.moduleVersion || '-'; }
  function moduleBuild(){ return state.status?.moduleBuild || state.status?.build || state.settings?.moduleBuild || '-'; }

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
        <h2>30 Tage VIP</h2>
        <p>Übersicht und sichere Konfiguration für VIP30-Slots, Logs, Cleanup, externen VIP-Entzug und Twitch EventSub.</p>
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
        <span>Settings ${fmt(state.settings?.rows ?? '-')} / ${fmt(state.settings?.definitions ?? '-')}</span>
        <span>Geladen ${fmt(dateFmt(state.loadedAt))}</span>
      </div>
      ${state.error ? `<div class="vip30-error">${esc(state.error)}</div>` : ''}
    </section>`;
  }

  function renderTabs(){
    const tabs = [['overview','Übersicht'], ['slots','Slots'], ['logs','Logs'], ['settings','Config'], ['sounds','Sounds'], ['texts','Texte'], ['actions','Aktionen'], ['diagnostics','Diagnose']];
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

  function settingInput(row){
    const key = esc(row.key);
    const disabled = !isSafeEditable(row);
    const attr = `data-vip30-setting-input="${key}" ${disabled ? 'disabled' : ''}`;
    const value = currentSettingValue(row);
    if (row.type === 'boolean') {
      return `<label class="vip30-switch"><input type="checkbox" ${attr} ${value === true ? 'checked' : ''}><span></span></label>`;
    }
    if (row.type === 'integer') {
      return `<input class="vip30-setting-control" type="number" min="0" step="1" value="${esc(value)}" ${attr}>`;
    }
    if (row.type === 'json') {
      return `<textarea class="vip30-setting-control vip30-json-control" rows="12" spellcheck="false" ${attr}>${esc(jsonTextForSetting(row))}</textarea>`;
    }
    return `<input class="vip30-setting-control" type="text" value="${esc(value)}" ${attr}>`;
  }

  function renderSettings(){
    const rows = settingRows();
    if (!rows.length) {
      return `<section class="vip30-card glass"><h3>Config</h3><div class="vip30-empty">Keine Settings geladen.</div></section>`;
    }

    const safeRows = rows.filter(row => isSafeEditable(row) && !['alerts.mediaId', 'alerts.soundPool', 'alerts.overlaySets'].includes(String(row.key || '')));
    const lockedRows = rows.filter(row => !isSafeEditable(row));
    const lockedByCategory = lockedRows.reduce((acc, row) => {
      const cat = row.category || 'sonstige';
      (acc[cat] ||= []).push(row);
      return acc;
    }, {});
    const lockedCategories = Object.keys(lockedByCategory).sort();

    return `<section class="vip30-card glass vip30-config">
      <div class="vip30-card-head">
        <div>
          <h3>VIP30 Config</h3>
          <p>Sichere Einstellungen sind oben gebündelt. Kritische Live-/Twitch-/Bridge-Schalter bleiben sichtbar, aber gesperrt.</p>
        </div>
        <div class="vip30-actions">
          <button type="button" data-vip30-save-settings ${state.saving ? 'disabled' : ''}>${state.saving ? 'Speichere...' : 'Sichere Settings speichern'}</button>
          <button type="button" data-vip30-refresh>Neu laden</button>
        </div>
      </div>
      ${renderAutoRefreshNotice()}
      ${hasDirtyEdits() ? `<div class="vip30-warnmsg">Ungespeichert: ${esc(dirtyLabel())}. Auto-Reload schützt deine Eingaben.</div>` : ''}
      ${state.saveMessage ? `<div class="vip30-okmsg">${esc(state.saveMessage)}</div>` : ''}
      ${state.saveError ? `<div class="vip30-error">${esc(state.saveError)}</div>` : ''}
      <div class="vip30-settings-hint">
        <span>${badge('SICHER EDITIERBAR', 'ok')} kann direkt gespeichert werden.</span>
        <span>${badge('KRITISCH GESPERRT', 'bad')} braucht später einen separaten Confirm-/Audit-Step.</span>
        <span>${badge('GESPERT', 'warn')} ist bewusst nicht im schnellen Dashboard-Edit enthalten.</span>
      </div>

      <div class="vip30-config-section">
        <div class="vip30-config-title">
          <h4>Sicher editierbare Einstellungen</h4>
          <span>${esc(safeRows.length)} Felder</span>
        </div>
        <div class="vip30-setting-cards safe">
          ${safeRows.map(renderSettingCard).join('')}
        </div>
      </div>

      <div class="vip30-config-section locked">
        <div class="vip30-config-title">
          <h4>Kritische / gesperrte Einstellungen</h4>
          <span>${esc(lockedRows.length)} Felder</span>
        </div>
        ${lockedCategories.map(category => renderLockedCategory(category, lockedByCategory[category])).join('')}
      </div>
    </section>`;
  }

  function renderVip30MediaSoundSection(row){
    const currentValue = row ? currentSettingValue(row) : getSettingValue('alerts.mediaId', '');
    const currentId = String(currentValue ?? '').trim();
    const currentText = currentId ? `Aktuelle Media-ID: ${esc(currentId)}` : 'Noch kein VIP30-Sound ausgewählt.';
    return `<div class="vip30-config-section vip30-media-section">
      <div class="vip30-config-title">
        <h4>VIP30 Alert-Sound</h4>
        <span>${badge(row ? 'MEDIA-SYSTEM' : 'BACKEND-SETTING FEHLT', row ? 'ok' : 'warn')}</span>
      </div>
      <article class="vip30-media-card">
        <div class="vip30-media-info">
          <strong>Sound über Medien hochladen oder auswählen</strong>
          <p>Der Sound wird im zentralen Media-System als <code>moduleKey=vip30</code>, <code>categoryKey=alerts</code>, <code>type=audio</code> gespeichert. Die Sound-Länge bleibt dadurch im Media-System verfügbar und das Sound-System-Overlay kann passend reagieren.</p>
          <small>${currentText}</small>
        </div>
        <input id="vip30AlertMediaId" class="vip30-setting-control vip30-media-id-input" type="hidden" value="${esc(currentId)}" data-vip30-setting-input="alerts.mediaId">
        <div
          class="vip30-media-field"
          data-media-field
          data-module-key="vip30"
          data-category-key="alerts"
          data-allowed-types="audio"
          data-title="VIP30 Alert-Sound auswählen"
          data-value-input="#vip30AlertMediaId"
          data-media-id="${esc(currentId)}">
          <button type="button" data-media-field-open>VIP30-Sound auswählen / hochladen</button>
          <button type="button" data-media-field-clear>Sound entfernen</button>
          <div class="media-field-preview" data-media-field-preview>
            <span class="mf-muted">${currentId ? `Media-ID ${esc(currentId)} ausgewählt. Öffnen für Vorschau/Wechsel.` : 'Kein VIP30-Sound ausgewählt.'}</span>
          </div>
        </div>
      </article>
    </div>`;
  }


  function renderAutoRefreshNotice(){
    const last = state.autoRefreshLastAt ? `Auto-Reload ${dateFmt(state.autoRefreshLastAt)}` : 'Auto-Reload aktiv';
    const parts = [last];
    if (state.autoRefreshPausedReason) parts.push(state.autoRefreshPausedReason);
    if (state.pendingServerRefresh && hasDirtyEdits()) parts.push('Serverdaten liegen bereit, Eingaben bleiben geschützt');
    return `<div class="vip30-auto-refresh-note">
      <span>${esc(parts.join(' · '))}</span>
      ${hasDirtyEdits() ? '<button type="button" data-vip30-discard-edits>Änderungen verwerfen & neu laden</button>' : ''}
    </div>`;
  }

  function renderOverlaySetEditor(row){
    if (!row) {
      return `<div class="vip30-config-section vip30-overlaysets-section">
        <div class="vip30-config-title"><h4>VIP30 Overlay-Textsets</h4><span>${badge('SETTING FEHLT', 'warn')}</span></div>
        <div class="vip30-empty">Das Setting <code>alerts.overlaySets</code> wurde im Backend noch nicht gefunden.</div>
      </div>`;
    }

    const sets = getOverlaySetsForUi();
    const jsonText = jsonTextForSetting(row);
    return `<div class="vip30-config-section vip30-overlaysets-section">
      <div class="vip30-config-title">
        <div>
          <h4>VIP30 Overlay-Textsets</h4>
          <p>Zusammengehörige Varianten wie beim SO-System: Kicker, Headline, Subline, Message, Perks und Brand bleiben als Set zusammen.</p>
        </div>
        <span>${badge(`${sets.length} Sets`, 'ok')}</span>
      </div>

      <div class="vip30-overlayset-toolbar">
        <button type="button" data-vip30-overlay-add>Neues Textset</button>
        <button type="button" data-vip30-overlay-format>JSON formatieren</button>
        <small>Platzhalter: <code>{displayName}</code>, <code>{login}</code></small>
      </div>

      <textarea class="vip30-setting-control vip30-json-control vip30-overlay-hidden-json" rows="10" spellcheck="false" data-vip30-setting-input="alerts.overlaySets">${esc(jsonText)}</textarea>

      <div class="vip30-overlayset-list">
        ${sets.map((set, index) => renderOverlaySetCard(set, index)).join('')}
      </div>
    </div>`;
  }

  function renderOverlaySetCard(set, index){
    const perksText = (set.perks || []).join('\n');
    return `<article class="vip30-overlayset-card" data-vip30-overlay-set data-index="${esc(index)}">
      <div class="vip30-overlayset-head">
        <div>
          <strong>Textset ${esc(index + 1)} · ${esc(set.id || 'ohne-id')}</strong>
          <small>Gewichtung ${esc(set.weight)} · ${set.enabled ? 'aktiv' : 'deaktiviert'}</small>
        </div>
        <div class="vip30-overlayset-actions">
          <label class="vip30-mini-check"><input type="checkbox" data-vip30-overlay-field="enabled" ${set.enabled ? 'checked' : ''}> aktiv</label>
          <button type="button" data-vip30-overlay-duplicate="${esc(index)}">Duplizieren</button>
          <button type="button" data-vip30-overlay-remove="${esc(index)}">Entfernen</button>
        </div>
      </div>
      <div class="vip30-overlayset-grid">
        <label>ID<input type="text" data-vip30-overlay-field="id" value="${esc(set.id)}"></label>
        <label>Gewichtung<input type="number" min="0" step="1" data-vip30-overlay-field="weight" value="${esc(set.weight)}"></label>
        <label>Kicker<input type="text" data-vip30-overlay-field="kicker" value="${esc(set.kicker)}"></label>
        <label>Brand<input type="text" data-vip30-overlay-field="brand" value="${esc(set.brand)}"></label>
        <label class="wide">Headline<input type="text" data-vip30-overlay-field="headline" value="${esc(set.headline)}"></label>
        <label class="wide">Subline<input type="text" data-vip30-overlay-field="subline" value="${esc(set.subline)}"></label>
        <label class="wide">Message<input type="text" data-vip30-overlay-field="message" value="${esc(set.message)}"></label>
        <label class="wide">Perks / Chips <small>eine Zeile pro Chip</small><textarea rows="4" data-vip30-overlay-field="perks" spellcheck="false">${esc(perksText)}</textarea></label>
      </div>
    </article>`;
  }

  function renderSettingCard(row){
    const tone = settingTone(row);
    const status = isSafeEditable(row) ? 'editierbar' : isCriticalSetting(row?.key) ? 'kritisch gesperrt' : row?.editable ? 'gesperrt' : 'nicht editierbar';
    return `<article class="vip30-setting-card ${isSafeEditable(row) ? 'is-safe' : isCriticalSetting(row?.key) ? 'is-critical' : 'is-locked'}">
      <div class="vip30-setting-top">
        <div>
          <strong>${esc(row.label || row.key)}</strong>
          <small>${esc(row.key)} · ${esc(row.type || '')}</small>
        </div>
        ${badge(status, tone)}
      </div>
      <div class="vip30-setting-value">${settingInput(row)}</div>
      <p>${fmt(row.description || '')}</p>
      <footer>
        <span>${esc(row.category || 'sonstige')}</span>
        <span>aktualisiert ${fmt(dateFmt(row.updatedAt || row.updated_at))}</span>
      </footer>
    </article>`;
  }

  function renderLockedCategory(category, rows){
    return `<details class="vip30-locked-category" ${category === 'live' || category === 'twitch' ? 'open' : ''}>
      <summary>
        <span>${esc(category)}</span>
        <small>${esc(rows.length)} gesperrte Settings</small>
      </summary>
      <div class="vip30-setting-cards locked">
        ${rows.map(renderSettingCard).join('')}
      </div>
    </details>`;
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

  function renderSounds(){
    const poolRow = getSettingRow('alerts.soundPool');
    const mediaRow = getSettingRow('alerts.mediaId');
    return `<section class="vip30-card glass vip30-config vip30-sounds-tab">
      <div class="vip30-card-head">
        <div>
          <h3>VIP30 Sounds</h3>
          <p>Mehrere VIP30-Sounds für die Zufallsauswahl. Beim Alert wird ein aktiver Sound nach Gewichtung gewählt.</p>
        </div>
        <div class="vip30-actions">
          <button type="button" data-vip30-save-settings ${state.saving ? 'disabled' : ''}>${state.saving ? 'Speichere...' : 'Sounds speichern'}</button>
          <button type="button" data-vip30-refresh>Neu laden</button>
        </div>
      </div>
      ${renderAutoRefreshNotice()}
      ${hasDirtyEdits() ? `<div class="vip30-warnmsg">Ungespeichert: ${esc(dirtyLabel())}. Auto-Reload schützt deine Sound-Auswahl.</div>` : ''}
      ${state.saveMessage ? `<div class="vip30-okmsg">${esc(state.saveMessage)}</div>` : ''}
      ${state.saveError ? `<div class="vip30-error">${esc(state.saveError)}</div>` : ''}
      <div class="vip30-settings-hint">
        <span>${badge('SOUND-POOL', 'ok')} ein aktiver Sound wird nach Gewichtung gewählt.</span>
        <span>${badge('FALLBACK', 'warn')} falls leer, bleibt alerts.mediaId als alter Fallback erhalten.</span>
        <span>${badge('MEDIA-SYSTEM', 'ok')} Upload/Auswahl läuft über das zentrale Media-System.</span>
      </div>
      ${renderSoundPoolEditor(poolRow, mediaRow)}
    </section>`;
  }

  function renderSoundPoolEditor(poolRow, mediaRow){
    if (!poolRow) {
      return `<div class="vip30-config-section vip30-soundpool-section">
        <div class="vip30-config-title"><h4>VIP30 Sound-Pool</h4><span>${badge('SETTING FEHLT', 'warn')}</span></div>
        <div class="vip30-empty">Das Setting <code>alerts.soundPool</code> wurde im Backend noch nicht gefunden. Backend STEP8.17 muss eingespielt und Node neu gestartet werden.</div>
      </div>`;
    }
    const pool = getSoundPoolForUi();
    const jsonText = (() => { try { return JSON.stringify(pool, null, 2); } catch (_) { return '[]'; } })();
    const fallbackValue = mediaRow ? String(currentSettingValue(mediaRow) || '').trim() : '';
    return `<div class="vip30-config-section vip30-soundpool-section">
      <div class="vip30-config-title">
        <div>
          <h4>VIP30 Sound-Pool</h4>
          <p>Jeder aktive Eintrag mit Media-ID kann zufällig ausgewählt werden. Höhere Gewichtung bedeutet: kommt häufiger dran. Dauer 0 = automatisch aus Media-System.</p>
        </div>
        <span>${badge(`${pool.length} Sounds`, pool.length ? 'ok' : 'warn')}</span>
      </div>
      <div class="vip30-soundpool-toolbar">
        <button type="button" data-vip30-sound-add>Neuen Sound hinzufügen</button>
        <small>Alter Fallback <code>alerts.mediaId</code>: ${fallbackValue ? esc(fallbackValue) : 'leer'}</small>
      </div>
      <textarea class="vip30-setting-control vip30-json-control vip30-soundpool-hidden-json" rows="8" spellcheck="false" data-vip30-setting-input="alerts.soundPool">${esc(jsonText)}</textarea>
      <input id="vip30LegacyMediaId" class="vip30-setting-control vip30-media-id-input" type="hidden" value="${esc(fallbackValue)}" data-vip30-setting-input="alerts.mediaId">
      <div class="vip30-soundpool-list">
        ${pool.map((item, index) => renderSoundPoolCard(item, index)).join('')}
      </div>
      ${!pool.length ? `<div class="vip30-empty">Noch keine Sounds im Pool. Bitte Sound hinzufügen.</div>` : ''}
    </div>`;
  }

  function renderSoundPoolCard(item, index){
    const mediaInputId = `vip30SoundMediaId_${index}`;
    const mediaId = item.mediaId > 0 ? String(item.mediaId) : '';
    return `<article class="vip30-soundpool-card" data-vip30-sound-item data-index="${esc(index)}">
      <div class="vip30-soundpool-head">
        <div>
          <strong>Sound ${esc(index + 1)} · ${esc(item.label || item.id || 'ohne Label')}</strong>
          <small>Media-ID ${mediaId ? esc(mediaId) : 'nicht gewählt'} · Gewichtung ${esc(item.weight)} · Dauer ${item.durationMs > 0 ? esc(item.durationMs + ' ms') : 'Auto'} · ${item.enabled ? 'aktiv' : 'deaktiviert'}</small>
        </div>
        <div class="vip30-soundpool-actions">
          <label class="vip30-mini-check"><input type="checkbox" data-vip30-sound-field="enabled" ${item.enabled ? 'checked' : ''}> aktiv</label>
          <button type="button" data-vip30-sound-duplicate="${esc(index)}">Duplizieren</button>
          <button type="button" data-vip30-sound-remove="${esc(index)}">Entfernen</button>
        </div>
      </div>
      <div class="vip30-soundpool-grid">
        <label>ID<input type="text" data-vip30-sound-field="id" value="${esc(item.id)}"></label>
        <label>Label<input type="text" data-vip30-sound-field="label" value="${esc(item.label)}"></label>
        <label>Gewichtung<input type="number" min="0" step="1" data-vip30-sound-field="weight" value="${esc(item.weight)}"></label>
        <label>Media-ID<input id="${esc(mediaInputId)}" type="number" min="0" step="1" data-vip30-sound-field="mediaId" value="${esc(mediaId)}"></label>
        <label>Dauer ms <small>0 = Auto</small><input type="number" min="0" step="100" data-vip30-sound-field="durationMs" value="${esc(item.durationMs || 0)}"></label>
        <label class="wide">Media-Pfad Fallback<input type="text" data-vip30-sound-field="mediaPath" value="${esc(item.mediaPath || '')}" placeholder="optional"></label>
      </div>
      <div
        class="vip30-media-field vip30-sound-media-field"
        data-media-field
        data-module-key="vip30"
        data-category-key="alerts"
        data-allowed-types="audio"
        data-title="VIP30 Sound auswählen"
        data-value-input="#${esc(mediaInputId)}"
        data-media-id="${esc(mediaId)}">
        <button type="button" data-media-field-open>Sound auswählen / hochladen</button>
        <button type="button" data-media-field-clear>Sound entfernen</button>
        <div class="media-field-preview" data-media-field-preview>
          <span class="mf-muted">${mediaId ? `Media-ID ${esc(mediaId)} ausgewählt. Öffnen für Vorschau/Wechsel.` : 'Kein Sound ausgewählt.'}</span>
        </div>
      </div>
    </article>`;
  }

  function renderTexts(){
    const row = getSettingRow('alerts.overlaySets');
    return `<section class="vip30-card glass vip30-config vip30-texts-tab">
      <div class="vip30-card-head">
        <div>
          <h3>VIP30 Texte</h3>
          <p>Zufällige Overlay-Texte für das CGN Split Lounge Design. Die Sets bleiben zusammen, damit Headline, Subline und Perks immer zueinander passen.</p>
        </div>
        <div class="vip30-actions">
          <button type="button" data-vip30-save-settings ${state.saving ? 'disabled' : ''}>${state.saving ? 'Speichere...' : 'Texte speichern'}</button>
          <button type="button" data-vip30-refresh>Neu laden</button>
        </div>
      </div>
      ${renderAutoRefreshNotice()}
      ${hasDirtyEdits() ? `<div class="vip30-warnmsg">Ungespeichert: ${esc(dirtyLabel())}. Auto-Reload schützt deine Texteingaben.</div>` : ''}
      ${state.saveMessage ? `<div class="vip30-okmsg">${esc(state.saveMessage)}</div>` : ''}
      ${state.saveError ? `<div class="vip30-error">${esc(state.saveError)}</div>` : ''}
      <div class="vip30-settings-hint">
        <span>${badge('ZUFALLSTEXTE', 'ok')} ein aktives Set wird nach Gewichtung gewählt.</span>
        <span>${badge('PLATZHALTER', 'warn')} nutze <code>{displayName}</code> und <code>{login}</code>.</span>
        <span>${badge('AUTO-RELOAD', 'ok')} aktive Eingaben werden nicht überschrieben.</span>
      </div>
      ${renderOverlaySetEditor(row)}
    </section>`;
  }

  async function runAlertTest(){
    root = document.getElementById('vip30Module');
    if (!root || !window.CGN) return;
    state.actionRunning = 'alertTest';
    state.actionError = '';
    state.actionMessage = '';
    render();
    try {
      const input = root.querySelector('[data-vip30-alert-test-user]');
      const rawName = String(input && input.value || state.alertTestUser || 'TestRentner').replace(/^@+/, '').trim() || 'TestRentner';
      state.alertTestUser = rawName;
      const result = await window.CGN.api(api.alertTest, {
        method: 'POST',
        body: JSON.stringify({
          userLogin: rawName.toLowerCase(),
          userDisplayName: rawName,
          displayName: rawName,
          userId: ''
        })
      });
      const selected = result && result.selected ? result.selected : {};
      state.actionRunning = '';
      state.actionMessage = `VIP30 Alert-Test ausgelöst · User: ${rawName} · Avatar: ${selected.avatarResolved ? 'geladen' : (selected.avatarResolveReason || 'Fallback')} · Sound: ${selected.soundLabel || selected.soundPoolId || selected.mediaId || '-'} · Textset: ${selected.overlaySetId || '-'} · Dauer: ${selected.durationMode === 'manual' ? (selected.requestedDurationMs + ' ms manuell') : 'Media-System Auto'}`;
      state.actionError = result && result.ok === false ? (result.reason || result.status || 'Test fehlgeschlagen') : '';
      await autoRefresh();
      render();
    } catch (err) {
      state.actionRunning = '';
      state.actionError = apiErr(err);
      state.actionMessage = '';
      render();
    }
  }

  function renderActions(){
    const actions = [
      {
        key: 'status',
        title: 'Status neu laden',
        text: 'Lädt den VIP30-Modulstatus neu. Keine DB-/Twitch-Schreibaktion.'
      },
      {
        key: 'slots',
        title: 'Slots neu laden',
        text: 'Lädt die aktuelle VIP30-Slotliste neu.'
      },
      {
        key: 'logs',
        title: 'Logs neu laden',
        text: 'Lädt die letzten VIP30-Logeinträge neu.'
      },
      {
        key: 'settings',
        title: 'Settings neu laden',
        text: 'Lädt die VIP30-Settings aus der DB neu.'
      },
      {
        key: 'cleanupCheck',
        title: 'Cleanup Check neu laden',
        text: 'Führt nur den vorhandenen Cleanup-Check/Statusabruf aus. Kein Cleanup-Run.'
      },
      {
        key: 'externalRemove',
        title: 'External VIP Remove Status neu laden',
        text: 'Lädt den Status der externen VIP-Remove-Bus-Verarbeitung neu.'
      },
      {
        key: 'eventsubStatus',
        title: 'EventSub VIP Status neu laden',
        text: 'Lädt den Twitch EventSub Status inklusive channel.vip.add/remove neu.'
      }
    ];

    return `<section class="vip30-card glass vip30-admin-actions">
      <div class="vip30-card-head">
        <div>
          <h3>Admin-Aktionen</h3>
          <p>Einfache Refresh-Aktionen für den Live-Betrieb. Keine Admin-/Cleanup-/Twitch-Schreibaktionen.</p>
        </div>
        <div class="vip30-actions">
          <button type="button" data-vip30-refresh>Alles neu laden</button>
        </div>
      </div>
      <div class="vip30-settings-hint">
        <span>${badge('SICHER', 'ok')} ruft nur bestehende GET-/Statusrouten auf.</span>
        <span>${badge('KEINE LIVE-AKTION', 'warn')} schreibt nicht in Twitch und führt keinen Cleanup aus.</span>
      </div>
      ${state.actionMessage ? `<div class="vip30-okmsg">${esc(state.actionMessage)}</div>` : ''}
      ${state.actionError ? `<div class="vip30-error">${esc(state.actionError)}</div>` : ''}
      <div class="vip30-action-grid">
        <article class="vip30-action-card vip30-action-card-primary">
          <div>
            <strong>VIP30 Alert testen</strong>
            <p>Löst ohne Twitch-Schreibzugriff einen echten VIP30 Sound-Bundle-Test aus: zufälliger Sound aus Sounds und zufälliger Text aus Texte.</p>
            <label class="vip30-test-user-label">Anzeigename/Login zum Auflösen
              <input type="text" data-vip30-alert-test-user value="${esc(state.alertTestUser || '')}" placeholder="z. B. AkiGhosty, ForrestCGN, EngelCGN">
            </label>
          </div>
          <button type="button" data-vip30-alert-test ${state.actionRunning ? 'disabled' : ''}>
            ${state.actionRunning === 'alertTest' ? 'Teste...' : 'Alert testen'}
          </button>
        </article>
        ${actions.map(action => `<article class="vip30-action-card">
          <div>
            <strong>${esc(action.title)}</strong>
            <p>${esc(action.text)}</p>
          </div>
          <button type="button" data-vip30-refresh-part="${esc(action.key)}" data-vip30-refresh-label="${esc(action.title)}" ${state.actionRunning ? 'disabled' : ''}>
            ${state.actionRunning === action.key ? 'Lädt...' : 'Ausführen'}
          </button>
        </article>`).join('')}
      </div>
      <div class="vip30-danger-zone">
        <h4>Bewusst noch gesperrt</h4>
        <p>Cleanup Run, Reward Sync/Ensure, manuelle Slot-Korrektur, VIP vergeben/entziehen, Redemption fulfill/cancel und Bus-Testevents gehören später in einen separaten Admin-/Systembereich.</p>
      </div>
    </section>`;
  }

  function renderDiagnostics(){
    return `<div class="vip30-grid">
      ${jsonBlock('VIP30 Status', state.status)}
      ${jsonBlock('VIP30 Settings', state.settings)}
      ${jsonBlock('External VIP Remove', state.externalRemove)}
      ${jsonBlock('Cleanup Check', state.cleanupCheck)}
      ${jsonBlock('Twitch EventSub Status', state.eventsubStatus)}
    </div>`;
  }

  function renderBody(){
    if (state.loading) return '<section class="vip30-card glass"><h3>Lade VIP30-Daten...</h3><p class="vip30-muted">Bitte kurz warten.</p></section>';
    if (state.tab === 'slots') return renderSlots();
    if (state.tab === 'logs') return renderLogs();
    if (state.tab === 'settings') return renderSettings();
    if (state.tab === 'sounds') return renderSounds();
    if (state.tab === 'texts') return renderTexts();
    if (state.tab === 'actions') return renderActions();
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
    root?.querySelectorAll('[data-vip30-save-settings]').forEach(btn => btn.addEventListener('click', () => saveSettings()));
    root?.querySelectorAll('[data-vip30-refresh-part]').forEach(btn => btn.addEventListener('click', () => refreshPart(btn.dataset.vip30RefreshPart || '', btn.dataset.vip30RefreshLabel || '')));
    root?.querySelector('[data-vip30-alert-test]')?.addEventListener('click', () => runAlertTest());
    root?.querySelector('[data-vip30-alert-test-user]')?.addEventListener('input', ev => {
      state.alertTestUser = String(ev && ev.target ? ev.target.value : '').replace(/^@+/, '').trim();
    });

    root?.querySelectorAll('[data-vip30-setting-input]').forEach(input => {
      input.addEventListener('input', () => {
        const key = String(input.dataset.vip30SettingInput || '');
        const row = getSettingRow(key);
        if (!row || !isSafeEditable(row)) return;
        if (row.type === 'boolean') setDirtyValue(key, input.checked === true);
        else {
          try { setDirtyValue(key, typeValue(row, input.value)); }
          catch (_) { setDirtyValue(key, input.value); }
        }
      });
      input.addEventListener('change', () => {
        const key = String(input.dataset.vip30SettingInput || '');
        const row = getSettingRow(key);
        if (!row || !isSafeEditable(row)) return;
        if (row.type === 'boolean') setDirtyValue(key, input.checked === true);
      });
    });

    root?.querySelectorAll('[data-vip30-overlay-field]').forEach(input => {
      input.addEventListener('input', () => syncOverlaySetsFromDom());
      input.addEventListener('change', () => syncOverlaySetsFromDom());
    });

    root?.querySelectorAll('[data-vip30-sound-field]').forEach(input => {
      input.addEventListener('input', () => syncSoundPoolFromDom());
      input.addEventListener('change', () => syncSoundPoolFromDom());
    });

    root?.querySelector('[data-vip30-sound-add]')?.addEventListener('click', () => {
      const pool = getSoundPoolForUi();
      pool.push(defaultSoundPoolItem(pool.length));
      setDirtyValue('alerts.soundPool', pool);
      render();
    });

    root?.querySelectorAll('[data-vip30-sound-duplicate]').forEach(btn => btn.addEventListener('click', () => {
      const index = Number.parseInt(String(btn.dataset.vip30SoundDuplicate || '0'), 10);
      const pool = getSoundPoolForUi();
      const copy = { ...(pool[index] || defaultSoundPoolItem(pool.length)) };
      copy.id = `${copy.id || 'sound'}-kopie`;
      copy.label = `${copy.label || 'VIP30 Sound'} Kopie`;
      pool.splice(index + 1, 0, copy);
      setDirtyValue('alerts.soundPool', pool);
      render();
    }));

    root?.querySelectorAll('[data-vip30-sound-remove]').forEach(btn => btn.addEventListener('click', () => {
      const index = Number.parseInt(String(btn.dataset.vip30SoundRemove || '0'), 10);
      const pool = getSoundPoolForUi();
      pool.splice(index, 1);
      setDirtyValue('alerts.soundPool', pool);
      render();
    }));

    root?.querySelector('[data-vip30-overlay-add]')?.addEventListener('click', () => {
      const sets = getOverlaySetsForUi();
      sets.push(defaultOverlaySet(sets.length));
      setDirtyValue('alerts.overlaySets', sets);
      render();
    });

    root?.querySelectorAll('[data-vip30-overlay-duplicate]').forEach(btn => btn.addEventListener('click', () => {
      const index = Number.parseInt(String(btn.dataset.vip30OverlayDuplicate || '0'), 10);
      const sets = getOverlaySetsForUi();
      const copy = { ...(sets[index] || defaultOverlaySet(sets.length)) };
      copy.id = `${copy.id || 'copy'}-kopie`;
      sets.splice(index + 1, 0, copy);
      setDirtyValue('alerts.overlaySets', sets);
      render();
    }));

    root?.querySelectorAll('[data-vip30-overlay-remove]').forEach(btn => btn.addEventListener('click', () => {
      const index = Number.parseInt(String(btn.dataset.vip30OverlayRemove || '0'), 10);
      const sets = getOverlaySetsForUi();
      if (sets.length <= 1) {
        state.saveError = 'Mindestens ein Overlay-Textset muss erhalten bleiben.';
        render();
        return;
      }
      sets.splice(index, 1);
      setDirtyValue('alerts.overlaySets', sets);
      render();
    }));

    root?.querySelector('[data-vip30-overlay-format]')?.addEventListener('click', () => {
      const sets = getOverlaySetsForUi();
      setDirtyValue('alerts.overlaySets', sets);
      render();
    });

    root?.querySelector('[data-vip30-discard-edits]')?.addEventListener('click', () => {
      clearDirtyValues();
      loadAll(true);
    });

    window.MediaField?.initAll?.(root);
    root?.querySelectorAll('[data-media-field]').forEach(field => {
      field.addEventListener('media-field:change', () => {
        const soundItem = field.closest('[data-vip30-sound-item]');
        if (soundItem) {
          syncSoundPoolFromDom();
          state.saveMessage = 'Sound ausgewählt. Bitte Sounds speichern.';
          state.saveError = '';
          return;
        }
        const input = root.querySelector('#vip30AlertMediaId') || root.querySelector('#vip30LegacyMediaId');
        if (input) setDirtyValue('alerts.mediaId', typeValue(getSettingRow('alerts.mediaId'), input.value));
        state.saveError = '';
        state.saveMessage = 'Medium ausgewählt. Bitte sichere Settings speichern.';
      });
    });
  }

  window.addEventListener('cgn:module-show', ev => {
    if (ev.detail?.module === 'vip30') {
      loadAll(false);
      startAutoRefresh();
    }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => {
    root = document.getElementById('vip30Module');
    startAutoRefresh();
  });
  else {
    root = document.getElementById('vip30Module');
    startAutoRefresh();
  }

  return { loadAll, render, saveSettings, autoRefresh };
})();
