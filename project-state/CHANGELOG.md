# CHANGELOG

## CAN-36.3b

- Korrektur zu CAN-36.3:
  - Der zusätzliche sichtbare Message-Rotator-Tab `Read-only` wird entfernt.
  - Grund: Das Modul besitzt bereits einen sichtbaren Tab `Diagnose`.
- `htdocs/dashboard/index.html` lädt die extra Read-only-CSS/JS nicht mehr.
- `message_rotator_readonly_diagnostics.js` wird inert überschrieben, falls alte Caches/alte index.html sie noch laden.
- `message_rotator_readonly_diagnostics.css` wird leer überschrieben.
- Keine Backend-Änderung.
- Keine Änderung an `htdocs/dashboard/modules/message_rotator.js`.
- Keine produktive Aktion.

## CAN-36.3

- Message-Rotator-Dashboard Read-only-Diagnosekarte vorbereitet.
- Nach Sichtprüfung/UX-Hinweis verworfen, weil bereits Diagnose-Tab vorhanden ist.

## CAN-36.2

- Message-Rotator-Modul-Doku ergänzt:
  - `docs/modules/message_rotator.md`
