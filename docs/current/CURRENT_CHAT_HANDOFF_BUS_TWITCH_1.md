# CURRENT CHAT HANDOFF – BUS-TWITCH.1

Stand: 2026-06-10

## Aktueller STEP

```text
STEP BUS-TWITCH.1 – Twitch Events Central Foundation
```

## Ergebnis

Ein neues zentrales Twitch-Event-Modul wurde vorbereitet:

```text
backend/modules/twitch_events.js
```

Es ist als sichere Foundation gebaut:

```text
- Bus-Anmeldung
- Heartbeat
- Statusroute
- Event-Katalog
- Handler-Exports
- ACK/Replay vorbereitet, aber default aus
- keine produktive Anbindung
- keine bestehende Funktion entfernt
```

## Nicht geaendert

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

## Wichtige Architekturentscheidung

```text
twitch_events ist die langfristige zentrale Twitch-Event-Zentrale.
twitch.js bleibt Twitch-Core/API/OAuth/Helix.
twitch_presence bleibt Heimleitung/Bot/Chat-Senden/Presence.
Bestehende direkte Modulkommunikation bleibt bis getestete Migration aktiv.
```

## Naechster sinnvoller Schritt

```text
BUS-TWITCH.2 – Chat parallel anbinden
```

Ziel:

```text
twitch_presence -> twitch_events.handleIrcEvent(...)
commands.handleChatMessage(...) bleibt parallel aktiv.
```

## Danach

```text
BUS-TWITCH.3 – EventSub parallel anbinden
BUS-TWITCH.4 – VIP30 Channelpoints Subscriber / Fulfill-Cancel Lifecycle
BUS-TWITCH.5+ – weitere Module einzeln migrieren
```

## Tests nach Installation

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

## StepDone

```powershell
.\stepdone.cmd "STEP BUS-TWITCH.1 Twitch Events Central Foundation"
```
