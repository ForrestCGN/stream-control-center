# STEP201.3c Fix – Todo /integration-check 500

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Backend-Fix  
Status: vorbereitet

## Ausgangslage

Nach STEP201.3c funktionieren:

```text
GET /api/todo/routes
GET /api/todo/status
GET /api/todo/config
GET /api/todo/settings
GET /api/todo/admin/settings
GET /api/todo/admin/texts
```

Aber:

```text
GET /api/todo/integration-check -> 500 mit leerem Response-Body
```

## Ursache

Der Integration-Check hatte noch keinen äußeren Fehlerfang. Wenn intern ein einzelner Diagnosebaustein wirft, antwortet Express mit einem leeren 500.

## Änderung

Geändert in:

```text
backend/modules/todo.js
```

Ergänzt/angepasst:

```text
safeCall(label, fn, fallback)
buildTodoIntegrationCheck() robuster gemacht
handleIntegrationCheck() mit try/catch versehen
```

## Wichtig

Der Fix ändert keine Todo-Fachlogik.

Nicht geändert:

```text
keine DB-Schemaänderung
keine JSON-Änderung
keine Dashboard-Dateien
keine Todo-Entry-Logik
keine Discord-Post-Logik
keine Stats-Logik
keine bestehende Route entfernt
```

## Verhalten nach Fix

`/api/todo/integration-check` soll nicht mehr leer crashen.

Wenn ein Diagnosebaustein scheitert, kommt JSON zurück:

```text
ok: false
healthy: false
errors: [...]
warnings: [...]
```

Wenn alles passt:

```text
ok: true
healthy: true
```

## Test

Nach Entpacken:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\todo.js
.\stepdone.cmd "todo: fix integration check 500"
```

Danach Backend neu starten.

Dann:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3c_fix_test_todo_integration_check.ps1
```

Die Testausgabe landet in:

```text
D:\gpt\last_api.json
```
