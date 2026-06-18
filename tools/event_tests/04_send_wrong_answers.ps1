param([string]$EventUid = "")
. "$PSScriptRoot\_common.ps1"

$uid = Get-EvsEventUid $EventUid
Write-Step "Falsche Antworten simulieren"

$messages = @(
  @{ user="FalschUser01"; display="FalschUser01"; msg="banane rollator falsch" },
  @{ user="FalschUser02"; display="FalschUser02"; msg="das ist garantiert nicht richtig" },
  @{ user="FalschUser03"; display="FalschUser03"; msg="kaffee aber komplett falsch formuliert" }
)

foreach ($m in $messages) {
  Write-Host "Sende: $($m.user) -> $($m.msg)"
  $r = Invoke-EvsChat -EventUid $uid -UserLogin $m.user -DisplayName $m.display -Message $m.msg
  $r | ConvertTo-Json -Depth 8
  Start-Sleep -Milliseconds 300
}
