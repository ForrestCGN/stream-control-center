import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/Card.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import {
  getRemoteAgentAuditModel,
  getRemoteAgentAuditModelFallback,
  getRemoteAgentRoutes,
  getRemoteAgentRoutesFallback
} from '../../services/agentClient.js';

export function AdminAuditPage() {
  const [auditData, setAuditData] = useState(() => getRemoteAgentAuditModelFallback());
  const [routesData, setRoutesData] = useState(() => getRemoteAgentRoutesFallback());
  const [loadState, setLoadState] = useState('loading');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadAudit() {
      setLoadState('loading');
      setLoadError('');

      try {
        const [audit, routes] = await Promise.all([
          getRemoteAgentAuditModel(),
          getRemoteAgentRoutes()
        ]);
        if (cancelled) return;
        setAuditData(audit);
        setRoutesData(routes);
        setLoadState('ready');
      } catch (err) {
        if (cancelled) return;
        setAuditData(getRemoteAgentAuditModelFallback());
        setRoutesData(getRemoteAgentRoutesFallback());
        setLoadError(err && err.message ? err.message : String(err));
        setLoadState('error');
      }
    }

    loadAudit();

    return () => {
      cancelled = true;
    };
  }, []);

  const view = useMemo(() => normalizeAudit(auditData, routesData), [auditData, routesData]);

  return (
    <div className="view-grid remote-agent-grid">
      <Card title="Audit-Modell" eyebrow={view.modelApiVersion}>
        <div className="chip-row">
          <StatusBadge tone="warn">Audit noch aus</StatusBadge>
          <StatusBadge tone={view.summary.retentionConfigurable ? 'ok' : 'warn'}>Retention konfigurierbar</StatusBadge>
          <StatusBadge tone="info">read-only Modell</StatusBadge>
        </div>

        <div className="info-list">
          <InfoRow label="Mindestfelder" value={String(view.audit.minimumFields.length)} />
          <InfoRow label="Eventtypen" value={String(view.audit.plannedEventTypes.length)} />
          <InfoRow label="Quellen" value={view.audit.sources.join(', ') || 'nicht vorhanden'} />
          <InfoRow label="Events verfügbar" value={view.summary.recentEventsAvailable ? 'ja' : 'nein'} />
        </div>
      </Card>

      <Card title="Geplante Audit-Felder" eyebrow="Mindestfelder">
        <ul className="plain-list">
          {view.audit.minimumFields.map((field) => (
            <li key={field}><span>○</span>{field}</li>
          ))}
        </ul>
      </Card>

      <Card title="Geplante Eventtypen" eyebrow="Audit-Pflicht später">
        <ul className="plain-list">
          {view.audit.plannedEventTypes.map((type) => (
            <li key={type}><span>○</span>{type}</li>
          ))}
        </ul>
      </Card>

      <Card title="Read-only API-Routen" eyebrow="RDAP4B Vertrag">
        <div className="chip-row">
          <StatusBadge tone="info">{view.routes.length} Routen</StatusBadge>
          <StatusBadge tone="ok">nur GET</StatusBadge>
          <StatusBadge tone="warn">keine Schreibroute</StatusBadge>
        </div>

        <ul className="plain-list remote-agent-notes">
          {view.routes.map((route) => (
            <li key={`${route.method}-${route.path}`}>
              <span>○</span>
              <strong>{route.method}</strong> {route.path}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Hinweise" eyebrow="Audit-Sicherheit">
        <ul className="plain-list">
          {view.notes.map((note) => (
            <li key={note}><span>○</span>{note}</li>
          ))}
        </ul>

        {loadError ? <p className="remote-agent-error">{loadError}</p> : null}

        <div className="chip-row" style={{ marginTop: 14 }}>
          <StatusBadge tone={loadState === 'ready' ? 'ok' : loadState === 'error' ? 'danger' : 'info'}>
            {loadState === 'ready' ? 'API geladen' : loadState === 'error' ? 'API-Fehler' : 'lädt'}
          </StatusBadge>
          <StatusBadge tone="info">read-only</StatusBadge>
          <StatusBadge tone="ok">keine Audit-Schreibroute</StatusBadge>
        </div>
      </Card>
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

function normalizeAudit(auditData, routesData) {
  const audit = auditData?.audit ?? {};
  const summary = auditData?.summary ?? {};
  const notes = [
    ...(Array.isArray(audit.notes) ? audit.notes : []),
    ...(Array.isArray(auditData?.warnings) ? auditData.warnings : []),
    ...(Array.isArray(routesData?.warnings) ? routesData.warnings : [])
  ];

  return {
    modelApiVersion: String(auditData?.modelApiVersion || 'audit.unknown'),
    audit: {
      enabled: Boolean(audit.enabled),
      readOnlyPreview: audit.readOnlyPreview !== false,
      retentionConfigurable: audit.retentionConfigurable !== false,
      minimumFields: Array.isArray(audit.minimumFields) ? audit.minimumFields : [],
      plannedEventTypes: Array.isArray(audit.plannedEventTypes) ? audit.plannedEventTypes : [],
      sources: Array.isArray(audit.sources) ? audit.sources : []
    },
    summary: {
      enabled: Boolean(summary.enabled),
      recentEventsAvailable: Boolean(summary.recentEventsAvailable),
      retentionConfigurable: summary.retentionConfigurable !== false
    },
    routes: Array.isArray(routesData?.routes) ? routesData.routes : [],
    notes: notes.length ? notes : ['Keine Hinweise vom Backend gemeldet.']
  };
}
