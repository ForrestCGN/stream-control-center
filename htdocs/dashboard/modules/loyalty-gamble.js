(() => {
  'use strict';

  const apiBase = window.CGN_LOYALTY_GAMBLE_API_BASE || '';
  const endpoints = {
    config: `${apiBase}/api/loyalty/games/gamble/dashboard-config`,
    audit: `${apiBase}/api/loyalty/games/gamble/dashboard-audit?limit=8`,
    commandLogs: `${apiBase}/api/commands/logs?limit=80`
  };

  const $ = (id) => document.getElementById(id);
  const fields = [
    'enabled', 'commandEnabled', 'winChancePercent', 'payoutMultiplier', 'minBet', 'maxBet',
    'userCooldownMs', 'globalCooldownMs', 'commandCooldownUserMs', 'sendResultToChat',
    'allowPercentBets', 'allowKeywordBets'
  ];
  const checkboxFields = new Set(['enabled', 'commandEnabled', 'sendResultToChat', 'allowPercentBets', 'allowKeywordBets']);

  let lastConfig = null;

  function setResult(value) {
    const box = $('resultBox');
    if (!box) return;
    box.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  }

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (_) { data = { ok: false, error: text || response.statusText }; }
    if (!response.ok) {
      const err = new Error(data?.error || response.statusText || `HTTP ${response.status}`);
      err.status = response.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  function getEngine(config, key, fallback = '') {
    return config?.config?.engine?.[key] ?? fallback;
  }

  function getCommand(config, key, fallback = '') {
    return config?.command?.[key] ?? fallback;
  }

  function setField(id, value) {
    const input = $(id);
    if (!input) return;
    if (checkboxFields.has(id)) input.checked = Boolean(value);
    else input.value = value ?? '';
  }

  function getField(id) {
    const input = $(id);
    if (!input) return null;
    if (checkboxFields.has(id)) return Boolean(input.checked);
    const raw = String(input.value || '').trim();
    if (raw === '') return null;
    const num = Number(raw);
    return Number.isFinite(num) ? num : raw;
  }

  function setKpi(id, label, value, hint, state = '') {
    const node = $(id);
    if (!node) return;
    node.classList.remove('is-on', 'is-off');
    if (state) node.classList.add(state);
    node.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(hint)}</small>`;
  }

  function renderStatus(config) {
    const engineOn = Boolean(getEngine(config, 'enabled', false));
    const commandOn = Boolean(getCommand(config, 'enabled', false));
    const chance = getEngine(config, 'winChancePercent', '?');
    const payout = getEngine(config, 'payoutMultiplier', '?');
    const cooldown = getCommand(config, 'cooldownUserMs', getEngine(config, 'userCooldownMs', '?'));

    setKpi('kpiEngine', 'Engine', engineOn ? 'AN' : 'AUS', 'Gamble-Berechnung', engineOn ? 'is-on' : 'is-off');
    setKpi('kpiCommand', 'Command', commandOn ? 'AN' : 'AUS', '!gamble Chatbefehl', commandOn ? 'is-on' : 'is-off');
    setKpi('kpiChance', 'Chance', `${chance}%`, `${payout}x Auszahlung`);
    setKpi('kpiCooldown', 'Cooldown', formatDuration(cooldown), 'pro User');

    const pill = $('connectionStatus');
    if (pill) {
      pill.textContent = config?.ok ? 'API verbunden' : 'API nicht bereit';
      pill.classList.toggle('is-ok', Boolean(config?.ok));
      pill.classList.toggle('is-warn', !config?.ok);
    }
  }

  function renderForm(config) {
    setField('enabled', getEngine(config, 'enabled', false));
    setField('commandEnabled', getCommand(config, 'enabled', false));
    setField('winChancePercent', getEngine(config, 'winChancePercent', 47));
    setField('payoutMultiplier', getEngine(config, 'payoutMultiplier', 2));
    setField('minBet', getEngine(config, 'minBet', 1));
    setField('maxBet', getEngine(config, 'maxBet', 0));
    setField('userCooldownMs', getEngine(config, 'userCooldownMs', 60000));
    setField('globalCooldownMs', getEngine(config, 'globalCooldownMs', 0));
    setField('commandCooldownUserMs', getCommand(config, 'cooldownUserMs', 60000));
    setField('sendResultToChat', getCommand(config, 'sendResultToChat', true));
    setField('allowPercentBets', getEngine(config, 'allowPercentBets', true));
    setField('allowKeywordBets', getEngine(config, 'allowKeywordBets', true));
    $('dirtyState').textContent = 'geladen';
  }

  function buildWriteBody({ dryRun = false, confirmWrite = false } = {}) {
    const actorLogin = String($('actorLogin')?.value || 'forrestcgn').trim();
    return {
      actorLogin,
      actorDisplayName: actorLogin || 'ForrestCGN',
      actorRole: String($('actorRole')?.value || 'streamer').trim(),
      dryRun,
      confirmWrite,
      reason: dryRun ? 'STEP230 Dashboard UI Dryrun' : 'STEP230 Dashboard UI Write',
      engine: {
        enabled: getField('enabled'),
        winChancePercent: getField('winChancePercent'),
        payoutMultiplier: getField('payoutMultiplier'),
        minBet: getField('minBet'),
        maxBet: getField('maxBet'),
        userCooldownMs: getField('userCooldownMs'),
        globalCooldownMs: getField('globalCooldownMs'),
        allowPercentBets: getField('allowPercentBets'),
        allowKeywordBets: getField('allowKeywordBets')
      },
      command: {
        enabled: getField('commandEnabled'),
        cooldownUserMs: getField('commandCooldownUserMs'),
        sendResultToChat: getField('sendResultToChat'),
        activationState: dryRun ? 'dashboard_ui_dryrun_step230' : 'dashboard_ui_write_step230'
      }
    };
  }

  async function loadConfig({ silent = false } = {}) {
    try {
      const config = await fetchJson(endpoints.config);
      lastConfig = config;
      renderStatus(config);
      renderForm(config);
      if (!silent) setResult({ loaded: true, feature: config?.feature, readOnly: config?.readOnly, writable: config?.writable });
      await Promise.allSettled([loadStats(true), loadAudit(true)]);
    } catch (err) {
      const pill = $('connectionStatus');
      if (pill) {
        pill.textContent = 'API Fehler';
        pill.classList.add('is-warn');
      }
      setResult({ ok: false, error: err.message, status: err.status, data: err.data });
    }
  }

  async function submitDryRun() {
    try {
      const result = await fetchJson(endpoints.config, { method: 'POST', body: JSON.stringify(buildWriteBody({ dryRun: true })) });
      $('dirtyState').textContent = 'Dryrun OK';
      setResult(result);
    } catch (err) {
      setResult({ ok: false, error: err.message, status: err.status, data: err.data });
    }
  }

  async function submitWrite() {
    if (!$('confirmWrite').checked) {
      setResult('Write blockiert: Bitte zuerst "Write bestätigen" aktivieren.');
      return;
    }
    try {
      const result = await fetchJson(endpoints.config, { method: 'POST', body: JSON.stringify(buildWriteBody({ confirmWrite: true })) });
      $('dirtyState').textContent = result?.ok ? 'gespeichert' : 'Fehler';
      setResult(result);
      $('confirmWrite').checked = false;
      await loadConfig({ silent: true });
    } catch (err) {
      setResult({ ok: false, error: err.message, status: err.status, data: err.data });
    }
  }

  async function loadAudit(silent = false) {
    try {
      const audit = await fetchJson(endpoints.audit);
      const rows = Array.isArray(audit.items) ? audit.items : (Array.isArray(audit.rows) ? audit.rows : []);
      $('auditList').innerHTML = rows.length ? rows.slice(0, 8).map(renderAuditRow).join('') : '<span class="muted">Keine Audit-Einträge gefunden.</span>';
      if (!silent) setResult({ auditLoaded: true, count: rows.length });
    } catch (err) {
      $('auditList').textContent = `Audit Fehler: ${err.message}`;
    }
  }

  async function loadStats(silent = false) {
    try {
      const data = await fetchJson(endpoints.commandLogs);
      const logs = normalizeLogs(data).filter(row => String(row.trigger || row.command || row.aliasTrigger || '').toLowerCase() === 'gamble');
      const stats = buildGambleStats(logs);
      renderStats(stats);
      $('statsHint').textContent = stats.total > 0
        ? `Auswertung aus ${stats.total} Gamble-Logeinträgen.`
        : 'Noch keine auswertbaren Gamble-Logs gefunden.';
      if (!silent) setResult({ statsLoaded: true, stats });
    } catch (err) {
      $('statsHint').textContent = `Statistik nicht verfügbar: ${err.message}`;
      renderStats({ total: 0, wins: 0, losses: 0, netProfit: 0 });
    }
  }

  function normalizeLogs(data) {
    if (Array.isArray(data?.logs)) return data.logs;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.rows)) return data.rows;
    if (Array.isArray(data)) return data;
    return [];
  }

  function parseResult(row) {
    const candidates = [row.result, row.response, row.data, row.payload];
    for (const value of candidates) {
      if (!value) continue;
      if (typeof value === 'object') return value;
      if (typeof value === 'string') {
        try { return JSON.parse(value); } catch (_) {}
      }
    }
    return row;
  }

  function buildGambleStats(logs) {
    const stats = { total: 0, wins: 0, losses: 0, netProfit: 0 };
    for (const row of logs) {
      if (row.ignored === true || row.success === false) continue;
      const result = parseResult(row);
      const outcome = String(result.outcome || result.data?.outcome || '').toLowerCase();
      const won = result.won === true || result.data?.won === true || outcome === 'win';
      const lost = result.won === false || result.data?.won === false || outcome === 'lose' || outcome === 'loss';
      const net = Number(result.netProfit ?? result.data?.netProfit ?? 0);
      stats.total += 1;
      if (won) stats.wins += 1;
      else if (lost) stats.losses += 1;
      if (Number.isFinite(net)) stats.netProfit += net;
    }
    return stats;
  }

  function renderStats(stats) {
    const cards = [
      ['Gambles', stats.total || 0, ''],
      ['Wins', stats.wins || 0, 'good'],
      ['Losses', stats.losses || 0, 'bad'],
      ['Netto', formatSigned(stats.netProfit || 0), stats.netProfit >= 0 ? 'good' : 'bad']
    ];
    $('statsGrid').innerHTML = cards.map(([label, value, cls]) => `<div class="stat-card ${cls}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
  }

  function renderAuditRow(row) {
    const actor = row.actor_login || row.actorLogin || row.actor || 'unbekannt';
    const action = row.action || row.event || row.audit_uid || row.auditUid || 'write';
    const at = row.created_at || row.createdAt || row.ts || '';
    return `<div class="audit-row"><strong>${escapeHtml(action)}</strong><br>${escapeHtml(actor)} · ${escapeHtml(at)}</div>`;
  }

  function formatDuration(value) {
    const ms = Number(value);
    if (!Number.isFinite(ms)) return String(value ?? '?');
    if (ms <= 0) return '0s';
    if (ms % 60000 === 0) return `${ms / 60000}m`;
    if (ms % 1000 === 0) return `${ms / 1000}s`;
    return `${ms}ms`;
  }

  function formatSigned(value) {
    const num = Number(value) || 0;
    return num > 0 ? `+${num}` : String(num);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
  }

  fields.forEach((id) => $(id)?.addEventListener('input', () => { $('dirtyState').textContent = 'geändert'; }));
  $('reloadBtn')?.addEventListener('click', () => loadConfig());
  $('dryRunBtn')?.addEventListener('click', submitDryRun);
  $('saveBtn')?.addEventListener('click', submitWrite);
  $('auditBtn')?.addEventListener('click', () => loadAudit(false));
  $('statsBtn')?.addEventListener('click', () => loadStats(false));
  $('clearLogBtn')?.addEventListener('click', () => setResult(''));

  loadConfig();
})();
