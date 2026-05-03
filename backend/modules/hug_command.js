"use strict";

/**
 * STEP012 - Zentrale Hug/Rehug Command-Route.
 *
 * Ziel:
 * Streamer.bot soll keine C#-URL-Bau-Scripte mehr brauchen.
 * Streamer.bot sendet nur noch Command + Actor + Inputs an Node.
 */

const http = require("http");
const core = require("./helpers/helper_core");
const routes = require("./helpers/helper_routes");
const chatOutput = require("./helpers/helper_chat_output");

const MODULE_NAME = "hug_command";

let port = 8080;

function clean(value) {
  return String(value || "").trim();
}

function normalizeInput(value) {
  let text = clean(value);
  if (text.startsWith("@")) text = text.slice(1);
  return text.trim();
}

function normalizeMode(value) {
  const mode = normalizeInput(value).toLowerCase();
  if (mode === "given" || mode === "received" || mode === "rehug") return mode;
  return "given";
}

function buildQuery(params) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null || value === "") continue;
    sp.set(key, String(value));
  }
  return sp.toString();
}

function localGet(pathname) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: "127.0.0.1",
      port,
      path: pathname,
      method: "GET",
      timeout: 15000,
      headers: { "Accept": "application/json" }
    }, res => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve(parsed);
        } catch (err) {
          reject(new Error(`invalid_json_from_local_route: ${err.message}`));
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("local_route_timeout"));
    });
    req.end();
  });
}

async function sendUsage(actorDisplay, command) {
  const usage = command === "rehug"
    ? `@${actorDisplay}, Nutzung: !rehug @user`
    : `@${actorDisplay}, Nutzung: !hug @user | !hug @all | !hug on | !hug off | !hug stats [user] | !hug top | !hug reload`;

  return await chatOutput.sendChatMessage(usage, {
    source: "hug_command",
    reason: "usage",
    prefer: "bot",
    fallbackToStreamer: true,
    fallbackToStreamerbot: true
  });
}

function readPayload(req) {
  const body = req.body && typeof req.body === "object" ? req.body : {};

  return {
    command: clean(body.command || core.getParam(req, "command", "hug")).toLowerCase(),
    actorUserId: clean(body.actorUserId || body.userId || core.getParam(req, "actorUserId", core.getParam(req, "userId", ""))),
    actorLogin: normalizeInput(body.actorLogin || body.userName || body.login || core.getParam(req, "actorLogin", core.getParam(req, "userName", core.getParam(req, "login", "")))),
    actorDisplay: clean(body.actorDisplay || body.user || body.displayName || core.getParam(req, "actorDisplay", core.getParam(req, "user", core.getParam(req, "displayName", "")))),
    input0: normalizeInput(body.input0 || core.getParam(req, "input0", "")),
    input1: normalizeInput(body.input1 || core.getParam(req, "input1", "")),
    rawInput: clean(body.rawInput || body.raw || core.getParam(req, "rawInput", core.getParam(req, "raw", "")))
  };
}

async function dispatch(payload) {
  const command = payload.command === "rehug" ? "rehug" : "hug";

  if (!payload.actorUserId || !payload.actorLogin || !payload.actorDisplay) {
    return await chatOutput.sendChatMessage("Fehlende Actor-Daten.", {
      source: "hug_command",
      reason: "missing_actor_data",
      prefer: "bot",
      fallbackToStreamer: true,
      fallbackToStreamerbot: true
    });
  }

  if (command === "rehug") {
    if (!payload.input0) return await sendUsage(payload.actorDisplay, "rehug");

    const qs = buildQuery({
      action: "rehug",
      actorUserId: payload.actorUserId,
      actorLogin: payload.actorLogin,
      actorDisplay: payload.actorDisplay,
      targetLogin: payload.input0
    });
    return await localGet(`/api/hug/cmd?${qs}`);
  }

  if (!payload.input0) return await sendUsage(payload.actorDisplay, "hug");

  const input0 = payload.input0.toLowerCase();
  const input1 = payload.input1.toLowerCase();

  if (input0 === "top") {
    const mode = normalizeMode(input1);
    return await localGet(`/api/hug/top?${buildQuery({ mode })}`);
  }

  if (input0 === "reload") {
    return await localGet("/api/hug/reload");
  }

  if (input0 === "all") {
    const qs = buildQuery({
      action: "hugall",
      actorUserId: payload.actorUserId,
      actorLogin: payload.actorLogin,
      actorDisplay: payload.actorDisplay
    });
    return await localGet(`/api/hug/cmd?${qs}`);
  }

  if (input0 === "on" || input0 === "off") {
    const qs = buildQuery({
      action: input0,
      actorUserId: payload.actorUserId,
      actorLogin: payload.actorLogin,
      actorDisplay: payload.actorDisplay
    });
    return await localGet(`/api/hug/cmd?${qs}`);
  }

  if (input0 === "stats") {
    const qs = buildQuery({
      requesterUserId: payload.actorUserId,
      requesterLogin: payload.actorLogin,
      requesterDisplay: payload.actorDisplay,
      targetLogin: payload.input1
    });
    return await localGet(`/api/hug/statscmd?${qs}`);
  }

  const qs = buildQuery({
    action: "hug",
    actorUserId: payload.actorUserId,
    actorLogin: payload.actorLogin,
    actorDisplay: payload.actorDisplay,
    targetLogin: payload.input0
  });
  return await localGet(`/api/hug/cmd?${qs}`);
}

async function handleCommand(req, res) {
  try {
    const payload = readPayload(req);
    const result = await dispatch(payload);
    res.json({
      ok: result.ok !== false,
      module: MODULE_NAME,
      command: payload.command,
      input0: payload.input0,
      input1: payload.input1,
      result
    });
  } catch (err) {
    console.error("[hug_command] failed:", err);
    const result = await chatOutput.sendChatMessage("Interner Fehler im Hug-Command.", {
      source: "hug_command",
      reason: "exception",
      prefer: "bot",
      fallbackToStreamer: true,
      fallbackToStreamerbot: true
    }).catch(() => ({ ok: false, chatMessage: "Interner Fehler im Hug-Command." }));

    res.status(500).json({
      ok: false,
      module: MODULE_NAME,
      error: err.message || String(err),
      result
    });
  }
}

function init(ctx) {
  const app = ctx.app;
  port = Number(ctx.env?.PORT || process.env.PORT || 8080) || 8080;

  routes.registerPost(app, ["/api/hug/command"], handleCommand);
  routes.registerGet(app, ["/api/hug/command"], handleCommand);

  return { name: MODULE_NAME, step: "012" };
}

module.exports = { init };
