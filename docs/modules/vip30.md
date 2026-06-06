# VIP30 / 30TageVIP

Stand: 2026-06-06  
Backend-Version: `0.8.8` / `step8.12-sound-bundle-overlay`

## Zweck

VIP30 verwaltet den Kanalpunkte-Reward „30 Tage VIP“.

## STEP8.12 Sound Bundle Overlay

Der VIP30-Reward-Sound läuft über das zentrale Sound-System:

```txt
POST /api/sound/bundle
```

Das Sound-System entscheidet:

```txt
Queue
Priorität
Timing
OutputTarget
Lautstärke
```

Das Sound-System-Overlay zeigt bei VIP30-Items eine eigene VIP30-Card.

## Kein Alert-System

VIP30 nutzt in diesem Step nicht:

```txt
alert_system.js
vip-sound.js
```

## Media-System

Der VIP30-Sound soll über das zentrale Media-System hochgeladen werden. Danach wird die Media-ID in den VIP30-Settings hinterlegt:

```txt
alerts.mediaId
```

Optional:

```txt
alerts.mediaPath
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
