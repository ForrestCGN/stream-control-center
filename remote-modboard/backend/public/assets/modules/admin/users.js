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

    button.dataset.section = 'Admin';
    button.dataset.title = 'Benutzerverwaltung';
    button.dataset.tab = 'read-only';
    button.dataset.moduleId = 'admin';
    button.dataset.order = '10';
    button.textContent = 'Benutzerverwaltung';
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

      const desired = ADMIN_ORDER.find((item) => item.page === page || item.label === label);
      if (!desired) return;

      button.dataset.section = 'Admin';
      button.dataset.title = desired.title;
      button.dataset.tab = desired.tab;
      button.dataset.moduleId = 'admin';
      button.dataset.order = String(desired.order);
      button.textContent = desired.label;
    });

    ensureAdminUsersInAdminMenu();

    const ordered = [...adminSub.querySelectorAll('.nav-link[data-page]')]
      .filter((button) => ADMIN_ORDER.some((item) => item.page === button.dataset.page || item.label === button.textContent.trim()))
      .sort((a, b) => Number(a.dataset.order || 100) - Number(b.dataset.order || 100));

    ordered.forEach((button) => adminSub.appendChild(button));
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
    if (document.getElementById('rdap115cAdminNavCleanupStyle')) return;

    const style = document.createElement('style');
    style.id = 'rdap115cAdminNavCleanupStyle';
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
    if (document.documentElement.dataset.rdap115cAdminNavObserver === '1') return;
    document.documentElement.dataset.rdap115cAdminNavObserver = '1';

    const nav = document.querySelector('.cgn-nav');
    if (!nav) return;

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(cleanupAdminNavigation);
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

  function installAdminUsersModule() {
    registerAdminPage();
    cleanupAdminNavigation();
    polishAdminUsersPanel();
    installAdminNavObserver();
    loadAdminNotesModuleScript();
  }

  installAdminUsersModule();

  document.addEventListener('DOMContentLoaded', installAdminUsersModule);
  window.addEventListener('rdap:module-registry-ready', installAdminUsersModule);
  window.addEventListener('rdap:main-router-page-change', (event) => {
    cleanupAdminNavigation();
    if (event && event.detail && event.detail.page === PAGE_ID) polishAdminUsersPanel();
  });
})();
