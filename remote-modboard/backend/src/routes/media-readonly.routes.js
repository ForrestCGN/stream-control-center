'use strict';

const STATUS_API_VERSION = 'rdap_media_readonly_foundation_024.v1';
const BUILD = 'RDAP_0.2.24_MEDIA_READONLY_FOUNDATION';
const MEDIA_STATUS_PATH = '/api/remote/media/status';

const MEDIA_ALLOWED_EXTENSIONS = Object.freeze(['.mp3', '.wav', '.ogg', '.webm', '.m4a', '.mp4', '.png', '.jpg', '.jpeg', '.webp', '.gif']);
const MEDIA_PLANNED_ROOTS = Object.freeze([
  { key: 'sounds', label: 'Sounds', localPathHint: 'htdocs/assets/sounds', types: ['audio', 'video'] },
  { key: 'videos', label: 'Videos', localPathHint: 'htdocs/assets/videos', types: ['video'] },
  { key: 'images', label: 'Bilder', localPathHint: 'htdocs/assets/images', types: ['image'] }
]);

function registerMediaReadonlyRoutes(app, context) {
  app.get(MEDIA_STATUS_PATH, (req, res) => {
    void req;
    res.json(buildMediaReadonlyStatus(context));
  });
}

function buildMediaReadonlyStatus(context = {}) {
  const runtimeMode = context && context.config && context.config.runtimeMode ? String(context.config.runtimeMode) : 'online';
  const generatedAt = new Date().toISOString();
  const localRuntime = runtimeMode === 'local';

  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_media_readonly',
    moduleVersion: context.appVersion || '0.2.24',
    moduleBuild: context.moduleBuild || BUILD,
    routeBuild: BUILD,
    statusApiVersion: STATUS_API_VERSION,
    route: MEDIA_STATUS_PATH,
    generatedAt,
    runtimeMode,
    readOnly: true,
    prepared: true,
    active: true,
    status: localRuntime ? 'local_media_foundation_prepared' : 'online_media_foundation_prepared',
    title: 'Media-System',
    summary: localRuntime
      ? 'Lokale Media-Grundlage ist vorbereitet. Dateiinventar folgt in einem separaten read-only Step.'
      : 'Online-Media-Grundlage ist vorbereitet. Echte lokale Medien kommen spaeter nur ueber einen separaten read-only Agent-Sync.',
    mode: {
      local: localRuntime,
      online: !localRuntime,
      localInventoryExpected: localRuntime,
      onlineAgentInventorySyncPreparedLater: true,
      singleUiTruth: true,
      remoteModboardUi: true,
      localDashboardProfileUsesSameUi: true
    },
    permissions: {
      prepared: true,
      modelOnly: true,
      backendEnforcementRequiredBeforeWrites: true,
      readPermission: 'media.read',
      uploadPermission: 'media.upload',
      editPermission: 'media.edit',
      deletePermission: 'media.delete',
      uploadEnabled: false,
      editEnabled: false,
      deleteEnabled: false,
      note: 'Media-Writes bleiben deaktiviert, bis eine echte serverseitige Permission-Middleware fuer Media-Routen freigegeben und getestet ist.'
    },
    inventory: {
      prepared: true,
      active: false,
      source: localRuntime ? 'local_stream_pc_pending' : 'agent_wss_media_inventory_sync_later',
      routePreparedLater: localRuntime ? '/api/remote-agent/media/inventory/status' : '/api/remote/agent/media/inventory/status',
      items: [],
      counts: { total: 0, sounds: 0, videos: 0, images: 0 },
      emptyReason: 'inventory_not_part_of_this_step'
    },
    plannedRoots: MEDIA_PLANNED_ROOTS.map(item => ({ ...item })),
    allowedExtensions: MEDIA_ALLOWED_EXTENSIONS.slice(),
    safety: {
      readOnly: true,
      uploadEnabled: false,
      editEnabled: false,
      deleteEnabled: false,
      fileWrite: false,
      databaseWrite: false,
      migrationEnabled: false,
      shellOrProcessActions: false,
      agentActionsEnabled: false,
      freePathAccessEnabled: false,
      absolutePathsReturned: false,
      secretsExposed: false,
      noUploadInThisStep: true,
      noDeleteInThisStep: true
    },
    nextSteps: [
      'Lokales Media-Inventar read-only erfassen.',
      'Online-Media-Inventar spaeter per Agent-WSS Memory-only synchronisieren.',
      'Upload/Edit/Delete erst nach separatem Permission-/Audit-/Confirm-Step.'
    ]
  };
}

function buildMediaRoutesSummary(context = {}) {
  return {
    prepared: true,
    routeBuild: BUILD,
    statusApiVersion: STATUS_API_VERSION,
    runtimeMode: context && context.config && context.config.runtimeMode ? String(context.config.runtimeMode) : 'online',
    readOnly: true,
    uploadEnabled: false,
    deleteEnabled: false,
    permissionModelPrepared: true,
    routes: [
      { method: 'GET', path: MEDIA_STATUS_PATH, description: 'Media-System read-only Foundation fuer Lokal/Online; keine Uploads, keine Deletes, keine Dateiscans in diesem Step', readOnly: true }
    ],
    safety: {
      noFileWrite: true,
      noDatabaseWrite: true,
      noMigration: true,
      noAgentActionExecution: true,
      noShellOrProcessActions: true
    }
  };
}

module.exports = {
  MEDIA_STATUS_PATH,
  STATUS_API_VERSION,
  BUILD,
  registerMediaReadonlyRoutes,
  buildMediaReadonlyStatus,
  buildMediaRoutesSummary
};
