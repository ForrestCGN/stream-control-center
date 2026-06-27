'use strict';

(function registerAdminUsersModule() {
  const PAGE_ID = 'admin-users';

  const ADMIN_ORDER = [
    { page: 'admin-users', label: 'Benutzerverwaltung', title: 'Benutzerverwaltung', tab: 'read-only', order: 10 },
    { page: 'admin-notes', label: 'Admin-Notizen', title: 'Admin-Notizen', tab: 'read-only', order: 20 },
    { page: 'connections', label: 'Verbindungen', title: 'Verbindungen', tab: 'read-only', order: 30 },
    { page: 'routes', label: 'Doku / Details', title: 'Doku / Details', tab: 'read-only', order: 90 }
  ];

  const HIDDEN_ADMIN_PAGES = new Set([
    'admin-user-detail',
    'user-detail',
    'admin-user',
    'account',
    'permissions',
    'access',
    'diagnostics'
  ]);

  const ADMIN_LABEL_ALIASES = new Map([
    ['benutzerverwaltung', 'admin-users'],
    ['benutzer', 'admin-users'],
    ['users', 'admin-users'],
    ['userverwaltung', 'admin-users'],
    ['admin-notizen', 'admin-notes'],
    ['admin notizen', 'admin-notes'],
    ['admin notes', 'admin-notes'],
    ['notizen', 'admin-notes'],
    ['connections', 'connections'],
    ['verbindungen', 'connections'],
    ['verbindung', 'connections'],
    ['stream-pc verbindung', 'connections'],
    ['doku / details', 'routes'],
    ['doku/details', 'routes'],
    ['doku', 'routes'],
    ['details', 'routes'],
    ['routen', 'routes'],
    ['routes', 'routes']
  ]);

  const SYSTEM_ORDER = [
    { page: 'overview', label: 'Übersicht', title: 'Übersicht', tab: 'read-only', order: 10 },
    { page: 'diagnostics', label: 'Diagnose', title: 'Diagnose', tab: 'read-only', order: 20 }
  ];

  function registerAdminPage() {
    if (!window.RemoteModboardModules || typeof window.RemoteModboardModules.registerPage !== 'function') return;

    window.RemoteModboardModules.registerPage({
      moduleId: 'admin',
      pageId: PAGE_ID,
      label: 'Benutzerverwaltung',
      title: 'Benutzerverwaltung',
      tab: 'read-only',
      section: 'Admin',
      order: 10
    });
  }

  function removeStandaloneUsersNavigation() {
    document.querySelectorAll('.nav-group[data-target="nav-admin-users-management"],#nav-admin-users-management').forEach((node) => node.remove());
  }

  function ensureAdminUsersInAdminMenu() {
    const adminSub = document.getElementById('nav-admin');
    if (!adminSub) return;

    let button = adminSub.querySelector('.nav-link[data-page="admin-users"]');
    if (!button) {
      button = document.createElement('button');
      button.className = 'nav-link';
      button.type = 'button';
      button.dataset.page = PAGE_ID;
      adminSub.insertBefore(button, adminSub.firstElementChild || null);
    }

    normalizeAdminButton(button, ADMIN_ORDER[0]);
  }

  function normalizeAdminButton(button, desired) {
    if (!button || !desired) return;
    button.dataset.section = 'Admin';
    button.dataset.title = desired.title;
    button.dataset.tab = desired.tab;
    button.dataset.moduleId = 'admin';
    button.dataset.order = String(desired.order);
    button.dataset.page = desired.page;
    button.textContent = desired.label;
  }

  function normalizeSystemButton(button, desired) {
    if (!button || !desired) return;
    button.dataset.section = 'System';
    button.dataset.title = desired.title;
    button.dataset.tab = desired.tab;
    button.dataset.order = String(desired.order);
    button.dataset.page = desired.page;
    button.textContent = desired.label;
  }

  function normalizeLabel(value) {
    return String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  function desiredAdminForButton(button) {
    if (!button) return null;
    const page = button.dataset.page || '';
    const label = normalizeLabel(button.textContent);
    return ADMIN_ORDER.find((item) => item.page === page) || ADMIN_ORDER.find((item) => item.page === ADMIN_LABEL_ALIASES.get(label)) || null;
  }

  function cleanupAdminNavigation() {
    const adminSub = document.getElementById('nav-admin');
    if (!adminSub) return;

    removeStandaloneUsersNavigation();

    adminSub.querySelectorAll('.nav-link[data-page]').forEach((button) => {
      const page = button.dataset.page || '';
      const label = button.textContent.trim();

      if (
        HIDDEN_ADMIN_PAGES.has(page) ||
        /^User-Detail$/i.test(label) ||
        /^Rollen\s*&\s*Rechte$/i.test(label) ||
        /^Sicherheit$/i.test(label)
      ) {
        button.remove();
        return;
      }

      const desired = desiredAdminForButton(button);
      if (desired) normalizeAdminButton(button, desired);
    });

    ensureAdminUsersInAdminMenu();
    dedupeAdminNavigation(adminSub);

    const ordered = [...adminSub.querySelectorAll('.nav-link[data-page]')]
      .filter((button) => desiredAdminForButton(button))
      .sort((a, b) => Number(a.dataset.order || 100) - Number(b.dataset.order || 100));

    ordered.forEach((button) => adminSub.appendChild(button));
  }

  function dedupeAdminNavigation(adminSub) {
    const seen = new Set();

    [...adminSub.querySelectorAll('.nav-link[data-page]')].forEach((button) => {
      const desired = desiredAdminForButton(button);
      if (!desired) return;

      if (seen.has(desired.page)) {
        button.remove();
        return;
      }

      seen.add(desired.page);
      normalizeAdminButton(button, desired);
    });
  }

  function cleanupSystemNavigation() {
    const systemSub = document.getElementById('nav-system');
    if (!systemSub) return;

    const allowedPages = new Set(SYSTEM_ORDER.map((item) => item.page));
    const seen = new Set();

    systemSub.querySelectorAll('.nav-link[data-page]').forEach((button) => {
      const desired = SYSTEM_ORDER.find((item) => item.page === button.dataset.page || item.label === button.textContent.trim());

      if (!desired || !allowedPages.has(desired.page) || seen.has(desired.page)) {
        button.remove();
        return;
      }

      seen.add(desired.page);
      normalizeSystemButton(button, desired);
    });

    const ordered = [...systemSub.querySelectorAll('.nav-link[data-page]')]
      .filter((button) => allowedPages.has(button.dataset.page))
      .sort((a, b) => Number(a.dataset.order || 100) - Number(b.dataset.order || 100));

    ordered.forEach((button) => systemSub.appendChild(button));
  }

  function polishAdminUsersPanel() {
    const panel = document.querySelector('[data-page-panel="admin-users"]');
    if (!panel) return;

    const eyebrow = panel.querySelector('.page-header .cgn-eyebrow');
    const title = panel.querySelector('.page-header h1');
    const intro = panel.querySelector('.page-header p:not(.cgn-eyebrow)');
    if (eyebrow) eyebrow.textContent = 'Admin / Benutzerverwaltung';
    if (title) title.textContent = 'Benutzerverwaltung';
    if (intro) intro.textContent = 'Admin-Übersicht über bekannte Modboard-Benutzer, Rollen und Sitzungen. Rollen werden später im User-Detail verwaltet.';

    const infoTitle = [...panel.querySelectorAll('.card-head h2')].find((node) => node.textContent.trim() === 'Bearbeiten kommt in den passenden Bereichen' || node.textContent.trim() === 'Bearbeiten bleibt gesperrt');
    if (infoTitle) infoTitle.textContent = 'Bearbeiten bleibt gesperrt';

    const infoText = panel.querySelector('.admin-lock-note span');
    if (infoText) {
      infoText.textContent = 'Diese Admin-Ansicht ist read-only. Rollenverwaltung kommt später im User-Detail als eigenes Fenster mit Hover-Infos pro Rolle.';
    }

    installStyle();
  }

  function installStyle() {
    if (document.getElementById('rdap118AdminNavPolishStyle')) return;

    const style = document.createElement('style');
    style.id = 'rdap118AdminNavPolishStyle';
    style.textContent = `
      .nav-group[data-target="nav-admin-users-management"],#nav-admin-users-management{display:none!important}
      #nav-admin .nav-link[data-page="admin-user-detail"],
      #nav-admin .nav-link[data-page="user-detail"],
      #nav-admin .nav-link[data-page="admin-user"],
      #nav-admin .nav-link[data-page="account"],
      #nav-admin .nav-link[data-page="permissions"],
      #nav-admin .nav-link[data-page="access"],
      #nav-admin .nav-link[data-page="diagnostics"]{display:none!important}
      [data-page-panel="admin-users"] .page-header p:not(.cgn-eyebrow){max-width:980px}
      [data-page-panel="admin-users"] .admin-lock-note{background:rgba(255,209,102,.08);border:1px solid rgba(255,209,102,.2)}
      [data-page-panel="admin-users"] .admin-lock-note i{background:rgba(255,209,102,.18)}
      [data-page-panel="admin-users"] .admin-user-table{min-height:80px}
    `;
    document.head.appendChild(style);
  }

  function installAdminNavObserver() {
    if (document.documentElement.dataset.rdap118AdminNavObserver === '1') return;
    document.documentElement.dataset.rdap118AdminNavObserver = '1';

    const nav = document.querySelector('.cgn-nav');
    if (!nav) return;

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(cleanupAllNavigation);
    });
    observer.observe(nav, { childList: true, subtree: true });
  }

  function loadAdminNotesModuleScript() {
    if (document.querySelector('script[data-rdap-admin-notes-module="1"]')) return;

    const script = document.createElement('script');
    script.src = '/assets/modules/admin/notes.js';
    script.defer = true;
    script.dataset.rdapAdminNotesModule = '1';
    document.head.appendChild(script);
  }

  function loadAdminConnectionsModuleScript() {
    if (document.querySelector('script[data-rdap-admin-connections-module="1"]')) return;

    const script = document.createElement('script');
    script.src = '/assets/modules/admin/connections.js';
    script.defer = true;
    script.dataset.rdapAdminConnectionsModule = '1';
    document.head.appendChild(script);
  }

  function cleanupAllNavigation() {
    cleanupSystemNavigation();
    cleanupAdminNavigation();
  }

  function installAdminUsersModule() {
    registerAdminPage();
    cleanupAllNavigation();
    polishAdminUsersPanel();
    installAdminNavObserver();
    loadAdminNotesModuleScript();
    loadAdminConnectionsModuleScript();
  }

  installAdminUsersModule();

  document.addEventListener('DOMContentLoaded', installAdminUsersModule);
  window.addEventListener('rdap:module-registry-ready', installAdminUsersModule);
  window.addEventListener('rdap:main-router-page-change', (event) => {
    cleanupAllNavigation();
    if (event && event.detail && event.detail.page === PAGE_ID) polishAdminUsersPanel();
  });
})();
