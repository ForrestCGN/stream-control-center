# FILES – stream-control-center

Stand: 2026-06-15

## Aktueller Stand

```text
LC-CORE-CLEANUP-1 – Loyalty alte lokale StreamState- und Twitch-Direktlogik entfernt
```

## Geänderte Dateien

```text
backend/modules/loyalty.js
htdocs/dashboard/modules/loyalty.js
docs/current/STEP_LC_CORE_CLEANUP_1_LOYALTY_STREAMSTATE_CLEANUP.md
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/FILES.md
docs/current/CHANGELOG.md
```

## Relevante Backend-Dateien

```text
backend/modules/loyalty.js              Loyalty Core, Stream-State Consumer, Runner/Watch/Punkte
backend/modules/twitch_events.js        zentrale Stream-State-/Bus-Schicht
backend/modules/stream_status.js        source-only Statusquelle
backend/modules/live_status_monitor.js  Diagnose/Quellenvergleich
backend/modules/communication_bus.js    zentraler Bus
```

## Relevante Dashboard-Dateien

```text
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty.css
htdocs/dashboard/modules/live_status_monitor.js
htdocs/dashboard/modules/twitch_events.js
```

## Loyalty-Routen nach Cleanup

Wichtig im Cleanup-Kontext:

```text
GET  /api/loyalty/stream-state
GET  /api/loyalty/stream-status-binding/status
GET  /api/loyalty/stream-status-binding/sync
POST /api/loyalty/stream-status-binding/sync
GET  /api/loyalty/runner/status
GET  /api/loyalty/runner/run-once
POST /api/loyalty/runner/run-once
GET  /api/loyalty/runner/start
POST /api/loyalty/runner/start
GET  /api/loyalty/runner/stop
POST /api/loyalty/runner/stop
```

Entfernt:

```text
GET/POST /api/loyalty/stream-state/start
GET/POST /api/loyalty/stream-state/stop
GET/POST /api/loyalty/stream-state/clear-override
GET/POST /api/loyalty/stream-state/refresh-auto
```

## Zentrale Live-Wahrheit

```text
GET  /api/twitch/events/stream-state
POST /api/twitch/events/stream-state/override
POST /api/twitch/events/stream-state/clear-override
```

## Prüfbefehle

```powershell
node -c "D:\Streaming\stramAssets\backend\modules\loyalty.js"
node -c "D:\Streaming\stramAssets\htdocs\dashboard\modules\loyalty.js"
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/routes" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/stream-state" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-status-binding/sync?controlRunner=true&sourceKind=stream_state" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 8
```
