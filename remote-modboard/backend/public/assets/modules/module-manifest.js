'use strict';

(function publishRemoteModboardModuleManifest() {
  const manifest = {
    locale: 'de',
    version: '0.2.1',
    modules: [
      {
        id: 'system',
        label: { de: 'System', en: 'System' },
        description: { de: 'Status, Diagnose und technische Übersicht.', en: 'Status, diagnostics and technical overview.' },
        icon: '◆',
        order: 10,
        runtime: 'both',
        permission: 'remote.view',
        navSubId: 'nav-system'
      },
      {
        id: 'modules',
        label: { de: 'Module', en: 'Modules' },
        description: { de: 'Übersicht der verfügbaren und geplanten Arbeitsbereiche.', en: 'Overview of available and planned work areas.' },
        icon: '◇',
        order: 20,
        runtime: 'both',
        permission: 'remote.view',
        navSubId: 'nav-modules'
      },
      {
        id: 'admin',
        label: { de: 'Admin', en: 'Admin' },
        description: { de: 'Benutzer, Notizen, Verbindungen und Diagnose-Details.', en: 'Users, notes, connections and diagnostic details.' },
        icon: '⚙',
        order: 30,
        runtime: 'both',
        permission: 'admin.view',
        navSubId: 'nav-admin'
      },
      {
        id: 'account',
        label: { de: 'Mein Konto', en: 'My Account' },
        description: { de: 'Eigener Login- und Rechte-Status.', en: 'Own login and permission status.' },
        icon: '◉',
        order: 90,
        runtime: 'both',
        permission: 'remote.view',
        navSubId: 'nav-account',
        hiddenInMainNav: true
      }
    ],
    pages: [
      {
        moduleId: 'system',
        pageId: 'overview',
        label: { de: 'Übersicht', en: 'Overview' },
        title: { de: 'Übersicht', en: 'Overview' },
        description: { de: 'Schneller Systemstatus des Remote Modboards.', en: 'Quick system status of the remote modboard.' },
        tab: { de: 'Status', en: 'Status' },
        order: 10,
        runtime: 'both',
        permission: 'remote.view',
        script: '/assets/modules/system/overview.js'
      },
      {
        moduleId: 'system',
        pageId: 'diagnostics',
        label: { de: 'Diagnose', en: 'Diagnostics' },
        title: { de: 'Diagnose', en: 'Diagnostics' },
        description: { de: 'Read-only Diagnose für Status, Login und Sicherheit.', en: 'Read-only diagnostics for status, login and security.' },
        tab: { de: 'Status', en: 'Status' },
        order: 20,
        runtime: 'both',
        permission: 'remote.diagnostics.read',
        script: '/assets/modules/system/diagnostics.js'
      },
      {
        moduleId: 'modules',
        pageId: 'modules',
        label: { de: 'Modulübersicht', en: 'Module Overview' },
        title: { de: 'Modulübersicht', en: 'Module Overview' },
        description: { de: 'Module mit Sprache, Rechten und Online/Lokal-Gültigkeit.', en: 'Modules with locale, permissions and online/local scope.' },
        tab: { de: 'read-only', en: 'read-only' },
        order: 10,
        runtime: 'both',
        permission: 'remote.modules.read',
        script: '/assets/modules/modules/catalog.js'
      },
      {
        moduleId: 'admin',
        pageId: 'admin-users',
        label: { de: 'Benutzerverwaltung', en: 'User Management' },
        title: { de: 'Benutzerverwaltung', en: 'User Management' },
        description: { de: 'Benutzer, Rollen und Sitzungen im Überblick.', en: 'Overview of users, roles and sessions.' },
        tab: { de: 'read-only', en: 'read-only' },
        order: 10,
        runtime: 'both',
        permission: 'admin.users.read',
        script: '/assets/modules/admin/users.js'
      },
      {
        moduleId: 'admin',
        pageId: 'admin-notes',
        label: { de: 'Admin-Notizen', en: 'Admin Notes' },
        title: { de: 'Admin-Notizen', en: 'Admin Notes' },
        description: { de: 'Admin-Notizen lesen und kontrolliert bearbeiten, wenn das Backend es erlaubt.', en: 'Read and controlled editing of admin notes when the backend allows it.' },
        tab: { de: 'read/create', en: 'read/create' },
        order: 20,
        runtime: 'both',
        permission: 'admin.users.note.read',
        writePermission: 'admin.users.note.write',
        script: '/assets/modules/admin/notes.js'
      },
      {
        moduleId: 'admin',
        pageId: 'connections',
        label: { de: 'Verbindungen', en: 'Connections' },
        title: { de: 'Verbindungen', en: 'Connections' },
        description: { de: 'Stream-PC-/Agent-Verbindungsstatus read-only.', en: 'Stream PC / agent connection status read-only.' },
        tab: { de: 'read-only', en: 'read-only' },
        order: 30,
        runtime: 'both',
        permission: 'admin.connections.read',
        script: '/assets/modules/admin/connections.js'
      },
      {
        moduleId: 'admin',
        pageId: 'routes',
        label: { de: 'Doku / Details', en: 'Docs / Details' },
        title: { de: 'Doku / Details', en: 'Docs / Details' },
        description: { de: 'Technische Details und Routenübersicht.', en: 'Technical details and route overview.' },
        tab: { de: 'read-only', en: 'read-only' },
        order: 90,
        runtime: 'both',
        permission: 'admin.details.read',
        script: '/assets/modules/admin/details.js'
      },
      {
        moduleId: 'account',
        pageId: 'account',
        label: { de: 'Status', en: 'Status' },
        title: { de: 'Mein Login', en: 'My Login' },
        description: { de: 'Aktuelle Session und Login-Status.', en: 'Current session and login status.' },
        tab: { de: 'Konto', en: 'Account' },
        order: 10,
        runtime: 'both',
        permission: 'remote.view',
        hiddenInMainNav: true,
        script: '/assets/modules/account/status.js'
      },
      {
        moduleId: 'account',
        pageId: 'permissions',
        label: { de: 'Meine Rechte', en: 'My Permissions' },
        title: { de: 'Meine Rechte', en: 'My Permissions' },
        description: { de: 'Persönliche Berechtigungsanzeige.', en: 'Personal permission display.' },
        tab: { de: 'Berechtigungen', en: 'Permissions' },
        order: 20,
        runtime: 'both',
        permission: 'remote.permissions.self.read',
        hiddenInMainNav: true,
        script: '/assets/modules/account/permissions.js'
      }
    ]
  };

  window.RemoteModboardModuleManifest = manifest;
})();
