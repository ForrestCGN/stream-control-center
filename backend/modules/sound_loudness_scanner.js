"use strict";

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const database = require("../core/database");
const paths = require("../core/paths");
const media = require("./helpers/helper_media");

const MODULE_NAME = "sound_loudness_scanner";
const SCHEMA_MODULE = "sound_loudness_scanner";
const SCHEMA_VERSION = 1;
const ROUTE_PREFIX = "/api/sound/loudness";

const DEFAULT_ALLOWED_EXTENSIONS = [".mp3", ".wav", ".ogg", ".webm", ".m4a", ".mp4"];
const DEFAULT_TARGET_LUFS = -18;
const DEFAULT_TRUE_PEAK_LIMIT_DBTP = -1.5;
const DEFAULT_MAX_PLAYBACK_VOLUME = 80;
const DEFAULT_SCAN_LIMIT = 500;
const DEFAULT_FFMPEG_TIMEOUT_MS = 45000;
const DEFAULT_EXCLUDE_TTS = true;
const DEFAULT_EXCLUDED_PATH_SEGMENTS = ["tts", "tts_system", "alert_tts", "generated_tts", "temp_tts", "tts_cache"];

module.exports.init = function init(ctx) {
  const { app } = ctx;

  const state = {
    module: MODULE_NAME,
    version: "0.1.3-step270e-progress",
    loadedAt: nowIso(),
    running: false,
    lastScanId: "",
    lastStartedAt: "",
    lastFinishedAt: "",
    lastError: "",
    lastResult: null,
    progress: emptyProgress()
  };

  ensureSchema();

  app.get(`${ROUTE_PREFIX}/status`, (req, res) => {
    try {
      ensureSchema();
      const latest = database.get("SELECT * FROM sound_loudness_scans ORDER BY started_at DESC LIMIT 1") || null;
      const countRow = database.get("SELECT COUNT(*) AS count FROM sound_loudness_files") || { count: 0 };
      res.json({
        ok: true,
        module: MODULE_NAME,
        version: state.version,
        routePrefix: ROUTE_PREFIX,
        running: state.running,
        lastScanId: state.lastScanId,
        lastStartedAt: state.lastStartedAt,
        lastFinishedAt: state.lastFinishedAt,
        lastError: state.lastError,
        lastResult: state.lastResult,
        progress: publicProgress(state.progress),
        databasePath: database.getDbPath() || "",
        resultsCount: Number(countRow.count || 0),
        latestScan: latest ? publicScan(latest) : null,
        defaults: {
          soundsBaseDir: getSoundsBaseDir(),
          allowedExtensions: DEFAULT_ALLOWED_EXTENSIONS,
          targetLufs: DEFAULT_TARGET_LUFS,
          truePeakLimitDbtp: DEFAULT_TRUE_PEAK_LIMIT_DBTP,
          maxPlaybackVolume: DEFAULT_MAX_PLAYBACK_VOLUME,
          excludeTts: DEFAULT_EXCLUDE_TTS,
          excludedPathSegments: DEFAULT_EXCLUDED_PATH_SEGMENTS.slice()
        }
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: errorMessage(err) });
    }
  });

  app.get(`${ROUTE_PREFIX}/results`, (req, res) => {
    try {
      ensureSchema();
      const limit = clampNumber(req.query.limit, 1, 1000, 250);
      const offset = clampNumber(req.query.offset, 0, 1000000, 0);
      const status = String(req.query.status || "").trim();
      const includeExcluded = parseBool(req.query.includeExcluded, false);
      const order = normalizeOrder(req.query.order || "relative_path");
      const direction = String(req.query.dir || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";

      const filterParams = {};
      let where = "";
      const whereParts = [];
      if (status) {
        whereParts.push("status = :status");
        filterParams.status = status;
      }
      if (!includeExcluded) {
        appendExcludedPathFilter(whereParts, filterParams);
      }
      where = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

      const totalRow = database.get(`SELECT COUNT(*) AS count FROM sound_loudness_files ${where}`, filterParams) || { count: 0 };
      const rows = database.all(
        `SELECT * FROM sound_loudness_files ${where} ORDER BY ${order} ${direction} LIMIT ${limit} OFFSET ${offset}`,
        filterParams
      ) || [];

      res.json({
        ok: true,
        module: MODULE_NAME,
        count: rows.length,
        total: Number(totalRow.count || 0),
        limit,
        offset,
        results: rows.map(publicFileResult)
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: errorMessage(err) });
    }
  });

  app.get(`${ROUTE_PREFIX}/file`, (req, res) => {
    try {
      ensureSchema();
      const relativePath = normalizeRelativePath(req.query.file || req.query.path || "");
      if (!relativePath) return res.status(400).json({ ok: false, error: "file_required" });
      const row = database.get("SELECT * FROM sound_loudness_files WHERE relative_path = :relativePath", { relativePath }) || null;
      if (!row) return res.status(404).json({ ok: false, error: "file_not_scanned", file: relativePath });
      res.json({ ok: true, module: MODULE_NAME, result: publicFileResult(row) });
    } catch (err) {
      res.status(500).json({ ok: false, error: errorMessage(err) });
    }
  });

  app.post(`${ROUTE_PREFIX}/scan`, (req, res) => {
    if (state.running) {
      return res.status(409).json({ ok: false, error: "scan_already_running", scanId: state.lastScanId, progress: publicProgress(state.progress) });
    }

    try {
      ensureSchema();
      const rawOptions = req.body || req.query || {};
      const options = parseScanOptions(rawOptions);
      const asyncMode = parseBool(rawOptions.async, false) || parseBool(rawOptions.background, false);
      if (asyncMode) {
        const started = startBackgroundScan(options);
        return res.status(202).json({ ok: true, module: MODULE_NAME, scan: started, progress: publicProgress(state.progress) });
      }
      const result = runScan(options);
      res.json({ ok: true, module: MODULE_NAME, ...result });
    } catch (err) {
      state.running = false;
      state.lastError = errorMessage(err);
      state.progress = { ...state.progress, status: "failed", errorText: state.lastError, finishedAt: nowIso() };
      res.status(500).json({ ok: false, error: state.lastError });
    }
  });

  app.get(`${ROUTE_PREFIX}/routes`, (req, res) => {
    res.json({
      ok: true,
      module: MODULE_NAME,
      addedByStep: "STEP270A",
      routes: [
        { method: "GET", path: `${ROUTE_PREFIX}/status`, description: "Read scanner state, progress, defaults and latest scan summary" },
        { method: "POST", path: `${ROUTE_PREFIX}/scan`, description: "Run a read-only loudness scan for sound files; pass async=true for dashboard progress polling" },
        { method: "GET", path: `${ROUTE_PREFIX}/results`, description: "List persisted loudness scan results" },
        { method: "GET", path: `${ROUTE_PREFIX}/file?file=relative/path.mp3`, description: "Read one persisted loudness result" },
        { method: "GET", path: `${ROUTE_PREFIX}/routes`, description: "Route self-documentation" }
      ],
      notes: [
        "Read-only: no sound file is modified.",
        "TTS/generated speech files are excluded by default.",
        "Results are stored in SQLite using CREATE TABLE IF NOT EXISTS migration only.",
        "Playback, Sound-System queue, Discord routing and Alert bundle logic are not changed."
      ]
    });
  });

  function prepareScan(options) {
    state.running = true;
    state.lastError = "";
    state.lastStartedAt = nowIso();
    state.lastFinishedAt = "";
    state.lastScanId = makeScanId();
    state.lastResult = null;
    state.progress = {
      scanId: state.lastScanId,
      status: "running",
      startedAt: state.lastStartedAt,
      finishedAt: "",
      baseDir: options.baseDir,
      targetLufs: options.targetLufs,
      truePeakLimitDbtp: options.truePeakLimitDbtp,
      maxPlaybackVolume: options.maxPlaybackVolume,
      discoveredFiles: 0,
      scannedFiles: 0,
      okFiles: 0,
      warningFiles: 0,
      errorFiles: 0,
      currentFile: "",
      progressPercent: 0,
      errorText: ""
    };

    const startedAt = state.lastStartedAt;
    options.scanId = state.lastScanId;
    const scanRow = {
      scan_id: state.lastScanId,
      started_at: startedAt,
      finished_at: "",
      status: "running",
      base_dir: options.baseDir,
      target_lufs: options.targetLufs,
      true_peak_limit_dbtp: options.truePeakLimitDbtp,
      max_playback_volume: options.maxPlaybackVolume,
      scanned_files: 0,
      ok_files: 0,
      warning_files: 0,
      error_files: 0,
      error_text: ""
    };
    database.insert("sound_loudness_scans", scanRow);
    return { startedAt, scanId: state.lastScanId };
  }

  function runScan(options) {
    const prepared = prepareScan(options);

    let files = [];
    let summary = null;

    try {
      files = findSoundFiles(options.baseDir, options.allowedExtensions, options.limit, options);
      summary = {
        scanId: state.lastScanId,
        startedAt,
        finishedAt: "",
        baseDir: options.baseDir,
        targetLufs: options.targetLufs,
        truePeakLimitDbtp: options.truePeakLimitDbtp,
        maxPlaybackVolume: options.maxPlaybackVolume,
        discoveredFiles: files.length,
        scannedFiles: 0,
        okFiles: 0,
        warningFiles: 0,
        errorFiles: 0
      };

      state.progress.discoveredFiles = files.length;
      state.progress.progressPercent = files.length ? 0 : 100;

      for (const file of files) {
        state.progress.currentFile = file.relativePath;
        const measured = analyzeFile(file, options);
        database.upsert(
          "sound_loudness_files",
          measured,
          ["relative_path"],
          [
            "scan_id",
            "absolute_path",
            "extension",
            "size_bytes",
            "mtime_ms",
            "duration_ms",
            "input_i",
            "input_tp",
            "input_lra",
            "input_thresh",
            "target_offset",
            "target_lufs",
            "true_peak_limit_dbtp",
            "recommended_gain_db",
            "recommended_volume",
            "status",
            "warnings_json",
            "error_text",
            "scanned_at"
          ]
        );

        summary.scannedFiles += 1;
        if (measured.status === "ok") summary.okFiles += 1;
        else if (measured.status === "warning") summary.warningFiles += 1;
        else summary.errorFiles += 1;
        updateProgressFromSummary(state.progress, summary, files.length, file.relativePath);
      }

      summary.finishedAt = nowIso();
      database.updateByKey("sound_loudness_scans", "scan_id", state.lastScanId, {
        finished_at: summary.finishedAt,
        status: "finished",
        scanned_files: summary.scannedFiles,
        ok_files: summary.okFiles,
        warning_files: summary.warningFiles,
        error_files: summary.errorFiles,
        error_text: ""
      });

      state.lastFinishedAt = summary.finishedAt;
      state.lastResult = summary;
      state.progress = { ...state.progress, ...summary, status: "finished", currentFile: "", progressPercent: 100 };
      return { scan: summary };
    } catch (err) {
      const finishedAt = nowIso();
      const message = errorMessage(err);
      database.updateByKey("sound_loudness_scans", "scan_id", state.lastScanId, {
        finished_at: finishedAt,
        status: "failed",
        scanned_files: summary ? summary.scannedFiles : 0,
        ok_files: summary ? summary.okFiles : 0,
        warning_files: summary ? summary.warningFiles : 0,
        error_files: summary ? summary.errorFiles : 0,
        error_text: message
      });
      state.lastFinishedAt = finishedAt;
      state.lastError = message;
      state.progress = { ...state.progress, status: "failed", finishedAt, errorText: message };
      throw err;
    } finally {
      state.running = false;
    }
  }

  function startBackgroundScan(options) {
    const prepared = prepareScan(options);
    setImmediate(() => {
      runScanAsync(options).catch(err => {
        state.running = false;
        state.lastError = errorMessage(err);
        state.lastFinishedAt = nowIso();
        state.progress = { ...state.progress, status: "failed", finishedAt: state.lastFinishedAt, errorText: state.lastError };
        try {
          database.updateByKey("sound_loudness_scans", "scan_id", options.scanId, {
            finished_at: state.lastFinishedAt,
            status: "failed",
            scanned_files: Number(state.progress.scannedFiles || 0),
            ok_files: Number(state.progress.okFiles || 0),
            warning_files: Number(state.progress.warningFiles || 0),
            error_files: Number(state.progress.errorFiles || 0),
            error_text: state.lastError
          });
        } catch (_) {}
      });
    });
    return { scanId: prepared.scanId, startedAt: prepared.startedAt, status: "running" };
  }

  async function runScanAsync(options) {
    let files = [];
    let summary = null;

    try {
      files = findSoundFiles(options.baseDir, options.allowedExtensions, options.limit, options);
      summary = {
        scanId: state.lastScanId,
        startedAt: state.lastStartedAt,
        finishedAt: "",
        baseDir: options.baseDir,
        targetLufs: options.targetLufs,
        truePeakLimitDbtp: options.truePeakLimitDbtp,
        maxPlaybackVolume: options.maxPlaybackVolume,
        discoveredFiles: files.length,
        scannedFiles: 0,
        okFiles: 0,
        warningFiles: 0,
        errorFiles: 0
      };
      state.progress.discoveredFiles = files.length;
      state.progress.progressPercent = files.length ? 0 : 100;

      for (const file of files) {
        state.progress.currentFile = file.relativePath;
        const measured = await analyzeFileAsync(file, options);
        database.upsert(
          "sound_loudness_files",
          measured,
          ["relative_path"],
          [
            "scan_id",
            "absolute_path",
            "extension",
            "size_bytes",
            "mtime_ms",
            "duration_ms",
            "input_i",
            "input_tp",
            "input_lra",
            "input_thresh",
            "target_offset",
            "target_lufs",
            "true_peak_limit_dbtp",
            "recommended_gain_db",
            "recommended_volume",
            "status",
            "warnings_json",
            "error_text",
            "scanned_at"
          ]
        );

        summary.scannedFiles += 1;
        if (measured.status === "ok") summary.okFiles += 1;
        else if (measured.status === "warning") summary.warningFiles += 1;
        else summary.errorFiles += 1;
        updateProgressFromSummary(state.progress, summary, files.length, file.relativePath);
      }

      summary.finishedAt = nowIso();
      database.updateByKey("sound_loudness_scans", "scan_id", state.lastScanId, {
        finished_at: summary.finishedAt,
        status: "finished",
        scanned_files: summary.scannedFiles,
        ok_files: summary.okFiles,
        warning_files: summary.warningFiles,
        error_files: summary.errorFiles,
        error_text: ""
      });

      state.lastFinishedAt = summary.finishedAt;
      state.lastResult = summary;
      state.progress = { ...state.progress, ...summary, status: "finished", currentFile: "", progressPercent: 100 };
      return { scan: summary };
    } catch (err) {
      const finishedAt = nowIso();
      const message = errorMessage(err);
      database.updateByKey("sound_loudness_scans", "scan_id", state.lastScanId, {
        finished_at: finishedAt,
        status: "failed",
        scanned_files: summary ? summary.scannedFiles : 0,
        ok_files: summary ? summary.okFiles : 0,
        warning_files: summary ? summary.warningFiles : 0,
        error_files: summary ? summary.errorFiles : 0,
        error_text: message
      });
      state.lastFinishedAt = finishedAt;
      state.lastError = message;
      state.progress = { ...state.progress, status: "failed", finishedAt, errorText: message };
      throw err;
    } finally {
      state.running = false;
    }
  }
};

function ensureSchema() {
  database.ensureReady({});
  database.ensureSchema(SCHEMA_MODULE, SCHEMA_VERSION, (fromVersion, toVersion, db) => {
    if (toVersion === 1) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS sound_loudness_scans (
          scan_id TEXT PRIMARY KEY,
          started_at TEXT NOT NULL,
          finished_at TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL,
          base_dir TEXT NOT NULL,
          target_lufs REAL NOT NULL,
          true_peak_limit_dbtp REAL NOT NULL,
          max_playback_volume INTEGER NOT NULL,
          scanned_files INTEGER NOT NULL DEFAULT 0,
          ok_files INTEGER NOT NULL DEFAULT 0,
          warning_files INTEGER NOT NULL DEFAULT 0,
          error_files INTEGER NOT NULL DEFAULT 0,
          error_text TEXT NOT NULL DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS sound_loudness_files (
          relative_path TEXT PRIMARY KEY,
          scan_id TEXT NOT NULL,
          absolute_path TEXT NOT NULL,
          extension TEXT NOT NULL,
          size_bytes INTEGER NOT NULL DEFAULT 0,
          mtime_ms REAL NOT NULL DEFAULT 0,
          duration_ms INTEGER NOT NULL DEFAULT 0,
          input_i REAL,
          input_tp REAL,
          input_lra REAL,
          input_thresh REAL,
          target_offset REAL,
          target_lufs REAL NOT NULL,
          true_peak_limit_dbtp REAL NOT NULL,
          recommended_gain_db REAL,
          recommended_volume INTEGER,
          status TEXT NOT NULL,
          warnings_json TEXT NOT NULL DEFAULT '[]',
          error_text TEXT NOT NULL DEFAULT '',
          scanned_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_sound_loudness_files_scan_id ON sound_loudness_files(scan_id);
        CREATE INDEX IF NOT EXISTS idx_sound_loudness_files_status ON sound_loudness_files(status);
      `);
    }
  });
  return true;
}

function parseScanOptions(input) {
  const body = input && typeof input === "object" ? input : {};
  const baseDir = resolveScanBaseDir(body.baseDir || body.base || "");
  const allowedExtensions = normalizeAllowedExtensions(body.allowedExtensions || DEFAULT_ALLOWED_EXTENSIONS);
  return {
    baseDir,
    allowedExtensions,
    excludeTts: parseBool(body.excludeTts, DEFAULT_EXCLUDE_TTS),
    excludedPathSegments: normalizeExcludedPathSegments(body.excludedPathSegments || DEFAULT_EXCLUDED_PATH_SEGMENTS),
    targetLufs: clampNumber(body.targetLufs, -40, -6, DEFAULT_TARGET_LUFS),
    truePeakLimitDbtp: clampNumber(body.truePeakLimitDbtp, -12, 0, DEFAULT_TRUE_PEAK_LIMIT_DBTP),
    maxPlaybackVolume: clampNumber(body.maxPlaybackVolume, 1, 100, DEFAULT_MAX_PLAYBACK_VOLUME),
    limit: clampNumber(body.limit, 1, 5000, DEFAULT_SCAN_LIMIT),
    timeoutMs: clampNumber(body.timeoutMs, 5000, 180000, DEFAULT_FFMPEG_TIMEOUT_MS)
  };
}

function resolveScanBaseDir(raw) {
  const defaultDir = getSoundsBaseDir();
  const value = String(raw || "").trim();
  if (!value) return defaultDir;
  if (path.isAbsolute(value)) {
    const normalized = path.resolve(value);
    const root = path.resolve(paths.ROOT_DIR);
    if (!normalized.startsWith(root)) throw new Error("base_dir_outside_project_root");
    return normalized;
  }
  if (value.includes("..")) throw new Error("unsafe_base_dir");
  return path.resolve(paths.ROOT_DIR, value);
}

function getSoundsBaseDir() {
  return path.join(paths.WEBROOT_DIR, "assets", "sounds");
}

function normalizeExcludedPathSegments(value) {
  const list = Array.isArray(value) ? value : DEFAULT_EXCLUDED_PATH_SEGMENTS;
  const clean = list
    .map(item => String(item || "").trim().toLowerCase().replace(/\\/g, "/"))
    .filter(Boolean)
    .map(item => item.replace(/^\/+|\/+$/g, ""));
  return clean.length ? Array.from(new Set(clean)) : DEFAULT_EXCLUDED_PATH_SEGMENTS.slice();
}

function isExcludedTtsPath(relativePath, excludedSegments = DEFAULT_EXCLUDED_PATH_SEGMENTS) {
  const clean = normalizeRelativePath(relativePath).toLowerCase();
  if (!clean) return false;
  const parts = clean.split("/").filter(Boolean);
  const segments = normalizeExcludedPathSegments(excludedSegments);

  for (const segment of segments) {
    if (!segment) continue;
    if (segment.includes("/")) {
      if (clean === segment || clean.startsWith(`${segment}/`) || clean.includes(`/${segment}/`)) return true;
      continue;
    }
    if (parts.includes(segment)) return true;
  }

  const fileName = parts[parts.length - 1] || "";
  if (fileName.startsWith("tts_") || fileName.startsWith("tts-") || fileName.includes("_tts_") || fileName.includes("-tts-")) return true;
  if (clean.includes("/tts_") || clean.includes("/tts-")) return true;
  return false;
}

function appendExcludedPathFilter(whereParts, params) {
  const segments = normalizeExcludedPathSegments(DEFAULT_EXCLUDED_PATH_SEGMENTS);
  let index = 0;
  for (const segment of segments) {
    const key = `excludedPath${index}`;
    const keyStart = `excludedPathStart${index}`;
    if (segment.includes("/")) {
      whereParts.push(`relative_path NOT LIKE :${key}`);
      params[key] = `%${segment}/%`;
    } else {
      whereParts.push(`relative_path NOT LIKE :${key}`);
      whereParts.push(`relative_path NOT LIKE :${keyStart}`);
      params[key] = `%/${segment}/%`;
      params[keyStart] = `${segment}/%`;
    }
    index += 1;
  }
  whereParts.push("relative_path NOT LIKE :excludedTtsPrefix1");
  whereParts.push("relative_path NOT LIKE :excludedTtsPrefix2");
  whereParts.push("relative_path NOT LIKE :excludedTtsMiddle1");
  whereParts.push("relative_path NOT LIKE :excludedTtsMiddle2");
  params.excludedTtsPrefix1 = "tts_%";
  params.excludedTtsPrefix2 = "tts-%";
  params.excludedTtsMiddle1 = "%/tts_%";
  params.excludedTtsMiddle2 = "%/tts-%";
}

function parseBool(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  const clean = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(clean)) return true;
  if (["0", "false", "no", "off"].includes(clean)) return false;
  return fallback;
}

function normalizeAllowedExtensions(value) {
  const list = Array.isArray(value) ? value : DEFAULT_ALLOWED_EXTENSIONS;
  const clean = list
    .map(item => String(item || "").trim().toLowerCase())
    .filter(Boolean)
    .map(item => item.startsWith(".") ? item : `.${item}`);
  return clean.length ? Array.from(new Set(clean)) : DEFAULT_ALLOWED_EXTENSIONS.slice();
}

function findSoundFiles(baseDir, allowedExtensions, limit, options = {}) {
  if (!fs.existsSync(baseDir)) throw new Error(`sounds_base_dir_missing:${baseDir}`);
  const files = [];
  walkDir(baseDir, baseDir, allowedExtensions, files, limit, options);
  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function walkDir(baseDir, currentDir, allowedExtensions, files, limit, options = {}) {
  if (files.length >= limit) return;
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    if (files.length >= limit) return;
    if (!entry || entry.name.startsWith(".")) continue;
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      walkDir(baseDir, fullPath, allowedExtensions, files, limit, options);
      continue;
    }
    if (!entry.isFile()) continue;
    const extension = path.extname(entry.name).toLowerCase();
    if (!allowedExtensions.includes(extension)) continue;
    const relativePath = normalizeRelativePath(path.relative(baseDir, fullPath));
    if (options.excludeTts !== false && isExcludedTtsPath(relativePath, options.excludedPathSegments)) continue;
    files.push({ baseDir, fullPath, relativePath, extension });
  }
}

function analyzeFile(file, options) {
  const now = nowIso();
  const stat = fs.statSync(file.fullPath);
  const base = {
    relative_path: file.relativePath,
    scan_id: options.scanId || "",
    absolute_path: file.fullPath,
    extension: file.extension,
    size_bytes: Number(stat.size || 0),
    mtime_ms: Number(stat.mtimeMs || 0),
    duration_ms: 0,
    input_i: null,
    input_tp: null,
    input_lra: null,
    input_thresh: null,
    target_offset: null,
    target_lufs: options.targetLufs,
    true_peak_limit_dbtp: options.truePeakLimitDbtp,
    recommended_gain_db: null,
    recommended_volume: null,
    status: "error",
    warnings_json: "[]",
    error_text: "",
    scanned_at: now
  };

  try {
    base.scan_id = options.scanId || findCurrentScanIdFallback();
    const mediaInfo = media.readMediaInfo(file.fullPath, { cache: false, timeoutMs: Math.min(options.timeoutMs, 30000) });
    if (mediaInfo && mediaInfo.durationMs) base.duration_ms = Number(mediaInfo.durationMs || 0);
    if (!mediaInfo || !mediaInfo.hasAudio) {
      base.status = "error";
      base.error_text = "audio_stream_missing";
      return base;
    }

    const loudness = runLoudnessMeasure(file.fullPath, options);
    base.input_i = loudness.input_i;
    base.input_tp = loudness.input_tp;
    base.input_lra = loudness.input_lra;
    base.input_thresh = loudness.input_thresh;
    base.target_offset = loudness.target_offset;

    const gainDb = round1(options.targetLufs - loudness.input_i);
    base.recommended_gain_db = gainDb;
    base.recommended_volume = gainToVolume(gainDb, options.maxPlaybackVolume);

    const warnings = [];
    if (Number.isFinite(loudness.input_tp) && loudness.input_tp > options.truePeakLimitDbtp) warnings.push("true_peak_above_limit");
    if (gainDb > 8) warnings.push("large_positive_gain");
    if (gainDb < -12) warnings.push("large_negative_gain");
    if (base.recommended_volume >= 100 && gainDb > 0) warnings.push("volume_cap_reached");
    base.warnings_json = JSON.stringify(warnings);
    base.status = warnings.length ? "warning" : "ok";
    return base;
  } catch (err) {
    base.status = "error";
    base.error_text = errorMessage(err);
    return base;
  }
}


async function analyzeFileAsync(file, options) {
  const now = nowIso();
  const stat = fs.statSync(file.fullPath);
  const base = {
    relative_path: file.relativePath,
    scan_id: options.scanId || "",
    absolute_path: file.fullPath,
    extension: file.extension,
    size_bytes: Number(stat.size || 0),
    mtime_ms: Number(stat.mtimeMs || 0),
    duration_ms: 0,
    input_i: null,
    input_tp: null,
    input_lra: null,
    input_thresh: null,
    target_offset: null,
    target_lufs: options.targetLufs,
    true_peak_limit_dbtp: options.truePeakLimitDbtp,
    recommended_gain_db: null,
    recommended_volume: null,
    status: "error",
    warnings_json: "[]",
    error_text: "",
    scanned_at: now
  };

  try {
    base.scan_id = options.scanId || findCurrentScanIdFallback();
    const mediaInfo = media.readMediaInfo(file.fullPath, { cache: false, timeoutMs: Math.min(options.timeoutMs, 30000) });
    if (mediaInfo && mediaInfo.durationMs) base.duration_ms = Number(mediaInfo.durationMs || 0);
    if (!mediaInfo || !mediaInfo.hasAudio) {
      base.status = "error";
      base.error_text = "audio_stream_missing";
      return base;
    }

    const loudness = await runLoudnessMeasureAsync(file.fullPath, options);
    base.input_i = loudness.input_i;
    base.input_tp = loudness.input_tp;
    base.input_lra = loudness.input_lra;
    base.input_thresh = loudness.input_thresh;
    base.target_offset = loudness.target_offset;

    const gainDb = round1(options.targetLufs - loudness.input_i);
    base.recommended_gain_db = gainDb;
    base.recommended_volume = gainToVolume(gainDb, options.maxPlaybackVolume);

    const warnings = [];
    if (Number.isFinite(loudness.input_tp) && loudness.input_tp > options.truePeakLimitDbtp) warnings.push("true_peak_above_limit");
    if (gainDb > 8) warnings.push("large_positive_gain");
    if (gainDb < -12) warnings.push("large_negative_gain");
    if (base.recommended_volume >= 100 && gainDb > 0) warnings.push("volume_cap_reached");
    base.warnings_json = JSON.stringify(warnings);
    base.status = warnings.length ? "warning" : "ok";
    return base;
  } catch (err) {
    base.status = "error";
    base.error_text = errorMessage(err);
    return base;
  }
}

function findCurrentScanIdFallback() {
  const row = database.get("SELECT scan_id FROM sound_loudness_scans ORDER BY started_at DESC LIMIT 1") || null;
  return row ? String(row.scan_id || "") : "";
}

function runLoudnessMeasure(filePath, options) {
  const ffmpeg = findFfmpeg();
  const args = [
    "-hide_banner",
    "-nostats",
    "-i", filePath,
    "-af", `loudnorm=I=${options.targetLufs}:TP=${options.truePeakLimitDbtp}:LRA=11:print_format=json`,
    "-f", "null",
    "-"
  ];

  const result = childProcess.spawnSync(ffmpeg, args, {
    encoding: "utf8",
    timeout: options.timeoutMs,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 10
  });

  const combined = `${result.stdout || ""}\n${result.stderr || ""}`;
  if (result.error) throw result.error;
  const parsed = extractLoudnormJson(combined);
  const inputI = parseFinite(parsed.input_i);
  if (!Number.isFinite(inputI)) throw new Error("loudness_input_i_missing");
  return {
    input_i: inputI,
    input_tp: parseFinite(parsed.input_tp),
    input_lra: parseFinite(parsed.input_lra),
    input_thresh: parseFinite(parsed.input_thresh),
    target_offset: parseFinite(parsed.target_offset)
  };
}


function runLoudnessMeasureAsync(filePath, options) {
  return new Promise((resolve, reject) => {
    const ffmpeg = findFfmpeg();
    const args = [
      "-hide_banner",
      "-nostats",
      "-i", filePath,
      "-af", `loudnorm=I=${options.targetLufs}:TP=${options.truePeakLimitDbtp}:LRA=11:print_format=json`,
      "-f", "null",
      "-"
    ];

    const child = childProcess.spawn(ffmpeg, args, { windowsHide: true });
    let stdout = "";
    let stderr = "";
    let finished = false;
    const maxBuffer = 1024 * 1024 * 10;

    const timer = setTimeout(() => {
      if (finished) return;
      finished = true;
      try { child.kill("SIGKILL"); } catch (_) {}
      reject(new Error("ffmpeg_timeout"));
    }, options.timeoutMs);

    child.stdout.on("data", chunk => {
      stdout += chunk.toString("utf8");
      if (stdout.length + stderr.length > maxBuffer && !finished) {
        finished = true;
        clearTimeout(timer);
        try { child.kill("SIGKILL"); } catch (_) {}
        reject(new Error("ffmpeg_output_too_large"));
      }
    });

    child.stderr.on("data", chunk => {
      stderr += chunk.toString("utf8");
      if (stdout.length + stderr.length > maxBuffer && !finished) {
        finished = true;
        clearTimeout(timer);
        try { child.kill("SIGKILL"); } catch (_) {}
        reject(new Error("ffmpeg_output_too_large"));
      }
    });

    child.on("error", err => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      reject(err);
    });

    child.on("close", () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      try {
        const parsed = extractLoudnormJson(`${stdout}\n${stderr}`);
        const inputI = parseFinite(parsed.input_i);
        if (!Number.isFinite(inputI)) throw new Error("loudness_input_i_missing");
        resolve({
          input_i: inputI,
          input_tp: parseFinite(parsed.input_tp),
          input_lra: parseFinite(parsed.input_lra),
          input_thresh: parseFinite(parsed.input_thresh),
          target_offset: parseFinite(parsed.target_offset)
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}

function extractLoudnormJson(text) {
  const raw = String(text || "");
  const markerIndex = raw.lastIndexOf("input_i");
  if (markerIndex < 0) throw new Error("loudnorm_json_missing");
  const start = raw.lastIndexOf("{", markerIndex);
  const end = raw.indexOf("}", markerIndex);
  if (start < 0 || end < 0 || end <= start) throw new Error("loudnorm_json_invalid");
  return JSON.parse(raw.slice(start, end + 1));
}

function findFfmpeg() {
  const configured = process.env.FFMPEG_PATH || "";
  if (configured && fs.existsSync(configured)) return configured;

  const candidates = [
    path.join(paths.TOOLS_DIR, "ffmpeg", "ffmpeg.exe"),
    path.join(paths.TOOLS_DIR, "ffmpeg", "bin", "ffmpeg.exe"),
    path.join(paths.ROOT_DIR, "ffmpeg", "ffmpeg.exe"),
    "ffmpeg"
  ];

  for (const candidate of candidates) {
    try {
      if (candidate === "ffmpeg" || fs.existsSync(candidate)) return candidate;
    } catch (_) {}
  }
  return "ffmpeg";
}

function gainToVolume(gainDb, maxVolume) {
  if (!Number.isFinite(gainDb)) return null;
  const linear = Math.pow(10, gainDb / 20);
  const volume = Math.round(Number(maxVolume || DEFAULT_MAX_PLAYBACK_VOLUME) * linear);
  return Math.max(1, Math.min(100, volume));
}

function emptyProgress() {
  return {
    scanId: "",
    status: "idle",
    startedAt: "",
    finishedAt: "",
    baseDir: "",
    targetLufs: DEFAULT_TARGET_LUFS,
    truePeakLimitDbtp: DEFAULT_TRUE_PEAK_LIMIT_DBTP,
    maxPlaybackVolume: DEFAULT_MAX_PLAYBACK_VOLUME,
    discoveredFiles: 0,
    scannedFiles: 0,
    okFiles: 0,
    warningFiles: 0,
    errorFiles: 0,
    currentFile: "",
    progressPercent: 0,
    errorText: ""
  };
}

function updateProgressFromSummary(progress, summary, total, currentFile) {
  progress.discoveredFiles = Number(total || summary.discoveredFiles || 0);
  progress.scannedFiles = Number(summary.scannedFiles || 0);
  progress.okFiles = Number(summary.okFiles || 0);
  progress.warningFiles = Number(summary.warningFiles || 0);
  progress.errorFiles = Number(summary.errorFiles || 0);
  progress.currentFile = String(currentFile || "");
  progress.progressPercent = progress.discoveredFiles > 0 ? Math.min(100, Math.round((progress.scannedFiles / progress.discoveredFiles) * 1000) / 10) : 100;
  progress.status = "running";
}

function publicProgress(progress) {
  const p = progress || emptyProgress();
  return {
    scanId: String(p.scanId || ""),
    status: String(p.status || "idle"),
    startedAt: String(p.startedAt || ""),
    finishedAt: String(p.finishedAt || ""),
    baseDir: String(p.baseDir || ""),
    targetLufs: nullableNumber(p.targetLufs),
    truePeakLimitDbtp: nullableNumber(p.truePeakLimitDbtp),
    maxPlaybackVolume: nullableNumber(p.maxPlaybackVolume),
    discoveredFiles: Number(p.discoveredFiles || 0),
    scannedFiles: Number(p.scannedFiles || 0),
    okFiles: Number(p.okFiles || 0),
    warningFiles: Number(p.warningFiles || 0),
    errorFiles: Number(p.errorFiles || 0),
    currentFile: String(p.currentFile || ""),
    progressPercent: nullableNumber(p.progressPercent) || 0,
    errorText: String(p.errorText || "")
  };
}

function publicScan(row) {
  return {
    scanId: String(row.scan_id || ""),
    startedAt: String(row.started_at || ""),
    finishedAt: String(row.finished_at || ""),
    status: String(row.status || ""),
    baseDir: String(row.base_dir || ""),
    targetLufs: nullableNumber(row.target_lufs),
    truePeakLimitDbtp: nullableNumber(row.true_peak_limit_dbtp),
    maxPlaybackVolume: nullableNumber(row.max_playback_volume),
    scannedFiles: Number(row.scanned_files || 0),
    okFiles: Number(row.ok_files || 0),
    warningFiles: Number(row.warning_files || 0),
    errorFiles: Number(row.error_files || 0),
    errorText: String(row.error_text || "")
  };
}

function publicFileResult(row) {
  return {
    relativePath: String(row.relative_path || ""),
    scanId: String(row.scan_id || ""),
    extension: String(row.extension || ""),
    sizeBytes: Number(row.size_bytes || 0),
    mtimeMs: nullableNumber(row.mtime_ms),
    durationMs: Number(row.duration_ms || 0),
    inputI: nullableNumber(row.input_i),
    inputTp: nullableNumber(row.input_tp),
    inputLra: nullableNumber(row.input_lra),
    inputThresh: nullableNumber(row.input_thresh),
    targetOffset: nullableNumber(row.target_offset),
    targetLufs: nullableNumber(row.target_lufs),
    truePeakLimitDbtp: nullableNumber(row.true_peak_limit_dbtp),
    recommendedGainDb: nullableNumber(row.recommended_gain_db),
    recommendedVolume: row.recommended_volume === null || row.recommended_volume === undefined ? null : Number(row.recommended_volume),
    status: String(row.status || ""),
    warnings: parseJsonArray(row.warnings_json),
    errorText: String(row.error_text || ""),
    scannedAt: String(row.scanned_at || "")
  };
}

function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(String(value || "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function normalizeRelativePath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\/+/, "").trim();
}

function normalizeOrder(value) {
  const allowed = new Set(["relative_path", "status", "input_i", "input_tp", "recommended_gain_db", "recommended_volume", "duration_ms", "scanned_at"]);
  const clean = String(value || "relative_path").trim();
  return allowed.has(clean) ? clean : "relative_path";
}

function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

function parseFinite(value) {
  const num = Number.parseFloat(String(value || "").trim());
  return Number.isFinite(num) ? num : null;
}

function nullableNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function round1(value) {
  return Number.isFinite(value) ? Math.round(value * 10) / 10 : null;
}

function makeScanId() {
  return `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function errorMessage(err) {
  return err && err.message ? err.message : String(err || "unknown_error");
}
