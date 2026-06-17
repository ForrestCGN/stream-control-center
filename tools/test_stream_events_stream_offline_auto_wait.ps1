param(
  [string]$Server = "http://127.0.0.1:8080"
)

Write-Host "== Stream Events: Stream-Offline Auto-Wait / Button-Guard Test ==" -ForegroundColor Cyan
Write-Host "Server: $Server"
Write-Host "Read-only: Es werden keine Daten geschrieben."
Write-Host ""

function Show-Block($Title, $Obj) {
  Write-Host ""
  Write-Host $Title -ForegroundColor Yellow
  Write-Host ("-" * $Title.Length) -ForegroundColor DarkYellow
  $Obj | Format-List | Out-String | Write-Host
}

try {
  $status = Invoke-RestMethod "$Server/api/stream-events/status"
  Show-Block "Modulstatus" ([pscustomobject]@{
    ok = $status.ok
    module = $status.module
    moduleVersion = $status.moduleVersion
    moduleBuild = $status.moduleBuild
    lastError = $status.lastError
  })

  Show-Block "RuntimeGate" ($status.runtimeGate | Select-Object active,status,reason,label,chatEvaluationActive,chatOutputLiveSend,runtimePaused,runtimeOfflineWaiting)

  if ($status.runtimeGate -and $status.runtimeGate.stream) {
    Show-Block "Stream im RuntimeGate" ($status.runtimeGate.stream | Select-Object online,live,source,effectiveSource,manualOverrideActive,reason,label,confidence,streamId,lastCheckedAt,lastError)
  }

  if ($status.runtimeGate -and $status.runtimeGate.eventRuntimeState) {
    Show-Block "Event Runtime-State" ($status.runtimeGate.eventRuntimeState | Select-Object runtimeStatus,phase,nextAutoStartAt,recoveryReason,recoveryNote,updatedAt)
  }

  $eventUid = ""
  if ($status.activeEvent -and $status.activeEvent.eventUid) { $eventUid = $status.activeEvent.eventUid }
  if ($eventUid) {
    $report = Invoke-RestMethod "$Server/api/stream-events/sound-runtime/report?eventUid=$eventUid"
    if ($report.nextSound) {
      Show-Block "Nächster Schnipsel" ($report.nextSound | Select-Object status,label,detail,runtimeStatus,phase,nextAutoStartAt,remainingSeconds)
    }
  }

  Write-Host "Erwartung EVS44:" -ForegroundColor Green
  Write-Host "- Stream offline => nextSound.status = offline_waiting, kein Skip-Wait-Button im Dashboard."
  Write-Host "- Stream wieder online => Event auto-resumed auf waiting, neue Auto-Wartezeit wird geplant."
  Write-Host "- Manuelle Pause bleibt ein separater Zustand; Stream-Offline ist kein klebender Pausemodus mehr."
} catch {
  Write-Host "FEHLER: $($_.Exception.Message)" -ForegroundColor Red
  if ($_.ErrorDetails -and $_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message -ForegroundColor DarkRed }
  exit 1
}
