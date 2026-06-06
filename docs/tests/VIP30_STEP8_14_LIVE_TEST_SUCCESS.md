# VIP30 STEP8.14.3 – Live-Test erfolgreich

Stand: 2026-06-06  
Modul: `vip30`  
Version: `0.8.9`  
Build: `step8.14-overlay-sets-design05`

## Ergebnis

Der echte VIP30-Live-Test war erfolgreich.

Getesteter Flow:

```txt
Twitch Reward Einlösung
-> Twitch EventSub Redemption
-> Channelpoints Bridge
-> VIP30 Decision
-> Twitch VIP Grant
-> VIP30 Slot Write
-> Redemption Fulfill
-> Sound-System Bundle
-> Sound-System Overlay
-> CGN Split Lounge Design
```

## Erfolgreich bestätigte Werte

### Bridge

```txt
status: listening_channelpoints_redemption
enabled: true
subscribed: true
decisionOnly: false
stats.received: 1
stats.matched: 1
stats.decisions: 1
stats.errors: 0
lastReason: vip_granted_slot_created_redemption_fulfilled
lastRewardTitle: 30 Tage VIP
lastRewardId: 5932e698-9a57-4d13-9acc-c397682c10a6
lastUserLogin: akighosty
```

### EventSub

EventSub war verbunden und die Redemption-Subscription war aktiv:

```txt
connected: true
readyState: OPEN
channel.channel_points_custom_reward_redemption.add aktiv
lastNotificationType: channel.vip.add
```

Im EventSub-Recent-Log waren sichtbar:

```txt
channel.channel_points_custom_reward_redemption.add
channel.vip.add
```

### Slot

Neuer aktiver Slot wurde geschrieben:

```txt
slotId: 3
userLogin: akighosty
userDisplayName: AkiGhosty
status: active
source: live_stage_b_eventsub
startUtc: 2026-06-06T11:44:36.745Z
endUtc: 2026-07-06T11:44:36.745Z
twitchRedemptionId: 6dea4fcc-9528-44bf-98e4-db5936e945cc
```

### Alert / Sound

```txt
triggers: 1
skipped: 0
failed: 0
lastStatus: sound_bundle_queued
lastReason: sound_bundle_queued
lastUserLogin: akighosty
mediaId: 1413
mediaConfigured: true
delivery: sound_bundle
overlaySetCount: 4
```

## Design

Das neue Overlay-Design ist aktiv:

```txt
CGN Split Lounge / VIP30 Design 05
```

Dokumentierte Designreferenzen:

```txt
docs/design/CGN_SPLIT_LOUNGE_DESIGN.md
docs/design/VIP30_SPLIT_LOUNGE_DESIGN.md
```

## Reward-Testzustand

Der Twitch-Reward wurde für den Test manuell aktiviert/deaktiviert.

Wichtig:

```txt
desired.twitchIsEnabled: false
```

Wenn der Reward für einen Test oder Livebetrieb aktiv ist, kann der Status zeigen:

```txt
existing.twitchIsEnabled: true
desired.twitchIsEnabled: false
inSync: false
```

Das ist nur ein Status-Unterschied zwischen aktuellem Twitch-Zustand und gewünschter VIP30-Soll-Konfiguration. Für den sicheren Endzustand soll der Reward wieder deaktiviert sein.

## Fazit

STEP8.14 ist vollständig grün:

```txt
✅ VIP30 Backend 0.8.9 aktiv
✅ EventSub Redemption empfangen
✅ Bridge matched VIP30 Reward
✅ VIP wurde vergeben
✅ Slot wurde gespeichert
✅ Redemption wurde erfüllt
✅ Sound-Bundle wurde queued
✅ Sound/Overlay funktionieren
✅ CGN Split Lounge Design aktiv
✅ OverlaySets geladen
```
