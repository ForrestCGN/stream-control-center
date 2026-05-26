# CURRENT_SYSTEM_STATUS

## STEP466_STREAM_LIVE_STATUS_CORE

Aktueller Stand: STEP466

- Neues zentrales Modul: `backend/modules/stream_status.js`
- Stream-Status Runtime-Version: `0.1.0`
- Clip-Shoutout Runtime-Version: `0.2.9`
- Test-Command bleibt: `!vso`
- Display-Queue bleibt aktiv
- Display-Cooldown bleibt 120 Sekunden nach Anzeige-Ende
- Official-Shoutout-Live-Gate nutzt bevorzugt den zentralen Stream-Status
- Streamtag-/Session-IDs werden zentral über `stream_status` bereitgestellt
- Fallback auf vorhandene Live-Dateien bleibt erhalten

Neue zentrale Routen:

```text
GET  /api/stream-status/status
GET  /api/stream-status/current
GET/POST /api/stream-status/refresh
GET  /api/stream-status/sessions
```

Der zentrale Stream-Status liest zunächst die vorhandenen Twitch-Dateien, bewertet deren Frische und hält Streamsession-/Streamtag-Daten mit Restart-Grace vor.
