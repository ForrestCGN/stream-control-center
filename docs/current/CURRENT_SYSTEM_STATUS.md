# CURRENT_SYSTEM_STATUS

## Aktueller Arbeitsstand

Aktuell relevant:

- `stream_status` steht auf Runtime-Version `0.1.2`.
- `stream_status` nutzt Twitch-API als Primärquelle und hat Auto-Refresh.
- `clip_shoutout` steht auf Runtime-Version `0.2.10`.
- Shoutout-Statistik-Routen sind vorhanden und getestet.
- Shoutout-Dashboard ist vorhanden, aber UX muss in Tabs/Unterbereiche aufgeteilt werden.
- Allgemeiner Projektprompt wurde mit STEP472 umfassend aktualisiert.

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
- Dashboard-Modul vorhanden, aber UX muss verbessert werden.

## Nächster sinnvoller Schritt

```text
STEP473_SHOUTOUT_DASHBOARD_TABS
```

## STEP473 - ToDo-Regel und allgemeiner Prompt

- `project-state/GENERAL_PROJECT_PROMPT.md` enthält jetzt eine verbindliche ToDo-/Offene-Punkte-Regel.
- Neue zentrale Datei: `project-state/TODO.md`.
- `TODO.md` hält längerfristige offene Punkte, spätere Ideen, bewusst verschobene Aufgaben und bekannte UX-/Technik-Schulden fest.
- `NEXT_STEPS.md` bleibt für unmittelbare Einbau-, Prüf- und Testschritte zuständig.
- Jeder STEP muss prüfen, ob `TODO.md` und/oder `NEXT_STEPS.md` aktualisiert werden müssen.
