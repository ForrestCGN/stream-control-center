# FILES – stream-control-center

Stand: 2026-06-14

## Aktueller Stand

```text
CAN44.42 – Shoutout / AutoShoutout / Twitch-Events / Live-Status stabiler Arbeitsstand
```

## Relevante Backend-Dateien

```text
backend/modules/clip_shoutout.js
backend/modules/twitch_events.js
backend/modules/stream_status.js
backend/modules/live_status_monitor.js
backend/modules/twitch_presence.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
backend/modules/helpers/helper_texts.js
backend/modules/helpers/helper_settings.js
backend/core/database.js
```

## Relevante Dashboard-Dateien

```text
htdocs/dashboard/modules/live_status_monitor.js
htdocs/dashboard/modules/live_status_monitor.css
htdocs/dashboard/modules/shoutout_v2.js
htdocs/dashboard/modules/shoutout_v2.css
htdocs/dashboard/modules/auto_shoutout.js
htdocs/dashboard/modules/auto_shoutout.css
htdocs/dashboard/modules/shoutout_texts.js
htdocs/dashboard/modules/shoutout_texts.css
htdocs/dashboard/index.html
htdocs/dashboard/app.js
```

## Zuständigkeiten

### backend/modules/twitch_events.js

```text
Zentrale Twitch-Event-Schicht.
Normalisiert Chat-Events.
Stellt Stream-State und StreamSession bereit.
Besitzt twitch.stream.online/offline Bus-Events.
Bietet Manual Override Routen.
```

Wichtige Routen:

```text
GET  /api/twitch/events/status
GET  /api/twitch/events/stream-state
GET  /api/twitch/events/stream-state?refresh=1
POST /api/twitch/events/stream-state/override
POST /api/twitch/events/stream-state/clear-override
GET  /api/twitch/events/stream-session
GET  /api/twitch/events/stream-session?refresh=1
```

### backend/modules/stream_status.js

```text
Zentrale Statusquelle für Twitch API / Streamstatus.
Seit CAN44.35 source-only für Streambus.
twitch.stream.online/offline werden nicht hier, sondern in twitch_events emitted.
```

### backend/modules/live_status_monitor.js

```text
Backend-Auswertung für Dashboard Live-Status.
Vergleicht OBS, Twitch /streams, Twitch Search, stream_status und twitch_events.
```

### backend/modules/clip_shoutout.js

```text
Shoutout-System Backend.
Manueller SO, DisplayQueue, OfficialQueue.
AutoShoutout DB-Konfiguration.
AutoShoutout Consumer für twitch.chat/message und twitch.stream online/offline.
Nutzt zentrale StreamSession/streamDayId.
```

### htdocs/dashboard/modules/live_status_monitor.js

```text
Sichtbarer Live-Status Monitor im Dashboard.
Stream-State Override Controls.
Effektiver Stream-State + echte Quellen getrennt.
```

### htdocs/dashboard/modules/live_status_monitor.css

```text
Styles für Live-Status-Monitor, Override-Bereich, Effektiv-Block und Quellen-Kacheln.
```

### htdocs/dashboard/modules/shoutout_v2.js

```text
Sichtbare Shoutout-Hauptseite.
Tabs: Übersicht, Shoutout, AutoShoutout, Queues, Texte, Auswertung, Diagnose, Einstellungen.
```

### htdocs/dashboard/modules/auto_shoutout.js

```text
Zusätzlich geladenes AutoShoutout-Modul.
CAN44.31 Bridge/Patch für ShoutoutV2 Activity-Anzeige bleibt historisch relevant.
```

## Wichtige Live-Pfade

```text
Repo:
D:\Git\stream-control-center

Live-Ziel:
D:\Streaming\stramAssets

Backend live:
D:\Streaming\stramAssets\backend\modules

Dashboard live:
D:\Streaming\stramAssets\htdocs\dashboard\modules
```

## Wichtige Prüfbefehle

```powershell
node -c "D:\Streaming\stramAssets\backend\modules\twitch_events.js"
node -c "D:\Streaming\stramAssets\backend\modules\clip_shoutout.js"
node -c "D:\Streaming\stramAssets\backend\modules\stream_status.js"
node -c "D:\Streaming\stramAssets\backend\modules\live_status_monitor.js"
node -c "D:\Streaming\stramAssets\htdocs\dashboard\modules\live_status_monitor.js"
```

## Wichtige Statusprüfungen

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$t.moduleVersion
$t.diagnostics.streamState.moduleBuild
$t.diagnostics.streamState.status
$t.diagnostics.streamState.streamSession | ConvertTo-Json -Depth 10

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s.moduleVersion
$s.autoShoutout.state.streamState
$s.autoShoutout.state.streamBusSubscriber
```

## Bekannte aktuelle Versionen

```text
twitch_events.js     0.1.12 CAN44.41_MANUAL_OVERRIDE_LOCK
clip_shoutout.js     0.2.49
stream_status.js     0.1.4
live_status_monitor  0.1.5
Dashboard Live Monitor: CAN44.42 Effective Stream State Display
```

## ZIP-/Deploy-Regel

```text
ZIPs immer mit echten Zielpfaden liefern.
Keine losen Dateien.
Keine produktive SQLite ersetzen.
Nach STEP immer stepdone.cmd mit passender Beschreibung ausführen.
```
