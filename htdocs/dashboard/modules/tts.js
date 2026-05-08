window.TTSModule = (function(){
  'use strict';

  const api = {
    status: '/api/tts/status',
    config: '/api/tts/config',
    voices: '/api/tts/voices',
    routes: '/api/tts/routes',
    settings: '/api/tts/admin/settings',
    stats: '/api/tts/stats',
    statsUsers: '/api/tts/stats/users',
    events: '/api/tts/events',
    say: '/api/tts/say',
    reload: '/api/tts/reload',
    on: '/api/tts/on',
    off: '/api/tts/off',
    stop: '/api/tts/stop',
    clear: '/api/tts/clear'
  };

  let root = null;
  let state = {
    status: null,
    config: null,
    voices: null,
    routes: null,
    settings: null,
    stats: null,
    statsUsers: null,
    events: null,
    loading: false,
    error: '',
    tab: 'overview',
    saveInfo: '',
    userStatsRange: 'all',
    userStatsSort: 'requests'
  };

  function registerModule(){
    if (!window.CGN) return;
    window.CGN.modules.tts = {
      title: 'TTS-System',
      panelId: 'ttsModule',
      group: 'system',
      overlayLink: '',
      reload() { return window.TTSModule?.loadAll?.(true); }
    };
    window.CGN.moduleCatalog.tts = {
      label: 'TTS',
      icon: '🗣️',
      enabled: true,
      description: 'Text-to-Speech, Stimmen, Rollen, Limits, Statistiken und Sound-System-Ausgabe.'
    };
    if (Array.isArray(window.CGN.favorites) && !window.CGN.favorites.includes('tts')) window.CGN.favorites.push('tts');
  }

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function rows(container){
    if (Array.isArray(container?.rows)) return container.rows;
    if (Array.isArray(container?.settings?.rows)) return container.settings.rows;
    if (Array.isArray(container?.data?.rows)) return container.data.rows;
    return [];
  }
  function settingRows(){ return rows(state.settings); }
  function findSetting(key){ return settingRows().find(row => row.key === key); }
  function effectiveConfig(){ return state.config?.config || {}; }
  function voicesMap(){ return state.voices?.voices || effectiveConfig().voices || {}; }
  function boolLabel(v){ return v ? 'Aktiv' : 'Inaktiv'; }
  function fmt(v){ return v === undefined || v === null || v === '' ? '<span class="tts-muted">-</span>' : esc(v); }
  function asJson(value){ return JSON.stringify(value ?? {}, null, 2); }
  function num(v){ const n = Number(v || 0); return Number.isFinite(n) ? n : 0; }
  function fmtMs(ms){
    const n = num(ms);
    if (n <= 0) return '0s';
    const s = Math.round(n / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const r = s % 60;
    return r ? `${m}m ${r}s` : `${m}m`;
  }

  function userStatsUrl(){
    const range = encodeURIComponent(state.userStatsRange || 'all');
    const sort = encodeURIComponent(state.userStatsSort || 'requests');
    return `${api.statsUsers}?range=${range}&sort=${sort}&limit=100`;
  }

  async function loadAll(force){
    root = document.getElementById('ttsModule');
    if (!root || !window.CGN) return;
    if (!force && state.status && state.config && state.voices && state.settings) { render(); return; }
    state.loading = true;
    state.error = '';
    render();
    try {
      const [status, config, voices, routes, settings, stats, statsUsers, events] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.config),
        window.CGN.api(api.voices),
        window.CGN.api(api.routes),
        window.CGN.api(api.settings),
        window.CGN.api(api.stats).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(userStatsUrl()).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.events).catch(err => ({ ok:false, error:err.message, rows:[] }))
      ]);
      state = { ...state, status, config, voices, routes, settings, stats, statsUsers, events, loading:false, error:'' };
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }
    render();
  }

  async function reloadUserStats(){
    try {
      state.statsUsers = await window.CGN.api(userStatsUrl());
      state.error = '';
    } catch (err) {
      state.error = err.message || String(err);
    }
    render();
  }

  async function callAction(action){
    const url = api[action];
    if (!url) return;
    await window.CGN.api(url, { method: 'POST', body: '{}' });
    state.saveInfo = `${action} ausgeführt`;
    await loadAll(true);
  }

  function parseSettingValue(row){
    const input = root?.querySelector(`[data-tts-setting-input="${CSS.escape(row.key)}"]`);
    if (!input) return row.value;
    const raw = input.value;
    if (row.valueType === 'boolean') return raw === 'true';
    if (row.valueType === 'number') return Number(raw);
    if (row.valueType === 'json') {
      try { return JSON.parse(raw); } catch (err) { throw new Error(`JSON ungültig bei ${row.key}: ${err.message}`); }
    }
    return raw;
  }

  async function saveSetting(key){
    const row = findSetting(key);
    if (!row) throw new Error(`Setting nicht gefunden: ${key}`);
    const value = parseSettingValue(row);
    await window.CGN.api(api.settings, { method: 'POST', body: JSON.stringify({ key, value, valueType: row.valueType || undefined, description: row.description || '' }) });
    await window.CGN.api(api.reload, { method: 'POST', body: '{}' }).catch(() => null);
    state.saveInfo = `Setting gespeichert: ${key}`;
    await loadAll(true);
  }

  async function sendTest(){
    const text = String(root?.querySelector('[data-tts-test-text]')?.value || '').trim();
    const role = String(root?.querySelector('[data-tts-test-role]')?.value || 'broadcaster');
    const user = String(root?.querySelector('[data-tts-test-user]')?.value || 'dashboard');
    if (!text) throw new Error('Bitte Test-Text eintragen.');
    await window.CGN.api(api.say, { method: 'POST', body: JSON.stringify({ text, role, user, login: user, displayName: 'Dashboard Test', source: 'dashboard', mode: 'test' }) });
    state.saveInfo = 'Test-TTS wurde an die Queue übergeben.';
    await loadAll(true);
  }

  function renderSettingInput(row){
    if (row.valueType === 'boolean') {
      return `<select data-tts-setting-input="${esc(row.key)}"><option value="true" ${row.value === true ? 'selected' : ''}>true</option><option value="false" ${row.value === false ? 'selected' : ''}>false</option></select>`;
    }
    if (row.valueType === 'json') {
      return `<textarea data-tts-setting-input="${esc(row.key)}" spellcheck="false">${esc(asJson(row.value))}</textarea>`;
    }
    const type = row.valueType === 'number' ? 'number' : 'text';
    return `<input data-tts-setting-input="${esc(row.key)}" type="${type}" value="${esc(row.rawValue ?? row.value ?? '')}">`;
  }

  function renderOverview(){
    const status = state.status || {};
    const cfg = effectiveConfig();
    const sources = state.config?.sources || {};
    const usage = status.usage || {};
    const limits = status.limits || cfg.limits || {};
    const userTotals = state.statsUsers?.totals || {};
    return `
      <div class="tts-grid">
        <section class="tts-card tts-card-main">
          <h3>Status</h3>
          <div class="tts-kpis">
            <div><strong>${boolLabel(status.enabled)}</strong><span>Modul</span></div>
            <div><strong>${status.playing ? 'Läuft' : 'Frei'}</strong><span>Playback</span></div>
            <div><strong>${esc(status.queueSize ?? 0)} / ${esc(status.queueMax ?? cfg.queue?.maxSize ?? 0)}</strong><span>Queue</span></div>
            <div><strong>${esc(usage.totalRequestsMonth ?? 0)}</strong><span>Requests Monat</span></div>
          </div>
          <div class="tts-rows">
            <div><span>Command</span><strong>${fmt(cfg.command)}</strong></div>
            <div><span>Standard-Stimme</span><strong>${fmt(cfg.defaultVoice)}</strong></div>
            <div><span>Fallback-Stimme</span><strong>${fmt(cfg.fallbackVoice)}</strong></div>
            <div><span>DB-Settings</span><strong>${sources.database?.ok ? 'OK' : 'Fehler'} · ${esc(sources.database?.count ?? 0)} Einträge</strong></div>
            <div><span>User in Statistik</span><strong>${esc(userTotals.usersTotal ?? 0)}</strong></div>
            <div><span>Regel</span><strong>${fmt(sources.rule)}</strong></div>
          </div>
        </section>
        <section class="tts-card">
          <h3>Nutzung / Limits</h3>
          <div class="tts-rows">
            <div><span>Google heute</span><strong>${esc(usage.googleDailyCharacters ?? 0)} / ${esc(limits.googleDailyCharacterLimit ?? 0)}</strong></div>
            <div><span>Google Monat</span><strong>${esc(usage.googleMonthlyCharacters ?? 0)} / ${esc(limits.googleMonthlyCharacterLimit ?? 0)}</strong></div>
            <div><span>Piper heute</span><strong>${esc(usage.piperDailyCharacters ?? 0)}</strong></div>
            <div><span>Piper Monat</span><strong>${esc(usage.piperMonthlyCharacters ?? 0)}</strong></div>
            <div><span>Requests heute</span><strong>${esc(usage.totalRequestsToday ?? 0)}</strong></div>
          </div>
        </section>
      </div>`;
  }

  function renderUserStats(){
    const data = state.statsUsers || {};
    const rows = Array.isArray(data.rows) ? data.rows : [];
    const totals = data.totals || {};
    const byRole = Array.isArray(data.byRole) ? data.byRole : [];
    const rangeOptions = [['today','Heute'], ['7d','7 Tage'], ['30d','30 Tage'], ['month','Dieser Monat'], ['all','Gesamt']];
    const sortOptions = [['requests','Anzahl'], ['chars','Zeichen'], ['duration','Dauer'], ['failed','Fehler'], ['google','Google'], ['piper','Piper'], ['last','Letzte Nutzung'], ['user','User']];
    return `
      <div class="tts-grid">
        <section class="tts-card tts-card-main">
          <div class="tts-stats-head">
            <div><h3>User-Statistik</h3><p class="tts-note">Wer hat wie oft TTS genutzt, wie viele Zeichen verbraucht und welche Engine wurde genutzt?</p></div>
            <div class="tts-stats-controls">
              <label>Zeitraum<select data-tts-userstats-range>${rangeOptions.map(([id,label]) => `<option value="${esc(id)}" ${state.userStatsRange === id ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select></label>
              <label>Sortierung<select data-tts-userstats-sort>${sortOptions.map(([id,label]) => `<option value="${esc(id)}" ${state.userStatsSort === id ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select></label>
              <button type="button" data-tts-userstats-refresh>Aktualisieren</button>
            </div>
          </div>
          <div class="tts-kpis">
            <div><strong>${esc(totals.usersTotal ?? 0)}</strong><span>User</span></div>
            <div><strong>${esc(totals.requestsTotal ?? 0)}</strong><span>Requests</span></div>
            <div><strong>${esc(totals.charsTotal ?? 0)}</strong><span>Zeichen</span></div>
            <div><strong>${fmtMs(totals.durationMsTotal)}</strong><span>Dauer</span></div>
          </div>
          ${rows.length ? `<div class="tts-table-wrap"><table><thead><tr><th>User</th><th>Rolle</th><th>Anzahl</th><th>OK</th><th>Fehler</th><th>Zeichen</th><th>Google</th><th>Piper</th><th>Dauer</th><th>Letzte Nutzung</th></tr></thead><tbody>${rows.map(r => `<tr><td><strong>${esc(r.userDisplay || r.userLogin || '-')}</strong><small>${esc(r.userLogin || '')}</small></td><td>${esc(r.roleKey || '-')}</td><td>${esc(r.requestsTotal ?? 0)}</td><td>${esc(r.requestsOk ?? 0)}</td><td>${esc(r.requestsFailed ?? 0)}</td><td>${esc(r.charsTotal ?? 0)}</td><td>${esc(r.googleRequests ?? 0)}</td><td>${esc(r.piperRequests ?? 0)}</td><td>${esc(fmtMs(r.durationMsTotal))}</td><td>${fmt(r.lastUsedAt)}</td></tr>`).join('')}</tbody></table></div>` : `<div class="tts-empty">Keine User-Statistik für diesen Filter.</div>`}
        </section>
        <section class="tts-card">
          <h3>Nach Rolle</h3>
          ${byRole.length ? `<div class="tts-table-wrap tts-table-small"><table><thead><tr><th>Rolle</th><th>User</th><th>Anzahl</th><th>Zeichen</th></tr></thead><tbody>${byRole.map(r => `<tr><td>${esc(r.roleKey || '-')}</td><td>${esc(r.usersTotal ?? 0)}</td><td>${esc(r.requestsTotal ?? 0)}</td><td>${esc(r.charsTotal ?? 0)}</td></tr>`).join('')}</tbody></table></div>` : `<div class="tts-empty">Keine Rollendaten.</div>`}
        </section>
      </div>`;
  }

  function renderVoices(){
    const voices = voicesMap();
    const entries = Object.entries(voices);
    return `<section class="tts-card"><h3>Stimmen</h3><p class="tts-note">Die Antwort ist bereinigt: technische Zugangswerte und Google-Keyfile-Pfade werden nicht ausgegeben.</p><div class="tts-voice-list">${entries.map(([id, voice]) => `
      <article class="tts-voice-card">
        <div class="tts-voice-head"><strong>${esc(voice.label || id)}</strong><span class="tts-pill">${esc(voice.engine || '-')}</span></div>
        <div class="tts-rows compact">
          <div><span>ID</span><strong>${esc(id)}</strong></div>
          <div><span>Status</span><strong>${boolLabel(voice.enabled)}</strong></div>
          <div><span>Name</span><strong>${fmt(voice.name)}</strong></div>
          <div><span>Sprache</span><strong>${fmt(voice.languageCode)}</strong></div>
          <div><span>Encoding</span><strong>${fmt(voice.audioEncoding)}</strong></div>
          <div><span>Keyfile</span><strong>${voice.keyFileConfigured ? (voice.keyFileExists ? 'konfiguriert / gefunden' : 'konfiguriert / fehlt') : 'nicht konfiguriert'}</strong></div>
        </div>
      </article>`).join('')}</div>${!entries.length ? '<div class="tts-empty">Keine Stimmen gefunden.</div>' : ''}</section>`;
  }

  function renderRoles(){
    const roles = effectiveConfig().roles || state.status?.roles || {};
    return `<section class="tts-card"><h3>Rollenrechte</h3><div class="tts-table-wrap"><table><thead><tr><th>Rolle</th><th>Status</th><th>Voice</th><th>Max Länge</th><th>User-CD</th><th>Global-CD</th><th>Priorität</th></tr></thead><tbody>${Object.entries(roles).map(([role, r]) => `<tr><td><strong>${esc(role)}</strong></td><td>${boolLabel(r.enabled)}</td><td>${esc(r.voice || '-')}</td><td>${esc(r.maxLength ?? '-')}</td><td>${esc(r.userCooldownSeconds ?? '-')}s</td><td>${esc(r.globalCooldownSeconds ?? '-')}s</td><td>${esc(r.priority ?? '-')}</td></tr>`).join('')}</tbody></table></div></section>`;
  }

  function renderSoundSystem(){
    const chat = effectiveConfig().chatTts || {};
    const alert = effectiveConfig().alertTts || {};
    return `<div class="tts-grid">
      <section class="tts-card">
        <h3>Chat-TTS Ausgabe</h3>
        <p class="tts-note">TTS erzeugt Audiodateien. Die Ausgabe soll standardmäßig über das Sound-System laufen.</p>
        <div class="tts-rows">
          <div><span>Playback</span><strong>${fmt(chat.playbackMode)}</strong></div>
          <div><span>Sound-System</span><strong>${boolLabel(chat.soundSystemEnabled)}</strong></div>
          <div><span>Output</span><strong>${fmt(chat.soundSystemOutputTarget)}</strong></div>
          <div><span>Kategorie</span><strong>${fmt(chat.soundSystemCategory)}</strong></div>
          <div><span>Priorität</span><strong>${fmt(chat.soundSystemPriority)}</strong></div>
          <div><span>Lautstärke</span><strong>${fmt(chat.soundSystemVolume)}%</strong></div>
          <div><span>Fallback Overlay</span><strong>${chat.fallbackToOverlay ? 'Ja' : 'Nein'}</strong></div>
        </div>
      </section>
      <section class="tts-card">
        <h3>Alert-TTS</h3>
        <div class="tts-rows">
          <div><span>Status</span><strong>${boolLabel(alert.enabled)}</strong></div>
          <div><span>Voice</span><strong>${fmt(alert.voice)}</strong></div>
          <div><span>Max Zeichen</span><strong>${fmt(alert.maxChars)}</strong></div>
          <div><span>Delay nach Sound</span><strong>${fmt(alert.delayAfterSoundMs)} ms</strong></div>
          <div><span>Outro Buffer</span><strong>${fmt(alert.outroBufferMs)} ms</strong></div>
        </div>
      </section>
    </div>`;
  }

  function renderSettings(){
    const list = settingRows();
    return `<section class="tts-card"><h3>DB-Settings</h3><p class="tts-note">DB gewinnt gegen JSON-Fallback. JSON-Felder vorsichtig bearbeiten. Nach dem Speichern wird TTS neu geladen.</p><div class="tts-setting-list">${list.map(row => `
      <article class="tts-setting-row">
        <div><strong>${esc(row.key)}</strong><span>${esc(row.valueType || 'string')} · ${esc(row.source || '')}</span><small>${esc(row.description || '')}</small></div>
        <div class="tts-setting-input">${renderSettingInput(row)}</div>
        <button type="button" data-tts-save-setting="${esc(row.key)}">Speichern</button>
      </article>`).join('')}</div>${!list.length ? '<div class="tts-empty">Keine Settings gefunden.</div>' : ''}</section>`;
  }

  function renderTest(){
    const roles = Object.keys(effectiveConfig().roles || state.status?.roles || { broadcaster: {} });
    return `<section class="tts-card"><h3>Test-TTS</h3><p class="tts-note">Sendet einen Test an <code>/api/tts/say</code>. Ausgabe läuft nach aktueller TTS-Konfiguration.</p>
      <div class="tts-test-grid">
        <label><span>Rolle</span><select data-tts-test-role>${roles.map(r => `<option value="${esc(r)}" ${r === 'broadcaster' ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select></label>
        <label><span>User/Login</span><input data-tts-test-user type="text" value="dashboard"></label>
        <label class="wide"><span>Text</span><textarea data-tts-test-text placeholder="Testdurchsage...">Dies ist ein Test aus dem Control-Center.</textarea></label>
      </div>
      <div class="tts-actions"><button type="button" data-tts-action="test">Test senden</button></div>
    </section>`;
  }

  function renderEvents(){
    const eventRows = Array.isArray(state.events?.rows) ? state.events.rows : Array.isArray(state.events?.events) ? state.events.events : [];
    const statRows = Array.isArray(state.stats?.rows) ? state.stats.rows : [];
    return `<div class="tts-grid"><section class="tts-card"><h3>Letzte Events</h3>${eventRows.length ? `<div class="tts-table-wrap"><table><thead><tr><th>Zeit</th><th>Status</th><th>User</th><th>Voice</th><th>Text</th></tr></thead><tbody>${eventRows.slice(0, 20).map(e => `<tr><td>${fmt(e.created_at || e.createdAt)}</td><td>${fmt(e.status)}</td><td>${fmt(e.user_display || e.userDisplay || e.user_login)}</td><td>${fmt(e.voice_id || e.voiceId)}</td><td>${fmt(e.text)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="tts-empty">Keine Eventdaten oder Route liefert keine rows.</div>'}</section><section class="tts-card"><h3>Statistik Rohdaten</h3>${statRows.length ? `<pre class="tts-json">${esc(asJson(statRows))}</pre>` : `<pre class="tts-json">${esc(asJson(state.stats || {}))}</pre>`}</section></div>`;
  }

  function renderRoutes(){
    const routes = Array.isArray(state.routes?.routes) ? state.routes.routes : [];
    return `<section class="tts-card"><h3>Routen</h3><div class="tts-table-wrap"><table><thead><tr><th>Methode</th><th>Route</th><th>Beschreibung</th></tr></thead><tbody>${routes.map(r => `<tr><td>${esc(r.method || '')}</td><td><code>${esc(r.path || '')}</code></td><td>${esc(r.description || '')}</td></tr>`).join('')}</tbody></table></div></section>`;
  }

  function render(){
    root = document.getElementById('ttsModule');
    if (!root) return;
    const tabs = [
      ['overview','Übersicht'], ['users','User-Statistik'], ['voices','Stimmen'], ['roles','Rollen'], ['sound','Sound-System'], ['settings','Settings'], ['test','Test'], ['events','Events'], ['routes','Routen']
    ];
    root.innerHTML = `
      <div class="tts-admin-wrap">
        <section class="tts-card tts-hero">
          <div><h2>🗣️ TTS-System</h2><p>Text-to-Speech verwalten: Status, Stimmen, Rollen, Limits, User-Statistiken, Sound-System-Ausgabe und Tests.</p></div>
          <div class="tts-actions">
            <button type="button" data-tts-action="refresh">Aktualisieren</button>
            <button type="button" data-tts-action="reload">Backend neu laden</button>
            <button type="button" data-tts-action="on">TTS an</button>
            <button type="button" data-tts-action="off">TTS aus</button>
            <button type="button" data-tts-action="stop">Stop</button>
            <button type="button" data-tts-action="clear">Queue leeren</button>
          </div>
        </section>
        ${state.error ? `<div class="tts-error">${esc(state.error)}</div>` : ''}
        ${state.saveInfo ? `<div class="tts-info">${esc(state.saveInfo)}</div>` : ''}
        ${state.loading ? '<div class="tts-card">Lade TTS-Daten...</div>' : `
          <div class="tts-tabs">${tabs.map(([id,label]) => `<button type="button" class="${state.tab === id ? 'active' : ''}" data-tts-tab="${id}">${esc(label)}</button>`).join('')}</div>
          ${state.tab === 'users' ? renderUserStats() : state.tab === 'voices' ? renderVoices() : state.tab === 'roles' ? renderRoles() : state.tab === 'sound' ? renderSoundSystem() : state.tab === 'settings' ? renderSettings() : state.tab === 'test' ? renderTest() : state.tab === 'events' ? renderEvents() : state.tab === 'routes' ? renderRoutes() : renderOverview()}
        `}
      </div>`;
    bind();
  }

  function bind(){
    root?.querySelectorAll('[data-tts-tab]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.ttsTab || 'overview'; render(); }));
    root?.querySelectorAll('[data-tts-save-setting]').forEach(btn => btn.addEventListener('click', () => saveSetting(btn.dataset.ttsSaveSetting).catch(err => { state.error = err.message; render(); })));
    root?.querySelector('[data-tts-userstats-range]')?.addEventListener('change', ev => { state.userStatsRange = ev.target.value; reloadUserStats(); });
    root?.querySelector('[data-tts-userstats-sort]')?.addEventListener('change', ev => { state.userStatsSort = ev.target.value; reloadUserStats(); });
    root?.querySelector('[data-tts-userstats-refresh]')?.addEventListener('click', () => reloadUserStats());
    root?.querySelectorAll('[data-tts-action]').forEach(btn => btn.addEventListener('click', () => {
      const action = btn.dataset.ttsAction;
      if (action === 'refresh') return loadAll(true);
      if (action === 'test') return sendTest().catch(err => { state.error = err.message; render(); });
      if (['reload','on','off','stop','clear'].includes(action)) return callAction(action).catch(err => { state.error = err.message; render(); });
    }));
  }

  registerModule();
  window.addEventListener('cgn:module-show', ev => { if (ev.detail?.module === 'tts') loadAll(false); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { root = document.getElementById('ttsModule'); });
  else root = document.getElementById('ttsModule');

  return { loadAll, render };
})();
