# STEP278 Block 34b – Fireworks Route Owner Cleanup

## Ziel

Die drei Fireworks-Routen werden nicht mehr doppelt registriert. `fireworks_api.js` bleibt der alleinige Besitzer der öffentlichen Fireworks-URLs.

## Betroffene Datei

- `backend/server.js`

## Entfernt aus `server.js`

- `GET /api/fireworks`
- `GET /api/fireworks/stop`
- `GET /api/fireworks/clear`

## Bleibt unverändert aktiv in `fireworks_api.js`

- `GET /api/fireworks`
- `GET /api/fireworks/stop`
- `GET /api/fireworks/clear`

## Warum

Die Routen waren sowohl in `server.js` als auch in `backend/modules/fireworks_api.js` registriert. Das erzeugte in `/api/_status` drei Duplicate-Route-Meldungen.

## Keine Funktionsänderung

Die öffentlichen URLs bleiben gleich. Streamer.bot und Overlays können weiterhin dieselben Endpunkte verwenden.

## Erwarteter Status nach Deploy + Node-Neustart

- `fireworks_api.js` bleibt `hasModuleMeta=true`, `type=runtime`.
- `routeDiagnostics.duplicateRoutes` sollte leer sein.
- `obs_shared.js` bleibt weiterhin korrekt `skipped` mit `reason=no_init_export`.

## Prüfkommandos

```powershell
node --check backend\server.js
```
