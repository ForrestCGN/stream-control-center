# CAN-44.6 AutoShoutout als Shoutout-Tab

## Zweck

AutoShoutout wird im bestehenden Shoutout-System als Tab `Auto-Shoutouts` angezeigt.

## Stream-sicherer Ansatz

- kein MutationObserver
- kein separates Dashboard-Modul / kein eigener Community-Menüpunkt
- keine Backend-Änderung gegenüber CAN-44.4 / 0.2.17
- Auto-SO nutzt weiterhin DisplayQueue, Video-Shoutout und OfficialQueue
- beim Auto-Tab wird der normale Shoutout-Auto-Refresh pausiert, damit Eingabefelder nicht überschrieben werden
- Auto-SO-eigener Refresh pausiert ebenfalls bei fokussierten/geänderten Formularen

## Dateien

- backend/modules/clip_shoutout.js
- config/clip_system.json
- htdocs/dashboard/index.html
- htdocs/dashboard/modules/auto_shoutout.js
- htdocs/dashboard/modules/auto_shoutout.css

## Test

```powershell
cd D:\Git\stream-control-center
node -c backend\modules\clip_shoutout.js
node -c htdocs\dashboard\modules\auto_shoutout.js
.\stepdone.cmd "CAN-44.6 AutoShoutout als Shoutout-Tab"
```

Danach Node neu starten und Dashboard hart neu laden.

## Bedienung

Dashboard -> Shoutout-System -> Tab `Auto-Shoutouts`.
