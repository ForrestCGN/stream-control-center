# CURRENT CHAT HANDOFF – EVS-19c Parallel Test Options Fix

Stand: 2026-06-13

## Zweck

EVS-19c repariert den Testpfad `POST /api/stream-events/chat-runtime/test-chat`.

## Fix

- `processParallelChatMessage(chat, context)` nutzt nun `context.eventUid` statt einer nicht existierenden Variable `options`.
- Dadurch kann der Test gezielt gegen das aktive EVS-19 Stealth-Testevent laufen.

## Weiterhin unveraendert

- Sound und Text werden parallel per UND-Regel geprüft.
- Keine direkte Twitch-Chat-Ausgabe.
- Kein direktes Sound-Playback.
- Keine Sound-System-Queue-Beruehrung.
- Keine DB-Migration.

## Tests nach Einspielen

```powershell
node -c .\backend\modules\stream_events.js
.\stepdone.cmd "EVS-19c Parallel Test Options Fix"
```

Danach erneut:

```powershell
$t = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/chat-runtime/test-chat" -Body (@{
  eventUid = "<aktive-eventUid>"
  userLogin = "forrestcgn"
  userDisplayName = "ForrestCGN"
  message = "ich geh kurz kaffee holen"
} | ConvertTo-Json) -ContentType "application/json"

$t | ConvertTo-Json -Depth 10
```
