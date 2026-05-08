$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$jsonPath = "D:\gpt\last_api.json"
$logPath = "D:\gpt\STEP201_10_INFRA_OBS_SCENE_CHECK_$timestamp.log"

function Write-Log {
  param([string]$Text = "")
  $Text | Tee-Object -FilePath $logPath -Append
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

Write-Log "STEP201.10 Infrastruktur-Analyse: OBS + Scene-Control"
Write-Log "CreatedAt: $(Get-Date -Format s)"
Write-Log "Repo: D:\Git\stream-control-center"
Write-Log "Output JSON: $jsonPath"
Write-Log "Log: $logPath"
Write-Log ""

$gitStatus = Capture { git status --short }
$gitHead = Capture { git log -1 --oneline }

$fileError = ""
$routeSearchError = ""

$infraFiles = @()
try {
  $infraFiles = Get-ChildItem -Recurse backend,htdocs,config,docs,project-state -File -ErrorAction SilentlyContinue |
    Where-Object {
      $_.Name -match 'obs|OBS|scene|Scene|streamdesk|StreamDesk' -or $_.FullName -match 'obs|OBS|scene|Scene|streamdesk|StreamDesk'
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
    -Path backend\modules\*.js,backend\modules\helpers\*.js,htdocs\dashboard\modules\*.js,htdocs\dashboard\*.html,config\*.json `
    -Pattern 'obs','OBS','scene-control','scene_control','/api/obs','/obs/','/api/scene','/api/scenes','streamdesk','stream-desk','scene_aliases' `
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
  @{ key="obs"; base="/api/obs" },
  @{ key="obs-legacy"; base="/obs" },
  @{ key="scene-control"; base="/api/scene-control" },
  @{ key="scene_control"; base="/api/scene_control" },
  @{ key="scenes"; base="/api/scenes" },
  @{ key="scene"; base="/api/scene" },
  @{ key="streamdesk"; base="/api/streamdesk" },
  @{ key="stream-desk"; base="/api/stream-desk" }
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
  # OBS likely endpoints
  @{ name="obs status"; method="GET"; url="http://127.0.0.1:8080/api/obs/status" },
  @{ name="obs scenes"; method="GET"; url="http://127.0.0.1:8080/api/obs/scenes" },
  @{ name="obs sources"; method="GET"; url="http://127.0.0.1:8080/api/obs/sources" },
  @{ name="obs current scene"; method="GET"; url="http://127.0.0.1:8080/api/obs/current-scene" },
  @{ name="obs connection"; method="GET"; url="http://127.0.0.1:8080/api/obs/connection" },
  @{ name="obs legacy status"; method="GET"; url="http://127.0.0.1:8080/obs/status" },

  # Scene control likely endpoints
  @{ name="scene control status"; method="GET"; url="http://127.0.0.1:8080/api/scene-control/status" },
  @{ name="scene control routes"; method="GET"; url="http://127.0.0.1:8080/api/scene-control/routes" },
  @{ name="scene aliases"; method="GET"; url="http://127.0.0.1:8080/api/scene-control/aliases" },
  @{ name="scene list"; method="GET"; url="http://127.0.0.1:8080/api/scenes" },
  @{ name="streamdesk status"; method="GET"; url="http://127.0.0.1:8080/api/streamdesk/status" }
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
  purpose = "STEP201.10 OBS/Scene-Control Infrastruktur-Pruefung"
  repo = "D:\Git\stream-control-center"
  liveApiBase = "http://127.0.0.1:8080"
  logPath = $logPath
  git = [ordered]@{
    status = $gitStatus
    head = $gitHead
  }
  infraFiles = [ordered]@{
    ok = [string]::IsNullOrWhiteSpace($fileError)
    error = $fileError
    count = @($infraFiles).Count
    rows = @($infraFiles)
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
Write-Log "Infra files: $(@($infraFiles).Count)"
$infraFiles | Format-Table repoPath,length,lastWriteTime -AutoSize | Out-String | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "Route search hits: $(@($routeSearch).Count)"
$routeSearch | Format-Table repoPath,lineNumber,line -AutoSize | Out-String | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "API Summary:"
$summary | Format-Table key,base,okCount,total,complete,missing -AutoSize | Out-String | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "Targeted probes:"
$targetedProbes | Select-Object name,method,url,ok,http,error | Format-Table -AutoSize | Out-String | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "JSON written: $jsonPath"
Write-Log "LOG written: $logPath"

Get-Item $jsonPath | Select-Object FullName,Length,LastWriteTime
Get-Item $logPath | Select-Object FullName,Length,LastWriteTime
