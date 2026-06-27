'use strict';

(function registerAdminAccessModule() {
  const PAGE_ID = 'access';

  function registerAdminAccessPage() {
    if (!window.RemoteModboardModules || typeof window.RemoteModboardModules.registerPage !== 'function') return;

    window.RemoteModboardModules.registerPage({
      moduleId: 'admin',
      pageId: PAGE_ID,
      label: 'Rollen & Rechte',
      title: 'Rollen & Rechte',
      tab: 'read-only',
      section: 'Admin',
      order: 30
    });
  }

  function ensureAccessInAdminMenu() {
    const adminSub = document.getElementById('nav-admin');
    if (!adminSub) return;

    let button = adminSub.querySelector('.nav-link[data-page="access"]');
    if (!button) {
      button = document.createElement('button');
      button.className = 'nav-link';
      button.type = 'button';
      button.dataset.page = PAGE_ID;

      const before = [...adminSub.querySelectorAll('.nav-link[data-page]')]
        .find((candidate) => Number(candidate.dataset.order || 100) > 30);
      if (before) adminSub.insertBefore(button, before);
      else adminSub.appendChild(button);
    }

    button.dataset.section = 'Admin';
    button.dataset.title = 'Rollen & Rechte';
    button.dataset.tab = 'read-only';
    button.dataset.moduleId = 'admin';
    button.dataset.order = '30';
    button.textContent = 'Rollen & Rechte';
  }

  function polishAccessPanel() {
    const panel = document.querySelector('[data-page-panel="access"]');
    if (!panel) return;

    const eyebrow = panel.querySelector('.page-header .cgn-eyebrow');
    const title = panel.querySelector('.page-header h1');
    const intro = panel.querySelector('.page-header p:not(.cgn-eyebrow)');

    if (eyebrow) eyebrow.textContent = 'Admin / Rollen & Rechte';
    if (title) title.textContent = 'Rollen & Rechte';
    if (intro) intro.textContent = 'Read-only Übersicht darüber, wer Zugriff hat und welches Rollenmodell aktuell sichtbar ist. Änderungen kommen später mit eigener Freigabe.';

    const currentUserHead = [...panel.querySelectorAll('.card-head h2')].find((node) => node.textContent.trim() === 'Session & Zugriff');
    if (currentUserHead) currentUserHead.textContent = 'Aktuelle Session';

    const modelHead = [...panel.querySelectorAll('.card-head h2')].find((node) => node.textContent.trim() === 'Rollen, Gruppen & Rechte');
    if (modelHead) modelHead.textContent = 'Sichtbares Rollenmodell';

    const diagnosticHead = [...panel.querySelectorAll('.card-head h2')].find((node) => node.textContent.trim() === 'Schema & Tabellen');
    if (diagnosticHead) diagnosticHead.textContent = 'Technischer Zustand';

    const note = panel.querySelector('.access-note');
    if (note && note.dataset.rdap115Polished !== '1') {
      note.dataset.rdap115Polished = '1';
      note.innerHTML = `
        <p>Der Server entscheidet weiterhin, wer Zugriff bekommt.</p>
        <p>Diese Ansicht zeigt nur den aktuellen Stand. Bearbeiten bleibt gesperrt.</p>
      `;
    }

    installStyle();
  }

  function installStyle() {
    if (document.getElementById('rdap115AccessModuleStyle')) return;

    const style = document.createElement('style');
    style.id = 'rdap115AccessModuleStyle';
    style.textContent = `
      [data-page-panel="access"] .page-header p:not(.cgn-eyebrow){max-width:980px}
      [data-page-panel="access"] .metric-card small{opacity:.8}
      [data-page-panel="access"] .access-note{display:grid;gap:8px;padding:12px;border-radius:16px;background:rgba(27,216,255,.06);border:1px solid rgba(27,216,255,.16)}
      [data-page-panel="access"] .access-note p{margin:0;color:var(--muted);line-height:1.42}
      [data-page-panel="access"] .access-columns{gap:12px}
      [data-page-panel="access"] .access-columns h3{margin-bottom:8px}
      [data-page-panel="access"] .model-list{min-height:62px}
      [data-page-panel="access"] .page-grid > .cgn-card:last-child{opacity:.86}
    `;
    document.head.appendChild(style);
  }

  function installAccessModule() {
    registerAdminAccessPage();
    ensureAccessInAdminMenu();
    polishAccessPanel();
  }

  installAccessModule();

  document.addEventListener('DOMContentLoaded', installAccessModule);
  window.addEventListener('rdap:module-registry-ready', installAccessModule);
  window.addEventListener('rdap:main-router-page-change', (event) => {
    if (event && event.detail && event.detail.page === PAGE_ID) polishAccessPanel();
  });
})();
