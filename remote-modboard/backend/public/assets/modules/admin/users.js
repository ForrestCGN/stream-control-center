'use strict';

(function registerAdminUsersModule() {
  const PAGE_ID = 'admin-users';

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

  function polishAdminUsersPanel() {
    const panel = document.querySelector('[data-page-panel="admin-users"]');
    if (!panel) return;

    const eyebrow = panel.querySelector('.page-header .cgn-eyebrow');
    const title = panel.querySelector('.page-header h1');
    const intro = panel.querySelector('.page-header p:not(.cgn-eyebrow)');
    if (eyebrow) eyebrow.textContent = 'Admin / Benutzerverwaltung';
    if (title) title.textContent = 'Benutzerverwaltung';
    if (intro) intro.textContent = 'Admin-Übersicht über bekannte Modboard-Benutzer, Rollen und Sitzungen. Der eigene Account bleibt oben rechts im Profilmenü.';

    const infoTitle = [...panel.querySelectorAll('.card-head h2')].find((node) => node.textContent.trim() === 'Bearbeiten kommt in den passenden Bereichen' || node.textContent.trim() === 'Bearbeiten bleibt gesperrt');
    if (infoTitle) infoTitle.textContent = 'Bearbeiten bleibt gesperrt';

    const infoText = panel.querySelector('.admin-lock-note span');
    if (infoText) {
      infoText.textContent = 'Diese Admin-Ansicht ist read-only. Schreibfunktionen kommen erst mit separatem Scope, Permission, Confirm-Write, Audit, Lock und Readback.';
    }

    installStyle();
  }

  function installStyle() {
    if (document.getElementById('rdap113cAdminUsersBackToAdminStyle')) return;

    const style = document.createElement('style');
    style.id = 'rdap113cAdminUsersBackToAdminStyle';
    style.textContent = `
      .nav-group[data-target="nav-admin-users-management"],#nav-admin-users-management{display:none!important}
      [data-page-panel="admin-users"] .page-header p:not(.cgn-eyebrow){max-width:980px}
      [data-page-panel="admin-users"] .admin-lock-note{background:rgba(255,209,102,.08);border:1px solid rgba(255,209,102,.2)}
      [data-page-panel="admin-users"] .admin-lock-note i{background:rgba(255,209,102,.18)}
      [data-page-panel="admin-users"] .admin-user-table{min-height:80px}
    `;
    document.head.appendChild(style);
  }

  function installAdminUsersModule() {
    registerAdminPage();
    removeStandaloneUsersNavigation();
    ensureAdminUsersInAdminMenu();
    polishAdminUsersPanel();
  }

  installAdminUsersModule();

  document.addEventListener('DOMContentLoaded', installAdminUsersModule);
  window.addEventListener('rdap:module-registry-ready', installAdminUsersModule);
  window.addEventListener('rdap:main-router-page-change', (event) => {
    if (event && event.detail && event.detail.page === PAGE_ID) polishAdminUsersPanel();
  });
})();
