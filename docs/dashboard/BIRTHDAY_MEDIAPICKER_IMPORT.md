# STEP274W – Birthday MediaPicker Import

Ziel: Im Birthday-Modul sollen Uploads nicht mehr primär über lokale Datei-Felder laufen, sondern über den zentralen MediaPicker / die Media-Registry.

## Ablauf

1. Dashboard öffnet `MediaPicker.open(...)` mit `moduleKey: birthday`.
2. User wählt ein vorhandenes Medium oder lädt eins hoch.
3. Dashboard sendet `kind + mediaId` an `/api/birthday/admin/show/import-media`.
4. Backend kopiert das Media-Registry-Asset in den bestehenden Birthday-Sound-System-Pfad `assets/sounds/birthday/...`.
5. Backend aktualisiert die vorhandenen Birthday-Referenzen:
   - `intro_video` → `show.defaultVideoFile`
   - `default_song` → `show.defaultSongFile`
   - `user_song` → Birthday-Show-Profil/User-Song

## Warum Kopie?

Das aktuelle Birthday-Show-System spielt Medien noch über das Sound-System mit relativen Pfaden unter `assets/sounds`. Die Media-Registry speichert neue Uploads unter `assets/media/<module>/<category>`. Damit bestehende Playback-Logik stabil bleibt, kopiert STEP274W das gewählte Registry-Medium in den bisherigen Birthday-Soundordner und aktualisiert danach die bestehende Referenz.

## Legacy

Die alten Direktupload-Felder bleiben eingeklappt als Fallback erhalten.
