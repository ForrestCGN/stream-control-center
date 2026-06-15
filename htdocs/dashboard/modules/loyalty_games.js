window.LoyaltyGamesModule = (function(){
  'use strict';

  const api = {
    coreStatus: '/api/loyalty/status',
    status: '/api/loyalty/games/status',
    config: '/api/loyalty/games/config',
    routes: '/api/loyalty/games/routes',
    sessions: '/api/loyalty/games/sessions?gameKey=wheel&limit=50',
    wheelStatus: '/api/loyalty/games/wheel/status',
    wheelConfig: '/api/loyalty/games/wheel/config',
    presets: '/api/loyalty/games/wheel/presets',
    spins: '/api/loyalty/games/wheel/spins?limit=50',
    giveawaysStatus: '/api/loyalty/giveaways/status',
    giveaways: '/api/loyalty/giveaways?limit=250',
    giveawayCommands: '/api/loyalty/giveaways/commands',
    giveawayTexts: '/api/loyalty/giveaways/texts',
    communicationStatus: '/api/communication/status',
    gambleConfig: '/api/loyalty/games/gamble/dashboard-config',
    gambleAudit: '/api/loyalty/games/gamble/dashboard-audit?limit=8',
    commandLogs: '/api/commands/logs?limit=80',
    overlay: '/overlays/loyalty/wheel_overlay.html'
  };

  let root = null;
  let state = {
    loading: false,
    saving: false,
    error: '',
    message: '',
    coreStatus: null,
    status: null,
    config: null,
    routes: null,
    sessions: null,
    wheelStatus: null,
    wheelConfig: null,
    presets: null,
    spins: null,
    communicationStatus: null,
    gambleConfig: null,
    gambleAudit: null,
    gambleStats: null,
    gambleLogRows: [],
    gambleModal: '',
    gambleResult: '',
    configSection: 'gamble',
    selectedPresetUid: '',
    selectedPreset: null,
    activeTab: 'overview'
  };

  function esc(v){
    return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function rows(value){
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.rows)) return value.rows;
    if (Array.isArray(value?.data?.rows)) return value.data.rows;
    if (Array.isArray(value?.sessions)) return value.sessions;
    if (Array.isArray(value?.fields)) return value.fields;
    if (Array.isArray(value?.data?.fields)) return value.data.fields;
    return [];
  }

  function norm(value){
    return String(value || '').trim().toLowerCase();
  }

  function fmtDate(value){
    if (!value) return '<span class="lg-muted">-</span>';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return esc(value);
    return esc(d.toLocaleString('de-DE'));
  }

  function fmtNumber(value){
    const n = Number(value || 0);
    return Number.isFinite(n) ? n.toLocaleString('de-DE') : '0';
  }

  function statusLabel(status){
    const clean = String(status || '').toLowerCase();
    const labels = {
      active: 'Aktiv',
      running: 'Läuft',
      ok: 'OK',
      open: 'Offen',
      draft: 'Entwurf',
      paused: 'Pausiert',
      closed_for_entries: 'Teilnahme geschlossen',
      waiting_for_claim: 'Wartet auf Gewinnbestätigung',
      waiting_for_wheel: 'Wartet auf Glücksrad-Dreh',
      wheel_completed: 'Glücksrad abgeschlossen',
      finished: 'Beendet',
      exhausted: 'Aufgebraucht',
      cancelled: 'Abgebrochen',
      deleted: 'Gelöscht',
      pending: 'Ausstehend',
      confirmed: 'Bestätigt',
      skipped: 'Übersprungen',
      no_response: 'Nicht bestätigt',
      used: 'Genutzt',
      classic_single: 'Normales Giveaway',
      classic_multi: 'Normales Giveaway · mehrere Gewinner',
      wheel_single: 'Glücksrad-Giveaway',
      wheel_multi: 'Glücksrad-Giveaway · mehrere Gewinner'
    };
    return labels[clean] || String(status || '-');
  }

  function getChatClaimSettings(giveaway){
    const snapshot = giveaway?.settingsSnapshot?.chatClaim || {};
    const direct = giveaway?.chatClaim || {};
    const meta = giveaway?.metadata?.chatClaim || {};
    const source = { ...snapshot, ...direct, ...meta };
    const timeoutSeconds = Number(source.timeoutSeconds || Math.ceil(Number(source.timeoutMs || 0) / 1000) || 60);
    return {
      enabled: source.enabled === true || source.enabled === 'true' || source.enabled === 1 || source.enabled === '1',
      mode: source.mode || 'any_message',
      timeoutSeconds: Number.isFinite(timeoutSeconds) && timeoutSeconds > 0 ? timeoutSeconds : 60,
      timeoutMs: Number(source.timeoutMs || timeoutSeconds * 1000) || 60000,
      activateWheelAfterClaim: source.activateWheelAfterClaim !== false && source.activateWheelAfterClaim !== 'false' && source.activateWheelAfterClaim !== 0 && source.activateWheelAfterClaim !== '0'
    };
  }

  function claimStatusLabel(winner){
    const meta = winner?.metadata || {};
    const claim = meta.chatClaim || meta.claim || {};
    const status = String(claim.status || winner?.claimStatus || '').toLowerCase();
    if (!status) return '<span class="lg-muted">-</span>';
    if (['confirmed', 'accepted', 'ok'].includes(status)) return '<span class="lg-badge lg-badge-ok">Bestätigt</span>';
    if (['pending', 'open', 'waiting', 'waiting_for_claim'].includes(status)) return '<span class="lg-badge lg-badge-warn">Wartet</span>';
    if (['expired', 'timeout', 'no_response', 'skipped'].includes(status)) return '<span class="lg-badge lg-badge-off">Nicht bestätigt</span>';
    return `<span class="lg-badge lg-badge-off">${esc(statusLabel(status))}</span>`;
  }

  function badge(value, okText = 'OK', failText = 'Aus'){
    return value
      ? `<span class="lg-badge lg-badge-ok">${esc(okText)}</span>`
      : `<span class="lg-badge lg-badge-off">${esc(failText)}</span>`;
  }

  function statusBadge(status){
    const clean = String(status || '').toLowerCase();
    const label = statusLabel(status);
    if (['active', 'running', 'ok', 'open', 'confirmed', 'wheel_completed'].includes(clean)) return `<span class="lg-badge lg-badge-ok">${esc(label)}</span>`;
    if (['draft', 'paused', 'closed_for_entries', 'waiting_for_claim', 'waiting_for_wheel', 'pending'].includes(clean)) return `<span class="lg-badge lg-badge-warn">${esc(label)}</span>`;
    return `<span class="lg-badge lg-badge-off">${esc(label)}</span>`;
  }

  function registerDashboardModule(){
    if (!window.CGN) return;

    const module = window.CGN.modules?.loyalty_games;
    if (module) {
      module.reload = function(){ return window.LoyaltyGamesModule?.loadAll?.(true); };
      module.overlayLink = module.overlayLink || api.overlay;
      module.overlayLabel = module.overlayLabel || 'Glücksrad-Overlay öffnen';
    }

    window.SectionHomeModule?.render?.();
  }

  function apiUrl(path, params){
    const url = new URL(path, window.location.origin);
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    });
    return `${url.pathname}${url.search}`;
  }

  async function apiPost(path, body){
    return window.CGN.api(path, {
      method: 'POST',
      body: JSON.stringify(body || {})
    });
  }

  async function apiPut(path, body){
    return window.CGN.api(path, {
      method: 'PUT',
      body: JSON.stringify(body || {})
    });
  }

  function normalizeCommandLogs(data){
    if (Array.isArray(data?.logs)) return data.logs;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.rows)) return data.rows;
    if (Array.isArray(data?.data?.logs)) return data.data.logs;
    if (Array.isArray(data)) return data;
    return [];
  }

  function parseCommandResult(row){
    const candidates = [row?.result, row?.response, row?.data, row?.payload];
    for (const value of candidates) {
      if (!value) continue;
      if (typeof value === 'object') return value;
      if (typeof value === 'string') {
        try { return JSON.parse(value); } catch (_) {}
      }
    }
    return row || {};
  }

  function isGambleLogRow(row){
    const raw = String(row?.trigger || row?.command || row?.aliasTrigger || row?.commandName || row?.input || '').toLowerCase();
    return raw.replace(/^!/, '').split(/\s+/)[0] === 'gamble' || raw.includes('!gamble');
  }

  function gambleResultData(row){
    const result = parseCommandResult(row);
    return { result, data: result?.data || {} };
  }

  function gambleRowUser(row){
    const { result, data } = gambleResultData(row);
    const login = String(
      row?.userLogin || row?.user_login || row?.login || row?.username ||
      result?.userLogin || result?.login || data?.userLogin || data?.login || ''
    ).replace(/^@/, '').trim().toLowerCase();
    const displayName = String(
      row?.userDisplayName || row?.user_display_name || row?.displayName || row?.display_name || row?.user ||
      result?.userDisplayName || result?.displayName || data?.userDisplayName || data?.displayName || login || 'unbekannt'
    ).replace(/^@/, '').trim();
    return { login: login || displayName.toLowerCase() || 'unbekannt', displayName: displayName || login || 'unbekannt' };
  }

  function gambleRowTime(row){
    return row?.created_at || row?.createdAt || row?.executedAt || row?.timestamp || row?.ts || row?.time || '';
  }

  function gambleRowOutcome(row){
    const { result, data } = gambleResultData(row);
    const outcome = String(result?.outcome || data?.outcome || row?.outcome || '').toLowerCase();
    const won = result?.won === true || data?.won === true || row?.won === true || outcome === 'win' || outcome === 'won';
    const lost = result?.won === false || data?.won === false || row?.won === false || outcome === 'lose' || outcome === 'loss' || outcome === 'lost';
    return { won, lost, outcome: won ? 'Gewonnen' : (lost ? 'Verloren' : (outcome || 'Unklar')) };
  }

  function gambleRowNet(row){
    const { result, data } = gambleResultData(row);
    const net = Number(result?.netProfit ?? data?.netProfit ?? result?.delta ?? data?.delta ?? row?.netProfit ?? row?.delta ?? 0);
    return Number.isFinite(net) ? net : 0;
  }

  function gambleRowBet(row){
    const { result, data } = gambleResultData(row);
    const bet = Number(result?.bet ?? data?.bet ?? result?.amount ?? data?.amount ?? row?.bet ?? row?.amount ?? 0);
    return Number.isFinite(bet) ? bet : 0;
  }

  function normalizeGambleRows(logs){
    return normalizeCommandLogs(logs).filter(row => {
      if (!isGambleLogRow(row)) return false;
      if (row?.ignored === true || row?.success === false) return false;
      return true;
    });
  }

  function buildGamblePlayerStats(logs){
    const map = new Map();
    normalizeGambleRows(logs).forEach(row => {
      const user = gambleRowUser(row);
      const key = user.login || user.displayName.toLowerCase();
      const current = map.get(key) || {
        login: user.login,
        displayName: user.displayName,
        total: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        betTotal: 0,
        netProfit: 0,
        lastAt: ''
      };
      const outcome = gambleRowOutcome(row);
      current.total += 1;
      if (outcome.won) current.wins += 1;
      else if (outcome.lost) current.losses += 1;
      current.betTotal += gambleRowBet(row);
      current.netProfit += gambleRowNet(row);
      const at = gambleRowTime(row);
      if (at && (!current.lastAt || Date.parse(at) > Date.parse(current.lastAt || 0))) current.lastAt = at;
      current.winRate = current.total > 0 ? Math.round((current.wins / current.total) * 1000) / 10 : 0;
      map.set(key, current);
    });
    return Array.from(map.values()).sort((a,b) => {
      if (b.total !== a.total) return b.total - a.total;
      return b.netProfit - a.netProfit;
    });
  }

  function buildGambleStats(logs){
    const stats = { total: 0, wins: 0, losses: 0, netProfit: 0, players: [] };
    const gambleRows = normalizeGambleRows(logs);
    gambleRows.forEach(row => {
      const outcome = gambleRowOutcome(row);
      stats.total += 1;
      if (outcome.won) stats.wins += 1;
      else if (outcome.lost) stats.losses += 1;
      stats.netProfit += gambleRowNet(row);
    });
    stats.players = buildGamblePlayerStats(gambleRows);
    return stats;
  }

  function formatDuration(value){
    const ms = Number(value);
    if (!Number.isFinite(ms)) return String(value ?? '?');
    if (ms <= 0) return '0s';
    if (ms % 60000 === 0) return `${ms / 60000}m`;
    if (ms % 1000 === 0) return `${ms / 1000}s`;
    return `${ms}ms`;
  }

  function msToSecondsInput(value){
    const ms = Number(value);
    if (!Number.isFinite(ms) || ms <= 0) return 0;
    return Math.round(ms / 1000);
  }

  function secondsInputToMs(value){
    const seconds = Number(value);
    if (!Number.isFinite(seconds) || seconds <= 0) return 0;
    return Math.round(seconds * 1000);
  }

  function formatSigned(value){
    const num = Number(value) || 0;
    return num > 0 ? `+${num}` : String(num);
  }

  function getGambleEngine(config, key, fallback = ''){
    return config?.config?.engine?.[key] ?? fallback;
  }

  function getGambleCommand(config, key, fallback = ''){
    return config?.command?.[key] ?? fallback;
  }

  function buildConfigResult(kind, title, message, extra = {}){
    return {
      kind,
      title,
      message,
      time: extra.time || new Date().toISOString(),
      summary: Array.isArray(extra.summary) ? extra.summary : [],
      error: extra.error || ''
    };
  }

  function buildGambleResult(kind, title, message, extra = {}){
    return buildConfigResult(kind, title, message, extra);
  }

  function currentGambleSummary(config = state.gambleConfig || {}){
    const engineOn = Boolean(getGambleEngine(config, 'enabled', false));
    const commandOn = Boolean(getGambleCommand(config, 'enabled', false));
    const chatOn = Boolean(getGambleCommand(config, 'sendResultToChat', true));
    const chance = getGambleEngine(config, 'winChancePercent', '?');
    const cooldown = getGambleCommand(config, 'cooldownUserMs', '?');
    return [
      ['Engine', engineOn ? 'aktiv' : 'aus'],
      ['Command', commandOn ? 'aktiv' : 'aus'],
      ['Chat-Antwort', chatOn ? 'aktiv' : 'aus'],
      ['Gewinnchance', `${chance}%`],
      ['Gewinnlogik', 'Gewinn = Einsatz dazu · Verlust = Einsatz weg'],
      ['Command-Cooldown', formatDuration(cooldown)]
    ];
  }

  function renderConfigResultBox({ title = 'Letztes Config-Ergebnis', result = null, clearAttr = '' } = {}){
    const hasStructured = result && typeof result === 'object';
    const kind = hasStructured ? String(result.kind || 'info') : 'info';
    const badgeText = kind === 'success' ? 'Gespeichert' : (kind === 'error' ? 'Fehler' : (kind === 'loading' ? 'Läuft' : 'Info'));
    const badgeClass = kind === 'success' ? 'lg-badge-ok' : (kind === 'error' ? 'lg-badge-off' : 'lg-badge-warn');
    const heading = hasStructured ? (result.title || title) : 'Noch keine Aktion in dieser Sitzung.';
    const message = hasStructured ? (result.message || '') : (result || '');
    const summary = hasStructured && Array.isArray(result.summary) ? result.summary : [];
    const clearButton = clearAttr ? `<button class="lg-btn lg-btn-secondary" ${clearAttr}>Leeren</button>` : '';
    return `
      <div class="lg-result-box">
        <div class="lg-panel-head lg-panel-head-compact">
          <strong>${esc(title)}</strong>
          ${clearButton}
        </div>
        <div class="lg-mini-list">
          <div class="lg-mini-row">
            <span><strong>${esc(heading)}</strong><br><small class="lg-muted">${esc(message || 'Keine Details vorhanden.')}</small></span>
            <span class="lg-badge ${badgeClass}">${esc(badgeText)}</span>
          </div>
          ${hasStructured && result.time ? `<div class="lg-mini-row"><span><strong>Zeitpunkt</strong><br><small class="lg-muted">${fmtDate(result.time)}</small></span></div>` : ''}
          ${summary.map(([label, value]) => `<div class="lg-mini-row"><span><strong>${esc(label)}</strong><br><small class="lg-muted">${esc(value)}</small></span></div>`).join('')}
        </div>
      </div>
    `;
  }

  function renderGambleResultBox(title = 'Letztes Config-Ergebnis'){
    return renderConfigResultBox({
      title,
      result: state.gambleResult,
      clearAttr: 'data-lg-gamble-clear-result'
    });
  }

  function getGambleFormValue(form, name){
    const input = form?.elements?.[name];
    if (!input) return null;
    if (input.type === 'checkbox') return Boolean(input.checked);
    const raw = String(input.value || '').trim();
    if (raw === '') return null;
    const num = Number(raw);
    return Number.isFinite(num) ? num : raw;
  }

  function getDashboardActorFallback(){
    return {
      actorLogin: 'forrestcgn',
      actorDisplayName: 'ForrestCGN',
      actorRole: 'streamer'
    };
  }

  function getDashboardActor(){
    const fallback = getDashboardActorFallback();
    const user = window.CGN?.auth?.user && typeof window.CGN.auth.user === 'object' ? window.CGN.auth.user : null;
    if (!user) return fallback;

    const login = String(user.login || user.userLogin || user.username || '').trim().replace(/^@/, '').toLowerCase();
    if (!login) return fallback;

    const displayName = String(user.displayName || user.display_name || user.name || login).trim();
    const role = String(user.role || user.dashboardRole || user.permissionRole || fallback.actorRole).trim().toLowerCase();

    return {
      actorLogin: login,
      actorDisplayName: displayName || login,
      actorRole: role || fallback.actorRole
    };
  }

  function getGambleWriteBody(form, { confirmWrite = false } = {}){
    const actor = getDashboardActor();
    return {
      actorLogin: actor.actorLogin,
      actorDisplayName: actor.actorDisplayName,
      actorRole: actor.actorRole,
      dryRun: false,
      confirmWrite,
      reason: 'STEP235P Dashboard Loyalty Config Actor Prepared Write',
      engine: {
        enabled: getGambleFormValue(form, 'enabled'),
        winChancePercent: getGambleFormValue(form, 'winChancePercent'),
        payoutMultiplier: 2,
        minBet: getGambleFormValue(form, 'minBet'),
        maxBet: getGambleFormValue(form, 'maxBet'),
        userCooldownMs: 0,
        globalCooldownMs: 0,
        allowPercentBets: getGambleFormValue(form, 'allowPercentBets'),
        allowKeywordBets: getGambleFormValue(form, 'allowKeywordBets')
      },
      command: {
        enabled: getGambleFormValue(form, 'commandEnabled'),
        cooldownUserMs: secondsInputToMs(getGambleFormValue(form, 'commandCooldownUserSeconds')),
        sendResultToChat: getGambleFormValue(form, 'sendResultToChat'),
        activationState: 'dashboard_loyalty_config_gamble_write_step235h'
      }
    };
  }

  async function loadGambleConfig(rerender = true){
    try {
      state.gambleConfig = await window.CGN.api(api.gambleConfig);
      state.error = '';
    } catch (err) {
      state.gambleConfig = { ok:false, error: err.message };
      state.error = err.message || String(err);
    }
    if (rerender) render();
  }

  async function loadGambleAudit(rerender = true){
    try {
      state.gambleAudit = await window.CGN.api(api.gambleAudit);
      state.error = '';
    } catch (err) {
      state.gambleAudit = { ok:false, error: err.message, items:[] };
      state.error = err.message || String(err);
    }
    if (rerender) render();
  }

  async function loadGambleStats(rerender = true){
    try {
      const data = await window.CGN.api(api.commandLogs);
      state.gambleLogRows = normalizeGambleRows(data);
      state.gambleStats = buildGambleStats(state.gambleLogRows);
      state.error = '';
    } catch (err) {
      state.gambleLogRows = [];
      state.gambleStats = { total: 0, wins: 0, losses: 0, netProfit: 0, players: [], error: err.message };
      state.error = err.message || String(err);
    }
    if (rerender) render();
  }

  async function submitGambleWrite(form){
    if (!window.confirm('Gamble-Konfiguration wirklich speichern?')) {
      state.gambleResult = buildGambleResult('info', 'Speichern abgebrochen', 'Es wurde keine Änderung geschrieben.');
      render();
      return;
    }
    state.saving = true;
    state.gambleResult = buildGambleResult('loading', 'Speichere Gamble-Konfiguration', 'Bitte kurz warten.');
    render();
    try {
      const result = await apiPost(api.gambleConfig, getGambleWriteBody(form, { confirmWrite: true }));
      state.gambleResult = result?.ok
        ? buildGambleResult('success', 'Gamble-Konfiguration gespeichert', 'Die Gamble-Konfiguration wurde erfolgreich aktualisiert.', { summary: currentGambleSummary(state.gambleConfig) })
        : buildGambleResult('info', 'Gamble-Write abgeschlossen', 'Bitte Ergebnis prüfen.');
      state.message = result?.ok ? 'Gamble-Konfiguration gespeichert.' : 'Gamble-Write abgeschlossen, bitte Ergebnis prüfen.';
      await loadGambleConfig(false);
      await loadGambleAudit(false);
      await loadGambleStats(false);
    } catch (err) {
      state.gambleResult = buildGambleResult('error', 'Speichern fehlgeschlagen', err.message || 'Unbekannter Fehler.', { error: err.message || String(err) });
      state.error = err.message || String(err);
    } finally {
      state.saving = false;
      render();
    }
  }

  async function loadAll(force){
    root = document.getElementById('loyaltyGamesModule');
    if (!root || !window.CGN) return;
    if (!force && state.coreStatus && state.status && state.wheelStatus && state.presets && state.giveaways && state.giveawayCommands && state.giveawayTexts && state.communicationStatus && state.gambleConfig) { render(); return; }

    state.loading = true;
    state.error = '';
    render();

    try {
      const [coreStatus, status, config, routes, sessions, wheelStatus, wheelConfig, presets, spins, giveawaysStatus, giveaways, giveawayCommands, giveawayTexts, communicationStatus, gambleConfig, gambleAudit, commandLogs] = await Promise.all([
        window.CGN.api(api.coreStatus).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.status).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.config).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.routes).catch(err => ({ ok:false, error:err.message, routes:[] })),
        window.CGN.api(api.sessions).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.wheelStatus).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.wheelConfig).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.presets).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.spins).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.giveawaysStatus).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.giveaways).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.giveawayCommands).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.giveawayTexts).catch(err => ({ ok:false, error:err.message, keys:[], categories:[] })),
        window.CGN.api(api.communicationStatus).catch(err => ({ ok:false, error:err.message, status:{ clients:[] } })),
        window.CGN.api(api.gambleConfig).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.gambleAudit).catch(err => ({ ok:false, error:err.message, items:[] })),
        window.CGN.api(api.commandLogs).catch(err => ({ ok:false, error:err.message, logs:[] }))
      ]);

      const presetRows = rows(presets);
      let selectedPresetUid = state.selectedPresetUid;
      if (!selectedPresetUid || !presetRows.some(p => p.presetUid === selectedPresetUid)) {
        selectedPresetUid = presetRows[0]?.presetUid || '';
      }

      const giveawayRows = rows(giveaways);
      let selectedGiveawayUid = state.selectedGiveawayUid;
      if (!selectedGiveawayUid || !giveawayRows.some(g => g.giveawayUid === selectedGiveawayUid)) {
        selectedGiveawayUid = giveawayRows[0]?.giveawayUid || '';
      }

      state = { ...state, loading:false, error:'', coreStatus, status, config, routes, sessions, wheelStatus, wheelConfig, presets, spins, giveawaysStatus, giveaways, giveawayCommands, giveawayTexts, communicationStatus, gambleConfig, gambleAudit, gambleLogRows: normalizeGambleRows(commandLogs), gambleStats: buildGambleStats(normalizeGambleRows(commandLogs)), selectedPresetUid, selectedGiveawayUid };
      if (selectedPresetUid) await loadPreset(selectedPresetUid, false);
      if (selectedGiveawayUid) await loadGiveaway(selectedGiveawayUid, false);
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }

    render();
  }

  async function loadPreset(presetUid, rerender = true){
    if (!presetUid) {
      state.selectedPresetUid = '';
      state.selectedPreset = null;
      if (rerender) render();
      return;
    }

    try {
      const data = await window.CGN.api(`/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}`);
      state.selectedPresetUid = presetUid;
      state.selectedPreset = data.preset || null;
      state.error = '';
    } catch (err) {
      state.error = err.message || String(err);
    }

    if (rerender) render();
  }

  async function loadGiveaway(giveawayUid, rerender = true){
    if (!giveawayUid) {
      state.selectedGiveawayUid = '';
      state.selectedGiveaway = null;
      if (rerender) render();
      return;
    }

    try {
      const data = await window.CGN.api(`/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}`);
      state.selectedGiveawayUid = giveawayUid;
      state.selectedGiveaway = data.giveaway || null;
      state.error = '';
    } catch (err) {
      state.error = err.message || String(err);
    }

    if (rerender) render();
  }

  async function refreshPresets(selectUid){
    const [presets, spins] = await Promise.all([
      window.CGN.api(api.presets).catch(err => ({ ok:false, error:err.message, rows:[] })),
      window.CGN.api(api.spins).catch(err => ({ ok:false, error:err.message, rows:[] }))
    ]);
    state.presets = presets;
    state.spins = spins;
    if (selectUid) await loadPreset(selectUid, false);
    else if (state.selectedPresetUid) await loadPreset(state.selectedPresetUid, false);
  }

  async function refreshGiveaways(selectUid){
    const [giveawaysStatus, giveaways] = await Promise.all([
      window.CGN.api(api.giveawaysStatus).catch(err => ({ ok:false, error:err.message })),
      window.CGN.api(api.giveaways).catch(err => ({ ok:false, error:err.message, rows:[] }))
    ]);
    state.giveawaysStatus = giveawaysStatus;
    state.giveaways = giveaways;
    if (selectUid) await loadGiveaway(selectUid, false);
    else if (state.selectedGiveawayUid) await loadGiveaway(state.selectedGiveawayUid, false);
  }

  function setMessage(message){
    state.message = message || '';
    setTimeout(() => {
      if (state.message === message) {
        state.message = '';
        render();
      }
    }, 5000);
  }

  async function handleCreatePreset(form){
    const data = new FormData(form);
    state.saving = true; render();
    try {
      const result = await apiPost('/api/loyalty/games/wheel/presets', {
        name: data.get('name'),
        description: data.get('description'),
        minVisibleSlots: Number(data.get('minVisibleSlots') || 12),
        status: data.get('status') || 'draft',
        removeAfterWin: data.get('removeAfterWin') === 'on',
        createdBy: 'dashboard'
      });
      const uid = result.preset?.presetUid;
      await refreshPresets(uid);
      state.activeTab = 'presets';
      setMessage('Preset wurde erstellt.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function handleUpdatePreset(form){
    const presetUid = state.selectedPresetUid;
    if (!presetUid) return;
    const data = new FormData(form);
    state.saving = true; render();
    try {
      await apiPut(`/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}`, {
        name: data.get('name'),
        description: data.get('description'),
        minVisibleSlots: Number(data.get('minVisibleSlots') || 12),
        removeAfterWin: data.get('removeAfterWin') === 'on',
        actor: 'dashboard'
      });
      await refreshPresets(presetUid);
      setMessage('Preset-Einstellungen wurden gespeichert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function handleCreateField(form){
    const presetUid = state.selectedPresetUid;
    if (!presetUid) return;
    const data = new FormData(form);
    state.saving = true; render();
    try {
      await apiPost(`/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/fields`, {
        label: data.get('label'),
        subLabel: data.get('subLabel'),
        weight: Number(data.get('weight') || 1),
        quantityTotal: Number(data.get('quantityTotal') || 1),
        rewardType: data.get('rewardType') || 'manual',
        rewardValue: data.get('rewardValue') || '',
        enabled: data.get('enabled') === 'on'
      });
      await refreshPresets(presetUid);
      setMessage('Feld wurde hinzugefügt.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function handleUpdateField(form){
    const presetUid = state.selectedPresetUid;
    const fieldUid = form.dataset.fieldUid;
    if (!presetUid || !fieldUid) return;
    const data = new FormData(form);
    state.saving = true; render();
    try {
      await apiPut(`/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/fields/${encodeURIComponent(fieldUid)}`, {
        label: data.get('label'),
        subLabel: data.get('subLabel'),
        weight: Number(data.get('weight') || 1),
        quantityTotal: Number(data.get('quantityTotal') || 1),
        rewardType: data.get('rewardType') || 'manual',
        rewardValue: data.get('rewardValue') || '',
        enabled: data.get('enabled') === 'on',
        sortOrder: Number(data.get('sortOrder') || 1)
      });
      await refreshPresets(presetUid);
      setMessage('Feld wurde gespeichert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function presetAction(action, presetUid){
    if (!presetUid) return;
    let path = '';
    let confirmText = '';
    if (action === 'copy') {
      path = `/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/copy`;
    } else if (action === 'activate') {
      path = `/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/activate`;
    } else if (action === 'pause') {
      path = `/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/pause`;
    } else if (action === 'finish') {
      path = `/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/finish`;
      confirmText = 'Preset wirklich abschließen? Danach ist es read-only und muss bei Bedarf kopiert werden.';
    } else if (action === 'delete') {
      path = `/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/delete`;
      confirmText = 'Preset wirklich löschen? Es wird als gelöscht markiert.';
    }
    if (!path) return;
    if (confirmText && !window.confirm(confirmText)) return;

    state.saving = true; render();
    try {
      const body = action === 'copy' ? { name: `Kopie von ${state.selectedPreset?.name || 'Preset'}`, quantityMode: 'original', actor: 'dashboard' } : { actor: 'dashboard' };
      const result = await apiPost(path, body);
      const uid = result.preset?.presetUid || presetUid;
      await refreshPresets(uid);
      setMessage(action === 'copy' ? 'Preset wurde kopiert.' : 'Preset wurde aktualisiert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function deleteField(fieldUid){
    const presetUid = state.selectedPresetUid;
    if (!presetUid || !fieldUid) return;
    if (!window.confirm('Feld wirklich deaktivieren/löschen?')) return;

    state.saving = true; render();
    try {
      await apiPost(`/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/fields/${encodeURIComponent(fieldUid)}/delete`, { actor: 'dashboard' });
      await refreshPresets(presetUid);
      setMessage('Feld wurde deaktiviert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function startPresetSpin(presetUid){
    if (!presetUid) return;
    state.saving = true; render();
    try {
      const result = await window.CGN.api(apiUrl('/api/loyalty/games/wheel/spin', {
        presetUid,
        login: 'dashboard',
        displayName: 'Dashboard',
        source: 'dashboard',
        duration: 5000
      }));
      await refreshPresets(presetUid);
      setMessage(`Drehung gestartet: ${result.selectedFieldLabel || 'Ergebnis folgt'}`);
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  function buildPrizeFromForm(data){
    const label = String(data.get('prizeLabel') || '').trim() || String(data.get('title') || 'Gewinn').trim() || 'Gewinn';
    return {
      label,
      description: String(data.get('prizeDescription') || '').trim(),
      quantityTotal: 1
    };
  }

  function buildGiveawayPayload(form){
    const data = new FormData(form);
    const mode = String(data.get('mode') || 'classic_single');
    return {
      title: data.get('title'),
      description: data.get('description'),
      mode,
      wheelEnabled: mode.startsWith('wheel_'),
      wheelPresetUid: data.get('wheelPresetUid') || '',
      costAmount: Number(data.get('costAmount') || 0),
      maxTicketsPerUser: Number(data.get('maxTicketsPerUser') || 1),
      firstTicketFree: data.get('firstTicketFree') === 'on',
      subOnly: data.get('subOnly') === 'on',
      subscriberLuckMultiplier: Number(data.get('subscriberLuckMultiplier') || 1),
      winnerCount: 1,
      roundPolicy: {
        roundMode: 'single',
        allowNewEntriesBetweenRounds: false,
        removeWinnerAfterRound: true,
        ticketCarryoverMode: 'tickets'
      },
      prizes: mode.startsWith('wheel_') ? [] : [buildPrizeFromForm(data)],
      chatClaim: {
        enabled: !mode.startsWith('wheel_') && data.get('chatClaimEnabled') === 'on',
        mode: data.get('chatClaimMode') || 'any_message',
        timeoutSeconds: Number(data.get('chatClaimTimeoutSeconds') || 60),
        timeoutMs: Math.max(1, Number(data.get('chatClaimTimeoutSeconds') || 60)) * 1000,
        activateWheelAfterClaim: false
      },
      actor: 'dashboard'
    };
  }

  async function handleCreateGiveaway(form){
    state.saving = true; render();
    try {
      const result = await apiPost('/api/loyalty/giveaways', buildGiveawayPayload(form));
      const uid = result.giveaway?.giveawayUid;
      await refreshGiveaways(uid);
      state.activeTab = 'giveaways';
      setMessage('Giveaway wurde erstellt.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function handleUpdateGiveaway(form){
    const giveawayUid = state.selectedGiveawayUid;
    if (!giveawayUid) return;
    state.saving = true; render();
    try {
      await apiPut(`/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}`, buildGiveawayPayload(form));
      await refreshGiveaways(giveawayUid);
      setMessage('Giveaway wurde gespeichert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function giveawayAction(action, giveawayUid){
    if (!giveawayUid) return;
    let path = '';
    let confirmText = '';
    if (action === 'copy') path = `/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/copy`;
    else if (action === 'open') path = `/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/open`;
    else if (action === 'close') path = `/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/close-entries`;
    else if (action === 'finish') { path = `/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/finish`; confirmText = 'Giveaway wirklich beenden? Danach ist es read-only.'; }
    else if (action === 'cancel') { path = `/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/cancel`; confirmText = 'Giveaway wirklich abbrechen?'; }
    else if (action === 'delete') { path = `/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/hard-delete`; confirmText = 'Giveaway WIRKLICH dauerhaft löschen? Dieser Schritt kann nicht rückgängig gemacht werden.'; }
    if (!path) return;
    if (confirmText && !window.confirm(confirmText)) return;

    state.saving = true; render();
    try {
      const body = action === 'copy' ? { title: `Kopie von ${state.selectedGiveaway?.title || 'Giveaway'}`, actor: 'dashboard' } : (action === 'delete' ? { actor: 'dashboard', reason: 'dashboard_hard_delete_from_legacy_guard', confirmHardDelete: true } : { actor: 'dashboard' });
      const result = await apiPost(path, body);
      const uid = result.giveaway?.giveawayUid || giveawayUid;
      await refreshGiveaways(uid);
      setMessage(action === 'copy' ? 'Giveaway wurde kopiert.' : 'Giveaway wurde aktualisiert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }


  function communicationClients(){
    return rows(state.communicationStatus?.status?.clients || state.communicationStatus?.clients || []);
  }

  function findCommunicationClient(moduleName){
    const clients = communicationClients();
    return clients.find(client =>
      client.module === moduleName ||
      client.id === `module:${moduleName}` ||
      client.id === moduleName ||
      String(client.id || '').includes(moduleName)
    ) || null;
  }

  function getHealthInfo(moduleName, fallbackOk, options = {}){
    const client = findCommunicationClient(moduleName);
    if (!client) {
      if (options.planned) return { color: 'gray', label: 'geplant', detail: 'noch nicht installiert', client: null };
      return {
        color: fallbackOk ? 'yellow' : 'red',
        label: fallbackOk ? 'Status OK' : 'offline',
        detail: fallbackOk ? 'API ok, kein Bus-Client gefunden' : 'nicht angemeldet',
        client: null
      };
    }

    const status = String(client.status || '').toLowerCase();
    const hasHeartbeat = client.hasHeartbeat === true || Number(client.heartbeatCount || 0) > 0;
    if (status === 'online' && hasHeartbeat) {
      return {
        color: 'green',
        label: 'online',
        detail: `Heartbeat ${fmtNumber(client.heartbeatCount || 0)}`,
        client
      };
    }

    if (status === 'online') {
      return { color: 'yellow', label: 'online', detail: 'kein Heartbeat', client };
    }

    return { color: 'red', label: client.status || 'offline', detail: client.lastError || 'nicht bereit', client };
  }

  function renderAmpel(info){
    return `<span class="lg-ampel lg-ampel-${esc(info.color)}" title="${esc(info.detail)}"></span>`;
  }

  function renderModuleCard(item){
    const info = item.health;
    const targetAttr = item.moduleId
      ? `data-lg-open-module="${esc(item.moduleId)}"`
      : `data-lg-jump-tab="${esc(item.tab || 'overview')}"`;
    return `
      <button class="lg-module-card" ${targetAttr}>
        <span class="lg-module-card-top">
          <span class="lg-module-icon">${esc(item.icon || '•')}</span>
          ${renderAmpel(info)}
        </span>
        <strong>${esc(item.title)}</strong>
        <small>${esc(item.description || '')}</small>
        <span class="lg-module-state">${esc(info.label)} · ${esc(info.detail)}</span>
      </button>
    `;
  }

  function renderOverview(){
    const status = state.status || {};
    const core = state.coreStatus || {};
    const coreCounts = core.counts || {};
    const coreFeatures = core.features || {};
    const diag = status.diagnostics || {};
    const wheel = state.wheelStatus || status.games?.wheel || {};
    const presetDiag = diag.presets || {};
    const giveawaysDiag = state.giveawaysStatus?.diagnostics?.counts || {};
    const db = diag.database || {};
    const clients = communicationClients();

    const gamesHealth = getHealthInfo('loyalty_games', status.ok !== false && !status.lastError);
    const giveawaysHealth = getHealthInfo('loyalty_giveaways', state.giveawaysStatus?.ok !== false);
    const overlayHealth = getHealthInfo('loyalty_wheel_overlay', false);
    const coreHealth = getHealthInfo('loyalty', true);
    const rewardsHealth = getHealthInfo('loyalty_rewards', false, { planned: true });
    const channelpointsHealth = getHealthInfo('channelpoints', false);

    const moduleCards = [
      {
        title: 'Core',
        icon: '🍪',
        moduleId: 'loyalty',
        description: `${esc(core.mode || 'shadow')} · ${fmtNumber(coreCounts.users || 0)} User · ${fmtNumber(coreCounts.transactions || 0)} Transaktionen`,
        health: coreHealth
      },
      {
        title: 'Glücksrad',
        icon: '🎡',
        tab: 'wheel',
        description: `${wheel.enabled === false ? 'deaktiviert' : 'aktiv'} · ${fmtNumber(wheel.fields || 0)} Felder`,
        health: gamesHealth
      },
      {
        title: 'Presets',
        icon: '🧩',
        tab: 'presets',
        description: `${fmtNumber(presetDiag.presets || rows(state.presets).length)} Presets · ${fmtNumber(presetDiag.active || 0)} aktiv`,
        health: gamesHealth
      },
      {
        title: 'Giveaways',
        icon: '🎁',
        moduleId: 'loyalty_giveaways',
        description: `${fmtNumber(giveawaysDiag.total || rows(state.giveaways).length)} Giveaways · Tickets folgen`,
        health: giveawaysHealth
      },
      {
        title: 'Wheel Overlay',
        icon: '📺',
        tab: 'wheel',
        description: 'Overlay-Heartbeat / OBS-Quelle',
        health: overlayHealth
      },
      {
        title: 'Kanalpunkte',
        icon: '💎',
        tab: 'overview',
        description: 'spätere Preset- und Giveaway-Auslöser',
        health: channelpointsHealth
      },
      {
        title: 'Rewards',
        icon: '🏆',
        tab: 'overview',
        description: 'noch geplant',
        health: rewardsHealth
      }
    ];

    return `
      <div class="lg-loyalty-home">
        <div class="lg-home-hero">
          <div>
            <p class="lg-eyebrow">Loyalty Control Center</p>
            <h3>Module & Status</h3>
            <p class="lg-muted">Ampelstatus aus API, vorhandenem Communication-/CanBus und Heartbeats.</p>
          </div>
          <div class="lg-home-legend">
            <span>${renderAmpel({color:'green', detail:'ok'})} aktiv</span>
            <span>${renderAmpel({color:'yellow', detail:'warnung'})} warnung/teilweise</span>
            <span>${renderAmpel({color:'red', detail:'fehler'})} fehler/offline</span>
            <span>${renderAmpel({color:'gray', detail:'geplant'})} geplant</span>
          </div>
        </div>

        <div class="lg-module-grid">
          ${moduleCards.map(renderModuleCard).join('')}
        </div>
      </div>

      <div class="lg-grid lg-grid-4">
        <article class="lg-card">
          <span class="lg-card-label">Core Modus</span>
          <strong>${esc(core.mode || '-')}</strong>
          <small>StreamElements ${core.streamElementsStillActive ? 'aktiv' : 'aus'} · Shadow ${core.shadowMode ? 'ja' : 'nein'}</small>
          ${badge(core.ok !== false && core.enabled !== false, 'Core OK', 'Core Fehler')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Core Daten</span>
          <strong>${fmtNumber(coreCounts.users || 0)}</strong>
          <small>${fmtNumber(coreCounts.transactions || 0)} Transaktionen · ${fmtNumber(coreCounts.watchStates || 0)} WatchStates</small>
          ${badge(core.ok !== false, 'DB', 'Fehler')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Sammeln</span>
          <strong>${coreFeatures.watchEarningEnabled ? 'Aktiv' : 'Aus'}</strong>
          <small>Events ${coreFeatures.eventBonusesEnabled ? 'aktiv' : 'aus'} · Commands ${coreFeatures.publicCommandsEnabled ? 'public' : 'Command-DB'}</small>
          ${badge(coreFeatures.watchEarningEnabled || coreFeatures.eventBonusesEnabled, 'läuft', 'aus')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Giveaways</span>
          <strong>${fmtNumber(giveawaysDiag.total || rows(state.giveaways).length)}</strong>
          <small>draft ${fmtNumber(giveawaysDiag.draft || 0)} · open ${fmtNumber(giveawaysDiag.open || 0)}</small>
          ${badge(state.giveawaysStatus?.ok !== false, 'OK', 'Fehler')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Verbindungen</span>
          <strong>${fmtNumber(clients.length)}</strong>
          <small>registrierte Dashboard-/Overlay-Verbindungen</small>
          ${badge(state.communicationStatus?.ok !== false, 'OK', 'Fehler')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Glücksrad</span>
          <strong>${wheel.running ? 'Dreht gerade' : 'Bereit'}</strong>
          <small>${wheel.enabled === false ? 'deaktiviert' : 'aktiv'} · ${fmtNumber(wheel.fields || 0)} Felder</small>
          ${badge(wheel.enabled !== false, 'Aktiv', 'Aus')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Presets</span>
          <strong>${fmtNumber(presetDiag.presets || rows(state.presets).length)}</strong>
          <small>active ${fmtNumber(presetDiag.active || 0)} · exhausted ${fmtNumber(presetDiag.exhausted || 0)}</small>
          ${badge(true, 'DB')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Runner</span>
          <strong>${core.autoRunner?.enabled ? 'An' : 'Aus'}</strong>
          <small>letzter Lauf ${core.autoRunner?.lastRunAt ? fmtDate(core.autoRunner.lastRunAt) : '-'}</small>
          ${badge(core.autoRunner?.enabled, 'aktiv', 'aus')}
        </article>
      </div>

      <div class="lg-panel">
        <h3>Technik-Status</h3>
        <div class="lg-kv">
          <span>Core Schema</span><strong>${esc(core.schema?.ok ? 'OK · ' + (core.schema?.version ?? '-') : String(core.schema?.ok ?? '-'))}</strong>
          <span>Core Modus</span><strong>${esc(core.mode || '-')}</strong>
          <span>StreamElements</span><strong>${core.streamElementsStillActive ? 'aktiv' : 'aus'}</strong>
          <span>Games Schema</span><strong>${esc(String(diag.schemaReady ?? '-'))}</strong>
          <span>Giveaways Schema</span><strong>${esc(String(state.giveawaysStatus?.diagnostics?.schemaReady ?? '-'))}</strong>
          <span>EventBus Games</span><strong>${diag.eventBus?.ready ? 'bereit' : 'broadcast_only'}</strong>
          <span>EventBus Giveaways</span><strong>${state.giveawaysStatus?.diagnostics?.eventBus?.ready ? 'bereit' : 'broadcast_only'}</strong>
          <span>DB</span><strong>${esc(db.adapter || db.dialect || '-')}</strong>
          <span>LastError</span><strong>${status.lastError ? esc(status.lastError) : '<span class="lg-muted">leer</span>'}</strong>
        </div>
      </div>
    `;
  }

  function renderWheel(){
    const wheel = state.wheelStatus || {};
    const active = wheel.activeSession || null;
    const last = wheel.lastResult || null;
    return `
      <div class="lg-grid lg-grid-3">
        <article class="lg-card">
          <span class="lg-card-label">Wheel Status</span>
          <strong>${wheel.running ? 'Running' : 'Idle'}</strong>
          <small>${wheel.enabled === false ? 'deaktiviert' : 'aktiv'}</small>
          ${badge(wheel.enabled !== false, 'Aktiv', 'Aus')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Kosten</span>
          <strong>${wheel.costEnabled ? fmtNumber(wheel.costAmount) : '0'}</strong>
          <small>noch keine Punktebuchung</small>
          ${badge(!wheel.costEnabled, 'Kosten aus', 'Kosten an')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Overlay</span>
          <strong>Glücksrad</strong>
          <small><a href="${api.overlay}" target="_blank">Overlay öffnen</a></small>
          ${badge(true, 'WS')}
        </article>
      </div>
      <div class="lg-panel">
        <h3>Aktive Session</h3>
        ${active ? `
          <div class="lg-kv">
            <span>Session</span><strong>${esc(active.sessionUid || '-')}</strong>
            <span>Spin</span><strong>${esc(active.spinUid || '-')}</strong>
            <span>Preset</span><strong>${esc(active.presetUid || '-')}</strong>
            <span>Gewinn</span><strong>${esc(active.selectedFieldLabel || '-')}</strong>
            <span>Dauer</span><strong>${fmtNumber(active.durationMs)} ms</strong>
            <span>Ende</span><strong>${fmtDate(active.endsAt)}</strong>
          </div>
        ` : `<p class="lg-muted">Keine aktive Session.</p>`}
      </div>
      <div class="lg-panel">
        <h3>Letztes Ergebnis</h3>
        ${last ? `
          <div class="lg-kv">
            <span>Session</span><strong>${esc(last.sessionUid || '-')}</strong>
            <span>Spin</span><strong>${esc(last.spinUid || '-')}</strong>
            <span>Preset</span><strong>${esc(last.presetUid || '-')}</strong>
            <span>Label</span><strong>${esc(last.selectedFieldLabel || '-')}</strong>
            <span>Beendet</span><strong>${fmtDate(last.finishedAt)}</strong>
          </div>
        ` : `<p class="lg-muted">Noch kein Ergebnis im Runtime-State vorhanden.</p>`}
      </div>
    `;
  }

  function renderPresets(){
    const presets = rows(state.presets);
    const selected = state.selectedPreset;
    const fields = rows(selected?.fields || []);
    const editable = !!selected?.editable;
    const isGiveawayLinked = selected?.presetType === 'giveaway_linked';

    return `
      <div class="lg-grid lg-editor-grid">
        <div class="lg-panel">
          <div class="lg-panel-head">
            <h3>Presets</h3>
            <button class="lg-btn" data-lg-preset-refresh>Aktualisieren</button>
          </div>
          <div class="lg-preset-list">
            ${presets.map(preset => `
              <button class="lg-preset-item ${preset.presetUid === state.selectedPresetUid ? 'is-active' : ''}" data-lg-select-preset="${esc(preset.presetUid)}">
                <span>
                  <strong>${esc(preset.name)}</strong>
                  <small>${esc(preset.presetType)} · ${esc(preset.presetUid)}</small>
                </span>
                ${statusBadge(preset.status)}
              </button>
            `).join('') || `<p class="lg-muted">Noch keine Presets gefunden.</p>`}
          </div>
        </div>

        <div class="lg-panel">
          <h3>Neues Standalone-Preset</h3>
          <form class="lg-form" data-lg-create-preset>
            <label>Name<input name="name" required placeholder="z. B. Rentner-Rad"></label>
            <label>Beschreibung<textarea name="description" rows="2" placeholder="Kurzbeschreibung"></textarea></label>
            <div class="lg-form-row">
              <label>Mindest-Slots<input name="minVisibleSlots" type="number" min="1" max="96" value="12"></label>
              <label>Status
                <select name="status">
                  <option value="draft">draft</option>
                  <option value="active">active</option>
                </select>
              </label>
            </div>
            <label class="lg-check"><input name="removeAfterWin" type="checkbox" checked> Gewinnfeld nach Auslosung aus diesem Rad entfernen</label>
            <button class="lg-btn" type="submit" ${state.saving ? 'disabled' : ''}>Preset erstellen</button>
          </form>
        </div>
      </div>

      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>${selected ? esc(selected.name) : 'Kein Preset ausgewählt'}</h3>
            ${selected ? `<p class="lg-muted">${esc(selected.description || '')}</p>` : ''}
          </div>
          ${selected ? `<div class="lg-actions">
            <button class="lg-btn lg-btn-secondary" data-lg-preset-action="copy" data-preset-uid="${esc(selected.presetUid)}">Kopieren</button>
            ${selected.status === 'active' ? `<button class="lg-btn lg-btn-secondary" data-lg-start-spin="${esc(selected.presetUid)}">Drehen</button>` : ''}
            ${selected.status !== 'active' && selected.status !== 'finished' && selected.status !== 'deleted' ? `<button class="lg-btn" data-lg-preset-action="activate" data-preset-uid="${esc(selected.presetUid)}">Aktivieren</button>` : ''}
            ${selected.status === 'active' ? `<button class="lg-btn lg-btn-secondary" data-lg-preset-action="pause" data-preset-uid="${esc(selected.presetUid)}">Pausieren</button>` : ''}
            ${selected.status !== 'finished' && selected.status !== 'deleted' ? `<button class="lg-btn lg-btn-danger" data-lg-preset-action="finish" data-preset-uid="${esc(selected.presetUid)}">Abschließen</button>` : ''}
            ${selected.status !== 'deleted' ? `<button class="lg-btn lg-btn-danger" data-lg-preset-action="delete" data-preset-uid="${esc(selected.presetUid)}">Löschen</button>` : ''}
          </div>` : ''}
        </div>

        ${selected ? `
          <div class="lg-kv lg-kv-compact">
            <span>Status</span><strong>${statusBadge(selected.status)}</strong>
            <span>Typ</span><strong>${esc(selected.presetType)}</strong>
            <span>Lifecycle</span><strong>${esc(selected.lifecycleOwner || '-')}</strong>
            <span>Bearbeitbar</span><strong>${editable ? 'Ja' : 'Nein, nur kopieren/anzeigen'}</strong>
            <span>Mindest-Slots</span><strong>${fmtNumber(selected.minVisibleSlots)}</strong>
            <span>Gewinn entfernen</span><strong>${selected.settings?.removeAfterWin === false ? 'Nein' : 'Ja'}</strong>
            <span>Felder</span><strong>${fmtNumber(fields.length)}</strong>
          </div>
          ${editable ? `
            <form class="lg-form lg-preset-settings-form" data-lg-update-preset>
              <div class="lg-form-row">
                <label>Name<input name="name" value="${esc(selected.name || '')}" required></label>
                <label>Mindest-Slots<input name="minVisibleSlots" type="number" min="1" max="96" value="${esc(selected.minVisibleSlots || 12)}"></label>
              </div>
              <label>Beschreibung<textarea name="description" rows="2">${esc(selected.description || '')}</textarea></label>
              <label class="lg-check"><input name="removeAfterWin" type="checkbox" ${selected.settings?.removeAfterWin === false ? '' : 'checked'}> Gewinnfeld nach Auslosung aus diesem Rad entfernen</label>
              <button class="lg-btn" type="submit">Preset-Einstellungen speichern</button>
            </form>
          ` : ''}
          ${isGiveawayLinked ? `<p class="lg-warning">Dieses Preset gehört zu einem Giveaway. Bearbeitung nur über den Giveaway-Editor.</p>` : ''}
          ${!editable ? `<p class="lg-warning">Dieses Preset ist nicht direkt bearbeitbar. Änderungen bitte über „Kopieren“ als neues Preset anlegen.</p>` : ''}
        ` : `<p class="lg-muted">Wähle links ein Preset aus.</p>`}
      </div>

      ${selected ? renderFieldsEditor(selected, fields, editable) : ''}
    `;
  }

  function renderFieldsEditor(selected, fields, editable){
    return `
      <div class="lg-panel">
        <div class="lg-panel-head">
          <h3>Felder / Gewinne</h3>
          <span class="lg-muted">${editable ? 'Bearbeitbar' : 'Read-only'}</span>
        </div>

        ${editable ? `
          <form class="lg-form lg-inline-form" data-lg-create-field>
            <input name="label" placeholder="Label" required>
            <input name="subLabel" placeholder="Subtext">
            <input name="weight" type="number" min="1" value="1" title="Gewicht">
            <input name="quantityTotal" type="number" min="1" value="1" title="Gesamtmenge">
            <select name="rewardType">
              <option value="manual">manual</option>
              <option value="points">points</option>
              <option value="none">none</option>
              <option value="bonus_spin">bonus_spin</option>
            </select>
            <input name="rewardValue" placeholder="Reward-Wert">
            <label class="lg-check"><input name="enabled" type="checkbox" checked> aktiv</label>
            <button class="lg-btn" type="submit" ${state.saving ? 'disabled' : ''}>Feld hinzufügen</button>
          </form>
        ` : ''}

        <div class="lg-field-list">
          ${fields.map(field => `
            <form class="lg-field-card" data-lg-update-field data-field-uid="${esc(field.fieldUid)}">
              <div class="lg-field-top">
                <strong>${esc(field.label)}</strong>
                <code>${esc(field.fieldUid)}</code>
                ${field.enabled ? badge(true, 'Aktiv') : badge(false, 'Aktiv', 'Aus')}
              </div>
              <div class="lg-field-grid">
                <label>Reihenfolge<input name="sortOrder" type="number" value="${esc(field.sortOrder || 1)}" ${editable ? '' : 'disabled'}></label>
                <label>Label<input name="label" value="${esc(field.label)}" ${editable ? '' : 'disabled'}></label>
                <label>Subtext<input name="subLabel" value="${esc(field.subLabel || field.sub || '')}" ${editable ? '' : 'disabled'}></label>
                <label>Gewicht<input name="weight" type="number" min="1" value="${esc(field.weight || 1)}" ${editable ? '' : 'disabled'}></label>
                <label>Gesamtmenge<input name="quantityTotal" type="number" min="1" value="${esc(field.quantityTotal || 1)}" ${editable ? '' : 'disabled'}></label>
                <label>Restmenge<input value="${esc(field.quantityRemaining ?? field.quantityTotal ?? 1)}" disabled></label>
                <label>Reward-Typ
                  <select name="rewardType" ${editable ? '' : 'disabled'}>
                    ${['manual','points','none','bonus_spin'].map(type => `<option value="${type}" ${field.rewardType === type ? 'selected' : ''}>${type}</option>`).join('')}
                  </select>
                </label>
                <label>Reward-Wert<input name="rewardValue" value="${esc(field.rewardValue || '')}" ${editable ? '' : 'disabled'}></label>
              </div>
              <div class="lg-field-actions">
                <label class="lg-check"><input name="enabled" type="checkbox" ${field.enabled ? 'checked' : ''} ${editable ? '' : 'disabled'}> aktiv</label>
                ${editable ? `<button class="lg-btn" type="submit">Speichern</button><button class="lg-btn lg-btn-danger" type="button" data-lg-delete-field="${esc(field.fieldUid)}">Deaktivieren</button>` : ''}
              </div>
            </form>
          `).join('') || `<p class="lg-muted">Noch keine Felder im Preset.</p>`}
        </div>
      </div>
    `;
  }


function boundWheelFields(giveaway){
    return rows(giveaway?.boundWheelFields || giveaway?.wheelFields || giveaway?.boundWheel?.fields || []);
  }

async function createGiveawayBoundWheel(giveawayUid){
    if (!giveawayUid) return null;
    const giveaway = state.selectedGiveaway && state.selectedGiveaway.giveawayUid === giveawayUid
      ? state.selectedGiveaway
      : null;
    const title = giveaway?.title || 'Giveaway-Glücksrad';
    const result = await apiPut(`/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/wheel/bound`, {
      title,
      name: `${title} – Glücksrad`,
      actor: 'dashboard',
      source: 'dashboard_giveaway_wheel_editor'
    });
    await refreshGiveaways(giveawayUid);
    setMessage(result.created ? 'Giveaway-Glücksrad wurde erstellt.' : 'Giveaway-Glücksrad wurde geladen/aktualisiert.');
    return result;
  }

  async function ensureGiveawayBoundWheel(giveawayUid){
    if (!giveawayUid) return null;
    if (!state.selectedGiveaway || state.selectedGiveaway.giveawayUid !== giveawayUid) {
      await loadGiveaway(giveawayUid, false);
    }
    if (hasGiveawayBoundWheel(state.selectedGiveaway)) return { ok: true, created: false, boundWheel: state.selectedGiveaway.boundWheel || null };
    return createGiveawayBoundWheel(giveawayUid);
  }

async function handleCreateGiveawayWheelField(form){
    const giveawayUid = state.selectedGiveawayUid;
    if (!giveawayUid) return;
    state.saving = true; render();
    try {
      await ensureGiveawayBoundWheel(giveawayUid);
      await apiPost(`/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/wheel/bound/fields`, giveawayWheelFieldPayload(form));
      await refreshGiveaways(giveawayUid);
      state.activeTab = 'giveaway_wheel_editor';
      setMessage('Glücksrad-Feld wurde hinzugefügt.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function handleUpdateGiveawayWheelField(form){
    const giveawayUid = state.selectedGiveawayUid;
    const fieldUid = form.dataset.fieldUid;
    if (!giveawayUid || !fieldUid) return;
    state.saving = true; render();
    try {
      await apiPut(`/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/wheel/bound/fields/${encodeURIComponent(fieldUid)}`, giveawayWheelFieldPayload(form));
      await refreshGiveaways(giveawayUid);
      state.activeTab = 'giveaway_wheel_editor';
      setMessage('Glücksrad-Feld wurde gespeichert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function deleteGiveawayWheelField(fieldUid){
    const giveawayUid = state.selectedGiveawayUid;
    if (!giveawayUid || !fieldUid) return;
    if (!window.confirm('Dieses Glücksrad-Feld deaktivieren?')) return;
    state.saving = true; render();
    try {
      await apiPost(`/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/wheel/bound/fields/${encodeURIComponent(fieldUid)}/delete`, { actor: 'dashboard' });
      await refreshGiveaways(giveawayUid);
      state.activeTab = 'giveaway_wheel_editor';
      setMessage('Glücksrad-Feld wurde deaktiviert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

function renderGiveaways(){
    const giveaways = rows(state.giveaways);
    const selected = state.selectedGiveaway;
    const editable = !!selected?.editable;
    const presets = rows(state.presets).filter(p => p.status === 'active' && p.presetType === 'standalone');

    return `
      <div class="lg-grid lg-editor-grid">
        <div class="lg-panel">
          <div class="lg-panel-head">
            <h3>Giveaways</h3>
            <button class="lg-btn" data-lg-giveaway-refresh>Aktualisieren</button>
          </div>
          <div class="lg-preset-list">
            ${giveaways.map(giveaway => `
              <button class="lg-preset-item ${giveaway.giveawayUid === state.selectedGiveawayUid ? 'is-active' : ''}" data-lg-select-giveaway="${esc(giveaway.giveawayUid)}">
                <span>
                  <strong>${esc(giveaway.title)}</strong>
                  <small>${esc(statusLabel(giveaway.mode))} · ${fmtDate(giveaway.createdAt)}</small>
                </span>
                ${statusBadge(giveaway.status)}
              </button>
            `).join('') || `<p class="lg-muted">Noch keine Giveaways gefunden.</p>`}
          </div>
        </div>

        <div class="lg-panel">
          <h3>Neues Giveaway</h3>
          <form class="lg-form" data-lg-create-giveaway>
            ${renderGiveawayFormFields(null, true, presets)}
            <button class="lg-btn" type="submit" ${state.saving ? 'disabled' : ''}>Giveaway erstellen</button>
          </form>
        </div>
      </div>

      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>${selected ? esc(selected.title) : 'Kein Giveaway ausgewählt'}</h3>
            ${selected ? `<p class="lg-muted">${esc(selected.description || '')}</p>` : ''}
          </div>
          ${selected ? `<div class="lg-actions">
            <button class="lg-btn lg-btn-secondary" data-lg-giveaway-action="copy" data-giveaway-uid="${esc(selected.giveawayUid)}">Kopieren</button>
            ${selected.status === 'draft' ? `<button class="lg-btn" data-lg-giveaway-action="open" data-giveaway-uid="${esc(selected.giveawayUid)}">Öffnen</button>` : ''}
            ${selected.status === 'open' ? `<button class="lg-btn lg-btn-secondary" data-lg-giveaway-action="close" data-giveaway-uid="${esc(selected.giveawayUid)}">Teilnahme schließen</button>` : ''}
            ${['open','closed_for_entries'].includes(selected.status) ? `<button class="lg-btn" data-lg-draw-winner="${esc(selected.giveawayUid)}">Gewinner ziehen</button>` : ''}
            ${!['finished','cancelled','deleted'].includes(selected.status) ? `<button class="lg-btn lg-btn-danger" data-lg-giveaway-action="finish" data-giveaway-uid="${esc(selected.giveawayUid)}">Beenden</button>` : ''}
            ${!['finished','cancelled','deleted'].includes(selected.status) ? `<button class="lg-btn lg-btn-danger" data-lg-giveaway-action="cancel" data-giveaway-uid="${esc(selected.giveawayUid)}">Abbrechen</button>` : ''}
            ${selected.status !== 'deleted' ? `<button class="lg-btn lg-btn-danger" data-lg-giveaway-action="delete" data-giveaway-uid="${esc(selected.giveawayUid)}">Löschen</button>` : ''}
          </div>` : ''}
        </div>

        ${selected ? `
          <div class="lg-kv lg-kv-compact">
            <span>Status</span><strong>${statusBadge(selected.status)}</strong>
            <span>Modus</span><strong>${esc(statusLabel(selected.mode))}</strong>
            <span>Bearbeitbar</span><strong>${editable ? 'Ja' : 'Nein, nur kopieren/anzeigen'}</strong>
            <span>Kosten</span><strong>${fmtNumber(selected.costAmount)}</strong>
            <span>Rad</span><strong>${selected.wheelEnabled ? 'Ja' : 'Nein'}</strong>
            <span>Chat-Claim</span><strong>${getChatClaimSettings(selected).enabled ? 'Ja' : 'Nein'}</strong>
            <span>UID</span><strong><code>${esc(selected.giveawayUid)}</code></strong>
            <span>Erstellt</span><strong>${fmtDate(selected.createdAt)}</strong>
          </div>

          ${editable ? `
            <form class="lg-form lg-preset-settings-form" data-lg-update-giveaway>
              ${renderGiveawayFormFields(selected, true, presets)}
              <button class="lg-btn" type="submit">Giveaway speichern</button>
            </form>
          ` : `<p class="lg-warning">Dieses Giveaway ist read-only. Änderungen bitte über „Kopieren“ als neues Giveaway anlegen.</p>`}
        ` : `<p class="lg-muted">Wähle links ein Giveaway aus.</p>`}
      </div>

      ${selected ? renderClaimSummary(selected) : ''}
      ${selected ? renderGiveawayDetails(selected) : ''}
    `;
  }

function syncGiveawayFormVisibility(form){
    if (!form) return;
    const mode = String(form.querySelector('[name="mode"]')?.value || 'classic_single');
    const isWheelMode = mode.startsWith('wheel_');
    const claimToggle = form.querySelector('[name="chatClaimEnabled"]');
    const claimEnabled = !isWheelMode && claimToggle?.checked === true;
    form.querySelectorAll('[data-lg-normal-claim]').forEach(el => { el.hidden = isWheelMode; });
    form.querySelectorAll('[data-lg-claim-options]').forEach(el => { el.hidden = !claimEnabled; });
    form.querySelectorAll('[data-lg-wheel-hint]').forEach(el => { el.hidden = !isWheelMode; });
    form.querySelectorAll('[data-lg-normal-prize]').forEach(el => { el.hidden = isWheelMode; });
    if (isWheelMode && claimToggle) claimToggle.checked = false;
  }


  async function handleCreateEntry(form){
    const giveawayUid = state.selectedGiveawayUid;
    if (!giveawayUid) return;
    const data = new FormData(form);
    state.saving = true; render();
    try {
      await apiPost(`/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/entries`, {
        userLogin: data.get('userLogin'),
        userDisplayName: data.get('userDisplayName') || data.get('userLogin'),
        ticketCount: Number(data.get('ticketCount') || 1),
        isSubscriber: data.get('isSubscriber') === 'on',
        source: 'dashboard'
      });
      await refreshGiveaways(giveawayUid);
      setMessage('Teilnahme wurde eingetragen.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function cancelEntry(entryUid){
    const giveawayUid = state.selectedGiveawayUid;
    if (!giveawayUid || !entryUid) return;
    if (!window.confirm('Teilnahme wirklich stornieren?')) return;
    state.saving = true; render();
    try {
      await apiPost(`/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/entries/${encodeURIComponent(entryUid)}/cancel`, { actor: 'dashboard' });
      await refreshGiveaways(giveawayUid);
      setMessage('Teilnahme wurde storniert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }


  async function drawGiveawayWinner(){
    const giveawayUid = state.selectedGiveawayUid;
    if (!giveawayUid) return;
    if (!window.confirm('Jetzt fair backendseitig einen Gewinner ziehen?')) return;
    state.saving = true; render();
    try {
      const result = await apiPost(`/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/draw`, { actor: 'dashboard' });
      await refreshGiveaways(giveawayUid);
      setMessage(`Gewinner gezogen: ${result.winner?.userDisplayName || result.winner?.userLogin || 'unbekannt'}`);
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function claimGiveawayWheel(userLogin, userDisplayName){
    const giveawayUid = state.selectedGiveawayUid;
    if (!giveawayUid || !userLogin) return;
    state.saving = true; render();
    try {
      const result = await apiPost(`/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/wheel/claim`, {
        userLogin,
        userDisplayName: userDisplayName || userLogin,
        source: 'dashboard',
        duration: 7000
      });
      await refreshGiveaways(giveawayUid);
      setMessage(`Rad gestartet: ${result.spin?.selectedFieldLabel || 'Ergebnis folgt'}`);
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

function renderGiveawayDetails(giveaway){
    const rounds = rows(giveaway.rounds || []);
    const prizes = rows(giveaway.prizes || []);
    const entries = rows(giveaway.entries || []);
    const winners = rows(giveaway.winners || []);
    const wheelPermissions = rows(giveaway.wheelPermissions || []);
    const events = rows(giveaway.events || []);
    const editableEntries = giveaway.status === 'open';

    return `
      <div class="lg-grid lg-grid-3">
        <div class="lg-panel">
          <h3>Gewinne</h3>
          <div class="lg-mini-list">
            ${prizes.map(prize => `
              <div class="lg-mini-row">
                <strong>${esc(prize.label)}</strong>
                <span>${fmtNumber(prize.quantityRemaining)} / ${fmtNumber(prize.quantityTotal)}</span>
              </div>
            `).join('') || `<p class="lg-muted">Keine Gewinne.</p>`}
          </div>
        </div>
        <div class="lg-panel">
          <h3>Runden</h3>
          <div class="lg-mini-list">
            ${rounds.map(round => `
              <div class="lg-mini-row">
                <strong>Runde ${fmtNumber(round.roundNumber)}</strong>
                <span>${statusBadge(round.status)}</span>
              </div>
            `).join('') || `<p class="lg-muted">Keine Runden.</p>`}
          </div>
        </div>
        <div class="lg-panel">
          <h3>Teilnahmen</h3>
          <strong class="lg-big-number">${fmtNumber(entries.filter(entry => entry.status !== 'cancelled').length)}</strong>
          <p class="lg-muted">Tickets werden gespeichert, Punkte aber noch nicht gebucht.</p>
        </div>
        <div class="lg-panel">
          <h3>Gewinner</h3>
          <strong class="lg-big-number">${fmtNumber(winners.length)}</strong>
          <p class="lg-muted">Ziehung per crypto.randomInt.</p>
        </div>
      </div>

      <div class="lg-panel">
        <div class="lg-panel-head">
          <h3>Teilnahmen / Tickets</h3>
          <span class="lg-muted">${editableEntries ? 'Giveaway ist offen' : 'Teilnahmen nur bei Status open möglich'}</span>
        </div>

        ${editableEntries ? `
          <form class="lg-form lg-entry-form" data-lg-create-entry>
            <input name="userLogin" placeholder="Twitch-Name" required>
            <input name="userDisplayName" placeholder="Anzeigename optional">
            <input name="ticketCount" type="number" min="1" value="1" title="Tickets">
            <label class="lg-check"><input name="isSubscriber" type="checkbox"> Sub/VIP-Luck anwenden</label>
            <button class="lg-btn" type="submit">Teilnahme eintragen</button>
          </form>
        ` : ''}

        <div class="lg-table-wrap">
          <table class="lg-table">
            <thead>
              <tr>
                <th>Zeit</th><th>User</th><th>Status</th><th>Tickets</th><th>Gewicht</th><th>Kosten offen</th><th>Quelle</th><th></th>
              </tr>
            </thead>
            <tbody>
              ${entries.map(entry => `
                <tr>
                  <td>${fmtDate(entry.createdAt)}</td>
                  <td>${esc(entry.userDisplayName || entry.userLogin || '-')}</td>
                  <td>${esc(entry.status || '-')}</td>
                  <td>${fmtNumber(entry.ticketCount || 0)}</td>
                  <td>${fmtNumber(entry.ticketWeight || 0)}</td>
                  <td>${fmtNumber(entry.costDue || 0)}</td>
                  <td>${esc(entry.source || '-')}</td>
                  <td>${entry.status !== 'cancelled' ? `<button class="lg-btn lg-btn-danger" data-lg-cancel-entry="${esc(entry.entryUid)}">Storno</button>` : ''}</td>
                </tr>
              `).join('') || `<tr><td colspan="8" class="lg-muted">Noch keine Teilnahmen.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <div class="lg-panel">
        <h3>Gewinner</h3>
        <div class="lg-table-wrap">
          <table class="lg-table">
            <thead>
              <tr>
                <th>Zeit</th><th>User</th><th>Status</th><th>Chat-Claim</th><th>Preis</th><th>Algorithmus</th><th>Tickets</th><th>Position</th>
              </tr>
            </thead>
            <tbody>
              ${winners.map(winner => `
                <tr>
                  <td>${fmtDate(winner.createdAt)}</td>
                  <td><strong>${esc(winner.userDisplayName || winner.userLogin || '-')}</strong><br><small class="lg-muted">${esc(winner.userLogin || '')}</small></td>
                  <td>${statusBadge(winner.status || '-')}</td>
                  <td>${claimStatusLabel(winner)}</td>
                  <td>${esc(winner.prizeLabel || '-')}</td>
                  <td>${esc(winner.drawAlgorithm || '-')}</td>
                  <td>${fmtNumber(winner.totalTicketWeight || 0)}</td>
                  <td>${fmtNumber(winner.ticketPosition || 0)}</td>
                </tr>
              `).join('') || `<tr><td colspan="8" class="lg-muted">Noch kein Gewinner gezogen.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <div class="lg-panel">
        <h3>Wheel-Berechtigungen</h3>
        <div class="lg-table-wrap">
          <table class="lg-table">
            <thead>
              <tr>
                <th>User</th><th>Status</th><th>Spin</th><th>Erstellt</th><th></th>
              </tr>
            </thead>
            <tbody>
              ${wheelPermissions.map(permission => `
                <tr>
                  <td>${esc(permission.userDisplayName || permission.userLogin || '-')}</td>
                  <td>${esc(permission.status || '-')}</td>
                  <td>${esc(permission.spinUid || '-')}</td>
                  <td>${fmtDate(permission.createdAt)}</td>
                  <td>${permission.status === 'pending' ? `<button class="lg-btn" data-lg-claim-wheel="${esc(permission.userLogin)}" data-display-name="${esc(permission.userDisplayName || permission.userLogin)}">Rad drehen</button>` : ''}</td>
                </tr>
              `).join('') || `<tr><td colspan="5" class="lg-muted">Keine Wheel-Berechtigung vorhanden.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <div class="lg-panel">
        <h3>Events</h3>
        <div class="lg-mini-list">
          ${events.slice(0, 12).map(event => `
            <div class="lg-mini-row">
              <strong>${esc(event.eventType)}</strong>
              <span>${fmtDate(event.createdAt)}</span>
            </div>
          `).join('') || `<p class="lg-muted">Keine Events.</p>`}
        </div>
      </div>
    `;
  }

  function renderSessions(){
    const list = rows(state.sessions);
    const spinRows = rows(state.spins);
    return `
      <div class="lg-panel">
        <h3>Letzte Sessions</h3>
        <div class="lg-table-wrap">
          <table class="lg-table">
            <thead>
              <tr>
                <th>Zeit</th><th>User</th><th>Status</th><th>Gewinn</th><th>Dauer</th><th>Source</th><th>Session</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(row => `
                <tr>
                  <td>${fmtDate(row.createdAt || row.startedAt)}</td>
                  <td>${esc(row.displayName || row.login || '-')}</td>
                  <td>${esc(row.status || '-')}</td>
                  <td><strong>${esc(row.selectedFieldLabel || '-')}</strong></td>
                  <td>${fmtNumber(row.durationMs || 0)} ms</td>
                  <td>${esc(row.source || '-')}</td>
                  <td><code title="${esc(row.sessionUid || '')}">${esc(String(row.sessionUid || '').slice(0, 24))}</code></td>
                </tr>
              `).join('') || `<tr><td colspan="7" class="lg-muted">Keine Sessions gefunden.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <div class="lg-panel">
        <h3>Dreh-Verlauf mit Preset</h3>
        <div class="lg-table-wrap">
          <table class="lg-table">
            <thead>
              <tr>
                <th>Zeit</th><th>User</th><th>Status</th><th>Preset</th><th>Ergebnis</th><th>Gewicht</th><th>Spin</th>
              </tr>
            </thead>
            <tbody>
              ${spinRows.map(row => `
                <tr>
                  <td>${fmtDate(row.createdAt || row.startedAt)}</td>
                  <td>${esc(row.displayName || row.login || '-')}</td>
                  <td>${esc(row.status || '-')}</td>
                  <td><code>${esc(String(row.presetUid || '').slice(0, 22))}</code></td>
                  <td><strong>${esc(row.resultLabel || '-')}</strong></td>
                  <td>${fmtNumber(row.totalWeight || 0)}</td>
                  <td><code title="${esc(row.spinUid || '')}">${esc(String(row.spinUid || '').slice(0, 22))}</code></td>
                </tr>
              `).join('') || `<tr><td colspan="7" class="lg-muted">Noch keine Preset-Drehungen gespeichert.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }


  async function refreshChatSetup(rerender = true){
    try {
      const [giveawayCommands, giveawayTexts] = await Promise.all([
        window.CGN.api(api.giveawayCommands).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.giveawayTexts).catch(err => ({ ok:false, error:err.message, keys:[], categories:[] }))
      ]);
      state.giveawayCommands = giveawayCommands;
      state.giveawayTexts = giveawayTexts;
      if (rerender) render();
    } catch (err) {
      state.error = err.message || String(err);
      if (rerender) render();
    }
  }

  async function saveChatTextVariant(form){
    const data = new FormData(form);
    const key = String(data.get('key') || '').trim();
    const category = String(data.get('category') || 'general').trim();
    const value = String(data.get('value') || '').trim();
    if (!key || !value) return;
    state.saving = true; render();
    try {
      await apiPost(api.giveawayTexts, {
        action: 'saveVariant',
        variant: { key, category, value, enabled: true, weight: 1 }
      });
      await refreshChatSetup(false);
      setMessage('Textvariante gespeichert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  function renderChatSetup(){
    const commands = rows(state.giveawayCommands);
    return `
      <div class="lg-grid lg-grid-2">
        <div class="lg-panel">
          <h3>Chat & Befehle</h3>
          <p class="lg-muted">Hier siehst du die Loyalty-Commands. Texte werden zentral im Tab „Texte“ gepflegt.</p>
          <div class="lg-table-wrap">
            <table class="lg-table">
              <thead>
                <tr><th>Command</th><th>Alias</th><th>Aktion</th><th>Status</th><th>Usage</th></tr>
              </thead>
              <tbody>
                ${commands.map(cmd => `
                  <tr>
                    <td><code>!${esc(cmd.command)}</code></td>
                    <td>${(cmd.aliases || []).map(alias => `<code>!${esc(alias)}</code>`).join(' ') || '<span class="lg-muted">-</span>'}</td>
                    <td>${esc(cmd.action || '-')}</td>
                    <td>${cmd.active ? badge(true, 'aktiv') : `<span class="lg-badge lg-badge-off">inaktiv</span>`}</td>
                    <td><code>${esc(cmd.usage || '-')}</code></td>
                  </tr>
                `).join('') || `<tr><td colspan="5" class="lg-muted">Keine Commands eingetragen.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
        <div class="lg-panel">
          <h3>Texte bearbeiten</h3>
          <p class="lg-muted">Chat-Antworten, Hinweise und Varianten liegen nicht mehr hier versteckt, sondern zentral im Texte-Tab.</p>
          <button class="lg-btn" type="button" data-lg-jump-tab="texts">Texte öffnen</button>
        </div>
      </div>
    `;
  }

  function renderTexts(){
    const textPayload = state.giveawayTexts || {};
    const categories = Array.isArray(textPayload.categories) ? textPayload.categories : [];
    const keys = Array.isArray(textPayload.keys) ? textPayload.keys : [];
    const sections = [
      ['all', 'Alle Textbereiche'],
      ['core', 'Core'],
      ['wheel', 'Glücksrad'],
      ['giveaways', 'Giveaways'],
      ['gamble', 'Gamble'],
      ['chat', 'Chat & Befehle'],
      ['gifts', 'Geschenk-Abos / GiftBombs'],
      ['notices', 'Hinweise / Fehlertexte']
    ];
    return `
      <div class="lg-panel lg-texts-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Loyalty-Texte</h3>
            <p class="lg-muted">Zentrale Stelle für Texte und Varianten. Wähle später hier das Modul aus und bearbeite die passenden Chat-/Hinweis-/Fehlertexte.</p>
          </div>
          <div class="lg-actions">
            <label class="lg-config-select-label">Bereich auswählen
              <select data-lg-text-section>
                ${sections.map(([id, label]) => `<option value="${esc(id)}">${esc(label)}${id === 'all' ? '' : ' · vorbereitet'}</option>`).join('')}
              </select>
            </label>
          </div>
        </div>
        <div class="lg-warning">Aktuell werden die vorhandenen Textvarianten angezeigt. Neue Bereiche werden später an die zentrale Textverwaltung angebunden.</div>
      </div>

      <div class="lg-grid lg-grid-2">
        <div class="lg-panel">
          <h3>Text-Kategorien</h3>
          <p class="lg-muted">CGN-/Altersheim-/Rentner-Texte laufen über den bestehenden Helper für Textvarianten.</p>
          <div class="lg-kv">
            ${categories.map(cat => `<span>${esc(cat.label || cat.id)}</span><strong>${fmtNumber(cat.variantCount || cat.count || 0)} Varianten</strong>`).join('') || '<span>Texte</span><strong>-</strong>'}
          </div>
        </div>
        <div class="lg-panel">
          <h3>Bedienlogik</h3>
          <div class="lg-mini-list">
            <div class="lg-mini-row"><span><strong>Modul auswählen</strong><br><small class="lg-muted">Texte werden künftig je Bereich gefiltert.</small></span><span class="lg-badge lg-badge-warn">vorbereitet</span></div>
            <div class="lg-mini-row"><span><strong>Varianten</strong><br><small class="lg-muted">Mehrere aktive Antworten pro Text-Key bleiben möglich.</small></span><span class="lg-badge lg-badge-ok">vorhanden</span></div>
          </div>
        </div>
      </div>

      <div class="lg-panel">
        <h3>Textvarianten</h3>
        <div class="lg-table-wrap">
          <table class="lg-table">
            <thead>
              <tr><th>Key</th><th>Kategorie</th><th>Aktive Varianten</th><th>Varianten</th></tr>
            </thead>
            <tbody>
              ${keys.map(item => `
                <tr>
                  <td><code>${esc(item.key)}</code></td>
                  <td>${esc(item.category || 'general')}</td>
                  <td>${fmtNumber(item.activeCount || 0)} / ${fmtNumber(item.totalCount || 0)}</td>
                  <td>
                    ${(item.variants || []).map(v => `<div class="lg-muted">• ${esc(v.value || v.text || '')}</div>`).join('')}
                    <form class="lg-inline-form" data-lg-save-chat-text>
                      <input type="hidden" name="key" value="${esc(item.key)}">
                      <input type="hidden" name="category" value="${esc(item.category || 'general')}">
                      <input name="value" placeholder="Neue Variante im CGN-Stil..." autocomplete="off">
                      <button class="lg-btn lg-btn-secondary" type="submit">Variante speichern</button>
                    </form>
                  </td>
                </tr>
              `).join('') || `<tr><td colspan="4" class="lg-muted">Keine Textkeys geladen.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderNotes(){
    const routes = Array.isArray(state.routes?.routes) ? state.routes.routes : [];
    return `
      <div class="lg-panel">
        <h3>Hinweise</h3>
        <ul class="lg-notes">
          <li>LWG-4O.5 zeigt die automatische Chat-Claim-Pflicht im Giveaway-Dashboard.</li>
          <li>Wheel-Giveaways können Gewinner ziehen; die Rad-Freigabe kann bis zur Chatmeldung zurückgehalten werden.</li>
          <li>Abgeschlossene Giveaways sind read-only und sollen kopiert werden.</li>
          <li>Dashboard darf Regeln verwalten, aber später keine Gewinner oder Gewinne erzwingen.</li>
          <li>EventBus/Broadcast-Grundlagen sind vorbereitet.</li>
        </ul>
      </div>
      <div class="lg-panel">
        <h3>Games-Routen</h3>
        <div class="lg-route-list">
          ${routes.map(route => `<code>${esc(route)}</code>`).join('') || '<span class="lg-muted">Keine Routen geladen.</span>'}
        </div>
      </div>
    `;
  }

  function renderConfigUxStandard(){
    return `
      <div class="lg-panel lg-config-standard-panel">
        <h3>Config-UX-Standard</h3>
        <p class="lg-muted">Alle weiteren Loyalty-Config-Bereiche sollen nach diesem Muster angebunden werden.</p>
        <div class="lg-mini-list">
          <div class="lg-mini-row"><span><strong>Normale Oberfläche</strong><br><small class="lg-muted">Keine Rohdaten-/JSON-Blöcke im Streamer-Dashboard.</small></span><span class="lg-badge lg-badge-ok">Standard</span></div>
          <div class="lg-mini-row"><span><strong>Speichern</strong><br><small class="lg-muted">Bestätigungsdialog vor echtem Write, danach verständliche Erfolgsmeldung.</small></span><span class="lg-badge lg-badge-warn">Schutz</span></div>
          <div class="lg-mini-row"><span><strong>Fehler</strong><br><small class="lg-muted">Klare Fehlermeldung statt technischem Dump. Details nur später im Admin-/Debug-Modus.</small></span><span class="lg-badge lg-badge-warn">UX</span></div>
          <div class="lg-mini-row"><span><strong>Audit</strong><br><small class="lg-muted">Writes bleiben nachvollziehbar; Backend-/Audit-Verhalten bleibt unverändert.</small></span><span class="lg-badge lg-badge-ok">Pflicht</span></div>
        </div>
      </div>
    `;
  }

  function renderConfigPlaceholder(sectionLabel){
    return `
      <div class="lg-panel">
        <h3>${esc(sectionLabel)}</h3>
        <p class="lg-muted">Dieser Config-Bereich ist vorbereitet, aber noch nicht aktiv angebunden.</p>
        <div class="lg-mini-list">
          <div class="lg-mini-row"><span><strong>Geplanter Standard</strong><br><small class="lg-muted">Speichern mit Bestätigung, klare Ergebnisanzeige, kein technischer JSON-Dump.</small></span><span class="lg-badge lg-badge-warn">geplant</span></div>
        </div>
      </div>
    `;
  }

  function renderGambleConfigPanel(){
    const config = state.gambleConfig || {};
    const engineOn = Boolean(getGambleEngine(config, 'enabled', false));
    const commandOn = Boolean(getGambleCommand(config, 'enabled', false));

    return `
      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Gamble-Konfiguration</h3>
            <p class="lg-muted">Zentrale Config-Ansicht. Command-Schalter und Command-Cooldown liegen im zentralen Command-System; Gamble selbst rechnet nur Gewinn oder Verlust.</p>
          </div>
          <div class="lg-actions">
            <button class="lg-btn lg-btn-secondary" data-lg-gamble-reload>Neu laden</button>
          </div>
        </div>
        <form class="lg-form lg-gamble-form" data-lg-gamble-form>
          <div class="lg-check-row">
            <label class="lg-check"><input name="enabled" type="checkbox" ${engineOn ? 'checked' : ''}> Engine aktiv</label>
            <label class="lg-check"><input name="commandEnabled" type="checkbox" ${commandOn ? 'checked' : ''}> Command aktiv</label>
            <label class="lg-check"><input name="sendResultToChat" type="checkbox" ${getGambleCommand(config, 'sendResultToChat', true) ? 'checked' : ''}> Chat-Antwort</label>
          </div>
          <div class="lg-form-row">
            <label>Gewinnchance %<input name="winChancePercent" type="number" min="0" max="100" step="0.01" value="${esc(getGambleEngine(config, 'winChancePercent', 47))}"></label>
            <label>Command-Cooldown pro User (Sek.)<input name="commandCooldownUserSeconds" type="number" min="0" step="1" value="${esc(msToSecondsInput(getGambleCommand(config, 'cooldownUserMs', 60000)))}"></label>
          </div>
          <div class="lg-form-row">
            <label>Mindesteinsatz<input name="minBet" type="number" min="0" step="1" value="${esc(getGambleEngine(config, 'minBet', 1))}"></label>
            <label>Maximaleinsatz<input name="maxBet" type="number" min="0" step="1" value="${esc(getGambleEngine(config, 'maxBet', 0))}"></label>
          </div>
          <div class="lg-mini-list">
            <div class="lg-mini-row"><span><strong>Gamble-Logik</strong><br><small class="lg-muted">Gewonnen = Einsatz dazu · Verloren = Einsatz weg. Kein sichtbarer Auszahlungsmultiplikator.</small></span><span class="lg-badge lg-badge-ok">einfach</span></div>
            <div class="lg-mini-row"><span><strong>Cooldown-Zuständigkeit</strong><br><small class="lg-muted">Cooldown läuft über den zentralen Command <code>!gamble</code>, nicht doppelt in der Gamble-Engine.</small></span><span class="lg-badge lg-badge-ok">Command</span></div>
          </div>
          <div class="lg-check-row">
            <label class="lg-check"><input name="allowPercentBets" type="checkbox" ${getGambleEngine(config, 'allowPercentBets', true) ? 'checked' : ''}> Prozent-Einsätze erlauben</label>
            <label class="lg-check"><input name="allowKeywordBets" type="checkbox" ${getGambleEngine(config, 'allowKeywordBets', true) ? 'checked' : ''}> Keyword-Einsätze erlauben</label>
          </div>
          <div class="lg-check-row lg-gamble-danger-row">
            <button class="lg-btn" type="button" data-lg-gamble-save ${state.saving ? 'disabled' : ''}>Speichern</button>
            <span class="lg-muted">Speichern fragt vor dem echten Write nach Bestätigung.</span>
          </div>
        </form>
${renderGambleResultBox('Letztes Speicher-Ergebnis')}
      </div>
    `;
  }

  function renderConfig(){
    const section = state.configSection || 'gamble';
    const sections = [
      ['core', 'Core', false],
      ['runner', 'Automatische Punkte', false],
      ['gift_subs', 'Geschenk-Abos / GiftBombs', false],
      ['raids', 'Raids', false],
      ['wheel', 'Glücksrad', false],
      ['presets', 'Presets', false],
      ['giveaways', 'Giveaways', false],
      ['gamble', 'Gamble', true],
      ['chat', 'Chat & Befehle', false]
    ];
    const current = sections.find(([id]) => id === section) || sections.find(([id]) => id === 'gamble');
    return `
      <div class="lg-panel lg-config-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Loyalty-Einstellungen</h3>
            <p class="lg-muted">Eine zentrale Seite für alle Loyalty-Einstellungen. Wähle oben den Bereich aus; Texte und Logs haben eigene Tabs.</p>
          </div>
          <div class="lg-actions">
            <label class="lg-config-select-label">Bereich auswählen
              <select data-lg-config-section>
                ${sections.map(([id, label, enabled]) => `<option value="${esc(id)}" ${id === section ? 'selected' : ''} ${enabled ? '' : 'disabled'}>${esc(label)}${enabled ? '' : ' · geplant'}</option>`).join('')}
              </select>
            </label>
          </div>
        </div>
        ${current?.[0] === 'gamble' ? renderGambleConfigPanel() : renderConfigPlaceholder(current?.[1] || 'Config-Bereich')}
        ${renderConfigUxStandard()}
      </div>
    `;
  }

  function renderGambleStatsModal(){
    const stats = state.gambleStats || { total: 0, wins: 0, losses: 0, netProfit: 0, players: [] };
    const players = Array.isArray(stats.players) ? stats.players : buildGamblePlayerStats(state.gambleLogRows || []);
    return `
      <div class="lgw-modal-backdrop" data-lg-gamble-modal-close>
        <div class="lgw-modal lgw-detail-modal" role="dialog" aria-modal="true" aria-label="Gamble Statistik" data-lg-gamble-modal-box>
          <div class="lgw-modal-head">
            <div>
              <p class="lg-eyebrow">Gamble</p>
              <h3>Spieler-Statistik</h3>
              <p class="lg-muted">Aus den zuletzt geladenen Command-Logs. Für echte Langzeitstatistik braucht es später eine eigene Backend-API.</p>
            </div>
            <button class="lgw-icon-btn" data-lg-gamble-modal-close type="button">×</button>
          </div>
          <div class="lg-grid lg-grid-4 lg-gamble-stats">
            <article class="lg-card"><span class="lg-card-label">Gambles</span><strong>${fmtNumber(stats.total || 0)}</strong></article>
            <article class="lg-card"><span class="lg-card-label">Gewonnen</span><strong>${fmtNumber(stats.wins || 0)}</strong></article>
            <article class="lg-card"><span class="lg-card-label">Verloren</span><strong>${fmtNumber(stats.losses || 0)}</strong></article>
            <article class="lg-card"><span class="lg-card-label">Netto</span><strong>${esc(formatSigned(stats.netProfit || 0))}</strong><small>Kekskrümel</small></article>
          </div>
          <section class="lg-panel" style="margin-top:14px">
            <div class="lg-panel-head">
              <div>
                <h3>Spieler</h3>
                <p class="lg-muted">Sortiert nach Anzahl der geladenen Gamble-Spiele.</p>
              </div>
              <button class="lg-btn lg-btn-secondary" data-lg-gamble-stats-refresh type="button">Neu laden</button>
            </div>
            <div class="lg-table-wrap">
              <table class="lg-table">
                <thead><tr><th>User</th><th>Spiele</th><th>Gewonnen</th><th>Verloren</th><th>Quote</th><th>Einsatz gesamt</th><th>Netto</th><th>Letzter Gamble</th></tr></thead>
                <tbody>
                  ${players.slice(0, 80).map(p => `
                    <tr>
                      <td><strong>${esc(p.displayName || p.login || '-')}</strong><br><small>${esc(p.login || '')}</small></td>
                      <td>${fmtNumber(p.total || 0)}</td>
                      <td>${fmtNumber(p.wins || 0)}</td>
                      <td>${fmtNumber(p.losses || 0)}</td>
                      <td>${esc(String(p.winRate ?? 0).replace('.', ','))}%</td>
                      <td>${fmtNumber(p.betTotal || 0)}</td>
                      <td><strong>${esc(formatSigned(p.netProfit || 0))}</strong></td>
                      <td>${fmtDate(p.lastAt)}</td>
                    </tr>
                  `).join('') || `<tr><td colspan="8" class="lg-muted">Keine Gamble-Spieler in den geladenen Command-Logs gefunden.</td></tr>`}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  function renderGambleAuditModal(){
    const auditRows = Array.isArray(state.gambleAudit?.items) ? state.gambleAudit.items : (Array.isArray(state.gambleAudit?.rows) ? state.gambleAudit.rows : []);
    return `
      <div class="lgw-modal-backdrop" data-lg-gamble-modal-close>
        <div class="lgw-modal lgw-detail-modal" role="dialog" aria-modal="true" aria-label="Gamble Audit" data-lg-gamble-modal-box>
          <div class="lgw-modal-head">
            <div>
              <p class="lg-eyebrow">Gamble</p>
              <h3>Config-Audit</h3>
              <p class="lg-muted">Technische Schreibvorgänge der Gamble-Konfiguration. Nicht für die normale Tagesansicht gedacht.</p>
            </div>
            <button class="lgw-icon-btn" data-lg-gamble-modal-close type="button">×</button>
          </div>
          <section class="lg-panel">
            <div class="lg-panel-head">
              <div>
                <h3>Letzte Änderungen</h3>
                <p class="lg-muted">Zeigt nur Audit-Daten der vorhandenen Gamble-Dashboard-Audit-API.</p>
              </div>
              <button class="lg-btn lg-btn-secondary" data-lg-gamble-audit-refresh type="button">Neu laden</button>
            </div>
            <div class="lg-table-wrap">
              <table class="lg-table">
                <thead><tr><th>Aktion</th><th>User</th><th>Zeitpunkt</th><th>Rolle</th></tr></thead>
                <tbody>
                  ${auditRows.length ? auditRows.map(row => {
                    const actor = row.actor_login || row.actorLogin || row.actor || 'unbekannt';
                    const display = row.actor_display_name || row.actorDisplayName || actor;
                    const role = row.actor_role || row.actorRole || '-';
                    const action = row.action || row.event || row.audit_uid || row.auditUid || 'write';
                    const at = row.created_at || row.createdAt || row.ts || '';
                    return `<tr><td><strong>${esc(action)}</strong></td><td>${esc(display)}<br><small>${esc(actor)}</small></td><td>${fmtDate(at)}</td><td>${esc(role)}</td></tr>`;
                  }).join('') : `<tr><td colspan="4" class="lg-muted">Keine Audit-Einträge gefunden.</td></tr>`}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  function renderGambleModal(){
    if (state.gambleModal === 'stats') return renderGambleStatsModal();
    if (state.gambleModal === 'audit') return renderGambleAuditModal();
    return '';
  }

  function renderGamble(){
    const config = state.gambleConfig || {};
    const stats = state.gambleStats || { total: 0, wins: 0, losses: 0, netProfit: 0, players: [] };
    const engineOn = Boolean(getGambleEngine(config, 'enabled', false));
    const commandOn = Boolean(getGambleCommand(config, 'enabled', false));
    const chatOn = Boolean(getGambleCommand(config, 'sendResultToChat', true));
    const chance = getGambleEngine(config, 'winChancePercent', '?');
    const cooldown = getGambleCommand(config, 'cooldownUserMs', '?');

    return `
      <div class="lg-grid lg-grid-4 lg-gamble-kpis">
        <article class="lg-card">
          <span class="lg-card-label">Gamble</span>
          <strong>${engineOn && commandOn ? 'AN' : 'AUS'}</strong>
          ${badge(engineOn && commandOn, 'spielbereit', 'prüfen')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Chance</span>
          <strong>${esc(chance)}%</strong>
          <small>Gewinn = Einsatz dazu</small>
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Cooldown</span>
          <strong>${esc(formatDuration(cooldown))}</strong>
          <small>Command-Cooldown pro User</small>
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Netto</span>
          <strong>${esc(formatSigned(stats.netProfit || 0))}</strong>
          <small>${fmtNumber(stats.total || 0)} geladene Gambles</small>
        </article>
      </div>

      <div class="lg-grid lg-editor-grid lg-gamble-grid">
        <div class="lg-panel">
          <div class="lg-panel-head">
            <div>
              <h3>Gamble</h3>
              <p class="lg-muted">Alltagsansicht für den Stream. Technische Logs und Audit liegen hinter den Buttons.</p>
            </div>
            <div class="lg-actions">
              <button class="lg-btn" data-lg-open-config-section="gamble">Config bearbeiten</button>
              <button class="lg-btn lg-btn-secondary" data-lg-gamble-stats>Statistik öffnen</button>
              <button class="lg-btn lg-btn-secondary" data-lg-gamble-audit>Audit öffnen</button>
              <button class="lg-btn lg-btn-secondary" data-lg-gamble-reload>Neu laden</button>
            </div>
          </div>
          <div class="lg-mini-list">
            <div class="lg-mini-row"><span><strong>Command</strong><br><small class="lg-muted">${commandOn ? '!gamble ist aktiv' : '!gamble ist aus'}</small></span>${badge(commandOn, 'aktiv', 'aus')}</div>
            <div class="lg-mini-row"><span><strong>Chat-Antwort</strong><br><small class="lg-muted">${chatOn ? 'HeimaufsichtCGN antwortet im Chat.' : 'Keine Chat-Antwort aktiv.'}</small></span>${badge(chatOn, 'aktiv', 'aus')}</div>
            <div class="lg-mini-row"><span><strong>Rechnung</strong><br><small class="lg-muted">Gewinn = Einsatz dazu · Verlust = Einsatz weg · kein sichtbarer Auszahlungsmultiplikator.</small></span><span class="lg-badge lg-badge-ok">sauber</span></div>
            <div class="lg-mini-row"><span><strong>Config</strong><br><small class="lg-muted">Werte werden zentral im Config-Tab bearbeitet.</small></span><span class="lg-badge lg-badge-warn">Config-Tab</span></div>
          </div>
        </div>

        <div class="lg-panel">
          <div class="lg-panel-head">
            <div>
              <h3>Kurzstatistik</h3>
              <p class="lg-muted">Aus den zuletzt geladenen Command-Logs. Details findest du über „Statistik öffnen“.</p>
            </div>
          </div>
          <div class="lg-grid lg-grid-4 lg-gamble-stats">
            <article class="lg-card"><span class="lg-card-label">Gambles</span><strong>${fmtNumber(stats.total || 0)}</strong></article>
            <article class="lg-card"><span class="lg-card-label">Gewonnen</span><strong>${fmtNumber(stats.wins || 0)}</strong></article>
            <article class="lg-card"><span class="lg-card-label">Verloren</span><strong>${fmtNumber(stats.losses || 0)}</strong></article>
            <article class="lg-card"><span class="lg-card-label">Netto</span><strong>${esc(formatSigned(stats.netProfit || 0))}</strong></article>
          </div>
          <div class="lg-warning">Hinweis: Diese Statistik basiert aktuell auf den geladenen Command-Logs. Für echte Langzeit-Auswertung planen wir später eine eigene Backend-Statistikroute.</div>
        </div>
      </div>
      ${renderGambleModal()}
    `;
  }

  function renderTabs(){
    if (typeof window.LoyaltyModule?.renderMainTabs === 'function') {
      return window.LoyaltyModule.renderMainTabs(state.activeTab || 'overview');
    }
    const tabs = [
      ['overview', 'Übersicht'],
      ['core', 'Core'],
      ['wheel', 'Glücksrad'],
      ['presets', 'Presets'],
      ['giveaways', 'Giveaways'],
      ['gamble', 'Gamble'],
      ['config', 'Einstellungen'],
      ['chat', 'Chat & Befehle'],
      ['texts', 'Texte'],
      ['history', 'Logs']
    ];
    return `
      <div class="lg-tabs loyalty-main-tabs">
        ${tabs.map(([id, label]) => `<button class="lg-tab ${state.activeTab === id ? 'is-active' : ''}" data-lg-tab="${id}">${label}</button>`).join('')}
      </div>
    `;
  }

  function renderGiveawaysRedirect(){
    return `
      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Giveaway-Control</h3>
            <p class="lg-muted">Giveaways werden ab jetzt ausschließlich im neuen Giveaway-Control verwaltet. Die alte Inline-Giveaway-Seite ist kein Bedienziel mehr.</p>
          </div>
          <button class="lg-btn" data-lg-open-module="loyalty_giveaways">Giveaway-Control öffnen</button>
        </div>
      </div>
    `;
  }

  function renderGiveawayWheelEditorRedirect(){
    return `
      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Giveaway-Glücksrad</h3>
            <p class="lg-muted">Der alte Inline-Glücksrad-Editor in Loyalty Games ist deaktiviert. Giveaway-Glücksräder werden im neuen Giveaway-Control verwaltet.</p>
          </div>
          <button class="lg-btn" data-lg-open-module="loyalty_giveaways">Giveaway-Control öffnen</button>
        </div>
      </div>
    `;
  }

  function renderActiveTab(){
    if (state.activeTab === 'wheel') return renderWheel();
    if (state.activeTab === 'presets') return renderPresets();
    if (state.activeTab === 'giveaway_wheel_editor') return renderGiveawayWheelEditorRedirect();
    if (state.activeTab === 'giveaways') return renderGiveawaysRedirect();
    if (state.activeTab === 'gamble') return renderGamble();
    if (state.activeTab === 'config') return renderConfig();
    if (state.activeTab === 'texts') return renderTexts();
    if (state.activeTab === 'chat') return renderChatSetup();
    if (state.activeTab === 'history') return renderSessions();
    return renderOverview();
  }

  function bindEvents(){
    window.LoyaltyModule?.bindMainTabs?.(root);
    root.querySelectorAll('[data-lg-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeTab = btn.dataset.lgTab || 'overview';
        render();
      });
    });

    root.querySelectorAll('[data-lg-open-module]').forEach(btn => {
      btn.addEventListener('click', () => {
        const moduleId = btn.dataset.lgOpenModule;
        if (moduleId && typeof window.CGN?.setActiveModule === 'function') {
          window.CGN.setActiveModule(moduleId, { section: 'loyalty' });
        }
      });
    });

    root.querySelector('[data-lg-reload]')?.addEventListener('click', () => loadAll(true));

    root.querySelector('[data-lg-config-section]')?.addEventListener('change', ev => {
      state.configSection = ev.currentTarget.value || 'gamble';
      render();
    });

    root.querySelectorAll('[data-lg-open-config-section]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.configSection = btn.dataset.lgOpenConfigSection || 'gamble';
        state.activeTab = 'config';
        render();
      });
    });

    root.querySelector('[data-lg-gamble-reload]')?.addEventListener('click', async () => {
      await Promise.allSettled([loadGambleConfig(false), loadGambleAudit(false), loadGambleStats(false)]);
      render();
    });

    root.querySelector('[data-lg-gamble-audit]')?.addEventListener('click', async () => {
      state.gambleModal = 'audit';
      await loadGambleAudit(false);
      render();
    });
    root.querySelector('[data-lg-gamble-stats]')?.addEventListener('click', async () => {
      state.gambleModal = 'stats';
      await loadGambleStats(false);
      render();
    });
    root.querySelector('[data-lg-gamble-audit-refresh]')?.addEventListener('click', async () => {
      await loadGambleAudit(false);
      render();
    });
    root.querySelector('[data-lg-gamble-stats-refresh]')?.addEventListener('click', async () => {
      await loadGambleStats(false);
      render();
    });
    root.querySelectorAll('[data-lg-gamble-modal-close]').forEach(el => el.addEventListener('click', ev => {
      if (ev.target.closest('[data-lg-gamble-modal-box]') && !ev.target.matches('[data-lg-gamble-modal-close]')) return;
      state.gambleModal = '';
      render();
    }));
    root.querySelectorAll('[data-lg-gamble-modal-box]').forEach(box => box.addEventListener('click', ev => ev.stopPropagation()));
    root.querySelector('[data-lg-gamble-clear-result]')?.addEventListener('click', () => {
      state.gambleResult = '';
      render();
    });

    root.querySelector('[data-lg-gamble-save]')?.addEventListener('click', () => {
      const form = root.querySelector('[data-lg-gamble-form]');
      submitGambleWrite(form);
    });

    root.querySelectorAll('[data-lg-jump-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.lgJumpTab || 'overview';
        if (tab === 'giveaways' && typeof window.CGN?.setActiveModule === 'function') {
          window.CGN.setActiveModule('loyalty_giveaways', { section: 'loyalty' });
          return;
        }
        state.activeTab = tab;
        render();
      });
    });

    root.querySelectorAll('[data-lg-select-preset]').forEach(btn => {
      btn.addEventListener('click', () => loadPreset(btn.dataset.lgSelectPreset));
    });

    root.querySelector('[data-lg-preset-refresh]')?.addEventListener('click', async () => {
      await refreshPresets(state.selectedPresetUid);
      render();
    });

    root.querySelector('[data-lg-create-preset]')?.addEventListener('submit', ev => {
      ev.preventDefault();
      handleCreatePreset(ev.currentTarget);
    });
    root.querySelector('[data-lg-update-preset]')?.addEventListener('submit', ev => {
      ev.preventDefault();
      handleUpdatePreset(ev.currentTarget);
    });
    root.querySelector('[data-lg-create-field]')?.addEventListener('submit', ev => {
      ev.preventDefault();
      handleCreateField(ev.currentTarget);
    });
    root.querySelectorAll('[data-lg-update-field]').forEach(form => {
      form.addEventListener('submit', ev => {
        ev.preventDefault();
        handleUpdateField(ev.currentTarget);
      });
    });
    root.querySelectorAll('[data-lg-delete-field]').forEach(btn => {
      btn.addEventListener('click', () => deleteField(btn.dataset.lgDeleteField));
    });
    root.querySelectorAll('[data-lg-preset-action]').forEach(btn => {
      btn.addEventListener('click', () => presetAction(btn.dataset.lgPresetAction, btn.dataset.presetUid));
    });
    root.querySelectorAll('[data-lg-start-spin]').forEach(btn => {
      btn.addEventListener('click', () => startPresetSpin(btn.dataset.lgStartSpin));
    });

    root.querySelectorAll('[data-lg-save-chat-text]').forEach(form => {
      form.addEventListener('submit', ev => {
        ev.preventDefault();
        saveChatTextVariant(ev.currentTarget);
      });
    });
  }

  function render(){
    root = document.getElementById('loyaltyGamesModule');
    if (!root) return;

    if (state.loading) {
      root.innerHTML = `<div class="lg-panel"><h2>Loyalty</h2><p class="lg-muted">Lade Daten...</p></div>`;
      return;
    }

    if (state.error) {
      root.innerHTML = `<div class="lg-panel lg-error"><h2>Loyalty</h2><p>${esc(state.error)}</p><button data-lg-reload>Neu laden</button></div>`;
      root.querySelector('[data-lg-reload]')?.addEventListener('click', () => loadAll(true));
      return;
    }

    root.innerHTML = `
      <div class="lg-head">
        <div>
          <p class="lg-eyebrow">Loyalty / Übersicht</p>
          <h2>Loyalty</h2>
          <p class="lg-subline">Kompakter Überblick, zentrale Einstellungen, Texte und Logs – für Streamer und Mods.</p>
        </div>
        <div class="lg-actions">
          <a class="lg-btn lg-btn-secondary" href="${api.overlay}" target="_blank">Overlay öffnen</a>
          <button class="lg-btn" data-lg-reload ${state.saving ? 'disabled' : ''}>Reload</button>
        </div>
      </div>
      ${state.message ? `<div class="lg-toast">${esc(state.message)}</div>` : ''}
      ${state.saving ? `<div class="lg-toast lg-toast-warn">Speichere...</div>` : ''}
      ${renderTabs()}
      ${renderActiveTab()}
    `;

    bindEvents();
  }

  async function openGiveawayEditor(giveawayUid){
    if (typeof window.LoyaltyGiveawaysModule?.openGiveawayDetails === 'function') {
      await window.LoyaltyGiveawaysModule.openGiveawayDetails(giveawayUid);
    }
    if (typeof window.CGN?.setActiveModule === 'function') {
      window.CGN.setActiveModule('loyalty_giveaways', { section: 'loyalty', giveawayUid });
      return;
    }
    state.activeTab = 'overview';
    render();
  }

  async function openGiveawayWheelEditor(giveawayUid){
    if (typeof window.LoyaltyGiveawaysModule?.openGiveawayWheelEditor === 'function') {
      await window.LoyaltyGiveawaysModule.openGiveawayWheelEditor(giveawayUid);
    }
    if (typeof window.CGN?.setActiveModule === 'function') {
      window.CGN.setActiveModule('loyalty_giveaways', { section: 'loyalty', giveawayUid, wheelEditor: true });
      return;
    }
    state.activeTab = 'overview';
    render();
  }

  function setTab(tab){
    if (tab === 'giveaways' && typeof window.CGN?.setActiveModule === 'function') {
      window.CGN.setActiveModule('loyalty_giveaways', { section: 'loyalty' });
      return;
    }
    state.activeTab = tab || 'overview';
    render();
  }

  window.addEventListener('cgn:module-show', event => {
    if (event.detail?.module === 'loyalty_games') loadAll();
  });

  registerDashboardModule();

  return {
    loadAll,
    render,
    setTab,
    openGiveawayEditor,
    openGiveawayWheelEditor
  };
})();
