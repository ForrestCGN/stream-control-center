# LWG-4L.14 – PowerShell Aktivierung / Rollback

## 0) StepDone VOR der Aktivierung

```powershell
.\stepdone.cmd "LWG-4L.14 Loyalty Chat-Command-Aktivierung vorbereitet. Keine Codeaenderung, Codebasis bleibt STEP_LWG_4L_12. !ticket und !wheel/!rad koennen ueber das zentrale commands-System dauerhaft aktiviert werden. Kostenpflichtige Tickets bleiben ohne Punktebuchung blockiert."
```

## 1) Status kurz prüfen

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status"
$s | Select-Object moduleBuild,routeCount
$s.diagnostics | Select-Object health,lastError
```

Erwartung:
- `moduleBuild = STEP_LWG_4L_12`
- `health = ok`

## 2) Aktuellen Command-Stand prüfen

```powershell
$cc = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/central-commands"
$cc.commands | Select-Object trigger,aliases,enabled,moduleKey,targetUrl
```

## 3) !ticket dauerhaft aktivieren

```powershell
$ticketBody = @{
  trigger = "ticket"
  aliases = @()
  moduleKey = "loyalty_giveaways"
  actionKey = "giveaway_ticket"
  targetMethod = "POST"
  targetUrl = "/api/loyalty/giveaways/runtime/chat-command"
  enabled = $true
  permissionLevel = "everyone"
  cooldownGlobalMs = 1000
  cooldownUserMs = 5000
  liveOnly = $false
  responseMode = "module"
  config = @{
    actionType = "module_command"
    moduleCommand = "ticket"
    rawInputMode = $true
    seededBy = "LWG-4L.14-enable"
  }
} | ConvertTo-Json -Depth 8

Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/commands/upsert" `
  -ContentType "application/json" `
  -Body $ticketBody | Select-Object ok,message
```

## 4) !wheel / !rad dauerhaft aktivieren

```powershell
$wheelBody = @{
  trigger = "wheel"
  aliases = @("rad")
  moduleKey = "loyalty_giveaways"
  actionKey = "giveaway_wheel_claim"
  targetMethod = "POST"
  targetUrl = "/api/loyalty/giveaways/runtime/chat-command"
  enabled = $true
  permissionLevel = "everyone"
  cooldownGlobalMs = 1000
  cooldownUserMs = 5000
  liveOnly = $false
  responseMode = "module"
  config = @{
    actionType = "module_command"
    moduleCommand = "wheel"
    rawInputMode = $true
    seededBy = "LWG-4L.14-enable"
  }
} | ConvertTo-Json -Depth 8

Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/commands/upsert" `
  -ContentType "application/json" `
  -Body $wheelBody | Select-Object ok,message
```

## 5) Aktivierung prüfen

```powershell
$cc = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/central-commands"
$cc.commands | Select-Object trigger,aliases,enabled,moduleKey,targetUrl
```

Erwartung:
- `ticket enabled = True`
- `wheel enabled = True`
- `rad` bleibt Alias von `wheel`

## 6) Schnelltest ohne Giveaway / ohne Permission

```powershell
$t = Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/commands/execute" `
  -ContentType "application/json" `
  -Body '{"message":"!ticket","userLogin":"TestUser","userDisplayName":"TestUser"}'

$t.result | Select-Object dataOk,error,message,command
```

Erwartung ohne offenes Giveaway:
- `dataOk = False`
- `error = giveaway_no_active`

```powershell
$w = Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/commands/execute" `
  -ContentType "application/json" `
  -Body '{"message":"!wheel","userLogin":"TestUser","userDisplayName":"TestUser"}'

$w.result | Select-Object dataOk,error,message,command
```

Erwartung ohne Wheel-Permission:
- `dataOk = False`
- `error = wheel_no_permission`

## 7) Rollback: beide Commands wieder deaktivieren

```powershell
$ticketBody = @{
  trigger = "ticket"
  aliases = @()
  moduleKey = "loyalty_giveaways"
  actionKey = "giveaway_ticket"
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
    moduleCommand = "ticket"
    rawInputMode = $true
    seededBy = "LWG-4L.14-rollback"
  }
} | ConvertTo-Json -Depth 8

Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/commands/upsert" `
  -ContentType "application/json" `
  -Body $ticketBody | Select-Object ok,message

$wheelBody = @{
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
    seededBy = "LWG-4L.14-rollback"
  }
} | ConvertTo-Json -Depth 8

Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/commands/upsert" `
  -ContentType "application/json" `
  -Body $wheelBody | Select-Object ok,message
```

## 8) StepDone nach erfolgreicher dauerhafter Aktivierung

```powershell
.\stepdone.cmd "LWG-4L.14 Loyalty Chat-Commands dauerhaft aktiviert. !ticket und !wheel/!rad stehen im zentralen commands-System auf enabled=true. Schnelltest bestaetigt: !ticket ohne Giveaway liefert giveaway_no_active, !wheel ohne Permission liefert wheel_no_permission. Kostenpflichtige Tickets bleiben ohne Punktebuchung blockiert."
```

## 9) StepDone nach Rollback statt Aktivierung

```powershell
.\stepdone.cmd "LWG-4L.14 Loyalty Chat-Command-Aktivierung getestet und zurueckgerollt. !ticket und !wheel/!rad wurden geprueft und danach wieder enabled=false gesetzt. Keine dauerhafte Chat-Aktivierung."
```
