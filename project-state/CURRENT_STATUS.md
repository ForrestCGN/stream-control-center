# CURRENT_STATUS

Aktueller Stand: STEP276B vorbereitet. Alert-Regeln können optional Media-Registry-IDs speichern, ohne bestehende Alert-Assets oder Legacy-Pfade zu entfernen.

## STEP276B_ALERT_RULE_MEDIA_COLUMNS

Alert-System Backend-Fundament für Media-Registry:

- Schema-Version `alert_system` auf 6.
- Neue optionale Spalten:
  - `alert_rules.sound_media_id`
  - `alert_rules.image_media_id`
- `saveRule()` speichert `sound_media_id` / `soundMediaId` und `image_media_id` / `imageMediaId`.
- Bestehende Felder `sound_asset_id` und `image_asset_id` bleiben unverändert.

## STEP275B_FIX1_MEDIA_UPLOAD_FIELD_ORDER

MediaPicker-Uploads setzen den Zielordner zuverlässig vor dem Datei-Stream. Neue Birthday-User-Songs sollen physisch unter `assets/media/birthday/user-songs` landen.

## STEP275B_BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY

Birthday nutzt nach MediaPicker-Import bevorzugt Media-Registry-Referenzen. Neue User-Songs/Standardsongs/Intro-Medien müssen dadurch nicht mehr doppelt nach `assets/sounds/birthday` kopiert werden.

## STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT

Sound-System unterstützt jetzt direkte Media-Registry-Wiedergabe per `mediaId`. Ziel ist, künftige doppelte Birthday-/Sound-Dateien zu vermeiden. Bestehende Legacy-Pfade funktionieren weiterhin.
