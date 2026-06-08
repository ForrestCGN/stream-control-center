# Loyalty Games Modul

Stand: 2026-06-08  
Version: 0.1.0  
STEP: LWG-2

## Zweck

`loyalty_games` ist das Host-Modul fuer Spiele innerhalb des bestehenden Loyalty-Systems. Es verhindert, dass einzelne Spiele direkt in `backend/modules/loyalty.js` wachsen.

Das erste Spiel ist das Gluecksrad (`wheel`).

## Dateien

```text
backend/modules/loyalty_games.js
backend/modules/loyalty_games/shared.js
backend/modules/loyalty_games/wheel.js
config/loyalty_games.json
htdocs/overlays/loyalty/wheel_overlay.html
htdocs/assets/images/loyalty/wheel/wheel_ring.png
htdocs/assets/images/loyalty/wheel/wheel_center.png
htdocs/assets/images/loyalty/wheel/pointer.png
htdocs/assets/images/loyalty/wheel/winner_banner.png
docs/modules/loyalty_games.md
docs/modules/loyalty_wheel.md
```

## Version / moduleVersion

```text
module: loyalty_games
moduleVersion: 0.1.0
moduleBuild: STEP_LWG_1
```

LWG-2 aendert nur Overlay/Doku/Assets. Die Backend-Modulversion bleibt unveraendert.

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

## Datenbanktabellen

### loyalty_game_sessions

Speichert einzelne Spiel-/Wheel-Sessions und das backendseitig festgelegte Ergebnis.

## WebSocket / EventBus / Events

LWG-2 nutzt das vorhandene WebSocket-Broadcast aus `server.js`.

Overlay hoert auf:

```text
loyalty.wheel.spin
loyalty.wheel.finished
loyalty.wheel.reset
```

Der Communication Bus wird nicht als produktive Pflichtschicht genutzt und keine bestehenden Bus-Flows werden ersetzt.

## Overlay-Anbindung

Overlay:

```text
htdocs/overlays/loyalty/wheel_overlay.html
```

Funktionen:

```text
- dunkler CGN-Hintergrund
- vorhandene Wheel-Assets
- WebSocket-Verbindung
- Felder aus Backend-Event
- Spin auf selectedFieldIndex
- Center, Aussenring und Pointer bleiben statisch
- Winner-Banner zeigt Ergebnis
```

## Dashboard-Anbindung

In LWG-2 noch nicht enthalten.

## Tests

```powershell
# nach StepDone / Live-Deploy:
http://127.0.0.1:8080/overlays/loyalty/wheel_overlay.html

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/wheel/spin?login=forrestcgn&displayName=ForrestCGN&duration=9000"
$r | Select-Object ok,sessionUid,selectedFieldId,selectedFieldLabel,durationMs
```

## Offene Punkte

```text
- LWG-3: Dashboard/Config-Verwaltung planen.
- LWG-4: Kosten/Reservierung/Refund sauber planen.
- LWG-5: Reward-Ausfuehrung je Feld planen.
```
