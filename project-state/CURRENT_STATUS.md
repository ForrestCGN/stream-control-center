# CURRENT_STATUS

Channelpoints v0.7.5: lokale Basis mit Safe Modal Editor, Draft-State, Redemption Flow, Text Reward, Twitch-Sync-Readiness und EventBus-Domain-Events. Keine Twitch-Schreibzugriffe.


## Kanalpunkte v0.8.0 — Twitch Auth/Scope Check

- Backend-Version `0.8.0`, Build `twitch-auth-scope-check`.
- Dashboard-Version `0.8.0`, Build `twitch-auth-scope-check`.
- Neue Route `GET /api/channelpoints/twitch/auth-check`.
- Prüft vorhandenen Twitch-User-Token und Scopes über `/api/twitch/auth/validate`.
- Benötigt für Read-only: `channel:read:redemptions` oder `channel:manage:redemptions`.
- Benötigt für spätere Schreibaktionen: `channel:manage:redemptions`.
- Keine Twitch-Schreibzugriffe, keine DB-Schemaänderung.
