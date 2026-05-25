param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [int]$DurationMs = 5000,
  [int]$VisibleMs = 5000,
  [int]$AckWaitMs = 2500
)

$ErrorActionPreference = "Stop"

function Log([string]$msg) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "$ts $msg"
}

function Get-Json([string]$url) {
  return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 10
}

function Get-TextStatus([string]$url) {
  try {
    $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
    return [int]$res.StatusCode
  } catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      return [int]$_.Exception.Response.StatusCode
    }
    throw
  }
}

function Get-Prop($obj, [string[]]$paths) {
  foreach ($path in $paths) {
    $cur = $obj
    $ok = $true
    foreach ($part in $path.Split('.')) {
      if ($null -eq $cur) { $ok = $false; break }
      $p = $cur.PSObject.Properties[$part]
      if ($null -eq $p) { $ok = $false; break }
      $cur = $p.Value
    }
    if ($ok -and $null -ne $cur -and "" -ne [string]$cur) { return $cur }
  }
  return $null
}

function As-ListText($items) {
  if ($null -eq $items) { return "" }
  $out = @()
  foreach ($c in $items) {
    $id = Get-Prop $c @("id", "clientId")
    $module = Get-Prop $c @("module")
    $type = Get-Prop $c @("type", "clientType")
    $status = Get-Prop $c @("status", "state")
    if ($id) { $out += ("{0}:{1}:{2}:{3}" -f $id,$module,$type,$status) }
  }
  return ($out -join ",")
}

function Get-CommunicationClients($comm) {
  return Get-Prop $comm @("status.clients", "clients")
}

function Get-VipClient($clients) {
  if ($null -eq $clients) { return $null }
  foreach ($c in $clients) {
    $id = [string](Get-Prop $c @("id", "clientId"))
    $module = [string](Get-Prop $c @("module"))
    if ($id -eq "vip_sound_overlay_v2" -and $module -eq "vip_sound_overlay") { return $c }
  }
  return $null
}

function Is-VipClientOnline($clients) {
  $c = Get-VipClient $clients
  if ($null -eq $c) { return $false }
  $status = [string](Get-Prop $c @("status", "state"))
  return ($status -eq "online")
}

function Get-VipLastAckAt($comm) {
  $clients = Get-CommunicationClients $comm
  $c = Get-VipClient $clients
  if ($null -eq $c) { return "" }
  $v = Get-Prop $c @("lastAckAt")
  if ($null -eq $v) { return "" }
  return [string]$v
}

function Wait-ForVipAckChange([string]$label, [string]$previousAckAt) {
  $deadline = (Get-Date).AddMilliseconds($AckWaitMs)
  $lastSeen = $previousAckAt
  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 200
    $comm = Get-Json "$BaseUrl/api/communication/status"
    $cur = Get-VipLastAckAt $comm
    if ($cur -and $cur -ne $previousAckAt) {
      Log ("{0}AckChanged=True lastAckAt={1}" -f $label,$cur)
      return $cur
    }
    if ($cur) { $lastSeen = $cur }
  }
  Log ("{0}AckChanged=False previousAckAt={1} lastSeen={2}" -f $label,$previousAckAt,$lastSeen)
  throw "$label ack was not observed via communication status"
}

function Get-WatchdogIssueCount($comm) {
  $v = Get-Prop $comm @("watchdog.issueCount", "status.watchdog.issueCount", "status.issueCount", "issueCount")
  if ($null -eq $v) { return 0 }
  return [int]$v
}

function Get-EmitResult($resp) {
  $r = Get-Prop $resp @("result")
  if ($null -ne $r) { return $r }
  return $resp
}

function Require-EmitOk($name, $resp) {
  $r = Get-EmitResult $resp
  $ok = Get-Prop $resp @("ok", "success")
  $innerOk = Get-Prop $r @("ok", "success")
  $eventId = Get-Prop $r @("eventId", "event.id")
  $deliveredCount = Get-Prop $r @("deliveredCount", "delivery.deliveredCount")
  $deliveredTo = Get-Prop $r @("deliveredTo", "delivery.deliveredTo")
  $ackCount = Get-Prop $r @("ackCount", "event.ackCount")

  Log ("{0} ok={1} innerOk={2} eventId={3} deliveredCount={4} deliveredTo={5} ackCount={6}" -f $name,$ok,$innerOk,$eventId,$deliveredCount,($deliveredTo -join ","),$ackCount)

  if ($ok -ne $true -or $innerOk -ne $true) {
    Log ("{0}_RAW={1}" -f $name, ($resp | ConvertTo-Json -Depth 16 -Compress))
    throw "$name failed: ok/innerOk was not true"
  }

  if ($null -eq $eventId) {
    Log ("{0}_RAW={1}" -f $name, ($resp | ConvertTo-Json -Depth 16 -Compress))
    throw "$name failed: eventId missing"
  }

  if ($null -eq $deliveredCount -or [int]$deliveredCount -lt 1) {
    Log ("{0}_RAW={1}" -f $name, ($resp | ConvertTo-Json -Depth 16 -Compress))
    throw "$name failed: deliveredCount missing or < 1"
  }

  $deliveredText = [string]($deliveredTo -join ",")
  if ($deliveredText -notlike "*vip_sound_overlay_v2*") {
    Log ("{0}_RAW={1}" -f $name, ($resp | ConvertTo-Json -Depth 16 -Compress))
    throw "$name failed: vip_sound_overlay_v2 not in deliveredTo"
  }

  return $eventId
}

Log "STEP404C VIP preview show/hide stable check result-wrapper fix started"
Log "BaseUrl=$BaseUrl"
Log "DurationMs=$DurationMs"
Log "VisibleMs=$VisibleMs"
Log "AckWaitMs=$AckWaitMs"

$overlayUrl = "$BaseUrl/overlays/vip_sound_overlay_v2.html"
$overlayStatus = Get-TextStatus $overlayUrl
Log "VipOverlayUrlStatus=$overlayStatus url=$overlayUrl"
if ($overlayStatus -ne 200) { throw "VIP overlay not reachable" }

$vipStatus = Get-Json "$BaseUrl/api/vip-sound/status"
Log ("VipStatus ok={0} version={1}" -f $vipStatus.ok,$vipStatus.version)

$soundBefore = Get-Json "$BaseUrl/api/sound/status"
$beforeCurrent = Get-Prop $soundBefore @("current.requestId", "currentRequestId")
$beforeQueue = Get-Prop $soundBefore @("queue.length", "queuedCount", "queueLength")
if ($null -eq $beforeQueue) { $beforeQueue = 0 }
Log "SoundBefore currentRequestId=$beforeCurrent queuedCount=$beforeQueue"

$commBefore = Get-Json "$BaseUrl/api/communication/status"
$clientsBefore = Get-CommunicationClients $commBefore
Log ("CommunicationClientsBefore=" + (As-ListText $clientsBefore))
$vipOnline = Is-VipClientOnline $clientsBefore
$ackBefore = Get-VipLastAckAt $commBefore
Log "VipBusClientOnline=$vipOnline"
Log "VipLastAckAtBefore=$ackBefore"
if (-not $vipOnline) { throw "VIP bus client is not online" }

$requestId = "step404c-stable-" + (Get-Date -Format "yyyyMMddHHmmss")
$user = "STEP404C_VIP_Stable"
$showUrl = "$BaseUrl/api/communication/test-vip-overlay-preview?action=show&user=$user&requestId=$requestId&durationMs=$DurationMs&requireAck=true&replayable=true"
Log "Trying VIP preview show route: $showUrl"
$show = Get-Json $showUrl
$showEventId = Require-EmitOk "ShowEmit" $show
$ackAfterShow = Wait-ForVipAckChange "Show" $ackBefore

Log "VISIBLE_CHECK_NOW=Bitte jetzt OBS/Overlay anschauen. Preview sollte sichtbar sein. Warte $VisibleMs ms vor Hide."
Start-Sleep -Milliseconds $VisibleMs

$hideUrl = "$BaseUrl/api/communication/test-vip-overlay-preview?action=hide&user=$user&requestId=$requestId&durationMs=1000&requireAck=true&replayable=true"
Log "Trying VIP preview hide route: $hideUrl"
$hide = Get-Json $hideUrl
$hideEventId = Require-EmitOk "HideEmit" $hide
$ackAfterHide = Wait-ForVipAckChange "Hide" $ackAfterShow
Start-Sleep -Milliseconds 800

$soundAfter = Get-Json "$BaseUrl/api/sound/status"
$afterCurrent = Get-Prop $soundAfter @("current.requestId", "currentRequestId")
$afterQueue = Get-Prop $soundAfter @("queue.length", "queuedCount", "queueLength")
if ($null -eq $afterQueue) { $afterQueue = 0 }
Log "SoundAfter currentRequestId=$afterCurrent queuedCount=$afterQueue"
if ($afterCurrent) { throw "Sound system current item should be empty" }
if ([int]$afterQueue -ne 0) { throw "Sound queue should remain 0" }

$commAfter = Get-Json "$BaseUrl/api/communication/status"
$issueCount = Get-WatchdogIssueCount $commAfter
Log "CommunicationWatchdog issueCount=$issueCount"
if ([int]$issueCount -ne 0) { throw "Communication watchdog issues detected" }

Log "ShowEventId=$showEventId"
Log "HideEventId=$hideEventId"
Log "STEP404C_STATUS=PASS"
