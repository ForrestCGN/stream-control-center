'use strict';

const { ADMIN_NOTE_WRITE_CONFIRMED_SUMMARY } = require('../services/admin-user-admin-note-write-confirmed.service');
const { buildAgentRoutesSummary } = require('../services/agent-status.service');
const { buildMediaRoutesSummary } = require('./media-readonly.routes');

const RDAP42_STATUS_API_VERSION = 'rdap_admin_note_ui_status42.v1';
const RDAP42_BUILD = 'RDAP42_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP';
const RDAP61_BUILD = 'RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION';
const RDAP123_BUILD = 'RDAP123_ROUTES_STATUS_AND_HANDOFF_CLEANUP';
const RDAP110_BUILD = 'RDAP_0.2.110_ADMIN_NOTE_WRITE_STATUS_RECONCILE';
const RDAP113_BUILD = 'RDAP_0.2.113_AUDIT_LOG_READONLY_API';
const RDAP115_BUILD = 'RDAP_0.2.115_AUDIT_LOG_RETENTION_STATUS_AND_ADMIN_UI_PREP';

function registerRoutesRoutes(app, context) {
  app.get('/api/remote/routes', (req, res) => {
    const publicConfig = buildRoutesPublicConfig(context);

    res.json({
      ok: true,
      service: 'remote-modboard',
      module: 'remote_routes',
      moduleBuild: context.moduleBuild,
      statusApiVersion: RDAP42_STATUS_API_VERSION,
      routeStatusBuild: RDAP123_BUILD,
      readOnly: false,
      writeEnabled: false,
      authEnabled: Boolean(context.config && context.config.auth && context.config.auth.authEnabled),
      routes: [
        { method: 'GET', path: '/api/remote/health', description: 'Read-only Healthcheck' },
        { method: 'GET', path: '/api/remote/status', description: 'Service-/Security-/Auth-/Runtime-Status inklusive lokalem Dashboard-Profil' },
        { method: 'GET', path: '/api/remote/routes', description: 'Routenuebersicht inklusive RDAP123 Routes-Status-Angleichung' },
        { method: 'GET', path: '/api/remote/auth/model', description: 'Read-only Auth-/Rechte-Modell' },
        { method: 'GET', path: '/api/remote/auth/me', description: 'Aktueller Login-/Session-Status' },
        { method: 'POST', path: '/api/remote/auth/me/sync-twitch', description: 'Self-Service: eigenes Twitch-Profil synchronisieren' },
        { method: 'GET', path: '/api/remote/auth/session-status', description: 'Read-only Session-Diagnose' },
        { method: 'GET', path: '/api/remote/auth/permissions/check', description: 'Read-only Permission-Diagnose' },
        { method: 'GET', path: '/api/remote/admin/users/permission-diagnostic', description: 'Read-only Admin-User-Permission-Diagnose; keine User-/Rollen-Writes' },
        { method: 'GET', path: '/api/remote/admin/users/write-foundation-diagnostic', description: 'Read-only Confirm-/Audit-/Locking-Foundation inkl. disabled Confirm-/Audit-/Lock-Helper; schreibt nichts' },
        { method: 'GET', path: '/api/remote/admin/users/mini-write-foundation-diagnostic', description: 'Read-only RDAP11 Mini-Write-Foundation; Permission/Confirm/Audit/Lock/Backup/Rollback vorbereitet, Writes bleiben blockiert' },
        { method: 'GET', path: '/api/remote/admin/users/admin-note-diagnostic', description: 'Read-only Admin-Notiz-Tabellen-Diagnose; keine Migration, keine Notiz-Writes' },
        { method: 'GET', path: '/api/remote/admin/users/admin-notes/read', description: 'RDAP39C wiederhergestellte echte Admin-Notiz-Read-Route mit Session, DashboardAccess und admin.users.note.read; schreibt nichts' },
        { method: 'GET', path: '/api/remote/admin/users/admin-notes/write-plan', description: 'RDAP38 Admin-Notiz Write-Plan; read-only' },
        { method: 'POST', path: '/api/remote/admin/users/admin-notes/create', description: 'RDAP39/RDAP61 kontrollierter Admin-Notiz Create-Backend-Write mit Permission/Confirm/Audit/Lock/Readback; RDAP40-Create-UI zeigt Button nur bei Schreibrecht' },
        { method: 'POST', path: '/api/remote/admin/users/admin-notes/update', description: 'RDAP61 kontrollierter Admin-Notiz Update-Backend-Write fuer aktive Notizen mit Permission/Confirm/Audit/Lock/Readback; keine Update-UI in RDAP61' },
        { method: 'POST', path: '/api/remote/admin/users/admin-notes/deactivate', description: 'RDAP31 Admin-Notiz Deactivate-Validierung; bleibt read-only, schreibt nichts' },
        { method: 'GET', path: '/api/remote/auth/login/plan', description: 'Read-only Plan fuer zentrale Login-Schicht' },
        { method: 'GET', path: '/api/remote/auth/login/start', description: 'Neutraler Login-Einstieg; aktuell Fallback auf Twitch, spaeter zentrale Auth' },
        { method: 'GET', path: '/api/remote/auth/twitch/start', description: 'Gated Twitch OAuth Start' },
        { method: 'GET', path: '/api/remote/auth/twitch/callback', description: 'Gated Twitch OAuth Callback' },
        { method: 'POST', path: '/api/remote/auth/logout', description: 'Gated Logout nur fuer aktuelle Auth-Session' },
        { method: 'GET', path: '/api/remote/lock-audit/status', description: 'Read-only Lock-/Audit-Diagnose' },
        { method: 'GET', path: '/api/remote/lock-audit/schema-adapter/status', description: 'Read-only Schema-Adapter-Diagnose' },
        { method: 'GET', path: '/api/remote/admin/audit-lock/schema-status', description: 'RDAP33 read-only Audit-/Lock-Schema und Runtime-Status; keine Writes' },
        { method: 'GET', path: '/api/remote/lock-audit/schema-status', description: 'Alias fuer RDAP33 read-only Audit-/Lock-Schema und Runtime-Status' },
        { method: 'GET', path: '/api/remote/admin/audit/log', description: 'RDAP113 read-only Audit-Log-Liste: wer/wann/was/Status; keine Writes' },
        { method: 'GET', path: '/api/remote/admin/audit/retention/status', description: 'RDAP115 read-only Audit-Retention-Status fuer Admin-Bereich: Anzahl, Zeitraum, Cleanup-Status; keine Writes' },
        { method: 'GET', path: '/api/remote/admin/audit/test-insert/status', description: 'RDAP36 Audit-Testinsert-Status; schreibt nichts' },
        { method: 'POST', path: '/api/remote/admin/audit/test-insert', description: 'RDAP36 lokaler Audit-Testinsert mit Body-confirmWrite und testOnly; keine produktive Admin-Aktion' },
        { method: 'GET', path: '/api/remote/admin/locks/test/status', description: 'RDAP37 Lock-Test-Status; schreibt nichts' },
        { method: 'POST', path: '/api/remote/admin/locks/test-cycle', description: 'RDAP37 lokaler Lock-Test mit Body-confirmWrite und testOnly; keine produktive Admin-Aktion' },
        { method: 'GET', path: '/api/remote/agent/status', description: 'RDAP82 read-only Stream-PC-Verbindungsstatus mit Runtime-disabled Skeleton; keine Agent-Actions' },
        { method: 'GET', path: '/api/remote/media/status', description: 'Media-System Status inkl. 0.2.56 remote_media_index Read-Source, Agent-Memory-Fallback und Media-Index Write-Gates; keine Uploads, keine Deletes' },
        { method: 'GET', path: '/api/remote/media/index/write-gate/status', description: 'Media-Index Write-Gate Status; zeigt separate MEDIA_INDEX_* Gates ohne Writes' },
        { method: 'GET', path: '/api/remote/media/index/schema/status', description: 'Media-Index Schema-Status; read-only INFORMATION_SCHEMA Diagnose' },
        { method: 'GET', path: '/api/remote/media/index/context/list', description: 'RDAP 0.2.94 read-only Media-Index Kontext-/Kategorie-Liste aus remote_media_index; filterbar, keine Writes' },
        { method: 'POST', path: '/api/remote/media/index/schema/prepare', description: 'Media-Index Schema-Prepare; local-only, confirmWrite+schemaOnly und MEDIA_INDEX_SCHEMA_WRITE_ENABLED erforderlich; disabled by default' },
        { method: 'GET', path: '/', description: 'Remote-Modboard UI' },
        { method: 'GET', path: '/remote', description: 'Remote-Modboard UI Alias' },
        { method: 'GET', path: '/modboard', description: 'Remote-Modboard UI Alias' }
      ],
      mediaReadonly: buildMediaRoutesSummary(context),
      adminNoteReadRestored: {
        prepared: true,
        route: '/api/remote/admin/users/admin-notes/read',
        method: 'GET',
        statusApiVersion: 'rdap_admin_users27.v1',
        routeRestoreBuild: 'RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC',
        serviceBuild: 'RDAP_ADMIN_USERS27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED',
        tableName: 'dashboard_user_admin_notes',
        permissionRequired: 'admin.users.note.read',
        writePermissionObservedOnly: 'admin.users.note.write',
        readOnly: true,
        writeEnabled: false,
        databaseWriteEnabled: false,
        productiveWritesEnabled: false,
        uiWriteButtonsEnabled: false,
        communityPagesMayReadAdminNotes: false,
        returnsNoteTextForAuthorizedAdmins: true,
        routeRemainsRestricted: true
      },
      adminNoteWritePlan: {
        prepared: true,
        route: '/api/remote/admin/users/admin-notes/write-plan',
        method: 'GET',
        statusApiVersion: 'rdap_admin_note_write38.v1',
        tableName: 'dashboard_user_admin_notes',
        permissionRequired: 'admin.users.note.write',
        confirmWriteRequired: true,
        bodyConfirmOnly: true,
        auditRequired: true,
        lockRequired: true,
        backupRequiredBeforeProductiveWrite: true,
        readBackRequired: true,
        writeEnabled: false,
        databaseWriteEnabled: false,
        productiveWritesEnabled: false,
        adminNoteWritesEnabled: false,
        uiWriteButtonsEnabled: false,
        physicalDeleteEnabled: false,
        routeRemainsReadOnly: true,
        statusMeaning: 'Plan-/Diagnose-Route bleibt read-only; sie beschreibt nicht den produktiven Confirmed-Write-Status.'
      },
      adminNoteWriteConfirmed: buildAdminNoteWriteConfirmedUiSemantics(),
      adminNoteWriteLiveStatus: buildAdminNoteWriteLiveStatus(),
      adminNoteUiStatusSemantics: buildAdminNoteUiStatusSemantics(),
      adminUsersAdminNoteWriteDisabled: {
        prepared: true,
        routes: [
          '/api/remote/admin/users/admin-notes/deactivate'
        ],
        previouslyDisabledRouteNowConfirmed: '/api/remote/admin/users/admin-notes/update',
        tableName: 'dashboard_user_admin_notes',
        permissionRequired: 'admin.users.note.write',
        confirmWriteRequired: true,
        validatatesInput: true,
        readOnly: true,
        writeEnabled: false,
        databaseWriteEnabled: false,
        productiveWritesEnabled: false,
        uiWriteButtonsEnabled: false,
        updatesNote: false,
        deactivatesNote: false,
        physicalDeleteEnabled: false,
        routeRemainsReadOnly: true
      },
      adminNoteUpdateConfirmed: {
        prepared: true,
        route: '/api/remote/admin/users/admin-notes/update',
        method: 'POST',
        routeBuild: RDAP61_BUILD,
        tableName: 'dashboard_user_admin_notes',
        permissionRequired: 'admin.users.note.write',
        confirmWriteRequired: true,
        bodyConfirmOnly: true,
        auditRequired: true,
        lockRequired: true,
        readBackRequired: true,
        writeEnabled: true,
        databaseWriteEnabled: true,
        productiveWritesEnabled: true,
        adminNoteUpdateEnabled: true,
        adminNoteCreateStillEnabled: true,
        adminNoteDeactivateEnabled: false,
        uiWriteButtonsEnabled: false,
        frontendUpdateUiPrepared: false,
        physicalDeleteEnabled: false,
        communityPagesMayReadAdminNotes: false,
        activeNotesOnly: true,
        allowedFields: ['note_text', 'updated_by_user_uid', 'updated_at'],
        rawNoteTextLogged: false,
        statusMeaning: 'Backend-Update ist bewusst produktiv aktiv, aber nur mit Session, DashboardAccess, Permission, Body-confirmWrite, Audit, Lock und Readback; Update-UI bleibt aus.'
      },
      adminAuditLockSchemaStatusReadonly: {
        prepared: true,
        route: '/api/remote/admin/audit-lock/schema-status',
        aliasRoute: '/api/remote/lock-audit/schema-status',
        statusApiVersion: 'rdap_audit36.v1',
        tables: ['dashboard_audit_log', 'dashboard_locks'],
        readOnly: true,
        writeEnabled: false,
        databaseWriteEnabled: false,
        productiveWritesEnabled: false,
        writesStillBlocked: true,
        migrationEnabled: false,
        returnsRowCounts: true,
        returnsSafePreviewRows: true,
        secretsLogged: false,
        auditInsertEnabled: false,
        lockAcquireEnabled: false,
        lockHeartbeatEnabled: false,
        lockReleaseEnabled: false,
        lockForceTakeoverEnabled: false,
        uiWriteButtonsEnabled: false,
        routeRemainsReadOnly: true
      },
      adminAuditLogReadonly: buildAdminAuditLogReadonlyStatus(),
      adminAuditRetentionReadonly: buildAdminAuditRetentionReadonlyStatus(),
      adminAuditTestInsert: {
        prepared: true,
        statusRoute: '/api/remote/admin/audit/test-insert/status',
        route: '/api/remote/admin/audit/test-insert',
        method: 'POST',
        statusApiVersion: 'rdap_audit36.v1',
        tableName: 'dashboard_audit_log',
        localOnly: true,
        confirmWriteRequired: true,
        bodyConfirmOnly: true,
        testOnlyRequired: true,
        auditTestInsertEnabled: true,
        productiveWritesEnabled: false,
        writesStillBlockedForProductiveActions: true,
        adminNoteWritesEnabled: false,
        lockWritesEnabled: false,
        uiWriteButtonsEnabled: false,
        secretsLogged: false,
        routeRemainsRestricted: true
      },
      adminLockTest: {
        prepared: true,
        statusRoute: '/api/remote/admin/locks/test/status',
        route: '/api/remote/admin/locks/test-cycle',
        method: 'POST',
        statusApiVersion: 'rdap_lock37.v1',
        tableName: 'dashboard_locks',
        localOnly: true,
        confirmWriteRequired: true,
        bodyConfirmOnly: true,
        testOnlyRequired: true,
        lockTestCycleEnabled: true,
        productiveWritesEnabled: false,
        writesStillBlockedForProductiveActions: true,
        adminNoteWritesEnabled: false,
        auditProductiveWritesEnabled: false,
        uiWriteButtonsEnabled: false,
        secretsLogged: false,
        physicalDeleteEnabled: false,
        routeRemainsRestricted: true
      },
      adminUsersMiniWriteFoundation: {
        prepared: true,
        route: '/api/remote/admin/users/mini-write-foundation-diagnostic',
        permissionPrepared: true,
        confirmWritePrepared: true,
        auditPrepared: true,
        lockPrepared: true,
        backupRollbackPrepared: true,
        writeEnabled: false,
        productiveWritesEnabled: false,
        writesStillBlocked: true,
        uiWriteButtonsEnabled: false,
        routeRemainsReadOnly: true
      },
      agentStatusFoundation: buildAgentRoutesSummary(context),
      localDashboardProfile: buildLocalDashboardProfileSummary(publicConfig),
      localLanMode: buildLocalLanModeSummary(publicConfig),
      safety: context.safety
    });
  });
}

function buildRoutesPublicConfig(context = {}) {
  const config = context.config || {};
  return {
    runtimeMode: config.runtimeMode || 'online',
    localLan: config.localLan || {},
    localDashboardProfile: config.localDashboardProfile || {}
  };
}

function buildLocalDashboardProfileSummary(publicConfig = {}) {
  const runtimeMode = publicConfig.runtimeMode === 'local' ? 'local' : 'online';
  const source = publicConfig.localDashboardProfile || {};
  return {
    prepared: true,
    active: runtimeMode === 'local',
    runtimeMode,
    visibleLabel: runtimeMode === 'local' ? 'Lokalmodus' : 'Onlinemodus',
    sharedModularUiFoundation: true,
    moduleRuntimeScopesPrepared: true,
    moduleRuntimeScopes: ['online', 'local', 'both'],
    moduleVisibilityFrontendOnly: true,
    backendStillAuthoritative: true,
    localDashboardReplacementPrepared: true,
    lanUseAllowed: Boolean(publicConfig.localLan && publicConfig.localLan.lanUseAllowed),
    actionsEnabled: false,
    productiveWritesEnabled: false,
    agentActionsEnabled: false,
    forbiddenActionsStillBlocked: ['OBS', 'Sounds', 'Overlays', 'Commands', 'Shell', 'Files', 'Processes'],
    sourcePrepared: source.prepared === true,
    routeStatusAligned: true,
    routeStatusBuild: RDAP123_BUILD,
    safetyNote: 'Das lokale Dashboard-Profil markiert nur den Betriebsmodus und Module. Es aktiviert keine OBS-, Sound-, Overlay-, Command-, Shell-, Datei- oder Prozess-Aktionen.'
  };
}

function buildLocalLanModeSummary(publicConfig = {}) {
  const runtimeMode = publicConfig.runtimeMode === 'local' ? 'local' : 'online';
  const localLan = publicConfig.localLan || {};
  return {
    planned: true,
    foundationPrepared: true,
    implemented: runtimeMode === 'local',
    runtimeMode,
    bindHost: localLan.bindHost,
    allowedCidrs: Array.isArray(localLan.allowedCidrs) ? localLan.allowedCidrs : [],
    lanUseAllowed: localLan.lanUseAllowed === true,
    twitchLoginPlanned: true,
    engelCgnLanAccessPlanned: true,
    localDashboardReplacementPrepared: true,
    routeStatusAligned: true,
    routeStatusBuild: RDAP123_BUILD,
    safetyNote: 'Lokaler Modus oeffnet nur die Weboberflaeche im LAN. Produktive Aktionen bleiben weiter durch Backend-Scope, Permission, Confirm-Write, Audit, Lock und Readback begrenzt.'
  };
}

function buildAdminAuditLogReadonlyStatus() {
  return {
    prepared: true,
    route: '/api/remote/admin/audit/log',
    method: 'GET',
    routeBuild: RDAP113_BUILD,
    statusApiVersion: 'rdap_audit113.v1',
    tableName: 'dashboard_audit_log',
    purpose: 'Read-only Aktivitaets-Log: wer, wann, was gemacht hat und Status.',
    readOnly: true,
    writeEnabled: false,
    databaseWriteEnabled: false,
    productiveWritesEnabled: false,
    migrationEnabled: false,
    auditInsertEnabled: false,
    auditUpdateEnabled: false,
    uiWriteButtonsEnabled: false,
    agentActionsEnabled: false,
    returnsItems: true,
    maxLimit: 100,
    defaultLimit: 50,
    filters: ['limit', 'status', 'action', 'actor'],
    fields: [
      'createdAt',
      'completedAt',
      'actorLogin',
      'actorDisplayName',
      'action',
      'resourceType',
      'resourceKey',
      'status',
      'errorCode',
      'summary'
    ],
    secretsLogged: false,
    rawPayloadLoggingEnabled: false,
    adminNotesParked: true
  };
}

function buildAdminAuditRetentionReadonlyStatus() {
  return {
    prepared: true,
    route: '/api/remote/admin/audit/retention/status',
    method: 'GET',
    routeBuild: RDAP115_BUILD,
    statusApiVersion: 'rdap_audit115.v1',
    tableName: 'dashboard_audit_log',
    purpose: 'Admin-Bereich Retention-Status: Anzahl Eintraege, aeltester/neuster Eintrag, Zeitraum und Cleanup-Status.',
    readOnly: true,
    writeEnabled: false,
    databaseWriteEnabled: false,
    productiveWritesEnabled: false,
    migrationEnabled: false,
    auditCleanupEnabled: false,
    auditPruneEnabled: false,
    auditDeleteEnabled: false,
    physicalDeleteEnabled: false,
    autoCleanupEnabled: false,
    retentionPolicyConfigured: false,
    currentRetentionMode: 'unbounded_currently',
    proposedRetention: {
      maxAgeDays: 180,
      maxRows: 10000,
      mode: 'proposal_only'
    },
    returnsStorageSummary: true,
    adminUiPrep: true,
    adminNotesParked: true
  };
}

function buildAdminNoteWriteConfirmedUiSemantics() {
  return {
    ...ADMIN_NOTE_WRITE_CONFIRMED_SUMMARY,
    statusApiVersion: RDAP42_STATUS_API_VERSION,
    routeStatusCleanupBuild: RDAP42_BUILD,
    updateBackendBuild: RDAP61_BUILD,
    backendAutoUiWriteButtonsEnabled: false,
    uiWriteButtonsEnabled: true,
    uiWriteButtonsEnabledMeaning: 'RDAP40 hat bewusst einen Create-Button fuer write-berechtigte Admins vorbereitet; RDAP61 aktiviert keine Update-UI automatisch.',
    adminNoteCreateUiPrepared: true,
    adminNoteCreateButtonVisibleForWritePermission: true,
    adminNoteUpdateUiPrepared: false,
    adminNoteDeactivateUiPrepared: false,
    adminNoteDeleteUiPrepared: false,
    adminNoteCreateButtonUsesExistingRoute: '/api/remote/admin/users/admin-notes/create',
    adminNoteUpdateRoutePrepared: true,
    adminNoteUpdateRoute: '/api/remote/admin/users/admin-notes/update',
    adminNoteCreateUiRequiresServerPermission: 'admin.users.note.write',
    adminNoteUpdateRequiresServerPermission: 'admin.users.note.write',
    adminNoteCreateUiRequiresBodyConfirmWrite: true,
    adminNoteUpdateRequiresBodyConfirmWrite: true,
    adminNoteUiReadbackRoute: '/api/remote/admin/users/admin-notes/read',
    noNewFrontendWriteButtonInRdap61: true,
    statusReconciledBuild: RDAP110_BUILD,
    statusMeaning: 'Confirmed-Write-Backend ist bewusst produktiv. Das ist getrennt vom read-only Write-Plan.'
  };
}

function buildAdminNoteWriteLiveStatus() {
  return {
    prepared: true,
    statusApiVersion: 'rdap_admin_note_write110.v1',
    routeStatusBuild: RDAP110_BUILD,
    purpose: 'Klaert den Live-Status zwischen read-only Write-Plan und bewusst aktivem Confirmed-Write-Backend.',
    planRoute: '/api/remote/admin/users/admin-notes/write-plan',
    planRouteReadOnly: true,
    confirmedRouteFamily: '/api/remote/admin/users/admin-notes/*',
    createRoute: '/api/remote/admin/users/admin-notes/create',
    updateRoute: '/api/remote/admin/users/admin-notes/update',
    deactivateRoute: '/api/remote/admin/users/admin-notes/deactivate',
    createBackendWriteEnabled: true,
    updateBackendWriteEnabled: true,
    deactivateBackendWriteEnabled: false,
    productiveWritesEnabled: true,
    databaseWriteEnabled: true,
    routeLevelWriteLogicChangedInThisStep: false,
    gatesChangedInThisStep: false,
    uiWriteButtonsChangedInThisStep: false,
    requiredControls: [
      'valid_session',
      'dashboard_access',
      'remote.view',
      'admin.users.note.write',
      'body_confirmWrite',
      'audit_attempt',
      'lock_acquire',
      'write',
      'readback',
      'audit_success_or_failure',
      'lock_release'
    ],
    physicalDeleteEnabled: false,
    communityPagesMayReadAdminNotes: false,
    rawNoteTextLogged: false,
    statusSummary: 'Create/Update Backend-Writes sind bewusst aktiv und restricted; Write-Plan bleibt read-only; Deactivate/Delete bleiben aus.',
    nextRecommendedStep: 'Admin-Note UI/Backend Status im Modboard sichtbar sauber benennen, ohne neue Schreibbuttons.'
  };
}

function buildAdminNoteUiStatusSemantics() {
  return {
    prepared: true,
    statusApiVersion: RDAP42_STATUS_API_VERSION,
    routeStatusCleanupBuild: RDAP42_BUILD,
    updateBackendBuild: RDAP61_BUILD,
    purpose: 'RDAP61 aktiviert nur Backend-Update fuer aktive Admin-Notizen; keine neue UI-Funktion.',
    backendAutoUiWriteButtonsEnabled: false,
    adminNoteCreateUiPrepared: true,
    adminNoteCreateButtonVisibleForWritePermission: true,
    adminNoteCreateRoutePrepared: true,
    adminNoteCreateRoute: '/api/remote/admin/users/admin-notes/create',
    adminNoteUpdateRoutePrepared: true,
    adminNoteUpdateRoute: '/api/remote/admin/users/admin-notes/update',
    adminNoteReadbackRoute: '/api/remote/admin/users/admin-notes/read',
    adminNoteUpdateUiPrepared: false,
    adminNoteDeactivateUiPrepared: false,
    adminNoteDeleteUiPrepared: false,
    adminNoteUpdateEnabled: true,
    adminNoteDeactivateEnabled: false,
    physicalDeleteEnabled: false,
    communityPagesMayReadAdminNotes: false,
    databaseMigrationExecuted: false,
    permissionChangesExecuted: false,
    newFrontendWriteFunctionEnabled: false,
    statusReconciledBuild: RDAP110_BUILD,
    notes: [
      'RDAP40 hat die Create-UI bewusst freigegeben, aber nur fuer write-berechtigte Admins.',
      'RDAP61 aktiviert den Update-Backend-Scope ohne Update-UI.',
      'RDAP110 klaert den Unterschied zwischen read-only Write-Plan und aktivem Confirmed-Write-Backend.',
      'Deactivate und Delete bleiben deaktiviert.'
    ]
  };
}

module.exports = { registerRoutesRoutes };
