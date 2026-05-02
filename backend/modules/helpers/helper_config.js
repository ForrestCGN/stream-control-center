'use strict';

const fs = require('fs');
const path = require('path');
const core = require('./helper_core');

function cleanValue(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function getEnv(name, fallback = '') {
  if (!name) return fallback;
  const value = cleanValue(process.env[name]);
  return value === '' ? fallback : value;
}

function requireEnv(name) {
  const value = getEnv(name, '');
  if (!value) throw new Error(`ENV fehlt: ${name}`);
  return value;
}

function normalizeDir(inputPath) {
  return core.normalizePath(inputPath || '');
}

function resolveFrom(basePath, ...parts) {
  const base = normalizeDir(basePath);
  if (!base) throw new Error('resolveFrom: basePath fehlt oder ist leer.');
  return path.resolve(base, ...parts.filter(part => part !== undefined && part !== null).map(String));
}

function findProjectRoot() {
  let current = __dirname;

  for (let i = 0; i < 10; i++) {
    const envPath = path.join(current, '.env');
    const htdocsPath = path.join(current, 'htdocs');

    if (fs.existsSync(envPath) && fs.existsSync(htdocsPath)) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return path.resolve(__dirname, '..', '..');
}

function getRootDir() {
  return normalizeDir(getEnv('STREAM_ROOT', getEnv('ROOT_DIR', findProjectRoot())));
}

function getWebrootDir() {
  return normalizeDir(getEnv('WEBROOT_DIR', resolveFrom(getRootDir(), 'htdocs')));
}

function getScriptsDir() {
  return normalizeDir(getEnv('SCRIPTS_DIR', resolveFrom(getWebrootDir(), 'scripts')));
}

function getModulesDir() {
  return normalizeDir(getEnv('MODULES_DIR', resolveFrom(getScriptsDir(), 'modules')));
}

function getHelpersDir() {
  return normalizeDir(getEnv('HELPERS_DIR', resolveFrom(getModulesDir(), 'helpers')));
}

function getDataDir() {
  return normalizeDir(getEnv('DATA_DIR', resolveFrom(getWebrootDir(), 'data')));
}

function getConfigDir() {
  return normalizeDir(getEnv('CONFIG_DIR', resolveFrom(getRootDir(), 'config')));
}

function getAssetsDir() {
  return normalizeDir(getEnv('ASSETS_DIR', resolveFrom(getWebrootDir(), 'assets')));
}

function getSoundsDir() {
  return normalizeDir(getEnv('SOUNDS_DIR', resolveFrom(getAssetsDir(), 'sounds')));
}

function getTokensDir() {
  return normalizeDir(getEnv('TOKENS_DIR', resolveFrom(getWebrootDir(), 'tokens')));
}

function getOverlaysDir() {
  return normalizeDir(getEnv('OVERLAYS_DIR', resolveFrom(getWebrootDir(), 'overlays')));
}

function getLogsDir() {
  return normalizeDir(getEnv('LOGS_DIR', resolveFrom(getRootDir(), 'logs')));
}

function getTempDir() {
  return normalizeDir(getEnv('TEMP_DIR', resolveFrom(getRootDir(), 'tmp')));
}

function getSecretsDir() {
  return normalizeDir(getEnv('SECRETS_DIR', resolveFrom(getRootDir(), 'secrets')));
}

function resolveFromRoot(...parts) { return resolveFrom(getRootDir(), ...parts); }
function resolveFromWebroot(...parts) { return resolveFrom(getWebrootDir(), ...parts); }
function resolveFromScripts(...parts) { return resolveFrom(getScriptsDir(), ...parts); }
function resolveFromModules(...parts) { return resolveFrom(getModulesDir(), ...parts); }
function resolveFromData(...parts) { return resolveFrom(getDataDir(), ...parts); }
function resolveFromConfig(...parts) { return resolveFrom(getConfigDir(), ...parts); }
function resolveFromAssets(...parts) { return resolveFrom(getAssetsDir(), ...parts); }
function resolveFromSounds(...parts) { return resolveFrom(getSoundsDir(), ...parts); }
function resolveFromTokens(...parts) { return resolveFrom(getTokensDir(), ...parts); }
function resolveFromOverlays(...parts) { return resolveFrom(getOverlaysDir(), ...parts); }
function resolveFromLogs(...parts) { return resolveFrom(getLogsDir(), ...parts); }
function resolveFromTemp(...parts) { return resolveFrom(getTempDir(), ...parts); }
function resolveFromSecrets(...parts) { return resolveFrom(getSecretsDir(), ...parts); }

function getSummary() {
  return {
    rootDir: getRootDir(),
    webrootDir: getWebrootDir(),
    scriptsDir: getScriptsDir(),
    modulesDir: getModulesDir(),
    helpersDir: getHelpersDir(),
    dataDir: getDataDir(),
    configDir: getConfigDir(),
    assetsDir: getAssetsDir(),
    soundsDir: getSoundsDir(),
    tokensDir: getTokensDir(),
    overlaysDir: getOverlaysDir(),
    logsDir: getLogsDir(),
    tempDir: getTempDir(),
    secretsDir: getSecretsDir()
  };
}

function ensureBaseDirs() {
  const dirs = getSummary();
  for (const dir of Object.values(dirs)) core.ensureDir(dir);
  return dirs;
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (isPlainObject(value)) {
    const out = {};
    for (const [key, item] of Object.entries(value)) out[key] = clone(item);
    return out;
  }
  return value;
}

function deepMerge(base, override) {
  const result = clone(base || {});
  if (!isPlainObject(override)) return result;

  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = clone(value);
    }
  }

  return result;
}

function readJsonFile(filePath, fallback = null) {
  const target = core.normalizePath(filePath);
  if (!target || !core.fileExists(target)) {
    return { ok: false, exists: false, path: target, data: fallback, error: 'file_not_found' };
  }

  try {
    const data = core.readJson(target, fallback);
    return { ok: true, exists: true, path: target, data, error: '' };
  } catch (err) {
    return { ok: false, exists: true, path: target, data: fallback, error: err.message || String(err) };
  }
}

function writeJsonFile(filePath, data, options = {}) {
  const target = core.normalizePath(filePath);
  core.writeJson(target, data, { spaces: Number.isInteger(options.spaces) ? options.spaces : 2 });
  return { ok: true, path: target };
}

function resolveConfigFile(fileName) {
  const clean = String(fileName || '').trim();
  if (!clean) throw new Error('resolveConfigFile: fileName fehlt.');
  if (path.isAbsolute(clean)) return core.normalizePath(clean);

  const primary = resolveFromConfig(clean);
  if (fs.existsSync(primary)) return primary;

  const legacy = resolveFrom(getWebrootDir(), 'config', clean);
  if (fs.existsSync(legacy)) return legacy;

  return primary;
}

function loadConfig(fileName, defaults = {}, options = {}) {
  const configPath = resolveConfigFile(fileName);
  const createIfMissing = options.createIfMissing === true;
  const fallback = clone(defaults || {});
  const loaded = readJsonFile(configPath, null);

  if (!loaded.ok) {
    if (createIfMissing && !loaded.exists) {
      writeJsonFile(configPath, fallback, options);
      return {
        ok: true,
        exists: true,
        created: true,
        path: configPath,
        config: fallback,
        data: fallback,
        error: '',
        loadedAt: core.nowIso()
      };
    }

    return {
      ok: false,
      exists: loaded.exists,
      created: false,
      path: configPath,
      config: fallback,
      data: fallback,
      error: loaded.error || 'config_load_failed',
      loadedAt: core.nowIso()
    };
  }

  const merged = options.mergeDefaults === false ? loaded.data : deepMerge(fallback, loaded.data);
  return {
    ok: true,
    exists: true,
    created: false,
    path: configPath,
    config: merged,
    data: merged,
    raw: loaded.data,
    error: '',
    loadedAt: core.nowIso()
  };
}

function boolValue(value, fallback = false) {
  return core.boolParam(value, fallback);
}

function numberValue(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

module.exports = {
  getEnv,
  requireEnv,
  resolveFrom,
  getRootDir,
  getWebrootDir,
  getScriptsDir,
  getModulesDir,
  getHelpersDir,
  getDataDir,
  getConfigDir,
  getAssetsDir,
  getSoundsDir,
  getTokensDir,
  getOverlaysDir,
  getLogsDir,
  getTempDir,
  getSecretsDir,
  resolveFromRoot,
  resolveFromWebroot,
  resolveFromScripts,
  resolveFromModules,
  resolveFromData,
  resolveFromConfig,
  resolveFromAssets,
  resolveFromSounds,
  resolveFromTokens,
  resolveFromOverlays,
  resolveFromLogs,
  resolveFromTemp,
  resolveFromSecrets,
  ensureBaseDirs,
  getSummary,
  isPlainObject,
  clone,
  deepMerge,
  readJsonFile,
  writeJsonFile,
  resolveConfigFile,
  loadConfig,
  boolValue,
  numberValue
};
