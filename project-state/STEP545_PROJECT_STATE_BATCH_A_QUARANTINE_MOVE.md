# STEP545_PROJECT_STATE_BATCH_A_QUARANTINE_MOVE

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

Project-State Batch A in Archivordner verschieben.

## Wichtig

Standardmodus ist Dry-Run.

Apply nur mit:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_project_state_batch_a_step545.ps1 -Apply
```

## Zielordner

```text
project-state/archive/2026-05-29-step544-project-state-batch-a/
```

## Naechster Schritt

Nach Apply Reports und `git status` pruefen.
