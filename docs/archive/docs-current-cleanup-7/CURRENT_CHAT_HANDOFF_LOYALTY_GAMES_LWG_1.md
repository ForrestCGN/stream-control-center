# CURRENT CHAT HANDOFF – Loyalty Games / Wheel LWG-1

Stand: 2026-06-08

## Kurzstatus

```text
STEP LWG-1 – Backend-Grundsystem fuer Loyalty Games / Gluecksrad gebaut.
```

## Neue Architektur

```text
backend/modules/loyalty_games.js
backend/modules/loyalty_games/shared.js
backend/modules/loyalty_games/wheel.js
```

`loyalty_games.js` ist das Top-Level-Modul fuer den vorhandenen Server-Loader. `wheel.js` ist das erste Submodul fuer das Gluecksrad.

## Wichtig

```text
backend/modules/loyalty.js wurde nicht geaendert.
Keine Punktkosten.
Keine Reward-Ausfuehrung.
Kein Dashboard.
```

## Neue API

```text
GET  /api/loyalty/games/status
GET  /api/loyalty/games/config
GET  /api/loyalty/games/routes
GET  /api/loyalty/games/sessions
GET  /api/loyalty/games/wheel/status
GET  /api/loyalty/games/wheel/config
GET  /api/loyalty/games/wheel/spin
POST /api/loyalty/games/wheel/spin
POST /api/loyalty/games/wheel/reset
```

## Neue DB-Tabelle

```text
loyalty_game_sessions
```

## Naechster Schritt

```text
STEP LWG-2 – htdocs/overlays/loyalty/wheel_overlay.html an Backend-Event loyalty.wheel.spin anbinden.
```

## Tests nach Entpacken

```powershell
node -c backend\modules\loyalty_games.js
node -c backend\modules\loyalty_games\shared.js
node -c backend\modules\loyalty_games\wheel.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/status"
$s | Select-Object ok,module,moduleVersion,enabled,routeCount,lastError

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/wheel/spin?login=forrestcgn&displayName=ForrestCGN&duration=9000"
$r | Select-Object ok,sessionUid,selectedFieldId,selectedFieldLabel,durationMs
```
