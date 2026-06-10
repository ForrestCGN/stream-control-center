# vip30 – 30 Tage VIP

Stand: 2026-06-10

## Aktueller Stand

VIP30 ist auf den Communication-Bus migriert und nutzt standardmäßig den TwitchEvents-/Bus-Weg für Channelpoints-Redemptions.

Aktive Version nach letztem Code-STEP:

```text
vip30 0.8.35
BUS_TWITCH_16C_VIP30_LEGACY_BRIDGE_AUTOSTART_OFF
```

## Neuer Standardweg

```text
Twitch EventSub channel.channel_points_custom_reward_redemption.add
→ twitch.js reliable parallel tap
→ twitch_events
→ communication_bus
→ vip30 TwitchEvents Subscriber
```

Bus-Event:

```text
twitch.channelpoints.redemption.created
```

## Legacy-Fallback

Der alte Weg bleibt vorhanden:

```text
channelpoints.redemption / received
→ vip30 Legacy Bridge
```

Nach BUS-TWITCH.16c gilt:

```text
legacyBridge.autostart=false
legacyBridge.active=false nach Node-Neustart
```

Manuell start-/stoppbar:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip30/channelpoints/bridge/start"
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip30/channelpoints/bridge/stop"
```

## Hard Disable Gate

BUS-TWITCH.16b hat ein Hard-Disable-Gate ergänzt:

```text
legacyHardDisableGate=True
```

Wenn die Legacy-Bridge gestoppt ist, darf sie keine VIP30-Decision ausführen.

## Bestätigter Status

```text
twitchEvents.enabled=True
twitchEvents.active=True
twitchEvents.autostart=True
legacyBridge.enabled=True
legacyBridge.active=False
legacyBridge.autostart=False
legacyHardDisableGate=True
```

## Bestätigter VIP30-Test

Testreward:

```text
30 Tage VIP
Reward-ID: 5932e698-9a57-4d13-9acc-c397682c10a6
Kosten: 35000
```

Bus-Weg Ergebnis:

```text
received=1
processed=1
ignored=0
duplicates=0
failed=0
lastResultReason=target_is_broadcaster
```

Normalisierte Payload:

```text
twitchRewardId=5932e698-9a57-4d13-9acc-c397682c10a6
rewardTitle=30 Tage VIP
rewardCost=35000
userLogin=forrestcgn
busEventKey=twitch.channelpoints.redemption.created
sourceModule=twitch_eventsub_channelpoints_parallel_cache
```

`target_is_broadcaster` ist im Test fachlich korrekt, weil der Broadcaster sich nicht selbst sinnvoll VIP geben kann.

## Statusroute

```powershell
$src = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/channelpoints/source/status"
$src.twitchEvents | Select-Object enabled,active,autostart,subscriptionId,lastError
$src.legacyBridge | Select-Object enabled,active,autostart,subscriptionId,lastError
$src.legacyHardDisableGate
```

## Wichtige Abgrenzung

```text
Keine DB-Datei ersetzen.
Keine VIP30-Fachlogik entfernen.
Keine Fulfill-/Cancel-Regeln ändern.
Legacy-Fallback bleibt vorhanden.
```
