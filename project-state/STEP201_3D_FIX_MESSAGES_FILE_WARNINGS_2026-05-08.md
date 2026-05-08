# STEP201.3d Fix – Messages Integration-Check File-Warnings

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Backend-Fix  
Status: vorbereitet

## Ausgangslage

`/api/messages/integration-check` funktioniert und ist healthy, erzeugt aber falsche Warnings:

```text
D:\Streaming\stramAssets\backend\[object Object]
```

## Ursache

`textHelper.getStatus().files` ist eine Liste von Datei-Objekten mit Feldern wie:

```text
file
path
keys
placeholders
```

Der Integration-Check behandelte diese Objekte als Pfad-String.

## Änderung

Geändert in:

```text
backend/modules/messages.js
```

Angepasst:

```text
extractPossiblePaths(status)
```

Die Funktion verarbeitet jetzt:

```text
status.files als Array von Objekten
status.files als Objekt-Map
direkte String-Pfade
```

und nutzt bevorzugt:

```text
file.path
file.fullPath
file.filePath
```

## Nicht geändert

```text
keine DB-Schemaänderung
keine JSON-Änderung
keine Dashboard-Dateien
keine Message-Render-Logik
keine Message-Send-Logik
keine Discord-Bridge-Logik
keine Scheduler-Start-/Stop-Logik
keine bestehende Route entfernt
```

## Test

Nach Entpacken:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\messages.js
.\stepdone.cmd "messages: fix integration check file warnings"
```

Danach Backend neu starten.

Dann:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3d_fix_test_messages_integration_check.ps1
```

Die Testausgabe landet in:

```text
D:\gpt\last_api.json
```
