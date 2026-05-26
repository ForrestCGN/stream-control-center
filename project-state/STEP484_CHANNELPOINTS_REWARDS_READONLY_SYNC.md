# STEP484_CHANNELPOINTS_REWARDS_READONLY_SYNC

Datum: 2026-05-26

## Ziel

Kanalpunkte-System um Twitch Rewards Read-Only Sync erweitern.

## Ergebnis

Additives Backend-Modul erstellt:

```text
backend/modules/channelpoints_twitch_readonly_sync.js
```

Version:

```text
0.8.1
```

Build:

```text
twitch-rewards-readonly-sync
```

## Warum als Add-on?

Das bestehende Hauptmodul `backend/modules/channelpoints.js` enthält bereits viele produktive Funktionen. Um keine Funktionalität zu entfernen und keinen riskanten vollständigen Ersatz einer großen Datei zu erzwingen, wurde v0.8.1 als eigenes, automatisch ladbares Add-on-Modul umgesetzt.

## Neue Routen

```text
GET  /api/channelpoints/twitch/rewards-readonly/status
GET  /api/channelpoints/twitch/rewards-readonly/preview
POST /api/channelpoints/twitch/rewards-readonly/sync
GET  /api/channelpoints/twitch/rewards
GET  /api/channelpoints/twitch/sync
POST /api/channelpoints/twitch/sync
```

## Sicherheit

```text
Keine Twitch-Schreibzugriffe.
Keine Twitch Reward Create/Update/Delete Calls.
Keine Twitch Deaktivierung.
Keine Redemption Status Updates.
Keine destruktive Migration.
Keine DB-Ersetzung.
```

## DB

Bestehende Tabelle:

```text
channelpoints_rewards
```

Keine neue Tabelle.
Keine Migration.
Nur lokale Upserts auf Wunsch per `dryRun=false`.

## EventBus

Neues Modul registriert sich am Communication Bus:

```text
channelpoints_twitch_readonly_sync
```

Events:

```text
channelpoints.twitch.rewards.read
channelpoints.twitch.rewards.read_failed
channelpoints.twitch.rewards.sync_preview
channelpoints.twitch.rewards.synced
channelpoints.twitch.rewards.sync_failed
```

## Tests

```bat
cd D:\Git\stream-control-center
node --check backend\modules\channelpoints_twitch_readonly_sync.js
```

Danach Server neu starten und prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/rewards-readonly/status" |
  Select-Object ok,module,moduleVersion,moduleBuild,enabled,lastError
```

Preview:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/rewards-readonly/preview" |
  Select-Object ok,module,moduleVersion,dryRun,rewardCount,twitchWrite,localDbWrite,error
```

## Offen

- Dashboard-Integration in bestehendes `htdocs/dashboard/modules/channelpoints.js` folgt separat.
- Hauptmodul `backend/modules/channelpoints.js` bleibt unverändert bei 0.8.0.
- Nach erfolgreichem Test kann entschieden werden, ob das Add-on dauerhaft bleibt oder sauber ins Hauptmodul integriert wird.
