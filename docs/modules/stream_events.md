# Modul-Doku: stream_events

Stand: 2026-06-16 nach EVENTSYS-27A – Event-Einstellungen und Sound-Defaults

## Aktueller Modulstand

```text
MODULE_VERSION = 0.5.22
MODULE_BUILD   = STEP_EVS_25A_EMPTY_OVERVIEW_ACTION_CLEANUP
```

Hinweis: Die Basis-Modulversion ist weiterhin `0.5.22`. Die jüngsten EVS-26/27-Schritte betreffen Dashboard-/Validierungs-/Config-Ausbau und müssen bei der nächsten echten Modulversionsrunde sauber eingeordnet werden.

## Zweck

`stream_events` verwaltet Stream-Events mit Sound- und/oder Text-Spiel, gemeinsamer Punktewertung, Ranking, Statistik, Dashboard-Konfiguration und vorbereitetem ChatOutput-/Playback-Flow.

## Bestätigte Grundregeln

- Sound und Text können im selben Event parallel laufen.
- Nur ein Event darf gleichzeitig aktiv sein.
- Eine Chatnachricht wird über Twitch-Events/Communication-Bus verarbeitet.
- `stream_events` konsumiert `twitch.chat.message`.
- ChatOutputs bleiben prepared-only, solange keine späteren Live-Schalter bewusst und sichtbar gesetzt sind.
- Sound-Playback bleibt vorbereitet, aber noch nicht produktiv angebunden.
- Eventdaten bleiben an `eventUid` gebunden.
- Config-Defaults gelten für neue Events, ersetzen aber keine Event-Bearbeitung.

## EVS-27A Event-Einstellungen und Sound-Defaults

EVS-27A erweitert die Sound-Konfiguration deutlich und trennt globale Defaults von eventbezogenen Einstellungen.

### Globale Defaults

Pfad im Dashboard:

```text
Event-System → Config → Sound-Spiel Defaults
```

Bestätigte Standardwerte:

```text
Antwortzeit in Sekunden: 60
Punkte pro Soundlösung: 10
Abspielmodus: Zufällig automatisch
Alle X Minuten: 15
Zufallsabweichung ± Minuten: 5
Reihenfolge: Zufällig
Wenn erkannt: Aus aktueller Rotation entfernen
Wenn nicht erkannt: Später nochmal
Pause nach Runde in Sekunden: 60
Mindestabstand Wiederholung: 3
Erste Runde automatisch beim Eventstart: aus
Nach einer Runde automatisch weitermachen: an
Direkte Wiederholung vermeiden: an
Auflösungs-Video nach Lösung erlauben: an
Video-Modus: Nach richtiger Antwort automatisch
```

### Event-spezifische Einstellungen

Pfad im Dashboard:

```text
Event-Details → Einstellungen bearbeiten
```

Enthält:

```text
Sound · Ablauf & Timing
Sound · Rotation
Sound · Auflösung
```

Diese Regeln gelten nur für das konkrete Event. Neue Events übernehmen Startwerte aus Config/DB.

## EVS-26B getrennte Editor-Fenster

Das Haupt-Event-Fenster wurde entschlackt. Sound, Text und Einstellungen sind getrennt:

```text
Einstellungen bearbeiten
Sound-Schnipsel bearbeiten
Text-Spiel bearbeiten
```

Regel:

```text
Konfiguration nicht in ein einziges großes Hauptmodal zurückbauen.
```

## Sound-Schnipsel

Ein Sound-Event kann mehrere Sound-Schnipsel enthalten.

Pflicht pro Schnipsel:

```text
- Schnipsel-Name
- mindestens eine Antwort
- Audio-Medium
```

Optional:

```text
- Auflösungs-Video
```

Validierung meldet konkret, welcher Schnipsel was braucht:

```text
Sound-Schnipsel 1: Antwort fehlt.
Sound-Schnipsel 2: Audio fehlt.
Sound-Schnipsel 3: Name fehlt.
```

## Aktueller Runtime-Stand

Vorhanden/vorbereitet:

```text
GET  /api/stream-events/sound-runtime/status
GET  /api/stream-events/sound-runtime/report
POST /api/stream-events/sound-runtime/next-round
POST /api/stream-events/sound-runtime/resolve
POST /api/stream-events/sound-runtime/unresolved
```

Noch nicht produktiv angebunden:

```text
- echtes Sound-Playback
- Timer-Worker
- automatische Rotation
- Auflösungs-Video-Playback
- produktive Chat-Ausgaben
```

## Wichtige Routen

```text
GET  /api/stream-events/status
GET  /api/stream-events/routes
GET  /api/stream-events/config
POST /api/stream-events/config
GET  /api/stream-events/texts
POST /api/stream-events/texts
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
```

## Nächster Arbeitsbereich

```text
EVENTSYS-27B – Live-Statusfenster für laufende Events mit Punkten/Rangliste
```

Ziel:

```text
Bei laufendem Event ein eigenes Statusfenster öffnen können.
```

Danach:

```text
EVENTSYS-27C – Manuelle Sound-Rundensteuerung
EVENTSYS-27D – Sound-/Media-Playback-Anbindung
EVENTSYS-27E – Automatik: zufällig alle X ± Y Minuten
EVENTSYS-27F – Auflösungs-Video nach Lösung
EVENTSYS-27G – Chat-Ausgaben über helper_texts/helper_messages
EVENTSYS-27H – Statistik-Ausbau
```

## Sicherheit / Nicht ändern ohne separaten STEP

```text
Keine direkte Twitch-Ausgabe.
Kein Sound-/Video-Playback ohne dedizierten Playback-Step.
Keine automatische Rotation ohne dedizierten Runtime-Step.
Keine parallele Chat-Auswertung neben Twitch-Events/Communication-Bus.
Keine parallele Config-Struktur neben bestehenden Helpern/DB-Patterns.
```
