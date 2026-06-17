param(
  [ValidateSet('fast','normal','slow','show')][string]$Speed = 'fast',
  [ValidateSet('single','tie')][string]$Demo = 'single',
  [string]$BaseUrl = 'http://127.0.0.1:8080'
)

Write-Host "== Stream Events: Winner Overlay Parade-to-Podium Test ==" -ForegroundColor Cyan
Write-Host "Server: $BaseUrl"
Write-Host "Demo:   $Demo"
Write-Host "Speed:  $Speed"
Write-Host ""

$cacheBust = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$url = "$BaseUrl/overlays/stream_events/event_winner_overlay.html?demo=$Demo&speed=$Speed&debug=1&v=$cacheBust"
Write-Host "URL:" -ForegroundColor Yellow
Write-Host $url
Write-Host ""
Write-Host "Hinweis: Browser/OBS-Quelle öffnen. Der Außenrahmen muss statisch bleiben; Karten werden groß vorgestellt und wandern danach in die Ehrenwand bzw. ins Podium."
try {
  Start-Process $url | Out-Null
} catch {
  Write-Warning "Konnte Browser nicht automatisch öffnen: $($_.Exception.Message)"
}
