# CHANGELOG

## STEP466_STREAM_LIVE_STATUS_CORE

- Neues Backend-Modul `backend/modules/stream_status.js` ergänzt.
- Zentrale Streamstatus-Routen unter `/api/stream-status/*` ergänzt.
- Streamstatus wertet bestehende Twitch-Dateien aus und markiert alte Quellen mit `stale`.
- Streamstatus speichert zentrale Session-/Streamtag-Daten in SQLite-Tabellen `stream_status_state` und `stream_status_sessions`.
- `backend/modules/clip_shoutout.js` auf Runtime-Version `0.2.9` erhöht.
- Clip-Shoutout nutzt den zentralen Streamstatus bevorzugt für Official-Live-Gate und Streamtag-Ermittlung.
- Alte dateibasierte Live-Status-Logik bleibt als Fallback erhalten.
- Keine Änderung an `!vso`, Display-Queue, Sound-System, Dashboard oder Chatmeldungen.
