(function(){
  const root = document.getElementById('streamdeskModule');
  if (!root) return;

  const state = {
    loadedAt: null,
    config: null,
    status: null,
    note: '',
    switchingScene: '',
    userinfo: { loading:false, error:'', query:'', endpoint:'', data:null, opened:false }
  };

  const fallbackConfig = {
    title: 'Stream-Desk',
    layout: 'three_column',
    refreshMs: 3000,
    obsQuickScenes: [
      { label:'Start', sceneName:'Start' },
      { label:'Forrest', sceneName:'Live Gameplay Forrest' },
      { label:'Forrest & Engel', sceneName:'Live Gameplay Forrest&Engel' },
      { label:'Pause', sceneName:'Pause' },
      { label:'Ende', sceneName:'Ende', confirm:true }
    ],
    obsQuickControl: {
      enabled: true,
      showCurrentScene: true,
      showSceneNameUnderLabel: true,
      switchEndpoint: '/api/obs/scene/switch',
      fallbackSwitchEndpoints: ['/api/obs/scene/switch', '/api/scene/switch']
    },
    userinfo: {
      enableSearch: true,
      openInModal: true,
      endpoints: ['/userinfo?login={login}', '/api/userinfo?login={login}', '/api/twitch/userinfo?login={login}']
    }
  };

  async function loadConfig(){
    try {
      state.config = await window.CGN.api('/api/dashboard/controlcenter/streamdesk');
    } catch (_) {
      state.config = { ok:true, config:fallbackConfig, fallback:true };
    }
  }

  async function loadStatus(){
    const status = { obs:null, alert:null, chat:null };
    try { status.obs = await window.CGN.api('/api/obs/dashboard/status'); } catch (_) {}
    try { status.alert = await window.CGN.api('/api/alerts/status'); } catch (_) {}
    try { status.chat = await window.CGN.api('/api/overlay/chat/status'); } catch (_) {}
    state.status = status;
  }

  function cfg(){
    const loaded = state.config?.config || state.config || {};
    return {
      ...fallbackConfig,
      ...loaded,
      userinfo:{ ...fallbackConfig.userinfo, ...(loaded.userinfo || {}) },
      obsQuickControl:{ ...fallbackConfig.obsQuickControl, ...(loaded.obsQuickControl || {}) }
    };
  }

  function currentSceneName(){
    const obs = state.status?.obs || {};
    return obs.currentProgramSceneName || obs.currentPreviewSceneName || obs.currentSceneName || obs.programScene || obs.currentScene || obs.sceneName || '';
  }

  function obsConnected(){
    const obs = state.status?.obs || {};
    return !!(obs.connected || obs.obsConnected || obs.ok === true);
  }

  async function postSceneSwitch(endpoint, sceneName){
    if (endpoint.includes('?')) {
      return window.CGN.api(endpoint.replace('{sceneName}', encodeURIComponent(sceneName)).replace('{scene}', encodeURIComponent(sceneName)), { method:'POST' });
    }
    return window.CGN.api(endpoint, { method:'POST', body: JSON.stringify({ sceneName, scene: sceneName }) });
  }

  async function switchScene(sceneName, confirmSwitch){
    if (!sceneName) return;
    if (confirmSwitch && !confirm(`OBS wirklich auf „${sceneName}“ umschalten?`)) return;
    const quickCfg = cfg().obsQuickControl || {};
    const endpoints = Array.from(new Set([quickCfg.switchEndpoint, ...(quickCfg.fallbackSwitchEndpoints || [])].filter(Boolean)));
    state.switchingScene = sceneName;
    state.note = `OBS-Szenenwechsel läuft: ${sceneName}`;
    render();
    const errors = [];
    for (const endpoint of endpoints) {
      try {
        await postSceneSwitch(endpoint, sceneName);
        state.note = `OBS-Szene gewechselt: ${sceneName}`;
        state.switchingScene = '';
        await loadStatus();
        render();
        return;
      } catch (err) {
        errors.push(`${endpoint}: ${err.message}`);
      }
    }
    state.switchingScene = '';
    state.note = `OBS-Szenenwechsel fehlgeschlagen: ${errors.join(' | ')}`;
    render();
  }

  function normalizeLogin(value){ return String(value || '').trim().replace(/^@+/, '').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase(); }
  function firstExisting(obj, keys){ for (const key of keys) { const value = obj && obj[key]; if (value !== undefined && value !== null && value !== '') return value; } return ''; }
  function unwrapUserPayload(payload){
    if (!payload) return null;
    if (Array.isArray(payload)) return payload[0] || null;
    if (Array.isArray(payload.data)) return payload.data[0] || null;
    if (payload.user && typeof payload.user === 'object') return payload.user;
    if (payload.twitchUser && typeof payload.twitchUser === 'object') return payload.twitchUser;
    if (payload.result && typeof payload.result === 'object') { if (Array.isArray(payload.result.data)) return payload.result.data[0] || null; return payload.result; }
    return payload;
  }
  function endpointsForUserinfo(login){ const userCfg = cfg().userinfo || {}; const endpoints = Array.isArray(userCfg.endpoints) && userCfg.endpoints.length ? userCfg.endpoints : fallbackConfig.userinfo.endpoints; return endpoints.map(endpoint => String(endpoint).replace('{login}', encodeURIComponent(login)).replace('{user}', encodeURIComponent(login))); }
  async function fetchUserinfo(login){
    const errors = [];
    for (const endpoint of endpointsForUserinfo(login)) {
      try { const payload = await window.CGN.api(endpoint); const user = unwrapUserPayload(payload); if (user && typeof user === 'object') return { endpoint, payload, user }; errors.push(`${endpoint}: keine Userdaten`); }
      catch (err) { errors.push(`${endpoint}: ${err.message}`); }
    }
    throw new Error(errors.join(' | ') || 'Keine Userinfo-Route erreichbar');
  }
  async function openUserinfoFromInput(){
    const input = root.querySelector('#streamdeskUserSearch');
    const login = normalizeLogin(input?.value);
    if (!login) { state.userinfo.error = 'Bitte Twitch-Name eingeben.'; state.userinfo.opened = true; render(); return; }
    state.userinfo = { loading:true, error:'', query:login, endpoint:'', data:null, opened:true }; render();
    try { const result = await fetchUserinfo(login); state.userinfo = { loading:false, error:'', query:login, endpoint:result.endpoint, data:result, opened:true }; }
    catch (err) { state.userinfo = { loading:false, error:err.message, query:login, endpoint:'', data:null, opened:true }; }
    render();
  }
  function closeUserinfoModal(){ state.userinfo.opened = false; render(); }
  function formatDate(value){ if (!value) return '—'; const d = new Date(value); if (Number.isNaN(d.getTime())) return String(value); return d.toLocaleString('de-DE', { dateStyle:'medium', timeStyle:'short' }); }
  function formatBool(value){ if (value === true || value === 'true' || value === 1) return 'Ja'; if (value === false || value === 'false' || value === 0) return 'Nein'; return '—'; }
  function userFieldRows(user){
    const id = firstExisting(user, ['id','user_id','userId','twitch_id']);
    const login = firstExisting(user, ['login','user_login','userLogin','name','user_name']);
    const display = firstExisting(user, ['display_name','displayName','user_display_name','userDisplayName','user']);
    const broadcasterType = firstExisting(user, ['broadcaster_type','broadcasterType']);
    const type = firstExisting(user, ['type','user_type','userType']);
    const createdAt = firstExisting(user, ['created_at','createdAt']);
    const description = firstExisting(user, ['description','bio']);
    const viewCount = firstExisting(user, ['view_count','viewCount']);
    const followedAt = firstExisting(user, ['followed_at','followedAt','follow_date']);
    const isModerator = firstExisting(user, ['is_moderator','isModerator','moderator']);
    const isVip = firstExisting(user, ['is_vip','isVip','vip']);
    const isSubscriber = firstExisting(user, ['is_subscriber','isSubscriber','subscriber','sub']);
    return [
      ['Displayname', display || '—'], ['Login', login || '—'], ['Twitch-ID', id || '—'], ['Account erstellt', formatDate(createdAt)],
      ['Broadcaster-Typ', broadcasterType || '—'], ['User-Typ', type || '—'], ['Follower seit', formatDate(followedAt)],
      ['Mod im Kanal', formatBool(isModerator)], ['VIP', formatBool(isVip)], ['Subscriber', formatBool(isSubscriber)],
      ['Views', viewCount !== '' ? String(viewCount) : '—'], ['Beschreibung', description || '—']
    ];
  }

  function renderUserinfoModal(){
    if (!state.userinfo.opened) return '';
    const info = state.userinfo;
    const user = info.data?.user || {};
    const login = firstExisting(user, ['login','user_login','userLogin','name','user_name']) || info.query;
    const display = firstExisting(user, ['display_name','displayName','user_display_name','userDisplayName','user']) || login;
    const avatar = firstExisting(user, ['profile_image_url','profileImageUrl','avatar','avatar_url']);
    const offlineImage = firstExisting(user, ['offline_image_url','offlineImageUrl']);
    const twitchUrl = login ? `https://www.twitch.tv/${encodeURIComponent(login)}` : '';
    const rows = info.data?.user ? userFieldRows(user) : [];
    return `
      <div class="cgn-modal-backdrop" data-userinfo-close="1">
        <section class="cgn-modal userinfo-modal glass" role="dialog" aria-modal="true" aria-label="Userinfo">
          <div class="userinfo-modal-head"><div><span class="role-badge">Userinfo</span><h2>${window.CGN.esc(display || 'Userinfo')}</h2><p>${info.endpoint ? `Quelle: ${window.CGN.esc(info.endpoint)}` : 'Twitch-Userdaten abrufen'}</p></div><button class="icon-button" data-userinfo-close="1" title="Schließen">✕</button></div>
          ${info.loading ? '<div class="placeholder-note">Userdaten werden geladen...</div>' : ''}
          ${info.error ? `<div class="placeholder-note bad">Userinfo konnte nicht geladen werden:<br>${window.CGN.esc(info.error)}</div>` : ''}
          ${info.data?.user ? `<div class="userinfo-layout"><div class="userinfo-avatarbox">${avatar ? `<img class="userinfo-avatar" src="${window.CGN.esc(avatar)}" alt="Avatar von ${window.CGN.esc(display)}" />` : '<div class="userinfo-avatar empty">?</div>'}${offlineImage ? `<img class="userinfo-offline" src="${window.CGN.esc(offlineImage)}" alt="Offline-Bild" />` : ''}<div class="actions userinfo-actions">${twitchUrl ? `<a class="ghost-link" href="${window.CGN.esc(twitchUrl)}" target="_blank" rel="noopener">Twitch-Profil öffnen</a>` : ''}<button type="button" data-copy-user="${window.CGN.esc(login)}">Login kopieren</button><button type="button" disabled title="Kommt später mit Twitch-/Streamer.bot-Anbindung">Shoutout vorbereitet</button></div></div><div class="userinfo-details"><table class="table userinfo-table"><tbody>${rows.map(([key, value]) => `<tr><th>${window.CGN.esc(key)}</th><td>${window.CGN.esc(value)}</td></tr>`).join('')}</tbody></table></div></div><div class="placeholder-note">Mod-/SuperMod-Rechte werden später über Twitch-Login und Twitch-API geprüft. Diese Userinfo zeigt aktuell nur die verfügbaren Daten der bestehenden Userinfo-Route.</div>` : ''}
        </section>
      </div>`;
  }

  function renderSceneButton(s, current){
    const sceneName = s.sceneName || s.name || '';
    const label = s.label || sceneName || 'Szene';
    const isCurrent = sceneName && current && sceneName === current;
    const isBusy = state.switchingScene === sceneName;
    const confirmSwitch = !!s.confirm;
    return `<button class="scene-quick-btn ${isCurrent ? 'active' : ''}" data-streamdesk-scene="${window.CGN.esc(sceneName)}" data-confirm="${confirmSwitch ? '1' : '0'}" ${!sceneName || isBusy ? 'disabled' : ''} title="${window.CGN.esc(sceneName)}">${isBusy ? '<span class="mini-spinner"></span>' : ''}<strong>${window.CGN.esc(label)}</strong>${cfg().obsQuickControl?.showSceneNameUnderLabel ? `<small>${window.CGN.esc(sceneName)}</small>` : ''}${isCurrent ? '<em>aktuell</em>' : ''}</button>`;
  }

  function render(){
    const config = cfg();
    const scenes = Array.isArray(config.obsQuickScenes) ? config.obsQuickScenes : [];
    const currentScene = currentSceneName();
    const connected = obsConnected();
    const chatConnected = !!(state.status?.chat?.connected || state.status?.chat?.joined);
    const alertOk = state.status?.alert?.ok !== false;
    const updated = state.loadedAt ? state.loadedAt.toLocaleTimeString('de-DE') : '—';
    root.innerHTML = `
      <div class="module-grid streamdesk-grid">
        <section class="card glass span-12 streamdesk-hero"><div><span class="role-badge">Live-Bedienung für Streamer / Mods / SuperMods</span><h2>Stream-Desk</h2><p>Live-Arbeitsfläche: Userinfo funktioniert, OBS-QuickScenes sind vorbereitet/angebunden, Chat- und Mod-Aktionen bleiben bis Twitch-Login später vorbereitet.</p></div><div class="streamdesk-status-row"><span class="pill ${connected ? 'ok' : 'warn'}">OBS: ${connected ? 'verbunden' : 'prüfen'}</span><span class="pill ${chatConnected ? 'ok' : 'warn'}">Chat: ${chatConnected ? 'verbunden' : 'vorbereitet'}</span><span class="pill ${alertOk ? 'ok' : 'warn'}">Alerts: ${alertOk ? 'bereit' : 'prüfen'}</span><span class="pill">Update: ${window.CGN.esc(updated)}</span></div></section>
        <section class="card glass span-4"><h2>Chat</h2><div class="placeholder-note">Live-Chat wird hier als Bedien-Chat eingebunden. Mod kann später per Twitch-Login als eigener Account schreiben.</div><div class="actions"><button disabled>Chat senden vorbereitet</button></div><p class="muted">Twitch-Login vorbereitet: später schreibt jeder Mod mit eigenem Twitch-Account, sofern Twitch die Rechte bestätigt.</p></section>
        <section class="card glass span-4 streamdesk-user-card"><h2>Userinfo</h2><label>User suchen<input id="streamdeskUserSearch" type="text" placeholder="Twitch-Name eingeben" value="${window.CGN.esc(state.userinfo.query)}" autocomplete="off" /></label><div class="actions"><button type="button" id="streamdeskUserinfoBtn">Userinfo öffnen</button></div><p class="muted">Öffnet ein separates Fenster im Dashboard. Nutzt zuerst deine bestehende Route <code>/userinfo?login=...</code>.</p></section>
        <section class="card glass span-4 streamdesk-obs-card"><div class="card-title-row"><h2>OBS Quick</h2><button type="button" id="streamdeskRefreshBtn" title="Status neu laden">↻</button></div><div class="obs-current-scene"><span>Aktuelle Szene</span><strong>${window.CGN.esc(currentScene || 'unbekannt')}</strong></div><p class="muted">Szenen kommen aus <code>config/streamdesk.json</code>. Auf der Live-Hauptseite nur wichtige sichtbare Szenen eintragen.</p><div class="streamdesk-scene-list">${scenes.map(s => renderSceneButton(s, currentScene)).join('') || '<div class="placeholder-note">Keine Quick-Szenen konfiguriert.</div>'}</div></section>
        <section class="card glass span-12"><h2>Twitch-Login / Rechte</h2><div class="quick-grid"><div class="quick-card"><h3>Login</h3><p>Noch nicht live. Später: angemeldet als Twitch-Name.</p></div><div class="quick-card"><h3>Mod-Rechte</h3><p>Später prüft Twitch, ob der Account im Kanal Mod-Rechte hat.</p></div><div class="quick-card"><h3>Chatten</h3><p>Später über eigenen OAuth-Token oder Bot-Fallback.</p></div><div class="quick-card"><h3>Mod-Log</h3><p>Jede spätere Mod-Aktion wird protokolliert.</p></div></div></section>
        <section class="card glass span-12"><h2>Schnellaktionen</h2><div class="quick-grid"><div class="quick-card"><h3>Clip</h3><p>Clip/Replay-Buffer auslösen. Wird später an dein Clip-System angebunden.</p></div><div class="quick-card"><h3>Alerts</h3><p>Letzte Alerts erneut abspielen oder Test-Alert starten.</p></div><div class="quick-card"><h3>Sounds</h3><p>Sound stoppen/pausieren und Queue einsehen.</p></div><div class="quick-card"><h3>Tagebuch</h3><p>Kurzen Streamtagebuch-Eintrag schreiben.</p></div><div class="quick-card"><h3>Todo</h3><p>Aufgabe für Forrest/Engel/Team erfassen.</p></div><div class="quick-card"><h3>Moderation</h3><p>Twitch-Aktionen nur mit echtem Mod-Login und echten Twitch-Rechten.</p></div></div>${state.note ? `<p class="muted">${window.CGN.esc(state.note)}</p>` : ''}</section>
      </div>${renderUserinfoModal()}`;
    root.querySelectorAll('[data-streamdesk-scene]').forEach(btn => btn.addEventListener('click', () => switchScene(btn.dataset.streamdeskScene, btn.dataset.confirm === '1')));
    root.querySelector('#streamdeskRefreshBtn')?.addEventListener('click', async () => { await loadStatus(); state.loadedAt = new Date(); state.note = 'Status neu geladen.'; render(); });
    root.querySelector('#streamdeskUserinfoBtn')?.addEventListener('click', openUserinfoFromInput);
    root.querySelector('#streamdeskUserSearch')?.addEventListener('keydown', event => { if (event.key === 'Enter') openUserinfoFromInput(); });
    root.querySelectorAll('[data-userinfo-close]').forEach(el => el.addEventListener('click', event => { if (event.target === el || el.matches('button')) closeUserinfoModal(); }));
    root.querySelector('[data-copy-user]')?.addEventListener('click', async event => { const value = event.currentTarget.dataset.copyUser || ''; try { await navigator.clipboard.writeText(value); state.note = `Login kopiert: ${value}`; } catch (_) { state.note = `Login: ${value}`; } render(); });
  }

  async function loadAll(){ await loadConfig(); await loadStatus(); state.loadedAt = new Date(); render(); }
  window.addEventListener('keydown', event => { if (event.key === 'Escape' && state.userinfo.opened) closeUserinfoModal(); });
  window.addEventListener('cgn:module-show', event => { if (event.detail?.module === 'streamdesk') loadAll(); });
  window.StreamdeskModule = { loadAll, openUserinfoFromInput };
  loadAll();
})();
