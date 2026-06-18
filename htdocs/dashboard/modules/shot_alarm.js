window.ShotAlarmModule = (function(){
  'use strict';

  const api = {
    status: '/api/shot-alarm/status',
    config: '/api/shot-alarm/config',
    texts: '/api/shot-alarm/texts',
    stats: '/api/shot-alarm/stats',
    history: '/api/shot-alarm/history',
    test: '/api/shot-alarm/test',
    manual: '/api/shot-alarm/manual-trigger',
    reset: '/api/shot-alarm/reset-state',
    flush: '/api/shot-alarm/flush-pending',
    resolve: '/api/shot-alarm/resolve-pending',
    shotDone: '/api/shot-alarm/shot-done'
  };

  const state = {
    loading: false,
    error: '',
    notice: '',
    activeTab: 'overview',
    selectedTextCategory: 'chat',
    status: null,
    config: null,
    texts: null,
    stats: null,
    history: null
  };

  let root = null;

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
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
      group: 'community',
      overlayLink: '/overlays/shot_alarm/shot_alarm_overlay.html',
      overlayLabel: 'Shot-Overlay öffnen',
      reload() { return window.ShotAlarmModule?.loadAll?.(true); }
    };
    window.CGN.moduleCatalog.shot_alarm = {
      label: 'Events: Shot-Alarm',
      icon: '🥃',
      enabled: true,
      description: 'Community-Event: Shot-Regeln, Texte, Config, Statistik und Overlay für Engel & Roxxy.'
    };
    const communityItems = window.CGN.sections?.community?.items;
    if (Array.isArray(communityItems) && !communityItems.includes('shot_alarm')) {
      const commandsIndex = communityItems.indexOf('commands');
      if (commandsIndex >= 0) communityItems.splice(commandsIndex + 1, 0, 'shot_alarm');
      else communityItems.push('shot_alarm');
    }
    const controlItems = window.CGN.sections?.control?.items;
    if (Array.isArray(controlItems)) {
      const index = controlItems.indexOf('shot_alarm');
      if (index >= 0) controlItems.splice(index, 1);
    }
  }

  async function loadAll(force) {
    ensurePanel();
    if (!root || !window.CGN) return;
    if (!force && state.status && state.config && state.history && state.texts && state.stats) { render(); return; }
    state.loading = true;
    state.error = '';
    render();
    try {
      const [status, config, history, texts, stats] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.config),
        window.CGN.api(api.history),
        window.CGN.api(api.texts),
        window.CGN.api(api.stats).catch(() => null)
      ]);
      state.status = status;
      state.config = config.config || config;
      state.history = history;
      state.texts = texts;
      state.stats = stats;
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
    current.display.drawDelayMs = Number(root.querySelector('[data-shot-setting="drawDelayMs"]')?.value || 10000);
    current.display.resultHoldMs = Number(root.querySelector('[data-shot-setting="resultHoldMs"]')?.value || 10000);
    current.display.drawHoldMs = Number(root.querySelector('[data-shot-setting="drawHoldMs"]')?.value || current.display.drawDelayMs || 10000);
    current.display.showStatusBar = root.querySelector('[data-shot-setting="showStatusBar"]')?.value !== 'false';
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
    current.rules.payments.providers.kofi.enabled = root.querySelector('[data-shot-setting="kofiEnabled"]')?.value === 'true';
    current.rules.payments.providers.tipeee.enabled = root.querySelector('[data-shot-setting="tipeeeEnabled"]')?.value === 'true';
    current.rules.payments.providers.kofi.eurPerShot = Number(root.querySelector('[data-shot-setting="kofiEurPerShot"]')?.value || 10);
    current.rules.payments.providers.tipeee.eurPerShot = Number(root.querySelector('[data-shot-setting="tipeeeEurPerShot"]')?.value || 10);
    current.rules.payments.providers.kofi.chancePercent = Number(root.querySelector('[data-shot-setting="kofiChancePercent"]')?.value || 50);
    current.rules.payments.providers.tipeee.chancePercent = Number(root.querySelector('[data-shot-setting="tipeeeChancePercent"]')?.value || 50);
    return current;
  }

  async function saveConfig() {
    const next = readConfigFromInputs();
    const saved = await window.CGN.api(api.config, { method: 'POST', body: JSON.stringify(next) });
    state.config = saved.config;
    state.status = saved.status;
    state.notice = 'Shot-Alarm Config gespeichert. Quelle: DB, JSON bleibt Mirror/Fallback.';
    await loadAll(true);
  }

  async function runTest(type, extra = {}) {
    const payload = { type, eventType: type, user: { login: 'testuser', displayName: 'TestUser' }, immediate: extra.immediate === true, ...extra };
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
    if (!confirm('Shot-Alarm Runtime-Verlauf wirklich zurücksetzen? Config und DB-Texte bleiben erhalten.')) return;
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

  async function resolvePending() {
    const result = await window.CGN.api(api.resolve, { method: 'POST', body: '{}' });
    state.status = result.status;
    state.notice = `${result.resolved || 0} Auslosung(en) direkt aufgelöst.`;
    await loadAll(true);
  }

  async function shotDone() {
    const result = await window.CGN.api(api.shotDone, { method: 'POST', body: JSON.stringify({ count: 1, user: 'Dashboard' }) });
    state.status = result.status;
    state.notice = result.done > 0 ? `1 Shot abgehakt. Offen: ${result.shotsOpen}` : 'Keine offenen Shots vorhanden.';
    await loadAll(true);
  }

  async function saveVariant(form) {
    const id = form.querySelector('[name="id"]')?.value || '';
    const payload = {
      action: 'saveVariant',
      variant: {
        id: id ? Number(id) : 0,
        key: form.querySelector('[name="key"]')?.value || '',
        category: form.querySelector('[name="category"]')?.value || state.selectedTextCategory || 'chat',
        value: form.querySelector('[name="value"]')?.value || '',
        enabled: form.querySelector('[name="enabled"]')?.checked !== false,
        weight: Number(form.querySelector('[name="weight"]')?.value || 1),
        description: form.querySelector('[name="description"]')?.value || ''
      }
    };
    await window.CGN.api(api.texts, { method: 'POST', body: JSON.stringify(payload) });
    state.notice = 'Textvariante gespeichert.';
    await loadAll(true);
  }

  async function deleteVariant(id) {
    if (!confirm('Diese Textvariante wirklich löschen?')) return;
    await window.CGN.api(api.texts, { method: 'POST', body: JSON.stringify({ action: 'deleteVariant', id }) });
    state.notice = 'Textvariante gelöscht.';
    await loadAll(true);
  }

  function statusPill(label, value) {
    return `<div class="shot-kpi"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
  }

  function renderOverview() {
    const s = state.status || {};
    const c = s.counts || {};
    const st = state.stats || {};
    return `
      <div class="shot-grid shot-grid-kpi">
        ${statusPill('Modul', s.enabled ? 'Aktiv' : 'Inaktiv')}
        ${statusPill('Bus', s.busAvailable ? 'Verbunden' : 'Nicht verbunden')}
        ${statusPill('Config', s.configSource || '-')}
        ${statusPill('DB', s.database?.storageReady ? 'Bereit' : 'Nicht bereit')}
        ${statusPill('Texte', s.texts?.variantsReady ? 'DB-Varianten' : 'Fallback')}
        ${statusPill('Shots offen', s.shotsOpen ?? c.shotsOpen ?? 0)}
        ${statusPill('Getrunken', s.shotsDrunk ?? c.shotsDrunk ?? 0)}
        ${statusPill('Shots gesamt', s.shotsAddedTotal ?? c.shotsAddedTotal ?? c.shots ?? 0)}
        ${statusPill('Treffer / Fehlwürfe', `${c.hits || 0} / ${c.misses || 0}`)}
        ${statusPill('Auslosungen offen', c.drawPending || 0)}
        ${statusPill('Einzel-Zähler', c.singleSupportCounter || 0)}
        ${statusPill('Chat/Sound Fehler', `${c.chatErrors || 0} / ${c.soundErrors || 0}`)}
      </div>
      <div class="shot-grid shot-grid-two">
        <div class="shot-card"><h3>Letztes Ergebnis</h3>${s.lastResult ? `<pre>${esc(JSON.stringify(s.lastResult, null, 2))}</pre>` : '<p class="shot-muted">Noch kein Ergebnis vorhanden.</p>'}</div>
        <div class="shot-card"><h3>Statistik</h3>${renderStatsMini(st)}</div>
      </div>
    `;
  }

  function renderStatsMini(st) {
    const by = Array.isArray(st.byEventType) ? st.byEventType : [];
    const top = Array.isArray(st.topUsers) ? st.topUsers : [];
    return `
      <p class="shot-muted">History-Quelle: ${esc(state.history?.source || 'runtime')} · Tabelle: ${esc(state.status?.database?.historyTable || '-')}</p>
      <h4>Nach Eventtyp</h4>
      ${by.length ? `<table class="shot-table"><tbody>${by.slice(0, 6).map(row => `<tr><td>${esc(row.eventType)}</td><td>${esc(row.events)} Events</td><td>${esc(row.shots)} Shots</td></tr>`).join('')}</tbody></table>` : '<p class="shot-muted">Noch keine DB-Statistik.</p>'}
      <h4>Top-Auslöser</h4>
      ${top.length ? `<table class="shot-table"><tbody>${top.slice(0, 6).map(row => `<tr><td>${esc(row.displayName)}</td><td>${esc(row.events)} Events</td><td>${esc(row.shots)} Shots</td></tr>`).join('')}</tbody></table>` : '<p class="shot-muted">Noch keine Topliste.</p>'}
    `;
  }

  function renderConfig() {
    const c = state.config || {};
    const rules = c.rules || {};
    const dedupe = c.dedupe || {};
    const display = c.display || {};
    const payments = rules.payments?.providers || {};
    return `
      <div class="shot-card">
        <h3>Community / Events / Shot-Alarm / Config</h3>
        <p class="shot-muted">Config wird über die zentrale DB-Settings-Struktur gespeichert. JSON bleibt Mirror/Fallback.</p>
        <div class="shot-form-grid">
          ${selectField('enabled', 'Modul aktiv', c.enabled !== false)}
          ${selectField('overlayEnabled', 'Overlay aktiv', c.overlayEnabled !== false)}
          ${selectField('soundEnabled', 'Sound aktiv', c.soundEnabled !== false)}
          ${selectField('showStatusBar', 'Dauerhafte Statusleiste', display.showStatusBar !== false)}
          ${selectTarget('targetMode', 'Zielpersonen', c.targetMode || 'engel_roxxy_together')}
          ${inputField('targetLabel', 'Ziel-Text', c.targetLabel || 'Engel & Roxxy')}
          ${inputField('drawDelayMs', 'Auslosungsdauer ms', display.drawDelayMs || 10000, 'number')}
          ${inputField('drawHoldMs', 'Auslosung anzeigen ms', display.drawHoldMs || display.drawDelayMs || 10000, 'number')}
          ${inputField('resultHoldMs', 'Ergebnis anzeigen ms', display.resultHoldMs || display.holdMs || 10000, 'number')}
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
        <p class="shot-muted">Bits: je 1000 Bits = 50/50, je 10000 Bits = 100 %. Sub-Bomben zählen separat.</p>
      </div>
      <div class="shot-card">
        <h3>Ko-fi / Tipeee vorbereitet</h3>
        <div class="shot-form-grid">
          ${selectField('kofiEnabled', 'Ko-fi aktiv', payments.kofi?.enabled !== false)}
          ${inputField('kofiEurPerShot', 'Ko-fi EUR je Wurf', payments.kofi?.eurPerShot || 10, 'number')}
          ${inputField('kofiChancePercent', 'Ko-fi Chance % je 10 EUR', payments.kofi?.chancePercent ?? 50, 'number')}
          ${selectField('tipeeeEnabled', 'Tipeee aktiv', payments.tipeee?.enabled !== false)}
          ${inputField('tipeeeEurPerShot', 'Tipeee EUR je Wurf', payments.tipeee?.eurPerShot || 10, 'number')}
          ${inputField('tipeeeChancePercent', 'Tipeee Chance % je 10 EUR', payments.tipeee?.chancePercent ?? 50, 'number')}
        </div>
        <p class="shot-muted">Payment-Bus-Anbindung kommt separat. Regel ist vorbereitet: je volle 10 EUR = 50/50.</p>
      </div>
      <div class="shot-actions"><button data-shot-action="save">Config speichern</button></div>
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

  function renderTexts() {
    const texts = state.texts || {};
    const categories = Array.isArray(texts.categories) ? texts.categories : [];
    const keys = Array.isArray(texts.keys) ? texts.keys : [];
    const selected = state.selectedTextCategory || categories[0]?.id || 'chat';
    const shown = keys.filter(item => (item.category || 'general') === selected);
    return `
      <div class="shot-card">
        <h3>Community / Events / Shot-Alarm / Texte</h3>
        <p class="shot-muted">Texte laufen über <code>module_text_variants</code>, sind kategorisiert, variantenfähig und werden zufällig/gewichtet gewählt.</p>
        <div class="shot-tabs shot-small-tabs">
          ${categories.map(cat => `<button data-shot-text-category="${esc(cat.id)}" class="${cat.id === selected ? 'active' : ''}">${esc(cat.label)} (${esc(cat.variantCount || 0)})</button>`).join('')}
        </div>
      </div>
      ${shown.map(renderTextKey).join('') || '<div class="shot-card"><p class="shot-muted">Keine Texte in dieser Kategorie.</p></div>'}
      ${renderNewTextForm(selected)}
    `;
  }

  function renderTextKey(item) {
    return `<div class="shot-card shot-text-key"><h3>${esc(item.label || item.key)}</h3><p class="shot-muted"><code>${esc(item.key)}</code> · aktiv ${esc(item.activeCount || 0)} / ${esc(item.totalCount || 0)}</p>${(item.variants || []).map(renderVariantForm).join('')}</div>`;
  }

  function renderVariantForm(variant) {
    return `
      <form class="shot-text-form" data-shot-variant-form>
        <input type="hidden" name="id" value="${esc(variant.id || '')}">
        <input type="hidden" name="key" value="${esc(variant.key || '')}">
        <input type="hidden" name="category" value="${esc(variant.category || 'chat')}">
        <label><span>Text</span><textarea name="value" rows="3">${esc(variant.value || variant.text || '')}</textarea></label>
        <div class="shot-form-row">
          <label><span>Gewichtung</span><input name="weight" type="number" min="1" value="${esc(variant.weight || 1)}"></label>
          <label class="shot-check"><input name="enabled" type="checkbox" ${variant.enabled ? 'checked' : ''}> Aktiv</label>
        </div>
        <label><span>Beschreibung</span><input name="description" type="text" value="${esc(variant.description || '')}"></label>
        <div class="shot-actions"><button type="submit">Speichern</button><button type="button" class="danger" data-shot-delete-variant="${esc(variant.id)}">Löschen</button></div>
      </form>
    `;
  }

  function renderNewTextForm(category) {
    const keys = (state.texts?.keys || []).filter(item => (item.category || 'general') === category);
    const firstKey = keys[0]?.key || 'resultHit';
    return `
      <div class="shot-card">
        <h3>Neue Textvariante</h3>
        <form class="shot-text-form" data-shot-variant-form>
          <input type="hidden" name="id" value="">
          <input type="hidden" name="category" value="${esc(category)}">
          <label><span>Text-Key</span><select name="key">${keys.map(item => `<option value="${esc(item.key)}" ${item.key === firstKey ? 'selected' : ''}>${esc(item.key)}</option>`).join('')}</select></label>
          <label><span>Text</span><textarea name="value" rows="3" placeholder="Neue Altersheim-/Heimleitungs-Variante..."></textarea></label>
          <div class="shot-form-row"><label><span>Gewichtung</span><input name="weight" type="number" min="1" value="1"></label><label class="shot-check"><input name="enabled" type="checkbox" checked> Aktiv</label></div>
          <label><span>Beschreibung</span><input name="description" type="text" value="Dashboard-Variante"></label>
          <div class="shot-actions"><button type="submit">Neue Variante speichern</button></div>
        </form>
      </div>
    `;
  }

  function renderTests() {
    return `
      <div class="shot-card">
        <h3>Tests</h3>
        <p class="shot-muted">Tests laufen über die echte Regellogik. Die Auslosung startet und wird nach Dauer aufgelöst; über „offene Auslosungen jetzt auflösen“ geht es sofort.</p>
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
          <button data-shot-test="kofi" data-amount-eur="25" data-force-roll="0">Ko-fi 25 EUR</button>
          <button data-shot-test="tipeee" data-amount-eur="50" data-force-roll="0">Tipeee 50 EUR</button>
        </div>
      </div>
      <div class="shot-card">
        <h3>Manuell</h3>
        <div class="shot-form-grid"><label><span>Shots</span><input data-shot-manual="shots" type="number" value="1" min="1"></label><label><span>Grund</span><input data-shot-manual="reason" type="text" value="Dashboard-Test"></label></div>
        <div class="shot-actions"><button data-shot-action="manual">Manuell auslösen</button><button class="ghost" data-shot-action="resolve">Offene Auslosungen jetzt auflösen</button><button class="ghost" data-shot-action="shotdone">1 Shot getrunken</button><button class="ghost" data-shot-action="flush">Pending Subs jetzt verarbeiten</button><button class="danger" data-shot-action="reset">Runtime zurücksetzen</button></div>
      </div>
    `;
  }

  function renderHistory() {
    const items = Array.isArray(state.history?.items) ? state.history.items : [];
    if (!items.length) return '<div class="shot-card"><p class="shot-muted">Noch kein Verlauf vorhanden.</p></div>';
    return `<div class="shot-card"><h3>Verlauf / Statistikdaten</h3><p class="shot-muted">Quelle: ${esc(state.history?.source || 'runtime')}</p><table class="shot-table"><thead><tr><th>Zeit</th><th>Phase</th><th>Typ</th><th>User</th><th>Menge</th><th>Regel</th><th>Shots</th><th>Offen</th></tr></thead><tbody>${items.slice(0, 50).map(item => `<tr><td>${esc(item.at)}</td><td>${esc(item.phase || '-')}</td><td>${esc(item.eventType || item.kind)}</td><td>${esc(item.user?.displayName || '-')}</td><td>${esc(item.amountLabel || item.bits || item.total || '-')}</td><td>${esc(item.chanceSummary || item.eventLabel || item.skippedReason || '')}</td><td>${esc(item.shotsAdded ?? item.shots ?? 0)}</td><td>${esc(item.shotsOpenAfter ?? item.shotsOpen ?? '-')}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function renderTabs() {
    const tabs = [
      ['overview', 'Übersicht'],
      ['config', 'Config'],
      ['texts', 'Texte'],
      ['tests', 'Tests'],
      ['history', 'Statistik / Verlauf']
    ];
    return `<div class="shot-tabs">${tabs.map(([id, label]) => `<button data-shot-tab="${id}" class="${state.activeTab === id ? 'active' : ''}">${esc(label)}</button>`).join('')}</div>`;
  }

  function renderCurrentTab() {
    if (state.activeTab === 'config') return renderConfig();
    if (state.activeTab === 'texts') return renderTexts();
    if (state.activeTab === 'tests') return renderTests();
    if (state.activeTab === 'history') return renderHistory();
    return renderOverview();
  }

  function render() {
    ensurePanel();
    if (!root) return;
    root.innerHTML = `
      <div class="shot-header">
        <div><p class="eyebrow">Community / Events</p><h2>🥃 Shot-Alarm</h2><p>Support-Events, Auslosung, Texte, Config und Statistik für Engel & Roxxy.</p></div>
        <div class="shot-actions"><a class="ghost-link" href="/overlays/shot_alarm/shot_alarm_overlay.html" target="_blank">Overlay öffnen</a><button data-shot-action="reload">Aktualisieren</button></div>
      </div>
      ${state.error ? `<div class="shot-alert error">${esc(state.error)}</div>` : ''}
      ${state.notice ? `<div class="shot-alert ok">${esc(state.notice)}</div>` : ''}
      ${renderTabs()}
      ${state.loading ? '<div class="shot-card">Lade Shot-Alarm...</div>' : renderCurrentTab()}
    `;
    bindActions();
  }

  function bindActions() {
    root.querySelector('[data-shot-action="reload"]')?.addEventListener('click', () => loadAll(true));
    root.querySelector('[data-shot-action="save"]')?.addEventListener('click', () => saveConfig().catch(err => { state.error = err.message || String(err); render(); }));
    root.querySelector('[data-shot-action="manual"]')?.addEventListener('click', () => manualTrigger().catch(err => { state.error = err.message || String(err); render(); }));
    root.querySelector('[data-shot-action="reset"]')?.addEventListener('click', () => resetState().catch(err => { state.error = err.message || String(err); render(); }));
    root.querySelector('[data-shot-action="flush"]')?.addEventListener('click', () => flushPending().catch(err => { state.error = err.message || String(err); render(); }));
    root.querySelector('[data-shot-action="resolve"]')?.addEventListener('click', () => resolvePending().catch(err => { state.error = err.message || String(err); render(); }));
    root.querySelector('[data-shot-action="shotdone"]')?.addEventListener('click', () => shotDone().catch(err => { state.error = err.message || String(err); render(); }));
    root.querySelectorAll('[data-shot-tab]').forEach(btn => btn.addEventListener('click', () => { state.activeTab = btn.dataset.shotTab || 'overview'; render(); }));
    root.querySelectorAll('[data-shot-text-category]').forEach(btn => btn.addEventListener('click', () => { state.selectedTextCategory = btn.dataset.shotTextCategory || 'chat'; render(); }));
    root.querySelectorAll('[data-shot-variant-form]').forEach(form => form.addEventListener('submit', ev => { ev.preventDefault(); saveVariant(form).catch(err => { state.error = err.message || String(err); render(); }); }));
    root.querySelectorAll('[data-shot-delete-variant]').forEach(btn => btn.addEventListener('click', () => deleteVariant(btn.dataset.shotDeleteVariant).catch(err => { state.error = err.message || String(err); render(); })));
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
