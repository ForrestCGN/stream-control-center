import { Card } from "../../components/Card.jsx";

export function RemoteAgentPage() {
  return (
    <div className="view-grid">
      <Card title="Remote-Agent Konzept" eyebrow="RDAP3">
        <p>
          Der Stream-PC-Agent ist als separater Node-Prozess geplant. Er verbindet sich
          später aktiv per WSS zum Webserver und führt nur erlaubte Actions aus.
        </p>

        <div className="info-list">
          <InfoRow label="Agent-Prozess" value="separat geplant" />
          <InfoRow label="Verbindung" value="WSS aktiv vom Stream-PC zum Webserver" />
          <InfoRow label="Öffentlicher Port" value="nicht geplant" />
          <InfoRow label="Offline-Queue" value="nicht erlaubt" />
        </div>
      </Card>

      <Card title="Minimal erlaubte Actions" eyebrow="Read-only / Diagnose">
        <ul className="check-list">
          <li><span>✓</span> agent.ping</li>
          <li><span>✓</span> agent.status.request</li>
          <li><span>✓</span> Heartbeat / Reconnect-Status</li>
        </ul>
      </Card>

      <Card title="Sicherheitsgrenzen" eyebrow="Nicht im Prototyp">
        <ul className="plain-list">
          <li><span>○</span> keine Sound-Steuerung</li>
          <li><span>○</span> keine OBS-Steuerung</li>
          <li><span>○</span> keine Media-Schreiboperation</li>
          <li><span>○</span> keine Text-/Config-Änderung</li>
          <li><span>○</span> keine Shell-/Datei-/Prozessaktionen</li>
        </ul>
      </Card>

      <Card title="Status in DASHUI5" eyebrow="Platzhalter">
        <div className="chip-row">
          <span className="cgn-chip cgn-chip--info">Planung vorhanden</span>
          <span className="cgn-chip">kein echter Agent verbunden</span>
          <span className="cgn-chip">kein WebSocket aktiv</span>
          <span className="cgn-chip cgn-chip--ok">keine produktiven Aktionen</span>
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
