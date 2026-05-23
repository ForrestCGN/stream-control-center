# STEP274X – Birthday MediaPicker Kategorien

Ziel: Die Birthday-MediaPicker-Buttons übergeben nicht mehr pauschal `birthday/general`, sondern eine passende Media-Registry-Kategorie.

## Kategorien

- Intro-Video: `moduleKey=birthday`, `categoryKey=intro`
- Standardsong: `moduleKey=birthday`, `categoryKey=default-song`
- User-Song: `moduleKey=birthday`, `categoryKey=user-songs`

Neue Uploads aus dem MediaPicker landen dadurch unter:

- `htdocs/assets/media/birthday/intro/`
- `htdocs/assets/media/birthday/default-song/`
- `htdocs/assets/media/birthday/user-songs/`

Die eigentliche Birthday-Playback-Übernahme bleibt unverändert: Nach Auswahl/Upload kopiert das Birthday-Backend das gewählte Registry-Medium kontrolliert ins Sound-System-Verzeichnis und aktualisiert die bestehende Birthday-Referenz.

## Geänderte Dateien

- `backend/modules/media.js`
  - ergänzt feste Birthday-Kategorien für Intro, Standardsong und User-Songs.
- `htdocs/dashboard/components/media_picker.js`
  - übernimmt `config.categoryKey` auch als initialen Kategorie-Filter.
- `htdocs/dashboard/modules/birthday.js`
  - übergibt pro Button die passende Kategorie an den MediaPicker.
  - gibt Kategorie-Metadaten an den Import-Endpunkt mit.

## Test

1. Backend neu starten, damit neue Media-Kategorien sicher registriert werden.
2. Browser hart neu laden (`Strg+F5`).
3. Birthday-System → Show/Medien.
4. Intro-Video auswählen → Upload sollte Kategorie `intro` nutzen.
5. Standardsong auswählen → Upload sollte Kategorie `default-song` nutzen.
6. User-Song auswählen → Upload sollte Kategorie `user-songs` nutzen.
7. Medienverwaltung prüfen: Modul `birthday`, Kategorie entsprechend filtern.
