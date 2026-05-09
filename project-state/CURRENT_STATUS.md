# CURRENT STATUS - stream-control-center

Stand: 2026-05-09

## Loyalty

- Shadow Mode aktiv.
- Watch/Lurk-Punkte funktionieren.
- Twitch Presence funktioniert.
- Stream-State-Gate funktioniert.
- Auto Runner funktioniert.
- Dashboard-Modul funktioniert.
- STEP203.6 ergänzt echte Twitch/EventSub-Event-Boni im Shadow-System.

Neue Tabelle:

```text
loyalty_events
```

Neue Routen:

```text
GET  /api/loyalty/events
POST /api/loyalty/events/ingest
GET  /api/loyalty/events/test/:type
```

Punktebuchung für Events nur wenn:

```text
features.eventBonusesEnabled = true
```
