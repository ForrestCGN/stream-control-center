$ErrorActionPreference = "Continue"

Set-Location "D:\Git\stream-control-center"

New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logPath = "D:\gpt\STEP201_5_VIP_ENDPOINT_TEST_$timestamp.log"
$jsonPath = "D:\gpt\STEP201_5_VIP_ENDPOINT_TEST_$timestamp.json"

function Write-Log {
  param(
    [string]$Text = ""
  )

  $Text | Tee-Object -FilePath $logPath -Append
}

function Invoke-VipEndpointTest {
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

Write-Log "STEP201.5 VIP Endpoint Test"
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
  @{ name="vip-sound routes"; url="http://127.0.0.1:8080/api/vip-sound/routes"; method="GET"; depth=20 },
  @{ name="vip-sound-overlay routes"; url="http://127.0.0.1:8080/api/vip-sound-overlay/routes"; method="GET"; depth=20 },
  @{ name="vip-sound integration-check"; url="http://127.0.0.1:8080/api/vip-sound/integration-check"; method="GET"; depth=30 },
  @{ name="vip-sound-overlay integration-check"; url="http://127.0.0.1:8080/api/vip-sound-overlay/integration-check"; method="GET"; depth=30 },
  @{ name="vip-sound reload"; url="http://127.0.0.1:8080/api/vip-sound/reload"; method="POST"; depth=20 },
  @{ name="vip-sound-overlay reload"; url="http://127.0.0.1:8080/api/vip-sound-overlay/reload"; method="POST"; depth=20 }
)

$results = @()

foreach ($test in $tests) {
  $results += Invoke-VipEndpointTest `
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

$output = [ordered]@{
  createdAt = (Get-Date).ToString("s")
  logPath = $logPath
  repo = "D:\Git\stream-control-center"
  liveApiBase = "http://127.0.0.1:8080"
  summary = $summary
  results = $results
}

$output | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $jsonPath

Write-Log ""
Write-Log "============================================================"
Write-Log "SUMMARY"
Write-Log "============================================================"
$summary | Format-Table -AutoSize | Out-String | ForEach-Object { Write-Log $_ }

Write-Log "Log file: $logPath"
Write-Log "JSON file: $jsonPath"

Write-Host ""
Write-Host "Fertig."
Write-Host "Log:  $logPath"
Write-Host "JSON: $jsonPath"
