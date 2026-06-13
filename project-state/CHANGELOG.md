# CHANGELOG – stream_events / Event-System

Stand: 2026-06-13

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
