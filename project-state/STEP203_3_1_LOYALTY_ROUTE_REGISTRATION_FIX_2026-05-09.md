# STEP203.3.1 - Loyalty Route Registration Fix

Stand: 2026-05-09

## Problem

Nach STEP203.3 waren Version, Schema und Settings aktiv:

```text
loyalty version 0.1.2
schema version 3
settings count 43
```

Aber die neuen Stream-State-/Presence-Routen waren nicht registriert:

```text
Cannot GET /api/loyalty/stream-state
Cannot GET /api/loyalty/presence/status
Cannot GET /api/loyalty/presence/run-once
```

Ursache:

```text
Die neuen Hilfsfunktionen und Schema-Erweiterungen waren vorhanden,
aber die Route-Registrierung in registerRoutes(app) fehlte.
```

## Fix

In `backend/modules/loyalty.js` wurden die fehlenden Routen in `registerRoutes(app)` ergänzt.

## Betroffene Datei

```text
backend/modules/loyalty.js
```

## Neue/aktive Routen nach Fix

```text
GET  /api/loyalty/stream-state
POST /api/loyalty/stream-state/start
GET  /api/loyalty/stream-state/start
POST /api/loyalty/stream-state/stop
GET  /api/loyalty/stream-state/stop
POST /api/loyalty/stream-state/clear-override
GET  /api/loyalty/stream-state/clear-override
POST /api/loyalty/stream-state/refresh-auto
GET  /api/loyalty/stream-state/refresh-auto
GET  /api/loyalty/presence/status
POST /api/loyalty/presence/run-once
GET  /api/loyalty/presence/run-once
```

## Keine Änderung an

```text
Datenbankdaten
Schema
Settings
Twitch Presence
Config
Dashboard
```

## Tests

```powershell
node -c backend\modules\loyalty.js
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/routes" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/presence/status" | ConvertTo-Json -Depth 30
```
