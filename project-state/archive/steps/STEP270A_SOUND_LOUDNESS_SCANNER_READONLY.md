# STEP270A - Sound Loudness Scanner Read-only

Stand: 2026-05-21

## Ziel

Ein read-only Backend-Scanner wurde vorbereitet, um Sound-Dateien unter `htdocs/assets/sounds` auf wahrgenommene Lautheit zu messen.

Der STEP veraendert keine Sound-Dateien und greift nicht in Queue, Prioritaeten, Bundle-Lock, Discord-Routing oder Alert-/TTS-Playback ein.

## Neue Datei

```text
backend/modules/sound_loudness_scanner.js
```

## Neue API-Routen

```text
GET  /api/sound/loudness/status
POST /api/sound/loudness/scan
GET  /api/sound/loudness/results
GET  /api/sound/loudness/file?file=relative/path.mp3
GET  /api/sound/loudness/routes
```

## Messverfahren

Der Scanner verwendet `ffmpeg` mit dem Filter `loudnorm` im Analysemodus.

Erfasst werden pro Datei:

```text
relativePath
extension
sizeBytes
mtimeMs
durationMs
inputI / LUFS
inputTp / True Peak
inputLra
inputThresh
targetOffset
recommendedGainDb
recommendedVolume
status
warnings
errorText
scannedAt
```

Standardwerte:

```text
targetLufs = -18
truePeakLimitDbtp = -1.5
maxPlaybackVolume = 80
limit = 500
```

## Datenbank

Neue Tabellen werden nur sanft per `CREATE TABLE IF NOT EXISTS` angelegt:

```text
sound_loudness_scans
sound_loudness_files
```

Die bestehende `app.sqlite` wird nicht ersetzt, nicht geleert und nicht neu aufgebaut.

## Testbefehle nach Deploy

Syntax:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\sound_loudness_scanner.js
```

Backend neu starten und dann:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/status" | ConvertTo-Json -Depth 60
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/routes" | ConvertTo-Json -Depth 60
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/loudness/scan" -Body (@{ limit = 20 } | ConvertTo-Json) -ContentType "application/json" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/results?limit=50&order=recommended_gain_db&dir=desc" | ConvertTo-Json -Depth 80
```

## Nicht geaendert

```text
app.sqlite Inhalt bestehender Tabellen
config/**
backend/modules/sound_system.js
backend/modules/discord.js
backend/modules/alert_system.js
backend/modules/soundalerts_bridge.js
backend/modules/tts_system.js
Streamer.bot-Flows
Overlay-HTML
Dashboard-UI
```

## Naechster Schritt

STEP270B:

```text
Dashboard-Seite fuer Sound-Lautheit bauen:
- Scan starten
- Ergebnisse anzeigen
- Filter fuer ok/warning/error
- Sortierung nach LUFS, Gain, Volume, Dateiname
- spaeter Korrektur/Playback-Gain nur nach manueller Freigabe
```
