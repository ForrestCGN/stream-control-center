# CURRENT_STATUS

## STEP467 aktiv

Zentraler Stream-Live-Status wurde erweitert:

- `backend/modules/stream_status.js` steht auf Runtime-Version `0.1.1`.
- Dateiquelle `htdocs/data/twitch_stream_raw.json` bleibt erhalten.
- Bei stale/fehlender Datei kann `/api/stream-status/status` und `/api/stream-status/refresh` den lokalen Twitch-Backend-Endpunkt abfragen.
- Standard-Fallback: `http://127.0.0.1:8080/api/twitch/stream?login={login}`.
- Der Status zeigt nun zusätzlich API-Quelle, API-Fehler, Datei-Alter und Stale-Zustand nachvollziehbar an.

Clip-Shoutout bleibt unverändert bei Runtime-Version `0.2.9` und nutzt weiterhin den zentralen Streamstatus für Live-Gate und Streamtag-Logik.

## STEP468 - Stream Status Auto Refresh

- `backend/modules/stream_status.js` steht auf Runtime-Version `0.1.2`.
- Der zentrale Stream-Live-Status nutzt die lokale Twitch-API standardmäßig als Primärquelle.
- Legacy-Dateien `htdocs/data/twitch_stream_raw.json` und `htdocs/data/twitch_live_data.json` bleiben als Fallback erhalten.
- Auto-Refresh läuft standardmäßig alle 60 Sekunden, bei live/grace alle 30 Sekunden.
- Der Status wird im RAM und in SQLite gespeichert (`stream_status_state`, `stream_status_sessions`).
- Synchrone Konsumenten wie `clip_shoutout` bekommen den letzten zentralen Stand, ohne ihn durch stale Datei-Lesung zu überschreiben.
