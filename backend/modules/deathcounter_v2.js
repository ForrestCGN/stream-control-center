
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const database = require('../core/database');
const core = require('./helpers/helper_core');
const config = require('./helpers/helper_config');
const chatOutput = require('./helpers/helper_chat_output');
const settingsHelper = require('./helpers/helper_settings');
const textHelper = require('./helpers/helper_texts');

const DEFAULT_SELECTED_IDS = ['forrestcgn', 'engelcgn'];
const DEFAULT_GAME_KEY = 'Unbekannt';
const MAX_EXTRA_PLAYERS = 2;
const SETTINGS_TABLE = 'deathcounter_settings';
const STORAGE_SCHEMA_MODULE = 'deathcounter_v2_storage';
const STORAGE_SCHEMA_VERSION = 1;
const STORAGE_TABLES = Object.freeze({
  players: 'deathcounter_players',
  games: 'deathcounter_games',
  counts: 'deathcounter_counts',
  overlayState: 'deathcounter_overlay_state',
  events: 'deathcounter_events'
});
const DEFAULT_DEATHCOUNTER_SETTINGS = [
  { key: 'requireMentionForPlayerCommands', value: true, valueType: 'boolean', description: 'Wenn aktiv, muessen Spieler in Chat-Commands als @Erwaehnung uebergeben werden.' },
  { key: 'chatOutputEnabled', value: true, valueType: 'boolean', description: 'Wenn aktiv, sendet DeathCounter Chatantworten primaer ueber helper_chat_output.' },
  { key: 'fallbackToStreamerbot', value: true, valueType: 'boolean', description: 'Wenn Backend-Chatversand fehlschlaegt, darf Streamer.bot streamerbot_message als Fallback senden.' },
  { key: 'fallbackToStreamer', value: true, valueType: 'boolean', description: 'helper_chat_output darf nach Bot-Account auf Streamer-Account fallbacken.' },
  { key: 'chatOutputPrefer', value: 'bot', valueType: 'string', description: 'Bevorzugter Chat-Ausgabeaccount fuer helper_chat_output.' },
  { key: 'directSendEnabled', value: true, valueType: 'boolean', description: 'Direkter IRC-Chatversand ueber helper_chat_output ist erlaubt.' },
  { key: 'autoCreatePlayers', value: true, valueType: 'boolean', description: 'Neue Spieler duerfen bei RIP automatisch angelegt werden.' },
  { key: 'allowTwitchLookup', value: true, valueType: 'boolean', description: 'Twitch-Lookup darf genutzt werden, wenn ein Spieler noch nicht existiert.' },
  { key: 'defaultSelectedIds', value: DEFAULT_SELECTED_IDS, valueType: 'json', description: 'Standardspieler fuer das Overlay.' },
  { key: 'maxExtraPlayers', value: MAX_EXTRA_PLAYERS, valueType: 'number', description: 'Maximale Anzahl zusaetzlicher Overlay-Spieler.' },
  { key: 'resetSessionOnStreamStart', value: true, valueType: 'boolean', description: 'Beim Streamstart werden Session-Tode zurueckgesetzt.' },
  { key: 'resetOverlayPlayersOnStreamStart', value: true, valueType: 'boolean', description: 'Beim Streamstart werden Overlay-Spieler auf Standard zurueckgesetzt.' }
];

const TEXTS_MODULE = 'deathcounter';
const DEATHCOUNTER_TEXT_CATEGORY_LABELS = {
  command: 'Chat-Commands',
  error: 'Fehler / Hinweise',
  stats: 'Tode / Statistiken'
};
const DEATHCOUNTER_TEXT_CATEGORIES = {
  rip_missing_player: 'error',
  rip_missing_mention: 'error',
  tode_missing_mention: 'error',
  dcount_replace_missing: 'error',
  dcount_replace_mention: 'error',
  dcount_replace_same_player: 'error',
  dcount_add_missing: 'error',
  dcount_remove_missing: 'error',
  dcount_extra_duplicate: 'error',
  dcount_extra_limit: 'error',
  dcount_extra_not_visible: 'error',
  dcount_unknown_command: 'error',
  command_error_default: 'error',
  command_unknown_empty: 'error',
  command_unknown_allowed: 'error',
  tode_summary: 'stats',
  tode_summary_empty: 'stats',
  tode_summary_player: 'stats',
  tode_player_detail: 'stats'
};
const DEFAULT_DEATHCOUNTER_TEXTS = {
  rip_missing_player: ['Nutze: !rip @spieler'],
  rip_missing_mention: ['Bitte nutze eine Twitch-Erwähnung, z. B. !rip @ForrestCGN'],
  tode_missing_mention: ['Bitte nutze eine Twitch-Erwähnung, z. B. !tode @ForrestCGN'],
  dcount_replace_missing: ['Ungültiger Replace-Befehl. Nutze: !dcount replace @alt @neu'],
  dcount_replace_mention: ['Bitte nutze: !dcount replace @alterName @neuerName'],
  dcount_replace_same_player: ['Austausch nicht möglich: alter und neuer Spieler sind identisch.'],
  dcount_add_missing: ['Nutze: !dcount add @spieler'],
  dcount_remove_missing: ['Nutze: !dcount remove @spieler'],
  dcount_extra_duplicate: ['{displayName} ist bereits im Overlay sichtbar.'],
  dcount_extra_limit: ['Es sind maximal {maxExtraPlayers} Zusatzspieler möglich.'],
  dcount_extra_not_visible: ['{displayName} ist nicht als Zusatzspieler sichtbar.'],
  dcount_unknown_command: ['Unbekannter DCOUNT-Befehl. Erlaubt: on/show, off/hide, reset, add @spieler, remove @spieler, clear, replace @alt @neu'],
  command_error_default: ['DeathCounter-Befehl konnte nicht verarbeitet werden.'],
  command_unknown_empty: ['Unbekannter DeathCounter-Befehl.'],
  command_unknown_allowed: ['Unbekannter DeathCounter-Befehl. Erlaubt: dcount, rip, tode.'],
  tode_summary: ['{game} | {players}'],
  tode_summary_empty: ['{game} | Keine Spieler aktiv'],
  tode_summary_player: ['{displayName}: {session}/{gameAllTime}'],
  tode_player_detail: ['{displayName} | {game}: Heute {session}, Spiel gesamt {gameAllTime} | AllTime: {allTime}']
};

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
  ensureDeathcounterSettings();
  ensureDeathcounterStorageSchema();

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

  app.get(`${API_PREFIX}/admin/settings`, (req, res) => {
    return res.json(ok(buildDeathcounterAdminSettings()));
  });

  app.post(`${API_PREFIX}/admin/settings`, (req, res) => {
    try {
      const result = updateDeathcounterAdminSettings(req.body || req.query || {});
      return res.json(ok(result));
    } catch (err) {
      return res.status(400).json(fail(err.message || String(err)));
    }
  });

  app.get(`${API_PREFIX}/admin/texts`, (req, res) => {
    try {
      return res.json(ok(buildDeathcounterAdminTexts()));
    } catch (err) {
      return res.status(500).json(fail(err.message || String(err)));
    }
  });

  app.post(`${API_PREFIX}/admin/texts`, (req, res) => {
    try {
      const result = updateDeathcounterAdminTexts(req.body || req.query || {});
      return res.json(ok(result));
    } catch (err) {
      return res.status(400).json(fail(err.message || String(err)));
    }
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



  app.get('/api/deathcounter/v2/command', async (req, res) => {
    const result = await handleDeathcounterCommand(req);
    return res.status(result.httpStatus || 200).json(result.payload);
  });

  app.post('/api/deathcounter/v2/command', async (req, res) => {
    const result = await handleDeathcounterCommand(req);
    return res.status(result.httpStatus || 200).json(result.payload);
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

      const runtimeSettings = getDeathcounterRuntimeSettings();
      const state = updateState(s => {
        s.currentGame = game;
        ensureGameBucketsForAllPlayers(s.players, game);
        if (runtimeSettings.resetSessionOnStreamStart) {
          for (const player of s.players) {
            sanitizePlayer(player);
            for (const key of Object.keys(player.games || {})) {
              ensureGameStats(player, key);
              player.games[key].session = 0;
            }
            recalcAggregates(player);
            clampStats(player);
          }
        }
        if (runtimeSettings.resetOverlayPlayersOnStreamStart) {
          s.overlay.selectedPlayerIds = getDefaultSelectedPlayers(s.players).map(p => p.id).slice(0, 2);
          s.overlay.extraPlayerIds = [];
        }
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
        settings: {
          resetSessionOnStreamStart: runtimeSettings.resetSessionOnStreamStart,
          resetOverlayPlayersOnStreamStart: runtimeSettings.resetOverlayPlayersOnStreamStart
        },
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
            .slice(0, getMaxExtraPlayersSafe());
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
        ...normalizePlayerListInput(stateBefore.overlay?.extraPlayerIds).slice(0, getMaxExtraPlayersSafe())
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
        const extras = normalizePlayerListInput(s.overlay.extraPlayerIds).slice(0, getMaxExtraPlayersSafe());

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
        ...normalizePlayerListInput(stateBefore.overlay?.extraPlayerIds).slice(0, getMaxExtraPlayersSafe())
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
        const extras = normalizePlayerListInput(s.overlay.extraPlayerIds).slice(0, getMaxExtraPlayersSafe());

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


  async function handleDeathcounterCommand(req) {
    const command = String(bodyOrQuery(req, 'command') || bodyOrQuery(req, 'cmd') || '').trim().toLowerCase();

    try {
      if (!command) return await commandUserError(req, 'unknown', deathcounterText('command_unknown_empty'));

      if (command === 'dcount' || command === 'deathcount' || command === 'deathcounter') {
        return await commandOk(req, command, await handleDcountCommand(req));
      }

      if (command === 'rip' || command === 'death' || command === 'tod') {
        return await commandOk(req, command, await handleRipCommand(req));
      }

      if (command === 'tode' || command === 'deaths') {
        return await commandOk(req, command, await handleTodeCommand(req));
      }

      return await commandUserError(req, command, deathcounterText('command_unknown_allowed'));
    } catch (err) {
      return await commandUserError(req, command || 'unknown', err.message || 'Interner Fehler im DeathCounter-Command.');
    }
  }

  async function handleDcountCommand(req) {
    const args = collectCommandArgs(req);
    const modeRaw = String(args[0] || '').trim();
    const modeToken = modeRaw ? modeRaw.toLowerCase() : 'toggle';
    const modeAliases = {
      plus: 'add',
      '+': 'add',
      rm: 'remove',
      rem: 'remove',
      delete: 'remove',
      extras: 'clear',
      clearall: 'clear',
      clear_extra: 'clear',
      clearextra: 'clear',
      clearextras: 'clear'
    };
    const mode = modeAliases[modeToken] || modeToken;

    if (mode === 'show' || mode === 'on') {
      const state = setOverlayVisibility(true);
      return streamerbotSilent({ action: 'show', overlay: publicOverlay(state).overlay });
    }

    if (mode === 'hide' || mode === 'off') {
      const state = setOverlayVisibility(false);
      return streamerbotSilent({ action: 'hide', overlay: publicOverlay(state).overlay });
    }

    if (mode === 'reset') {
      const state = resetOverlayPlayersToDefault();
      return streamerbotSilent({ action: 'reset', overlay: publicOverlay(state).overlay });
    }

    if (mode === 'add') {
      const targetRaw = args[1] || '';
      if (!targetRaw) {
        return streamerbotMessage(deathcounterText('dcount_add_missing'), { action: 'add', success: false });
      }

      const parsed = parseCommandPlayerToken(targetRaw, getCommandOptions(req), deathcounterText('dcount_add_missing'));
      if (!parsed.login) {
        return streamerbotMessage(deathcounterText('dcount_add_missing'), { action: 'add', success: false });
      }

      const added = await addOverlayExtraPlayer(parsed.login);
      return streamerbotSilent({ action: 'add', ...added });
    }

    if (mode === 'remove') {
      const targetRaw = args[1] || '';
      if (!targetRaw) {
        return streamerbotMessage(deathcounterText('dcount_remove_missing'), { action: 'remove', success: false });
      }

      const parsed = parseCommandPlayerToken(targetRaw, getCommandOptions(req), deathcounterText('dcount_remove_missing'));
      if (!parsed.login) {
        return streamerbotMessage(deathcounterText('dcount_remove_missing'), { action: 'remove', success: false });
      }

      const removed = await removeOverlayExtraPlayer(parsed.login);
      return streamerbotSilent({ action: 'remove', ...removed });
    }

    if (mode === 'clear') {
      const cleared = clearOverlayExtraPlayers();
      return streamerbotSilent({ action: 'clear', ...cleared });
    }

    if (mode === 'replace') {
      const fromRaw = args[1] || '';
      const toRaw = args[2] || '';
      if (!fromRaw || !toRaw) {
        return streamerbotMessage(deathcounterText('dcount_replace_missing'), { action: 'replace', success: false });
      }

      const from = parseCommandPlayerToken(fromRaw, getCommandOptions(req), deathcounterText('dcount_replace_mention'));
      const to = parseCommandPlayerToken(toRaw, getCommandOptions(req), deathcounterText('dcount_replace_mention'));
      if (!from.login || !to.login) {
        return streamerbotMessage(deathcounterText('dcount_replace_missing'), { action: 'replace', success: false });
      }
      if (from.login === to.login) {
        return streamerbotMessage(deathcounterText('dcount_replace_same_player'), { action: 'replace', success: false });
      }

      const replaced = await replaceOverlayPlayer(from.login, to.login);
      return streamerbotSilent({ action: 'replace', ...replaced });
    }

    if (mode === 'toggle') {
      const stateBefore = readState();
      const state = setOverlayVisibility(!stateBefore.overlay?.visible);
      return streamerbotSilent({ action: 'toggle', overlay: publicOverlay(state).overlay });
    }

    return streamerbotMessage(deathcounterText('dcount_unknown_command'), {
      action: 'unknown',
      success: false
    });
  }

  async function handleRipCommand(req) {
    const args = collectCommandArgs(req);
    let targetRaw = args[0] || '';
    let mode = 'rip';

    if (!targetRaw) {
      return streamerbotMessage(deathcounterText('rip_missing_player'), { action: 'rip', success: false });
    }

    if (String(args[1] || '').trim().toLowerCase() === 'del') {
      mode = 'del';
    }

    const parsed = parseCommandPlayerToken(targetRaw, getCommandOptions(req), deathcounterText('rip_missing_mention'));
    if (!parsed.login) {
      return streamerbotMessage(deathcounterText('rip_missing_player'), { action: 'rip', success: false });
    }

    const game = normalizeGameName(stringOrDefault(bodyOrQuery(req, 'game'), readState().currentGame || DEFAULT_GAME_KEY));
    const delta = intOrDefault(bodyOrQuery(req, 'delta'), 1);
    if (delta <= 0) throw new Error('Delta must be > 0');

    const result = await applyDeathDelta({
      target: parsed.login,
      game,
      delta,
      direction: mode === 'del' ? -1 : 1
    });

    return streamerbotSilent({ action: mode, ...result });
  }

  async function handleTodeCommand(req) {
    const args = collectCommandArgs(req);
    const targetRaw = args[0] || '';
    const state = readState();

    if (targetRaw) {
      const parsed = parseCommandPlayerToken(targetRaw, getCommandOptions(req), deathcounterText('tode_missing_mention'));
      const player = findPlayerOrThrow(state.players, parsed.login);
      const detail = buildTodePlayerDetail(state, player);
      return streamerbotMessage(detail.message, { action: 'tode', detail });
    }

    const summary = buildTodeSummary(state);
    return streamerbotMessage(summary.message, { action: 'tode', summary });
  }

  function collectCommandArgs(req) {
    const rawInput = String(bodyOrQuery(req, 'rawInput') || bodyOrQuery(req, 'input') || '').trim();
    if (rawInput) return normalizeCommandArgs(req, splitCommandArgs(rawInput));

    const args = [];
    for (let i = 0; i <= 9; i += 1) {
      const value = bodyOrQuery(req, `input${i}`);
      if (value === undefined || value === null) continue;
      const text = String(value).trim();
      if (text) args.push(text);
    }
    return normalizeCommandArgs(req, args);
  }

  function splitCommandArgs(input) {
    return String(input || '').trim().split(/\s+/).filter(Boolean);
  }

  function normalizeCommandArgs(req, args) {
    const list = Array.isArray(args) ? args.filter(v => String(v || '').trim()) : [];
    if (!list.length) return [];

    const command = String(bodyOrQuery(req, 'command') || bodyOrQuery(req, 'cmd') || '').trim().toLowerCase();
    const first = normalizeCommandToken(list[0]);

    if (isCommandAliasForCurrentCommand(command, first)) {
      return list.slice(1);
    }

    return list;
  }

  function normalizeCommandToken(value) {
    return String(value || '')
      .trim()
      .replace(/^[!./]+/, '')
      .toLowerCase();
  }

  function isCommandAliasForCurrentCommand(command, token) {
    if (!command || !token) return false;

    const aliases = {
      dcount: ['dcount', 'deathcount', 'deathcounter'],
      deathcount: ['dcount', 'deathcount', 'deathcounter'],
      deathcounter: ['dcount', 'deathcount', 'deathcounter'],
      rip: ['rip', 'death', 'tod'],
      death: ['rip', 'death', 'tod'],
      tod: ['rip', 'death', 'tod'],
      tode: ['tode', 'deaths'],
      deaths: ['tode', 'deaths']
    };

    const allowed = aliases[command] || [command];
    return allowed.includes(token);
  }

  function getCommandOptions(req) {
    const runtimeSettings = getDeathcounterRuntimeSettings();
    return {
      requireMentionForPlayerCommands: commandBooleanOption(req, 'requireMention', runtimeSettings.requireMentionForPlayerCommands),
      autoCreatePlayers: commandBooleanOption(req, 'autoCreatePlayers', runtimeSettings.autoCreatePlayers),
      allowTwitchLookup: commandBooleanOption(req, 'allowTwitchLookup', runtimeSettings.allowTwitchLookup),
      chatOutputEnabled: commandBooleanOption(req, 'chatOutputEnabled', runtimeSettings.chatOutputEnabled),
      fallbackToStreamerbot: commandBooleanOption(req, 'fallbackToStreamerbot', runtimeSettings.fallbackToStreamerbot),
      fallbackToStreamer: commandBooleanOption(req, 'fallbackToStreamer', runtimeSettings.fallbackToStreamer),
      chatOutputPrefer: String(bodyOrQuery(req, 'chatPrefer') || bodyOrQuery(req, 'prefer') || runtimeSettings.chatOutputPrefer || 'bot').trim() || 'bot',
      directSendEnabled: commandBooleanOption(req, 'directSendEnabled', runtimeSettings.directSendEnabled)
    };
  }

  function parseCommandPlayerToken(rawToken, options, missingMentionMessage) {
    const raw = String(rawToken || '').trim();
    const mentioned = raw.startsWith('@');
    if (options.requireMentionForPlayerCommands && !mentioned) {
      throw new Error(missingMentionMessage || 'Bitte nutze eine Twitch-Erwähnung mit @.');
    }
    const cleaned = stripAtPrefix(raw);
    return {
      raw,
      mentioned,
      login: cleanLogin(cleaned),
      displayName: cleaned
    };
  }

  function streamerbotSilent(extra = {}) {
    return {
      success: true,
      streamerbot_send: '0',
      streamerbot_message: '',
      ...extra
    };
  }

  function streamerbotMessage(message, extra = {}) {
    return {
      success: extra.success !== false,
      streamerbot_send: message ? '1' : '0',
      streamerbot_message: message || '',
      ...extra
    };
  }

  async function commandOk(req, command, payload) {
    const responsePayload = await applyCommandChatOutput(req, command, {
      module: 'deathcounter_v2',
      version: 2,
      command,
      updatedAt: core.nowIso(),
      ...payload
    });

    return {
      httpStatus: 200,
      payload: ok(responsePayload)
    };
  }

  async function commandUserError(req, command, message) {
    const text = message || deathcounterText('command_error_default');
    const responsePayload = await applyCommandChatOutput(req, command, {
      module: 'deathcounter_v2',
      version: 2,
      command,
      success: false,
      streamerbot_send: '1',
      streamerbot_message: text,
      error: text,
      updatedAt: core.nowIso()
    });

    return {
      httpStatus: 200,
      payload: ok(responsePayload)
    };
  }

  async function applyCommandChatOutput(req, command, payload) {
    const message = String(payload?.streamerbot_message || '').trim();
    if (!message || payload.streamerbot_send !== '1') {
      return {
        ...payload,
        chat_output_attempted: false,
        chat_sent: false
      };
    }

    const commandOptions = getCommandOptions(req);
    if (!commandOptions.chatOutputEnabled || isDisabledFlag(bodyOrQuery(req, 'chatOutput')) || isDisabledFlag(bodyOrQuery(req, 'sendChat'))) {
      return {
        ...payload,
        chat_output_attempted: false,
        chat_sent: false,
        chat_output_skipped: true
      };
    }

    try {
      const result = await chatOutput.sendChatMessage(message, {
        source: 'deathcounter_v2',
        reason: `command_${command || 'unknown'}`,
        prefer: commandOptions.chatOutputPrefer,
        fallbackToStreamerbot: commandOptions.fallbackToStreamerbot,
        fallbackToStreamer: commandOptions.fallbackToStreamer,
        directSendEnabled: commandOptions.directSendEnabled,
        maxLength: intOrDefault(bodyOrQuery(req, 'maxLength'), 450)
      });

      return {
        ...payload,
        chat_output_attempted: true,
        chat_sent: !!result.sent,
        chat_output: summarizeChatOutputResult(result),
        streamerbot_send: result.streamerbot_send || (result.sent ? '0' : payload.streamerbot_send),
        streamerbot_message: result.streamerbot_message !== undefined ? result.streamerbot_message : payload.streamerbot_message
      };
    } catch (err) {
      return {
        ...payload,
        chat_output_attempted: true,
        chat_sent: false,
        chat_output: {
          ok: false,
          error: err.message || String(err),
          via: 'exception'
        },
        streamerbot_send: '1',
        streamerbot_message: message
      };
    }
  }

  function commandBooleanOption(req, key, fallback) {
    const value = bodyOrQuery(req, key);
    if (value === undefined || value === null || String(value).trim() === '') return fallback;
    return booleanOrDefault(value, fallback);
  }

  function summarizeChatOutputResult(result) {
    if (!result || typeof result !== 'object') {
      return { ok: false, error: 'invalid_chat_output_result' };
    }
    return {
      ok: result.ok !== false,
      sent: !!result.sent,
      send: !!result.send,
      via: result.via || '',
      account: result.account || '',
      reason: result.reason || result.streamerbot_reason || '',
      source: result.source || 'deathcounter_v2',
      fallback: result.streamerbot_send === '1',
      error: result.error || ''
    };
  }

  function isDisabledFlag(value) {
    if (value === undefined || value === null) return false;
    const text = String(value).trim().toLowerCase();
    return text === '0' || text === 'false' || text === 'off' || text === 'no';
  }

  function resetOverlayPlayersToDefault() {
    const state = updateState(s => {
      s.overlay.selectedPlayerIds = getDefaultSelectedPlayers(s.players).map(p => p.id).slice(0, 2);
      s.overlay.extraPlayerIds = [];
      syncOverlayLists(s);
      s.updatedAt = core.nowIso();
    });

    broadcastState(ctx, state, { type: 'deathcounter_v2_overlay_players_changed' });
    return state;
  }

  async function replaceOverlayPlayer(fromRaw, toRaw) {
    const stateBefore = readState();
    const fromRef = await resolvePlayerReference(stateBefore.players, fromRaw);
    const toRef = await resolvePlayerReference(stateBefore.players, toRaw);

    if (fromRef.id === toRef.id) {
      throw new Error(`Austausch nicht möglich: @${fromRef.login} und @${toRef.login} sind derselbe Spieler.`);
    }

    const visibleIds = [
      ...normalizePlayerListInput(stateBefore.overlay?.selectedPlayerIds).slice(0, 2),
      ...normalizePlayerListInput(stateBefore.overlay?.extraPlayerIds).slice(0, getMaxExtraPlayersSafe())
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
      const extras = normalizePlayerListInput(s.overlay.extraPlayerIds).slice(0, getMaxExtraPlayersSafe());

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

    return {
      replacedIn,
      from: { id: fromRef.id, login: fromRef.login, displayName: fromRef.displayName },
      to: { id: toRef.id, login: toRef.login, displayName: toRef.displayName },
      overlay: publicOverlay(state).overlay,
      state: publicState(state)
    };
  }

  async function addOverlayExtraPlayer(targetRaw) {
    const stateBefore = readState();
    const targetRef = await resolvePlayerReference(stateBefore.players, targetRaw);
    const maxExtraPlayers = getMaxExtraPlayersSafe();
    const visibleIds = [
      ...normalizePlayerListInput(stateBefore.overlay?.selectedPlayerIds).slice(0, 2),
      ...normalizePlayerListInput(stateBefore.overlay?.extraPlayerIds).slice(0, maxExtraPlayers)
    ];

    if (visibleIds.includes(targetRef.id)) {
      throw new Error(deathcounterText('dcount_extra_duplicate', { displayName: targetRef.displayName || `@${targetRef.login}` }));
    }

    const extrasBefore = normalizePlayerListInput(stateBefore.overlay?.extraPlayerIds).slice(0, maxExtraPlayers);
    if (extrasBefore.length >= maxExtraPlayers) {
      throw new Error(deathcounterText('dcount_extra_limit', { maxExtraPlayers }));
    }

    const state = updateState(s => {
      let targetPlayer = findPlayerStrict(s.players, targetRef.login);

      if (!targetPlayer) {
        targetPlayer = createPlayer({
          displayName: targetRef.displayName,
          login: targetRef.login,
          active: true,
          sortOrder: s.players.length + 1,
          currentGame: s.currentGame
        });
        s.players.push(targetPlayer);
      } else {
        targetPlayer.displayName = targetRef.displayName;
        targetPlayer.login = targetRef.login;
        targetPlayer.id = targetRef.id;
        targetPlayer.active = true;
        sanitizePlayer(targetPlayer);
      }

      const selected = normalizePlayerListInput(s.overlay.selectedPlayerIds).slice(0, 2);
      const extras = normalizePlayerListInput(s.overlay.extraPlayerIds)
        .filter(id => id !== targetPlayer.id && !selected.includes(id))
        .slice(0, maxExtraPlayers);

      if (extras.length >= maxExtraPlayers) {
        throw new Error(deathcounterText('dcount_extra_limit', { maxExtraPlayers }));
      }

      extras.push(targetPlayer.id);
      s.overlay.selectedPlayerIds = selected;
      s.overlay.extraPlayerIds = extras.slice(0, maxExtraPlayers);
      syncOverlayLists(s);
      s.updatedAt = core.nowIso();
    });

    broadcastState(ctx, state, {
      type: 'deathcounter_v2_overlay_players_changed',
      action: 'add_extra',
      playerId: targetRef.id
    });

    return {
      added: true,
      player: { id: targetRef.id, login: targetRef.login, displayName: targetRef.displayName },
      overlay: publicOverlay(state).overlay,
      state: publicState(state)
    };
  }

  async function removeOverlayExtraPlayer(targetRaw) {
    const stateBefore = readState();
    const targetRef = await resolvePlayerReference(stateBefore.players, targetRaw);
    const maxExtraPlayers = getMaxExtraPlayersSafe();
    const selected = normalizePlayerListInput(stateBefore.overlay?.selectedPlayerIds).slice(0, 2);
    const extrasBefore = normalizePlayerListInput(stateBefore.overlay?.extraPlayerIds).slice(0, maxExtraPlayers);

    if (selected.includes(targetRef.id) || !extrasBefore.includes(targetRef.id)) {
      throw new Error(deathcounterText('dcount_extra_not_visible', { displayName: targetRef.displayName || `@${targetRef.login}` }));
    }

    const state = updateState(s => {
      s.overlay.extraPlayerIds = normalizePlayerListInput(s.overlay.extraPlayerIds)
        .filter(id => id !== targetRef.id)
        .slice(0, maxExtraPlayers);
      syncOverlayLists(s);
      s.updatedAt = core.nowIso();
    });

    broadcastState(ctx, state, {
      type: 'deathcounter_v2_overlay_players_changed',
      action: 'remove_extra',
      playerId: targetRef.id
    });

    return {
      removed: true,
      player: { id: targetRef.id, login: targetRef.login, displayName: targetRef.displayName },
      overlay: publicOverlay(state).overlay,
      state: publicState(state)
    };
  }

  function clearOverlayExtraPlayers() {
    const state = updateState(s => {
      s.overlay.extraPlayerIds = [];
      syncOverlayLists(s);
      s.updatedAt = core.nowIso();
    });

    broadcastState(ctx, state, {
      type: 'deathcounter_v2_overlay_players_changed',
      action: 'clear_extra'
    });

    return {
      cleared: true,
      overlay: publicOverlay(state).overlay,
      state: publicState(state)
    };
  }

  async function applyDeathDelta({ target, game, delta, direction }) {
    const isIncrement = direction > 0;
    const runtimeSettings = getDeathcounterRuntimeSettings();
    const stateBefore = readState();
    const existingBefore = findPlayerStrict(stateBefore.players, target);
    const canAutoCreate = runtimeSettings.autoCreatePlayers !== false;
    const canLookup = runtimeSettings.allowTwitchLookup !== false;
    const lookedUpUser = isIncrement && !existingBefore && canAutoCreate && canLookup ? await lookupTwitchUserByName(target) : null;

    let changedPlayer = null;
    let autoCreated = false;
    const state = updateState(s => {
      s.currentGame = game;
      ensureGameBucketsForAllPlayers(s.players, game);

      let player = findPlayerStrict(s.players, target);
      if (!player) {
        if (!isIncrement) {
          throw new Error(`Player not found: ${target}. Erlaubt sind nur exakter Twitch-Loginname oder exakter Twitch-DisplayName.`);
        }
        if (!canAutoCreate) {
          throw new Error(`Player not found: ${target}. Automatisches Anlegen ist deaktiviert.`);
        }
        if (!canLookup) {
          throw new Error(`Player not found: ${target}. Twitch-Lookup ist deaktiviert.`);
        }
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
      if (isIncrement) {
        player.games[game].session += delta;
        player.games[game].allTime += delta;
      } else {
        player.games[game].session = Math.max(0, player.games[game].session - delta);
        player.games[game].allTime = Math.max(0, player.games[game].allTime - delta);
      }
      recalcAggregates(player);
      clampStats(player);

      changedPlayer = player;
      maybeTrackExtraPlayer(s, player);
      syncOverlayLists(s);
      s.updatedAt = core.nowIso();
    });

    broadcastState(ctx, state, {
      type: isIncrement ? 'deathcounter_v2_rip' : 'deathcounter_v2_del',
      playerId: changedPlayer ? changedPlayer.id : null,
      game,
      delta,
      autoCreated
    });

    return {
      currentGame: state.currentGame,
      autoCreated,
      changedPlayer: summarizePlayer(changedPlayer, game),
      state: publicState(state),
      overlay: publicOverlay(state).overlay
    };
  }

  function ensureDeathcounterSettings() {
    try {
      return settingsHelper.seedDefaults(SETTINGS_TABLE, DEFAULT_DEATHCOUNTER_SETTINGS);
    } catch (err) {
      console.warn('[deathcounter_v2] settings seed failed:', err.message || String(err));
      return { ok: false, table: SETTINGS_TABLE, error: err.message || String(err) };
    }
  }


  function ensureDeathcounterStorageSchema() {
    try {
      database.ensureReady();
      const ensuredVersion = database.ensureSchema(STORAGE_SCHEMA_MODULE, STORAGE_SCHEMA_VERSION, (fromVersion, toVersion) => {
        if (toVersion !== 1) return;

        database.exec(`
          CREATE TABLE IF NOT EXISTS ${database.quoteIdentifier(STORAGE_TABLES.players)} (
            id TEXT PRIMARY KEY,
            login TEXT NOT NULL,
            display_name TEXT NOT NULL,
            active ${database.boolTypeSql()} NOT NULL DEFAULT 1,
            sort_order ${database.integerTypeSql()} NOT NULL DEFAULT 0,
            source TEXT NOT NULL DEFAULT 'prepared',
            created_at ${database.dateTimeTypeSql()} NOT NULL,
            updated_at ${database.dateTimeTypeSql()} NOT NULL
          );
        `);

        database.exec(`
          CREATE UNIQUE INDEX IF NOT EXISTS idx_deathcounter_players_login
          ON ${database.quoteIdentifier(STORAGE_TABLES.players)} (login);
        `);

        database.exec(`
          CREATE TABLE IF NOT EXISTS ${database.quoteIdentifier(STORAGE_TABLES.games)} (
            game_key TEXT PRIMARY KEY,
            display_name TEXT NOT NULL,
            source TEXT NOT NULL DEFAULT 'prepared',
            created_at ${database.dateTimeTypeSql()} NOT NULL,
            updated_at ${database.dateTimeTypeSql()} NOT NULL
          );
        `);

        database.exec(`
          CREATE TABLE IF NOT EXISTS ${database.quoteIdentifier(STORAGE_TABLES.counts)} (
            player_id TEXT NOT NULL,
            game_key TEXT NOT NULL,
            session_deaths ${database.integerTypeSql()} NOT NULL DEFAULT 0,
            all_time_deaths ${database.integerTypeSql()} NOT NULL DEFAULT 0,
            source TEXT NOT NULL DEFAULT 'prepared',
            created_at ${database.dateTimeTypeSql()} NOT NULL,
            updated_at ${database.dateTimeTypeSql()} NOT NULL,
            PRIMARY KEY (player_id, game_key)
          );
        `);

        database.exec(`
          CREATE INDEX IF NOT EXISTS idx_deathcounter_counts_game
          ON ${database.quoteIdentifier(STORAGE_TABLES.counts)} (game_key);
        `);

        database.exec(`
          CREATE TABLE IF NOT EXISTS ${database.quoteIdentifier(STORAGE_TABLES.overlayState)} (
            state_key TEXT PRIMARY KEY,
            state_value ${database.textTypeSql({ long: true })} NOT NULL,
            value_type TEXT NOT NULL DEFAULT 'json',
            source TEXT NOT NULL DEFAULT 'prepared',
            created_at ${database.dateTimeTypeSql()} NOT NULL,
            updated_at ${database.dateTimeTypeSql()} NOT NULL
          );
        `);

        database.exec(`
          CREATE TABLE IF NOT EXISTS ${database.quoteIdentifier(STORAGE_TABLES.events)} (
            id ${database.primaryKeyAutoIncrementSql()},
            event_uid TEXT NOT NULL DEFAULT '',
            event_type TEXT NOT NULL,
            player_id TEXT NOT NULL DEFAULT '',
            game_key TEXT NOT NULL DEFAULT '',
            delta ${database.integerTypeSql()} NOT NULL DEFAULT 0,
            payload_json ${database.textTypeSql({ long: true })} NOT NULL DEFAULT '{}',
            created_at ${database.dateTimeTypeSql()} NOT NULL
          );
        `);

        database.exec(`
          CREATE INDEX IF NOT EXISTS idx_deathcounter_events_created_at
          ON ${database.quoteIdentifier(STORAGE_TABLES.events)} (created_at);
        `);
      });

      return {
        ok: true,
        moduleName: STORAGE_SCHEMA_MODULE,
        schemaVersion: ensuredVersion,
        targetVersion: STORAGE_SCHEMA_VERSION,
        tables: { ...STORAGE_TABLES },
        activeStorage: 'json_state_file',
        preparedStorage: 'database_schema',
        migrationPerformed: false,
        countsImported: false
      };
    } catch (err) {
      console.warn('[deathcounter_v2] storage schema prepare failed:', err.message || String(err));
      return {
        ok: false,
        moduleName: STORAGE_SCHEMA_MODULE,
        schemaVersion: 0,
        targetVersion: STORAGE_SCHEMA_VERSION,
        tables: { ...STORAGE_TABLES },
        activeStorage: 'json_state_file',
        preparedStorage: 'database_schema',
        migrationPerformed: false,
        countsImported: false,
        error: err.message || String(err)
      };
    }
  }

  function buildDeathcounterStorageStatus() {
    const prepared = ensureDeathcounterStorageSchema();
    const tableStatuses = Object.entries(STORAGE_TABLES).map(([key, table]) => {
      try {
        const exists = database.tableExists(table);
        const columns = exists ? database.tableColumns(table) : [];
        let rowCount = 0;
        if (exists) {
          try { rowCount = database.count(table); } catch (_) { rowCount = 0; }
        }
        return {
          key,
          table,
          exists,
          ok: exists,
          level: exists ? 'ok' : 'error',
          rowCount,
          columns
        };
      } catch (err) {
        return {
          key,
          table,
          exists: false,
          ok: false,
          level: 'error',
          rowCount: 0,
          columns: [],
          error: err.message || String(err)
        };
      }
    });

    const allTablesOk = tableStatuses.every(table => table.ok);
    let schemaVersion = 0;
    try { schemaVersion = database.getSchemaVersion(STORAGE_SCHEMA_MODULE); } catch (_) {}

    return {
      ok: Boolean(prepared.ok && allTablesOk),
      module: 'deathcounter_v2',
      storageSchemaModule: STORAGE_SCHEMA_MODULE,
      schemaVersion,
      targetVersion: STORAGE_SCHEMA_VERSION,
      activeStorage: 'json_state_file',
      preparedStorage: 'database_schema',
      migrationPerformed: false,
      countsImported: false,
      destructive: false,
      tables: tableStatuses,
      error: prepared.error || '',
      updatedAt: core.nowIso()
    };
  }

  function getSettingDefault(key) {
    const found = DEFAULT_DEATHCOUNTER_SETTINGS.find(item => item.key === key);
    return found ? found.value : null;
  }

  function readDeathcounterSetting(key) {
    const found = DEFAULT_DEATHCOUNTER_SETTINGS.find(item => item.key === key) || { value: null, valueType: 'string', description: '' };
    return settingsHelper.getSetting(SETTINGS_TABLE, key, found.value, {
      valueType: found.valueType,
      description: found.description
    });
  }

  function getDeathcounterRuntimeSettings() {
    ensureDeathcounterSettings();
    return {
      requireMentionForPlayerCommands: !!readDeathcounterSetting('requireMentionForPlayerCommands').value,
      chatOutputEnabled: !!readDeathcounterSetting('chatOutputEnabled').value,
      fallbackToStreamerbot: !!readDeathcounterSetting('fallbackToStreamerbot').value,
      fallbackToStreamer: !!readDeathcounterSetting('fallbackToStreamer').value,
      chatOutputPrefer: String(readDeathcounterSetting('chatOutputPrefer').value || 'bot').trim() || 'bot',
      directSendEnabled: !!readDeathcounterSetting('directSendEnabled').value,
      autoCreatePlayers: !!readDeathcounterSetting('autoCreatePlayers').value,
      allowTwitchLookup: !!readDeathcounterSetting('allowTwitchLookup').value,
      defaultSelectedIds: normalizePlayerListInput(readDeathcounterSetting('defaultSelectedIds').value || DEFAULT_SELECTED_IDS),
      maxExtraPlayers: Math.max(0, intOrDefault(readDeathcounterSetting('maxExtraPlayers').value, MAX_EXTRA_PLAYERS)),
      resetSessionOnStreamStart: !!readDeathcounterSetting('resetSessionOnStreamStart').value,
      resetOverlayPlayersOnStreamStart: !!readDeathcounterSetting('resetOverlayPlayersOnStreamStart').value
    };
  }

  function buildDeathcounterAdminSettings() {
    ensureDeathcounterSettings();
    const listed = settingsHelper.listSettings(SETTINGS_TABLE, { limit: 500 });
    return {
      module: 'deathcounter_v2',
      version: 2,
      table: SETTINGS_TABLE,
      count: listed.count,
      rows: listed.rows,
      runtime: getDeathcounterRuntimeSettings(),
      updatedAt: core.nowIso()
    };
  }

  function updateDeathcounterAdminSettings(input) {
    ensureDeathcounterSettings();
    const body = input && typeof input === 'object' ? input : {};
    const values = body.settings && typeof body.settings === 'object' ? body.settings : body;
    const allowed = new Map(DEFAULT_DEATHCOUNTER_SETTINGS.map(item => [item.key, item]));
    const changed = [];

    for (const [key, definition] of allowed.entries()) {
      if (!Object.prototype.hasOwnProperty.call(values, key)) continue;
      const saved = settingsHelper.setSetting(SETTINGS_TABLE, key, values[key], {
        valueType: definition.valueType,
        description: definition.description
      });
      changed.push(saved);
    }

    return {
      module: 'deathcounter_v2',
      version: 2,
      table: SETTINGS_TABLE,
      changed: changed.length,
      rows: changed,
      runtime: getDeathcounterRuntimeSettings(),
      updatedAt: core.nowIso()
    };
  }

  function buildDeathcounterAdminTexts() {
    return {
      module: 'deathcounter_v2',
      version: 2,
      texts: listDeathcounterTexts(),
      updatedAt: core.nowIso()
    };
  }

  function updateDeathcounterAdminTexts(input) {
    const result = handleDeathcounterTextPayload(input || {});
    return {
      module: 'deathcounter_v2',
      version: 2,
      ...result,
      texts: result.texts || result,
      updatedAt: core.nowIso()
    };
  }

  function buildDeathcounterConfig() {
    return {
      module: 'deathcounter_v2',
      version: 2,
      prefix: API_PREFIX,
      source: 'state_file_with_database_settings_and_prepared_database_storage',
      settingsTable: SETTINGS_TABLE,
      storageSchema: buildDeathcounterStorageStatus(),
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
    const runtimeSettings = getDeathcounterRuntimeSettings();
    return {
      module: 'deathcounter_v2',
      version: 2,
      source: 'database_settings_and_runtime_state',
      prefix: API_PREFIX,
      settingsTable: SETTINGS_TABLE,
      storageSchema: buildDeathcounterStorageStatus(),
      settings: {
        ...runtimeSettings,
        dataDir,
        stateFile,
        legacyFile,
        overlayFile: getOverlayFilePath(),
        selectedPlayerIds: normalizePlayerListInput(state.overlay?.selectedPlayerIds).slice(0, 2),
        extraPlayerIds: normalizePlayerListInput(state.overlay?.extraPlayerIds).slice(0, getMaxExtraPlayersSafe()),
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
      { method: 'GET/POST', path: `${API_PREFIX}/admin/settings`, purpose: 'dashboard/admin DB settings via helper_settings' },
      { method: 'GET/POST', path: `${API_PREFIX}/admin/texts`, purpose: 'dashboard/admin DB text variants via helper_texts' },
      { method: 'GET', path: `${API_PREFIX}/routes`, purpose: 'list deathcounter v2 API routes' },
      { method: 'GET', path: `${API_PREFIX}/integration-check`, purpose: 'run non-destructive integration check' },
      { method: 'POST', path: `${API_PREFIX}/reload`, purpose: 'safe state-file normalization reload' },
      { method: 'GET/POST', path: `${API_PREFIX}/command`, purpose: 'central Streamer.bot-friendly command bridge for dcount/rip/tode' },
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

    try {
      const adminSettings = buildDeathcounterAdminSettings();
      add({ name: 'database_settings', ok: true, level: 'ok', table: adminSettings.table, count: adminSettings.count });
    } catch (err) {
      add({ name: 'database_settings', ok: false, level: 'error', table: SETTINGS_TABLE, error: err.message || String(err) });
    }

    try {
      const adminTexts = buildDeathcounterAdminTexts();
      add({
        name: 'database_text_variants',
        ok: true,
        level: 'ok',
        table: adminTexts.texts?.variantsTable || adminTexts.texts?.table || 'module_text_variants',
        moduleName: TEXTS_MODULE,
        keys: adminTexts.texts?.count || 0,
        variants: adminTexts.texts?.variantCount || 0
      });
    } catch (err) {
      add({ name: 'database_text_variants', ok: false, level: 'error', table: 'module_text_variants', moduleName: TEXTS_MODULE, error: err.message || String(err) });
    }

    try {
      const storage = buildDeathcounterStorageStatus();
      add({
        name: 'database_storage_schema',
        ok: storage.ok,
        level: storage.ok ? 'ok' : 'error',
        schemaModule: storage.storageSchemaModule,
        schemaVersion: storage.schemaVersion,
        targetVersion: storage.targetVersion,
        activeStorage: storage.activeStorage,
        preparedStorage: storage.preparedStorage,
        migrationPerformed: storage.migrationPerformed,
        countsImported: storage.countsImported,
        tables: storage.tables.map(table => ({
          key: table.key,
          table: table.table,
          exists: table.exists,
          rowCount: table.rowCount,
          columns: table.columns
        })),
        error: storage.error
      });
    } catch (err) {
      add({
        name: 'database_storage_schema',
        ok: false,
        level: 'error',
        schemaModule: STORAGE_SCHEMA_MODULE,
        activeStorage: 'json_state_file',
        preparedStorage: 'database_schema',
        migrationPerformed: false,
        countsImported: false,
        error: err.message || String(err)
      });
    }

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
        extraPlayerIds: normalizePlayerListInput(state.overlay?.extraPlayerIds).slice(0, getMaxExtraPlayersSafe())
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
        'Reload normalizes the existing state file only; counters and overlay state are preserved.',
        'STEP252 prepares database tables only. JSON remains the active DeathCounter storage; no counts are imported or switched.'
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
    extraPlayerIds: normalizePlayerListInput(o.extraPlayerIds).slice(0, getMaxExtraPlayersSafe())
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
  state.overlay.extraPlayerIds = uniq.slice(0, getMaxExtraPlayersSafe());
}

function maybeTrackExtraPlayer(state, player) {
  sanitizePlayer(player);
  const id = player.id;
  if (DEFAULT_SELECTED_IDS.includes(id)) return;
  state.overlay = normalizeOverlay(state.overlay);
  if (state.overlay.selectedPlayerIds.includes(id)) return;
  if (state.overlay.extraPlayerIds.includes(id)) return;
  state.overlay.extraPlayerIds.push(id);
  state.overlay.extraPlayerIds = state.overlay.extraPlayerIds.slice(0, getMaxExtraPlayersSafe());
}

function getDefaultSelectedPlayers(players) {
  const sorted = sortPlayers(players).filter(p => p.active !== false);
  const wanted = [];
  for (const wantedId of getDefaultSelectedIdsSafe()) {
    const cleanWanted = cleanLogin(wantedId);
    const match = sorted.find(p => cleanLogin(p.id) === cleanWanted || cleanLogin(p.login) === cleanWanted);
    if (match && !wanted.find(x => x.id === match.id)) wanted.push(match);
  }
  return wanted;
}

function getDefaultSelectedIdsSafe() {
  try {
    settingsHelper.seedDefaults(SETTINGS_TABLE, DEFAULT_DEATHCOUNTER_SETTINGS);
    const setting = settingsHelper.getSetting(SETTINGS_TABLE, 'defaultSelectedIds', DEFAULT_SELECTED_IDS, { valueType: 'json' });
    const ids = normalizePlayerListInput(setting.value || DEFAULT_SELECTED_IDS);
    return ids.length ? ids : [...DEFAULT_SELECTED_IDS];
  } catch (_) {
    return [...DEFAULT_SELECTED_IDS];
  }
}

function getMaxExtraPlayersSafe() {
  try {
    settingsHelper.seedDefaults(SETTINGS_TABLE, DEFAULT_DEATHCOUNTER_SETTINGS);
    const setting = settingsHelper.getSetting(SETTINGS_TABLE, 'maxExtraPlayers', MAX_EXTRA_PLAYERS, { valueType: 'number' });
    return Math.max(0, intOrDefault(setting.value, MAX_EXTRA_PLAYERS));
  } catch (_) {
    return MAX_EXTRA_PLAYERS;
  }
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
      extraPlayerIds: normalizePlayerListInput(state.overlay?.extraPlayerIds).slice(0, getMaxExtraPlayersSafe())
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
    ...normalizePlayerListInput(state.overlay?.extraPlayerIds).slice(0, getMaxExtraPlayersSafe())
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

  const parts = summaryPlayers.map(player => deathcounterText('tode_summary_player', {
    displayName: player.displayName,
    login: player.login,
    game,
    session: player.session,
    gameAllTime: player.gameAllTime,
    allTime: intOrDefault(player.stats?.allTime, 0)
  }));

  const message = parts.length
    ? deathcounterText('tode_summary', { game, players: parts.join(' | ') })
    : deathcounterText('tode_summary_empty', { game });

  return {
    currentGame: game,
    players: summaryPlayers,
    message
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
    message: deathcounterText('tode_player_detail', {
      displayName: player.displayName,
      login: player.login,
      game,
      session,
      gameAllTime,
      allTime
    })
  };
}

function deathcounterTextOptions() {
  return {
    categories: DEATHCOUNTER_TEXT_CATEGORIES,
    categoryLabels: DEATHCOUNTER_TEXT_CATEGORY_LABELS,
    defaultCategory: 'command'
  };
}

function listDeathcounterTexts() {
  if (typeof textHelper.listModuleTextEditor === 'function') {
    return textHelper.listModuleTextEditor(TEXTS_MODULE, DEFAULT_DEATHCOUNTER_TEXTS, {
      ...deathcounterTextOptions(),
      seed: true
    });
  }
  return {
    ok: false,
    module: TEXTS_MODULE,
    error: 'helper_texts.listModuleTextEditor_unavailable',
    defaults: DEFAULT_DEATHCOUNTER_TEXTS
  };
}

function handleDeathcounterTextPayload(payload) {
  if (typeof textHelper.handleModuleTextEditorPayload !== 'function') {
    throw new Error('helper_texts.handleModuleTextEditorPayload_unavailable');
  }
  return textHelper.handleModuleTextEditorPayload(TEXTS_MODULE, payload || {}, deathcounterTextOptions());
}

function deathcounterText(key, context = {}, fallback = '') {
  const defaultText = fallback || firstDeathcounterDefaultText(key);
  try {
    if (typeof textHelper.renderModuleText === 'function') {
      const rendered = textHelper.renderModuleText(TEXTS_MODULE, key, DEFAULT_DEATHCOUNTER_TEXTS, context, {
        ...deathcounterTextOptions(),
        seed: true
      });
      const text = String(rendered || '').trim();
      if (text) return text;
    }
  } catch (err) {
    // Fallback below keeps command output working if DB text variants are temporarily unavailable.
  }
  return renderDeathcounterTemplate(defaultText, context);
}

function firstDeathcounterDefaultText(key) {
  const value = DEFAULT_DEATHCOUNTER_TEXTS[key];
  if (Array.isArray(value)) return String(value[0] || '');
  return String(value || '');
}

function renderDeathcounterTemplate(template, context = {}) {
  let text = String(template || '');
  const values = context && typeof context === 'object' ? context : {};
  for (const [key, value] of Object.entries(values)) {
    const safeKey = String(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(`\\{${safeKey}\\}`, 'g'), String(value ?? ''));
  }
  return text.trim();
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
