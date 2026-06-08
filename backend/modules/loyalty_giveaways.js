"use strict";

/**
 * Loyalty Giveaways module.
 *
 * STEP LWG-4D:
 * - Backend Grundsystem fuer Giveaways.
 * - Keine Tickets, keine Gewinnerziehung, kein Rad-Claim.
 * - DB-portabel geplant ueber zentrale database-Schicht.
 * - Soft-Delete / Copy / Archiv-Grundlage.
 */

const crypto = require("crypto");
const core = require("./helpers/helper_core");
const routes = require("./helpers/helper_routes");
const database = require("../core/database");

const MODULE_NAME = "loyalty_giveaways";
const MODULE_VERSION = "0.1.0";
const MODULE_BUILD = "STEP_LWG_4D";
const SCHEMA_MODULE = "loyalty_giveaways";
const SCHEMA_VERSION = 1;

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
      "loyalty.giveaway.deleted"
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

  state.schemaReady = true;
  return true;
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

  if (includeDetails) {
    giveaway.rounds = listRounds(row.giveaway_uid).rows;
    giveaway.prizes = listPrizes(row.giveaway_uid).rows;
    giveaway.entries = listEntries(row.giveaway_uid, { limit: 250, includeCancelled: true }).rows;
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
    note: "LWG-4H berechnet Kosten nur vor, bucht aber noch keine Punkte."
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

function buildSettingsSnapshot(input = {}, roundPolicy = {}) {
  return {
    title: String(input.title || "").trim(),
    description: String(input.description || "").trim(),
    mode: cleanMode(input.mode),
    wheelEnabled: input.wheelEnabled === true || input.wheel_enabled === true,
    wheelPresetUid: String(input.wheelPresetUid || input.wheel_preset_uid || "").trim(),
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
  const settingsSnapshot = buildSettingsSnapshot({ ...input, wheelEnabled }, roundPolicy);
  const title = String(input.title || "").trim() || "Neues Giveaway";

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
    wheelPresetUid: String(input.wheelPresetUid || input.wheel_preset_uid || "").trim(),
    wheelSnapshotUid: String(input.wheelSnapshotUid || input.wheel_snapshot_uid || "").trim(),
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
    metadata: { mode, wheelEnabled }
  });

  emitEvent("loyalty.giveaway.created", { giveawayUid, title, mode, wheelEnabled });
  return { ok: true, giveaway: getGiveaway(giveawayUid, true) };
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
  const settingsSnapshot = buildSettingsSnapshot({ ...next, prizes: listPrizes(giveawayUid).rows }, roundPolicy);

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
  if (nextStatus === STATUS.CLOSED_FOR_ENTRIES && row.status !== STATUS.OPEN) {
    return { ok: false, error: "giveaway_can_only_close_entries_from_open", statusCode: 409 };
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
  return { ok: true, giveaway: getGiveaway(giveawayUid, true) };
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
  const events = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_giveaway_events")?.count || 0);
  return { total, draft, open, finished, deleted, prizes, entries, events };
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
      database: databaseStatus(),
      eventBus: {
        ready: !!state.eventBusReady,
        mode: state.eventBusReady ? "existing_communication_bus_direct" : "broadcast_only",
        moduleBus: moduleBusHandle && typeof moduleBusHandle.getState === "function" ? moduleBusHandle.getState() : null
      },
      warnings: [
        "STEP LWG-4D is backend foundation only: no entries, tickets, draws or wheel claims yet."
      ],
      errors: state.lastError ? [state.lastError] : []
    }
  };
}

function registerRoutes(app) {
  const registered = [];
  const routeNames = [
    "GET /api/loyalty/giveaways/status",
    "GET /api/loyalty/giveaways/routes",
    "GET /api/loyalty/giveaways",
    "GET /api/loyalty/giveaways/:giveawayUid",
    "POST /api/loyalty/giveaways",
    "PUT /api/loyalty/giveaways/:giveawayUid",
    "POST /api/loyalty/giveaways/:giveawayUid/copy",
    "POST /api/loyalty/giveaways/:giveawayUid/open",
    "POST /api/loyalty/giveaways/:giveawayUid/close-entries",
    "POST /api/loyalty/giveaways/:giveawayUid/finish",
    "POST /api/loyalty/giveaways/:giveawayUid/cancel",
    "POST /api/loyalty/giveaways/:giveawayUid/delete",
    "GET /api/loyalty/giveaways/:giveawayUid/rounds",
    "GET /api/loyalty/giveaways/:giveawayUid/prizes",
    "GET /api/loyalty/giveaways/:giveawayUid/events",
    "GET /api/loyalty/giveaways/:giveawayUid/entries",
    "POST /api/loyalty/giveaways/:giveawayUid/entries",
    "POST /api/loyalty/giveaways/:giveawayUid/entries/:entryUid/cancel"
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

  registered.push(...routes.registerPost(app, "/api/loyalty/giveaways/:giveawayUid/close-entries", core.asyncRoute(async (req, res) => {
    const result = setGiveawayStatus(req.params.giveawayUid, STATUS.CLOSED_FOR_ENTRIES, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "giveaway_close_entries_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

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
    cancelEntry
  }
};
