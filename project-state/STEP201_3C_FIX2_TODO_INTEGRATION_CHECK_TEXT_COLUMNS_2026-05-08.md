# STEP201.3c Fix 2 – Todo Integration-Check Textspalten

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Backend-Fix  
Status: vorbereitet

## Ausgangslage

Nach dem ersten Fix crasht `/api/todo/integration-check` nicht mehr leer mit 500, meldet aber:

```text
module_text_variants:no such column: module
```

## Ursache

Die Tabellen `module_text_variants` und `module_texts` nutzen im aktuellen Schema die Spalte:

```text
module_name
```

Der Todo-Integration-Check zählte aber mit:

```text
module = :module
```

## Änderung

Geändert in:

```text
backend/modules/todo.js
```

Angepasst:

```text
module = :module
```

zu:

```text
module_name = :module
```

für:

```text
module_text_variants
module_texts
```

## Nicht geändert

```text
keine DB-Schemaänderung
keine JSON-Änderung
keine Dashboard-Dateien
keine Todo-Entry-Logik
keine Discord-Post-Logik
keine Stats-Logik
keine bestehende Route entfernt
```

## Test

Nach Entpacken:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\todo.js
.\stepdone.cmd "todo: fix integration check text columns"
```

Danach Backend neu starten.

Dann:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3c_fix2_test_todo_integration_check.ps1
```

Die Testausgabe landet in:

```text
D:\gpt\last_api.json
```
