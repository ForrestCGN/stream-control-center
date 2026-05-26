# CURRENT_SYSTEM_STATUS

## Aktueller Arbeitsstand

Aktuell relevant nach STEP474:

- STEP474 war ein reiner Aufraeum-/Doku-STEP.
- Es wurden keine Backend-, Dashboard-, Overlay-, Config- oder Datenbankdateien geaendert.
- Der hochgeladene Backend-Stand wurde fuer eine Modul-/Routen-/Cleanup-Uebersicht ausgewertet.
- `stream_status` bleibt als bekannter Stand bei Runtime-Version `0.1.2`.
- `clip_shoutout` bleibt als bekannter Stand bei Runtime-Version `0.2.10`.
- Shoutout-Dashboard ist weiterhin vorhanden, aber UX muss in Tabs/Unterbereiche aufgeteilt werden.

## Zentrale Projektregeln

Die verbindliche Arbeitsgrundlage steht in:

```text
project-state/GENERAL_PROJECT_PROMPT.md
docs/current/PROJECT_WORKING_RULES.md
```

Wichtige Regeln:

- Deutsch antworten.
- Keine Funktionalitaet entfernen.
- Keine Patches, Git-Patches, PowerShell-Regex- oder Inline-Patch-Scripte.
- Aenderungen nur als vollstaendige Ersatzdateien im ZIP.
- ZIPs mit echten Zielpfaden ab Repo-Root.
- ZIPs direkt nach `D:\Git\stream-control-center` entpackbar.
- Produktive SQLite-Datenbank niemals ersetzen/ueberschreiben.
- Keine Runtime-Daten, Datenbanken, Backups, Secrets oder temporaere Dateien ins Repo.
- Nur notwendige Shell-/PowerShell-Ausgaben liefern.
- Dashboard-Module nicht ueberladen; grosse Module in Tabs/Unterbereiche aufteilen.

## Doku-/Cleanup-Stand STEP474

Neue/aktualisierte zentrale Doku:

```text
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-26.md
docs/current/PROJECT_DOCS_CLEANUP_NOTES_2026-05-26.md
project-state/STEP474_DOCS_TODO_MODULE_CLEANUP.md
```

Auswertung aus `backend.zip`:

- Backend-Module ohne Helper: 49
- Helper-Dateien: 18
- erkannte Routen/Route-Hinweise: 527
- Module mit erkannter Versionskennung: 12
- Module ohne erkannte Versionskennung: 37

Auffaelligkeiten fuer spaeteren Cleanup:

```text
backend/data/app.sqlite
backend/data/deathcounter.v2.json
backend/modules/twitch.js.bak_original_uploaded
```

Diese Dateien wurden nicht geaendert und nicht geloescht. Sie sind nur als pruefpflichtig dokumentiert.

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

- Twitch-API ist Primaerquelle.
- Legacy-Dateien bleiben Fallback.
- Auto-Refresh laeuft standardmaessig alle 60 Sekunden, bei live/grace alle 30 Sekunden.
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

## Naechster sinnvoller Fach-STEP

```text
STEP475_SHOUTOUT_DASHBOARD_TABS
```

Ziel:

- Shoutout-Dashboard aufraeumen.
- Tabs/Unterbereiche ergänzen: Übersicht, Queues, Statistik, Timeline, Settings/Test.
- Keine Shoutout-Backendlogik ändern, sofern nicht zwingend noetig.


## Doku-/Cleanup-Stand STEP475

STEP475 ist weiterhin reine Doku-/Aufräum-Arbeit.

Ergänzt wurde:

- `docs/modules/` als erste strukturierte Modul-Doku-Ebene.
- Modul-Dokus für Core, Stream-Status, Clip-Shoutout/VSO, Alerts, Sound-System, TTS, Message-Rotator, Tagebuch/ToDo, Hug/Rehug, Birthday, Clips, OBS/Scene-Control, Twitch/Discord, Dashboard-Backend und weitere Community-Systeme.
- `docs/current/PROJECT_STATE_CLEANUP_PLAN_2026-05-26.md` als Plan zur Bereinigung von `project-state/`.
- `project-state/PROJECT_STATE_ARCHIVE_MOVE_LIST_2026-05-26.csv` als Verschiebe-Manifest.
- `tools/project_state_archive_step475.ps1` als optionales, gezieltes Move-Script für alte `project-state`-Dateien.

Nicht geändert wurde:

- keine Backend-Logik
- keine Dashboard-Logik
- keine Overlay-Dateien
- keine Config-Dateien
- keine Datenbankdateien
- keine produktive Runtime-Dateien

Wichtig: Das ZIP allein verschiebt keine bestehenden Root-Dateien aus `project-state/`. Das Aufräumen passiert erst, wenn das Move-Script ausgeführt wird.
