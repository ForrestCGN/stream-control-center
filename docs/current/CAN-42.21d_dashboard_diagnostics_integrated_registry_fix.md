# CAN-42.21d Dashboard Diagnostics Integrated Registry Fix

## Ziel
Die zentrale Dashboard-Diagnose verwaltet die bisher umgestellten Statusmodule wieder direkt in `htdocs/dashboard/modules/diagnostics.js`.

## Geändert
- `htdocs/dashboard/modules/diagnostics.js`
  - `Communication-Bus` als echter Eintrag ergänzt: `/api/communication/status`
  - `OBS` als echter Eintrag ergänzt: `/api/obs/status`
  - `VIP-System` auf `/api/vip-sound/status` korrigiert
  - Routenanzahl liest nun `routeCount` aus Statuspayloads, nicht nur `routes.length`
- `htdocs/dashboard/modules/diagnostics_generic_details.js`
  - Zusatzdatei räumt die vorherige dynamische Dropdown-/Detailseiten-Nachpatch-Logik auf
  - bleibt nur noch für die generische Detailanzeige des `diagnostics`-Blocks zuständig

## Nicht geändert
- Keine Backend-Logik
- Keine OBS-/Sound-/Show-/Chat-/Admin-Aktion
- Keine neue Moduldatei
- Keine DB-Migration
- Keine Funktionalität entfernt

## Test
```powershell
.\stepdone.cmd "CAN-42.21d Dashboard diagnostics integrated registry fix"

node -c htdocs\dashboard\modules\diagnostics.js
node -c htdocs\dashboard\modules\diagnostics_generic_details.js
```

Dashboard hart neu laden (`STRG+F5`) und prüfen:
- Admin > Diagnose > Communication-Bus öffnet Detailseite
- Admin > Diagnose > OBS öffnet Detailseite
- VIP-System nutzt `/api/vip-sound/status`
