# STEP353_SOUND_OVERLAY_WS_PLAY_SIGNAL_FIX

## Ziel
Sound-System-Overlay verarbeitet WebSocket-Play-Signale wieder korrekt und meldet anschließend `/api/sound/client/audio-started` bzw. `/api/sound/client/audio-ended` zurück.

## Betroffene Dateien
- `htdocs/overlays/sound_system_overlay.html`

## Änderung
- WebSocket-Payload-Normalisierung im Sound-Overlay korrigiert.
- Der bisherige Handler nutzte `message.data || message`. Bei Sound-System-WebSocket-Nachrichten enthält `data` aber den öffentlichen Status (`publicState`) und nicht die eigentliche Envelope mit `op`/`reason`. Dadurch wurde `op=sound_system` verloren und das Overlay ignorierte das Play-Signal.
- Der Handler nutzt jetzt die echte Envelope, wenn `op`/`reason` direkt vorhanden sind, und fällt nur bei eingebetteten Browser-/PostMessage-Strukturen auf `message.data` zurück.
- Für Startsignale wird zusätzlich `payload.item` akzeptiert, nicht nur `data.current`.

## Bewusst nicht geändert
- Kein Dashboard.
- Kein Alert-System.
- Keine Sound-Queue.
- Kein `activeBundleLock`.
- Keine DB-/Config-Migration.
- Kein SoundBus-Backend-Umbau.

## Syntaxcheck
- Aus dem HTML-Script extrahiert und geprüft mit:
  - `node --check sound_system_overlay_step353_check.js`

## Test
1. OBS-Browserquelle für `sound_system_overlay.html` neu laden.
2. Testton starten:
   ```powershell
   Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?type=generated_beep&outputTarget=overlay&durationMs=1200&frequency=880&label=SoundBusClientTest"
   Start-Sleep -Seconds 2
   $s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
   $s.soundBus.recentEvents | Select-Object -First 15
   ```
3. Erwartung:
   - `client.audio_started` erscheint im SoundBus.
   - Danach `client.audio_ended` oder reguläres `item_finished`.
