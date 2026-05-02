/**
 * ForrestCGN Core Helper - security.js
 *
 * Kleine Sicherheitshelfer.
 * Phase 1C: Nur hinzufügen, noch keine bestehende Funktionalität ersetzen.
 */

const SECRET_PATTERNS = [
  /(auth=)[A-Za-z0-9._\-]+/gi,
  /(api[_-]?key["']?\s*[:=]\s*["']?)[A-Za-z0-9._\-]+/gi,
  /(token["']?\s*[:=]\s*["']?)[A-Za-z0-9._\-]{12,}/gi,
  /(accessToken["']?\s*[:=]\s*["']?)[A-Za-z0-9._\-]{12,}/gi,
  /(refreshToken["']?\s*[:=]\s*["']?)[A-Za-z0-9._\-]{12,}/gi,
  /(password["']?\s*[:=]\s*["']?)[^"',\s]+/gi
];

function redactSecrets(value) {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    let out = value;
    for (const pattern of SECRET_PATTERNS) {
      out = out.replace(pattern, "$1REDACTED");
    }
    return out;
  }

  if (Array.isArray(value)) {
    return value.map(redactSecrets);
  }

  if (typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      if (/token|secret|password|authorization|apikey|api_key|clientsecret/i.test(key)) {
        out[key] = "REDACTED";
      } else {
        out[key] = redactSecrets(val);
      }
    }
    return out;
  }

  return value;
}

function safeError(error) {
  if (!error) return { message: "unknown_error" };

  return redactSecrets({
    message: error.message || String(error),
    code: error.code,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined
  });
}

function blockInternalPath(req, res) {
  res.status(403).json({
    ok: false,
    error: "blocked_internal_path"
  });
}

module.exports = {
  redactSecrets,
  safeError,
  blockInternalPath
};
