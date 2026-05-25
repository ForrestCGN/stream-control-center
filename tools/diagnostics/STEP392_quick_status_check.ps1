param(
  [string]$BaseUrl = "http://127.0.0.1:8080"
)

$ErrorActionPreference = "Stop"
function Write-Step([string]$msg) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "$ts $msg"
}

Write-Step "STEP392 quick status check started"
Write-Step "BaseUrl=$BaseUrl"
Write-Step "Expected active OBS overlay: $BaseUrl/overlays/_overlay-alerts-v2.html"
Write-Step "Forbidden production overlay: $BaseUrl/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge"

$overlayResp = Invoke-WebRequest "$BaseUrl/overlays/_overlay-alerts-v2.html" -UseBasicParsing
Write-Step "OverlayUrlStatus=$($overlayResp.StatusCode) url=$BaseUrl/overlays/_overlay-alerts-v2.html"

$alertStatus = Invoke-RestMethod "$BaseUrl/api/alerts/status"
Write-Step "AlertStatus ok=$($alertStatus.ok) step=$($alertStatus.step) mode=$($alertStatus.mode) overlayClients=$($alertStatus.overlayClients) currentEventId=$($alertStatus.currentEventId) queueLength=$($alertStatus.queueLength)"

$ow = $alertStatus.overlayWatchdog
if ($ow -and $ow.stats) {
  Write-Step "OverlayWatchdog issues=$($ow.stats.issues) missingFinishAck=$($ow.stats.missingFinishAck) noClient=$($ow.stats.noClient) overlayClients=$($ow.overlayClients)"
}

$comm = Invoke-RestMethod "$BaseUrl/api/communication/status"
$clients = @($comm.status.clients)
$clientSummary = ($clients | ForEach-Object { "$($_.id):$($_.module):$($_.type):$($_.status)" }) -join ","
Write-Step "CommunicationClients=$clientSummary"
$direct = $clients | Where-Object { $_.id -eq "alert_overlay_v2_shadow" -and $_.status -eq "online" } | Select-Object -First 1
$bridge = $clients | Where-Object { $_.id -eq "overlay_alerts_v2_bus_bridge" -and $_.status -eq "online" } | Select-Object -First 1
Write-Step "DirectOverlayBusClientOnline=$([bool]$direct)"
Write-Step "BridgeClientOnline=$([bool]$bridge)"

$watchdog = Invoke-RestMethod "$BaseUrl/api/communication/watchdog?includeRecovered=true"
Write-Step "CommunicationWatchdog issueCount=$($watchdog.issueCount) recovered=$($watchdog.recoveredCount)"

$pass = $overlayResp.StatusCode -eq 200 -and [int]$alertStatus.overlayClients -ge 1 -and [bool]$direct -and -not [bool]$bridge -and [int]$watchdog.issueCount -eq 0
if ($pass) {
  Write-Step "STEP392_STATUS=PASS"
  exit 0
}

Write-Step "STEP392_STATUS=CHECK_NEEDED"
exit 1
