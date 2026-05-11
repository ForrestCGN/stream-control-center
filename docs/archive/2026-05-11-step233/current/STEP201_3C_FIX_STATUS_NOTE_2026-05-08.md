# STEP201.3c Fix Status-Notiz – Todo Integration-Check 500

Stand: 2026-05-08

## Problem

```text
/api/todo/integration-check -> 500 leerer Body
```

## Fix

```text
safeCall ergänzt
buildTodoIntegrationCheck robuster gemacht
handleIntegrationCheck mit try/catch versehen
Testscript verbessert und loggt ResponseBody
```

## Test

```powershell
node --check backend\modules\todo.js
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3c_fix_test_todo_integration_check.ps1
```

Logdatei:

```text
D:\gpt\last_api.json
```
