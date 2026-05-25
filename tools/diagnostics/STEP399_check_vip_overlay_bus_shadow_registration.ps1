param(
  [string]$BaseUrl = "http://127.0.0.1:8080"
)

function Log($msg) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "$ts $msg"
}

function Get-Prop($obj, $name, $fallback = $null) {
  if ($null -eq $obj) { return $fallback }
  $p = $obj.PSObject.Properties[$name]
  if ($null -eq $p) { return $fallback }
  if ($null -eq $p.Value) { return $fallback }
  return $p.Value
}

Log "STEP399 VIP overlay bus shadow registration check started"
Log "BaseUrl=$BaseUrl"
Log "Expected overlay: $BaseUrl/overlays/vip_sound_overlay_v2.html"

$ok = $true

try {
  $res = Invoke-WebRequest "$BaseUrl/overlays/vip_sound_overlay_v2.html" -UseBasicParsing
  Log "VipOverlayUrlStatus=$($res.StatusCode)"
  if ($res.StatusCode -ne 200) { $ok = $false }
} catch {
  Log "VipOverlayUrlStatus=ERROR $($_.Exception.Message)"
  $ok = $false
}

try {
  $vipStatus = Invoke-RestMethod "$BaseUrl/api/vip-sound/status"
  Log "VipStatus ok=$(Get-Prop $vipStatus 'ok' '') module=$(Get-Prop $vipStatus 'module' '') version=$(Get-Prop $vipStatus 'version' '')"
} catch {
  Log "VipStatus ERROR $($_.Exception.Message)"
}

try {
  $soundStatus = Invoke-RestMethod "$BaseUrl/api/sound/status"
  $queued = 0
  if ($soundStatus.queue) { $queued = @($soundStatus.queue).Count }
  Log "SoundStatus ok=$(Get-Prop $soundStatus 'ok' '') currentRequestId=$(Get-Prop $soundStatus.current 'requestId' '') queuedCount=$queued"
} catch {
  Log "SoundStatus ERROR $($_.Exception.Message)"
}

$vipOnline = $false
try {
  $comm = Invoke-RestMethod "$BaseUrl/api/communication/status"
  $clients = @($comm.status.clients)
  if ($clients.Count -eq 0) {
    Log "CommunicationClients=none"
  } else {
    $line = ($clients | ForEach-Object { "$(Get-Prop $_ 'id' ''):$(Get-Prop $_ 'module' ''):$(Get-Prop $_ 'type' ''):$(Get-Prop $_ 'status' '')" }) -join ','
    Log "CommunicationClients=$line"
  }

  foreach ($c in $clients) {
    if ((Get-Prop $c 'id' '') -eq 'vip_sound_overlay_v2' -and (Get-Prop $c 'module' '') -eq 'vip_sound_overlay' -and (Get-Prop $c 'status' '') -eq 'online') {
      $vipOnline = $true
    }
  }
  Log "VipBusClientOnline=$vipOnline"
} catch {
  Log "CommunicationStatus ERROR $($_.Exception.Message)"
  $ok = $false
}

try {
  $watch = Invoke-RestMethod "$BaseUrl/api/communication/watchdog?includeRecovered=true"
  $issueCount = Get-Prop $watch 'issueCount' 0
  Log "CommunicationWatchdog issueCount=$issueCount"
  if ([int]$issueCount -gt 0) { $ok = $false }
} catch {
  Log "CommunicationWatchdog ERROR $($_.Exception.Message)"
}

if (-not $vipOnline) {
  Log "VIP_BUS_CLIENT_NOT_ONLINE_HINT=Apply STEP399 patch, then reload OBS browser source for vip_sound_overlay_v2.html"
  $ok = $false
}

if ($ok) {
  Write-Host "STEP399_STATUS=PASS"
} else {
  Write-Host "STEP399_STATUS=CHECK_REQUIRED"
}
