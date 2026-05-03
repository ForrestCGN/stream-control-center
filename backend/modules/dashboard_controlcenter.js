'use strict';

/**
 * Control-Center foundation routes.
 * STEP007: Config-/Status-Endpunkte für Navigation, Rollen, Stream-Desk und Logging-Vorbereitung.
 * Muss im echten server.js noch sauber registriert werden.
 */

const fs = require('fs');
const path = require('path');

function readJsonSafe(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return { ok:false, error:'json_read_failed', filePath, message: err.message, fallback };
  }
}

function resolveConfigDir(options = {}) {
  if (options.configDir) return options.configDir;
  if (process.env.STRAMASSETS_CONFIG_DIR) return process.env.STRAMASSETS_CONFIG_DIR;
  return path.resolve(process.cwd(), '..', 'config');
}

function register(app, options = {}) {
  const configDir = resolveConfigDir(options);

  function cfg(name, fallback) {
    return readJsonSafe(path.join(configDir, name), fallback);
  }

  app.get('/api/dashboard/controlcenter/status', (req, res) => {
    res.json({
      ok: true,
      module: 'dashboard_controlcenter',
      step: '007',
      configDir,
      files: {
        navigation: fs.existsSync(path.join(configDir, 'dashboard_navigation.json')),
        roles: fs.existsSync(path.join(configDir, 'dashboard_roles.json')),
        permissions: fs.existsSync(path.join(configDir, 'dashboard_permissions.json')),
        access: fs.existsSync(path.join(configDir, 'dashboard_access.json')),
        streamdesk: fs.existsSync(path.join(configDir, 'streamdesk.json')),
        twitchDashboardAuth: fs.existsSync(path.join(configDir, 'twitch_dashboard_auth.json')),
        dashboardLogging: fs.existsSync(path.join(configDir, 'dashboard_logging.json')),
        adminConfigs: fs.existsSync(path.join(configDir, 'dashboard_admin_configs.json')),
        envStrategy: fs.existsSync(path.join(configDir, 'dashboard_env_strategy.json')),
        backendGeneral: fs.existsSync(path.join(configDir, 'dashboard_backend_general.json'))
      }
    });
  });

  app.get('/api/dashboard/controlcenter/navigation', (req, res) => {
    res.json({ ok:true, navigation: cfg('dashboard_navigation.json', { groups: [] }) });
  });

  app.get('/api/dashboard/controlcenter/roles', (req, res) => {
    const roles = cfg('dashboard_roles.json', { roles: {} });
    // Keine Secrets/Tokens enthalten; Rollen dürfen im Dashboard lesbar sein.
    res.json({ ok:true, roles });
  });

  app.get('/api/dashboard/controlcenter/permissions', (req, res) => {
    res.json({ ok:true, permissions: cfg('dashboard_permissions.json', {}) });
  });

  app.get('/api/dashboard/controlcenter/access', (req, res) => {
    res.json({ ok:true, access: cfg('dashboard_access.json', {}) });
  });

  app.get('/api/dashboard/controlcenter/streamdesk', (req, res) => {
    res.json({ ok:true, config: cfg('streamdesk.json', {}) });
  });

  app.get('/api/dashboard/controlcenter/twitch-auth', (req, res) => {
    res.json({ ok:true, twitchAuth: cfg('twitch_dashboard_auth.json', { enabled:false, mode:'prepared_only' }) });
  });

  app.get('/api/dashboard/controlcenter/logging', (req, res) => {
    res.json({ ok:true, logging: cfg('dashboard_logging.json', { enabled:false, preparedOnly:true }) });
  });


  app.get('/api/dashboard/controlcenter/admin-configs', (req, res) => {
    const registry = cfg('dashboard_admin_configs.json', { schemaVersion:1, mode:'prepared_only', writeEnabled:false, configs:[], secrets:[] });
    if (Array.isArray(registry.secrets)) {
      registry.secrets = registry.secrets.map(secret => ({ id: secret.id, label: secret.label, storage: secret.storage, masked: secret.masked || '********', replacePrepared: !!secret.replacePrepared }));
    }
    res.json({ ok:true, ...registry });
  });

  app.get('/api/dashboard/controlcenter/config/:id', (req, res) => {
    const id = String(req.params.id || '').trim();
    const registry = cfg('dashboard_admin_configs.json', { configs: [] });
    const item = Array.isArray(registry.configs) ? registry.configs.find(entry => entry.id === id) : null;
    if (!item || item.read !== true) return res.status(404).json({ ok:false, error:'config_not_allowed', id });
    const filePath = path.join(configDir, item.path);
    const data = readJsonSafe(filePath, null);
    res.json({ ok:true, id, label:item.label, path:item.displayPath || ('config/' + item.path), writable:!!item.writePrepared, writeEnabled:false, preparedOnly:true, config:data });
  });

  app.post('/api/dashboard/controlcenter/config/:id', (req, res) => {
    res.status(403).json({ ok:false, error:'config_write_not_enabled', message:'Config-Schreiben ist vorbereitet, aber noch nicht live aktiviert.' });
  });

  return { name: 'dashboard_controlcenter', step: '007' };
}

function init(ctx) {
  return register(ctx.app, ctx);
}

module.exports = { register, init };
