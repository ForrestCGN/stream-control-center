# twitch_events – Zentrale Twitch-Event-Schicht

Stand: 2026-06-10  
Version: 0.1.2  
Build: BUS_TWITCH_3_EVENTSUB_OWNERSHIP_PREP

## Rolle

`twitch_events` ist die zentrale Twitch-Event-Schicht fuer das Stream-Control-Center.
Das Modul stellt Twitch-Ereignisse normalisiert ueber den `communication_bus` bereit, damit Fachmodule gezielt abonnieren koennen.

## Bisher bestaetigt

```text
BUS-TWITCH.1 Foundation: Modul laedt, Statusroute, Event-Katalog, Bus-Registrierung, Heartbeat.
BUS-TWITCH.2 Chat Parallel Bridge: twitch_presence/IRC -> twitch_events -> Bus twitch.chat.message erfolgreich live getestet.
```

## BUS-TWITCH.3

Dieser Step ist eine Vorbereitung fuer die spaetere EventSub-Ownership in `twitch_events`.

Wichtig:

```text
- twitch.js bleibt aktuell produktiver EventSub-Besitzer.
- Es wird keine EventSub-Logik aus twitch.js entfernt.
- Bestehende Alert-/VIP-/Loyalty-/Deathcounter-/Shoutout-Flows bleiben aktiv.
- twitch_events bereitet nur Ownership-Status, Subscription-Katalog und channel.chat.message-Normalisierung vor.
```

## EventSub Ownership

Statusroute:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/eventsub/ownership"
```

Aktueller Modus:

```text
mode: prepared-disabled
currentOwner: twitch.js
desiredOwner: twitch_events
takeoverEnabled: false
websocketEnabled: false
subscriptionCreationEnabled: false
existingTwitchJsEventSubKept: true
existingFlowsChanged: false
```

## Geplante Chat-EventSub-Subscription

```text
type: channel.chat.message
version: 1
eventKey: twitch.chat.message
source: eventsub
status: planned
enabled: false
requireAck: false
replayable: false
ttlMs: 0
payload: minimal
```

Benoetigte Bedingung laut Twitch-Dokumentation:

```text
broadcaster_user_id
user_id
```

Token/Scopes muessen vor Aktivierung separat geprueft werden:

```text
user:read:chat
bei App-Access-Token zusaetzlich: user:bot sowie channel:bot oder Moderator-Status
```

## Bestehende twitch.js EventSub-Subscriptions laut aktuellem Source-Stand

```text
stream.online
stream.offline
channel.update
channel.hype_train.begin
channel.hype_train.progress
channel.hype_train.end
channel.channel_points_custom_reward_redemption.add
channel.vip.add
channel.vip.remove
channel.follow
channel.subscribe
channel.subscription.gift
channel.subscription.message
channel.cheer
channel.raid
channel.shoutout.create
channel.shoutout.receive
```

## Migrationsregel

```text
Erst parallel anbieten.
Dann Modul abonnieren.
Dann Live-Test.
Dann Doku aktualisieren.
Erst danach alte Direktlogik entfernen oder deaktivierbar machen.
```

## Tests

```powershell
node -c .\backend\modules\twitch_events.js
```

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,health,lastError
```

```powershell
$o = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/eventsub/ownership"
$o.ownership | Select-Object mode,currentOwner,desiredOwner,takeoverEnabled,subscriptionCreationEnabled,existingTwitchJsEventSubKept
```
