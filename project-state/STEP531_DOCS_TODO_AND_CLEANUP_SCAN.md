# STEP531_DOCS_TODO_AND_CLEANUP_SCAN

Version: 0.1.1  
Stand: 2026-05-29

## Ziel

Doku-Verjüngung vorbereiten, ohne TODOs oder offene Punkte zu verlieren.

## Fix in v0.1.1

PowerShell-Kompatibilitätsfix: keine Generic-Listen/PSCustomObject-Rückgabe in Hilfsfunktionen.

## Bestandteil

```text
.gitignore
tools/system-inspection/scan_docs_todos_and_cleanup.ps1
docs/system-inspection/STEP531_DOCS_TODO_AND_CLEANUP_SCAN.md
project-state/STEP531_DOCS_TODO_AND_CLEANUP_SCAN.md
```

## Änderung an .gitignore

```text
system-scan-output/
_cleanup_quarantine/
```

## Bewusst nicht gemacht

- keine Doku gelöscht
- keine Doku verschoben
- keine produktiven Dateien geändert
- keine Configs geändert
- keine SQLite/Secrets angefasst
