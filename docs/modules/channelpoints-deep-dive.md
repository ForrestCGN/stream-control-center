# Kanalpunkte-System / Channelpoints — Deep Dive

Stand: 2026-05-26  
Modul: `backend/modules/channelpoints.js`  
Version: `0.6.0`  
Build: `media-execution-bridge`

## Zweck

Das Kanalpunkte-System verwaltet Twitch-Kanalpunkte-Belohnungen lokal im bestehenden `stream-control-center` und nutzt dafür die produktive SQLite-Datenbank. In dieser Version bleiben Twitch-Schreibzugriffe weiterhin deaktiviert. Neu ist die lokale Medien-Ausführungsbrücke, damit Kanalpunkte-Belohnungen Medien nicht nur speichern, sondern über das zentrale Sound-System ausführen können.

## Grundregel Medien

Commands und Kanalpunkte nutzen dieselbe Ausführungslogik:

```text
mediaId -> /api/sound/play Payload
```

Es gibt kein zweites Upload-System und keine zweite Medien-Ausführung neben dem Sound-System. Die Medienauswahl bleibt über das bestehende Media-System und die vorhandenen Dashboard-Komponenten vorgesehen.

## Wichtige Routen

```text
GET  /api/channelpoints/status
GET  /api/channelpoints/model
GET  /api/channelpoints/media-plan
GET  /api/channelpoints/schema-preview
GET  /api/channelpoints/db-status
GET  /api/channelpoints/categories
GET  /api/channelpoints/rewards
GET  /api/channelpoints/rewards/:idOrKey
POST /api/channelpoints/rewards
PUT  /api/channelpoints/rewards/:idOrKey
PATCH /api/channelpoints/rewards/:idOrKey
POST /api/channelpoints/rewards/:idOrKey/enable
POST /api/channelpoints/rewards/:idOrKey/disable
GET  /api/channelpoints/rewards/:idOrKey/execution-check
GET  /api/channelpoints/media-execution-check?reward=<keyOderId>
POST /api/channelpoints/rewards/:idOrKey/execute
GET  /api/channelpoints/execute?reward=<keyOderId>
POST /api/channelpoints/execute
GET  /api/channelpoints/bus-test
```

## Medien-Ausführungsbrücke

Eine Reward-Konfiguration kann jetzt lokal ausgeführt werden, wenn sie eine Media-ID besitzt und als Medien-/Sound-Aktion erkennbar ist.

Akzeptierte Action-Typen:

```text
media
sound
video_play
sound_play
```

Media-ID Quellen:

```text
reward.media_asset_id
action_payload.mediaId
action_payload.media_asset_id
action_payload.soundMediaId
action_payload.videoMediaId
action_payload.media.id
```

Die Brücke baut daraus einen Payload für:

```text
POST /api/sound/play
```

Beispiele für wichtige Payload-Felder:

```json
{
  "source": "channelpoints",
  "mediaId": "1353",
  "mediaType": "video",
  "type": "video",
  "target": "stream",
  "outputTarget": "overlay",
  "category": "channel_reward",
  "requestedBy": "testuser"
}
```

## Diagnose

Vor einer echten Ausführung kann geprüft werden:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/rewards/<rewardKey>/execution-check"
```

Oder:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/media-execution-check?reward=<rewardKey>"
```

Erwartete Felder:

```text
moduleVersion = 0.6.0
moduleBuild = media-execution-bridge
executable = True
effectiveTargetUrl = /api/sound/play
payloadPreview.mediaId = <id>
payloadPreview.source = channelpoints
```

## Lokaler Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/rewards/<rewardKey>/execute" -Method Post -ContentType "application/json" -Body '{"userLogin":"forrestcgn","userDisplayName":"ForrestCGN"}'

Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" |
  Select-Object ok,module,version,current,queuedCount,client,stats
```

Wenn das Sound-System `current` mit dem erwarteten Medium zeigt, ist die Kanalpunkte-Ausführungsbrücke korrekt.

## Datenbank

Es werden weiterhin nur die bestehenden lokalen Tabellen genutzt:

```text
channelpoints_categories
channelpoints_rewards
channelpoints_redemptions
```

Die Ausführung schreibt einen lokalen Eintrag nach `channelpoints_redemptions`, damit Tests und spätere Redemption-Verarbeitung nachvollziehbar bleiben. Die produktive SQLite-Datenbank wird nicht ersetzt oder überschrieben.

## Twitch-Status

Twitch-Reward-Reads/Writes sind weiterhin nicht aktiv:

```text
twitchWrite = false
rewardManagementImplemented = false
rewardSyncImplemented = false
redemptionHandlingImplemented = false
```

Das spätere Deaktivieren echter Twitch-Rewards muss über Twitch Custom Reward `is_enabled=false` erfolgen. Diese Version verändert nur lokale Daten und führt lokale Medienaktionen aus.

## EventBus

Das Modul registriert sich weiterhin am Communication Bus und meldet zusätzlich die Capability:

```text
channelpoints.media_execution
```

Bei erfolgreicher Medienausführung wird ein Modulstatus mit Reason `reward_media_executed` veröffentlicht.
