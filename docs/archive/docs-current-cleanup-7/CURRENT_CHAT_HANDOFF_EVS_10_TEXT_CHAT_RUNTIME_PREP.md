# CURRENT CHAT HANDOFF – EVS-10 Text Chat Runtime Prep

## Stand

EVS-10 baut auf EVS-9 auf und integriert die erste Text-Spiel-Runtime.

## Enthaltene Dateien

- `backend/modules/stream_events.js`
- `docs/modules/stream_events.md`
- `docs/current/CURRENT_CHAT_HANDOFF_EVS_10_TEXT_CHAT_RUNTIME_PREP.md`
- `project-state/*`

## Was EVS-10 macht

- nutzt den vorhandenen `communication_bus` / `helper_communication`
- abonniert `twitch.chat.message` ueber den Bus
- verarbeitet Chatnachrichten nur, wenn ein aktives Text-Event laeuft
- erkennt komplette Satzloesungen
- erkennt neue Worttreffer pro User/Satz
- speichert Worttreffer eindeutig pro Event/Satz/User/Wort
- speichert geloeste Saetze eindeutig pro Event/Satz
- bucht optionale Wortpunkte und Loesungspunkte ueber das bestehende Score-System
- veroeffentlicht Runtime-Ereignisse ueber den Bus
- stellt Runtime-Diagnoserouten bereit

## Neue Routen

- `GET /api/stream-events/text-runtime/status`
- `POST /api/stream-events/text-runtime/test-chat`

## Neue Tabellen

- `stream_events_text_word_hits`
- `stream_events_text_phrase_solves`

## Wichtige Regel

Der Test-Endpunkt kann echte Punkte im aktiven Event erzeugen. Fuer Tests deshalb am besten ein Test-Event verwenden.

## Noch offen

- direkte Twitch-Chat-Ausgabe
- Dashboard-Statistik fuer Worttreffer/Satzloesungen
- Sound-Runtime
- Overlay-Runtime
- Runtime-Konfig optisch weiter pruefen
