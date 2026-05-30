# STEP586 - Current Run Docs Archive Apply

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP586 verschiebt die in STEP585 geprueften aktuellen Run-Dokumente in den Archivordner.

Standard ist Dry-Run.

Echtes Verschieben passiert nur mit `-Apply`.

## Zielordner

```text
project-state/archive/2026-05-30-step583-current-run-docs/
```

## Geplante Menge

```text
33 STEP-Dokumente
13 NEXT_STEPS_STEP*-APPEND-Dateien
gesamt 46 Dateien
```

Hinweis: Seit STEP585 ist `project-state/STEP585_CURRENT_RUN_DOCS_ARCHIVE_DRYRUN.md` hinzugekommen.

## Script

```text
tools/system-inspection/move_current_run_docs_archive_step586.ps1
```

## Dry-Run

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_current_run_docs_archive_step586.ps1
```

## Apply

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_current_run_docs_archive_step586.ps1 -Apply
```

## Reports

```text
system-scan-output\step586_current_run_docs_archive_manifest.md
system-scan-output\step586_current_run_docs_archive_apply_report.txt
system-scan-output\step586_current_run_docs_archive_apply_report.json
```

## Wichtige Konsolenausgabe

Da Uploads limitiert sein koennen, kopiere nach dem Lauf die Zeilen unter `COPY_THIS_RESULT:` in den Chat.

Erwartung nach Apply:

```text
Mode: APPLY
Planned files: 46
Source missing: 0
Target conflicts: 0
Duplicate planned files: 0
Warnings: 0
Errors: 0
Applied moves: 46
```

## Danach

```text
STEP587 - Post Current Run Docs Verification
```
