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


## EVS-5c Dokumentations-/Backend-TODO-Festlegung

Dieser Stand ist eine reine Doku-/TODO-Konsolidierung nach EVS-5b. Es wurden keine Runtime-Dateien verändert.

Wichtig: Die im Dashboard sichtbaren Text-Spiel-Regeln sind nicht nur UI-Notizen. Sie müssen in späteren Backend-/Runtime-Schritten fachlich umgesetzt werden.

### Verbindliche Text-Spiel-Regel für Backend/Runtime

```text
- Pro aktivem Event kann ein Text-Spiel aktiv sein.
- Ein Text-Spiel besteht später aus mehreren Geheimsätzen / Lösungssätzen.
- Pro Satz gewinnt genau der erste User, der den kompletten Satz oder eine erlaubte Antwortvariante korrekt schreibt.
- Dieser User bekommt die konfigurierten Punkte.
- Nach korrekter Lösung wird der Satz im aktuellen Event als gelöst markiert und aus der Rotation entfernt.
- Es gibt in V1 keine weiteren Löser und kein Zeitfenster für weitere Löser.
- Teiltreffer geben keine Punkte.
```

### Teiltreffer-Hinweise

```text
- Teiltreffer-Hinweise können pro Text-Spiel/Event aktiviert oder deaktiviert werden.
- Die Teiltreffer-Wörter werden automatisch aus dem Geheimsatz berechnet.
- Es gibt in V1 kein separates Hinweiswörter-/Suchwörter-Feld.
- Wenn ein User neue Wörter aus dem Geheimsatz schreibt, kann eine Chatmeldung ausgegeben werden.
- Pro Event, Satz, User und Wort wird gespeichert, ob dieses Wort bereits erkannt/gemeldet wurde.
- Ein bereits erkanntes Wort darf für denselben User und Satz nicht erneut gemeldet oder gezählt werden.
- Optional kann zusätzlich ein Cooldown genutzt werden.
- Standardempfehlung: neue Wörter pro User nur einmal melden, Cooldown 0-10 Sekunden.
```

### Backend-/DB-TODO für spätere Schritte

Spätere Runtime-Schritte müssen diese Regeln im Backend abbilden. Dafür sind voraussichtlich notwendig:

```text
stream_event_text_items / stream_event_phrase_items
- event_uid
- phrase_uid
- solution_text
- answer_variants_json
- points_first_solver
- status: open | solved | removed | skipped
- solved_by_login / solved_by_display_name
- solved_at
- metadata_json

stream_event_text_partial_hits
- event_uid
- phrase_uid
- user_login
- user_display_name
- token
- first_seen_at
- last_seen_at
- hit_count
- UNIQUE(event_uid, phrase_uid, user_login, token)
```

Tabellennamen sind noch Planungsnamen. Umsetzung später nur nach Prüfung des echten Backend-Stands und nur sanft per Migration.

### Dashboard-/Config-TODO

```text
- Allgemeine Event-Config als Dashboard-Bereich ergänzen.
- Text-Config / Multi-Texte als Dashboard-Bereich ergänzen.
- Chatmeldungen für Teiltreffer, Lösung, keine aktive Runde, Eventstart/-ende über helper_texts / module_text_variants pflegen.
- Keine parallele Textstruktur bauen.
- Config und Textvarianten sollen streamer-/modfreundlich bearbeitbar sein.
```
