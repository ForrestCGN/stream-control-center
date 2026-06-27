'use strict';

(function registerOverviewModule() {
  const MODULE_ID = 'system';
  const PAGE_ID = 'overview';

  function createOverviewPanel() {
    if (document.querySelector('[data-page-panel="overview"]')) return;

    const content = document.getElementById('remoteModboardContent') || document.querySelector('.cgn-content');
    if (!content) return;

    const errorBox = document.getElementById('errorBox');
    const panel = document.createElement('section');
    panel.className = 'rdap-view is-active-view';
    panel.dataset.pagePanel = PAGE_ID;
    panel.innerHTML = `
      <section class="page-header module-page-header cgn-card">
        <div>
          <p class="cgn-eyebrow">Remote Modboard</p>
          <h1>Übersicht</h1>
          <p>Alles Wichtige auf einen Blick: Server, Login, Stream-PC und die letzten Aktivitäten.</p>
        </div>
      </section>

      <section class="metric-grid">
        <article class="metric-card cgn-card"><span>Server</span><strong id="statusOk">—</strong><small>Remote-Modboard</small><div class="cgn-progress"><i style="width:92%"></i></div></article>
        <article class="metric-card cgn-card"><span>Login</span><strong id="statusAuthEnabled">—</strong><small>Anmeldung</small><div class="cgn-progress"><i style="width:72%"></i></div></article>
        <article class="metric-card cgn-card"><span>Session</span><strong id="statusLoginEnabled">—</strong><small>Benutzerzugriff</small><div class="cgn-progress"><i style="width:72%"></i></div></article>
        <article class="metric-card cgn-card"><span>Bearbeiten</span><strong id="statusWriteEnabled">—</strong><small>aktuell nur erlaubte Bereiche</small><div class="cgn-progress cgn-progress--warn"><i style="width:8%"></i></div></article>
      </section>

      <section class="page-grid">
        <article class="cgn-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Aktivitäten</p><h2>Letzte Änderungen</h2></div><span class="cgn-chip cgn-chip--info">bald</span></div>
          <div class="module-list">
            <div class="module-row"><span class="module-icon blue">🧾</span><div><b>Verlauf wird hier sichtbar</b><small>Wer was wann gemacht hat, wird als nächster Produktbereich eingebunden.</small></div></div>
          </div>
        </article>
        <article class="cgn-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Schnellzugriff</p><h2>Wichtige Bereiche</h2></div><span class="cgn-chip cgn-chip--ok">bereit</span></div>
          <div class="module-list">
            <div class="module-row"><span class="module-icon cyan">👥</span><div><b>Benutzer</b><small>Konten, Rollen und Sitzungen ansehen.</small></div></div>
            <div class="module-row"><span class="module-icon purple">📝</span><div><b>Admin-Notizen</b><small>Notizen lesen und erlaubte Notizen speichern.</small></div></div>
            <div class="module-row"><span class="module-icon green">🟢</span><div><b>Diagnose</b><small>Nur öffnen, wenn etwas nicht funktioniert.</small></div></div>
          </div>
        </article>
      </section>
    `;

    if (errorBox && errorBox.parentNode === content) {
      errorBox.insertAdjacentElement('afterend', panel);
    } else {
      content.insertBefore(panel, content.firstElementChild);
    }
  }

  function registerPage() {
    if (!window.RemoteModboardModules || typeof window.RemoteModboardModules.registerPage !== 'function') return;
    window.RemoteModboardModules.registerPage({
      moduleId: MODULE_ID,
      pageId: PAGE_ID,
      label: 'Übersicht',
      title: 'Übersicht',
      tab: 'Status',
      section: 'System',
      order: 10
    });
  }

  createOverviewPanel();
  registerPage();

  document.addEventListener('DOMContentLoaded', () => {
    createOverviewPanel();
    registerPage();
  });
})();
