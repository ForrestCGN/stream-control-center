$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$jsonPath = "D:\gpt\last_api.json"
$logPath = "D:\gpt\STEP201_12_TWITCH_PRESENCE_CHECK_$timestamp.log"

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
    [string]$Method = "GET"
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

    return [ordered]@{
      ok = $false
      http = $statusCode
      method = $Method
      url = $Url
      error = $_.Exception.Message
      responseBody = $body
    }
  }
}

Write-Log "STEP201.12 Twitch / Twitch-Presence Datei-, Routen- und API-Pruefung"
Write-Log "CreatedAt: $(Get-Date -Format s)"
Write-Log "Repo: D:\Git\stream-control-center"
Write-Log "Output JSON: $jsonPath"
Write-Log "Log: $logPath"
Write-Log ""

$gitStatus = Capture { git status --short }
$gitHead = Capture { git log -1 --oneline }

$fileError = ""
$routeSearchError = ""

$twitchFiles = @()
try {
  $twitchFiles = Get-ChildItem -Recurse backend,htdocs,config,docs,project-state -File -ErrorAction SilentlyContinue |
    Where-Object {
      $_.Name -match 'twitch|Twitch|presence|Presence|eventsub|EventSub|chat|Chat' -or $_.FullName -match 'twitch|Twitch|presence|Presence|eventsub|EventSub|chat|Chat'
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
    -Path backend\modules\*.js,backend\modules\helpers\*.js,htdocs\dashboard\modules\*.js,htdocs\dashboard\*.html,config\*.json,config\messages\*.json `
    -Pattern 'twitch','Twitch','/api/twitch','/twitch','presence','Presence','eventsub','EventSub','overlay/chat','chat-overlay','twitch_presence' `
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
  @{ key="twitch"; base="/api/twitch" },
  @{ key="twitch-legacy"; base="/twitch" },
  @{ key="twitch-presence"; base="/api/twitch/presence" },
  @{ key="twitch-presence-legacy"; base="/twitch/presence" },
  @{ key="overlay-chat"; base="/api/overlay/chat" }
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

$targetedProbeUrls = @(
  @{ name="twitch api status"; method="GET"; url="http://127.0.0.1:8080/api/twitch/status" },
  @{ name="twitch api stream"; method="GET"; url="http://127.0.0.1:8080/api/twitch/stream?login=forrestcgn" },
  @{ name="twitch api channel summary"; method="GET"; url="http://127.0.0.1:8080/api/twitch/channel/summary?id=127709954" },
  @{ name="twitch api presence status"; method="GET"; url="http://127.0.0.1:8080/api/twitch/presence/status" },
  @{ name="twitch legacy presence status"; method="GET"; url="http://127.0.0.1:8080/twitch/presence/status" },
  @{ name="overlay chat status"; method="GET"; url="http://127.0.0.1:8080/api/overlay/chat/status" },
  @{ name="overlay chat debug"; method="GET"; url="http://127.0.0.1:8080/api/overlay/chat/debug" },
  @{ name="overlay start data"; method="GET"; url="http://127.0.0.1:8080/api/overlay/start-data" }
)

$targetedProbes = @()
foreach ($probe in $targetedProbeUrls) {
  $result = Invoke-Endpoint -Url $probe.url -Method $probe.method
  $targetedProbes += [ordered]@{
    name = $probe.name
    method = $probe.method
    url = $probe.url
    ok = $result.ok
    http = $result.http
    error = $result.error
    response = $result.response
    responseBody = $result.responseBody
  }
}

$output = [ordered]@{
  createdAt = (Get-Date).ToString("s")
  purpose = "STEP201.12 Twitch/Twitch-Presence-Datei-, Routen- und Standard-Endpunkt-Pruefung"
  repo = "D:\Git\stream-control-center"
  liveApiBase = "http://127.0.0.1:8080"
  logPath = $logPath
  git = [ordered]@{
    status = $gitStatus
    head = $gitHead
  }
  twitchFiles = [ordered]@{
    ok = [string]::IsNullOrWhiteSpace($fileError)
    error = $fileError
    count = @($twitchFiles).Count
    rows = @($twitchFiles)
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
Write-Log "Twitch/PRESENCE files: $(@($twitchFiles).Count)"
($twitchFiles | Format-Table repoPath,length,lastWriteTime -AutoSize | Out-String) | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "Route search hits: $(@($routeSearch).Count)"
($routeSearch | Format-Table repoPath,lineNumber,line -AutoSize | Out-String) | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "API Summary:"
($summary | Format-Table key,base,okCount,total,complete,missing -AutoSize | Out-String) | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "Targeted probes:"
($targetedProbes | Select-Object name,method,url,ok,http,error | Format-Table -AutoSize | Out-String) | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "JSON written: $jsonPath"
Write-Log "LOG written: $logPath"

Get-Item $jsonPath | Select-Object FullName,Length,LastWriteTime
Get-Item $logPath | Select-Object FullName,Length,LastWriteTime
