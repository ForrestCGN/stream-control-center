# STEP550 - Feature State Archive Dry-Run

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

STEP550 erzeugt einen Dry-Run fuer die spaetere Archivierung der alten Feature-State-Einzeldateien.

Dieser STEP verschiebt keine Dateien.

## Voraussetzung

Aktive Sammelstatusdateien muessen vorhanden sein:

```text
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
```

## Geplanter Zielordner

```text
project-state/archive/2026-05-29-step549-feature-state-notes/
```

## Geplante Quellen

```text
project-state/CHANNELPOINTS_*.md
project-state/COMMANDS_*.md
```

Ausgenommen:

```text
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
```

## Ausfuehren

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\dryrun_feature_state_archive_step550.ps1
```

## Reports

```text
system-scan-output\step550_feature_state_archive_dryrun_summary.txt
system-scan-output\step550_feature_state_archive_dryrun.txt
system-scan-output\step550_feature_state_archive_manifest.md
system-scan-output\step550_feature_state_archive_dryrun.json
```

## Danach

Reports hochladen.

Wenn sauber:

```text
STEP551 - Feature State Archive Apply
```
