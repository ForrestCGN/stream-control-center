window.DeathCounterModule = (function(){
  'use strict';

  let root = null;
  let activeTab = 'overview';
  let loading = false;
  let bound = false;
  let status = null;
  let settings = null;
  let texts = null;
  let players = null;
  let overlay = null;
  let integration = null;
  let error = '';

  const tabs = [
    ['overview', 'Übersicht'],
    ['players', 'Spieler'],
    ['stats', 'Statistik'],
    ['control', 'Steuerung'],
    ['settings', 'Settings'],
    ['texts', 'Texte'],
    ['diagnostics', 'Diagnose']
  ];

  const boolSettings = new Set([
    'requireMentionForPlayerCommands',
    'chatOutputEnabled',
    'fallbackToStreamerbot',
    'fallbackToStreamer',
    'directSendEnabled',
    'autoCreatePlayers',
    'allowTwitchLookup',
    'resetSessionOnStreamStart',
    'resetOverlayPlayersOnStreamStart'
  ]);

  const numberSettings = new Set(['maxExtraPlayers']);
  const jsonSettings = new Set(['defaultSelectedIds']);

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }
  function api(path, options){ return window.CGN.api(path, options || {}); }
  function num(v){ return Number(v || 0).toLocaleString('de-DE'); }
  function yes(v){ return v === true || v === 'true' || v === 1 || v === '1'; }

  function registerModule(){
    if (!window.CGN) return;
    window.CGN.modules.deathcounter = {
      title: 'DeathCounter',
      panelId: 'deathcounterModule',
      group: 'community',
      overlayLink: '/overlays/_overlay-deathcounter-v2.html',
      overlayLabel: 'DeathCounter-Overlay öffnen',
      reload(){ return window.DeathCounterModule?.loadAll?.(true); }
    };
    if (window.CGN.moduleCatalog?.deathcounter) {
      window.CGN.moduleCatalog.deathcounter.enabled = true;
      window.CGN.moduleCatalog.deathcounter.label = 'DeathCounter';
      window.CGN.moduleCatalog.deathcounter.description = 'DeathCounter V2: Status, Settings, Texte und Steuerung.';
    }
    if (Array.isArray(window.CGN.favorites) && !window.CGN.favorites.includes('deathcounter')) {
      window.CGN.favorites.push('deathcounter');
    }
  }

  function init(){
    registerModule();
    root = document.getElementById('deathcounterModule');
    if (!root) return;
    renderShell();
    bind();
    window.addEventListener('cgn:module-show', event => {
      if (event.detail?.module === 'deathcounter') loadAll(false);
    });
    if (window.CGN?.activeModule === 'deathcounter') loadAll(false);
    window.SectionHomeModule?.render?.();
  }

  function renderShell(){
    if (!root) return;
    root.innerHTML = `
      <div class="dc-tabs glass" role="tablist" aria-label="DeathCounter Navigation">
        ${tabs.map(([id, label]) => `<button type="button" class="tab-btn ${id === activeTab ? 'active' : ''}" data-dc-tab="${esc(id)}">${esc(label)}</button>`).join('')}
      </div>
      <div class="dc-panel" data-dc-panel="overview"></div>
      <div class="dc-panel" data-dc-panel="players" hidden></div>
      <div class="dc-panel" data-dc-panel="stats" hidden></div>
      <div class="dc-panel" data-dc-panel="control" hidden></div>
      <div class="dc-panel" data-dc-panel="settings" hidden></div>
      <div class="dc-panel" data-dc-panel="texts" hidden></div>
      <div class="dc-panel" data-dc-panel="diagnostics" hidden></div>
    `;
    applyTab();
  }

  function bind(){
    if (bound || !root) return;
    bound = true;
    root.addEventListener('click', async event => {
      const tab = event.target.closest('[data-dc-tab]');
      if (tab) {
        activeTab = tab.dataset.dcTab || 'overview';
        applyTab();
        render();
        return;
      }

      const action = event.target.closest('[data-dc-action]');
      if (!action) return;
      const name = action.dataset.dcAction;
      try {
        if (name === 'reload') await loadAll(true);
        if (name === 'overlay-show') await command('dcount', { input0: 'show', sendChat: 0 });
        if (name === 'overlay-hide') await command('dcount', { input0: 'hide', sendChat: 0 });
        if (name === 'overlay-toggle') await command('dcount', { sendChat: 0 });
        if (name === 'overlay-reset') await command('dcount', { input0: 'reset', sendChat: 0 });
        if (name === 'replace-player') await replacePlayer();
        if (name === 'rip-player') await ripSelected(false);
        if (name === 'del-player') await ripSelected(true);
        if (name === 'save-setting') await saveSetting(action.dataset.settingKey);
        if (name === 'save-text') await saveText(action.dataset.variantId);
        if (name === 'add-text') await addTextVariant(action.dataset.textKey, action.dataset.textCategory);
      } catch (err) {
        error = err.message || String(err);
        render();
      }
    });
  }

  function applyTab(){
    if (!root) return;
    root.querySelectorAll('[data-dc-tab]').forEach(btn => {
      const active = btn.dataset.dcTab === activeTab;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    root.querySelectorAll('[data-dc-panel]').forEach(panel => {
      panel.hidden = panel.dataset.dcPanel !== activeTab;
    });
  }

  async function loadAll(force){
    if (loading && !force) return;
    loading = true;
    error = '';
    renderLoading();
    try {
      const results = await Promise.allSettled([
        api('/api/deathcounter/v2/status'),
        api('/api/deathcounter/v2/admin/settings'),
        api('/api/deathcounter/v2/admin/texts'),
        api('/api/deathcounter/v2/players'),
        api('/api/deathcounter/v2/overlay'),
        api('/api/deathcounter/v2/integration-check')
      ]);
      status = valueOrNull(results[0]);
      settings = valueOrNull(results[1]);
      texts = valueOrNull(results[2]);
      players = valueOrNull(results[3]);
      overlay = valueOrNull(results[4]);
      integration = valueOrNull(results[5]);
      const failed = results.find(r => r.status === 'rejected');
      if (failed) error = failed.reason?.message || String(failed.reason || 'Fehler beim Laden');
    } catch (err) {
      error = err.message || String(err);
    } finally {
      loading = false;
      render();
    }
  }

  function valueOrNull(result){ return result.status === 'fulfilled' ? result.value : null; }
  function getRuntimeSettings(){ return settings?.runtime || status?.settings || {}; }
  function getPlayerList(){
    if (Array.isArray(players?.players)) return players.players;
    if (Array.isArray(players?.state?.players)) return players.state.players;
    if (Array.isArray(status?.players)) return status.players;
    return [];
  }
  function getOverlayState(){ return overlay?.overlay || status?.overlay || players?.overlay || overlay || {}; }
  function normId(value){ return String(value || '').trim().toLowerCase(); }

  function getVisiblePlayers(){
    const rt = getRuntimeSettings();
    const ov = getOverlayState();
    const list = getPlayerList();
    const selected = (ov.selectedPlayerIds || rt.selectedPlayerIds || []).map(normId);
    return list.filter(p => selected.includes(normId(p.id || p.login)));
  }

  function getCurrentGame(){
    const rt = getRuntimeSettings();
    return rt.currentGame || players?.currentGame || status?.currentGame || '-';
  }

  async function command(commandName, params){
    const query = new URLSearchParams({ command: commandName, ...(params || {}) });
    await api(`/api/deathcounter/v2/command?${query.toString()}`);
    await loadAll(true);
  }

  function renderLoading(){
    if (!root) return;
    const panel = root.querySelector('[data-dc-panel="overview"]');
    if (panel) panel.innerHTML = `<div class="dc-card page-card"><h2>DeathCounter</h2><div class="dc-note">Lade Daten...</div></div>`;
  }

  function render(){
    if (!root) return;
    renderOverview();
    renderPlayers();
    renderStats();
    renderControl();
    renderSettings();
    renderTexts();
    renderDiagnostics();
    applyTab();
  }

  function renderOverview(){
    const panel = root.querySelector('[data-dc-panel="overview"]');
    if (!panel) return;
    const st = status || {};
    const rt = getRuntimeSettings();
    const ov = getOverlayState();
    const list = getPlayerList();
    const activePlayers = getVisiblePlayers();
    panel.innerHTML = `
      ${errorBlock()}
      <div class="dc-card dc-hero page-card">
        <div>
          <h2>DeathCounter V2</h2>
          <div class="dc-note">Kurzübersicht für Status und sichtbare Overlay-Spieler.</div>
        </div>
        <div class="dc-actions head-actions">
          <button type="button" data-dc-action="reload">Neu laden</button>
        </div>
      </div>
      <div class="dc-grid">
        <div class="dc-card">
          <h3>Status</h3>
          ${row('Modul', st.ok ? 'OK' : '-')}
          ${row('Spiel', getCurrentGame())}
          ${row('Overlay', (ov.visible ?? rt.overlayVisible) ? 'sichtbar' : 'versteckt')}
          ${row('Spieler', `${num(list.length)} gesamt`)}
          ${row('@ Pflicht', yes(rt.requireMentionForPlayerCommands) ? 'aktiv' : 'inaktiv')}
          ${row('Chat-Ausgabe', yes(rt.chatOutputEnabled) ? 'Backend/Bot' : 'Fallback')}
        </div>
        <div class="dc-card">
          <h3>Sichtbare Spieler</h3>
          ${activePlayers.length ? activePlayers.map(player => playerLine(player)).join('') : '<div class="dc-empty">Keine sichtbaren Spieler.</div>'}
        </div>
      </div>
    `;
  }

  function renderPlayers(){
    const panel = root.querySelector('[data-dc-panel="players"]');
    if (!panel) return;
    const list = getPlayerList();
    panel.innerHTML = `
      ${errorBlock()}
      <div class="dc-card page-card">
        <div class="card-head big-head">
          <div><h2>Spieler</h2><div class="small-note">Alle bekannten DeathCounter-Spieler aus dem aktuellen JSON-State.</div></div>
          <div class="head-actions"><button type="button" data-dc-action="reload">Neu laden</button></div>
        </div>
        ${playersTable(list)}
      </div>
    `;
  }

  function renderStats(){
    const panel = root.querySelector('[data-dc-panel="stats"]');
    if (!panel) return;
    const list = getPlayerList();
    const topAll = [...list].sort((a, b) => Number(b?.stats?.allTime || 0) - Number(a?.stats?.allTime || 0)).slice(0, 10);
    const topGame = [...list].sort((a, b) => Number(b?.gameStats?.allTime || 0) - Number(a?.gameStats?.allTime || 0)).slice(0, 10);
    const topSession = [...list].sort((a, b) => Number(b?.gameStats?.session || 0) - Number(a?.gameStats?.session || 0)).slice(0, 10);
    panel.innerHTML = `
      ${errorBlock()}
      <div class="dc-card page-card">
        <div class="card-head big-head">
          <div><h2>Statistik</h2><div class="small-note">Schnellstatistik aus dem aktuellen State. Tiefere Event-Statistiken kommen erst mit späterer DB-Migration.</div></div>
          <div class="head-actions"><button type="button" data-dc-action="reload">Neu laden</button></div>
        </div>
        <div class="dc-kpis">
          ${kpi('Spieler', list.length)}
          ${kpi('AllTime gesamt', list.reduce((sum, p) => sum + Number(p?.stats?.allTime || 0), 0))}
          ${kpi('Spiel gesamt', list.reduce((sum, p) => sum + Number(p?.gameStats?.allTime || 0), 0))}
          ${kpi('Heute', list.reduce((sum, p) => sum + Number(p?.gameStats?.session || 0), 0))}
        </div>
        <div class="dc-stat-grid">
          ${topList('Top AllTime', topAll, p => p?.stats?.allTime)}
          ${topList(`Top ${getCurrentGame()}`, topGame, p => p?.gameStats?.allTime)}
          ${topList('Top Heute', topSession, p => p?.gameStats?.session)}
        </div>
      </div>
    `;
  }

  function topList(title, rows, valueFn){
    const items = rows.length ? rows.map((player, index) => `
      <li><span>${index + 1}. ${esc(player.displayName || player.login || player.id)}</span><strong>${num(valueFn(player))}</strong></li>
    `).join('') : '<li><span>Keine Daten</span><strong>-</strong></li>';
    return `<div class="dc-top-list"><h3>${esc(title)}</h3><ol>${items}</ol></div>`;
  }

  function playerLine(player){
    const game = player.gameStats || {};
    const stats = player.stats || {};
    return `<div class="dc-row"><span>${esc(player.displayName || player.login || player.id)}</span><strong>${num(game.session)} / ${num(game.allTime)} · AllTime ${num(stats.allTime)}</strong></div>`;
  }

  function playersTable(list){
    if (!list.length) return '<div class="dc-empty">Keine Spieler gefunden.</div>';
    return `
      <div class="dc-table-wrap">
        <table class="dc-table table">
          <thead><tr><th>Spieler</th><th>Heute</th><th>Spiel gesamt</th><th>AllTime</th><th>Status</th></tr></thead>
          <tbody>
            ${list.map(player => {
              const game = player.gameStats || {};
              const stats = player.stats || {};
              return `<tr><td>${esc(player.displayName || player.login || player.id)}</td><td>${num(game.session)}</td><td>${num(game.allTime)}</td><td>${num(stats.allTime)}</td><td>${player.active === false ? 'inaktiv' : 'aktiv'}</td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderControl(){
    const panel = root.querySelector('[data-dc-panel="control"]');
    if (!panel) return;
    const list = getPlayerList();
    const ov = getOverlayState();
    const selected = ov.selectedPlayerIds || [];
    panel.innerHTML = `
      ${errorBlock()}
      <div class="dc-card page-card">
        <div class="card-head big-head">
          <div><h2>Steuerung</h2><div class="small-note">Einfache Live-Aktionen. Chat-Ausgabe wird hier standardmäßig unterdrückt.</div></div>
          <div class="head-actions"><button type="button" data-dc-action="reload">Neu laden</button></div>
        </div>
        <div class="dc-control-grid">
          <div class="dc-sub-card">
            <h3>Overlay</h3>
            <div class="dc-button-row">
              <button type="button" data-dc-action="overlay-show">Anzeigen</button>
              <button type="button" data-dc-action="overlay-hide">Ausblenden</button>
              <button type="button" data-dc-action="overlay-toggle">Toggle</button>
              <button type="button" data-dc-action="overlay-reset">Spieler reset</button>
            </div>
          </div>
          <div class="dc-sub-card">
            <h3>Spieler ersetzen</h3>
            <div class="dc-form-row">
              <label><span>Von</span><select id="dcReplaceFrom">${playerOptions(list, selected[1] || selected[0])}</select></label>
              <label><span>Zu</span><select id="dcReplaceTo">${playerOptions(list, '')}</select></label>
              <button type="button" data-dc-action="replace-player">Ersetzen</button>
            </div>
          </div>
          <div class="dc-sub-card">
            <h3>Manuell zählen</h3>
            <div class="dc-form-row">
              <label><span>Spieler</span><select id="dcRipPlayer">${playerOptions(list, selected[0])}</select></label>
              <button type="button" data-dc-action="rip-player">+1 Tod</button>
              <button type="button" class="danger" data-dc-action="del-player">-1 Tod</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function playerOptions(list, selectedId){
    const selectedNorm = normId(selectedId);
    return ['<option value="">Bitte wählen</option>'].concat(list.map(player => {
      const id = player.id || player.login || '';
      return `<option value="${esc(id)}"${normId(id) === selectedNorm ? ' selected' : ''}>${esc(player.displayName || player.login || id)}</option>`;
    })).join('');
  }

  async function replacePlayer(){
    const from = document.getElementById('dcReplaceFrom')?.value || '';
    const to = document.getElementById('dcReplaceTo')?.value || '';
    if (!from || !to) throw new Error('Bitte Von- und Zu-Spieler wählen.');
    await command('dcount', { input0: 'replace', input1: `@${from}`, input2: `@${to}`, sendChat: 0 });
  }

  async function ripSelected(del){
    const player = document.getElementById('dcRipPlayer')?.value || '';
    if (!player) throw new Error('Bitte Spieler wählen.');
    const params = { input0: `@${player}`, sendChat: 0 };
    if (del) params.input1 = 'del';
    await command('rip', params);
  }

  function renderSettings(){
    const panel = root.querySelector('[data-dc-panel="settings"]');
    if (!panel) return;
    const rows = Array.isArray(settings?.rows) ? settings.rows : [];
    panel.innerHTML = `
      ${errorBlock()}
      <div class="dc-card page-card">
        <div class="card-head big-head"><div><h2>Settings</h2><div class="small-note">DB-Settings aus deathcounter_settings.</div></div><div class="head-actions"><button type="button" data-dc-action="reload">Neu laden</button></div></div>
        <div class="dc-settings-list">
          ${rows.length ? rows.map(settingCard).join('') : '<div class="dc-empty">Keine Settings geladen.</div>'}
        </div>
      </div>
    `;
  }

  function settingCard(rowData){
    const key = rowData.key;
    const type = rowData.valueType || (boolSettings.has(key) ? 'boolean' : numberSettings.has(key) ? 'number' : jsonSettings.has(key) ? 'json' : 'string');
    let field = '';
    if (type === 'boolean') {
      field = `<select data-dc-setting-value="${esc(key)}"><option value="true"${yes(rowData.value) ? ' selected' : ''}>true</option><option value="false"${!yes(rowData.value) ? ' selected' : ''}>false</option></select>`;
    } else if (type === 'number') {
      field = `<input type="number" data-dc-setting-value="${esc(key)}" value="${esc(rowData.value)}">`;
    } else if (type === 'json') {
      field = `<textarea rows="2" data-dc-setting-value="${esc(key)}">${esc(JSON.stringify(rowData.value ?? null))}</textarea>`;
    } else {
      field = `<input type="text" data-dc-setting-value="${esc(key)}" value="${esc(rowData.value)}">`;
    }
    return `
      <div class="dc-setting-card">
        <div><strong>${esc(key)}</strong><small>${esc(rowData.description || '')}</small></div>
        <div class="dc-setting-input">${field}</div>
        <button type="button" data-dc-action="save-setting" data-setting-key="${esc(key)}">Speichern</button>
      </div>
    `;
  }

  async function saveSetting(key){
    if (!key) throw new Error('Setting-Key fehlt.');
    const field = root.querySelector(`[data-dc-setting-value="${CSS.escape(key)}"]`);
    if (!field) throw new Error('Setting-Feld nicht gefunden.');
    let value = field.value;
    if (boolSettings.has(key)) value = value === 'true';
    else if (numberSettings.has(key)) value = Number(value || 0);
    else if (jsonSettings.has(key)) value = JSON.parse(value || 'null');
    await api('/api/deathcounter/v2/admin/settings', {
      method: 'POST',
      body: JSON.stringify({ key, value })
    });
    await loadAll(true);
  }

  function renderTexts(){
    const panel = root.querySelector('[data-dc-panel="texts"]');
    if (!panel) return;
    const payload = texts?.texts || {};
    const keys = Array.isArray(payload.keys) ? payload.keys : [];
    panel.innerHTML = `
      ${errorBlock()}
      <div class="dc-card page-card">
        <div class="card-head big-head"><div><h2>Texte</h2><div class="small-note">Varianten aus module_text_variants / module deathcounter.</div></div><div class="head-actions"><button type="button" data-dc-action="reload">Neu laden</button></div></div>
        <div class="dc-text-grid">
          ${keys.length ? keys.map(textKeyCard).join('') : '<div class="dc-empty">Keine Texte geladen.</div>'}
        </div>
      </div>
    `;
  }

  function textKeyCard(item){
    const variants = Array.isArray(item.variants) ? item.variants : [];
    return `
      <div class="dc-text-card">
        <div class="dc-text-head"><div><strong>${esc(item.key)}</strong><small>${esc(item.category || 'general')} · ${num(item.activeCount)} aktiv / ${num(item.totalCount)} gesamt</small></div><button type="button" data-dc-action="add-text" data-text-key="${esc(item.key)}" data-text-category="${esc(item.category || 'general')}">Variante +</button></div>
        ${variants.map(variantEditor).join('')}
      </div>
    `;
  }

  function variantEditor(variant){
    return `
      <div class="dc-variant" data-dc-variant="${esc(variant.id)}">
        <div class="dc-variant-meta">
          <label><span>Aktiv</span><select data-dc-variant-field="enabled"><option value="true"${variant.enabled ? ' selected' : ''}>true</option><option value="false"${!variant.enabled ? ' selected' : ''}>false</option></select></label>
          <label><span>Gewicht</span><input data-dc-variant-field="weight" type="number" min="1" value="${esc(variant.weight || 1)}"></label>
          <label><span>Sort</span><input data-dc-variant-field="sortOrder" type="number" value="${esc(variant.sortOrder || 0)}"></label>
        </div>
        <textarea data-dc-variant-field="value" rows="3">${esc(variant.value || '')}</textarea>
        <div class="dc-variant-actions"><button type="button" data-dc-action="save-text" data-variant-id="${esc(variant.id)}">Text speichern</button></div>
      </div>
    `;
  }

  async function saveText(id){
    const box = root.querySelector(`[data-dc-variant="${CSS.escape(String(id || ''))}"]`);
    if (!box) throw new Error('Textvariante nicht gefunden.');
    const current = findVariant(id);
    if (!current) throw new Error('Textvariante nicht geladen.');
    const variant = {
      id: Number(id),
      key: current.key,
      category: current.category || 'general',
      value: box.querySelector('[data-dc-variant-field="value"]')?.value || '',
      enabled: box.querySelector('[data-dc-variant-field="enabled"]')?.value === 'true',
      weight: Number(box.querySelector('[data-dc-variant-field="weight"]')?.value || 1),
      sortOrder: Number(box.querySelector('[data-dc-variant-field="sortOrder"]')?.value || 0)
    };
    await api('/api/deathcounter/v2/admin/texts', { method: 'POST', body: JSON.stringify({ action: 'saveVariant', variant }) });
    await loadAll(true);
  }

  async function addTextVariant(key, category){
    const variant = { key, category: category || 'general', value: '', enabled: true, weight: 1, sortOrder: 999 };
    await api('/api/deathcounter/v2/admin/texts', { method: 'POST', body: JSON.stringify({ action: 'saveVariant', variant }) });
    await loadAll(true);
  }

  function findVariant(id){
    const keys = texts?.texts?.keys || [];
    for (const item of keys) {
      const hit = (item.variants || []).find(v => String(v.id) === String(id));
      if (hit) return hit;
    }
    return null;
  }

  function renderDiagnostics(){
    const panel = root.querySelector('[data-dc-panel="diagnostics"]');
    if (!panel) return;
    const checks = Array.isArray(integration?.checks) ? integration.checks : [];
    panel.innerHTML = `
      ${errorBlock()}
      <div class="dc-card page-card">
        <div class="card-head big-head"><div><h2>Diagnose</h2><div class="small-note">Nicht-destruktiver Integration-Check.</div></div><div class="head-actions"><button type="button" data-dc-action="reload">Neu laden</button></div></div>
        <div class="dc-kpis">
          ${kpi('Checks', integration?.summary?.total)}
          ${kpi('OK', integration?.summary?.ok)}
          ${kpi('Warnungen', integration?.summary?.warnings)}
          ${kpi('Fehler', integration?.summary?.errors)}
        </div>
        <div class="dc-table-wrap">
          <table class="dc-table table"><thead><tr><th>Check</th><th>Status</th><th>Details</th></tr></thead><tbody>
            ${checks.map(check => `<tr><td>${esc(check.name)}</td><td>${check.ok ? 'OK' : 'Fehler'}</td><td>${esc(check.path || check.table || check.currentGame || check.error || '')}</td></tr>`).join('') || '<tr><td colspan="3">Keine Diagnose geladen.</td></tr>'}
          </tbody></table>
        </div>
      </div>
    `;
  }

  function row(label, value){ return `<div class="dc-row"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`; }
  function kpi(label, value){ return `<div class="dc-kpi"><strong>${num(value)}</strong><span>${esc(label)}</span></div>`; }
  function errorBlock(){ return error ? `<div class="dc-error">${esc(error)}</div>` : ''; }

  return { init, loadAll, registerModule };
})();

document.addEventListener('DOMContentLoaded', () => window.DeathCounterModule?.init?.());
