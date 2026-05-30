# STEP571 - Shoutout Archive Apply

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP571 verschiebt die in STEP570 geprueften Shoutout-STEP-Dateien in den Archivordner.

Standard ist Dry-Run.

Echtes Verschieben passiert nur mit `-Apply`.

## Zielordner

```text
project-state/archive/2026-05-30-step568-shoutout-state/
```

## Geplante Quellen

```text
project-state/STEP483_SHOUTOUT_DASHBOARD_TABS.md
project-state/STEP484_SHOUTOUT_INBOUND_EVENTSUB_INTEGRATION.md
project-state/STEP485_SHOUTOUT_PRODUCTION_CHECK.md
project-state/STEP486_SHOUTOUT_LIVE_TEST_AND_DECISION_PREP.md
```

## Geschuetzt

```text
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
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_shoutout_archive_step571.ps1
```

## Apply

Nur ausfuehren, wenn der Dry-Run exakt passt:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_shoutout_archive_step571.ps1 -Apply
```

## Reports

```text
system-scan-output\step571_shoutout_archive_apply_report.txt
system-scan-output\step571_shoutout_archive_apply_report.json
system-scan-output\step571_shoutout_archive_manifest.md
```

## Erwartet nach Apply

```text
Mode: APPLY
Planned files: 4
Source missing: 0
Target conflicts: 0
Warnings: 0
Errors: 0
Applied moves: 4
```

## Danach

Nach Apply:

```powershell
git status
git diff --stat
```

Danach Commit und STEP572 Verification.
