# TEST REPORT – EVS52.14 getesteter stabiler Stand

Stand: 2026-06-18

## Version

```text
moduleVersion : 0.5.85
moduleBuild   : STEP_EVS52_14_NEUTRAL_UNIQUE_TEXT_HINTS
```

## Statusausgabe aus dem Live-Test

```text
chatSource.delivered             : 22
chatSource.selfSkipped           : 14
lastReason                       : ignored_runtime_bot_login
lastLogin                        : streamelements
ignoredLogins                    : heimaufsichtcgn, kofistreambot, streamstickers, streamelements
activeEventGuard.activeCount     : 1
twitchChatMessages               : 54
twitchChatSelfSkipped            : 14
textMessagesProcessed            : 18
soundChatMessagesProcessed       : 2
soundAnswerMatches               : 2
soundAnswerMisses                : 0
textWordHits                     : 14
textWordHitChatOutputsBundled    : 0
textPhraseSolves                 : 1
chatOutputsLiveRequested         : 12
chatOutputsLiveSent              : 12
eventCommandsHandled             : 0
soundWaitsSkipped                : 2
```

## Bestätigte Funktionen

- Twitch-Chat wird durch `stream_events` verarbeitet.
- Bot-/Self-Messages werden ignoriert.
- StreamElements wurde im letzten Test korrekt ignoriert.
- HeimaufsichtCGN löst keinen Feedback-Loop mehr aus.
- Soundantworten wurden erkannt.
- Satz-Teiltreffer wurden erkannt.
- Teiltreffer-Meldungen sind neutral, ohne Satznummer und ohne Satz-Zuordnung.
- Satzlösung wurde erkannt.
- Satzlösungs-Overlay wurde angezeigt.
- Duplicate wurde erkannt und nicht erneut gewertet.
- Wartezeit überspringen wurde getestet.
- Punkte/Ranking wurden geprüft.

## Sichtbare Chat-Beispiele aus dem Test

Gute neue Richtung:

```text
EngelCGN hat 3 Hinweis(e) entdeckt.
ForrestCGN hat 3 Teil(e) gefunden.
ForrestCGN liegt mit 1 Teil(e) richtig.
EngelCGN hat 1 neue Teil(e) aufgedeckt.
```

Wichtig: Keine Satznummer, keine Satz-Zuordnung.

## Auffälligkeiten

- `textWordHitChatOutputsBundled` blieb `0`. Sichtbare Funktion ist okay, aber Diagnosezähler später prüfen.
- `phraseSolves.points` im Report war leer, obwohl Chat und Ranking Punkte korrekt zeigten.
- Satzlösungs-Overlay-Text ist optisch etwas knapp.
