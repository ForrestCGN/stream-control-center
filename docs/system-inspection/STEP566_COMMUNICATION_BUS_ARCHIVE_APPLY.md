# STEP566 - Communication Bus Archive Apply

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP566 verschiebt die in STEP565 geprueften Batch-C-Dateien in den Archivordner.

Standard ist Dry-Run.

Echtes Verschieben passiert nur mit `-Apply`.

## Zielordner

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

## Dry-Run

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_communication_bus_archive_step566.ps1
```

## Apply

Nur ausfuehren, wenn der Dry-Run exakt passt:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_communication_bus_archive_step566.ps1 -Apply
```

## Reports

```text
system-scan-output\step566_communication_bus_archive_apply_report.txt
system-scan-output\step566_communication_bus_archive_apply_report.json
system-scan-output\step566_communication_bus_archive_manifest.md
```

## Danach

Nach Apply:

```powershell
git status
git diff --stat
```

Erwartet:

```text
2 alte Batch-C-Dokumente aus project-state Root verschoben
2 Archivdateien unter project-state/archive/2026-05-30-step563-communication-bus-contract/
COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md bleibt aktiv
Core-/Current-Dateien bleiben aktiv
```
