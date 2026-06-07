# VIP30 STEP8.19.21 – Kurzfassung für nächsten Chat

## Kernaussage

Die Kanalpunkte-Kachel ist die Wahrheit.

VIP30 erkennt die passende Kachel über:

```text
actionType = vip30
actionKey  = vip30.redeem
queue      = vip30
```

Nicht mehr über:

```text
Titel
Preis
Prompt
strikten localRewardLinked-Status
```

## Harte Blocker bleiben

```text
Userdaten fehlen
User ist Streamer/Broadcaster
User ist Moderator
User ist bereits VIP
User hat aktiven VIP30-Slot
Slots voll
Twitch-VIP-Grant schlägt fehl
Slot speichern schlägt fehl
```

## Alte Safety-Gates raus als Blocker

```text
live.mode
twitch.liveActionsEnabled
bridge.decisionOnly
live.allowVipGrant
live.allowSlotWrite
live.allowRedemptionFulfillCancel
live.allowAlert
capabilityChecked
twitchCapabilityReady
autoFulfill
Reward-Preis/Titel/Prompt
```

## Nächste Umsetzung

STEP8.19.22 soll `backend/modules/vip30.js` umbauen:

- `buildLiveActionSafetyStatus()` vereinfachen
- alte Safety-Gates aus Blockern entfernen
- Kachelstatus als Wahrheit nutzen
- HTTP 200 nicht mehr als Fehler behandeln
- Chat-/Refund-Fixes behalten
