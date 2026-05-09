$ErrorActionPreference = "Stop"
$BaseUrl = "http://127.0.0.1:8080"

function Send-AlertTest($Name, $Payload) {
  Write-Host "`n=== $Name ===" -ForegroundColor Cyan
  $json = $Payload | ConvertTo-Json -Depth 30
  try {
    $result = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/alerts/twitch" -ContentType "application/json" -Body $json
    $result | ConvertTo-Json -Depth 20
  } catch {
    if ($_.Exception.Response) {
      $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
      $reader.ReadToEnd()
    } else {
      throw
    }
  }
}

Write-Host "STEP204 Twitch Sub/Gift Model Test" -ForegroundColor Green
Invoke-RestMethod "$BaseUrl/api/alerts/status" | Select-Object enabled, queueEnabled, queueLength | ConvertTo-Json -Depth 5

Send-AlertTest "normal sub is_gift=false -> sub" @{
  source = "twitch"
  type = "sub"
  user = "SubTier1Test"
  user_login = "subtier1test"
  amount = 1
  tier = "1000"
  is_gift = $false
  raw = @{ eventsub_type = "channel.subscribe"; tier = "1000"; is_gift = $false }
}

Send-AlertTest "gifted sub received is_gift=true -> gifted_sub_received should usually be ignored unless rule exists" @{
  source = "twitch"
  type = "gifted_sub_received"
  user = "GiftReceivedTest"
  user_login = "giftreceivedtest"
  amount = 1
  tier = "1000"
  is_gift = $true
  raw = @{ eventsub_type = "channel.subscribe"; tier = "1000"; is_gift = $true }
}

Send-AlertTest "resub -> resub" @{
  source = "twitch"
  type = "resub"
  user = "ResubStep204"
  user_login = "resubstep204"
  amount = 12
  message = "Resub Text fuer TTS-Test spaeter"
  tier = "1000"
  cumulative_months = 12
  raw = @{ eventsub_type = "channel.subscription.message"; tier = "1000"; cumulative_months = 12; streak_months = 3; message = @{ text = "Resub Text fuer TTS-Test spaeter" } }
}

Send-AlertTest "gift_sub total 4 -> gift_sub" @{
  source = "twitch"
  type = "gift_sub"
  user = "GiftSubStep204"
  user_login = "giftsubstep204"
  amount = 4
  tier = "1000"
  total = 4
  raw = @{ eventsub_type = "channel.subscription.gift"; tier = "1000"; total = 4; cumulative_total = 4; is_anonymous = $false }
}

Send-AlertTest "gift_bomb total 5 -> gift_bomb" @{
  source = "twitch"
  type = "gift_bomb"
  user = "GiftBombStep204"
  user_login = "giftbombstep204"
  amount = 5
  tier = "1000"
  total = 5
  raw = @{ eventsub_type = "channel.subscription.gift"; tier = "1000"; total = 5; cumulative_total = 5; is_anonymous = $false }
}

Write-Host "`n=== Latest events ===" -ForegroundColor Cyan
Invoke-RestMethod "$BaseUrl/api/alerts/events?limit=10" | ConvertTo-Json -Depth 30
