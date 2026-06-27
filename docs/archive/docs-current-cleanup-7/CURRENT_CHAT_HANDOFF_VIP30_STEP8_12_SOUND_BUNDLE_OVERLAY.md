# CURRENT CHAT HANDOFF – VIP30 / 30TageVIP – STEP8.12 Sound Bundle Overlay

Stand: 2026-06-06

## Ergebnis

STEP8.12 bindet VIP30 korrekt an das bestehende Sound-System und dessen Overlay an.

## Architektur

```txt
VIP30 Erfolg
-> POST /api/sound/bundle
-> Sound-System entscheidet Queue/Priorität/Timing/Output
-> sound_system_overlay.html erkennt visual.module = vip30
-> eigene VIP30-Card wird angezeigt
```

## Wichtig

VIP30 spielt nichts selbst ab.  
VIP30 nutzt kein Alert-System.  
VIP30 nutzt nicht vip-sound.js.  
Das zentrale Sound-/Media-System bleibt zuständig.

## Geändert

```txt
backend/modules/vip30.js
htdocs/overlays/sound_system_overlay.html
```

## Nicht geändert

```txt
backend/modules/sound_system.js
backend/modules/media.js
backend/modules/alert_system.js
backend/modules/vip-sound.js
htdocs/dashboard/...
```

## VIP30-Konfiguration

Neu/erweitert:

```txt
alerts.mediaId
alerts.mediaPath
alerts.soundBundleUrl = /api/sound/bundle
alerts.outputTarget = overlay
alerts.target = stream
alerts.priority = 90
alerts.volume = 85
```

Ohne `alerts.mediaId` oder `alerts.mediaPath` wird der Alert übersprungen mit:

```txt
media_not_configured
```

## Overlay-Safety

`sound_system_overlay.html` wurde nur additiv erweitert:

```txt
neue VIP30-Card
neue isVip30Item-Erkennung
neue playVip30Item-Funktion
```

Bestehende Clip-Shoutout-/Video-/Audio-/Twitch-Clip-Logik wurde nicht ersetzt.

## Test

```powershell
cd /d D:\Git\stream-control-center
node -c backend\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.12 Sound Bundle Overlay"
```

Danach:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/alert/status" | ConvertTo-Json -Depth 6
```

## Vor Live-Freigabe

1. VIP30-Sound über Media-System hochladen.
2. Media-ID in VIP30-Settings setzen.
3. Sound-System-Overlay in OBS prüfen.
4. Erst dann `live.allowAlert` aktivieren.
