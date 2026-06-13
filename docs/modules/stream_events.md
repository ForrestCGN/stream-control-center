# Stream Events

Stand: EVS-3 / Dashboard Skeleton
Datum: 2026-06-13

## Zweck

`stream_events` ist das zentrale Event-System fuer Stream-Events. Es verwaltet vorbereitete Events, Sound-/Text-Spielauswahl, Validierung, Punkte-Ledger und Ranking.

EVS-3 ergaenzt eine erste streamer-/modfreundliche Dashboard-Oberflaeche. Sie ist bewusst ein Skeleton und ersetzt noch keine Spiel-Engine.

## Backend-Stand aus EVS-2

API-Prefix:

```text
/api/stream-events
```

Wichtige Routen:

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
```

## Dashboard-Stand EVS-3

Neue Dateien:

```text
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

Geaenderte Datei:

```text
htdocs/dashboard/index.html
```

Das Dashboard-Modul wird ueber `stream_events.js` in die vorhandene Dashboard-Struktur registriert. Es wird im Community-Bereich als Event-System-Kachel sichtbar.

## Dashboard-Funktionen

EVS-3 kann:

- Eventliste laden
- Eventdetails anzeigen
- Event erstellen
- Event bearbeiten, solange backendseitig erlaubt
- Sound-Spieltyp aktivieren/deaktivieren
- Text-Spieltyp aktivieren/deaktivieren
- einfache Sound-Konfiguration fuer einen ersten Schnipsel speichern
- einfache Text-Konfiguration fuer einen ersten Geheimsatz speichern
- Startbereitschaft/Validierung streamerfreundlich anzeigen
- Event validieren
- Event starten, beenden oder abbrechen mit Bestaetigung
- Ranking lesen

## Bewusst noch nicht enthalten

- keine Twitch-Chat-Auswertung
- keine Sound-/Video-Wiedergabe
- kein Event-Overlay
- keine echte Rundenlogik
- keine Media-Picker-Integration
- keine Statistiken ausser Ranking-Anzeige
- keine Textvarianten-Dashboardbearbeitung

## Wichtige Bedienregel

EVS-3 ist fuer Vorabtests im Dashboard gedacht. Produktive Live-Tests erst nach `stepdone.cmd` und Uebernahme ins Live-System.

