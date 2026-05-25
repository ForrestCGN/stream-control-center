$ErrorActionPreference = "Stop"

$BaseUrl = "http://127.0.0.1:8080"
$OverlayUrl = "$BaseUrl/overlays/vip_sound_overlay_v2.html"

function LogLine([string]$Message) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "$ts $Message"
}

function Get-Json($Url) {
  return Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 8
}

LogLine "STEP400 VIP bus shadow stable check started"
LogLine "BaseUrl=$BaseUrl"

try {
  $overlayResponse = Invoke-WebRequest -Uri $OverlayUrl -UseBasicParsing -TimeoutSec 8
  LogLine "VipOverlayUrlStatus=$($overlayResponse.StatusCode)"
} catch {
  LogLine "VipOverlayUrlStatus=ERROR message=$($_.Exception.Message)"
}

try {
  $vipStatus = Get-Json "$BaseUrl/api/vip-sound/status"
  LogLine "VipStatus ok=$($vipStatus.ok) version=$($vipStatus.version)"
} catch {
  LogLine "VipStatus ERROR message=$($_.Exception.Message)"
}

try {
  $soundStatus = Get-Json "$BaseUrl/api/sound/status"
  $currentRequestId = ""
  $queuedCount = ""
  if ($null -ne $soundStatus.current) { $currentRequestId = $soundStatus.current.requestId }
  if ($null -ne $soundStatus.queue) { $queuedCount = $soundStatus.queue.Count }
  LogLine "SoundStatus ok=$($soundStatus.ok) currentRequestId=$currentRequestId queuedCount=$queuedCount"
} catch {
  LogLine "SoundStatus ERROR message=$($_.Exception.Message)"
}

$vipOnline = $false
try {
  $commStatus = Get-Json "$BaseUrl/api/communication/status"
  $clients = @()
  if ($null -ne $commStatus.status -and $null -ne $commStatus.status.clients) {
    $clients = @($commStatus.status.clients)
  } elseif ($null -ne $commStatus.clients) {
    $clients = @($commStatus.clients)
  }

  $clientLines = @()
  foreach ($client in $clients) {
    $id = $client.id
    if (-not $id) { $id = $client.clientId }
    $module = $client.module
    $type = $client.type
    if (-not $type) { $type = $client.clientType }
    $status = $client.status
    if (-not $status) {
      if ($client.connected -eq $true -or $client.isConnected -eq $true) { $status = "online" } else { $status = "unknown" }
    }
    $clientLines += ("{0}:{1}:{2}:{3}" -f $id,$module,$type,$status)
    if ($id -eq "vip_sound_overlay_v2" -and $module -eq "vip_sound_overlay" -and $type -eq "overlay" -and $status -eq "online") {
      $vipOnline = $true
    }
  }

  LogLine "CommunicationClients=$($clientLines -join ',')"
  LogLine "VipBusClientOnline=$vipOnline"
} catch {
  LogLine "CommunicationStatus ERROR message=$($_.Exception.Message)"
}

try {
  $watchdog = Get-Json "$BaseUrl/api/communication/watchdog/status"
  $issueCount = 0
  if ($null -ne $watchdog.issueCount) { $issueCount = $watchdog.issueCount }
  elseif ($null -ne $watchdog.issues) { $issueCount = @($watchdog.issues).Count }
  LogLine "CommunicationWatchdog issueCount=$issueCount"
} catch {
  LogLine "CommunicationWatchdog ERROR message=$($_.Exception.Message)"
}

if ($vipOnline) {
  Write-Host "STEP400_STATUS=PASS"
} else {
  Write-Host "STEP400_STATUS=CHECK_REQUIRED"
}
