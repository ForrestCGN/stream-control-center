# NEXT CHAT PROMPT - RDAP TODO Rescue 2 pruefen / RDAP weiterfuehren

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
- Webserver-Deploy nur bei Code-/Remote-Modboard-Aenderungen, nicht bei Doku-only.

## Pflicht-Startdateien wirklich lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/PARKED_TODOS.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/DOCS_CURRENT_FINAL_INDEX.md
docs/current/TODO_RESCUE_2_ARCHIVE_SOURCE_DEEP_SCAN.md
```

## Aktueller Stand

- Docs-Cleanup 5 bis 10 ist abgeschlossen.
- TODO Rescue 1 hat `TODO.md` wieder als aktive Kurzfristliste hergestellt und `PARKED_TODOS.md` als zentrale Langzeit-Merkstelle angelegt.
- TODO Rescue 2 hat gezielt die in Rescue 1 markierten Archivquellen gelesen und fehlende belegte Parkpunkte nachgetragen.
- Technischer Basisstand bleibt 0.1.3 read-only. Keine Steuerung, keine Writes.

## Naechster sinnvoller Fokus

Nach Bestaetigung von Rescue 2 kann wieder normale RDAP-/Remote-Modboard-Arbeit geplant werden. Kandidaten stehen in `project-state/TODO.md`; Langzeit-/Parkpunkte stehen in `project-state/PARKED_TODOS.md`.

Vor jeder Umsetzung:

1. echte Dateien aus GitHub/dev lesen,
2. bestehende Module/Services/Routes bevorzugen,
3. keine parallelen Strukturen bauen,
4. Plan nennen,
5. auf Forrests `go` warten.
