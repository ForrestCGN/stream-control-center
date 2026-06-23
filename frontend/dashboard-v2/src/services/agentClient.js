import { apiRequest } from './apiClient.js';

export async function getRemoteAgentStatus() {
  return apiRequest('/api/remote-agent/status');
}

export async function getRemoteAgentPermissionsModel() {
  return apiRequest('/api/remote-agent/permissions/model');
}

export async function getRemoteAgentLocksStatus() {
  return apiRequest('/api/remote-agent/locks/status');
}

export async function getRemoteAgentAuditModel() {
  return apiRequest('/api/remote-agent/audit/model');
}

export async function getRemoteAgentRoutes() {
  return apiRequest('/api/remote-agent/routes');
}

export function getRemoteAgentStatusFallback() {
  return {
    ok: false,
    module: 'remote_agent',
    moduleVersion: 'unknown',
    moduleBuild: 'frontend_fallback',
    statusApiVersion: 'unknown',
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
      permissionsModel: false,
      locksStatus: false,
      auditModel: false,
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
      noShellOrProcessActions: true,
      noAgentActionExecution: true
    },
    warnings: ['API-Daten konnten im Frontend noch nicht geladen werden.'],
    errors: []
  };
}

export function getRemoteAgentPermissionsModelFallback() {
  return {
    ok: false,
    module: 'remote_agent',
    modelApiVersion: 'permissions.fallback',
    readOnly: true,
    writeEnabled: false,
    actionEnabled: false,
    productiveAgentRuntime: false,
    permissionDecisionRule: 'nicht geladen',
    twitchRolesAreNotDashboardRoles: true,
    roles: [],
    permissions: [],
    rolePermissionPresets: {},
    specialRoles: {
      sound_profi: {
        label: 'Sound-Profi',
        may: [],
        mayNot: []
      }
    },
    warnings: ['Permissions-Modell konnte im Frontend noch nicht geladen werden.']
  };
}

export function getRemoteAgentLocksStatusFallback() {
  return {
    ok: false,
    module: 'remote_agent',
    modelApiVersion: 'locks.fallback',
    readOnly: true,
    writeEnabled: false,
    actionEnabled: false,
    productiveAgentRuntime: false,
    locks: {
      enabled: false,
      readOnlyPreview: true,
      activeLocks: [],
      plannedResourceKeyFormat: '<bereich>:<modul>:<resource-id>',
      plannedStates: [],
      heartbeatIntervalSec: null,
      timeoutSec: null,
      takeoverAllowedFor: [],
      versionCheckRequired: true,
      saveRequiresValidLock: true,
      sharedReadWhileLocked: true,
      notes: []
    },
    activeLocks: [],
    summary: {
      enabled: false,
      activeLockCount: 0,
      staleLockCount: 0,
      takeoverPendingCount: 0
    },
    warnings: ['Lock-Modell konnte im Frontend noch nicht geladen werden.']
  };
}

export function getRemoteAgentAuditModelFallback() {
  return {
    ok: false,
    module: 'remote_agent',
    modelApiVersion: 'audit.fallback',
    readOnly: true,
    writeEnabled: false,
    actionEnabled: false,
    productiveAgentRuntime: false,
    audit: {
      enabled: false,
      readOnlyPreview: true,
      retentionConfigurable: true,
      minimumFields: [],
      plannedEventTypes: [],
      sources: [],
      notes: []
    },
    summary: {
      enabled: false,
      recentEventsAvailable: false,
      retentionConfigurable: true
    },
    warnings: ['Audit-Modell konnte im Frontend noch nicht geladen werden.']
  };
}

export function getRemoteAgentRoutesFallback() {
  return {
    ok: false,
    module: 'remote_agent',
    readOnly: true,
    writeEnabled: false,
    actionEnabled: false,
    productiveAgentRuntime: false,
    routes: [],
    warnings: ['Routenmodell konnte im Frontend noch nicht geladen werden.']
  };
}
