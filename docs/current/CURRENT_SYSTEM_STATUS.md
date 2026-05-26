# CURRENT_SYSTEM_STATUS

## Aktueller Stand nach STEP471

STEP471 ist ein Doku-/Regel- und Prompt-Update. Es ändert keine Runtime-Logik.

## Stream Status Core

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
- Status wird im RAM und in SQLite gespeichert (`stream_status_state`, `stream_status_sessions`).

## Clip-Shoutout / VSO

- Modul: `clip_shoutout`
- Runtime-Version: `0.2.10`
- Test-Command bleibt `!vso`.
- Display-Queue bleibt aktiv.
- Display-Cooldown bleibt 120 Sekunden nach Anzeige-Ende.
- Offizielle Twitch-Shoutouts nutzen den zentralen `stream_status` als Live-Gate.
- Streamtag-Limit und Override `--force` bleiben unverändert.
- Statistik-Routen sind vorhanden:
  - `GET /api/clip-shoutout/stats`
  - `GET /api/clip-shoutout/stats/user`

## Shoutout Dashboard

- Dashboard-Modul: `Community -> Shoutout-System`
- Enthält aktuell Status, Queues, Live-Gate, Timeline und Statistik.
- UX-Folgepunkt: Modul in Tabs/Unterbereiche aufteilen, damit nicht alles auf einer Seite steht.

## Dokumentations-/Arbeitsregeln

Neue zentrale Regeldoku:

- `docs/current/PROJECT_WORKING_RULES.md`
- `project-state/GENERAL_PROJECT_PROMPT.md`

Wichtige Ergänzung aus STEP471:

- Shell-/PowerShell-Ausgaben sollen kurz und kopierfreundlich sein.
- Bei Statusprüfungen gezielte Feldauswahl bevorzugen.
- Große `ConvertTo-Json -Depth 10` Dumps nur anfordern, wenn Detailanalyse nötig ist.
- Wenn keine JavaScript-Dateien geändert wurden, nach ZIP klar sagen: kein `node --check` nötig.
