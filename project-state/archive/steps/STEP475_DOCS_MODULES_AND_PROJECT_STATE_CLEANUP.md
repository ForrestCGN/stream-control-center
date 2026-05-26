# STEP475_DOCS_MODULES_AND_PROJECT_STATE_CLEANUP

## Ziel

Reine Aufräum- und Doku-Arbeit nach STEP474.

Dieser STEP soll:

- einzelne Modulbereiche erstmals unter `docs/modules/` dokumentieren,
- den `project-state`-Root aufräumbar machen,
- alte STEP-/APPEND-/Snapshot-Dateien nicht löschen, sondern eine saubere Archivstruktur vorbereiten,
- den nächsten Fach-STEP Shoutout-Dashboard-Tabs sauber stehen lassen.

## Betroffene Dateien

```text
docs/modules/
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/PROJECT_STATE_CLEANUP_PLAN_2026-05-26.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/PROJECT_STATE_ARCHIVE_MOVE_LIST_2026-05-26.csv
project-state/archive/*/README.md
project-state/STEP475_DOCS_MODULES_AND_PROJECT_STATE_CLEANUP.md
tools/project_state_archive_step475.ps1
```

## Was geändert wurde

- `docs/modules/` als neue Modul-Doku-Ebene ergänzt.
- Erste Modul-Dokus aus dem aktuellen Backend-Upload erstellt.
- Project-State-Cleanup-Plan erstellt.
- Archiv-Zielordner unter `project-state/archive/` vorbereitet.
- Move-Script ergänzt, das alte Dateien aus `project-state/` in Archiv-Unterordner verschiebt.

## Was bewusst nicht geändert wurde

- keine Backend-Logik
- keine Dashboard-Logik
- keine Overlay-Dateien
- keine Config-Dateien
- keine Datenbankdateien
- keine Runtime-Dateien
- keine produktive Shoutout-Änderung

## Hinweise zum Move-Script

Das ZIP selbst kann vorhandene Dateien im `project-state`-Root nicht entfernen. Deshalb liegt ein Script bei:

```text
tools/project_state_archive_step475.ps1
```

Das Script:

- löscht keine Dateien,
- verschiebt nur Dateien aus `project-state/`,
- behält zentrale Arbeitsdateien wie `CURRENT_STATUS.md`, `CHANGELOG.md`, `FILES.md`, `NEXT_STEPS.md`, `TODO.md` und `GENERAL_PROJECT_PROMPT.md` im Root,
- legt Archiv-Unterordner automatisch an.

## Tests

Keine JS-Dateien geändert, daher kein `node --check` nötig.

Prüfen:

```bat
dir docs\modules\README.md
dir docs\modules\clip-shoutout-vso.md
dir docs\current\PROJECT_STATE_CLEANUP_PLAN_2026-05-26.md
```

Optionales physisches Aufräumen:

```powershell
powershell -ExecutionPolicy Bypass -File tools\project_state_archive_step475.ps1
```

## Nächster STEP

```text
STEP476_SHOUTOUT_DASHBOARD_TABS
```
