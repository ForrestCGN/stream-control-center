param(
  [string]$BaseUrl = "http://127.0.0.1:8080"
)

$ErrorActionPreference = "Stop"

function Write-StepLog {
  param([string]$Message)
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "$ts $Message"
}

function Get-JsonSafe {
  param([string]$Url)
  try {
    return Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 10
  } catch {
    Write-StepLog "REQUEST_FAILED url=$Url error=$($_.Exception.Message)"
    return $null
  }
}

function Get-StatusCodeSafe {
  param([string]$Url)
  try {
    $res = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -TimeoutSec 10
    return [int]$res.StatusCode
  } catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      return [int]$_.Exception.Response.StatusCode
    }
    return 0
  }
}

Write-StepLog "STEP402 VIP event shadow stable check started"
Write-StepLog "BaseUrl=$BaseUrl"

$overlayUrl = "$BaseUrl/overlays/vip_sound_overlay_v2.html"
$overlayStatus = Get-StatusCodeSafe $overlayUrl
Write-StepLog "VipOverlayUrlStatus=$overlayStatus url=$overlayUrl"

$vipStatus = Get-JsonSafe "$BaseUrl/api/vip-sound/status"
if ($vipStatus) {
  $vipVersion = ""
  if ($vipStatus.version) { $vipVersion = [string]$vipStatus.version }
  Write-StepLog "VipStatus ok=$($vipStatus.ok) version=$vipVersion"
} else {
  Write-StepLog "VipStatus unavailable"
}

$soundStatus = Get-JsonSafe "$BaseUrl/api/sound/status"
if ($soundStatus) {
  $currentId = ""
  $queuedCount = ""
  if ($soundStatus.current -and $soundStatus.current.requestId) { $currentId = [string]$soundStatus.current.requestId }
  if ($null -ne $soundStatus.queuedCount) { $queuedCount = [string]$soundStatus.queuedCount }
  elseif ($soundStatus.queue -and $soundStatus.queue.items) { $queuedCount = [string]$soundStatus.queue.items.Count }
  elseif ($soundStatus.queue) { $queuedCount = [string]$soundStatus.queue.Count }
  Write-StepLog "SoundStatus ok=$($soundStatus.ok) currentRequestId=$currentId queuedCount=$queuedCount"
} else {
  Write-StepLog "SoundStatus unavailable"
}

$comm = Get-JsonSafe "$BaseUrl/api/communication/status"
$vipClientOnline = $false
$clientsLine = ""
if ($comm -and $comm.status -and $comm.status.clients) {
  $parts = @()
  foreach ($c in $comm.status.clients) {
    $id = ""
    $module = ""
    $type = ""
    $status = ""
    if ($c.id) { $id = [string]$c.id }
    elseif ($c.clientId) { $id = [string]$c.clientId }
    if ($c.module) { $module = [string]$c.module }
    if ($c.type) { $type = [string]$c.type }
    elseif ($c.clientType) { $type = [string]$c.clientType }
    if ($c.status) { $status = [string]$c.status }
    elseif ($c.connected -eq $true) { $status = "online" }
    $parts += "$id`:$module`:$type`:$status"
    if ($id -eq "vip_sound_overlay_v2" -and $module -eq "vip_sound_overlay" -and ($status -eq "online" -or $c.connected -eq $true)) {
      $vipClientOnline = $true
    }
  }
  $clientsLine = ($parts -join ",")
}
Write-StepLog "CommunicationClients=$clientsLine"
Write-StepLog "VipBusClientOnline=$vipClientOnline"

$watchdog = Get-JsonSafe "$BaseUrl/api/communication/watchdog/status"
$issueCount = ""
if ($watchdog) {
  if ($null -ne $watchdog.issueCount) { $issueCount = [string]$watchdog.issueCount }
  elseif ($watchdog.issues) { $issueCount = [string]$watchdog.issues.Count }
  else { $issueCount = "0" }
  Write-StepLog "CommunicationWatchdog issueCount=$issueCount"
} else {
  Write-StepLog "CommunicationWatchdog unavailable"
}

$pass = $true
if ($overlayStatus -ne 200) { $pass = $false }
if (-not $vipStatus -or $vipStatus.ok -ne $true) { $pass = $false }
if (-not $soundStatus -or $soundStatus.ok -ne $true) { $pass = $false }
if (-not $vipClientOnline) { $pass = $false }
if ($issueCount -ne "" -and $issueCount -ne "0") { $pass = $false }

if ($pass) {
  Write-Host "STEP402_STATUS=PASS"
  exit 0
}

Write-Host "STEP402_STATUS=CHECK_REQUIRED"
exit 1
