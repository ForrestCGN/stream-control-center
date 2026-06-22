(function(){
  'use strict';

  const MODULE = 'hypetrain';
  const panelId = 'hypetrainModule';
  const state = {
    loaded: false,
    loading: false,
    tab: 'overview',
    status: null,
    config: null,
    texts: null,
    stats: null,
    preview: null,
    lastError: '',
    lastSavedAt: '',
    lastTestAt: ''
  };

  const tabs = [
    ['overview', 'Übersicht'],
    ['config', 'Config'],
    ['texts', 'Texte'],
    ['stats', 'Statistik'],
    ['tests', 'Tests']
  ];

  function esc(value){
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function bool(value){
    return value === true || value === 1 || value === '1' || value === 'true' || value === 'on';
  }

  function api(path, options){
    if (window.CGN?.api) return window.CGN.api(path, options || {});
    return fetch(path, options || {}).then(r => r.json());
  }

  function panel(){
    return document.getElementById(panelId);
  }

  function statusBadge(ok, goodText, badText){
    return `<span class="ht-badge ${ok ? 'ok' : 'warn'}">${esc(ok ? goodText : badText)}</span>`;
  }

  function numberValue(value){
    const n = Number(value || 0);
    return Number.isFinite(n) ? n : 0;
  }

  function renderTabs(){
    return `<div class="ht-tabs">${tabs.map(([id, label]) => `<button type="button" class="ht-tab ${state.tab === id ? 'active' : ''}" data-ht-tab="${id}">${esc(label)}</button>`).join('')}</div>`;
  }

  function renderHero(){
    const s = state.status || {};
    const cfg = s.config || {};
    const runtime = s.runtime || {};
    const counters = runtime.counters || {};
    return `
      <div class="ht-hero glass">
        <div>
          <div class="ht-kicker">Community / HypeTrain</div>
          <h2>🚂 HypeTrain Control</h2>
          <p>DB-Status, Config, Texte, Statistik und Preview-Tests für das neue HypeTrain-Fachmodul.</p>
        </div>
        <div class="ht-hero-grid">
          <div class="ht-mini"><span>Version</span><strong>${esc(s.moduleVersion || '-')}</strong><small>${esc(s.moduleBuild || '-')}</small></div>
          <div class="ht-mini"><span>Datenbank</span><strong>${esc(s.database?.adapter || '-')}</strong><small>Schema ${esc(s.database?.schemaVersion ?? '-')}</small></div>
          <div class="ht-mini"><span>Bus</span><strong>${s.bus?.registered ? 'registriert' : 'nicht registriert'}</strong><small>${esc((s.bus?.subscriptions || []).length)} Subscriptions</small></div>
          <div class="ht-mini"><span>Previews</span><strong>${esc(counters.previewsGenerated || 0)}</strong><small>DB-Writes ${esc(counters.dbWrites || 0)}</small></div>
        </div>
      </div>
      <div class="ht-status-row">
        ${statusBadge(s.ok !== false, 'Status OK', 'Status prüfen')}
        ${statusBadge(cfg.enabled !== false, 'Modul aktiv', 'Modul inaktiv')}
        ${statusBadge(cfg.includeContributorNames !== true, 'Keine Namen', 'Namen aktiv')}
        ${statusBadge(cfg.includeTopContributors !== true, 'Keine Top-Unterstützer', 'Top-Unterstützer aktiv')}
        ${statusBadge(cfg.raidContextEnabled !== false, 'Raid-Kontext aktiv', 'Raid-Kontext aus')}
      </div>
    `;
  }

  function renderOverview(){
    const s = state.status || {};
    const cfg = s.config || {};
    const runtime = s.runtime || {};
    const stats = s.stats || state.stats?.totals || {};
    return `
      ${renderHero()}
      <div class="ht-grid two">
        <section class="ht-card glass">
          <h3>Aktuelle Konfiguration</h3>
          <dl class="ht-dl">
            <dt>Discord</dt><dd>${cfg.discordEnabled ? 'aktiv' : 'aus / vorbereitet'}</dd>
            <dt>Tagebuch</dt><dd>${cfg.diaryEnabled ? 'aktiv' : 'aus / vorbereitet'}</dd>
            <dt>Rekord-Sound</dt><dd>${cfg.recordSoundEnabled ? 'aktiv' : 'aus / vorbereitet'}</dd>
            <dt>HypeTrain-Punkte</dt><dd>${cfg.includeHypeTrainPoints ? 'werden angezeigt' : 'ausgeblendet'}</dd>
            <dt>Namen</dt><dd>${cfg.includeContributorNames ? 'aktiv' : 'aus Datenschutzgründen aus'}</dd>
          </dl>
        </section>
        <section class="ht-card glass">
          <h3>Statistik kurz</h3>
          <div class="ht-stat-grid">
            ${miniStat('Runs', stats.runs)}
            ${miniStat('Rekorde', stats.records)}
            ${miniStat('Höchstes Level', stats.highestLevel)}
            ${miniStat('Höchste Punkte', stats.highestPoints)}
            ${miniStat('Bits', stats.bits)}
            ${miniStat('GiftSubs', stats.giftSubs)}
          </div>
        </section>
        <section class="ht-card glass wide">
          <h3>Runtime</h3>
          <dl class="ht-dl compact">
            <dt>Aktueller Train</dt><dd>${esc(runtime.currentTrainId || '-')}</dd>
            <dt>Letzter Fehler</dt><dd>${esc(runtime.lastError || '-')}</dd>
            <dt>Letzter Raid</dt><dd>${runtime.lastRaid ? `<pre>${esc(JSON.stringify(runtime.lastRaid, null, 2))}</pre>` : '-'}</dd>
            <dt>Letzte Preview</dt><dd>${runtime.lastPreview?.message ? `<pre>${esc(runtime.lastPreview.message)}</pre>` : '-'}</dd>
          </dl>
        </section>
      </div>
    `;
  }

  function miniStat(label, value){
    return `<div class="ht-stat"><span>${esc(label)}</span><strong>${esc(value ?? 0)}</strong></div>`;
  }

  function settingInput(setting){
    const key = setting.key || '';
    const type = setting.type || setting.valueType || 'string';
    const value = setting.value;
    const data = `data-setting-key="${esc(key)}" data-setting-type="${esc(type)}"`;
    if (type === 'boolean') return `<input type="checkbox" ${data} ${bool(value) ? 'checked' : ''}>`;
    if (type === 'number' || type === 'integer') return `<input type="number" ${data} value="${esc(value ?? 0)}">`;
    return `<input type="text" ${data} value="${esc(value ?? '')}">`;
  }

  function renderConfig(){
    const cfg = state.config || {};
    const categories = Array.isArray(cfg.categories) ? cfg.categories : [];
    const settings = Array.isArray(cfg.settings) ? cfg.settings : [];
    const grouped = categories.length ? categories : buildCategories(settings);
    return `
      <div class="ht-card glass">
        <div class="ht-card-head">
          <div><h3>Config</h3><p>DB-basierte HypeTrain-Einstellungen. Medien-Uploads bleiben bewusst im Media-System.</p></div>
          <button type="button" class="primary" data-ht-action="save-config">Speichern</button>
        </div>
        <div class="ht-note">Sounds, Videos und Grafiken werden später über das zentrale Media-System-Fenster/Modal ausgewählt. Keine eigene Upload-Insel im HypeTrain-Modul.</div>
        <div class="ht-config-grid">
          ${grouped.map(cat => renderCategory(cat)).join('') || '<p>Keine Settings gefunden.</p>'}
        </div>
      </div>
    `;
  }

  function buildCategories(settings){
    const map = new Map();
    for (const setting of settings) {
      const category = setting.category || 'Allgemein';
      if (!map.has(category)) map.set(category, { name: category, settings: [] });
      map.get(category).settings.push(setting);
    }
    return [...map.values()];
  }

  function renderCategory(cat){
    const rows = Array.isArray(cat.settings) ? cat.settings : [];
    return `
      <section class="ht-config-cat">
        <h4>${esc(cat.name || cat.category || 'Allgemein')}</h4>
        ${rows.map(setting => `
          <label class="ht-setting">
            <span><strong>${esc(setting.label || setting.key)}</strong><small>${esc(setting.description || setting.key)}</small></span>
            ${settingInput(setting)}
          </label>
        `).join('')}
      </section>
    `;
  }

  function extractSettings(){
    const out = {};
    panel()?.querySelectorAll('[data-setting-key]').forEach(input => {
      const key = input.dataset.settingKey;
      const type = input.dataset.settingType || 'string';
      if (!key) return;
      if (type === 'boolean') out[key] = !!input.checked;
      else if (type === 'number' || type === 'integer') out[key] = Number(input.value || 0);
      else out[key] = input.value;
    });
    return out;
  }

  function renderTexts(){
    const payload = state.texts?.texts || state.texts || {};
    const rows = Array.isArray(payload.rows) ? payload.rows : (Array.isArray(payload.items) ? payload.items : []);
    const categories = Array.isArray(payload.categories) ? payload.categories : [];
    return `
      <div class="ht-card glass">
        <h3>Texte</h3>
        <p>Textvarianten kommen aus dem DB-Textsystem. HT2.2 zeigt sie zuerst kontrolliert an; der volle Editor kommt später sauber über den bestehenden Texteditor-Standard.</p>
        ${categories.length ? `<div class="ht-status-row">${categories.map(cat => `<span class="ht-badge">${esc(cat.label || cat.name || cat.key || cat)}</span>`).join('')}</div>` : ''}
        <div class="ht-table-wrap">
          <table class="ht-table">
            <thead><tr><th>Key</th><th>Kategorie</th><th>Text / Varianten</th></tr></thead>
            <tbody>
              ${rows.map(row => textRow(row)).join('') || '<tr><td colspan="3">Keine Textdaten gefunden.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function textRow(row){
    const key = row.key || row.textKey || row.text_key || row.name || '';
    const cat = row.category || row.categoryName || '';
    let text = row.text || row.value || row.defaultText || row.default_text || '';
    if (!text && Array.isArray(row.variants)) text = row.variants.map(v => v.text || v.value || v.body || '').filter(Boolean).join('\n---\n');
    if (!text) text = JSON.stringify(row, null, 2);
    return `<tr><td><code>${esc(key)}</code></td><td>${esc(cat)}</td><td><pre>${esc(text)}</pre></td></tr>`;
  }

  function renderStats(){
    const stats = state.stats || {};
    const totals = stats.totals || state.status?.stats || {};
    const recent = Array.isArray(stats.recentRuns) ? stats.recentRuns : (Array.isArray(stats.runs) ? stats.runs : []);
    return `
      <div class="ht-card glass">
        <h3>Statistik</h3>
        <div class="ht-stat-grid wide-stats">
          ${miniStat('Runs', totals.runs)}
          ${miniStat('Rekorde', totals.records)}
          ${miniStat('Level-Rekorde', totals.levelRecords)}
          ${miniStat('Punkte-Rekorde', totals.pointsRecords)}
          ${miniStat('Höchstes Level', totals.highestLevel)}
          ${miniStat('Höchste Punkte', totals.highestPoints)}
          ${miniStat('Bits', totals.bits)}
          ${miniStat('Subs', totals.subs)}
          ${miniStat('Resubs', totals.resubs)}
          ${miniStat('GiftSubs', totals.giftSubs)}
          ${miniStat('Raid-Runs', totals.raidRuns)}
        </div>
        <div class="ht-table-wrap">
          <table class="ht-table">
            <thead><tr><th>Train</th><th>Level</th><th>Punkte</th><th>Bits</th><th>Subs</th><th>GiftSubs</th><th>Rekord</th></tr></thead>
            <tbody>
              ${recent.map(run => `<tr><td>${esc(run.train_id || run.trainId || '-')}</td><td>${esc(run.level || 0)}</td><td>${esc(run.points_total || run.pointsTotal || 0)}</td><td>${esc(run.bits_total || run.bits || 0)}</td><td>${esc((run.subs_total || 0) + (run.resubs_total || 0))}</td><td>${esc(run.gift_subs_total || run.giftSubs || 0)}</td><td>${run.record_reached || run.recordReached ? '🏆' : '-'}</td></tr>`).join('') || '<tr><td colspan="7">Noch keine Runs gespeichert.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderTests(){
    const preview = state.preview || state.status?.runtime?.lastPreview || null;
    return `
      <div class="ht-card glass">
        <h3>Tests</h3>
        <p>Alle Tests sind Preview-/synthetische Tests. Produktive Discord-/Tagebuch-Sends werden hier nicht ausgelöst.</p>
        <div class="ht-test-grid">
          <button type="button" data-ht-action="preview-normal">Normale Preview</button>
          <button type="button" data-ht-action="preview-raid-record">Raid + Rekord Preview</button>
          <button type="button" data-ht-action="synthetic-test">Synthetischen DB-Test schreiben</button>
          <button type="button" data-ht-action="reload">Status neu laden</button>
        </div>
        <div class="ht-preview-box">
          <h4>Letzte Preview</h4>
          ${preview?.message ? `<pre>${esc(preview.message)}</pre>` : '<p>Noch keine Preview in diesem Dashboardlauf.</p>'}
        </div>
      </div>
    `;
  }

  function render(){
    const el = panel();
    if (!el) return;
    if (state.loading && !state.loaded) {
      el.innerHTML = '<div class="ht-card glass"><h2>🚂 HypeTrain</h2><p>Lade HypeTrain-Daten...</p></div>';
      return;
    }
    const body = state.tab === 'config' ? renderConfig()
      : state.tab === 'texts' ? renderTexts()
      : state.tab === 'stats' ? renderStats()
      : state.tab === 'tests' ? renderTests()
      : renderOverview();
    el.innerHTML = `
      <div class="hypetrain-shell">
        <div class="ht-topline">
          <div><h1>🚂 HypeTrain</h1><p>DB-basiertes HypeTrain-Fachmodul für Status, Config, Texte, Statistik und Tests.</p></div>
          <button type="button" data-ht-action="reload">Aktualisieren</button>
        </div>
        ${renderTabs()}
        ${state.lastError ? `<div class="ht-error">${esc(state.lastError)}</div>` : ''}
        ${state.lastSavedAt ? `<div class="ht-success">Gespeichert: ${esc(state.lastSavedAt)}</div>` : ''}
        ${body}
      </div>
    `;
    bind();
  }

  function bind(){
    const el = panel();
    if (!el) return;
    el.querySelectorAll('[data-ht-tab]').forEach(btn => btn.addEventListener('click', () => {
      state.tab = btn.dataset.htTab || 'overview';
      state.lastSavedAt = '';
      render();
    }));
    el.querySelectorAll('[data-ht-action]').forEach(btn => btn.addEventListener('click', () => handleAction(btn.dataset.htAction || '')));
  }

  async function loadAll(force){
    if (state.loading && !force) return;
    state.loading = true;
    state.lastError = '';
    render();
    try {
      const [status, config, texts, stats] = await Promise.all([
        api('/api/hypetrain/status'),
        api('/api/hypetrain/config'),
        api('/api/hypetrain/texts').catch(err => ({ ok:false, error: err.message })),
        api('/api/hypetrain/stats').catch(err => ({ ok:false, error: err.message }))
      ]);
      state.status = status;
      state.config = config;
      state.texts = texts;
      state.stats = stats;
      state.loaded = true;
    } catch (err) {
      state.lastError = err.message || String(err);
    } finally {
      state.loading = false;
      render();
    }
  }

  async function saveConfig(){
    const settings = extractSettings();
    state.lastError = '';
    try {
      await api('/api/hypetrain/config', { method: 'POST', body: JSON.stringify({ settings }) });
      state.lastSavedAt = new Date().toLocaleTimeString('de-DE');
      await loadAll(true);
      state.tab = 'config';
    } catch (err) {
      state.lastError = err.message || String(err);
      render();
    }
  }

  async function makePreview(params){
    state.lastError = '';
    try {
      const url = '/api/hypetrain/preview?' + new URLSearchParams(params).toString();
      const result = await api(url);
      state.preview = result.preview;
      state.tab = 'tests';
      render();
    } catch (err) {
      state.lastError = err.message || String(err);
      render();
    }
  }

  async function syntheticTest(){
    state.lastError = '';
    try {
      const body = { raid:true, record:true, level:5, points:9600, bits:3500, subs:3, giftSubs:4 };
      const result = await api('/api/hypetrain/test/synthetic?confirm=1', { method: 'POST', body: JSON.stringify(body) });
      state.preview = result.preview;
      state.status = result.status || state.status;
      await loadAll(true);
      state.tab = 'tests';
    } catch (err) {
      state.lastError = err.message || String(err);
      render();
    }
  }

  function handleAction(action){
    if (action === 'reload') return loadAll(true);
    if (action === 'save-config') return saveConfig();
    if (action === 'preview-normal') return makePreview({ level:2, points:2500, bits:1500, subs:1, resubs:1, giftSubs:1 });
    if (action === 'preview-raid-record') return makePreview({ raid:1, record:1, level:5, points:9600, bits:3500, subs:3, giftSubs:4 });
    if (action === 'synthetic-test') return syntheticTest();
  }

  window.HypeTrainModule = { loadAll, render };
  window.addEventListener('cgn:module-show', event => {
    if (event.detail?.module === MODULE) loadAll(false);
  });
})();
