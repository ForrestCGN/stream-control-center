# CURRENT CHAT HANDOFF – BUS-TWITCH.16c

Stand: BUS-TWITCH.16c vorbereitet.

## Kernaussage

VIP30 läuft standardmäßig über den Bus-Weg:

```text
Twitch EventSub Channelpoints
→ twitch.js reliable parallel tap
→ twitch_events
→ communication_bus
→ vip30 TwitchEvents Subscriber
```

Die Legacy-Bridge bleibt als manueller Fallback vorhanden, startet aber nach Node-Neustart nicht mehr automatisch.

## Erwarteter Status nach Neustart

```text
twitchEvents.active=True
twitchEvents.autostart=True
legacyBridge.active=False
legacyBridge.autostart=False
legacyHardDisableGate=True
```

## Testbefehle

```powershell
node -c .\backend\modules\vip30.js
$src = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/channelpoints/source/status"
$src.twitchEvents | Select-Object enabled,active,autostart,subscriptionId,lastError
$src.legacyBridge | Select-Object enabled,active,autostart,subscriptionId,lastError
$src.legacyHardDisableGate
```

## Fallback

Legacy manuell starten/stoppen:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip30/channelpoints/bridge/start"
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip30/channelpoints/bridge/stop"
```
