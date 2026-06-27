# Route Diagnostics

Stand: 2026-06-01
Quelle: letzter `/api/_status` nach STEP278 Block 34b.

## Ergebnis

```text
totalRoutes: 1148
duplicateRoutes: 0
```

## Status

```text
Keine Doppelrouten vorhanden.
```

## Fireworks-Aufraeumung

Vor Block 34b wurden folgende Routen sowohl in `server.js` als auch in `fireworks_api.js` registriert:

```text
GET /api/fireworks
GET /api/fireworks/stop
GET /api/fireworks/clear
```

Nach Block 34b ist `fireworks_api.js` alleiniger Besitzer. Die URLs bleiben unveraendert und sollen weiter von Streamer.bot/Overlays genutzt werden.

## Pruef-URLs

```text
/api/_status
/api/fireworks?mode=burst&intensity=10&duration_ms=3000
/api/fireworks/stop
/api/fireworks/clear
```
