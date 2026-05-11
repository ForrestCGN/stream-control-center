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
  let playerSearch = '';
  let playerSort = 'allTime';
  let selectedPlayerId = '';
  let statsGameFilter = 'current';

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

  const settingGroups = [
    ['commands', 'Commands', ['requireMentionForPlayerCommands', 'autoCreatePlayers', 'allowTwitchLookup']],
    ['chat', 'Chat-Ausgabe', ['chatOutputEnabled', 'chatOutputPrefer', 'directSendEnabled', 'fallbackToStreamer', 'fallbackToStreamerbot']],
    ['overlay', 'Overlay', ['defaultSelectedIds', 'maxExtraPlayers', 'resetOverlayPlayersOnStreamStart']],
    ['stream', 'Streamstart', ['resetSessionOnStreamStart']]
  ];

  const textCategoryLabels = {
    error: 'Fehler / Hinweise',
    stats: 'Tode / Statistiken',
    general: 'Allgemein'
  };

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
        if (name === 'overlay-reset') {
          if (!window.confirm('Overlay-Spieler wirklich auf Standard zurücksetzen?')) return;
          await command('dcount', { input0: 'reset', sendChat: 0 });
        }
        if (name === 'extra-add-player') await addExtraPlayer();
        if (name === 'extra-remove-player') await removeExtraPlayer();
        if (name === 'extra-clear-players') {
          if (!window.confirm('Alle Zusatzspieler aus dem Overlay entfernen?')) return;
          await command('dcount', { input0: 'clear', sendChat: 0 });
        }
        if (name === 'replace-player') await replacePlayer();
        if (name === 'rip-player') await ripSelected(false);
        if (name === 'del-player') {
          if (!window.confirm('Einen Tod wirklich abziehen?')) return;
          await ripSelected(true);
        }
        if (name === 'save-setting') await saveSetting(action.dataset.settingKey);
        if (name === 'save-text') await saveText(action.dataset.variantId);
        if (name === 'add-text') await addTextVariant(action.dataset.textKey, action.dataset.textCategory);
        if (name === 'select-player-detail') {
          selectedPlayerId = action.dataset.playerId || '';
          renderPlayers();
        }
        if (name === 'detail-rip-player') await ripPlayerById(action.dataset.playerId, false);
        if (name === 'detail-del-player') {
          const playerName = action.dataset.playerName || action.dataset.playerId || 'diesen Spieler';
          if (!window.confirm(`Einen Tod bei ${playerName} im aktuellen Spiel wirklich abziehen?`)) return;
          await ripPlayerById(action.dataset.playerId, true);
        }
        if (name === 'open-control') {
          activeTab = 'control';
          applyTab();
          render();
        }
      } catch (err) {
        error = err.message || String(err);
        render();
      }
    });

    root.addEventListener('input', event => {
      const search = event.target.closest('[data-dc-player-search]');
      if (search) {
        playerSearch = search.value || '';
        renderPlayers();
      }
    });

    root.addEventListener('change', event => {
      const sort = event.target.closest('[data-dc-player-sort]');
      if (sort) {
        playerSort = sort.value || 'allTime';
        renderPlayers();
      }
      const detailSelect = event.target.closest('[data-dc-player-detail-select]');
      if (detailSelect) {
        selectedPlayerId = detailSelect.value || '';
        renderPlayers();
      }
      const game = event.target.closest('[data-dc-stats-game]');
      if (game) {
        statsGameFilter = game.value || 'current';
        renderStats();
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


  function getPlayerKey(player){ return normId(player?.id || player?.login || player?.displayName); }

  function findPlayerById(id){
    const wanted = normId(id);
    if (!wanted) return null;
    return getPlayerList().find(player => getPlayerKey(player) === wanted || normId(player?.login) === wanted || normId(player?.displayName) === wanted) || null;
  }

  function getSelectedPlayer(){
    const list = getPlayerList();
    if (!list.length) return null;
    const explicit = findPlayerById(selectedPlayerId);
    if (explicit) return explicit;
    const visible = getVisiblePlayers();
    return visible[0] || list[0] || null;
  }

  function getPlayerSelectOptions(list, selectedId){
    const selectedNorm = normId(selectedId);
    return list.map(player => {
      const id = player.id || player.login || player.displayName || '';
      return `<option value="${esc(id)}"${normId(id) === selectedNorm ? ' selected' : ''}>${esc(player.displayName || player.login || id)}</option>`;
    }).join('');
  }

  function getPlayerGameRows(player){
    if (!player) return [];
    const games = player.games || {};
    const currentGame = getCurrentGame();
    return Object.keys(games).map(game => {
      const stats = games[game] || {};
      return {
        game,
        session: Number(stats.session || 0),
        allTime: Number(stats.allTime || 0),
        current: normId(game) === normId(currentGame)
      };
    }).sort((a, b) => {
      if (a.current !== b.current) return a.current ? -1 : 1;
      return b.allTime - a.allTime || b.session - a.session || a.game.localeCompare(b.game, 'de', { sensitivity: 'base' });
    });
  }

  function getSelectedPlayerIds(){
    const rt = getRuntimeSettings();
    const ov = getOverlayState();
    return (ov.selectedPlayerIds || rt.selectedPlayerIds || []).map(normId).filter(Boolean);
  }

  function getExtraPlayerIds(){
    const ov = getOverlayState();
    return (ov.extraPlayerIds || []).map(normId).filter(Boolean);
  }

  function getVisiblePlayerIds(){
    return Array.from(new Set([...getSelectedPlayerIds(), ...getExtraPlayerIds()]));
  }

  function getVisiblePlayers(){
    const visible = getVisiblePlayerIds();
    return getPlayerList().filter(p => visible.includes(normId(p.id || p.login)));
  }

  function getCurrentGame(){
    const rt = getRuntimeSettings();
    return rt.currentGame || players?.currentGame || status?.currentGame || '-';
  }

  function getGameNames(){
    const names = new Set();
    getPlayerList().forEach(player => {
      Object.keys(player?.games || {}).forEach(game => {
        if (game && game.trim()) names.add(game.trim());
      });
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b, 'de', { sensitivity: 'base' }));
  }

  function getStatsSelection(){
    const currentGame = getCurrentGame();
    const selected = statsGameFilter || 'current';
    if (selected === 'all') {
      return { mode: 'all', label: 'Alle Spiele / AllTime', game: null, usesAllTime: true };
    }
    if (selected === 'current') {
      return { mode: 'game', label: currentGame || 'Aktuelles Spiel', game: currentGame, usesAllTime: false };
    }
    return { mode: 'game', label: selected, game: selected, usesAllTime: false };
  }

  function getGameStatsForPlayer(player, selection){
    if (!player) return { session: 0, allTime: 0 };
    if (selection?.usesAllTime) {
      return {
        session: Number(player?.stats?.session || 0),
        allTime: Number(player?.stats?.allTime || 0)
      };
    }
    const gameName = selection?.game || getCurrentGame();
    const direct = player?.games?.[gameName];
    if (direct) {
      return {
        session: Number(direct.session || 0),
        allTime: Number(direct.allTime || 0)
      };
    }
    if (gameName === getCurrentGame() && player?.gameStats) {
      return {
        session: Number(player.gameStats.session || 0),
        allTime: Number(player.gameStats.allTime || 0)
      };
    }
    return { session: 0, allTime: 0 };
  }

  function getFilteredPlayers(){
    const q = normId(playerSearch);
    const list = getPlayerList().filter(player => {
      if (!q) return true;
      return normId(player.id).includes(q) || normId(player.login).includes(q) || normId(player.displayName).includes(q);
    });
    const sortValue = playerSort || 'allTime';
    return list.sort((a, b) => {
      if (sortValue === 'name') return String(a.displayName || a.login || a.id || '').localeCompare(String(b.displayName || b.login || b.id || ''), 'de');
      if (sortValue === 'today') return Number(b?.gameStats?.session || 0) - Number(a?.gameStats?.session || 0);
      if (sortValue === 'game') return Number(b?.gameStats?.allTime || 0) - Number(a?.gameStats?.allTime || 0);
      return Number(b?.stats?.allTime || 0) - Number(a?.stats?.allTime || 0);
    });
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
      <div class="dc-overview-kpis">
        ${smallKpi('Spiel', getCurrentGame())}
        ${smallKpi('Overlay', (ov.visible ?? rt.overlayVisible) ? 'sichtbar' : 'versteckt')}
        ${smallKpi('Spieler', `${num(list.length)} gesamt`)}
        ${smallKpi('@ Pflicht', yes(rt.requireMentionForPlayerCommands) ? 'aktiv' : 'inaktiv')}
      </div>
      <div class="dc-grid">
        <div class="dc-card">
          <h3>Status</h3>
          ${row('Modul', st.ok ? 'OK' : '-')}
          ${row('Chat-Ausgabe', yes(rt.chatOutputEnabled) ? 'Backend/Bot' : 'Fallback')}
          ${row('Fallback Streamer.bot', yes(rt.fallbackToStreamerbot) ? 'aktiv' : 'inaktiv')}
          ${row('AutoCreate', yes(rt.autoCreatePlayers) ? 'aktiv' : 'inaktiv')}
          ${row('Twitch-Lookup', yes(rt.allowTwitchLookup) ? 'aktiv' : 'inaktiv')}
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
    const filtered = getFilteredPlayers();
    const selectedPlayer = getSelectedPlayer();
    if (selectedPlayer && !selectedPlayerId) selectedPlayerId = selectedPlayer.id || selectedPlayer.login || selectedPlayer.displayName || '';
    panel.innerHTML = `
      ${errorBlock()}
      <div class="dc-card page-card">
        <div class="card-head big-head">
          <div><h2>Spieler</h2><div class="small-note">Alle bekannten DeathCounter-Spieler aus dem aktuellen JSON-State, inklusive Detailansicht pro Spieler.</div></div>
          <div class="head-actions"><button type="button" data-dc-action="reload">Neu laden</button></div>
        </div>
        <div class="dc-player-tools">
          <label><span>Suche</span><input data-dc-player-search value="${esc(playerSearch)}" placeholder="Spieler suchen"></label>
          <label><span>Sortieren</span><select data-dc-player-sort>
            <option value="allTime"${playerSort === 'allTime' ? ' selected' : ''}>AllTime absteigend</option>
            <option value="game"${playerSort === 'game' ? ' selected' : ''}>Spiel gesamt absteigend</option>
            <option value="today"${playerSort === 'today' ? ' selected' : ''}>Heute absteigend</option>
            <option value="name"${playerSort === 'name' ? ' selected' : ''}>Name A-Z</option>
          </select></label>
          <label><span>Detailansicht</span><select data-dc-player-detail-select>${getPlayerSelectOptions(list, selectedPlayerId)}</select></label>
          <div class="dc-tool-count">${num(filtered.length)} / ${num(list.length)} angezeigt</div>
        </div>
        <div class="dc-player-layout">
          <div>${playersTable(filtered)}</div>
          ${playerDetailCard(selectedPlayer)}
        </div>
      </div>
    `;
  }

  function renderStats(){
    const panel = root.querySelector('[data-dc-panel="stats"]');
    if (!panel) return;
    const list = getPlayerList();
    const visible = getVisiblePlayers();
    const gameNames = getGameNames();
    const selection = getStatsSelection();
    const rows = list.map(player => {
      const gameStats = getGameStatsForPlayer(player, selection);
      return { player, session: gameStats.session, allTime: gameStats.allTime, playerAllTime: Number(player?.stats?.allTime || 0) };
    });
    const sortedByAllTime = [...rows].sort((a, b) => b.allTime - a.allTime).slice(0, 10);
    const sortedBySession = [...rows].sort((a, b) => b.session - a.session).slice(0, 10);
    const tableRows = [...rows].sort((a, b) => b.allTime - a.allTime || b.session - a.session || String(a.player?.displayName || '').localeCompare(String(b.player?.displayName || ''), 'de'));
    const totalAllTime = rows.reduce((sum, row) => sum + Number(row.allTime || 0), 0);
    const totalSession = rows.reduce((sum, row) => sum + Number(row.session || 0), 0);
    panel.innerHTML = `
      ${errorBlock()}
      <div class="dc-card page-card">
        <div class="card-head big-head">
          <div><h2>Statistik</h2><div class="small-note">Statistik aus dem aktuellen State. Der Spiele-Filter nutzt die vorhandenen JSON-Spielwerte.</div></div>
          <div class="head-actions"><button type="button" data-dc-action="reload">Neu laden</button></div>
        </div>
        <div class="dc-stat-toolbar">
          <label><span>Spiel auswählen</span><select data-dc-stats-game>
            <option value="current"${statsGameFilter === 'current' ? ' selected' : ''}>Aktuelles Spiel (${esc(getCurrentGame())})</option>
            <option value="all"${statsGameFilter === 'all' ? ' selected' : ''}>Alle Spiele / AllTime</option>
            ${gameNames.map(game => `<option value="${esc(game)}"${statsGameFilter === game ? ' selected' : ''}>${esc(game)}</option>`).join('')}
          </select></label>
          <div class="dc-tool-count">Auswertung: ${esc(selection.label)}</div>
        </div>
        <div class="dc-kpis">
          ${kpi('Spieler', list.length)}
          ${kpi('Sichtbar', visible.length)}
          ${kpi(selection.usesAllTime ? 'AllTime gesamt' : `${selection.label} gesamt`, totalAllTime)}
          ${kpi(selection.usesAllTime ? 'Session gesamt' : `${selection.label} heute`, totalSession)}
        </div>
        <div class="dc-stat-grid">
          ${topList(selection.usesAllTime ? 'Top AllTime' : `Top ${selection.label}`, sortedByAllTime, row => row.allTime)}
          ${topList(selection.usesAllTime ? 'Top Session' : `Heute in ${selection.label}`, sortedBySession, row => row.session)}
        </div>
        <div class="dc-stat-table-block">
          <h3>Spielerwerte: ${esc(selection.label)}</h3>
          ${statsTable(tableRows, selection)}
        </div>
      </div>
    `;
  }

  function topList(title, rows, valueFn){
    const usefulRows = rows.filter(row => Number(valueFn(row) || 0) > 0);
    const sourceRows = usefulRows.length ? usefulRows : rows;
    const items = sourceRows.length ? sourceRows.map((row, index) => `
      <li><span>${index + 1}. ${esc(row.player?.displayName || row.player?.login || row.player?.id)}</span><strong>${num(valueFn(row))}</strong></li>
    `).join('') : '<li><span>Keine Daten</span><strong>-</strong></li>';
    return `<div class="dc-top-list"><h3>${esc(title)}</h3><ol>${items}</ol></div>`;
  }

  function statsTable(rows, selection){
    if (!rows.length) return '<div class="dc-empty">Keine Statistikdaten gefunden.</div>';
    return `
      <div class="dc-table-wrap">
        <table class="dc-table table">
          <thead><tr><th>Spieler</th><th>${selection.usesAllTime ? 'Session' : 'Heute'}</th><th>${selection.usesAllTime ? 'AllTime' : 'Spiel gesamt'}</th><th>AllTime Gesamt</th></tr></thead>
          <tbody>
            ${rows.map(row => `<tr><td>${esc(row.player?.displayName || row.player?.login || row.player?.id)}</td><td>${num(row.session)}</td><td>${num(row.allTime)}</td><td>${num(row.playerAllTime)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
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
          <thead><tr><th>Spieler</th><th>Heute</th><th>Spiel gesamt</th><th>AllTime</th><th>Status</th><th>Aktion</th></tr></thead>
          <tbody>
            ${list.map(player => {
              const game = player.gameStats || {};
              const stats = player.stats || {};
              const id = player.id || player.login || player.displayName || '';
              const selected = normId(id) === normId(selectedPlayerId);
              return `<tr class="${selected ? 'dc-selected-row' : ''}"><td>${esc(player.displayName || player.login || player.id)}</td><td>${num(game.session)}</td><td>${num(game.allTime)}</td><td>${num(stats.allTime)}</td><td>${player.active === false ? 'inaktiv' : 'aktiv'}</td><td><button type="button" class="dc-mini-btn" data-dc-action="select-player-detail" data-player-id="${esc(id)}">Details</button></td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function playerDetailCard(player){
    if (!player) return '<aside class="dc-player-detail dc-empty">Kein Spieler für Details ausgewählt.</aside>';
    const rows = getPlayerGameRows(player);
    const stats = player.stats || {};
    const current = getGameStatsForPlayer(player, { mode: 'game', game: getCurrentGame(), usesAllTime: false });
    return `
      <aside class="dc-player-detail">
        <div class="dc-detail-head">
          <div>
            <h3>${esc(player.displayName || player.login || player.id)}</h3>
            <div class="small-note">${esc(player.login || player.id || '')}${player.active === false ? ' · inaktiv' : ' · aktiv'}</div>
          </div>
        </div>
        <div class="dc-detail-kpis">
          ${smallKpi('Heute aktuell', num(current.session))}
          ${smallKpi('Spiel gesamt', num(current.allTime))}
          ${smallKpi('Session gesamt', num(stats.session || 0))}
          ${smallKpi('AllTime', num(stats.allTime || 0))}
        </div>
        <div class="dc-detail-actions">
          <div>
            <strong>Aktuelles Spiel korrigieren</strong>
            <span>Wirkt auf ${esc(getCurrentGame())}. Für andere Spiele später über die DB-/Event-Historie.</span>
          </div>
          <div class="dc-button-row">
            <button type="button" data-dc-action="detail-rip-player" data-player-id="${esc(player.id || player.login || player.displayName || '')}" data-player-name="${esc(player.displayName || player.login || player.id)}">+1 Tod</button>
            <button type="button" class="danger" data-dc-action="detail-del-player" data-player-id="${esc(player.id || player.login || player.displayName || '')}" data-player-name="${esc(player.displayName || player.login || player.id)}">-1 Tod</button>
            <button type="button" data-dc-action="open-control">Steuerung öffnen</button>
          </div>
        </div>
        <h4>Spiele dieses Spielers</h4>
        ${playerGamesTable(rows)}
      </aside>
    `;
  }

  function playerGamesTable(rows){
    if (!rows.length) return '<div class="dc-empty">Für diesen Spieler sind noch keine Spielwerte gespeichert.</div>';
    return `
      <div class="dc-table-wrap dc-detail-table">
        <table class="dc-table table">
          <thead><tr><th>Spiel</th><th>Heute</th><th>Gesamt</th><th></th></tr></thead>
          <tbody>
            ${rows.map(row => `<tr class="${row.current ? 'dc-current-game-row' : ''}"><td>${esc(row.game)}</td><td>${num(row.session)}</td><td>${num(row.allTime)}</td><td>${row.current ? 'aktuell' : ''}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderControl(){
    const panel = root.querySelector('[data-dc-panel="control"]');
    if (!panel) return;
    const list = getPlayerList();
    const rt = getRuntimeSettings();
    const ov = getOverlayState();
    const selected = ov.selectedPlayerIds || [];
    const extraIds = getExtraPlayerIds();
    const visibleIds = getVisiblePlayerIds();
    const extraPlayers = extraIds.map(findPlayerById).filter(Boolean);
    const maxExtra = Number(rt.maxExtraPlayers || 0);
    const addablePlayers = list.filter(player => !visibleIds.includes(normId(player.id || player.login)));
    panel.innerHTML = `
      ${errorBlock()}
      <div class="dc-card page-card">
        <div class="card-head big-head">
          <div><h2>Steuerung</h2><div class="small-note">Einfache Live-Aktionen. Chat-Ausgabe wird hier standardmäßig unterdrückt.</div></div>
          <div class="head-actions"><button type="button" data-dc-action="reload">Neu laden</button></div>
        </div>
        <div class="dc-warning">Änderungen hier wirken direkt auf den aktiven DeathCounter-State. +1/-1 bitte nur bewusst nutzen.</div>
        <div class="dc-control-grid">
          <div class="dc-sub-card">
            <h3>Overlay</h3>
            <div class="dc-button-row">
              <button type="button" data-dc-action="overlay-show">Anzeigen</button>
              <button type="button" data-dc-action="overlay-hide">Ausblenden</button>
              <button type="button" data-dc-action="overlay-toggle">Toggle</button>
              <button type="button" class="danger" data-dc-action="overlay-reset">Spieler reset</button>
            </div>
          </div>
          <div class="dc-sub-card">
            <h3>Zusatzspieler</h3>
            <div class="dc-extra-summary">
              <div><strong>${num(extraIds.length)} / ${num(maxExtra)} Zusatzspieler</strong><span>Standardspieler bleiben unverändert.</span></div>
              <div class="dc-extra-list">${extraPlayers.length ? extraPlayers.map(player => `<span class="dc-pill">${esc(player.displayName || player.login || player.id)}</span>`).join('') : '<span class="dc-empty">Keine Zusatzspieler aktiv.</span>'}</div>
            </div>
            <div class="dc-form-row dc-extra-controls">
              <label><span>Hinzufügen</span><select id="dcExtraAddPlayer">${playerOptions(addablePlayers, '')}</select></label>
              <button type="button" data-dc-action="extra-add-player">Hinzufügen</button>
              <label><span>Entfernen</span><select id="dcExtraRemovePlayer">${playerOptions(extraPlayers, extraIds[0] || '')}</select></label>
              <button type="button" data-dc-action="extra-remove-player">Entfernen</button>
              <button type="button" class="danger" data-dc-action="extra-clear-players">Alle Extras leeren</button>
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

  async function addExtraPlayer(){
    const player = document.getElementById('dcExtraAddPlayer')?.value || '';
    if (!player) throw new Error('Bitte Zusatzspieler zum Hinzufügen wählen.');
    await command('dcount', { input0: 'add', input1: `@${player}`, sendChat: 0 });
  }

  async function removeExtraPlayer(){
    const player = document.getElementById('dcExtraRemovePlayer')?.value || '';
    if (!player) throw new Error('Bitte Zusatzspieler zum Entfernen wählen.');
    await command('dcount', { input0: 'remove', input1: `@${player}`, sendChat: 0 });
  }

  async function ripSelected(del){
    const player = document.getElementById('dcRipPlayer')?.value || '';
    if (!player) throw new Error('Bitte Spieler wählen.');
    await ripPlayerById(player, del);
  }

  async function ripPlayerById(playerId, del){
    const player = String(playerId || '').trim();
    if (!player) throw new Error('Bitte Spieler wählen.');
    const params = { input0: `@${player}`, sendChat: 0 };
    if (del) params.input1 = 'del';
    await command('rip', params);
    selectedPlayerId = player;
  }

  function renderSettings(){
    const panel = root.querySelector('[data-dc-panel="settings"]');
    if (!panel) return;
    const rows = Array.isArray(settings?.rows) ? settings.rows : [];
    const byKey = new Map(rows.map(row => [row.key, row]));
    const used = new Set(settingGroups.flatMap(group => group[2]));
    const otherRows = rows.filter(row => !used.has(row.key));
    panel.innerHTML = `
      ${errorBlock()}
      <div class="dc-card page-card">
        <div class="card-head big-head"><div><h2>Settings</h2><div class="small-note">DB-Settings aus deathcounter_settings, nach Bereichen gruppiert.</div></div><div class="head-actions"><button type="button" data-dc-action="reload">Neu laden</button></div></div>
        <div class="dc-settings-groups">
          ${settingGroups.map(([id, title, keys]) => settingGroup(title, keys.map(key => byKey.get(key)).filter(Boolean))).join('')}
          ${otherRows.length ? settingGroup('Weitere Settings', otherRows) : ''}
        </div>
      </div>
    `;
  }

  function settingGroup(title, rows){
    if (!rows.length) return '';
    return `<section class="dc-setting-group"><h3>${esc(title)}</h3><div class="dc-settings-list">${rows.map(settingCard).join('')}</div></section>`;
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
    const grouped = groupByCategory(keys);
    panel.innerHTML = `
      ${errorBlock()}
      <div class="dc-card page-card">
        <div class="card-head big-head"><div><h2>Texte</h2><div class="small-note">Varianten aus module_text_variants / module deathcounter, nach Kategorien gruppiert.</div></div><div class="head-actions"><button type="button" data-dc-action="reload">Neu laden</button></div></div>
        <div class="dc-text-sections">
          ${keys.length ? Object.keys(grouped).map(category => textCategorySection(category, grouped[category])).join('') : '<div class="dc-empty">Keine Texte geladen.</div>'}
        </div>
      </div>
    `;
  }

  function groupByCategory(keys){
    return keys.reduce((acc, item) => {
      const category = item.category || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
  }

  function textCategorySection(category, items){
    return `<section class="dc-text-section"><h3>${esc(textCategoryLabels[category] || category)}</h3><div class="dc-text-grid">${items.map(textKeyCard).join('')}</div></section>`;
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
  function smallKpi(label, value){ return `<div class="dc-small-kpi"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`; }
  function errorBlock(){ return error ? `<div class="dc-error">${esc(error)}</div>` : ''; }

  return { init, loadAll, registerModule };
})();

document.addEventListener('DOMContentLoaded', () => window.DeathCounterModule?.init?.());
