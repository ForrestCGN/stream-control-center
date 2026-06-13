# Modul-Doku: stream_events

Stand: 2026-06-13 nach EVS-17b – Sound Debug Accepted Answers

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
MODULE_VERSION = 0.5.4
MODULE_BUILD   = STEP_EVS_17B_SOUND_DEBUG_ACCEPTED_ANSWERS
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

Texte-Tab:

- Bereichs-/Modul-Dropdown
- Suche nach Key/Text
- Textvarianten bleiben editierbar

User-Statistik:

- Dropdown/Userliste
- User-Detail-Popup
- Scrollbarer Inhalt
- AutoReload ohne Seitenreload

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

### User Statistik

```text
GET /api/stream-events/statistics/users
GET /api/stream-events/statistics/users?eventUid=<eventUid>
GET /api/stream-events/statistics/user/:login
GET /api/stream-events/statistics/user/:login?eventUid=<eventUid>
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

## Nächster technischer Schritt

EVS-18:

```text
Echte `twitch.chat.message` Bus-Events für aktive Sound-Runden auswerten.
```

Dabei dürfen direkte Chat-Ausgabe und Playback weiterhin nicht aktiviert werden.
