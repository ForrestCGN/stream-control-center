param([string]$EventUid = "")
. "$PSScriptRoot\_common.ps1"

$uid = Get-EvsEventUid $EventUid
Write-Step "Richtige Textantworten simulieren"

$messages = @(
  @{ user="Urlug"; display="Urlug"; msg="die heimleitung sucht den schluessel" },
  @{ user="RoxxyFoxxyCGN"; display="RoxxyFoxxyCGN"; msg="ich geh kurz kaffee holen" },
  @{ user="EngelCGN"; display="EngelCGN"; msg="heimleitung sucht schluessel" }
)

foreach ($m in $messages) {
  Write-Host "Sende: $($m.user) -> $($m.msg)"
  $r = Invoke-EvsChat -EventUid $uid -UserLogin $m.user -DisplayName $m.display -Message $m.msg
  $r | ConvertTo-Json -Depth 10
  Start-Sleep -Milliseconds 500
}
