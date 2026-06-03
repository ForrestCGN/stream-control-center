# CHANGELOG

## CAN-42.8

- `backend/modules/tagebuch.js` erweitert:
  - `countTableRowsWhere()` ergänzt.
  - `buildStandardDiagnostics()` ergänzt.
  - `GET /api/tagebuch/status` liefert zusätzlich `diagnostics`.
- Bestehende Statusfelder bleiben erhalten.
- Keine neue Route.
- Keine Route entfernt.
- Keine DB-Migration.
- Keine produktive Aktion.
- Keine Funktionalität entfernt.

## CAN-42.7

- Admin-Diagnose liest Todo diagnostics-Block bevorzugt.
