/**
 * ForrestCGN Core Helper - state_store.js
 *
 * State-Dateien gehören langfristig nach /data/state.
 * Unterstützt Legacy-Fallbacks während der Migration.
 */

const path = require("path");
const paths = require("./paths");
const fsUtils = require("./fs_utils");

function getStatePath(fileName) {
  return path.join(paths.STATE_DIR, fileName);
}

function loadState(fileName, defaultValue = {}, options = {}) {
  const statePath = options.path || getStatePath(fileName);
  const legacyPath = options.legacyPath || null;

  if (fsUtils.exists(statePath)) {
    return fsUtils.readJson(statePath, defaultValue);
  }

  if (legacyPath && fsUtils.exists(legacyPath)) {
    return fsUtils.readJson(legacyPath, defaultValue);
  }

  if (options.createIfMissing) {
    fsUtils.writeJsonAtomic(statePath, defaultValue);
  }

  return defaultValue;
}

function saveState(fileName, data, options = {}) {
  const statePath = options.path || getStatePath(fileName);
  fsUtils.writeJsonAtomic(statePath, data, {
    spaces: options.spaces ?? 2
  });
  return statePath;
}

function copyLegacyStateIfMissing(fileName, legacyPath) {
  const statePath = getStatePath(fileName);
  return fsUtils.copyIfMissing(legacyPath, statePath);
}

module.exports = {
  getStatePath,
  loadState,
  saveState,
  copyLegacyStateIfMissing
};
