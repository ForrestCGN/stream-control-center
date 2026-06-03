window.AutoShoutoutModule = (function(){
  'use strict';

  const API = {
    auto: '/api/clip-shoutout/auto',
    settings: '/api/clip-shoutout/auto/settings',
    streamers: '/api/clip-shoutout/auto/streamers',
    remove: '/api/clip-shoutout/auto/streamers/remove',
    testChat: '/api/clip-shoutout/auto/test-chat',
    queue: '/api/clip-shoutout/queue'
  };

  let refreshTimer = null;
  let mainRefreshWasPausedByAutoTab = false;

  const state = {
    data: null,
    streamers: [],
    queue: null,
    loading: false,
    error: '',
    notice: '',
    autoRefresh: true,
    activeInShoutout: false
  };

  function esc(v){
    return window.CGN?.esc
      ? window.CGN.esc(v)
      : String(v ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  async function api(path, options = {}){
    if (window.CGN?.api) return window.CGN.api(path, options);
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.error || data.message || `HTTP ${res.status}`);
    return data;
  }

  function getRoot(){ return document.getElementById('shoutoutModule'); }
  function isShoutoutVisible(){ const root = getRoot(); return !!root && root.hidden !== true; }

  function ensureTab(){
    const root = getRoot();
    if (!root) return null;
    const tabs = root.querySelector('.shoutout-tabs');
    if (!tabs) return null;
    let btn = tabs.querySelector('[data-auto-so-tab]');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      btn.className = 'shoutout-tab';
      btn.dataset.autoSoTab = '1';
      btn.textContent = 'Auto-Shoutouts';
      const queueTab = tabs.querySelector('[data-shoutout-tab="queues"]');
      if (queueTab && queueTab.nextSibling) tabs.insertBefore(btn, queueTab.nextSibling);
      else tabs.appendChild(btn);
    }
    return btn;
  }

  function getPanel(create = true){
    const root = getRoot();
    if (!root) return null;
    let panel = root.querySelector('#autoShoutoutTabPanel');
    if (!panel && create) {
      const tabs = root.querySelector('.shoutout-tabs');
      panel = document.createElement('div');
      panel.id = 'autoShoutoutTabPanel';
      panel.className = 'shoutout-tab-panel auto-so-tab-panel';
      if (tabs && tabs.parentNode) tabs.parentNode.insertBefore(panel, tabs.nextSibling);
      else root.appendChild(panel);
    }
    return panel;
  }

  function hideNativePanel(hide){
    const root = getRoot();
    if (!root) return;
    root.querySelectorAll('.shoutout-tab-panel').forEach(panel => {
      if (panel.id !== 'autoShoutoutTabPanel') panel.style.display = hide ? 'none' : '';
    });
  }

  function pauseMainShoutoutRefresh(){
    const root = getRoot();
    const cb = root?.querySelector?.('[data-shoutout-auto]');
    if (cb && cb.checked) {
      cb.checked = false;
      mainRefreshWasPausedByAutoTab = true;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function maybeResumeMainShoutoutRefresh(){
    const root = getRoot();
    const cb = root?.querySelector?.('[data-shoutout-auto]');
    if (cb && mainRefreshWasPausedByAutoTab && !cb.checked) {
      cb.checked = true;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    }
    mainRefreshWasPausedByAutoTab = false;
  }

  function activateAutoTab(){
    state.activeInShoutout = true;
    pauseMainShoutoutRefresh();
    const root = getRoot();
    const btn = ensureTab();
    if (!root || !btn) return;
    root.querySelectorAll('.shoutout-tab').forEach(tab => {
      tab.classList.toggle('active', tab === btn);
      tab.setAttribute('aria-selected', tab === btn ? 'true' : 'false');
    });
    hideNativePanel(true);
    render();
    loadAll(false);
  }

  function deactivateAutoTab(){
    if (!state.activeInShoutout) return;
    state.activeInShoutout = false;
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = null;
    const panel = getPanel(false);
    if (panel) panel.remove();
    hideNativePanel(false);
    maybeResumeMainShoutoutRefresh();
  }

  function fmtDate(v){
    if (!v) return '<span class="auto-so-muted">-</span>';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return esc(v);
    return esc(d.toLocaleString('de-DE'));
  }

  function fmtMs(ms){
    const n = Math.max(0, Number(ms || 0));
    if (!n) return '0s';
    const s = Math.ceil(n / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rest = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${rest}s`;
    return `${rest}s`;
  }

  function boolBadge(value, yes = 'An', no = 'Aus'){
    return `<span class="auto-so-badge ${value ? 'ok' : 'warn'}">${esc(value ? yes : no)}</span>`;
  }

  function statusBadge(value){
    const raw = String(value || '').toLowerCase();
    let cls = 'neutral';
    if (['ok','active','triggered','queued','live','fresh','database','frei'].includes(raw)) cls = 'ok';
    else if (['waiting','offline','fallback','false','warn','unknown','stale','aktiv'].includes(raw)) cls = 'warn';
    else if (['failed','error','bad','removed'].includes(raw)) cls = 'bad';
    return `<span class="auto-so-badge ${cls}">${esc(value || '-')}</span>`;
  }

  function settings(){ return state.data?.autoShoutout || {}; }
  function streamStatus(){ return state.data?.streamStatus || {}; }

  function isFormEditing(){
    const panel = getPanel(false);
    if (!panel) return false;
    const active = document.activeElement;
    if (active && panel.contains(active) && active.matches && active.matches('input, textarea, select')) return true;
    return panel.dataset.autoSoDirty === '1';
  }

  function markDirty(value = true){
    const panel = getPanel(false);
    if (!panel) return;
    panel.dataset.autoSoDirty = value ? '1' : '0';
  }

  async function loadAll(force){
    if (!state.activeInShoutout || !isShoutoutVisible()) return;
    if (!force && isFormEditing()) {
      scheduleRefresh();
      return;
    }
    if (state.loading && !force) return;
    state.loading = true;
    state.error = '';
    if (!isFormEditing()) render();
    try {
      const [auto, streamers, queue] = await Promise.all([
        api(API.auto),
        api(API.streamers).catch(err => ({ ok:false, error:err.message, streamers: [] })),
        api(API.queue).catch(err => ({ ok:false, error:err.message }))
      ]);
      state.data = auto;
      state.streamers = Array.isArray(streamers.streamers) ? streamers.streamers : (Array.isArray(auto?.autoShoutout?.configuredStreamers) ? auto.autoShoutout.configuredStreamers : []);
      state.queue = queue;
    } catch (err) {
      state.error = err && err.message ? err.message : String(err);
    } finally {
      state.loading = false;
      if (!isFormEditing() || force) render();
      scheduleRefresh();
    }
  }

  function scheduleRefresh(){
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = null;
    if (!state.autoRefresh || !state.activeInShoutout) return;
    refreshTimer = setTimeout(() => {
      if (state.activeInShoutout && isShoutoutVisible()) loadAll(false);
    }, 5000);
  }

  async function doAction(path, body, notice){
    state.notice = '';
    state.error = '';
    try {
      await api(path, { method: 'POST', body: JSON.stringify(body || {}) });
      state.notice = notice || 'Aktion ausgeführt.';
      markDirty(false);
      await loadAll(true);
    } catch (err) {
      state.error = err && err.message ? err.message : String(err);
      render();
    }
  }

  async function saveSettings(){
    const form = getPanel(false)?.querySelector('[data-auto-so-settings-form]');
    if (!form) return;
    const body = {
      enabled: form.querySelector('[name="enabled"]')?.checked === true,
      onlyWhenLive: form.querySelector('[name="onlyWhenLive"]')?.checked === true,
      triggerOnFirstMessageOnly: form.querySelector('[name="triggerOnFirstMessageOnly"]')?.checked === true,
      respectStreamDayLimit: form.querySelector('[name="respectStreamDayLimit"]')?.checked === true,
      sendChatMessage: form.querySelector('[name="sendChatMessage"]')?.checked === true,
      storeSkippedEvents: form.querySelector('[name="storeSkippedEvents"]')?.checked === true,
      globalCooldownMs: Number(form.querySelector('[name="globalCooldownMs"]')?.value || 0),
      perStreamerCooldownMs: Number(form.querySelector('[name="perStreamerCooldownMs"]')?.value || 0),
      queuedMessage: String(form.querySelector('[name="msgQueued"]')?.value || ''),
      messages: {
        queued: String(form.querySelector('[name="msgQueued"]')?.value || ''),
        alreadyQueued: String(form.querySelector('[name="msgAlreadyQueued"]')?.value || ''),
        alreadyReceived: String(form.querySelector('[name="msgAlreadyReceived"]')?.value || ''),
        cooldown: String(form.querySelector('[name="msgCooldown"]')?.value || ''),
        waitingStartScene: String(form.querySelector('[name="msgWaitingStartScene"]')?.value || '')
      },
      sceneGate: {
        enabled: form.querySelector('[name="sceneGateEnabled"]')?.checked === true,
        blockDuringStartScene: form.querySelector('[name="blockDuringStartScene"]')?.checked === true,
        startSceneNames: String(form.querySelector('[name="startSceneNames"]')?.value || '').split(',').map(x => x.trim()).filter(Boolean),
        retryMs: Number(form.querySelector('[name="sceneGateRetryMs"]')?.value || 15000)
      }
    };
    await doAction(API.settings, body, 'Einstellungen gespeichert.');
  }

  async function saveStreamer(){
    const form = getPanel(false)?.querySelector('[data-auto-so-streamer-form]');
    if (!form) return;
    const nameRaw = String(form.querySelector('[name="name"]')?.value || '').trim().replace(/^@+/, '');
    const login = nameRaw.toLowerCase();
    if (!login) {
      state.error = 'Bitte einen Twitch-Namen eintragen.';
      render();
      return;
    }
    const body = {
      name: nameRaw,
      login,
      displayName: nameRaw,
      enabled: form.querySelector('[name="enabled"]')?.checked === true,
      officialShoutout: form.querySelector('[name="officialShoutout"]')?.checked === true,
      videoShoutout: form.querySelector('[name="videoShoutout"]')?.checked === true,
      note: String(form.querySelector('[name="note"]')?.value || '').trim()
    };
    await doAction(API.streamers, body, `@${login} gespeichert.`);
    form.reset();
    ['enabled','officialShoutout','videoShoutout'].forEach(name => { const el = form.querySelector(`[name="${name}"]`); if (el) el.checked = true; });
  }

  async function removeStreamer(login){
    const clean = String(login || '').trim().replace(/^@+/, '').toLowerCase();
    if (!clean) return;
    if (!confirm(`Auto-Shoutout für @${clean} entfernen/deaktivieren?`)) return;
    await doAction(API.remove, { login: clean }, `@${clean} entfernt.`);
  }

  async function toggleStreamer(login, enabled){
    const row = state.streamers.find(item => String(item.login || '').toLowerCase() === String(login || '').toLowerCase());
    if (!row) return;
    await doAction(API.streamers, {
      login: row.login,
      displayName: row.displayName || row.login,
      enabled,
      officialShoutout: row.officialShoutout !== false,
      videoShoutout: row.videoShoutout !== false,
      note: row.note || ''
    }, `@${row.login} ${enabled ? 'aktiviert' : 'deaktiviert'}.`);
  }

  function fillStreamerForm(login){
    const row = state.streamers.find(item => String(item.login || '').toLowerCase() === String(login || '').toLowerCase());
    const form = getPanel(false)?.querySelector('[data-auto-so-streamer-form]');
    if (!row || !form) return;
    form.querySelector('[name="name"]').value = row.displayName || row.login || '';
    form.querySelector('[name="enabled"]').checked = row.enabled !== false;
    form.querySelector('[name="officialShoutout"]').checked = row.officialShoutout !== false;
    form.querySelector('[name="videoShoutout"]').checked = row.videoShoutout !== false;
    form.querySelector('[name="note"]').value = row.note || '';
    markDirty(true);
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function testChat(login){
    const row = state.streamers.find(item => String(item.login || '').toLowerCase() === String(login || '').toLowerCase());
    const clean = String(row?.login || login || '').trim().replace(/^@+/, '').toLowerCase();
    const display = String(row?.displayName || clean || '').trim();
    if (!clean) return;
    const url = `${API.testChat}?login=${encodeURIComponent(clean)}&displayName=${encodeURIComponent(display)}`;
    await doAction(url, {}, `Test-Chat für @${clean} gesendet.`);
  }

  function renderHero(){
    const s = settings();
    const ss = streamStatus();
    const display = state.queue?.displayQueue || {};
    const official = state.queue?.officialQueue || {};
    return `
      <div class="auto-so-hero glass">
        <div>
          <div class="auto-so-kicker">Auto-Shoutout / im Shoutout-System</div>
          <h2>Auto-Shoutouts</h2>
          <p>Streamer-Liste aus der Datenbank verwalten. Die Ausführung läuft über DisplayQueue, Video-Shoutout und OfficialQueue.</p>
          ${mainRefreshWasPausedByAutoTab ? '<p class="auto-so-muted">Der Shoutout-Auto-Refresh ist im Auto-Tab pausiert, damit Eingaben nicht überschrieben werden.</p>' : ''}
        </div>
        <div class="auto-so-hero-grid">
          <div class="auto-so-metric"><small>Auto-SO</small><strong>${s.enabled ? 'AKTIV' : 'AUS'}</strong><span>${boolBadge(s.enabled)}</span></div>
          <div class="auto-so-metric"><small>Live-Gate</small><strong>${s.onlyWhenLive ? 'aktiv' : 'aus'}</strong><span>${s.onlyWhenLive ? 'blockiert offline' : 'nur Anzeige'}</span></div>
          <div class="auto-so-metric"><small>Start-Szene</small><strong>${s.sceneGate?.active ? 'SPERRE' : 'frei'}</strong><span>${esc(s.sceneGate?.currentScene || '-')}</span></div>
          <div class="auto-so-metric"><small>Stream</small><strong>${ss.live ? 'LIVE' : (ss.statusKnown === false ? 'UNBEKANNT' : 'OFFLINE')}</strong><span>${esc(ss.upstreamSource || ss.source || '-')} · ${ss.stale ? 'stale' : 'frisch'}</span></div>
          <div class="auto-so-metric"><small>Streamer</small><strong>${esc(s.configuredStreamerCount || state.streamers.length || 0)}</strong><span>${statusBadge(s.configSource || '-')}</span></div>
          <div class="auto-so-metric"><small>Display offen</small><strong>${esc(display.pending ?? 0)}</strong><span>${display.cooldownRunning ? fmtMs(display.cooldownRemainingMs) : 'bereit'}</span></div>
          <div class="auto-so-metric"><small>Official offen</small><strong>${esc(official.pending ?? 0)}</strong><span>${official.lastError ? 'Fehler vorhanden' : 'bereit'}</span></div>
        </div>
      </div>
    `;
  }

  function renderSettings(){
    const s = settings();
    const m = s.messages || {};
    const sg = s.sceneGate || {};
    return `
      <div class="auto-so-card">
        <div class="auto-so-card-head"><div><h3>Globale Auto-SO-Einstellungen</h3><p>DB-Settings, Chatmeldungen und Start-Szene-Sperre.</p></div></div>
        <form data-auto-so-settings-form class="auto-so-settings-grid">
          <label class="auto-so-check"><input type="checkbox" name="enabled" ${s.enabled ? 'checked' : ''}> Auto-Shoutout aktiv</label>
          <label class="auto-so-check"><input type="checkbox" name="onlyWhenLive" ${s.onlyWhenLive ? 'checked' : ''}> Nur wenn Live</label>
          <label class="auto-so-check"><input type="checkbox" name="triggerOnFirstMessageOnly" ${s.triggerOnFirstMessageOnly !== false ? 'checked' : ''}> Nur erste Nachricht</label>
          <label class="auto-so-check"><input type="checkbox" name="respectStreamDayLimit" ${s.respectStreamDayLimit !== false ? 'checked' : ''}> Streamtag-Limit beachten</label>
          <label class="auto-so-check"><input type="checkbox" name="sendChatMessage" ${s.sendChatMessage !== false ? 'checked' : ''}> Chatmeldung senden</label>
          <label class="auto-so-check"><input type="checkbox" name="storeSkippedEvents" ${s.storeSkippedEvents ? 'checked' : ''}> Skips speichern</label>
          <label><span>Global-Cooldown ms</span><input type="number" name="globalCooldownMs" min="0" step="1000" value="${esc(s.globalCooldownMs ?? 120000)}"></label>
          <label><span>Streamer-Cooldown ms</span><input type="number" name="perStreamerCooldownMs" min="0" step="1000" value="${esc(s.perStreamerCooldownMs ?? 43200000)}"></label>
          <label class="auto-so-check"><input type="checkbox" name="sceneGateEnabled" ${sg.enabled !== false ? 'checked' : ''}> Start-Szene-Sperre aktiv</label>
          <label class="auto-so-check"><input type="checkbox" name="blockDuringStartScene" ${sg.blockDuringStartScene !== false ? 'checked' : ''}> während Start-Szene blockieren</label>
          <label><span>Start-Szene Retry ms</span><input type="number" name="sceneGateRetryMs" min="1000" step="1000" value="${esc(sg.retryMs ?? 15000)}"></label>
          <label class="auto-so-wide"><span>Start-Szenen, kommagetrennt</span><input type="text" name="startSceneNames" value="${esc(Array.isArray(sg.startSceneNames) ? sg.startSceneNames.join(', ') : '')}"></label>
          <label class="auto-so-wide"><span>Warteliste hinzugefügt</span><input type="text" name="msgQueued" value="${esc(m.queued || s.queuedMessage || '')}"></label>
          <label class="auto-so-wide"><span>Schon in Warteliste</span><input type="text" name="msgAlreadyQueued" value="${esc(m.alreadyQueued || '')}"></label>
          <label class="auto-so-wide"><span>Bereits Shouti erhalten</span><input type="text" name="msgAlreadyReceived" value="${esc(m.alreadyReceived || '')}"></label>
          <label class="auto-so-wide"><span>Cooldown-Meldung</span><input type="text" name="msgCooldown" value="${esc(m.cooldown || '')}"></label>
          <label class="auto-so-wide"><span>Wartet wegen Start-Szene</span><input type="text" name="msgWaitingStartScene" value="${esc(m.waitingStartScene || '')}"></label>
          <div class="auto-so-form-actions"><button type="button" data-auto-so-save-settings>Speichern</button></div>
        </form>
      </div>
    `;
  }

  function renderStreamerForm(){
    return `
      <div class="auto-so-card">
        <div class="auto-so-card-head"><div><h3>Streamer hinzufügen / bearbeiten</h3><p>Ein Twitch-Name reicht. Das Backend normalisiert den Login automatisch.</p></div></div>
        <form data-auto-so-streamer-form class="auto-so-streamer-form">
          <label class="auto-so-wide"><span>Twitch-Name</span><input name="name" type="text" placeholder="fadjoe81" autocomplete="off"></label>
          <label><span>Notiz</span><input name="note" type="text" placeholder="z. B. Partnerstreamer"></label>
          <label class="auto-so-check"><input name="enabled" type="checkbox" checked> Aktiv</label>
          <label class="auto-so-check"><input name="videoShoutout" type="checkbox" checked> Video-SO</label>
          <label class="auto-so-check"><input name="officialShoutout" type="checkbox" checked> offizieller SO</label>
          <div class="auto-so-form-actions"><button type="button" data-auto-so-save-streamer>Streamer speichern</button></div>
        </form>
      </div>
    `;
  }

  function renderStreamers(){
    const rows = state.streamers || [];
    return `
      <div class="auto-so-card auto-so-wide">
        <div class="auto-so-card-head"><div><h3>Konfigurierte Streamer</h3><p>Schreibt einer dieser Streamer im Chat, wird ein Auto-SO ausgelöst, sofern Cooldowns und Limits passen.</p></div><div>${esc(rows.length)} Einträge</div></div>
        <div class="auto-so-table-wrap">
          <table class="auto-so-table">
            <thead><tr><th>Login</th><th>Status</th><th>Video</th><th>Official</th><th>Notiz</th><th>Aktualisiert</th><th>Aktion</th></tr></thead>
            <tbody>
              ${rows.length ? rows.map(row => `
                <tr>
                  <td><strong>@${esc(row.displayName || row.login || '-')}</strong><small>${esc(row.login || '')}</small></td>
                  <td>${boolBadge(row.enabled !== false, 'aktiv', 'aus')}</td>
                  <td>${boolBadge(row.videoShoutout !== false, 'ja', 'nein')}</td>
                  <td>${boolBadge(row.officialShoutout !== false, 'ja', 'nein')}</td>
                  <td>${esc(row.note || '')}</td>
                  <td>${fmtDate(row.updatedAt || row.updated_at)}</td>
                  <td class="auto-so-actions">
                    <button type="button" data-auto-so-test="${esc(row.login)}">Test</button>
                    <button type="button" data-auto-so-edit="${esc(row.login)}">Bearbeiten</button>
                    <button type="button" data-auto-so-toggle="${esc(row.login)}" data-enabled-next="${row.enabled === false ? '1' : '0'}">${row.enabled === false ? 'Aktivieren' : 'Deaktivieren'}</button>
                    <button type="button" class="danger" data-auto-so-remove="${esc(row.login)}">Entfernen</button>
                  </td>
                </tr>
              `).join('') : '<tr><td colspan="7" class="auto-so-empty">Noch keine Streamer gespeichert.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderRecent(){
    const events = Array.isArray(settings().recentEvents) ? settings().recentEvents : [];
    const st = settings().state || {};
    return `
      <div class="auto-so-card auto-so-wide">
        <div class="auto-so-card-head"><div><h3>Letzte Auto-SO-Ereignisse</h3><p>Trigger/Skip-Historie aus der Auto-SO-Event-Tabelle.</p></div></div>
        <div class="auto-so-facts">
          <div><small>Letzter Trigger</small><strong>${esc(st.lastTriggeredLogin || '-')}</strong><span>${fmtDate(st.lastTriggeredAt)}</span></div>
          <div><small>Letzter Skip</small><strong>${esc(st.lastSkippedLogin || '-')}</strong><span>${esc(st.lastSkipReason || '-')}</span></div>
          <div><small>Letzter Check</small><strong>${fmtDate(st.lastCheckedAt)}</strong><span>${esc(st.lastError || '')}</span></div>
        </div>
        <div class="auto-so-table-wrap">
          <table class="auto-so-table auto-so-table-compact">
            <thead><tr><th>ID</th><th>Ziel</th><th>Auslöser</th><th>Status</th><th>Grund</th><th>Queue</th><th>Zeit</th></tr></thead>
            <tbody>
              ${events.length ? events.slice(0, 20).map(row => `
                <tr>
                  <td>${esc(row.id)}</td>
                  <td><strong>@${esc(row.target_display || row.targetDisplay || row.target_login || row.targetLogin || '-')}</strong></td>
                  <td>${esc(row.trigger_display || row.triggerDisplay || row.trigger_login || row.triggerLogin || '-')}</td>
                  <td>${statusBadge(row.status)}</td>
                  <td>${esc(row.reason || '')}</td>
                  <td>${esc(row.display_queue_id || row.displayQueueId || '')}</td>
                  <td>${fmtDate(row.created_at || row.createdAt)}</td>
                </tr>
              `).join('') : '<tr><td colspan="7" class="auto-so-empty">Noch keine Events.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderStreamStatus(){
    const ss = streamStatus();
    const sg = settings().sceneGate || {};
    return `
      <div class="auto-so-card">
        <div class="auto-so-card-head"><div><h3>Status / Start-Szene-Sperre</h3><p>Start-Szene blockiert Shoutouts unabhängig vom Live-Gate.</p></div></div>
        <div class="auto-so-facts">
          <div><small>Shoutout-Sperre</small><strong>${sg.active ? statusBadge('AKTIV') : statusBadge('frei')}</strong><span>${esc(sg.reason || '')}</span></div>
          <div><small>Aktuelle Szene</small><strong>${esc(sg.currentScene || '-')}</strong><span>${sg.enabled === false ? 'Gate aus' : 'Gate an'}</span></div>
          <div><small>Start-Szenen</small><strong>${esc(Array.isArray(sg.startSceneNames) ? sg.startSceneNames.length : 0)}</strong><span>${esc(Array.isArray(sg.startSceneNames) ? sg.startSceneNames.join(', ') : '')}</span></div>
          <div><small>Status</small><strong>${ss.live ? statusBadge('LIVE') : statusBadge(ss.statusKnown === false ? 'UNBEKANNT' : 'OFFLINE')}</strong></div>
          <div><small>Quelle</small><strong>${esc(ss.source || '-')}</strong><span>${esc(ss.upstreamSource || '')}</span></div>
          <div><small>Stale</small><strong>${boolBadge(ss.stale, 'stale', 'frisch')}</strong></div>
          <div><small>Bekannt</small><strong>${boolBadge(ss.statusKnown !== false, 'ja', 'nein')}</strong></div>
          <div><small>Viewer</small><strong>${esc(ss.viewerCount || 0)}</strong></div>
          <div><small>Letzte Prüfung</small><strong>${fmtDate(ss.lastCheckedAt)}</strong></div>
          <div><small>Letztes Live</small><strong>${fmtDate(ss.lastLiveAt)}</strong></div>
          <div><small>Fehler</small><strong>${esc(ss.error || '-')}</strong></div>
        </div>
      </div>
    `;
  }

  function render(){
    if (!state.activeInShoutout) return;
    ensureTab();
    hideNativePanel(true);
    const panel = getPanel(true);
    if (!panel) return;
    panel.innerHTML = `
      <div class="auto-so-shell">
        <div class="auto-so-toolbar">
          <div><strong>Auto-Shoutouts</strong><span>${state.loading ? 'lädt...' : 'bereit'}</span></div>
          <div class="auto-so-toolbar-actions">
            <label class="auto-so-check"><input type="checkbox" data-auto-so-auto-refresh ${state.autoRefresh ? 'checked' : ''}> Auto-Refresh</label>
            <button type="button" data-auto-so-refresh>Aktualisieren</button>
          </div>
        </div>
        ${state.error ? `<div class="auto-so-alert bad">${esc(state.error)}</div>` : ''}
        ${state.notice ? `<div class="auto-so-alert ok">${esc(state.notice)}</div>` : ''}
        ${renderHero()}
        <div class="auto-so-grid">
          ${renderSettings()}
          ${renderStreamStatus()}
          ${renderStreamerForm()}
        </div>
        ${renderStreamers()}
        ${renderRecent()}
      </div>
    `;
  }

  function bind(){
    document.addEventListener('click', ev => {
      const target = ev.target;
      if (!target) return;
      const autoTab = target.closest('[data-auto-so-tab]');
      if (autoTab && getRoot()?.contains(autoTab)) {
        ev.preventDefault();
        ev.stopPropagation();
        activateAutoTab();
        return;
      }
      const nativeTab = target.closest('[data-shoutout-tab]');
      if (nativeTab && getRoot()?.contains(nativeTab)) {
        deactivateAutoTab();
        return;
      }
      if (!state.activeInShoutout) return;
      if (target.closest('[data-auto-so-refresh]')) { ev.preventDefault(); return loadAll(true); }
      if (target.closest('[data-auto-so-save-settings]')) { ev.preventDefault(); return saveSettings(); }
      if (target.closest('[data-auto-so-save-streamer]')) { ev.preventDefault(); return saveStreamer(); }
      const test = target.closest('[data-auto-so-test]');
      if (test) { ev.preventDefault(); return testChat(test.dataset.autoSoTest || ''); }
      const edit = target.closest('[data-auto-so-edit]');
      if (edit) { ev.preventDefault(); return fillStreamerForm(edit.dataset.autoSoEdit || ''); }
      const remove = target.closest('[data-auto-so-remove]');
      if (remove) { ev.preventDefault(); return removeStreamer(remove.dataset.autoSoRemove || ''); }
      const toggle = target.closest('[data-auto-so-toggle]');
      if (toggle) { ev.preventDefault(); return toggleStreamer(toggle.dataset.autoSoToggle || '', toggle.dataset.enabledNext === '1'); }
    }, true);

    document.addEventListener('input', ev => {
      const panel = getPanel(false);
      if (panel && panel.contains(ev.target) && ev.target.matches?.('input, textarea, select')) markDirty(true);
    });

    document.addEventListener('change', ev => {
      const panel = getPanel(false);
      if (panel && panel.contains(ev.target) && ev.target.matches?.('input, textarea, select')) markDirty(true);
      if (ev.target?.matches?.('[data-auto-so-auto-refresh]')) {
        state.autoRefresh = ev.target.checked === true;
        scheduleRefresh();
      }
    });

    document.addEventListener('keydown', ev => {
      if (state.activeInShoutout && ev.key === 'Enter' && ev.target?.closest?.('[data-auto-so-streamer-form]')) {
        ev.preventDefault();
        saveStreamer();
      }
    });
  }

  function maintain(){
    if (!isShoutoutVisible()) return;
    ensureTab();
    if (state.activeInShoutout) {
      pauseMainShoutoutRefresh();
      hideNativePanel(true);
      const btn = ensureTab();
      if (btn) {
        getRoot().querySelectorAll('.shoutout-tab').forEach(tab => {
          tab.classList.toggle('active', tab === btn);
          tab.setAttribute('aria-selected', tab === btn ? 'true' : 'false');
        });
      }
      if (!getPanel(false)) render();
    }
  }

  function init(){
    bind();
    window.addEventListener('cgn:module-show', ev => {
      if (ev.detail?.module === 'shoutout') {
        setTimeout(() => {
          ensureTab();
          if (state.activeInShoutout) activateAutoTab();
        }, 0);
      } else {
        deactivateAutoTab();
      }
    });
    setInterval(maintain, 1000);
    if (document.readyState !== 'loading') setTimeout(maintain, 0);
    else document.addEventListener('DOMContentLoaded', () => setTimeout(maintain, 0));
  }

  init();

  return { init, loadAll, render, activateAutoTab, deactivateAutoTab };
})();
