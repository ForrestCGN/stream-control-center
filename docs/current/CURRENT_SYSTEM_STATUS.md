# CURRENT_SYSTEM_STATUS

## Stream Status Core

Aktueller Stand: STEP468

- Modul: `stream_status`
- Runtime-Version: `0.1.2`
- Routen:
  - `GET /api/stream-status/status`
  - `GET /api/stream-status/current`
  - `GET/POST /api/stream-status/refresh`
  - `GET /api/stream-status/sessions`
- Twitch-API ist Primärquelle.
- Legacy-Dateien `htdocs/data/twitch_stream_raw.json` und `htdocs/data/twitch_live_data.json` bleiben Fallback.
- Auto-Refresh läuft standardmäßig alle 60 Sekunden, bei live/grace alle 30 Sekunden.
- Status wird im RAM und in SQLite gespeichert.

## Clip-Shoutout / VSO

Aktueller Stand: STEP470

- Modul: `clip_shoutout`
- Runtime-Version: `0.2.10`
- Test-Command bleibt `!vso`.
- Display-Queue bleibt aktiv.
- Display-Cooldown bleibt 120 Sekunden nach Anzeige-Ende.
- Offizielle Twitch-Shoutouts nutzen den zentralen Streamstatus als Live-Gate.
- Streamtag-Limit und Override `--force` bleiben unverändert.
- Chatmeldungen bleiben unverändert.

### Dashboard

Das Dashboard-Modul `Community -> Shoutout-System` enthält jetzt:

- Statusübersicht
- Testauslösung
- Official Live-Gate
- Display-Queue
- Official-Queue
- Timeline
- Statistikbereich

### Statistik-Routen

- `GET /api/clip-shoutout/stats`
- `GET /api/clip-shoutout/stats/user`

Statistikdaten sind read-only und basieren auf vorhandenen Queue-/History-Tabellen.
