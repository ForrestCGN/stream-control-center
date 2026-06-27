# CURRENT CHAT HANDOFF – EVS52.11 Chat-Command Await-Fix

Stand: 2026-06-18

## Anlass

Nach EVS52.10 kam Twitch-Chat bei `stream_events` an, aber normale Nachrichten wurden nicht an Sound/Text weitergegeben. Statuswerte zeigten:

```text
twitchChatMessages > 0
textMessagesProcessed = 0
soundChatMessagesProcessed = 0
lastReason = event_command_processed
```

## Ursache

`processEventCommand(chat)` ist async. Der Aufruf wurde ohne `await` ausgewertet. Ein Promise ist truthy, daher wurde jede normale Chatnachricht als Event-Command-Pfad behandelt.

## Änderung

- `stream_events` Version `0.5.82 / STEP_EVS52_11_CHAT_COMMAND_AWAIT_FIX`.
- `handleTwitchChatEnvelope()` ist async.
- `processEventCommand(chat)` wird nur ausgefuehrt, wenn die Nachricht wirklich mit `!event` beginnt.
- Normale Chatnachrichten gehen wieder direkt an `processParallelChatMessage()`.
- Async-Fehler im Bus-Callback werden im ChatSource-Status sichtbar.

## Nicht geändert

- Keine DB-Aenderung.
- Keine Punktelogik.
- Keine Sound-/Satz-Fachlogik.
- Keine neue Chatquelle.
- Keine alten Direct-/Wildcard-Hooks.

## Tests nach Deploy

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
$s.runtime.chatSource | Format-List
$s.runtime.counters | Select-Object twitchChatMessages,textMessagesProcessed,soundChatMessagesProcessed,soundAnswerMatches,soundAnswerMisses,textWordHits,textPhraseSolves,eventCommandsHandled | Format-List
```

Erwartet:

```text
moduleVersion : 0.5.82
moduleBuild   : STEP_EVS52_11_CHAT_COMMAND_AWAIT_FIX
```

Live testen:

1. Soundantwort.
2. Satz-Teilwort.
3. Kompletter Satz.
4. Duplicate.
5. `!event status`.
6. Ranking/User-Historie.

## StepDone

```powershell
.\stepdone.cmd "EVS52.11 Chat-Command Await-Fix fuer Sound und Satz"
```
