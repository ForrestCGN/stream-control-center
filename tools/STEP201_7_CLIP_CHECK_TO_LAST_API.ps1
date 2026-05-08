$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$jsonPath = "D:\gpt\last_api.json"
$logPath = "D:\gpt\STEP201_7_CLIP_CHECK_$timestamp.log"

function Write-Log {
  param([string]$Text = "")
  $Text | Tee-Object -FilePath $logPath -Append
}

function Invoke-CommandCapture {
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

Write-Log "STEP201.7 Clip Datei-, Routen- und API-Pruefung"
Write-Log "CreatedAt: $(Get-Date -Format s)"
Write-Log "Repo: D:\Git\stream-control-center"
Write-Log "Output JSON: $jsonPath"
Write-Log "Log: $logPath"
Write-Log ""

$gitStatus = Invoke-CommandCapture { git status --short }
$gitHead = Invoke-CommandCapture { git log -1 --oneline }

$clipFilesError = ""
$routeSearchError = ""

$clipFiles = @()
try {
  $clipFiles = Get-ChildItem -Recurse backend,htdocs,config,docs,project-state -File |
    Where-Object {
      $_.Name -match 'clip|Clip|clips|Clips' -or $_.FullName -match 'clip|Clip|clips|Clips'
    } |
    Select-Object `
      @{Name="fullName";Expression={$_.FullName}},
      @{Name="repoPath";Expression={$_.FullName.Replace((Get-Location).Path + "\", "")}},
      @{Name="length";Expression={$_.Length}},
      @{Name="lastWriteTime";Expression={$_.LastWriteTime.ToString("s")}}
} catch {
  $clipFilesError = $_.Exception.Message
}

$routeSearch = @()
try {
  $routeSearch = Select-String `
    -Path backend\modules\*.js,backend\modules\helpers\*.js,htdocs\dashboard\modules\*.js,htdocs\dashboard\*.html,config\*.json,config\messages\*.json `
    -Pattern 'clip','clips','/api/clip','/api/clips','clip_system' `
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
  @{ key="clip"; base="/api/clip" },
  @{ key="clips"; base="/api/clips" }
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

$output = [ordered]@{
  createdAt = (Get-Date).ToString("s")
  purpose = "STEP201.7 Clip-Datei-, Routen- und Standard-Endpunkt-Pruefung"
  repo = "D:\Git\stream-control-center"
  liveApiBase = "http://127.0.0.1:8080"
  logPath = $logPath
  git = [ordered]@{
    status = $gitStatus
    head = $gitHead
  }
  clipFiles = [ordered]@{
    ok = [string]::IsNullOrWhiteSpace($clipFilesError)
    error = $clipFilesError
    count = @($clipFiles).Count
    rows = @($clipFiles)
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
}

$output | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $jsonPath

Write-Log "Git head:"
$gitHead.output | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "Git status:"
$gitStatus.output | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "Clip files: $(@($clipFiles).Count)"
$clipFiles | Format-Table repoPath,length,lastWriteTime -AutoSize | Out-String | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "Route search hits: $(@($routeSearch).Count)"
$routeSearch | Format-Table repoPath,lineNumber,line -AutoSize | Out-String | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "API Summary:"
$summary | Format-Table key,base,okCount,total,complete,missing -AutoSize | Out-String | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "JSON written: $jsonPath"
Write-Log "LOG written: $logPath"

Get-Item $jsonPath | Select-Object FullName,Length,LastWriteTime
Get-Item $logPath | Select-Object FullName,Length,LastWriteTime
