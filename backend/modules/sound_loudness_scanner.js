"use strict";

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const database = require("../core/database");
const paths = require("../core/paths");
const media = require("./helpers/helper_media");
const settingsHelper = require("./helpers/helper_settings");

const MODULE_NAME = "sound_loudness_scanner";
const SCHEMA_MODULE = "sound_loudness_scanner";
const SCHEMA_VERSION = 2;
const ROUTE_PREFIX = "/api/sound/loudness";

const DEFAULT_ALLOWED_EXTENSIONS = [".mp3", ".wav", ".ogg", ".webm", ".m4a", ".mp4"];
const DEFAULT_TARGET_LUFS = -18;
const DEFAULT_TRUE_PEAK_LIMIT_DBTP = -1.5;
const DEFAULT_MAX_PLAYBACK_VOLUME = 80;
const DEFAULT_SCAN_LIMIT = 500;
const DEFAULT_FFMPEG_TIMEOUT_MS = 45000;
const DEFAULT_EXCLUDE_TTS = true;
const DEFAULT_EXCLUDED_PATH_SEGMENTS = ["tts", "tts_system", "alert_tts", "generated_tts", "temp_tts", "tts_cache"];
const DEFAULT_CORRECTION_SETTINGS = {
  enabled: false,
  mode: "off",
  targetLufs: DEFAULT_TARGET_LUFS,
  truePeakLimitDbtp: DEFAULT_TRUE_PEAK_LIMIT_DBTP,
  maxPlaybackVolume: DEFAULT_MAX_PLAYBACK_VOLUME,
  minPlaybackVolume: 35,
  maxBoostDb: 3,
  maxCutDb: 12,
  strengthPercent: 50,
  protectTruePeak: true,
  excludeTts: true,
  applyToTargets: ["stream", "discord", "both", "device", "overlay"],
  updatedAt: "",
  updatedBy: ""
};
const DEFAULT_NORMALIZATION_SETTINGS = {
  enabled: false,
  mode: "planned",
  outputDir: "htdocs/assets/sounds/normalized",
  overwriteOriginals: false,
  keepOriginals: true,
  createMissingFolders: true,
  status: "planned_not_implemented",
  updatedAt: "",
  updatedBy: ""
};

const DEFAULT_LEVEL_CONFIG = {
  defaultPlaybackVolume: 80,
  maxPlaybackVolume: 100,
  uploadDefaultVolume: 80,
  referenceToleranceDb: 3,
  boostTargetLufs: -14,
  boostReferenceSafetyDb: 2,
  boostMaxGainDb: 12,
  defaultScanLimit: DEFAULT_SCAN_LIMIT,
  defaultResultLimit: 250,
  defaultReferenceOutputTarget: "overlay",
  uploadDefaults: {
    alerts: true,
    soundalerts: true,
    vipMod: true,
    soundPresets: true
  },
  massApply: {
    mode: "preview_only",
    includeAlerts: true,
    includeSoundAlerts: true,
    includeVipMod: true,
    includeSoundPresets: false,
    overwriteExistingVolumes: false
  },
  updatedAt: "",
  updatedBy: ""
};

module.exports.init = function init(ctx) {
  const { app } = ctx;

  const state = {
    module: MODULE_NAME,
    version: "0.1.8-step272g1-reference-boost-target",
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

  app.get(`${ROUTE_PREFIX}/config`, (req, res) => {
    try {
      ensureSchema();
      res.json({
        ok: true,
        module: MODULE_NAME,
        config: getLevelConfig(),
        notes: [
          "Stored in SQLite table sound_loudness_settings under key level_config.",
          "This step stores central defaults only. It does not rewrite existing Alert/VIP/SoundAlert data.",
          "Upload defaults must be consumed by upload modules in a later step."
        ]
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: errorMessage(err) });
    }
  });

  app.post(`${ROUTE_PREFIX}/config`, (req, res) => {
    try {
      ensureSchema();
      const body = req.body || {};
      const updatedBy = String(body.updatedBy || body.user || "dashboard");
      const saved = saveLevelConfig(body.config || body, updatedBy);
      res.json({
        ok: true,
        module: MODULE_NAME,
        config: saved,
        notes: [
          "Saved to SQLite.",
          "No existing sounds or module configs were modified."
        ]
      });
    } catch (err) {
      res.status(400).json({ ok: false, error: errorMessage(err) });
    }
  });


  app.post(`${ROUTE_PREFIX}/config/adopt-reference-target`, (req, res) => {
    try {
      ensureSchema();
      const body = req.body || {};
      const cfg = getLevelConfig();
      const toleranceDb = clampNumber(body.toleranceDb ?? cfg.referenceToleranceDb, 0.5, 12, cfg.referenceToleranceDb || 3);
      const safetyDb = clampNumber(body.safetyDb ?? cfg.boostReferenceSafetyDb, 0, 8, cfg.boostReferenceSafetyDb || 2);
      const reference = buildAutoReference({ toleranceDb, includeExcluded: false });
      const referenceLufs = numberOrNull(reference.referenceLufs);
      if (referenceLufs === null) throw new Error("reference_lufs_not_available");
      const targetLufs = round2(clampNumber(referenceLufs - safetyDb, -40, -6, -14));
      const saved = saveLevelConfig({ ...cfg, boostTargetLufs: targetLufs, boostReferenceSafetyDb: safetyDb }, String(body.updatedBy || body.user || "dashboard"));
      res.json({
        ok: true,
        module: MODULE_NAME,
        action: "adopt_reference_target",
        referenceLufs,
        safetyDb,
        targetLufs,
        config: saved,
        reference,
        notes: [
          "Boost-Ziel wurde aus der aktuellen Auto-Referenz minus Sicherheitsabstand berechnet.",
          "Es wurden keine Sounddateien erzeugt oder verändert."
        ]
      });
    } catch (err) {
      res.status(400).json({ ok: false, error: errorMessage(err) });
    }
  });

  app.get(`${ROUTE_PREFIX}/config/apply-defaults/preview`, (req, res) => {
    try {
      ensureSchema();
      res.json(buildUploadDefaultApplyResult(false, "preview"));
    } catch (err) {
      res.status(500).json({ ok: false, error: errorMessage(err) });
    }
  });

  app.get(`${ROUTE_PREFIX}/config/mass-volume-preview`, (req, res) => {
    try {
      ensureSchema();
      res.json(buildExistingVolumePreview());
    } catch (err) {
      res.status(500).json({ ok: false, error: errorMessage(err) });
    }
  });

  app.post(`${ROUTE_PREFIX}/config/mass-volume-apply/alerts-missing`, (req, res) => {
    try {
      ensureSchema();
      const body = req.body || {};
      const updatedBy = String(body.updatedBy || body.user || "dashboard");
      res.json(applyMissingAlertRuleVolumes(updatedBy));
    } catch (err) {
      res.status(400).json({ ok: false, error: errorMessage(err) });
    }
  });

  app.get(`${ROUTE_PREFIX}/boost/preview`, (req, res) => {
    try {
      ensureSchema();
      const limit = Math.round(clampNumber(req.query.limit, 1, 500, 100));
      const includeExisting = parseBool(req.query.includeExisting, true);
      res.json(buildBoostCopyPreview({ limit, includeExisting }));
    } catch (err) {
      res.status(500).json({ ok: false, error: errorMessage(err) });
    }
  });

  app.post(`${ROUTE_PREFIX}/boost/create-one`, (req, res) => {
    try {
      ensureSchema();
      const body = req.body || {};
      const relativePath = normalizeRelativePath(body.file || body.relativePath || body.path || "");
      const updatedBy = String(body.updatedBy || body.user || "dashboard");
      res.json(createBoostCopyForFile(relativePath, { updatedBy, targetLufs: body.targetLufs, maxGainDb: body.maxGainDb }));
    } catch (err) {
      res.status(400).json({ ok: false, error: errorMessage(err) });
    }
  });

  app.post(`${ROUTE_PREFIX}/config/apply-defaults`, (req, res) => {
    try {
      ensureSchema();
      const body = req.body || {};
      const updatedBy = String(body.updatedBy || body.user || "dashboard");
      res.json(buildUploadDefaultApplyResult(true, updatedBy));
    } catch (err) {
      res.status(400).json({ ok: false, error: errorMessage(err) });
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


  app.get(`${ROUTE_PREFIX}/reference`, (req, res) => {
    try {
      ensureSchema();
      const toleranceDb = clampNumber(req.query.toleranceDb, 0.5, 12, 3);
      const includeExcluded = parseBool(req.query.includeExcluded, false);
      const reference = buildAutoReference({ toleranceDb, includeExcluded });
      res.json({ ok: true, module: MODULE_NAME, reference });
    } catch (err) {
      res.status(500).json({ ok: false, error: errorMessage(err) });
    }
  });

  app.get(`${ROUTE_PREFIX}/reference/test.wav`, (req, res) => {
    try {
      ensureSchema();
      const targetLufs = clampNumber(req.query.targetLufs, -40, -6, DEFAULT_TARGET_LUFS);
      const durationMs = Math.round(clampNumber(req.query.durationMs, 1000, 30000, 10000));
      const wav = createReferenceTestWavBuffer({ targetLufs, durationMs });
      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Length", wav.length);
      res.setHeader("Cache-Control", "no-store");
      res.end(wav);
    } catch (err) {
      res.status(500).json({ ok: false, error: errorMessage(err) });
    }
  });

  app.all(`${ROUTE_PREFIX}/reference/test-file`, (req, res) => {
    try {
      ensureSchema();
      const input = req.method === "POST" ? (req.body || {}) : (req.query || {});
      const targetLufs = clampNumber(input.targetLufs, -40, -6, DEFAULT_TARGET_LUFS);
      const durationMs = Math.round(clampNumber(input.durationMs, 1000, 30000, 10000));
      const result = ensureReferenceTestSoundFile({ targetLufs, durationMs });
      res.json({ ok: true, module: MODULE_NAME, testSound: result });
    } catch (err) {
      res.status(500).json({ ok: false, error: errorMessage(err) });
    }
  });

  app.get(`${ROUTE_PREFIX}/correction/settings`, (req, res) => {
    try {
      ensureSchema();
      res.json({
        ok: true,
        module: MODULE_NAME,
        correction: getCorrectionSettings(),
        normalization: getNormalizationSettings(),
        notes: [
          "Playback correction can be applied centrally by sound_system when enabled and mode=ready.",
          "Normalized-copy export is planned but not implemented in this step.",
          "No sound files are modified."
        ]
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: errorMessage(err) });
    }
  });

  app.post(`${ROUTE_PREFIX}/correction/settings`, (req, res) => {
    try {
      ensureSchema();
      const body = req.body || {};
      const correction = saveCorrectionSettings(body.correction || body, String(body.updatedBy || body.user || "dashboard"));
      let normalization = getNormalizationSettings();
      if (body.normalization && typeof body.normalization === "object") {
        normalization = saveNormalizationSettings(body.normalization, String(body.updatedBy || body.user || "dashboard"));
      }
      res.json({ ok: true, module: MODULE_NAME, correction, normalization });
    } catch (err) {
      res.status(400).json({ ok: false, error: errorMessage(err) });
    }
  });

  app.get(`${ROUTE_PREFIX}/correction/preview`, (req, res) => {
    try {
      ensureSchema();
      const limit = clampNumber(req.query.limit, 1, 1000, 250);
      const offset = clampNumber(req.query.offset, 0, 1000000, 0);
      const status = String(req.query.status || "").trim();
      const includeExcluded = parseBool(req.query.includeExcluded, false);
      const order = normalizeOrder(req.query.order || "recommended_gain_db");
      const direction = String(req.query.dir || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
      const settings = getCorrectionSettings();
      const filterParams = {};
      const whereParts = [];
      if (status) {
        whereParts.push("status = :status");
        filterParams.status = status;
      }
      if (!includeExcluded && settings.excludeTts !== false) appendExcludedPathFilter(whereParts, filterParams);
      const where = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
      const totalRow = database.get(`SELECT COUNT(*) AS count FROM sound_loudness_files ${where}`, filterParams) || { count: 0 };
      const rows = database.all(
        `SELECT * FROM sound_loudness_files ${where} ORDER BY ${order} ${direction} LIMIT ${limit} OFFSET ${offset}`,
        filterParams
      ) || [];
      const previewRows = rows.map(row => buildCorrectionPreview(publicFileResult(row), settings));
      res.json({
        ok: true,
        module: MODULE_NAME,
        correction: settings,
        normalization: getNormalizationSettings(),
        count: previewRows.length,
        total: Number(totalRow.count || 0),
        limit,
        offset,
        summary: summarizeCorrectionPreview(previewRows),
        results: previewRows
      });
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
        { method: "GET", path: `${ROUTE_PREFIX}/config`, description: "Read central Sound-Pegel defaults saved in SQLite" },
        { method: "POST", path: `${ROUTE_PREFIX}/config`, description: "Save central Sound-Pegel defaults to SQLite; does not rewrite existing sounds" },
        { method: "GET", path: `${ROUTE_PREFIX}/config/apply-defaults/preview`, description: "Preview applying Sound-Pegel defaults to DB-backed module settings" },
        { method: "POST", path: `${ROUTE_PREFIX}/config/apply-defaults`, description: "Apply Sound-Pegel default volume to DB-backed module settings; no existing sound files are changed" },
        { method: "GET", path: `${ROUTE_PREFIX}/config/mass-volume-preview`, description: "Preview existing Alert/SoundAlert/VIP volume values and loudness-derived needs without changing data" },
        { method: "POST", path: `${ROUTE_PREFIX}/config/mass-volume-apply/alerts-missing`, description: "Set only missing/invalid Alert rule sound_volume values to the configured default" },
        { method: "POST", path: `${ROUTE_PREFIX}/config/adopt-reference-target`, description: "Store boost target LUFS based on auto reference minus safety dB" },
        { method: "GET", path: `${ROUTE_PREFIX}/boost/preview`, description: "Preview files whose scan suggests a boosted copy is needed" },
        { method: "POST", path: `${ROUTE_PREFIX}/boost/create-one`, description: "Create one boosted copy inside htdocs/assets/sounds/normalized without touching the original" },
        { method: "GET", path: `${ROUTE_PREFIX}/reference`, description: "Calculate automatic reference loudness and recommend a real reference sound" },
        { method: "GET", path: `${ROUTE_PREFIX}/reference/test.wav`, description: "Generated approximate reference test sound for direct browser checks" },
        { method: "GET/POST", path: `${ROUTE_PREFIX}/reference/test-file`, description: "Create/update generated/reference_test.wav in sounds folder so it can be played via Sound-System/OBS" },
        { method: "GET", path: `${ROUTE_PREFIX}/correction/settings`, description: "Read inactive playback-correction and planned normalization-export settings" },
        { method: "POST", path: `${ROUTE_PREFIX}/correction/settings`, description: "Save inactive correction-preview settings; does not change playback" },
        { method: "GET", path: `${ROUTE_PREFIX}/correction/preview`, description: "Return correction preview rows based on saved settings; does not apply playback changes" },
        { method: "GET", path: `${ROUTE_PREFIX}/routes`, description: "Route self-documentation" }
      ],
      notes: [
        "Read-only: no sound file is modified.",
        "TTS/generated speech files are excluded by default.",
        "Results are stored in SQLite using CREATE TABLE IF NOT EXISTS migration only.",
        "Sound-System queue, Discord routing and Alert bundle logic are not changed.",
        "Correction settings may be used by sound_system for optional playback-volume correction when explicitly enabled."
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

    if (toVersion === 2) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS sound_loudness_settings (
          key TEXT PRIMARY KEY,
          value_json TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          updated_by TEXT NOT NULL DEFAULT ''
        );
      `);
    }
  });
  return true;
}


function getJsonSetting(key, fallback) {
  ensureSchema();
  const row = database.get("SELECT value_json FROM sound_loudness_settings WHERE key = :key", { key }) || null;
  if (!row) return cloneJson(fallback);
  try {
    const parsed = JSON.parse(String(row.value_json || "{}"));
    return { ...cloneJson(fallback), ...(parsed && typeof parsed === "object" ? parsed : {}) };
  } catch (_) {
    return cloneJson(fallback);
  }
}

function saveJsonSetting(key, value, updatedBy) {
  ensureSchema();
  const now = nowIso();
  const payload = { ...(value || {}), updatedAt: now, updatedBy: String(updatedBy || "") };
  database.upsert(
    "sound_loudness_settings",
    {
      key,
      value_json: JSON.stringify(payload),
      updated_at: now,
      updated_by: String(updatedBy || "")
    },
    ["key"],
    ["value_json", "updated_at", "updated_by"]
  );
  return payload;
}


function readSoundSystemBlock(key) {
  ensureSoundSettingsTable();
  const safeKey = String(key || "").trim();
  if (!safeKey) return {};
  const row = database.get("SELECT value_json FROM sound_settings WHERE key = :key", { key: safeKey }) || null;
  if (!row || !row.value_json) return {};
  try {
    const parsed = JSON.parse(String(row.value_json || "{}"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

function readSoundSystemOutputSettings() {
  return readSoundSystemBlock("output");
}

function ensureSoundSettingsTable() {
  database.exec(`
    CREATE TABLE IF NOT EXISTS sound_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT NOT NULL DEFAULT ''
    );
  `);
}

function writeSoundSystemBlock(key, value, updatedBy) {
  ensureSoundSettingsTable();
  const now = nowIso();
  database.upsert(
    "sound_settings",
    {
      key: String(key || ""),
      value_json: JSON.stringify(value || {}),
      updated_at: now,
      updated_by: String(updatedBy || "sound_level")
    },
    ["key"],
    ["value_json", "updated_at", "updated_by"]
  );
}

function writeSoundSystemOutputSettings(output, updatedBy) {
  writeSoundSystemBlock("output", output, updatedBy);
}

function clonePlain(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return JSON.parse(JSON.stringify(value));
}

function buildOutputWithDefaultVolume(currentOutput, defaultPlaybackVolume) {
  const output = clonePlain(currentOutput);
  if (!output.targets || typeof output.targets !== "object" || Array.isArray(output.targets)) output.targets = {};
  for (const key of ["overlay", "device", "both"]) {
    if (!output.targets[key] || typeof output.targets[key] !== "object" || Array.isArray(output.targets[key])) output.targets[key] = {};
    output.targets[key].defaultVolume = defaultPlaybackVolume;
  }
  return output;
}

function buildLegacyTargetsWithDefaultVolume(currentTargets, defaultPlaybackVolume) {
  const targets = clonePlain(currentTargets);
  for (const key of ["stream", "discord", "both"]) {
    if (!targets[key] || typeof targets[key] !== "object" || Array.isArray(targets[key])) targets[key] = {};
    targets[key].defaultVolume = defaultPlaybackVolume;
  }
  return targets;
}

function buildFallbackDefaultsWithDefaultVolume(currentDefaults, defaultPlaybackVolume) {
  const defaults = clonePlain(currentDefaults);
  defaults.volume = defaultPlaybackVolume;
  return defaults;
}

function readModuleSetting(table, key, fallback, valueType = "number") {
  try {
    const row = settingsHelper.getSetting(table, key, fallback, { valueType });
    return row ? row.value : fallback;
  } catch (_) {
    return fallback;
  }
}

function applyModuleSetting(table, key, value, valueType, description) {
  return settingsHelper.setSetting(table, key, value, { valueType, description });
}


function tableExists(tableName) {
  try {
    const row = database.get("SELECT name FROM sqlite_master WHERE type='table' AND name=:name", { name: String(tableName || "") });
    return !!row;
  } catch (_) {
    return false;
  }
}

function tableColumns(tableName) {
  if (!tableExists(tableName)) return [];
  try {
    return (database.all(`PRAGMA table_info(${tableName})`) || []).map(row => String(row.name || ""));
  } catch (_) {
    return [];
  }
}

function hasColumn(tableName, columnName) {
  return tableColumns(tableName).includes(String(columnName || ""));
}

function parseWarningsJson(raw) {
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(String(raw || "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function numberOrNull(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function previewVolumeDecision(currentVolume, targetVolume, overwriteExisting) {
  const current = numberOrNull(currentVolume);
  if (current === null) return { action: "set_missing", wouldChange: true, before: null, after: targetVolume, reason: "missing_volume" };
  if (current < 0 || current > 100) return { action: "set_invalid", wouldChange: true, before: current, after: targetVolume, reason: "invalid_volume" };
  if (overwriteExisting && current !== targetVolume) return { action: "overwrite", wouldChange: true, before: current, after: targetVolume, reason: "overwrite_enabled" };
  return { action: "keep", wouldChange: false, before: current, after: current, reason: current === targetVolume ? "already_target" : "explicit_volume_kept" };
}

function summarizePreviewRows(rows) {
  const list = Array.isArray(rows) ? rows : [];
  return {
    total: list.length,
    wouldChange: list.filter(row => row.wouldChange).length,
    alreadyTarget: list.filter(row => row.reason === "already_target").length,
    explicitKept: list.filter(row => row.reason === "explicit_volume_kept").length,
    missing: list.filter(row => row.reason === "missing_volume").length,
    invalid: list.filter(row => row.reason === "invalid_volume").length,
    volume100: list.filter(row => Number(row.before) === 100).length
  };
}

function previewSoundAlertsEntries(targetVolume, overwriteExisting) {
  const out = { area: "soundalerts", label: "SoundAlerts/Kanalpunkte", table: "soundalerts_bridge_entries", supported: false, summary: summarizePreviewRows([]), rows: [], note: "" };
  if (!tableExists("soundalerts_bridge_entries")) {
    out.note = "Tabelle soundalerts_bridge_entries nicht vorhanden.";
    return out;
  }
  out.supported = true;
  const rows = database.all(`
    SELECT entry_key, enabled, status, soundalert_name, label, file, media_type, category, volume, output_target
    FROM soundalerts_bridge_entries
    ORDER BY enabled DESC, soundalert_name COLLATE NOCASE ASC, label COLLATE NOCASE ASC
    LIMIT 1000
  `) || [];
  out.rows = rows.map(row => {
    const decision = previewVolumeDecision(row.volume, targetVolume, overwriteExisting);
    return {
      id: String(row.entry_key || ""),
      label: String(row.label || row.soundalert_name || row.entry_key || ""),
      file: String(row.file || ""),
      category: String(row.category || ""),
      mediaType: String(row.media_type || ""),
      enabled: Number(row.enabled || 0) ? true : false,
      status: String(row.status || ""),
      currentVolume: numberOrNull(row.volume),
      targetVolume,
      before: decision.before,
      after: decision.after,
      wouldChange: decision.wouldChange,
      action: decision.action,
      reason: decision.reason,
      outputTarget: String(row.output_target || "")
    };
  });
  out.summary = summarizePreviewRows(out.rows);
  out.note = overwriteExisting ? "Overwrite ist aktiv: explizite Volume-Werte würden in einer späteren Apply-Aktion überschrieben." : "Overwrite ist aus: explizite Volume-Werte bleiben erhalten; nur fehlende/ungültige Werte wären Kandidaten.";
  return out;
}

function previewAlertRules(targetVolume, overwriteExisting) {
  const out = { area: "alerts", label: "Alert-Regeln", table: "alert_rules", supported: false, summary: summarizePreviewRows([]), rows: [], note: "" };
  if (!tableExists("alert_rules")) {
    out.note = "Tabelle alert_rules nicht vorhanden.";
    return out;
  }
  const columns = tableColumns("alert_rules");
  if (!columns.includes("sound_volume")) {
    out.note = "alert_rules hat keine Spalte sound_volume. Alert-Sounds nutzen aktuell die Sound-System Defaults, sofern kein Sound-Item explizit volume setzt.";
    return out;
  }
  out.supported = true;
  const rows = database.all(`
    SELECT id, source, type_key, label, enabled, sound_asset_id, sound_volume
    FROM alert_rules
    ORDER BY source ASC, type_key ASC, COALESCE(min_value, -999999) ASC, priority ASC, id ASC
    LIMIT 1000
  `) || [];
  out.rows = rows.map(row => {
    const decision = previewVolumeDecision(row.sound_volume, targetVolume, overwriteExisting);
    return {
      id: Number(row.id || 0),
      label: String(row.label || `${row.source || ""}/${row.type_key || ""}`),
      source: String(row.source || ""),
      typeKey: String(row.type_key || ""),
      enabled: Number(row.enabled || 0) ? true : false,
      soundAssetId: numberOrNull(row.sound_asset_id),
      currentVolume: numberOrNull(row.sound_volume),
      targetVolume,
      before: decision.before,
      after: decision.after,
      wouldChange: decision.wouldChange,
      action: decision.action,
      reason: decision.reason
    };
  });
  out.summary = summarizePreviewRows(out.rows);
  out.note = overwriteExisting ? "Overwrite ist aktiv: explizite Alert-Volumes würden in einer späteren Apply-Aktion überschrieben." : "Overwrite ist aus: explizite Alert-Volumes bleiben erhalten.";
  return out;
}

function previewVipModSettings(targetVolume) {
  const before = readModuleSetting("vip_sound_settings", "soundSystemVolume", 85, "number");
  const current = numberOrNull(before);
  return {
    area: "vip_mod",
    label: "VIP-/Mod-Sounds",
    table: "vip_sound_settings",
    supported: true,
    summary: { total: 1, wouldChange: current !== targetVolume ? 1 : 0, alreadyTarget: current === targetVolume ? 1 : 0, explicitKept: 0, missing: current === null ? 1 : 0, invalid: 0, volume100: current === 100 ? 1 : 0 },
    rows: [{
      id: "soundSystemVolume",
      label: "VIP-/Mod Default Volume",
      currentVolume: current,
      targetVolume,
      before: current,
      after: targetVolume,
      wouldChange: current !== targetVolume,
      action: current === targetVolume ? "keep" : "set_setting",
      reason: current === targetVolume ? "already_target" : "setting_differs"
    }],
    note: "VIP-/Mod nutzt derzeit ein DB-Setting als Default, keine Massenänderung einzelner Dateien."
  };
}

function buildLoudnessVolumeNeeds(targetVolume) {
  if (!tableExists("sound_loudness_files")) {
    return { supported: false, summary: { total: 0, boostCopyNeeded: 0, runtimeCutCandidate: 0, ok: 0 }, rows: [], note: "Noch keine Scan-Ergebnisse vorhanden." };
  }
  const rows = database.all(`
    SELECT relative_path, duration_ms, input_i, input_tp, recommended_gain_db, recommended_volume, status, warnings_json, error_text
    FROM sound_loudness_files
    WHERE status <> 'error'
    ORDER BY recommended_gain_db DESC, relative_path ASC
    LIMIT 1000
  `) || [];
  const mapped = rows.map(row => {
    const warnings = parseWarningsJson(row.warnings_json);
    const gain = numberOrNull(row.recommended_gain_db);
    const recommendedVolume = numberOrNull(row.recommended_volume);
    const boostCopyNeeded = warnings.includes("volume_cap_reached") || (gain !== null && gain > 0 && recommendedVolume !== null && recommendedVolume >= 100);
    const runtimeCutCandidate = gain !== null && gain < -1;
    let classification = "ok";
    if (boostCopyNeeded) classification = "boost_copy_needed";
    else if (runtimeCutCandidate) classification = "runtime_cut_candidate";
    return {
      file: String(row.relative_path || ""),
      inputI: numberOrNull(row.input_i),
      inputTp: numberOrNull(row.input_tp),
      durationMs: numberOrNull(row.duration_ms),
      recommendedGainDb: gain,
      recommendedVolume,
      targetVolume,
      warnings,
      classification,
      boostCopyNeeded,
      runtimeCutCandidate,
      status: String(row.status || ""),
      errorText: String(row.error_text || "")
    };
  });
  return {
    supported: true,
    summary: {
      total: mapped.length,
      boostCopyNeeded: mapped.filter(row => row.boostCopyNeeded).length,
      runtimeCutCandidate: mapped.filter(row => row.runtimeCutCandidate).length,
      ok: mapped.filter(row => row.classification === "ok").length
    },
    rows: mapped.filter(row => row.boostCopyNeeded || row.runtimeCutCandidate).slice(0, 250),
    note: "Analyse aus dem letzten Pegel-Scan: zu leise Dateien mit Volume-Cap brauchen später eher Boost-Kopien; laute Dateien können per Runtime-Volume abgesenkt werden."
  };
}


function getBoostCopyCandidates(limit = 100, includeExisting = true) {
  if (!tableExists("sound_loudness_files")) return [];
  const safeLimit = Math.round(clampNumber(limit, 1, 500, 100));
  const rows = database.all(`
    SELECT relative_path, duration_ms, input_i, input_tp, recommended_gain_db, recommended_volume, status, warnings_json, error_text
    FROM sound_loudness_files
    WHERE status <> 'error'
    ORDER BY recommended_gain_db DESC, relative_path ASC
    LIMIT 1000
  `) || [];

  const candidates = [];
  for (const row of rows) {
    const relativePath = normalizeRelativePath(row.relative_path || "");
    if (!relativePath) continue;
    if (isExcludedTtsPath(relativePath)) continue;
    if (relativePath.toLowerCase().startsWith("normalized/")) continue;

    const warnings = parseWarningsJson(row.warnings_json);
    const gain = numberOrNull(row.recommended_gain_db);
    const recommendedVolume = numberOrNull(row.recommended_volume);
    const needsBoost = warnings.includes("volume_cap_reached") || (gain !== null && gain > 0 && recommendedVolume !== null && recommendedVolume >= 100);
    if (!needsBoost) continue;

    const info = buildBoostCopyInfo(relativePath, row);
    if (!includeExisting && info.exists) continue;
    candidates.push(info);
    if (candidates.length >= safeLimit) break;
  }
  return candidates;
}

function buildBoostCopyPreview(options = {}) {
  const cfg = getLevelConfig();
  const target = getBoostTargetSettings(cfg);
  const limit = Math.round(clampNumber(options.limit, 1, 500, 100));
  const includeExisting = parseBool(options.includeExisting, true) !== false;
  const rows = getBoostCopyCandidates(limit, includeExisting);
  return {
    ok: true,
    module: MODULE_NAME,
    mode: "preview_only",
    generatedAt: nowIso(),
    outputDir: "htdocs/assets/sounds/normalized",
    playableBase: "normalized/",
    boostTarget: target,
    count: rows.length,
    summary: {
      totalShown: rows.length,
      existingCopies: rows.filter(row => row.exists).length,
      missingCopies: rows.filter(row => !row.exists).length,
      creatable: rows.filter(row => row.canCreate).length,
      unsupported: rows.filter(row => !row.canCreate).length
    },
    config: cfg,
    rows: rows.map(row => ({ ...row, boostTargetLufs: target.targetLufs, targetGainDb: calculateBoostGain(row.inputI, target) })),
    notes: [
      "Nur Vorschau: Original-Sounddateien werden nicht verändert.",
      "Boost-Kopien werden in htdocs/assets/sounds/normalized/<originalpfad> geschrieben, damit /api/sound/play sie wie normale Sounds abspielen kann.",
      "STEP272G1 nutzt fuer neue Boost-Kopien den gespeicherten Boost-Zielwert statt fest -18 LUFS."
    ]
  };
}

function buildBoostCopyInfo(relativePath, row = null) {
  const clean = normalizeRelativePath(relativePath);
  const ext = path.extname(clean).toLowerCase();
  const outputRelativePath = normalizeRelativePath(path.posix.join("normalized", clean));
  const outputAbsolutePath = path.join(getSoundsBaseDir(), ...outputRelativePath.split("/"));
  const sourceAbsolutePath = path.join(getSoundsBaseDir(), ...clean.split("/"));
  const exists = fs.existsSync(outputAbsolutePath);
  const stat = exists ? safeStat(outputAbsolutePath) : null;
  const supportedAudio = [".mp3", ".wav", ".ogg", ".m4a"].includes(ext);
  return {
    file: clean,
    sourceFile: clean,
    sourceAbsolutePath,
    outputFile: outputRelativePath,
    outputAbsolutePath,
    browserUrl: `/assets/sounds/${outputRelativePath}`,
    exists,
    sizeBytes: stat ? Number(stat.size || 0) : 0,
    mtimeMs: stat ? Number(stat.mtimeMs || 0) : 0,
    canCreate: supportedAudio,
    unsupportedReason: supportedAudio ? "" : "video_or_unsupported_extension",
    extension: ext,
    inputI: row ? numberOrNull(row.input_i) : null,
    inputTp: row ? numberOrNull(row.input_tp) : null,
    durationMs: row ? numberOrNull(row.duration_ms) : null,
    recommendedGainDb: row ? numberOrNull(row.recommended_gain_db) : null,
    recommendedVolume: row ? numberOrNull(row.recommended_volume) : null,
    warnings: row ? parseWarningsJson(row.warnings_json) : [],
    status: row ? String(row.status || "") : "",
    errorText: row ? String(row.error_text || "") : "",
    note: exists ? "Boost-Kopie ist bereits vorhanden." : "Boost-Kopie fehlt noch."
  };
}

function createBoostCopyForFile(relativePath, options = {}) {
  const clean = normalizeRelativePath(relativePath);
  if (!clean) throw new Error("file_required");
  if (clean.includes("..")) throw new Error("unsafe_file_path");
  if (isExcludedTtsPath(clean)) throw new Error("tts_files_are_excluded");
  if (clean.toLowerCase().startsWith("normalized/")) throw new Error("normalized_source_not_allowed");

  const row = database.get("SELECT * FROM sound_loudness_files WHERE relative_path = :relativePath", { relativePath: clean }) || null;
  if (!row) throw new Error("file_not_scanned");

  const info = buildBoostCopyInfo(clean, row);
  if (!info.canCreate) throw new Error(info.unsupportedReason || "unsupported_extension");
  if (!fs.existsSync(info.sourceAbsolutePath)) throw new Error("source_file_missing");

  const cfg = getLevelConfig();
  const target = getBoostTargetSettings(cfg, options);
  const inputI = numberOrNull(row.input_i);
  const gain = calculateBoostGain(inputI, target);
  const safeGain = gain === null ? 0 : gain;
  if (!Number.isFinite(safeGain) || safeGain <= 0) throw new Error("positive_gain_not_needed");

  fs.mkdirSync(path.dirname(info.outputAbsolutePath), { recursive: true });
  const ffmpeg = findFfmpeg();
  const ext = path.extname(info.outputAbsolutePath).toLowerCase();
  const audioCodecArgs = buildAudioCodecArgs(ext);
  const filter = `volume=${round2(safeGain)}dB,alimiter=limit=0.891:level=false`;
  const args = [
    "-hide_banner",
    "-y",
    "-i", info.sourceAbsolutePath,
    "-vn",
    "-af", filter,
    ...audioCodecArgs,
    info.outputAbsolutePath
  ];

  const startedAt = nowIso();
  const result = childProcess.spawnSync(ffmpeg, args, {
    encoding: "utf8",
    timeout: DEFAULT_FFMPEG_TIMEOUT_MS,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 10
  });
  if (result.error) throw result.error;
  if (Number(result.status || 0) !== 0) {
    const stderr = String(result.stderr || "").slice(-2000);
    throw new Error(`ffmpeg_boost_failed: ${stderr}`);
  }

  const afterInfo = buildBoostCopyInfo(clean, row);
  return {
    ok: true,
    module: MODULE_NAME,
    action: "create_boost_copy_one",
    applied: true,
    updatedAt: nowIso(),
    updatedBy: String(options.updatedBy || ""),
    startedAt,
    sourceFile: clean,
    outputFile: afterInfo.outputFile,
    browserUrl: afterInfo.browserUrl,
    gainDb: round2(safeGain),
    boostTargetLufs: target.targetLufs,
    boostMaxGainDb: target.maxGainDb,
    requestedTargetLufs: target.requestedTargetLufs,
    inputI: numberOrNull(row.input_i),
    inputTp: numberOrNull(row.input_tp),
    recommendedGainDb: numberOrNull(row.recommended_gain_db),
    targetBasedGainDb: round2(safeGain),
    recommendedVolume: numberOrNull(row.recommended_volume),
    sizeBytes: afterInfo.sizeBytes,
    exists: afterInfo.exists,
    playOriginalFile: clean,
    playBoostFile: afterInfo.outputFile,
    notes: [
      "Originaldatei wurde nicht verändert.",
      "Die Boost-Kopie liegt im normalen Sound-Ordner unter normalized/ und kann per /api/sound/play getestet werden.",
      "Noch keine automatische Umleitung bestehender Alert-/SoundAlert-Regeln.",
      "STEP272G1: Die Kopie nutzt den gespeicherten Boost-Zielwert aus der Sound-Pegel-Config."
    ]
  };
}

function getBoostTargetSettings(cfgInput, override = {}) {
  const cfg = cfgInput && typeof cfgInput === "object" ? cfgInput : getLevelConfig();
  const requestedTargetLufs = clampNumber(override.targetLufs ?? cfg.boostTargetLufs, -40, -6, DEFAULT_LEVEL_CONFIG.boostTargetLufs);
  const maxGainDb = clampNumber(override.maxGainDb ?? cfg.boostMaxGainDb, 0.5, 18, DEFAULT_LEVEL_CONFIG.boostMaxGainDb);
  return {
    targetLufs: round2(requestedTargetLufs),
    requestedTargetLufs: round2(requestedTargetLufs),
    maxGainDb: round1(maxGainDb),
    safetyDb: clampNumber(cfg.boostReferenceSafetyDb, 0, 8, DEFAULT_LEVEL_CONFIG.boostReferenceSafetyDb)
  };
}

function calculateBoostGain(inputI, target) {
  const i = Number(inputI);
  if (!Number.isFinite(i)) return null;
  const t = target && Number.isFinite(Number(target.targetLufs)) ? Number(target.targetLufs) : DEFAULT_LEVEL_CONFIG.boostTargetLufs;
  const maxGain = target && Number.isFinite(Number(target.maxGainDb)) ? Number(target.maxGainDb) : DEFAULT_LEVEL_CONFIG.boostMaxGainDb;
  const raw = t - i;
  if (!Number.isFinite(raw) || raw <= 0) return null;
  return round2(Math.max(0, Math.min(maxGain, raw)));
}

function buildAudioCodecArgs(ext) {
  if (ext === ".mp3") return ["-c:a", "libmp3lame", "-q:a", "2"];
  if (ext === ".ogg") return ["-c:a", "libvorbis", "-q:a", "5"];
  if (ext === ".m4a") return ["-c:a", "aac", "-b:a", "192k"];
  if (ext === ".wav") return ["-c:a", "pcm_s16le"];
  return ["-c:a", "libmp3lame", "-q:a", "2"];
}

function safeStat(filePath) {
  try { return fs.statSync(filePath); } catch (_) { return null; }
}

function applyMissingAlertRuleVolumes(updatedBy) {
  const cfg = getLevelConfig();
  const targetVolume = Math.round(clampNumber(cfg.defaultPlaybackVolume, 1, 100, 80));
  const before = previewAlertRules(targetVolume, false);
  if (!before.supported) {
    return {
      ok: false,
      module: MODULE_NAME,
      applied: false,
      area: "alerts",
      error: "alert_rules_not_supported",
      message: before.note || "Alert-Regeln können nicht aktualisiert werden.",
      before
    };
  }

  const candidates = before.rows.filter(row => row && row.wouldChange && ["missing_volume", "invalid_volume"].includes(String(row.reason || "")));
  const now = nowIso();
  let changed = 0;
  const changedIds = [];

  for (const row of candidates) {
    const id = Number(row.id || 0);
    if (!id) continue;
    const result = database.run(`
      UPDATE alert_rules
      SET sound_volume = :targetVolume
      WHERE id = :id
        AND (sound_volume IS NULL OR TRIM(CAST(sound_volume AS TEXT)) = '' OR sound_volume < 0 OR sound_volume > 100)
    `, { id, targetVolume });
    const changes = Number(result && result.changes || 0);
    if (changes > 0) {
      changed += changes;
      changedIds.push(id);
    }
  }

  const after = previewAlertRules(targetVolume, false);
  return {
    ok: true,
    module: MODULE_NAME,
    applied: true,
    area: "alerts",
    action: "set_missing_alert_rule_volumes",
    targetVolume,
    updatedAt: now,
    updatedBy: String(updatedBy || ""),
    changed,
    changedIds,
    beforeSummary: before.summary,
    afterSummary: after.summary,
    beforeRows: candidates,
    after,
    notes: [
      "Es wurden nur Alert-Regeln mit fehlendem oder ungültigem sound_volume gesetzt.",
      "Explizite bestehende Alert-Volumes wurden nicht überschrieben.",
      "SoundAlerts/Kanalpunkte, VIP-/Mod-Sounds und Sounddateien wurden nicht verändert."
    ]
  };
}

function buildExistingVolumePreview() {
  const cfg = getLevelConfig();
  const targetVolume = Math.round(clampNumber(cfg.defaultPlaybackVolume, 1, 100, 80));
  const uploadTargetVolume = Math.round(clampNumber(cfg.uploadDefaultVolume, 1, 100, 80));
  const mass = cfg.massApply || {};
  const overwriteExisting = parseBool(mass.overwriteExistingVolumes, false) === true;
  const sections = [];

  if (mass.includeAlerts !== false) sections.push(previewAlertRules(targetVolume, overwriteExisting));
  if (mass.includeSoundAlerts !== false) sections.push(previewSoundAlertsEntries(uploadTargetVolume, overwriteExisting));
  if (mass.includeVipMod !== false) sections.push(previewVipModSettings(uploadTargetVolume));

  const loudness = buildLoudnessVolumeNeeds(targetVolume);
  const totalWouldChange = sections.reduce((sum, section) => sum + Number(section?.summary?.wouldChange || 0), 0);
  const totalRows = sections.reduce((sum, section) => sum + Number(section?.summary?.total || 0), 0);

  return {
    ok: true,
    module: MODULE_NAME,
    applied: false,
    mode: "preview_only",
    generatedAt: nowIso(),
    config: cfg,
    targetVolume,
    uploadTargetVolume,
    overwriteExistingVolumes: overwriteExisting,
    summary: {
      sections: sections.length,
      totalRows,
      totalWouldChange,
      explicitVolume100: sections.reduce((sum, section) => sum + Number(section?.summary?.volume100 || 0), 0),
      boostCopyNeeded: loudness.summary.boostCopyNeeded,
      runtimeCutCandidate: loudness.summary.runtimeCutCandidate
    },
    sections,
    loudness,
    notes: [
      "Nur Vorschau: Es werden keine bestehenden Alert-/SoundAlert-/VIP-Daten geändert.",
      "OverwriteExistingVolumes entscheidet nur, was eine spätere Massenaktion ändern würde.",
      "Boost-Kopie nötig bedeutet: normale Volume-Regelung bis 100% reicht laut Scan wahrscheinlich nicht."
    ]
  };
}

function buildUploadDefaultApplyResult(commit, updatedBy) {
  const cfg = getLevelConfig();
  const defaultPlaybackVolume = Math.round(clampNumber(cfg.defaultPlaybackVolume, 1, 100, 80));
  const uploadDefaultVolume = Math.round(clampNumber(cfg.uploadDefaultVolume, 1, 100, 80));
  const upload = cfg.uploadDefaults || {};
  const now = nowIso();
  const actions = [];

  const soundOutputBefore = readSoundSystemOutputSettings();
  const soundOutputAfter = buildOutputWithDefaultVolume(soundOutputBefore, defaultPlaybackVolume);
  if (commit) writeSoundSystemOutputSettings(soundOutputAfter, updatedBy);
  actions.push({
    id: "sound_system_output_defaults",
    label: "Sound-System Output-Default-Volumes",
    applied: !!commit,
    table: "sound_settings",
    key: "output",
    before: {
      overlay: soundOutputBefore?.targets?.overlay?.defaultVolume ?? null,
      device: soundOutputBefore?.targets?.device?.defaultVolume ?? null,
      both: soundOutputBefore?.targets?.both?.defaultVolume ?? null
    },
    after: {
      overlay: soundOutputAfter?.targets?.overlay?.defaultVolume ?? null,
      device: soundOutputAfter?.targets?.device?.defaultVolume ?? null,
      both: soundOutputAfter?.targets?.both?.defaultVolume ?? null
    },
    note: "Wirkt auf Sound-System-Items ohne explizites volume. Bestehende Sounddateien bleiben unverändert."
  });

  const soundTargetsBefore = readSoundSystemBlock("targets");
  const soundTargetsAfter = buildLegacyTargetsWithDefaultVolume(soundTargetsBefore, defaultPlaybackVolume);
  if (commit) writeSoundSystemBlock("targets", soundTargetsAfter, updatedBy);
  actions.push({
    id: "sound_system_legacy_target_defaults",
    label: "Sound-System Target-Default-Volumes",
    applied: !!commit,
    table: "sound_settings",
    key: "targets",
    before: {
      stream: soundTargetsBefore?.stream?.defaultVolume ?? null,
      discord: soundTargetsBefore?.discord?.defaultVolume ?? null,
      both: soundTargetsBefore?.both?.defaultVolume ?? null
    },
    after: {
      stream: soundTargetsAfter?.stream?.defaultVolume ?? null,
      discord: soundTargetsAfter?.discord?.defaultVolume ?? null,
      both: soundTargetsAfter?.both?.defaultVolume ?? null
    },
    note: "Deckt die legacy target-Defaults stream/discord/both ab, die im Sound-System noch parallel zu output.targets existieren."
  });

  const soundDefaultsBefore = readSoundSystemBlock("defaults");
  const soundDefaultsAfter = buildFallbackDefaultsWithDefaultVolume(soundDefaultsBefore, defaultPlaybackVolume);
  if (commit) writeSoundSystemBlock("defaults", soundDefaultsAfter, updatedBy);
  actions.push({
    id: "sound_system_fallback_default_volume",
    label: "Sound-System Fallback Default Volume",
    applied: !!commit,
    table: "sound_settings",
    key: "defaults",
    before: soundDefaultsBefore?.volume ?? null,
    after: soundDefaultsAfter?.volume ?? null,
    note: "Setzt config.defaults.volume für Sound-System-Items, die weder Item-Volume noch Output-/Target-Default nutzen."
  });

  if (upload.soundalerts !== false) {
    const before = readModuleSetting("soundalerts_bridge_settings", "soundSystem.defaultVolume", 100, "number");
    if (commit) applyModuleSetting("soundalerts_bridge_settings", "soundSystem.defaultVolume", uploadDefaultVolume, "number", "Standard-Lautstärke für neue/ungesetzte SoundAlerts aus Sound-Pegel Config.");
    actions.push({
      id: "soundalerts_default_volume",
      label: "SoundAlerts/Kanalpunkte Default Volume",
      applied: !!commit,
      table: "soundalerts_bridge_settings",
      key: "soundSystem.defaultVolume",
      before,
      after: uploadDefaultVolume,
      note: "Greift für neue Auto-Entries und SoundAlerts ohne eigenen Volume-Wert. Bestehende Einträge werden nicht überschrieben."
    });
  }

  if (upload.vipMod !== false) {
    const before = readModuleSetting("vip_sound_settings", "soundSystemVolume", 85, "number");
    if (commit) applyModuleSetting("vip_sound_settings", "soundSystemVolume", uploadDefaultVolume, "number", "Standard-Lautstärke für VIP-/Mod-Sounds aus Sound-Pegel Config.");
    actions.push({
      id: "vip_mod_default_volume",
      label: "VIP-/Mod-Sound Default Volume",
      applied: !!commit,
      table: "vip_sound_settings",
      key: "soundSystemVolume",
      before,
      after: uploadDefaultVolume,
      note: "Benötigt STEP272D-VIP-Anpassung im VIP-Modul. Keine bestehenden Upload-Dateien werden geändert."
    });
  }

  if (upload.alerts !== false) {
    actions.push({
      id: "alerts_default_volume",
      label: "Alert-Sound Default Volume",
      applied: !!commit,
      table: "sound_settings",
      key: "output",
      before: soundOutputBefore?.targets || {},
      after: soundOutputAfter?.targets || {},
      note: "Alerts ohne explizites rule.sound_volume nutzen über das Sound-System die Output-Defaults. Bestehende Alert-Regeln werden nicht überschrieben."
    });
  }

  return {
    ok: true,
    module: MODULE_NAME,
    applied: !!commit,
    updatedAt: now,
    updatedBy: String(updatedBy || ""),
    config: cfg,
    defaultPlaybackVolume,
    uploadDefaultVolume,
    actions,
    notes: [
      "Original-Sounddateien werden nicht verändert.",
      "Bestehende Alert-/SoundAlert-/VIP-Regeln werden nicht massenhaft überschrieben.",
      "Sound-System neu laden oder Backend neu starten, damit geänderte Settings sicher aktiv sind."
    ]
  };
}

function getCorrectionSettings() {
  return sanitizeCorrectionSettings(getJsonSetting("correction", DEFAULT_CORRECTION_SETTINGS));
}

function getNormalizationSettings() {
  return sanitizeNormalizationSettings(getJsonSetting("normalization", DEFAULT_NORMALIZATION_SETTINGS));
}

function getLevelConfig() {
  return sanitizeLevelConfig(getJsonSetting("level_config", DEFAULT_LEVEL_CONFIG));
}

function saveLevelConfig(input, updatedBy) {
  const clean = sanitizeLevelConfig({ ...getLevelConfig(), ...(input || {}) });
  return saveJsonSetting("level_config", clean, updatedBy);
}

function saveCorrectionSettings(input, updatedBy) {
  const clean = sanitizeCorrectionSettings({ ...getCorrectionSettings(), ...(input || {}) });
  return saveJsonSetting("correction", clean, updatedBy);
}

function saveNormalizationSettings(input, updatedBy) {
  const clean = sanitizeNormalizationSettings({ ...getNormalizationSettings(), ...(input || {}) });
  return saveJsonSetting("normalization", clean, updatedBy);
}

function sanitizeCorrectionSettings(input) {
  const raw = input && typeof input === "object" ? input : {};
  const mode = ["off", "preview", "ready"].includes(String(raw.mode || "").toLowerCase()) ? String(raw.mode).toLowerCase() : "off";
  const targets = Array.isArray(raw.applyToTargets) ? raw.applyToTargets : DEFAULT_CORRECTION_SETTINGS.applyToTargets;
  return {
    enabled: parseBool(raw.enabled, false) === true,
    mode,
    targetLufs: clampNumber(raw.targetLufs, -40, -6, DEFAULT_TARGET_LUFS),
    truePeakLimitDbtp: clampNumber(raw.truePeakLimitDbtp, -12, 0, DEFAULT_TRUE_PEAK_LIMIT_DBTP),
    maxPlaybackVolume: Math.round(clampNumber(raw.maxPlaybackVolume, 1, 100, DEFAULT_MAX_PLAYBACK_VOLUME)),
    minPlaybackVolume: Math.round(clampNumber(raw.minPlaybackVolume, 0, 100, DEFAULT_CORRECTION_SETTINGS.minPlaybackVolume)),
    maxBoostDb: clampNumber(raw.maxBoostDb, 0, 18, DEFAULT_CORRECTION_SETTINGS.maxBoostDb),
    maxCutDb: clampNumber(raw.maxCutDb, 0, 12, DEFAULT_CORRECTION_SETTINGS.maxCutDb),
    strengthPercent: Math.round(clampNumber(raw.strengthPercent, 0, 100, DEFAULT_CORRECTION_SETTINGS.strengthPercent)),
    protectTruePeak: parseBool(raw.protectTruePeak, true) !== false,
    excludeTts: parseBool(raw.excludeTts, true) !== false,
    applyToTargets: Array.from(new Set(targets.map(v => String(v || "").trim().toLowerCase()).filter(Boolean))).slice(0, 10),
    updatedAt: String(raw.updatedAt || ""),
    updatedBy: String(raw.updatedBy || "")
  };
}

function sanitizeNormalizationSettings(input) {
  const raw = input && typeof input === "object" ? input : {};
  const outputDir = sanitizeOutputDir(raw.outputDir || DEFAULT_NORMALIZATION_SETTINGS.outputDir);
  return {
    enabled: false,
    mode: "planned",
    outputDir,
    overwriteOriginals: false,
    keepOriginals: true,
    createMissingFolders: parseBool(raw.createMissingFolders, true) !== false,
    status: "planned_not_implemented",
    updatedAt: String(raw.updatedAt || ""),
    updatedBy: String(raw.updatedBy || "")
  };
}

function sanitizeLevelConfig(input) {
  const raw = input && typeof input === "object" ? input : {};
  const uploadDefaultsRaw = raw.uploadDefaults && typeof raw.uploadDefaults === "object" ? raw.uploadDefaults : {};
  const massApplyRaw = raw.massApply && typeof raw.massApply === "object" ? raw.massApply : {};
  const outputTarget = String(raw.defaultReferenceOutputTarget || DEFAULT_LEVEL_CONFIG.defaultReferenceOutputTarget).trim().toLowerCase();
  const safeOutputTarget = ["overlay", "device", "both"].includes(outputTarget) ? outputTarget : DEFAULT_LEVEL_CONFIG.defaultReferenceOutputTarget;

  return {
    defaultPlaybackVolume: Math.round(clampNumber(raw.defaultPlaybackVolume, 1, 100, DEFAULT_LEVEL_CONFIG.defaultPlaybackVolume)),
    maxPlaybackVolume: Math.round(clampNumber(raw.maxPlaybackVolume, 1, 100, DEFAULT_LEVEL_CONFIG.maxPlaybackVolume)),
    uploadDefaultVolume: Math.round(clampNumber(raw.uploadDefaultVolume, 1, 100, DEFAULT_LEVEL_CONFIG.uploadDefaultVolume)),
    referenceToleranceDb: clampNumber(raw.referenceToleranceDb, 0.5, 12, DEFAULT_LEVEL_CONFIG.referenceToleranceDb),
    boostTargetLufs: round2(clampNumber(raw.boostTargetLufs, -40, -6, DEFAULT_LEVEL_CONFIG.boostTargetLufs)),
    boostReferenceSafetyDb: clampNumber(raw.boostReferenceSafetyDb, 0, 8, DEFAULT_LEVEL_CONFIG.boostReferenceSafetyDb),
    boostMaxGainDb: clampNumber(raw.boostMaxGainDb, 0.5, 18, DEFAULT_LEVEL_CONFIG.boostMaxGainDb),
    defaultScanLimit: Math.round(clampNumber(raw.defaultScanLimit, 1, 5000, DEFAULT_LEVEL_CONFIG.defaultScanLimit)),
    defaultResultLimit: Math.round(clampNumber(raw.defaultResultLimit, 1, 1000, DEFAULT_LEVEL_CONFIG.defaultResultLimit)),
    defaultReferenceOutputTarget: safeOutputTarget,
    uploadDefaults: {
      alerts: parseBool(uploadDefaultsRaw.alerts, DEFAULT_LEVEL_CONFIG.uploadDefaults.alerts) !== false,
      soundalerts: parseBool(uploadDefaultsRaw.soundalerts, DEFAULT_LEVEL_CONFIG.uploadDefaults.soundalerts) !== false,
      vipMod: parseBool(uploadDefaultsRaw.vipMod, DEFAULT_LEVEL_CONFIG.uploadDefaults.vipMod) !== false,
      soundPresets: parseBool(uploadDefaultsRaw.soundPresets, DEFAULT_LEVEL_CONFIG.uploadDefaults.soundPresets) !== false
    },
    massApply: {
      mode: "preview_only",
      includeAlerts: parseBool(massApplyRaw.includeAlerts, DEFAULT_LEVEL_CONFIG.massApply.includeAlerts) !== false,
      includeSoundAlerts: parseBool(massApplyRaw.includeSoundAlerts, DEFAULT_LEVEL_CONFIG.massApply.includeSoundAlerts) !== false,
      includeVipMod: parseBool(massApplyRaw.includeVipMod, DEFAULT_LEVEL_CONFIG.massApply.includeVipMod) !== false,
      includeSoundPresets: parseBool(massApplyRaw.includeSoundPresets, DEFAULT_LEVEL_CONFIG.massApply.includeSoundPresets) === true,
      overwriteExistingVolumes: parseBool(massApplyRaw.overwriteExistingVolumes, false) === true
    },
    updatedAt: String(raw.updatedAt || ""),
    updatedBy: String(raw.updatedBy || "")
  };
}

function sanitizeOutputDir(value) {
  const raw = String(value || DEFAULT_NORMALIZATION_SETTINGS.outputDir).replace(/\\/g, "/").trim();
  if (!raw || raw.includes("..") || path.isAbsolute(raw)) return DEFAULT_NORMALIZATION_SETTINGS.outputDir;
  return raw.replace(/^\/+/, "");
}

function buildCorrectionPreview(row, settings) {
  const base = row || {};
  const warnings = Array.isArray(base.warnings) ? base.warnings.slice() : [];
  const inputI = Number(base.inputI);
  const inputTp = Number(base.inputTp);
  const status = String(base.status || "");
  let rawGainDb = null;
  let limitedGainDb = null;
  let recommendedVolume = null;
  let action = "not_available";
  let canAutoApply = false;
  const reasons = [];

  if (status === "error" || !Number.isFinite(inputI)) {
    reasons.push(status === "error" ? "scan_error" : "missing_lufs");
  } else {
    rawGainDb = round1(Number(settings.targetLufs) - inputI);
    const strength = Math.max(0, Math.min(100, Number(settings.strengthPercent || 50))) / 100;
    limitedGainDb = rawGainDb * strength;
    if (strength < 1) reasons.push("strength_limited");
    if (Number.isFinite(limitedGainDb) && limitedGainDb > Number(settings.maxBoostDb)) {
      limitedGainDb = Number(settings.maxBoostDb);
      reasons.push("max_boost_limited");
    }
    if (Number.isFinite(limitedGainDb) && limitedGainDb < -Number(settings.maxCutDb)) {
      limitedGainDb = -Number(settings.maxCutDb);
      reasons.push("max_cut_limited");
    }
    if (settings.protectTruePeak && Number.isFinite(inputTp) && Number.isFinite(limitedGainDb)) {
      const peakAfter = inputTp + limitedGainDb;
      if (limitedGainDb > 0 && peakAfter > Number(settings.truePeakLimitDbtp)) {
        limitedGainDb = round1(Number(settings.truePeakLimitDbtp) - inputTp);
        reasons.push("true_peak_protected");
      }
    }
    limitedGainDb = round1(limitedGainDb);
    recommendedVolume = gainToVolume(limitedGainDb, settings.maxPlaybackVolume);
    const minPlaybackVolume = Math.round(clampNumber(settings.minPlaybackVolume, 0, 100, DEFAULT_CORRECTION_SETTINGS.minPlaybackVolume));
    if (Number.isFinite(recommendedVolume) && limitedGainDb < 0 && recommendedVolume < minPlaybackVolume) {
      recommendedVolume = minPlaybackVolume;
      reasons.push("min_volume_floor");
    }
    if (limitedGainDb < -0.25) action = "reduce";
    else if (limitedGainDb > 0.25) action = "raise";
    else action = "near_target";
    canAutoApply = action !== "not_available" && !warnings.includes("true_peak_above_limit") && !reasons.includes("true_peak_protected");
    if (warnings.includes("volume_cap_reached")) reasons.push("volume_cap_reached");
    if (warnings.includes("true_peak_above_limit")) reasons.push("true_peak_above_limit");
  }

  return {
    ...base,
    correctionPreview: {
      enabled: settings.enabled === true,
      mode: settings.mode,
      targetLufs: settings.targetLufs,
      maxPlaybackVolume: settings.maxPlaybackVolume,
      minPlaybackVolume: settings.minPlaybackVolume,
      strengthPercent: settings.strengthPercent,
      rawGainDb,
      limitedGainDb,
      recommendedVolume,
      action,
      canAutoApply,
      reasons
    }
  };
}

function summarizeCorrectionPreview(rows) {
  const data = Array.isArray(rows) ? rows : [];
  const reduce = data.filter(row => row.correctionPreview?.action === "reduce").length;
  const raise = data.filter(row => row.correctionPreview?.action === "raise").length;
  const nearTarget = data.filter(row => row.correctionPreview?.action === "near_target").length;
  const notAvailable = data.filter(row => row.correctionPreview?.action === "not_available").length;
  const autoSafe = data.filter(row => row.correctionPreview?.canAutoApply === true).length;
  const manualReview = data.length - autoSafe;
  const normalizedCopiesPlanned = true;
  return { total: data.length, reduce, raise, nearTarget, notAvailable, autoSafe, manualReview, normalizedCopiesPlanned };
}


function buildAutoReference(options = {}) {
  const whereParts = ["status != 'error'", "input_i IS NOT NULL"];
  const params = {};
  if (options.includeExcluded !== true) appendExcludedPathFilter(whereParts, params);
  const where = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
  const rows = database.all(`SELECT * FROM sound_loudness_files ${where}`, params) || [];
  const results = rows.map(publicFileResult).filter(row => Number.isFinite(Number(row.inputI)));
  const usable = results.filter(row => {
    const duration = Number(row.durationMs || 0);
    return duration >= 750 && duration <= 45000;
  });
  const medianPool = usable.length >= 3 ? usable : results;
  const lufsValues = medianPool.map(row => Number(row.inputI)).filter(Number.isFinite).sort((a, b) => a - b);
  const referenceLufs = round2(median(lufsValues));
  const toleranceDb = round1(clampNumber(options.toleranceDb, 0.5, 12, 3));

  const preferred = medianPool.filter(row => {
    const warnings = Array.isArray(row.warnings) ? row.warnings : [];
    return row.status === "ok" && !warnings.includes("true_peak_above_limit");
  });
  const candidates = preferred.length ? preferred : medianPool;
  const recommended = pickReferenceSound(candidates, referenceLufs);
  const distribution = buildDistribution(lufsValues);
  const summary = summarizeReference(results, referenceLufs, toleranceDb);

  return {
    mode: "auto_median",
    generatedAt: nowIso(),
    referenceLufs,
    toleranceDb,
    sourceCount: results.length,
    medianPoolCount: medianPool.length,
    candidateCount: candidates.length,
    recommendedSound: recommended,
    distribution,
    summary,
    testSound: {
      label: "Technischer Test-Sound",
      type: "generated_wav",
      approximate: true,
      durationMs: 10000,
      relativePath: "generated/reference_test.wav",
      createUrl: `${ROUTE_PREFIX}/reference/test-file?targetLufs=${encodeURIComponent(referenceLufs || DEFAULT_TARGET_LUFS)}&durationMs=10000`,
      url: `${ROUTE_PREFIX}/reference/test.wav?targetLufs=${encodeURIComponent(referenceLufs || DEFAULT_TARGET_LUFS)}&durationMs=10000`,
      note: "Technischer Test-Sound wird fuer OBS als echte Datei unter htdocs/assets/sounds/generated/reference_test.wav erzeugt. Der WAV-Link ist nur zum Gegenhoeren."
    },
    notes: [
      "Referenz wird aus dem Median der vorhandenen Nicht-TTS-Sounds berechnet.",
      "Der empfohlene Referenzsound ist eine echte vorhandene Datei nahe am typischen Pegel.",
      "Einzelne Ausreisser werden durch Median weniger stark gewichtet als beim Durchschnitt."
    ]
  };
}

function pickReferenceSound(rows, referenceLufs) {
  const data = Array.isArray(rows) ? rows : [];
  if (!data.length || !Number.isFinite(Number(referenceLufs))) return null;
  let best = null;
  let bestScore = Infinity;
  for (const row of data) {
    const lufs = Number(row.inputI);
    if (!Number.isFinite(lufs)) continue;
    const duration = Number(row.durationMs || 0);
    const warnings = Array.isArray(row.warnings) ? row.warnings : [];
    let score = Math.abs(lufs - referenceLufs);
    if (row.status !== "ok") score += 2;
    if (warnings.includes("true_peak_above_limit")) score += 5;
    if (duration < 1500) score += 1.5;
    if (duration > 30000) score += 1.5;
    if (score < bestScore) {
      bestScore = score;
      best = row;
    }
  }
  if (!best) return null;
  return {
    relativePath: best.relativePath,
    inputI: best.inputI,
    inputTp: best.inputTp,
    durationMs: best.durationMs,
    status: best.status,
    warnings: best.warnings,
    deviationDb: round1(Number(best.inputI) - Number(referenceLufs)),
    score: round2(bestScore),
    reason: "Nahe am automatisch berechneten Median-Pegel und als echter Sound besser fuer OBS/Voicemeeter-Referenz geeignet."
  };
}

function summarizeReference(rows, referenceLufs, toleranceDb) {
  const summary = { total: 0, ok: 0, tooLoud: 0, tooQuiet: 0, farTooLoud: 0, farTooQuiet: 0, notAvailable: 0 };
  if (!Number.isFinite(Number(referenceLufs))) return summary;
  for (const row of Array.isArray(rows) ? rows : []) {
    const lufs = Number(row.inputI);
    if (!Number.isFinite(lufs)) { summary.notAvailable += 1; continue; }
    summary.total += 1;
    const deviation = lufs - referenceLufs;
    if (Math.abs(deviation) <= toleranceDb) summary.ok += 1;
    else if (deviation > toleranceDb * 2) summary.farTooLoud += 1;
    else if (deviation > toleranceDb) summary.tooLoud += 1;
    else if (deviation < -toleranceDb * 2) summary.farTooQuiet += 1;
    else if (deviation < -toleranceDb) summary.tooQuiet += 1;
  }
  return summary;
}

function buildDistribution(values) {
  const data = Array.isArray(values) ? values.filter(Number.isFinite).sort((a, b) => a - b) : [];
  return {
    count: data.length,
    min: round2(data[0]),
    q1: round2(percentile(data, 0.25)),
    median: round2(median(data)),
    q3: round2(percentile(data, 0.75)),
    max: round2(data[data.length - 1])
  };
}

function median(values) {
  const data = Array.isArray(values) ? values.filter(Number.isFinite).sort((a, b) => a - b) : [];
  if (!data.length) return null;
  const mid = Math.floor(data.length / 2);
  return data.length % 2 ? data[mid] : (data[mid - 1] + data[mid]) / 2;
}

function percentile(values, p) {
  const data = Array.isArray(values) ? values.filter(Number.isFinite).sort((a, b) => a - b) : [];
  if (!data.length) return null;
  const index = (data.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return data[lower];
  return data[lower] + (data[upper] - data[lower]) * (index - lower);
}

function round2(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value) * 100) / 100 : null;
}

function ensureReferenceTestSoundFile(options = {}) {
  const targetLufs = clampNumber(options.targetLufs, -40, -6, DEFAULT_TARGET_LUFS);
  const durationMs = Math.round(clampNumber(options.durationMs, 1000, 30000, 10000));
  const relativePath = "generated/reference_test.wav";
  const soundsBaseDir = getSoundsBaseDir();
  const fullPath = path.join(soundsBaseDir, "generated", "reference_test.wav");
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  const wav = createReferenceTestWavBuffer({ targetLufs, durationMs });
  fs.writeFileSync(fullPath, wav);
  const stat = fs.statSync(fullPath);
  return {
    relativePath,
    absolutePath: fullPath,
    browserUrl: "/assets/sounds/generated/reference_test.wav",
    targetLufs: round2(targetLufs),
    durationMs,
    sizeBytes: Number(stat.size || 0),
    updatedAt: nowIso(),
    note: "Echte Datei im Sound-Ordner, damit /api/sound/play denselben OBS-/Overlay-Pfad nutzt wie normale Sounds."
  };
}

function createReferenceTestWavBuffer(options = {}) {
  const sampleRate = 48000;
  const durationMs = Math.max(1000, Math.min(30000, Number(options.durationMs || 10000)));
  const targetLufs = Math.max(-40, Math.min(-6, Number(options.targetLufs || DEFAULT_TARGET_LUFS)));
  const samples = Math.max(1, Math.floor(sampleRate * durationMs / 1000));
  const dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  const targetRms = Math.max(0.01, Math.min(0.35, Math.pow(10, targetLufs / 20)));

  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8, "ascii");
  buffer.write("fmt ", 12, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36, "ascii");
  buffer.writeUInt32LE(dataSize, 40);

  let seed = 123456789;
  let pink = 0;
  let sumSq = 0;
  const raw = new Float64Array(samples);
  for (let i = 0; i < samples; i++) {
    seed = (1103515245 * seed + 12345) & 0x7fffffff;
    const white = (seed / 0x7fffffff) * 2 - 1;
    pink = pink * 0.985 + white * 0.015;
    const sample = pink + white * 0.18;
    raw[i] = sample;
    sumSq += sample * sample;
  }
  const rms = Math.sqrt(sumSq / samples) || 1;
  const scale = targetRms / rms;
  const fadeSamples = Math.min(Math.floor(sampleRate * 0.1), Math.floor(samples / 4));
  for (let i = 0; i < samples; i++) {
    let fade = 1;
    if (fadeSamples > 0) {
      fade = Math.min(1, i / fadeSamples, (samples - i) / fadeSamples);
      fade = Math.max(0, fade);
    }
    const value = Math.max(-0.95, Math.min(0.95, raw[i] * scale * fade));
    buffer.writeInt16LE(Math.round(value * 32767), 44 + i * 2);
  }
  return buffer;
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
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
