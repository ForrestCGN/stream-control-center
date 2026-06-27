import { Card } from "../../components/Card.jsx";

export function OverviewPage() {
  return (
    <>
      <section className="page-header module-page-header cgn-card"><p className="cgn-eyebrow">Remote Modboard</p><h1>Übersicht</h1><p>Alles Wichtige auf einen Blick: lokaler Server, Stream-PC Status und sichere Read-only-Grenzen.</p></section>
      <section className="metric-grid"><Metric label="Server" value="Lokal" sub="Port 8080" /><Metric label="Login" value="Geplant" sub="lokaler Zugriff später" /><Metric label="Session" value="Read-only" sub="keine Schreibrechte" /><Metric label="Bearbeiten" value="Geschützt" sub="keine Writes" warn /></section>
      <section className="page-grid"><Card title="Letzte Änderungen" eyebrow="Aktivitäten"><div className="activity-row"><div className="activity-icon">📋</div><div><b>Verlauf wird hier sichtbar</b><small>Produktive Historie bleibt später an Rechte, Audit und sichere Reads gebunden.</small></div></div></Card><Card title="Wichtige Bereiche" eyebrow="Schnellzugriff"><div className="quick-list"><div className="quick-row"><div className="quick-icon cyan">🖥</div><div><b>Stream-PC</b><small>Status lesen, keine Steuerung auslösen.</small></div></div><div className="quick-row"><div className="quick-icon purple">🧩</div><div><b>Module</b><small>Nächster geplanter Read-only Schritt.</small></div></div><div className="quick-row"><div className="quick-icon green">🛡</div><div><b>Sicherheit</b><small>Keine OBS-, Sound-, Overlay-, Command- oder Prozessaktionen.</small></div></div></div></Card></section>
    </>
  );
}

function Metric({ label, value, sub, warn = false }) {
  return <article className="metric-card cgn-card"><span>{label}</span><strong>{value}</strong><small>{sub}</small><div className={`cgn-progress ${warn ? "cgn-progress--warn" : ""}`}><i style={{ width: warn ? "8%" : "86%" }}></i></div></article>;
}
