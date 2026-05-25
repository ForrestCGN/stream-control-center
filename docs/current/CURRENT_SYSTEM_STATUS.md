# CURRENT_SYSTEM_STATUS – STEP420

## Aktueller Stand

STEP420 ergänzt eine read-only Bus-Diagnose für das Dashboard.

## Neu

- `backend/modules/bus_diagnostics.js`
- `htdocs/public/tools/bus_diagnostics_dashboard.html`

## Routen

- `/api/bus-diagnostics/status`
- `/api/bus-diagnostics/check`
- `/api/bus-diagnostics/routes`

## Dashboard

- `/public/tools/bus_diagnostics_dashboard.html`

## Zustand

- Sound-System bleibt zentrale Audio-/Medien-Schicht.
- Alert-System bleibt Alert-/Queue-/Visual-/TTS-Koordinator.
- EventBus-Beobachtung bleibt parallel/read-only.
- Produktive Flows werden nicht verändert.
