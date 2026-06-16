# CURRENT CHAT HANDOFF – EVENT-RUNTIME-2G

Stand: 2026-06-16

## STEP

```text
EVENT-RUNTIME-2G – Unteres Textfeld mit Rand und pulsierendem Jetzt-raten-State
```

## Ziel

Das bestehende Event-Runtime-Overlay bleibt erhalten und wurde nur optisch angepasst.

Gewünscht war:

```text
- unten um die Textanzeige ebenfalls ein sichtbarer Rand
- „JETZT RATEN!“ soll pulsieren
- keine Änderung am Sound-System
- keine Änderung an Queue/Playback
```

## Geänderte Dateien

```text
htdocs/overlays/stream_events/event_runtime_overlay.html
```

## Inhaltliche Änderung

```text
- Caption/Textfeld hat einen klareren, aber weiterhin dezenten Neon-Rand
- Textfeld nutzt nun einen eigenen Border-/Glow-Look passend zum Kreis
- Guessing-Phase animiert die Caption leicht pulsierend
- Pulse bleibt ruhig und soll nicht wie ein harter Alert wirken
- Overlay-Version im HTML von 0.2.2 auf 0.2.3 erhöht
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

## Test nach Einspielen und StepDone

Zuerst nach Deploy:

```powershell
.\stepdone.cmd "EVENT-RUNTIME-2G - Unteres Textfeld Rand und Jetzt Raten Pulse"
```

Danach testen:

```powershell
Test-Path .\htdocs\overlays\stream_events\event_runtime_overlay.html
```

Demo:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?demo=countdown
```

Erwartung:

```text
3 -> 2 -> 1 -> LOS / JETZT RATEN
Textfeld unten hat Rand
JETZT RATEN pulsiert leicht
Overlay blendet danach sauber aus
kein Soundstart
```

## Nächster sinnvoller Schritt

```text
EVENT-SOUND-1 – Sound-System-kompatiblen Countdown-before-Playback-Gate über Communication/EventBus prüfen/planen
```
