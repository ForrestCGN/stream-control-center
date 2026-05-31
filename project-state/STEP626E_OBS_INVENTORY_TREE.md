# STEP626E – OBS-Inventar mit Struktur-Tab

## Ziel

Das Overlay-Monitoring bekommt ein zentrales OBS-Inventar, damit nicht nur einzelne Quellen geraten werden, sondern die wirklich in OBS genutzte Struktur logisch sichtbar wird.

## Geändert

- `backend/modules/overlay_monitor.js`
- `htdocs/dashboard/modules/overlays.js`
- `htdocs/dashboard/modules/overlays.css`
- `project-state/STEP626E_OBS_INVENTORY_TREE.md`
- `docs/current/OVERLAY_MONITORING_STEP626E.md`

## Neue API

```text
GET /api/overlay-monitor/obs-inventory
GET /api/overlay-monitor/obs-inventory?refresh=1
GET /api/overlay-monitor/obs-inventory?cache=1
```

## Verhalten

- Backend liest OBS-Szenen, verschachtelte Szenen, Browserquellen und URLs aus.
- Das Inventar wird im RAM gehalten.
- Erfolgreiche Inventare werden in SQLite als letzter Stand gespeichert.
- Wenn OBS nicht erreichbar ist, kann der letzte gespeicherte Stand weiter angezeigt werden.
- Dashboard bekommt den neuen Tab `OBS-Inventar`.
- Die Struktur wird als Baum angezeigt.
- CGN, externe Quellen und Platzhalter werden getrennt bewertet.

## Nicht enthalten

- keine OBS-Aktionen
- keine Reparaturbuttons
- kein Cache-Refresh von Browserquellen
- keine Dateien löschen
- keine Heartbeat-Historie

## Test

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\overlay_monitor.js
node --check htdocs\dashboard\modules\overlays.js
.\stepdone.cmd "STEP626E OBS-Inventar mit Struktur-Tab"
```

Danach Backend neu starten, Dashboard hart neu laden und `Control → Overlays → OBS-Inventar` prüfen.
