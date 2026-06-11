# loyalty_games – STEP229 / LWG-7.0

## Aktueller Stand

- Runtime: `loyalty_games.js 0.2.7`
- Build: `STEP_LWG_6_9_GAMBLE_DASHBOARD_WRITE_API`
- `!gamble` ist live aktiv.
- Gamble-Konfiguration ist per API lesbar und schreibbar.
- Echte Writes brauchen Rollenfreigabe und `confirmWrite=true`.
- Audit erfolgt in `loyalty_games_dashboard_audit`.

## STEP229

Neu hinzugekommen sind statische UI-Dateien:

- `htdocs/dashboard/loyalty-gamble.html`
- `htdocs/dashboard/modules/loyalty-gamble.js`
- `htdocs/dashboard/modules/loyalty-gamble.css`

Die UI nutzt:

- `GET /api/loyalty/games/gamble/dashboard-config`
- `POST /api/loyalty/games/gamble/dashboard-config`
- `GET /api/loyalty/games/gamble/dashboard-audit?limit=10`

Keine bestehende Funktionalitaet wurde entfernt.
