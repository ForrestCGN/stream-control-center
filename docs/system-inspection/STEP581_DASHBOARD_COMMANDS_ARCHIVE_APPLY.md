# STEP581 - Dashboard Commands Archive Apply

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP581 verschiebt die in STEP580 geprueften Dashboard-/Commands-STEP-Dateien in den Archivordner.

Standard ist Dry-Run.

Echtes Verschieben passiert nur mit `-Apply`.

## Zielordner

```text
project-state/archive/2026-05-30-step578-dashboard-commands-state/
```

## Geplante Quellen

```text
project-state/STEP495_DASHBOARD_INTERACTION_SYSTEM_PATTERN.md
project-state/STEP496_COMMANDS_DASHBOARD_ALIGNMENT.md
project-state/STEP497_COMMANDS_STATUS_LIGHT.md
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

## Dry-Run

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_dashboard_commands_archive_step581.ps1
```

## Apply

Nur ausfuehren, wenn der Dry-Run exakt passt:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_dashboard_commands_archive_step581.ps1 -Apply
```

## Reports

```text
system-scan-output\step581_dashboard_commands_archive_apply_report.txt
system-scan-output\step581_dashboard_commands_archive_apply_report.json
system-scan-output\step581_dashboard_commands_archive_manifest.md
```

## Erwartet nach Apply

```text
Mode: APPLY
Planned files: 3
Source missing: 0
Target conflicts: 0
Warnings: 0
Errors: 0
Applied moves: 3
```

## Danach

Nach Apply:

```powershell
git status
git diff --stat
```

Danach Commit und STEP582 Verification.
