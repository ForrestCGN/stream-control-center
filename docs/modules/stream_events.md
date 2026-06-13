# Modul-Doku: stream_events

Stand: 2026-06-13 nach EVS-19b – Parallel Test Event Activation Fix

## Zweck

`stream_events` ist das Event-System im `stream-control-center`. Es verwaltet vorbereitete Stream-Events mit Sound- und/oder Text-Spiel, gemeinsamer Punktewertung, Ranking, Statistik, Dashboard-Konfiguration und späterer Overlay-/Chat-/Playback-Anbindung.

## Architektur-Grundsätze

- Bestehenden `communication_bus` verwenden.
- Keine zweite Bus-Struktur bauen.
- Bestehendes `sound_system` verwenden, keinen zweiten Player bauen.
- Bestehende Media-Komponenten verwenden.
- Bestehende Textvarianten-Helfer verwenden.
- SQLite aktuell, aber DB-Logik möglichst portabel halten.
- Keine Funktionalität entfernen.
- Direkte Twitch-Ausgabe und direktes Playback bleiben deaktiviert, bis sie ausdrücklich freigegeben werden.

## Aktueller Modulstand

```text
MODULE_VERSION = 0.5.8
MODULE_BUILD   = STEP_EVS_19B_PARALLEL_TEST_EVENT_ACTIVATION_FIX
```

EVS-18c ist ein Doku-/Lifecycle-Regel-Step. Es gibt keine Codeänderung und keine Modulversionserhöhung gegenüber EVS-18.

## Dashboard

Dashboard-Dateien:

```text
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

Hauptbereiche:

```text
Übersicht
Events
Texte
Config
Statistik
Overlay
```

Statistik-Unterbereiche:

```text
Übersicht
Ranking
Text-Spiel
Sound-Spiel
User
```

Texte-Tab:

- Bereichs-/Modul-Dropdown
- Suche nach Key/Text
- Textvarianten bleiben editierbar

User-Statistik:

- Dropdown/Userliste
- User-Detail-Popup
- Scrollbarer Inhalt
- AutoReload ohne Seitenreload

## Backend-Routen

### Basis

```text
GET  /api/stream-events/status
GET  /api/stream-events/routes
GET  /api/stream-events/events
POST /api/stream-events/events
GET  /api/stream-events/events/:eventUid
PUT  /api/stream-events/events/:eventUid
POST /api/stream-events/events/:eventUid/validate
POST /api/stream-events/events/:eventUid/start
POST /api/stream-events/events/:eventUid/finish
POST /api/stream-events/events/:eventUid/cancel
GET  /api/stream-events/events/:eventUid/ranking
POST /api/stream-events/events/:eventUid/points
```

### Config / Texte

```text
GET  /api/stream-events/config
POST /api/stream-events/config
GET  /api/stream-events/texts
```

### Bus

```text
GET /api/stream-events/bus-status
```

### Text Runtime

```text
GET  /api/stream-events/text-runtime/status
GET  /api/stream-events/text-runtime/report
POST /api/stream-events/text-runtime/test-chat
POST /api/stream-events/text-runtime/create-test-event?confirm=1
```

### User Statistik

```text
GET /api/stream-events/statistics/users
GET /api/stream-events/statistics/users?eventUid=<eventUid>
GET /api/stream-events/statistics/user/:login
GET /api/stream-events/statistics/user/:login?eventUid=<eventUid>
```

### Sound Runtime

```text
GET  /api/stream-events/sound-runtime/status
GET  /api/stream-events/sound-runtime/report
POST /api/stream-events/sound-runtime/create-test-event?confirm=1
POST /api/stream-events/sound-runtime/next-round
POST /api/stream-events/sound-runtime/resolve
POST /api/stream-events/sound-runtime/unresolved
POST /api/stream-events/sound-runtime/test-chat
```

## Event-Lifecycle / Archiv-Regeln

EVS-18c legt verbindlich fest, wie Eventdaten behandelt werden:

- Jedes Event besitzt eine eigene `eventUid`.
- Punkte, Runden, Sound-Ergebnisse, Text-Worttreffer und Text-Satzlösungen bleiben immer an diese `eventUid` gebunden.
- Ein neues Event startet mit eigener `eventUid` und damit mit leerem Event-Ranking.
- Alte Eventdaten werden beim Start eines neuen Events nicht automatisch gelöscht.
- Alte Eventdaten gelten nach `finish` oder späterem `archive` als historisch/archiviert.
- Dashboard-Ansichten sollen standardmäßig das aktive Event anzeigen und alte Werte nicht in aktive Reports mischen.
- Historische Eventdaten sollen später über Archiv-/History-Ansichten abrufbar bleiben.
- Hard-Delete darf später nur als geschützte Owner/Admin-Aktion mit Bestätigung und Audit-Log umgesetzt werden.

Aktuell vorhandene eventbezogene Datenbereiche:

```text
stream_events_events.event_uid
stream_events_score_entries.event_uid
stream_events_rounds.event_uid
stream_events_text_word_hits.event_uid
stream_events_text_phrase_solves.event_uid
```

Wenn ein Event später gelöscht wird, muss das Löschen konsistent über alle zugehörigen Datenbereiche laufen. Bis dahin gilt: lieber archivieren als löschen.

## Text-Spiel Fachregeln

- Ein Event kann mehrere Geheimsätze enthalten.
- Jeder Satz wird unabhängig gelöst.
- Pro Satz gewinnt der erste komplette Löser.
- Nach Lösung wird der Satz für das Event als gelöst markiert.
- Worttreffer werden pro Event/Satz/User/Wort nur einmal gespeichert.
- Wortpunkte sind optional.
- ChatOutputs werden vorbereitet, aber nicht direkt gesendet.

## Sound-Spiel Fachregeln

- Ein Event kann mehrere Sound-Snippets enthalten.
- Eine aktive Sound-Runde bezieht sich auf ein Snippet.
- Richtige Antwort löst die aktive Runde.
- Falsche Antworten erzeugen keine Chat-Ausgabe.
- Punkte werden über das gemeinsame Ranking gebucht.
- Gelöste Runden werden gespeichert.
- Unresolved-Policy ist vorbereitet.
- Playback-Payload wird vorbereitet, aber nicht direkt ausgeführt.
- Debug-Antworten sind nur API-/Dashboard-Testdaten.
- Echte `twitch.chat.message` Bus-Events können aktive Sound-Runden lösen.
- Sound- und Text-Runtime dürfen sich bei Kombi-Events nicht gegenseitig blockieren.

## Debug Accepted Answers

Der Sound-Report liefert im Debug-Kontext:

```text
soundDebug.testOnly = true
soundDebug.visibleFor = dashboard_api_debug_only
soundDebug.acceptedAnswersByRound[]
```

Diese Werte dürfen nicht im Twitch-Chat oder Overlay erscheinen.

## Sicherheit

Aktuell gelten weiterhin:

```text
directSend = false
directPlay = false
soundSystemTouched = false
queueTouched = false
preparedOnly = true
```

## Zuletzt bestätigte Tests

EVS-18 wurde erfolgreich getestet:

```text
MODULE_VERSION = 0.5.8
MODULE_BUILD   = STEP_EVS_19B_PARALLEL_TEST_EVENT_ACTIVATION_FIX
active          = 0
solved          = 4
soundScoreEntries = 4
directSend      = false
playbackPayloads = 0
```

Bestätigte Ranking-Werte aus Testevent:

```text
soundtester: 55 Punkte / 2 Einträge
ForrestCGN: 45 Punkte / 2 Einträge
```

## Nächster technischer Schritt

EVS-19:

```text
Sound/Text Runtime Koexistenz + Stealth-Testevent.
```

Ziele:

- Kombi-Event mit Sound + Text testen.
- Falsche Soundantwort darf Textprüfung nicht blockieren.
- Richtige Soundantwort darf nicht zusätzlich Textpunkte auslösen.
- Dashboard klar anzeigen: prepared-only, keine Live-Ausgabe.
- Keine direkte Twitch-Ausgabe und kein direktes Playback aktivieren.


## EVS-19 – Sound/Text Parallel-UND-Runtime

EVS-19 legt die Kombi-Regel eindeutig fest:

```text
Eine Chatnachricht wird bei aktivem Kombi-Event immer an beide aktiven Spiele gegeben.
Sound blockiert Text nicht.
Text blockiert Sound nicht.
```

Verhalten:

```text
- Wenn Sound aktiv ist, prüft die Sound-Runtime die Nachricht.
- Wenn Text aktiv ist, prüft die Text-Runtime dieselbe Nachricht ebenfalls.
- Soundlösung und Textlösung dürfen beide in derselben Nachricht erkannt werden.
- Punkte werden getrennt über die jeweilige Runtime gebucht und im gemeinsamen Ranking addiert.
- ChatOutputs beider Runtimes werden gesammelt, bleiben aber prepared-only.
- directSend bleibt false.
- directPlay bleibt false.
- soundSystemTouched bleibt false.
- queueTouched bleibt false.
```

Neue/erweiterte Test-Routen:

```text
POST /api/stream-events/chat-runtime/create-stealth-test-event?confirm=1
POST /api/stream-events/chat-runtime/test-chat
```

`chat-runtime/test-chat` nutzt dieselbe Parallel-UND-Auswertung wie echte `twitch.chat.message` Bus-Events, sendet aber nichts in den Twitch-Chat.

Das Stealth-Testevent erstellt ein Kombi-Event mit Sound und Text, bei dem unauffällige Antworten genutzt werden können. Es ist ausschließlich zum Testen gedacht.

## EVS-19 Testregeln

```text
1. Kombi-Stealth-Testevent erstellen und starten.
2. Soundrunde vorbereiten.
3. Eine Nachricht senden, die nur Text trifft.
4. Eine Nachricht senden, die nur Sound trifft.
5. Eine Nachricht senden, die Sound und Text gleichzeitig treffen kann.
6. Report prüfen: Sound/Text-Ergebnisse getrennt, Ranking addiert, active/solved korrekt.
7. directSend/directPlay müssen false bleiben.
```



## EVS-19b – Parallel Test Event Activation Fix

- Der Stealth-Testevent-Helper startet das Kombi-Testevent standardmäßig.
- Falls noch ein altes Test-/Stealth-Event aktiv ist, wird es als `finished` archiviert, nicht gelöscht.
- Produktive/nicht erkannte aktive Events werden nicht automatisch beendet.
- `chat-runtime/test-chat` kann optional `eventUid` entgegennehmen.
- Text-Report wurde von versehentlich eingefügtem Sound-Debug-Code bereinigt.
- UND-Regel bleibt aktiv: eine Nachricht wird bei Kombi-Events gegen Sound und Text geprüft.

## EVS-19a Fix

Der neue Stealth-Testevent-Endpunkt wurde repariert. `getTextPhrases(event)` ist jetzt als lokaler Helper vorhanden, damit `POST /api/stream-events/chat-runtime/create-stealth-test-event?confirm=1` die Textphrasen im Response anzeigen kann. Die EVS-19-UND-Regel bleibt unverändert: Jede Chatnachricht wird bei aktivem Kombi-Event an Sound und Text gegeben.
