# STEP584 - Current Run Docs Rescue / History Append

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP584 sichert den aktuellen Cleanup-Verlauf aus STEP553-STEP583 in der aktiven Run-History.

Zieldatei:

```text
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

## Warum?

Vor der Archivierung der aktuellen Run-Dokumente aus `project-state` muss der Verlauf aktiv dokumentiert sein.

Nach STEP582 lagen noch im Root:

```text
Current run docs still in root: 29
Remaining NEXT_STEPS appends: 12
```

Diese Dateien werden erst in STEP585/STEP586 archiviert.

## Script

```text
tools/system-inspection/append_current_run_history_step584.ps1
```

Das Script nutzt einen Marker, um doppelte Appends zu vermeiden:

```text
<!-- STEP584_CURRENT_RUN_DOCS_RESCUE_HISTORY_APPEND -->
```

## Ausfuehren

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\append_current_run_history_step584.ps1
```

## Reports

```text
system-scan-output\step584_current_run_docs_history_append_report.txt
system-scan-output\step584_current_run_docs_history_append_report.json
```

## Erwartung

```text
Changed: True
Warnings: 0
Errors: 0
```

Wenn der Marker bereits vorhanden ist, ist auch dies ok:

```text
Already present: True
Changed: False
Warnings: 0
Errors: 0
```

## Danach

```text
STEP585 - Current Run Docs Archive Dry-Run
```
