# STEP556_CLEANUP_RUN_NOTES_ARCHIVE_APPLY

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

Cleanup-Run-Notizen STEP543-STEP552 plus NEXT_STEPS-Appends in Archiv verschieben.

## Script

```text
tools/system-inspection/move_cleanup_run_notes_archive_step556.ps1
```

## Wichtig

Standardmodus ist Dry-Run.

Apply nur mit:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_cleanup_run_notes_archive_step556.ps1 -Apply
```

## Zielordner

```text
project-state/archive/2026-05-29-step554-cleanup-run-notes/
```

## Naechster Schritt

Nach Apply Reports und Git-Status pruefen.
