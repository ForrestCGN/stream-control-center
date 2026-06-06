# CURRENT STATUS – VIP30

## Grün getestet

- STEP8.4 Stage B: VIP grant + slot + redemption fulfill/cancel
- STEP8.5 Cleanup Dry-Run / abgelaufene Slots
- STEP8.6 externe Slot-Freigabe per Bus-Simulation

## Nicht abgeschlossen

- STEP8.7 echter Twitch EventSub `channel.vip.remove` bis Live-Bus

## Bekannter Stolperpunkt

Node läuft aus `D:\Streaming\stramAssets`, nicht aus `D:\Git\stream-control-center`.

Vor jedem weiteren Test prüfen:
```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/_status"
$r.rootDir
```
