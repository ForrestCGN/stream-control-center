window.SoundAlertsModule = (function(){
  'use strict';

  const API = '/api/soundalerts';
  let root = null;
  let status = null;
  let events = [];
  let stats = null;
  let config = null;
  let activeTab = 'overview';
  let loading = false;
  let bound = false;
  let selectedRuleIndex = 0;
  let ruleFilter = 'all';
  let uploadState = { active: false, index: -1, progress: 0, message: '', fileName: '', sizeMb: 0, error: '' };
  let parserPreview = null;

  const CATEGORY_OPTIONS = [
    { value: '', label: 'Standard / global', priority: null },
    { value: 'channel_reward', label: 'SoundAlerts / Kanalpunkte', priority: 70 },
    { value: 'alert', label: 'Alert / Support', priority: 80 },
    { value: 'alert_critical', label: 'Kritischer Alert', priority: 90 },
    { value: 'vip', label: 'VIP / Crew', priority: 60 },
    { value: 'fun', label: 'Fun / Community', priority: 50 },
    { value: 'tts', label: 'TTS', priority: 50 },
    { value: 'admin', label: 'Admin', priority: 100 },
    { value: 'system', label: 'System', priority: 100 }
  ];

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? ''); }
  async function api(path, options){ return window.CGN.api(API + path, options || {}); }
  function btn(label, action, cls){ return `<button type="button" class="${esc(cls || '')}" data-sa-action="${esc(action)}">${esc(label)}</button>`; }
  function iconBtn(icon, label, action, cls){
    return `<button type="button" class="sa-icon-btn ${esc(cls || '')}" data-sa-action="${esc(action)}" title="${esc(label)}" aria-label="${esc(label)}"><span aria-hidden="true">${esc(icon)}</span><span class="sa-sr-only">${esc(label)}</span></button>`;
  }

  function registerDashboardModule(){
    if (!window.CGN) return;
    window.CGN.modules.soundalerts = {
      title: 'SoundAlerts',
      panelId: 'soundalertsModule',
      group: 'system',
      overlayLink: '/overlays/sound_system_overlay.html?debug=1',
      overlayLabel: 'Sound-Overlay öffnen',
      reload() { return window.SoundAlertsModule?.loadAll?.(true); }
    };
    window.CGN.moduleCatalog.soundalerts = {
      label: 'SoundAlerts',
      icon: '🔔',
      enabled: true,
      description: 'SoundAlerts erkennen, einrichten und ins Sound-System geben.'
    };
    const items = window.CGN.sections?.system?.items;
    if (Array.isArray(items) && !items.includes('soundalerts')) {
      const idx = items.indexOf('sound_system');
      if (idx >= 0) items.splice(idx + 1, 0, 'soundalerts');
      else items.push('soundalerts');
    }
    if (Array.isArray(window.CGN.favorites) && !window.CGN.favorites.includes('soundalerts')) {
      window.CGN.favorites.push('soundalerts');
    }
  }

  function ensureRoot(){
    root = document.getElementById('soundalertsModule');
    return !!root;
  }

  function statusText(value){ return value ? 'Aktiv' : 'Inaktiv'; }
  function value(v, fallback){ return v === undefined || v === null || v === '' ? fallback : v; }
  function rules(){ return Array.isArray(config?.rules) ? config.rules : []; }
  function selectedRule(){ return rules()[selectedRuleIndex] || null; }
  function defaultPriority(){ return Number(config?.soundSystem?.defaultPriority ?? 70); }
  function defaultVolume(){ return Number(config?.soundSystem?.defaultVolume ?? 100); }
  function bytesToMb(bytes, fallback){
    const n = Number(bytes);
    if (!Number.isFinite(n) || n <= 0) return fallback;
    return Math.round((n / 1024 / 1024) * 10) / 10;
  }
  function mbToBytes(mb, fallbackMb){
    const n = Number(mb);
    const safe = Number.isFinite(n) && n > 0 ? n : fallbackMb;
    return Math.round(safe * 1024 * 1024);
  }
  function uploadLimitMb(upload, key, fallbackMb){
    return bytesToMb(upload?.[key], fallbackMb);
  }
  function fileSizeMb(fileObj){
    return bytesToMb(fileObj?.size, 0);
  }
  function isIgnoredRule(rule){
    return String(rule?.status || '').toLowerCase() === 'ignored';
  }

  function isReviewRule(rule){
    const raw = String(rule?.status || '').toLowerCase();
    return raw === 'file_matched' || raw === 'review_required';
  }

  function isPlaceholderFile(file){
    const f = String(file || '').trim().toLowerCase();
    return !f || f === 'soundalerts/audio/' || f === 'soundalerts/video/' || f.endsWith('/');
  }

  function ruleNeedsSetup(rule){
    if (!rule || isIgnoredRule(rule)) return false;
    if (!String(rule.soundAlertName || '').trim()) return true;
    if (isPlaceholderFile(rule.file)) return true;
    return false;
  }

  function canTestRule(rule){
    if (!rule || isIgnoredRule(rule)) return false;
    if (!String(rule.soundAlertName || rule.label || '').trim()) return false;
    if (isPlaceholderFile(rule.file)) return false;
    return true;
  }

  function ruleNeedsAction(rule){
    if (!rule || isIgnoredRule(rule)) return false;
    return ruleNeedsSetup(rule) || isReviewRule(rule);
  }

  function setupReason(rule){
    if (!rule) return 'Einrichtung nötig';
    if (isIgnoredRule(rule)) return 'Ignoriert';
    if (!String(rule.soundAlertName || '').trim()) return 'Name fehlt';
    if (isPlaceholderFile(rule.file)) return 'Datei fehlt';
    if (isReviewRule(rule)) return 'Zur Prüfung';
    return 'Geprüft';
  }

  function pendingRuleIndexes(){
    return rules().map((rule, idx) => ruleNeedsAction(rule) ? idx : -1).filter(idx => idx >= 0);
  }

  function unmatchedEvents(){
    return (events || []).filter(ev => {
      const s = String(ev?.status || '').toLowerCase();
      return ['unmatched', 'no_mapping', 'file_missing'].includes(s) || findRuleIndexForEvent(ev) < 0;
    });
  }

  function categoryOption(value){
    return CATEGORY_OPTIONS.find(item => item.value === value) || CATEGORY_OPTIONS[0];
  }

  function categoryName(value){
    return categoryOption(value || '').label;
  }

  function categoryLabel(value){
    const opt = categoryOption(value || '');
    return opt.priority === null ? opt.label : `${opt.label} (${opt.priority})`;
  }

  function standardPriority(rule){
    const opt = categoryOption(rule?.category || '');
    if (opt.priority !== null) return opt.priority;
    return defaultPriority();
  }

  function priorityOverrideValue(rule){
    if (rule?.priority === undefined || rule?.priority === null || rule?.priority === '') return '';
    const num = Number(rule.priority);
    if (!Number.isFinite(num)) return '';
    return Math.round(num) === Math.round(standardPriority(rule)) ? '' : Math.round(num);
  }

  function effectivePriority(rule){
    const override = priorityOverrideValue(rule);
    if (override !== '') return Number(override);
    return standardPriority(rule);
  }

  function priorityLabel(rule){
    const override = priorityOverrideValue(rule);
    const standard = standardPriority(rule);
    return override === '' ? `Standard ${standard}` : `Eigene Priorität ${override} · Standard ${standard}`;
  }

  function priorityPlaceholder(rule){
    return `leer = Standard ${standardPriority(rule)}`;
  }

  function normalizePriorityOverride(value){
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    if (!Number.isFinite(num)) return null;
    return Math.max(0, Math.min(200, Math.round(num)));
  }

  function normalizeMediaType(value, file){
    const raw = String(value || '').trim().toLowerCase();
    if (raw === 'video' || raw === 'audio') return raw;
    const f = String(file || '').trim().toLowerCase();
    return f.endsWith('.mp4') || f.endsWith('.webm') ? 'video' : 'audio';
  }

  function defaultOutputTargetForMedia(mediaType){
    return mediaType === 'video' ? 'overlay' : 'device';
  }

  function normalizeOutputTarget(value, mediaType){
    const raw = String(value || '').trim().toLowerCase();
    if (['overlay', 'device', 'both'].includes(raw)) return raw;
    return defaultOutputTargetForMedia(mediaType);
  }

  function normalizeCategory(value){
    const raw = String(value || '').trim();
    return raw || 'channel_reward';
  }

  function statusLabel(statusValue){
    const s = String(statusValue || '').toLowerCase();
    if (s === 'queued') return 'In Warteschlange';
    if (s === 'played' || s === 'success' || s === 'done') return 'Abgespielt';
    if (s === 'unmatched') return 'Nicht eingerichtet';
    if (s === 'no_mapping') return 'Kein Eintrag';
    if (s === 'file_missing' || s === 'missing_file') return 'Datei fehlt';
    if (s === 'file_matched' || s === 'review_required') return 'Zur Prüfung';
    if (s === 'inactive') return 'Inaktiv';
    if (s === 'active') return 'Aktiv';
    if (s === 'ignored') return 'Ignoriert';
    if (s === 'failed') return 'Fehler';
    return statusValue || '-';
  }

  function statusClass(statusValue){
    const s = String(statusValue || '').toLowerCase();
    if (s === 'no_mapping') return 'unmatched';
    if (s === 'missing_file') return 'file_missing';
    if (s === 'file_matched' || s === 'review_required') return 'setup';
    if (s === 'ignored') return 'ignored';
    if (s === 'success' || s === 'played' || s === 'done') return 'queued';
    return s || 'unknown';
  }

  function findRuleIndexForEvent(ev){
    const name = String(ev?.soundalert_name || ev?.soundAlertName || '').trim().toLowerCase();
    if (!name) return -1;
    return rules().findIndex(rule => String(rule.soundAlertName || '').trim().toLowerCase() === name);
  }

  function eventSoundName(ev){ return ev?.soundalert_name || ev?.soundAlertName || '-'; }
  function eventUserName(ev){ return ev?.trigger_user_display || ev?.triggerUserDisplay || '-'; }
  function eventCreatedAt(ev){ return ev?.created_at || ev?.createdAt || ''; }
  function eventRawText(ev){ return ev?.raw_text || ev?.rawText || ''; }

  function eventStatusValue(ev){ return String(ev?.status || '').toLowerCase(); }

  function hasUsableEventName(ev){
    const name = String(eventSoundName(ev) || '').trim();
    return !!name && name !== '-' && name.toLowerCase() !== 'parse_failed';
  }

  function isCurrentMissingEvent(ev, ruleIdx){
    const s = eventStatusValue(ev);
    return ['unmatched', 'no_mapping'].includes(s) || (ruleIdx < 0 && !ev?.file);
  }

  function eventDisplayStatus(ev, ruleIdx){
    const s = eventStatusValue(ev);
    if (s === 'parse_failed') return 'Parse-Fehler';
    if (isCurrentMissingEvent(ev, ruleIdx)) return 'Kein aktueller Eintrag';
    return statusLabel(ev?.status);
  }

  function eventDisplayClass(ev, ruleIdx){
    const s = eventStatusValue(ev);
    if (s === 'parse_failed') return 'failed';
    if (isCurrentMissingEvent(ev, ruleIdx)) return 'log_only';
    return statusClass(ev?.status);
  }

  function eventDetailLine(ev, ruleIdx){
    const s = eventStatusValue(ev);
    if (s === 'parse_failed') return 'Rohdaten konnten nicht sauber gelesen werden. Kein SoundAlert-Name erkannt.';
    if (isCurrentMissingEvent(ev, ruleIdx)) return 'Historischer Log-Eintrag: passender Eintrag existiert aktuell nicht oder wurde gelöscht.';
    return ev?.file || ev?.error || eventRawText(ev) || '';
  }

  function canCreateEntryFromEvent(ev, ruleIdx){
    if (ruleIdx >= 0) return false;
    if (!hasUsableEventName(ev)) return false;
    const s = eventStatusValue(ev);
    return ['unmatched', 'no_mapping', 'file_missing', 'missing_file'].includes(s);
  }

  function ruleStatusKey(rule){
    const raw = String(rule?.status || '').toLowerCase();
    if (raw === 'ignored') return 'ignored';
    if (raw === 'file_matched' || raw === 'review_required') return 'review_required';
    if (raw === 'missing_file' || raw === 'file_missing' || ruleNeedsSetup(rule)) return 'missing_file';
    if (rule?.enabled === false || raw === 'inactive') return 'inactive';
    return 'active';
  }

  function ruleStatusCounts(){
    const out = { total: 0, active: 0, inactive: 0, missing_file: 0, ignored: 0, review_required: 0, pending: 0 };
    for (const rule of rules()) {
      out.total += 1;
      const key = ruleStatusKey(rule);
      out[key] = (out[key] || 0) + 1;
      if (ruleNeedsAction(rule)) out.pending += 1;
    }
    return out;
  }

  function ruleMatchesFilter(rule){
    const filter = String(ruleFilter || 'all').toLowerCase();
    if (filter === 'active') return ruleStatusKey(rule) === 'active';
    if (filter === 'inactive') return ruleStatusKey(rule) === 'inactive';
    if (filter === 'review_required') return ruleStatusKey(rule) === 'review_required';
    if (filter === 'missing_file') return ruleStatusKey(rule) === 'missing_file';
    if (filter === 'ignored') return isIgnoredRule(rule);
    return true;
  }

  function filteredRuleEntries(){
    return rules()
      .map((rule, idx) => ({ rule, idx }))
      .filter(item => ruleMatchesFilter(item.rule));
  }

  function clampSelectedRuleToFilter(){
    const entries = filteredRuleEntries();
    if (!entries.length) return;
    if (!entries.some(item => item.idx === selectedRuleIndex)) {
      selectedRuleIndex = entries[0].idx;
    }
  }

  function ruleFilterLabel(){
    if (ruleFilter === 'active') return 'Aktiv';
    if (ruleFilter === 'inactive') return 'Inaktiv';
    if (ruleFilter === 'review_required') return 'Zur Prüfung';
    if (ruleFilter === 'missing_file') return 'Datei fehlt';
    if (ruleFilter === 'ignored') return 'Ignoriert';
    return 'Alle';
  }

  function playedStatusKeys(){
    return new Set(['played', 'success', 'done']);
  }

  function isPlayedReplayEvent(ev){
    const statusValue = String(ev?.status || '').toLowerCase();
    return playedStatusKeys().has(statusValue) && !!ev?.file;
  }

  function countRows(rows){
    return Array.isArray(rows) ? rows.reduce((sum, row) => sum + Number(row?.count || 0), 0) : 0;
  }

  function playedCountFromStats(){
    const rows = Array.isArray(stats?.byStatus) ? stats.byStatus : [];
    const keys = playedStatusKeys();
    const played = rows
      .filter(row => keys.has(String(row?.status || '').toLowerCase()))
      .reduce((sum, row) => sum + Number(row?.count || 0), 0);
    return played || countRows(stats?.bySound);
  }

  function usefulStatusRows(){
    const rows = Array.isArray(stats?.byStatus) ? stats.byStatus : [];
    const allowed = new Set(['played', 'success', 'done', 'failed', 'file_missing', 'missing_file']);
    return rows.filter(row => allowed.has(String(row?.status || '').toLowerCase()));
  }

  function renderKpi(label, value, cls, action){
    return `
      <button type="button" class="sa-kpi ${esc(cls || '')}" ${action ? `data-sa-action="${esc(action)}"` : ''}>
        <span>${esc(label)}</span>
        <strong>${esc(value)}</strong>
      </button>
    `;
  }

  function localOverlayUrl(){
    return '/overlays/sound_system_overlay.html?debug=1';
  }

  function outputTargetLabel(value, mediaType){
    const target = normalizeOutputTarget(value, mediaType || 'audio');
    if (target === 'overlay') return 'Overlay';
    if (target === 'both') return 'Beides';
    return 'Device';
  }

  function renderRuleBadges(rule){
    const media = String(rule?.mediaType || 'audio').toLowerCase();
    const enabled = rule?.enabled === false ? false : true;
    const badges = [`<span class="sa-pill">${esc(media === 'video' ? 'Video' : 'Audio')}</span>`];
    if (isIgnoredRule(rule)) {
      badges.push(`<span class="sa-pill ignored">Ignoriert</span>`);
    } else if (ruleNeedsSetup(rule)) {
      badges.push(`<span class="sa-pill setup">${esc(setupReason(rule))}</span>`);
    } else if (isReviewRule(rule)) {
      badges.push(`<span class="sa-pill setup">Zur Prüfung</span>`);
    } else {
      badges.push(`<span class="sa-pill ${enabled ? 'queued' : 'failed'}">${enabled ? 'Aktiv' : 'Inaktiv'}</span>`);
    }
    badges.push(`<span class="sa-pill target">${esc(outputTargetLabel(rule?.outputTarget || rule?.output_target, media))}</span>`);
    return badges.join('');
  }

  function renderShell(){
    if (!root) return;
    root.innerHTML = `
      <div class="sa-card sa-hero">
        <div>
          <h2>SoundAlerts</h2>
          <div class="sa-note">SoundAlerts erkennen, Einträge verwalten und als Audio/Video in die Sound-System-Queue geben.</div>
        </div>
        <div class="sa-actions sa-hero-actions">
          ${btn('Neu laden', 'reload')}
          ${btn('🖥️ Lokales Overlay', 'open-local-overlay')}
          ${btn('Config speichern', 'save-config', 'success')}
        </div>
      </div>

      <div class="sa-tabs" role="tablist" aria-label="SoundAlerts Navigation">
        <button type="button" class="sa-tab active" data-sa-tab="overview">Übersicht</button>
        <button type="button" class="sa-tab" data-sa-tab="rules">Einträge</button>
        <button type="button" class="sa-tab" data-sa-tab="events">Events</button>
        <button type="button" class="sa-tab" data-sa-tab="stats">Statistik</button>
        <button type="button" class="sa-tab" data-sa-tab="settings">Bot & Settings</button>
      </div>

      <div class="sa-grid">
        <div class="sa-card sa-overview-main" id="saOverviewCard" data-sa-section="overview"></div>
        <div class="sa-card sa-overview-side" id="saLastEventCard" data-sa-section="overview"></div>
        <div class="sa-card sa-overview-wide" id="saOverviewLogCard" data-sa-section="overview"></div>
        <div class="sa-card" id="saSettingsCard" data-sa-section="settings"></div>
        <div class="sa-card" id="saRulesCard" data-sa-section="rules"></div>
        <div class="sa-card" id="saEventsCard" data-sa-section="events"></div>
        <div class="sa-card" id="saStatsCard" data-sa-section="stats"></div>
      </div>
    `;
    applyTab();
  }

  function render(){
    if (!ensureRoot()) return;
    if (!root.innerHTML.trim()) {
      renderShell();
      bind();
    }
    clampSelectedRule();
    renderOverview();
    renderLastEvent();
    renderOverviewLog();
    renderSettings();
    renderRules();
    renderEvents();
    renderStats();
    applyTab();
  }

  function renderOverview(){
    const el = document.getElementById('saOverviewCard');
    if (!el) return;
    const st = status || {};
    const cfg = config || st.config || {};
    const pending = pendingRuleIndexes();
    const counts = ruleStatusCounts();
    const firstPending = pending[0];
    const playedCount = playedCountFromStats();
    el.innerHTML = `
      <div class="sa-section-head sa-overview-head">
        <div>
          <h3>Übersicht</h3>
          <div class="sa-note">Wichtigste Zustände, offene Einträge und Schnellzugriffe.</div>
        </div>
        <div class="sa-actions sa-section-actions">
          ${btn('Neu laden', 'reload')}
          ${btn('Einträge öffnen', 'show-rules', 'success')}
          ${btn('Events öffnen', 'show-events')}
        </div>
      </div>
      ${pending.length ? `
        <div class="sa-attention">
          <div>
            <strong>Handlung nötig</strong>
            <span>${pending.length} Eintrag${pending.length === 1 ? '' : 'e'} warten auf Prüfung oder brauchen noch Name/Datei.</span>
          </div>
          <div class="sa-actions sa-attention-actions">
            ${firstPending !== undefined ? btn('Ersten offenen Eintrag', `edit-rule:${firstPending}`, 'success') : ''}
          </div>
        </div>
      ` : ''}
      <div class="sa-kpi-grid">
        ${renderKpi('Gesamt', counts.total, '', 'show-rules')}
        ${renderKpi('Aktiv', counts.active, 'ok', 'show-rules:active')}
        ${renderKpi('Zur Prüfung', counts.review_required, counts.review_required ? 'warn' : '', 'show-rules:review_required')}
        ${renderKpi('Inaktiv', counts.inactive, 'muted', 'show-rules:inactive')}
        ${renderKpi('Datei fehlt', counts.missing_file, counts.missing_file ? 'warn' : '', 'show-rules:missing_file')}
        ${renderKpi('Ignoriert', counts.ignored, 'muted', 'show-rules:ignored')}
      </div>
      <div class="sa-overview-mini-grid">
        <div class="sa-mini-state"><span>Modul</span><strong>${statusText(cfg.enabled !== false)}</strong></div>
        <div class="sa-mini-state"><span>WebSocket</span><strong>${st.wsConnected ? 'Verbunden' : 'Nicht verbunden'}</strong></div>
        <div class="sa-mini-state"><span>Bot</span><strong>${esc(cfg.bot?.login || '-')}</strong></div>
        <div class="sa-mini-state"><span>Events gesamt</span><strong>${esc(events?.length || 0)}</strong></div>
        <div class="sa-mini-state"><span>Abgespielt</span><strong>${esc(playedCount)}</strong></div>
        <div class="sa-mini-state"><span>Top-Sounds</span><strong>${esc(Array.isArray(stats?.bySound) ? stats.bySound.length : 0)}</strong></div>
      </div>
      <div class="sa-note">Config: ${esc(st.configPath || '')}</div>
    `;
  }

  function renderOverviewLog(){
    const el = document.getElementById('saOverviewLogCard');
    if (!el) return;
    const recent = (events || [])
      .map((ev, idx) => ({ ev, idx }))
      .filter(item => isPlayedReplayEvent(item.ev))
      .slice(0, 5);
    el.innerHTML = `
      <div class="sa-section-head sa-overview-head">
        <div>
          <h3>Letzte 5 abgespielte Events</h3>
          <div class="sa-note">Nur Events mit erfolgreicher Wiedergabe und Datei. Gedacht zum schnellen Neu starten.</div>
        </div>
        <div class="sa-actions sa-section-actions">
          ${btn('Alle Events', 'show-events')}
        </div>
      </div>
      <div class="sa-event-list sa-overview-event-list">
        ${recent.map(item => renderOverviewEvent(item.ev, item.idx)).join('') || '<div class="sa-empty">Noch keine abgespielten Events mit Datei.</div>'}
      </div>
    `;
  }

  function renderOverviewEvent(ev, idx){
    const hasFile = !!ev.file;
    return `
      <div class="sa-event sa-event-card sa-overview-event">
        <div class="sa-event-main">
          <strong>${esc(eventSoundName(ev))}</strong>
          <small>${esc(eventUserName(ev))} · ${esc(ev.amount ?? 0)} ${esc(ev.currency || '')} · ${esc(eventCreatedAt(ev))}</small>
          <small>${esc(ev.file || ev.error || eventRawText(ev) || '')}</small>
        </div>
        <div class="sa-event-side">
          <span class="sa-pill ${esc(statusClass(ev.status))}">${esc(statusLabel(ev.status))}</span>
          <div class="sa-actions sa-event-actions">
            ${hasFile ? btn('Neu starten', `replay-event:${idx}`, 'success') : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderLastEvent(){
    const el = document.getElementById('saLastEventCard');
    if (!el) return;
    const ev = status?.lastEvent;
    if (!ev) {
      el.innerHTML = `<h3>Letztes Event</h3><div class="sa-empty">Noch kein Event verarbeitet.</div>`;
      return;
    }
    const idx = findRuleIndexForEvent(ev);
    const canCreate = canCreateEntryFromEvent(ev, idx);
    el.innerHTML = `
      <h3>Letztes Event</h3>
      <div class="sa-row"><span>Status</span><strong class="sa-pill ${esc(eventDisplayClass(ev, idx))}">${esc(eventDisplayStatus(ev, idx))}</strong></div>
      <div class="sa-row"><span>User</span><strong>${esc(eventUserName(ev))}</strong></div>
      <div class="sa-row"><span>SoundAlert</span><strong>${esc(eventSoundName(ev))}</strong></div>
      <div class="sa-row"><span>Betrag</span><strong>${esc(ev.amount ?? 0)} ${esc(ev.currency || '')}</strong></div>
      <div class="sa-row"><span>Info</span><span class="sa-muted">${esc(eventDetailLine(ev, idx) || '-')}</span></div>
      <div class="sa-actions">
        ${ev.file ? btn('Erneut abspielen', 'replay-last-event') : ''}
        ${idx >= 0 ? btn('Eintrag bearbeiten', `edit-rule:${idx}`) : ''}
        ${canCreate ? btn('Eintrag erstellen', 'create-from-last-event', 'success') : ''}
      </div>
      <div class="sa-note">${esc(eventRawText(ev))}</div>
    `;
  }


  function defaultParserFormats(){
    return [
      {
        id: 'spielt_fuer',
        enabled: true,
        pattern: '^(.+?)\\s+spielt\\s+(.+?)\\s+(?:für|fuer|fur|fÃ¼r|f.r)\\s+(\\d+)\\s+(.+?)!?$',
        triggerGroup: 1,
        soundGroup: 2,
        amountGroup: 3,
        currencyGroup: 4
      },
      {
        id: 'loest_mit_aus',
        enabled: true,
        pattern: '^(.+?)\\s+(?:löst|loest|lost|lÃ¶st|l.st)\\s+(.+?)\\s+mit\\s+(\\d+)\\s+(.+?)\\s+aus[!.]?$',
        triggerGroup: 1,
        soundGroup: 2,
        amountGroup: 3,
        currencyGroup: 4
      }
    ];
  }

  function normalizeParserFormat(format, idx){
    let source = format;
    if (typeof source === 'string') {
      try { source = JSON.parse(source); } catch (_) { source = null; }
    }
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      const fallback = defaultParserFormats()[idx] || defaultParserFormats()[0];
      source = fallback;
    }
    return {
      id: String(source.id || `format_${idx + 1}`).trim() || `format_${idx + 1}`,
      enabled: source.enabled === false ? false : true,
      pattern: String(source.pattern || '').trim(),
      triggerGroup: Math.max(0, Number.parseInt(source.triggerGroup ?? 1, 10) || 1),
      soundGroup: Math.max(0, Number.parseInt(source.soundGroup ?? 2, 10) || 2),
      amountGroup: Math.max(0, Number.parseInt(source.amountGroup ?? 3, 10) || 3),
      currencyGroup: Math.max(0, Number.parseInt(source.currencyGroup ?? 4, 10) || 4)
    };
  }

  function parserFormats(){
    const raw = config?.parser?.messageFormats;
    const list = Array.isArray(raw) ? raw : [];
    const normalized = list
      .map((format, idx) => normalizeParserFormat(format, idx))
      .filter(format => format.pattern && format.pattern !== '[object Object]');
    return normalized.length ? normalized : defaultParserFormats();
  }

  function parserFormatLabel(format, idx){
    if (format.id === 'spielt_fuer') return 'Format: spielt … für …';
    if (format.id === 'loest_mit_aus') return 'Format: löst … mit … aus';
    return format.id || `Format ${idx + 1}`;
  }

  function renderParserFormats(){
    const formats = parserFormats();
    const preview = parserPreview;
    return `
      <div class="sa-parser-panel">
        <div class="sa-section-head sa-parser-head">
          <div>
            <h4>Chat-Erkennung</h4>
            <div class="sa-note">Formate, mit denen SoundAlerts-Chattexte erkannt werden. Normale Nutzung: aktiv/inaktiv schalten und mit Beispieltext testen. Regex nur bearbeiten, wenn wirklich nötig.</div>
          </div>
          <div class="sa-actions sa-section-actions">
            ${btn('Format hinzufügen', 'add-parser-format')}
            ${btn('Standard wiederherstellen', 'reset-parser-formats')}
          </div>
        </div>
        <div class="sa-parser-list">
          ${formats.map((format, idx) => renderParserFormat(format, idx)).join('')}
        </div>
        <div class="sa-parser-test">
          <label class="sa-field sa-wide"><span>Erkennung lokal testen</span><input id="saParserTestText" type="text" value="${esc(preview?.text || 'ForrestCGN löst Airhorn mit 0 Bits aus')}"></label>
          <div class="sa-actions sa-parser-test-actions">${btn('Text testen', 'test-parser-format', 'success')}</div>
          ${preview ? renderParserPreview(preview) : '<div class="sa-note">Der Test prüft nur die Erkennung im Dashboard und legt keinen Event-/SoundAlert-Eintrag an.</div>'}
        </div>
      </div>
    `;
  }

  function renderParserFormat(format, idx){
    return `
      <article class="sa-parser-format" data-sa-parser-index="${idx}">
        <div class="sa-parser-format-head">
          <label class="sa-check"><input data-sa-parser-field="enabled" type="checkbox" ${format.enabled === false ? '' : 'checked'}><span>${esc(parserFormatLabel(format, idx))}</span></label>
          <label class="sa-field"><span>ID</span><input data-sa-parser-field="id" type="text" value="${esc(format.id)}"></label>
        </div>
        <label class="sa-field sa-wide"><span>Regex</span><textarea data-sa-parser-field="pattern" rows="2" spellcheck="false">${esc(format.pattern)}</textarea></label>
        <div class="sa-parser-groups">
          <label class="sa-field"><span>User-Gruppe</span><input data-sa-parser-field="triggerGroup" type="number" min="0" max="20" value="${esc(format.triggerGroup)}"></label>
          <label class="sa-field"><span>Sound-Gruppe</span><input data-sa-parser-field="soundGroup" type="number" min="0" max="20" value="${esc(format.soundGroup)}"></label>
          <label class="sa-field"><span>Betrag-Gruppe</span><input data-sa-parser-field="amountGroup" type="number" min="0" max="20" value="${esc(format.amountGroup)}"></label>
          <label class="sa-field"><span>Währung-Gruppe</span><input data-sa-parser-field="currencyGroup" type="number" min="0" max="20" value="${esc(format.currencyGroup)}"></label>
        </div>
      </article>
    `;
  }

  function renderParserPreview(preview){
    if (!preview.ok) {
      return `<div class="sa-parser-preview failed"><strong>Nicht erkannt</strong><span>${esc(preview.error || 'Kein aktives Format hat gepasst.')}</span></div>`;
    }
    return `
      <div class="sa-parser-preview ok">
        <strong>Erkannt mit ${esc(preview.formatId)}</strong>
        <span>User: ${esc(preview.triggerUserDisplay || '-')} · Sound: ${esc(preview.soundAlertName || '-')} · Betrag: ${esc(preview.amount ?? 0)} ${esc(preview.currency || '')}</span>
      </div>
    `;
  }

  function readParserFormatsFromDom(){
    const cards = Array.from(document.querySelectorAll('[data-sa-parser-index]'));
    if (!cards.length) return parserFormats();
    return cards.map((card, idx) => {
      const field = name => card.querySelector(`[data-sa-parser-field="${name}"]`);
      return normalizeParserFormat({
        id: field('id')?.value || `format_${idx + 1}`,
        enabled: !!field('enabled')?.checked,
        pattern: field('pattern')?.value || '',
        triggerGroup: field('triggerGroup')?.value,
        soundGroup: field('soundGroup')?.value,
        amountGroup: field('amountGroup')?.value,
        currencyGroup: field('currencyGroup')?.value
      }, idx);
    }).filter(format => format.pattern);
  }

  function testParserText(text, formats){
    const raw = String(text || '').trim();
    if (!raw) return { ok: false, text: raw, error: 'Kein Testtext eingegeben.' };
    const list = Array.isArray(formats) && formats.length ? formats : parserFormats();
    for (const format of list) {
      if (format.enabled === false || !format.pattern) continue;
      try {
        const regex = new RegExp(format.pattern, 'i');
        const match = raw.match(regex);
        if (!match) continue;
        return {
          ok: true,
          text: raw,
          formatId: format.id,
          triggerUserDisplay: String(match[format.triggerGroup] || '').trim(),
          soundAlertName: String(match[format.soundGroup] || '').trim(),
          amount: Number.parseInt(match[format.amountGroup] || '0', 10) || 0,
          currency: String(match[format.currencyGroup] || '').replace(/[!.]+$/g, '').trim()
        };
      } catch (err) {
        return { ok: false, text: raw, error: `Regex-Fehler in ${format.id}: ${err.message || err}` };
      }
    }
    return { ok: false, text: raw, error: 'Kein aktives Format hat gepasst.' };
  }

  function addParserFormat(){
    const formats = readParserFormatsFromDom();
    formats.push({
      id: `custom_${formats.length + 1}`,
      enabled: true,
      pattern: '^(.+?)\\s+spielt\\s+(.+?)\\s+(?:für|fuer)\\s+(\\d+)\\s+(.+?)!?$',
      triggerGroup: 1,
      soundGroup: 2,
      amountGroup: 3,
      currencyGroup: 4
    });
    config = {
      ...(config || {}),
      parser: { ...((config || {}).parser || {}), messageFormats: formats }
    };
    parserPreview = null;
    renderSettings();
  }

  function resetParserFormats(){
    if (!confirm('Parser-Formate wirklich auf Standard zurücksetzen?')) return;
    config = {
      ...(config || {}),
      parser: { ...((config || {}).parser || {}), messageFormats: defaultParserFormats() }
    };
    parserPreview = null;
    renderSettings();
  }

  function testParserFormats(){
    const text = readText('saParserTestText');
    const formats = readParserFormatsFromDom();
    parserPreview = testParserText(text, formats);
    config = {
      ...(config || {}),
      parser: { ...((config || {}).parser || {}), messageFormats: formats }
    };
    renderSettings();
  }

  function renderLocalOverlayTest(){
    const url = localOverlayUrl();
    return `
      <div class="sa-local-overlay-panel">
        <div class="sa-section-head sa-local-overlay-head">
          <div>
            <h4>Lokaler Overlay-Test</h4>
            <div class="sa-note">Für Einträge mit Ausgabeziel <strong>Overlay</strong> oder <strong>Beides</strong> muss ein Sound-System-Overlay geöffnet sein. Device-Tests laufen über das lokale Audio-Gerät.</div>
          </div>
          <div class="sa-actions sa-section-actions">
            ${btn('🖥️ Overlay öffnen', 'open-local-overlay', 'success')}
          </div>
        </div>
        <div class="sa-local-overlay-url">${esc(location.origin + url)}</div>
        <div class="sa-note">Für OBS bleibt die Browserquelle <code>/overlays/sound_system_overlay.html</code> relevant. Für reine lokale Tests kann dieses Overlay im Browser geöffnet bleiben.</div>
      </div>
    `;
  }

  function renderSettings(){
    const el = document.getElementById('saSettingsCard');
    if (!el) return;
    const cfg = config || {};
    const bot = cfg.bot || {};
    const sound = cfg.soundSystem || {};
    const chat = cfg.chatMessages || {};
    const dedupe = cfg.dedupe || {};
    const upload = cfg.upload || {};
    el.innerHTML = `
      <h3>Bot & Settings</h3>
      <div class="sa-form-grid">
        <label class="sa-check"><input id="saEnabled" type="checkbox" ${cfg.enabled === false ? '' : 'checked'}><span>SoundAlerts aktiv</span></label>
        <label class="sa-field"><span>Bot-Login</span><input id="saBotLogin" type="text" value="${esc(bot.login || 'soundalerts')}"></label>
        <label class="sa-field"><span>Bot User-ID</span><input id="saBotUserId" type="text" value="${esc(bot.userId || '')}"></label>
        <label class="sa-field"><span>Bot DisplayName</span><input id="saBotDisplayName" type="text" value="${esc(bot.displayName || 'SoundAlerts')}"></label>
        <label class="sa-field"><span>Default-Kategorie</span><input id="saDefaultCategory" type="text" value="${esc(sound.defaultCategory || 'channel_reward')}"></label>
        <label class="sa-field"><span>Default-Priorität</span><input id="saDefaultPriority" type="number" min="0" max="200" value="${esc(value(sound.defaultPriority, 70))}"></label>
        <label class="sa-field"><span>Audio-Ziel</span><select id="saAudioTarget"><option value="device" ${sound.audioOutputTarget === 'device' ? 'selected' : ''}>Device</option><option value="overlay" ${sound.audioOutputTarget === 'overlay' ? 'selected' : ''}>Overlay</option><option value="both" ${sound.audioOutputTarget === 'both' ? 'selected' : ''}>Beides</option></select></label>
        <label class="sa-field"><span>Video-Ziel</span><select id="saVideoTarget"><option value="overlay" ${sound.videoOutputTarget !== 'device' ? 'selected' : ''}>Overlay</option><option value="device" ${sound.videoOutputTarget === 'device' ? 'selected' : ''}>Device</option><option value="both" ${sound.videoOutputTarget === 'both' ? 'selected' : ''}>Beides</option></select></label>
        <label class="sa-field"><span>Standard-Lautstärke</span><input id="saDefaultVolume" type="number" min="0" max="100" value="${esc(value(sound.defaultVolume, 100))}"></label>
        <label class="sa-field"><span>Max. Audio-Upload (MB)</span><input id="saMaxAudioMb" type="number" min="1" max="20480" step="1" value="${esc(uploadLimitMb(upload, 'maxAudioSizeBytes', 15))}"></label>
        <label class="sa-field"><span>Max. Video-Upload (MB)</span><input id="saMaxVideoMb" type="number" min="1" max="20480" step="1" value="${esc(uploadLimitMb(upload, 'maxVideoSizeBytes', 500))}"></label>
        <label class="sa-check"><input id="saDedupeEnabled" type="checkbox" ${dedupe.enabled === false ? '' : 'checked'}><span>Dedupe aktiv</span></label>
        <label class="sa-field"><span>Dedupe-Fenster ms</span><input id="saDedupeMs" type="number" min="0" max="600000" value="${esc(value(dedupe.windowMs, 3000))}"></label>
        <label class="sa-check"><input id="saChatMissing" type="checkbox" ${chat.onMissingFile === false ? '' : 'checked'}><span>Chatmeldung bei fehlender Datei</span></label>
        <label class="sa-check"><input id="saChatUnmatched" type="checkbox" ${chat.onUnmatched === true ? 'checked' : ''}><span>Chatmeldung bei unbekanntem Sound</span></label>
        <label class="sa-field"><span>Chat-Cooldown ms</span><input id="saChatCooldown" type="number" min="0" max="600000" value="${esc(value(chat.cooldownMs, 15000))}"></label>
      </div>
      ${renderParserFormats()}
      <div class="sa-note">Upload-Limits und Parser-Formate werden in <code>soundalerts_bridge_settings</code> gespeichert. Unbekannte SoundAlerts werden als offene Einträge erkannt.</div>
    `;
  }

  function renderRules(){
    const el = document.getElementById('saRulesCard');
    if (!el) return;
    clampSelectedRuleToFilter();
    const list = rules();
    const entries = filteredRuleEntries();
    const selected = selectedRule();
    const counts = ruleStatusCounts();
    el.innerHTML = `
      <div class="sa-section-head">
        <div>
          <h3>SoundAlerts</h3>
          <div class="sa-note">Einträge ordnen SoundAlert-Namen Dateien, Kategorie, Priorität und Lautstärke zu.</div>
        </div>
        <div class="sa-actions sa-section-actions">
          ${btn('Neuer SoundAlert', 'add-rule')}
          ${btn('Einträge speichern', 'save-config', 'success')}
        </div>
      </div>

      ${renderPendingNotice()}

      <div class="sa-entry-toolbar">
        <label class="sa-field sa-filter-field">
          <span>Einträge anzeigen</span>
          <select id="saRuleFilter" data-sa-rule-filter>
            <option value="all" ${ruleFilter === 'all' ? 'selected' : ''}>Alle (${esc(counts.total)})</option>
            <option value="active" ${ruleFilter === 'active' ? 'selected' : ''}>Aktiv (${esc(counts.active)})</option>
            <option value="inactive" ${ruleFilter === 'inactive' ? 'selected' : ''}>Inaktiv (${esc(counts.inactive)})</option>
            <option value="review_required" ${ruleFilter === 'review_required' ? 'selected' : ''}>Zur Prüfung (${esc(counts.review_required)})</option>
            <option value="missing_file" ${ruleFilter === 'missing_file' ? 'selected' : ''}>Datei fehlt (${esc(counts.missing_file)})</option>
            <option value="ignored" ${ruleFilter === 'ignored' ? 'selected' : ''}>Ignoriert (${esc(counts.ignored)})</option>
          </select>
        </label>
        <div class="sa-muted">Aktueller Filter: ${esc(ruleFilterLabel())} · ${esc(entries.length)} von ${esc(list.length)} Einträgen sichtbar.</div>
      </div>

      <div class="sa-entry-layout sa-entry-layout-clean">
        <aside class="sa-entry-sidebar">
          <label class="sa-field sa-picker-field"><span>SoundAlert auswählen</span>${renderRuleSelect(entries)}</label>
          <div class="sa-entry-list">
            ${entries.map(item => renderRuleCard(item.rule, item.idx)).join('') || '<div class="sa-empty">Keine Einträge für diesen Filter.</div>'}
          </div>
        </aside>
        <section class="sa-entry-editor">
          ${selected ? renderRuleEditor(selected, selectedRuleIndex) : '<div class="sa-empty">SoundAlert auswählen oder neu erstellen.</div>'}
        </section>
      </div>
      <div class="sa-note sa-bottom-note">Dateien sind relativ zu <code>htdocs/assets/sounds</code>, z. B. <code>soundalerts/video/name.mp4</code>. Automatisch erkannte Einträge bleiben <strong>Zur Prüfung</strong>, bis sie gespeichert/freigegeben werden.</div>
    `;
  }

  function renderPendingNotice(){
    const pending = pendingRuleIndexes();
    if (!pending.length) return '';
    const first = pending[0];
    const preview = pending.slice(0, 4).map(idx => {
      const rule = rules()[idx] || {};
      return `<span class="sa-setup-chip">${esc(rule.label || rule.soundAlertName || `SoundAlert ${idx + 1}`)} · ${esc(setupReason(rule))}</span>`;
    }).join('');
    return `
      <div class="sa-setup-notice">
        <div>
          <strong>${pending.length} SoundAlert${pending.length === 1 ? '' : 's'} brauchen Prüfung</strong>
          <div class="sa-muted">Automatisch erkannte Einträge bleiben zur Prüfung sichtbar, bis sie gespeichert/freigegeben wurden. Bewusst inaktive Einträge zählen nicht als offen.</div>
          <div class="sa-setup-chips">${preview}</div>
        </div>
        <div class="sa-actions sa-setup-actions">
          ${btn('Ersten offenen Eintrag bearbeiten', `edit-rule:${first}`, 'success')}
        </div>
      </div>
    `;
  }

  function renderRuleSelect(entries){
    if (!entries.length) return '<select id="saRulePicker" data-sa-rule-picker disabled><option>Keine Einträge</option></select>';
    return `<select id="saRulePicker" data-sa-rule-picker>${entries.map(item => `<option value="${item.idx}" ${item.idx === selectedRuleIndex ? 'selected' : ''}>${esc(item.rule.label || item.rule.soundAlertName || `SoundAlert ${item.idx + 1}`)}</option>`).join('')}</select>`;
  }

  function renderRuleCard(rule, idx){
    const active = idx === selectedRuleIndex ? ' active' : '';
    const media = String(rule.mediaType || 'audio').toLowerCase();
    const enabled = rule.enabled === false ? false : true;
    const needsSetup = ruleNeedsAction(rule);
    return `
      <article class="sa-entry-card${active}" data-sa-select-rule="${idx}">
        <div class="sa-entry-main">
          <div class="sa-entry-title">
            <strong>${esc(rule.label || rule.soundAlertName || `SoundAlert ${idx + 1}`)}</strong>
            ${renderRuleBadges(rule)}
          </div>
          <div class="sa-entry-meta">
            <span>${esc(rule.soundAlertName || '-')}</span>
            <span>${esc(rule.file || 'Keine Datei')}</span>
            <span>${esc(categoryName(rule.category || ''))}</span>
            <span>Ausgabe: ${esc(outputTargetLabel(rule.outputTarget || rule.output_target, rule.mediaType))}</span>
            <span>${esc(priorityLabel(rule))}</span>
            <span>${esc(value(rule.volume, defaultVolume()))}%</span>
          </div>
        </div>
        <div class="sa-entry-actions sa-icon-actions">
          ${canTestRule(rule) ? iconBtn('▶', 'Eintrag testen', `test-rule:${idx}`, 'success') : ''}
          ${iconBtn('✏️', 'Bearbeiten', `edit-rule:${idx}`)}
          ${iconBtn('🗑️', 'Löschen', `remove-rule:${idx}`, 'danger')}
        </div>
      </article>
    `;
  }

  function renderCategorySelect(rule){
    const current = rule.category || '';
    return `<select data-sa-rule-field="category">${CATEGORY_OPTIONS.map(opt => `<option value="${esc(opt.value)}" data-priority="${esc(opt.priority ?? '')}" ${opt.value === current ? 'selected' : ''}>${esc(opt.priority === null ? opt.label : `${opt.label} (${opt.priority})`)}</option>`).join('')}</select>`;
  }

  function renderUploadStatus(idx){
    if (!uploadState.active && uploadState.index !== idx) return '';
    const active = uploadState.active && uploadState.index === idx;
    const progress = Math.max(0, Math.min(100, Number(uploadState.progress || 0)));
    const cls = uploadState.error ? ' error' : (active ? ' active' : ' done');
    const message = uploadState.error || uploadState.message || (active ? 'Upload läuft…' : 'Upload abgeschlossen');
    const details = uploadState.fileName ? `${uploadState.fileName}${uploadState.sizeMb ? ` · ${uploadState.sizeMb} MB` : ''}` : '';
    return `
      <div class="sa-upload-status${cls}" data-sa-upload-status>
        <div class="sa-upload-status-head">
          <strong>${esc(message)}</strong>
          <span>${active ? `${Math.round(progress)}%` : ''}</span>
        </div>
        ${details ? `<div class="sa-muted">${esc(details)}</div>` : ''}
        <div class="sa-upload-progress"><span style="width:${esc(progress)}%"></span></div>
      </div>
    `;
  }

  function renderRuleEditor(rule, idx){
    return `
      <div class="sa-editor-head">
        <div>
          <h4>Eintrag bearbeiten</h4>
          <div class="sa-muted">${esc(rule.label || rule.soundAlertName || `SoundAlert ${idx + 1}`)}</div>
        </div>
        <div class="sa-actions sa-editor-actions sa-icon-actions">
          ${iconBtn('💾', isReviewRule(rule) || ruleNeedsSetup(rule) ? 'Speichern / Freigeben' : 'Speichern', `save-current-rule:${idx}`, 'success')}
          ${canTestRule(rule) ? iconBtn('▶', 'Eintrag testen', `test-rule:${idx}`, 'success') : ''}
          ${!isIgnoredRule(rule) ? iconBtn('🚫', 'Ignorieren', `ignore-rule:${idx}`, 'secondary sa-less-important') : ''}
          ${iconBtn('🗑️', 'Löschen', `remove-rule:${idx}`, 'danger')}
        </div>
      </div>
      <div class="sa-rule sa-rule-editor" data-sa-rule-index="${idx}">
        <label class="sa-check"><input data-sa-rule-field="enabled" type="checkbox" ${rule.enabled === false ? '' : 'checked'}><span>Aktiv</span></label>
        <label class="sa-field"><span>SoundAlerts-Name</span><input data-sa-rule-field="soundAlertName" type="text" value="${esc(rule.soundAlertName || '')}"></label>
        <label class="sa-field"><span>Label</span><input data-sa-rule-field="label" type="text" value="${esc(rule.label || rule.soundAlertName || '')}"></label>
        <label class="sa-field"><span>Typ</span><select data-sa-rule-field="mediaType"><option value="audio" ${rule.mediaType === 'audio' ? 'selected' : ''}>Audio</option><option value="video" ${rule.mediaType === 'video' ? 'selected' : ''}>Video</option></select></label>
        <label class="sa-field"><span>Ausgabe</span><select data-sa-rule-field="outputTarget"><option value="device" ${normalizeOutputTarget(rule.outputTarget || rule.output_target, rule.mediaType) === 'device' ? 'selected' : ''}>Device</option><option value="overlay" ${normalizeOutputTarget(rule.outputTarget || rule.output_target, rule.mediaType) === 'overlay' ? 'selected' : ''}>Overlay</option><option value="both" ${normalizeOutputTarget(rule.outputTarget || rule.output_target, rule.mediaType) === 'both' ? 'selected' : ''}>Beides</option></select></label>
        <label class="sa-field sa-wide sa-file-field"><span>Datei</span><input data-sa-rule-field="file" type="text" value="${esc(rule.file || '')}"></label>
        <div class="sa-upload-row sa-wide">
          <input data-sa-file-input="${idx}" type="file" hidden accept=".mp3,.wav,.ogg,.webm,.m4a,.mp4">
          <button type="button" data-sa-action="upload-rule-file:${idx}" ${uploadState.active && uploadState.index === idx ? 'disabled' : ''}>${uploadState.active && uploadState.index === idx ? '⏳ Upload läuft…' : '⬆ Datei hochladen'}</button>
          <span class="sa-muted">Audio/Video wird passend gespeichert. Max. Audio: ${esc(uploadLimitMb(config?.upload || {}, 'maxAudioSizeBytes', 15))} MB · Max. Video: ${esc(uploadLimitMb(config?.upload || {}, 'maxVideoSizeBytes', 500))} MB.</span>
          ${renderUploadStatus(idx)}
        </div>
        <label class="sa-field"><span>Kategorie</span>${renderCategorySelect(rule)}</label>
        <label class="sa-field"><span>Priorität überschreiben</span><input data-sa-rule-field="priority" type="number" min="0" max="200" placeholder="${esc(priorityPlaceholder(rule))}" value="${esc(priorityOverrideValue(rule))}"></label>
        <label class="sa-field"><span>Lautstärke</span><input data-sa-rule-field="volume" type="number" min="0" max="100" value="${esc(value(rule.volume, defaultVolume()))}"></label>
      </div>
      <div class="sa-note" data-sa-priority-hint>Priorität leer lassen = Kategorie-Standard ${esc(standardPriority(rule))}. Nur eintragen, wenn dieser SoundAlert bewusst abweichen soll.</div>
      <div class="sa-note sa-output-hint">Test nutzt das gespeicherte Ausgabeziel. Für Overlay/Beides vorher das lokale Overlay öffnen und Änderungen speichern.</div>
    `;
  }

  function renderEvents(){
    const el = document.getElementById('saEventsCard');
    if (!el) return;
    el.innerHTML = `
      <h3>Letzte Events</h3>
      <div class="sa-event-list">
        ${(events || []).map((ev, idx) => renderEvent(ev, idx)).join('') || '<div class="sa-empty">Noch keine Events.</div>'}
      </div>
    `;
  }

  function renderEvent(ev, idx){
    const ruleIdx = findRuleIndexForEvent(ev);
    const hasFile = !!ev.file;
    const canCreate = canCreateEntryFromEvent(ev, ruleIdx);
    const detail = eventDetailLine(ev, ruleIdx);
    return `
      <div class="sa-event sa-event-card ${isCurrentMissingEvent(ev, ruleIdx) ? 'sa-event-log-only' : ''}">
        <div class="sa-event-main">
          <strong>${esc(eventSoundName(ev))}</strong>
          <small>${esc(eventUserName(ev))} · ${esc(ev.amount ?? 0)} ${esc(ev.currency || '')} · ${esc(eventCreatedAt(ev))}</small>
          <small class="sa-event-detail">${esc(detail || '')}</small>
        </div>
        <div class="sa-event-side">
          <span class="sa-pill ${esc(eventDisplayClass(ev, ruleIdx))}">${esc(eventDisplayStatus(ev, ruleIdx))}</span>
          <div class="sa-actions sa-event-actions">
            ${hasFile ? btn('Erneut abspielen', `replay-event:${idx}`) : ''}
            ${ruleIdx >= 0 ? btn('Eintrag bearbeiten', `edit-rule:${ruleIdx}`) : ''}
            ${canCreate ? btn('Eintrag erstellen', `create-from-event:${idx}`, 'success') : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderStats(){
    const el = document.getElementById('saStatsCard');
    if (!el) return;
    const bySound = Array.isArray(stats?.bySound) ? stats.bySound : [];
    const byUser = Array.isArray(stats?.byUser) ? stats.byUser : [];
    const statusRows = usefulStatusRows();
    const playedCount = playedCountFromStats();
    const soundTotal = countRows(bySound);
    const userTotal = countRows(byUser);
    el.innerHTML = `
      <div class="sa-section-head sa-stats-head">
        <div>
          <h3>Statistik</h3>
          <div class="sa-note">Nutzbare Auswertung: abgespielte Sounds, Top-Sounds und aktive User.</div>
        </div>
        <div class="sa-actions sa-section-actions">
          ${btn('Neu laden', 'reload')}
        </div>
      </div>
      <div class="sa-stats-summary">
        <div class="sa-stat-tile"><span>Abgespielt</span><strong>${esc(playedCount)}</strong></div>
        <div class="sa-stat-tile"><span>Sound-Auslösungen</span><strong>${esc(soundTotal)}</strong></div>
        <div class="sa-stat-tile"><span>User-Auslösungen</span><strong>${esc(userTotal)}</strong></div>
        <div class="sa-stat-tile"><span>Verschiedene Sounds</span><strong>${esc(bySound.length)}</strong></div>
        <div class="sa-stat-tile"><span>Verschiedene User</span><strong>${esc(byUser.length)}</strong></div>
      </div>
      <div class="sa-stat-columns sa-stat-columns-clean">
        <div class="sa-stat-box">
          <h4>Top Sounds</h4>
          ${bySound.slice(0, 10).map(r => `<div class="sa-row"><span>${esc(r.soundAlertName || r.soundalert_name || '-')}</span><strong>${esc(r.count || 0)}</strong></div>`).join('') || '<div class="sa-empty">Keine Daten</div>'}
        </div>
        <div class="sa-stat-box">
          <h4>Top User</h4>
          ${byUser.slice(0, 10).map(r => `<div class="sa-row"><span>${esc(r.user || r.triggerUserDisplay || r.trigger_user_display || '-')}</span><strong>${esc(r.count || 0)}</strong></div>`).join('') || '<div class="sa-empty">Keine Daten</div>'}
        </div>
        <div class="sa-stat-box">
          <h4>Abspiel-Status</h4>
          ${statusRows.map(r => `<div class="sa-row"><span>${esc(statusLabel(r.status || '-'))}</span><strong>${esc(r.count || 0)}</strong></div>`).join('') || '<div class="sa-empty">Noch keine Abspiel-Daten</div>'}
        </div>
      </div>
    `;
  }

  function readNumber(id, fallback, min, max){
    const n = Number(document.getElementById(id)?.value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.round(n)));
  }
  function readBool(id){ return !!document.getElementById(id)?.checked; }
  function readText(id){ return String(document.getElementById(id)?.value || '').trim(); }

  function normalizeRule(rule, idx){
    const soundAlertName = String(rule.soundAlertName || '').trim();
    const file = String(rule.file || '').trim();
    const mediaType = normalizeMediaType(rule.mediaType, file);
    return {
      ...rule,
      id: String(rule.id || soundAlertName || `rule_${idx + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || `rule_${idx + 1}`,
      enabled: rule.enabled === false ? false : true,
      soundAlertName,
      label: String(rule.label || soundAlertName).trim(),
      file,
      mediaType,
      category: normalizeCategory(rule.category),
      outputTarget: normalizeOutputTarget(rule.outputTarget || rule.output_target, mediaType),
      priority: normalizePriorityOverride(rule.priority),
      volume: Math.max(0, Math.min(100, Number(value(rule.volume, defaultVolume()))))
    };
  }

  function saveActiveRuleFromDom(){
    const box = document.querySelector('[data-sa-rule-index]');
    if (!box || !config) return;
    const idx = Number(box.dataset.saRuleIndex);
    const list = rules().slice();
    if (!Number.isInteger(idx) || idx < 0 || idx >= list.length) return;
    function field(name){ return box.querySelector(`[data-sa-rule-field="${name}"]`); }
    const current = list[idx] || {};
    const soundAlertName = String(field('soundAlertName')?.value || '').trim();
    list[idx] = normalizeRule({
      ...current,
      enabled: !!field('enabled')?.checked,
      soundAlertName,
      label: String(field('label')?.value || soundAlertName).trim(),
      file: String(field('file')?.value || '').trim(),
      mediaType: String(field('mediaType')?.value || 'audio').trim(),
      category: normalizeCategory(field('category')?.value),
      outputTarget: normalizeOutputTarget(field('outputTarget')?.value || current.outputTarget || current.output_target, String(field('mediaType')?.value || 'audio').trim()),
      priority: normalizePriorityOverride(field('priority')?.value),
      volume: Math.max(0, Math.min(100, Number(field('volume')?.value || defaultVolume())))
    }, idx);
    config = { ...(config || {}), rules: list };
  }

  function finalizeRuleForSave(rule, idx){
    const normalized = normalizeRule(rule, idx);
    if (isIgnoredRule(normalized)) return normalized;
    const hasName = !!String(normalized.soundAlertName || '').trim();
    const hasFile = !isPlaceholderFile(normalized.file);
    if (hasName && hasFile) {
      return {
        ...normalized,
        status: normalized.enabled === false ? 'inactive' : 'active'
      };
    }
    return {
      ...normalized,
      status: 'missing_file'
    };
  }

  function readRulesFromState(finalizeIndex){
    saveActiveRuleFromDom();
    const releaseIndex = Number.isInteger(finalizeIndex) ? finalizeIndex : -1;
    return rules()
      .map((rule, idx) => idx === releaseIndex ? finalizeRuleForSave(rule, idx) : normalizeRule(rule, idx))
      .filter(rule => rule.soundAlertName || rule.file);
  }

  function buildConfigFromDom(finalizeIndex){
    const current = config || {};
    return {
      ...current,
      enabled: readBool('saEnabled'),
      bot: {
        ...(current.bot || {}),
        login: readText('saBotLogin') || 'soundalerts',
        userId: readText('saBotUserId'),
        displayName: readText('saBotDisplayName') || 'SoundAlerts'
      },
      parser: {
        ...(current.parser || {}),
        messageFormats: readParserFormatsFromDom()
      },
      soundSystem: {
        ...(current.soundSystem || {}),
        defaultCategory: readText('saDefaultCategory') || 'channel_reward',
        defaultPriority: readNumber('saDefaultPriority', 70, 0, 200),
        audioOutputTarget: readText('saAudioTarget') || 'device',
        videoOutputTarget: readText('saVideoTarget') || 'overlay',
        defaultVolume: readNumber('saDefaultVolume', 100, 0, 100)
      },
      upload: {
        ...(current.upload || {}),
        maxAudioSizeBytes: mbToBytes(readNumber('saMaxAudioMb', uploadLimitMb(current.upload || {}, 'maxAudioSizeBytes', 15), 1, 20480), 15),
        maxVideoSizeBytes: mbToBytes(readNumber('saMaxVideoMb', uploadLimitMb(current.upload || {}, 'maxVideoSizeBytes', 500), 1, 20480), 500)
      },
      dedupe: {
        ...(current.dedupe || {}),
        enabled: readBool('saDedupeEnabled'),
        windowMs: readNumber('saDedupeMs', 3000, 0, 600000)
      },
      chatMessages: {
        ...(current.chatMessages || {}),
        enabled: true,
        onMissingFile: readBool('saChatMissing'),
        onUnmatched: readBool('saChatUnmatched'),
        cooldownMs: readNumber('saChatCooldown', 15000, 0, 600000)
      },
      rules: readRulesFromState(finalizeIndex)
    };
  }

  async function saveConfig(finalizeIndex){
    const next = buildConfigFromDom(finalizeIndex);
    await api('/settings', { method: 'POST', body: JSON.stringify({ settings: { 'parser.messageFormats': next.parser?.messageFormats || [] } }) });
    const saved = await api('/config', { method: 'POST', body: JSON.stringify({ config: next }) });
    config = saved.config || next;
    await api('/reload', { method: 'POST', body: '{}' }).catch(() => null);
    await loadAll(true);
  }

  function clampSelectedRule(){
    const count = rules().length;
    if (count <= 0) selectedRuleIndex = 0;
    else selectedRuleIndex = Math.max(0, Math.min(selectedRuleIndex, count - 1));
  }

  function entryKey(rule){
    return String(rule?.id || rule?.entry_key || rule?.soundAlertName || rule?.label || '').trim();
  }

  async function deleteEntryNow(rule){
    const key = entryKey(rule);
    if (!key) throw new Error('Eintrag hat keine ID und kann nicht direkt geloescht werden.');
    return api(`/entries/${encodeURIComponent(key)}`, { method: 'DELETE' });
  }

  async function ignoreEntryNow(rule){
    const key = entryKey(rule);
    if (!key) throw new Error('Eintrag hat keine ID und kann nicht direkt ignoriert werden.');
    return api(`/entries/${encodeURIComponent(key)}/ignore`, { method: 'POST', body: '{}' });
  }

  function addRule(seed){
    saveActiveRuleFromDom();
    const list = rules().slice();
    const next = normalizeRule({
      enabled: false,
      soundAlertName: seed?.soundAlertName || '',
      label: seed?.label || seed?.soundAlertName || '',
      file: seed?.file || 'soundalerts/audio/',
      mediaType: seed?.mediaType || 'audio',
      category: seed?.category || 'channel_reward',
      outputTarget: seed?.outputTarget || '',
      priority: seed?.priority ?? null,
      volume: seed?.volume ?? defaultVolume()
    }, 0);
    list.unshift(next);
    config = { ...(config || {}), rules: list };
    selectedRuleIndex = 0;
    activeTab = 'rules';
    render();
  }

  async function removeRule(idx){
    saveActiveRuleFromDom();
    const item = rules()[idx];
    if (!item) return;
    const label = item.label || item.soundAlertName || 'Eintrag';
    if (!confirm(`SoundAlert "${label}" wirklich dauerhaft löschen?

Wenn derselbe SoundAlerts-Chat später erneut kommt, wird er wieder als neuer offener Eintrag angelegt.`)) return;
    await deleteEntryNow(item);
    activeTab = 'rules';
    selectedRuleIndex = Math.max(0, idx - 1);
    await loadAll(true);
  }

  async function ignoreRule(idx){
    saveActiveRuleFromDom();
    const item = rules()[idx];
    if (!item) return;
    const label = item.label || item.soundAlertName || 'Eintrag';
    if (!confirm(`SoundAlert "${label}" ignorieren?

Ignorierte Einträge bleiben gespeichert und werden nicht mehr automatisch neu als offener Eintrag angelegt.`)) return;
    await ignoreEntryNow(item);
    activeTab = 'rules';
    selectedRuleIndex = idx;
    await loadAll(true);
  }

  function editRule(idx){
    saveActiveRuleFromDom();
    selectedRuleIndex = Number(idx) || 0;
    activeTab = 'rules';
    render();
  }

  function createRuleFromEvent(ev){
    const name = String(ev?.soundalert_name || ev?.soundAlertName || '').trim();
    if (!name) return;
    const file = String(ev?.file || '').trim();
    addRule({
      soundAlertName: name,
      label: name,
      file: file || 'soundalerts/audio/',
      mediaType: file.toLowerCase().endsWith('.mp4') || file.toLowerCase().endsWith('.webm') ? 'video' : 'audio',
      category: 'channel_reward',
      priority: null,
      volume: defaultVolume()
    });
  }

  function buildReplayText(ev){
    if (ev?.raw_text) return String(ev.raw_text);
    if (ev?.rawText) return String(ev.rawText);
    const user = ev?.trigger_user_display || ev?.triggerUserDisplay || config?.bot?.displayName || 'SoundAlerts';
    const name = ev?.soundalert_name || ev?.soundAlertName || 'Unbekannter Sound';
    const amount = ev?.amount ?? 0;
    const currency = ev?.currency || 'Bits';
    return `${user} spielt ${name} für ${amount} ${currency}!`;
  }

  async function replayEvent(ev){
    await runTest(buildReplayText(ev));
  }

  function buildRuleTestText(rule){
    const user = status?.lastEvent?.triggerUserDisplay || 'ForrestCGN';
    const name = String(rule?.soundAlertName || rule?.label || '').trim() || 'Unbekannter Sound';
    return `${user} spielt ${name} für 0 Bits!`;
  }

  async function testRule(idx){
    saveActiveRuleFromDom();
    const rule = rules()[idx];
    if (!rule) return;
    if (!canTestRule(rule)) {
      alert('Dieser Eintrag kann noch nicht getestet werden. Es braucht mindestens einen SoundAlerts-Namen und eine Datei.');
      return;
    }
    selectedRuleIndex = idx;
    activeTab = 'rules';
    await runTest(buildRuleTestText(rule));
  }

  function inferUploadName(rule, fileObj){
    const fromRule = String(rule?.soundAlertName || rule?.label || '').trim();
    if (fromRule) return fromRule;
    return String(fileObj?.name || '').replace(/\.[a-z0-9]+$/i, '');
  }

  function setUploadState(next){
    uploadState = { ...uploadState, ...(next || {}) };
    render();
  }

  function uploadFormDataWithProgress(body, idx){
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API}/upload`);
      xhr.upload.onprogress = ev => {
        if (!ev.lengthComputable) return;
        const progress = Math.round((ev.loaded / ev.total) * 100);
        setUploadState({ active: true, index: idx, progress, message: `Upload läuft… ${progress}%` });
      };
      xhr.onload = () => {
        let json = {};
        try { json = xhr.responseText ? JSON.parse(xhr.responseText) : {}; } catch (_) { json = { raw: xhr.responseText || '' }; }
        resolve({ status: xhr.status, ok: xhr.status >= 200 && xhr.status < 300, json });
      };
      xhr.onerror = () => reject(new Error('Upload fehlgeschlagen: Netzwerkfehler.'));
      xhr.onabort = () => reject(new Error('Upload abgebrochen.'));
      xhr.send(body);
    });
  }

  async function uploadRuleFile(idx, fileObj, overwrite){
    if (!fileObj) return;
    saveActiveRuleFromDom();
    const list = rules().slice();
    const rule = list[idx];
    if (!rule) return;
    const mediaType = String(rule.mediaType || '').toLowerCase() === 'video' ? 'video' : 'audio';
    const sizeMb = fileSizeMb(fileObj);
    uploadState = {
      active: true,
      index: idx,
      progress: 0,
      message: 'Upload startet…',
      fileName: fileObj.name || '',
      sizeMb,
      error: ''
    };
    render();

    const body = new FormData();
    body.append('file', fileObj);
    body.append('mediaType', mediaType);
    body.append('name', inferUploadName(rule, fileObj));
    body.append('soundAlertName', rule.soundAlertName || rule.label || '');
    if (overwrite) body.append('overwrite', 'true');

    let result;
    try {
      const response = await uploadFormDataWithProgress(body, idx);
      result = response.json || {};
      if (response.status === 409 && result?.error === 'file_exists' && !overwrite) {
        setUploadState({ active: false, progress: 0, message: 'Datei existiert bereits.', error: '' });
        if (!confirm(`Datei existiert bereits:\n${result.file || fileObj.name}\n\nÜberschreiben?`)) return;
        return uploadRuleFile(idx, fileObj, true);
      }
      if (!response.ok || result?.ok === false) throw new Error(result?.message || result?.error || `Upload fehlgeschlagen (${response.status})`);
    } catch (err) {
      setUploadState({ active: false, progress: 0, message: '', error: err.message || String(err) });
      alert(err.message || String(err));
      return;
    }

    const data = result || {};
    const uploadedFile = data.file || data.result?.file || '';
    if (!uploadedFile) {
      setUploadState({ active: false, progress: 100, message: '', error: 'Upload erfolgreich, aber kein Dateipfad erhalten.' });
      alert('Upload erfolgreich, aber es wurde kein Dateipfad zurückgegeben.');
      return;
    }

    list[idx] = normalizeRule({
      ...rule,
      file: uploadedFile,
      status: 'review_required',
      mediaType: data.mediaType || mediaType,
      outputTarget: normalizeOutputTarget(rule.outputTarget || rule.output_target, data.mediaType || mediaType)
    }, idx);
    config = { ...(config || {}), rules: list };
    selectedRuleIndex = idx;
    activeTab = 'rules';
    setUploadState({ active: false, progress: 100, message: 'Upload abgeschlossen.', error: '' });
    await saveConfig();
  }

  async function runTest(text){
    await api('/test/chat', { method: 'POST', body: JSON.stringify({ login: config?.bot?.login || 'soundalerts', user: config?.bot?.displayName || 'SoundAlerts', text }) });
    await loadAll(true);
  }

  async function loadAll(force){
    if (loading && !force) return;
    loading = true;
    try {
      const [st, ev, stat] = await Promise.all([
        api('/status'),
        api('/events?limit=25').catch(() => ({ events: [] })),
        api('/stats').catch(() => ({ stats: null }))
      ]);
      status = st;
      config = st.config || null;
      events = ev.events || [];
      stats = stat.stats || null;
      render();
    } catch (err) {
      if (root) root.innerHTML = `<div class="sa-card"><h3>Fehler</h3><div class="sa-empty">${esc(err.message || err)}</div></div>`;
    } finally {
      loading = false;
    }
  }

  function applyTab(){
    document.querySelectorAll('.sa-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.saTab === activeTab));
    document.querySelectorAll('[data-sa-section]').forEach(el => {
      const sections = String(el.dataset.saSection || '').split(/\s+/);
      el.hidden = !sections.includes(activeTab);
    });
  }

  function bind(){
    if (bound) return;
    bound = true;
    document.addEventListener('change', ev => {
      const filter = ev.target.closest('[data-sa-rule-filter]');
      if (filter) {
        saveActiveRuleFromDom();
        ruleFilter = String(filter.value || 'all');
        clampSelectedRuleToFilter();
        render();
        return;
      }
      const picker = ev.target.closest('[data-sa-rule-picker]');
      if (picker) {
        saveActiveRuleFromDom();
        selectedRuleIndex = Number(picker.value) || 0;
        render();
        return;
      }
      const category = ev.target.closest('[data-sa-rule-field="category"]');
      if (category) {
        const box = category.closest('[data-sa-rule-index]');
        const prioInput = box?.querySelector('[data-sa-rule-field="priority"]');
        const hint = box?.parentElement?.querySelector('[data-sa-priority-hint]');
        const fakeRule = { category: String(category.value || ''), priority: prioInput?.value || null };
        if (prioInput && String(prioInput.value || '').trim() === '') prioInput.placeholder = priorityPlaceholder(fakeRule);
        if (hint) hint.textContent = `Priorität leer lassen = Kategorie-Standard ${standardPriority(fakeRule)}. Nur eintragen, wenn dieser SoundAlert bewusst abweichen soll.`;
      }
    });

    document.addEventListener('change', async ev => {
      const input = ev.target.closest('[data-sa-file-input]');
      if (!input) return;
      const idx = Number(input.dataset.saFileInput);
      const fileObj = input.files && input.files[0] ? input.files[0] : null;
      input.value = '';
      if (fileObj) await uploadRuleFile(idx, fileObj, false);
    });

    document.addEventListener('click', async ev => {
      const selectCard = ev.target.closest('[data-sa-select-rule]');
      if (selectCard && !ev.target.closest('button')) {
        saveActiveRuleFromDom();
        selectedRuleIndex = Number(selectCard.dataset.saSelectRule) || 0;
        render();
        return;
      }
      const tab = ev.target.closest('[data-sa-tab]');
      if (tab) {
        saveActiveRuleFromDom();
        activeTab = tab.dataset.saTab || 'overview';
        applyTab();
        return;
      }
      const actionEl = ev.target.closest('[data-sa-action]');
      if (!actionEl) return;
      const action = actionEl.dataset.saAction || '';
      try {
        if (action === 'reload') await loadAll(true);
        else if (action.startsWith('upload-rule-file:')) {
          if (uploadState.active) return;
          const idx = Number(action.split(':')[1]);
          saveActiveRuleFromDom();
          const input = document.querySelector(`[data-sa-file-input="${idx}"]`);
          if (input) input.click();
        }
        else if (action === 'save-config') await saveConfig();
        else if (action === 'open-local-overlay') window.open(localOverlayUrl(), 'cgn_sound_overlay_test', 'width=960,height=540,noopener,noreferrer');
        else if (action.startsWith('save-current-rule:')) await saveConfig(Number(action.split(':')[1]));
        else if (action === 'show-events') { activeTab = 'events'; applyTab(); }
        else if (action === 'show-rules') { ruleFilter = 'all'; activeTab = 'rules'; render(); }
        else if (action.startsWith('show-rules:')) { ruleFilter = action.split(':')[1] || 'all'; activeTab = 'rules'; render(); }
        else if (action === 'show-stats') { activeTab = 'stats'; applyTab(); }
        else if (action === 'add-parser-format') addParserFormat();
        else if (action === 'reset-parser-formats') resetParserFormats();
        else if (action === 'test-parser-format') testParserFormats();
        else if (action === 'add-rule') addRule();
        else if (action.startsWith('test-rule:')) await testRule(Number(action.split(':')[1]));
        else if (action.startsWith('remove-rule:')) await removeRule(Number(action.split(':')[1]));
        else if (action.startsWith('ignore-rule:')) await ignoreRule(Number(action.split(':')[1]));
        else if (action.startsWith('edit-rule:')) editRule(Number(action.split(':')[1]));
        else if (action.startsWith('create-from-event:')) createRuleFromEvent(events[Number(action.split(':')[1])]);
        else if (action === 'create-from-last-event') createRuleFromEvent(status?.lastEvent);
        else if (action.startsWith('replay-event:')) await replayEvent(events[Number(action.split(':')[1])]);
        else if (action === 'replay-last-event') await replayEvent(status?.lastEvent);
        else if (action === 'test-known') await runTest('ForrestCGN spielt Fahrstuhl Sound für 0 Bits!');
        else if (action === 'test-unknown') await runTest('ForrestCGN spielt Unbekannter Testsound für 0 Bits!');
      } catch (err) {
        alert(err.message || String(err));
      }
    });
  }

  function init(){
    registerDashboardModule();
    ensureRoot();
    renderShell();
    bind();
  }

  window.addEventListener('cgn:module-show', ev => {
    if (ev.detail?.module === 'soundalerts') loadAll(true);
  });

  registerDashboardModule();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { init, loadAll, render };
})();
