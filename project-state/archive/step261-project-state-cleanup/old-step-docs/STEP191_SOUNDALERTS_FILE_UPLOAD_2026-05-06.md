# STEP191 - SoundAlerts File Upload

Stand: 2026-05-06

## Zweck

SoundAlert-Einträge können im Dashboard direkt eine Datei hochladen. Der Upload nutzt das bestehende SoundAlerts-Backend und `helper_media` für sichere Pfade, erlaubte Dateiendungen und Media-Info-Erkennung.

## Betroffene Dateien

```text
backend/modules/soundalerts_bridge.js
htdocs/dashboard/modules/soundalerts.js
htdocs/dashboard/modules/soundalerts.css
```

## Backend

Neu in `soundalerts_bridge.js`:

```text
POST /api/soundalerts/upload
```

Der Endpoint:

- nutzt `multer` mit Memory-Storage
- nutzt `helper_media` für Extension-/Media-Prüfung
- liest Upload-Zielpfade aus der SoundAlerts-Config
- speichert Audio und Video getrennt nach konfiguriertem Ziel
- blockiert unsichere Pfade
- überschreibt Dateien nur mit `overwrite=true`
- gibt bei vorhandener Datei ohne Overwrite `409 file_exists` zurück
- gibt nach Upload den relativen Pfad für `rule.file` zurück

Neue Default-Config unter `upload`:

```json
{
  "enabled": true,
  "audioDir": "htdocs/assets/sounds/soundalerts/audio",
  "videoDir": "htdocs/assets/sounds/soundalerts/video",
  "audioRelativePrefix": "soundalerts/audio",
  "videoRelativePrefix": "soundalerts/video",
  "allowOverwrite": true,
  "maxAudioSizeBytes": 15728640,
  "maxVideoSizeBytes": 104857600,
  "allowedAudioExtensions": [".mp3", ".wav", ".ogg", ".webm", ".m4a"],
  "allowedVideoExtensions": [".mp4", ".webm"]
}
```

Die Pfade sind damit konfigurierbar und nicht hart im Dashboard verdrahtet.

## Dashboard

Im SoundAlert-Eintrag-Editor wurde ergänzt:

```text
Datei hochladen
```

Ablauf:

1. Datei auswählen.
2. Dashboard sendet `multipart/form-data` an `/api/soundalerts/upload`.
3. Wenn die Datei existiert, fragt das Dashboard nach Überschreiben.
4. Bei Bestätigung wird mit `overwrite=true` erneut hochgeladen.
5. Der zurückgegebene relative Pfad wird automatisch im Eintrag gesetzt.
6. Die SoundAlerts-Config wird gespeichert und neu geladen.

## Nicht geändert

- Keine SQLite-Schemaänderung.
- Keine Secrets.
- Kein neuer Parallel-Upload-Helper.
- Bestehende SoundAlerts-Bridge-Funktionen bleiben erhalten.
- Bestehende Event-/Mapping-/Replay-Funktionen bleiben erhalten.

## Tests

Syntax:

```text
node -c backend/modules/soundalerts_bridge.js
node -c htdocs/dashboard/modules/soundalerts.js
```

Erwartung:

```text
OK
```

Live-Test nach Deploy:

```powershell
cd D:\Streaming\stramAssets
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/reload" -Method POST | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/status" | ConvertTo-Json -Depth 30
```

Erwartung:

```text
version = 0.1.1
multerReady = true
config.upload vorhanden
```

Dashboard-Test:

1. `SoundAlerts -> Einträge` öffnen.
2. Eintrag auswählen.
3. Datei hochladen.
4. Falls Datei existiert: Rückfrage testen.
5. Prüfen, ob `Datei` im Eintrag gesetzt wurde.
6. Speichern/Reload prüfen.
7. SoundAlert testweise auslösen.

## Offen

- Upload-Zielpfade später im Dashboard unter Settings editierbar machen.
- SoundAlert-Inbox aus STEP189 serverseitig bauen.
