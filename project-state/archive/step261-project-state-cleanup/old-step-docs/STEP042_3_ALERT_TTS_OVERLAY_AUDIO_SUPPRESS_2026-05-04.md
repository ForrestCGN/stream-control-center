# STEP042.3 - Alert-TTS Overlay-Audio unterdruecken

Stand: 2026-05-04

## Zweck

Nach STEP042.2 wurde Alert-TTS erfolgreich ueber das Sound-System abgespielt. Im Alert-Test war TTS aber zusaetzlich noch im Alert-Overlay hoerbar.

Dieser STEP verhindert doppelte Audio-Ausgabe.

## Geaenderte Dateien

- `backend/modules/alert_system.js`
- `htdocs/overlays/_overlay-alerts-v2.html`

## Aenderungen

### Backend

`buildOverlayAlert()` sendet fuer Alert-TTS im Modus `sound_system` keine abspielbare `audioUrl` mehr an das Overlay.

Der TTS-Payload bleibt fuer Timing/Debug vorhanden, aber mit:

- `overlayPlaybackEnabled: false`
- `overlayAudioSuppressed: true`
- `audioUrl: ""`
- `audioFile: ""`

Damit kann das Overlay den Alert weiterhin korrekt lange anzeigen, aber keinen TTS-Sound mehr selbst starten.

### Overlay

`scheduleAlertTts()` spielt TTS nur noch ab, wenn explizit gilt:

- `tts.playbackMode === "overlay"` oder
- `tts.overlayPlaybackEnabled === true`

Fehlt diese explizite Freigabe, bleibt das Overlay stumm.

## Erwartetes Verhalten

- Alert-Hauptsound laeuft wie bisher ueber Sound-System.
- Alert-TTS laeuft ueber Sound-System.
- Alert-Overlay zeigt nur Visuals und spielt kein eigenes TTS-Audio.
- Normales TTS-Overlay bleibt aus.
- Alert bleibt weiterhin bis nach Alert-TTS sichtbar.

## Syntaxcheck

- `node --check backend/modules/alert_system.js`

## Test

1. Backend neu starten.
2. OBS Browserquelle Cache aktualisieren.
3. Ko-fi Donation Test mit Nachricht ausfuehren.
4. Erwartung: TTS nur einmal hoerbar, ueber Sound-System.
