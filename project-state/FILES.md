# FILES

## In STEP276 relevante Code-Dateien

- `backend/modules/alert_system.js`
  - DB-Spalten `sound_media_id` / `image_media_id`
  - Media-Registry-Anreicherung für Rule-Ausgaben
  - Sound-Playback mit `mediaId`
  - Main-Sound + TTS Bundle-Fix
  - Bild-/Grafik-Payload mit Media-Registry-Fallback-Logik

- `htdocs/dashboard/modules/alerts.js`
  - MediaPicker für Alert-Sounds
  - MediaPicker für Regel-Grafik/Bild
  - MediaPicker für Design-Grafik über dem Alert
  - Legacy-/Fallback-Anzeigen im Regel- und Design-Editor
  - Daueranzeige mit Media-Registry-Werten

## Bestehende Dateien, die bewusst erhalten bleiben

- `htdocs/overlays/_overlay-alerts-v2.html`
  - Keine grundlegende Overlay-Neustruktur im STEP276-Block.
  - Bestehende Felder/URLs werden weiter genutzt.

- `htdocs/dashboard/components/media_picker.js`
  - Zentraler MediaPicker wurde wiederverwendet.
  - Kein neuer Parallel-Picker erstellt.

## Neue/aktualisierte Dokumentation in diesem ZIP

- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `docs/backend/ALERT_SYSTEM_MEDIAID_STEP276_SUMMARY.md`
- `docs/dashboard/ALERT_DASHBOARD_MEDIAID_STEP276_SUMMARY.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/STEP276I_ALERT_MEDIAID_DOCS_SYNC.md`
- `NEXT_CHAT_START_STEP276_ALERT_MEDIAID_DONE.md`

## Nicht enthalten

Dieses ZIP enthält bewusst keine Code-Dateien, damit nur Doku/Status aktualisiert wird.
