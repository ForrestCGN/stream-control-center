# LWG-4L.8 – PowerShell Testbefehle

## 0) StepDone VOR dem Test

```powershell
.\stepdone.cmd "LWG-4L.8 Loyalty Ticket-Anzahl-und-Limit-Test vorbereitet. Keine Codeaenderung, Codebasis bleibt STEP_LWG_4L_5. Test erstellt kostenloses Giveaway mit maxTicketsPerUser=3, aktiviert !ticket temporaer mit Cooldowns 0, prueft !ticket 2 und Limitverhalten, setzt !ticket danach wieder enabled=false. Keine Punktebuchung, !wheel/!rad bleiben deaktiviert."
```

## 1) Status kurz prüfen

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status"
$s | Select-Object moduleBuild,routeCount
$s.diagnostics | Select-Object health,lastError
```

Erwartung:
- `moduleBuild = STEP_LWG_4L_5`
- `health = ok`

## 2) Kostenloses Test-Giveaway mit maxTicketsPerUser=3 erstellen

```powershell
$createBody = @{
  title = "LWG-4L.8 Ticket Limit Test"
  description = "Temporärer Test für !ticket Anzahl und Max-Limit"
  mode = "classic_single"
  costAmount = 0
  maxTicketsPerUser = 3
  winnerCount = 1
  createdBy = "LWG-4L.8"
  metadata = @{
    testStep = "LWG-4L.8"
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
  -Body '{"actor":"LWG-4L.8","reason":"temporary ticket amount limit test"}' |
  Select-Object ok,message
```

## 4) !ticket temporär aktivieren, Cooldowns 0

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
  cooldownGlobalMs = 0
  cooldownUserMs = 0
  liveOnly = $false
  responseMode = "module"
  config = @{
    actionType = "module_command"
    moduleCommand = "ticket"
    rawInputMode = $true
    seededBy = "LWG-4L.8"
  }
} | ConvertTo-Json -Depth 8

Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/commands/upsert" `
  -ContentType "application/json" `
  -Body $body | Select-Object ok,message
```

## 5) !ticket 2 ausführen

```powershell
$r1 = Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/commands/execute" `
  -ContentType "application/json" `
  -Body '{"message":"!ticket 2","userLogin":"TestUser","userDisplayName":"TestUser"}'

$r1 | Select-Object ok,command,error
$r1.result | Select-Object dataOk,error,message,command
```

Erwartung:
- `dataOk = True`
- message enthält sinngemäß `2 Ticket(s)` oder Entry zeigt `ticketCount=2`

## 6) Entries nach erstem Ticket prüfen

```powershell
$entries = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/entries"
$entries.rows | Select-Object userLogin,userDisplayName,ticketCount,status,source
if (-not $entries.rows -and $entries.data) {
  $entries.data.rows | Select-Object userLogin,userDisplayName,ticketCount,status,source
}
```

Erwartung:
- `userLogin = testuser`
- `ticketCount = 2`
- `status = active`
- `source = chat_runtime`

## 7) !ticket 2 nochmal ausführen, Limit prüfen

```powershell
$r2 = Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/commands/execute" `
  -ContentType "application/json" `
  -Body '{"message":"!ticket 2","userLogin":"TestUser","userDisplayName":"TestUser"}'

$r2 | Select-Object ok,command,error
$r2.result | Select-Object dataOk,error,message,command
```

Erwartung:
- Gewünscht ist: `dataOk = False`, `error = max_tickets_reached` oder vergleichbarer Limit-Fehler.
- Falls stattdessen auf 3 erhöht wird oder 4 entsteht, bitte Ausgabe posten. Dann ist das der nächste Fix-Step.

## 8) Entries nach Limit-Test prüfen

```powershell
$entries2 = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/entries"
$entries2.rows | Select-Object userLogin,userDisplayName,ticketCount,status,source
if (-not $entries2.rows -and $entries2.data) {
  $entries2.data.rows | Select-Object userLogin,userDisplayName,ticketCount,status,source
}
```

Gewünschter sicherer Zustand:
- `ticketCount` darf `3` nicht überschreiten.

## 9) Rollback: !ticket wieder deaktivieren

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
    seededBy = "LWG-4L.8-rollback"
  }
} | ConvertTo-Json -Depth 8

Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/commands/upsert" `
  -ContentType "application/json" `
  -Body $body | Select-Object ok,message
```

## 10) Test-Giveaway canceln

```powershell
Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/cancel" `
  -ContentType "application/json" `
  -Body '{"actor":"LWG-4L.8","reason":"temporary ticket amount limit test finished"}' |
  Select-Object ok,message
```

## 11) Endprüfung

```powershell
$cc = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/central-commands"
$cc.commands | Select-Object trigger,aliases,enabled,moduleKey,targetUrl
```

Erwartung:
- `ticket enabled = False`
- `wheel enabled = False`

## StepDone nach erfolgreichem Test

```powershell
.\stepdone.cmd "LWG-4L.8 Loyalty Ticket-Anzahl-und-Limit-Test abgeschlossen. Kostenloses Giveaway mit maxTicketsPerUser=3 erstellt und geoeffnet, !ticket temporaer aktiviert, !ticket 2 getestet, Entry-/Limitverhalten geprueft, !ticket wieder enabled=false gesetzt, Test-Giveaway gecancelt. Keine Punktebuchung, !wheel/!rad blieben deaktiviert."
```
