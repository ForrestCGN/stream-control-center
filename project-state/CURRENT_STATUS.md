# CURRENT_STATUS

## Stand: CAN-42.6b vorbereitet

CAN-42.6b ergänzt das Projekt-ToDo: Alle Module sollen nach und nach auf den standardisierten Diagnose-Block geprüft/angeglichen werden. Alte Diagnose-Module/-Extensions sollen danach entfernt/deaktiviert werden, soweit die zentrale Diagnose die Informationen abbildet.

## Todo Referenzstatus

`GET /api/todo/status` liefert jetzt erfolgreich:

```text
diagnostics.ok = true
diagnostics.health = ok
diagnostics.counts.targets = 4
diagnostics.counts.channelsConfigured = 4
diagnostics.counts.channelsTotal = 4
diagnostics.counts.missingChannels = 0
diagnostics.counts.userStats = 10
diagnostics.counts.dailyStats = 27
diagnostics.counts.settings = 5
diagnostics.counts.textVariants = 13
diagnostics.counts.legacyTexts = 13
```

## Änderung CAN-42.6b

Geändert:

```text
project-state/TODO.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/DIAGNOSTICS_STANDARD_ALL_MODULES_TODO_CAN42_6B.md
docs/current/CURRENT_CHAT_HANDOFF_CAN42_6B.md
```

Nicht geändert:

```text
backend/*
htdocs/dashboard/*
```

## Nächster Schritt

```text
CAN-42.7 - Admin-Diagnose liest Todo diagnostics-Block bevorzugt.
```
