# CHANGELOG – stream_events / Event-System

Stand: 2026-06-13

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
