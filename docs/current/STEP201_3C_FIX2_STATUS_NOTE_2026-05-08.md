# STEP201.3c Fix 2 Status-Notiz – Todo Textspalten

Stand: 2026-05-08

## Problem

```text
/api/todo/integration-check -> ok false
module_text_variants:no such column: module
```

## Fix

```text
Texttabellen-Checks nutzen jetzt module_name statt module.
```

## Test

```powershell
node --check backend\modules\todo.js
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3c_fix2_test_todo_integration_check.ps1
```

Logdatei:

```text
D:\gpt\last_api.json
```
