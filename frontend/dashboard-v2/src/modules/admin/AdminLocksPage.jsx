import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/Card.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import {
  getRemoteAgentLocksStatus,
  getRemoteAgentLocksStatusFallback
} from '../../services/agentClient.js';

export function AdminLocksPage() {
  const [locksData, setLocksData] = useState(() => getRemoteAgentLocksStatusFallback());
  const [loadState, setLoadState] = useState('loading');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadLocks() {
      setLoadState('loading');
      setLoadError('');

      try {
        const data = await getRemoteAgentLocksStatus();
        if (cancelled) return;
        setLocksData(data);
        setLoadState('ready');
      } catch (err) {
        if (cancelled) return;
        setLocksData(getRemoteAgentLocksStatusFallback());
        setLoadError(err && err.message ? err.message : String(err));
        setLoadState('error');
      }
    }

    loadLocks();

    return () => {
      cancelled = true;
    };
  }, []);

  const view = useMemo(() => normalizeLocks(locksData), [locksData]);

  return (
    <div className="view-grid remote-agent-grid">
      <Card title="Lock-Modell / Nullstatus" eyebrow={view.modelApiVersion}>
        <div className="chip-row">
          <StatusBadge tone="warn">Locks noch aus</StatusBadge>
          <StatusBadge tone="info">read-only Vorschau</StatusBadge>
          <StatusBadge tone="ok">{view.summary.activeLockCount} aktive Locks</StatusBadge>
        </div>

        <div className="info-list">
          <InfoRow label="Resource-Key" value={view.locks.plannedResourceKeyFormat} />
          <InfoRow label="Heartbeat" value={formatSeconds(view.locks.heartbeatIntervalSec)} />
          <InfoRow label="Timeout" value={formatSeconds(view.locks.timeoutSec)} />
          <InfoRow label="Takeover" value={view.locks.takeoverAllowedFor.join(', ') || 'nicht vorhanden'} />
          <InfoRow label="Version-Check" value={view.locks.versionCheckRequired ? 'ja' : 'nein'} />
          <InfoRow label="Speichern" value={view.locks.saveRequiresValidLock ? 'nur mit gültigem Lock' : 'nicht erzwungen'} />
          <InfoRow label="Lesen während Lock" value={view.locks.sharedReadWhileLocked ? 'ja' : 'nein'} />
        </div>
      </Card>

      <Card title="Aktuelle Locks" eyebrow="Nullstatus">
        <div className="info-list">
          <InfoRow label="Enabled" value={view.summary.enabled ? 'ja' : 'nein'} />
          <InfoRow label="Aktiv" value={String(view.summary.activeLockCount)} />
          <InfoRow label="Veraltet" value={String(view.summary.staleLockCount)} />
          <InfoRow label="Takeover offen" value={String(view.summary.takeoverPendingCount)} />
        </div>

        {view.activeLocks.length ? (
          <ul className="plain-list remote-agent-notes">
            {view.activeLocks.map((lock, index) => (
              <li key={lock.lockId || index}><span>○</span>{JSON.stringify(lock)}</li>
            ))}
          </ul>
        ) : (
          <p className="card-footer">Keine aktiven Locks. Das ist im aktuellen RDAP4B/RDAP4C2-Stand korrekt.</p>
        )}
      </Card>

      <Card title="Geplante Lock-Zustände" eyebrow="Später produktiv">
        <ul className="plain-list">
          {view.locks.plannedStates.map((state) => (
            <li key={state}><span>○</span>{state}</li>
          ))}
        </ul>
      </Card>

      <Card title="Hinweise" eyebrow="Sicherheitsregeln">
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
          <StatusBadge tone="ok">keine Lock-Schreibroute</StatusBadge>
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

function normalizeLocks(data) {
  const locks = data?.locks ?? {};
  const summary = data?.summary ?? {};
  const activeLocks = Array.isArray(data?.activeLocks) ? data.activeLocks : [];
  const notes = [
    ...(Array.isArray(locks.notes) ? locks.notes : []),
    ...(Array.isArray(data?.warnings) ? data.warnings : [])
  ];

  return {
    modelApiVersion: String(data?.modelApiVersion || 'locks.unknown'),
    locks: {
      enabled: Boolean(locks.enabled),
      readOnlyPreview: locks.readOnlyPreview !== false,
      plannedResourceKeyFormat: String(locks.plannedResourceKeyFormat || '<bereich>:<modul>:<resource-id>'),
      plannedStates: Array.isArray(locks.plannedStates) ? locks.plannedStates : [],
      heartbeatIntervalSec: locks.heartbeatIntervalSec,
      timeoutSec: locks.timeoutSec,
      takeoverAllowedFor: Array.isArray(locks.takeoverAllowedFor) ? locks.takeoverAllowedFor : [],
      versionCheckRequired: locks.versionCheckRequired !== false,
      saveRequiresValidLock: locks.saveRequiresValidLock !== false,
      sharedReadWhileLocked: locks.sharedReadWhileLocked !== false
    },
    activeLocks,
    summary: {
      enabled: Boolean(summary.enabled),
      activeLockCount: Number(summary.activeLockCount || 0),
      staleLockCount: Number(summary.staleLockCount || 0),
      takeoverPendingCount: Number(summary.takeoverPendingCount || 0)
    },
    notes: notes.length ? notes : ['Keine Hinweise vom Backend gemeldet.']
  };
}

function formatSeconds(value) {
  return typeof value === 'number' ? `${value}s` : 'nicht vorhanden';
}
