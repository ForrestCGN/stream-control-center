# Current System Status

Channelpoints/Kanalpunkte: v0.7.5 (`eventbus-docs-final-polish`) ist der aktuelle lokale Basisstand. Lokaler Reward-/Redemption-Flow funktioniert, Sound/Video/Text sind vorbereitet/ausführbar, EventBus-Domain-Events sind dokumentiert und eingebunden. Twitch-Sync ist als Readiness-Panel vorbereitet, aber ohne Twitch-Schreibzugriffe.


## Kanalpunkte v0.8.0 — Twitch Auth/Scope Check

- Backend-Version `0.8.0`, Build `twitch-auth-scope-check`.
- Dashboard-Version `0.8.0`, Build `twitch-auth-scope-check`.
- Neue Route `GET /api/channelpoints/twitch/auth-check`.
- Prüft vorhandenen Twitch-User-Token und Scopes über `/api/twitch/auth/validate`.
- Benötigt für Read-only: `channel:read:redemptions` oder `channel:manage:redemptions`.
- Benötigt für spätere Schreibaktionen: `channel:manage:redemptions`.
- Keine Twitch-Schreibzugriffe, keine DB-Schemaänderung.
