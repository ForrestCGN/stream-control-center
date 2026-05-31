# Projektstand – STEP628A OBS-Overlay-Reparaturaktionen

Stand: STEP628A
Version: v0.1.0

## Änderungen

- `backend/modules/overlay_monitor.js`
  - Version auf `0.1.6`
  - neue POST-Route `/api/overlay-monitor/obs-source/action`
  - manuelle OBS-Aktionen: refresh, refresh-cache, show, hide, toggle, cycle
  - Eventlog-Eintrag `obs_source_repair`
  - Inventar wird nach erfolgreicher Aktion neu gelesen

- `htdocs/dashboard/modules/overlays.js`
  - Reparaturbuttons im OBS-Inventar
  - Sicherheitsabfragen bei sichtbaren/risikoreichen Aktionen
  - Erfolg-/Fehlerhinweise im Dashboard

- `htdocs/dashboard/modules/overlays.css`
  - Styles für Reparaturbuttons und Hinweise

## Regeln

- Keine automatische Reparatur
- Keine Reparaturbuttons für Platzhalter
- Keine OBS-Quellen werden umbenannt
- Keine Funktionalität entfernt

## Test

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\overlay_monitor.js
node --check htdocs\dashboard\modules\overlays.js
.\stepdone.cmd "STEP628A OBS Overlay Reparaturaktionen"
```

Danach Backend neu starten und Dashboard hart neu laden.
