# CURRENT STATUS - stream-control-center

Stand: 2026-05-09

## Aktueller Hauptfokus - Loyalty / Twitch Presence

Aktueller Stand:

- Loyalty-Core läuft im Shadow Mode.
- Watch-Heartbeat mit Intervall-Schutz ist vorhanden.
- Twitch Presence sammelt aktive/anwesende Chat-User.
- Stream-State-Gate mit manuellem Start/Stop-Fallback ist vorhanden.
- Presence Run-Once kann aktive User kontrolliert durch Loyalty Heartbeat schicken.
- Automatischer Timer ist noch nicht aktiv.

Aktuelle relevante Dateien:

```text
backend/modules/loyalty.js
backend/modules/twitch_presence.js
config/loyalty.json
```

Aktuelle Loyalty-Version:

```text
0.1.2
```

Aktuelle Loyalty-Schema-Version:

```text
3
```

Neue DB-Struktur:

```text
loyalty_stream_state
```

Neue Routen:

```text
GET/POST /api/loyalty/stream-state/start
GET/POST /api/loyalty/stream-state/stop
GET/POST /api/loyalty/stream-state/clear-override
GET/POST /api/loyalty/stream-state/refresh-auto
GET      /api/loyalty/presence/status
GET/POST /api/loyalty/presence/run-once
```

## Bewusst offen

- automatischer Runner erst nach erfolgreichem manuellen Test
- Dashboard-Modul für Loyalty
- Rewards / Store
- Giveaways
- Chat-Games
- StreamElements-Import später
