# STEP201.3d Fix Status-Notiz – Messages File-Warnings

Stand: 2026-05-08

## Problem

```text
/api/messages/integration-check -> healthy true, aber falsche [object Object]-Warnings
```

## Fix

```text
status.files wird jetzt korrekt als Array/Object verarbeitet.
file.path wird als Prüfpafd genutzt.
```

## Test

```powershell
node --check backend\modules\messages.js
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3d_fix_test_messages_integration_check.ps1
```

Logdatei:

```text
D:\gpt\last_api.json
```
