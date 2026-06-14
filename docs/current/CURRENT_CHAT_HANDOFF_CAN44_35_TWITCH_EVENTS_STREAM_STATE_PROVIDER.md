# CURRENT CHAT HANDOFF – CAN44.35 Twitch Events Stream State Provider

## Stand

Nach CAN44.32/33 ist AutoShoutout stabiler, `storeSkippedEvents` ist aktivierbar und die Settings-Wahrheit wurde auf effektive DB-Werte umgestellt.

CAN44.34 hat den Live-Status-Monitor korrigiert und erste Online/Offline-Bus-Events in `stream_status` vorbereitet. Forrest hat danach klargestellt, dass die zentrale Twitch-Event-Ausgabe ueber `twitch_events` laufen soll.

CAN44.35 verschiebt die produktive Twitch-Stream-Event-Ausgabe in `twitch_events`.

## Architektur

```text
live_status_monitor / stream_status / OBS / Twitch API
  -> twitch_events streamState provider
  -> Communication Bus
     - twitch.stream.online
     - twitch.stream.offline
```

`stream_status` bleibt zentrale Live-/Session-Quelle, published aber keine `twitch.stream.*` Events mehr direkt, damit keine Duplikate entstehen.

## Neue Routen

```text
GET  /api/twitch/events/stream-state
GET  /api/twitch/events/stream-state?refresh=1
POST /api/twitch/events/stream-state/override
GET  /api/twitch/events/stream-state/override?live=true&reason=test
POST /api/twitch/events/stream-state/clear-override
GET  /api/twitch/events/stream-state/clear-override
```

## Manual Override

Der Stream-State kann fuer Tests manuell auf online/offline gesetzt werden. Dieser Override ist klar im Status sichtbar und hat standardmaessig TTL.

## Test nach Einspielen

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$t.moduleVersion
$t.diagnostics.streamState

$ss = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/stream-state?refresh=1"
$ss.streamState | ConvertTo-Json -Depth 8
```

## StepDone

```cmd
.\stepdone.cmd "CAN44.35 Twitch Events Stream State Provider"
```

## Naechste sinnvolle Schritte

1. Live-System einspielen.
2. Node Syntax testen.
3. `stream-state?refresh=1` pruefen.
4. Manual Override online/offline testen und Bus-Event-Counter in `twitch_events` pruefen.
5. Danach Module wie AutoShoutout, Alerts, Giveaways gezielt gegen `twitch.stream.online/offline` abonnieren.
