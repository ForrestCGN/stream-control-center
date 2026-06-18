param([string]$EventUid = "")
. "$PSScriptRoot\_common.ps1"

$uid = Get-EvsEventUid $EventUid
Write-Step "Finale/Auswertung starten: $uid"
$result = Invoke-Evs -Method POST -Path "/events/$uid/finale/start?confirm=1" -Body @{
  actor = "event_test_script"
  top3AvatarTimeoutMs = 4000
}
$result | ConvertTo-Json -Depth 14

Write-Step "Overlay URL"
Write-Host "$script:BaseUrl/overlays/stream_events/event_winner_overlay.html?v=4935"
