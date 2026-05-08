$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$jsonPath = "D:\gpt\last_api.json"
$logPath = "D:\gpt\STEP202_ALERT_HISTORY_PROVIDER_DIAG_$timestamp.log"

function Write-Log {
  param([string]$Text = "")
  $Text | Out-File -FilePath $logPath -Append -Encoding UTF8
}

function Capture {
  param(
    [string]$Name,
    [ScriptBlock]$Command
  )

  Write-Log ""
  Write-Log "### $Name"

  try {
    $output = & $Command 2>&1
    $lines = @($output | ForEach-Object { $_.ToString() })
    foreach ($line in $lines) { Write-Log $line }

    return [ordered]@{
      name = $Name
      ok = $true
      error = ""
      output = $lines
    }
  } catch {
    Write-Log "ERROR: $($_.Exception.Message)"

    return [ordered]@{
      name = $Name
      ok = $false
      error = $_.Exception.Message
      output = @()
    }
  }
}

function Invoke-Endpoint {
  param(
    [string]$Name,
    [string]$Url,
    [bool]$Expected404 = $false
  )

  Write-Log ""
  Write-Log "### API $Name"
  Write-Log "GET $Url"

  try {
    $response = Invoke-RestMethod $Url -Method GET -TimeoutSec 15
    Write-Log "RESULT: OK"
    ($response | ConvertTo-Json -Depth 100) | Out-File -FilePath $logPath -Append -Encoding UTF8

    return [ordered]@{
      name = $Name
      url = $Url
      ok = $true
      http = 200
      expected404 = $Expected404
      error = ""
      response = $response
    }
  } catch {
    $statusCode = $null
    $body = ""

    try {
      if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
      }
    } catch {}

    $isExpected = $Expected404 -and $statusCode -eq 404

    Write-Log ("RESULT: " + ($(if ($isExpected) { "EXPECTED" } else { "ERROR" })))
    Write-Log "HTTP: $statusCode"
    Write-Log "ERROR: $($_.Exception.Message)"
    if ($body) {
      Write-Log "RESPONSE BODY:"
      Write-Log $body
    }

    return [ordered]@{
      name = $Name
      url = $Url
      ok = $isExpected
      http = $statusCode
      expected404 = $Expected404
      error = $(if ($isExpected) { "" } else { $_.Exception.Message })
      responseBody = $body
    }
  }
}

Write-Log "STEP202 Alert History + Provider Mapping Diagnose"
Write-Log "CreatedAt: $(Get-Date -Format s)"
Write-Log "Repo: D:\Git\stream-control-center"
Write-Log "Live: D:\Streaming\stramAssets"
Write-Log "JSON: $jsonPath"
Write-Log "LOG: $logPath"

$gitHead = Capture "git head" { git log -1 --oneline }
$gitStatus = Capture "git status" { git status --short }

# 1) Find where the dashboard loads "Letzte Alerts / History".
$historySourceSearchPath = "D:\gpt\alerts_history_source_search.txt"
$historySourceSearch = Capture "search dashboard/backend alert history source" {
  Select-String -Path ".\htdocs\dashboard\modules\alerts*.js",".\backend\modules\alert_system*.js" `
    -Pattern "Letzte Alerts","History","history","events","lastAlerts","recent","replay","/api/alerts/","client_ack","events/:eventUid/replay" `
    -SimpleMatch `
    -Context 3,6 |
    Out-File $historySourceSearchPath -Encoding UTF8

  Get-Content $historySourceSearchPath
}

# 2) Provider mapping search: Twitch/Tipeee/Ko-fi/Alert forwarding.
$providerMappingPath = "D:\gpt\alert_provider_mapping_extract.txt"
$providerMapping = Capture "search provider mapping twitch tipeee kofi alert" {
  Select-String -Path ".\backend\modules\tipeee.js",".\backend\modules\kofi.js",".\backend\modules\twitch.js",".\backend\modules\alert_system.js" `
    -Pattern "tipeee","kofi","ko-fi","twitch","bits","cheer","donation","amount","currency","provider","source","enqueue","/api/alerts","forward","typeMap","eventType","subscription","message" `
    -SimpleMatch `
    -Context 4,8 |
    Out-File $providerMappingPath -Encoding UTF8

  Get-Content $providerMappingPath
}

# 3) Existing alert routes/status/queue endpoints. History route expected 404 currently.
$apiTests = @()
$apiTests += Invoke-Endpoint "alerts routes" "http://127.0.0.1:8080/api/alerts/routes"
$apiTests += Invoke-Endpoint "alerts status" "http://127.0.0.1:8080/api/alerts/status"
$apiTests += Invoke-Endpoint "alerts queue" "http://127.0.0.1:8080/api/alerts/queue"
$apiTests += Invoke-Endpoint "alerts history expected missing" "http://127.0.0.1:8080/api/alerts/history?limit=100" -Expected404 $true
$apiTests += Invoke-Endpoint "kofi status" "http://127.0.0.1:8080/api/alerts/kofi/status"
$apiTests += Invoke-Endpoint "tipeee status" "http://127.0.0.1:8080/api/alerts/tipeee/status"

# 4) Write full endpoint files separately for easier posting.
foreach ($test in $apiTests) {
  $safe = ($test.name -replace '[^a-zA-Z0-9_-]+','_').Trim('_').ToLowerInvariant()
  $outFile = "D:\gpt\STEP202_$safe.json"
  $test | ConvertTo-Json -Depth 100 | Set-Content -Path $outFile -Encoding UTF8
}

# 5) Compact current status files.
$statusCompactPath = "D:\gpt\alerts_status_compact.txt"
$queueCompactPath = "D:\gpt\alerts_queue_compact.txt"

$statusTest = $apiTests | Where-Object { $_.name -eq "alerts status" } | Select-Object -First 1
if ($statusTest -and $statusTest.response) {
  $statusTest.response |
    ConvertTo-Json -Depth 30 |
    Out-File $statusCompactPath -Encoding UTF8
}

$queueTest = $apiTests | Where-Object { $_.name -eq "alerts queue" } | Select-Object -First 1
if ($queueTest -and $queueTest.response) {
  $queueTest.response |
    ConvertTo-Json -Depth 60 |
    Out-File $queueCompactPath -Encoding UTF8
}

$output = [ordered]@{
  createdAt = (Get-Date).ToString("s")
  purpose = "STEP202 Alert History + Provider Mapping Diagnose"
  repo = "D:\Git\stream-control-center"
  live = "D:\Streaming\stramAssets"
  logPath = $logPath
  files = [ordered]@{
    historySourceSearch = $historySourceSearchPath
    providerMappingExtract = $providerMappingPath
    statusCompact = $statusCompactPath
    queueCompact = $queueCompactPath
  }
  git = [ordered]@{
    head = $gitHead
    status = $gitStatus
  }
  searches = [ordered]@{
    historySourceSearch = $historySourceSearch
    providerMapping = $providerMapping
  }
  apiTests = $apiTests
  notes = @(
    "This script only reads files and GET endpoints.",
    "It does not trigger test alerts, provider webhooks, enqueue, replay, sound, TTS, chat or Discord actions.",
    "The history route is expected to be missing based on the previous routes output.",
    "Use alerts_history_source_search.txt to identify which endpoint fills the dashboard 'Letzte Alerts / History' table.",
    "Use alert_provider_mapping_extract.txt to check whether Tipeee forwards Twitch-like events as donations."
  )
}

$output | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $jsonPath

Write-Log ""
Write-Log "Written files:"
Write-Log $jsonPath
Write-Log $logPath
Write-Log $historySourceSearchPath
Write-Log $providerMappingPath
Write-Log $statusCompactPath
Write-Log $queueCompactPath

Get-Item $jsonPath | Select-Object FullName,Length,LastWriteTime
Get-Item $logPath | Select-Object FullName,Length,LastWriteTime
Get-Item $historySourceSearchPath | Select-Object FullName,Length,LastWriteTime
Get-Item $providerMappingPath | Select-Object FullName,Length,LastWriteTime
