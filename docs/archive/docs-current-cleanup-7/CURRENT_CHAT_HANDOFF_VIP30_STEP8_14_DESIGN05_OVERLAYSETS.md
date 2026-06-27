# CURRENT CHAT HANDOFF – VIP30 / 30TageVIP – STEP8.14 Design05 + OverlaySets

Stand: 2026-06-06

## Ergebnis

STEP8.14 übernimmt das gewählte VIP30-Testdesign `Design 05 – Split Lounge` in das produktive Sound-System-Overlay und ergänzt gewichtete Overlay-Textsets nach dem Muster der SO-Overlay-Sets.

## Flow

```txt
VIP30 Erfolg
-> Backend wählt zufällig ein aktives OverlaySet
-> /api/sound/bundle
-> Sound-System
-> sound_system_overlay.html erkennt visual.module=vip30
-> VIP30 Split-Lounge-Card wird angezeigt
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

## Neue Settings

```txt
alerts.overlaySets
```

Typ: JSON

Ein Set:

```json
{
  "id": "heimleitung-upgrade",
  "enabled": true,
  "weight": 3,
  "kicker": "Upgrade im CGN-Altersheim",
  "headline": "{displayName} wird Ehrenbewohner.",
  "subline": "Die Rentner begrüßen freundlich, die Heimleitung nickt anerkennend.",
  "message": "Ein kleines VIP-Upgrade wurde genehmigt.",
  "perks": ["Keks extra", "Klecks Soße mehr", "gemütlicherer Sessel"],
  "brand": "CGN VIP-Lounge"
}
```

Platzhalter:

```txt
{displayName}
{userDisplayName}
{login}
{userLogin}
```

## Dashboard

`alerts.overlaySets` ist im VIP30 Config-Tab als JSON-Textarea editierbar. Ein richtiger komfortabler Editor kann später in STEP8.15 folgen.

## Test

```powershell
cd /d D:\Git\stream-control-center
node -c backend\modules\vip30.js
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.14 Design05 OverlaySets"
```

Danach Test-Bundle an `/api/sound/bundle` schicken oder echte VIP30-Redemption testen.
