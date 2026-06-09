# LWG-4L.12 – PowerShell Testbefehle

## 0) StepDone VOR dem Test

```powershell
.\stepdone.cmd "LWG-4L.12 Loyalty Wheel-Permission Runtime Lookup Fix eingespielt. moduleBuild STEP_LWG_4L_12. !wheel/!rad suchen ohne giveawayUid jetzt pending Wheel-Permission des Users statt offenes Giveaway. Keine Command-Aktivierung, keine Punktebuchung."
```

## 1) Status prüfen

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status"
$s | Select-Object moduleBuild,routeCount
$s.diagnostics | Select-Object health,lastError
```

Erwartung:

```text
moduleBuild = STEP_LWG_4L_12
health = ok
```

## 2) !wheel temporär aktivieren

```powershell
$body = @{
  trigger = "wheel"
  aliases = @("rad")
  moduleKey = "loyalty_giveaways"
  actionKey = "giveaway_wheel_claim"
  targetMethod = "POST"
  targetUrl = "/api/loyalty/giveaways/runtime/chat-command"
  enabled = $true
  permissionLevel = "everyone"
  cooldownGlobalMs = 0
  cooldownUserMs = 0
  liveOnly = $false
  responseMode = "module"
  config = @{
    actionType = "module_command"
    moduleCommand = "wheel"
    rawInputMode = $true
    seededBy = "LWG-4L.12"
  }
} | ConvertTo-Json -Depth 8

Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/commands/upsert" `
  -ContentType "application/json" `
  -Body $body | Select-Object ok,message
```

## 3) Ohne Permission testen

```powershell
$r = Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/commands/execute" `
  -ContentType "application/json" `
  -Body '{"message":"!wheel","userLogin":"TestUser","userDisplayName":"TestUser"}'

$r.result | Select-Object dataOk,error,message,command
```

Erwartung:

```text
dataOk = False
error = wheel_no_permission
command = wheel
```

## 4) Alias !rad testen

```powershell
$r2 = Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/commands/execute" `
  -ContentType "application/json" `
  -Body '{"message":"!rad","userLogin":"TestUser","userDisplayName":"TestUser"}'

$r2.result | Select-Object dataOk,error,message,command
```

Erwartung:

```text
dataOk = False
error = wheel_no_permission
command = wheel
```

## 5) Rollback

```powershell
$body = @{
  trigger = "wheel"
  aliases = @("rad")
  moduleKey = "loyalty_giveaways"
  actionKey = "giveaway_wheel_claim"
  targetMethod = "POST"
  targetUrl = "/api/loyalty/giveaways/runtime/chat-command"
  enabled = $false
  permissionLevel = "everyone"
  cooldownGlobalMs = 1000
  cooldownUserMs = 5000
  liveOnly = $false
  responseMode = "module"
  config = @{
    actionType = "module_command"
    moduleCommand = "wheel"
    rawInputMode = $true
    seededBy = "LWG-4L.12-rollback"
  }
} | ConvertTo-Json -Depth 8

Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/commands/upsert" `
  -ContentType "application/json" `
  -Body $body | Select-Object ok,message
```

## 6) Endprüfung

```powershell
$cc = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/central-commands"
$cc.commands | Select-Object trigger,aliases,enabled,moduleKey,targetUrl
```

Erwartung:
- ticket enabled = False
- wheel enabled = False

## StepDone nach erfolgreichem Test

```powershell
.\stepdone.cmd "LWG-4L.12 Loyalty Wheel-Permission Runtime Lookup Fix erfolgreich bestaetigt. moduleBuild STEP_LWG_4L_12, health ok. !wheel und !rad liefern ohne pending Permission wheel_no_permission. !wheel wurde danach wieder enabled=false gesetzt. Keine Punktebuchung, kein Wheel-Spin ohne Permission."
```
