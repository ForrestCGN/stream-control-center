import { apiRequest } from './apiClient.js';

export async function getRemoteAgentStatus() {
  return apiRequest('/api/remote-agent/status');
}

export function getRemoteAgentStatusFallback() {
  return {
    ok: false,
    module: 'remote_agent',
    moduleVersion: 'unknown',
    moduleBuild: 'frontend_fallback',
    readOnly: true,
    writeEnabled: false,
    actionEnabled: false,
    productiveAgentRuntime: false,
    status: {
      connected: false,
      connectionState: 'unknown',
      reason: 'frontend_fallback_no_api_data',
      lastSeenAt: null,
      connectedSince: null,
      heartbeatAgeMs: null,
      reconnectCount: 0,
      stale: false
    },
    agent: {
      agentId: null,
      agentName: null,
      agentVersion: null,
      protocolVersion: 'unknown',
      expectedAgentId: 'stream-pc-main',
      expectedAgentName: 'Forrest Stream-PC'
    },
    host: null,
    remoteTarget: {
      publicDashboardUrl: 'https://mods.forrestcgn.de',
      plannedTransport: 'wss',
      plannedWsPath: '/agent-ws',
      streamPcPublicPortRequired: false
    },
    capabilities: {
      status: true,
      ping: false,
      statusRequest: false,
      obsControl: false,
      soundControl: false,
      overlayControl: false,
      mediaWrite: false,
      textConfigWrite: false,
      commandControl: false,
      databaseWrite: false,
      fileWrite: false,
      shell: false,
      processControl: false
    },
    safety: {
      noSoundControl: true,
      noObsControl: true,
      noOverlayControl: true,
      noMediaWrite: true,
      noTextConfigWrite: true,
      noCommandsOrChannelpoints: true,
      noDatabaseWrite: true,
      noFileWrite: true,
      noShellOrProcessActions: true
    },
    warnings: ['API-Daten konnten im Frontend noch nicht geladen werden.'],
    errors: []
  };
}
