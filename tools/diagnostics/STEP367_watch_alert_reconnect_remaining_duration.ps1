param(
  [int]$WatchSeconds = 70,
  [int]$IntervalSeconds = 1,
  [string]$BaseUrl = "http://127.0.0.1:8080"
)

$ErrorActionPreference = "Continue"
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logPath = Join-Path (Get-Location) "STEP367_alert_reconnect_remaining_duration_$stamp.log"

function Write-LogLine([string]$line) {
  $line | Tee-Object -FilePath $logPath -Append | Out-Host
}

function Get-Json($url) {
  try { return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 3 } catch { return $null }
}

Write-LogLine "STEP367 Alert Reconnect Remaining Duration Watch"
Write-LogLine "StartedAt=$(Get-Date -Format o)"
Write-LogLine "BaseUrl=$BaseUrl"
Write-LogLine "WatchSeconds=$WatchSeconds IntervalSeconds=$IntervalSeconds"
Write-LogLine "Hinweis: Während dieses Watches längeren Alert starten und OBS-Alert-Quelle 1-2x aktualisieren."
Write-LogLine ""

$end = (Get-Date).AddSeconds($WatchSeconds)
$tick = 0
$lastRecoveryKey = ""

while ((Get-Date) -lt $end) {
  $tick++
  $now = Get-Date -Format "HH:mm:ss"
  $a = Get-Json "$BaseUrl/api/alerts/status"
  $s = Get-Json "$BaseUrl/api/sound/status"

  if ($null -eq $a) {
    Write-LogLine "[$now] tick=$tick ALERT_STATUS_ERROR"
  } else {
    $currentId = ""
    $currentStatus = ""
    if ($a.current) {
      if ($a.current.eventUid) { $currentId = $a.current.eventUid }
      elseif ($a.current.id) { $currentId = $a.current.id }
      if ($a.current.status) { $currentStatus = $a.current.status }
    }

    $recovery = $null
    if ($a.alertOverlayRecovery) { $recovery = $a.alertOverlayRecovery }
    elseif ($a.overlayWatchdog -and $a.overlayWatchdog.recovery) { $recovery = $a.overlayWatchdog.recovery }

    $recMode = ""; $recReason = ""; $recRemaining = ""; $recElapsed = ""; $recTotal = ""; $recSent = ""
    if ($recovery) {
      if ($recovery.lastMode) { $recMode = $recovery.lastMode }
      if ($recovery.lastReason) { $recReason = $recovery.lastReason }
      if ($recovery.lastResult) {
        $recSent = $recovery.lastResult.sent
        $recRemaining = $recovery.lastResult.remainingMs
        $recElapsed = $recovery.lastResult.elapsedMs
        $recTotal = $recovery.lastResult.totalDurationMs
      }
    }

    $soundCurrent = ""
    if ($s -and $s.current) { $soundCurrent = $s.current.label }

    Write-LogLine ("[{0}] tick={1} alertStep={2} currentEventId={3} currentStatus={4} soundCurrent={5} queued={6} recoveryMode={7} sent={8} remainingMs={9} elapsedMs={10} totalMs={11}" -f $now,$tick,$a.step,$currentId,$currentStatus,$soundCurrent,($s.queuedCount),$recMode,$recSent,$recRemaining,$recElapsed,$recTotal)

    $recoveryKey = "$recMode|$recReason|$recSent|$recRemaining|$recElapsed|$recTotal"
    if ($recoveryKey -and $recoveryKey -ne $lastRecoveryKey -and $recMode) {
      Write-LogLine ("    RECOVERY => mode={0} reason={1} sent={2} remainingMs={3} elapsedMs={4} totalMs={5}" -f $recMode,$recReason,$recSent,$recRemaining,$recElapsed,$recTotal)
      $lastRecoveryKey = $recoveryKey
    }
  }

  Start-Sleep -Seconds $IntervalSeconds
}

Write-LogLine ""
Write-LogLine "FinishedAt=$(Get-Date -Format o)"
Write-LogLine "LogFile=$logPath"
Write-LogLine "Erwartung nach STEP365: recoveryMode=reconnect_resend_remaining_duration und remainingMs wird bei jedem Reload kleiner, nicht wieder volle Dauer."
