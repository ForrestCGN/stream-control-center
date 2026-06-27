# CURRENT CHAT HANDOFF – BUS-TWITCH.14

Stand: 2026-06-10

## Aktueller Stand

BUS-TWITCH.14 ergänzt einen Parallel-Tap für Channelpoints Redemptions.

```text
twitch.js EventSub notification
→ bestehende VIP30/Channelpoints/Alert/Loyalty-Flows bleiben aktiv
→ zusätzlich twitch_events.handleEventSubNotification(...)
→ communication_bus: twitch.channelpoints.redemption.created
```

## Geänderte Dateien

```text
backend/modules/twitch.js
backend/modules/twitch_events.js
```

## Testbefehle

```powershell
node -c .\backend\modules\twitch.js
node -c .\backend\modules\twitch_events.js
```

```powershell
$p = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/channelpoints-parallel/status"
$p.channelpointsTwitchEventsParallel
```

Nach echter Channelpoints-Einlösung:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$s.diagnostics.counts.byEvent.'twitch.channelpoints.redemption.created'
```

## Nächster Schritt

BUS-TWITCH.15 – VIP30 Subscriber vorbereiten.
