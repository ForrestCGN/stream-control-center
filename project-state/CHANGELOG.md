# CHANGELOG

## CAN-33.2

- Commands-Modul-Doku vorbereitet:
  - `docs/modules/commands.md`
- Dokumentiert:
  - Modulzweck
  - MODULE_META / Version / Build
  - Backend-Routen
  - Dashboard-Routen
  - Status-Endpunkt
  - DryRun/Test vs Execute
  - Read-only Routen
  - produktive/potenziell produktive Routen
  - Sicherheitsregeln für spätere Diagnosekarten
- Keine Codeänderung.
- Keine Command-Funktion geändert.
- Keine Chat-Ausgaben geändert.
- Keine DB-Migration.
- Keine produktiven Buttons.
- Keine Execute-/Upsert-/Delete-Tests.

## CAN-33.1

- Commands-Modul analysiert.
- Ergebnis:
  - Backend `commands.js` besitzt MODULE_META, Status, Routenliste und DryRun/Testpfad.
  - Dashboard `commands.js` ist umfangreich und nutzt Status/List/Logs/Catalog/Test/Execute/Upsert/Delete.
  - Dedizierte Doku `docs/modules/commands.md` fehlte.

## CAN-32.2

- Erfolgreiche Dashboard-Sichtprüfung von CAN-32.1 dokumentiert.
- Bus-Diagnose Read-only-Sicherheitskarte sichtbar geprüft.

## CAN-31.2

- Erfolgreichen Live-Test von CAN-31.1 dokumentiert.
- WebSocket-Connect-Spam wurde durch Summary-Zeilen ersetzt.
