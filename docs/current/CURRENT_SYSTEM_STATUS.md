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
- Automatische Punktevergabe aus Twitch Presence ist noch nicht aktiv.

## Aktive relevante Module

```text
backend/modules/loyalty.js
backend/modules/twitch_presence.js
```

## Loyalty

Aktuelle Loyalty-Routen:

```text
GET    /api/loyalty/status
GET    /api/loyalty/config
GET    /api/loyalty/settings
POST   /api/loyalty/settings
GET    /api/loyalty/users
GET    /api/loyalty/users/:login
GET    /api/loyalty/balance/:login
GET    /api/loyalty/transactions
POST   /api/loyalty/transactions/adjust
GET    /api/loyalty/test/watch
GET    /api/loyalty/watch/heartbeat
POST   /api/loyalty/watch/heartbeat
GET    /api/loyalty/watch/states
GET    /api/loyalty/ignored-users
POST   /api/loyalty/ignored-users
DELETE /api/loyalty/ignored-users/:login
GET    /api/loyalty/routes
```

## Twitch Presence Activity

Neue Activity-Routen:

```text
GET  /api/twitch/presence/activity
GET  /api/twitch/presence/activity/active
POST /api/twitch/presence/activity/clear
GET  /api/twitch/presence/activity/test
```

Statuslogik:

```text
JOIN => present
PRIVMSG => active
USERNOTICE => active
PART => left
Timeout => stale
```

## Verbindliche Loyalty-Regeln

```text
DB ist Hauptspeicher.
JSON ist nur Seed/Fallback/technische Boot-Konfig.
Shadow Mode zuerst, StreamElements bleibt aktiv, Import später.
```

## Bewusst offen

- STEP203.3: Twitch Presence mit Loyalty Heartbeat verbinden.
- echte Twitch-Tags im Livebetrieb beobachten.
- Tier-Erkennung anhand realer Badges verbessern.
- Get Chatters API später ergänzen.
- Dashboard-Modul für Loyalty später.
