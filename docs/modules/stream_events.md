# Modul-Doku: stream_events – Stand EVS49.38

Stand: 2026-06-18

## Modul

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

## Kernbereiche

Das Modul verwaltet aktuell:

- Event-Entwürfe und Event-Lifecycle
- Sound-Teilspiel
- Text-/Satz-Teilspiel
- Punkte / Ranking
- Runtime-Overlay
- Winner-Finale / Auswertung
- Testfunktionen im Dashboard

## Winner-Finale / Auswertung

### Backend

Relevante Funktionen/Routen:

```text
GET  /api/stream-events/events/:eventUid/finale
POST /api/stream-events/events/:eventUid/finale/start?confirm=1
GET  /api/stream-events/winner-finale/demo-random?count=7
POST /api/stream-events/test/run?confirm=1&step=...
```

Finale-Daten enthalten:

```text
ranking
podiumRows
honorRows
top3
winner
avatarPreload
overlayReadyGate
```

### Top-3 Avatar Preload

Vor dem Bus-Event wird Platz 1–3 über vorhandene Helper/Twitch-/Userinfo-Routen geprüft.

Helper-Kette:

```text
resolveTwitchUserInfoSmall(login)
→ lokale Tabellen
→ /userinfo?login=...
→ /api/twitch/userinfo?login=...
→ /api/twitch/user?login=...
```

Timeout:

```text
ca. 4 Sekunden
```

### Bus

Backend sendet:

```text
stream_events.winner_finale / started
stream_events.winner_finale / replay_requested
```

Overlay empfängt über:

```text
overlay_bus_client.js
cgn:overlay-bus-message
```

## Winner-Overlay

Dateien:

```text
htdocs/overlays/stream_events/event_winner_overlay.html
htdocs/overlays/stream_events/event_winner_overlay_layout.json
```

Eigenschaften:

- festes Design aus EVS49
- absolute JSON-Koordinaten
- keine alten `.award-slot` / `.honor-slot` Renderer
- Reveal-Reihenfolge: Platz 10 → 4, dann Platz 3 → 2 → 1
- Dauer:
  - `duration=short`
  - `duration=normal`
  - `duration=long`
- Sofortbild:
  - `state=final`
  - `instant=1`

## Dashboard-Testbereich

Pfad:

```text
Dashboard → Event-System → Test
```

Buttons:

- Overlay öffnen
- Runtime-Overlay öffnen
- URL kopieren
- Random-Winner-Demos
- Backend-Testdaten laden
- Testevent erstellen/starten
- falsche/richtige Antworten simulieren
- Ranking auffüllen
- Event beenden
- Auswertung starten
- Full-Flow komplett

## Test-Route

```text
POST /api/stream-events/test/run?confirm=1&step=<step>
```

Steps:

```text
create
start
wrong
correct
seed-ranking
finish
finale
full-flow
```

## Sicherheit

- Test-Routen brauchen `confirm=1`.
- Tests sollen keine echte Twitch-Ausgabe senden.
- Testevents werden durch Namen/Metadata als Dashboard-Test markiert.
- Original-Events sollen nicht verändert werden.

## Offene Punkte Satz-System

Der nächste Block betrifft das Satz-/Text-System:

- echte Testfälle für Satzrunden im Dashboard
- falsche/richtige Satzantworten sichtbar nachvollziehen
- Satz als gelöst markieren
- Punkte nur bei korrekter Antwort
- Mehrfachantworten/Followup-Regeln prüfen
- Text-Teilspiel Abschlussstatus
- Kombination Sound + Text: Gesamtabschluss erst, wenn beide Teilspiele fertig sind
- Runtime-Overlay Status für Text/Sätze verbessern

## EVS50.1 – Aktuelles Event: User-Punkte-Historie

Im Tab `Aktuelles Event` sind Ranglisten-Zeilen anklickbar. Der Klick öffnet das User-Detailfenster für genau dieses Event.

Verwendete Routen:

```text
GET /api/stream-events/statistics/users?eventUid=<eventUid>
GET /api/stream-events/statistics/user/:login?eventUid=<eventUid>
```

Das Popup zeigt:

- Punkte gesamt
- Sound-Punkte
- Satz-/Text-Punkte
- Punkte-Einträge
- Worttreffer
- Satzlösungen
- Punkte-Verlauf mit Zeitpunkt, Quelle/Grund und Punkten

Punktequellen laufen weiterhin über `stream_events_score_entries`. Sound und Satz/Text werden addiert, aber per `source_type` getrennt angezeigt.

Relevante `source_type` Werte:

```text
sound_solved
text_word_hit
text_phrase_solve
manual / sonstige
```

## EVS50.2 – Testbereich: Punkteprüfung Sound + Satz

Der Dashboard-Testbereich wurde erweitert, damit Punkte nicht nur im Ranking sichtbar sind, sondern gezielt gegen Sound- und Satz-/Text-Quellen geprüft werden können.

Neue/erweiterte Test-Steps über:

```text
POST /api/stream-events/test/run?confirm=1&step=<step>
```

Zusätzliche Steps:

```text
sound-correct
points-check
```

### `sound-correct`

- nutzt das aktuelle Testevent oder das neueste Testevent
- startet das Event bei Bedarf
- bereitet eine Sound-Runde ohne echtes Playback vor
- löst die Sound-Runde mit einer akzeptierten Antwort
- schreibt Sound-Punkte in `stream_events_score_entries`
- liefert Ranking, Runtime-Parts und User-Statistik zurück

### `points-check`

Erstellt ein frisches kombiniertes Testevent und prüft in einem Ablauf:

- falsche Antworten ohne Punkte
- Sound-Lösung mit Sound-Punkten
- Satzlösung 1
- Satzlösung 2
- gemeinsames Ranking aus Sound + Satz/Text
- User-Detailstatistik für `ForrestCGN`
- Runtime-Parts für Sound/Text/Gesamt

Wichtig: Wortpunkte können je nach Text-Konfig zusätzlich zu den Satzpunkten entstehen. Die Prüfung soll deshalb nicht blind eine fixe Gesamtsummeme erzwingen, sondern sichtbar machen, welche Punkte wann und wofür geschrieben wurden.

### Dashboard

Pfad:

```text
Dashboard → Event-System → Test
```

Neue Buttons:

```text
Sound richtig + Punkte
Punkte-Check Sound + Satz
```

Nach einem Test zeigt der Testbereich eine Punkte-Prüfung mit:

- Gesamtpunkte des Testusers
- Sound-Punkte
- Satz-/Text-Punkte
- Ranking-Topwert
- Teilspielstatus Sound/Text/Gesamt
- kurzer Punkte-Timeline

## EVS50.3 – Points-Check Insert-Fix

- `createDashboardEventTestEvent()` schreibt jetzt alle NOT-NULL-Pflichtfelder fuer `stream_events_events`.
- Fix fuer `NOT NULL constraint failed: stream_events_events.scoring_config_json` beim `points-check`.
- Keine DB-Daten ersetzt, keine Punkte-/Rankinglogik geaendert.


## EVS50.4 – Points-Check Sound-Fix

- Fix fuer den synthetischen `points-check`, wenn Soundpunkte wegen Runtime-Gate nicht geschrieben wurden.
- Dashboard-Testevents duerfen beim kontrollierten Testlauf das Runtime-Gate umgehen.
- Produktive Soundrunden bleiben unveraendert durch das Runtime-Gate geschuetzt.
- `points-check` gibt nur noch `ok: true` zurueck, wenn Sound-Punkte, Satz-/Text-Punkte und Gesamtsumme die Mindestwerte erreichen.

## EVS50.5 – Points-Check Active-Event-Fix

Der Punktecheck beendet vor dem Erstellen eines neuen kontrollierten Testevents alte aktive Dashboard-Testevents. Dadurch zeigt `Aktuelles Event` nicht mehr versehentlich einen alten EVS-Punktecheck mit unvollständigen Soundpunkten.

Sicherheitsregel: Nur Dashboard-/Testevents werden beendet. Produktive aktive Events bleiben unverändert.

Neue interne Helfer:

- `isDashboardEventTest(event)`
- `finishActiveDashboardTestEvents(options)`

`points-check` gibt zusätzlich `event`, `preCleanup` und `activeEvent` zurück.

## EVS50.6 – Punktecheck-Historie direkt aus dem Test-Tab

Der Dashboard-Testbereich zeigt nach einem erfolgreichen `points-check` jetzt direkt eine Aktion **Punkte-Historie dieses Tests öffnen**. Der Button öffnet die bestehende User-Statistik für den im Test verwendeten User und für exakt die `eventUid` des Punktecheck-Testevents.

Wichtig: Das echte aktive Event im Tab **Aktuelles Event** wird dadurch nicht ersetzt und nicht beendet. Der Button ist nur ein gezielter Einstieg in die Historie des letzten Punktecheck-Testlaufs.

Geändert:

- Dashboard-Version `0.5.48` / `STEP_EVS50_6_POINTS_CHECK_DETAIL_BUTTON`
- Keine Änderung an Backend-Punktelogik
- Keine Änderung an produktiver Event-Auswahl
- Keine Änderung am DB-Schema

Testablauf:

1. `Event-System → Test`
2. `Punkte-Check Sound + Satz`
3. Ergebnis muss Sound + Satz addiert anzeigen.
4. `Punkte-Historie dieses Tests öffnen`
5. Popup muss den Punktecheck-Lauf zeigen, auch wenn parallel ein echtes Event aktiv ist.

## EVS51.1 – Satz-System Testbereich

Der Dashboard-Testbereich wurde um gezielte Satz-/Text-Tests erweitert.

Neue Backend-Teststeps über:

```text
POST /api/stream-events/test/run?confirm=1&step=text-check
POST /api/stream-events/test/run?confirm=1&step=text-create
POST /api/stream-events/test/run?confirm=1&step=text-wrong
POST /api/stream-events/test/run?confirm=1&step=text-word
POST /api/stream-events/test/run?confirm=1&step=text-correct
POST /api/stream-events/test/run?confirm=1&step=text-duplicate
POST /api/stream-events/test/run?confirm=1&step=text-report
```

`text-check` führt einen kompletten kontrollierten Satz-Testlauf aus:

1. altes aktives Dashboard-Testevent sicher beenden
2. neues kombiniertes Testevent `EVS SATZ CHECK` erstellen
3. falsche Antworten senden
4. Worttreffer senden
5. Satz 1 lösen
6. doppelte Lösung für Satz 1 testen
7. Satz 2 lösen
8. doppelte Lösung für Satz 2 testen
9. prüfen, ob der Text-Teil abgeschlossen ist
10. prüfen, ob das Gesamt-Event nach Text noch offen bleibt, solange Sound offen ist
11. Sound lösen
12. prüfen, ob das Gesamt-Event danach fertig ist

Wichtig:

- Die Teststeps arbeiten mit der konkreten `eventUid` des Testevents.
- Produktive aktive Events werden nicht beendet.
- `text-runtime/test-chat` akzeptiert jetzt ebenfalls `eventUid`, damit Tests nicht versehentlich auf das falsche aktive Event laufen.
- `wrong` und `correct` im Dashboard-Testsystem wurden korrigiert, damit sie nicht mehr blind das aktive Event verwenden, sondern das Testevent.

Dashboard:

```text
Event-System → Test → Satz-System gezielt testen
```

Neue Buttons:

- Satz-Check komplett
- Satz-Testevent erstellen
- Satz-Report
- Falsche Satzantwort
- Worttreffer
- Richtige Satzantworten
- Doppelte Lösung

Der Testbereich zeigt eine Satz-System-Prüfung mit Statuskarten, Satzlösungen, Worttreffern, Ranking und direkten User-Historie-Buttons.

Versionen:

- Backend `0.5.67 / STEP_EVS51_1_TEXT_RUNTIME_TEST_CHECK`
- Dashboard `0.5.49 / STEP_EVS51_1_TEXT_RUNTIME_TEST_CHECK`


## EVS51.2 – Satz-Check Wrong-Fix

Der komplette Satz-System-Test (`step=text-check`) nutzte in einer falschen Testnachricht versehentlich das Wort `ich`. Da `ich` Bestandteil von Satz 2 ist, wurden korrekt Wortpunkte vergeben und der Check `wrongNoPoints` schlug fehl.

Korrigiert: Die falsche Testnachricht enthält jetzt keine Wörter aus den konfigurierten Testsätzen.

Backend: `0.5.68 / STEP_EVS51_2_TEXT_CHECK_WRONG_FIX`

## EVS51.3 – Satz-Testbereich UI-Cleanup

Der Dashboard-Testbereich für das Satz-/Text-System wurde lesbarer gemacht.

Bereich:

```text
Event-System → Test → Satz-System gezielt testen
```

Nach dem Button `Satz-Check komplett` zeigt das Dashboard keine normale Rohdatenwüste mehr, sondern eine strukturierte Prüfung:

- falsche Antwort ohne Punkte
- Worttreffer geschrieben
- Satzlösungen geschrieben
- doppelte Lösung blockiert
- Text-Teil abgeschlossen
- Gesamt-Event bleibt nach Text offen, solange Sound noch offen ist
- Sound-Abschluss
- Gesamt-Abschluss / Event-Finish

Zusätzlich werden angezeigt:

- gelöste Sätze
- Worttreffer
- Ranking
- User-Historie-Buttons
- klickbare Ranking-Zeilen für die Punkte-Historie des Testevents

Die produktive Punktelogik wurde in EVS51.3 nicht verändert. Backend bleibt auf EVS51.2 / 0.5.68.

## EVS51.4 – Satz-System Einzeltest-/Runtime-Flow

- Dashboard-Testbereich für Satz-System-Einzeltests erweitert.
- Einzelbuttons nutzen jetzt das zuletzt erzeugte Satz-Testevent gezielt weiter, statt versehentlich ein anderes aktives Event zu verwenden.
- Neuer Einzelbutton: `Sound lösen / Abschluss` (`text-sound`) prüft nach gelösten Sätzen den Sound-/Gesamtabschluss.
- Die Satz-Testanzeige unterscheidet Komplettcheck und Einzeltest klarer:
  - aktuelles Satz-Testevent
  - letzter Schritt
  - Worttreffer
  - Satzlösungen
  - Text-/Sound-/Gesamtstatus
  - Event-Finish
  - Ranking und User-Historie
- Produktive Events bleiben unverändert geschützt; Testevents dürfen das echte aktive Event nicht verdrängen.


## EVS51.5 – Text-Antwortvarianten optional

Beim Satz-/Text-Spiel sind Antwortvarianten optional. Der Satz/Geheimsatz selbst ist automatisch eine gültige Lösung.

Regel:

- Satztext vorhanden = gültige Lösung vorhanden.
- `acceptedAnswers` leer = OK, keine Warnung, keine Blockade.
- `acceptedAnswers` kann zusätzliche Schreibweisen oder Kurzformen enthalten.

Die vorherige Warnung `text.phrase.X.answers_empty_uses_phrase` wurde aus Backend- und Dashboard-Validation entfernt.


## EVS51.6 – Sound-Automatik beim Eventstart

- Beim Start eines aktiven Events mit aktiviertem Sound-Spiel wird automatisch der erste Sound-Timer geplant.
- `startEvent()` liefert jetzt `soundAutoPlan` zurück.
- Falls ein Event bereits aktiv ist, versucht der Start-Endpunkt ebenfalls sicher eine fehlende Auto-Planung nachzuholen.
- Der Sound-Runtime-Status kann eine fehlende Planung für ein laufendes Sound-Event sicher nachziehen, sofern keine aktive Runde, kein Timer und kein Offline-/Pause-Zustand existiert.
- Punkte, Satz-System, Sound-Playback, Reveal-Video und Abschlusslogik bleiben unverändert.


## EVS52.1 – Runtime-Overlay Satzstatus

- `backend/modules/stream_events.js` erweitert den Read-only-State von `/api/stream-events/runtime-overlay/state` um einen sicheren `text`-Block.
- Der Text-Block enthält nur overlay-sichere Statusdaten: aktiviert, Status, Gesamtzahl, gelöst, offen, Worttreffer und letzte Satzlösungen.
- AcceptedAnswers und vollständige Satztexte werden nicht an das Overlay ausgegeben.
- Bei laufenden kombinierten Sound+Text-Events zeigt das Runtime-Overlay zwischen Soundrunden eine kleine Satzstatus-Karte.
- Sound-Countdown, Sound-Antwortfenster und Sound-Ergebnis bleiben weiterhin vorrangig.

## EVS52.3 – Satzlösung-Celebration-Overlay

Bei einer vollständigen Satzlösung zeigt das Runtime-Overlay jetzt eine kurze Celebration-Karte für 15 Sekunden. Die Karte enthält User/Fallback-Avatar, Satznummer, gelösten Satz und Punkte. Worttreffer lösen bewusst kein Overlay aus.

Der Overlay-Text wird über das vorhandene Textsystem gerendert. Neuer Text-Key:

```text
text.phrase.solved.overlay
```

Enthalten sind fünf Fallback-Varianten im CGN-/Altersheim-/Rentner-Stil. Über den bestehenden Event-System-Texte-Bereich können Varianten später bearbeitet, deaktiviert oder ergänzt werden. Der dauerhafte Satzstatus bleibt vorbereitet, aber nicht sichtbar.


## EVS52.4 – Satz-Spiel Chat-Ausgaben

Satz-Spiel-Ausgaben sind aktiv in das vorhandene Text-/Chat-System eingebunden.

### Textkeys

- `text.word_hit.chat` – eine Chatmeldung bei neuen Worttreffern.
- `text.phrase.solved` – Chatmeldung bei vollständiger Satzlösung.
- `text.phrase.duplicate.chat` – Chatmeldung bei bereits gelöstem Satz ohne Punkte.
- `text.phrase.solved.overlay` – 15s Celebration-Overlay bei vollständiger Satzlösung.

Alle Keys haben 5 Fallback-Varianten im CGN-/Altersheim-/Rentner-Stil und werden über `helper_texts`/Dashboard-Texteditor gepflegt.

### Live-Senden

Live-Ausgabe nutzt `helper_chat_output`. Gesendet wird nur bei echten Twitch-Chat-Bus-Events (`bus:twitch.chat.message`) und aktivem Runtime-Gate. Dashboard-/Backend-Tests bereiten Outputs vor, senden aber nicht live in Twitch.

### Spam-Schutz

- Worttreffer senden nur bei neuen Wörtern.
- Pro Chatnachricht wird pro Satz nur eine Worttreffer-Meldung gesendet.
- `text.word_points.added` bleibt als vorhandener Textkey erhalten, wird aber nicht zusätzlich live pro Worttreffer gesendet.
- Doppelte Satzlösung gibt keine Punkte und kein Overlay.

## EVS52.5 – Satz-System echter Chat-Flow / Alias-Fix

- `getTextRuntimeConfig()` akzeptiert jetzt die UI-/Dashboard-Felder `hintTokensEnabled`, `showPartialCount` und `uniqueWordsPerUser` als Aliase fuer die interne Text-Runtime.
- Dadurch werden Teiltreffer auch bei echten Events erkannt, wenn im Dashboard „Teiltreffer anzeigen“ aktiv ist, aber `wordPointsEnabled=false` gesetzt wurde.
- Worttreffer werden weiterhin in `stream_events_text_word_hits` gespeichert. Punkte werden nur vergeben, wenn Wortpunkte aktiv sind.
- Satzloesungen bleiben unveraendert: komplette Loesung gibt die konfigurierten Satzpunkte und erzeugt Satzloesungs-ChatOutput + Celebration-Overlay.
- Duplicate-Loesungen bleiben ohne Punkte und ohne Overlay, erzeugen aber eine vorbereitete Chatmeldung.
- Runtime-Gate-Status zeigt jetzt korrekt `chatOutputLiveSend=true`, wenn ein echtes aktives Event bei Online-Stream ausgewertet werden darf.
- Neue Diagnose-Route: `GET /api/stream-events/text-runtime/live-debug`.
- Neuer Teststep: `POST /api/stream-events/test/run?confirm=1&step=text-live-flow-check`.
- Neues lokales Testscript: `tools/tests/EVS52_5_TEXT_LIVE_FLOW_CHECK.ps1`.

### Testziel EVS52.5

Der Test prueft bewusst ein Event mit Dashboard-Alias-Feldern und `wordPointsEnabled=false`:

- Teilwort `Test` wird als Worttreffer erkannt.
- Worttreffer erzeugt eine ChatOutput-Vorbereitung.
- Worttreffer gibt keine Punkte, wenn Wortpunkte deaktiviert sind.
- Kompletter Satz gibt Satzpunkte.
- Doppelte Satzloesung gibt keine Punkte.
- Ranking zaehlt nur die Satzpunkte.

## EVS52.6 – Live-Chat Direct-Bridge für Satz-System

Da echte Sound-Antworten bereits über den Chat funktionieren, aber Satz-/Text-Treffer nicht sichtbar verarbeitet wurden, wurde ein zusätzlicher sicherer Direct-Bridge-Fallback eingebaut.

Der normale Weg bleibt der Communication-Bus `twitch.chat/message`. Falls dieser Pfad eine konkrete IRC-/Twitch-Chatnachricht nicht an `stream_events` liefert, greift `stream_events` direkt nach `twitch_events.handleIrcEvent()` ein und führt dieselbe parallele Sound+Text-Runtime aus.

Regeln:

- Sound-Auswertung bleibt unverändert.
- Text/Satz-Auswertung läuft zusätzlich.
- Direct-Bridge verarbeitet nur `PRIVMSG`.
- Wenn der Bus-Pfad bereits verarbeitet hat, wird die Direct-Bridge übersprungen.
- Live-Ausgabe über `helper_chat_output` gibt es nur bei echter Chatquelle und aktivem Runtime-Gate.
- Dashboard-/Backend-Tests senden nicht live.

Neue Diagnose im Live-Debug:

- `directChatBridge.installed`
- `directChatBridge.delivered`
- `directChatBridge.lastReason`
- `lastTextChatRuntime.source`

## EVS52.7 – Twitch-Presence Direct Bridge

Echte Twitch-IRC-PRIVMSG-Nachrichten werden nach dem bestehenden `twitch_events.handleIrcEvent()` zusätzlich an `stream_events.handleTwitchPresenceIrcChat()` übergeben. Dadurch nutzt das Satz-/Text-System dieselbe echte Chatquelle wie das Sound-Spiel. Die Verarbeitung läuft weiter über `processParallelChatMessage()`, damit Sound und Text parallel ausgewertet werden.

Doppelte Verarbeitung wird durch Vergleich mit `lastTextChatRuntime` vermieden, falls der Bus-Pfad die Nachricht bereits verarbeitet hat.

## EVS52.8 – Twitch-Chat Bus-Fallback fuer Satz-System

EVS52.8 ergänzt im Backend `stream_events` einen Wildcard-Bus-Fallback fuer Twitch-Chatnachrichten. Grund: EVS52.7 zeigte, dass der RuntimeGate aktiv war und `chatOutputLiveSend=true`, aber die `twitch_presence` Direct-Bridge nicht von echten Chatmessages erreicht wurde. Da das Sound-Spiel über den Twitch-Events-/Communication-Bus arbeitet, wird nun zusätzlich ein breit gefasster Subscriber registriert, der nur `twitch.chat.message` intern filtert.

Schutz:

- Der spezifische Subscriber bleibt erhalten.
- Der Fallback verarbeitet nur `twitch.chat.message`.
- Wenn die Nachricht bereits durch den primären Pfad verarbeitet wurde, wird sie übersprungen.
- Dashboard-Tests bleiben dry-run.
- Live-Send bleibt an RuntimeGate + echte Chatquelle gebunden.

Diagnose:

```text
GET /api/stream-events/text-runtime/live-debug
```

enthält nun zusätzlich:

```text
twitchChatBusFallback
```

Testscript:

```text
tools/tests/EVS52_8_TWITCH_CHAT_BUS_FALLBACK_CHECK.ps1
```


## EVS52.9 – Chatquelle / Sound + Satz vereinheitlichen (Doku-Handoff)

### Status

EVS52.9 ist ein Doku-/Handoff-Stand ohne Codeänderung.

Die Diagnose aus `/api/communication/status` und `/api/twitch/events/status` zeigt:

- `stream_events` ist am Communication-Bus registriert und deklariert `consumes:twitch.chat.message`.
- `twitch_events` kennt `twitch.chat.message` und Event-Catalog definiert `channel=twitch.chat`, `action=message`.
- Der spezifische Subscriber `stream_events:twitch.chat.message` hatte im Diagnosezeitraum `delivered=0`.
- Andere spezifische Chat-Subscriber wie `commands`, `clip_shoutout` und `loyalty_giveaways` hatten ebenfalls `delivered=0`.
- `twitch_events.eventSubChat` war aktiv, aber `notifications=0` und `chatMessagesEmitted=0`.
- EVS52.8 Wildcard-Bus-Fallback erhielt Deliveries, aber diese waren allgemeine Bus-Events und kein Beweis für echte Chatmessages.

### Entscheidung

Der nächste Code-Step darf nicht weiter Hooks stapeln. Es muss zuerst die echte produktive Chatquelle gefunden werden, über die das Sound-Spiel aktuell Chatantworten erhält.

Ziel ist eine zentrale normalisierte Chat-Verarbeitung für beide Teilspiele:

```text
Twitch-Chat normalisiert
→ Dedupe
→ RuntimeGate
→ Sound-Auswertung
→ Satz-/Text-Auswertung
→ gemeinsame Punktewertung
```

### Zu bereinigen nach erfolgreichem Fix

EVS52.6–EVS52.8 haben Diagnose-/Fallback-Pfade ergänzt:

- Direct-Bridge über `twitch_events.handleIrcEvent`
- Direct-Bridge über `twitch_presence`
- Wildcard-Bus-Fallback

Diese Pfade müssen nach der echten Lösung geprüft und nicht benötigte Altlasten gezielt entfernt/deaktiviert werden.

### Nicht ändern ohne Freigabe

- Sound-Punkte
- Satz-Punkte
- Ranking
- User-Historie
- Sound-Playback
- Sound-Automatik
- Dashboard-Tests
- Produktive SQLite

---

## Stand EVS52.9 – Chatquelle ueber twitch_events / Communication Bus

Stand: 2026-06-18

### Entscheidung

Sound- und Satz-/Text-Teilspiel verwenden ab EVS52.9 dieselbe zentrale Chatquelle:

```text
twitch_presence IRC PRIVMSG
→ twitch_events.handleIrcEvent()
→ twitch_events publishTwitchEvent("twitch.chat.message")
→ communication_bus channel=twitch.chat action=message
→ stream_events Subscriber stream_events:twitch.chat.message
→ processParallelChatMessage()
→ processSoundChatMessage() + processTextChatMessage()
```

### Aufgeraeumt

Entfernt/deaktiviert aus dem Runtime-Pfad:

- EVS52.6 Direct-Bridge-Patch auf `twitch_events.handleIrcEvent`.
- EVS52.7 Direktaufruf aus `twitch_presence` nach `stream_events.handleTwitchPresenceIrcChat`.
- EVS52.8 Wildcard-Bus-Fallback `stream_events:twitch.chat.message.fallback`.

### Beibehalten

- Sound-Auswertung bleibt in `processSoundChatMessage()`.
- Satz-/Text-Auswertung bleibt in `processTextChatMessage()`.
- Gemeinsame Sound+Text-Verarbeitung bleibt in `processParallelChatMessage()`.
- Live-Chat-Ausgaben laufen nur bei Runtime-Gate aktiv ueber `dispatchRuntimeChatOutputs()`.
- Dashboard-/Backend-Testpfade bleiben Testpfade und werden nicht als Live-Twitch-Quelle behandelt.

### Statusfelder

`GET /api/stream-events/status` enthaelt unter `runtime.chatSource` den aktuellen zentralen Chatquellenstatus.

Wichtige Felder:

```text
mode=twitch_events_bus_subscription
subscribed=true/false
delivered/skipped/errors
lastEventKey
lastLogin
lastReason
legacyDirectBridgeRemoved=true
legacyWildcardFallbackRemoved=true
```

### Modulversion

```text
stream_events 0.5.80 / STEP_EVS52_9_TWITCH_EVENTS_CHAT_SUBSCRIBER
```
