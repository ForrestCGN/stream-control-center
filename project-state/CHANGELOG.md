# CHANGELOG

## CAN-33.3

- Commands-Dashboard Read-only-Diagnosekarte vorbereitet.
- Neue Dateien:
  - `htdocs/dashboard/modules/commands_readonly_diagnostics.js`
  - `htdocs/dashboard/modules/commands_readonly_diagnostics.css`
- Geändert:
  - `htdocs/dashboard/index.html` lädt CSS/JS nach dem bestehenden Commands-Modul.
- Nicht geändert:
  - `htdocs/dashboard/modules/commands.js`
  - `backend/modules/commands.js`
- Die Karte nutzt nur:
  - `GET /api/commands/status`
  - `GET /api/commands/list`
  - `GET /api/commands/logs?limit=15`
  - `GET /api/commands/catalog`
- Gesperrt/nicht genutzt:
  - `/api/commands/execute`
  - `/api/commands/upsert`
  - `/api/commands/delete`
- Keine produktiven Aktionen, keine Command-Ausführung, keine DB-Migration.

## CAN-33.2

- Commands-Modul-Doku ergänzt:
  - `docs/modules/commands.md`
- Read-only-/Produktiv-Regeln dokumentiert.

## CAN-33.1

- Commands-Modul analysiert.
- Ergebnis:
  - Backend `commands.js` besitzt MODULE_META, Status, Routenliste und DryRun/Testpfad.
  - Dashboard `commands.js` ist umfangreich und nutzt Status/List/Logs/Catalog/Test/Execute/Upsert/Delete.
  - Dedizierte Doku `docs/modules/commands.md` fehlte.

## CAN-32.2

- Erfolgreiche Dashboard-Sichtprüfung von CAN-32.1 dokumentiert.
