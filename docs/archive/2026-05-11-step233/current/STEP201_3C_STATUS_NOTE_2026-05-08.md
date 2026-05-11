# STEP201.3c Status-Notiz – Todo /routes + /integration-check

Stand: 2026-05-08

## Inhalt

Vorbereitet wurden:

```text
GET /api/todo/routes
GET /api/todo/integration-check
GET /api/todo/config
GET /api/todo/settings
```

## Art

```text
Read-only
keine DB-Schemaänderung
keine JSON-Änderung
keine Dashboard-Änderung
keine bestehende Route entfernt
```

## Test

```powershell
node --check backend\modules\todo.js
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3c_test_todo_routes_integration_check.ps1
```

Logdatei:

```text
D:\gpt\last_api.json
```
