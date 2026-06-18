# EVS52.5 - Satz-System Live-Flow Check
# Prüft: UI-Alias-Felder, Teiltreffer ohne Wortpunkte, Satzpunkte, Duplicate-Schutz und Ranking.
# Sendet NICHT live in Twitch.

$ErrorActionPreference = "Stop"
$base = "http://127.0.0.1:8080/api/stream-events"

Write-Host "== EVS52.5 Version ==" -ForegroundColor Cyan
$s = Invoke-RestMethod "$base/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List

Write-Host "== EVS52.5 Text Live Flow Check ==" -ForegroundColor Cyan
$r = Invoke-RestMethod "$base/test/run?confirm=1&step=text-live-flow-check" -Method Post -Body (@{} | ConvertTo-Json) -ContentType "application/json"

Write-Host "OK:" $r.ok -ForegroundColor Green
$r.checks | ConvertTo-Json -Depth 6

Write-Host "== Ranking ==" -ForegroundColor Cyan
$r.ranking.rows | Select-Object rank,userLogin,userDisplayName,points,entries | Format-Table -AutoSize

Write-Host "== User Stats ForrestCGN ==" -ForegroundColor Cyan
$r.userStats.user | Select-Object userLogin,totalPoints,wordPoints,phrasePoints,soundPoints,scoreEntries,wordHits,phraseSolves | Format-List

Write-Host "== Text Runtime Debug ==" -ForegroundColor Cyan
$d = Invoke-RestMethod "$base/text-runtime/live-debug?eventUid=$($r.eventUid)"
$d.runtimeConfig | ConvertTo-Json -Depth 5
$d.report.counts | ConvertTo-Json -Depth 5

if (-not $r.ok) {
  throw "EVS52.5 Text Live Flow Check failed"
}
