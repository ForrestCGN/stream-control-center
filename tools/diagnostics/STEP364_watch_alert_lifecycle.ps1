param(
  [int]$WatchSeconds = 90,
  [int]$IntervalSeconds = 2,
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [switch]$TriggerTestAlert
)

$ErrorActionPreference = "Continue"
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logPath = Join-Path (Get-Location) ("STEP364_alert_lifecycle_check_{0}.log" -f $stamp)

function Write-LogLine {
  param([string]$Text)
  $line = "[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $Text
  Write-Host $line
  Add-Content -Path $logPath -Value $line -Encoding UTF8
}

function Try-GetJson {
  param([string]$Url)
  try { return Invoke-RestMethod -Method Get -Uri $Url -TimeoutSec 5 } catch { return $null }
}

function Try-PostJson {
  param([string]$Url)
  try { return Invoke-RestMethod -Method Post -Uri $Url -TimeoutSec 10 } catch { return $null }
}

Write-LogLine "STEP364 Alert Lifecycle Check started"
Write-LogLine "BaseUrl=$BaseUrl WatchSeconds=$WatchSeconds IntervalSeconds=$IntervalSeconds TriggerTestAlert=$TriggerTestAlert"
Write-LogLine "Goal: detect whether currentStatus/currentEventId clear after alert/sound finish."

if ($TriggerTestAlert) {
  Write-LogLine "TriggerTestAlert requested. Trying common alert test endpoints without assuming preset ids."
  $triggered = $false
  $tryUrls = @(
    "$BaseUrl/api/alerts/test",
    "$BaseUrl/api/alerts/test/play",
    "$BaseUrl/api/alerts/demo",
    "$BaseUrl/api/alerts/replay/recent"
  )
  foreach ($u in $tryUrls) {
    $r = Try-PostJson $u
    if ($null -ne $r) {
      Write-LogLine "Trigger route responded: $u"
      $triggered = $true
      break
    } else {
      Write-LogLine "Trigger route not usable: $u"
    }
  }
  if (-not $triggered) {
    Write-LogLine "No generic trigger route worked. Start a test alert manually now."
  }
} else {
  Write-LogLine "Start a longer alert manually now, then let this watcher run until the alert ends."
}

$startedAt = Get-Date
$endAt = $startedAt.AddSeconds($WatchSeconds)
$firstCurrent = $null
$lastCurrent = $null
$lastSound = $null
$sawPlaying = $false
$sawSound = $false
$sawClearedAfterPlaying = $false
$sawSoundClearedAfterSound = $false
$rows = @()

while ((Get-Date) -lt $endAt) {
  $a = Try-GetJson "$BaseUrl/api/alerts/status"
  $s = Try-GetJson "$BaseUrl/api/sound/status"

  $currentId = ""
  $currentStatus = ""
  $queueLength = ""
  $watchdogIssues = ""
  $watchdogMissingAck = ""
  $recoveryMode = ""
  $recoveryEvent = ""
  $recoverySent = ""
  $lastOutput = ""

  if ($null -ne $a) {
    $currentId = [string]$a.currentEventId
    if (-not $currentId -and $a.current -and $a.current.eventUid) { $currentId = [string]$a.current.eventUid }
    if ($a.current -and $a.current.status) { $currentStatus = [string]$a.current.status }
    elseif ($a.currentStatus) { $currentStatus = [string]$a.currentStatus }
    $queueLength = [string]$a.queueLength
    if ($a.overlayWatchdog -and $a.overlayWatchdog.issues) { $watchdogIssues = [string]$a.overlayWatchdog.issues }
    elseif ($a.watchdogIssues) { $watchdogIssues = [string]$a.watchdogIssues }
    if ($a.overlayWatchdog -and $a.overlayWatchdog.missingFinishAck) { $watchdogMissingAck = [string]$a.overlayWatchdog.missingFinishAck }
    elseif ($a.watchdogMissingAck) { $watchdogMissingAck = [string]$a.watchdogMissingAck }
    if ($a.alertOverlayRecovery) {
      $recoveryMode = [string]$a.alertOverlayRecovery.lastMode
      if ($a.alertOverlayRecovery.lastResult) {
        $recoveryEvent = [string]$a.alertOverlayRecovery.lastResult.eventUid
        $recoverySent = [string]$a.alertOverlayRecovery.lastResult.sent
      }
    }
    if ($a.alertOutput -and $a.alertOutput.lastEventUid) { $lastOutput = [string]$a.alertOutput.lastEventUid }
    elseif ($a.outputLastEvent) { $lastOutput = [string]$a.outputLastEvent }
  }

  $soundCurrent = ""
  $soundLabel = ""
  $soundClientLast = ""
  if ($null -ne $s) {
    if ($s.current -and $s.current.requestId) { $soundCurrent = [string]$s.current.requestId }
    elseif ($s.currentSound) { $soundCurrent = [string]$s.currentSound }
    if ($s.current -and $s.current.label) { $soundLabel = [string]$s.current.label }
    elseif ($s.currentSound) { $soundLabel = [string]$s.currentSound }
    if ($s.client -and $s.client.lastEvent) { $soundClientLast = [string]$s.client.lastEvent }
    elseif ($s.clientLastEvent) { $soundClientLast = [string]$s.clientLastEvent }
  }

  if ($currentId -or $currentStatus) {
    if (-not $firstCurrent) { $firstCurrent = $currentId }
    $lastCurrent = $currentId
  }
  if ($currentStatus -eq "playing") { $sawPlaying = $true }
  if ($sawPlaying -and -not $currentId -and -not $currentStatus) { $sawClearedAfterPlaying = $true }

  if ($soundCurrent -or $soundLabel) { $sawSound = $true; $lastSound = "$soundCurrent $soundLabel".Trim() }
  if ($sawSound -and -not $soundCurrent -and -not $soundLabel) { $sawSoundClearedAfterSound = $true }

  $line = "tick currentEventId=$currentId currentStatus=$currentStatus soundCurrent=$soundCurrent soundLabel=$soundLabel clientLast=$soundClientLast queue=$queueLength watchdogIssues=$watchdogIssues missingAck=$watchdogMissingAck recoveryMode=$recoveryMode recoveryEvent=$recoveryEvent recoverySent=$recoverySent lastOutput=$lastOutput"
  Write-LogLine $line
  Start-Sleep -Seconds $IntervalSeconds
}

Write-LogLine "=== SUMMARY ==="
Write-LogLine "sawPlaying=$sawPlaying"
Write-LogLine "firstCurrent=$firstCurrent"
Write-LogLine "lastCurrent=$lastCurrent"
Write-LogLine "sawSound=$sawSound"
Write-LogLine "lastSound=$lastSound"
Write-LogLine "sawClearedAfterPlaying=$sawClearedAfterPlaying"
Write-LogLine "sawSoundClearedAfterSound=$sawSoundClearedAfterSound"

if ($sawPlaying -and $sawClearedAfterPlaying) {
  Write-LogLine "RESULT=OK Alert current lifecycle cleared after playing."
} elseif ($sawPlaying -and -not $sawClearedAfterPlaying) {
  Write-LogLine "RESULT=CHECK Alert was playing but currentEventId/currentStatus did not clear during watch window. Increase WatchSeconds or inspect finishCurrent path."
} else {
  Write-LogLine "RESULT=NO_ALERT No playing alert was observed. Start a longer alert during the watch window."
}

Write-LogLine "LogFile=$logPath"
