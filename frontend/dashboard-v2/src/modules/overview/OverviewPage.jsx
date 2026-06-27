import { Card } from "../../components/Card.jsx";

export function OverviewPage() {
  return (
    <div className="view-grid">
      <Card title="Lokaler Dashboard-Einstieg" eyebrow="0.2.9">
        <p>
          Dashboard-v2 läuft auf dem bestehenden lokalen Node/Express-Server. Es wird
          schrittweise zum Nachfolger des bisherigen Dashboards ausgebaut.
        </p>

        <div className="info-list">
          <InfoRow label="Neuer Einstieg" value="http://127.0.0.1:8080/dashboard-v2/" />
          <InfoRow label="Bisheriges Dashboard" value="http://127.0.0.1:8080/dashboard/" />
          <InfoRow label="Betriebsart" value="Lokal · Read-only" />
        </div>
      </Card>

      <Card title="Sicherer Ausgangspunkt" eyebrow="Aktueller Umfang">
        <ul className="check-list">
          <li><span>✓</span> bestehende React/Vite-Struktur verwendet</li>
          <li><span>✓</span> bestehender Server auf Port 8080 verwendet</li>
          <li><span>✓</span> keine produktiven Aktionen vorhanden</li>
          <li><span>✓</span> bisheriges Dashboard bleibt unverändert</li>
        </ul>
      </Card>

      <Card title="Navigation angeglichen" eyebrow="Modboard-Struktur">
        <div className="chip-row">
          <span className="cgn-chip cgn-chip--ok">System</span>
          <span className="cgn-chip cgn-chip--ok">Module</span>
          <span className="cgn-chip cgn-chip--ok">Admin</span>
          <span className="cgn-chip cgn-chip--info">Read-only</span>
        </div>
      </Card>

      <Card title="Noch nicht freigegeben" eyebrow="Nächste Schritte separat">
        <ul className="plain-list">
          <li><span>○</span> keine OBS- oder Overlay-Steuerung</li>
          <li><span>○</span> keine Sound- oder Media-Aktionen</li>
          <li><span>○</span> keine Commands oder Prozessaktionen</li>
          <li><span>○</span> keine Änderungen oder Speicherfunktionen</li>
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
