# FILES – CAN-44.21 Shoutout-System

## Zuletzt betroffene Dateien

### Backend

- `backend/modules/clip_shoutout.js`
  - Modulversion zuletzt: `0.2.40`
  - enthält Shoutout-Backend, Direct-Intake, DisplayQueue, OfficialQueue, AutoShoutout, Settings-API und Textintegration.

### Dashboard

- `htdocs/dashboard/index.html`
  - altes Shoutout-Dashboard wurde aus der aktiven Einbindung entfernt.
  - `shoutout_v2.js/css` ist produktiv als Shoutout-Dashboard aktiv.

- `htdocs/dashboard/modules/shoutout_v2.js`
  - produktives Shoutout-Dashboard.
  - Settings editierbar.
  - Tooltips/Hilfen.
  - AutoShoutout-Instant-Trigger-Settings.

- `htdocs/dashboard/modules/shoutout_v2.css`
  - Styles für Shoutout-Dashboard, Settings-Layout und Help-Tooltips.

## Bewusst nicht mehr aktiv im Dashboard

- `htdocs/dashboard/modules/shoutout.js`
- `htdocs/dashboard/modules/shoutout.css`

Diese Dateien können noch im Projekt existieren, werden aber durch den aktuellen `index.html`-Stand nicht mehr geladen.

## Wichtige APIs

- `GET /api/clip-shoutout/status`
- `GET /api/clip-shoutout/settings`
- `POST /api/clip-shoutout/settings`
- `POST /api/clip-shoutout/run`
- `GET /api/clip-shoutout/queue`
- `POST /api/clip-shoutout/display-queue/retry`
- `POST /api/clip-shoutout/display-queue/remove`
- `POST /api/clip-shoutout/queue/retry`
- `POST /api/clip-shoutout/queue/remove`
- `GET /api/clip-shoutout/official/auth-status`
- `GET/POST /api/clip-shoutout/auto/settings`

## Datenquellen

- Chatcommands über `command_definitions`.
- Shoutout-Modulconfig über bestehende Config-/Settings-API.
- Produktive SQLite-Datenbank nicht als Datei austauschen.
