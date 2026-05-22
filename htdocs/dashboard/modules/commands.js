window.CommandsModule = (function(){
  'use strict';

  const api = {
    status: '/api/commands/status',
    list: '/api/commands/list',
    upsert: '/api/commands/upsert',
    delete: '/api/commands/delete',
    test: '/api/commands/test',
    execute: '/api/commands/execute',
    logs: '/api/commands/logs',
    presenceStatus: '/api/twitch/presence/status',
    presenceStart: '/api/twitch/presence/start',
    presenceStop: '/api/twitch/presence/stop'
  };

  const state = {
    tab: 'overview',
    loading: false,
    error: '',
    notice: '',
    status: null,
    list: null,
    logs: null,
    presence: null,
    selectedTrigger: '',
    testMessage: '!dcount show',
    testUser: 'forrestcgn',
    testRole: 'mod',
    testResult: null
  };

  let root = null;

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function commands() {
    const list = Array.isArray(state.list?.commands) ? state.list.commands : [];
    const fallback = Array.isArray(state.status?.commands) ? state.status.commands : [];
    return list.length ? list : fallback;
  }

  function logs() {
    const list = Array.isArray(state.logs?.logs) ? state.logs.logs : [];
    const fallback = Array.isArray(state.status?.recent) ? state.status.recent : [];
    return list.length ? list : fallback;
  }

  function activeCommands() {
    return commands().filter(cmd => cmd.enabled !== false);
  }

  function selectedCommand() {
    const list = commands();
    if (!list.length) return null;
    if (!state.selectedTrigger || !list.some(cmd => cmd.trigger === state.selectedTrigger)) {
      state.selectedTrigger = list[0].trigger;
    }
    return list.find(cmd => cmd.trigger === state.selectedTrigger) || list[0];
  }

  function pill(label, mode) {
    return `<span class="cmd-pill ${esc(mode || '')}">${esc(label)}</span>`;
  }

  function valueOrDash(value) {
    if (value === undefined || value === null || value === '') return '<span class="cmd-muted">-</span>';
    return esc(value);
  }

  function aliasText(cmd) {
    return Array.isArray(cmd?.aliases) ? cmd.aliases.join(', ') : '';
  }

  async function loadAll(force) {
    root = document.getElementById('commandsModule');
    if (!root || !window.CGN) return;
    if (!force && state.status && state.list && state.logs && state.presence) {
      render();
      return;
    }

    state.loading = true;
    state.error = '';
    render();

    try {
      const [status, list, logsRes, presence] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.list),
        window.CGN.api(`${api.logs}?limit=10`),
        window.CGN.api(api.presenceStatus).catch(err => ({ ok:false, error: err.message }))
      ]);
      state.status = status;
      state.list = list;
      state.logs = logsRes;
      state.presence = presence;
      state.loading = false;
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }

    render();
  }

  async function refreshOnly() {
    await loadAll(true);
  }

  function readEditor() {
    const get = name => root?.querySelector(`[data-cmd-field="${name}"]`);
    const enabled = !!get('enabled')?.checked;
    const liveOnly = !!get('liveOnly')?.checked;
    const trigger = String(get('trigger')?.value || '').trim();
    const aliases = String(get('aliases')?.value || '').trim();
    const moduleKey = String(get('moduleKey')?.value || '').trim();
    const actionKey = String(get('actionKey')?.value || '').trim();
    const targetMethod = String(get('targetMethod')?.value || 'POST').trim().toUpperCase();
    const targetUrl = String(get('targetUrl')?.value || '').trim();
    const permissionLevel = String(get('permissionLevel')?.value || 'everyone').trim();
    const cooldownGlobalMs = Number(get('cooldownGlobalMs')?.value || 0);
    const cooldownUserMs = Number(get('cooldownUserMs')?.value || 0);
    const responseMode = String(get('responseMode')?.value || 'module').trim();
    const configRaw = String(get('config')?.value || '{}').trim() || '{}';
    let config = {};
    try { config = JSON.parse(configRaw); } catch (err) { throw new Error(`Config-JSON ungültig: ${err.message}`); }
    return { trigger, aliases, moduleKey, actionKey, targetMethod, targetUrl, enabled, permissionLevel, cooldownGlobalMs, cooldownUserMs, liveOnly, responseMode, config };
  }

  async function saveCommand() {
    const payload = readEditor();
    if (!payload.trigger) throw new Error('Trigger fehlt.');
    await window.CGN.api(api.upsert, { method: 'POST', body: JSON.stringify(payload) });
    state.notice = `Command !${payload.trigger} gespeichert.`;
    state.selectedTrigger = payload.trigger.replace(/^[!./]+/, '').toLowerCase();
    await loadAll(true);
  }

  async function toggleCommand(trigger, enabled) {
    const cmd = commands().find(item => item.trigger === trigger);
    if (!cmd) return;
    await window.CGN.api(api.upsert, { method: 'POST', body: JSON.stringify({ ...cmd, enabled }) });
    state.notice = `Command !${trigger} ${enabled ? 'aktiviert' : 'deaktiviert'}.`;
    await loadAll(true);
  }

  async function duplicateCommand() {
    const cmd = selectedCommand();
    if (!cmd) return;
    const nextTrigger = `${cmd.trigger}_neu`;
    await window.CGN.api(api.upsert, { method: 'POST', body: JSON.stringify({ ...cmd, trigger: nextTrigger, aliases: [] }) });
    state.selectedTrigger = nextTrigger;
    state.notice = `Command !${nextTrigger} als Kopie angelegt.`;
    await loadAll(true);
  }

  async function deleteSelectedCommand() {
    const cmd = selectedCommand();
    if (!cmd) return;
    if (!window.confirm(`Command !${cmd.trigger} wirklich löschen?`)) return;
    await window.CGN.api(api.delete, { method: 'POST', body: JSON.stringify({ trigger: cmd.trigger }) });
    state.notice = `Command !${cmd.trigger} gelöscht.`;
    state.selectedTrigger = '';
    await loadAll(true);
  }

  async function runCommandTest(execute) {
    const message = String(root?.querySelector('[data-test-message]')?.value || state.testMessage || '').trim();
    const user = String(root?.querySelector('[data-test-user]')?.value || state.testUser || 'forrestcgn').trim();
    const role = String(root?.querySelector('[data-test-role]')?.value || state.testRole || 'mod').trim();
    state.testMessage = message;
    state.testUser = user;
    state.testRole = role;
    const target = execute ? api.execute : api.test;
    const url = `${target}?message=${encodeURIComponent(message)}&user=${encodeURIComponent(user)}&role=${encodeURIComponent(role)}`;
    state.testResult = await window.CGN.api(url);
    state.notice = execute ? 'Command ausgeführt.' : 'Command-Test ausgeführt.';
    await loadAll(true);
    state.tab = 'diagnostics';
    render();
  }

  async function presenceStart() {
    const res = await window.CGN.api(api.presenceStart);
    state.notice = res.ok ? 'Twitch-Presence gestartet.' : 'Twitch-Presence Start geprüft.';
    await loadAll(true);
  }

  async function presenceStop() {
    const res = await window.CGN.api(api.presenceStop);
    state.notice = res.ok ? 'Twitch-Presence gestoppt.' : 'Twitch-Presence Stop geprüft.';
    await loadAll(true);
  }

  function renderOverview() {
    const st = state.status || {};
    const stats = st.stats || {};
    const presence = state.presence || {};
    const connected = !!(presence.connected && presence.joined);
    return `
      <div class="cmd-grid cmd-grid-main">
        <section class="cmd-card cmd-card-main">
          <div class="cmd-headline">
            <div><h3>Übersicht</h3><p>Nur Status und Schnellaktionen. Verwaltung, Logs und Diagnose liegen in eigenen Tabs.</p></div>
            ${pill(st.enabled ? 'Command-System aktiv' : 'Command-System aus', st.enabled ? 'ok' : 'warn')}
          </div>
          <div class="cmd-kpis">
            <div><strong>${esc(activeCommands().length)}</strong><span>aktive Commands</span></div>
            <div><strong>${esc(commands().length)}</strong><span>gesamt</span></div>
            <div><strong>${esc(stats.executed || 0)}</strong><span>seit Neustart ausgeführt</span></div>
            <div><strong>${esc(stats.failed || 0)}</strong><span>Fehler</span></div>
          </div>
          <div class="cmd-info-list">
            <div><span>Core-Step</span><strong>${esc(st.step || '-')}</strong></div>
            <div><span>Prefix</span><strong>${esc(st.prefix || '!')}</strong></div>
            <div><span>Schema</span><strong>${st.schemaOk ? 'OK' : esc(st.schemaError || 'Fehler')}</strong></div>
            <div><span>Letzter Fehler</span><strong>${valueOrDash(stats.lastError)}</strong></div>
            <div><span>Letzter Command</span><strong>${valueOrDash(stats.lastCommand?.rawMessage || '')}</strong></div>
          </div>
        </section>
        <section class="cmd-card">
          <div class="cmd-headline compact"><div><h3>Twitch-Presence</h3><p>Ohne aktive Presence kommen keine echten Chatbefehle im Backend an.</p></div>${pill(connected ? 'verbunden' : 'nicht verbunden', connected ? 'ok' : 'bad')}</div>
          <div class="cmd-info-list small">
            <div><span>Bot</span><strong>${valueOrDash(presence.bot_username)}</strong></div>
            <div><span>Channel</span><strong>${valueOrDash(presence.channel)}</strong></div>
            <div><span>desired</span><strong>${String(!!presence.desiredActive)}</strong></div>
            <div><span>joined</span><strong>${String(!!presence.joined)}</strong></div>
            <div><span>lastError</span><strong>${valueOrDash(presence.last_error)}</strong></div>
          </div>
          <div class="cmd-actions"><button type="button" data-presence-start>Presence starten</button><button type="button" data-presence-stop>Presence stoppen</button></div>
        </section>
      </div>
      <section class="cmd-card">
        <div class="cmd-headline"><div><h3>Letzte Logs</h3><p>Nur die letzten 5 Einträge. Vollständige Ansicht im Tab Logs.</p></div><button type="button" data-cmd-tab-jump="logs">Logs öffnen</button></div>
        ${renderLogsTable(logs().slice(0, 5))}
      </section>`;
  }

  function renderCommandList() {
    const list = commands();
    return `<div class="cmd-side-list">${list.map(cmd => `
      <button type="button" class="cmd-side-item ${cmd.trigger === state.selectedTrigger ? 'active' : ''}" data-select-command="${esc(cmd.trigger)}">
        <span><strong>!${esc(cmd.trigger)}</strong><small>${esc(cmd.moduleKey || '')}${cmd.actionKey ? ` / ${esc(cmd.actionKey)}` : ''}</small></span>
        ${cmd.enabled ? pill('aktiv', 'ok') : pill('aus', 'warn')}
      </button>`).join('') || '<div class="cmd-empty">Keine Commands vorhanden.</div>'}</div>`;
  }

  function renderManage() {
    const cmd = selectedCommand() || { trigger:'', aliases:[], moduleKey:'', actionKey:'', targetMethod:'POST', targetUrl:'', enabled:true, permissionLevel:'everyone', cooldownGlobalMs:0, cooldownUserMs:0, liveOnly:false, responseMode:'module', config:{} };
    const configText = JSON.stringify(cmd.config || {}, null, 2);
    return `
      <div class="cmd-manage-layout">
        <section class="cmd-card cmd-side-card">
          <div class="cmd-headline compact"><div><h3>Commands</h3><p>Auswahl links, Details rechts.</p></div></div>
          ${renderCommandList()}
          <div class="cmd-actions stack"><button type="button" data-new-command>Neuen Command vorbereiten</button><button type="button" data-duplicate-command>Kopieren</button></div>
        </section>
        <section class="cmd-card">
          <div class="cmd-headline"><div><h3>Command bearbeiten</h3><p>Speichert über /api/commands/upsert. Änderungen sind sofort live.</p></div><div class="cmd-actions"><button type="button" data-save-command>Speichern</button><button type="button" class="danger" data-delete-command>Löschen</button></div></div>
          <div class="cmd-form-grid">
            <label>Trigger <input data-cmd-field="trigger" value="${esc(cmd.trigger)}" placeholder="rip"></label>
            <label>Aliase <input data-cmd-field="aliases" value="${esc(aliasText(cmd))}" placeholder="death, tod"></label>
            <label>Modul <input data-cmd-field="moduleKey" value="${esc(cmd.moduleKey || '')}" placeholder="deathcounter_v2"></label>
            <label>Action <input data-cmd-field="actionKey" value="${esc(cmd.actionKey || '')}" placeholder="command"></label>
            <label>Methode <select data-cmd-field="targetMethod"><option value="POST" ${cmd.targetMethod === 'POST' ? 'selected' : ''}>POST</option><option value="GET" ${cmd.targetMethod === 'GET' ? 'selected' : ''}>GET</option></select></label>
            <label>Ziel-URL <input data-cmd-field="targetUrl" value="${esc(cmd.targetUrl || '')}" placeholder="/api/deathcounter/v2/command"></label>
            <label>Rechte <select data-cmd-field="permissionLevel">${['everyone','subscriber','vip','mod','streamer','owner'].map(level => `<option value="${level}" ${cmd.permissionLevel === level ? 'selected' : ''}>${level}</option>`).join('')}</select></label>
            <label>Response <input data-cmd-field="responseMode" value="${esc(cmd.responseMode || 'module')}"></label>
            <label>Global Cooldown ms <input type="number" min="0" data-cmd-field="cooldownGlobalMs" value="${esc(cmd.cooldownGlobalMs || 0)}"></label>
            <label>User Cooldown ms <input type="number" min="0" data-cmd-field="cooldownUserMs" value="${esc(cmd.cooldownUserMs || 0)}"></label>
            <label class="cmd-check"><input type="checkbox" data-cmd-field="enabled" ${cmd.enabled !== false ? 'checked' : ''}> Aktiv</label>
            <label class="cmd-check"><input type="checkbox" data-cmd-field="liveOnly" ${cmd.liveOnly ? 'checked' : ''}> Nur live</label>
          </div>
          <label class="cmd-json-label">Config JSON<textarea data-cmd-field="config" spellcheck="false">${esc(configText)}</textarea></label>
        </section>
      </div>`;
  }

  function renderPermissions() {
    const list = commands();
    return `<section class="cmd-card"><div class="cmd-headline"><div><h3>Rechte & Cooldowns</h3><p>Kompakte Massenübersicht. Details im Verwaltungs-Tab ändern.</p></div></div>
      <div class="cmd-table-wrap"><table class="cmd-table"><thead><tr><th>Command</th><th>Rechte</th><th>Global</th><th>User</th><th>Live only</th><th>Status</th><th>Aktion</th></tr></thead><tbody>${list.map(cmd => `
        <tr><td><strong>!${esc(cmd.trigger)}</strong></td><td>${esc(cmd.permissionLevel || 'everyone')}</td><td>${esc(cmd.cooldownGlobalMs || 0)} ms</td><td>${esc(cmd.cooldownUserMs || 0)} ms</td><td>${cmd.liveOnly ? 'Ja' : 'Nein'}</td><td>${cmd.enabled ? pill('aktiv','ok') : pill('aus','warn')}</td><td><button type="button" data-select-and-edit="${esc(cmd.trigger)}">Bearbeiten</button></td></tr>`).join('')}</tbody></table></div>
    </section>`;
  }

  function renderLogsTable(list) {
    if (!list.length) return '<div class="cmd-empty">Noch keine Logs vorhanden.</div>';
    return `<div class="cmd-table-wrap"><table class="cmd-table"><thead><tr><th>ID</th><th>Zeit</th><th>Command</th><th>User</th><th>Message</th><th>Status</th><th>Fehler</th></tr></thead><tbody>${list.map(row => `
      <tr><td>${esc(row.id)}</td><td>${esc(row.createdAt || '')}</td><td><strong>!${esc(row.trigger || '')}</strong></td><td>${esc(row.userDisplayName || row.userLogin || '')}</td><td><code>${esc(row.rawMessage || '')}</code></td><td>${row.success ? pill('ok','ok') : row.ignored ? pill('ignoriert','warn') : pill('fehler','bad')}</td><td>${valueOrDash(row.error)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function renderLogs() {
    return `<section class="cmd-card"><div class="cmd-headline"><div><h3>Logs</h3><p>Letzte Command-Ausführungen aus command_execution_log.</p></div><button type="button" data-cmd-refresh>Aktualisieren</button></div>${renderLogsTable(logs())}</section>`;
  }

  function renderDiagnostics() {
    const presence = state.presence || {};
    const st = state.status || {};
    return `
      <div class="cmd-grid">
        <section class="cmd-card">
          <div class="cmd-headline"><div><h3>Command testen</h3><p>Test parst nur. Execute führt wirklich aus.</p></div></div>
          <div class="cmd-test-row">
            <label>Message <input data-test-message value="${esc(state.testMessage)}"></label>
            <label>User <input data-test-user value="${esc(state.testUser)}"></label>
            <label>Rolle <select data-test-role>${['everyone','subscriber','vip','mod','streamer','owner'].map(role => `<option value="${role}" ${state.testRole === role ? 'selected' : ''}>${role}</option>`).join('')}</select></label>
          </div>
          <div class="cmd-actions"><button type="button" data-run-test>Dry-Run testen</button><button type="button" data-run-execute>Wirklich ausführen</button></div>
          ${state.testResult ? `<details open><summary>Letztes Testergebnis</summary><pre class="cmd-json">${esc(JSON.stringify(state.testResult, null, 2))}</pre></details>` : ''}
        </section>
        <section class="cmd-card">
          <div class="cmd-headline"><div><h3>Diagnose</h3><p>Rohdaten nur aufklappbar, damit die Seite übersichtlich bleibt.</p></div></div>
          <div class="cmd-info-list small"><div><span>Schema</span><strong>${st.schemaOk ? 'OK' : esc(st.schemaError || 'Fehler')}</strong></div><div><span>Presence</span><strong>${presence.connected && presence.joined ? 'verbunden' : 'nicht verbunden'}</strong></div><div><span>Bot</span><strong>${valueOrDash(presence.bot_username)}</strong></div></div>
          <details><summary>Command-Status Rohdaten</summary><pre class="cmd-json">${esc(JSON.stringify(st, null, 2))}</pre></details>
          <details><summary>Twitch-Presence Rohdaten</summary><pre class="cmd-json">${esc(JSON.stringify(presence, null, 2))}</pre></details>
        </section>
      </div>`;
  }

  function renderActiveTab() {
    if (state.tab === 'manage') return renderManage();
    if (state.tab === 'permissions') return renderPermissions();
    if (state.tab === 'logs') return renderLogs();
    if (state.tab === 'diagnostics') return renderDiagnostics();
    return renderOverview();
  }

  function render() {
    root = document.getElementById('commandsModule');
    if (!root) return;
    const tabs = [
      ['overview', 'Übersicht'],
      ['manage', 'Command-Verwaltung'],
      ['permissions', 'Rechte & Cooldowns'],
      ['logs', 'Logs'],
      ['diagnostics', 'Diagnose']
    ];

    root.innerHTML = `
      <div class="cmd-wrap">
        <section class="cmd-card cmd-hero">
          <div><h2>⌨️ Commands</h2><p>Zentrales Chat-Command-System. Streamer.bot soll hier Schritt für Schritt ersetzt werden.</p></div>
          <div class="cmd-actions"><button type="button" data-cmd-refresh>Aktualisieren</button></div>
        </section>
        ${state.error ? `<div class="cmd-error">${esc(state.error)}</div>` : ''}
        ${state.notice ? `<div class="cmd-notice">${esc(state.notice)}</div>` : ''}
        ${state.loading ? '<section class="cmd-card">Lade Commands...</section>' : `<div class="cmd-tabs">${tabs.map(([id, label]) => `<button type="button" class="${state.tab === id ? 'active' : ''}" data-cmd-tab="${id}">${esc(label)}</button>`).join('')}</div>${renderActiveTab()}`}
      </div>`;
    bind();
  }

  function bind() {
    root?.querySelectorAll('[data-cmd-tab]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.cmdTab || 'overview'; state.error = ''; state.notice = ''; render(); }));
    root?.querySelectorAll('[data-cmd-tab-jump]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.cmdTabJump || 'overview'; render(); }));
    root?.querySelectorAll('[data-cmd-refresh]').forEach(btn => btn.addEventListener('click', () => refreshOnly().catch(showError)));
    root?.querySelectorAll('[data-presence-start]').forEach(btn => btn.addEventListener('click', () => presenceStart().catch(showError)));
    root?.querySelectorAll('[data-presence-stop]').forEach(btn => btn.addEventListener('click', () => presenceStop().catch(showError)));
    root?.querySelectorAll('[data-select-command]').forEach(btn => btn.addEventListener('click', () => { state.selectedTrigger = btn.dataset.selectCommand || ''; render(); }));
    root?.querySelectorAll('[data-select-and-edit]').forEach(btn => btn.addEventListener('click', () => { state.selectedTrigger = btn.dataset.selectAndEdit || ''; state.tab = 'manage'; render(); }));
    root?.querySelector('[data-save-command]')?.addEventListener('click', () => saveCommand().catch(showError));
    root?.querySelector('[data-delete-command]')?.addEventListener('click', () => deleteSelectedCommand().catch(showError));
    root?.querySelector('[data-duplicate-command]')?.addEventListener('click', () => duplicateCommand().catch(showError));
    root?.querySelector('[data-new-command]')?.addEventListener('click', () => { state.selectedTrigger = '__new__'; renderNewCommand(); });
    root?.querySelectorAll('[data-run-test]').forEach(btn => btn.addEventListener('click', () => runCommandTest(false).catch(showError)));
    root?.querySelectorAll('[data-run-execute]').forEach(btn => btn.addEventListener('click', () => runCommandTest(true).catch(showError)));
  }

  function renderNewCommand() {
    const fallback = commands()[0] || {};
    state.list = { commands: [{ ...fallback, id: 0, trigger: '', aliases: [], enabled: true, permissionLevel: 'everyone', cooldownGlobalMs: 1000, cooldownUserMs: 3000, config: { createdFromDashboard: true } }, ...commands()] };
    state.selectedTrigger = '';
    render();
  }

  function showError(err) {
    state.error = err.message || String(err);
    render();
  }

  window.addEventListener('cgn:module-show', ev => { if (ev.detail?.module === 'commands') loadAll(false); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { root = document.getElementById('commandsModule'); });
  else root = document.getElementById('commandsModule');

  return { loadAll, render };
})();
