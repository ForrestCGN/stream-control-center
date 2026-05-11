# STEP002 Repo-vs-Live-Abgleich

Stand: 2026-05-03 18:25:51

## Ziel

Abgleich zwischen GitHub-Repo-Arbeitskopie und Live-System, damit keine Parallelstände entstehen.

## Pfade

Repo:
D:\Git\stream-control-center

Live:
D:\Streaming\stramAssets

## Ausschlüsse

Ausgeschlossen wurden u. a.:

- node_modules
- .git
- archive
- secrets
- data/sqlite
- data/logs
- SQLite/WAL/SHM
- .env
- Backup-/Archivdateien wie .bak/.old/.alt/.new
- ZIP/7z/TGZ

## Ergebnis-Zahlen

Repo-Dateien:
189

Live-Dateien:
8016

Nur im Repo:
35

Nur im Live-System:
7862

In beiden vorhanden, aber unterschiedliche Dateigröße:
2

## Ausgabedateien

- repo_files.csv
- live_files.csv
- only_in_repo.csv
- only_in_live.csv
- different_size.csv

## Bewertung

Diese Datei ist nur der technische Vergleich.
Die fachliche Bewertung erfolgt danach manuell, damit keine benötigten Live-Dateien versehentlich überschrieben oder entfernt werden.

