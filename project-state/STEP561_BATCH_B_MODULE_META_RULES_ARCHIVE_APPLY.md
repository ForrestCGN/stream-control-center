# STEP561_BATCH_B_MODULE_META_RULES_ARCHIVE_APPLY

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

Batch-B-Dateien STEP476-STEP482 in Archiv verschieben.

## Script

```text
tools/system-inspection/move_batch_b_module_meta_rules_archive_step561.ps1
```

## Wichtig

Standardmodus ist Dry-Run.

Apply nur mit:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_batch_b_module_meta_rules_archive_step561.ps1 -Apply
```

## Zielordner

```text
project-state/archive/2026-05-29-step558-module-meta-rules/
```

## Naechster Schritt

Nach Apply Reports und Git-Status pruefen.
