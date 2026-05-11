# NEXT_STEPS Ergänzung – nach STEP201.3d

Stand: 2026-05-08

## Direkt nach Anwendung prüfen

```powershell
node --check backend\modules\messages.js
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3d_test_messages_routes_integration_check.ps1
```

## Danach

### STEP201.3e – Message Rotator /routes + /integration-check prüfen/planen

Nächster Kandidat:

```text
backend/modules/message_rotator.js
```

Alternativ:

```text
STEP201 Zwischenmatrix aktualisieren
```
