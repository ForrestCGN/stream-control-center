# Loyalty Wheel / CGN Gluecksrad

Stand: 2026-06-08  
Version: 0.1.0  
STEP: LWG-1

## Zweck

Das Loyalty Wheel ist das erste Spiel im neuen `loyalty_games`-System. Es bestimmt Gewinne backendseitig zufaellig/gewichtet und sendet ein Visual-Event an das Overlay.

## Dateien

```text
backend/modules/loyalty_games/wheel.js
backend/modules/loyalty_games/shared.js
config/loyalty_games.json
htdocs/overlays/loyalty/wheel_overlay.html   # ab LWG-2
htdocs/assets/images/loyalty/wheel/*.png
```

## Grundregel

Der Gewinn wird immer im Backend bestimmt.

Nicht erlaubt:

```text
Overlay dreht und entscheidet danach selbst den Gewinn.
```

Erlaubt:

```text
Backend waehlt Gewinner -> Overlay visualisiert exakt dieses Ergebnis.
```

## Spin-Flow

```text
1. API-Request kommt an /api/loyalty/games/wheel/spin.
2. Wheel prueft enabled/config.
3. Wheel blockiert, wenn schon ein Spin aktiv ist.
4. Wheel normalisiert aktive Felder.
5. Wheel zieht Gewinner mit crypto.randomInt und Gewichtung.
6. Wheel schreibt Session in loyalty_game_sessions.
7. Wheel sendet loyalty.wheel.spin per WebSocket.
8. Nach durationMs wird Session als finished markiert.
9. Wheel sendet loyalty.wheel.finished.
```

## Feld-Config

Beispiel:

```json
{
  "id": "sound_free",
  "label": "Sound",
  "sub": "frei",
  "weight": 1,
  "enabled": true,
  "reward": {
    "type": "manual",
    "amount": 0
  },
  "colorA": "#d03cff",
  "colorB": "#18d6ff"
}
```

## Gewichtung

```text
weight: 1 = normale Chance
weight: 2 = doppelte Chance
weight: 0 oder enabled:false = nicht aktiv
```

## Laufzeit

Standard aus Config:

```text
games.wheel.spin.defaultDurationMs
```

Request-Override:

```text
duration
durationMs
ms
```

Beispiel:

```text
/api/loyalty/games/wheel/spin?login=forrestcgn&duration=9000
```

Die Dauer wird zwischen `minDurationMs` und `maxDurationMs` begrenzt.

## Gleichzeitigkeit

LWG-1:

```text
oneActiveSpinOnly = true
```

Wenn ein Spin laeuft, wird ein weiterer Request mit `wheel_spin_already_running` abgelehnt.

## Kosten / Rewards

In LWG-1 noch nicht produktiv aktiv.

Config vorbereitet:

```json
"cost": {
  "enabled": false,
  "amount": 0
}
```

Reward-Felder sind nur vorbereitet. Es wird noch nichts gebucht und kein Reward ausgefuehrt.

## WebSocket Event

Spin:

```json
{
  "type": "loyalty.wheel.spin",
  "module": "loyalty_games",
  "game": "wheel",
  "action": "started",
  "sessionUid": "...",
  "durationMs": 9000,
  "fields": [],
  "selectedFieldIndex": 4,
  "selectedFieldId": "sound_free",
  "selectedFieldLabel": "Sound"
}
```

Finished:

```json
{
  "type": "loyalty.wheel.finished",
  "module": "loyalty_games",
  "game": "wheel",
  "action": "finished",
  "sessionUid": "...",
  "selectedFieldId": "sound_free"
}
```

Reset:

```json
{
  "type": "loyalty.wheel.reset",
  "module": "loyalty_games",
  "game": "wheel",
  "action": "reset"
}
```

## Tests

```powershell
$w = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/wheel/status"
$w | Select-Object ok,game,enabled,running,lastError

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/wheel/spin?login=forrestcgn&displayName=ForrestCGN&duration=9000"
$r | Select-Object ok,sessionUid,selectedFieldId,selectedFieldLabel,durationMs
```

## Offene Punkte

```text
- LWG-2: echtes Overlay auf Event umbauen.
- LWG-3: Dashboard-Config.
- LWG-4: Kosten/Reservierung/Refund.
- LWG-5: Reward-Ausfuehrung.
```
