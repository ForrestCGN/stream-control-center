# Loyalty Wheel / CGN Gluecksrad

Stand: 2026-06-08  
Version: 0.1.0  
STEP: LWG-3

## Zweck

Das Loyalty Wheel ist das erste Spiel im neuen `loyalty_games`-System. Es bestimmt Gewinne backendseitig zufaellig/gewichtet und sendet ein Visual-Event an das Overlay.

## Dateien

```text
backend/modules/loyalty_games/wheel.js
backend/modules/loyalty_games/shared.js
config/loyalty_games.json
htdocs/overlays/loyalty/wheel_overlay.html
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
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

## Dashboard

LWG-3 bringt eine read-only Dashboard-Ansicht:

```text
Loyalty -> Loyalty Games
```

Anzeige:

```text
- Wheel Status
- aktive Session
- letztes Ergebnis
- Felder/Gewichte
- Reward-Vorbereitung
- letzte Sessions
```

Keine Save-Buttons, keine produktiven Testbuttons, keine Kosten-/Reward-Ausfuehrung.

## Tests

```text
http://127.0.0.1:8080/dashboard
Loyalty -> Loyalty Games
```

Spin API:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/wheel/spin?login=forrestcgn&displayName=ForrestCGN&duration=5000"
$r | Select-Object ok,sessionUid,selectedFieldId,selectedFieldLabel,durationMs
```

## Offene Punkte

```text
- LWG-4: Kosten/Reservierung/Refund.
- LWG-5: Reward-Ausfuehrung.
- Dashboard-Gesamtumbau spaeter.
```
