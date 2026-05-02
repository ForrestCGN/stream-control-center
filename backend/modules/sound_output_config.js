"use strict";

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const core = require("./helpers/helper_core");
const cfg = require("./helpers/helper_config");

const MODULE_NAME = "sound_output_config";
const CONFIG_FILE = "sound_system.json";

const DEFAULT_OUTPUT = {
  defaultTarget: "overlay",
  allowPerSoundOverride: true,
  targets: {
    overlay: {
      enabled: true,
      label: "OBS Overlay",
      mode: "browser_overlay",
      overlayUrl: "/overlays/sound_system_overlay.html",
      defaultVolume: 85
    },
    device: {
      enabled: true,
      label: "Audiogerät",
      mode: "local_device",
      selectedDeviceId: "default",
      selectedDeviceName: "Windows Standardgerät",
      defaultVolume: 80,
      helper: {
        enabled: true,
        path: "tools/audio-device-helper/dist/AudioDeviceHelper.exe",
        timeoutMs: 30000,
        playbackMode: "auto"
      }
    },
    both: {
      enabled: false,
      label: "Overlay + Audiogerät",
      mode: "combined",
      defaultVolume: 85
    }
  }
};

module.exports.init = function init(ctx) {
  const { app } = ctx;
  const prefix = "/api/sound";

  function loadConfig() {
    const loaded = cfg.loadConfig(CONFIG_FILE, { output: DEFAULT_OUTPUT }, { createIfMissing: true, mergeDefaults: true });
    const data = loaded.config || {};
    if (!data.output) data.output = DEFAULT_OUTPUT;
    return { loaded, data };
  }

  function saveConfig(data) {
    const targetPath = cfg.resolveConfigFile(CONFIG_FILE);
    cfg.writeJsonFile(targetPath, data, { spaces: 2 });
    return targetPath;
  }

  function outputState() {
    const { loaded, data } = loadConfig();
    return {
      ok: true,
      module: MODULE_NAME,
      configPath: loaded.path || cfg.resolveConfigFile(CONFIG_FILE),
      output: data.output || DEFAULT_OUTPUT,
      loadedAt: loaded.loadedAt || core.nowIso()
    };
  }

  function normalizeTarget(value) {
    const target = String(value || "overlay").trim().toLowerCase();
    if (["overlay", "device", "both"].includes(target)) return target;
    return "overlay";
  }

  function boolValue(value, fallback) {
    return core.boolParam(value, fallback);
  }

  function intValue(value, fallback, min, max) {
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function getField(obj, ...names) {
    if (!obj || typeof obj !== "object") return undefined;
    for (const name of names) {
      if (Object.prototype.hasOwnProperty.call(obj, name)) return obj[name];
    }
    return undefined;
  }

  function resolveHelperPath(output) {
    const helperPath = output && output.targets && output.targets.device && output.targets.device.helper
      ? String(output.targets.device.helper.path || "")
      : "";
    if (!helperPath) return "";
    if (path.isAbsolute(helperPath)) return helperPath;
    return cfg.resolveFromRoot(helperPath);
  }

  function helperInfo(output) {
    const device = output && output.targets ? output.targets.device || {} : {};
    const helper = device.helper || {};
    const fullPath = resolveHelperPath(output);
    return {
      enabled: helper.enabled === true,
      configuredPath: helper.path || "",
      fullPath,
      exists: !!fullPath && fs.existsSync(fullPath),
      timeoutMs: intValue(helper.timeoutMs, 30000, 1000, 300000),
      playbackMode: helper.playbackMode || "auto"
    };
  }

  function fallbackDevices(output) {
    const selected = output && output.targets && output.targets.device ? output.targets.device : {};
    return [
      {
        id: "default",
        name: "Windows Standardgerät",
        type: "output",
        isDefault: true,
        selected: !selected.selectedDeviceId || selected.selectedDeviceId === "default"
      }
    ];
  }

  function extractDevices(parsed) {
    if (Array.isArray(parsed)) return parsed;
    if (!parsed || typeof parsed !== "object") return [];
    const devices = getField(parsed, "devices", "Devices");
    return Array.isArray(devices) ? devices : [];
  }

  function normalizeDevice(raw, selected) {
    const id = String(getField(raw, "id", "Id", "deviceId", "DeviceId", "name", "Name") || "default");
    const name = String(getField(raw, "name", "Name", "label", "Label", "id", "Id") || "Windows Standardgerät");
    const type = String(getField(raw, "type", "Type") || "output");
    const isDefaultValue = getField(raw, "isDefault", "IsDefault", "default", "Default");
    return {
      id,
      name,
      type,
      isDefault: isDefaultValue === true || String(id) === "default",
      selected: String(id) === String(selected)
    };
  }

  function readDevicesViaHelper(output) {
    const info = helperInfo(output);
    if (!info.enabled) return { ok: false, reason: "helper_disabled", helper: info, devices: fallbackDevices(output) };
    if (!info.exists) return { ok: false, reason: "helper_missing", helper: info, devices: fallbackDevices(output) };

    try {
      const raw = childProcess.execFileSync(info.fullPath, ["devices", "--json"], {
        encoding: "utf8",
        timeout: info.timeoutMs,
        windowsHide: true
      });
      const parsed = core.safeJsonParse(raw, null);
      const devices = extractDevices(parsed);
      if (!devices.length) return { ok: false, reason: "helper_no_devices", helper: info, raw, devices: fallbackDevices(output) };
      return { ok: true, reason: "helper", helper: info, devices, raw };
    } catch (err) {
      return { ok: false, reason: "helper_failed", error: err.message || String(err), helper: info, devices: fallbackDevices(output) };
    }
  }

  app.get(`${prefix}/output`, (req, res) => {
    return res.json(outputState());
  });

  app.post(`${prefix}/output`, (req, res) => {
    const { data } = loadConfig();
    const body = req.body || {};
    const current = data.output || DEFAULT_OUTPUT;
    const next = cfg.deepMerge(current, {});

    if (body.defaultTarget !== undefined) next.defaultTarget = normalizeTarget(body.defaultTarget);
    if (body.allowPerSoundOverride !== undefined) next.allowPerSoundOverride = boolValue(body.allowPerSoundOverride, true);

    next.targets = next.targets || {};
    next.targets.overlay = next.targets.overlay || DEFAULT_OUTPUT.targets.overlay;
    next.targets.device = next.targets.device || DEFAULT_OUTPUT.targets.device;
    next.targets.both = next.targets.both || DEFAULT_OUTPUT.targets.both;

    if (body.overlay) {
      next.targets.overlay.enabled = boolValue(body.overlay.enabled, next.targets.overlay.enabled !== false);
      if (body.overlay.defaultVolume !== undefined) next.targets.overlay.defaultVolume = intValue(body.overlay.defaultVolume, 85, 0, 100);
      if (body.overlay.overlayUrl !== undefined) next.targets.overlay.overlayUrl = String(body.overlay.overlayUrl || "/overlays/sound_system_overlay.html");
    }

    if (body.device) {
      next.targets.device.enabled = boolValue(body.device.enabled, next.targets.device.enabled === true);
      if (body.device.selectedDeviceId !== undefined) next.targets.device.selectedDeviceId = String(body.device.selectedDeviceId || "default");
      if (body.device.selectedDeviceName !== undefined) next.targets.device.selectedDeviceName = String(body.device.selectedDeviceName || "Windows Standardgerät");
      if (body.device.defaultVolume !== undefined) next.targets.device.defaultVolume = intValue(body.device.defaultVolume, 80, 0, 100);
      next.targets.device.helper = next.targets.device.helper || DEFAULT_OUTPUT.targets.device.helper;
      if (body.device.helperEnabled !== undefined) next.targets.device.helper.enabled = boolValue(body.device.helperEnabled, false);
      if (body.device.helperPath !== undefined) next.targets.device.helper.path = String(body.device.helperPath || DEFAULT_OUTPUT.targets.device.helper.path);
    }

    if (body.both) {
      next.targets.both.enabled = boolValue(body.both.enabled, next.targets.both.enabled === true);
      if (body.both.defaultVolume !== undefined) next.targets.both.defaultVolume = intValue(body.both.defaultVolume, 85, 0, 100);
    }

    data.output = next;
    const savedPath = saveConfig(data);
    return res.json({ ok: true, module: MODULE_NAME, message: "Sound-Ausgabe gespeichert.", configPath: savedPath, output: next });
  });

  app.get(`${prefix}/devices`, (req, res) => {
    const { data } = loadConfig();
    const output = data.output || DEFAULT_OUTPUT;
    const result = readDevicesViaHelper(output);
    const selected = output.targets && output.targets.device ? output.targets.device.selectedDeviceId || "default" : "default";
    const devices = (result.devices || []).map(device => normalizeDevice(device, selected));

    return res.json({
      ok: true,
      module: MODULE_NAME,
      helper: result.helper,
      source: result.reason,
      warning: result.ok ? "" : result.reason,
      error: result.error || "",
      devices
    });
  });

  app.post(`${prefix}/devices/select`, (req, res) => {
    const { data } = loadConfig();
    const body = req.body || {};
    data.output = data.output || DEFAULT_OUTPUT;
    data.output.targets = data.output.targets || DEFAULT_OUTPUT.targets;
    data.output.targets.device = data.output.targets.device || DEFAULT_OUTPUT.targets.device;
    data.output.targets.device.selectedDeviceId = String(body.deviceId || body.id || "default");
    data.output.targets.device.selectedDeviceName = String(body.deviceName || body.name || "Windows Standardgerät");
    data.output.targets.device.enabled = body.enabled === undefined ? data.output.targets.device.enabled === true : boolValue(body.enabled, false);
    const savedPath = saveConfig(data);
    return res.json({ ok: true, module: MODULE_NAME, message: "Audiogerät gespeichert.", configPath: savedPath, device: data.output.targets.device });
  });

  app.post(`${prefix}/test-output`, (req, res) => {
    const { data } = loadConfig();
    const target = normalizeTarget((req.body && req.body.target) || (data.output && data.output.defaultTarget) || "overlay");
    const deviceInfo = data.output && data.output.targets ? data.output.targets.device || {} : {};

    if (target === "device") {
      const info = helperInfo(data.output || DEFAULT_OUTPUT);
      if (!info.enabled || !info.exists) {
        return res.status(501).json({
          ok: false,
          module: MODULE_NAME,
          error: "audio_device_helper_unavailable",
          message: "Audiogerät-Ausgabe ist vorbereitet, aber der lokale Audio-Helper ist noch nicht vorhanden oder deaktiviert.",
          helper: info,
          selectedDevice: deviceInfo
        });
      }
    }

    return res.json({
      ok: true,
      module: MODULE_NAME,
      message: "Test-Ausgabe vorbereitet. Playback wird im nächsten Step an den Sound-Core angebunden.",
      target,
      output: data.output || DEFAULT_OUTPUT
    });
  });

  console.log(`[${MODULE_NAME}] loaded`);
};
