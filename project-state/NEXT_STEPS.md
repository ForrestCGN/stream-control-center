# NEXT_STEPS – stream-control-center

Stand: 2026-06-18 – EVS52.14

## Jetzt testen

EVS52.14 neutralisiert Teiltreffer-Chatmeldungen. Es wird keine Satznummer mehr genannt. Die angezeigte Anzahl zaehlt eindeutige gefundene Woerter/Teile aus der Usernachricht.

### Nach Deploy

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
$s.runtime.counters | Select-Object twitchChatMessages,twitchChatSelfSkipped,textMessagesProcessed,soundChatMessagesProcessed,soundAnswerMatches,textWordHits,textWordHitChatOutputsBundled,textPhraseSolves,chatOutputsLiveSent | Format-List
```

Erwartung:

```text
moduleVersion : 0.5.85
moduleBuild   : STEP_EVS52_14_NEUTRAL_UNIQUE_TEXT_HINTS
```

### Live-Test

1. Teilwort schreiben, das nur in einem Satz vorkommt: genau eine neutrale Meldung ohne Satznummer.
2. Teilwort schreiben, das in mehreren Saetzen vorkommt: genau eine neutrale Meldung mit `1 Teil`, keine Satznummer.
3. Mehrere unterschiedliche Teilwoerter schreiben: eine neutrale Meldung mit passender Anzahl eindeutiger Teile.
4. Soundantwort testen.
5. kompletten Satz testen.
6. Duplicate testen.

## Danach sinnvoll

- Falls EVS52.14 passt: Doku-Abschluss/Handoff erstellen.
- Bot-/Systemaccount-Blockliste spaeter in Dashboard-Einstellungen verschieben.
- Textvarianten fuer `text.word_hit.neutral.chat` spaeter im Dashboard pruefen/anpassen.

