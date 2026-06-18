$ErrorActionPreference = "Stop"
$base = "http://127.0.0.1:8080"

Write-Host "`n== EVS52.8 Version ==" -ForegroundColor Cyan
$s = Invoke-RestMethod "$base/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List

Write-Host "`n== EVS52.8 Runtime Gate ==" -ForegroundColor Cyan
$gate = Invoke-RestMethod "$base/api/stream-events/runtime-gate/status"
$gate | Select-Object active,status,reason,label,chatEvaluationActive,chatOutputLiveSend | Format-List

Write-Host "`n== EVS52.8 Text Runtime / Bus-Fallback ==" -ForegroundColor Cyan
$d = Invoke-RestMethod "$base/api/stream-events/text-runtime/live-debug"
Write-Host "Direct bridge:" -ForegroundColor DarkCyan
$d.directChatBridge | ConvertTo-Json -Depth 8
Write-Host "Bus fallback:" -ForegroundColor DarkCyan
$d.twitchChatBusFallback | ConvertTo-Json -Depth 8
if ($d.lastTextChatRuntime) {
  Write-Host "`nLast Text Chat Runtime:" -ForegroundColor Cyan
  $d.lastTextChatRuntime | ConvertTo-Json -Depth 8
}
Write-Host "`nCounts:" -ForegroundColor Cyan
$d.report.counts | ConvertTo-Json -Depth 4

Write-Host "`n== Twitch Presence Status ==" -ForegroundColor Cyan
try {
  $p = Invoke-RestMethod "$base/api/twitch/presence/status"
  if ($p.data -and $p.data.status) {
    $p.data.status | Select-Object module,version,build,lastChatMessageAt,lastChatMessagePreview | Format-List
    if ($p.data.status.chatBus) { $p.data.status.chatBus | Select-Object emitCount,skippedCount,errorCount,lastEmitAt,lastResultReason,lastBusEventId,lastError | Format-List }
  } else {
    $p | ConvertTo-Json -Depth 8
  }
} catch {
  Write-Host "Twitch presence status not available: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n== Chat Output Helper ==" -ForegroundColor Cyan
$co = Invoke-RestMethod "$base/api/chat-output/status"
$co | Select-Object enabled,directSendEnabled,prefer | Format-List
$co.stats | ConvertTo-Json -Depth 6

Write-Host "`nHinweis: Im echten Twitch-Chat ein Wort aus einem offenen Satz schreiben, z.B. Test. Danach diesen Check erneut ausfuehren." -ForegroundColor Yellow
