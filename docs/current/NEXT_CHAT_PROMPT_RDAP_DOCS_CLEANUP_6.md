# NEXT CHAT PROMPT - RDAP Docs Cleanup 6

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Wahrheit / Arbeitsbasis

- GitHub/dev und lokales Repo `D:\Git\stream-control-center` sind Wahrheit.
- Nicht gegen GitHub/main arbeiten.
- Erst echte Dateien/Dokus lesen, dann Plan nennen, dann auf `go` warten.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: `installstep.cmd` aus `D:\Git\stream-control-center`.
- Danach Checks und `git status`.
- Nur wenn sauber: `stepdone.cmd`.
- Doku-only: kein Webserver-Deploy.

## Aktueller Cleanup-Stand

- Cleanup 1: Modul-/Stats-Inventar vorbereitet.
- Cleanup 2: sichere Runtime-Backups und project-state-Root-Altdateien entfernt.
- Cleanup 3: lokale untracked Restdateien bereinigt.
- Cleanup 4: Modul-/Route-Doku konsolidiert und docs/current gescannt.
- Cleanup 5: historische `RDAP*`- und `NEXT_CHAT_PROMPT*`-Dateien aus `docs/current` nach `docs/archive/docs-current-cleanup-5/` verschoben.

## Naechster sinnvoller Step

`RDAP_DOCS_CLEANUP_6_DOCS_CURRENT_REVIEW_BUCKETS`

Ziel:

- Verbleibende `docs/current`-Dateien thematisch klassifizieren.
- Klare Current-Dateien behalten.
- Alte CAN/EVS/LC/Diagnostics/Tagebuch-Dateien in Themenarchive verschieben oder zusammenfuehren.
- Keine Code-Dateien aendern.
- Keine DB.
- Kein Deploy.

Startdateien zuerst lesen:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/MODULE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/ROUTE_SERVICE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/DOCS_CLEANUP_5_CURRENT_ARCHIVE_MANIFEST.md
docs/current/DOCS_CLEANUP_5_CANDIDATE_SUMMARY.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```
