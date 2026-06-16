# CURRENT CHAT HANDOFF – EVENT-SOUND-1

Stand: 2026-06-16

## Step

```text
EVENT-SOUND-1 – Bus-/Sound-System-Kommunikationsplan fuer Countdown-before-Playback
```

## Ziel

Der Countdown vor einem Sound-Schnipsel soll nicht am Sound-System vorbei laufen. Sound-System, Eventsystem und Event-Runtime-Overlay sollen ueber den bestehenden Communication/EventBus zusammenarbeiten.

## Wichtigste Entscheidung

Das Sound-System bleibt Gatekeeper fuer Countdown und Playback.

```text
stream_events
→ bereitet EventSound/Runde vor

sound_system
→ nimmt Sound an oder queued ihn
→ reserviert den aktuellen Sound-Slot
→ triggert Countdown ueber Bus
→ startet danach den Sound ueber den bestehenden Playback-Flow
→ meldet Sound-Ende

event_runtime_overlay.html
→ zeigt nur visuell Countdown / LOS / Jetzt raten / spaeter Result
→ startet niemals Sound
```

## Geaendert

```text
backend/modules/stream_events.js
```

Version:

```text
0.5.26 -> 0.5.27
MODULE_BUILD: STEP_EVENT_SOUND_1_BUS_INTEGRATION_PLAN
```

Neue Read-only Route:

```text
GET /api/stream-events/sound-runtime/bus-integration-plan
```

Status erweitert:

```text
eventSoundBusIntegration.planned = true
eventSoundBusIntegration.soundSystemGatekeeper = true
eventSoundBusIntegration.communicationBusRequired = true
eventSoundBusIntegration.runtimeOverlayCapability = stream_events.runtime_display
eventSoundBusIntegration.soundOverlayCapability = sound.event_output
eventSoundBusIntegration.playbackChanged = false
```

## Nicht geaendert

```text
backend/modules/sound_system.js
htdocs/overlays/sound_system_overlay.html
htdocs/overlays/stream_events/event_runtime_overlay.html
Queue
Playback
DB-Daten
Dashboard
Media-System
Antwort-/Punkte-Logik
```

## Ergebnis der Pruefung

Vorhandene Sound-System-Kommunikation:

```text
sound_system.js
- nutzt communication_bus
- sendet Sound-Events ueber capability sound.event_output
- hat command capability sound.command_input
- hat enqueueOrStart(item)
- hat startItem(item)
- hat activateItemAudio(item)
- verarbeitet /api/sound/client/audio-started
- verarbeitet /api/sound/client/audio-ended
```

Vorhandenes Sound-Overlay:

```text
sound_system_overlay.html
- konsumiert capability sound.event_output
- startet Audio nur auf Sound-System-Events
- meldet audio-started/audio-ended zurueck
```

Event-Runtime-Overlay:

```text
htdocs/overlays/stream_events/event_runtime_overlay.html
- soll capability stream_events.runtime_display nutzen
- zeigt nur Runtime/Countdown/Result
- startet keinen Sound
```

## Festgelegter sicherer Gate-Punkt

Der sichere Erweiterungspunkt liegt im Sound-System:

```text
sound_system.startItem(item)
```

Und dort genauer:

```text
nachdem state.current/state.parallel gesetzt wurde
vor emitItemEvent('item_starting')
vor activateItemAudio(item)
```

Warum:

```text
Ab diesem Zeitpunkt ist der Sound-Slot im Sound-System reserviert.
Dadurch kann kein anderer Sound zwischen Countdown und genau diesem Sound dazwischenfunken.
```

## Geplanter Ablauf fuer spaeter

```text
1. stream_events bereitet Runde und Sound-Payload vor
2. sound_system akzeptiert oder queued den Sound nach normaler Queue-Policy
3. sound_system reserviert den Sound als current item
4. sound_system sendet per Bus an stream_events.runtime_display: countdown.start
5. event_runtime_overlay zeigt 3 -> 2 -> 1
6. sound_system sendet: guessing.start
7. event_runtime_overlay zeigt LOS / JETZT RATEN
8. sound_system startet bestehenden activateItemAudio-Flow
9. sound_system_overlay spielt den Sound
10. sound_system_overlay meldet client/audio-started
11. sound_system_overlay meldet client/audio-ended
12. sound_system beendet Item und sendet Runtime-Hide/Finished
13. event_runtime_overlay blendet sauber aus
```

## Bus-Zielgruppen

Sound-Overlay bleibt:

```text
channel: sound
capability: sound.event_output
```

Event-Runtime-Overlay bekommt:

```text
channel: stream_events.runtime
capability: stream_events.runtime_display
```

Sound-Command-Schicht bleibt:

```text
channel: sound.command
capability: sound.command_input
```

## Tests nach Einspielen + StepDone

Zuerst:

```powershell
.\stepdone.cmd "EVENT-SOUND-1 - Bus Sound-System Kommunikationsplan fuer Countdown before Playback"
```

Dann:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/sound-runtime/bus-integration-plan"
$r | Select-Object ok,module,moduleVersion,moduleBuild,step
$r.currentMode
$r.existingCommunicationFindings.soundSystem
$r.proposedBusContract
$r.selectedImplementationGate
$r.safetyRules
```

Zusatz:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s.eventSoundBusIntegration
```

Route pruefen:

```powershell
$routes = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/routes"
$routes.routes | Where-Object path -like "*bus-integration*"
```

## Naechster Schritt

```text
EVENT-SOUND-2 – Sound-System PreRoll-Gate minimal additiv vorbereiten
```

Vor EVENT-SOUND-2 zwingend weiter vorsichtig bleiben:

```text
- Sound-System bleibt Owner
- keine direkte Soundausgabe aus dem Overlay
- kein Timer-Soundstart aus stream_events am Sound-System vorbei
- Countdown nur nach Sound-System-Reservierung
- Ausblenden bevorzugt bei audio-ended/item_finished, Fallback ueber vorhandenen Sound-System-Finish
```
