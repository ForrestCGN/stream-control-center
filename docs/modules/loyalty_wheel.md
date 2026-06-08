# Loyalty Wheel / CGN Gluecksrad

Stand: 2026-06-08  
Version: 0.1.0  
STEP: LWG-2

## Zweck

Das Loyalty Wheel ist das erste Spiel im neuen `loyalty_games`-System. Es bestimmt Gewinne backendseitig zufaellig/gewichtet und sendet ein Visual-Event an das Overlay.

## Dateien

```text
backend/modules/loyalty_games/wheel.js
backend/modules/loyalty_games/shared.js
config/loyalty_games.json
htdocs/overlays/loyalty/wheel_overlay.html
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
8. Overlay rendert Felder aus Event und dreht auf selectedFieldIndex.
9. Nach durationMs wird Session als finished markiert.
10. Wheel sendet loyalty.wheel.finished.
```

## Overlay

```text
http://127.0.0.1:8080/overlays/loyalty/wheel_overlay.html
```

Overlay-Verhalten:

```text
- verbindet sich per WebSocket mit dem lokalen Backend
- sendet optional hello fuer Diagnose/Client-Registrierung
- wartet auf loyalty.wheel.spin
- nutzt fields[] aus dem Backend-Event
- dreht nur den Felder-Layer
- Center, Aussenring und Pointer bleiben stehen
- zeigt selectedFieldLabel/sub im Winner-Banner
```

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
  "extraTurns": 6,
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
  "action": "finished"
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
# Overlay in Browser/OBS öffnen:
http://127.0.0.1:8080/overlays/loyalty/wheel_overlay.html

# Spin ausloesen:
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/wheel/spin?login=forrestcgn&displayName=ForrestCGN&duration=9000"
$r | Select-Object ok,sessionUid,selectedFieldId,selectedFieldLabel,durationMs
```

## Offene Punkte

```text
- LWG-3: Dashboard/Config-Verwaltung.
- LWG-4: Kosten/Reservierung/Refund.
- LWG-5: Reward-Ausfuehrung.
```
