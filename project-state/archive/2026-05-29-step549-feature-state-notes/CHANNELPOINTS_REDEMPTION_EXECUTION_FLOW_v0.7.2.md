# Channelpoints v0.7.2 — Redemption Execution Flow

Stand: 2026-05-26

## Ziel

Kanalpunkte sind jetzt nicht nur lokal konfigurierbar, sondern können testweise als lokale Einlösung ausgeführt und im Verlauf gespeichert werden.

## Backend

- `backend/modules/channelpoints.js`
- `MODULE_VERSION = 0.7.2`
- `MODULE_BUILD = redemption-execution-flow`

Neue/erweiterte Routen:

- `GET /api/channelpoints/redemptions?limit=25`
- `POST /api/channelpoints/redemptions/test`
- `GET /api/channelpoints/redemptions/test?reward=<key>`
- bestehend: `POST /api/channelpoints/rewards/:idOrKey/execute`

## Dashboard

- `htdocs/dashboard/modules/channelpoints.js`
- `UI_VERSION = 0.7.2`
- `UI_BUILD = redemption-execution-flow`

Ergänzt:

- Einlösungen-/Testverlauf im Dashboard
- Buttons je Reward: Prüfen / Testen
- Verlauf zeigt Reward, User, Zeitpunkt und Status

## Sicherheit

- keine Twitch-Schreibzugriffe
- `twitchWrite = false`
- bestehende SQLite-Datenbank wird nur erweitert/genutzt, nicht ersetzt
