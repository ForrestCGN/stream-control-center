# CURRENT STATUS – stream-control-center

Stand: 2026-06-08

## Aktueller Schwerpunkt

```text
Loyalty Games / CGN Gluecksrad
```

## Neuer Stand

```text
STEP LWG-2.1 – Wheel Overlay Repeat Spin Fix
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

## Bestaetigter LWG-2 Befund

```text
Erster Dreh im Overlay funktioniert.
Wiederholter Dreh im offenen Overlay brauchte einen Rotationsfix.
```

## Umgesetzt in LWG-2.1

```text
- htdocs/overlays/loyalty/wheel_overlay.html korrigiert
- currentRotation behaelt jetzt volle Gesamtrotation
- wiederholte Spins koennen sichtbar weiter animieren
- Doku aktualisiert
```

## Bewusst nicht umgesetzt

```text
- kein Backend
- keine Punktkosten
- keine Reward-Ausfuehrung
- kein Dashboard
- keine Aenderung an backend/modules/loyalty.js
- keine Aenderung an Watch-Runner/Event-Boni
- keine Queue
- keine Auto-Recovery
```
