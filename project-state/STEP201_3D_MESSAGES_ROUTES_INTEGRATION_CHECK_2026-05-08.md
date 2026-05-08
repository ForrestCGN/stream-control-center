# STEP201.3d – Messages /routes + /integration-check

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Backend-STEP  
Status: vorbereitet

## Ziel

Messages näher an den Modulstandard bringen.

Ergänzt werden read-only Endpunkte:

```text
GET /api/messages/routes
GET /api/messages/integration-check
GET /api/messages/config
GET /api/messages/settings
```

## Geänderte Datei

```text
backend/modules/messages.js
```

## Ergänzt

```text
buildMessagesRoutes()
buildMessagesIntegrationCheck()
buildMessagesConfig()
buildMessagesSettings()
handleRoutes()
handleIntegrationCheck()
handleConfig()
handleSettings()
safeCall()
fileCheck()
```

## Nicht geändert

```text
keine DB-Schemaänderung
keine JSON-Änderung
keine Dashboard-Dateien
keine Message-Render-Logik
keine Message-Send-Logik
keine Discord-Bridge-Logik
keine Scheduler-Start-/Stop-Logik
keine bestehende Route entfernt
```

## Neue Standard-Endpunkte

```text
GET /api/messages/status              bereits vorhanden
GET /api/messages/config              neu, read-only
GET /api/messages/settings            neu, read-only
GET /api/messages/routes              neu, read-only
GET /api/messages/integration-check   neu, read-only
POST/GET /api/messages/reload         bereits vorhanden
```

## Legacy-Routen bleiben

```text
/messages/*
```

## Test

Nach Entpacken:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\messages.js
.\stepdone.cmd "messages: add routes and integration check"
```

Danach Backend neu starten.

Dann:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3d_test_messages_routes_integration_check.ps1
```

Die Testausgabe landet in:

```text
D:\gpt\last_api.json
```
