$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$out = "D:\gpt\STEP201_CURRENT_STATUS_CHECK_$timestamp.txt"

"STEP201 Current Status Check" | Out-File $out -Encoding UTF8
"CreatedAt: $(Get-Date -Format s)" | Out-File $out -Append -Encoding UTF8
"" | Out-File $out -Append -Encoding UTF8

"Git head:" | Out-File $out -Append -Encoding UTF8
git log -1 --oneline | Out-File $out -Append -Encoding UTF8

"" | Out-File $out -Append -Encoding UTF8
"Git status:" | Out-File $out -Append -Encoding UTF8
git status --short | Out-File $out -Append -Encoding UTF8

"" | Out-File $out -Append -Encoding UTF8
"Relevant endpoint quick check:" | Out-File $out -Append -Encoding UTF8

$urls = @(
  "http://127.0.0.1:8080/api/obs/status",
  "http://127.0.0.1:8080/api/scene/status",
  "http://127.0.0.1:8080/api/discord/status",
  "http://127.0.0.1:8080/api/twitch/presence/status",
  "http://127.0.0.1:8080/api/overlay/chat/status",
  "http://127.0.0.1:8080/api/overlay/chat/integration-check"
)

foreach ($url in $urls) {
  try {
    $r = Invoke-RestMethod $url -TimeoutSec 8
    "OK  $url" | Out-File $out -Append -Encoding UTF8
  } catch {
    "ERR $url :: $($_.Exception.Message)" | Out-File $out -Append -Encoding UTF8
  }
}

"" | Out-File $out -Append -Encoding UTF8
"Output: $out" | Out-File $out -Append -Encoding UTF8

Get-Item $out | Select-Object FullName,Length,LastWriteTime
