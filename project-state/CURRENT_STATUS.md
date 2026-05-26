# CURRENT_STATUS

## STEP466 aktiv

Zentraler Stream-Live-Status wurde ergänzt.

- Neues Modul: `stream_status`
- Runtime-Version: `0.1.0`
- Routen: `/api/stream-status/*`
- Quelle: vorhandene Twitch-Dateien unter `htdocs/data/`
- Frischeprüfung: `stale`, `fileAgeSeconds`, `fileModifiedAt`
- Sessionlogik: `streamSessionId`, `streamDayId`, `restartGraceUntil`
- Clip-Shoutout nutzt den zentralen Status bevorzugt für Live-Gate und Streamtag-Limit.
- Clip-Shoutout Runtime-Version: `0.2.9`
- Testcommand bleibt `!vso`.

## Nächster Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-status/status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/queue" | ConvertTo-Json -Depth 10
```
