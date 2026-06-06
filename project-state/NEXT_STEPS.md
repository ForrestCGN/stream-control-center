# NEXT STEPS – VIP30 / 30TageVIP

Stand: 2026-06-06

## Nach STEP8.12 ZIP

```powershell
cd /d D:\Git\stream-control-center
node -c backend\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.12 Sound Bundle Overlay"
```

Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/alert/status" | ConvertTo-Json -Depth 6
```

## Danach

1. VIP30-Sound über Media-System hochladen.
2. Media-ID aus Media-System übernehmen.
3. `alerts.mediaId` in VIP30-Config setzen.
4. Sound-System-Overlay in OBS prüfen.
5. `live.allowAlert` bewusst aktivieren.
6. Live-Test mit VIP30-Redemption.

## Später

- Dashboard Media-Picker für VIP30-Alert-Sound.
- Admin-Bereich für technische VIP30-Aktionen.
