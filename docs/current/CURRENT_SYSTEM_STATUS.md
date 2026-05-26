# CURRENT_SYSTEM_STATUS

Stand: 2026-05-26 / STEP484_SHOUTOUT_INBOUND_EVENTSUB_INTEGRATION

## Aktueller Arbeitsstand

- `stream_status` bleibt bekannter Stand bei Runtime-Version `0.1.2`.
- `clip_shoutout` steht jetzt bei Runtime-Version `0.2.11`.
- Shoutout-Dashboard ist in Tabs aufgeteilt.
- Eingehende/erstellte Twitch-Shoutout-EventSub-Events werden im bestehenden Shoutout-System gespeichert.

## Zentrale Projektregeln

Verbindlich bleiben:

- Deutsch antworten.
- Keine Funktionalität entfernen.
- Keine Patches, Git-Patches, PowerShell-Regex- oder Inline-Patch-Scripte als Lieferung.
- Änderungen nur als vollständige Ersatzdateien im ZIP.
- ZIPs mit echten Zielpfaden ab Repo-Root.
- ZIPs direkt nach `D:\Git\stream-control-center` entpackbar.
- Produktive SQLite-Datenbank niemals ersetzen/überschreiben.
- Keine Runtime-Daten, Datenbanken, Backups, Secrets oder temporäre Dateien ins Repo.
- Vorhandene Module erweitern, wenn die Zuständigkeit passt; keine unnötigen Parallelmodule.

## Clip-Shoutout / VSO

Modul:

```text
backend/modules/clip_shoutout.js
```

Runtime-Version:

```text
0.2.11
```

Wichtige Routen:

```text
GET  /api/clip-shoutout/status
GET  /api/clip-shoutout/queue
GET  /api/clip-shoutout/timeline
GET  /api/clip-shoutout/stats
GET  /api/clip-shoutout/inbound
GET  /api/clip-shoutout/inbound/stats
POST /api/clip-shoutout/run
POST /api/clip-shoutout/inbound/debug
```

## STEP484 Integration

`backend/modules/twitch.js` bleibt zuständig für Twitch/EventSub. Es empfängt weiterhin alle EventSub-Notifications und leitet nur die Shoutout-Events an `clip_shoutout.js` weiter:

```text
channel.shoutout.receive
channel.shoutout.create
```

`clip_shoutout.js` speichert diese Daten in:

```text
clip_shoutout_inbound_events
```

Dashboard-Tab:

```text
Eingehend
```

## Tests

```bat
cd D:\Git\stream-control-center
node --check backend\modules\twitch.js
node --check backend\modules\clip_shoutout.js
node --check htdocs\dashboard\modules\shoutout.js
```

## Nächster sinnvoller Fach-STEP

```text
STEP485_SHOUTOUT_INBOUND_UI_POLISH_OR_SO_PRODUCTION_CHECK
```
