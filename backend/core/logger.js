/**
 * ForrestCGN Core Helper - logger.js
 *
 * Einheitliches Logging.
 * Phase 1C: Console-Logging + optionales Datei-Logging.
 */

const path = require("path");
const fsUtils = require("./fs_utils");
const paths = require("./paths");

const LOG_FILE = path.join(paths.LOGS_DIR, "node.log");
const ERROR_FILE = path.join(paths.LOGS_DIR, "errors.log");

let fileLoggingEnabled = false;

function enableFileLogging(enabled = true) {
  fileLoggingEnabled = !!enabled;
  if (fileLoggingEnabled) {
    fsUtils.ensureDir(paths.LOGS_DIR);
  }
}

function timestamp() {
  return new Date().toISOString();
}

function format(level, scope, args) {
  const prefix = `[${timestamp()}] [${level}]${scope ? ` [${scope}]` : ""}`;
  const message = args.map(v => {
    if (v instanceof Error) return v.stack || v.message;
    if (typeof v === "object") {
      try { return JSON.stringify(v); } catch { return String(v); }
    }
    return String(v);
  }).join(" ");

  return `${prefix} ${message}`;
}

function writeLine(filePath, line) {
  if (!fileLoggingEnabled) return;
  try {
    fsUtils.ensureParentDir(filePath);
    require("fs").appendFileSync(filePath, line + "\n", "utf8");
  } catch {
    // Logging darf nie das Hauptsystem crashen.
  }
}

function log(level, scope, ...args) {
  const line = format(level, scope, args);

  if (level === "ERROR") console.error(line);
  else if (level === "WARN") console.warn(line);
  else console.log(line);

  writeLine(LOG_FILE, line);
  if (level === "ERROR") writeLine(ERROR_FILE, line);
}

function createLogger(scope) {
  return {
    info: (...args) => log("INFO", scope, ...args),
    warn: (...args) => log("WARN", scope, ...args),
    error: (...args) => log("ERROR", scope, ...args),
    debug: (...args) => {
      if (process.env.DEBUG === "1" || process.env.NODE_ENV === "development") {
        log("DEBUG", scope, ...args);
      }
    }
  };
}

module.exports = {
  enableFileLogging,
  createLogger,
  info: (...args) => log("INFO", "", ...args),
  warn: (...args) => log("WARN", "", ...args),
  error: (...args) => log("ERROR", "", ...args),
  debug: (...args) => {
    if (process.env.DEBUG === "1" || process.env.NODE_ENV === "development") {
      log("DEBUG", "", ...args);
    }
  }
};
