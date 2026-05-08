$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$jsonPath = "D:\gpt\last_api.json"
$logPath = "D:\gpt\STEP201_12C_OVERLAY_CHAT_CHECK_$timestamp.log"

function Write-Log {
  param([string]$Text = "")
  $Text | Out-File -FilePath $logPath -Append -Encoding UTF8
}

function Capture {
  param([ScriptBlock]$Command)

  try {
    $output = & $Command 2>&1
    return [ordered]@{
      ok = $true
      error = ""
      output = @($output | ForEach-Object { $_.ToString() })
    }
  } catch {
    return [ordered]@{
      ok = $false
      error = $_.Exception.Message
      output = @()
    }
  }
}

function Invoke-Endpoint {
  param(
    [string]$Url,
    [string]$Method = "GET",
    [bool]$Expected404 = $false,
    [bool]$Expected400 = $false
  )

  try {
    if ($Method -eq "POST") {
      $response = Invoke-RestMethod $Url -Method POST -TimeoutSec 10
    } else {
      $response = Invoke-RestMethod $Url -Method GET -TimeoutSec 10
    }

    return [ordered]@{
      ok = $true
      http = 200
      method = $Method
      url = $Url
      expected404 = $Expected404
      expected400 = $Expected400
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

    $isExpected = ($Expected404 -and $statusCode -eq 404) -or ($Expected400 -and $statusCode -eq 400)

    return [ordered]@{
      ok = $isExpected
      http = $statusCode
      method = $Method
      url = $Url
      expected404 = $Expected404
      expected400 = $Expected400
      error = $(if ($isExpected) { "" } else { $_.Exception.Message })
      responseBody = $body
    }
  }
}

Write-Log "STEP201.12c Overlay-Chat Datei-, Routen- und API-Pruefung"
Write-Log "CreatedAt: $(Get-Date -Format s)"
Write-Log "Repo: D:\Git\stream-control-center"
Write-Log "Output JSON: $jsonPath"
Write-Log "Log: $logPath"
Write-Log ""

$gitStatus = Capture { git status --short }
$gitHead = Capture { git log -1 --oneline }

$fileError = ""
$routeSearchError = ""

$overlayChatFiles = @()
try {
  $overlayChatFiles = Get-ChildItem -Recurse backend,htdocs,config,docs,project-state -File -ErrorAction SilentlyContinue |
    Where-Object {
      $_.Name -match 'chat|Chat|overlay|Overlay|emote|Emote|twitch_chat' -or $_.FullName -match 'chat|Chat|overlay|Overlay|emote|Emote|twitch_chat'
    } |
    Select-Object `
      @{Name="fullName";Expression={$_.FullName}},
      @{Name="repoPath";Expression={$_.FullName.Replace((Get-Location).Path + "\", "")}},
      @{Name="length";Expression={$_.Length}},
      @{Name="lastWriteTime";Expression={$_.LastWriteTime.ToString("s")}}
} catch {
  $fileError = $_.Exception.Message
}

$routeSearch = @()
try {
  $routeSearch = Select-String `
    -Path backend\modules\*.js,backend\modules\helpers\*.js,htdocs\*.html,htdocs\overlays\*.html,htdocs\dashboard\modules\*.js,htdocs\dashboard\*.html,config\*.json,config\messages\*.json `
    -Pattern 'overlay/chat','twitch_chat_overlay','chat overlay','emote','Emote','/api/overlay/chat','start-chat','start-data' `
    -SimpleMatch |
    Select-Object `
      @{Name="path";Expression={$_.Path}},
      @{Name="repoPath";Expression={$_.Path.Replace((Get-Location).Path + "\", "")}},
      @{Name="lineNumber";Expression={$_.LineNumber}},
      @{Name="line";Expression={$_.Line.Trim()}}
} catch {
  $routeSearchError = $_.Exception.Message
}

$standardEndpoints = @("status","config","settings","routes","integration-check","reload")
$moduleDefs = @(
  @{ key="overlay-chat"; base="/api/overlay/chat" },
  @{ key="overlay-start-chat"; base="/api/overlay/start-chat" },
  @{ key="twitch-chat-overlay"; base="/api/twitch-chat-overlay" },
  @{ key="chat-overlay"; base="/api/chat-overlay" }
)

$moduleResults = @()
$summary = @()

foreach ($module in $moduleDefs) {
  $endpointResults = [ordered]@{}

  foreach ($endpoint in $standardEndpoints) {
    $method = "GET"
    if ($endpoint -eq "reload") { $method = "POST" }

    $url = "http://127.0.0.1:8080$($module.base)/$endpoint"
    $endpointResults[$endpoint] = Invoke-Endpoint -Url $url -Method $method
  }

  $okCount = 0
  foreach ($endpoint in $standardEndpoints) {
    if ($endpointResults[$endpoint].ok) {
      $okCount++
    }
  }

  $summary += [ordered]@{
    key = $module.key
    base = $module.base
    okCount = $okCount
    total = $standardEndpoints.Count
    complete = ($okCount -eq $standardEndpoints.Count)
    missing = @($standardEndpoints | Where-Object { -not $endpointResults[$_].ok })
  }

  $moduleResults += [ordered]@{
    key = $module.key
    base = $module.base
    endpoints = $endpointResults
  }
}

$targetedProbeDefs = @(
  @{ name="overlay chat status"; method="GET"; url="http://127.0.0.1:8080/api/overlay/chat/status"; expected404=$false; expected400=$false },
  @{ name="overlay chat debug"; method="GET"; url="http://127.0.0.1:8080/api/overlay/chat/debug"; expected404=$false; expected400=$false },
  @{ name="overlay chat clear"; method="GET"; url="http://127.0.0.1:8080/api/overlay/chat/clear"; expected404=$false; expected400=$false },
  @{ name="overlay start chat clear"; method="GET"; url="http://127.0.0.1:8080/api/overlay/start-chat/clear"; expected404=$false; expected400=$false },
  @{ name="overlay start data"; method="GET"; url="http://127.0.0.1:8080/api/overlay/start-data"; expected404=$false; expected400=$false },
  @{ name="twitch chat overlay alias status"; method="GET"; url="http://127.0.0.1:8080/api/twitch-chat-overlay/status"; expected404=$true; expected400=$false },
  @{ name="chat overlay alias status"; method="GET"; url="http://127.0.0.1:8080/api/chat-overlay/status"; expected404=$true; expected400=$false }
)

$targetedProbes = @()
foreach ($probe in $targetedProbeDefs) {
  $result = Invoke-Endpoint -Url $probe.url -Method $probe.method -Expected404 $probe.expected404 -Expected400 $probe.expected400
  $targetedProbes += [ordered]@{
    name = $probe.name
    method = $probe.method
    url = $probe.url
    ok = $result.ok
    http = $result.http
    expected404 = $probe.expected404
    expected400 = $probe.expected400
    error = $result.error
    response = $result.response
    responseBody = $result.responseBody
  }
}

$output = [ordered]@{
  createdAt = (Get-Date).ToString("s")
  purpose = "STEP201.12c Overlay-Chat-Datei-, Routen- und Standard-Endpunkt-Pruefung"
  repo = "D:\Git\stream-control-center"
  liveApiBase = "http://127.0.0.1:8080"
  logPath = $logPath
  git = [ordered]@{
    status = $gitStatus
    head = $gitHead
  }
  overlayChatFiles = [ordered]@{
    ok = [string]::IsNullOrWhiteSpace($fileError)
    error = $fileError
    count = @($overlayChatFiles).Count
    rows = @($overlayChatFiles)
  }
  routeSearch = [ordered]@{
    ok = [string]::IsNullOrWhiteSpace($routeSearchError)
    error = $routeSearchError
    count = @($routeSearch).Count
    rows = @($routeSearch)
  }
  apiMatrix = [ordered]@{
    endpoints = $standardEndpoints
    summary = $summary
    modules = $moduleResults
  }
  targetedProbes = $targetedProbes
}

$output | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $jsonPath

Write-Log "Git head:"
$gitHead.output | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "Git status:"
$gitStatus.output | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "Overlay chat files: $(@($overlayChatFiles).Count)"
($overlayChatFiles | Format-Table repoPath,length,lastWriteTime -AutoSize | Out-String) | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "Route search hits: $(@($routeSearch).Count)"
($routeSearch | Format-Table repoPath,lineNumber,line -AutoSize | Out-String) | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "API Summary:"
($summary | Format-Table key,base,okCount,total,complete,missing -AutoSize | Out-String) | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "Targeted probes:"
($targetedProbes | Select-Object name,method,url,ok,http,expected404,expected400,error | Format-Table -AutoSize | Out-String) | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "JSON written: $jsonPath"
Write-Log "LOG written: $logPath"

Get-Item $jsonPath | Select-Object FullName,Length,LastWriteTime
Get-Item $logPath | Select-Object FullName,Length,LastWriteTime
