import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/Card.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import {
  getLocalStreamPcStatus,
  getLocalStreamPcStatusFallback
} from '../../services/agentClient.js';

export function RemoteAgentPage() {
  const [statusData, setStatusData] = useState(() => getLocalStreamPcStatusFallback());
  const [loadState, setLoadState] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      setLoadState('loading');
      const data = await getLocalStreamPcStatus();
      if (cancelled) return;
      setStatusData(data);
      setLoadState(data.server || data.stream || data.websocket ? 'ready' : 'error');
    }

    loadStatus();
    return () => { cancelled = true; };
  }, []);

  const view = useMemo(() => normalizeStatus(statusData), [statusData]);

  return (
    <div className="view-grid remote-agent-grid">
      <Card title="Lokaler Server" eyebrow="Port 8080 · read-only">
        <div className="remote-status-hero">
          <StatusDot state={view.serverState} />
          <div>
            <strong>{view.serverLabel}</strong>
            <span>{view.serverHint}</span>
          </div>
        </div>

        <div className="info-list">
          <InfoRow label="Port" value={view.port} />
          <InfoRow label="Serverversion" value={view.serverVersion} />
          <InfoRow label="Geladene Module" value={view.moduleCount} />
          <InfoRow label="Übersprungene Module" value={view.skippedModuleCount} />
        </div>
      </Card>

      <Card title="Routenstatus" eyebrow="Bestehender Express-Server">
        <div className="info-list">
          <InfoRow label="Registrierte Routen" value={view.routeCount} />
          <InfoRow label="Doppelte Routen" value={view.duplicateRouteCount} />
          <InfoRow label="Status" value={view.routeStatus} />
        </div>
      </Card>

      <Card title="WebSocket" eyebrow="Verbindungen · read-only">
        <div className="info-list">
          <InfoRow label="Clients" value={view.wsClients} />
          <InfoRow label="Statuszeit" value={view.wsCheckedAt} />
          <InfoRow label="Quelle" value="/api/diag/ws" />
        </div>
      </Card>

      <Card title="Streamstatus" eyebrow="Gecachter Zustand">
        <div className="chip-row">
          <StatusBadge tone={view.streamTone}>{view.streamLabel}</StatusBadge>
          <StatusBadge tone={view.streamFreshnessTone}>
            {view.streamFreshnessLabel}
          </StatusBadge>
        </div>

        <div className="info-list">
          <InfoRow label="Quelle" value={view.streamSource} />
          <InfoRow label="Zuletzt geprüft" value={view.streamCheckedAt} />
          <InfoRow label="Kanal" value={view.broadcasterLogin} />
          <InfoRow label="Fehler" value={view.streamError} />
        </div>
      </Card>

      <Card title="Sicherheitsgrenze" eyebrow="Keine produktiven Aktionen">
        <div className="chip-row">
          <StatusBadge tone="ok">nur GET</StatusBadge>
          <StatusBadge tone="ok">einmalige Abfrage</StatusBadge>
          <StatusBadge tone="info">read-only</StatusBadge>
          <StatusBadge tone="danger">Aktionen aus</StatusBadge>
        </div>

        <ul className="plain-list remote-agent-notes">
          <li><span>○</span>keine Refresh- oder Test-Route</li>
          <li><span>○</span>keine Log- oder Session-Route</li>
          <li><span>○</span>keine OBS-, Sound- oder Overlay-Steuerung</li>
          <li><span>○</span>keine Speicher-, Datei- oder Prozessaktion</li>
        </ul>
      </Card>

      <Card title="API-Zustand" eyebrow="0.2.10">
        <div className="chip-row">
          <StatusBadge tone={loadState === 'ready' ? 'ok' : loadState === 'error' ? 'danger' : 'info'}>
            {loadState === 'ready' ? 'Status geladen' : loadState === 'error' ? 'Status nicht verfügbar' : 'lädt'}
          </StatusBadge>
          <StatusBadge tone="info">3 bestehende GET-Routen</StatusBadge>
        </div>

        {view.errors.length ? (
          <ul className="plain-list remote-agent-notes">
            {view.errors.map((error) => <li key={error}><span>○</span>{error}</li>)}
          </ul>
        ) : (
          <p className="card-footer">Alle vorgesehenen Read-only-Statusquellen wurden geladen.</p>
        )}
      </Card>
    </div>
  );
}

function StatusDot({ state }) {
  const tone = state === 'online' ? 'ok' : state === 'offline' ? 'danger' : 'warn';
  return <span className={`remote-status-dot remote-status-dot--${tone}`} aria-hidden="true" />;
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{formatValue(value)}</strong>
    </div>
  );
}

function normalizeStatus(data) {
  const server = data?.server;
  const stream = data?.stream;
  const websocket = data?.websocket;
  const duplicateRoutes = Array.isArray(server?.routeDiagnostics?.duplicateRoutes)
    ? server.routeDiagnostics.duplicateRoutes.length
    : null;
  const streamKnown = stream?.statusKnown === true;
  const streamLive = stream?.live === true;

  return {
    serverState: server?.ok === true ? 'online' : server ? 'offline' : 'unknown',
    serverLabel: server?.ok === true ? 'Lokaler Server erreichbar' : 'Lokaler Serverstatus unbekannt',
    serverHint: server?.ok === true ? 'Dashboard und APIs antworten auf Port 8080.' : 'Die Status-API konnte nicht gelesen werden.',
    port: server?.port,
    serverVersion: server?.serverVersion,
    moduleCount: Array.isArray(server?.modules) ? server.modules.length : null,
    skippedModuleCount: Array.isArray(server?.skippedModules) ? server.skippedModules.length : null,
    routeCount: server?.routeDiagnostics?.totalRoutes,
    duplicateRouteCount: duplicateRoutes,
    routeStatus: duplicateRoutes === 0 ? 'keine Duplikate' : duplicateRoutes === null ? 'unbekannt' : `${duplicateRoutes} Duplikate`,
    wsClients: websocket?.clients ?? server?.wsClients,
    wsCheckedAt: formatDateTime(websocket?.isoTs),
    streamLabel: !streamKnown ? 'Status unbekannt' : streamLive ? 'Stream live' : 'Stream offline',
    streamTone: !streamKnown ? 'warn' : streamLive ? 'ok' : 'info',
    streamFreshnessLabel: !stream ? 'nicht geladen' : stream.stale === true ? 'veraltet' : 'aktuell',
    streamFreshnessTone: !stream || stream.stale === true ? 'warn' : 'ok',
    streamSource: stream?.source,
    streamCheckedAt: formatDateTime(stream?.lastCheckedAt),
    broadcasterLogin: stream?.broadcasterLogin,
    streamError: stream?.lastError || stream?.apiError || 'keiner',
    errors: Array.isArray(data?.errors) ? data.errors : []
  };
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return 'nicht verfügbar';
  return String(value);
}

function formatDateTime(value) {
  if (!value) return 'nicht verfügbar';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('de-DE');
}
