# STEP543 – Project-State Archive Batch Plan

Version: 0.1.0  
Stand: 2026-05-29

## Zweck

STEP543 erstellt den Plan für eine sichere Project-State-Aufräumung.

Dieser STEP verschiebt noch keine Dateien.

## Grundlage

STEP542 Project-State-Triage:

```text
Project-state files: 926
Active files outside archive: 68
Buckets: 7
Core active files: 6
Archive candidate files: 44
Manual review files: 18
```

## Schutzregel

Diese Kern-Dateien bleiben aktiv und werden nicht verschoben:

```text
project-state/CHANGELOG.md
project-state/CURRENT_STATUS.md
project-state/FILES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
```

## Nicht anfassen

Bereits vorhandenes Archiv bleibt unverändert:

```text
project-state/archive/*
```

STEP542 hat dort 858 Dateien erkannt. Diese gelten als bestehendes Archiv und werden in diesem Block ignoriert.

## Kandidaten aus STEP542

STEP542 hat 44 Archive-/Triage-Kandidaten außerhalb von `project-state/archive` gefunden.

Diese werden in vier Gruppen einsortiert.

---

# Gruppe A – sehr sichere Archivkandidaten nach Rescue

## A1 – aktuelle Cleanup-/Scan-State-Dateien

Diese Dateien dokumentieren abgeschlossene Cleanup-/Scan-Schritte.

Sie sind wichtig als Verlauf, müssen aber nicht dauerhaft im aktiven `project-state`-Root liegen, sobald die Abschlussstände in den Doku-Dateien gesichert sind.

```text
project-state/STEP528_SYSTEM_SCAN_DOCUMENTATION_CLEANUP_MAP.md
project-state/STEP530_BACKUP_AND_SAFE_CLEANUP_BATCH1.md
project-state/STEP531_DOCS_TODO_AND_CLEANUP_SCAN.md
project-state/STEP532_TODO_RESCUE_AND_DOC_CLEANUP_TRIAGE.md
project-state/STEP533_CURRENT_APPEND_DOCS_CONSOLIDATION_BATCH1.md
project-state/STEP534_CURRENT_STEP_DOCS_CONSOLIDATION_BATCH2.md
project-state/STEP535_TECH_STEP_DOCS_CLEANUP_SCAN.md
project-state/STEP536_TECH_STEP_DOCS_TRIAGE_AND_BATCH_PLAN.md
project-state/STEP536A_ALERT_TECH_DOCS_CONSOLIDATION.md
project-state/STEP536B_SOUND_MEDIA_TECH_DOCS_CONSOLIDATION.md
project-state/STEP536C_VIP_TECH_DOCS_CONSOLIDATION.md
project-state/STEP536D_README_CLIP_MISC_TECH_DOCS_CONSOLIDATION.md
project-state/STEP537_POST_CLEANUP_DOCS_VERIFICATION_SCAN.md
project-state/STEP538_COMMUNICATION_AUDIT_CONSOLIDATION.md
project-state/STEP539_TECH_STEP_DOCS_CLEANUP_COMPLETION.md
project-state/STEP540_TODO_MARKER_TRIAGE_SCAN.md
project-state/STEP541_TODO_MARKER_TRIAGE_FINDINGS.md
project-state/STEP542_PROJECT_STATE_TRIAGE_SCAN.md
```

Empfehlung:

```text
Nach Abschluss von STEP543 in einen neuen Archivordner verschieben:
project-state/archive/2026-05-29-step543-project-state-cleanup/
```

Vorher reicht eine Rescue-/Index-Datei, weil die Inhalte bereits als STEP-Doku unter `docs/system-inspection` oder in Abschlussdokumenten erhalten bleiben.

## A2 – NEXT_STEPS Append-Fragmente

```text
project-state/NEXT_STEPS_STEP539_APPEND.md
project-state/NEXT_STEPS_STEP541_APPEND.md
```

Einordnung:

```text
Diese Append-Dateien wurden für abgeschlossene Schritte erstellt.
Der relevante Inhalt ist in STEP539/STEP541 und NEXT_STEPS-Kontext dokumentiert.
```

Empfehlung:

```text
Nach Rescue archivieren.
Nicht in NEXT_STEPS.md mergen, außer dort fehlt wirklich ein aktueller Punkt.
```

---

# Gruppe B – ältere Modul-/Projekt-Doku-Step-Fragmente

Diese Dateien gehören zur Modul-Doku-/Prompt-/EventBus-/Serverlog-Regelrunde.

```text
project-state/STEP476_MODULE_DOCS_CORE_HELPERS_DEEP_DIVE.md
project-state/STEP477_MODULE_DOCS_STREAM_MODULES_DEEP_DIVE.md
project-state/STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE.md
project-state/STEP479_MODULE_DOCS_SECONDARY_MODULES_DEEP_DIVE.md
project-state/STEP480_PROMPT_MODULE_DOCS_VERSION_EVENTBUS_RULES.md
project-state/STEP481_SERVER_LOG_MODULE_META_RULES.md
project-state/STEP482_HANDOFF_DOCUMENTATION_UPDATE_RULE.md
```

Einordnung:

```text
Wahrscheinlich historische Übergabe-/Regeldateien.
Inhalte müssen vor Archivierung gegen aktuelle Regeln geprüft werden.
```

Vor Archivierung prüfen:

```text
- GENERAL_PROJECT_PROMPT.md enthält die Regeln noch?
- docs/current/PROJECT_WORKING_RULES.md enthält die Regeln noch?
- docs/current/HANDOFF_DOCUMENTATION_UPDATE_RULE_2026-05-26.md deckt die Handoff-Regel ab?
- Modul-Doku-Regeln sind in aktueller Doku gesichert?
```

Empfehlung:

```text
Nicht zusammen mit Gruppe A blind archivieren.
Erst Rescue-Check, dann separater Batch.
```

---

# Gruppe C – ältere Shoutout-/Channelpoints-/Commands-/Communication-Stände

Diese Dateien gehören zu aktiven oder potentiell noch relevanten Featurebereichen.

```text
project-state/STEP483_SHOUTOUT_DASHBOARD_TABS.md
project-state/STEP484_CHANNELPOINTS_REWARDS_READONLY_SYNC.md
project-state/STEP484_SHOUTOUT_INBOUND_EVENTSUB_INTEGRATION.md
project-state/STEP485_SHOUTOUT_PRODUCTION_CHECK.md
project-state/STEP486_SHOUTOUT_LIVE_TEST_AND_DECISION_PREP.md
project-state/STEP487_COMMUNICATION_BUS_MODULE_CONTRACT.md
project-state/STEP488_COMMUNICATION_BUS_CORE_CONTRACT.md
project-state/STEP489_CHANNELPOINTS_BACKEND_SKELETON.md
project-state/STEP490_CHANNELPOINTS_MODEL_AND_MEDIA_PLAN.md
project-state/STEP491_CHANNELPOINTS_DB_SCHEMA_PREP.md
project-state/STEP492_CHANNELPOINTS_DB_MIGRATION_SAFE.md
project-state/STEP493_CHANNELPOINTS_LOCAL_REWARD_CRUD.md
project-state/STEP494_CHANNELPOINTS_DASHBOARD_BASE.md
project-state/STEP495_DASHBOARD_INTERACTION_SYSTEM_PATTERN.md
project-state/STEP496_COMMANDS_DASHBOARD_ALIGNMENT.md
project-state/STEP497_COMMANDS_STATUS_LIGHT.md
```

Einordnung:

```text
Diese Dateien könnten fachlich noch wertvolle Details für Channelpoints, Commands, Shoutout und Communication Bus enthalten.
```

Empfehlung:

```text
Nicht in Batch A archivieren.
Erst thematisch konsolidieren:
- Channelpoints-Status/Plan
- Commands-Status/Plan
- Shoutout-Status/Plan
- CommunicationBus-Regelstand
```

Danach ggf. separater Archivbatch.

---

# Gruppe D – Archiv-/Move-Liste

```text
project-state/PROJECT_STATE_ARCHIVE_MOVE_LIST_2026-05-26.csv
```

Einordnung:

```text
Große technische Move-Liste.
Nicht aktive Projektsteuerung, aber Nachweis für frühere Archivierung.
```

Empfehlung:

```text
Kann wahrscheinlich archiviert werden.
Vorher prüfen, ob sie noch in docs/current oder project-state referenziert wird.
```

---

# Gruppe E – manuelle Review-Dateien

STEP542 fand 18 manuelle Review-Dateien.

```text
project-state/CHANNELPOINTS_PRESERVE_MODAL_DRAFT_STATE_v0.7.1.md
project-state/COMMANDS_PRESERVE_MODAL_DRAFT_STATE_v0.1.9.md
project-state/CHANNELPOINTS_EVENTBUS_DOCS_FINAL_POLISH_v0.7.5.md
project-state/CHANNELPOINTS_FRIENDLY_MEDIA_ACTION_EDITOR_v0.6.1.md
project-state/CHANNELPOINTS_MEDIA_EXECUTION_BRIDGE_v0.6.0.md
project-state/CHANNELPOINTS_REDEMPTION_EXECUTION_FLOW_v0.7.2.md
project-state/CHANNELPOINTS_SAFE_MODAL_EDITOR_v0.7.0.md
project-state/CHANNELPOINTS_TEXT_REWARD_REDEMPTION_POLISH_v0.7.3.md
project-state/CHANNELPOINTS_TWITCH_AUTH_SCOPE_CHECK_v0.8.0.md
project-state/CHANNELPOINTS_TWITCH_SYNC_READINESS_v0.7.4.md
project-state/COMMANDS_ACTION_TYPE_DRIVEN_EDITOR_v0.1.7.md
project-state/COMMANDS_BACKEND_SAFE_EDIT_PARAM_FIX_v0.1.5.md
project-state/COMMANDS_EXACT_SAVED_COMMAND_EDITOR_v0.1.5.md
project-state/COMMANDS_MEDIA_PLAYBACK_PAYLOAD_BRIDGE_v0.1.3.md
project-state/COMMANDS_SAFE_MODAL_EDITOR_v0.1.4.md
project-state/COMMANDS_SEPARATED_ACTION_CHAT_MEDIA_PICKER_v0.1.8.md
project-state/COMMANDS_STATUS_NO_SCHEMA_TOUCH_v0.1.2.md
project-state/COMMANDS_UNIFIED_ACTION_DROPDOWN_TEXT_OUTPUT_v0.1.6.md
```

Einordnung:

```text
Diese Dateien sehen aus wie aktuelle Feature-State-Notizen.
Sie sollten nicht automatisch archiviert werden.
```

Empfehlung:

```text
Separater manueller Review.
Möglicherweise in je eine Sammeldoku überführen:
- project-state/CHANNELPOINTS_CURRENT_STATE.md
- project-state/COMMANDS_CURRENT_STATE.md
```

---

# Empfohlene Reihenfolge

## STEP544 – Project-State Cleanup Batch A Rescue + Dry-Run

Ziel:

```text
Gruppe A1 + A2 + ggf. D retten und Dry-Run für Archivierung vorbereiten.
```

Noch nicht direkt anwenden.

## STEP545 – Project-State Batch A Quarantine

Ziel:

```text
Nur nach erfolgreichem Dry-Run die sicheren Dateien nach project-state/archive/2026-05-29-step543-project-state-cleanup/ verschieben.
```

## STEP546 – Channelpoints/Commands State Consolidation Plan

Ziel:

```text
Gruppe C/E fachlich prüfen und ggf. in aktuelle Sammelstatusdateien überführen.
```

## STEP547 – Project-State Core Refresh

Ziel:

```text
CURRENT_STATUS.md
NEXT_STEPS.md
TODO.md
FILES.md
CHANGELOG.md
GENERAL_PROJECT_PROMPT.md
```

nur aktualisieren, wenn echte neue Erkenntnisse übernommen werden müssen.

---

# Batch A Ziel-Liste

Für den ersten echten Move-Batch geeignet:

```text
project-state/NEXT_STEPS_STEP539_APPEND.md
project-state/NEXT_STEPS_STEP541_APPEND.md
project-state/STEP528_SYSTEM_SCAN_DOCUMENTATION_CLEANUP_MAP.md
project-state/STEP530_BACKUP_AND_SAFE_CLEANUP_BATCH1.md
project-state/STEP531_DOCS_TODO_AND_CLEANUP_SCAN.md
project-state/STEP532_TODO_RESCUE_AND_DOC_CLEANUP_TRIAGE.md
project-state/STEP533_CURRENT_APPEND_DOCS_CONSOLIDATION_BATCH1.md
project-state/STEP534_CURRENT_STEP_DOCS_CONSOLIDATION_BATCH2.md
project-state/STEP535_TECH_STEP_DOCS_CLEANUP_SCAN.md
project-state/STEP536_TECH_STEP_DOCS_TRIAGE_AND_BATCH_PLAN.md
project-state/STEP536A_ALERT_TECH_DOCS_CONSOLIDATION.md
project-state/STEP536B_SOUND_MEDIA_TECH_DOCS_CONSOLIDATION.md
project-state/STEP536C_VIP_TECH_DOCS_CONSOLIDATION.md
project-state/STEP536D_README_CLIP_MISC_TECH_DOCS_CONSOLIDATION.md
project-state/STEP537_POST_CLEANUP_DOCS_VERIFICATION_SCAN.md
project-state/STEP538_COMMUNICATION_AUDIT_CONSOLIDATION.md
project-state/STEP539_TECH_STEP_DOCS_CLEANUP_COMPLETION.md
project-state/STEP540_TODO_MARKER_TRIAGE_SCAN.md
project-state/STEP541_TODO_MARKER_TRIAGE_FINDINGS.md
project-state/STEP542_PROJECT_STATE_TRIAGE_SCAN.md
```

Optional nach Referenzprüfung:

```text
project-state/PROJECT_STATE_ARCHIVE_MOVE_LIST_2026-05-26.csv
```

## Batch A nicht enthalten

Nicht enthalten:

```text
project-state/STEP476_... bis STEP497_...
project-state/CHANNELPOINTS_*.md
project-state/COMMANDS_*.md
project-state/CHANGELOG.md
project-state/CURRENT_STATUS.md
project-state/FILES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/archive/*
```

## Sicherheitsregeln für den späteren Move

```text
- Vor Move: Rescue-/Index-Datei erstellen.
- Dry-Run muss exakt die Ziel-Liste zeigen.
- Quarantine/Move erst nach Review.
- Zielordner im Archiv eindeutig benennen.
- Kein git add .
- Kein Löschen ohne Quarantine.
- Keine Kern-Dateien verschieben.
```

## Abschluss

STEP543 ist nur ein Plan.

Nächster sinnvoller Schritt:

```text
STEP544 Project-State Cleanup Batch A Rescue + Dry-Run
```
