# FILES

## STEP276B_ALERT_RULE_MEDIA_COLUMNS

- `backend/modules/alert_system.js` - optionale Media-Registry-Spalten für Alert-Regeln ergänzt.
- `docs/backend/ALERT_SYSTEM_MEDIA_RULE_COLUMNS_STEP276B.md` - technische Kurzdokumentation.
- `project-state/STEP276B_ALERT_RULE_MEDIA_COLUMNS.md` - Step-Dokumentation.

## STEP275B_FIX1_MEDIA_UPLOAD_FIELD_ORDER

- `htdocs/dashboard/components/media_picker.js` - Upload-Metadaten werden vor `file` in FormData gesetzt; Query-Fallback ergänzt.
- `docs/dashboard/MEDIA_PICKER_UPLOAD_FIELD_ORDER_STEP275B_FIX1.md` - technische Kurznotiz.

## STEP275B_BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY

- `backend/modules/birthday.js` - MediaPicker-Import speichert `mediaid:<id>`; Birthday-Bundles übergeben `mediaId` ans Sound-System.
- `docs/backend/BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY_STEP275B.md` - technische Kurzdokumentation.

## STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT

- `backend/modules/sound_system.js` - direkte Wiedergabe von Media-Registry-Assets per `mediaId`.
- `backend/modules/media.js` - `resolve` meldet Media-Registry-Assets als Sound-System-kompatibel via direkter mediaId-Wiedergabe.
- `docs/backend/SOUND_SYSTEM_MEDIAID_DIRECT_STEP275A.md` - Test-/Status-Dokumentation.

## STEP276B_FIX1_ALERT_RULE_MEDIA_COLUMNS_ENSURE

- `backend/modules/alert_system.js` - idempotentes Sicherstellen der Alert-Regel-MediaId-Spalten beim Modulstart.
- `docs/backend/ALERT_SYSTEM_MEDIA_RULE_COLUMNS_STEP276B_FIX1.md` - technische Kurznotiz.
- `project-state/STEP276B_FIX1_ALERT_RULE_MEDIA_COLUMNS_ENSURE.md` - STEP-Übergabe.
