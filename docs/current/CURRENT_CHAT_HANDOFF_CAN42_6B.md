# Current Chat Handoff - CAN42.6b

## Projekt

ForrestCGN `stream-control-center`

```text
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Produktive SQLite-DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Aktueller Stand

CAN-42.6b vorbereitet: Projektweites ToDo für Diagnose-Standardisierung ergänzt.

## Neue ToDo-Regel

```text
Alle Module auf standardisierten diagnostics-Block prüfen/angleichen.
Alte Diagnose-Module/-Extensions aus Modul-Seiten entfernen/deaktivieren, sobald zentral abgebildet.
Keine Funktionalität entfernen.
```

## Todo Referenz

Todo `/api/todo/status` liefert erfolgreich:

```text
diagnostics.ok = true
diagnostics.health = ok
diagnostics.counts.userStats = 10
diagnostics.counts.dailyStats = 27
diagnostics.counts.settings = 5
diagnostics.counts.textVariants = 13
diagnostics.counts.legacyTexts = 13
```

## Geändert

```text
project-state/TODO.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/DIAGNOSTICS_STANDARD_ALL_MODULES_TODO_CAN42_6B.md
docs/current/CURRENT_CHAT_HANDOFF_CAN42_6B.md
```

## Nicht geändert

```text
backend/*
htdocs/dashboard/*
```

## Nächster Schritt

```text
CAN-42.7 - Admin-Diagnose liest Todo diagnostics-Block bevorzugt.
```
