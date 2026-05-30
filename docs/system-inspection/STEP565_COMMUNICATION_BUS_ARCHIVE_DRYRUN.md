# STEP565 - Communication Bus Archive Dry-Run

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

Dry-Run fuer das Archivieren von Batch C.

Dieser STEP verschiebt keine Dateien.

## Voraussetzung

Die Inhalte aus Batch C wurden in STEP564 gesichert:

```text
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
```

## Geplanter Zielordner

```text
project-state/archive/2026-05-30-step563-communication-bus-contract/
```

## Geplante Quellen

```text
project-state/STEP487_COMMUNICATION_BUS_MODULE_CONTRACT.md
project-state/STEP488_COMMUNICATION_BUS_CORE_CONTRACT.md
```

## Geschuetzt

```text
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
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\dryrun_communication_bus_archive_step565.ps1
```

## Reports

```text
system-scan-output\step565_communication_bus_archive_dryrun_summary.txt
system-scan-output\step565_communication_bus_archive_dryrun.txt
system-scan-output\step565_communication_bus_archive_manifest.md
system-scan-output\step565_communication_bus_archive_dryrun.json
```

## Erwartet

```text
Planned files: 2
Source missing: 0
Target conflicts: 0
Errors: 0
```

## Danach

Wenn sauber:

```text
STEP566 - Communication Bus Archive Apply
```
