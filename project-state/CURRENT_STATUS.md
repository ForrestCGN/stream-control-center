# CURRENT_STATUS – stream-control-center

Stand: 2026-06-18 – EVS52.14 getestet/stabil

## Kurzstatus

Das kombinierte Event-System Sound + Satz/Text ist nach EVS52.14 live getestet und funktionsfähig.

Aktiver Stand:

```text
stream_events moduleVersion : 0.5.85
stream_events moduleBuild   : STEP_EVS52_14_NEUTRAL_UNIQUE_TEXT_HINTS
```

## Bestätigter Live-Test

Letzte geprüfte Werte:

```text
chatSource.delivered             : 22
chatSource.selfSkipped           : 14
activeEventGuard.activeCount     : 1
twitchChatMessages               : 54
twitchChatSelfSkipped            : 14
textMessagesProcessed            : 18
soundChatMessagesProcessed       : 2
soundAnswerMatches               : 2
soundAnswerMisses                : 0
textWordHits                     : 14
textPhraseSolves                 : 1
chatOutputsLiveRequested         : 12
chatOutputsLiveSent              : 12
soundWaitsSkipped                : 2
```

Ranking-Test:

```text
rank 1: EngelCGN – 50 Punkte – 2 Einträge
```

## Ergebnis

- Twitch-Chat kommt zentral an.
- Soundantworten funktionieren.
- Satz-Teiltreffer funktionieren.
- Satzlösung funktioniert inklusive Overlay und Punkten.
- Duplicate funktioniert.
- Bot-/Systemaccount-Self-Loop ist behoben.
- Wartezeit überspringen funktioniert.
- Active-Event-Guard verhindert Mehrfach-Event-Probleme im Testpfad.

## Offene Punkte

- `textWordHitChatOutputsBundled` Diagnosezähler prüfen.
- `phraseSolves.points` im Report prüfen.
- Bot-/Ignore-Liste später ins Dashboard verschieben.
- Textvarianten für neutrale Teiltreffer im Dashboard pflegen.
- Satzlösungs-Overlay optisch verbessern.
