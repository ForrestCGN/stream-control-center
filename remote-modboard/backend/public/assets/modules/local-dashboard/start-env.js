'use strict';

(function registerLocalDashboardPage() {
  const MODULE_ID = 'local-dashboard';
  const PAGE_ID = 'start-env';

  function readText(value, fallback) {
    if (value === null || typeof value === 'undefined' || value === '') return fallback;
    return String(value);
  }

  function yesNo(value) {
    return value ? 'ja' : 'nein';
  }

  async function fetchStatus() {
    try {
      const response = await fetch('/api/remote/status', { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error(`status_${response.status}`);
      return await response.json();
    } catch (err) {
      return { ok: false, error: err && err.message ? err.message : 'status_unavailable' };
    }
  }

  function createPanel() {
    const existingPanel = document.querySelector(`[data-page-panel="${PAGE_ID}"]`);
    if (existingPanel && !existingPanel.dataset.modulePlaceholder) return existingPanel;

    const content = document.getElementById('remoteModboardContent') || document.querySelector('.cgn-content');
    if (!content) return null;

    const errorBox = document.getElementById('errorBox');
    const panel = document.createElement('section');
    panel.className = 'rdap-view is-active-view';
    panel.dataset.pagePanel = PAGE_ID;
    panel.innerHTML = `
      <section class="page-header module-page-header cgn-card">
        <div>
          <p class="cgn-eyebrow">Lokales Dashboard</p>
          <h1>Start / Env</h1>
          <p>Lokale Start- und Env-Hinweise ohne Secrets. Diese Seite startet nichts.</p>
        </div>
        <span class="cgn-chip cgn-chip--info">read-only</span>
      </section>
      <section class="metric-grid">
        <article class="metric-card cgn-card"><span>Backend-Modus</span><strong data-rdap-value="visibleLabel">—</strong><small data-rdap-value="runtimeMode">—</small><div class="cgn-progress"><i style="width:65%"></i></div></article>
        <article class="metric-card cgn-card"><span>Bind Host</span><strong data-rdap-value="bindHost">—</strong><small>REMOTE_MODBOARD_HOST</small><div class="cgn-progress"><i style="width:50%"></i></div></article>
        <article class="metric-card cgn-card"><span>Actions</span><strong data-rdap-value="actions">—</strong><small>nicht aktiv</small><div class="cgn-progress cgn-progress--warn"><i style="width:0%"></i></div></article>
        <article class="metric-card cgn-card"><span>Agent-Actions</span><strong data-rdap-value="agentActions">—</strong><small>nicht aktiv</small><div class="cgn-progress cgn-progress--warn"><i style="width:0%"></i></div></article>
      </section>
      <section class="page-grid">
        <article class="cgn-card"><div class="card-head"><div><p class="cgn-eyebrow">Backend Env</p><h2>Lokales Zielprofil</h2></div><span class="cgn-chip">ohne Secrets</span></div><pre>REMOTE_MODBOARD_MODE=local
REMOTE_MODBOARD_HOST=0.0.0.0
REMOTE_MODBOARD_PORT=3010
REMOTE_MODBOARD_LOCAL_DISPLAY_NAME=ForrestCGN Lokales Dashboard</pre></article>
        <article class="cgn-card"><div class="card-head"><div><p class="cgn-eyebrow">Agent Env</p><h2>Manueller Start</h2></div><span class="cgn-chip">keine Secrets</span></div><pre>cd D:\Git\stream-control-center\remote-modboard\stream-pc-agent
npm run check
npm start</pre><p class="muted">SCC_AGENT_ACCESS_KEY wird lokal gesetzt und nicht in Git, Chat oder Logs geschrieben.</p></article>
      </section>
`;

    if (existingPanel && existingPanel.parentNode) {
      existingPanel.replaceWith(panel);
    } else if (errorBox && errorBox.parentNode === content) {
      errorBox.insertAdjacentElement('afterend', panel);
    } else {
      content.insertBefore(panel, content.firstElementChild);
    }

    return panel;
  }

  function renderStatus(panel, status) {
    if (!panel) return;
    const agent = status && status.agent ? status.agent : {};
    const localDashboard = status && status.localDashboardProfile ? status.localDashboardProfile : {};
    const localLan = status && status.localLanMode ? status.localLanMode : {};
    const app = status && status.app ? status.app : {};

    panel.querySelectorAll('[data-rdap-value]').forEach(node => {
      const key = node.dataset.rdapValue;
      const value = {
        runtimeMode: status.runtimeMode || 'online',
        visibleLabel: localDashboard.visibleLabel || app.runtimeLabel || 'Onlinemodus',
        version: status.version || '—',
        buildName: status.buildName || '—',
        agentConnected: yesNo(agent.connected),
        agentState: agent.connectionState || 'unbekannt',
        agentActions: yesNo(localDashboard.agentActionsEnabled === true),
        actions: yesNo(localDashboard.actionsEnabled === true),
        productiveWrites: yesNo(localDashboard.productiveWritesEnabled === true),
        lanAllowed: yesNo(localLan.lanUseAllowed === true),
        bindHost: readText(localLan.bindHost, '127.0.0.1'),
        allowedCidrs: Array.isArray(localLan.allowedCidrs) ? localLan.allowedCidrs.join(', ') : '127.0.0.1/32'
      }[key];
      node.textContent = readText(value, '—');
    });
  }

  function registerPage() {
    if (!window.RemoteModboardModules || typeof window.RemoteModboardModules.registerPage !== 'function') return;
    window.RemoteModboardModules.registerPage({
      moduleId: MODULE_ID,
      pageId: PAGE_ID,
      label: 'Start / Env',
      title: 'Start / Env',
      tab: 'read-only',
      section: 'Lokales Dashboard',
      order: 30,
      runtime: 'local',
      permission: 'local.env.read'
    });
  }

  async function init() {
    const panel = createPanel();
    registerPage();
    const status = await fetchStatus();
    renderStatus(panel, status);
  }

  init();
  document.addEventListener('DOMContentLoaded', init);
})();
