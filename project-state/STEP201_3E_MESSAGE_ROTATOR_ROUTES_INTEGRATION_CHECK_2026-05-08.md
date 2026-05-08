# STEP201.3e – Message Rotator /routes + /integration-check

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Backend-STEP  
Status: vorbereitet

## Ziel

Message Rotator näher an den Modulstandard bringen.

Ergänzt werden read-only Endpunkte:

```text
GET /api/message-rotator/routes
GET /api/message-rotator/integration-check
GET /api/message-rotator/config
GET /api/message-rotator/settings
```

## Geänderte Datei

```text
backend/modules/message_rotator.js
```

## Ergänzt

```text
fileCheck()
safeCall()
getMessagesDir()
resolveMessageFilePath()
buildMessageRotatorConfig()
buildMessageRotatorSettings()
buildMessageRotatorRoutes()
buildMessageRotatorIntegrationCheck()
```

## Nicht geändert

```text
keine DB-Schemaänderung
keine JSON-Änderung
keine Dashboard-Dateien
keine Rotator-Auswahl-Logik
keine Chat-Tick-Logik
keine Send-/Manual-/Next-Logik
keine Live-Status-Logik
keine Start-/Stop-Logik
keine bestehende Route entfernt
```

## Neue Standard-Endpunkte

```text
GET /api/message-rotator/status              bereits vorhanden
GET /api/message-rotator/config              neu, read-only
GET /api/message-rotator/settings            neu, read-only
GET /api/message-rotator/routes              neu, read-only
GET /api/message-rotator/integration-check   neu, read-only
POST/GET /api/message-rotator/reload         bereits vorhanden
```

## Legacy-Routen bleiben

```text
/message-rotator/*
```

## Test

Nach Entpacken:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\message_rotator.js
.\stepdone.cmd "message-rotator: add routes and integration check"
```

Danach Backend neu starten.

Dann:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3e_test_message_rotator_routes_integration_check.ps1
```

Die Testausgabe landet in:

```text
D:\gpt\last_api.json
```
