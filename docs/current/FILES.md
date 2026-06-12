# FILES – stream-control-center

Stand: 2026-06-12

## Aktueller Stand

```text
CAN44.31 – AutoShoutout Bus + ShoutoutV2 Activity Bridge
```

## Aktive Dashboard-Dateien für Shoutout / AutoShoutout

```text
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/modules/shoutout_v2.js
htdocs/dashboard/modules/shoutout_v2.css
htdocs/dashboard/modules/auto_shoutout.js
htdocs/dashboard/modules/auto_shoutout.css
htdocs/dashboard/modules/shoutout_texts.js
htdocs/dashboard/modules/shoutout_texts.css
```

## Aktive Backend-Dateien für Shoutout / AutoShoutout

```text
backend/modules/clip_shoutout.js
backend/modules/twitch_events.js
backend/modules/twitch_presence.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
backend/modules/helpers/helper_texts.js
backend/modules/helpers/helper_settings.js
backend/core/database.js
```

## Zuständigkeiten

### backend/modules/twitch_presence.js

```text
Twitch IRC/Bot-Verbindung
Chat senden
IRC-Chat empfangen und an twitch_events weitergeben
Keine AutoShoutout-Fachlogik
Direct command hook bleibt standardmäßig aus
```

### backend/modules/twitch_events.js

```text
Zentrale Twitch-Event-Normalisierung
EventSub Chat / IRC Chat normalisieren
Communication Bus Event twitch.chat/message emittieren
Quelle für AutoShoutout-Buspfad
```

### backend/modules/communication_bus.js + helper_communication.js

```text
Communication/EventBus
channel/action/capability matching
in-process module-to-module subscriptions
subscriber deliveries / diagnostics
```

### backend/modules/clip_shoutout.js

```text
Shoutout-System Backend
Manueller SO
DisplayQueue / Video-SO
OfficialQueue / Twitch-SO
AutoShoutout-Regeln
AutoShoutout-Bus-Subscriber clip_shoutout:twitch.chat:message:auto_shoutout
```

### htdocs/dashboard/modules/shoutout_v2.js

```text
Aktive sichtbare Shoutout-Hauptseite im Dashboard
Tabs: Übersicht, Shoutout, AutoShoutout, Queues, Texte, Auswertung, Diagnose, Einstellungen
Rendert sichtbare AutoShoutout-Karte mit Streamer-Verwaltung und Aktivitätsliste
```

### htdocs/dashboard/modules/auto_shoutout.js

```text
Zusätzlich geladenes AutoShoutout-Modul
CAN44.30 kompakte Activity-Liste vorbereitet
CAN44.31 Bridge/Patch für sichtbare ShoutoutV2-Aktivitätskarte
Build-Prüfung: window.AutoShoutoutV2ActivityPatch?.build
```

### htdocs/dashboard/modules/auto_shoutout.css

```text
Styles für kompakte AutoShoutout-Aktivitätsliste
Info-Button
Modal / Backdrop
Detail-Grid
Rohdaten-Details
```

## Wichtige Live-Pfade

```text
Repo:
D:\Git\stream-control-center

Live-Ziel:
D:\Streaming\stramAssets

Dashboard Live-Dateien:
D:\Streaming\stramAssets\htdocs\dashboard\modules\shoutout_v2.js
D:\Streaming\stramAssets\htdocs\dashboard\modules\auto_shoutout.js
D:\Streaming\stramAssets\htdocs\dashboard\modules\auto_shoutout.css
```

## Wichtige Routen

```text
GET  /api/clip-shoutout/status
GET  /api/clip-shoutout/auto
GET  /api/clip-shoutout/auto/streamers
POST /api/clip-shoutout/auto/streamers
POST /api/clip-shoutout/auto/streamers/remove
GET  /api/clip-shoutout/auto/test-chat
POST /api/clip-shoutout/auto/clear-target
GET  /api/communication/status
GET  /api/twitch/events/status
```

## Prüfbefehle

```powershell
node -c .\backend\modules\clip_shoutout.js
node -c .\backend\modules\twitch_events.js
node -c .\htdocs\dashboard\modules\shoutout_v2.js
node -c .\htdocs\dashboard\modules\auto_shoutout.js
```

Live-Auslieferung prüfen:

```powershell
(Invoke-WebRequest "http://127.0.0.1:8080/dashboard/modules/auto_shoutout.js?cachetest=$(Get-Random)" -UseBasicParsing).Content |
  Select-String -Pattern "AutoShoutoutV2ActivityPatch","CAN44.31_AUTOSO_V2_ACTIVITY_MODAL_BRIDGE","data-auto-so-activity-info"
```

## ZIP-/Deploy-Regel

ZIPs immer mit echten Zielpfaden liefern, z. B.:

```text
backend/modules/clip_shoutout.js
htdocs/dashboard/modules/auto_shoutout.js
htdocs/dashboard/modules/auto_shoutout.css
docs/current/CURRENT_STATUS.md
project-state/CAN44_31_AUTOSHOUTOUT_BUS_DASHBOARD_STATUS.md
```

Keine losen Dateien ohne Zielpfad.
