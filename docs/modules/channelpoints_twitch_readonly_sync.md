# Channelpoints Twitch Rewards Read-Only Sync Imported Rewards Inactive Default

Stand: 2026-05-26  
Modul: `channelpoints_twitch_readonly_sync`  
Version: `0.8.3`  
Build: `imported-rewards-inactive-default`

## Zweck

Additives Backend-Modul für den nächsten Kanalpunkte-Schritt:

```text
channelpoints v0.8.3 — Twitch Rewards Read-Only Sync Imported Rewards Inactive Default
```

Das Modul liest Twitch Custom Rewards und kann sie lokal in die bestehende Tabelle `channelpoints_rewards` übernehmen. Es führt keine Twitch-Schreibzugriffe aus.

Seit v0.8.3 werden neu importierte Twitch-Rewards lokal standardmäßig **inaktiv** angelegt (`system_enabled = 0`). Dadurch kann kein frisch importierter Reward ausgeführt werden, bevor im Dashboard bewusst eine Aktion, ein Medium oder ein Text zugewiesen und der Reward manuell aktiviert wurde.

## Dateien

```text
backend/modules/channelpoints_twitch_readonly_sync.js
```

## Routen

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
Keine Reward-Erstellung bei Twitch.
Keine Reward-Änderung bei Twitch.
Keine Reward-Deaktivierung bei Twitch.
Keine Redemption-Status-Updates bei Twitch.
Keine destruktiven DB-Migrationen.
Keine DB-Ersetzung.
Neu importierte Rewards werden lokal inaktiv angelegt.
```

`/api/channelpoints/twitch/rewards` liest nur.  
`/api/channelpoints/twitch/sync` schreibt nur lokal in `channelpoints_rewards`, wenn `dryRun=false` gesetzt wird.

## Konfiguration

Das Modul liest optional aus `config/channelpoints.json`:

```json
{
  "twitchRewardsReadOnlySyncEnabled": true,
  "twitchRewardsReadUrl": "",
  "dryRunDefault": true,
  "allowLocalRewardUpsert": true,
  "defaultCategoryKey": "general",
  "defaultSortOrder": 100,
  "defaultActionType": "manual",
  "defaultActionPayloadJson": "{}"
}
```

Wenn `twitchRewardsReadUrl` gesetzt ist, wird diese lokale oder externe GET-Quelle verwendet. Wenn sie leer ist, versucht das Modul direkte Helix-Lesezugriffe mit Environment-Werten:

```text
CHANNELPOINTS_TWITCH_BROADCASTER_ID oder TWITCH_BROADCASTER_ID
CHANNELPOINTS_TWITCH_CLIENT_ID oder TWITCH_CLIENT_ID
CHANNELPOINTS_TWITCH_ACCESS_TOKEN oder TWITCH_USER_ACCESS_TOKEN oder TWITCH_ACCESS_TOKEN
```

## Datenbank

Nutzt die bestehende produktive SQLite über `backend/core/database.js`.

Betroffene bestehende Tabelle:

```text
channelpoints_rewards
```

Keine neue Tabelle. Keine destruktive Migration.

Lokales Mapping:

```text
twitch_reward_id       <- Twitch reward id
title                  <- Twitch title
prompt                 <- Twitch prompt
cost                   <- Twitch cost
twitch_is_enabled      <- Twitch is_enabled
is_paused              <- Twitch is_paused
require_user_input     <- Twitch is_user_input_required
cooldown_seconds       <- Twitch global_cooldown_setting.global_cooldown_seconds
max_per_stream         <- Twitch max_per_stream_setting.max_per_stream
max_per_user_per_stream<- Twitch max_per_user_per_stream_setting.max_per_user_per_stream
```

Neue lokale Rewards werden standardmäßig als `manual` angelegt, damit keine automatische Ausführung aus Twitch-Daten entsteht.

## EventBus

Registriert sich als eigenes Modul:

```text
module: channelpoints_twitch_readonly_sync
version: 0.8.2
```

Capabilities:

```text
module.lifecycle
module.status
channelpoints.twitch.readonly_rewards
channelpoints.twitch.sync_preview
channelpoints.twitch.local_sync
```

Events auf Channel:

```text
channelpoints.twitch
```

Actions:

```text
channelpoints.twitch.rewards.read
channelpoints.twitch.rewards.read_failed
channelpoints.twitch.rewards.sync_preview
channelpoints.twitch.rewards.synced
channelpoints.twitch.rewards.sync_failed
```

Alle Event-Metadaten enthalten:

```text
twitchWrite: false
localOnly: true
```

## Tests

```bat
cd D:\Git\stream-control-center
node --check backend\modules\channelpoints_twitch_readonly_sync.js
```

Status:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/rewards-readonly/status" |
  Select-Object ok,module,moduleVersion,moduleBuild,enabled,lastError
```

Read-only Rewards lesen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/rewards" |
  Select-Object ok,module,moduleVersion,rewardCount,twitchWrite,readOnly,error
```

Preview ohne lokale DB-Schreibänderung:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/rewards-readonly/preview" |
  Select-Object ok,module,moduleVersion,dryRun,rewardCount,twitchWrite,localDbWrite,error
```

Lokale Synchronisierung, nur wenn Preview sauber aussieht:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/channelpoints/twitch/sync?dryRun=false" |
  Select-Object ok,module,moduleVersion,dryRun,rewardCount,twitchWrite,localDbWrite,error
```

## Offene Punkte

- Dashboard-Datei `htdocs/dashboard/modules/channelpoints.js` sollte im nächsten Schritt vollständig und gezielt erweitert werden, damit der Read-Only-Sync im bestehenden Kanalpunkte-Dashboard sichtbar wird.
- Bestehendes Hauptmodul `backend/modules/channelpoints.js` steht weiterhin auf `0.8.0`. Dieses Add-on ist absichtlich additiv, damit keine bestehende Funktionalität entfernt oder versehentlich überschrieben wird.
- Später kann die Logik in das Hauptmodul integriert werden, sobald die vollständige lokale Datei als sichere Ersatzdatei bearbeitet wird.


## Ergänzung v0.8.2

Der Read-Only-Sync nutzt jetzt zuerst den bestehenden Twitch-OAuth-Flow des Projekts:

```text
GET /api/twitch/auth/validate
D:\Streaming\stramAssets\tokens\twitch_user.json
```

Ablauf:

```text
1. Auth-Validate lokal aufrufen, damit der bestehende Twitch-Token bei Bedarf refresht.
2. Token danach aus dem bestehenden Twitch-User-Tokenstore lesen.
3. Scope `channel:read:redemptions` oder `channel:manage:redemptions` prüfen.
4. Rewards per Helix GET lesen.
5. Keine Twitch-Schreibzugriffe ausführen.
```

Neue Env-Tokens sind nicht mehr erforderlich. Optional bleibt ein Env-Fallback erhalten, falls der Tokenstore nicht vorhanden ist.
