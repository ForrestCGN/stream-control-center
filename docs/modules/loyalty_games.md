# Loyalty Games

Stand: STEP233 / Project Audit nach STEP232

## Bestätigter Runtime-Stand

`loyalty_games.js` wurde in den letzten bestätigten Tests mit folgender Version gemeldet:

- Version: `0.2.7`
- Build: `STEP_LWG_6_9_GAMBLE_DASHBOARD_WRITE_API`

## Gamble Status

- `!gamble` ist live aktiv.
- Gamble-Engine ist live aktiv.
- User-Cooldown wurde nach Tests wieder auf 60 Sekunden gesetzt.
- Prozent-Einsatz wurde bestätigt, z. B. `!gamble 10%`.
- `crypto.randomInt` wird als serverseitige Zufallsquelle verwendet.
- Strukturierte Ergebnisfelder wurden bestätigt.

## Dashboard APIs

### Readonly

`GET /api/loyalty/games/gamble/dashboard-config`

Liefert u. a.:

- Status
- Settings
- Command-Snapshot
- Textkeys
- Safety-Hinweise

### Write

`POST /api/loyalty/games/gamble/dashboard-config`

Bestätigte Eigenschaften:

- Viewer wird mit HTTP 403 abgelehnt.
- Streamer/Owner darf schreiben.
- `confirmWrite=true` wird für echte Writes erwartet.
- Dryrun ohne Mutation funktioniert.
- Restore-Test wurde bestätigt.

### Audit

`GET /api/loyalty/games/gamble/dashboard-audit`

Audit-Tabelle:

`loyalty_games_dashboard_audit`

## Dashboard Detailseite

- Standalone-Seite: `/dashboard/loyalty-gamble.html`
- HTTP 200 wurde bestätigt.
- Route-Attribut `data-dashboard-route="loyalty-gamble"` wurde bestätigt.

## Auditpflichtig

STEP232 Dashboard-Shell-Integration darf nicht als Basis für weitere Dashboard-Arbeiten verwendet werden, bevor die echte Dashboard-Struktur geprüft wurde.

## Nicht geändert

Dieser STEP233-Doku-Stand ändert keinen Runtime-Code.
