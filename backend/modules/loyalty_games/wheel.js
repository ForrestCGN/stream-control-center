"use strict";

const shared = require("./shared");

function createWheelGame(options = {}) {
  const hostModule = options.hostModule || "loyalty_games";
  const moduleVersion = options.moduleVersion || "0.1.0";
  const db = options.db || {};
  const broadcast = typeof options.broadcast === "function" ? options.broadcast : () => false;
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
      fields: Array.isArray(source.fields) ? source.fields : []
    };
  }

  function getFields() {
    return shared.normalizeFields(config.fields);
  }

  function getPublicConfig() {
    return {
      enabled: !!config.enabled,
      mode: config.mode,
      cost: { ...config.cost },
      spin: { ...config.spin },
      overlay: { ...config.overlay },
      fields: getFields().map(shared.publicField)
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
        selectedFieldLabel: active.selectedFieldLabel
      } : null,
      lastResult,
      fields: fields.length,
      mode: config.mode,
      costEnabled: !!config.cost.enabled,
      costAmount: Number(config.cost.amount || 0),
      lastError
    };
  }

  function finishActive(sessionUid) {
    if (!active || active.sessionUid !== sessionUid) return null;
    const finishedAt = nowIso();
    const result = {
      sessionUid: active.sessionUid,
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

    lastResult = result;
    active = null;
    broadcast({
      type: "loyalty.wheel.finished",
      module: hostModule,
      moduleVersion,
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

      const fields = getFields();
      if (!fields.length) {
        return { ok: false, error: "wheel_no_enabled_fields", statusCode: 400 };
      }

      const selectedNormalizedIndex = shared.pickWeightedIndex(fields);
      if (selectedNormalizedIndex < 0) {
        return { ok: false, error: "wheel_random_selection_failed", statusCode: 500 };
      }

      const selected = fields[selectedNormalizedIndex];
      const durationMs = shared.parseDuration(input, config.spin);
      const extraTurns = shared.parseExtraTurns(config.spin);
      const login = shared.normalizeLogin(input.login || input.user || input.userLogin || "");
      const displayName = shared.cleanDisplayName(login, input.displayName || input.display || input.userDisplayName || "");
      const source = String(input.source || "api").trim() || "api";
      const sessionUid = shared.uid("wheel");
      const startedAt = nowIso();
      const endsAt = new Date(Date.parse(startedAt) + durationMs).toISOString();
      const costAmount = config.cost.enabled ? Number(config.cost.amount || 0) : 0;

      const metadata = {
        inputSource: source,
        backendRandom: true,
        randomMethod: "crypto.randomInt",
        selectedNormalizedIndex,
        selectedOriginalIndex: selected.index,
        fieldsCount: fields.length,
        extraTurns,
        note: "V1 records the spin and selected field only. It does not book points or execute rewards yet."
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
        selectedFieldIndex: selectedNormalizedIndex,
        selectedFieldLabel: selected.label,
        costAmount,
        mode: config.mode,
        startedAt,
        metadata
      }) : null;

      active = {
        sessionUid,
        status: "running",
        timer: setTimeout(() => finishActive(sessionUid), durationMs),
        startedAt,
        endsAt,
        durationMs,
        selectedFieldId: selected.id,
        selectedFieldIndex: selectedNormalizedIndex,
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
        durationMs,
        extraTurns,
        startedAt,
        endsAt,
        fields: fields.map(shared.publicField),
        selectedFieldIndex: selectedNormalizedIndex,
        selectedFieldId: selected.id,
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

      broadcast(event);

      lastError = "";
      return {
        ok: true,
        game: "wheel",
        sessionUid,
        durationMs,
        extraTurns,
        startedAt,
        endsAt,
        selectedFieldIndex: selectedNormalizedIndex,
        selectedFieldId: selected.id,
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
