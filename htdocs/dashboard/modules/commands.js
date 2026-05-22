window.CommandsModule = (function(){
  'use strict';

  const api = {
    status: '/api/commands/status',
    list: '/api/commands/list',
    upsert: '/api/commands/upsert',
    logs: '/api/commands/logs?limit=20',
    history: '/api/commands/history?limit=20',
    test: '/api/commands/test',
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
    status: null,
    list: [],
    logs: [],
    presence: null,
    testMessage: '!dcount show',
    testUser: 'forrestcgn',
    testRole: 'mod',
    testResult: null
  };

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function bool(v){ return v === true || v === 1 || String(v).toLowerCase() === 'true'; }
  function fmt(v){ return v === undefined || v === null || v === '' ? '-' : String(v); }
  function pill(label, ok){ return `<span class="cmd-pill ${ok ? 'ok' : 'warn'}">${esc(label)}</span>`; }
  function commands(){ return Array.isArray(state.list) ? state.list : []; }
  function logs(){ return Array.isArray(state.logs) ? state.logs : []; }

  async function loadAll(force){
    root = document.getElementById('commandsModule');
    if (!root || !window.CGN) return;
    if (!force && state.status) { render(); return; }
    state.loading = true;
    state.error = '';
    render();
    try {
      const [statusRes, listRes, logsRes, presenceRes] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.list),
        window.CGN.api(api.logs).catch(() => window.CGN.api(api.history).catch(() => ({ logs: [] }))),
        window.CGN.api(api.presenceStatus).catch(err => ({ ok:false, error:err.message }))
      ]);
      state.status = statusRes;
      state.list = listRes.commands || statusRes.commands || [];
      state.logs = logsRes.logs || statusRes.recent || [];
      state.presence = presenceRes;
      state.loading = false;
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }
    render();
  }

  function rowValue(trigger, field, fallback){
    const el = root?.querySelector(`[data-cmd-trigger="${CSS.escape(trigger)}"][data-cmd-field="${field}"]`);
    if (!el) return fallback;
    if (el.type === 'checkbox') return el.checked;
    if (field === 'aliases') return String(el.value || '').split(',').map(v => v.trim().replace(/^[!./]+/, '').toLowerCase()).filter(Boolean);
    if (field === 'cooldownGlobalMs' || field === 'cooldownUserMs') return Number(el.value || 0);
    return String(el.value || '').trim();
  }

  async function saveCommand(trigger){
    const item = commands().find(c => c.trigger === trigger);
    if (!item) throw new Error(`Command nicht gefunden: ${trigger}`);
    const payload = {
      trigger: rowValue(trigger, 'trigger', item.trigger),
      aliases: rowValue(trigger, 'aliases', item.aliases || []),
      moduleKey: rowValue(trigger, 'moduleKey', item.moduleKey),
      actionKey: rowValue(trigger, 'actionKey', item.actionKey),
      targetMethod: rowValue(trigger, 'targetMethod', item.targetMethod || 'POST'),
      targetUrl: rowValue(trigger, 'targetUrl', item.targetUrl),
      enabled: rowValue(trigger, 'enabled', item.enabled),
      permissionLevel: rowValue(trigger, 'permissionLevel', item.permissionLevel || 'everyone'),
      cooldownGlobalMs: rowValue(trigger, 'cooldownGlobalMs', item.cooldownGlobalMs || 0),
      cooldownUserMs: rowValue(trigger, 'cooldownUserMs', item.cooldownUserMs || 0),
      liveOnly: item.liveOnly || false,
      responseMode: item.responseMode || 'module',
      config: item.config || {}
    };
    await window.CGN.api(api.upsert, { method:'POST', body: JSON.stringify(payload) });
    state.notice = `Command !${payload.trigger} gespeichert.`;
    await loadAll(true);
  }

  async function toggleCommand(trigger){
    const item = commands().find(c => c.trigger === trigger);
    if (!item) return;
    await window.CGN.api(api.upsert, { method:'POST', body: JSON.stringify({ ...item, enabled: !item.enabled }) });
    state.notice = `Command !${trigger} ${item.enabled ? 'deaktiviert' : 'aktiviert'}.`;
    await loadAll(true);
  }

  async function callPresence(action){
    const url = action === 'start' ? api.presenceStart : api.presenceStop;
    await window.CGN.api(url);
    state.notice = action === 'start' ? 'Twitch-Presence gestartet.' : 'Twitch-Presence gestoppt.';
    await loadAll(true);
  }

  async function runTest(execute){
    const msgEl = root?.querySelector('[data-cmd-test-message]');
    const userEl = root?.querySelector('[data-cmd-test-user]');
    const roleEl = root?.querySelector('[data-cmd-test-role]');
    state.testMessage = String(msgEl?.value || state.testMessage || '').trim();
    state.testUser = String(userEl?.value || state.testUser || 'testuser').trim();
    state.testRole = String(roleEl?.value || state.testRole || 'everyone').trim();
    const params = new URLSearchParams({ message: state.testMessage, user: state.testUser, role: state.testRole });
    const result = await window.CGN.api(`${execute ? api.execute : api.test}?${params.toString()}`);
    state.testResult = result;
    state.notice = execute ? 'Command ausgeführt.' : 'Dry-Run ausgeführt.';
    await loadAll(true);
    state.testResult = result;
    render();
  }

  function renderStatus(){
    const st = state.status || {};
    const stats = st.stats || {};
    const presence = state.presence || {};
    const presenceOk = !!presence.connected && !!presence.joined;
    return `<div class="cmd-grid">
      <section class="cmd-card cmd-main-card">
        <div class="cmd-headline"><div><h3>Command-System</h3><p>Backend-Core, Registry, Logs und Twitch-Chat-Empfang.</p></div>${pill(st.enabled ? 'aktiv' : 'inaktiv', !!st.enabled)}</div>
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
          <div><span>Letzter Command</span><strong>${esc(stats.lastCommandAt || '-')}</strong></div>
        </div>
      </section>
      <section class="cmd-card">
        <div class="cmd-headline"><div><h3>Twitch-Presence</h3><p>Ohne aktive Presence werden echte Twitch-Chatbefehle nicht empfangen.</p></div>${pill(presenceOk ? 'verbunden' : 'getrennt', presenceOk)}</div>
        <div class="cmd-info-list compact">
          <div><span>desiredActive</span><strong>${esc(presence.desiredActive)}</strong></div>
          <div><span>connected</span><strong>${esc(presence.connected)}</strong></div>
          <div><span>authenticated</span><strong>${esc(presence.authenticated)}</strong></div>
          <div><span>joined</span><strong>${esc(presence.joined)}</strong></div>
          <div><span>Bot</span><strong>${esc(presence.bot_username || '-')}</strong></div>
          <div><span>Channel</span><strong>${esc(presence.channel || '-')}</strong></div>
        </div>
        <div class="cmd-actions"><button type="button" data-presence-start>Presence starten</button><button type="button" data-presence-stop>Presence stoppen</button></div>
      </section>
    </div>`;
  }

  function renderCommandRow(item){
    const trigger = item.trigger || '';
    const aliases = Array.isArray(item.aliases) ? item.aliases.join(', ') : '';
    const perms = ['everyone','subscriber','vip','mod','streamer','owner'];
    return `<article class="cmd-row">
      <div class="cmd-row-title"><strong>!${esc(trigger)}</strong>${pill(item.enabled ? 'aktiv' : 'aus', !!item.enabled)}</div>
      <div class="cmd-row-grid">
        <label>Trigger <input data-cmd-trigger="${esc(trigger)}" data-cmd-field="trigger" value="${esc(trigger)}"></label>
        <label>Aliase <input data-cmd-trigger="${esc(trigger)}" data-cmd-field="aliases" value="${esc(aliases)}" placeholder="alias1, alias2"></label>
        <label>Modul <input data-cmd-trigger="${esc(trigger)}" data-cmd-field="moduleKey" value="${esc(item.moduleKey || '')}"></label>
        <label>Action <input data-cmd-trigger="${esc(trigger)}" data-cmd-field="actionKey" value="${esc(item.actionKey || '')}"></label>
        <label>Methode <select data-cmd-trigger="${esc(trigger)}" data-cmd-field="targetMethod"><option value="POST" ${item.targetMethod === 'POST' ? 'selected' : ''}>POST</option><option value="GET" ${item.targetMethod === 'GET' ? 'selected' : ''}>GET</option></select></label>
        <label>Ziel-URL <input data-cmd-trigger="${esc(trigger)}" data-cmd-field="targetUrl" value="${esc(item.targetUrl || '')}"></label>
        <label>Rechte <select data-cmd-trigger="${esc(trigger)}" data-cmd-field="permissionLevel">${perms.map(p => `<option value="${p}" ${String(item.permissionLevel || 'everyone') === p ? 'selected' : ''}>${p}</option>`).join('')}</select></label>
        <label>Global-CD ms <input type="number" min="0" data-cmd-trigger="${esc(trigger)}" data-cmd-field="cooldownGlobalMs" value="${esc(item.cooldownGlobalMs || 0)}"></label>
        <label>User-CD ms <input type="number" min="0" data-cmd-trigger="${esc(trigger)}" data-cmd-field="cooldownUserMs" value="${esc(item.cooldownUserMs || 0)}"></label>
        <label class="cmd-check"><input type="checkbox" data-cmd-trigger="${esc(trigger)}" data-cmd-field="enabled" ${item.enabled ? 'checked' : ''}> Aktiv</label>
      </div>
      <div class="cmd-actions"><button type="button" data-save-command="${esc(trigger)}">Speichern</button><button type="button" data-toggle-command="${esc(trigger)}">${item.enabled ? 'Deaktivieren' : 'Aktivieren'}</button></div>
    </article>`;
  }

  function renderCommands(){
    return `<section class="cmd-card"><div class="cmd-headline"><div><h3>Registry</h3><p>Konfigurierbare Chatbefehle. Änderungen werden in der DB gespeichert.</p></div><button type="button" data-cmd-refresh>Aktualisieren</button></div><div class="cmd-list">${commands().map(renderCommandRow).join('')}</div>${commands().length ? '' : '<div class="cmd-empty">Keine Commands vorhanden.</div>'}</section>`;
  }

  function renderTester(){
    return `<section class="cmd-card"><div class="cmd-headline"><div><h3>Testcenter</h3><p>Dry-Run prüft Parsing und Payload. Ausführen triggert das Zielmodul wirklich.</p></div></div>
      <div class="cmd-test-grid">
        <label>Message <input data-cmd-test-message value="${esc(state.testMessage)}"></label>
        <label>User <input data-cmd-test-user value="${esc(state.testUser)}"></label>
        <label>Rolle <select data-cmd-test-role><option value="everyone" ${state.testRole === 'everyone' ? 'selected' : ''}>everyone</option><option value="vip" ${state.testRole === 'vip' ? 'selected' : ''}>vip</option><option value="mod" ${state.testRole === 'mod' ? 'selected' : ''}>mod</option><option value="streamer" ${state.testRole === 'streamer' ? 'selected' : ''}>streamer</option></select></label>
      </div>
      <div class="cmd-actions"><button type="button" data-command-dryrun>Dry-Run</button><button type="button" data-command-execute>Ausführen</button></div>
      ${state.testResult ? `<details open><summary>Testergebnis</summary><pre class="cmd-json">${esc(JSON.stringify(state.testResult, null, 2))}</pre></details>` : ''}
    </section>`;
  }

  function renderLogs(){
    return `<section class="cmd-card"><div class="cmd-headline"><div><h3>Logs</h3><p>Letzte Command-Ausführungen aus command_execution_log.</p></div><button type="button" data-cmd-refresh>Aktualisieren</button></div>
      <div class="cmd-log-list">${logs().map(log => `<article><strong>!${esc(log.trigger)}</strong><span>${esc(log.createdAt || '')}</span><small>${esc(log.userDisplayName || log.userLogin || '')} · ${log.success ? 'success' : log.ignored ? 'ignored' : 'failed'}${log.error ? ' · ' + esc(log.error) : ''}</small><code>${esc(log.rawMessage || '')}</code></article>`).join('')}</div>
      ${logs().length ? '' : '<div class="cmd-empty">Keine Logs vorhanden.</div>'}
    </section>`;
  }

  function render(){
    root = document.getElementById('commandsModule');
    if (!root) return;
    root.innerHTML = `<div class="cmd-wrap">
      <section class="cmd-card cmd-hero"><div><h2>⌨️ Commands</h2><p>Zentrale Chat-Command-Verwaltung. Ziel: Streamer.bot-Command-Routing schrittweise ersetzen.</p></div><div class="cmd-actions"><button type="button" data-cmd-refresh>Aktualisieren</button></div></section>
      ${state.error ? `<div class="cmd-error">${esc(state.error)}</div>` : ''}
      ${state.notice ? `<div class="cmd-notice">${esc(state.notice)}</div>` : ''}
      ${state.loading ? '<section class="cmd-card">Lade Commands...</section>' : `${renderStatus()}${renderCommands()}${renderTester()}${renderLogs()}`}
    </div>`;
    bind();
  }

  function bind(){
    root?.querySelectorAll('[data-cmd-refresh]').forEach(btn => btn.addEventListener('click', () => loadAll(true)));
    root?.querySelector('[data-presence-start]')?.addEventListener('click', () => callPresence('start').catch(showError));
    root?.querySelector('[data-presence-stop]')?.addEventListener('click', () => callPresence('stop').catch(showError));
    root?.querySelectorAll('[data-save-command]').forEach(btn => btn.addEventListener('click', () => saveCommand(btn.dataset.saveCommand).catch(showError)));
    root?.querySelectorAll('[data-toggle-command]').forEach(btn => btn.addEventListener('click', () => toggleCommand(btn.dataset.toggleCommand).catch(showError)));
    root?.querySelector('[data-command-dryrun]')?.addEventListener('click', () => runTest(false).catch(showError));
    root?.querySelector('[data-command-execute]')?.addEventListener('click', () => runTest(true).catch(showError));
  }

  function showError(err){ state.error = err.message || String(err); render(); }

  window.addEventListener('cgn:module-show', ev => { if (ev.detail?.module === 'commands') loadAll(false); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { root = document.getElementById('commandsModule'); });
  else root = document.getElementById('commandsModule');

  return { loadAll, render };
})();
