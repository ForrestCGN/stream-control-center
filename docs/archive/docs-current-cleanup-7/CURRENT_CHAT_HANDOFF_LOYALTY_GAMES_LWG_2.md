# CURRENT CHAT HANDOFF – Loyalty Games / Wheel LWG-2

Stand: 2026-06-08

## Kurzstatus

```text
STEP LWG-2 – Wheel Overlay an Backend-Event angebunden.
```

## Bestaetigt

```text
LWG-1 Backend laeuft im Live-System.
Statusroute ok.
Spin-Test ok.
```

## Neu in LWG-2

```text
htdocs/overlays/loyalty/wheel_overlay.html
htdocs/assets/images/loyalty/wheel/*.png
```

## Overlay-Flow

```text
1. Overlay verbindet sich per WebSocket.
2. Backend sendet loyalty.wheel.spin.
3. Overlay rendert fields[] aus dem Event.
4. Overlay dreht nur den Felder-Layer.
5. Overlay stoppt auf selectedFieldIndex.
6. Winner-Banner zeigt selectedFieldLabel/sub.
```

## Nicht geaendert

```text
Backend bleibt LWG-1.
Keine Punktkosten.
Keine Reward-Ausfuehrung.
Kein Dashboard.
Keine Aenderung an loyalty.js.
```

## Tests nach StepDone

```text
http://127.0.0.1:8080/overlays/loyalty/wheel_overlay.html
```

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/wheel/spin?login=forrestcgn&displayName=ForrestCGN&duration=9000"
$r | Select-Object ok,sessionUid,selectedFieldId,selectedFieldLabel,durationMs
```

## Naechster Schritt

```text
STEP LWG-3 – Dashboard/Config-Verwaltung planen
```
