# STEP274W – Birthday MediaPicker Import

Status: vorbereitet

## Änderungen

- Backend-Route ergänzt: `POST /api/birthday/admin/show/import-media`
- Dashboard Show/Medien nutzt MediaPicker für Intro-Video, Standardsong und User-Song
- Gewähltes Media-Asset wird ins Birthday-Sound-System übernommen
- Legacy-Direktupload bleibt als eingeklappter Fallback erhalten

## Dateien

- `tools/apply_step274w_birthday_mediapicker_import.js`
- `docs/dashboard/BIRTHDAY_MEDIAPICKER_IMPORT.md`
- nach Patch: `backend/modules/birthday.js`
- nach Patch: `htdocs/dashboard/modules/birthday.js`
- nach Patch: `htdocs/dashboard/modules/birthday.css`

## Test

1. Birthday-System → Show/Medien öffnen
2. Intro-Video auswählen / hochladen öffnen
3. MP3 darf dort nicht erscheinen/gewählt werden, nur Video im Picker-Kontext
4. Standardsong auswählen / hochladen mit MP3 testen
5. User-Song mit Login testen
6. Birthday-Medienstatus prüfen
