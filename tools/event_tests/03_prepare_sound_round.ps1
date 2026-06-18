param([string]$EventUid = "")
. "$PSScriptRoot\_common.ps1"

$uid = Get-EvsEventUid $EventUid
Write-Step "Soundrunde vorbereiten für $uid"
$result = Invoke-Evs -Method POST -Path "/sound-runtime/next-round" -Body @{
  eventUid = $uid
  allowReuse = $true
  forceReset = $false
  play = $false
  confirm = "1"
}
$result | ConvertTo-Json -Depth 12
