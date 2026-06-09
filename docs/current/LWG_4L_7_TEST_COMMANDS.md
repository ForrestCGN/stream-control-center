# LWG-4L.7 – PowerShell Testbefehle

## 0) StepDone VOR dem Test

```powershell
.\stepdone.cmd "LWG-4L.7 Loyalty kostenloses Giveaway Ticket-Live-Test vorbereitet. Keine Codeaenderung, Codebasis bleibt STEP_LWG_4L_5. Test erstellt ein kostenloses Giveaway, aktiviert !ticket temporaer, prueft Entry-Erstellung und setzt !ticket danach wieder auf enabled=false. Keine Punktebuchung, !wheel/!rad bleiben deaktiviert."
```

## 1) Status kurz prüfen

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status"
$s | Select-Object moduleBuild,routeCount
$s.diagnostics | Select-Object health,lastError
```

Erwartung: `moduleBuild = STEP_LWG_4L_5`, `health = ok`.

## 2) Kostenloses Test-Giveaway erstellen

```powershell
$createBody = @{
  title = "LWG-4L.7 Test Giveaway"
  description = "Temporärer Test für !ticket kostenlos"
  mode = "classic_single"
  costAmount = 0
  maxTicketsPerUser = 3
  winnerCount = 1
  createdBy = "LWG-4L.7"
  metadata = @{
    testStep = "LWG-4L.7"
    temporary = $true
  }
} | ConvertTo-Json -Depth 8

$created = Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/loyalty/giveaways" `
  -ContentType "application/json" `
  -Body $createBody

$giveawayUid = $created.giveaway.giveawayUid
if (-not $giveawayUid -and $created.data) { $giveawayUid = $created.data.giveaway.giveawayUid }

$giveawayUid
```

## 3) Giveaway öffnen

```powershell
Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/open" `
  -ContentType "application/json" `
  -Body '{"actor":"LWG-4L.7","reason":"temporary free ticket live test"}' |
  Select-Object ok,message
```

## 4) !ticket temporär aktivieren

```powershell
$body = @{
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
    seededBy = "LWG-4L.7"
  }
} | ConvertTo-Json -Depth 8

Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/commands/upsert" `
  -ContentType "application/json" `
  -Body $body | Select-Object ok,message
```

## 5) !ticket über Command-System ausführen

```powershell
$r = Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/commands/execute" `
  -ContentType "application/json" `
  -Body '{"message":"!ticket","userLogin":"TestUser","userDisplayName":"TestUser"}'

$r | Select-Object ok,command,error
$r.result | Select-Object dataOk,error,message,command
```

Erwartung:
- `$r.ok = True`
- `$r.command = ticket`
- `$r.result.dataOk = True`
- Kein `giveaway_no_active`
- Kein `chat_commands_disabled`

## 6) Entries prüfen

```powershell
$entries = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/entries"
$entries.rows | Select-Object userLogin,userDisplayName,ticketCount,status,source
if (-not $entries.rows -and $entries.data) {
  $entries.data.rows | Select-Object userLogin,userDisplayName,ticketCount,status,source
}
```

Erwartung:
- `userLogin = testuser`
- `ticketCount = 1`
- `status = active`

## 7) Rollback: !ticket wieder deaktivieren

```powershell
$body = @{
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
    seededBy = "LWG-4L.7-rollback"
  }
} | ConvertTo-Json -Depth 8

Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/commands/upsert" `
  -ContentType "application/json" `
  -Body $body | Select-Object ok,message
```

## 8) Test-Giveaway sauber beenden

Variante A – canceln:

```powershell
Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/cancel" `
  -ContentType "application/json" `
  -Body '{"actor":"LWG-4L.7","reason":"temporary test finished"}' |
  Select-Object ok,message
```

Variante B – finishen, wenn du den Test als abgeschlossen markieren willst:

```powershell
Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/finish" `
  -ContentType "application/json" `
  -Body '{"actor":"LWG-4L.7","reason":"temporary test finished"}' |
  Select-Object ok,message
```

## 9) Endprüfung

```powershell
$cc = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/central-commands"
$cc.commands | Select-Object trigger,aliases,enabled,moduleKey,targetUrl
```

Erwartung:
- `ticket enabled = False`
- `wheel enabled = False`

## StepDone nach erfolgreichem Test

```powershell
.\stepdone.cmd "LWG-4L.7 Loyalty kostenloses Giveaway Ticket-Live-Test erfolgreich. Kostenloses Test-Giveaway erstellt und geoeffnet, !ticket temporaer aktiviert, /api/commands/execute erstellt Entry fuer TestUser, Entries geprueft, !ticket wieder enabled=false gesetzt. !wheel/!rad blieben deaktiviert, keine Punktebuchung."
```
