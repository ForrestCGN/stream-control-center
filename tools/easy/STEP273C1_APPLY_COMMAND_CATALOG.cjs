#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const backendFile = path.join(root, 'backend', 'modules', 'commands.js');
const dashboardFile = path.join(root, 'htdocs', 'dashboard', 'modules', 'commands.js');

function read(file) {
  if (!fs.existsSync(file)) throw new Error(`Datei nicht gefunden: ${file}`);
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function patchBackend() {
  let src = read(backendFile);
  let changed = false;

  if (!src.includes('STEP273C1_COMMAND_CATALOG')) {
    const marker = "const DEFAULT_TARGET_PORT = 8080;\n";
    if (!src.includes(marker)) throw new Error('Backend-Patch fehlgeschlagen: DEFAULT_TARGET_PORT Marker nicht gefunden.');

    const catalog = `
const STEP273C1_COMMAND_CATALOG = [
  {
    id: 'deathcounter',
    label: 'Deathcounter',
    icon: '💀',
    description: 'Deathcounter V2 Chat-Commands und Overlay-Steuerung.',
    actions: [
      {
        id: 'deathcounter.rip',
        categoryId: 'deathcounter',
        icon: '💀',
        label: 'RIP erhöhen',
        description: 'Erhöht den Tod-Zähler für den genannten Spieler.',
        moduleKey: 'deathcounter_v2',
        actionKey: 'command',
        targetMethod: 'POST',
        targetUrl: '/api/deathcounter/v2/command',
        defaultTrigger: 'rip',
        defaultAliases: ['death', 'tod'],
        permissionLevel: 'everyone',
        cooldownGlobalMs: 1000,
        cooldownUserMs: 3000,
        responseMode: 'module',
        config: { actionType: 'module_command', moduleCommand: 'rip', defaultArgs: [] },
        examples: ['!rip @ForrestCGN']
      },
      {
        id: 'deathcounter.tode',
        categoryId: 'deathcounter',
        icon: '📊',
        label: 'Tode anzeigen',
        description: 'Gibt Deathcounter-Statistiken aus.',
        moduleKey: 'deathcounter_v2',
        actionKey: 'command',
        targetMethod: 'POST',
        targetUrl: '/api/deathcounter/v2/command',
        defaultTrigger: 'tode',
        defaultAliases: ['deaths'],
        permissionLevel: 'everyone',
        cooldownGlobalMs: 1000,
        cooldownUserMs: 3000,
        responseMode: 'module',
        config: { actionType: 'module_command', moduleCommand: 'tode', defaultArgs: [] },
        examples: ['!tode', '!tode @ForrestCGN']
      },
      {
        id: 'deathcounter.dcount',
        categoryId: 'deathcounter',
        icon: '🛠️',
        label: 'Deathcounter Admin',
        description: 'Admin-/Mod-Command fuer Show, Hide, Reset, Add, Remove und Replace.',
        moduleKey: 'deathcounter_v2',
        actionKey: 'command',
        targetMethod: 'POST',
        targetUrl: '/api/deathcounter/v2/command',
        defaultTrigger: 'dcount',
        defaultAliases: ['deathcount', 'deathcounter'],
        permissionLevel: 'mod',
        cooldownGlobalMs: 1000,
        cooldownUserMs: 2500,
        responseMode: 'module',
        config: { actionType: 'module_command', moduleCommand: 'dcount', defaultArgs: [] },
        examples: ['!dcount show', '!dcount hide', '!dcount replace @alt @neu']
      },
      {
        id: 'deathcounter.show',
        categoryId: 'deathcounter',
        icon: '👁️',
        label: 'Overlay anzeigen',
        description: 'Zeigt das Deathcounter-Overlay an. Nutzt intern dcount show.',
        moduleKey: 'deathcounter_v2',
        actionKey: 'command',
        targetMethod: 'POST',
        targetUrl: '/api/deathcounter/v2/command',
        defaultTrigger: 'dcshow',
        defaultAliases: ['showdc'],
        permissionLevel: 'mod',
        cooldownGlobalMs: 1000,
        cooldownUserMs: 2500,
        responseMode: 'module',
        config: { actionType: 'module_command', moduleCommand: 'dcount', defaultArgs: ['show'] },
        examples: ['!dcshow']
      },
      {
        id: 'deathcounter.hide',
        categoryId: 'deathcounter',
        icon: '🙈',
        label: 'Overlay verstecken',
        description: 'Versteckt das Deathcounter-Overlay. Nutzt intern dcount hide.',
        moduleKey: 'deathcounter_v2',
        actionKey: 'command',
        targetMethod: 'POST',
        targetUrl: '/api/deathcounter/v2/command',
        defaultTrigger: 'dchide',
        defaultAliases: ['hidedc'],
        permissionLevel: 'mod',
        cooldownGlobalMs: 1000,
        cooldownUserMs: 2500,
        responseMode: 'module',
        config: { actionType: 'module_command', moduleCommand: 'dcount', defaultArgs: ['hide'] },
        examples: ['!dchide']
      }
    ]
  },
  {
    id: 'community',
    label: 'Community',
    icon: '👥',
    description: 'Vorbereitete Community-Module. Werden erweitert, wenn die Module in den Command-Catalog aufgenommen werden.',
    actions: [
      {
        id: 'community.hug.prepared',
        categoryId: 'community',
        icon: '🤗',
        label: 'Hug-System vorbereiten',
        description: 'Platzhalter fuer Hug/Rehug. Der echte Modul-Command wird in einem spaeteren Step angebunden.',
        moduleKey: 'hug',
        actionKey: 'command',
        targetMethod: 'POST',
        targetUrl: '',
        defaultTrigger: 'hug',
        defaultAliases: [],
        permissionLevel: 'everyone',
        cooldownGlobalMs: 1000,
        cooldownUserMs: 5000,
        responseMode: 'module',
        config: { actionType: 'module_command', catalogStatus: 'prepared' },
        examples: ['!hug @User']
      }
    ]
  },
  {
    id: 'content',
    label: 'Content / Clips',
    icon: '✂️',
    description: 'Clip- und Content-nahe Commands.',
    actions: [
      {
        id: 'content.clip.prepared',
        categoryId: 'content',
        icon: '✂️',
        label: 'Clip erstellen vorbereiten',
        description: 'Platzhalter fuer Clip-Command. Die echte Modul-Route wird spaeter aus dem Clip-Modul uebernommen.',
        moduleKey: 'clips',
        actionKey: 'command',
        targetMethod: 'POST',
        targetUrl: '',
        defaultTrigger: 'clip',
        defaultAliases: [],
        permissionLevel: 'everyone',
        cooldownGlobalMs: 1000,
        cooldownUserMs: 10000,
        responseMode: 'module',
        config: { actionType: 'module_command', catalogStatus: 'prepared' },
        examples: ['!clip', '!clip eigener Titel']
      }
    ]
  },
  {
    id: 'notes',
    label: 'Tagebuch / Todo',
    icon: '📝',
    description: 'Tagebuch- und Todo-Module.',
    actions: [
      {
        id: 'notes.tagebuch.prepared',
        categoryId: 'notes',
        icon: '📖',
        label: 'Tagebuch-Eintrag vorbereiten',
        description: 'Platzhalter fuer Tagebuch-Command.',
        moduleKey: 'tagebuch',
        actionKey: 'command',
        targetMethod: 'POST',
        targetUrl: '',
        defaultTrigger: 'tagebuch',
        defaultAliases: ['tb'],
        permissionLevel: 'mod',
        cooldownGlobalMs: 1000,
        cooldownUserMs: 5000,
        responseMode: 'module',
        config: { actionType: 'module_command', catalogStatus: 'prepared' },
        examples: ['!tagebuch Text']
      },
      {
        id: 'notes.todo.prepared',
        categoryId: 'notes',
        icon: '✅',
        label: 'Todo vorbereiten',
        description: 'Platzhalter fuer Todo-Command.',
        moduleKey: 'todo',
        actionKey: 'command',
        targetMethod: 'POST',
        targetUrl: '',
        defaultTrigger: 'todo',
        defaultAliases: [],
        permissionLevel: 'mod',
        cooldownGlobalMs: 1000,
        cooldownUserMs: 5000,
        responseMode: 'module',
        config: { actionType: 'module_command', catalogStatus: 'prepared' },
        examples: ['!todo Text']
      }
    ]
  },
  {
    id: 'system',
    label: 'System / Medien',
    icon: '🧩',
    description: 'Vorbereitete Systemaktionen. Medien werden ab STEP274 zentral verwaltet.',
    actions: [
      {
        id: 'system.sound.prepared',
        categoryId: 'system',
        icon: '🔊',
        label: 'Sound-System vorbereiten',
        description: 'Platzhalter fuer Sound-System Commands.',
        moduleKey: 'sound_system',
        actionKey: 'play',
        targetMethod: 'POST',
        targetUrl: '',
        defaultTrigger: 'sound',
        defaultAliases: [],
        permissionLevel: 'mod',
        cooldownGlobalMs: 1000,
        cooldownUserMs: 5000,
        responseMode: 'module',
        config: { actionType: 'module_command', catalogStatus: 'prepared' },
        examples: ['!sound key']
      }
    ]
  }
];

function buildCommandCatalog() {
  const categories = STEP273C1_COMMAND_CATALOG.map(category => ({
    id: category.id,
    label: category.label,
    icon: category.icon || '🧩',
    description: category.description || '',
    actions: (category.actions || []).map(action => ({ ...action, categoryId: action.categoryId || category.id }))
  }));
  const actions = categories.flatMap(category => category.actions.map(action => ({ ...action, categoryId: category.id, categoryLabel: category.label })));
  return {
    ok: true,
    module: MODULE_NAME,
    version: 1,
    step: 'STEP273C1',
    note: 'Neue Module sollen ihren Command-Catalog pflegen oder hier zentral ergänzt werden.',
    categories,
    actions,
    updatedAt: nowIso()
  };
}

`;
    src = src.replace(marker, marker + catalog);
    changed = true;
  }

  if (src.includes("step: 'STEP273A1'")) {
    src = src.replace("step: 'STEP273A1'", "step: 'STEP273C1'");
    changed = true;
  }

  if (!src.includes("moduleCatalog: buildCommandCatalog()")) {
    const marker = "commands: listCommands({ includeDisabled: true }),\n    recent:";
    if (src.includes(marker)) {
      src = src.replace(marker, "commands: listCommands({ includeDisabled: true }),\n    moduleCatalog: buildCommandCatalog(),\n    recent:");
      changed = true;
    }
  }

  if (!src.includes("path: `${API_PREFIX}/catalog`")) {
    const marker = "    { method: 'GET', path: `${API_PREFIX}/list`, purpose: 'Alle konfigurierten Commands auflisten' },\n";
    if (!src.includes(marker)) throw new Error('Backend-Patch fehlgeschlagen: buildRoutes Marker nicht gefunden.');
    src = src.replace(marker, marker + "    { method: 'GET', path: `${API_PREFIX}/catalog`, purpose: 'Modul-Command-Catalog fuer Dashboard-Dropdowns' },\n");
    changed = true;
  }

  if (!src.includes("app.get(`${API_PREFIX}/catalog`")) {
    const marker = "  app.get(`${API_PREFIX}/list`, (req, res) => {\n    try { return res.json(core.ok({ commands: listCommands({ includeDisabled: bool(core.getParam(req, 'includeDisabled', true), true) }) })); }\n    catch (err) { return res.status(500).json(core.fail(err.message || String(err))); }\n  });\n\n";
    if (!src.includes(marker)) throw new Error('Backend-Patch fehlgeschlagen: /list route Marker nicht gefunden.');
    src = src.replace(marker, marker + "  app.get(`${API_PREFIX}/catalog`, (req, res) => {\n    try { return res.json(buildCommandCatalog()); }\n    catch (err) { return res.status(500).json(core.fail(err.message || String(err))); }\n  });\n\n");
    changed = true;
  }

  if (!src.includes("moduleCommand = cleanText(command.config?.moduleCommand")) {
    const old = "function buildTargetPayload(command, parsedCommand, user, source = {}) {\n  const rawInput = `${parsedCommand.trigger}${parsedCommand.args.length ? ` ${parsedCommand.args.join(' ')}` : ''}`.trim();\n  const payload = {\n    command: command.trigger,\n    cmd: command.trigger,\n    rawInput,\n    input: rawInput,\n    rawMessage: parsedCommand.rawMessage,\n    message: parsedCommand.rawMessage,\n    args: parsedCommand.args,\n";
    const replacement = "function buildTargetPayload(command, parsedCommand, user, source = {}) {\n  const config = command.config && typeof command.config === 'object' ? command.config : {};\n  const moduleCommand = cleanText(config.moduleCommand || config.internalCommand || command.trigger) || command.trigger;\n  const defaultArgs = Array.isArray(config.defaultArgs) ? config.defaultArgs.map(item => String(item || '').trim()).filter(Boolean) : [];\n  const effectiveArgs = parsedCommand.args.length ? parsedCommand.args : defaultArgs;\n  const rawInput = `${moduleCommand}${effectiveArgs.length ? ` ${effectiveArgs.join(' ')}` : ''}`.trim();\n  const payload = {\n    command: moduleCommand,\n    cmd: moduleCommand,\n    rawInput,\n    input: rawInput,\n    rawMessage: parsedCommand.rawMessage,\n    message: parsedCommand.rawMessage,\n    args: effectiveArgs,\n";
    if (!src.includes(old)) throw new Error('Backend-Patch fehlgeschlagen: buildTargetPayload Marker nicht gefunden.');
    src = src.replace(old, replacement);
    src = src.replace("  parsedCommand.args.slice(0, 10).forEach((arg, index) => {", "  effectiveArgs.slice(0, 10).forEach((arg, index) => {");
    changed = true;
  }

  if (changed) write(backendFile, src);
  return changed;
}

function patchDashboard() {
  let src = read(dashboardFile);
  let changed = false;

  if (!src.includes("catalog: '/api/commands/catalog'")) {
    src = src.replace("logs: '/api/commands/logs',\n    presenceStatus:", "logs: '/api/commands/logs',\n    catalog: '/api/commands/catalog',\n    presenceStatus:");
    changed = true;
  }
  if (!src.includes("catalog: null")) {
    src = src.replace("logs: null,\n    presence:", "logs: null,\n    catalog: null,\n    selectedCatalogCategory: '',\n    presence:");
    changed = true;
  }
  if (src.includes("state.status && state.list && state.logs && state.presence")) {
    src = src.replace("state.status && state.list && state.logs && state.presence", "state.status && state.list && state.logs && state.catalog && state.presence");
    changed = true;
  }
  if (src.includes("const [status, list, logsRes, presence] = await Promise.all([")) {
    src = src.replace("const [status, list, logsRes, presence] = await Promise.all([\n        window.CGN.api(api.status),\n        window.CGN.api(api.list),\n        window.CGN.api(`${api.logs}?limit=10`),\n        window.CGN.api(api.presenceStatus).catch(err => ({ ok:false, error: err.message }))\n      ]);",
      "const [status, list, logsRes, catalog, presence] = await Promise.all([\n        window.CGN.api(api.status),\n        window.CGN.api(api.list),\n        window.CGN.api(`${api.logs}?limit=10`),\n        window.CGN.api(api.catalog).catch(err => ({ ok:false, categories:[], actions:[], error: err.message })),\n        window.CGN.api(api.presenceStatus).catch(err => ({ ok:false, error: err.message }))\n      ]);");
    src = src.replace("state.logs = logsRes;\n      state.presence = presence;", "state.logs = logsRes;\n      state.catalog = catalog;\n      state.presence = presence;");
    changed = true;
  }

  if (!src.includes("function catalogCategories()")) {
    const marker = "  function actionMeta(type) {\n    return ACTION_TYPES.find(item => item.id === normalizeActionType(type)) || ACTION_TYPES[0];\n  }\n\n";
    if (!src.includes(marker)) throw new Error('Dashboard-Patch fehlgeschlagen: actionMeta Marker nicht gefunden.');
    src = src.replace(marker, marker + `  function catalogCategories() {
    return Array.isArray(state.catalog?.categories) ? state.catalog.categories : [];
  }

  function catalogActions() {
    return Array.isArray(state.catalog?.actions) ? state.catalog.actions : [];
  }

  function catalogActionById(id) {
    const clean = String(id || '').trim();
    if (!clean) return null;
    return catalogActions().find(action => action.id === clean) || null;
  }

  function categoryForCatalogAction(actionId) {
    const action = catalogActionById(actionId);
    if (action?.categoryId) return action.categoryId;
    for (const category of catalogCategories()) {
      if ((category.actions || []).some(item => item.id === actionId)) return category.id;
    }
    return '';
  }

  function selectedCatalogCategory(cmd) {
    const fromCommand = categoryForCatalogAction(cmd?.config?.catalogActionId || '');
    if (fromCommand) {
      state.selectedCatalogCategory = fromCommand;
      return fromCommand;
    }
    const categories = catalogCategories();
    if (state.selectedCatalogCategory && categories.some(category => category.id === state.selectedCatalogCategory)) {
      return state.selectedCatalogCategory;
    }
    state.selectedCatalogCategory = categories[0]?.id || '';
    return state.selectedCatalogCategory;
  }

  function catalogActionsForCategory(categoryId) {
    const category = catalogCategories().find(item => item.id === categoryId);
    if (category && Array.isArray(category.actions)) return category.actions;
    return catalogActions().filter(action => action.categoryId === categoryId);
  }

  function selectedCatalogActionId(cmd) {
    const configured = String(cmd?.config?.catalogActionId || '').trim();
    if (configured && catalogActionById(configured)) return configured;
    const actions = catalogActionsForCategory(selectedCatalogCategory(cmd));
    return actions[0]?.id || '';
  }

  function applyCatalogActionDefaults(actionId) {
    const action = catalogActionById(actionId);
    if (!action) throw new Error('Keine Modul-Aktion ausgewählt.');
    const current = selectedCommand() || {};
    const nextConfig = {
      ...(current.config || {}),
      ...(action.config || {}),
      actionType: 'module_command',
      catalogActionId: action.id
    };
    const next = {
      ...current,
      trigger: action.defaultTrigger || current.trigger || '',
      aliases: Array.isArray(action.defaultAliases) ? action.defaultAliases : (current.aliases || []),
      moduleKey: action.moduleKey || current.moduleKey || '',
      actionKey: action.actionKey || current.actionKey || 'command',
      targetMethod: action.targetMethod || current.targetMethod || 'POST',
      targetUrl: action.targetUrl || current.targetUrl || '',
      permissionLevel: action.permissionLevel || current.permissionLevel || 'everyone',
      cooldownGlobalMs: Number(action.cooldownGlobalMs ?? current.cooldownGlobalMs ?? 1000),
      cooldownUserMs: Number(action.cooldownUserMs ?? current.cooldownUserMs ?? 3000),
      responseMode: action.responseMode || current.responseMode || 'module',
      config: nextConfig
    };

    const list = commands();
    const replaced = list.some(cmd => cmd.trigger === current.trigger);
    state.list = { commands: replaced ? list.map(cmd => cmd.trigger === current.trigger ? next : cmd) : [next, ...list] };
    state.selectedTrigger = next.trigger || current.trigger || '';
    state.selectedCatalogCategory = action.categoryId || state.selectedCatalogCategory;
    state.notice = \`Defaults übernommen: \${action.label || action.id}\`;
    render();
  }

`);
    changed = true;
  }

  if (!src.includes("cmd-catalog-box")) {
    const old = "return `<div class=\"cmd-action-box\"><h4>${type === 'http_request' ? '🌐 HTTP / API aufrufen' : '🧩 Modul-Command'}</h4><p class=\"cmd-help\">Diese Action nutzt die technische Ziel-URL im Bereich „Erweitert\". Für bestehende Module wie Deathcounter bleibt das aktuell der stabile Weg.</p></div>`;";
    const replacement = `if (type === 'module_command') {
      const categoryId = selectedCatalogCategory(cmd);
      const categories = catalogCategories();
      const actions = catalogActionsForCategory(categoryId);
      const actionId = selectedCatalogActionId(cmd);
      const action = catalogActionById(actionId);
      const examples = Array.isArray(action?.examples) ? action.examples : [];
      return \`<div class="cmd-action-box cmd-catalog-box">
        <h4>🧩 Modul-Command</h4>
        <div class="cmd-form-grid">
          <label>Kategorie
            <select data-catalog-category>\${categories.map(category => \`<option value="\${esc(category.id)}" \${category.id === categoryId ? 'selected' : ''}>\${esc(category.icon || '🧩')} \${esc(category.label || category.id)}</option>\`).join('')}</select>
          </label>
          <label>Modul-Aktion
            <select data-catalog-action>\${actions.map(item => \`<option value="\${esc(item.id)}" \${item.id === actionId ? 'selected' : ''}>\${esc(item.icon || '🧩')} \${esc(item.label || item.id)}</option>\`).join('')}</select>
          </label>
        </div>
        <div class="cmd-catalog-info">
          <div><span>Modul</span><strong>\${valueOrDash(action?.moduleKey || cmd.moduleKey)}</strong></div>
          <div><span>URL</span><strong>\${valueOrDash(action?.targetUrl || cmd.targetUrl)}</strong></div>
          <div><span>Beispiel</span><strong>\${examples.length ? esc(examples.join(' · ')) : valueOrDash('')}</strong></div>
          <div><span>Hinweis</span><strong>\${valueOrDash(action?.description || 'Katalog auswählen und Defaults übernehmen.')}</strong></div>
        </div>
        <div class="cmd-actions">\${iconButton('↩️', 'Defaults übernehmen', 'data-apply-catalog-defaults')}</div>
        <p class="cmd-help">Neue Module sollen künftig ihren Modul-Command-Katalog pflegen. Bis dahin wird der zentrale Catalog im Command-System erweitert.</p>
      </div>\`;
    }

    return \`<div class="cmd-action-box"><h4>🌐 HTTP / API aufrufen</h4><p class="cmd-help">Technischer API-Aufruf. Ziel-URL, Methode und Zusatzdaten liegen unter „Erweitert“.</p></div>\`;`;
    if (!src.includes(old)) throw new Error('Dashboard-Patch fehlgeschlagen: Modul-Command Action-Box Marker nicht gefunden.');
    src = src.replace(old, replacement);
    changed = true;
  }

  if (!src.includes("data-catalog-category")) {
    throw new Error('Dashboard-Patch fehlgeschlagen: Catalog-UI wurde nicht eingefügt.');
  }

  if (!src.includes("data-apply-catalog-defaults")) {
    throw new Error('Dashboard-Patch fehlgeschlagen: Apply-Button fehlt nach Patch.');
  }

  if (!src.includes("root?.querySelector('[data-catalog-category]'")) {
    const marker = "    root?.querySelector('[data-action-type-select]')?.addEventListener('change', () => {";
    if (!src.includes(marker)) throw new Error('Dashboard-Patch fehlgeschlagen: Bind-Marker nicht gefunden.');
    const bind = `    root?.querySelector('[data-catalog-category]')?.addEventListener('change', ev => {
      state.selectedCatalogCategory = ev.target.value || '';
      render();
    });
    root?.querySelector('[data-catalog-action]')?.addEventListener('change', ev => {
      const action = catalogActionById(ev.target.value);
      if (action?.categoryId) state.selectedCatalogCategory = action.categoryId;
      render();
    });
    root?.querySelector('[data-apply-catalog-defaults]')?.addEventListener('click', () => {
      const actionId = root?.querySelector('[data-catalog-action]')?.value || '';
      try { applyCatalogActionDefaults(actionId); } catch (err) { showError(err); }
    });
`;
    src = src.replace(marker, bind + marker);
    changed = true;
  }

  if (changed) write(dashboardFile, src);
  return changed;
}

try {
  const backendChanged = patchBackend();
  const dashboardChanged = patchDashboard();
  console.log(`[STEP273C1] Backend geändert: ${backendChanged ? 'ja' : 'nein / bereits aktuell'}`);
  console.log(`[STEP273C1] Dashboard geändert: ${dashboardChanged ? 'ja' : 'nein / bereits aktuell'}`);
  console.log('[STEP273C1] Fertig.');
} catch (err) {
  console.error('[STEP273C1] Fehler:', err.message || err);
  process.exit(1);
}
