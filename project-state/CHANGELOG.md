# CHANGELOG

## CAN-34.4

- Erfolgreiche Sicht- und Stabilitätsprüfung von CAN-34.3c dokumentiert.
- Bestätigt sichtbar:
  - `Todo Read-only Diagnose`
  - `READ-ONLY OK`
  - `v2`
  - `schema 1`
  - Status OK: ja
  - Schema OK: ja
  - Integration OK: ja
  - Targets: 4
  - Channels: 4/4
  - Fehlende Channels: 0
  - User-Stats: 10
  - Daily-Stats: 24
  - Settings: 5
  - Textvarianten: 13
  - Legacy-Texte: 13
  - DB: ok / sqlite
- Bestätigte Read-only Routen:
  - `GET /api/todo/status`
  - `GET /api/todo/config`
  - `GET /api/todo/settings`
  - `GET /api/todo/routes`
  - `GET /api/todo/integration-check`
  - `GET /api/todo/stats`
  - `GET /api/todo/stats/top`
  - `GET /api/todo/stats/today`
  - `GET /api/todo/admin/settings`
  - `GET /api/todo/admin/texts`
  - `GET /discord/todo/status`
- Bestätigte produktiv gesperrte Routen:
  - `GET/POST /api/todo/add`
  - `GET/POST /discord/todo`
  - `GET/POST /api/todo/reload`
  - `POST /api/todo/admin/settings`
  - `POST /api/todo/admin/texts`
- Bestätigt:
  - Stabilitätsfix ohne MutationObserver aktiv.
  - Keine Add-/Reload-/Admin-POST-Buttons in der Diagnosekarte.
  - Keine Todo-Einträge.
  - Kein Reload.
  - Keine Settings-/Textvarianten-Änderung.
  - Keine Discord-Nachricht.
  - Keine Statistik-Erhöhung.
  - Keine DB-Migration.
- Keine Codeänderung in CAN-34.4.

## CAN-34.3c

- Stabilitäts-Hotfix für Todo Diagnose-Tab umgesetzt.
- MutationObserver entfernt.
- Tab-Handling auf kontrollierte Click-/Show-Events reduziert.

## CAN-34.3b

- UX-Fix: Todo Read-only Diagnose in eigenen Diagnose-Tab verschoben.

## CAN-34.3

- Todo-Dashboard Read-only-Diagnosekarte umgesetzt.

## CAN-34.2

- Todo-Modul-Doku ergänzt:
  - `docs/modules/todo.md`
- Read-only-/Write-Regeln dokumentiert.
