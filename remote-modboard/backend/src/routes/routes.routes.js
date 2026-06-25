'use strict';

function registerRoutesRoutes(app, context) {
  app.get('/api/remote/routes', (req, res) => {
    res.json({
      ok: true,
      service: 'remote-modboard',
      module: 'remote_routes',
      moduleBuild: context.moduleBuild,
      statusApiVersion: 'rdap_admin_users17b.v1',
      readOnly: true,
      writeEnabled: false,
      authEnabled: Boolean(context.config && context.config.auth && context.config.auth.authEnabled),
      routes: [
        { method: 'GET', path: '/api/remote/health', description: 'Read-only Healthcheck' },
        { method: 'GET', path: '/api/remote/status', description: 'Read-only Service-/Security-/Auth-Status' },
        { method: 'GET', path: '/api/remote/routes', description: 'Read-only Routenuebersicht' },
        { method: 'GET', path: '/api/remote/auth/model', description: 'Read-only Auth-/Rechte-Modell' },
        { method: 'GET', path: '/api/remote/auth/me', description: 'Aktueller Login-/Session-Status' },
        { method: 'POST', path: '/api/remote/auth/me/sync-twitch', description: 'Self-Service: eigenes Twitch-Profil synchronisieren' },
        { method: 'GET', path: '/api/remote/auth/session-status', description: 'Read-only Session-Diagnose' },
        { method: 'GET', path: '/api/remote/auth/permissions/check', description: 'Read-only Permission-Diagnose' },
        { method: 'GET', path: '/api/remote/admin/users/permission-diagnostic', description: 'Read-only Admin-User-Permission-Diagnose; keine User-/Rollen-Writes' },
        { method: 'GET', path: '/api/remote/admin/users/write-foundation-diagnostic', description: 'Read-only Confirm-/Audit-/Locking-Foundation inkl. disabled Confirm-/Audit-/Lock-Helper; schreibt nichts' },
        { method: 'GET', path: '/api/remote/admin/users/mini-write-foundation-diagnostic', description: 'Read-only RDAP11 Mini-Write-Foundation; Permission/Confirm/Audit/Lock/Backup/Rollback vorbereitet, Writes bleiben blockiert' },
        { method: 'GET', path: '/api/remote/admin/users/admin-note-diagnostic', description: 'Read-only RDAP14 Admin-Notiz-Tabellen-Diagnose; keine Migration, keine Notiz-Writes' },
        { method: 'GET', path: '/api/remote/admin/users/admin-note-read-diagnostic', description: 'Read-only RDAP17 Admin-Notiz-Read-Diagnose; keine Notiztexte, keine Writes' },
        { method: 'GET', path: '/api/remote/auth/login/plan', description: 'Read-only Plan fuer zentrale Login-Schicht' },
        { method: 'GET', path: '/api/remote/auth/login/start', description: 'Neutraler Login-Einstieg; aktuell Fallback auf Twitch, spaeter zentrale Auth' },
        { method: 'GET', path: '/api/remote/auth/twitch/start', description: 'Gated Twitch OAuth Start' },
        { method: 'GET', path: '/api/remote/auth/twitch/callback', description: 'Gated Twitch OAuth Callback' },
        { method: 'POST', path: '/api/remote/auth/logout', description: 'Gated Logout nur fuer aktuelle Auth-Session' },
        { method: 'GET', path: '/api/remote/lock-audit/status', description: 'Read-only Lock-/Audit-Diagnose' },
        { method: 'GET', path: '/api/remote/lock-audit/schema-adapter/status', description: 'Read-only Schema-Adapter-Diagnose' },
        { method: 'GET', path: '/', description: 'Remote-Modboard UI' },
        { method: 'GET', path: '/remote', description: 'Remote-Modboard UI Alias' },
        { method: 'GET', path: '/modboard', description: 'Remote-Modboard UI Alias' }
      ],
      adminUsersWriteFoundation: {
        confirmWriteHelperPrepared: true,
        auditHelperPrepared: true,
        lockHelperPrepared: true,
        lockWriteEnabled: false,
        productiveWritesEnabled: false,
        writesStillBlocked: true,
        routeRemainsReadOnly: true
      },
      adminUserAdminNoteDiagnostic: {
        prepared: true,
        route: '/api/remote/admin/users/admin-note-diagnostic',
        tableName: 'dashboard_user_admin_notes',
        readOnly: true,
        writeEnabled: false,
        productiveWritesEnabled: false,
        writesStillBlocked: true,
        migrationEnabled: false,
        routeRemainsReadOnly: true,
        uiWriteButtonsEnabled: false,
        routeListKeySynced: true,
        aliasOf: 'adminUsersAdminNoteDiagnostic'
      },
      adminUsersAdminNoteDiagnostic: {
        prepared: true,
        route: '/api/remote/admin/users/admin-note-diagnostic',
        tableName: 'dashboard_user_admin_notes',
        readOnly: true,
        writeEnabled: false,
        productiveWritesEnabled: false,
        writesStillBlocked: true,
        migrationEnabled: false,
        routeRemainsReadOnly: true,
        uiWriteButtonsEnabled: false,
        routeListKeySynced: true
      },
      adminUserAdminNoteReadDiagnostic: {
        prepared: true,
        route: '/api/remote/admin/users/admin-note-read-diagnostic',
        tableName: 'dashboard_user_admin_notes',
        readOnly: true,
        writeEnabled: false,
        productiveWritesEnabled: false,
        writesStillBlocked: true,
        returnsNoteText: false,
        noteTextIsRedacted: true,
        routeListKeySynced: true,
        aliasOf: 'adminUsersAdminNoteReadDiagnostic'
      },
      adminUsersAdminNoteReadDiagnostic: {
        prepared: true,
        route: '/api/remote/admin/users/admin-note-read-diagnostic',
        tableName: 'dashboard_user_admin_notes',
        readOnly: true,
        writeEnabled: false,
        productiveWritesEnabled: false,
        writesStillBlocked: true,
        returnsNoteText: false,
        noteTextIsRedacted: true,
        routeListKeySynced: true
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
      localLanMode: {
        planned: true,
        implemented: false,
        twitchLoginPlanned: true,
        todoParkedUntilWebDashboardStable: true
      },
      safety: context.safety
    });
  });
}

module.exports = { registerRoutesRoutes };
