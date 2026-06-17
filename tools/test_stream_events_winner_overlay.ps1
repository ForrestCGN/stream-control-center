param(
  [string]$Server = "http://127.0.0.1:8080",
  [string]$EventUid = "",
  [switch]$DemoSingle,
  [switch]$DemoTie
)

Write-Host "== Stream Events: Gewinner-Overlay-Test =="
Write-Host "Server: $Server"
Write-Host "Read-only: Es werden keine Daten geschrieben."
Write-Host ""

$status = Invoke-RestMethod "$Server/api/stream-events/status"
Write-Host "Modulstatus:" -ForegroundColor Cyan
$status | Select-Object ok,module,moduleVersion,moduleBuild,lastError | Format-List

$baseUrl = "$Server/overlays/stream_events/event_winner_overlay.html"

if ($DemoTie) {
  Write-Host "Demo Gleichstand / Auslosung:" -ForegroundColor Cyan
  Write-Host "$baseUrl?demo=tie&debug=0"
  return
}

if ($DemoSingle) {
  Write-Host "Demo eindeutiger Gewinner:" -ForegroundColor Cyan
  Write-Host "$baseUrl?demo=single&debug=0"
  return
}

if ([string]::IsNullOrWhiteSpace($EventUid)) {
  try {
    $events = Invoke-RestMethod "$Server/api/stream-events/events?limit=50"
    $rows = @()
    if ($events.items) { $rows = @($events.items) }
    elseif ($events.rows) { $rows = @($events.rows) }
    $candidate = $rows | Where-Object { $_.status -eq "finished" } | Select-Object -First 1
    if (-not $candidate) { $candidate = $rows | Select-Object -First 1 }
    if ($candidate) { $EventUid = $candidate.eventUid }
  } catch {
    Write-Host "Konnte Eventliste nicht lesen: $($_.Exception.Message)" -ForegroundColor Yellow
  }
}

if ([string]::IsNullOrWhiteSpace($EventUid)) {
  Write-Host "Kein EventUid gefunden." -ForegroundColor Yellow
  Write-Host "Demo eindeutiger Gewinner:"
  Write-Host "$baseUrl?demo=single"
  Write-Host "Demo Gleichstand/Auslosung:"
  Write-Host "$baseUrl?demo=tie"
  return
}

Write-Host "EventUid: $EventUid" -ForegroundColor Cyan
$preview = Invoke-RestMethod "$Server/api/stream-events/events/$EventUid/finale"
Write-Host "Finale Preview:" -ForegroundColor Cyan
$preview | Select-Object ok,status,allowed,blockedReason,topScore,candidateCount,hasTie,canStartFinale | Format-List

Write-Host "Overlay-URL fuer OBS/Browser:" -ForegroundColor Green
Write-Host "$baseUrl?eventUid=$EventUid"
Write-Host ""
Write-Host "Demo eindeutiger Gewinner:" -ForegroundColor Green
Write-Host "$baseUrl?demo=single"
Write-Host "Demo Gleichstand/Auslosung:" -ForegroundColor Green
Write-Host "$baseUrl?demo=tie"
