# CURRENT_STATUS – STEP303

Stand: 2026-05-24

Aktueller Stand:

- SoundBus ist aktiv und getestet.
- Discord Media Path Resolver ist gefixt und bestätigt.
- SoundBus Debug View ist verfügbar.
- Dashboard Bus-Monitor ist eingebunden.
- Bus-Monitor ist rein lesend.
- Bus-Monitor nutzt für Refresh nur `GET /api/sound/status`.
- Bus-Monitor aktualisiert sich automatisch alle 5 Sekunden, solange der Tab aktiv ist.

Aktuelle Betriebsentscheidung:

```text
soundBus.enabled = true
```

Wichtig:

- Keine vollständige Bus-only-Migration.
- Bestehende HTTP-/WebSocket-Wege bleiben erhalten.
- Weitere Consumer/Migrationen nur schrittweise.

Nächster Schritt:

STEP304 – Sound Dashboard Bus-Monitor Auto Refresh Live-Test dokumentieren.
