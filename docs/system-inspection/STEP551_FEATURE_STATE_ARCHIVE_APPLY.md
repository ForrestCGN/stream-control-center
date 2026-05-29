# STEP551 - Feature State Archive Apply

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

STEP551 verschiebt die in STEP550 geprueften 18 alten Feature-State-Einzeldateien in einen Archivordner.

Standard ist Dry-Run.

Echtes Verschieben passiert nur mit `-Apply`.

## Zielordner

```text
project-state/archive/2026-05-29-step549-feature-state-notes/
```

## Geschuetzt

Diese Dateien bleiben aktiv:

```text
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
project-state/CHANGELOG.md
project-state/CURRENT_STATUS.md
project-state/FILES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
```

## Dry-Run

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_feature_state_archive_step551.ps1
```

## Apply

Nur ausfuehren, wenn der Dry-Run exakt passt:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\move_feature_state_archive_step551.ps1 -Apply
```

## Reports

```text
system-scan-output\step551_feature_state_archive_apply_report.txt
system-scan-output\step551_feature_state_archive_apply_report.json
system-scan-output\step551_feature_state_archive_manifest.md
```

## Danach

Nach Apply:

```powershell
git status
git diff --stat
```

Erwartet:

```text
18 alte CHANNELPOINTS_/COMMANDS_-Einzeldateien aus project-state Root geloescht/verschoben
18 Archivdateien unter project-state/archive/2026-05-29-step549-feature-state-notes/
Current-State-Dateien bleiben aktiv
```
