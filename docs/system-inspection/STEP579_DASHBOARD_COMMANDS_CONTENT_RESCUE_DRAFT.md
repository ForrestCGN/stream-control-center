# STEP579 - Dashboard Commands Content Rescue Draft

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP579 sichert die relevanten Inhalte aus Batch F in einer aktiven Konsolidierungsdatei.

## Quellen

```text
project-state/STEP495_DASHBOARD_INTERACTION_SYSTEM_PATTERN.md
project-state/STEP496_COMMANDS_DASHBOARD_ALIGNMENT.md
project-state/STEP497_COMMANDS_STATUS_LIGHT.md
```

## Neue aktive Datei

```text
docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
```

## Wichtigste Konsolidierung

```text
Channelpoints und Commands sollen im Dashboard ein konsistentes Bedienmuster verwenden.
Channelpoints nutzt Tabs/Filter/List-Detail-Pattern.
Commands-Dashboard wurde optisch/strukturell angeglichen.
Commands behalten API-/JS-/Backend-/Ausfuehrungslogik.
GET /api/commands/status bleibt leichtgewichtig.
Detaildaten liegen auf /api/commands/list, /api/commands/catalog und /api/commands/logs?limit=10.
```

## Nicht geändert

```text
backend/**
htdocs/**
config/**
data/**
SQLite
Dashboard-Code
Overlay-Code
Runtime-Dateien
.env
secrets/**
Tokens
```

## Nächster Schritt

```text
STEP580 - Dashboard Commands Archive Dry-Run
```
