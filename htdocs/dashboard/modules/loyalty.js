window.LoyaltyModule = (function(){
  'use strict';

  const api = {
    status: '/api/loyalty/status',
    routes: '/api/loyalty/routes',
    streamState: '/api/loyalty/stream-state',
    streamStart: '/api/loyalty/stream-state/start?source=dashboard',
    streamStop: '/api/loyalty/stream-state/stop?source=dashboard',
    runnerStatus: '/api/loyalty/runner/status',
    runnerStart: '/api/loyalty/runner/start?source=dashboard',
    runnerStop: '/api/loyalty/runner/stop?source=dashboard',
    runnerRunOnce: '/api/loyalty/runner/run-once?source=dashboard',
    runnerEvents: '/api/loyalty/runner/events?limit=40',
    users: '/api/loyalty/users?limit=100',
    transactions: '/api/loyalty/transactions?limit=120',
    watchStates: '/api/loyalty/watch/states?limit=120',
    ignoredUsers: '/api/loyalty/ignored-users',
    settings: '/api/loyalty/settings',
    presenceActive: '/api/twitch/presence/activity/active?minutes=30&limit=100&includeJoinedOnly=true'
  };

  let root = null;
  let state = {
    tab: 'overview',
    loading: false,
    error: '',
    status: null,
    streamState: null,
    runnerStatus: null,
    users: null,
    transactions: null,
    watchStates: null,
    ignoredUsers: null,
    runnerEvents: null,
    settings: null,
    presenceActive: null,
    routes: null
  };

  function registerDashboardModule(){
    if (!window.CGN) return;
    window.CGN.modules.loyalty = {
      title: 'Loyalty-System',
      panelId: 'loyaltyModule',
      group: 'community',
      overlayLink: '',
      reload(){ return window.LoyaltyModule?.loadAll?.(true); }
    };

    window.CGN.moduleCatalog.loyalty = {
      label: 'Loyalty',
      icon: '🍪',
      enabled: true,
      description: 'Kekskrümel, Shadow-Runner, Punkte, User und Auswertungen.'
    };

    const community = window.CGN.sections?.community;
    if (community && Array.isArray(community.items) && !community.items.includes('loyalty')) {
      const vipIdx = community.items.indexOf('vip');
      if (vipIdx >= 0) community.items.splice(vipIdx + 1, 0, 'loyalty');
      else community.items.unshift('loyalty');
    }

    if (Array.isArray(window.CGN.favorites) && !window.CGN.favorites.includes('loyalty')) {
      const vipIdx = window.CGN.favorites.indexOf('vip');
      if (vipIdx >= 0) window.CGN.favorites.splice(vipIdx + 1, 0, 'loyalty');
      else window.CGN.favorites.push('loyalty');
    }

    window.SectionHomeModule?.render?.();
  }

  function esc(v){
    return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function rows(value){
    if (Array.isArray(value?.rows)) return value.rows;
    if (Array.isArray(value?.users)) return value.users;
    if (Array.isArray(value?.data?.rows)) return value.data.rows;
    if (Array.isArray(value?.data?.users)) return value.data.users;
    return [];
  }

  function fmtDate(value){
    if (!value) return '<span class="loyalty-muted">-</span>';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return esc(value);
    return esc(date.toLocaleString('de-DE'));
  }

  function fmtNumber(value){
    const n = Number(value || 0);
    return Number.isFinite(n) ? n.toLocaleString('de-DE') : '0';
  }

  function boolText(value){
    return value ? 'Ja' : 'Nein';
  }

  function getStream(){
    return state.streamState?.streamState || state.streamState || state.status?.streamState || {};
  }

  function getRunner(){
    return state.runnerStatus || state.status?.autoRunner || {};
  }

  function activeUsers(){
    return rows(state.presenceActive);
  }

  function users(){
    return rows(state.users);
  }

  function transactions(){
    return rows(state.transactions);
  }

  function ignoredUsers(){
    return rows(state.ignoredUsers);
  }

  function settings(){
    return rows(state.settings?.settings || state.settings);
  }

  function runnerEvents(){
    return rows(state.runnerEvents);
  }

  function aggregateTransactions(){
    const tx = transactions();
    const totalEarned = tx.filter(t => Number(t.amount) > 0).reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const totalSpent = tx.filter(t => Number(t.amount) < 0).reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
    const byType = {};
    const byReason = {};
    tx.forEach(t => {
      const type = t.type || 'unknown';
      const reason = t.reason || 'unknown';
      byType[type] = (byType[type] || 0) + 1;
      byReason[reason] = (byReason[reason] || 0) + 1;
    });
    return { totalEarned, totalSpent, byType, byReason };
  }

  async function loadAll(force){
    root = document.getElementById('loyaltyModule');
    if (!root || !window.CGN) return;
    if (!force && state.status && state.runnerStatus) { render(); return; }

    state.loading = true;
    state.error = '';
    render();

    try {
      const [
        status,
        streamState,
        runnerStatus,
        usersRes,
        transactionsRes,
        watchStatesRes,
        ignoredRes,
        eventsRes,
        settingsRes,
        presenceRes,
        routesRes
      ] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.streamState).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.runnerStatus).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.users).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.transactions).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.watchStates).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.ignoredUsers).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.runnerEvents).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.settings).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.presenceActive).catch(err => ({ ok:false, error:err.message, data:{ users:[] } })),
        window.CGN.api(api.routes).catch(err => ({ ok:false, error:err.message, routes:[] }))
      ]);

      state = {
        ...state,
        loading: false,
        error: '',
        status,
        streamState,
        runnerStatus,
        users: usersRes,
        transactions: transactionsRes,
        watchStates: watchStatesRes,
        ignoredUsers: ignoredRes,
        runnerEvents: eventsRes,
        settings: settingsRes,
        presenceActive: presenceRes,
        routes: routesRes
      };
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }

    render();
  }

  async function callAndReload(url, options = {}){
    await window.CGN.api(url, options);
    await loadAll(true);
  }

  function getSettingInputValue(row){
    const el = root?.querySelector(`[data-loyalty-setting="${CSS.escape(row.key)}"]`);
    if (!el) return row.value;
    if (row.valueType === 'boolean') return el.value === 'true';
    if (row.valueType === 'number') return Number(el.value);
    if (row.valueType === 'json') {
      try { return JSON.parse(el.value); }
      catch (err) { throw new Error(`JSON ungültig bei ${row.key}: ${err.message}`); }
    }
    return el.value;
  }

  async function saveSetting(key){
    const row = settings().find(item => item.key === key);
    if (!row) return;
    await window.CGN.api(api.settings, {
      method: 'POST',
      body: JSON.stringify({ key, value: getSettingInputValue(row) })
    });
    await loadAll(true);
  }

  async function addIgnoredUser(){
    const login = root?.querySelector('[data-loyalty-ignore-login]')?.value?.trim();
    if (!login) throw new Error('Bitte Login eintragen.');
    const reason = root?.querySelector('[data-loyalty-ignore-reason]')?.value?.trim() || 'dashboard';
    await window.CGN.api(api.ignoredUsers, {
      method: 'POST',
      body: JSON.stringify({ login, reason, source: 'dashboard' })
    });
    await loadAll(true);
  }

  async function disableIgnoredUser(login){
    if (!login) return;
    if (!window.confirm(`${login} wirklich aus der Ignore-Liste deaktivieren?`)) return;
    await window.CGN.api(`/api/loyalty/ignored-users/${encodeURIComponent(login)}`, { method: 'DELETE' });
    await loadAll(true);
  }

  function renderKpis(){
    const status = state.status || {};
    const stream = getStream();
    const runner = getRunner();
    const agg = aggregateTransactions();
    const counts = status.counts || {};
    return `
      <div class="loyalty-kpis">
        <div><strong>${esc(status.mode || '-')}</strong><span>Modus</span></div>
        <div><strong>${stream?.effective?.live ? 'Live' : 'Offline'}</strong><span>Stream-State</span></div>
        <div><strong>${runner.enabled ? 'An' : 'Aus'}</strong><span>Auto Runner</span></div>
        <div><strong>${fmtNumber(counts.users ?? users().length)}</strong><span>User</span></div>
        <div><strong>${fmtNumber(counts.transactions ?? transactions().length)}</strong><span>Transaktionen</span></div>
        <div><strong>${fmtNumber(agg.totalEarned)}</strong><span>Kekskrümel vergeben</span></div>
      </div>
    `;
  }

  function renderOverview(){
    const status = state.status || {};
    const stream = getStream();
    const runner = getRunner();
    const presenceCount = activeUsers().length;
    return `
      <div class="loyalty-grid">
        <section class="loyalty-card loyalty-card-main">
          <h3>Systemstatus</h3>
          ${renderKpis()}
          <div class="loyalty-rows">
            <div><span>Currency</span><strong>${esc(status.currencyName || '-')}</strong></div>
            <div><span>StreamElements aktiv</span><strong>${boolText(status.streamElementsStillActive)}</strong></div>
            <div><span>Shadow Mode</span><strong>${boolText(status.shadowMode)}</strong></div>
            <div><span>Schema</span><strong>${esc(status.schema?.ok ? 'OK' : 'Fehler')} · ${esc(status.schema?.version ?? '-')}</strong></div>
            <div><span>Aktive Presence-User</span><strong>${fmtNumber(presenceCount)}</strong></div>
            <div><span>Runner letzter Lauf</span><strong>${fmtDate(runner.lastRunAt)}</strong></div>
          </div>
        </section>

        <section class="loyalty-card">
          <h3>Live-Gate</h3>
          <div class="loyalty-state-box ${stream?.effective?.live ? 'is-live' : 'is-offline'}">
            <strong>${stream?.effective?.live ? 'Stream gilt als LIVE' : 'Stream gilt als OFFLINE'}</strong>
            <span>Quelle: ${esc(stream?.effective?.source || '-')}</span>
          </div>
          <div class="loyalty-rows compact">
            <div><span>Manual aktiv</span><strong>${boolText(stream?.manual?.active)}</strong></div>
            <div><span>Manual live</span><strong>${boolText(stream?.manual?.live)}</strong></div>
            <div><span>Manual source</span><strong>${esc(stream?.manual?.source || '-')}</strong></div>
            <div><span>Twitch Auto live</span><strong>${boolText(stream?.auto?.live)}</strong></div>
            <div><span>Auto geprüft</span><strong>${fmtDate(stream?.auto?.checkedAt)}</strong></div>
          </div>
        </section>
      </div>
    `;
  }

  function renderControl(){
    const runner = getRunner();
    const stream = getStream();
    return `
      <div class="loyalty-grid">
        <section class="loyalty-card">
          <h3>Stream-State steuern</h3>
          <p class="loyalty-note">Das entspricht den Streamer.bot-Start/Stop-Routen. Normal setzt Streamer.bot diese Werte automatisch.</p>
          <div class="loyalty-actions">
            <button type="button" data-loyalty-action="stream-start">Stream Start setzen</button>
            <button type="button" data-loyalty-action="stream-stop">Stream Stop setzen</button>
          </div>
          <div class="loyalty-rows compact">
            <div><span>Effective live</span><strong>${boolText(stream?.effective?.live)}</strong></div>
            <div><span>Quelle</span><strong>${esc(stream?.effective?.source || '-')}</strong></div>
            <div><span>Letztes Manual Update</span><strong>${fmtDate(stream?.manual?.updatedAt)}</strong></div>
          </div>
        </section>

        <section class="loyalty-card">
          <h3>Auto Shadow Runner</h3>
          <p class="loyalty-note">Der Runner verarbeitet Presence-User automatisch im Intervall. Er bleibt beim Boot aus, bis du ihn startest.</p>
          <div class="loyalty-actions">
            <button type="button" data-loyalty-action="runner-run-once">Einmal laufen lassen</button>
            <button type="button" data-loyalty-action="runner-start">Runner starten</button>
            <button type="button" class="danger" data-loyalty-action="runner-stop">Runner stoppen</button>
          </div>
          <div class="loyalty-rows compact">
            <div><span>Aktiv</span><strong>${boolText(runner.enabled)}</strong></div>
            <div><span>Timer</span><strong>${boolText(runner.timerActive)}</strong></div>
            <div><span>Intervall</span><strong>${fmtNumber(runner.config?.effectiveIntervalSeconds || runner.config?.intervalSeconds || 0)} Sekunden</strong></div>
            <div><span>Runs</span><strong>${fmtNumber(runner.runCount)} / Fehler ${fmtNumber(runner.errorCount)}</strong></div>
            <div><span>Letzter Fehler</span><strong>${esc(runner.lastError || '-')}</strong></div>
          </div>
        </section>
      </div>
    `;
  }

  function renderStats(){
    const tx = transactions();
    const userRows = users().slice().sort((a,b) => Number(b.activeBalance || 0) - Number(a.activeBalance || 0)).slice(0, 12);
    const agg = aggregateTransactions();
    const reasons = Object.entries(agg.byReason).sort((a,b) => b[1] - a[1]).slice(0, 10);
    return `
      <div class="loyalty-grid">
        <section class="loyalty-card">
          <h3>Top User</h3>
          ${renderUserTable(userRows)}
        </section>
        <section class="loyalty-card">
          <h3>Auswertung</h3>
          <div class="loyalty-kpis two">
            <div><strong>${fmtNumber(agg.totalEarned)}</strong><span>Verdient</span></div>
            <div><strong>${fmtNumber(agg.totalSpent)}</strong><span>Ausgegeben</span></div>
          </div>
          <div class="loyalty-chip-list">
            ${reasons.map(([reason,count]) => `<span><strong>${esc(reason)}</strong>${fmtNumber(count)}</span>`).join('') || '<span>Keine Daten</span>'}
          </div>
        </section>
      </div>
      <section class="loyalty-card">
        <h3>Letzte Transaktionen</h3>
        ${renderTransactionsTable(tx.slice(0, 30))}
      </section>
    `;
  }

  function renderUsers(){
    return `
      <div class="loyalty-grid">
        <section class="loyalty-card loyalty-card-main">
          <h3>User / Punkte</h3>
          ${renderUserTable(users())}
        </section>
        <section class="loyalty-card">
          <h3>Aktive Twitch Presence</h3>
          ${renderPresenceList(activeUsers())}
        </section>
      </div>
    `;
  }

  function renderUserTable(list){
    if (!list.length) return '<div class="loyalty-empty">Keine Userdaten.</div>';
    return `<div class="loyalty-table-wrap"><table><thead><tr><th>User</th><th>Shadow</th><th>Live</th><th>Verdient</th><th>Letzter Seen</th></tr></thead><tbody>
      ${list.map(row => `<tr>
        <td><strong>${esc(row.displayName || row.login)}</strong><small>${esc(row.login || '')}</small></td>
        <td>${fmtNumber(row.balanceShadow ?? row.activeBalance)}</td>
        <td>${fmtNumber(row.balanceLive)}</td>
        <td>${fmtNumber(row.totalEarnedShadow)}</td>
        <td>${fmtDate(row.lastSeenAt)}</td>
      </tr>`).join('')}
    </tbody></table></div>`;
  }

  function renderTransactionsTable(list){
    if (!list.length) return '<div class="loyalty-empty">Keine Transaktionen.</div>';
    return `<div class="loyalty-table-wrap"><table><thead><tr><th>Zeit</th><th>User</th><th>Typ</th><th>Grund</th><th>Betrag</th><th>Balance</th></tr></thead><tbody>
      ${list.map(row => `<tr>
        <td>${fmtDate(row.createdAt)}</td>
        <td><strong>${esc(row.displayName || row.login)}</strong><small>${esc(row.login || '')}</small></td>
        <td>${esc(row.type || '-')}</td>
        <td>${esc(row.reason || '-')}</td>
        <td>${fmtNumber(row.amount)}</td>
        <td>${fmtNumber(row.balanceAfter)}</td>
      </tr>`).join('')}
    </tbody></table></div>`;
  }

  function renderPresenceList(list){
    if (!list.length) return '<div class="loyalty-empty">Keine aktiven Presence-User.</div>';
    return `<div class="loyalty-mini-list">${list.map(row => `
      <article>
        <strong>${esc(row.displayName || row.login)}</strong>
        <span>${esc(row.status || '-')} · Sub: ${boolText(row.subscriber)} · ${esc(row.subscriberTier || 'none')}</span>
        <small>bis ${fmtDate(row.presentUntil)}</small>
      </article>`).join('')}</div>`;
  }

  function renderIgnored(){
    const list = ignoredUsers();
    return `
      <div class="loyalty-grid">
        <section class="loyalty-card">
          <h3>Ignore-Liste</h3>
          <p class="loyalty-note">Bots und Service-Accounts sammeln keine Kekskrümel. Bestehende Transaktionen werden dadurch nicht gelöscht.</p>
          <div class="loyalty-ignore-form">
            <input type="text" placeholder="login, z. B. streamstickers" data-loyalty-ignore-login>
            <input type="text" placeholder="reason" value="service_bot" data-loyalty-ignore-reason>
            <button type="button" data-loyalty-action="ignore-add">Hinzufügen</button>
          </div>
          ${list.length ? `<div class="loyalty-mini-list">${list.map(row => `
            <article>
              <strong>${esc(row.login)}</strong>
              <span>${esc(row.reason || '-')} · ${row.enabled ? 'aktiv' : 'inaktiv'} · ${esc(row.source || '-')}</span>
              <small>${fmtDate(row.updatedAt || row.createdAt)}</small>
              ${row.enabled ? `<button type="button" class="small danger" data-loyalty-unignore="${esc(row.login)}">Deaktivieren</button>` : ''}
            </article>`).join('')}</div>` : '<div class="loyalty-empty">Keine ignorierten User.</div>'}
        </section>

        <section class="loyalty-card">
          <h3>Empfehlung</h3>
          <p class="loyalty-note">Aus dem Test sollten diese Service-Accounts ignoriert sein:</p>
          <div class="loyalty-chip-list">
            <span>streamelements</span>
            <span>streamstickers</span>
            <span>kofistreambot</span>
            <span>forrestcgn</span>
          </div>
        </section>
      </div>
    `;
  }

  function renderConfig(){
    const groups = [
      ['Core', row => ['mode','currencyName','enabled','streamElementsStillActive'].includes(row.key)],
      ['Features', row => row.key.startsWith('features.')],
      ['Watch', row => row.key.startsWith('watch.')],
      ['Stream-State', row => row.key.startsWith('streamState.')],
      ['Presence', row => row.key.startsWith('presence.')],
      ['Auto Runner', row => row.key.startsWith('autoRunner.')],
      ['Rest', row => true]
    ];
    const all = settings();
    const used = new Set();

    return `<div class="loyalty-config-list">
      ${groups.map(([label, predicate]) => {
        const list = all.filter(row => !used.has(row.key) && predicate(row));
        list.forEach(row => used.add(row.key));
        if (!list.length) return '';
        return `<section class="loyalty-card"><h3>${esc(label)}</h3><div class="loyalty-setting-list">
          ${list.map(renderSettingRow).join('')}
        </div></section>`;
      }).join('')}
    </div>`;
  }

  function renderSettingRow(row){
    return `<article class="loyalty-setting-row">
      <div>
        <strong>${esc(row.key)}</strong>
        <span>${esc(row.valueType || 'string')} · ${esc(row.source || '')}</span>
        <small>${esc(row.description || '')}</small>
      </div>
      <div class="loyalty-setting-input">${renderSettingInput(row)}</div>
      <button type="button" data-loyalty-save-setting="${esc(row.key)}">Speichern</button>
    </article>`;
  }

  function renderSettingInput(row){
    if (row.valueType === 'boolean') {
      return `<select data-loyalty-setting="${esc(row.key)}"><option value="true" ${row.value === true ? 'selected' : ''}>true</option><option value="false" ${row.value === false ? 'selected' : ''}>false</option></select>`;
    }
    if (row.valueType === 'json') {
      return `<textarea data-loyalty-setting="${esc(row.key)}" spellcheck="false">${esc(JSON.stringify(row.value, null, 2))}</textarea>`;
    }
    const type = row.valueType === 'number' ? 'number' : 'text';
    return `<input data-loyalty-setting="${esc(row.key)}" type="${type}" value="${esc(row.rawValue ?? row.value ?? '')}">`;
  }

  function renderEvents(){
    const list = runnerEvents();
    if (!list.length) return '<section class="loyalty-card"><h3>Runner Events</h3><div class="loyalty-empty">Keine Runner-Events.</div></section>';
    return `<section class="loyalty-card"><h3>Runner Events</h3><div class="loyalty-table-wrap"><table><thead><tr><th>Zeit</th><th>Event</th><th>Trigger</th><th>OK</th><th>Skipped</th><th>Awarded</th><th>Count</th><th>Reason</th></tr></thead><tbody>
      ${list.map(row => `<tr>
        <td>${fmtDate(row.createdAt)}</td>
        <td>${esc(row.eventType)}</td>
        <td>${esc(row.trigger)}</td>
        <td>${boolText(row.ok)}</td>
        <td>${boolText(row.skipped)}</td>
        <td>${fmtNumber(row.awarded)}</td>
        <td>${fmtNumber(row.processedCount)}</td>
        <td>${esc(row.reason || '-')}</td>
      </tr>`).join('')}
    </tbody></table></div></section>`;
  }

  function render(){
    root = document.getElementById('loyaltyModule');
    if (!root) return;

    const tabs = [
      ['overview','Übersicht'],
      ['control','Steuerung'],
      ['stats','Statistiken'],
      ['users','User'],
      ['ignored','Ignore'],
      ['config','Konfig'],
      ['events','Events']
    ];

    root.innerHTML = `
      <div class="loyalty-admin-wrap">
        <section class="loyalty-card loyalty-hero">
          <div>
            <h2>🍪 Loyalty / Kekskrümel</h2>
            <p>Shadow-Loyalty kontrollieren: Stream-State, Runner, Punkte, User, Bots, Konfiguration und Auswertungen.</p>
          </div>
          <div class="loyalty-actions">
            <button type="button" data-loyalty-refresh>Aktualisieren</button>
          </div>
        </section>

        ${state.error ? `<div class="loyalty-error">${esc(state.error)}</div>` : ''}
        ${state.loading ? '<div class="loyalty-card">Lade Loyalty-Daten...</div>' : `
          <div class="loyalty-tabs">${tabs.map(([id,label]) => `<button type="button" class="${state.tab === id ? 'active' : ''}" data-loyalty-tab="${id}">${label}</button>`).join('')}</div>
          ${state.tab === 'control' ? renderControl() :
            state.tab === 'stats' ? renderStats() :
            state.tab === 'users' ? renderUsers() :
            state.tab === 'ignored' ? renderIgnored() :
            state.tab === 'config' ? renderConfig() :
            state.tab === 'events' ? renderEvents() :
            renderOverview()}
        `}
      </div>
    `;
    bind();
  }

  function bind(){
    root?.querySelector('[data-loyalty-refresh]')?.addEventListener('click', () => loadAll(true));
    root?.querySelectorAll('[data-loyalty-tab]').forEach(btn => btn.addEventListener('click', () => {
      state.tab = btn.dataset.loyaltyTab || 'overview';
      render();
    }));

    root?.querySelectorAll('[data-loyalty-save-setting]').forEach(btn => btn.addEventListener('click', () => {
      saveSetting(btn.dataset.loyaltySaveSetting).catch(err => { state.error = err.message; render(); });
    }));

    root?.querySelectorAll('[data-loyalty-unignore]').forEach(btn => btn.addEventListener('click', () => {
      disableIgnoredUser(btn.dataset.loyaltyUnignore).catch(err => { state.error = err.message; render(); });
    }));

    root?.querySelectorAll('[data-loyalty-action]').forEach(btn => btn.addEventListener('click', () => {
      const action = btn.dataset.loyaltyAction;
      const map = {
        'stream-start': api.streamStart,
        'stream-stop': api.streamStop,
        'runner-start': api.runnerStart,
        'runner-stop': api.runnerStop,
        'runner-run-once': api.runnerRunOnce
      };
      if (action === 'ignore-add') addIgnoredUser().catch(err => { state.error = err.message; render(); });
      else if (map[action]) callAndReload(map[action]).catch(err => { state.error = err.message; render(); });
    }));
  }

  window.addEventListener('cgn:module-show', ev => {
    if (ev.detail?.module === 'loyalty') loadAll(false);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      registerDashboardModule();
      root = document.getElementById('loyaltyModule');
    });
  } else {
    registerDashboardModule();
    root = document.getElementById('loyaltyModule');
  }

  return { loadAll, render, registerDashboardModule };
})();
