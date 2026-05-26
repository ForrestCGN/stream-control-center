# STEP274Y - Birthday MediaPicker UX-Cleanup

## Ziel

Birthday-MediaPicker verständlicher und sauber kategorisiert anzeigen.

## Betroffene Dateien

- `backend/modules/media.js`
- `htdocs/dashboard/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.css`
- `docs/dashboard/BIRTHDAY_MEDIAPICKER_UX_CLEANUP.md`
- `project-state/STEP274Y.md`
- `tools/apply_step274y_birthday_mediapicker_ux_cleanup.js`

## Ergebnis

- Neue Birthday-Uploads über Show/Medien landen direkt in passenden Media-Registry-Kategorien.
- User-Song- und Party-Song-Felder nutzen nicht mehr allgemein `birthday/general`.
- Erfolgsmeldungen sind nachvollziehbarer.

## Test

1. Backend neu starten.
2. Dashboard hart neu laden.
3. Birthday-System → Show/Medien.
4. User-Song über MediaPicker hochladen.
5. Medienverwaltung: Modul `birthday`, Kategorie `user-songs` prüfen.
6. Partys → Party-Song MediaField prüfen: Kategorie `party-songs`.
