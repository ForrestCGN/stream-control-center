"use strict";

const shared = require("./shared");

function createWheelGame(options = {}) {
  const hostModule = options.hostModule || "loyalty_games";
  const moduleVersion = options.moduleVersion || "0.2.0";
  const db = options.db || {};
  const presetStore = options.presetStore || null;
  const broadcast = typeof options.broadcast === "function" ? options.broadcast : () => false;
  const emitEvent = typeof options.emitEvent === "function" ? options.emitEvent : () => false;
  const nowIso = typeof options.nowIso === "function" ? options.nowIso : () => new Date().toISOString();

  let config = normalizeConfig(options.config || {});
  let hostEnabled = options.hostEnabled !== false;
  let active = null;
  let lastResult = null;
  let lastError = "";

  function normalizeConfig(source = {}) {
    const spin = source.spin && typeof source.spin === "object" ? source.spin : {};
    const overlay = source.overlay && typeof source.overlay === "object" ? source.overlay : {};
    const cost = source.cost && typeof source.cost === "object" ? source.cost : {};
    return {
      enabled: source.enabled !== false,
      mode: String(source.mode || "shadow").trim() || "shadow",
      cost: {
        enabled: cost.enabled === true,
        amount: Math.max(0, Number.parseInt(cost.amount || 0, 10) || 0)
      },
      spin: {
        defaultDurationMs: Number.parseInt(spin.defaultDurationMs || 7000, 10) || 7000,
        minDurationMs: Number.parseInt(spin.minDurationMs || 2500, 10) || 2500,
        maxDurationMs: Number.parseInt(spin.maxDurationMs || 20000, 10) || 20000,
        minExtraTurns: Number.parseInt(spin.minExtraTurns || 5, 10) || 5,
        maxExtraTurns: Number.parseInt(spin.maxExtraTurns || 8, 10) || 8,
        oneActiveSpinOnly: spin.oneActiveSpinOnly !== false
      },
      overlay: {
        eventType: String(overlay.eventType || "loyalty.wheel.spin").trim() || "loyalty.wheel.spin",
        resetEventType: String(overlay.resetEventType || "loyalty.wheel.reset").trim() || "loyalty.wheel.reset"
      },
      minVisibleSlots: shared.clampInt(source.minVisibleSlots || source.min_visible_slots, 12, 1, 96),
      fields: Array.isArray(source.fields) ? source.fields : []
    };
  }

  function getFields(input = {}) {
    const presetUid = String(input.presetUid || input.preset || "").trim();
    if (presetUid && presetStore && typeof presetStore.getPresetFieldsForSpin === "function") {
      const loaded = presetStore.getPresetFieldsForSpin(presetUid);
      if (!loaded.ok) return loaded;
      return {
        ok: true,
        preset: loaded.preset,
        minVisibleSlots: loaded.preset.minVisibleSlots || config.minVisibleSlots || 12,
        fields: shared.normalizeFields(loaded.fields)
      };
    }

    return {
      ok: true,
      preset: null,
      minVisibleSlots: config.minVisibleSlots || 12,
      fields: shared.normalizeFields(config.fields)
    };
  }

  function getPublicConfig() {
    const baseFields = getFields();
    return {
      enabled: !!config.enabled,
      mode: config.mode,
      cost: { ...config.cost },
      spin: { ...config.spin },
      overlay: { ...config.overlay },
      minVisibleSlots: config.minVisibleSlots || 12,
      fields: baseFields.ok ? baseFields.fields.map(shared.publicField) : [],
      presetsEnabled: !!presetStore
    };
  }

  function isRunning() {
    return !!(active && active.status === "running");
  }

  function getStatus() {
    const fields = getFields();
    return {
      ok: !lastError,
      game: "wheel",
      enabled: hostEnabled && !!config.enabled,
      running: isRunning(),
      activeSession: active ? {
        sessionUid: active.sessionUid,
        startedAt: active.startedAt,
        endsAt: active.endsAt,
        durationMs: active.durationMs,
        selectedFieldId: active.selectedFieldId,
        selectedFieldIndex: active.selectedFieldIndex,
        selectedFieldLabel: active.selectedFieldLabel,
        presetUid: active.presetUid || ""
      } : null,
      lastResult,
      fields: fields.ok ? fields.fields.length : 0,
      mode: config.mode,
      costEnabled: !!config.cost.enabled,
      costAmount: Number(config.cost.amount || 0),
      presetsEnabled: !!presetStore,
      lastError
    };
  }

  function finishActive(sessionUid) {
    if (!active || active.sessionUid !== sessionUid) return null;
    const finishedAt = nowIso();
    const result = {
      sessionUid: active.sessionUid,
      spinUid: active.spinUid || "",
      presetUid: active.presetUid || "",
      selectedFieldUid: active.selectedFieldUid || "",
      selectedFieldId: active.selectedFieldId,
      selectedFieldIndex: active.selectedFieldIndex,
      selectedFieldLabel: active.selectedFieldLabel,
      finishedAt
    };

    if (typeof db.updateSession === "function") {
      db.updateSession(sessionUid, {
        status: "finished",
        finishedAt,
        metadata: {
          finishedBy: "timer",
          result
        }
      });
    }

    if (active.spinUid && presetStore && typeof presetStore.recordSpinFinished === "function") {
      presetStore.recordSpinFinished(active.spinUid, {
        status: "finished",
        finishedAt,
        metadata: { result }
      });
    }

    if (active.presetUid && active.selectedFieldUid && presetStore && typeof presetStore.decrementFieldAfterWin === "function") {
      presetStore.decrementFieldAfterWin(active.selectedFieldUid);
    }

    lastResult = result;
    active = null;

    emitEvent("loyalty.wheel.spin.finished", result);
    broadcast({
      type: "loyalty.wheel.finished",
      module: hostModule,
      moduleVersion,
      event: "loyalty.event",
      game: "wheel",
      action: "finished",
      ...result
    });
    return result;
  }

  function spin(input = {}) {
    try {
      if (!hostEnabled) {
        return { ok: false, error: "loyalty_games_disabled", statusCode: 403 };
      }
      if (!config.enabled) {
        return { ok: false, error: "wheel_disabled", statusCode: 403 };
      }
      if (config.spin.oneActiveSpinOnly && isRunning()) {
        return { ok: false, error: "wheel_spin_already_running", statusCode: 409, activeSession: getStatus().activeSession };
      }

      const presetUid = String(input.presetUid || input.preset || "").trim();
      const fieldsResult = getFields({ presetUid });
      if (!fieldsResult.ok) {
        return { ok: false, error: fieldsResult.error || "wheel_preset_load_failed", statusCode: fieldsResult.statusCode || 409, preset: fieldsResult.preset };
      }

      const fields = fieldsResult.fields;
      if (!fields.length) {
        return { ok: false, error: presetUid ? "preset_no_available_fields" : "wheel_no_enabled_fields", statusCode: 400 };
      }

      const selectedNormalizedIndex = shared.pickWeightedIndex(fields);
      if (selectedNormalizedIndex < 0) {
        return { ok: false, error: "wheel_random_selection_failed", statusCode: 500 };
      }

      const selected = fields[selectedNormalizedIndex];
      const visualFields = shared.expandFieldsForVisual(fields, fieldsResult.minVisibleSlots || config.minVisibleSlots || 12);
      const selectedVisualIndex = Math.max(0, visualFields.findIndex(field => (field.fieldUid || field.id) === (selected.fieldUid || selected.id)));
      const durationMs = shared.parseDuration(input, config.spin);
      const extraTurns = shared.parseExtraTurns(config.spin);
      const login = shared.normalizeLogin(input.login || input.user || input.userLogin || "");
      const displayName = shared.cleanDisplayName(login, input.displayName || input.display || input.userDisplayName || "");
      const source = String(input.source || (presetUid ? "preset_api" : "api")).trim() || "api";
      const sessionUid = shared.uid("wheel");
      const spinUid = presetUid ? shared.uid("spin") : "";
      const startedAt = nowIso();
      const endsAt = new Date(Date.parse(startedAt) + durationMs).toISOString();
      const costAmount = config.cost.enabled ? Number(config.cost.amount || 0) : 0;
      const totalWeight = fields.reduce((sum, field) => sum + shared.normalizeWeight(field.weight), 0);

      const metadata = {
        inputSource: source,
        backendRandom: true,
        randomMethod: "crypto.randomInt",
        selectedNormalizedIndex,
        selectedVisualIndex,
        selectedOriginalIndex: selected.index,
        fieldsCount: fields.length,
        visualFieldsCount: visualFields.length,
        totalWeight,
        extraTurns,
        presetUid,
        note: "STEP LWG-4B records preset spins and does not book points or execute rewards yet."
      };

      const session = typeof db.insertSession === "function" ? db.insertSession({
        sessionUid,
        gameKey: "wheel",
        login,
        displayName,
        status: "running",
        source,
        durationMs,
        selectedFieldId: selected.id,
        selectedFieldIndex: selectedVisualIndex,
        selectedFieldLabel: selected.label,
        costAmount,
        mode: config.mode,
        startedAt,
        metadata
      }) : null;

      if (presetUid && presetStore && typeof presetStore.recordSpinStarted === "function") {
        presetStore.recordSpinStarted({
          spinUid,
          sessionUid,
          presetUid,
          sourceType: source,
          sourceRefUid: String(input.sourceRefUid || "").trim(),
          login,
          displayName,
          status: "running",
          activeFieldCount: fields.length,
          totalWeight,
          resultFieldUid: selected.fieldUid || selected.id,
          resultFieldId: selected.id,
          resultLabel: selected.label,
          startedAt,
          metadata
        });
      }

      active = {
        sessionUid,
        spinUid,
        presetUid,
        status: "running",
        timer: setTimeout(() => finishActive(sessionUid), durationMs),
        startedAt,
        endsAt,
        durationMs,
        selectedFieldUid: selected.fieldUid || selected.id,
        selectedFieldId: selected.id,
        selectedFieldIndex: selectedVisualIndex,
        selectedFieldLabel: selected.label
      };

      const event = {
        type: config.overlay.eventType,
        module: hostModule,
        moduleVersion,
        event: "loyalty.event",
        game: "wheel",
        action: "started",
        sessionUid,
        spinUid,
        presetUid,
        durationMs,
        extraTurns,
        startedAt,
        endsAt,
        fields: visualFields.map(shared.publicField),
        selectedFieldIndex: selectedVisualIndex,
        selectedFieldId: selected.id,
        selectedFieldUid: selected.fieldUid || selected.id,
        selectedFieldLabel: selected.label,
        selectedField: shared.publicField(selected),
        user: {
          login,
          displayName
        },
        cost: {
          enabled: !!config.cost.enabled,
          amount: costAmount
        },
        mode: config.mode
      };

      emitEvent("loyalty.wheel.spin.started", event);
      broadcast(event);

      lastError = "";
      return {
        ok: true,
        game: "wheel",
        sessionUid,
        spinUid,
        presetUid,
        durationMs,
        extraTurns,
        startedAt,
        endsAt,
        selectedFieldIndex: selectedVisualIndex,
        selectedFieldId: selected.id,
        selectedFieldUid: selected.fieldUid || selected.id,
        selectedFieldLabel: selected.label,
        selectedField: shared.publicField(selected),
        user: { login, displayName },
        session
      };
    } catch (err) {
      lastError = err && err.message ? err.message : String(err);
      return { ok: false, error: lastError, statusCode: 500 };
    }
  }

  function reset(input = {}) {
    const source = String(input.source || "api").trim() || "api";
    const previous = active ? { ...active } : null;

    if (active && active.timer) {
      clearTimeout(active.timer);
    }

    if (active && typeof db.updateSession === "function") {
      db.updateSession(active.sessionUid, {
        status: "reset",
        finishedAt: nowIso(),
        metadata: {
          resetBy: source
        }
      });
    }

    if (active && active.spinUid && presetStore && typeof presetStore.recordSpinFinished === "function") {
      presetStore.recordSpinFinished(active.spinUid, {
        status: "reset",
        finishedAt: nowIso(),
        metadata: { resetBy: source }
      });
    }

    active = null;

    broadcast({
      type: config.overlay.resetEventType,
      module: hostModule,
      moduleVersion,
      game: "wheel",
      action: "reset",
      source,
      previousSessionUid: previous ? previous.sessionUid : ""
    });

    return {
      ok: true,
      game: "wheel",
      reset: true,
      previousSession: previous
    };
  }

  function updateConfig(nextConfig, nextHostEnabled = hostEnabled) {
    config = normalizeConfig(nextConfig || config);
    hostEnabled = nextHostEnabled !== false;
    return getPublicConfig();
  }

  return {
    getPublicConfig,
    getStatus,
    spin,
    reset,
    updateConfig
  };
}

module.exports = {
  createWheelGame
};
