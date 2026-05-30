# STEP576 - Channelpoints Build Archive Apply

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP576 verschiebt die in STEP575 geprueften Channelpoints-Build-STEP-Dateien in den Archivordner.

Standard ist Dry-Run.

Echtes Verschieben passiert nur mit `-Apply`.

## Zielordner

```text
project-state/archive/2026-05-30-step573-channelpoints-build-state/
```

## Geplante Quellen

```text
project-state/STEP484_CHANNELPOINTS_REWARDS_READONLY_SYNC.md
project-state/STEP489_CHANNELPOINTS_BACKEND_SKELETON.md
project-state/STEP490_CHANNELPOINTS_MODEL_AND_MEDIA_PLAN.md
project-state/STEP491_CHANNELPOINTS_DB_SCHEMA_PREP.md
project-state/STEP492_CHANNELPOINTS_DB_MIGRATION_SAFE.md
project-state/STEP493_CHANNELPOINTS_LOCAL_REWARD_CRUD.md
project-state/STEP494_CHANNELPOINTS_DASHBOARD_BASE.md
```

## Geschuetzt

```text
docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md
docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
project-state/CHANGELOG.md
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
project-state/CURRENT_STATUS.md
project-state/FILES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
```

## Dry-Run

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_channelpoints_build_archive_step576.ps1
```

## Apply

Nur ausfuehren, wenn der Dry-Run exakt passt:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_channelpoints_build_archive_step576.ps1 -Apply
```

## Reports

```text
system-scan-output\step576_channelpoints_build_archive_apply_report.txt
system-scan-output\step576_channelpoints_build_archive_apply_report.json
system-scan-output\step576_channelpoints_build_archive_manifest.md
```

## Erwartet nach Apply

```text
Mode: APPLY
Planned files: 7
Source missing: 0
Target conflicts: 0
Warnings: 0
Errors: 0
Applied moves: 7
```

## Danach

Nach Apply:

```powershell
git status
git diff --stat
```

Danach Commit und STEP577 Verification.
