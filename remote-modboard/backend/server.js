'use strict';

const { createApp } = require('./src/app');
const { loadConfig } = require('./src/services/config.service');

const MODULE_BUILD = 'RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS';

async function main() {
  const config = loadConfig();
  const app = createApp({ config, moduleBuild: MODULE_BUILD });

  const server = app.listen(config.port, config.host, () => {
    console.log(`[remote-modboard] ${MODULE_BUILD} listening on http://${config.host}:${config.port}`);
    console.log('[remote-modboard] read-only=true writeEnabled=false authEnabled=false sessionCreationEnabled=false agentActionsEnabled=false');
  });

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
