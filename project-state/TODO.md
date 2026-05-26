# TODO

- [ ] Channelpoints Twitch Token-/Scope-Check read-only
- [ ] Channelpoints Read-only Reward-Sync
- [ ] Channelpoints EventSub Redemption Handler
- [ ] Twitch Fulfill/Cancel/Enable/Disable erst nach gesonderter Freigabe
- [ ] Zentrale Textverwaltung für Commands/Kanalpunkte


## Kanalpunkte v0.8.0 — Twitch Auth/Scope Check

- Backend-Version `0.8.0`, Build `twitch-auth-scope-check`.
- Dashboard-Version `0.8.0`, Build `twitch-auth-scope-check`.
- Neue Route `GET /api/channelpoints/twitch/auth-check`.
- Prüft vorhandenen Twitch-User-Token und Scopes über `/api/twitch/auth/validate`.
- Benötigt für Read-only: `channel:read:redemptions` oder `channel:manage:redemptions`.
- Benötigt für spätere Schreibaktionen: `channel:manage:redemptions`.
- Keine Twitch-Schreibzugriffe, keine DB-Schemaänderung.
