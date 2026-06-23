/**
 * ForrestCGN Path Helper - Phase 1B
 *
 * Zweck:
 * - zentrale Pfade fÃ¼r den laufenden Umbau
 * - noch KEINE Dateien verschieben
 * - alte Struktur bleibt kompatibel
 *
 * SpÃ¤ter kann STREAM_ASSETS_ROOT auf D:\Streaming\StreamAssets zeigen.
 */

const path = require("path");

const ROOT_DIR = process.env.STREAM_ASSETS_ROOT || "D:\\Streaming\\stramAssets";

const paths = {
  ROOT_DIR,

  // Current/public webroot
  WEBROOT_DIR: path.join(ROOT_DIR, "htdocs"),

  // Current backend location during migration
  CURRENT_SCRIPTS_DIR: path.join(ROOT_DIR, "htdocs", "scripts"),
  CURRENT_MODULES_DIR: path.join(ROOT_DIR, "backend", "modules"),

  // Future backend locations
  BACKEND_DIR: path.join(ROOT_DIR, "backend"),
  BACKEND_CORE_DIR: path.join(ROOT_DIR, "backend", "core"),
  BACKEND_MODULES_DIR: path.join(ROOT_DIR, "backend", "modules"),

  // Public folders
  OVERLAYS_DIR: path.join(ROOT_DIR, "htdocs", "overlays"),
  ASSETS_DIR: path.join(ROOT_DIR, "htdocs", "assets"),
  ALERTS_DIR: path.join(ROOT_DIR, "htdocs", "alerts"),
  DASHBOARD_DIR: path.join(ROOT_DIR, "htdocs", "dashboard"),
  DASHBOARD_V2_DIR: path.join(ROOT_DIR, "htdocs", "dashboard-v2"),
  PUBLIC_DIR: path.join(ROOT_DIR, "htdocs", "public"),

  // Legacy public data folder - keep temporarily for old overlays
  LEGACY_HTDOCS_DATA_DIR: path.join(ROOT_DIR, "htdocs", "data"),

  // New structure
  CONFIG_DIR: path.join(ROOT_DIR, "config"),
  SECRETS_DIR: path.join(ROOT_DIR, "secrets"),
  DATA_DIR: path.join(ROOT_DIR, "data"),
  STATE_DIR: path.join(ROOT_DIR, "data", "state"),
  SQLITE_DIR: path.join(ROOT_DIR, "data", "sqlite"),
  LOGS_DIR: path.join(ROOT_DIR, "data", "logs"),
  EXPORTS_DIR: path.join(ROOT_DIR, "data", "exports"),
  BACKUPS_DIR: path.join(ROOT_DIR, "data", "backups"),
  TOOLS_DIR: path.join(ROOT_DIR, "tools"),
  DOCS_DIR: path.join(ROOT_DIR, "docs"),
  ARCHIVE_DIR: path.join(ROOT_DIR, "archive"),

  // Important files
  ENV_FILE: path.join(ROOT_DIR, ".env"),
  INDEX_FILE: path.join(ROOT_DIR, "htdocs", "index.htm"),
  WS_CLIENT_FILE: path.join(ROOT_DIR, "htdocs", "ws-client.js")
};

function fromRoot(...parts) {
  return path.join(ROOT_DIR, ...parts);
}

function fromWebroot(...parts) {
  return path.join(paths.WEBROOT_DIR, ...parts);
}

function fromConfig(...parts) {
  return path.join(paths.CONFIG_DIR, ...parts);
}

function fromState(...parts) {
  return path.join(paths.STATE_DIR, ...parts);
}

function fromSecrets(...parts) {
  return path.join(paths.SECRETS_DIR, ...parts);
}

module.exports = {
  ...paths,
  fromRoot,
  fromWebroot,
  fromConfig,
  fromState,
  fromSecrets
};

