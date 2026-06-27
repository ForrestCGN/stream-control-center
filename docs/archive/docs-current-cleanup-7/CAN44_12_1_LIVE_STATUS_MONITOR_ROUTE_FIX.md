# CAN-44.12.1 Live-Status Monitor Route Fix

Hotfix für CAN-44.12.

## Problem

Der Backend-Modul-Loader konnte `backend/modules/live_status_monitor.js` nicht laden, weil Express/path-to-regexp die Route `/api/live-status-monitor/*` nicht akzeptiert hat.

Fehler:

```text
Missing parameter name at index 26: /api/live-status-monitor/*
```

## Fix

Die OPTIONS-Catchall-Route wurde auf eine Regex-Route geändert. Dadurch werden die eigentlichen Routen geladen:

- `GET /api/live-status-monitor/status`
- `POST /api/live-status-monitor/test`
- `GET /api/live-status-monitor/logs`
- `GET /api/live-status-monitor/routes`

## Version

`live_status_monitor` 0.1.1
