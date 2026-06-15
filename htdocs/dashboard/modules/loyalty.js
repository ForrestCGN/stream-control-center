window.LoyaltyModule = (function(){
  'use strict';

  const api = {
    status: '/api/loyalty/status',
    routes: '/api/loyalty/routes',
    streamState: '/api/loyalty/stream-state',
    runnerStatus: '/api/loyalty/runner/status',
    runnerStart: '/api/loyalty/runner/start?source=dashboard',
    runnerStop: '/api/loyalty/runner/stop?source=dashboard',
    runnerRunOnce: '/api/loyalty/runner/run-once?source=dashboard',
    runnerEvents: '/api/loyalty/runner/events?limit=40',
    loyaltyEvents: '/api/loyalty/events/history?limit=120',
    loyaltyEventDetail: '/api/loyalty/events/history/',
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
    loyaltyEvents: null,
    eventDetail: null,
    historyFilters: { type: '', status: '', login: '', q: '', limit: 120 },
    settings: null,
    presenceActive: null,
    routes: null
  };

  function registerDashboardModule(){
    if (!window.CGN) return;
    window.CGN.modules.loyalty = {
      title: 'Kekskrümel-Core',
      panelId: 'loyaltyModule',
      group: 'loyalty',
      overlayLink: '',
      reload(){ return window.LoyaltyModule?.loadAll?.(true); }
    };

    window.CGN.moduleCatalog.loyalty = {
      label: 'Kekskrümel-Core',
      icon: '🍪',
      enabled: true,
      description: 'Kekskrümel, Shadow-Runner, Punkte, User und Auswertungen.'
    };

    const loyaltySection = window.CGN.sections?.loyalty;
    if (loyaltySection && Array.isArray(loyaltySection.items) && !loyaltySection.items.includes('loyalty')) {
      loyaltySection.items.unshift('loyalty');
    }

    if (Array.isArray(window.CGN.favorites) && !window.CGN.favorites.includes('loyalty')) {
      const gamesIdx = window.CGN.favorites.indexOf('loyalty_games');
      if (gamesIdx >= 0) window.CGN.favorites.splice(gamesIdx + 1, 0, 'loyalty');
      else window.CGN.favorites.push('loyalty');
    }

    window.SectionHomeModule?.render?.();
  }

  function esc(v){
    return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function rows(value){
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.rows)) return value.rows;
    if (Array.isArray(value?.users)) return value.users;
    if (Array.isArray(value?.settings)) return value.settings;
    if (Array.isArray(value?.data?.rows)) return value.data.rows;
    if (Array.isArray(value?.data?.users)) return value.data.users;
    if (Array.isArray(value?.data?.settings)) return value.data.settings;
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

  function settingDefinitions(){
    return rows(state.settings?.definitions || []);
  }

  function settingDefinitionMap(){
    const map = new Map();
    settingDefinitions().forEach(def => { if (def?.key) map.set(def.key, def); });
    return map;
  }

  function settingMeta(row){
    const def = settingDefinitionMap().get(row.key) || {};
    return { ...def, ...row, options: def.options || row.options || [] };
  }

  function runnerEvents(){
    return rows(state.runnerEvents);
  }

  function loyaltyEvents(){
    return rows(state.loyaltyEvents);
  }

  function eventHistoryFilters(){
    return state.historyFilters || { type: '', status: '', login: '', q: '', limit: 120 };
  }

  function buildEventHistoryUrl(){
    const filters = eventHistoryFilters();
    const params = new URLSearchParams();
    params.set('limit', String(filters.limit || 120));
    if (filters.type) params.set('type', filters.type);
    if (filters.status) params.set('status', filters.status);
    if (filters.login) params.set('login', filters.login);
    if (filters.q) params.set('q', filters.q);
    return `/api/loyalty/events/history?${params.toString()}`;
  }

  function historyStatusLabel(value){
    const v = String(value || '').toLowerCase();
    if (v === 'processed') return 'Gebucht';
    if (v === 'skipped') return 'Übersprungen';
    if (v === 'duplicate') return 'Duplikat';
    return v || '-';
  }

  function jsonBlock(value){
    return `<pre class="loyalty-json">${esc(JSON.stringify(value || {}, null, 2))}</pre>`;
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
        loyaltyEventsRes,
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
        window.CGN.api(buildEventHistoryUrl()).catch(err => ({ ok:false, error:err.message, rows:[] })),
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
        loyaltyEvents: loyaltyEventsRes,
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
      body: JSON.stringify({ [key]: getSettingInputValue(row), source: 'dashboard' })
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


  function eventLabel(type){
    const labels = {
      follow: 'Follow',
      subscribe: 'Sub',
      resub: 'Resub',
      gift_sub: 'Geschenk-Abo',
      gift_bomb: 'GiftBomb',
      gifted_sub_received: 'Geschenk-Abo Empfänger',
      cheer: 'Bits / Cheer',
      raid: 'Raid'
    };
    return labels[String(type || '')] || String(type || '-');
  }

  function renderCoreDiagnostics(){
    const diagnostics = state.status?.diagnostics || {};
    const binding = diagnostics.eventSubBonusBinding || state.status?.twitchEventBonusBinding || {};
    const mapping = diagnostics.bonusMapping || {};
    const gift = mapping.giftSub || {};
    const bonusValues = mapping.bonusValues || {};
    const raid = bonusValues.rules?.raid || {};
    const raidSamples = Array.isArray(raid.samples) ? raid.samples : [];
    const sampleLine = raidSamples.length ? raidSamples.map(sample => {
      const viewers = sample?.input?.viewers;
      const amount = sample?.result?.amount;
      return `${fmtNumber(viewers)} Zuschauer → ${fmtNumber(amount)}`;
    }).join(' · ') : 'Keine Beispiele geladen';
    const directEvents = Array.isArray(mapping.directBusEvents) ? mapping.directBusEvents : [];
    const complete = binding.complete === true || (Number(binding.subscriptionCount || 0) > 0 && Number(binding.subscriptionCount || 0) === Number(binding.expectedSubscriptionCount || binding.subscriptionCount || 0));

    return `
      <section class="loyalty-card loyalty-card-main loyalty-readonly-status">
        <h3>Support-Events</h3>
        <p class="loyalty-note">Übersicht für Streamer und Mods: Welche Unterstützungen ankommen, wie Geschenk-Abos behandelt werden und welche Raid-Regel aktiv ist.</p>
        <div class="loyalty-kpis two">
          <div><strong>${fmtNumber(binding.subscriptionCount || 0)} / ${fmtNumber(binding.expectedSubscriptionCount || 7)}</strong><span>Support-Events verbunden</span></div>
          <div><strong>${complete ? 'Vollständig' : 'Prüfen'}</strong><span>Anbindung</span></div>
        </div>
        <div class="loyalty-rows compact">
          <div><span>Letzte Unterstützung</span><strong>${esc(binding.lastEventKey || '-')}</strong></div>
          <div><span>Letzter User</span><strong>${esc(binding.lastLogin || '-')}</strong></div>
          <div><span>Gebucht / Fehler</span><strong>${fmtNumber(binding.processed || 0)} / ${fmtNumber(binding.errors || 0)}</strong></div>
          <div><span>Geschenk-Abo-Empfänger</span><strong>${esc(gift.receiverModeLabel || 'Nur im Verlauf anzeigen, keine Punkte')}</strong></div>
          <div><span>Empfängerpunkte</span><strong>${gift.receiverAwardsPoints ? 'Ja' : 'Nein'}</strong></div>
          <div><span>Raid-Punkte</span><strong>${raid.viewerCountAffectsPoints ? 'Nach Zuschauerzahl' : 'Fixer Betrag'}</strong></div>
        </div>
        ${directEvents.length ? `<div class="loyalty-chip-list loyalty-event-chip-list">
          ${directEvents.map(ev => `<span title="${esc(ev.eventKey || '')}"><strong>${esc(eventLabel(ev.eventType))}</strong>${ev.activeForProcessing ? 'aktiv' : 'inaktiv'}</span>`).join('')}
        </div>` : ''}
        <p class="loyalty-note loyalty-sample-line">Raid-Beispiele: ${esc(sampleLine)}</p>
      </section>
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
      <div class="loyalty-grid">
        ${renderCoreDiagnostics()}
      </div>
    `;
  }

  function renderControl(){
    const runner = getRunner();
    const stream = getStream();
    return `
      <div class="loyalty-grid">
        <section class="loyalty-card">
          <h3>Live-Gate</h3>
          <p class="loyalty-note">Loyalty setzt den Stream-State nicht mehr lokal. Effektive Live-Wahrheit kommt aus twitch_events.</p>
          <div class="loyalty-rows compact">
            <div><span>Effective live</span><strong>${boolText(stream?.effective?.live)}</strong></div>
            <div><span>Quelle</span><strong>${esc(stream?.effective?.source || '-')}</strong></div>
            <div><span>Auto geprüft</span><strong>${fmtDate(stream?.auto?.checkedAt)}</strong></div>
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
    const all = settings().map(settingMeta);
    const used = new Set();
    const groups = [
      ['Grundlagen', row => ['mode','currency.name','enabled','streamElementsStillActive'].includes(row.key)],
      ['Punkte verdienen', row => row.key.startsWith('watch.') || row.key.startsWith('features.')],
      ['Support-Boni', row => row.key.startsWith('bonuses.follow.') || row.key.startsWith('bonuses.subscribe.') || row.key.startsWith('bonuses.resub.') || row.key.startsWith('bonuses.cheer.') || row.key.startsWith('bonuses.raid.')],
      ['Geschenk-Abos', row => row.key.startsWith('bonuses.giftSub')],
      ['Stream-Status', row => row.key.startsWith('streamState.') || row.key.startsWith('presence.') || row.key.startsWith('autoRunner.')],
      ['System', row => row.key.startsWith('expiration.') || row.key.startsWith('import.')],
      ['Weitere Einstellungen', row => true]
    ];

    return `<div class="loyalty-config-list">
      <section class="loyalty-card loyalty-config-intro">
        <h3>Core-Regeln</h3>
        <p class="loyalty-note">Diese Regeln betreffen den Punkte-Core. Zentrale Loyalty-Einstellungen und spätere Texte gehören in den oberen Bereich „Einstellungen“. Namen bleiben absichtlich streamer-/modfreundlich; Details stehen per Mouse-over am Fragezeichen.</p>
      </section>
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

  function settingTitle(row){
    const titleMap = {
      'mode': 'Loyalty-Modus',
      'currency.name': 'Name der Punkte',
      'enabled': 'Loyalty aktiv',
      'features.eventBonusesEnabled': 'Support-Events geben Punkte',
      'bonuses.giftSubGiver.enabled': 'Geschenk-Abo Gifter belohnen',
      'bonuses.giftSubGiver.amount': 'Gifter-Basiswert',
      'bonuses.giftSubGiver.tierAmounts': 'Gifter-Punkte je Tier',
      'bonuses.giftSubReceiver.mode': 'Geschenk-Abo Empfänger',
      'bonuses.giftSubReceiver.enabled': 'Empfänger-Erfassung aktiv',
      'bonuses.giftSubReceiver.amount': 'Eigener Empfänger-Basiswert',
      'bonuses.giftSubReceiver.tierAmounts': 'Eigene Empfänger-Punkte je Tier',
      'bonuses.raid.mode': 'Raid-Berechnung',
      'bonuses.raid.baseAmount': 'Raid-Basispunkte',
      'bonuses.raid.amountPerViewer': 'Raid-Punkte pro Zuschauer',
      'bonuses.raid.maxAmount': 'Raid-Maximum'
    };
    return row.label || titleMap[row.key] || row.key;
  }

  function settingHelp(row){
    return row.help || row.description || '';
  }

  function renderSettingRow(rawRow){
    const row = settingMeta(rawRow);
    const title = settingTitle(row);
    const help = settingHelp(row);
    return `<article class="loyalty-setting-row ${row.key === 'bonuses.giftSubReceiver.mode' ? 'is-highlight' : ''}">
      <div>
        <strong>${esc(title)} ${help ? `<span class="loyalty-help" title="${esc(help)}">?</span>` : ''}</strong>
        <span>${esc(row.description || '')}</span>
        <small>${esc(row.key)} · ${esc(row.valueType || 'string')} · ${esc(row.source || '')}</small>
      </div>
      <div class="loyalty-setting-input">${renderSettingInput(row)}</div>
      <button type="button" data-loyalty-save-setting="${esc(row.key)}">Speichern</button>
    </article>`;
  }

  function renderSettingInput(rawRow){
    const row = settingMeta(rawRow);
    if (Array.isArray(row.options) && row.options.length) {
      return `<select data-loyalty-setting="${esc(row.key)}">
        ${row.options.map(opt => {
          const value = typeof opt === 'object' ? opt.value : opt;
          const label = typeof opt === 'object' ? (opt.label || opt.value) : opt;
          const description = typeof opt === 'object' ? (opt.description || '') : '';
          return `<option value="${esc(value)}" ${String(row.value ?? row.rawValue ?? '') === String(value) ? 'selected' : ''} title="${esc(description)}">${esc(label)}</option>`;
        }).join('')}
      </select>${row.key === 'bonuses.giftSubReceiver.mode' ? renderGiftReceiverModeHint(row.value) : ''}`;
    }
    if (row.valueType === 'boolean') {
      return `<select data-loyalty-setting="${esc(row.key)}"><option value="true" ${row.value === true ? 'selected' : ''}>Aktiv</option><option value="false" ${row.value === false ? 'selected' : ''}>Inaktiv</option></select>`;
    }
    if (row.valueType === 'json') {
      return `<textarea data-loyalty-setting="${esc(row.key)}" spellcheck="false">${esc(JSON.stringify(row.value, null, 2))}</textarea>`;
    }
    const type = row.valueType === 'number' ? 'number' : 'text';
    return `<input data-loyalty-setting="${esc(row.key)}" type="${type}" value="${esc(row.rawValue ?? row.value ?? '')}">`;
  }

  function renderGiftReceiverModeHint(mode){
    const hints = {
      disabled: 'Empfänger werden nicht erfasst und bekommen keine Punkte.',
      track_only: 'Empfohlen: Empfänger werden im Verlauf sichtbar, bekommen aber keine Punkte.',
      small_bonus: 'Empfänger bekommen einen kleinen Dankeschön-Bonus.',
      half_bonus: 'Empfänger bekommen die Hälfte des Geschenk-Abo-Werts. Kann bei GiftBombs viele Punkte erzeugen.',
      custom: 'Empfänger bekommen deine eigenen Werte aus „Eigene Empfänger-Punkte je Tier“.'
    };
    return `<small class="loyalty-setting-hint">${esc(hints[String(mode || 'track_only')] || hints.track_only)}</small>`;
  }

  function renderEvents(){
    const eventList = loyaltyEvents();
    const runnerList = runnerEvents();
    const filters = eventHistoryFilters();
    const eventTypes = state.loyaltyEvents?.eventTypes || ['follow','subscribe','resub','gift_sub','gift_bomb','gifted_sub_received','cheer','raid'];
    const statuses = state.loyaltyEvents?.statuses || ['processed','skipped','duplicate'];
    return `
      <section class="loyalty-card">
        <h3>Verlauf / Log</h3>
        <p class="loyalty-note">Read-only: Hier siehst du, was erkannt wurde, ob es gebucht wurde und wie Geschenk-Abos oder GiftBombs behandelt wurden.</p>
        <div class="loyalty-history-filters">
          <label><span>Art</span><select data-loyalty-history-filter="type">
            <option value="" ${!filters.type ? 'selected' : ''}>Alle</option>
            ${eventTypes.map(type => `<option value="${esc(type)}" ${filters.type === type ? 'selected' : ''}>${esc(eventLabel(type))}</option>`).join('')}
          </select></label>
          <label><span>Status</span><select data-loyalty-history-filter="status">
            <option value="" ${!filters.status ? 'selected' : ''}>Alle</option>
            ${statuses.map(status => `<option value="${esc(status)}" ${filters.status === status ? 'selected' : ''}>${esc(historyStatusLabel(status))}</option>`).join('')}
          </select></label>
          <label><span>User</span><input data-loyalty-history-filter="login" type="text" value="${esc(filters.login || '')}" placeholder="Twitch-Name"></label>
          <label><span>Suche</span><input data-loyalty-history-filter="q" type="text" value="${esc(filters.q || '')}" placeholder="Name, Grund, Quelle"></label>
          <label><span>Limit</span><select data-loyalty-history-filter="limit">
            ${[50,120,250,500].map(limit => `<option value="${limit}" ${Number(filters.limit || 120) === limit ? 'selected' : ''}>${limit}</option>`).join('')}
          </select></label>
          <button type="button" data-loyalty-history-apply>Filtern</button>
        </div>
        ${eventList.length ? `<div class="loyalty-table-wrap"><table><thead><tr><th>Zeit</th><th>Art</th><th>User</th><th>Tier/Menge</th><th>Wert</th><th>Punkte</th><th>Status</th><th>Buchung</th><th>Details</th></tr></thead><tbody>
          ${eventList.map(row => `<tr>
            <td>${fmtDate(row.createdAt)}</td>
            <td><strong>${esc(eventLabel(row.eventType))}</strong><small>${esc(row.eventType || '')} · ${esc(row.sourceType || row.provider || '')}</small></td>
            <td><strong>${esc(row.displayName || row.login || '-')}</strong><small>${esc(row.login || '')}</small>${row.receiver?.login ? `<small>Receiver: ${esc(row.receiver.displayName || row.receiver.login)}</small>` : ''}</td>
            <td>${esc(row.tier || '-')}<small>x${fmtNumber(row.quantity || 1)}</small></td>
            <td>${fmtNumber(row.amount)}</td>
            <td><strong>${fmtNumber(row.points)}</strong></td>
            <td>${esc(historyStatusLabel(row.status))}<small>${esc(row.reason || '')}</small></td>
            <td><small>${esc(row.transactionUid || '-')}</small>${row.transactionCount ? `<small>${fmtNumber(row.transactionCount)} Tx</small>` : ''}</td>
            <td><button type="button" class="small" data-loyalty-event-detail="${esc(row.uid || '')}">Anzeigen</button></td>
          </tr>`).join('')}
        </tbody></table></div>` : '<div class="loyalty-empty">Keine Loyalty-Events für die aktuellen Filter.</div>'}
      </section>

      <section class="loyalty-card">
        <h3>Runner Events</h3>
        ${runnerList.length ? `<div class="loyalty-table-wrap"><table><thead><tr><th>Zeit</th><th>Event</th><th>Trigger</th><th>OK</th><th>Skipped</th><th>Awarded</th><th>Count</th><th>Reason</th></tr></thead><tbody>
          ${runnerList.map(row => `<tr>
            <td>${fmtDate(row.createdAt)}</td>
            <td>${esc(row.eventType)}</td>
            <td>${esc(row.trigger)}</td>
            <td>${boolText(row.ok)}</td>
            <td>${boolText(row.skipped)}</td>
            <td>${fmtNumber(row.awarded)}</td>
            <td>${fmtNumber(row.processedCount)}</td>
            <td>${esc(row.reason || '-')}</td>
          </tr>`).join('')}
        </tbody></table></div>` : '<div class="loyalty-empty">Keine Runner-Events.</div>'}
      </section>
      ${renderEventDetailModal()}
    `;
  }

  function renderEventDetailModal(){
    const detail = state.eventDetail;
    if (!detail) return '';
    const event = detail.event || {};
    const gift = detail.giftDistribution || null;
    return `<div class="loyalty-modal-backdrop" data-loyalty-close-detail>
      <section class="loyalty-modal" role="dialog" aria-modal="true" onclick="event.stopPropagation()">
        <header>
          <div>
            <h3>Event-Details</h3>
            <p>${esc(eventLabel(event.eventType))} · ${fmtDate(event.createdAt)}</p>
          </div>
          <button type="button" data-loyalty-close-detail>Schließen</button>
        </header>
        <div class="loyalty-detail-grid">
          <article>
            <h4>Erkannt</h4>
            <div class="loyalty-rows compact">
              <div><span>Event-ID</span><strong>${esc(event.uid || '-')}</strong></div>
              <div><span>Quelle</span><strong>${esc(event.provider || '-')} / ${esc(event.sourceType || '-')}</strong></div>
              <div><span>User</span><strong>${esc(event.displayName || event.login || '-')}</strong></div>
              <div><span>Tier / Menge</span><strong>${esc(event.tier || '-')} / x${fmtNumber(event.quantity || 1)}</strong></div>
              <div><span>Status</span><strong>${esc(historyStatusLabel(detail.status))}</strong></div>
              <div><span>Grund</span><strong>${esc(event.reason || '-')}</strong></div>
            </div>
          </article>
          <article>
            <h4>Buchung</h4>
            <div class="loyalty-rows compact">
              <div><span>Punkte gesamt</span><strong>${fmtNumber(event.points)}</strong></div>
              <div><span>Hauptbuchung</span><strong>${esc(event.transactionUid || '-')}</strong></div>
              <div><span>Transaktionen</span><strong>${fmtNumber((detail.transactions || []).length)}</strong></div>
              <div><span>Regel</span><strong>${esc(event.mode || '-')}</strong></div>
            </div>
          </article>
        </div>
        ${gift ? `<section class="loyalty-detail-section"><h4>Geschenk-Abo / GiftBomb-Verteilung</h4>
          <div class="loyalty-rows compact">
            <div><span>Schenker</span><strong>${esc(gift.giver?.displayName || gift.giver?.login || '-')} · ${fmtNumber(gift.giver?.points || 0)} Punkte</strong></div>
            <div><span>Bekannte Empfänger</span><strong>${fmtNumber(gift.knownReceiverCount)} / ${fmtNumber(gift.expectedReceiverCount)}</strong></div>
            <div><span>Fehlende Empfänger</span><strong>${fmtNumber(gift.missingReceiverCount)}</strong></div>
            <div><span>Hinweis</span><strong>${esc(gift.note || '')}</strong></div>
          </div>
          ${gift.receiver ? `<div class="loyalty-rows compact"><div><span>Empfänger</span><strong>${esc(gift.receiver.displayName || gift.receiver.login || '-')} · ${fmtNumber(gift.receiver.calculatedAmount || 0)} Punkte · ${esc(gift.receiver.reason || '')}</strong></div></div>` : ''}
        </section>` : ''}
        <section class="loyalty-detail-section"><h4>Transaktionen</h4>
          ${(detail.transactions || []).length ? `<div class="loyalty-table-wrap"><table><thead><tr><th>Zeit</th><th>User</th><th>Betrag</th><th>Grund</th><th>Ref</th></tr></thead><tbody>${detail.transactions.map(tx => `<tr><td>${fmtDate(tx.createdAt)}</td><td>${esc(tx.displayName || tx.login || '-')}<small>${esc(tx.login || '')}</small></td><td>${fmtNumber(tx.amount)}</td><td>${esc(tx.reason || '-')}</td><td><small>${esc(tx.referenceType || '')}</small><small>${esc(tx.referenceId || '')}</small></td></tr>`).join('')}</tbody></table></div>` : '<div class="loyalty-empty">Keine Transaktionen gefunden.</div>'}
        </section>
        <section class="loyalty-detail-section"><h4>Berechnung</h4>${jsonBlock(detail.calculation || {})}</section>
        <section class="loyalty-detail-section"><h4>Technische Details</h4>${jsonBlock({ raw: detail.raw || {}, metadata: detail.metadata || {} })}</section>
      </section>
    </div>`;
  }




  const MAIN_TABS = [
    { id: 'overview', label: 'Start', description: 'Gesamtüberblick über Loyalty.', module: 'loyalty_games', gamesTab: 'overview' },
    { id: 'core', label: 'Punkte-Core', description: 'Punkte, User, Regeln und Core-Verlauf.', module: 'loyalty' },
    { id: 'wheel', label: 'Glücksrad', description: 'Glücksrad und Gewinne.', module: 'loyalty_games', gamesTab: 'wheel' },
    { id: 'presets', label: 'Presets', description: 'Vorlagen für Loyalty-Aktionen.', module: 'loyalty_games', gamesTab: 'presets' },
    { id: 'giveaways', label: 'Giveaways', description: 'Giveaways verwalten.', module: 'loyalty_giveaways' },
    { id: 'gamble', label: 'Gamble', description: 'Gamble-Spiel und Auswertung.', module: 'loyalty_games', gamesTab: 'gamble' },
    { id: 'config', label: 'Einstellungen', description: 'Zentrale Loyalty-Konfiguration.', module: 'loyalty_games', gamesTab: 'config' },
    { id: 'chat', label: 'Chat & Befehle', description: 'Chatbefehle und Antworten.', module: 'loyalty_games', gamesTab: 'chat' },
    { id: 'history', label: 'Verlauf & Logs', description: 'Ereignisse, Buchungen und Prüfungen.', module: 'loyalty_games', gamesTab: 'history' },
    { id: 'notes', label: 'Hilfe', description: 'Hinweise und offene Punkte.', module: 'loyalty_games', gamesTab: 'notes' }
  ];

  function renderMainTabs(activeId = 'core'){
    const active = String(activeId || 'core');
    return `
      <div class="lg-tabs loyalty-main-tabs" data-loyalty-main-tabs>
        ${MAIN_TABS.map(tab => `<button type="button" class="lg-tab ${tab.id === active ? 'is-active' : ''}" data-loyalty-main-tab="${esc(tab.id)}" title="${esc(tab.description || tab.label)}">${esc(tab.label)}</button>`).join('')}
      </div>
    `;
  }

  function openMainTab(tabId){
    const tab = MAIN_TABS.find(item => item.id === tabId) || MAIN_TABS[0];
    if (tab.module === 'loyalty_games' && tab.gamesTab && typeof window.LoyaltyGamesModule?.setTab === 'function') {
      window.LoyaltyGamesModule.setTab(tab.gamesTab);
    }
    if (tab.module === 'loyalty_giveaways' && typeof window.LoyaltyGiveawaysModule?.loadAll === 'function') {
      window.LoyaltyGiveawaysModule.loadAll(false);
    }
    if (tab.module && typeof window.CGN?.setActiveModule === 'function') {
      window.CGN.setActiveModule(tab.module, { section: 'loyalty' });
    }
  }

  function bindMainTabs(scope){
    const container = scope || root || document;
    container.querySelectorAll('[data-loyalty-main-tab]').forEach(btn => {
      if (btn.dataset.loyaltyMainBound === '1') return;
      btn.dataset.loyaltyMainBound = '1';
      btn.addEventListener('click', () => openMainTab(btn.dataset.loyaltyMainTab || 'overview'));
    });
  }

  function render(){
    root = document.getElementById('loyaltyModule');
    if (!root) return;

    const tabs = [
      ['overview','Übersicht'],
      ['control','Steuerung'],
      ['stats','Auswertung'],
      ['users','User'],
      ['ignored','Bots ignorieren'],
      ['config','Core-Regeln'],
      ['events','Core-Verlauf']
    ];

    root.innerHTML = `
      <div class="loyalty-admin-wrap">
        <section class="loyalty-card loyalty-hero">
          <div>
            <h2>🍪 Loyalty / Punkte-Core</h2>
            <p>Hier kontrollierst du Punkte, automatische Vergabe, User, Core-Regeln und den Core-Verlauf. Zentrale Einstellungen, Texte und globale Logs liegen oben im Loyalty-Bereich.</p>
          </div>
          <div class="loyalty-actions">
            <button type="button" data-loyalty-refresh>Aktualisieren</button>
          </div>
        </section>

        ${renderMainTabs('core')}
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

  async function loadEventHistory(){
    state.loyaltyEvents = await window.CGN.api(buildEventHistoryUrl()).catch(err => ({ ok:false, error:err.message, rows:[] }));
    render();
  }

  async function openEventDetail(uid){
    const cleanUid = String(uid || '').trim();
    if (!cleanUid) return;
    state.eventDetail = await window.CGN.api(api.loyaltyEventDetail + encodeURIComponent(cleanUid));
    render();
  }

  function readHistoryFiltersFromDom(){
    const next = { ...eventHistoryFilters() };
    root?.querySelectorAll('[data-loyalty-history-filter]').forEach(input => {
      const key = input.dataset.loyaltyHistoryFilter;
      if (!key) return;
      next[key] = input.value || '';
    });
    next.limit = Math.max(1, Math.min(500, Number(next.limit || 120) || 120));
    state.historyFilters = next;
  }

  function bind(){
    bindMainTabs(root);

    root?.querySelector('[data-loyalty-refresh]')?.addEventListener('click', () => loadAll(true));
    root?.querySelectorAll('[data-loyalty-tab]').forEach(btn => btn.addEventListener('click', () => {
      state.tab = btn.dataset.loyaltyTab || 'overview';
      render();
    }));

    root?.querySelector('[data-loyalty-history-apply]')?.addEventListener('click', () => {
      readHistoryFiltersFromDom();
      loadEventHistory().catch(err => { state.error = err.message; render(); });
    });

    root?.querySelectorAll('[data-loyalty-history-filter]').forEach(input => {
      input.addEventListener('keydown', ev => {
        if (ev.key === 'Enter') {
          readHistoryFiltersFromDom();
          loadEventHistory().catch(err => { state.error = err.message; render(); });
        }
      });
    });

    root?.querySelectorAll('[data-loyalty-event-detail]').forEach(btn => btn.addEventListener('click', () => {
      openEventDetail(btn.dataset.loyaltyEventDetail).catch(err => { state.error = err.message; render(); });
    }));

    root?.querySelectorAll('[data-loyalty-close-detail]').forEach(btn => btn.addEventListener('click', () => {
      state.eventDetail = null;
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

  return { loadAll, render, registerDashboardModule, renderMainTabs, bindMainTabs, openMainTab };
})();
