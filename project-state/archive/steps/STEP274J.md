# STEP274J – Command-Praxischeck für Media-Playback-Hub

## Ziel

STEP274J rundet den praktischen Dashboard-/Command-Test ab. Die Architektur bleibt unverändert:

- Medienverwaltung ist Registry für Dateien, IDs, Metadaten, Vorschau und Resolver.
- Sound-System ist offizieller zentraler Playback-Hub für Audio, Video und Animation.
- Commands speichern Media-IDs und routen auf `/api/sound/play-media?mediaId=<id>`.

## Geändert

- `backend/modules/commands_media.js`
  - Step auf `STEP274J`.
  - Neue Diagnose-Route: `GET /api/commands/media-command-check?trigger=<trigger>`.
  - Prüft gespeicherte Command-Definitionen gegen:
    - `moduleKey = sound_media_bridge`
    - `targetMethod = POST`
    - `targetUrl = /api/sound/play-media?mediaId=<id>`
    - `actionType = sound_play` oder `video_play`
    - Media-ID vorhanden und per Media-Resolver auflösbar
    - Datei existiert

- `backend/modules/sound_media_bridge.js`
  - Step auf `STEP274J`.
  - Status beschreibt weiterhin `/api/sound/play-media` als offiziellen Playback-Hub.

- `htdocs/dashboard/modules/commands_media.js`
  - Dashboard-Hinweise auf STEP274J aktualisiert.
  - Nach Medienauswahl wird die gesetzte Route angezeigt.
  - Zusätzlich wird der passende Praxis-Check `/api/commands/media-command-check?trigger=<trigger>` als Hinweis angezeigt.

- `htdocs/dashboard/modules/commands_media.css`
  - Kleine UX-Stile für Route-/Check-Hinweise.

## Nicht geändert

- Keine bestehende Command-Ausführung entfernt.
- Kein Umbau am Sound-System-Core.
- Keine Medien verschoben oder gelöscht.
- `video_media_bridge.js` bleibt deprecated/test-only.

## Tests

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/sound/media-bridge/status
Invoke-RestMethod http://127.0.0.1:8080/api/commands/media-bridge/status
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/media-options?type=audio&status=active"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/media-options?type=video,animation&status=active"
```

Nach Anlegen/Speichern eines Dashboard-Commands, z. B. `!skate`:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/media-command-check?trigger=skate"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/test?message=!skate&user=forrestcgn&role=mod"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/execute?message=!skate&user=forrestcgn&role=mod"
```

## Ergebnis

STEP274J ist ein Praxis-/Sicherheitscheck für den neuen Media-Command-Weg. Er macht sichtbar, ob Dashboard-Speicherung und Command-Ausführung korrekt auf den offiziellen Sound-System-Media-Hub zeigen.
