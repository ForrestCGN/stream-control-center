# STEP201.2b – SoundAlerts /routes-Endpunkt

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Backend-STEP  
Status: vorbereitet

## Ziel

Ergänzt einen read-only Endpunkt:

```text
GET /api/soundalerts/routes
```

Der Endpunkt dokumentiert die bestehenden SoundAlerts-Bridge-Routen und hilft der Dashboard-/Modul-Standardisierung.

## Geänderte Datei

```text
backend/modules/soundalerts_bridge.js
```

## Ergänzt

```text
app.get('/api/soundalerts/routes', ...)
buildSoundAlertsRoutes()
```

## Nicht geändert

```text
keine DB
keine JSON
keine Dashboard-Dateien
keine SoundAlerts-Parsing-Logik
keine Upload-Logik
keine Sound-System-Übergabe
keine bestehenden Routen entfernt
```

## Besonderheit

`/api/soundalerts/integration-check` wird noch nicht ergänzt. Das bleibt der nächste eigene Folge-STEP, damit die Änderung klein bleibt.

## Test

Nach Entpacken:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\soundalerts_bridge.js
```

Backend neu starten, falls Node nicht automatisch neu startet.

Dann:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_2b_test_soundalerts_routes.ps1
```

Die Testausgabe landet in:

```text
D:\gpt\last_api.json
```

## Commit

Wenn alles passt:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "soundalerts: add routes endpoint"
```
