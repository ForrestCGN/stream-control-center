"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const core = require("./helpers/helper_core");
const messages = require("./helpers/helper_messages");
const chatOutput = require("./helpers/helper_chat_output");
const configHelper = require("./helpers/helper_config");
const settingsHelper = require("./helpers/helper_settings");
const database = require("../core/database");
const twitchRoles = require("./helpers/helper_twitch_roles");
const media = require("./helpers/helper_media");

let communicationBus = null;
try {
  communicationBus = require("./communication_bus");
} catch (_) {
  communicationBus = null;
}

let multer = null;
let multerLoadError = "";
try {
  multer = require("multer");
} catch (err) {
  multerLoadError = err && err.message ? err.message : String(err);
}

module.exports.init = function init(ctx) {
  const { app, broadcastWS } = ctx;

  const MODULE_NAME = "vip_sound_overlay";
  const DEFAULT_INTRO_MS = 360;
  const DEFAULT_OUTRO_MS = 280;
  const DEFAULT_GAP_MS = 2000;
  const DEFAULT_PHASE = "idle";
  const VIP_SCHEMA_MODULE = "vip_sound_overlay";
  const VIP_SCHEMA_VERSION = 5;
  const VIP_DAILY_USAGE_TABLE = "vip_sound_daily_usage";
  const VIP_MESSAGE_TABLE = "vip_sound_message_templates";
  const VIP_SETTINGS_TABLE = "vip_sound_settings";
  const VIP_EVENTS_TABLE = "vip_sound_events";
  const VIP_ROLE_OVERRIDES_TABLE = "vip_sound_role_overrides";
  const VIP_TWITCH_USERS_TABLE = "vip_sound_twitch_users";
  const VIP_MESSAGE_STYLE = "heimleitung";
  const VIP_OVERLAY_STYLE = "overlay";
  const VIP_SOUND_SYSTEM_PLAY_URL = process.env.VIP_SOUND_SYSTEM_PLAY_URL || "http://127.0.0.1:8080/api/sound/play";
  const VIP_SOUND_COMMAND_DRY_RUN_URL = process.env.VIP_SOUND_COMMAND_DRY_RUN_URL || "http://127.0.0.1:8080/api/sound/eventbus/command/dry-run";
  const VIP_OVERRIDE_ALLOWED_ROLES_RAW = process.env.VIP_OVERRIDE_ALLOWED_ROLES || "moderator,mod,broadcaster";
  const VIP_ROLES_CONFIG_PATH = process.env.VIP_ROLES_CONFIG_PATH || configHelper.resolveConfigFile("vip_sound_roles.json");
  const VIP_SETTINGS_CONFIG_FILE = process.env.VIP_SETTINGS_CONFIG_FILE || "vip_sound.json";

  const DEFAULT_VIP_SETTINGS = {
    enabled: {
      value: true,
      value_type: "boolean",
      description: "Aktiviert oder deaktiviert das VIP-Sound-System."
    },
    soundBaseDir: {
      value: process.env.VIP_SOUND_BASE_DIR || "D:/Streaming/stramAssets/htdocs/assets/sounds/vip",
      value_type: "string",
      description: "Basisordner fuer VIP-Sounddateien. Dashboard-editierbar geplant."
    },
    fileNameMode: {
      value: "displayName",
      value_type: "string",
      description: "Dateinamensregel fuer VIP-Sounds. Aktuell: displayName."
    },
    fileExtension: {
      value: ".mp3",
      value_type: "string",
      description: "Dateiendung fuer VIP-Sounddateien."
    },
    maxSoundUploadBytes: {
      value: 15728640,
      value_type: "number",
      description: "Maximale Dateigroesse fuer VIP-Sound-Uploads ueber das Dashboard."
    },
    soundSystemTarget: {
      value: "both",
      value_type: "string",
      description: "Sound-System-Ziel fuer VIP-/Mod-Sounds: stream, discord oder both."
    },
    soundSystemVolume: {
      value: 80,
      value_type: "number",
      description: "Standard-Lautstaerke fuer VIP-/Mod-Sounds im Sound-System. Wird von Sound-Pegel Defaults gesetzt."
    },
    dailyUsageRetentionDays: {
      value: 14,
      value_type: "number",
      description: "Geplante Aufbewahrungsdauer fuer Daily-Usage-Eintraege. Noch nicht automatisch aktiv."
    },
    cleanupDailyUsageOnStartup: {
      value: false,
      value_type: "boolean",
      description: "Geplanter Auto-Cleanup beim Backend-Start. Noch nicht automatisch aktiv."
    },
    autoDetectTargetRole: {
      value: true,
      value_type: "boolean",
      description: "Zieluser-Rolle automatisch per Twitch pruefen."
    },
    fallbackRolesEnabled: {
      value: true,
      value_type: "boolean",
      description: "Lokale Rollen-Fallbacks erlauben, wenn Twitch nicht verfuegbar ist."
    },
    twitchSyncEnabled: {
      value: true,
      value_type: "boolean",
      description: "Automatischen Twitch-VIP-/Mod-Sync aktivieren."
    },
    twitchSyncIntervalHours: {
      value: 24,
      value_type: "number",
      description: "Intervall fuer automatischen Twitch-VIP-/Mod-Sync in Stunden."
    },
    twitchSyncOnStartup: {
      value: true,
      value_type: "boolean",
      description: "Beim Backend-Start synchronisieren, wenn der letzte Sync zu alt ist."
    },
    twitchSyncOnStartupIfOlderThanHours: {
      value: 24,
      value_type: "number",
      description: "Beim Start nur synchronisieren, wenn der letzte Sync aelter als diese Stunden ist."
    },
    twitchSyncIncludeVips: {
      value: true,
      value_type: "boolean",
      description: "Twitch-VIPs beim Sync abrufen."
    },
    twitchSyncIncludeMods: {
      value: true,
      value_type: "boolean",
      description: "Twitch-Mods beim Sync abrufen."
    },
    twitchSyncLastAt: {
      value: "",
      value_type: "string",
      description: "Zeitpunkt des letzten Twitch-Syncs."
    },
    twitchSyncLastOk: {
      value: false,
      value_type: "boolean",
      description: "Status des letzten Twitch-Syncs."
    },
    twitchSyncLastError: {
      value: "",
      value_type: "string",
      description: "Fehlertext des letzten Twitch-Syncs."
    },
    twitchSyncLastCounts: {
      value: { vips: 0, mods: 0, total: 0 },
      value_type: "json",
      description: "Zaehler des letzten Twitch-Syncs."
    }
  };

  const DEFAULT_VIP_MESSAGES = [
    {
      event_key: "accepted_vip",
      message_text: "@{displayName}, Heimaufsicht hat deinen VIP-Sound notiert. Wird abgespielt, sobald das System dich dranlaesst.",
      weight: 1
    },
    {
      event_key: "accepted_vip",
      message_text: "@{displayName}, VIP-Antrag angenommen. Bitte im Wartebereich Platz nehmen, die Beschallung folgt.",
      weight: 1
    },
    {
      event_key: "accepted_mod",
      message_text: "@{displayName}, Mod-Sound wurde von der Heimaufsicht durchgewunken.",
      weight: 1
    },
    {
      event_key: "accepted_mod",
      message_text: "@{displayName}, Mod-Sound ist angenommen. Danke fuer deinen Einsatz im Mod-Team.",
      weight: 1
    },
    {
      event_key: "accepted_override_vip",
      message_text: "@{displayName}, Heimaufsicht hat eine Sonderfreigabe erteilt. Der VIP-Sound wird erneut abgespielt.",
      weight: 1
    },
    {
      event_key: "accepted_override_mod",
      message_text: "@{displayName}, Heimaufsicht hat eine Mod-Sonderfreigabe erteilt. Der Sound wird erneut abgespielt.",
      weight: 1
    },
    {
      event_key: "denied_override_vip",
      message_text: "@{actorDisplayName}, Antrag abgelehnt. VIP-Sound-Sonderfreigaben gibt es nur fuer Mods und die Sendeleitung.",
      weight: 1
    },
    {
      event_key: "denied_override_mod",
      message_text: "@{actorDisplayName}, Antrag abgelehnt. Mod-Sound-Sonderfreigaben gibt es nur fuer Mods und die Sendeleitung.",
      weight: 1
    },
    {
      event_key: "duplicate_vip",
      message_text: "@{displayName}, Antrag abgelehnt. Dein VIP-Sound wurde heute bereits ordnungsgemaess verbraten.",
      weight: 1
    },
    {
      event_key: "duplicate_vip",
      message_text: "@{displayName}, Heimaufsicht sagt nein. Ein VIP-Sound pro Tag, wir sind hier nicht im Wunschkonzert.",
      weight: 1
    },
    {
      event_key: "duplicate_mod",
      message_text: "@{displayName}, Einspruch zwecklos. Dein Mod-Sound war heute schon dran.",
      weight: 1
    },
    {
      event_key: "duplicate_mod",
      message_text: "@{displayName}, Mod-Sonderrechte schoen und gut, aber heute gab es deinen Sound bereits.",
      weight: 1
    },
    {
      event_key: "system_disabled",
      message_text: "@{displayName}, Heimaufsicht meldet: VIP-Sounds sind gerade ausser Betrieb.",
      weight: 1
    },
    {
      event_key: "sound_missing",
      message_text: "@{displayName}, Heimaufsicht findet deine Soundakte gerade nicht. Da fehlt wohl die passende MP3.",
      weight: 1
    },
    {
      event_key: "not_twitch_vip_or_mod",
      message_text: "@{displayName}, VIP-Sounds sind nur fuer aktuelle Twitch-VIPs und Twitch-Mods freigegeben.",
      weight: 1
    },
    {
      event_key: "error_generic",
      message_text: "@{displayName}, Heimaufsicht hat einen Fehler im Formular gefunden. Versuch es spaeter nochmal.",
      weight: 1
    }
  ];

  const DEFAULT_VIP_OVERLAY_MESSAGES = [
    { event_key: "overlay_title_vip", message_text: "VIP-Sound", weight: 1 },
    { event_key: "overlay_title_mod", message_text: "Mod-Sound", weight: 1 },

    { event_key: "overlay_text_vip", message_text: "Schön, dass du da bist", weight: 1 },
    { event_key: "overlay_text_vip", message_text: "Danke, dass du Teil der Community bist", weight: 1 },
    { event_key: "overlay_text_vip", message_text: "Es ist schön, dich hier zu haben", weight: 1 },
    { event_key: "overlay_text_vip", message_text: "Danke, dass du mit dabei bist", weight: 1 },
    { event_key: "overlay_text_vip", message_text: "Es bedeutet viel, dass du da bist", weight: 1 },
    { event_key: "overlay_text_vip", message_text: "Danke, dass du die Community bereicherst", weight: 1 },

    { event_key: "overlay_text_mod", message_text: "Danke, dass du uns als Mod unterstützt", weight: 1 },
    { event_key: "overlay_text_mod", message_text: "Schön, dass wir dich im Mod-Team haben", weight: 1 },
    { event_key: "overlay_text_mod", message_text: "Danke für deine Hilfe und deinen Einsatz", weight: 1 },
    { event_key: "overlay_text_mod", message_text: "Danke, dass du für die Community da bist", weight: 1 },
    { event_key: "overlay_text_mod", message_text: "Schön, dass du uns als Mod zur Seite stehst", weight: 1 },
    { event_key: "overlay_text_mod", message_text: "Es bedeutet viel, dich im Team zu haben", weight: 1 }
  ];

  const webRoot = normalizeWinPath(
    process.env.VIP_OVERLAY_WEB_ROOT ||
    "d:\\Streaming\\stramAssets\\htdocs"
  );

  const userInfoBaseUrl =
    process.env.VIP_OVERLAY_USERINFO_URL ||
    "http://127.0.0.1:8080/userinfo?login=";

  const userInfoCache = new Map();

  const state = {
    version: "1.8.13",
    module: MODULE_NAME,
    overlay: emptyOverlay(),
    queue: [],
    isActive: false,
    lastFinishedAt: 0,
    updatedAt: new Date().toISOString(),
    client: {
      connected: false,
      lastSeenAt: 0
    },
    db: {
      initialized: false,
      schemaVersion: 0,
      messageTemplates: 0,
      dailyUsageRows: 0,
      settingsRows: 0,
      eventsRows: 0,
      lastError: ""
    },
    chat: {
      mode: "central",
      lastOk: false,
      lastAt: "",
      lastError: "",
      lastVia: ""
    },
    twitchSync: {
      running: false,
      timerStarted: false,
      lastAutoCheckAt: "",
      lastRunStartedAt: "",
      lastRunFinishedAt: "",
      lastError: ""
    },
    eventBus: {
      enabled: true,
      channel: "vip.sound",
      targetType: "all",
      targetId: "*",
      targetModule: MODULE_NAME,
      targetCapability: "",
      emitted: 0,
      skipped: 0,
      errors: 0,
      lastAction: "",
      lastEventId: "",
      lastEventType: "",
      lastEventKey: "",
      lastRequestId: "",
      lastResult: null,
      lastError: "",
      lastAt: ""
    },
    soundBusCommand: {
      enabled: true,
      mode: "shadow_test",
      channel: "sound.command",
      action: "play.request.test",
      capability: "sound.command_input",
      targetType: "module",
      targetId: "sound_system",
      targetModule: "sound_system",
      targetCapability: "sound.command_input",
      commandConsumerEnabled: true,
      commandConsumerMode: "dry_run",
      soundDryRunUrl: VIP_SOUND_COMMAND_DRY_RUN_URL,
      emitted: 0,
      skipped: 0,
      errors: 0,
      dryRunChecks: 0,
      dryRunOk: 0,
      dryRunFailed: 0,
      lastAction: "",
      lastEventId: "",
      lastRequestId: "",
      lastVipRequestId: "",
      lastSoundId: "",
      lastResult: null,
      lastDryRun: null,
      lastError: "",
      lastAt: "",
      recentCommands: []
    }
  };

  function emptyOverlay() {
    return {
      visible: false,
      phase: DEFAULT_PHASE,
      title: "",
      text: "",
      displayName: "",
      login: "",
      avatarUrl: "",
      audioUrl: "",
      soundPath: "",
      introMs: DEFAULT_INTRO_MS,
      outroMs: DEFAULT_OUTRO_MS,
      gapAfterMs: DEFAULT_GAP_MS,
      startedAt: 0,
      audioStartedAt: 0,
      audioEndedAt: 0,
      hideStartedAt: 0,
      endsAt: 0,
      requestId: "",
      source: "vip_sound_overlay"
    };
  }

  function nowIso() {
    return core.nowIso();
  }

  function refreshDbStats() {
    if (!state.db.initialized) return;
    try {
      state.db.schemaVersion = database.getSchemaVersion(VIP_SCHEMA_MODULE) || 0;
      state.db.messageTemplates = database.count(VIP_MESSAGE_TABLE);
      state.db.dailyUsageRows = database.count(VIP_DAILY_USAGE_TABLE);
      state.db.settingsRows = database.count(VIP_SETTINGS_TABLE);
      state.db.eventsRows = database.count(VIP_EVENTS_TABLE);
      state.db.roleOverridesRows = database.count(VIP_ROLE_OVERRIDES_TABLE);
      try { state.db.twitchUsersRows = database.count(VIP_TWITCH_USERS_TABLE); } catch (_) { state.db.twitchUsersRows = 0; }
      state.db.lastError = "";
    } catch (err) {
      state.db.lastError = err.message || String(err);
    }
  }

  function publicState() {
    refreshDbStats();
    return {
      ok: true,
      version: state.version,
      module: state.module,
      overlay: { ...state.overlay },
      queuedCount: state.queue.length,
      isActive: state.isActive,
      lastFinishedAt: state.lastFinishedAt,
      client: { ...state.client },
      db: { ...state.db },
      chat: { ...state.chat },
      eventBus: { ...state.eventBus },
      soundBusCommand: publicVipSoundBusCommandStatus(""),
      updatedAt: state.updatedAt
    };
  }

  function emitState(reason) {
    state.updatedAt = nowIso();
    if (typeof broadcastWS === "function") {
      broadcastWS({
        op: "vip_sound_overlay",
        reason: reason || "state",
        data: publicState()
      });
    }
  }

  function fail(res, status, message) {
    return res.status(status).json({ ok: false, error: message });
  }

  function requiredString(v, name) {
    const s = (v ?? "").toString().trim();
    if (!s) throw new Error(`Missing ${name}`);
    return s;
  }

  function bodyOrQuery(req, key) {
    return core.getParam(req, key, undefined);
  }

  function requestData(req) {
    return {
      ...(req.query && typeof req.query === "object" ? req.query : {}),
      ...(req.body && typeof req.body === "object" ? req.body : {})
    };
  }

  function intOrDefault(v, d) {
    const n = core.intParam(v, d);
    return Number.isFinite(n) && n >= 0 ? n : d;
  }

  function normalizeWinPath(p) {
    return (p || "").replace(/\//g, "\\").toLowerCase();
  }

  function normalizeLogin(value) {
    return String(value || "").trim().replace(/^@/, "").toLowerCase();
  }

  function cleanDisplayName(value) {
    return String(value || "").trim().replace(/^@/, "");
  }

  function fileExistsSafe(p) {
    try {
      return core.fileExists(p);
    } catch {
      return false;
    }
  }

  function toBrowserAudioUrl(soundPath) {
    const normalized = normalizeWinPath(soundPath);
    if (!normalized) throw new Error("Missing soundPath");

    const root = webRoot.endsWith("\\") ? webRoot : `${webRoot}\\`;
    if (!normalized.startsWith(root)) {
      throw new Error(`soundPath is outside web root: ${soundPath}`);
    }

    const relative = normalized.slice(root.length).replace(/\\/g, "/");
    return `/${relative}`;
  }

  function makeRequestId() {
    return `vip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function normalizeSoundType(raw) {
    const t = (raw || "").toString().trim().toLowerCase();
    if (t === "mod") return "mod";
    return "vip";
  }

  function eventKey(base, soundType) {
    return `${base}_${normalizeSoundType(soundType)}`;
  }

  function csvList(value) {
    return String(value || "")
      .split(",")
      .map(v => v.trim().toLowerCase())
      .filter(Boolean);
  }

  function boolish(value) {
    const s = String(value ?? "").trim().toLowerCase();
    return s === "1" || s === "true" || s === "yes" || s === "ja" || s === "y";
  }

  function actorCanOverride(raw) {
    const allowed = new Set(csvList(VIP_OVERRIDE_ALLOWED_ROLES_RAW));
    const roles = new Set();

    for (const key of ["actorRole", "userRole", "role", "badges", "actorBadges"]) {
      const value = raw[key];

      if (Array.isArray(value)) {
        for (const item of value) roles.add(String(item || "").trim().toLowerCase());
      } else {
        for (const item of csvList(value)) roles.add(item);
      }
    }

    if (boolish(raw.actorIsBroadcaster) || boolish(raw.isBroadcaster) || boolish(raw.broadcaster)) {
      roles.add("broadcaster");
    }

    if (
      boolish(raw.actorIsMod) ||
      boolish(raw.actorIsModerator) ||
      boolish(raw.isMod) ||
      boolish(raw.isModerator) ||
      boolish(raw.moderator)
    ) {
      roles.add("moderator");
      roles.add("mod");
    }

    for (const role of roles) {
      if (allowed.has(role)) return true;
    }

    return false;
  }

  function readVipRolesConfig() {
    const fallback = {
      enabled: true,
      autoDetectTargetRole: true,
      mods: [],
      moderators: [],
      crew: [],
      vips: []
    };

    try {
      if (!fs.existsSync(VIP_ROLES_CONFIG_PATH)) return fallback;
      const raw = fs.readFileSync(VIP_ROLES_CONFIG_PATH, "utf8");
      const parsed = JSON.parse(raw);

      return {
        ...fallback,
        ...(parsed && typeof parsed === "object" ? parsed : {})
      };
    } catch (err) {
      console.warn(`[${MODULE_NAME}] vip roles config unavailable: ${err.message || String(err)}`);
      return fallback;
    }
  }

  function normalizedRoleSet(list) {
    const set = new Set();
    if (!Array.isArray(list)) return set;

    for (const item of list) {
      const login = normalizeLogin(item);
      if (login) set.add(login);
    }

    return set;
  }

  function normalizeRoleType(value) {
    const role = String(value || "").trim().toLowerCase();
    if (role === "moderator" || role === "mod") return "mod";
    if (role === "crew") return "crew";
    if (role === "vip") return "vip";
    return "vip";
  }

  function buildRoleSetsFromConfig(cfg) {
    const data = cfg && typeof cfg === "object" ? cfg : readVipRolesConfig();

    return {
      enabled: data.enabled !== false,
      autoDetectTargetRole: data.autoDetectTargetRole !== false,
      mods: normalizedRoleSet([
        ...(Array.isArray(data.mods) ? data.mods : []),
        ...(Array.isArray(data.moderators) ? data.moderators : [])
      ]),
      crew: normalizedRoleSet(data.crew),
      vips: normalizedRoleSet(data.vips)
    };
  }

  function getVipRoleOverrideRows(includeDisabled = false) {
    try {
      const where = includeDisabled ? "" : "WHERE enabled = 1";
      const rows = database.all(`
        SELECT login, display_name, role_type, enabled, source, note, created_at, updated_at
        FROM vip_sound_role_overrides
        ${where}
        ORDER BY role_type ASC, login ASC
      `);

      return Array.isArray(rows) ? rows : [];
    } catch (_) {
      return [];
    }
  }

  function buildRoleSetsFromDbOrFallback() {
    try {
      const rows = getVipRoleOverrideRows(false);
      const mods = new Set();
      const crew = new Set();
      const vips = new Set();

      for (const row of rows) {
        const login = normalizeLogin(row.login);
        if (!login) continue;

        const role = normalizeRoleType(row.role_type);
        if (role === "mod") mods.add(login);
        else if (role === "crew") crew.add(login);
        else if (role === "vip") vips.add(login);
      }

      return {
        source: "database",
        enabled: true,
        autoDetectTargetRole: !!getVipSetting("autoDetectTargetRole", true),
        fallbackRolesEnabled: !!getVipSetting("fallbackRolesEnabled", true),
        mods,
        crew,
        vips,
        rows
      };
    } catch (err) {
      const cfg = readVipRolesConfig();
      const sets = buildRoleSetsFromConfig(cfg);
      return {
        source: "config_fallback",
        enabled: cfg.enabled !== false,
        autoDetectTargetRole: cfg.autoDetectTargetRole !== false,
        fallbackRolesEnabled: true,
        mods: sets.mods,
        crew: sets.crew,
        vips: sets.vips,
        rows: []
      };
    }
  }

  function importVipRoleConfigIfEmpty() {
    const count = database.count(VIP_ROLE_OVERRIDES_TABLE);
    if (count > 0) return { imported: 0, skippedExisting: true };
    return importVipRolesFromConfig();
  }

  function importVipRolesFromConfig() {
    const cfg = readVipRolesConfig();
    const now = nowIso();
    const rows = [];

    function addRows(items, roleType, sourceKey) {
      if (!Array.isArray(items)) return;
      for (const item of items) {
        const login = normalizeLogin(item);
        if (!login) continue;
        rows.push({ login, displayName: cleanDisplayName(item), roleType, sourceKey });
      }
    }

    addRows(cfg.mods, "mod", "mods");
    addRows(cfg.moderators, "mod", "moderators");
    addRows(cfg.crew, "crew", "crew");
    addRows(cfg.vips, "vip", "vips");

    let imported = 0;
    for (const row of rows) {
      const result = database.run(`
        INSERT OR IGNORE INTO vip_sound_role_overrides
          (login, display_name, role_type, enabled, source, note, created_at, updated_at)
        VALUES
          (:login, :displayName, :roleType, 1, 'config_import', :note, :createdAt, :updatedAt)
      `, {
        login: row.login,
        displayName: row.displayName || row.login,
        roleType: row.roleType,
        note: `Import aus ${path.basename(VIP_ROLES_CONFIG_PATH)}:${row.sourceKey}`,
        createdAt: now,
        updatedAt: now
      });

      if (result && typeof result.changes === "number") imported += result.changes;
    }

    refreshDbStats();
    return { imported, skippedExisting: false, sourcePath: VIP_ROLES_CONFIG_PATH };
  }

  function listVipRoleOverrides(includeDisabled = true) {
    const cfg = readVipRolesConfig();
    const rows = getVipRoleOverrideRows(includeDisabled).map(row => ({
      login: normalizeLogin(row.login),
      displayName: cleanDisplayName(row.display_name || row.login),
      roleType: normalizeRoleType(row.role_type),
      enabled: Number(row.enabled || 0) === 1,
      source: row.source || "database",
      note: row.note || "",
      createdAt: row.created_at || "",
      updatedAt: row.updated_at || ""
    }));

    return {
      table: VIP_ROLE_OVERRIDES_TABLE,
      count: rows.length,
      rows,
      settings: {
        autoDetectTargetRole: !!getVipSetting("autoDetectTargetRole", true),
        fallbackRolesEnabled: !!getVipSetting("fallbackRolesEnabled", true)
      },
      configFallback: {
        path: VIP_ROLES_CONFIG_PATH,
        exists: fs.existsSync(VIP_ROLES_CONFIG_PATH),
        enabled: cfg.enabled !== false,
        autoDetectTargetRole: cfg.autoDetectTargetRole !== false,
        counts: {
          mods: Array.isArray(cfg.mods) ? cfg.mods.length : 0,
          moderators: Array.isArray(cfg.moderators) ? cfg.moderators.length : 0,
          crew: Array.isArray(cfg.crew) ? cfg.crew.length : 0,
          vips: Array.isArray(cfg.vips) ? cfg.vips.length : 0
        }
      }
    };
  }

  function upsertVipRoleOverride(raw = {}) {
    const login = normalizeLogin(raw.login || raw.userLogin || raw.targetLogin || raw.user || raw.name || "");
    if (!login) throw new Error("Missing login");

    const roleType = normalizeRoleType(raw.roleType || raw.role || raw.type || "vip");
    const displayName = cleanDisplayName(raw.displayName || raw.userDisplayName || raw.targetDisplayName || login);
    const enabled = raw.enabled === undefined ? true : boolish(raw.enabled);
    const note = String(raw.note || "").trim();
    const now = nowIso();

    database.run(`
      INSERT INTO vip_sound_role_overrides
        (login, display_name, role_type, enabled, source, note, created_at, updated_at)
      VALUES
        (:login, :displayName, :roleType, :enabled, 'api', :note, :createdAt, :updatedAt)
      ON CONFLICT(login, role_type) DO UPDATE SET
        display_name = excluded.display_name,
        enabled = excluded.enabled,
        source = 'api',
        note = excluded.note,
        updated_at = excluded.updated_at
    `, {
      login,
      displayName: displayName || login,
      roleType,
      enabled: enabled ? 1 : 0,
      note,
      createdAt: now,
      updatedAt: now
    });

    refreshDbStats();
    return { login, displayName: displayName || login, roleType, enabled, note };
  }

  function deleteVipRoleOverride(raw = {}) {
    const login = normalizeLogin(raw.login || raw.userLogin || raw.targetLogin || raw.user || raw.name || "");
    if (!login) throw new Error("Missing login");

    const roleRaw = String(raw.roleType || raw.role || raw.type || "").trim();
    const params = { login };
    let where = "login = :login";

    if (roleRaw) {
      where += " AND role_type = :roleType";
      params.roleType = normalizeRoleType(roleRaw);
    }

    const result = database.run(`
      DELETE FROM vip_sound_role_overrides
      WHERE ${where}
    `, params);

    refreshDbStats();
    return {
      login,
      roleType: roleRaw ? params.roleType : "",
      deleted: result && typeof result.changes === "number" ? result.changes : 0
    };
  }

  function normalizeMessageStyle(value) {
    const style = String(value || "").trim().toLowerCase();
    if (style === "overlay") return VIP_OVERLAY_STYLE;
    if (style === "chat" || style === "bot" || style === "heimaufsicht") return VIP_MESSAGE_STYLE;
    if (style === VIP_MESSAGE_STYLE) return VIP_MESSAGE_STYLE;
    return VIP_MESSAGE_STYLE;
  }

  function normalizeMessageEventKey(value) {
    const key = String(value || "").trim().toLowerCase();
    if (!key) throw new Error("Missing eventKey");
    if (!/^[a-z0-9_:-]+$/.test(key)) throw new Error("Invalid eventKey");
    return key;
  }

  function normalizeMessageWeight(value) {
    const n = Number(value ?? 1);
    if (!Number.isFinite(n)) return 1;
    return Math.max(1, Math.min(1000, Math.floor(n)));
  }

  function listVipMessageTemplates(raw = {}, limitValue) {
    const eventKeyRaw = String(raw.eventKey || raw.event_key || "").trim();
    const styleRaw = String(raw.style || "").trim();
    const enabledRaw = String(raw.enabled ?? "").trim().toLowerCase();
    const search = String(raw.search || raw.q || "").trim();
    const limit = Math.max(1, Math.min(1000, intOrDefault(limitValue || raw.limit, 300)));

    const where = [];
    const params = { limit };

    if (eventKeyRaw) {
      where.push("event_key = :eventKey");
      params.eventKey = normalizeMessageEventKey(eventKeyRaw);
    }

    if (styleRaw) {
      where.push("style = :style");
      params.style = normalizeMessageStyle(styleRaw);
    }

    if (enabledRaw) {
      where.push("enabled = :enabled");
      params.enabled = boolish(enabledRaw) ? 1 : 0;
    }

    if (search) {
      where.push("message_text LIKE :search");
      params.search = `%${search}%`;
    }

    const sql = `
      SELECT id, event_key, style, message_text, enabled, weight, created_at, updated_at
      FROM vip_sound_message_templates
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY style ASC, event_key ASC, enabled DESC, weight DESC, id ASC
      LIMIT :limit
    `;

    const rows = database.all(sql, params).map(row => ({
      id: Number(row.id || 0),
      eventKey: row.event_key || "",
      style: row.style || "",
      messageText: row.message_text || "",
      enabled: Number(row.enabled || 0) === 1,
      weight: Number(row.weight || 1),
      createdAt: row.created_at || "",
      updatedAt: row.updated_at || ""
    }));

    return {
      table: VIP_MESSAGE_TABLE,
      filters: {
        eventKey: eventKeyRaw ? normalizeMessageEventKey(eventKeyRaw) : "",
        style: styleRaw ? normalizeMessageStyle(styleRaw) : "",
        enabled: enabledRaw,
        search
      },
      limit,
      rows
    };
  }

  function listVipMessageEventKeys() {
    const rows = database.all(`
      SELECT event_key, style,
             COUNT(*) AS total,
             SUM(CASE WHEN enabled = 1 THEN 1 ELSE 0 END) AS enabled_count
      FROM vip_sound_message_templates
      GROUP BY event_key, style
      ORDER BY style ASC, event_key ASC
    `).map(row => ({
      eventKey: row.event_key || "",
      style: row.style || "",
      total: Number(row.total || 0),
      enabled: Number(row.enabled_count || 0)
    }));

    return {
      table: VIP_MESSAGE_TABLE,
      rows,
      count: rows.length
    };
  }

  function upsertVipMessageTemplate(raw = {}) {
    const id = Number(raw.id || 0);
    const eventKey = normalizeMessageEventKey(raw.eventKey || raw.event_key);
    const style = normalizeMessageStyle(raw.style || VIP_MESSAGE_STYLE);
    const messageText = String(raw.messageText || raw.message_text || raw.text || "").trim();
    if (!messageText) throw new Error("Missing messageText");

    const enabled = raw.enabled === undefined ? true : boolish(raw.enabled);
    const weight = normalizeMessageWeight(raw.weight);
    const now = nowIso();

    if (id > 0) {
      const result = database.run(`
        UPDATE vip_sound_message_templates
        SET event_key = :eventKey,
            style = :style,
            message_text = :messageText,
            enabled = :enabled,
            weight = :weight,
            updated_at = :updatedAt
        WHERE id = :id
      `, {
        id,
        eventKey,
        style,
        messageText,
        enabled: enabled ? 1 : 0,
        weight,
        updatedAt: now
      });

      refreshDbStats();
      return { id, eventKey, style, messageText, enabled, weight, updated: result.changes || 0 };
    }

    database.run(`
      INSERT INTO vip_sound_message_templates
        (event_key, style, message_text, enabled, weight, created_at, updated_at)
      VALUES
        (:eventKey, :style, :messageText, :enabled, :weight, :createdAt, :updatedAt)
      ON CONFLICT(event_key, style, message_text) DO UPDATE SET
        enabled = excluded.enabled,
        weight = excluded.weight,
        updated_at = excluded.updated_at
    `, {
      eventKey,
      style,
      messageText,
      enabled: enabled ? 1 : 0,
      weight,
      createdAt: now,
      updatedAt: now
    });

    const row = database.get(`
      SELECT id
      FROM vip_sound_message_templates
      WHERE event_key = :eventKey
        AND style = :style
        AND message_text = :messageText
      LIMIT 1
    `, { eventKey, style, messageText });

    refreshDbStats();
    return {
      id: row && row.id ? Number(row.id) : 0,
      eventKey,
      style,
      messageText,
      enabled,
      weight,
      updated: 1
    };
  }

  function toggleVipMessageTemplate(raw = {}) {
    const id = Number(raw.id || 0);
    if (id <= 0) throw new Error("Missing id");

    const enabled = boolish(raw.enabled);
    const result = database.run(`
      UPDATE vip_sound_message_templates
      SET enabled = :enabled,
          updated_at = :updatedAt
      WHERE id = :id
    `, {
      id,
      enabled: enabled ? 1 : 0,
      updatedAt: nowIso()
    });

    refreshDbStats();
    return { id, enabled, changed: result.changes || 0 };
  }

  function deleteVipMessageTemplate(raw = {}) {
    const id = Number(raw.id || 0);
    if (id <= 0) throw new Error("Missing id");

    const result = database.run(`
      DELETE FROM vip_sound_message_templates
      WHERE id = :id
    `, { id });

    refreshDbStats();
    return { id, deleted: result.changes || 0 };
  }

  function getCachedTwitchUser(loginRaw) {
    const login = normalizeLogin(loginRaw);
    if (!login) return null;
    try {
      const row = database.get(`
        SELECT login, display_name, twitch_user_id, is_vip, is_mod, is_broadcaster, source, last_seen_at, last_sync_at, created_at, updated_at
        FROM vip_sound_twitch_users
        WHERE login = :login
        LIMIT 1
      `, { login });
      if (!row) return null;
      return {
        login: normalizeLogin(row.login),
        displayName: cleanDisplayName(row.display_name || row.login),
        twitchUserId: String(row.twitch_user_id || ""),
        isVip: Number(row.is_vip || 0) === 1,
        isMod: Number(row.is_mod || 0) === 1,
        isBroadcaster: Number(row.is_broadcaster || 0) === 1,
        source: row.source || "twitch",
        lastSeenAt: row.last_seen_at || "",
        lastSyncAt: row.last_sync_at || "",
        createdAt: row.created_at || "",
        updatedAt: row.updated_at || ""
      };
    } catch (_) {
      return null;
    }
  }

  function twitchSoundAccessForUser(user) {
    const login = normalizeLogin(user && (user.login || user.displayName));
    const cached = getCachedTwitchUser(login);
    const allowed = !!(cached && (cached.isVip || cached.isMod || cached.isBroadcaster));
    const soundType = cached && (cached.isMod || cached.isBroadcaster) ? "mod" : "vip";
    return {
      allowed,
      soundType,
      login,
      cached,
      reason: allowed ? "twitch_cache_allowed" : "not_twitch_vip_or_mod"
    };
  }

  async function detectSoundTypeForTarget(requestedSoundType, targetUser) {
    const requested = normalizeSoundType(requestedSoundType);
    const access = twitchSoundAccessForUser(targetUser);
    if (!access.allowed) return requested;
    return access.soundType || requested;
  }

  function hasExplicitTarget(raw) {
    const keys = [
      "targetLogin",
      "targetUserLogin",
      "targetUserName",
      "targetUsername",
      "target",
      "targetDisplayName",
      "targetUserDisplayName",
      "input0",
      "input1"
    ];

    return keys.some(key => String(raw[key] || "").trim() !== "");
  }

  function getBerlinDate() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());

    const data = {};
    for (const part of parts) data[part.type] = part.value;
    return `${data.year}-${data.month}-${data.day}`;
  }


  function normalizeUsageDate(value) {
    const raw = String(value || "").trim();
    if (!raw) return getBerlinDate();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      throw new Error("Invalid usage_date. Expected YYYY-MM-DD.");
    }
    return raw;
  }

  function optionalUsageDate(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      throw new Error("Invalid usage_date. Expected YYYY-MM-DD.");
    }
    return raw;
  }

  function buildDailyUsageFilters(raw = {}) {
    const usageDate = optionalUsageDate(raw.date || raw.usageDate || raw.usage_date);
    const userLogin = normalizeLogin(raw.login || raw.userLogin || raw.user_login || raw.targetLogin || raw.target);
    const soundTypeRaw = String(raw.soundType || raw.sound_type || raw.type || "").trim();
    const soundType = soundTypeRaw ? normalizeSoundType(soundTypeRaw) : "";

    const where = [];
    const params = {};

    if (usageDate) {
      where.push("usage_date = :usageDate");
      params.usageDate = usageDate;
    }

    if (userLogin) {
      where.push("user_login = :userLogin");
      params.userLogin = userLogin;
    }

    if (soundType) {
      where.push("sound_type = :soundType");
      params.soundType = soundType;
    }

    return {
      usageDate,
      userLogin,
      soundType,
      whereSql: where.length ? `WHERE ${where.join(" AND ")}` : "",
      params
    };
  }

  function listDailyUsageRows(raw = {}, limitValue) {
    const filters = buildDailyUsageFilters(raw);
    const limit = Math.max(1, Math.min(500, intOrDefault(limitValue, 200)));

    const rows = database.all(`
      SELECT usage_date, user_login, user_display_name, sound_type, source, triggered_at
      FROM vip_sound_daily_usage
      ${filters.whereSql}
      ORDER BY usage_date DESC, triggered_at DESC
      LIMIT :limit
    `, {
      ...filters.params,
      limit
    });

    return {
      usageDate: filters.usageDate,
      userLogin: filters.userLogin,
      soundType: filters.soundType,
      filtered: !!(filters.usageDate || filters.userLogin || filters.soundType),
      limit,
      rows: Array.isArray(rows) ? rows : []
    };
  }

  function resetDailyUsageRows(raw = {}) {
    const filters = buildDailyUsageFilters(raw);

    const result = database.run(`
      DELETE FROM vip_sound_daily_usage
      ${filters.whereSql}
    `, filters.params);

    refreshDbStats();

    return {
      usageDate: filters.usageDate,
      userLogin: filters.userLogin,
      soundType: filters.soundType,
      filtered: !!(filters.usageDate || filters.userLogin || filters.soundType),
      deleted: result && typeof result.changes === "number" ? result.changes : 0
    };
  }


  function vipSettingDefaults() {
    return Object.entries(DEFAULT_VIP_SETTINGS).map(([key, def]) => ({
      key,
      value: def.value,
      valueType: def.value_type,
      description: def.description || ""
    }));
  }

  function readVipSettingsConfig() {
    try {
      const loaded = settingsHelper.readConfigFallback(VIP_SETTINGS_CONFIG_FILE, {}, {
        createIfMissing: false,
        mergeDefaults: true
      });

      return {
        ok: !!loaded.ok,
        path: loaded.path || "",
        exists: !!loaded.exists,
        config: loaded.config || loaded.data || {},
        error: loaded.error || ""
      };
    } catch (err) {
      return {
        ok: false,
        path: "",
        exists: false,
        config: {},
        error: err.message || String(err)
      };
    }
  }

  function getNestedValue(obj, pathParts) {
    const dotted = Array.isArray(pathParts) ? pathParts.join(".") : String(pathParts || "");
    return settingsHelper.getNestedValue(obj, dotted, undefined);
  }

  function getConfigSettingValue(key, config) {
    const cfg = config && typeof config === "object" ? config : {};

    const candidates = {
      enabled: [["enabled"]],
      soundBaseDir: [["soundBaseDir"], ["sound", "baseDir"], ["sound", "soundBaseDir"]],
      fileNameMode: [["fileNameMode"], ["sound", "fileNameMode"]],
      fileExtension: [["fileExtension"], ["sound", "fileExtension"]],
      maxSoundUploadBytes: [["maxSoundUploadBytes"], ["sound", "maxUploadBytes"], ["sound", "maxSoundUploadBytes"]],
      soundSystemTarget: [["soundSystemTarget"], ["sound", "target"], ["sound", "soundSystemTarget"], ["soundSystem", "target"]],
      dailyUsageRetentionDays: [["dailyUsageRetentionDays"], ["dailyUsage", "retentionDays"]],
      cleanupDailyUsageOnStartup: [["cleanupDailyUsageOnStartup"], ["dailyUsage", "cleanupOnStartup"]],
      autoDetectTargetRole: [["autoDetectTargetRole"], ["roles", "autoDetectTargetRole"]],
      fallbackRolesEnabled: [["fallbackRolesEnabled"], ["roles", "fallbackRolesEnabled"]],
      twitchSyncEnabled: [["twitchSyncEnabled"], ["twitchSync", "enabled"]],
      twitchSyncIntervalHours: [["twitchSyncIntervalHours"], ["twitchSync", "intervalHours"]],
      twitchSyncOnStartup: [["twitchSyncOnStartup"], ["twitchSync", "onStartup"]],
      twitchSyncOnStartupIfOlderThanHours: [["twitchSyncOnStartupIfOlderThanHours"], ["twitchSync", "onStartupIfOlderThanHours"]],
      twitchSyncIncludeVips: [["twitchSyncIncludeVips"], ["twitchSync", "includeVips"]],
      twitchSyncIncludeMods: [["twitchSyncIncludeMods"], ["twitchSync", "includeMods"]],
      twitchSyncLastAt: [["twitchSyncLastAt"], ["twitchSync", "lastAt"]],
      twitchSyncLastOk: [["twitchSyncLastOk"], ["twitchSync", "lastOk"]],
      twitchSyncLastError: [["twitchSyncLastError"], ["twitchSync", "lastError"]],
      twitchSyncLastCounts: [["twitchSyncLastCounts"], ["twitchSync", "lastCounts"]]
    };

    for (const parts of candidates[key] || [[key]]) {
      const value = getNestedValue(cfg, parts);
      if (value !== undefined && value !== null && String(value).trim() !== "") return value;
    }

    return undefined;
  }

  function seedDefaultSettingsIfMissing() {
    const loadedConfig = readVipSettingsConfig();
    const cfg = loadedConfig.config || {};
    const defaults = vipSettingDefaults().map(item => {
      const configValue = getConfigSettingValue(item.key, cfg);
      return {
        ...item,
        value: configValue === undefined ? item.value : configValue
      };
    });

    settingsHelper.seedDefaults(VIP_SETTINGS_TABLE, defaults);
  }

  function listVipSettings() {
    const loadedConfig = readVipSettingsConfig();
    const cfg = loadedConfig.config || {};
    const defaults = vipSettingDefaults();
    const settings = [];

    for (const def of defaults) {
      const row = settingsHelper.getSetting(VIP_SETTINGS_TABLE, def.key, undefined, {
        valueType: def.valueType,
        description: def.description
      });

      if (row && row.found) {
        settings.push({
          key: row.key,
          value: row.value,
          rawValue: row.rawValue,
          valueType: row.valueType,
          description: row.description || def.description || "",
          source: "database",
          createdAt: row.createdAt || "",
          updatedAt: row.updatedAt || ""
        });
        continue;
      }

      const configValue = getConfigSettingValue(def.key, cfg);
      if (configValue !== undefined) {
        const valueType = settingsHelper.normalizeValueType(def.valueType, configValue);
        settings.push({
          key: def.key,
          value: settingsHelper.decodeValue(settingsHelper.encodeValue(configValue, valueType), valueType, def.value),
          rawValue: settingsHelper.encodeValue(configValue, valueType),
          valueType,
          description: def.description || "",
          source: "config",
          createdAt: "",
          updatedAt: ""
        });
        continue;
      }

      settings.push({
        key: def.key,
        value: def.value,
        rawValue: settingsHelper.encodeValue(def.value, def.valueType),
        valueType: def.valueType,
        description: def.description || "",
        source: "default",
        createdAt: "",
        updatedAt: ""
      });
    }

    return {
      settings,
      config: {
        file: VIP_SETTINGS_CONFIG_FILE,
        path: loadedConfig.path || "",
        exists: !!loadedConfig.exists,
        ok: !!loadedConfig.ok,
        error: loadedConfig.error || ""
      }
    };
  }

  function getVipSetting(key, fallback = undefined) {
    const def = DEFAULT_VIP_SETTINGS[key];
    const defaultValue = fallback !== undefined ? fallback : (def ? def.value : undefined);
    const valueType = def ? def.value_type : settingsHelper.normalizeValueType("", defaultValue);

    try {
      const row = settingsHelper.getSetting(VIP_SETTINGS_TABLE, key, undefined, {
        valueType,
        description: def ? def.description : ""
      });

      if (row && row.found) return row.value;
    } catch (_) {
      // DB may not be ready during early boot; fallback below.
    }

    const loadedConfig = readVipSettingsConfig();
    const configValue = getConfigSettingValue(key, loadedConfig.config || {});
    if (configValue !== undefined && def) {
      return settingsHelper.decodeValue(settingsHelper.encodeValue(configValue, valueType), valueType, defaultValue);
    }

    return defaultValue;
  }

  function normalizeSoundSystemTarget(value, fallback = "both") {
    const target = String(value || fallback || "both").trim().toLowerCase();
    if (["stream", "discord", "both"].includes(target)) return target;
    return fallback;
  }


  function normalizeVipSettingKey(value) {
    const key = String(value || "").trim();
    if (!key) throw new Error("setting_key_required");
    if (!Object.prototype.hasOwnProperty.call(DEFAULT_VIP_SETTINGS, key)) {
      throw new Error(`invalid_vip_setting:${key}`);
    }
    return key;
  }

  function upsertVipSetting(raw = {}) {
    const key = normalizeVipSettingKey(raw.key || raw.settingKey || raw.name);
    const def = DEFAULT_VIP_SETTINGS[key];

    let value;
    if (Object.prototype.hasOwnProperty.call(raw, "value")) value = raw.value;
    else if (Object.prototype.hasOwnProperty.call(raw, "settingValue")) value = raw.settingValue;
    else if (Object.prototype.hasOwnProperty.call(raw, "rawValue")) value = raw.rawValue;
    else throw new Error("setting_value_required");

    const valueType = settingsHelper.normalizeValueType(raw.valueType || raw.type || def.value_type, value);
    const description = String(raw.description || def.description || "");

    const row = settingsHelper.setSetting(VIP_SETTINGS_TABLE, key, value, {
      valueType,
      description
    });

    refreshDbStats();

    return {
      ok: true,
      module: MODULE_NAME,
      settingsTable: VIP_SETTINGS_TABLE,
      setting: {
        key: row.key,
        value: row.value,
        rawValue: row.rawValue,
        valueType: row.valueType,
        description: row.description || description,
        source: "database",
        createdAt: row.createdAt || "",
        updatedAt: row.updatedAt || ""
      },
      db: { ...state.db },
      updatedAt: nowIso()
    };
  }

  function deleteVipSetting(raw = {}) {
    const key = normalizeVipSettingKey(raw.key || raw.settingKey || raw.name);
    const result = settingsHelper.deleteSetting(VIP_SETTINGS_TABLE, key);

    refreshDbStats();

    return {
      ok: true,
      module: MODULE_NAME,
      settingsTable: VIP_SETTINGS_TABLE,
      key,
      deleted: result.deleted || 0,
      db: { ...state.db },
      updatedAt: nowIso()
    };
  }

  function resetVipSettingsToDefaults(raw = {}) {
    const onlyKey = String(raw.key || raw.settingKey || raw.name || "").trim();
    const defaults = vipSettingDefaults().filter(item => !onlyKey || item.key === normalizeVipSettingKey(onlyKey));
    if (onlyKey && !defaults.length) throw new Error(`invalid_vip_setting:${onlyKey}`);

    const changed = [];
    for (const item of defaults) {
      const row = settingsHelper.setSetting(VIP_SETTINGS_TABLE, item.key, item.value, {
        valueType: item.valueType,
        description: item.description
      });
      changed.push({
        key: row.key,
        value: row.value,
        rawValue: row.rawValue,
        valueType: row.valueType,
        description: row.description || item.description || "",
        source: "database",
        createdAt: row.createdAt || "",
        updatedAt: row.updatedAt || ""
      });
    }

    refreshDbStats();

    return {
      ok: true,
      module: MODULE_NAME,
      settingsTable: VIP_SETTINGS_TABLE,
      resetAll: !onlyKey,
      count: changed.length,
      settings: changed,
      db: { ...state.db },
      updatedAt: nowIso()
    };
  }

  function ensureVipSchema() {
    try {
      database.init(ctx);
      database.ensureSchema(VIP_SCHEMA_MODULE, VIP_SCHEMA_VERSION, (fromVersion, toVersion, db) => {
        if (toVersion === 1) {
          db.exec(`
            CREATE TABLE IF NOT EXISTS vip_sound_daily_usage (
              usage_date TEXT NOT NULL,
              user_login TEXT NOT NULL,
              user_display_name TEXT NOT NULL DEFAULT '',
              sound_type TEXT NOT NULL DEFAULT 'vip',
              source TEXT NOT NULL DEFAULT '',
              triggered_at TEXT NOT NULL,
              PRIMARY KEY (usage_date, user_login, sound_type)
            );

            CREATE TABLE IF NOT EXISTS vip_sound_message_templates (
              id ${database.primaryKeyAutoIncrementSql()},
              event_key TEXT NOT NULL,
              style TEXT NOT NULL DEFAULT 'heimleitung',
              message_text TEXT NOT NULL,
              enabled INTEGER NOT NULL DEFAULT 1,
              weight INTEGER NOT NULL DEFAULT 1,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              UNIQUE(event_key, style, message_text)
            );
          `);
        }

        if (toVersion === 2) {
          db.exec(`
            CREATE TABLE IF NOT EXISTS vip_sound_settings (
              setting_key TEXT PRIMARY KEY,
              setting_value TEXT NOT NULL,
              value_type TEXT NOT NULL DEFAULT 'string',
              description TEXT NOT NULL DEFAULT '',
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );
          `);
        }

        if (toVersion === 3) {
          db.exec(`
            CREATE TABLE IF NOT EXISTS vip_sound_events (
              id ${database.primaryKeyAutoIncrementSql()},
              created_at TEXT NOT NULL,
              usage_date TEXT NOT NULL DEFAULT '',
              event_key TEXT NOT NULL DEFAULT '',
              event_type TEXT NOT NULL DEFAULT '',
              actor_login TEXT NOT NULL DEFAULT '',
              actor_display_name TEXT NOT NULL DEFAULT '',
              target_login TEXT NOT NULL DEFAULT '',
              target_display_name TEXT NOT NULL DEFAULT '',
              user_login TEXT NOT NULL DEFAULT '',
              user_display_name TEXT NOT NULL DEFAULT '',
              sound_type TEXT NOT NULL DEFAULT '',
              source TEXT NOT NULL DEFAULT '',
              trigger TEXT NOT NULL DEFAULT '',
              request_id TEXT NOT NULL DEFAULT '',
              sound_system_request_id TEXT NOT NULL DEFAULT '',
              sound_file TEXT NOT NULL DEFAULT '',
              sound_path TEXT NOT NULL DEFAULT '',
              accepted INTEGER NOT NULL DEFAULT 0,
              duplicate INTEGER NOT NULL DEFAULT 0,
              override INTEGER NOT NULL DEFAULT 0,
              override_allowed INTEGER NOT NULL DEFAULT 0,
              daily_usage_written INTEGER NOT NULL DEFAULT 0,
              sound_system_queued INTEGER NOT NULL DEFAULT 0,
              sound_system_started INTEGER NOT NULL DEFAULT 0,
              error_code TEXT NOT NULL DEFAULT '',
              message_text TEXT NOT NULL DEFAULT ''
            );

            CREATE INDEX IF NOT EXISTS idx_vip_sound_events_created_at
              ON vip_sound_events(created_at);
            CREATE INDEX IF NOT EXISTS idx_vip_sound_events_usage_date
              ON vip_sound_events(usage_date);
            CREATE INDEX IF NOT EXISTS idx_vip_sound_events_user_login
              ON vip_sound_events(user_login);
            CREATE INDEX IF NOT EXISTS idx_vip_sound_events_event_type
              ON vip_sound_events(event_type);
          `);
        }

        if (toVersion === 4) {
          db.exec(`
            CREATE TABLE IF NOT EXISTS vip_sound_role_overrides (
              login TEXT NOT NULL,
              display_name TEXT NOT NULL DEFAULT '',
              role_type TEXT NOT NULL DEFAULT 'vip',
              enabled INTEGER NOT NULL DEFAULT 1,
              source TEXT NOT NULL DEFAULT 'manual',
              note TEXT NOT NULL DEFAULT '',
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              PRIMARY KEY (login, role_type)
            );

            CREATE INDEX IF NOT EXISTS idx_vip_sound_role_overrides_role_type
              ON vip_sound_role_overrides(role_type);
            CREATE INDEX IF NOT EXISTS idx_vip_sound_role_overrides_enabled
              ON vip_sound_role_overrides(enabled);
          `);
        }

        if (toVersion === 5) {
          db.exec(`
            CREATE TABLE IF NOT EXISTS vip_sound_twitch_users (
              login TEXT PRIMARY KEY,
              display_name TEXT NOT NULL DEFAULT '',
              twitch_user_id TEXT NOT NULL DEFAULT '',
              is_vip INTEGER NOT NULL DEFAULT 0,
              is_mod INTEGER NOT NULL DEFAULT 0,
              is_broadcaster INTEGER NOT NULL DEFAULT 0,
              source TEXT NOT NULL DEFAULT 'twitch',
              last_seen_at TEXT NOT NULL DEFAULT '',
              last_sync_at TEXT NOT NULL DEFAULT '',
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_vip_sound_twitch_users_is_vip
              ON vip_sound_twitch_users(is_vip);
            CREATE INDEX IF NOT EXISTS idx_vip_sound_twitch_users_is_mod
              ON vip_sound_twitch_users(is_mod);
            CREATE INDEX IF NOT EXISTS idx_vip_sound_twitch_users_last_sync_at
              ON vip_sound_twitch_users(last_sync_at);
          `);
        }
      });
      seedDefaultMessagesIfEmpty();
      seedDefaultSettingsIfMissing();
      importVipRoleConfigIfEmpty();
      state.db.initialized = true;
      state.db.lastError = "";
      refreshDbStats();
      return true;
    } catch (err) {
      state.db.initialized = false;
      state.db.lastError = err.message || String(err);
      console.warn(`[${MODULE_NAME}] db schema unavailable: ${state.db.lastError}`);
      return false;
    }
  }

  function seedDefaultMessagesIfEmpty() {
    const now = nowIso();
    const seedGroups = [
      { style: VIP_MESSAGE_STYLE, items: DEFAULT_VIP_MESSAGES },
      { style: VIP_OVERLAY_STYLE, items: DEFAULT_VIP_OVERLAY_MESSAGES }
    ];

    for (const group of seedGroups) {
      for (const item of group.items) {
        database.run(`
          INSERT OR IGNORE INTO vip_sound_message_templates
            (event_key, style, message_text, enabled, weight, created_at, updated_at)
          VALUES
            (:eventKey, :style, :messageText, 1, :weight, :createdAt, :updatedAt)
        `, {
          eventKey: item.event_key,
          style: group.style,
          messageText: item.message_text,
          weight: Number(item.weight || 1),
          createdAt: now,
          updatedAt: now
        });
      }
    }
  }

  function pickWeightedMessage(rows) {
    const list = Array.isArray(rows) ? rows.filter(Boolean) : [];
    if (!list.length) return "";

    const total = list.reduce((sum, row) => {
      const weight = Math.max(1, Number(row.weight || 1));
      return sum + weight;
    }, 0);

    let pick = Math.random() * total;
    for (const row of list) {
      pick -= Math.max(1, Number(row.weight || 1));
      if (pick <= 0) return String(row.message_text || "");
    }

    return String(list[list.length - 1].message_text || "");
  }

  function getMessageTemplate(key, style = VIP_MESSAGE_STYLE) {
    const rows = database.all(`
      SELECT message_text, weight
      FROM vip_sound_message_templates
      WHERE event_key = :eventKey
        AND style = :style
        AND enabled = 1
      ORDER BY id ASC
    `, {
      eventKey: key,
      style
    });

    return pickWeightedMessage(rows);
  }

  function renderDbTemplate(template, context = {}, maxLength = 180) {
    const raw = messages.replacePlaceholders(String(template || ""), context);
    return messages.sanitizeChatMessage(raw, maxLength);
  }

  function overlayEventKey(prefix, soundType) {
    return `${prefix}_${normalizeSoundType(soundType)}`;
  }

  function fallbackMessage(key, displayName) {
    const name = displayName || "User";
    if (key === "accepted_mod") return `@${name}, Mod-Sound wurde von der Heimaufsicht durchgewunken.`;
    if (key === "accepted_override_vip") return `@${name}, Heimaufsicht hat eine Sonderfreigabe erteilt. Der VIP-Sound wird erneut abgespielt.`;
    if (key === "accepted_override_mod") return `@${name}, Heimaufsicht hat eine Mod-Sonderfreigabe erteilt. Der Sound wird erneut abgespielt.`;
    if (key === "denied_override_vip") return `@${name}, Antrag abgelehnt. VIP-Sound-Sonderfreigaben gibt es nur fuer Mods und die Sendeleitung.`;
    if (key === "denied_override_mod") return `@${name}, Antrag abgelehnt. Mod-Sound-Sonderfreigaben gibt es nur fuer Mods und die Sendeleitung.`;
    if (key === "duplicate_mod") return `@${name}, Einspruch zwecklos. Dein Mod-Sound war heute schon dran.`;
    if (key === "duplicate_vip") return `@${name}, Heimaufsicht sagt nein. Dein VIP-Sound wurde heute bereits genutzt.`;
    if (key === "system_disabled") return `@${name}, Heimaufsicht meldet: VIP-Sounds sind gerade ausser Betrieb.`;
    if (key === "sound_missing") return `@${name}, Heimaufsicht findet deine Soundakte gerade nicht.`;
    if (key === "not_twitch_vip_or_mod") return `@${name}, VIP-Sounds sind nur fuer aktuelle Twitch-VIPs und Twitch-Mods freigegeben.`;
    if (key === "error_generic") return `@${name}, Heimaufsicht hat einen Fehler im Formular gefunden.`;
    return `@${name}, Heimaufsicht hat deinen VIP-Sound notiert.`;
  }

  async function buildVipChatResponse(key, context, extra = {}) {
    const template = state.db.initialized ? getMessageTemplate(key) : "";
    const raw = template || fallbackMessage(key, context.displayName || context.login);
    const text = messages.sanitizeChatMessage(messages.replacePlaceholders(raw, context), 450);
    const meta = {
      module: MODULE_NAME,
      eventKey: key,
      ...extra
    };

    let output;
    try {
      output = await chatOutput.sendChatMessage(text, {
        source: MODULE_NAME,
        reason: key,
        fallbackToStreamerbot: false,
        directSendEnabled: true
      });

      state.chat.lastOk = !!output.ok && output.sent === true;
      state.chat.lastAt = nowIso();
      state.chat.lastError = output.ok ? "" : (output.reason || output.error || "chat_output_failed");
      state.chat.lastVia = output.via || output.account || "";
    } catch (err) {
      output = messages.buildErrorResponse("chat_output_exception", {
        extra: { error: err.message || String(err) }
      });

      state.chat.lastOk = false;
      state.chat.lastAt = nowIso();
      state.chat.lastError = err.message || String(err);
      state.chat.lastVia = "none";
    }

    return {
      ...output,
      send: false,
      chatMessage: "",
      streamerbot_send: "0",
      streamerbot_message: "",
      message: text,
      text,
      centralChat: output,
      ...meta
    };
  }

  function buildQueuedChatMessage(item, queuePosition) {
    const mentionName = item.displayName || item.login || "User";
    const label = item.soundType === "mod" ? "Mod-Sound" : "VIP-Sound";
    return `@${mentionName} – Dein ${label} wurde in die Warteschlange gepackt (Position ${queuePosition}).`;
  }

  function fallbackOverlayTitle(soundType) {
    return soundType === "mod" ? "Mod-Sound" : "VIP-Sound";
  }

  function fallbackOverlayText(soundType) {
    return soundType === "mod"
      ? "Danke, dass du uns als Mod unterstützt"
      : "Schön, dass du da bist";
  }

  function buildOverlayTitle(soundType, context = {}) {
    if (state.db.initialized) {
      const template = getMessageTemplate(overlayEventKey("overlay_title", soundType), VIP_OVERLAY_STYLE);
      if (template) return renderDbTemplate(template, context, 80);
    }

    return fallbackOverlayTitle(soundType);
  }

  function buildOverlayText(soundType, context = {}) {
    if (state.db.initialized) {
      const template = getMessageTemplate(overlayEventKey("overlay_text", soundType), VIP_OVERLAY_STYLE);
      if (template) return renderDbTemplate(template, context, 180);
    }

    return fallbackOverlayText(soundType);
  }

  function beautifyDisplayName(name) {
    const s = (name || "").toString().trim();
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function httpGetJson(url) {
    return new Promise((resolve, reject) => {
      const lib = url.startsWith("https://") ? https : http;

      const req = lib.get(url, (res) => {
        let raw = "";
        res.setEncoding("utf8");

        res.on("data", (chunk) => {
          raw += chunk;
        });

        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          }

          try {
            resolve(JSON.parse(raw));
          } catch (err) {
            reject(new Error(`Invalid JSON from ${url}: ${err.message}`));
          }
        });
      });

      req.on("error", reject);
      req.setTimeout(5000, () => {
        req.destroy(new Error(`Timeout for ${url}`));
      });
    });
  }

  function httpPostJson(url, payload) {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify(payload || {});
      const target = new URL(url);
      const lib = target.protocol === "https:" ? https : http;

      const req = lib.request({
        method: "POST",
        hostname: target.hostname,
        port: target.port || (target.protocol === "https:" ? 443 : 80),
        path: `${target.pathname}${target.search || ""}`,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        },
        timeout: 8000
      }, (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", chunk => { raw += chunk; });
        res.on("end", () => {
          let json = null;
          try { json = raw ? JSON.parse(raw) : null; } catch (_) { json = null; }

          if (res.statusCode < 200 || res.statusCode >= 300) {
            const msg = json && (json.error || json.message) ? (json.error || json.message) : `HTTP ${res.statusCode}`;
            const err = new Error(msg);
            err.statusCode = res.statusCode;
            err.response = json || raw;
            return reject(err);
          }

          resolve(json || {});
        });
      });

      req.on("error", reject);
      req.on("timeout", () => req.destroy(new Error(`Timeout for ${url}`)));
      req.write(body);
      req.end();
    });
  }

  function normalizeFileExtension(value) {
    let ext = String(value || ".mp3").trim();
    if (!ext) ext = ".mp3";
    if (!ext.startsWith(".")) ext = `.${ext}`;
    return ext;
  }

  function sanitizeSoundFileBaseName(value, fallback) {
    const raw = String(value || fallback || "").trim();
    return raw.replace(/[\\/:*?"<>|]/g, "_").trim();
  }

  function getVipSoundBaseDir() {
    const defaultDir = process.env.VIP_SOUND_BASE_DIR || path.join(webRoot, "assets", "sounds", "vip");
    const raw = String(getVipSetting("soundBaseDir", defaultDir) || "").trim();
    const selected = raw || defaultDir;

    if (path.isAbsolute(selected)) return selected;
    return path.join(process.cwd(), selected);
  }

  function getVipSoundFileName(user) {
    const login = normalizeLogin(user.login || "");
    const displayName = cleanDisplayName(user.displayName || user.login || "");
    const mode = String(getVipSetting("fileNameMode", "displayName") || "displayName").trim().toLowerCase();
    const extension = normalizeFileExtension(getVipSetting("fileExtension", ".mp3"));

    let baseName = displayName || login;
    if (mode === "login") {
      baseName = login || displayName;
    } else if (mode === "displayname_lower" || mode === "displayname-lower" || mode === "displaynamelower") {
      baseName = (displayName || login).toLowerCase();
    }

    return `${sanitizeSoundFileBaseName(baseName, login || displayName || "vip")}${extension}`;
  }

  function toSoundSystemFileReference(fullPath) {
    const soundsRoot = path.join(webRoot, "assets", "sounds");
    const rootWin = String(soundsRoot).replace(/\//g, "\\");
    const fullWin = String(fullPath).replace(/\//g, "\\");
    const rootWithSlash = rootWin.endsWith("\\") ? rootWin : `${rootWin}\\`;
    const rootCompare = normalizeWinPath(rootWithSlash);
    const fullCompare = normalizeWinPath(fullWin);

    if (fullCompare.startsWith(rootCompare)) {
      return fullWin.slice(rootWithSlash.length).replace(/\\/g, "/");
    }

    return fullPath;
  }

  function resolveVipSoundFile(user) {
    const displayName = cleanDisplayName(user.displayName || user.login || "");
    const baseDir = getVipSoundBaseDir();
    const fileName = getVipSoundFileName(user);
    const fullPath = path.join(baseDir, fileName);
    const relativeFile = toSoundSystemFileReference(fullPath);

    return {
      displayName,
      fileName,
      baseDir,
      fullPath,
      relativeFile,
      fileNameMode: String(getVipSetting("fileNameMode", "displayName") || "displayName"),
      fileExtension: normalizeFileExtension(getVipSetting("fileExtension", ".mp3")),
      exists: fileExistsSafe(fullPath)
    };
  }


  function createVipSoundUploadMiddleware() {
    if (!multer) return null;

    return multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: Math.max(1024, Number(getVipSetting("maxSoundUploadBytes", 15728640)) || 15728640)
      },
      fileFilter(req, file, cb) {
        const originalName = String(file.originalname || "");
        const mime = String(file.mimetype || "").toLowerCase();
        const allowedByExt = media.extensionAllowed(originalName, media.DEFAULT_ALLOWED_EXTENSIONS);
        const allowedByMime = mime.startsWith("audio/") || mime === "application/octet-stream";
        if (!allowedByExt || !allowedByMime) {
          return cb(new Error(`Dateityp nicht erlaubt: ${file.originalname || file.mimetype || "unknown"}`));
        }
        return cb(null, true);
      }
    });
  }

  async function resolveUploadTargetUser(raw = {}) {
    const loginRaw = normalizeLogin(raw.login || raw.userLogin || raw.targetLogin || raw.user || raw.name || "");
    const displayRaw = cleanDisplayName(raw.displayName || raw.userDisplayName || raw.targetDisplayName || raw.display || raw.name || loginRaw);
    const lookupKey = loginRaw || displayRaw;
    let info = null;

    if (lookupKey) {
      try {
        info = await fetchUserInfo(lookupKey);
      } catch (_) {
        info = null;
      }
    }

    const login = normalizeLogin((info && info.login) || loginRaw || displayRaw);
    const displayName = cleanDisplayName((info && info.displayName) || displayRaw || login);
    if (!login && !displayName) throw new Error("login_required");

    return {
      login: login || normalizeLogin(displayName),
      displayName: displayName || login
    };
  }

  function ensurePathInsideBase(targetPath, baseDir) {
    const base = path.resolve(baseDir);
    const target = path.resolve(targetPath);
    if (target !== base && !target.startsWith(base + path.sep)) {
      throw new Error("upload_target_outside_base_dir");
    }
    return target;
  }

  function vipSoundDurationInfo(sound) {
    if (!sound || !sound.exists) {
      return { durationMs: 0, durationOk: false, durationError: sound ? "file_not_found" : "sound_missing", sizeBytes: 0 };
    }

    const duration = media.readAudioDurationMs(sound.fullPath, { cache: false });
    let sizeBytes = 0;
    try {
      sizeBytes = fs.statSync(sound.fullPath).size || 0;
    } catch (_) {
      sizeBytes = 0;
    }

    return {
      durationMs: Number(duration.durationMs || 0),
      durationOk: !!duration.ok,
      durationError: duration.error || "",
      sizeBytes
    };
  }

  function publicVipSoundInfo(sound, extra = {}) {
    return {
      fileName: sound.fileName || "",
      relativeFile: sound.relativeFile || "",
      fullPath: sound.fullPath || "",
      baseDir: sound.baseDir || "",
      exists: !!sound.exists,
      fileNameMode: sound.fileNameMode || "",
      fileExtension: sound.fileExtension || "",
      durationMs: Number(extra.durationMs || 0),
      durationOk: !!extra.durationOk,
      durationError: extra.durationError || "",
      sizeBytes: Number(extra.sizeBytes || 0),
      originalName: extra.originalName || "",
      overwritten: !!extra.overwritten
    };
  }

  async function buildVipSoundStatus(raw = {}) {
    const user = await resolveUploadTargetUser(raw);
    const sound = resolveVipSoundFile(user);
    const info = vipSoundDurationInfo(sound);

    return {
      ok: true,
      module: MODULE_NAME,
      user,
      sound: publicVipSoundInfo(sound, info),
      settings: {
        soundBaseDir: getVipSoundBaseDir(),
        fileNameMode: String(getVipSetting("fileNameMode", "displayName") || "displayName"),
        fileExtension: normalizeFileExtension(getVipSetting("fileExtension", ".mp3")),
        maxSoundUploadBytes: Number(getVipSetting("maxSoundUploadBytes", 15728640)) || 15728640
      },
      updatedAt: nowIso()
    };
  }


  function setVipSettingInternal(key, value, valueType) {
    const def = DEFAULT_VIP_SETTINGS[key] || {};
    try {
      settingsHelper.setSetting(VIP_SETTINGS_TABLE, key, value, {
        valueType: valueType || def.value_type || settingsHelper.normalizeValueType("", value),
        description: def.description || ""
      });
    } catch (err) {
      state.db.lastError = err.message || String(err);
    }
  }

  function numberSetting(key, fallback) {
    const n = Number(getVipSetting(key, fallback));
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }

  function twitchSyncSettings() {
    return {
      enabled: !!getVipSetting("twitchSyncEnabled", true),
      intervalHours: numberSetting("twitchSyncIntervalHours", 24),
      onStartup: !!getVipSetting("twitchSyncOnStartup", true),
      onStartupIfOlderThanHours: numberSetting("twitchSyncOnStartupIfOlderThanHours", 24),
      includeVips: !!getVipSetting("twitchSyncIncludeVips", true),
      includeMods: !!getVipSetting("twitchSyncIncludeMods", true),
      lastAt: String(getVipSetting("twitchSyncLastAt", "") || ""),
      lastOk: !!getVipSetting("twitchSyncLastOk", false),
      lastError: String(getVipSetting("twitchSyncLastError", "") || ""),
      lastCounts: getVipSetting("twitchSyncLastCounts", { vips: 0, mods: 0, total: 0 }) || { vips: 0, mods: 0, total: 0 }
    };
  }

  function ageHours(iso) {
    const time = Date.parse(String(iso || ""));
    if (!Number.isFinite(time)) return Infinity;
    return (Date.now() - time) / 3600000;
  }

  function listCachedTwitchUsers(limitValue = 1000) {
    try {
      const limit = Math.max(1, Math.min(5000, intOrDefault(limitValue, 1000)));
      return database.all(`
        SELECT login, display_name, twitch_user_id, is_vip, is_mod, is_broadcaster, source, last_seen_at, last_sync_at, created_at, updated_at
        FROM vip_sound_twitch_users
        ORDER BY display_name COLLATE NOCASE ASC, login ASC
        LIMIT :limit
      `, { limit }).map(row => ({
        login: normalizeLogin(row.login),
        displayName: cleanDisplayName(row.display_name || row.login),
        twitchUserId: String(row.twitch_user_id || ""),
        isVip: Number(row.is_vip || 0) === 1,
        isMod: Number(row.is_mod || 0) === 1,
        isBroadcaster: Number(row.is_broadcaster || 0) === 1,
        source: row.source || "twitch",
        lastSeenAt: row.last_seen_at || "",
        lastSyncAt: row.last_sync_at || "",
        createdAt: row.created_at || "",
        updatedAt: row.updated_at || ""
      }));
    } catch (_) {
      return [];
    }
  }

  function cachedTwitchCounts() {
    try {
      const row = database.get(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN is_vip = 1 THEN 1 ELSE 0 END) AS vips,
               SUM(CASE WHEN is_mod = 1 THEN 1 ELSE 0 END) AS mods,
               MAX(last_sync_at) AS last_sync_at
        FROM vip_sound_twitch_users
      `) || {};
      return {
        total: Number(row.total || 0),
        vips: Number(row.vips || 0),
        mods: Number(row.mods || 0),
        lastSyncAt: row.last_sync_at || ""
      };
    } catch (_) {
      return { total: 0, vips: 0, mods: 0, lastSyncAt: "" };
    }
  }

  function upsertTwitchUsers(rows, syncAt, includeVips, includeMods) {
    if (includeVips) database.run(`UPDATE vip_sound_twitch_users SET is_vip = 0, updated_at = :now WHERE is_vip = 1`, { now: syncAt });
    if (includeMods) database.run(`UPDATE vip_sound_twitch_users SET is_mod = 0, updated_at = :now WHERE is_mod = 1`, { now: syncAt });

    for (const row of rows) {
      const login = normalizeLogin(row.login);
      if (!login) continue;
      database.run(`
        INSERT INTO vip_sound_twitch_users
          (login, display_name, twitch_user_id, is_vip, is_mod, is_broadcaster, source, last_seen_at, last_sync_at, created_at, updated_at)
        VALUES
          (:login, :displayName, :twitchUserId, :isVip, :isMod, :isBroadcaster, 'twitch', :lastSeenAt, :lastSyncAt, :createdAt, :updatedAt)
        ON CONFLICT(login) DO UPDATE SET
          display_name = CASE WHEN excluded.display_name <> '' THEN excluded.display_name ELSE vip_sound_twitch_users.display_name END,
          twitch_user_id = CASE WHEN excluded.twitch_user_id <> '' THEN excluded.twitch_user_id ELSE vip_sound_twitch_users.twitch_user_id END,
          is_vip = CASE WHEN excluded.is_vip = 1 THEN 1 ELSE vip_sound_twitch_users.is_vip END,
          is_mod = CASE WHEN excluded.is_mod = 1 THEN 1 ELSE vip_sound_twitch_users.is_mod END,
          is_broadcaster = CASE WHEN excluded.is_broadcaster = 1 THEN 1 ELSE vip_sound_twitch_users.is_broadcaster END,
          source = 'twitch',
          last_seen_at = excluded.last_seen_at,
          last_sync_at = excluded.last_sync_at,
          updated_at = excluded.updated_at
      `, {
        login,
        displayName: cleanDisplayName(row.displayName || row.display_name || login),
        twitchUserId: String(row.twitchUserId || row.twitch_user_id || ""),
        isVip: row.isVip ? 1 : 0,
        isMod: row.isMod ? 1 : 0,
        isBroadcaster: row.isBroadcaster ? 1 : 0,
        lastSeenAt: syncAt,
        lastSyncAt: syncAt,
        createdAt: syncAt,
        updatedAt: syncAt
      });
    }
  }

  async function runTwitchVipModSync(raw = {}) {
    ensureVipSchema();
    if (state.twitchSync.running) throw new Error("twitch_sync_already_running");

    const cfg = twitchSyncSettings();
    const includeVips = raw.includeVips === undefined ? cfg.includeVips : boolish(raw.includeVips);
    const includeMods = raw.includeMods === undefined ? cfg.includeMods : boolish(raw.includeMods);
    if (!includeVips && !includeMods) throw new Error("twitch_sync_no_sources_enabled");

    const syncAt = nowIso();
    state.twitchSync.running = true;
    state.twitchSync.lastRunStartedAt = syncAt;
    state.twitchSync.lastError = "";

    try {
      const merged = new Map();
      let vipResult = { count: 0, rows: [] };
      let modResult = { count: 0, rows: [] };

      if (includeVips) {
        vipResult = await twitchRoles.listChannelVips({ maxPages: 25 });
        for (const row of vipResult.rows || []) {
          const key = normalizeLogin(row.login);
          if (!key) continue;
          const existing = merged.get(key) || { ...row, isVip: false, isMod: false };
          existing.isVip = true;
          existing.displayName = row.displayName || existing.displayName || key;
          existing.twitchUserId = row.twitchUserId || existing.twitchUserId || "";
          merged.set(key, existing);
        }
      }

      if (includeMods) {
        modResult = await twitchRoles.listChannelModerators({ maxPages: 25 });
        for (const row of modResult.rows || []) {
          const key = normalizeLogin(row.login);
          if (!key) continue;
          const existing = merged.get(key) || { ...row, isVip: false, isMod: false };
          existing.isMod = true;
          existing.displayName = row.displayName || existing.displayName || key;
          existing.twitchUserId = row.twitchUserId || existing.twitchUserId || "";
          merged.set(key, existing);
        }
      }

      const rows = Array.from(merged.values());
      upsertTwitchUsers(rows, syncAt, includeVips, includeMods);

      const counts = cachedTwitchCounts();
      setVipSettingInternal("twitchSyncLastAt", syncAt, "string");
      setVipSettingInternal("twitchSyncLastOk", true, "boolean");
      setVipSettingInternal("twitchSyncLastError", "", "string");
      setVipSettingInternal("twitchSyncLastCounts", { vips: counts.vips, mods: counts.mods, total: counts.total }, "json");

      state.twitchSync.running = false;
      state.twitchSync.lastRunFinishedAt = nowIso();
      state.twitchSync.lastError = "";
      refreshDbStats();

      return {
        ok: true,
        module: MODULE_NAME,
        syncedAt: syncAt,
        includeVips,
        includeMods,
        fetched: {
          vips: Number(vipResult.count || (vipResult.rows || []).length || 0),
          mods: Number(modResult.count || (modResult.rows || []).length || 0)
        },
        counts,
        rows: listCachedTwitchUsers(1000)
      };
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      setVipSettingInternal("twitchSyncLastAt", syncAt, "string");
      setVipSettingInternal("twitchSyncLastOk", false, "boolean");
      setVipSettingInternal("twitchSyncLastError", msg, "string");
      state.twitchSync.running = false;
      state.twitchSync.lastRunFinishedAt = nowIso();
      state.twitchSync.lastError = msg;
      refreshDbStats();
      throw err;
    }
  }

  function twitchSyncStatus() {
    ensureVipSchema();
    const settings = twitchSyncSettings();
    const counts = cachedTwitchCounts();
    const token = typeof twitchRoles.tokenStatus === "function" ? twitchRoles.tokenStatus() : { ok: false };
    const intervalMs = Math.max(1, Number(settings.intervalHours || 24)) * 3600000;
    const lastMs = Date.parse(settings.lastAt || counts.lastSyncAt || "");
    const nextAt = Number.isFinite(lastMs) ? new Date(lastMs + intervalMs).toISOString() : "";

    return {
      ok: true,
      module: MODULE_NAME,
      settings,
      running: !!state.twitchSync.running,
      runtime: { ...state.twitchSync },
      token,
      counts,
      nextSyncAt: nextAt,
      shouldSyncNow: settings.enabled && (!Number.isFinite(lastMs) || Date.now() - lastMs >= intervalMs),
      rows: listCachedTwitchUsers(1000),
      updatedAt: nowIso()
    };
  }

  function maybeStartTwitchAutoSync(reason) {
    const settings = twitchSyncSettings();
    if (!settings.enabled || state.twitchSync.running) return;
    const threshold = reason === "startup" ? settings.onStartupIfOlderThanHours : settings.intervalHours;
    if (reason === "startup" && !settings.onStartup) return;
    if (ageHours(settings.lastAt) < threshold) return;

    runTwitchVipModSync({ source: `auto_${reason || "timer"}` })
      .catch(err => console.warn(`[${MODULE_NAME}] Twitch sync failed: ${err.message || String(err)}`));
  }

  function startTwitchSyncTimer() {
    if (state.twitchSync.timerStarted) return;
    state.twitchSync.timerStarted = true;
    setTimeout(() => maybeStartTwitchAutoSync("startup"), 5000);
    setInterval(() => {
      state.twitchSync.lastAutoCheckAt = nowIso();
      maybeStartTwitchAutoSync("timer");
    }, 60 * 60 * 1000);
  }

  function addUnique(list, value) {
    const clean = String(value || "").trim().toLowerCase();
    if (!clean) return;
    if (!list.includes(clean)) list.push(clean);
  }

  function finalizeVipSoundCandidate(user) {
    const isMod = !!(user.twitch && user.twitch.isMod);
    const isVip = !!(user.twitch && user.twitch.isVip);
    const isBroadcaster = !!(user.twitch && user.twitch.isBroadcaster);
    const primaryRole = isMod || isBroadcaster ? "mod" : (isVip ? "vip" : "");

    user.roleTypes = primaryRole ? [primaryRole] : [];
    user.soundTypes = primaryRole ? [primaryRole === "mod" ? "mod" : "vip"] : [];
    user.twitchRoles = user.roleTypes.slice();

    user.twitch = {
      ...(user.twitch || {}),
      isVip,
      isMod,
      isBroadcaster,
      allowed: !!primaryRole,
      primaryRole,
      statusLabel: isMod || isBroadcaster ? "Twitch Mod" : (isVip ? "Twitch VIP" : "nicht berechtigt")
    };

    user.history = {
      ...(user.history || {}),
      soundTypes: Array.isArray(user.history?.soundTypes) ? user.history.soundTypes : [],
      sources: Array.isArray(user.history?.sources) ? user.history.sources : [],
      hasUsage: Array.isArray(user.history?.soundTypes) && user.history.soundTypes.length > 0
    };

    user.local = {
      ...(user.local || {}),
      roles: Array.isArray(user.local?.roles) ? user.local.roles : [],
      ignoredForPermission: true
    };

    user.permissionSource = primaryRole ? "twitch_cache" : "none";
    return user;
  }

  function addVipSoundCandidate(map, raw = {}) {
    const login = normalizeLogin(raw.login || raw.user_login || raw.target_login || raw.actor_login || "");
    const displayName = cleanDisplayName(raw.displayName || raw.display_name || raw.user_display_name || raw.target_display_name || raw.actor_display_name || login);
    if (!login && !displayName) return;

    const key = login || normalizeLogin(displayName);
    if (!key) return;

    const existing = map.get(key) || {
      login: key,
      displayName: displayName || key,
      roleTypes: [],
      soundTypes: [],
      sources: [],
      twitchRoles: [],
      localRoles: [],
      historySoundTypes: [],
      twitch: {
        isVip: false,
        isMod: false,
        isBroadcaster: false,
        allowed: false,
        primaryRole: "",
        statusLabel: "nicht berechtigt"
      },
      local: {
        roles: [],
        ignoredForPermission: true
      },
      history: {
        soundTypes: [],
        sources: [],
        hasUsage: false
      },
      permissionSource: "none"
    };

    if (displayName && (!existing.displayName || existing.displayName === existing.login)) existing.displayName = displayName;

    const source = String(raw.source || "").trim();
    if (source && !existing.sources.includes(source)) existing.sources.push(source);

    const rawRole = raw.roleType ?? raw.role_type ?? raw.role;
    const roleType = rawRole === undefined || rawRole === null || String(rawRole).trim() === ""
      ? ""
      : normalizeRoleType(rawRole);

    const rawSound = raw.soundType ?? raw.sound_type;
    const soundType = rawSound === undefined || rawSound === null || String(rawSound).trim() === ""
      ? (roleType === "mod" || roleType === "crew" ? "mod" : (roleType === "vip" ? "vip" : ""))
      : normalizeSoundType(rawSound);

    if (source === "twitch_sync") {
      if (roleType === "vip") existing.twitch.isVip = true;
      if (roleType === "mod") existing.twitch.isMod = true;
      if (roleType === "crew") existing.twitch.isBroadcaster = true;
    } else if (source === "role_override") {
      if (roleType) {
        addUnique(existing.localRoles, roleType);
        addUnique(existing.local.roles, roleType);
      }
    } else if (source === "daily_usage" || source === "events") {
      if (soundType) {
        addUnique(existing.historySoundTypes, soundType);
        addUnique(existing.history.soundTypes, soundType);
      }
      addUnique(existing.history.sources, source);
    }

    existing.localRoles.sort();
    existing.historySoundTypes.sort();
    existing.local.roles.sort();
    existing.history.soundTypes.sort();
    existing.history.sources.sort();

    map.set(key, finalizeVipSoundCandidate(existing));
  }

  function listVipSoundUsers(raw = {}) {
    const includeSoundInfo = String(raw.includeSoundInfo ?? "true").trim().toLowerCase() !== "false";
    const limit = Math.max(1, Math.min(1000, intOrDefault(raw.limit, 300)));
    const map = new Map();

    try {
      for (const row of listCachedTwitchUsers(limit)) {
        if (row.isMod || row.isBroadcaster) {
          addVipSoundCandidate(map, {
            login: row.login,
            displayName: row.displayName,
            roleType: "mod",
            source: "twitch_sync"
          });
        } else if (row.isVip) {
          addVipSoundCandidate(map, {
            login: row.login,
            displayName: row.displayName,
            roleType: "vip",
            source: "twitch_sync"
          });
        }
      }
    } catch (_) {}

    // Lokale Rollen-Overrides werden nicht mehr als VIP-Sound-Berechtigung gewertet.
    // Sie bleiben in der Datenbank fuer Alt-/Diagnosezwecke, werden hier aber nicht als eigene Kandidaten aufgenommen.

    try {
      const rows = database.all(`
        SELECT user_login, user_display_name, sound_type, MAX(triggered_at) AS last_seen_at
        FROM vip_sound_daily_usage
        GROUP BY user_login, user_display_name, sound_type
        ORDER BY last_seen_at DESC
        LIMIT :limit
      `, { limit });

      for (const row of rows) {
        const login = normalizeLogin(row.user_login);
        if (!map.has(login)) continue;
        addVipSoundCandidate(map, {
          login: row.user_login,
          displayName: row.user_display_name,
          soundType: row.sound_type,
          source: "daily_usage"
        });
      }
    } catch (_) {}

    try {
      const rows = database.all(`
        SELECT user_login, user_display_name, sound_type, MAX(created_at) AS last_seen_at
        FROM vip_sound_events
        WHERE user_login <> ''
        GROUP BY user_login, user_display_name, sound_type
        ORDER BY last_seen_at DESC
        LIMIT :limit
      `, { limit });

      for (const row of rows) {
        const login = normalizeLogin(row.user_login);
        if (!map.has(login)) continue;
        addVipSoundCandidate(map, {
          login: row.user_login,
          displayName: row.user_display_name,
          soundType: row.sound_type,
          source: "events"
        });
      }
    } catch (_) {}

    const rows = Array.from(map.values())
      .sort((a, b) => String(a.displayName || a.login).localeCompare(String(b.displayName || b.login), "de", { sensitivity: "base" }))
      .slice(0, limit)
      .map(user => {
        const sound = resolveVipSoundFile(user);
        const info = includeSoundInfo ? vipSoundDurationInfo(sound) : { durationMs: 0, durationOk: false, durationError: "", sizeBytes: 0 };
        return {
          ...user,
          sound: publicVipSoundInfo(sound, info)
        };
      });

    return {
      tableSources: [VIP_TWITCH_USERS_TABLE, VIP_DAILY_USAGE_TABLE, VIP_EVENTS_TABLE],
      ignoredSources: [VIP_ROLE_OVERRIDES_TABLE],
      count: rows.length,
      rows,
      settings: {
        soundBaseDir: getVipSoundBaseDir(),
        fileNameMode: String(getVipSetting("fileNameMode", "displayName") || "displayName"),
        fileExtension: normalizeFileExtension(getVipSetting("fileExtension", ".mp3")),
        maxSoundUploadBytes: Number(getVipSetting("maxSoundUploadBytes", 15728640)) || 15728640
      },
      twitchSync: twitchSyncStatus()
    };
  }

  async function saveUploadedVipSound(raw = {}, file) {
    if (!file) throw new Error("missing_file");

    const user = await resolveUploadTargetUser(raw);
    const uploadExt = path.extname(String(file.originalname || "")).toLowerCase();
    if (!media.extensionAllowed(file.originalname || "", media.DEFAULT_ALLOWED_EXTENSIONS)) {
      throw new Error(`extension_not_allowed:${uploadExt || "none"}`);
    }

    const sound = resolveVipSoundFile(user);
    const expectedExt = String(sound.fileExtension || ".mp3").toLowerCase();
    if (uploadExt !== expectedExt) {
      throw new Error(`extension_mismatch:expected_${expectedExt}_got_${uploadExt || "none"}`);
    }

    const targetPath = ensurePathInsideBase(sound.fullPath, sound.baseDir);
    const overwrite = boolish(raw.overwrite);
    const existedBefore = fs.existsSync(targetPath);
    if (existedBefore && !overwrite) {
      throw new Error("sound_file_exists");
    }

    core.ensureDir(sound.baseDir);
    fs.writeFileSync(targetPath, file.buffer);

    const duration = media.readAudioDurationMs(targetPath, { cache: false });
    const savedSound = resolveVipSoundFile(user);

    return {
      ok: true,
      module: MODULE_NAME,
      uploaded: true,
      user,
      sound: publicVipSoundInfo(savedSound, {
        durationMs: duration.durationMs || 0,
        durationOk: !!duration.ok,
        durationError: duration.error || "",
        sizeBytes: Number(file.size || 0),
        originalName: file.originalname || "",
        overwritten: existedBefore
      }),
      settings: {
        soundBaseDir: getVipSoundBaseDir(),
        fileNameMode: String(getVipSetting("fileNameMode", "displayName") || "displayName"),
        fileExtension: normalizeFileExtension(getVipSetting("fileExtension", ".mp3")),
        maxSoundUploadBytes: Number(getVipSetting("maxSoundUploadBytes", 15728640)) || 15728640
      },
      updatedAt: nowIso()
    };
  }

  async function queueVipSoundInSoundSystem(user, soundType, context, requestId, source) {
    const sound = resolveVipSoundFile(user);

    if (!sound.exists) {
      return {
        ok: false,
        reason: "sound_missing",
        sound,
        error: `VIP sound file missing: ${sound.fullPath}`
      };
    }

    const category = soundType === "mod" ? "crew" : "vip";
    const overlayContext = {
      ...context,
      displayName: user.displayName || user.login || "",
      login: user.login || "",
      targetDisplayName: user.displayName || user.login || "",
      targetLogin: user.login || "",
      soundType
    };
    const overlayTitle = buildOverlayTitle(soundType, overlayContext);
    const overlayText = buildOverlayText(soundType, overlayContext);

    const payload = {
      file: sound.relativeFile,
      label: `${overlayTitle} - ${user.displayName || user.login}`,
      category,
      priority: soundType === "mod" ? 60 : 60,
      target: normalizeSoundSystemTarget(getVipSetting("soundSystemTarget", "both"), "both"),
      outputTarget: "device",
      volume: Math.max(0, Math.min(100, Math.round(Number(getVipSetting("soundSystemVolume", 80)) || 80))),
      queueIfBusy: true,
      dropIfBusy: false,
      parallelAllowed: false,
      source: source || MODULE_NAME,
      requestedBy: user.login || "",
      meta: {
        module: MODULE_NAME,
        requestId,
        usageDate: context.date,
        soundType,
        login: user.login || "",
        displayName: user.displayName || user.login || "",
        soundFile: sound.relativeFile
      },
      visual: {
        module: MODULE_NAME,
        type: soundType,
        requestId,
        title: overlayTitle,
        text: overlayText,
        displayName: user.displayName || user.login || "",
        login: user.login || "",
        avatarUrl: user.avatarUrl || ""
      }
    };

    const response = await httpPostJson(VIP_SOUND_SYSTEM_PLAY_URL, payload);
    const result = response && response.result ? response.result : {};
    const accepted = !!response.ok && !result.dropped && (
      result.started === true ||
      result.queued === true ||
      result.parallel === true ||
      !!response.item
    );

    return {
      ok: accepted,
      reason: accepted ? "sound_accepted" : "sound_rejected",
      sound,
      payload,
      response,
      result,
      error: accepted ? "" : (response && (response.error || response.message)) || "sound_system_rejected"
    };
  }

  async function fetchUserInfo(loginOrDisplayName) {
    const key = (loginOrDisplayName || "").toString().trim().toLowerCase();
    if (!key) return null;

    if (userInfoCache.has(key)) {
      return userInfoCache.get(key);
    }

    const url = userInfoBaseUrl + encodeURIComponent(key);

    try {
      const json = await httpGetJson(url);
      const first = json && json.data && json.data[0] ? json.data[0] : null;
      if (!first) {
        userInfoCache.set(key, null);
        return null;
      }

      const info = {
        login: (first.login || "").toString().trim(),
        displayName: (first.display_name || first.login || key).toString().trim(),
        avatarUrl: (first.profile_image_url || "").toString().trim()
      };

      if (info.login) userInfoCache.set(info.login.toLowerCase(), info);
      if (info.displayName) userInfoCache.set(info.displayName.toLowerCase(), info);
      userInfoCache.set(key, info);

      return info;
    } catch (err) {
      console.warn(`[${MODULE_NAME}] userinfo lookup failed for "${key}": ${err.message}`);
      userInfoCache.set(key, null);
      return null;
    }
  }

  async function resolveCommandUser(raw) {
    const loginRaw = normalizeLogin(raw.actorLogin || raw.login || raw.userLogin || raw.userName || raw.username || raw.user || "");
    const displayRaw = cleanDisplayName(raw.actorDisplayName || raw.displayName || raw.userDisplayName || raw.display || raw.user || loginRaw || "");
    const lookupKey = loginRaw || displayRaw;
    const info = await fetchUserInfo(lookupKey);

    const login = normalizeLogin((info && info.login) || loginRaw || displayRaw);
    const displayName = cleanDisplayName(displayRaw || (info && info.displayName) || login);
    const avatarUrl = String((info && info.avatarUrl) || raw.avatarUrl || "").trim();

    return {
      login,
      displayName: displayName || login,
      avatarUrl
    };
  }

  async function resolveCommandTargetUser(raw, actor) {
    if (!hasExplicitTarget(raw)) {
      return { explicit: false, user: actor };
    }

    const targetRaw = normalizeLogin(
      raw.targetLogin ||
      raw.targetUserLogin ||
      raw.targetUserName ||
      raw.targetUsername ||
      raw.target ||
      raw.input0 ||
      raw.input1 ||
      ""
    );

    const targetDisplayRaw = cleanDisplayName(
      raw.targetDisplayName ||
      raw.targetUserDisplayName ||
      raw.targetDisplay ||
      raw.target ||
      raw.input0 ||
      raw.input1 ||
      targetRaw ||
      ""
    );

    const lookupKey = targetRaw || targetDisplayRaw;
    const info = await fetchUserInfo(lookupKey);

    const login = normalizeLogin((info && info.login) || targetRaw || targetDisplayRaw);
    const displayName = cleanDisplayName(targetDisplayRaw || (info && info.displayName) || login);
    const avatarUrl = String((info && info.avatarUrl) || raw.targetAvatarUrl || "").trim();

    return {
      explicit: true,
      user: {
        login,
        displayName: displayName || login,
        avatarUrl
      }
    };
  }


  function boolToInt(value) {
    return value ? 1 : 0;
  }

  function eventTypeFromResult(extra = {}, eventKeyValue = "") {
    if (extra.duplicate) return "duplicate";
    if (extra.override && extra.accepted) return "override_accepted";
    if (extra.override && extra.overrideAllowed === false) return "override_denied";
    if (extra.accepted) return "accepted";
    if (extra.systemDisabled) return "system_disabled";
    if (extra.error || extra.soundError) return String(extra.soundError || extra.error || "error");
    if (eventKeyValue === "sound_missing") return "sound_missing";
    return eventKeyValue || "unknown";
  }

  function cleanVipBusAction(value, fallback = "status") {
    const text = String(value || "").trim().toLowerCase();
    const clean = text.replace(/[^a-z0-9_.:-]+/g, "_").replace(/^_+|_+$/g, "");
    return clean || fallback;
  }

  function vipBusActionForResult(eventKeyValue = "", extra = {}) {
    const key = String(eventKeyValue || "").trim().toLowerCase();

    if (extra.accepted && extra.override) return "override_accepted";
    if (extra.accepted) return "accepted";
    if (extra.duplicate) return "duplicate";
    if (extra.override && extra.overrideAllowed === false) return "override_denied";
    if (extra.twitchOnlyDenied || key === "not_twitch_vip_or_mod") return "denied";
    if (extra.systemDisabled || key === "system_disabled") return "system_disabled";
    if (key === "sound_missing") return "sound_missing";
    if (extra.error || extra.soundError || key === "error_generic") return "error";

    return cleanVipBusAction(eventTypeFromResult(extra, eventKeyValue), "status");
  }

  function buildVipBusStatusPayload(eventKeyValue, context = {}, extra = {}, response = {}) {
    const eventType = eventTypeFromResult(extra, eventKeyValue);
    const action = vipBusActionForResult(eventKeyValue, extra);
    const soundType = normalizeSoundType(extra.soundType || context.soundType || "vip");

    return {
      module: MODULE_NAME,
      channel: state.eventBus.channel,
      action,
      eventKey: String(eventKeyValue || ""),
      eventType,
      accepted: !!extra.accepted,
      duplicate: !!extra.duplicate,
      override: !!extra.override,
      overrideAllowed: !!extra.overrideAllowed,
      dailyUsageWritten: !!extra.dailyUsageWritten,
      soundSystemQueued: !!extra.soundSystemQueued,
      soundSystemStarted: !!extra.soundSystemStarted,
      testOnly: !!extra.testOnly,
      smokeTest: !!extra.smokeTest,
      soundType,
      usageDate: String(extra.usageDate || context.date || ""),
      actor: {
        login: normalizeLogin(extra.actorLogin || context.actorLogin || ""),
        displayName: cleanDisplayName(extra.actorDisplayName || context.actorDisplayName || "")
      },
      target: {
        login: normalizeLogin(extra.targetLogin || context.targetLogin || extra.userLogin || context.login || ""),
        displayName: cleanDisplayName(extra.targetDisplayName || context.targetDisplayName || extra.userDisplayName || context.displayName || "")
      },
      user: {
        login: normalizeLogin(extra.userLogin || extra.targetLogin || context.targetLogin || context.login || ""),
        displayName: cleanDisplayName(extra.userDisplayName || extra.targetDisplayName || context.targetDisplayName || context.displayName || ""),
        avatarUrl: String(extra.avatarUrl || context.avatarUrl || "").trim()
      },
      trigger: String(extra.trigger || context.trigger || ""),
      source: String(extra.source || ""),
      requestId: String(extra.requestId || ""),
      soundSystemRequestId: String(extra.soundSystemRequestId || ""),
      soundSystemQueuePosition: Number(extra.soundSystemQueuePosition || 0),
      soundFile: String(extra.soundFile || ""),
      soundPath: String(extra.soundPath || ""),
      errorCode: String(extra.errorCode || extra.error || extra.soundError || ""),
      messageText: messages.sanitizeChatMessage(String(response.message || response.text || ""), 500),
      createdAt: nowIso()
    };
  }

  function trimRecentVipSoundBusCommands() {
    if (!Array.isArray(state.soundBusCommand.recentCommands)) state.soundBusCommand.recentCommands = [];
    state.soundBusCommand.recentCommands = state.soundBusCommand.recentCommands.slice(0, 20);
  }

  function publicVipSoundBusCommandStatus(prefix = "") {
    const busAvailable = !!(communicationBus && typeof communicationBus.getBus === "function");
    return {
      ok: true,
      module: MODULE_NAME,
      version: state.version,
      feature: "vip_sound_to_sound_bus_command_dry_run_check",
      capability: state.soundBusCommand.capability,
      statusApiVersion: "1.0.0",
      mode: state.soundBusCommand.mode,
      shadowOnly: true,
      dryRunOnly: true,
      commandLayerReady: true,
      commandConsumerEnabled: !!state.soundBusCommand.commandConsumerEnabled,
      commandConsumerMode: state.soundBusCommand.commandConsumerMode || "dry_run",
      soundDryRunUrl: state.soundBusCommand.soundDryRunUrl || VIP_SOUND_COMMAND_DRY_RUN_URL,
      productiveVipFlow: "legacy_sound_system_api",
      legacyVipFlow: "unchanged",
      legacySoundSystemFlow: "unchanged",
      deliveryClassification: "module_scoped_shadow_command_dry_run_stream",
      enabled: !!state.soundBusCommand.enabled,
      channel: state.soundBusCommand.channel,
      action: state.soundBusCommand.action,
      target: {
        type: state.soundBusCommand.targetType || "module",
        id: state.soundBusCommand.targetId || "sound_system",
        module: state.soundBusCommand.targetModule || "sound_system",
        capability: state.soundBusCommand.targetCapability || "sound.command_input"
      },
      communicationBusAvailable: busAvailable,
      routes: {
        status: prefix ? `${prefix}/eventbus/sound-command/status` : "",
        test: prefix ? `${prefix}/eventbus/sound-command/test` : "",
        dryRun: prefix ? `${prefix}/eventbus/sound-command/dry-run` : "",
        reset: prefix ? `${prefix}/eventbus/sound-command/reset` : ""
      },
      protection: {
        testOnly: true,
        shadowOnly: true,
        vipProductiveFlowTouched: false,
        soundSystemTouched: false,
        soundSystemDryRunTouched: true,
        queueTouched: false,
        audioTouched: false,
        overlayTouched: false,
        dailyUsageTouched: false,
        allowQueueTouch: false,
        allowAudioTouch: false
      },
      stats: {
        emitted: Number(state.soundBusCommand.emitted || 0),
        skipped: Number(state.soundBusCommand.skipped || 0),
        errors: Number(state.soundBusCommand.errors || 0),
        dryRunChecks: Number(state.soundBusCommand.dryRunChecks || 0),
        dryRunOk: Number(state.soundBusCommand.dryRunOk || 0),
        dryRunFailed: Number(state.soundBusCommand.dryRunFailed || 0),
        lastAction: state.soundBusCommand.lastAction || "",
        lastEventId: state.soundBusCommand.lastEventId || "",
        lastRequestId: state.soundBusCommand.lastRequestId || "",
        lastVipRequestId: state.soundBusCommand.lastVipRequestId || "",
        lastSoundId: state.soundBusCommand.lastSoundId || "",
        lastResult: state.soundBusCommand.lastResult || null,
        lastDryRun: state.soundBusCommand.lastDryRun || null,
        lastError: state.soundBusCommand.lastError || "",
        lastAt: state.soundBusCommand.lastAt || ""
      },
      recentCommands: Array.isArray(state.soundBusCommand.recentCommands) ? state.soundBusCommand.recentCommands : [],
      notes: [
        "VIP still uses the legacy /api/sound/play productive path.",
        "This layer mirrors VIP sound wishes as test-only sound.command events for diagnostics.",
        "The dry-run route sends the same payload to the Sound-System dry-run consumer for validation only.",
        "It does not start audio and does not touch the Sound-System queue.",
        "If the Communication Bus is unavailable, VIP continues through the existing Sound-System flow."
      ],
      updatedAt: nowIso()
    };
  }

  function resetVipSoundBusCommandStatus(prefix = "") {
    state.soundBusCommand.emitted = 0;
    state.soundBusCommand.skipped = 0;
    state.soundBusCommand.errors = 0;
    state.soundBusCommand.dryRunChecks = 0;
    state.soundBusCommand.dryRunOk = 0;
    state.soundBusCommand.dryRunFailed = 0;
    state.soundBusCommand.lastAction = "";
    state.soundBusCommand.lastEventId = "";
    state.soundBusCommand.lastRequestId = "";
    state.soundBusCommand.lastVipRequestId = "";
    state.soundBusCommand.lastSoundId = "";
    state.soundBusCommand.lastResult = null;
    state.soundBusCommand.lastDryRun = null;
    state.soundBusCommand.lastError = "";
    state.soundBusCommand.lastAt = nowIso();
    state.soundBusCommand.recentCommands = [];
    return publicVipSoundBusCommandStatus(prefix);
  }

  function buildVipSoundBusCommandPayload(raw = {}, soundQueue = null, context = {}) {
    const data = raw && typeof raw === "object" ? raw : {};
    const queuePayload = soundQueue && soundQueue.payload && typeof soundQueue.payload === "object" ? soundQueue.payload : {};
    const sound = soundQueue && soundQueue.sound && typeof soundQueue.sound === "object" ? soundQueue.sound : {};
    const vipRequestId = String(data.vipRequestId || data.requestId || queuePayload.meta?.requestId || context.requestId || makeRequestId()).trim();
    const commandRequestId = String(data.commandRequestId || `vip_cmd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`).trim();
    const soundId = String(data.soundId || queuePayload.sound || queuePayload.file || sound.relativeFile || "vip_sound_request").trim();
    const soundType = normalizeSoundType(data.soundType || queuePayload.meta?.soundType || context.soundType || "vip");
    const targetLogin = normalizeLogin(data.targetLogin || queuePayload.meta?.login || context.targetLogin || context.login || "");
    const targetDisplayName = cleanDisplayName(data.targetDisplayName || queuePayload.meta?.displayName || context.targetDisplayName || context.displayName || targetLogin || "");

    return {
      testOnly: true,
      shadowOnly: true,
      command: "sound.play.request",
      requestId: commandRequestId,
      vipRequestId,
      soundId,
      file: String(data.file || queuePayload.file || sound.relativeFile || ""),
      label: String(data.label || queuePayload.label || `VIP Sound - ${targetDisplayName || targetLogin || soundId}`),
      category: String(data.category || queuePayload.category || (soundType === "mod" ? "crew" : "vip")),
      target: String(data.target || queuePayload.target || normalizeSoundSystemTarget(getVipSetting("soundSystemTarget", "both"), "both")),
      outputTarget: String(data.outputTarget || queuePayload.outputTarget || "device"),
      volume: Math.max(0, Math.min(100, Math.round(Number(data.volume ?? queuePayload.volume ?? getVipSetting("soundSystemVolume", 80)) || 80))),
      priority: Number(data.priority ?? queuePayload.priority ?? 60) || 60,
      queueIfBusy: true,
      dropIfBusy: false,
      parallelAllowed: false,
      source: String(data.source || "vip_sound_overlay_shadow_command"),
      requestedBy: String(data.requestedBy || queuePayload.requestedBy || targetLogin || ""),
      reason: String(data.reason || "vip_shadow_command_test"),
      message: String(data.message || "VIP shadow command test only"),
      meta: {
        module: MODULE_NAME,
        vipRequestId,
        usageDate: String(data.usageDate || context.date || queuePayload.meta?.usageDate || ""),
        soundType,
        login: targetLogin,
        displayName: targetDisplayName,
        soundFile: String(data.soundFile || queuePayload.meta?.soundFile || sound.relativeFile || ""),
        productiveFlow: "legacy_sound_system_api",
        shadowOnly: true
      },
      visual: {
        module: MODULE_NAME,
        type: soundType,
        requestId: vipRequestId,
        title: String(data.title || queuePayload.visual?.title || buildOverlayTitle(soundType, { displayName: targetDisplayName, login: targetLogin, soundType })),
        text: String(data.text || queuePayload.visual?.text || buildOverlayText(soundType, { displayName: targetDisplayName, login: targetLogin, soundType })),
        displayName: targetDisplayName,
        login: targetLogin,
        avatarUrl: String(data.avatarUrl || queuePayload.visual?.avatarUrl || context.avatarUrl || "")
      },
      protection: {
        testOnly: true,
        shadowOnly: true,
        vipProductiveFlowTouched: false,
        soundSystemTouched: false,
        soundSystemDryRunTouched: true,
        queueTouched: false,
        audioTouched: false,
        overlayTouched: false,
        dailyUsageTouched: false
      },
      emittedAt: nowIso()
    };
  }

  function emitVipSoundBusCommandTest(raw = {}, soundQueue = null, context = {}, options = {}) {
    const payload = buildVipSoundBusCommandPayload(raw, soundQueue, context);

    if (!state.soundBusCommand.enabled) {
      state.soundBusCommand.skipped += 1;
      state.soundBusCommand.lastAction = state.soundBusCommand.action;
      state.soundBusCommand.lastRequestId = payload.requestId;
      state.soundBusCommand.lastVipRequestId = payload.vipRequestId;
      state.soundBusCommand.lastSoundId = payload.soundId;
      state.soundBusCommand.lastError = "disabled";
      state.soundBusCommand.lastAt = nowIso();
      return { ok: false, skipped: true, reason: "disabled", payload };
    }

    if (!communicationBus || typeof communicationBus.getBus !== "function") {
      state.soundBusCommand.skipped += 1;
      state.soundBusCommand.lastAction = state.soundBusCommand.action;
      state.soundBusCommand.lastRequestId = payload.requestId;
      state.soundBusCommand.lastVipRequestId = payload.vipRequestId;
      state.soundBusCommand.lastSoundId = payload.soundId;
      state.soundBusCommand.lastError = "communication_bus_getBus_unavailable";
      state.soundBusCommand.lastAt = nowIso();
      return { ok: false, skipped: true, reason: "communication_bus_getBus_unavailable", payload };
    }

    try {
      const currentBus = communicationBus.getBus();
      const result = currentBus.emit({
        type: "event",
        channel: state.soundBusCommand.channel,
        action: state.soundBusCommand.action,
        source: {
          type: "module",
          id: MODULE_NAME,
          module: MODULE_NAME
        },
        target: {
          type: state.soundBusCommand.targetType || "module",
          id: state.soundBusCommand.targetId || "sound_system",
          module: state.soundBusCommand.targetModule || "sound_system",
          capability: state.soundBusCommand.targetCapability || "sound.command_input"
        },
        payload,
        meta: {
          requireAck: false,
          replayable: false,
          ttlMs: 30000,
          testOnly: true,
          shadowOnly: true,
          command: payload.command,
          commandLayer: "vip_to_sound_shadow_test",
          productiveFlow: "legacy_sound_system_api",
          vipRequestId: payload.vipRequestId,
          requestId: payload.requestId,
          soundId: payload.soundId,
          soundSystemTouched: false,
          queueTouched: false,
          audioTouched: false,
          overlayTouched: false,
          dailyUsageTouched: false
        }
      });

      state.soundBusCommand.emitted += result && result.ok ? 1 : 0;
      state.soundBusCommand.errors += result && result.ok ? 0 : 1;
      state.soundBusCommand.lastAction = state.soundBusCommand.action;
      state.soundBusCommand.lastEventId = result && result.eventId ? result.eventId : "";
      state.soundBusCommand.lastRequestId = payload.requestId;
      state.soundBusCommand.lastVipRequestId = payload.vipRequestId;
      state.soundBusCommand.lastSoundId = payload.soundId;
      state.soundBusCommand.lastResult = result ? {
        ok: result.ok === true,
        eventId: result.eventId || "",
        deliveredCount: Number(result.deliveredCount || 0),
        deliveredTo: Array.isArray(result.deliveredTo) ? result.deliveredTo : []
      } : null;
      state.soundBusCommand.lastError = result && result.ok ? "" : "bus_emit_failed";
      state.soundBusCommand.lastAt = nowIso();
      state.soundBusCommand.recentCommands.unshift({
        at: state.soundBusCommand.lastAt,
        eventId: state.soundBusCommand.lastEventId,
        action: state.soundBusCommand.action,
        command: payload.command,
        requestId: payload.requestId,
        vipRequestId: payload.vipRequestId,
        soundId: payload.soundId,
        file: payload.file,
        requestedBy: payload.requestedBy,
        source: payload.source,
        shadowOnly: true,
        testOnly: true,
        deliveredCount: state.soundBusCommand.lastResult ? state.soundBusCommand.lastResult.deliveredCount : 0,
        deliveredTo: state.soundBusCommand.lastResult ? state.soundBusCommand.lastResult.deliveredTo : []
      });
      trimRecentVipSoundBusCommands();

      return {
        ...(result || { ok: false, error: "empty_bus_result" }),
        payload,
        shadowOnly: true,
        testOnly: true,
        soundSystemTouched: false,
        soundSystemDryRunTouched: true,
        queueTouched: false,
        audioTouched: false
      };
    } catch (err) {
      state.soundBusCommand.errors += 1;
      state.soundBusCommand.lastAction = state.soundBusCommand.action;
      state.soundBusCommand.lastRequestId = payload.requestId;
      state.soundBusCommand.lastVipRequestId = payload.vipRequestId;
      state.soundBusCommand.lastSoundId = payload.soundId;
      state.soundBusCommand.lastResult = null;
      state.soundBusCommand.lastError = err && err.message ? err.message : String(err);
      state.soundBusCommand.lastAt = nowIso();
      console.warn(`[${MODULE_NAME}] VIP Sound-Bus command test emit failed: ${state.soundBusCommand.lastError}`);
      return { ok: false, error: state.soundBusCommand.lastError, payload };
    }
  }

  async function dryRunVipSoundBusCommand(raw = {}, soundQueue = null, context = {}) {
    const emitResult = emitVipSoundBusCommandTest(raw, soundQueue, context, { dryRun: true });
    const payload = emitResult && emitResult.payload ? emitResult.payload : buildVipSoundBusCommandPayload(raw, soundQueue, context);
    const startedAt = nowIso();

    state.soundBusCommand.dryRunChecks += 1;
    state.soundBusCommand.lastAction = "play.request.vip_dry_run";
    state.soundBusCommand.lastRequestId = payload.requestId || "";
    state.soundBusCommand.lastVipRequestId = payload.vipRequestId || "";
    state.soundBusCommand.lastSoundId = payload.soundId || "";
    state.soundBusCommand.lastAt = startedAt;

    try {
      const dryRunPayload = {
        ...payload,
        dryRunOnly: true,
        testOnly: true,
        shadowOnly: true,
        source: "vip_sound_overlay_to_sound_dry_run",
        reason: "vip_shadow_command_sound_dry_run",
        protection: {
          ...(payload.protection || {}),
          dryRunOnly: true,
          soundSystemDryRunTouched: true,
          soundSystemTouched: false,
          queueTouched: false,
          audioTouched: false,
          overlayTouched: false,
          dailyUsageTouched: false
        }
      };

      const dryRunResult = await httpPostJson(state.soundBusCommand.soundDryRunUrl || VIP_SOUND_COMMAND_DRY_RUN_URL, dryRunPayload);
      const accepted = !!(dryRunResult && dryRunResult.accepted);
      const wouldPlay = !!(dryRunResult && dryRunResult.result && dryRunResult.result.wouldPlay);

      if (accepted && wouldPlay) state.soundBusCommand.dryRunOk += 1;
      else state.soundBusCommand.dryRunFailed += 1;

      state.soundBusCommand.lastDryRun = {
        ok: !!(dryRunResult && dryRunResult.ok),
        accepted,
        wouldPlay,
        wouldQueueOrStart: !!(dryRunResult && dryRunResult.result && dryRunResult.result.wouldQueueOrStart),
        soundSystemVersion: dryRunResult && dryRunResult.version ? dryRunResult.version : "",
        commandConsumerMode: dryRunResult && dryRunResult.commandConsumerMode ? dryRunResult.commandConsumerMode : "",
        normalizedSoundId: dryRunResult && dryRunResult.result && dryRunResult.result.normalizedItem ? dryRunResult.result.normalizedItem.soundId || "" : "",
        normalizedFile: dryRunResult && dryRunResult.result && dryRunResult.result.normalizedItem ? dryRunResult.result.normalizedItem.file || "" : "",
        message: dryRunResult && dryRunResult.result ? dryRunResult.result.message || "" : ""
      };
      state.soundBusCommand.lastResult = {
        bus: state.soundBusCommand.lastResult,
        dryRun: state.soundBusCommand.lastDryRun
      };
      state.soundBusCommand.lastError = accepted && wouldPlay ? "" : "sound_dry_run_rejected";
      state.soundBusCommand.lastAt = nowIso();

      state.soundBusCommand.recentCommands.unshift({
        at: state.soundBusCommand.lastAt,
        action: "play.request.vip_dry_run",
        command: payload.command,
        requestId: payload.requestId,
        vipRequestId: payload.vipRequestId,
        soundId: payload.soundId,
        requestedBy: payload.requestedBy,
        source: "vip_sound_overlay_to_sound_dry_run",
        shadowOnly: true,
        dryRunOnly: true,
        accepted,
        wouldPlay,
        queueTouched: false,
        audioTouched: false
      });
      trimRecentVipSoundBusCommands();

      return {
        ok: !!(dryRunResult && dryRunResult.ok),
        module: MODULE_NAME,
        version: state.version,
        feature: "vip_sound_to_sound_bus_command_dry_run_check",
        testOnly: true,
        shadowOnly: true,
        dryRunOnly: true,
        vipProductiveFlowTouched: false,
        soundSystemTouched: false,
        soundSystemDryRunTouched: true,
        queueTouched: false,
        audioTouched: false,
        overlayTouched: false,
        dailyUsageTouched: false,
        busEvent: emitResult,
        soundDryRun: dryRunResult,
        accepted,
        wouldPlay,
        updatedAt: state.soundBusCommand.lastAt
      };
    } catch (err) {
      state.soundBusCommand.dryRunFailed += 1;
      state.soundBusCommand.errors += 1;
      state.soundBusCommand.lastDryRun = null;
      state.soundBusCommand.lastResult = emitResult || null;
      state.soundBusCommand.lastError = err && err.message ? err.message : String(err);
      state.soundBusCommand.lastAt = nowIso();
      return {
        ok: false,
        module: MODULE_NAME,
        version: state.version,
        feature: "vip_sound_to_sound_bus_command_dry_run_check",
        testOnly: true,
        shadowOnly: true,
        dryRunOnly: true,
        error: state.soundBusCommand.lastError,
        busEvent: emitResult,
        soundSystemTouched: false,
        queueTouched: false,
        audioTouched: false,
        overlayTouched: false,
        dailyUsageTouched: false
      };
    }
  }

  function emitVipEventBusStatus(eventKeyValue, context = {}, extra = {}, response = {}) {
    if (!state.eventBus.enabled) {
      state.eventBus.skipped += 1;
      state.eventBus.lastError = "disabled";
      state.eventBus.lastAt = nowIso();
      return { ok: false, skipped: true, reason: "disabled" };
    }

    if (!communicationBus || typeof communicationBus.getBus !== "function") {
      state.eventBus.skipped += 1;
      state.eventBus.lastError = "communication_bus_getBus_unavailable";
      state.eventBus.lastAt = nowIso();
      return { ok: false, skipped: true, reason: "communication_bus_getBus_unavailable" };
    }

    const payload = buildVipBusStatusPayload(eventKeyValue, context, extra, response);

    try {
      const currentBus = communicationBus.getBus();
      const result = currentBus.emit({
        type: "event",
        channel: state.eventBus.channel,
        action: payload.action,
        source: {
          type: "module",
          id: MODULE_NAME,
          module: MODULE_NAME
        },
        target: {
          type: state.eventBus.targetType || "all",
          id: state.eventBus.targetId || "*",
          module: state.eventBus.targetModule || MODULE_NAME,
          capability: state.eventBus.targetCapability || ""
        },
        payload,
        meta: {
          requireAck: false,
          replayable: true,
          ttlMs: 60000,
          mirror: false,
          preview: false,
          productionTarget: false,
          statusEvent: true,
          soundSystemFlow: "unchanged",
          vipEventKey: payload.eventKey,
          vipEventType: payload.eventType,
          requestId: payload.requestId
        }
      });

      state.eventBus.emitted += result && result.ok ? 1 : 0;
      state.eventBus.errors += result && result.ok ? 0 : 1;
      state.eventBus.lastAction = payload.action;
      state.eventBus.lastEventId = result && result.eventId ? result.eventId : "";
      state.eventBus.lastEventType = payload.eventType;
      state.eventBus.lastEventKey = payload.eventKey;
      state.eventBus.lastRequestId = payload.requestId;
      state.eventBus.lastResult = result ? {
        ok: result.ok === true,
        eventId: result.eventId || "",
        deliveredCount: Number(result.deliveredCount || 0),
        deliveredTo: Array.isArray(result.deliveredTo) ? result.deliveredTo : []
      } : null;
      state.eventBus.lastError = result && result.ok ? "" : "bus_emit_failed";
      state.eventBus.lastAt = nowIso();
      return result || { ok: false, error: "empty_bus_result" };
    } catch (err) {
      state.eventBus.errors += 1;
      state.eventBus.lastAction = payload.action;
      state.eventBus.lastEventType = payload.eventType;
      state.eventBus.lastEventKey = payload.eventKey;
      state.eventBus.lastRequestId = payload.requestId;
      state.eventBus.lastResult = null;
      state.eventBus.lastError = err && err.message ? err.message : String(err);
      state.eventBus.lastAt = nowIso();
      console.warn(`[${MODULE_NAME}] EventBus status emit failed: ${state.eventBus.lastError}`);
      return { ok: false, error: state.eventBus.lastError };
    }
  }

  function recordVipSoundEvent(event = {}) {
    if (!state.db.initialized) return false;

    try {
      database.run(`
        INSERT INTO vip_sound_events
          (created_at, usage_date, event_key, event_type,
           actor_login, actor_display_name, target_login, target_display_name,
           user_login, user_display_name, sound_type, source, trigger,
           request_id, sound_system_request_id, sound_file, sound_path,
           accepted, duplicate, override, override_allowed, daily_usage_written,
           sound_system_queued, sound_system_started, error_code, message_text)
        VALUES
          (:createdAt, :usageDate, :eventKey, :eventType,
           :actorLogin, :actorDisplayName, :targetLogin, :targetDisplayName,
           :userLogin, :userDisplayName, :soundType, :source, :trigger,
           :requestId, :soundSystemRequestId, :soundFile, :soundPath,
           :accepted, :duplicate, :override, :overrideAllowed, :dailyUsageWritten,
           :soundSystemQueued, :soundSystemStarted, :errorCode, :messageText)
      `, {
        createdAt: event.createdAt || nowIso(),
        usageDate: String(event.usageDate || ""),
        eventKey: String(event.eventKey || event.messageKey || ""),
        eventType: String(event.eventType || eventTypeFromResult(event, event.eventKey || "")),
        actorLogin: normalizeLogin(event.actorLogin || ""),
        actorDisplayName: cleanDisplayName(event.actorDisplayName || ""),
        targetLogin: normalizeLogin(event.targetLogin || event.userLogin || ""),
        targetDisplayName: cleanDisplayName(event.targetDisplayName || event.userDisplayName || ""),
        userLogin: normalizeLogin(event.userLogin || event.targetLogin || ""),
        userDisplayName: cleanDisplayName(event.userDisplayName || event.targetDisplayName || ""),
        soundType: normalizeSoundType(event.soundType || "vip"),
        source: String(event.source || ""),
        trigger: String(event.trigger || ""),
        requestId: String(event.requestId || ""),
        soundSystemRequestId: String(event.soundSystemRequestId || ""),
        soundFile: String(event.soundFile || ""),
        soundPath: String(event.soundPath || ""),
        accepted: boolToInt(event.accepted),
        duplicate: boolToInt(event.duplicate),
        override: boolToInt(event.override),
        overrideAllowed: boolToInt(event.overrideAllowed),
        dailyUsageWritten: boolToInt(event.dailyUsageWritten),
        soundSystemQueued: boolToInt(event.soundSystemQueued),
        soundSystemStarted: boolToInt(event.soundSystemStarted),
        errorCode: String(event.errorCode || event.error || event.soundError || ""),
        messageText: messages.sanitizeChatMessage(String(event.messageText || event.message || ""), 500)
      });

      refreshDbStats();
      return true;
    } catch (err) {
      console.warn(`[${MODULE_NAME}] event log unavailable: ${err.message || String(err)}`);
      return false;
    }
  }

  async function finishVipCommand(eventKeyValue, context, extra = {}) {
    const response = await buildVipChatResponse(eventKeyValue, context, extra);

    recordVipSoundEvent({
      eventKey: eventKeyValue,
      eventType: eventTypeFromResult(extra, eventKeyValue),
      usageDate: extra.usageDate || context.date || "",
      actorLogin: extra.actorLogin || context.actorLogin || "",
      actorDisplayName: extra.actorDisplayName || context.actorDisplayName || "",
      targetLogin: extra.targetLogin || context.targetLogin || extra.userLogin || context.login || "",
      targetDisplayName: extra.targetDisplayName || context.targetDisplayName || extra.userDisplayName || context.displayName || "",
      userLogin: extra.userLogin || extra.targetLogin || context.targetLogin || context.login || "",
      userDisplayName: extra.userDisplayName || extra.targetDisplayName || context.targetDisplayName || context.displayName || "",
      soundType: extra.soundType || context.soundType || "vip",
      source: extra.source || "",
      trigger: extra.trigger || context.trigger || "",
      requestId: extra.requestId || "",
      soundSystemRequestId: extra.soundSystemRequestId || "",
      soundFile: extra.soundFile || "",
      soundPath: extra.soundPath || "",
      accepted: !!extra.accepted,
      duplicate: !!extra.duplicate,
      override: !!extra.override,
      overrideAllowed: !!extra.overrideAllowed,
      dailyUsageWritten: !!extra.dailyUsageWritten,
      soundSystemQueued: !!extra.soundSystemQueued,
      soundSystemStarted: !!extra.soundSystemStarted,
      errorCode: extra.error || extra.soundError || "",
      messageText: response.message || response.text || ""
    });

    const eventBusResult = emitVipEventBusStatus(eventKeyValue, context, extra, response);

    return {
      ...response,
      eventBus: {
        channel: state.eventBus.channel,
        action: vipBusActionForResult(eventKeyValue, extra),
        ok: !!(eventBusResult && eventBusResult.ok),
        skipped: !!(eventBusResult && eventBusResult.skipped),
        eventId: eventBusResult && eventBusResult.eventId ? eventBusResult.eventId : "",
        reason: eventBusResult && eventBusResult.reason ? eventBusResult.reason : "",
        error: eventBusResult && eventBusResult.error ? eventBusResult.error : ""
      },
      soundBusCommand: extra.soundBusCommand || null
    };
  }

  function buildVipEventFilters(raw = {}) {
    const data = raw && typeof raw === "object" ? raw : {};
    const usageDate = String(data.date || data.usageDate || "").trim();
    const login = normalizeLogin(data.login || data.userLogin || data.targetLogin || data.actorLogin || "");
    const soundTypeRaw = String(data.soundType || "").trim().toLowerCase();
    const soundType = soundTypeRaw ? normalizeSoundType(soundTypeRaw) : "";
    const eventType = String(data.eventType || data.type || "").trim().toLowerCase();
    const acceptedRaw = String(data.accepted ?? "").trim().toLowerCase();
    const where = [];
    const params = {};

    if (usageDate) {
      where.push("usage_date = :usageDate");
      params.usageDate = usageDate;
    }

    if (login) {
      where.push("(user_login = :login OR actor_login = :login OR target_login = :login)");
      params.login = login;
    }

    if (soundType) {
      where.push("sound_type = :soundType");
      params.soundType = soundType;
    }

    if (eventType) {
      where.push("event_type = :eventType");
      params.eventType = eventType;
    }

    if (acceptedRaw === "true" || acceptedRaw === "1" || acceptedRaw === "false" || acceptedRaw === "0") {
      where.push("accepted = :accepted");
      params.accepted = (acceptedRaw === "true" || acceptedRaw === "1") ? 1 : 0;
    }

    return {
      usageDate,
      login,
      soundType,
      eventType,
      accepted: acceptedRaw,
      whereSql: where.length ? `WHERE ${where.join(" AND ")}` : "",
      params
    };
  }

  function listVipEvents(raw = {}, limitValue) {
    const filters = buildVipEventFilters(raw);
    const limit = Math.max(1, Math.min(500, intOrDefault(limitValue, 100)));

    const rows = database.all(`
      SELECT id, created_at, usage_date, event_key, event_type,
             actor_login, actor_display_name, target_login, target_display_name,
             user_login, user_display_name, sound_type, source, trigger,
             request_id, sound_system_request_id, sound_file, sound_path,
             accepted, duplicate, override, override_allowed, daily_usage_written,
             sound_system_queued, sound_system_started, error_code, message_text
      FROM vip_sound_events
      ${filters.whereSql}
      ORDER BY created_at DESC, id DESC
      LIMIT :limit
    `, {
      ...filters.params,
      limit
    });

    return {
      filters: {
        usageDate: filters.usageDate,
        login: filters.login,
        soundType: filters.soundType,
        eventType: filters.eventType,
        accepted: filters.accepted
      },
      filtered: !!(filters.usageDate || filters.login || filters.soundType || filters.eventType || filters.accepted),
      limit,
      rows: Array.isArray(rows) ? rows : []
    };
  }

  function getVipStats(raw = {}) {
    const data = raw && typeof raw === "object" ? raw : {};
    const usageDate = String(data.date || data.usageDate || "").trim();
    const filters = buildVipEventFilters(usageDate ? { usageDate } : {});
    const params = filters.params;
    const whereSql = filters.whereSql;

    const totals = database.get(`
      SELECT
        COUNT(*) AS total_events,
        SUM(CASE WHEN accepted = 1 THEN 1 ELSE 0 END) AS accepted_events,
        SUM(CASE WHEN duplicate = 1 THEN 1 ELSE 0 END) AS duplicate_events,
        SUM(CASE WHEN override = 1 THEN 1 ELSE 0 END) AS override_events,
        SUM(CASE WHEN daily_usage_written = 1 THEN 1 ELSE 0 END) AS daily_usage_written_events,
        SUM(CASE WHEN error_code <> '' THEN 1 ELSE 0 END) AS error_events
      FROM vip_sound_events
      ${whereSql}
    `, params) || {};

    const bySoundType = database.all(`
      SELECT sound_type, COUNT(*) AS count
      FROM vip_sound_events
      ${whereSql}
      GROUP BY sound_type
      ORDER BY count DESC, sound_type ASC
    `, params);

    const topUsers = database.all(`
      SELECT user_login, user_display_name, COUNT(*) AS count
      FROM vip_sound_events
      ${whereSql}
      GROUP BY user_login, user_display_name
      ORDER BY count DESC, user_login ASC
      LIMIT 20
    `, params);

    const recent = database.all(`
      SELECT id, created_at, event_type, user_login, user_display_name, sound_type, accepted, duplicate, override, daily_usage_written, source
      FROM vip_sound_events
      ${whereSql}
      ORDER BY created_at DESC, id DESC
      LIMIT 10
    `, params);

    return {
      usageDate,
      filtered: !!usageDate,
      totals,
      bySoundType: Array.isArray(bySoundType) ? bySoundType : [],
      topUsers: Array.isArray(topUsers) ? topUsers : [],
      recent: Array.isArray(recent) ? recent : []
    };
  }


  function buildVipAdminSummary(raw = {}) {
    ensureVipSchema();
    refreshDbStats();

    const data = raw && typeof raw === "object" ? raw : {};
    const today = getBerlinDate();
    const usageDate = String(data.date || data.usageDate || today).trim();
    const eventLimit = Math.max(1, Math.min(100, intOrDefault(data.eventLimit || data.limit, 20)));
    const dailyLimit = Math.max(1, Math.min(200, intOrDefault(data.dailyLimit, 50)));

    const settings = listVipSettings();
    const roles = listVipRoleOverrides(true);
    const dailyUsage = listDailyUsageRows({ date: usageDate }, dailyLimit);
    const events = listVipEvents({ usageDate }, eventLimit);
    const stats = getVipStats({ usageDate });
    const allStats = getVipStats({});

    return {
      module: MODULE_NAME,
      version: state.version,
      usageDate,
      status: {
        phase: state.overlay.phase,
        visible: state.overlay.visible,
        isActive: state.isActive,
        queuedCount: state.queue.length,
        requestId: state.overlay.requestId || "",
        lastFinishedAt: state.lastFinishedAt,
        client: { ...state.client }
      },
      db: { ...state.db },
      settings: {
        count: settings.settings.length,
        rows: settings.settings,
        config: settings.config
      },
      roles,
      twitchSync: twitchSyncStatus(),
      dailyUsage: {
        ...dailyUsage,
        count: dailyUsage.rows.length
      },
      events: {
        ...events,
        count: events.rows.length
      },
      stats,
      allStats
    };
  }

  function resetVipAdminDaily(raw = {}) {
    const data = raw && typeof raw === "object" ? raw : {};
    const usageDate = String(data.date || data.usageDate || getBerlinDate()).trim();
    const result = resetDailyUsageRows({ ...data, date: usageDate });
    refreshDbStats();
    return {
      ...result,
      usageDate,
      dailyUsage: listDailyUsageRows({ date: usageDate }, data.limit || 50)
    };
  }

  async function runVipAdminTest(raw = {}) {
    const data = raw && typeof raw === "object" ? raw : {};
    const targetLogin = normalizeLogin(data.targetLogin || data.login || data.userLogin || data.target || data.userName || data.user || "");
    if (!targetLogin) throw new Error("Missing login or targetLogin");

    const targetDisplayName = cleanDisplayName(data.targetDisplayName || data.displayName || data.userDisplayName || data.target || data.user || targetLogin);
    const consumeDaily = boolish(data.consumeDaily || data.selfTrigger || data.writeDailyUsage);

    const actorLogin = normalizeLogin(data.actorLogin || data.actorUserLogin || (consumeDaily ? targetLogin : "forrestcgn"));
    const actorDisplayName = cleanDisplayName(data.actorDisplayName || data.actor || (consumeDaily ? targetDisplayName : "ForrestCGN"));

    const payload = {
      ...data,
      trigger: String(data.trigger || "!vip"),
      source: String(data.source || "dashboard-test"),
      actorLogin,
      actorDisplayName,
      login: actorLogin,
      userName: actorLogin,
      user: actorDisplayName,
      displayName: actorDisplayName
    };

    if (consumeDaily) {
      delete payload.targetLogin;
      delete payload.targetDisplayName;
      delete payload.target;
      delete payload.input0;
      delete payload.input1;
    } else {
      payload.targetLogin = targetLogin;
      payload.targetDisplayName = targetDisplayName;
      payload.input0 = targetLogin;
      payload.actorIsBroadcaster = data.actorIsBroadcaster === undefined ? "true" : data.actorIsBroadcaster;
      payload.isBroadcaster = data.isBroadcaster === undefined ? "true" : data.isBroadcaster;
    }

    const result = await handleVipCommand(payload);
    return {
      ...result,
      adminTest: true,
      consumeDaily,
      simulatedActor: {
        login: actorLogin,
        displayName: actorDisplayName
      },
      simulatedTarget: {
        login: targetLogin,
        displayName: targetDisplayName
      }
    };
  }

  async function handleVipCommand(raw) {
    const dbReady = ensureVipSchema();
    const requestedSoundType = normalizeSoundType(raw.soundType || raw.type);
    const trigger = String(raw.trigger || raw.command || "").trim();
    const source = String(raw.source || "streamerbot").trim() || "streamerbot";

    const actor = await resolveCommandUser(raw);
    const target = await resolveCommandTargetUser(raw, actor);
    const user = target.user;

    const soundType = await detectSoundTypeForTarget(requestedSoundType, user);
    const isOverrideRequest = target.explicit && normalizeLogin(user.login) !== normalizeLogin(actor.login);
    const overrideAllowed = isOverrideRequest && actorCanOverride(raw);
    const skipDailyUsage = isOverrideRequest && overrideAllowed;

    if (!actor.login || !user.login) {
      const context = {
        displayName: (user && user.displayName) || (actor && actor.displayName) || "User",
        login: (user && user.login) || "",
        actorDisplayName: (actor && actor.displayName) || "User",
        actorLogin: (actor && actor.login) || "",
        soundType,
        trigger,
        date: getBerlinDate()
      };

      return await finishVipCommand("error_generic", context, {
        accepted: false,
        duplicate: false,
        dbReady,
        error: "missing_user_login"
      });
    }

    const usageDate = getBerlinDate();
    const context = {
      displayName: user.displayName || user.login,
      login: user.login,
      actorDisplayName: actor.displayName || actor.login,
      actorLogin: actor.login,
      targetDisplayName: user.displayName || user.login,
      targetLogin: user.login,
      soundType,
      trigger,
      date: usageDate,
      override: skipDailyUsage ? "1" : "0"
    };

    const twitchAccess = twitchSoundAccessForUser(user);
    if (!twitchAccess.allowed) {
      return await finishVipCommand("not_twitch_vip_or_mod", context, {
        accepted: false,
        duplicate: false,
        dbReady,
        twitchOnlyDenied: true,
        error: "not_twitch_vip_or_mod",
        dailyUsageWritten: false,
        usageDate,
        actorLogin: actor.login,
        actorDisplayName: actor.displayName || actor.login,
        targetLogin: user.login,
        targetDisplayName: user.displayName || user.login,
        userLogin: user.login,
        userDisplayName: user.displayName || user.login,
        soundType,
        trigger,
        source,
        soundSystemQueued: false
      });
    }

    if (!getVipSetting("enabled", true)) {
      return await finishVipCommand("system_disabled", context, {
        accepted: false,
        duplicate: false,
        dbReady,
        systemDisabled: true,
        dailyUsageWritten: false,
        usageDate,
        actorLogin: actor.login,
        actorDisplayName: actor.displayName || actor.login,
        targetLogin: user.login,
        targetDisplayName: user.displayName || user.login,
        userLogin: user.login,
        userDisplayName: user.displayName || user.login,
        soundType,
        trigger,
        source,
        soundSystemQueued: false
      });
    }

    if (!dbReady) {
      return await finishVipCommand("error_generic", context, {
        accepted: false,
        duplicate: false,
        dbReady: false,
        error: state.db.lastError || "db_unavailable"
      });
    }

    if (isOverrideRequest && !overrideAllowed) {
      return await finishVipCommand(eventKey("denied_override", soundType), context, {
        accepted: false,
        duplicate: false,
        override: true,
        overrideAllowed: false,
        dailyUsageWritten: false,
        usageDate,
        actorLogin: actor.login,
        actorDisplayName: actor.displayName || actor.login,
        targetLogin: user.login,
        targetDisplayName: user.displayName || user.login,
        userLogin: user.login,
        userDisplayName: user.displayName || user.login,
        soundType,
        trigger,
        source,
        soundSystemQueued: false
      });
    }

    let existing = null;
    if (!skipDailyUsage) {
      existing = database.get(`
        SELECT usage_date, user_login, sound_type, triggered_at
        FROM vip_sound_daily_usage
        WHERE usage_date = :usageDate
          AND user_login = :userLogin
          AND sound_type = :soundType
      `, {
        usageDate,
        userLogin: user.login,
        soundType
      });
    }

    if (existing) {
      return await finishVipCommand(eventKey("duplicate", soundType), context, {
        accepted: false,
        duplicate: true,
        override: false,
        overrideAllowed: false,
        dailyUsageWritten: false,
        usageDate,
        actorLogin: actor.login,
        actorDisplayName: actor.displayName || actor.login,
        targetLogin: user.login,
        targetDisplayName: user.displayName || user.login,
        userLogin: user.login,
        userDisplayName: user.displayName || user.login,
        soundType,
        trigger,
        source,
        previousTriggeredAt: existing.triggered_at || ""
      });
    }

    const requestId = makeRequestId();
    const soundQueue = await queueVipSoundInSoundSystem(user, soundType, context, requestId, source);

    if (!soundQueue.ok) {
      const missing = soundQueue.reason === "sound_missing";
      return await finishVipCommand(missing ? "sound_missing" : "error_generic", context, {
        accepted: false,
        duplicate: false,
        override: skipDailyUsage,
        overrideAllowed,
        dailyUsageWritten: false,
        requestId,
        usageDate,
        actorLogin: actor.login,
        actorDisplayName: actor.displayName || actor.login,
        targetLogin: user.login,
        targetDisplayName: user.displayName || user.login,
        userLogin: user.login,
        userDisplayName: user.displayName || user.login,
        avatarUrl: user.avatarUrl,
        soundType,
        trigger,
        source,
        soundSystemQueued: false,
        soundError: soundQueue.error || "",
        soundFile: soundQueue.sound ? soundQueue.sound.relativeFile : "",
        soundPath: soundQueue.sound ? soundQueue.sound.fullPath : "",
        soundSystemResponse: soundQueue.response || null
      });
    }

    const soundBusCommandResult = emitVipSoundBusCommandTest({
      vipRequestId: requestId,
      soundType,
      usageDate,
      targetLogin: user.login,
      targetDisplayName: user.displayName || user.login,
      avatarUrl: user.avatarUrl,
      requestedBy: user.login,
      source: "vip_sound_overlay_shadow_command",
      reason: "vip_accepted_shadow_command"
    }, soundQueue, {
      ...context,
      requestId,
      date: usageDate,
      targetLogin: user.login,
      targetDisplayName: user.displayName || user.login,
      login: user.login,
      displayName: user.displayName || user.login,
      avatarUrl: user.avatarUrl,
      soundType
    });

    if (!skipDailyUsage) {
      database.run(`
        INSERT INTO vip_sound_daily_usage
          (usage_date, user_login, user_display_name, sound_type, source, triggered_at)
        VALUES
          (:usageDate, :userLogin, :userDisplayName, :soundType, :source, :triggeredAt)
      `, {
        usageDate,
        userLogin: user.login,
        userDisplayName: user.displayName || user.login,
        soundType,
        source,
        triggeredAt: nowIso()
      });
      refreshDbStats();
    }

    return await finishVipCommand(skipDailyUsage ? eventKey("accepted_override", soundType) : eventKey("accepted", soundType), context, {
      accepted: true,
      duplicate: false,
      override: skipDailyUsage,
      overrideAllowed,
      dailyUsageWritten: !skipDailyUsage,
      requestId,
      usageDate,
      actorLogin: actor.login,
      actorDisplayName: actor.displayName || actor.login,
      targetLogin: user.login,
      targetDisplayName: user.displayName || user.login,
      userLogin: user.login,
      userDisplayName: user.displayName || user.login,
      avatarUrl: user.avatarUrl,
      soundType,
      trigger,
      source,
      soundSystemQueued: true,
      soundSystemStarted: !!soundQueue.result.started,
      soundSystemQueuePosition: Number(soundQueue.result.queuePosition || 0),
      soundSystemRequestId:
        soundQueue.result.requestId ||
        (soundQueue.response && soundQueue.response.requestId) ||
        (soundQueue.response && soundQueue.response.item && soundQueue.response.item.requestId) ||
        "",
      soundBusCommand: {
        ok: !!(soundBusCommandResult && soundBusCommandResult.ok),
        skipped: !!(soundBusCommandResult && soundBusCommandResult.skipped),
        eventId: soundBusCommandResult && soundBusCommandResult.eventId ? soundBusCommandResult.eventId : "",
        deliveredCount: Number(soundBusCommandResult && soundBusCommandResult.deliveredCount || 0),
        error: soundBusCommandResult && soundBusCommandResult.error ? soundBusCommandResult.error : "",
        shadowOnly: true,
        testOnly: true
      },
      soundFile: soundQueue.sound.relativeFile,
      soundPath: soundQueue.sound.fullPath,
      note: skipDailyUsage
        ? "Override queued VIP sound via sound_system without daily usage."
        : "Queued VIP sound via sound_system before writing daily usage."
    });
  }

  async function normalizeItem(raw) {
    const loginRaw = (raw.login || "").toString().trim();
    const displayRaw = (raw.displayName || "").toString().trim();
    const titleRaw = (raw.title || "").toString().trim();
    const textRaw = (raw.text || "").toString().trim();
    const avatarRaw = (raw.avatarUrl || "").toString().trim();
    const soundPath = requiredString(raw.soundPath, "soundPath");

    if (!fileExistsSafe(soundPath)) {
      throw new Error(`Sound file not found: ${soundPath}`);
    }

    const soundType = normalizeSoundType(raw.soundType || raw.type);
    const lookupKey = loginRaw || displayRaw;
    const info = await fetchUserInfo(lookupKey);

    const resolvedLogin = ((info && info.login) || loginRaw || displayRaw).toString().trim().toLowerCase();
    const preferredDisplay = displayRaw || ((info && info.displayName) || loginRaw || "");
    const resolvedDisplay = beautifyDisplayName(preferredDisplay);

    const resolvedAvatar = ((info && info.avatarUrl) || avatarRaw || "").toString().trim();

    return {
      requestId: makeRequestId(),
      title: titleRaw || buildOverlayTitle(soundType, { displayName: resolvedDisplay, login: resolvedLogin, soundType }),
      text: textRaw || buildOverlayText(soundType, { displayName: resolvedDisplay, login: resolvedLogin, soundType }),
      finalTitle: buildOverlayTitle(soundType, { displayName: resolvedDisplay, login: resolvedLogin, soundType }),
      finalText: buildOverlayText(soundType, { displayName: resolvedDisplay, login: resolvedLogin, soundType }),
      displayName: resolvedDisplay,
      login: resolvedLogin,
      avatarUrl: resolvedAvatar,
      soundPath,
      audioUrl: toBrowserAudioUrl(soundPath),
      introMs: intOrDefault(raw.introMs, DEFAULT_INTRO_MS),
      outroMs: intOrDefault(raw.outroMs, DEFAULT_OUTRO_MS),
      gapAfterMs: intOrDefault(raw.gapAfterMs, DEFAULT_GAP_MS),
      source: (raw.source || "vip_sound").toString().trim() || "vip_sound",
      soundType,
      queuedAt: Date.now()
    };
  }

  function startNextIfIdle() {
    if (state.isActive) return false;
    if (!state.queue.length) return false;

    const item = state.queue.shift();
    state.isActive = true;
    state.overlay = {
      visible: true,
      phase: "intro",
      title: item.finalTitle || item.title,
      text: item.finalText || item.text,
      displayName: item.displayName,
      login: item.login,
      avatarUrl: item.avatarUrl,
      audioUrl: item.audioUrl,
      soundPath: item.soundPath,
      introMs: item.introMs,
      outroMs: item.outroMs,
      gapAfterMs: item.gapAfterMs,
      startedAt: Date.now(),
      audioStartedAt: 0,
      audioEndedAt: 0,
      hideStartedAt: 0,
      endsAt: 0,
      requestId: item.requestId,
      source: item.source
    };
    emitState("started");
    return true;
  }

  async function enqueue(raw) {
    const item = await normalizeItem(raw);

    const startsImmediately = !state.isActive && state.queue.length === 0;
    state.queue.push(item);

    const queuePosition = startsImmediately ? 0 : state.queue.length;
    const chatMessage = startsImmediately ? "" : buildQueuedChatMessage(item, queuePosition);

    emitState("enqueued");
    startNextIfIdle();

    return {
      item,
      startsImmediately,
      queuePosition,
      chatMessage
    };
  }

  function markClientSeen() {
    state.client.connected = true;
    state.client.lastSeenAt = Date.now();
    state.updatedAt = nowIso();
  }

  function vipRouteDefinitions(prefix) {
    const routes = [
      { method: "GET", path: `${prefix}/state`, purpose: "public overlay state" },
      { method: "GET", path: `${prefix}/status`, purpose: "runtime and DB status" },
      { method: "GET", path: `${prefix}/db/status`, purpose: "VIP schema and table status" },
      { method: "GET", path: `${prefix}/config`, purpose: "DB-backed config view with JSON fallback info" },
      { method: "GET", path: `${prefix}/settings`, purpose: "VIP settings from DB/fallback" },
      { method: "POST", path: `${prefix}/settings/upsert`, purpose: "upsert one VIP setting" },
      { method: "POST", path: `${prefix}/settings/delete`, purpose: "delete one VIP setting" },
      { method: "POST", path: `${prefix}/settings/reset-defaults`, purpose: "reset VIP settings to defaults" },
      { method: "GET", path: `${prefix}/texts`, purpose: "list VIP chat/overlay text templates" },
      { method: "GET", path: `${prefix}/texts/event-keys`, purpose: "list VIP text event keys" },
      { method: "POST", path: `${prefix}/texts/upsert`, purpose: "upsert VIP text template" },
      { method: "POST", path: `${prefix}/texts/toggle`, purpose: "enable or disable VIP text template" },
      { method: "POST", path: `${prefix}/texts/delete`, purpose: "delete VIP text template" },
      { method: "GET", path: `${prefix}/roles`, purpose: "list legacy local role overrides" },
      { method: "POST", path: `${prefix}/roles/upsert`, purpose: "upsert legacy local role override" },
      { method: "POST", path: `${prefix}/roles/delete`, purpose: "delete legacy local role override" },
      { method: "GET", path: `${prefix}/roles/import-config`, purpose: "preview/import roles from config" },
      { method: "POST", path: `${prefix}/roles/import-config`, purpose: "import roles from config" },
      { method: "GET", path: `${prefix}/events`, purpose: "list VIP events" },
      { method: "GET", path: `${prefix}/events/recent`, purpose: "list recent VIP events" },
      { method: "GET", path: `${prefix}/stats`, purpose: "VIP event statistics" },
      { method: "GET", path: `${prefix}/daily-usage`, purpose: "list daily usage rows" },
      { method: "GET", path: `${prefix}/daily-usage/today`, purpose: "list today's daily usage" },
      { method: "POST", path: `${prefix}/daily-usage/reset`, purpose: "reset filtered daily usage" },
      { method: "GET", path: `${prefix}/daily-usage/reset`, purpose: "legacy GET reset for Streamer.bot/testing" },
      { method: "POST", path: `${prefix}/daily-usage/reset-today`, purpose: "reset today's daily usage" },
      { method: "GET", path: `${prefix}/daily-usage/reset-today`, purpose: "legacy GET reset today's usage" },
      { method: "GET", path: `${prefix}/sounds/users`, purpose: "list Twitch VIP/Mod users with sound info" },
      { method: "GET", path: `${prefix}/sounds/status`, purpose: "resolve sound status for one user" },
      { method: "GET", path: `${prefix}/sounds/resolve`, purpose: "resolve upload target and expected sound file" },
      { method: "POST", path: `${prefix}/sounds/upload`, purpose: "upload or replace VIP/Mod sound" },
      { method: "GET", path: `${prefix}/upload/status`, purpose: "upload runtime and setting status" },
      { method: "GET", path: `${prefix}/twitch-sync/status`, purpose: "Twitch VIP/Mod sync status" },
      { method: "POST", path: `${prefix}/twitch-sync/run`, purpose: "run Twitch VIP/Mod sync" },
      { method: "GET", path: `${prefix}/admin/summary`, purpose: "admin summary for dashboard" },
      { method: "GET", path: `${prefix}/admin/reset-daily`, purpose: "legacy admin reset daily usage" },
      { method: "POST", path: `${prefix}/admin/reset-daily`, purpose: "admin reset daily usage" },
      { method: "POST", path: `${prefix}/test`, purpose: "run VIP admin test" },
      { method: "POST", path: `${prefix}/admin/test`, purpose: "run VIP admin test" },
      { method: "GET", path: `${prefix}/command`, purpose: "legacy command trigger" },
      { method: "POST", path: `${prefix}/command`, purpose: "command trigger" },
      { method: "GET", path: `${prefix}/enqueue`, purpose: "legacy direct overlay enqueue" },
      { method: "POST", path: `${prefix}/enqueue`, purpose: "direct overlay enqueue" },
      { method: "POST", path: `${prefix}/client/audio-started`, purpose: "overlay client audio-start callback" },
      { method: "POST", path: `${prefix}/client/audio-ended`, purpose: "overlay client audio-ended callback" },
      { method: "POST", path: `${prefix}/client/finished`, purpose: "overlay client finished callback" },
      { method: "POST", path: `${prefix}/reset`, purpose: "clear VIP overlay queue/state" },
      { method: "GET", path: `${prefix}/routes`, purpose: "list VIP API routes" },
      { method: "GET", path: `${prefix}/integration-check`, purpose: "run non-destructive VIP integration check" },
      { method: "GET", path: `${prefix}/eventbus/status`, purpose: "read VIP EventBus status counters and last emitted event" },
      { method: "GET", path: `${prefix}/eventbus/test`, purpose: "emit a test-only vip.sound smoke event without touching sound, queue, overlay or Daily-Usage" },
      { method: "POST", path: `${prefix}/eventbus/test`, purpose: "emit a test-only vip.sound smoke event without touching sound, queue, overlay or Daily-Usage" },
      { method: "POST", path: `${prefix}/eventbus/reset`, purpose: "reset VIP EventBus diagnostic counters only" },
      { method: "GET", path: `${prefix}/eventbus/reset`, purpose: "legacy GET reset for VIP EventBus diagnostic counters only" },
      { method: "GET", path: `${prefix}/eventbus/sound-command/status`, purpose: "read VIP to Sound-Bus command shadow diagnostics" },
      { method: "GET", path: `${prefix}/eventbus/sound-command/test`, purpose: "emit test-only VIP sound-command shadow event" },
      { method: "POST", path: `${prefix}/eventbus/sound-command/test`, purpose: "emit test-only VIP sound-command shadow event" },
      { method: "GET", path: `${prefix}/eventbus/sound-command/dry-run`, purpose: "emit VIP shadow command and validate it against Sound-System dry-run consumer" },
      { method: "POST", path: `${prefix}/eventbus/sound-command/dry-run`, purpose: "emit VIP shadow command and validate it against Sound-System dry-run consumer" },
      { method: "POST", path: `${prefix}/eventbus/sound-command/reset`, purpose: "reset VIP to Sound-Bus command diagnostic counters only" },
      { method: "GET", path: `${prefix}/eventbus/sound-command/reset`, purpose: "legacy GET reset for VIP to Sound-Bus command diagnostic counters only" },
      { method: "POST", path: `${prefix}/reload`, purpose: "safe VIP diagnostics reload" }
    ];

    return routes;
  }

  function vipCheckItem(name, ok, details = {}, level = "error") {
    return {
      name,
      ok: !!ok,
      level: ok ? "ok" : level,
      ...details
    };
  }

  function countTableSafe(tableName) {
    try {
      return {
        ok: true,
        count: database.count(tableName),
        error: ""
      };
    } catch (err) {
      return {
        ok: false,
        count: 0,
        error: err.message || String(err)
      };
    }
  }


  function buildVipEventBusStatus(prefix = "") {
    const busAvailable = !!(communicationBus && typeof communicationBus.getBus === "function");
    return {
      ok: true,
      module: MODULE_NAME,
      version: state.version,
      capability: "vip.sound.status_events",
      statusApiVersion: "1.0.0",
      enabled: !!state.eventBus.enabled,
      channel: state.eventBus.channel,
      target: {
        type: state.eventBus.targetType || "all",
        id: state.eventBus.targetId || "*",
        module: state.eventBus.targetModule || MODULE_NAME,
        capability: state.eventBus.targetCapability || ""
      },
      deliveryClassification: "module_scoped_status_event",
      communicationBusAvailable: busAvailable,
      soundSystemFlow: "unchanged",
      productionTarget: false,
      overlayControl: false,
      routes: {
        status: prefix ? `${prefix}/eventbus/status` : "",
        test: prefix ? `${prefix}/eventbus/test` : "",
        reset: prefix ? `${prefix}/eventbus/reset` : "",
        soundCommandStatus: prefix ? `${prefix}/eventbus/sound-command/status` : "",
        soundCommandTest: prefix ? `${prefix}/eventbus/sound-command/test` : "",
        soundCommandDryRun: prefix ? `${prefix}/eventbus/sound-command/dry-run` : "",
        soundCommandReset: prefix ? `${prefix}/eventbus/sound-command/reset` : ""
      },
      soundCommand: publicVipSoundBusCommandStatus(prefix),
      counters: {
        emitted: Number(state.eventBus.emitted || 0),
        skipped: Number(state.eventBus.skipped || 0),
        errors: Number(state.eventBus.errors || 0)
      },
      last: {
        action: state.eventBus.lastAction || "",
        eventId: state.eventBus.lastEventId || "",
        eventType: state.eventBus.lastEventType || "",
        eventKey: state.eventBus.lastEventKey || "",
        requestId: state.eventBus.lastRequestId || "",
        result: state.eventBus.lastResult || null,
        error: state.eventBus.lastError || "",
        at: state.eventBus.lastAt || ""
      },
      notes: [
        "VIP EventBus events are status-only events on vip.sound.",
        "They are targeted to the vip_sound_overlay module so unrelated overlay/debug clients do not receive them.",
        "They do not start sounds, do not control the overlay and do not replace /api/sound/play.",
        "The smoke-test route emits a test-only vip.sound event without touching Sound-System, queue, overlay or Daily-Usage.",
        "If the Communication Bus is unavailable, VIP sounds continue through the existing Sound-System flow."
      ],
      updatedAt: nowIso()
    };
  }

  function resetVipEventBusStatus() {
    state.eventBus.emitted = 0;
    state.eventBus.skipped = 0;
    state.eventBus.errors = 0;
    state.eventBus.lastAction = "";
    state.eventBus.lastEventId = "";
    state.eventBus.lastEventType = "";
    state.eventBus.lastEventKey = "";
    state.eventBus.lastRequestId = "";
    state.eventBus.lastResult = null;
    state.eventBus.lastError = "";
    state.eventBus.lastAt = nowIso();
    return buildVipEventBusStatus("");
  }

  function runVipEventBusSmokeTest(raw = {}, prefix = "") {
    const data = raw && typeof raw === "object" ? raw : {};
    const displayName = cleanDisplayName(data.displayName || data.userDisplayName || data.user || "VIP EventBus Test");
    const login = normalizeLogin(data.login || data.userLogin || data.user || "vip_eventbus_test");
    const actorDisplayName = cleanDisplayName(data.actorDisplayName || data.actor || "System");
    const actorLogin = normalizeLogin(data.actorLogin || data.actor || "system");
    const soundType = normalizeSoundType(data.soundType || data.type || "vip");
    const requestId = String(data.requestId || makeRequestId()).trim();
    const eventKeyValue = cleanVipBusAction(data.eventKey || data.event_key || "smoke_test", "smoke_test");

    const context = {
      displayName,
      login,
      actorDisplayName,
      actorLogin,
      targetDisplayName: displayName,
      targetLogin: login,
      soundType,
      trigger: "eventbus_smoke_test",
      date: getBerlinDate()
    };

    const extra = {
      accepted: false,
      duplicate: false,
      dailyUsageWritten: false,
      requestId,
      usageDate: context.date,
      actorLogin,
      actorDisplayName,
      targetLogin: login,
      targetDisplayName: displayName,
      userLogin: login,
      userDisplayName: displayName,
      soundType,
      trigger: context.trigger,
      source: "eventbus_smoke_test",
      soundSystemQueued: false,
      soundSystemStarted: false,
      testOnly: true,
      smokeTest: true
    };

    const response = {
      message: "VIP EventBus smoke test only. No sound, no overlay, no queue and no Daily-Usage change."
    };

    const result = emitVipEventBusStatus(eventKeyValue, context, extra, response);

    return {
      ok: !!(result && result.ok),
      module: MODULE_NAME,
      version: state.version,
      prefix,
      testOnly: true,
      smokeTest: true,
      soundSystemTouched: false,
      overlayTouched: false,
      queueTouched: false,
      dailyUsageTouched: false,
      eventKey: eventKeyValue,
      action: vipBusActionForResult(eventKeyValue, extra),
      requestId,
      result,
      eventBus: buildVipEventBusStatus(prefix),
      updatedAt: nowIso()
    };
  }

  function buildVipIntegrationCheck(prefix) {
    const checks = [];
    let schemaReady = false;
    let schemaError = "";

    try {
      ensureVipSchema();
      refreshDbStats();
      schemaReady = !!state.db.initialized;
      schemaError = state.db.lastError || "";
    } catch (err) {
      schemaReady = false;
      schemaError = err.message || String(err);
    }

    checks.push(vipCheckItem("schema", schemaReady, {
      schemaModule: VIP_SCHEMA_MODULE,
      schemaVersion: state.db.schemaVersion || 0,
      expectedSchemaVersion: VIP_SCHEMA_VERSION,
      error: schemaError
    }));

    const tables = [
      VIP_DAILY_USAGE_TABLE,
      VIP_MESSAGE_TABLE,
      VIP_SETTINGS_TABLE,
      VIP_EVENTS_TABLE,
      VIP_ROLE_OVERRIDES_TABLE,
      VIP_TWITCH_USERS_TABLE
    ];

    const tableChecks = tables.map(tableName => {
      const result = countTableSafe(tableName);
      return vipCheckItem(`table:${tableName}`, result.ok, {
        table: tableName,
        count: result.count,
        error: result.error
      });
    });
    checks.push(...tableChecks);

    const settingsData = (() => {
      try {
        return listVipSettings();
      } catch (err) {
        return { settings: [], config: { ok: false, exists: false, path: "", error: err.message || String(err) } };
      }
    })();

    const settingsCount = Array.isArray(settingsData.settings) ? settingsData.settings.length : 0;
    checks.push(vipCheckItem("settings", settingsCount > 0, {
      table: VIP_SETTINGS_TABLE,
      count: settingsCount
    }));

    const configInfo = settingsData.config || readVipSettingsConfig();
    checks.push(vipCheckItem("config_fallback", !!configInfo.exists, {
      file: VIP_SETTINGS_CONFIG_FILE,
      path: configInfo.path || "",
      exists: !!configInfo.exists,
      ok: !!configInfo.ok,
      error: configInfo.error || "",
      note: "JSON config is fallback only; database settings are primary."
    }, "warning"));

    const rolesConfigExists = fileExistsSafe(VIP_ROLES_CONFIG_PATH);
    checks.push(vipCheckItem("roles_config", rolesConfigExists, {
      path: VIP_ROLES_CONFIG_PATH,
      exists: rolesConfigExists,
      note: "Used as legacy/fallback import source for local role overrides."
    }, "warning"));

    const soundBaseDir = getVipSoundBaseDir();
    checks.push(vipCheckItem("sound_base_dir", fileExistsSafe(soundBaseDir), {
      path: soundBaseDir,
      exists: fileExistsSafe(soundBaseDir)
    }, "warning"));

    const uploadReady = !!multer;
    checks.push(vipCheckItem("upload_middleware", uploadReady, {
      multerReady: uploadReady,
      error: multerLoadError || ""
    }));

    const routeCount = vipRouteDefinitions(prefix).length;
    checks.push(vipCheckItem("routes", routeCount > 0, {
      prefix,
      count: routeCount
    }));

    let soundSystemOk = false;
    let soundSystemError = "";
    try {
      soundSystemOk = !!VIP_SOUND_SYSTEM_PLAY_URL;
    } catch (err) {
      soundSystemError = err.message || String(err);
    }

    checks.push(vipCheckItem("sound_system_target", soundSystemOk, {
      url: VIP_SOUND_SYSTEM_PLAY_URL,
      error: soundSystemError,
      note: "This check validates configured target only; it does not enqueue sound."
    }));

    const eventBusStatus = buildVipEventBusStatus(prefix);
    checks.push(vipCheckItem("eventbus_status_events", eventBusStatus.communicationBusAvailable, {
      channel: eventBusStatus.channel,
      enabled: eventBusStatus.enabled,
      communicationBusAvailable: eventBusStatus.communicationBusAvailable,
      counters: eventBusStatus.counters,
      last: eventBusStatus.last,
      note: "Status-only EventBus events; warnings do not block the existing VIP sound flow."
    }, "warning"));

    const hardErrors = checks.filter(item => item.level === "error" && !item.ok);
    const warnings = checks.filter(item => item.level === "warning" && !item.ok);

    return {
      ok: hardErrors.length === 0,
      module: MODULE_NAME,
      version: state.version,
      prefix,
      schemaVersion: state.db.schemaVersion || 0,
      db: { ...state.db },
      eventBus: buildVipEventBusStatus(prefix),
      checks,
      summary: {
        total: checks.length,
        ok: checks.filter(item => item.ok).length,
        warnings: warnings.length,
        errors: hardErrors.length
      },
      notes: [
        "/api/vip is intentionally not registered.",
        "Existing productive prefixes remain /api/vip-sound and /api/vip-sound-overlay.",
        "Reload is non-destructive and does not clear queue or overlay state."
      ],
      updatedAt: nowIso()
    };
  }

  function reloadVipDiagnostics(prefix) {
    ensureVipSchema();
    refreshDbStats();
    emitState("reload");

    return {
      ok: true,
      module: MODULE_NAME,
      version: state.version,
      prefix,
      reloaded: true,
      destructive: false,
      queuePreserved: true,
      overlayPreserved: true,
      db: { ...state.db },
      state: {
        phase: state.overlay.phase,
        visible: state.overlay.visible,
        isActive: state.isActive,
        queuedCount: state.queue.length,
        requestId: state.overlay.requestId || ""
      },
      updatedAt: nowIso()
    };
  }

  const apiPrefixes = ["/api/vip-sound-overlay", "/api/vip-sound"];

  function registerApiPrefix(prefix) {
    app.use(prefix, (req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      if (req.method === "OPTIONS") return res.sendStatus(204);
      next();
    });

    app.get(`${prefix}/routes`, (req, res) => {
      markClientSeen();
      return res.json({
        ok: true,
        module: MODULE_NAME,
        version: state.version,
        prefix,
        canonicalPrefix: "/api/vip-sound",
        aliases: apiPrefixes.slice(),
        intentionallyNotRegistered: ["/api/vip"],
        routes: vipRouteDefinitions(prefix),
        count: vipRouteDefinitions(prefix).length,
        updatedAt: nowIso()
      });
    });

    app.get(`${prefix}/integration-check`, (req, res) => {
      try {
        markClientSeen();
        return res.json(buildVipIntegrationCheck(prefix));
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.get(`${prefix}/eventbus/status`, (req, res) => {
      try {
        markClientSeen();
        return res.json(buildVipEventBusStatus(prefix));
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.get(`${prefix}/eventbus/test`, (req, res) => {
      try {
        markClientSeen();
        return res.json(runVipEventBusSmokeTest(requestData(req), prefix));
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.post(`${prefix}/eventbus/test`, (req, res) => {
      try {
        markClientSeen();
        return res.json(runVipEventBusSmokeTest(requestData(req), prefix));
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.post(`${prefix}/eventbus/reset`, (req, res) => {
      try {
        markClientSeen();
        const result = resetVipEventBusStatus();
        return res.json({ ...result, prefix, reset: true, resetAt: state.eventBus.lastAt });
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.get(`${prefix}/eventbus/reset`, (req, res) => {
      try {
        markClientSeen();
        const result = resetVipEventBusStatus();
        return res.json({ ...result, prefix, reset: true, resetAt: state.eventBus.lastAt });
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.get(`${prefix}/eventbus/sound-command/status`, (req, res) => {
      try {
        markClientSeen();
        return res.json(publicVipSoundBusCommandStatus(prefix));
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.get(`${prefix}/eventbus/sound-command/test`, (req, res) => {
      try {
        markClientSeen();
        const result = emitVipSoundBusCommandTest(requestData(req), null, {
          date: getBerlinDate(),
          trigger: "vip_sound_bus_command_test"
        }, { manual: true });
        return res.json({
          ok: !!(result && result.ok),
          module: MODULE_NAME,
          version: state.version,
          feature: "vip_sound_to_sound_bus_command_dry_run_check",
          testOnly: true,
          shadowOnly: true,
          vipProductiveFlowTouched: false,
          soundSystemTouched: false,
          queueTouched: false,
          audioTouched: false,
          overlayTouched: false,
          dailyUsageTouched: false,
          result,
          command: publicVipSoundBusCommandStatus(prefix),
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.post(`${prefix}/eventbus/sound-command/test`, (req, res) => {
      try {
        markClientSeen();
        const result = emitVipSoundBusCommandTest(requestData(req), null, {
          date: getBerlinDate(),
          trigger: "vip_sound_bus_command_test"
        }, { manual: true });
        return res.json({
          ok: !!(result && result.ok),
          module: MODULE_NAME,
          version: state.version,
          feature: "vip_sound_to_sound_bus_command_dry_run_check",
          testOnly: true,
          shadowOnly: true,
          vipProductiveFlowTouched: false,
          soundSystemTouched: false,
          queueTouched: false,
          audioTouched: false,
          overlayTouched: false,
          dailyUsageTouched: false,
          result,
          command: publicVipSoundBusCommandStatus(prefix),
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.get(`${prefix}/eventbus/sound-command/dry-run`, async (req, res) => {
      try {
        markClientSeen();
        const result = await dryRunVipSoundBusCommand(requestData(req), null, {
          date: getBerlinDate(),
          trigger: "vip_sound_bus_command_dry_run"
        });
        return res.json({
          ...result,
          command: publicVipSoundBusCommandStatus(prefix),
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.post(`${prefix}/eventbus/sound-command/dry-run`, async (req, res) => {
      try {
        markClientSeen();
        const result = await dryRunVipSoundBusCommand(requestData(req), null, {
          date: getBerlinDate(),
          trigger: "vip_sound_bus_command_dry_run"
        });
        return res.json({
          ...result,
          command: publicVipSoundBusCommandStatus(prefix),
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.post(`${prefix}/eventbus/sound-command/reset`, (req, res) => {
      try {
        markClientSeen();
        const result = resetVipSoundBusCommandStatus(prefix);
        return res.json({ ...result, prefix, reset: true, resetAt: state.soundBusCommand.lastAt });
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.get(`${prefix}/eventbus/sound-command/reset`, (req, res) => {
      try {
        markClientSeen();
        const result = resetVipSoundBusCommandStatus(prefix);
        return res.json({ ...result, prefix, reset: true, resetAt: state.soundBusCommand.lastAt });
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.post(`${prefix}/reload`, (req, res) => {
      try {
        markClientSeen();
        return res.json(reloadVipDiagnostics(prefix));
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.get(`${prefix}/state`, (req, res) => {
      markClientSeen();
      return res.json(publicState());
    });

    app.get(`${prefix}/status`, (req, res) => {
      markClientSeen();
      refreshDbStats();
      return res.json({
        ok: true,
        version: state.version,
        phase: state.overlay.phase,
        visible: state.overlay.visible,
        isActive: state.isActive,
        queuedCount: state.queue.length,
        requestId: state.overlay.requestId || "",
        lastFinishedAt: state.lastFinishedAt,
        client: { ...state.client },
        db: { ...state.db },
        eventBus: { ...state.eventBus },
        updatedAt: state.updatedAt
      });
    });

    app.get(`${prefix}/db/status`, (req, res) => {
      markClientSeen();
      ensureVipSchema();
      refreshDbStats();
      return res.json({
        ok: state.db.initialized,
        module: MODULE_NAME,
        schemaModule: VIP_SCHEMA_MODULE,
        schemaVersion: state.db.schemaVersion,
        dailyUsageTable: VIP_DAILY_USAGE_TABLE,
        messageTable: VIP_MESSAGE_TABLE,
        settingsTable: VIP_SETTINGS_TABLE,
        messageTemplates: state.db.messageTemplates,
        dailyUsageRows: state.db.dailyUsageRows,
        settingsRows: state.db.settingsRows,
        eventsTable: VIP_EVENTS_TABLE,
        eventsRows: state.db.eventsRows,
        roleOverridesTable: VIP_ROLE_OVERRIDES_TABLE,
        roleOverridesRows: state.db.roleOverridesRows,
        databasePath: database.getDbPath ? database.getDbPath() : "",
        lastError: state.db.lastError,
        updatedAt: nowIso()
      });
    });


    app.get(`${prefix}/settings`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        refreshDbStats();
        const data = listVipSettings();
        return res.json({
          ok: true,
          module: MODULE_NAME,
          settingsTable: VIP_SETTINGS_TABLE,
          count: data.settings.length,
          settings: data.settings,
          config: data.config,
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });


    app.post(`${prefix}/settings/upsert`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const result = upsertVipSetting(requestData(req));
        return res.json(result);
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.post(`${prefix}/settings/delete`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const result = deleteVipSetting(requestData(req));
        return res.json(result);
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.post(`${prefix}/settings/reset-defaults`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const result = resetVipSettingsToDefaults(requestData(req));
        return res.json(result);
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.get(`${prefix}/config`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        refreshDbStats();
        const data = listVipSettings();
        return res.json({
          ok: true,
          module: MODULE_NAME,
          note: "DB-backed VIP settings. Config file is fallback only.",
          settingsTable: VIP_SETTINGS_TABLE,
          count: data.settings.length,
          settings: data.settings,
          config: data.config,
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.get(`${prefix}/texts`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        refreshDbStats();
        const data = listVipMessageTemplates(requestData(req), bodyOrQuery(req, "limit"));
        return res.json({
          ok: true,
          module: MODULE_NAME,
          messageTable: VIP_MESSAGE_TABLE,
          ...data,
          count: data.rows.length,
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.get(`${prefix}/texts/event-keys`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        refreshDbStats();
        const data = listVipMessageEventKeys();
        return res.json({
          ok: true,
          module: MODULE_NAME,
          messageTable: VIP_MESSAGE_TABLE,
          ...data,
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.post(`${prefix}/texts/upsert`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const textTemplate = upsertVipMessageTemplate(requestData(req));
        return res.json({
          ok: true,
          module: MODULE_NAME,
          textTemplate,
          texts: listVipMessageTemplates({ eventKey: textTemplate.eventKey, style: textTemplate.style }, 300),
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.post(`${prefix}/texts/toggle`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const result = toggleVipMessageTemplate(requestData(req));
        return res.json({
          ok: true,
          module: MODULE_NAME,
          ...result,
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.post(`${prefix}/texts/delete`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const result = deleteVipMessageTemplate(requestData(req));
        return res.json({
          ok: true,
          module: MODULE_NAME,
          ...result,
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.get(`${prefix}/roles`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        refreshDbStats();
        const includeDisabled = String(bodyOrQuery(req, "includeDisabled") ?? "true").trim().toLowerCase() !== "false";
        const data = listVipRoleOverrides(includeDisabled);
        return res.json({
          ok: true,
          module: MODULE_NAME,
          ...data,
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.post(`${prefix}/roles/upsert`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const role = upsertVipRoleOverride(requestData(req));
        return res.json({
          ok: true,
          module: MODULE_NAME,
          role,
          roles: listVipRoleOverrides(true),
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.post(`${prefix}/roles/delete`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const result = deleteVipRoleOverride(requestData(req));
        return res.json({
          ok: true,
          module: MODULE_NAME,
          ...result,
          roles: listVipRoleOverrides(true),
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.post(`${prefix}/roles/import-config`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const result = importVipRolesFromConfig();
        return res.json({
          ok: true,
          module: MODULE_NAME,
          ...result,
          roles: listVipRoleOverrides(true),
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.get(`${prefix}/roles/import-config`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const result = importVipRolesFromConfig();
        return res.json({
          ok: true,
          module: MODULE_NAME,
          ...result,
          roles: listVipRoleOverrides(true),
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });


    app.get(`${prefix}/events`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const data = listVipEvents(requestData(req), bodyOrQuery(req, "limit"));
        return res.json({
          ok: true,
          module: MODULE_NAME,
          eventsTable: VIP_EVENTS_TABLE,
          ...data,
          count: data.rows.length,
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.get(`${prefix}/events/recent`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const data = listVipEvents(requestData(req), bodyOrQuery(req, "limit") || 20);
        return res.json({
          ok: true,
          module: MODULE_NAME,
          eventsTable: VIP_EVENTS_TABLE,
          ...data,
          count: data.rows.length,
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.get(`${prefix}/stats`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const data = getVipStats(requestData(req));
        return res.json({
          ok: true,
          module: MODULE_NAME,
          eventsTable: VIP_EVENTS_TABLE,
          ...data,
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });


    app.get(`${prefix}/daily-usage`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const data = listDailyUsageRows(requestData(req), bodyOrQuery(req, "limit"));
        return res.json({
          ok: true,
          module: MODULE_NAME,
          ...data,
          count: data.rows.length,
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.get(`${prefix}/daily-usage/today`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const data = listDailyUsageRows({ ...requestData(req), date: getBerlinDate() }, bodyOrQuery(req, "limit"));
        return res.json({
          ok: true,
          module: MODULE_NAME,
          ...data,
          count: data.rows.length,
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.post(`${prefix}/daily-usage/reset`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const result = resetDailyUsageRows(requestData(req));
        return res.json({
          ok: true,
          module: MODULE_NAME,
          ...result,
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.get(`${prefix}/daily-usage/reset`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const result = resetDailyUsageRows(requestData(req));
        return res.json({
          ok: true,
          module: MODULE_NAME,
          ...result,
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.post(`${prefix}/daily-usage/reset-today`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const raw = requestData(req);
        const result = resetDailyUsageRows({
          ...raw,
          date: getBerlinDate()
        });
        return res.json({
          ok: true,
          module: MODULE_NAME,
          ...result,
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.get(`${prefix}/daily-usage/reset-today`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const raw = requestData(req);
        const result = resetDailyUsageRows({
          ...raw,
          date: getBerlinDate()
        });
        return res.json({
          ok: true,
          module: MODULE_NAME,
          ...result,
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });



    app.get(`${prefix}/sounds/users`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        refreshDbStats();
        const data = listVipSoundUsers(requestData(req));
        return res.json({
          ok: true,
          module: MODULE_NAME,
          ...data,
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.get(`${prefix}/sounds/status`, async (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const data = await buildVipSoundStatus(requestData(req));
        return res.json(data);
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.get(`${prefix}/sounds/resolve`, async (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const data = await buildVipSoundStatus(requestData(req));
        return res.json(data);
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.post(`${prefix}/sounds/upload`, (req, res) => {
      markClientSeen();
      ensureVipSchema();
      const upload = createVipSoundUploadMiddleware();
      if (!upload) {
        return res.status(500).json({
          ok: false,
          module: MODULE_NAME,
          error: "multer_not_available",
          message: "Uploads sind nicht verfuegbar, weil multer nicht geladen werden konnte.",
          detail: multerLoadError || ""
        });
      }

      upload.single("file")(req, res, async err => {
        if (err) return fail(res, 400, err.message || String(err));
        try {
          const result = await saveUploadedVipSound(requestData(req), req.file);
          return res.status(201).json(result);
        } catch (e) {
          return fail(res, 400, e.message || String(e));
        }
      });
    });

    app.get(`${prefix}/upload/status`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        return res.json({
          ok: true,
          module: MODULE_NAME,
          multerReady: !!multer,
          multerLoadError,
          settings: {
            soundBaseDir: getVipSoundBaseDir(),
            fileNameMode: String(getVipSetting("fileNameMode", "displayName") || "displayName"),
            fileExtension: normalizeFileExtension(getVipSetting("fileExtension", ".mp3")),
            maxSoundUploadBytes: Number(getVipSetting("maxSoundUploadBytes", 15728640)) || 15728640
          },
          allowedExtensions: media.DEFAULT_ALLOWED_EXTENSIONS,
          twitchSync: twitchSyncStatus(),
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });


    app.get(`${prefix}/twitch-sync/status`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        return res.json(twitchSyncStatus());
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.post(`${prefix}/twitch-sync/run`, async (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const result = await runTwitchVipModSync(requestData(req));
        return res.json(result);
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.get(`${prefix}/admin/summary`, (req, res) => {
      try {
        markClientSeen();
        const summary = buildVipAdminSummary(requestData(req));
        return res.json({
          ok: true,
          ...summary,
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.get(`${prefix}/admin/reset-daily`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const result = resetVipAdminDaily(requestData(req));
        return res.json({
          ok: true,
          module: MODULE_NAME,
          ...result,
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.post(`${prefix}/admin/reset-daily`, (req, res) => {
      try {
        markClientSeen();
        ensureVipSchema();
        const result = resetVipAdminDaily(requestData(req));
        return res.json({
          ok: true,
          module: MODULE_NAME,
          ...result,
          db: { ...state.db },
          updatedAt: nowIso()
        });
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.post(`${prefix}/test`, async (req, res) => {
      try {
        markClientSeen();
        const result = await runVipAdminTest(requestData(req));
        return res.json(result);
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.post(`${prefix}/admin/test`, async (req, res) => {
      try {
        markClientSeen();
        const result = await runVipAdminTest(requestData(req));
        return res.json(result);
      } catch (err) {
        return fail(res, 400, err.message || String(err));
      }
    });

    app.post(`${prefix}/command`, async (req, res) => {
      try {
        const result = await handleVipCommand(requestData(req));
        return res.json(result);
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.get(`${prefix}/command`, async (req, res) => {
      try {
        const result = await handleVipCommand(requestData(req));
        return res.json(result);
      } catch (err) {
        return fail(res, 500, err.message || String(err));
      }
    });

    app.post(`${prefix}/enqueue`, async (req, res) => {
      try {
        const result = await enqueue(req.body || {});
        return res.json({
          ok: true,
          requestId: result.item.requestId,
          startedImmediately: result.startsImmediately,
          queuePosition: result.queuePosition,
          displayName: result.item.displayName,
          login: result.item.login,
          avatarUrl: result.item.avatarUrl,
          soundType: result.item.soundType,
          chatMessage: result.chatMessage,
          queuedCount: state.queue.length,
          isActive: state.isActive,
          overlay: { ...state.overlay }
        });
      } catch (err) {
        return fail(res, 400, err.message);
      }
    });

    app.get(`${prefix}/enqueue`, async (req, res) => {
      try {
        const result = await enqueue({
          title: bodyOrQuery(req, "title"),
          text: bodyOrQuery(req, "text"),
          displayName: bodyOrQuery(req, "displayName"),
          login: bodyOrQuery(req, "login"),
          avatarUrl: bodyOrQuery(req, "avatarUrl"),
          soundPath: bodyOrQuery(req, "soundPath"),
          source: bodyOrQuery(req, "source"),
          soundType: bodyOrQuery(req, "soundType") || bodyOrQuery(req, "type"),
          introMs: bodyOrQuery(req, "introMs"),
          outroMs: bodyOrQuery(req, "outroMs"),
          gapAfterMs: bodyOrQuery(req, "gapAfterMs")
        });

        return res.json({
          ok: true,
          requestId: result.item.requestId,
          startedImmediately: result.startsImmediately,
          queuePosition: result.queuePosition,
          displayName: result.item.displayName,
          login: result.item.login,
          avatarUrl: result.item.avatarUrl,
          soundType: result.item.soundType,
          chatMessage: result.chatMessage,
          queuedCount: state.queue.length,
          isActive: state.isActive,
          overlay: { ...state.overlay }
        });
      } catch (err) {
        return fail(res, 400, err.message);
      }
    });

    app.post(`${prefix}/client/audio-started`, (req, res) => {
      markClientSeen();
      const requestId = (bodyOrQuery(req, "requestId") || "").toString().trim();
      if (!state.isActive || !state.overlay.visible) return fail(res, 409, "No active overlay");
      if (!requestId || requestId !== state.overlay.requestId) return fail(res, 409, "requestId mismatch");

      state.overlay.phase = "audio";
      state.overlay.audioStartedAt = Date.now();
      emitState("audio_started");
      return res.json({ ok: true, overlay: { ...state.overlay } });
    });

    app.post(`${prefix}/client/audio-ended`, (req, res) => {
      markClientSeen();
      const requestId = (bodyOrQuery(req, "requestId") || "").toString().trim();
      if (!state.isActive || !state.overlay.visible) return fail(res, 409, "No active overlay");
      if (!requestId || requestId !== state.overlay.requestId) return fail(res, 409, "requestId mismatch");

      state.overlay.phase = "outro";
      state.overlay.audioEndedAt = Date.now();
      state.overlay.hideStartedAt = Date.now();
      emitState("audio_ended");
      return res.json({ ok: true, overlay: { ...state.overlay } });
    });

    app.post(`${prefix}/client/finished`, (req, res) => {
      markClientSeen();
      const requestId = (bodyOrQuery(req, "requestId") || "").toString().trim();
      if (!state.isActive) return fail(res, 409, "No active overlay");
      if (!requestId || requestId !== state.overlay.requestId) return fail(res, 409, "requestId mismatch");

      const gapAfterMs = state.overlay.gapAfterMs || DEFAULT_GAP_MS;
      state.overlay.phase = "gap";
      state.overlay.visible = false;
      state.overlay.endsAt = Date.now();
      state.lastFinishedAt = Date.now();
      emitState("finished");

      setTimeout(() => {
        if (state.overlay.requestId === requestId) {
          state.isActive = false;
          state.overlay = emptyOverlay();
          emitState("gap_finished");
          startNextIfIdle();
        }
      }, gapAfterMs);

      return res.json({
        ok: true,
        gapAfterMs,
        queuedCount: state.queue.length,
        nextStartsAfterGap: true
      });
    });

    app.post(`${prefix}/reset`, (req, res) => {
      state.queue = [];
      state.isActive = false;
      state.lastFinishedAt = 0;
      state.overlay = emptyOverlay();
      emitState("reset");
      return res.json(publicState());
    });
  }

  ensureVipSchema();
  apiPrefixes.forEach(registerApiPrefix);
  startTwitchSyncTimer();

  console.log(`[${MODULE_NAME}] loaded`);
  console.log(`[${MODULE_NAME}] webRoot=${webRoot}`);
  console.log(`[${MODULE_NAME}] userInfoBaseUrl=${userInfoBaseUrl}`);
};
