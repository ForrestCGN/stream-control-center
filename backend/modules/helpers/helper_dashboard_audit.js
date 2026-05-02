'use strict';

/**
 * STEP005 placeholder for compact dashboard audit logging.
 * Noch nicht scharf geschaltet. Später eigene SQLite-Datei:
 * data/sqlite/dashboard_audit.sqlite
 */

function compactNowTs() {
  return Math.floor(Date.now() / 1000);
}

function compactDetails(details, maxLength = 1000) {
  if (!details) return '';
  try {
    const text = typeof details === 'string' ? details : JSON.stringify(details);
    return text.length > maxLength ? text.slice(0, maxLength) : text;
  } catch (_) {
    return '';
  }
}

function buildAuditEntry(input = {}) {
  return {
    ts: input.ts || compactNowTs(),
    actor: input.actor || '',
    role: input.role || '',
    ip: input.ip || '',
    action: input.action || '',
    target: input.target || '',
    result: input.result === false ? 0 : 1,
    reason: input.reason || '',
    data: compactDetails(input.data, input.maxDetailsLength || 1000)
  };
}

module.exports = { compactNowTs, compactDetails, buildAuditEntry };
