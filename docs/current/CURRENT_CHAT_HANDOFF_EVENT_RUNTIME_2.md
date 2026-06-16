# CURRENT CHAT HANDOFF – EVENT-RUNTIME-2

Stand: 2026-06-16

## Step

```text
EVENT-RUNTIME-2 – Kombiniertes Event-Runtime-Overlay als reine Anzeige
```

## Ziel

Ein eigenes kombiniertes Overlay fuer das Eventsystem wurde angelegt:

```text
htdocs/overlays/stream_events/event_runtime_overlay.html
```

Das Overlay ist fuer Countdown/PreRoll-Anzeige, aktive Runde und Ergebnis-/Ende-Anzeige vorgesehen, bleibt in diesem Step aber reine Anzeige.

## Geaenderte Dateien

```text
backend/modules/stream_events.js
htdocs/overlays/stream_events/event_runtime_overlay.html
docs/current/CURRENT_CHAT_HANDOFF_EVENT_RUNTIME_2.md
```

## Backend-Aenderung

`stream_events.js` wurde nur fuer Version/Status/Overlay-Metadaten aktualisiert:

```text
0.5.24 -> 0.5.25
MODULE_BUILD: STEP_EVENT_RUNTIME_2_OVERLAY_DISPLAY
GET /api/stream-events/runtime-overlay/state bleibt read-only
runtimeOverlay.built = true
mode.overlayBuilt = true
```

Keine Playback-/Queue-Logik wurde geaendert.

## Overlay-Verhalten

Das Overlay liest:

```text
GET /api/stream-events/runtime-overlay/state
```

und zeigt daraus viewer-safe:

```text
- Eventname
- Phase
- Headline/Subline
- Countdown, wenn showCountdown=true und aktive Runde eine gestartete Antwortzeit hat
- Sound-/Text-Typ
- Snippet-Anzahl
- Top 3
- Loesung nur dann, wenn die State-Route itemVisible=true liefert
```

## Sicherheitsregeln

```text
- kein Soundstart im Overlay
- kein direkter Zugriff auf sound_system.js
- keine Queue-Beruehrung
- kein Media-Playback
- keine DB-Schreibaktion
- keine acceptedAnswers im Overlay
- keine komplette Snippet-Liste im Overlay
- sound_system_overlay.html bleibt unangetastet
```

## Bewusst nicht gemacht

```text
- kein EventSound-Playback
- kein PreRoll-Trigger
- kein Dashboard-Umbau
- kein Media-System-Umbau
- keine produktiven Buttons
- keine Text-/Punkte-/Antwortlogik geaendert
```

## Nach Einspielen / Deploy

Zuerst StepDone ausfuehren, weil der Stand sonst nicht live ist:

```powershell
.\stepdone.cmd "EVENT-RUNTIME-2 - Kombiniertes Event-Runtime-Overlay als reine Anzeige"
```

Danach testen:

```powershell
Test-Path .\htdocs\overlays\stream_events\event_runtime_overlay.html
```

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/runtime-overlay/state"
$r | Select-Object ok,module,moduleVersion,moduleBuild,step
$r.mode
$r.overlay
$r.phase
$r.display
```

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s.runtimeOverlay
```

Browser/OBS-Test:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html
```

Debug:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?debug=1
```

## Erwartung

```text
moduleVersion: 0.5.25
moduleBuild: STEP_EVENT_RUNTIME_2_OVERLAY_DISPLAY
step: EVENT-RUNTIME-2
runtimeOverlay.built: true
mode.overlayBuilt: true
```

## Naechster sinnvoller Step

```text
EVENT-RUNTIME-3 – Overlay-State live im Browser/OBS pruefen und danach Dashboard-Hinweis/Link vorbereiten
```

Danach erst:

```text
EVENT-SOUND-PLAYBACK-1 – echten Soundstart ueber vorhandenes Sound-System kontrolliert anbinden
```

Wichtig: Sound-System bleibt Playback-/Queue-Owner. Eventsystem bleibt Runden-/Antwort-/Punkte-Owner.
