# CURRENT CHAT HANDOFF – EVS52.13 Text-Hinweise bündeln

Stand: 2026-06-18

## Aktueller Stand

`stream_events` wurde auf Version `0.5.84` / Build `STEP_EVS52_13_TEXT_HINT_CHAT_BUNDLE` gesetzt.

## Was funktioniert bereits

- Twitch-Chat kommt über `twitch_events`/Communication-Bus bei `stream_events` an.
- Soundantworten werden verarbeitet und geben Punkte.
- Satz-Teiltreffer werden verarbeitet.
- Komplette Satzlösung gibt Punkte und löst das 15s-Overlay aus.
- Duplicate-Satzlösung wird erkannt und gibt keine neuen Punkte.
- Bot-/Systemnachrichten von `heimaufsichtcgn`, `kofistreambot`, `streamstickers`, `streamelements` werden ignoriert und erzeugen keinen Feedback-Loop.

## EVS52.13 Änderung

Eine Twitch-Chatnachricht kann mehrere Teiltreffer in mehreren offenen Sätzen erzeugen. Bisher wurden dafür mehrere Live-Chatmeldungen gesendet. Das wurde entschärft:

- Die Treffer werden weiterhin vollständig gespeichert.
- Bus-Events pro Satz bleiben erhalten.
- Die Live-Chat-Ausgabe wird gebündelt.
- Pro eingehender User-Chatnachricht wird maximal eine Teiltreffer-Chatmeldung gesendet.
- Bei einem Satz wird weiterhin `text.word_hit.chat` genutzt.
- Bei mehreren Sätzen wird `text.word_hit.summary.chat` genutzt.

## Wichtig

Punkte, Ranking, Soundspiel, Satzlösung und Duplicate-Logik wurden nicht umgebaut.

## Tests nach Einspielen

```powershell
node -c .\backend\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
$s.runtime.counters | Select-Object twitchChatMessages,twitchChatSelfSkipped,textMessagesProcessed,soundChatMessagesProcessed,soundAnswerMatches,textWordHits,textWordHitChatOutputsBundled,textPhraseSolves,chatOutputsLiveSent | Format-List
```

Live testen:

1. Eine Usernachricht mit einem Teiltreffer in einem Satz.
2. Eine Usernachricht mit Teiltreffern in mehreren Sätzen.
3. Erwartung: maximal eine Teiltreffer-Chatmeldung pro Usernachricht.
4. Soundantwort testen.
5. Komplette Satzlösung testen.
6. Duplicate testen.

## Offene ToDos

- Bot-/Systemaccount-Blockliste dashboardfähig machen.
- Satzlösungs-Overlay visuell feinjustieren, falls gewünscht.
- Optional Textvarianten im Dashboard für neue `text.word_hit.summary.chat` prüfen.
