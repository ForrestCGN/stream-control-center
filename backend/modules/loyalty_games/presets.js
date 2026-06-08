"use strict";

const shared = require("./shared");

const STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  EXHAUSTED: "exhausted",
  FINISHED: "finished",
  DELETED: "deleted"
};

const PRESET_TYPE = {
  STANDALONE: "standalone",
  GIVEAWAY_LINKED: "giveaway_linked"
};

function createPresetStore(options = {}) {
  const database = options.database;
  const core = options.core || { nowIso: () => new Date().toISOString(), safeJsonParse: () => ({}) };
  const nowIso = typeof options.nowIso === "function" ? options.nowIso : () => core.nowIso();
  const emitEvent = typeof options.emitEvent === "function" ? options.emitEvent : () => false;
  const defaultFields = Array.isArray(options.defaultFields) ? options.defaultFields : [];

  function json(value) {
    return JSON.stringify(value && typeof value === "object" ? value : {});
  }

  function parseJson(value, fallback = {}) {
    if (core && typeof core.safeJsonParse === "function") return core.safeJsonParse(value, fallback);
    try { return JSON.parse(value || ""); } catch (_) { return fallback; }
  }

  function ensureSchema() {
    database.exec(`
      CREATE TABLE IF NOT EXISTS loyalty_wheel_presets (
        id ${database.primaryKeyAutoIncrementSql()},
        preset_uid TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        preset_type TEXT NOT NULL DEFAULT 'standalone',
        status TEXT NOT NULL DEFAULT 'draft',
        lifecycle_owner TEXT NOT NULL DEFAULT 'preset',
        linked_giveaway_uid TEXT NOT NULL DEFAULT '',
        enabled INTEGER NOT NULL DEFAULT 1,
        min_visible_slots INTEGER NOT NULL DEFAULT 12,
        copied_from_preset_uid TEXT NOT NULL DEFAULT '',
        created_by TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        finished_at TEXT NOT NULL DEFAULT '',
        deleted_at TEXT NOT NULL DEFAULT '',
        settings_json TEXT NOT NULL DEFAULT '{}',
        metadata_json TEXT NOT NULL DEFAULT '{}'
      );
    `);

    database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_wheel_presets_status ON loyalty_wheel_presets(status);`);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_wheel_presets_type ON loyalty_wheel_presets(preset_type);`);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_wheel_presets_giveaway ON loyalty_wheel_presets(linked_giveaway_uid);`);

    database.exec(`
      CREATE TABLE IF NOT EXISTS loyalty_wheel_fields (
        id ${database.primaryKeyAutoIncrementSql()},
        field_uid TEXT NOT NULL UNIQUE,
        preset_uid TEXT NOT NULL,
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

    database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_wheel_fields_preset ON loyalty_wheel_fields(preset_uid);`);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_wheel_fields_enabled ON loyalty_wheel_fields(enabled);`);

    database.exec(`
      CREATE TABLE IF NOT EXISTS loyalty_wheel_spins (
        id ${database.primaryKeyAutoIncrementSql()},
        spin_uid TEXT NOT NULL UNIQUE,
        session_uid TEXT NOT NULL DEFAULT '',
        preset_uid TEXT NOT NULL DEFAULT '',
        snapshot_uid TEXT NOT NULL DEFAULT '',
        source_type TEXT NOT NULL DEFAULT '',
        source_ref_uid TEXT NOT NULL DEFAULT '',
        user_login TEXT NOT NULL DEFAULT '',
        user_display_name TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT '',
        draw_algorithm TEXT NOT NULL DEFAULT 'crypto.randomInt',
        active_field_count INTEGER NOT NULL DEFAULT 0,
        total_weight INTEGER NOT NULL DEFAULT 0,
        result_field_uid TEXT NOT NULL DEFAULT '',
        result_field_id TEXT NOT NULL DEFAULT '',
        result_label TEXT NOT NULL DEFAULT '',
        started_at TEXT NOT NULL DEFAULT '',
        finished_at TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        metadata_json TEXT NOT NULL DEFAULT '{}'
      );
    `);

    database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_wheel_spins_preset ON loyalty_wheel_spins(preset_uid);`);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_wheel_spins_session ON loyalty_wheel_spins(session_uid);`);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_wheel_spins_status ON loyalty_wheel_spins(status);`);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_wheel_spins_created ON loyalty_wheel_spins(created_at);`);

    return true;
  }

  function rowToPreset(row, includeFields = false) {
    if (!row) return null;
    const preset = {
      id: row.id,
      presetUid: row.preset_uid,
      name: row.name || "",
      description: row.description || "",
      presetType: row.preset_type || PRESET_TYPE.STANDALONE,
      status: row.status || STATUS.DRAFT,
      lifecycleOwner: row.lifecycle_owner || "preset",
      linkedGiveawayUid: row.linked_giveaway_uid || "",
      enabled: Number(row.enabled || 0) === 1,
      minVisibleSlots: Number(row.min_visible_slots || 12),
      copiedFromPresetUid: row.copied_from_preset_uid || "",
      createdBy: row.created_by || "",
      createdAt: row.created_at || "",
      updatedAt: row.updated_at || "",
      finishedAt: row.finished_at || "",
      deletedAt: row.deleted_at || "",
      settings: parseJson(row.settings_json, {}),
      metadata: parseJson(row.metadata_json, {}),
      editable: isPresetEditableRow(row)
    };
    if (includeFields) preset.fields = listFields(row.preset_uid).rows;
    return preset;
  }

  function rowToField(row) {
    if (!row) return null;
    const rewardType = row.reward_type || "none";
    const rewardValue = row.reward_value || "";
    return {
      id: row.id,
      fieldUid: row.field_uid,
      idForWheel: row.field_uid,
      presetUid: row.preset_uid,
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

  function fieldToWheelField(field, index = 0) {
    return shared.normalizeField({
      id: field.fieldUid || field.idForWheel,
      fieldUid: field.fieldUid,
      presetUid: field.presetUid,
      label: field.label,
      sub: field.subLabel || field.sub,
      enabled: field.enabled,
      weight: field.weight,
      quantityTotal: field.quantityTotal,
      quantityRemaining: field.quantityRemaining,
      removeAfterWin: field.removeAfterWin,
      reward: { type: field.rewardType || "none", value: field.rewardValue || "" },
      colorA: field.colorA,
      colorB: field.colorB,
      metadata: field.metadata || {}
    }, index);
  }

  function rowToSpin(row) {
    if (!row) return null;
    return {
      id: row.id,
      spinUid: row.spin_uid,
      sessionUid: row.session_uid || "",
      presetUid: row.preset_uid || "",
      snapshotUid: row.snapshot_uid || "",
      sourceType: row.source_type || "",
      sourceRefUid: row.source_ref_uid || "",
      login: row.user_login || "",
      displayName: row.user_display_name || row.user_login || "",
      status: row.status || "",
      drawAlgorithm: row.draw_algorithm || "crypto.randomInt",
      activeFieldCount: Number(row.active_field_count || 0),
      totalWeight: Number(row.total_weight || 0),
      resultFieldUid: row.result_field_uid || "",
      resultFieldId: row.result_field_id || "",
      resultLabel: row.result_label || "",
      startedAt: row.started_at || "",
      finishedAt: row.finished_at || "",
      createdAt: row.created_at || "",
      updatedAt: row.updated_at || "",
      metadata: parseJson(row.metadata_json, {})
    };
  }

  function getPresetRow(presetUid) {
    ensureSchema();
    const uid = String(presetUid || "").trim();
    if (!uid) return null;
    return database.get("SELECT * FROM loyalty_wheel_presets WHERE preset_uid = :uid", { uid });
  }

  function getPreset(presetUid, includeFields = false) {
    return rowToPreset(getPresetRow(presetUid), includeFields);
  }

  function listPresets(options = {}) {
    ensureSchema();
    const limit = Math.max(1, Math.min(200, Number(options.limit || 50) || 50));
    const includeDeleted = options.includeDeleted === true || String(options.includeDeleted || "") === "true";
    const status = String(options.status || "").trim();
    const type = String(options.presetType || options.type || "").trim();
    const where = [];
    const params = { limit };

    if (!includeDeleted) where.push("deleted_at = ''");
    if (status) { where.push("status = :status"); params.status = status; }
    if (type) { where.push("preset_type = :type"); params.type = type; }

    const list = database.all(`
      SELECT *
      FROM loyalty_wheel_presets
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY id DESC
      LIMIT :limit
    `, params).map(row => rowToPreset(row, false));

    return { ok: true, count: list.length, rows: list };
  }

  function isPresetEditableRow(row) {
    if (!row) return false;
    if (row.deleted_at) return false;
    if ([STATUS.FINISHED, STATUS.EXHAUSTED, STATUS.DELETED].includes(row.status)) return false;
    if (row.preset_type === PRESET_TYPE.GIVEAWAY_LINKED) return false;
    const count = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_wheel_spins WHERE preset_uid = :uid", { uid: row.preset_uid })?.count || 0);
    return count <= 0;
  }

  function assertPresetEditable(presetUid) {
    const row = getPresetRow(presetUid);
    if (!row) return { ok: false, error: "preset_not_found", statusCode: 404 };
    if (!isPresetEditableRow(row)) {
      return { ok: false, error: "preset_not_editable_copy_required", statusCode: 409, preset: rowToPreset(row) };
    }
    return { ok: true, row };
  }

  function createPreset(input = {}) {
    ensureSchema();
    const now = nowIso();
    const presetUid = shared.uid("preset");
    const name = String(input.name || "").trim() || "Neues Glücksrad-Preset";
    const presetType = input.presetType === PRESET_TYPE.GIVEAWAY_LINKED ? PRESET_TYPE.GIVEAWAY_LINKED : PRESET_TYPE.STANDALONE;
    const linkedGiveawayUid = presetType === PRESET_TYPE.GIVEAWAY_LINKED ? String(input.linkedGiveawayUid || "").trim() : "";
    const lifecycleOwner = presetType === PRESET_TYPE.GIVEAWAY_LINKED ? "giveaway" : "preset";
    const status = String(input.status || STATUS.DRAFT).trim() || STATUS.DRAFT;
    const minVisibleSlots = shared.clampInt(input.minVisibleSlots || input.min_visible_slots, 12, 1, 96);

    database.run(`
      INSERT INTO loyalty_wheel_presets (
        preset_uid, name, description, preset_type, status, lifecycle_owner, linked_giveaway_uid,
        enabled, min_visible_slots, copied_from_preset_uid, created_by, created_at, updated_at,
        settings_json, metadata_json
      ) VALUES (
        :presetUid, :name, :description, :presetType, :status, :lifecycleOwner, :linkedGiveawayUid,
        :enabled, :minVisibleSlots, :copiedFromPresetUid, :createdBy, :createdAt, :updatedAt,
        :settingsJson, :metadataJson
      )
    `, {
      presetUid,
      name,
      description: String(input.description || "").trim(),
      presetType,
      status,
      lifecycleOwner,
      linkedGiveawayUid,
      enabled: input.enabled === false ? 0 : 1,
      minVisibleSlots,
      copiedFromPresetUid: String(input.copiedFromPresetUid || "").trim(),
      createdBy: String(input.createdBy || input.actor || "").trim(),
      createdAt: now,
      updatedAt: now,
      settingsJson: json(input.settings || {}),
      metadataJson: json(input.metadata || {})
    });

    const fields = Array.isArray(input.fields) ? input.fields : [];
    fields.forEach((field, index) => createField(presetUid, { ...field, sortOrder: index + 1 }, { allowDuringCreate: true }));

    const preset = getPreset(presetUid, true);
    emitEvent("loyalty.wheel.preset.created", { presetUid, presetType, name });
    return { ok: true, preset };
  }

  function seedDefaultPresetIfEmpty() {
    ensureSchema();
    const count = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_wheel_presets WHERE deleted_at = ''")?.count || 0);
    if (count > 0) return { ok: true, created: false };

    return {
      ...createPreset({
        name: "Standard Glücksrad",
        description: "Automatisch aus config/loyalty_games.json erzeugtes Standard-Preset.",
        status: STATUS.ACTIVE,
        presetType: PRESET_TYPE.STANDALONE,
        minVisibleSlots: 12,
        fields: defaultFields.map((field, index) => ({
          label: field.label,
          subLabel: field.sub || field.subtitle || "",
          enabled: field.enabled !== false,
          weight: field.weight === undefined ? 1 : field.weight,
          quantityTotal: field.quantityTotal || field.quantity || 0,
          quantityRemaining: field.quantityRemaining || field.quantity || 0,
          removeAfterWin: !!field.removeAfterWin,
          rewardType: field.reward?.type || "none",
          rewardValue: field.reward?.value || String(field.reward?.amount || ""),
          colorA: field.colorA || "",
          colorB: field.colorB || "",
          sortOrder: index + 1,
          metadata: { seededFromConfigFieldId: field.id || "" }
        }))
      }),
      created: true
    };
  }

  function listFields(presetUid, options = {}) {
    ensureSchema();
    const uid = String(presetUid || "").trim();
    const includeDeleted = options.includeDeleted === true || String(options.includeDeleted || "") === "true";
    if (!uid) return { ok: false, error: "missing_preset_uid", rows: [] };

    const where = ["preset_uid = :uid"];
    const params = { uid };
    if (!includeDeleted) where.push("deleted_at = ''");

    const list = database.all(`
      SELECT *
      FROM loyalty_wheel_fields
      WHERE ${where.join(" AND ")}
      ORDER BY sort_order ASC, id ASC
    `, params).map(rowToField);

    return { ok: true, count: list.length, rows: list };
  }

  function createField(presetUid, input = {}, options = {}) {
    ensureSchema();
    const uid = String(presetUid || "").trim();
    if (!uid) return { ok: false, error: "missing_preset_uid", statusCode: 400 };

    if (!options.allowDuringCreate) {
      const editable = assertPresetEditable(uid);
      if (!editable.ok) return editable;
    }

    const now = nowIso();
    const fieldUid = shared.uid("field");
    const total = shared.normalizeQuantity(input.quantityTotal ?? input.quantity_total ?? input.quantity ?? 0, 0);
    const remaining = shared.normalizeQuantity(input.quantityRemaining ?? input.quantity_remaining ?? total, total);
    const sortOrder = shared.clampInt(input.sortOrder ?? input.sort_order, 1, 0, 9999);
    const rewardType = String(input.rewardType || input.reward_type || input.reward?.type || "none").trim() || "none";
    const rewardValue = String(input.rewardValue || input.reward_value || input.reward?.value || input.reward?.amount || "").trim();

    database.run(`
      INSERT INTO loyalty_wheel_fields (
        field_uid, preset_uid, sort_order, label, sub_label, enabled, weight,
        quantity_total, quantity_remaining, remove_after_win, reward_type, reward_value,
        color_a, color_b, created_at, updated_at, metadata_json
      ) VALUES (
        :fieldUid, :presetUid, :sortOrder, :label, :subLabel, :enabled, :weight,
        :quantityTotal, :quantityRemaining, :removeAfterWin, :rewardType, :rewardValue,
        :colorA, :colorB, :createdAt, :updatedAt, :metadataJson
      )
    `, {
      fieldUid,
      presetUid: uid,
      sortOrder,
      label: String(input.label || "").trim() || "Gewinn",
      subLabel: String(input.subLabel || input.sub_label || input.sub || "").trim(),
      enabled: input.enabled === false ? 0 : 1,
      weight: shared.normalizeWeight(input.weight === undefined ? 1 : input.weight) || 1,
      quantityTotal: total,
      quantityRemaining: remaining,
      removeAfterWin: input.removeAfterWin === true || input.remove_after_win === true ? 1 : 0,
      rewardType,
      rewardValue,
      colorA: String(input.colorA || input.color_a || "").trim(),
      colorB: String(input.colorB || input.color_b || "").trim(),
      createdAt: now,
      updatedAt: now,
      metadataJson: json(input.metadata || {})
    });

    return { ok: true, field: rowToField(database.get("SELECT * FROM loyalty_wheel_fields WHERE field_uid = :fieldUid", { fieldUid })) };
  }

  function updateField(presetUid, fieldUid, patch = {}) {
    ensureSchema();
    const editable = assertPresetEditable(presetUid);
    if (!editable.ok) return editable;

    const field = database.get("SELECT * FROM loyalty_wheel_fields WHERE field_uid = :fieldUid AND preset_uid = :presetUid AND deleted_at = ''", { fieldUid, presetUid });
    if (!field) return { ok: false, error: "field_not_found", statusCode: 404 };

    const now = nowIso();
    const total = patch.quantityTotal ?? patch.quantity_total ?? field.quantity_total;
    const remaining = patch.quantityRemaining ?? patch.quantity_remaining ?? field.quantity_remaining;
    database.run(`
      UPDATE loyalty_wheel_fields
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
      WHERE field_uid = :fieldUid AND preset_uid = :presetUid
    `, {
      fieldUid,
      presetUid,
      sortOrder: shared.clampInt(patch.sortOrder ?? patch.sort_order ?? field.sort_order, field.sort_order, 0, 9999),
      label: String(patch.label ?? field.label ?? "").trim() || "Gewinn",
      subLabel: String(patch.subLabel ?? patch.sub_label ?? patch.sub ?? field.sub_label ?? "").trim(),
      enabled: patch.enabled === undefined ? Number(field.enabled || 0) : (patch.enabled === false ? 0 : 1),
      weight: shared.normalizeWeight(patch.weight === undefined ? field.weight : patch.weight) || 1,
      quantityTotal: shared.normalizeQuantity(total, field.quantity_total),
      quantityRemaining: shared.normalizeQuantity(remaining, field.quantity_remaining),
      removeAfterWin: patch.removeAfterWin === undefined && patch.remove_after_win === undefined ? Number(field.remove_after_win || 0) : (patch.removeAfterWin === true || patch.remove_after_win === true ? 1 : 0),
      rewardType: String(patch.rewardType || patch.reward_type || patch.reward?.type || field.reward_type || "none").trim() || "none",
      rewardValue: String(patch.rewardValue ?? patch.reward_value ?? patch.reward?.value ?? patch.reward?.amount ?? field.reward_value ?? "").trim(),
      colorA: String(patch.colorA ?? patch.color_a ?? field.color_a ?? "").trim(),
      colorB: String(patch.colorB ?? patch.color_b ?? field.color_b ?? "").trim(),
      updatedAt: now,
      metadataJson: json(patch.metadata || parseJson(field.metadata_json, {}))
    });

    return { ok: true, field: rowToField(database.get("SELECT * FROM loyalty_wheel_fields WHERE field_uid = :fieldUid", { fieldUid })) };
  }

  function deleteField(presetUid, fieldUid) {
    ensureSchema();
    const editable = assertPresetEditable(presetUid);
    if (!editable.ok) return editable;

    const now = nowIso();
    database.run(`
      UPDATE loyalty_wheel_fields
      SET enabled = 0, deleted_at = :deletedAt, updated_at = :updatedAt
      WHERE field_uid = :fieldUid AND preset_uid = :presetUid AND deleted_at = ''
    `, { fieldUid, presetUid, deletedAt: now, updatedAt: now });

    return { ok: true, deleted: true, fieldUid };
  }

  function copyPreset(presetUid, input = {}) {
    ensureSchema();
    const source = getPreset(presetUid, true);
    if (!source) return { ok: false, error: "preset_not_found", statusCode: 404 };

    const mode = String(input.quantityMode || "original").trim();
    const fields = (source.fields || []).map(field => ({
      label: field.label,
      subLabel: field.subLabel,
      enabled: field.enabled,
      weight: field.weight,
      quantityTotal: field.quantityTotal,
      quantityRemaining: mode === "remaining" ? field.quantityRemaining : field.quantityTotal,
      removeAfterWin: field.removeAfterWin,
      rewardType: field.rewardType,
      rewardValue: field.rewardValue,
      colorA: field.colorA,
      colorB: field.colorB,
      metadata: { copiedFromFieldUid: field.fieldUid }
    }));

    const created = createPreset({
      name: String(input.name || "").trim() || `Kopie von ${source.name}`,
      description: String(input.description || source.description || "").trim(),
      status: STATUS.DRAFT,
      presetType: PRESET_TYPE.STANDALONE,
      minVisibleSlots: source.minVisibleSlots,
      copiedFromPresetUid: source.presetUid,
      createdBy: input.createdBy || input.actor || "",
      settings: source.settings || {},
      metadata: { copiedFromPresetUid: source.presetUid, quantityMode: mode },
      fields
    });

    emitEvent("loyalty.wheel.preset.copied", { presetUid: created.preset?.presetUid, copiedFromPresetUid: source.presetUid });
    return created;
  }

  function setPresetStatus(presetUid, status, input = {}) {
    ensureSchema();
    const row = getPresetRow(presetUid);
    if (!row) return { ok: false, error: "preset_not_found", statusCode: 404 };
    if (row.preset_type === PRESET_TYPE.GIVEAWAY_LINKED) {
      return { ok: false, error: "giveaway_linked_preset_lifecycle_owned_by_giveaway", statusCode: 409 };
    }
    if (row.deleted_at) return { ok: false, error: "preset_deleted", statusCode: 409 };

    const now = nowIso();
    const finishedAt = status === STATUS.FINISHED ? now : (row.finished_at || "");
    const deletedAt = status === STATUS.DELETED ? now : (row.deleted_at || "");

    database.run(`
      UPDATE loyalty_wheel_presets
      SET status = :status,
          enabled = :enabled,
          updated_at = :updatedAt,
          finished_at = :finishedAt,
          deleted_at = :deletedAt,
          metadata_json = :metadataJson
      WHERE preset_uid = :presetUid
    `, {
      presetUid,
      status,
      enabled: [STATUS.ACTIVE].includes(status) ? 1 : Number(row.enabled || 0),
      updatedAt: now,
      finishedAt,
      deletedAt,
      metadataJson: json({ ...parseJson(row.metadata_json, {}), lastStatusChangeReason: input.reason || "", lastStatusChangedAt: now })
    });

    emitEvent(`loyalty.wheel.preset.${status}`, { presetUid, status });
    return { ok: true, preset: getPreset(presetUid, true) };
  }

  function getPresetFieldsForSpin(presetUid) {
    ensureSchema();
    const preset = getPreset(presetUid, false);
    if (!preset) return { ok: false, error: "preset_not_found", statusCode: 404 };
    if (preset.deletedAt) return { ok: false, error: "preset_deleted", statusCode: 409 };
    if (![STATUS.ACTIVE].includes(preset.status)) {
      return { ok: false, error: "preset_not_active", statusCode: 409, preset };
    }
    if (preset.presetType === PRESET_TYPE.GIVEAWAY_LINKED) {
      return { ok: false, error: "giveaway_linked_preset_requires_giveaway_permission", statusCode: 409, preset };
    }

    const fields = listFields(presetUid).rows.map(fieldToWheelField).filter(shared.isFieldAvailable);
    if (!fields.length) {
      markExhaustedIfNeeded(presetUid);
      return { ok: false, error: "preset_no_available_fields", statusCode: 409, preset: getPreset(presetUid) };
    }

    return { ok: true, preset, fields };
  }

  function markExhaustedIfNeeded(presetUid) {
    ensureSchema();
    const preset = getPreset(presetUid, false);
    if (!preset || preset.status !== STATUS.ACTIVE) return false;
    const available = listFields(presetUid).rows.map(fieldToWheelField).filter(shared.isFieldAvailable);
    if (available.length > 0) return false;

    database.run(`
      UPDATE loyalty_wheel_presets
      SET status = :status, enabled = 0, updated_at = :updatedAt
      WHERE preset_uid = :presetUid
    `, { presetUid, status: STATUS.EXHAUSTED, updatedAt: nowIso() });
    emitEvent("loyalty.wheel.preset.exhausted", { presetUid });
    return true;
  }

  function decrementFieldAfterWin(fieldUid) {
    ensureSchema();
    const row = database.get("SELECT * FROM loyalty_wheel_fields WHERE field_uid = :fieldUid", { fieldUid });
    if (!row) return { ok: false, error: "field_not_found" };

    const total = Number(row.quantity_total || 0);
    const remaining = Number(row.quantity_remaining || 0);
    if (total <= 0) return { ok: true, changed: false, unlimited: true };

    const nextRemaining = Math.max(0, remaining - 1);
    database.run(`
      UPDATE loyalty_wheel_fields
      SET quantity_remaining = :quantityRemaining,
          enabled = :enabled,
          updated_at = :updatedAt
      WHERE field_uid = :fieldUid
    `, {
      fieldUid,
      quantityRemaining: nextRemaining,
      enabled: nextRemaining <= 0 && Number(row.remove_after_win || 0) === 1 ? 0 : Number(row.enabled || 0),
      updatedAt: nowIso()
    });

    markExhaustedIfNeeded(row.preset_uid);
    return { ok: true, changed: true, quantityRemaining: nextRemaining };
  }

  function recordSpinStarted(input = {}) {
    ensureSchema();
    const now = nowIso();
    const spinUid = input.spinUid || shared.uid("spin");
    database.run(`
      INSERT INTO loyalty_wheel_spins (
        spin_uid, session_uid, preset_uid, snapshot_uid, source_type, source_ref_uid,
        user_login, user_display_name, status, draw_algorithm, active_field_count,
        total_weight, result_field_uid, result_field_id, result_label,
        started_at, created_at, updated_at, metadata_json
      ) VALUES (
        :spinUid, :sessionUid, :presetUid, :snapshotUid, :sourceType, :sourceRefUid,
        :login, :displayName, :status, :drawAlgorithm, :activeFieldCount,
        :totalWeight, :resultFieldUid, :resultFieldId, :resultLabel,
        :startedAt, :createdAt, :updatedAt, :metadataJson
      )
    `, {
      spinUid,
      sessionUid: input.sessionUid || "",
      presetUid: input.presetUid || "",
      snapshotUid: input.snapshotUid || "",
      sourceType: input.sourceType || input.source || "",
      sourceRefUid: input.sourceRefUid || "",
      login: input.login || "",
      displayName: input.displayName || input.login || "",
      status: input.status || "running",
      drawAlgorithm: "crypto.randomInt",
      activeFieldCount: Number(input.activeFieldCount || 0),
      totalWeight: Number(input.totalWeight || 0),
      resultFieldUid: input.resultFieldUid || "",
      resultFieldId: input.resultFieldId || "",
      resultLabel: input.resultLabel || "",
      startedAt: input.startedAt || now,
      createdAt: now,
      updatedAt: now,
      metadataJson: json(input.metadata || {})
    });
    return rowToSpin(database.get("SELECT * FROM loyalty_wheel_spins WHERE spin_uid = :spinUid", { spinUid }));
  }

  function recordSpinFinished(spinUid, patch = {}) {
    ensureSchema();
    const row = database.get("SELECT * FROM loyalty_wheel_spins WHERE spin_uid = :spinUid", { spinUid });
    if (!row) return null;
    const now = nowIso();
    database.run(`
      UPDATE loyalty_wheel_spins
      SET status = :status,
          finished_at = :finishedAt,
          updated_at = :updatedAt,
          metadata_json = :metadataJson
      WHERE spin_uid = :spinUid
    `, {
      spinUid,
      status: patch.status || "finished",
      finishedAt: patch.finishedAt || now,
      updatedAt: now,
      metadataJson: json({ ...parseJson(row.metadata_json, {}), ...(patch.metadata || {}) })
    });
    return rowToSpin(database.get("SELECT * FROM loyalty_wheel_spins WHERE spin_uid = :spinUid", { spinUid }));
  }

  function listSpins(options = {}) {
    ensureSchema();
    const limit = Math.max(1, Math.min(200, Number(options.limit || 50) || 50));
    const presetUid = String(options.presetUid || "").trim();
    const where = [];
    const params = { limit };
    if (presetUid) { where.push("preset_uid = :presetUid"); params.presetUid = presetUid; }

    const list = database.all(`
      SELECT *
      FROM loyalty_wheel_spins
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY id DESC
      LIMIT :limit
    `, params).map(rowToSpin);

    return { ok: true, count: list.length, rows: list };
  }

  function status() {
    ensureSchema();
    const presets = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_wheel_presets WHERE deleted_at = ''")?.count || 0);
    const active = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_wheel_presets WHERE status = 'active' AND deleted_at = ''")?.count || 0);
    const exhausted = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_wheel_presets WHERE status = 'exhausted' AND deleted_at = ''")?.count || 0);
    const fields = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_wheel_fields WHERE deleted_at = ''")?.count || 0);
    const spins = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_wheel_spins")?.count || 0);
    return { ok: true, presets, active, exhausted, fields, spins };
  }

  return {
    ensureSchema,
    seedDefaultPresetIfEmpty,
    status,
    listPresets,
    getPreset,
    createPreset,
    copyPreset,
    setPresetStatus,
    listFields,
    createField,
    updateField,
    deleteField,
    getPresetFieldsForSpin,
    decrementFieldAfterWin,
    recordSpinStarted,
    recordSpinFinished,
    listSpins,
    STATUS,
    PRESET_TYPE
  };
}

module.exports = {
  createPresetStore,
  STATUS,
  PRESET_TYPE
};
