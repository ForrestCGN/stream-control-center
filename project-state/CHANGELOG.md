# CHANGELOG

## CAN-32.2

- Erfolgreiche Dashboard-Sichtprüfung von CAN-32.1 dokumentiert.
- Bestätigt sichtbar:
  - Karte `Sicherheits- / Read-only-Zusammenfassung`
  - `READ-ONLY OK`
  - Status read-only: ja
  - Recovery Route read-only: ja
  - Flow touched: nein
  - Queue touched: nein
  - Sound touched: nein
  - Overlay touched: nein
  - Recovery prepare: nein
  - Recovery execute: nein
- Bestätigt:
  - Keine produktiven Buttons.
  - Keine Recovery-Ausführung.
  - Keine OBS-/Sound-/Queue-/Twitch-/DB-Aktion.
- Keine Codeänderung in CAN-32.2.

## CAN-32.1

- Bus-Diagnose Dashboard um read-only Sicherheits-Zusammenfassung erweitert.
- Neue Dateien:
  - `htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js`
  - `htdocs/dashboard/modules/bus_diagnostics_readonly_summary.css`
- Geändert:
  - `htdocs/dashboard/index.html` lädt CSS und JS nach dem bestehenden Bus-Diagnose-Modul.
- Bestehende `bus_diagnostics.js` bleibt unverändert.
- Nur read-only GET-Routen:
  - `/api/bus-diagnostics/status`
  - `/api/bus-diagnostics/recovery-preflight`

## CAN-31.2

- Erfolgreichen Live-Test von CAN-31.1 dokumentiert.
- WebSocket-Connect-Spam wurde durch Summary-Zeilen ersetzt.

## CAN-30.1

- SQLite ExperimentalWarning dokumentiert und akzeptiert.
