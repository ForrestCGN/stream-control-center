# STEP201.3c – Todo /routes + /integration-check

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Backend-STEP  
Status: vorbereitet

## Ziel

Todo näher an den Modulstandard bringen.

Ergänzt werden read-only Endpunkte:

```text
GET /api/todo/routes
GET /api/todo/integration-check
GET /api/todo/config
GET /api/todo/settings
```

## Geänderte Datei

```text
backend/modules/todo.js
```

## Ergänzt

```text
buildTodoRoutes()
buildTodoIntegrationCheck()
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
keine Todo-Entry-Logik
keine Discord-Post-Logik
keine Stats-Logik
keine bestehende Route entfernt
```

## Neue Standard-Endpunkte

```text
GET /api/todo/status              bereits vorhanden
GET /api/todo/config              neu, read-only
GET /api/todo/settings            neu, read-only
GET /api/todo/routes              neu, read-only
GET /api/todo/integration-check   neu, read-only
POST/GET /api/todo/reload         bereits vorhanden
```

## Legacy-Routen bleiben

```text
/discord/todo
/discord/todo/status
```

## Test

Nach Entpacken:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\todo.js
.\stepdone.cmd "todo: add routes and integration check"
```

Danach Backend neu starten.

Dann:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3c_test_todo_routes_integration_check.ps1
```

Die Testausgabe landet in:

```text
D:\gpt\last_api.json
```
