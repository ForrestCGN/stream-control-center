# NEXT CHAT PROMPT - RDAP Docs Cleanup 5

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Arbeitsbasis

- GitHub/dev ist Wahrheit.
- Lokales Repo: `D:\Git\stream-control-center`.
- Nicht gegen `main` arbeiten.
- Erst echte Dateien und Dokus lesen.
- Dann Plan nennen.
- Auf Forrests ausdrueckliches `go` warten.
- ZIPs enthalten echte Repo-Zielpfade.
- Lokal: `installstep.cmd` -> Checks -> `git status` -> `stepdone.cmd`.
- Doku-only: kein Webserver-Deploy.

## Aktueller Stand

- Version 0.1.3 bleibt technische Basis: Streaming-PC Verbindung, Komponentenstatus und OBS-Status read-only.
- RDAP Docs Cleanup 2 hat sichere Backup-/Altdateien und project-state-Root-Altlasten bereinigt.
- RDAP Docs Cleanup 3 bereinigt lokale untracked Restdateien.
- RDAP Docs Cleanup 4 konsolidiert Modul-/Route-/Service-Doku und liefert einen lokalen Scan fuer `docs/current`.

## Naechster Scope

`RDAP_DOCS_CLEANUP_5_DOCS_CURRENT_SAFE_DELETE_OR_ARCHIVE`

Ziel:

- Ergebnis des Cleanup-4-Scans auswerten.
- Exakte Liste fuer alte `docs/current` Handoff-/Step-Dateien erstellen.
- Entscheiden pro Datei: behalten, zusammenfuehren, archivieren oder loeschen.
- Kein Runtime-Code.
- Keine DB.
- Keine Remote-/OBS-/Streamer.bot-Writes.

Wichtig:

- Keine Wildcards fuer echte Loeschung.
- Erst Dry-Run, dann `-Execute`.
- Bei Unsicherheit: `REVIEW_MANUALLY`, nicht loeschen.
