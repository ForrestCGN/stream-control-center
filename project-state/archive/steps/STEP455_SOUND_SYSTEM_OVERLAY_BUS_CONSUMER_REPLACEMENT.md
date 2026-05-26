# STEP455 – Sound-System Overlay Bus Consumer Replacement

## Ziel

Das bestehende produktive Sound-System-Overlay wird direkt busfähig, ohne den alten produktiven Wiedergabeweg zu entfernen.

Das Overlay ersetzt damit den bisherigen reinen Legacy-Consumer-Stand durch einen kombinierten Stand:

```text
Communication-Bus sound.* Events
+ legacy op:sound_system WebSocket
+ /api/sound/status Polling-Fallback
```

## Ausgangslage

Nach STEP452 läuft VIP produktiv über den Sound-Bus in das Sound-System.

Nach STEP454 laufen Alerts produktiv Bus-First über `visual.alert` mit Legacy-Fallback.

Das vorhandene `sound_system_overlay.html` war bereits produktiv für echte Wiedergabe zuständig:

- Audio-Wiedergabe
- Video-Wiedergabe
- Clip-Shoutout/VIP30-Visual
- Autoplay-Unlock
- `/api/sound/client/audio-started`
- `/api/sound/client/audio-ended`
- `/api/sound/client/error`
- Legacy-WebSocket `op: sound_system`
- Polling auf `/api/sound/status`

## Umsetzung

`htdocs/overlays/sound_system_overlay.html` wurde erweitert:

- neuer Bus-Consumer für Sound-System-Bus-Envelopes
- Registrierung per `bus_hello` als Overlay-Client
- Capabilities unter anderem:
  - `sound.event_output`
  - `sound.started`
  - `sound.finished`
  - `sound.stopped`
  - `sound.skipped`
  - `sound.cleared`
  - `sound.failed`
  - `sound.queue.updated`
  - `sound.state.updated`
- Normalisierung von Bus-Envelopes auf den bestehenden Overlay-Playback-Flow
- ACKs per `bus_ack` für empfangene/verbrauchte Bus-Events

## Wichtige Sicherheitsentscheidung

Der alte produktive Weg bleibt vollständig erhalten:

```text
op: sound_system WebSocket bleibt aktiv
/api/sound/status Polling bleibt aktiv
/client/audio-started bleibt aktiv
/client/audio-ended bleibt aktiv
/client/error bleibt aktiv
```

Dadurch wird das bestehende Overlay nicht hart ersetzt, sondern busfähig erweitert.

## Nicht geändert

- Kein Sound-System-Backend-Umbau.
- Keine Queue-/Priority-/Lock-Änderung.
- Kein TTS-Umbau.
- Kein Discord-Umbau.
- Kein Dashboard-Umbau.
- Keine Änderung an `backend/modules/sound_system.js`.
- Keine bestehende Funktionalität entfernt.

## Produktiver Flow nach STEP455

```text
Sound-System startet Sound
→ emitSoundBus(...) sendet sound.* Event
→ sound_system_overlay.html empfängt Bus-Envelope
→ bestehende playSound(...)-Logik spielt Audio/Video/Clip
→ Overlay meldet weiterhin audio-started/audio-ended an das Backend
```

Falls kein Bus-Event beim Overlay ankommt, bleiben die alten Wege aktiv:

```text
Legacy WebSocket op:sound_system
oder /api/sound/status Polling
```

## Test / Abschluss

Projekt-Reihenfolge:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP455 Sound System Overlay Bus Consumer Replacement"
```

Da in diesem STEP keine Backend-JS-Datei geändert wurde, ist kein `node --check` erforderlich.

Kurzer Statuscheck:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/status" | ConvertTo-Json -Depth 8
```

OBS-Browserquelle bleibt unverändert:

```text
/overlays/sound_system_overlay.html
```
