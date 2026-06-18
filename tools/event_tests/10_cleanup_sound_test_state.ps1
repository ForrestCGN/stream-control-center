. "$PSScriptRoot\_common.ps1"

Write-Step "Sound-/Runtime-Teststate aufräumen"
$result = Invoke-Evs -Method POST -Path "/sound-runtime/reset-test-state?confirm=1" -Body @{
  forceAllTestEvents = $true
}
$result | ConvertTo-Json -Depth 12
