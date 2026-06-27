'use strict';

const { createApp } = require('./src/app');
const { loadConfig } = require('./src/services/config.service');
const { registerAgentRuntime } = require('./src/services/agent-runtime.service');

const APP_VERSION = '0.2.5';
const BUILD_NAME = 'Lokales Dashboard vorbereitet';
const STEP_REF = 'RDAP127_LOCAL_DASHBOARD_FOUNDATION';
const MODULE_BUILD = BUILD_NAME;

async function main() {
  const config = loadConfig();
  const app = createApp({ config, moduleBuild: MODULE_BUILD, appVersion: APP_VERSION, buildName: BUILD_NAME, stepRef: STEP_REF });
  const server = app.listen(config.port, config.host, () => {
    console.log(`[remote-modboard] v${APP_VERSION} - ${BUILD_NAME} listening on http://${config.host}:${config.port}`);
    console.log(`[remote-modboard] runtimeMode=${config.runtimeMode} localLan=${config.localLan && config.localLan.lanUseAllowed ? 'prepared' : 'disabled'} localDashboard=readonly-prepared streaming-pc-connection=true component-status=readonly obs-status=readonly actions=false remoteWritesControlled=true`);
  });

  registerAgentRuntime(server, config, { moduleBuild: MODULE_BUILD, appVersion: APP_VERSION, buildName: BUILD_NAME, stepRef: STEP_REF });

  process.on('SIGTERM', () => shutdown(server, 'SIGTERM'));
  process.on('SIGINT', () => shutdown(server, 'SIGINT'));
}

function shutdown(server, signal) {
  console.log(`[remote-modboard] ${signal} received, shutting down.`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}

main().catch(err => {
  console.error('[remote-modboard] startup_failed');
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
