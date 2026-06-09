# LWG-4M.2 – PowerShell Testbefehle

## 0) StepDone VOR dem Test

```powershell
.\stepdone.cmd "LWG-4M.2 Loyalty Backend Close-und-Draw-Guard eingespielt. moduleBuild STEP_LWG_4M_2. /close Alias fuer Giveaways ergaenzt, Close liefert giveaway.closed Chattext, Draw aus open wird mit giveaway_draw_requires_closed_entries blockiert. Keine Punktebuchung, keine Command-Aktivierung."
```

## 1) Status prüfen

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status"
$s | Select-Object moduleBuild,routeCount
$s.diagnostics | Select-Object health,lastError
```

Erwartung:
- `moduleBuild = STEP_LWG_4M_2`
- `health = ok`

## 2) Test-Giveaway erstellen

```powershell
$createBody = @{
  title = "LWG-4M.2 Close Draw Guard Test"
  description = "Temporärer Test: Draw darf erst nach Close laufen"
  mode = "classic_single"
  costAmount = 0
  maxTicketsPerUser = 1
  winnerCount = 1
  createdBy = "LWG-4M.2"
  metadata = @{
    testStep = "LWG-4M.2"
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
  -Body '{"actor":"LWG-4M.2","reason":"temporary close draw guard test"}' |
  Select-Object ok,message
```

## 4) Draw aus open testen – muss blocken

```powershell
$drawOpen = $null
try {
  $drawOpen = Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/draw" `
    -ContentType "application/json" `
    -Body '{"actor":"LWG-4M.2","reason":"draw while open must be blocked"}'
} catch {
  $drawOpen = $_.ErrorDetails.Message | ConvertFrom-Json
}

$drawOpen | Select-Object ok,error,status,requiredStatus,messageKey,chatMessage
```

Erwartung:
- `ok = False`
- `error = giveaway_draw_requires_closed_entries`
- `status = open`
- `requiredStatus = closed_for_entries`
- `messageKey = giveaway.draw_not_closed`

## 5) Giveaway über neuen /close Alias schließen

```powershell
$closed = Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/close" `
  -ContentType "application/json" `
  -Body '{"actor":"LWG-4M.2","reason":"temporary close draw guard test"}'

$closed | Select-Object ok,messageKey,message,chatMessage,shouldSendChat
$closed.giveaway | Select-Object giveawayUid,status,entriesClosedAt
```

Erwartung:
- `ok = True`
- `messageKey = giveaway.closed`
- `shouldSendChat = True`
- Giveaway `status = closed_for_entries`

## 6) Draw nach Close erreicht jetzt den eigentlichen Draw-Pfad

Dieser Test muss nicht erfolgreich auslosen, weil das Test-Giveaway keine Entries/Prizes hat. Wichtig ist nur: Der alte Fehler `giveaway_draw_requires_closed_entries` darf nicht mehr kommen.

```powershell
$drawClosed = $null
try {
  $drawClosed = Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/draw" `
    -ContentType "application/json" `
    -Body '{"actor":"LWG-4M.2","reason":"draw after close reaches draw path"}'
} catch {
  $drawClosed = $_.ErrorDetails.Message | ConvertFrom-Json
}

$drawClosed | Select-Object ok,error,status,requiredStatus,messageKey
```

Erwartung:
- Fehler darf **nicht** `giveaway_draw_requires_closed_entries` sein.
- Je nach Datenlage ist z. B. `giveaway_no_prizes_available` oder `giveaway_no_eligible_entries` okay.

## 7) Cleanup: Test-Giveaway canceln

```powershell
Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/cancel" `
  -ContentType "application/json" `
  -Body '{"actor":"LWG-4M.2","reason":"temporary close draw guard test cleanup"}' |
  Select-Object ok,message
```

## StepDone nach erfolgreichem Test

```powershell
.\stepdone.cmd "LWG-4M.2 Loyalty Backend Close-und-Draw-Guard erfolgreich getestet. moduleBuild STEP_LWG_4M_2, health ok. Draw aus open wurde mit giveaway_draw_requires_closed_entries blockiert. /close Alias schloss Giveaway auf closed_for_entries und lieferte giveaway.closed Chattext mit shouldSendChat=true. Draw nach Close erreichte den eigentlichen Draw-Pfad. Test-Giveaway wurde gecancelt."
```
