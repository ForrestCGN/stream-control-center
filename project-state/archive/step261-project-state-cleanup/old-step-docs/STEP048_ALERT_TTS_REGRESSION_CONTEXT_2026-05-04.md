# STEP048 - Alert TTS Regression Context

Stand: 2026-05-04

## Zweck

Diese Datei haelt den aktuellen Untersuchungsstand zur Regression im Sound-/Alert-/Alert-TTS-System fest.

Wichtig: Diese Datei ist reine Projekt-/Uebergabe-Doku. Es wurden damit keine Codeaenderungen vorgenommen.

## Aktueller sauberer Git-Stand vor dem Fix

Projekt:

- `stream-control-center`

Branch:

- `dev`

Repo lokal:

- `D:\Git\stream-control-center`

Live-System:

- `D:\Streaming\stramAssets`

GitHub:

- `https://github.com/ForrestCGN/stream-control-center`

Sauberer Stand nach Ruecksetzung des fehlerhaften Platzhalter-Commits:

- `HEAD/origin/dev = 3ac17c1abd2045326d32a7eadddfec4b1d7183ef`
- Letzter bekannter Commit: `docs: update next steps after vip dashboard base`
- `git status --short` war leer.

Wichtig:

- Ein versehentlicher kaputter GitHub-Commit mit `// PLACEHOLDER` in `backend/modules/alert_system.js` wurde erfolgreich per `force-with-lease` auf den sauberen Stand zurueckgesetzt.
- Nicht deployen war richtig.
- GitHub/dev und lokaler dev waren danach wieder synchron.

## Dringendes aktuelles Thema

Regression im Sound-/Alert-/Alert-TTS-System.

Symptome:

1. Ko-fi/Tipeee Alert beruecksichtigt Alert-TTS-Dauer nicht mehr korrekt.
2. Alert bleibt nicht mehr lange genug sichtbar.
3. TTS lief zwischenzeitlich doppelt ueber Sound-System und Overlay.

## Bereits korrigierte Live-Config

TTS `chatTts.fallbackToOverlay` wurde live auf `false` gesetzt.

Aktueller Sollzustand fuer Chat-TTS:

```json
{
  "playbackMode": "sound_system",
  "soundSystemEnabled": true,
  "fallbackToOverlay": false,
  "overlayVisualEnabled": true
}
```

Bedeutung:

- Audio laeuft ueber Sound-System.
- TTS-Overlay zeigt nur Visuals.
- Kein Audio-Fallback ins Overlay.

## Wichtige Befunde

### TTS-Overlay

`htdocs/overlays/_overlay-tts.html` ist nach aktuellem Befund nicht die Ursache.

Es zeigt nur Visuals ueber:

- `GET /api/sound/status`
- WebSocket `sound_system`
- `visual.module = tts_overlay`

Es enthaelt keinen eigenen aktiven Audio-Player fuer TTS.

### Alert-Overlay

`htdocs/overlays/_overlay-alerts-v2.html` enthaelt weiterhin:

```html
<audio id="sound" preload="auto"></audio>
<audio id="ttsSound" preload="auto"></audio>
```

Das Alert-Overlay spielt Alert-TTS aber nur, wenn der Backend-Payload setzt:

```js
tts.overlayPlaybackEnabled === true
```

oder:

```js
tts.playbackMode === 'overlay'
```

Daher muss `backend/modules/alert_system.js` im Sound-System-Modus sicher setzen:

```js
tts.playbackMode = 'sound_system';
tts.overlayPlaybackEnabled = false;
```

## Hauptfehler in `backend/modules/alert_system.js`

Aktuell wird die Alert-Dauer ueber `resolveAlertDurationMs(rule)` berechnet.

Diese Funktion beruecksichtigt aktuell nur:

- `rule.duration_ms`
- `rule.duration_mode`
- `rule.sound_duration_ms`
- `state.config.soundDurationPaddingMs`

Sie beruecksichtigt aktuell nicht:

- Alert-TTS Delay
- Alert-TTS Dauer
- Alert-TTS Outro/Puffer

Dadurch bleibt Ko-fi/Tipeee mit `tts_enabled = 1` zu kurz sichtbar.

## Aktive Live-Settings aus DB

Wichtig: Die aktiven Einstellungen kommen aus der Datenbank. JSON-Dateien sind nur Default/Fallback.

Relevante Werte aus `/api/alerts/settings`:

```text
liveAlert.soundSystemEnabled = true
liveAlert.alertTtsEnabled = true
liveAlert.alertTtsPrepareUrl = http://127.0.0.1:8080/api/tts/prepare-alert
liveAlert.alertTtsTimeoutMs = 15000
liveAlert.alertTtsDelayAfterSoundMs = 3500
liveAlert.alertTtsOutroBufferMs = 1500
```

Achtung:

- `/api/alerts/settings` gibt aktuell Secrets im Klartext aus.
- Diese Ausgabe nicht vollstaendig posten.
- Secrets muessen spaeter in Public-/Dashboard-Ausgaben maskiert werden.

## Ko-fi/Tipeee-Regeln

Ko-fi Donation:

```text
duration_mode = sound
sound_duration_ms = 9405
duration_ms = 8000
tts_enabled = 1
tts_template = {user} schreibt: {message}
tts_max_chars = 500
```

Tipeee Donation:

```text
duration_mode = sound
sound_duration_ms = 10517
duration_ms = 8000
tts_enabled = 1
tts_template = {user} schreibt: {message}
tts_max_chars = 500
```

## TTS-Prepare-Test

`POST /api/tts/prepare-alert` war erfolgreich.

Beispielausgabe:

```text
durationMs = 5232
startAfterMs = 1500
endsAfterMs = 6732
outroBufferMs = 900
audioUrl vorhanden
audioFile vorhanden
soundSystemFile vorhanden
```

Wichtig:

- `prepare-alert` liefert kein `playbackMode`.
- `prepare-alert` liefert kein `overlayPlaybackEnabled`.
- Das muss `alert_system.js` sauber fuer den Alert-Payload setzen.

## Sound-System Status

Sound-System:

```text
Version = 0.1.8
current = null
queue = leer
overlay target = disabled
device target = enabled
queue.sortByPriority = true
queue.allowParallel = false
queue.maxParallel = 1
priorities.alert = 80
priorities.tts = 50
```

Der Sound-System-Status sieht fuer den gewuenschten Ablauf grundsaetzlich korrekt aus.

## Wahrscheinliche Ursache

Vor dem Early-Queue-/Sound-System-Umbau lief der Ablauf sinngemaess korrekt:

```text
Alert vorbereiten
-> Alert-TTS vorbereiten
-> TTS-Dauer bekannt
-> Alertdauer verlaengern
-> Overlay bleibt lange genug sichtbar
```

Nach dem Umbau auf fruehes Sound-System-Queueing sieht der Ablauf aktuell eher so aus:

```text
Alert frueh vorbereiten
-> Overlay-Payload/Dauer wird gebaut
-> resolveAlertDurationMs kennt nur Hauptsound
-> Alert-TTS-Dauer fehlt
-> Overlay bekommt zu kurze durationMs
```

## Geplanter Fix-STEP

Name:

- `STEP048_ALERT_TTS_REGRESSION_FIX_2026-05-04`

Betroffene Datei zuerst nur:

- `backend/modules/alert_system.js`

Ziele:

1. Alert-TTS serverseitig ueber `/api/tts/prepare-alert` vorbereiten.
2. TTS-Dauer in `event.alertTts` speichern.
3. `effectiveDurationMs` so berechnen, dass der Alert sichtbar bleibt bis:
   - Alert-Hauptsound
   - plus Alert-TTS Delay
   - plus Alert-TTS Dauer
   - plus Alert-TTS Outro/Puffer
4. Im Sound-System-Modus:
   - `tts.playbackMode = "sound_system"`
   - `tts.overlayPlaybackEnabled = false`
5. Alert-Overlay bleibt reine Anzeige und spielt kein TTS-Audio.
6. Keine Funktionalitaet entfernen.
7. Keine JSON-Config als Live-Wahrheit behandeln; aktive Settings kommen aus DB.

## Sicherer Ablauf fuer den naechsten Chat

Nicht per blindem GitHub-Patch arbeiten.

Sicherer Ablauf:

1. Forrest laedt die echte lokale Datei hoch:
   - `D:\Git\stream-control-center\backend\modules\alert_system.js`
2. Patch auf Basis dieser echten Datei bauen.
3. Vollstaendige gepatchte Datei zurueckgeben.
4. Lokal exakt diese eine Datei ersetzen.
5. Syntax pruefen:

```powershell
node -c .\backend\modules\alert_system.js
```

6. API-/Live-Test.
7. Commit/Push.
8. STEP048-Doku schreiben.

## Wichtige Regeln

- Keine Funktionalitaet entfernen.
- Datenbank ist Live-Wahrheit fuer Settings.
- JSON-Dateien sind nur Default/Fallback.
- Keine `.env`, SQLite, Tokens oder Secrets posten oder committen.
- `/api/alerts/settings` nicht komplett posten, solange Secrets nicht maskiert sind.
- Erst echten Dateistand pruefen, dann patchen.
