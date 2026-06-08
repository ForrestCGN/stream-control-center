# Loyalty Games Modul

Stand: 2026-06-08  
Version: 0.1.0  
STEP: LWG-1

## Zweck

`loyalty_games` ist das Host-Modul fuer Spiele innerhalb des bestehenden Loyalty-Systems. Es soll verhindern, dass einzelne Spiele direkt in `backend/modules/loyalty.js` wachsen.

Das erste Spiel ist das Gluecksrad (`wheel`).

## Dateien

```text
backend/modules/loyalty_games.js
backend/modules/loyalty_games/shared.js
backend/modules/loyalty_games/wheel.js
config/loyalty_games.json
docs/modules/loyalty_games.md
docs/modules/loyalty_wheel.md
```

## Version / moduleVersion

```text
module: loyalty_games
moduleVersion: 0.1.0
moduleBuild: STEP_LWG_1
```

## API-Routen

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

## Exporte / Init-Funktionen

`backend/modules/loyalty_games.js` exportiert:

```text
MODULE_META
MODULE_VERSION
version
init(ctx)
_private.DEFAULT_CONFIG
_private.buildStatus
_private.loadConfig
_private.ensureSchema
```

## Config

Datei:

```text
config/loyalty_games.json
```

Wichtigste Felder:

```text
enabled
games.wheel.enabled
games.wheel.cost.enabled
games.wheel.cost.amount
games.wheel.spin.defaultDurationMs
games.wheel.spin.minDurationMs
games.wheel.spin.maxDurationMs
games.wheel.spin.oneActiveSpinOnly
games.wheel.fields[]
```

## Datenbanktabellen

### loyalty_game_sessions

Wird per `CREATE TABLE IF NOT EXISTS` angelegt.

Zweck:

```text
Speichert einzelne Spiel-/Wheel-Sessions und das backendseitig festgelegte Ergebnis.
```

Wichtige Felder:

```text
session_uid
game_key
user_login
user_display_name
status
source
duration_ms
selected_field_id
selected_field_index
selected_field_label
cost_amount
mode
started_at
finished_at
metadata_json
```

## WebSocket / EventBus / Events

V1 nutzt den vorhandenen `broadcastWS` aus `server.js`.

Gesendete Events:

```text
loyalty.wheel.spin
loyalty.wheel.finished
loyalty.wheel.reset
```

Der Communication Bus wird in LWG-1 nicht als produktive Pflichtschicht genutzt und keine bestehenden Bus-Flows werden ersetzt.

## Dashboard-Anbindung

In LWG-1 noch nicht enthalten.

Geplanter spaeterer Schritt:

```text
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
```

## Overlay-Anbindung

In LWG-1 wird nur das Backend-Event vorbereitet.

Geplanter naechster Schritt:

```text
htdocs/overlays/loyalty/wheel_overlay.html
```

## Abhaengigkeiten

```text
backend/modules/helpers/helper_core.js
backend/modules/helpers/helper_config.js
backend/modules/helpers/helper_routes.js
backend/core/database.js
backend/server.js Modul-Loader
```

## Diagnose / Registry

`diagnostics.js` enthaelt einen Registry-Eintrag:

```text
key: loyalty_games
status: /api/loyalty/games/status
```

Statusroute liefert Standardfelder:

```text
ok
module
moduleVersion
moduleBuild
version
enabled
routeCount
lastError
diagnostics
```

## Bekannte Risiken / Altlasten

```text
- Punktkosten sind in LWG-1 deaktiviert.
- Reward-Ausfuehrung ist noch nicht produktiv aktiv.
- Queue ist noch nicht implementiert; V1 erlaubt nur einen aktiven Spin.
- Overlay-ACKs sind noch nicht Pflicht.
```

## Tests

```powershell
node -c backend\modules\loyalty_games.js
node -c backend\modules\loyalty_games\shared.js
node -c backend\modules\loyalty_games\wheel.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/status"
$s | Select-Object ok,module,moduleVersion,enabled,routeCount,lastError

$w = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/wheel/status"
$w | Select-Object ok,game,enabled,running,lastError

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/wheel/spin?login=forrestcgn&displayName=ForrestCGN&duration=9000"
$r | Select-Object ok,sessionUid,selectedFieldId,selectedFieldLabel,durationMs

$reg = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$reg.coverage | Select-Object ok,registryEntries,loadedModules,coveredLoadedModules,missingLoadedModules,registryOnlyEntries
```

## Offene Punkte

```text
- LWG-2: Overlay an Backend-Event anbinden.
- LWG-3: Dashboard/Config-Verwaltung planen.
- LWG-4: Kosten/Reservierung/Refund sauber planen.
- LWG-5: Reward-Ausfuehrung je Feld planen.
```
