# CURRENT CHAT HANDOFF – EVENT-RUNTIME-2E

Stand: 2026-06-16

## Step

`EVENT-RUNTIME-2E – Countdown-Overlay Position/Look finalisieren`

## Ziel

Das bestehende Event-Runtime-Overlay bleibt die zentrale Datei für spätere Event-Anzeigen, wurde aber im aktuellen sichtbaren Countdown-Look angepasst:

- oben mittig positioniert
- insgesamt kompakter
- Neon-Rand enger um den dunklen Kreis
- kleiner Abstand zwischen Kreis und Textanzeige
- Textanzeige als separates Pill-Feld unter dem Kreis
- Textanzeige hat eigenen dünnen Rand
- Schrift sitzt im Textfeld etwas tiefer

## Betroffene Datei

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

## Architektur bleibt unverändert

- Overlay zeigt nur Countdown / später Auswertung.
- Overlay startet keinen Sound.
- Sound-System bleibt Owner für Queue und Playback.
- Eventsystem bleibt Owner für Runde, State und Auswertung.

## Test nach Einspielen + StepDone

Zuerst:

```powershell
.\stepdone.cmd "EVENT-RUNTIME-2E - Countdown Overlay Position Look finalisiert"
```

Danach prüfen:

```powershell
Test-Path .\htdocs\overlays\stream_events\event_runtime_overlay.html
```

Demo im Browser/OBS:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?demo=countdown
```

Erwartung:

- Countdown ist oben mittig.
- Kreis ist kleiner/kompakter.
- Ring liegt enger um den dunklen Kreis.
- Textfeld sitzt separat unter dem Kreis mit kleinem Abstand.
- Textfeld hat eigenen Rand.
- Es startet kein Sound.

## Nächster sinnvoller Step

`EVENT-SOUND-1 – Sound-System-kompatiblen Countdown-before-Playback-Flow prüfen/planen`

Dabei zuerst echte Sound-System-Dateien prüfen und festlegen, wo der Countdown sauber gegated wird, damit zwischen Countdown und Sound kein anderer Sound dazwischenfunkt.
