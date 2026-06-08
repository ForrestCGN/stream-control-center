# Loyalty Games Modul

Stand: 2026-06-08  
Version: 0.1.0  
STEP: LWG-3

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
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
htdocs/dashboard/index.html
docs/modules/loyalty_games.md
docs/modules/loyalty_wheel.md
```

## Version / moduleVersion

```text
module: loyalty_games
moduleVersion: 0.1.0
moduleBuild: STEP_LWG_1
```

LWG-3 aendert nur Dashboard/Doku. Die Backend-Modulversion bleibt unveraendert.

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

## Dashboard-Anbindung

Dateien:

```text
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
htdocs/dashboard/index.html
```

Einordnung:

```text
Community -> Loyalty Games
```

Der Stand ist bewusst read-only, weil das Dashboard spaeter ohnehin groesser umgebaut wird.

Anzeigen:

```text
- Modulstatus
- Wheel-Status
- DB-/Schema-Diagnose
- aktive Session
- letztes Ergebnis
- Feldliste mit Gewichtung und Reward-Vorbereitung
- letzte Sessions
- Routen/Hinweise
```

## Config

Datei:

```text
config/loyalty_games.json
```

Dashboard schreibt in LWG-3 keine Config.

## Datenbanktabellen

### loyalty_game_sessions

Speichert einzelne Spiel-/Wheel-Sessions und das backendseitig festgelegte Ergebnis.

## WebSocket / EventBus / Events

Gesendete Events:

```text
loyalty.wheel.spin
loyalty.wheel.finished
loyalty.wheel.reset
```

Der Communication Bus wird in LWG-3 nicht als produktive Pflichtschicht genutzt und keine bestehenden Bus-Flows werden ersetzt.

## Overlay-Anbindung

Overlay:

```text
htdocs/overlays/loyalty/wheel_overlay.html
```

Dashboard-Link:

```text
Glücksrad-Overlay öffnen
```

## Bekannte Risiken / Altlasten

```text
- Dashboard-Navigation ist vorlaeufig.
- Config-Edit ist noch nicht aktiv.
- Punktkosten sind deaktiviert.
- Reward-Ausfuehrung ist noch nicht produktiv aktiv.
- Queue ist noch nicht implementiert.
```

## Tests

```powershell
.\stepdone.cmd "STEP LWG-3 Loyalty Games Dashboard Readonly"
```

Dashboard:

```text
http://127.0.0.1:8080/dashboard
Community -> Loyalty Games
```

API:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/status"
$s | Select-Object ok,module,moduleVersion,enabled,routeCount,lastError

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/sessions?gameKey=wheel&limit=10"
$r.rows | Select-Object sessionUid,gameKey,status,selectedFieldLabel,durationMs,createdAt | Format-Table -AutoSize
```

## Offene Punkte

```text
- LWG-4: Kosten/Reservierung/Refund.
- LWG-5: Reward-Ausfuehrung.
- Dashboard-Gesamtumbau spaeter.
```
