# Channelpoints / Kanalpunkte

Aktueller Stand: v0.7.4 (`twitch-sync-readiness`)

## Erledigt
- Lokale Kategorien und Rewards in SQLite
- Modal-Editor analog Commands
- Draft-State bleibt beim MediaPicker stabil
- Sound/Video über bestehendes Media-System und `/api/sound/play`
- Text-Rewards lokal ausführbar und im Redemption-Ergebnis speicherbar
- Redemption-Testflow mit `channelpoints_redemptions`
- Dashboard-Verlauf für Einlösungen/Testverlauf
- Twitch-Sync-Readiness-Panel ohne Schreibzugriffe

## Wichtige Routen
- `GET /api/channelpoints/status`
- `GET /api/channelpoints/rewards`
- `POST /api/channelpoints/rewards`
- `PUT /api/channelpoints/rewards/:idOrKey`
- `POST /api/channelpoints/rewards/:idOrKey/delete`
- `GET /api/channelpoints/redemptions?limit=25`
- `POST /api/channelpoints/redemptions/test`
- `POST /api/channelpoints/rewards/:idOrKey/execute`
- `GET /api/channelpoints/twitch-status`
- `GET /api/channelpoints/twitch/readiness`

## Twitch-Regel
Bis einschließlich v0.7.4 werden keine Twitch-Rewards geschrieben, gelöscht oder deaktiviert. Alle Änderungen sind lokal. Der Twitch-Bereich zeigt nur Bereitschaft, Scopes und geplanten Flow.
