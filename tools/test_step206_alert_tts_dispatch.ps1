$ErrorActionPreference = "Stop"

Write-Host "STEP206 Alert TTS Dispatch Test" -ForegroundColor Cyan

Write-Host "1) TTS status" -ForegroundColor Yellow
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/status" | ConvertTo-Json -Depth 10

Write-Host "2) Alert rules with TTS enabled" -ForegroundColor Yellow
$data = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/rules"
$data.rules |
  Where-Object { $_.tts_enabled -eq 1 } |
  Select-Object id, source, type_key, label, enabled, tts_enabled, tts_timing, tts_template, tts_max_chars |
  ConvertTo-Json -Depth 20

Write-Host "3) Tipeee donation alert with TTS" -ForegroundColor Yellow
$payload = @{
  event = @{
    id = "TEST_STEP206_TIPEEE_TTS_001"
    type = "donation"
    origin = "tipeee"
    ref = "TIPEEE_STEP206_TTS_001"
    parameters = @{
      username = "Step206Tipeee"
      amount = 6.66
      message = "Dies ist der STEP zweihundert sechs TTS Test fuer Tipeee."
      currency = "EUR"
    }
  }
} | ConvertTo-Json -Depth 20

Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8080/api/alerts/tipeee/webhook" `
  -ContentType "application/json" `
  -Body $payload | ConvertTo-Json -Depth 30

Write-Host "4) Wait 3 seconds, then show latest alert events" -ForegroundColor Yellow
Start-Sleep -Seconds 3
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/events?limit=3" | ConvertTo-Json -Depth 40
