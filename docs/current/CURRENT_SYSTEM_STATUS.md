# Current System Status

Stand: 2026-05-26

## Channelpoints / Kanalpunkte

Aktueller Modulstand: `channelpoints` Version `0.6.0`, Build `media-execution-bridge`.

Das Kanalpunkte-System besitzt jetzt zusätzlich zur lokalen Reward-CRUD-Basis eine lokale Medien-Ausführungsbrücke. Damit können Rewards mit `media_asset_id` bzw. `action_payload.mediaId` testweise über das zentrale Sound-System ausgeführt werden.

Wichtige Regel: Commands und Kanalpunkte verwenden dieselbe Ausführungskette für Medien:

```text
mediaId -> /api/sound/play Payload
```

Twitch-Schreibzugriffe bleiben weiterhin deaktiviert. Diese Version verändert keine echten Twitch-Rewards.
