# Modul-Doku – Stream Events / EventSound Runtime

Datei: `backend/modules/stream_events.js`  
Stand: `0.5.36` / `STEP_EVENT_SOUND_5B_OUTPUT_TARGET_CONFIG`  
Zuletzt aktualisiert: 2026-06-16

## Aufgabe

`stream_events` verwaltet Event-Runden wie Sound-Snippet-Spiele und Text-/Chat-basierte Eventlogik. Für EventSound bereitet das Modul Runden vor, löst aber das Audio nicht selbst aus. Playback läuft kontrolliert über das Sound-System.

## EventSound Runtime – aktueller Ablauf

1. Test-/Event wird angelegt.
2. Sound-Runde wird vorbereitet.
3. Optional echte Media-Snippets werden aus der Media-Registry genutzt.
4. Bei `play=1&confirm=1` wird eine kontrollierte Playback-Anfrage ans Sound-System gesendet.
5. Sound-System macht Countdown/PreRoll, startet Audio und blockt Queue.
6. Runtime-Overlay zeigt Countdown/Guessing/Hide.

## Wichtige Routen

```text
GET  /api/stream-events/sound-runtime/status
GET  /api/stream-events/sound-runtime/report
GET  /api/stream-events/sound-runtime/safety-plan
GET  /api/stream-events/sound-runtime/bus-integration-plan
GET  /api/stream-events/runtime-overlay/state
POST /api/stream-events/sound-runtime/reset-test-state?confirm=1
POST /api/stream-events/sound-runtime/create-test-event?confirm=1&useRealMedia=1
POST /api/stream-events/sound-runtime/next-round?play=1&confirm=1
POST /api/stream-events/sound-runtime/resolve
POST /api/stream-events/sound-runtime/unresolved
POST /api/stream-events/sound-runtime/test-chat
```

## Test-State Cleanup

Route:

```text
POST /api/stream-events/sound-runtime/reset-test-state?confirm=1
```

Räumt hängende Sound-Testevents und aktive Testrunden auf. Das war wichtig, weil vorbereitete Runden sonst weitere Tests blockieren konnten.

## Echte Media-Snippets

Route:

```text
POST /api/stream-events/sound-runtime/create-test-event?confirm=1&useRealMedia=1
```

Verwendet echte Audio-Media-Assets aus der Media-Registry, wenn vorhanden. Fallback bleibt generated beep.

Beispiel aus Test:

```text
soundId: alf_5_sek
label: Alf 5 sek
file: media/stream_events/1-jahres-event/Alf_5_sek.mp3
audioUrl: /assets/media/stream_events/1-jahres-event/Alf_5_sek.mp3
durationMs: 5808
hasAudio: true
```

## Ausgabeziel

EventSound setzt nicht mehr hart `outputTarget=overlay`. Stattdessen wird `default` genutzt, sodass das Sound-System seine Default-/Config-Ausgabe verwendet.

Grund: Overlay-Autoplay hat beim Test mit Fehler reagiert:

```text
The play method is not allowed by the user agent or the platform in the current context...
```

## Diagnose-Befehle

```powershell
$e = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$e | Select-Object ok,module,moduleVersion,moduleBuild
```

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/reset-test-state?confirm=1"
$ev = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/create-test-event?confirm=1&useRealMedia=1"
$r = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/next-round?play=1&confirm=1"
$r.playbackResult.soundSystemResult.item | Select-Object soundId,label,file,audioUrl,mediaUrl,durationMs,hasAudio,target,outputTarget
```

## Offene Punkte

- EventSound-Testflow in echten Dashboard-Editor überführen.
- Sound-/Text-Spieltypen sauber konfigurierbar machen.
- Sound-Verhalten nach richtiger/falscher Antwort dashboardfähig machen.
- Reveal-Video nach richtig erkanntem Sound über Media-System planen.
