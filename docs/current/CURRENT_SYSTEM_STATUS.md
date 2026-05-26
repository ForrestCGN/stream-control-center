# CURRENT_SYSTEM_STATUS

## Aktueller Arbeitsstand

Aktuell relevant nach STEP483:

- STEP483 hat das Shoutout-Dashboard im Control-Center in Tabs/Unterbereiche aufgeteilt.
- Geändert wurden nur Dashboard-Dateien und Doku-/Projektstand-Dateien.
- Es wurden keine Backend-, API-, Config-, Datenbank- oder Overlay-Dateien geändert.
- `stream_status` bleibt als bekannter Stand bei Runtime-Version `0.1.2`.
- `clip_shoutout` bleibt als bekannter Stand bei Runtime-Version `0.2.10`.

## Zentrale Projektregeln

Die verbindliche Arbeitsgrundlage steht in:

```text
project-state/GENERAL_PROJECT_PROMPT.md
docs/current/PROJECT_WORKING_RULES.md
```

Wichtige Regeln:

- Deutsch antworten.
- Keine Funktionalität entfernen.
- Keine Patches, Git-Patches, PowerShell-Regex- oder Inline-Patch-Scripte.
- Änderungen nur als vollständige Ersatzdateien im ZIP.
- ZIPs mit echten Zielpfaden ab Repo-Root.
- ZIPs direkt nach `D:\Git\stream-control-center` entpackbar.
- Produktive SQLite-Datenbank niemals ersetzen/überschreiben.
- Keine Runtime-Daten, Datenbanken, Backups, Secrets oder temporäre Dateien ins Repo.
- Nur notwendige Shell-/PowerShell-Ausgaben liefern.
- Dashboard-Module nicht überladen; große Module in Tabs/Unterbereiche aufteilen.

## Stream Status Core

Modul:

```text
backend/modules/stream_status.js
```

Runtime-Version:

```text
0.1.2
```

Routen:

```text
GET      /api/stream-status/status
GET      /api/stream-status/current
GET/POST /api/stream-status/refresh
GET      /api/stream-status/sessions
```

Status:

- Twitch-API ist Primärquelle.
- Legacy-Dateien bleiben Fallback.
- Auto-Refresh läuft standardmäßig alle 60 Sekunden, bei live/grace alle 30 Sekunden.
- Status wird in RAM und SQLite gespeichert.

## Clip-Shoutout / VSO

Modul:

```text
backend/modules/clip_shoutout.js
```

Runtime-Version:

```text
0.2.10
```

Wichtige Routen:

```text
GET  /api/clip-shoutout/status
GET  /api/clip-shoutout/queue
GET  /api/clip-shoutout/timeline
GET  /api/clip-shoutout/stats
GET  /api/clip-shoutout/stats/user
POST /api/clip-shoutout/run
```

Aktueller Stand:

- Testcommand bleibt `!vso`.
- Keine produktive Umstellung auf `!so`.
- Display-Queue aktiv.
- Official Twitch-Shoutout nutzt `stream_status` als Live-Gate.
- Streamtag-Limit aktiv.
- Override per `--force`.
- Statistik vorhanden.
- Dashboard-Modul ist ab STEP483 in Tabs aufgeteilt.

## Shoutout-Dashboard ab STEP483

Dashboard-Dateien:

```text
htdocs/dashboard/modules/shoutout.js
htdocs/dashboard/modules/shoutout.css
```

Tabs:

```text
Übersicht
Queues
Statistik
Timeline
Settings/Test
```

Wichtig:

- Retry-/Remove-/Run-Aktionen bleiben erhalten.
- Settings/Test zeigt Settings kompakt an, speichert aber keine Settings.
- Backend wurde nicht geändert.

## Nächster sinnvoller Fach-STEP

```text
STEP484_SHOUTOUT_INBOUND_EVENTSUB_LOGGING
```

Ziel:

- Eingehende Twitch-Shoutouts separat loggen.
- Ausgehende und eingehende Shoutouts sauber trennen.
- Dashboard-/Statistik-Ausbau für eingehende Shoutouts vorbereiten.
