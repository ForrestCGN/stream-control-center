# CHANGELOG

## CAN-35.3

- Tagebuch-Dashboard Read-only-Diagnosekarte vorbereitet.
- Neue Dateien:
  - `htdocs/dashboard/modules/tagebuch_readonly_diagnostics.js`
  - `htdocs/dashboard/modules/tagebuch_readonly_diagnostics.css`
- Geändert:
  - `htdocs/dashboard/index.html` lädt CSS/JS nach dem bestehenden Tagebuch-Modul.
- Nicht geändert:
  - `htdocs/dashboard/modules/tagebuch.js`
  - `backend/modules/tagebuch.js`
- Die Karte nutzt nur:
  - `GET /api/tagebuch/status`
  - `GET /api/tagebuch/routes`
  - `GET /api/tagebuch/integration-check`
- Gesperrt/nicht genutzt:
  - Streamstart-/Streamende-Routen
  - Entry-Routen
  - Reset-Routen
  - Reload-Routen
  - Admin-POST-Routen
  - Legacy-Discord-Write-Routen
- Kein MutationObserver, kein Dauer-Rendering.
- Diagnose ist eigener Tab und in mehrere Abschnitte/Karten gegliedert.
- Keine produktiven Aktionen, keine Tagebuch-Einträge, keine Settings-/Textspeicherung, keine DB-Migration.

## CAN-35.2

- Tagebuch-Modul-Doku ergänzt:
  - `docs/modules/tagebuch.md`
- Read-only-/Write-Regeln dokumentiert.

## CAN-35.1

- Tagebuch-Modul analysiert.
