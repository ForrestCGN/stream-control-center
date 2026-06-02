# CHANGELOG

## CAN-36.2

- Message-Rotator-Modul-Doku vorbereitet:
  - `docs/modules/message_rotator.md`
- Dokumentiert:
  - Modulzweck
  - MODULE_META / Version / Routenprefix
  - Status-Endpunkt
  - Read-only Routen
  - produktive/schreibende Routen
  - Dashboard-Schreibfunktionen
  - Integration-Check als sichere Diagnose
  - besondere Warnung zu `next`, `manual`, `start`, `stop`, `tick`, `reload`, `live-status`
  - Regeln für spätere Message-Rotator-Diagnosekarten
- Keine Codeänderung.
- Keine Message gesendet.
- Kein Rotator gestartet/gestoppt.
- Kein Tick ausgelöst.
- Kein Next/Manual ausgelöst.
- Keine Settings gespeichert.
- Keine Texte/Varianten gespeichert/gelöscht.
- Kein Reload ausgelöst.
- Keine Live-Status-Abfrage erzwungen.
- Keine DB-Migration.
- Keine Dashboard-Write-Buttons getestet.
- Keine Discord-/Twitch-/Chat-Nachricht gepostet.

## CAN-36.1

- Message-Rotator-Modul analysiert.
- Ergebnis:
  - Backend `message_rotator.js` besitzt MODULE_META, Status, Routenliste und Integration-Check.
  - Dashboard `message_rotator.js` nutzt Status/Settings/Texts/Integration und produktive Controls.
  - Dedizierte Doku `docs/modules/message_rotator.md` fehlte.

## CAN-35.4

- Erfolgreiche Sicht- und Stabilitätsprüfung der Tagebuch Read-only Diagnosekarte dokumentiert.
