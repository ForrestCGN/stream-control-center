# VIP30 / 30 Tage VIP

Stand: STEP8.2  
Version: 0.8.2  
Build: `step8.2-live-gates-api-stage-a`

## Ziel

Das VIP30-System läuft über Node und verarbeitet den bestehenden Twitch-Kanalpunkte-Reward `30 Tage VIP` über EventSub und den internen Channelpoints/EventBus-Weg.

## Aktueller Stand

- Twitch-Reward ist lokal als `vip30` verknüpft.
- Kosten-Testwert: `1` Kanalpunkt.
- EventSub-Live-DryRun wurde erfolgreich getestet.
- `ensure` funktioniert wieder.
- Live-Aktionen bleiben weiterhin über Safety-Gates kontrolliert.

## Neue STEP8.2-Routen

```txt
GET  /api/vip30/live/arm-settings-preview
POST /api/vip30/live/set-gates?confirm=YES&profile=stage_a
```

## Stage A

Stage A setzt nur die vorbereitenden Gates:

```txt
live.enabled = true
live.mode = live
twitch.liveActionsEnabled = true
bridge.decisionOnly = false
live.allowVipGrant = true
live.allowSlotWrite = true
live.allowRedemptionFulfillCancel = false
live.allowAlert = false
```

Damit bleiben Fulfill/Cancel und Alert bewusst gesperrt. Die Route selbst führt keine Twitch-Schreibaktion aus.

## Safety

STEP8.2 selbst macht weiterhin:

```txt
kein Twitch-Write
kein VIP-Grant
kein Slot-Write
kein Fulfill/Cancel
kein Alert
```

Die Gates bereiten nur den nächsten Implementierungsschritt vor.
