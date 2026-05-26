# FILES

## Channelpoints v0.7.5
- backend/modules/channelpoints.js
- htdocs/dashboard/modules/channelpoints.js
- htdocs/dashboard/modules/channelpoints.css
- docs/modules/channelpoints-deep-dive.md
- docs/current/CURRENT_SYSTEM_STATUS.md
- project-state/CHANNELPOINTS_EVENTBUS_DOCS_FINAL_POLISH_v0.7.5.md


## Kanalpunkte v0.8.0 — Twitch Auth/Scope Check

- Backend-Version `0.8.0`, Build `twitch-auth-scope-check`.
- Dashboard-Version `0.8.0`, Build `twitch-auth-scope-check`.
- Neue Route `GET /api/channelpoints/twitch/auth-check`.
- Prüft vorhandenen Twitch-User-Token und Scopes über `/api/twitch/auth/validate`.
- Benötigt für Read-only: `channel:read:redemptions` oder `channel:manage:redemptions`.
- Benötigt für spätere Schreibaktionen: `channel:manage:redemptions`.
- Keine Twitch-Schreibzugriffe, keine DB-Schemaänderung.
