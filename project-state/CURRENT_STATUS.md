# CURRENT STATUS – stream-control-center

Stand: 2026-06-08

## Aktueller Schwerpunkt

```text
Loyalty Games / CGN Gluecksrad
```

## Neuer Stand

```text
STEP LWG-2 – Wheel Overlay an Backend-Event angebunden
```

## Bestaetigter Live-Test LWG-1

```text
loyalty_games geladen
moduleVersion 0.1.0
enabled True
routeCount 9
lastError leer
Spin-Test erfolgreich
```

## Umgesetzt in LWG-2

```text
- Overlay htdocs/overlays/loyalty/wheel_overlay.html
- dunkler CGN-Hintergrund
- vorhandene Wheel-Assets eingebunden
- WebSocket-Verbindung
- Event-Handling fuer loyalty.wheel.spin
- Event-Handling fuer loyalty.wheel.finished
- Event-Handling fuer loyalty.wheel.reset
- Felder werden aus Backend-Event gerendert
- Spin dreht exakt auf selectedFieldIndex
- Winner-Banner zeigt Backend-Ergebnis
```

## Bewusst nicht umgesetzt

```text
- keine Punktkosten
- keine Reward-Ausfuehrung
- kein Dashboard
- keine Aenderung an backend/modules/loyalty.js
- keine Aenderung an Watch-Runner/Event-Boni
- keine Queue
- keine Auto-Recovery
```
