window.CommandsModule = (function(){
  'use strict';

  const UI_VERSION = '0.1.9';
  const UI_BUILD = 'preserve-modal-draft-state';

  const api = {
    status: '/api/commands/status',
    list: '/api/commands/list',
    upsert: '/api/commands/upsert',
    delete: '/api/commands/delete',
    test: '/api/commands/test',
    execute: '/api/commands/execute',
    logs: '/api/commands/logs',
    catalog: '/api/commands/catalog',
    presenceStatus: '/api/twitch/presence/status',
    presenceStart: '/api/twitch/presence/start',
    presenceStop: '/api/twitch/presence/stop'
  };

  const FRIENDLY_ACTIONS = [
    { id: 'sound_play', label: 'Song abspielen', icon: '🔊', help: 'Wählt einen Song/Sound aus der Medienverwaltung und führt ihn über /api/sound/play aus.' },
    { id: 'video_play', label: 'Video abspielen', icon: '🎬', help: 'Wählt ein Video aus der Medienverwaltung und zeigt es über das Sound-/Overlay-System an.' },
    { id: 'chat_message', label: 'Text anzeigen', icon: '💬', help: 'Der Command soll einen Chattext ausgeben. Später auch über zentrale Textgruppen mit mehreren Varianten.' },
    { id: 'module_command', label: 'Modul-Befehl ausführen', icon: '🧩', help: 'Wählt eine vorhandene Backend-Modulaktion aus dem Katalog, z. B. Deathcounter, Hug oder Tagebuch.' },
    { id: 'custom_action', label: 'Benutzerdefinierte Aktion', icon: '⚙️', help: 'Trage eine eigene Modul-/Route-Aktion ein. Technische Werte liegen unter Erweitert.' },
    { id: 'text_plus_action', label: 'Text + Aktion ausführen', icon: '💬🧩', help: 'Optionalen Chattext ausgeben und danach die gespeicherte Aktion ausführen. Vorbereitung für zentrale Textverwaltung.' },
    { id: 'advanced', label: 'Erweitert / technische Aktion', icon: '⚙️', help: 'Zeigt technische Felder wie Modul, Route, Methode und JSON an.' }
  ];
  const DEFAULT_COMMAND = {
    id: 0,
    trigger: '',
    aliases: [],
    moduleKey: '',
    actionKey: '',
    targetMethod: 'POST',
    targetUrl: '',
    enabled: true,
    permissionLevel: 'everyone',
    cooldownGlobalMs: 1000,
    cooldownUserMs: 3000,
    liveOnly: false,
    responseMode: 'module',
    config: { actionType: 'sound_play' }
  };

  const state = {
    tab: 'manage',
    loading: false,
    error: '',
    notice: '',
    status: null,
    list: null,
    logs: null,
    catalog: null,
    presence: null,
    query: '',
    categoryFilter: 'all',
    selectedTrigger: '',
    selectedCommandId: 0,
    modal: null,
    confirmDelete: null,
    testMessage: '!test',
    testUser: 'forrestcgn',
    testRole: 'owner',
    testResult: null
  };

  let root = null;

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function clone(value) { return JSON.parse(JSON.stringify(value || {})); }
  function cleanTrigger(value) { return String(value || '').trim().replace(/^[!./]+/, '').toLowerCase(); }
  function commands() { return Array.isArray(state.list?.commands) ? state.list.commands : []; }
  function logs() { return Array.isArray(state.logs?.logs) ? state.logs.logs : []; }
  function catalogCategories() { return Array.isArray(state.catalog?.categories) ? state.catalog.categories : []; }
  function catalogActions() { return Array.isArray(state.catalog?.actions) ? state.catalog.actions : []; }
  function byId(id) { return document.getElementById(id); }
  function field(id) { return root?.querySelector(`[data-cmd-modal-field="${id}"]`); }

  function actionType(cmd) {
    const raw = String(cmd?.config?.actionType || '').trim();
    if (['sound_play','video_play','chat_message','module_command'].includes(raw)) return raw;
    if (cmd?.targetUrl || cmd?.moduleKey) return 'module_command';
    return 'module_command';
  }

  function hasTextOutput(cmd) {
    const output = cmd?.config?.textOutput || {};
    return output.enabled === true || String(output.mode || 'none') !== 'none' || !!output.text || !!output.textKey;
  }

  function friendlyActionId(cmd) {
    const type = actionType(cmd);
    if (type === 'sound_play') return 'sound_play';
    if (type === 'video_play') return 'video_play';
    if (type === 'chat_message') return 'chat_message';
    // Chat-Ausgabe ist ab v0.1.8 ein eigener optionaler Abschnitt und keine Aktionsart mehr.
    if (type === 'module_command' && !matchedCatalogAction(cmd)) return 'custom_action';
    return 'module_command';
  }

  function friendlyAction(cmd) {
    return FRIENDLY_ACTIONS.find(a => a.id === friendlyActionId(cmd)) || FRIENDLY_ACTIONS[0];
  }

  function storedActionLabel(cmd) {
    const id = friendlyActionId(cmd);
    if (id === 'sound_play') return 'Song abspielen';
    if (id === 'video_play') return 'Video abspielen';
    if (id === 'chat_message') return 'Text anzeigen';
    if (id === 'text_plus_action') return 'Text + Aktion ausführen';
    if (id === 'module_command') {
      const matched = matchedCatalogAction(cmd);
      if (matched) return `Modul-Befehl: ${matched.label || matched.id}`;
      const bits = [cmd?.moduleKey, cmd?.actionKey, cmd?.targetUrl].filter(Boolean).join(' · ');
      return bits ? `Modul-Befehl: ${bits}` : 'Modul-Befehl ausführen';
    }
    const bits = [cmd?.moduleKey, cmd?.actionKey, cmd?.targetUrl].filter(Boolean).join(' · ');
    return bits ? `Benutzerdefiniert: ${bits}` : 'Benutzerdefinierte Aktion';
  }

  function renderFriendlyActionOptions(cmd) {
    const current = friendlyActionId(cmd);
    const isEdit = state.modal?.mode === 'edit';
    const used = new Set();
    const rows = [];
    if (isEdit) {
      used.add(current);
      rows.push(`<option value="${esc(current)}" selected>✓ Gespeichert: ${esc(storedActionLabel(cmd))}</option>`);
    }
    for (const action of FRIENDLY_ACTIONS) {
      if (action.id === 'text_plus_action') continue;
      if (used.has(action.id)) continue;
      rows.push(`<option value="${esc(action.id)}">${esc(action.icon)} ${esc(action.label)}</option>`);
    }
    return rows.join('');
  }

  function commandCategory(cmd) {
    const actionId = String(cmd?.config?.catalogActionId || '').trim();
    if (actionId) {
      const found = catalogActions().find(a => a.id === actionId);
      if (found?.categoryId) return found.categoryId;
      for (const cat of catalogCategories()) {
        if (Array.isArray(cat.actions) && cat.actions.some(a => a.id === actionId)) return cat.id;
      }
    }
    const type = actionType(cmd);
    if (type === 'sound_play' || type === 'video_play') return 'media';
    if (cmd?.moduleKey) return String(cmd.moduleKey).toLowerCase();
    return 'general';
  }

  function categoryLabel(categoryId) {
    if (categoryId === 'media') return 'Medien';
    if (categoryId === 'general') return 'Allgemein';
    const found = catalogCategories().find(c => c.id === categoryId);
    return found?.label || categoryId || 'Allgemein';
  }

  function allCategories() {
    const map = new Map();
    for (const cat of catalogCategories()) map.set(cat.id, cat.label || cat.id);
    map.set('media', 'Medien');
    map.set('general', 'Allgemein');
    for (const cmd of commands()) {
      const id = commandCategory(cmd);
      if (!map.has(id)) map.set(id, categoryLabel(id));
    }
    return Array.from(map.entries()).map(([id,label]) => ({ id, label })).sort((a,b) => String(a.label).localeCompare(String(b.label), 'de'));
  }

  function filteredCommands() {
    const q = String(state.query || '').trim().toLowerCase();
    return commands().filter(cmd => {
      const cat = commandCategory(cmd);
      if (state.categoryFilter !== 'all' && cat !== state.categoryFilter) return false;
      if (!q) return true;
      const hay = [cmd.trigger, (cmd.aliases || []).join(' '), cmd.moduleKey, cmd.actionKey, cmd.targetUrl, cmd.permissionLevel, friendlyAction(cmd)?.label, categoryLabel(cat)].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }

  function groupCommands(list) {
    const groups = new Map();
    for (const cmd of list) {
      const cat = commandCategory(cmd);
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(cmd);
    }
    return Array.from(groups.entries()).map(([id, items]) => ({ id, label: categoryLabel(id), items: items.sort((a,b) => String(a.trigger).localeCompare(String(b.trigger), 'de')) })).sort((a,b) => a.label.localeCompare(b.label, 'de'));
  }

  function selectedCommand() {
    if (state.selectedCommandId) {
      const found = commands().find(c => Number(c.id || 0) === Number(state.selectedCommandId));
      if (found) return found;
    }
    if (state.selectedTrigger) {
      const found = commands().find(c => c.trigger === state.selectedTrigger);
      if (found) return found;
    }
    return filteredCommands()[0] || commands()[0] || null;
  }

  function pill(label, mode) { return `<span class="cmd-pill ${esc(mode || '')}">${esc(label)}</span>`; }
  function help(text) { return `<span class="cmd-help-dot" title="${esc(text)}">?</span>`; }
  function rowLabel(label, helpText) { return `${esc(label)} ${helpText ? help(helpText) : ''}`; }

  async function loadAll(force) {
    root = document.getElementById('commandsModule');
    if (!root || !window.CGN) return;
    if (!force && state.status && state.list && state.catalog) { render(); return; }
    state.loading = true;
    state.error = '';
    render();
    try {
      const [status, list, logsRes, catalog, presence] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.list),
        window.CGN.api(`${api.logs}?limit=15`).catch(err => ({ ok:false, logs:[], error: err.message })),
        window.CGN.api(api.catalog).catch(err => ({ ok:false, categories:[], actions:[], error: err.message })),
        window.CGN.api(api.presenceStatus).catch(err => ({ ok:false, error: err.message }))
      ]);
      state.status = status;
      state.list = list;
      state.logs = logsRes;
      state.catalog = catalog;
      state.presence = presence;
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.loading = false;
      render();
    }
  }

  function openCreateModal() {
    state.modal = {
      mode: 'create',
      title: 'Neuen Command erstellen',
      originalId: 0,
      originalTrigger: '',
      data: clone(DEFAULT_COMMAND)
    };
    render();
  }

  function openEditModal(cmd) {
    if (!cmd) return;
    state.modal = {
      mode: 'edit',
      title: `Command !${cmd.trigger} bearbeiten`,
      originalId: Number(cmd.id || 0),
      originalTrigger: cmd.trigger,
      data: clone(cmd)
    };
    render();
  }

  function openDeleteConfirm(cmd) {
    if (!cmd) return;
    state.confirmDelete = { id: Number(cmd.id || 0), trigger: cmd.trigger, label: `!${cmd.trigger}` };
    render();
  }

  function closeModal() { state.modal = null; state.confirmDelete = null; render(); }

  function syncModalDraftFromDom() {
    if (!state.modal || !state.modal.data || !root) return false;
    const data = state.modal.data;
    const read = name => root.querySelector(`[data-cmd-modal-field="${name}"]`);
    const readValue = (name, fallback = '') => {
      const el = read(name);
      return el ? String(el.value ?? '') : fallback;
    };
    const readChecked = (name, fallback = false) => {
      const el = read(name);
      return el ? el.checked !== false : fallback;
    };
    try {
      const triggerField = read('trigger');
      if (triggerField) data.trigger = cleanTrigger(triggerField.value || '');
      const aliasesField = read('aliases');
      if (aliasesField) data.aliases = String(aliasesField.value || '').split(/[\s,;]+/).map(cleanTrigger).filter(Boolean);
      const permissionField = read('permissionLevel');
      if (permissionField) data.permissionLevel = String(permissionField.value || 'everyone').trim() || 'everyone';
      const globalField = read('cooldownGlobalMs');
      if (globalField) data.cooldownGlobalMs = Math.max(0, Number(globalField.value || 0));
      const userField = read('cooldownUserMs');
      if (userField) data.cooldownUserMs = Math.max(0, Number(userField.value || 0));
      const enabledField = read('enabled');
      if (enabledField) data.enabled = enabledField.checked !== false;

      data.moduleKey = readValue('moduleKey', data.moduleKey || '').trim();
      data.actionKey = readValue('actionKey', data.actionKey || '').trim();
      data.targetMethod = readValue('targetMethod', data.targetMethod || 'POST').trim().toUpperCase() || 'POST';
      data.targetUrl = readValue('targetUrl', data.targetUrl || '').trim();
      data.responseMode = readValue('responseMode', data.responseMode || 'module').trim() || 'module';

      let cfg = { ...(data.config || {}) };
      const configField = read('configJson');
      if (configField) {
        const raw = String(configField.value || '').trim();
        if (raw) {
          try { cfg = { ...JSON.parse(raw), ...cfg }; }
          catch (_) { /* Entwurf nicht verwerfen, wenn JSON gerade unvollständig ist. */ }
        }
      }

      const selected = readValue('friendlyAction', friendlyActionId(data));
      const actionForConfig = selected === 'custom_action' || selected === 'text_plus_action' || selected === 'advanced' ? 'module_command' : selected;
      if (actionForConfig) cfg.actionType = actionForConfig;

      const chatField = read('chatMessage');
      if (chatField) cfg.message = String(chatField.value || '');
      const chatPrefer = read('chatPrefer');
      if (chatPrefer) cfg.prefer = String(chatPrefer.value || 'bot');

      const textMode = read('textOutputMode');
      const textText = read('textOutputText');
      const textKey = read('textOutputKey');
      const textSelection = read('textOutputSelection');
      if (textMode || textText || textKey || textSelection) {
        const mode = String(textMode?.value || cfg.textOutput?.mode || 'none');
        cfg.textOutput = {
          ...(cfg.textOutput || {}),
          enabled: mode !== 'none',
          mode,
          text: String(textText?.value ?? cfg.textOutput?.text ?? ''),
          textKey: String(textKey?.value ?? cfg.textOutput?.textKey ?? ''),
          selection: String(textSelection?.value || cfg.textOutput?.selection || 'random'),
          source: 'commands_dashboard'
        };
      }

      const soundMedia = read('soundMediaId');
      if (soundMedia) {
        cfg.mediaId = String(soundMedia.value || '').trim();
        cfg.volume = Number(readValue('soundVolume', cfg.volume ?? 80) || 80);
        cfg.target = readValue('soundTarget', cfg.target || 'stream').trim() || 'stream';
        cfg.queueMode = readValue('soundQueueMode', cfg.queueMode || 'queue').trim() || 'queue';
        cfg.queue = cfg.queueMode !== 'instant';
        cfg.actionType = 'sound_play';
      }

      const videoMedia = read('videoMediaId');
      if (videoMedia) {
        cfg.mediaId = String(videoMedia.value || '').trim();
        cfg.mediaType = 'video';
        cfg.type = 'video';
        cfg.volume = Number(readValue('videoVolume', cfg.volume ?? 80) || 80);
        cfg.overlay = readValue('videoOverlay', cfg.overlay || 'command_video_overlay').trim() || 'command_video_overlay';
        cfg.outputTarget = readValue('videoTarget', cfg.outputTarget || 'overlay').trim() || 'overlay';
        cfg.queueMode = readValue('videoQueueMode', cfg.queueMode || 'queue').trim() || 'queue';
        cfg.queue = cfg.queueMode !== 'instant';
        cfg.withSound = readChecked('videoWithSound', cfg.withSound !== false);
        cfg.actionType = 'video_play';
      }

      data.config = cfg;
      state.modal.data = data;
      return true;
    } catch (_) {
      return false;
    }
  }

  function catalogActionById(id) { return catalogActions().find(a => a.id === id) || null; }

  function applyCatalogDefaultsInModal(actionId) {
    if (!state.modal) return;
    if (actionId === '__text_only__') {
      state.modal.data.config = { ...(state.modal.data.config || {}), actionType: 'chat_message', message: state.modal.data.config?.message || '' };
      render();
      return;
    }
    if (actionId === '__new_custom__') {
      state.modal.data.moduleKey = '';
      state.modal.data.actionKey = '';
      state.modal.data.targetUrl = '';
      state.modal.data.config = { ...(state.modal.data.config || {}), actionType: 'module_command' };
      render();
      return;
    }
    if (actionId === '__stored__' || actionId === '__pick__') {
      state.notice = 'Gespeicherte Aktion bleibt unverändert.';
      render();
      return;
    }
    const action = catalogActionById(actionId);
    if (!action) {
      state.notice = 'Keine Katalog-Vorlage übernommen. Gespeicherte Werte bleiben unverändert.';
      render();
      return;
    }
    const cmd = state.modal.data;
    cmd.trigger = action.defaultTrigger || cmd.trigger || '';
    cmd.aliases = Array.isArray(action.defaultAliases) ? action.defaultAliases : (cmd.aliases || []);
    cmd.moduleKey = action.moduleKey || cmd.moduleKey || '';
    cmd.actionKey = action.actionKey || cmd.actionKey || 'command';
    cmd.targetMethod = action.targetMethod || cmd.targetMethod || 'POST';
    cmd.targetUrl = action.targetUrl || cmd.targetUrl || '';
    cmd.permissionLevel = action.permissionLevel || cmd.permissionLevel || 'everyone';
    cmd.cooldownGlobalMs = Number(action.cooldownGlobalMs ?? cmd.cooldownGlobalMs ?? 1000);
    cmd.cooldownUserMs = Number(action.cooldownUserMs ?? cmd.cooldownUserMs ?? 3000);
    cmd.responseMode = action.responseMode || cmd.responseMode || 'module';
    cmd.config = { ...(cmd.config || {}), ...(action.config || {}), actionType: 'module_command', catalogActionId: action.id };
    state.notice = `Ausgewählte Aktion übernommen: ${action.label || action.id}`;
    render();
  }

  function modalActionType() {
    const select = field('friendlyAction');
    if (select && select.value) return String(select.value);
    return friendlyActionId(state.modal?.data || {});
  }

  function readJsonTextarea(name, fallback) {
    const raw = String(field(name)?.value || '').trim();
    if (!raw) return fallback;
    try { return JSON.parse(raw); }
    catch (err) { throw new Error(`${name}: JSON ist ungültig (${err.message})`); }
  }

  function readTextOutputConfig() {
    const mode = String(field('textOutputMode')?.value || 'none').trim();
    const text = String(field('textOutputText')?.value || '').trim();
    const textKey = String(field('textOutputKey')?.value || '').trim();
    const selection = String(field('textOutputSelection')?.value || 'random').trim();
    return {
      enabled: mode !== 'none',
      mode,
      text,
      textKey,
      selection,
      source: 'commands_dashboard',
      note: 'Prepared for central text management; runtime execution will be wired in a later text-system step.'
    };
  }

  function readModalPayload() {
    if (!state.modal) throw new Error('Kein Editor geöffnet.');
    const mode = state.modal.mode;
    const original = state.modal.data || {};
    const uiAction = modalActionType();
    const action = uiAction === 'custom_action' || uiAction === 'text_plus_action' || uiAction === 'advanced' ? 'module_command' : uiAction;
    const trigger = cleanTrigger(field('trigger')?.value || '');
    if (!trigger) throw new Error('Trigger fehlt.');

    const cfgAdvanced = readJsonTextarea('configJson', {});
    let config = { ...cfgAdvanced, actionType: action };
    let moduleKey = String(field('moduleKey')?.value || original.moduleKey || '').trim();
    let actionKey = String(field('actionKey')?.value || original.actionKey || '').trim();
    let targetUrl = String(field('targetUrl')?.value || original.targetUrl || '').trim();
    let targetMethod = String(field('targetMethod')?.value || original.targetMethod || 'POST').trim().toUpperCase() || 'POST';
    let responseMode = String(field('responseMode')?.value || original.responseMode || 'module').trim();

    if (action === 'module_command') {
      // v0.1.6: Dropdown ist die zentrale Auswahl. Gespeicherte Werte bleiben maßgeblich.
      // Der Katalog ist nur Vorlage und wird erst per Button bewusst übernommen.
      const originalCatalogActionId = String(original.config?.catalogActionId || '').trim();
      if (uiAction === 'module_command' && originalCatalogActionId && catalogActionById(originalCatalogActionId)) {
        config.catalogActionId = originalCatalogActionId;
      } else {
        delete config.catalogActionId;
      }
      config.actionType = 'module_command';
    }

    if (uiAction === 'text_plus_action') {
      config.textOutput = readTextOutputConfig();
      config.textOutput.enabled = true;
    } else if (uiAction !== 'chat_message') {
      const textOutput = readTextOutputConfig();
      if (textOutput.enabled) config.textOutput = textOutput;
      else config.textOutput = { enabled: false, mode: 'none' };
    }

    if (action === 'chat_message') {
      config.message = String(field('chatMessage')?.value || '').trim();
      config.prefer = String(field('chatPrefer')?.value || 'bot').trim();
      config.textOutput = readTextOutputConfig();
      config.textOutput.enabled = true;
      moduleKey = moduleKey || 'chat_output';
      actionKey = actionKey || 'send_message';
      targetMethod = targetMethod || 'POST';
      responseMode = responseMode || 'module';
    }

    if (action === 'sound_play') {
      const mediaId = String(field('soundMediaId')?.value || '').trim();
      config.mediaId = mediaId;
      config.volume = Number(field('soundVolume')?.value || 80);
      config.target = String(field('soundTarget')?.value || 'stream').trim();
      config.queueMode = String(field('soundQueueMode')?.value || 'queue').trim();
      config.queue = config.queueMode !== 'instant';
      moduleKey = 'sound_media_bridge';
      actionKey = 'play_audio_media';
      targetMethod = 'POST';
      targetUrl = mediaId ? `/api/sound/play-media?mediaId=${encodeURIComponent(mediaId)}` : '/api/sound/play';
      responseMode = 'module';
    }

    if (action === 'video_play') {
      const mediaId = String(field('videoMediaId')?.value || '').trim();
      config.mediaId = mediaId;
      config.mediaType = 'video';
      config.type = 'video';
      config.volume = Number(field('videoVolume')?.value || 80);
      config.overlay = String(field('videoOverlay')?.value || 'command_video_overlay').trim();
      config.outputTarget = String(field('videoTarget')?.value || 'overlay').trim();
      config.durationMode = 'auto';
      config.queueMode = String(field('videoQueueMode')?.value || 'queue').trim();
      config.queue = config.queueMode !== 'instant';
      config.withSound = field('videoWithSound')?.checked !== false;
      moduleKey = 'sound_media_bridge';
      actionKey = 'play_video_media';
      targetMethod = 'POST';
      targetUrl = mediaId ? `/api/sound/play-media?mediaId=${encodeURIComponent(mediaId)}` : '/api/sound/play';
      responseMode = 'module';
    }

    return {
      id: mode === 'edit' ? Number(state.modal.originalId || 0) : undefined,
      originalId: mode === 'edit' ? Number(state.modal.originalId || 0) : undefined,
      originalTrigger: mode === 'edit' ? state.modal.originalTrigger : undefined,
      editMode: mode === 'edit',
      trigger,
      aliases: String(field('aliases')?.value || '').split(/[\s,;]+/).map(cleanTrigger).filter(Boolean),
      moduleKey,
      actionKey,
      targetMethod,
      targetUrl,
      enabled: field('enabled')?.checked !== false,
      permissionLevel: String(field('permissionLevel')?.value || 'everyone').trim(),
      cooldownGlobalMs: Math.max(0, Number(field('cooldownGlobalMs')?.value || 0)),
      cooldownUserMs: Math.max(0, Number(field('cooldownUserMs')?.value || 0)),
      liveOnly: false,
      responseMode,
      config
    };
  }

  async function saveModalCommand() {
    syncModalDraftFromDom();
    const payload = readModalPayload();
    const result = await window.CGN.api(api.upsert, { method: 'POST', body: JSON.stringify(payload) });
    const cmd = result.command || result.data?.command || payload;
    state.notice = payload.editMode ? `Command !${cmd.trigger || payload.trigger} aktualisiert.` : `Command !${cmd.trigger || payload.trigger} erstellt.`;
    state.selectedTrigger = cmd.trigger || payload.trigger;
    state.selectedCommandId = Number(cmd.id || payload.id || 0);
    state.modal = null;
    await loadAll(true);
  }

  async function deleteConfirmed() {
    const item = state.confirmDelete;
    if (!item) return;
    await window.CGN.api(api.delete, { method: 'POST', body: JSON.stringify({ id: item.id, trigger: item.trigger }) });
    state.notice = `Command ${item.label} gelöscht.`;
    state.selectedTrigger = '';
    state.selectedCommandId = 0;
    state.confirmDelete = null;
    state.modal = null;
    await loadAll(true);
  }

  async function duplicateCommand(cmd) {
    if (!cmd) return;
    const copy = clone(cmd);
    copy.id = 0;
    copy.trigger = `${cmd.trigger}_kopie`;
    copy.aliases = [];
    state.modal = { mode: 'create', title: `Kopie von !${cmd.trigger} erstellen`, originalId: 0, originalTrigger: '', data: copy };
    render();
  }

  async function runTest(execute) {
    const message = String(root?.querySelector('[data-test-message]')?.value || state.testMessage || '').trim();
    const user = String(root?.querySelector('[data-test-user]')?.value || state.testUser || 'forrestcgn').trim();
    const role = String(root?.querySelector('[data-test-role]')?.value || state.testRole || 'owner').trim();
    state.testMessage = message; state.testUser = user; state.testRole = role;
    const target = execute ? api.execute : api.test;
    state.testResult = await window.CGN.api(`${target}?message=${encodeURIComponent(message)}&user=${encodeURIComponent(user)}&role=${encodeURIComponent(role)}`);
    state.notice = execute ? 'Command ausgeführt.' : 'Command getestet.';
    state.tab = 'diagnostics';
    await loadAll(true);
  }

  function renderHeader() {
    const status = state.status || {};
    return `<section class="cmd-card cmd-hero">
      <div><h2>⌨️ Commands</h2><p>Commands erstellen, bearbeiten, löschen und nach Kategorien verwalten. UI ${esc(UI_VERSION)} · ${esc(UI_BUILD)}</p></div>
      <div class="cmd-actions"><button type="button" data-new-command>+ Neuer Command</button><button type="button" data-cmd-refresh>Neu laden</button></div>
      <div class="cmd-mini-status">Backend: <strong>${esc(status.moduleVersion || status.version || '-')}</strong> ${status.moduleBuild ? `· ${esc(status.moduleBuild)}` : ''}</div>
    </section>`;
  }

  function renderToolbar() {
    return `<section class="cmd-toolbar">
      <label>Command suchen ${help('Sucht in Trigger, Alias, Kategorie, Modul, Aktion und Rechten.')}<input data-cmd-search type="search" value="${esc(state.query)}" placeholder="z. B. test, hug, media, mod..."></label>
      <label>Kategorie ${help('Filtert die Liste nach Command-Kategorie.')}<select data-cmd-category-filter><option value="all">Alle Kategorien</option>${allCategories().map(c => `<option value="${esc(c.id)}" ${state.categoryFilter === c.id ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select></label>
      <label>Command direkt wählen ${help('Springt direkt zu einem vorhandenen Command und öffnet ihn zum Bearbeiten.')}<select data-cmd-jump><option value="">Command auswählen...</option>${commands().map(c => `<option value="${esc(c.id)}" ${Number(c.id) === Number(state.selectedCommandId) ? 'selected' : ''}>!${esc(c.trigger)} — ${esc(friendlyAction(c)?.label || 'Command')}</option>`).join('')}</select></label>
    </section>`;
  }

  function renderCommandCard(cmd) {
    const action = friendlyAction(cmd);
    const aliases = Array.isArray(cmd.aliases) && cmd.aliases.length ? `Alias: ${cmd.aliases.map(a => `!${a}`).join(', ')}` : 'Keine Aliase';
    return `<article class="cmd-command-card ${Number(cmd.id) === Number(state.selectedCommandId) || cmd.trigger === state.selectedTrigger ? 'active' : ''}">
      <button type="button" class="cmd-command-main" data-edit-command="${esc(cmd.id)}">
        <span class="cmd-command-title">!${esc(cmd.trigger)}</span>
        <span class="cmd-command-meta">${esc(aliases)} · ${esc(cmd.permissionLevel || 'everyone')} · ${esc(cmd.cooldownGlobalMs || 0)}ms / ${esc(cmd.cooldownUserMs || 0)}ms</span>
      </button>
      <div class="cmd-command-pills">${pill(`${action.icon} ${action.label}`, 'neutral')}${cmd.enabled !== false ? pill('aktiv','ok') : pill('aus','warn')}</div>
      <div class="cmd-card-actions"><button type="button" data-edit-command="${esc(cmd.id)}">Bearbeiten</button><button type="button" data-duplicate-command="${esc(cmd.id)}">Kopieren</button><button type="button" class="danger" data-delete-command="${esc(cmd.id)}">Löschen</button></div>
    </article>`;
  }

  function renderManage() {
    const groups = groupCommands(filteredCommands());
    return `<div class="cmd-manage-new">
      ${renderToolbar()}
      <section class="cmd-card">
        <div class="cmd-section-head"><h3>Commands nach Kategorien</h3><span>${filteredCommands().length}/${commands().length} Commands</span></div>
        ${groups.map(group => `<div class="cmd-category-block"><h4>${esc(group.label)}</h4><div class="cmd-command-grid">${group.items.map(renderCommandCard).join('')}</div></div>`).join('') || '<div class="cmd-empty">Keine Commands gefunden.</div>'}
      </section>
    </div>`;
  }

  function renderOverview() {
    const st = state.status || {};
    const stats = st.stats || {};
    const presence = state.presence || {};
    const connected = !!(presence.connected && presence.joined);
    return `<div class="cmd-grid cmd-grid-main">
      <section class="cmd-card"><h3>Übersicht</h3><div class="cmd-kpis"><div><strong>${commands().filter(c => c.enabled !== false).length}</strong><span>aktiv</span></div><div><strong>${commands().length}</strong><span>gesamt</span></div><div><strong>${stats.executed || 0}</strong><span>ausgeführt</span></div><div><strong>${stats.failed || 0}</strong><span>Fehler</span></div></div></section>
      <section class="cmd-card"><h3>Twitch-Presence</h3><p>${connected ? 'Bot ist verbunden.' : 'Bot ist aktuell nicht verbunden.'}</p><div class="cmd-actions"><button type="button" data-presence-start>Presence starten</button><button type="button" data-presence-stop>Presence stoppen</button></div></section>
    </div>`;
  }

  function renderLogs() {
    return `<section class="cmd-card"><h3>Logs</h3><div class="cmd-table-wrap"><table class="cmd-table"><thead><tr><th>Zeit</th><th>Command</th><th>User</th><th>Status</th><th>Fehler</th></tr></thead><tbody>${logs().map(row => `<tr><td>${esc(row.created_at || row.createdAt || '')}</td><td>!${esc(row.trigger || '')}</td><td>${esc(row.user_login || row.userLogin || '')}</td><td>${Number(row.success || 0) === 1 ? 'OK' : (Number(row.ignored || 0) === 1 ? 'ignoriert' : 'Fehler')}</td><td>${esc(row.error || '')}</td></tr>`).join('') || '<tr><td colspan="5">Keine Logs.</td></tr>'}</tbody></table></div></section>`;
  }

  function renderDiagnostics() {
    return `<div class="cmd-grid"><section class="cmd-card"><h3>Testen</h3><div class="cmd-form-grid"><label>Nachricht<input data-test-message value="${esc(state.testMessage)}"></label><label>User<input data-test-user value="${esc(state.testUser)}"></label><label>Rolle<select data-test-role>${['everyone','subscriber','vip','mod','streamer','owner'].map(r => `<option value="${r}" ${state.testRole === r ? 'selected' : ''}>${r}</option>`).join('')}</select></label></div><div class="cmd-actions"><button type="button" data-run-test>Dry-Run</button><button type="button" data-run-execute>Ausführen</button></div>${state.testResult ? `<pre class="cmd-json">${esc(JSON.stringify(state.testResult, null, 2))}</pre>` : ''}</section><section class="cmd-card"><h3>Rohdaten</h3><details><summary>Status</summary><pre class="cmd-json">${esc(JSON.stringify(state.status || {}, null, 2))}</pre></details><details><summary>Presence</summary><pre class="cmd-json">${esc(JSON.stringify(state.presence || {}, null, 2))}</pre></details></section></div>`;
  }

  function matchedCatalogAction(cmd) {
    const current = String(cmd?.config?.catalogActionId || '').trim();
    if (current) {
      const byConfig = catalogActionById(current);
      if (byConfig) return byConfig;
    }
    const moduleKey = String(cmd?.moduleKey || '').trim();
    const actionKey = String(cmd?.actionKey || '').trim();
    const targetUrl = String(cmd?.targetUrl || '').trim();
    if (!moduleKey && !actionKey && !targetUrl) return null;
    return catalogActions().find(action => {
      const sameModule = String(action.moduleKey || '').trim() === moduleKey;
      const sameAction = String(action.actionKey || '').trim() === actionKey;
      const sameUrl = String(action.targetUrl || '').trim() === targetUrl;
      return sameModule && sameAction && sameUrl;
    }) || null;
  }

  function renderCatalogOptions(cmd) {
    const matched = matchedCatalogAction(cmd);
    const current = matched ? matched.id : '__stored__';
    const rows = [];
    if (state.modal?.mode === 'edit') {
      const label = storedActionLabel(cmd);
      rows.push(`<option value="__stored__" ${current === '__stored__' ? 'selected' : ''}>✓ Gespeichert: ${esc(label)}</option>`);
    } else {
      rows.push('<option value="__pick__" selected>Modul-Aktion auswählen...</option>');
    }
    rows.push('<option value="__new_custom__">⚙️ Benutzerdefinierte Aktion</option>');
    rows.push('<option value="__text_only__">💬 Text anzeigen</option>');
    const groups = allCatalogGroups().map(group => `<optgroup label="${esc(group.label)}">${group.actions.map(a => `<option value="${esc(a.id)}" ${a.id === current ? 'selected' : ''}>${esc(a.icon || '🧩')} ${esc(a.label || a.id)}</option>`).join('')}</optgroup>`).join('');
    return rows.join('') + groups;
  }

  function allCatalogGroups() {
    const cats = catalogCategories();
    if (cats.length) return cats.map(cat => ({ label: cat.label || cat.id, actions: Array.isArray(cat.actions) ? cat.actions : catalogActions().filter(a => a.categoryId === cat.id) }));
    return [{ label: 'Modul-Aktionen', actions: catalogActions() }];
  }

  function applyModalMediaAsset(type, asset) {
    syncModalDraftFromDom();
    if (!state.modal || !asset) return;
    const mediaId = String(asset.id || asset.mediaId || '').trim();
    if (!mediaId) return;
    const cfg = { ...(state.modal.data.config || {}) };
    cfg.mediaId = mediaId;
    if (type === 'video') {
      cfg.actionType = 'video_play';
      cfg.mediaType = 'video';
      cfg.type = 'video';
      cfg.outputTarget = cfg.outputTarget || 'overlay';
      cfg.overlay = cfg.overlay || 'command_video_overlay';
      cfg.withSound = cfg.withSound !== false;
      state.modal.data.moduleKey = 'sound_media_bridge';
      state.modal.data.actionKey = 'play_video_media';
    } else {
      cfg.actionType = 'sound_play';
      cfg.mediaType = 'audio';
      cfg.type = 'audio';
      cfg.target = cfg.target || 'stream';
      state.modal.data.moduleKey = 'sound_media_bridge';
      state.modal.data.actionKey = 'play_audio_media';
    }
    state.modal.data.targetMethod = 'POST';
    state.modal.data.targetUrl = `/api/sound/play-media?mediaId=${encodeURIComponent(mediaId)}`;
    state.modal.data.responseMode = 'module';
    state.modal.data.config = cfg;
    render();
  }

  function openModalMediaPicker(type) {
    syncModalDraftFromDom();
    if (!window.MediaPicker?.open) {
      state.error = 'MediaPicker ist nicht geladen.';
      render();
      return;
    }
    const isVideo = type === 'video';
    window.MediaPicker.open({
      moduleKey: 'commands',
      allowedTypes: isVideo ? ['video', 'animation'] : ['audio'],
      title: isVideo ? 'Command-Video auswählen' : 'Command-Sound auswählen',
      onSelect(asset) { applyModalMediaAsset(type, asset); }
    });
  }

  function renderTextOutputFields(cmd, forceEnabled = false) {
    const out = cmd.config?.textOutput || {};
    const mode = forceEnabled ? (out.mode && out.mode !== 'none' ? out.mode : 'single') : (out.mode || 'none');
    const open = forceEnabled || mode !== 'none';
    return `<details class="cmd-modal-section cmd-text-output-section" ${open ? 'open' : ''}>
      <summary>💬 Optionale Chat-Ausgabe</summary>
      <p class="cmd-muted">Optionaler Zusatztext zum Command. Das ist nicht die eigentliche Aktion, sondern eine zusätzliche Chat-Ausgabe. Für reine Text-Commands bitte oben „Text anzeigen“ wählen.</p>
      <div class="cmd-form-grid">
        <label>${rowLabel('Chat-Text zusätzlich ausgeben','Optionaler Chattext. Später wird das an die zentrale Textverwaltung angebunden.')}<select data-cmd-modal-field="textOutputMode"><option value="none" ${mode === 'none' ? 'selected' : ''}>Keine zusätzliche Textausgabe</option><option value="single" ${mode === 'single' ? 'selected' : ''}>Einzelner Text</option><option value="text_key" ${mode === 'text_key' ? 'selected' : ''}>Textgruppe / Text-Key</option></select></label>
        <label>${rowLabel('Auswahl','Bei mehreren Varianten kann später zufällig oder der Reihe nach gewählt werden.')}<select data-cmd-modal-field="textOutputSelection"><option value="random" ${(out.selection || 'random') === 'random' ? 'selected' : ''}>Zufällig</option><option value="first" ${out.selection === 'first' ? 'selected' : ''}>Erste aktive Variante</option><option value="round_robin" ${out.selection === 'round_robin' ? 'selected' : ''}>Der Reihe nach</option></select></label>
      </div>
      <label>${rowLabel('Einzeltext','Direkter zusätzlicher Text für diesen Command. Platzhalter wie {user} können später zentral unterstützt werden.')}<textarea data-cmd-modal-field="textOutputText" rows="3" placeholder="Optionaler Text, der zusätzlich im Chat erscheinen soll...">${esc(out.text || '')}</textarea></label>
      <label>${rowLabel('Text-Key / Textgruppe','Geplanter Schlüssel für die zentrale Textverwaltung, z. B. commands.discord_hint.')}<input data-cmd-modal-field="textOutputKey" value="${esc(out.textKey || '')}" placeholder="commands.mein_text"></label>
      <p class="cmd-muted">Zentrale Textverwaltung kommt als eigenes System: Kategorien, Text-Keys, mehrere Varianten, aktiv/inaktiv, Platzhalter und Zufallsauswahl. Nicht in die Medienverwaltung mischen.</p>
    </details>`;
  }

  function renderMainTextFields(cmd) {
    const out = cmd.config?.textOutput || {};
    return `<div class="cmd-modal-box cmd-main-text-box"><h4>💬 Text anzeigen</h4>
      <label>${rowLabel('Chattext','Text, der im Chat ausgegeben werden soll.')}<textarea data-cmd-modal-field="chatMessage" rows="4" placeholder="Text, der im Chat erscheinen soll...">${esc(cmd.config?.message || out.text || '')}</textarea></label>
      <div class="cmd-form-grid">
        <label>${rowLabel('Textquelle','Einzeltext direkt hier oder später eine Textgruppe aus der zentralen Textverwaltung.')}<select data-cmd-modal-field="textOutputMode"><option value="single" ${(out.mode || 'single') === 'single' ? 'selected' : ''}>Einzelner Text</option><option value="text_key" ${out.mode === 'text_key' ? 'selected' : ''}>Textgruppe / Text-Key</option></select></label>
        <label>${rowLabel('Auswahl','Bei Textgruppen später Zufall, erste aktive Variante oder der Reihe nach.')}<select data-cmd-modal-field="textOutputSelection"><option value="random" ${(out.selection || 'random') === 'random' ? 'selected' : ''}>Zufällig</option><option value="first" ${out.selection === 'first' ? 'selected' : ''}>Erste aktive Variante</option><option value="round_robin" ${out.selection === 'round_robin' ? 'selected' : ''}>Der Reihe nach</option></select></label>
      </div>
      <label>${rowLabel('Text-Key / Textgruppe','Vorbereitung für spätere zentrale Textverwaltung.')}<input data-cmd-modal-field="textOutputKey" value="${esc(out.textKey || '')}" placeholder="commands.mein_text"></label>
      <p class="cmd-muted">Diese Maske ist die Hauptaktion „Text anzeigen“. Für Text zusätzlich zu Song/Video/Modul gibt es darunter den eigenen Abschnitt „Optionale Chat-Ausgabe“.</p>
    </div>`;
  }

  function renderActionFields(cmd) {
    const selected = modalActionType();
    const type = selected === 'custom_action' || selected === 'advanced' || selected === 'text_plus_action' ? 'module_command' : (cmd.config?.actionType || selected || 'module_command');
    if (selected === 'chat_message' || type === 'chat_message') {
      return renderMainTextFields(cmd);
    }
    if (selected === 'sound_play' || type === 'sound_play') {
      return `<div class="cmd-modal-box cmd-media-action-box"><h4>🔊 Song / Sound abspielen</h4>
        <div class="cmd-form-grid">
          <label>${rowLabel('Sound','Über die zentrale Medienverwaltung auswählen.')}<input data-cmd-modal-field="soundMediaId" value="${esc(cmd.config?.mediaId || '')}" placeholder="Noch kein Sound gewählt" readonly><button type="button" class="cmd-inline-btn" data-cmd-pick-media="sound">Sound auswählen</button></label>
          <label>${rowLabel('Lautstärke','0 bis 100 Prozent.')}<input type="number" min="0" max="100" data-cmd-modal-field="soundVolume" value="${esc(cmd.config?.volume ?? 80)}"></label>
          <label>${rowLabel('Ziel','Wohin der Sound später ausgegeben werden soll.')}<select data-cmd-modal-field="soundTarget"><option value="stream" ${(cmd.config?.target || 'stream') === 'stream' ? 'selected' : ''}>Stream / OBS</option><option value="discord" ${cmd.config?.target === 'discord' ? 'selected' : ''}>Discord</option><option value="both" ${cmd.config?.target === 'both' ? 'selected' : ''}>Stream + Discord</option></select></label>
          <label>${rowLabel('Verhalten','Queue-Regel für spätere Erweiterung.')}<select data-cmd-modal-field="soundQueueMode"><option value="queue" ${(cmd.config?.queueMode || 'queue') === 'queue' ? 'selected' : ''}>In Warteschlange</option><option value="instant" ${cmd.config?.queueMode === 'instant' ? 'selected' : ''}>Sofort starten</option><option value="free_only" ${cmd.config?.queueMode === 'free_only' ? 'selected' : ''}>Nur wenn frei</option></select></label>
        </div>
        <p class="cmd-muted">Der Picker schreibt die Media-ID. Beim Speichern wird weiter die bestehende Sound-System-Brücke genutzt.</p>
      </div>`;
    }
    if (selected === 'video_play' || type === 'video_play') {
      return `<div class="cmd-modal-box cmd-media-action-box"><h4>🎬 Video abspielen</h4>
        <div class="cmd-form-grid">
          <label>${rowLabel('Video','Über die zentrale Medienverwaltung auswählen.')}<input data-cmd-modal-field="videoMediaId" value="${esc(cmd.config?.mediaId || '')}" placeholder="Noch kein Video gewählt" readonly><button type="button" class="cmd-inline-btn" data-cmd-pick-media="video">Video auswählen</button></label>
          <label>${rowLabel('Lautstärke','0 bis 100 Prozent.')}<input type="number" min="0" max="100" data-cmd-modal-field="videoVolume" value="${esc(cmd.config?.volume ?? 80)}"></label>
          <label>${rowLabel('Ziel','Normales Ziel für Video-Commands.')}<select data-cmd-modal-field="videoTarget"><option value="overlay" ${(cmd.config?.outputTarget || 'overlay') === 'overlay' ? 'selected' : ''}>OBS Overlay / Stream</option></select></label>
          <label>${rowLabel('Verhalten','Queue-Regel für spätere Erweiterung.')}<select data-cmd-modal-field="videoQueueMode"><option value="queue" ${(cmd.config?.queueMode || 'queue') === 'queue' ? 'selected' : ''}>In Warteschlange</option><option value="instant" ${cmd.config?.queueMode === 'instant' ? 'selected' : ''}>Sofort starten</option><option value="free_only" ${cmd.config?.queueMode === 'free_only' ? 'selected' : ''}>Nur wenn frei</option></select></label>
          <label class="cmd-check"><input type="checkbox" data-cmd-modal-field="videoWithSound" ${cmd.config?.withSound !== false ? 'checked' : ''}> Mit Ton</label>
        </div>
        <input type="hidden" data-cmd-modal-field="videoOverlay" value="${esc(cmd.config?.overlay || 'command_video_overlay')}">
        <p class="cmd-muted">Technische Overlay-/Route-Werte liegen unter „Erweitert“. Normalerweise reicht Medium auswählen und speichern.</p>
      </div>`;
    }
    if (type === 'module_command') {
      const matched = matchedCatalogAction(cmd);
      const custom = selected === 'custom_action' || !matched;
      return `<div class="cmd-modal-box ${custom ? 'custom-saved-action' : ''}"><h4>${custom ? '⚙️ Benutzerdefinierte Aktion' : '🧩 Modul-Befehl ausführen'}</h4>
        <label>${rowLabel('Modul-Befehl auswählen','Beim Bearbeiten steht die gespeicherte Aktion an erster Stelle. Katalogwerte ändern erst etwas, wenn du sie bewusst übernimmst.')}<select data-cmd-modal-field="catalogAction">${renderCatalogOptions(cmd)}</select></label>
        <div class="cmd-actions"><button type="button" data-apply-catalog-defaults-modal>Ausgewählte Aktion übernehmen</button></div>
        <p class="cmd-muted" data-catalog-template-note>Auswahl geändert? Erst „Ausgewählte Aktion übernehmen“ schreibt eine Katalog-Vorlage in das Formular. Technische gespeicherte Werte siehst du unter „Erweitert“.</p>
      </div>`;
    }
    return '';
  }

  function renderModal() {
    if (!state.modal) return '';
    const cmd = state.modal.data || clone(DEFAULT_COMMAND);
    const type = friendlyActionId(cmd);
    const configWithoutType = clone(cmd.config || {});
    delete configWithoutType.actionType;
    const shouldOpenAdvanced = (type === 'custom_action' || type === 'advanced') || (actionType(cmd) === 'module_command' && !matchedCatalogAction(cmd));
    return `<div class="cmd-modal-backdrop" data-modal-backdrop><div class="cmd-modal" role="dialog" aria-modal="true">
      <div class="cmd-modal-head"><div><h3>${esc(state.modal.title)}</h3><p>${state.modal.mode === 'edit' ? 'Bearbeiten zeigt und speichert exakt die gespeicherten Daten. Katalogwerte sind nur Vorlagen.' : 'Erstellt einen neuen Command mit Standardwerten.'}</p></div><button type="button" data-modal-close>×</button></div>
      <div class="cmd-modal-body">
        <section class="cmd-modal-section"><h4>Basis</h4><div class="cmd-form-grid"><label>${rowLabel('Trigger','Der Chat-Befehl ohne !, z. B. discord, test oder hug.')}<input data-cmd-modal-field="trigger" value="${esc(cmd.trigger || '')}" placeholder="test"></label><label>${rowLabel('Aliase','Weitere Auslöser für denselben Command, getrennt mit Komma oder Leerzeichen.')}<input data-cmd-modal-field="aliases" value="${esc(Array.isArray(cmd.aliases) ? cmd.aliases.join(', ') : '')}" placeholder="death, tod"></label><label>${rowLabel('Was soll passieren?','Beim neuen Command stehen Song, Video und Text oben. Beim Bearbeiten steht die gespeicherte Aktionsart an erster Stelle; du kannst sie hier ändern.')}<select data-cmd-modal-field="friendlyAction">${renderFriendlyActionOptions(cmd)}</select></label><label>${rowLabel('Rechte','Wer den Command im Chat ausführen darf.')}<select data-cmd-modal-field="permissionLevel">${['everyone','subscriber','vip','mod','streamer','owner'].map(level => `<option value="${level}" ${cmd.permissionLevel === level ? 'selected' : ''}>${level}</option>`).join('')}</select></label><label>${rowLabel('Global Cooldown ms','Pause für alle Nutzer nach Ausführung.')}<input type="number" min="0" data-cmd-modal-field="cooldownGlobalMs" value="${esc(cmd.cooldownGlobalMs ?? 1000)}"></label><label>${rowLabel('User Cooldown ms','Pause nur für denselben Nutzer.')}<input type="number" min="0" data-cmd-modal-field="cooldownUserMs" value="${esc(cmd.cooldownUserMs ?? 3000)}"></label><label class="cmd-check"><input type="checkbox" data-cmd-modal-field="enabled" ${cmd.enabled !== false ? 'checked' : ''}> Aktiv</label></div></section>
        <section class="cmd-modal-section"><h4>Aktion</h4>${renderActionFields(cmd)}</section>
        ${friendlyActionId(cmd) === 'chat_message' ? '' : renderTextOutputFields(cmd, false)}
        <details class="cmd-modal-section cmd-advanced" ${shouldOpenAdvanced ? 'open' : ''}><summary>Erweitert / technische Details</summary><div class="cmd-form-grid"><label>Modul<input data-cmd-modal-field="moduleKey" value="${esc(cmd.moduleKey || '')}"></label><label>Action-Key<input data-cmd-modal-field="actionKey" value="${esc(cmd.actionKey || '')}"></label><label>Methode<select data-cmd-modal-field="targetMethod"><option value="POST" ${cmd.targetMethod !== 'GET' ? 'selected' : ''}>POST</option><option value="GET" ${cmd.targetMethod === 'GET' ? 'selected' : ''}>GET</option></select></label><label>Ziel-URL<input data-cmd-modal-field="targetUrl" value="${esc(cmd.targetUrl || '')}"></label><label>Response-Mode<input data-cmd-modal-field="responseMode" value="${esc(cmd.responseMode || 'module')}"></label></div><label>Config JSON<textarea data-cmd-modal-field="configJson" rows="7">${esc(JSON.stringify(configWithoutType, null, 2))}</textarea></label><p class="cmd-muted">„Nur Live“ ist bewusst nicht in der normalen UI. Wenn der Bot nicht im Channel ist, kommen keine Chatbefehle an.</p></details>
      </div>
      <div class="cmd-modal-actions"><button type="button" data-save-modal-command>${state.modal.mode === 'edit' ? 'Änderungen speichern' : 'Command erstellen'}</button>${state.modal.mode === 'edit' ? `<button type="button" class="danger" data-delete-from-modal>Löschen</button>` : ''}<button type="button" data-modal-close>Abbrechen</button></div>
    </div></div>`;
  }

  function renderConfirmDelete() {
    if (!state.confirmDelete) return '';
    return `<div class="cmd-modal-backdrop"><div class="cmd-confirm"><h3>Command löschen?</h3><p>${esc(state.confirmDelete.label)} wirklich löschen?</p><div class="cmd-actions"><button type="button" data-confirm-delete-yes class="danger">Ja, löschen</button><button type="button" data-modal-close>Nein, abbrechen</button></div></div></div>`;
  }

  function renderActiveTab() {
    if (state.tab === 'overview') return renderOverview();
    if (state.tab === 'logs') return renderLogs();
    if (state.tab === 'diagnostics') return renderDiagnostics();
    return renderManage();
  }

  function render() {
    root = document.getElementById('commandsModule');
    if (!root) return;
    const tabs = [['manage','Commands'],['overview','Übersicht'],['logs','Logs'],['diagnostics','Diagnose']];
    root.innerHTML = `<div class="cmd-wrap cmd-v018">${renderHeader()}${state.error ? `<div class="cmd-error">${esc(state.error)}</div>` : ''}${state.notice ? `<div class="cmd-notice">${esc(state.notice)}</div>` : ''}${state.loading ? '<section class="cmd-card">Lade Commands...</section>' : `<div class="cmd-tabs">${tabs.map(([id,label]) => `<button type="button" class="${state.tab === id ? 'active' : ''}" data-cmd-tab="${id}">${esc(label)}</button>`).join('')}</div>${renderActiveTab()}`}${renderModal()}${renderConfirmDelete()}</div>`;
    bind();
  }

  function bind() {
    root?.querySelectorAll('[data-cmd-tab]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.cmdTab || 'manage'; state.error=''; render(); }));
    root?.querySelectorAll('[data-cmd-refresh]').forEach(btn => btn.addEventListener('click', () => loadAll(true).catch(showError)));
    root?.querySelectorAll('[data-new-command]').forEach(btn => btn.addEventListener('click', openCreateModal));
    root?.querySelector('[data-cmd-search]')?.addEventListener('input', ev => { state.query = ev.target.value || ''; render(); });
    root?.querySelector('[data-cmd-category-filter]')?.addEventListener('change', ev => { state.categoryFilter = ev.target.value || 'all'; render(); });
    root?.querySelector('[data-cmd-jump]')?.addEventListener('change', ev => { const id = Number(ev.target.value || 0); const cmd = commands().find(c => Number(c.id) === id); if (cmd) openEditModal(cmd); });
    root?.querySelectorAll('[data-edit-command]').forEach(btn => btn.addEventListener('click', () => { const cmd = commands().find(c => Number(c.id) === Number(btn.dataset.editCommand)); state.selectedCommandId = Number(cmd?.id || 0); state.selectedTrigger = cmd?.trigger || ''; openEditModal(cmd); }));
    root?.querySelectorAll('[data-delete-command]').forEach(btn => btn.addEventListener('click', () => { const cmd = commands().find(c => Number(c.id) === Number(btn.dataset.deleteCommand)); openDeleteConfirm(cmd); }));
    root?.querySelectorAll('[data-duplicate-command]').forEach(btn => btn.addEventListener('click', () => { const cmd = commands().find(c => Number(c.id) === Number(btn.dataset.duplicateCommand)); duplicateCommand(cmd).catch(showError); }));
    root?.querySelectorAll('[data-modal-close]').forEach(btn => btn.addEventListener('click', closeModal));
    root?.querySelector('[data-save-modal-command]')?.addEventListener('click', () => saveModalCommand().catch(showError));
    root?.querySelectorAll('[data-cmd-pick-media]').forEach(btn => btn.addEventListener('click', () => openModalMediaPicker(btn.dataset.cmdPickMedia || 'sound')));
    root?.querySelector('[data-delete-from-modal]')?.addEventListener('click', () => { if (!state.modal) return; openDeleteConfirm({ id: state.modal.originalId, trigger: state.modal.originalTrigger }); });
    root?.querySelector('[data-confirm-delete-yes]')?.addEventListener('click', () => deleteConfirmed().catch(showError));
    root?.querySelector('[data-cmd-modal-field="friendlyAction"]')?.addEventListener('change', ev => {
      if (!state.modal) return;
      syncModalDraftFromDom();
      const selected = ev.target.value || 'custom_action';
      const actionTypeForConfig = selected === 'custom_action' || selected === 'text_plus_action' || selected === 'advanced' ? 'module_command' : selected;
      state.modal.data.config = { ...(state.modal.data.config || {}), actionType: actionTypeForConfig };
      if (selected === 'chat_message') {
        state.modal.data.config.message = state.modal.data.config.message || state.modal.data.config.textOutput?.text || '';
      }
      if (selected === 'text_plus_action') {
        state.modal.data.config.textOutput = { ...(state.modal.data.config.textOutput || {}), enabled: true, mode: state.modal.data.config.textOutput?.mode || 'single' };
      }
      render();
    });
    root?.querySelector('[data-cmd-modal-field="catalogAction"]')?.addEventListener('change', ev => {
      if (!state.modal) return;
      syncModalDraftFromDom();
      const value = ev.target.value || '__stored__';
      if (value === '__text_only__') {
        state.modal.data.config = { ...(state.modal.data.config || {}), actionType: 'chat_message', message: state.modal.data.config?.message || '' };
        render();
        return;
      }
      if (value === '__new_custom__') {
        state.modal.data.config = { ...(state.modal.data.config || {}), actionType: 'module_command' };
        state.modal.data.moduleKey = '';
        state.modal.data.actionKey = '';
        state.modal.data.targetUrl = '';
        render();
        return;
      }
      const note = root.querySelector('[data-catalog-template-note]');
      if (note) note.textContent = (value === '__stored__' || value === '__pick__')
        ? 'Gespeicherte Aktion bleibt unverändert.'
        : 'Vorlage ausgewählt. Erst „Ausgewählte Aktion übernehmen“ schreibt sie in den Command.';
    });
    root?.querySelector('[data-apply-catalog-defaults-modal]')?.addEventListener('click', () => applyCatalogDefaultsInModal(field('catalogAction')?.value || ''));
    root?.querySelectorAll('[data-presence-start]').forEach(btn => btn.addEventListener('click', () => window.CGN.api(api.presenceStart).then(() => loadAll(true)).catch(showError)));
    root?.querySelectorAll('[data-presence-stop]').forEach(btn => btn.addEventListener('click', () => window.CGN.api(api.presenceStop).then(() => loadAll(true)).catch(showError)));
    root?.querySelectorAll('[data-run-test]').forEach(btn => btn.addEventListener('click', () => runTest(false).catch(showError)));
    root?.querySelectorAll('[data-run-execute]').forEach(btn => btn.addEventListener('click', () => runTest(true).catch(showError)));
    window.CommandsMediaBridge?.activate?.(false).catch?.(() => {});
  }

  function showError(err) { state.error = err.message || String(err); render(); }

  window.addEventListener('cgn:module-show', ev => { if (ev.detail?.module === 'commands') loadAll(false); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { root = document.getElementById('commandsModule'); });
  else root = document.getElementById('commandsModule');

  return { loadAll, render };
})();
