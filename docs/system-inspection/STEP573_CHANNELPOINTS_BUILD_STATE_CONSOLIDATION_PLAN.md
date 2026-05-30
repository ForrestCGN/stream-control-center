# STEP573 - Channelpoints Build State Consolidation Plan

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP573 plant die sichere Konsolidierung von Batch E aus STEP572.

Batch E betrifft die alten `project-state` STEP-Dateien rund um den Aufbau des Kanalpunkte-Systems:

```text
project-state/STEP484_CHANNELPOINTS_REWARDS_READONLY_SYNC.md
project-state/STEP489_CHANNELPOINTS_BACKEND_SKELETON.md
project-state/STEP490_CHANNELPOINTS_MODEL_AND_MEDIA_PLAN.md
project-state/STEP491_CHANNELPOINTS_DB_SCHEMA_PREP.md
project-state/STEP492_CHANNELPOINTS_DB_MIGRATION_SAFE.md
project-state/STEP493_CHANNELPOINTS_LOCAL_REWARD_CRUD.md
project-state/STEP494_CHANNELPOINTS_DASHBOARD_BASE.md
```

Dieser STEP ist nur ein Plan. Es werden keine Dateien verschoben.

## Quellenlage

### STEP484 - Twitch Rewards Read-Only Sync

Kernaussagen:

```text
- Additives Backend-Modul channelpoints_twitch_readonly_sync.js.
- Version 0.8.1, Build twitch-rewards-readonly-sync.
- Hauptmodul channelpoints.js bleibt unverändert bei 0.8.0.
- Keine Twitch-Schreibzugriffe.
- Keine Twitch Reward Create/Update/Delete Calls.
- Keine Deaktivierung.
- Keine Redemption Status Updates.
- Keine destruktive Migration.
- Keine DB-Ersetzung.
- Bestehende Tabelle channelpoints_rewards.
- Keine neue Tabelle.
- Keine Migration.
- Lokale Upserts nur auf Wunsch per dryRun=false.
```

Gesicherte Routen:

```text
GET  /api/channelpoints/twitch/rewards-readonly/status
GET  /api/channelpoints/twitch/rewards-readonly/preview
POST /api/channelpoints/twitch/rewards-readonly/sync
GET  /api/channelpoints/twitch/rewards
GET  /api/channelpoints/twitch/sync
POST /api/channelpoints/twitch/sync
```

Gesicherte EventBus-Events:

```text
channelpoints.twitch.rewards.read
channelpoints.twitch.rewards.read_failed
channelpoints.twitch.rewards.sync_preview
channelpoints.twitch.rewards.synced
channelpoints.twitch.rewards.sync_failed
```

### STEP489 - Backend Skeleton

Kernaussagen:

```text
- Sicheres Backend-Skeleton fuer Kanalpunkte.
- backend/modules/channelpoints.js erstellt.
- Keine riskanten Twitch-/DB-/Dashboard-Aenderungen.
- Routen: GET /api/channelpoints/status, GET /api/channelpoints/bus-test.
- Bus-Anbindung ueber bestehenden Communication Bus.
- Kein separater Contract-Helper.
```

Bewusst nicht umgesetzt:

```text
keine Twitch Reward-Schreibaktionen
keine Twitch Reward-Synchronisierung
keine Redemption-Verarbeitung
keine DB-Migration
kein Dashboard-Modul
keine Änderung am Command-System
keine Änderung am Sound-System
keine Änderung an helper_communication.js
keine Änderung an communication_bus.js
```

### STEP490 - Model and Media Plan

Kernaussagen:

```text
- channelpoints.js Version 0.2.0.
- Statusmodus backend_model_plan.
- Neue Routen: GET /api/channelpoints/model, GET /api/channelpoints/media-plan.
- Bus-Capabilities: channelpoints.model, channelpoints.media.
- Keine DB-Migration.
- Keine Twitch-Schreibaktionen.
- Keine Reward-Synchronisierung.
- Kein Dashboard-Umbau.
- Kein neues Upload-System.
```

Verbindliche Media-Regel:

```text
Uploads und Medienauswahl fuer Kanalpunkte laufen ueber das bestehende Medien-System:
backend/modules/media.js
htdocs/dashboard/components/media_picker.js
htdocs/dashboard/components/media_field.js

Keine zweite Upload-Maske und keine separate Asset-Verwaltung im Kanalpunkte-Modul.
```

### STEP491 - DB Schema Prep

Kernaussagen:

```text
- Schema nur als sichere Vorschau.
- Keine echte DB-Migration.
- Keine Tabellenanlage in app.sqlite.
- Neue Route: GET /api/channelpoints/schema-preview.
- Erwartung: status=preview_only_no_db_write.
- dbMigrationEnabled=false.
- migrationExecutionImplemented=false.
- sqliteCompatible=true.
```

### STEP492 - DB Migration Safe

Kernaussagen:

```text
- Lokale DB-Grundlage sicher/additiv angelegt.
- channelpoints.js Version 0.4.0.
- Neue Route: GET /api/channelpoints/db-status.
- Schema-Version channelpoints=1.
- Default-Kategorien per INSERT OR IGNORE.
```

Tabellen:

```text
channelpoints_categories
channelpoints_rewards
channelpoints_redemptions
```

Sicherheitsregeln:

```text
produktive SQLite wird erweitert, nicht ersetzt
nur CREATE TABLE IF NOT EXISTS
nur CREATE INDEX IF NOT EXISTS
nur INSERT OR IGNORE
keine bestehenden Daten loeschen
keine Twitch-Schreibaktionen
kein Dashboard-Umbau
kein neues Upload-System
```

### STEP493 - Local Reward CRUD

Kernaussagen:

```text
- Lokale Reward-CRUD-Grundlage.
- APIs fuer Kategorien/Rewards.
- Erstellen/Bearbeiten/Aktivieren/Deaktivieren ist lokal-only.
- Keine Twitch-Schreibaktionen.
```

Gesicherte Routen/Tests:

```text
GET  /api/channelpoints/status
GET  /api/channelpoints/categories
GET  /api/channelpoints/rewards
POST /api/channelpoints/rewards
```

### STEP494 - Dashboard Base

Kernaussagen:

```text
- Erste Dashboard-Basis fuer Kanalpunkte.
- htdocs/dashboard/modules/channelpoints.js.
- htdocs/dashboard/modules/channelpoints.css.
- htdocs/dashboard/index.html erweitert.
- Dashboard-Modul registriert sich bei window.CGN.modules.
- Community-Navigation/Favoriten werden zur Laufzeit um channelpoints erweitert.
- Kategorien/Rewards werden ueber vorhandene APIs geladen.
- Lokales Erstellen/Bearbeiten/Aktivieren/Deaktivieren von Rewards.
- Media-Feld nutzt MediaField/MediaPicker und bestehende Medienverwaltung.
```

Nicht enthalten:

```text
Keine Twitch-Schreibaktionen.
Keine Twitch Reward-Erstellung.
Keine Twitch Reward-Deaktivierung.
Keine neue Upload-Logik.
Keine DB-Schema-Aenderung.
```

## Konsolidiertes Zielbild

Die aktive Referenz soll klar festhalten:

```text
- channelpoints.js ist das zentrale Kanalpunkte-Hauptmodul.
- channelpoints_twitch_readonly_sync.js ist ein additives Read-Only-Sync-Add-on.
- Twitch-Schreibaktionen sind in diesem Stand nicht freigegeben.
- Twitch Reward Create/Update/Delete ist nicht aktiv.
- Redemption Status Updates sind nicht aktiv.
- DB-Migrationen duerfen nur additiv/sicher laufen.
- app.sqlite wird erweitert, nie ersetzt.
- Medien laufen ueber das bestehende Media-System.
- Dashboard arbeitet ueber vorhandene APIs.
- Lokales Reward-CRUD ist lokal-only.
```

## Zu sichernde Routen

```text
GET  /api/channelpoints/status
GET  /api/channelpoints/bus-test
GET  /api/channelpoints/model
GET  /api/channelpoints/media-plan
GET  /api/channelpoints/schema-preview
GET  /api/channelpoints/db-status
GET  /api/channelpoints/categories
GET  /api/channelpoints/rewards
POST /api/channelpoints/rewards
GET  /api/channelpoints/twitch/rewards-readonly/status
GET  /api/channelpoints/twitch/rewards-readonly/preview
POST /api/channelpoints/twitch/rewards-readonly/sync
GET  /api/channelpoints/twitch/rewards
GET  /api/channelpoints/twitch/sync
POST /api/channelpoints/twitch/sync
```

## Zu sichernde DB-Regeln

```text
Core DB: data/sqlite/app.sqlite
Nie ersetzen.
Nie neu bauen.
Keine bestehenden Daten loeschen.
Nur additive Migration.
CREATE TABLE IF NOT EXISTS.
CREATE INDEX IF NOT EXISTS.
INSERT OR IGNORE fuer Seeds.
```

## Zu sichernde Tabellen

```text
channelpoints_categories
channelpoints_rewards
channelpoints_redemptions
```

## Zu sichernde Media-Regel

```text
Kanalpunkte nutzen bestehendes Media-System:
backend/modules/media.js
htdocs/dashboard/components/media_picker.js
htdocs/dashboard/components/media_field.js

Keine zweite Upload-Maske.
Keine separate Asset-Verwaltung im Kanalpunkte-Modul.
```

## Geplanter Ablauf

### STEP574 - Channelpoints Build Content Rescue Draft

Eine aktive Konsolidierungsdatei erstellen:

```text
docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md
```

Darin STEP484_CHANNELPOINTS und STEP489-STEP494 fachlich sichern.

### STEP575 - Channelpoints Build Archive Dry-Run

Dry-Run fuer Archivierung:

```text
project-state/STEP484_CHANNELPOINTS_REWARDS_READONLY_SYNC.md
project-state/STEP489_CHANNELPOINTS_BACKEND_SKELETON.md
project-state/STEP490_CHANNELPOINTS_MODEL_AND_MEDIA_PLAN.md
project-state/STEP491_CHANNELPOINTS_DB_SCHEMA_PREP.md
project-state/STEP492_CHANNELPOINTS_DB_MIGRATION_SAFE.md
project-state/STEP493_CHANNELPOINTS_LOCAL_REWARD_CRUD.md
project-state/STEP494_CHANNELPOINTS_DASHBOARD_BASE.md
```

Zielordner:

```text
project-state/archive/2026-05-30-step573-channelpoints-build-state/
```

### STEP576 - Channelpoints Build Archive Apply

Nach sauberem Dry-Run die sieben Dateien ins Archiv verschieben.

### STEP577 - Post Channelpoints Build Verification

Pruefen:

```text
Channelpoints build leftovers in root: 0
Archive present: 7
CHANNELPOINTS_BUILD_CONSOLIDATION.md aktiv
CHANNELPOINTS_CURRENT_STATE.md aktiv
SHOUTOUT_SYSTEM_CONSOLIDATION.md aktiv
COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md aktiv
MODULE_AND_META_RULES_CONSOLIDATION.md aktiv
Errors: 0
```

## Sicherheitsregeln

Nicht verschieben und nicht ersetzen:

```text
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
