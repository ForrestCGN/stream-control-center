# CURRENT CHAT HANDOFF – EVENT-RUNTIME-1

Stand: 2026-06-16

## Step

```text
EVENT-RUNTIME-1 – Read-only State-Vertrag fuer kombiniertes Event-Runtime-Overlay
```

## Ausgangslage

Vorheriger bestätigter Stand:

```text
EVENTSYS-27D-FIX2 – Live-Bedienung in der Übersicht
SOUND-SAFE-1 – Sound-System Safety Plan und PreRoll-Erweiterungspunkt
SOUND-SAFE-1B – Kombiniertes Event-Runtime-Overlay geplant
```

## Ziel dieses Steps

Das Eventsystem bekommt eine sichere, viewer-taugliche Read-only State-Route fuer das spaetere kombinierte Event-Runtime-Overlay.

Geplantes Overlay:

```text
htdocs/overlays/stream_events/event_runtime_overlay.html
```

State-Route:

```text
GET /api/stream-events/runtime-overlay/state
```

## Wichtige Entscheidung

Das kombinierte Overlay soll spaeter alle Event-Anzeigen in einer Quelle abbilden:

```text
- Countdown / PreRoll
- Jetzt raten
- Soundrunde aktiv
- Textrunde aktiv
- Richtig erkannt
- Nicht erkannt
- Lösung / Ergebnis
- Punkte / Top 3
- Event-Ende
```

Das bestehende Sound-Overlay bleibt unangetastet:

```text
htdocs/overlays/sound_system_overlay.html
```

Das Sound-System bleibt Owner fuer Queue, Playback, Audio-Acks und Overlay-Playback.
Das Eventsystem bleibt Owner fuer Event, Runden, Antwortfenster, Punkte und Ergebnisanzeige.

## Geänderte Datei

```text
backend/modules/stream_events.js
```

## Änderung

Modulversion:

```text
0.5.23 -> 0.5.24
```

Build:

```text
STEP_EVENT_RUNTIME_1_READONLY_OVERLAY_STATE
```

Neu:

```text
GET /api/stream-events/runtime-overlay/state
```

Der neue State liefert unter anderem:

```text
- module/moduleVersion/moduleBuild
- mode.readOnly=true
- mode.overlayBuilt=false
- mode.directPlayback=false
- overlay.plannedFile
- overlay.stateRoute
- phase.key / phase.label / phase.visible
- display.headline / display.subline
- event / activeEvent
- sound.activeRound
- sound.latestRound
- sound.runtimeConfig
- sound.preRollPlan
- text.enabled
- ranking.top3
- safetyRules
```

## Viewer-Safety

Die neue Overlay-State-Route ist bewusst nicht identisch mit Dashboard-/Debug-Routen.

Sie liefert während aktiver Soundrunden keine:

```text
- acceptedAnswers
- komplette Snippet-Liste
- Lösungstitel während aktivem Antwortfenster
- direkten Medienpfade für aktive Ratephasen
```

Grund: Ein OBS-Browseroverlay darf nicht versehentlich Lösungen ausliefern, die Zuschauer später erraten sollen.

## Nicht geändert

```text
- kein neues Overlay gebaut
- kein Dashboard geändert
- sound_system.js nicht geändert
- sound_system_overlay.html nicht geändert
- keine Queue geändert
- kein Audio-/Video-Playback aktiviert
- keine produktive Sound-Route genutzt
- keine DB-Daten geändert
- keine Migration
```

## Tests nach Einspielen + StepDone

Wichtig: Erst ZIP einspielen/deployen, dann StepDone, dann testen.

```powershell
.\stepdone.cmd "EVENT-RUNTIME-1 - Read-only State fuer kombiniertes Event-Runtime-Overlay"
```

Danach:

```powershell
node -c .\backend\modules\stream_events.js
```

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/runtime-overlay/state"
$r | Select-Object ok,module,moduleVersion,moduleBuild,step
$r.mode
$r.overlay
$r.phase
$r.display
$r.safetyRules
```

Routenprüfung:

```powershell
$routes = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/routes"
$routes.routes | Where-Object path -like "*runtime-overlay*"
```

Statusprüfung:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s.runtimeOverlay
```

## Erwartung

```text
ok=true
moduleVersion=0.5.24
moduleBuild=STEP_EVENT_RUNTIME_1_READONLY_OVERLAY_STATE
mode.readOnly=true
mode.overlayBuilt=false
mode.directPlayback=false
mode.soundSystemQueueTouched=false
runtimeOverlay.viewerSafe=true
```

## Nächster sinnvoller Step

```text
EVENT-RUNTIME-2 – kombiniertes Event-Runtime-Overlay als reine Anzeige bauen
```

Dabei weiterhin nicht ändern:

```text
- Sound-System Playback
- Sound-Queue
- sound_system_overlay.html
```

Das Overlay soll später ähnlich wie bestehende Overlays arbeiten:

```text
- State per GET /api/stream-events/runtime-overlay/state pollen
- optional per Bus/WS nur Refresh triggern
- overlay_bus_client.js fuer Diagnose-Heartbeat nutzen
- kein eigenes Playback auslösen
```
