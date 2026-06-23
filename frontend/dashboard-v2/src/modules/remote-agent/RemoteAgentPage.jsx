import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/Card.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { getRemoteAgentStatus, getRemoteAgentStatusFallback } from '../../services/agentClient.js';

export function RemoteAgentPage() {
  const [statusData, setStatusData] = useState(() => getRemoteAgentStatusFallback());
  const [loadState, setLoadState] = useState('loading');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      setLoadState('loading');
      setLoadError('');

      try {
        const data = await getRemoteAgentStatus();
        if (cancelled) return;
        setStatusData(data);
        setLoadState('ready');
      } catch (err) {
        if (cancelled) return;
        setStatusData(getRemoteAgentStatusFallback());
        setLoadError(err && err.message ? err.message : String(err));
        setLoadState('error');
      }
    }

    loadStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const view = useMemo(() => normalizeStatus(statusData), [statusData]);

  return (
    <div className="view-grid remote-agent-grid">
      <Card title="Stream-PC Verbindung" eyebrow="RDAP3A / Read-only">
        <div className="remote-status-hero">
          <StatusDot state={view.connectionState} />
          <div>
            <strong>{view.connectionLabel}</strong>
            <span>{view.connectionHint}</span>
          </div>
        </div>

        <div className="info-list">
          <InfoRow label="Status" value={view.connectionState} />
          <InfoRow label="Letzter Kontakt" value={view.lastSeenAt} />
          <InfoRow label="Verbunden seit" value={view.connectedSince} />
          <InfoRow label="Heartbeat-Alter" value={view.heartbeatAge} />
          <InfoRow label="Reconnects" value={view.reconnectCount} />
        </div>
      </Card>

      <Card title="Lokaler Stream-PC" eyebrow="Geplanter Verbindungsdienst">
        <div className="info-list">
          <InfoRow label="Name" value={view.agentName} />
          <InfoRow label="ID" value={view.agentId} />
          <InfoRow label="Version" value={view.agentVersion} />
          <InfoRow label="Protokoll" value={view.protocolVersion} />
        </div>
      </Card>

      <Card title="Host / Laufzeit" eyebrow="Basisstatus">
        <div className="info-list">
          <InfoRow label="Dashboard-Server" value={view.dashboardServer} />
          <InfoRow label="Hostname" value={view.hostname} />
          <InfoRow label="Plattform" value={view.platform} />
          <InfoRow label="Node.js" value={view.nodeVersion} />
          <InfoRow label="Uptime" value={view.uptime} />
        </div>
      </Card>

      <Card title="Remote-Modboard" eyebrow="Webserver-Ziel">
        <div className="info-list">
          <InfoRow label="Dashboard" value={view.publicDashboardUrl} />
          <InfoRow label="Transport" value={view.plannedTransport} />
          <InfoRow label="WSS-Pfad" value={view.plannedWsPath} />
          <InfoRow label="Öffentlicher Stream-PC-Port" value={view.publicPortRequired} />
        </div>
      </Card>

      <Card title="Sicherheitsgrenzen" eyebrow="Keine produktiven Aktionen">
        <div className="capability-grid">
          <Capability label="Status lesen" enabled={view.capabilities.status} />
          <Capability label="Ping" enabled={view.capabilities.ping} />
          <Capability label="Status aktiv anfordern" enabled={view.capabilities.statusRequest} />
          <Capability label="OBS steuern" enabled={view.capabilities.obsControl} danger />
          <Capability label="Sound steuern" enabled={view.capabilities.soundControl} danger />
          <Capability label="Overlay steuern" enabled={view.capabilities.overlayControl} danger />
          <Capability label="Media schreiben" enabled={view.capabilities.mediaWrite} danger />
          <Capability label="Texte/Config schreiben" enabled={view.capabilities.textConfigWrite} danger />
          <Capability label="DB schreiben" enabled={view.capabilities.databaseWrite} danger />
          <Capability label="Dateien schreiben" enabled={view.capabilities.fileWrite} danger />
          <Capability label="Shell/Prozess" enabled={view.capabilities.shell || view.capabilities.processControl} danger />
        </div>
      </Card>

      <Card title="API-Zustand" eyebrow="DASHUI7">
        <div className="chip-row">
          <StatusBadge tone={loadState === 'ready' ? 'ok' : loadState === 'error' ? 'danger' : 'info'}>
            {loadState === 'ready' ? 'API geladen' : loadState === 'error' ? 'API-Fehler' : 'lädt'}
          </StatusBadge>
          <StatusBadge tone="info">read-only</StatusBadge>
          <StatusBadge tone="warn">kein WSS-Dienst verbunden</StatusBadge>
          <StatusBadge tone="ok">keine Schreibroute</StatusBadge>
        </div>

        {loadError ? <p className="remote-agent-error">{loadError}</p> : null}

        <ul className="plain-list remote-agent-notes">
          {view.warnings.map((warning) => (
            <li key={warning}><span>○</span>{warning}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function StatusDot({ state }) {
  const tone = state === 'online' ? 'ok' : state === 'offline' ? 'danger' : 'warn';
  return <span className={`remote-status-dot remote-status-dot--${tone}`} aria-hidden="true" />;
}

function Capability({ label, enabled, danger = false }) {
  const tone = enabled ? 'ok' : danger ? 'danger' : 'warn';
  return (
    <div className={`capability-item capability-item--${tone}`}>
      <span>{enabled ? 'aktiv' : 'aus'}</span>
      <strong>{label}</strong>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function normalizeStatus(data) {
  const status = data?.status ?? {};
  const agent = data?.agent ?? {};
  const host = data?.host ?? {};
  const target = data?.remoteTarget ?? {};
  const capabilities = data?.capabilities ?? {};
  const warnings = Array.isArray(data?.warnings) ? data.warnings : [];
  const connectionState = String(status.connectionState || 'unknown');

  return {
    connectionState,
    connectionLabel: getConnectionLabel(connectionState),
    connectionHint: getConnectionHint(connectionState, status.reason),
    lastSeenAt: formatValue(status.lastSeenAt),
    connectedSince: formatValue(status.connectedSince),
    heartbeatAge: typeof status.heartbeatAgeMs === 'number' ? `${status.heartbeatAgeMs} ms` : 'nicht vorhanden',
    reconnectCount: String(status.reconnectCount ?? 0),
    agentName: formatValue(agent.agentName || agent.expectedAgentName),
    agentId: formatValue(agent.agentId || agent.expectedAgentId),
    agentVersion: formatValue(agent.agentVersion),
    protocolVersion: formatValue(agent.protocolVersion || data?.statusApiVersion),
    dashboardServer: formatValue(host.dashboardServer),
    hostname: formatValue(host.hostname),
    platform: formatValue(host.platform),
    nodeVersion: formatValue(host.nodeVersion),
    uptime: typeof host.processUptimeSec === 'number' ? `${host.processUptimeSec}s` : 'nicht vorhanden',
    publicDashboardUrl: formatValue(target.publicDashboardUrl),
    plannedTransport: formatValue(target.plannedTransport),
    plannedWsPath: formatValue(target.plannedWsPath),
    publicPortRequired: target.streamPcPublicPortRequired === false ? 'nein' : 'unbekannt',
    capabilities: {
      status: Boolean(capabilities.status),
      ping: Boolean(capabilities.ping),
      statusRequest: Boolean(capabilities.statusRequest),
      obsControl: Boolean(capabilities.obsControl),
      soundControl: Boolean(capabilities.soundControl),
      overlayControl: Boolean(capabilities.overlayControl),
      mediaWrite: Boolean(capabilities.mediaWrite),
      textConfigWrite: Boolean(capabilities.textConfigWrite),
      databaseWrite: Boolean(capabilities.databaseWrite),
      fileWrite: Boolean(capabilities.fileWrite),
      shell: Boolean(capabilities.shell),
      processControl: Boolean(capabilities.processControl)
    },
    warnings: warnings.length ? warnings : ['Keine Warnungen vom Backend gemeldet.']
  };
}

function getConnectionLabel(state) {
  if (state === 'online') return 'Stream-PC verbunden';
  if (state === 'offline') return 'Stream-PC nicht verbunden';
  if (state === 'connecting') return 'Verbindung wird aufgebaut';
  if (state === 'auth_failed') return 'Authentifizierung fehlgeschlagen';
  if (state === 'stale') return 'Heartbeat veraltet';
  return 'Status unbekannt';
}

function getConnectionHint(state, reason) {
  if (reason === 'rdap3a_no_agent_runtime_yet') return 'Noch kein produktiver WSS-Dienst in RDAP3A. Dieser Offline-Status ist aktuell korrekt.';
  if (reason) return reason;
  if (state === 'offline') return 'Noch kein produktiver WSS-Dienst in RDAP3A.';
  if (state === 'online') return 'Heartbeat wurde empfangen.';
  return 'Warte auf Statusdaten.';
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return 'nicht vorhanden';
  return String(value);
}
