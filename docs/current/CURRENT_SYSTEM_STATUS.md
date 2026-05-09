# CURRENT SYSTEM STATUS

Stand: 2026-05-09

## Single Source of Truth

- Branch: `dev`
- Repo: `D:\Git\stream-control-center`
- Live: `D:\Streaming\stramAssets`
- GitHub: `https://github.com/ForrestCGN/stream-control-center`

## Aktueller Hauptfokus - Loyalty / Twitch Presence

Aktueller Stand:

- Loyalty-Core läuft im Shadow Mode.
- StreamElements bleibt aktiv.
- Watch-Heartbeat mit Intervall-Schutz ist vorhanden.
- Twitch Presence sammelt aktive/anwesende Chat-User.
- Stream-State-Gate mit manuellem Streamer.bot-Fallback ist vorhanden.
- Presence Run-Once kann aktive User kontrolliert durch Loyalty Heartbeat schicken.
- Automatischer Timer ist noch nicht aktiv.

## Aktive relevante Module

```text
backend/modules/loyalty.js
backend/modules/twitch_presence.js
```

## Loyalty Version

```text
0.1.2
schema version 3
```

## Wichtige Loyalty-Routen

```text
GET/POST /api/loyalty/stream-state/start
GET/POST /api/loyalty/stream-state/stop
GET/POST /api/loyalty/stream-state/clear-override
GET/POST /api/loyalty/stream-state/refresh-auto
GET      /api/loyalty/presence/status
GET/POST /api/loyalty/presence/run-once
```

## Verbindliche Regeln

```text
DB ist Hauptspeicher.
JSON ist nur Seed/Fallback/technische Boot-Konfig.
Shadow Mode zuerst.
StreamElements bleibt aktiv.
Offline keine Watch-Punkte.
```

## Bewusst offen

- STEP203.4: automatischer Shadow Runner mit Timer.
- echte Twitch-Tags im Livebetrieb beobachten.
- Tier-Erkennung anhand realer Badges verbessern.
- Get Chatters API später ergänzen.
- Dashboard-Modul für Loyalty später.
