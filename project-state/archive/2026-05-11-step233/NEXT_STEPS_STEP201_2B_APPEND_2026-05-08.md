# NEXT_STEPS Ergänzung – nach STEP201.2b

Stand: 2026-05-08

## Direkt nach Anwendung prüfen

```powershell
node --check backend\modules\soundalerts_bridge.js
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_2b_test_soundalerts_routes.ps1
```

## Danach

### STEP201.3a – SoundAlerts /integration-check

Nächster Kandidat:

```text
GET /api/soundalerts/integration-check
```

Prüfen soll:

```text
Config geladen
DB erreichbar
Settings-Tabelle vorhanden
Entries-Tabelle vorhanden
Events-Tabelle vorhanden
Sound-System Play-URL vorhanden
Upload-Verzeichnisse vorhanden
multer verfügbar
WebSocket-Status
fehlende Dateien / missing_file Count
```
