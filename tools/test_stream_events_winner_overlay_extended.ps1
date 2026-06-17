param(
  [string]$Server = "http://127.0.0.1:8080"
)

Write-Host "== Stream Events: Winner Overlay Extended Show-Test =="
Write-Host "Demo Fast:   $Server/overlays/stream_events/event_winner_overlay.html?demo=single&speed=fast"
Write-Host "Demo Normal: $Server/overlays/stream_events/event_winner_overlay.html?demo=single&speed=normal"
Write-Host "Demo Slow:   $Server/overlays/stream_events/event_winner_overlay.html?demo=single&speed=slow"
Write-Host "Tie Slow:    $Server/overlays/stream_events/event_winner_overlay.html?demo=tie&speed=slow"
Write-Host "OBS Live:    $Server/overlays/stream_events/event_winner_overlay.html"
