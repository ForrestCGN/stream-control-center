# HT3.5 – HypeTrain Event-Actions UX Cleanup

## Ziel

Der Event-Actions-Tab wurde streamerfreundlicher gemacht. Test-/Diagnosefunktionen liegen nicht mehr in der normalen Event-Actions-Konfiguration.

## Geändert

- `htdocs/dashboard/modules/hypetrain.js`
  - Event-Actions-Tab bleibt im normalen HypeTrain-Modul.
  - Keine Test-/Dry-Run-Buttons mehr in den Event-Actions-Karten.
  - Status pro Aktion: aus / bereit / unvollständig.
  - Erweiterte Sound-Optionen sind einklappbar.
  - Tests für Start/Stufenaufstieg/Ende/Rekord liegen im Tests-Tab.
  - Übersicht zeigt Event-Actions nur noch kompakt.
- `htdocs/dashboard/modules/hypetrain.css`
  - Styles für Bereitschaftsanzeige und erweiterte Einstellungen ergänzt.

## Nicht geändert

- Kein Backend-Umbau.
- Keine DB-Änderung.
- Kein `sound_system`-Umbau.
- Keine neuen Dashboard-Module.
- Keine separaten `hypetrain_event_actions.*` Dateien.
