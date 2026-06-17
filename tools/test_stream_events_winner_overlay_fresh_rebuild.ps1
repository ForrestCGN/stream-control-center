param(
  [ValidateSet('fast','normal','slow','show')][string]$Speed = 'fast',
  [ValidateSet('single','tie')][string]$Demo = 'single',
  [string]$Server = 'http://127.0.0.1:8080'
)

Write-Host '== Stream Events Winner Overlay EVS42.6 Fresh Rebuild Test ==' -ForegroundColor Cyan
$url = "$Server/overlays/stream_events/event_winner_overlay.html?demo=$Demo&speed=$Speed&debug=1&v=4260"
Write-Host "URL: $url" -ForegroundColor Yellow
Start-Process $url
