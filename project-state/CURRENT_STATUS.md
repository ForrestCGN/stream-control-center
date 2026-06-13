# CURRENT_STATUS – stream_events / Event-System

Stand: 2026-06-13 nach EVS-21b – Event Archive/Delete Completion Documentation

## Aktueller bestätigter Stand

```text
MODULE_VERSION: 0.5.13
MODULE_BUILD: STEP_EVS_21_EVENT_ARCHIVE_DELETE_PREP
```

## Erfolgreich bestätigt

- Backend Foundation `stream_events`.
- Dashboard-Grundstruktur.
- EventBus/Heartbeat über vorhandenen CommunicationBus.
- Text-Chat-Runtime.
- Sound-Runtime.
- Sound-Testchat-Antwortauswertung.
- Echte Twitch-Chatnachrichten über `twitch.chat.message` für Soundantworten.
- Sound/Text Parallel-UND-Regel: eine Nachricht wird an beide Spiele gegeben.
- Eine Nachricht kann Sound und Text gleichzeitig lösen.
- Punkte werden getrennt gebucht und im gemeinsamen Ranking addiert.
- ChatOutputs werden vorbereitet und bleiben `directSend=false`.
- Sound-Playback bleibt `directPlay=false`.
- Sound-System-Queue wird nicht berührt.
- Alte Eventwerte bleiben `eventUid`-gebunden; alte Testevents werden archiviert/finished, nicht blind gelöscht.
- EVS-20 ChatOutput-Status/Report wurde geprüft: `preparedOutputs=4`, `wouldSend=0`, `blocked=4`, alle Sicherheitsblocker aktiv.
- EVS-21 Archivieren/Löschen wurde vollständig getestet.

## EVS-20 hinzugefügt

- ChatOutput Dispatcher Prep.
- Sicherheitsstatus für vorbereitete ChatOutputs.
- Dry-Run-Routen:
  - `GET /api/stream-events/chat-output/status`
  - `GET /api/stream-events/chat-output/report`
  - `POST /api/stream-events/chat-output/test-dispatch`
- Blocker-Auswertung, warum ein Output nicht live gesendet würde.

### Event Lifecycle / Archiv / Löschen

- Alte Events können gezielt archiviert oder gelöscht werden.
- Archivieren ist nur für vollständig beendete Events erlaubt (`status=finished`).
- Aktive/ready/draft/cancelled Events werden nicht archiviert.
- Löschen ist statusunabhängig möglich, aber nur mit expliziter Bestätigung `confirm=DELETE`.
- Hard-Delete entfernt Event plus zugehörige `eventUid`-Daten: Ranking-/Score-Einträge, Runden, Text-Worttreffer und Text-Satzlösungen.
- Archivierte Events behalten ihre Werte für spätere Auswertung.
- `/api/stream-events/events` liefert die Liste unter `rows`.
- Delete-Bestätigung erfolgt per JSON-Body `{ "confirm": "DELETE" }`, nicht per Query.

## Weiterhin bewusst NICHT produktiv aktiv

- Keine direkte Twitch-Chat-Ausgabe.
- Kein direktes Sound-Playback.
- Keine direkte Sound-System-Queue-Berührung.
- Kein Overlay-Livebetrieb.
- Kein Live-Send-Button.
- Keine echte Soundausgabe über Media-/Sound-System.

## Wichtige Projektregeln

- Keine Funktionalität entfernen.
- Immer echte aktuelle Dateien/Repo/ZIP als Source of Truth nutzen.
- Keine Parallelstrukturen bauen, vorhandene Helper/Systeme verwenden.
- EventBus/CommunicationBus verwenden, keinen neuen Bus bauen.
- Media-/Sound-System verwenden, keinen zweiten Player bauen.
- Textvarianten über vorhandene `helper_texts` / DB-Struktur nutzen.
- Dashboard streamer-/modfreundlich halten.
- StepDone vor Live-/Systemtest.
