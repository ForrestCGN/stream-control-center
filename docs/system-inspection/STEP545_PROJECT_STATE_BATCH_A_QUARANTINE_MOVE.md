# STEP545 - Project-State Batch A Quarantine/Move

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

STEP545 verschiebt den in STEP544 geprueften Project-State Batch A in einen Archivordner.

Standard ist Dry-Run.

Echtes Verschieben passiert nur mit `-Apply`.

## Zielordner

```text
project-state/archive/2026-05-29-step544-project-state-batch-a/
```

## Batch A

```text
project-state/NEXT_STEPS_STEP539_APPEND.md
project-state/NEXT_STEPS_STEP541_APPEND.md
project-state/STEP528_SYSTEM_SCAN_DOCUMENTATION_CLEANUP_MAP.md
project-state/STEP530_BACKUP_AND_SAFE_CLEANUP_BATCH1.md
project-state/STEP531_DOCS_TODO_AND_CLEANUP_SCAN.md
project-state/STEP532_TODO_RESCUE_AND_DOC_CLEANUP_TRIAGE.md
project-state/STEP533_CURRENT_APPEND_DOCS_CONSOLIDATION_BATCH1.md
project-state/STEP534_CURRENT_STEP_DOCS_CONSOLIDATION_BATCH2.md
project-state/STEP535_TECH_STEP_DOCS_CLEANUP_SCAN.md
project-state/STEP536_TECH_STEP_DOCS_TRIAGE_AND_BATCH_PLAN.md
project-state/STEP536A_ALERT_TECH_DOCS_CONSOLIDATION.md
project-state/STEP536B_SOUND_MEDIA_TECH_DOCS_CONSOLIDATION.md
project-state/STEP536C_VIP_TECH_DOCS_CONSOLIDATION.md
project-state/STEP536D_README_CLIP_MISC_TECH_DOCS_CONSOLIDATION.md
project-state/STEP537_POST_CLEANUP_DOCS_VERIFICATION_SCAN.md
project-state/STEP538_COMMUNICATION_AUDIT_CONSOLIDATION.md
project-state/STEP539_TECH_STEP_DOCS_CLEANUP_COMPLETION.md
project-state/STEP540_TODO_MARKER_TRIAGE_SCAN.md
project-state/STEP541_TODO_MARKER_TRIAGE_FINDINGS.md
project-state/STEP542_PROJECT_STATE_TRIAGE_SCAN.md
```

## Geschuetzt

Diese Dateien sind explizit nicht Teil des Batches:

```text
project-state/CHANGELOG.md
project-state/CURRENT_STATUS.md
project-state/FILES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/archive/*
project-state/STEP476_* through STEP497_*
project-state/CHANNELPOINTS_*.md
project-state/COMMANDS_*.md
```

## Dry-Run

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_project_state_batch_a_step545.ps1
```

## Apply

Nur ausfuehren, wenn der Dry-Run exakt passt:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_project_state_batch_a_step545.ps1 -Apply
```

## Reports

```text
system-scan-output\step545_project_state_batch_a_move_report.txt
system-scan-output\step545_project_state_batch_a_move_report.json
system-scan-output\step545_project_state_batch_a_archive_manifest.md
```

## Danach

Nach Apply:

```powershell
git status
git diff --stat
```

Erwartet:

```text
renames/moves aus project-state/ nach project-state/archive/2026-05-29-step544-project-state-batch-a/
keine Kern-Dateien
keine STEP476-STEP497
keine CHANNELPOINTS_*
keine COMMANDS_*
```
