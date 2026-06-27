# BUS_TWITCH_STATUS

Stand: 2026-06-10

## Architekturstatus

Der Communication-Bus dient als zentrale interne Modul-Kommunikations- und Monitoring-Schicht.

Aktuell produktiv bestätigte Twitch-Pfade:

```text
Chat Commands:
Twitch EventSub channel.chat.message
→ twitch_events
→ communication_bus
→ commands
```

```text
VIP30 Channelpoints:
Twitch EventSub channel.channel_points_custom_reward_redemption.add
→ twitch.js reliable parallel tap
→ twitch_events
→ communication_bus
→ vip30 TwitchEvents Subscriber
```

## Event-Konventionen

Für reine Twitch-Input-Events gilt aktuell:

```text
requireAck=false
replayable=false
ttlMs=0
queued=false
```

Begründung:

```text
Twitch-Events sind Eingangssignale.
ACK/Replay/Queue werden nicht pauschal auf jedes Twitch-Event angewendet.
Koordinierte Modulaktionen können später eigene Lifecycle-/Result-Events mit correlationId nutzen.
```

## Aktuelle Eventnamen

```text
twitch.chat.message
twitch.channelpoints.redemption.created
```

## VIP30 finaler Source-Status

```text
twitchEvents.enabled=True
twitchEvents.active=True
twitchEvents.autostart=True
legacyBridge.enabled=True
legacyBridge.active=False
legacyBridge.autostart=False
legacyHardDisableGate=True
```

## Wichtige Statusrouten

```text
GET /api/communication/status
GET /api/twitch/events/status
GET /api/twitch/events/catalog
GET /api/twitch/events/eventsub/chat/status
GET /api/twitch/eventsub/channelpoints-parallel/status
GET /api/commands/bus-chat/status
GET /api/twitch/presence/command-direct/status
GET /api/vip30/channelpoints/source/status
```

## VIP30 Fallback-Routen

```text
POST /api/vip30/channelpoints/bridge/start
POST /api/vip30/channelpoints/bridge/stop
```

## Prüfkommandos

```powershell
$b = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
$b.status.clients | Where-Object { $_.module -eq "twitch_events" }
```

```powershell
$src = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/channelpoints/source/status"
$src.twitchEvents | Select-Object enabled,active,autostart,subscriptionId,lastError
$src.legacyBridge | Select-Object enabled,active,autostart,subscriptionId,lastError
$src.legacyHardDisableGate
```
