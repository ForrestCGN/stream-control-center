param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [string]$Speed = "fast"
)

Write-Host "== Stream Events: Winner Overlay Long Show Test ==" -ForegroundColor Cyan
Write-Host "Demo Single:" -ForegroundColor Yellow
Write-Host "$BaseUrl/overlays/stream_events/event_winner_overlay.html?demo=single&speed=$Speed&debug=1"
Write-Host ""
Write-Host "Demo Gleichstand:" -ForegroundColor Yellow
Write-Host "$BaseUrl/overlays/stream_events/event_winner_overlay.html?demo=tie&speed=$Speed&debug=1"
Write-Host ""
Write-Host "OBS/Live ohne Demo:" -ForegroundColor Yellow
Write-Host "$BaseUrl/overlays/stream_events/event_winner_overlay.html?speed=show"
Write-Host ""
Write-Host "Speed-Modi: fast / normal / slow / show" -ForegroundColor DarkGray
