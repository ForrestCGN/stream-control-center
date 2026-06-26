'use strict';

const FORBIDDEN_LOG_KEYS = [
  'authorization',
  'bearer',
  'token',
  'secret',
  'cookie',
  'access_key',
  'accesskey',
  'headers',
  'payload',
  'configdump',
  'raw'
];

function info(event, details = {}) {
  write('info', event, details);
}

function warn(event, details = {}) {
  write('warn', event, details);
}

function error(event, details = {}) {
  write('error', event, details);
}

function write(level, event, details = {}) {
  const safeEvent = sanitizeEvent(event);
  const safeDetails = sanitizeDetails(details);
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level: sanitizeLevel(level),
    event: safeEvent,
    ...safeDetails
  });

  if (level === 'error') {
    console.error(line);
    return;
  }

  console.log(line);
}

function sanitizeLevel(level) {
  const value = String(level || 'info').toLowerCase();
  return ['info', 'warn', 'error'].includes(value) ? value : 'info';
}

function sanitizeEvent(event) {
  return String(event || 'event')
    .replace(/[^a-zA-Z0-9._:-]/g, '_')
    .slice(0, 80) || 'event';
}

function sanitizeDetails(details = {}) {
  if (!details || typeof details !== 'object' || Array.isArray(details)) return {};

  const output = {};
  for (const [rawKey, rawValue] of Object.entries(details)) {
    const key = sanitizeKey(rawKey);
    if (!key || isForbiddenKey(key)) continue;
    const value = sanitizeValue(rawValue);
    if (value !== undefined) output[key] = value;
  }
  return output;
}

function sanitizeKey(key) {
  return String(key || '')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .slice(0, 48);
}

function isForbiddenKey(key) {
  const lower = String(key || '').toLowerCase();
  return FORBIDDEN_LOG_KEYS.some(forbidden => lower.includes(forbidden));
}

function sanitizeValue(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string') {
    return value
      .replace(/[\r\n]/g, ' ')
      .replace(/[^\x20-\x7E]/g, '')
      .slice(0, 160);
  }
  return '[redacted_non_scalar]';
}

module.exports = {
  info,
  warn,
  error,
  sanitizeDetails
};
