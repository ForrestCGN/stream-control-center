# CHANGELOG

## CAN-41.4

- Birthday Read-only Diagnosekarte ergänzt:
  - `htdocs/dashboard/modules/birthday_readonly_diagnostics.js`
  - `htdocs/dashboard/modules/birthday_readonly_diagnostics.css`
- `htdocs/dashboard/index.html` lädt die neue Diagnose-CSS-/JS-Datei.
- Die Diagnose liest nur:
  - `GET /api/birthday/status`
  - `GET /api/birthday/today`
  - `GET /api/birthday/show/state`
- Nicht genutzt:
  - `GET /api/birthday/show/queue`, weil die Route intern stale Queue-Cleanup machen kann.
- Keine Backend-Änderung.
- Keine Änderung an `birthday.js`.
- Keine API-POSTs.
- Keine produktive Aktion.

## CAN-41.3b

- Birthday-Safety-Hinweis/Badge-Extension aus Dashboard-Index entfernt.
