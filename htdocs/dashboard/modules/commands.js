window.CommandsModule = (function(){
  'use strict';

  const api = {
    status: '/api/commands/status',
    list: '/api/commands/list',
    logs: '/api/commands/logs',
    upsert: '/api/commands/upsert',
    delete: '/api/commands/delete',
    execute: '/api/commands/execute',
    presenceStatus: '/api/twitch/presence/status',
    presenceStart: '/api/twitch/presence/start',
    presenceStop: '/api/twitch/presence/stop'
  };

  let root = null;
  let state = {
    loading: false,
    error: '',
    notice: '',
    tab: 'overview',
    status: null,
    list: null,
    logs: null,
    presence: null,
    testMessage: '!dcount show',
    testUser: 'forrestcgn',
    testRole: 'mod',
    lastTest: null
  };

  function esc(value){
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function boolLabel(value){ return value ? 'Aktiv' : 'Inaktiv'; }
  function clean(value){ return String(value ?? '').trim(); }
  function commands(){
    if (Array.isArray(state.list?.commands)) return state.list.commands;
    if (Array.isArray(state.status?.commands)) return state.status.commands;
    return [];
  }
  function logs(){ return Array.isArray(state.logs?.logs) ? state.logs.logs : (Array.isArray(state.status?.recent) ? state.status.recent : []); }
  function presenceConnected(){ return !!(state.presence?.desiredActive && state.presence?.connected && state.presence?.authenticated && state.presence?.joined); }
  function pill(label, mode){ return `<span class="cmd-pill ${mode || ''}">${esc(label)}</span>`; }

  async function loadAll(force){
    root = document.getElementById('commandsModule');
    if (!root || !window.CGN) return;
    if (!force && state.status && state.list && state.logs && state.presence) { render(); return; }
    state.loading = true;
    state.error = '';
    render();
    try {
      const [statusRes, listRes, logsRes, presenceRes] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.list),
        window.CGN.api(`${api.logs}?limit=20`),
        window.CGN.api(api.presenceStatus).catch(err => ({ ok:false, error:err.message || String(err) }))
      ]);
      state.status = statusRes;
      state.list = listRes;
      state.logs = logsRes;
      state.presence = presenceRes;
      state.loading = false;
      state.error = '';
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }
    render();
  }

  function commandField(id, field){
    return root?.querySelector(`[data-command-id="${CSS.escape(String(id))}"][data-command-field="${CSS.escape(field)}"]`);
  }

  function commandFromInputs(command){
    const id = command.id;
    const get = field => clean(commandField(id, field)?.value);
    const checked = field => !!commandField(id, field)?.checked;
    const aliases = get('aliases').split(/[\s,;]+/).map(v => v.trim().replace(/^[!./]+/, '').toLowerCase()).filter(Boolean);
    let config = command.config || {};
    const configRaw = get('config');
    if (configRaw) {
      try { config = JSON.parse(configRaw); }
      catch (err) { throw new Error(`Config-JSON bei !${command.trigger} ist ungültig: ${err.message}`); }
    }
    return {
      trigger: get('trigger').replace(/^[!./]+/, '').toLowerCase(),
      aliases,
      moduleKey: get('moduleKey'),
      actionKey: get('actionKey'),
      targetMethod: get('targetMethod') || 'POST',
      targetUrl: get('targetUrl'),
      enabled: checked('enabled'),
      permissionLevel: get('permissionLevel') || 'everyone',
      cooldownGlobalMs: Number(get('cooldownGlobalMs') || 0),
      cooldownUserMs: Number(get('cooldownUserMs') || 0),
      liveOnly: checked('liveOnly'),
      responseMode: get('responseMode') || 'module',
      config
    };
  }

  async function saveCommand(command){
    const payload = commandFromInputs(command);
    await window.CGN.api(api.upsert, { method:'POST', body: JSON.stringify(payload) });
    state.notice = `!${payload.trigger} gespeichert.`;
    await loadAll(true);
  }

  async function toggleCommand(command){
    const payload = { ...command, enabled: !command.enabled };
    await window.CGN.api(api.upsert, { method:'POST', body: JSON.stringify(payload) });
    state.notice = `!${command.trigger} ${payload.enabled ? 'aktiviert' : 'deaktiviert'}.`;
    await loadAll(true);
  }

  async function deleteCommand(command){
    if (!window.confirm(`Command !${command.trigger} wirklich löschen?`)) return;
    await window.CGN.api(api.delete, { method:'POST', body: JSON.stringify({ id: command.id }) });
    state.notice = `!${command.trigger} gelöscht.`;
    await loadAll(true);
  }

  async function addCommand(){
    const existing = commands();
    let index = existing.length + 1;
    let trigger = `command${index}`;
    const used = new Set(existing.map(item => item.trigger));
    while (used.has(trigger)) { index += 1; trigger = `command${index}`; }
    await window.CGN.api(api.upsert, { method:'POST', body: JSON.stringify({
      trigger,
      aliases: [],
      moduleKey: '',
      actionKey: '',
      targetMethod: 'POST',
      targetUrl: '',
      enabled: false,
      permissionLevel: 'mod',
      cooldownGlobalMs: 1000,
      cooldownUserMs: 3000,
      liveOnly: false,
      responseMode: 'module',
      config: { createdFromDashboard: true }
    }) });
    state.notice = `!${trigger} angelegt. Bitte Ziel-URL setzen und aktivieren.`;
    state.tab = 'commands';
    await loadAll(true);
  }

  async function runTest(dryRun){
    const message = clean(root?.querySelector('[data-cmd-test-message]')?.value || state.testMessage || '');
    const user = clean(root?.querySelector('[data-cmd-test-user]')?.value || state.testUser || 'forrestcgn');
    const role = clean(root?.querySelector('[data-cmd-test-role]')?.value || state.testRole || 'mod');
    state.testMessage = message;
    state.testUser = user;
    state.testRole = role;
    if (!message) throw new Error('Bitte Testnachricht eintragen.');
    const endpoint = dryRun ? '/api/commands/test' : api.execute;
    const result = await window.CGN.api(`${endpoint}?message=${encodeURIComponent(message)}&user=${encodeURIComponent(user)}&role=${encodeURIComponent(role)}`);
    state.lastTest = result;
    state.notice = dryRun ? 'Command-Test ausgeführt.' : 'Command ausgeführt.';
    await loadAll(true);
    state.lastTest = result;
    render();
  }

  async function startPresence(){
    const result = await window.CGN.api(api.presenceStart);
    state.notice = result.ok ? 'Twitch-Presence gestartet.' : 'Twitch-Presence Start geprüft.';
    await loadAll(true);
  }

  async function stopPresence(){
    const result = await window.CGN.api(api.presenceStop);
    state.notice = result.ok ? 'Twitch-Presence gestoppt.' : 'Twitch-Presence Stop geprüft.';
    await loadAll(true);
  }

  function renderOverview(){
    const st = state.status || {};
    const stats = st.stats || {};
    const presence = state.presence || {};
    const connected = presenceConnected();
    return `
      <div class="cmd-grid">
        <section class="cmd-card cmd-main-card">
          <div class="cmd-headline">
            <div><h3>Command-Core</h3><p>Registry, Routing und letzte Ausführung.</p></div>
            ${pill(st.enabled ? 'Core aktiv' : 'Core aus', st.enabled ? 'ok' : 'warn')}
          </div>
          <div class="cmd-kpis">
            <div><strong>${esc(stats.handled ?? 0)}</strong><span>handled</span></div>
            <div><strong>${esc(stats.executed ?? 0)}</strong><span>executed</span></div>
            <div><strong>${esc(stats.ignored ?? 0)}</strong><span>ignored</span></div>
            <div><strong>${esc(stats.failed ?? 0)}</strong><span>failed</span></div>
          </div>
          <div class="cmd-info-list">
            <div><span>Step</span><strong>${esc(st.step || '-')}</strong></div>
            <div><span>Prefix</span><strong>${esc(st.prefix || '!')}</strong></div>
            <div><span>Schema</span><strong>${st.schemaOk ? 'OK' : esc(st.schemaError || 'Fehler')}</strong></div>
            <div><span>Letzter Fehler</span><strong>${esc(stats.lastError || '-')}</strong></div>
            <div><span>Letzter Command</span><strong>${esc(stats.lastCommand?.rawMessage || stats.lastCommandAt || '-')}</strong></div>
          </div>
        </section>
        <section class="cmd-card">
          <div class="cmd-headline">
            <div><h3>Twitch-Presence</h3><p>Der Chat-Hook funktioniert nur, wenn Presence verbunden ist.</p></div>
            ${pill(connected ? 'verbunden' : 'nicht verbunden', connected ? 'ok' : 'warn')}
          </div>
          <div class="cmd-info-list compact">
            <div><span>desired</span><strong>${boolLabel(!!presence.desiredActive)}</strong></div>
            <div><span>connected</span><strong>${boolLabel(!!presence.connected)}</strong></div>
            <div><span>auth</span><strong>${boolLabel(!!presence.authenticated)}</strong></div>
            <div><span>joined</span><strong>${boolLabel(!!presence.joined)}</strong></div>
            <div><span>Bot</span><strong>${esc(presence.bot_username || '-')} → ${esc(presence.channel || '-')}</strong></div>
          </div>
          <div class="cmd-actions"><button type="button" data-presence-start>Presence starten</button><button type="button" data-presence-stop>Stop</button><button type="button" data-cmd-refresh>Aktualisieren</button></div>
        </section>
      </div>`;
  }

  function renderCommandCard(command){
    const aliases = Array.isArray(command.aliases) ? command.aliases.join(', ') : '';
    const configText = JSON.stringify(command.config || {}, null, 2);
    const permissions = ['everyone', 'subscriber', 'vip', 'mod', 'streamer', 'owner'];
    return `
      <article class="cmd-command-card">
        <div class="cmd-command-title">
          <div><strong>!${esc(command.trigger)}</strong><small>${esc(command.moduleKey || '-')} / ${esc(command.actionKey || '-')}</small></div>
          <label class="cmd-check"><input type="checkbox" data-command-id="${esc(command.id)}" data-command-field="enabled" ${command.enabled ? 'checked' : ''}> Aktiv</label>
        </div>
        <div class="cmd-command-grid">
          <label>Trigger <input data-command-id="${esc(command.id)}" data-command-field="trigger" value="${esc(command.trigger)}"></label>
          <label>Aliase <input data-command-id="${esc(command.id)}" data-command-field="aliases" value="${esc(aliases)}"></label>
          <label>Modul <input data-command-id="${esc(command.id)}" data-command-field="moduleKey" value="${esc(command.moduleKey)}"></label>
          <label>Action <input data-command-id="${esc(command.id)}" data-command-field="actionKey" value="${esc(command.actionKey)}"></label>
          <label>Methode <select data-command-id="${esc(command.id)}" data-command-field="targetMethod"><option value="POST" ${command.targetMethod === 'POST' ? 'selected' : ''}>POST</option><option value="GET" ${command.targetMethod === 'GET' ? 'selected' : ''}>GET</option></select></label>
          <label>Ziel-URL <input data-command-id="${esc(command.id)}" data-command-field="targetUrl" value="${esc(command.targetUrl)}"></label>
          <label>Rechte <select data-command-id="${esc(command.id)}" data-command-field="permissionLevel">${permissions.map(level => `<option value="${esc(level)}" ${command.permissionLevel === level ? 'selected' : ''}>${esc(level)}</option>`).join('')}</select></label>
          <label>Antwort <input data-command-id="${esc(command.id)}" data-command-field="responseMode" value="${esc(command.responseMode || 'module')}"></label>
          <label>Global-CD ms <input type="number" min="0" data-command-id="${esc(command.id)}" data-command-field="cooldownGlobalMs" value="${esc(command.cooldownGlobalMs || 0)}"></label>
          <label>User-CD ms <input type="number" min="0" data-command-id="${esc(command.id)}" data-command-field="cooldownUserMs" value="${esc(command.cooldownUserMs || 0)}"></label>
          <label class="cmd-check field"><input type="checkbox" data-command-id="${esc(command.id)}" data-command-field="liveOnly" ${command.liveOnly ? 'checked' : ''}> Live only</label>
        </div>
        <label class="cmd-config-label">Config JSON <textarea data-command-id="${esc(command.id)}" data-command-field="config" spellcheck="false">${esc(configText)}</textarea></label>
        <div class="cmd-actions"><button type="button" data-save-command="${esc(command.id)}">Speichern</button><button type="button" data-toggle-command="${esc(command.id)}">${command.enabled ? 'Deaktivieren' : 'Aktivieren'}</button><button type="button" class="danger" data-delete-command="${esc(command.id)}">Löschen</button></div>
      </article>`;
  }

  function renderCommands(){
    const list = commands();
    return `<section class="cmd-card"><div class="cmd-headline"><div><h3>Commands</h3><p>Konfiguration wird über Backend-API in der Datenbank gespeichert.</p></div><div class="cmd-actions"><button type="button" data-add-command>Command hinzufügen</button><button type="button" data-cmd-refresh>Aktualisieren</button></div></div><div class="cmd-command-list">${list.map(renderCommandCard).join('')}</div>${!list.length ? '<div class="cmd-empty">Keine Commands vorhanden.</div>' : ''}</section>`;
  }

  function renderTester(){
    return `<section class="cmd-card"><div class="cmd-headline"><div><h3>Testcenter</h3><p>DryRun zeigt Zielpayload. Ausführen ruft das echte Zielmodul auf.</p></div><button type="button" data-cmd-refresh>Logs aktualisieren</button></div>
      <div class="cmd-test-grid">
        <label>Nachricht <input data-cmd-test-message value="${esc(state.testMessage)}" placeholder="!dcount show"></label>
        <label>User <input data-cmd-test-user value="${esc(state.testUser)}" placeholder="forrestcgn"></label>
        <label>Rolle <select data-cmd-test-role>${['everyone','subscriber','vip','mod','streamer','owner'].map(role => `<option value="${esc(role)}" ${state.testRole === role ? 'selected' : ''}>${esc(role)}</option>`).join('')}</select></label>
      </div>
      <div class="cmd-actions"><button type="button" data-command-dryrun>DryRun</button><button type="button" data-command-execute>Ausführen</button></div>
      ${state.lastTest ? `<details open><summary>Letztes Testergebnis</summary><pre class="cmd-json">${esc(JSON.stringify(state.lastTest, null, 2))}</pre></details>` : ''}
    </section>`;
  }

  function renderLogs(){
    const list = logs();
    return `<section class="cmd-card"><div class="cmd-headline"><div><h3>Logs</h3><p>Letzte Command-Ausführungen aus command_execution_log.</p></div><button type="button" data-cmd-refresh>Aktualisieren</button></div>
      <div class="cmd-log-list">${list.map(log => `<article class="cmd-log-row ${log.success ? 'ok' : log.ignored ? 'warn' : 'bad'}"><div><strong>${esc(log.rawMessage || `!${log.trigger}`)}</strong><small>${esc(log.createdAt || '')} · ${esc(log.userLogin || '-')} · ${esc(log.moduleKey || '-')}</small></div><span>${log.success ? 'OK' : log.ignored ? `IGNORED ${esc(log.error || '')}` : `ERROR ${esc(log.error || '')}`}</span></article>`).join('')}</div>${!list.length ? '<div class="cmd-empty">Noch keine Logs.</div>' : ''}</section>`;
  }

  function render(){
    root = document.getElementById('commandsModule');
    if (!root) return;
    const tabs = [['overview','Übersicht'], ['commands','Commands'], ['tester','Testcenter'], ['logs','Logs']];
    root.innerHTML = `
      <div class="cmd-wrap">
        <section class="cmd-card cmd-hero"><div><h2>⌨️ Command-System</h2><p>Zentrale Chat-Befehle für Node-Module. Ziel: Streamer.bot schrittweise ersetzen.</p></div><div class="cmd-actions"><button type="button" data-cmd-refresh>Aktualisieren</button></div></section>
        ${state.error ? `<div class="cmd-error">${esc(state.error)}</div>` : ''}
        ${state.notice ? `<div class="cmd-notice">${esc(state.notice)}</div>` : ''}
        ${state.loading ? '<div class="cmd-card">Lade Command-System...</div>' : `<div class="cmd-tabs">${tabs.map(([id,label]) => `<button type="button" class="${state.tab === id ? 'active' : ''}" data-cmd-tab="${id}">${esc(label)}</button>`).join('')}</div>${state.tab === 'commands' ? renderCommands() : state.tab === 'tester' ? renderTester() : state.tab === 'logs' ? renderLogs() : renderOverview()}`}
      </div>`;
    bind();
  }

  function bind(){
    root?.querySelectorAll('[data-cmd-tab]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.cmdTab || 'overview'; state.notice = ''; render(); }));
    root?.querySelectorAll('[data-cmd-refresh]').forEach(btn => btn.addEventListener('click', () => loadAll(true)));
    root?.querySelector('[data-presence-start]')?.addEventListener('click', () => startPresence().catch(showError));
    root?.querySelector('[data-presence-stop]')?.addEventListener('click', () => stopPresence().catch(showError));
    root?.querySelector('[data-add-command]')?.addEventListener('click', () => addCommand().catch(showError));
    root?.querySelectorAll('[data-save-command]').forEach(btn => btn.addEventListener('click', () => {
      const command = commands().find(item => String(item.id) === String(btn.dataset.saveCommand));
      if (command) saveCommand(command).catch(showError);
    }));
    root?.querySelectorAll('[data-toggle-command]').forEach(btn => btn.addEventListener('click', () => {
      const command = commands().find(item => String(item.id) === String(btn.dataset.toggleCommand));
      if (command) toggleCommand(command).catch(showError);
    }));
    root?.querySelectorAll('[data-delete-command]').forEach(btn => btn.addEventListener('click', () => {
      const command = commands().find(item => String(item.id) === String(btn.dataset.deleteCommand));
      if (command) deleteCommand(command).catch(showError);
    }));
    root?.querySelector('[data-command-dryrun]')?.addEventListener('click', () => runTest(true).catch(showError));
    root?.querySelector('[data-command-execute]')?.addEventListener('click', () => runTest(false).catch(showError));
  }

  function showError(err){ state.error = err.message || String(err); render(); }

  window.addEventListener('cgn:module-show', ev => { if (ev.detail?.module === 'commands') loadAll(false); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { root = document.getElementById('commandsModule'); });
  else root = document.getElementById('commandsModule');

  return { loadAll, render };
})();
