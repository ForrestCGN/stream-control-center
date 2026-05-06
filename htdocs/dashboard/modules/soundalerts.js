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
      description: 'SoundAlerts-Chatmeldungen erkennen, SoundAlert-Einträge verwalten und ins Sound-System geben.'
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

  function renderShell(){
    if (!root) return;
    root.innerHTML = `
      <div class="sa-card sa-hero">
        <div>
          <h2>SoundAlerts</h2>
          <div class="sa-note">SoundAlerts-Chatmeldungen werden erkannt, als SoundAlert-Einträge verwaltet und als Audio/Video in die Sound-System-Queue gegeben.</div>
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
      <div class="sa-row"><span>Unbekannt</span><strong>${esc(db.stats?.unmatched ?? 0)}</strong></div>
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
      <div class="sa-row"><span>Status</span><strong class="sa-pill ${esc(ev.status || '')}">${esc(ev.status || '-')}</strong></div>
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
        <label class="sa-field"><span>Default-Kategorie</span><input id="saDefaultCategory" type="text" value="${esc(sound.defaultCategory || 'soundalerts')}"></label>
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
      <div class="sa-note">Unbekannte SoundAlerts werden standardmäßig nur geloggt. Chatmeldungen gibt es sinnvollerweise nur bei bekannten Mappings mit fehlender Datei.</div>
    `;
  }

  function selectedRule(){
    const rules = Array.isArray(config?.rules) ? config.rules : [];
    if (!rules.length) return null;
    selectedRuleIndex = Math.max(0, Math.min(selectedRuleIndex, rules.length - 1));
    return rules[selectedRuleIndex] || null;
  }

  function ruleTitle(rule, idx){
    return rule?.label || rule?.soundAlertName || rule?.id || `SoundAlert ${idx + 1}`;
  }

  function mediaLabel(type){
    return type === 'video' ? 'Video' : 'Audio';
  }

  function renderRules(){
    const el = document.getElementById('saRulesCard');
    if (!el) return;
    const rules = Array.isArray(config?.rules) ? config.rules : [];
    if (selectedRuleIndex >= rules.length) selectedRuleIndex = Math.max(0, rules.length - 1);

    el.innerHTML = `
      <div class="sa-section-head">
        <div>
          <h3>SoundAlert-Einträge</h3>
          <div class="sa-note">Einträge ordnen einen SoundAlerts-Namen einer Datei und Queue-Einstellung zu. Videos laufen weiterhin immer über das Overlay.</div>
        </div>
        <div class="sa-actions sa-section-actions">
          ${btn('Neuer SoundAlert', 'add-rule')}
          ${btn('Einträge speichern', 'save-config', 'success')}
        </div>
      </div>

      ${rules.length ? `
        <div class="sa-picker-row">
          <label class="sa-field sa-picker-field">
            <span>SoundAlert auswählen</span>
            <select id="saRuleSelect">
              ${rules.map((rule, idx) => `<option value="${idx}" ${idx === selectedRuleIndex ? 'selected' : ''}>${esc(ruleTitle(rule, idx))}</option>`).join('')}
            </select>
          </label>
          <div class="sa-muted">Wähle einen Eintrag aus der Liste oder über die Karten unten.</div>
        </div>

        <div class="sa-entry-layout">
          <div class="sa-entry-list">
            ${rules.map((rule, idx) => renderRuleCard(rule, idx)).join('')}
          </div>
          <div class="sa-entry-editor">
            ${renderRuleEditor(rules[selectedRuleIndex], selectedRuleIndex)}
          </div>
        </div>
      ` : `
        <div class="sa-empty">Noch keine SoundAlert-Einträge vorhanden.</div>
      `}

      <div class="sa-note">Dateien sind relativ zu <code>htdocs/assets/sounds</code>, z. B. <code>soundalerts/video/name.mp4</code>.</div>
    `;
  }

  function renderRuleCard(rule, idx){
    const active = idx === selectedRuleIndex ? ' active' : '';
    const file = rule.file || '-';
    return `
      <div class="sa-entry-card${active}" data-sa-action="select-rule:${idx}">
        <div class="sa-entry-main">
          <div class="sa-entry-title">
            <strong>${esc(ruleTitle(rule, idx))}</strong>
            <span class="sa-pill">${esc(mediaLabel(rule.mediaType))}</span>
            <span class="sa-pill ${rule.enabled === false ? 'failed' : 'queued'}">${rule.enabled === false ? 'Inaktiv' : 'Aktiv'}</span>
          </div>
          <div class="sa-entry-meta">
            <span>${esc(rule.soundAlertName || 'kein SoundAlerts-Name')}</span>
            <span>${esc(file)}</span>
          </div>
          <div class="sa-entry-meta">
            <span>Priorität: ${esc(value(rule.priority, config?.soundSystem?.defaultPriority ?? 70))}</span>
            <span>Lautstärke: ${esc(value(rule.volume, config?.soundSystem?.defaultVolume ?? 100))}%</span>
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
    if (!rule) return '<div class="sa-empty">Kein Eintrag ausgewählt.</div>';
    const defaultPrio = config?.soundSystem?.defaultPriority ?? 70;
    const defaultVolume = config?.soundSystem?.defaultVolume ?? 100;
    return `
      <div class="sa-editor-head">
        <div>
          <h4>Eintrag bearbeiten</h4>
          <div class="sa-muted">${esc(ruleTitle(rule, idx))}</div>
        </div>
        <div class="sa-actions sa-editor-actions">
          ${btn('Löschen', `remove-rule:${idx}`, 'danger')}
        </div>
      </div>
      <div class="sa-rule sa-rule-editor" data-sa-rule-index="${idx}">
        <label class="sa-check"><input data-sa-rule-field="enabled" type="checkbox" ${rule.enabled === false ? '' : 'checked'}><span>Aktiv</span></label>
        <label class="sa-field"><span>SoundAlerts-Name</span><input data-sa-rule-field="soundAlertName" type="text" value="${esc(rule.soundAlertName || '')}"></label>
        <label class="sa-field"><span>Label</span><input data-sa-rule-field="label" type="text" value="${esc(rule.label || rule.soundAlertName || '')}"></label>
        <label class="sa-field sa-wide"><span>Datei</span><input data-sa-rule-field="file" type="text" value="${esc(rule.file || '')}"></label>
        <label class="sa-field"><span>Typ</span><select data-sa-rule-field="mediaType"><option value="audio" ${rule.mediaType === 'audio' ? 'selected' : ''}>Audio</option><option value="video" ${rule.mediaType === 'video' ? 'selected' : ''}>Video</option></select></label>
        <label class="sa-field"><span>Priorität</span><input data-sa-rule-field="priority" type="number" min="0" max="200" value="${esc(value(rule.priority, defaultPrio))}"></label>
        <label class="sa-field"><span>Lautstärke</span><input data-sa-rule-field="volume" type="number" min="0" max="100" value="${esc(value(rule.volume, defaultVolume))}"></label>
      </div>
    `;
  }

  function renderEvents(){
    const el = document.getElementById('saEventsCard');
    if (!el) return;
    el.innerHTML = `
      <h3>Letzte Events</h3>
      <div class="sa-event-list">
        ${(events || []).map(renderEvent).join('') || '<div class="sa-empty">Noch keine Events.</div>'}
      </div>
    `;
  }

  function renderEvent(ev){
    return `
      <div class="sa-event">
        <div class="sa-event-main">
          <strong>${esc(ev.soundalert_name || '-')}</strong>
          <small>${esc(ev.trigger_user_display || '-')} · ${esc(ev.amount ?? 0)} ${esc(ev.currency || '')} · ${esc(ev.created_at || '')}</small>
          <small>${esc(ev.file || ev.error || ev.raw_text || '')}</small>
        </div>
        <span class="sa-pill ${esc(ev.status || '')}">${esc(ev.status || '-')}</span>
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
        <div><h4>Status</h4>${byStatus.map(r => `<div class="sa-row"><span>${esc(r.status || '-')}</span><strong>${esc(r.count || 0)}</strong></div>`).join('') || '<div class="sa-empty">Keine Daten</div>'}</div>
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

  function normalizeRuleId(soundAlertName, idx){
    return (soundAlertName || `rule_${idx + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || `rule_${idx + 1}`;
  }

  function readRuleFromBox(box, idx, original){
    function field(name){ return box.querySelector(`[data-sa-rule-field="${name}"]`); }
    const soundAlertName = String(field('soundAlertName')?.value || '').trim();
    const mediaType = String(field('mediaType')?.value || original?.mediaType || 'audio').trim();
    return {
      ...(original || {}),
      id: original?.id || normalizeRuleId(soundAlertName, idx),
      enabled: !!field('enabled')?.checked,
      soundAlertName,
      label: String(field('label')?.value || soundAlertName).trim(),
      file: String(field('file')?.value || '').trim(),
      mediaType,
      priority: Math.max(0, Math.min(200, Number(field('priority')?.value || config?.soundSystem?.defaultPriority || 70))),
      volume: Math.max(0, Math.min(100, Number(field('volume')?.value || config?.soundSystem?.defaultVolume || 100)))
    };
  }

  function updateSelectedRuleFromDom(){
    const box = document.querySelector('[data-sa-rule-index]');
    if (!box || !Array.isArray(config?.rules)) return;
    const idx = Number(box.dataset.saRuleIndex);
    if (!Number.isInteger(idx) || idx < 0 || idx >= config.rules.length) return;
    const rules = config.rules.slice();
    const next = readRuleFromBox(box, idx, rules[idx]);
    rules[idx] = next;
    config = { ...(config || {}), rules };
  }

  function readRulesFromDom(){
    updateSelectedRuleFromDom();
    return (Array.isArray(config?.rules) ? config.rules : [])
      .map((rule, idx) => ({
        ...rule,
        id: rule.id || normalizeRuleId(rule.soundAlertName, idx),
        priority: Math.max(0, Math.min(200, Number(rule.priority ?? config?.soundSystem?.defaultPriority ?? 70))),
        volume: Math.max(0, Math.min(100, Number(rule.volume ?? config?.soundSystem?.defaultVolume ?? 100)))
      }))
      .filter(rule => rule.soundAlertName || rule.file);
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
        defaultCategory: readText('saDefaultCategory') || 'soundalerts',
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
      rules: readRulesFromDom()
    };
  }

  async function saveConfig(){
    const next = buildConfigFromDom();
    const saved = await api('/config', { method: 'POST', body: JSON.stringify({ config: next }) });
    config = saved.config || next;
    await api('/reload', { method: 'POST', body: '{}' }).catch(() => null);
    await loadAll(true);
  }

  function addRule(){
    updateSelectedRuleFromDom();
    const rules = Array.isArray(config?.rules) ? config.rules.slice() : [];
    rules.unshift({ enabled: true, soundAlertName: '', label: '', file: 'soundalerts/audio/', mediaType: 'audio', priority: config?.soundSystem?.defaultPriority ?? 70, volume: config?.soundSystem?.defaultVolume ?? 100 });
    selectedRuleIndex = 0;
    config = { ...(config || {}), rules };
    activeTab = 'rules';
    render();
    applyTab();
  }

  function selectRule(idx){
    updateSelectedRuleFromDom();
    const rules = Array.isArray(config?.rules) ? config.rules : [];
    if (!rules.length) return;
    selectedRuleIndex = Math.max(0, Math.min(Number(idx) || 0, rules.length - 1));
    activeTab = 'rules';
    render();
    applyTab();
  }

  function removeRule(idx){
    updateSelectedRuleFromDom();
    const rules = Array.isArray(config?.rules) ? config.rules.slice() : [];
    const rule = rules[idx];
    const title = ruleTitle(rule, idx);
    if (!window.confirm(`SoundAlert-Eintrag wirklich löschen?\n\n${title}`)) return;
    rules.splice(idx, 1);
    selectedRuleIndex = Math.max(0, Math.min(selectedRuleIndex, rules.length - 1));
    config = { ...(config || {}), rules };
    activeTab = 'rules';
    render();
    applyTab();
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
      const select = ev.target.closest('#saRuleSelect');
      if (!select) return;
      selectRule(Number(select.value));
    });

    document.addEventListener('click', async ev => {
      const tab = ev.target.closest('[data-sa-tab]');
      if (tab) {
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
