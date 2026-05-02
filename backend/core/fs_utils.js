/**
 * ForrestCGN Core Helper - fs_utils.js
 *
 * Sichere Datei-/JSON-Helfer.
 * Phase 1C: Nur hinzufügen, noch keine bestehende Funktionalität ersetzen.
 */

const fs = require("fs");
const path = require("path");

function exists(filePath) {
  return fs.existsSync(filePath);
}

function ensureDir(dirPath) {
  if (!dirPath) return;
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function ensureParentDir(filePath) {
  ensureDir(path.dirname(filePath));
}

function readText(filePath, fallback = "") {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return fallback;
  }
}

function writeTextAtomic(filePath, content) {
  ensureParentDir(filePath);

  const tmpPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmpPath, String(content ?? ""), "utf8");
  fs.renameSync(tmpPath, filePath);
}

function readJson(filePath, fallback = null) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf8");
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJsonAtomic(filePath, data, options = {}) {
  const spaces = Number.isInteger(options.spaces) ? options.spaces : 2;
  const json = JSON.stringify(data, null, spaces);
  writeTextAtomic(filePath, json + "\n");
}

function copyIfMissing(sourcePath, targetPath) {
  if (!fs.existsSync(sourcePath)) return false;
  if (fs.existsSync(targetPath)) return false;

  ensureParentDir(targetPath);
  fs.copyFileSync(sourcePath, targetPath);
  return true;
}

function statSafe(filePath) {
  try {
    return fs.statSync(filePath);
  } catch {
    return null;
  }
}

function listFilesSafe(dirPath) {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }
}

module.exports = {
  exists,
  ensureDir,
  ensureParentDir,
  readText,
  writeTextAtomic,
  readJson,
  writeJsonAtomic,
  copyIfMissing,
  statSafe,
  listFilesSafe
};
