# CHANGELOG – stream_events / Event-System

Stand: 2026-06-13


## EVS-21b – Event Archive/Delete Completion Documentation

- EVS-21 fachlich bestätigt.
- Aktives Event kann nicht archiviert werden (`event_not_finished`).
- Finished Event wurde erfolgreich archiviert; Status wurde `archived`.
- Archivieren erhält zugehörige Werte und schreibt Archiv-Metadaten.
- Delete ohne Bestätigung wurde blockiert.
- Delete mit JSON-Body `{ "confirm": "DELETE" }` wurde erfolgreich getestet.
- Hinweis dokumentiert: `/api/stream-events/events` liefert Eventliste unter `rows`, nicht `events`.
- Hinweis dokumentiert: Query-Confirm `?confirm=DELETE` ist nicht ausreichend.
- Keine Code-/Runtime-Änderung in EVS-21b.

## EVS-21 – Event Archive/Delete Lifecycle Prep

- Status `archived` ergänzt.
- `POST /api/stream-events/events/:eventUid/archive` ergänzt.
- Archivieren ist nur erlaubt, wenn das Event vollständig beendet ist (`status=finished`).
- `POST /api/stream-events/events/:eventUid/delete` ergänzt.
- Löschen ist für jeden Eventstatus möglich, aber nur mit `confirm=DELETE`.
- Hard-Delete entfernt Event plus zugehörige eventUid-Daten: Score-Einträge, Runden, Text-Worttreffer, Text-Satzlösungen.
- Archivieren behält Eventwerte für Statistik/Historie.
- Keine Chat-Ausgabe, kein Playback, keine Queue-Berührung.

## EVS-20 – ChatOutput Dispatcher Prep

- ChatOutput-Dispatcher als Dry-Run vorbereitet.
- Neue Routen ergänzt:
  - `GET /api/stream-events/chat-output/status`
  - `GET /api/stream-events/chat-output/report`
  - `POST /api/stream-events/chat-output/test-dispatch`
- Vorbereitete ChatOutputs aus Sound- und Text-Reports werden gesammelt und normalisiert.
- Jeder Output bekommt eine Dispatch-Bewertung mit `wouldSend`, `blockedBy`, `directSend=false`, `dispatched=false`.
- Sicherheitsblocker bleiben standardmäßig aktiv:
  - `dispatcher_disabled`
  - `global_live_disabled`
  - `direct_send_not_allowed`
  - `prepared_only_mode`
  - `event_live_disabled`
  - `output_direct_send_false`
- Keine direkte Twitch-Ausgabe.
- Kein Bot-Send-Aufruf.
- Kein Sound-Playback.
- Keine Sound-System-Queue-Berührung.
- Keine DB-Migration.

## EVS-19e – Sound/Text Parallel AND Runtime bestätigt

- Eine Chatnachricht wird für Sound UND Text geprüft.
- Sound blockiert Text nicht.
- Text blockiert Sound nicht.
- Eine Nachricht konnte Sound und Text gleichzeitig lösen.
- Punkte wurden korrekt addiert.
- ChatOutputs blieben prepared-only.

## EVS-18 / EVS-18c

- Echte Twitch-Chatnachrichten über `twitch.chat.message` für Soundantworten bestätigt.
- Event-Lifecycle-/Archivregeln dokumentiert.

## EVS-17b und früher

- Sound Debug Accepted Answers.
- Sound Chat Answer Prep.
- Sound/Text Runtime Reports.
- User-Statistiken.
- Text-Runtime und Dashboard-Grundlagen.
