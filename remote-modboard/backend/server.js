'use strict';

const { createApp } = require('./src/app');
const { loadConfig } = require('./src/services/config.service');
const { registerAgentRuntime } = require('./src/services/agent-runtime.service');

const MODULE_BUILD = 'RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS';

async function main() {
  const config = loadConfig();
  const app = createApp({ config, moduleBuild: MODULE_BUILD });
  const server = app.listen(config.port, config.host, () => {
    console.log(`[remote-modboard] ${MODULE_BUILD} listening on http://${config.host}:${config.port}`);
    console.log('[remote-modboard] admin-note-create-write-confirmed=true admin-note-update=false admin-note-deactivate=false uiWriteButtons=false remoteWritesControlled=true agentActions=false');
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
