# STEP544 - Project-State Cleanup Batch A Rescue + Dry-Run

Version: 0.1.2  
Stand: 2026-05-29

## Aenderung gegenueber v0.1.1

Das PowerShell-Skript wurde vereinfacht:

```text
keine Markdown-Tabelle im Skript
keine Backticks in dynamischen Ausgabezeilen
keine Sonderzeichen
keine komplizierten String-Interpolationen
```

## Ziel

Fuer Project-State Batch A wird eine Rescue-/Index-Datei und ein Dry-Run erzeugt.

Dieser STEP verschiebt noch keine Dateien.

## Ausfuehren

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\dryrun_project_state_batch_a_step544.ps1
```

## Reports

```text
system-scan-output\step544_project_state_batch_a_dryrun_summary.txt
system-scan-output\step544_project_state_batch_a_dryrun.txt
system-scan-output\step544_project_state_batch_a_rescue_index.md
system-scan-output\step544_project_state_batch_a_dryrun.json
```
