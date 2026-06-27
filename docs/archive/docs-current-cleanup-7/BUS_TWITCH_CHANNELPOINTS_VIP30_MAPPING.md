# BUS-TWITCH.13 – Channelpoints/VIP30 Event-Mapping

Stand: 2026-06-10

## Ziel dieses Steps

Dieser Step dokumentiert, wie Channelpoints-Redemptions und VIP30 aktuell laufen und wie die Migration auf `twitch_events` später sicher erfolgen soll.

Es ist bewusst ein Doku-/Planungsstep:

```text
Keine Codeänderung.
Keine produktive Flow-Änderung.
Keine alte Funktion entfernt.
```

## Aktueller Ist-Zustand

### 1. twitch.js

`twitch.js` ist aktuell weiterhin der produktive Besitzer der bestehenden Twitch EventSub-Verbindung für viele Events. Dazu gehört auch:

```text
channel.channel_points_custom_reward_redemption.add
```

`twitch.js` darf deshalb noch nicht hart umgebaut oder entkernt werden.

### 2. channelpoints_eventsub_bus_bridge.js

Dieses Modul ist aktuell eine bestehende Bridge für Channelpoints-Redemptions.

Erkannte Eigenschaften:

```text
MODULE_NAME: channelpoints_eventsub_bus_bridge
MODULE_VERSION: 0.9.2
MODULE_BUILD: eventbus-redemption-bridge-heartbeat
EventSub-Typ: channel.channel_points_custom_reward_redemption.add
Bus-Event: channelpoints.redemption / received
Quelle: Audit-/Cache-Dateien aus bestehendem EventSub-System
Replayable: aktuell true
TTL: aktuell 120000 ms
Dedupe: maxSeenIds vorhanden
```

### 3. channelpoints.js

`channelpoints.js` hat bereits ein eigenes Reward-/Redemption-Datenmodell und Bus-Integration.

Wichtige Punkte:

```text
- lokale Reward-Verwaltung
- channelpoints_redemptions Tabelle
- Redemption-Historie / Queue / Execution Result
- Twitch Fulfill/Cancel Status-Update-Funktionen
- Bus Subscription auf channelpoints.redemption / received
```

### 4. vip30.js

`vip30.js` ist der fachliche Verbraucher für den VIP30-Reward.

Wichtige Punkte:

```text
- subscribed aktuell auf channelpoints.redemption / received
- verarbeitet VIP30 Reward fachlich
- hat Live-Execution Safety Status
- kann Fulfill/Cancel/VIP-Grant in produktiven Schritten ausführen
- besitzt External-VIP-Remove-Subscriptions
```

## Neues Ziel-Event

Für `twitch_events` wird ein sauber benanntes Twitch-Event vorgesehen:

```text
twitch.channelpoints.redemption.created
```

Technische Bus-Aufteilung:

```text
channel: twitch.channelpoints.redemption
action: created
```

## Minimaler Payload für BUS-TWITCH.14

```json
{
  "eventName": "twitch.channelpoints.redemption.created",
  "eventId": "<eventsub_message_id_or_redemption_id>",
  "correlationId": "<redemption_id>",
  "source": "twitch_events",
  "eventsubType": "channel.channel_points_custom_reward_redemption.add",
  "redemptionId": "<twitch redemption id>",
  "rewardId": "<reward id>",
  "rewardTitle": "<reward title>",
  "rewardCost": 50000,
  "userId": "<user id>",
  "userLogin": "<login>",
  "userDisplayName": "<display name>",
  "userInput": "<input>",
  "redeemedAt": "<timestamp>",
  "rawIncluded": false
}
```

## Event-Policy

Für das reine Twitch-Eingangsevent:

```text
requireAck: false
replayable: false für neuen Twitch-Event-Standard
ttlMs: 0
queued: false
priority: P1
```

Begründung:

```text
Twitch-Events sind Eingangssignale.
Zuverlässige Aktionen wie Fulfill/Cancel/VIP-Grant werden als fachliche Result-/Action-Events modelliert.
Kein Bus-ACK für reine Twitch-Events nötig.
```

## Fachliche Result-/Action-Events für später

Später, nicht in BUS-TWITCH.14, sollen daraus fachliche Events entstehen können:

```text
twitch.channelpoints.redemption.fulfill.requested
twitch.channelpoints.redemption.cancel.requested
twitch.channelpoints.redemption.fulfilled
twitch.channelpoints.redemption.canceled
twitch.channelpoints.redemption.failed

vip30.redemption.accepted
vip30.redemption.rejected
vip30.vip.grant.requested
vip30.vip.granted
vip30.vip.failed
```

Diese Events bekommen `correlationId = redemptionId`, damit VIP30 und Channelpoints Ergebnisse eindeutig zuordnen können.

## Migrationsplan

### BUS-TWITCH.14

```text
twitch_events emittiert channelpoints redemption created parallel.
Altweg bleibt aktiv.
VIP30 bleibt noch auf altem channelpoints.redemption / received.
```

### BUS-TWITCH.15

```text
VIP30 bekommt optionalen Subscriber auf twitch.channelpoints.redemption.created.
Default zunächst aus oder Preview-only.
Keine VIP-/Fulfill-/Cancel-Aktion im ersten Test.
```

### BUS-TWITCH.16

```text
Paralleltest: Altweg und neuer Weg vergleichen.
Dedupe nach redemptionId.
Decision Preview vergleichen.
```

### BUS-TWITCH.17

```text
Nur wenn BUS-TWITCH.16 grün ist:
Altweg channelpoints_eventsub_bus_bridge deaktivierbar machen.
Nicht löschen.
```

## Nicht anfassen bis bestätigt

```text
- bestehende twitch.js EventSub-Flows
- bestehende channelpoints_eventsub_bus_bridge
- VIP30 Live-Execution
- Fulfill/Cancel gegen Twitch
- VIP-Grant/Remove
- SQLite-Daten
```
