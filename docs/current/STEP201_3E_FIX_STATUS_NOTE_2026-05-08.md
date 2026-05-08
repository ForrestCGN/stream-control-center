# STEP201.3e Fix Status-Notiz – Message Rotator Array-Routen

Stand: 2026-05-08

## Problem

```text
Neue Routen in Datei vorhanden, aber API antwortet 404.
```

## Fix

```text
Array-Routenregistrierung in einzelne registerGet-Aufrufe aufgeteilt.
```

## Test

```powershell
node --check backend\modules\message_rotator.js
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3e_fix_test_message_rotator_routes_integration_check.ps1
```

Logdatei:

```text
D:\gpt\last_api.json
```
