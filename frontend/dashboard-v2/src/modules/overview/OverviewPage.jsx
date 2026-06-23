import { Card } from "../../components/Card.jsx";

export function OverviewPage() {
  return (
    <div className="view-grid">
      <Card title="Dashboard-v2 läuft parallel" eyebrow="Grundsatz">
        <p>
          Das bestehende Dashboard bleibt produktiv. Dashboard-v2 wird daneben aufgebaut
          und übernimmt Module nur schrittweise.
        </p>

        <div className="info-list">
          <InfoRow label="Produktiv" value="http://127.0.0.1:8080/dashboard" />
          <InfoRow label="Neu geplant" value="http://127.0.0.1:8080/dashboard-v2" />
          <InfoRow label="Remote-Ziel" value="https://mods.forrestcgn.de" />
        </div>
      </Card>

      <Card title="Migrationsregeln" eyebrow="Modul für Modul">
        <ul className="check-list">
          <li><span>✓</span> jedes Modul zuerst read-only</li>
          <li><span>✓</span> Schreibfunktionen erst mit Permission, Lock und Audit</li>
          <li><span>✓</span> altes Dashboard bleibt Fallback</li>
          <li><span>✓</span> keine dritte Sidebar-Ebene</li>
        </ul>
      </Card>

      <Card title="Aktueller Prototypumfang" eyebrow="DASHUI5">
        <div className="chip-row">
          <span className="cgn-chip cgn-chip--ok">V13-Designbasis</span>
          <span className="cgn-chip cgn-chip--ok">Topbar inline</span>
          <span className="cgn-chip cgn-chip--ok">Accordion Sidebar</span>
          <span className="cgn-chip cgn-chip--info">keine produktiven Aktionen</span>
        </div>
      </Card>

      <Card title="Noch nicht aktiv" eyebrow="Bewusst nicht enthalten">
        <ul className="plain-list">
          <li><span>○</span> kein Login-Zwang</li>
          <li><span>○</span> keine Schreibaktionen</li>
          <li><span>○</span> keine OBS-/Sound-/Media-Steuerung</li>
          <li><span>○</span> keine DB- oder Backend-Änderung</li>
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
