import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/Card.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import {
  getRemoteAgentPermissionsModel,
  getRemoteAgentPermissionsModelFallback
} from '../../services/agentClient.js';

export function AdminUsersPage() {
  const [model, setModel] = useState(() => getRemoteAgentPermissionsModelFallback());
  const [loadState, setLoadState] = useState('loading');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      setLoadState('loading');
      setLoadError('');

      try {
        const data = await getRemoteAgentPermissionsModel();
        if (cancelled) return;
        setModel(data);
        setLoadState('ready');
      } catch (err) {
        if (cancelled) return;
        setModel(getRemoteAgentPermissionsModelFallback());
        setLoadError(err && err.message ? err.message : String(err));
        setLoadState('error');
      }
    }

    loadModel();

    return () => {
      cancelled = true;
    };
  }, []);

  const view = useMemo(() => normalizePermissionsModel(model), [model]);

  return (
    <div className="view-grid remote-agent-grid">
      <Card title="Permissions-Modell" eyebrow={view.modelApiVersion}>
        <div className="chip-row">
          <StatusBadge tone="info">Rollen sind Presets</StatusBadge>
          <StatusBadge tone="warn">Permission-Key entscheidet</StatusBadge>
          <StatusBadge tone="ok">Twitch-Rollen ≠ Dashboard-Rechte</StatusBadge>
        </div>

        <div className="info-list">
          <InfoRow label="Rollen" value={String(view.roles.length)} />
          <InfoRow label="Permissions" value={String(view.permissions.length)} />
          <InfoRow label="Regel" value={view.permissionDecisionRule} />
          <InfoRow label="Read-only" value={view.readOnly ? 'ja' : 'nein'} />
        </div>

        <ul className="plain-list remote-agent-notes">
          {view.roles.map((role) => (
            <li key={role.key}><span>○</span><strong>{role.label}</strong> — {role.purpose}</li>
          ))}
        </ul>
      </Card>

      <Card title="Permission-Keys" eyebrow="Serverseitige Entscheidung später">
        <ul className="plain-list">
          {view.permissions.map((permission) => (
            <li key={permission.key}>
              <span>○</span>
              <strong>{permission.key}</strong> — {permission.label} / {permission.protectionLevel}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Spezialrolle Sound-Profi" eyebrow="Sound / Media / Commands">
        <div className="info-list">
          <InfoRow label="Rolle" value={view.soundProfi.label} />
          <InfoRow label="Preset" value={view.soundProfiPreset.join(', ') || 'nicht vorhanden'} />
        </div>

        <span className="card-footer">Darf später</span>
        <ul className="check-list remote-agent-notes">
          {view.soundProfi.may.map((item) => (
            <li key={item}><span>✓</span>{item}</li>
          ))}
        </ul>

        <span className="card-footer">Darf nicht</span>
        <ul className="plain-list remote-agent-notes">
          {view.soundProfi.mayNot.map((item) => (
            <li key={item}><span>×</span>{item}</li>
          ))}
        </ul>
      </Card>

      <Card title="Role-Permission-Presets" eyebrow="Read-only Vertrag">
        <div className="info-list">
          {Object.entries(view.rolePermissionPresets).map(([role, permissions]) => (
            <InfoRow key={role} label={role} value={Array.isArray(permissions) ? permissions.join(', ') : String(permissions)} />
          ))}
        </div>
      </Card>

      <Card title="API-Zustand" eyebrow="Benutzer & Rechte">
        <div className="chip-row">
          <StatusBadge tone={loadState === 'ready' ? 'ok' : loadState === 'error' ? 'danger' : 'info'}>
            {loadState === 'ready' ? 'API geladen' : loadState === 'error' ? 'API-Fehler' : 'lädt'}
          </StatusBadge>
          <StatusBadge tone="info">read-only</StatusBadge>
          <StatusBadge tone="ok">keine User-/Grant-Schreiboperation</StatusBadge>
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

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function normalizePermissionsModel(data) {
  const specialRoles = data?.specialRoles ?? {};
  const rolePermissionPresets = data?.rolePermissionPresets ?? {};
  const soundProfi = specialRoles.sound_profi ?? { label: 'Sound-Profi', may: [], mayNot: [] };

  return {
    modelApiVersion: String(data?.modelApiVersion || 'permissions.unknown'),
    readOnly: data?.readOnly !== false,
    permissionDecisionRule: String(data?.permissionDecisionRule || 'nicht vorhanden'),
    roles: Array.isArray(data?.roles) ? data.roles : [],
    permissions: Array.isArray(data?.permissions) ? data.permissions : [],
    rolePermissionPresets,
    soundProfi: {
      label: String(soundProfi.label || 'Sound-Profi'),
      may: Array.isArray(soundProfi.may) ? soundProfi.may : [],
      mayNot: Array.isArray(soundProfi.mayNot) ? soundProfi.mayNot : []
    },
    soundProfiPreset: Array.isArray(rolePermissionPresets.sound_profi) ? rolePermissionPresets.sound_profi : [],
    warnings: Array.isArray(data?.warnings) && data.warnings.length ? data.warnings : ['Keine Warnungen vom Backend gemeldet.']
  };
}
