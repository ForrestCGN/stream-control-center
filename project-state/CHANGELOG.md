# CHANGELOG

## CAN-32.1

- Bus-Diagnose Dashboard um read-only Sicherheits-Zusammenfassung vorbereitet.
- Neue Dateien:
  - `htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js`
  - `htdocs/dashboard/modules/bus_diagnostics_readonly_summary.css`
- Geändert:
  - `htdocs/dashboard/index.html` lädt CSS und JS nach dem bestehenden Bus-Diagnose-Modul.
- Bestehende `bus_diagnostics.js` bleibt unverändert.
- Neue Karte in `Bus-Diagnose > Übersicht`:
  - Status read-only
  - Recovery Route read-only
  - Flow touched
  - Queue touched
  - Sound touched
  - Overlay touched
  - Recovery prepare
  - Recovery execute
- Nur read-only GET-Routen:
  - `/api/bus-diagnostics/status`
  - `/api/bus-diagnostics/recovery-preflight`
- Keine produktiven Aktionen, keine Recovery-Ausführung, keine DB/OBS/Sound/Queue/Twitch-Aktion.

## CAN-31.2

- Erfolgreichen Live-Test von CAN-31.1 dokumentiert.
- WebSocket-Connect-Spam wurde durch Summary-Zeilen ersetzt.

## CAN-30.1

- SQLite ExperimentalWarning dokumentiert und akzeptiert.
