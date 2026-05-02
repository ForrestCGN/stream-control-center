/**
 * ForrestCGN Core Helper - config_loader.js
 *
 * Config-Loader für zentrale Configs unter /config.
 * Unterstützt Legacy-Fallbacks während der Migration.
 */

const path = require("path");
const paths = require("./paths");
const fsUtils = require("./fs_utils");

function getConfigPath(fileName) {
  return path.join(paths.CONFIG_DIR, fileName);
}

function loadConfig(fileName, defaultValue = {}, options = {}) {
  const configPath = options.path || getConfigPath(fileName);
  const legacyPath = options.legacyPath || null;

  if (fsUtils.exists(configPath)) {
    return fsUtils.readJson(configPath, defaultValue);
  }

  if (legacyPath && fsUtils.exists(legacyPath)) {
    return fsUtils.readJson(legacyPath, defaultValue);
  }

  if (options.createIfMissing) {
    fsUtils.writeJsonAtomic(configPath, defaultValue);
  }

  return defaultValue;
}

function saveConfig(fileName, data, options = {}) {
  const configPath = options.path || getConfigPath(fileName);
  fsUtils.writeJsonAtomic(configPath, data, {
    spaces: options.spaces ?? 2
  });
  return configPath;
}

function loadConfigWithFallback(newPath, legacyPath, defaultValue = {}) {
  if (fsUtils.exists(newPath)) return fsUtils.readJson(newPath, defaultValue);
  if (legacyPath && fsUtils.exists(legacyPath)) return fsUtils.readJson(legacyPath, defaultValue);
  return defaultValue;
}

function copyLegacyConfigIfMissing(fileName, legacyPath) {
  const configPath = getConfigPath(fileName);
  return fsUtils.copyIfMissing(legacyPath, configPath);
}

module.exports = {
  getConfigPath,
  loadConfig,
  saveConfig,
  loadConfigWithFallback,
  copyLegacyConfigIfMissing
};
