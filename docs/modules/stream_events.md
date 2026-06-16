# Modul-Doku: stream_events

Stand: 2026-06-16 nach EVENTSYS-27D-FIX2

## Aktueller Modulstand

Runtime zuletzt bestätigt:

```text
module = stream_events
moduleVersion = 0.5.22
moduleBuild = STEP_EVS_25A_EMPTY_OVERVIEW_ACTION_CLEANUP
enabled = true
schemaReady = true
bus.registered = true
```

Hinweis: Die Modulversion wurde in den aktuellen Dashboard-/Eventsystem-Steps nicht zwingend erhöht. Der dokumentierte Arbeitsstand liegt funktional bei EVENTSYS-27D-FIX2.

## Zweck

`stream_events` verwaltet Stream-Events mit Sound- und/oder Text-Spiel, gemeinsamer Punktewertung, Ranking, Statistik, Dashboard-Konfiguration und vorbereitetem ChatOutput-/Playback-Flow.

## Aktueller Funktionsumfang

### Eventverwaltung

```text
- Events listen
- Eventdetails lesen
- Event-Entwurf erstellen
- Event bearbeiten
- Event validieren
- Event starten
- Event beenden
- Event abbrechen
- Event archivieren
- Event löschen
- Event kopieren
- Event umbenennen
```

### Sound-Event-Konfiguration

```text
- mehrere Sound-Schnipsel pro Event
- Name pro Schnipsel
- erlaubte Antworten pro Schnipsel
- Audio-Media-Auswahl pro Schnipsel
- optionales Auflösungs-Video pro Schnipsel
- konkrete Pflichtprüfung pro Schnipsel
```

Pflichtfelder pro Sound-Schnipsel:

```text
- Name
- mindestens eine Antwort
- Audio-Medium
```

Optional:

```text
- Auflösungs-Video
```

### Editor-Struktur

Das Dashboard nutzt getrennte Fenster:

```text
- Einstellungen bearbeiten
- Sound-Schnipsel bearbeiten
- Text-Spiel bearbeiten
```

Das Hauptfenster enthält keine alte Inline-Sound-Konfiguration mehr.

### Globale Sound-Defaults

Globale Defaults werden im Config-Tab gespeichert und von neuen Events übernommen.

Bestätigte Standardrichtung:

```text
Antwortzeit 60 Sekunden
Zufällig automatisch
Intervall 15 Minuten
Zufallsabweichung ± 5 Minuten
Wiederholschutz aktiv
Mindestabstand 3
Wenn erkannt: aus Rotation entfernen
Wenn nicht erkannt: später erneut versuchen
Video nach Lösung automatisch, wenn vorhanden
```

### Event-spezifische Einstellungen

Pro Event gibt es ein eigenes Einstellungsfenster. Dort können Sound-Regeln überschrieben werden, ohne die globalen Defaults zu verändern.

Grundregel:

```text
Globale Config = Defaults für neue Events.
Event-Einstellungen = Snapshot/Regeln für dieses konkrete Event.
```

### Live-Bedienung

Bei laufendem Event zeigt die Übersicht:

```text
- EVENT LÄUFT
- Runtime-Hinweis
- Live-Bedienung
- Nächsten Schnipsel vorbereiten
- Status & Punkte öffnen
- Event verwalten
- Event beenden
```

## Runtime-Stand

Aktuell:

```text
- Sound-Runden können vorbereitet werden.
- Es gibt noch kein echtes Playback über das Sound-System.
- Es gibt noch keinen Countdown-PreRoll.
- Es gibt noch keinen Antwort-Timer.
- Es gibt noch keine Auto-Rotation.
- Chat-Live-Send bleibt vorbereitet/deaktiviert.
```

## Sound-System-Regel für kommende Schritte

Für Event-Sounds darf keine direkte Audioausgabe in `stream_events` gebaut werden.

Richtig:

```text
stream_events entscheidet/erstellt Runde
→ Sound-System erhält Queue-Job
→ Sound-System steuert Countdown + Audio
→ stream_events reagiert auf Runtime/Status
```

Falsch:

```text
stream_events zeigt Countdown direkt
stream_events spielt Sound direkt
stream_events baut eigene Queue
```

## Geplante EventSound-/Countdown-Erweiterung

Countdown vor Sound soll optional sein und über das Sound-System laufen.

Geplante additive Daten:

```json
{
  "preRoll": {
    "type": "countdown",
    "enabled": true,
    "seconds": 3,
    "style": "cgn"
  }
}
```

Kompatibilität:

```text
preRoll fehlt -> altes Sound-System-Verhalten.
preRoll.enabled !== true -> altes Verhalten.
```

## Wichtige Routen

Bekannte Eventsystem-Routen:

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
POST /api/stream-events/events/:eventUid/duplicate
POST /api/stream-events/events/:eventUid/rename
GET  /api/stream-events/events/:eventUid/ranking
POST /api/stream-events/events/:eventUid/points
POST /api/stream-events/sound-runtime/next-round
GET  /api/stream-events/sound-runtime/status
GET  /api/stream-events/sound-runtime/report
GET  /api/stream-events/text-runtime/status
GET  /api/stream-events/text-runtime/report
```

## Sicherheit

Weiterhin gilt:

```text
Kein Twitch-Live-Send ohne separate Freigabe.
Kein Sound-Playback am Sound-System vorbei.
Keine alte Sound-/Alert-/UserSound-Logik brechen.
Keine produktive DB ersetzen.
```

## Nächster Modul-Schritt

```text
SOUND-SAFE-1 – Sound-System prüfen und Erweiterungspunkt für EventSound + Countdown-PreRoll festlegen.
```
