# CHANGELOG – stream_events / Event-System

Stand: 2026-06-13 nach EVS-19e

## EVS-19e – Text Options Regression Fix / Parallel AND bestätigt

- `MODULE_VERSION` auf `0.5.11` erhöht.
- `MODULE_BUILD` auf `STEP_EVS_19E_TEXT_OPTIONS_REGRESSION_FIX` gesetzt.
- Regression repariert: `processTextChatMessage(...)` nutzt wieder `options.eventUid`.
- `processParallelChatMessage(...)` nutzt weiterhin die korrekte Context-/EventUid-Logik.
- Finaler UND-Test bestätigt:
  - eine Nachricht wurde an Sound und Text gegeben.
  - Sound wurde gelöst.
  - Text wurde gelöst.
  - beide Punktebuchungen wurden erzeugt.
  - zwei ChatOutputs wurden nur vorbereitet.
  - `directSend=false`, `directPlayback=false`, `soundSystemQueueTouched=false`.

Bestätigter Test:

```text
Event: evs_event_mqcbpyjc_bf53fece7d25
Nachricht: die heimleitung sucht den schluessel
soundSolved=true
textSolved=true
handledBy=sound,text
Soundpunkte=30
Textpunkte=40
chatOutputCount=2
directSend=false
directPlayback=false
soundSystemQueueTouched=false
```

## EVS-19d – Parallel Context EventUid Fix

- `processParallelChatMessage(...)` auf Context-basierte EventUid-Prüfung korrigiert.
- Nachfolgend in EVS-19e eine Text-Regression behoben.

## EVS-19c – Parallel Test Options Fix

- Erster Fixversuch für den `options is not defined` Fehler im Parallel-Testpfad.
- In EVS-19d/19e final korrigiert.

## EVS-19b – Parallel Test Event Activation Fix

- Stealth-Testevent startet standardmäßig, damit neue Tests nicht auf alte aktive Events laufen.
- Alte aktive Test-/Stealth-Events werden als `finished` archiviert, nicht gelöscht.
- `chat-runtime/test-chat` kann optional `eventUid` nutzen.
- `text-runtime/report` repariert; versehentlicher `rounds`-Verweis entfernt.
- Keine direkte Twitch-Ausgabe, kein Playback, keine Sound-System-Queue-Berührung.

## EVS-19a – Stealth Test Event Fix

- Fehler `getTextPhrases is not defined` im neuen Stealth-Testevent-Endpunkt behoben.
- Lokalen Helper `getTextPhrases(event)` ergänzt.
- Keine Änderung an direkter Chat-Ausgabe, Playback oder Sound-System-Queue.
- EVS-19-UND-Regel bleibt aktiv.

## EVS-19 – Sound/Text Parallel AND Runtime

- `MODULE_VERSION` auf `0.5.6` erhöht.
- Neue Parallel-UND-Auswertung ergänzt: eine Chatnachricht wird bei aktivem Kombi-Event an Sound und Text gegeben.
- Soundlösung blockiert Textprüfung nicht mehr.
- Textlösung blockiert Soundprüfung nicht.
- Ergebnisse werden getrennt im Result-Payload geführt und ChatOutputs gesammelt.
- Neue Testroute `POST /api/stream-events/chat-runtime/test-chat` ergänzt.
- Neue Testevent-Route `POST /api/stream-events/chat-runtime/create-stealth-test-event?confirm=1` ergänzt.
- Keine direkte Twitch-Ausgabe aktiviert.
- Kein direktes Sound-Playback aktiviert.
- Keine Sound-System-Queue-Berührung.

## EVS-18c – Event Lifecycle Archive Rules

- Event-Lifecycle-Regeln dokumentiert.
- Festgelegt: Eventwerte bleiben immer an die jeweilige `eventUid` gebunden.
- Neues Event bekommt eigene `eventUid` und eigenes Event-Ranking.
- Alte Werte werden beim Start eines neuen Events nicht automatisch gelöscht.
- Alte Eventdaten sollen archiviert/historisch abrufbar bleiben.
- Hard-Delete nur später als geschützte Owner/Admin-Aktion mit Bestätigung und Audit planen.
- Keine Codeänderung.
- Keine DB-Änderung.

## EVS-18 – Sound Twitch Chat Answer Runtime

- Echte `twitch.chat.message` Bus-Events für aktive Sound-Runden ausgewertet.
- Richtige Soundantwort löst aktive Soundrunde.
- Falsche Soundantwort erzeugt keine Chat-Ausgabe.
- Punkte werden in das gemeinsame Ranking gebucht.
- `sound.solved` ChatOutput bleibt prepared-only mit `directSend=false`.
- Kein direktes Sound-Playback.
- Keine Sound-System-Queue-Berührung.

## EVS-17b – Sound Debug Accepted Answers

- Akzeptierte Sound-Antworten im API-/Dashboard-Test sichtbar gemacht.
- `soundDebug.acceptedAnswersByRound` im Sound-Report ergänzt.
- Debugausgabe ist ausdrücklich nur für Dashboard/API-Test gedacht.
- Keine Ausgabe im Overlay oder Twitch-Chat.

## EVS-1 bis EVS-17

- Planung, Backend Foundation, Dashboard-Grundstruktur, MediaPicker, Text-/Sound-Konfiguration, Config, Textvarianten, EventBus/Heartbeat, Text-Runtime, User-Statistik, Sound-Runtime und Sound-Testhelper aufgebaut.
