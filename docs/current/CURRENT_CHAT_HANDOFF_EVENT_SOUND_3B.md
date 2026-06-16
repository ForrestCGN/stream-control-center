# CURRENT CHAT HANDOFF – EVENT-SOUND-3B

Stand: 2026-06-16

## Step

```text
EVENT-SOUND-3B – Countdown Timing/Dedupe Fix
```

## Grund

Beim kontrollierten EventSound-PreRoll-Test lief der Countdown nicht sauber:

```text
3-Sekunden-Test zeigte 4 / doppelte Werte / doppelten Ablauf.
5-Sekunden-Test startete mit 6.
```

Ursache: Die Countdown-Restzeit wurde aus einem gepufferten Ablauf-/TTL-Zeitpunkt berechnet. Dadurch konnte `Math.ceil()` eine Sekunde zu viel anzeigen. Zusätzlich fehlten eindeutige Phase-/Request-Felder fuer saubere Deduplizierung.

## Geändert

### backend/modules/sound_system.js

Version:

```text
0.1.24 -> 0.1.25
MODULE_BUILD: STEP_EVENT_SOUND_3B_COUNTDOWN_TIMING_DEDUPE_FIX
```

Änderungen:

```text
- Runtime-Bus-Payload enthält jetzt phaseStartedAtMs.
- countdown.start enthält countdownStartedAtMs und countdownEndsAtMs.
- countdown.start setzt remainingSeconds direkt auf die konfigurierte seconds-Zahl.
- phaseKey wird pro Phase/Request erzeugt.
- State eventPreRoll.current enthält countdownStartedAtMs/countdownEndsAtMs.
- Status/Testflow markieren countdownTimingFixed und Dedupe-Felder.
```

### backend/modules/stream_events.js

Version:

```text
0.5.29 -> 0.5.30
MODULE_BUILD: STEP_EVENT_SOUND_3B_COUNTDOWN_TIMING_DEDUPE_FIX
```

Änderungen:

```text
- Runtime-Overlay-Bus-State nutzt countdownEndsAtMs statt gepuffertem expiresAtMs für die Anzeige.
- remainingSeconds wird auf 1..seconds geclamped.
- countdownSeconds=3 kann nicht mehr als 4 erscheinen.
- countdownSeconds=5 kann nicht mehr als 6 erscheinen.
- Dedupe über phaseKey/action.
- Countdown-State liefert phaseKey/requestId/countdownStartedAtMs/countdownEndsAtMs an das Overlay.
```

### htdocs/overlays/stream_events/event_runtime_overlay.html

Version:

```text
0.2.3 -> 0.2.4
```

Änderungen:

```text
- Countdown-Anzeige clamped remainingSeconds auf maximal seconds.
- Fallback nutzt countdownEndsAtMs, nicht TTL/Buffer.
- Runtime-PhaseKey wird gemerkt.
- beforeunload nutzt clearTimeout fuer Demo-Timer.
```

## Nicht geändert

```text
- sound_system_overlay.html
- normale Sound-Queue
- normale Soundalerts
- Dashboard
- DB
- Media-System
- Antwort-/Punkte-Logik
```

## Sicherheitsregeln

```text
- Sound-System bleibt Playback-/Queue-Owner.
- Runtime-Overlay startet keinen Sound.
- Countdown greift nur bei explizit markierten stream_events EventPreRoll-Items.
- Normale Sounds bleiben unverändert.
```

## StepDone

Nach dem Einspielen/Deployen:

```powershell
.\stepdone.cmd "EVENT-SOUND-3B - Countdown Timing Dedupe Fix"
```

## Tests danach

Status:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild
$s.eventPreRoll.testFlow
```

```powershell
$e = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$e | Select-Object ok,module,moduleVersion,moduleBuild
$e.eventSoundBusIntegration
```

3-Sekunden-Test:

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/event-preroll/test?confirm=1&countdownSeconds=3"
$t | Select-Object ok,module,moduleVersion,moduleBuild,step,message,countdownSeconds,durationMs
$t.result
```

5-Sekunden-Test:

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/event-preroll/test?confirm=1&countdownSeconds=5&durationMs=1500"
$t | Select-Object ok,module,moduleVersion,moduleBuild,step,message,countdownSeconds,durationMs
```

Erwartung:

```text
3 Sekunden: 3 -> 2 -> 1 -> LOS
5 Sekunden: 5 -> 4 -> 3 -> 2 -> 1 -> LOS
Kein 4 bei 3 Sekunden.
Kein 6 bei 5 Sekunden.
Kein doppelter Countdown.
Kein doppeltes LOS.
```
