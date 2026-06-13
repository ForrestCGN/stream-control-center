# Modul-Doku: stream_events

Stand: 2026-06-13 nach EVS-19e – Sound/Text Parallel AND Runtime bestätigt

## Zweck

`stream_events` ist das Event-System im `stream-control-center`. Es verwaltet vorbereitete Stream-Events mit Sound- und/oder Text-Spiel, gemeinsamer Punktewertung, Ranking, Statistik, Dashboard-Konfiguration und späterer Overlay-/Chat-/Playback-Anbindung.

## Architektur-Grundsätze

- Bestehenden `communication_bus` verwenden.
- Keine zweite Bus-Struktur bauen.
- Bestehendes `sound_system` verwenden, keinen zweiten Player bauen.
- Bestehende Media-Komponenten verwenden.
- Bestehende Textvarianten-Helfer verwenden.
- SQLite aktuell, aber DB-Logik möglichst DB-portabel halten.
- Keine Funktionalität entfernen.
- Direkte Twitch-Ausgabe und direktes Playback bleiben deaktiviert, bis sie ausdrücklich per Config/Dashboard freigegeben werden.

## Aktueller Modulstand

```text
MODULE_VERSION = 0.5.11
MODULE_BUILD   = STEP_EVS_19E_TEXT_OPTIONS_REGRESSION_FIX
```

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

### Config / Texte / Bus

```text
GET  /api/stream-events/config
POST /api/stream-events/config
GET  /api/stream-events/texts
GET  /api/stream-events/bus-status
```

### Text Runtime

```text
GET  /api/stream-events/text-runtime/status
GET  /api/stream-events/text-runtime/report
POST /api/stream-events/text-runtime/test-chat
POST /api/stream-events/text-runtime/create-test-event?confirm=1
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

### Kombi-/Chat Runtime

```text
POST /api/stream-events/chat-runtime/create-stealth-test-event?confirm=1
POST /api/stream-events/chat-runtime/test-chat
```

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

## Event-Lifecycle / Archiv-Regeln

EVS-18c legt verbindlich fest:

- Jedes Event besitzt eine eigene `eventUid`.
- Punkte, Runden, Sound-Ergebnisse, Text-Worttreffer und Text-Satzlösungen bleiben immer an diese `eventUid` gebunden.
- Ein neues Event startet mit eigener `eventUid` und damit mit eigenem Event-Ranking.
- Alte Eventdaten werden beim Start eines neuen Events nicht automatisch gelöscht.
- Alte Test-/Stealth-Events dürfen beim Start eines neuen Stealth-Testevents als `finished` archiviert werden.
- Alte Eventdaten gelten nach `finish` oder späterem `archive` als historisch/archiviert.
- Dashboard-Ansichten sollen standardmäßig das aktive Event anzeigen und alte Werte nicht in aktive Reports mischen.
- Hard-Delete darf später nur als geschützte Owner/Admin-Aktion mit Bestätigung und Audit-Log umgesetzt werden.

Aktuell relevante eventbezogene Datenbereiche:

```text
stream_events_events.event_uid
stream_events_score_entries.event_uid
stream_events_rounds.event_uid
stream_events_text_word_hits.event_uid
stream_events_text_phrase_solves.event_uid
```

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

## Sound/Text Parallel-UND-Regel ab EVS-19e

EVS-19e bestätigt die Kombi-Regel:

- Sound und Text können im selben Event gleichzeitig aktiv sein.
- Eine Chatnachricht wird bei aktivem Kombi-Event an Sound **und** Text gegeben.
- Sound blockiert Text nicht.
- Text blockiert Sound nicht.
- Beide Runtimes dürfen getrennt Punkte buchen, wenn die Nachricht jeweils passt.
- Beide Runtimes dürfen getrennt ChatOutputs vorbereiten.
- ChatOutputs bleiben `directSend=false`.
- Playback bleibt `directPlay=false`.
- Das Sound-System und seine Queue werden nicht berührt.

Bestätigter EVS-19e-Test:

```text
Event: evs_event_mqcbpyjc_bf53fece7d25
Nachricht: die heimleitung sucht den schluessel
soundSolved: true
textSolved: true
handledBy: sound, text
Soundpunkte: 30
Textpunkte: 40
chatOutputCount: 2
directSend: false
directPlayback: false
soundSystemQueueTouched: false
```

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

## Nächster technischer Bereich

EVS-20 soll nicht blind Live-Ausgaben aktivieren, sondern zuerst sauber vorbereiten:

```text
ChatOutput Dispatch Prep / Live-Schalter-Konzept
- vorhandene Chat-/Bot-Ausgabe nutzen
- Config-/Dashboard-Schalter vorbereiten
- Rate-Limit/Spam-Schutz einplanen
- ggf. Sound+Text-ChatOutputs bündeln
- noch keine unkontrollierte Live-Ausgabe
```
