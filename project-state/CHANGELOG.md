# CHANGELOG

## CAN-38.3

- Bus-Diagnose Read-only Summary Card stabilisiert.
- `htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js` ersetzt.
- MutationObserver entfernt.
- Kontrollierte Event-Hooks ergänzt:
  - DOMContentLoaded
  - Bus-Diagnose-Tab-Klicks
  - Bus-Diagnose-Aktions-Klicks
  - cgn:module-show
  - hashchange
  - visibilitychange
- Karte bleibt auf der Übersicht.
- Keine Backend-Änderung.
- Keine Änderung an `htdocs/dashboard/modules/bus_diagnostics.js`.
- Keine produktive Aktion.
- Genutzte Routen bleiben:
  - `GET /api/bus-diagnostics/status`
  - `GET /api/bus-diagnostics/recovery-preflight`

## CAN-38.2

- Bus-Diagnose/EventBus-Doku ergänzt:
  - `docs/modules/bus_diagnostics.md`
