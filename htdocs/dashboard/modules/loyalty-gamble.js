(() => {
  'use strict';

  const apiBase = window.CGN_LOYALTY_GAMBLE_API_BASE || '';
  const endpoints = {
    config: `${apiBase}/api/loyalty/games/gamble/dashboard-config`,
    audit: `${apiBase}/api/loyalty/games/gamble/dashboard-audit?limit=10`
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
    $('resultBox').textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
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

  function renderStatus(config) {
    const status = [
      ['Feature', config?.feature || 'gamble'],
      ['API', config?.readOnly === false ? 'writefaehig' : 'readonly'],
      ['Engine aktiv', getEngine(config, 'enabled', false) ? 'ja' : 'nein'],
      ['Command aktiv', getCommand(config, 'enabled', false) ? 'ja' : 'nein'],
      ['Gewinnchance', `${getEngine(config, 'winChancePercent', '?')} %`],
      ['Auszahlung', `${getEngine(config, 'payoutMultiplier', '?')}x`],
      ['Engine Cooldown', `${getEngine(config, 'userCooldownMs', '?')} ms`],
      ['Command Cooldown', `${getCommand(config, 'cooldownUserMs', '?')} ms`]
    ];
    $('statusGrid').innerHTML = status.map(([k, v]) => `<div class="status-item"><b>${escapeHtml(k)}</b><span>${escapeHtml(v)}</span></div>`).join('');
    $('connectionStatus').textContent = config?.ok ? 'API verbunden' : 'API nicht bereit';
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
    return {
      actorLogin: String($('actorLogin').value || 'forrestcgn').trim(),
      actorDisplayName: String($('actorLogin').value || 'ForrestCGN').trim(),
      actorRole: String($('actorRole').value || 'streamer').trim(),
      dryRun,
      confirmWrite,
      reason: dryRun ? 'STEP229 Dashboard UI Dryrun' : 'STEP229 Dashboard UI Write',
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
        activationState: dryRun ? 'dashboard_ui_dryrun_step229' : 'dashboard_ui_write_step229'
      }
    };
  }

  async function loadConfig() {
    try {
      const config = await fetchJson(endpoints.config);
      lastConfig = config;
      renderStatus(config);
      renderForm(config);
      setResult({ loaded: true, config });
    } catch (err) {
      $('connectionStatus').textContent = 'API Fehler';
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
      setResult('Write blockiert: Bitte zuerst "Write bestaetigen" aktivieren.');
      return;
    }
    try {
      const result = await fetchJson(endpoints.config, { method: 'POST', body: JSON.stringify(buildWriteBody({ confirmWrite: true })) });
      $('dirtyState').textContent = result?.ok ? 'gespeichert' : 'Fehler';
      setResult(result);
      await loadConfig();
    } catch (err) {
      setResult({ ok: false, error: err.message, status: err.status, data: err.data });
    }
  }

  async function loadAudit() {
    try {
      const audit = await fetchJson(endpoints.audit);
      const rows = Array.isArray(audit.items) ? audit.items : (Array.isArray(audit.rows) ? audit.rows : []);
      $('auditList').innerHTML = rows.length ? rows.map(renderAuditRow).join('') : '<span class="muted">Keine Audit-Eintraege gefunden.</span>';
      setResult({ auditLoaded: true, count: rows.length, audit });
    } catch (err) {
      $('auditList').textContent = `Audit Fehler: ${err.message}`;
    }
  }

  function renderAuditRow(row) {
    const actor = row.actor_login || row.actorLogin || row.actor || 'unbekannt';
    const action = row.action || row.event || row.audit_uid || row.auditUid || 'write';
    const at = row.created_at || row.createdAt || row.ts || '';
    return `<div class="audit-row"><strong>${escapeHtml(action)}</strong><br>${escapeHtml(actor)} · ${escapeHtml(at)}</div>`;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
  }

  fields.forEach((id) => $(id)?.addEventListener('input', () => { $('dirtyState').textContent = 'geaendert'; }));
  $('reloadBtn')?.addEventListener('click', loadConfig);
  $('dryRunBtn')?.addEventListener('click', submitDryRun);
  $('saveBtn')?.addEventListener('click', submitWrite);
  $('auditBtn')?.addEventListener('click', loadAudit);
  $('clearLogBtn')?.addEventListener('click', () => setResult('')); 

  loadConfig();
})();
