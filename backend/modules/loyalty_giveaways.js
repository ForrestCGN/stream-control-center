"use strict";

/**
 * Loyalty Giveaways module.
 *
 * STEP LWG-4N.1b:
 * - Giveaways dürfen als Entwurf unvollständig gespeichert werden.
 * - setupComplete/setupIssues werden dynamisch berechnet.
 * - Öffnen/Aktivieren wird backendseitig blockiert, wenn Pflichtdaten fehlen.
 * - Wheel-Giveaways brauchen vor dem Öffnen ein gültiges Glücksrad mit nutzbaren Feldern.
 */

const crypto = require("crypto");
const core = require("./helpers/helper_core");
const routes = require("./helpers/helper_routes");
const textHelper = require("./helpers/helper_texts");
const database = require("../core/database");

const MODULE_NAME = "loyalty_giveaways";
const MODULE_VERSION = "0.1.0";
const MODULE_BUILD = "STEP_LWG_4N_8";
const SCHEMA_MODULE = "loyalty_giveaways";
const SCHEMA_VERSION = 1;

const CHAT_COMMANDS_ACTIVE = false;
const TEXT_MODULE = "loyalty_giveaways";

const CHAT_COMMAND_DEFINITIONS = [
  {
    command: "ticket",
    aliases: [],
    action: "giveaway_ticket",
    enabled: false,
    active: false,
    description: "!ticket oder !ticket <anzahl> – Teilnahme am aktuell offenen Giveaway. Noch nicht aktiv.",
    usage: "!ticket [anzahl]"
  },
  {
    command: "wheel",
    aliases: ["rad"],
    action: "giveaway_wheel_claim",
    enabled: false,
    active: false,
    description: "!wheel / !rad – Rad-Claim nur fuer Gewinner mit offener Permission. Noch nicht aktiv.",
    usage: "!wheel"
  }
];

const CENTRAL_COMMAND_DEFINITIONS = [
  {
    trigger: "ticket",
    aliases: [],
    moduleKey: MODULE_NAME,
    actionKey: "chat_command_runtime",
    targetMethod: "POST",
    targetUrl: "/api/loyalty/giveaways/runtime/chat-command",
    enabled: false,
    permissionLevel: "everyone",
    cooldownGlobalMs: 1000,
    cooldownUserMs: 3000,
    liveOnly: false,
    responseMode: "module",
    config: {
      seededBy: "STEP_LWG_4L_5",
      actionType: "module_command",
      moduleCommand: "ticket",
      rawInputMode: true,
      activationState: "prepared_disabled"
    }
  },
  {
    trigger: "wheel",
    aliases: ["rad"],
    moduleKey: MODULE_NAME,
    actionKey: "chat_command_runtime",
    targetMethod: "POST",
    targetUrl: "/api/loyalty/giveaways/runtime/chat-command",
    enabled: false,
    permissionLevel: "everyone",
    cooldownGlobalMs: 1000,
    cooldownUserMs: 3000,
    liveOnly: false,
    responseMode: "module",
    config: {
      seededBy: "STEP_LWG_4L_5",
      actionType: "module_command",
      moduleCommand: "wheel",
      rawInputMode: true,
      activationState: "prepared_disabled"
    }
  }
];

const CHAT_TEXT_DEFAULTS = {
  "ticket.disabled": [
    "{user}, die Ticket-Ausgabe liegt schon auf dem Tresen, aber die Heimleitung hat den Schalter noch nicht aufgeschlossen.",
    "{user}, bitte noch nicht drängeln. Der Ticket-Schalter ist vorbereitet, aber noch nicht freigegeben."
  ],
  "ticket.success": [
    "{user}, dein Ticket wurde von der Heimleitung abgestempelt. Du bist mit {tickets} Ticket(s) im Lostopf.",
    "{user}, die Rentnergang hat {tickets} Ticket(s) für dich in die Lostrommel geworfen."
  ],
  "ticket.no_active": [
    "{user}, aktuell läuft kein offenes Giveaway. Die Lostrommel macht gerade Mittagsschlaf.",
    "{user}, die Heimleitung findet gerade kein offenes Giveaway für deine Eintrittskarte."
  ],
  "ticket.invalid_amount": [
    "{user}, bitte eine gültige Ticket-Anzahl angeben. Die Heimleitung zählt zwar langsam, aber nicht rückwärts.",
    "{user}, mit dieser Ticket-Anzahl kommt die Rentnerkasse durcheinander."
  ],
  "ticket.max_reached": [
    "{user}, mehr Tickets passen für dich gerade nicht in den Lostopf. Die Heimleitung hat den Deckel drauf.",
    "{user}, du hast dein Ticket-Limit erreicht. Mehr Papierkram erlaubt die Heimleitung gerade nicht."
  ],
  "ticket.cost_not_supported_yet": [
    "{user}, kostenpflichtige Tickets sind noch nicht freigeschaltet. Die Rentnerkasse ist noch in Prüfung.",
    "{user}, Tickets mit Punktebuchung kommen später. Aktuell nimmt die Heimleitung nur kostenlose Zettel an."
  ],
  "giveaway.closed": [
    "Die Lostrommel wird jetzt versiegelt. Keine neuen Tickets mehr – die Heimleitung zählt gleich aus.",
    "Die Ticket-Ausgabe ist geschlossen. Die Rentnergang macht jetzt Kassensturz."
  ],
  "giveaway.draw_not_closed": [
    "Erst wird die Lostrommel geschlossen, dann wird ausgelost. Ordnung muss sein.",
    "Die Heimleitung lässt erst auslosen, wenn die Ticket-Ausgabe offiziell geschlossen ist."
  ],
  "wheel.disabled": [
    "{user}, das Glücksrad steht bereit, aber der Hausmeister hat den Strom noch nicht eingeschaltet.",
    "{user}, der Rad-Freigabeschein ist vorbereitet, aber die Ausgabe ist noch nicht aktiv."
  ],
  "wheel.no_permission": [
    "{user}, für dich liegt gerade kein Rad-Freigabeschein an der Rezeption.",
    "{user}, die Heimleitung hat nachgeschaut: Du darfst aktuell nicht am Rad drehen."
  ],
  "wheel.success": [
    "{user}, das Glücksrad wurde angeworfen. Die Rentnergang hält den Atem an.",
    "{user}, dein Rad-Freigabeschein wurde eingelöst. Jetzt dreht das gute Stück."
  ]
};

const CHAT_TEXT_CATEGORIES = {
  "ticket.disabled": "chat_ticket",
  "ticket.success": "chat_ticket",
  "ticket.no_active": "chat_ticket",
  "ticket.invalid_amount": "chat_ticket",
  "ticket.max_reached": "chat_ticket",
  "ticket.cost_not_supported_yet": "chat_ticket",
  "giveaway.closed": "chat_giveaway",
  "giveaway.draw_not_closed": "chat_giveaway",
  "wheel.disabled": "chat_wheel",
  "wheel.no_permission": "chat_wheel",
  "wheel.success": "chat_wheel"
};

const CHAT_TEXT_CATEGORY_LABELS = {
  chat_ticket: "Chat · Tickets",
  chat_giveaway: "Chat · Giveaway",
  chat_wheel: "Chat · Wheel/Rad"
};


const STATUS = {
  DRAFT: "draft",
  OPEN: "open",
  CLOSED_FOR_ENTRIES: "closed_for_entries",
  DRAWING: "drawing",
  WAITING_FOR_WHEEL: "waiting_for_wheel",
  WAITING_NEXT_ROUND: "waiting_next_round",
  PRIZES_EXHAUSTED: "prizes_exhausted",
  FINISHED: "finished",
  CANCELLED: "cancelled",
  DELETED: "deleted"
};

const MODES = {
  CLASSIC_SINGLE: "classic_single",
  CLASSIC_MULTI: "classic_multi",
  WHEEL_SINGLE: "wheel_single",
  WHEEL_MULTI: "wheel_multi"
};

const BOUND_WHEEL_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  FINISHED: "finished",
  CANCELLED: "cancelled"
};

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "runtime",
  category: "loyalty",
  routesPrefix: ["/api/loyalty/giveaways"],
  bus: {
    publishes: [
      "loyalty.giveaway.created",
      "loyalty.giveaway.copied",
      "loyalty.giveaway.opened",
      "loyalty.giveaway.entries_closed",
      "loyalty.giveaway.finished",
      "loyalty.giveaway.cancelled",
      "loyalty.giveaway.deleted",
      "loyalty.giveaway.winner_drawn",
      "loyalty.giveaway.wheel_permission_created",
      "loyalty.giveaway.wheel_claimed"
    ],
    consumes: []
  },
  legacy: false,
  description: "Loyalty giveaway backend foundation"
};

let broadcastWS = null;
let eventBus = null;
let moduleBusHandle = null;

function createCommunicationBusHandle(meta, buildStatusFn) {
  const moduleName = meta && meta.name ? String(meta.name) : "unknown_module";
  const intervalMs = 5000;
  const state = {
    ok: false,
    registered: false,
    heartbeatStarted: false,
    heartbeatCount: 0,
    lastHeartbeatAt: "",
    lastStatusPublishedAt: "",
    lastError: "",
    timer: null,
    bus: null
  };

  function getBus() {
    if (state.bus) return state.bus;
    try {
      const communicationBus = require("./communication_bus");
      if (communicationBus && typeof communicationBus.getBus === "function") {
        state.bus = communicationBus.getBus();
        state.ok = !!state.bus;
        return state.bus;
      }
      state.lastError = "communication_bus_getBus_unavailable";
    } catch (err) {
      state.lastError = err && err.message ? err.message : String(err);
    }
    return null;
  }

  function buildCapabilities() {
    const capabilities = [];
    if (Array.isArray(meta.routesPrefix)) {
      for (const route of meta.routesPrefix) capabilities.push(`route:${route}`);
    }
    if (meta.bus && Array.isArray(meta.bus.publishes)) {
      for (const eventName of meta.bus.publishes) capabilities.push(`publishes:${eventName}`);
    }
    if (meta.bus && Array.isArray(meta.bus.consumes)) {
      for (const eventName of meta.bus.consumes) capabilities.push(`consumes:${eventName}`);
    }
    return capabilities;
  }

  function buildModuleInfo() {
    return {
      id: `module:${moduleName}`,
      module: moduleName,
      name: moduleName,
      displayName: meta.label || meta.name || moduleName,
      version: meta.version || "",
      capabilities: buildCapabilities(),
      meta: {
        category: meta.category || "",
        build: meta.build || "",
        type: meta.type || "runtime",
        routesPrefix: Array.isArray(meta.routesPrefix) ? meta.routesPrefix : [],
        registeredBy: "direct_existing_communication_bus",
        registeredAt: core.nowIso()
      }
    };
  }

  function buildStatusPayload(extra = {}) {
    let base = {};
    try {
      base = typeof buildStatusFn === "function" ? (buildStatusFn() || {}) : {};
    } catch (err) {
      const error = err && err.message ? err.message : String(err);
      base = { ok: false, lastError: error, diagnostics: { health: "error", errors: [error] } };
    }

    const diagnostics = base.diagnostics || {};
    return {
      module: moduleName,
      moduleVersion: meta.version || base.moduleVersion || base.version || "",
      moduleBuild: meta.build || base.moduleBuild || "",
      category: meta.category || "",
      ok: base.ok !== false,
      health: diagnostics.health || (base.ok === false ? "error" : "ok"),
      enabled: base.enabled !== false,
      loadedAt: base.loadedAt || "",
      heartbeatAt: core.nowIso(),
      lastError: base.lastError || diagnostics.lastError || "",
      routeCount: Number(base.routeCount || 0),
      schemaReady: diagnostics.schemaReady,
      warnings: Array.isArray(diagnostics.warnings) ? diagnostics.warnings : [],
      errors: Array.isArray(diagnostics.errors) ? diagnostics.errors : [],
      ...extra
    };
  }

  function register() {
    const bus = getBus();
    if (!bus || typeof bus.registerModule !== "function") {
      return { ok: false, reason: state.lastError || "communication_bus_unavailable" };
    }
    const result = bus.registerModule(buildModuleInfo());
    state.registered = result && result.ok === true;
    if (!state.registered) state.lastError = result && result.reason ? result.reason : "register_failed";
    return result;
  }

  function heartbeat(extra = {}) {
    const bus = getBus();
    if (!bus || typeof bus.heartbeatModule !== "function") {
      return { ok: false, reason: state.lastError || "communication_bus_unavailable" };
    }
    const payload = buildStatusPayload(extra);
    const result = bus.heartbeatModule(`module:${moduleName}`, {
      module: moduleName,
      version: meta.version || "",
      name: moduleName,
      lastError: payload.lastError || "",
      capabilities: buildCapabilities(),
      meta: payload
    });
    state.heartbeatCount += 1;
    state.lastHeartbeatAt = payload.heartbeatAt;
    if (result && result.ok !== true) state.lastError = result.reason || "heartbeat_failed";
    return result;
  }

  function publishStatus(action = "updated", extra = {}) {
    const bus = getBus();
    if (!bus || typeof bus.publishModuleStatus !== "function") {
      return { ok: false, reason: state.lastError || "communication_bus_unavailable" };
    }
    const result = bus.publishModuleStatus(moduleName, buildStatusPayload(extra), {
      action,
      replayable: true,
      ttlMs: intervalMs * 4
    });
    state.lastStatusPublishedAt = core.nowIso();
    if (result && result.ok !== true) state.lastError = result.reason || "publish_failed";
    return result;
  }

  function start() {
    const bus = getBus();
    if (!bus) return { ok: false, reason: state.lastError || "communication_bus_unavailable" };
    if (!state.registered) register();
    heartbeat({ lifecycle: "started" });
    publishStatus("ready", { lifecycle: "ready" });
    if (!state.timer) {
      state.timer = setInterval(() => {
        heartbeat();
        publishStatus("heartbeat");
      }, intervalMs);
      if (typeof state.timer.unref === "function") state.timer.unref();
    }
    state.heartbeatStarted = true;
    return { ok: true, module: moduleName, intervalMs };
  }

  function getState() {
    return {
      ok: state.ok,
      registered: state.registered,
      heartbeatStarted: state.heartbeatStarted,
      heartbeatCount: state.heartbeatCount,
      lastHeartbeatAt: state.lastHeartbeatAt,
      lastStatusPublishedAt: state.lastStatusPublishedAt,
      lastError: state.lastError,
      intervalMs
    };
  }

  return { register, heartbeat, publishStatus, start, getState };
}


let state = {
  loadedAt: core.nowIso(),
  schemaReady: false,
  routeCount: 0,
  lastError: "",
  eventBusReady: false
};

function uid(prefix = "uid") {
  const clean = String(prefix || "uid").trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "uid";
  return `${clean}_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
}

function json(value) {
  return JSON.stringify(value && typeof value === "object" ? value : {});
}

function parseJson(value, fallback = {}) {
  return core.safeJsonParse(value, fallback);
}

function nowIso() {
  return core.nowIso();
}

function cleanStatus(value, fallback = STATUS.DRAFT) {
  const clean = String(value || "").trim().toLowerCase();
  return Object.values(STATUS).includes(clean) ? clean : fallback;
}

function cleanMode(value, fallback = MODES.CLASSIC_SINGLE) {
  const clean = String(value || "").trim().toLowerCase();
  return Object.values(MODES).includes(clean) ? clean : fallback;
}

function clampInt(value, fallback = 0, min = 0, max = 2147483647) {
  const n = Number.parseInt(value, 10);
  const clean = Number.isFinite(n) ? n : Number(fallback || 0);
  return Math.max(min, Math.min(max, clean));
}

function defaultRoundPolicy(input = {}) {
  const roundMode = String(input.roundMode || input.round_mode || "single").trim() || "single";
  const ticketCarryoverMode = String(input.ticketCarryoverMode || input.ticket_carryover_mode || "none").trim() || "none";
  return {
    roundMode,
    allowNewEntriesBetweenRounds: input.allowNewEntriesBetweenRounds === true || input.allow_new_entries_between_rounds === true,
    removeWinnerAfterRound: input.removeWinnerAfterRound === undefined && input.remove_winner_after_round === undefined
      ? true
      : !(input.removeWinnerAfterRound === false || input.remove_winner_after_round === false),
    ticketCarryoverMode
  };
}

function emitEvent(type, payload = {}) {
  const event = {
    type,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    event: "loyalty.event",
    createdAt: nowIso(),
    payload
  };

  let delivered = false;
  try {
    if (eventBus && typeof eventBus.emit === "function") {
      eventBus.emit(type, event);
      delivered = true;
    } else if (eventBus && typeof eventBus.publish === "function") {
      eventBus.publish(type, event);
      delivered = true;
    }
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
  }

  if (typeof broadcastWS === "function") {
    broadcastWS(event);
    delivered = true;
  }

  return delivered;
}

function shouldSendChatForRequest(input = {}) {
  if (!input || typeof input !== "object") return true;
  const candidates = [input.sendChat, input.chatOutput, input.shouldSendChat, input.announce, input.silent];
  if (String(input.silent || "").trim().toLowerCase().match(/^(1|true|yes|on)$/)) return false;
  for (const value of candidates) {
    if (value === undefined || value === null || value === "") continue;
    const clean = String(value).trim().toLowerCase();
    if (["0", "false", "no", "off", "silent"].includes(clean)) return false;
    if (["1", "true", "yes", "on", "chat"].includes(clean)) return true;
  }
  return true;
}

async function sendTwitchPresenceChatMessage(message, options = {}) {
  const text = sanitizeRuntimeChatMessage(message, 450);
  if (!text) return { ok: false, error: "empty_message", skipped: true };

  try {
    const twitchPresence = require("./twitch_presence");
    if (!twitchPresence || typeof twitchPresence.sendChatMessage !== "function") {
      return { ok: false, error: "twitch_presence_send_unavailable", messagePreview: text.slice(0, 120) };
    }
    const result = await twitchPresence.sendChatMessage(text, {
      trigger: options.trigger || "loyalty_giveaways",
      module: MODULE_NAME,
      giveawayUid: options.giveawayUid || "",
      messageKey: options.messageKey || ""
    });
    return {
      ...result,
      attempted: true,
      messagePreview: text.length > 120 ? `${text.slice(0, 117)}...` : text
    };
  } catch (err) {
    return {
      ok: false,
      attempted: true,
      error: err && err.message ? err.message : String(err),
      messagePreview: text.length > 120 ? `${text.slice(0, 117)}...` : text
    };
  }
}

function databaseStatus() {
  try {
    const status = database.status();
    return {
      ok: !!status.ok,
      adapter: status.adapter,
      dialect: status.dialect,
      path: status.sqlite && status.sqlite.databasePath ? status.sqlite.databasePath : "",
      lastError: status.lastError || ""
    };
  } catch (err) {
    return {
      ok: false,
      adapter: "unknown",
      dialect: "unknown",
      path: "",
      lastError: err && err.message ? err.message : String(err)
    };
  }
}

function ensureSchema() {
  database.ensureReady();
  database.ensureSchema(SCHEMA_MODULE, SCHEMA_VERSION, (fromVersion, toVersion, db) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS loyalty_giveaways (
        id ${database.primaryKeyAutoIncrementSql()},
        giveaway_uid TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'draft',
        mode TEXT NOT NULL DEFAULT 'classic_single',
        wheel_enabled INTEGER NOT NULL DEFAULT 0,
        wheel_preset_uid TEXT NOT NULL DEFAULT '',
        wheel_snapshot_uid TEXT NOT NULL DEFAULT '',
        cost_amount INTEGER NOT NULL DEFAULT 0,
        currency_key TEXT NOT NULL DEFAULT 'loyalty_points',
        max_tickets_per_user INTEGER NOT NULL DEFAULT 1,
        first_ticket_free INTEGER NOT NULL DEFAULT 0,
        sub_only INTEGER NOT NULL DEFAULT 0,
        subscriber_luck_multiplier INTEGER NOT NULL DEFAULT 1,
        winner_count INTEGER NOT NULL DEFAULT 1,
        round_policy_json TEXT NOT NULL DEFAULT '{}',
        settings_snapshot_json TEXT NOT NULL DEFAULT '{}',
        copied_from_giveaway_uid TEXT NOT NULL DEFAULT '',
        created_by TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        opened_at TEXT NOT NULL DEFAULT '',
        entries_closed_at TEXT NOT NULL DEFAULT '',
        finished_at TEXT NOT NULL DEFAULT '',
        cancelled_at TEXT NOT NULL DEFAULT '',
        deleted_at TEXT NOT NULL DEFAULT '',
        metadata_json TEXT NOT NULL DEFAULT '{}'
      );
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaways_status ON loyalty_giveaways(status);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaways_created ON loyalty_giveaways(created_at);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaways_title ON loyalty_giveaways(title);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaways_deleted ON loyalty_giveaways(deleted_at);`);

    db.exec(`
      CREATE TABLE IF NOT EXISTS loyalty_giveaway_rounds (
        id ${database.primaryKeyAutoIncrementSql()},
        round_uid TEXT NOT NULL UNIQUE,
        giveaway_uid TEXT NOT NULL,
        round_number INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'draft',
        entry_policy_snapshot_json TEXT NOT NULL DEFAULT '{}',
        prize_pool_snapshot_json TEXT NOT NULL DEFAULT '{}',
        eligible_entries_count INTEGER NOT NULL DEFAULT 0,
        total_ticket_weight INTEGER NOT NULL DEFAULT 0,
        winner_uid TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        opened_at TEXT NOT NULL DEFAULT '',
        closed_at TEXT NOT NULL DEFAULT '',
        drawn_at TEXT NOT NULL DEFAULT '',
        completed_at TEXT NOT NULL DEFAULT '',
        metadata_json TEXT NOT NULL DEFAULT '{}'
      );
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_rounds_giveaway ON loyalty_giveaway_rounds(giveaway_uid);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_rounds_status ON loyalty_giveaway_rounds(status);`);

    db.exec(`
      CREATE TABLE IF NOT EXISTS loyalty_giveaway_prizes (
        id ${database.primaryKeyAutoIncrementSql()},
        prize_uid TEXT NOT NULL UNIQUE,
        giveaway_uid TEXT NOT NULL,
        round_uid TEXT NOT NULL DEFAULT '',
        label TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        quantity_total INTEGER NOT NULL DEFAULT 1,
        quantity_remaining INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'available',
        source_preset_uid TEXT NOT NULL DEFAULT '',
        source_field_uid TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        metadata_json TEXT NOT NULL DEFAULT '{}'
      );
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_prizes_giveaway ON loyalty_giveaway_prizes(giveaway_uid);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_prizes_status ON loyalty_giveaway_prizes(status);`);

    db.exec(`
      CREATE TABLE IF NOT EXISTS loyalty_giveaway_entries (
        id ${database.primaryKeyAutoIncrementSql()},
        entry_uid TEXT NOT NULL UNIQUE,
        giveaway_uid TEXT NOT NULL,
        round_uid TEXT NOT NULL DEFAULT '',
        user_login TEXT NOT NULL DEFAULT '',
        user_display_name TEXT NOT NULL DEFAULT '',
        ticket_count INTEGER NOT NULL DEFAULT 1,
        ticket_weight INTEGER NOT NULL DEFAULT 1,
        cost_amount INTEGER NOT NULL DEFAULT 0,
        cost_due INTEGER NOT NULL DEFAULT 0,
        cost_booked INTEGER NOT NULL DEFAULT 0,
        source TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        cancelled_at TEXT NOT NULL DEFAULT '',
        metadata_json TEXT NOT NULL DEFAULT '{}'
      );
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_entries_giveaway ON loyalty_giveaway_entries(giveaway_uid);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_entries_round ON loyalty_giveaway_entries(round_uid);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_entries_user ON loyalty_giveaway_entries(user_login);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_entries_status ON loyalty_giveaway_entries(status);`);

    db.exec(`
      CREATE TABLE IF NOT EXISTS loyalty_giveaway_winners (
        id ${database.primaryKeyAutoIncrementSql()},
        winner_uid TEXT NOT NULL UNIQUE,
        giveaway_uid TEXT NOT NULL,
        round_uid TEXT NOT NULL DEFAULT '',
        entry_uid TEXT NOT NULL DEFAULT '',
        user_login TEXT NOT NULL DEFAULT '',
        user_display_name TEXT NOT NULL DEFAULT '',
        draw_algorithm TEXT NOT NULL DEFAULT 'crypto.randomInt',
        eligible_entries_count INTEGER NOT NULL DEFAULT 0,
        total_ticket_weight INTEGER NOT NULL DEFAULT 0,
        ticket_position INTEGER NOT NULL DEFAULT 0,
        prize_uid TEXT NOT NULL DEFAULT '',
        prize_label TEXT NOT NULL DEFAULT '',
        wheel_required INTEGER NOT NULL DEFAULT 0,
        wheel_permission_uid TEXT NOT NULL DEFAULT '',
        wheel_spin_uid TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'drawn',
        created_at TEXT NOT NULL,
        metadata_json TEXT NOT NULL DEFAULT '{}'
      );
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_winners_giveaway ON loyalty_giveaway_winners(giveaway_uid);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_winners_round ON loyalty_giveaway_winners(round_uid);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_winners_user ON loyalty_giveaway_winners(user_login);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_winners_status ON loyalty_giveaway_winners(status);`);

    db.exec(`
      CREATE TABLE IF NOT EXISTS loyalty_giveaway_wheel_permissions (
        id ${database.primaryKeyAutoIncrementSql()},
        permission_uid TEXT NOT NULL UNIQUE,
        giveaway_uid TEXT NOT NULL,
        round_uid TEXT NOT NULL DEFAULT '',
        winner_uid TEXT NOT NULL DEFAULT '',
        user_login TEXT NOT NULL DEFAULT '',
        user_display_name TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending',
        expires_at TEXT NOT NULL DEFAULT '',
        used_at TEXT NOT NULL DEFAULT '',
        spin_uid TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        metadata_json TEXT NOT NULL DEFAULT '{}'
      );
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_wheel_permissions_giveaway ON loyalty_giveaway_wheel_permissions(giveaway_uid);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_wheel_permissions_winner ON loyalty_giveaway_wheel_permissions(winner_uid);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_wheel_permissions_user ON loyalty_giveaway_wheel_permissions(user_login);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_wheel_permissions_status ON loyalty_giveaway_wheel_permissions(status);`);




    db.exec(`
      CREATE TABLE IF NOT EXISTS loyalty_giveaway_events (
        id ${database.primaryKeyAutoIncrementSql()},
        event_uid TEXT NOT NULL UNIQUE,
        giveaway_uid TEXT NOT NULL DEFAULT '',
        round_uid TEXT NOT NULL DEFAULT '',
        preset_uid TEXT NOT NULL DEFAULT '',
        spin_uid TEXT NOT NULL DEFAULT '',
        event_type TEXT NOT NULL DEFAULT '',
        actor_type TEXT NOT NULL DEFAULT '',
        actor_login TEXT NOT NULL DEFAULT '',
        old_status TEXT NOT NULL DEFAULT '',
        new_status TEXT NOT NULL DEFAULT '',
        message TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        metadata_json TEXT NOT NULL DEFAULT '{}'
      );
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_events_giveaway ON loyalty_giveaway_events(giveaway_uid);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_events_type ON loyalty_giveaway_events(event_type);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_events_created ON loyalty_giveaway_events(created_at);`);
  });


  // Safety-net for existing installations where schema version 1 already existed
  // before STEP LWG-4H introduced entries. Never drops or overwrites data.
  database.exec(`
    CREATE TABLE IF NOT EXISTS loyalty_giveaway_entries (
      id ${database.primaryKeyAutoIncrementSql()},
      entry_uid TEXT NOT NULL UNIQUE,
      giveaway_uid TEXT NOT NULL,
      round_uid TEXT NOT NULL DEFAULT '',
      user_login TEXT NOT NULL DEFAULT '',
      user_display_name TEXT NOT NULL DEFAULT '',
      ticket_count INTEGER NOT NULL DEFAULT 1,
      ticket_weight INTEGER NOT NULL DEFAULT 1,
      cost_amount INTEGER NOT NULL DEFAULT 0,
      cost_due INTEGER NOT NULL DEFAULT 0,
      cost_booked INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      cancelled_at TEXT NOT NULL DEFAULT '',
      metadata_json TEXT NOT NULL DEFAULT '{}'
    );
  `);

  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_entries_giveaway ON loyalty_giveaway_entries(giveaway_uid);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_entries_round ON loyalty_giveaway_entries(round_uid);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_entries_user ON loyalty_giveaway_entries(user_login);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_entries_status ON loyalty_giveaway_entries(status);`);



  // Safety-net for existing installations where schema version already existed
  // before STEP LWG-4I introduced winners. Never drops or overwrites data.
  database.exec(`
    CREATE TABLE IF NOT EXISTS loyalty_giveaway_winners (
      id ${database.primaryKeyAutoIncrementSql()},
      winner_uid TEXT NOT NULL UNIQUE,
      giveaway_uid TEXT NOT NULL,
      round_uid TEXT NOT NULL DEFAULT '',
      entry_uid TEXT NOT NULL DEFAULT '',
      user_login TEXT NOT NULL DEFAULT '',
      user_display_name TEXT NOT NULL DEFAULT '',
      draw_algorithm TEXT NOT NULL DEFAULT 'crypto.randomInt',
      eligible_entries_count INTEGER NOT NULL DEFAULT 0,
      total_ticket_weight INTEGER NOT NULL DEFAULT 0,
      ticket_position INTEGER NOT NULL DEFAULT 0,
      prize_uid TEXT NOT NULL DEFAULT '',
      prize_label TEXT NOT NULL DEFAULT '',
      wheel_required INTEGER NOT NULL DEFAULT 0,
      wheel_permission_uid TEXT NOT NULL DEFAULT '',
      wheel_spin_uid TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'drawn',
      created_at TEXT NOT NULL,
      metadata_json TEXT NOT NULL DEFAULT '{}'
    );
  `);

  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_winners_giveaway ON loyalty_giveaway_winners(giveaway_uid);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_winners_round ON loyalty_giveaway_winners(round_uid);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_winners_user ON loyalty_giveaway_winners(user_login);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_winners_status ON loyalty_giveaway_winners(status);`);



  // Safety-net for existing installations where schema version already existed
  // before STEP LWG-4J introduced wheel permissions. Never drops or overwrites data.
  database.exec(`
    CREATE TABLE IF NOT EXISTS loyalty_giveaway_wheel_permissions (
      id ${database.primaryKeyAutoIncrementSql()},
      permission_uid TEXT NOT NULL UNIQUE,
      giveaway_uid TEXT NOT NULL,
      round_uid TEXT NOT NULL DEFAULT '',
      winner_uid TEXT NOT NULL DEFAULT '',
      user_login TEXT NOT NULL DEFAULT '',
      user_display_name TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      expires_at TEXT NOT NULL DEFAULT '',
      used_at TEXT NOT NULL DEFAULT '',
      spin_uid TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      metadata_json TEXT NOT NULL DEFAULT '{}'
    );
  `);

  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_wheel_permissions_giveaway ON loyalty_giveaway_wheel_permissions(giveaway_uid);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_wheel_permissions_winner ON loyalty_giveaway_wheel_permissions(winner_uid);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_wheel_permissions_user ON loyalty_giveaway_wheel_permissions(user_login);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_wheel_permissions_status ON loyalty_giveaway_wheel_permissions(status);`);



  database.exec(`
    CREATE TABLE IF NOT EXISTS loyalty_giveaway_command_definitions (
      id ${database.primaryKeyAutoIncrementSql()},
      command_name TEXT NOT NULL UNIQUE,
      aliases_json TEXT NOT NULL DEFAULT '[]',
      action TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '',
      usage TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      metadata_json TEXT NOT NULL DEFAULT '{}'
    );
  `);

  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_command_definitions_action ON loyalty_giveaway_command_definitions(action);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_command_definitions_enabled ON loyalty_giveaway_command_definitions(enabled, active);`);


  database.exec(`
    CREATE TABLE IF NOT EXISTS loyalty_giveaway_bound_wheels (
      id ${database.primaryKeyAutoIncrementSql()},
      bound_wheel_uid TEXT NOT NULL UNIQUE,
      giveaway_uid TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      source_preset_uid TEXT NOT NULL DEFAULT '',
      scope TEXT NOT NULL DEFAULT 'giveaway',
      status TEXT NOT NULL DEFAULT 'draft',
      locked INTEGER NOT NULL DEFAULT 0,
      created_by TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      metadata_json TEXT NOT NULL DEFAULT '{}'
    );
  `);

  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_bound_wheels_giveaway ON loyalty_giveaway_bound_wheels(giveaway_uid);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_bound_wheels_source ON loyalty_giveaway_bound_wheels(source_preset_uid);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_bound_wheels_status ON loyalty_giveaway_bound_wheels(status);`);

  database.exec(`
    CREATE TABLE IF NOT EXISTS loyalty_giveaway_bound_wheel_fields (
      id ${database.primaryKeyAutoIncrementSql()},
      field_uid TEXT NOT NULL UNIQUE,
      bound_wheel_uid TEXT NOT NULL,
      giveaway_uid TEXT NOT NULL,
      source_preset_uid TEXT NOT NULL DEFAULT '',
      source_field_uid TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      label TEXT NOT NULL DEFAULT '',
      sub_label TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      weight INTEGER NOT NULL DEFAULT 1,
      quantity_total INTEGER NOT NULL DEFAULT 0,
      quantity_remaining INTEGER NOT NULL DEFAULT 0,
      remove_after_win INTEGER NOT NULL DEFAULT 0,
      reward_type TEXT NOT NULL DEFAULT 'none',
      reward_value TEXT NOT NULL DEFAULT '',
      color_a TEXT NOT NULL DEFAULT '',
      color_b TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT NOT NULL DEFAULT '',
      metadata_json TEXT NOT NULL DEFAULT '{}'
    );
  `);

  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_bound_wheel_fields_bound ON loyalty_giveaway_bound_wheel_fields(bound_wheel_uid);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_bound_wheel_fields_giveaway ON loyalty_giveaway_bound_wheel_fields(giveaway_uid);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_bound_wheel_fields_enabled ON loyalty_giveaway_bound_wheel_fields(enabled);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_giveaway_bound_wheel_fields_source ON loyalty_giveaway_bound_wheel_fields(source_preset_uid, source_field_uid);`);


  state.schemaReady = true;
  return true;
}

function normalizeBoundWheelName(title) {
  const clean = String(title || "").trim() || "Giveaway";
  return `${clean} – Glücksrad`;
}

function rowToBoundWheel(row) {
  if (!row) return null;
  return {
    id: row.id,
    boundWheelUid: row.bound_wheel_uid,
    giveawayUid: row.giveaway_uid,
    name: row.name || "",
    description: row.description || "",
    sourcePresetUid: row.source_preset_uid || "",
    scope: row.scope || "giveaway",
    status: row.status || BOUND_WHEEL_STATUS.DRAFT,
    locked: Number(row.locked || 0) === 1,
    createdBy: row.created_by || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    metadata: parseJson(row.metadata_json, {})
  };
}

function getBoundWheelRowByGiveaway(giveawayUid) {
  ensureSchema();
  const uidValue = String(giveawayUid || "").trim();
  if (!uidValue) return null;
  return database.get("SELECT * FROM loyalty_giveaway_bound_wheels WHERE giveaway_uid = :giveawayUid ORDER BY id DESC LIMIT 1", { giveawayUid: uidValue });
}

function getBoundWheelByGiveaway(giveawayUid) {
  return rowToBoundWheel(getBoundWheelRowByGiveaway(giveawayUid));
}

function databaseTableExists(tableName) {
  try {
    ensureSchema();
    const clean = String(tableName || "").trim();
    if (!clean) return false;
    const row = database.get("SELECT name FROM sqlite_master WHERE type = 'table' AND name = :name", { name: clean });
    return !!row;
  } catch (_) {
    return false;
  }
}

function rowToBoundWheelField(row) {
  if (!row) return null;
  const rewardType = row.reward_type || "none";
  const rewardValue = row.reward_value || "";
  return {
    id: row.id,
    fieldUid: row.field_uid,
    idForWheel: row.field_uid,
    boundWheelUid: row.bound_wheel_uid,
    giveawayUid: row.giveaway_uid,
    sourcePresetUid: row.source_preset_uid || "",
    sourceFieldUid: row.source_field_uid || "",
    sortOrder: Number(row.sort_order || 0),
    label: row.label || "",
    sub: row.sub_label || "",
    subLabel: row.sub_label || "",
    enabled: Number(row.enabled || 0) === 1,
    weight: Number(row.weight || 0),
    quantityTotal: Number(row.quantity_total || 0),
    quantityRemaining: Number(row.quantity_remaining || 0),
    removeAfterWin: Number(row.remove_after_win || 0) === 1,
    rewardType,
    rewardValue,
    reward: { type: rewardType, value: rewardValue },
    colorA: row.color_a || "",
    colorB: row.color_b || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    deletedAt: row.deleted_at || "",
    metadata: parseJson(row.metadata_json, {})
  };
}

function listBoundWheelFields(giveawayUid, options = {}) {
  ensureSchema();
  const boundWheel = getBoundWheelByGiveaway(giveawayUid);
  if (!boundWheel) return { ok: false, error: "bound_wheel_not_found", statusCode: 404, rows: [] };

  const includeDeleted = options.includeDeleted === true || String(options.includeDeleted || "") === "true";
  const where = ["bound_wheel_uid = :boundWheelUid"];
  const params = { boundWheelUid: boundWheel.boundWheelUid };
  if (!includeDeleted) where.push("deleted_at = ''");

  const rows = database.all(`
    SELECT *
    FROM loyalty_giveaway_bound_wheel_fields
    WHERE ${where.join(" AND ")}
    ORDER BY sort_order ASC, id ASC
  `, params).map(rowToBoundWheelField);

  return {
    ok: true,
    count: rows.length,
    fieldCount: rows.length,
    boundWheel,
    rows,
    fields: rows
  };
}

function getSourcePresetForBoundWheel(sourcePresetUid) {
  ensureSchema();
  const uidValue = String(sourcePresetUid || "").trim();
  if (!uidValue) return null;
  if (!databaseTableExists("loyalty_wheel_presets")) return null;
  const row = database.get("SELECT * FROM loyalty_wheel_presets WHERE preset_uid = :presetUid AND deleted_at = ''", { presetUid: uidValue });
  if (!row) return null;
  return {
    presetUid: row.preset_uid,
    name: row.name || "",
    description: row.description || "",
    presetType: row.preset_type || "standalone",
    status: row.status || "draft",
    minVisibleSlots: Number(row.min_visible_slots || 12),
    settings: parseJson(row.settings_json, {}),
    metadata: parseJson(row.metadata_json, {})
  };
}

function listSourcePresetFieldRows(sourcePresetUid) {
  ensureSchema();
  const uidValue = String(sourcePresetUid || "").trim();
  if (!uidValue) return [];
  if (!databaseTableExists("loyalty_wheel_fields")) return [];
  return database.all(`
    SELECT *
    FROM loyalty_wheel_fields
    WHERE preset_uid = :presetUid
      AND deleted_at = ''
    ORDER BY sort_order ASC, id ASC
  `, { presetUid: uidValue });
}

function copyPresetFieldsToBoundWheel(giveawayUid, input = {}) {
  ensureSchema();
  const boundWheel = getBoundWheelByGiveaway(giveawayUid);
  if (!boundWheel) return { ok: false, error: "bound_wheel_not_found", statusCode: 404 };

  const sourcePresetUid = String(input.sourcePresetUid || boundWheel.sourcePresetUid || "").trim();
  if (!sourcePresetUid) return { ok: true, copied: 0, skipped: true, reason: "missing_source_preset_uid", boundWheel };

  const existingCount = Number(database.get(`
    SELECT COUNT(*) AS count
    FROM loyalty_giveaway_bound_wheel_fields
    WHERE bound_wheel_uid = :boundWheelUid
      AND deleted_at = ''
  `, { boundWheelUid: boundWheel.boundWheelUid })?.count || 0);
  if (existingCount > 0 && input.force !== true) {
    return { ok: true, copied: 0, skipped: true, reason: "bound_wheel_fields_already_exist", existingCount, boundWheel };
  }

  const preset = getSourcePresetForBoundWheel(sourcePresetUid);
  if (!preset) return { ok: false, error: "source_preset_not_found", statusCode: 409, sourcePresetUid, boundWheel };

  const sourceFields = listSourcePresetFieldRows(sourcePresetUid);
  if (!sourceFields.length) return { ok: true, copied: 0, skipped: true, reason: "source_preset_has_no_fields", sourcePresetUid, boundWheel, preset };

  const now = nowIso();
  let copied = 0;
  sourceFields.forEach((field, index) => {
    const fieldUid = uid("gfield");
    const fieldMeta = parseJson(field.metadata_json, {});
    database.run(`
      INSERT INTO loyalty_giveaway_bound_wheel_fields (
        field_uid, bound_wheel_uid, giveaway_uid, source_preset_uid, source_field_uid,
        sort_order, label, sub_label, enabled, weight, quantity_total, quantity_remaining,
        remove_after_win, reward_type, reward_value, color_a, color_b,
        created_at, updated_at, metadata_json
      ) VALUES (
        :fieldUid, :boundWheelUid, :giveawayUid, :sourcePresetUid, :sourceFieldUid,
        :sortOrder, :label, :subLabel, :enabled, :weight, :quantityTotal, :quantityRemaining,
        :removeAfterWin, :rewardType, :rewardValue, :colorA, :colorB,
        :createdAt, :updatedAt, :metadataJson
      )
    `, {
      fieldUid,
      boundWheelUid: boundWheel.boundWheelUid,
      giveawayUid: boundWheel.giveawayUid,
      sourcePresetUid,
      sourceFieldUid: field.field_uid || "",
      sortOrder: Number(field.sort_order || index + 1),
      label: field.label || "Gewinn",
      subLabel: field.sub_label || "",
      enabled: Number(field.enabled || 0) === 1 ? 1 : 0,
      weight: clampInt(field.weight, 1, 1, 999999),
      quantityTotal: clampInt(field.quantity_total, 0, 0, 999999),
      quantityRemaining: clampInt(field.quantity_remaining, field.quantity_total || 0, 0, 999999),
      removeAfterWin: Number(field.remove_after_win || 0) === 1 ? 1 : 0,
      rewardType: field.reward_type || "none",
      rewardValue: field.reward_value || "",
      colorA: field.color_a || "",
      colorB: field.color_b || "",
      createdAt: now,
      updatedAt: now,
      metadataJson: json({
        ...fieldMeta,
        source: "giveaway_bound_wheel_field_snapshot",
        copiedAt: now,
        copiedBy: input.actor || "dashboard",
        copiedFromPresetUid: sourcePresetUid,
        copiedFromPresetName: preset.name || "",
        copiedFromFieldUid: field.field_uid || ""
      })
    });
    copied += 1;
  });

  const existingMeta = boundWheel.metadata && typeof boundWheel.metadata === "object" ? boundWheel.metadata : {};
  database.run(`
    UPDATE loyalty_giveaway_bound_wheels
    SET updated_at = :updatedAt,
        metadata_json = :metadataJson
    WHERE bound_wheel_uid = :boundWheelUid
  `, {
    boundWheelUid: boundWheel.boundWheelUid,
    updatedAt: now,
    metadataJson: json({
      ...existingMeta,
      sourcePresetUid,
      sourcePresetName: preset.name || "",
      sourcePresetStatus: preset.status || "",
      minVisibleSlots: preset.minVisibleSlots || 12,
      presetSettings: preset.settings || {},
      fieldsCopiedAt: now,
      fieldsCopiedBy: input.actor || "dashboard",
      fieldsCopiedCount: copied
    })
  });

  return {
    ok: true,
    copied,
    boundWheel: getBoundWheelByGiveaway(giveawayUid),
    preset,
    fields: listBoundWheelFields(giveawayUid).rows
  };
}

function assertBoundWheelEditable(giveawayUid) {
  const editable = assertDraftEditable(giveawayUid);
  if (!editable.ok) return editable;
  const boundWheel = getBoundWheelByGiveaway(giveawayUid);
  if (!boundWheel) return { ok: false, error: "bound_wheel_not_found", statusCode: 404 };
  if (boundWheel.locked || boundWheel.status !== BOUND_WHEEL_STATUS.DRAFT) {
    return { ok: false, error: "bound_wheel_not_editable", statusCode: 409, boundWheel };
  }
  return { ok: true, row: editable.row, boundWheel };
}

function nextBoundWheelFieldSortOrder(boundWheelUid) {
  const row = database.get(`
    SELECT COALESCE(MAX(sort_order), 0) + 1 AS nextSort
    FROM loyalty_giveaway_bound_wheel_fields
    WHERE bound_wheel_uid = :boundWheelUid
  `, { boundWheelUid });
  return Number(row && row.nextSort || 1);
}

function createBoundWheelField(giveawayUid, input = {}, options = {}) {
  ensureSchema();
  const editable = options.allowDuringCreate === true ? { ok: true, boundWheel: getBoundWheelByGiveaway(giveawayUid) } : assertBoundWheelEditable(giveawayUid);
  if (!editable.ok) return editable;
  const boundWheel = editable.boundWheel;
  if (!boundWheel) return { ok: false, error: "bound_wheel_not_found", statusCode: 404 };

  const now = nowIso();
  const fieldUid = input.fieldUid || uid("gfield");
  const total = clampInt(input.quantityTotal ?? input.quantity_total ?? input.quantity ?? 1, 1, 0, 999999);
  const remaining = clampInt(input.quantityRemaining ?? input.quantity_remaining ?? total, total, 0, 999999);
  const sortOrder = clampInt(input.sortOrder ?? input.sort_order ?? nextBoundWheelFieldSortOrder(boundWheel.boundWheelUid), 1, 0, 9999);
  const rewardType = String(input.rewardType || input.reward_type || input.reward?.type || "none").trim() || "none";
  const rewardValue = String(input.rewardValue || input.reward_value || input.reward?.value || input.reward?.amount || "").trim();

  database.run(`
    INSERT INTO loyalty_giveaway_bound_wheel_fields (
      field_uid, bound_wheel_uid, giveaway_uid, source_preset_uid, source_field_uid,
      sort_order, label, sub_label, enabled, weight, quantity_total, quantity_remaining,
      remove_after_win, reward_type, reward_value, color_a, color_b,
      created_at, updated_at, metadata_json
    ) VALUES (
      :fieldUid, :boundWheelUid, :giveawayUid, :sourcePresetUid, :sourceFieldUid,
      :sortOrder, :label, :subLabel, :enabled, :weight, :quantityTotal, :quantityRemaining,
      :removeAfterWin, :rewardType, :rewardValue, :colorA, :colorB,
      :createdAt, :updatedAt, :metadataJson
    )
  `, {
    fieldUid,
    boundWheelUid: boundWheel.boundWheelUid,
    giveawayUid: boundWheel.giveawayUid,
    sourcePresetUid: String(input.sourcePresetUid || boundWheel.sourcePresetUid || "").trim(),
    sourceFieldUid: String(input.sourceFieldUid || input.source_field_uid || "").trim(),
    sortOrder,
    label: String(input.label || "").trim() || "Gewinn",
    subLabel: String(input.subLabel || input.sub_label || input.sub || "").trim(),
    enabled: input.enabled === false ? 0 : 1,
    weight: clampInt(input.weight === undefined ? 1 : input.weight, 1, 1, 999999),
    quantityTotal: total,
    quantityRemaining: remaining,
    removeAfterWin: input.removeAfterWin === true || input.remove_after_win === true ? 1 : 0,
    rewardType,
    rewardValue,
    colorA: String(input.colorA || input.color_a || "").trim(),
    colorB: String(input.colorB || input.color_b || "").trim(),
    createdAt: now,
    updatedAt: now,
    metadataJson: json(input.metadata || { source: "dashboard" })
  });

  return { ok: true, field: rowToBoundWheelField(database.get("SELECT * FROM loyalty_giveaway_bound_wheel_fields WHERE field_uid = :fieldUid", { fieldUid })) };
}

function updateBoundWheelField(giveawayUid, fieldUid, patch = {}) {
  ensureSchema();
  const editable = assertBoundWheelEditable(giveawayUid);
  if (!editable.ok) return editable;
  const boundWheel = editable.boundWheel;
  const field = database.get(`
    SELECT *
    FROM loyalty_giveaway_bound_wheel_fields
    WHERE field_uid = :fieldUid
      AND bound_wheel_uid = :boundWheelUid
      AND deleted_at = ''
  `, { fieldUid, boundWheelUid: boundWheel.boundWheelUid });
  if (!field) return { ok: false, error: "bound_wheel_field_not_found", statusCode: 404 };

  const now = nowIso();
  const nextTotal = clampInt(patch.quantityTotal ?? patch.quantity_total ?? field.quantity_total, field.quantity_total, 0, 999999);
  const nextRemaining = clampInt(patch.quantityRemaining ?? patch.quantity_remaining ?? nextTotal, nextTotal, 0, 999999);
  const nextMeta = patch.metadata && typeof patch.metadata === "object" ? patch.metadata : parseJson(field.metadata_json, {});

  database.run(`
    UPDATE loyalty_giveaway_bound_wheel_fields
    SET sort_order = :sortOrder,
        label = :label,
        sub_label = :subLabel,
        enabled = :enabled,
        weight = :weight,
        quantity_total = :quantityTotal,
        quantity_remaining = :quantityRemaining,
        remove_after_win = :removeAfterWin,
        reward_type = :rewardType,
        reward_value = :rewardValue,
        color_a = :colorA,
        color_b = :colorB,
        updated_at = :updatedAt,
        metadata_json = :metadataJson
    WHERE field_uid = :fieldUid AND bound_wheel_uid = :boundWheelUid
  `, {
    fieldUid,
    boundWheelUid: boundWheel.boundWheelUid,
    sortOrder: clampInt(patch.sortOrder ?? patch.sort_order ?? field.sort_order, field.sort_order, 0, 9999),
    label: String(patch.label ?? field.label ?? "").trim() || "Gewinn",
    subLabel: String(patch.subLabel ?? patch.sub_label ?? patch.sub ?? field.sub_label ?? "").trim(),
    enabled: patch.enabled === undefined ? Number(field.enabled || 0) : (patch.enabled === false ? 0 : 1),
    weight: clampInt(patch.weight === undefined ? field.weight : patch.weight, field.weight, 1, 999999),
    quantityTotal: nextTotal,
    quantityRemaining: nextRemaining,
    removeAfterWin: patch.removeAfterWin === undefined && patch.remove_after_win === undefined ? Number(field.remove_after_win || 0) : (patch.removeAfterWin === true || patch.remove_after_win === true ? 1 : 0),
    rewardType: String(patch.rewardType || patch.reward_type || patch.reward?.type || field.reward_type || "none").trim() || "none",
    rewardValue: String(patch.rewardValue ?? patch.reward_value ?? patch.reward?.value ?? patch.reward?.amount ?? field.reward_value ?? "").trim(),
    colorA: String(patch.colorA ?? patch.color_a ?? field.color_a ?? "").trim(),
    colorB: String(patch.colorB ?? patch.color_b ?? field.color_b ?? "").trim(),
    updatedAt: now,
    metadataJson: json({ ...nextMeta, lastUpdatedAt: now, lastUpdatedBy: patch.actor || patch.updatedBy || "dashboard" })
  });

  return { ok: true, field: rowToBoundWheelField(database.get("SELECT * FROM loyalty_giveaway_bound_wheel_fields WHERE field_uid = :fieldUid", { fieldUid })) };
}

function deleteBoundWheelField(giveawayUid, fieldUid, input = {}) {
  ensureSchema();
  const editable = assertBoundWheelEditable(giveawayUid);
  if (!editable.ok) return editable;
  const boundWheel = editable.boundWheel;
  const field = database.get(`
    SELECT *
    FROM loyalty_giveaway_bound_wheel_fields
    WHERE field_uid = :fieldUid
      AND bound_wheel_uid = :boundWheelUid
      AND deleted_at = ''
  `, { fieldUid, boundWheelUid: boundWheel.boundWheelUid });
  if (!field) return { ok: false, error: "bound_wheel_field_not_found", statusCode: 404 };

  const now = nowIso();
  const meta = parseJson(field.metadata_json, {});
  database.run(`
    UPDATE loyalty_giveaway_bound_wheel_fields
    SET enabled = 0,
        deleted_at = :deletedAt,
        updated_at = :updatedAt,
        metadata_json = :metadataJson
    WHERE field_uid = :fieldUid AND bound_wheel_uid = :boundWheelUid
  `, {
    fieldUid,
    boundWheelUid: boundWheel.boundWheelUid,
    deletedAt: now,
    updatedAt: now,
    metadataJson: json({ ...meta, deletedAt: now, deletedBy: input.actor || "dashboard" })
  });

  return { ok: true, deleted: true, fieldUid, fields: listBoundWheelFields(giveawayUid).rows };
}


function boundWheelFieldToSpinField(field, index = 0) {
  const source = field && typeof field === "object" ? field : {};
  const fieldUid = String(source.fieldUid || source.field_uid || source.idForWheel || source.id || `gfield_${index + 1}`).trim() || `gfield_${index + 1}`;
  return {
    id: fieldUid,
    fieldUid,
    boundWheelUid: String(source.boundWheelUid || source.bound_wheel_uid || "").trim(),
    giveawayUid: String(source.giveawayUid || source.giveaway_uid || "").trim(),
    sourcePresetUid: String(source.sourcePresetUid || source.source_preset_uid || "").trim(),
    sourceFieldUid: String(source.sourceFieldUid || source.source_field_uid || "").trim(),
    label: String(source.label || "Gewinn").trim() || "Gewinn",
    sub: String(source.subLabel || source.sub || source.sub_label || "").trim(),
    enabled: source.enabled !== false,
    weight: clampInt(source.weight, 1, 1, 999999),
    quantityTotal: clampInt(source.quantityTotal ?? source.quantity_total ?? 0, 0, 0, 999999),
    quantityRemaining: clampInt(source.quantityRemaining ?? source.quantity_remaining ?? source.quantityTotal ?? source.quantity_total ?? 0, 0, 0, 999999),
    removeAfterWin: source.removeAfterWin === true || source.remove_after_win === true || source.remove_after_win === 1,
    reward: {
      type: String(source.rewardType || source.reward_type || source.reward?.type || "none").trim() || "none",
      value: String(source.rewardValue ?? source.reward_value ?? source.reward?.value ?? source.reward?.amount ?? "").trim()
    },
    colorA: String(source.colorA || source.color_a || "").trim(),
    colorB: String(source.colorB || source.color_b || "").trim(),
    metadata: source.metadata && typeof source.metadata === "object" ? { ...source.metadata } : {}
  };
}

function listUsableBoundWheelSpinFields(giveawayUid) {
  const fieldsResult = listBoundWheelFields(giveawayUid, { limit: 500 });
  if (!fieldsResult.ok) return fieldsResult;
  const rows = Array.isArray(fieldsResult.rows) ? fieldsResult.rows : [];
  const usableRows = rows.filter(field =>
    field &&
    field.enabled !== false &&
    !field.deletedAt &&
    String(field.label || "").trim() &&
    Number(field.weight || 0) > 0 &&
    (Number(field.quantityRemaining || 0) > 0 || Number(field.quantityTotal || 0) === 0)
  );
  return {
    ok: true,
    count: usableRows.length,
    rows: usableRows,
    fields: usableRows.map((field, index) => boundWheelFieldToSpinField(field, index)),
    boundWheel: fieldsResult.boundWheel || null
  };
}

function decrementBoundWheelFieldAfterSpin(giveawayUid, fieldUid, input = {}) {
  ensureSchema();
  const cleanGiveawayUid = String(giveawayUid || "").trim();
  const cleanFieldUid = String(fieldUid || "").trim();
  if (!cleanGiveawayUid || !cleanFieldUid) return { ok: true, changed: false, reason: "missing_field_uid" };

  const boundWheel = getBoundWheelByGiveaway(cleanGiveawayUid);
  if (!boundWheel) return { ok: false, error: "bound_wheel_not_found", statusCode: 404 };

  const field = database.get(`
    SELECT *
    FROM loyalty_giveaway_bound_wheel_fields
    WHERE field_uid = :fieldUid
      AND bound_wheel_uid = :boundWheelUid
      AND deleted_at = ''
  `, { fieldUid: cleanFieldUid, boundWheelUid: boundWheel.boundWheelUid });
  if (!field) return { ok: false, error: "bound_wheel_field_not_found", statusCode: 404 };

  const total = clampInt(field.quantity_total, 0, 0, 999999);
  const remaining = clampInt(field.quantity_remaining, total, 0, 999999);
  const removeAfterWin = Number(field.remove_after_win || 0) === 1;
  if (total <= 0 && !removeAfterWin) return { ok: true, changed: false, reason: "unlimited_field" };

  const nextRemaining = removeAfterWin ? 0 : Math.max(0, remaining - 1);
  const now = nowIso();
  const meta = parseJson(field.metadata_json, {});
  database.run(`
    UPDATE loyalty_giveaway_bound_wheel_fields
    SET quantity_remaining = :quantityRemaining,
        updated_at = :updatedAt,
        metadata_json = :metadataJson
    WHERE field_uid = :fieldUid
      AND bound_wheel_uid = :boundWheelUid
  `, {
    fieldUid: cleanFieldUid,
    boundWheelUid: boundWheel.boundWheelUid,
    quantityRemaining: nextRemaining,
    updatedAt: now,
    metadataJson: json({
      ...meta,
      lastWonAt: now,
      lastSpinUid: input.spinUid || "",
      lastSessionUid: input.sessionUid || "",
      lastWinnerUid: input.winnerUid || "",
      lastPermissionUid: input.permissionUid || ""
    })
  });

  return { ok: true, changed: true, fieldUid: cleanFieldUid, previousRemaining: remaining, quantityRemaining: nextRemaining };
}


function getUsableBoundWheelForGiveaway(giveaway, options = {}) {
  ensureSchema();
  if (!giveaway || !giveaway.giveawayUid) {
    return { ok: false, error: "giveaway_not_found", statusCode: 404 };
  }
  if (giveaway.wheelEnabled !== true) {
    return { ok: false, error: "giveaway_not_wheel_enabled", statusCode: 409 };
  }

  const expectedBoundWheelUid = String(giveaway.wheelSnapshotUid || "").trim();
  if (!expectedBoundWheelUid) {
    return { ok: false, error: "wheel_giveaway_missing_bound_wheel", statusCode: 409 };
  }

  const row = getBoundWheelRowByGiveaway(giveaway.giveawayUid);
  if (!row) {
    return { ok: false, error: "bound_wheel_not_found", statusCode: 409, wheelSnapshotUid: expectedBoundWheelUid };
  }
  if (String(row.bound_wheel_uid || "").trim() !== expectedBoundWheelUid) {
    return {
      ok: false,
      error: "bound_wheel_snapshot_mismatch",
      statusCode: 409,
      wheelSnapshotUid: expectedBoundWheelUid,
      boundWheelUid: row.bound_wheel_uid || ""
    };
  }
  if (String(row.giveaway_uid || "").trim() !== String(giveaway.giveawayUid || "").trim()) {
    return { ok: false, error: "bound_wheel_giveaway_mismatch", statusCode: 409 };
  }
  if (String(row.scope || "giveaway").trim() !== "giveaway") {
    return { ok: false, error: "bound_wheel_invalid_scope", statusCode: 409, scope: row.scope || "" };
  }

  const sourcePresetUid = String(row.source_preset_uid || giveaway.wheelPresetUid || "").trim();

  const status = String(row.status || BOUND_WHEEL_STATUS.DRAFT).trim();
  const requireActive = options.requireActive === true;
  if (requireActive && status !== BOUND_WHEEL_STATUS.ACTIVE) {
    return { ok: false, error: "bound_wheel_not_active", statusCode: 409, status };
  }

  const spinFieldsResult = listUsableBoundWheelSpinFields(giveaway.giveawayUid);
  if (!spinFieldsResult.ok) return spinFieldsResult;
  if (!spinFieldsResult.fields.length) {
    return { ok: false, error: "bound_wheel_no_usable_fields", statusCode: 409, boundWheel: rowToBoundWheel(row) };
  }

  const boundWheel = rowToBoundWheel(row);
  const meta = boundWheel && boundWheel.metadata && typeof boundWheel.metadata === "object" ? boundWheel.metadata : {};
  const minVisibleSlots = clampInt(meta.minVisibleSlots || meta.min_visible_slots || 12, 12, 1, 96);

  return {
    ok: true,
    boundWheel,
    boundWheelUid: row.bound_wheel_uid,
    sourcePresetUid,
    minVisibleSlots,
    fields: spinFieldsResult.fields,
    fieldCount: spinFieldsResult.fields.length,
    status
  };
}

function activateBoundWheelForGiveawayRow(row, input = {}) {
  ensureSchema();
  if (!row) return { ok: false, error: "giveaway_not_found", statusCode: 404 };
  if (Number(row.wheel_enabled || 0) !== 1) {
    return { ok: true, skipped: true, reason: "giveaway_not_wheel_enabled" };
  }

  const giveaway = rowToGiveaway(row, false);
  const check = getUsableBoundWheelForGiveaway(giveaway, { requireActive: false });
  if (!check.ok) return check;

  const current = check.boundWheel;
  if (current.status === BOUND_WHEEL_STATUS.ACTIVE && current.locked === true) {
    return { ok: true, changed: false, boundWheel: current };
  }

  const now = nowIso();
  const metadata = current.metadata && typeof current.metadata === "object" ? current.metadata : {};
  database.run(`
    UPDATE loyalty_giveaway_bound_wheels
    SET status = :status,
        locked = 1,
        updated_at = :updatedAt,
        metadata_json = :metadataJson
    WHERE bound_wheel_uid = :boundWheelUid
  `, {
    boundWheelUid: current.boundWheelUid,
    status: BOUND_WHEEL_STATUS.ACTIVE,
    updatedAt: now,
    metadataJson: json({
      ...metadata,
      source: "giveaway_bound_wheel",
      scope: "giveaway",
      activatedAt: now,
      activatedBy: input.actor || input.updatedBy || input.createdBy || "dashboard",
      activationReason: input.reason || "giveaway_opened",
      sourcePresetUid: check.sourcePresetUid
    })
  });

  return { ok: true, changed: true, boundWheel: getBoundWheelByGiveaway(row.giveaway_uid) };
}

function createOrUpdateBoundWheelForGiveaway(giveawayUid, input = {}) {
  ensureSchema();
  const uidValue = String(giveawayUid || "").trim();
  if (!uidValue) return { ok: false, error: "missing_giveaway_uid", statusCode: 400 };

  const now = nowIso();
  const title = String(input.title || input.giveawayTitle || "").trim() || "Giveaway";
  const sourcePresetUid = String(input.sourcePresetUid || input.wheelPresetUid || input.wheel_preset_uid || "").trim();
  const name = String(input.name || input.boundWheelName || "").trim() || normalizeBoundWheelName(title);
  const description = String(input.description || "").trim();
  const actor = String(input.actor || input.createdBy || input.updatedBy || "").trim();
  const existing = getBoundWheelRowByGiveaway(uidValue);
  const metadataPatch = input.metadata && typeof input.metadata === "object" ? input.metadata : {};

  if (existing) {
    const existingMeta = parseJson(existing.metadata_json, {});
    database.run(`
      UPDATE loyalty_giveaway_bound_wheels
      SET name = :name,
          description = :description,
          source_preset_uid = :sourcePresetUid,
          status = :status,
          updated_at = :updatedAt,
          metadata_json = :metadataJson
      WHERE bound_wheel_uid = :boundWheelUid
    `, {
      boundWheelUid: existing.bound_wheel_uid,
      name,
      description: description || existing.description || "",
      sourcePresetUid: sourcePresetUid || existing.source_preset_uid || "",
      status: input.status || existing.status || BOUND_WHEEL_STATUS.DRAFT,
      updatedAt: now,
      metadataJson: json({ ...existingMeta, ...metadataPatch, source: "giveaway_bound_wheel", lastUpdatedAt: now, lastUpdatedBy: actor })
    });
    const copyResult = copyPresetFieldsToBoundWheel(uidValue, { sourcePresetUid: sourcePresetUid || existing.source_preset_uid || "", actor });
    return { ok: true, created: false, boundWheel: getBoundWheelByGiveaway(uidValue), fieldSnapshot: copyResult };
  }

  const boundWheelUid = input.boundWheelUid || input.wheelSnapshotUid || input.wheel_snapshot_uid || uid("giveawaywheel");
  database.run(`
    INSERT INTO loyalty_giveaway_bound_wheels (
      bound_wheel_uid, giveaway_uid, name, description, source_preset_uid,
      scope, status, locked, created_by, created_at, updated_at, metadata_json
    ) VALUES (
      :boundWheelUid, :giveawayUid, :name, :description, :sourcePresetUid,
      'giveaway', :status, :locked, :createdBy, :createdAt, :updatedAt, :metadataJson
    )
  `, {
    boundWheelUid,
    giveawayUid: uidValue,
    name,
    description,
    sourcePresetUid,
    status: input.status || BOUND_WHEEL_STATUS.DRAFT,
    locked: input.locked === true ? 1 : 0,
    createdBy: actor,
    createdAt: now,
    updatedAt: now,
    metadataJson: json({ ...metadataPatch, source: "giveaway_bound_wheel", scope: "giveaway", linkedGiveawayUid: uidValue, sourcePresetUid })
  });
  const copyResult = copyPresetFieldsToBoundWheel(uidValue, { sourcePresetUid, actor });
  return { ok: true, created: true, boundWheel: getBoundWheelByGiveaway(uidValue), fieldSnapshot: copyResult };
}

function rowToGiveaway(row, includeDetails = false) {
  if (!row) return null;
  const giveaway = {
    id: row.id,
    giveawayUid: row.giveaway_uid,
    title: row.title || "",
    description: row.description || "",
    status: row.status || STATUS.DRAFT,
    mode: row.mode || MODES.CLASSIC_SINGLE,
    wheelEnabled: Number(row.wheel_enabled || 0) === 1,
    wheelPresetUid: row.wheel_preset_uid || "",
    wheelSnapshotUid: row.wheel_snapshot_uid || "",
    costAmount: Number(row.cost_amount || 0),
    currencyKey: row.currency_key || "loyalty_points",
    maxTicketsPerUser: Number(row.max_tickets_per_user || 1),
    firstTicketFree: Number(row.first_ticket_free || 0) === 1,
    subOnly: Number(row.sub_only || 0) === 1,
    subscriberLuckMultiplier: Number(row.subscriber_luck_multiplier || 1),
    winnerCount: Number(row.winner_count || 1),
    roundPolicy: parseJson(row.round_policy_json, {}),
    settingsSnapshot: parseJson(row.settings_snapshot_json, {}),
    copiedFromGiveawayUid: row.copied_from_giveaway_uid || "",
    createdBy: row.created_by || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    openedAt: row.opened_at || "",
    entriesClosedAt: row.entries_closed_at || "",
    finishedAt: row.finished_at || "",
    cancelledAt: row.cancelled_at || "",
    deletedAt: row.deleted_at || "",
    metadata: parseJson(row.metadata_json, {}),
    editable: isGiveawayEditableRow(row)
  };

  const setup = evaluateGiveawaySetupRow(row);
  giveaway.setupComplete = setup.setupComplete;
  giveaway.setupState = setup.setupState;
  giveaway.canOpen = setup.canOpen;
  giveaway.setupIssues = setup.setupIssues;

  if (includeDetails) {
    giveaway.rounds = listRounds(row.giveaway_uid).rows;
    giveaway.prizes = listPrizes(row.giveaway_uid).rows;
    giveaway.entries = listEntries(row.giveaway_uid, { limit: 250, includeCancelled: true }).rows;
    giveaway.winners = listWinners(row.giveaway_uid, { limit: 100 }).rows;
    giveaway.wheelPermissions = listWheelPermissions(row.giveaway_uid, { limit: 100 }).rows;
    giveaway.boundWheel = getBoundWheelByGiveaway(row.giveaway_uid);
    giveaway.boundWheelFields = giveaway.boundWheel ? listBoundWheelFields(row.giveaway_uid, { limit: 250 }).rows : [];
    giveaway.events = listEvents(row.giveaway_uid, { limit: 100 }).rows;
  }

  return giveaway;
}

function rowToRound(row) {
  if (!row) return null;
  return {
    id: row.id,
    roundUid: row.round_uid,
    giveawayUid: row.giveaway_uid,
    roundNumber: Number(row.round_number || 1),
    status: row.status || STATUS.DRAFT,
    entryPolicySnapshot: parseJson(row.entry_policy_snapshot_json, {}),
    prizePoolSnapshot: parseJson(row.prize_pool_snapshot_json, {}),
    eligibleEntriesCount: Number(row.eligible_entries_count || 0),
    totalTicketWeight: Number(row.total_ticket_weight || 0),
    winnerUid: row.winner_uid || "",
    createdAt: row.created_at || "",
    openedAt: row.opened_at || "",
    closedAt: row.closed_at || "",
    drawnAt: row.drawn_at || "",
    completedAt: row.completed_at || "",
    metadata: parseJson(row.metadata_json, {})
  };
}

function rowToPrize(row) {
  if (!row) return null;
  return {
    id: row.id,
    prizeUid: row.prize_uid,
    giveawayUid: row.giveaway_uid,
    roundUid: row.round_uid || "",
    label: row.label || "",
    description: row.description || "",
    quantityTotal: Number(row.quantity_total || 1),
    quantityRemaining: Number(row.quantity_remaining || 1),
    status: row.status || "available",
    sourcePresetUid: row.source_preset_uid || "",
    sourceFieldUid: row.source_field_uid || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    metadata: parseJson(row.metadata_json, {})
  };
}


function rowToEntry(row) {
  if (!row) return null;
  return {
    id: row.id,
    entryUid: row.entry_uid,
    giveawayUid: row.giveaway_uid,
    roundUid: row.round_uid || "",
    userLogin: row.user_login || "",
    userDisplayName: row.user_display_name || row.user_login || "",
    ticketCount: Number(row.ticket_count || 1),
    ticketWeight: Number(row.ticket_weight || 1),
    costAmount: Number(row.cost_amount || 0),
    costDue: Number(row.cost_due || 0),
    costBooked: Number(row.cost_booked || 0),
    source: row.source || "",
    status: row.status || "active",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    cancelledAt: row.cancelled_at || "",
    metadata: parseJson(row.metadata_json, {})
  };
}


function rowToWinner(row) {
  if (!row) return null;
  return {
    id: row.id,
    winnerUid: row.winner_uid,
    giveawayUid: row.giveaway_uid,
    roundUid: row.round_uid || "",
    entryUid: row.entry_uid || "",
    userLogin: row.user_login || "",
    userDisplayName: row.user_display_name || row.user_login || "",
    drawAlgorithm: row.draw_algorithm || "crypto.randomInt",
    eligibleEntriesCount: Number(row.eligible_entries_count || 0),
    totalTicketWeight: Number(row.total_ticket_weight || 0),
    ticketPosition: Number(row.ticket_position || 0),
    prizeUid: row.prize_uid || "",
    prizeLabel: row.prize_label || "",
    wheelRequired: Number(row.wheel_required || 0) === 1,
    wheelPermissionUid: row.wheel_permission_uid || "",
    wheelSpinUid: row.wheel_spin_uid || "",
    status: row.status || "drawn",
    createdAt: row.created_at || "",
    metadata: parseJson(row.metadata_json, {})
  };
}


function rowToWheelPermission(row) {
  if (!row) return null;
  return {
    id: row.id,
    permissionUid: row.permission_uid,
    giveawayUid: row.giveaway_uid,
    roundUid: row.round_uid || "",
    winnerUid: row.winner_uid || "",
    userLogin: row.user_login || "",
    userDisplayName: row.user_display_name || row.user_login || "",
    status: row.status || "pending",
    expiresAt: row.expires_at || "",
    usedAt: row.used_at || "",
    spinUid: row.spin_uid || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    metadata: parseJson(row.metadata_json, {})
  };
}

function rowToEvent(row) {
  if (!row) return null;
  return {
    id: row.id,
    eventUid: row.event_uid,
    giveawayUid: row.giveaway_uid || "",
    roundUid: row.round_uid || "",
    presetUid: row.preset_uid || "",
    spinUid: row.spin_uid || "",
    eventType: row.event_type || "",
    actorType: row.actor_type || "",
    actorLogin: row.actor_login || "",
    oldStatus: row.old_status || "",
    newStatus: row.new_status || "",
    message: row.message || "",
    createdAt: row.created_at || "",
    metadata: parseJson(row.metadata_json, {})
  };
}

function isGiveawayEditableRow(row) {
  if (!row) return false;
  if (row.deleted_at) return false;
  return row.status === STATUS.DRAFT;
}

function isWheelGiveawayMode(mode) {
  const clean = cleanMode(mode, MODES.CLASSIC_SINGLE);
  return clean === MODES.WHEEL_SINGLE || clean === MODES.WHEEL_MULTI;
}

function setupIssue(code, message, field = "", severity = "error") {
  return {
    code: String(code || "setup_issue"),
    message: String(message || "Pflichtangabe fehlt."),
    field: String(field || ""),
    severity: String(severity || "error")
  };
}

function evaluateGiveawaySetupRow(row) {
  if (!row) {
    return {
      setupComplete: false,
      setupState: "incomplete",
      canOpen: false,
      setupIssues: [setupIssue("giveaway_not_found", "Giveaway wurde nicht gefunden.")]
    };
  }

  const issues = [];
  const mode = cleanMode(row.mode, MODES.CLASSIC_SINGLE);
  const wheelMode = isWheelGiveawayMode(mode) || Number(row.wheel_enabled || 0) === 1;
  const title = String(row.title || "").trim();
  const winnerCount = clampInt(row.winner_count, 0, 0, 999999);
  const maxTicketsPerUser = clampInt(row.max_tickets_per_user, 0, 0, 999999);
  const costAmount = clampInt(row.cost_amount, 0, 0, 2147483647);

  if (!title) issues.push(setupIssue("giveaway_title_required", "Titel fehlt.", "title"));
  if (!Object.values(MODES).includes(mode)) issues.push(setupIssue("giveaway_mode_invalid", "Modus ist ungültig.", "mode"));
  if (winnerCount < 1) issues.push(setupIssue("giveaway_winner_count_invalid", "Gewinneranzahl muss mindestens 1 sein.", "winnerCount"));
  if (maxTicketsPerUser < 1) issues.push(setupIssue("giveaway_max_tickets_invalid", "Max. Tickets pro User muss mindestens 1 sein.", "maxTicketsPerUser"));
  if (costAmount < 0) issues.push(setupIssue("giveaway_cost_invalid", "Kosten dürfen nicht negativ sein.", "costAmount"));

  const prizes = listPrizes(row.giveaway_uid).rows || [];
  const availablePrizes = prizes.filter(prize =>
    String(prize.status || "available") !== "deleted" &&
    Number(prize.quantityTotal || 0) >= 1 &&
    String(prize.label || "").trim()
  );
  if (!availablePrizes.length) {
    issues.push(setupIssue("giveaway_prize_required", "Mindestens ein gültiger Gewinn fehlt.", "prizes"));
  }

  if (wheelMode) {
    const wheelPresetUid = String(row.wheel_preset_uid || "").trim();
    const wheelSnapshotUid = String(row.wheel_snapshot_uid || "").trim();
    const boundWheel = getBoundWheelByGiveaway(row.giveaway_uid);
    const fields = boundWheel ? listBoundWheelFields(row.giveaway_uid, { limit: 500 }).rows : [];
    const usableFields = fields.filter(field =>
      field &&
      field.enabled === true &&
      !field.deletedAt &&
      String(field.label || "").trim() &&
      Number(field.weight || 0) > 0 &&
      (Number(field.quantityRemaining || 0) > 0 || Number(field.quantityTotal || 0) === 0)
    );

    if (!wheelPresetUid && !boundWheel) {
      issues.push(setupIssue("giveaway_wheel_required", "Glücksrad fehlt.", "wheelPresetUid"));
    }
    if (!wheelSnapshotUid || !boundWheel) {
      issues.push(setupIssue("giveaway_bound_wheel_required", "Gebundenes Giveaway-Glücksrad fehlt.", "wheelSnapshotUid"));
    }
    if (boundWheel && !usableFields.length) {
      issues.push(setupIssue("giveaway_wheel_fields_required", "Bitte füge dem Glücksrad mindestens ein gültiges Feld hinzu.", "wheelFields"));
    }
  }

  const blockingIssues = issues.filter(issue => issue.severity !== "warning");
  return {
    setupComplete: blockingIssues.length === 0,
    setupState: blockingIssues.length === 0 ? "complete" : "incomplete",
    canOpen: blockingIssues.length === 0,
    setupIssues: issues
  };
}

function getGiveawayRow(giveawayUid) {
  ensureSchema();
  const uid = String(giveawayUid || "").trim();
  if (!uid) return null;
  return database.get("SELECT * FROM loyalty_giveaways WHERE giveaway_uid = :uid", { uid });
}

function getGiveaway(giveawayUid, includeDetails = true) {
  return rowToGiveaway(getGiveawayRow(giveawayUid), includeDetails);
}

function listGiveaways(options = {}) {
  ensureSchema();
  const limit = Math.max(1, Math.min(250, Number(options.limit || 100) || 100));
  const includeDeleted = options.includeDeleted === true || String(options.includeDeleted || "") === "true";
  const status = String(options.status || "").trim();
  const query = String(options.query || options.q || "").trim();
  const dateFrom = String(options.dateFrom || options.from || "").trim();
  const dateTo = String(options.dateTo || options.to || "").trim();

  const where = [];
  const params = { limit };

  if (!includeDeleted) where.push("deleted_at = ''");
  if (status) { where.push("status = :status"); params.status = status; }
  if (query) { where.push("(title LIKE :query OR giveaway_uid LIKE :query)"); params.query = `%${query}%`; }
  if (dateFrom) { where.push("created_at >= :dateFrom"); params.dateFrom = dateFrom; }
  if (dateTo) { where.push("created_at <= :dateTo"); params.dateTo = dateTo; }

  const list = database.all(`
    SELECT *
    FROM loyalty_giveaways
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY id DESC
    LIMIT :limit
  `, params).map(row => rowToGiveaway(row, false));

  return { ok: true, count: list.length, rows: list };
}

function createEvent(input = {}) {
  ensureSchema();
  const eventUid = input.eventUid || uid("gev");
  const createdAt = nowIso();
  database.run(`
    INSERT INTO loyalty_giveaway_events (
      event_uid, giveaway_uid, round_uid, preset_uid, spin_uid, event_type,
      actor_type, actor_login, old_status, new_status, message, created_at, metadata_json
    ) VALUES (
      :eventUid, :giveawayUid, :roundUid, :presetUid, :spinUid, :eventType,
      :actorType, :actorLogin, :oldStatus, :newStatus, :message, :createdAt, :metadataJson
    )
  `, {
    eventUid,
    giveawayUid: input.giveawayUid || "",
    roundUid: input.roundUid || "",
    presetUid: input.presetUid || "",
    spinUid: input.spinUid || "",
    eventType: input.eventType || "",
    actorType: input.actorType || "system",
    actorLogin: input.actorLogin || "",
    oldStatus: input.oldStatus || "",
    newStatus: input.newStatus || "",
    message: input.message || "",
    createdAt,
    metadataJson: json(input.metadata || {})
  });
  return rowToEvent(database.get("SELECT * FROM loyalty_giveaway_events WHERE event_uid = :eventUid", { eventUid }));
}

function createRound(giveawayUid, input = {}) {
  ensureSchema();
  const roundUid = input.roundUid || uid("round");
  const now = nowIso();
  const roundNumber = clampInt(input.roundNumber || 1, 1, 1, 9999);

  database.run(`
    INSERT INTO loyalty_giveaway_rounds (
      round_uid, giveaway_uid, round_number, status, entry_policy_snapshot_json,
      prize_pool_snapshot_json, eligible_entries_count, total_ticket_weight,
      winner_uid, created_at, opened_at, metadata_json
    ) VALUES (
      :roundUid, :giveawayUid, :roundNumber, :status, :entryPolicySnapshotJson,
      :prizePoolSnapshotJson, :eligibleEntriesCount, :totalTicketWeight,
      :winnerUid, :createdAt, :openedAt, :metadataJson
    )
  `, {
    roundUid,
    giveawayUid,
    roundNumber,
    status: cleanStatus(input.status, STATUS.DRAFT),
    entryPolicySnapshotJson: json(input.entryPolicySnapshot || {}),
    prizePoolSnapshotJson: json(input.prizePoolSnapshot || {}),
    eligibleEntriesCount: Number(input.eligibleEntriesCount || 0),
    totalTicketWeight: Number(input.totalTicketWeight || 0),
    winnerUid: input.winnerUid || "",
    createdAt: now,
    openedAt: input.openedAt || "",
    metadataJson: json(input.metadata || {})
  });

  return rowToRound(database.get("SELECT * FROM loyalty_giveaway_rounds WHERE round_uid = :roundUid", { roundUid }));
}

function createPrize(giveawayUid, input = {}) {
  ensureSchema();
  const prizeUid = input.prizeUid || uid("prize");
  const now = nowIso();
  const total = clampInt(input.quantityTotal ?? input.quantity_total ?? input.quantity ?? 1, 1, 1, 999999);

  database.run(`
    INSERT INTO loyalty_giveaway_prizes (
      prize_uid, giveaway_uid, round_uid, label, description,
      quantity_total, quantity_remaining, status, source_preset_uid,
      source_field_uid, created_at, updated_at, metadata_json
    ) VALUES (
      :prizeUid, :giveawayUid, :roundUid, :label, :description,
      :quantityTotal, :quantityRemaining, :status, :sourcePresetUid,
      :sourceFieldUid, :createdAt, :updatedAt, :metadataJson
    )
  `, {
    prizeUid,
    giveawayUid,
    roundUid: input.roundUid || "",
    label: String(input.label || "Gewinn").trim() || "Gewinn",
    description: String(input.description || "").trim(),
    quantityTotal: total,
    quantityRemaining: total,
    status: String(input.status || "available").trim() || "available",
    sourcePresetUid: input.sourcePresetUid || input.source_preset_uid || "",
    sourceFieldUid: input.sourceFieldUid || input.source_field_uid || "",
    createdAt: now,
    updatedAt: now,
    metadataJson: json(input.metadata || {})
  });

  return rowToPrize(database.get("SELECT * FROM loyalty_giveaway_prizes WHERE prize_uid = :prizeUid", { prizeUid }));
}

function listRounds(giveawayUid) {
  ensureSchema();
  const rows = database.all(`
    SELECT *
    FROM loyalty_giveaway_rounds
    WHERE giveaway_uid = :giveawayUid
    ORDER BY round_number ASC, id ASC
  `, { giveawayUid }).map(rowToRound);
  return { ok: true, count: rows.length, rows };
}

function listPrizes(giveawayUid) {
  ensureSchema();
  const rows = database.all(`
    SELECT *
    FROM loyalty_giveaway_prizes
    WHERE giveaway_uid = :giveawayUid
    ORDER BY id ASC
  `, { giveawayUid }).map(rowToPrize);
  return { ok: true, count: rows.length, rows };
}

function listEvents(giveawayUid, options = {}) {
  ensureSchema();
  const limit = Math.max(1, Math.min(500, Number(options.limit || 100) || 100));
  const rows = database.all(`
    SELECT *
    FROM loyalty_giveaway_events
    WHERE giveaway_uid = :giveawayUid
    ORDER BY id DESC
    LIMIT :limit
  `, { giveawayUid, limit }).map(rowToEvent);
  return { ok: true, count: rows.length, rows };
}

function getCurrentRound(giveawayUid) {
  ensureSchema();
  const row = database.get(`
    SELECT *
    FROM loyalty_giveaway_rounds
    WHERE giveaway_uid = :giveawayUid
    ORDER BY round_number DESC, id DESC
    LIMIT 1
  `, { giveawayUid });
  return rowToRound(row);
}

function listEntries(giveawayUid, options = {}) {
  ensureSchema();
  const limit = Math.max(1, Math.min(500, Number(options.limit || 100) || 100));
  const includeCancelled = options.includeCancelled === true || String(options.includeCancelled || "") === "true";
  const userLogin = String(options.userLogin || options.login || "").trim().replace(/^@/, "").toLowerCase();

  const where = ["giveaway_uid = :giveawayUid"];
  const params = { giveawayUid, limit };
  if (!includeCancelled) where.push("status != 'cancelled'");
  if (userLogin) {
    where.push("user_login = :userLogin");
    params.userLogin = userLogin;
  }

  const rows = database.all(`
    SELECT *
    FROM loyalty_giveaway_entries
    WHERE ${where.join(" AND ")}
    ORDER BY id DESC
    LIMIT :limit
  `, params).map(rowToEntry);

  return { ok: true, count: rows.length, rows };
}

function activeTicketCountForUser(giveawayUid, userLogin) {
  ensureSchema();
  const row = database.get(`
    SELECT COALESCE(SUM(ticket_count), 0) AS count
    FROM loyalty_giveaway_entries
    WHERE giveaway_uid = :giveawayUid
      AND user_login = :userLogin
      AND status = 'active'
  `, { giveawayUid, userLogin });
  return Number(row && row.count || 0);
}

function computeTicketCost(giveaway, userLogin, ticketCount) {
  const already = activeTicketCountForUser(giveaway.giveawayUid, userLogin);
  const costPerTicket = Number(giveaway.costAmount || 0);
  let paidTickets = Number(ticketCount || 0);

  if (giveaway.firstTicketFree && already <= 0 && paidTickets > 0) {
    paidTickets -= 1;
  }

  return {
    alreadyTickets: already,
    paidTickets: Math.max(0, paidTickets),
    costPerTicket,
    costDue: Math.max(0, paidTickets) * costPerTicket,
    note: "LWG-4L.5 erlaubt kostenlose Chat-Tickets, bucht aber weiterhin keine Punkte."
  };
}

function createEntry(giveawayUid, input = {}) {
  ensureSchema();
  const giveaway = getGiveaway(giveawayUid, false);
  if (!giveaway) return { ok: false, error: "giveaway_not_found", statusCode: 404 };
  if (giveaway.deletedAt) return { ok: false, error: "giveaway_deleted", statusCode: 409 };
  if (giveaway.status !== STATUS.OPEN) return { ok: false, error: "giveaway_not_open", statusCode: 409, giveaway };

  const userLogin = String(input.userLogin || input.login || input.user || "").trim().replace(/^@/, "").toLowerCase();
  if (!userLogin) return { ok: false, error: "missing_user_login", statusCode: 400 };

  const userDisplayName = String(input.userDisplayName || input.displayName || input.display || userLogin).trim() || userLogin;
  const ticketCount = clampInt(input.ticketCount ?? input.tickets, 1, 1, 999999);
  const isSubscriber = input.isSubscriber === true || input.subscriber === true || input.isSub === true;
  const source = String(input.source || "dashboard").trim() || "dashboard";

  if (giveaway.subOnly && !isSubscriber) {
    return { ok: false, error: "giveaway_sub_only", statusCode: 403 };
  }

  const alreadyTickets = activeTicketCountForUser(giveawayUid, userLogin);
  if (alreadyTickets + ticketCount > giveaway.maxTicketsPerUser) {
    return {
      ok: false,
      error: "giveaway_max_tickets_reached",
      statusCode: 409,
      maxTicketsPerUser: giveaway.maxTicketsPerUser,
      alreadyTickets,
      requestedTickets: ticketCount
    };
  }

  const currentRound = getCurrentRound(giveawayUid);
  const cost = computeTicketCost(giveaway, userLogin, ticketCount);
  const multiplier = isSubscriber ? Math.max(1, Number(giveaway.subscriberLuckMultiplier || 1)) : 1;
  const ticketWeight = ticketCount * multiplier;
  const entryUid = uid("entry");
  const now = nowIso();

  database.run(`
    INSERT INTO loyalty_giveaway_entries (
      entry_uid, giveaway_uid, round_uid, user_login, user_display_name,
      ticket_count, ticket_weight, cost_amount, cost_due, cost_booked,
      source, status, created_at, updated_at, metadata_json
    ) VALUES (
      :entryUid, :giveawayUid, :roundUid, :userLogin, :userDisplayName,
      :ticketCount, :ticketWeight, :costAmount, :costDue, :costBooked,
      :source, :status, :createdAt, :updatedAt, :metadataJson
    )
  `, {
    entryUid,
    giveawayUid,
    roundUid: currentRound ? currentRound.roundUid : "",
    userLogin,
    userDisplayName,
    ticketCount,
    ticketWeight,
    costAmount: giveaway.costAmount,
    costDue: cost.costDue,
    costBooked: 0,
    source,
    status: "active",
    createdAt: now,
    updatedAt: now,
    metadataJson: json({
      isSubscriber,
      subscriberLuckMultiplier: multiplier,
      cost,
      note: "Kosten werden in LWG-4H noch nicht gebucht."
    })
  });

  createEvent({
    giveawayUid,
    roundUid: currentRound ? currentRound.roundUid : "",
    eventType: "loyalty.giveaway.entry_created",
    actorType: source,
    actorLogin: userLogin,
    oldStatus: "",
    newStatus: "active",
    message: `${userDisplayName} joined giveaway`,
    metadata: { entryUid, ticketCount, ticketWeight, costDue: cost.costDue }
  });

  emitEvent("loyalty.giveaway.entry_created", { giveawayUid, entryUid, userLogin, userDisplayName, ticketCount, ticketWeight, costDue: cost.costDue });
  return { ok: true, entry: rowToEntry(database.get("SELECT * FROM loyalty_giveaway_entries WHERE entry_uid = :entryUid", { entryUid })) };
}

function cancelEntry(giveawayUid, entryUid, input = {}) {
  ensureSchema();
  const entry = database.get(`
    SELECT *
    FROM loyalty_giveaway_entries
    WHERE giveaway_uid = :giveawayUid AND entry_uid = :entryUid
  `, { giveawayUid, entryUid });
  if (!entry) return { ok: false, error: "entry_not_found", statusCode: 404 };
  if (entry.status === "cancelled") return { ok: true, entry: rowToEntry(entry), alreadyCancelled: true };


  const now = nowIso();
  database.run(`
    UPDATE loyalty_giveaway_entries
    SET status = 'cancelled',
        cancelled_at = :cancelledAt,
        updated_at = :updatedAt,
        metadata_json = :metadataJson
    WHERE entry_uid = :entryUid
  `, {
    entryUid,
    cancelledAt: now,
    updatedAt: now,
    metadataJson: json({ ...parseJson(entry.metadata_json, {}), cancelReason: input.reason || "", cancelledBy: input.actor || "dashboard" })
  });

  createEvent({
    giveawayUid,
    roundUid: entry.round_uid || "",
    eventType: "loyalty.giveaway.entry_cancelled",
    actorType: "dashboard",
    actorLogin: input.actor || "",
    oldStatus: entry.status,
    newStatus: "cancelled",
    message: input.reason || "Entry cancelled",
    metadata: { entryUid }
  });

  emitEvent("loyalty.giveaway.entry_cancelled", { giveawayUid, entryUid });
  return { ok: true, entry: rowToEntry(database.get("SELECT * FROM loyalty_giveaway_entries WHERE entry_uid = :entryUid", { entryUid })) };
}

function listWinners(giveawayUid, options = {}) {
  ensureSchema();
  const limit = Math.max(1, Math.min(500, Number(options.limit || 100) || 100));
  const rows = database.all(`
    SELECT *
    FROM loyalty_giveaway_winners
    WHERE giveaway_uid = :giveawayUid
    ORDER BY id DESC
    LIMIT :limit
  `, { giveawayUid, limit }).map(rowToWinner);
  return { ok: true, count: rows.length, rows };
}

function listWheelPermissions(giveawayUid, options = {}) {
  ensureSchema();
  const limit = Math.max(1, Math.min(500, Number(options.limit || 100) || 100));
  const rows = database.all(`
    SELECT *
    FROM loyalty_giveaway_wheel_permissions
    WHERE giveaway_uid = :giveawayUid
    ORDER BY id DESC
    LIMIT :limit
  `, { giveawayUid, limit }).map(rowToWheelPermission);
  return { ok: true, count: rows.length, rows };
}

function createWheelPermission(input = {}) {
  ensureSchema();
  const permissionUid = input.permissionUid || uid("wheelperm");
  const now = nowIso();

  database.run(`
    INSERT INTO loyalty_giveaway_wheel_permissions (
      permission_uid, giveaway_uid, round_uid, winner_uid, user_login, user_display_name,
      status, expires_at, used_at, spin_uid, created_at, updated_at, metadata_json
    ) VALUES (
      :permissionUid, :giveawayUid, :roundUid, :winnerUid, :userLogin, :userDisplayName,
      :status, :expiresAt, :usedAt, :spinUid, :createdAt, :updatedAt, :metadataJson
    )
  `, {
    permissionUid,
    giveawayUid: input.giveawayUid || "",
    roundUid: input.roundUid || "",
    winnerUid: input.winnerUid || "",
    userLogin: input.userLogin || "",
    userDisplayName: input.userDisplayName || input.userLogin || "",
    status: "pending",
    expiresAt: input.expiresAt || "",
    usedAt: "",
    spinUid: "",
    createdAt: now,
    updatedAt: now,
    metadataJson: json(input.metadata || {})
  });

  return rowToWheelPermission(database.get("SELECT * FROM loyalty_giveaway_wheel_permissions WHERE permission_uid = :permissionUid", { permissionUid }));
}

function getPendingWheelPermission(giveawayUid, userLogin) {
  ensureSchema();
  const login = String(userLogin || "").trim().replace(/^@/, "").toLowerCase();
  const row = database.get(`
    SELECT *
    FROM loyalty_giveaway_wheel_permissions
    WHERE giveaway_uid = :giveawayUid
      AND user_login = :userLogin
      AND status = 'pending'
    ORDER BY id ASC
    LIMIT 1
  `, { giveawayUid, userLogin: login });
  return rowToWheelPermission(row);
}

function getPendingWheelPermissionForUser(userLogin) {
  ensureSchema();
  const login = String(userLogin || "").trim().replace(/^@/, "").toLowerCase();
  if (!login) return null;
  const row = database.get(`
    SELECT p.*
    FROM loyalty_giveaway_wheel_permissions p
    JOIN loyalty_giveaways g ON g.giveaway_uid = p.giveaway_uid
    WHERE p.user_login = :userLogin
      AND p.status = 'pending'
      AND g.deleted_at = ''
    ORDER BY p.id ASC
    LIMIT 1
  `, { userLogin: login });
  return rowToWheelPermission(row);
}

function getAvailablePrize(giveawayUid) {
  ensureSchema();
  const row = database.get(`
    SELECT *
    FROM loyalty_giveaway_prizes
    WHERE giveaway_uid = :giveawayUid
      AND status != 'cancelled'
      AND quantity_remaining > 0
    ORDER BY id ASC
    LIMIT 1
  `, { giveawayUid });
  return rowToPrize(row);
}

function activeWinnerCount(giveawayUid) {
  ensureSchema();
  const row = database.get(`
    SELECT COUNT(*) AS count
    FROM loyalty_giveaway_winners
    WHERE giveaway_uid = :giveawayUid
      AND status != 'cancelled'
  `, { giveawayUid });
  return Number(row && row.count || 0);
}

function eligibleEntriesForDraw(giveawayUid) {
  ensureSchema();
  return database.all(`
    SELECT *
    FROM loyalty_giveaway_entries
    WHERE giveaway_uid = :giveawayUid
      AND status = 'active'
      AND ticket_weight > 0
    ORDER BY id ASC
  `, { giveawayUid });
}

function pickWeightedEntry(entries) {
  const totalWeight = entries.reduce((sum, entry) => sum + Math.max(0, Number(entry.ticket_weight || 0)), 0);
  if (!entries.length || totalWeight <= 0) return { ok: false, error: "no_weighted_entries", totalWeight };

  const zeroBasedPosition = crypto.randomInt(totalWeight);
  const ticketPosition = zeroBasedPosition + 1;
  let cursor = 0;

  for (const entry of entries) {
    cursor += Math.max(0, Number(entry.ticket_weight || 0));
    if (zeroBasedPosition < cursor) {
      return { ok: true, entry, totalWeight, ticketPosition };
    }
  }

  return { ok: false, error: "weighted_pick_failed", totalWeight, ticketPosition };
}

function drawWinner(giveawayUid, input = {}) {
  ensureSchema();
  const giveaway = getGiveaway(giveawayUid, false);
  if (!giveaway) return { ok: false, error: "giveaway_not_found", statusCode: 404 };
  if (giveaway.deletedAt) return { ok: false, error: "giveaway_deleted", statusCode: 409 };
  if (giveaway.status === STATUS.OPEN) {
    const chatMessage = renderChatRuntimeText("giveaway.draw_not_closed", {
      giveawayTitle: giveaway.title || "Giveaway"
    });
    return {
      ok: false,
      error: "giveaway_draw_requires_closed_entries",
      statusCode: 409,
      status: giveaway.status,
      requiredStatus: STATUS.CLOSED_FOR_ENTRIES,
      messageKey: "giveaway.draw_not_closed",
      message: chatMessage,
      chatMessage,
      shouldSendChat: Boolean(chatMessage)
    };
  }
  if (giveaway.status !== STATUS.CLOSED_FOR_ENTRIES) {
    return { ok: false, error: "giveaway_not_drawable", statusCode: 409, status: giveaway.status, requiredStatus: STATUS.CLOSED_FOR_ENTRIES };
  }
  const isWheelGiveaway = giveaway.wheelEnabled === true;
  let boundWheelContext = null;
  if (isWheelGiveaway) {
    boundWheelContext = getUsableBoundWheelForGiveaway(giveaway, { requireActive: true });
    if (!boundWheelContext.ok) return boundWheelContext;
  }

  const winnerCount = activeWinnerCount(giveawayUid);
  if (winnerCount >= giveaway.winnerCount) {
    return { ok: false, error: "giveaway_winner_count_reached", statusCode: 409, winnerCount, maxWinners: giveaway.winnerCount };
  }

  const prize = isWheelGiveaway ? null : getAvailablePrize(giveawayUid);
  if (!isWheelGiveaway && !prize) return { ok: false, error: "giveaway_no_prizes_available", statusCode: 409 };

  const entries = eligibleEntriesForDraw(giveawayUid);
  const pick = pickWeightedEntry(entries);
  if (!pick.ok) {
    return { ok: false, error: pick.error || "giveaway_no_eligible_entries", statusCode: 409, eligibleEntriesCount: entries.length, totalTicketWeight: pick.totalWeight || 0 };
  }

  const now = nowIso();
  const winnerUid = uid("winner");
  const entry = pick.entry;
  const round = getCurrentRound(giveawayUid);

  database.run(`
    INSERT INTO loyalty_giveaway_winners (
      winner_uid, giveaway_uid, round_uid, entry_uid, user_login, user_display_name,
      draw_algorithm, eligible_entries_count, total_ticket_weight, ticket_position,
      prize_uid, prize_label, wheel_required, wheel_permission_uid, wheel_spin_uid,
      status, created_at, metadata_json
    ) VALUES (
      :winnerUid, :giveawayUid, :roundUid, :entryUid, :userLogin, :userDisplayName,
      :drawAlgorithm, :eligibleEntriesCount, :totalTicketWeight, :ticketPosition,
      :prizeUid, :prizeLabel, :wheelRequired, :wheelPermissionUid, :wheelSpinUid,
      :status, :createdAt, :metadataJson
    )
  `, {
    winnerUid,
    giveawayUid,
    roundUid: round ? round.roundUid : "",
    entryUid: entry.entry_uid,
    userLogin: entry.user_login,
    userDisplayName: entry.user_display_name || entry.user_login,
    drawAlgorithm: "crypto.randomInt",
    eligibleEntriesCount: entries.length,
    totalTicketWeight: pick.totalWeight,
    ticketPosition: pick.ticketPosition,
    prizeUid: prize ? prize.prizeUid : "",
    prizeLabel: isWheelGiveaway ? "Rad-Drehung offen" : prize.label,
    wheelRequired: isWheelGiveaway ? 1 : 0,
    wheelPermissionUid: "",
    wheelSpinUid: "",
    status: "drawn",
    createdAt: now,
    metadataJson: json({
      actor: input.actor || "dashboard",
      selectedEntryUid: entry.entry_uid,
      entryTicketCount: Number(entry.ticket_count || 0),
      entryTicketWeight: Number(entry.ticket_weight || 0),
      fairness: {
        algorithm: "crypto.randomInt",
        eligibleEntriesCount: entries.length,
        totalTicketWeight: pick.totalWeight,
        ticketPosition: pick.ticketPosition
      }
    })
  });

  const nextRemaining = prize ? Math.max(0, Number(prize.quantityRemaining || 0) - 1) : 1;
  if (prize) {
    database.run(`
      UPDATE loyalty_giveaway_prizes
      SET quantity_remaining = :quantityRemaining,
          status = :status,
          updated_at = :updatedAt
      WHERE prize_uid = :prizeUid
    `, {
      prizeUid: prize ? prize.prizeUid : "",
      quantityRemaining: nextRemaining,
      status: nextRemaining <= 0 ? "awarded" : "available",
      updatedAt: now
    });
  }

  database.run(`
    UPDATE loyalty_giveaway_rounds
    SET winner_uid = :winnerUid,
        drawn_at = :drawnAt,
        status = :status,
        eligible_entries_count = :eligibleEntriesCount,
        total_ticket_weight = :totalTicketWeight
    WHERE round_uid = :roundUid
  `, {
    roundUid: round ? round.roundUid : "",
    winnerUid,
    drawnAt: now,
    status: "drawn",
    eligibleEntriesCount: entries.length,
    totalTicketWeight: pick.totalWeight
  });

  const updatedWinnerCount = activeWinnerCount(giveawayUid);
  const giveawayFinished = !isWheelGiveaway && (updatedWinnerCount >= giveaway.winnerCount || nextRemaining <= 0);
  database.run(`
    UPDATE loyalty_giveaways
    SET status = :status,
        entries_closed_at = CASE WHEN entries_closed_at = '' THEN :entriesClosedAt ELSE entries_closed_at END,
        finished_at = CASE WHEN :finishedAt != '' THEN :finishedAt ELSE finished_at END,
        updated_at = :updatedAt
    WHERE giveaway_uid = :giveawayUid
  `, {
    giveawayUid,
    status: isWheelGiveaway ? STATUS.WAITING_FOR_WHEEL : (giveawayFinished ? STATUS.FINISHED : STATUS.CLOSED_FOR_ENTRIES),
    entriesClosedAt: now,
    finishedAt: giveawayFinished ? now : "",
    updatedAt: now
  });

  const winner = rowToWinner(database.get("SELECT * FROM loyalty_giveaway_winners WHERE winner_uid = :winnerUid", { winnerUid }));


  let wheelPermission = null;
  if (isWheelGiveaway) {
    wheelPermission = createWheelPermission({
      giveawayUid,
      roundUid: round ? round.roundUid : "",
      winnerUid,
      userLogin: winner.userLogin,
      userDisplayName: winner.userDisplayName,
      metadata: {
        wheelPresetUid: giveaway.wheelPresetUid,
        wheelSnapshotUid: giveaway.wheelSnapshotUid,
        boundWheelUid: boundWheelContext.boundWheel.boundWheelUid,
        sourcePresetUid: boundWheelContext.sourcePresetUid,
        wheelScope: "giveaway",
        wheelContext: "giveaway_bound_wheel",
        reason: "winner_drawn"
      }
    });

    database.run(`
      UPDATE loyalty_giveaway_winners
      SET wheel_permission_uid = :permissionUid,
          status = 'waiting_for_wheel'
      WHERE winner_uid = :winnerUid
    `, {
      winnerUid,
      permissionUid: wheelPermission.permissionUid
    });

    winner.wheelPermissionUid = wheelPermission.permissionUid;
    winner.status = "waiting_for_wheel";

    createEvent({
      giveawayUid,
      roundUid: round ? round.roundUid : "",
      eventType: "loyalty.giveaway.wheel_permission_created",
      actorType: "system",
      actorLogin: winner.userLogin,
      oldStatus: "",
      newStatus: "pending",
      message: `${winner.userDisplayName} may spin the wheel`,
      metadata: {
        winnerUid,
        permissionUid: wheelPermission.permissionUid,
        wheelPresetUid: giveaway.wheelPresetUid,
        wheelSnapshotUid: giveaway.wheelSnapshotUid,
        boundWheelUid: boundWheelContext.boundWheel.boundWheelUid,
        sourcePresetUid: boundWheelContext.sourcePresetUid,
        wheelScope: "giveaway"
      }
    });

    emitEvent("loyalty.giveaway.wheel_permission_created", {
      giveawayUid,
      winnerUid,
      permissionUid: wheelPermission.permissionUid,
      userLogin: winner.userLogin,
      userDisplayName: winner.userDisplayName,
      wheelPresetUid: giveaway.wheelPresetUid,
      wheelSnapshotUid: giveaway.wheelSnapshotUid,
      boundWheelUid: boundWheelContext.boundWheel.boundWheelUid,
      sourcePresetUid: boundWheelContext.sourcePresetUid,
      wheelScope: "giveaway"
    });
  }

  createEvent({
    giveawayUid,
    roundUid: round ? round.roundUid : "",
    eventType: "loyalty.giveaway.winner_drawn",
    actorType: "dashboard",
    actorLogin: input.actor || "",
    oldStatus: giveaway.status,
    newStatus: isWheelGiveaway ? STATUS.WAITING_FOR_WHEEL : (giveawayFinished ? STATUS.FINISHED : STATUS.CLOSED_FOR_ENTRIES),
    message: isWheelGiveaway ? `${winner.userDisplayName} may spin the wheel` : `${winner.userDisplayName} won ${winner.prizeLabel}`,
    metadata: {
      winnerUid,
      entryUid: entry.entry_uid,
      algorithm: "crypto.randomInt",
      eligibleEntriesCount: entries.length,
      totalTicketWeight: pick.totalWeight,
      ticketPosition: pick.ticketPosition,
      prizeUid: prize ? prize.prizeUid : "",
      boundWheelUid: boundWheelContext && boundWheelContext.boundWheel ? boundWheelContext.boundWheel.boundWheelUid : "",
      sourcePresetUid: boundWheelContext ? boundWheelContext.sourcePresetUid : "",
      wheelSnapshotUid: isWheelGiveaway ? giveaway.wheelSnapshotUid : "",
      wheelScope: isWheelGiveaway ? "giveaway" : ""
    }
  });

  emitEvent("loyalty.giveaway.winner_drawn", {
    giveawayUid,
    winnerUid,
    userLogin: winner.userLogin,
    userDisplayName: winner.userDisplayName,
    prizeUid: winner.prizeUid,
    prizeLabel: winner.prizeLabel,
    wheelRequired: isWheelGiveaway,
    boundWheelUid: boundWheelContext && boundWheelContext.boundWheel ? boundWheelContext.boundWheel.boundWheelUid : "",
    sourcePresetUid: boundWheelContext ? boundWheelContext.sourcePresetUid : "",
    wheelSnapshotUid: isWheelGiveaway ? giveaway.wheelSnapshotUid : "",
    wheelScope: isWheelGiveaway ? "giveaway" : "",
    algorithm: "crypto.randomInt",
    eligibleEntriesCount: entries.length,
    totalTicketWeight: pick.totalWeight,
    ticketPosition: pick.ticketPosition
  });

  return { ok: true, winner, wheelPermission, giveaway: getGiveaway(giveawayUid, true) };
}

function claimWheelSpin(giveawayUid, input = {}) {
  ensureSchema();
  const giveaway = getGiveaway(giveawayUid, false);
  if (!giveaway) return { ok: false, error: "giveaway_not_found", statusCode: 404 };
  if (!giveaway.wheelEnabled) return { ok: false, error: "giveaway_not_wheel_enabled", statusCode: 409 };

  const boundWheelContext = getUsableBoundWheelForGiveaway(giveaway, { requireActive: true });
  if (!boundWheelContext.ok) return boundWheelContext;

  const userLogin = String(input.userLogin || input.login || input.user || "").trim().replace(/^@/, "").toLowerCase();
  if (!userLogin) return { ok: false, error: "missing_user_login", statusCode: 400 };

  const permission = getPendingWheelPermission(giveawayUid, userLogin);
  if (!permission) return { ok: false, error: "no_pending_wheel_permission", statusCode: 404 };

  const permissionBoundWheelUid = String(permission.metadata?.boundWheelUid || permission.metadata?.wheelSnapshotUid || "").trim();
  if (permissionBoundWheelUid && permissionBoundWheelUid !== boundWheelContext.boundWheel.boundWheelUid) {
    return {
      ok: false,
      error: "permission_bound_wheel_mismatch",
      statusCode: 409,
      permissionBoundWheelUid,
      boundWheelUid: boundWheelContext.boundWheel.boundWheelUid
    };
  }

  const userDisplayName = String(input.userDisplayName || input.displayName || permission.userDisplayName || userLogin).trim() || userLogin;

  let loyaltyGames = null;
  try {
    loyaltyGames = require("./loyalty_games");
  } catch (err) {
    return { ok: false, error: "loyalty_games_unavailable", statusCode: 503, detail: err && err.message ? err.message : String(err) };
  }

  const startSpin = loyaltyGames && loyaltyGames._private && loyaltyGames._private.startWheelSpin;
  if (typeof startSpin !== "function") {
    return { ok: false, error: "wheel_start_function_unavailable", statusCode: 503 };
  }

  const spin = startSpin({
    presetUid: "",
    fields: boundWheelContext.fields,
    minVisibleSlots: boundWheelContext.minVisibleSlots,
    login: userLogin,
    displayName: userDisplayName,
    source: "giveaway_bound_wheel",
    sourceRefUid: boundWheelContext.boundWheel.boundWheelUid,
    duration: input.duration || input.durationMs || 7000,
    metadata: {
      giveawayUid,
      permissionUid: permission.permissionUid,
      winnerUid: permission.winnerUid,
      wheelPresetUid: giveaway.wheelPresetUid,
      wheelSnapshotUid: giveaway.wheelSnapshotUid,
      boundWheelUid: boundWheelContext.boundWheel.boundWheelUid,
      sourcePresetUid: boundWheelContext.sourcePresetUid,
      wheelScope: "giveaway",
      wheelContext: "giveaway_bound_wheel",
      runtimeFieldSource: "giveaway_bound_wheel_fields",
      requestSource: input.source || ""
    }
  });

  if (!spin || spin.ok === false) {
    return { ok: false, error: spin && spin.error ? spin.error : "wheel_spin_failed", statusCode: spin && spin.statusCode ? spin.statusCode : 409, spin };
  }

  const decrementResult = decrementBoundWheelFieldAfterSpin(giveawayUid, spin.selectedFieldUid || spin.selectedFieldId || "", {
    spinUid: spin.spinUid || "",
    sessionUid: spin.sessionUid || "",
    winnerUid: permission.winnerUid || "",
    permissionUid: permission.permissionUid || ""
  });
  if (decrementResult && decrementResult.ok === false) return decrementResult;

  const now = nowIso();
  database.run(`
    UPDATE loyalty_giveaway_wheel_permissions
    SET status = 'used',
        used_at = :usedAt,
        updated_at = :updatedAt,
        spin_uid = :spinUid,
        metadata_json = :metadataJson
    WHERE permission_uid = :permissionUid
  `, {
    permissionUid: permission.permissionUid,
    usedAt: now,
    updatedAt: now,
    spinUid: spin.spinUid || "",
    metadataJson: json({
      ...permission.metadata,
      resultFieldId: spin.selectedFieldId || "",
      resultFieldUid: spin.selectedFieldUid || spin.selectedFieldId || "",
      resultLabel: spin.selectedFieldLabel || "",
      boundWheelUid: boundWheelContext.boundWheel.boundWheelUid,
      sourcePresetUid: boundWheelContext.sourcePresetUid,
      wheelSnapshotUid: giveaway.wheelSnapshotUid,
      wheelScope: "giveaway",
      wheelContext: "giveaway_bound_wheel"
    })
  });

  database.run(`
    UPDATE loyalty_giveaway_winners
    SET wheel_spin_uid = :spinUid,
        prize_label = :prizeLabel,
        status = 'wheel_completed',
        metadata_json = :metadataJson
    WHERE winner_uid = :winnerUid
  `, {
    winnerUid: permission.winnerUid,
    spinUid: spin.spinUid || "",
    prizeLabel: spin.selectedFieldLabel || "Rad-Ergebnis",
    metadataJson: json({
      wheelResult: {
        spinUid: spin.spinUid || "",
        sessionUid: spin.sessionUid || "",
        selectedFieldId: spin.selectedFieldId || "",
        selectedFieldUid: spin.selectedFieldUid || spin.selectedFieldId || "",
        selectedFieldLabel: spin.selectedFieldLabel || "",
        selectedFieldIndex: spin.selectedFieldIndex,
        boundWheelUid: boundWheelContext.boundWheel.boundWheelUid,
        sourcePresetUid: boundWheelContext.sourcePresetUid,
        wheelSnapshotUid: giveaway.wheelSnapshotUid,
        wheelScope: "giveaway"
      }
    })
  });

  database.run(`
    UPDATE loyalty_giveaways
    SET status = :status,
        finished_at = :finishedAt,
        updated_at = :updatedAt
    WHERE giveaway_uid = :giveawayUid
  `, {
    giveawayUid,
    status: STATUS.FINISHED,
    finishedAt: now,
    updatedAt: now
  });

  createEvent({
    giveawayUid,
    roundUid: permission.roundUid || "",
    eventType: "loyalty.giveaway.wheel_claimed",
    actorType: "user",
    actorLogin: userLogin,
    oldStatus: "pending",
    newStatus: "used",
    message: `${userDisplayName} spun the wheel and got ${spin.selectedFieldLabel || "a result"}`,
    metadata: {
      permissionUid: permission.permissionUid,
      winnerUid: permission.winnerUid,
      spinUid: spin.spinUid || "",
      sessionUid: spin.sessionUid || "",
      selectedFieldId: spin.selectedFieldId || "",
      selectedFieldUid: spin.selectedFieldUid || spin.selectedFieldId || "",
      selectedFieldLabel: spin.selectedFieldLabel || "",
      boundWheelUid: boundWheelContext.boundWheel.boundWheelUid,
      sourcePresetUid: boundWheelContext.sourcePresetUid,
      wheelSnapshotUid: giveaway.wheelSnapshotUid,
      wheelScope: "giveaway"
    }
  });

  emitEvent("loyalty.giveaway.wheel_claimed", {
    giveawayUid,
    permissionUid: permission.permissionUid,
    winnerUid: permission.winnerUid,
    userLogin,
    userDisplayName,
    spinUid: spin.spinUid || "",
    sessionUid: spin.sessionUid || "",
    selectedFieldId: spin.selectedFieldId || "",
    selectedFieldLabel: spin.selectedFieldLabel || "",
    boundWheelUid: boundWheelContext.boundWheel.boundWheelUid,
    sourcePresetUid: boundWheelContext.sourcePresetUid,
    wheelSnapshotUid: giveaway.wheelSnapshotUid,
    wheelScope: "giveaway"
  });

  return {
    ok: true,
    permission: rowToWheelPermission(database.get("SELECT * FROM loyalty_giveaway_wheel_permissions WHERE permission_uid = :permissionUid", { permissionUid: permission.permissionUid })),
    winner: database.get("SELECT * FROM loyalty_giveaway_winners WHERE winner_uid = :winnerUid", { winnerUid: permission.winnerUid }) ? rowToWinner(database.get("SELECT * FROM loyalty_giveaway_winners WHERE winner_uid = :winnerUid", { winnerUid: permission.winnerUid })) : null,
    spin: {
      ...spin,
      source: "giveaway_bound_wheel",
      sourceRefUid: boundWheelContext.boundWheel.boundWheelUid,
      boundWheelUid: boundWheelContext.boundWheel.boundWheelUid,
      sourcePresetUid: boundWheelContext.sourcePresetUid,
      wheelSnapshotUid: giveaway.wheelSnapshotUid,
      wheelScope: "giveaway"
    },
    boundWheel: boundWheelContext.boundWheel,
    giveaway: getGiveaway(giveawayUid, true)
  };
}

function buildSettingsSnapshot(input = {}, roundPolicy = {}) {
  return {
    title: String(input.title || "").trim(),
    description: String(input.description || "").trim(),
    mode: cleanMode(input.mode),
    wheelEnabled: input.wheelEnabled === true || input.wheel_enabled === true,
    wheelPresetUid: String(input.wheelPresetUid || input.wheel_preset_uid || "").trim(),
    wheelSnapshotUid: String(input.wheelSnapshotUid || input.wheel_snapshot_uid || input.boundWheelUid || "").trim(),
    wheelScope: input.wheelScope || (input.wheelEnabled === true || input.wheel_enabled === true ? "giveaway" : ""),
    boundWheelName: String(input.boundWheelName || "").trim(),
    costAmount: clampInt(input.costAmount ?? input.cost_amount, 0, 0, 2147483647),
    currencyKey: String(input.currencyKey || input.currency_key || "loyalty_points").trim() || "loyalty_points",
    maxTicketsPerUser: clampInt(input.maxTicketsPerUser ?? input.max_tickets_per_user, 1, 1, 999999),
    firstTicketFree: input.firstTicketFree === true || input.first_ticket_free === true,
    subOnly: input.subOnly === true || input.sub_only === true,
    subscriberLuckMultiplier: clampInt(input.subscriberLuckMultiplier ?? input.subscriber_luck_multiplier, 1, 1, 1000),
    winnerCount: clampInt(input.winnerCount ?? input.winner_count, 1, 1, 9999),
    roundPolicy,
    prizes: Array.isArray(input.prizes) ? input.prizes : []
  };
}

function createGiveaway(input = {}) {
  ensureSchema();
  const giveawayUid = input.giveawayUid || uid("giveaway");
  const now = nowIso();
  const mode = cleanMode(input.mode, MODES.CLASSIC_SINGLE);
  const wheelEnabled = input.wheelEnabled === true || input.wheel_enabled === true || mode.startsWith("wheel_");
  const roundPolicy = defaultRoundPolicy(input.roundPolicy || input.round_policy || {});
  const title = String(input.title || "").trim() || "Neues Giveaway";
  const sourceWheelPresetUid = String(input.wheelPresetUid || input.wheel_preset_uid || "").trim();
  const initialWheelSnapshotUid = wheelEnabled
    ? String(input.wheelSnapshotUid || input.wheel_snapshot_uid || input.boundWheelUid || uid("giveawaywheel")).trim()
    : String(input.wheelSnapshotUid || input.wheel_snapshot_uid || "").trim();
  const boundWheelName = wheelEnabled ? normalizeBoundWheelName(title) : "";
  const settingsSnapshot = buildSettingsSnapshot({
    ...input,
    wheelEnabled,
    wheelPresetUid: sourceWheelPresetUid,
    wheelSnapshotUid: initialWheelSnapshotUid,
    wheelScope: wheelEnabled ? "giveaway" : "",
    boundWheelName
  }, roundPolicy);

  database.run(`
    INSERT INTO loyalty_giveaways (
      giveaway_uid, title, description, status, mode, wheel_enabled,
      wheel_preset_uid, wheel_snapshot_uid, cost_amount, currency_key,
      max_tickets_per_user, first_ticket_free, sub_only, subscriber_luck_multiplier,
      winner_count, round_policy_json, settings_snapshot_json, copied_from_giveaway_uid,
      created_by, created_at, updated_at, metadata_json
    ) VALUES (
      :giveawayUid, :title, :description, :status, :mode, :wheelEnabled,
      :wheelPresetUid, :wheelSnapshotUid, :costAmount, :currencyKey,
      :maxTicketsPerUser, :firstTicketFree, :subOnly, :subscriberLuckMultiplier,
      :winnerCount, :roundPolicyJson, :settingsSnapshotJson, :copiedFromGiveawayUid,
      :createdBy, :createdAt, :updatedAt, :metadataJson
    )
  `, {
    giveawayUid,
    title,
    description: String(input.description || "").trim(),
    status: cleanStatus(input.status, STATUS.DRAFT),
    mode,
    wheelEnabled: wheelEnabled ? 1 : 0,
    wheelPresetUid: sourceWheelPresetUid,
    wheelSnapshotUid: initialWheelSnapshotUid,
    costAmount: clampInt(input.costAmount ?? input.cost_amount, 0, 0, 2147483647),
    currencyKey: String(input.currencyKey || input.currency_key || "loyalty_points").trim() || "loyalty_points",
    maxTicketsPerUser: clampInt(input.maxTicketsPerUser ?? input.max_tickets_per_user, 1, 1, 999999),
    firstTicketFree: input.firstTicketFree === true || input.first_ticket_free === true ? 1 : 0,
    subOnly: input.subOnly === true || input.sub_only === true ? 1 : 0,
    subscriberLuckMultiplier: clampInt(input.subscriberLuckMultiplier ?? input.subscriber_luck_multiplier, 1, 1, 1000),
    winnerCount: clampInt(input.winnerCount ?? input.winner_count, 1, 1, 9999),
    roundPolicyJson: json(roundPolicy),
    settingsSnapshotJson: json(settingsSnapshot),
    copiedFromGiveawayUid: String(input.copiedFromGiveawayUid || input.copied_from_giveaway_uid || "").trim(),
    createdBy: String(input.createdBy || input.actor || "").trim(),
    createdAt: now,
    updatedAt: now,
    metadataJson: json(input.metadata || {})
  });

  let boundWheel = null;
  if (wheelEnabled) {
    const boundResult = createOrUpdateBoundWheelForGiveaway(giveawayUid, {
      boundWheelUid: initialWheelSnapshotUid,
      title,
      boundWheelName,
      sourcePresetUid: sourceWheelPresetUid,
      status: BOUND_WHEEL_STATUS.DRAFT,
      actor: input.actor || input.createdBy || "dashboard",
      metadata: {
        sourcePresetUid: sourceWheelPresetUid,
        createdFrom: sourceWheelPresetUid ? "global_preset_template" : "new_giveaway_wheel",
        createMode: input.wheelCreateMode || input.wheel_create_mode || (sourceWheelPresetUid ? "copy_from_preset" : "new")
      }
    });
    if (boundResult.ok) boundWheel = boundResult.boundWheel;
  }

  createRound(giveawayUid, {
    roundNumber: 1,
    status: STATUS.DRAFT,
    entryPolicySnapshot: roundPolicy,
    prizePoolSnapshot: settingsSnapshot.prizes || []
  });

  const prizes = Array.isArray(input.prizes) ? input.prizes : [];
  if (prizes.length) {
    prizes.forEach(prize => createPrize(giveawayUid, prize));
  } else {
    createPrize(giveawayUid, {
      label: title,
      description: "Standard-Gewinn",
      quantityTotal: clampInt(input.winnerCount ?? input.winner_count, 1, 1, 9999)
    });
  }

  createEvent({
    giveawayUid,
    eventType: "loyalty.giveaway.created",
    actorType: "dashboard",
    actorLogin: input.actor || input.createdBy || "",
    oldStatus: "",
    newStatus: STATUS.DRAFT,
    message: "Giveaway created",
    metadata: { mode, wheelEnabled, wheelPresetUid: sourceWheelPresetUid, wheelSnapshotUid: initialWheelSnapshotUid, boundWheelUid: boundWheel ? boundWheel.boundWheelUid : "" }
  });

  emitEvent("loyalty.giveaway.created", { giveawayUid, title, mode, wheelEnabled, wheelPresetUid: sourceWheelPresetUid, wheelSnapshotUid: initialWheelSnapshotUid });
  return { ok: true, giveaway: getGiveaway(giveawayUid, true), boundWheel };

}

function assertDraftEditable(giveawayUid) {
  const row = getGiveawayRow(giveawayUid);
  if (!row) return { ok: false, error: "giveaway_not_found", statusCode: 404 };
  if (!isGiveawayEditableRow(row)) {
    return { ok: false, error: "giveaway_not_editable_copy_required", statusCode: 409, giveaway: rowToGiveaway(row, false) };
  }
  return { ok: true, row };
}

function updateGiveaway(giveawayUid, patch = {}) {
  ensureSchema();
  const editable = assertDraftEditable(giveawayUid);
  if (!editable.ok) return editable;
  const row = editable.row;
  const now = nowIso();
  const roundPolicy = defaultRoundPolicy(patch.roundPolicy || patch.round_policy || parseJson(row.round_policy_json, {}));
  const mode = cleanMode(patch.mode || row.mode, row.mode);
  const wheelEnabled = patch.wheelEnabled === undefined && patch.wheel_enabled === undefined
    ? Number(row.wheel_enabled || 0) === 1
    : (patch.wheelEnabled === true || patch.wheel_enabled === true || mode.startsWith("wheel_"));
  const next = {
    title: String(patch.title ?? row.title ?? "").trim() || "Giveaway",
    description: String(patch.description ?? row.description ?? "").trim(),
    mode,
    wheelEnabled,
    wheelPresetUid: String(patch.wheelPresetUid ?? patch.wheel_preset_uid ?? row.wheel_preset_uid ?? "").trim(),
    wheelSnapshotUid: String(patch.wheelSnapshotUid ?? patch.wheel_snapshot_uid ?? row.wheel_snapshot_uid ?? "").trim(),
    costAmount: clampInt(patch.costAmount ?? patch.cost_amount ?? row.cost_amount, row.cost_amount, 0, 2147483647),
    currencyKey: String(patch.currencyKey ?? patch.currency_key ?? row.currency_key ?? "loyalty_points").trim() || "loyalty_points",
    maxTicketsPerUser: clampInt(patch.maxTicketsPerUser ?? patch.max_tickets_per_user ?? row.max_tickets_per_user, row.max_tickets_per_user, 1, 999999),
    firstTicketFree: patch.firstTicketFree === undefined && patch.first_ticket_free === undefined ? Number(row.first_ticket_free || 0) === 1 : (patch.firstTicketFree === true || patch.first_ticket_free === true),
    subOnly: patch.subOnly === undefined && patch.sub_only === undefined ? Number(row.sub_only || 0) === 1 : (patch.subOnly === true || patch.sub_only === true),
    subscriberLuckMultiplier: clampInt(patch.subscriberLuckMultiplier ?? patch.subscriber_luck_multiplier ?? row.subscriber_luck_multiplier, row.subscriber_luck_multiplier, 1, 1000),
    winnerCount: clampInt(patch.winnerCount ?? patch.winner_count ?? row.winner_count, row.winner_count, 1, 9999),
    roundPolicy
  };
  let ensuredBoundWheel = null;
  if (next.wheelEnabled) {
    const boundResult = createOrUpdateBoundWheelForGiveaway(giveawayUid, {
      boundWheelUid: next.wheelSnapshotUid || uid("giveawaywheel"),
      title: next.title,
      sourcePresetUid: next.wheelPresetUid,
      status: BOUND_WHEEL_STATUS.DRAFT,
      actor: patch.actor || patch.updatedBy || "dashboard",
      metadata: {
        sourcePresetUid: next.wheelPresetUid,
        updateMode: patch.wheelCreateMode || patch.wheel_create_mode || "draft_sync"
      }
    });
    if (boundResult.ok) {
      ensuredBoundWheel = boundResult.boundWheel;
      next.wheelSnapshotUid = ensuredBoundWheel.boundWheelUid;
    }
  }
  const settingsSnapshot = buildSettingsSnapshot({
    ...next,
    wheelSnapshotUid: next.wheelSnapshotUid,
    wheelScope: next.wheelEnabled ? "giveaway" : "",
    boundWheelName: ensuredBoundWheel ? ensuredBoundWheel.name : "",
    prizes: listPrizes(giveawayUid).rows
  }, roundPolicy);

  database.run(`
    UPDATE loyalty_giveaways
    SET title = :title,
        description = :description,
        mode = :mode,
        wheel_enabled = :wheelEnabled,
        wheel_preset_uid = :wheelPresetUid,
        wheel_snapshot_uid = :wheelSnapshotUid,
        cost_amount = :costAmount,
        currency_key = :currencyKey,
        max_tickets_per_user = :maxTicketsPerUser,
        first_ticket_free = :firstTicketFree,
        sub_only = :subOnly,
        subscriber_luck_multiplier = :subscriberLuckMultiplier,
        winner_count = :winnerCount,
        round_policy_json = :roundPolicyJson,
        settings_snapshot_json = :settingsSnapshotJson,
        updated_at = :updatedAt
    WHERE giveaway_uid = :giveawayUid
  `, {
    giveawayUid,
    title: next.title,
    description: next.description,
    mode: next.mode,
    wheelEnabled: next.wheelEnabled ? 1 : 0,
    wheelPresetUid: next.wheelPresetUid,
    wheelSnapshotUid: next.wheelSnapshotUid,
    costAmount: next.costAmount,
    currencyKey: next.currencyKey,
    maxTicketsPerUser: next.maxTicketsPerUser,
    firstTicketFree: next.firstTicketFree ? 1 : 0,
    subOnly: next.subOnly ? 1 : 0,
    subscriberLuckMultiplier: next.subscriberLuckMultiplier,
    winnerCount: next.winnerCount,
    roundPolicyJson: json(next.roundPolicy),
    settingsSnapshotJson: json(settingsSnapshot),
    updatedAt: now
  });

  createEvent({
    giveawayUid,
    eventType: "loyalty.giveaway.updated",
    actorType: "dashboard",
    actorLogin: patch.actor || patch.updatedBy || "",
    oldStatus: row.status,
    newStatus: row.status,
    message: "Giveaway updated"
  });

  return { ok: true, giveaway: getGiveaway(giveawayUid, true) };
}

function copyGiveaway(giveawayUid, input = {}) {
  const source = getGiveaway(giveawayUid, true);
  if (!source) return { ok: false, error: "giveaway_not_found", statusCode: 404 };

  const copied = createGiveaway({
    title: String(input.title || "").trim() || `Kopie von ${source.title}`,
    description: String(input.description ?? source.description ?? "").trim(),
    status: STATUS.DRAFT,
    mode: source.mode,
    wheelEnabled: source.wheelEnabled,
    wheelPresetUid: source.wheelPresetUid,
    wheelSnapshotUid: "",
    costAmount: source.costAmount,
    currencyKey: source.currencyKey,
    maxTicketsPerUser: source.maxTicketsPerUser,
    firstTicketFree: source.firstTicketFree,
    subOnly: source.subOnly,
    subscriberLuckMultiplier: source.subscriberLuckMultiplier,
    winnerCount: source.winnerCount,
    roundPolicy: source.roundPolicy,
    copiedFromGiveawayUid: source.giveawayUid,
    createdBy: input.actor || "dashboard",
    prizes: (source.prizes || []).map(prize => ({
      label: prize.label,
      description: prize.description,
      quantityTotal: prize.quantityTotal,
      sourcePresetUid: prize.sourcePresetUid,
      sourceFieldUid: prize.sourceFieldUid,
      metadata: { copiedFromPrizeUid: prize.prizeUid }
    })),
    metadata: { copiedFromGiveawayUid: source.giveawayUid }
  });

  emitEvent("loyalty.giveaway.copied", { giveawayUid: copied.giveaway?.giveawayUid, copiedFromGiveawayUid: source.giveawayUid });
  return copied;
}

function setGiveawayStatus(giveawayUid, status, input = {}) {
  ensureSchema();
  const row = getGiveawayRow(giveawayUid);
  if (!row) return { ok: false, error: "giveaway_not_found", statusCode: 404 };
  if (row.deleted_at) return { ok: false, error: "giveaway_deleted", statusCode: 409 };

  const nextStatus = cleanStatus(status, row.status);
  const now = nowIso();
  const patch = {
    openedAt: row.opened_at || "",
    entriesClosedAt: row.entries_closed_at || "",
    finishedAt: row.finished_at || "",
    cancelledAt: row.cancelled_at || "",
    deletedAt: row.deleted_at || ""
  };

  if (nextStatus === STATUS.OPEN && row.status !== STATUS.DRAFT) {
    return { ok: false, error: "giveaway_can_only_open_from_draft", statusCode: 409 };
  }
  if (nextStatus === STATUS.OPEN) {
    const setup = evaluateGiveawaySetupRow(row);
    if (!setup.setupComplete) {
      return {
        ok: false,
        error: "giveaway_open_requires_complete_setup",
        statusCode: 409,
        messageKey: "giveaway.setup_incomplete",
        message: "Dieses Giveaway ist noch nicht bereit und kann nicht geöffnet werden.",
        setupComplete: false,
        setupState: setup.setupState,
        setupIssues: setup.setupIssues,
        giveaway: rowToGiveaway(row, true)
      };
    }
  }
  if (nextStatus === STATUS.CLOSED_FOR_ENTRIES && row.status !== STATUS.OPEN) {
    return { ok: false, error: "giveaway_can_only_close_entries_from_open", statusCode: 409 };
  }

  let activatedBoundWheel = null;
  if (nextStatus === STATUS.OPEN && Number(row.wheel_enabled || 0) === 1) {
    const activation = activateBoundWheelForGiveawayRow(row, input);
    if (!activation.ok) return activation;
    activatedBoundWheel = activation.boundWheel || null;
  }

  if (nextStatus === STATUS.OPEN) patch.openedAt = now;
  if (nextStatus === STATUS.CLOSED_FOR_ENTRIES) patch.entriesClosedAt = now;
  if (nextStatus === STATUS.FINISHED) patch.finishedAt = now;
  if (nextStatus === STATUS.CANCELLED) patch.cancelledAt = now;
  if (nextStatus === STATUS.DELETED) patch.deletedAt = now;

  database.run(`
    UPDATE loyalty_giveaways
    SET status = :status,
        updated_at = :updatedAt,
        opened_at = :openedAt,
        entries_closed_at = :entriesClosedAt,
        finished_at = :finishedAt,
        cancelled_at = :cancelledAt,
        deleted_at = :deletedAt,
        metadata_json = :metadataJson
    WHERE giveaway_uid = :giveawayUid
  `, {
    giveawayUid,
    status: nextStatus,
    updatedAt: now,
    openedAt: patch.openedAt,
    entriesClosedAt: patch.entriesClosedAt,
    finishedAt: patch.finishedAt,
    cancelledAt: patch.cancelledAt,
    deletedAt: patch.deletedAt,
    metadataJson: json({ ...parseJson(row.metadata_json, {}), lastStatusChangeReason: input.reason || "", lastStatusChangedAt: now })
  });

  const eventType = {
    [STATUS.OPEN]: "loyalty.giveaway.opened",
    [STATUS.CLOSED_FOR_ENTRIES]: "loyalty.giveaway.entries_closed",
    [STATUS.FINISHED]: "loyalty.giveaway.finished",
    [STATUS.CANCELLED]: "loyalty.giveaway.cancelled",
    [STATUS.DELETED]: "loyalty.giveaway.deleted"
  }[nextStatus] || "loyalty.giveaway.status_changed";

  createEvent({
    giveawayUid,
    eventType,
    actorType: input.actorType || "dashboard",
    actorLogin: input.actor || "",
    oldStatus: row.status,
    newStatus: nextStatus,
    message: input.reason || ""
  });
  emitEvent(eventType, { giveawayUid, oldStatus: row.status, newStatus: nextStatus });

  const response = { ok: true, giveaway: getGiveaway(giveawayUid, true) };
  if (activatedBoundWheel) response.boundWheel = activatedBoundWheel;
  if (nextStatus === STATUS.CLOSED_FOR_ENTRIES) {
    const chatMessage = renderChatRuntimeText("giveaway.closed", {
      giveawayTitle: row.title || "Giveaway"
    });
    response.messageKey = "giveaway.closed";
    response.message = chatMessage;
    response.chatMessage = chatMessage;
    response.shouldSendChat = Boolean(chatMessage);
  }
  return response;
}


function seedChatCommandDefinitions() {
  ensureSchema();
  const now = nowIso();
  let inserted = 0;

  for (const definition of CHAT_COMMAND_DEFINITIONS) {
    const result = database.insertIgnore("loyalty_giveaway_command_definitions", {
      command_name: definition.command,
      aliases_json: json(definition.aliases || []),
      action: definition.action || "",
      enabled: definition.enabled ? 1 : 0,
      active: definition.active ? 1 : 0,
      description: definition.description || "",
      usage: definition.usage || "",
      created_at: now,
      updated_at: now,
      metadata_json: json({ source: "seed", note: "registered_inactive" })
    });
    inserted += Number(result?.changes || 0);
  }

  return { ok: true, inserted };
}


function safeParseJson(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}

function commandSystemTableAvailable() {
  try {
    ensureSchema();
    const row = database.get("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'command_definitions'");
    return !!row;
  } catch (_) {
    return false;
  }
}

function rowToCentralCommand(row) {
  if (!row) return null;
  return {
    id: Number(row.id || 0),
    trigger: row.trigger || "",
    aliases: safeParseJson(row.aliases_json, []),
    moduleKey: row.module_key || "",
    actionKey: row.action_key || "",
    targetMethod: row.target_method || "POST",
    targetUrl: row.target_url || "",
    enabled: Number(row.enabled || 0) === 1,
    permissionLevel: row.permission_level || "everyone",
    cooldownGlobalMs: Number(row.cooldown_global_ms || 0),
    cooldownUserMs: Number(row.cooldown_user_ms || 0),
    liveOnly: Number(row.live_only || 0) === 1,
    responseMode: row.response_mode || "module",
    config: safeParseJson(row.config_json, {}),
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || ""
  };
}

function seedCentralCommandDefinitions() {
  ensureSchema();
  if (!commandSystemTableAvailable()) {
    return {
      ok: false,
      available: false,
      inserted: 0,
      existing: 0,
      count: 0,
      commands: [],
      warning: "Zentrales command_definitions-System ist noch nicht verfuegbar. Commands-Modul muss zuerst geladen sein."
    };
  }

  const now = nowIso();
  let inserted = 0;
  let existing = 0;

  for (const definition of CENTRAL_COMMAND_DEFINITIONS) {
    const current = database.get("SELECT id FROM command_definitions WHERE trigger = :trigger", { trigger: definition.trigger });
    if (current && current.id) {
      existing += 1;
      continue;
    }

    const result = database.run(`
      INSERT INTO command_definitions (
        trigger, aliases_json, module_key, action_key, target_method, target_url,
        enabled, permission_level, cooldown_global_ms, cooldown_user_ms, live_only,
        response_mode, config_json, created_at, updated_at
      ) VALUES (
        :trigger, :aliasesJson, :moduleKey, :actionKey, :targetMethod, :targetUrl,
        :enabled, :permissionLevel, :cooldownGlobalMs, :cooldownUserMs, :liveOnly,
        :responseMode, :configJson, :createdAt, :updatedAt
      )
    `, {
      trigger: definition.trigger,
      aliasesJson: json(definition.aliases || []),
      moduleKey: definition.moduleKey || MODULE_NAME,
      actionKey: definition.actionKey || "chat_command_runtime",
      targetMethod: definition.targetMethod || "POST",
      targetUrl: definition.targetUrl || "/api/loyalty/giveaways/runtime/chat-command",
      enabled: definition.enabled ? 1 : 0,
      permissionLevel: definition.permissionLevel || "everyone",
      cooldownGlobalMs: Math.max(0, Number(definition.cooldownGlobalMs || 0)),
      cooldownUserMs: Math.max(0, Number(definition.cooldownUserMs || 0)),
      liveOnly: definition.liveOnly ? 1 : 0,
      responseMode: definition.responseMode || "module",
      configJson: json(definition.config || {}),
      createdAt: now,
      updatedAt: now
    });
    inserted += Number(result && result.changes ? result.changes : 0);
  }

  return listCentralCommandDefinitions({ inserted, existing });
}

function listCentralCommandDefinitions(extra = {}) {
  ensureSchema();
  if (!commandSystemTableAvailable()) {
    return {
      ok: false,
      available: false,
      inserted: Number(extra.inserted || 0),
      existing: Number(extra.existing || 0),
      count: 0,
      commands: [],
      warning: "Zentrales command_definitions-System ist noch nicht verfuegbar."
    };
  }

  const triggers = CENTRAL_COMMAND_DEFINITIONS.map(item => item.trigger);
  const rows = database.all(`
    SELECT *
    FROM command_definitions
    WHERE trigger IN (${triggers.map((_, index) => `:trigger${index}`).join(', ')})
    ORDER BY trigger ASC
  `, triggers.reduce((acc, trigger, index) => {
    acc[`trigger${index}`] = trigger;
    return acc;
  }, {})).map(rowToCentralCommand);

  return {
    ok: true,
    available: true,
    active: rows.some(command => command && command.enabled),
    commandsActive: rows.some(command => command && command.enabled),
    inserted: Number(extra.inserted || 0),
    existing: Number(extra.existing || Math.max(0, rows.length - Number(extra.inserted || 0))),
    count: rows.length,
    commands: rows,
    note: "Zentrale Commands !ticket, !wheel und Alias !rad sind vorbereitet. Aktivierung erfolgt ausschliesslich ueber das zentrale commands-System."
  };
}

function seedChatTextVariants() {
  try {
    textHelper.seedModuleTextVariants(TEXT_MODULE, CHAT_TEXT_DEFAULTS, {
      categories: CHAT_TEXT_CATEGORIES,
      categoryLabels: CHAT_TEXT_CATEGORY_LABELS,
      source: "seed"
    });
    textHelper.seedModuleTexts(TEXT_MODULE, CHAT_TEXT_DEFAULTS, {
      source: "seed"
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err && err.message ? err.message : String(err) };
  }
}

function rowToCommandDefinition(row) {
  if (!row) return null;
  return {
    id: row.id,
    command: row.command_name || "",
    aliases: parseJson(row.aliases_json, []),
    action: row.action || "",
    enabled: Number(row.enabled || 0) === 1,
    active: Number(row.active || 0) === 1,
    description: row.description || "",
    usage: row.usage || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    metadata: parseJson(row.metadata_json, {})
  };
}

function listChatCommandDefinitions() {
  ensureSchema();
  seedChatCommandDefinitions();
  const rows = database.all(`
    SELECT *
    FROM loyalty_giveaway_command_definitions
    ORDER BY command_name ASC
  `).map(rowToCommandDefinition);

  return {
    ok: true,
    active: CHAT_COMMANDS_ACTIVE,
    count: rows.length,
    rows,
    note: "Commands sind eingetragen, aber bewusst nicht aktiv. Keine Twitch-Command-Ausfuehrung in diesem Step."
  };
}

function getChatTextEditorPayload() {
  ensureSchema();
  seedChatTextVariants();
  return textHelper.listModuleTextEditor(TEXT_MODULE, CHAT_TEXT_DEFAULTS, {
    categories: CHAT_TEXT_CATEGORIES,
    categoryLabels: CHAT_TEXT_CATEGORY_LABELS
  });
}

function handleChatTextEditorPayload(payload = {}) {
  ensureSchema();
  seedChatTextVariants();
  return textHelper.handleModuleTextEditorPayload(TEXT_MODULE, payload || {}, {
    categories: CHAT_TEXT_CATEGORIES,
    categoryLabels: CHAT_TEXT_CATEGORY_LABELS
  });
}


function normalizeChatLogin(value) {
  return String(value || "").trim().replace(/^@/, "").toLowerCase();
}

function normalizeChatDisplayName(input = {}, fallbackLogin = "") {
  return String(input.userDisplayName || input.displayName || input.user || input.username || fallbackLogin || "").trim() || fallbackLogin;
}

function sanitizeRuntimeChatMessage(value, maxLength = 450) {
  const clean = String(value || "").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
  const limit = Math.max(40, Math.min(500, Number.parseInt(maxLength, 10) || 450));
  return clean.length > limit ? clean.slice(0, limit - 1).trimEnd() + "…" : clean;
}

function renderChatRuntimeText(key, context = {}, options = {}) {
  seedChatTextVariants();
  const message = textHelper.renderModuleText(TEXT_MODULE, key, CHAT_TEXT_DEFAULTS, context, {
    categories: CHAT_TEXT_CATEGORIES,
    categoryLabels: CHAT_TEXT_CATEGORY_LABELS,
    ...options
  });
  return sanitizeRuntimeChatMessage(message, options.maxLength || options.max || 450);
}

function findCommandDefinition(commandName) {
  const cleanCommand = String(commandName || "").trim().replace(/^!/, "").toLowerCase();
  if (!cleanCommand) return null;
  const definitions = listChatCommandDefinitions().rows || [];
  return definitions.find(definition => {
    if (String(definition.command || "").toLowerCase() === cleanCommand) return true;
    return (definition.aliases || []).some(alias => String(alias || "").toLowerCase() === cleanCommand);
  }) || null;
}

function findCentralCommandDefinition(commandName) {
  if (!commandSystemTableAvailable()) return null;
  const cleanCommand = String(commandName || "").trim().replace(/^!/, "").toLowerCase();
  if (!cleanCommand) return null;
  const rows = database.all(`
    SELECT *
    FROM command_definitions
    WHERE module_key = :moduleKey
      AND trigger IN ('ticket', 'wheel')
    ORDER BY trigger ASC
  `, { moduleKey: MODULE_NAME }).map(rowToCentralCommand).filter(Boolean);

  return rows.find(command => {
    if (String(command.trigger || "").toLowerCase() === cleanCommand) return true;
    return (command.aliases || []).some(alias => String(alias || "").toLowerCase() === cleanCommand);
  }) || null;
}

function parseRuntimeTicketAmount(input = {}) {
  const args = Array.isArray(input.args) ? input.args : [];
  const rawValue = input.ticketCount ?? input.tickets ?? input.amount ?? args[0] ?? 1;
  const raw = String(rawValue === undefined || rawValue === null || rawValue === "" ? "1" : rawValue).trim();
  if (!/^\d+$/.test(raw)) {
    return { ok: false, value: 0, raw, error: "invalid_ticket_amount" };
  }
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < 1 || value > 999999) {
    return { ok: false, value: 0, raw, error: "invalid_ticket_amount" };
  }
  return { ok: true, value, raw };
}

function getRuntimeOpenGiveaway() {
  ensureSchema();
  const row = database.get(`
    SELECT *
    FROM loyalty_giveaways
    WHERE status = 'open'
      AND deleted_at = ''
    ORDER BY opened_at DESC, id DESC
    LIMIT 1
  `);
  return rowToGiveaway(row, false);
}

function buildCommandRuntimeResponse(input = {}, patch = {}) {
  const command = String(input.command || patch.command || "").trim().replace(/^!/, "").toLowerCase();
  const userLogin = normalizeChatLogin(input.userLogin || input.login || input.username || input.user);
  const userDisplayName = normalizeChatDisplayName(input, userLogin);
  const context = {
    user: userDisplayName || userLogin,
    displayName: userDisplayName || userLogin,
    login: userLogin,
    username: userLogin,
    command,
    ...(patch.context || {})
  };
  const messageKey = patch.messageKey || "";
  const message = patch.message || (messageKey ? renderChatRuntimeText(messageKey, context, patch.options || {}) : "");

  return {
    ok: patch.ok === true,
    handled: patch.handled !== false,
    active: patch.active === undefined ? true : patch.active === true,
    commandsActive: patch.commandsActive === undefined ? true : patch.commandsActive === true,
    command,
    action: patch.action || "",
    userLogin,
    userDisplayName,
    messageKey,
    message,
    chatMessage: message,
    shouldSendChat: Boolean(message),
    error: patch.error || "",
    data: patch.data || {},
    note: patch.note || "Runtime verarbeitet fachliche Regeln. Ob der Chat-Command aufgerufen wird, entscheidet das zentrale commands-System."
  };
}

function handleTicketCommandRuntime(input = {}) {
  const commandDefinition = findCommandDefinition("ticket");
  const centralCommandDefinition = findCentralCommandDefinition("ticket");
  const giveaway = getRuntimeOpenGiveaway();
  if (!giveaway) {
    return buildCommandRuntimeResponse(input, {
      ok: false,
      active: !!(centralCommandDefinition && centralCommandDefinition.enabled),
      commandsActive: !!(centralCommandDefinition && centralCommandDefinition.enabled),
      action: "giveaway_ticket",
      messageKey: "ticket.no_active",
      error: "giveaway_no_active",
      data: { commandDefinition, centralCommandDefinition }
    });
  }

  if (!centralCommandDefinition || !centralCommandDefinition.enabled) {
    return buildCommandRuntimeResponse(input, {
      ok: false,
      active: false,
      commandsActive: false,
      action: "giveaway_ticket",
      messageKey: "ticket.disabled",
      error: "chat_commands_disabled",
      data: { commandDefinition, centralCommandDefinition, giveawayUid: giveaway.giveawayUid }
    });
  }

  const amount = parseRuntimeTicketAmount(input);
  if (!amount.ok) {
    return buildCommandRuntimeResponse(input, {
      ok: false,
      active: !!(centralCommandDefinition && centralCommandDefinition.enabled),
      commandsActive: !!(centralCommandDefinition && centralCommandDefinition.enabled),
      action: "giveaway_ticket",
      messageKey: "ticket.invalid_amount",
      error: amount.error,
      data: { commandDefinition, centralCommandDefinition, giveawayUid: giveaway.giveawayUid, rawAmount: amount.raw }
    });
  }

  if (Number(giveaway.costAmount || 0) > 0) {
    return buildCommandRuntimeResponse(input, {
      ok: false,
      active: !!(centralCommandDefinition && centralCommandDefinition.enabled),
      commandsActive: !!(centralCommandDefinition && centralCommandDefinition.enabled),
      action: "giveaway_ticket",
      messageKey: "ticket.cost_not_supported_yet",
      error: "ticket_cost_not_supported_yet",
      data: { commandDefinition, centralCommandDefinition, giveawayUid: giveaway.giveawayUid, costAmount: giveaway.costAmount, currencyKey: giveaway.currencyKey }
    });
  }

  const userLogin = normalizeChatLogin(input.userLogin || input.login || input.username || input.user);
  const userDisplayName = normalizeChatDisplayName(input, userLogin);
  const result = createEntry(giveaway.giveawayUid, {
    userLogin,
    userDisplayName,
    ticketCount: amount.value,
    isSubscriber: input.isSubscriber === true || input.subscriber === true || input.isSub === true,
    source: "chat_runtime"
  });

  if (!result.ok) {
    const key = result.error === "giveaway_max_tickets_reached" ? "ticket.max_reached" : "ticket.invalid_amount";
    return buildCommandRuntimeResponse(input, {
      ok: false,
      active: !!(centralCommandDefinition && centralCommandDefinition.enabled),
      commandsActive: !!(centralCommandDefinition && centralCommandDefinition.enabled),
      action: "giveaway_ticket",
      messageKey: key,
      error: result.error || "entry_create_failed",
      data: { ...result, commandDefinition, centralCommandDefinition }
    });
  }

  return buildCommandRuntimeResponse(input, {
    ok: true,
    active: !!(centralCommandDefinition && centralCommandDefinition.enabled),
    commandsActive: !!(centralCommandDefinition && centralCommandDefinition.enabled),
    action: "giveaway_ticket",
    messageKey: "ticket.success",
    context: { tickets: amount.value, giveawayTitle: giveaway.title || "Giveaway" },
    data: { ...result, commandDefinition, centralCommandDefinition }
  });
}

function handleWheelCommandRuntime(input = {}) {
  const commandDefinition = findCommandDefinition(input.command || "wheel");
  const centralCommandDefinition = findCentralCommandDefinition(input.command || "wheel");
  if (!centralCommandDefinition || !centralCommandDefinition.enabled) {
    return buildCommandRuntimeResponse(input, {
      ok: false,
      active: false,
      commandsActive: false,
      action: "giveaway_wheel_claim",
      messageKey: "wheel.disabled",
      error: "chat_commands_disabled",
      data: { commandDefinition, centralCommandDefinition }
    });
  }

  const userLogin = normalizeChatLogin(input.userLogin || input.login || input.username || input.user);
  if (!userLogin) {
    return buildCommandRuntimeResponse(input, {
      ok: false,
      active: !!(centralCommandDefinition && centralCommandDefinition.enabled),
      commandsActive: !!(centralCommandDefinition && centralCommandDefinition.enabled),
      action: "giveaway_wheel_claim",
      messageKey: "wheel.no_permission",
      error: "missing_user_login",
      data: { commandDefinition, centralCommandDefinition }
    });
  }

  const giveawayUid = String(input.giveawayUid || input.giveaway_uid || "").trim();
  let permissionContext = null;
  let giveaway = null;
  if (giveawayUid) {
    giveaway = getGiveaway(giveawayUid, false);
  } else {
    permissionContext = getPendingWheelPermissionForUser(userLogin);
    giveaway = permissionContext ? getGiveaway(permissionContext.giveawayUid, false) : null;
  }

  if (!giveaway) {
    return buildCommandRuntimeResponse(input, {
      ok: false,
      active: !!(centralCommandDefinition && centralCommandDefinition.enabled),
      commandsActive: !!(centralCommandDefinition && centralCommandDefinition.enabled),
      action: "giveaway_wheel_claim",
      messageKey: "wheel.no_permission",
      error: "wheel_no_permission",
      data: { commandDefinition, centralCommandDefinition, reason: "no_pending_wheel_permission_for_user" }
    });
  }

  const result = claimWheelSpin(giveaway.giveawayUid, {
    ...input,
    userLogin,
    userDisplayName: normalizeChatDisplayName(input, userLogin),
    source: "chat_runtime"
  });

  if (!result.ok) {
    return buildCommandRuntimeResponse(input, {
      ok: false,
      action: "giveaway_wheel_claim",
      messageKey: "wheel.no_permission",
      error: result.error === "no_pending_wheel_permission" ? "wheel_no_permission" : (result.error || "wheel_claim_failed"),
      data: result
    });
  }

  return buildCommandRuntimeResponse(input, {
    ok: true,
    action: "giveaway_wheel_claim",
    messageKey: "wheel.success",
    data: result
  });
}

function handleChatCommandRuntime(input = {}) {
  ensureSchema();
  seedChatCommandDefinitions();
  seedChatTextVariants();

  const command = String(input.command || input.commandName || input.cmd || "").trim().replace(/^!/, "").toLowerCase();
  if (command === "ticket") return handleTicketCommandRuntime({ ...input, command });
  if (command === "wheel" || command === "rad") return handleWheelCommandRuntime({ ...input, command });

  return buildCommandRuntimeResponse({ ...input, command }, {
    ok: false,
    handled: false,
    error: "unsupported_command",
    note: "Loyalty-Giveaway-Runtime kennt aktuell nur !ticket, !wheel und !rad."
  });
}

function counts() {
  ensureSchema();
  const total = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_giveaways WHERE deleted_at = ''")?.count || 0);
  const open = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_giveaways WHERE status = 'open' AND deleted_at = ''")?.count || 0);
  const draft = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_giveaways WHERE status = 'draft' AND deleted_at = ''")?.count || 0);
  const finished = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_giveaways WHERE status = 'finished' AND deleted_at = ''")?.count || 0);
  const deleted = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_giveaways WHERE deleted_at != ''")?.count || 0);
  const prizes = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_giveaway_prizes")?.count || 0);
  const entries = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_giveaway_entries WHERE status = 'active'")?.count || 0);
  const winners = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_giveaway_winners WHERE status != 'cancelled'")?.count || 0);
  const wheelPermissions = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_giveaway_wheel_permissions WHERE status = 'pending'")?.count || 0);
  const boundWheelFields = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_giveaway_bound_wheel_fields WHERE deleted_at = ''")?.count || 0);
  const events = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_giveaway_events")?.count || 0);
  const commandDefinitions = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_giveaway_command_definitions")?.count || 0);
  const centralCommandDefinitions = commandSystemTableAvailable()
    ? Number(database.get("SELECT COUNT(*) AS count FROM command_definitions WHERE module_key = :moduleKey AND trigger IN ('ticket', 'wheel')", { moduleKey: MODULE_NAME })?.count || 0)
    : 0;
  const chatTextVariants = Number(database.get("SELECT COUNT(*) AS count FROM module_text_variants WHERE module_name = :moduleName", { moduleName: TEXT_MODULE })?.count || 0);
  return { total, draft, open, finished, deleted, prizes, entries, winners, wheelPermissions, boundWheelFields, events, commandDefinitions, centralCommandDefinitions, chatTextVariants };
}

function buildStatus() {
  return {
    ok: !state.lastError,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    version: MODULE_VERSION,
    enabled: true,
    routeCount: state.routeCount,
    loadedAt: state.loadedAt,
    lastError: state.lastError,
    diagnostics: {
      ok: !state.lastError,
      health: state.lastError ? "error" : "ok",
      module: MODULE_NAME,
      version: MODULE_VERSION,
      build: MODULE_BUILD,
      schemaVersion: SCHEMA_VERSION,
      schemaReady: !!state.schemaReady,
      lastError: state.lastError,
      counts: state.schemaReady ? counts() : {},
      centralCommands: state.schemaReady ? listCentralCommandDefinitions() : { ok: false, available: false },
      database: databaseStatus(),
      eventBus: {
        ready: !!state.eventBusReady,
        mode: state.eventBusReady ? "existing_communication_bus_direct" : "broadcast_only",
        moduleBus: moduleBusHandle && typeof moduleBusHandle.getState === "function" ? moduleBusHandle.getState() : null
      },
      warnings: [
        "Chat-Commands !ticket, !wheel und !rad sind intern eingetragen und zentral vorbereitet, aber bewusst nicht aktiv.",
        "Draw ist ab STEP_LWG_4M_2 nur nach closed_for_entries erlaubt.",
        "Wheel-Giveaways nutzen ab STEP_LWG_4M_5 ein aktives giveaway-bound Wheel fuer Permission/Claim/Spin."
      ],
      errors: state.lastError ? [state.lastError] : []
    }
  };
}

function registerRoutes(app) {
  const registered = [];

  // Static routes must be registered before /api/loyalty/giveaways/:giveawayUid.
  registered.push(...routes.registerGet(app, "/api/loyalty/giveaways/commands", core.asyncRoute(async (req, res) => {
    return core.sendOk(res, listChatCommandDefinitions());
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/giveaways/central-commands", core.asyncRoute(async (req, res) => {
    return core.sendOk(res, seedCentralCommandDefinitions());
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/giveaways/texts", core.asyncRoute(async (req, res) => {
    return core.sendOk(res, getChatTextEditorPayload());
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways/texts", core.asyncRoute(async (req, res) => {
    const result = handleChatTextEditorPayload(req.body || {});
    return core.sendOk(res, result);
  })));


  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways/runtime/chat-command", core.asyncRoute(async (req, res) => {
    return core.sendOk(res, handleChatCommandRuntime(req.body || {}));
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways/runtime/command", core.asyncRoute(async (req, res) => {
    return core.sendOk(res, handleChatCommandRuntime(req.body || {}));
  })));


  const routeNames = [
    "GET /api/loyalty/giveaways/status",
    "GET /api/loyalty/giveaways/routes",
    "POST /api/loyalty/giveaways/runtime/chat-command",
    "POST /api/loyalty/giveaways/runtime/command",
    "GET /api/loyalty/giveaways/central-commands",
    "GET /api/loyalty/giveaways",
    "GET /api/loyalty/giveaways/:giveawayUid",
    "POST /api/loyalty/giveaways",
    "PUT /api/loyalty/giveaways/:giveawayUid",
    "POST /api/loyalty/giveaways/:giveawayUid/copy",
    "POST /api/loyalty/giveaways/:giveawayUid/open",
    "POST /api/loyalty/giveaways/:giveawayUid/close",
    "POST /api/loyalty/giveaways/:giveawayUid/close-entries",
    "POST /api/loyalty/giveaways/:giveawayUid/finish",
    "POST /api/loyalty/giveaways/:giveawayUid/cancel",
    "POST /api/loyalty/giveaways/:giveawayUid/delete",
    "GET /api/loyalty/giveaways/:giveawayUid/rounds",
    "GET /api/loyalty/giveaways/:giveawayUid/prizes",
    "GET /api/loyalty/giveaways/:giveawayUid/events",
    "GET /api/loyalty/giveaways/:giveawayUid/entries",
    "POST /api/loyalty/giveaways/:giveawayUid/entries",
    "POST /api/loyalty/giveaways/:giveawayUid/entries/:entryUid/cancel",
    "GET /api/loyalty/giveaways/:giveawayUid/winners",
    "POST /api/loyalty/giveaways/:giveawayUid/draw",
    "GET /api/loyalty/giveaways/:giveawayUid/wheel/bound",
    "PUT /api/loyalty/giveaways/:giveawayUid/wheel/bound",
    "GET /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields",
    "POST /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields",
    "PUT /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields/:fieldUid",
    "POST /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields/:fieldUid/delete",
    "GET /api/loyalty/giveaways/:giveawayUid/wheel/permissions",
    "POST /api/loyalty/giveaways/:giveawayUid/wheel/claim",
    "GET /api/loyalty/giveaways/commands",
    "GET /api/loyalty/giveaways/texts",
    "POST /api/loyalty/giveaways/texts"
  ];

  registered.push(...routes.registerGet(app, "/api/loyalty/giveaways/status", core.asyncRoute(async (req, res) => {
    core.sendOk(res, buildStatus());
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/giveaways/routes", core.asyncRoute(async (req, res) => {
    core.sendOk(res, { module: MODULE_NAME, moduleVersion: MODULE_VERSION, routes: routeNames });
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/giveaways", core.asyncRoute(async (req, res) => {
    core.sendOk(res, listGiveaways(req.query || {}));
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/giveaways/:giveawayUid", core.asyncRoute(async (req, res) => {
    const giveaway = getGiveaway(req.params.giveawayUid, true);
    if (!giveaway) return core.sendFail(res, "giveaway_not_found", 404);
    return core.sendOk(res, { ok: true, giveaway });
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways", core.asyncRoute(async (req, res) => {
    const result = createGiveaway(req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "giveaway_create_failed", result.statusCode || 400, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerPut(app, "/api/loyalty/giveaways/:giveawayUid", core.asyncRoute(async (req, res) => {
    const result = updateGiveaway(req.params.giveawayUid, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "giveaway_update_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways/:giveawayUid/copy", core.asyncRoute(async (req, res) => {
    const result = copyGiveaway(req.params.giveawayUid, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "giveaway_copy_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways/:giveawayUid/open", core.asyncRoute(async (req, res) => {
    const result = setGiveawayStatus(req.params.giveawayUid, STATUS.OPEN, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "giveaway_open_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  async function handleCloseEntriesRoute(req, res) {
    const body = req.body || {};
    const result = setGiveawayStatus(req.params.giveawayUid, STATUS.CLOSED_FOR_ENTRIES, body);
    if (!result.ok) return core.sendFail(res, result.error || "giveaway_close_entries_failed", result.statusCode || 409, result);

    if (result.shouldSendChat && result.chatMessage && shouldSendChatForRequest(body)) {
      result.chatDispatch = await sendTwitchPresenceChatMessage(result.chatMessage, {
        trigger: "giveaway_close",
        giveawayUid: req.params.giveawayUid,
        messageKey: result.messageKey || "giveaway.closed"
      });
      result.chatDispatchAttempted = true;
      result.chatSent = Boolean(result.chatDispatch && result.chatDispatch.ok);
    } else {
      result.chatDispatchAttempted = false;
      result.chatSent = false;
      result.chatDispatch = { ok: true, skipped: true, reason: result.shouldSendChat ? "request_silent" : "no_chat_message" };
    }

    return core.sendOk(res, result);
  }

  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways/:giveawayUid/close", core.asyncRoute(handleCloseEntriesRoute)));

  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways/:giveawayUid/close-entries", core.asyncRoute(handleCloseEntriesRoute)));

  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways/:giveawayUid/finish", core.asyncRoute(async (req, res) => {
    const result = setGiveawayStatus(req.params.giveawayUid, STATUS.FINISHED, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "giveaway_finish_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways/:giveawayUid/cancel", core.asyncRoute(async (req, res) => {
    const result = setGiveawayStatus(req.params.giveawayUid, STATUS.CANCELLED, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "giveaway_cancel_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways/:giveawayUid/delete", core.asyncRoute(async (req, res) => {
    const result = setGiveawayStatus(req.params.giveawayUid, STATUS.DELETED, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "giveaway_delete_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/giveaways/:giveawayUid/rounds", core.asyncRoute(async (req, res) => {
    if (!getGiveaway(req.params.giveawayUid, false)) return core.sendFail(res, "giveaway_not_found", 404);
    return core.sendOk(res, listRounds(req.params.giveawayUid));
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/giveaways/:giveawayUid/prizes", core.asyncRoute(async (req, res) => {
    if (!getGiveaway(req.params.giveawayUid, false)) return core.sendFail(res, "giveaway_not_found", 404);
    return core.sendOk(res, listPrizes(req.params.giveawayUid));
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/giveaways/:giveawayUid/events", core.asyncRoute(async (req, res) => {
    if (!getGiveaway(req.params.giveawayUid, false)) return core.sendFail(res, "giveaway_not_found", 404);
    return core.sendOk(res, listEvents(req.params.giveawayUid, req.query || {}));
  })));


  registered.push(...routes.registerGet(app, "/api/loyalty/giveaways/:giveawayUid/entries", core.asyncRoute(async (req, res) => {
    if (!getGiveaway(req.params.giveawayUid, false)) return core.sendFail(res, "giveaway_not_found", 404);
    return core.sendOk(res, listEntries(req.params.giveawayUid, req.query || {}));
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways/:giveawayUid/entries", core.asyncRoute(async (req, res) => {
    const result = createEntry(req.params.giveawayUid, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "entry_create_failed", result.statusCode || 400, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways/:giveawayUid/entries/:entryUid/cancel", core.asyncRoute(async (req, res) => {
    const result = cancelEntry(req.params.giveawayUid, req.params.entryUid, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "entry_cancel_failed", result.statusCode || 400, result);
    return core.sendOk(res, result);
  })));


  
  registered.push(...routes.registerGet(app, "/api/loyalty/giveaways/:giveawayUid/winners", core.asyncRoute(async (req, res) => {
    if (!getGiveaway(req.params.giveawayUid, false)) return core.sendFail(res, "giveaway_not_found", 404);
    return core.sendOk(res, listWinners(req.params.giveawayUid, req.query || {}));
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways/:giveawayUid/draw", core.asyncRoute(async (req, res) => {
    const result = drawWinner(req.params.giveawayUid, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "draw_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));


  
  registered.push(...routes.registerGet(app, "/api/loyalty/giveaways/:giveawayUid/wheel/bound", core.asyncRoute(async (req, res) => {
    if (!getGiveaway(req.params.giveawayUid, false)) return core.sendFail(res, "giveaway_not_found", 404);
    const boundWheel = getBoundWheelByGiveaway(req.params.giveawayUid);
    const fieldsResult = boundWheel ? listBoundWheelFields(req.params.giveawayUid, req.query || {}) : { ok: true, count: 0, rows: [] };
    return core.sendOk(res, { ok: true, boundWheel, fieldCount: fieldsResult.count || 0, fields: fieldsResult.rows || [] });
  })));

  registered.push(...routes.registerPut(app, "/api/loyalty/giveaways/:giveawayUid/wheel/bound", core.asyncRoute(async (req, res) => {
    const giveaway = getGiveaway(req.params.giveawayUid, false);
    if (!giveaway) return core.sendFail(res, "giveaway_not_found", 404);
    const editable = assertDraftEditable(req.params.giveawayUid);
    if (!editable.ok) return core.sendFail(res, editable.error || "giveaway_not_editable", editable.statusCode || 409, editable);
    const result = createOrUpdateBoundWheelForGiveaway(req.params.giveawayUid, {
      ...(req.body || {}),
      title: giveaway.title,
      sourcePresetUid: req.body?.sourcePresetUid || req.body?.wheelPresetUid || giveaway.wheelPresetUid,
      actor: req.body?.actor || req.body?.updatedBy || "dashboard"
    });
    if (!result.ok) return core.sendFail(res, result.error || "bound_wheel_update_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/giveaways/:giveawayUid/wheel/bound/fields", core.asyncRoute(async (req, res) => {
    if (!getGiveaway(req.params.giveawayUid, false)) return core.sendFail(res, "giveaway_not_found", 404);
    const result = listBoundWheelFields(req.params.giveawayUid, req.query || {});
    if (!result.ok) return core.sendFail(res, result.error || "bound_wheel_fields_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways/:giveawayUid/wheel/bound/fields", core.asyncRoute(async (req, res) => {
    const result = createBoundWheelField(req.params.giveawayUid, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "bound_wheel_field_create_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerPut(app, "/api/loyalty/giveaways/:giveawayUid/wheel/bound/fields/:fieldUid", core.asyncRoute(async (req, res) => {
    const result = updateBoundWheelField(req.params.giveawayUid, req.params.fieldUid, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "bound_wheel_field_update_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways/:giveawayUid/wheel/bound/fields/:fieldUid/delete", core.asyncRoute(async (req, res) => {
    const result = deleteBoundWheelField(req.params.giveawayUid, req.params.fieldUid, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "bound_wheel_field_delete_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/giveaways/:giveawayUid/wheel/permissions", core.asyncRoute(async (req, res) => {
    if (!getGiveaway(req.params.giveawayUid, false)) return core.sendFail(res, "giveaway_not_found", 404);
    return core.sendOk(res, listWheelPermissions(req.params.giveawayUid, req.query || {}));
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways/:giveawayUid/wheel/claim", core.asyncRoute(async (req, res) => {
    const result = claimWheelSpin(req.params.giveawayUid, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "wheel_claim_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));




  state.routeCount = registered.length;
  return registered;
}

function init(ctx = {}) {
  try {
    broadcastWS = ctx.broadcastWS;
    eventBus = ctx.eventBus || ctx.bus || ctx.communicationBus || null;
    state.eventBusReady = !!eventBus;
    database.ensureReady(ctx);
    ensureSchema();
    seedCentralCommandDefinitions();

    if (ctx && ctx.app) registerRoutes(ctx.app);


    moduleBusHandle = createCommunicationBusHandle(MODULE_META, buildStatus);
    const moduleBusStart = moduleBusHandle.start();
    state.eventBusReady = moduleBusStart && moduleBusStart.ok === true;

    console.log(`[${MODULE_NAME}] loaded v${MODULE_VERSION} enabled=true communicationBus=${state.eventBusReady ? "ready" : "unavailable"}`);
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
    state.schemaReady = false;
    console.error(`[${MODULE_NAME}] failed: ${state.lastError}`);
  }
}

module.exports = {
  MODULE_META,
  MODULE_VERSION,
  version: MODULE_VERSION,
  init,
  _private: {
    STATUS,
    MODES,
    BOUND_WHEEL_STATUS,
    buildStatus,
    ensureSchema,
    createGiveaway,
    updateGiveaway,
    copyGiveaway,
    setGiveawayStatus,
    listGiveaways,
    getGiveaway,
    listEntries,
    createEntry,
    cancelEntry,
    listWinners,
    drawWinner,
    listWheelPermissions,
    getBoundWheelByGiveaway,
    listBoundWheelFields,
    listUsableBoundWheelSpinFields,
    createBoundWheelField,
    updateBoundWheelField,
    deleteBoundWheelField,
    copyPresetFieldsToBoundWheel,
    getUsableBoundWheelForGiveaway,
    activateBoundWheelForGiveawayRow,
    createOrUpdateBoundWheelForGiveaway,
    getPendingWheelPermissionForUser,
    claimWheelSpin,
    handleChatCommandRuntime,
    seedCentralCommandDefinitions,
    listCentralCommandDefinitions,
    listChatCommandDefinitions,
    getChatTextEditorPayload
  }
};
