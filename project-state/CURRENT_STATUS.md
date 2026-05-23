# CURRENT_STATUS

Aktueller Stand: STEP274W FIX4 vorbereitet. Birthday MediaPicker Import Route wird hart repariert, damit POST /api/birthday/admin/show/import-media im laufenden Backend registriert ist.

## STEP274Y - Birthday MediaPicker UX-Cleanup
Status: vorbereitet/anzuwenden. Der Birthday-MediaPicker ist jetzt klarer kategorisiert: intro, default-song, user-songs und party-songs.

## STEP274Z_MEDIA_PICKER_FILTER_DEFAULT_ALL

Der zentrale MediaPicker startet beim Öffnen wieder mit dem sichtbaren Filter `Alle Zusatzkategorien`.
Das Upload-Ziel bleibt weiterhin über `config.categoryKey` modul-/button-spezifisch gesetzt.

## STEP274Z_FIX1_REMOVE_FILTER_HINT

MediaPicker: Der sichtbare Zusatztext unter/bei `Zusatzkategorie` wurde entfernt. Funktional bleibt die Trennung von Filter und Upload-Ziel bestehen.

## STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT

Sound-System unterstützt jetzt direkte Media-Registry-Wiedergabe per `mediaId`. Ziel ist, künftige doppelte Birthday-/Sound-Dateien zu vermeiden. Bestehende Legacy-Pfade funktionieren weiterhin.

## STEP275B_BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY

Birthday nutzt nach MediaPicker-Import bevorzugt Media-Registry-Referenzen. Neue User-Songs/Standardsongs/Intro-Medien müssen dadurch nicht mehr doppelt nach `assets/sounds/birthday` kopiert werden.

## STEP275B_FIX1_MEDIA_UPLOAD_FIELD_ORDER

MediaPicker-Uploads setzen den Zielordner jetzt zuverlässig vor dem Datei-Stream. Neue Birthday-User-Songs sollen physisch unter `assets/media/birthday/user-songs` landen.
