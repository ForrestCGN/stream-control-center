# VIP30 / 30TageVIP

Stand: 2026-06-06  
Backend-Version: `0.8.8` / `step8.12-sound-bundle-overlay`  
Dashboard-Stand: `STEP8.13 Dashboard Media Field`

## Zweck

VIP30 verwaltet den Kanalpunkte-Reward „30 Tage VIP“.

## Sound-/Media-Flow

Der VIP30-Reward-Sound läuft über das zentrale Media- und Sound-System:

```txt
Media-System: Upload / Registry / Dauer / Asset-ID
Sound-System: Queue / Priorität / Playback / Output / Overlay
Sound-System-Overlay: VIP30-Card
VIP30: erzeugt nur das Sound-Bundle
```

## Dashboard Media-Auswahl

Im VIP30-Dashboard gibt es unter Config eine Karte:

```txt
VIP30 Alert-Sound
```

Diese nutzt die vorhandenen Dashboard-Komponenten:

```txt
MediaField
MediaPicker
```

Vorgaben:

```txt
moduleKey = vip30
categoryKey = alerts
allowedTypes = audio
```

Gespeichert wird:

```txt
alerts.mediaId
```

## Kein Alert-System

VIP30 nutzt hier nicht:

```txt
alert_system.js
vip-sound.js
```

## Alert-Gates

Ein VIP30-Sound-Bundle wird nur erzeugt, wenn:

```txt
VIP30-Live-Flow erfolgreich
alerts.enabled = true
live.allowAlert = true
alerts.mediaId > 0 oder alerts.mediaPath gesetzt
```

## Kein Sound bei

```txt
Refund / Cancel
Slot voll
User bereits VIP
User hat aktiven VIP30-Slot
Cleanup
external_removed
Admin-Aktionen
Fehlern
```
