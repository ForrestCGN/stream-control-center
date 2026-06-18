param([string]$EventUid = "")
. "$PSScriptRoot\_common.ps1"

$uid = Get-EvsEventUid $EventUid
Write-Step "Ranking mit 10 Test-Usern auffüllen"

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
  Write-Host "Punkte: $($u.display) +$($u.points)"
  $r = Add-EvsManualPoints -EventUid $uid -UserLogin $u.login -DisplayName $u.display -Points $u.points
  $r | ConvertTo-Json -Depth 8
  Start-Sleep -Milliseconds 150
}

Write-Step "Ranking"
Invoke-Evs -Method GET -Path "/events/$uid/ranking" | ConvertTo-Json -Depth 10
