# LWG-4M.3 – Testbefehle

## 0) StepDone VOR dem Test

```powershell
.\stepdone.cmd "LWG-4M.3 Loyalty Close-Chatmeldung an Twitch Presence angebunden. ZIP eingespielt, moduleBuild STEP_LWG_4M_3. /close sendet giveaway.closed ueber twitch_presence.sendChatMessage, Statuswechsel bleibt auch bei nicht verbundenem Chat erfolgreich. Keine Punktebuchung, keine Command-Aktivierung."
```

## 1) Status prüfen

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status"
$s | Select-Object moduleBuild,routeCount
$s.diagnostics | Select-Object health,lastError
```

Erwartung:
- `moduleBuild = STEP_LWG_4M_3`
- `health = ok`

## 2) Twitch Presence Status prüfen

```powershell
$tp = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/status"
$tp | Select-Object desiredActive,connected,authenticated,joined,channel,last_error,last_chat_message_at,chat_message_send_count
```

Hinweis:
- Wenn `joined=True`, sollte Chatversand klappen.
- Wenn nicht, darf Close trotzdem erfolgreich sein, aber `chatSent=False`.

## 3) Test-Giveaway erstellen

```powershell
$createBody = @{
  title = "LWG-4M.3 Close Chat Dispatch Test"
  description = "Temporärer Test: Close sendet Chatmeldung"
  mode = "classic_single"
  costAmount = 0
  maxTicketsPerUser = 3
  winnerCount = 1
  createdBy = "LWG-4M.3"
  metadata = @{
    testStep = "LWG-4M.3"
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

## 4) Giveaway öffnen

```powershell
Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/open" `
  -ContentType "application/json" `
  -Body '{"actor":"LWG-4M.3","reason":"close chat dispatch test"}' |
  Select-Object ok,message
```

## 5) Entry erstellen

```powershell
$entryBody = @{
  userLogin = "TestUser"
  userDisplayName = "TestUser"
  ticketCount = 1
  source = "lwg_4m_3_test"
} | ConvertTo-Json -Depth 8

Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/entries" `
  -ContentType "application/json" `
  -Body $entryBody |
  Select-Object ok,message
```

## 6) Close mit Chatdispatch testen

```powershell
$close = Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/close" `
  -ContentType "application/json" `
  -Body '{"actor":"LWG-4M.3","reason":"close with twitch chat dispatch"}'

$close | Select-Object ok,messageKey,message,chatMessage,shouldSendChat,chatDispatchAttempted,chatSent
$close.chatDispatch | Select-Object ok,error,trigger,channel,message_preview,send_count
$close.giveaway | Select-Object giveawayUid,status
```

Erwartung:
- `ok=True`
- `status=closed_for_entries`
- `chatDispatchAttempted=True`
- Wenn Presence verbunden: `chatSent=True`
- Wenn nicht verbunden: `chatSent=False`, `chatDispatch.error=twitch_chat_not_connected`

## 7) Silent Close Gegenprobe mit neuem Giveaway optional

Nur falls du prüfen willst, dass man Chatversand unterdrücken kann:

```powershell
# Bei Bedarf ein neues Test-Giveaway erstellen/open und dann:
# -Body '{"actor":"LWG-4M.3","reason":"silent close","sendChat":false}'
```

## 8) Draw nach Close weiter testen

```powershell
$drawClosed = Invoke-RestMethod -Method POST "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/draw" `
  -ContentType "application/json" `
  -Body '{"actor":"LWG-4M.3","reason":"draw after close"}'

$drawClosed | Select-Object ok,message
$drawClosed.winner | Select-Object userLogin,userDisplayName,status
```

## StepDone nach erfolgreichem Test

### Wenn Chat wirklich gesendet wurde
```powershell
.\stepdone.cmd "LWG-4M.3 Loyalty Close-Chatmeldung erfolgreich bestaetigt. moduleBuild STEP_LWG_4M_3, health ok. /close setzt status closed_for_entries und sendet giveaway.closed ueber Twitch Presence erfolgreich in den Chat, chatSent=true. Draw nach Close funktioniert weiterhin."
```

### Wenn Presence nicht verbunden war, aber Dispatch sauber fehlschlug
```powershell
.\stepdone.cmd "LWG-4M.3 Loyalty Close-Chatdispatch technisch bestaetigt. moduleBuild STEP_LWG_4M_3, health ok. /close setzt status closed_for_entries und versucht giveaway.closed ueber Twitch Presence zu senden, chatDispatchAttempted=true. Twitch Presence war nicht verbunden, daher chatSent=false; Statuswechsel bleibt korrekt. Draw nach Close funktioniert weiterhin."
```
