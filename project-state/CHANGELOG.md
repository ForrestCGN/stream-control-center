# CHANGELOG – stream-control-center

## 2026-06-18 – EVS52.14 Abschluss/Doku: Chat + Sound + Satz stabil getestet

### Getesteter Stand

- `stream_events` läuft mit `moduleVersion=0.5.85` und `moduleBuild=STEP_EVS52_14_NEUTRAL_UNIQUE_TEXT_HINTS`.
- EVS52.9 bis EVS52.14 wurden live konsolidiert getestet.
- Twitch-Chat läuft zentral über `twitch_events`/Communication-Bus nach `stream_events`.
- Sound- und Satz-/Text-Teilspiel nutzen dieselbe normalisierte Chatmessage.
- Alte Direct-/Wildcard-Fallback-Wege aus EVS52.6–EVS52.8 sind aus dem produktiven Runtime-Pfad entfernt.

### Live bestätigt

- Chatquelle aktiv: `twitch.chat.message` kommt bei `stream_events` an.
- Bot-/Systemaccount-Filter greift: `heimaufsichtcgn`, `kofistreambot`, `streamstickers`, `streamelements` werden ignoriert.
- Moderatoren/echte Spieler wie `engelcgn`, `roxxyfoxxycgn`, `tronic6` und `forrestcgn` bleiben spielberechtigt.
- Soundantworten funktionieren: `soundAnswerMatches=2`, `soundAnswerMisses=0` im letzten Teststand.
- Satz-Teiltreffer funktionieren und senden neutrale Chatmeldungen ohne Satznummer/Satzzuordnung.
- Satzlösung funktioniert inklusive Chatmeldung, Punkte und Satzlösungs-Overlay.
- Duplicate wurde erkannt und nicht erneut gewertet.
- Wartezeit überspringen funktioniert und ist gegen mehrere aktive Events abgesichert.
- Active-Event-Guard meldete `activeCount=1`.
- Ranking/Punkte wurden geprüft: EngelCGN hatte 50 Punkte aus Sound/Satz-Kombination.

### Letzte bekannte Testwerte

```text
moduleVersion                    : 0.5.85
moduleBuild                      : STEP_EVS52_14_NEUTRAL_UNIQUE_TEXT_HINTS
chatSource.delivered             : 22
chatSource.selfSkipped           : 14
runtime.activeEventGuard.activeCount : 1
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

### Offen / nicht kritisch

- `textWordHitChatOutputsBundled` blieb im letzten Status `0`, obwohl die sichtbaren Teiltreffer-Meldungen neutralisiert wurden. Diagnosezähler später prüfen.
- `phraseSolves.points` im Report war leer, obwohl Chat/Ranking Punkte korrekt zeigten. Report-Feld später prüfen.
- Satzlösungs-Overlay optisch später nachziehen: Text rechts etwas knapp/abgeschnitten.
- Bot-/Ignore-Liste später aus hartem Code in Dashboard-Einstellungen verschieben.
- Textvarianten `text.word_hit.neutral.chat` später im Dashboard pflegen.

## 2026-06-18 – EVS52.14 Neutrale eindeutige Teiltreffer-Meldungen

- `stream_events` auf Version `0.5.85` / Build `STEP_EVS52_14_NEUTRAL_UNIQUE_TEXT_HINTS` gesetzt.
- Teiltreffer-Chatmeldungen nennen keine Satznummer und keine Satz-Zuordnung mehr.
- Sichtbare Anzahl zählt eindeutige gefundene Wörter/Teile aus der Usernachricht, nicht Satz-Treffer.
- Gleiches Wort in mehreren Sätzen wird im Chat nur als ein Teil gemeldet.
- Neue neutrale Textvariante `text.word_hit.neutral.chat` mit mehreren CGN-/Heimleitungs-Zufallstexten ergänzt.
- Interne Treffer, Bus-Events, Punkte, Ranking, Sound, Satzlösung und Duplicate unverändert gelassen.

## 2026-06-18 – EVS52.13 Teiltreffer-Chatmeldungen bündeln

- `stream_events` auf Version `0.5.84` / Build `STEP_EVS52_13_TEXT_HINT_CHAT_BUNDLE` gesetzt.
- Live-Chat-Ausgaben für Satz-Teiltreffer werden pro eingehender User-Chatnachricht gebündelt.
- Bei mehreren Satztreffern wird die neue Textvariante `text.word_hit.summary.chat` genutzt.
- Interne Treffer, Punkte, Ranking und Bus-Events bleiben erhalten.
- Sound-, Satzlösungs-, Duplicate- und Bot-Filter-Logik nicht umgebaut.

## 2026-06-18 – EVS52.12 Bot-/Self-Message-Filter

- `stream_events` auf `0.5.83 / STEP_EVS52_12_BOT_SELF_MESSAGE_FILTER` erhöht.
- Bekannte Bot-/Systemaccounts werden vor der Sound-/Satz-Runtime ignoriert.
- Ignoriert: `heimaufsichtcgn`, `kofistreambot`, `streamstickers`, `streamelements`.
- Moderatoren werden nicht pauschal gesperrt.
- Status-Zähler ergänzt: `twitchChatSelfSkipped`, `chatSource.selfSkipped`, `chatSource.ignoredLogins`.

## 2026-06-18 – EVS52.11 Chat-Command Await-Fix

- `stream_events` auf `0.5.82 / STEP_EVS52_11_CHAT_COMMAND_AWAIT_FIX` erhöht.
- Fehler im Twitch-Chat-Handler behoben: `processEventCommand()` ist async und wurde ohne `await` ausgewertet.
- Normale Chatnachrichten werden nur noch an `processEventCommand()` gegeben, wenn sie wirklich mit `!event` beginnen.
- Alle anderen Twitch-Chatnachrichten laufen in `processParallelChatMessage()` und damit in Sound + Satz/Text.

## 2026-06-18 – EVS52.10 Chatquelle/Active-Event-Hotfix

- `stream_events` auf `0.5.81 / STEP_EVS52_10_CHAT_ACTIVE_EVENT_HOTFIX` aktualisiert.
- Dashboard-/Test-Start nutzt wieder `startEvent()` und damit denselben Schutz gegen mehrere aktive Events wie der normale Startpfad.
- `sound-runtime/skip-wait` blockiert ohne eindeutige `eventUid`, wenn mehrere aktive Events gefunden werden.
- Statusdiagnose um `runtime.activeEventGuard` ergänzt.
- `twitch_presence` auf `0.1.7` aktualisiert und startet IRC-Presence standardmäßig automatisch.
- `twitch_events` auf `0.1.13` aktualisiert und IRC-Chat-Zähler ergänzt.

## 2026-06-18 – EVS52.9 Twitch-Events Chatquelle aufgeräumt

- `stream_events` auf `0.5.80 / STEP_EVS52_9_TWITCH_EVENTS_CHAT_SUBSCRIBER` erhöht.
- `stream_events` verarbeitet Twitch-Chat für Sound+Satz über den zentralen Bus-Subscriber `twitch.chat.message`.
- EVS52.6 Direct-Bridge, EVS52.7 Presence-Direct-Bridge und EVS52.8 Wildcard-Bus-Fallback aus dem produktiven Runtime-Pfad entfernt.
