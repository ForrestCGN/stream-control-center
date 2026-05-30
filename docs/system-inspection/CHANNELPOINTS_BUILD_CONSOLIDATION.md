# CHANNELPOINTS_BUILD_CONSOLIDATION

Version: 0.1.0  
Stand: 2026-05-30  
Quelle: Batch E aus `project-state/`

## Zweck

Diese Datei konsolidiert die wichtigen Informationen aus:

```text
project-state/STEP484_CHANNELPOINTS_REWARDS_READONLY_SYNC.md
project-state/STEP489_CHANNELPOINTS_BACKEND_SKELETON.md
project-state/STEP490_CHANNELPOINTS_MODEL_AND_MEDIA_PLAN.md
project-state/STEP491_CHANNELPOINTS_DB_SCHEMA_PREP.md
project-state/STEP492_CHANNELPOINTS_DB_MIGRATION_SAFE.md
project-state/STEP493_CHANNELPOINTS_LOCAL_REWARD_CRUD.md
project-state/STEP494_CHANNELPOINTS_DASHBOARD_BASE.md
```

Die Datei ist ab jetzt die aktive Rescue-/Referenzdatei fuer den Channelpoints-Build-Stand aus Batch E, bevor die alten STEP-Dateien spaeter archiviert werden.

## Zentrale Architekturentscheidung

```text
backend/modules/channelpoints.js ist das zentrale Kanalpunkte-Hauptmodul.
backend/modules/channelpoints_twitch_readonly_sync.js ist ein additives Read-Only-Sync-Add-on.
Dashboard arbeitet ueber vorhandene APIs.
Media-Auswahl laeuft ueber das bestehende Media-System.
Lokales Reward-CRUD ist lokal-only.
Twitch-Schreibaktionen sind in diesem Stand nicht freigegeben.
```

## Harte Sicherheitsregeln

```text
Keine Twitch-Schreibaktionen.
Keine Twitch Reward Create/Update/Delete Calls.
Keine Twitch Reward-Deaktivierung auf Twitch.
Keine Redemption Status Updates.
Keine destruktive Migration.
Keine DB-Ersetzung.
Keine bestehende SQLite-Datei ersetzen oder neu bauen.
Keine zweite Upload-Maske.
Keine separate Asset-Verwaltung im Channelpoints-Modul.
```

## Hauptmodul: channelpoints.js

Das Kanalpunkte-Hauptmodul wurde schrittweise aufgebaut.

Gesicherte Entwicklung:

```text
STEP489: Backend-Skeleton, Version 0.1.0
STEP490: Datenmodell-/Media-Plan, Version 0.2.0
STEP491: Schema-Preview, Version 0.3.0
STEP492: sichere lokale DB-Migration, Version 0.4.0
STEP493: lokale Reward-CRUD-Grundlage
STEP494: Dashboard-Basis
```

Wichtige Funktionen / Konzepte:

```text
MODULE_META
init
buildStatus
registerAtCommunicationBus
heartbeatBus
publishStatus
Communication-Bus-Anbindung ueber bestehenden Bus
lokale Kategorien
lokale Rewards
lokale Redemptions
```

Bus-Anbindung:

```text
require('./communication_bus').getBus()
```

Kein separater Contract-Helper fuer diesen Stand.

## Add-on: channelpoints_twitch_readonly_sync.js

Das Read-Only-Sync-Add-on wurde bewusst als separates Modul gebaut, um das produktive Hauptmodul nicht riskant zu ersetzen.

```text
backend/modules/channelpoints_twitch_readonly_sync.js
Version: 0.8.1
Build: twitch-rewards-readonly-sync
```

Warum als Add-on:

```text
Das bestehende Hauptmodul channelpoints.js enthaelt produktive Funktionen.
Kein vollstaendiger Ersatz einer grossen Datei.
Keine Funktionalitaet entfernen.
Additives, automatisch ladbares Modul.
```

Sicherheit:

```text
Keine Twitch-Schreibzugriffe.
Keine Twitch Reward Create/Update/Delete Calls.
Keine Twitch-Deaktivierung.
Keine Redemption Status Updates.
Keine destruktive Migration.
Keine DB-Ersetzung.
Keine neue Tabelle.
Keine Migration.
Lokale Upserts nur auf Wunsch per dryRun=false.
```

EventBus-Modulname:

```text
channelpoints_twitch_readonly_sync
```

Gesicherte Events:

```text
channelpoints.twitch.rewards.read
channelpoints.twitch.rewards.read_failed
channelpoints.twitch.rewards.sync_preview
channelpoints.twitch.rewards.synced
channelpoints.twitch.rewards.sync_failed
```

## DB-Regeln

Core-DB:

```text
data/sqlite/app.sqlite
```

Verbindlich:

```text
app.sqlite nie ersetzen.
app.sqlite nie neu bauen.
Bestehende Daten nicht loeschen.
Schema nur additiv erweitern.
CREATE TABLE IF NOT EXISTS.
CREATE INDEX IF NOT EXISTS.
INSERT OR IGNORE fuer Seeds.
```

Schema-Version:

```text
channelpoints = 1
```

Gesicherte Tabellen:

```text
channelpoints_categories
channelpoints_rewards
channelpoints_redemptions
```

Schema-Preview-Regeln aus STEP491:

```text
status = preview_only_no_db_write
dbMigrationEnabled = false
migrationExecutionImplemented = false
sqliteCompatible = true
```

Sichere Migration aus STEP492:

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

## Media-Regel

Kanalpunkte nutzen das bestehende Media-System.

```text
backend/modules/media.js
htdocs/dashboard/components/media_picker.js
htdocs/dashboard/components/media_field.js
```

Verbindlich:

```text
Keine zweite Upload-Maske.
Keine separate Asset-Verwaltung im Kanalpunkte-Modul.
Media-Feld nutzt MediaField / MediaPicker.
```

## Dashboard-Basis

Gesicherte Dateien:

```text
htdocs/dashboard/modules/channelpoints.js
htdocs/dashboard/modules/channelpoints.css
htdocs/dashboard/index.html
```

Gesicherte Dashboard-Regeln:

```text
Dashboard-Modul registriert sich selbst bei window.CGN.modules.
Community-Navigation/Favoriten werden zur Laufzeit um channelpoints erweitert.
Kategorien/Rewards werden ueber vorhandene APIs geladen.
Lokales Erstellen/Bearbeiten/Aktivieren/Deaktivieren von Rewards.
Media-Feld nutzt MediaField/MediaPicker und die bestehende Medienverwaltung.
```

Nicht enthalten:

```text
Keine Twitch-Schreibaktionen.
Keine Twitch Reward-Erstellung.
Keine Twitch Reward-Deaktivierung.
Keine neue Upload-Logik.
Keine DB-Schema-Aenderung im Dashboard-Step.
```

## Gesicherte Routen

Hauptmodul:

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
```

Twitch Read-Only Sync:

```text
GET  /api/channelpoints/twitch/rewards-readonly/status
GET  /api/channelpoints/twitch/rewards-readonly/preview
POST /api/channelpoints/twitch/rewards-readonly/sync
GET  /api/channelpoints/twitch/rewards
GET  /api/channelpoints/twitch/sync
POST /api/channelpoints/twitch/sync
```

## Gesicherte Testregeln

Syntax:

```powershell
node --check backend\modules\channelpoints.js
node --check backend\modules\channelpoints_twitch_readonly_sync.js
```

Runtime Hauptmodul:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus-test?message=hello"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/model"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/media-plan"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/schema-preview"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/db-status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/categories"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/rewards"
```

Runtime Read-Only Sync:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/rewards-readonly/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/rewards-readonly/preview"
```

Beispiel lokaler Reward-Create:

```powershell
$body = @{
  reward_key='test_reward'
  title='Test Reward'
  cost=100
  category_key='general'
  action_type='manual'
} | ConvertTo-Json

Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/rewards" -Method Post -ContentType "application/json" -Body $body
```

## Archivierungsfreigabe nach Konsolidierung

Nach Commit dieser Datei duerfen folgende alten STEP-Dateien per Dry-Run/Apply archiviert werden:

```text
project-state/STEP484_CHANNELPOINTS_REWARDS_READONLY_SYNC.md
project-state/STEP489_CHANNELPOINTS_BACKEND_SKELETON.md
project-state/STEP490_CHANNELPOINTS_MODEL_AND_MEDIA_PLAN.md
project-state/STEP491_CHANNELPOINTS_DB_SCHEMA_PREP.md
project-state/STEP492_CHANNELPOINTS_DB_MIGRATION_SAFE.md
project-state/STEP493_CHANNELPOINTS_LOCAL_REWARD_CRUD.md
project-state/STEP494_CHANNELPOINTS_DASHBOARD_BASE.md
```

Geplanter Zielordner:

```text
project-state/archive/2026-05-30-step573-channelpoints-build-state/
```

## Nicht betroffen

Diese Konsolidierung ist Dokumentation.

Nicht geaendert:

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

## Keine Funktionalitaet entfernen

Bestehende Channelpoints-, Twitch-, Media-, Dashboard-, DB-, Communication-Bus- und lokale Reward-Funktionalitaet darf durch diese Konsolidierung nicht entfernt oder ungeprueft ersetzt werden.
