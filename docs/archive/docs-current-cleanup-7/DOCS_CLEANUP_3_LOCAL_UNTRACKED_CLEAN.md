# RDAP_DOCS_CLEANUP_3_LOCAL_UNTRACKED_CLEAN

Stand: 2026-06-27
Branch: dev
Scope: lokaler Arbeitsbaum nach RDAP Docs Cleanup 2

## Ziel

Nach `RDAP_DOCS_CLEANUP_2_DEV_SAFE_DELETE_AND_MERGE` wurden die produktiven Cleanup-Aenderungen per `stepdone.cmd` nach GitHub/dev uebernommen. Der Abschlussstatus zeigte danach noch lokale untracked Dateien, die nicht Teil des Projektstands sind.

Dieser Step bereitet ein kleines, nachvollziehbares Bereinigungsscript vor. Es entfernt nur exakt benannte lokale Restdateien/Logs, keine Projektmodule und keine produktiven Runtime-Dateien.

## Warum eigener Step

Der Arbeitsbaum soll vor weiteren Doku-/Modul-Cleanup-Steps sauber sein. Sonst besteht die Gefahr, dass spaeter alte Handoff-Logs, versehentliche Testdateien oder Fremd-Dateien in den naechsten Commit rutschen.

## Betroffene lokale Kandidaten aus dem gemeldeten Status

```text
README_RDAP39B_INSTALL.txt
edf e
_handoff/RDAP_DOCS_CLEANUP_2_DEV_SAFE_DELETE_AND_MERGE/cleanup2_dry-run_20260627_134334.json
_handoff/RDAP_DOCS_CLEANUP_2_DEV_SAFE_DELETE_AND_MERGE/cleanup2_dry-run_20260627_134334.txt
_handoff/RDAP_DOCS_CLEANUP_2_DEV_SAFE_DELETE_AND_MERGE/cleanup2_execute_20260627_134404.json
_handoff/RDAP_DOCS_CLEANUP_2_DEV_SAFE_DELETE_AND_MERGE/cleanup2_execute_20260627_134404.txt
```

## Script

```text
tools/cleanup/rdap-docs-cleanup-3-local-untracked-clean.ps1
```

Standardmodus ist Dry-Run. Echte Entfernung nur mit `-Execute`.

## Nicht geaendert

- Keine Backend-Module
- Keine Dashboard-Module
- Keine Remote-Modboard-Dateien
- Keine Datenbank
- Kein Deploy
- Keine produktiven Writes

## Pruefung

```powershell
cd D:\Git\stream-control-center
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup\rdap-docs-cleanup-3-local-untracked-clean.ps1"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup\rdap-docs-cleanup-3-local-untracked-clean.ps1" -Execute
git status
```

Erwartung nach Execute: keine der oben genannten untracked Restdateien mehr sichtbar.
