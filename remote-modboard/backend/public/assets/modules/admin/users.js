'use strict';

(function registerAdminUsersModule() {
  const MODULE_ID = 'admin-users-management';
  const PAGE_ID = 'admin-users';

  function registerModuleAndPage() {
    if (!window.RemoteModboardModules || typeof window.RemoteModboardModules.registerModule !== 'function') return;

    window.RemoteModboardModules.registerModule({
      id: MODULE_ID,
      label: 'Benutzer',
      icon: '👥',
      order: 32,
      navSubId: 'nav-admin-users-management'
    });

    window.RemoteModboardModules.registerPage({
      moduleId: MODULE_ID,
      pageId: PAGE_ID,
      label: 'Benutzerverwaltung',
      title: 'Benutzerverwaltung',
      tab: 'read-only',
      section: 'Benutzer',
      order: 10
    });
  }

  function moveAdminUsersOutOfNormalAdminMenu() {
    document.querySelectorAll('#nav-admin .nav-link[data-page="admin-users"]').forEach((button) => button.remove());

    const group = document.querySelector('.nav-group[data-target="nav-admin-users-management"]');
    const sub = document.getElementById('nav-admin-users-management');
    if (group && sub) {
      group.classList.remove('is-open');
      sub.classList.remove('is-open');
    }
  }

  function polishAdminUsersPanel() {
    const panel = document.querySelector('[data-page-panel="admin-users"]');
    if (!panel) return;

    const eyebrow = panel.querySelector('.page-header .cgn-eyebrow');
    const title = panel.querySelector('.page-header h1');
    const intro = panel.querySelector('.page-header p:not(.cgn-eyebrow)');
    if (eyebrow) eyebrow.textContent = 'Benutzer / Verwaltung';
    if (title) title.textContent = 'Benutzerverwaltung';
    if (intro) intro.textContent = 'Bekannte Modboard-Benutzer, Rollen und Sitzungen. Lesen ja, Bearbeiten später nur mit eigener Freigabe.';

    const infoTitle = [...panel.querySelectorAll('.card-head h2')].find((node) => node.textContent.trim() === 'Bearbeiten kommt in den passenden Bereichen');
    if (infoTitle) infoTitle.textContent = 'Bearbeiten bleibt gesperrt';

    const infoText = panel.querySelector('.admin-lock-note span');
    if (infoText) {
      infoText.textContent = 'Diese Ansicht zeigt nur den aktuellen Stand. Schreibfunktionen kommen erst mit separatem Scope, Permission, Confirm-Write, Audit, Lock und Readback.';
    }

    installStyle();
  }

  function installStyle() {
    if (document.getElementById('rdap113AdminUsersModuleStyle')) return;

    const style = document.createElement('style');
    style.id = 'rdap113AdminUsersModuleStyle';
    style.textContent = `
      [data-page-panel="admin-users"] .page-header p:not(.cgn-eyebrow){max-width:980px}
      [data-page-panel="admin-users"] .admin-lock-note{background:rgba(255,209,102,.08);border:1px solid rgba(255,209,102,.2)}
      [data-page-panel="admin-users"] .admin-lock-note i{background:rgba(255,209,102,.18)}
      [data-page-panel="admin-users"] .admin-user-table{min-height:80px}
    `;
    document.head.appendChild(style);
  }

  function installAdminUsersModule() {
    registerModuleAndPage();
    moveAdminUsersOutOfNormalAdminMenu();
    polishAdminUsersPanel();
  }

  installAdminUsersModule();

  document.addEventListener('DOMContentLoaded', installAdminUsersModule);
  window.addEventListener('rdap:module-registry-ready', installAdminUsersModule);
  window.addEventListener('rdap:main-router-page-change', (event) => {
    if (event && event.detail && event.detail.page === PAGE_ID) polishAdminUsersPanel();
  });
})();
