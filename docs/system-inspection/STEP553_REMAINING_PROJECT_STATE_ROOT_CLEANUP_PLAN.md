# STEP553 - Remaining Project-State Root Cleanup Plan

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

STEP553 plant die weitere Aufraeumung des `project-state` Root nach STEP552.

Dieser STEP verschiebt noch keine Dateien.

## Grundlage

STEP552 Verification hat bestaetigt:

```text
Feature-state leftovers in root: 0
Archive present: 18
Archive missing: 0
Archive extra: 0
Errors: 0
```

Im `project-state` Root sind danach noch uebrig:

```text
46 Markdown-Dateien gesamt
8 aktive/Core-Dateien
33 STEP*.md Dateien
5 NEXT_STEPS_STEP*_APPEND.md Dateien
```

## Harte Schutzregel

Diese Dateien bleiben aktiv und werden nicht archiviert:

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

## Noch aktive Root-Dateien aus STEP552

### Core / aktiv behalten

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

### NEXT_STEPS Append-Dateien

```text
project-state/NEXT_STEPS_STEP543_APPEND.md
project-state/NEXT_STEPS_STEP546_APPEND.md
project-state/NEXT_STEPS_STEP547_APPEND.md
project-state/NEXT_STEPS_STEP548_APPEND.md
project-state/NEXT_STEPS_STEP549_APPEND.md
```

### STEP476-STEP482: Meta-/Doku-Regeln

```text
project-state/STEP476_MODULE_DOCS_CORE_HELPERS_DEEP_DIVE.md
project-state/STEP477_MODULE_DOCS_STREAM_MODULES_DEEP_DIVE.md
project-state/STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE.md
project-state/STEP479_MODULE_DOCS_SECONDARY_MODULES_DEEP_DIVE.md
project-state/STEP480_PROMPT_MODULE_DOCS_VERSION_EVENTBUS_RULES.md
project-state/STEP481_SERVER_LOG_MODULE_META_RULES.md
project-state/STEP482_HANDOFF_DOCUMENTATION_UPDATE_RULE.md
```

### STEP483-STEP486: Shoutout

```text
project-state/STEP483_SHOUTOUT_DASHBOARD_TABS.md
project-state/STEP484_SHOUTOUT_INBOUND_EVENTSUB_INTEGRATION.md
project-state/STEP485_SHOUTOUT_PRODUCTION_CHECK.md
project-state/STEP486_SHOUTOUT_LIVE_TEST_AND_DECISION_PREP.md
```

### STEP487-STEP488: Communication Bus

```text
project-state/STEP487_COMMUNICATION_BUS_MODULE_CONTRACT.md
project-state/STEP488_COMMUNICATION_BUS_CORE_CONTRACT.md
```

### STEP484 + STEP489-STEP494: Channelpoints Aufbau

```text
project-state/STEP484_CHANNELPOINTS_REWARDS_READONLY_SYNC.md
project-state/STEP489_CHANNELPOINTS_BACKEND_SKELETON.md
project-state/STEP490_CHANNELPOINTS_MODEL_AND_MEDIA_PLAN.md
project-state/STEP491_CHANNELPOINTS_DB_SCHEMA_PREP.md
project-state/STEP492_CHANNELPOINTS_DB_MIGRATION_SAFE.md
project-state/STEP493_CHANNELPOINTS_LOCAL_REWARD_CRUD.md
project-state/STEP494_CHANNELPOINTS_DASHBOARD_BASE.md
```

### STEP495-STEP497: Dashboard/Commands Pattern

```text
project-state/STEP495_DASHBOARD_INTERACTION_SYSTEM_PATTERN.md
project-state/STEP496_COMMANDS_DASHBOARD_ALIGNMENT.md
project-state/STEP497_COMMANDS_STATUS_LIGHT.md
```

### STEP543-STEP552: Cleanup-Run aktuelle Arbeitsnotizen

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
```

## Batch-Vorschlag

### Batch A - aktuelle Cleanup-Run STEP543-STEP552 + NEXT_STEPS Appends

Ziel: aktuelle Cleanup-Arbeitsnotizen in einen Archivordner verschieben, nachdem relevante Inhalte in `CURRENT_STATUS.md`/`NEXT_STEPS.md` oder eine konsolidierte Cleanup-Historie gerettet wurden.

Kandidaten:

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

Geplanter Zielordner:

```text
project-state/archive/2026-05-29-step553-cleanup-run-notes/
```

Vorbedingung:

```text
STEP554 Rescue/Consolidation: Cleanup-Ergebnis in CURRENT_STATUS/NEXT_STEPS oder eigene consolidated Datei uebernehmen.
```

### Batch B - Module Docs / Meta Rules STEP476-STEP482

Diese Dateien enthalten Regeln fuer Modul-Doku, Version/EventBus, Server-Log und Handoff-Doku.

Nicht blind archivieren.

Empfohlen:

```text
docs/system-inspection/MODULE_DOCS_RULES_CONSOLIDATED.md
```

Danach Kandidaten fuer Archiv:

```text
project-state/archive/2026-05-29-step553-module-doc-rules-notes/
```

### Batch C - Communication Bus STEP487-STEP488

Diese Dateien koennen relevant fuer aktive Architektur sein.

Empfohlen erst konsolidieren nach:

```text
docs/backend/COMMUNICATION_BUS_CONTRACT_CONSOLIDATED.md
```

Oder bestehende Communication-Doku aktualisieren, falls bereits vorhanden.

Erst danach archivieren.

### Batch D - Shoutout STEP483-STEP486

Diese Dateien betreffen Shoutout Dashboard/EventSub/Production/Live-Test.

Empfohlen erst konsolidieren nach:

```text
project-state/SHOUTOUT_CURRENT_STATE.md
```

oder

```text
docs/modules/shoutout/CURRENT_STATE.md
```

Danach archivieren.

### Batch E - Channelpoints Aufbau STEP484 + STEP489-STEP494

Diese Dateien duerfen nicht einfach weg, weil sie ggf. Grundlagen zu DB, Migration, Reward-CRUD und Dashboard enthalten.

Da `CHANNELPOINTS_CURRENT_STATE.md` schon existiert, sollen diese Inhalte zuerst gegen diese Datei geprueft und ggf. dort ergaenzt werden.

Danach archivieren.

### Batch F - Dashboard/Commands Pattern STEP495-STEP497

Diese Dateien betreffen Dashboard Interaction Pattern, Commands Alignment und Commands Status Light.

Da `COMMANDS_CURRENT_STATE.md` schon existiert, sollen diese Inhalte gegen Commands-/Dashboard-Doku geprueft werden.

Danach archivieren.

## Empfohlene naechste Steps

### STEP554 - Cleanup Run Notes Rescue + Dry-Run Plan

Ziel:

```text
STEP543-STEP552 + NEXT_STEPS_STEP543/546/547/548/549 Appends konsolidieren.
Noch nichts verschieben.
```

Ergebnisdatei moeglich:

```text
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

### STEP555 - Cleanup Run Notes Archive Dry-Run

Ziel:

```text
Dry-Run fuer Batch A.
```

### STEP556 - Cleanup Run Notes Archive Apply

Ziel:

```text
Apply nur nach sauberem Dry-Run.
```

Danach Batch B-F nacheinander planen, nicht alles gleichzeitig.

## Sicherheitsregeln fuer alle Folge-Batches

```text
- Kein git add .
- Kein Entfernen ohne Rescue/Konsolidierung.
- Core/Current-Dateien nie verschieben.
- Standard immer Dry-Run.
- Apply nur mit explizitem -Apply.
- Zielordner vorab auf Konflikte pruefen.
- Wenn unklar: Datei behalten und als VERIFY markieren.
```

## Abschluss

STEP553 ist ein Plan-Step.

Naechster sinnvoller Schritt:

```text
STEP554 - Cleanup Run Notes Rescue + Dry-Run Plan
```
