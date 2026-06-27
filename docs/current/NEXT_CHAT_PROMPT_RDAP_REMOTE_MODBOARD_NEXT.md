# NEXT CHAT PROMPT - RDAP / Remote-Modboard normale Weiterarbeit

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
docs/current/DOCS_CURRENT_FINAL_INDEX.md
docs/current/MODULE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/ROUTE_SERVICE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
```

Falls eine Datei fehlt: nicht improvisieren, exakt diese Datei aus `D:\Git\stream-control-center` anfordern.

## Aktueller Stand

RDAP Docs Cleanup 5 bis 10 ist abgeschlossen:

- Historische `docs/current/`-Altlasten wurden nach `docs/archive/docs-current-cleanup-*` verschoben.
- `docs/current/` ist auf den erwarteten Current-Bestand reduziert.
- Keine Code-Dateien wurden geaendert.
- Keine DB-Aenderung.
- Kein Webserver-Deploy fuer die Doku-Cleanup-Steps.
- Technischer Basisstand bleibt Version 0.1.3: Streaming-PC Verbindung, Komponentenstatus und OBS-Status read-only. Keine Steuerung, keine Writes.

## Naechster sinnvoller Arbeitsfokus

Wieder normale RDAP-/Remote-Modboard-Weiterarbeit aufnehmen. Vor jeder Umsetzung:

1. echte Dateien aus GitHub/dev lesen,
2. bestehende Module/Services/Routes bevorzugen,
3. keine parallelen Strukturen bauen,
4. Plan nennen,
5. auf Forrests `go` warten.

## Was NICHT gemacht werden darf

- Kein GitHub/main.
- Keine Codeaenderung nebenbei.
- Keine DB-Migration ohne expliziten Scope.
- Keine Remote-Modboard-Writes ohne Confirm-Write, Permission, Audit, Lock, Backup, Rollback und Read-Back-Pruefung.
- Keine aktiven Module entfernen.
- Keine Funktionen entfernen.
- Kein Webserver-Deploy bei Doku-only.

## Aufgabe im neuen Chat

Lies zuerst die genannten Dateien wirklich aus GitHub/dev. Bestaetige kurz den aktuellen Stand. Nenne einen Plan fuer den naechsten RDAP-/Remote-Modboard-Step. Warte auf Forrests explizites `go`.
