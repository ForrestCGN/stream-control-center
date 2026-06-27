'use strict';

(function streamingPcConnectionPage() {
  const ENDPOINT = '/api/remote/agent/status';
  const PAGE_ID = 'admin-connections';
  const MODULE_ID = 'admin';
  const AUTO_REFRESH_MS = 15000;
  let refreshTimer = null;

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('rdap:main-router-page-change', (event) => {
    const page = event && event.detail && event.detail.page;
    if (page === PAGE_ID) loadConnectionStatus('page-change');
  });

  function init() {
    injectStyles();
    ensurePanel();
    registerPage();
    bindActions();
    loadConnectionStatus('initial');
    startAutoRefresh();
  }

  function registerPage() {
    const registry = window.RemoteModboardModules;
    if (!registry || typeof registry.registerPage !== 'function') return;

    registry.registerPage({
      moduleId: MODULE_ID,
      pageId: PAGE_ID,
      label: 'Verbindungen',
      title: 'Streaming-PC Verbindung',
      tab: 'Status',
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
      <section class="page-header module-page-header cgn-card rdap120-connection-header">
        <div>
          <p class="cgn-eyebrow">Admin / Verbindungen</p>
          <h1>Streaming-PC Verbindung</h1>
          <p>Zeigt, ob der Streaming-PC mit dem Webserver verbunden ist. Diese Seite zeigt nur Status und Lebenszeichen; sie startet keine Steuerung.</p>
        </div>
        <div class="rdap120-connection-header-actions">
          <span class="cgn-chip cgn-chip--warn" id="agentStatusChip">offline</span>
          <button class="secondaryButton small" type="button" id="agentStatusReloadButton">Status neu laden</button>
        </div>
      </section>

      <section class="metric-grid rdap120-connection-metrics">
        <article class="metric-card cgn-card"><span>Streaming-PC</span><strong id="agentConnectionState">—</strong><small id="agentConnectionDetail">wartet auf Status</small><div class="cgn-progress cgn-progress--warn" id="agentConnectionProgress"><i style="width:8%"></i></div></article>
        <article class="metric-card cgn-card"><span>Letzter Kontakt</span><strong id="agentHeartbeatAt">—</strong><small id="agentHeartbeatDetail">noch kein Lebenszeichen</small><div class="cgn-progress cgn-progress--warn" id="agentHeartbeatProgress"><i style="width:8%"></i></div></article>
        <article class="metric-card cgn-card"><span>Verbindungsziel</span><strong id="agentExpectedName">—</strong><small id="agentExpectedId">—</small><div class="cgn-progress"><i style="width:42%"></i></div></article>
        <article class="metric-card cgn-card"><span>Steuerung</span><strong id="agentActionsEnabled">—</strong><small id="agentActionsDetail">muss aus bleiben</small><div class="cgn-progress cgn-progress--warn"><i style="width:8%"></i></div></article>
      </section>

      <section class="metric-grid rdap120-connection-detail-metrics">
        <article class="metric-card cgn-card"><span>Client-Version</span><strong id="agentVersion">—</strong><small id="agentProtocolVersion">Protokoll —</small></article>
        <article class="metric-card cgn-card"><span>Lebenszeichen Nr.</span><strong id="agentHeartbeatSeq">—</strong><small id="agentHeartbeatAge">Alter —</small></article>
        <article class="metric-card cgn-card"><span>Warnung ab</span><strong id="agentStaleAfter">—</strong><small id="agentOfflineAfter">Offline nach —</small></article>
        <article class="metric-card cgn-card"><span>Webserver-Annahme</span><strong id="agentRuntimeGateState">—</strong><small id="agentRuntimeGateDetail">wartet auf Status</small></article>
      </section>



      <section class="page-grid rdap121-components-grid">
        <article class="cgn-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Streaming-PC</p><h2>Lokales Dashboard</h2></div><span class="cgn-chip cgn-chip--info">read-only</span></div>
          <div class="kv-grid">
            <div class="kv-row"><span>Status</span><strong id="componentLocalDashboardStatus">—</strong></div>
            <div class="kv-row"><span>Adresse</span><strong id="componentLocalDashboardUrl">—</strong></div>
            <div class="kv-row"><span>Geprüft</span><strong id="componentLocalDashboardCheckedAt">—</strong></div>
          </div>
        </article>
        <article class="cgn-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Streaming-PC</p><h2>Lokaler Server</h2></div><span class="cgn-chip cgn-chip--ok">Status</span></div>
          <div class="kv-grid">
            <div class="kv-row"><span>Status</span><strong id="componentLocalServerStatus">—</strong></div>
            <div class="kv-row"><span>Port</span><strong id="componentLocalServerPort">—</strong></div>
            <div class="kv-row"><span>Geprüft</span><strong id="componentLocalServerCheckedAt">—</strong></div>
          </div>
        </article>
        <article class="cgn-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Streaming-PC</p><h2>OBS</h2></div><span class="cgn-chip cgn-chip--info">read-only</span></div>
          <div class="kv-grid">
            <div class="kv-row"><span>Status</span><strong id="componentObsStatus">—</strong></div>
            <div class="kv-row"><span>Erreichbar</span><strong id="componentObsReachable">—</strong></div>
            <div class="kv-row"><span>Hinweis</span><strong id="componentObsDetail">—</strong></div>
          </div>
        </article>
        <article class="cgn-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Streaming-PC</p><h2>Streamer.bot</h2></div><span class="cgn-chip cgn-chip--warn">später</span></div>
          <div class="kv-grid">
            <div class="kv-row"><span>Status</span><strong id="componentStreamerbotStatus">—</strong></div>
            <div class="kv-row"><span>Erreichbar</span><strong id="componentStreamerbotReachable">—</strong></div>
            <div class="kv-row"><span>Hinweis</span><strong id="componentStreamerbotDetail">—</strong></div>
          </div>
        </article>
      </section>

      <section class="page-grid rdap120-connection-grid">
        <article class="cgn-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Verbindungsweg</p><h2>Ausgehend vom Streaming-PC</h2></div><span class="cgn-chip cgn-chip--info">WSS</span></div>
          <div class="kv-grid">
            <div class="kv-row"><span>Richtung</span><strong id="agentPlannedDirection">—</strong></div>
            <div class="kv-row"><span>Transport</span><strong id="agentPlannedTransport">—</strong></div>
            <div class="kv-row"><span>Pfad</span><strong id="agentPlannedWsPath">—</strong></div>
            <div class="kv-row"><span>Portfreigabe am Streaming-PC</span><strong id="agentPublicPortRequired">—</strong></div>
            <div class="kv-row"><span>Eingehende Internetverbindung zum Streaming-PC</span><strong id="agentIncomingInternetRequired">—</strong></div>
            <div class="kv-row"><span>Dynamische Streaming-PC-IP erlaubt</span><strong id="agentDynamicIpAllowed">—</strong></div>
          </div>
        </article>

        <article class="cgn-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Sicherheit</p><h2>Harte Grenzen</h2></div><span class="cgn-chip cgn-chip--ok">geschützt</span></div>
          <ul class="security-list" id="agentSafetyList"><li><span>Keine Steuerung</span><strong>OK</strong></li></ul>
        </article>

        <article class="cgn-card span2">
          <div class="card-head"><div><p class="cgn-eyebrow">Statusmodell</p><h2>Nur Verbindung + Lebenszeichen</h2></div><span class="cgn-chip cgn-chip--warn">read-only</span></div>
          <div class="kv-grid">
            <div class="kv-row"><span>Status API</span><strong id="agentStatusApiVersion">—</strong></div>
            <div class="kv-row"><span>Verbindungsannahme</span><strong id="agentRuntimeEnabled">—</strong></div>
            <div class="kv-row"><span>Lebenszeichen-Empfang</span><strong id="agentHeartbeatReceiver">—</strong></div>
            <div class="kv-row"><span>Speicherung</span><strong id="agentHeartbeatStorage">—</strong></div>
            <div class="kv-row"><span>Datenbank-Write</span><strong id="agentHeartbeatDbWrite">—</strong></div>
            <div class="kv-row"><span>Steuerbefehle</span><strong id="agentHeartbeatActions">—</strong></div>
          </div>
          <div class="rdap120-connection-notice" id="agentStatusNotice">Noch nicht geladen.</div>
        </article>

        <article class="cgn-card span2">
          <div class="card-head"><div><p class="cgn-eyebrow">Freischaltung</p><h2>Verbindung an, Steuerung aus</h2></div><span class="cgn-chip cgn-chip--warn">keine Actions</span></div>
          <div class="kv-grid">
            <div class="kv-row"><span>gewünscht aktiviert</span><strong id="agentRuntimeRequested">—</strong></div>
            <div class="kv-row"><span>Build erlaubt Annahme</span><strong id="agentRuntimeAcceptBuild">—</strong></div>
            <div class="kv-row"><span>tatsächlich aktiv</span><strong id="agentRuntimeEffective">—</strong></div>
            <div class="kv-row"><span>nimmt Verbindungen an</span><strong id="agentRuntimeAcceptsConnections">—</strong></div>
            <div class="kv-row"><span>nimmt Lebenszeichen an</span><strong id="agentRuntimeHeartbeatReceiver">—</strong></div>
            <div class="kv-row"><span>Steuerung aktiv</span><strong id="agentRuntimeActionsEnabled">—</strong></div>
            <div class="kv-row"><span>produktive Steuerung</span><strong id="agentRuntimeProductive">—</strong></div>
          </div>
          <div class="rdap120-connection-notice">Version 0.1.3 zeigt die Verbindung sichtbar. Steuerbefehle bleiben aus und werden nicht ausgeführt.</div>
        </article>

        <article class="cgn-card span2">
          <details class="rdap120-diagnostics">
            <summary><span>Technische Diagnose</span><strong>read-only, ohne Secrets</strong></summary>
            <div class="kv-grid">
              <div class="kv-row"><span>ModuleBuild</span><strong id="agentModuleBuild">—</strong></div>
              <div class="kv-row"><span>generatedAt</span><strong id="agentGeneratedAt">—</strong></div>
              <div class="kv-row"><span>loadedAt</span><strong id="agentLoadedAt">—</strong></div>
              <div class="kv-row"><span>Reject Count</span><strong id="agentRejectCount">—</strong></div>
              <div class="kv-row"><span>Letzter Reject</span><strong id="agentLastRejectAt">—</strong></div>
              <div class="kv-row"><span>Reject Reason</span><strong id="agentLastRejectReason">—</strong></div>
              <div class="kv-row"><span>ID-Header vorhanden</span><strong id="agentRejectHasAgentIdHeader">—</strong></div>
              <div class="kv-row"><span>Protokoll-Header vorhanden</span><strong id="agentRejectHasProtocolHeader">—</strong></div>
              <div class="kv-row"><span>Secrets sichtbar</span><strong id="agentRejectSecretsExposed">—</strong></div>
            </div>
            <ul class="security-list rdap120-warning-list" id="agentWarningList"><li><span>Warnings</span><strong>—</strong></li></ul>
          </details>
        </article>
      </section>
    `;

    content.appendChild(panel);
  }

  function bindActions() {
    const reload = document.getElementById('agentStatusReloadButton');
    if (reload) reload.addEventListener('click', () => loadConnectionStatus('manual'));
  }

  function startAutoRefresh() {
    if (refreshTimer) return;
    refreshTimer = window.setInterval(() => loadConnectionStatus('auto'), AUTO_REFRESH_MS);
  }

  async function loadConnectionStatus(reason) {
    const result = await getJson(ENDPOINT);
    if (!result.ok) {
      renderError(result);
      updateQuickConnectionChip('Streaming-PC prüfen', false);
      return;
    }
    renderConnectionStatus(result.body, reason);
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
      return { ok: response.ok && body && body.ok !== false, httpStatus: response.status, body, error: null };
    } catch (err) {
      return { ok: false, httpStatus: 0, body: null, error: err && err.message ? err.message : 'fetch_failed' };
    }
  }

  function renderConnectionStatus(body, reason) {
    const agent = (body && body.agent) || {};
    const runtime = (body && body.runtime) || {};
    const heartbeat = (body && body.heartbeat) || {};
    const transport = (body && body.transport) || {};
    const safety = (body && body.safety) || {};
    const rejectDiagnostic = (body && body.rejectDiagnostic) || {};
    const componentStatus = (body && body.connection && body.connection.componentStatus) || {};

    const connected = agent.connected === true;
    const stale = agent.stale === true;
    const actionsEnabled = agent.actionsEnabled === true || body.actionEnabled === true;
    const productiveRuntime = body.productiveAgentRuntime === true;
    const viewState = buildConnectionViewState(connected, stale);

    setText('agentConnectionState', viewState.label);
    setText('agentConnectionDetail', viewState.detail);
    setText('agentHeartbeatAt', agent.lastHeartbeatAt ? formatDate(agent.lastHeartbeatAt) : '—');
    setText('agentHeartbeatDetail', buildHeartbeatDetail(agent));
    setText('agentExpectedName', agent.expectedAgentName || agent.agentName || 'Forrest Stream-PC');
    setText('agentExpectedId', agent.expectedAgentId ? `Ziel-ID: ${agent.expectedAgentId}` : 'Ziel-ID: —');
    setText('agentActionsEnabled', actionsEnabled ? 'aktiv' : 'aus');
    setText('agentActionsDetail', productiveRuntime ? 'produktive Steuerung aktiv' : 'keine Steuerung aktiv');

    setText('agentPlannedDirection', formatDirection(transport.plannedDirection));
    setText('agentPlannedTransport', String(transport.plannedTransport || 'wss').toUpperCase());
    setText('agentPlannedWsPath', transport.plannedWsPath || '/agent-ws');
    setText('agentPublicPortRequired', formatYesNo(transport.streamPcPublicPortRequired === true));
    setText('agentIncomingInternetRequired', formatYesNo(transport.incomingInternetConnectionToStreamPcRequired === true));
    setText('agentDynamicIpAllowed', formatYesNo(transport.dynamicStreamPcIpAllowed === true));

    setText('agentStatusApiVersion', body.statusApiVersion || '—');
    setText('agentRuntimeEnabled', agent.enabled === true || runtime.effectiveEnabled === true ? 'aktiv' : 'aus');
    setText('agentHeartbeatReceiver', heartbeat.heartbeatReceiverEnabled === true ? 'aktiv' : 'aus');
    setText('agentHeartbeatStorage', heartbeat.lastHeartbeatPayloadStored === true || heartbeat.persistsHeartbeatToDatabase === true ? 'prüfen' : 'nur Speicher / keine Payload');
    setText('agentHeartbeatDbWrite', heartbeat.databaseWriteEnabled === true || heartbeat.heartbeatPersistsToDatabase === true ? 'prüfen' : 'nein');
    setText('agentHeartbeatActions', heartbeat.heartbeatExecutesActions === true || heartbeat.heartbeatAcceptsCommands === true || heartbeat.heartbeatAcceptsCapabilities === true ? 'prüfen' : 'nein');

    setText('agentVersion', agent.agentVersion || '—');
    setText('agentProtocolVersion', agent.protocolVersion ? `Protokoll ${agent.protocolVersion}` : 'Protokoll —');
    setText('agentHeartbeatSeq', agent.heartbeatSeq !== undefined && agent.heartbeatSeq !== null ? agent.heartbeatSeq : '—');
    setText('agentHeartbeatAge', Number.isFinite(agent.heartbeatAgeMs) ? `Alter ${formatDuration(agent.heartbeatAgeMs)}` : 'Alter —');
    setText('agentStaleAfter', Number.isFinite(heartbeat.staleAfterMs) ? formatDuration(heartbeat.staleAfterMs) : '—');
    setText('agentOfflineAfter', Number.isFinite(heartbeat.offlineAfterMs) ? `Offline nach ${formatDuration(heartbeat.offlineAfterMs)}` : 'Offline nach —');
    setText('agentRuntimeGateState', runtime.effectiveEnabled === true ? 'aktiv' : 'aus');
    setText('agentRuntimeGateDetail', runtime.acceptsAgentConnections === true ? 'nimmt Verbindungen an' : 'nimmt keine Verbindungen an');

    renderRuntimeGates(runtime, body);
    renderDiagnostics(body, rejectDiagnostic);
    renderComponentStatus(componentStatus);
    renderSafety(safety);

    setProgressState('agentConnectionProgress', viewState.ok ? 'ok' : 'warn', viewState.ok ? 82 : 8);
    setProgressState('agentHeartbeatProgress', connected && !stale ? 'ok' : 'warn', connected && !stale ? 74 : 8);

    const chip = document.getElementById('agentStatusChip');
    if (chip) {
      chip.className = viewState.ok ? 'cgn-chip cgn-chip--ok' : 'cgn-chip cgn-chip--warn';
      chip.textContent = viewState.chip;
    }

    setText('agentStatusNotice', `Version 0.1.3: Streaming-PC-Verbindung und OBS-Status sichtbar geladen (${reason || 'auto'}). Verbindung ja, Steuerung nein.`);
    updateQuickConnectionChip(viewState.quickChip, viewState.ok);
  }

  function buildConnectionViewState(connected, stale) {
    if (connected && stale) return { label: 'veraltet', detail: 'Lebenszeichen zu alt', chip: 'veraltet', quickChip: 'Streaming-PC veraltet', ok: false };
    if (connected) return { label: 'online', detail: 'Streaming-PC verbunden', chip: 'online', quickChip: 'Streaming-PC online', ok: true };
    return { label: 'offline', detail: 'Streaming-PC nicht verbunden', chip: 'offline', quickChip: 'Streaming-PC offline', ok: false };
  }

  function buildHeartbeatDetail(agent) {
    if (!agent || !agent.lastHeartbeatAt) return 'noch kein Lebenszeichen';
    const parts = [];
    if (Number.isFinite(agent.heartbeatAgeMs)) parts.push(`vor ${formatDuration(agent.heartbeatAgeMs)}`);
    if (agent.heartbeatSeq !== undefined && agent.heartbeatSeq !== null) parts.push(`Nr. ${agent.heartbeatSeq}`);
    if (agent.heartbeatProtocolVersion) parts.push(agent.heartbeatProtocolVersion);
    return parts.length ? parts.join(' · ') : 'Lebenszeichen empfangen';
  }


  function renderComponentStatus(componentStatus) {
    const localDashboard = componentStatus.localDashboard || {};
    const localServer = componentStatus.localServer || {};
    const obs = componentStatus.obs || {};
    const streamerbot = componentStatus.streamerbot || {};

    setText('componentLocalDashboardStatus', formatComponentState(localDashboard));
    setText('componentLocalDashboardUrl', localDashboard.url || '—');
    setText('componentLocalDashboardCheckedAt', localDashboard.checkedAt ? formatDate(localDashboard.checkedAt) : componentStatus.collectedAt ? formatDate(componentStatus.collectedAt) : '—');

    setText('componentLocalServerStatus', formatComponentState(localServer));
    setText('componentLocalServerPort', localServer.port ? String(localServer.port) : '—');
    setText('componentLocalServerCheckedAt', localServer.checkedAt ? formatDate(localServer.checkedAt) : componentStatus.collectedAt ? formatDate(componentStatus.collectedAt) : '—');

    setText('componentObsStatus', obs.status || 'noch nicht geprüft');
    setText('componentObsReachable', formatReachable(obs.reachable));
    setText('componentObsDetail', obs.detail || 'OBS-Status wird nur lesend angezeigt');

    setText('componentStreamerbotStatus', streamerbot.status || 'noch nicht geprüft');
    setText('componentStreamerbotReachable', formatReachable(streamerbot.reachable));
    setText('componentStreamerbotDetail', streamerbot.detail || 'Version 0.1.3 liest Streamer.bot noch nicht aktiv aus');
  }

  function formatComponentState(component) {
    if (!component || component.available !== true) return 'nicht gemeldet';
    if (component.reachable === true) return 'erreichbar';
    if (component.reachable === false) return 'nicht erreichbar';
    return component.status || 'gemeldet';
  }

  function formatReachable(value) {
    if (value === true) return 'ja';
    if (value === false) return 'nein';
    return 'noch nicht geprüft';
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
      ['Keine Remote-Steuerung', safety.noAgentActionExecution]
    ];
    const list = document.getElementById('agentSafetyList');
    if (!list) return;
    list.innerHTML = items.map(([label, ok]) => {
      const good = ok === true || ok === undefined;
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
    list.innerHTML = warnings.map((warning) => `<li><span>${escapeHtml(rewordWarning(warning))}</span><strong>Info</strong></li>`).join('');
  }

  function rewordWarning(value) {
    return String(value || '')
      .replace(/Agent-Actions/g, 'Steuerbefehle')
      .replace(/Agent/g, 'Verbindung')
      .replace(/agent/g, 'Verbindung');
  }

  function renderError(result) {
    setText('agentStatusNotice', `Verbindungsstatus konnte nicht geladen werden: ${escapePlain(result.error || `HTTP ${result.httpStatus || 0}`)}`);
    setText('agentConnectionState', 'prüfen');
    setText('agentConnectionDetail', 'Status nicht abrufbar');
    setText('agentHeartbeatAt', '—');
    setText('agentHeartbeatDetail', 'noch kein Lebenszeichen');
    const chip = document.getElementById('agentStatusChip');
    if (chip) {
      chip.className = 'cgn-chip cgn-chip--warn';
      chip.textContent = 'prüfen';
    }
  }

  function updateQuickConnectionChip(text, ok) {
    const chip = document.getElementById('quickAgent');
    if (!chip) return;
    chip.textContent = text;
    chip.classList.toggle('cgn-chip--ok', Boolean(ok));
    chip.classList.toggle('cgn-chip--warn', !ok);
  }

  function injectStyles() {
    if (document.getElementById('rdap120StreamingPcConnectionStyle')) return;
    const style = document.createElement('style');
    style.id = 'rdap120StreamingPcConnectionStyle';
    style.textContent = `
      [data-page-panel="admin-connections"].is-active-view{display:grid;gap:18px}
      .rdap120-connection-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
      .rdap120-connection-header-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap}
      .rdap120-connection-grid .span2{grid-column:1/-1}
      .rdap121-components-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
      .rdap120-connection-notice{margin-top:12px;padding:10px 12px;border-radius:14px;background:rgba(27,216,255,.08);border:1px solid rgba(27,216,255,.18);color:var(--muted);font-size:13px;line-height:1.35}
      .rdap120-diagnostics summary{display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;list-style:none}
      .rdap120-diagnostics summary::-webkit-details-marker{display:none}
      .rdap120-diagnostics summary span{font-weight:800}
      .rdap120-diagnostics summary strong{font-size:12px;color:var(--muted);font-weight:700}
      .rdap120-diagnostics[open] summary{margin-bottom:14px}
      .rdap120-warning-list{margin-top:12px}
      @media (max-width:900px){.rdap121-components-grid{grid-template-columns:1fr}.rdap120-connection-header{flex-direction:column}.rdap120-connection-header-actions{justify-content:flex-start}.rdap120-connection-grid .span2{grid-column:auto}.rdap120-diagnostics summary{align-items:flex-start;flex-direction:column}}
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
    if (value === 'stream-pc-agent-to-webserver') return 'Streaming-PC → Webserver';
    return value || 'Streaming-PC → Webserver';
  }

  function formatEnabled(value) {
    return value === true ? 'aktiv' : 'aus';
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
