# CHANGELOG

## STEP274J – Command-Praxischeck für Media-Playback-Hub

- `commands_media` auf STEP274J gesetzt.
- Neue Route `GET /api/commands/media-command-check?trigger=<trigger>` ergänzt.
- Prüft gespeicherte Dashboard-Commands gegen offiziellen Media-Playback-Hub `/api/sound/play-media?mediaId=<id>`.
- Dashboard-Hinweise für Route und Praxischeck ergänzt.
- Sound-Media-Bridge Status auf STEP274J aktualisiert.

## STEP274I

- Sound-System als offizieller Media-Playback-Hub festgezogen.
- `/api/video/*` als deprecated Testpfad markiert.
