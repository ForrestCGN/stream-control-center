# STEP555 - Cleanup Run Notes Archive Dry-Run

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

STEP555 erzeugt einen Dry-Run fuer die spaetere Archivierung der Cleanup-Run-Notizen aus STEP543-STEP552.

Dieser STEP verschiebt keine Dateien.

## Voraussetzung

Die zentrale Historie aus STEP554 muss vorhanden sein:

```text
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

## Geplanter Zielordner

```text
project-state/archive/2026-05-29-step554-cleanup-run-notes/
```

## Geplante Quellen

```text
project-state/STEP543_PROJECT_STATE_ARCHIVE_BATCH_PLAN.md
project-state/STEP544_PROJECT_STATE_BATCH_A_RESCUE_DRYRUN.md
project-state/STEP545_PROJECT_STATE_BATCH_A_QUARANTINE_MOVE.md
project-state/STEP546_CHANNELPOINTS_COMMANDS_STATE_CONSOLIDATION_PLAN.md
project-state/STEP547_CHANNELPOINTS_STATE_CONSOLIDATION_DRAFT.md
project-state/STEP548_COMMANDS_STATE_CONSOLIDATION_DRAFT.md
project-state/STEP549_FEATURE_STATE_ARCHIVE_PLAN.md
project-state/STEP550_FEATURE_STATE_ARCHIVE_DRYRUN.md
project-state/STEP551_FEATURE_STATE_ARCHIVE_APPLY.md
project-state/STEP552_PROJECT_STATE_ROOT_VERIFICATION_SCAN.md
project-state/NEXT_STEPS_STEP543_APPEND.md
project-state/NEXT_STEPS_STEP546_APPEND.md
project-state/NEXT_STEPS_STEP547_APPEND.md
project-state/NEXT_STEPS_STEP548_APPEND.md
project-state/NEXT_STEPS_STEP549_APPEND.md
```

## Geschuetzt

```text
project-state/CHANGELOG.md
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
project-state/CURRENT_STATUS.md
project-state/FILES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

## Ausfuehren

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\dryrun_cleanup_run_notes_archive_step555.ps1
```

## Reports

```text
system-scan-output\step555_cleanup_run_notes_archive_dryrun_summary.txt
system-scan-output\step555_cleanup_run_notes_archive_dryrun.txt
system-scan-output\step555_cleanup_run_notes_archive_manifest.md
system-scan-output\step555_cleanup_run_notes_archive_dryrun.json
```

## Erwartet

```text
Planned files: 15
Source missing: 0
Target conflicts: 0
Errors: 0
```

## Danach

Wenn sauber:

```text
STEP556 - Cleanup Run Notes Archive Apply
```
