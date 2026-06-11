# loyalty_games – Gamble Dashboard UI Stand STEP230

## Backend-Stand

Erwartet wird weiterhin:

- `loyalty_games.js` Version `0.2.7`
- Build `STEP_LWG_6_9_GAMBLE_DASHBOARD_WRITE_API`

## UI-Stand

STEP230 bringt eine kompaktere UI fuer:

- Status-Karten: Engine, Command, Chance, Cooldown
- gruppierte Konfiguration
- Statistik-Karten aus Command-Logs
- Audit-Kurzliste
- Dryrun + Confirm Write

## API-Nutzung

- `GET /api/loyalty/games/gamble/dashboard-config`
- `POST /api/loyalty/games/gamble/dashboard-config`
- `GET /api/loyalty/games/gamble/dashboard-audit?limit=8`
- `GET /api/commands/logs?limit=80`

## Sicherheit

Die UI speichert keine Secrets. Schreibschutz liegt weiterhin im Backend.
