# STEP558 - Module / Meta Rules Consolidation Plan

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

STEP558 plant die sichere Konsolidierung von Batch B aus STEP557.

Batch B betrifft die alten `project-state` STEP-Dateien rund um Modul-Dokumentation, Projektregeln, EventBus-/Versionsregeln, Serverlog-Regeln und Handoff-Dokumentationsregeln.

Dieser STEP ist nur ein Plan. Es werden keine Dateien verschoben.

## Ausgangslage laut STEP557

Batch B enthaelt 7 Dateien:

```text
project-state/STEP476_MODULE_DOCS_CORE_HELPERS_DEEP_DIVE.md
project-state/STEP477_MODULE_DOCS_STREAM_MODULES_DEEP_DIVE.md
project-state/STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE.md
project-state/STEP479_MODULE_DOCS_SECONDARY_MODULES_DEEP_DIVE.md
project-state/STEP480_PROMPT_MODULE_DOCS_VERSION_EVENTBUS_RULES.md
project-state/STEP481_SERVER_LOG_MODULE_META_RULES.md
project-state/STEP482_HANDOFF_DOCUMENTATION_UPDATE_RULE.md
```

## Zielbild

Die fachlich wichtigen Regeln und Informationen aus diesen Dateien sollen in aktive, zentrale Dokumente uebernommen werden.

Danach duerfen die 7 STEP-Dateien archiviert werden, aber erst nach Dry-Run und Apply.

## Vorgeschlagene aktive Ziel-Dokumente

### 1. Modul-Dokumentation / Architektur

Ziel:

```text
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
```

Zweck:

```text
- Uebersicht ueber Modul-Doku-Stand
- vorhandene zentrale Helper/Module dokumentieren
- keine Parallelstrukturen erfinden
- bei neuen Modulen Doku-Pflicht festhalten
- echte Projektstruktur als Source of Truth
```

### 2. Projektregeln / Arbeitsregeln

Ziel:

```text
project-state/GENERAL_PROJECT_PROMPT.md
```

Zweck:

```text
- keine Funktionalitaet entfernen
- echte Dateien zuerst pruefen
- versionsnummerierte STEP-/Stable-ZIPs
- keine erfundenen Helper
- EventBus/Modul-Meta-Regeln
- Dokumentation bei neuen Modulen
```

### 3. Aktueller Stand / naechste Regeln

Ziel:

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
```

Zweck:

```text
- aktueller Stand der Dokumentationsbereinigung
- Batch B als naechster Konsolidierungsblock
- nach Konsolidierung Archivierung vorbereiten
```

### 4. Cleanup-Historie

Ziel:

```text
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

Zweck:

```text
- nachvollziehbare Historie der Konsolidierung
- klare Referenz, warum STEP476-STEP482 spaeter archiviert werden duerfen
```

## Sicherheitsregeln

Nicht verschieben und nicht ersetzen:

```text
project-state/CHANGELOG.md
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
project-state/CURRENT_STATUS.md
project-state/FILES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

Keine produktiven Dateien aendern:

```text
backend/**
htdocs/**
config/**
data/**
```

Keine DB-/Secret-/Backup-Dateien anfassen:

```text
*.sqlite
*.db
.env
secrets/**
*.zip
*.7z
system-scan-output/**
```

## Geplanter Ablauf

### STEP559 - Batch B Content Rescue Draft

Inhalte aus STEP476-STEP482 in aktive Dokumente konsolidieren.

Voraussichtliche Dateien:

```text
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

### STEP560 - Batch B Archive Dry-Run

Dry-Run fuer das Archivieren der 7 STEP-Dateien.

Zielordner:

```text
project-state/archive/2026-05-29-step558-module-meta-rules/
```

### STEP561 - Batch B Archive Apply

Nach sauberem Dry-Run werden die 7 Dateien in den Archivordner verschoben.

### STEP562 - Post Batch B Verification

Pruefen:

```text
Batch B root leftovers: 0
Archive present: 7
Core/current docs present
Errors: 0
```

## Erwartetes Ergebnis

Nach Abschluss von Batch B:

```text
- STEP476-STEP482 Inhalte sind in aktiven Ziel-Dokumenten gesichert
- STEP476-STEP482 sind archiviert
- project-state Root ist weiter reduziert
- Regeln fuer Module/Doku/EventBus/Versionen bleiben aktiv auffindbar
```

## Keine Funktionalitaet entfernen

Dieser Plan betrifft nur Dokumentation und Archivierung.

Es werden keine produktiven Funktionen, Module, Routen, Configs, Datenbanken oder Assets entfernt.
