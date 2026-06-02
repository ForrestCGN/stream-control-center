# CHANGELOG

## CAN-33.4

- Erfolgreiche Dashboard-Sichtprüfung von CAN-33.3 dokumentiert.
- Bestätigt sichtbar:
  - `Commands Read-only Diagnose`
  - `READ-ONLY OK`
  - `v0.1.6`
  - `channel-guard`
  - Status OK: ja
  - Schema OK: ja
  - Light Status: ja
  - Schema Touch: nein
  - Commands: 15
  - Logs geladen: 15
  - Katalog-Kategorien: 7
  - Katalog-Aktionen: 24
- Bestätigte Read-only Routen:
  - `GET /api/commands/status`
  - `GET /api/commands/list`
  - `GET /api/commands/catalog`
  - `GET /api/commands/logs`
  - `GET /api/commands/history`
  - `GET /api/commands/media-command-preview`
- Bestätigte produktiv gesperrte Routen:
  - `POST /api/commands/upsert`
  - `POST /api/commands/delete`
  - `GET/POST /api/commands/execute`
- Bestätigt:
  - Keine Execute-/Upsert-/Delete-Buttons.
  - Keine Command-Ausführung.
  - Keine Speicherung.
  - Kein Löschen.
  - Keine Zielmodule ausgelöst.
- Keine Codeänderung in CAN-33.4.

## CAN-33.3

- Commands-Dashboard Read-only-Diagnosekarte umgesetzt.
- Neue Dateien:
  - `htdocs/dashboard/modules/commands_readonly_diagnostics.js`
  - `htdocs/dashboard/modules/commands_readonly_diagnostics.css`
- Geändert:
  - `htdocs/dashboard/index.html` lädt CSS/JS nach dem bestehenden Commands-Modul.
- Nicht geändert:
  - `htdocs/dashboard/modules/commands.js`
  - `backend/modules/commands.js`

## CAN-33.2

- Commands-Modul-Doku ergänzt:
  - `docs/modules/commands.md`
- Read-only-/Produktiv-Regeln dokumentiert.

## CAN-33.1

- Commands-Modul analysiert.
