# Next Steps

## Nach VIP30-STEP4 testen

```powershell
cd /d D:\Git\stream-control-center
node -c backend\modules\vip30.js
.\stepdone.cmd "VIP30-STEP4 DB Dashboard Config"
```

Danach:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/settings" | ConvertTo-Json -Depth 8
```

Optionaler Save-Test:

```powershell
$body = @{ settings = @{ "reward.cost" = 40000 } } | ConvertTo-Json -Depth 8
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip30/settings/save" -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 8
```

## Danach

VIP30-STEP5: Dry-Run Redemption/Decision Flow zwischen Channelpoints und VIP30.
