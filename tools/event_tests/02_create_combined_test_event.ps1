. "$PSScriptRoot\_common.ps1"

Write-Step "Kombi-Testevent erstellen und starten"
$result = Invoke-Evs -Method POST -Path "/chat-runtime/create-stealth-test-event?confirm=1" -Body @{
  name = "EVS TEST SCRIPT · Sound + Text · $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  start = $true
  startImmediately = $true
  finishExistingTestActive = $true
  answerSeconds = 20
  createdBy = "event_test_script"
}

$result | ConvertTo-Json -Depth 12

$eventUid = $result.eventUid
if (-not $eventUid) { throw "Kein eventUid in Antwort." }

Save-EvsState @{
  eventUid = $eventUid
  createdAt = (Get-Date).ToString("s")
  type = "combined_sound_text"
  correctTextAnswer1 = "die heimleitung sucht den schluessel"
  correctTextAnswer2 = "ich geh kurz kaffee holen"
  correctSoundAnswer1 = "heimleitung"
}
