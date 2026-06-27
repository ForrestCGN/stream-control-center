# CURRENT_CHAT_HANDOFF – EVS-19 Sound/Text Parallel AND Runtime

Stand: 2026-06-13

## Ziel

EVS-19 setzt die fachliche Entscheidung um:

```text
Eine Chatnachricht soll für beide Spiele geprüft werden.
Nicht ODER, sondern UND.
```

## Geänderte Datei

```text
backend/modules/stream_events.js
```

## Neuer Modulstand

```text
MODULE_VERSION = 0.5.6
MODULE_BUILD   = STEP_EVS_19_SOUND_TEXT_PARALLEL_AND_RUNTIME
```

## Technische Änderung

- Neue Funktion `processParallelChatMessage(...)`.
- `handleTwitchChatEnvelope(...)` nutzt diese Parallel-Auswertung für echte `twitch.chat.message` Bus-Events.
- Sound-Runtime und Text-Runtime werden bei aktivem Kombi-Event beide auf dieselbe Nachricht angewendet.
- Soundlösung beendet nicht mehr automatisch die Textprüfung derselben Nachricht.
- Textlösung blockiert Soundprüfung nicht.
- `chatOutputs` aus beiden Runtimes werden gesammelt.

## Neue Test-Routen

```text
POST /api/stream-events/chat-runtime/create-stealth-test-event?confirm=1
POST /api/stream-events/chat-runtime/test-chat
```

## Sicherheitsstatus

Unverändert safe/prepared-only:

```text
directSend=false
directPlay=false
soundSystemQueueTouched=false
queueTouched=false
```

## Nicht geändert

```text
- keine DB-Migration
- keine Dashboard-Logik
- kein echtes Chat-Senden
- kein Sound-Playback
- keine Sound-System-Queue-Anbindung
- keine Funktionalität entfernt
```

## Pflicht vor Test

```powershell
node -c .ackend\modules\stream_events.js
.\stepdone.cmd "EVS-19 Sound Text Parallel AND Runtime"
```

## Testvorschlag

```powershell
$e = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/chat-runtime/create-stealth-test-event?confirm=1" -Body (@{
  start = $true
} | ConvertTo-Json) -ContentType "application/json"

$n = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/next-round" -Body (@{
  allowReuse = $true
} | ConvertTo-Json) -ContentType "application/json"

$t = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/chat-runtime/test-chat" -Body (@{
  userLogin = "forrestcgn"
  userDisplayName = "ForrestCGN"
  message = "heimleitung"
} | ConvertTo-Json) -ContentType "application/json"

$t | Select-Object ok,mode,soundSolved,textSolved,textWordHitCount,chatOutputCount,directSend,directPlayback,soundSystemQueueTouched
$t.sound | ConvertTo-Json -Depth 5
$t.text | ConvertTo-Json -Depth 5
```

## Erwartung

```text
mode = sound_text_parallel_and
Sound und Text werden beide geprüft.
Wenn die Nachricht für beide passt, können beide Punkte/Ergebnisse buchen.
ChatOutputs bleiben directSend=false.
Sound bleibt directPlay=false.
```

## Nächster Schritt nach erfolgreichem Test

EVS-20: Dashboard-Anzeige für Parallelstatus und aktive Kombi-Runtime verbessern.
