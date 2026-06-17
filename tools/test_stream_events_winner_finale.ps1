param(
  [string]$Server = "http://127.0.0.1:8080",
  [string]$EventUid = "",
  [switch]$Finish,
  [switch]$Finale,
  [switch]$CommandFertig,
  [switch]$CommandAuslosung
)

$ErrorActionPreference = "Stop"
Write-Host "== Stream Events: Winner-/Finale-Test =="
Write-Host "Server: $Server"
if (-not $Finish -and -not $Finale -and -not $CommandFertig -and -not $CommandAuslosung) {
  Write-Host "Modus: Read-only - es werden keine Daten geschrieben."
} else {
  Write-Host "Modus: EXECUTE - je nach Schalter wird Finished/Finale ausgefuehrt."
}

function Show-Block($Title, $Data) {
  Write-Host ""
  Write-Host $Title
  Write-Host ("-" * $Title.Length)
  $Data | Format-List
}

$status = Invoke-RestMethod "$Server/api/stream-events/status"
Show-Block "Modulstatus" ($status | Select-Object ok,module,moduleVersion,moduleBuild,lastError)

if (-not $EventUid) {
  $events = Invoke-RestMethod "$Server/api/stream-events/events?limit=250"
  $rows = @($events.rows)
  $selected = $rows | Where-Object { $_.status -eq "active" } | Select-Object -First 1
  if (-not $selected) { $selected = $rows | Where-Object { $_.status -eq "finished" } | Select-Object -First 1 }
  if (-not $selected) { $selected = $rows | Select-Object -First 1 }
  if ($selected) { $EventUid = $selected.eventUid }
}

if (-not $EventUid) {
  Write-Host "Keine Events gefunden."
  exit 0
}

Write-Host ""
Write-Host "EventUid: $EventUid"

$event = Invoke-RestMethod "$Server/api/stream-events/events/$EventUid"
Show-Block "Event" ($event.event | Select-Object eventUid,name,status,soundEnabled,textEnabled,startedAt,finishedAt,updatedAt)

$ranking = Invoke-RestMethod "$Server/api/stream-events/events/$EventUid/ranking"
Write-Host ""
Write-Host "Ranking Top 10"
Write-Host "--------------"
@($ranking.rows) | Select-Object -First 10 rank,userLogin,userDisplayName,points,entries,lastPointsAt | Format-Table -AutoSize

try {
  $preview = Invoke-RestMethod "$Server/api/stream-events/events/$EventUid/finale"
  Show-Block "Finale Preview" ($preview | Select-Object ok,status,allowed,blockedReason,topScore,candidateCount,hasTie,canStartFinale,rule)
  if ($preview.topCandidates) {
    Write-Host ""
    Write-Host "Final-Kandidaten"
    Write-Host "----------------"
    @($preview.topCandidates) | Select-Object rank,userLogin,userDisplayName,points | Format-Table -AutoSize
  }
} catch {
  Write-Host "Finale Preview nicht verfuegbar: $($_.Exception.Message)"
}

if ($Finish) {
  Write-Host ""
  Write-Host "Setze Event manuell auf Finished..."
  $finishResult = Invoke-RestMethod "$Server/api/stream-events/events/$EventUid/finish" -Method POST -ContentType "application/json" -Body (@{ actor = "test_script"; mode = "manual"; reason = "manual_test_finished" } | ConvertTo-Json)
  Show-Block "Finish Ergebnis" ($finishResult | Select-Object ok,alreadyFinal,manualFinish)
  if ($finishResult.event) { Show-Block "Event nach Finish" ($finishResult.event | Select-Object eventUid,name,status,finishedAt,updatedAt) }
}

if ($CommandFertig) {
  Write-Host ""
  Write-Host "Teste !event fertig ueber Command-Testroute..."
  $cmd = Invoke-RestMethod "$Server/api/stream-events/commands/event/test" -Method POST -ContentType "application/json" -Body (@{ message = "!event fertig"; userLogin = "modtest"; userDisplayName = "ModTest"; isModerator = $true } | ConvertTo-Json)
  Show-Block "Command fertig" ($cmd | Select-Object ok,error,subcommand,chatOutput)
}

if ($Finale) {
  Write-Host ""
  Write-Host "Starte Gewinner-Finale..."
  $finaleResult = Invoke-RestMethod "$Server/api/stream-events/events/$EventUid/finale/start?confirm=1" -Method POST -ContentType "application/json" -Body (@{ actor = "test_script" } | ConvertTo-Json)
  Show-Block "Finale Ergebnis" ($finaleResult | Select-Object ok,alreadyDrawn,replay,overlayReady,overlayStepPending)
  if ($finaleResult.finale) {
    Show-Block "Gewinner" ($finaleResult.finale.winner | Select-Object rank,userLogin,userDisplayName,points,entries)
    Show-Block "Finale" ($finaleResult.finale | Select-Object finaleUid,mode,style,topScore,candidateCount,rankingCount,startedAt,startedBy,message)
  }
}

if ($CommandAuslosung) {
  Write-Host ""
  Write-Host "Teste !event auslosung ueber Command-Testroute..."
  $cmd = Invoke-RestMethod "$Server/api/stream-events/commands/event/test" -Method POST -ContentType "application/json" -Body (@{ message = "!event auslosung"; userLogin = "modtest"; userDisplayName = "ModTest"; isModerator = $true } | ConvertTo-Json)
  Show-Block "Command auslosung" ($cmd | Select-Object ok,error,subcommand,chatOutput)
  if ($cmd.finale -and $cmd.finale.finale) { Show-Block "Command Gewinner" ($cmd.finale.finale.winner | Select-Object rank,userLogin,userDisplayName,points) }
}

if (-not $Finish -and -not $Finale -and -not $CommandFertig -and -not $CommandAuslosung) {
  Write-Host ""
  Write-Host "Read-only beendet. Beispiele:"
  Write-Host "powershell -ExecutionPolicy Bypass -File \".\\tools\\test_stream_events_winner_finale.ps1\" -EventUid \"$EventUid\" -Finish"
  Write-Host "powershell -ExecutionPolicy Bypass -File \".\\tools\\test_stream_events_winner_finale.ps1\" -EventUid \"$EventUid\" -Finale"
  Write-Host "powershell -ExecutionPolicy Bypass -File \".\\tools\\test_stream_events_winner_finale.ps1\" -CommandAuslosung"
}
