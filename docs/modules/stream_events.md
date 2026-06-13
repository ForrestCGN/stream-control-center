# Modul-Doku: stream_events

Stand: EVS-5 / Text Game Config Layout Cleanup  
Datum: 2026-06-13

## Zweck

`stream_events` ist die neue Backend-/Dashboard-Basis für Stream-Events mit Sound- und/oder Text-Spielen, gemeinsamer Punktewertung, Ranking und späterer Overlay-/Chat-/Playback-Anbindung.

## Backend-Stand aus EVS-2

Backend-Modul:

```text
backend/modules/stream_events.js
```

Routen:

```text
GET  /api/stream-events/status
GET  /api/stream-events/routes
GET  /api/stream-events/texts
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

## Dashboard-Stand EVS-3 bis EVS-5

Dashboard-Dateien:

```text
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

Integration aus EVS-3:

```text
htdocs/dashboard/index.html
htdocs/dashboard/app.js
```

EVS-3 brachte:

- Community-Modul `stream_events`
- Eventliste
- Event erstellen/bearbeiten
- Sound/Text auswählen
- Validierungsstatus
- Start/Beenden/Abbrechen vorbereitet
- Ranking-Anzeige

EVS-4 brachte:

- Sound-Schnipsel-Auswahl über vorhandenes `MediaField`/`MediaPicker`
- Upload über vorhandenes Media-System
- optionales Auflösungs-Video über vorhandenes Media-System
- keine neue Upload- oder Player-Struktur

EVS-4b brachte:

- Sound-Konfiguration im Modal klarer aufgeteilt
- Audio-Schnipsel als Pflicht-Karte
- Auflösungs-Video als optionale Karte
- Desktop nebeneinander, kleinere Auflösung untereinander
- kompaktere MediaField-Buttons

EVS-5 bringt:

- Text-Spiel-Konfiguration im Modal klarer aufgeteilt
- Geheimsatz als Pflicht-Karte
- Antworten & Hinweise als optionale Karte
- Hinweiswörter/Suchwörter-Feld vorbereitet
- Punkte & Zeitfenster als eigene Karte
- responsive Darstellung: Desktop nebeneinander, kleinere Auflösung untereinander

## Media-System-Konvention

Für Event-Medien werden vorhandene Media-Komponenten genutzt:

```text
moduleKey: stream_events
categoryKey für Sound-Schnipsel: sound_snippets
categoryKey für Auflösungs-Videos: reveal_videos
```

Erlaubte Typen:

```text
Sound-Schnipsel: audio
Auflösungs-Video: video, animation
```

Das Event speichert im Config-Snapshot nur die Media-ID/Referenz.

## Text-Spiel-Konvention aus EVS-5

V1 speichert weiterhin nur einen Text-/Geheimsatz im Event-Snapshot, bereitet aber folgende Struktur vor:

```text
Geheimsatz: Pflicht
Erlaubte Antworten: Optional
Hinweiswörter/Suchwörter: Optional / später für Chat-Auswertung und Teilfortschritt
Punkte erster Löser: Pflicht/Default
Zeitfenster für weitere Löser: Default
```

Hinweiswörter werden in EVS-5 nur gespeichert/vorbereitet. Es gibt noch keine Chat-Auswertung und keine Punktevergabe darüber.

## Noch nicht umgesetzt

```text
Mehrere Sound-Schnipsel pro Event sauber verwalten
Mehrere Text-Phrasen pro Event sauber verwalten
Chat-Auswertung
Sound-/Video-Playback
Overlay
Statistikdetails
Live-Rundensteuerung
```
