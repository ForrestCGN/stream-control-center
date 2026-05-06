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

  const CATEGORY_OPTIONS = [
    { value: '', label: 'Standard / global', priority: null },
    { value: 'channel_reward', label: 'Kanalpunkte / SoundAlert', priority: 70 },
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

  function categoryOption(value){
    return CATEGORY_OPTIONS.find(item => item.value === value) || CATEGORY_OPTIONS[0];
  }

  function categoryLabel(value){
    const opt = categoryOption(value || '');
    return opt.priority === null ? opt.label : `${opt.label} (${opt.priority})`;
  }

  function effectivePriority(rule){
    if (rule?.priority !== undefined && rule?.priority !== null && rule?.priority !== '') return Number(rule.priority);
    const opt = categoryOption(rule?.category || '');
    if (opt.priority !== null) return opt.priority;
    return defaultPriority();
  }

  function statusLabel(statusValue){
    const s = String(statusValue || '').toLowerCase();
    if (s === 'queued') return 'In Warteschlange';
    if (s === 'played' || s === 'success' || s === 'done') return 'Abgespielt';
    if (s === 'unmatched') return 'Nicht eingerichtet';
    if (s === 'no_mapping') return 'Kein Eintrag';
    if (s === 'file_missing') return 'Datei fehlt';
    if (s === 'failed') return 'Fehler';
    return statusValue || '-';
  }

  function statusClass(statusValue){
    const s = String(statusValue || '').toLowerCase();
    if (s === 'no_mapping') return 'unmatched';
    if (s === 'success' || s === 'played' || s === 'done') return 'queued';
    return s || 'unknown';
  }

  function findRuleIndexForEvent(ev){
    const name = String(ev?.soundalert_name || ev?.soundAlertName || '').trim().toLowerCase();
    if (!name) return -1;
    return rules().findIndex(rule => String(rule.soundAlertName || '').trim().toLowerCase() === name);
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
          ${btn('Config speichern', 'save-config', 'success')}
          ${btn('Test Fahrstuhl', 'test-known')}
          ${btn('Test Unbekannt', 'test-unknown')}
        </div>
      </div>

      <div class="sa-tabs" role="tablist" aria-label="SoundAlerts Navigation">
        <button type="button" class="sa-tab active" data-sa-tab="overview">Übersicht</button>
        <button type="button" class="sa-tab" data-sa-tab="settings">Bot & Settings</button>
        <button type="button" class="sa-tab" data-sa-tab="rules">Einträge</button>
        <button type="button" class="sa-tab" data-sa-tab="events">Events</button>
        <button type="button" class="sa-tab" data-sa-tab="stats">Statistik</button>
      </div>

      <div class="sa-grid">
        <div class="sa-card" id="saOverviewCard" data-sa-section="overview"></div>
        <div class="sa-card" id="saLastEventCard" data-sa-section="overview"></div>
        <div class="sa-card" id="saSettingsCard" data-sa-section="settings"></div>
        <div class="sa-card" id="saRulesCard" data-sa-section="rules"></div>
        <div class="sa-card" id="saEventsCard" data-sa-section="events overview"></div>
        <div class="sa-card" id="saStatsCard" data-sa-section="stats overview"></div>
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
    const db = st.database || {};
    el.innerHTML = `
      <h3>Status</h3>
      <div class="sa-row"><span>Modul</span><strong>${statusText(cfg.enabled !== false)}</strong></div>
      <div class="sa-row"><span>WebSocket</span><strong>${st.wsConnected ? 'Verbunden' : 'Nicht verbunden'}</strong></div>
      <div class="sa-row"><span>Bot-Login</span><strong>${esc(cfg.bot?.login || '-')}</strong></div>
      <div class="sa-row"><span>Einträge</span><strong>${esc(rules().length)}</strong></div>
      <div class="sa-row"><span>Events DB</span><strong>${esc(db.stats?.total ?? 0)}</strong></div>
      <div class="sa-row"><span>Queued</span><strong>${esc(db.stats?.queued ?? 0)}</strong></div>
      <div class="sa-row"><span>Nicht eingerichtet</span><strong>${esc(db.stats?.unmatched ?? 0)}</strong></div>
      <div class="sa-row"><span>Datei fehlt</span><strong>${esc(db.stats?.fileMissing ?? 0)}</strong></div>
      <div class="sa-note">Config: ${esc(st.configPath || '')}</div>
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
    el.innerHTML = `
      <h3>Letztes Event</h3>
      <div class="sa-row"><span>Status</span><strong class="sa-pill ${esc(statusClass(ev.status))}">${esc(statusLabel(ev.status))}</strong></div>
      <div class="sa-row"><span>User</span><strong>${esc(ev.triggerUserDisplay || '-')}</strong></div>
      <div class="sa-row"><span>SoundAlert</span><strong>${esc(ev.soundAlertName || ev.soundalert_name || '-')}</strong></div>
      <div class="sa-row"><span>Betrag</span><strong>${esc(ev.amount ?? 0)} ${esc(ev.currency || '')}</strong></div>
      <div class="sa-row"><span>Datei</span><span class="sa-muted">${esc(ev.file || '-')}</span></div>
      <div class="sa-actions">
        ${ev.file ? btn('Erneut abspielen', 'replay-last-event') : ''}
        ${idx >= 0 ? btn('Eintrag bearbeiten', `edit-rule:${idx}`) : btn('Eintrag erstellen', 'create-from-last-event')}
      </div>
      <div class="sa-note">${esc(ev.rawText || ev.raw_text || '')}</div>
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
        <label class="sa-check"><input id="saDedupeEnabled" type="checkbox" ${dedupe.enabled === false ? '' : 'checked'}><span>Dedupe aktiv</span></label>
        <label class="sa-field"><span>Dedupe-Fenster ms</span><input id="saDedupeMs" type="number" min="0" max="600000" value="${esc(value(dedupe.windowMs, 3000))}"></label>
        <label class="sa-check"><input id="saChatMissing" type="checkbox" ${chat.onMissingFile === false ? '' : 'checked'}><span>Chatmeldung bei fehlender Datei</span></label>
        <label class="sa-check"><input id="saChatUnmatched" type="checkbox" ${chat.onUnmatched === true ? 'checked' : ''}><span>Chatmeldung bei unbekanntem Sound</span></label>
        <label class="sa-field"><span>Chat-Cooldown ms</span><input id="saChatCooldown" type="number" min="0" max="600000" value="${esc(value(chat.cooldownMs, 15000))}"></label>
      </div>
      <div class="sa-note">Unbekannte SoundAlerts werden geloggt. Einträge können später aus Events erstellt und aktiviert werden.</div>
    `;
  }

  function renderRules(){
    const el = document.getElementById('saRulesCard');
    if (!el) return;
    const list = rules();
    const selected = selectedRule();
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

      <div class="sa-entry-layout sa-entry-layout-clean">
        <aside class="sa-entry-sidebar">
          <label class="sa-field sa-picker-field"><span>SoundAlert auswählen</span>${renderRuleSelect(list)}</label>
          <div class="sa-entry-list">
            ${list.map((rule, idx) => renderRuleCard(rule, idx)).join('') || '<div class="sa-empty">Noch keine SoundAlerts.</div>'}
          </div>
        </aside>
        <section class="sa-entry-editor">
          ${selected ? renderRuleEditor(selected, selectedRuleIndex) : '<div class="sa-empty">SoundAlert auswählen oder neu erstellen.</div>'}
        </section>
      </div>
      <div class="sa-note sa-bottom-note">Dateien sind relativ zu <code>htdocs/assets/sounds</code>, z. B. <code>soundalerts/video/name.mp4</code>.</div>
    `;
  }

  function renderRuleSelect(list){
    return `<select id="saRulePicker" data-sa-rule-picker>${list.map((rule, idx) => `<option value="${idx}" ${idx === selectedRuleIndex ? 'selected' : ''}>${esc(rule.label || rule.soundAlertName || `SoundAlert ${idx + 1}`)}</option>`).join('')}</select>`;
  }

  function renderRuleCard(rule, idx){
    const active = idx === selectedRuleIndex ? ' active' : '';
    const media = String(rule.mediaType || 'audio').toLowerCase();
    const enabled = rule.enabled === false ? false : true;
    return `
      <article class="sa-entry-card${active}" data-sa-select-rule="${idx}">
        <div class="sa-entry-main">
          <div class="sa-entry-title">
            <strong>${esc(rule.label || rule.soundAlertName || `SoundAlert ${idx + 1}`)}</strong>
            <span class="sa-pill">${esc(media === 'video' ? 'Video' : 'Audio')}</span>
            <span class="sa-pill ${enabled ? 'queued' : 'failed'}">${enabled ? 'Aktiv' : 'Inaktiv'}</span>
          </div>
          <div class="sa-entry-meta">
            <span>${esc(rule.soundAlertName || '-')}</span>
            <span>${esc(rule.file || 'Keine Datei')}</span>
            <span>${esc(categoryLabel(rule.category || ''))}</span>
            <span>Prio ${esc(effectivePriority(rule))}</span>
            <span>${esc(value(rule.volume, defaultVolume()))}%</span>
          </div>
        </div>
        <div class="sa-entry-actions">
          ${btn('Bearbeiten', `edit-rule:${idx}`)}
          ${btn('Löschen', `remove-rule:${idx}`, 'danger')}
        </div>
      </article>
    `;
  }

  function renderCategorySelect(rule){
    const current = rule.category || '';
    return `<select data-sa-rule-field="category">${CATEGORY_OPTIONS.map(opt => `<option value="${esc(opt.value)}" data-priority="${esc(opt.priority ?? '')}" ${opt.value === current ? 'selected' : ''}>${esc(opt.priority === null ? opt.label : `${opt.label} (${opt.priority})`)}</option>`).join('')}</select>`;
  }

  function renderRuleEditor(rule, idx){
    return `
      <div class="sa-editor-head">
        <div>
          <h4>Eintrag bearbeiten</h4>
          <div class="sa-muted">${esc(rule.label || rule.soundAlertName || `SoundAlert ${idx + 1}`)}</div>
        </div>
        <div class="sa-actions sa-editor-actions">
          ${btn('Löschen', `remove-rule:${idx}`, 'danger')}
        </div>
      </div>
      <div class="sa-rule sa-rule-editor" data-sa-rule-index="${idx}">
        <label class="sa-check"><input data-sa-rule-field="enabled" type="checkbox" ${rule.enabled === false ? '' : 'checked'}><span>Aktiv</span></label>
        <label class="sa-field"><span>SoundAlerts-Name</span><input data-sa-rule-field="soundAlertName" type="text" value="${esc(rule.soundAlertName || '')}"></label>
        <label class="sa-field"><span>Label</span><input data-sa-rule-field="label" type="text" value="${esc(rule.label || rule.soundAlertName || '')}"></label>
        <label class="sa-field"><span>Typ</span><select data-sa-rule-field="mediaType"><option value="audio" ${rule.mediaType === 'audio' ? 'selected' : ''}>Audio</option><option value="video" ${rule.mediaType === 'video' ? 'selected' : ''}>Video</option></select></label>
        <label class="sa-field sa-wide"><span>Datei</span><input data-sa-rule-field="file" type="text" value="${esc(rule.file || '')}"></label>
        <label class="sa-field"><span>Kategorie</span>${renderCategorySelect(rule)}</label>
        <label class="sa-field"><span>Priorität</span><input data-sa-rule-field="priority" type="number" min="0" max="200" value="${esc(effectivePriority(rule))}"></label>
        <label class="sa-field"><span>Lautstärke</span><input data-sa-rule-field="volume" type="number" min="0" max="100" value="${esc(value(rule.volume, defaultVolume()))}"></label>
      </div>
      <div class="sa-note">Kategorie setzt eine sinnvolle Standard-Priorität. Die Zahl kann pro Eintrag bewusst überschrieben werden.</div>
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
    const unmatched = ['unmatched', 'no_mapping'].includes(String(ev.status || '').toLowerCase()) || ruleIdx < 0;
    return `
      <div class="sa-event sa-event-card">
        <div class="sa-event-main">
          <strong>${esc(ev.soundalert_name || '-')}</strong>
          <small>${esc(ev.trigger_user_display || '-')} · ${esc(ev.amount ?? 0)} ${esc(ev.currency || '')} · ${esc(ev.created_at || '')}</small>
          <small>${esc(ev.file || ev.error || ev.raw_text || '')}</small>
        </div>
        <div class="sa-event-side">
          <span class="sa-pill ${esc(statusClass(ev.status))}">${esc(statusLabel(ev.status))}</span>
          <div class="sa-actions sa-event-actions">
            ${hasFile ? btn('Erneut abspielen', `replay-event:${idx}`) : ''}
            ${ruleIdx >= 0 ? btn('Eintrag bearbeiten', `edit-rule:${ruleIdx}`) : ''}
            ${unmatched ? btn('Eintrag erstellen', `create-from-event:${idx}`, 'success') : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderStats(){
    const el = document.getElementById('saStatsCard');
    if (!el) return;
    const bySound = stats?.bySound || [];
    const byUser = stats?.byUser || [];
    const byStatus = stats?.byStatus || [];
    el.innerHTML = `
      <h3>Statistik</h3>
      <div class="sa-stat-columns">
        <div><h4>Sounds</h4>${bySound.map(r => `<div class="sa-row"><span>${esc(r.soundAlertName || '-')}</span><strong>${esc(r.count || 0)}</strong></div>`).join('') || '<div class="sa-empty">Keine Daten</div>'}</div>
        <div><h4>User</h4>${byUser.map(r => `<div class="sa-row"><span>${esc(r.user || '-')}</span><strong>${esc(r.count || 0)}</strong></div>`).join('') || '<div class="sa-empty">Keine Daten</div>'}</div>
        <div><h4>Status</h4>${byStatus.map(r => `<div class="sa-row"><span>${esc(statusLabel(r.status || '-'))}</span><strong>${esc(r.count || 0)}</strong></div>`).join('') || '<div class="sa-empty">Keine Daten</div>'}</div>
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
    const mediaType = String(rule.mediaType || 'audio').trim();
    return {
      ...rule,
      id: String(rule.id || soundAlertName || `rule_${idx + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || `rule_${idx + 1}`,
      enabled: rule.enabled === false ? false : true,
      soundAlertName,
      label: String(rule.label || soundAlertName).trim(),
      file: String(rule.file || '').trim(),
      mediaType,
      category: String(rule.category || '').trim(),
      priority: Math.max(0, Math.min(200, Number(value(rule.priority, effectivePriority(rule))))),
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
      category: String(field('category')?.value || '').trim(),
      priority: Math.max(0, Math.min(200, Number(field('priority')?.value || defaultPriority()))),
      volume: Math.max(0, Math.min(100, Number(field('volume')?.value || defaultVolume())))
    }, idx);
    config = { ...(config || {}), rules: list };
  }

  function readRulesFromState(){
    saveActiveRuleFromDom();
    return rules().map(normalizeRule).filter(rule => rule.soundAlertName || rule.file);
  }

  function buildConfigFromDom(){
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
      soundSystem: {
        ...(current.soundSystem || {}),
        defaultCategory: readText('saDefaultCategory') || 'channel_reward',
        defaultPriority: readNumber('saDefaultPriority', 70, 0, 200),
        audioOutputTarget: readText('saAudioTarget') || 'device',
        videoOutputTarget: readText('saVideoTarget') || 'overlay',
        defaultVolume: readNumber('saDefaultVolume', 100, 0, 100)
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
      rules: readRulesFromState()
    };
  }

  async function saveConfig(){
    const next = buildConfigFromDom();
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
      priority: seed?.priority ?? 70,
      volume: seed?.volume ?? defaultVolume()
    }, 0);
    list.unshift(next);
    config = { ...(config || {}), rules: list };
    selectedRuleIndex = 0;
    activeTab = 'rules';
    render();
  }

  function removeRule(idx){
    saveActiveRuleFromDom();
    const list = rules().slice();
    const item = list[idx];
    if (!item) return;
    if (!confirm(`SoundAlert "${item.label || item.soundAlertName || 'Eintrag'}" wirklich löschen?`)) return;
    list.splice(idx, 1);
    config = { ...(config || {}), rules: list };
    if (selectedRuleIndex >= list.length) selectedRuleIndex = Math.max(0, list.length - 1);
    render();
    activeTab = 'rules';
    applyTab();
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
      priority: 70,
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
      const picker = ev.target.closest('[data-sa-rule-picker]');
      if (picker) {
        saveActiveRuleFromDom();
        selectedRuleIndex = Number(picker.value) || 0;
        render();
        return;
      }
      const category = ev.target.closest('[data-sa-rule-field="category"]');
      if (category) {
        const opt = category.selectedOptions?.[0];
        const prio = opt ? Number(opt.dataset.priority) : NaN;
        const box = category.closest('[data-sa-rule-index]');
        const prioInput = box?.querySelector('[data-sa-rule-field="priority"]');
        if (prioInput && Number.isFinite(prio)) prioInput.value = String(prio);
      }
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
        else if (action === 'save-config') await saveConfig();
        else if (action === 'add-rule') addRule();
        else if (action.startsWith('remove-rule:')) removeRule(Number(action.split(':')[1]));
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
