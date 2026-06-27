# Handoff-Regel: dokumentieren und aktualisieren

Stand: 2026-05-26  
STEP: STEP482_HANDOFF_DOCUMENTATION_UPDATE_RULE

## Zweck

Diese Regel stellt sicher, dass beim Wechsel in einen neuen Chat kein Projektstand verloren geht und die Doku nicht hinter dem echten Systemstand zurückbleibt.

## Auslöser

Wenn Forrest schreibt:

```text
dokumentieren und aktualisieren
```

oder sinngemäß sagt, dass ein neuer Chat vorbereitet werden soll, muss ein Konsolidierungs-STEP durchgeführt werden.

## Pflichtprüfungen

Zu prüfen und bei Bedarf zu aktualisieren:

```text
project-state/GENERAL_PROJECT_PROMPT.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/TODO.md
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/PROJECT_WORKING_RULES.md
docs/modules/README.md
docs/modules/<betroffene-modul-dokus>.md
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_*.md
```

## Was dokumentiert werden muss

```text
- erledigte Arbeiten seit dem letzten Stand
- geänderte Dateien
- neue Dateien
- neue/geänderte Module
- neue/geänderte API-Routen
- neue/geänderte Configs
- neue/geänderte DB-Tabellen oder Migrationen
- neue/geänderte EventBus-/WebSocket-Events
- neue/geänderte Dashboard- oder Overlay-Anbindungen
- erledigte TODOs
- neue TODOs
- bewusst verschobene Punkte
- nächster sinnvoller STEP
```

## Modul-Doku-Pflicht

Wenn seit dem letzten Stand ein Modul geändert oder neu erstellt wurde, muss die passende Datei unter `docs/modules/` aktualisiert oder neu angelegt werden.

Eine Moduländerung gilt nicht als abgeschlossen, wenn die Modul-Doku veraltet bleibt.

## Statusdatei-Regel

Nicht blind eine feste datierte Statusdatei fortschreiben.

Richtig:

```text
1. aktuellste docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_*.md suchen
2. wenn passend: aktualisieren
3. wenn veraltet oder unpassend: neue Statusdatei mit aktuellem Datum anlegen
4. docs/modules/README.md und project-state/FILES.md entsprechend aktualisieren
```

## Zielbild

Ein neuer Chat soll mit `project-state/GENERAL_PROJECT_PROMPT.md` plus den aktuellen `project-state/*`- und `docs/current/*`-Dateien sofort korrekt weiterarbeiten können.
