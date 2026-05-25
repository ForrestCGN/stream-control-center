param(
  [string]$BaseUrl = "http://127.0.0.1:8080"
)

$ErrorActionPreference = "Stop"

function Log([string]$Message) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "$ts $Message"
}

function Get-PropValue($obj, [string]$name, $fallback = $null) {
  if ($null -eq $obj) { return $fallback }
  $p = $obj.PSObject.Properties[$name]
  if ($null -eq $p) { return $fallback }
  if ($null -eq $p.Value) { return $fallback }
  return $p.Value
}

function As-Int($value, [int]$fallback = 0) {
  try {
    if ($null -eq $value -or "$value" -eq "") { return $fallback }
    return [int]$value
  } catch {
    return $fallback
  }
}

Log "STEP394 final stable status check started"
Log "BaseUrl=$BaseUrl"
Log "Expected active OBS overlay: $BaseUrl/overlays/_overlay-alerts-v2.html"
Log "Forbidden production overlay: $BaseUrl/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge"

$ok = $true

try {
  $overlay = Invoke-WebRequest "$BaseUrl/overlays/_overlay-alerts-v2.html" -UseBasicParsing
  Log "OverlayUrlStatus=$($overlay.StatusCode) url=$BaseUrl/overlays/_overlay-alerts-v2.html"
  if ($overlay.StatusCode -ne 200) { $ok = $false }
} catch {
  Log "OverlayUrlStatus=ERROR $($_.Exception.Message)"
  $ok = $false
}

try {
  $alertStatus = Invoke-RestMethod "$BaseUrl/api/alerts/status"
  $step = Get-PropValue $alertStatus "step" ""
  $mode = Get-PropValue $alertStatus "mode" ""
  $overlayClients = As-Int (Get-PropValue $alertStatus "overlayClients" 0)
  $currentEventId = Get-PropValue $alertStatus "currentEventId" ""
  $queueLength = As-Int (Get-PropValue $alertStatus "queueLength" 0)
  Log "AlertStatus ok=$($alertStatus.ok) step=$step mode=$mode overlayClients=$overlayClients currentEventId=$currentEventId queueLength=$queueLength"

  if ($overlayClients -lt 1) { $ok = $false }

  $ow = Get-PropValue $alertStatus "overlayWatchdog" $null
  $owStats = Get-PropValue $ow "stats" $null
  $owIssues = As-Int (Get-PropValue $owStats "issues" 0)
  $missingFinishAck = As-Int (Get-PropValue $owStats "missingFinishAck" 0)
  $noClient = As-Int (Get-PropValue $owStats "noClient" 0)
  $owClients = As-Int (Get-PropValue $ow "overlayClients" 0)
  Log "OverlayWatchdog issues=$owIssues missingFinishAck=$missingFinishAck noClient=$noClient overlayClients=$owClients"
  if ($owIssues -ne 0 -or $missingFinishAck -ne 0 -or $noClient -ne 0) { $ok = $false }
} catch {
  Log "AlertStatus=ERROR $($_.Exception.Message)"
  $ok = $false
}

$directOnline = $false
$bridgeOnline = $false

try {
  $comm = Invoke-RestMethod "$BaseUrl/api/communication/status"
  $clients = @()
  if ($comm.status -and $comm.status.clients) { $clients = @($comm.status.clients) }
  $clientText = ($clients | ForEach-Object {
    "$($_.id):$($_.module):$($_.type):$($_.status)"
  }) -join ","
  Log "CommunicationClients=$clientText"

  foreach ($c in $clients) {
    if ($c.id -eq "alert_overlay_v2_shadow" -and $c.status -eq "online") { $directOnline = $true }
    if ($c.id -eq "overlay_alerts_v2_bus_bridge" -and $c.status -eq "online") { $bridgeOnline = $true }
  }

  Log "DirectOverlayBusClientOnline=$directOnline"
  Log "BridgeClientOnline=$bridgeOnline"

  if (-not $directOnline) { $ok = $false }
  if ($bridgeOnline) { $ok = $false }
} catch {
  Log "CommunicationStatus=ERROR $($_.Exception.Message)"
  $ok = $false
}

try {
  $watch = Invoke-RestMethod "$BaseUrl/api/communication/watchdog?includeRecovered=true"
  $issueCount = As-Int (Get-PropValue $watch "issueCount" 0)
  $recovered = Get-PropValue $watch "recovered" ""
  Log "CommunicationWatchdog issueCount=$issueCount recovered=$recovered"
  if ($issueCount -ne 0) { $ok = $false }
} catch {
  Log "CommunicationWatchdog=ERROR $($_.Exception.Message)"
  $ok = $false
}

if ($ok) {
  Write-Host "STEP394_STATUS=PASS"
  exit 0
}

Write-Host "STEP394_STATUS=FAIL"
exit 1
