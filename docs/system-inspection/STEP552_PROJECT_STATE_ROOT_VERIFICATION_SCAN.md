# STEP552 - Project-State Root Verification Scan

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

STEP552 prueft den `project-state` Root nach STEP551.

Geprueft wird:

```text
- alte CHANNELPOINTS_*.md / COMMANDS_*.md nicht mehr im Root
- CHANNELPOINTS_CURRENT_STATE.md und COMMANDS_CURRENT_STATE.md bleiben aktiv
- 18 Feature-State-Dateien liegen im Archivordner
- Core-Dateien bleiben vorhanden
- uebrige STEP-/NEXT_STEPS-Append-Dateien werden fuer spaetere Batches gelistet
```

## Script

```text
tools/system-inspection/verify_project_state_root_step552.ps1
```

## Ausfuehren

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\verify_project_state_root_step552.ps1
```

## Reports

```text
system-scan-output\step552_project_state_root_verification_summary.txt
system-scan-output\step552_project_state_root_files.txt
system-scan-output\step552_feature_state_archive_verification.txt
system-scan-output\step552_project_state_root_verification.json
```

## Erwartet

```text
Feature-state leftovers in root: 0
Archive present: 18
Archive missing: 0
Errors: 0
```

Warnings fuer verbleibende STEP-/Append-Dateien sind okay und dienen dem naechsten Batch.
