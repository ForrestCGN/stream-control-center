import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/Card.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { getLocalStreamPcStatus, getLocalStreamPcStatusFallback } from '../../services/localStatusClient.js';

export function StreamPcStatusPage() {
  const [statusData, setStatusData] = useState(() => getLocalStreamPcStatusFallback());
  const [loadState, setLoadState] = useState('loading');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      setLoadState('loading');
      setLoadError('');

      try {
        const data = await getLocalStreamPcStatus();
        if (cancelled) return;
        setStatusData(data);
        setLoadState(data.ok ? 'ready' : 'error');
      } catch (err) {
        if (cancelled) return;
        setStatusData(getLocalStreamPcStatusFallback());
        setLoadError(err && err.message ? err.message : String(err));
        setLoadState('error');
      }
    }

    loadStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const view = useMemo(() => normalizeLocalStatus(statusData), [statusData]);

  return (
    <div className="view-grid remote-agent-grid">
      <Card title="Lokaler Server" eyebrow="/api/_status">
        <div className="chip-row">
          <StatusBadge tone={view.serverLoaded ? 'ok' : 'danger'}>{view.serverLoaded ? 'geladen' : 'nicht geladen'}</StatusBadge>
          <StatusBadge tone="info">read-only</StatusBadge>
          <StatusBadge tone="ok">Port {view.port}</StatusBadge>
        </div>

        <div className="info-list">
          <InfoRow label="Host" value={view.host} />
          <InfoRow label="Server-Version" value={view.serverVersion} />
          <InfoRow label="Module" value={view.moduleCount} />
          <InfoRow label="Routen" value={view.routeCount} />
          <InfoRow label="Webroot" value={view.webrootDir} />
        </div>
      </Card>

      <Card title="WebSocket" eyebrow="/api/diag/ws">
        <div className="chip-row">
          <StatusBadge tone={view.websocketLoaded ? 'ok' : 'danger'}>{view.websocketLoaded ? 'geladen' : 'nicht geladen'}</StatusBadge>
          <StatusBadge tone="info">nur Client-Zahl</StatusBadge>
        </div>

        <div className="info-list">
          <InfoRow label="Clients" value={view.wsClients} />
          <InfoRow label="Zeitpunkt" value={view.wsTime} />
        </div>
      </Card>

      <Card title="Streamstatus" eyebrow="/api/stream-status/current">
        <div className="chip-row">
          <StatusBadge tone={view.streamLoaded ? 'ok' : 'danger'}>{view.streamLoaded ? 'geladen' : 'nicht geladen'}</StatusBadge>
          <StatusBadge tone={view.live ? 'ok' : 'warn'}>{view.live ? 'live' : 'nicht live/unklar'}</StatusBadge>
          <StatusBadge tone={view.stale ? 'warn' : 'info'}>{view.stale ? 'stale' : 'cache'}</StatusBadge>
        </div>

        <div className="info-list">
          <InfoRow label="Kanal" value={view.broadcasterLogin} />
          <InfoRow label="Titel" value={view.title} />
          <InfoRow label="Spiel" value={view.gameName} />
          <InfoRow label="Zuschauer" value={view.viewerCount} />
          <InfoRow label="Quelle" value={view.streamSource} />
          <InfoRow label="Letzter Check" value={view.lastCheckedAt} />
        </div>
      </Card>

      <Card title="Sicherheitsgrenze" eyebrow="Keine Steuerung">
        <ul className="check-list">
          <li><span>✓</span> keine Refresh-Route aufgerufen</li>
          <li><span>✓</span> keine Test- oder Log-Route aufgerufen</li>
          <li><span>✓</span> keine POST-/Write-Route aufgerufen</li>
          <li><span>✓</span> keine OBS-, Sound-, Overlay- oder Command-Aktion</li>
        </ul>
      </Card>

      <Card title="Verwendete Routen" eyebrow="Read-only Vertrag">
        <ul className="plain-list remote-agent-notes">
          {view.routesUsed.map((route) => (
            <li key={route}><span>○</span><strong>GET</strong> {route}</li>
          ))}
        </ul>
      </Card>

      <Card title="API-Zustand" eyebrow="0.2.10">
        <div className="chip-row">
          <StatusBadge tone={loadState === 'ready' ? 'ok' : loadState === 'error' ? 'danger' : 'info'}>
            {loadState === 'ready' ? 'API geladen' : loadState === 'error' ? 'API-Fehler' : 'lädt'}
          </StatusBadge>
          <StatusBadge tone="info">read-only</StatusBadge>
          <StatusBadge tone="ok">keine Buttons</StatusBadge>
        </div>

        {loadError ? <p className="remote-agent-error">{loadError}</p> : null}

        <ul className="plain-list remote-agent-notes">
          {view.errors.map((error) => (
            <li key={error}><span>○</span>{error}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{formatValue(value)}</strong>
    </div>
  );
}

function normalizeLocalStatus(data) {
  const server = data?.server ?? null;
  const stream = data?.stream ?? null;
  const websocket = data?.websocket ?? null;
  const errors = data?.errors ?? {};

  return {
    serverLoaded: Boolean(server),
    streamLoaded: Boolean(stream),
    websocketLoaded: Boolean(websocket),
    host: server?.host,
    port: server?.port ?? '8080',
    serverVersion: server?.serverVersion,
    moduleCount: Array.isArray(server?.modules) ? String(server.modules.length) : 'nicht vorhanden',
    routeCount: server?.routeDiagnostics?.totalRoutes,
    webrootDir: server?.webrootDir,
    wsClients: websocket?.clients ?? server?.wsClients,
    wsTime: websocket?.isoTs || websocket?.ts,
    live: stream?.live === true,
    stale: stream?.stale === true,
    broadcasterLogin: stream?.broadcasterLogin,
    title: stream?.title,
    gameName: stream?.gameName,
    viewerCount: stream?.viewerCount,
    streamSource: stream?.source,
    lastCheckedAt: stream?.lastCheckedAt,
    routesUsed: Array.isArray(data?.routesUsed) ? data.routesUsed : [],
    errors: Object.entries(errors)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .concat(data?.ok ? [] : ['Mindestens eine Statusroute konnte nicht geladen werden.'])
  };
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return 'nicht vorhanden';
  return String(value);
}
