'use strict';

(function rdap80AgentStatusPage() {
  const ENDPOINT = '/api/remote/agent/status';
  const PAGE_ID = 'admin-connections';
  const MODULE_ID = 'admin';

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('rdap:main-router-page-change', (event) => {
    const page = event && event.detail && event.detail.page;
    if (page === PAGE_ID) loadAgentStatus('page-change');
  });

  function init() {
    injectStyles();
    ensurePanel();
    registerPage();
    bindActions();
    loadAgentStatus('initial');
  }

  function registerPage() {
    const registry = window.RemoteModboardModules;
    if (!registry || typeof registry.registerPage !== 'function') return;

    registry.registerPage({
      moduleId: MODULE_ID,
      pageId: PAGE_ID,
      label: 'Verbindungen',
      title: 'Stream-PC Verbindung',
      tab: 'Read-only',
      section: 'Admin',
      order: 60,
      permission: 'agent.status.read'
    });
  }

  function ensurePanel() {
    if (document.querySelector(`[data-page-panel="${PAGE_ID}"]`)) return;
    const content = document.querySelector('.cgn-content');
    if (!content) return;

    const panel = document.createElement('section');
    panel.className = 'rdap-view';
    panel.dataset.pagePanel = PAGE_ID;
    panel.hidden = true;
    panel.innerHTML = `
      <section class="page-header module-page-header cgn-card rdap80-connections-header">
        <div>
          <p class="cgn-eyebrow">Admin / Verbindungen</p>
          <h1>Stream-PC Verbindung</h1>
          <p>Read-only Status fuer die gesicherte Verbindung zwischen Webserver und Stream-PC. Zeigt nur Verbindungs- und Heartbeat-Informationen; keine Agent-Actions, keine Start-/Stop-Funktionen.</p>
        </div>
        <div class="rdap80-connections-header-actions">
          <span class="cgn-chip cgn-chip--warn" id="agentStatusChip">offline</span>
          <button class="secondaryButton small" type="button" id="agentStatusReloadButton">Verbindung neu laden</button>
        </div>
      </section>

      <section class="metric-grid rdap80-connections-metrics">
        <article class="metric-card cgn-card"><span>Verbindung</span><strong id="agentConnectionState">—</strong><small id="agentConnectionDetail">Stream-PC</small><div class="cgn-progress cgn-progress--warn" id="agentConnectionProgress"><i style="width:8%"></i></div></article>
        <article class="metric-card cgn-card"><span>Heartbeat</span><strong id="agentHeartbeatAt">—</strong><small id="agentHeartbeatDetail">keine aktive Meldung</small><div class="cgn-progress cgn-progress--warn" id="agentHeartbeatProgress"><i style="width:8%"></i></div></article>
        <article class="metric-card cgn-card"><span>Ziel</span><strong id="agentExpectedName">—</strong><small id="agentExpectedId">—</small><div class="cgn-progress"><i style="width:42%"></i></div></article>
        <article class="metric-card cgn-card"><span>Actions</span><strong id="agentActionsEnabled">—</strong><small id="agentActionsDetail">muss disabled bleiben</small><div class="cgn-progress cgn-progress--warn"><i style="width:8%"></i></div></article>
      </section>

      <section class="page-grid rdap80-connections-grid">
        <article class="cgn-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Transport</p><h2>Geplante Verbindung</h2></div><span class="cgn-chip cgn-chip--info">WSS</span></div>
          <div class="kv-grid">
            <div class="kv-row"><span>Richtung</span><strong id="agentPlannedDirection">—</strong></div>
            <div class="kv-row"><span>Transport</span><strong id="agentPlannedTransport">—</strong></div>
            <div class="kv-row"><span>WS-Pfad</span><strong id="agentPlannedWsPath">—</strong></div>
            <div class="kv-row"><span>Portfreigabe Stream-PC</span><strong id="agentPublicPortRequired">—</strong></div>
          </div>
        </article>

        <article class="cgn-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Sicherheit</p><h2>Harte Grenzen</h2></div><span class="cgn-chip cgn-chip--ok">geschützt</span></div>
          <ul class="security-list" id="agentSafetyList"><li><span>Keine Actions</span><strong>OK</strong></li></ul>
        </article>

        <article class="cgn-card span2">
          <div class="card-head"><div><p class="cgn-eyebrow">Statusmodell</p><h2>Heartbeat-Foundation</h2></div><span class="cgn-chip cgn-chip--warn">read-only</span></div>
          <div class="kv-grid">
            <div class="kv-row"><span>Status API</span><strong id="agentStatusApiVersion">—</strong></div>
            <div class="kv-row"><span>Runtime</span><strong id="agentRuntimeEnabled">—</strong></div>
            <div class="kv-row"><span>Heartbeat Receiver</span><strong id="agentHeartbeatReceiver">—</strong></div>
            <div class="kv-row"><span>Speicherung</span><strong id="agentHeartbeatStorage">—</strong></div>
          </div>
          <div class="rdap80-connections-notice" id="agentStatusNotice">Noch nicht geladen.</div>
        </article>
      </section>
    `;

    content.appendChild(panel);
  }

  function bindActions() {
    const reload = document.getElementById('agentStatusReloadButton');
    if (reload) reload.addEventListener('click', () => loadAgentStatus('manual'));
  }

  async function loadAgentStatus(reason) {
    const result = await getJson(ENDPOINT);
    if (!result.ok) {
      renderError(result);
      updateQuickAgentChip('Verbindung prüfen', false);
      return;
    }
    renderAgentStatus(result.body, reason);
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

  function renderAgentStatus(body, reason) {
    const agent = (body && body.agent) || {};
    const heartbeat = (body && body.heartbeat) || {};
    const transport = (body && body.transport) || {};
    const safety = (body && body.safety) || {};

    const connected = agent.connected === true;
    const stale = agent.stale === true;
    const actionsEnabled = agent.actionsEnabled === true || body.actionEnabled === true;
    const productiveAgentRuntime = body.productiveAgentRuntime === true;
    const viewState = buildConnectionViewState(connected, stale);

    setText('agentConnectionState', viewState.label);
    setText('agentConnectionDetail', viewState.detail);
    setText('agentHeartbeatAt', agent.lastHeartbeatAt ? formatDate(agent.lastHeartbeatAt) : '—');
    setText('agentHeartbeatDetail', buildHeartbeatDetail(agent));
    setText('agentExpectedName', agent.expectedAgentName || agent.agentName || 'Forrest Stream-PC');
    setText('agentExpectedId', agent.expectedAgentId ? `Ziel-ID: ${agent.expectedAgentId}` : 'Ziel-ID: —');
    setText('agentActionsEnabled', actionsEnabled ? 'aktiv' : 'deaktiviert');
    setText('agentActionsDetail', productiveAgentRuntime ? 'produktive Agent-Actions aktiv' : 'keine produktiven Agent-Actions');
    setText('agentPlannedDirection', formatDirection(transport.plannedDirection));
    setText('agentPlannedTransport', String(transport.plannedTransport || 'wss').toUpperCase());
    setText('agentPlannedWsPath', transport.plannedWsPath || '/agent-ws');
    setText('agentPublicPortRequired', transport.streamPcPublicPortRequired === true ? 'ja' : 'nein');
    setText('agentStatusApiVersion', body.statusApiVersion || '—');
    setText('agentRuntimeEnabled', agent.enabled === true || (body.runtime && body.runtime.effectiveEnabled === true) ? 'temporär aktiv' : 'deaktiviert');
    setText('agentHeartbeatReceiver', heartbeat.heartbeatReceiverEnabled === true ? 'aktiv' : 'deaktiviert');
    setText('agentHeartbeatStorage', heartbeat.lastHeartbeatPayloadStored === true || heartbeat.persistsHeartbeatToDatabase === true ? 'prüfen' : 'in-memory / keine Payload-Speicherung');

    setProgressState('agentConnectionProgress', viewState.ok ? 'ok' : 'warn', viewState.ok ? 78 : 8);
    setProgressState('agentHeartbeatProgress', connected && !stale ? 'ok' : 'warn', connected && !stale ? 70 : 8);

    const chip = document.getElementById('agentStatusChip');
    if (chip) {
      chip.className = viewState.ok ? 'cgn-chip cgn-chip--ok' : 'cgn-chip cgn-chip--warn';
      chip.textContent = viewState.chip;
    }

    renderSafety(safety);
    setText('agentStatusNotice', `RDAP103: Stream-PC-Verbindungsstatus read-only geladen (${reason || 'auto'}). Keine Agent-Actions aktiv.`);
    updateQuickAgentChip(viewState.quickChip, viewState.ok);
  }

  function buildConnectionViewState(connected, stale) {
    if (connected && stale) {
      return {
        label: 'veraltet',
        detail: 'Heartbeat zu alt',
        chip: 'veraltet',
        quickChip: 'Verbindung veraltet',
        ok: false
      };
    }

    if (connected) {
      return {
        label: 'verbunden',
        detail: 'Stream-PC online',
        chip: 'online',
        quickChip: 'Verbindung online',
        ok: true
      };
    }

    return {
      label: 'offline',
      detail: 'kein Stream-PC verbunden',
      chip: 'offline',
      quickChip: 'Verbindung offline',
      ok: false
    };
  }

  function buildHeartbeatDetail(agent) {
    if (!agent || !agent.lastHeartbeatAt) return 'keine aktive Meldung';

    const parts = [];
    if (Number.isFinite(agent.heartbeatAgeMs)) parts.push(`vor ${formatDuration(agent.heartbeatAgeMs)}`);
    if (agent.heartbeatSeq !== undefined && agent.heartbeatSeq !== null) parts.push(`Seq ${agent.heartbeatSeq}`);
    if (agent.heartbeatProtocolVersion) parts.push(agent.heartbeatProtocolVersion);
    return parts.length ? parts.join(' · ') : 'Heartbeat empfangen';
  }

  function renderSafety(safety) {
    const items = [
      ['Keine OBS-Steuerung', safety.noObsControl],
      ['Keine Sound-Auslösung', safety.noSoundControl],
      ['Keine Overlay-Schaltung', safety.noOverlayControl],
      ['Keine Commands/Channelpoints', safety.noCommandsOrChannelpoints],
      ['Keine Shell-/Prozessaktionen', safety.noShellOrProcessActions],
      ['Keine freien Dateioperationen', safety.noFileWrite],
      ['Keine freie URL-Ausführung', safety.noFreeUrlExecution],
      ['Keine Remote-Actions', safety.noAgentActionExecution]
    ];

    const list = document.getElementById('agentSafetyList');
    if (!list) return;
    list.innerHTML = items.map(([label, ok]) => {
      const good = ok === true;
      return `<li><span>${escapeHtml(label)}</span><strong class="${good ? 'valueTrue' : 'valueFalse'}">${good ? 'OK' : 'prüfen'}</strong></li>`;
    }).join('');
  }

  function renderError(result) {
    setText('agentStatusNotice', `Verbindungsstatus konnte nicht geladen werden: ${escapePlain(result.error || `HTTP ${result.httpStatus || 0}`)}`);
    setText('agentConnectionState', 'prüfen');
    setText('agentConnectionDetail', 'Status nicht abrufbar');
    setText('agentHeartbeatAt', '—');
    setText('agentHeartbeatDetail', 'keine aktive Meldung');
    const chip = document.getElementById('agentStatusChip');
    if (chip) {
      chip.className = 'cgn-chip cgn-chip--warn';
      chip.textContent = 'prüfen';
    }
  }

  function updateQuickAgentChip(text, ok) {
    const chip = document.getElementById('quickAgent');
    if (!chip) return;
    chip.textContent = text;
    chip.classList.toggle('cgn-chip--ok', Boolean(ok));
    chip.classList.toggle('cgn-chip--warn', !ok);
  }

  function injectStyles() {
    if (document.getElementById('rdap80ConnectionsStatusStyle')) return;
    const style = document.createElement('style');
    style.id = 'rdap80ConnectionsStatusStyle';
    style.textContent = `
      [data-page-panel="admin-connections"].is-active-view{display:grid;gap:18px}
      .rdap80-connections-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
      .rdap80-connections-header-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap}
      .rdap80-connections-grid .span2{grid-column:1/-1}
      .rdap80-connections-notice{margin-top:12px;padding:10px 12px;border-radius:14px;background:rgba(27,216,255,.08);border:1px solid rgba(27,216,255,.18);color:var(--muted);font-size:13px;line-height:1.35}
      @media (max-width:900px){.rdap80-connections-header{flex-direction:column}.rdap80-connections-header-actions{justify-content:flex-start}.rdap80-connections-grid .span2{grid-column:auto}}
    `;
    document.head.appendChild(style);
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value === undefined || value === null || value === '' ? '—' : String(value);
  }

  function setProgressState(id, state, width) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('cgn-progress--warn', state !== 'ok');
    const bar = el.querySelector('i');
    if (bar) bar.style.width = `${Math.max(0, Math.min(100, Number(width) || 0))}%`;
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value || '—');
    return date.toLocaleString('de-DE');
  }

  function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.round(Number(ms) / 1000));
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes < 60) return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const restMinutes = minutes % 60;
    return restMinutes ? `${hours}h ${restMinutes}m` : `${hours}h`;
  }

  function formatDirection(value) {
    if (value === 'stream-pc-agent-to-webserver') return 'Stream-PC → Webserver';
    return value || 'Stream-PC → Webserver';
  }

  function escapePlain(value) {
    return String(value || '').replace(/[<>]/g, '');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[char]));
  }
})();
