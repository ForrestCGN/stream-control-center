# NEXT_STEPS

1. Twitch Token-/Scope-Check read-only anbinden.
2. Read-only Twitch Reward-Sync bauen.
3. Lokale Rewards mit Twitch Reward-IDs mappen.
4. EventSub-Redemption-Handler anbinden und auf die bestehenden EventBus-Domain-Events aufsetzen.
5. Danach erst Fulfill/Cancel/Enable/Disable als echte Twitch-Schreibaktionen planen.
6. Zentrale Textverwaltung für Commands/Kanalpunkte bauen.


## Kanalpunkte v0.8.0 — Twitch Auth/Scope Check

- Backend-Version `0.8.0`, Build `twitch-auth-scope-check`.
- Dashboard-Version `0.8.0`, Build `twitch-auth-scope-check`.
- Neue Route `GET /api/channelpoints/twitch/auth-check`.
- Prüft vorhandenen Twitch-User-Token und Scopes über `/api/twitch/auth/validate`.
- Benötigt für Read-only: `channel:read:redemptions` oder `channel:manage:redemptions`.
- Benötigt für spätere Schreibaktionen: `channel:manage:redemptions`.
- Keine Twitch-Schreibzugriffe, keine DB-Schemaänderung.
