# STEP580 - Dashboard Commands Archive Dry-Run

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP580 prueft, ob die drei alten Dashboard-/Commands-STEP-Dateien aus Batch F sicher archiviert werden koennen.

Dieser STEP verschiebt nichts.

## Quellen

```text
project-state/STEP495_DASHBOARD_INTERACTION_SYSTEM_PATTERN.md
project-state/STEP496_COMMANDS_DASHBOARD_ALIGNMENT.md
project-state/STEP497_COMMANDS_STATUS_LIGHT.md
```

## Zielordner

```text
project-state/archive/2026-05-30-step578-dashboard-commands-state/
```

## Geschuetzt

```text
docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
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

## Ausfuehren

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\dryrun_dashboard_commands_archive_step580.ps1
```

## Reports

```text
system-scan-output\step580_dashboard_commands_archive_manifest.md
system-scan-output\step580_dashboard_commands_archive_dryrun.txt
system-scan-output\step580_dashboard_commands_archive_dryrun_summary.txt
system-scan-output\step580_dashboard_commands_archive_dryrun.json
```

## Erwartet

```text
Mode: DRY_RUN_ONLY
Planned files: 3
Source missing: 0
Target conflicts: 0
Warnings: 0
Errors: 0
```

## Danach

Wenn sauber:

```text
STEP581 - Dashboard Commands Archive Apply
```
