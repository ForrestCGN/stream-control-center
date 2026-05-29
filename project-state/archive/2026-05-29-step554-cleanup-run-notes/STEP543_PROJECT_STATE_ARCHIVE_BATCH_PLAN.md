# STEP543_PROJECT_STATE_ARCHIVE_BATCH_PLAN

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

Plan für sichere Project-State-Aufräumung erstellen.

## Grundlage

STEP542 hat erkannt:

```text
Project-state files: 926
Active files outside archive: 68
Core active files: 6
Archive candidate files: 44
Manual review files: 18
```

## Kern-Dateien bleiben aktiv

```text
project-state/CHANGELOG.md
project-state/CURRENT_STATUS.md
project-state/FILES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
```

## Batch-A-Empfehlung

Sicherster erster Archivierungsbatch:

```text
NEXT_STEPS_STEP539_APPEND.md
NEXT_STEPS_STEP541_APPEND.md
STEP528 bis STEP542 Cleanup-/Scan-State-Dateien
```

Nicht enthalten:

```text
STEP476 bis STEP497
CHANNELPOINTS_*.md
COMMANDS_*.md
aktive Kern-Dateien
project-state/archive/*
```

## Nächster Schritt

STEP544 Project-State Cleanup Batch A Rescue + Dry-Run.
