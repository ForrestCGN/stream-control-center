# CURRENT CHAT HANDOFF – EVENT-SOUND-3C

Stand: 2026-06-16

## Step

```text
EVENT-SOUND-3C – Overlay Countdown Sequencer Fix
```

## Anlass

Der EventSound-PreRoll-Test startet inzwischen grundsätzlich richtig, aber der Countdown lief optisch nicht sauber:

```text
3 wurde mehrfach bzw. deutlich länger angezeigt als 2/1.
```

Ursache: Das Runtime-Overlay hat den Countdown aus Poll-/Bus-State gerendert. Dadurch konnte derselbe Countdown-Wert bei Refreshes erneut angezeigt bzw. durch die laufende Animation länger wirken.

## Änderung

Betroffene Datei:

```text
htdocs/overlays/stream_events/event_runtime_overlay.html
```

Umgesetzt:

```text
- lokaler Countdown-Sequencer im Overlay
- Sequenz startet nur einmal pro phaseKey/requestId
- Poll-/Bus-Refresh setzt denselben Countdown nicht erneut zurück
- Werte werden anhand countdownStartedAtMs/countdownEndsAtMs exakt getaktet
- 3/5 Sekunden laufen in 1-Sekunden-Schritten
- LOS/JETZT RATEN bleibt vorbereitet und wird nicht vom Polling zurückgesetzt
- Overlay-Version 0.2.5
```

## Nicht geändert

```text
backend/modules/sound_system.js
backend/modules/stream_events.js
htdocs/overlays/sound_system_overlay.html
normale Sound-Queue
normale Soundalerts
Dashboard
DB
Media-System
Antwort-/Punkte-Logik
```

## Sicherheit

Das Overlay startet weiterhin keinen Sound. Sound-System bleibt Playback-/Queue-Owner. Runtime-Overlay zeigt nur an.

## Test nach Deploy + StepDone

Zuerst:

```powershell
.\stepdone.cmd "EVENT-SOUND-3C - Overlay Countdown Sequencer Fix"
```

Dann Overlay normal öffnen, nicht Demo:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html
```

3-Sekunden-Test:

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/event-preroll/test?confirm=1&countdownSeconds=3"
$t | Select-Object ok,module,moduleVersion,moduleBuild,step,message,countdownSeconds,durationMs
$t.result
```

Erwartung:

```text
3 -> 2 -> 1 -> LOS/JETZT RATEN
3 darf nicht mehrfach animiert/resettet wirken.
```

5-Sekunden-Test:

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/event-preroll/test?confirm=1&countdownSeconds=5&durationMs=1500"
$t | Select-Object ok,module,moduleVersion,moduleBuild,step,message,countdownSeconds,durationMs
```

Erwartung:

```text
5 -> 4 -> 3 -> 2 -> 1 -> LOS/JETZT RATEN
kein 6, kein doppelter Countdown, kein doppeltes LOS.
```

## Nächster Schritt

Wenn der Sequencer jetzt sauber läuft:

```text
EVENT-SOUND-4 – echten EventSound-Rundenstart kontrolliert an PreRoll-Testflow anbinden
```

Erst wenn Countdown/LOS/Hide zuverlässig sind.
