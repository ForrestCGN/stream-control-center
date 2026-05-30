# STEP586_CURRENT_RUN_DOCS_ARCHIVE_APPLY

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

Aktuelle Run-Dokumente aus `project-state` ins Archiv verschieben.

## Script

```text
tools/system-inspection/move_current_run_docs_archive_step586.ps1
```

## Wichtig

Standardmodus ist Dry-Run.

Apply nur mit:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_current_run_docs_archive_step586.ps1 -Apply
```

## Erwartung nach Apply

```text
Mode: APPLY
Planned files: 46
Source missing: 0
Target conflicts: 0
Duplicate planned files: 0
Warnings: 0
Errors: 0
Applied moves: 46
```

## Naechster Schritt

```text
STEP587 - Post Current Run Docs Verification
```
