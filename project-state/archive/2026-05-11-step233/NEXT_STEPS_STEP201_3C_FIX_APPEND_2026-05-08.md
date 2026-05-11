# NEXT_STEPS Ergänzung – nach STEP201.3c Fix

Stand: 2026-05-08

## Direkt nach Anwendung prüfen

```powershell
node --check backend\modules\todo.js
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3c_fix_test_todo_integration_check.ps1
```

## Danach

Wenn Todo Integration-Check grün ist:

```text
STEP201.3c abschließen
```

Nächster Kandidat:

```text
STEP201.3d – Messages /routes + /integration-check prüfen/planen
```
