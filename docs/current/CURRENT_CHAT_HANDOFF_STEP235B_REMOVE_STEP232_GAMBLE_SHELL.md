# Current Chat Handoff – STEP235B / Remove STEP232 Gamble Shell

Stand: 2026-06-12
Projekt: ForrestCGN / stream-control-center

## Zweck

STEP235B entfernt die unsaubere STEP232-Gamble-Shell-Integration aus der Dashboard-Shell, ohne Backend, APIs, Commands oder Gamble-Standalone-Funktionalität zu verändern.

## Geändert

- `htdocs/dashboard/index.html`
  - entfernt: Include von `/dashboard/modules/loyalty-gamble-shell-card.css`
  - entfernt: Include von `/dashboard/modules/loyalty-gamble-shell-card.js`

## Zum Entfernen im Repo / Zielstand

Diese Dateien gehören nicht mehr zur Zielstruktur und sollen per `git rm` entfernt werden, sofern sie vorhanden sind:

- `htdocs/dashboard/modules/loyalty-gamble-shell-card.js`
- `htdocs/dashboard/modules/loyalty-gamble-shell-card.css`
- `htdocs/dashboard/modules/loyalty-gamble-nav.js`
- `htdocs/dashboard/index.html.step232a_lwg7_3a_backup_20260611_202157`

## Nicht geändert

- Backend
- Datenbank
- APIs
- Commands
- Overlays
- Configs
- Gamble Engine
- Gamble Standalone-Seite `htdocs/dashboard/loyalty-gamble.html`
- `htdocs/dashboard/modules/loyalty-gamble.js`
- `htdocs/dashboard/modules/loyalty-gamble.css`
- Loyalty Core
- Loyalty Games
- Loyalty Giveaways

## Tests

Empfohlen nach Einspielen:

```powershell
node -c .\htdocs\dashboard\app.js
node -c .\htdocs\dashboard\modules\loyalty.js
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
```

Browser-Smoke-Test:

- `/dashboard` lädt
- `Loyalty` links genau einmal sichtbar
- keine Gamble-Shell-Card mehr
- keine 404 auf `loyalty-gamble-shell-card.*`
- keine Browser-Console-Fehler

## Nächster sinnvoller Schritt

STEP235C: Gamble als Tab im zentralen Loyalty-Bereich planen/übernehmen.
