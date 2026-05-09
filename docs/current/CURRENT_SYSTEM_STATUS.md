# CURRENT SYSTEM STATUS

Stand: 2026-05-09

## Aktueller Hauptfokus - Loyalty / Twitch Presence

Aktueller Stand:

- Loyalty-Core läuft im Shadow Mode.
- StreamElements bleibt aktiv.
- Watch-Heartbeat mit Intervall-Schutz funktioniert.
- Twitch Presence sammelt aktive/anwesende Chat-User.
- Stream-State-Gate mit Streamer.bot-Fallback funktioniert.
- Presence Run-Once funktioniert.
- Auto Shadow Runner ist vorbereitet und standardmäßig deaktiviert.

## Aktive relevante Module

```text
backend/modules/loyalty.js
backend/modules/twitch_presence.js
```

## Loyalty Version

```text
0.1.3
```

## Wichtige Runner-Routen

```text
GET/POST /api/loyalty/runner/start
GET/POST /api/loyalty/runner/stop
GET/POST /api/loyalty/runner/run-once
GET      /api/loyalty/runner/status
GET      /api/loyalty/runner/events
```

## Verbindliche Regeln

```text
DB ist Hauptspeicher.
JSON ist nur Seed/Fallback/technische Boot-Konfig.
Shadow Mode zuerst.
StreamElements bleibt aktiv.
Offline keine Watch-Punkte.
Auto Runner nicht automatisch beim Boot aktiv.
```
