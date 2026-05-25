param(
  [string]$BaseUrl = "http://127.0.0.1:8080"
)

$ErrorActionPreference = "Stop"

function Log([string]$Message) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "$ts $Message"
}

function SafeGetJson([string]$Url) {
  try { return Invoke-RestMethod $Url -TimeoutSec 8 }
  catch { Log "ERROR requesting $Url :: $($_.Exception.Message)"; return $null }
}

function Get-PropOrDefault($Object, [string]$Name, $DefaultValue) {
  if ($null -eq $Object) { return $DefaultValue }
  $prop = $Object.PSObject.Properties[$Name]
  if ($null -eq $prop) { return $DefaultValue }
  if ($null -eq $prop.Value) { return $DefaultValue }
  return $prop.Value
}

function To-IntDefault($Value, [int]$DefaultValue) {
  if ($null -eq $Value) { return $DefaultValue }
  try { return [int]$Value } catch { return $DefaultValue }
}

Log "STEP393A quick status check started"
Log "BaseUrl=$BaseUrl"
Log "Expected active OBS overlay: $BaseUrl/overlays/_overlay-alerts-v2.html"
Log "Forbidden production overlay: $BaseUrl/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge"

try {
  $overlayResp = Invoke-WebRequest "$BaseUrl/overlays/_overlay-alerts-v2.html" -UseBasicParsing -TimeoutSec 8
  Log "OverlayUrlStatus=$($overlayResp.StatusCode) url=$BaseUrl/overlays/_overlay-alerts-v2.html"
} catch {
  Log "OverlayUrlStatus=ERROR $($_.Exception.Message)"
  Write-Host "STEP393A_STATUS=FAIL"
  exit 1
}

$alertStatus = SafeGetJson "$BaseUrl/api/alerts/status"
if (-not $alertStatus) { Write-Host "STEP393A_STATUS=FAIL"; exit 1 }

$ow = $alertStatus.overlayWatchdog
$owStats = $null
if ($ow) { $owStats = $ow.stats }
$owIssues = To-IntDefault (Get-PropOrDefault $owStats "issues" 0) 0
$missingFinishAck = To-IntDefault (Get-PropOrDefault $owStats "missingFinishAck" 0) 0
$noClient = To-IntDefault (Get-PropOrDefault $owStats "noClient" 0) 0
$owOverlayClients = To-IntDefault (Get-PropOrDefault $ow "overlayClients" 0) 0

Log "AlertStatus ok=$($alertStatus.ok) step=$($alertStatus.step) mode=$($alertStatus.outputMode) overlayClients=$($alertStatus.overlayClients) currentEventId=$($alertStatus.currentEventId) queueLength=$($alertStatus.queueLength)"
Log "OverlayWatchdog issues=$owIssues missingFinishAck=$missingFinishAck noClient=$noClient overlayClients=$owOverlayClients"

$comm = SafeGetJson "$BaseUrl/api/communication/status"
$clients = @()
if ($comm -and $comm.status -and $comm.status.clients) { $clients = @($comm.status.clients) }
$clientText = ($clients | ForEach-Object { "$($_.id):$($_.module):$($_.type):$($_.status)" }) -join ","
Log "CommunicationClients=$clientText"
$directOnline = [bool]($clients | Where-Object { $_.id -eq "alert_overlay_v2_shadow" -and $_.status -eq "online" } | Select-Object -First 1)
$bridgeOnline = [bool]($clients | Where-Object { $_.id -eq "overlay_alerts_v2_bus_bridge" -and $_.status -eq "online" } | Select-Object -First 1)
Log "DirectOverlayBusClientOnline=$directOnline"
Log "BridgeClientOnline=$bridgeOnline"

$commWatch = SafeGetJson "$BaseUrl/api/communication/watchdog?includeRecovered=true"
$commIssueCount = To-IntDefault (Get-PropOrDefault $commWatch "issueCount" 0) 0
$recoveredCount = Get-PropOrDefault $commWatch "recoveredCount" ""
Log "CommunicationWatchdog issueCount=$commIssueCount recovered=$recoveredCount"

$pass = $true
if ([int]$alertStatus.overlayClients -lt 1) { $pass = $false }
if (-not $directOnline) { $pass = $false }
if ($bridgeOnline) { $pass = $false }
if ($owIssues -ne 0 -or $missingFinishAck -ne 0 -or $noClient -ne 0) { $pass = $false }
if ($commIssueCount -ne 0) { $pass = $false }

if ($pass) {
  Write-Host "STEP393A_STATUS=PASS"
  exit 0
}

Write-Host "STEP393A_STATUS=FAIL"
exit 1
