# VIP30 / 30TageVIP

Stand: 2026-06-06  
Backend-Version: `0.8.9` / `step8.14-overlay-sets-design05`

## Aktueller Flow

```txt
VIP30 Erfolg
-> Backend wählt OverlaySet
-> /api/sound/bundle
-> Sound-System
-> sound_system_overlay.html
-> CGN Split Lounge / VIP30 Design 05
```

## Designreferenzen

Allgemeine Designbasis:

```txt
docs/design/CGN_SPLIT_LOUNGE_DESIGN.md
```

Konkrete VIP30-Ausprägung:

```txt
docs/design/VIP30_SPLIT_LOUNGE_DESIGN.md
```

Wichtig: Das Design soll bei späteren Modulen situationsbezogen angepasst werden, nicht blind 1:1 kopiert werden.

## OverlaySets

VIP30 nutzt gewichtete, zusammengehörige Textsets:

```txt
id
enabled
weight
kicker
headline
subline
message
perks
brand
```

## Media-/Sound-System

Der VIP30-Sound wird über das Media-System hochgeladen und als `alerts.mediaId` gespeichert.

Das Sound-System übernimmt Queue, Priorität, Playback, Output und Overlay-Ausgabe.

## Kein Alert-System

VIP30 nutzt für diesen Flow nicht:

```txt
alert_system.js
vip-sound.js
```
