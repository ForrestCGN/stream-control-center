param(
  [ValidateSet("fast","normal","slow","show")]
  [string]$Speed = "fast",
  [ValidateSet("single","tie")]
  [string]$Demo = "single",
  [string]$Server = "http://127.0.0.1:8080"
)

Write-Host "== Stream Events: Winner Overlay EVS42.4 Ehrenrunde + Top3 Preisverleihung ==" -ForegroundColor Cyan
Write-Host "Server: $Server"
Write-Host "Demo:   $Demo"
Write-Host "Speed:  $Speed"
Write-Host ""

$url = "$Server/overlays/stream_events/event_winner_overlay.html?demo=$Demo&speed=$Speed&debug=1"
Write-Host "URL:" -ForegroundColor Yellow
Write-Host $url
Write-Host ""
Write-Host "Hinweis:" -ForegroundColor Yellow
Write-Host "fast ist nur Testtempo. Fuer die echte Show spaeter speed=show nutzen."
Write-Host ""

try {
  Start-Process $url
} catch {
  Write-Host "Browser konnte nicht automatisch geoeffnet werden. URL bitte manuell oeffnen." -ForegroundColor DarkYellow
}
