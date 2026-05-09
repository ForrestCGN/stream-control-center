# CURRENT STATUS - stream-control-center

Stand: 2026-05-09

## Loyalty / Twitch Presence

Aktueller Stand:

- Loyalty-Core läuft im Shadow Mode.
- Watch-Heartbeat mit Intervall-Schutz funktioniert.
- Twitch Presence Activity Collector funktioniert.
- Stream-State-Gate funktioniert.
- Streamer.bot Start/Stop-Fallback funktioniert.
- Presence Run-Once funktioniert.
- STEP203.4 ergänzt Auto Shadow Runner.

Aktuelle Loyalty-Version:

```text
0.1.3
```

Neue DB-Struktur:

```text
loyalty_runner_events
```

Neue Routen:

```text
GET/POST /api/loyalty/runner/start
GET/POST /api/loyalty/runner/stop
GET/POST /api/loyalty/runner/run-once
GET      /api/loyalty/runner/status
GET      /api/loyalty/runner/events
```

Der Auto Runner ist standardmäßig deaktiviert und wird nicht automatisch beim Boot gestartet.
