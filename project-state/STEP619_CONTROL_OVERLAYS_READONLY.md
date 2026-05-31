# STEP619 – Control → Overlays Read-only

## Ziel

Der vorbereitete Dashboard-Bereich `Control → Overlays` wird aktiviert und zeigt zunächst nur den echten Online-/Offline-Status von Overlay-Clients.

## Datenquelle

- `GET /api/overlay-monitor/status?events=10`
- Grundlage ist weiterhin der vorhandene Communication Bus.
- Das Backend-Modul bleibt `backend/modules/overlay_monitor.js`.

## Änderungen

- `backend/modules/overlay_monitor.js`
  - Version `0.1.1`
  - Overlay-Erkennung enger gefasst:
    - `type == overlay`
    - `id` beginnt mit `overlay:`
    - `mode == overlay`
  - Keine Erkennung mehr über Teilstrings wie `type.includes("overlay")`.

- `htdocs/dashboard/app.js`
  - vorhandener Katalogpunkt `overlays` aktiviert.
  - neues Dashboard-Panel `overlays` an Control-Gruppe angebunden.

- `htdocs/dashboard/index.html`
  - Section `overlaysModule` eingebunden.
  - `overlays.css` und `overlays.js` eingebunden.

- `htdocs/dashboard/modules/overlays.js`
  - Read-only Dashboard für Overlay-Status.
  - Filter: Alle, Online, Stale, Offline, Dead, Probleme.
  - Auto-Refresh nur lesend.

- `htdocs/dashboard/modules/overlays.css`
  - Styling für die Overlay-Monitor-Ansicht.

## Nicht enthalten

- keine OBS-Aktionen
- keine Source ein-/ausblenden Buttons
- kein Browser-Cache-Refresh
- keine DB-Mapping-Tabelle
- keine Automatik/Reparatur
- kein neues Backend-Modul

## Test

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\overlay_monitor.js
node --check htdocs\dashboardpp.js
node --check htdocs\dashboard\modules\overlays.js
.\stepdone.cmd "STEP619 Control Overlays Read-only aktivieren"
```

Danach Backend neu starten und Dashboard hart neu laden.

Prüfen:

- Control → Overlays ist sichtbar und aktiv.
- Es werden nur echte Overlay-Clients angezeigt.
- Backend-Modul-Clients wie `module:overlay_monitor` werden nicht als Overlay gezählt.
