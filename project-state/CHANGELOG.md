# CHANGELOG – stream_events / Event-System

Stand: 2026-06-13 nach EVS-19


## EVS-19 – Sound/Text Parallel AND Runtime

- `MODULE_VERSION` auf `0.5.6` erhöht.
- `MODULE_BUILD` auf `STEP_EVS_19_SOUND_TEXT_PARALLEL_AND_RUNTIME` gesetzt.
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
- Keine Modulversionserhöhung gegenüber EVS-18.

## EVS-18 – Sound Twitch Chat Answer Runtime

- Echte `twitch.chat.message` Bus-Events für aktive Sound-Runden ausgewertet.
- Sound- und Text-Dispatcher koexistenzsicher vorbereitet.
- Richtige Soundantwort löst aktive Soundrunde.
- Falsche Soundantwort erzeugt keine Chat-Ausgabe.
- Punkte werden in das gemeinsame Ranking gebucht.
- `sound.solved` ChatOutput bleibt prepared-only mit `directSend=false`.
- Kein direktes Sound-Playback.
- Keine Sound-System-Queue-Berührung.

Bestätigter Test:

```text
moduleVersion=0.5.5
moduleBuild=STEP_EVS_18_SOUND_TWITCH_CHAT_ANSWER_RUNTIME
soundChatMessagesProcessed=2
soundAnswerMisses=1
soundAnswerMatches=1
active=0
solved=4
soundScoreEntries=4
chatOutputs=4
playbackPayloads=0
directSend=False
```

## EVS-17b – Sound Debug Accepted Answers

- Akzeptierte Sound-Antworten im API-/Dashboard-Test sichtbar gemacht.
- `soundDebug.acceptedAnswersByRound` im Sound-Report ergänzt.
- Debugausgabe ist ausdrücklich nur für Dashboard/API-Test gedacht.
- Keine Ausgabe im Overlay oder Twitch-Chat.
- Keine DB-Änderung.
- Keine Runtime-Änderung am Playback.
- Keine Sound-System-Queue-Berührung.

Bestätigter Test:

```text
acceptedAnswersText sichtbar für test_sound_1 und test_sound_2
```

## EVS-17 – Sound Chat Answer Prep

- `POST /api/stream-events/sound-runtime/test-chat` ergänzt.
- Aktive Sound-Runde kann per Chat-Testantwort gelöst werden.
- Falsche Antwort wird abgelehnt, ohne ChatOutput zu erzeugen.
- Richtige Antwort bucht Punkte und erzeugt `sound.solved` ChatOutput.

## EVS-16c – Texte Tab Module Filter Cleanup

- Texte-Tab um Bereichs-Dropdown erweitert.
- Suche nach Key/Text vorbereitet.
- Keine Backend-/DB-/Runtime-Änderung.

## EVS-16b – Statistik Tab Layout Cleanup

- Statistik-Buttonreihe durch Untertabs ersetzt.
- Bereiche: Übersicht, Ranking, Text-Spiel, Sound-Spiel, User.
- Kein Seitenreload, nur Bereichsaktualisierung.

## EVS-16 – Sound Runtime Dashboard Report

- Sound-Report im Dashboard vorbereitet.
- Sound-Runden, Punkte, Ranking, ChatOutputs und PlaybackPayloads sichtbar.

## EVS-15 – Sound Runtime Test Helpers

- Sound-Testevent mit Test-Snippets ergänzt.
- Testflow für `next-round`, `resolve`, `report`.

## EVS-14 – Sound Runtime Prep

- Sound-Runden vorbereitet.
- Resolve/Unresolved vorbereitet.
- Playback-Payload nur prepared-only.

## EVS-10 bis EVS-13b

- Text-Runtime, Text-Testhelper, Text-ChatOutputs, Text-Dashboard-Report, User-Statistik und User-Detailmodal aufgebaut.

## EVS-1 bis EVS-9

- Planung, Backend Foundation, Dashboard-Grundstruktur, MediaPicker, Text-/Sound-Konfiguration, Config, Textvarianten, EventBus/Heartbeat aufgebaut.
