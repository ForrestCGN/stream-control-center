param(
  [string]$Server = "http://127.0.0.1:8080",
  [string]$EventUid = "",
  [switch]$Pause,
  [switch]$Resume
)

$ErrorActionPreference = "Stop"

function Show-Title($Text) {
  Write-Host ""
  Write-Host $Text
  Write-Host ("-" * $Text.Length)
}

Write-Host "== Stream Events: Stream-Offline-Pause-Test =="
Write-Host "Server: $Server"
if ($Pause) {
  Write-Host "Modus: PAUSE - simuliert Stream-Offline. Aktive Sound-Runden werden nicht gewertet und wieder eingereiht."
} elseif ($Resume) {
  Write-Host "Modus: RESUME - setzt pausiertes Event manuell fort und plant normale Wartezeit neu."
} else {
  Write-Host "Modus: Read-only - es werden keine Daten geschrieben."
}

Show-Title "Modulstatus"
$status = Invoke-RestMethod "$Server/api/stream-events/status"
$status | Select-Object ok,module,moduleVersion,moduleBuild,lastError | Format-List

Show-Title "Recovery-/Runtime-Status vor Aktion"
$before = Invoke-RestMethod "$Server/api/stream-events/sound-runtime/recovery-status"
$before.rows | ForEach-Object {
  [pscustomobject]@{
    eventUid = $_.event.eventUid
    name = $_.event.name
    status = $_.event.status
    runtimeStatus = $_.runtimeState.runtimeStatus
    runtimePhase = $_.runtimeState.phase
    activeRoundUid = if ($_.activeRound) { $_.activeRound.roundUid } else { "" }
    activeRoundStatus = if ($_.activeRound) { $_.activeRound.status } else { "" }
  }
} | Format-Table -AutoSize

if ($Pause) {
  Show-Title "Simuliere Stream-Offline-Pause"
  $result = Invoke-RestMethod -Method Post "$Server/api/stream-events/runtime/pause-stream-offline?confirm=1&reason=manual_test_stream_offline"
  $result | Select-Object ok,module,moduleVersion,moduleBuild,reason,activeEvents,pausedCount,manualResumeRequired,updatedAt | Format-List
} elseif ($Resume) {
  Show-Title "Setze Event manuell fort"
  $url = "$Server/api/stream-events/runtime/resume?confirm=1&reason=manual_test_resume"
  if ($EventUid) { $url += "&eventUid=$EventUid" }
  $result = Invoke-RestMethod -Method Post $url
  $result | Select-Object ok,eventUid,eventName,resumed,updatedAt | Format-List
  if ($result.plan) {
    Write-Host "Plan:"
    $result.plan | Select-Object ok,scheduled,skipped,reason,delaySeconds,dueAt | Format-List
  }
} else {
  Write-Host ""
  Write-Host "Read-only beendet. Zum Simulieren von Stream-Offline:"
  Write-Host "powershell -ExecutionPolicy Bypass -File `".\tools\test_stream_events_stream_offline_pause.ps1`" -Pause"
  Write-Host ""
  Write-Host "Zum Fortsetzen danach:"
  if ($EventUid) {
    Write-Host "powershell -ExecutionPolicy Bypass -File `".\tools\test_stream_events_stream_offline_pause.ps1`" -EventUid `"$EventUid`" -Resume"
  } else {
    Write-Host "powershell -ExecutionPolicy Bypass -File `".\tools\test_stream_events_stream_offline_pause.ps1`" -Resume"
  }
  exit 0
}

Show-Title "Recovery-/Runtime-Status nach Aktion"
$after = Invoke-RestMethod "$Server/api/stream-events/sound-runtime/recovery-status"
$after.rows | ForEach-Object {
  [pscustomobject]@{
    eventUid = $_.event.eventUid
    name = $_.event.name
    status = $_.event.status
    runtimeStatus = $_.runtimeState.runtimeStatus
    runtimePhase = $_.runtimeState.phase
    activeRoundUid = if ($_.activeRound) { $_.activeRound.roundUid } else { "" }
    activeRoundStatus = if ($_.activeRound) { $_.activeRound.status } else { "" }
    recoveryReason = $_.runtimeState.recoveryReason
  }
} | Format-Table -AutoSize
