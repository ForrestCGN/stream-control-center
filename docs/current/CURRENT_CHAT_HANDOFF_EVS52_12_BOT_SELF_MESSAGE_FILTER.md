# CURRENT CHAT HANDOFF – EVS52.12 Bot-/Self-Message-Filter

Stand: 2026-06-18

## Kurzstand

EVS52.11 hat den Chat-Command-Await-Fehler behoben. Danach wurde live bestätigt:

- Twitch-Chat kommt bei `stream_events` an.
- Soundantworten werden erkannt.
- Satz-/Text-Worttreffer werden verarbeitet.
- Chat-Ausgaben werden gesendet.

Neuer Fehler danach: Bot-/Systemnachrichten, besonders von `HeimaufsichtCGN`, kamen über denselben Twitch-Chat zurück und wurden wieder als Spieleingabe verarbeitet. Dadurch entstanden mehrere Teiltreffer-Meldungen aus Botantworten.

## EVS52.12 Änderung

`stream_events` filtert bekannte Bot-/Systemaccounts vor `processParallelChatMessage()`.

Ignoriert werden aktuell:

```text
heimaufsichtcgn
kofistreambot
streamstickers
streamelements
```

Nicht pauschal blockiert werden Moderatoren. EngelCGN, RoxxyFoxxyCGN und Tronic6 dürfen weiter mitspielen.

## Wichtig

Die Blockliste ist ein Hotfix im Modul. Sie soll später in die Einstellungen im Dashboard verschoben werden.

## Erwartung nach Deploy

- Chat von Forrest/Engel/Roxxy/Tronic wird weiter verarbeitet.
- Chat-Ausgaben von HeimaufsichtCGN lösen keine neuen Satz-/Sound-Prüfungen mehr aus.
- StreamElements/StreamStickers/KofiStreamBot werden ignoriert.
- `twitchChatSelfSkipped` bzw. `chatSource.selfSkipped` steigt bei ignorierten Botnachrichten.

## Test

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
$s.runtime.chatSource | Format-List
$s.runtime.counters | Select-Object twitchChatMessages,twitchChatSelfSkipped,textMessagesProcessed,soundChatMessagesProcessed,soundAnswerMatches,textWordHits,textPhraseSolves,chatOutputsLiveSent | Format-List
```

Erwartung:

```text
moduleVersion : 0.5.83
moduleBuild   : STEP_EVS52_12_BOT_SELF_MESSAGE_FILTER
```

## Offene Punkte

- Bot-/Self-Message-Blockliste dashboardfähig machen.
- Text-/Satz-Teiltreffer-Ausgaben entschärfen bzw. zusammenfassen, damit eine Usernachricht nicht zu viele Botmeldungen erzeugt.
- Komplette Satzlösung, Duplicate und weiteres Sound-Snippet live testen.
