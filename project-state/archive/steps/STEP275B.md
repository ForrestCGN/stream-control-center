# STEP275B - Birthday MediaId No Duplicate Copy

## Inhalt

- Birthday MediaPicker-Import erzeugt keine neue Kopie mehr unter `assets/sounds/birthday`.
- Stattdessen wird `mediaid:<id>` gespeichert.
- Beim Playback gibt Birthday `mediaId` direkt ans Sound-System weiter.
- Legacy-Dateien bleiben kompatibel.
- Alter Direktupload bleibt als Fallback erhalten.

## Test

1. Backend neu starten.
2. Browser mit Strg+F5 neu laden.
3. Birthday → Show/Medien.
4. User-Song auswählen → MediaPicker → bestehendes oder neues Medium übernehmen.
5. Prüfen: In `assets/sounds/birthday` soll keine neue `birthday_song_...` Kopie entstehen.
6. Geburtstagsshow starten.
7. `/api/sound/status` sollte beim Song `file=media/...` und `audioUrl=/assets/media/...` zeigen.
