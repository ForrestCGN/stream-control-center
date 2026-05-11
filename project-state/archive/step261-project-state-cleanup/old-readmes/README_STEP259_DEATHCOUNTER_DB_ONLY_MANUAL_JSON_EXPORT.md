# STEP259 - DeathCounter DB-only Storage + manueller JSON Backup/Export

Dieses ZIP nach `D:\Git\stream-control-center` entpacken.

Danach:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP259 deathcounter db only manual json export"
```

Live-Tests danach:

```powershell
cd D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/backup" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/export?mode=export" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```

Erwartung:

```text
activeStorage: database
dualWriteEnabled: false
jsonFallbackEnabled: true
summary.errors: 0
```
