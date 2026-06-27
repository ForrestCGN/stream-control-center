# CURRENT CHAT HANDOFF – VIP30 / 30TageVIP – STEP8.13 Dashboard Media Field

Stand: 2026-06-06

## Ergebnis

STEP8.13 ergänzt das VIP30-Dashboard um eine Media-System-Auswahl für den VIP30-Alert-Sound.

## Architektur

```txt
VIP30 Dashboard
-> VIP30 Alert-Sound auswählen / hochladen
-> MediaPicker / MediaField
-> moduleKey = vip30
-> categoryKey = alerts
-> type = audio
-> alerts.mediaId wird gespeichert
```

Danach nutzt VIP30 bei erfolgreichem Live-Flow:

```txt
VIP30 -> /api/sound/bundle -> Sound-System -> sound_system_overlay.html VIP30-Card
```

## Geändert

```txt
backend/modules/vip30.js
htdocs/overlays/sound_system_overlay.html
htdocs/dashboard/modules/vip30.js
htdocs/dashboard/modules/vip30.css
```

## Cumulativ

Diese ZIP enthält STEP8.12 + STEP8.13, damit kein Zwischenstand fehlt.

## Nicht geändert

```txt
backend/modules/sound_system.js
backend/modules/media.js
backend/modules/alert_system.js
backend/modules/vip-sound.js
htdocs/dashboard/components/media_field.js
htdocs/dashboard/components/media_picker.js
```

## Dashboard

Im Config-Tab gibt es nun eine eigene Karte:

```txt
VIP30 Alert-Sound
[VIP30-Sound auswählen / hochladen]
[Sound entfernen]
```

Die Auswahl schreibt in:

```txt
alerts.mediaId
```

## Test

```powershell
cd /d D:\Git\stream-control-center
node -c backend\modules\vip30.js
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.13 Dashboard Media Field"
```

Danach Dashboard öffnen:

```txt
VIP30 -> Config -> VIP30 Alert-Sound
```

Sound hochladen/auswählen und anschließend „Sichere Settings speichern“ klicken.

## Vor Live-Freigabe

```txt
live.allowAlert bleibt aus, bis Media-ID gesetzt und Sound-System-Overlay getestet ist.
```
