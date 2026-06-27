# CURRENT CHAT HANDOFF – EVENT-RUNTIME-2C

Stand: 2026-06-16

## Step

```text
EVENT-RUNTIME-2C – Phasenbasiertes Event-Runtime-Overlay, Countdown-Fokus + Auswertung vorbereitet
```

## Ziel

Das vorhandene kombinierte Overlay bleibt erhalten:

```text
htdocs/overlays/stream_events/event_runtime_overlay.html
```

Es wird aber nicht mehr als große Eventkarte genutzt, sondern als zentrales animiertes Runtime-Overlay mit Phasenbasis:

```text
countdown  -> vor jedem Sound-Schnipsel
result     -> spätere animierte Auswertung
finished   -> späteres Event-Ende
cancelled  -> Abbruchanzeige
hidden     -> Standardzustand ohne Anzeige
```

Aktueller sichtbarer Fokus ist nur der Countdown im CGN-Stil.

## Architekturentscheidung

Wichtig:

```text
Das Overlay startet niemals selbst Sound.
Das Sound-System bleibt Owner für Playback, Queue und Audio-Status.
Das Eventsystem bleibt Owner für Runde, Antwortfenster, Auswertung und Overlay-State.
```

Der spätere Sound-Flow muss über einen sound-system-kompatiblen PreRoll-/Playback-Gate laufen:

```text
Eventsystem fordert Countdown an
-> Sound-System-kompatibler Flow blockiert/koordiniert Playback
-> Overlay zeigt 3 / 2 / 1
-> danach startet der Sound über das bestehende Sound-System
```

## Geänderte Dateien

```text
backend/modules/stream_events.js
htdocs/overlays/stream_events/event_runtime_overlay.html
docs/current/CURRENT_CHAT_HANDOFF_EVENT_RUNTIME_2C.md
```

## Backend-Änderungen

```text
stream_events.js
0.5.25 -> 0.5.26
MODULE_BUILD: STEP_EVENT_RUNTIME_2C_PHASED_OVERLAY
```

Die Route bleibt:

```text
GET /api/stream-events/runtime-overlay/state
```

Neue/erweiterte State-Bereiche:

```text
mode.phasedRuntimeOverlay = true
mode.countdownOnlyCurrentFocus = true
mode.resultAnimationPrepared = true

display.overlayMode
countdown
result
runtimeOverlay.phased
runtimeOverlay.currentFocus = countdown_before_sound
runtimeOverlay.resultAnimationPrepared = true
```

Viewer-Safety bleibt aktiv:

```text
noAcceptedAnswersInOverlayState = true
noFullSnippetListInOverlayState = true
overlayDoesNotStartSound = true
soundSystemMustGateCountdownAndPlayback = true
```

## Overlay-Änderungen

`event_runtime_overlay.html` wurde auf eine klare Phasenanzeige umgebaut.

Aktuell sichtbar relevant:

```text
- CGN-Neon-Countdown-Animation
- große mittige Zahlen
- 3 / 2 / 1 / LOS als Demo-Modus
- Result-Card nur vorbereitet
- Debug nur mit ?debug=1
- Heartbeat weiter über /overlays/shared/overlay_bus_client.js
```

Demo-URLs nur für optische Prüfung:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?demo=countdown
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?demo=result
```

Produktiv ohne Demo:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html
```

Wenn keine sichtbare Countdown-/Result-Phase aktiv ist, bleibt das Overlay unsichtbar.

## Nicht geändert

```text
sound_system.js
sound_system_overlay.html
Sound-Queue
Playback
Media-System
Dashboard
DB-Daten
Antwort-/Punkte-Logik
```

## Tests nach Einspielen + StepDone

Zuerst nach Deploy:

```powershell
.\stepdone.cmd "EVENT-RUNTIME-2C - Phasenbasiertes Event-Runtime-Overlay mit Countdown-Fokus"
```

Danach:

```powershell
node -c .\backend\modules\stream_events.js
```

```powershell
Test-Path .\htdocs\overlays\stream_events\event_runtime_overlay.html
```

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/runtime-overlay/state"
$r | Select-Object ok,module,moduleVersion,moduleBuild,step
$r.mode
$r.display
$r.countdown
$r.result
$r.safetyRules
```

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s.runtimeOverlay
```

Optische Prüfung:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?demo=countdown
```

Erwartung:

```text
moduleVersion: 0.5.26
moduleBuild: STEP_EVENT_RUNTIME_2C_PHASED_OVERLAY
step: EVENT-RUNTIME-2C
mode.phasedRuntimeOverlay: true
mode.countdownOnlyCurrentFocus: true
mode.resultAnimationPrepared: true
runtimeOverlay.phased: true
```

## Nächster sinnvoller Step

```text
EVENT-SOUND-1 – Sound-System-kompatiblen Countdown-before-Playback-Flow planen/prüfen
```

Dabei zuerst `sound_system.js` und die vorhandenen Sound-Entry-Points exakt prüfen. Kein Sound darf am Sound-System vorbei gestartet werden.
