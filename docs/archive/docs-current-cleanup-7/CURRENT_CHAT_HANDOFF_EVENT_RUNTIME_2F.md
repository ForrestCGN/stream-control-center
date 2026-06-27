# CURRENT CHAT HANDOFF – EVENT-RUNTIME-2F

Stand: 2026-06-16

## Step

```text
EVENT-RUNTIME-2F – Runtime-Overlay Bus-Client + saubere Intro/Outro-Animation
```

## Ziel

Das bestehende kombinierte Event-Runtime-Overlay bleibt die zentrale Anzeige für Countdown und spätere Auswertung.
In diesem Step wurde nur das Overlay verbessert:

- LOS/JETZT-RATEN-Phase optisch sauberer vorbereitet
- LOS ist kleiner und wird nicht mehr aus dem Kreis geschnitten
- Einblenden und Ausblenden laufen weicher
- Demo simuliert den späteren Ablauf: 3 → 2 → 1 → LOS/JETZT RATEN → Ausblenden
- Overlay registriert sich sauberer am vorhandenen Overlay-Bus mit Runtime-Capabilities

## Geänderte Datei

```text
htdocs/overlays/stream_events/event_runtime_overlay.html
```

## Nicht geändert

```text
backend/modules/stream_events.js
backend/modules/sound_system.js
htdocs/overlays/sound_system_overlay.html
Queue
Playback
DB
Dashboard
Media-System
Antwort-/Punkte-Logik
```

## Bus-/Kommunikationsstand

Das Overlay nutzt weiter den bestehenden Client:

```text
/overlays/shared/overlay_bus_client.js
```

Es setzt vor dem Laden des Clients `window.CGN_OVERLAY_BUS` mit:

```text
overlay.heartbeat
stream_events.runtime_display
stream_events.runtime.countdown
stream_events.runtime.guessing
stream_events.runtime.result
ack
```

Das Overlay startet weiterhin keinen Sound.
Es reagiert auf relevante Bus-Messages nur mit einem Refresh der viewer-safe State-Route:

```text
GET /api/stream-events/runtime-overlay/state
```

## Geplanter späterer echter Ablauf

```text
Sound/Event-Request
→ Sound-System reserviert/queued/gate't
→ Bus/State startet Countdown
→ Overlay zeigt 3 → 2 → 1
→ Sound-System startet Sound
→ Overlay zeigt LOS/JETZT RATEN
→ Sound-System meldet Sound-Ende
→ Eventsystem/State blendet Overlay aus oder geht später in Result-Phase
```

## Wichtig

Das Sound-System bleibt Playback-/Queue-Owner.
Das Eventsystem bleibt Runden-/State-/Auswertungs-Owner.
Das Overlay bleibt reine Anzeige.

## Tests nach Einspielen + StepDone

Zuerst:

```powershell
.\stepdone.cmd "EVENT-RUNTIME-2F - Runtime Overlay Bus Client und Intro Outro Animation"
```

Dann:

```powershell
Test-Path .\htdocs\overlays\stream_events\event_runtime_overlay.html
```

Demo:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?demo=countdown
```

Erwartung:

```text
3 → 2 → 1 → LOS/JETZT RATEN bleibt ca. 5 Sekunden sichtbar → blendet sauber aus → wiederholt Demo
```

Produktiv:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html
```

Im produktiven Zustand bleibt das Overlay ohne aktive Runtime-Phase unsichtbar.

## Nächster sinnvoller Step

```text
EVENT-SOUND-1 – Sound-System-kompatiblen Countdown-before-Playback-Gate prüfen/planen
```

Dabei zuerst echte Sound-System-Dateien prüfen und den Gate-Punkt sauber festlegen.
Kein Soundstart am Sound-System vorbei.
