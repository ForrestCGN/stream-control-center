param(
  [string]$BaseUrl = "http://127.0.0.1:8080"
)

$ErrorActionPreference = "Stop"

function Show-Json($Title, $Value) {
  Write-Host ""
  Write-Host "=== $Title ===" -ForegroundColor Cyan
  $Value | ConvertTo-Json -Depth 30
}

Write-Host "STEP203 Alert Provider Safety Tests" -ForegroundColor Green
Write-Host "BaseUrl: $BaseUrl"

$status = Invoke-RestMethod "$BaseUrl/api/alerts/status"
Show-Json "Alert status" $status

$events = Invoke-RestMethod "$BaseUrl/api/alerts/events?limit=100"
Show-Json "Alert events count" ([pscustomobject]@{
  ok = $events.ok
  count = @($events.events).Count
  newest = @($events.events | Select-Object -First 3)
})

Write-Host ""
Write-Host "Tipeee Twitch-Mirror Test über lokalen Test-Endpunkt (type=cheer)." -ForegroundColor Yellow
Write-Host "Erwartung: ignored_twitch_mirror ODER provider_disabled, aber kein Alert-Queue-Eintrag."

try {
  $mirror = Invoke-RestMethod "$BaseUrl/api/alerts/tipeee/test?type=cheer&user=Step203Mirror&amount=0&message=Cheer100"
  Show-Json "Tipeee mirror test result" $mirror
} catch {
  Write-Host "Tipeee test endpoint returned an error. Das ist ok, wenn der Provider deaktiviert ist." -ForegroundColor Yellow
  Write-Host $_.Exception.Message
}

$queue = Invoke-RestMethod "$BaseUrl/api/alerts/queue"
Show-Json "Alert queue after mirror test" $queue

Write-Host ""
Write-Host "Optionaler Disable-Test:" -ForegroundColor Yellow
Write-Host "1) Alerts im Dashboard oder per Config deaktivieren."
Write-Host "2) Dann diesen POST lokal ausführen:"
Write-Host 'Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/enqueue" -Method Post -ContentType "application/json" -Body ''{"source":"twitch","type":"bits","user":"DisableTest","amount":1,"message":"disabled test"}'''
Write-Host "Erwartung: alerts_disabled oder alert_queue_disabled, kein Queue-Eintrag."
