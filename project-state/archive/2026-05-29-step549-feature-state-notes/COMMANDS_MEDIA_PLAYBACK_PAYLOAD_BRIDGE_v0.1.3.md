# Commands Media Playback Payload Bridge v0.1.3

## Ziel

Ein gespeicherter Command wie `!test` mit Action-Typ `video_play` soll nicht nur eine Media-ID speichern, sondern diese beim Execute auch wirklich an das Sound-System übergeben.

## Änderung

- `buildTargetPayload()` ergänzt Media-Felder aus `command.config`.
- `executeCommand()` schreibt Legacy `/api/sound/play-media` auf `/api/sound/play` um.
- `media-command-check` zeigt effektives Routing und Payload-Vorschau.

## Keine Änderung

- Keine DB-Migration.
- Keine Command-Logik entfernt.
- Keine Kanalpunkte-Änderung.
- Kein neues Upload-System.
