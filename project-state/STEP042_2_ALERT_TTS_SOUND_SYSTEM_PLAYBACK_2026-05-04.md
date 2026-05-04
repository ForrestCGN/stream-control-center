# STEP042.2 - Alert-TTS ueber Sound-System

Stand: 2026-05-04

## Zweck

Alert-TTS wird nicht mehr im Alert-Overlay abgespielt, sondern standardmaessig ueber das zentrale Sound-System.

Der bestehende Chat-TTS-Ablauf bleibt unveraendert.

## Geaenderte Dateien

- `backend/modules/tts_system.js`
- `backend/modules/alert_system.js`
- `htdocs/overlays/_overlay-alerts-v2.html`

## TTS-System

Der Standard-Zielordner fuer generierte TTS-Dateien liegt nun innerhalb des Sound-System-Bereichs:

- Datei: `htdocs/assets/sounds/tts/generated/<datei>.wav|mp3`
- URL: `/assets/sounds/tts/generated/<datei>.wav|mp3`
- Sound-System-Datei: `tts/generated/<datei>.wav|mp3`

`/api/tts/prepare-alert` liefert zusaetzlich:

- `soundSystemFile`

Damit kann das Sound-System die Datei relativ zu `htdocs/assets/sounds` abspielen.

## Alert-System

Neue/erweiterte `liveAlert`-Settings:

- `alertTtsPlaybackMode`
  - `sound_system` = TTS ueber Sound-System
  - `overlay` = TTS im Alert-Overlay
  - `off` = Alert-TTS nicht abspielen
- `alertTtsOverlayPlaybackEnabled`
- `alertTtsSoundSystemEnabled`
- `alertTtsSoundSystemCategory`
- `alertTtsSoundSystemSource`
- `alertTtsSoundSystemOutputTarget`
- `alertTtsSoundSystemVolume`
- `alertTtsSoundSystemPriority`

Default:

```json
{
  "alertTtsPlaybackMode": "sound_system",
  "alertTtsOverlayPlaybackEnabled": false,
  "alertTtsSoundSystemEnabled": true,
  "alertTtsSoundSystemCategory": "alert_tts",
  "alertTtsSoundSystemSource": "alert_system",
  "alertTtsSoundSystemOutputTarget": "device",
  "alertTtsSoundSystemVolume": 100,
  "alertTtsSoundSystemPriority": 82
}
```

## Overlay

Das Alert-Overlay behaelt die TTS-Daten fuer Timing/Debug, spielt sie aber nur noch selbst ab, wenn:

- `tts.playbackMode = overlay`
- oder `tts.overlayPlaybackEnabled = true`

Bei Default `sound_system` bleibt das Overlay visuell und tonlos.

## Settings-/DB-Fix

Die Alert-Settings-Ausgabe arbeitet jetzt kanonisch mit:

- `liveAlert`
- `dashboardSettings`
- `preview`

Alte Varianten wie `livealert`/`live_alert` werden beim Lesen gemerged und beim Speichern von `liveAlert` bereinigt.

Außerdem werden sensible Werte in den öffentlichen Settings-/Config-Antworten maskiert.

## Tests

Syntax:

```powershell
node --check backend\modules\tts_system.js
node --check backend\modules\alert_system.js
```

Prepare-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/prepare-alert?text=Hallo%20Forrest%2C%20das%20ist%20ein%20Alert%20TTS%20Test&user=ForrestCGN" | ConvertTo-Json -Depth 10
```

Erwartung:

- `ok = true`
- `audioUrl` beginnt mit `/assets/sounds/tts/generated/`
- `soundSystemFile` beginnt mit `tts/generated/`
- `durationMs > 0`

Alert-Test:

```powershell
$body = @{
  source = "kofi"
  type = "donation"
  type_key = "donation"
  user = "ForrestCGN"
  userDisplayName = "ForrestCGN"
  amount = 5
  amountFormatted = "5,00 €"
  message = "Das ist ein Ko-fi Test mit gesprochener Nachricht."
} | ConvertTo-Json -Depth 10

Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/enqueue" -Method POST -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 10
```

Erwartung:

- Alert-Hauptsound laeuft wie bisher ueber Sound-System.
- Nach Alert-Sound + konfigurierter Pause wird Alert-TTS ueber Sound-System abgespielt.
- Das normale TTS-Overlay erscheint nicht.
- Das Alert-Overlay spielt kein eigenes TTS-Audio ab.
- Der Alert bleibt bis nach TTS-Ende sichtbar.

## Hinweise

- Keine Funktionalitaet entfernt.
- Overlay-Playback bleibt als Fallback/Debug-Modus erhalten.
- Sound-System ist Standard fuer Alert-TTS.
- Die endgueltige Dashboard-Oberflaeche fuer diese Werte folgt in einem spaeteren STEP.
