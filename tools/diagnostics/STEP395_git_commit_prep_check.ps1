param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [string]$RepoPath = "D:\Git\stream-control-center"
)

function Write-StepLog {
  param([string]$Message)
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "$ts $Message"
}

function Get-SafeInt {
  param($Value, [int]$Fallback = 0)
  if ($null -eq $Value) { return $Fallback }
  try { return [int]$Value } catch { return $Fallback }
}

function Has-Command {
  param([string]$Name)
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  return $null -ne $cmd
}

$ErrorActionPreference = "Stop"
$expectedOverlay = "$BaseUrl/overlays/_overlay-alerts-v2.html"
$forbiddenBridge = "$BaseUrl/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge"
$ok = $true

Write-StepLog "STEP395 git commit prep check started"
Write-StepLog "RepoPath=$RepoPath"
Write-StepLog "Expected active OBS overlay: $expectedOverlay"
Write-StepLog "Forbidden production overlay: $forbiddenBridge"

try {
  $overlayResponse = Invoke-WebRequest $expectedOverlay -UseBasicParsing -TimeoutSec 5
  Write-StepLog "OverlayUrlStatus=$($overlayResponse.StatusCode) url=$expectedOverlay"
  if ($overlayResponse.StatusCode -ne 200) { $ok = $false }
} catch {
  Write-StepLog "OverlayUrlStatus=ERROR $($_.Exception.Message)"
  $ok = $false
}

try {
  $alertStatus = Invoke-RestMethod "$BaseUrl/api/alerts/status" -TimeoutSec 5
  $overlayClients = Get-SafeInt $alertStatus.overlayClients 0
  $queueLength = Get-SafeInt $alertStatus.queueLength 0
  Write-StepLog "AlertStatus ok=$($alertStatus.ok) step=$($alertStatus.step) mode=$($alertStatus.mode) overlayClients=$overlayClients currentEventId=$($alertStatus.currentEventId) queueLength=$queueLength"
  if ($alertStatus.ok -ne $true) { $ok = $false }
  if ($overlayClients -lt 1) { $ok = $false }
  if ($queueLength -ne 0) { $ok = $false }

  $ow = $alertStatus.overlayWatchdog
  if ($null -ne $ow -and $null -ne $ow.stats) {
    $owIssues = Get-SafeInt $ow.stats.issues 0
    $missingFinishAck = Get-SafeInt $ow.stats.missingFinishAck 0
    $noClient = Get-SafeInt $ow.stats.noClient 0
    Write-StepLog "OverlayWatchdog issues=$owIssues missingFinishAck=$missingFinishAck noClient=$noClient overlayClients=$($ow.overlayClients)"
    if ($owIssues -ne 0 -or $missingFinishAck -ne 0 -or $noClient -ne 0) { $ok = $false }
  } else {
    Write-StepLog "OverlayWatchdog=MISSING"
    $ok = $false
  }
} catch {
  Write-StepLog "AlertStatus=ERROR $($_.Exception.Message)"
  $ok = $false
}

try {
  $comm = Invoke-RestMethod "$BaseUrl/api/communication/status" -TimeoutSec 5
  $clients = @($comm.status.clients)
  $clientSummary = ($clients | ForEach-Object { "$($_.id):$($_.module):$($_.type):$($_.status)" }) -join ","
  Write-StepLog "CommunicationClients=$clientSummary"
  $directClient = $clients | Where-Object { $_.id -eq "alert_overlay_v2_shadow" -and $_.status -eq "online" } | Select-Object -First 1
  $bridgeClient = $clients | Where-Object { $_.id -eq "overlay_alerts_v2_bus_bridge" -and $_.status -eq "online" } | Select-Object -First 1
  Write-StepLog "DirectOverlayBusClientOnline=$([bool]$directClient)"
  Write-StepLog "BridgeClientOnline=$([bool]$bridgeClient)"
  if (-not $directClient) { $ok = $false }
  if ($bridgeClient) { $ok = $false }
} catch {
  Write-StepLog "CommunicationStatus=ERROR $($_.Exception.Message)"
  $ok = $false
}

try {
  $watchdog = Invoke-RestMethod "$BaseUrl/api/communication/watchdog?includeRecovered=true" -TimeoutSec 5
  $issueCount = Get-SafeInt $watchdog.issueCount 0
  Write-StepLog "CommunicationWatchdog issueCount=$issueCount recovered=$($watchdog.recoveredCount)"
  if ($issueCount -ne 0) { $ok = $false }
} catch {
  Write-StepLog "CommunicationWatchdog=ERROR $($_.Exception.Message)"
  $ok = $false
}

if (Test-Path $RepoPath) {
  Push-Location $RepoPath
  try {
    if (Has-Command "git") {
      Write-StepLog "Git branch:"
      git branch --show-current
      Write-StepLog "Git status:"
      git status --short
      Write-StepLog "Recommended commit commands:"
      Write-Host "git add backend config htdocs project-state docs tools"
      Write-Host "git commit -m \"STEP395: stabilize direct alert overlay bus flow\""
      Write-Host "git push origin dev"
    } else {
      Write-StepLog "Git command not found"
      $ok = $false
    }
  } finally {
    Pop-Location
  }
} else {
  Write-StepLog "RepoPath not found: $RepoPath"
  $ok = $false
}

if ($ok) {
  Write-Host "STEP395_STATUS=READY_TO_COMMIT"
  exit 0
}

Write-Host "STEP395_STATUS=CHECK_FAILED"
exit 1
