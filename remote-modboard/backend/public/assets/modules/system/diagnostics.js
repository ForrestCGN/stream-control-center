'use strict';

(function registerDiagnosticsModule() {
  const MODULE_ID = 'system';
  const PAGE_ID = 'diagnostics';

  function createDiagnosticsPanel() {
    if (document.querySelector('[data-page-panel="diagnostics"]')) return;

    const content = document.getElementById('remoteModboardContent') || document.querySelector('.cgn-content');
    if (!content) return;

    const panel = document.createElement('section');
    panel.className = 'rdap-view';
    panel.dataset.pagePanel = PAGE_ID;
    panel.innerHTML = `
      <section class="page-header module-page-header cgn-card">
        <p class="cgn-eyebrow">Admin / Diagnose</p>
        <h1>Systemstatus</h1>
        <p>Nur das, was Mods und Streamer brauchen: OK oder Problem. Details gibt es über Info.</p>
      </section>

      <section class="page-grid">
        <article class="cgn-card span2">
          <div class="card-head">
            <div><p class="cgn-eyebrow">Status</p><h2>Modboard-Prüfung</h2></div>
            <span class="cgn-chip" id="endpointPill">lädt</span>
          </div>
          <div class="endpoint-grid" id="endpointList"></div>
        </article>

        <article class="cgn-card span2">
          <div class="card-head">
            <div><p class="cgn-eyebrow">Schutzsystem</p><h2>Bearbeitung & Verlauf</h2></div>
            <span class="cgn-chip" id="lockAuditPill">lädt</span>
          </div>
          <div class="kv-grid">
            <div class="kv-row"><span>Systemdaten</span><strong id="schemaAdapterPrepared">—</strong></div>
            <div class="kv-row"><span>Bearbeitungsschutz</span><strong id="locksRead">—</strong></div>
            <div class="kv-row"><span>Änderungsverlauf</span><strong id="auditRead">—</strong></div>
            <div class="kv-row"><span>Aktive Sperre</span><strong id="lockAcquireEnabled">—</strong></div>
            <div class="kv-row"><span>Verlauf speichern</span><strong id="auditInsertEnabled">—</strong></div>
          </div>
        </article>
      </section>

      <dialog class="rdap-diagnostics-dialog" id="diagnosticsInfoDialog">
        <form method="dialog">
          <button class="cgn-icon-button rdap-diagnostics-dialog-close" value="close" aria-label="Info schließen">×</button>
        </form>
        <p class="cgn-eyebrow">Info für Admin</p>
        <h2 id="diagnosticsInfoTitle">—</h2>
        <p id="diagnosticsInfoSummary">—</p>
        <div class="kv-grid rdap-diagnostics-info-grid">
          <div class="kv-row"><span>Status</span><strong id="diagnosticsInfoState">—</strong></div>
          <div class="kv-row"><span>Hinweis</span><strong id="diagnosticsInfoHint">—</strong></div>
          <div class="kv-row"><span>Technische Info</span><strong id="diagnosticsInfoTechnical">—</strong></div>
        </div>
      </dialog>
    `;

    const firstPanel = content.querySelector('[data-page-panel]');
    if (firstPanel) content.insertBefore(panel, firstPanel.nextElementSibling);
    else content.appendChild(panel);

    installDiagnosticsPolish();
    installDiagnosticsInfoButtons();
  }

  function registerPage() {
    if (!window.RemoteModboardModules || typeof window.RemoteModboardModules.registerPage !== 'function') return;
    window.RemoteModboardModules.registerPage({
      moduleId: MODULE_ID,
      pageId: PAGE_ID,
      label: 'Diagnose',
      title: 'Diagnose',
      tab: 'Status',
      section: 'System',
      order: 20
    });
  }

  function installDiagnosticsPolish() {
    if (document.getElementById('rdap111DiagnosticsModuleStyle')) return;
    const style = document.createElement('style');
    style.id = 'rdap111DiagnosticsModuleStyle';
    style.textContent = `
      .endpoint{position:relative}
      .endpoint .rdap-diagnostics-human-detail{display:block;margin-top:4px;opacity:.78;padding-right:34px}
      .endpoint .rdap-diagnostics-info-button{position:absolute;top:12px;right:12px;width:28px;height:28px;min-width:28px;padding:0;border-radius:999px;font-weight:900;line-height:1}
      .rdap-diagnostics-dialog{max-width:min(720px,92vw);border:1px solid rgba(255,255,255,.22);border-radius:22px;padding:22px;background:#160925;color:#fff;box-shadow:0 30px 80px rgba(0,0,0,.65)}
      .rdap-diagnostics-dialog::backdrop{background:rgba(0,0,0,.68);backdrop-filter:blur(4px)}
      .rdap-diagnostics-dialog-close{float:right}
      .rdap-diagnostics-info-grid{margin-top:14px}
    `;
    document.head.appendChild(style);
  }

  function installDiagnosticsInfoButtons() {
    document.addEventListener('click', (event) => {
      const button = event.target && event.target.closest ? event.target.closest('[data-rdap-diagnostics-info]') : null;
      if (!button) return;
      openDiagnosticsInfo(button);
    });

    const endpointList = document.getElementById('endpointList');
    if (!endpointList || endpointList.dataset.rdap111Observer === '1') return;
    endpointList.dataset.rdap111Observer = '1';
    const observer = new MutationObserver(() => humanizeEndpointRows(endpointList));
    observer.observe(endpointList, { childList: true, subtree: true });
    humanizeEndpointRows(endpointList);
  }

  function humanizeEndpointRows(endpointList) {
    endpointList.querySelectorAll('.endpoint').forEach((row) => {
      if (row.dataset.rdap111Humanized === '1') return;
      row.dataset.rdap111Humanized = '1';

      const labelNode = row.querySelector('span');
      const stateNode = row.querySelector('strong');
      const detailNode = row.querySelector('small');
      const label = labelNode ? labelNode.textContent.trim() : 'Prüfung';
      const state = stateNode ? stateNode.textContent.trim() : '—';
      const technical = detailNode ? detailNode.textContent.trim() : '—';
      const ok = row.classList.contains('ok') || /^OK$/i.test(state);

      if (detailNode) {
        detailNode.className = 'rdap-diagnostics-human-detail';
        detailNode.textContent = ok
          ? 'Bereit.'
          : 'Problem gefunden. Bitte Streamer oder Admin informieren.';
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'secondaryButton small rdap-diagnostics-info-button';
      button.dataset.rdapDiagnosticsInfo = '1';
      button.dataset.title = label;
      button.dataset.state = ok ? 'OK' : 'Problem';
      button.dataset.summary = ok
        ? `${label} ist erreichbar. Es ist keine Aktion nötig.`
        : `${label} meldet ein Problem. Ein Mod kann diese Info an Streamer oder Admin weitergeben.`;
      button.dataset.hint = ok
        ? 'Keine Aktion nötig.'
        : 'Streamer/Admin informieren und die technische Info weitergeben.';
      button.dataset.technical = technical || '—';
      button.textContent = 'i';
      button.title = `Info zu ${label}`;
      button.setAttribute('aria-label', `Info zu ${label}`);
      row.appendChild(button);
    });
  }

  function openDiagnosticsInfo(button) {
    const dialog = document.getElementById('diagnosticsInfoDialog');
    if (!dialog) return;
    setText('diagnosticsInfoTitle', button.dataset.title || 'Diagnose');
    setText('diagnosticsInfoSummary', button.dataset.summary || '—');
    setText('diagnosticsInfoState', button.dataset.state || '—');
    setText('diagnosticsInfoHint', button.dataset.hint || '—');
    setText('diagnosticsInfoTechnical', button.dataset.technical || '—');

    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', 'open');
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value == null || value === '' ? '—' : String(value);
  }

  createDiagnosticsPanel();
  registerPage();

  document.addEventListener('DOMContentLoaded', () => {
    createDiagnosticsPanel();
    registerPage();
  });
})();
