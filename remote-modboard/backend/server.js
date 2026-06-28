'use strict';

const { createApp } = require('./src/app');
const { loadConfig } = require('./src/services/config.service');
const { registerAgentRuntime } = require('./src/services/agent-runtime.service');

const APP_VERSION = '0.2.16';
const BUILD_NAME = 'Lokale OBS-Inventarquelle read-only vorbereitet';
const STEP_REF = 'RDAP_0.2.16_LOCAL_OBS_INVENTORY_SOURCE_READONLY_PREPARED';
const MODULE_BUILD = STEP_REF;

async function main() {
  const config = loadConfig();
  const app = createApp({ config, moduleBuild: MODULE_BUILD, appVersion: APP_VERSION, buildName: BUILD_NAME, stepRef: STEP_REF });
  const server = app.listen(config.port, config.host, () => {
    console.log(`[remote-modboard] v${APP_VERSION} - ${BUILD_NAME} listening on http://${config.host}:${config.port}`);
    console.log('[remote-modboard] runtimeMode=' + config.runtimeMode + ' obsLocalInventorySourceReadonlyPrepared=true actions=false remoteWritesControlled=true');
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
