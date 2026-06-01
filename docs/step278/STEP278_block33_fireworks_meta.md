# STEP278 Block 33 – Fireworks API MODULE_META

## Ziel

`fireworks_api.js` bekommt saubere Loader-/Status-Metadaten, damit das Modul in `/api/_status` nicht mehr als `version=unknown`, `hasModuleMeta=false`, `type=unknown` erscheint.

## Betroffene Datei

- `backend/modules/fireworks_api.js`

## Änderungen

- `MODULE_META` ergänzt
- `MODULE_VERSION` ergänzt
- `version` Export ergänzt
- `type: "runtime"` gesetzt
- `category: "effects"` gesetzt
- `routesPrefix: ["/api/fireworks"]` dokumentiert
- Bus-/WS-Operationen nur als Metadaten dokumentiert

## Nicht geändert

- Keine Routenänderung
- Keine Fireworks-Logik geändert
- Keine WebSocket-Broadcast-Logik geändert
- Keine Overlay-Logik geändert
- Keine Doppelrouten-Auflösung in diesem Block
- Keine DB-Migration
- Kein Loader-Umbau

## Wichtig

Die bekannten Doppelrouten bleiben in diesem Schritt bewusst bestehen:

- `GET /api/fireworks`
- `GET /api/fireworks/stop`
- `GET /api/fireworks/clear`

Diese werden erst in einem separaten Folgeblock analysiert und sauber bereinigt.
