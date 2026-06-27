'use strict';

const { createApp } = require('./src/app');
const { loadConfig } = require('./src/services/config.service');
const { registerAgentRuntime } = require('./src/services/agent-runtime.service');

const MODULE_BUILD = 'RDAP121_STREAMING_PC_COMPONENT_STATUS_READONLY';

async function main() {
  const config = loadConfig();
  const app = createApp({ config, moduleBuild: MODULE_BUILD });
  const server = app.listen(config.port, config.host, () => {
    console.log(`[remote-modboard] ${MODULE_BUILD} listening on http://${config.host}:${config.port}`);
    console.log('[remote-modboard] streaming-pc-connection=true component-status=readonly actions=false remoteWritesControlled=true');
  });

  registerAgentRuntime(server, config, { moduleBuild: MODULE_BUILD });

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
