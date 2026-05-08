$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logPath = "D:\gpt\STEP201_6_CHALLENGE_ENDPOINT_TEST_$timestamp.log"
$jsonPath = "D:\gpt\last_api.json"

function Write-Log {
  param([string]$Text = "")
  $Text | Tee-Object -FilePath $logPath -Append | Out-Null
}

function Invoke-ChallengeEndpointTest {
  param(
    [string]$Name,
    [string]$Url,
    [string]$Method = "GET",
    [int]$Depth = 30
  )

  Write-Log ""
  Write-Log "============================================================"
  Write-Log "TEST: $Name"
  Write-Log "METHOD: $Method"
  Write-Log "URL: $Url"
  Write-Log "TIME: $(Get-Date -Format s)"
  Write-Log "============================================================"

  try {
    if ($Method -eq "POST") {
      $response = Invoke-RestMethod $Url -Method POST -TimeoutSec 10
    } else {
      $response = Invoke-RestMethod $Url -Method GET -TimeoutSec 10
    }

    $json = $response | ConvertTo-Json -Depth $Depth
    Write-Log "RESULT: OK"
    Write-Log ""
    Write-Log $json

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
    if ($body) {
      Write-Log ""
      Write-Log "RESPONSE BODY:"
      Write-Log $body
    }

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

Write-Log "STEP201.6 Challenge Endpoint Test"
Write-Log "CreatedAt: $(Get-Date -Format s)"
Write-Log "Repo: D:\Git\stream-control-center"
Write-Log "LiveApiBase: http://127.0.0.1:8080"
Write-Log ""

Write-Log "Git status:"
@(git status --short 2>&1) | ForEach-Object { Write-Log $_.ToString() }

Write-Log ""
Write-Log "Git head:"
@(git log -1 --oneline 2>&1) | ForEach-Object { Write-Log $_.ToString() }

$tests = @(
  @{ name="challenge status"; url="http://127.0.0.1:8080/api/challenge/status"; method="GET"; depth=30 },
  @{ name="challenge config"; url="http://127.0.0.1:8080/api/challenge/config"; method="GET"; depth=30 },
  @{ name="challenge settings"; url="http://127.0.0.1:8080/api/challenge/settings"; method="GET"; depth=30 },
  @{ name="challenge routes"; url="http://127.0.0.1:8080/api/challenge/routes"; method="GET"; depth=30 },
  @{ name="challenge integration-check"; url="http://127.0.0.1:8080/api/challenge/integration-check"; method="GET"; depth=40 },
  @{ name="challenge reload"; url="http://127.0.0.1:8080/api/challenge/reload"; method="POST"; depth=30 }
)

$results = @()
foreach ($test in $tests) {
  $results += Invoke-ChallengeEndpointTest `
    -Name $test.name `
    -Url $test.url `
    -Method $test.method `
    -Depth $test.depth
}

$summary = @()
foreach ($result in $results) {
  $summary += [ordered]@{
    name = $result.name
    method = $result.method
    url = $result.url
    ok = $result.ok
    http = $result.http
    error = $result.error
  }
}

$okCount = @($summary | Where-Object { $_.ok }).Count
$output = [ordered]@{
  createdAt = (Get-Date).ToString("s")
  purpose = "STEP201.6 Challenge Endpoint Test"
  logPath = $logPath
  repo = "D:\Git\stream-control-center"
  liveApiBase = "http://127.0.0.1:8080"
  apiMatrix = [ordered]@{
    endpoints = @("status", "config", "settings", "routes", "integration-check", "reload")
    summary = @([ordered]@{
      key = "challenge"
      base = "/api/challenge"
      okCount = $okCount
      total = $tests.Count
      complete = ($okCount -eq $tests.Count)
      missing = @($summary | Where-Object { -not $_.ok } | ForEach-Object { ($_.name -replace '^challenge ', '') })
    })
  }
  summary = $summary
  results = $results
}

$output | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $jsonPath

Write-Log ""
Write-Log "============================================================"
Write-Log "SUMMARY"
Write-Log "============================================================"
$summary | Format-Table -AutoSize | Out-String | ForEach-Object { Write-Log $_ }
Write-Log "OK count: $okCount / $($tests.Count)"
Write-Log "Log file: $logPath"
Write-Log "JSON file: $jsonPath"

Write-Host ""
Write-Host "Fertig."
Write-Host "Log:  $logPath"
Write-Host "JSON: $jsonPath"
