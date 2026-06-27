# NEXT CHAT PROMPT - RDAP Docs Cleanup 10

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Wahrheit / Arbeitsbasis

- GitHub/dev und lokales Repo `D:\Git\stream-control-center` sind Wahrheit.
- Nicht gegen GitHub/main arbeiten.
- Erst echte Dateien/Dokus lesen, dann Plan nennen, dann auf `go` warten.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: `installstep.cmd` aus `D:\Git\stream-control-center`.
- Danach Checks und `git status`.
- Nur wenn sauber/nachvollziehbar: `stepdone.cmd`.
- Doku-only: kein Webserver-Deploy.
- Wenn Scripts `_handoff`-Logs erzeugen: in Doku zusammenfassen, bewusst committen oder lokal loeschen. Nicht untracked liegen lassen.

## Pflicht-Startdateien wirklich lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/MODULE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/ROUTE_SERVICE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/DOCS_CLEANUP_9_CURRENT_DOCS_FINAL_RESCAN_AUDIT.md
docs/current/DOCS_CLEANUP_9_CANDIDATE_SUMMARY.md
```

Falls eine Datei fehlt: nicht improvisieren, exakt diese Datei aus `D:\Git\stream-control-center` anfordern.

## Aktueller Stand

RDAP Docs Cleanup 9:

- Final-Rescan nach Cleanup 8 vorbereitet.
- 13 abgeschlossene Cleanup-/Prompt-Dateien werden nach `docs/archive/docs-current-cleanup-9/` vorbereitet.
- Erwarteter Endbestand in `docs/current/` nach Execute: 20 Dateien.
- Keine Deletes.
- Keine Merges.
- Keine Code-Dateien geaendert.
- Keine DB-Aenderung.
- Kein Webserver-Deploy.

## Naechster sinnvoller Step

`RDAP_DOCS_CLEANUP_10_DOCS_CURRENT_VERIFY_AND_CLOSE`

Ziel:

- `docs/current/` nach Cleanup 9 final gegen GitHub/dev pruefen.
- Zaehlen, ob die erwarteten 20 Dateien vorhanden sind.
- Falls alles sauber ist: Doku-Cleanup abschliessen und normalen RDAP-Weiterarbeits-Prompt erstellen.
- Keine Codeaenderung, keine DB, kein Webserver-Deploy.

## Was NICHT gemacht werden darf

- Kein GitHub/main.
- Keine Codeaenderung nebenbei.
- Keine DB-Migration.
- Keine Remote-Modboard-Writes.
- Keine aktiven Module entfernen.
- Keine Funktionen entfernen.
- Keine Loeschung ohne exakte Liste und Dry-Run.
- Keine wilden Archivstrukturen erfinden.

## Aufgabe im neuen Chat

Lies zuerst die genannten Dateien wirklich aus GitHub/dev. Bestaetige kurz den aktuellen Stand. Nenne einen Plan fuer RDAP Docs Cleanup 10. Warte auf Forrests explizites `go`.
