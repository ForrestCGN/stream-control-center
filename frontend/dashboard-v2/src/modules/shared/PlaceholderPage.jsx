import { Card } from "../../components/Card.jsx";

export function PlaceholderPage({ moduleDefinition }) {
  return (
    <div className="view-grid view-grid--single">
      <Card title={`${moduleDefinition.moduleTitle} ist geplant`} eyebrow={moduleDefinition.sectionTitle}>
        <p>
          Dieses Modul ist im Dashboard-v2 noch nicht migriert. Es bleibt im bestehenden
          Dashboard produktiv und wird später einzeln geprüft.
        </p>

        <div className="chip-row">
          <span className="cgn-chip">not_started</span>
          <span className="cgn-chip cgn-chip--info">Migration später</span>
          <span className="cgn-chip cgn-chip--ok">Legacy bleibt erhalten</span>
        </div>
      </Card>
    </div>
  );
}
