# STEP551_FEATURE_STATE_ARCHIVE_APPLY

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

Alte Feature-State-Einzeldateien in Archiv verschieben.

## Script

```text
tools/system-inspection/move_feature_state_archive_step551.ps1
```

## Wichtig

Standardmodus ist Dry-Run.

Apply nur mit:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_feature_state_archive_step551.ps1 -Apply
```

## Zielordner

```text
project-state/archive/2026-05-29-step549-feature-state-notes/
```

## Naechster Schritt

Nach Apply Reports und Git-Status pruefen.
