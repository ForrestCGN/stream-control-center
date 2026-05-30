# STEP571_SHOUTOUT_ARCHIVE_APPLY

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

Batch D Shoutout-STEP-Dateien in Archiv verschieben.

## Script

```text
tools/system-inspection/move_shoutout_archive_step571.ps1
```

## Wichtig

Standardmodus ist Dry-Run.

Apply nur mit:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_shoutout_archive_step571.ps1 -Apply
```

## Zielordner

```text
project-state/archive/2026-05-30-step568-shoutout-state/
```

## Naechster Schritt

Nach Apply Reports und Git-Status pruefen, dann STEP572 Verification.
