$ErrorActionPreference = "Stop"
$base = "http://127.0.0.1:8080"

Write-Host "`n== EVS52.7 Version ==" -ForegroundColor Cyan
$s = Invoke-RestMethod "$base/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List

Write-Host "`n== EVS52.7 Runtime Gate ==" -ForegroundColor Cyan
$gate = Invoke-RestMethod "$base/api/stream-events/runtime-gate/status"
$gate | Select-Object active,status,reason,label,chatEvaluationActive,chatOutputLiveSend | Format-List

Write-Host "`n== EVS52.7 Text Runtime / Bridge ==" -ForegroundColor Cyan
$d = Invoke-RestMethod "$base/api/stream-events/text-runtime/live-debug"
$d.directChatBridge | ConvertTo-Json -Depth 8
if ($d.lastTextChatRuntime) {
  Write-Host "`nLast Text Chat Runtime:" -ForegroundColor Cyan
  $d.lastTextChatRuntime | ConvertTo-Json -Depth 8
}
Write-Host "`nCounts:" -ForegroundColor Cyan
$d.report.counts | ConvertTo-Json -Depth 4

Write-Host "`n== Twitch Presence Status ==" -ForegroundColor Cyan
try {
  $p = Invoke-RestMethod "$base/api/twitch/presence/status"
  $p | Select-Object module,version,build | Format-List
  if ($p.status -and $p.status.chatBus) { $p.status.chatBus | Select-Object emitCount,skippedCount,errorCount,lastEmitAt,lastResultReason,lastBusEventId,lastError | Format-List }
} catch {
  Write-Host "Twitch presence status not available: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n== Chat Output Helper ==" -ForegroundColor Cyan
$co = Invoke-RestMethod "$base/api/chat-output/status"
$co | Select-Object enabled,directSendEnabled,prefer | Format-List
$co.stats | ConvertTo-Json -Depth 6

Write-Host "`nHinweis: Jetzt im echten Twitch-Chat ein Wort aus einem offenen Satz schreiben, z.B. Test. Danach diesen Check erneut ausfuehren." -ForegroundColor Yellow
