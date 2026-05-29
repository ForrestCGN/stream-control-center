# STEP549 - Feature State Archive Plan

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

STEP549 plant die Archivierung der alten Feature-State-Einzeldateien fuer Channelpoints und Commands.

Dieser STEP verschiebt noch keine Dateien.

## Voraussetzung

Die aktiven Sammelstatusdateien wurden vorbereitet:

```text
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
```

Diese Dateien bleiben aktiv und werden nicht archiviert.

## Hintergrund

In STEP547 wurde der Channelpoints-Stand konsolidiert.

In STEP548 wurde der Commands-Stand konsolidiert.

Die alten Einzeldateien bleiben fachlich wertvoll, sollen aber nicht dauerhaft das aktive `project-state`-Root ueberfuellen.

## Schutzregel

Nicht archivieren:

```text
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
project-state/CHANGELOG.md
project-state/CURRENT_STATUS.md
project-state/FILES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/archive/*
```

## Archivziel

Geplanter Zielordner:

```text
project-state/archive/2026-05-29-step549-feature-state-notes/
```

## Batch A - Channelpoints Einzeldateien

Diese Dateien sind Kandidaten fuer die spaetere Archivierung:

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

Vor Archivierung pruefen:

```text
project-state/CHANNELPOINTS_CURRENT_STATE.md ist vorhanden.
Alle wesentlichen Punkte aus den 9 Einzeldateien sind dort enthalten.
Unklare Punkte stehen als VERIFY oder OPEN.
```

## Batch B - Commands Einzeldateien

Diese Dateien sind Kandidaten fuer die spaetere Archivierung:

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

Vor Archivierung pruefen:

```text
project-state/COMMANDS_CURRENT_STATE.md ist vorhanden.
Alle wesentlichen Punkte aus den 9 Einzeldateien sind dort enthalten.
Unklare Punkte stehen als VERIFY oder OPEN.
```

## Nicht Bestandteil von STEP549

```text
project-state/STEP476_* bis STEP497_*
project-state/archive/*
Backend-Code
Dashboard-Code
Datenbank
Configs
```

Diese Bereiche bleiben fuer spaetere separate Schritte.

## Empfohlene Folge-Steps

### STEP550 - Feature State Archive Dry-Run

Ziel:

```text
Dry-Run fuer die 18 alten Einzeldateien.
Keine Datei verschieben.
Pruefen, ob CHANNELPOINTS_CURRENT_STATE.md und COMMANDS_CURRENT_STATE.md existieren.
Pruefen, ob Zielordner frei ist.
```

### STEP551 - Feature State Archive Apply

Ziel:

```text
Nur nach sauberem STEP550-Dry-Run die 18 Einzeldateien in den Archivordner verschieben.
```

### STEP552 - Project-State Root Verification Scan

Ziel:

```text
project-state Root erneut scannen.
Pruefen, ob nur aktive Kern-, Current-State- und Plan-Dateien uebrig sind.
```

## Sicherheitsregeln fuer STEP550/STEP551

```text
- Standard muss Dry-Run sein.
- Apply nur mit explizitem -Apply.
- Zielordner darf keine Zielkonflikte enthalten.
- Quelle muss vollstaendig vorhanden sein.
- Keine Current-State-Dateien verschieben.
- Keine Core-Dateien verschieben.
- Keine STEP476-STEP497-Dateien mitnehmen.
- Kein git add .
```

## Erwartetes Ergebnis nach STEP551

Im aktiven project-state Root bleiben:

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

Plus ggf. aktuelle STEP-Dokumente bis sie selbst spaeter archiviert werden.

Die alten Einzeldateien liegen dann unter:

```text
project-state/archive/2026-05-29-step549-feature-state-notes/
```

## Abschluss

STEP549 ist ein Plan-Step.

Naechster sinnvoller Schritt:

```text
STEP550 - Feature State Archive Dry-Run
```
