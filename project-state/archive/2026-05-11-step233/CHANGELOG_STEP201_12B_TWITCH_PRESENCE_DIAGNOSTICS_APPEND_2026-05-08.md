# CHANGELOG Append – STEP201.12b Twitch-Presence

## 2026-05-08

- Added Twitch-Presence diagnostic endpoints under `/api/twitch/presence`.
- Added non-destructive `POST /api/twitch/presence/reload`.
- Kept existing Twitch IRC start, stop, status and send behavior unchanged.
- Kept legacy `/twitch/presence/...` routes unchanged.
