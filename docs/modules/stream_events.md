# Modul-Doku: stream_events

Stand: 2026-06-13 nach EVS-20 – ChatOutput Dispatcher Prep

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
MODULE_VERSION = 0.5.12
MODULE_BUILD   = STEP_EVS_20_CHAT_OUTPUT_DISPATCHER_PREP
```

## Aktuell bestätigt

- EVS-18: echte Twitch-Chatnachrichten werden über `twitch.chat.message` vom Bus verarbeitet.
- EVS-19e: Sound und Text laufen parallel im selben Event.
- Eine Chatnachricht wird für Sound UND Text geprüft.
- Eine Chatnachricht kann Sound UND Text lösen.
- Sound blockiert Text nicht und Text blockiert Sound nicht.
- ChatOutputs bleiben vorbereitet (`directSend=false`).
- Playback bleibt vorbereitet (`directPlay=false`).
- Sound-System-Queue wird nicht berührt.
- Eventwerte bleiben `eventUid`-gebunden; alte Events werden archiviert/finished, nicht blind gelöscht.

## EVS-20 ChatOutput Dispatcher Prep

EVS-20 bereitet einen zentralen ChatOutput-Dispatcher vor, ohne live in Twitch zu senden.

Neue Routen:

```text
GET  /api/stream-events/chat-output/status
GET  /api/stream-events/chat-output/report
POST /api/stream-events/chat-output/test-dispatch
```

Zweck:

- vorbereitete ChatOutputs aus Sound- und Text-Runtime sammeln,
- jeden Output normalisieren,
- prüfen, ob er theoretisch sendefähig wäre,
- blockierende Sicherheitsgründe sichtbar machen,
- weiterhin kein echter Send-Aufruf.

Sicherheitsstatus:

```text
dispatcherEnabled=false
globalLiveEnabled=false
allowDirectSend=false
preparedOnly=true
eventChatOutputEnabled=<Event-Setting>
eventLiveEnabled=false/direct nicht gesetzt
```

Solange einer der Sicherheitsgründe blockiert, bleibt:

```text
wouldSend=false
directSend=false
dispatched=false
```

Typische Blocker:

```text
dispatcher_disabled
global_live_disabled
direct_send_not_allowed
prepared_only_mode
event_chat_output_disabled
event_live_disabled
output_direct_send_false
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

### Config / Texte

```text
GET  /api/stream-events/config
POST /api/stream-events/config
GET  /api/stream-events/texts
POST /api/stream-events/texts
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

### Kombi-Runtime

```text
POST /api/stream-events/chat-runtime/create-stealth-test-event?confirm=1
POST /api/stream-events/chat-runtime/test-chat
```

### ChatOutput Dispatcher Prep

```text
GET  /api/stream-events/chat-output/status
GET  /api/stream-events/chat-output/report
POST /api/stream-events/chat-output/test-dispatch
```

## Sicherheit

Aktuell gelten weiterhin:

```text
directSend = false
directPlay = false
soundSystemTouched = false
queueTouched = false
preparedOnly = true
```

EVS-20 sendet nicht. EVS-20 ist nur Vorschau, Prüfung und Sicherheitsstatus.

## Nächster technischer Schritt

EVS-21 sollte das Dashboard für ChatOutput-Status/Report vorbereiten:

```text
- Anzeige TESTMODUS / LIVE AKTIV vorbereiten
- Blocker im Dashboard sichtbar machen
- keine öffentliche Twitch-Ausgabe
- kein Live-Send-Button ohne späteres Sicherheitskonzept
```
