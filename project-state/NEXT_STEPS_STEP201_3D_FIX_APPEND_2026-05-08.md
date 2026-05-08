# NEXT_STEPS Ergänzung – nach STEP201.3d Fix

Stand: 2026-05-08

## Direkt nach Anwendung prüfen

```powershell
node --check backend\modules\messages.js
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3d_fix_test_messages_integration_check.ps1
```

## Danach

Wenn Messages Integration-Check ohne falsche `[object Object]`-Warnings ist:

```text
STEP201.3d abschließen
```

Nächster Kandidat:

```text
STEP201.3e – Message Rotator /routes + /integration-check
```
