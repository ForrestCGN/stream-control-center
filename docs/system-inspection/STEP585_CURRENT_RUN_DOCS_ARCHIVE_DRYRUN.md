# STEP585 - Current Run Docs Archive Dry-Run

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP585 prueft, ob die aktuellen Run-Dokumente aus `project-state` sicher archiviert werden koennen.

Dieser STEP verschiebt nichts.

## Zielordner

```text
project-state/archive/2026-05-30-step583-current-run-docs/
```

## Geplante Menge

```text
32 STEP-Dokumente
13 NEXT_STEPS_STEP*-APPEND-Dateien
gesamt 45 Dateien
```

Hinweis: In STEP583 war die Ausgangslage 29 + 12. Seitdem kamen STEP583, STEP584 und NEXT_STEPS_STEP583_APPEND dazu.

## Script

```text
tools/system-inspection/dryrun_current_run_docs_archive_step585.ps1
```

## Ausfuehren

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\dryrun_current_run_docs_archive_step585.ps1
```

## Reports

```text
system-scan-output\step585_current_run_docs_archive_manifest.md
system-scan-output\step585_current_run_docs_archive_dryrun.txt
system-scan-output\step585_current_run_docs_archive_dryrun_summary.txt
system-scan-output\step585_current_run_docs_archive_dryrun.json
```

## Erwartet

```text
Mode: DRY_RUN_ONLY
Planned files: 45
Source missing: 0
Target conflicts: 0
Duplicate planned files: 0
Warnings: 0
Errors: 0
```

## Danach

Wenn sauber:

```text
STEP586 - Current Run Docs Archive Apply
```
