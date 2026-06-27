# CURRENT CHAT HANDOFF – CAN44.34 Twitch Stream Online/Offline Bus Events

Stand: 2026-06-14 07:56 UTC

## Kontext

Nach CAN44.32/CAN44.33 ist AutoShoutout wieder klarer:
- StreamDay-Altzustand wurde entschärft.
- `settings.autoShoutout` zeigt jetzt effektive DB-Wahrheit.
- `storeSkippedEvents` wurde aktivierbar/bestätigt.

Nächster Schritt war Live-Status und Twitch-Events/Bus:
Forrest wollte, dass Start-/Ende-Events direkt über den Event Bus gesendet werden, auch ohne Twitch-EventSub-Abo.

## Umsetzung CAN44.34

Betroffene Dateien:

- `backend/modules/stream_status.js`
- `backend/modules/live_status_monitor.js`
- `htdocs/dashboard/modules/live_status_monitor.js`

`stream_status` sendet jetzt bei Live-Transition:

- `channel: twitch.stream`, `action: online`, Payload `eventKey: twitch.stream.online`
- `channel: twitch.stream`, `action: offline`, Payload `eventKey: twitch.stream.offline`

Die Events werden aus dem vorhandenen zentralen `stream_status` erzeugt, also unabhängig von einem EventSub-Online/Offline-Abo.

Der Live-Status-Monitor nutzt für Twitch-Events nun `/api/twitch/events/status` statt der alten `/api/twitch/eventsub/status`-Route und zeigt im Dashboard `Twitch Events` statt irreführend `EventSub: UNBEKANNT`, wenn die Twitch-Events-Schicht verbunden ist.

## Tests nach Live-Deploy

```powershell
node -c "D:\Streaming\stramAssets\backend\modules\stream_status.js"
node -c "D:\Streaming\stramAssets\backend\modules\live_status_monitor.js"
node -c "D:\Streaming\stramAssets\htdocs\dashboard\modules\live_status_monitor.js"

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-status/status?forceApi=1"
$s.moduleVersion
$s.state.streamBus
$s.streamBusEvent

$m = Invoke-RestMethod "http://127.0.0.1:8080/api/live-status-monitor/status?raw=1"
$m.moduleVersion
$m.decision.eventSubConnected
$m.parsed.eventSub
```

## StepDone

```cmd
.\stepdone.cmd "CAN44.34 Twitch Stream Online Offline Bus Events"
```

## Offen

- Echter Live-Wechsel-Test beim nächsten Streamstart/-ende.
- Optional: Abonnenten für `twitch.stream.online/offline` in Modulen planen.
- Optional: Dashboard-Historie um Bus-Events erweitern.
