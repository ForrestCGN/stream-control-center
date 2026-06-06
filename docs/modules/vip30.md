# VIP30 / 30TageVIP

Stand: 2026-06-06  
Backend-Version: `0.8.9` / `step8.14-overlay-sets-design05`

## Sound-/Media-/Overlay-Flow

```txt
Media-System: Upload / Registry / Dauer / Asset-ID
Sound-System: Queue / Priorität / Playback / Output / Overlay
Sound-System-Overlay: VIP30 Split-Lounge-Card
VIP30: erzeugt Sound-Bundle und wählt OverlaySet
```

## Overlay-Design

Das produktive VIP30-Overlay nutzt jetzt das gewählte `Design 05 – Split Lounge`:

```txt
links: Avatar + 30 Tage VIP
rechts: Kicker, Headline, Subline, Message, Perks, Brand
```

## OverlaySets

VIP30 nutzt gewichtete, zusammengehörige Textsets:

```txt
kicker
headline
subline
message
perks
brand
weight
enabled
```

Damit bleiben Headline/Subline/Perks passend zusammen.

## Dashboard

Im Config-Tab kann `alerts.overlaySets` als JSON bearbeitet werden.  
Der Media-Sound wird weiterhin über das MediaField ausgewählt und in `alerts.mediaId` gespeichert.

## Kein Alert-System

VIP30 nutzt nicht:

```txt
alert_system.js
vip-sound.js
```
