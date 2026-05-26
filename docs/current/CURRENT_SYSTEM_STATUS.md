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
- Die lokale Twitch-API ist Primärquelle für den zentralen Live-Status.
- Legacy-Dateien `htdocs/data/twitch_stream_raw.json` und `htdocs/data/twitch_live_data.json` bleiben als Fallback erhalten.
- Auto-Refresh läuft standardmäßig alle 60 Sekunden, bei live/grace alle 30 Sekunden.
- Statusfelder enthalten Quelle, Stale-Zustand, Datei-Alter, API-Fehler, Streamsession und Streamtag.
- Der Status wird im RAM und in SQLite gespeichert (`stream_status_state`, `stream_status_sessions`).

## Clip-Shoutout / VSO

- `clip_shoutout.js` Runtime-Version bleibt `0.2.9`.
- Test-Command bleibt `!vso`.
- Display-Queue bleibt aktiv.
- Display-Cooldown bleibt 120 Sekunden nach Anzeige-Ende.
- Offizielle Twitch-Shoutouts nutzen den zentralen Streamstatus als Live-Gate.
- Streamtag-Limit und Override `--force` bleiben unverändert.

## STEP469 - Shoutout Dashboard Module

- Neues Dashboard-Modul `shoutout` ergänzt.
- Neue Dateien:
  - `htdocs/dashboard/modules/shoutout.js`
  - `htdocs/dashboard/modules/shoutout.css`
- `htdocs/dashboard/index.html` lädt das Modul und stellt den Bereich `#shoutoutModule` bereit.
- Das Modul registriert sich dynamisch in `window.CGN.modules`, `moduleCatalog`, `sections.community.items` und `favorites`.
- Angezeigt werden:
  - Systemstatus und Runtime-Version
  - Command/Aliases
  - Display-Queue
  - Official-Queue
  - Official Live-Gate inkl. zentralem Streamstatus
  - Timeline der letzten Shoutouts
  - kleiner Test-Auslöser für Zielkanal mit optionalem `--force`
- Backend-Logik, `clip_shoutout.js`, `stream_status.js`, `!vso`, Queues und Chatmeldungen bleiben unverändert.
