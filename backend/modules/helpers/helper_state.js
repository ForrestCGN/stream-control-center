'use strict';

const fs = require('fs');
const path = require('path');
const core = require('./helper_core');

function nowIso() {
  return core.nowIso ? core.nowIso() : new Date().toISOString();
}

function normalizeState(raw, fallbackData = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      version: 1,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      data: fallbackData && typeof fallbackData === 'object' ? fallbackData : {}
    };
  }

  return {
    version: raw.version || 1,
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
    data: raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? raw.data : (fallbackData || {})
  };
}

function readJson(filePath, fallback = null) {
  const target = core.normalizePath(filePath);
  if (!target || !fs.existsSync(target)) {
    return { ok: false, exists: false, path: target, data: fallback, error: 'file_not_found' };
  }

  try {
    const raw = fs.readFileSync(target, 'utf8').trim();
    const data = raw ? JSON.parse(raw) : fallback;
    return { ok: true, exists: true, path: target, data, error: '' };
  } catch (err) {
    return { ok: false, exists: true, path: target, data: fallback, error: err.message || String(err) };
  }
}

function backupFile(filePath, options = {}) {
  const target = core.normalizePath(filePath);
  if (!target || !fs.existsSync(target)) return { ok: false, path: target, backupPath: '', reason: 'file_not_found' };

  const stamp = nowIso().replace(/[:.]/g, '-');
  const backupDir = core.normalizePath(options.backupDir || path.dirname(target));
  core.ensureDir(backupDir);
  const ext = path.extname(target);
  const base = path.basename(target, ext);
  const backupPath = path.join(backupDir, `${base}.backup-${stamp}${ext || '.bak'}`);
  fs.copyFileSync(target, backupPath);
  return { ok: true, path: target, backupPath };
}

function writeJsonAtomic(filePath, data, options = {}) {
  const target = core.normalizePath(filePath);
  if (!target) throw new Error('writeJsonAtomic: filePath fehlt.');
  core.ensureParentDir(target);
  if (options.backup === true && fs.existsSync(target)) backupFile(target, options);

  const tmpPath = `${target}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, Number.isInteger(options.spaces) ? options.spaces : 2) + '\n', 'utf8');
  fs.renameSync(tmpPath, target);
  return { ok: true, path: target };
}

function loadState(filePath, fallbackData = {}) {
  const fallback = normalizeState(null, fallbackData);
  const loaded = readJson(filePath, fallback);
  return {
    ...loaded,
    state: normalizeState(loaded.data, fallbackData),
    loadedAt: nowIso()
  };
}

function saveState(filePath, state, options = {}) {
  const normalized = normalizeState(state, options.fallbackData || {});
  normalized.updatedAt = nowIso();
  return writeJsonAtomic(filePath, normalized, options);
}

function updateState(filePath, updater, options = {}) {
  const loaded = loadState(filePath, options.fallbackData || {});
  const state = loaded.state;
  const nextData = typeof updater === 'function' ? updater(state.data, state, loaded) : updater;
  if (nextData && typeof nextData === 'object' && !Array.isArray(nextData)) state.data = nextData;
  const saved = saveState(filePath, state, options);
  return { ok: saved.ok, path: saved.path, state, loadedOk: loaded.ok, loadedError: loaded.error || '' };
}

function createStateStore(filePath, options = {}) {
  const target = core.normalizePath(filePath);
  return {
    path: target,
    load: (fallbackData = {}) => loadState(target, fallbackData),
    save: (state) => saveState(target, state, options),
    update: (updater) => updateState(target, updater, options),
    getData: (fallbackData = {}) => loadState(target, fallbackData).state.data,
    setData: (data) => saveState(target, normalizeState(null, data), options),
    backup: () => backupFile(target, options)
  };
}

function listFiles(dirPath, options = {}) {
  const target = core.normalizePath(dirPath);
  if (!target || !fs.existsSync(target)) return [];
  const recursive = options.recursive === true;
  const entries = fs.readdirSync(target, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const fullPath = path.join(target, entry.name);
    if (entry.isDirectory() && recursive) result.push(...listFiles(fullPath, options));
    if (entry.isFile()) result.push(fullPath);
  }
  return result;
}

module.exports = {
  nowIso,
  normalizeState,
  readJson,
  writeJsonAtomic,
  backupFile,
  loadState,
  saveState,
  updateState,
  createStateStore,
  listFiles
};
