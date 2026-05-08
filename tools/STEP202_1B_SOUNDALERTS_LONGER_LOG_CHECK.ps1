$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$out = "D:\gpt\STEP202_1B_SOUNDALERTS_LONGER_LOG_CHECK_$timestamp.txt"

"STEP202.1b SoundAlerts Longer Log Check" | Out-File $out -Encoding UTF8
"CreatedAt: $(Get-Date -Format s)" | Out-File $out -Append -Encoding UTF8
"" | Out-File $out -Append -Encoding UTF8

"Syntax:" | Out-File $out -Append -Encoding UTF8
node -c .\htdocs\dashboard\modules\soundalerts.js 2>&1 | Out-File $out -Append -Encoding UTF8

"" | Out-File $out -Append -Encoding UTF8
"Limit references:" | Out-File $out -Append -Encoding UTF8
Select-String -Path .\htdocs\dashboard\modules\soundalerts.js -Pattern "EVENT_LOG_LIMIT","OVERVIEW_LOG_LIMIT","STATS_TOP_LIMIT","events?limit","slice(0," -SimpleMatch |
  Select-Object Path,LineNumber,Line |
  Format-Table -AutoSize |
  Out-File $out -Append -Encoding UTF8

"" | Out-File $out -Append -Encoding UTF8
"Backend events?limit=100:" | Out-File $out -Append -Encoding UTF8
try {
  $jsonPath = "D:\gpt\soundalerts_events_100.json"
  $res = Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/events?limit=100" -TimeoutSec 12
  $res | ConvertTo-Json -Depth 60 | Set-Content -Path $jsonPath -Encoding UTF8
  "OK: $jsonPath" | Out-File $out -Append -Encoding UTF8
  "events.Count: $($res.events.Count)" | Out-File $out -Append -Encoding UTF8
} catch {
  "ERROR: $($_.Exception.Message)" | Out-File $out -Append -Encoding UTF8
}

Get-Item $out | Select-Object FullName,Length,LastWriteTime
