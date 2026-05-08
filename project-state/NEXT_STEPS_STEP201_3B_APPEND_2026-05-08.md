# NEXT_STEPS Ergänzung – nach STEP201.3b

Stand: 2026-05-08

## Direkt nach Anwendung prüfen

```powershell
node --check backend\modules\tagebuch.js
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3b_test_tagebuch_routes_integration_check.ps1
```

## Danach

### STEP201.3c – Todo /routes + /integration-check

Nächster Kandidat:

```text
backend/modules/todo.js
```

Ziel:

```text
GET /api/todo/routes
GET /api/todo/integration-check
ggf. read-only /api/todo/config
ggf. read-only /api/todo/settings
```
