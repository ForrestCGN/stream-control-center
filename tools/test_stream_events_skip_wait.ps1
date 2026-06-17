param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [string]$EventUid = "",
  [switch]$Execute
)

Write-Host "== Stream Events: Sound-Wartezeit ueberspringen =="
Write-Host "Server: $BaseUrl"
if ($Execute) {
  Write-Host "Modus: EXECUTE - startet den naechsten Schnipsel, wenn das Event wartet."
} else {
  Write-Host "Modus: Read-only - es wird nichts gestartet. Mit -Execute wirklich ausfuehren."
}
Write-Host ""

function Invoke-Json($Method, $Url, $BodyObj = $null) {
  if ($BodyObj -ne $null) {
    $json = $BodyObj | ConvertTo-Json -Depth 8
    return Invoke-RestMethod -Method $Method -Uri $Url -ContentType "application/json" -Body $json
  }
  return Invoke-RestMethod -Method $Method -Uri $Url
}

try {
  $status = Invoke-Json GET "$BaseUrl/api/stream-events/status"
  Write-Host "Modulstatus:"
  $status | Select-Object ok,module,moduleVersion,version,enabled,lastError | Format-List

  if (-not $EventUid) {
    $events = Invoke-Json GET "$BaseUrl/api/stream-events/events?limit=250"
    $list = @()
    if ($events.rows) { $list = @($events.rows) }
    elseif ($events.items) { $list = @($events.items) }
    elseif ($events.events) { $list = @($events.events) }

    $activeSound = @($list | Where-Object { $_.status -eq "active" -and ($_.soundEnabled -eq $true -or $_.sound_enabled -eq $true) })
    if ($activeSound.Count -gt 0) {
      $EventUid = $activeSound[0].eventUid
    }
  }

  if (-not $EventUid) {
    Write-Host "Kein aktives Sound-Event gefunden. Starte erst ein Event oder gib -EventUid an." -ForegroundColor Yellow
    exit 0
  }

  Write-Host "EventUid: $EventUid"
  Write-Host ""

  $runtime = Invoke-Json GET "$BaseUrl/api/stream-events/sound-runtime/status?eventUid=$EventUid"
  Write-Host "Sound-Runtime vor Aktion:"
  $runtime | Select-Object activeSoundRuntime,activeRound | Format-List
  if ($runtime.parts -and $runtime.parts.sound) {
    $runtime.parts.sound | Select-Object enabled,status,completed,total,solved,remaining,unresolved,activeRoundUid | Format-List
  }
  if ($runtime.timers) {
    $runtime.timers | Format-List
  }

  if (-not $Execute) {
    Write-Host ""
    Write-Host "Read-only beendet. Zum echten Ueberspringen:" -ForegroundColor Cyan
    Write-Host "powershell -ExecutionPolicy Bypass -File `".\tools\test_stream_events_skip_wait.ps1`" -EventUid `"$EventUid`" -Execute"
    exit 0
  }

  Write-Host ""
  Write-Host "Sende Skip-Wait..."
  $result = Invoke-Json POST "$BaseUrl/api/stream-events/sound-runtime/skip-wait" @{ eventUid = $EventUid; actor = "test_script"; allowReuse = $false }
  Write-Host "Ergebnis:"
  $result | Select-Object ok,eventUid,skippedWait,hadScheduledWait,message | Format-List
  if ($result.snippet) {
    $result.snippet | Select-Object snippetUid,title,mediaId,points | Format-List
  }
  if ($result.round) {
    $result.round | Select-Object roundUid,status,itemUid,startedAt | Format-List
  }

  Start-Sleep -Seconds 1
  $after = Invoke-Json GET "$BaseUrl/api/stream-events/sound-runtime/status?eventUid=$EventUid"
  Write-Host "Sound-Runtime nach Aktion:"
  $after | Select-Object activeSoundRuntime,activeRound | Format-List
  if ($after.parts -and $after.parts.sound) {
    $after.parts.sound | Select-Object enabled,status,completed,total,solved,remaining,unresolved,activeRoundUid | Format-List
  }
} catch {
  Write-Host "FEHLER:" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
    Write-Host $_.ErrorDetails.Message -ForegroundColor Red
  }
  exit 1
}
