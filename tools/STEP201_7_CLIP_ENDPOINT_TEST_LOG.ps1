$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$jsonPath = "D:\gpt\last_api.json"
$logPath = "D:\gpt\STEP201_7_CLIP_ENDPOINT_TEST_$timestamp.log"

function Write-Log {
  param([string]$Text = "")
  $Text | Tee-Object -FilePath $logPath -Append
}

function Invoke-Endpoint {
  param(
    [string]$Name,
    [string]$Url,
    [string]$Method = "GET",
    [int]$Depth = 40
  )

  Write-Log ""
  Write-Log "TEST: $Name"
  Write-Log "$Method $Url"

  try {
    if ($Method -eq "POST") {
      $response = Invoke-RestMethod $Url -Method POST -TimeoutSec 15
    } else {
      $response = Invoke-RestMethod $Url -Method GET -TimeoutSec 15
    }

    Write-Log "RESULT: OK"
    Write-Log ($response | ConvertTo-Json -Depth $Depth)

    return [ordered]@{
      name = $Name
      method = $Method
      url = $Url
      ok = $true
      http = 200
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

    Write-Log "RESULT: ERROR"
    Write-Log "HTTP: $statusCode"
    Write-Log "ERROR: $($_.Exception.Message)"
    if ($body) { Write-Log $body }

    return [ordered]@{
      name = $Name
      method = $Method
      url = $Url
      ok = $false
      http = $statusCode
      error = $_.Exception.Message
      responseBody = $body
    }
  }
}

Write-Log "STEP201.7 Clip Endpoint Test"
Write-Log "CreatedAt: $(Get-Date -Format s)"
Write-Log "Repo: D:\Git\stream-control-center"
Write-Log "LiveApiBase: http://127.0.0.1:8080"

$tests = @(
  @{ name="clip status"; url="http://127.0.0.1:8080/api/clip/status"; method="GET"; depth=35 },
  @{ name="clip config"; url="http://127.0.0.1:8080/api/clip/config"; method="GET"; depth=35 },
  @{ name="clip settings"; url="http://127.0.0.1:8080/api/clip/settings"; method="GET"; depth=35 },
  @{ name="clip routes"; url="http://127.0.0.1:8080/api/clip/routes"; method="GET"; depth=35 },
  @{ name="clip integration-check"; url="http://127.0.0.1:8080/api/clip/integration-check"; method="GET"; depth=45 },
  @{ name="clip reload"; url="http://127.0.0.1:8080/api/clip/reload"; method="POST"; depth=35 },
  @{ name="clips alias status"; url="http://127.0.0.1:8080/api/clips/status"; method="GET"; depth=10 }
)

$results = @()
foreach ($test in $tests) {
  $results += Invoke-Endpoint -Name $test.name -Url $test.url -Method $test.method -Depth $test.depth
}

$standard = @("status","config","settings","routes","integration-check","reload")
$clipResults = @($results | Where-Object { $_.url -like "*/api/clip/*" })
$okCount = @($clipResults | Where-Object { $_.ok }).Count

$matrixSummary = @(
  [ordered]@{
    key = "clip"
    base = "/api/clip"
    okCount = $okCount
    total = $standard.Count
    complete = ($okCount -eq $standard.Count)
    missing = @($clipResults | Where-Object { -not $_.ok } | ForEach-Object { ($_.url -split '/')[-1] })
  },
  [ordered]@{
    key = "clips"
    base = "/api/clips"
    intentionallyNotRegistered = $true
    status = if (($results | Where-Object { $_.name -eq "clips alias status" }).http -eq 404) { "expected_404" } else { "unexpected" }
  }
)

$output = [ordered]@{
  createdAt = (Get-Date).ToString("s")
  purpose = "STEP201.7 Clip Endpoint Test"
  repo = "D:\Git\stream-control-center"
  liveApiBase = "http://127.0.0.1:8080"
  logPath = $logPath
  apiMatrix = [ordered]@{
    endpoints = $standard
    summary = $matrixSummary
  }
  summary = @($results | ForEach-Object {
    [ordered]@{
      name = $_.name
      method = $_.method
      url = $_.url
      ok = $_.ok
      http = $_.http
      error = $_.error
    }
  })
  results = $results
}

$output | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $jsonPath

Write-Log ""
Write-Log "API Summary:"
$matrixSummary | Format-Table -AutoSize | Out-String | ForEach-Object { Write-Log $_ }
Write-Log "JSON written: $jsonPath"
Write-Log "LOG written: $logPath"

Get-Item $jsonPath | Select-Object FullName,Length,LastWriteTime
Get-Item $logPath | Select-Object FullName,Length,LastWriteTime
