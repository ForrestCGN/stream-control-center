# CURRENT CHAT HANDOFF – BUS-TWITCH.10

## Stand

BUS-TWITCH.10 bereitet EventSub Chat Autostart / Restart-Sicherheit vor.

## Wichtig

```text
Nach Installation: StepDone vor Live-Test.
Twitch EventSub Chat soll nach Backend-Neustart automatisch starten, sofern TWITCH_EVENTS_EVENTSUB_CHAT_AUTOSTART nicht auf false steht.
Commands nutzen seit BUS-TWITCH.9 standardmaessig den Bus-Weg.
Presence-Direktweg bleibt Fallback.
```

## Naechster Test

```powershell
$c = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/eventsub/chat/status"
$c.eventSubChat | ConvertTo-Json -Depth 8
```
