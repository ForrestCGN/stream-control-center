# STEP204.1 Twitch Sub/Gift/Resub final smoke test
# Ausführen nach Deploy:
# cd D:\Git\stream-control-center
# .\tools\test_step204_1_twitch_sub_gift_final.ps1

$BaseUrl = "http://127.0.0.1:8080"

function Send-AlertTest {
  param(
    [Parameter(Mandatory=$true)][hashtable]$Payload
  )

  $json = $Payload | ConvertTo-Json -Depth 30
  Invoke-RestMethod `
    -Method Post `
    -Uri "$BaseUrl/api/alerts/twitch" `
    -ContentType "application/json" `
    -Body $json
}

Write-Host "=== STEP204.1 final test: normal sub ==="
Send-AlertTest @{
  source = "twitch"
  type = "sub"
  user = "SubFinalTest"
  user_login = "subfinaltest"
  amount = 1
  message = "Finaltest normaler Sub"
  raw = @{
    eventsub_type = "channel.subscribe"
    tier = "1000"
    is_gift = $false
  }
} | ConvertTo-Json -Depth 20

Start-Sleep -Seconds 2

Write-Host "=== STEP204.1 final test: gifted_sub_received (should be ignored) ==="
Send-AlertTest @{
  source = "twitch"
  type = "gifted_sub_received"
  user = "GiftReceiverFinalTest"
  user_login = "giftreceiverfinaltest"
  amount = 1
  message = "Finaltest gifted sub received"
  raw = @{
    eventsub_type = "channel.subscribe"
    tier = "1000"
    is_gift = $true
  }
} | ConvertTo-Json -Depth 20

Start-Sleep -Seconds 2

Write-Host "=== STEP204.1 final test: resub ==="
Send-AlertTest @{
  source = "twitch"
  type = "resub"
  user = "ResubFinalTest"
  user_login = "resubfinaltest"
  amount = 12
  message = "Finaltest Resub mit Nachricht"
  raw = @{
    eventsub_type = "channel.subscription.message"
    tier = "1000"
    cumulative_months = 12
    streak_months = 6
    message = @{
      text = "Finaltest Resub mit Nachricht"
    }
  }
} | ConvertTo-Json -Depth 20

Start-Sleep -Seconds 2

Write-Host "=== Last alert events ==="
Invoke-RestMethod "$BaseUrl/api/alerts/events?limit=6" | ConvertTo-Json -Depth 30

Write-Host "=== Current Sub/Gift rules ==="
$data = Invoke-RestMethod "$BaseUrl/api/alerts/rules"
$data.rules |
  Where-Object { $_.source -eq "twitch" -and $_.type_key -in @("sub","resub","gift_sub","gift_bomb") } |
  Sort-Object type_key, min_value |
  Select-Object id, source, type_key, label, min_value, max_value, sound_asset_id, enabled |
  ConvertTo-Json -Depth 20
