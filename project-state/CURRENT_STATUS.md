# CURRENT STATUS – VIP30

Stand: 2026-06-06

## Aktueller Stand

STEP8.13 Dashboard Media Field ist vorbereitet.

## Aktueller Flow

```txt
VIP30 Dashboard
-> Sound per Media-System hochladen/auswählen
-> alerts.mediaId speichern
-> VIP30 Erfolg
-> /api/sound/bundle
-> Sound-System
-> sound_system_overlay.html VIP30-Card
```

## Geändert

```txt
backend/modules/vip30.js
htdocs/overlays/sound_system_overlay.html
htdocs/dashboard/modules/vip30.js
htdocs/dashboard/modules/vip30.css
```

## Nicht geändert

```txt
backend/modules/sound_system.js
backend/modules/media.js
backend/modules/alert_system.js
backend/modules/vip-sound.js
htdocs/dashboard/components/media_field.js
htdocs/dashboard/components/media_picker.js
```

## Wichtig

`live.allowAlert` erst aktivieren, wenn ein VIP30-Sound über das Media-System ausgewählt und gespeichert wurde.
