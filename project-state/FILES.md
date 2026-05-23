# FILES

## STEP274W FIX4
- tools/apply_step274w_fix4_birthday_import_route_hard_repair.js
- backend/modules/birthday.js (Patchziel)
- tools/apply_step274w_birthday_mediapicker_import.js (wird zu Stub)
- docs/dashboard/BIRTHDAY_MEDIAPICKER_IMPORT_FIX4.md
- project-state/STEP274W_FIX4.md

## STEP274Y betroffene Dateien
- backend/modules/media.js
- htdocs/dashboard/modules/birthday.js
- htdocs/dashboard/modules/birthday.css
- docs/dashboard/BIRTHDAY_MEDIAPICKER_UX_CLEANUP.md
- project-state/STEP274Y.md
- tools/apply_step274y_birthday_mediapicker_ux_cleanup.js

## STEP274Z_MEDIA_PICKER_FILTER_DEFAULT_ALL

- `htdocs/dashboard/components/media_picker.js` - sichtbarer Zusatzkategorie-Filter startet auf Alle; Upload-Ziel bleibt separat.
- `docs/dashboard/MEDIA_PICKER_FILTER_DEFAULT_ALL.md` - Kurzdokumentation.

## STEP274Z_FIX1_REMOVE_FILTER_HINT

- `htdocs/dashboard/components/media_picker.js` - sichtbarer Hinweis `Filter, nicht Upload-Ziel` entfernt.

## STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT

- `backend/modules/sound_system.js` - direkte Wiedergabe von Media-Registry-Assets per `mediaId`.
- `backend/modules/media.js` - `resolve` meldet Media-Registry-Assets als Sound-System-kompatibel via direkter mediaId-Wiedergabe.
- `docs/backend/SOUND_SYSTEM_MEDIAID_DIRECT_STEP275A.md` - Test-/Status-Dokumentation.

## STEP275B_BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY

- `backend/modules/birthday.js` - MediaPicker-Import speichert `mediaid:<id>`; Birthday-Bundles übergeben `mediaId` ans Sound-System.
- `docs/backend/BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY_STEP275B.md` - technische Kurzdokumentation.
