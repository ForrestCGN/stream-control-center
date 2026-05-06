window.SoundAlertsModule = (function(){
  'use strict';

  const API = '/api/soundalerts';
  let root = null;
  let status = null;
  let events = [];
  let stats = null;
  let config = null;
  let activeTab = 'overview';
  let selectedRuleIndex = 0;
  let loading = false;
  let bound = false;

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

  const STATUS_LABELS = {
    queued: 'In Warteschlange',
    played: 'Abgespielt',
    success: 'Erfolgreich',
    unmatched: 'Nicht eingerichtet',
    no_mapping: 'Kein Eintrag',
    file_missing: 'Datei fehlt',
    missing_file: 'Datei fehlt',
    failed: 'Fehler',
    ignored: 'Ignoriert'
  };

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? ''); }
  async function api(path, options){ return window.CGN.api(API + path, options || {}); }
  function btn(label, action, cls){ return `<button type="button" class="${esc(cls || '')}" data-sa-action="${esc(action)}">${esc(label)}</button>`; }
  function statusText(value){ return value ? 'Aktiv' : 'Inaktiv'; }
  function value(v, fallback){ return v === undefined || v === null || v === '' ? fallback : v; }
  function normalizeKey(v){ return String(v || '').trim().toLowerCase(); }
  function statusLabel(v){ return STATUS_LABELS[String(v || '').toLowerCase()] || (v || '-'); }
  function categoryOption(value){ return CATEGORY_OPTIONS.find(o => o.value === value) || CATEGORY_OPTIONS[0]; }
  function categoryDefaultPriority(category){
    const opt = categoryOption(category);
    if (Number.isFinite(opt.priority)) return opt.priority;
    const cfgDefault = Number(config?.soundSystem?.defaultPriority);
    return Number.isFinite(cfgDefault) ? cfgDefault : 70;
  }
  function categoryLabel(category){
    const opt = categoryOption(category);
    return opt.priority === null ? opt.label : `${opt.label} (${opt.priority})`;
  }
  function categorySelect(name, selected){
    return `<select data-sa-rule-field="${esc(name)}">${CATEGORY_OPTIONS.map(opt => `<option value="${esc(opt.value)}" ${selected === opt.value ? 'selected' : ''}>${esc(opt.priority === null ? opt.label : `${opt.label} (${opt.priority})`)}</option>`).join('')}</select>`;
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
      description: 'SoundAlerts-Chatmeldungen erkennen, SoundAlert-Einträge verwalten und ins Sound-System geben.'
    };
    const items = window.CGN.sections?.system?.items;
    if (Array.isArray(items) && !items.includes('soundalerts')) {
      const idx = items.indexOf('sound_system');
      if (idx >= 0) items.splice(idx + 1, 0, 'soundalerts');
      else items.push('soundalerts');
    }
  }

  function ensureRoot(){
    root = document.getElementById('soundalertsModule');
    if (!root) return false;
    root.classList.add('soundalerts-admin');
    return true;
  }

  function renderShell(){
    if (!root) return;
    root.innerHTML = `
      <div class="sa-card sa-hero">
        <div>
          <h2>SoundAlerts</h2>
          <div class="sa-note">SoundAlerts-Chatmeldungen werden erkannt, als Einträge verwaltet und als Audio/Video in die Sound-System-Queue gegeben.</div>
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
    el.innerHTML = `
      <h3>Letztes Event</h3>
      <div class="sa-row"><span>Status</span><strong class="sa-pill ${esc(ev.status || '')}">${esc(statusLabel(ev.status))}</strong></div>
      <div class="sa-row"><span>User</span><strong>${esc(ev.triggerUserDisplay || '-')}</strong></div>
      <div class="sa-row"><span>SoundAlert</span><strong>${esc(ev.soundAlertName || '-')}</strong></div>
      <div class="sa-row"><span>Betrag</span><strong>${esc(ev.amount ?? 0)} ${esc(ev.currency || '')}</strong></div>
      <div class="sa-row"><span>Datei</span><span class="sa-muted">${esc(ev.file || '-')}</span></div>
      <div class="sa-note">${esc(ev.rawText || '')}</div>
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
        <label class="sa-check"><input id="saEnabled" type="checkbox" ${cfg.enabled === false ? '' : 'checked'}><span>Bridge aktiv</span></label>
        <label class="sa-field"><span>Bot-Login</span><input id="saBotLogin" type="text" value="${esc(bot.login || 'soundalerts')}"></label>
        <label class="sa-field"><span>Bot User-ID</span><input id="saBotUserId" type="text" value="${esc(bot.userId || '')}"></label>
        <label class="sa-field"><span>Bot DisplayName</span><input id="saBotDisplayName" type="text" value="${esc(bot.displayName || 'SoundAlerts')}"></label>
        <label class="sa-field"><span>Default-Kategorie</span><input id="saDefaultCategory" type="text" value="${esc(sound.defaultCategory || 'channel_reward')}"></label>
        <label class="sa-field"><span>Default-Priorität</span><input id="saDefaultPriority" type="number" min="0" max="200" value="${esc(value(sound.defaultPriority, 70))}"></label>
        <label class="sa-field"><span>Audio-Ziel</span><select id="saAudioTarget"><option value="device" ${sound.audioOutputTarget === 'device' ? 'selected' : ''}>Audiogerät</option><option value="overlay" ${sound.audioOutputTarget === 'overlay' ? 'selected' : ''}>OBS Overlay</option><option value="both" ${sound.audioOutputTarget === 'both' ? 'selected' : ''}>Beides</option></select></label>
        <label class="sa-field"><span>Video-Ziel</span><select id="saVideoTarget"><option value="overlay" ${sound.videoOutputTarget !== 'device' ? 'selected' : ''}>OBS Overlay</option><option value="device" ${sound.videoOutputTarget === 'device' ? 'selected' : ''}>Audiogerät</option><option value="both" ${sound.videoOutputTarget === 'both' ? 'selected' : ''}>Beides</option></select></label>
        <label class="sa-field"><span>Standard-Lautstärke</span><input id="saDefaultVolume" type="number" min="0" max="100" value="${esc(value(sound.defaultVolume, 100))}"></label>
        <label class="sa-check"><input id="saDedupeEnabled" type="checkbox" ${dedupe.enabled === false ? '' : 'checked'}><span>Dedupe aktiv</span></label>
        <label class="sa-field"><span>Dedupe-Fenster ms</span><input id="saDedupeMs" type="number" min="0" max="600000" value="${esc(value(dedupe.windowMs, 3000))}"></label>
        <label class="sa-check"><input id="saChatMissing" type="checkbox" ${chat.onMissingFile === false ? '' : 'checked'}><span>Chatmeldung bei fehlender Datei</span></label>
        <label class="sa-check"><input id="saChatUnmatched" type="checkbox" ${chat.onUnmatched === true ? 'checked' : ''}><span>Chatmeldung bei unbekanntem Sound</span></label>
        <label class="sa-field"><span>Chat-Cooldown ms</span><input id="saChatCooldown" type="number" min="0" max="600000" value="${esc(value(chat.cooldownMs, 15000))}"></label>
      </div>
      <div class="sa-note">Normale SoundAlerts sollten als Kategorie <code>channel_reward</code> laufen. Videos bleiben fachlich immer Overlay.</div>
    `;
  }

  function syncSelectedRuleFromDom(){
    const rules = Array.isArray(config?.rules) ? config.rules.slice() : [];
    const box = document.querySelector('[data-sa-rule-editor="1"]');
    if (!box || !rules[selectedRuleIndex]) return;
    function field(name){ return box.querySelector(`[data-sa-rule-field="${name}"]`); }
    const soundAlertName = String(field('soundAlertName')?.value || '').trim();
    const category = String(field('category')?.value || '').trim();
    const priorityRaw = String(field('priority')?.value || '').trim();
    const priority = priorityRaw === '' ? categoryDefaultPriority(category) : Math.max(0, Math.min(200, Number(priorityRaw || 70)));
    rules[selectedRuleIndex] = {
      ...(rules[selectedRuleIndex] || {}),
      id: (soundAlertName || `rule_${selectedRuleIndex + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || `rule_${selectedRuleIndex + 1}`,
      enabled: !!field('enabled')?.checked,
      soundAlertName,
      label: String(field('label')?.value || soundAlertName).trim(),
      file: String(field('file')?.value || '').trim(),
      mediaType: String(field('mediaType')?.value || 'audio').trim(),
      category,
      priority,
      volume: Math.max(0, Math.min(100, Number(field('volume')?.value || 100)))
    };
    config = { ...(config || {}), rules };
  }

  function getRules(){ return Array.isArray(config?.rules) ? config.rules : []; }

  function findRuleIndexForEvent(ev){
    const key = normalizeKey(ev.soundalert_name || ev.soundAlertName || ev.soundAlert || '');
    if (!key) return -1;
    return getRules().findIndex(rule => normalizeKey(rule.soundAlertName) === key || normalizeKey(rule.label) === key);
  }

  function renderRules(){
    const el = document.getElementById('saRulesCard');
    if (!el) return;
    const rules = getRules();
    if (!rules.length) selectedRuleIndex = 0;
    else selectedRuleIndex = Math.max(0, Math.min(selectedRuleIndex, rules.length - 1));
    const selected = rules[selectedRuleIndex];
    el.innerHTML = `
      <div class="sa-section-head">
        <div>
          <h3>SoundAlert-Einträge</h3>
          <div class="sa-muted">Einträge sind die Zuordnung von SoundAlerts-Namen zu Dateien, Kategorie, Priorität und Lautstärke.</div>
        </div>
        <div class="sa-actions sa-section-actions">
          ${btn('Neuer SoundAlert', 'add-rule')}
          ${btn('Einträge speichern', 'save-config', 'success')}
        </div>
      </div>
      <div class="sa-picker-row">
        <label class="sa-field sa-picker-field"><span>SoundAlert auswählen</span><select id="saRulePicker" data-sa-action="select-rule-picker">
          ${rules.map((rule, idx) => `<option value="${idx}" ${idx === selectedRuleIndex ? 'selected' : ''}>${esc(rule.label || rule.soundAlertName || `Eintrag ${idx + 1}`)}</option>`).join('') || '<option value="0">Noch kein Eintrag</option>'}
        </select></label>
        <div class="sa-muted">Normale SoundAlerts: <code>channel_reward</code> / Standard-Prio 70. Priorität kann pro Eintrag überschrieben werden.</div>
      </div>
      <div class="sa-entry-layout">
        <div class="sa-entry-list">
          ${rules.map((rule, idx) => renderRuleCard(rule, idx)).join('') || '<div class="sa-empty">Noch keine SoundAlert-Einträge.</div>'}
        </div>
        <div class="sa-entry-editor">
          ${selected ? renderRuleEditor(selected, selectedRuleIndex) : '<div class="sa-empty">Wähle einen Eintrag oder lege einen neuen SoundAlert an.</div>'}
        </div>
      </div>
      <div class="sa-note">Dateien sind relativ zu <code>htdocs/assets/sounds</code>, z. B. <code>soundalerts/video/name.mp4</code>.</div>
    `;
  }

  function renderRuleCard(rule, idx){
    const type = rule.mediaType === 'video' ? 'Video' : 'Audio';
    const category = rule.category || config?.soundSystem?.defaultCategory || 'channel_reward';
    const prio = value(rule.priority, categoryDefaultPriority(category));
    return `
      <div class="sa-entry-card ${idx === selectedRuleIndex ? 'active' : ''}" data-sa-rule-card="${idx}">
        <div class="sa-entry-main">
          <div class="sa-entry-title">
            <strong>${esc(rule.label || rule.soundAlertName || `Eintrag ${idx + 1}`)}</strong>
            <span class="sa-pill">${esc(type)}</span>
            <span class="sa-pill ${rule.enabled === false ? 'failed' : 'queued'}">${esc(rule.enabled === false ? 'Inaktiv' : 'Aktiv')}</span>
          </div>
          <div class="sa-entry-meta">
            <span>${esc(rule.soundAlertName || '-')}</span>
            <span>${esc(rule.file || 'keine Datei')}</span>
            <span>${esc(categoryLabel(category))}</span>
            <span>Prio: ${esc(prio)}</span>
            <span>Lautstärke: ${esc(value(rule.volume, 100))}%</span>
          </div>
        </div>
        <div class="sa-entry-actions">
          ${btn('Bearbeiten', `select-rule:${idx}`)}
          ${btn('Löschen', `remove-rule:${idx}`, 'danger')}
        </div>
      </div>
    `;
  }

  function renderRuleEditor(rule, idx){
    const category = rule.category || config?.soundSystem?.defaultCategory || 'channel_reward';
    return `
      <div class="sa-editor-head">
        <div>
          <h4>Eintrag bearbeiten</h4>
          <div class="sa-muted">${esc(rule.label || rule.soundAlertName || `Eintrag ${idx + 1}`)}</div>
        </div>
        <div class="sa-actions sa-editor-actions">${btn('Löschen', `remove-rule:${idx}`, 'danger')}</div>
      </div>
      <div class="sa-form-grid sa-rule-editor" data-sa-rule-editor="1" data-sa-rule-index="${idx}">
        <label class="sa-check"><input data-sa-rule-field="enabled" type="checkbox" ${rule.enabled === false ? '' : 'checked'}><span>Aktiv</span></label>
        <label class="sa-field"><span>SoundAlerts-Name</span><input data-sa-rule-field="soundAlertName" type="text" value="${esc(rule.soundAlertName || '')}"></label>
        <label class="sa-field"><span>Label</span><input data-sa-rule-field="label" type="text" value="${esc(rule.label || rule.soundAlertName || '')}"></label>
        <label class="sa-field sa-wide"><span>Datei</span><input data-sa-rule-field="file" type="text" value="${esc(rule.file || '')}"></label>
        <label class="sa-field"><span>Typ</span><select data-sa-rule-field="mediaType"><option value="audio" ${rule.mediaType !== 'video' ? 'selected' : ''}>Audio</option><option value="video" ${rule.mediaType === 'video' ? 'selected' : ''}>Video</option></select></label>
        <label class="sa-field"><span>Kategorie</span>${categorySelect('category', category)}</label>
        <label class="sa-field"><span>Priorität</span><input data-sa-rule-field="priority" type="number" min="0" max="200" value="${esc(value(rule.priority, categoryDefaultPriority(category)))}"></label>
        <label class="sa-field"><span>Lautstärke</span><input data-sa-rule-field="volume" type="number" min="0" max="100" value="${esc(value(rule.volume, 100))}"></label>
      </div>
      <div class="sa-note">Kategorie setzt die sinnvolle Standard-Priorität. Die Zahl kann pro Eintrag bewusst überschrieben werden.</div>
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
    const status = String(ev.status || '').toLowerCase();
    const ruleIdx = findRuleIndexForEvent(ev);
    const canReplay = !!(ev.raw_text || ev.rawText || ev.soundalert_name || ev.soundAlertName);
    const isUnknown = status === 'unmatched' || status === 'no_mapping';
    const isFileMissing = status === 'file_missing' || status === 'missing_file';
    const actions = [];
    if (canReplay && !isUnknown && !isFileMissing) actions.push(btn('Erneut abspielen', `replay-event:${idx}`, 'success'));
    if (ruleIdx >= 0) actions.push(btn('Eintrag bearbeiten', `select-rule:${ruleIdx}`));
    if (isUnknown || isFileMissing || ruleIdx < 0) actions.push(btn('Eintrag erstellen', `create-rule-from-event:${idx}`));
    return `
      <div class="sa-event sa-event-${esc(status || 'unknown')}">
        <div class="sa-event-main">
          <strong>${esc(ev.soundalert_name || ev.soundAlertName || '-')}</strong>
          <small>${esc(ev.trigger_user_display || ev.triggerUserDisplay || '-')} · ${esc(ev.amount ?? 0)} ${esc(ev.currency || '')} · ${esc(ev.created_at || ev.createdAt || '')}</small>
          <small>${esc(ev.file || ev.error || ev.raw_text || ev.rawText || '')}</small>
          ${isUnknown ? '<small class="sa-event-hint">Kein SoundAlert-Eintrag vorhanden. Erstelle daraus einen Eintrag und weise danach eine Datei zu.</small>' : ''}
          ${isFileMissing ? '<small class="sa-event-hint">Eintrag gefunden, aber Datei fehlt. Datei hochladen oder Pfad korrigieren.</small>' : ''}
        </div>
        <div class="sa-event-side">
          <span class="sa-pill ${esc(status || '')}">${esc(statusLabel(status))}</span>
          <div class="sa-event-actions">${actions.join('')}</div>
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
        <div><h4>Status</h4>${byStatus.map(r => `<div class="sa-row"><span>${esc(statusLabel(r.status))}</span><strong>${esc(r.count || 0)}</strong></div>`).join('') || '<div class="sa-empty">Keine Daten</div>'}</div>
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

  function readRulesFromState(){
    syncSelectedRuleFromDom();
    return getRules().filter(rule => rule.soundAlertName || rule.file);
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

  function addRule(seed){
    syncSelectedRuleFromDom();
    const rules = Array.isArray(config?.rules) ? config.rules.slice() : [];
    const category = seed?.category || config?.soundSystem?.defaultCategory || 'channel_reward';
    rules.unshift({
      enabled: seed?.enabled ?? true,
      soundAlertName: seed?.soundAlertName || '',
      label: seed?.label || seed?.soundAlertName || '',
      file: seed?.file || '',
      mediaType: seed?.mediaType || 'audio',
      category,
      priority: seed?.priority ?? categoryDefaultPriority(category),
      volume: seed?.volume ?? (config?.soundSystem?.defaultVolume ?? 100)
    });
    config = { ...(config || {}), rules };
    selectedRuleIndex = 0;
    activeTab = 'rules';
    render();
  }

  function removeRule(idx){
    const rules = Array.isArray(config?.rules) ? config.rules.slice() : [];
    const rule = rules[idx];
    if (!rule) return;
    const label = rule.label || rule.soundAlertName || `Eintrag ${idx + 1}`;
    if (!confirm(`SoundAlert-Eintrag wirklich löschen?\n\n${label}`)) return;
    rules.splice(idx, 1);
    config = { ...(config || {}), rules };
    selectedRuleIndex = Math.max(0, Math.min(selectedRuleIndex, rules.length - 1));
    activeTab = 'rules';
    render();
  }

  function selectRule(idx){
    syncSelectedRuleFromDom();
    const rules = getRules();
    selectedRuleIndex = Math.max(0, Math.min(Number(idx) || 0, Math.max(0, rules.length - 1)));
    activeTab = 'rules';
    render();
  }

  function createRuleFromEvent(idx){
    const ev = events[Number(idx)];
    if (!ev) return;
    const name = String(ev.soundalert_name || ev.soundAlertName || '').trim();
    const file = String(ev.file || '').trim();
    const category = 'channel_reward';
    addRule({
      enabled: false,
      soundAlertName: name,
      label: name,
      file: file && !String(ev.status || '').includes('missing') ? file : '',
      mediaType: file.toLowerCase().endsWith('.mp4') || file.toLowerCase().endsWith('.webm') ? 'video' : 'audio',
      category,
      priority: categoryDefaultPriority(category),
      volume: config?.soundSystem?.defaultVolume ?? 100
    });
  }

  function eventReplayText(ev){
    const raw = ev.raw_text || ev.rawText;
    if (raw) return raw;
    const user = ev.trigger_user_display || ev.triggerUserDisplay || config?.bot?.displayName || 'SoundAlerts';
    const sound = ev.soundalert_name || ev.soundAlertName || '';
    const amount = ev.amount ?? 0;
    const currency = ev.currency || 'Bits';
    return `${user} spielt ${sound} für ${amount} ${currency}!`;
  }

  async function replayEvent(idx){
    const ev = events[Number(idx)];
    if (!ev) return;
    await runTest(eventReplayText(ev));
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
      if (ev.target?.id === 'saRulePicker') selectRule(Number(ev.target.value));
      if (ev.target?.matches('[data-sa-rule-field="category"]')) {
        const box = ev.target.closest('[data-sa-rule-editor="1"]');
        const prio = box?.querySelector('[data-sa-rule-field="priority"]');
        if (prio) prio.value = String(categoryDefaultPriority(String(ev.target.value || '')));
      }
    });
    document.addEventListener('click', async ev => {
      const card = ev.target.closest('[data-sa-rule-card]');
      if (card && !ev.target.closest('button')) {
        selectRule(Number(card.dataset.saRuleCard));
        return;
      }
      const tab = ev.target.closest('[data-sa-tab]');
      if (tab) {
        syncSelectedRuleFromDom();
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
        else if (action.startsWith('select-rule:')) selectRule(Number(action.split(':')[1]));
        else if (action.startsWith('remove-rule:')) removeRule(Number(action.split(':')[1]));
        else if (action.startsWith('create-rule-from-event:')) createRuleFromEvent(Number(action.split(':')[1]));
        else if (action.startsWith('replay-event:')) await replayEvent(Number(action.split(':')[1]));
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
