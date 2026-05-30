# STEP566_COMMUNICATION_BUS_ARCHIVE_APPLY

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

Batch-C-Dateien STEP487-STEP488 in Archiv verschieben.

## Script

```text
tools/system-inspection/move_communication_bus_archive_step566.ps1
```

## Wichtig

Standardmodus ist Dry-Run.

Apply nur mit:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_communication_bus_archive_step566.ps1 -Apply
```

## Zielordner

```text
project-state/archive/2026-05-30-step563-communication-bus-contract/
```

## Naechster Schritt

Nach Apply Reports und Git-Status pruefen.
