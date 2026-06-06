# NEXT STEPS – VIP30 / 30TageVIP

Stand: 2026-06-06

## Nach STEP8.11 ZIP

```powershell
cd /d D:\Git\stream-control-center
node -c backend\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.11 Alert Bus Event"
```

Status testen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/alert/status" | ConvertTo-Json -Depth 6
```

## Danach

STEP8.12 planen/umsetzen:

```txt
VIP30 Alert an bestehendes Alert-/Sound-System anbinden
```

Dafür müssen die aktuellen Alert-/Sound-Moduldateien als echte Basis geprüft werden.

## Später

Admin-/Systembereich separat:

```txt
Reward Sync/Ensure
Cleanup Dry-Run
Cleanup Run
Slot external_removed
Live-Gates
Rohdiagnose
```
