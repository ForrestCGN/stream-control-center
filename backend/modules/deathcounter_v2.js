
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const core = require('./helpers/helper_core');
const config = require('./helpers/helper_config');

const DEFAULT_SELECTED_IDS = ['forrestcgn', 'engelcgn'];
const DEFAULT_GAME_KEY = 'Unbekannt';
const MAX_EXTRA_PLAYERS = 2;

module.exports.init = function init(ctx) {
  const { app } = ctx;

  const oldDataDir = path.join(__dirname, '..', 'data');
  const oldStateFile = path.join(oldDataDir, 'deathcounter.v2.json');
  const oldLegacyFile = path.join(oldDataDir, 'death_counter.json');

  const dataDir = process.env.DEATHCOUNTER_DATA_DIR || config.resolveFromRoot('data', 'deathcounter');
  const stateFile = process.env.DEATHCOUNTER_V2_FILE || path.join(dataDir, 'deathcounter.v2.json');
  const legacyFile = process.env.DEATHCOUNTER_LEGACY_FILE || oldLegacyFile;

  ensureDir(dataDir);
  ensureStateFile();

  app.use('/api/deathcounter/v2', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  const API_PREFIX = '/api/deathcounter/v2';
  const OVERLAY_FILE = '_overlay-deathcounter-v2.html';

  app.get(`${API_PREFIX}/status`, (req, res) => {
    const state = readState();
    return res.json(ok({
      module: 'deathcounter_v2',
      version: 2,
      prefix: API_PREFIX,
      rootDir: getProjectRootSafe(),
      dataDir,
      stateFile,
      stateFileExists: fs.existsSync(stateFile),
      currentGame: state.currentGame,
      playerCount: Array.isArray(state.players) ? state.players.length : 0,
      overlay: publicOverlay(state).overlay,
      updatedAt: state.updatedAt
    }));
  });

  app.get(`${API_PREFIX}/config`, (req, res) => {
    return res.json(ok(buildDeathcounterConfig()));
  });

  app.get(`${API_PREFIX}/settings`, (req, res) => {
    return res.json(ok(buildDeathcounterSettings()));
  });

  app.get(`${API_PREFIX}/routes`, (req, res) => {
    const routes = buildDeathcounterRoutes();
    return res.json(ok({
      module: 'deathcounter_v2',
      version: 2,
      prefix: API_PREFIX,
      intentionallyNotRegistered: ['/api/deathcounter', '/api/deathcounter-v2', '/api/deathcounter_v2', '/api/death-counter'],
      routes,
      count: routes.length,
      updatedAt: core.nowIso()
    }));
  });

  app.get(`${API_PREFIX}/integration-check`, (req, res) => {
    return res.json(ok(buildDeathcounterIntegrationCheck()));
  });

  app.post(`${API_PREFIX}/reload`, (req, res) => {
    ensureStateFile();
    const state = readState();
    writeJSON(stateFile, state);
    return res.json(ok({
      module: 'deathcounter_v2',
      version: 2,
      action: 'reload',
      reloaded: true,
      destructive: false,
      statePreserved: true,
      countersPreserved: true,
      overlayPreserved: true,
      stateFile,
      currentGame: state.currentGame,
      playerCount: Array.isArray(state.players) ? state.players.length : 0,
      overlay: publicOverlay(state).overlay,
      updatedAt: core.nowIso()
    }));
  });

  app.get('/api/deathcounter/v2/state', (req, res) => res.json(ok(publicState(readState()))));
  app.get('/api/deathcounter/v2/players', (req, res) => {
    const state = readState();
    return res.json(ok({
      currentGame: state.currentGame,
      players: sortPlayers(state.players).map(publicPlayer)
    }));
  });

  app.get('/api/deathcounter/v2/overlay', (req, res) => {
    const state = readState();
    return res.json(ok(publicOverlay(state)));
  });

  app.get('/api/deathcounter/v2/show', (req, res) => res.json(ok(publicOverlay(setOverlayVisibility(true)))));
  app.post('/api/deathcounter/v2/show', (req, res) => res.json(ok(publicOverlay(setOverlayVisibility(true)))));
  app.get('/api/deathcounter/v2/hide', (req, res) => res.json(ok(publicOverlay(setOverlayVisibility(false)))));
  app.post('/api/deathcounter/v2/hide', (req, res) => res.json(ok(publicOverlay(setOverlayVisibility(false)))));

  app.get('/api/deathcounter/v2/overlay/show', (req, res) => res.json(ok(publicOverlay(setOverlayVisibility(true)))));
  app.post('/api/deathcounter/v2/overlay/show', (req, res) => res.json(ok(publicOverlay(setOverlayVisibility(true)))));
  app.get('/api/deathcounter/v2/overlay/hide', (req, res) => res.json(ok(publicOverlay(setOverlayVisibility(false)))));
  app.post('/api/deathcounter/v2/overlay/hide', (req, res) => res.json(ok(publicOverlay(setOverlayVisibility(false)))));
  app.get('/api/deathcounter/v2/overlay/toggle', (req, res) => {
    const state = readState();
    return res.json(ok(publicOverlay(setOverlayVisibility(!state.overlay?.visible))));
  });
  app.post('/api/deathcounter/v2/overlay/toggle', (req, res) => {
    const state = readState();
    return res.json(ok(publicOverlay(setOverlayVisibility(!state.overlay?.visible))));
  });

  app.get('/api/deathcounter/v2/game', (req, res) => {
    try {
      const game = normalizeGameName(requiredString(req.query.game, 'Missing ?game='));
      const state = setCurrentGame(game);
      return res.json(ok(publicState(state)));
    } catch (err) {
      return res.status(400).json(fail(err.message));
    }
  });

  app.post('/api/deathcounter/v2/game', (req, res) => {
    try {
      const game = normalizeGameName(requiredString(bodyOrQuery(req, 'game'), 'Missing game'));
      const state = setCurrentGame(game);
      return res.json(ok(publicState(state)));
    } catch (err) {
      return res.status(400).json(fail(err.message));
    }
  });

  app.get('/api/deathcounter/v2/game/set', (req, res) => {
    try {
      const game = normalizeGameName(requiredString(req.query.name ?? req.query.game, 'Missing ?name='));
      const state = setCurrentGame(game);
      return res.json(ok(publicState(state)));
    } catch (err) {
      return res.status(400).json(fail(err.message));
    }
  });

  app.get('/api/deathcounter/v2/sync/channelinfo', async (req, res) => {
    try {
      const channelId = requiredString(req.query.id, 'Missing ?id=');
      const sourceUrl = `http://127.0.0.1:8080/channelinfo?id=${encodeURIComponent(channelId)}`;
      const payload = await fetchJson(sourceUrl);
      const game = normalizeGameName(payload?.data?.[0]?.game_name || DEFAULT_GAME_KEY);
      const state = setCurrentGame(game);
      return res.json(ok({
        source: sourceUrl,
        currentGame: state.currentGame,
        overlay: publicOverlay(state).overlay,
        players: publicState(state).players
      }));
    } catch (err) {
      return res.status(400).json(fail(err.message));
    }
  });

  app.get('/api/deathcounter/v2/stream-online-sync', async (req, res) => {
    try {
      const channelId = requiredString(req.query.id, 'Missing ?id=');
      const sourceUrl = `http://127.0.0.1:8080/channelinfo?id=${encodeURIComponent(channelId)}`;
      const payload = await fetchJson(sourceUrl);
      const game = normalizeGameName(payload?.data?.[0]?.game_name || DEFAULT_GAME_KEY);

      const state = updateState(s => {
        s.currentGame = game;
        ensureGameBucketsForAllPlayers(s.players, game);
        for (const player of s.players) {
          sanitizePlayer(player);
          for (const key of Object.keys(player.games || {})) {
            ensureGameStats(player, key);
            player.games[key].session = 0;
          }
          recalcAggregates(player);
          clampStats(player);
        }
        s.overlay.selectedPlayerIds = getDefaultSelectedPlayers(s.players).map(p => p.id).slice(0, 2);
        s.overlay.extraPlayerIds = [];
        syncOverlayLists(s);
        s.updatedAt = core.nowIso();
      });

      broadcastState(ctx, state, {
        type: 'deathcounter_v2_stream_online_sync',
        currentGame: state.currentGame
      });

      return res.json(ok({
        source: sourceUrl,
        currentGame: state.currentGame,
        overlay: publicOverlay(state).overlay,
        players: publicState(state).players
      }));
    } catch (err) {
      return res.status(400).json(fail(err.message));
    }
  });


  app.post('/api/deathcounter/v2/players', (req, res) => {
    try {
      const displayName = requiredString(bodyOrQuery(req, 'displayName') || bodyOrQuery(req, 'name'), 'Missing displayName');
      const login = cleanLogin(requiredString(bodyOrQuery(req, 'login') || displayName, 'Missing login'));

      const state = updateState(s => {
        let existing = findPlayerStrict(s.players, login) || findPlayerStrict(s.players, displayName);
        if (existing) {
          existing.displayName = displayName;
          existing.login = login;
          existing.id = login;
          existing.active = booleanOrDefault(bodyOrQuery(req, 'active'), existing.active ?? true);
          existing.sortOrder = intOrDefault(bodyOrQuery(req, 'sortOrder'), existing.sortOrder || (s.players.length || 1));
          sanitizePlayer(existing);
        } else {
          existing = createPlayer({
            displayName,
            login,
            active: booleanOrDefault(bodyOrQuery(req, 'active'), true),
            sortOrder: intOrDefault(bodyOrQuery(req, 'sortOrder'), s.players.length + 1),
            currentGame: s.currentGame
          });
          s.players.push(existing);
        }
        syncOverlayLists(s);
        s.updatedAt = core.nowIso();
      });

      broadcastState(ctx, state, { type: 'deathcounter_v2_players_changed' });
      return res.json(ok(publicState(state)));
    } catch (err) {
      return res.status(400).json(fail(err.message));
    }
  });

  app.post('/api/deathcounter/v2/overlay/players', (req, res) => {
    try {
      const rawMain = bodyOrQuery(req, 'players') ?? bodyOrQuery(req, 'ids') ?? bodyOrQuery(req, 'playerIds') ?? bodyOrQuery(req, 'selectedPlayerIds');
      const rawExtra = bodyOrQuery(req, 'extraPlayers') ?? bodyOrQuery(req, 'extraIds') ?? bodyOrQuery(req, 'extraPlayerIds');
      const mainIds = normalizePlayerListInput(rawMain);
      const extraIds = normalizePlayerListInput(rawExtra);
      if (!mainIds.length && !extraIds.length) throw new Error('Missing players');

      const state = updateState(s => {
        if (mainIds.length) {
          s.overlay.selectedPlayerIds = mainIds.map(id => findPlayerOrThrow(s.players, id).id).slice(0, 2);
        }
        if (rawExtra !== undefined) {
          s.overlay.extraPlayerIds = extraIds
            .map(id => findPlayerOrThrow(s.players, id).id)
            .filter(id => !s.overlay.selectedPlayerIds.includes(id))
            .slice(0, MAX_EXTRA_PLAYERS);
        }
        syncOverlayLists(s);
        s.updatedAt = core.nowIso();
      });

      broadcastState(ctx, state, { type: 'deathcounter_v2_overlay_players_changed' });
      return res.json(ok(publicOverlay(state)));
    } catch (err) {
      return res.status(400).json(fail(err.message));
    }
  });

  app.get('/api/deathcounter/v2/overlay/resetplayers', (req, res) => {
    try {
      const state = updateState(s => {
        s.overlay.selectedPlayerIds = getDefaultSelectedPlayers(s.players).map(p => p.id).slice(0, 2);
        s.overlay.extraPlayerIds = [];
        syncOverlayLists(s);
        s.updatedAt = core.nowIso();
      });

      broadcastState(ctx, state, { type: 'deathcounter_v2_overlay_players_changed' });
      return res.json(ok(publicOverlay(state)));
    } catch (err) {
      return res.status(400).json(fail(err.message));
    }
  });



  app.get('/api/deathcounter/v2/overlay/replace', async (req, res) => {
    try {
      const fromRaw = requiredString(bodyOrQuery(req, 'from') || bodyOrQuery(req, 'old') || bodyOrQuery(req, 'source'), 'Missing from');
      const toRaw = requiredString(bodyOrQuery(req, 'to') || bodyOrQuery(req, 'new') || bodyOrQuery(req, 'target'), 'Missing to');

      const stateBefore = readState();
      const fromRef = await resolvePlayerReference(stateBefore.players, fromRaw);
      const toRef = await resolvePlayerReference(stateBefore.players, toRaw);

      if (fromRef.id === toRef.id) {
        throw new Error(`Austausch nicht möglich: @${fromRef.login} und @${toRef.login} sind derselbe Spieler.`);
      }

      const visibleIds = [
        ...normalizePlayerListInput(stateBefore.overlay?.selectedPlayerIds).slice(0, 2),
        ...normalizePlayerListInput(stateBefore.overlay?.extraPlayerIds).slice(0, MAX_EXTRA_PLAYERS)
      ];

      if (!visibleIds.includes(fromRef.id)) {
        throw new Error(`Austausch nicht möglich: @${fromRef.login} ist aktuell nicht im Overlay sichtbar.`);
      }

      if (visibleIds.includes(toRef.id)) {
        throw new Error(`Austausch nicht möglich: @${toRef.login} wird bereits im Overlay angezeigt.`);
      }

      let replacedIn = 'unknown';
      const state = updateState(s => {
        let targetPlayer = findPlayerStrict(s.players, toRef.login);

        if (!targetPlayer) {
          targetPlayer = createPlayer({
            displayName: toRef.displayName,
            login: toRef.login,
            active: true,
            sortOrder: s.players.length + 1,
            currentGame: s.currentGame
          });
          s.players.push(targetPlayer);
        } else {
          targetPlayer.displayName = toRef.displayName;
          targetPlayer.login = toRef.login;
          targetPlayer.id = toRef.id;
          targetPlayer.active = true;
          sanitizePlayer(targetPlayer);
        }

        const selected = normalizePlayerListInput(s.overlay.selectedPlayerIds).slice(0, 2);
        const extras = normalizePlayerListInput(s.overlay.extraPlayerIds).slice(0, MAX_EXTRA_PLAYERS);

        const selectedIdx = selected.indexOf(fromRef.id);
        if (selectedIdx >= 0) {
          selected[selectedIdx] = targetPlayer.id;
          replacedIn = 'selected';
        } else {
          const extraIdx = extras.indexOf(fromRef.id);
          if (extraIdx < 0) {
            throw new Error(`Austausch nicht möglich: @${fromRef.login} ist aktuell nicht im Overlay sichtbar.`);
          }
          extras[extraIdx] = targetPlayer.id;
          replacedIn = 'extra';
        }

        s.overlay.selectedPlayerIds = selected;
        s.overlay.extraPlayerIds = extras;
        syncOverlayLists(s);
        s.updatedAt = core.nowIso();
      });

      broadcastState(ctx, state, {
        type: 'deathcounter_v2_overlay_players_changed',
        action: 'replace',
        fromPlayerId: fromRef.id,
        toPlayerId: toRef.id,
        replacedIn
      });

      return res.json(ok({
        message: `Overlay-Spieler ersetzt: @${fromRef.login} → @${toRef.login}`,
        replacedIn,
        from: {
          id: fromRef.id,
          login: fromRef.login,
          displayName: fromRef.displayName
        },
        to: {
          id: toRef.id,
          login: toRef.login,
          displayName: toRef.displayName
        },
        overlay: publicOverlay(state).overlay,
        state: publicState(state)
      }));
    } catch (err) {
      return res.status(400).json(fail(err.message));
    }
  });

  app.post('/api/deathcounter/v2/overlay/replace', async (req, res) => {
    try {
      const fromRaw = requiredString(bodyOrQuery(req, 'from') || bodyOrQuery(req, 'old') || bodyOrQuery(req, 'source'), 'Missing from');
      const toRaw = requiredString(bodyOrQuery(req, 'to') || bodyOrQuery(req, 'new') || bodyOrQuery(req, 'target'), 'Missing to');

      const stateBefore = readState();
      const fromRef = await resolvePlayerReference(stateBefore.players, fromRaw);
      const toRef = await resolvePlayerReference(stateBefore.players, toRaw);

      if (fromRef.id === toRef.id) {
        throw new Error(`Austausch nicht möglich: @${fromRef.login} und @${toRef.login} sind derselbe Spieler.`);
      }

      const visibleIds = [
        ...normalizePlayerListInput(stateBefore.overlay?.selectedPlayerIds).slice(0, 2),
        ...normalizePlayerListInput(stateBefore.overlay?.extraPlayerIds).slice(0, MAX_EXTRA_PLAYERS)
      ];

      if (!visibleIds.includes(fromRef.id)) {
        throw new Error(`Austausch nicht möglich: @${fromRef.login} ist aktuell nicht im Overlay sichtbar.`);
      }

      if (visibleIds.includes(toRef.id)) {
        throw new Error(`Austausch nicht möglich: @${toRef.login} wird bereits im Overlay angezeigt.`);
      }

      let replacedIn = 'unknown';
      const state = updateState(s => {
        let targetPlayer = findPlayerStrict(s.players, toRef.login);

        if (!targetPlayer) {
          targetPlayer = createPlayer({
            displayName: toRef.displayName,
            login: toRef.login,
            active: true,
            sortOrder: s.players.length + 1,
            currentGame: s.currentGame
          });
          s.players.push(targetPlayer);
        } else {
          targetPlayer.displayName = toRef.displayName;
          targetPlayer.login = toRef.login;
          targetPlayer.id = toRef.id;
          targetPlayer.active = true;
          sanitizePlayer(targetPlayer);
        }

        const selected = normalizePlayerListInput(s.overlay.selectedPlayerIds).slice(0, 2);
        const extras = normalizePlayerListInput(s.overlay.extraPlayerIds).slice(0, MAX_EXTRA_PLAYERS);

        const selectedIdx = selected.indexOf(fromRef.id);
        if (selectedIdx >= 0) {
          selected[selectedIdx] = targetPlayer.id;
          replacedIn = 'selected';
        } else {
          const extraIdx = extras.indexOf(fromRef.id);
          if (extraIdx < 0) {
            throw new Error(`Austausch nicht möglich: @${fromRef.login} ist aktuell nicht im Overlay sichtbar.`);
          }
          extras[extraIdx] = targetPlayer.id;
          replacedIn = 'extra';
        }

        s.overlay.selectedPlayerIds = selected;
        s.overlay.extraPlayerIds = extras;
        syncOverlayLists(s);
        s.updatedAt = core.nowIso();
      });

      broadcastState(ctx, state, {
        type: 'deathcounter_v2_overlay_players_changed',
        action: 'replace',
        fromPlayerId: fromRef.id,
        toPlayerId: toRef.id,
        replacedIn
      });

      return res.json(ok({
        message: `Overlay-Spieler ersetzt: @${fromRef.login} → @${toRef.login}`,
        replacedIn,
        from: {
          id: fromRef.id,
          login: fromRef.login,
          displayName: fromRef.displayName
        },
        to: {
          id: toRef.id,
          login: toRef.login,
          displayName: toRef.displayName
        },
        overlay: publicOverlay(state).overlay,
        state: publicState(state)
      }));
    } catch (err) {
      return res.status(400).json(fail(err.message));
    }
  });



  app.get('/api/deathcounter/v2/rip', async (req, res) => {
    try {
      const target = requiredString(bodyOrQuery(req, 'player') || bodyOrQuery(req, 'name') || bodyOrQuery(req, 'displayName') || bodyOrQuery(req, 'login'), 'Missing player');
      const game = normalizeGameName(stringOrDefault(bodyOrQuery(req, 'game'), readState().currentGame || DEFAULT_GAME_KEY));
      const delta = intOrDefault(bodyOrQuery(req, 'delta'), 1);
      if (delta <= 0) throw new Error('Delta must be > 0');

      const stateBefore = readState();
      const existingBefore = findPlayerStrict(stateBefore.players, target);
      const lookedUpUser = existingBefore ? null : await lookupTwitchUserByName(target);

      let changedPlayer = null;
      let autoCreated = false;
      const state = updateState(s => {
        s.currentGame = game;
        ensureGameBucketsForAllPlayers(s.players, game);

        let player = findPlayerStrict(s.players, target);
        if (!player) {
          if (!lookedUpUser) {
            throw new Error(`Player not found: ${target}. Kein bestehender Spieler und kein Twitch-Lookup-Treffer.`);
          }
          player = createPlayer({
            displayName: lookedUpUser.displayName,
            login: lookedUpUser.login,
            active: true,
            sortOrder: s.players.length + 1,
            currentGame: game
          });
          s.players.push(player);
          autoCreated = true;
        }

        ensureGameStats(player, game);
        player.games[game].session += delta;
        player.games[game].allTime += delta;
        recalcAggregates(player);
        clampStats(player);

        changedPlayer = player;
        maybeTrackExtraPlayer(s, player);
        syncOverlayLists(s);
        s.updatedAt = core.nowIso();
      });

      broadcastState(ctx, state, {
        type: 'deathcounter_v2_rip',
        playerId: changedPlayer ? changedPlayer.id : null,
        game,
        delta,
        autoCreated
      });

      return res.json(ok({
        currentGame: state.currentGame,
        autoCreated,
        changedPlayer: summarizePlayer(changedPlayer, game),
        state: publicState(state),
        overlay: publicOverlay(state).overlay
      }));
    } catch (err) {
      return res.status(400).json(fail(err.message));
    }
  });

  app.post('/api/deathcounter/v2/rip', async (req, res) => {
    try {
      const target = requiredString(bodyOrQuery(req, 'player') || bodyOrQuery(req, 'name') || bodyOrQuery(req, 'displayName') || bodyOrQuery(req, 'login'), 'Missing player');
      const game = normalizeGameName(stringOrDefault(bodyOrQuery(req, 'game'), readState().currentGame || DEFAULT_GAME_KEY));
      const delta = intOrDefault(bodyOrQuery(req, 'delta'), 1);
      if (delta <= 0) throw new Error('Delta must be > 0');

      const stateBefore = readState();
      const existingBefore = findPlayerStrict(stateBefore.players, target);
      const lookedUpUser = existingBefore ? null : await lookupTwitchUserByName(target);

      let changedPlayer = null;
      let autoCreated = false;
      const state = updateState(s => {
        s.currentGame = game;
        ensureGameBucketsForAllPlayers(s.players, game);
        let player = findPlayerStrict(s.players, target);
        if (!player) {
          if (!lookedUpUser) {
            throw new Error(`Player not found: ${target}. Kein bestehender Spieler und kein Twitch-Lookup-Treffer.`);
          }
          player = createPlayer({
            displayName: lookedUpUser.displayName,
            login: lookedUpUser.login,
            active: true,
            sortOrder: s.players.length + 1,
            currentGame: game
          });
          s.players.push(player);
          autoCreated = true;
        }
        ensureGameStats(player, game);

        player.games[game].session += delta;
        player.games[game].allTime += delta;
        recalcAggregates(player);
        clampStats(player);

        changedPlayer = player;
        maybeTrackExtraPlayer(s, player);
        syncOverlayLists(s);
        s.updatedAt = core.nowIso();
      });

      broadcastState(ctx, state, {
        type: 'deathcounter_v2_rip',
        playerId: changedPlayer ? changedPlayer.id : null,
        game,
        delta,
        autoCreated
      });

      return res.json(ok({
        currentGame: state.currentGame,
        autoCreated,
        changedPlayer: summarizePlayer(changedPlayer, game),
        state: publicState(state),
        overlay: publicOverlay(state).overlay
      }));
    } catch (err) {
      return res.status(400).json(fail(err.message));
    }
  });


  app.get('/api/deathcounter/v2/del', (req, res) => {
    try {
      const target = requiredString(bodyOrQuery(req, 'player') || bodyOrQuery(req, 'name') || bodyOrQuery(req, 'displayName') || bodyOrQuery(req, 'login'), 'Missing player');
      const game = normalizeGameName(stringOrDefault(bodyOrQuery(req, 'game'), readState().currentGame || DEFAULT_GAME_KEY));
      const delta = intOrDefault(bodyOrQuery(req, 'delta'), 1);
      if (delta <= 0) throw new Error('Delta must be > 0');

      let changedPlayer = null;
      const state = updateState(s => {
        s.currentGame = game;
        ensureGameBucketsForAllPlayers(s.players, game);
        const player = findPlayerOrThrow(s.players, target);
        ensureGameStats(player, game);

        player.games[game].session = Math.max(0, player.games[game].session - delta);
        player.games[game].allTime = Math.max(0, player.games[game].allTime - delta);
        recalcAggregates(player);
        clampStats(player);

        changedPlayer = player;
        maybeTrackExtraPlayer(s, player);
        syncOverlayLists(s);
        s.updatedAt = core.nowIso();
      });

      broadcastState(ctx, state, {
        type: 'deathcounter_v2_del',
        playerId: changedPlayer ? changedPlayer.id : null,
        game,
        delta
      });

      return res.json(ok({
        currentGame: state.currentGame,
        changedPlayer: summarizePlayer(changedPlayer, game),
        state: publicState(state),
        overlay: publicOverlay(state).overlay
      }));
    } catch (err) {
      return res.status(400).json(fail(err.message));
    }
  });

  app.post('/api/deathcounter/v2/del', (req, res) => {
    try {
      const target = requiredString(bodyOrQuery(req, 'player') || bodyOrQuery(req, 'name') || bodyOrQuery(req, 'displayName') || bodyOrQuery(req, 'login'), 'Missing player');
      const game = normalizeGameName(stringOrDefault(bodyOrQuery(req, 'game'), readState().currentGame || DEFAULT_GAME_KEY));
      const delta = intOrDefault(bodyOrQuery(req, 'delta'), 1);
      if (delta <= 0) throw new Error('Delta must be > 0');

      let changedPlayer = null;
      const state = updateState(s => {
        s.currentGame = game;
        ensureGameBucketsForAllPlayers(s.players, game);
        const player = findPlayerOrThrow(s.players, target);
        ensureGameStats(player, game);

        player.games[game].session = Math.max(0, player.games[game].session - delta);
        player.games[game].allTime = Math.max(0, player.games[game].allTime - delta);
        recalcAggregates(player);
        clampStats(player);

        changedPlayer = player;
        maybeTrackExtraPlayer(s, player);
        syncOverlayLists(s);
        s.updatedAt = core.nowIso();
      });

      broadcastState(ctx, state, {
        type: 'deathcounter_v2_del',
        playerId: changedPlayer ? changedPlayer.id : null,
        game,
        delta
      });

      return res.json(ok({
        currentGame: state.currentGame,
        changedPlayer: summarizePlayer(changedPlayer, game),
        state: publicState(state),
        overlay: publicOverlay(state).overlay
      }));
    } catch (err) {
      return res.status(400).json(fail(err.message));
    }
  });


  app.get('/api/deathcounter/v2/tode', (req, res) => {
    try {
      const state = readState();
      const playerKey = stringOrDefault(bodyOrQuery(req, 'player') || bodyOrQuery(req, 'name'), null);
      const wantsJson = String(bodyOrQuery(req, 'format') || '').trim().toLowerCase() === 'json';

      if (playerKey) {
        const player = findPlayerOrThrow(state.players, playerKey);
        const detail = buildTodePlayerDetail(state, player);
        if (wantsJson) return res.json(ok(detail));
        res.type('text/plain; charset=utf-8');
        return res.send(detail.message);
      }

      const summary = buildTodeSummary(state);
      if (wantsJson) return res.json(ok(summary));
      res.type('text/plain; charset=utf-8');
      return res.send(summary.message);
    } catch (err) {
      if (String(bodyOrQuery(req, 'format') || '').trim().toLowerCase() === 'json') {
        return res.status(400).json(fail(err.message));
      }
      res.status(400).type('text/plain; charset=utf-8');
      return res.send(err.message);
    }
  });

  app.post('/api/deathcounter/v2/session-reset', (req, res) => {
    try {
      const playerKey = bodyOrQuery(req, 'player') || bodyOrQuery(req, 'name') || null;
      const game = stringOrDefault(bodyOrQuery(req, 'game'), null);

      const state = updateState(s => {
        const players = playerKey ? [findPlayerOrThrow(s.players, playerKey)] : s.players;
        players.forEach(player => {
          if (game) {
            const targetGame = normalizeGameName(game);
            ensureGameStats(player, targetGame);
            player.games[targetGame].session = 0;
          } else {
            Object.values(player.games).forEach(stats => {
              stats.session = 0;
            });
          }
          recalcAggregates(player);
        });
        syncOverlayLists(s);
        s.updatedAt = core.nowIso();
      });

      broadcastState(ctx, state, { type: 'deathcounter_v2_session_reset', player: playerKey, game });
      return res.json(ok(publicState(state)));
    } catch (err) {
      return res.status(400).json(fail(err.message));
    }
  });

  app.post('/api/deathcounter/v2/total-reset', (req, res) => {
    try {
      const playerKey = requiredString(bodyOrQuery(req, 'player') || bodyOrQuery(req, 'name'), 'Missing player');
      const game = stringOrDefault(bodyOrQuery(req, 'game'), null);

      const state = updateState(s => {
        const player = findPlayerOrThrow(s.players, playerKey);
        if (game) {
          const targetGame = normalizeGameName(game);
          ensureGameStats(player, targetGame);
          player.games[targetGame].session = 0;
          player.games[targetGame].allTime = 0;
        } else {
          Object.keys(player.games).forEach(g => {
            player.games[g].session = 0;
            player.games[g].allTime = 0;
          });
        }
        recalcAggregates(player);
        syncOverlayLists(s);
        s.updatedAt = core.nowIso();
      });

      broadcastState(ctx, state, { type: 'deathcounter_v2_total_reset', player: playerKey, game });
      return res.json(ok(publicState(state)));
    } catch (err) {
      return res.status(400).json(fail(err.message));
    }
  });

  function buildDeathcounterConfig() {
    return {
      module: 'deathcounter_v2',
      version: 2,
      prefix: API_PREFIX,
      source: 'state_file',
      dataDir,
      stateFile,
      legacyFile,
      oldStateFile,
      files: {
        dataDir: fileCheck('data_dir', dataDir, true),
        stateFile: fileCheck('state_file', stateFile, true),
        legacyFile: fileCheck('legacy_file', legacyFile, false),
        overlay: fileCheck('overlay_file', getOverlayFilePath(), true)
      },
      defaults: {
        selectedPlayerIds: [...DEFAULT_SELECTED_IDS],
        defaultGameKey: DEFAULT_GAME_KEY,
        maxExtraPlayers: MAX_EXTRA_PLAYERS
      },
      envOverrides: {
        DEATHCOUNTER_DATA_DIR: Boolean(process.env.DEATHCOUNTER_DATA_DIR),
        DEATHCOUNTER_V2_FILE: Boolean(process.env.DEATHCOUNTER_V2_FILE),
        DEATHCOUNTER_LEGACY_FILE: Boolean(process.env.DEATHCOUNTER_LEGACY_FILE)
      },
      updatedAt: core.nowIso()
    };
  }

  function buildDeathcounterSettings() {
    const state = readState();
    return {
      module: 'deathcounter_v2',
      version: 2,
      source: 'runtime_state_and_environment',
      prefix: API_PREFIX,
      settings: {
        dataDir,
        stateFile,
        legacyFile,
        overlayFile: getOverlayFilePath(),
        selectedPlayerIds: normalizePlayerListInput(state.overlay?.selectedPlayerIds).slice(0, 2),
        extraPlayerIds: normalizePlayerListInput(state.overlay?.extraPlayerIds).slice(0, MAX_EXTRA_PLAYERS),
        maxExtraPlayers: MAX_EXTRA_PLAYERS,
        defaultSelectedIds: [...DEFAULT_SELECTED_IDS],
        currentGame: state.currentGame,
        overlayVisible: Boolean(state.overlay?.visible)
      },
      updatedAt: core.nowIso()
    };
  }

  function buildDeathcounterRoutes() {
    return [
      { method: 'GET', path: `${API_PREFIX}/status`, purpose: 'runtime and state-file status' },
      { method: 'GET', path: `${API_PREFIX}/config`, purpose: 'sanitized deathcounter config/path view' },
      { method: 'GET', path: `${API_PREFIX}/settings`, purpose: 'runtime settings/state view' },
      { method: 'GET', path: `${API_PREFIX}/routes`, purpose: 'list deathcounter v2 API routes' },
      { method: 'GET', path: `${API_PREFIX}/integration-check`, purpose: 'run non-destructive integration check' },
      { method: 'POST', path: `${API_PREFIX}/reload`, purpose: 'safe state-file normalization reload' },
      { method: 'GET', path: `${API_PREFIX}/state`, purpose: 'public state for overlay/dashboard' },
      { method: 'GET', path: `${API_PREFIX}/players`, purpose: 'list players and current game' },
      { method: 'POST', path: `${API_PREFIX}/players`, purpose: 'replace configured players' },
      { method: 'GET', path: `${API_PREFIX}/overlay`, purpose: 'overlay visibility and selected players' },
      { method: 'GET/POST', path: `${API_PREFIX}/show`, purpose: 'show overlay' },
      { method: 'GET/POST', path: `${API_PREFIX}/hide`, purpose: 'hide overlay' },
      { method: 'GET/POST', path: `${API_PREFIX}/overlay/show`, purpose: 'show overlay alias' },
      { method: 'GET/POST', path: `${API_PREFIX}/overlay/hide`, purpose: 'hide overlay alias' },
      { method: 'GET/POST', path: `${API_PREFIX}/overlay/toggle`, purpose: 'toggle overlay visibility' },
      { method: 'POST', path: `${API_PREFIX}/overlay/players`, purpose: 'set overlay selected/extra players' },
      { method: 'GET', path: `${API_PREFIX}/overlay/resetplayers`, purpose: 'reset overlay players to defaults' },
      { method: 'GET/POST', path: `${API_PREFIX}/overlay/replace`, purpose: 'replace one visible overlay player' },
      { method: 'GET/POST', path: `${API_PREFIX}/game`, purpose: 'set current game' },
      { method: 'GET', path: `${API_PREFIX}/game/set`, purpose: 'legacy game setter alias' },
      { method: 'GET', path: `${API_PREFIX}/sync/channelinfo`, purpose: 'sync current game from channel info' },
      { method: 'GET', path: `${API_PREFIX}/stream-online-sync`, purpose: 'stream-start game/session sync' },
      { method: 'GET/POST', path: `${API_PREFIX}/rip`, purpose: 'increment death count' },
      { method: 'GET/POST', path: `${API_PREFIX}/del`, purpose: 'decrement death count' },
      { method: 'GET', path: `${API_PREFIX}/tode`, purpose: 'return death totals for player/game' },
      { method: 'POST', path: `${API_PREFIX}/session-reset`, purpose: 'reset session deaths' },
      { method: 'POST', path: `${API_PREFIX}/total-reset`, purpose: 'reset all-time deaths' }
    ];
  }

  function buildDeathcounterIntegrationCheck() {
    const checks = [];
    const add = check => checks.push(check);

    add(fileCheck('data_dir', dataDir, true));
    add(fileCheck('state_file', stateFile, true));
    add(fileCheck('overlay_file', getOverlayFilePath(), true));
    add(fileCheck('legacy_file', legacyFile, false));

    let state = null;
    try {
      state = readState();
      add({ name: 'runtime_state', ok: true, level: 'ok', currentGame: state.currentGame, playerCount: Array.isArray(state.players) ? state.players.length : 0 });
    } catch (err) {
      add({ name: 'runtime_state', ok: false, level: 'error', error: err.message || String(err) });
    }

    if (state) {
      add({
        name: 'players',
        ok: Array.isArray(state.players) && state.players.length > 0,
        level: Array.isArray(state.players) && state.players.length > 0 ? 'ok' : 'warning',
        count: Array.isArray(state.players) ? state.players.length : 0,
        selectedPlayerIds: normalizePlayerListInput(state.overlay?.selectedPlayerIds).slice(0, 2),
        extraPlayerIds: normalizePlayerListInput(state.overlay?.extraPlayerIds).slice(0, MAX_EXTRA_PLAYERS)
      });
      add({
        name: 'current_game',
        ok: Boolean(state.currentGame),
        level: state.currentGame ? 'ok' : 'warning',
        currentGame: state.currentGame || ''
      });
      add({
        name: 'overlay_state',
        ok: true,
        level: 'ok',
        visible: Boolean(state.overlay?.visible),
        title: state.overlay?.title || 'Death Counter'
      });
    }

    add({ name: 'routes', ok: true, level: 'ok', prefix: API_PREFIX, count: buildDeathcounterRoutes().length });

    const summary = summarizeChecks(checks);
    return {
      module: 'deathcounter_v2',
      version: 2,
      prefix: API_PREFIX,
      checks,
      summary,
      notes: [
        'This integration check is non-destructive.',
        'Productive prefix remains /api/deathcounter/v2.',
        'Reload normalizes the existing state file only; counters and overlay state are preserved.'
      ],
      updatedAt: core.nowIso()
    };
  }

  function getProjectRootSafe() {
    try {
      if (config && typeof config.getProjectRoot === 'function') {
        return config.getProjectRoot();
      }
    } catch (_) {}
    try {
      return config.resolveFromRoot();
    } catch (_) {
      return path.resolve(__dirname, '..', '..');
    }
  }

  function getOverlayFilePath() {
    return config.resolveFromRoot('htdocs', 'overlays', OVERLAY_FILE);
  }

  function fileCheck(name, targetPath, required) {
    const exists = fs.existsSync(targetPath);
    const okValue = required ? exists : true;
    return {
      name,
      ok: okValue,
      level: okValue ? 'ok' : 'warning',
      path: targetPath,
      exists,
      required: Boolean(required),
      error: okValue ? '' : 'file_not_found'
    };
  }

  function summarizeChecks(checks) {
    const total = checks.length;
    const errors = checks.filter(check => check.level === 'error').length;
    const warnings = checks.filter(check => check.level === 'warning').length;
    const okCount = checks.filter(check => check.ok).length;
    return { total, ok: okCount, warnings, errors };
  }

  console.log(`[deathcounter_v2] aktiv → ${stateFile}`);

  function ensureStateFile() {
    if (fs.existsSync(stateFile)) {
      const normalized = readState();
      writeJSON(stateFile, normalized);
      return;
    }

    if (fs.existsSync(oldStateFile)) {
      try {
        ensureDir(dataDir);
        fs.copyFileSync(oldStateFile, stateFile);
        const normalized = readState();
        writeJSON(stateFile, normalized);
        console.log(`[deathcounter_v2] State nach ${stateFile} übernommen von ${oldStateFile}`);
        return;
      } catch (err) {
        console.warn(`[deathcounter_v2] State-Übernahme fehlgeschlagen: ${err.message}`);
      }
    }

    let state = createEmptyState();
    if (fs.existsSync(legacyFile)) {
      try {
        state = migrateLegacyToV2(readJSON(legacyFile, {}));
        console.log(`[deathcounter_v2] Legacy import ausgeführt → ${legacyFile}`);
      } catch (err) {
        console.warn(`[deathcounter_v2] Legacy import fehlgeschlagen: ${err.message}`);
      }
    }
    writeJSON(stateFile, state);
  }

  function readState() {
    const state = readJSON(stateFile, createEmptyState());
    state.version = 2;
    state.updatedAt = typeof state.updatedAt === 'string' ? state.updatedAt : core.nowIso();
    state.overlay = normalizeOverlay(state.overlay);
    state.currentGame = normalizeGameName(state.currentGame || DEFAULT_GAME_KEY);
    state.players = Array.isArray(state.players) ? state.players : [];
    state.players.forEach(player => {
      sanitizePlayer(player);
      ensureGameStats(player, state.currentGame);
      recalcAggregates(player);
    });
    syncOverlayLists(state);
    return state;
  }

  function updateState(mutator) {
    const state = readState();
    mutator(state);
    syncOverlayLists(state);
    writeJSON(stateFile, state);
    return state;
  }

  function setOverlayVisibility(visible) {
    const state = updateState(s => {
      s.overlay.visible = !!visible;
      s.updatedAt = core.nowIso();
    });
    broadcastState(ctx, state, { type: visible ? 'deathcounter_v2_show' : 'deathcounter_v2_hide' });
    return state;
  }

  function setCurrentGame(game) {
    const state = updateState(s => {
      s.currentGame = normalizeGameName(game);
      ensureGameBucketsForAllPlayers(s.players, s.currentGame);
      s.overlay.selectedPlayerIds = getDefaultSelectedPlayers(s.players).map(p => p.id);
      s.overlay.extraPlayerIds = [];
      s.updatedAt = core.nowIso();
    });
    broadcastState(ctx, state, { type: 'deathcounter_v2_game_changed', game: state.currentGame });
    return state;
  }
};

function createEmptyState() {
  return {
    version: 2,
    updatedAt: core.nowIso(),
    overlay: {
      visible: false,
      title: 'Death Counter',
      selectedPlayerIds: [...DEFAULT_SELECTED_IDS],
      extraPlayerIds: []
    },
    currentGame: DEFAULT_GAME_KEY,
    players: [
      createPlayer({ displayName: 'ForrestCGN', login: 'forrestcgn', sortOrder: 1, currentGame: DEFAULT_GAME_KEY }),
      createPlayer({ displayName: 'EngelCGN', login: 'engelcgn', sortOrder: 2, currentGame: DEFAULT_GAME_KEY })
    ]
  };
}

function createPlayer({ displayName, login, active = true, sortOrder = 1, currentGame = DEFAULT_GAME_KEY }) {
  const clean = cleanLogin(login || displayName);
  return {
    id: clean,
    login: clean,
    displayName: stripAtPrefix(displayName || clean),
    active: !!active,
    sortOrder,
    stats: {
      session: 0,
      allTime: 0
    },
    games: {
      [normalizeGameName(currentGame)]: {
        session: 0,
        allTime: 0
      }
    }
  };
}

function sanitizePlayer(player) {
  player.id = cleanLogin(player.id || player.login || player.displayName || 'player');
  player.login = cleanLogin(player.login || player.id || player.displayName || 'player');
  player.displayName = stripAtPrefix((player.displayName || player.login || player.id || 'Player').toString().trim()) || player.login;
  delete player.aliases;
  player.active = !!player.active;
  player.sortOrder = intOrDefault(player.sortOrder, 999);
  player.stats = player.stats && typeof player.stats === 'object' ? player.stats : {};
  player.stats.session = intOrDefault(player.stats.session, 0);
  player.stats.allTime = intOrDefault(player.stats.allTime, intOrDefault(player.stats.total, 0));
  delete player.stats.total;
  player.games = player.games && typeof player.games === 'object' ? player.games : {};
  Object.keys(player.games).forEach(game => {
    const normalizedGame = normalizeGameName(game);
    const stats = player.games[game] || {};
    if (normalizedGame !== game) delete player.games[game];
    player.games[normalizedGame] = {
      session: intOrDefault(stats.session, 0),
      allTime: intOrDefault(stats.allTime, intOrDefault(stats.total, 0))
    };
  });
  clampStats(player);
}

function normalizeOverlay(overlay) {
  const o = overlay && typeof overlay === 'object' ? overlay : {};
  return {
    visible: !!o.visible,
    title: typeof o.title === 'string' && o.title.trim() ? o.title.trim() : 'Death Counter',
    selectedPlayerIds: normalizePlayerListInput(o.selectedPlayerIds).slice(0, 2),
    extraPlayerIds: normalizePlayerListInput(o.extraPlayerIds).slice(0, MAX_EXTRA_PLAYERS)
  };
}

function normalizeGameName(value) {
  const v = String(value || '').trim();
  return v || DEFAULT_GAME_KEY;
}

function ensureGameBucketsForAllPlayers(players, game) {
  players.forEach(player => ensureGameStats(player, game));
}

function ensureGameStats(player, game) {
  sanitizePlayer(player);
  const key = normalizeGameName(game);
  if (!player.games[key]) {
    player.games[key] = { session: 0, allTime: 0 };
  }
}

function recalcAggregates(player) {
  sanitizePlayer(player);
  let session = 0;
  let allTime = 0;
  Object.values(player.games).forEach(stats => {
    session += intOrDefault(stats.session, 0);
    allTime += intOrDefault(stats.allTime, 0);
  });
  player.stats.session = session;
  player.stats.allTime = allTime;
  clampStats(player);
}

function clampStats(player) {
  player.stats.session = Math.max(0, intOrDefault(player.stats.session, 0));
  player.stats.allTime = Math.max(0, intOrDefault(player.stats.allTime, 0));
  Object.keys(player.games).forEach(game => {
    player.games[game].session = Math.max(0, intOrDefault(player.games[game].session, 0));
    player.games[game].allTime = Math.max(0, intOrDefault(player.games[game].allTime, 0));
  });
}

function syncOverlayLists(state) {
  state.overlay = normalizeOverlay(state.overlay);
  const allowed = new Set(state.players.filter(p => p.active !== false).map(p => {
    sanitizePlayer(p);
    return p.id;
  }));

  let selected = state.overlay.selectedPlayerIds.map(cleanLogin).filter(id => allowed.has(id));
  const defaults = getDefaultSelectedPlayers(state.players).map(p => p.id);
  for (const id of defaults) {
    if (selected.length >= 2) break;
    if (!selected.includes(id)) selected.push(id);
  }
  const remaining = sortPlayers(state.players)
    .map(p => { sanitizePlayer(p); return p.id; })
    .filter(id => !selected.includes(id));
  for (const id of remaining) {
    if (selected.length >= 2) break;
    selected.push(id);
  }
  state.overlay.selectedPlayerIds = selected.slice(0, 2);

  let extra = state.overlay.extraPlayerIds.map(cleanLogin)
    .filter(id => allowed.has(id) && !state.overlay.selectedPlayerIds.includes(id));
  const uniq = [];
  for (const id of extra) {
    if (!uniq.includes(id)) uniq.push(id);
  }
  state.overlay.extraPlayerIds = uniq.slice(0, MAX_EXTRA_PLAYERS);
}

function maybeTrackExtraPlayer(state, player) {
  sanitizePlayer(player);
  const id = player.id;
  if (DEFAULT_SELECTED_IDS.includes(id)) return;
  state.overlay = normalizeOverlay(state.overlay);
  if (state.overlay.selectedPlayerIds.includes(id)) return;
  if (state.overlay.extraPlayerIds.includes(id)) return;
  state.overlay.extraPlayerIds.push(id);
  state.overlay.extraPlayerIds = state.overlay.extraPlayerIds.slice(0, MAX_EXTRA_PLAYERS);
}

function getDefaultSelectedPlayers(players) {
  const sorted = sortPlayers(players).filter(p => p.active !== false);
  const wanted = [];
  for (const wantedId of DEFAULT_SELECTED_IDS) {
    const match = sorted.find(p => cleanLogin(p.id) === wantedId || cleanLogin(p.login) === wantedId);
    if (match && !wanted.find(x => x.id === match.id)) wanted.push(match);
  }
  return wanted;
}

function publicState(state) {
  return {
    version: 2,
    updatedAt: state.updatedAt,
    currentGame: state.currentGame,
    players: sortPlayers(state.players).map(publicPlayer)
  };
}

function publicOverlay(state) {
  return {
    updatedAt: state.updatedAt,
    overlay: {
      visible: !!state.overlay?.visible,
      title: state.overlay?.title || 'Death Counter',
      selectedPlayerIds: normalizePlayerListInput(state.overlay?.selectedPlayerIds).slice(0, 2),
      extraPlayerIds: normalizePlayerListInput(state.overlay?.extraPlayerIds).slice(0, MAX_EXTRA_PLAYERS)
    }
  };
}

function publicPlayer(player) {
  sanitizePlayer(player);
  return {
    id: player.id,
    login: player.login,
    displayName: player.displayName,
    active: player.active,
    sortOrder: player.sortOrder,
    stats: {
      session: player.stats.session,
      allTime: player.stats.allTime
    },
    games: player.games
  };
}

function summarizePlayer(player, game) {
  if (!player) return null;
  sanitizePlayer(player);
  ensureGameStats(player, game);
  return {
    id: player.id,
    login: player.login,
    displayName: player.displayName,
    active: player.active,
    stats: {
      session: player.stats.session,
      allTime: player.stats.allTime
    },
    game: normalizeGameName(game),
    gameStats: {
      session: player.games[normalizeGameName(game)].session,
      allTime: player.games[normalizeGameName(game)].allTime
    }
  };
}



async function resolvePlayerReference(players, rawInput) {
  const raw = requiredString(rawInput, 'Missing player');
  const existing = findPlayerStrict(players, raw);
  if (existing) {
    sanitizePlayer(existing);
    return {
      id: existing.id,
      login: existing.login,
      displayName: existing.displayName,
      existing: true
    };
  }

  const lookedUp = await lookupTwitchUserByName(raw);
  if (!lookedUp) {
    throw new Error(`Austausch nicht möglich: @${cleanLogin(raw)} wurde auf Twitch nicht gefunden.`);
  }

  return {
    id: cleanLogin(lookedUp.login),
    login: cleanLogin(lookedUp.login),
    displayName: lookedUp.displayName,
    existing: false
  };
}

async function lookupTwitchUserByName(rawInput) {
  const cleaned = stripAtPrefix(String(rawInput || '').trim());
  const login = cleanLogin(cleaned);
  if (!login) return null;

  const sourceUrl = `http://127.0.0.1:8080/userinfo?login=${encodeURIComponent(login)}`;
  let payload;
  try {
    payload = await fetchJson(sourceUrl);
  } catch (err) {
    throw new Error(`Twitch-Lookup fehlgeschlagen für ${rawInput}: ${err.message}`);
  }

  const user = Array.isArray(payload?.data) ? payload.data[0] : null;
  if (!user) return null;

  const foundLogin = cleanLogin(user.login || user.broadcaster_login || login);
  const foundDisplay = stripAtPrefix(user.display_name || user.displayName || cleaned) || cleaned;
  if (!foundLogin) return null;

  return {
    login: foundLogin,
    displayName: foundDisplay,
    raw: user
  };
}

function buildTodeSummary(state) {
  const game = normalizeGameName(state.currentGame || DEFAULT_GAME_KEY);
  const ids = [
    ...normalizePlayerListInput(state.overlay?.selectedPlayerIds).slice(0, 2),
    ...normalizePlayerListInput(state.overlay?.extraPlayerIds).slice(0, MAX_EXTRA_PLAYERS)
  ];

  const players = ids
    .map(id => state.players.find(p => {
      sanitizePlayer(p);
      return p.id === cleanLogin(id);
    }))
    .filter(Boolean);

  const summaryPlayers = players.map(player => {
    sanitizePlayer(player);
    ensureGameStats(player, game);
    const session = intOrDefault(player.games[game]?.session, 0);
    const gameAllTime = intOrDefault(player.games[game]?.allTime, 0);
    return {
      ...summarizePlayer(player, game),
      session,
      gameAllTime
    };
  });

  const parts = summaryPlayers.map(player => `${player.displayName}: ${player.session}/${player.gameAllTime}`);

  return {
    currentGame: game,
    players: summaryPlayers,
    message: parts.length ? `${game} | ${parts.join(' | ')}` : `${game} | Keine Spieler aktiv`
  };
}

function buildTodePlayerDetail(state, player) {
  const game = normalizeGameName(state.currentGame || DEFAULT_GAME_KEY);
  sanitizePlayer(player);
  ensureGameStats(player, game);

  const session = intOrDefault(player.games[game]?.session, 0);
  const gameAllTime = intOrDefault(player.games[game]?.allTime, 0);
  const allTime = intOrDefault(player.stats?.allTime, 0);

  return {
    player: summarizePlayer(player, game),
    currentGame: game,
    message: `${player.displayName} | ${game}: Heute ${session}, Spiel gesamt ${gameAllTime} | AllTime: ${allTime}`
  };
}

function findPlayerStrict(players, rawInput) {
  const input = stripAtPrefix(String(rawInput || '').trim());
  if (!input) return null;
  const inputLogin = cleanLogin(input);
  const inputDisplay = input.toLowerCase();

  return players.find(player => {
    sanitizePlayer(player);
    return player.login === inputLogin || player.displayName.toLowerCase() === inputDisplay;
  }) || null;
}

function findPlayerOrThrow(players, rawInput) {
  const player = findPlayerStrict(players, rawInput);
  if (!player) {
    throw new Error(`Player not found: ${rawInput}. Erlaubt sind nur exakter Twitch-Loginname oder exakter Twitch-DisplayName.`);
  }
  return player;
}

function sortPlayers(players) {
  return [...players].sort((a, b) => {
    sanitizePlayer(a);
    sanitizePlayer(b);
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.displayName.localeCompare(b.displayName, 'de');
  });
}

function migrateLegacyToV2(legacy) {
  const state = createEmptyState();

  if (legacy && typeof legacy.currentGame === 'string' && legacy.currentGame.trim()) {
    state.currentGame = normalizeGameName(legacy.currentGame.trim());
  }

  if (Array.isArray(legacy.players)) {
    state.players = [];
    legacy.players.forEach((p, index) => {
      const player = createPlayer({
        displayName: p.displayName || p.name || p.login || `Player${index + 1}`,
        login: p.login || p.id || p.displayName || p.name || `player${index + 1}`,
        active: p.active !== false,
        sortOrder: intOrDefault(p.sortOrder, index + 1),
        currentGame: state.currentGame
      });

      player.games = {};
      if (p.games && typeof p.games === 'object') {
        Object.keys(p.games).forEach(game => {
          const gs = p.games[game] || {};
          player.games[normalizeGameName(game)] = {
            session: intOrDefault(gs.session, 0),
            allTime: intOrDefault(gs.allTime, intOrDefault(gs.total, 0))
          };
        });
      }

      player.stats.session = intOrDefault(p.stats?.session, player.stats.session);
      player.stats.allTime = intOrDefault(p.stats?.allTime, intOrDefault(p.stats?.total, player.stats.allTime));
      ensureGameStats(player, state.currentGame);
      recalcAggregates(player);
      state.players.push(player);
    });
  }

  syncOverlayLists(state);
  return state;
}

function broadcastState(ctx, state, event) {
  if (typeof ctx.broadcastWS !== 'function') return;
  ctx.broadcastWS({
    op: 'deathcounter_v2',
    event,
    state: publicState(state),
    overlay: publicOverlay(state).overlay
  });
}

function fetchJson(rawUrl) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch (err) {
      reject(new Error(`Ungültige URL: ${rawUrl}`));
      return;
    }

    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.get(parsed, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode} für ${rawUrl}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(new Error(`Ungültiges JSON von ${rawUrl}: ${err.message}`));
        }
      });
    });
    req.on('error', err => reject(new Error(`Request fehlgeschlagen für ${rawUrl}: ${err.message}`)));
  });
}

function ok(payload) {
  return { ok: true, ...payload };
}

function fail(error) {
  return { ok: false, error };
}

function readJSON(file, fallback) {
  return core.readJson(file, fallback);
}

function writeJSON(file, value) {
  return core.writeJson(file, value);
}

function ensureDir(dir) {
  return core.ensureDir(dir);
}

function bodyOrQuery(req, key) {
  return core.getParam(req, key, undefined);
}

function requiredString(value, message) {
  const v = String(value ?? '').trim();
  if (!v) throw new Error(message);
  return v;
}

function stringOrDefault(value, fallback) {
  const v = String(value ?? '').trim();
  return v || fallback;
}

function intOrDefault(value, fallback) {
  return core.intParam(value, fallback);
}

function booleanOrDefault(value, fallback) {
  return core.boolParam(value, fallback);
}

function normalizePlayerListInput(raw) {
  if (Array.isArray(raw)) return raw.map(v => cleanLogin(v)).filter(Boolean);
  const text = String(raw || '').trim();
  if (!text) return [];
  return text.split(/[;,|]/).map(v => cleanLogin(v)).filter(Boolean);
}

function stripAtPrefix(value) {
  return String(value || '').trim().replace(/^@+/, '');
}

function cleanLogin(value) {
  return stripAtPrefix(value).toLowerCase();
}
