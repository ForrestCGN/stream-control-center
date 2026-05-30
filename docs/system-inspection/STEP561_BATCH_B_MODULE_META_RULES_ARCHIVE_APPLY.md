# STEP561 - Batch B Module / Meta Rules Archive Apply

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP561 verschiebt die in STEP560 geprueften Batch-B-Dateien in einen Archivordner.

Standard ist Dry-Run.

Echtes Verschieben passiert nur mit `-Apply`.

## Zielordner

```text
project-state/archive/2026-05-29-step558-module-meta-rules/
```

## Geplante Quellen

```text
project-state/STEP476_MODULE_DOCS_CORE_HELPERS_DEEP_DIVE.md
project-state/STEP477_MODULE_DOCS_STREAM_MODULES_DEEP_DIVE.md
project-state/STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE.md
project-state/STEP479_MODULE_DOCS_SECONDARY_MODULES_DEEP_DIVE.md
project-state/STEP480_PROMPT_MODULE_DOCS_VERSION_EVENTBUS_RULES.md
project-state/STEP481_SERVER_LOG_MODULE_META_RULES.md
project-state/STEP482_HANDOFF_DOCUMENTATION_UPDATE_RULE.md
```

## Geschuetzt

```text
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
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
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_batch_b_module_meta_rules_archive_step561.ps1
```

## Apply

Nur ausfuehren, wenn der Dry-Run exakt passt:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_batch_b_module_meta_rules_archive_step561.ps1 -Apply
```

## Reports

```text
system-scan-output\step561_batch_b_module_meta_rules_archive_apply_report.txt
system-scan-output\step561_batch_b_module_meta_rules_archive_apply_report.json
system-scan-output\step561_batch_b_module_meta_rules_archive_manifest.md
```

## Danach

Nach Apply:

```powershell
git status
git diff --stat
```

Erwartet:

```text
7 alte Batch-B-Dokumente aus project-state Root verschoben
7 Archivdateien unter project-state/archive/2026-05-29-step558-module-meta-rules/
MODULE_AND_META_RULES_CONSOLIDATION.md bleibt aktiv
Core-/Current-Dateien bleiben aktiv
```
