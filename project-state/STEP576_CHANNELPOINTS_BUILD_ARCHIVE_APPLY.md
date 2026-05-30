# STEP576_CHANNELPOINTS_BUILD_ARCHIVE_APPLY

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

Batch E Channelpoints-Build-STEP-Dateien in Archiv verschieben.

## Script

```text
tools/system-inspection/move_channelpoints_build_archive_step576.ps1
```

## Wichtig

Standardmodus ist Dry-Run.

Apply nur mit:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_channelpoints_build_archive_step576.ps1 -Apply
```

## Zielordner

```text
project-state/archive/2026-05-30-step573-channelpoints-build-state/
```

## Naechster Schritt

Nach Apply Reports und Git-Status pruefen, dann STEP577 Verification.
