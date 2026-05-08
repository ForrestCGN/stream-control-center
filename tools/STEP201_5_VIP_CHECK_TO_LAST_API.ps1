$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$timestamp = (Get-Date).ToString("s")

function Invoke-CommandCapture {
  param(
    [ScriptBlock]$Command
  )

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

$gitStatus = Invoke-CommandCapture { git status --short }
$gitHead = Invoke-CommandCapture { git log -1 --oneline }

$vipFilesError = ""
$routeSearchError = ""

$vipFiles = @()
try {
  $vipFiles = Get-ChildItem -Recurse backend,htdocs,config,docs,project-state -File |
    Where-Object {
      $_.Name -match 'vip|VIP' -or $_.FullName -match 'vip|VIP'
    } |
    Select-Object `
      @{Name="fullName";Expression={$_.FullName}},
      @{Name="repoPath";Expression={$_.FullName.Replace((Get-Location).Path + "\", "")}},
      @{Name="length";Expression={$_.Length}},
      @{Name="lastWriteTime";Expression={$_.LastWriteTime.ToString("s")}}
} catch {
  $vipFilesError = $_.Exception.Message
}

$routeSearch = @()
try {
  $routeSearch = Select-String `
    -Path backend\modules\*.js,backend\modules\helpers\*.js,htdocs\dashboard\modules\*.js,htdocs\dashboard\*.html,config\*.json `
    -Pattern 'vip-sound-overlay','vip-sound','/api/vip','vip_sound_overlay','vip_sound' `
    -SimpleMatch |
    Select-Object `
      @{Name="path";Expression={$_.Path}},
      @{Name="repoPath";Expression={$_.Path.Replace((Get-Location).Path + "\", "")}},
      @{Name="lineNumber";Expression={$_.LineNumber}},
      @{Name="line";Expression={$_.Line.Trim()}}
} catch {
  $routeSearchError = $_.Exception.Message
}

$standardModules = @(
  @{ key="vip"; base="/api/vip" },
  @{ key="vip-sound-overlay"; base="/api/vip-sound-overlay" },
  @{ key="vip-sound"; base="/api/vip-sound" }
)

$standardEndpoints = @("status","config","settings","routes","integration-check","reload")

function Invoke-Endpoint {
  param(
    [string]$Url,
    [string]$Method = "GET"
  )

  try {
    if ($Method -eq "POST") {
      $response = Invoke-RestMethod $Url -Method POST -TimeoutSec 8
    } else {
      $response = Invoke-RestMethod $Url -Method GET -TimeoutSec 8
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

$endpointResults = @()

foreach ($module in $standardModules) {
  $entry = [ordered]@{
    key = $module.key
    base = $module.base
    endpoints = [ordered]@{}
  }

  foreach ($endpoint in $standardEndpoints) {
    $method = "GET"
    if ($endpoint -eq "reload") { $method = "POST" }

    $url = "http://127.0.0.1:8080$($module.base)/$endpoint"
    $entry.endpoints[$endpoint] = Invoke-Endpoint -Url $url -Method $method
  }

  $endpointResults += $entry
}

$endpointSummary = @()

foreach ($result in $endpointResults) {
  $okCount = 0

  foreach ($endpoint in $standardEndpoints) {
    if ($result.endpoints[$endpoint].ok) {
      $okCount++
    }
  }

  $endpointSummary += [ordered]@{
    key = $result.key
    base = $result.base
    okCount = $okCount
    total = $standardEndpoints.Count
    complete = ($okCount -eq $standardEndpoints.Count)
    missing = @($standardEndpoints | Where-Object { -not $result.endpoints[$_].ok })
  }
}

$output = [ordered]@{
  createdAt = $timestamp
  purpose = "STEP201.5 VIP-Datei-, Routen- und Standard-Endpunkt-Pruefung"
  repo = "D:\Git\stream-control-center"
  liveApiBase = "http://127.0.0.1:8080"
  git = [ordered]@{
    status = $gitStatus
    head = $gitHead
  }
  vipFiles = [ordered]@{
    ok = [string]::IsNullOrWhiteSpace($vipFilesError)
    error = $vipFilesError
    count = @($vipFiles).Count
    rows = @($vipFiles)
  }
  routeSearch = [ordered]@{
    ok = [string]::IsNullOrWhiteSpace($routeSearchError)
    error = $routeSearchError
    count = @($routeSearch).Count
    rows = @($routeSearch)
  }
  apiMatrix = [ordered]@{
    endpoints = $standardEndpoints
    summary = $endpointSummary
    modules = $endpointResults
  }
}

$output | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 "D:\gpt\last_api.json"

Get-Item "D:\gpt\last_api.json" |
  Select-Object FullName, Length, LastWriteTime
