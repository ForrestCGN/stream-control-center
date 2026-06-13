# CHANGELOG – EVS-8

## EVS-8 – Config Dashboard Prep

Geändert:

- Config-Tab von Platzhalter zu erstem echten Einstellbereich erweitert.
- Globale Event-System Config im Backend vorbereitet.
- Neue Routen:
  - `GET /api/stream-events/config`
  - `POST /api/stream-events/config`
- Neue Tabelle:
  - `stream_events_config`
- Dashboard lädt und speichert Config.
- Neue Events nutzen erste Defaults aus der Config.

Nicht geändert:

- Keine Chat-Runtime.
- Keine Worterkennung.
- Keine automatische Punktevergabe.
- Kein Sound-Playback.
- Kein Overlay.


## EVS-9 – EventBus / Heartbeat Integration

- `stream_events` EventBus-/Heartbeat-Anbindung als eigenen Step dokumentiert und sichtbar gemacht.
- Neuer Endpunkt `GET /api/stream-events/bus-status`.
- Bus-Events von `stream_events` sind standardmaessig replayable mit laengerem TTL-Fenster fuer Monitoring.
- Keine Gameplay-/Chat-/Overlay-Runtime hinzugefuegt.
