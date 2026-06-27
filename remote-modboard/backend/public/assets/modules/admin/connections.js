'use strict';

(function registerAdminConnectionsModule() {
  const PAGE_ID = 'connections';
  const AGENT_STATUS_ENDPOINT = '/api/remote/agent/status';
  const REMOTE_STATUS_ENDPOINT = '/api/remote/status';
  let refreshTimer = null;
  let loading = false;

  function registerConnectionsPage() {
    if (!window.RemoteModboardModules || typeof window.RemoteModboardModules.registerPage !== 'function') return;

    window.RemoteModboardModules.registerPage({
      moduleId: 'admin',
      pageId: PAGE_ID,
      label: 'Verbindungen',
      title: 'Verbindungen',
      tab: 'read-only',
      section: 'Admin',
      order: 30
    });
  }

  function createConnectionsPanel() {
    const content = document.getElementById('remoteModboardContent') || document.querySelector('.cgn-content');
    if (!content) return null;

    let panel = document.querySelector('[data-page-panel="connections"]');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'rdap-view';
      panel.dataset.pagePanel = PAGE_ID;

      const adminUsersPanel = content.querySelector('[data-page-panel="admin-users"]');
      if (adminUsersPanel) content.insertBefore(panel, adminUsersPanel.nextElementSibling);
      else content.appendChild(panel);
    }

    panel.innerHTML = `
      <section class="page-header module-page-header cgn-card rdap-connections-header">
        <div>
          <p class="cgn-eyebrow">Admin / Verbindungen</p>
          <h1>Stream-PC Verbindung</h1>
          <p>Read-only Status fuer die gesicherte Verbindung zwischen Webserver und Stream-PC. Keine Agent-Actions, keine Start-/Stop-Funktionen.</p>
        </div>
        <div class="rdap-connections-header-actions">
          <span class="cgn-chip" id="connectionsAgentPill">lädt</span>
          <button class="secondaryButton small" type="button" id="connectionsRefreshButton">Verbindung neu laden</button>
        </div>
      </section>

      <section class="page-grid rdap-connections-grid">
        <article class="cgn-card span2">
          <div class="card-head">
            <div><p class="cgn-eyebrow">Status</p><h2>Verbindung</h2></div>
            <span class="cgn-chip cgn-chip--info">read-only</span>
          </div>
          <div class="kv-grid">
            <div class="kv-row"><span>Stream-PC</span><strong id="connectionsConnected">—</strong></div>
            <div class="kv-row"><span>Letzter Heartbeat</span><strong id="connectionsHeartbeat">—</strong></div>
            <div class="kv-row"><span>Agent-ID</span><strong id="connectionsAgentId">—</strong></div>
            <div class="kv-row"><span>Agent-Actions</span><strong id="connectionsActions">—</strong></div>
          </div>
        </article>

        <article class="cgn-card span2">
          <div class="card-head">
            <div><p class="cgn-eyebrow">Hinweis</p><h2>Nur Status</h2></div>
            <span class="cgn-chip cgn-chip--warn">geschützt</span>
          </div>
          <div class="admin-lock-note rdap-connections-note">
            <i>!</i>
            <div>
              <strong>Keine Steuerung in diesem Bereich</strong>
              <span>Diese Ansicht zeigt nur Verbindung und Heartbeat. Start-/Stop- und Agent-Aktionen kommen erst mit separatem Scope, Permission, Confirm, Audit, Lock und Readback.</span>
            </div>
          </div>
          <p class="rdap-connections-updated" id="connectionsLastUpdated">Noch nicht geladen</p>
        </article>
      </section>
    `;

    installStyle();
    bindPanelActions();
    return panel;
  }

  function installStyle() {
    if (document.getElementById('rdap117AdminConnectionsStyle')) return;

    const style = document.createElement('style');
    style.id = 'rdap117AdminConnectionsStyle';
    style.textContent = `
      [data-page-panel="connections"] .rdap-connections-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
      [data-page-panel="connections"] .rdap-connections-header p:not(.cgn-eyebrow){max-width:980px}
      [data-page-panel="connections"] .rdap-connections-header-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end}
      [data-page-panel="connections"] .rdap-connections-note{background:rgba(255,209,102,.08);border:1px solid rgba(255,209,102,.18)}
      [data-page-panel="connections"] .rdap-connections-updated{margin:12px 0 0;color:var(--muted);font-size:12px}
    `;
    document.head.appendChild(style);
  }

  function bindPanelActions() {
    const button = document.getElementById('connectionsRefreshButton');
    if (!button || button.dataset.rdap117Bound === '1') return;

    button.dataset.rdap117Bound = '1';
    button.addEventListener('click', () => loadConnectionStatus('manual'));
  }

  async function loadConnectionStatus(reason) {
    if (loading) return;
    loading = true;
    setButtonLoading(true);

    let result = await getJson(AGENT_STATUS_ENDPOINT);
    if (!result.ok) {
      const fallback = await getJson(REMOTE_STATUS_ENDPOINT);
      if (fallback.ok) result = fallback;
    }

    renderConnectionStatus(result, reason);
    setButtonLoading(false);
    loading = false;
  }

  async function getJson(url) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      const body = await response.json().catch(() => null);
      return {
        ok: response.ok && body && body.ok !== false,
        httpStatus: response.status,
        body,
        error: null
      };
    } catch (err) {
      return {
        ok: false,
        httpStatus: 0,
        body: null,
        error: err && err.message ? err.message : 'fetch_failed'
      };
    }
  }

  function renderConnectionStatus(result, reason) {
    const body = result && result.body ? result.body : {};
    const agent = body.agent || body.connection || body;
    const connected = Boolean(agent.connected || agent.online || agent.isConnected);
    const actionsEnabled = Boolean(agent.actionsEnabled || agent.actionEnabled || body.actionEnabled || body.actionsEnabled);
    const heartbeat = agent.lastHeartbeatAt || agent.last_heartbeat_at || agent.lastSeenAt || agent.last_seen_at || agent.lastHeartbeat || agent.heartbeatAt || body.lastHeartbeatAt || '';
    const agentId = agent.agentId || agent.agent_id || agent.id || agent.uid || body.agentId || '—';

    setChip('connectionsAgentPill', result && result.ok && connected, connected ? 'online' : 'offline');
    setText('connectionsConnected', connected ? 'Online' : 'Offline');
    setText('connectionsHeartbeat', formatDate(heartbeat));
    setText('connectionsAgentId', agentId);
    setText('connectionsActions', actionsEnabled ? 'Aktiv' : 'Nicht aktiv');
    setText('connectionsLastUpdated', `Aktualisiert: ${new Date().toLocaleString('de-DE')}${reason ? ` · ${reason}` : ''}`);
  }

  function setButtonLoading(value) {
    const button = document.getElementById('connectionsRefreshButton');
    if (!button) return;
    button.disabled = Boolean(value);
    button.textContent = value ? 'lädt…' : 'Verbindung neu laden';
  }

  function setChip(id, ok, text) {
    const node = document.getElementById(id);
    if (!node) return;
    node.textContent = text;
    node.className = ok ? 'cgn-chip cgn-chip--ok' : 'cgn-chip cgn-chip--warn';
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value == null || value === '' ? '—' : String(value);
  }

  function formatDate(value) {
    if (!value || value === '—') return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('de-DE');
  }

  function pageIsActive() {
    if (window.RdapMainRouter && typeof window.RdapMainRouter.getCurrentPage === 'function') {
      return window.RdapMainRouter.getCurrentPage() === PAGE_ID;
    }
    const panel = document.querySelector('[data-page-panel="connections"]');
    return Boolean(panel && panel.classList.contains('is-active-view'));
  }

  function startStatusRefresh() {
    stopStatusRefresh();
    refreshTimer = window.setInterval(() => {
      if (pageIsActive()) loadConnectionStatus('auto');
    }, 15000);
  }

  function stopStatusRefresh() {
    if (refreshTimer) window.clearInterval(refreshTimer);
    refreshTimer = null;
  }

  function installConnectionsModule() {
    registerConnectionsPage();
    createConnectionsPanel();
    startStatusRefresh();
    loadConnectionStatus('initial');
  }

  installConnectionsModule();

  document.addEventListener('DOMContentLoaded', installConnectionsModule);
  window.addEventListener('rdap:module-registry-ready', installConnectionsModule);
  window.addEventListener('rdap:main-router-page-change', (event) => {
    if (event && event.detail && event.detail.page === PAGE_ID) loadConnectionStatus('page');
  });
})();
