$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$script = ".\tools\STEP202_CHECK_TIPEEE_TWITCH_TIMING_SQLITE_CORE.js"

Write-Host "Running: node $script 120"
node $script 120

Write-Host ""
Write-Host "Output:"
Write-Host "D:\gpt\tipeee_twitch_timing_check.txt"
Write-Host "D:\gpt\tipeee_twitch_timing_check.json"

if (Test-Path "D:\gpt\tipeee_twitch_timing_check.txt") {
  Write-Host ""
  Write-Host "---- TXT Preview ----"
  Get-Content "D:\gpt\tipeee_twitch_timing_check.txt" -TotalCount 120
}
