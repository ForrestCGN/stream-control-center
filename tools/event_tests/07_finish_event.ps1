param([string]$EventUid = "")
. "$PSScriptRoot\_common.ps1"

$uid = Get-EvsEventUid $EventUid
Write-Step "Event beenden / auf finished setzen: $uid"
$result = Invoke-Evs -Method POST -Path "/events/$uid/finish"
$result | ConvertTo-Json -Depth 10
