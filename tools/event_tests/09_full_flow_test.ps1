. "$PSScriptRoot\_common.ps1"

Write-Step "FULL FLOW: Testevent erstellen"
$create = Invoke-Evs -Method POST -Path "/chat-runtime/create-stealth-test-event?confirm=1" -Body @{
  name = "EVS FULL FLOW TEST · $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  start = $true
  startImmediately = $true
  finishExistingTestActive = $true
  answerSeconds = 20
  createdBy = "event_test_script_full_flow"
}
$create | ConvertTo-Json -Depth 10
$uid = $create.eventUid
if (-not $uid) { throw "Kein eventUid erhalten." }

Save-EvsState @{
  eventUid = $uid
  createdAt = (Get-Date).ToString("s")
  type = "full_flow"
}

Write-Step "Soundrunde vorbereiten"
Invoke-Evs -Method POST -Path "/sound-runtime/next-round" -Body @{
  eventUid = $uid
  allowReuse = $true
  play = $false
  confirm = "1"
} | ConvertTo-Json -Depth 10

Write-Step "Falsche Antworten"
Invoke-EvsChat -EventUid $uid -UserLogin "FalschUser01" -DisplayName "FalschUser01" -Message "banane rollator falsch" | ConvertTo-Json -Depth 8
Invoke-EvsChat -EventUid $uid -UserLogin "FalschUser02" -DisplayName "FalschUser02" -Message "ich weiss es nicht" | ConvertTo-Json -Depth 8

Write-Step "Richtige Antworten"
Invoke-EvsChat -EventUid $uid -UserLogin "Urlug" -DisplayName "Urlug" -Message "die heimleitung sucht den schluessel" | ConvertTo-Json -Depth 10
Invoke-EvsChat -EventUid $uid -UserLogin "RoxxyFoxxyCGN" -DisplayName "RoxxyFoxxyCGN" -Message "ich geh kurz kaffee holen" | ConvertTo-Json -Depth 10
Invoke-EvsChat -EventUid $uid -UserLogin "UdoWB" -DisplayName "UdoWB" -Message "heimleitung" | ConvertTo-Json -Depth 10

Write-Step "Ranking auf 10 User auffüllen"
$users = @(
  @{ login="Urlug"; display="Urlug"; points=120 },
  @{ login="RoxxyFoxxyCGN"; display="RoxxyFoxxyCGN"; points=108 },
  @{ login="UdoWB"; display="UdoWB"; points=96 },
  @{ login="EngelCGN"; display="EngelCGN"; points=84 },
  @{ login="AdoredPenny"; display="AdoredPenny"; points=72 },
  @{ login="AmpersandHD"; display="AmpersandHD"; points=60 },
  @{ login="Araglor"; display="Araglor"; points=48 },
  @{ login="Tiegerpranke01"; display="Tiegerpranke01"; points=36 },
  @{ login="ForrestCGN"; display="ForrestCGN"; points=24 },
  @{ login="Heimleitung"; display="Heimleitung"; points=12 }
)
foreach ($u in $users) {
  Add-EvsManualPoints -EventUid $uid -UserLogin $u.login -DisplayName $u.display -Points $u.points -Reason "full_flow_seed_ranking" | Out-Null
}

Write-Step "Reports"
Invoke-Evs -Method GET -Path "/events/$uid/ranking" | ConvertTo-Json -Depth 10
Invoke-Evs -Method GET -Path "/text-runtime/report?eventUid=$uid" | ConvertTo-Json -Depth 8
Invoke-Evs -Method GET -Path "/sound-runtime/report?eventUid=$uid" | ConvertTo-Json -Depth 8

Write-Step "Event beenden"
Invoke-Evs -Method POST -Path "/events/$uid/finish" | ConvertTo-Json -Depth 10

Write-Step "Finale starten"
Invoke-Evs -Method POST -Path "/events/$uid/finale/start?confirm=1" -Body @{
  actor = "event_test_script_full_flow"
  top3AvatarTimeoutMs = 4000
} | ConvertTo-Json -Depth 14

Write-Step "Fertig"
Write-Host "Overlay offen lassen/öffnen:"
Write-Host "$script:BaseUrl/overlays/stream_events/event_winner_overlay.html?v=4935"
