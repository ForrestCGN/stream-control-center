param(
  [int]$WatchSeconds = 60,
  [int]$IntervalSeconds = 2,
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [switch]$ResetWatchdog,
  [switch]$TriggerTestAlert,
  [string]$OutFile = ""
)

$ErrorActionPreference = "Continue"

function NowIso {
  return (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffK")
}

function SafeGetJson([string]$Url) {
  try {
    return Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 5
  } catch {
    return [pscustomobject]@{
      __error = $true
      url = $Url
      message = $_.Exception.Message
    }
  }
}

function SafePostJson([string]$Url) {
  try {
    return Invoke-RestMethod -Uri $Url -Method Post -TimeoutSec 8
  } catch {
    return [pscustomobject]@{
      __error = $true
      url = $Url
      message = $_.Exception.Message
    }
  }
}

function Get-Prop($Obj, [string]$Name, $Fallback = $null) {
  if ($null -eq $Obj) { return $Fallback }
  $p = $Obj.PSObject.Properties[$Name]
  if ($null -eq $p) { return $Fallback }
  return $p.Value
}

function Write-LineBoth([string]$Line) {
  Write-Host $Line
  if ($script:LogFile) {
    Add-Content -LiteralPath $script:LogFile -Value $Line -Encoding UTF8
  }
}

$root = (Get-Location).Path
if ([string]::IsNullOrWhiteSpace($OutFile)) {
  $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
  $OutFile = Join-Path $root "STEP362_alert_reconnect_live_$stamp.log"
}
$script:LogFile = $OutFile
New-Item -ItemType File -Force -Path $script:LogFile | Out-Null

Write-LineBoth "=== STEP362 Alert/SoundBus Live-Reconnect-Watch ==="
Write-LineBoth "StartedAt       : $(NowIso)"
Write-LineBoth "BaseUrl         : $BaseUrl"
Write-LineBoth "WatchSeconds    : $WatchSeconds"
Write-LineBoth "IntervalSeconds : $IntervalSeconds"
Write-LineBoth "OutFile         : $script:LogFile"
Write-LineBoth ""

if ($ResetWatchdog) {
  Write-LineBoth "=== Reset Watchdog ==="
  $reset1 = SafePostJson "$BaseUrl/api/alerts/watchdog/reset"
  $reset2 = SafePostJson "$BaseUrl/api/alerts/overlay/watchdog/reset"
  Write-LineBoth ("alerts/watchdog/reset         : " + ($reset1 | ConvertTo-Json -Compress -Depth 8))
  Write-LineBoth ("alerts/overlay/watchdog/reset : " + ($reset2 | ConvertTo-Json -Compress -Depth 8))
  Write-LineBoth ""
}

if ($TriggerTestAlert) {
  Write-LineBoth "=== Trigger Test Alert ==="
  $triggerUrls = @(
    "$BaseUrl/api/alerts/test",
    "$BaseUrl/api/alerts/test?type=follow&user=STEP362ReconnectTest",
    "$BaseUrl/api/alerts/debug/test?type=follow&user=STEP362ReconnectTest"
  )
  $triggered = $false
  foreach ($u in $triggerUrls) {
    if ($triggered) { break }
    $r = SafePostJson $u
    Write-LineBoth ("POST $u => " + ($r | ConvertTo-Json -Compress -Depth 8))
    if (-not (Get-Prop $r "__error" $false)) { $triggered = $true }
  }
  Write-LineBoth ""
}

Write-LineBoth "=== Live Watch ==="
Write-LineBoth "Bitte JETZT während ein Alert sichtbar ist: OBS Alert-Browserquelle einmal aktualisieren."
Write-LineBoth ""

$end = (Get-Date).AddSeconds($WatchSeconds)
$lastEvent = ""
$lastRecoveryJson = ""
$lastCurrent = ""
$tick = 0

while ((Get-Date) -lt $end) {
  $tick++
  $a = SafeGetJson "$BaseUrl/api/alerts/status"
  $s = SafeGetJson "$BaseUrl/api/sound/status"

  $alertStep = Get-Prop $a "step" (Get-Prop $a "alertStep" "")
  $overlayClients = Get-Prop $a "overlayClients" ""
  $queueLength = Get-Prop $a "queueLength" ""
  $current = Get-Prop $a "current" $null
  $currentEventId = Get-Prop $a "currentEventId" ""
  if ([string]::IsNullOrWhiteSpace([string]$currentEventId)) {
    $currentEventId = Get-Prop $current "eventUid" ""
  }
  $currentStatus = Get-Prop $current "status" ""
  $output = Get-Prop $a "alertOutput" $null
  $outputMode = Get-Prop $output "mode" (Get-Prop $a "outputMode" "")
  $lastMode = Get-Prop $output "lastMode" (Get-Prop $a "lastOutputMode" "")
  $lastOutputEvent = Get-Prop $output "lastEventUid" (Get-Prop $a "outputLastEvent" "")
  $watchdog = Get-Prop $a "overlayWatchdog" (Get-Prop $a "watchdog" $null)
  $issues = Get-Prop $watchdog "issues" (Get-Prop $a "watchdogIssues" "")
  $missingAck = Get-Prop $watchdog "missingAck" (Get-Prop $a "watchdogMissingAck" "")
  $noClient = Get-Prop $watchdog "noClient" (Get-Prop $a "watchdogNoClient" "")
  $recovery = Get-Prop $watchdog "recovery" (Get-Prop $a "alertOverlayRecovery" $null)
  $recoveryJson = if ($null -ne $recovery) { $recovery | ConvertTo-Json -Compress -Depth 12 } else { "" }

  $soundStep = Get-Prop $s "step" (Get-Prop $s "soundStep" "")
  $client = Get-Prop $s "client" $null
  $clientConnected = Get-Prop $client "connected" (Get-Prop $s "clientConnected" "")
  $clientLastEvent = Get-Prop $client "lastEvent" (Get-Prop $s "clientLastEvent" "")
  $currentSound = Get-Prop $s "current" $null
  $currentSoundLabel = Get-Prop $currentSound "label" ""
  $queued = Get-Prop $s "queued" $null
  $queuedCount = if ($null -ne $queued -and $queued.PSObject.Properties["count"]) { $queued.count } else { Get-Prop $s "queuedCount" "" }
  $parallel = Get-Prop $s "parallel" $null
  $parallelCount = if ($null -ne $parallel -and $parallel.PSObject.Properties["count"]) { $parallel.count } else { Get-Prop $s "parallelCount" "" }

  $line = "[{0}] tick={1} alertStep={2} overlayClients={3} currentEventId={4} currentStatus={5} outputMode={6}/{7} lastOutputEvent={8} watchdogIssues={9} missingAck={10} noClient={11} soundStep={12} clientConnected={13} clientLastEvent={14} currentSound={15} queued={16} parallel={17}" -f (NowIso),$tick,$alertStep,$overlayClients,$currentEventId,$currentStatus,$outputMode,$lastMode,$lastOutputEvent,$issues,$missingAck,$noClient,$soundStep,$clientConnected,$clientLastEvent,$currentSoundLabel,$queuedCount,$parallelCount
  Write-LineBoth $line

  if ($currentEventId -and $currentEventId -ne $lastCurrent) {
    Write-LineBoth "  CURRENT_CHANGED => $currentEventId"
    $lastCurrent = $currentEventId
  }

  if ($lastOutputEvent -and $lastOutputEvent -ne $lastEvent) {
    Write-LineBoth "  OUTPUT_EVENT_CHANGED => $lastOutputEvent"
    $lastEvent = $lastOutputEvent
  }

  if ($recoveryJson -and $recoveryJson -ne $lastRecoveryJson) {
    Write-LineBoth "  RECOVERY => $recoveryJson"
    $lastRecoveryJson = $recoveryJson
  }

  Start-Sleep -Seconds $IntervalSeconds
}

Write-LineBoth ""
Write-LineBoth "=== Final Snapshot: Alert Status ==="
$finalAlert = SafeGetJson "$BaseUrl/api/alerts/status"
Write-LineBoth ($finalAlert | ConvertTo-Json -Depth 20)

Write-LineBoth ""
Write-LineBoth "=== Final Snapshot: Sound Status ==="
$finalSound = SafeGetJson "$BaseUrl/api/sound/status"
Write-LineBoth ($finalSound | ConvertTo-Json -Depth 20)

Write-LineBoth ""
Write-LineBoth "=== Bewertung ==="
Write-LineBoth "OK: alertStep=360, overlayClients >= 1, watchdogIssues/missingAck bleiben 0."
Write-LineBoth "Reconnect getroffen: Während currentEventId/currentStatus=playing nach OBS-Reload eine RECOVERY-Zeile mit reconnect_resend oder vergleichbarem Recovery-Eintrag erscheint."
Write-LineBoth "Wenn currentEventId während des ganzen Logs leer bleibt, war beim Polling kein Alert aktiv oder der Test-Alert war zu kurz."
Write-LineBoth "Logdatei: $script:LogFile"
