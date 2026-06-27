# CURRENT CHAT HANDOFF – EVS52.14 Neutrale eindeutige Teiltreffer-Meldungen

Stand: 2026-06-18

## Stand

EVS52.14 baut auf EVS52.13 auf und korrigiert die sichtbaren Teiltreffer-Chatmeldungen.

## Geaendert

- `stream_events` Version `0.5.85`, Build `STEP_EVS52_14_NEUTRAL_UNIQUE_TEXT_HINTS`.
- Neue neutrale Textvariante `text.word_hit.neutral.chat` mit mehreren Zufallstexten.
- Teiltreffer-Chatmeldungen nennen keine Satznummer und keine Satz-Zuordnung mehr.
- Sichtbare Anzahl zaehlt eindeutige gefundene Woerter/Teile aus der Usernachricht.
- Gleiches Wort in mehreren Saetzen wird im Chat nur als ein Teil gemeldet.
- Interne Treffer bleiben pro Satz gespeichert; Bus-Events pro Satz bleiben erhalten.

## Nicht geaendert

- Keine DB-Aenderung.
- Keine Punktelogik geaendert.
- Keine Soundlogik geaendert.
- Keine Satzloesungs-/Duplicate-Logik geaendert.
- Keine Chatquelle geaendert.
- Bot-/Systemaccount-Filter aus EVS52.12 bleibt unveraendert.

## Nach Deploy

```powershell
.\stepdone.cmd "EVS52.14 Neutrale eindeutige Teiltreffer Meldungen"
```

Backend neu starten und pruefen:

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

## Live-Test

1. Einzelnes Teilwort: eine neutrale Meldung ohne Satznummer.
2. Ein Teilwort, das in mehreren Saetzen vorkommt: sichtbare Meldung bleibt `1 Teil`.
3. Mehrere unterschiedliche Teilwoerter: sichtbare Anzahl entspricht eindeutigen Woertern.
4. Soundantwort testen.
5. Satzloesung testen.
6. Duplicate testen.

## Offene Punkte

- Bot-/Systemaccount-Blockliste spaeter in Dashboard-Einstellungen verschieben.
- Textvarianten fuer `text.word_hit.neutral.chat` spaeter im Dashboard pruefen/anpassen.
- Nach stabilem Test Doku-Abschluss fuer EVS52.9–EVS52.14 erstellen.
