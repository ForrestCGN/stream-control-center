# FILES — wichtige Dateien

## Backend

```text
backend/modules/commands.js
backend/modules/channelpoints.js
backend/modules/twitch.js
backend/modules/messages.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
backend/core/database.js
backend/modules/sqlite_core.js
```

## Dashboard

```text
htdocs/dashboard/modules/commands.js
htdocs/dashboard/modules/commands.css
htdocs/dashboard/modules/commands_media.js
htdocs/dashboard/modules/channelpoints.js
htdocs/dashboard/modules/channelpoints.css
htdocs/dashboard/components/media_picker.js
htdocs/dashboard/components/media_field.js
```

## Datenbank

Produktive Datenbank:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Regel:

```text
niemals überschreiben oder ersetzen.
Nur additive Migrationen/CREATE TABLE IF NOT EXISTS/ALTER TABLE sicher nutzen.
```

## Kanalpunkte-Tabellen

```text
channelpoints_categories
channelpoints_rewards
channelpoints_redemptions
```

## Wichtige API-Routen — Kanalpunkte

```text
GET  /api/channelpoints/status
GET  /api/channelpoints/categories
GET  /api/channelpoints/rewards
GET  /api/channelpoints/rewards/:idOrKey
POST /api/channelpoints/rewards
PUT  /api/channelpoints/rewards/:idOrKey
PATCH /api/channelpoints/rewards/:idOrKey
DELETE /api/channelpoints/rewards/:idOrKey
POST /api/channelpoints/rewards/:idOrKey/delete
POST /api/channelpoints/rewards/:idOrKey/enable
POST /api/channelpoints/rewards/:idOrKey/disable
POST /api/channelpoints/rewards/:idOrKey/execute
GET  /api/channelpoints/redemptions
POST /api/channelpoints/redemptions/test
GET  /api/channelpoints/twitch-status
GET  /api/channelpoints/twitch/readiness
GET  /api/channelpoints/twitch/auth-check
GET  /api/channelpoints/bus-events
```

## Wichtige API-Routen — Commands

```text
GET  /api/commands/status
GET  /api/commands/list
GET  /api/commands/catalog
POST /api/commands/upsert
POST /api/commands/delete
GET  /api/commands/test
GET  /api/commands/execute
GET  /api/commands/logs
GET  /api/commands/media-command-check
```

## Workflow-Dateien

```text
01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd
02_LOKALE_AENDERUNGEN_ZU_GITHUB_HOCHLADEN.cmd
03_NUR_STATUS_PRUEFEN.cmd
04_BACKUP_ZURUECKSPIELEN.cmd
stepdone.cmd
```

