window.LoyaltyGamesModule = (function(){
  'use strict';

  const api = {
    status: '/api/loyalty/games/status',
    config: '/api/loyalty/games/config',
    routes: '/api/loyalty/games/routes',
    sessions: '/api/loyalty/games/sessions?gameKey=wheel&limit=50',
    wheelStatus: '/api/loyalty/games/wheel/status',
    wheelConfig: '/api/loyalty/games/wheel/config',
    presets: '/api/loyalty/games/wheel/presets',
    spins: '/api/loyalty/games/wheel/spins?limit=50',
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

  function buildGambleStats(logs){
    const stats = { total: 0, wins: 0, losses: 0, netProfit: 0 };
    normalizeCommandLogs(logs).filter(row => String(row?.trigger || row?.command || row?.aliasTrigger || '').toLowerCase() === 'gamble').forEach(row => {
      if (row?.ignored === true || row?.success === false) return;
      const result = parseCommandResult(row);
      const data = result?.data || {};
      const outcome = String(result?.outcome || data?.outcome || '').toLowerCase();
      const won = result?.won === true || data?.won === true || outcome === 'win';
      const lost = result?.won === false || data?.won === false || outcome === 'lose' || outcome === 'loss';
      const net = Number(result?.netProfit ?? data?.netProfit ?? 0);
      stats.total += 1;
      if (won) stats.wins += 1;
      else if (lost) stats.losses += 1;
      if (Number.isFinite(net)) stats.netProfit += net;
    });
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
    const payout = getGambleEngine(config, 'payoutMultiplier', '?');
    const cooldown = getGambleCommand(config, 'cooldownUserMs', getGambleEngine(config, 'userCooldownMs', '?'));
    return [
      ['Engine', engineOn ? 'aktiv' : 'aus'],
      ['Command', commandOn ? 'aktiv' : 'aus'],
      ['Chat-Antwort', chatOn ? 'aktiv' : 'aus'],
      ['Gewinnchance', `${chance}%`],
      ['Auszahlung', `${payout}x`],
      ['Cooldown', formatDuration(cooldown)]
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
        payoutMultiplier: getGambleFormValue(form, 'payoutMultiplier'),
        minBet: getGambleFormValue(form, 'minBet'),
        maxBet: getGambleFormValue(form, 'maxBet'),
        userCooldownMs: secondsInputToMs(getGambleFormValue(form, 'userCooldownSeconds')),
        globalCooldownMs: secondsInputToMs(getGambleFormValue(form, 'globalCooldownSeconds')),
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
      state.gambleStats = buildGambleStats(normalizeCommandLogs(data));
      state.error = '';
    } catch (err) {
      state.gambleStats = { total: 0, wins: 0, losses: 0, netProfit: 0, error: err.message };
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
    if (!force && state.status && state.wheelStatus && state.presets && state.giveaways && state.giveawayCommands && state.giveawayTexts && state.communicationStatus && state.gambleConfig) { render(); return; }

    state.loading = true;
    state.error = '';
    render();

    try {
      const [status, config, routes, sessions, wheelStatus, wheelConfig, presets, spins, giveawaysStatus, giveaways, giveawayCommands, giveawayTexts, communicationStatus, gambleConfig, gambleAudit, commandLogs] = await Promise.all([
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

      state = { ...state, loading:false, error:'', status, config, routes, sessions, wheelStatus, wheelConfig, presets, spins, giveawaysStatus, giveaways, giveawayCommands, giveawayTexts, communicationStatus, gambleConfig, gambleAudit, gambleStats: buildGambleStats(normalizeCommandLogs(commandLogs)), selectedPresetUid, selectedGiveawayUid };
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
        title: 'Loyalty Core',
        icon: '🎟️',
        tab: 'overview',
        description: 'Punkte, Konten und Transaktionen',
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
        tab: 'notes',
        description: 'spätere Preset- und Giveaway-Auslöser',
        health: channelpointsHealth
      },
      {
        title: 'Rewards',
        icon: '🏆',
        tab: 'notes',
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
          <span class="lg-card-label">CanBus Clients</span>
          <strong>${fmtNumber(clients.length)}</strong>
          <small>registrierte Clients im Communication-Bus</small>
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
          <span class="lg-card-label">Giveaways</span>
          <strong>${fmtNumber(giveawaysDiag.total || rows(state.giveaways).length)}</strong>
          <small>draft ${fmtNumber(giveawaysDiag.draft || 0)} · open ${fmtNumber(giveawaysDiag.open || 0)}</small>
          ${badge(state.giveawaysStatus?.ok !== false, 'OK', 'Fehler')}
        </article>
      </div>

      <div class="lg-panel">
        <h3>Systemstatus</h3>
        <div class="lg-kv">
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
    const textPayload = state.giveawayTexts || {};
    const categories = Array.isArray(textPayload.categories) ? textPayload.categories : [];
    const keys = Array.isArray(textPayload.keys) ? textPayload.keys : [];
    return `
      <div class="lg-grid lg-grid-2">
        <div class="lg-panel">
          <h3>Chat-Commands</h3>
          <p class="lg-muted">Eingetragen, aber bewusst nicht aktiv. Keine Twitch-Command-Ausführung in diesem Step.</p>
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
          <h3>Text-Kategorien</h3>
          <p class="lg-muted">CGN-/Altersheim-/Rentner-Texte laufen über den bestehenden Helper für Textvarianten.</p>
          <div class="lg-kv">
            ${categories.map(cat => `<span>${esc(cat.label || cat.id)}</span><strong>${fmtNumber(cat.variantCount || cat.count || 0)} Varianten</strong>`).join('') || '<span>Texte</span><strong>-</strong>'}
          </div>
        </div>
      </div>

      <div class="lg-panel">
        <h3>Chat-Multi-Texte</h3>
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
            <p class="lg-muted">Zentrale Config-Ansicht. Speichern fragt vor dem echten Write nach Bestätigung; die bestehende Gamble-API bleibt unverändert.</p>
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
            <label>Auszahlung x<input name="payoutMultiplier" type="number" min="0" step="0.01" value="${esc(getGambleEngine(config, 'payoutMultiplier', 2))}"></label>
          </div>
          <div class="lg-form-row">
            <label>Mindesteinsatz<input name="minBet" type="number" min="0" step="1" value="${esc(getGambleEngine(config, 'minBet', 1))}"></label>
            <label>Maximaleinsatz<input name="maxBet" type="number" min="0" step="1" value="${esc(getGambleEngine(config, 'maxBet', 0))}"></label>
          </div>
          <div class="lg-form-row">
            <label>Gamble-Cooldown pro User (Sek.)<input name="userCooldownSeconds" type="number" min="0" step="1" value="${esc(msToSecondsInput(getGambleEngine(config, 'userCooldownMs', 60000)))}"></label>
            <label>Gamble-Cooldown global (Sek.)<input name="globalCooldownSeconds" type="number" min="0" step="1" value="${esc(msToSecondsInput(getGambleEngine(config, 'globalCooldownMs', 0)))}"></label>
            <label>Command-Cooldown pro User (Sek.)<input name="commandCooldownUserSeconds" type="number" min="0" step="1" value="${esc(msToSecondsInput(getGambleCommand(config, 'cooldownUserMs', 60000)))}"></label>
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
      ['core', 'Kekskrümel/Core', false],
      ['runner', 'Runner/Watchtime', false],
      ['wheel', 'Glücksrad', false],
      ['presets', 'Presets', false],
      ['giveaways', 'Giveaways', false],
      ['gamble', 'Gamble', true],
      ['chat', 'Chat/Commands', false],
      ['texts', 'Texte', false]
    ];
    const current = sections.find(([id]) => id === section) || sections.find(([id]) => id === 'gamble');
    return `
      <div class="lg-panel lg-config-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Config</h3>
            <p class="lg-muted">Zentrale Loyalty-Config. Gamble ist aktiv angebunden; weitere Bereiche folgen mit demselben UX-Standard.</p>
          </div>
          <div class="lg-actions">
            <label class="lg-config-select-label">Bereich
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

  function renderGamble(){
    const config = state.gambleConfig || {};
    const auditRows = Array.isArray(state.gambleAudit?.items) ? state.gambleAudit.items : (Array.isArray(state.gambleAudit?.rows) ? state.gambleAudit.rows : []);
    const stats = state.gambleStats || { total: 0, wins: 0, losses: 0, netProfit: 0 };
    const engineOn = Boolean(getGambleEngine(config, 'enabled', false));
    const commandOn = Boolean(getGambleCommand(config, 'enabled', false));
    const chance = getGambleEngine(config, 'winChancePercent', '?');
    const payout = getGambleEngine(config, 'payoutMultiplier', '?');
    const cooldown = getGambleCommand(config, 'cooldownUserMs', getGambleEngine(config, 'userCooldownMs', '?'));

    return `
      <div class="lg-grid lg-grid-4 lg-gamble-kpis">
        <article class="lg-card">
          <span class="lg-card-label">Engine</span>
          <strong>${engineOn ? 'AN' : 'AUS'}</strong>
          ${badge(engineOn, 'Berechnung aktiv', 'Berechnung aus')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Command</span>
          <strong>${commandOn ? 'AN' : 'AUS'}</strong>
          ${badge(commandOn, '!gamble aktiv', '!gamble aus')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Chance</span>
          <strong>${esc(chance)}%</strong>
          <small>${esc(payout)}x Auszahlung</small>
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Cooldown</span>
          <strong>${esc(formatDuration(cooldown))}</strong>
          <small>pro User</small>
        </article>
      </div>

      <div class="lg-grid lg-editor-grid lg-gamble-grid">
        <div class="lg-panel">
          <div class="lg-panel-head">
            <div>
              <h3>Gamble</h3>
              <p class="lg-muted">Status, Statistik und Audit. Die Bearbeitung der Werte liegt jetzt zentral im Config-Tab.</p>
            </div>
            <div class="lg-actions">
              <button class="lg-btn" data-lg-open-config-section="gamble">Config bearbeiten</button>
              <button class="lg-btn lg-btn-secondary" data-lg-gamble-reload>Neu laden</button>
            </div>
          </div>
          <div class="lg-mini-list">
            <div class="lg-mini-row"><span><strong>Engine</strong><br><small class="lg-muted">${engineOn ? 'aktiv' : 'inaktiv'}</small></span>${badge(engineOn, 'aktiv', 'aus')}</div>
            <div class="lg-mini-row"><span><strong>Command</strong><br><small class="lg-muted">${commandOn ? '!gamble aktiv' : '!gamble aus'}</small></span>${badge(commandOn, 'aktiv', 'aus')}</div>
            <div class="lg-mini-row"><span><strong>Aktive Regeln</strong><br><small class="lg-muted">${esc(chance)}% Chance · ${esc(payout)}x Auszahlung · ${esc(formatDuration(cooldown))} Cooldown</small></span></div>
          </div>
          ${renderGambleResultBox('Letztes Config-Ergebnis')}
        </div>

        <div class="lg-panel">
          <div class="lg-panel-head">
            <div>
              <h3>Statistik & Audit</h3>
              <p class="lg-muted">Statistik aus Command-Logs, Audit aus Gamble-Dashboard-Audit.</p>
            </div>
            <div class="lg-actions">
              <button class="lg-btn lg-btn-secondary" data-lg-gamble-stats>Stats</button>
              <button class="lg-btn lg-btn-secondary" data-lg-gamble-audit>Audit</button>
            </div>
          </div>
          <div class="lg-grid lg-grid-4 lg-gamble-stats">
            <article class="lg-card"><span class="lg-card-label">Gambles</span><strong>${fmtNumber(stats.total || 0)}</strong></article>
            <article class="lg-card"><span class="lg-card-label">Wins</span><strong>${fmtNumber(stats.wins || 0)}</strong></article>
            <article class="lg-card"><span class="lg-card-label">Losses</span><strong>${fmtNumber(stats.losses || 0)}</strong></article>
            <article class="lg-card"><span class="lg-card-label">Netto</span><strong>${esc(formatSigned(stats.netProfit || 0))}</strong></article>
          </div>
          <div class="lg-mini-list lg-gamble-audit-list">
            ${auditRows.length ? auditRows.slice(0, 8).map(row => {
              const actor = row.actor_login || row.actorLogin || row.actor || 'unbekannt';
              const action = row.action || row.event || row.audit_uid || row.auditUid || 'write';
              const at = row.created_at || row.createdAt || row.ts || '';
              return `<div class="lg-mini-row"><span><strong>${esc(action)}</strong><br><small class="lg-muted">${esc(actor)} · ${esc(at)}</small></span></div>`;
            }).join('') : `<p class="lg-muted">Keine Audit-Einträge gefunden.</p>`}
          </div>
        </div>
      </div>
    `;
  }

  function renderTabs(){
    const tabs = [
      ['overview', 'Übersicht'],
      ['wheel', 'Glücksrad'],
      ['presets', 'Presets'],
      ['giveaways', 'Giveaways'],
      ['gamble', 'Gamble'],
      ['config', 'Config'],
      ['chat', 'Chat/Commands'],
      ['history', 'Verlauf'],
      ['notes', 'Hinweise']
    ];
    return `
      <div class="lg-tabs">
        ${tabs.map(([id, label]) => {
          if (id === 'giveaways' && window.CGN?.modules?.loyalty_giveaways) {
            return `<button class="lg-tab" data-lg-open-module="loyalty_giveaways">${label}</button>`;
          }
          return `<button class="lg-tab ${state.activeTab === id ? 'is-active' : ''}" data-lg-tab="${id}">${label}</button>`;
        }).join('')}
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
    if (state.activeTab === 'chat') return renderChatSetup();
    if (state.activeTab === 'history') return renderSessions();
    if (state.activeTab === 'notes') return renderNotes();
    return renderOverview();
  }

  function bindEvents(){
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

    root.querySelector('[data-lg-gamble-audit]')?.addEventListener('click', () => loadGambleAudit(true));
    root.querySelector('[data-lg-gamble-stats]')?.addEventListener('click', () => loadGambleStats(true));
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
          <p class="lg-subline">Punkte, Giveaways, Glücksrad, Raffles, Texte, Statistik, Config und Verlauf.</p>
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
