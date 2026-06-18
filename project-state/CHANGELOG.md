# CHANGELOG – stream-control-center

## 2026-06-18 – EVS52.14 Neutrale eindeutige Teiltreffer-Meldungen

- `stream_events` auf Version `0.5.85` / Build `STEP_EVS52_14_NEUTRAL_UNIQUE_TEXT_HINTS` gesetzt.
- Teiltreffer-Chatmeldungen nennen keine Satznummer und keine Satz-Zuordnung mehr.
- Sichtbare Anzahl zaehlt eindeutige gefundene Woerter/Teile aus der Usernachricht, nicht Satz-Treffer.
- Neue neutrale Textvariante `text.word_hit.neutral.chat` mit mehreren CGN-/Heimleitungs-Zufallstexten ergaenzt.
- Interne Treffer, Bus-Events, Punkte, Ranking, Sound, Satzloesung und Duplicate unveraendert gelassen.

## 2026-06-18 – EVS52.13 Teiltreffer-Chatmeldungen bündeln

- `stream_events` auf Version `0.5.84` / Build `STEP_EVS52_13_TEXT_HINT_CHAT_BUNDLE` gesetzt.
- Live-Chat-Ausgaben für Satz-Teiltreffer werden pro eingehender User-Chatnachricht gebündelt.
- Bei mehreren Satztreffern wird die neue Textvariante `text.word_hit.summary.chat` genutzt.
- Interne Treffer, Punkte, Ranking und Bus-Events bleiben erhalten.
- Sound-, Satzlösungs-, Duplicate- und Bot-Filter-Logik nicht umgebaut.

# CHANGELOG – stream-control-center

## 2026-06-18 – EVS52.12 Bot-/Self-Message-Filter

### Geaendert

- `stream_events` auf `0.5.83 / STEP_EVS52_12_BOT_SELF_MESSAGE_FILTER` erhoeht.
- Bekannte Bot-/Systemaccounts werden vor der Sound-/Satz-Runtime ignoriert.
- Ignoriert: `heimaufsichtcgn`, `kofistreambot`, `streamstickers`, `streamelements`.
- Moderatoren werden nicht pauschal gesperrt; EngelCGN, RoxxyFoxxyCGN und Tronic6 duerfen weiter mitspielen.
- Status-Zaehler ergaenzt: `twitchChatSelfSkipped` und `chatSource.selfSkipped`.

### Nicht geaendert

- Keine DB-Aenderung.
- Keine Punktelogik geaendert.
- Keine Sound-/Satzlogik geaendert.
- Keine Chatquelle geaendert.

### ToDo

- Bot-/Self-Message-Blockliste spaeter in Dashboard-Einstellungen verschieben.

## 2026-06-18 – EVS52.11 Chat-Command Await-Fix

### Geaendert

- `stream_events` auf `0.5.82 / STEP_EVS52_11_CHAT_COMMAND_AWAIT_FIX` erhoeht.
- Fehler im Twitch-Chat-Handler behoben: `processEventCommand()` ist async und wurde ohne `await` ausgewertet. Dadurch wurden normale Chatnachrichten faelschlich als Event-Command behandelt.
- Normale Chatnachrichten werden jetzt nur dann an `processEventCommand()` gegeben, wenn sie wirklich mit `!event` beginnen.
- Alle anderen Twitch-Chatnachrichten laufen wieder direkt in `processParallelChatMessage()` und damit in Sound + Satz/Text.
- Fehlerbehandlung fuer den async Bus-Callback ergaenzt, damit Chat-Handler-Fehler im Status sichtbar werden.

### Nicht geaendert

- Keine DB-Aenderung.
- Keine Punktelogik geaendert.
- Keine Sound-Rundenlogik geaendert.
- Keine Satz-/Text-Punktelogik geaendert.
- Keine neue Chatquelle.
- Keine alten Direct-/Wildcard-Hooks wieder eingebaut.

### Lokale Syntax-Checks

- `node -c backend/modules/stream_events.js` bestanden.

## 2026-06-18 – EVS52.9 Twitch-Events Chatquelle aufgeraeumt

### Geaendert

- `stream_events` auf `0.5.80 / STEP_EVS52_9_TWITCH_EVENTS_CHAT_SUBSCRIBER` erhoeht.
- `stream_events` verarbeitet Twitch-Chat fuer Sound+Satz nur noch ueber den zentralen Bus-Subscriber `twitch.chat.message`.
- `twitch_presence` auf `0.1.6 / EVS52_9_TWITCH_EVENTS_CHAT_SOURCE` erhoeht.
- `twitch_presence` ruft `stream_events` nicht mehr direkt auf, sondern gibt IRC-PRIVMSG nur an `twitch_events.handleIrcEvent()` weiter.

### Aufgeraeumt

- EVS52.6 Direct-Bridge-Patch auf `twitch_events.handleIrcEvent` aus `stream_events` entfernt.
- EVS52.7 Direct-Bridge aus `twitch_presence` nach `stream_events` entfernt.
- EVS52.8 Wildcard-Bus-Fallback in `stream_events` entfernt.

### Nicht geaendert

- Keine DB-Aenderung.
- Keine Punktelogik geaendert.
- Keine Sound-Rundenlogik geaendert.
- Keine Satz-/Text-Punktelogik geaendert.

### Lokale Syntax-Checks

- `node -c backend/modules/stream_events.js` bestanden.
- `node -c backend/modules/twitch_events.js` bestanden.
- `node -c backend/modules/twitch_presence.js` bestanden.
- `node -c htdocs/dashboard/modules/stream_events.js` bestanden.

## 2026-06-18 – EVS52.9 Doku/Handoff: Chatquelle stoppen und sauber neu ansetzen

### Dokumentiert

- Diagnoseauswertung von `/api/communication/status` und `/api/twitch/events/status`.
- Festgehalten: spezifische `twitch.chat/message` Subscriber hatten `delivered=0`.
- Festgehalten: `twitch_events.eventSubChat` war aktiv, aber `notifications=0` und `chatMessagesEmitted=0`.
- Festgehalten: EVS52.6–EVS52.8 waren Diagnose-/Fallback-Versuche und dürfen nicht weiter blind ausgebaut werden.
- Zielarchitektur dokumentiert: eine zentrale normalisierte Chatquelle für Sound- und Satz-Teilspiel.
- Neuer Chat-Prompt für EVS52.9 erstellt.

### Keine Codeänderung

- Keine produktive Logik geändert.
- Keine DB-Änderung.
- Keine weiteren Hooks ergänzt.
- Sound-Spiel und Satz-Spiel wurden in diesem Doku-Step nicht angefasst.

## 2026-06-18 – EVS52.8 Twitch-Chat Bus-Fallback

- `stream_events` um Wildcard-Bus-Fallback fuer `twitch.chat.message` erweitert.
- Diagnose `text-runtime/live-debug` um `twitchChatBusFallback` erweitert.
- Testscript `EVS52_8_TWITCH_CHAT_BUS_FALLBACK_CHECK.ps1` ergänzt.
- Nach Diagnose nicht als fertige Lösung bestätigt.

## 2026-06-18 – EVS52.7 Twitch-Presence Chat-Bridge

- Twitch-Presence-Direct-Bridge für Satz-/Text-System ergänzt.
- Nach Diagnose nicht als fertige Lösung bestätigt.

## 2026-06-18 – EVS52.6 Live-Chat Direct-Bridge

- Direct-Bridge-Fallback über `twitch_events.handleIrcEvent()` ergänzt.
- Nach Diagnose nicht als fertige Lösung bestätigt.

## 2026-06-18 – EVS52.5 Text Live Flow Fix

- Satz-/Text-Runtime akzeptiert Dashboard-Aliase.
- Teiltreffer werden auch bei `wordPointsEnabled=false` erkannt.
- Testscript `EVS52_5_TEXT_LIVE_FLOW_CHECK.ps1` bestanden.

## 2026-06-18 – EVS52.4 Text-Chat-Ausgaben aktiv

- Satz-Spiel-Textvarianten vorbereitet.
- `helper_texts` und `helper_chat_output` vorgesehen.

## 2026-06-18 – EVS52.3 Satzlösung-Celebration Overlay

- 15s Celebration-Overlay bei kompletter Satzlösung vorbereitet.

## 2026-06-18 – EVS51.x / EVS50.x

- Punkte-Historie, Punktecheck, Satz-Testbereich, Duplikat-Schutz und kombinierter Sound/Text-Abschluss bestätigt.

## 2026-06-18 – EVS52.10 Chatquelle/Active-Event-Hotfix

- `stream_events` auf 0.5.81 / `STEP_EVS52_10_CHAT_ACTIVE_EVENT_HOTFIX` aktualisiert.
- Dashboard-/Test-Start nutzt wieder `startEvent()` und damit denselben Schutz gegen mehrere aktive Events wie der normale Startpfad.
- `sound-runtime/skip-wait` blockiert ohne eindeutige `eventUid`, wenn mehrere aktive Events gefunden werden.
- Statusdiagnose um `runtime.activeEventGuard` ergänzt.
- `twitch_presence` auf 0.1.7 aktualisiert und startet die IRC-Presence standardmäßig automatisch (`TWITCH_PRESENCE_AUTOSTART`, Default true), damit Chat via `twitch_events.handleIrcEvent()` in den Bus kommt.
- `twitch_presence.chatBus` zeigt jetzt Subscriber-Delivery und Payload-Vorschau.
- `twitch_events` auf 0.1.13 aktualisiert und IRC-Chat-Zähler ergänzt.
