# tools/test_event_runtime_unresolved_card.ps1
# ForrestCGN stream-control-center
# Test: EventSound ohne Loesung / Timeout / Keine-Loesung-Kachel
#
# Ablauf:
# - Test-State resetten
# - Test-Event mit echter Media erstellen
# - Sound-Runde starten
# - KEINE Antwort senden
# - Antwortfenster/Counter beobachten
# - Timeout / sound_unresolved erkennen
# - Logdatei auf Desktop schreiben

$ErrorActionPreference = "Continue"
$base = "http://127.0.0.1:8080"

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path $env:USERPROFILE "Desktop\event_runtime_unresolved_card_$stamp.log"

function Log($msg, $color = $null) {
  $line = "[{0}] {1}" -f (Get-Date -Format "HH:mm:ss.fff"), $msg
  Add-Content -Path $logFile -Value $line -Encoding UTF8
  if ($color) { Write-Host $line -ForegroundColor $color } else { Write-Host $line }
}

function ToJsonSafe($obj, $depth = 12) {
  try { return ($obj | ConvertTo-Json -Depth $depth) } catch { return "JSON_ERROR: $($_.Exception.Message)" }
}

function GetApi($url) {
  Invoke-RestMethod -Method Get -Uri $url -TimeoutSec 10
}

function PostApi($url) {
  Invoke-RestMethod -Method Post -Uri $url -TimeoutSec 25
}

function Dump($title, $obj) {
  Log ""
  Log "===== $title =====" "Cyan"
  Add-Content -Path $logFile -Value (ToJsonSafe $obj 14) -Encoding UTF8
}

function GetRuntimeState() {
  GetApi "$base/api/stream-events/runtime-overlay/state"
}

function ReadStateInfo($st) {
  $state = $st.state
  if ($null -eq $state) { $state = $st }

  $phaseKey = ""
  if ($state.phase) { $phaseKey = [string]$state.phase.key }

  $visible = ""
  if ($state.phase) { $visible = $state.phase.visible }

  $mode = ""
  if ($state.display) { $mode = [string]$state.display.overlayMode }

  $headline = ""
  $subline = ""
  if ($state.display) {
    $headline = [string]$state.display.headline
    $subline = [string]$state.display.subline
  }

  $awActive = $false
  $remaining = ""
  if ($state.answerWindow) {
    $awActive = ($state.answerWindow.active -eq $true)
    $remaining = $state.answerWindow.remainingSeconds
  }

  $resultVisibleMs = ""
  $resultElapsedMs = ""
  if ($state.result) {
    $resultVisibleMs = $state.result.visibleMs
    $resultElapsedMs = $state.result.elapsedMs
  }

  return [PSCustomObject]@{
    State = $state
    PhaseKey = $phaseKey
    Visible = $visible
    Mode = $mode
    Headline = $headline
    Subline = $subline
    AnswerActive = $awActive
    Remaining = $remaining
    ResultVisibleMs = $resultVisibleMs
    ResultElapsedMs = $resultElapsedMs
  }
}

Clear-Host
Log "EVENT_RUNTIME_UNRESOLVED_CARD_TEST gestartet" "Green"
Log "Logdatei: $logFile" "Yellow"
Log "Es wird KEINE Antwort gesendet. Der Test wartet auf Timeout / KEINE LOESUNG." "Yellow"

try {
  Start-Process "$base/overlays/stream_events/event_runtime_overlay.html?debug=1&v=$stamp"
  Log "Overlay im Browser mit Cache-Buster geoeffnet." "Cyan"
} catch {
  Log "Browser konnte nicht automatisch geoeffnet werden: $($_.Exception.Message)" "Yellow"
}

try {
  $status = GetApi "$base/api/stream-events/status"
  Dump "STREAM_EVENTS_STATUS" $status
  Log ("Version: moduleVersion={0} moduleBuild={1}" -f $status.moduleVersion, $status.moduleBuild) "Yellow"
  Log "Erwartet: moduleVersion=0.5.51 / moduleBuild=STEP_EVENT_RUNTIME_UNRESOLVED_CARD_1" "Yellow"
} catch {
  Log "FEHLER: Backend/stream-events nicht erreichbar: $($_.Exception.Message)" "Red"
  exit 1
}

try {
  Log "Reset Test-State..." "Cyan"
  $reset = PostApi "$base/api/stream-events/sound-runtime/reset-test-state?confirm=1"
  Dump "RESET_TEST_STATE" $reset
} catch {
  Log "FEHLER Reset: $($_.Exception.Message)" "Red"
  exit 1
}

Start-Sleep -Seconds 1

try {
  Log "Erstelle Test-Event mit echter Media..." "Cyan"
  $create = PostApi "$base/api/stream-events/sound-runtime/create-test-event?confirm=1&useRealMedia=1"
  Dump "CREATE_TEST_EVENT" $create
} catch {
  Log "FEHLER Create-Test-Event: $($_.Exception.Message)" "Red"
  exit 1
}

Start-Sleep -Seconds 1

try {
  Log "Starte naechste Runde..." "Cyan"
  $next = PostApi "$base/api/stream-events/sound-runtime/next-round?play=1&confirm=1"
  Dump "NEXT_ROUND" $next
} catch {
  Log "FEHLER next-round: $($_.Exception.Message)" "Red"
  exit 1
}

$seenAnswerWindow = $false
$seenUnresolved = $false
$seenCounterToZero = $false
$maxSeconds = 220

Log ""
Log "Beobachte automatisch. Bitte nichts im Chat antworten." "Green"

for ($i = 1; $i -le $maxSeconds; $i++) {
  try {
    $st = GetRuntimeState
    $info = ReadStateInfo $st

    Log ("t+{0,3}s | visible={1} | mode={2} | phase={3} | answerActive={4} | remaining={5} | resultMs={6}/{7} | headline={8} | subline={9}" -f `
      $i,
      $info.Visible,
      $info.Mode,
      $info.PhaseKey,
      $info.AnswerActive,
      $info.Remaining,
      $info.ResultElapsedMs,
      $info.ResultVisibleMs,
      $info.Headline,
      $info.Subline)

    if ($info.AnswerActive -eq $true) {
      $seenAnswerWindow = $true
      if ([string]$info.Remaining -eq "0") {
        $seenCounterToZero = $true
      }
    }

    if ($seenAnswerWindow -and ([string]$info.Remaining -eq "0")) {
      $seenCounterToZero = $true
    }

    if ($info.PhaseKey -eq "sound_unresolved" -or ($info.Mode -eq "result" -and $info.Headline -eq "KEINE LÖSUNG")) {
      $seenUnresolved = $true
      Log "KEINE-LOESUNG / sound_unresolved erkannt. Jetzt 14 Sekunden weiter beobachten." "Green"

      for ($j = 1; $j -le 14; $j++) {
        Start-Sleep -Seconds 1
        try {
          $st2 = GetRuntimeState
          $info2 = ReadStateInfo $st2
          Log ("after-unresolved+{0,2}s | visible={1} | mode={2} | phase={3} | answerActive={4} | remaining={5} | resultMs={6}/{7} | headline={8} | subline={9}" -f `
            $j,
            $info2.Visible,
            $info2.Mode,
            $info2.PhaseKey,
            $info2.AnswerActive,
            $info2.Remaining,
            $info2.ResultElapsedMs,
            $info2.ResultVisibleMs,
            $info2.Headline,
            $info2.Subline)
        } catch {
          Log "after-unresolved+$j STATE_ERROR: $($_.Exception.Message)" "Red"
        }
      }

      break
    }
  } catch {
    Log ("t+{0,3}s | ERROR: {1}" -f $i, $_.Exception.Message) "Red"
  }

  Start-Sleep -Seconds 1
}

try {
  $final = GetApi "$base/api/stream-events/runtime-overlay/state"
  Dump "FINAL_RUNTIME_STATE" $final
} catch {
  Log "WARNUNG final runtime state: $($_.Exception.Message)" "Yellow"
}

try {
  $recent = GetApi "$base/api/sound/recent-playback?limit=10"
  Dump "FINAL_SOUND_RECENT_PLAYBACK" $recent
} catch {
  Log "WARNUNG recent playback: $($_.Exception.Message)" "Yellow"
}

try {
  $preroll = GetApi "$base/api/sound/event-preroll/status"
  Dump "FINAL_SOUND_EVENT_PREROLL_STATUS" $preroll
} catch {
  Log "WARNUNG preroll status: $($_.Exception.Message)" "Yellow"
}

Log ""
Log "===== KURZFAZIT =====" "Cyan"
Log ("answerWindow gesehen: {0}" -f $seenAnswerWindow) ($(if ($seenAnswerWindow) { "Green" } else { "Red" }))
Log ("Counter bis 0 beobachtet/angenommen: {0}" -f $seenCounterToZero) "Yellow"
Log ("sound_unresolved / KEINE LOESUNG gesehen: {0}" -f $seenUnresolved) ($(if ($seenUnresolved) { "Green" } else { "Red" }))

if (-not $seenAnswerWindow) {
  Log "Problem: answerWindow wurde nie aktiv. Dann kann der Counter nicht sauber laufen." "Red"
}
if (-not $seenUnresolved) {
  Log "Problem: Timeout/Keine-Loesung-Kachel wurde nicht erkannt." "Red"
}

Log ""
Log "Bitte diese Logdatei hochladen, wenn etwas nicht passt:" "Yellow"
Log $logFile "Yellow"

Write-Host ""
Write-Host "Fertig. Bitte Logdatei hochladen, wenn etwas nicht passt:" -ForegroundColor Yellow
Write-Host $logFile -ForegroundColor Yellow
Read-Host "ENTER zum Schliessen"
