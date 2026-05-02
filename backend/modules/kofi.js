'use strict';

// STEP98B — Ko-fi Webhook Security Hardening
// Ko-fi -> Node Webhook -> Alert-System V2 -> Overlay

const http = require('http');
const { URLSearchParams } = require('url');

const sqlite = require('./sqlite_core');
const routes = require('./helpers/helper_routes');

const MODULE = 'kofi';
const SCHEMA_VERSION = 1;
const SETTINGS_KEY = 'provider_kofi_webhook';

const DEFAULT_SETTINGS = {
  enabled: true,
  secretRequired: true,
  verificationToken: '',
  secretHeader: 'x-kofi-secret',
  secretHeaderValue: '',
  allowLocalhostWithoutSecret: true,
  allowPublicStatus: false,
  allowPublicTest: false,
  allowPublicReload: false,
  enqueueUrl: 'http://127.0.0.1:8080/api/alerts/enqueue',
  currencyDefault: 'EUR',
  minAmount: 0,
  includeRawEvent: true,
  duplicateWindowDays: 30,
  typeMap: {
    donation: 'donation',
    membership: 'membership',
    subscription: 'membership',
    commission: 'commission',
    shop: 'shop'
  }
};

const state = {
  loadedAt: new Date().toISOString(),
  settings: { ...DEFAULT_SETTINGS },
  stats: {
    received: 0,
    testEvents: 0,
    accepted: 0,
    rejected: 0,
    duplicates: 0,
    forwarded: 0,
    failed: 0,
    lastEventAt: null,
    lastForwardAt: null,
    lastError: ''
  }
};

module.exports.init = function init(ctx) {
  const { app } = ctx;

  ensureRuntime(ctx);
  ensureSchema();
  seedSettings();
  seedAlertTypesAndRules();
  loadSettings();

  routes.registerGet(app, '/api/alerts/kofi/status', (req, res) => {
    loadSettings();
    if (!isDirectLocalRequest(req) && state.settings.allowPublicStatus !== true) {
      return res.status(403).json({ ok: false, error: 'kofi_status_forbidden' });
    }
    res.json(buildStatus(req));
  });

  routes.registerPost(app, '/api/alerts/kofi/reload', (req, res) => {
    loadSettings();
    if (!isDirectLocalRequest(req) && state.settings.allowPublicReload !== true) {
      return res.status(403).json({ ok: false, error: 'kofi_reload_forbidden' });
    }
    loadSettings();
    res.json({ ok: true, status: buildStatus(req) });
  });

  // Lokale Konfig-Route für Token/Settings. Absichtlich nur direkt lokal erreichbar.
  routes.registerPost(app, '/api/alerts/kofi/config', (req, res) => {
    try {
      loadSettings();
      if (!isDirectLocalRequest(req)) {
        return res.status(403).json({ ok: false, error: 'kofi_config_forbidden' });
      }

      const patch = req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body) ? req.body : {};
      const updated = updateSettings(patch);
      res.json({ ok: true, updated: true, status: buildStatus(req), settings: maskSettings(updated) });
    } catch (err) {
      state.stats.failed += 1;
      state.stats.lastError = errorMessage(err);
      res.status(500).json({ ok: false, error: 'kofi_config_failed', message: errorMessage(err) });
    }
  });

  // Lokale Test-Route für PowerShell/Browser. Erzeugt keinen echten Ko-fi-Eingang, aber feuert denselben Alert-Pfad.
  routes.registerGet(app, '/api/alerts/kofi/test', async (req, res) => {
    try {
      loadSettings();
      if (!isDirectLocalRequest(req) && state.settings.allowPublicTest !== true) {
        return res.status(403).json({ ok: false, error: 'kofi_test_forbidden' });
      }

      state.stats.testEvents += 1;
      const event = buildLocalTestEvent(req.query || {});
      const result = await handleKofiEvent(event, { req, isLocalTest: true });
      res.status(result.ok ? 200 : 400).json(result);
    } catch (err) {
      state.stats.failed += 1;
      state.stats.lastError = errorMessage(err);
      res.status(500).json({ ok: false, error: 'kofi_test_failed', message: errorMessage(err) });
    }
  });

  // Diese Route ist später die einzige öffentlich freizugebende Route im Cloudflare Tunnel.
  routes.registerPost(app, '/api/alerts/kofi/webhook', async (req, res) => {
    state.stats.received += 1;
    state.stats.lastEventAt = nowIso();

    try {
      loadSettings();
      if (state.settings.enabled === false) {
        state.stats.rejected += 1;
        return res.status(403).json({ ok: false, error: 'kofi_provider_disabled' });
      }

      const event = parseKofiPayload(req);
      const verification = verifyWebhook(req, event);
      if (!verification.ok) {
        state.stats.rejected += 1;
        return res.status(401).json({ ok: false, error: verification.error });
      }

      const result = await handleKofiEvent(event, { req, isLocalTest: false });

      // Doppelte message_id ist kein Fehler. Ko-fi soll 200 bekommen, damit keine weiteren Retries kommen.
      const status = result.ok || result.duplicate ? 200 : 400;
      return res.status(status).json(result);
    } catch (err) {
      state.stats.failed += 1;
      state.stats.lastError = errorMessage(err);
      return res.status(500).json({ ok: false, error: 'kofi_webhook_failed', message: errorMessage(err) });
    }
  });

  console.log('[kofi] STEP98B Security Hardening aktiv -> /api/alerts/kofi/webhook');
};

function ensureRuntime(ctx) {
  if (!sqlite.isInitialized()) sqlite.init(ctx);
}

function ensureSchema() {
  sqlite.ensureSchema(MODULE, SCHEMA_VERSION, (fromVersion, toVersion, db) => {
    if (toVersion !== 1) return;
    db.exec(`
      CREATE TABLE IF NOT EXISTS alert_settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS alert_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL DEFAULT 'twitch',
        type_key TEXT NOT NULL,
        label TEXT NOT NULL,
        value_kind TEXT NOT NULL DEFAULT 'amount',
        enabled INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 100,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(source, type_key)
      );

      CREATE TABLE IF NOT EXISTS alert_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL DEFAULT 'twitch',
        type_key TEXT NOT NULL,
        label TEXT NOT NULL,
        min_value REAL,
        max_value REAL,
        tier TEXT NOT NULL DEFAULT 'normal',
        priority INTEGER NOT NULL DEFAULT 100,
        duration_ms INTEGER NOT NULL DEFAULT 7000,
        animation TEXT NOT NULL DEFAULT 'neon_card',
        image_mode TEXT NOT NULL DEFAULT 'none',
        sound_asset_id INTEGER,
        image_asset_id INTEGER,
        enabled INTEGER NOT NULL DEFAULT 1,
        meta_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS alert_provider_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider TEXT NOT NULL,
        provider_event_id TEXT NOT NULL,
        source TEXT NOT NULL,
        type_key TEXT NOT NULL,
        user_display TEXT NOT NULL DEFAULT '',
        amount REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'received',
        forwarded_event_uid TEXT NOT NULL DEFAULT '',
        raw_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        forwarded_at TEXT,
        UNIQUE(provider, provider_event_id)
      );

      CREATE INDEX IF NOT EXISTS idx_alert_provider_events_created ON alert_provider_events(created_at DESC);
    `);
  });
}

function seedSettings() {
  const existing = sqlite.get(`SELECT value_json FROM alert_settings WHERE key=:key`, { key: SETTINGS_KEY });
  if (existing) return;

  const envToken = String(process.env.KOFI_VERIFICATION_TOKEN || '').trim();
  const envHeaderValue = String(process.env.KOFI_SECRET_HEADER_VALUE || '').trim();
  const settings = {
    ...DEFAULT_SETTINGS,
    verificationToken: envToken,
    secretHeaderValue: envHeaderValue
  };

  sqlite.run(`
    INSERT INTO alert_settings (key, value_json, updated_at)
    VALUES (:key, :valueJson, :now)
  `, { key: SETTINGS_KEY, valueJson: JSON.stringify(settings), now: nowIso() });
}

function loadSettings() {
  const row = sqlite.get(`SELECT value_json FROM alert_settings WHERE key=:key`, { key: SETTINGS_KEY });
  const dbSettings = parseJson(row && row.value_json, {});
  state.settings = mergeSettings(DEFAULT_SETTINGS, dbSettings);

  // ENV darf ein leeres DB-Feld sinnvoll ergänzen, überschreibt aber keine bewusst gesetzte DB-Konfig.
  if (!state.settings.verificationToken && process.env.KOFI_VERIFICATION_TOKEN) {
    state.settings.verificationToken = String(process.env.KOFI_VERIFICATION_TOKEN).trim();
  }
  if (!state.settings.secretHeaderValue && process.env.KOFI_SECRET_HEADER_VALUE) {
    state.settings.secretHeaderValue = String(process.env.KOFI_SECRET_HEADER_VALUE).trim();
  }

  return state.settings;
}

function seedAlertTypesAndRules() {
  const now = nowIso();
  const types = [
    ['kofi', 'donation', 'Ko-fi Donation', 'amount', 100],
    ['kofi', 'membership', 'Ko-fi Membership', 'amount', 101],
    ['kofi', 'shop', 'Ko-fi Shop', 'amount', 102],
    ['kofi', 'commission', 'Ko-fi Commission', 'amount', 103]
  ];

  for (const [source, typeKey, label, valueKind, sortOrder] of types) {
    sqlite.run(`
      INSERT INTO alert_types (source, type_key, label, value_kind, enabled, sort_order, created_at, updated_at)
      VALUES (:source, :typeKey, :label, :valueKind, 1, :sortOrder, :now, :now)
      ON CONFLICT(source, type_key) DO UPDATE SET
        label=excluded.label,
        value_kind=excluded.value_kind,
        sort_order=excluded.sort_order,
        updated_at=excluded.updated_at
    `, { source, typeKey, label, valueKind, sortOrder, now });
  }

  const defaults = [
    { type_key: 'donation', label: 'Ko-fi Donation Standard', min_value: 0, max_value: null, tier: 'medium', priority: 80, duration_ms: 8000, image_mode: 'avatar_icon' },
    { type_key: 'membership', label: 'Ko-fi Membership Standard', min_value: 0, max_value: null, tier: 'big', priority: 70, duration_ms: 9500, image_mode: 'avatar_special' },
    { type_key: 'shop', label: 'Ko-fi Shop Standard', min_value: 0, max_value: null, tier: 'medium', priority: 85, duration_ms: 8500, image_mode: 'icon' },
    { type_key: 'commission', label: 'Ko-fi Commission Standard', min_value: 0, max_value: null, tier: 'big', priority: 75, duration_ms: 9500, image_mode: 'special' }
  ];

  for (const rule of defaults) {
    const exists = sqlite.get(`SELECT id FROM alert_rules WHERE source='kofi' AND type_key=:typeKey LIMIT 1`, { typeKey: rule.type_key });
    if (exists) continue;
    sqlite.run(`
      INSERT INTO alert_rules (source, type_key, label, min_value, max_value, tier, priority, duration_ms, animation, image_mode, enabled, meta_json, created_at, updated_at)
      VALUES ('kofi', :typeKey, :label, :minValue, :maxValue, :tier, :priority, :durationMs, 'neon_card', :imageMode, 1, '{}', :now, :now)
    `, {
      typeKey: rule.type_key,
      label: rule.label,
      minValue: rule.min_value,
      maxValue: rule.max_value,
      tier: rule.tier,
      priority: rule.priority,
      durationMs: rule.duration_ms,
      imageMode: rule.image_mode,
      now
    });
  }
}

function buildStatus(req) {
  return {
    ok: true,
    module: MODULE,
    step: '98B',
    loadedAt: state.loadedAt,
    enabled: state.settings.enabled !== false,
    settingsKey: SETTINGS_KEY,
    settings: maskSettings(state.settings),
    databasePath: sqlite.getDbPath(),
    schemaVersion: sqlite.getSchemaVersion(MODULE),
    stats: { ...state.stats },
    requestIp: req ? getIp(req) : '',
    requestHost: req ? getHost(req) : '',
    directLocal: req ? isDirectLocalRequest(req) : false,
    cloudflareTunnelRequest: req ? hasCloudflareTunnelHeaders(req) : false
  };
}

function maskSettings(settings) {
  const publicSettings = { ...(settings || {}) };
  publicSettings.verificationToken = publicSettings.verificationToken ? '[set]' : '';
  publicSettings.secretHeaderValue = publicSettings.secretHeaderValue ? '[set]' : '';
  return publicSettings;
}

function updateSettings(patch) {
  const current = loadSettings();
  const allowed = new Set([
    'enabled',
    'secretRequired',
    'verificationToken',
    'secretHeader',
    'secretHeaderValue',
    'allowLocalhostWithoutSecret',
    'allowPublicStatus',
    'allowPublicTest',
    'allowPublicReload',
    'enqueueUrl',
    'currencyDefault',
    'minAmount',
    'includeRawEvent',
    'duplicateWindowDays',
    'typeMap'
  ]);

  const next = { ...current };
  for (const [key, value] of Object.entries(patch || {})) {
    if (!allowed.has(key)) continue;
    if (key === 'typeMap') {
      next.typeMap = { ...(current.typeMap || {}), ...((value && typeof value === 'object') ? value : {}) };
      continue;
    }
    if (['enabled', 'secretRequired', 'allowLocalhostWithoutSecret', 'allowPublicStatus', 'allowPublicTest', 'allowPublicReload', 'includeRawEvent'].includes(key)) {
      next[key] = value === true || value === 'true' || value === 1 || value === '1';
      continue;
    }
    if (['minAmount', 'duplicateWindowDays'].includes(key)) {
      next[key] = toNumber(value, current[key]);
      continue;
    }
    next[key] = typeof value === 'string' ? value.trim() : value;
  }

  state.settings = mergeSettings(DEFAULT_SETTINGS, next);
  sqlite.run(`
    INSERT INTO alert_settings (key, value_json, updated_at)
    VALUES (:key, :valueJson, :now)
    ON CONFLICT(key) DO UPDATE SET
      value_json=excluded.value_json,
      updated_at=excluded.updated_at
  `, { key: SETTINGS_KEY, valueJson: JSON.stringify(state.settings), now: nowIso() });
  loadSettings();
  return state.settings;
}

function parseKofiPayload(req) {
  const body = req.body;

  if (body && typeof body === 'object' && !Buffer.isBuffer(body)) {
    if (typeof body.data === 'string') return normalizeKofiEvent(parseJson(body.data, null), body);
    if (body.data && typeof body.data === 'object') return normalizeKofiEvent(body.data, body);
    return normalizeKofiEvent(body, body);
  }

  const raw = Buffer.isBuffer(body) ? body.toString('utf8') : String(body || '');
  if (!raw.trim()) throw new Error('empty_kofi_payload');

  const asJson = parseJson(raw, null);
  if (asJson) {
    if (typeof asJson.data === 'string') return normalizeKofiEvent(parseJson(asJson.data, null), asJson);
    if (asJson.data && typeof asJson.data === 'object') return normalizeKofiEvent(asJson.data, asJson);
    return normalizeKofiEvent(asJson, asJson);
  }

  const params = new URLSearchParams(raw);
  const data = params.get('data');
  if (data) return normalizeKofiEvent(parseJson(data, null), Object.fromEntries(params.entries()));

  throw new Error('invalid_kofi_payload');
}

function normalizeKofiEvent(data, original) {
  if (!data || typeof data !== 'object') throw new Error('invalid_kofi_data');

  const amount = toNumber(data.amount, 0);
  const currency = cleanText(data.currency || state.settings.currencyDefault || 'EUR', 16).toUpperCase();
  const typeKey = mapKofiType(data);
  const providerEventId = cleanText(data.message_id || data.kofi_transaction_id || data.transaction_id || data.id || '', 120) || `kofi_${Date.now()}`;
  const displayName = cleanText(data.from_name || data.display_name || data.name || 'Ko-fi Supporter', 120);
  const message = cleanText(data.message || '', 500);
  const title = buildKofiTitle(typeKey, displayName, amount, currency, data);

  return {
    provider: 'kofi',
    providerEventId,
    source: 'kofi',
    type_key: typeKey,
    user_login: cleanKey(displayName) || 'kofi_supporter',
    user_display: displayName,
    amount,
    currency,
    message,
    title,
    avatar_url: '',
    verification_token: cleanText(data.verification_token || '', 255),
    raw: sanitizeRawKofi({ ...(original || {}), normalizedData: data })
  };
}

function mapKofiType(data) {
  const typeRaw = String(data.type || '').toLowerCase();
  const settingsMap = state.settings.typeMap || DEFAULT_SETTINGS.typeMap;

  if (typeRaw.includes('commission')) return cleanKey(settingsMap.commission || 'commission');
  if (typeRaw.includes('shop') || data.shop_items) return cleanKey(settingsMap.shop || 'shop');
  if (typeRaw.includes('membership') || typeRaw.includes('subscription') || data.is_subscription_payment || data.is_first_subscription_payment || data.tier_name) {
    return cleanKey(settingsMap.membership || settingsMap.subscription || 'membership');
  }
  return cleanKey(settingsMap.donation || 'donation');
}

function buildKofiTitle(typeKey, displayName, amount, currency, data) {
  const value = amount > 0 ? `${formatAmount(amount)} ${currency}` : '';
  if (typeKey === 'membership') return `${displayName} unterstützt per Ko-fi Membership${value ? ` (${value})` : ''}!`;
  if (typeKey === 'shop') return `${displayName} hat im Ko-fi Shop gekauft${value ? ` (${value})` : ''}!`;
  if (typeKey === 'commission') return `${displayName} hat eine Ko-fi Commission ausgelöst${value ? ` (${value})` : ''}!`;
  return `${displayName} spendet über Ko-fi${value ? ` ${value}` : ''}!`;
}

function verifyWebhook(req, event) {
  const settings = state.settings;
  const isLocal = isDirectLocalRequest(req);

  if (settings.allowLocalhostWithoutSecret && isLocal) return { ok: true, mode: 'direct_local' };
  if (settings.secretRequired === false) return { ok: true, mode: 'disabled' };

  const expectedToken = String(settings.verificationToken || '').trim();
  if (expectedToken) {
    if (safeEqual(event.verification_token, expectedToken)) return { ok: true, mode: 'verification_token' };
    return { ok: false, error: 'invalid_kofi_verification_token' };
  }

  const headerName = String(settings.secretHeader || '').toLowerCase();
  const expectedHeader = String(settings.secretHeaderValue || '').trim();
  if (headerName && expectedHeader) {
    const got = String(req.headers[headerName] || '').trim();
    if (safeEqual(got, expectedHeader)) return { ok: true, mode: 'secret_header' };
    return { ok: false, error: 'invalid_kofi_secret_header' };
  }

  return { ok: false, error: 'kofi_secret_not_configured' };
}

async function handleKofiEvent(event, options = {}) {
  loadSettings();

  if (event.amount < Number(state.settings.minAmount || 0)) {
    state.stats.rejected += 1;
    rememberProviderEvent(event, 'ignored_min_amount', '');
    return { ok: false, ignored: true, error: 'below_min_amount', amount: event.amount, minAmount: state.settings.minAmount };
  }

  const duplicate = rememberProviderEvent(event, 'received', '');
  if (duplicate) {
    state.stats.duplicates += 1;
    return { ok: true, duplicate: true, providerEventId: event.providerEventId, message: 'duplicate_ignored' };
  }

  const alertPayload = {
    source: 'kofi',
    type: event.type_key,
    user: event.user_display,
    user_login: event.user_login,
    amount: event.amount,
    message: event.message,
    title: event.title,
    currency: event.currency,
    providerEventId: event.providerEventId,
    raw: state.settings.includeRawEvent ? event.raw : { providerEventId: event.providerEventId, currency: event.currency }
  };

  const forward = await postJsonInternal(state.settings.enqueueUrl || DEFAULT_SETTINGS.enqueueUrl, alertPayload);
  if (!forward.ok) {
    state.stats.failed += 1;
    state.stats.lastError = forward.error || 'alert_forward_failed';
    updateProviderEvent(event, 'forward_failed', '');
    return { ok: false, error: 'alert_forward_failed', detail: forward };
  }

  const forwardedEventUid = forward.body && forward.body.eventUid ? String(forward.body.eventUid) : '';
  updateProviderEvent(event, 'forwarded', forwardedEventUid);

  if (!options.isLocalTest) state.stats.accepted += 1;
  state.stats.forwarded += 1;
  state.stats.lastForwardAt = nowIso();
  state.stats.lastError = '';

  return {
    ok: true,
    localTest: !!options.isLocalTest,
    provider: 'kofi',
    providerEventId: event.providerEventId,
    type: event.type_key,
    amount: event.amount,
    currency: event.currency,
    user: event.user_display,
    forwardedEventUid,
    alertResult: forward.body
  };
}

function rememberProviderEvent(event, status, forwardedEventUid) {
  const now = nowIso();
  try {
    sqlite.run(`
      INSERT INTO alert_provider_events (provider, provider_event_id, source, type_key, user_display, amount, currency, status, forwarded_event_uid, raw_json, created_at, forwarded_at)
      VALUES (:provider, :providerEventId, :source, :typeKey, :userDisplay, :amount, :currency, :status, :forwardedEventUid, :rawJson, :now, NULL)
    `, {
      provider: event.provider,
      providerEventId: event.providerEventId,
      source: event.source,
      typeKey: event.type_key,
      userDisplay: event.user_display,
      amount: event.amount,
      currency: event.currency,
      status,
      forwardedEventUid: forwardedEventUid || '',
      rawJson: JSON.stringify(event.raw || {}),
      now
    });
    return false;
  } catch (err) {
    if (String(err && err.message || err).toLowerCase().includes('unique')) return true;
    throw err;
  }
}

function updateProviderEvent(event, status, forwardedEventUid) {
  sqlite.run(`
    UPDATE alert_provider_events
    SET status=:status, forwarded_event_uid=:forwardedEventUid, forwarded_at=:forwardedAt
    WHERE provider=:provider AND provider_event_id=:providerEventId
  `, {
    status,
    forwardedEventUid: forwardedEventUid || '',
    forwardedAt: status === 'forwarded' ? nowIso() : null,
    provider: event.provider,
    providerEventId: event.providerEventId
  });
}

function buildLocalTestEvent(query) {
  const amount = toNumber(query.amount, 3);
  const currency = cleanText(query.currency || state.settings.currencyDefault || 'EUR', 16).toUpperCase();
  const type = cleanText(query.type || 'Donation', 80);
  const user = cleanText(query.user || query.from_name || 'KoFiTester', 120);

  return normalizeKofiEvent({
    verification_token: state.settings.verificationToken || 'local-test-token',
    message_id: `local_test_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    timestamp: nowIso(),
    type,
    is_public: true,
    from_name: user,
    message: cleanText(query.message || 'Lokaler Ko-fi Test', 500),
    amount: String(amount),
    currency,
    is_subscription_payment: type.toLowerCase().includes('subscription') || type.toLowerCase().includes('membership'),
    is_first_subscription_payment: false,
    kofi_transaction_id: `local_tx_${Date.now()}`,
    shop_items: type.toLowerCase().includes('shop') ? [{ name: 'Testartikel', quantity: 1 }] : null,
    tier_name: query.tier || null
  }, { localTest: true });
}

function postJsonInternal(targetUrl, payload) {
  return new Promise(resolve => {
    try {
      const url = new URL(targetUrl);
      const body = JSON.stringify(payload);
      const req = http.request({
        method: 'POST',
        hostname: url.hostname,
        port: url.port || 80,
        path: `${url.pathname}${url.search}`,
        headers: {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(body)
        },
        timeout: 5000
      }, res => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', chunk => { raw += chunk; });
        res.on('end', () => {
          const parsed = parseJson(raw, null);
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, statusCode: res.statusCode, body: parsed || raw });
        });
      });
      req.on('timeout', () => {
        req.destroy(new Error('timeout'));
      });
      req.on('error', err => resolve({ ok: false, error: errorMessage(err) }));
      req.write(body);
      req.end();
    } catch (err) {
      resolve({ ok: false, error: errorMessage(err) });
    }
  });
}

function sanitizeRawKofi(raw) {
  const copy = JSON.parse(JSON.stringify(raw || {}));
  stripSensitive(copy);
  return copy;
}

function stripSensitive(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    const lower = key.toLowerCase();
    if (lower.includes('verification_token') || lower === 'email' || lower.includes('secret') || lower.includes('token')) {
      obj[key] = '[redacted]';
    } else if (obj[key] && typeof obj[key] === 'object') {
      stripSensitive(obj[key]);
    }
  }
}

function isDirectLocalRequest(req) {
  const ip = getIp(req);
  const host = getHost(req).toLowerCase();
  const localIp = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
  const localHost = host === '127.0.0.1' || host === '127.0.0.1:8080' || host === 'localhost' || host === 'localhost:8080' || host === '[::1]' || host === '[::1]:8080';
  return localIp && localHost && !hasCloudflareTunnelHeaders(req);
}

function hasCloudflareTunnelHeaders(req) {
  const h = (req && req.headers) || {};
  return !!(
    h['cf-ray'] ||
    h['cf-connecting-ip'] ||
    h['cf-visitor'] ||
    h['cf-ipcountry'] ||
    h['cdn-loop'] ||
    h['cf-ew-via'] ||
    h['x-forwarded-host'] ||
    h['x-forwarded-for'] ||
    h['x-real-ip']
  );
}

function getHost(req) {
  return String((req && req.headers && (req.headers.host || req.headers['x-forwarded-host'])) || '');
}

function getIp(req) {
  return String(req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '').replace(/^::ffff:/, '');
}

function mergeSettings(base, incoming) {
  return {
    ...base,
    ...(incoming || {}),
    typeMap: { ...(base.typeMap || {}), ...((incoming && incoming.typeMap) || {}) }
  };
}

function safeEqual(a, b) {
  const aa = String(a || '');
  const bb = String(b || '');
  if (!aa || !bb || aa.length !== bb.length) return false;
  let out = 0;
  for (let i = 0; i < aa.length; i++) out |= aa.charCodeAt(i) ^ bb.charCodeAt(i);
  return out === 0;
}

function cleanText(v, max = 500) { return String(v ?? '').trim().slice(0, max); }
function cleanKey(v) { return String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9_.-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80); }
function toNumber(v, fallback) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }
function formatAmount(n) { return Number(n || 0).toFixed(2).replace(/\.00$/, ''); }
function parseJson(v, fallback) { try { return JSON.parse(v || ''); } catch (_) { return fallback; } }
function nowIso() { return new Date().toISOString(); }
function errorMessage(err) { return err && err.message ? err.message : String(err); }
