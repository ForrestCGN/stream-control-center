# STEP546 - Channelpoints/Commands State Consolidation Plan

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

STEP546 plant die fachliche Konsolidierung der manuellen Review-Dateien aus STEP542.

Es werden noch keine Dateien verschoben.

## Hintergrund

STEP542 hat 18 manuelle Review-Dateien im `project-state`-Root erkannt.

Diese Dateien sind keine einfachen Cleanup-/Scan-Fragmente. Sie beschreiben vermutlich konkrete Feature-Staende zu Channelpoints und Commands.

Darum wurden sie in STEP545 bewusst nicht archiviert.

## Betroffene Dateien

### Channelpoints

```text
project-state/CHANNELPOINTS_PRESERVE_MODAL_DRAFT_STATE_v0.7.1.md
project-state/CHANNELPOINTS_EVENTBUS_DOCS_FINAL_POLISH_v0.7.5.md
project-state/CHANNELPOINTS_FRIENDLY_MEDIA_ACTION_EDITOR_v0.6.1.md
project-state/CHANNELPOINTS_MEDIA_EXECUTION_BRIDGE_v0.6.0.md
project-state/CHANNELPOINTS_REDEMPTION_EXECUTION_FLOW_v0.7.2.md
project-state/CHANNELPOINTS_SAFE_MODAL_EDITOR_v0.7.0.md
project-state/CHANNELPOINTS_TEXT_REWARD_REDEMPTION_POLISH_v0.7.3.md
project-state/CHANNELPOINTS_TWITCH_AUTH_SCOPE_CHECK_v0.8.0.md
project-state/CHANNELPOINTS_TWITCH_SYNC_READINESS_v0.7.4.md
```

### Commands

```text
project-state/COMMANDS_PRESERVE_MODAL_DRAFT_STATE_v0.1.9.md
project-state/COMMANDS_ACTION_TYPE_DRIVEN_EDITOR_v0.1.7.md
project-state/COMMANDS_BACKEND_SAFE_EDIT_PARAM_FIX_v0.1.5.md
project-state/COMMANDS_EXACT_SAVED_COMMAND_EDITOR_v0.1.5.md
project-state/COMMANDS_MEDIA_PLAYBACK_PAYLOAD_BRIDGE_v0.1.3.md
project-state/COMMANDS_SAFE_MODAL_EDITOR_v0.1.4.md
project-state/COMMANDS_SEPARATED_ACTION_CHAT_MEDIA_PICKER_v0.1.8.md
project-state/COMMANDS_STATUS_NO_SCHEMA_TOUCH_v0.1.2.md
project-state/COMMANDS_UNIFIED_ACTION_DROPDOWN_TEXT_OUTPUT_v0.1.6.md
```

## Zielbild

Statt viele einzelne Statusnotizen im `project-state`-Root zu behalten, sollen zwei aktive Sammeldateien entstehen:

```text
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
```

Optional zusaetzlich technische Modul-Dokus:

```text
docs/modules/channelpoints/CURRENT_STATE.md
docs/modules/commands/CURRENT_STATE.md
```

Die `project-state`-Dateien bleiben kurz und entscheidungsorientiert. Die `docs/modules`-Dateien koennen spaeter technischer und ausfuehrlicher werden.

## Konsolidierungsregeln

### 1. Keine Funktionalitaet entfernen

Beim Zusammenfassen duerfen keine relevanten Regeln, offenen Punkte oder technischen Besonderheiten verloren gehen.

### 2. Nur aktuelle Fakten uebernehmen

Alte Zwischenschritte werden nicht blind als aktueller Stand uebernommen.

Jeder Punkt wird markiert als:

```text
ACTIVE
DONE
OPEN
VERIFY
HISTORICAL
```

### 3. Unklare Punkte nicht loeschen

Unklare Punkte werden als `VERIFY` uebernommen, nicht entfernt.

### 4. Keine DB-/Schema-Aenderungen

STEP546 ist nur Doku-/Plan-Arbeit.

### 5. Keine produktiven Dateien aendern

Keine Backend-, Dashboard-, Config- oder DB-Dateien werden in diesem STEP veraendert.

## Vorgeschlagene Struktur: CHANNELPOINTS_CURRENT_STATE.md

```text
# CHANNELPOINTS_CURRENT_STATE

## Scope

## Aktueller technischer Stand

## Dashboard/UI

## Reward Sync / Twitch Auth

## Redemption Execution Flow

## Media / Sound / Output Integration

## EventBus / Diagnostics

## Safe Modal Editor / Draft Preservation

## Bekannte Risiken

## Offene Punkte

## Historische Einzeldateien
```

## Vorgeschlagene Struktur: COMMANDS_CURRENT_STATE.md

```text
# COMMANDS_CURRENT_STATE

## Scope

## Aktueller technischer Stand

## Dashboard/UI

## Action Types / Dropdowns

## Chat/Text Output

## Media Playback Bridge

## Safe Modal Editor / Draft Preservation

## Backend Safe-Edit / No Schema Touch

## Bekannte Risiken

## Offene Punkte

## Historische Einzeldateien
```

## Review-Matrix

Jede Einzeldatei soll in STEP547 nach diesem Schema geprueft werden:

```text
sourceFile:
domain: channelpoints|commands
versionHint:
status: ACTIVE|DONE|OPEN|VERIFY|HISTORICAL
importantRules:
activeImplementationNotes:
openQuestions:
archiveAfterConsolidation: yes|no|later
```

## Batch-Plan

### STEP547 - Channelpoints State Consolidation Draft

Ziel:

```text
project-state/CHANNELPOINTS_CURRENT_STATE.md
```

aus den 9 `CHANNELPOINTS_*.md` Dateien erstellen.

Keine Archivierung.

### STEP548 - Commands State Consolidation Draft

Ziel:

```text
project-state/COMMANDS_CURRENT_STATE.md
```

aus den 9 `COMMANDS_*.md` Dateien erstellen.

Keine Archivierung.

### STEP549 - Feature State Archive Plan

Erst nachdem die Sammeldateien geprueft wurden:

```text
project-state/archive/2026-05-29-feature-state-notes/
```

fuer alte Einzeldateien planen.

Keine direkte Archivierung ohne Review.

## Nicht Bestandteil von STEP546

```text
project-state/STEP476_* bis STEP497_*
project-state/archive/*
Backend-Code
Dashboard-Code
Datenbank
Configs
```

Diese Bereiche bleiben fuer spaetere separate Schritte.

## Sicherheitscheck vor STEP547

Vor dem Erstellen der Channelpoints-Sammeldatei:

```powershell
git status
Get-ChildItem .\project-state\CHANNELPOINTS_*.md
```

Vor dem Erstellen der Commands-Sammeldatei:

```powershell
git status
Get-ChildItem .\project-state\COMMANDS_*.md
```

## Abschluss

STEP546 ist ein Plan-Step.

Naechster Schritt:

```text
STEP547 - Channelpoints State Consolidation Draft
```
