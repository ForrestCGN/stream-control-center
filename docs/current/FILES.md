# FILES – stream-control-center

Stand: 2026-06-15

## Aktueller Stand

```text
LC-CORE-LIVE-1.1 – Loyalty nutzt twitch_events Stream-State als effektive Live-Wahrheit
```

## Relevante Backend-Dateien

```text
backend/modules/loyalty.js
backend/modules/twitch_events.js
backend/modules/clip_shoutout.js
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
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/index.html
htdocs/dashboard/app.js
```

## Zuständigkeiten

### backend/modules/twitch_events.js

```text
Zentrale Twitch-Event- und Stream-State-Schicht.
Besitzt /api/twitch/events/stream-state.
Besitzt Manual Override Routen.
Emittiert twitch.stream.online/offline über Communication Bus.
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

### backend/modules/loyalty.js

```text
Loyalty/Kekskrümel Core.
Seit LC-CORE-LIVE-1.1 Consumer von /api/twitch/events/stream-state.
Nutzt loyalty_stream_state aktuell als lokalen Runner-/Dashboard-Spiegel.
Runner startet/stoppt anhand des zentralen Stream-State.
```

Aktuelle relevante Routen:

```text
GET  /api/loyalty/stream-status-binding/status
GET  /api/loyalty/stream-status-binding/sync
POST /api/loyalty/stream-status-binding/sync
GET  /api/loyalty/stream-state
GET  /api/loyalty/runner/status
GET  /api/loyalty/runner/run-once
POST /api/loyalty/runner/run-once
```

Altlasten für Cleanup-Prüfung:

```text
refreshAutoStreamStateFromTwitch()
parseExternalLivePayload()
/api/loyalty/stream-state/refresh-auto
alte Loyalty-eigene StreamState-Manual-Routen, soweit nicht mehr aktiv gebraucht
```

### backend/modules/stream_status.js

```text
Source-only Statusquelle für Twitch API / Streamstatus.
Nicht als alleinige effektive Live-Wahrheit für Module nutzen.
twitch.stream.online/offline werden nicht hier, sondern in twitch_events emitted.
```

### backend/modules/live_status_monitor.js

```text
Backend-Auswertung für Dashboard Live-Status.
Vergleicht OBS, Twitch /streams, Twitch Search, stream_status und twitch_events.
```

### htdocs/dashboard/modules/live_status_monitor.js

```text
Dashboard Live-Status-Monitor.
Zeigt effektiven Stream-State aus twitch_events Stream-State und echte Quellen getrennt.
Bietet Override-Buttons für Tests.
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
node -c "D:\Streaming\stramAssets\backend\modules\loyalty.js"
node -c "D:\Streaming\stramAssets\backend\modules\twitch_events.js"
node -c "D:\Streaming\stramAssets\backend\modules\clip_shoutout.js"
node -c "D:\Streaming\stramAssets\backend\modules\stream_status.js"
node -c "D:\Streaming\stramAssets\backend\modules\live_status_monitor.js"
```

## Wichtige Statusprüfungen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/stream-state" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-status-binding/sync?controlRunner=true&sourceKind=stream_state" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 8
```

## ZIP-/Deploy-/StepDone-Regel

```text
ZIPs immer mit echten Zielpfaden liefern.
Keine losen Dateien.
Keine produktive SQLite ersetzen.
Nach Einspielen/Deploy stepdone.cmd mit passender Beschreibung ausführen.
Danach testen.
Nach erfolgreichem Test kein zweites StepDone.
```
