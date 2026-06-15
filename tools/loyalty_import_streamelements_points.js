#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

const DEFAULT_BASE_URL = "http://127.0.0.1:8080";
const DEFAULT_REFERENCE_ID = "streamelements_top489_2026-06-15";
const DEFAULT_EXCLUDED_LOGINS = new Set([
  "anonymous",
  "streamstickers",
  "kofistreambot",
  "heimaufsichtcgn",
  "crazy_gamming_network",
  "moobot",
  "blerp",
  "eklipse_chat_12",
  "valorant"
]);

function parseArgs(argv) {
  const args = {
    file: "",
    baseUrl: DEFAULT_BASE_URL,
    dryRun: false,
    commit: false,
    allowExcluded: false,
    referenceId: DEFAULT_REFERENCE_ID
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--commit") args.commit = true;
    else if (arg === "--allow-excluded") args.allowExcluded = true;
    else if (arg === "--file") args.file = argv[++i] || "";
    else if (arg.startsWith("--file=")) args.file = arg.slice("--file=".length);
    else if (arg === "--base-url") args.baseUrl = argv[++i] || DEFAULT_BASE_URL;
    else if (arg.startsWith("--base-url=")) args.baseUrl = arg.slice("--base-url=".length);
    else if (arg === "--reference-id") args.referenceId = argv[++i] || DEFAULT_REFERENCE_ID;
    else if (arg.startsWith("--reference-id=")) args.referenceId = arg.slice("--reference-id=".length);
    else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unbekannter Parameter: ${arg}`);
    }
  }

  if (!args.file) throw new Error("Pflichtparameter fehlt: --file <csv>");
  if (args.commit && args.dryRun) throw new Error("Nutze entweder --dry-run oder --commit, nicht beides.");
  if (!args.commit) args.dryRun = true;
  return args;
}

function printHelp() {
  console.log(`Loyalty StreamElements Punkteimport\n\nUsage:\n  node tools/loyalty_import_streamelements_points.js --file data/imports/streamelements_points_top489_2026-06-15.csv --dry-run\n  node tools/loyalty_import_streamelements_points.js --file data/imports/streamelements_points_top489_2026-06-15.csv --commit\n\nOptionen:\n  --file <csv>              CSV mit rank,login,displayName,points\n  --base-url <url>          Standard: ${DEFAULT_BASE_URL}\n  --reference-id <id>       Standard: ${DEFAULT_REFERENCE_ID}\n  --allow-excluded          Import blockierter Service-/Bot-Logins erlauben\n  --dry-run                 Nur prüfen, nichts schreiben\n  --commit                  Über /api/loyalty/transactions/adjust importieren\n`);
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === "," && !quoted) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function readCsv(filePath) {
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (!lines.length) throw new Error("CSV ist leer.");

  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const required = ["rank", "login", "points"];
  for (const key of required) {
    if (!header.includes(key)) throw new Error(`CSV-Spalte fehlt: ${key}`);
  }

  return lines.slice(1).map((line, index) => {
    const cols = parseCsvLine(line);
    const row = {};
    header.forEach((key, colIndex) => {
      row[key] = (cols[colIndex] || "").trim();
    });
    row.__line = index + 2;
    return row;
  });
}

function normalizeLogin(value) {
  return String(value || "").trim().toLowerCase();
}

function validateRows(rows, allowExcluded) {
  const valid = [];
  const invalid = [];
  const excluded = [];
  const duplicates = [];
  const seen = new Map();

  for (const row of rows) {
    const rank = Number.parseInt(row.rank, 10);
    const login = normalizeLogin(row.login);
    const displayName = String(row.displayName || row.login || "").trim() || login;
    const points = Number.parseInt(String(row.points || "").replace(/\./g, ""), 10);

    const normalized = { line: row.__line, rank, login, displayName, points };

    if (!login || !/^[a-z0-9_]{1,25}$/.test(login)) {
      invalid.push({ ...normalized, reason: "invalid_login" });
      continue;
    }
    if (!Number.isInteger(rank) || rank <= 0) {
      invalid.push({ ...normalized, reason: "invalid_rank" });
      continue;
    }
    if (!Number.isInteger(points) || points <= 0) {
      invalid.push({ ...normalized, reason: "invalid_points" });
      continue;
    }
    if (seen.has(login)) {
      duplicates.push({ ...normalized, firstLine: seen.get(login).line, reason: "duplicate_login" });
      continue;
    }
    seen.set(login, normalized);

    if (!allowExcluded && DEFAULT_EXCLUDED_LOGINS.has(login)) {
      excluded.push({ ...normalized, reason: "excluded_login" });
      continue;
    }

    valid.push(normalized);
  }

  return { valid, invalid, excluded, duplicates };
}

function sumPoints(rows) {
  return rows.reduce((sum, row) => sum + Number(row.points || 0), 0);
}

function formatInt(value) {
  return new Intl.NumberFormat("de-DE").format(Number(value || 0));
}

function printSummary(label, validation) {
  console.log(`\n${label}`);
  console.log("=".repeat(label.length));
  console.log(`Importierbare User: ${formatInt(validation.valid.length)}`);
  console.log(`Importierbare Punkte: ${formatInt(sumPoints(validation.valid))}`);
  console.log(`Ausgeschlossen: ${formatInt(validation.excluded.length)} / ${formatInt(sumPoints(validation.excluded))} Punkte`);
  console.log(`Dubletten: ${formatInt(validation.duplicates.length)}`);
  console.log(`Ungültig: ${formatInt(validation.invalid.length)}`);

  const top = validation.valid.slice().sort((a, b) => b.points - a.points).slice(0, 10);
  console.log("\nTop 10 Import:");
  for (const row of top) {
    console.log(`  ${String(row.rank).padStart(3, " ")}  ${row.login.padEnd(28, " ")} ${formatInt(row.points).padStart(10, " ")}`);
  }

  if (validation.excluded.length) {
    console.log("\nAusgeschlossene Logins:");
    for (const row of validation.excluded) {
      console.log(`  ${String(row.rank).padStart(3, " ")}  ${row.login.padEnd(28, " ")} ${formatInt(row.points).padStart(10, " ")}`);
    }
  }

  if (validation.duplicates.length) {
    console.log("\nDubletten:");
    for (const row of validation.duplicates) {
      console.log(`  Zeile ${row.line}: ${row.login} bereits in Zeile ${row.firstLine}`);
    }
  }

  if (validation.invalid.length) {
    console.log("\nUngültige Zeilen:");
    for (const row of validation.invalid) {
      console.log(`  Zeile ${row.line}: ${row.reason} (${row.login}, ${row.points})`);
    }
  }
}

function postJson(baseUrl, route, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(route, baseUrl);
    const payload = Buffer.from(JSON.stringify(body), "utf8");
    const transport = url.protocol === "https:" ? https : http;
    const req = transport.request({
      method: "POST",
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": payload.length
      }
    }, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        let parsed = null;
        try { parsed = data ? JSON.parse(data) : null; } catch (err) { parsed = { raw: data }; }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          return;
        }
        resolve(parsed);
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function commitRows(args, rows) {
  console.log(`\nCommit startet: ${formatInt(rows.length)} User / ${formatInt(sumPoints(rows))} Punkte`);
  let ok = 0;
  let ignored = 0;
  const failed = [];

  for (const row of rows) {
    const body = {
      login: row.login,
      displayName: row.displayName,
      amount: row.points,
      mode: "live",
      type: "legacy_points_import",
      reason: "streamelements_points_import",
      sourceModule: "loyalty_import_tool",
      sourceProvider: "streamelements",
      referenceType: "legacy_points_import",
      referenceId: args.referenceId,
      metadata: {
        importProvider: "streamelements",
        importName: args.referenceId,
        sourceRank: row.rank,
        sourcePoints: row.points,
        sourceFile: path.basename(args.file)
      }
    };

    try {
      const result = await postJson(args.baseUrl, "/api/loyalty/transactions/adjust", body);
      if (result && result.ignored) ignored += 1;
      else ok += 1;
      if ((ok + ignored) % 25 === 0 || ok + ignored === rows.length) {
        console.log(`  Fortschritt: ${formatInt(ok + ignored)}/${formatInt(rows.length)} verarbeitet`);
      }
    } catch (err) {
      failed.push({ row, error: err && err.message ? err.message : String(err) });
      console.error(`  FEHLER ${row.login}: ${failed[failed.length - 1].error}`);
      break;
    }
  }

  console.log("\nCommit Ergebnis");
  console.log("===============");
  console.log(`Erfolgreich: ${formatInt(ok)}`);
  console.log(`Vom Loyalty-System ignoriert: ${formatInt(ignored)}`);
  console.log(`Fehler: ${formatInt(failed.length)}`);

  if (failed.length) {
    process.exitCode = 2;
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const filePath = path.resolve(process.cwd(), args.file);
  const rows = readCsv(filePath);
  const validation = validateRows(rows, args.allowExcluded);

  printSummary(args.dryRun ? "Dry-Run StreamElements Import" : "Commit-Prüfung StreamElements Import", validation);

  if (validation.invalid.length || validation.duplicates.length) {
    throw new Error("Import abgebrochen: CSV enthält ungültige Zeilen oder Dubletten.");
  }

  if (args.dryRun) {
    console.log("\nDry-Run fertig. Es wurde nichts geschrieben.");
    return;
  }

  await commitRows(args, validation.valid);
}

main().catch((err) => {
  console.error(`\nABBRUCH: ${err && err.message ? err.message : String(err)}`);
  process.exit(1);
});
