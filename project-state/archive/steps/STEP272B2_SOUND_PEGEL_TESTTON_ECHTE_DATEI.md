# STEP272B2 - Sound-Pegel Testton als echte Sound-Datei

Stand: 2026-05-21

## Ziel

Der technische Referenz-Testton soll nicht mehr als reine API-WAV-URL oder generated_beep laufen, sondern als echte Sound-Datei im normalen Sound-Ordner erzeugt und dann ueber das Sound-System/OBS-Overlay abgespielt werden.

## Aenderungen

```text
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
```

## Neue Route

```text
GET/POST /api/sound/loudness/reference/test-file
```

Die Route erzeugt/aktualisiert:

```text
htdocs/assets/sounds/generated/reference_test.wav
```

Rueckgabe enthaelt u. a.:

```text
relativePath = generated/reference_test.wav
browserUrl = /assets/sounds/generated/reference_test.wav
targetLufs
durationMs
sizeBytes
updatedAt
```

## Dashboard-Verhalten

Der Button `Test-Ton über OBS` macht jetzt:

```text
1. /api/sound/loudness/reference/test-file aufrufen
2. /api/sound/play?file=generated/reference_test.wav&outputTarget=overlay&target=stream starten
```

Damit nutzt der Test-Ton denselben OBS-/Overlay-Pfad wie normale Sound-Dateien.

## Nicht geaendert

```text
backend/modules/sound_system.js
app.sqlite ersetzt/neu gebaut: nein
config/**
Original-Sounddateien
Sound-Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System
Streamer.bot-Flows
Overlay-HTML
```

## Tests

```powershell
node --check backend\modules\sound_loudness_scanner.js
node --check htdocs\dashboard\modules\sound_levelscan.js

Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/reference/test-file" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=generated/reference_test.wav&outputTarget=overlay&target=stream&volume=80&override=true" | ConvertTo-Json -Depth 80
```
