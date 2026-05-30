# STEP583 - Current Run Docs Cleanup Plan

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP583 plant das sichere Aufraeumen der aktuellen Run-Dokumente im `project-state` Root.

Nach STEP582 sind die fachlichen Batches B-F konsolidiert und archiviert:

```text
Batch B: Module/Meta Rules
Batch C: Communication Bus
Batch D: Shoutout
Batch E: Channelpoints Build
Batch F: Dashboard/Commands
```

Die fachlichen Inhalte sind aktiv gesichert in:

```text
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md
docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

Nun sollen die noch im `project-state` Root liegenden aktuellen Run-Dokumente geordnet behandelt werden.

Dieser STEP ist nur ein Plan. Es werden keine Dateien verschoben.

## Ausgangslage laut STEP582

```text
Current run docs still in root: 29
Remaining NEXT_STEPS appends: 12
Warnings: 0
Errors: 0
```

## Betroffene Run-Dokumente

### STEP-Dokumente

```text
project-state/STEP553_REMAINING_PROJECT_STATE_ROOT_CLEANUP_PLAN.md
project-state/STEP554_CLEANUP_RUN_NOTES_RESCUE_AND_DRYRUN_PLAN.md
project-state/STEP555_CLEANUP_RUN_NOTES_ARCHIVE_DRYRUN.md
project-state/STEP556_CLEANUP_RUN_NOTES_ARCHIVE_APPLY.md
project-state/STEP557_POST_CLEANUP_PROJECT_STATE_VERIFICATION_SCAN.md
project-state/STEP558_MODULE_META_RULES_CONSOLIDATION_PLAN.md
project-state/STEP559_BATCH_B_CONTENT_RESCUE_DRAFT.md
project-state/STEP560_BATCH_B_MODULE_META_RULES_ARCHIVE_DRYRUN.md
project-state/STEP561_BATCH_B_MODULE_META_RULES_ARCHIVE_APPLY.md
project-state/STEP562_POST_BATCH_B_VERIFICATION_SCAN.md
project-state/STEP563_COMMUNICATION_BUS_STATE_CONSOLIDATION_PLAN.md
project-state/STEP564_COMMUNICATION_BUS_CONTENT_RESCUE_DRAFT.md
project-state/STEP565_COMMUNICATION_BUS_ARCHIVE_DRYRUN.md
project-state/STEP566_COMMUNICATION_BUS_ARCHIVE_APPLY.md
project-state/STEP567_POST_COMMUNICATION_BUS_VERIFICATION_SCAN.md
project-state/STEP568_SHOUTOUT_STATE_CONSOLIDATION_PLAN.md
project-state/STEP569_SHOUTOUT_CONTENT_RESCUE_DRAFT.md
project-state/STEP570_SHOUTOUT_ARCHIVE_DRYRUN.md
project-state/STEP571_SHOUTOUT_ARCHIVE_APPLY.md
project-state/STEP572_POST_SHOUTOUT_VERIFICATION_SCAN.md
project-state/STEP573_CHANNELPOINTS_BUILD_STATE_CONSOLIDATION_PLAN.md
project-state/STEP574_CHANNELPOINTS_BUILD_CONTENT_RESCUE_DRAFT.md
project-state/STEP575_CHANNELPOINTS_BUILD_ARCHIVE_DRYRUN.md
project-state/STEP576_CHANNELPOINTS_BUILD_ARCHIVE_APPLY.md
project-state/STEP577_POST_CHANNELPOINTS_BUILD_VERIFICATION_SCAN.md
project-state/STEP578_DASHBOARD_COMMANDS_STATE_CONSOLIDATION_PLAN.md
project-state/STEP579_DASHBOARD_COMMANDS_CONTENT_RESCUE_DRAFT.md
project-state/STEP580_DASHBOARD_COMMANDS_ARCHIVE_DRYRUN.md
project-state/STEP581_DASHBOARD_COMMANDS_ARCHIVE_APPLY.md
```

### NEXT_STEPS-Appends

```text
project-state/NEXT_STEPS_STEP553_APPEND.md
project-state/NEXT_STEPS_STEP554_APPEND.md
project-state/NEXT_STEPS_STEP558_APPEND.md
project-state/NEXT_STEPS_STEP559_APPEND.md
project-state/NEXT_STEPS_STEP563_APPEND.md
project-state/NEXT_STEPS_STEP564_APPEND.md
project-state/NEXT_STEPS_STEP568_APPEND.md
project-state/NEXT_STEPS_STEP569_APPEND.md
project-state/NEXT_STEPS_STEP573_APPEND.md
project-state/NEXT_STEPS_STEP574_APPEND.md
project-state/NEXT_STEPS_STEP578_APPEND.md
project-state/NEXT_STEPS_STEP579_APPEND.md
```

## Zielordner

Geplanter Archivordner:

```text
project-state/archive/2026-05-30-step583-current-run-docs/
```

## Warum kein direktes Loeschen?

Diese Dateien dokumentieren den aktuellen Cleanup-Lauf, enthalten aber keine aktiven fachlichen Referenzinformationen mehr, nachdem die Inhalte in aktive `docs/system-inspection/*_CONSOLIDATION.md` und `PROJECT_STATE_CLEANUP_RUN_HISTORY.md` uebernommen wurden.

Trotzdem werden sie nicht geloescht, sondern archiviert.

## Geplanter Ablauf

### STEP584 - Current Run Docs Rescue / History Append

Vor dem Verschieben wird der Run-Verlauf aktiv zusammengefasst und in die Run-History uebernommen:

```text
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

Sichern:

```text
- Abschluss Batch B-F
- aktive Konsolidierungsdateien
- Archivordner
- Verification-Ergebnisse
- verbleibende Root-Aufraeumung
```

Optional wird eine separate technische Plan-/Index-Datei erzeugt:

```text
docs/system-inspection/STEP584_CURRENT_RUN_DOCS_RESCUE_DRAFT.md
```

### STEP585 - Current Run Docs Archive Dry-Run

Dry-Run fuer die 29 STEP-Dateien und 12 NEXT_STEPS-Appends.

Ziel:

```text
project-state/archive/2026-05-30-step583-current-run-docs/
```

Erwartung:

```text
Planned files: 41
Source missing: 0
Target conflicts: 0
Warnings: 0
Errors: 0
```

### STEP586 - Current Run Docs Archive Apply

Nach sauberem Dry-Run werden die 41 Dateien archiviert.

### STEP587 - Post Current Run Docs Verification

Pruefen:

```text
Current run docs in root: 0
NEXT_STEPS_STEP appends in root: 0
Archive expected: 41
Archive present: 41
Archive missing: 0
Archive extra: 0
Core active files present
Errors: 0
```

## Schutzdateien

Nicht verschieben:

```text
project-state/CHANGELOG.md
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
project-state/CURRENT_STATUS.md
project-state/FILES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md
docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

## Nicht betroffen

Keine produktiven Dateien anfassen:

```text
backend/**
htdocs/**
config/**
data/**
.env
secrets/**
```

Keine Archive aus vorherigen Batches anfassen:

```text
project-state/archive/2026-05-29-step558-module-meta-rules/
project-state/archive/2026-05-30-step563-communication-bus-contract/
project-state/archive/2026-05-30-step568-shoutout-state/
project-state/archive/2026-05-30-step573-channelpoints-build-state/
project-state/archive/2026-05-30-step578-dashboard-commands-state/
```

## Keine Funktionalitaet entfernen

Dieser Plan betrifft nur Dokumentation und Archivierung.

Es werden keine produktiven Funktionen, Module, Routen, Configs, Datenbanken, Tokens oder Assets entfernt.
