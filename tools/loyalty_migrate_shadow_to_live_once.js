#!/usr/bin/env node
"use strict";

/**
 * One-time migration for ForrestCGN stream-control-center Loyalty points.
 *
 * Purpose:
 * - Move existing shadow balances into live mode as auditable live transactions.
 * - Reset shadow aggregate fields for each user only after the live transaction is confirmed.
 *
 * Default mode is --dry-run. Use --apply to write changes.
 *
 * Examples:
 *   node tools/loyalty_migrate_shadow_to_live_once.js --dry-run
 *   node tools/loyalty_migrate_shadow_to_live_once.js --apply
  node tools/loyalty_migrate_shadow_to_live_once.js --clear-remaining-shadow --dry-run
  node tools/loyalty_migrate_shadow_to_live_once.js --clear-remaining-shadow --yes
 *   node tools/loyalty_migrate_shadow_to_live_once.js --apply --user urlug
 */

const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const MIGRATION_ID = "shadow-to-live-2026-06-16";
const TX_TYPE = "shadow_to_live_migration";
const TX_REASON = "loyalty_shadow_points_before_streamelements_import";
const SOURCE_MODULE = "loyalty";
const SOURCE_PROVIDER = "internal_migration";
const REFERENCE_TYPE = "shadow_to_live_migration";

function parseArgs(argv) {
  const args = {
    apply: false,
    dryRun: false,
    apiBase: process.env.SCC_API_BASE || "http://127.0.0.1:8080",
    dbPath: process.env.SCC_SQLITE_DB || "D:\\Streaming\\stramAssets\\data\\sqlite\\app.sqlite",
    user: "",
    limit: 0,
    yes: false,
    includeTestUsers: false,
    excludeLogins: [],
    clearRemainingShadow: false
  };

  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--apply") args.apply = true;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--yes" || a === "-y") args.yes = true;
    else if (a === "--api") args.apiBase = String(argv[++i] || args.apiBase);
    else if (a.startsWith("--api=")) args.apiBase = a.slice("--api=".length);
    else if (a === "--db") args.dbPath = String(argv[++i] || args.dbPath);
    else if (a.startsWith("--db=")) args.dbPath = a.slice("--db=".length);
    else if (a === "--user") args.user = normalizeLogin(argv[++i] || "");
    else if (a.startsWith("--user=")) args.user = normalizeLogin(a.slice("--user=".length));
    else if (a === "--limit") args.limit = Math.max(0, Number.parseInt(argv[++i] || "0", 10) || 0);
    else if (a.startsWith("--limit=")) args.limit = Math.max(0, Number.parseInt(a.slice("--limit=".length) || "0", 10) || 0);
    else if (a === "--include-test-users") args.includeTestUsers = true;
    else if (a === "--clear-remaining-shadow") args.clearRemainingShadow = true;
    else if (a === "--exclude-login") args.excludeLogins.push(normalizeLogin(argv[++i] || ""));
    else if (a.startsWith("--exclude-login=")) args.excludeLogins.push(normalizeLogin(a.slice("--exclude-login=".length)));
    else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unbekannter Parameter: ${a}`);
    }
  }

  if (args.clearRemainingShadow) args.apply = false;
  if (!args.apply) args.dryRun = true;
  return args;
}

function printHelp() {
  console.log(`
Loyalty Shadow -> Live Migration

Usage:
  node tools/loyalty_migrate_shadow_to_live_once.js --dry-run
  node tools/loyalty_migrate_shadow_to_live_once.js --apply
  node tools/loyalty_migrate_shadow_to_live_once.js --clear-remaining-shadow --dry-run
  node tools/loyalty_migrate_shadow_to_live_once.js --clear-remaining-shadow --yes

Options:
  --dry-run          Nur anzeigen, nichts buchen, nichts resetten. Default.
  --apply            Live-Transaktionen buchen und Shadow-Aggregate nach Erfolg nullen.
  --yes, -y          Sicherheitsbestaetigung fuer --apply.
  --user <login>     Nur einen User migrieren, z. B. --user urlug.
  --limit <n>        Maximal n User verarbeiten, hilfreich fuer kleine Tests.
  --api <url>        API Base, default: http://127.0.0.1:8080
  --db <path>        SQLite DB, default: D:\\Streaming\\stramAssets\\data\\sqlite\\app.sqlite
  --include-test-users  Test-/Bridge-/Diagnose-Accounts bewusst einbeziehen.
  --clear-remaining-shadow  Restliche Shadow-Werte fuer Test-/Systemuser ohne Live-Buchung nullen.

Vor --apply immer Backup machen:
  Copy-Item "D:\\Streaming\\stramAssets\\data\\sqlite\\app.sqlite" "D:\\Streaming\\stramAssets\\data\\sqlite\\app_before_shadow_to_live_$(Get-Date -Format yyyyMMdd_HHmmss).sqlite"
`);
}

function normalizeLogin(value) {
  return String(value || "").trim().toLowerCase().replace(/^@+/, "");
}

function toInt(value) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}

const DEFAULT_EXCLUDED_LOGIN_PATTERNS = [
  /^test[a-z0-9_]*$/i,
  /^cgn_test[a-z0-9_]*$/i,
  /^dedupetest[a-z0-9_]*$/i,
  /^watch(viewer|sub)$/i,
  /^presenceviewer$/i
];

function isDefaultExcludedLogin(login) {
  const normalized = normalizeLogin(login);
  return DEFAULT_EXCLUDED_LOGIN_PATTERNS.some((pattern) => pattern.test(normalized));
}

const CLEAR_REMAINING_SYSTEM_LOGINS = new Set([
  "forrestcgn",
  "soundalerts",
  "kofistreambot",
  "streamstickers"
]);

function getClearRemainingDecision(user, args) {
  const login = normalizeLogin(user?.login || "");
  if (!login) return { clearable: false, reason: "empty_login" };
  if (args.excludeLogins.includes(login)) return { clearable: true, reason: "manual_exclude" };
  if (!args.includeTestUsers && isDefaultExcludedLogin(login)) return { clearable: true, reason: "default_test_user_exclude" };
  if (CLEAR_REMAINING_SYSTEM_LOGINS.has(login)) return { clearable: true, reason: "known_ignored_or_system_user" };
  return { clearable: false, reason: "normal_user_not_clearable" };
}

function shouldExcludeUser(user, args) {
  const login = normalizeLogin(user?.login || "");
  if (!login) return { excluded: true, reason: "empty_login" };
  if (args.excludeLogins.includes(login)) return { excluded: true, reason: "manual_exclude" };
  if (!args.includeTestUsers && isDefaultExcludedLogin(login)) return { excluded: true, reason: "default_test_user_exclude" };
  return { excluded: false, reason: "" };
}

function openDb(dbPath) {
  if (!fs.existsSync(dbPath)) throw new Error(`SQLite DB nicht gefunden: ${dbPath}`);
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

function getTableColumns(db, tableName) {
  return db.prepare(`PRAGMA table_info(${tableName})`).all().map((r) => r.name);
}

function ensureColumns(db) {
  const userCols = getTableColumns(db, "loyalty_users");
  const txCols = getTableColumns(db, "loyalty_transactions");
  const neededUser = ["user_login", "user_display_name", "balance_shadow", "balance_live", "total_earned_shadow", "total_spent_shadow", "updated_at"];
  const neededTx = ["user_login", "type", "source_module", "source_provider", "reference_type", "reference_id"];
  const missingUser = neededUser.filter((c) => !userCols.includes(c));
  const missingTx = neededTx.filter((c) => !txCols.includes(c));
  if (missingUser.length) throw new Error(`loyalty_users Spalten fehlen: ${missingUser.join(", ")}`);
  if (missingTx.length) throw new Error(`loyalty_transactions Spalten fehlen: ${missingTx.join(", ")}`);
}

function optionalColumnSelect(cols, columnName, fallbackSql, alias) {
  if (cols.includes(columnName)) return `${columnName} AS ${alias}`;
  return `${fallbackSql} AS ${alias}`;
}

function listCandidates(db, args) {
  const userCols = getTableColumns(db, "loyalty_users");
  const ignoredSelect = optionalColumnSelect(userCols, "ignored", "0", "ignored");
  const params = {};
  const where = ["COALESCE(balance_shadow, 0) > 0"];
  if (args.user) {
    where.push("LOWER(user_login) = :user");
    params.user = args.user;
  }
  let sql = `
    SELECT
      user_login AS login,
      user_display_name AS displayName,
      COALESCE(balance_shadow, 0) AS balanceShadow,
      COALESCE(balance_live, 0) AS balanceLive,
      COALESCE(total_earned_shadow, 0) AS totalEarnedShadow,
      COALESCE(total_spent_shadow, 0) AS totalSpentShadow,
      ${ignoredSelect}
    FROM loyalty_users
    WHERE ${where.join(" AND ")}
    ORDER BY balance_shadow DESC, user_login ASC
  `;
  if (args.limit > 0) sql += " LIMIT :limit";
  if (args.limit > 0) params.limit = args.limit;
  return db.prepare(sql).all(params).map((row) => ({
    login: normalizeLogin(row.login),
    displayName: String(row.displayName || row.login || "").trim() || String(row.login || ""),
    balanceShadow: toInt(row.balanceShadow),
    balanceLive: toInt(row.balanceLive),
    totalEarnedShadow: toInt(row.totalEarnedShadow),
    totalSpentShadow: toInt(row.totalSpentShadow),
    ignored: Number(row.ignored || 0) === 1
  }));
}

function migrationReferenceId(login) {
  return `${MIGRATION_ID}:${normalizeLogin(login)}`;
}

function findExistingMigration(db, login) {
  return db.prepare(`
    SELECT transaction_uid AS uid, amount, created_at AS createdAt, reference_id AS referenceId
    FROM loyalty_transactions
    WHERE user_login = :login
      AND type = :type
      AND source_module = :sourceModule
      AND source_provider = :sourceProvider
      AND reference_type = :referenceType
      AND reference_id = :referenceId
    ORDER BY created_at DESC
    LIMIT 1
  `).get({
    login: normalizeLogin(login),
    type: TX_TYPE,
    sourceModule: SOURCE_MODULE,
    sourceProvider: SOURCE_PROVIDER,
    referenceType: REFERENCE_TYPE,
    referenceId: migrationReferenceId(login)
  }) || null;
}

function resetShadowAggregates(db, login) {
  const now = new Date().toISOString();
  return db.prepare(`
    UPDATE loyalty_users
    SET balance_shadow = 0,
        total_earned_shadow = 0,
        total_spent_shadow = 0,
        updated_at = :updatedAt
    WHERE user_login = :login
  `).run({ login: normalizeLogin(login), updatedAt: now });
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (_) { json = null; }
  if (!res.ok) {
    const msg = json?.message || json?.error || text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

function extractTransaction(response) {
  return response?.transaction || response?.data?.transaction || response?.result?.transaction || response?.payload?.transaction || null;
}

function extractIgnored(response) {
  if (response?.ignored === true) return true;
  if (response?.result?.ignored === true) return true;
  if (response?.data?.ignored === true) return true;
  return false;
}

async function migrateUser(db, args, user) {
  const referenceId = migrationReferenceId(user.login);
  const existing = findExistingMigration(db, user.login);
  if (existing) {
    return {
      login: user.login,
      displayName: user.displayName,
      amount: user.balanceShadow,
      status: "skipped_existing_migration",
      detail: `existing=${existing.uid || existing.referenceId || referenceId}`
    };
  }

  if (user.ignored) {
    return {
      login: user.login,
      displayName: user.displayName,
      amount: user.balanceShadow,
      status: "skipped_ignored_user",
      detail: "User ist ignored; /api/loyalty/transactions/adjust wuerde die Buchung ignorieren. Manuell pruefen."
    };
  }

  if (args.dryRun) {
    return {
      login: user.login,
      displayName: user.displayName,
      amount: user.balanceShadow,
      status: "dry_run",
      detail: `live ${user.balanceLive} -> ${user.balanceLive + user.balanceShadow}`
    };
  }

  const body = {
    login: user.login,
    displayName: user.displayName,
    amount: user.balanceShadow,
    type: TX_TYPE,
    reason: TX_REASON,
    mode: "live",
    sourceModule: SOURCE_MODULE,
    sourceProvider: SOURCE_PROVIDER,
    referenceType: REFERENCE_TYPE,
    referenceId,
    metadata: {
      migrationId: MIGRATION_ID,
      migratedAt: new Date().toISOString(),
      oldBalanceShadow: user.balanceShadow,
      oldBalanceLive: user.balanceLive,
      oldTotalEarnedShadow: user.totalEarnedShadow,
      oldTotalSpentShadow: user.totalSpentShadow,
      note: "Einmalige Uebernahme der vor dem StreamElements-Import im Shadow-Modus gesammelten Loyalty-Punkte nach Live."
    }
  };

  const response = await postJson(`${args.apiBase.replace(/\/+$/, "")}/api/loyalty/transactions/adjust`, body);
  if (!response || response.ok !== true) {
    throw new Error(`adjust_not_ok:${JSON.stringify(response || {})}`);
  }
  if (extractIgnored(response)) {
    return {
      login: user.login,
      displayName: user.displayName,
      amount: user.balanceShadow,
      status: "failed_ignored_by_api",
      detail: "API hat ignored_user gemeldet; Shadow bleibt unveraendert."
    };
  }

  const transaction = extractTransaction(response);
  const txFromDb = findExistingMigration(db, user.login);
  if (!transaction && !txFromDb) {
    throw new Error("adjust_ok_but_migration_transaction_not_found");
  }

  resetShadowAggregates(db, user.login);
  const after = db.prepare(`
    SELECT COALESCE(balance_shadow, 0) AS balanceShadow,
           COALESCE(balance_live, 0) AS balanceLive
    FROM loyalty_users
    WHERE user_login = :login
  `).get({ login: user.login });

  return {
    login: user.login,
    displayName: user.displayName,
    amount: user.balanceShadow,
    status: "migrated",
    detail: `live ${user.balanceLive} -> ${toInt(after?.balanceLive)}; shadow -> ${toInt(after?.balanceShadow)}`
  };
}

function printRows(rows) {
  const preview = rows.slice(0, 50).map((r) => ({
    login: r.login,
    displayName: r.displayName,
    shadow: r.balanceShadow,
    liveBefore: r.balanceLive,
    liveAfter: r.balanceLive + r.balanceShadow,
    ignored: r.ignored
  }));
  console.table(preview);
  if (rows.length > preview.length) console.log(`... ${rows.length - preview.length} weitere User nicht in der Vorschau angezeigt.`);
}

function printClearRemainingRows(title, rows) {
  console.log(title);
  console.table(rows.slice(0, 50).map((r) => ({
    login: r.login,
    displayName: r.displayName,
    shadow: r.balanceShadow,
    liveBefore: r.balanceLive,
    reason: r.clearReason || r.blockReason || ""
  })));
  if (rows.length > 50) console.log(`... ${rows.length - 50} weitere User nicht in der Vorschau angezeigt.`);
}

function clearRemainingShadow(db, args) {
  const rows = listCandidates(db, args);
  const clearable = [];
  const blocked = [];

  for (const user of rows) {
    const decision = getClearRemainingDecision(user, args);
    if (decision.clearable) clearable.push({ ...user, clearReason: decision.reason });
    else blocked.push({ ...user, blockReason: decision.reason });
  }

  const clearableShadow = clearable.reduce((sum, u) => sum + u.balanceShadow, 0);
  const blockedShadow = blocked.reduce((sum, u) => sum + u.balanceShadow, 0);

  console.log(`[loyalty-shadow-migration] clearRemainingShadow=${args.yes ? "APPLY" : "DRY-RUN"}`);
  console.log(`[loyalty-shadow-migration] clearable=${clearable.length} clearableShadow=${clearableShadow}`);
  console.log(`[loyalty-shadow-migration] blocked=${blocked.length} blockedShadow=${blockedShadow}`);

  if (clearable.length) printClearRemainingRows("Clearbare Rest-Shadow-User Vorschau:", clearable);
  if (blocked.length) printClearRemainingRows("NICHT clearbare normale User mit Shadow-Rest:", blocked);

  if (!clearable.length) {
    console.log("Keine clearbaren Rest-Shadow-Werte gefunden.");
    return { clearable: 0, cleared: 0, blocked: blocked.length, clearableShadow, blockedShadow };
  }

  if (!args.yes) {
    console.log("\nDRY-RUN: Es wurde nichts zurueckgesetzt.");
    console.log("Zum Anwenden nach DB-Backup ausfuehren:");
    console.log("node tools/loyalty_migrate_shadow_to_live_once.js --clear-remaining-shadow --yes");
    return { clearable: clearable.length, cleared: 0, blocked: blocked.length, clearableShadow, blockedShadow };
  }

  let cleared = 0;
  for (const user of clearable) {
    resetShadowAggregates(db, user.login);
    cleared += 1;
    console.log(`[cleared_shadow] ${user.login} amount=${user.balanceShadow} reason=${user.clearReason}`);
  }

  return { clearable: clearable.length, cleared, blocked: blocked.length, clearableShadow, blockedShadow };
}

async function main() {
  const args = parseArgs(process.argv);

  console.log(`[loyalty-shadow-migration] migrationId=${MIGRATION_ID}`);
  console.log(`[loyalty-shadow-migration] mode=${args.clearRemainingShadow ? (args.yes ? "CLEAR-REMAINING-SHADOW" : "CLEAR-REMAINING-SHADOW-DRY-RUN") : (args.apply ? "APPLY" : "DRY-RUN")}`);
  console.log(`[loyalty-shadow-migration] api=${args.apiBase}`);
  console.log(`[loyalty-shadow-migration] db=${args.dbPath}`);

  if (args.apply && !args.yes) {
    throw new Error("--apply braucht --yes. Vorher DB-Backup machen.");
  }

  const db = openDb(args.dbPath);
  try {
    ensureColumns(db);

    if (args.clearRemainingShadow) {
      const summary = clearRemainingShadow(db, args);
      console.log("\nZusammenfassung:");
      console.log(JSON.stringify(summary, null, 2));
      const remaining = db.prepare(`
        SELECT COUNT(*) AS count, COALESCE(SUM(balance_shadow), 0) AS total
        FROM loyalty_users
        WHERE COALESCE(balance_shadow, 0) > 0
      `).get();
      console.log(`remainingShadowUsers=${toInt(remaining?.count)} remainingShadowTotal=${toInt(remaining?.total)}`);
      return;
    }

    const rawCandidates = listCandidates(db, args);
    const excludedCandidates = [];
    const candidates = [];
    for (const user of rawCandidates) {
      const decision = shouldExcludeUser(user, args);
      if (decision.excluded) {
        excludedCandidates.push({ ...user, excludeReason: decision.reason });
      } else {
        candidates.push(user);
      }
    }
    const totalShadow = candidates.reduce((sum, u) => sum + u.balanceShadow, 0);
    const excludedShadow = excludedCandidates.reduce((sum, u) => sum + u.balanceShadow, 0);

    console.log(`[loyalty-shadow-migration] candidates=${candidates.length} totalShadow=${totalShadow}`);
    console.log(`[loyalty-shadow-migration] excluded=${excludedCandidates.length} excludedShadow=${excludedShadow}`);
    if (excludedCandidates.length) {
      console.log("Ausgeschlossene User Vorschau:");
      console.table(excludedCandidates.slice(0, 30).map((r) => ({
        login: r.login,
        displayName: r.displayName,
        shadow: r.balanceShadow,
        liveBefore: r.balanceLive,
        reason: r.excludeReason
      })));
      if (excludedCandidates.length > 30) console.log(`... ${excludedCandidates.length - 30} weitere ausgeschlossene User nicht in der Vorschau angezeigt.`);
    }

    if (!candidates.length) {
      console.log("Keine User mit balanceShadow > 0 gefunden. Nichts zu tun.");
      return;
    }
    printRows(candidates);

    const results = [];
    for (const user of candidates) {
      try {
        const result = await migrateUser(db, args, user);
        results.push(result);
        console.log(`[${result.status}] ${result.login} amount=${result.amount} ${result.detail || ""}`);
      } catch (err) {
        const result = {
          login: user.login,
          displayName: user.displayName,
          amount: user.balanceShadow,
          status: "failed",
          detail: err.message || String(err)
        };
        results.push(result);
        console.error(`[failed] ${result.login} amount=${result.amount} ${result.detail}`);
      }
    }

    const summary = results.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      if (r.status === "migrated" || r.status === "dry_run") acc.amount += r.amount;
      return acc;
    }, { amount: 0 });

    console.log("\nZusammenfassung:");
    console.log(JSON.stringify(summary, null, 2));

    const remaining = db.prepare(`
      SELECT COUNT(*) AS count, COALESCE(SUM(balance_shadow), 0) AS total
      FROM loyalty_users
      WHERE COALESCE(balance_shadow, 0) > 0
    `).get();
    console.log(`remainingShadowUsers=${toInt(remaining?.count)} remainingShadowTotal=${toInt(remaining?.total)}`);

    if (args.dryRun) {
      console.log("\nDRY-RUN: Es wurde nichts gebucht und nichts zurueckgesetzt.");
      console.log("Zum Anwenden nach DB-Backup ausfuehren:");
      console.log("node tools/loyalty_migrate_shadow_to_live_once.js --apply --yes");
      if (!args.includeTestUsers) {
        console.log("Hinweis: Test-/Bridge-/Diagnose-Accounts bleiben standardmaessig ausgeschlossen. Mit --include-test-users koennen sie bewusst einbezogen werden.");
      }
    }
  } finally {
    try { db.close(); } catch (_) {}
  }
}

main().catch((err) => {
  console.error(`[loyalty-shadow-migration] ERROR: ${err.message || String(err)}`);
  process.exitCode = 1;
});
