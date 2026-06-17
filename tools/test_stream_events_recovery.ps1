param(
  [string]$Server = "http://127.0.0.1:8080",
  [string]$EventUid = "",
  [switch]$Execute
)

$ErrorActionPreference = "Stop"

function Show-Header($Text) {
  Write-Host ""
  Write-Host $Text
  Write-Host ("-" * $Text.Length)
}

Write-Host "== Stream Events: Runtime-Recovery-Test =="
Write-Host "Server: $Server"
if ($Execute) {
  Write-Host "Modus: EXECUTE - fuehrt sichere Recovery aus. Aktive Sound-Runden werden nicht gewertet und wieder eingereiht."
} else {
  Write-Host "Modus: Read-only - es werden keine Daten geschrieben."
}

$status = Invoke-RestMethod "$Server/api/stream-events/status"
Show-Header "Modulstatus"
$status | Select-Object ok,module,moduleVersion,version,enabled,lastError | Format-List

$recovery = Invoke-RestMethod "$Server/api/stream-events/sound-runtime/recovery-status"
Show-Header "Recovery-Status vor Aktion"
$rows = @($recovery.rows)
if ($rows.Count -eq 0) {
  Write-Host "Keine aktiven Events gefunden."
} else {
  $rows | ForEach-Object {
    [PSCustomObject]@{
      eventUid = $_.event.eventUid
      name = $_.event.name
      status = $_.event.status
      runtimePhase = if ($_.runtimeState) { $_.runtimeState.phase } else { "" }
      activeRoundUid = if ($_.activeRound) { $_.activeRound.roundUid } else { "" }
      activeRoundStatus = if ($_.activeRound) { $_.activeRound.status } else { "" }
      soundStatus = $_.parts.sound.status
      solved = $_.parts.sound.solved
      remaining = $_.parts.sound.remaining
    }
  } | Format-Table -AutoSize
}

if ($EventUid) {
  Show-Header "Sound-Runtime Report fuer EventUid"
  $report = Invoke-RestMethod "$Server/api/stream-events/sound-runtime/report?eventUid=$EventUid"
  $report.rounds | Select-Object -First 5 roundUid,status,result,itemUid,startedAt,finishedAt | Format-Table -AutoSize
}

if (-not $Execute) {
  Write-Host ""
  Write-Host "Read-only beendet. Zum echten Recovery-Test:"
  if ($EventUid) {
    Write-Host "powershell -ExecutionPolicy Bypass -File `".\tools\test_stream_events_recovery.ps1`" -EventUid `"$EventUid`" -Execute"
  } else {
    Write-Host "powershell -ExecutionPolicy Bypass -File `".\tools\test_stream_events_recovery.ps1`" -Execute"
  }
  exit 0
}

Show-Header "Fuehre Recovery aus"
$body = @{ confirm = "1"; reason = "manual_test_recovery" } | ConvertTo-Json
$result = Invoke-RestMethod -Method Post -Uri "$Server/api/stream-events/sound-runtime/recover?confirm=1" -ContentType "application/json" -Body $body
$result | Select-Object ok,module,moduleVersion,moduleBuild,reason,activeEvents,recoveredCount,updatedAt | Format-List

if ($result.recoveredCount -gt 0) {
  Show-Header "Recovered Rounds"
  $result.recovered | ForEach-Object {
    [PSCustomObject]@{
      eventUid = $_.eventUid
      eventName = $_.eventName
      roundUid = $_.round.roundUid
      itemUid = $_.round.itemUid
      status = $_.round.status
      result = $_.round.result
      requeued = $_.round.requeued
    }
  } | Format-Table -AutoSize
}

Show-Header "Recovery-Status nach Aktion"
$after = Invoke-RestMethod "$Server/api/stream-events/sound-runtime/recovery-status"
@($after.rows) | ForEach-Object {
  [PSCustomObject]@{
    eventUid = $_.event.eventUid
    name = $_.event.name
    runtimePhase = if ($_.runtimeState) { $_.runtimeState.phase } else { "" }
    activeRoundUid = if ($_.activeRound) { $_.activeRound.roundUid } else { "" }
    soundStatus = $_.parts.sound.status
    solved = $_.parts.sound.solved
    remaining = $_.parts.sound.remaining
  }
} | Format-Table -AutoSize
