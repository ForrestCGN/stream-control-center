"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const core = require("./helpers/helper_core");
const messages = require("./helpers/helper_messages");
const chatOutput = require("./helpers/helper_chat_output");
const configHelper = require("./helpers/helper_config");
const database = require("../core/database");
const twitchRoles = require("./helpers/helper_twitch_roles");

module.exports.init = function init(ctx) {
  const { app, broadcastWS } = ctx;

  const MODULE_NAME = "vip_sound_overlay";
  const DEFAULT_INTRO_MS = 360;
  const DEFAULT_OUTRO_MS = 280;
  const DEFAULT_GAP_MS = 2000;
  const DEFAULT_PHASE = "idle";
  const VIP_SCHEMA_MODULE = "vip_sound_overlay";
  const VIP_SCHEMA_VERSION = 4;
  const VIP_DAILY_USAGE_TABLE = "vip_sound_daily_usage";
  const VIP_MESSAGE_TABLE = "vip_sound_message_templates";
  const VIP_SETTINGS_TABLE = "vip_sound_settings";
  const VIP_EVENTS_TABLE = "vip_sound_events";
  const VIP_ROLE_OVERRIDES_TABLE = "vip_sound_role_overrides";
  const VIP_MESSAGE_STYLE = "heimleitung";
  const VIP_OVERLAY_STYLE = "overlay";
  const VIP_SOUND_SYSTEM_PLAY_URL = process.env.VIP_SOUND_SYSTEM_PLAY_URL || "http://127.0.0.1:8080/api/sound/play";
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
      message_text: "@{displayName}, Sonderfreigabe fuers Mod-Buero wurde erteilt. Sound ist eingereiht.",
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
    version: "1.8.1",
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

  async function detectSoundTypeForTarget(requestedSoundType, targetUser) {
    const requested = normalizeSoundType(requestedSoundType);
    const roles = buildRoleSetsFromDbOrFallback();

    if (!roles.enabled) return requested;

    const login = normalizeLogin(targetUser && (targetUser.login || targetUser.displayName));
    if (!login) return requested;

    if (roles.autoDetectTargetRole) {
      const twitchModeratorResult = await twitchRoles.isTargetModerator(login);
      if (twitchModeratorResult === true) return "mod";
    }

    if (!roles.fallbackRolesEnabled) return requested;

    if (roles.mods.has(login) || roles.crew.has(login)) return "mod";

    return requested;
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


  function encodeSettingValue(value, valueType) {
    if (valueType === "boolean") return value ? "true" : "false";
    if (valueType === "number") return String(Number(value));
    if (valueType === "json") return JSON.stringify(value ?? null);
    return String(value ?? "");
  }

  function decodeSettingValue(value, valueType, fallback = null) {
    if (valueType === "boolean") return boolish(value);
    if (valueType === "number") {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    }
    if (valueType === "json") {
      try { return JSON.parse(String(value)); } catch (_) { return fallback; }
    }
    return String(value ?? "");
  }

  function getNestedValue(obj, pathParts) {
    let current = obj;
    for (const part of pathParts) {
      if (!current || typeof current !== "object" || !(part in current)) return undefined;
      current = current[part];
    }
    return current;
  }

  function readVipSettingsConfig() {
    try {
      const loaded = configHelper.loadConfig(VIP_SETTINGS_CONFIG_FILE, {}, {
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

  function getConfigSettingValue(key, config) {
    const cfg = config && typeof config === "object" ? config : {};

    const candidates = {
      enabled: [["enabled"]],
      soundBaseDir: [["soundBaseDir"], ["sound", "baseDir"], ["sound", "soundBaseDir"]],
      fileNameMode: [["fileNameMode"], ["sound", "fileNameMode"]],
      fileExtension: [["fileExtension"], ["sound", "fileExtension"]],
      dailyUsageRetentionDays: [["dailyUsageRetentionDays"], ["dailyUsage", "retentionDays"]],
      cleanupDailyUsageOnStartup: [["cleanupDailyUsageOnStartup"], ["dailyUsage", "cleanupOnStartup"]],
      autoDetectTargetRole: [["autoDetectTargetRole"], ["roles", "autoDetectTargetRole"]],
      fallbackRolesEnabled: [["fallbackRolesEnabled"], ["roles", "fallbackRolesEnabled"]]
    };

    for (const parts of candidates[key] || [[key]]) {
      const value = getNestedValue(cfg, parts);
      if (value !== undefined && value !== null && String(value).trim() !== "") return value;
    }

    return undefined;
  }

  function normalizeSettingForDb(key, value, valueType, description) {
    return {
      settingKey: key,
      settingValue: encodeSettingValue(value, valueType),
      valueType,
      description: description || ""
    };
  }

  function seedDefaultSettingsIfMissing() {
    const now = nowIso();
    const loadedConfig = readVipSettingsConfig();
    const cfg = loadedConfig.config || {};

    for (const [key, def] of Object.entries(DEFAULT_VIP_SETTINGS)) {
      const configValue = getConfigSettingValue(key, cfg);
      const value = configValue === undefined ? def.value : configValue;
      const row = normalizeSettingForDb(key, value, def.value_type, def.description);

      database.run(`
        INSERT OR IGNORE INTO vip_sound_settings
          (setting_key, setting_value, value_type, description, created_at, updated_at)
        VALUES
          (:settingKey, :settingValue, :valueType, :description, :createdAt, :updatedAt)
      `, {
        ...row,
        createdAt: now,
        updatedAt: now
      });
    }
  }

  function listVipSettings() {
    const loadedConfig = readVipSettingsConfig();
    const cfg = loadedConfig.config || {};
    const dbRows = database.all(`
      SELECT setting_key, setting_value, value_type, description, created_at, updated_at
      FROM vip_sound_settings
      ORDER BY setting_key ASC
    `);
    const rowByKey = new Map((Array.isArray(dbRows) ? dbRows : []).map(row => [row.setting_key, row]));

    const settings = [];
    for (const [key, def] of Object.entries(DEFAULT_VIP_SETTINGS)) {
      const row = rowByKey.get(key);
      const configValue = getConfigSettingValue(key, cfg);

      if (row) {
        settings.push({
          key,
          value: decodeSettingValue(row.setting_value, row.value_type, def.value),
          rawValue: row.setting_value,
          valueType: row.value_type,
          description: row.description || def.description || "",
          source: "database",
          createdAt: row.created_at || "",
          updatedAt: row.updated_at || ""
        });
      } else if (configValue !== undefined) {
        settings.push({
          key,
          value: decodeSettingValue(encodeSettingValue(configValue, def.value_type), def.value_type, def.value),
          rawValue: encodeSettingValue(configValue, def.value_type),
          valueType: def.value_type,
          description: def.description || "",
          source: "config",
          createdAt: "",
          updatedAt: ""
        });
      } else {
        settings.push({
          key,
          value: def.value,
          rawValue: encodeSettingValue(def.value, def.value_type),
          valueType: def.value_type,
          description: def.description || "",
          source: "default",
          createdAt: "",
          updatedAt: ""
        });
      }
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

    try {
      const row = database.get(`
        SELECT setting_value, value_type
        FROM vip_sound_settings
        WHERE setting_key = :key
      `, { key });

      if (row) return decodeSettingValue(row.setting_value, row.value_type, defaultValue);
    } catch (_) {
      // DB may not be ready during early boot; fallback below.
    }

    const loadedConfig = readVipSettingsConfig();
    const configValue = getConfigSettingValue(key, loadedConfig.config || {});
    if (configValue !== undefined && def) {
      return decodeSettingValue(encodeSettingValue(configValue, def.value_type), def.value_type, defaultValue);
    }

    return defaultValue;
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
              id INTEGER PRIMARY KEY AUTOINCREMENT,
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
              id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      target: "stream",
      outputTarget: "device",
      volume: 85,
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

    return response;
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
      soundFile: soundQueue.sound.relativeFile,
      soundPath: soundQueue.sound.fullPath,
      note: skipDailyUsage
        ? "STEP019 override queued VIP sound via sound_system without daily usage."
        : "STEP017 queued VIP sound via sound_system before writing daily usage."
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

  const apiPrefixes = ["/api/vip-sound-overlay", "/api/vip-sound"];

  function registerApiPrefix(prefix) {
    app.use(prefix, (req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      if (req.method === "OPTIONS") return res.sendStatus(204);
      next();
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

  console.log(`[${MODULE_NAME}] loaded`);
  console.log(`[${MODULE_NAME}] webRoot=${webRoot}`);
  console.log(`[${MODULE_NAME}] userInfoBaseUrl=${userInfoBaseUrl}`);
};
