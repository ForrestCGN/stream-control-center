# CHANGELOG – LC Core / Twitch Events / Alert Shadow

Stand: 2026-06-15

## LC-CORE-POINTS-3B

- `twitch.js` leitet Twitch Support-Events parallel an `twitch_events.handleEventSubNotification(...)` weiter.
- Live-Test mit `channel.cheer` erfolgreich.

## LC-CORE-POINTS-3C

- `loyalty.js` nutzt 7 gezielte Twitch-Event-Subscriptions.
- Breiter `sourceModule=twitch_events/action=received`-Filter ersetzt.
- `skipped` durch rohe EventSub-Events bereinigt.

## LC-CORE-POINTS-3C1

- Hotfix für `/api/twitch/eventsub/status`.
- Nicht vorhandene Referenz `getTwitchAlertBridgeConfig()` entfernt.

## LC-CORE-POINTS-3D

- Alter Loyalty-Direktforward standardmäßig deaktiviert.
- Fallback per `TWITCH_EVENTSUB_LOYALTY_DIRECT_FORWARD=true` bleibt möglich.

## LC-CORE-POINTS-3E

- Deaktivierter Legacy-Loyalty-Direktforward wird nicht mehr pro Event aufgerufen.
- Kein unnötiger `skipped`-Zähler mehr bei deaktiviertem Legacy-Pfad.

## ALERT-TWITCH-1A

- `alert_system.js` subscribed im Shadow-Modus auf Twitch-Events.
- Shadow-Mapping live mit Cheer/Bits bestätigt.

## ALERT-TWITCH-1B

- Alert-Bus-Weg ist schaltbar vorbereitet.
- Standard bleibt `shadow`.
- Produktiver Bus-Modus benötigt `ALERT_TWITCH_EVENTS_ALERT_MODE=bus` und `ALERT_TWITCH_EVENTS_ALERT_ALLOW_BUS=true`.
