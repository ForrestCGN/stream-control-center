# NEXT CHAT PROMPT - RDAP TODO Rescue 2

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
docs/current/TODO_RESCUE_1_SPLIT_ACTIVE_AND_PARKED_TODOS.md
```

## Aktueller Stand

`project-state/TODO.md` wurde wieder als aktive Kurzfrist-TODO definiert.  
`project-state/PARKED_TODOS.md` wurde als zentrale Langzeit-Merkstelle fuer zurueckgestellte Punkte angelegt.

Rescue 1 hat grosse belegte Parkpunkte aus Master-TODO, TODO-Rescue-Report, EventSound, StreamEvents, VIP, RDAP43 und LAN wiederhergestellt.

## Naechster sinnvoller Step

`RDAP_TODO_RESCUE_2_ARCHIVE_SOURCE_DEEPENING`

Ziel:

- die in `PARKED_TODOS.md` unter `Noch gezielt nachzurettende Quellen fuer Rescue-2` genannten Dateien wirklich lesen,
- echte offene Punkte nachtragen,
- erledigte/obsolete Step-Install-Todos nicht wiederbeleben,
- Quellen im Rescue-Audit dokumentieren,
- keine Codeaenderung, keine DB, kein Webserver-Deploy.

## Was NICHT gemacht werden darf

- Kein GitHub/main.
- Keine Codeaenderung nebenbei.
- Keine DB-Migration.
- Keine Remote-Modboard-Writes.
- Keine aktiven Module entfernen.
- Keine Funktionen entfernen.
- Keine Parkpunkte ohne Quelle erfinden.

## Aufgabe im neuen Chat

Lies zuerst die genannten Dateien wirklich aus GitHub/dev. Bestaetige kurz den aktuellen Stand. Nenne einen Plan fuer RDAP TODO Rescue 2. Warte auf Forrests explizites `go`.
