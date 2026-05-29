# Project-State Cleanup Run History

Version: 0.1.0  
Stand: 2026-05-29  
Quelle: konsolidiert aus STEP543-STEP552 und den zugehoerigen NEXT_STEPS-Step-Appends.

## Zweck

Diese Datei rettet den relevanten Inhalt des aktuellen Project-State-Cleanup-Runs, bevor die einzelnen Arbeitsnotizen spaeter archiviert werden.

Sie ist die zentrale Historie fuer den Cleanup-Run ab STEP543.

## Sicherheitsgrundsatz

```text
Keine Funktionalitaet entfernen.
Keine Core-/Current-Dateien verschieben.
Kein git add .
Standard immer Dry-Run.
Apply nur mit explizitem -Apply.
```

## Geschuetzte Dateien

Diese Dateien bleiben aktiv im `project-state` Root:

```text
project-state/CHANGELOG.md
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
project-state/CURRENT_STATUS.md
project-state/FILES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
```

## Cleanup-Run Zusammenfassung

### STEP543 - Project-State Archive Batch Plan

Ziel: Planung fuer erste Project-State-Archivbatches nach den vorherigen Doku-/Scan-Cleanup-Schritten.

Wichtige Entscheidung:

```text
Core-Dateien bleiben aktiv.
Archivierung nur nach Rescue/Dry-Run.
Bestehendes archive/ bleibt unberuehrt.
```

### STEP544 - Project-State Batch A Rescue Dry-Run

Ziel: Batch A vor Archivierung pruefen.

Ergebnis laut Dry-Run:

```text
Planned files: 20
Existing files: 20
Missing files: 0
Protected core files checked: 6
Mode: DRY_RUN_ONLY
```

Batch-A-Dateien waren alte Cleanup-/Scan-Step-Notizen.

### STEP545 - Project-State Batch A Quarantine Move

Ziel: Batch A in Archiv verschieben.

Ergebnis:

```text
Applied moves: 20
Source missing: 0
Target conflicts: 0
Errors: 0
```

Wichtiges Git-Learning:

```text
Archivordner muessen getrackt sein.
Nach Move immer git ls-files auf Zielordner pruefen.
Wenn nur Deletions sichtbar sind, Archivdateien mit git add -f oder gezieltem add pruefen.
```

### STEP546 - Channelpoints/Commands State Consolidation Plan

Ziel: die 18 manuellen Review-Dateien fuer Channelpoints und Commands nicht blind archivieren, sondern zuerst fachlich konsolidieren.

Zielbild:

```text
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
```

### STEP547 - Channelpoints State Consolidation Draft

Ziel: Channelpoints-Einzelstatusdateien in eine aktive Sammelstatusdatei ueberfuehren.

Ergebnis:

```text
project-state/CHANNELPOINTS_CURRENT_STATE.md
```

Wichtige gerettete Punkte:

```text
- Aktuell hoechster dokumentierter Stand: Channelpoints v0.8.0 twitch-auth-scope-check
- Keine Twitch-Schreibzugriffe
- Media Execution Bridge: mediaId -> /api/sound/play Payload
- Lokaler Redemption Execution Flow
- Text-Rewards lokal ausfuehrbar
- Twitch Sync Readiness / Auth-Check
- EventBus-Domain-Events und /api/channelpoints/bus-events
```

### STEP548 - Commands State Consolidation Draft

Ziel: Commands-Einzelstatusdateien in eine aktive Sammelstatusdatei ueberfuehren.

Ergebnis:

```text
project-state/COMMANDS_CURRENT_STATE.md
```

Wichtige gerettete Punkte:

```text
- Aktuell hoechster dokumentierter Stand: Commands Dashboard v0.1.9 preserve modal draft state
- Statusroute ohne Schema-Touch
- Media Playback Payload Bridge zu /api/sound/play
- Safe Modal Editor
- gespeicherte Command-Routings bleiben massgeblich
- Katalogwerte bleiben Vorlagen
- Aktion und optionale Chat-Ausgabe getrennt
- Textausgabe vorbereitet, zentrale Textverwaltung offen
```

### STEP549 - Feature State Archive Plan

Ziel: Planung fuer Archivierung der alten Channelpoints-/Commands-Einzelstatusdateien.

Geschuetzt:

```text
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
```

Geplantes Archivziel:

```text
project-state/archive/2026-05-29-step549-feature-state-notes/
```

### STEP550 - Feature State Archive Dry-Run

Ziel: Dry-Run fuer die 18 alten Feature-State-Dateien.

Ergebnis:

```text
Mode: DRY_RUN_ONLY
Planned files: 18
Source missing: 0
Target conflicts: 0
Protected files checked: 8
Errors: 0
```

### STEP551 - Feature State Archive Apply

Ziel: alte Feature-State-Einzeldateien archivieren.

Ergebnis:

```text
Mode: APPLY
Planned files: 18
Source missing: 0
Target conflicts: 0
Errors: 0
Applied moves: 18
```

Archivziel:

```text
project-state/archive/2026-05-29-step549-feature-state-notes/
```

Wichtiges Git-Ergebnis:

```text
Git erkannte die 18 Dateien als echte Renames.
Commit: STEP551 Archive feature state notes
```

### STEP552 - Project-State Root Verification Scan

Ziel: Root nach STEP551 pruefen.

Ergebnis:

```text
Root md files: 46
Core active checked: 8
Feature-state leftovers in root: 0
Expected archived files: 18
Archive present: 18
Archive missing: 0
Archive extra: 0
STEP root files: 33
NEXT_STEPS append files: 5
Warnings: 38
Errors: 0
```

Interpretation:

```text
Feature-State-Cleanup ist sauber abgeschlossen.
Uebrig sind noch STEP-Dateien und NEXT_STEPS-Appends.
```

## Uebrige Root-Dateien nach STEP552

### Core / aktiv

```text
project-state/CHANGELOG.md
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
project-state/CURRENT_STATUS.md
project-state/FILES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
```

### Cleanup-Run-Notizen Batch A fuer naechste Archivierung

```text
project-state/STEP543_PROJECT_STATE_ARCHIVE_BATCH_PLAN.md
project-state/STEP544_PROJECT_STATE_BATCH_A_RESCUE_DRYRUN.md
project-state/STEP545_PROJECT_STATE_BATCH_A_QUARANTINE_MOVE.md
project-state/STEP546_CHANNELPOINTS_COMMANDS_STATE_CONSOLIDATION_PLAN.md
project-state/STEP547_CHANNELPOINTS_STATE_CONSOLIDATION_DRAFT.md
project-state/STEP548_COMMANDS_STATE_CONSOLIDATION_DRAFT.md
project-state/STEP549_FEATURE_STATE_ARCHIVE_PLAN.md
project-state/STEP550_FEATURE_STATE_ARCHIVE_DRYRUN.md
project-state/STEP551_FEATURE_STATE_ARCHIVE_APPLY.md
project-state/STEP552_PROJECT_STATE_ROOT_VERIFICATION_SCAN.md
project-state/NEXT_STEPS_STEP543_APPEND.md
project-state/NEXT_STEPS_STEP546_APPEND.md
project-state/NEXT_STEPS_STEP547_APPEND.md
project-state/NEXT_STEPS_STEP548_APPEND.md
project-state/NEXT_STEPS_STEP549_APPEND.md
```

## Empfohlene Archivierung fuer Batch A

Geplanter Zielordner:

```text
project-state/archive/2026-05-29-step554-cleanup-run-notes/
```

## Nicht in Batch A aufnehmen

```text
project-state/STEP476_* bis project-state/STEP497_*
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
project-state/Core-Dateien
project-state/archive/*
```

Die STEP476-STEP497-Dateien werden spaeter separat und fachlich sortiert behandelt.

## Naechster Schritt

```text
STEP555 - Cleanup Run Notes Archive Dry-Run
```

Ziel:

```text
Dry-Run fuer Batch A:
10 STEP-Dateien + 5 NEXT_STEPS-Appends
keine Dateien verschieben
Zielordner-Konflikte pruefen
Core-/Current-Dateien schuetzen
```
