# CURRENT STATUS – VIP30

Stand: 2026-06-06

## Aktueller Stand

STEP8.12 Sound Bundle Overlay wurde vorbereitet.

## Wichtig

Die frühere STEP8.12-Variante mit direktem `/api/sound/play` und hardcoded `soundId=vip30` ist zu ignorieren.

Der korrekte Stand ist:

```txt
VIP30 -> /api/sound/bundle -> Sound-System -> sound_system_overlay.html VIP30-Card
```

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
```

## Nächster Schritt

- ZIP entpacken.
- `node -c backend\modules\vip30.js`.
- `stepdone.cmd`.
- Media-Sound hochladen.
- `alerts.mediaId` setzen.
- Erst danach `live.allowAlert` aktivieren.
