#!/usr/bin/env node
"use strict";

/**
 * STEP274N - Media Registry Category/File Migration Planner
 *
 * Ziel:
 * - vorhandene media_assets sicher in die neue Struktur planen:
 *   htdocs/assets/media/<moduleKey>/<categoryKey>/<file>
 * - Standard ist Dry-Run: keine Datei- und keine DB-Aenderung.
 * - Apply-Modus schreibt vor Aenderungen ein Backup/Report.
 * - Dateien werden nur kopiert, nie geloescht.
 *
 * Beispiele:
 *   node tools/media_registry_migrate_categories.js --dry-run
 *   node tools/media_registry_migrate_categories.js --dry-run --map-file config/media_migration_plan.json
 *   node tools/media_registry_migrate_categories.js --apply --copy-files --map-file config/media_migration_plan.json
 *
 * STEP274Q Hotfix:
 * - Zielpfade werden im Plan eindeutig reserviert, auch wenn Dateien beim Dry-Run noch nicht existieren.
 * - DB-Updates laufen zweiphasig ueber temporaere Unique-Pfade, damit SQLite UNIQUE(relative_path)
 *   nicht durch alte Pfade blockiert wird, die innerhalb derselben Migration erst spaeter frei werden.
 */

const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const STEP = "STEP274Q";
const DEFAULT_ROOT = process.env.STREAM_ASSETS_ROOT || "D:\\Streaming\\stramAssets";
const DEFAULT_ALLOWED_TYPES = ["audio", "video", "animation", "image"];

function nowIso() { return new Date().toISOString(); }
function stamp() { return nowIso().replace(/[:.]/g, "-"); }
function normalizeSlashes(value) { return String(value || "").replace(/\\/g, "/"); }
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); return dir; }
function boolArg(args, name) { return args.includes(name); }
function valueArg(args, name, fallback = "") {
  const idx = args.indexOf(name);
  if (idx < 0 || idx + 1 >= args.length) return fallback;
  return args[idx + 1];
}
function listArg(args, name, fallback = []) {
  const raw = valueArg(args, name, "");
  if (!raw) return fallback;
  return raw.split(/[;,]+/).map(v => v.trim()).filter(Boolean);
}
function slug(value, fallback = "general") {
  const clean = String(value || "").trim().toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean || fallback;
}
function quoteCsv(value) {
  const s = String(value ?? "");
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function fileExists(p) { try { return fs.existsSync(p); } catch (_) { return false; } }
function statSafe(p) { try { return fs.statSync(p); } catch (_) { return null; } }
function isPathInside(baseDir, targetPath) {
  const base = path.resolve(baseDir);
  const target = path.resolve(targetPath);
  const rel = path.relative(base, target);
  return rel === "" || (!!rel && !rel.startsWith("..") && !path.isAbsolute(rel));
}
function tableExists(db, table) {
  const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(table);
  return !!row;
}
function columnExists(db, table, column) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  return rows.some(row => row && row.name === column);
}
function safeJsonParse(raw, fallback) {
  if (raw === undefined || raw === null || raw === "") return fallback;
  try { return JSON.parse(String(raw)); } catch (_) { return fallback; }
}
function readJsonFile(filePath, fallback = {}) {
  if (!filePath) return fallback;
  const abs = path.resolve(filePath);
  if (!fileExists(abs)) throw new Error(`map_file_missing:${abs}`);
  return safeJsonParse(fs.readFileSync(abs, "utf8"), fallback);
}
function sameFileByStat(a, b) {
  const sa = statSafe(a);
  const sb = statSafe(b);
  if (!sa || !sb) return false;
  return sa.size === sb.size && Math.abs(sa.mtimeMs - sb.mtimeMs) < 1500;
}
function targetReserveKey(candidate) {
  return path.resolve(candidate).toLowerCase();
}

function uniqueTargetPath(targetDir, fileName, id, sourcePath, reservedTargets = new Set()) {
  const cleanName = path.basename(String(fileName || `media_${id || Date.now()}`));
  const parsed = path.parse(cleanName);
  const candidates = [
    path.join(targetDir, cleanName),
    path.join(targetDir, `${id || "media"}_${parsed.name}${parsed.ext}`)
  ];

  for (const candidate of candidates) {
    const reserved = reservedTargets.has(targetReserveKey(candidate));
    if (!reserved && (!fileExists(candidate) || sameFileByStat(candidate, sourcePath))) return candidate;
  }

  let i = 2;
  let candidate = path.join(targetDir, `${id || "media"}_${parsed.name}_${i}${parsed.ext}`);
  while (reservedTargets.has(targetReserveKey(candidate)) || (fileExists(candidate) && !sameFileByStat(candidate, sourcePath))) {
    i += 1;
    candidate = path.join(targetDir, `${id || "media"}_${parsed.name}_${i}${parsed.ext}`);
  }
  return candidate;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const apply = boolArg(args, "--apply");
  const copyFiles = boolArg(args, "--copy-files");
  const dryRun = !apply || boolArg(args, "--dry-run");
  const rootDir = path.resolve(valueArg(args, "--root", DEFAULT_ROOT));
  const dbPath = path.resolve(valueArg(args, "--db", path.join(rootDir, "data", "sqlite", "app.sqlite")));
  const reportDir = path.resolve(valueArg(args, "--report-dir", path.join(rootDir, "data", "exports", "media_migration")));
  const backupDir = path.resolve(valueArg(args, "--backup-dir", path.join(rootDir, "data", "backups")));
  const mapFile = valueArg(args, "--map-file", "");
  const types = listArg(args, "--types", DEFAULT_ALLOWED_TYPES).map(v => slug(v, "")).filter(Boolean);
  const onlyReferencedCommands = boolArg(args, "--only-command-assets");
  const includeInactive = boolArg(args, "--include-inactive");
  const updateDbOnly = boolArg(args, "--db-only");
  const help = boolArg(args, "--help") || boolArg(args, "-h");
  return { args, apply, dryRun, copyFiles, rootDir, dbPath, reportDir, backupDir, mapFile, types, onlyReferencedCommands, includeInactive, updateDbOnly, help };
}

function printHelp() {
  console.log(`
${STEP} Media Registry Migration Planner

Standard: Dry-Run, keine Aenderungen.

Optionen:
  --dry-run                 Nur planen/reporten. Default.
  --apply                   DB-Aenderungen ausfuehren.
  --copy-files              Im Apply-Modus Dateien in Zielstruktur kopieren.
  --db-only                 Im Apply-Modus nur DB-Kategorien/Pfade setzen, keine Dateien kopieren.
  --map-file <json>         Optionale Regeln fuer Modul/Kategorie-Zuordnung.
  --types audio,video       Media-Typen filtern. Default: audio,video,animation,image.
  --only-command-assets     Nur Assets migrieren, die von Commands referenziert werden.
  --include-inactive        Auch nicht aktive Assets einbeziehen.
  --root <path>             STREAM_ASSETS_ROOT. Default: ${DEFAULT_ROOT}
  --db <path>               SQLite DB. Default: <root>/data/sqlite/app.sqlite
  --report-dir <path>       Ziel fuer Reports.
  --backup-dir <path>       Ziel fuer Backups.

Beispiele:
  node tools\\media_registry_migrate_categories.js --dry-run
  node tools\\media_registry_migrate_categories.js --dry-run --map-file config\\media_migration_plan.json
  node tools\\media_registry_migrate_categories.js --apply --copy-files --map-file config\\media_migration_plan.json
`);
}

function loadAssets(db, options) {
  if (!tableExists(db, "media_assets")) throw new Error("media_assets_table_missing");
  const where = [];
  const params = {};
  if (options.types.length) {
    where.push(`type IN (${options.types.map((_, i) => `:type${i}`).join(",")})`);
    options.types.forEach((type, i) => { params[`type${i}`] = type; });
  }
  if (!options.includeInactive && columnExists(db, "media_assets", "status")) {
    where.push("status = 'active'");
  }
  const rows = db.prepare(`
    SELECT *
    FROM media_assets
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY id ASC
  `).all(params);
  return rows;
}

function loadCommandReferences(db) {
  const refsByMediaId = new Map();
  if (!tableExists(db, "command_definitions")) return refsByMediaId;
  const rows = db.prepare(`SELECT id, trigger, target_url, config_json FROM command_definitions`).all();
  for (const row of rows) {
    const config = safeJsonParse(row.config_json, {});
    const ids = new Set();
    if (config && config.mediaId !== undefined && config.mediaId !== null && String(config.mediaId).trim()) ids.add(String(config.mediaId).trim());
    const url = String(row.target_url || "");
    const match = url.match(/[?&]mediaId=([^&]+)/i);
    if (match) ids.add(decodeURIComponent(match[1] || "").trim());
    for (const id of ids) {
      if (!refsByMediaId.has(id)) refsByMediaId.set(id, []);
      refsByMediaId.get(id).push({ id: row.id, trigger: row.trigger || "", targetUrl: url, actionType: config.actionType || "" });
    }
  }
  return refsByMediaId;
}

function pickRule(asset, refs, mapConfig) {
  const idKey = String(asset.id || "");
  const fileName = asset.file_name || path.basename(asset.relative_path || "");
  const rel = normalizeSlashes(asset.relative_path || "");
  const type = slug(asset.type || "", "audio");

  const byId = mapConfig.byId && mapConfig.byId[idKey];
  if (byId) return { ...byId, reason: "map_by_id" };

  const rules = Array.isArray(mapConfig.rules) ? mapConfig.rules : [];
  for (const rule of rules) {
    const matchType = !rule.type || slug(rule.type, "") === type;
    const matchPath = !rule.pathIncludes || rel.toLowerCase().includes(String(rule.pathIncludes).toLowerCase());
    const matchName = !rule.nameIncludes || fileName.toLowerCase().includes(String(rule.nameIncludes).toLowerCase());
    const matchRegex = !rule.regex || new RegExp(String(rule.regex), "i").test(`${rel}\n${fileName}\n${asset.display_name || ""}`);
    const matchCommand = !rule.commandReferenced || refs.length > 0;
    if (matchType && matchPath && matchName && matchRegex && matchCommand) return { ...rule, reason: "map_rule" };
  }

  if (refs.length > 0) {
    return { moduleKey: "commands", categoryKey: mapConfig.defaults?.commandsCategory || "general", reason: "referenced_by_command" };
  }

  const parts = rel.split("/").filter(Boolean);
  if (parts[0] === "media" && parts.length >= 4) {
    return { moduleKey: parts[1], categoryKey: parts[2], reason: "already_canonical_path" };
  }

  const currentModule = slug(asset.module_key || "", "");
  const currentCategory = slug(asset.category_key || asset.category || "", "");
  if (currentModule && currentModule !== "legacy" && currentCategory && currentCategory !== type) {
    return { moduleKey: currentModule, categoryKey: currentCategory, reason: "existing_db_context" };
  }

  return {
    moduleKey: mapConfig.defaults?.moduleKey || "general",
    categoryKey: mapConfig.defaults?.categoryKey || type || "general",
    reason: "safe_default"
  };
}

function makePlan(asset, refs, options, mapConfig, reservedTargets = new Set()) {
  const assetsDir = path.join(options.rootDir, "htdocs", "assets");
  const sourceRel = normalizeSlashes(asset.relative_path || "");
  const sourcePath = path.resolve(asset.absolute_path || path.join(assetsDir, sourceRel));
  const rule = pickRule(asset, refs, mapConfig);
  const moduleKey = slug(rule.moduleKey || "general", "general");
  const categoryKey = slug(rule.categoryKey || "general", "general");
  const targetDir = path.join(assetsDir, "media", moduleKey, categoryKey);
  const targetPath = uniqueTargetPath(targetDir, asset.file_name || path.basename(sourcePath), asset.id, sourcePath, reservedTargets);
  reservedTargets.add(targetReserveKey(targetPath));
  const targetRel = normalizeSlashes(path.relative(assetsDir, targetPath));
  const targetWeb = `/assets/${targetRel}`;
  const sourceExists = fileExists(sourcePath);
  const targetExists = fileExists(targetPath);
  const alreadyAtTarget = path.resolve(sourcePath).toLowerCase() === path.resolve(targetPath).toLowerCase();
  const dbNeedsUpdate =
    normalizeSlashes(asset.relative_path || "") !== targetRel ||
    normalizeSlashes(asset.web_path || "") !== targetWeb ||
    path.resolve(asset.absolute_path || "") !== path.resolve(targetPath) ||
    slug(asset.module_key || "", "") !== moduleKey ||
    slug(asset.category_key || asset.category || "", "") !== categoryKey;

  return {
    id: Number(asset.id || 0),
    type: asset.type || "",
    displayName: asset.display_name || "",
    fileName: path.basename(targetPath),
    oldFileName: asset.file_name || "",
    sourceRel,
    sourcePath,
    sourceExists,
    targetRel,
    targetPath,
    targetWeb,
    targetExists,
    alreadyAtTarget,
    moduleKey,
    categoryKey,
    reason: rule.reason || "",
    commandReferences: refs,
    dbNeedsUpdate,
    copyNeeded: sourceExists && !alreadyAtTarget && (!targetExists || !sameFileByStat(sourcePath, targetPath)),
    warnings: []
  };
}

function addWarnings(plan, assetsDir) {
  if (!plan.sourceExists) plan.warnings.push("source_missing");
  if (!isPathInside(assetsDir, plan.sourcePath)) plan.warnings.push("source_outside_assets");
  if (!isPathInside(assetsDir, plan.targetPath)) plan.warnings.push("target_outside_assets");
  if (plan.targetExists && !sameFileByStat(plan.sourcePath, plan.targetPath) && !plan.alreadyAtTarget) plan.warnings.push("target_exists_different_file_renamed_or_conflict");
  return plan;
}

function ensureCategory(db, moduleKey, categoryKey, type) {
  if (!tableExists(db, "media_categories")) return;
  const now = nowIso();
  db.prepare(`
    INSERT INTO media_categories (
      module_key, category_key, label, relative_dir, allowed_types_json, is_system, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?)
    ON CONFLICT(module_key, category_key) DO UPDATE SET
      relative_dir = excluded.relative_dir,
      is_active = 1,
      updated_at = excluded.updated_at
  `).run(
    moduleKey,
    categoryKey,
    `${moduleKey} / ${categoryKey}`,
    normalizeSlashes(path.join(moduleKey, categoryKey)),
    JSON.stringify(type === "audio" ? ["audio"] : DEFAULT_ALLOWED_TYPES),
    now,
    now
  );
}

function writeBackup(db, plan, options) {
  ensureDir(options.backupDir);
  const ids = plan.map(item => item.id).filter(Boolean);
  const rows = ids.length
    ? db.prepare(`SELECT * FROM media_assets WHERE id IN (${ids.map(() => "?").join(",")}) ORDER BY id ASC`).all(...ids)
    : [];
  const backup = {
    ok: true,
    step: STEP,
    createdAt: nowIso(),
    mode: options.dryRun ? "dry-run" : "apply",
    rootDir: options.rootDir,
    dbPath: options.dbPath,
    rows,
    plan
  };
  const file = path.join(options.backupDir, `media_registry_migration_${stamp()}.json`);
  fs.writeFileSync(file, JSON.stringify(backup, null, 2), "utf8");
  return file;
}

function writeReports(plan, options, backupFile) {
  ensureDir(options.reportDir);
  const base = `media_registry_migration_${stamp()}`;
  const jsonFile = path.join(options.reportDir, `${base}.json`);
  const csvFile = path.join(options.reportDir, `${base}.csv`);
  const report = {
    ok: true,
    step: STEP,
    createdAt: nowIso(),
    mode: options.dryRun ? "dry-run" : "apply",
    rootDir: options.rootDir,
    dbPath: options.dbPath,
    backupFile: backupFile || "",
    summary: summarize(plan),
    plan
  };
  fs.writeFileSync(jsonFile, JSON.stringify(report, null, 2), "utf8");
  const header = ["id", "type", "displayName", "reason", "moduleKey", "categoryKey", "sourceRel", "targetRel", "commandRefs", "dbNeedsUpdate", "copyNeeded", "warnings"];
  const lines = [header.join(";")];
  for (const item of plan) {
    lines.push([
      item.id,
      item.type,
      item.displayName,
      item.reason,
      item.moduleKey,
      item.categoryKey,
      item.sourceRel,
      item.targetRel,
      item.commandReferences.map(ref => `!${ref.trigger}`).join(","),
      item.dbNeedsUpdate ? "yes" : "no",
      item.copyNeeded ? "yes" : "no",
      item.warnings.join(",")
    ].map(quoteCsv).join(";"));
  }
  fs.writeFileSync(csvFile, lines.join("\n"), "utf8");
  return { jsonFile, csvFile };
}

function summarize(plan) {
  return {
    total: plan.length,
    dbUpdates: plan.filter(item => item.dbNeedsUpdate).length,
    copyNeeded: plan.filter(item => item.copyNeeded).length,
    missingSources: plan.filter(item => item.warnings.includes("source_missing")).length,
    commandReferenced: plan.filter(item => item.commandReferences.length > 0).length,
    byModule: plan.reduce((acc, item) => { acc[item.moduleKey] = (acc[item.moduleKey] || 0) + 1; return acc; }, {}),
    byReason: plan.reduce((acc, item) => { acc[item.reason] = (acc[item.reason] || 0) + 1; return acc; }, {})
  };
}

function tempRelForItem(item) {
  const parsed = path.parse(String(item.fileName || item.oldFileName || `media_${item.id}`));
  const name = `${STEP}_${item.id}_${parsed.name || "media"}${parsed.ext || ""}`;
  return normalizeSlashes(path.join("media", "__migration_tmp__", name));
}

function validateUniqueTargets(plan) {
  const seen = new Map();
  for (const item of plan) {
    if (!item.dbNeedsUpdate) continue;
    const key = normalizeSlashes(item.targetRel || "").toLowerCase();
    if (!key) throw new Error(`target_relative_path_missing:${item.id}`);
    if (seen.has(key)) throw new Error(`duplicate_target_relative_path:${key}:ids=${seen.get(key)},${item.id}`);
    seen.set(key, item.id);
  }
}

function copyPlannedFiles(plan, options, assetsDir) {
  for (const item of plan) {
    if (item.warnings.includes("source_missing")) continue;
    if (!isPathInside(assetsDir, item.sourcePath) || !isPathInside(assetsDir, item.targetPath)) continue;
    if (options.copyFiles && !options.updateDbOnly && item.copyNeeded) {
      ensureDir(path.dirname(item.targetPath));
      fs.copyFileSync(item.sourcePath, item.targetPath);
    }
  }
}

function applyPlan(db, plan, options) {
  const assetsDir = path.join(options.rootDir, "htdocs", "assets");
  const changed = [];
  const updateItems = plan.filter(item => item.dbNeedsUpdate && !item.warnings.includes("source_missing"));

  validateUniqueTargets(updateItems);
  copyPlannedFiles(plan, options, assetsDir);

  db.exec("BEGIN IMMEDIATE TRANSACTION");
  try {
    for (const item of plan) {
      if (item.warnings.includes("source_missing")) continue;
      if (!isPathInside(assetsDir, item.sourcePath) || !isPathInside(assetsDir, item.targetPath)) continue;
      ensureCategory(db, item.moduleKey, item.categoryKey, item.type);
    }

    // Phase 1: alle zu aendernden Rows auf eindeutige temporaere Pfade setzen.
    // Dadurch blockieren alte relative_path-Werte keine finalen Zielpfade innerhalb derselben Migration.
    for (const item of updateItems) {
      const tmpRel = tempRelForItem(item);
      const tmpAbs = path.join(assetsDir, tmpRel);
      const tmpWeb = `/assets/${tmpRel}`;
      db.prepare(`
        UPDATE media_assets
        SET relative_path = ?,
            web_path = ?,
            absolute_path = ?,
            updated_at = ?
        WHERE id = ?
      `).run(tmpRel, tmpWeb, tmpAbs, nowIso(), item.id);
    }

    // Phase 2: finale Pfade/Kategorien setzen.
    for (const item of updateItems) {
      db.prepare(`
        UPDATE media_assets
        SET module_key = ?,
            category_key = ?,
            category = ?,
            file_name = ?,
            relative_path = ?,
            web_path = ?,
            absolute_path = ?,
            updated_at = ?
        WHERE id = ?
      `).run(item.moduleKey, item.categoryKey, item.categoryKey, item.fileName, item.targetRel, item.targetWeb, item.targetPath, nowIso(), item.id);
      changed.push(item.id);
    }
    db.exec("COMMIT");
  } catch (err) {
    try { db.exec("ROLLBACK"); } catch (_) {}
    throw err;
  }
  return changed;
}

function main() {
  const options = parseArgs(process.argv);
  if (options.help) { printHelp(); return; }
  if (!fileExists(options.dbPath)) throw new Error(`db_missing:${options.dbPath}`);
  if (options.apply && !options.copyFiles && !options.updateDbOnly) {
    console.warn("[WARN] --apply ohne --copy-files/--db-only: Es werden nur DB-Pfade geplant, aber keine Dateien kopiert. Nutze bewusst --db-only oder --copy-files.");
  }

  const mapConfig = readJsonFile(options.mapFile, {});
  const db = new DatabaseSync(options.dbPath);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA busy_timeout = 5000;");

  const assets = loadAssets(db, options);
  const refsByMediaId = loadCommandReferences(db);
  const assetsDir = path.join(options.rootDir, "htdocs", "assets");
  const reservedTargets = new Set();
  let plan = assets.map(asset => {
    const refs = refsByMediaId.get(String(asset.id || "")) || [];
    return addWarnings(makePlan(asset, refs, options, mapConfig, reservedTargets), assetsDir);
  });

  if (options.onlyReferencedCommands) plan = plan.filter(item => item.commandReferences.length > 0);

  const backupFile = writeBackup(db, plan, options);
  let changedIds = [];
  if (options.apply && !options.dryRun) {
    changedIds = applyPlan(db, plan, options);
  }
  const reports = writeReports(plan, options, backupFile);

  console.log(JSON.stringify({
    ok: true,
    step: STEP,
    mode: options.dryRun ? "dry-run" : "apply",
    changedIds,
    summary: summarize(plan),
    backupFile,
    reports
  }, null, 2));

  db.close();
}

try {
  main();
} catch (err) {
  console.error(JSON.stringify({ ok: false, step: STEP, error: err.message || String(err) }, null, 2));
  process.exitCode = 1;
}
