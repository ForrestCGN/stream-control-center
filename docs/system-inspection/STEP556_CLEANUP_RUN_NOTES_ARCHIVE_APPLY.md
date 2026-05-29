# STEP556 - Cleanup Run Notes Archive Apply

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

STEP556 verschiebt die in STEP555 geprueften Cleanup-Run-Notizen in einen Archivordner.

Standard ist Dry-Run.

Echtes Verschieben passiert nur mit `-Apply`.

## Zielordner

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

## Dry-Run

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_cleanup_run_notes_archive_step556.ps1
```

## Apply

Nur ausfuehren, wenn der Dry-Run exakt passt:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_cleanup_run_notes_archive_step556.ps1 -Apply
```

## Reports

```text
system-scan-output\step556_cleanup_run_notes_archive_apply_report.txt
system-scan-output\step556_cleanup_run_notes_archive_apply_report.json
system-scan-output\step556_cleanup_run_notes_archive_manifest.md
```

## Danach

Nach Apply:

```powershell
git status
git diff --stat
```

Erwartet:

```text
15 alte Cleanup-Run-Notizen aus project-state Root verschoben
15 Archivdateien unter project-state/archive/2026-05-29-step554-cleanup-run-notes/
PROJECT_STATE_CLEANUP_RUN_HISTORY.md bleibt aktiv
Core-/Current-Dateien bleiben aktiv
```
