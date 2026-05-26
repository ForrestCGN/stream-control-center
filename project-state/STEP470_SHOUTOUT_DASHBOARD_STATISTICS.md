# STEP470_SHOUTOUT_DASHBOARD_STATISTICS

## Ziel

Das bestehende Shoutout-Dashboard wurde um einen read-only Statistikbereich erweitert.

## Geänderte Dateien

- `backend/modules/clip_shoutout.js`
- `htdocs/dashboard/modules/shoutout.js`
- `htdocs/dashboard/modules/shoutout.css`
- `htdocs/dashboard/index.html`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Backend

`clip_shoutout.js` steht auf Runtime-Version `0.2.10`.

Neue read-only Routen:

- `GET /api/clip-shoutout/stats`
- `GET /api/clip-shoutout/stats/user`

Die Statistik nutzt vorhandene Tabellen:

- `clip_shoutout_display_queue`
- `clip_shoutout_official_queue`
- `clip_shoutout_official_history`
- `clip_shoutout_stream_days`

Es werden keine Tabellen ersetzt und keine vorhandenen Daten verändert.

## Dashboard

Im Modul `Community -> Shoutout-System` gibt es jetzt einen Statistikbereich mit:

- Gesamtzahlen
- Zielkanal-Statistik
- Auslöser-Statistik
- Wer-zu-Wen-Statistik
- Dropdown für einzelne Zielkanäle
- Dropdown für einzelne Auslöser
- Detailansicht mit Timeline-Auszug

## Bewusst nicht geändert

- `!vso` bleibt Testcommand.
- Display-Queue bleibt unverändert.
- Official-Queue bleibt unverändert.
- Stream-Status bleibt unverändert.
- Streamtag-Limit bleibt unverändert.
- Chatmeldungen bleiben unverändert.
- Sound-System bleibt unverändert.
