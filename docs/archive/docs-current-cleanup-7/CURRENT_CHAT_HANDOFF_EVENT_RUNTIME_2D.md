# CURRENT CHAT HANDOFF – EVENT-RUNTIME-2D

Stand: 2026-06-16

## Step

```text
EVENT-RUNTIME-2D – Dezenter, aber gut sichtbarer CGN-Countdown-Look
```

## Ziel

Das bestehende kombinierte Event-Runtime-Overlay bleibt erhalten:

```text
htdocs/overlays/stream_events/event_runtime_overlay.html
```

Es wurde optisch für den Sound-PreRoll angepasst:

- sichtbar genug als Vorwarnung vor Sound-Schnipseln
- weniger dominant als ein großer Alert
- dünnerer Neon-Rand
- reduzierter Glow
- kompakteres zentrales Countdown-Signal
- Panel weiterhin ausreichend dunkel/lesbar, nicht zu transparent
- Countdown-Zahl bleibt klar erkennbar
- spätere Result-/Auswertungsstruktur bleibt vorbereitet

## Geänderte Dateien

```text
htdocs/overlays/stream_events/event_runtime_overlay.html
```

## Nicht geändert

```text
backend/modules/stream_events.js
backend/modules/sound_system.js
htdocs/overlays/sound_system_overlay.html
Sound-Queue
Playback
Media-System
Dashboard
DB-Daten
Antwort-/Punkte-Logik
```

## Wichtige Architekturregel

Das Event-Runtime-Overlay zeigt weiterhin nur visuelle Zustände.

```text
Overlay startet keinen Sound.
Overlay fasst keine Queue an.
Sound-System bleibt Owner für Playback/Queue.
Eventsystem bleibt Owner für Runde/State/Auswertung.
```

## Tests nach Einspielen + StepDone

Zuerst StepDone:

```powershell
.\stepdone.cmd "EVENT-RUNTIME-2D - Dezenter CGN-Countdown-Look"
```

Danach testen:

```powershell
Test-Path .\htdocs\overlays\stream_events\event_runtime_overlay.html
```

Demo im Browser/OBS:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?demo=countdown
```

Produktiv normal:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html
```

## Erwartung

- Countdown ist sichtbar, aber nicht extrem auffällig.
- Rand ist dünner.
- Glow ist schwächer.
- Panel ist nicht zu transparent.
- Kein Sound startet durch das Overlay.
- Normalzustand bleibt hidden, solange kein aktiver Runtime-State geliefert wird.

## Nächster sinnvoller Step

```text
EVENT-SOUND-1 – Sound-System-kompatiblen Countdown-before-Playback-Flow prüfen/planen
```

Dafür zuerst echte Sound-System-Dateien prüfen. Kein Soundstart am Sound-System vorbei.
