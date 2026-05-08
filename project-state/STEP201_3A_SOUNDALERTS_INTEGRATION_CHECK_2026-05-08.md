# STEP201.3a – SoundAlerts /integration-check

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Backend-STEP  
Status: vorbereitet

## Ziel

Ergänzt einen read-only Endpunkt:

```text
GET /api/soundalerts/integration-check
```

Der Endpunkt prüft den technischen Zustand der SoundAlerts-Bridge für Dashboard-/Modul-Standardisierung.

## Geänderte Datei

```text
backend/modules/soundalerts_bridge.js
```

## Ergänzt

```text
app.get('/api/soundalerts/integration-check', ...)
buildSoundAlertsIntegrationCheck()
directoryCheck()
tableCount()
```

## Prüft

```text
Config geladen
Datenbank erreichbar
Settings-Tabelle verfügbar
Events-/Entries-/Meta-Tabellen verfügbar
Parser-Formate aktiv
Sound-System Play-URL gesetzt
Allowed Extensions inkl. mp4/webm
Upload-Ordner Audio/Video
multer verfügbar
interner WebSocket-Status
Entry-/Rule-Statistik
```

## Nicht geändert

```text
keine DB-Änderung
keine JSON-Änderung
keine Dashboard-Dateien
keine Parsing-Logik
keine Upload-Logik
keine Sound-System-Übergabe
keine bestehende Route entfernt
```

## Hinweis

Warnungen können im normalen Betrieb vorkommen, z. B.:

```text
internal_websocket_not_connected
```

Das ist nicht automatisch ein Fehler, wenn der WebSocket gerade reconnectet oder noch nicht aktiv ist.

## Test

Nach Entpacken:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\soundalerts_bridge.js
```

Dann ins Live-System bringen, Backend neu starten, und danach:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3a_test_soundalerts_integration_check.ps1
```

Die Testausgabe landet in:

```text
D:\gpt\last_api.json
```

## Commit

Wenn alles passt:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "soundalerts: add integration check"
```
