param(
  [string]$Server = "http://127.0.0.1:8080",
  [string]$EventUid = ""
)

$ErrorActionPreference = "Stop"

function Show-Block($Title) {
  Write-Host ""
  Write-Host $Title
  Write-Host ("-" * $Title.Length)
}

Write-Host "== Stream Events: Nächster-Schnipsel-Status =="
Write-Host "Server: $Server"
Write-Host "Read-only: Es werden keine Daten geschrieben."

$status = Invoke-RestMethod "$Server/api/stream-events/status"
Show-Block "Modulstatus"
$status | Select-Object ok,module,moduleVersion,moduleBuild,lastError | Format-List

if (-not $EventUid) {
  $events = Invoke-RestMethod "$Server/api/stream-events/events?limit=250"
  $rows = @()
  if ($events.rows) { $rows = @($events.rows) } elseif ($events.items) { $rows = @($events.items) } elseif ($events -is [array]) { $rows = @($events) }
  $active = $rows | Where-Object { $_.status -eq "active" } | Select-Object -First 1
  if ($active) { $EventUid = $active.eventUid }
  elseif ($rows.Count -gt 0) { $EventUid = $rows[0].eventUid }
}

if (-not $EventUid) {
  Write-Host "Keine Events gefunden."
  exit 0
}

Write-Host "EventUid: $EventUid"

$report = Invoke-RestMethod "$Server/api/stream-events/sound-runtime/report?eventUid=$([uri]::EscapeDataString($EventUid))"

Show-Block "Nächster Schnipsel"
$next = $report.nextSound
if ($next) {
  $next | Select-Object status,runtimeStatus,phase,label,detail,nextAutoStartAt,remainingSeconds | Format-List
} else {
  Write-Host "nextSound fehlt im Report."
}

Show-Block "Runtime-State"
if ($report.runtimeState) {
  $report.runtimeState | Select-Object runtimeStatus,phase,activeRoundUid,phaseStartedAt,phaseEndsAt,nextAutoStartAt,recoveryReason,recoveryNote,updatedAt | Format-List
} else {
  Write-Host "Kein Runtime-State vorhanden."
}

Show-Block "Aktuelle/letzte Runden"
$report.rounds | Select-Object -First 5 roundUid,status,result,itemUid,startedAt,finishedAt | Format-Table -AutoSize

Write-Host ""
Write-Host "Erwartung im Dashboard: Event-System -> Events -> Sound-Steuerung zeigt 'Nächster Schnipsel'."
