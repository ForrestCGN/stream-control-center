# twitch_events – Zentrale Twitch-Event-Schicht

Stand: 2026-06-10  
STEP: BUS-TWITCH.1 – Twitch Events Central Foundation

## Zweck

`backend/modules/twitch_events.js` ist die neue zentrale Twitch-Event-Schicht.

Ziel:

```text
Twitch-Quellen -> twitch_events -> communication_bus -> abonnierende Module
```

Das Modul stellt Twitch-Ereignisse sauber normalisiert und abonnierbar ueber den vorhandenen Communication Bus bereit.

## Wichtigste Regel

Bestehende produktive Funktionen bleiben aktiv.

```text
Alte Direktlogik wird erst entfernt, wenn ein Modul erfolgreich ueber twitch_events abonniert, getestet und dokumentiert ist.
```

## Aktueller Stand BUS-TWITCH.1

In diesem STEP wird nur neu geschaffen:

```text
backend/modules/twitch_events.js
```

Noch nicht geaendert:

```text
backend/modules/twitch.js
backend/modules/twitch_presence.js
backend/modules/twitch_chat_overlay.js
backend/modules/twitch_chat_bus_bridge.js
backend/modules/commands.js
VIP30
Loyalty/Giveaways
Alerts
Sound-System
SQLite
produktive Flows
```

## Modulrolle

`twitch_events.js` ist langfristig die zentrale Twitch-Event-Zentrale.

Aktuell:

```text
- Modul wird geladen
- registriert sich am Communication Bus
- sendet Heartbeat
- stellt Statusroute bereit
- stellt Event-Katalog bereit
- bereitet Handler fuer IRC/EventSub/Redemption-Lifecycle vor
- emittet noch keine produktiven Events, solange keine Quelle angebunden ist
```

Langfristig:

```text
- EventSub-Handling aus twitch.js schrittweise uebernehmen
- Twitch-Events zentral normalisieren
- Module abonnieren Events statt direkter Weiterleitungen
```

## Routen

```text
GET /api/twitch/events/status
GET /twitch/events/status
GET /api/twitch/events/catalog
GET /twitch/events/catalog
```

## Bus-Anbindung

Das Modul nutzt ausschliesslich den bestehenden Communication Bus:

```text
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
```

Bus-Funktionen:

```text
registerModule
heartbeatModule
publishModuleStatus
emit
```

## ACK / Replay / Queue

ACK und Replay sind im Event-Katalog vorbereitet, aber standardmaessig deaktiviert.

Standard fuer Twitch-Events:

```text
requireAck: false
replayable: false
ttlMs: 0
queued: false
```

Grund:

```text
Twitch-Events sind Eingangssignale.
Fachmodule erzeugen daraus bei Bedarf eigene Systemaktionen mit Queue/Lifecycle/CorrelationId.
```

## Event-Katalog

### Chat / IRC

```text
twitch.chat.message
twitch.notice.received
twitch.usernotice.received
```

### EventSub / Lifecycle

```text
twitch.eventsub.connected
twitch.eventsub.disconnected
twitch.eventsub.reconnecting
twitch.eventsub.reconnected
twitch.eventsub.notification.received
twitch.eventsub.subscription.created
twitch.eventsub.subscription.failed
twitch.eventsub.subscription.removed
```

### Stream / Channel

```text
twitch.stream.online
twitch.stream.offline
twitch.stream.updated
twitch.channel.updated
```

### Support / Alerts

```text
twitch.follow.received
twitch.sub.received
twitch.resub.received
twitch.subgift.received
twitch.giftbomb.received
twitch.cheer.received
twitch.raid.received
```

### Channelpoints / VIP30-Relevanz

```text
twitch.channelpoints.redemption.created
twitch.channelpoints.redemption.fulfill.requested
twitch.channelpoints.redemption.cancel.requested
twitch.channelpoints.redemption.fulfilled
twitch.channelpoints.redemption.canceled
twitch.channelpoints.redemption.failed
```

Wichtig:

```text
VIP30 entscheidet fachlich.
twitch_events stellt den Event-Vertrag bereit.
twitch.js bleibt fuer Twitch-API-Aufrufe zustaendig, bis ein separater Migration-Step das aendert.
```

### VIP

```text
twitch.vip.added
twitch.vip.removed
```

### Hype Train

```text
twitch.hypetrain.started
twitch.hypetrain.progress
twitch.hypetrain.ended
```

### Shoutout

```text
twitch.shoutout.created
twitch.shoutout.received
```

## Handler-Exports

```text
handleIrcEvent(parsed, context, options)
handleEventSubNotification(notification, context, options)
handleEventSubLifecycle(kind, payload, context, options)
handleRedemptionLifecycleEvent(kind, payload, context, options)
publishTwitchEvent(eventKey, payload, context, options)
getStatus()
getCatalog()
```

## Performance-Regeln

Chat-Events sind High-Frequency-Events:

```text
kein ACK
kein Replay
kein DB-Write
kein Payload-Audit
minimaler Payload
kein blindes UI-/Overlay-Broadcast
```

Standard-Target ist intern:

```text
target.id = internal:twitch_events
```

In-Process-Subscriber erhalten Events ueber `bus.subscribe(...)`. WebSocket-/Overlay-Clients bekommen sie nicht automatisch.

## Migration

### Phase 1 – erledigt mit BUS-TWITCH.1

```text
twitch_events Modul anlegen.
Bus-Anmeldung, Heartbeat, Status, Event-Katalog.
Keine produktive Anbindung.
```

### Phase 2 – Chat parallel anbinden

```text
twitch_presence -> twitch_events.handleIrcEvent(...)
commands.handleChatMessage(...) bleibt parallel aktiv.
```

### Phase 3 – EventSub parallel anbinden

```text
twitch.js -> twitch_events.handleEventSubNotification(...)
bestehende Direktweiterleitungen bleiben aktiv.
```

### Phase 4 – Fachmodule abonnieren

```text
commands
vip30
loyalty_giveaways
alerts
sound_system
deathcounter
clip_shoutout
dashboard
```

### Phase 5 – Altlogik entfernen

```text
Erst nach erfolgreichem Test und Doku.
Keine Funktionalitaet entfernen, bevor Ersatz stabil ist.
```

## Tests

```powershell
node -c .\backend\modules\twitch_events.js
```

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$s | Select-Object ok,module,moduleVersion,health,lastError
```

```powershell
$c = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/catalog"
$c | Select-Object ok,module,moduleVersion,count
```

```powershell
$b = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
$b.clients | Where-Object { $_.module -eq "twitch_events" } | Select-Object id,module,status,lastHeartbeatAt,heartbeatCount
```

## StepDone

```powershell
.\stepdone.cmd "STEP BUS-TWITCH.1 Twitch Events Central Foundation"
```
