# CURRENT CHAT HANDOFF – EVS-19d Parallel Context EventUid Fix

Stand: 2026-06-13

## Ziel

Fix fuer den EVS-19-Testpfad `POST /api/stream-events/chat-runtime/test-chat`.

## Problem

Der Parallel-Handler `processParallelChatMessage(chat, context)` las noch `options.eventUid`, obwohl die Funktion den Parameter `context` verwendet. Dadurch entstand:

```text
options is not defined
```

## Aenderung

```text
MODULE_VERSION = 0.5.10
MODULE_BUILD   = STEP_EVS_19D_PARALLEL_CONTEXT_EVENTUID_FIX
```

Der Event-Lookup im Parallel-Handler nutzt jetzt `context.eventUid`.

## Nicht geaendert

- Keine direkte Twitch-Ausgabe
- Kein direktes Sound-Playback
- Keine Sound-System-Queue-Beruehrung
- Keine DB-Migration
- Sound/Text-UND-Regel bleibt unveraendert

## Test nach StepDone

```powershell
$t = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/chat-runtime/test-chat" -Body (@{
  eventUid = "<AKTIVE_EVENT_UID>"
  userLogin = "forrestcgn"
  userDisplayName = "ForrestCGN"
  message = "ich geh kurz kaffee holen"
} | ConvertTo-Json) -ContentType "application/json"

$t | ConvertTo-Json -Depth 10
```
