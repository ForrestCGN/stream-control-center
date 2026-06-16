# FILES – stream-control-center

Stand: 2026-06-16

## Aktueller Arbeitsstand

```text
EVENTSYS-27A – Event-Einstellungen und Sound-Defaults bestätigt
```

## Für diesen Doku-Stand relevante Dateien

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
docs/current/CURRENT_STATUS.md
docs/current/NEXT_STEPS.md
docs/current/TODO.md
docs/current/FILES.md
docs/current/CHANGELOG.md
docs/current/CURRENT_CHAT_HANDOFF_EVENTSYS_27A.md
docs/modules/stream_events.md
project-state/CURRENT_STATUS_EVENTSYS_27A.md
```

## Backend

```text
backend/modules/stream_events.js
```

Dokumentierter Basisstand:

```text
MODULE_VERSION = 0.5.22
MODULE_BUILD   = STEP_EVS_25A_EMPTY_OVERVIEW_ACTION_CLEANUP
```

Seitdem relevante Eventsystem-Steps:

```text
EVENTSYS-26A Sound-Event Mehrfach-Schnipsel im Dashboard
EVENTSYS-26B getrennte Editor-Fenster für Sound-Schnipsel und Text-Spiel
EVENTSYS-26B-FIX1 Sound-Editor MediaPicker-State erhalten
EVENTSYS-26B-FIX2 Sound-Editor Summary nach Änderungen sofort aktualisieren
EVENTSYS-26B-FIX3 konkrete Sound-Schnipsel-Validierung mit Live-Refresh
EVENTSYS-26B-FIX4 Eventdetails nach Speichern neu laden
EVENTSYS-27A Event-Einstellungen und Sound-Defaults
```

Wichtige Routen aus aktuellem Modulstand:

```text
GET  /api/stream-events/status
GET  /api/stream-events/routes
GET  /api/stream-events/config
POST /api/stream-events/config
GET  /api/stream-events/events
POST /api/stream-events/events
GET  /api/stream-events/events/:eventUid
PUT  /api/stream-events/events/:eventUid
POST /api/stream-events/events/:eventUid/validate
POST /api/stream-events/events/:eventUid/start
POST /api/stream-events/events/:eventUid/finish
POST /api/stream-events/events/:eventUid/cancel
POST /api/stream-events/events/:eventUid/archive
POST /api/stream-events/events/:eventUid/delete
GET  /api/stream-events/events/:eventUid/ranking
POST /api/stream-events/events/:eventUid/points
GET  /api/stream-events/runtime-gate/status
GET  /api/stream-events/sound-runtime/status
GET  /api/stream-events/sound-runtime/report
POST /api/stream-events/sound-runtime/next-round
POST /api/stream-events/sound-runtime/resolve
POST /api/stream-events/sound-runtime/unresolved
```

## Dashboard

```text
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

Enthält aktuell:

```text
- Event-System Tabs Übersicht, Events, Texte, Config, Statistik, Overlay
- mehrere Sound-Schnipsel pro Sound-Event
- eigenes Sound-Schnipsel-Fenster
- eigenes Text-Spiel-Fenster
- eigenes Event-Einstellungen-Fenster
- globale Sound-Defaults im Config-Tab
- konkrete Validierungsanzeige pro Sound-Schnipsel
- Detail-Refresh nach Speichern
```

## Textsystem

Vorhandene Helper sollen genutzt werden:

```text
backend/modules/helpers/helper_texts.js
backend/modules/helpers/helper_messages.js
```

Für spätere Chat-Ausgaben:

```text
- DB-/dashboardfähige Textvarianten
- mehrere aktive Varianten
- Zufallsauswahl
- Platzhalter
- CGN-/Heimleitung-/Rentner-/Altersheim-Stil
```

## Communication Bus / Twitch-Events

`stream_events` ist am Communication-Bus registriert und konsumiert:

```text
consumes:twitch.chat.message
```

Keine parallele Chat-Auswertung bauen.

## Produktive DB-Regel

```text
D:\Streaming\stramAssets\data\sqlitepp.sqlite niemals ersetzen, löschen oder neu bauen.
Schemaänderungen nur sanft, falls später nötig.
Config/DB-Helper nutzen, keine Sonderstruktur bauen.
```

## Offene Testbefehle

Nur bei Bedarf gezielt:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/runtime-gate/status" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/config" | ConvertTo-Json -Depth 8
```
