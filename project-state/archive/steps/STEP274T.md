# STEP274T – Dashboard Reactive Controls Standard

## Ziel

Das in der Medienverwaltung getestete Verhalten wird als allgemeiner Dashboard-UX-Standard festgelegt:

- Suchfelder filtern live beim Tippen.
- Dropdown-Auswahlen aktualisieren sofort.
- Fokus/Cursor sollen nach Re-Render erhalten bleiben.
- Explizite Buttons bleiben nur für Aktionen mit Nebenwirkung oder Risiko.

## Dateien

- `htdocs/dashboard/components/reactive_controls.js`
- `htdocs/dashboard/index.html`
- `docs/dashboard/REACTIVE_CONTROLS_STANDARD.md`
- Projektstatus-Dateien

## Wichtig

Der Helper ist vorbereitet und global geladen. Bestehende Module werden nicht automatisch verändert. Künftige Dashboard-Module und ohnehin angefasste Module sollen dieses Pattern nutzen.
