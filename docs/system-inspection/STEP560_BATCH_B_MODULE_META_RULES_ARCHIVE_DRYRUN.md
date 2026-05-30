# STEP560 - Batch B Module / Meta Rules Archive Dry-Run

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

Dry-Run fuer das Archivieren von Batch B.

Dieser STEP verschiebt keine Dateien.

## Voraussetzung

Die Inhalte aus Batch B wurden in STEP559 gesichert:

```text
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
```

## Geplanter Zielordner

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

## Ausfuehren

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\dryrun_batch_b_module_meta_rules_archive_step560.ps1
```

## Reports

```text
system-scan-output\step560_batch_b_module_meta_rules_archive_dryrun_summary.txt
system-scan-output\step560_batch_b_module_meta_rules_archive_dryrun.txt
system-scan-output\step560_batch_b_module_meta_rules_archive_manifest.md
system-scan-output\step560_batch_b_module_meta_rules_archive_dryrun.json
```

## Erwartet

```text
Planned files: 7
Source missing: 0
Target conflicts: 0
Errors: 0
```

## Danach

Wenn sauber:

```text
STEP561 - Batch B Module / Meta Rules Archive Apply
```
