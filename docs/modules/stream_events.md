# Modul-Doku: stream_events

Stand: EVS-5b / Text Game Rule Rebalance  
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

## Dashboard-Stand EVS-3 bis EVS-5b

Dashboard-Dateien:

```text
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
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

EVS-5 wurde als Zwischenstand getestet, wirkte aber zu kastenlastig. EVS-5b korrigiert die Text-Spiel-Regel und das Layout.

## Text-Spiel-Konvention aus EVS-5b

Text-Spiel V1:

```text
Geheimsatz / Lösungssatz: Pflicht
Erlaubte Antworten / Varianten: Optional
Punkte für den ersten richtigen Löser: Pflicht/Default
Teiltreffer-Hinweise: Optional
```

Fachregel:

```text
- Der erste User, der den kompletten Satz oder eine erlaubte Variante richtig schreibt, bekommt die Punkte.
- Danach ist dieser Satz im aktuellen Event erledigt und wird aus der Rotation entfernt.
- Es gibt in V1 keine weiteren Löser und kein Zeitfenster für weitere Löser.
- Teiltreffer geben keine Punkte.
- Teiltreffer-Hinweise werden aus den Wörtern des Geheimsatzes berechnet, kein separates Hinweiswort-Feld in V1.
- Pro Event, Satz und User wird später gespeichert, welche Wörter bereits erkannt wurden.
- Ein bereits erkanntes Wort wird für denselben User und Satz nicht erneut gemeldet/gezählt.
- Optional kann ein zusätzlicher Cooldown gesetzt werden.
```

Config-Snapshot aus EVS-5b:

```text
textConfig.winnerMode = first_complete_solver
textConfig.solvedPolicy = remove_from_rotation
textConfig.allowFollowupSolves = false
textConfig.hintTokensEnabled / partialHintsEnabled
textConfig.partialHintMode = new_words_per_user | improved_count
textConfig.uniqueWordsPerUser = true
textConfig.partialHintCooldownSeconds
```

Die konkrete Chat-Auswertung wird erst später gebaut.

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

## Noch nicht umgesetzt

```text
Chat-Auswertung
Sound-Rundensteuerung
Text-Rundensteuerung
Mehrere Schnipsel/Sätze je Event
Overlay
Playback-Anbindung
Statistik-Auswertung
```
