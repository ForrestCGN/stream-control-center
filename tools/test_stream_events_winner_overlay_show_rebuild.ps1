param(
  [ValidateSet("fast","normal","slow","show")]
  [string]$Speed = "fast",
  [ValidateSet("single","tie")]
  [string]$Demo = "single",
  [string]$Server = "http://127.0.0.1:8080",
  [switch]$Open
)

Write-Host "== Stream Events: Winner Overlay Show Rebuild Test ==" -ForegroundColor Cyan
Write-Host "Server: $Server"
Write-Host "Speed : $Speed"
Write-Host "Demo  : $Demo"
Write-Host ""

$url = "$Server/overlays/stream_events/event_winner_overlay.html?demo=$Demo&speed=$Speed&debug=1"
Write-Host "Test-URL:" -ForegroundColor Yellow
Write-Host $url
Write-Host ""
Write-Host "Weitere URLs:" -ForegroundColor Yellow
Write-Host "$Server/overlays/stream_events/event_winner_overlay.html?demo=single&speed=fast&debug=1"
Write-Host "$Server/overlays/stream_events/event_winner_overlay.html?demo=tie&speed=fast&debug=1"
Write-Host "$Server/overlays/stream_events/event_winner_overlay.html?speed=show"
Write-Host ""
Write-Host "Hinweis: Nach dem Entpacken zuerst StepDone ausfuehren, dann testen:" -ForegroundColor Yellow
Write-Host '.\stepdone.cmd "STEP EVS42.3 Winner Overlay Show Rebuild"'

if ($Open) {
  Start-Process $url
}
