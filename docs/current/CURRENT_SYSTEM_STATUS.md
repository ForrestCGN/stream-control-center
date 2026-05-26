# CURRENT_SYSTEM_STATUS

## Stream Status Core

Aktueller Stand: STEP467

- Modul: `stream_status`
- Runtime-Version: `0.1.1`
- Routen:
  - `GET /api/stream-status/status`
  - `GET /api/stream-status/current`
  - `GET/POST /api/stream-status/refresh`
  - `GET /api/stream-status/sessions`
- Primäre schnelle Quelle bleibt `htdocs/data/twitch_stream_raw.json`.
- Wenn die Datei fehlt oder stale ist, kann `/api/stream-status/status` bzw. `/refresh` aktiv den lokalen Twitch-Backend-Endpunkt abfragen.
- Standard-API-Quelle: `http://127.0.0.1:8080/api/twitch/stream?login={login}`
- Statusfelder enthalten Quelle, Stale-Zustand, Datei-Alter, API-Fehler, Streamsession und Streamtag.

## Clip-Shoutout / VSO

- `clip_shoutout.js` Runtime-Version bleibt `0.2.9`.
- Test-Command bleibt `!vso`.
- Display-Queue bleibt aktiv.
- Display-Cooldown bleibt 120 Sekunden nach Anzeige-Ende.
- Offizielle Twitch-Shoutouts nutzen weiterhin den zentralen Streamstatus als Live-Gate.
- Streamtag-Limit und Override `--force` bleiben unverändert.

## STEP468 - Stream Status Auto Refresh

- `backend/modules/stream_status.js` steht auf Runtime-Version `0.1.2`.
- Der zentrale Stream-Live-Status nutzt die lokale Twitch-API standardmäßig als Primärquelle.
- Legacy-Dateien `htdocs/data/twitch_stream_raw.json` und `htdocs/data/twitch_live_data.json` bleiben als Fallback erhalten.
- Auto-Refresh läuft standardmäßig alle 60 Sekunden, bei live/grace alle 30 Sekunden.
- Der Status wird im RAM und in SQLite gespeichert (`stream_status_state`, `stream_status_sessions`).
- Synchrone Konsumenten wie `clip_shoutout` bekommen den letzten zentralen Stand, ohne ihn durch stale Datei-Lesung zu überschreiben.
