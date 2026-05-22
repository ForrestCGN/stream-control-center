'use strict';

const http = require('http');
const database = require('../core/database');
const core = require('./helpers/helper_core');

const MODULE_NAME = 'commands';
const SCHEMA_MODULE = 'command_system';
const SCHEMA_VERSION = 1;
const API_PREFIX = '/api/commands';
const DEFAULT_PREFIX = '!';
const DEFAULT_TARGET_HOST = '127.0.0.1';
const DEFAULT_TARGET_PORT = 8080;

const state = {
  initialized: false,
  schemaOk: false,
  schemaError: '',
  loadedAt: '',
  prefix: DEFAULT_PREFIX,
  enabled: true,
  handled: 0,
  ignored: 0,
  executed: 0,
  failed: 0,
  lastCommandAt: '',
  lastCommand: null,
  lastError: '',
  cooldowns: new Map(),
  ctx: null
};

function nowIso() {
  return core.nowIso();
}

function cleanText(value) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
}

function cleanLogin(value) {
  return String(value || '').trim().replace(/^@/, '').toLowerCase();
}

function cleanTrigger(value) {
  return String(value || '').trim().replace(/^[!./]+/, '').toLowerCase();
}

function jsonEncode(value) {
  return JSON.stringify(value ?? null);
}

function jsonDecode(value, fallback = null) {
  return database.jsonDecode ? database.jsonDecode(value, fallback) : core.safeJsonParse(value, fallback);
}

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const v = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on', 'y'].includes(v)) return true;
  if (['0', 'false', 'no', 'nein', 'off', 'n'].includes(v)) return false;
  return fallback;
}

function int(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function ensureSchema() {
  try {
    database.ensureReady();
    database.exec(`
      CREATE TABLE IF NOT EXISTS command_definitions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trigger TEXT NOT NULL UNIQUE,
        aliases_json TEXT NOT NULL DEFAULT '[]',
        module_key TEXT NOT NULL DEFAULT '',
        action_key TEXT NOT NULL DEFAULT '',
        target_method TEXT NOT NULL DEFAULT 'POST',
        target_url TEXT NOT NULL DEFAULT '',
        enabled INTEGER NOT NULL DEFAULT 1,
        permission_level TEXT NOT NULL DEFAULT 'everyone',
        cooldown_global_ms INTEGER NOT NULL DEFAULT 0,
        cooldown_user_ms INTEGER NOT NULL DEFAULT 0,
        live_only INTEGER NOT NULL DEFAULT 0,
        response_mode TEXT NOT NULL DEFAULT 'module',
        config_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_command_definitions_enabled ON command_definitions(enabled);`);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_command_definitions_module ON command_definitions(module_key);`);
    database.exec(`
      CREATE TABLE IF NOT EXISTS command_execution_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trigger TEXT NOT NULL DEFAULT '',
        alias_trigger TEXT NOT NULL DEFAULT '',
        user_login TEXT NOT NULL DEFAULT '',
        user_display_name TEXT NOT NULL DEFAULT '',
        raw_message TEXT NOT NULL DEFAULT '',
        args_json TEXT NOT NULL DEFAULT '[]',
        module_key TEXT NOT NULL DEFAULT '',
        action_key TEXT NOT NULL DEFAULT '',
        target_url TEXT NOT NULL DEFAULT '',
        success INTEGER NOT NULL DEFAULT 0,
        ignored INTEGER NOT NULL DEFAULT 0,
        error TEXT NOT NULL DEFAULT '',
        result_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL
      );
    `);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_command_execution_log_created ON command_execution_log(created_at);`);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_command_execution_log_trigger ON command_execution_log(trigger);`);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_command_execution_log_user ON command_execution_log(user_login);`);
    if (typeof database.setSchemaVersion === 'function') database.setSchemaVersion(SCHEMA_MODULE, SCHEMA_VERSION);
    state.schemaOk = true;
    state.schemaError = '';
    seedDefaultCommands();
    return true;
  } catch (err) {
    state.schemaOk = false;
    state.schemaError = err?.message || String(err);
    state.lastError = state.schemaError;
    return false;
  }
}

function seedDefaultCommands() {
  const defaults = [
    {
      trigger: 'rip',
      aliases: ['death', 'tod'],
      moduleKey: 'deathcounter_v2',
      actionKey: 'command',
      targetMethod: 'POST',
      targetUrl: '/api/deathcounter/v2/command',
      permissionLevel: 'everyone',
      cooldownGlobalMs: 1000,
      cooldownUserMs: 3000,
      liveOnly: false,
      responseMode: 'module',
      config: { seededBy: 'STEP273A', rawInputMode: true }
    },
    {
      trigger: 'tode',
      aliases: ['deaths'],
      moduleKey: 'deathcounter_v2',
      actionKey: 'command',
      targetMethod: 'POST',
      targetUrl: '/api/deathcounter/v2/command',
      permissionLevel: 'everyone',
      cooldownGlobalMs: 1000,
      cooldownUserMs: 3000,
      liveOnly: false,
      responseMode: 'module',
      config: { seededBy: 'STEP273A', rawInputMode: true }
    },
    {
      trigger: 'dcount',
      aliases: ['deathcount', 'deathcounter'],
      moduleKey: 'deathcounter_v2',
      actionKey: 'command',
      targetMethod: 'POST',
      targetUrl: '/api/deathcounter/v2/command',
      permissionLevel: 'mod',
      cooldownGlobalMs: 1000,
      cooldownUserMs: 2500,
      liveOnly: false,
      responseMode: 'module',
      config: { seededBy: 'STEP273A', rawInputMode: true }
    }
  ];

  for (const item of defaults) {
    const existing = database.get('SELECT id FROM command_definitions WHERE trigger = :trigger', { trigger: item.trigger });
    if (existing?.id) continue;
    upsertCommand(item, { seed: true });
  }
}

function rowToCommand(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    trigger: row.trigger || '',
    aliases: jsonDecode(row.aliases_json, []),
    moduleKey: row.module_key || '',
    actionKey: row.action_key || '',
    targetMethod: row.target_method || 'POST',
    targetUrl: row.target_url || '',
    enabled: Number(row.enabled || 0) === 1,
    permissionLevel: row.permission_level || 'everyone',
    cooldownGlobalMs: Number(row.cooldown_global_ms || 0),
    cooldownUserMs: Number(row.cooldown_user_ms || 0),
    liveOnly: Number(row.live_only || 0) === 1,
    responseMode: row.response_mode || 'module',
    config: jsonDecode(row.config_json, {}),
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || ''
  };
}

function listCommands(options = {}) {
  ensureSchema();
  const includeDisabled = bool(options.includeDisabled, true);
  const rows = database.all(`
    SELECT *
    FROM command_definitions
    ${includeDisabled ? '' : 'WHERE enabled = 1'}
    ORDER BY trigger ASC
  `);
  return rows.map(rowToCommand).filter(Boolean);
}

function getCommandByTrigger(trigger) {
  ensureSchema();
  const clean = cleanTrigger(trigger);
  if (!clean) return null;
  const direct = database.get('SELECT * FROM command_definitions WHERE trigger = :trigger', { trigger: clean });
  if (direct) return { command: rowToCommand(direct), aliasTrigger: clean, matchedBy: 'trigger' };

  const rows = database.all('SELECT * FROM command_definitions WHERE enabled = 1');
  for (const row of rows) {
    const aliases = jsonDecode(row.aliases_json, []);
    if (Array.isArray(aliases) && aliases.map(cleanTrigger).includes(clean)) {
      return { command: rowToCommand(row), aliasTrigger: clean, matchedBy: 'alias' };
    }
  }
  return null;
}

function normalizeAliases(value) {
  if (Array.isArray(value)) return value.map(cleanTrigger).filter(Boolean);
  const raw = String(value || '').trim();
  if (!raw) return [];
  return raw.split(/[\s,;]+/).map(cleanTrigger).filter(Boolean);
}

function normalizeConfig(value) {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  return core.safeJsonParse(value, {});
}

function upsertCommand(input = {}, options = {}) {
  ensureSchema();
  const now = nowIso();
  const trigger = cleanTrigger(input.trigger || input.command || input.name || '');
  if (!trigger) throw new Error('command_trigger_missing');

  const existing = database.get('SELECT * FROM command_definitions WHERE trigger = :trigger', { trigger });
  const current = rowToCommand(existing);
  const data = {
    trigger,
    aliasesJson: jsonEncode(normalizeAliases(input.aliases ?? current?.aliases ?? [])),
    moduleKey: cleanText(input.moduleKey ?? input.module_key ?? current?.moduleKey ?? ''),
    actionKey: cleanText(input.actionKey ?? input.action_key ?? current?.actionKey ?? ''),
    targetMethod: cleanText(input.targetMethod ?? input.target_method ?? current?.targetMethod ?? 'POST').toUpperCase() || 'POST',
    targetUrl: cleanText(input.targetUrl ?? input.target_url ?? current?.targetUrl ?? ''),
    enabled: bool(input.enabled, current ? current.enabled : true) ? 1 : 0,
    permissionLevel: cleanText(input.permissionLevel ?? input.permission_level ?? current?.permissionLevel ?? 'everyone').toLowerCase() || 'everyone',
    cooldownGlobalMs: Math.max(0, int(input.cooldownGlobalMs ?? input.cooldown_global_ms ?? current?.cooldownGlobalMs ?? 0, 0)),
    cooldownUserMs: Math.max(0, int(input.cooldownUserMs ?? input.cooldown_user_ms ?? current?.cooldownUserMs ?? 0, 0)),
    liveOnly: bool(input.liveOnly ?? input.live_only, current ? current.liveOnly : false) ? 1 : 0,
    responseMode: cleanText(input.responseMode ?? input.response_mode ?? current?.responseMode ?? 'module') || 'module',
    configJson: jsonEncode(normalizeConfig(input.config ?? input.config_json ?? current?.config ?? {})),
    createdAt: current?.createdAt || now,
    updatedAt: now
  };

  database.run(`
    INSERT INTO command_definitions (
      trigger, aliases_json, module_key, action_key, target_method, target_url,
      enabled, permission_level, cooldown_global_ms, cooldown_user_ms, live_only,
      response_mode, config_json, created_at, updated_at
    ) VALUES (
      :trigger, :aliasesJson, :moduleKey, :actionKey, :targetMethod, :targetUrl,
      :enabled, :permissionLevel, :cooldownGlobalMs, :cooldownUserMs, :liveOnly,
      :responseMode, :configJson, :createdAt, :updatedAt
    )
    ON CONFLICT(trigger) DO UPDATE SET
      aliases_json = excluded.aliases_json,
      module_key = excluded.module_key,
      action_key = excluded.action_key,
      target_method = excluded.target_method,
      target_url = excluded.target_url,
      enabled = excluded.enabled,
      permission_level = excluded.permission_level,
      cooldown_global_ms = excluded.cooldown_global_ms,
      cooldown_user_ms = excluded.cooldown_user_ms,
      live_only = excluded.live_only,
      response_mode = excluded.response_mode,
      config_json = excluded.config_json,
      updated_at = excluded.updated_at
  `, data);

  const saved = rowToCommand(database.get('SELECT * FROM command_definitions WHERE trigger = :trigger', { trigger }));
  return { ok: true, seed: !!options.seed, command: saved };
}

function deleteCommand(triggerOrId) {
  ensureSchema();
  const raw = String(triggerOrId || '').trim();
  if (!raw) throw new Error('command_delete_target_missing');
  let result;
  if (/^\d+$/.test(raw)) {
    result = database.run('DELETE FROM command_definitions WHERE id = :id', { id: Number(raw) });
  } else {
    result = database.run('DELETE FROM command_definitions WHERE trigger = :trigger', { trigger: cleanTrigger(raw) });
  }
  return { ok: true, deleted: Number(result?.changes || 0) };
}

function parseChatMessage(input = {}) {
  const rawMessage = cleanText(input.rawMessage || input.message || input.text || '');
  const prefix = cleanText(input.prefix || state.prefix || DEFAULT_PREFIX) || DEFAULT_PREFIX;
  if (!rawMessage || !rawMessage.startsWith(prefix)) {
    return { isCommand: false, rawMessage, prefix, reason: 'not_a_command' };
  }

  const withoutPrefix = rawMessage.slice(prefix.length).trim();
  if (!withoutPrefix) return { isCommand: false, rawMessage, prefix, reason: 'empty_command' };

  const parts = withoutPrefix.split(/\s+/).filter(Boolean);
  const trigger = cleanTrigger(parts.shift() || '');
  const args = parts;
  return {
    isCommand: !!trigger,
    prefix,
    rawMessage,
    trigger,
    args,
    rawInput: withoutPrefix,
    argText: args.join(' ')
  };
}

function userFromParsed(parsed = {}, override = {}) {
  const tags = parsed.tags || {};
  const badges = parsed.badges || {};
  const login = cleanLogin(override.userLogin || override.login || parsed.login || tags.login || '');
  const displayName = cleanText(override.userDisplayName || override.displayName || parsed.displayName || tags['display-name'] || login);
  return {
    login,
    displayName: displayName || login,
    userId: cleanText(tags['user-id'] || override.userId || ''),
    badges,
    isBroadcaster: !!badges.broadcaster,
    isMod: !!badges.moderator || tags.mod === '1',
    isVip: !!badges.vip,
    isSubscriber: !!badges.subscriber || !!badges.founder || tags.subscriber === '1'
  };
}

function hasPermission(command, user) {
  const level = String(command.permissionLevel || 'everyone').trim().toLowerCase();
  if (!level || level === 'everyone' || level === 'all') return true;
  if (level === 'subscriber' || level === 'sub') return user.isSubscriber || user.isVip || user.isMod || user.isBroadcaster;
  if (level === 'vip') return user.isVip || user.isMod || user.isBroadcaster;
  if (level === 'mod' || level === 'moderator') return user.isMod || user.isBroadcaster;
  if (level === 'streamer' || level === 'broadcaster' || level === 'owner') return user.isBroadcaster;
  return false;
}

function cooldownKey(scope, command, userLogin = '') {
  return `${scope}:${command.trigger}:${userLogin || '*'}`;
}

function checkCooldown(command, user) {
  const now = Date.now();
  const globalMs = Math.max(0, Number(command.cooldownGlobalMs || 0));
  const userMs = Math.max(0, Number(command.cooldownUserMs || 0));

  const globalKey = cooldownKey('global', command);
  const userKey = cooldownKey('user', command, user.login || 'unknown');
  const lastGlobal = Number(state.cooldowns.get(globalKey) || 0);
  const lastUser = Number(state.cooldowns.get(userKey) || 0);

  if (globalMs > 0 && now - lastGlobal < globalMs) {
    return { ok: false, scope: 'global', waitMs: globalMs - (now - lastGlobal) };
  }
  if (userMs > 0 && now - lastUser < userMs) {
    return { ok: false, scope: 'user', waitMs: userMs - (now - lastUser) };
  }
  return { ok: true };
}

function markCooldown(command, user) {
  const now = Date.now();
  state.cooldowns.set(cooldownKey('global', command), now);
  state.cooldowns.set(cooldownKey('user', command, user.login || 'unknown'), now);
}

function logExecution(entry = {}) {
  try {
    ensureSchema();
    database.run(`
      INSERT INTO command_execution_log (
        trigger, alias_trigger, user_login, user_display_name, raw_message, args_json,
        module_key, action_key, target_url, success, ignored, error, result_json, created_at
      ) VALUES (
        :trigger, :aliasTrigger, :userLogin, :userDisplayName, :rawMessage, :argsJson,
        :moduleKey, :actionKey, :targetUrl, :success, :ignored, :error, :resultJson, :createdAt
      )
    `, {
      trigger: entry.trigger || '',
      aliasTrigger: entry.aliasTrigger || '',
      userLogin: entry.userLogin || '',
      userDisplayName: entry.userDisplayName || '',
      rawMessage: entry.rawMessage || '',
      argsJson: jsonEncode(entry.args || []),
      moduleKey: entry.moduleKey || '',
      actionKey: entry.actionKey || '',
      targetUrl: entry.targetUrl || '',
      success: entry.success ? 1 : 0,
      ignored: entry.ignored ? 1 : 0,
      error: entry.error || '',
      resultJson: jsonEncode(entry.result || {}),
      createdAt: nowIso()
    });
  } catch (err) {
    state.lastError = err?.message || String(err);
  }
}

function recentLogs(limit = 25) {
  ensureSchema();
  return database.all(`
    SELECT *
    FROM command_execution_log
    ORDER BY id DESC
    LIMIT :limit
  `, { limit: Math.max(1, Math.min(100, int(limit, 25))) }).map(row => ({
    id: Number(row.id),
    trigger: row.trigger || '',
    aliasTrigger: row.alias_trigger || '',
    userLogin: row.user_login || '',
    userDisplayName: row.user_display_name || '',
    rawMessage: row.raw_message || '',
    args: jsonDecode(row.args_json, []),
    moduleKey: row.module_key || '',
    actionKey: row.action_key || '',
    targetUrl: row.target_url || '',
    success: Number(row.success || 0) === 1,
    ignored: Number(row.ignored || 0) === 1,
    error: row.error || '',
    result: jsonDecode(row.result_json, {}),
    createdAt: row.created_at || ''
  }));
}

function httpJsonRequest(method, targetUrl, payload = {}) {
  const cleanUrl = cleanText(targetUrl);
  if (!cleanUrl) return Promise.reject(new Error('target_url_missing'));
  const body = JSON.stringify(payload);
  const options = {
    hostname: DEFAULT_TARGET_HOST,
    port: DEFAULT_TARGET_PORT,
    path: cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`,
    method: String(method || 'POST').trim().toUpperCase() || 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = data;
        try { parsed = data ? JSON.parse(data) : {}; } catch (_) {}
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ ok: true, statusCode: res.statusCode, data: parsed });
        } else {
          const err = new Error(`target_http_${res.statusCode}`);
          err.statusCode = res.statusCode;
          err.data = parsed;
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function buildTargetPayload(command, parsedCommand, user, source = {}) {
  const rawInput = `${parsedCommand.trigger}${parsedCommand.args.length ? ` ${parsedCommand.args.join(' ')}` : ''}`.trim();
  const payload = {
    command: command.trigger,
    cmd: command.trigger,
    rawInput,
    input: rawInput,
    rawMessage: parsedCommand.rawMessage,
    message: parsedCommand.rawMessage,
    args: parsedCommand.args,
    user: user.displayName || user.login,
    userName: user.displayName || user.login,
    userLogin: user.login,
    login: user.login,
    displayName: user.displayName || user.login,
    userDisplayName: user.displayName || user.login,
    source: source.source || 'command_system',
    channel: source.channel || '',
    chatOutput: true,
    sendChat: true,
    directSendEnabled: true,
    fallbackToStreamerbot: true
  };

  parsedCommand.args.slice(0, 10).forEach((arg, index) => {
    payload[`input${index}`] = arg;
  });

  return payload;
}

async function executeCommand(command, parsedCommand, user, source = {}) {
  const payload = buildTargetPayload(command, parsedCommand, user, source);
  if (!command.targetUrl) throw new Error('command_target_url_missing');
  const result = await httpJsonRequest(command.targetMethod || 'POST', command.targetUrl, payload);
  return result;
}

async function processMessage(input = {}, options = {}) {
  ensureSchema();
  if (state.enabled === false) {
    state.ignored += 1;
    return { ok: true, ignored: true, reason: 'command_system_disabled' };
  }

  const parsedCommand = parseChatMessage(input);
  if (!parsedCommand.isCommand) {
    state.ignored += 1;
    return { ok: true, ignored: true, reason: parsedCommand.reason || 'not_a_command' };
  }

  const match = getCommandByTrigger(parsedCommand.trigger);
  if (!match?.command) {
    state.ignored += 1;
    logExecution({
      trigger: parsedCommand.trigger,
      aliasTrigger: parsedCommand.trigger,
      rawMessage: parsedCommand.rawMessage,
      args: parsedCommand.args,
      ignored: true,
      error: 'unknown_command'
    });
    return { ok: true, ignored: true, reason: 'unknown_command', trigger: parsedCommand.trigger };
  }

  const command = match.command;
  const user = input.user || userFromParsed(input.parsed || {}, input);

  if (!command.enabled) {
    state.ignored += 1;
    logExecution({
      trigger: command.trigger,
      aliasTrigger: match.aliasTrigger,
      userLogin: user.login,
      userDisplayName: user.displayName,
      rawMessage: parsedCommand.rawMessage,
      args: parsedCommand.args,
      moduleKey: command.moduleKey,
      actionKey: command.actionKey,
      targetUrl: command.targetUrl,
      ignored: true,
      error: 'command_disabled'
    });
    return { ok: true, ignored: true, reason: 'command_disabled', command };
  }

  if (!hasPermission(command, user)) {
    state.ignored += 1;
    logExecution({
      trigger: command.trigger,
      aliasTrigger: match.aliasTrigger,
      userLogin: user.login,
      userDisplayName: user.displayName,
      rawMessage: parsedCommand.rawMessage,
      args: parsedCommand.args,
      moduleKey: command.moduleKey,
      actionKey: command.actionKey,
      targetUrl: command.targetUrl,
      ignored: true,
      error: 'permission_denied'
    });
    return { ok: false, ignored: true, reason: 'permission_denied', command: command.trigger };
  }

  const cooldown = checkCooldown(command, user);
  if (!cooldown.ok) {
    state.ignored += 1;
    logExecution({
      trigger: command.trigger,
      aliasTrigger: match.aliasTrigger,
      userLogin: user.login,
      userDisplayName: user.displayName,
      rawMessage: parsedCommand.rawMessage,
      args: parsedCommand.args,
      moduleKey: command.moduleKey,
      actionKey: command.actionKey,
      targetUrl: command.targetUrl,
      ignored: true,
      error: `cooldown_${cooldown.scope}`,
      result: cooldown
    });
    return { ok: false, ignored: true, reason: 'cooldown', cooldown, command: command.trigger };
  }

  if (options.dryRun) {
    return {
      ok: true,
      dryRun: true,
      parsed: parsedCommand,
      command,
      user,
      targetPayload: buildTargetPayload(command, parsedCommand, user, options)
    };
  }

  try {
    markCooldown(command, user);
    const result = await executeCommand(command, parsedCommand, user, options);
    state.handled += 1;
    state.executed += 1;
    state.lastCommandAt = nowIso();
    state.lastCommand = {
      trigger: command.trigger,
      aliasTrigger: match.aliasTrigger,
      userLogin: user.login,
      userDisplayName: user.displayName,
      rawMessage: parsedCommand.rawMessage,
      resultStatusCode: result.statusCode || null
    };
    logExecution({
      trigger: command.trigger,
      aliasTrigger: match.aliasTrigger,
      userLogin: user.login,
      userDisplayName: user.displayName,
      rawMessage: parsedCommand.rawMessage,
      args: parsedCommand.args,
      moduleKey: command.moduleKey,
      actionKey: command.actionKey,
      targetUrl: command.targetUrl,
      success: true,
      result
    });
    return { ok: true, command: command.trigger, matchedBy: match.matchedBy, result };
  } catch (err) {
    state.failed += 1;
    state.lastError = err?.message || String(err);
    logExecution({
      trigger: command.trigger,
      aliasTrigger: match.aliasTrigger,
      userLogin: user.login,
      userDisplayName: user.displayName,
      rawMessage: parsedCommand.rawMessage,
      args: parsedCommand.args,
      moduleKey: command.moduleKey,
      actionKey: command.actionKey,
      targetUrl: command.targetUrl,
      success: false,
      error: state.lastError,
      result: { statusCode: err.statusCode || null, data: err.data || null }
    });
    return { ok: false, command: command.trigger, error: state.lastError };
  }
}

async function handleChatMessage(parsed, source = {}) {
  if (!parsed || String(parsed.command || '').toUpperCase() !== 'PRIVMSG') return { ok: true, ignored: true, reason: 'not_privmsg' };
  const rawMessage = cleanText(parsed.params?.[1] || parsed.params?.[parsed.params.length - 1] || '');
  const user = userFromParsed(parsed, {});
  return processMessage({ rawMessage, parsed, user }, { source: source.source || 'twitch_presence', channel: source.channel || '' });
}

function statusPayload() {
  ensureSchema();
  return {
    ok: true,
    module: MODULE_NAME,
    version: 1,
    step: 'STEP273A',
    prefix: state.prefix,
    enabled: state.enabled,
    initialized: state.initialized,
    schemaOk: state.schemaOk,
    schemaError: state.schemaError,
    loadedAt: state.loadedAt,
    stats: {
      handled: state.handled,
      ignored: state.ignored,
      executed: state.executed,
      failed: state.failed,
      lastCommandAt: state.lastCommandAt,
      lastCommand: state.lastCommand,
      lastError: state.lastError
    },
    tables: ['command_definitions', 'command_execution_log'],
    routes: buildRoutes(),
    commands: listCommands({ includeDisabled: true }),
    recent: recentLogs(10),
    updatedAt: nowIso()
  };
}

function buildRoutes() {
  return [
    { method: 'GET', path: `${API_PREFIX}/status`, purpose: 'Command-System Status, Registry und letzte Logs' },
    { method: 'GET', path: `${API_PREFIX}/list`, purpose: 'Alle konfigurierten Commands auflisten' },
    { method: 'POST', path: `${API_PREFIX}/upsert`, purpose: 'Command anlegen oder aktualisieren' },
    { method: 'POST', path: `${API_PREFIX}/delete`, purpose: 'Command löschen' },
    { method: 'GET/POST', path: `${API_PREFIX}/test`, purpose: 'Chatnachricht trocken parsen und Zielpayload anzeigen' },
    { method: 'GET/POST', path: `${API_PREFIX}/execute`, purpose: 'Chatnachricht als Command ausführen' },
    { method: 'GET', path: `${API_PREFIX}/logs`, purpose: 'Letzte Command-Ausführungen anzeigen' }
  ];
}

function readMessageFromReq(req) {
  return cleanText(core.getParam(req, 'message', '') || core.getParam(req, 'rawMessage', '') || core.getParam(req, 'text', ''));
}

function readUserFromReq(req) {
  const login = cleanLogin(core.getParam(req, 'userLogin', '') || core.getParam(req, 'login', '') || core.getParam(req, 'user', 'testuser'));
  const displayName = cleanText(core.getParam(req, 'displayName', '') || core.getParam(req, 'userDisplayName', '') || login);
  const role = cleanText(core.getParam(req, 'role', 'everyone')).toLowerCase();
  return {
    login,
    displayName: displayName || login,
    userId: '',
    badges: role === 'mod' ? { moderator: '1' } : (role === 'vip' ? { vip: '1' } : (role === 'streamer' || role === 'owner' ? { broadcaster: '1' } : {})),
    isBroadcaster: role === 'streamer' || role === 'owner' || role === 'broadcaster',
    isMod: role === 'mod' || role === 'moderator',
    isVip: role === 'vip',
    isSubscriber: role === 'subscriber' || role === 'sub'
  };
}

module.exports.handleChatMessage = handleChatMessage;
module.exports.processMessage = processMessage;
module.exports.getStatus = statusPayload;

module.exports.init = function init(ctx) {
  const { app } = ctx;
  state.ctx = ctx;
  state.loadedAt = nowIso();
  state.initialized = true;
  state.prefix = cleanText(process.env.COMMAND_PREFIX || DEFAULT_PREFIX) || DEFAULT_PREFIX;
  state.enabled = !/^(0|false|no|off)$/i.test(String(process.env.COMMAND_SYSTEM_ENABLED || 'true'));
  ensureSchema();

  app.get(`${API_PREFIX}/status`, (req, res) => {
    try { return res.json(statusPayload()); }
    catch (err) { return res.status(500).json(core.fail(err.message || String(err))); }
  });

  app.get(`${API_PREFIX}/list`, (req, res) => {
    try { return res.json(core.ok({ commands: listCommands({ includeDisabled: bool(core.getParam(req, 'includeDisabled', true), true) }) })); }
    catch (err) { return res.status(500).json(core.fail(err.message || String(err))); }
  });

  app.post(`${API_PREFIX}/upsert`, (req, res) => {
    try { return res.json(core.ok(upsertCommand(req.body || req.query || {}))); }
    catch (err) { return res.status(400).json(core.fail(err.message || String(err))); }
  });

  app.post(`${API_PREFIX}/delete`, (req, res) => {
    try { return res.json(core.ok(deleteCommand(core.getParam(req, 'id', '') || core.getParam(req, 'trigger', '')))); }
    catch (err) { return res.status(400).json(core.fail(err.message || String(err))); }
  });

  async function handleTest(req, res) {
    try {
      const message = readMessageFromReq(req);
      const user = readUserFromReq(req);
      const result = await processMessage({ rawMessage: message, user }, { source: 'api_test', dryRun: true });
      return res.json(core.ok(result));
    } catch (err) {
      return res.status(500).json(core.fail(err.message || String(err)));
    }
  }

  async function handleExecute(req, res) {
    try {
      const message = readMessageFromReq(req);
      const user = readUserFromReq(req);
      const result = await processMessage({ rawMessage: message, user }, { source: 'api_execute' });
      return res.status(result.ok ? 200 : 409).json(result);
    } catch (err) {
      return res.status(500).json(core.fail(err.message || String(err)));
    }
  }

  app.get(`${API_PREFIX}/test`, handleTest);
  app.post(`${API_PREFIX}/test`, handleTest);
  app.get(`${API_PREFIX}/execute`, handleExecute);
  app.post(`${API_PREFIX}/execute`, handleExecute);

  app.get(`${API_PREFIX}/logs`, (req, res) => {
    try { return res.json(core.ok({ logs: recentLogs(core.getParam(req, 'limit', 25)) })); }
    catch (err) { return res.status(500).json(core.fail(err.message || String(err))); }
  });

  console.log('[commands] routes active: /api/commands/*');
};
