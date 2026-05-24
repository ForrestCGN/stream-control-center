param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [switch]$TriggerTestAlert,
  [switch]$ResetWatchdog,
  [int]$WatchSeconds = 20
)

$ErrorActionPreference = "Stop"

function Invoke-CgnJson {
  param(
    [Parameter(Mandatory=$true)][string]$Url,
    [string]$Method = "GET",
    [object]$Body = $null
  )

  if ($null -ne $Body) {
    $json = $Body | ConvertTo-Json -Depth 20
    return Invoke-RestMethod -Uri $Url -Method $Method -ContentType "application/json" -Body $json
  }

  return Invoke-RestMethod -Uri $Url -Method $Method
}

function Show-Headline {
  param([string]$Text)
  Write-Host ""
  Write-Host "=== $Text ===" -ForegroundColor Cyan
}

function Get-AlertStatus {
  Invoke-CgnJson "$BaseUrl/api/alerts/status"
}

function Get-SoundStatus {
  Invoke-CgnJson "$BaseUrl/api/sound/status"
}

function Show-CompactStatus {
  $alerts = Get-AlertStatus
  $sound = Get-SoundStatus

  Show-Headline "Alert Status"
  [pscustomobject]@{
    alertStep       = $alerts.step
    overlayClients  = $alerts.overlayClients
    queueLength     = $alerts.queueLength
    currentEventId  = $alerts.currentEventId
    outputMode      = $alerts.alertOutput.mode
    lastOutputMode  = $alerts.alertOutput.stats.lastMode
    outputLastEvent = $alerts.alertOutput.stats.lastEventUid
    watchdogIssues  = $alerts.overlayWatchdog.stats.issues
    watchdogNoClient = $alerts.overlayWatchdog.stats.noClient
    watchdogMissingAck = $alerts.overlayWatchdog.stats.missingFinishAck
  } | Format-List

  Show-Headline "Sound Status"
  [pscustomobject]@{
    soundStep      = $sound.step
    currentSound   = if ($sound.current) { $sound.current.requestId } else { "" }
    queuedCount    = $sound.queuedCount
    parallelCount  = $sound.parallelCount
    clientConnected = $sound.client.connected
    clientLastEvent = $sound.client.lastEvent
  } | Format-List

  Show-Headline "Letzte SoundBus Client-Events"
  $clientEvents = @($sound.soundBus.recentEvents | Where-Object { $_.kind -eq "client" -or $_.action -like "client*" } | Select-Object -First 8)
  if ($clientEvents.Count -eq 0) {
    Write-Host "Keine Client-Events in recentEvents." -ForegroundColor Yellow
  } else {
    $clientEvents | Select-Object at, action, reason, @{Name='requestId';Expression={$_.context.requestId}}, @{Name='label';Expression={$_.context.label}} | Format-Table -AutoSize
  }
}

Show-Headline "STEP361 Alert/SoundBus Reconnect Diagnose"
Write-Host "BaseUrl: $BaseUrl"

if ($ResetWatchdog) {
  Show-Headline "Watchdog Reset"
  Invoke-CgnJson "$BaseUrl/api/alerts/overlay-watchdog/reset?confirm=1" | Out-Null
  Write-Host "Alert Overlay Watchdog wurde zurückgesetzt." -ForegroundColor Green
}

Show-CompactStatus

if ($TriggerTestAlert) {
  Show-Headline "Test-Alert starten"
  $body = @{
    source = "twitch"
    type_key = "bits"
    type = "bits"
    user = "STEP361Test"
    userLogin = "step361test"
    amount = 100
    message = "STEP361 Reconnect Test"
  }

  $result = Invoke-CgnJson "$BaseUrl/api/alerts/test" "POST" $body
  $result | Format-List

  Write-Host ""
  Write-Host "Jetzt während der Alert läuft die OBS-Browserquelle des Alert-Overlays einmal aktualisieren." -ForegroundColor Yellow
  Write-Host "Dieses Skript beobachtet danach Status, Watchdog und SoundBus." -ForegroundColor Yellow

  $end = (Get-Date).AddSeconds([Math]::Max(5, $WatchSeconds))
  while ((Get-Date) -lt $end) {
    Start-Sleep -Seconds 2
    $alerts = Get-AlertStatus
    $sound = Get-SoundStatus
    $lastClient = @($sound.soundBus.recentEvents | Where-Object { $_.kind -eq "client" -or $_.action -like "client*" } | Select-Object -First 1)
    [pscustomobject]@{
      time = (Get-Date).ToString("HH:mm:ss")
      currentEventId = $alerts.currentEventId
      queueLength = $alerts.queueLength
      overlayClients = $alerts.overlayClients
      watchdogIssues = $alerts.overlayWatchdog.stats.issues
      watchdogMissingAck = $alerts.overlayWatchdog.stats.missingFinishAck
      soundClientLastEvent = $sound.client.lastEvent
      lastSoundBusClientAction = if ($lastClient.Count) { $lastClient[0].action } else { "" }
      lastSoundBusRequestId = if ($lastClient.Count) { $lastClient[0].context.requestId } else { "" }
    } | Format-Table -AutoSize
  }

  Show-CompactStatus
}

Show-Headline "Bewertung"
Write-Host "OK, wenn alertStep=360 ist und beim Test keine neuen watchdogIssues/missingFinishAck entstehen." -ForegroundColor Green
Write-Host "OK, wenn SoundBus weiterhin client.audio_started/client_audio_ended für Overlay-Sounds zeigt." -ForegroundColor Green
