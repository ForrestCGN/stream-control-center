// modules/security.js — Security diagnostics and later central security routes
'use strict';

const security = require('./helpers/helper_security');
const routes = require('./helpers/helper_routes');

const MODULE_VERSION = '0.1.0';
const MODULE_META = {
  name: 'security',
  version: MODULE_VERSION,
  type: 'runtime',
  category: 'security',
  routesPrefix: ['/api/security/status'],
  bus: {
    emits: [],
    listens: [],
    heartbeat: false
  },
  legacy: false
};

function buildSecurityStatus(req) {
  const cfg = security.loadSecurityConfig();
  const clientIp = security.getClientIp(req, cfg);
  const authValue = security.getAuthFromRequest(req, cfg);
  const configuredTokens = security.getConfiguredAuthTokens(cfg);
  const access = security.canAccess(req, { config: cfg });

  return {
    ok: true,
    module: MODULE_META.name,
    route: '/api/security/status',
    ts: Date.now(),
    config: {
      enabled: !!cfg.enabled,
      configPath: security.getSecurityConfigPath(),
      allowLocalhostWithoutAuth: !!cfg.allowLocalhostWithoutAuth,
      allowConfiguredNetworksWithoutAuth: !!cfg.allowConfiguredNetworksWithoutAuth,
      allowAllPrivateNetworksWithoutAuth: !!cfg.allowAllPrivateNetworksWithoutAuth,
      allowedNetworks: cfg.allowedNetworks || [],
      requireAuthForExternal: !!cfg.requireAuthForExternal,
      blockExternalWithoutAuth: !!cfg.blockExternalWithoutAuth,
      trustedProxyHeaders: !!cfg.trustedProxyHeaders,
      authParamNames: cfg.authParamNames || [],
      authHeaderNames: cfg.authHeaderNames || [],
      envAuthNames: cfg.envAuthNames || []
    },
    request: {
      clientIp,
      isLocalhost: security.isLocalhostIp(clientIp),
      isAllowedNetwork: security.isAllowedNetworkIp(clientIp, cfg),
      isAllowedLocalRequest: security.isAllowedLocalRequest(req, cfg),
      authProvided: !!authValue,
      authValid: security.hasValidAuth(req, cfg),
      configuredAuthTokenCount: configuredTokens.length,
      accessAllowed: !!access.allowed,
      accessReason: access.reason
    },
    note: 'Diagnose-Route. Schaltet noch keine produktive Route frei oder um.'
  };
}

module.exports.init = function init(ctx) {
  const { app } = ctx;

  routes.registerGet(app, '/api/security/status', (req, res) => {
    res.json(buildSecurityStatus(req));
  });

  console.log(`[${MODULE_META.name}] v${MODULE_VERSION} /api/security/status aktiv`);
};

module.exports.MODULE_META = MODULE_META;
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.version = MODULE_VERSION;
