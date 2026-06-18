window.ShotAlarmModule = (function(){
  'use strict';

  const api = {
    status: '/api/shot-alarm/status',
    config: '/api/shot-alarm/config',
    history: '/api/shot-alarm/history',
    test: '/api/shot-alarm/test',
    manual: '/api/shot-alarm/manual-trigger',
    reset: '/api/shot-alarm/reset-state',
    flush: '/api/shot-alarm/flush-pending'
  };

  const state = {
    loading: false,
    error: '',
    notice: '',
    status: null,
    config: null,
    history: null
  };

  let root = null;

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function ensurePanel() {
    root = document.getElementById('shotAlarmModule');
    if (root) return root;
    const main = document.querySelector('.main');
    if (!main) return null;
    root = document.createElement('section');
    root.id = 'shotAlarmModule';
    root.className = 'dashboard-module shot-alarm-admin';
    root.dataset.modulePanel = 'shot_alarm';
    root.hidden = true;
    main.appendChild(root);
    return root;
  }

  function registerWithDashboard() {
    if (!window.CGN) return;
    window.CGN.modules.shot_alarm = {
      title: 'Shot-Alarm',
      panelId: 'shotAlarmModule',
      group: 'control',
      overlayLink: '/overlays/shot_alarm/shot_alarm_overlay.html',
      overlayLabel: 'Shot-Overlay öffnen',
      reload() { return window.ShotAlarmModule?.loadAll?.(true); }
    };
    window.CGN.moduleCatalog.shot_alarm = {
      label: 'Shot-Alarm',
      icon: '🥃',
      enabled: true,
      description: 'Shot-Regeln für Engel & Roxxy: Subs/Resubs/GiftSubs mit 5er-/10er-Zähler, Sub-Bomben, Bits und später Ko-fi/Tipeee.'
    };
    const items = window.CGN.sections?.control?.items;
    if (Array.isArray(items) && !items.includes('shot_alarm')) {
      const twitchEventsIndex = items.indexOf('twitch_events');
      if (twitchEventsIndex >= 0) items.splice(twitchEventsIndex + 1, 0, 'shot_alarm');
      else items.push('shot_alarm');
    }
  }

  async function loadAll(force) {
    ensurePanel();
    if (!root || !window.CGN) return;
    if (!force && state.status && state.config && state.history) { render(); return; }
    state.loading = true;
    state.error = '';
    render();
    try {
      const [status, config, history] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.config),
        window.CGN.api(api.history)
      ]);
      state.status = status;
      state.config = config.config || config;
      state.history = history;
      state.loading = false;
      state.error = '';
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }
    render();
  }

  function readConfigFromInputs() {
    const current = JSON.parse(JSON.stringify(state.config || {}));
    current.enabled = root.querySelector('[data-shot-setting="enabled"]')?.value === 'true';
    current.overlayEnabled = root.querySelector('[data-shot-setting="overlayEnabled"]')?.value === 'true';
    current.soundEnabled = root.querySelector('[data-shot-setting="soundEnabled"]')?.value === 'true';
    current.targetMode = root.querySelector('[data-shot-setting="targetMode"]')?.value || 'engel_roxxy_together';
    current.targetLabel = root.querySelector('[data-shot-setting="targetLabel"]')?.value || 'Engel & Roxxy';
    current.display = current.display || {};
    current.display.holdMs = Number(root.querySelector('[data-shot-setting="holdMs"]')?.value || 12000);
    current.rules = current.rules || {};
    current.rules.singleSubChancePercent = Number(root.querySelector('[data-shot-setting="singleSubChancePercent"]')?.value || 20);
    current.rules.resubChancePercent = Number(root.querySelector('[data-shot-setting="resubChancePercent"]')?.value || 20);
    current.rules.singleGiftSubChancePercent = Number(root.querySelector('[data-shot-setting="singleGiftSubChancePercent"]')?.value || 20);
    current.rules.giftBombFiveChancePercent = Number(root.querySelector('[data-shot-setting="giftBombFiveChancePercent"]')?.value || 50);
    current.rules.singleSupportFiveChancePercent = Number(root.querySelector('[data-shot-setting="singleSupportFiveChancePercent"]')?.value || 50);
    current.rules.singleSupportTenChancePercent = Number(root.querySelector('[data-shot-setting="singleSupportTenChancePercent"]')?.value || 100);
    current.dedupe = current.dedupe || {};
    current.dedupe.subscribeResubBufferEnabled = root.querySelector('[data-shot-setting="subscribeResubBufferEnabled"]')?.value === 'true';
    current.dedupe.subscribeResubBufferMs = Number(root.querySelector('[data-shot-setting="subscribeResubBufferMs"]')?.value || 60000);
    current.rules.payments = current.rules.payments || { enabled: true, providers: {} };
    current.rules.payments.providers = current.rules.payments.providers || {};
    current.rules.payments.providers.kofi = current.rules.payments.providers.kofi || {};
    current.rules.payments.providers.tipeee = current.rules.payments.providers.tipeee || {};
    current.rules.payments.providers.kofi.eurPerShot = Number(root.querySelector('[data-shot-setting="kofiEurPerShot"]')?.value || 10);
    current.rules.payments.providers.tipeee.eurPerShot = Number(root.querySelector('[data-shot-setting="tipeeeEurPerShot"]')?.value || 10);
    current.rules.payments.providers.kofi.enabled = root.querySelector('[data-shot-setting="kofiEnabled"]')?.value === 'true';
    current.rules.payments.providers.tipeee.enabled = root.querySelector('[data-shot-setting="tipeeeEnabled"]')?.value === 'true';
    return current;
  }

  async function saveConfig() {
    const next = readConfigFromInputs();
    const saved = await window.CGN.api(api.config, { method: 'POST', body: JSON.stringify(next) });
    state.config = saved.config;
    state.status = saved.status;
    state.notice = 'Shot-Alarm Einstellungen gespeichert.';
    await loadAll(true);
  }

  async function runTest(type, extra = {}) {
    const payload = { type, eventType: type, user: { login: 'testuser', displayName: 'TestUser' }, ...extra };
    const result = await window.CGN.api(api.test, { method: 'POST', body: JSON.stringify(payload) });
    state.status = result.status;
    state.notice = `Test ausgeführt: ${type}`;
    await loadAll(true);
  }

  async function manualTrigger() {
    const shots = Number(root.querySelector('[data-shot-manual="shots"]')?.value || 1);
    const reason = root.querySelector('[data-shot-manual="reason"]')?.value || 'Dashboard-Test';
    const result = await window.CGN.api(api.manual, { method: 'POST', body: JSON.stringify({ shots, reason }) });
    state.status = result.status;
    state.notice = 'Manueller Shot-Alarm ausgelöst.';
    await loadAll(true);
  }

  async function resetState() {
    if (!confirm('Shot-Alarm Runtime-Verlauf wirklich zurücksetzen? Config bleibt erhalten.')) return;
    const result = await window.CGN.api(api.reset, { method: 'POST', body: '{}' });
    state.status = result.status;
    state.notice = 'Runtime-State zurückgesetzt.';
    await loadAll(true);
  }

  async function flushPending() {
    const result = await window.CGN.api(api.flush, { method: 'POST', body: '{}' });
    state.status = result.status;
    state.notice = `${result.flushed || 0} Pending-Sub(s) verarbeitet.`;
    await loadAll(true);
  }

  function statusPill(label, value) {
    return `<div class="shot-kpi"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
  }

  function renderOverview() {
    const s = state.status || {};
    const c = s.counts || {};
    return `
      <div class="shot-grid shot-grid-kpi">
        ${statusPill('Modul', s.enabled ? 'Aktiv' : 'Inaktiv')}
        ${statusPill('Bus', s.busAvailable ? 'Verbunden' : 'Nicht verbunden')}
        ${statusPill('Shots gesamt', c.shots || 0)}
        ${statusPill('Treffer / Fehlwürfe', `${c.hits || 0} / ${c.misses || 0}`)}
        ${statusPill('Einzel-Zähler', c.singleSupportCounter || 0)}
        ${statusPill('Pending Subs', c.pending || 0)}
        ${statusPill('Sound-Fehler', c.soundErrors || 0)}
      </div>
      <div class="shot-card">
        <h3>Letzter Shot</h3>
        ${s.lastShot ? `<pre>${esc(JSON.stringify(s.lastShot, null, 2))}</pre>` : '<p class="shot-muted">Noch kein Shot ausgelöst.</p>'}
      </div>
    `;
  }

  function renderSettings() {
    const c = state.config || {};
    const rules = c.rules || {};
    const dedupe = c.dedupe || {};
    const display = c.display || {};
    const payments = rules.payments?.providers || {};
    return `
      <div class="shot-card">
        <h3>Basis</h3>
        <div class="shot-form-grid">
          ${selectField('enabled', 'Modul aktiv', c.enabled !== false)}
          ${selectField('overlayEnabled', 'Overlay aktiv', c.overlayEnabled !== false)}
          ${selectField('soundEnabled', 'Sound aktiv', c.soundEnabled !== false)}
          ${selectTarget('targetMode', 'Zielpersonen', c.targetMode || 'engel_roxxy_together')}
          ${inputField('targetLabel', 'Ziel-Text', c.targetLabel || 'Engel & Roxxy')}
          ${inputField('holdMs', 'Overlay Dauer ms', display.holdMs || 12000, 'number')}
        </div>
      </div>
      <div class="shot-card">
        <h3>Twitch-Regeln</h3>
        <div class="shot-form-grid">
          ${inputField('singleSubChancePercent', 'Sub normal %', rules.singleSubChancePercent ?? 20, 'number')}
          ${inputField('resubChancePercent', 'Resub normal %', rules.resubChancePercent ?? 20, 'number')}
          ${inputField('singleGiftSubChancePercent', 'GiftSub normal %', rules.singleGiftSubChancePercent ?? 20, 'number')}
          ${inputField('singleSupportFiveChancePercent', 'jeder 5. Einzel-Sub/Resub/GiftSub %', rules.singleSupportFiveChancePercent ?? 50, 'number')}
          ${inputField('singleSupportTenChancePercent', 'jeder 10. Einzel-Sub/Resub/GiftSub %', rules.singleSupportTenChancePercent ?? 100, 'number')}
          ${inputField('giftBombFiveChancePercent', '5er Sub-Bombe %', rules.giftBombFiveChancePercent ?? 50, 'number')}
          ${selectField('subscribeResubBufferEnabled', 'Sub/Resub Puffer', dedupe.subscribeResubBufferEnabled !== false)}
          ${inputField('subscribeResubBufferMs', 'Puffer ms', dedupe.subscribeResubBufferMs || 60000, 'number')}
        </div>
        <p class="shot-muted">Einzelne Subs/Resubs/GiftSubs zählen hoch: normal 20 %, jeder 5. 50/50, jeder 10. 100 %. Sub-Bomben zählen separat: 5er 50/50, 10er = 1 Shot, 100er = 10 Shots.</p>
      </div>
      <div class="shot-card">
        <h3>Ko-fi / Tipeee vorbereitet</h3>
        <div class="shot-form-grid">
          ${selectField('kofiEnabled', 'Ko-fi aktiv', payments.kofi?.enabled !== false)}
          ${inputField('kofiEurPerShot', 'Ko-fi EUR je Shot', payments.kofi?.eurPerShot || 10, 'number')}
          ${selectField('tipeeeEnabled', 'Tipeee aktiv', payments.tipeee?.enabled !== false)}
          ${inputField('tipeeeEurPerShot', 'Tipeee EUR je Shot', payments.tipeee?.eurPerShot || 10, 'number')}
        </div>
        <p class="shot-muted">Die Payment-Module senden aktuell noch keine neutralen Payment-Bus-Events. Die Regel ist vorbereitet: je volle 10 EUR = 50/50 auf 1 Shot.</p>
        <p class="shot-muted">Bits: je 1000 Bits = 50/50, je 10000 Bits = 100 %.</p>
      </div>
      <div class="shot-actions"><button data-shot-action="save">Speichern</button></div>
    `;
  }

  function inputField(key, label, value, type = 'text') {
    return `<label><span>${esc(label)}</span><input data-shot-setting="${esc(key)}" type="${esc(type)}" value="${esc(value)}"></label>`;
  }

  function selectField(key, label, value) {
    return `<label><span>${esc(label)}</span><select data-shot-setting="${esc(key)}"><option value="true" ${value ? 'selected' : ''}>Aktiv</option><option value="false" ${!value ? 'selected' : ''}>Inaktiv</option></select></label>`;
  }

  function selectTarget(key, label, value) {
    const options = [
      ['engel_roxxy_together', 'Engel & Roxxy gemeinsam'],
      ['engel_only', 'Nur Engel'],
      ['roxxy_only', 'Nur Roxxy'],
      ['random_engel_roxxy', 'Zufällig Engel/Roxxy']
    ];
    return `<label><span>${esc(label)}</span><select data-shot-setting="${esc(key)}">${options.map(([v,l]) => `<option value="${esc(v)}" ${v === value ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;
  }

  function renderTests() {
    return `
      <div class="shot-card">
        <h3>Tests</h3>
        <p class="shot-muted">Tests laufen über die Shot-Alarm-Regellogik. Bei Treffer wird Overlay + Sound ausgelöst.</p>
        <div class="shot-test-grid">
          <button data-shot-test="sub" data-force-roll="0">Einzel-Sub Treffer</button>
          <button data-shot-test="resub" data-force-roll="0">Resub Treffer</button>
          <button data-shot-test="gift_sub" data-total="1" data-force-roll="0">Einzel-GiftSub Treffer</button>
          <button data-shot-test="sub" data-force-roll="99">Normaler Sub Fehlwurf</button>
          <button data-shot-test="gift_bomb" data-total="5" data-force-roll="0">5er Bombe Treffer</button>
          <button data-shot-test="gift_bomb" data-total="10">10er Bombe</button>
          <button data-shot-test="gift_bomb" data-total="100">100er Bombe</button>
          <button data-shot-test="bits" data-bits="1000" data-force-roll="0">1000 Bits 50/50 Treffer</button>
          <button data-shot-test="bits" data-bits="9000" data-force-roll="0">9000 Bits = 9x 50/50</button>
          <button data-shot-test="bits" data-bits="10000">10000 Bits = 1x 100%</button>
          <button data-shot-test="bits" data-bits="25000" data-force-roll="0">25000 Bits = 2x 100% + 5x 50/50</button>
          <button data-shot-test="kofi" data-amount-eur="25">Ko-fi 25 EUR</button>
          <button data-shot-test="tipeee" data-amount-eur="50">Tipeee 50 EUR</button>
        </div>
      </div>
      <div class="shot-card">
        <h3>Manuell</h3>
        <div class="shot-form-grid">
          <label><span>Shots</span><input data-shot-manual="shots" type="number" value="1" min="1"></label>
          <label><span>Grund</span><input data-shot-manual="reason" type="text" value="Dashboard-Test"></label>
        </div>
        <div class="shot-actions"><button data-shot-action="manual">Manuell auslösen</button><button class="ghost" data-shot-action="flush">Pending Subs jetzt verarbeiten</button><button class="danger" data-shot-action="reset">Runtime zurücksetzen</button></div>
      </div>
    `;
  }

  function renderHistory() {
    const items = Array.isArray(state.history?.items) ? state.history.items : [];
    if (!items.length) return '<div class="shot-card"><p class="shot-muted">Noch kein Verlauf vorhanden.</p></div>';
    return `<div class="shot-card"><h3>Verlauf</h3><table class="shot-table"><thead><tr><th>Zeit</th><th>Typ</th><th>User</th><th>Chance</th><th>Roll</th><th>Shots</th><th>Grund</th></tr></thead><tbody>${items.slice(0, 30).map(item => `<tr><td>${esc(item.at)}</td><td>${esc(item.eventType || item.kind)}</td><td>${esc(item.user?.displayName || '-')}</td><td>${esc(item.chancePercent ?? '-')}</td><td>${esc(item.rollValue ?? '-')}</td><td>${esc(item.shots ?? 0)}</td><td>${esc(item.eventLabel || item.skippedReason || '')}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function render() {
    ensurePanel();
    if (!root) return;
    root.innerHTML = `
      <div class="shot-header">
        <div><p class="eyebrow">Events</p><h2>🥃 Shot-Alarm</h2><p>Support-Events lösen nach Regeln Shots für Engel & Roxxy aus.</p></div>
        <div class="shot-actions"><a class="ghost-link" href="/overlays/shot_alarm/shot_alarm_overlay.html" target="_blank">Overlay öffnen</a><button data-shot-action="reload">Aktualisieren</button></div>
      </div>
      ${state.error ? `<div class="shot-alert error">${esc(state.error)}</div>` : ''}
      ${state.notice ? `<div class="shot-alert ok">${esc(state.notice)}</div>` : ''}
      ${state.loading ? '<div class="shot-card">Lade Shot-Alarm...</div>' : `${renderOverview()}${renderSettings()}${renderTests()}${renderHistory()}`}
    `;
    bindActions();
  }

  function bindActions() {
    root.querySelector('[data-shot-action="reload"]')?.addEventListener('click', () => loadAll(true));
    root.querySelector('[data-shot-action="save"]')?.addEventListener('click', () => saveConfig().catch(err => { state.error = err.message || String(err); render(); }));
    root.querySelector('[data-shot-action="manual"]')?.addEventListener('click', () => manualTrigger().catch(err => { state.error = err.message || String(err); render(); }));
    root.querySelector('[data-shot-action="reset"]')?.addEventListener('click', () => resetState().catch(err => { state.error = err.message || String(err); render(); }));
    root.querySelector('[data-shot-action="flush"]')?.addEventListener('click', () => flushPending().catch(err => { state.error = err.message || String(err); render(); }));
    root.querySelectorAll('[data-shot-test]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.shotTest;
        const extra = {};
        if (btn.dataset.total) extra.total = Number(btn.dataset.total);
        if (btn.dataset.bits) extra.bits = Number(btn.dataset.bits);
        if (btn.dataset.amountEur) extra.amountEur = Number(btn.dataset.amountEur);
        if (btn.dataset.forceRoll) extra.forceRoll = Number(btn.dataset.forceRoll);
        runTest(type, extra).catch(err => { state.error = err.message || String(err); render(); });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensurePanel();
    registerWithDashboard();
  });

  return { loadAll, render, registerWithDashboard };
})();
