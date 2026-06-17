param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [string]$EventUid = "",
  [switch]$Execute,
  [int]$WaitSeconds = 25
)

Write-Host "== Stream Events: Antwortzeit / Event-Settings-Test =="
Write-Host "Server: $BaseUrl"
if ($Execute) {
  Write-Host "Modus: EXECUTE - ueberspringt die Wartezeit und prueft die gestartete Runde."
} else {
  Write-Host "Modus: Read-only - es wird nichts gestartet."
}
Write-Host ""

function Invoke-Json($Method, $Url, $BodyObj = $null) {
  if ($BodyObj -ne $null) {
    $json = $BodyObj | ConvertTo-Json -Depth 8
    return Invoke-RestMethod -Method $Method -Uri $Url -ContentType "application/json" -Body $json
  }
  return Invoke-RestMethod -Method $Method -Uri $Url
}

function Get-ActiveSoundEventUid() {
  $events = Invoke-Json GET "$BaseUrl/api/stream-events/events?limit=250"
  $list = @()
  if ($events.rows) { $list = @($events.rows) }
  elseif ($events.items) { $list = @($events.items) }
  elseif ($events.events) { $list = @($events.events) }
  $activeSound = @($list | Where-Object { $_.status -eq "active" -and ($_.soundEnabled -eq $true -or $_.sound_enabled -eq $true) })
  if ($activeSound.Count -gt 0) { return $activeSound[0].eventUid }
  return ""
}

try {
  $status = Invoke-Json GET "$BaseUrl/api/stream-events/status"
  Write-Host "Modulstatus:"
  $status | Select-Object ok,module,moduleVersion,version,enabled,lastError | Format-List

  if (-not $EventUid) { $EventUid = Get-ActiveSoundEventUid }
  if (-not $EventUid) {
    Write-Host "Kein aktives Sound-Event gefunden. Starte erst ein Event oder gib -EventUid an." -ForegroundColor Yellow
    exit 0
  }

  Write-Host "EventUid: $EventUid"
  Write-Host ""

  $report = Invoke-Json GET "$BaseUrl/api/stream-events/sound-runtime/report?eventUid=$EventUid"
  $configured = $null
  if ($report.event -and $report.event.validation -and $report.event.validation.details -and $report.event.validation.details.sound -and $report.event.validation.details.sound.settings) {
    $configured = $report.event.validation.details.sound.settings.answerSeconds
  }
  Write-Host "Event-Einstellung answerSeconds: $configured"

  if ($report.rounds -and @($report.rounds).Count -gt 0) {
    Write-Host "Letzte Runden:"
    @($report.rounds) | Select-Object -First 5 | ForEach-Object {
      $rd = $_.resultData
      [PSCustomObject]@{
        roundUid = $_.roundUid
        status = $_.status
        title = if ($_.config -and $_.config.snippet) { $_.config.snippet.title } else { "" }
        configAnswerSeconds = if ($_.config) { $_.config.answerSeconds } else { $null }
        resultAnswerSeconds = if ($rd) { $rd.answerWindowSeconds } else { $null }
        answerWindowState = if ($rd) { $rd.answerWindowState } else { "" }
      }
    } | Format-Table -AutoSize
  }

  if (-not $Execute) {
    Write-Host ""
    Write-Host "Read-only beendet. Zum echten Test:" -ForegroundColor Cyan
    Write-Host "powershell -ExecutionPolicy Bypass -File `".\tools\test_stream_events_answer_seconds.ps1`" -EventUid `"$EventUid`" -Execute"
    exit 0
  }

  Write-Host ""
  Write-Host "Sende Skip-Wait..."
  $result = Invoke-Json POST "$BaseUrl/api/stream-events/sound-runtime/skip-wait" @{ eventUid = $EventUid; actor = "answer_seconds_test"; allowReuse = $false }
  $result | Select-Object ok,eventUid,skippedWait,reusedPreparedRound,hadScheduledWait,message,error | Format-List

  $roundUid = ""
  if ($result.round -and $result.round.roundUid) { $roundUid = $result.round.roundUid }
  Write-Host "Runde: $roundUid"
  Write-Host "Warte bis das Antwortfenster vorbereitet/gestartet wurde..."

  $deadline = (Get-Date).AddSeconds($WaitSeconds)
  $last = $null
  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 1
    $r = Invoke-Json GET "$BaseUrl/api/stream-events/sound-runtime/report?eventUid=$EventUid"
    $round = $null
    if ($roundUid -and $r.rounds) { $round = @($r.rounds | Where-Object { $_.roundUid -eq $roundUid } | Select-Object -First 1) }
    if (-not $round -and $r.rounds) { $round = @($r.rounds | Select-Object -First 1) }
    if ($round) {
      $last = $round
      $state = if ($round.resultData) { $round.resultData.answerWindowState } else { "" }
      $secs = if ($round.resultData) { $round.resultData.answerWindowSeconds } else { $null }
      if ($state -eq "open" -or $state -eq "closed") { break }
    }
  }

  if ($last) {
    Write-Host "Antwortfenster-Pruefung:"
    $last.resultData | Select-Object answerWindowState,answerWindowSeconds,answerWindowStartedAt,answerWindowEndsAt,answerWindowStartReason | Format-List
    Write-Host "Runden-Config:"
    $last.config | Select-Object answerSeconds | Format-List
    Write-Host "Erwartung: answerWindowSeconds muss der Event-Einstellung entsprechen: $configured"
  } else {
    Write-Host "Keine Runde zur Pruefung gefunden." -ForegroundColor Yellow
  }
} catch {
  Write-Host "FEHLER:" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
    Write-Host $_.ErrorDetails.Message -ForegroundColor Red
  }
  exit 1
}
