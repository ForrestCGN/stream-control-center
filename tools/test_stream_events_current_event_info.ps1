param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [string]$EventUid = ""
)

$ErrorActionPreference = "Stop"

function Get-Json($Url) {
  try {
    return Invoke-RestMethod -Method GET -Uri $Url
  } catch {
    Write-Host "FEHLER bei GET $Url" -ForegroundColor Red
    throw
  }
}

Write-Host "== Stream Events: Aktuelles Event / Punkte-Test ==" -ForegroundColor Cyan
Write-Host "Server: $BaseUrl"
Write-Host "Read-only: Es werden keine Daten geschrieben."
Write-Host ""

$statusUrl = "$BaseUrl/api/stream-events/status"
$listUrl = "$BaseUrl/api/stream-events/events?limit=250"

$status = Get-Json $statusUrl
Write-Host "Modulstatus:" -ForegroundColor Yellow
$status | Select-Object ok,module,moduleVersion,version,enabled,lastError | Format-List

$list = Get-Json $listUrl
$events = @($list.items)
if (-not $events -or $events.Count -eq 0) {
  Write-Host "Keine Events gefunden." -ForegroundColor Yellow
  exit 0
}

if ([string]::IsNullOrWhiteSpace($EventUid)) {
  $event = $events | Where-Object { $_.status -eq "active" } | Select-Object -First 1
  if (-not $event) { $event = $events | Select-Object -First 1 }
} else {
  $event = $events | Where-Object { $_.eventUid -eq $EventUid } | Select-Object -First 1
}

if (-not $event) {
  Write-Host "Event nicht gefunden: $EventUid" -ForegroundColor Red
  exit 1
}

Write-Host "Aktuelles/gewähltes Event:" -ForegroundColor Yellow
$event | Select-Object eventUid,name,status,soundEnabled,textEnabled,createdAt,updatedAt | Format-List

$rankingUrl = "$BaseUrl/api/stream-events/events/$($event.eventUid)/ranking"
$ranking = Get-Json $rankingUrl
$rows = @($ranking.rows)

Write-Host "Rangliste nach Gesamtpunkten:" -ForegroundColor Yellow
if (-not $rows -or $rows.Count -eq 0) {
  Write-Host "Noch keine Punkte für dieses Event." -ForegroundColor DarkYellow
} else {
  $rows |
    Sort-Object @{ Expression = { [int]($_.rank) }; Ascending = $true } |
    Select-Object rank,userLogin,userDisplayName,points,entries |
    Format-Table -AutoSize
}

Write-Host ""
Write-Host "Zusatzcheck Sound/Text-Reports, falls vorhanden:" -ForegroundColor Yellow
foreach ($kind in @("sound-runtime", "text-runtime")) {
  $url = "$BaseUrl/api/stream-events/$kind/report?eventUid=$($event.eventUid)"
  try {
    $report = Get-Json $url
    $rRows = @($report.ranking.rows)
    Write-Host "$kind -> Ranking-Zeilen: $($rRows.Count)"
  } catch {
    Write-Host "$kind -> nicht verfügbar oder Fehler; für diesen Kurztest nicht kritisch." -ForegroundColor DarkYellow
  }
}

Write-Host ""
Write-Host "Fertig. Dashboard prüfen: Event-System -> Aktuelles Event -> Aktualisieren" -ForegroundColor Green
