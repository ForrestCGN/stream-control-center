# STEP578 - Dashboard Commands State Consolidation Plan

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP578 plant die sichere Konsolidierung von Batch F aus STEP577.

Batch F betrifft die letzten fachlichen `project-state` Root-Dateien rund um Dashboard-/Commands-Angleichung:

```text
project-state/STEP495_DASHBOARD_INTERACTION_SYSTEM_PATTERN.md
project-state/STEP496_COMMANDS_DASHBOARD_ALIGNMENT.md
project-state/STEP497_COMMANDS_STATUS_LIGHT.md
```

Dieser STEP ist nur ein Plan. Es werden keine Dateien verschoben.

## Quellenlage

### STEP495 - Dashboard Interaction System Pattern

Kernaussagen:

```text
- Kanalpunkte-Dashboard nicht als lange Einzel-Seite weiterfuehren.
- Bedienmuster am Command-System orientieren.
- htdocs/dashboard/modules/channelpoints.js neu strukturiert.
- htdocs/dashboard/modules/channelpoints.css erweitert.
- Tabs: Uebersicht, Rewards, Kategorien, Aktionen, Medien, Einloesungen, Twitch Sync.
- Suche und Filter: Name/Key/Textsuche, Kategorie, lokaler Status, Aktionstyp.
- Reward-Liste links, Detail-/Editorbereich rechts.
- Editor-Abschnitte: Basis, Aktion, Medien, Regeln.
- Medien bleiben ueber bestehendes MediaField/MediaPicker-System angebunden.
```

Nicht geaendert:

```text
Keine Backend-Aenderung.
Keine Twitch-Schreibaktionen.
Keine DB-Migration.
Kein neues Upload-System.
```

### STEP496 - Commands Dashboard Alignment

Kernaussagen:

```text
- Command-Dashboard optisch und strukturell naeher an Kanalpunkte-Dashboard.
- Ziel: beide Systeme fast gleich bedienen koennen.
- Geaendert: htdocs/dashboard/modules/commands.css.
- Bestehende API- und JS-Logik bleibt.
- Liste links / Detail rechts visuell betont.
- Cards, Pills, Tabs, Inputs und Editorflaechen im gleichen Neon-/Glass-Stil.
- Hinweistext im Command-Modul erklaert gemeinsamen Bedienansatz.
```

Nicht geaendert:

```text
Kein Backend.
Keine Datenbank.
Keine Command-Ausfuehrungslogik.
Keine Twitch-/Streamer.bot-Logik.
Keine neue Funktionalitaet entfernt.
```

### STEP497 - Commands Status Light

Kernaussagen:

```text
- /api/commands/status beschleunigt.
- Vorher ca. 7,55 Sekunden.
- Route liefert nicht mehr commands, moduleCatalog, recent direkt.
- Stattdessen Verweise auf:
  /api/commands/list
  /api/commands/catalog
  /api/commands/logs?limit=10
```

Ziel:

```text
/api/commands/status soll deutlich schneller reagieren.
```

## Konsolidiertes Zielbild

Die aktive Referenz soll sichern:

```text
- Dashboard-Pattern fuer Channelpoints und Commands soll einheitlicher sein.
- Channelpoints-Dashboard nutzt Tabs/Filter/List-Detail-Pattern.
- Commands-Dashboard wird optisch/strukturell daran angeglichen.
- Commands behalten API-/JS-/Backend-/Ausfuehrungslogik.
- /api/commands/status bleibt leichtgewichtig/schnell.
- Ausfuehrliche Command-Daten liegen auf separaten Routen.
- Keine Twitch-Schreibaktionen.
- Keine DB-Migration.
- Kein neues Upload-System.
- Keine Funktionalitaet entfernen.
```

## Zu sichernde Dashboard-Regeln

```text
Channelpoints:
- Tabs statt langer Einzel-Seite.
- Liste links, Detail/Editor rechts.
- Editor in Basis, Aktion, Medien, Regeln.
- Suche/Filter fuer Name/Key/Text, Kategorie, Status, Aktionstyp.
- Media nur via bestehendem MediaField/MediaPicker.

Commands:
- Optische Naehe zum Channelpoints-Pattern.
- Bestehende API- und JS-Logik bleibt.
- Bestehende Command-Funktionen muessen bedienbar bleiben.
- Commands und Kanalpunkte sollen als Community-Systeme konsistent wirken.
```

## Zu sichernde Commands-API-Regel

```text
GET /api/commands/status bleibt leichtgewichtig.
Status liefert nicht mehr:
- commands
- moduleCatalog
- recent

Detaildaten ueber:
GET /api/commands/list
GET /api/commands/catalog
GET /api/commands/logs?limit=10
```

## Geplanter Ablauf

### STEP579 - Dashboard Commands Content Rescue Draft

Eine aktive Konsolidierungsdatei erstellen:

```text
docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
```

Darin STEP495-STEP497 fachlich sichern.

### STEP580 - Dashboard Commands Archive Dry-Run

Dry-Run fuer Archivierung:

```text
project-state/STEP495_DASHBOARD_INTERACTION_SYSTEM_PATTERN.md
project-state/STEP496_COMMANDS_DASHBOARD_ALIGNMENT.md
project-state/STEP497_COMMANDS_STATUS_LIGHT.md
```

Zielordner:

```text
project-state/archive/2026-05-30-step578-dashboard-commands-state/
```

### STEP581 - Dashboard Commands Archive Apply

Nach sauberem Dry-Run die drei Dateien ins Archiv verschieben.

### STEP582 - Post Dashboard Commands Verification

Pruefen:

```text
Dashboard/Commands leftovers in root: 0
Archive expected: 3
Archive present: 3
Archive missing: 0
Archive extra: 0
DASHBOARD_COMMANDS_CONSOLIDATION.md aktiv
COMMANDS_CURRENT_STATE.md aktiv
CHANNELPOINTS_CURRENT_STATE.md aktiv
Errors: 0
```

## Sicherheitsregeln

Nicht verschieben und nicht ersetzen:

```text
docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md
docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
project-state/CHANGELOG.md
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
project-state/CURRENT_STATUS.md
project-state/FILES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
```

Keine produktiven Dateien anfassen:

```text
backend/**
htdocs/**
config/**
data/**
.env
secrets/**
```

## Keine Funktionalitaet entfernen

Dieser Plan betrifft nur Dokumentation und Archivierung.

Es werden keine produktiven Funktionen, Module, Routen, Configs, Datenbanken, Tokens oder Assets entfernt.
