# STEP201.2a – Alert-System /routes-Endpunkt

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Code-STEP  
Status: vorbereitet

## Änderung

Ergänzt in `backend/modules/alert_system.js`:

```text
GET /api/alerts/routes
function buildAlertRoutes(req = null)
```

## Sicherheitsumfang

Keine bestehende Funktionalität entfernt.

Nicht geändert:

```text
DB
JSON
Dashboard
Overlay
Alert-Queue
Alert-Playback
bestehende Routen
Security-Guards
```

## Test

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\alert_system.js
.\tools\tests\STEP201_2a_test_alerts_routes.ps1
```

Die API-Testausgabe wird nach `D:\gpt\last_api.json` geschrieben.
