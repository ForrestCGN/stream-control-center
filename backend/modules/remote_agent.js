'use strict';

let routes = null;
try {
  routes = require('./helpers/helper_routes');
} catch (err) {
  routes = null;
}

const MODULE = 'remote_agent';
const MODULE_VERSION = '0.0.2';
const MODULE_BUILD = 'RDAP4B_REMOTE_AGENT_PERMISSION_LOCK_AUDIT_READONLY';
const STATUS_API_VERSION = 'rdap4b.v1';
const LOADED_AT = new Date().toISOString();

const MODULE_META = {
  name: MODULE,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: 'runtime',
  category: 'remote-dashboard',
  description: 'Read-only Remote-Agent status and security model contract for Dashboard-v2. No WSS agent runtime and no productive actions in RDAP4B.',
  routesPrefix: ['/api/remote-agent'],
  bus: {
    registered: false,
    heartbeat: false,
    emits: [],
    listens: []
  },
  legacy: false
};

const CAPABILITIES = Object.freeze({
  status: true,
  ping: false,
  statusRequest: false,
  permissionsModel: true,
  locksStatus: true,
  auditModel: true,
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
});

const ROLES = Object.freeze([
  {
    key: 'owner',
    label: 'Owner',
    purpose: 'Vollzugriff, System-/Security-Hoheit und Notfalluebernahme.',
    criticalLimits: ['nur sehr begrenzt vergeben', 'alle kritischen Aenderungen auditpflichtig']
  },
  {
    key: 'admin',
    label: 'Admin',
    purpose: 'Verwaltung freigegebener Module, Benutzer und Einstellungen.',
    criticalLimits: ['keine Owner-Sonderrechte ohne explizite Permission', 'keine freie Shell-/Datei-/Prozesssteuerung']
  },
  {
    key: 'lead_mod',
    label: 'Lead-Mod',
    purpose: 'Erweiterte Mod-Team-Funktionen und ausgewaehlte Modulverwaltung.',
    criticalLimits: ['keine System-/Security-Rechte']
  },
  {
    key: 'mod',
    label: 'Mod',
    purpose: 'Normale Stream-/Mod-Bedienung und freigegebene Event-Bedienung.',
    criticalLimits: ['keine globalen Config-/Security-Rechte']
  },
  {
    key: 'sound_profi',
    label: 'Sound-Profi',
    purpose: 'Begrenzte Sound-, Media-, Command- und Kanalpunkte-Pflege.',
    criticalLimits: ['keine System-/Security-/Owner-Rechte', 'keine freien Dateipfade', 'keine Datenbankmigrationen']
  },
  {
    key: 'media_manager',
    label: 'Media Manager',
    purpose: 'Optionale Medienpflege, falls spaeter getrennt benoetigt.',
    criticalLimits: ['keine Systemrechte']
  },
  {
    key: 'readonly',
    label: 'Read-only',
    purpose: 'Nur-Lesen-Zugriff.',
    criticalLimits: ['keine produktiven Aktionen']
  }
]);

const PERMISSIONS = Object.freeze([
  { key: 'dashboard.read', label: 'Dashboard lesen', area: 'dashboard', protectionLevel: 'low' },
  { key: 'admin.audit.read', label: 'Audit lesen', area: 'admin', protectionLevel: 'medium' },
  { key: 'admin.users.manage', label: 'Benutzer verwalten', area: 'admin', protectionLevel: 'critical' },
  { key: 'admin.roles.manage', label: 'Rollen/Rechte verwalten', area: 'admin', protectionLevel: 'critical' },
  { key: 'locks.read', label: 'Locks lesen', area: 'locks', protectionLevel: 'low' },
  { key: 'locks.create', label: 'Locks erstellen', area: 'locks', protectionLevel: 'medium' },
  { key: 'locks.heartbeat', label: 'Lock-Heartbeat senden', area: 'locks', protectionLevel: 'medium' },
  { key: 'locks.release', label: 'Locks freigeben', area: 'locks', protectionLevel: 'medium' },
  { key: 'locks.takeover', label: 'Locks uebernehmen', area: 'locks', protectionLevel: 'critical' },
  { key: 'texts.read', label: 'Texte lesen', area: 'texts', protectionLevel: 'low' },
  { key: 'texts.edit', label: 'Texte bearbeiten', area: 'texts', protectionLevel: 'medium' },
  { key: 'config.read', label: 'Configs lesen', area: 'config', protectionLevel: 'low' },
  { key: 'config.edit', label: 'Configs bearbeiten', area: 'config', protectionLevel: 'high' },
  { key: 'media.read', label: 'Media lesen', area: 'media', protectionLevel: 'low' },
  { key: 'media.upload', label: 'Media hochladen', area: 'media', protectionLevel: 'medium' },
  { key: 'media.edit', label: 'Media bearbeiten', area: 'media', protectionLevel: 'medium' },
  { key: 'media.delete', label: 'Media loeschen', area: 'media', protectionLevel: 'high' },
  { key: 'sound.read', label: 'Sounds lesen', area: 'sound', protectionLevel: 'low' },
  { key: 'sound.test', label: 'Sounds testen', area: 'sound', protectionLevel: 'medium' },
  { key: 'sound.command.edit', label: 'Sound-Commands bearbeiten', area: 'sound', protectionLevel: 'high' },
  { key: 'channelpoints.edit', label: 'Kanalpunkte-Aktionen bearbeiten', area: 'twitch', protectionLevel: 'high' },
  { key: 'obs.control', label: 'OBS steuern', area: 'obs', protectionLevel: 'critical' },
  { key: 'overlay.control', label: 'Overlays steuern', area: 'overlays', protectionLevel: 'critical' },
  { key: 'agent.action.requested', label: 'Agent-Aktion anfordern', area: 'agent', protectionLevel: 'critical' },
  { key: 'agent.status.read', label: 'Agent-Status lesen', area: 'agent', protectionLevel: 'low' }
]);

const ROLE_PERMISSION_PRESETS = Object.freeze({
  owner: ['*'],
  admin: [
    'dashboard.read', 'admin.audit.read', 'admin.users.manage', 'locks.read', 'locks.create',
    'locks.heartbeat', 'locks.release', 'locks.takeover', 'texts.read', 'texts.edit',
    'config.read', 'config.edit', 'media.read', 'media.upload', 'media.edit', 'media.delete',
    'sound.read', 'sound.test', 'sound.command.edit', 'channelpoints.edit', 'agent.status.read'
  ],
  lead_mod: [
    'dashboard.read', 'locks.read', 'locks.create', 'locks.heartbeat', 'locks.release',
    'texts.read', 'texts.edit', 'config.read', 'media.read', 'sound.read', 'sound.test',
    'agent.status.read'
  ],
  mod: ['dashboard.read', 'locks.read', 'texts.read', 'config.read', 'media.read', 'sound.read', 'agent.status.read'],
  sound_profi: [
    'dashboard.read', 'locks.read', 'locks.create', 'locks.heartbeat', 'locks.release',
    'media.read', 'media.upload', 'media.edit', 'media.delete', 'sound.read', 'sound.test',
    'sound.command.edit', 'channelpoints.edit', 'texts.read', 'config.read', 'agent.status.read'
  ],
  media_manager: ['dashboard.read', 'locks.read', 'locks.create', 'locks.heartbeat', 'locks.release', 'media.read', 'media.upload', 'media.edit', 'texts.read', 'agent.status.read'],
  readonly: ['dashboard.read', 'locks.read', 'texts.read', 'config.read', 'media.read', 'sound.read', 'agent.status.read']
});

const LOCK_MODEL = Object.freeze({
  enabled: false,
  readOnlyPreview: true,
  activeLocks: [],
  plannedResourceKeyFormat: '<bereich>:<modul>:<resource-id>',
  plannedStates: ['free', 'locked', 'expired', 'takeover_requested', 'takeover_done'],
  heartbeatIntervalSec: 20,
  timeoutSec: 90,
  takeoverAllowedFor: ['owner', 'admin'],
  versionCheckRequired: true,
  saveRequiresValidLock: true,
  sharedReadWhileLocked: true,
  notes: [
    'RDAP4B stellt nur das Modell bereit; es setzt noch keine produktiven Locks.',
    'Speichern soll spaeter nur mit gueltigem Lock und passender Resource-Version erlaubt sein.',
    'Owner/Admin duerfen Locks spaeter uebernehmen; jede Uebernahme ist auditpflichtig.'
  ]
});

const AUDIT_MODEL = Object.freeze({
  enabled: false,
  readOnlyPreview: true,
  retentionConfigurable: true,
  minimumFields: [
    'auditId', 'timestamp', 'actorUserId', 'actorDisplayName', 'source', 'action',
    'permission', 'resourceKey', 'oldValueSummary', 'newValueSummary', 'status',
    'requestId', 'correlationId'
  ],
  plannedEventTypes: [
    'permission.check',
    'locks.create',
    'locks.heartbeat',
    'locks.release',
    'locks.takeover',
    'resource.save.requested',
    'resource.save.succeeded',
    'resource.save.failed',
    'agent.action.requested',
    'agent.action.accepted',
    'agent.action.rejected',
    'agent.action.failed'
  ],
  sources: ['dashboard-local', 'remote-modboard', 'webserver', 'stream-pc-agent'],
  notes: [
    'RDAP4B schreibt noch keine Audit-Daten.',
    'Produktive Aenderungen muessen spaeter auditpflichtig sein.',
    'Sensible Werte duerfen nur maskiert oder zusammengefasst im Audit landen.'
  ]
});

function init(ctx) {
  const app = ctx && ctx.app;
  if (!app) return;

  registerGet(app, '/api/remote-agent/status', (req, res) => {
    res.json(buildStatusResponse());
  });

  registerGet(app, '/api/remote-agent/permissions/model', (req, res) => {
    res.json(buildPermissionsModelResponse());
  });

  registerGet(app, '/api/remote-agent/locks/status', (req, res) => {
    res.json(buildLocksStatusResponse());
  });

  registerGet(app, '/api/remote-agent/audit/model', (req, res) => {
    res.json(buildAuditModelResponse());
  });

  registerGet(app, '/api/remote-agent/routes', (req, res) => {
    res.json(buildRoutesResponse());
  });

  console.log(`[remote_agent] ${MODULE_BUILD} read-only status/security model routes registered. No agent actions enabled.`);
}

function registerGet(app, routePath, handler) {
  if (routes && typeof routes.registerGet === 'function') {
    routes.registerGet(app, routePath, handler);
    return;
  }
  app.get(routePath, handler);
}

function buildBaseResponse(extra = {}) {
  return {
    ok: true,
    module: MODULE,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    readOnly: true,
    writeEnabled: false,
    actionEnabled: false,
    productiveAgentRuntime: false,
    generatedAt: new Date().toISOString(),
    loadedAt: LOADED_AT,
    ...extra
  };
}

function buildStatusResponse() {
  const now = new Date().toISOString();

  return buildBaseResponse({
    status: {
      connected: false,
      connectionState: 'offline',
      reason: 'rdap4b_no_agent_runtime_yet',
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
      protocolVersion: STATUS_API_VERSION,
      expectedAgentId: 'stream-pc-main',
      expectedAgentName: 'Forrest Stream-PC'
    },
    host: {
      dashboardServer: 'local-stream-control-center',
      hostname: safeHostname(),
      platform: process.platform,
      nodeVersion: process.version,
      processUptimeSec: Math.floor(process.uptime()),
      localTime: now
    },
    remoteTarget: {
      publicDashboardUrl: 'https://mods.forrestcgn.de',
      plannedTransport: 'wss',
      plannedWsPath: '/agent-ws',
      streamPcPublicPortRequired: false
    },
    capabilities: { ...CAPABILITIES },
    safety: buildSafetyBlock(),
    warnings: [
      'RDAP4B erweitert RDAP3A um read-only Permission-/Lock-/Audit-Modellrouten.',
      'Es existiert in diesem Step noch kein produktiver WSS-Agent.',
      'Alle produktiven Aktionen bleiben deaktiviert.'
    ],
    errors: []
  });
}

function buildPermissionsModelResponse() {
  return buildBaseResponse({
    modelApiVersion: 'permissions.rdap4b.v1',
    permissionDecisionRule: 'roles are presets; concrete permission keys decide',
    twitchRolesAreNotDashboardRoles: true,
    roles: ROLES.map(clonePlain),
    permissions: PERMISSIONS.map(clonePlain),
    rolePermissionPresets: clonePlain(ROLE_PERMISSION_PRESETS),
    specialRoles: {
      sound_profi: {
        label: 'Sound-Profi',
        may: [
          'Media/Sounds hochladen',
          'Media/Sounds bearbeiten',
          'Sounds testen',
          'Sounds zuordnen',
          'Sound-Commands bearbeiten',
          'Kanalpunkte-Aktionen fuer Sound-/Media-Funktionen bearbeiten'
        ],
        mayNot: [
          'Owner-/Security-Rechte verwalten',
          'Agent-Secrets verwalten',
          'freie Shell-/Datei-/Prozessaktionen ausloesen',
          'Datenbankmigrationen starten',
          'globale System-Konfiguration aendern'
        ]
      }
    },
    warnings: [
      'Diese Route liefert nur das Modell. Es gibt noch keine produktive User-/Role-/Grant-Speicherung.',
      'Permissions muessen spaeter serverseitig geprueft werden; Frontend-Anzeigen sind nie Sicherheitsentscheidung.'
    ]
  });
}

function buildLocksStatusResponse() {
  return buildBaseResponse({
    modelApiVersion: 'locks.rdap4b.v1',
    locks: clonePlain(LOCK_MODEL),
    activeLocks: [],
    summary: {
      enabled: false,
      activeLockCount: 0,
      staleLockCount: 0,
      takeoverPendingCount: 0
    },
    warnings: [
      'RDAP4B liefert nur den geplanten Lock-Status. Es werden noch keine Locks erstellt oder gespeichert.',
      'Produktives Speichern darf spaeter nur mit gueltigem Lock und Resource-Version erfolgen.'
    ]
  });
}

function buildAuditModelResponse() {
  return buildBaseResponse({
    modelApiVersion: 'audit.rdap4b.v1',
    audit: clonePlain(AUDIT_MODEL),
    summary: {
      enabled: false,
      recentEventsAvailable: false,
      retentionConfigurable: true
    },
    warnings: [
      'RDAP4B schreibt noch keine Audit-Events.',
      'Produktive Remote-/Dashboard-Aktionen muessen spaeter Audit schreiben, bevor sie als fertig gelten.'
    ]
  });
}

function buildRoutesResponse() {
  return buildBaseResponse({
    routes: [
      {
        method: 'GET',
        path: '/api/remote-agent/status',
        description: 'Read-only Remote-Agent Status. Liefert echten Offline-Startzustand und fuehrt keine Aktionen aus.'
      },
      {
        method: 'GET',
        path: '/api/remote-agent/permissions/model',
        description: 'Read-only Rollen-/Permission-Modell fuer RDAP4B. Keine User-/Grant-Schreiboperation.'
      },
      {
        method: 'GET',
        path: '/api/remote-agent/locks/status',
        description: 'Read-only Lock-Modell und aktueller Null-Status. Keine Lock-Schreiboperation.'
      },
      {
        method: 'GET',
        path: '/api/remote-agent/audit/model',
        description: 'Read-only Audit-Modell fuer spaetere produktive Aktionen. Keine Audit-Schreiboperation.'
      },
      {
        method: 'GET',
        path: '/api/remote-agent/routes',
        description: 'Read-only Routenuebersicht fuer RDAP4B.'
      }
    ]
  });
}

function buildSafetyBlock() {
  return {
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
  };
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeHostname() {
  try {
    return require('os').hostname();
  } catch (err) {
    return 'unknown';
  }
}

module.exports = {
  MODULE_META,
  MODULE_VERSION,
  version: MODULE_VERSION,
  init,
  buildStatusResponse,
  buildPermissionsModelResponse,
  buildLocksStatusResponse,
  buildAuditModelResponse
};
