# NEXT_STEPS – stream-control-center

Stand: 2026-06-18 – EVS52.11

## Jetzt testen

EVS52.11 behebt den Fehler, dass normale Twitch-Chatnachrichten durch den async `processEventCommand()`-Aufruf faelschlich als `!event`-Command behandelt wurden.

### Nach Deploy

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
$s.runtime.chatSource | Format-List
$s.runtime.counters | Select-Object twitchChatMessages,textMessagesProcessed,soundChatMessagesProcessed,soundAnswerMatches,soundAnswerMisses,textWordHits,textPhraseSolves,eventCommandsHandled | Format-List
```

Erwartung:

```text
moduleVersion : 0.5.82
moduleBuild   : STEP_EVS52_11_CHAT_COMMAND_AWAIT_FIX
```

### Live-Test-Reihenfolge

1. Genau ein aktives Event sicherstellen.
2. Sound-Antwort im Twitch-Chat schreiben, waehrend Antwortfenster laeuft.
3. Erwartung: `soundChatMessagesProcessed` steigt, bei richtiger Antwort `soundAnswerMatches` steigt.
4. Teilwort aus offenem Satz schreiben.
5. Erwartung: `textMessagesProcessed` steigt, bei Treffer `textWordHits` steigt, keine Wortpunkte wenn `wordPointsEnabled=false`.
6. Kompletten Satz schreiben.
7. Erwartung: `textPhraseSolves` steigt, Punkte + Chatmeldung + 15s Overlay.
8. `!event status` testen.
9. Erwartung: `eventCommandsHandled` steigt nur bei echtem `!event`-Command.
10. Ranking/User-Historie pruefen.

## Danach

- Falls Sound/Satz live funktionieren: EVS52.11 dokumentieren und als stabilen Chat-Fix markieren.
- Falls Chat verarbeitet wird, aber Antwort nicht matched: naechster Fix nur in Answer-Matching/Normalisierung, nicht in der Chatquelle.
- Alte Diagnose-Hinweise EVS52.6–EVS52.8 danach aus TODO/NEXT_STEPS bereinigen.
