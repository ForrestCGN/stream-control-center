window.LoyaltyGamesModule = (function(){
  'use strict';

  const api = {
    coreStatus: '/api/loyalty/status',
    loyaltySettings: '/api/loyalty/settings',
    coreHistory: '/api/loyalty/events/history?limit=120',
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
    gameTexts: '/api/loyalty/games/texts',
    communicationStatus: '/api/communication/status',
    gambleConfig: '/api/loyalty/games/gamble/dashboard-config',
    gambleAudit: '/api/loyalty/games/gamble/dashboard-audit?limit=8',
    raffleConfig: '/api/loyalty/raffle/config',
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
    coreSettings: null,
    coreHistory: null,
    coreSettingsResult: '',
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
    raffleConfig: null,
    raffleResult: '',
    gambleLogRows: [],
    gambleModal: '',
    gambleResult: '',
    configSection: 'core',
    logModule: 'all',
    logEvent: 'all',
    logStatus: 'all',
    logSearch: '',
    logDetailKey: '',
    textSection: 'all',
    textSearch: '',
    textEditKey: '',
    gameTexts: null,
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


  async function loadRaffleConfig(rerender = true){
    try {
      state.raffleConfig = await window.CGN.api(api.raffleConfig);
    } catch (err) {
      state.raffleConfig = { ok:false, error: err.message };
    }
    if (rerender) render();
  }

  async function submitRaffleConfig(form){
    if (!form) return;
    const boolValue = name => !!form.elements[name]?.checked;
    const intValue = (name, fallback, min = 0) => {
      const value = Number(form.elements[name]?.value);
      if (!Number.isFinite(value)) return fallback;
      return Math.max(min, Math.floor(value));
    };
    const textValue = (name, fallback) => String(form.elements[name]?.value || fallback || '').trim();

    const currentConfig = state.raffleConfig?.config || state.raffleConfig?.raffle?.config || {};
    const entryCostAmount = intValue('entryCostAmount', 0, 0);
    const body = {
      enabled: boolValue('enabled'),
      durationSeconds: intValue('durationSeconds', 120, 10),
      prizePoolAmount: intValue('prizePoolAmount', 5000, 0),
      entryCostEnabled: entryCostAmount > 0,
      entryCostAmount,
      liveOnly: boolValue('liveOnly'),
      startPermission: String(currentConfig.startPermission || 'mod').trim() || 'mod',
      raffleCommand: String(currentConfig.raffleCommand || 'raffle').trim().replace(/^!+/, '') || 'raffle',
      joinCommand: String(currentConfig.joinCommand || 'join').trim().replace(/^!+/, '') || 'join',
      showPoolInChat: false
    };

    state.saving = true;
    state.raffleResult = buildGambleResult('loading', 'Speichere Raffle-Konfiguration', 'Bitte kurz warten.');
    render();
    try {
      const result = await apiPost(api.raffleConfig, body);
      state.raffleResult = result?.ok
        ? buildGambleResult('success', 'Gespeichert', 'Die Raffle-Einstellungen wurden übernommen.')
        : buildGambleResult('error', 'Speichern unklar', result?.error || 'Die Antwort war nicht eindeutig.', result || {});
      await loadRaffleConfig(false);
    } catch (err) {
      state.raffleResult = buildGambleResult('error', 'Speichern fehlgeschlagen', err.message || 'Unbekannter Fehler.', { error: err.message || String(err) });
      state.error = err.message || String(err);
    } finally {
      state.saving = false;
      render();
    }
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


  async function loadCoreLoyalty(rerender = true){
    try {
      const [coreStatus, coreSettings] = await Promise.all([
        window.CGN.api(api.coreStatus).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.loyaltySettings).catch(err => ({ ok:false, error:err.message, settings:[] }))
      ]);
      state.coreStatus = coreStatus;
      state.coreSettings = coreSettings;
      state.error = '';
    } catch (err) {
      state.error = err.message || String(err);
    }
    if (rerender) render();
  }

  async function submitCoreSetting(body, label = 'Core-Einstellung'){
    if (!window.confirm(`${label} wirklich speichern?`)) {
      state.coreSettingsResult = buildGambleResult('info', 'Speichern abgebrochen', 'Es wurde keine Änderung geschrieben.');
      render();
      return;
    }
    state.saving = true;
    state.coreSettingsResult = buildGambleResult('loading', `${label} wird gespeichert`, 'Bitte kurz warten.');
    render();
    try {
      const result = await apiPost(api.loyaltySettings, body || {});
      state.coreSettingsResult = result?.ok
        ? buildGambleResult('success', `${label} gespeichert`, 'Die Einstellung wurde aktualisiert und neu geladen.')
        : buildGambleResult('info', `${label} gespeichert`, 'Bitte Ergebnis prüfen.');
      state.message = result?.ok ? `${label} gespeichert.` : `${label} gespeichert, bitte Ergebnis prüfen.`;
      await loadCoreLoyalty(false);
    } catch (err) {
      state.coreSettingsResult = buildGambleResult('error', 'Speichern fehlgeschlagen', err.message || 'Unbekannter Fehler.', { error: err.message || String(err) });
      state.error = err.message || String(err);
    } finally {
      state.saving = false;
      render();
    }
  }

  async function loadAll(force){
    root = document.getElementById('loyaltyGamesModule');
    if (!root || !window.CGN) return;
    if (!force && state.coreStatus && state.coreSettings && state.status && state.wheelStatus && state.presets && state.giveaways && state.giveawayCommands && state.giveawayTexts && state.communicationStatus && state.gambleConfig && state.raffleConfig) { render(); return; }

    state.loading = true;
    state.error = '';
    render();

    try {
      const [coreStatus, coreSettings, coreHistory, status, config, routes, sessions, wheelStatus, wheelConfig, presets, spins, giveawaysStatus, giveaways, giveawayCommands, giveawayTexts, communicationStatus, gambleConfig, gambleAudit, raffleConfig, commandLogs] = await Promise.all([
        window.CGN.api(api.coreStatus).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.loyaltySettings).catch(err => ({ ok:false, error:err.message, settings:[] })),
        window.CGN.api(api.coreHistory).catch(err => ({ ok:false, error:err.message, rows:[] })),
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
        window.CGN.api(api.raffleConfig).catch(err => ({ ok:false, error:err.message })),
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

      state = { ...state, loading:false, error:'', coreStatus, coreSettings, coreHistory, status, config, routes, sessions, wheelStatus, wheelConfig, presets, spins, giveawaysStatus, giveaways, giveawayCommands, giveawayTexts, communicationStatus, gambleConfig, gambleAudit, raffleConfig, gambleLogRows: normalizeGambleRows(commandLogs), gambleStats: buildGambleStats(normalizeGambleRows(commandLogs)), selectedPresetUid, selectedGiveawayUid };
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
        title: 'Mini-Spiele',
        icon: '🎲',
        tab: 'minigames',
        description: 'Raffle und Gamble in einem Bereich',
        health: gamesHealth
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
        <h3>Kurzer Systemblick</h3>
        <p class="lg-muted">Nur das Wichtigste. Technische Details gehören später in Logs oder Diagnose, nicht in die Startseite.</p>
        <div class="lg-kv">
          <span>Core</span><strong>${core.ok === false ? 'prüfen' : 'OK'}</strong>
          <span>Glücksrad/Games</span><strong>${status.ok === false ? 'prüfen' : 'OK'}</strong>
          <span>Giveaways</span><strong>${state.giveawaysStatus?.ok === false ? 'prüfen' : 'OK'}</strong>
          <span>Letzter Fehler</span><strong>${status.lastError ? esc(status.lastError) : '<span class="lg-muted">leer</span>'}</strong>
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

  function friendlyLoyaltyEvent(type){
    const clean = String(type || '').toLowerCase();
    const labels = {
      follow: 'Follow',
      subscribe: 'Sub',
      sub: 'Sub',
      resub: 'Resub',
      gift_sub: 'Geschenk-Abo',
      gift_bomb: 'GiftBomb',
      gifted_sub_received: 'Geschenk-Abo Empfänger',
      cheer: 'Bits / Cheer',
      raid: 'Raid',
      wheel_session: 'Glücksrad-Dreh',
      wheel_spin: 'Preset-Dreh',
      gamble: 'Gamble',
      giveaway: 'Giveaway'
    };
    return labels[clean] || statusLabel(type);
  }

  function logStatusInfo(row){
    const raw = String(row?.status || '').toLowerCase();
    const points = Number(row?.points ?? row?.amount ?? row?.net ?? 0);
    const type = String(row?.eventType || '').toLowerCase();
    if (['error', 'failed', 'fail'].includes(raw)) return { key:'error', label:'Fehler', cls:'lg-badge-off' };
    if (['duplicate', 'duplicated'].includes(raw)) return { key:'duplicate', label:'Duplikat', cls:'lg-badge-warn' };
    if (['skipped', 'skip'].includes(raw)) return { key:'skipped', label:'Übersprungen', cls:'lg-badge-warn' };
    if (type === 'gifted_sub_received' && points === 0) return { key:'tracked', label:'Nur erfasst', cls:'lg-badge-warn' };
    if (points !== 0 || ['processed', 'booked', 'success', 'ok'].includes(raw)) return { key:'booked', label: points !== 0 ? 'Gebucht' : 'Verarbeitet', cls:'lg-badge-ok' };
    if (['pending', 'waiting', 'open'].includes(raw)) return { key:'pending', label:'Offen', cls:'lg-badge-warn' };
    return { key: raw || 'info', label: statusLabel(raw || 'Info'), cls:'lg-badge-off' };
  }

  function logStatusBadge(row){
    const info = logStatusInfo(row);
    return `<span class="lg-badge ${info.cls}">${esc(info.label)}</span>`;
  }

  function normalizeCoreLogRows(){
    return rows(state.coreHistory).map(row => {
      const type = row.eventType || row.type || 'event';
      const points = Number(row.points ?? row.amount ?? 0) || 0;
      return {
        module: 'core',
        moduleLabel: 'Core',
        at: row.createdAt || row.created_at || row.updatedAt || '',
        eventType: type,
        eventLabel: friendlyLoyaltyEvent(type),
        user: row.displayName || row.login || row.userLogin || '-',
        login: row.login || row.userLogin || '',
        status: row.status || 'processed',
        points,
        details: row.reason || '',
        transactionUid: row.transactionUid || '',
        technicalId: row.uid || row.eventUid || row.transactionUid || '',
        raw: row
      };
    });
  }

  function normalizeWheelLogRows(){
    const sessions = rows(state.sessions).map(row => ({
      module: 'wheel',
      moduleLabel: 'Glücksrad',
      at: row.createdAt || row.startedAt || '',
      eventType: 'wheel_session',
      eventLabel: 'Glücksrad-Dreh',
      user: row.displayName || row.login || '-',
      login: row.login || '',
      status: row.status || '-',
      points: 0,
      details: row.selectedFieldLabel || row.resultLabel || row.source || '-',
      technicalId: row.sessionUid || '',
      raw: row
    }));
    const spins = rows(state.spins).map(row => ({
      module: 'wheel',
      moduleLabel: 'Glücksrad',
      at: row.createdAt || row.startedAt || '',
      eventType: 'wheel_spin',
      eventLabel: 'Preset-Dreh',
      user: row.displayName || row.login || '-',
      login: row.login || '',
      status: row.status || '-',
      points: 0,
      details: row.resultLabel || row.selectedFieldLabel || '-',
      technicalId: row.spinUid || row.sessionUid || '',
      raw: row
    }));
    return sessions.concat(spins);
  }

  function normalizeGambleLogRowsForLogs(){
    return (state.gambleLogRows || []).map(row => {
      const user = gambleRowUser(row);
      const outcome = gambleRowOutcome(row);
      const net = gambleRowNet(row);
      const bet = gambleRowBet(row);
      return {
        module: 'gamble',
        moduleLabel: 'Gamble',
        at: gambleRowTime(row),
        eventType: 'gamble',
        eventLabel: 'Gamble',
        user: user.displayName || user.login || '-',
        login: user.login || '',
        status: outcome.won ? 'won' : (outcome.lost ? 'lost' : 'processed'),
        points: net,
        details: `${outcome.outcome}${bet ? ` · Einsatz ${fmtNumber(bet)}` : ''}`,
        technicalId: row.uid || row.id || row.commandLogUid || '',
        raw: row
      };
    });
  }

  function buildCentralLogRows(){
    const all = normalizeCoreLogRows().concat(normalizeWheelLogRows(), normalizeGambleLogRowsForLogs());
    return all.sort((a, b) => Date.parse(b.at || 0) - Date.parse(a.at || 0));
  }

  function logRowKey(row){
    return [row.module || '', row.eventType || '', row.at || '', row.technicalId || '', row.login || row.user || ''].join('|');
  }

  function findLogRowByKey(key){
    return buildCentralLogRows().find(row => logRowKey(row) === key) || null;
  }

  function logRowShortDetail(row){
    const status = logStatusInfo(row).key;
    if (row.module === 'core') {
      if (status === 'tracked') return 'Nur erfasst';
      if (status === 'skipped') return 'Übersprungen';
      if (status === 'duplicate') return 'Duplikat erkannt';
      if (status === 'error') return 'Fehler prüfen';
      if (row.transactionUid || row.raw?.transactionUid) return 'Buchung vorhanden';
      if (Number(row.points || 0) !== 0) return 'Punkte gebucht';
      return row.details || 'Core-Ereignis';
    }
    return row.details || 'Details verfügbar';
  }

  function renderLogDetailModal(){
    if (!state.logDetailKey) return '';
    const row = findLogRowByKey(state.logDetailKey);
    if (!row) return '';
    const status = logStatusInfo(row);
    const raw = row.raw || {};
    const technicalRows = [
      ['Event-ID', row.technicalId || raw.uid || raw.eventUid || ''],
      ['Transaktion', row.transactionUid || raw.transactionUid || ''],
      ['Typ', row.eventType || ''],
      ['Bereich', row.moduleLabel || row.module || '']
    ].filter(([, value]) => String(value || '').trim());
    return `
      <div class="lgw-modal-backdrop" data-lg-log-modal-close>
        <div class="lgw-modal lgw-detail-modal" role="dialog" aria-modal="true" aria-label="Log-Details" data-lg-log-modal-box>
          <div class="lgw-modal-head">
            <div>
              <h3>Log-Details</h3>
              <p class="lg-muted">${esc(row.eventLabel || row.eventType || 'Ereignis')} · ${esc(fmtDate(row.at))}</p>
            </div>
            <button class="lgw-icon-btn" data-lg-log-modal-close type="button">×</button>
          </div>
          <div class="lg-log-detail-grid">
            <article class="lg-card"><span class="lg-card-label">Bereich</span><strong>${esc(row.moduleLabel || row.module || '-')}</strong></article>
            <article class="lg-card"><span class="lg-card-label">User</span><strong>${esc(row.user || '-')}</strong><small>${esc(row.login || '')}</small></article>
            <article class="lg-card"><span class="lg-card-label">Status</span><strong>${esc(status.label)}</strong></article>
            <article class="lg-card"><span class="lg-card-label">Punkte</span><strong>${Number(row.points || 0) ? esc(formatSigned(row.points)) : '-'}</strong></article>
          </div>
          <div class="lg-detail-section">
            <h4>Verarbeitung</h4>
            <div class="lg-config-summary-list">
              <div class="lg-config-summary-row"><span>Event</span><strong>${esc(row.eventLabel || row.eventType || '-')}</strong></div>
              <div class="lg-config-summary-row"><span>Ergebnis</span><strong>${esc(logRowShortDetail(row))}</strong></div>
              ${row.details ? `<div class="lg-config-summary-row"><span>Hinweis</span><strong>${esc(row.details)}</strong></div>` : ''}
            </div>
          </div>
          ${technicalRows.length ? `
            <div class="lg-detail-section">
              <h4>Technische Details</h4>
              <div class="lg-config-summary-list">
                ${technicalRows.map(([label, value]) => `<div class="lg-config-summary-row"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')}
              </div>
            </div>
          ` : ''}
          <details class="lg-detail-section">
            <summary>Rohdaten anzeigen</summary>
            <pre class="loyalty-json">${esc(JSON.stringify(raw, null, 2))}</pre>
          </details>
        </div>
      </div>
    `;
  }

  function logFilterOptions(rowsList, field, labelField){
    const map = new Map();
    rowsList.forEach(row => {
      const key = String(row[field] || '').toLowerCase();
      if (!key) return;
      map.set(key, row[labelField] || row[field]);
    });
    return Array.from(map.entries()).sort((a, b) => String(a[1]).localeCompare(String(b[1]), 'de'));
  }

  function filterCentralLogRows(list){
    const moduleFilter = String(state.logModule || 'all');
    const eventFilter = String(state.logEvent || 'all').toLowerCase();
    const statusFilter = String(state.logStatus || 'all').toLowerCase();
    const search = String(state.logSearch || '').trim().toLowerCase();
    return list.filter(row => {
      if (moduleFilter !== 'all' && row.module !== moduleFilter) return false;
      if (eventFilter !== 'all' && String(row.eventType || '').toLowerCase() !== eventFilter) return false;
      const statusKey = logStatusInfo(row).key;
      if (statusFilter !== 'all' && statusKey !== statusFilter) return false;
      if (search) {
        const hay = `${row.user || ''} ${row.login || ''} ${row.eventLabel || ''} ${row.details || ''} ${row.technicalId || ''}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }

  function renderLogs(){
    const allRows = buildCentralLogRows();
    const filteredRows = filterCentralLogRows(allRows).slice(0, 120);
    const moduleOptions = logFilterOptions(allRows, 'module', 'moduleLabel');
    const eventOptions = logFilterOptions(allRows, 'eventType', 'eventLabel');
    const statusOptions = [
      ['booked', 'Gebucht / verarbeitet'],
      ['tracked', 'Nur erfasst'],
      ['skipped', 'Übersprungen'],
      ['duplicate', 'Duplikat'],
      ['error', 'Fehler'],
      ['pending', 'Offen']
    ];
    return `
      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Logs</h3>
            <p class="lg-muted">Zentrale Ansicht für Loyalty-Ereignisse. Hier landen Core-Buchungen, GiftSubs/GiftBombs, Glücksrad-Drehungen und Gamble-Logs an einer Stelle.</p>
          </div>
          <button class="lg-btn lg-btn-secondary" data-lg-reload>Neu laden</button>
        </div>
        <div class="lg-filterbar lg-log-filterbar lg-log-filterbar-compact">
          <label>Bereich
            <select data-lg-log-module>
              <option value="all" ${state.logModule === 'all' ? 'selected' : ''}>Alle</option>
              ${moduleOptions.map(([value, label]) => `<option value="${esc(value)}" ${state.logModule === value ? 'selected' : ''}>${esc(label)}</option>`).join('')}
            </select>
          </label>
          <label>Event
            <select data-lg-log-event>
              <option value="all" ${state.logEvent === 'all' ? 'selected' : ''}>Alle</option>
              ${eventOptions.map(([value, label]) => `<option value="${esc(value)}" ${String(state.logEvent || '').toLowerCase() === value ? 'selected' : ''}>${esc(label)}</option>`).join('')}
            </select>
          </label>
          <label>Status
            <select data-lg-log-status>
              <option value="all" ${state.logStatus === 'all' ? 'selected' : ''}>Alle</option>
              ${statusOptions.map(([value, label]) => `<option value="${esc(value)}" ${state.logStatus === value ? 'selected' : ''}>${esc(label)}</option>`).join('')}
            </select>
          </label>
          <label>Suche
            <input data-lg-log-search value="${esc(state.logSearch || '')}" placeholder="User, Event, ID">
          </label>
        </div>
        <div class="lg-grid lg-grid-4">
          <article class="lg-card"><span class="lg-card-label">Geladen</span><strong>${fmtNumber(allRows.length)}</strong><small>alle Log-Einträge</small></article>
          <article class="lg-card"><span class="lg-card-label">Angezeigt</span><strong>${fmtNumber(filteredRows.length)}</strong><small>nach Filter</small></article>
          <article class="lg-card"><span class="lg-card-label">Core</span><strong>${fmtNumber(normalizeCoreLogRows().length)}</strong><small>Punkte/Support-Events</small></article>
          <article class="lg-card"><span class="lg-card-label">Games</span><strong>${fmtNumber(normalizeWheelLogRows().length + normalizeGambleLogRowsForLogs().length)}</strong><small>Glücksrad + Gamble</small></article>
        </div>
        <div class="lg-table-wrap">
          <table class="lg-table">
            <thead>
              <tr>
                <th>Zeit</th><th>Bereich</th><th>Event</th><th>User</th><th>Status</th><th>Punkte</th><th>Details</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRows.map(row => `
                <tr>
                  <td>${fmtDate(row.at)}</td>
                  <td>${esc(row.moduleLabel || row.module || '-')}</td>
                  <td><strong>${esc(row.eventLabel || row.eventType || '-')}</strong><br><small class="lg-muted">${esc(row.eventType || '')}</small></td>
                  <td>${esc(row.user || '-')}<br><small class="lg-muted">${esc(row.login || '')}</small></td>
                  <td>${logStatusBadge(row)}</td>
                  <td>${Number(row.points || 0) ? `<strong>${esc(formatSigned(row.points))}</strong>` : '<span class="lg-muted">-</span>'}</td>
                  <td class="lg-log-details-cell"><span>${esc(logRowShortDetail(row))}</span><button class="lg-btn lg-btn-small" type="button" data-lg-log-detail="${esc(logRowKey(row))}">Anzeigen</button></td>
                </tr>
              `).join('') || `<tr><td colspan="7" class="lg-muted">Keine Logs für diese Filter gefunden.</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="lg-info">Technische IDs stehen nicht mehr in der Tabelle. Öffne bei Bedarf die Details.</div>
      </div>
      ${renderLogDetailModal()}
    `;
  }

  function renderSessions(){
    return renderLogs();
  }


  async function refreshChatSetup(rerender = true){
    try {
      const [giveawayCommands, giveawayTexts, gameTexts] = await Promise.all([
        window.CGN.api(api.giveawayCommands).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.giveawayTexts).catch(err => ({ ok:false, error:err.message, keys:[], categories:[] })),
        window.CGN.api(api.gameTexts).catch(err => ({ ok:false, error:err.message, keys:[], categories:[] }))
      ]);
      state.giveawayCommands = giveawayCommands;
      state.giveawayTexts = giveawayTexts;
      state.gameTexts = gameTexts;
      if (rerender) render();
    } catch (err) {
      state.error = err.message || String(err);
      if (rerender) render();
    }
  }

  function cloneTextKeyForSource(item, source){
    const copy = { ...(item || {}) };
    copy.sourceTextApi = source.endpoint || '';
    copy.sourceTextModule = source.module || '';
    copy.sourceTextLabel = source.label || '';
    copy.variants = Array.isArray(item?.variants)
      ? item.variants.map(variant => ({
          ...variant,
          sourceTextApi: source.endpoint || '',
          sourceTextModule: source.module || '',
          sourceTextLabel: source.label || ''
        }))
      : [];
    copy.activeCount = Number(copy.activeCount ?? copy.variants.filter(variant => variant.enabled !== false && variant.active !== false).length);
    copy.totalCount = Number(copy.totalCount ?? copy.variants.length);
    return copy;
  }

  function centralTextPayload(){
    const sources = [
      { payload: state.giveawayTexts, endpoint: api.giveawayTexts, module: 'loyalty_giveaways', label: 'Giveaways / Glücksrad' },
      { payload: state.gameTexts, endpoint: api.gameTexts, module: 'loyalty_games', label: 'Games / Gamble' }
    ];
    const categories = [];
    const keys = [];
    for (const source of sources) {
      const payload = source.payload || {};
      if (Array.isArray(payload.categories)) {
        payload.categories.forEach(cat => categories.push({ ...cat, sourceTextApi: source.endpoint, sourceTextModule: source.module, sourceTextLabel: source.label }));
      }
      if (Array.isArray(payload.keys)) {
        payload.keys.forEach(item => keys.push(cloneTextKeyForSource(item, source)));
      }
    }
    return {
      ok: sources.some(source => source.payload && source.payload.ok !== false),
      categories,
      keys,
      count: keys.length,
      variantCount: keys.reduce((sum, item) => sum + Number(item.totalCount || (Array.isArray(item.variants) ? item.variants.length : 0) || 0), 0)
    };
  }

  function textItemEndpoint(item){
    return String(item?.sourceTextApi || '').trim();
  }

  async function saveChatTextVariant(form){
    const data = new FormData(form);
    const key = String(data.get('key') || '').trim();
    const category = String(data.get('category') || 'general').trim();
    const value = String(data.get('value') || '').trim();
    const item = findTextItem(String(data.get('itemUid') || state.textEditKey || '').trim());
    const endpoint = textItemEndpoint(item) || api.giveawayTexts;
    if (!key || !value || !endpoint) return;
    state.saving = true; render();
    try {
      await apiPost(endpoint, {
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

  function findTextVariant(item, variantId){
    const id = String(variantId || '').trim();
    if (!id || !item || !Array.isArray(item.variants)) return null;
    return item.variants.find(variant => String(variant.id || variant.variantId || '') === id) || null;
  }

  async function setChatTextVariantActive(itemUid, variantId, enabled){
    const item = findTextItem(itemUid);
    const variant = findTextVariant(item, variantId);
    if (!item || !variant) return;

    const text = String(variant.value || variant.text || '').trim();
    if (!text) return;

    state.saving = true;
    render();
    try {
      const endpoint = textItemEndpoint(item) || api.giveawayTexts;
      await apiPost(endpoint, {
        action: 'saveVariant',
        variant: {
          id: variant.id,
          key: item.key || variant.key,
          category: item.category || variant.category || 'general',
          value: text,
          enabled: !!enabled,
          weight: variant.weight || 1,
          sortOrder: variant.sortOrder || variant.sort_order || 0,
          description: variant.description || ''
        }
      });
      await refreshChatSetup(false);
      state.textEditKey = itemUid;
      setMessage(enabled ? 'Textvariante aktiviert.' : 'Textvariante deaktiviert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false;
      render();
    }
  }

  async function deleteChatTextVariant(itemUid, variantId){
    const item = findTextItem(itemUid);
    const variant = findTextVariant(item, variantId);
    if (!item || !variant) return;

    const preview = String(variant.value || variant.text || '').trim();
    const shortPreview = preview.length > 120 ? `${preview.slice(0, 120)}…` : preview;
    const confirmed = window.confirm(`Diese Textvariante wirklich löschen?\n\n${shortPreview || 'Leere Variante'}\n\nDer Text wird danach nicht mehr verwendet.`);
    if (!confirmed) return;

    state.saving = true;
    render();
    try {
      const endpoint = textItemEndpoint(item) || api.giveawayTexts;
      await apiPost(endpoint, { action: 'deleteVariant', id: variant.id });
      await refreshChatSetup(false);
      const stillExists = findTextItem(itemUid);
      state.textEditKey = stillExists ? itemUid : '';
      setMessage('Textvariante gelöscht.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false;
      render();
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

  function textSectionLabel(section){
    const labels = {
      all: 'Alle Textbereiche',
      core: 'Core',
      wheel: 'Glücksrad',
      giveaways: 'Giveaways',
      raffle: 'Raffle',
      gamble: 'Gamble',
      chat: 'Chat & Befehle',
      gifts: 'Geschenk-Abos / GiftBombs',
      notices: 'Hinweise / Fehlertexte'
    };
    return labels[String(section || 'all')] || 'Alle Textbereiche';
  }

  function classifyTextSection(item){
    const key = norm(item?.key || item?.name || '');
    const category = norm(item?.category || item?.module || '');
    const moduleName = norm(item?.sourceTextModule || item?.module || '');
    const source = `${moduleName} ${category} ${key}`;
    if (source.includes('gift') || source.includes('subgift') || source.includes('giftbomb') || source.includes('geschenk')) return 'gifts';
    if (source.includes('wheel') || source.includes('rad') || source.includes('spin') || source.includes('gluecksrad') || source.includes('glücksrad')) return 'wheel';
    if (source.includes('raffle') || source.includes('tombola')) return 'raffle';
    if (source.includes('giveaway')) return 'giveaways';
    if (source.includes('gamble')) return 'gamble';
    if (source.includes('command') || source.includes('chat') || source.includes('reply') || source.includes('antwort')) return 'chat';
    if (source.includes('error') || source.includes('fehler') || source.includes('hint') || source.includes('hinweis') || source.includes('notice')) return 'notices';
    if (source.includes('core') || source.includes('loyalty') || source.includes('points') || source.includes('punkte')) return 'core';
    return 'giveaways';
  }

  function textKeyPurpose(item){
    const raw = String(item?.label || item?.title || item?.description || item?.key || 'Text').replace(/[._-]+/g, ' ').trim();
    if (!raw) return 'Text';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  function textItemUid(item){
    return `${String(item?.sourceTextModule || 'texts')}::${String(item?.category || 'general')}::${String(item?.key || '')}`;
  }

  function findTextItem(uid){
    const keys = Array.isArray(centralTextPayload().keys) ? centralTextPayload().keys : [];
    return keys.find(item => textItemUid(item) === uid) || null;
  }

  function renderTextEditorModal(){
    const item = findTextItem(state.textEditKey);
    if (!item) return '';
    const variants = Array.isArray(item.variants) ? item.variants : [];
    const section = classifyTextSection(item);
    const activeCount = Number(item.activeCount || 0);
    const totalCount = Number(item.totalCount || variants.length || 0);
    const allowSave = !!textItemEndpoint(item);
    return `
      <div class="lgw-modal-backdrop" data-lg-text-modal-close>
        <div class="lgw-modal lgw-detail-modal lg-text-editor-modal" role="dialog" aria-modal="true" aria-label="Text bearbeiten" data-lg-text-modal-box>
          <div class="lgw-modal-head">
            <div>
              <p class="lg-eyebrow">Texte / ${esc(textSectionLabel(section))}</p>
              <h3>${esc(textKeyPurpose(item))}</h3>
              <p class="lg-muted">Bestehende Varianten bleiben erhalten. Neue Varianten werden über die vorhandene Text-API ergänzt.</p>
            </div>
            <button class="lgw-icon-btn" data-lg-text-modal-close type="button">×</button>
          </div>

          <div class="lg-text-editor-summary">
            <article><span>Bereich</span><strong>${esc(textSectionLabel(section))}</strong></article>
            <article><span>Status</span><strong>${fmtNumber(activeCount)} / ${fmtNumber(totalCount)} aktiv</strong></article>
            <article><span>Key</span><strong>${esc(item.key || '-')}</strong></article>
            <article><span>Kategorie</span><strong>${esc(item.category || 'general')}</strong></article>
          </div>

          <section class="lg-text-editor-section">
            <h4>Varianten</h4>
            <div class="lg-text-editor-variants">
              ${variants.map((v, idx) => {
                const enabled = v.enabled !== false && v.active !== false;
                const variantId = String(v.id || v.variantId || '');
                const canManage = allowSave && variantId;
                return `
                  <article class="lg-text-variant-card ${enabled ? 'is-active' : 'is-inactive'}">
                    <div class="lg-text-variant-head">
                      <strong>Variante ${fmtNumber(idx + 1)}</strong>
                      <span class="lg-badge ${enabled ? 'lg-badge-ok' : 'lg-badge-warn'}">${enabled ? 'aktiv' : 'inaktiv'}</span>
                    </div>
                    <p>${esc(v.value || v.text || '')}</p>
                    ${canManage ? `
                      <div class="lg-text-variant-actions">
                        <button class="lg-btn lg-btn-small lg-btn-secondary" type="button" data-lg-text-toggle-variant="${esc(variantId)}" data-lg-text-toggle-key="${esc(textItemUid(item))}" data-lg-text-toggle-enabled="${enabled ? '0' : '1'}" ${state.saving ? 'disabled' : ''}>${enabled ? 'Deaktivieren' : 'Aktivieren'}</button>
                        <button class="lg-btn lg-btn-small lg-btn-danger" type="button" data-lg-text-delete-variant="${esc(variantId)}" data-lg-text-delete-key="${esc(textItemUid(item))}" ${state.saving ? 'disabled' : ''}>Löschen</button>
                      </div>
                    ` : `<div class="lg-muted lg-text-variant-note">Diese Variante kommt noch ohne sichere Varianten-ID aus der API. Nach dem nächsten Speichern/Neu laden wird sie über die zentrale Text-API bearbeitbar.</div>`}
                  </article>
                `;
              }).join('') || '<p class="lg-muted">Noch keine Variante vorhanden.</p>'}
            </div>
          </section>

          <section class="lg-text-editor-section">
            <h4>Neue Variante hinzufügen</h4>
            ${allowSave ? `
              <form class="lg-text-editor-form" data-lg-save-chat-text>
                <input type="hidden" name="itemUid" value="${esc(textItemUid(item))}">
                <input type="hidden" name="key" value="${esc(item.key)}">
                <input type="hidden" name="category" value="${esc(item.category || 'general')}">
                <textarea name="value" rows="5" placeholder="Neue Textvariante im CGN-Stil eintragen..." autocomplete="off"></textarea>
                <div class="lg-text-editor-actions">
                  <button class="lg-btn" type="submit" ${state.saving ? 'disabled' : ''}>Neue Variante speichern</button>
                  <button class="lg-btn lg-btn-secondary" type="button" data-lg-text-modal-close>Schließen</button>
                </div>
              </form>
            ` : `
              <div class="lg-info">Dieser Bereich ist noch nicht an eine bearbeitbare Text-API angebunden.</div>
            `}
          </section>

          <section class="lg-text-editor-section">
            <h4>Hinweis</h4>
            <p class="lg-muted">Deaktivieren lässt Varianten erhalten, nimmt sie aber aus der aktiven Zufallsauswahl. Löschen fragt vorher nach und entfernt die Variante dauerhaft.</p>
          </section>
        </div>
      </div>
    `;
  }

  function renderTexts(){
    const textPayload = centralTextPayload();
    const categories = Array.isArray(textPayload.categories) ? textPayload.categories : [];
    const keys = Array.isArray(textPayload.keys) ? textPayload.keys : [];
    const selectedSection = state.textSection || 'all';
    const search = norm(state.textSearch || '');
    const sections = [
      ['all', 'Alle Textbereiche'],
      ['core', 'Core'],
      ['wheel', 'Glücksrad'],
      ['giveaways', 'Giveaways'],
      ['raffle', 'Raffle'],
      ['gamble', 'Gamble'],
      ['chat', 'Chat & Befehle'],
      ['gifts', 'Geschenk-Abos / GiftBombs'],
      ['notices', 'Hinweise / Fehlertexte']
    ];
    const preparedSections = ['core', 'gifts', 'notices'];
    const filteredKeys = keys.filter(item => {
      const section = classifyTextSection(item);
      if (selectedSection !== 'all' && section !== selectedSection) return false;
      if (!search) return true;
      const variantText = (item.variants || []).map(v => v.value || v.text || '').join(' ');
      return norm(`${item.key || ''} ${item.category || ''} ${variantText}`).includes(search);
    });
    const selectedHasRows = filteredKeys.length > 0;
    const selectedIsPreparedOnly = !selectedHasRows && preparedSections.includes(selectedSection);
    const variantTotal = filteredKeys.reduce((sum, item) => sum + Number(item.totalCount || (Array.isArray(item.variants) ? item.variants.length : 0) || 0), 0);
    const activeTotal = filteredKeys.reduce((sum, item) => sum + Number(item.activeCount || 0), 0);
    return `
      <div class="lg-panel lg-texts-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Loyalty-Texte</h3>
            <p class="lg-muted">Zentrale Textpflege für Loyalty. Wähle ein Modul aus, prüfe Varianten und ergänze neue Chat-/Hinweis-Texte ohne technische Suche.</p>
          </div>
          <button class="lg-btn lg-btn-secondary" type="button" data-lg-text-reload>Neu laden</button>
        </div>

        <div class="lg-text-filterbar">
          <label>Bereich
            <select data-lg-text-section>
              ${sections.map(([id, label]) => `<option value="${esc(id)}" ${selectedSection === id ? 'selected' : ''}>${esc(label)}</option>`).join('')}
            </select>
          </label>
          <label>Suche
            <input data-lg-text-search value="${esc(state.textSearch || '')}" placeholder="Text, Zweck, Key..." autocomplete="off">
          </label>
        </div>

        <div class="lg-grid lg-grid-4 lg-text-stats">
          <article class="lg-card"><span class="lg-card-label">Bereich</span><strong>${esc(textSectionLabel(selectedSection))}</strong></article>
          <article class="lg-card"><span class="lg-card-label">Text-Zwecke</span><strong>${fmtNumber(filteredKeys.length)}</strong></article>
          <article class="lg-card"><span class="lg-card-label">Varianten</span><strong>${fmtNumber(variantTotal)}</strong></article>
          <article class="lg-card"><span class="lg-card-label">Aktiv</span><strong>${fmtNumber(activeTotal)}</strong></article>
        </div>
      </div>

      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Textvarianten</h3>
            <p class="lg-muted">Aktueller Bereich: ${esc(textSectionLabel(selectedSection))}. Technische Keys bleiben sichtbar, aber nicht im Vordergrund.</p>
          </div>
        </div>
        ${selectedIsPreparedOnly ? `<div class="lg-config-note">Für diesen Bereich sind noch keine Text-Keys geladen. Der Bereich ist vorbereitet und wird mit der zentralen Text-API gefüllt, sobald die Modultexte angebunden sind.</div>` : ''}
        <div class="lg-table-wrap">
          <table class="lg-table lg-text-table lg-text-table-compact">
            <thead>
              <tr><th>Zweck</th><th>Bereich</th><th>Status</th><th>Vorschau</th><th>Aktion</th></tr>
            </thead>
            <tbody>
              ${filteredKeys.map(item => {
                const section = classifyTextSection(item);
                const variants = Array.isArray(item.variants) ? item.variants : [];
                const activeCount = Number(item.activeCount || 0);
                const totalCount = Number(item.totalCount || variants.length || 0);
                const preview = variants.find(v => v.enabled !== false && v.active !== false) || variants[0] || null;
                return `
                <tr>
                  <td><strong>${esc(textKeyPurpose(item))}</strong><small class="lg-muted">Key: ${esc(item.key || '-')}</small></td>
                  <td>${esc(textSectionLabel(section))}<small class="lg-muted">${esc(item.category || 'general')}</small></td>
                  <td><span class="lg-badge ${activeCount > 0 ? 'lg-badge-ok' : 'lg-badge-warn'}">${fmtNumber(activeCount)} / ${fmtNumber(totalCount)} aktiv</span></td>
                  <td><span class="lg-text-preview">${preview ? esc(preview.value || preview.text || '') : 'Noch keine Variante.'}</span></td>
                  <td><button class="lg-btn lg-btn-small" type="button" data-lg-text-edit="${esc(textItemUid(item))}">Bearbeiten</button></td>
                </tr>`;
              }).join('') || `<tr><td colspan="5" class="lg-muted">Keine Textkeys für diesen Bereich gefunden.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
      ${renderTextEditorModal()}
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

  function configInfoNote(text){
    return `<span class="lg-config-help" title="${esc(text)}">?</span>`;
  }

  function configDisplayValue(value, fallback = '-'){
    if (value === true) return 'Ja';
    if (value === false) return 'Nein';
    if (value === null || value === undefined || value === '') return fallback;
    return String(value);
  }

  function boolSettingValue(value, fallback = false){
    if (value === true || value === false) return value;
    if (value === 1 || value === 0) return Boolean(value);
    const raw = String(value ?? '').trim().toLowerCase();
    if (['1', 'true', 'yes', 'ja', 'on', 'aktiv'].includes(raw)) return true;
    if (['0', 'false', 'no', 'nein', 'off', 'inaktiv'].includes(raw)) return false;
    return Boolean(fallback);
  }

  function numberSettingValue(value, fallback = 0){
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function pathValue(source, path, fallback = undefined){
    if (!source || !path) return fallback;
    const parts = String(path).split('.').filter(Boolean);
    let current = source;
    for (const part of parts) {
      if (current && Object.prototype.hasOwnProperty.call(current, part)) {
        current = current[part];
      } else {
        return fallback;
      }
    }
    return current === undefined ? fallback : current;
  }

  function coreConfigValue(path, fallback = undefined){
    return pathValue(state.coreSettings?.config, path, fallback);
  }

  function coreSettingMap(){
    const settings = Array.isArray(state.coreStatus?.settings) ? state.coreStatus.settings : [];
    return new Map(settings.map(row => [row.key, row.value ?? row.rawValue]));
  }

  function renderReadonlySelect(label, value, options, help){
    const safeOptions = Array.isArray(options) && options.length ? options : [[String(value ?? ''), configDisplayValue(value)]];
    return `<label class="lg-config-field"><span>${esc(label)} ${help ? configInfoNote(help) : ''}</span><select disabled>
      ${safeOptions.map(opt => {
        const id = Array.isArray(opt) ? opt[0] : opt;
        const text = Array.isArray(opt) ? opt[1] : opt;
        return `<option value="${esc(id)}" ${String(id) === String(value) ? 'selected' : ''}>${esc(text)}</option>`;
      }).join('')}
    </select></label>`;
  }

  function renderReadonlyNumber(label, value, help, suffix = ''){
    return `<label class="lg-config-field"><span>${esc(label)} ${help ? configInfoNote(help) : ''}</span><div class="lg-config-readonly-value"><strong>${esc(configDisplayValue(value))}</strong>${suffix ? `<small>${esc(suffix)}</small>` : ''}</div></label>`;
  }

  function renderReadonlyDisplay(label, value, help, suffix = ''){
    return renderReadonlyNumber(label, value, help, suffix);
  }

  function renderReadonlyToggle(label, value, help){
    return renderReadonlySelect(label, value ? 'on' : 'off', [['on', 'Aktiv'], ['off', 'Inaktiv']], help);
  }
  function renderEditableSelect(label, name, value, options, help){
    const safeOptions = Array.isArray(options) && options.length ? options : [[String(value ?? ''), configDisplayValue(value)]];
    return `<label class="lg-config-field"><span>${esc(label)} ${help ? configInfoNote(help) : ''}</span><select name="${esc(name)}">
      ${safeOptions.map(opt => {
        const id = Array.isArray(opt) ? opt[0] : opt;
        const text = Array.isArray(opt) ? opt[1] : opt;
        return `<option value="${esc(id)}" ${String(id) === String(value) ? 'selected' : ''}>${esc(text)}</option>`;
      }).join('')}
    </select></label>`;
  }

  function renderEditableNumber(label, name, value, help, { min = 0, step = 1 } = {}){
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
    return `<label class="lg-config-field"><span>${esc(label)} ${help ? configInfoNote(help) : ''}</span><input name="${esc(name)}" type="number" min="${esc(min)}" step="${esc(step)}" value="${esc(safeValue)}"></label>`;
  }

  function renderEditableText(label, name, value, help){
    return `<label class="lg-config-field"><span>${esc(label)} ${help ? configInfoNote(help) : ''}</span><input name="${esc(name)}" type="text" value="${esc(value ?? '')}"></label>`;
  }

  function renderEditableToggle(label, name, value, help){
    return renderEditableSelect(label, name, boolSettingValue(value) ? 'true' : 'false', [['true', 'Aktiv'], ['false', 'Inaktiv']], help);
  }


  function renderConfigSummaryRows(rows){
    return `<div class="lg-config-summary-list">
      ${rows.map(row => `<div class="lg-config-summary-row"><span>${esc(row[0])}</span><strong>${esc(configDisplayValue(row[1]))}</strong></div>`).join('')}
    </div>`;
  }

  function renderConfigPanelShell(title, description, body, { badgeText = 'vorbereitet', badgeType = 'warn' } = {}){
    return `<div class="lg-panel lg-config-detail-panel">
      <div class="lg-panel-head">
        <div>
          <h3>${esc(title)}</h3>
          <p class="lg-muted">${esc(description)}</p>
        </div>
        <span class="lg-badge lg-badge-${esc(badgeType)}">${esc(badgeText)}</span>
      </div>
      ${body}
    </div>`;
  }

  function renderCoreConfigPanel(){
    const core = state.coreStatus || {};
    const settingMap = coreSettingMap();
    const enabled = boolSettingValue(coreConfigValue('enabled', settingMap.get('enabled')), true);
    const currencyName = coreConfigValue('currency.name', settingMap.get('currency.name')) || 'Kekskrümel';
    const eventBonusesEnabled = boolSettingValue(coreConfigValue('features.eventBonusesEnabled', settingMap.get('features.eventBonusesEnabled')), false);
    const mainCore = renderConfigPanelShell('Core', 'Alles, was direkt Punkte erzeugt oder die automatische Vergabe steuert, liegt hier gebündelt.', `
      <form class="lg-form" data-lg-core-basic-settings>
        <div class="lg-config-form-grid">
          ${renderEditableToggle('Loyalty aktiv', 'enabled', enabled, 'Schaltet das Punktesystem grundsätzlich ein oder aus.')}
          ${renderEditableText('Punkte-Name', 'currencyName', currencyName, 'So heißen die Punkte im Stream, zum Beispiel Kekskrümel.')}
          ${renderEditableToggle('Support-Events geben Punkte', 'eventBonusesEnabled', eventBonusesEnabled, 'Wenn aktiv, können Follow, Subs, Bits, Raids und Geschenk-Abos Punkte auslösen.')}
        </div>
        ${renderConfigSummaryRows([
          ['Status', core.ok === false ? 'prüfen' : 'geladen'],
          ['Version', core.version || core.moduleVersion || '-'],
          ['Bearbeitung', 'speicherbar']
        ])}
        <div class="lg-config-note">Diese Grundregeln wirken direkt auf den Punkte-Core. Änderungen werden erst nach Bestätigung gespeichert.</div>
        <div class="lg-actions lg-config-actions">
          <button class="lg-btn" type="submit" ${state.saving ? 'disabled' : ''}>Core-Grundregeln speichern</button>
        </div>
      </form>
      ${state.coreSettingsResult ? renderConfigResultBox({ title: 'Letztes Core-Ergebnis', result: state.coreSettingsResult, clearAttr: 'data-lg-core-clear-result' }) : ''}
    `, { badgeText: 'schreibbar', badgeType: 'ok' });

    return `
      ${mainCore}
      <div class="lg-config-core-stack">
        ${renderRunnerConfigPanel()}
        ${renderGiftConfigPanel()}
        ${renderRaidConfigPanel()}
      </div>
    `;
  }

  function renderRunnerConfigPanel(){
    const core = state.coreStatus || {};
    const settingMap = coreSettingMap();
    const runner = core.runner || core.diagnostics?.pointsRunner || core.pointsRunner || {};
    const watchEnabled = boolSettingValue(coreConfigValue('watch.enabled', settingMap.get('watch.enabled')), true);
    const watchEarningEnabled = boolSettingValue(coreConfigValue('features.watchEarningEnabled', settingMap.get('features.watchEarningEnabled')), true);
    const autoPointsEnabled = watchEnabled && watchEarningEnabled;
    const watchAmount = numberSettingValue(coreConfigValue('watch.amount', settingMap.get('watch.amount')), 2);
    const intervalMinutes = numberSettingValue(coreConfigValue('watch.intervalMinutes', settingMap.get('watch.intervalMinutes')), 10);
    const subscriberMultiplier = numberSettingValue(coreConfigValue('watch.subscriberMultiplier', settingMap.get('watch.subscriberMultiplier')), 3);
    const subscriberTierAmounts = coreConfigValue('watch.subscriberTierAmounts', {});
    const tier1000 = numberSettingValue(pathValue(subscriberTierAmounts, '1000', undefined), Math.max(0, Math.floor(watchAmount * subscriberMultiplier)));
    const tier2000 = numberSettingValue(pathValue(subscriberTierAmounts, '2000', undefined), tier1000);
    const tier3000 = numberSettingValue(pathValue(subscriberTierAmounts, '3000', undefined), tier1000);
    const runOnlyWhenLive = boolSettingValue(coreConfigValue('autoRunner.runOnlyWhenLive', settingMap.get('autoRunner.runOnlyWhenLive')), true);
    const activeMinutes = numberSettingValue(coreConfigValue('autoRunner.activeMinutes', settingMap.get('autoRunner.activeMinutes')), 30);
    const maxUsersPerRun = numberSettingValue(coreConfigValue('autoRunner.maxUsersPerRun', settingMap.get('autoRunner.maxUsersPerRun')), 250);
    const includeJoinedOnly = boolSettingValue(coreConfigValue('autoRunner.includeJoinedOnly', settingMap.get('autoRunner.includeJoinedOnly')), true);
    return renderConfigPanelShell('Core · Automatische Punkte', 'Regeln für Punkte, die Zuschauer automatisch durch Anwesenheit oder Aktivität bekommen.', `
      <form class="lg-form" data-lg-core-auto-points-settings>
        <h4 class="lg-config-subtitle">Zuschauerpunkte</h4>
        <div class="lg-config-form-grid">
          ${renderEditableToggle('Automatische Punkte vergeben', 'autoPointsEnabled', autoPointsEnabled, 'Wenn aktiv, kann das System regelmäßig Anwesenheitspunkte vergeben.')}
          ${renderEditableNumber('Punkte pro Intervall', 'watchAmount', watchAmount, 'So viele Punkte bekommt ein normaler Zuschauer pro gültigem Intervall.', { min: 0, step: 1 })}
          ${renderEditableNumber('Intervall in Minuten', 'intervalMinutes', intervalMinutes, 'Nach wie vielen Minuten erneut Punkte vergeben werden können.', { min: 1, step: 1 })}
          ${renderEditableToggle('Nur wenn Stream live ist', 'runOnlyWhenLive', runOnlyWhenLive, 'Empfohlen: aktiv. Dann zählt die automatische Vergabe nur während eines Live-Streams.')}
          ${renderEditableNumber('Aktivitätsfenster', 'activeMinutes', activeMinutes, 'Zuschauer gelten als aktiv, wenn sie innerhalb dieser Minuten gesehen wurden.', { min: 1, step: 1 })}
          ${renderEditableNumber('Max. User pro Lauf', 'maxUsersPerRun', maxUsersPerRun, 'Schutzlimit, damit ein Lauf nicht zu viele User auf einmal verarbeitet.', { min: 1, step: 1 })}
          ${renderEditableToggle('JOIN-only User mitzählen', 'includeJoinedOnly', includeJoinedOnly, 'Wenn aktiv, können auch User aus der Presence-Erkennung berücksichtigt werden, selbst wenn sie gerade nichts geschrieben haben.')}
        </div>
        <h4 class="lg-config-subtitle">Abo-Bonus bei automatischen Punkten</h4>
        <p class="lg-muted">Subs können pro Intervall andere Werte bekommen als normale Zuschauer. Diese Werte werden vom Punkte-Runner verwendet.</p>
        <div class="lg-config-form-grid">
          ${renderEditableNumber('Sub-Fallback-Multiplikator', 'subscriberMultiplier', subscriberMultiplier, 'Wird nur genutzt, wenn für ein Sub-Tier kein eigener Wert gesetzt ist. Beispiel: 2 Punkte × 3 = 6 Punkte.', { min: 1, step: 1 })}
          ${renderEditableNumber('Tier 1 Sub pro Intervall', 'subTier1000', tier1000, 'Punkte pro Intervall für Tier-1-Subs.', { min: 0, step: 1 })}
          ${renderEditableNumber('Tier 2 Sub pro Intervall', 'subTier2000', tier2000, 'Punkte pro Intervall für Tier-2-Subs.', { min: 0, step: 1 })}
          ${renderEditableNumber('Tier 3 Sub pro Intervall', 'subTier3000', tier3000, 'Punkte pro Intervall für Tier-3-Subs.', { min: 0, step: 1 })}
        </div>
        ${renderConfigSummaryRows([
          ['Runner aktuell', runner.enabled || runner.timerActive ? 'aktiv' : 'inaktiv'],
          ['Normale Zuschauer', `${watchAmount} pro Intervall`],
          ['Tier 1 / Tier 2 / Tier 3', `${tier1000} / ${tier2000} / ${tier3000} pro Intervall`],
          ['Letzte Prüfung', runner.lastRunAt || runner.updatedAt || '-'],
          ['Letzter Fehler', runner.lastError || '-']
        ])}
        <div class="lg-config-note">Diese Werte steuern die automatische Punktevergabe. Für Start/Stop des Runners bleibt die Core-Steuerung zuständig.</div>
        <div class="lg-actions lg-config-actions">
          <button class="lg-btn" type="submit" ${state.saving ? 'disabled' : ''}>Automatische Punkte speichern</button>
        </div>
      </form>
      ${state.coreSettingsResult ? renderConfigResultBox({ title: 'Letztes Core-Ergebnis', result: state.coreSettingsResult, clearAttr: 'data-lg-core-clear-result' }) : ''}
    `, { badgeText: 'schreibbar', badgeType: 'ok' });
  }

  function giftReceiverModeLabel(mode){
    const labels = {
      disabled: 'Nicht erfassen',
      track_only: 'Nur im Verlauf anzeigen, keine Punkte',
      small_bonus: 'Kleiner Dankeschön-Bonus',
      half_bonus: 'Hälfte vom Geschenk-Abo-Wert',
      custom: 'Eigene Punktewerte'
    };
    return labels[String(mode || 'track_only')] || 'Nur im Verlauf anzeigen, keine Punkte';
  }

  function renderGiftConfigPanel(){
    const gift = state.coreStatus?.diagnostics?.bonusMapping?.giftSub || {};
    const receiver = state.coreStatus?.diagnostics?.bonusMapping?.bonusValues?.rules?.giftSubReceiver?.config || {};
    const mode = coreConfigValue('bonuses.giftSubReceiver.mode', gift.receiverMode || receiver.mode || 'track_only');
    const modeLabel = mode === gift.receiverMode ? (gift.receiverModeLabel || receiver.modeLabel || 'Nur im Verlauf anzeigen, keine Punkte') : giftReceiverModeLabel(mode);
    return renderConfigPanelShell('Core · Geschenk-Abos / GiftBombs', 'Hier stellst du ein, wie Schenker und Empfänger von Geschenk-Abos behandelt werden.', `
      <form class="lg-form" data-lg-core-gift-settings>
        <div class="lg-config-form-grid">
          ${renderReadonlyToggle('Schenker belohnen', gift.giverBonusEnabled !== false, 'Der Zuschauer, der ein Geschenk-Abo oder eine GiftBomb auslöst, bekommt Punkte.')}
          ${renderEditableSelect('Empfänger von Geschenk-Abos', 'receiverMode', mode, [
            ['disabled', 'Nicht erfassen'],
            ['track_only', 'Nur im Verlauf anzeigen, keine Punkte'],
            ['small_bonus', 'Kleiner Dankeschön-Bonus'],
            ['half_bonus', 'Hälfte vom Geschenk-Abo-Wert'],
            ['custom', 'Eigene Punktewerte']
          ], 'Empfänger haben selbst nichts aktiv ausgegeben. Der faire Standard ist: nur im Verlauf anzeigen, keine Punkte.')}
          ${renderReadonlyToggle('Empfänger bekommen Punkte', Boolean(gift.receiverAwardsPoints || receiver.awardsPoints), 'Zeigt, ob Empfänger aktuell wirklich Punkte bekommen.')}
        </div>
        ${renderConfigSummaryRows([
          ['Aktueller Empfänger-Modus', modeLabel],
          ['Empfänger-Erfassung', gift.receiverTrackingEnabled ? 'aktiv' : 'aus'],
          ['Empfänger-Punkte', gift.receiverAwardsPoints ? 'ja' : 'nein']
        ])}
        <div class="lg-config-note">GiftBomb-Empfänger werden nur erfasst, wenn Twitch echte Empfänger liefert. Es werden keine Empfänger geraten.</div>
        <div class="lg-actions lg-config-actions">
          <button class="lg-btn" type="submit" ${state.saving ? 'disabled' : ''}>Empfänger-Regel speichern</button>
        </div>
      </form>
      ${state.coreSettingsResult ? renderConfigResultBox({ title: 'Letztes Core-Ergebnis', result: state.coreSettingsResult, clearAttr: 'data-lg-core-clear-result' }) : ''}
    `, { badgeText: 'schreibbar', badgeType: 'ok' });
  }

  function renderRaidConfigPanel(){
    const raid = state.coreStatus?.diagnostics?.bonusMapping?.bonusValues?.rules?.raid || {};
    const statusCfg = raid.config || {};
    const cfg = { ...statusCfg, ...(coreConfigValue('bonuses.raid', {}) || {}) };
    const mode = cfg.mode || (raid.viewerCountAffectsPoints ? 'base_plus_viewers' : 'fixed');
    const amount = cfg.amount ?? 50;
    const baseAmount = cfg.baseAmount ?? cfg.amount ?? 25;
    const amountPerViewer = cfg.amountPerViewer ?? 2;
    const maxAmount = cfg.maxAmount ?? 250;
    return renderConfigPanelShell('Core · Raids', 'Punkte für Raids sollen fair zur Zuschauerzahl passen, aber durch ein Maximum begrenzt bleiben.', `
      <form class="lg-form" data-lg-core-raid-settings>
        <div class="lg-config-form-grid">
          ${renderEditableSelect('Raid-Berechnung', 'raidMode', mode, [['fixed', 'Fixer Betrag'], ['base_plus_viewers', 'Nach Zuschauerzahl']], 'Fixer Betrag gibt immer gleich viele Punkte. Nach Zuschauerzahl berücksichtigt die Raid-Größe.')}
          ${renderEditableNumber('Fixer Betrag', 'raidAmount', amount, 'Wird genutzt, wenn die Raid-Berechnung auf fixer Betrag steht.', { min: 0, step: 1 })}
          ${renderEditableNumber('Basispunkte', 'raidBaseAmount', baseAmount, 'Grundwert, den jeder Raid bekommt, wenn nach Zuschauerzahl gerechnet wird.', { min: 0, step: 1 })}
          ${renderEditableNumber('Punkte pro Zuschauer', 'raidAmountPerViewer', amountPerViewer, 'Zusätzliche Punkte pro mitgebrachtem Zuschauer.', { min: 0, step: 1 })}
          ${renderEditableNumber('Maximalpunkte', 'raidMaxAmount', maxAmount, 'Deckel, damit sehr große Raids das Punktesystem nicht sprengen. 0 bedeutet: kein Deckel.', { min: 0, step: 1 })}
        </div>
        ${renderConfigSummaryRows([
          ['Aktuelle Berechnung', raid.viewerCountAffectsPoints ? 'nach Zuschauerzahl' : 'fix'],
          ['Formel', raid.formula || '-'],
          ['Beispiele', Array.isArray(raid.samples) ? `${raid.samples.length} geladen` : '-']
        ])}
        <div class="lg-config-note">Empfehlung: „Nach Zuschauerzahl“ mit Basispunkten, Punkten pro Zuschauer und Maximalpunkten. So bleiben kleine Raids wertvoll und große Raids fair begrenzt.</div>
        <div class="lg-actions lg-config-actions">
          <button class="lg-btn" type="submit" ${state.saving ? 'disabled' : ''}>Raid-Regel speichern</button>
        </div>
      </form>
      ${state.coreSettingsResult ? renderConfigResultBox({ title: 'Letztes Core-Ergebnis', result: state.coreSettingsResult, clearAttr: 'data-lg-core-clear-result' }) : ''}
    `, { badgeText: 'schreibbar', badgeType: 'ok' });
  }

  function renderWheelConfigPanel(){
    const wheel = state.wheelConfig || {};
    const status = state.wheelStatus || {};
    return renderConfigPanelShell('Glücksrad', 'Globale Regeln für das Glücksrad. Preset-Felder und Preise bleiben im Presets-Tab.', `
      <div class="lg-config-form-grid">
        ${renderReadonlyToggle('Glücksrad aktiv', status.enabled !== false, 'Ob das Glücksrad grundsätzlich verwendet werden kann.')}
        ${renderReadonlySelect('Gewinn nach Dreh', wheel.removeAfterWin === false ? 'keep' : 'remove', [['remove', 'Gewinnfeld entfernen'], ['keep', 'Gewinnfeld behalten']], 'Legt fest, ob ein Gewinnfeld nach dem Treffer aus dem Rad genommen wird.')}
        ${renderReadonlyNumber('Letzte Session', status.lastSessionAt || status.updatedAt || '-', 'Letzte bekannte Aktivität des Glücksrads.')}
      </div>
      <div class="lg-config-note">Felder und Preise bleiben im Tab „Presets“, damit diese Seite übersichtlich bleibt.</div>
    `);
  }

  function renderPresetsConfigPanel(){
    const presetRows = rows(state.presets);
    return renderConfigPanelShell('Presets', 'Vorgaben für Glücksräder und Gewinnfelder. Die eigentlichen Preise bleiben im Presets-Tab bearbeitbar.', `
      <div class="lg-config-form-grid">
        ${renderReadonlyNumber('Geladene Presets', presetRows.length, 'Anzahl der aktuell bekannten Presets.')}
        ${renderReadonlySelect('Preset-Bearbeitung', 'presets_tab', [['presets_tab', 'Im Presets-Tab']], 'Presets enthalten Preise und Felder. Deshalb werden sie bewusst nicht in der allgemeinen Config versteckt.')}
      </div>
      <button class="lg-btn" type="button" data-lg-jump-tab="presets">Presets öffnen</button>
    `);
  }

  function renderGiveawaysConfigPanel(){
    const giveawayRows = rows(state.giveaways);
    return renderConfigPanelShell('Giveaways', 'Giveaway-Regeln liegen im eigenen Giveaway-Control. Hier bleibt nur die zentrale Einordnung sichtbar.', `
      <div class="lg-config-form-grid">
        ${renderReadonlyNumber('Geladene Giveaways', giveawayRows.length, 'Anzahl der aktuell geladenen Giveaways.')}
        ${renderReadonlySelect('Bearbeitung', 'giveaway_control', [['giveaway_control', 'Im Giveaway-Control']], 'Giveaways haben eigene Abläufe und werden dort verwaltet.')}
      </div>
      <button class="lg-btn" type="button" data-lg-open-module="loyalty_giveaways">Giveaway-Control öffnen</button>
    `);
  }

  function renderChatConfigPanel(){
    const commandRows = rows(state.giveawayCommands);
    return renderConfigPanelShell('Chat & Befehle', 'Hier geht es um Command-Regeln. Texte werden im eigenen Texte-Tab gepflegt.', `
      <div class="lg-config-form-grid">
        ${renderReadonlyNumber('Bekannte Commands', commandRows.length, 'Anzahl der geladenen Loyalty-Commands.')}
        ${renderReadonlySelect('Texte bearbeiten', 'texts_tab', [['texts_tab', 'Im Texte-Tab']], 'Chat-Antworten und Varianten gehören nicht in die Config.')}
      </div>
      <div class="lg-actions"><button class="lg-btn" type="button" data-lg-jump-tab="chat">Commands öffnen</button><button class="lg-btn lg-btn-secondary" type="button" data-lg-jump-tab="texts">Texte öffnen</button></div>
    `);
  }

  function renderConfigPlaceholder(sectionLabel){
    return renderConfigPanelShell(sectionLabel, 'Dieser Bereich ist in der zentralen Config eingeplant, aber noch nicht schreibbar angebunden.', `
      <div class="lg-mini-list">
        <div class="lg-mini-row"><span><strong>Geplanter Standard</strong><br><small class="lg-muted">Dropdowns, kurze Erklärungen und Speichern mit Bestätigung.</small></span><span class="lg-badge lg-badge-warn">geplant</span></div>
      </div>
    `);
  }

  function renderGambleConfigPanel(){
    const config = state.gambleConfig || {};
    const engineOn = Boolean(getGambleEngine(config, 'enabled', false));
    const commandOn = Boolean(getGambleCommand(config, 'enabled', false));

    return `
      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Gamble</h3>
            <p class="lg-muted">Zentrale Config-Ansicht. Command-Schalter und Command-Cooldown liegen im zentralen Command-System; Gamble selbst rechnet Gewinn oder Verlust.</p>
          </div>
          <div class="lg-actions">
            <button class="lg-btn lg-btn-secondary" data-lg-gamble-reload>Neu laden</button>
          </div>
        </div>
        <form class="lg-form lg-gamble-form" data-lg-gamble-form>
          <div class="lg-check-row">
            <label class="lg-check"><input name="enabled" type="checkbox" ${engineOn ? 'checked' : ''}> Gamble aktiv ${configInfoNote('Schaltet das Gamble-Spiel grundsätzlich ein oder aus.')}</label>
            <label class="lg-check"><input name="commandEnabled" type="checkbox" ${commandOn ? 'checked' : ''}> Command aktiv ${configInfoNote('Legt fest, ob der Chatbefehl genutzt werden darf.')}</label>
            <label class="lg-check"><input name="sendResultToChat" type="checkbox" ${getGambleCommand(config, 'sendResultToChat', true) ? 'checked' : ''}> Chat-Antwort ${configInfoNote('Wenn aktiv, antwortet der Bot nach einem Gamble im Chat.')}</label>
          </div>
          <div class="lg-form-row">
            <label>Gewinnchance % ${configInfoNote('Wie wahrscheinlich ein Gewinn ist. 47 bedeutet 47 Prozent Gewinnchance.')}<input name="winChancePercent" type="number" min="0" max="100" step="0.01" value="${esc(getGambleEngine(config, 'winChancePercent', 47))}"></label>
            <label>Command-Cooldown pro User (Sek.) ${configInfoNote('Wie lange ein Zuschauer warten muss, bevor er erneut gambeln darf.')}<input name="commandCooldownUserSeconds" type="number" min="0" step="1" value="${esc(msToSecondsInput(getGambleCommand(config, 'cooldownUserMs', 60000)))}"></label>
          </div>
          <div class="lg-form-row">
            <label>Mindesteinsatz ${configInfoNote('Kleinster erlaubter Einsatz pro Gamble.')}<input name="minBet" type="number" min="0" step="1" value="${esc(getGambleEngine(config, 'minBet', 1))}"></label>
            <label>Maximaleinsatz ${configInfoNote('0 bedeutet: kein festes Maximum durch diese Einstellung.')}<input name="maxBet" type="number" min="0" step="1" value="${esc(getGambleEngine(config, 'maxBet', 0))}"></label>
          </div>
          <div class="lg-check-row">
            <label class="lg-check"><input name="allowPercentBets" type="checkbox" ${getGambleEngine(config, 'allowPercentBets', true) ? 'checked' : ''}> Prozent-Einsätze erlauben ${configInfoNote('Erlaubt Einsätze wie 50 Prozent der eigenen Punkte.')}</label>
            <label class="lg-check"><input name="allowKeywordBets" type="checkbox" ${getGambleEngine(config, 'allowKeywordBets', true) ? 'checked' : ''}> Keyword-Einsätze erlauben ${configInfoNote('Erlaubt Begriffe wie all oder half, sofern das Command-System sie unterstützt.')}</label>
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

  function normalizeConfigSection(section){
    if (section === 'runner' || section === 'gift_subs' || section === 'raids') return 'core';
    return section || 'core';
  }

  function renderConfig(){
    const section = normalizeConfigSection(state.configSection || 'core');
    if (state.configSection !== section) state.configSection = section;
    const sections = [
      ['core', 'Core'],
      ['wheel', 'Glücksrad'],
      ['presets', 'Presets'],
      ['giveaways', 'Giveaways'],
      ['raffle', 'Raffle'],
      ['gamble', 'Gamble'],
      ['chat', 'Chat & Befehle']
    ];
    const current = sections.find(([id]) => id === section) || sections[0];
    const panels = {
      core: renderCoreConfigPanel,
      wheel: renderWheelConfigPanel,
      presets: renderPresetsConfigPanel,
      giveaways: renderGiveawaysConfigPanel,
      raffle: renderRaffleConfigCard,
      gamble: renderGambleConfigPanel,
      chat: renderChatConfigPanel
    };
    const renderPanel = panels[current[0]] || (() => renderConfigPlaceholder(current[1] || 'Config-Bereich'));
    return `
      <div class="lg-panel lg-config-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Loyalty-Einstellungen</h3>
            <p class="lg-muted">Eine zentrale Seite für alle Loyalty-Einstellungen. Core enthält Grundregeln, automatische Punkte, Support-Events, Geschenk-Abos und Raids. Texte und Logs haben eigene Tabs.</p>
          </div>
          <div class="lg-actions">
            <label class="lg-config-select-label">Bereich auswählen
              <select data-lg-config-section>
                ${sections.map(([id, label]) => `<option value="${esc(id)}" ${id === current[0] ? 'selected' : ''}>${esc(label)}</option>`).join('')}
              </select>
            </label>
          </div>
        </div>
        ${renderPanel()}
      </div>
    `;
  }


  function renderRaffleSaveNotice(){
    const result = state.raffleResult;
    if (!result) return '';
    const hasStructured = result && typeof result === 'object';
    const kind = hasStructured ? String(result.kind || 'info') : 'info';
    const badgeText = kind === 'success' ? 'Gespeichert' : (kind === 'error' ? 'Fehler' : (kind === 'loading' ? 'Speichert' : 'Info'));
    const badgeClass = kind === 'success' ? 'lg-badge-ok' : (kind === 'error' ? 'lg-badge-off' : 'lg-badge-warn');
    const heading = hasStructured ? (result.title || badgeText) : 'Hinweis';
    const message = hasStructured ? (result.message || '') : String(result || '');
    return `<div class="lg-mini-row lg-config-save-notice"><span><strong>${esc(heading)}</strong>${message ? `<br><small class="lg-muted">${esc(message)}</small>` : ''}</span><span class="lg-badge ${badgeClass}">${esc(badgeText)}</span></div>`;
  }

  function renderRaffleConfigCard(){
    const data = state.raffleConfig || {};
    const cfg = data.config || data.raffle?.config || {};
    const error = data.ok === false ? `<div class="lg-warning">Raffle-Konfiguration konnte nicht geladen werden: ${esc(data.error || 'Unbekannter Fehler')}</div>` : '';
    return `
      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Raffle-Konfiguration</h3>
            <p class="lg-muted">Dauerhafte Einstellungen für das Raffle. Status, Gewinnerregel und Textvarianten bleiben in Mini-Spiele bzw. Texte.</p>
          </div>
          <button class="lg-btn lg-btn-secondary" data-lg-raffle-reload type="button">Neu laden</button>
        </div>
        ${error}
        <form class="lg-form lg-gamble-form lg-raffle-form" data-lg-raffle-form>
          <div class="lg-grid lg-editor-grid">
            <label class="lg-check-row"><span><strong>Raffle aktiv</strong><br><small class="lg-muted">Erlaubt !raffle/!join.</small></span><input type="checkbox" name="enabled" ${cfg.enabled !== false ? 'checked' : ''}></label>
            <label class="lg-check-row"><span><strong>Nur live</strong><br><small class="lg-muted">Nur während eines Livestreams startbar.</small></span><input type="checkbox" name="liveOnly" ${cfg.liveOnly ? 'checked' : ''}></label>
            <label><span>Dauer in Sekunden</span><input type="number" name="durationSeconds" min="10" max="${Number(cfg.maxDurationSeconds || 3600)}" step="1" value="${esc(cfg.durationSeconds || 120)}"></label>
            <label><span>Raffle-Gewinn gesamt</span><input type="number" name="prizePoolAmount" min="0" step="1" value="${esc(cfg.prizePoolAmount || 5000)}"></label>
            <label><span>Teilnahmekosten<br><small class="lg-muted">0 = kostenlos</small></span><input type="number" name="entryCostAmount" min="0" step="1" value="${esc(cfg.entryCostAmount || 0)}"></label>
          </div>
          <div class="lg-warning">Chat-Regel: Der Pool wird nie öffentlich angezeigt.</div>
          <div class="lg-actions">
            <button class="lg-btn" type="button" data-lg-raffle-save ${state.saving ? 'disabled' : ''}>Raffle speichern</button>
          </div>
          ${renderRaffleSaveNotice()}
        </form>
      </div>
    `;
  }

  function renderRaffleOverviewCard(){
    const data = state.raffleConfig || {};
    const cfg = data.config || data.raffle?.config || {};
    const runtime = data.runtime || data.raffle || {};
    const textKeys = Array.isArray(data.textKeys) ? data.textKeys : [];
    const winnerRule = Array.isArray(data.winnerRule) ? data.winnerRule : [];
    const error = data.ok === false ? `<div class="lg-warning">Raffle-Status konnte nicht geladen werden: ${esc(data.error || 'Unbekannter Fehler')}</div>` : '';
    return `
      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Raffle</h3>
            <p class="lg-muted">Bedien- und Statusansicht. Dauerhafte Einstellungen liegen im Tab „Einstellungen“, Textvarianten im Tab „Texte“.</p>
          </div>
          <div class="lg-actions">
            <button class="lg-btn" data-lg-open-config-section="raffle" type="button">Raffle konfigurieren</button>
            <button class="lg-btn lg-btn-secondary" data-lg-open-text-section="raffle" type="button">Raffle-Texte bearbeiten</button>
            <button class="lg-btn lg-btn-secondary" data-lg-raffle-reload type="button">Neu laden</button>
          </div>
        </div>
        ${error}
        <div class="lg-grid lg-grid-4 lg-mini-kpi-grid">
          <article class="lg-kpi lg-mini-kpi"><span>Status</span><strong>${esc(statusLabel(runtime.status || 'idle'))}</strong><small>${runtime.active ? 'läuft' : 'inaktiv'}</small></article>
          <article class="lg-kpi lg-mini-kpi"><span>Teilnehmer</span><strong>${fmtNumber(runtime.participantCount || 0)}</strong><small>aktueller/letzter Lauf</small></article>
          <article class="lg-kpi lg-mini-kpi"><span>Raffle-Gewinn gesamt</span><strong>${fmtNumber(cfg.prizePoolAmount || runtime.prizePoolAmount || 0)}</strong><small>nur intern, nicht im Chat</small></article>
          <article class="lg-kpi lg-mini-kpi"><span>Dauer</span><strong>${fmtNumber(cfg.durationSeconds || runtime.durationSeconds || 120)}s</strong><small>Standardlaufzeit</small></article>
        </div>
        <div class="lg-grid lg-editor-grid lg-raffle-detail-grid">
          <div class="lg-note-card lg-raffle-rule-card">
            <h4>Gewinnerregel</h4>
            <p class="lg-muted">Die Anzahl der Gewinner wird automatisch aus der Teilnehmerzahl berechnet.</p>
            <div class="lg-raffle-rule-list">
              ${winnerRule.length ? winnerRule.map(rule => `
                <div class="lg-raffle-rule-row">
                  <span>${esc(rule.min)}${rule.max ? `–${esc(rule.max)}` : '+'} Teilnehmer</span>
                  <strong>${esc(rule.winners || '-')}</strong>
                </div>
              `).join('') : '<div class="lg-raffle-rule-row"><span>Regel</span><strong>Standardregel aktiv</strong></div>'}
            </div>
          </div>
          <div class="lg-note-card lg-raffle-textkey-card">
            <h4>Textkeys</h4>
            <p class="lg-muted">Die Varianten werden zentral unter „Texte → Raffle“ gepflegt.</p>
            <div class="lg-raffle-key-list">
              ${textKeys.length ? textKeys.map(key => `<code>${esc(key)}</code>`).join('') : '<span class="lg-muted">Keine Textkeys geladen.</span>'}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderMinigames(){
    const gambleCfg = state.gambleConfig || {};
    const gambleSummary = currentGambleSummary(gambleCfg);
    const gambleSummaryText = Array.isArray(gambleSummary) ? gambleSummary.map(row => `${row[0]}: ${row[1]}`).slice(0, 2).join(' · ') : String(gambleSummary || 'Konfiguration vorhanden');
    const raffleCfg = state.raffleConfig?.config || {};
    const raffleRuntime = state.raffleConfig?.runtime || {};
    return `
      <div class="lg-grid lg-grid-2">
        <article class="lg-panel">
          <div class="lg-panel-head">
            <div>
              <h3>Mini-Spiele</h3>
              <p class="lg-muted">Schnelle Loyalty-Spiele für den Chat. Hier liegen Status, Kurzwerte und direkte Sprungpunkte zu Config und Texten.</p>
            </div>
          </div>
          <div class="lg-grid lg-grid-2">
            <button class="lg-module-card" data-lg-mini-scroll="raffle">
              <span class="lg-module-card-top"><span class="lg-module-icon">🎟️</span>${badge(raffleCfg.enabled !== false, 'aktiv', 'aus')}</span>
              <strong>Raffle</strong>
              <small>${fmtNumber(raffleCfg.durationSeconds || 120)}s · Gewinn intern ${fmtNumber(raffleCfg.prizePoolAmount || 5000)}</small>
              <span class="lg-module-state">${esc(statusLabel(raffleRuntime.status || 'idle'))} · !${esc(raffleCfg.raffleCommand || 'raffle')} / !${esc(raffleCfg.joinCommand || 'join')}</span>
            </button>
            <button class="lg-module-card" data-lg-mini-scroll="gamble">
              <span class="lg-module-card-top"><span class="lg-module-icon">🎲</span>${badge(gambleCfg.enabled !== false, 'aktiv', 'aus')}</span>
              <strong>Gamble</strong>
              <small>${esc(gambleSummaryText || 'Konfiguration vorhanden')}</small>
              <span class="lg-module-state">bestehendes Mini-Spiel · !gamble</span>
            </button>
          </div>
        </article>
        <article class="lg-panel" data-lg-mini-section="gamble">
          <div class="lg-panel-head">
            <div>
              <h3>Gamble</h3>
              <p class="lg-muted">Gamble bleibt technisch unverändert. Die bestehende Konfiguration öffnest du hier.</p>
            </div>
            <button class="lg-btn" data-lg-open-config-section="gamble" type="button">Gamble konfigurieren</button>
          </div>
          <div class="lg-grid lg-grid-3 lg-mini-kpi-grid">
            <article class="lg-kpi lg-mini-kpi"><span>Status</span><strong>${gambleCfg.enabled === false ? 'Aus' : 'Aktiv'}</strong><small>bestehende Config</small></article>
            <article class="lg-kpi lg-mini-kpi"><span>Logs geladen</span><strong>${fmtNumber((state.gambleLogRows || []).length)}</strong><small>Command-Logs</small></article>
            <article class="lg-kpi lg-mini-kpi"><span>Statistik</span><strong>${fmtNumber((state.gambleStats || {}).total || 0)}</strong><small>geladene Spiele</small></article>
          </div>
          <div class="lg-actions">
            <button class="lg-btn lg-btn-secondary" data-lg-gamble-stats type="button">Statistik öffnen</button>
            <button class="lg-btn lg-btn-secondary" data-lg-gamble-audit type="button">Audit öffnen</button>
          </div>
        </article>
      </div>
      <div data-lg-mini-section="raffle">
        ${renderRaffleOverviewCard()}
      </div>
      ${renderGambleModal()}
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
      ['minigames', 'Mini-Spiele'],
      ['config', 'Einstellungen'],
      ['texts', 'Texte'],
      ['chat', 'Chat & Befehle'],
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
    if (state.activeTab === 'minigames') return renderMinigames();
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
      state.configSection = normalizeConfigSection(ev.currentTarget.value || 'core');
      render();
    });

    root.querySelectorAll('[data-lg-open-config-section]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.configSection = normalizeConfigSection(btn.dataset.lgOpenConfigSection || 'core');
        state.activeTab = 'config';
        render();
      });
    });

    root.querySelector('[data-lg-log-module]')?.addEventListener('change', ev => {
      state.logModule = ev.currentTarget.value || 'all';
      render();
    });
    root.querySelector('[data-lg-log-event]')?.addEventListener('change', ev => {
      state.logEvent = ev.currentTarget.value || 'all';
      render();
    });
    root.querySelector('[data-lg-log-status]')?.addEventListener('change', ev => {
      state.logStatus = ev.currentTarget.value || 'all';
      render();
    });
    root.querySelector('[data-lg-log-search]')?.addEventListener('input', ev => {
      state.logSearch = ev.currentTarget.value || '';
      render();
    });

    root.querySelector('[data-lg-text-section]')?.addEventListener('change', ev => {
      state.textSection = ev.currentTarget.value || 'all';
      render();
    });
    root.querySelector('[data-lg-text-search]')?.addEventListener('input', ev => {
      state.textSearch = ev.currentTarget.value || '';
      render();
    });
    root.querySelectorAll('[data-lg-text-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.textEditKey = btn.dataset.lgTextEdit || '';
        render();
      });
    });
    root.querySelectorAll('[data-lg-text-modal-close]').forEach(el => el.addEventListener('click', ev => {
      if (ev.target.closest('[data-lg-text-modal-box]') && !ev.target.matches('[data-lg-text-modal-close]')) return;
      state.textEditKey = '';
      render();
    }));
    root.querySelectorAll('[data-lg-text-modal-box]').forEach(box => box.addEventListener('click', ev => ev.stopPropagation()));
    root.querySelectorAll('[data-lg-text-toggle-variant]').forEach(btn => {
      btn.addEventListener('click', () => {
        setChatTextVariantActive(btn.dataset.lgTextToggleKey || '', btn.dataset.lgTextToggleVariant || '', btn.dataset.lgTextToggleEnabled === '1');
      });
    });
    root.querySelectorAll('[data-lg-text-delete-variant]').forEach(btn => {
      btn.addEventListener('click', () => {
        deleteChatTextVariant(btn.dataset.lgTextDeleteKey || '', btn.dataset.lgTextDeleteVariant || '');
      });
    });
    root.querySelector('[data-lg-text-reload]')?.addEventListener('click', async () => {
      await refreshChatSetup(false);
      render();
    });

    root.querySelectorAll('[data-lg-log-detail]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.logDetailKey = btn.dataset.lgLogDetail || '';
        render();
      });
    });
    root.querySelectorAll('[data-lg-log-modal-close]').forEach(el => el.addEventListener('click', ev => {
      if (ev.target.closest('[data-lg-log-modal-box]') && !ev.target.matches('[data-lg-log-modal-close]')) return;
      state.logDetailKey = '';
      render();
    }));
    root.querySelectorAll('[data-lg-log-modal-box]').forEach(box => box.addEventListener('click', ev => ev.stopPropagation()));

    root.querySelector('[data-lg-core-clear-result]')?.addEventListener('click', () => {
      state.coreSettingsResult = '';
      render();
    });

    root.querySelector('[data-lg-core-basic-settings]')?.addEventListener('submit', ev => {
      ev.preventDefault();
      const form = ev.currentTarget;
      const enabled = String(form.elements.enabled?.value || 'true') === 'true';
      const eventBonusesEnabled = String(form.elements.eventBonusesEnabled?.value || 'false') === 'true';
      const currencyName = String(form.elements.currencyName?.value || 'Kekskrümel').trim() || 'Kekskrümel';
      submitCoreSetting({
        enabled,
        currency: { name: currencyName },
        features: { eventBonusesEnabled }
      }, 'Core-Grundregeln');
    });

    root.querySelector('[data-lg-core-auto-points-settings]')?.addEventListener('submit', ev => {
      ev.preventDefault();
      const form = ev.currentTarget;
      const enabled = String(form.elements.autoPointsEnabled?.value || 'false') === 'true';
      const numberValue = (name, fallback, min = 0) => {
        const value = Number(form.elements[name]?.value);
        return Number.isFinite(value) && value >= min ? Math.floor(value) : fallback;
      };
      submitCoreSetting({
        watch: {
          enabled,
          amount: numberValue('watchAmount', 2, 0),
          intervalMinutes: numberValue('intervalMinutes', 10, 1),
          subscriberMultiplier: numberValue('subscriberMultiplier', 3, 1),
          subscriberTierAmounts: {
            1000: numberValue('subTier1000', 6, 0),
            2000: numberValue('subTier2000', 8, 0),
            3000: numberValue('subTier3000', 10, 0)
          }
        },
        features: {
          watchEarningEnabled: enabled
        },
        autoRunner: {
          runOnlyWhenLive: String(form.elements.runOnlyWhenLive?.value || 'true') === 'true',
          activeMinutes: numberValue('activeMinutes', 30, 1),
          maxUsersPerRun: numberValue('maxUsersPerRun', 250, 1),
          includeJoinedOnly: String(form.elements.includeJoinedOnly?.value || 'true') === 'true'
        }
      }, 'Automatische Punkte');
    });

    root.querySelector('[data-lg-core-gift-settings]')?.addEventListener('submit', ev => {
      ev.preventDefault();
      const form = ev.currentTarget;
      const mode = String(form.elements.receiverMode?.value || 'track_only').trim();
      submitCoreSetting({ key: 'bonuses.giftSubReceiver.mode', value: mode }, 'Geschenk-Abo-Empfänger-Regel');
    });

    root.querySelector('[data-lg-core-raid-settings]')?.addEventListener('submit', ev => {
      ev.preventDefault();
      const form = ev.currentTarget;
      const numberValue = (name, fallback) => {
        const value = Number(form.elements[name]?.value);
        return Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;
      };
      const mode = String(form.elements.raidMode?.value || 'base_plus_viewers').trim();
      const body = {
        bonuses: {
          raid: {
            mode,
            amount: numberValue('raidAmount', 50),
            baseAmount: numberValue('raidBaseAmount', 25),
            amountPerViewer: numberValue('raidAmountPerViewer', 2),
            maxAmount: numberValue('raidMaxAmount', 250)
          }
        }
      };
      submitCoreSetting(body, 'Raid-Regel');
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
    root.querySelector('[data-lg-raffle-clear-result]')?.addEventListener('click', () => {
      state.raffleResult = '';
      render();
    });
    root.querySelector('[data-lg-raffle-reload]')?.addEventListener('click', () => loadRaffleConfig(true));
    root.querySelector('[data-lg-raffle-save]')?.addEventListener('click', () => {
      const form = root.querySelector('[data-lg-raffle-form]');
      submitRaffleConfig(form);
    });
    root.querySelectorAll('[data-lg-mini-scroll]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = root.querySelector(`[data-lg-mini-section="${btn.dataset.lgMiniScroll}"]`);
        target?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      });
    });

    root.querySelector('[data-lg-gamble-save]')?.addEventListener('click', () => {
      const form = root.querySelector('[data-lg-gamble-form]');
      submitGambleWrite(form);
    });

    root.querySelectorAll('[data-lg-open-text-section]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.textSection = btn.dataset.lgOpenTextSection || 'all';
        state.activeTab = 'texts';
        render();
      });
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
