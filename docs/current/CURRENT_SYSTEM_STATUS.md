# Current System Status – STEP421

## Stand
STEP421 integriert die read-only Bus-Diagnose aus STEP420 als echtes Dashboard-Modul.

## Modul
- Dashboard-Modul: `bus_diagnostics`
- Datei: `htdocs/dashboard/modules/bus_diagnostics.js`
- Styles: `htdocs/dashboard/modules/bus_diagnostics.css`
- Panel: `busDiagnosticsModule`
- Menügruppe: Admin

## Routen
Das Modul nutzt read-only:
- `/api/bus-diagnostics/status`
- `/api/bus-diagnostics/check`

## Unverändert
- Sound-System bleibt zentrale Audio-/Medien-Schicht.
- Alert-System bleibt Alert-/Queue-/Visual-/TTS-Koordinator.
- EventBus bleibt Beobachtungs-/Diagnose-/Korrelationsschicht.
- Keine produktiven Flows wurden ersetzt.
