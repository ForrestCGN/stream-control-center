'use strict';

(function registerAdminNotesModule() {
  const PAGE_ID = 'admin-notes';

  function registerAdminNotesPage() {
    if (!window.RemoteModboardModules || typeof window.RemoteModboardModules.registerPage !== 'function') return;

    window.RemoteModboardModules.registerPage({
      moduleId: 'admin',
      pageId: PAGE_ID,
      label: 'Admin-Notizen',
      title: 'Admin-Notizen',
      tab: 'read-only',
      section: 'Admin',
      order: 20,
      permission: 'admin.users.note.read'
    });
  }

  function polishAdminNotesPanel() {
    const panel = document.querySelector('[data-page-panel="admin-notes"]');
    if (!panel) return;

    const header = panel.querySelector('.module-page-header, .page-header');
    const eyebrow = header ? header.querySelector('.cgn-eyebrow') : null;
    const title = header ? header.querySelector('h1') : null;
    const intro = header ? header.querySelector('p:not(.cgn-eyebrow)') : null;

    if (eyebrow) eyebrow.textContent = 'Admin / Notizen';
    if (title) title.textContent = 'Admin-Notizen';
    if (intro) intro.textContent = 'Notizen zu Benutzern und Moderationsentscheidungen. Schreiben bleibt nur über die vorbereiteten gesicherten Admin-Flows.';

    normalizeAdminNotesLabels(panel);
    installAdminNotesModuleStyle();
  }

  function normalizeAdminNotesLabels(panel) {
    const titles = [...panel.querySelectorAll('.card-head h2')];
    titles.forEach((node) => {
      const text = node.textContent.trim();
      if (text === 'Admin Note Target' || text === 'Zielbenutzer') node.textContent = 'Benutzer auswählen';
      if (text === 'Admin Notes' || text === 'Notizen') node.textContent = 'Notizen';
      if (text === 'Schreiben vorbereitet' || text === 'Neue Notiz') node.textContent = 'Neue Notiz';
      if (text === 'Readback' || text === 'Status') node.textContent = 'Status';
    });

    const lockNotes = panel.querySelectorAll('.admin-note-panel-lock span, .admin-lock-note span');
    lockNotes.forEach((node) => {
      if (!node.textContent.trim()) return;
      node.textContent = 'Schreibfunktionen bleiben gesichert: Permission, Confirm-Write, Audit, Lock und Readback.';
    });
  }

  function installAdminNotesModuleStyle() {
    if (document.getElementById('rdap116AdminNotesModuleStyle')) return;

    const style = document.createElement('style');
    style.id = 'rdap116AdminNotesModuleStyle';
    style.textContent = `
      [data-page-panel="admin-notes"] .module-page-header,
      [data-page-panel="admin-notes"] .page-header{border-radius:18px}
      [data-page-panel="admin-notes"] .module-page-header p:not(.cgn-eyebrow),
      [data-page-panel="admin-notes"] .page-header p:not(.cgn-eyebrow){max-width:980px}
      [data-page-panel="admin-notes"] .admin-note-target-card{border-color:rgba(27,216,255,.18)}
      [data-page-panel="admin-notes"] .admin-note-list-card{border-color:rgba(155,77,255,.18)}
      [data-page-panel="admin-notes"] .admin-note-panel-lock,
      [data-page-panel="admin-notes"] .admin-lock-note{background:rgba(255,209,102,.08);border:1px solid rgba(255,209,102,.18)}
    `;
    document.head.appendChild(style);
  }

  function installAdminNotesModule() {
    registerAdminNotesPage();
    polishAdminNotesPanel();
  }

  installAdminNotesModule();

  document.addEventListener('DOMContentLoaded', installAdminNotesModule);
  window.addEventListener('rdap:module-registry-ready', installAdminNotesModule);
  window.addEventListener('rdap:main-router-page-change', (event) => {
    if (event && event.detail && event.detail.page === PAGE_ID) polishAdminNotesPanel();
  });

  const observer = new MutationObserver(() => {
    const panel = document.querySelector('[data-page-panel="admin-notes"]');
    if (panel && !panel.dataset.rdap116Polished) {
      panel.dataset.rdap116Polished = '1';
      window.requestAnimationFrame(polishAdminNotesPanel);
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
