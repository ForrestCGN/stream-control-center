'use strict';

const fs = require('fs');
const path = require('path');

function nowIso() {
  return new Date().toISOString();
}

function normalizePath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') return '';
  return path.normalize(inputPath.trim());
}

function ensureDir(dirPath) {
  const target = normalizePath(dirPath);
  if (!target) {
    throw new Error('ensureDir: dirPath fehlt oder ist leer.');
  }

  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  return target;
}

function ensureParentDir(filePath) {
  const target = normalizePath(filePath);
  if (!target) {
    throw new Error('ensureParentDir: filePath fehlt oder ist leer.');
  }

  const dir = path.dirname(target);
  ensureDir(dir);
  return dir;
}

function fileExists(filePath) {
  const target = normalizePath(filePath);
  return !!target && fs.existsSync(target);
}

function readText(filePath, fallback = '') {
  const target = normalizePath(filePath);
  if (!target || !fs.existsSync(target)) return fallback;
  return fs.readFileSync(target, 'utf8');
}

function writeText(filePath, content) {
  const target = normalizePath(filePath);
  ensureParentDir(target);
  fs.writeFileSync(target, String(content ?? ''), 'utf8');
  return target;
}

function safeJsonParse(raw, fallback = null) {
  try {
    if (raw === undefined || raw === null || raw === '') return fallback;
    return JSON.parse(String(raw));
  } catch (_) {
    return fallback;
  }
}

function readJson(filePath, fallback = null) {
  const raw = readText(filePath, null);
  if (raw === null) return fallback;
  return safeJsonParse(raw, fallback);
}

function writeJson(filePath, data, options = {}) {
  const spaces = Number.isInteger(options.spaces) ? options.spaces : 2;
  const target = normalizePath(filePath);
  ensureParentDir(target);
  fs.writeFileSync(target, JSON.stringify(data, null, spaces), 'utf8');
  return target;
}

function appendJsonLine(filePath, data) {
  const target = normalizePath(filePath);
  ensureParentDir(target);
  fs.appendFileSync(target, JSON.stringify(data) + '\n', 'utf8');
  return target;
}

function pickFirst(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return '';
}

function getParam(req, name, fallback = '') {
  if (!req || !name) return fallback;

  if (req.body && Object.prototype.hasOwnProperty.call(req.body, name)) {
    return req.body[name];
  }

  if (req.query && Object.prototype.hasOwnProperty.call(req.query, name)) {
    return req.query[name];
  }

  return fallback;
}

function boolParam(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const v = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on', 'y'].includes(v)) return true;
  if (['0', 'false', 'no', 'nein', 'off', 'n'].includes(v)) return false;
  return fallback;
}

function intParam(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function ok(data = {}, message = 'ok') {
  return {
    ok: true,
    message,
    ts: nowIso(),
    ...data
  };
}

function fail(message = 'Fehler', data = {}) {
  return {
    ok: false,
    error: String(message || 'Fehler'),
    ts: nowIso(),
    ...data
  };
}

function sendOk(res, data = {}, message = 'ok') {
  return res.json(ok(data, message));
}

function sendFail(res, message = 'Fehler', statusCode = 500, data = {}) {
  return res.status(statusCode).json(fail(message, data));
}

function asyncRoute(handler) {
  return async function wrappedRoute(req, res, next) {
    try {
      await handler(req, res, next);
    } catch (err) {
      if (res.headersSent) return next(err);
      return sendFail(res, err && err.message ? err.message : String(err), 500);
    }
  };
}

module.exports = {
  nowIso,
  normalizePath,
  ensureDir,
  ensureParentDir,
  fileExists,
  readText,
  writeText,
  safeJsonParse,
  readJson,
  writeJson,
  appendJsonLine,
  pickFirst,
  getParam,
  boolParam,
  intParam,
  ok,
  fail,
  sendOk,
  sendFail,
  asyncRoute
};
