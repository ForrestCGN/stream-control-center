# STEP511 Channelpoints EventBus Redemption Bridge v0.9.1

## Ziel

Echte Twitch-Kanalpunkte-Einlösungen sollen nicht per HTTP-Modulbrücke an `channelpoints.js` weitergereicht werden, sondern über den bestehenden Communication/EventBus.

## Geänderte Dateien

- `backend/modules/channelpoints.js`
- `backend/modules/channelpoints_eventsub_bus_bridge.js`
- `docs/modules/channelpoints_eventbus_redemption_bridge.md`

## Ablauf

```text
Twitch EventSub
→ twitch.js schreibt EventSub-Audit/Cache
→ channelpoints_eventsub_bus_bridge.js erkennt Kanalpunkte-Redemption
→ EventBus emit: channelpoints.redemption / received
→ channelpoints.js Subscriber verarbeitet die Einlösung
→ aktive/inaktive Reward-Regel entscheidet über Ausführung
```

## EventBus Event

```text
channel: channelpoints.redemption
action: received
source.module: twitch_eventsub
```

Payload enthält die rohe Twitch-Redemption unter `event` plus normalisierte Basisfelder wie `twitchRedemptionId`, `twitchRewardId`, `userLogin`, `userDisplayName`, `rewardTitle`, `rewardCost` und `userInput`.

## Keine Zusatzmodi

- Kein Shadow-/Live-/Allowlist-Konzept
- Kein HTTP-POST zwischen Twitch-Modul und Channelpoints-Modul
- Keine neue Tabelle
- Keine DB-Migration
- Keine Dashboard-Aufblähung

Die bestehende Regel bleibt:

```text
Reward inaktiv → nicht ausführen
Reward aktiv + Aktion vollständig → ausführen
Reward ohne Aktion → nicht ausführen
```

## Statusrouten

```text
/api/channelpoints/eventbus/redemption-bridge/status
/api/channelpoints/eventsub/redemption/status
/api/communication/status
```

## Test

Nach Installation:

```bat
cd D:\Git\stream-control-center
node --check backend\modules\channelpoints.js
node --check backend\modules\channelpoints_eventsub_bus_bridge.js
.\stepdone.cmd "STEP511 Channelpoints EventBus Redemption Bridge v0.9.1"
```

Dann Server neu starten und den Reward erneut auf Twitch einlösen.

Erwartung:

```text
/api/channelpoints/eventsub/redemption/status
received > 0
receivedFromBus > 0
stored > 0
executed > 0
```
