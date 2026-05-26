# STEP274L-FIX2 - Commands Media Upsert Guard

## Ziel

Commands mit `sound_play` oder `video_play` sollen beim Speichern immer korrekt auf den offiziellen Sound-System-Hub geroutet werden.

## Problem

STEP274L/FIX1 setzte Router-Felder über die Dashboard-UI. Das ist zu fragil, weil die eigentliche `commands.js`-Speicherlogik gekapselt ist und ein gespeicherter Command kaputt bleiben kann, wenn die UI-Injection nicht rechtzeitig oder nicht vollständig greift.

## Änderung

- `htdocs/dashboard/modules/commands_media.js`
  - installiert einen Guard vor `fetch('/api/commands/upsert')`
  - erkennt `config.actionType = sound_play` oder `video_play`
  - liest `config.mediaId`
  - setzt vor dem Speichern zuverlässig:
    - `moduleKey = sound_media_bridge`
    - `actionKey = play_audio_media` oder `play_video_media`
    - `targetMethod = POST`
    - `targetUrl = /api/sound/play-media?mediaId=<id>`
    - `responseMode = module`

## Nicht geändert

- Keine Backend-Dateien
- Keine SQLite-Datei
- Keine Medien-Dateien
- Keine Sound-System-Queue-Logik

## Nacharbeit

Bereits kaputt gespeicherte Media-Commands müssen im Dashboard einmal geöffnet und erneut gespeichert werden, damit der Guard die Route korrigiert.
