
"use strict";

/**
 * STEP224 / LWG-6.5:
 * - Keeps raw gamble result complete for flattened runtime/log responses in loyalty_games.js.
 *
 * STEP222 / LWG-6.3:
 * - Supports percent syntax variants for chat input, e.g. !gamble 10%, !gamble 10 %, !gamble 10 prozent.
 * - Adds optional half/halb aliases when percent bets are enabled.
 * - Uses new v2 chat text keys for cleaner CGN/Kekskruemel output.
 */

const crypto = require("crypto");

function uid(prefix = "gamble") {
  if (typeof crypto.randomUUID === "function") return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
}

function normalizeLogin(value) {
  return String(value || "").trim().replace(/^@/, "").toLowerCase();
}

function cleanDisplayName(login, value) {
  return String(value || login || "").trim() || login;
}

function int(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  const raw = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "ja", "on"].includes(raw)) return true;
  if (["0", "false", "no", "nein", "off"].includes(raw)) return false;
  return fallback;
}

function normalizeConfig(source = {}) {
  const chance = Number(source.winChancePercent ?? source.win_chance_percent ?? 47);
  const payout = Number(source.payoutMultiplier ?? source.payout_multiplier ?? 2);
  return {
    enabled: source.enabled === true,
    mode: String(source.mode || "shadow").trim() || "shadow",
    minBet: Math.max(1, int(source.minBet ?? source.min_bet ?? 1, 1)),
    maxBet: Math.max(1, int(source.maxBet ?? source.max_bet ?? 1000, 1000)),
    allowPercent: bool(source.allowPercent ?? source.allow_percent, true),
    minPercent: Math.max(1, Math.min(100, int(source.minPercent ?? source.min_percent ?? 1, 1))),
    maxPercent: Math.max(1, Math.min(100, int(source.maxPercent ?? source.max_percent ?? 100, 100))),
    allowAll: bool(source.allowAll ?? source.allow_all, false),
    winChancePercent: Math.max(0, Math.min(100, Number.isFinite(chance) ? chance : 47)),
    payoutMultiplier: Math.max(1, Number.isFinite(payout) ? payout : 2),
    userCooldownMs: Math.max(0, int(source.userCooldownMs ?? source.cooldownUserMs ?? source.user_cooldown_ms ?? 60000, 60000)),
    globalCooldownMs: Math.max(0, int(source.globalCooldownMs ?? source.cooldownGlobalMs ?? source.global_cooldown_ms ?? 0, 0)),
    liveOnly: bool(source.liveOnly ?? source.live_only, false)
  };
}

function createGambleGame(options = {}) {
  const hostModule = options.hostModule || "loyalty_games";
  const moduleVersion = options.moduleVersion || "0.2.1";
  const db = options.db || {};
  const loyalty = options.loyalty || {};
  const emitEvent = typeof options.emitEvent === "function" ? options.emitEvent : () => false;
  const broadcast = typeof options.broadcast === "function" ? options.broadcast : () => false;
  const renderText = typeof options.renderText === "function" ? options.renderText : () => "";
  const nowIso = typeof options.nowIso === "function" ? options.nowIso : () => new Date().toISOString();

  let config = normalizeConfig(options.config || {});
  let hostEnabled = options.hostEnabled !== false;
  let lastResult = null;
  let lastError = "";
  let lastGlobalPlayAt = 0;
  const userCooldowns = new Map();

  function updateConfig(nextConfig = {}, nextHostEnabled = hostEnabled) {
    config = normalizeConfig(nextConfig || {});
    hostEnabled = nextHostEnabled !== false;
    return getPublicConfig();
  }

  function getPublicConfig() {
    return {
      enabled: !!config.enabled,
      mode: config.mode,
      minBet: config.minBet,
      maxBet: config.maxBet,
      allowPercent: config.allowPercent,
      minPercent: config.minPercent,
      maxPercent: config.maxPercent,
      allowAll: config.allowAll,
      winChancePercent: config.winChancePercent,
      payoutMultiplier: config.payoutMultiplier,
      userCooldownMs: config.userCooldownMs,
      globalCooldownMs: config.globalCooldownMs,
      liveOnly: config.liveOnly
    };
  }

  function getStatus() {
    const moduleEnabled = !!hostEnabled;
    const configEnabled = !!config.enabled;
    return {
      ok: !lastError,
      game: "gamble",
      enabled: moduleEnabled,
      moduleEnabled,
      moduleOnline: true,
      gameReady: moduleEnabled && !lastError,
      configEnabled,
      playEnabled: moduleEnabled && configEnabled,
      running: false,
      lastResult,
      config: getPublicConfig(),
      cooldowns: {
        users: userCooldowns.size,
        globalActive: config.globalCooldownMs > 0 && Date.now() - lastGlobalPlayAt < config.globalCooldownMs
      },
      random: {
        serverSide: true,
        method: "crypto.randomInt",
        predictableByUser: false
      },
      lastError
    };
  }

  function extractBetRaw(input = {}) {
    if (input.bet !== undefined) return String(input.bet).trim();
    if (input.amount !== undefined) return String(input.amount).trim();
    if (Array.isArray(input.args) && input.args.length) {
      const args = input.args.map(item => String(item || "").trim()).filter(Boolean);
      if (args.length >= 2 && /^\d+(?:[.,]\d+)?$/.test(args[0]) && /^(%|prozent|percent|pct)$/i.test(args[1])) return `${args[0]}%`;
      return args[0] || "";
    }
    const raw = String(input.argText || input.rawArgs || "").trim();
    if (raw) {
      const parts = raw.split(/\s+/).filter(Boolean);
      if (parts.length >= 2 && /^\d+(?:[.,]\d+)?$/.test(parts[0]) && /^(%|prozent|percent|pct)$/i.test(parts[1])) return `${parts[0]}%`;
      return parts[0] || "";
    }
    return "";
  }

  function parseBet(input = {}, summary = {}) {
    const raw = extractBetRaw(input);
    const available = Math.max(0, Number(summary.available || 0));
    if (!raw) return { ok: false, error: "gamble_bet_required", raw, bet: 0 };

    const normalizedRaw = raw.toLowerCase().replace(/\s+/g, "").replace(",", ".");

    if (/^(all|alles|allin|all-in|max|maximum)$/i.test(normalizedRaw)) {
      if (!config.allowAll) return { ok: false, error: "gamble_all_disabled", raw, bet: 0 };
      return { ok: true, raw, bet: available, mode: "all", percent: 100 };
    }

    if (/^(half|halb|halbe|haelfte|hälfte)$/i.test(normalizedRaw)) {
      if (!config.allowPercent) return { ok: false, error: "gamble_percent_disabled", raw, bet: 0 };
      const percent = 50;
      if (percent < config.minPercent) return { ok: false, error: "gamble_percent_below_min", raw, bet: 0, percent, minPercent: config.minPercent };
      if (percent > config.maxPercent) return { ok: false, error: "gamble_percent_above_max", raw, bet: 0, percent, maxPercent: config.maxPercent };
      return { ok: true, raw, bet: Math.floor((available * percent) / 100), mode: "percent", percent };
    }

    const percentMatch = normalizedRaw.match(/^(\d+(?:\.\d+)?)(%|prozent|percent|pct|p)$/i);
    if (percentMatch) {
      if (!config.allowPercent) return { ok: false, error: "gamble_percent_disabled", raw, bet: 0 };
      const percent = Number.parseFloat(percentMatch[1]);
      if (!Number.isFinite(percent) || percent <= 0) return { ok: false, error: "gamble_invalid_percent", raw, bet: 0 };
      if (percent < config.minPercent) return { ok: false, error: "gamble_percent_below_min", raw, bet: 0, percent, minPercent: config.minPercent };
      if (percent > config.maxPercent) return { ok: false, error: "gamble_percent_above_max", raw, bet: 0, percent, maxPercent: config.maxPercent };
      return { ok: true, raw, bet: Math.floor((available * percent) / 100), mode: "percent", percent };
    }

    const clean = raw.toLowerCase().replace(/\./g, "").replace(/,/g, "");
    let multiplier = 1;
    let numericRaw = clean;
    if (clean.endsWith("k")) { multiplier = 1000; numericRaw = clean.slice(0, -1); }
    if (clean.endsWith("m")) { multiplier = 1000000; numericRaw = clean.slice(0, -1); }
    const amount = Math.floor(Number.parseFloat(numericRaw) * multiplier);
    if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "gamble_invalid_amount", raw, bet: 0 };
    return { ok: true, raw, bet: amount, mode: multiplier === 1 ? "fixed" : "short_number" };
  }

  function checkCooldown(login) {
    const now = Date.now();
    if (config.globalCooldownMs > 0 && lastGlobalPlayAt && now - lastGlobalPlayAt < config.globalCooldownMs) {
      return { ok: false, error: "gamble_global_cooldown", waitMs: config.globalCooldownMs - (now - lastGlobalPlayAt) };
    }
    const lastUser = Number(userCooldowns.get(login) || 0);
    if (config.userCooldownMs > 0 && lastUser && now - lastUser < config.userCooldownMs) {
      return { ok: false, error: "gamble_user_cooldown", waitMs: config.userCooldownMs - (now - lastUser) };
    }
    return { ok: true };
  }

  function markCooldown(login) {
    const now = Date.now();
    lastGlobalPlayAt = now;
    userCooldowns.set(login, now);
  }

  function renderResultMessage(key, context = {}) {
    return renderText(key, context, { maxLength: 450 });
  }

  function play(input = {}) {
    try {
      if (!hostEnabled) return { ok: false, error: "loyalty_games_disabled", statusCode: 403 };
      if (!config.enabled) return { ok: false, error: "gamble_disabled", statusCode: 403 };
      if (!loyalty || typeof loyalty.getBalanceSummary !== "function" || typeof loyalty.spendPointsSafely !== "function" || typeof loyalty.awardPoints !== "function") {
        return { ok: false, error: "loyalty_safety_layer_unavailable", statusCode: 503 };
      }

      const login = normalizeLogin(input.login || input.user || input.userLogin || input.username);
      if (!login) return { ok: false, error: "user_login_required", statusCode: 400 };
      const displayName = cleanDisplayName(login, input.displayName || input.userDisplayName || input.display || input.username);
      const summaryBefore = loyalty.getBalanceSummary(login, { displayName, create: true });
      const parsedBet = parseBet(input, summaryBefore);
      if (!parsedBet.ok) return { ok: false, error: parsedBet.error, statusCode: 400, parsedBet, summary: summaryBefore };
      const bet = Math.floor(Number(parsedBet.bet || 0));

      if (bet < config.minBet) return { ok: false, error: "gamble_bet_below_min", statusCode: 400, bet, minBet: config.minBet, summary: summaryBefore };
      if (bet > config.maxBet) return { ok: false, error: "gamble_bet_above_max", statusCode: 400, bet, maxBet: config.maxBet, summary: summaryBefore };
      if (bet > summaryBefore.available) return { ok: false, error: "gamble_insufficient_available_balance", statusCode: 409, bet, available: summaryBefore.available, summary: summaryBefore };

      const cooldown = checkCooldown(login);
      if (!cooldown.ok) return { ok: false, statusCode: 429, ...cooldown, bet, summary: summaryBefore };

      const sessionUid = uid("gamble");
      const startedAt = nowIso();
      const referenceId = sessionUid;
      const winThreshold = Math.floor(config.winChancePercent * 100);
      const roll = crypto.randomInt(0, 10000);
      const won = roll < winThreshold;
      const grossPayout = won ? bet : 0;
      const netProfit = won ? bet : -bet;

      let spend = null;
      let payout = null;

      if (won) {
        payout = loyalty.awardPoints({
          login,
          displayName,
          amount: bet,
          type: "game_gamble_win",
          reason: "gamble_win",
          mode: summaryBefore.mode,
          sourceModule: hostModule,
          sourceProvider: "loyalty_games",
          referenceType: "gamble_session",
          referenceId,
          metadata: {
            sessionUid,
            bet,
            grossPayout,
            netProfit,
            winChancePercent: config.winChancePercent,
            payoutMultiplier: config.payoutMultiplier,
            randomMethod: "crypto.randomInt",
            resultPreparedServerSide: true,
            simpleWinLossMode: true
          }
        });
        if (!payout || !payout.ok) return { ok: false, error: payout?.error || "gamble_payout_failed", statusCode: 409, payout, summary: summaryBefore };
      } else {
        spend = loyalty.spendPointsSafely({
          login,
          displayName,
          amount: bet,
          type: "game_gamble_loss",
          reason: "gamble_loss",
          mode: summaryBefore.mode,
          sourceModule: hostModule,
          sourceProvider: "loyalty_games",
          referenceType: "gamble_session",
          referenceId,
          metadata: {
            sessionUid,
            bet,
            parsedBet,
            grossPayout,
            netProfit,
            winChancePercent: config.winChancePercent,
            payoutMultiplier: config.payoutMultiplier,
            randomMethod: "crypto.randomInt",
            resultPreparedServerSide: true,
            simpleWinLossMode: true
          }
        });
        if (!spend.ok) return { ok: false, error: spend.error || "gamble_spend_failed", statusCode: 409, spend, summary: summaryBefore };
      }

      markCooldown(login);
      const summaryAfter = loyalty.getBalanceSummary(login, { displayName, create: false });
      const rankAfter = typeof loyalty.getAvailableRank === "function" ? loyalty.getAvailableRank(login, { mode: summaryAfter.mode, includeZero: false }) : { rank: null, rankTotal: 0 };
      const result = {
        ok: true,
        game: "gamble",
        sessionUid,
        login,
        displayName,
        bet,
        rawBet: parsedBet.raw,
        betMode: parsedBet.mode,
        percent: parsedBet.percent || null,
        won,
        grossPayout,
        netProfit,
        winChancePercent: config.winChancePercent,
        payoutMultiplier: config.payoutMultiplier,
        startedAt,
        finishedAt: nowIso(),
        summaryBefore,
        summaryAfter,
        rankAfter,
        transactions: {
          spend: spend.transaction || null,
          payout: payout && payout.transaction ? payout.transaction : null
        },
        random: {
          method: "crypto.randomInt",
          serverSide: true,
          predictableByUser: false,
          note: "No seed is exposed or persisted. Roll value is not returned."
        }
      };

      if (typeof db.insertSession === "function") {
        db.insertSession({
          sessionUid,
          gameKey: "gamble",
          login,
          displayName,
          status: "finished",
          source: input.source || "api",
          durationMs: 0,
          selectedFieldId: won ? "win" : "lose",
          selectedFieldIndex: won ? 1 : 0,
          selectedFieldLabel: won ? "Gewonnen" : "Verloren",
          costAmount: bet,
          mode: summaryBefore.mode,
          startedAt,
          finishedAt: result.finishedAt,
          metadata: {
            bet,
            rawBet: parsedBet.raw,
            betMode: parsedBet.mode,
            percent: parsedBet.percent || null,
            won,
            grossPayout,
            netProfit,
            winChancePercent: config.winChancePercent,
            payoutMultiplier: config.payoutMultiplier,
            transactionUids: {
              spend: spend && spend.transaction ? spend.transaction.uid : "",
              payout: payout && payout.transaction ? payout.transaction.uid : ""
            },
            random: result.random
          }
        });
      }

      const textContext = {
        user: displayName,
        bet,
        amount: bet,
        rawBet: parsedBet.raw,
        betMode: parsedBet.mode,
        percent: parsedBet.percent || "",
        percentLabel: parsedBet.percent ? `${parsedBet.percent}%` : "",
        payout: grossPayout,
        profit: netProfit,
        points: summaryAfter.available,
        available: summaryAfter.available,
        rank: rankAfter.rank || "-",
        rankTotal: rankAfter.rankTotal || 0,
        currencyName: summaryAfter.currencyName || "Kekskrümel"
      };
      result.messageKey = won ? "gamble.win_v2" : "gamble.lose_v2";
      result.message = renderResultMessage(result.messageKey, textContext);

      lastResult = {
        sessionUid,
        login,
        displayName,
        bet,
        won,
        grossPayout,
        netProfit,
        finishedAt: result.finishedAt
      };
      lastError = "";

      emitEvent("loyalty.game.gamble.played", result);
      broadcast({ type: "loyalty.gamble.played", module: hostModule, moduleVersion, event: "loyalty.event", ...lastResult, message: result.message });
      return result;
    } catch (err) {
      lastError = err && err.message ? err.message : String(err);
      return { ok: false, error: lastError, statusCode: 500 };
    }
  }

  return { updateConfig, getPublicConfig, getStatus, parseBet, play };
}

module.exports = { createGambleGame };
