$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$jsonPath = "D:\gpt\last_api.json"
$logPath = "D:\gpt\STEP201_8_2_DEATHCOUNTER_STATUS_500_DEBUG_$timestamp.log"

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

function Invoke-RawEndpoint {
  param(
    [string]$Name,
    [string]$Url,
    [string]$Method = "GET"
  )

  try {
    $response = Invoke-WebRequest -Uri $Url -Method $Method -TimeoutSec 10 -UseBasicParsing

    return [ordered]@{
      name = $Name
      method = $Method
      url = $Url
      ok = $true
      statusCode = [int]$response.StatusCode
      statusDescription = $response.StatusDescription
      contentType = $response.Headers["Content-Type"]
      content = $response.Content
    }
  } catch {
    $statusCode = $null
    $statusDescription = ""
    $content = ""
    $headers = @{}

    try {
      if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        $statusDescription = $_.Exception.Response.StatusDescription
        $headers = $_.Exception.Response.Headers
        $stream = $_.Exception.Response.GetResponseStream()
        if ($stream) {
          $reader = New-Object System.IO.StreamReader($stream)
          $content = $reader.ReadToEnd()
        }
      }
    } catch {}

    return [ordered]@{
      name = $Name
      method = $Method
      url = $Url
      ok = $false
      statusCode = $statusCode
      statusDescription = $statusDescription
      contentType = $(try { $headers["Content-Type"] } catch { "" })
      error = $_.Exception.Message
      content = $content
    }
  }
}

function Get-CodeSnippet {
  param(
    [string]$Path,
    [string]$Pattern,
    [int]$Before = 8,
    [int]$After = 18
  )

  if (-not (Test-Path $Path)) {
    return [ordered]@{
      path = $Path
      exists = $false
      pattern = $Pattern
      matches = @()
    }
  }

  $lines = Get-Content -Path $Path -Encoding UTF8
  $matches = @()

  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -like "*$Pattern*") {
      $start = [Math]::Max(0, $i - $Before)
      $end = [Math]::Min($lines.Count - 1, $i + $After)
      $snippet = @()

      for ($j = $start; $j -le $end; $j++) {
        $snippet += [ordered]@{
          lineNumber = $j + 1
          line = $lines[$j]
        }
      }

      $matches += [ordered]@{
        matchLine = $i + 1
        snippet = $snippet
      }
    }
  }

  return [ordered]@{
    path = $Path
    exists = $true
    pattern = $Pattern
    matches = $matches
  }
}

$repoFile = "D:\Git\stream-control-center\backend\modules\deathcounter_v2.js"
$liveFile = "D:\Streaming\stramAssets\backend\modules\deathcounter_v2.js"

$endpoints = @(
  @{ name="status"; url="http://127.0.0.1:8080/api/deathcounter/v2/status"; method="GET" },
  @{ name="config"; url="http://127.0.0.1:8080/api/deathcounter/v2/config"; method="GET" },
  @{ name="state"; url="http://127.0.0.1:8080/api/deathcounter/v2/state"; method="GET" }
)

$endpointResults = @()
foreach ($ep in $endpoints) {
  $endpointResults += Invoke-RawEndpoint -Name $ep.name -Url $ep.url -Method $ep.method
}

$patterns = @(
  "app.get('/api/deathcounter/v2/status'",
  'getProjectRootSafe',
  'config.getProjectRoot',
  'buildDeathcounterStatus',
  'function buildDeathcounterStatus',
  'settingsFromDbPrepared',
  'schemaVersion'
)

$repoSnippets = @()
$liveSnippets = @()
foreach ($pattern in $patterns) {
  $repoSnippets += Get-CodeSnippet -Path $repoFile -Pattern $pattern
  $liveSnippets += Get-CodeSnippet -Path $liveFile -Pattern $pattern
}

$nodeVersion = Capture { node -v }
$repoSyntax = Capture { node -c $repoFile }
$liveSyntax = Capture { node -c $liveFile }
$gitHead = Capture { git log -1 --oneline }
$gitStatus = Capture { git status --short }

$logCandidates = @(
  "D:\Streaming\stramAssets\data\logs",
  "D:\Streaming\stramAssets\logs",
  "D:\Git\stream-control-center\data\logs"
)

$recentLogFiles = @()
foreach ($dir in $logCandidates) {
  if (Test-Path $dir) {
    $recentLogFiles += Get-ChildItem -Path $dir -File -ErrorAction SilentlyContinue |
      Sort-Object LastWriteTime -Descending |
      Select-Object -First 10 `
        @{Name="path";Expression={$_.FullName}},
        @{Name="length";Expression={$_.Length}},
        @{Name="lastWriteTime";Expression={$_.LastWriteTime.ToString("s")}}
  }
}

$recentLogTails = @()
foreach ($file in @($recentLogFiles | Select-Object -First 5)) {
  try {
    $tail = Get-Content -Path $file.path -Tail 120 -Encoding UTF8 -ErrorAction Stop
    $recentLogTails += [ordered]@{
      path = $file.path
      tail = @($tail)
    }
  } catch {
    $recentLogTails += [ordered]@{
      path = $file.path
      error = $_.Exception.Message
      tail = @()
    }
  }
}

$output = [ordered]@{
  createdAt = (Get-Date).ToString("s")
  purpose = "STEP201.8.2 Deathcounter Status 500 Debug"
  repo = "D:\Git\stream-control-center"
  live = "D:\Streaming\stramAssets"
  logPath = $logPath
  git = [ordered]@{
    head = $gitHead
    status = $gitStatus
  }
  node = [ordered]@{
    version = $nodeVersion
    repoSyntax = $repoSyntax
    liveSyntax = $liveSyntax
  }
  endpoints = $endpointResults
  files = [ordered]@{
    repoFile = [ordered]@{
      path = $repoFile
      exists = Test-Path $repoFile
      length = $(if (Test-Path $repoFile) { (Get-Item $repoFile).Length } else { $null })
      lastWriteTime = $(if (Test-Path $repoFile) { (Get-Item $repoFile).LastWriteTime.ToString("s") } else { $null })
      snippets = $repoSnippets
    }
    liveFile = [ordered]@{
      path = $liveFile
      exists = Test-Path $liveFile
      length = $(if (Test-Path $liveFile) { (Get-Item $liveFile).Length } else { $null })
      lastWriteTime = $(if (Test-Path $liveFile) { (Get-Item $liveFile).LastWriteTime.ToString("s") } else { $null })
      snippets = $liveSnippets
    }
  }
  recentLogFiles = $recentLogFiles
  recentLogTails = $recentLogTails
}

$output | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $jsonPath

Write-Log "STEP201.8.2 Deathcounter Status 500 Debug"
Write-Log "CreatedAt: $(Get-Date -Format s)"
Write-Log ""
Write-Log "Git head:"
$gitHead.output | ForEach-Object { Write-Log $_ }
Write-Log ""
Write-Log "Git status:"
$gitStatus.output | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "Endpoint results:"
$endpointResults | Select-Object name,method,url,ok,statusCode,error,content | Format-List | Out-String | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "Repo syntax:"
$repoSyntax.output | ForEach-Object { Write-Log $_ }
Write-Log $repoSyntax.error

Write-Log ""
Write-Log "Live syntax:"
$liveSyntax.output | ForEach-Object { Write-Log $_ }
Write-Log $liveSyntax.error

Write-Log ""
Write-Log "Recent log files:"
$recentLogFiles | Format-Table path,length,lastWriteTime -AutoSize | Out-String | ForEach-Object { Write-Log $_ }

Write-Log ""
Write-Log "JSON written: $jsonPath"
Write-Log "LOG written: $logPath"

Get-Item $jsonPath | Select-Object FullName,Length,LastWriteTime
Get-Item $logPath | Select-Object FullName,Length,LastWriteTime
