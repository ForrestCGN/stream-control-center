param(
  [string]$Server = "http://127.0.0.1:8080"
)

$ErrorActionPreference = "Stop"

Write-Host "== Stream Events: RuntimeGate Stream-State-Test =="
Write-Host "Server: $Server"
Write-Host "Read-only: Es werden keine Daten geschrieben."
Write-Host ""

$status = Invoke-RestMethod "$Server/api/stream-events/status"
Write-Host "Modulstatus"
Write-Host "-----------"
$status | Select-Object ok,module,moduleVersion,moduleBuild,lastError | Format-List

Write-Host "RuntimeGate"
Write-Host "-----------"
$status.runtimeGate | Select-Object active,status,reason,label,chatEvaluationActive,chatOutputLiveSend | Format-List

Write-Host "Stream im RuntimeGate"
Write-Host "---------------------"
$status.runtimeGate.stream | Select-Object online,live,source,effectiveSource,manualOverrideActive,reason,label,confidence,streamId,lastCheckedAt,lastError | Format-List

Write-Host "Twitch Events Stream-State"
Write-Host "--------------------------"
try {
  $t = Invoke-RestMethod "$Server/api/twitch/events/stream-state"
  $t.streamState | Select-Object live,status,source,confidence,streamId,streamDayId,lastCheckedAt,lastError | Format-List
  if ($t.streamState.manualOverride) {
    Write-Host "Manual Override"
    $t.streamState.manualOverride | Select-Object active,status,live,source,expiresAt,reason | Format-List
  }
} catch {
  Write-Host "Konnte /api/twitch/events/stream-state nicht lesen: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "Erwartung fuer Offline-Test mit Manual Override:"
Write-Host "- runtimeGate.stream.source = manual_override"
Write-Host "- runtimeGate.stream.effectiveSource = twitch_events_stream_state"
Write-Host "- runtimeGate.active = True"
Write-Host "- chatEvaluationActive = True"
