# CURRENT_STATUS

## STEP467 aktiv

Zentraler Stream-Live-Status wurde erweitert:

- `backend/modules/stream_status.js` steht auf Runtime-Version `0.1.1`.
- Dateiquelle `htdocs/data/twitch_stream_raw.json` bleibt erhalten.
- Bei stale/fehlender Datei kann `/api/stream-status/status` und `/api/stream-status/refresh` den lokalen Twitch-Backend-Endpunkt abfragen.
- Standard-Fallback: `http://127.0.0.1:8080/api/twitch/stream?login={login}`.
- Der Status zeigt nun zusätzlich API-Quelle, API-Fehler, Datei-Alter und Stale-Zustand nachvollziehbar an.

Clip-Shoutout bleibt unverändert bei Runtime-Version `0.2.9` und nutzt weiterhin den zentralen Streamstatus für Live-Gate und Streamtag-Logik.
