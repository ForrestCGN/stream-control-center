param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [int]$DurationMs = 5000,
  [string]$User = "STEP401_VIP_Test"
)

$ErrorActionPreference = "Continue"
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path (Get-Location) "STEP401_vip_overlay_event_shadow_test_$stamp.log"

function Log($msg) {
  $line = "{0} {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $msg
  Write-Host $line
  Add-Content -Path $logFile -Value $line -Encoding UTF8
}

function TryGetJson($url) {
  try { return Invoke-RestMethod $url -TimeoutSec 10 }
  catch {
    Log ("GET failed: {0} :: {1}" -f $url, $_.Exception.Message)
    return $null
  }
}

function TryWebStatus($url) {
  try { return (Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 10).StatusCode }
  catch {
    Log ("WEB failed: {0} :: {1}" -f $url, $_.Exception.Message)
    return 0
  }
}

function Get-Prop($obj, $name, $fallback = $null) {
  if ($null -eq $obj) { return $fallback }
  $p = $obj.PSObject.Properties[$name]
  if ($null -eq $p) { return $fallback }
  if ($null -eq $p.Value) { return $fallback }
  return $p.Value
}

function GetClients($commStatus) {
  if ($null -eq $commStatus -or $null -eq $commStatus.status -or $null -eq $commStatus.status.clients) { return @() }
  return @($commStatus.status.clients)
}

function GetEventById($commStatus, $eventId) {
  if ($null -eq $commStatus -or $null -eq $commStatus.status -or $null -eq $commStatus.status.events) { return $null }
  foreach ($ev in @($commStatus.status.events)) {
    if ([string]$ev.id -eq [string]$eventId) { return $ev }
  }
  return $null
}

function Encode($value) { return [System.Uri]::EscapeDataString([string]$value) }

Log "STEP401 VIP overlay event shadow test started"
Log "BaseUrl=$BaseUrl"
Log "DurationMs=$DurationMs"

$ok = $true
$overlayUrl = "$BaseUrl/overlays/vip_sound_overlay_v2.html"
$overlayStatus = TryWebStatus $overlayUrl
Log "VipOverlayUrlStatus=$overlayStatus url=$overlayUrl"
if ($overlayStatus -ne 200) { $ok = $false }

$vipStatus = TryGetJson "$BaseUrl/api/vip-sound/status"
if ($vipStatus) { Log "VipStatus ok=$(Get-Prop $vipStatus 'ok' '') version=$(Get-Prop $vipStatus 'version' '')" }

$soundBefore = TryGetJson "$BaseUrl/api/sound/status"
$beforeCurrent = ""
$beforeQueue = 0
if ($soundBefore) {
  $beforeCurrent = Get-Prop $soundBefore.current 'requestId' ''
  if ($soundBefore.queue) { $beforeQueue = @($soundBefore.queue).Count }
  Log "SoundBefore currentRequestId=$beforeCurrent queuedCount=$beforeQueue"
}

$commBefore = TryGetJson "$BaseUrl/api/communication/status"
$clientsBefore = GetClients $commBefore
$lineBefore = ($clientsBefore | ForEach-Object { "{0}:{1}:{2}:{3}" -f $_.id,$_.module,$_.type,$_.status }) -join ","
Log "CommunicationClientsBefore=$lineBefore"
$vipClient = $clientsBefore | Where-Object { $_.id -eq "vip_sound_overlay_v2" -and $_.module -eq "vip_sound_overlay" -and $_.status -eq "online" } | Select-Object -First 1
Log "VipBusClientOnline=$([bool]$vipClient)"
if (-not $vipClient) { $ok = $false; Log "FAIL vip_bus_client_not_online" }

$testUrl = "$BaseUrl/api/communication/test-vip-overlay?user=$(Encode $User)&durationMs=$DurationMs&requireAck=true&replayable=true"
Log "Trying VIP bus shadow route: $testUrl"
$emit = TryGetJson $testUrl
$eventId = ""
$deliveredCount = 0
$deliveredTo = @()
if ($emit -and $emit.result) {
  $eventId = Get-Prop $emit.result 'eventId' ''
  $deliveredCount = [int](Get-Prop $emit.result 'deliveredCount' 0)
  if ($emit.result.deliveredTo) { $deliveredTo = @($emit.result.deliveredTo) }
}
Log "Emit ok=$(Get-Prop $emit 'ok' '') eventId=$eventId deliveredCount=$deliveredCount deliveredTo=$($deliveredTo -join ',')"
if (-not $emit -or -not $eventId) { $ok = $false; Log "FAIL emit_failed_or_no_eventId" }
if ($deliveredTo -notcontains "vip_sound_overlay_v2") { $ok = $false; Log "FAIL deliveredTo_missing_vip_sound_overlay_v2" }

Start-Sleep -Milliseconds 1200
$commAfterEmit = TryGetJson "$BaseUrl/api/communication/status"
$evAfterEmit = GetEventById $commAfterEmit $eventId
$ackCountAfterEmit = if ($evAfterEmit) { [int](Get-Prop $evAfterEmit 'ackCount' 0) } else { -1 }
Log "EventAfterEmit id=$eventId ackCount=$ackCountAfterEmit eventStillPresent=$([bool]$evAfterEmit)"
if ($ackCountAfterEmit -lt 1) { $ok = $false; Log "FAIL ackCount_less_than_1" }

$soundAfter = TryGetJson "$BaseUrl/api/sound/status"
$afterCurrent = ""
$afterQueue = 0
if ($soundAfter) {
  $afterCurrent = Get-Prop $soundAfter.current 'requestId' ''
  if ($soundAfter.queue) { $afterQueue = @($soundAfter.queue).Count }
  Log "SoundAfter currentRequestId=$afterCurrent queuedCount=$afterQueue"
}
if ($afterCurrent -ne $beforeCurrent) { Log "WARN sound_current_changed_before=$beforeCurrent after=$afterCurrent" }
if ($afterQueue -ne $beforeQueue) { Log "WARN sound_queue_changed_before=$beforeQueue after=$afterQueue" }

$watchdog = TryGetJson "$BaseUrl/api/communication/watchdog?includeRecovered=true"
$issueCount = 999
if ($watchdog -and $watchdog.diagnosis) { $issueCount = [int](Get-Prop $watchdog.diagnosis 'issueCount' 999) }
elseif ($watchdog) { $issueCount = [int](Get-Prop $watchdog 'issueCount' 999) }
Log "CommunicationWatchdog issueCount=$issueCount"
if ($issueCount -ne 0) { $ok = $false; Log "FAIL communication_watchdog_issues" }

if ($ok) {
  Log "STEP401_STATUS=PASS"
  exit 0
} else {
  Log "STEP401_STATUS=CHECK_REQUIRED"
  Log "LogFile=$logFile"
  exit 1
}
