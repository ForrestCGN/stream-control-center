window.CommandsModule = (function(){
  'use strict';

  const UI_VERSION = '0.1.4';
  const UI_BUILD = 'modal-safe-editor';

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
    { id: 'module_command', label: 'Modul-Befehl ausführen', icon: '🧩', help: 'Wählt eine vorhandene Backend-Modulaktion aus dem Katalog, z. B. Deathcounter, Hug oder Tagebuch.' },
    { id: 'chat_message', label: 'Chat-Nachricht senden', icon: '💬', help: 'Speichert einen festen Chattext als Command-Aktion. Die Ausführung wird später zentral angebunden.' },
    { id: 'sound_play', label: 'Sound abspielen', icon: '🔊', help: 'Wählt einen Sound aus der Medienverwaltung und führt ihn über /api/sound/play aus.' },
    { id: 'video_play', label: 'Video anzeigen', icon: '🎬', help: 'Wählt ein Video aus der Medienverwaltung und zeigt es über das Sound-/Overlay-System an.' },
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
    config: { actionType: 'module_command' }
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

  function friendlyAction(cmd) {
    const type = actionType(cmd);
    if (type === 'sound_play') return FRIENDLY_ACTIONS.find(a => a.id === 'sound_play');
    if (type === 'video_play') return FRIENDLY_ACTIONS.find(a => a.id === 'video_play');
    if (type === 'chat_message') return FRIENDLY_ACTIONS.find(a => a.id === 'chat_message');
    return FRIENDLY_ACTIONS.find(a => a.id === 'module_command');
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

  function catalogActionById(id) { return catalogActions().find(a => a.id === id) || null; }

  function applyCatalogDefaultsInModal(actionId) {
    const action = catalogActionById(actionId);
    if (!action || !state.modal) return;
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
    state.notice = `Defaults übernommen: ${action.label || action.id}`;
    render();
  }

  function modalActionType() {
    const select = field('friendlyAction');
    return String(select?.value || state.modal?.data?.config?.actionType || 'module_command');
  }

  function readJsonTextarea(name, fallback) {
    const raw = String(field(name)?.value || '').trim();
    if (!raw) return fallback;
    try { return JSON.parse(raw); }
    catch (err) { throw new Error(`${name}: JSON ist ungültig (${err.message})`); }
  }

  function readModalPayload() {
    if (!state.modal) throw new Error('Kein Editor geöffnet.');
    const mode = state.modal.mode;
    const original = state.modal.data || {};
    const action = modalActionType();
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
      const catalogActionId = String(field('catalogAction')?.value || original.config?.catalogActionId || '').trim();
      const catalogAction = catalogActionById(catalogActionId);
      if (catalogAction) {
        moduleKey = catalogAction.moduleKey || moduleKey;
        actionKey = catalogAction.actionKey || actionKey || 'command';
        targetUrl = catalogAction.targetUrl || targetUrl;
        targetMethod = catalogAction.targetMethod || targetMethod;
        responseMode = catalogAction.responseMode || responseMode;
        config = { ...config, ...(catalogAction.config || {}), actionType: 'module_command', catalogActionId };
      }
    }

    if (action === 'chat_message') {
      config.message = String(field('chatMessage')?.value || '').trim();
      config.prefer = String(field('chatPrefer')?.value || 'bot').trim();
      moduleKey = moduleKey || 'chat_output';
      actionKey = actionKey || 'send_message';
      responseMode = responseMode || 'module';
    }

    if (action === 'sound_play') {
      const mediaId = String(field('soundMediaId')?.value || '').trim();
      config.mediaId = mediaId;
      config.volume = Number(field('soundVolume')?.value || 80);
      config.target = 'stream';
      config.queue = true;
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
      config.durationMode = 'auto';
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

  function renderCatalogOptions(cmd) {
    const current = cmd.config?.catalogActionId || '';
    return allCatalogGroups().map(group => `<optgroup label="${esc(group.label)}">${group.actions.map(a => `<option value="${esc(a.id)}" ${a.id === current ? 'selected' : ''}>${esc(a.icon || '🧩')} ${esc(a.label || a.id)}</option>`).join('')}</optgroup>`).join('');
  }

  function allCatalogGroups() {
    const cats = catalogCategories();
    if (cats.length) return cats.map(cat => ({ label: cat.label || cat.id, actions: Array.isArray(cat.actions) ? cat.actions : catalogActions().filter(a => a.categoryId === cat.id) }));
    return [{ label: 'Modul-Aktionen', actions: catalogActions() }];
  }

  function renderActionFields(cmd) {
    const type = cmd.config?.actionType || 'module_command';
    if (type === 'sound_play') {
      return `<div class="cmd-modal-box"><h4>Sound</h4><div class="cmd-form-grid"><label>${rowLabel('Medium-ID','Wird über die Medienverwaltung gesetzt.')}<input data-cmd-modal-field="soundMediaId" value="${esc(cmd.config?.mediaId || '')}" placeholder="z. B. 1353"></label><label>${rowLabel('Lautstärke','0 bis 100 Prozent.')}<input type="number" min="0" max="100" data-cmd-modal-field="soundVolume" value="${esc(cmd.config?.volume ?? 80)}"></label></div></div>`;
    }
    if (type === 'video_play') {
      return `<div class="cmd-modal-box"><h4>Video</h4><div class="cmd-form-grid"><label>${rowLabel('Medium-ID','Wird über die Medienverwaltung gesetzt.')}<input data-cmd-modal-field="videoMediaId" value="${esc(cmd.config?.mediaId || '')}" placeholder="z. B. 1353"></label><label>${rowLabel('Overlay / Player','Interner Overlay-/Player-Name. Standard reicht normalerweise.')}<input data-cmd-modal-field="videoOverlay" value="${esc(cmd.config?.overlay || 'command_video_overlay')}"></label><label>${rowLabel('Lautstärke','0 bis 100 Prozent.')}<input type="number" min="0" max="100" data-cmd-modal-field="videoVolume" value="${esc(cmd.config?.volume ?? 80)}"></label><label class="cmd-check"><input type="checkbox" data-cmd-modal-field="videoWithSound" ${cmd.config?.withSound !== false ? 'checked' : ''}> Mit Ton</label></div></div>`;
    }
    if (type === 'chat_message') {
      return `<div class="cmd-modal-box"><h4>Chat-Nachricht</h4><label>${rowLabel('Nachricht','Text, der später in den Chat gesendet werden soll.')}<textarea data-cmd-modal-field="chatMessage" rows="3">${esc(cmd.config?.message || '')}</textarea></label><label>${rowLabel('Senden als','Legt fest, ob Bot oder Streamer bevorzugt werden soll.')}<select data-cmd-modal-field="chatPrefer"><option value="bot" ${cmd.config?.prefer !== 'streamer' ? 'selected' : ''}>Bot</option><option value="streamer" ${cmd.config?.prefer === 'streamer' ? 'selected' : ''}>Streamer</option></select></label></div>`;
    }
    if (type === 'module_command') {
      return `<div class="cmd-modal-box"><h4>Modul-Befehl</h4><label>${rowLabel('Befehl auswählen','Wähle eine bekannte Backend-Aktion aus dem Katalog.')}<select data-cmd-modal-field="catalogAction">${renderCatalogOptions(cmd)}</select></label><div class="cmd-actions"><button type="button" data-apply-catalog-defaults-modal>Defaults übernehmen</button></div></div>`;
    }
    return '';
  }

  function renderModal() {
    if (!state.modal) return '';
    const cmd = state.modal.data || clone(DEFAULT_COMMAND);
    const type = cmd.config?.actionType || 'module_command';
    const configWithoutType = clone(cmd.config || {});
    delete configWithoutType.actionType;
    return `<div class="cmd-modal-backdrop" data-modal-backdrop><div class="cmd-modal" role="dialog" aria-modal="true">
      <div class="cmd-modal-head"><div><h3>${esc(state.modal.title)}</h3><p>${state.modal.mode === 'edit' ? 'Bearbeiten speichert immer diesen bestehenden Command per ID.' : 'Erstellt einen neuen Command mit Standardwerten.'}</p></div><button type="button" data-modal-close>×</button></div>
      <div class="cmd-modal-body">
        <section class="cmd-modal-section"><h4>Basis</h4><div class="cmd-form-grid"><label>${rowLabel('Trigger','Der Chat-Befehl ohne !, z. B. discord, test oder hug.')}<input data-cmd-modal-field="trigger" value="${esc(cmd.trigger || '')}" placeholder="test"></label><label>${rowLabel('Aliase','Weitere Auslöser für denselben Command, getrennt mit Komma oder Leerzeichen.')}<input data-cmd-modal-field="aliases" value="${esc(Array.isArray(cmd.aliases) ? cmd.aliases.join(', ') : '')}" placeholder="death, tod"></label><label>${rowLabel('Kategorie/Aktion','Normale Auswahl. Technische Details liegen unter Erweitert.')}<select data-cmd-modal-field="friendlyAction">${FRIENDLY_ACTIONS.map(a => `<option value="${a.id}" ${type === a.id || (a.id === 'advanced' && !['module_command','chat_message','sound_play','video_play'].includes(type)) ? 'selected' : ''}>${esc(a.icon)} ${esc(a.label)}</option>`).join('')}</select></label><label>${rowLabel('Rechte','Wer den Command im Chat ausführen darf.')}<select data-cmd-modal-field="permissionLevel">${['everyone','subscriber','vip','mod','streamer','owner'].map(level => `<option value="${level}" ${cmd.permissionLevel === level ? 'selected' : ''}>${level}</option>`).join('')}</select></label><label>${rowLabel('Global Cooldown ms','Pause für alle Nutzer nach Ausführung.')}<input type="number" min="0" data-cmd-modal-field="cooldownGlobalMs" value="${esc(cmd.cooldownGlobalMs ?? 1000)}"></label><label>${rowLabel('User Cooldown ms','Pause nur für denselben Nutzer.')}<input type="number" min="0" data-cmd-modal-field="cooldownUserMs" value="${esc(cmd.cooldownUserMs ?? 3000)}"></label><label class="cmd-check"><input type="checkbox" data-cmd-modal-field="enabled" ${cmd.enabled !== false ? 'checked' : ''}> Aktiv</label></div></section>
        <section class="cmd-modal-section"><h4>Aktion</h4>${renderActionFields(cmd)}</section>
        <details class="cmd-modal-section cmd-advanced"><summary>Erweitert / technische Details</summary><div class="cmd-form-grid"><label>Modul<input data-cmd-modal-field="moduleKey" value="${esc(cmd.moduleKey || '')}"></label><label>Action-Key<input data-cmd-modal-field="actionKey" value="${esc(cmd.actionKey || '')}"></label><label>Methode<select data-cmd-modal-field="targetMethod"><option value="POST" ${cmd.targetMethod !== 'GET' ? 'selected' : ''}>POST</option><option value="GET" ${cmd.targetMethod === 'GET' ? 'selected' : ''}>GET</option></select></label><label>Ziel-URL<input data-cmd-modal-field="targetUrl" value="${esc(cmd.targetUrl || '')}"></label><label>Response-Mode<input data-cmd-modal-field="responseMode" value="${esc(cmd.responseMode || 'module')}"></label></div><label>Config JSON<textarea data-cmd-modal-field="configJson" rows="7">${esc(JSON.stringify(configWithoutType, null, 2))}</textarea></label><p class="cmd-muted">„Nur Live“ ist bewusst nicht in der normalen UI. Wenn der Bot nicht im Channel ist, kommen keine Chatbefehle an.</p></details>
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
    root.innerHTML = `<div class="cmd-wrap cmd-v014">${renderHeader()}${state.error ? `<div class="cmd-error">${esc(state.error)}</div>` : ''}${state.notice ? `<div class="cmd-notice">${esc(state.notice)}</div>` : ''}${state.loading ? '<section class="cmd-card">Lade Commands...</section>' : `<div class="cmd-tabs">${tabs.map(([id,label]) => `<button type="button" class="${state.tab === id ? 'active' : ''}" data-cmd-tab="${id}">${esc(label)}</button>`).join('')}</div>${renderActiveTab()}`}${renderModal()}${renderConfirmDelete()}</div>`;
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
    root?.querySelector('[data-delete-from-modal]')?.addEventListener('click', () => { if (!state.modal) return; openDeleteConfirm({ id: state.modal.originalId, trigger: state.modal.originalTrigger }); });
    root?.querySelector('[data-confirm-delete-yes]')?.addEventListener('click', () => deleteConfirmed().catch(showError));
    root?.querySelector('[data-cmd-modal-field="friendlyAction"]')?.addEventListener('change', ev => { if (!state.modal) return; const action = ev.target.value || 'module_command'; state.modal.data.config = { ...(state.modal.data.config || {}), actionType: action === 'advanced' ? 'module_command' : action }; render(); });
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
