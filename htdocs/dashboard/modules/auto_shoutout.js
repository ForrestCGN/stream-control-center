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

  let root = null;
  let refreshTimer = null;
  const state = {
    data: null,
    streamers: [],
    queue: null,
    loading: false,
    error: '',
    notice: '',
    autoRefresh: true
  };

  function esc(v){
    return window.CGN?.esc
      ? window.CGN.esc(v)
      : String(v ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function registerDashboardModule(){
    if (!window.CGN) return;
    window.CGN.modules = window.CGN.modules || {};
    window.CGN.moduleCatalog = window.CGN.moduleCatalog || {};
    window.CGN.sections = window.CGN.sections || {};
    window.CGN.favorites = Array.isArray(window.CGN.favorites) ? window.CGN.favorites : [];

    window.CGN.modules.auto_shoutout = {
      title: 'Auto-Shoutouts',
      panelId: 'autoShoutoutModule',
      group: 'community',
      overlayLink: '',
      reload(){ return window.AutoShoutoutModule?.loadAll?.(true); }
    };

    window.CGN.moduleCatalog.auto_shoutout = {
      label: 'Auto-Shoutouts',
      icon: '📣',
      enabled: true,
      description: 'Automatische Video-/Twitch-Shoutouts für konfigurierte Streamer im Chat.'
    };

    const community = window.CGN.sections.community;
    if (community && Array.isArray(community.items) && !community.items.includes('auto_shoutout')) {
      const afterShoutout = community.items.indexOf('shoutout');
      const afterCommands = community.items.indexOf('commands');
      if (afterShoutout >= 0) community.items.splice(afterShoutout + 1, 0, 'auto_shoutout');
      else if (afterCommands >= 0) community.items.splice(afterCommands + 1, 0, 'auto_shoutout');
      else community.items.push('auto_shoutout');
    }

    if (!window.CGN.favorites.includes('auto_shoutout')) {
      const after = window.CGN.favorites.indexOf('shoutout');
      if (after >= 0) window.CGN.favorites.splice(after + 1, 0, 'auto_shoutout');
    }
  }

  async function api(path, options = {}){
    if (window.CGN?.api) return window.CGN.api(path, options);
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.error || data.message || `HTTP ${res.status}`);
    return data;
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
    if (['ok','active','triggered','queued','live','fresh','database'].includes(raw)) cls = 'ok';
    else if (['waiting','offline','fallback','false','warn','unknown','stale'].includes(raw)) cls = 'warn';
    else if (['failed','error','bad','removed'].includes(raw)) cls = 'bad';
    return `<span class="auto-so-badge ${cls}">${esc(value || '-')}</span>`;
  }

  function settings(){ return state.data?.autoShoutout || {}; }
  function streamStatus(){ return state.data?.streamStatus || {}; }

  async function loadAll(force){
    root = document.getElementById('autoShoutoutModule');
    if (!root) return;
    if (state.loading && !force) return;
    state.loading = true;
    state.error = '';
    render();
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
      render();
      scheduleRefresh();
    }
  }

  function scheduleRefresh(){
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = null;
    if (!state.autoRefresh) return;
    refreshTimer = setTimeout(() => {
      if (!document.getElementById('autoShoutoutModule')?.hidden) loadAll(false);
      else scheduleRefresh();
    }, 5000);
  }

  async function saveSettings(){
    const form = root?.querySelector('[data-auto-so-settings-form]');
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
      queuedMessage: String(form.querySelector('[name="queuedMessage"]')?.value || '')
    };
    await doAction(API.settings, body, 'Einstellungen gespeichert.');
  }

  async function saveStreamer(){
    const form = root?.querySelector('[data-auto-so-streamer-form]');
    if (!form) return;
    const login = String(form.querySelector('[name="login"]')?.value || '').trim().replace(/^@+/, '').toLowerCase();
    if (!login) {
      state.error = 'Bitte einen Twitch-Login eintragen.';
      render();
      return;
    }
    const body = {
      login,
      displayName: String(form.querySelector('[name="displayName"]')?.value || login).trim() || login,
      enabled: form.querySelector('[name="enabled"]')?.checked === true,
      officialShoutout: form.querySelector('[name="officialShoutout"]')?.checked === true,
      videoShoutout: form.querySelector('[name="videoShoutout"]')?.checked === true,
      note: String(form.querySelector('[name="note"]')?.value || '').trim()
    };
    await doAction(API.streamers, body, `@${login} gespeichert.`);
    form.reset();
    const checks = ['enabled','officialShoutout','videoShoutout'];
    checks.forEach(name => { const el = form.querySelector(`[name="${name}"]`); if (el) el.checked = true; });
  }

  async function doAction(path, body, notice){
    state.notice = '';
    state.error = '';
    try {
      await api(path, { method: 'POST', body: JSON.stringify(body || {}) });
      state.notice = notice || 'Aktion ausgeführt.';
      await loadAll(true);
    } catch (err) {
      state.error = err && err.message ? err.message : String(err);
      render();
    }
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

  async function fillStreamerForm(login){
    const row = state.streamers.find(item => String(item.login || '').toLowerCase() === String(login || '').toLowerCase());
    const form = root?.querySelector('[data-auto-so-streamer-form]');
    if (!row || !form) return;
    form.querySelector('[name="login"]').value = row.login || '';
    form.querySelector('[name="displayName"]').value = row.displayName || row.login || '';
    form.querySelector('[name="enabled"]').checked = row.enabled !== false;
    form.querySelector('[name="officialShoutout"]').checked = row.officialShoutout !== false;
    form.querySelector('[name="videoShoutout"]').checked = row.videoShoutout !== false;
    form.querySelector('[name="note"]').value = row.note || '';
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
          <div class="auto-so-kicker">Auto-Shoutout / Dashboard</div>
          <h2>Auto-Shoutouts</h2>
          <p>Streamer-Liste aus der Datenbank verwalten, Live-Status kontrollieren und Test-Trigger auslösen.</p>
        </div>
        <div class="auto-so-hero-grid">
          <div class="auto-so-metric"><small>Auto-SO</small><strong>${s.enabled ? 'AKTIV' : 'AUS'}</strong><span>${boolBadge(s.enabled)}</span></div>
          <div class="auto-so-metric"><small>Live-Gate</small><strong>${s.onlyWhenLive ? 'aktiv' : 'aus'}</strong><span>${s.onlyWhenLive ? 'blockiert offline' : 'nur Anzeige'}</span></div>
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
    return `
      <div class="auto-so-card">
        <div class="auto-so-card-head"><div><h3>Globale Auto-SO-Einstellungen</h3><p>Diese Werte werden über die DB gespeichert. Live-Status bleibt aktuell nur informativ, solange onlyWhenLive aus ist.</p></div></div>
        <form data-auto-so-settings-form class="auto-so-settings-grid">
          <label class="auto-so-check"><input type="checkbox" name="enabled" ${s.enabled ? 'checked' : ''}> Auto-Shoutout aktiv</label>
          <label class="auto-so-check"><input type="checkbox" name="onlyWhenLive" ${s.onlyWhenLive ? 'checked' : ''}> Nur wenn Live</label>
          <label class="auto-so-check"><input type="checkbox" name="triggerOnFirstMessageOnly" ${s.triggerOnFirstMessageOnly !== false ? 'checked' : ''}> Nur erste Nachricht</label>
          <label class="auto-so-check"><input type="checkbox" name="respectStreamDayLimit" ${s.respectStreamDayLimit !== false ? 'checked' : ''}> Streamtag-Limit beachten</label>
          <label class="auto-so-check"><input type="checkbox" name="sendChatMessage" ${s.sendChatMessage !== false ? 'checked' : ''}> Chatmeldung senden</label>
          <label class="auto-so-check"><input type="checkbox" name="storeSkippedEvents" ${s.storeSkippedEvents ? 'checked' : ''}> Skips speichern</label>
          <label><span>Global-Cooldown ms</span><input type="number" name="globalCooldownMs" min="0" step="1000" value="${esc(s.globalCooldownMs ?? 120000)}"></label>
          <label><span>Streamer-Cooldown ms</span><input type="number" name="perStreamerCooldownMs" min="0" step="1000" value="${esc(s.perStreamerCooldownMs ?? 43200000)}"></label>
          <label class="auto-so-wide"><span>Queued-Chatmeldung</span><input type="text" name="queuedMessage" value="${esc(s.queuedMessage || '')}"></label>
          <div class="auto-so-form-actions"><button type="button" data-auto-so-save-settings>Speichern</button></div>
        </form>
      </div>
    `;
  }

  function renderStreamerForm(){
    return `
      <div class="auto-so-card">
        <div class="auto-so-card-head"><div><h3>Streamer hinzufügen / bearbeiten</h3><p>Login ist der eindeutige Schlüssel. Speichern aktualisiert vorhandene Einträge.</p></div></div>
        <form data-auto-so-streamer-form class="auto-so-streamer-form">
          <label><span>Login</span><input name="login" type="text" placeholder="fadjoe81" autocomplete="off"></label>
          <label><span>DisplayName</span><input name="displayName" type="text" placeholder="Fadjoe81" autocomplete="off"></label>
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
    return `
      <div class="auto-so-card">
        <div class="auto-so-card-head"><div><h3>Live-Status Anzeige</h3><p>Nur Kontrolle im Dashboard. Auto-SO blockiert nur, wenn „Nur wenn Live“ aktiviert wird.</p></div></div>
        <div class="auto-so-facts">
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
    root = document.getElementById('autoShoutoutModule');
    if (!root) return;
    root.innerHTML = `
      <div class="auto-so-shell">
        <div class="auto-so-toolbar">
          <div><strong>Auto-Shoutout Dashboard</strong><span>${state.loading ? 'lädt...' : 'bereit'}</span></div>
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
      if (target.closest('[data-auto-so-refresh]')) return loadAll(true);
      if (target.closest('[data-auto-so-save-settings]')) return saveSettings();
      if (target.closest('[data-auto-so-save-streamer]')) return saveStreamer();
      const test = target.closest('[data-auto-so-test]');
      if (test) return testChat(test.dataset.autoSoTest || '');
      const edit = target.closest('[data-auto-so-edit]');
      if (edit) return fillStreamerForm(edit.dataset.autoSoEdit || '');
      const remove = target.closest('[data-auto-so-remove]');
      if (remove) return removeStreamer(remove.dataset.autoSoRemove || '');
      const toggle = target.closest('[data-auto-so-toggle]');
      if (toggle) return toggleStreamer(toggle.dataset.autoSoToggle || '', toggle.dataset.enabledNext === '1');
    });

    document.addEventListener('change', ev => {
      if (ev.target?.matches?.('[data-auto-so-auto-refresh]')) {
        state.autoRefresh = ev.target.checked === true;
        scheduleRefresh();
      }
    });

    document.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' && ev.target?.closest?.('[data-auto-so-streamer-form]')) {
        ev.preventDefault();
        saveStreamer();
      }
    });
  }

  function init(){
    registerDashboardModule();
    root = document.getElementById('autoShoutoutModule');
    if (root) render();
    if (localStorage.getItem('cgn-dashboard-active-module') === 'auto_shoutout' && window.CGN?.setActiveModule) {
      window.CGN.setActiveModule('auto_shoutout', { initial: true });
    }
  }

  window.addEventListener('cgn:module-show', ev => {
    if (ev.detail?.module === 'auto_shoutout') loadAll(true);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  bind();

  return { init, loadAll, render };
})();
