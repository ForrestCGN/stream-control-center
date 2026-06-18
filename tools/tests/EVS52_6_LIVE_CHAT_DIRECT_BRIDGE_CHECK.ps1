$ErrorActionPreference = "Stop"
$base = "http://127.0.0.1:8080"

Write-Host "`n== EVS52.6 Version ==" -ForegroundColor Cyan
$s = Invoke-RestMethod "$base/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List

Write-Host "`n== EVS52.6 Runtime / Direct Bridge ==" -ForegroundColor Cyan
$d = Invoke-RestMethod "$base/api/stream-events/text-runtime/live-debug"
$d.runtimeGate | Select-Object active,status,reason,label,chatEvaluationActive,chatOutputLiveSend | Format-List
$d.directChatBridge | ConvertTo-Json -Depth 8

Write-Host "`n== EVS52.6 Text Runtime Counts ==" -ForegroundColor Cyan
$d.report.counts | ConvertTo-Json -Depth 4

Write-Host "`n== EVS52.6 Chat Output Helper ==" -ForegroundColor Cyan
$co = Invoke-RestMethod "$base/api/chat-output/status"
$co | Select-Object enabled,directSendEnabled,prefer | Format-List
$co.stats | ConvertTo-Json -Depth 6

Write-Host "`nHinweis: Danach im echten Twitch-Chat ein Wort aus einem offenen Satz schreiben und diesen Check erneut ausfuehren." -ForegroundColor Yellow
