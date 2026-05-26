# STEP467_STREAM_STATUS_REFRESH_SOURCE

## Ziel

Der zentrale Streamstatus soll bei veralteter lokaler Datei aktiv eine frische Twitch-Statusquelle abfragen können.

## Betroffene Dateien

```text
backend/modules/stream_status.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
```

## Umsetzung

- `stream_status` wurde auf Runtime-Version `0.1.1` erhöht.
- Frische Dateiquellen bleiben bevorzugt.
- Wenn Dateiquellen stale oder nicht bekannt sind, fragt `/status` und `/refresh` den lokalen Twitch-Backend-Endpunkt ab.
- Standard-URL: `http://127.0.0.1:8080/api/twitch/stream?login={login}`.
- Die URL kann per `STREAM_STATUS_TWITCH_API_URL` überschrieben werden.
- Der API-Fallback kann per `STREAM_STATUS_TWITCH_API_ENABLED=false` deaktiviert werden.
- Timeout steuerbar per `STREAM_STATUS_TWITCH_API_TIMEOUT_MS`.

## Bewusst nicht geändert

- Keine Änderung an `clip_shoutout.js`.
- Keine Änderung am Testcommand `!vso`.
- Keine Änderung an Display-Queue, Streamtag-Limit oder Chatmeldungen.
- Keine Dashboard-Änderung.
- Keine Sound-System-Änderung.

## Tests

```bat
node --check backend\modules\stream_status.js
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-status/status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-status/refresh?forceApi=1" | ConvertTo-Json -Depth 10
```
