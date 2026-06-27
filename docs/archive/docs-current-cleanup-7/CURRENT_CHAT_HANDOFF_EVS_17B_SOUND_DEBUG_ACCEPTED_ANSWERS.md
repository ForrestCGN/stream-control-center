# CURRENT CHAT HANDOFF – EVS-17b Sound Debug Accepted Answers

Stand: 2026-06-13

## Projekt

`stream-control-center` / Modul `stream_events` / Event-System.

Repo/Branch:

```text
ForrestCGN/stream-control-center
branch: dev
lokal: D:\Git\stream-control-center
live:  D:\Streaming\stramAssets
```

## Nutzerregeln

- Deutsch antworten.
- Schrittweise arbeiten.
- Erst erklären/planen, dann auf ausdrückliches `go` umsetzen.
- Keine Funktionalität entfernen.
- Vor jeder Änderung echte aktuelle Dateien/Repo/ZIP als Source of Truth verwenden.
- Keine parallelen Systeme erfinden.
- Vor Live-/Systemtest immer StepDone.
- ZIPs mit echten Zielpfaden bauen.
- Keine Patch-/Apply-Scripte liefern.

## Aktueller Stand

Letzter getesteter Step:

```text
EVS-17b – Sound Debug Accepted Answers
MODULE_VERSION = 0.5.4
MODULE_BUILD = STEP_EVS_17B_SOUND_DEBUG_ACCEPTED_ANSWERS
```

Dateien zuletzt betroffen:

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
docs/modules/stream_events.md
project-state/*
```

## Was funktioniert

### EventBus / Modulstatus

- `stream_events` registriert sich auf dem bestehenden CommunicationBus.
- Heartbeat läuft.
- `/api/stream-events/bus-status` funktioniert.

### Text-Spiel

- Testevents funktionieren.
- Text-Chat-Runtime funktioniert.
- Worttreffer pro Event/Satz/User/Wort nur einmal.
- Wortpunkte werden gebucht.
- Satzlösungen werden erkannt.
- Textvarianten erzeugen vorbereitete ChatOutputs.
- Keine direkte Twitch-Ausgabe.

### Statistik / Dashboard

- Statistik-Tab hat Untertabs.
- Texte-Tab hat Bereichs-Dropdown.
- User-Statistik und User-Detailmodal mit AutoReload sind vorbereitet.

### Sound-Spiel

- Sound-Testevent funktioniert.
- Sound-Runden werden vorbereitet.
- `next-round`, `resolve`, `unresolved`, `test-chat` funktionieren.
- Richtige Soundantwort löst Runde.
- Falsche Antwort wird abgelehnt und erzeugt keine Chatmeldung.
- Punkte werden gebucht.
- ChatOutput wird vorbereitet.
- Kein echtes Playback.
- Sound-System-Queue wird nicht berührt.

### EVS-17b Debug

Sound-Report zeigt im API-/Dashboard-Test akzeptierte Antworten:

```text
soundDebug.acceptedAnswersByRound[]
acceptedAnswersDebug.acceptedAnswersText
```

Getestete Beispiele:

```text
test_sound_2:
engel disco | rentner disco | engel rentner disco

test_sound_1:
forrest heimleitung | heimleitung | forrest hymn | forrest hymne
```

Wichtig: Diese Debug-Antworten sind nur für Dashboard/API-Test, nicht für Overlay oder Twitch-Chat.

## Aktuelle Testbefehle

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/status
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/sound-runtime/status
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/sound-runtime/report
```

Debug lesbar machen:

```powershell
$r = Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/sound-runtime/report
$r.soundDebug.acceptedAnswersByRound | Format-List *
```

## Nächster empfohlener Step

EVS-18 – Sound Twitch Chat Answer Runtime

Ziel:

- Echte `twitch.chat.message` Bus-Events für aktive Sound-Runden auswerten.
- Bestehende `sound-runtime/test-chat`-Logik als Basis verwenden.
- Bei richtiger Antwort aktive Soundrunde lösen und Punkte buchen.
- ChatOutput vorbereiten.
- Falsche Antworten nicht in Chat ausgeben.
- Kein direktes Playback.
- Keine Sound-System-Queue-Berührung.
- Keine direkte Twitch-Chat-Ausgabe.

## Wichtige Vorsicht

- Text-Runtime nutzt ebenfalls Twitch-Chat. EVS-18 muss darauf achten, dass Sound- und Text-Runtime sich nicht unkontrolliert gegenseitig stören.
- Bei kombinierten Events später klare Priorität/Mode nötig.
- Erst prepared-only weiterführen, keine produktive Ausgabe.
