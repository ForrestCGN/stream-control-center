# STEP199.4 – TTS integration-check + Settings-Sanitizing

Stand: 2026-05-08  
Projekt: stream-control-center  
Status: vorbereitet

## Anlass

Nach STEP199.1/STEP199.3 ist TTS funktional weitgehend fertig:

- `/api/tts/status` funktioniert.
- `/api/tts/config` funktioniert.
- `/api/tts/settings` funktioniert.
- `/api/tts/voices` funktioniert.
- `/api/tts/routes` funktioniert.
- TTS läuft über das Sound-System.
- DB gewinnt gegen JSON-Fallback.

Offen war:

- `/api/tts/integration-check` lieferte 404.
- `/api/tts/settings` gab bei Voice-Settings noch den Pfad zur Google-Service-Account-Datei als `keyFile`/`rawValue` aus.

## Änderung

Geändert:

```text
backend/modules/tts_system.js
```

### Ergänzt

- `GET /api/tts/integration-check`
- Integration-Check prüft:
  - DB-Settings erreichbar
  - JSON-Fallback vorhanden
  - Default-/Fallback-Voice vorhanden
  - Google-Keyfile konfiguriert/vorhanden, ohne Pfad auszugeben
  - Piper-Dateien vorhanden
  - Sound-System-Konfiguration für Chat-TTS plausibel
  - Queue/current-Status

### Sanitizing

- `/api/tts/settings` gibt Settings jetzt dashboard-sicher aus.
- `key`, `apiKey`, `token`, `secret`, `credentials`, `password` werden nicht ausgegeben.
- `keyFile` wird nicht mehr als Pfad ausgegeben, sondern als:
  - `keyFileConfigured`
  - `keyFileExists`
- `rawValue` wird für JSON-Settings aus der bereinigten Version neu aufgebaut.
- `/api/tts/admin/settings` nutzt dieselbe bereinigte Ausgabe.
- `/api/tts/settings/upsert` gibt bereinigte Antworten zurück.

## Nicht geändert

- keine DB-Datei
- keine Secrets
- keine JSON-Config
- keine TTS-Funktion entfernt
- keine Dashboard-Datei geändert

## Erwartete Tests

```powershell
cd D:\Streaming\stramAssets
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$Result = [ordered]@{}
$Result.ttsConfig = Invoke-RestMethod "http://127.0.0.1:8080/api/tts/config"
$Result.ttsSettings = Invoke-RestMethod "http://127.0.0.1:8080/api/tts/settings"
$Result.ttsVoices = Invoke-RestMethod "http://127.0.0.1:8080/api/tts/voices"
$Result.ttsRoutes = Invoke-RestMethod "http://127.0.0.1:8080/api/tts/routes"
$Result.ttsIntegrationCheck = Invoke-RestMethod "http://127.0.0.1:8080/api/tts/integration-check"
$Result.soundStatus = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"

$Result | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 "D:\gpt\last_api.json"
Get-Item "D:\gpt\last_api.json" | Select-Object FullName,Length,LastWriteTime
```

Erwartung:

- `ttsIntegrationCheck.ok = true`
- `ttsIntegrationCheck.healthy = true` oder nur begründete Warnungen
- `/api/tts/settings` enthält keinen `keyFile`-Pfad mehr
- `/api/tts/settings` enthält keine Secret-Felder im Klartext
- `/api/tts/routes` listet `/api/tts/integration-check`
