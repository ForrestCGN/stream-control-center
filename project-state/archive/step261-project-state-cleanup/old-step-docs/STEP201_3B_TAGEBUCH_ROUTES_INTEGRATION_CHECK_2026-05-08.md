# STEP201.3b – Tagebuch /routes + /integration-check

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Backend-STEP  
Status: vorbereitet

## Ziel

Tagebuch näher an den Modulstandard bringen.

Ergänzt werden read-only Endpunkte:

```text
GET /api/tagebuch/routes
GET /api/tagebuch/integration-check
GET /api/tagebuch/config
GET /api/tagebuch/settings
```

## Geänderte Datei

```text
backend/modules/tagebuch.js
```

## Ergänzt

```text
buildTagebuchRoutes()
buildTagebuchIntegrationCheck()
countTableRows()
fileCheck()
handleConfig()
handleSettings()
handleRoutes()
handleIntegrationCheck()
```

## Nicht geändert

```text
keine DB-Schemaänderung
keine JSON-Änderung
keine Dashboard-Dateien
keine Streamstart-/Streamende-Logik
keine Tagebuch-Entry-Logik
keine Discord-Webhook-Logik
keine Stats-Logik
keine Reset-Logik
keine bestehende Route entfernt
```

## Neue Standard-Endpunkte

```text
GET /api/tagebuch/status              bereits vorhanden
GET /api/tagebuch/config              neu, read-only
GET /api/tagebuch/settings            neu, read-only
GET /api/tagebuch/routes              neu, read-only
GET /api/tagebuch/integration-check   neu, read-only
POST/GET /api/tagebuch/reload         bereits vorhanden
```

## Legacy-Routen bleiben

```text
/discord/tagebuch
/discord/tagebuch/status
/discord/tagebuch/reset
/discord/stream/start
/discord/stream/end
```

## Test

Nach Entpacken:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\tagebuch.js
.\stepdone.cmd "tagebuch: add routes and integration check"
```

Danach Backend neu starten.

Dann:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3b_test_tagebuch_routes_integration_check.ps1
```

Die Testausgabe landet in:

```text
D:\gpt\last_api.json
```
