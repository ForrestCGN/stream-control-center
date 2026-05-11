"use strict";

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const projectStateDir = path.join(repoRoot, "project-state");
const archiveRoot = path.join(projectStateDir, "archive", "step261-project-state-cleanup");
const dryRun = process.argv.includes("--dry-run");

const ACTIVE_ROOT = new Set([
  "CHANGELOG.md",
  "CURRENT_STATUS.md",
  "FILES.md",
  "NEXT_STEPS.md"
]);

function stepNumber(name) {
  const match = String(name || "").match(/^STEP(\d+)/i);
  return match ? Number(match[1]) : null;
}

function classify(name, isDirectory) {
  if (!name || name === "archive") return null;
  if (ACTIVE_ROOT.has(name)) return null;

  const upper = name.toUpperCase();
  const num = stepNumber(name);

  // Keep the current active project-state history visible.
  if (num !== null && num >= 229) return null;

  if (isDirectory) {
    if (name.toLowerCase().startsWith("step")) return "old-compare-reports";
    return "old-folders";
  }

  if (upper.includes("APPEND")) return "old-appends";
  if (upper.includes("STATUS_NOTE")) return "old-status-notes";
  if (upper.includes("SAVED")) return "old-saved";
  if (upper.startsWith("README_STEP")) return "old-readmes";
  if (upper.endsWith(".JSON") || upper.endsWith(".JSONL") || upper.endsWith(".TXT") || upper.startsWith("_BACKUP_") || upper.startsWith("HUG_")) return "old-test-logs";
  if (upper.startsWith("UPLOAD_REVIEW") || upper.startsWith("PROJECT_STATUS") || upper.startsWith("DB_PHASE2") || upper.startsWith("SYSTEM_INSPEKTION") || upper.startsWith("SOUNDALERTS_")) return "old-reports";
  if (num !== null && num < 229) return "old-step-docs";
  if (upper.startsWith("STEP_")) return "old-step-docs";
  if (upper.startsWith("FILES_STEP") || upper.startsWith("CHANGELOG_STEP") || upper.startsWith("CURRENT_STATUS_STEP") || upper.startsWith("NEXT_STEPS_STEP")) return "old-fragments";

  return null;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function uniqueTarget(target) {
  if (!fs.existsSync(target)) return target;
  const parsed = path.parse(target);
  let index = 2;
  while (true) {
    const candidate = path.join(parsed.dir, `${parsed.name}__${index}${parsed.ext}`);
    if (!fs.existsSync(candidate)) return candidate;
    index += 1;
  }
}

function movePath(source, category) {
  const targetDir = path.join(archiveRoot, category);
  const target = uniqueTarget(path.join(targetDir, path.basename(source)));
  if (dryRun) return { source, target, category, moved: false, dryRun: true };
  ensureDir(targetDir);
  fs.renameSync(source, target);
  return { source, target, category, moved: true, dryRun: false };
}

function main() {
  if (!fs.existsSync(projectStateDir)) {
    console.error(`[STEP261] project-state not found: ${projectStateDir}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(projectStateDir, { withFileTypes: true });
  const moves = [];
  const kept = [];

  for (const entry of entries) {
    const name = entry.name;
    const category = classify(name, entry.isDirectory());
    if (!category) {
      if (name !== "archive") kept.push(name);
      continue;
    }
    moves.push(movePath(path.join(projectStateDir, name), category));
  }

  const summary = {
    ok: true,
    step: "STEP261",
    dryRun,
    projectStateDir,
    archiveRoot,
    moved: moves.length,
    kept: kept.length,
    categories: moves.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {}),
    updatedAt: new Date().toISOString(),
    moves: moves.map(item => ({
      category: item.category,
      source: path.relative(repoRoot, item.source),
      target: path.relative(repoRoot, item.target),
      moved: item.moved
    }))
  };

  ensureDir(archiveRoot);
  const manifestPath = path.join(archiveRoot, "STEP261_PROJECT_STATE_CLEANUP_MANIFEST.json");
  if (!dryRun) fs.writeFileSync(manifestPath, JSON.stringify(summary, null, 2), "utf8");

  console.log(JSON.stringify({
    ok: true,
    step: summary.step,
    dryRun: summary.dryRun,
    moved: summary.moved,
    kept: summary.kept,
    categories: summary.categories,
    manifest: dryRun ? null : path.relative(repoRoot, manifestPath)
  }, null, 2));
}

main();
