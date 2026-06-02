# CHANGELOG

## CAN-34.3

- Todo-Dashboard Read-only-Diagnosekarte vorbereitet.
- Neue Dateien:
  - `htdocs/dashboard/modules/todo_readonly_diagnostics.js`
  - `htdocs/dashboard/modules/todo_readonly_diagnostics.css`
- Geändert:
  - `htdocs/dashboard/index.html` lädt CSS/JS nach dem bestehenden Todo-Modul.
- Nicht geändert:
  - `htdocs/dashboard/modules/todo.js`
  - `backend/modules/todo.js`
- Die Karte nutzt nur:
  - `GET /api/todo/status`
  - `GET /api/todo/routes`
  - `GET /api/todo/integration-check`
- Gesperrt/nicht genutzt:
  - `/api/todo/add`
  - `/discord/todo`
  - `/api/todo/reload`
  - `POST /api/todo/admin/settings`
  - `POST /api/todo/admin/texts`
- Keine produktiven Aktionen, keine Todo-Einträge, keine Settings-/Textspeicherung, keine DB-Migration.

## CAN-34.2

- Todo-Modul-Doku ergänzt:
  - `docs/modules/todo.md`
- Read-only-/Write-Regeln dokumentiert.

## CAN-34.1

- Todo-Modul analysiert.
- Ergebnis:
  - Backend `todo.js` besitzt MODULE_META, Status, Routenliste und Integration-Check.
  - Dashboard `todo.js` nutzt Status/Settings/Texts/Stats/Reload.
  - Dedizierte Doku `docs/modules/todo.md` fehlte.

## CAN-33.4

- Erfolgreiche Dashboard-Sichtprüfung von CAN-33.3 dokumentiert.
