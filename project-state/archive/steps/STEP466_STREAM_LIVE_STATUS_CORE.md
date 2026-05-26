# STEP466_STREAM_LIVE_STATUS_CORE

## Ziel

Ein zentraler Stream-Live-Status soll systemübergreifend bereitstehen, damit Module nicht jeweils eigene, potenziell widersprüchliche Live-Status-Logik verwenden.

## Betroffene Dateien

```text
backend/modules/stream_status.js
backend/modules/clip_shoutout.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
```

## Umsetzung

- Neues Modul `stream_status` mit Routen `/api/stream-status/*`.
- Auswertung vorhandener Twitch-Status-Dateien:
  - `htdocs/data/twitch_stream_raw.json`
  - `htdocs/data/twitch_live_data.json`
- Statusfelder:
  - `live`
  - `statusKnown`
  - `stale`
  - `fileModifiedAt`
  - `fileAgeSeconds`
  - `streamSessionId`
  - `streamDayId`
  - `restartGraceUntil`
- SQLite-Tabellen:
  - `stream_status_state`
  - `stream_status_sessions`
- Clip-Shoutout `0.2.9` nutzt den zentralen Streamstatus bevorzugt.

## Bewusst nicht geändert

- `!vso` bleibt Testcommand.
- Keine Umstellung auf `!so`.
- Keine Dashboard-Seite.
- Keine Änderung am Sound-System.
- Keine Änderung an Display-Queue oder Chatmeldungen.
- Bestehende dateibasierte Live-Status-Logik bleibt Fallback.

## Tests

```bat
node --check backend\modules\stream_status.js
node --check backend\modules\clip_shoutout.js
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-status/status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/queue" | ConvertTo-Json -Depth 10
```
