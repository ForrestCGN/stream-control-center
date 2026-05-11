# NEXT_STEPS Ergänzung – nach STEP201.3a

Stand: 2026-05-08

## Direkt nach Anwendung prüfen

```powershell
node --check backend\modules\soundalerts_bridge.js
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3a_test_soundalerts_integration_check.ps1
```

## Danach

### STEP201.2c – Tagebuch /routes

Nächster Kandidat:

```text
GET /api/tagebuch/routes
```

Alternativ:

```text
STEP201.3b – Tagebuch /integration-check
```
