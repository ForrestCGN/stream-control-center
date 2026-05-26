# STEP480 - Prompt-/Regelwerksupdate für Modul-Doku, Versionen und EventBus

Stand: 2026-05-26

## Ziel

Der Standard-Prompt und die Arbeitsregeln wurden aktualisiert, damit die neu aufgebauten Modul-Dokus in zukünftigen Chats aktiv genutzt und bei Änderungen gepflegt werden.

## Geändert

```text
project-state/GENERAL_PROJECT_PROMPT.md
docs/current/PROJECT_WORKING_RULES.md
docs/current/MODULE_DOCS_VERSION_EVENTBUS_RULES_2026-05-26.md
docs/modules/README.md
project-state/STEP480_PROMPT_MODULE_DOCS_VERSION_EVENTBUS_RULES.md
```

Außerdem wurden die zentralen project-state-Dateien aktualisiert:

```text
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/TODO.md
```

## Neue verbindliche Regeln

```text
Vor Moduländerungen docs/modules/* prüfen.
Bei Moduländerungen passende docs/modules/*-Doku aktualisieren.
Neue/geänderte Module sollen version/moduleVersion nutzen.
STEP-Nummern bleiben Projekt-/Doku-/ZIP-Kennzeichnung.
EventBus soll schrittweise Kommunikations- und Monitoring-Schicht werden.
Bestehende produktive Flows dürfen nicht ungeprüft ersetzt werden.
```

## EventBus-Zielbild

Module sollen perspektivisch Start/Stop, Status, Health, Heartbeat, Fehler, Warnungen, Queue- und Runtime-Zustände über den Bus melden.

## Bewusst nicht geändert

```text
kein Backend-Code
kein Dashboard-Code
keine Config
keine SQLite
keine Modul-Logik
keine Shoutout-Umsetzung
```

## Nächster fachlicher Schritt

```text
STEP481_SHOUTOUT_DASHBOARD_TABS
```
