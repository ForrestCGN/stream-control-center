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

      <section class="metric-grid rdap108-connection-detail-metrics">
        <article class="metric-card cgn-card"><span>Agent-Version</span><strong id="agentVersion">—</strong><small id="agentProtocolVersion">Protokoll —</small></article>
        <article class="metric-card cgn-card"><span>Heartbeat-Seq</span><strong id="agentHeartbeatSeq">—</strong><small id="agentHeartbeatAge">Alter —</small></article>
        <article class="metric-card cgn-card"><span>Stale nach</span><strong id="agentStaleAfter">—</strong><small id="agentOfflineAfter">Offline nach —</small></article>
        <article class="metric-card cgn-card"><span>Runtime-Gate</span><strong id="agentRuntimeGateState">—</strong><small id="agentRuntimeGateDetail">muss disabled bleiben</small></article>
      </section>

      <section class="page-grid rdap80-connections-grid">
        <article class="cgn-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Transport</p><h2>Geplante Verbindung</h2></div><span class="cgn-chip cgn-chip--info">WSS</span></div>
          <div class="kv-grid">
            <div class="kv-row"><span>Richtung</span><strong id="agentPlannedDirection">—</strong></div>
            <div class="kv-row"><span>Transport</span><strong id="agentPlannedTransport">—</strong></div>
            <div class="kv-row"><span>WS-Pfad</span><strong id="agentPlannedWsPath">—</strong></div>
            <div class="kv-row"><span>Portfreigabe Stream-PC</span><strong id="agentPublicPortRequired">—</strong></div>
            <div class="kv-row"><span>Eingehende Internetverbindung</span><strong id="agentIncomingInternetRequired">—</strong></div>
            <div class="kv-row"><span>Dynamische Stream-PC-IP</span><strong id="agentDynamicIpAllowed">—</strong></div>
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
            <div class="kv-row"><span>DB-Write</span><strong id="agentHeartbeatDbWrite">—</strong></div>
            <div class="kv-row"><span>Heartbeat-Actions</span><strong id="agentHeartbeatActions">—</strong></div>
          </div>
          <div class="rdap80-connections-notice" id="agentStatusNotice">Noch nicht geladen.</div>
        </article>

        <article class="cgn-card span2">
          <div class="card-head"><div><p class="cgn-eyebrow">Runtime-Gates</p><h2>Aktivierung bleibt blockiert</h2></div><span class="cgn-chip cgn-chip--warn">disabled</span></div>
          <div class="kv-grid">
            <div class="kv-row"><span>requestedEnabled</span><strong id="agentRuntimeRequested">—</strong></div>
            <div class="kv-row"><span>acceptBuildEnabled</span><strong id="agentRuntimeAcceptBuild">—</strong></div>
            <div class="kv-row"><span>effectiveEnabled</span><strong id="agentRuntimeEffective">—</strong></div>
            <div class="kv-row"><span>acceptsAgentConnections</span><strong id="agentRuntimeAcceptsConnections">—</strong></div>
            <div class="kv-row"><span>heartbeatReceiverEnabled</span><strong id="agentRuntimeHeartbeatReceiver">—</strong></div>
            <div class="kv-row"><span>actionsEnabled</span><strong id="agentRuntimeActionsEnabled">—</strong></div>
            <div class="kv-row"><span>productiveAgentRuntime</span><strong id="agentRuntimeProductive">—</strong></div>
          </div>
          <div class="rdap80-connections-notice">Alle Runtime-Gates muessen disabled bleiben, bis ein separater Aktivierungsplan existiert.</div>
        </article>

        <article class="cgn-card span2">
          <details class="rdap108-diagnostics">
            <summary><span>Technische Diagnose</span><strong>read-only, ohne Secrets</strong></summary>
            <div class="kv-grid">
              <div class="kv-row"><span>ModuleBuild</span><strong id="agentModuleBuild">—</strong></div>
              <div class="kv-row"><span>generatedAt</span><strong id="agentGeneratedAt">—</strong></div>
              <div class="kv-row"><span>loadedAt</span><strong id="agentLoadedAt">—</strong></div>
              <div class="kv-row"><span>Reject Count</span><strong id="agentRejectCount">—</strong></div>
              <div class="kv-row"><span>Letzter Reject</span><strong id="agentLastRejectAt">—</strong></div>
              <div class="kv-row"><span>Reject Reason</span><strong id="agentLastRejectReason">—</strong></div>
              <div class="kv-row"><span>Agent-ID Header</span><strong id="agentRejectHasAgentIdHeader">—</strong></div>
              <div class="kv-row"><span>Protocol Header</span><strong id="agentRejectHasProtocolHeader">—</strong></div>
              <div class="kv-row"><span>Secrets exposed</span><strong id="agentRejectSecretsExposed">—</strong></div>
            </div>
            <ul class="security-list rdap108-warning-list" id="agentWarningList"><li><span>Warnings</span><strong>—</strong></li></ul>
          </details>
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
    const runtime = (body && body.runtime) || {};
    const heartbeat = (body && body.heartbeat) || {};
    const transport = (body && body.transport) || {};
    const safety = (body && body.safety) || {};
    const rejectDiagnostic = (body && body.rejectDiagnostic) || {};

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
    setText('agentPublicPortRequired', formatYesNo(transport.streamPcPublicPortRequired === true));
    setText('agentIncomingInternetRequired', formatYesNo(transport.incomingInternetConnectionToStreamPcRequired === true));
    setText('agentDynamicIpAllowed', formatYesNo(transport.dynamicStreamPcIpAllowed === true));
    setText('agentStatusApiVersion', body.statusApiVersion || '—');
    setText('agentRuntimeEnabled', agent.enabled === true || runtime.effectiveEnabled === true ? 'temporär aktiv' : 'deaktiviert');
    setText('agentHeartbeatReceiver', heartbeat.heartbeatReceiverEnabled === true ? 'aktiv' : 'deaktiviert');
    setText('agentHeartbeatStorage', heartbeat.lastHeartbeatPayloadStored === true || heartbeat.persistsHeartbeatToDatabase === true ? 'prüfen' : 'in-memory / keine Payload-Speicherung');
    setText('agentHeartbeatDbWrite', heartbeat.databaseWriteEnabled === true || heartbeat.heartbeatPersistsToDatabase === true ? 'prüfen' : 'nein');
    setText('agentHeartbeatActions', heartbeat.heartbeatExecutesActions === true || heartbeat.heartbeatAcceptsCommands === true || heartbeat.heartbeatAcceptsCapabilities === true ? 'prüfen' : 'nein');

    setText('agentVersion', agent.agentVersion || '—');
    setText('agentProtocolVersion', agent.protocolVersion ? `Protokoll ${agent.protocolVersion}` : 'Protokoll —');
    setText('agentHeartbeatSeq', agent.heartbeatSeq !== undefined && agent.heartbeatSeq !== null ? agent.heartbeatSeq : '—');
    setText('agentHeartbeatAge', Number.isFinite(agent.heartbeatAgeMs) ? `Alter ${formatDuration(agent.heartbeatAgeMs)}` : 'Alter —');
    setText('agentStaleAfter', Number.isFinite(heartbeat.staleAfterMs) ? formatDuration(heartbeat.staleAfterMs) : '—');
    setText('agentOfflineAfter', Number.isFinite(heartbeat.offlineAfterMs) ? `Offline nach ${formatDuration(heartbeat.offlineAfterMs)}` : 'Offline nach —');
    setText('agentRuntimeGateState', runtime.effectiveEnabled === true ? 'aktiv' : 'deaktiviert');
    setText('agentRuntimeGateDetail', runtime.acceptsAgentConnections === true ? 'nimmt Verbindungen an' : 'nimmt keine Verbindungen an');

    renderRuntimeGates(runtime, body);
    renderDiagnostics(body, rejectDiagnostic);

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


  function renderRuntimeGates(runtime, body) {
    setText('agentRuntimeRequested', formatEnabled(runtime.requestedEnabled));
    setText('agentRuntimeAcceptBuild', formatEnabled(runtime.acceptBuildEnabled));
    setText('agentRuntimeEffective', formatEnabled(runtime.effectiveEnabled));
    setText('agentRuntimeAcceptsConnections', formatEnabled(runtime.acceptsAgentConnections));
    setText('agentRuntimeHeartbeatReceiver', formatEnabled(runtime.heartbeatReceiverEnabled));
    setText('agentRuntimeActionsEnabled', formatEnabled(runtime.actionsEnabled || body.actionEnabled));
    setText('agentRuntimeProductive', formatEnabled(runtime.productiveAgentRuntime || body.productiveAgentRuntime));
  }

  function renderDiagnostics(body, rejectDiagnostic) {
    setText('agentModuleBuild', body && body.moduleBuild ? body.moduleBuild : '—');
    setText('agentGeneratedAt', body && body.generatedAt ? formatDate(body.generatedAt) : '—');
    setText('agentLoadedAt', body && body.loadedAt ? formatDate(body.loadedAt) : '—');
    setText('agentRejectCount', Number.isFinite(rejectDiagnostic.rejectCount) ? rejectDiagnostic.rejectCount : 0);
    setText('agentLastRejectAt', rejectDiagnostic.lastRejectAt ? formatDate(rejectDiagnostic.lastRejectAt) : '—');
    setText('agentLastRejectReason', rejectDiagnostic.lastRejectReason || '—');
    setText('agentRejectHasAgentIdHeader', formatYesNo(rejectDiagnostic.lastRejectHasAgentIdHeader === true));
    setText('agentRejectHasProtocolHeader', formatYesNo(rejectDiagnostic.lastRejectHasProtocolHeader === true));
    setText('agentRejectSecretsExposed', rejectDiagnostic.rejectSecretsExposed === true ? 'prüfen' : 'nein');
    renderWarnings(body && Array.isArray(body.warnings) ? body.warnings : []);
  }

  function renderWarnings(warnings) {
    const list = document.getElementById('agentWarningList');
    if (!list) return;
    if (!warnings.length) {
      list.innerHTML = '<li><span>Warnings</span><strong>—</strong></li>';
      return;
    }
    list.innerHTML = warnings.map((warning) => `<li><span>${escapeHtml(warning)}</span><strong>Info</strong></li>`).join('');
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
      .rdap108-diagnostics summary{display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;list-style:none}
      .rdap108-diagnostics summary::-webkit-details-marker{display:none}
      .rdap108-diagnostics summary span{font-weight:800}
      .rdap108-diagnostics summary strong{font-size:12px;color:var(--muted);font-weight:700}
      .rdap108-diagnostics[open] summary{margin-bottom:14px}
      .rdap108-warning-list{margin-top:12px}
      @media (max-width:900px){.rdap80-connections-header{flex-direction:column}.rdap80-connections-header-actions{justify-content:flex-start}.rdap80-connections-grid .span2{grid-column:auto}.rdap108-diagnostics summary{align-items:flex-start;flex-direction:column}}
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

  function formatEnabled(value) {
    return value === true ? 'aktiv' : 'deaktiviert';
  }

  function formatYesNo(value) {
    return value === true ? 'ja' : 'nein';
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
